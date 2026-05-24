import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';
import { buildRestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantFirstRunControlTower } from '@/lib/restaurant-first-run-control-tower';
import { buildRestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import { buildRestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt, type RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';
import {
  buildRestaurantStoreManagerTaskQueue,
  clearRestaurantStoreManagerTasksForTest,
  recordRestaurantStoreManagerTasks,
  updateRestaurantStoreManagerTaskStatus,
} from '@/lib/restaurant-store-manager-task-store';
import { clearRestaurantProviderSetupStateForTest } from '@/lib/restaurant-provider-setup-state-store';

describe('restaurant first run control tower', () => {
  beforeEach(() => {
    clearRestaurantProviderSetupStateForTest();
    clearRestaurantStoreManagerTasksForTest();
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
  });

  it('shows setup and manual fallback when there is no provider-ready candidate', () => {
    const tower = buildRestaurantFirstRunControlTower({
      queue: buildRestaurantStoreManagerTaskQueue(new Date('2026-05-24T11:00:00.000Z')),
      runs: [],
      receipts: [],
      readiness: buildRestaurantExternalReadiness({}),
      now: new Date('2026-05-24T11:01:00.000Z'),
    });

    expect(tower.payloadShape).toBe('restaurant-first-run-control-tower-v1');
    expect(tower.verdict).toBe('manual-fallback');
    expect(tower.summary.canForwardFirstRun).toBe(false);
    expect(tower.summary.canClaimAutomation).toBe(false);
    expect(tower.lanes.find(item => item.id === 'candidate')?.status).toBe('blocked');
    expect(tower.lanes.find(item => item.id === 'claim')?.status).toBe('blocked');
    expect(tower.safetyBoundary).toContain('does not log in');
  });

  it('connects a forwardable task, forwarded run and waiting receipt into one tower', async () => {
    const records = recordRestaurantStoreManagerTasks([{
      id: 'tower-ready-task',
      owner: 'runtime-admin',
      priority: 'today',
      restaurant: 'Sandbox Bistro',
      offer: 'Dinner set',
      signal: 'publish-proof',
      action: 'Capture the public proof for the dinner set campaign.',
      talkTrack: 'Use one controlled provider run.',
      evidenceRequired: 'public proof link or signed callback',
      dueWindow: 'today',
      stopLine: 'No private messages, raw POS rows or customer PII.',
    }], new Date('2026-05-24T11:10:00.000Z'));
    updateRestaurantStoreManagerTaskStatus({
      taskMemoryId: records[0].taskMemoryId,
      status: 'ready-for-provider',
      now: new Date('2026-05-24T11:11:00.000Z'),
    });
    const env = {
      RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL: 'https://openclaw.example/runtime',
      RESTAURANT_AGENT_OPENCLAW_API_KEY: 'openclaw-secret-value',
      RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret-value',
      RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'browser-profile-secret',
      RESTAURANT_AGENT_OPERATOR_APPROVAL: 'approved',
      RESTAURANT_AGENT_GRANT_EXPIRES_AT: '2026-06-24T11:00:00.000Z',
      RESTAURANT_DIANPING_AUTH_STATUS: 'authorized',
      RESTAURANT_POS_DATA_MODE: 'csv',
      RESTAURANT_POS_FIELD_DICTIONARY: 'configured',
    };
    const fetcher = (async () => Response.json({ ok: true })) as typeof fetch;
    const runtimeProbe = await buildRestaurantRuntimeProbe({
      env,
      fetcher,
      now: new Date('2026-05-24T11:12:00.000Z'),
    });
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      env,
      fetcher,
      now: new Date('2026-05-24T11:13:00.000Z'),
    });
    const dispatch = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'Sandbox Bistro',
      offer: 'Dinner set',
      owner: 'runtime-admin',
    });
    const run = recordRestaurantAgentRun(dispatch, 'openclaw', {
      ok: true,
      target: 'openclaw',
      status: 'forwarded',
      message: 'forwarded',
      externalRunId: 'openclaw-run-1',
      audit: {
        secretExposed: false,
        payloadShape: 'restaurant-agent-external-execution-v1',
        blockedActions: [],
        canForward: true,
      },
    }, new Date('2026-05-24T11:14:00.000Z'));
    const runs = [run];
    const receipts: RestaurantAgentReceiptRecord[] = [];
    const readiness = buildRestaurantExternalReadiness({});
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({
      runs,
      receipts,
      readiness,
      now: new Date('2026-05-24T11:15:00.000Z'),
    });
    const tower = buildRestaurantFirstRunControlTower({
      queue: buildRestaurantStoreManagerTaskQueue(new Date('2026-05-24T11:16:00.000Z')),
      runs,
      receipts,
      readiness,
      env,
      runtimeProbe,
      providerReadinessHealth,
      providerReceiptInbox,
      now: new Date('2026-05-24T11:17:00.000Z'),
    });
    const serialized = JSON.stringify(tower);

    expect(tower.verdict).toBe('waiting-receipt');
    expect(tower.summary.canForwardFirstRun).toBe(true);
    expect(tower.summary.waitingReceipts).toBe(1);
    expect(tower.lanes.find(item => item.id === 'dispatch')?.status).toBe('done');
    expect(tower.lanes.find(item => item.id === 'receipt')?.status).toBe('waiting');
    expect(tower.providerReceiptInbox.requests[0].callback.header).toBe('x-restaurant-agent-signature');
    expect(serialized).not.toContain('openclaw-secret-value');
    expect(serialized).not.toContain('callback-secret-value');
    expect(serialized).not.toContain('browser-profile-secret');
  });

  it('moves to post-run review after an accepted public proof receipt', () => {
    const dispatch = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'Proof Bistro',
      offer: 'Lunch set',
      owner: 'ops',
    });
    const run = recordRestaurantAgentRun(dispatch, 'openclaw', {
      ok: true,
      target: 'openclaw',
      status: 'forwarded',
      message: 'forwarded',
      externalRunId: 'openclaw-run-2',
      audit: {
        secretExposed: false,
        payloadShape: 'restaurant-agent-external-execution-v1',
        blockedActions: [],
        canForward: true,
      },
    }, new Date('2026-05-24T11:20:00.000Z'));
    const receipt = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: 'Dianping',
      evidenceUrl: 'https://www.dianping.com/shop/123/review/456',
      screenshotId: 'shot-public-proof',
      externalRunId: 'openclaw-run-2',
      operator: 'external-runtime',
      summary: 'Public proof was captured after the provider run.',
    }, new Date('2026-05-24T11:21:00.000Z'));

    const tower = buildRestaurantFirstRunControlTower({
      queue: buildRestaurantStoreManagerTaskQueue(new Date('2026-05-24T11:22:00.000Z')),
      runs: [run],
      receipts: [receipt],
      readiness: buildRestaurantExternalReadiness({}),
      now: new Date('2026-05-24T11:23:00.000Z'),
    });

    expect(tower.verdict).toBe('post-run-review');
    expect(tower.summary.acceptedReceipts).toBe(1);
    expect(tower.lanes.find(item => item.id === 'receipt')?.status).toBe('done');
    expect(tower.recovery.actions[0].action).toBe('post-receipt-review');
  });

  it('is exposed through the runtime API without leaking provider secrets', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'first-run-control-tower', runtimeTarget: 'openclaw' }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.firstRunControlTower.payloadShape).toBe('restaurant-first-run-control-tower-v1');
    expect(payload.firstRunControlTower.summary.canClaimAutomation).toBe(false);
    expect(payload.firstRunControlTower.safetyBoundary).toContain('does not log in');
    expect(JSON.stringify(payload)).not.toContain('API key=');
  });
});

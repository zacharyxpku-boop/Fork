import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';
import { buildRestaurantFirstForwardableRunPack } from '@/lib/restaurant-first-forwardable-run-pack';
import { buildRestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import { buildRestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';
import {
  buildRestaurantStoreManagerTaskQueue,
  clearRestaurantStoreManagerTasksForTest,
  recordRestaurantStoreManagerTasks,
  updateRestaurantStoreManagerTaskStatus,
} from '@/lib/restaurant-store-manager-task-store';
import { clearRestaurantAgentReceiptsForTest } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest } from '@/lib/restaurant-agent-run-store';
import { clearRestaurantProviderSetupStateForTest } from '@/lib/restaurant-provider-setup-state-store';

describe('restaurant first forwardable run pack', () => {
  beforeEach(() => {
    clearRestaurantProviderSetupStateForTest();
    clearRestaurantStoreManagerTasksForTest();
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
  });

  it('blocks the first run when no task is ready and no provider gates are configured', () => {
    const pack = buildRestaurantFirstForwardableRunPack({
      queue: buildRestaurantStoreManagerTaskQueue(new Date('2026-05-24T10:00:00.000Z')),
      now: new Date('2026-05-24T10:01:00.000Z'),
    });

    expect(pack.payloadShape).toBe('restaurant-first-forwardable-run-pack-v1');
    expect(pack.verdict).toBe('setup-required');
    expect(pack.summary.canForwardFirstRun).toBe(false);
    expect(pack.summary.canClaimAutomation).toBe(false);
    expect(pack.stages.find(item => item.id === 'task-ready')?.status).toBe('blocked');
    expect(pack.selectedPackage).toBeUndefined();
    expect(pack.safetyBoundary).toContain('does not call external runtimes');
  });

  it('selects a sanitized ready task when runtime callback grant and data gates are configured', async () => {
    const records = recordRestaurantStoreManagerTasks([{
      id: 'first-forwardable-public-proof',
      owner: 'runtime-admin',
      priority: 'today',
      restaurant: 'Sandbox Bistro',
      offer: 'Dinner set',
      signal: 'publish-proof',
      action: 'Capture public proof for the dinner set campaign.',
      talkTrack: 'Keep this as a sandbox execution package.',
      evidenceRequired: 'public proof link or signed callback',
      dueWindow: 'today',
      stopLine: 'No private message text, raw POS rows or customer PII.',
    }], new Date('2026-05-24T10:10:00.000Z'));
    updateRestaurantStoreManagerTaskStatus({
      taskMemoryId: records[0].taskMemoryId,
      status: 'ready-for-provider',
      now: new Date('2026-05-24T10:11:00.000Z'),
    });

    const env = {
      RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL: 'https://openclaw.example/runtime',
      RESTAURANT_AGENT_OPENCLAW_API_KEY: 'openclaw-secret-value',
      RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret-value',
      RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'browser-profile-secret',
      RESTAURANT_AGENT_OPERATOR_APPROVAL: 'approved',
      RESTAURANT_AGENT_GRANT_EXPIRES_AT: '2026-06-24T10:00:00.000Z',
      RESTAURANT_DIANPING_AUTH_STATUS: 'authorized',
      RESTAURANT_POS_DATA_MODE: 'csv',
      RESTAURANT_POS_FIELD_DICTIONARY: 'configured',
    };
    const fetcher = (async () => Response.json({ ok: true })) as typeof fetch;
    const runtimeProbe = await buildRestaurantRuntimeProbe({
      env,
      fetcher,
      now: new Date('2026-05-24T10:12:00.000Z'),
    });
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      env,
      fetcher,
      now: new Date('2026-05-24T10:13:00.000Z'),
    });
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({
      runs: [],
      receipts: [],
      now: new Date('2026-05-24T10:14:00.000Z'),
    });
    const pack = buildRestaurantFirstForwardableRunPack({
      queue: buildRestaurantStoreManagerTaskQueue(new Date('2026-05-24T10:15:00.000Z')),
      target: 'openclaw',
      env,
      runtimeProbe,
      providerReadinessHealth,
      providerReceiptInbox,
      now: new Date('2026-05-24T10:16:00.000Z'),
    });
    const serialized = JSON.stringify(pack);

    expect(pack.verdict).toBe('ready-to-forward');
    expect(pack.summary.readyTasks).toBe(1);
    expect(pack.summary.forwardable).toBe(1);
    expect(pack.summary.canForwardFirstRun).toBe(true);
    expect(pack.summary.canClaimAutomation).toBe(false);
    expect(pack.selectedPackage).toEqual(expect.objectContaining({
      runtimeTarget: 'openclaw',
      canForward: true,
      callbackHeader: 'x-restaurant-agent-signature',
    }));
    expect(pack.stages.find(item => item.id === 'runtime-health')?.status).toBe('passed');
    expect(pack.stages.find(item => item.id === 'receipt-inbox')?.status).toBe('external-required');
    expect(serialized).not.toContain('openclaw-secret-value');
    expect(serialized).not.toContain('callback-secret-value');
    expect(serialized).not.toContain('browser-profile-secret');
  });

  it('is exposed through the runtime API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'first-forwardable-run-pack', runtimeTarget: 'openclaw' }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.firstForwardableRunPack.payloadShape).toBe('restaurant-first-forwardable-run-pack-v1');
    expect(payload.firstForwardableRunPack.summary.canClaimAutomation).toBe(false);
    expect(payload.firstForwardableRunPack.summary.canForwardFirstRun).toBe(false);
    expect(payload.firstForwardableRunPack.safetyBoundary).toContain('does not call external runtimes');
    expect(JSON.stringify(payload)).not.toContain('API key=');
  });
});

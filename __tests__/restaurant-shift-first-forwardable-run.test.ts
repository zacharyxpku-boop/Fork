import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';
import { clearRestaurantAgentReceiptsForTest } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantFirstForwardableRunPack } from '@/lib/restaurant-first-forwardable-run-pack';
import { buildRestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import { buildRestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';
import { buildRestaurantProviderSandboxContract } from '@/lib/restaurant-provider-sandbox-contract';
import { type RestaurantShiftAutopilotRunRecord, clearRestaurantShiftAutopilotRunsForTest } from '@/lib/restaurant-shift-autopilot-run-store';
import { buildRestaurantShiftFirstForwardableRun } from '@/lib/restaurant-shift-first-forwardable-run';
import { buildRestaurantShiftProviderHandoff } from '@/lib/restaurant-shift-provider-handoff';
import { buildRestaurantShiftSandboxAcceptance } from '@/lib/restaurant-shift-sandbox-acceptance';
import { buildRestaurantStoreManagerTaskQueue, clearRestaurantStoreManagerTasksForTest, recordRestaurantStoreManagerTasks, updateRestaurantStoreManagerTaskStatus } from '@/lib/restaurant-store-manager-task-store';
import { buildRestaurantTaskProviderHandoff } from '@/lib/restaurant-task-provider-handoff';

function shiftRun(overrides: Partial<RestaurantShiftAutopilotRunRecord> = {}): RestaurantShiftAutopilotRunRecord {
  const base: RestaurantShiftAutopilotRunRecord = {
    ok: true,
    payloadShape: 'restaurant-shift-autopilot-run-v1',
    runId: 'shift-run-ready-1',
    restaurant: 'Sandbox Bistro',
    offer: 'Dinner set',
    startedAt: '2026-05-24T12:00:00.000Z',
    completedAt: '2026-05-24T12:01:00.000Z',
    summary: {
      dueSteps: 4,
      acceptedInternalActions: 1,
      preparedManualActions: 1,
      providerHeldActions: 2,
      evidenceHeldActions: 1,
      createdStoreManagerTasks: 2,
      canClaimExternalAutomation: false,
    },
    acceptedInternalActions: [],
    preparedManualActions: [],
    providerHeldActions: [
      {
        stepId: 'runtime-submit',
        laneId: 'publish-proof',
        title: 'Submit public proof run',
        owner: 'runtime-admin',
        mode: 'wait-provider',
        action: 'Forward one public proof package to OpenClaw sandbox.',
        proofRequired: ['signed external-receipt callback'],
        providerRequired: ['OpenClaw browser runtime URL and API key', 'callback signature secret'],
        status: 'waiting-provider',
        stopLine: 'No cookies, tokens, private messages or raw POS rows.',
      },
      {
        stepId: 'merchant-data',
        laneId: 'closeout',
        title: 'Check coupon and POS aggregate',
        owner: 'finance',
        mode: 'wait-provider',
        action: 'Use aggregate coupon redemption and POS export only.',
        proofRequired: ['aggregate redemption summary'],
        providerRequired: ['merchant platform authorization', 'aggregate POS/coupon/member export cadence'],
        status: 'waiting-provider',
        stopLine: 'No customer identifiers, coupon codes, payment ids or raw POS rows.',
      },
    ],
    evidenceHeldActions: [],
    evidenceLedger: [],
    nextStoreManagerTasks: [],
    externalRequired: ['OpenClaw browser runtime URL and API key', 'callback signature secret', 'merchant platform authorization'],
    safetyBoundary: 'Shift Autopilot Run records internal planning and owner tasks only. It does not expose secrets.',
  };
  return { ...base, ...overrides };
}

describe('restaurant shift first forwardable run', () => {
  beforeEach(() => {
    clearRestaurantStoreManagerTasksForTest();
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
    clearRestaurantShiftAutopilotRunsForTest();
  });

  it('blocks until there is a recorded shift run and a provider-safe task package', async () => {
    const queue = buildRestaurantStoreManagerTaskQueue(new Date('2026-05-24T12:00:00.000Z'));
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({
      runs: [],
      receipts: [],
      readiness: buildRestaurantExternalReadiness({}),
      now: new Date('2026-05-24T12:01:00.000Z'),
    });
    const taskProviderHandoff = buildRestaurantTaskProviderHandoff({ queue, now: new Date('2026-05-24T12:02:00.000Z') });
    const providerSandboxContract = buildRestaurantProviderSandboxContract({
      taskProviderHandoff,
      providerReceiptInbox,
      now: new Date('2026-05-24T12:03:00.000Z'),
    });
    const shiftProviderHandoff = buildRestaurantShiftProviderHandoff({
      shiftRuns: [],
      now: new Date('2026-05-24T12:04:00.000Z'),
    });
    const shiftSandboxAcceptance = buildRestaurantShiftSandboxAcceptance({
      shiftProviderHandoff,
      providerSandboxContract,
      now: new Date('2026-05-24T12:05:00.000Z'),
    });
    const firstForwardableRunPack = buildRestaurantFirstForwardableRunPack({
      queue,
      providerReceiptInbox,
      now: new Date('2026-05-24T12:06:00.000Z'),
    });

    const pack = buildRestaurantShiftFirstForwardableRun({
      shiftRuns: [],
      shiftProviderHandoff,
      shiftSandboxAcceptance,
      firstForwardableRunPack,
      taskProviderHandoff,
      providerSandboxContract,
      now: new Date('2026-05-24T12:07:00.000Z'),
    });

    expect(pack.payloadShape).toBe('restaurant-shift-first-forwardable-run-v1');
    expect(pack.verdict).toBe('needs-shift-run');
    expect(pack.summary.canForwardFirstShiftRun).toBe(false);
    expect(pack.stages.find(stage => stage.id === 'shift-run-selected')?.status).toBe('blocked');
    expect(pack.safetyBoundary).toContain('does not call a provider');
  });

  it('builds a sandbox-ready first shift run without leaking provider secrets', async () => {
    const taskRecords = recordRestaurantStoreManagerTasks([{
      id: 'shift-public-proof',
      owner: 'runtime-admin',
      priority: 'today',
      restaurant: 'Sandbox Bistro',
      offer: 'Dinner set',
      signal: 'publish-proof',
      action: 'Capture a public proof link for the dinner set campaign.',
      talkTrack: 'Use one controlled sandbox provider run.',
      evidenceRequired: 'public proof link or signed callback',
      dueWindow: 'today',
      stopLine: 'No private messages, raw POS rows or customer PII.',
    }], new Date('2026-05-24T12:10:00.000Z'));
    updateRestaurantStoreManagerTaskStatus({
      taskMemoryId: taskRecords[0].taskMemoryId,
      status: 'ready-for-provider',
      now: new Date('2026-05-24T12:11:00.000Z'),
    });
    const env = {
      RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL: 'https://openclaw.example/runtime',
      RESTAURANT_AGENT_OPENCLAW_API_KEY: 'openclaw-secret-value',
      RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret-value',
      RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'browser-profile-secret',
      RESTAURANT_AGENT_OPERATOR_APPROVAL: 'approved',
      RESTAURANT_AGENT_GRANT_EXPIRES_AT: '2026-06-24T12:00:00.000Z',
      RESTAURANT_DIANPING_AUTH_STATUS: 'authorized',
      RESTAURANT_POS_DATA_MODE: 'csv',
      RESTAURANT_POS_FIELD_DICTIONARY: 'configured',
    };
    const fetcher = (async () => Response.json({ ok: true })) as typeof fetch;
    const now = new Date('2026-05-24T12:12:00.000Z');
    const runtimeProbe = await buildRestaurantRuntimeProbe({ env, fetcher, now });
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({ env, fetcher, runtimeProbe, now });
    const queue = buildRestaurantStoreManagerTaskQueue(now);
    const taskProviderHandoff = buildRestaurantTaskProviderHandoff({ queue, target: 'openclaw', env, now });
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({
      runs: [],
      receipts: [],
      readiness: buildRestaurantExternalReadiness({}),
      now,
    });
    const providerSandboxContract = buildRestaurantProviderSandboxContract({
      runtimeProbe,
      providerReadinessHealth,
      taskProviderHandoff,
      providerReceiptInbox,
      now,
    });
    const shiftProviderHandoff = buildRestaurantShiftProviderHandoff({
      shiftRuns: [shiftRun()],
      providerReadinessHealth,
      now,
    });
    const shiftSandboxAcceptance = buildRestaurantShiftSandboxAcceptance({
      shiftProviderHandoff,
      providerReadinessHealth,
      providerSandboxContract,
      now,
    });
    const firstForwardableRunPack = buildRestaurantFirstForwardableRunPack({
      queue,
      target: 'openclaw',
      env,
      runtimeProbe,
      providerReadinessHealth,
      providerReceiptInbox,
      now,
    });

    const pack = buildRestaurantShiftFirstForwardableRun({
      shiftRuns: [shiftRun()],
      shiftProviderHandoff,
      shiftSandboxAcceptance,
      firstForwardableRunPack,
      taskProviderHandoff,
      providerSandboxContract,
      now,
    });
    const serialized = JSON.stringify(pack);

    expect(pack.verdict).toBe('ready-for-provider-sandbox');
    expect(pack.summary.canSubmitSandbox).toBe(true);
    expect(pack.summary.canForwardFirstShiftRun).toBe(true);
    expect(pack.selectedShiftRun?.runId).toBe('shift-run-ready-1');
    expect(pack.selectedPackage?.canForward).toBe(true);
    expect(pack.stages.find(stage => stage.id === 'external-claim')?.status).toBe('waiting-external');
    expect(pack.summary.canClaimExternalAutomation).toBe(false);
    expect(serialized).not.toContain('openclaw-secret-value');
    expect(serialized).not.toContain('callback-secret-value');
    expect(serialized).not.toContain('browser-profile-secret');
  });

  it('is exposed through the runtime API as a guarded preflight', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'shift-first-forwardable-run', runtimeTarget: 'openclaw' }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.shiftFirstForwardableRun.payloadShape).toBe('restaurant-shift-first-forwardable-run-v1');
    expect(payload.shiftFirstForwardableRun.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.shiftFirstForwardableRun.safetyBoundary).toContain('does not call a provider');
  });
});

import { afterEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { recordRestaurantBrowserRunnerEvent, clearRestaurantBrowserRunnerEventsForTest } from '@/lib/restaurant-agent-browser-runner-event-store';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantRuntimeRunnerLoopPack } from '@/lib/restaurant-runtime-runner-loop-pack';

describe('restaurant runtime runner loop pack', () => {
  afterEach(() => {
    clearRestaurantBrowserRunnerEventsForTest();
    clearRestaurantAgentReceiptsForTest();
    clearRestaurantAgentRunsForTest();
  });

  it('connects runner step events to final callback, receipt inbox and recovery without claiming automation', () => {
    const dispatch = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'South City Bistro',
      offer: 'Dinner set',
      owner: 'Store manager',
    });
    const run = recordRestaurantAgentRun(dispatch, 'openclaw', {
      ok: true,
      target: 'openclaw',
      status: 'forwarded',
      endpoint: 'https://openclaw.example/tasks',
      externalRunId: 'openclaw-run-1',
      message: 'Forwarded to OpenClaw sandbox; waiting for signed receipt.',
      audit: {
        secretExposed: false,
        payloadShape: 'restaurant-agent-external-execution-v1',
        packageId: 'restaurant-agent-external-execution-1',
        canForward: true,
        blockedActions: [],
      },
    }, new Date('2026-05-25T10:00:00.000Z'));
    const runnerEvent = recordRestaurantBrowserRunnerEvent({
      eventId: run.eventId,
      runbookId: 'restaurant-browser-runbook-openclaw',
      runtimeTarget: 'openclaw',
      externalRunId: 'openclaw-run-1',
      stepId: 'capture-public-proof',
      type: 'run-completed',
      evidenceSummary: 'Public proof captured; signed receipt pending.',
      nextAction: 'Send signed external-receipt callback.',
    }, new Date('2026-05-25T10:05:00.000Z'));
    const pack = buildRestaurantRuntimeRunnerLoopPack({
      runs: [run],
      receipts: [],
      runnerEvents: [runnerEvent],
      now: new Date('2026-05-25T10:06:00.000Z'),
    });
    const serialized = JSON.stringify(pack);

    expect(pack.payloadShape).toBe('restaurant-runtime-runner-loop-pack-v1');
    expect(pack.summary.completedRunnerRuns).toBe(1);
    expect(pack.summary.waitingReceipts).toBe(1);
    expect(pack.summary.canClaimExternalAutomation).toBe(false);
    expect(pack.verdict).toBe('waiting-final-callback');
    expect(pack.stages.find(stage => stage.id === 'final-callback')?.status).toBe('waiting');
    expect(serialized).not.toContain('openclaw-secret');
    expect(serialized).not.toContain('browser-profile-secret');
  });

  it('moves accepted receipts into memory follow-up instead of invented growth claims', () => {
    const run = recordRestaurantAgentRun(buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'South City Bistro',
      offer: 'Dinner set',
      owner: 'Store manager',
    }), 'local', undefined, new Date('2026-05-25T11:00:00.000Z'));
    const receipt = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: 'Dianping',
      evidenceUrl: 'https://www.dianping.com/shop/123/review/456',
      screenshotId: 'shot-public-proof-1',
      operator: 'Operator',
      summary: 'Public publish proof saved for post-run review.',
    }, new Date('2026-05-25T11:01:00.000Z'));
    const pack = buildRestaurantRuntimeRunnerLoopPack({
      runs: [run],
      receipts: [receipt],
      now: new Date('2026-05-25T11:02:00.000Z'),
    });

    expect(receipt.status).toBe('accepted');
    expect(pack.summary.acceptedReceipts).toBe(1);
    expect(pack.verdict).toBe('memory-followup-ready');
    expect(pack.stages.find(stage => stage.id === 'memory-followup')?.status).toBe('ready');
    expect(pack.safetyBoundary).toContain('does not auto-publish');
  });

  it('is exposed through the runtime API with current runner events and receipt requirements', async () => {
    const run = recordRestaurantAgentRun(buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'South City Bistro',
      offer: 'Dinner set',
      owner: 'Store manager',
    }), 'openclaw', {
      ok: true,
      target: 'openclaw',
      status: 'forwarded',
      externalRunId: 'openclaw-run-api',
      message: 'Forwarded to OpenClaw sandbox; waiting for signed receipt.',
      audit: {
        secretExposed: false,
        payloadShape: 'restaurant-agent-external-execution-v1',
        blockedActions: [],
      },
    });
    recordRestaurantBrowserRunnerEvent({
      eventId: run.eventId,
      runbookId: 'restaurant-browser-runbook-api',
      runtimeTarget: 'openclaw',
      externalRunId: 'openclaw-run-api',
      type: 'run-started',
      evidenceSummary: 'Runner started on public proof capture.',
    });

    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({ action: 'runtime-runner-loop-pack' }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.runtimeRunnerLoopPack.payloadShape).toBe('restaurant-runtime-runner-loop-pack-v1');
    expect(payload.runtimeRunnerLoopPack.summary.runnerEvents).toBeGreaterThanOrEqual(1);
    expect(payload.runtimeRunnerLoopPack.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.runtimeRunnerLoopPack.providerReceiptInbox.summary.waitingReceipt).toBeGreaterThanOrEqual(1);
  });
});

import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { recordRestaurantBrowserRunnerEvent, clearRestaurantBrowserRunnerEventsForTest } from '@/lib/restaurant-agent-browser-runner-event-store';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantResidentAgentMissionControl } from '@/lib/restaurant-resident-agent-mission-control';

describe('restaurant resident agent mission control', () => {
  afterEach(() => {
    clearRestaurantBrowserRunnerEventsForTest();
    clearRestaurantAgentReceiptsForTest();
    clearRestaurantAgentRunsForTest();
  });

  it('combines command, browser, runner, memory and manager lanes without claiming autonomous outcomes', async () => {
    const run = recordRestaurantAgentRun(buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'South City Bistro',
      offer: 'Dinner set',
      owner: 'Store manager',
    }), 'openclaw', {
      ok: true,
      target: 'openclaw',
      status: 'forwarded',
      externalRunId: 'openclaw-run-mission',
      message: 'Forwarded to OpenClaw sandbox; waiting for signed receipt.',
      audit: {
        secretExposed: false,
        payloadShape: 'restaurant-agent-external-execution-v1',
        blockedActions: [],
      },
    }, new Date('2026-05-25T13:00:00.000Z'));
    const runnerEvent = recordRestaurantBrowserRunnerEvent({
      eventId: run.eventId,
      runbookId: 'restaurant-browser-runbook-mission',
      runtimeTarget: 'openclaw',
      externalRunId: 'openclaw-run-mission',
      type: 'run-completed',
      evidenceSummary: 'Public proof captured; signed receipt pending.',
    }, new Date('2026-05-25T13:02:00.000Z'));
    const control = await buildRestaurantResidentAgentMissionControl({
      restaurant: 'South City Bistro',
      offer: 'Dinner set',
      runs: [run],
      runnerEvents: [runnerEvent],
      now: new Date('2026-05-25T13:03:00.000Z'),
    });

    expect(control.payloadShape).toBe('restaurant-resident-agent-mission-control-v1');
    expect(control.mode).toBe('waiting-receipt');
    expect(control.summary.runnerEvents).toBe(1);
    expect(control.summary.canRunInternally).toBe(true);
    expect(control.summary.canClaimAutonomousOutcomes).toBe(false);
    expect(control.lanes.map(item => item.id)).toEqual(['command', 'browser', 'runner', 'memory', 'store-manager', 'operating-review']);
    expect(control.primaryAction.label).toBe('Collect Final Receipt');
    expect(control.safetyBoundary).toContain('not a claim of automatic publishing');
  });

  it('moves accepted proof into review-ready mode and keeps external browser claims gated', async () => {
    const run = recordRestaurantAgentRun(buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'South City Bistro',
      offer: 'Dinner set',
      owner: 'Store manager',
    }), 'local', undefined, new Date('2026-05-25T14:00:00.000Z'));
    const receipt = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: 'Dianping',
      evidenceUrl: 'https://www.dianping.com/shop/123/review/456',
      screenshotId: 'shot-public-proof-1',
      operator: 'Operator',
      summary: 'Public publish proof saved for post-run review.',
    }, new Date('2026-05-25T14:01:00.000Z'));
    const control = await buildRestaurantResidentAgentMissionControl({
      restaurant: 'South City Bistro',
      offer: 'Dinner set',
      runs: [run],
      receipts: [receipt],
      now: new Date('2026-05-25T14:02:00.000Z'),
    });

    expect(receipt.status).toBe('accepted');
    expect(control.mode).toBe('review-ready');
    expect(control.summary.acceptedReceipts).toBe(1);
    expect(control.summary.canRunExternalBrowser).toBe(false);
    expect(control.lanes.find(item => item.id === 'operating-review')?.status).toBe('complete');
  });

  it('is exposed through the runtime API for the customer workbench', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'resident-agent-mission-control',
        restaurant: 'South City Bistro',
        offer: 'Dinner set',
        channels: 'Dianping / Xiaohongshu',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.residentAgentMissionControl.payloadShape).toBe('restaurant-resident-agent-mission-control-v1');
    expect(payload.residentAgentMissionControl.summary.canClaimAutonomousOutcomes).toBe(false);
    expect(payload.residentAgentMissionControl.browserGateway.payloadShape).toBe('restaurant-browser-gateway-pack-v1');
  });
});

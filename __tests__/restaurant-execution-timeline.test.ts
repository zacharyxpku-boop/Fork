import { afterEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantExecutionTimeline } from '@/lib/restaurant-execution-timeline';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';

describe('restaurant execution timeline', () => {
  afterEach(() => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
  });

  it('turns run health heartbeat watcher recovery and business signals into a customer-readable timeline', () => {
    const acceptedDispatch = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: '北城面馆',
      offer: '番茄牛腩面套餐',
      owner: '运营负责人',
    });
    const waitingDispatch = buildRestaurantAgentDispatch({
      taskId: 'memory-followup',
      restaurant: '北城面馆',
      offer: '社群午餐券',
      owner: '社群负责人',
    });
    const acceptedRun = recordRestaurantAgentRun(acceptedDispatch, 'local', undefined, new Date('2026-05-24T08:00:00.000Z'));
    const waitingRun = recordRestaurantAgentRun(waitingDispatch, 'openclaw', {
      ok: true,
      target: 'openclaw',
      status: 'forwarded',
      message: 'forwarded to openclaw',
      audit: {
        secretExposed: false,
        payloadShape: 'restaurant-agent-external-execution-v1',
        blockedActions: [],
        canForward: true,
      },
    }, new Date('2026-05-24T08:03:00.000Z'));
    const receipt = recordRestaurantAgentReceipt({
      eventId: acceptedRun.eventId,
      channel: 'Local simulator',
      screenshotId: 'shot-timeline',
      externalRunId: 'sim-openclaw-timeline',
      signalType: 'visit-intent',
      visitIntentCount: 6,
      summary: '受控试运行回执。',
    }, new Date('2026-05-24T08:04:00.000Z'));

    const timeline = buildRestaurantExecutionTimeline({
      runs: [waitingRun, acceptedRun],
      receipts: [receipt],
      now: new Date('2026-05-24T08:05:00.000Z'),
    });

    expect(timeline.payloadShape).toBe('restaurant-execution-timeline-v1');
    expect(timeline.summary.runs).toBe(2);
    expect(timeline.summary.acceptedReceipts).toBe(1);
    expect(timeline.summary.waitingReceipt).toBe(1);
    expect(timeline.summary.businessSignals).toBe(1);
    expect(timeline.mode).toBe('waiting-receipt');
    expect(timeline.items.map(item => item.stage)).toEqual(expect.arrayContaining(['business', 'forwarded']));
    expect(timeline.nextHeartbeat.followups.length).toBeGreaterThan(0);
    expect(timeline.watcherPolicy.summary.wakeups).toBeGreaterThan(0);
    expect(timeline.businessSignals.summary.visitIntent).toBe(6);
    expect(timeline.safetyBoundary).toContain('read-only control lane');
  });

  it('returns a bootstrap lane when no run exists', () => {
    const timeline = buildRestaurantExecutionTimeline({
      runs: [],
      receipts: [],
      now: new Date('2026-05-24T08:05:00.000Z'),
    });

    expect(timeline.mode).toBe('no-run');
    expect(timeline.items[0].id).toBe('timeline-bootstrap');
    expect(timeline.items[0].nextAction).toContain('本地 Agent');
  });

  it('exposes the execution timeline through the runtime API', async () => {
    const runResponse = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 'browser-publish-check',
        restaurant: '北城面馆',
        offer: '番茄牛腩面套餐',
        owner: '运营负责人',
        runtimeTarget: 'local',
      }),
    }) as never);
    const runPayload = await runResponse.json();
    await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'receipt',
        eventId: runPayload.dispatch.eventId,
        channel: '大众点评',
        evidenceUrl: 'https://www.dianping.com/shop/123/review/456',
        screenshotId: 'shot-timeline-api',
        signalType: 'reservation',
        reservationCount: 3,
      }),
    }) as never);

    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({ action: 'execution-timeline' }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.executionTimeline.payloadShape).toBe('restaurant-execution-timeline-v1');
    expect(payload.executionTimeline.summary.runs).toBeGreaterThanOrEqual(1);
    expect(payload.executionTimeline.summary.acceptedReceipts).toBeGreaterThanOrEqual(1);
    expect(payload.executionTimeline.items.length).toBeGreaterThan(0);
  });
});

import { afterEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantBrowserSessionManifest } from '@/lib/restaurant-agent-browser-session';
import { clearRestaurantBrowserSessionsForTest, recordRestaurantBrowserSession } from '@/lib/restaurant-agent-browser-session-store';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantAgentOpsConsole } from '@/lib/restaurant-agent-ops-console';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';

describe('restaurant agent ops console', () => {
  afterEach(() => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
    clearRestaurantBrowserSessionsForTest();
  });

  it('combines runs receipts watcher recovery business signals and browser session health', () => {
    const localDispatch = buildRestaurantAgentDispatch({ taskId: 'browser-publish-check', restaurant: '湖东小馆', offer: '午市套餐', owner: '运营' });
    const forwardedDispatch = buildRestaurantAgentDispatch({ taskId: 'memory-followup', restaurant: '湖东小馆', offer: '社群套餐' });
    const blockedDispatch = buildRestaurantAgentDispatch({ taskId: 'browser-publish-check', restaurant: '湖东小馆', offer: '团购券', runtimeTarget: 'lobu' });
    const localRun = recordRestaurantAgentRun(localDispatch, 'local', undefined, new Date('2026-05-23T08:00:00.000Z'));
    const forwardedRun = recordRestaurantAgentRun(forwardedDispatch, 'openclaw', { ok: true, target: 'openclaw', status: 'forwarded', message: 'forwarded', audit: { secretExposed: false, payloadShape: 'restaurant-agent-external-execution-v1', blockedActions: [], canForward: true } }, new Date('2026-05-23T08:03:00.000Z'));
    const blockedRun = recordRestaurantAgentRun(blockedDispatch, 'lobu', { ok: false, target: 'lobu', status: 'blocked', message: 'missing runtime', audit: { secretExposed: false, payloadShape: 'restaurant-agent-external-execution-v1', blockedActions: [], canForward: false } }, new Date('2026-05-23T08:04:00.000Z'));
    const receipt = recordRestaurantAgentReceipt({
      eventId: localRun.eventId,
      channel: '大众点评',
      evidenceUrl: 'https://www.dianping.com/shop/123/review/456',
      screenshotId: 'shot-ops-1',
      signalType: 'coupon-claim',
      couponClaimCount: 8,
      summary: '发布证明和领券摘要已导入。',
    }, new Date('2026-05-23T08:05:00.000Z'));
    const session = recordRestaurantBrowserSession(buildRestaurantBrowserSessionManifest({
      runtimeTarget: 'openclaw',
      eventId: forwardedRun.eventId,
      env: {
        RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL: 'https://openclaw.example/runtime',
        RESTAURANT_AGENT_OPENCLAW_API_KEY: 'openclaw-secret',
        RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'profile-1',
        RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret',
      },
    }), new Date('2026-05-23T08:02:00.000Z'));

    const console = buildRestaurantAgentOpsConsole({
      runs: [blockedRun, forwardedRun, localRun],
      receipts: [receipt],
      browserSessions: [session],
      now: new Date('2026-05-23T08:06:00.000Z'),
    });

    expect(console.summary.runs).toBe(3);
    expect(console.summary.acceptedReceipts).toBe(1);
    expect(console.summary.waitingReceipt).toBe(1);
    expect(console.summary.blockedRuns).toBe(1);
    expect(console.summary.businessSignals).toBe(1);
    expect(console.summary.readyBrowserSessions).toBe(1);
    expect(console.timeline.map(item => item.stage)).toEqual(expect.arrayContaining(['receipt', 'forwarded', 'recovery', 'watcher']));
    expect(console.businessSignals.summary.couponClaims).toBe(8);
    expect(JSON.stringify(console)).not.toContain('openclaw-secret');
    expect(console.safetyBoundary).toContain('不登录平台');
  });

  it('exposes the ops console through the runtime API', async () => {
    const runResponse = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 'browser-publish-check',
        restaurant: '北城面馆',
        offer: '番茄牛腩面套餐',
        owner: '社群负责人',
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
        evidenceUrl: 'https://www.dianping.com/shop/123/review/789',
        screenshotId: 'shot-api-ops',
        signalType: 'reservation',
        reservationCount: 3,
      }),
    }) as never);

    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({ action: 'ops-console' }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.opsConsole.ok).toBe(true);
    expect(payload.opsConsole.summary.runs).toBeGreaterThanOrEqual(1);
    expect(payload.opsConsole.summary.acceptedReceipts).toBeGreaterThanOrEqual(1);
    expect(payload.opsConsole.timeline.length).toBeGreaterThan(0);
  });
});

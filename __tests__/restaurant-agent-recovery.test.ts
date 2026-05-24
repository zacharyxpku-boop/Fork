import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantAgentRecoveryPlan } from '@/lib/restaurant-agent-recovery';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';

describe('restaurant agent recovery planner', () => {
  it('creates a bootstrap action when no runs exist', () => {
    const plan = buildRestaurantAgentRecoveryPlan([], []);

    expect(plan.ok).toBe(true);
    expect(plan.actions[0]).toEqual(expect.objectContaining({
      action: 'start-local-run',
      canRunInternally: true,
    }));
    expect(plan.retryPolicy.stopWhen).toContain('merchant authorization missing');
  });

  it('turns blocked forwarded queued and receipted runs into distinct recovery actions', () => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
    const queuedDispatch = buildRestaurantAgentDispatch({ taskId: 'browser-publish-check', restaurant: '南城川味小馆', offer: '双人酸菜鱼套餐', owner: '店长' });
    const blockedDispatch = buildRestaurantAgentDispatch({ taskId: 'browser-publish-check', restaurant: '南城川味小馆', offer: '双人酸菜鱼套餐', runtimeTarget: 'lobu' });
    const forwardedDispatch = buildRestaurantAgentDispatch({ taskId: 'browser-publish-check', restaurant: '北城面馆', offer: '番茄牛腩面套餐', owner: '运营' });
    const receiptedDispatch = buildRestaurantAgentDispatch({ taskId: 'memory-followup', restaurant: '西城烧烤', offer: '夜宵套餐', owner: '店长' });
    const queued = recordRestaurantAgentRun(queuedDispatch, 'local', undefined, new Date('2026-05-23T01:00:00.000Z'));
    const blocked = recordRestaurantAgentRun(blockedDispatch, 'lobu', { ok: false, target: 'lobu', status: 'blocked', message: 'missing runtime', audit: { secretExposed: false, payloadShape: 'lobu-compatible-restaurant-task', blockedActions: [] } }, new Date('2026-05-23T02:00:00.000Z'));
    const forwarded = recordRestaurantAgentRun(forwardedDispatch, 'openclaw', { ok: true, target: 'openclaw', status: 'forwarded', message: 'forwarded', externalRunId: 'openclaw-1', endpoint: 'https://runtime.example/events', audit: { secretExposed: false, payloadShape: 'lobu-compatible-restaurant-task', blockedActions: [] } }, new Date('2026-05-23T03:00:00.000Z'));
    const receipted = recordRestaurantAgentRun(receiptedDispatch, 'local', undefined, new Date('2026-05-23T04:00:00.000Z'));
    const receipt = recordRestaurantAgentReceipt({ eventId: receipted.eventId, channel: '大众点评', evidenceUrl: 'https://www.dianping.com/shop/123/review/456', screenshotId: 'shot-recovery-proof', summary: '已导入证明。' });

    const plan = buildRestaurantAgentRecoveryPlan([receipted, forwarded, blocked, queued], [receipt], buildRestaurantExternalReadiness({}));
    const actions = plan.actions.map(action => action.action);

    expect(actions).toEqual(['post-receipt-review', 'import-receipt', 'configure-runtime', 'manual-fallback']);
    expect(plan.actions.find(action => action.eventId === blocked.eventId)?.canRunInternally).toBe(false);
    expect(plan.blockedExternal.join(' ')).toContain('Lobu');
  });

  it('exposes recovery through the runtime API', async () => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
    await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 'browser-publish-check',
        restaurant: '北城面馆',
        offer: '番茄牛腩面套餐',
        owner: '运营',
        runtimeTarget: 'local',
      }),
    }) as never);

    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({ action: 'recovery' }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.recovery.actions[0].action).toBe('manual-fallback');
    expect(payload.recovery.retryPolicy.maxAttempts).toBe(2);
  });
});

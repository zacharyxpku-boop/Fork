import { afterEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantAgentHeartbeat } from '@/lib/restaurant-agent-heartbeat';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantAgentWatcherPolicy } from '@/lib/restaurant-agent-watcher-policy';

describe('restaurant agent watcher policy', () => {
  afterEach(() => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
  });

  it('builds watcher lanes for receipts, blocked runs, POS imports and browser sessions', () => {
    const policy = buildRestaurantAgentWatcherPolicy({ runs: [], receipts: [] });

    expect(policy.summary.lanes).toBe(5);
    expect(policy.summary.armed).toBe(3);
    expect(policy.lanes.map(lane => lane.id)).toEqual([
      'publish-receipt-watcher',
      'lead-signal-watcher',
      'blocked-run-watcher',
      'pos-redemption-watcher',
      'browser-session-watcher',
    ]);
    expect(policy.blockedExternal).toContain('private message raw text remains forbidden');
    expect(policy.safetyBoundary).toContain('不代发');
  });

  it('turns accepted rejected blocked and forwarded events into active wakeups and memory upserts', () => {
    const acceptedDispatch = buildRestaurantAgentDispatch({ taskId: 'browser-publish-check', restaurant: '湖东小馆', offer: '午市套餐', owner: '运营' });
    const rejectedDispatch = buildRestaurantAgentDispatch({ taskId: 'browser-publish-check', restaurant: '湖东小馆', offer: '晚市套餐', owner: '店长' });
    const blockedDispatch = buildRestaurantAgentDispatch({ taskId: 'browser-publish-check', restaurant: '湖东小馆', offer: '团购券', runtimeTarget: 'lobu' });
    const forwardedDispatch = buildRestaurantAgentDispatch({ taskId: 'memory-followup', restaurant: '湖东小馆', offer: '社群套餐' });

    const acceptedRun = recordRestaurantAgentRun(acceptedDispatch, 'local');
    const rejectedRun = recordRestaurantAgentRun(rejectedDispatch, 'local');
    const blockedRun = recordRestaurantAgentRun(blockedDispatch, 'lobu', { ok: false, target: 'lobu', status: 'blocked', message: 'missing runtime', audit: { secretExposed: false, payloadShape: 'restaurant-agent-external-execution-v1', blockedActions: [], canForward: false } });
    const forwardedRun = recordRestaurantAgentRun(forwardedDispatch, 'openclaw', { ok: true, target: 'openclaw', status: 'forwarded', message: 'forwarded', audit: { secretExposed: false, payloadShape: 'restaurant-agent-external-execution-v1', blockedActions: [], canForward: true } });

    const acceptedReceipt = recordRestaurantAgentReceipt({ eventId: acceptedRun.eventId, channel: '大众点评', evidenceUrl: 'https://www.dianping.com/shop/123/review/456', screenshotId: 'shot-1', summary: '发布证明已导入。' });
    const rejectedReceipt = recordRestaurantAgentReceipt({ eventId: rejectedRun.eventId, channel: '小红书', evidenceUrl: 'https://example.com/demo', summary: '样例链接。' });
    const policy = buildRestaurantAgentWatcherPolicy({ runs: [acceptedRun, rejectedRun, blockedRun, forwardedRun], receipts: [acceptedReceipt, rejectedReceipt] });

    expect(policy.wakeups.map(wakeup => wakeup.priority)).toEqual(['low', 'high', 'high', 'medium']);
    expect(policy.memoryUpserts.find(item => item.key === `${acceptedReceipt.eventId}:${acceptedReceipt.channel}`)).toEqual(expect.objectContaining({ confidence: 'confirmed' }));
    expect(policy.memoryUpserts.find(item => item.key === `${rejectedReceipt.eventId}:${rejectedReceipt.channel}`)).toEqual(expect.objectContaining({ confidence: 'needs-proof' }));
    expect(policy.summary.highPriority).toBe(2);
    expect(JSON.stringify(policy)).not.toContain('13800138000');
    expect(JSON.stringify(policy)).not.toContain('openclaw-secret');
    expect(JSON.stringify(policy)).not.toContain('callback-secret-value');
  });

  it('feeds watcher policy into heartbeat and the runtime API', async () => {
    const dispatch = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: '北城面馆',
      offer: '番茄牛腩面套餐',
      owner: '社群负责人',
    });
    const run = recordRestaurantAgentRun(dispatch, 'local');
    const heartbeat = buildRestaurantAgentHeartbeat([run], []);

    expect(heartbeat.watcherPolicy.summary.wakeups).toBe(1);
    expect(heartbeat.watcherPolicy.wakeups[0].memoryWrite).toContain('北城面馆');

    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({ action: 'heartbeat' }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.heartbeat.watcherPolicy.summary.lanes).toBe(5);
    expect(payload.heartbeat.watcherPolicy.blockedExternal).toContain('POS redemption watcher requires POS export/API and field dictionary');
  });
});

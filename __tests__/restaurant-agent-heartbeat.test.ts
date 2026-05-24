import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantAgentHeartbeat } from '@/lib/restaurant-agent-heartbeat';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';

describe('restaurant agent heartbeat', () => {
  it('creates a bootstrap followup when no runs exist', () => {
    const heartbeat = buildRestaurantAgentHeartbeat([]);

    expect(heartbeat.ok).toBe(true);
    expect(heartbeat.watchedRuns).toBe(0);
    expect(heartbeat.followups[0].nextAction).toContain('生成本地 Agent 任务');
    expect(heartbeat.watcherEvents).toContain('publish_receipt_added');
  });

  it('turns queued and blocked runs into proactive followups', () => {
    const queued = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: '南城川味小馆',
      offer: '双人酸菜鱼套餐',
      owner: '店长',
    });
    const blocked = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: '南城川味小馆',
      offer: '双人酸菜鱼套餐',
      runtimeTarget: 'lobu',
    });

    const heartbeat = buildRestaurantAgentHeartbeat([
      recordRestaurantAgentRun(blocked, 'lobu', { ok: false, target: 'lobu', status: 'blocked', message: '缺少 runtime URL。', audit: { secretExposed: false, payloadShape: 'lobu-compatible-restaurant-task', blockedActions: [] } }),
      recordRestaurantAgentRun(queued, 'local'),
    ]);

    expect(heartbeat.followups.map(item => item.priority)).toEqual(['high', 'medium']);
    expect(heartbeat.followups[0].evidenceRequired).toContain('runtime URL');
    expect(heartbeat.blockedExternal).toContain('pos_redemption_pull requires POS export/API');
  });

  it('exposes heartbeat through the runtime API', async () => {
    clearRestaurantAgentRunsForTest();
    await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 'browser-publish-check',
        restaurant: '北城面馆',
        offer: '番茄牛腩面套餐',
        owner: '社群负责人',
        runtimeTarget: 'local',
      }),
    }) as never);

    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({ action: 'heartbeat' }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.heartbeat.watchedRuns).toBeGreaterThanOrEqual(1);
    expect(payload.heartbeat.followups[0].nextAction).toContain('发布链接');
  });
});

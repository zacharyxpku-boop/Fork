import { beforeEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantAgentHeartbeat } from '@/lib/restaurant-agent-heartbeat';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';
import { clearRestaurantShiftAutopilotRunsForTest } from '@/lib/restaurant-shift-autopilot-run-store';
import { clearRestaurantStoreManagerTasksForTest } from '@/lib/restaurant-store-manager-task-store';

describe('restaurant agent heartbeat', () => {
  beforeEach(() => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantShiftAutopilotRunsForTest();
    clearRestaurantStoreManagerTasksForTest();
  });

  it('creates a bootstrap followup when no runs exist', () => {
    const heartbeat = buildRestaurantAgentHeartbeat([]);

    expect(heartbeat.ok).toBe(true);
    expect(heartbeat.watchedRuns).toBe(0);
    expect(heartbeat.shiftAutopilotRuns).toBe(0);
    expect(heartbeat.taskWakeups).toBe(0);
    expect(heartbeat.followups[0].nextAction).toContain('Create the first governed local agent task');
    expect(heartbeat.watcherEvents).toContain('publish_receipt_added');
  });

  it('turns queued and blocked runs into proactive followups', () => {
    const queued = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'South City Sichuan Bistro',
      offer: 'Two-person pickled fish set',
      owner: 'store-manager',
    });
    const blocked = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'South City Sichuan Bistro',
      offer: 'Two-person pickled fish set',
      runtimeTarget: 'lobu',
    });

    const heartbeat = buildRestaurantAgentHeartbeat([
      recordRestaurantAgentRun(blocked, 'lobu', { ok: false, target: 'lobu', status: 'blocked', message: 'missing runtime URL', audit: { secretExposed: false, payloadShape: 'lobu-compatible-restaurant-task', blockedActions: [] } }),
      recordRestaurantAgentRun(queued, 'local'),
    ]);

    expect(heartbeat.followups.map(item => item.priority)).toEqual(['high', 'medium']);
    expect(heartbeat.followups[0].evidenceRequired).toContain('runtime URL');
    expect(heartbeat.blockedExternal).toContain('pos_redemption_pull requires POS export/API');
  });

  it('promotes Shift Autopilot run records and owner-task wakeups into resident followups', async () => {
    await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'shift-autopilot-run',
        restaurant: 'North City Noodles',
        offer: 'Tomato beef noodle set',
      }),
    }) as never);

    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({ action: 'heartbeat' }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.heartbeat.shiftAutopilotRuns).toBeGreaterThanOrEqual(1);
    expect(payload.heartbeat.taskWakeups).toBeGreaterThan(0);
    expect(payload.heartbeat.followups[0].reason).toContain('Shift Autopilot run');
    expect(payload.heartbeat.storeManagerTaskWatcher.payloadShape).toBe('restaurant-store-manager-task-watcher-v1');
    expect(payload.heartbeat.memorySuggestions.join('\n')).toContain('shift autopilot');
  });

  it('exposes heartbeat through the runtime API', async () => {
    await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 'browser-publish-check',
        restaurant: 'North City Noodles',
        offer: 'Tomato beef noodle set',
        owner: 'community-ops',
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
    expect(payload.heartbeat.followups[0].nextAction).toContain('Attach public proof');
  });
});

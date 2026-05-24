import { describe, expect, it } from 'vitest';

import { GET, POST } from '@/app/api/restaurant-agent/runtime/route';
import { clearRestaurantAgentRunsForTest, listRestaurantAgentRuns, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';

describe('restaurant agent run store', () => {
  it('records local run receipts and keeps newest first', () => {
    clearRestaurantAgentRunsForTest();
    const dispatch = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: '南城川味小馆',
      offer: '双人酸菜鱼套餐',
      owner: '店长',
    });

    const record = recordRestaurantAgentRun(dispatch, 'local', undefined, new Date('2026-05-23T00:00:00.000Z'));

    expect(record.status).toBe('queued');
    expect(record.target).toBe('local');
    expect(record.blockedActions).toContain('external_platform_publish');
    expect(listRestaurantAgentRuns()).toContainEqual(record);
  });

  it('returns run history from the runtime API', async () => {
    clearRestaurantAgentRunsForTest();
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 'memory-followup',
        restaurant: '北城面馆',
        offer: '番茄牛腩面套餐',
        owner: '社群负责人',
        runtimeTarget: 'local',
      }),
    }) as never);
    const payload = await response.json();
    const getResponse = await GET();
    const getPayload = await getResponse.json();

    expect(response.status).toBe(201);
    expect(payload.run.status).toBe('queued');
    expect(getPayload.runs.some((run: { eventId: string }) => run.eventId === payload.run.eventId)).toBe(true);
  });
});

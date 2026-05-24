import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantAgentRuntime } from '@/lib/restaurant-agent-runtime';

describe('restaurant agent dispatch', () => {
  it('adds a Lobu-compatible local runtime without pretending platform accounts are connected', () => {
    const runtime = buildRestaurantAgentRuntime();
    const lobuLocal = runtime.connectors.find(connector => connector.id === 'lobu-local-runtime');

    expect(lobuLocal).toEqual(expect.objectContaining({
      runtime: 'lobu-compatible-local',
      status: 'internal-ready',
      canRunNow: true,
    }));
    expect(runtime.summary.internalReady).toBe(29);
    expect(runtime.summary.externalBlocked).toBe(3);
    expect(runtime.summary.nextRuntimeChoice).toContain('Lobu 兼容本地运行层');
  });

  it('builds a real local worker payload, memory writes and audit log', () => {
    const dispatch = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: '南城川味小馆',
      offer: '双人酸菜鱼套餐',
      owner: '店长',
    });

    expect(dispatch.ok).toBe(true);
    expect(dispatch.status).toBe('queued');
    expect(dispatch.adapter).toBe('lobu-compatible-local');
    expect(dispatch.workerPayload.allowedActions).toEqual([
      'queue_task',
      'write_structured_memory',
      'generate_evidence_checklist',
      'append_audit_log',
    ]);
    expect(dispatch.workerPayload.blockedActions).toContain('external_platform_publish');
    expect(dispatch.memoryWrites.map(item => item.entity)).toEqual(['Restaurant', 'Offer']);
    expect(dispatch.auditLog[0].result).toContain('外部平台动作仍需授权');
  });

  it('blocks external runtime dispatch until runtime and authorization exist', () => {
    const dispatch = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: '南城川味小馆',
      offer: '双人酸菜鱼套餐',
      runtimeTarget: 'lobu',
    });

    expect(dispatch.ok).toBe(false);
    expect(dispatch.status).toBe('blocked');
    expect(dispatch.nextAttachStep).toContain('runtime URL');
    expect(dispatch.nextAttachStep).toContain('商家账号授权');
  });

  it('exposes a POST route for local runtime queueing', async () => {
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

    expect(response.status).toBe(201);
    expect(payload.ok).toBe(true);
    expect(payload.dispatch.workerPayload.taskId).toBe('memory-followup');
    expect(payload.dispatch.workerPayload.restaurant).toBe('北城面馆');
  });
});

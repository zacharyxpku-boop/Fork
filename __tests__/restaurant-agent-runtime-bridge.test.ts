import { describe, expect, it } from 'vitest';

import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { forwardRestaurantAgentDispatch } from '@/lib/restaurant-agent-runtime-bridge';

describe('restaurant agent runtime bridge', () => {
  const dispatch = buildRestaurantAgentDispatch({
    taskId: 'browser-publish-check',
    restaurant: '南城川味小馆',
    offer: '双人酸菜鱼套餐',
    owner: '店长',
  });

  it('blocks external forwarding until runtime URL and secret exist', async () => {
    const bridge = await forwardRestaurantAgentDispatch(dispatch, { target: 'lobu' });

    expect(bridge.ok).toBe(false);
    expect(bridge.status).toBe('blocked');
    expect(bridge.message).toContain('RESTAURANT_AGENT_LOBU_RUNTIME_URL');
    expect(bridge.audit.secretExposed).toBe(false);
    expect(bridge.audit.payloadShape).toBe('restaurant-agent-external-execution-v1');
    expect(bridge.audit.packageId).toMatch(/^restaurant-exec-/);
  });

  it('blocks configured runtimes when the execution package lacks browser or merchant grants', async () => {
    const bridge = await forwardRestaurantAgentDispatch(dispatch, {
      target: 'lobu',
      runtimeUrl: 'https://runtime.example/lobu',
      apiKey: 'secret-value',
      env: {},
    });

    expect(bridge.ok).toBe(false);
    expect(bridge.status).toBe('blocked');
    expect(bridge.message).toContain('execution package');
    expect(bridge.audit.canForward).toBe(false);
    expect(bridge.audit.blockedReasons?.join(' ')).toContain('商家授权状态');
  });

  it('forwards the full execution package when runtime browser callback and grant are configured', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetcher = (async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      return Response.json({ runId: 'lobu-run-1' }, { status: 202 });
    }) as typeof fetch;

    const bridge = await forwardRestaurantAgentDispatch(dispatch, {
      target: 'lobu',
      runtimeUrl: 'https://runtime.example/lobu',
      apiKey: 'secret-value',
      env: {
        RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'profile-1',
        RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret',
        RESTAURANT_AGENT_OPERATOR_APPROVAL: 'approved',
        RESTAURANT_DIANPING_AUTH_STATUS: 'authorized',
        RESTAURANT_AGENT_LOBU_RUNTIME_URL: 'https://runtime.example/lobu',
        RESTAURANT_AGENT_LOBU_API_KEY: 'secret-value',
        RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL: 'https://openclaw.example/tasks',
        RESTAURANT_AGENT_OPENCLAW_API_KEY: 'openclaw-secret',
      },
    }, fetcher);

    expect(bridge.ok).toBe(true);
    expect(bridge.status).toBe('forwarded');
    expect(bridge.endpoint).toBe('https://runtime.example/lobu/events');
    expect(bridge.externalRunId).toBe('lobu-run-1');
    expect(calls).toHaveLength(1);
    expect(calls[0].init?.headers).toEqual(expect.objectContaining({
      Authorization: 'Bearer secret-value',
      'Content-Type': 'application/json',
    }));
    const body = JSON.parse(String(calls[0].init?.body));
    expect(body.payloadShape).toBe('restaurant-agent-external-execution-v1');
    expect(body.dispatch.eventId).toBe(dispatch.eventId);
    expect(body.dispatch.workerPayload.blockedActions).toContain('external_platform_publish');
    expect(body.runtimeContract.callbackAction).toBe('external-receipt');
    expect(body.executionPolicy.blockedRuntimeActions).toContain('read_private_message');
    expect(String(calls[0].init?.body)).not.toContain('secret-value');
    expect(String(calls[0].init?.body)).not.toContain('profile-1');
    expect(bridge.audit.payloadShape).toBe('restaurant-agent-external-execution-v1');
    expect(bridge.audit.canForward).toBe(true);
  });
});

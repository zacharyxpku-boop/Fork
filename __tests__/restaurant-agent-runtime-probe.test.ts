import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';

describe('restaurant agent runtime probe', () => {
  it('reports missing runtime configuration without calling external endpoints', async () => {
    const calls: string[] = [];
    const probe = await buildRestaurantRuntimeProbe({
      env: {},
      fetcher: (async url => {
        calls.push(String(url));
        return Response.json({ ok: true });
      }) as typeof fetch,
      now: new Date('2026-05-23T00:00:00.000Z'),
    });

    expect(calls).toEqual([]);
    expect(probe.summary).toEqual(expect.objectContaining({
      ready: 0,
      missingConfig: 3,
      probed: 0,
      blockedExternal: 4,
    }));
    expect(probe.targets.map(target => target.status)).toEqual(['missing-config', 'missing-config', 'missing-config']);
    expect(probe.safetyBoundary).toContain('不返回 API key');
  });

  it('probes configured runtimes with redacted output and health-only headers', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const probe = await buildRestaurantRuntimeProbe({
      env: {
        RESTAURANT_AGENT_LOBU_RUNTIME_URL: 'https://lobu.example/runtime',
        RESTAURANT_AGENT_LOBU_API_KEY: 'lobu-secret',
        RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL: 'https://openclaw.example/tasks',
        RESTAURANT_AGENT_OPENCLAW_API_KEY: 'openclaw-secret',
        RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret-value',
        RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'profile-1',
        RESTAURANT_DIANPING_AUTH_STATUS: 'authorized',
        RESTAURANT_POS_DATA_MODE: 'csv',
        RESTAURANT_POS_FIELD_DICTIONARY: 'configured',
      },
      fetcher: (async (url, init) => {
        calls.push({ url: String(url), init });
        return Response.json({ ok: true }, { status: 200 });
      }) as typeof fetch,
      now: new Date('2026-05-23T00:00:00.000Z'),
    });

    expect(calls).toHaveLength(2);
    expect(calls.map(call => call.url)).toEqual([
      'https://lobu.example/runtime/health',
      'https://openclaw.example/tasks/health',
    ]);
    expect(calls[0].init?.headers).toEqual(expect.objectContaining({
      Authorization: 'Bearer lobu-secret',
      'x-restaurant-agent-probe': 'health-only',
    }));
    expect(probe.summary.ready).toBe(2);
    expect(probe.summary.missingConfig).toBe(1);
    expect(probe.summary.blockedExternal).toBe(0);
    expect(probe.targets.find(target => target.target === 'lobu')?.endpoint).toBe('https://lobu.example/runtime');
    expect(JSON.stringify(probe)).not.toContain('lobu-secret');
    expect(JSON.stringify(probe)).not.toContain('profile-1');
    expect(JSON.stringify(probe)).not.toContain('callback-secret-value');
  });

  it('marks configured but failing runtimes as unreachable', async () => {
    const probe = await buildRestaurantRuntimeProbe({
      env: {
        RESTAURANT_AGENT_HERMES_RUNTIME_URL: 'https://hermes.example/runs',
        RESTAURANT_AGENT_HERMES_API_KEY: 'hermes-secret',
      },
      fetcher: (async () => Response.json({ ok: false }, { status: 503 })) as typeof fetch,
      now: new Date('2026-05-23T00:00:00.000Z'),
    });

    expect(probe.summary.unreachable).toBe(1);
    expect(probe.targets.find(target => target.target === 'hermes')).toEqual(expect.objectContaining({
      status: 'unreachable',
      statusCode: 503,
    }));
  });

  it('exposes runtime probe through the runtime API', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({ action: 'runtime-probe' }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.runtimeProbe.ok).toBe(true);
    expect(payload.runtimeProbe.safetyBoundary).toContain('不登录平台');
    expect(JSON.stringify(payload.runtimeProbe)).not.toContain('API key=');
  });
});

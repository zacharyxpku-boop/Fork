import { describe, expect, it } from 'vitest';

import { buildRestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';

describe('restaurant agent external readiness', () => {
  it('blocks competitor-grade automation until runtime merchant auth and POS contracts exist', () => {
    const readiness = buildRestaurantExternalReadiness({});

    expect(readiness.summary.total).toBe(4);
    expect(readiness.summary.ready).toBe(0);
    expect(readiness.summary.blocked).toBe(4);
    expect(readiness.missingExternal.join(' ')).toContain('Lobu runtime URL');
    expect(readiness.safetyBoundary).toContain('不返回 API key');
  });

  it('marks only configured requirements without exposing secret values', () => {
    const readiness = buildRestaurantExternalReadiness({
      RESTAURANT_AGENT_LOBU_RUNTIME_URL: 'https://lobu.example/runtime',
      RESTAURANT_AGENT_LOBU_API_KEY: 'secret-value-that-must-not-leak',
      RESTAURANT_AGENT_TENANT_ISOLATION_POLICY: 'tenant-per-restaurant',
      RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret',
    });

    const lobu = readiness.groups.find(group => group.id === 'lobu-runtime');

    expect(lobu?.status).toBe('ready');
    expect(readiness.summary.ready).toBe(1);
    expect(JSON.stringify(readiness)).not.toContain('secret-value-that-must-not-leak');
    expect(lobu?.requirements.map(item => item.evidence)).toContain('RESTAURANT_AGENT_LOBU_API_KEY=configured');
  });
});

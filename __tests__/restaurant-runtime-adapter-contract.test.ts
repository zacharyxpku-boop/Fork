import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentExecutionPackage } from '@/lib/restaurant-agent-execution-package';
import { buildRestaurantRuntimeAdapterContract } from '@/lib/restaurant-runtime-adapter-contract';
import { buildRestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';

describe('restaurant runtime adapter contract', () => {
  it('documents Lobu OpenClaw Hermes submit response and callback expectations without secrets', async () => {
    const env = {
      RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL: 'https://openclaw.example/tasks',
      RESTAURANT_AGENT_OPENCLAW_API_KEY: 'openclaw-secret',
      RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'browser-profile-secret',
      RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret',
      RESTAURANT_AGENT_OPERATOR_APPROVAL: 'approved',
      RESTAURANT_DIANPING_AUTH_STATUS: 'authorized',
    };
    const fetcher = (async () => Response.json({ ok: true })) as typeof fetch;
    const runtimeProbe = await buildRestaurantRuntimeProbe({
      env,
      fetcher,
      now: new Date('2026-05-25T10:00:00.000Z'),
    });
    const executionPackage = buildRestaurantAgentExecutionPackage({
      target: 'openclaw',
      restaurant: 'Test Noodle Shop',
      offer: 'Dinner set',
      env,
      now: new Date('2026-05-25T10:01:00.000Z'),
    });
    const contract = buildRestaurantRuntimeAdapterContract({
      target: 'openclaw',
      executionPackage,
      runtimeProbe,
      now: new Date('2026-05-25T10:02:00.000Z'),
    });
    const serialized = JSON.stringify(contract);

    expect(contract.payloadShape).toBe('restaurant-runtime-adapter-contract-v1');
    expect(contract.verdict).toBe('adapter-ready');
    expect(contract.summary.canSubmitSandbox).toBe(true);
    expect(contract.summary.canClaimExternalAutomation).toBe(false);
    expect(contract.requestContract.authHeader).toContain('server-side-runtime-api-key');
    expect(contract.responseContract.runIdFields).toContain('runId');
    expect(contract.callbackContract.header).toBe('x-restaurant-agent-signature');
    expect(serialized).not.toContain('openclaw-secret');
    expect(serialized).not.toContain('browser-profile-secret');
    expect(serialized).not.toContain('callback-secret');
  });

  it('is exposed through the runtime API in blocked mode until provider config exists', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'runtime-adapter-contract',
        runtimeTarget: 'openclaw',
        restaurant: 'Test Noodle Shop',
        offer: 'Dinner set',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.runtimeAdapterContract.payloadShape).toBe('restaurant-runtime-adapter-contract-v1');
    expect(payload.runtimeAdapterContract.target).toBe('openclaw');
    expect(payload.runtimeAdapterContract.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.runtimeAdapterContract.externalRequired.length).toBeGreaterThan(0);
    expect(payload.executionPackage.payloadShape).toBe('restaurant-agent-external-execution-v1');
  });
});

import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';
import { buildRestaurantProviderSandboxContract } from '@/lib/restaurant-provider-sandbox-contract';
import { buildRestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import { buildRestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';
import { buildRestaurantTaskProviderHandoff } from '@/lib/restaurant-task-provider-handoff';
import { buildRestaurantStoreManagerTaskQueue, clearRestaurantStoreManagerTasksForTest, recordRestaurantStoreManagerTasks, updateRestaurantStoreManagerTaskStatus } from '@/lib/restaurant-store-manager-task-store';
import { clearRestaurantAgentReceiptsForTest } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest } from '@/lib/restaurant-agent-run-store';
import { clearRestaurantProviderSetupStateForTest, recordRestaurantProviderSetupState } from '@/lib/restaurant-provider-setup-state-store';

describe('restaurant provider readiness health', () => {
  beforeEach(() => {
    clearRestaurantProviderSetupStateForTest();
    clearRestaurantStoreManagerTasksForTest();
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
  });

  it('separates remembered setup evidence from live provider health', async () => {
    const state = recordRestaurantProviderSetupState({
      restaurant: '北城面馆',
      offer: '番茄牛腩面套餐',
      configuredEnvKeys: ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', 'RESTAURANT_AGENT_CALLBACK_SECRET'],
      merchantApprovals: ['merchant-platform-authorization:merchant-platform-login'],
      dataContracts: ['pos-coupon-and-redemption-data-contract:pos-field-dictionary'],
      now: new Date('2026-05-24T08:00:00.000Z'),
    }).summary;

    const calls: string[] = [];
    const health = await buildRestaurantProviderReadinessHealth({
      env: {},
      providerSetupState: state,
      fetcher: (async url => {
        calls.push(String(url));
        return Response.json({ ok: true });
      }) as typeof fetch,
      now: new Date('2026-05-24T08:01:00.000Z'),
    });

    expect(calls).toEqual([]);
    expect(health.payloadShape).toBe('restaurant-provider-readiness-health-v1');
    expect(health.summary.rememberedNotProbed).toBeGreaterThan(0);
    expect(health.summary.canEnableExternalAutomation).toBe(false);
    expect(health.items.find(item => item.id === 'runtime-openclaw')?.status).toBe('remembered-not-probed');
    expect(health.items.find(item => item.id === 'merchant-platform-authorization')?.status).toBe('merchant-auth-gated');
    expect(health.items.find(item => item.id === 'operating-data-contract')?.status).toBe('data-contract-gated');
    expect(JSON.stringify(health)).not.toContain('secret-value');
  });

  it('marks configured runtime failures as unreachable and keeps raw secrets out', async () => {
    const health = await buildRestaurantProviderReadinessHealth({
      env: {
        RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL: 'https://openclaw.example/runtime',
        RESTAURANT_AGENT_OPENCLAW_API_KEY: 'openclaw-secret-value',
        RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret-value',
        RESTAURANT_DIANPING_AUTH_STATUS: 'authorized',
        RESTAURANT_POS_DATA_MODE: 'csv',
        RESTAURANT_POS_FIELD_DICTIONARY: 'configured',
      },
      fetcher: (async () => Response.json({ ok: false }, { status: 502 })) as typeof fetch,
      now: new Date('2026-05-24T08:02:00.000Z'),
    });

    expect(health.items.find(item => item.id === 'runtime-openclaw')).toEqual(expect.objectContaining({
      status: 'configured-but-unreachable',
      statusCode: 502,
    }));
    expect(health.summary.configuredButUnreachable).toBe(1);
    expect(health.items.find(item => item.id === 'callback-secret')?.status).toBe('health-ready');
    expect(health.items.find(item => item.id === 'merchant-platform-authorization')?.status).toBe('health-ready');
    expect(health.items.find(item => item.id === 'operating-data-contract')?.status).toBe('health-ready');
    expect(JSON.stringify(health)).not.toContain('openclaw-secret-value');
    expect(JSON.stringify(health)).not.toContain('callback-secret-value');
  });

  it('is exposed through the runtime API', async () => {
    recordRestaurantProviderSetupState({
      restaurant: '北城面馆',
      offer: '番茄牛腩面套餐',
      configuredEnvKeys: ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL'],
      submittedBy: 'ops',
      now: new Date('2026-05-24T08:03:00.000Z'),
    });

    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'provider-readiness-health' }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.providerReadinessHealth.payloadShape).toBe('restaurant-provider-readiness-health-v1');
    expect(payload.providerSetupState.summary.records).toBeGreaterThanOrEqual(1);
    expect(payload.providerReadinessHealth.safetyBoundary).toContain('never returns API key values');
  });

  it('builds a sandbox acceptance contract from runtime health handoff and receipt inbox', async () => {
    const records = recordRestaurantStoreManagerTasks([{
      id: 'sandbox-provider-ready',
      owner: 'runtime-admin',
      priority: 'today',
      restaurant: 'Sandbox Bistro',
      offer: 'Dinner set',
      signal: 'setup-gap',
      action: 'Prepare provider sandbox handoff.',
      talkTrack: 'Internal task only.',
      evidenceRequired: 'public proof link or signed callback',
      dueWindow: 'today',
      stopLine: 'No external execution without merchant authorization.',
    }], new Date('2026-05-24T09:00:00.000Z'));
    updateRestaurantStoreManagerTaskStatus({
      taskMemoryId: records[0].taskMemoryId,
      status: 'ready-for-provider',
      now: new Date('2026-05-24T09:01:00.000Z'),
    });
    const env = {
      RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL: 'https://openclaw.example/runtime',
      RESTAURANT_AGENT_OPENCLAW_API_KEY: 'openclaw-secret-value',
      RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret-value',
      RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'browser-profile-secret',
      RESTAURANT_AGENT_OPERATOR_APPROVAL: 'approved',
      RESTAURANT_AGENT_GRANT_EXPIRES_AT: '2026-06-24T09:00:00.000Z',
      RESTAURANT_DIANPING_AUTH_STATUS: 'authorized',
      RESTAURANT_POS_DATA_MODE: 'csv',
      RESTAURANT_POS_FIELD_DICTIONARY: 'configured',
    };
    const runtimeProbe = await buildRestaurantRuntimeProbe({
      env,
      fetcher: (async () => Response.json({ ok: true })) as typeof fetch,
      now: new Date('2026-05-24T09:02:00.000Z'),
    });
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      env,
      fetcher: (async () => Response.json({ ok: true })) as typeof fetch,
      now: new Date('2026-05-24T09:03:00.000Z'),
    });
    const taskProviderHandoff = buildRestaurantTaskProviderHandoff({
      queue: buildRestaurantStoreManagerTaskQueue(new Date('2026-05-24T09:04:00.000Z')),
      target: 'openclaw',
      env,
      now: new Date('2026-05-24T09:05:00.000Z'),
    });
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({
      runs: [],
      receipts: [],
      now: new Date('2026-05-24T09:06:00.000Z'),
    });
    const contract = buildRestaurantProviderSandboxContract({
      runtimeProbe,
      providerReadinessHealth,
      taskProviderHandoff,
      providerReceiptInbox,
      now: new Date('2026-05-24T09:07:00.000Z'),
    });

    expect(contract.payloadShape).toBe('restaurant-provider-sandbox-contract-v1');
    expect(contract.summary.canRunSandbox).toBe(true);
    expect(contract.summary.canClaimAutomation).toBe(false);
    expect(contract.checks.find(item => item.id === 'runtime-health')?.status).toBe('passed');
    expect(contract.acceptanceContract.callbackRequires).toContain('x-restaurant-agent-signature');
    expect(contract.acceptanceContract.forbiddenInPayload).toContain('API keys');
    expect(JSON.stringify(contract)).not.toContain('openclaw-secret-value');
    expect(JSON.stringify(contract)).not.toContain('callback-secret-value');
    expect(JSON.stringify(contract)).not.toContain('browser-profile-secret');
  });

  it('exposes provider sandbox contract through the runtime API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'provider-sandbox-contract' }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.providerSandboxContract.payloadShape).toBe('restaurant-provider-sandbox-contract-v1');
    expect(payload.providerSandboxContract.acceptanceContract.forbiddenInPayload).toContain('tokens');
    expect(payload.providerSandboxContract.safetyBoundary).toContain('does not log in');
  });
});

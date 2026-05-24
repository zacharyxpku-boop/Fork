import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';
import { buildRestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import { buildRestaurantProviderSetupPack } from '@/lib/restaurant-provider-setup-pack';
import { buildRestaurantProviderSandboxContract } from '@/lib/restaurant-provider-sandbox-contract';
import { buildRestaurantProviderLaunchTrainingPack } from '@/lib/restaurant-provider-launch-training-pack';
import { buildRestaurantCapabilityTrainingPlan } from '@/lib/restaurant-capability-training';

describe('restaurant provider launch training pack', () => {
  it('combines training gaps provider keys and sandbox acceptance without leaking secret values', async () => {
    const secretEnv = {
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
      env: secretEnv,
      fetcher: (async () => Response.json({ ok: true })) as typeof fetch,
      now: new Date('2026-05-24T10:00:00.000Z'),
    });
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      env: secretEnv,
      fetcher: (async () => Response.json({ ok: true })) as typeof fetch,
      now: new Date('2026-05-24T10:01:00.000Z'),
    });
    const providerSetupPack = buildRestaurantProviderSetupPack({
      restaurant: 'Sandbox Bistro',
      offer: 'Dinner set',
      env: secretEnv,
      now: new Date('2026-05-24T10:02:00.000Z'),
    });
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlan({
      availableMaterials: ['门店资料', '菜单价格', '平台链接'],
      configuredProviders: ['POS 导出或 API', 'Runner URL'],
    });
    const providerSandboxContract = buildRestaurantProviderSandboxContract({
      runtimeProbe,
      providerReadinessHealth,
      now: new Date('2026-05-24T10:03:00.000Z'),
    });

    const pack = buildRestaurantProviderLaunchTrainingPack({
      capabilityTrainingPlan,
      providerSetupPack,
      providerReadinessHealth,
      runtimeProbe,
      providerSandboxContract,
      now: new Date('2026-05-24T10:04:00.000Z'),
    });

    expect(pack.payloadShape).toBe('restaurant-provider-launch-training-pack-v1');
    expect(pack.summary.tracks).toBe(5);
    expect(pack.tracks.map(item => item.id)).toContain('sandbox-submit-callback-receipt');
    expect(pack.providerKeyChecklist).toEqual(expect.arrayContaining([
      'RESTAURANT_AGENT_CALLBACK_SECRET',
      'RESTAURANT_AGENT_BROWSER_PROFILE_ID',
    ]));
    expect(pack.pilotAcceptance.join('\n')).toContain('governed provider package');
    expect(JSON.stringify(pack)).not.toContain('openclaw-secret-value');
    expect(JSON.stringify(pack)).not.toContain('callback-secret-value');
    expect(JSON.stringify(pack)).not.toContain('browser-profile-secret');
  });

  it('exposes the launch training pack through the runtime API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'provider-launch-training-pack',
        restaurant: '北城面馆',
        offer: '工作日双人套餐',
        runtimeTarget: 'openclaw',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.providerLaunchTrainingPack.payloadShape).toBe('restaurant-provider-launch-training-pack-v1');
    expect(payload.providerLaunchTrainingPack.tracks.map((item: { id: string }) => item.id)).toContain('runtime-provider-keys');
    expect(payload.providerLaunchTrainingPack.safetyBoundary).toContain('does not log in');
  });
});

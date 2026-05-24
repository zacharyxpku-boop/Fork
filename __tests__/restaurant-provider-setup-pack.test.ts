import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantProviderSetupPack } from '@/lib/restaurant-provider-setup-pack';

describe('restaurant provider setup pack', () => {
  it('turns runtime and merchant gates into owner-readable setup requests without secrets', () => {
    const pack = buildRestaurantProviderSetupPack({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      now: new Date('2026-05-23T08:00:00.000Z'),
      env: {
        RESTAURANT_AGENT_CALLBACK_SECRET: 'secret-value',
        RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'profile-a',
      },
    });

    expect(pack.payloadShape).toBe('restaurant-provider-setup-pack-v1');
    expect(pack.restaurant).toBe('North City Noodles');
    expect(pack.offer).toBe('Tomato beef noodle set');
    expect(pack.summary.ready).toBeGreaterThan(0);
    expect(pack.summary.missing).toBeGreaterThan(0);
    expect(pack.summary.readyForExternalExecution).toBe(false);
    expect(pack.envTemplate.map(item => item.key)).toEqual(expect.arrayContaining([
      'RESTAURANT_AGENT_LOBU_RUNTIME_URL',
      'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL',
      'RESTAURANT_AGENT_HERMES_RUNTIME_URL',
      'RESTAURANT_STAFF_WORKCHAT_WEBHOOK_URL',
      'RESTAURANT_STAFF_RECIPIENT_MAP',
    ]));
    expect(pack.merchantRequests.map(item => item.capability)).toEqual(expect.arrayContaining([
      'Merchant platform authorization',
      'POS, coupon and redemption data contract',
      'Staff notification delivery provider',
    ]));
    expect(pack.internalFallbacks.map(item => item.capability)).toEqual(expect.arrayContaining([
      '自动发布',
      '自动核销',
    ]));
    expect(JSON.stringify(pack)).not.toContain('secret-value');
    expect(JSON.stringify(pack)).not.toContain('profile-a');
    expect(pack.safetyBoundary).toContain('does not expose secret values');
  });

  it('serves the setup pack through the restaurant runtime API', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'provider-setup-pack',
        restaurant: '北城面馆',
        offer: '番茄牛腩面套餐',
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.providerSetupPack.payloadShape).toBe('restaurant-provider-setup-pack-v1');
    expect(payload.providerSetupPack.restaurant).toBe('北城面馆');
    expect(payload.providerSetupPack.offer).toBe('番茄牛腩面套餐');
    expect(payload.providerSetupPack.summary.blockedCapabilities).toBeGreaterThan(0);
    expect(payload.providerSetupPack.copyForMerchant.join(' ')).toContain('Wenai can run the internal work order');
  });
});

import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantProviderSetupWizard } from '@/lib/restaurant-provider-setup-wizard';

describe('restaurant provider setup wizard', () => {
  it('builds customer-fillable setup fields without exposing secrets', () => {
    const wizard = buildRestaurantProviderSetupWizard({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      env: {
        RESTAURANT_AGENT_CALLBACK_SECRET: 'secret-value',
        RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'profile-secret-value',
      },
      provided: {
        envKeys: ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL'],
      },
      now: new Date('2026-05-24T04:00:00.000Z'),
    });

    expect(wizard.payloadShape).toBe('restaurant-provider-setup-wizard-v1');
    expect(wizard.summary.fields).toBeGreaterThan(0);
    expect(wizard.summary.configured).toBeGreaterThan(0);
    expect(wizard.summary.missing).toBeGreaterThan(0);
    expect(wizard.sections.map(section => section.id)).toEqual(expect.arrayContaining([
      'runtime',
      'merchant-platforms',
      'staff-delivery',
      'operating-data',
    ]));
    expect(wizard.sections.flatMap(section => section.fields).map(field => field.inputType)).toEqual(expect.arrayContaining(['secret', 'url', 'checkbox']));
    expect(wizard.handoffPayload.configuredEnvKeys).toContain('RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL');
    expect(wizard.handoffPayload.missingEnvKeys).toContain('RESTAURANT_AGENT_LOBU_RUNTIME_URL');
    expect(JSON.stringify(wizard)).not.toContain('secret-value');
    expect(JSON.stringify(wizard)).not.toContain('profile-secret-value');
    expect(wizard.safetyBoundary).toContain('never returns secret values');
  });

  it('accepts provided configured states without storing raw provider values', () => {
    const wizard = buildRestaurantProviderSetupWizard({
      provided: {
        envKeys: ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', 'RESTAURANT_AGENT_CALLBACK_SECRET'],
        merchantApprovals: ['merchant-platform-authorization:merchant-platform-login'],
        dataContracts: ['pos-coupon-and-redemption-data-contract:pos-field-dictionary'],
      },
    });

    expect(wizard.summary.configured).toBeGreaterThan(0);
    expect(wizard.handoffPayload.configuredEnvKeys).toEqual(expect.arrayContaining([
      'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL',
      'RESTAURANT_AGENT_CALLBACK_SECRET',
    ]));
    expect(JSON.stringify(wizard)).not.toContain('sk-');
    expect(wizard.handoffPayload.nextActions.length).toBeGreaterThan(0);
  });

  it('is exposed through the restaurant runtime API', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'provider-setup-wizard',
        restaurant: '北城面馆',
        offer: '番茄牛腩面套餐',
        provided: {
          envKeys: ['RESTAURANT_AGENT_CALLBACK_SECRET'],
        },
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.providerSetupWizard.payloadShape).toBe('restaurant-provider-setup-wizard-v1');
    expect(payload.providerSetupWizard.restaurant).toBe('北城面馆');
    expect(payload.providerSetupWizard.offer).toBe('番茄牛腩面套餐');
    expect(payload.providerSetupWizard.summary.fields).toBeGreaterThan(0);
  });
});

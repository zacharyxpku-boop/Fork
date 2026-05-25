import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentCommandCenter } from '@/lib/restaurant-agent-command-center';
import { buildRestaurantExternalUnlockRequestPack } from '@/lib/restaurant-external-unlock-request-pack';
import {
  buildRestaurantProviderSetupStateSummary,
  clearRestaurantProviderSetupStateForTest,
  recordRestaurantProviderSetupState,
} from '@/lib/restaurant-provider-setup-state-store';

describe('restaurant provider setup state store', () => {
  beforeEach(() => {
    clearRestaurantProviderSetupStateForTest();
  });

  afterEach(() => {
    clearRestaurantProviderSetupStateForTest();
  });

  it('persists sanitized configured setup state without storing secret values', () => {
    const result = recordRestaurantProviderSetupState({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      configuredEnvKeys: ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', 'sk-should-not-store'],
      merchantApprovals: ['merchant-platform-authorization:merchant-platform-login'],
      dataContracts: ['pos-coupon-and-redemption-data-contract:pos-field-dictionary'],
      notes: ['callback secret configured server-side', 'phone 13800138000 should not store'],
      submittedBy: 'ops',
      now: new Date('2026-05-24T05:00:00.000Z'),
    });

    expect(result.record.configuredEnvKeys).toContain('RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL');
    expect(JSON.stringify(result)).not.toContain('sk-should-not-store');
    expect(JSON.stringify(result)).not.toContain('13800138000');

    const summary = buildRestaurantProviderSetupStateSummary(new Date('2026-05-24T05:01:00.000Z'));
    expect(summary.summary.records).toBeGreaterThanOrEqual(1);
    expect(summary.provided.envKeys).toContain('RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL');
    expect(summary.provided.merchantApprovals).toContain('merchant-platform-authorization:merchant-platform-login');
    expect(summary.provided.dataContracts).toContain('pos-coupon-and-redemption-data-contract:pos-field-dictionary');
    expect(summary.safetyBoundary).toContain('Secret values');
  });

  it('feeds remembered setup state into the command center provider setup wizard', async () => {
    recordRestaurantProviderSetupState({
      configuredEnvKeys: ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', 'RESTAURANT_AGENT_CALLBACK_SECRET'],
      merchantApprovals: ['merchant-platform-authorization:merchant-platform-login'],
      dataContracts: ['pos-coupon-and-redemption-data-contract:pos-field-dictionary'],
      now: new Date('2026-05-24T05:02:00.000Z'),
    });

    const center = await buildRestaurantAgentCommandCenter({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      now: new Date('2026-05-24T05:03:00.000Z'),
    });

    expect(center.providerSetupState.summary.records).toBeGreaterThanOrEqual(1);
    expect(center.providerSetupWizard.handoffPayload.configuredEnvKeys).toEqual(expect.arrayContaining([
      'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL',
      'RESTAURANT_AGENT_CALLBACK_SECRET',
    ]));
    expect(center.providerSetupWizard.summary.configured).toBeGreaterThan(0);
  });

  it('records setup state through the runtime API and returns an updated wizard', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'provider-setup-state-record',
        restaurant: '北城面馆',
        offer: '番茄牛腩面套餐',
        configuredEnvKeys: ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL'],
        merchantApprovals: ['merchant-platform-authorization:merchant-platform-login'],
        dataContracts: ['pos-coupon-and-redemption-data-contract:pos-field-dictionary'],
        notes: ['server-side secret configured'],
        submittedBy: 'ops',
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.providerSetupStateRecord.restaurant).toBe('北城面馆');
    expect(payload.providerSetupState.summary.records).toBe(1);
    expect(payload.providerSetupWizard.payloadShape).toBe('restaurant-provider-setup-wizard-v1');
    expect(payload.providerSetupWizard.summary.configured).toBeGreaterThan(0);
    expect(payload.providerReadinessHealth.payloadShape).toBe('restaurant-provider-readiness-health-v1');
  });

  it('turns external unlock signoff projection into wizard-recognized setup state', async () => {
    const pack = buildRestaurantExternalUnlockRequestPack({
      restaurant: 'Signoff Bistro',
      offer: 'Dinner launch set',
      now: new Date('2026-05-24T06:00:00.000Z'),
    });

    const result = recordRestaurantProviderSetupState({
      restaurant: pack.restaurant,
      offer: pack.offer,
      configuredEnvKeys: pack.setupStateProjection.configuredEnvKeys,
      merchantApprovals: pack.setupStateProjection.merchantApprovals,
      dataContracts: pack.setupStateProjection.dataContracts,
      notes: pack.setupStateProjection.notes,
      submittedBy: 'ops',
      now: new Date('2026-05-24T06:01:00.000Z'),
    });

    const center = await buildRestaurantAgentCommandCenter({
      restaurant: pack.restaurant,
      offer: pack.offer,
      now: new Date('2026-05-24T06:02:00.000Z'),
    });

    expect(result.record.notes).toContain('source:external-unlock-request-pack');
    expect(center.providerSetupState.provided.envKeys).toEqual(expect.arrayContaining(pack.setupStateProjection.configuredEnvKeys.slice(0, 2)));
    expect(center.providerSetupWizard.summary.configured).toBeGreaterThan(0);
    expect(center.providerSetupWizard.handoffPayload.configuredEnvKeys).toEqual(expect.arrayContaining(pack.setupStateProjection.configuredEnvKeys.slice(0, 2)));
  });
});

import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantExternalExecutionWizard } from '@/lib/restaurant-external-execution-wizard';

describe('restaurant external execution wizard', () => {
  it('combines provider setup, runtime probe, execution package and fallback into one decision chain', async () => {
    const wizard = await buildRestaurantExternalExecutionWizard({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      target: 'openclaw',
      requestedAction: 'capture_public_receipt',
      now: new Date('2026-05-23T08:00:00.000Z'),
      env: {},
    });

    expect(wizard.payloadShape).toBe('restaurant-external-execution-wizard-v1');
    expect(wizard.verdict).toBe('setup-required');
    expect(wizard.canForward).toBe(false);
    expect(wizard.summary.steps).toBe(5);
    expect(wizard.summary.blockedSteps).toBeGreaterThan(0);
    expect(wizard.steps.map(step => step.id)).toEqual([
      'provider-setup',
      'merchant-grant',
      'runtime-probe',
      'execution-package',
      'manual-fallback',
    ]);
    expect(wizard.providerSetupPack.envTemplate.map(item => item.key)).toContain('RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL');
    expect(wizard.runtimeProbe.summary.missingConfig).toBeGreaterThan(0);
    expect(wizard.executionPackage.canForward).toBe(false);
    expect(wizard.operatorScript.join(' ')).toContain('manual handoff');
    expect(wizard.safetyBoundary).toContain('does not forward runs');
  });

  it('becomes ready only when runtime, callback, browser profile, merchant auth and POS gates are configured', async () => {
    const wizard = await buildRestaurantExternalExecutionWizard({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      target: 'openclaw',
      requestedAction: 'capture_public_receipt',
      now: new Date('2026-05-23T08:00:00.000Z'),
      env: {
        RESTAURANT_AGENT_LOBU_RUNTIME_URL: 'https://lobu.example/runtime',
        RESTAURANT_AGENT_LOBU_API_KEY: 'lobu-secret',
        RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL: 'https://openclaw.example/runtime',
        RESTAURANT_AGENT_OPENCLAW_API_KEY: 'openclaw-secret',
        RESTAURANT_AGENT_HERMES_RUNTIME_URL: 'https://hermes.example/runtime',
        RESTAURANT_AGENT_HERMES_API_KEY: 'hermes-secret',
        RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret',
        RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'profile-secret',
        RESTAURANT_AGENT_TENANT_SCOPE: 'tenant-scope-secret',
        RESTAURANT_DIANPING_AUTH_STATUS: 'authorized',
        RESTAURANT_SOCIAL_AUTH_STATUS: 'authorized',
        RESTAURANT_AGENT_OPERATOR_APPROVAL: 'approved',
        RESTAURANT_POS_DATA_MODE: 'csv',
        RESTAURANT_POS_FIELD_DICTIONARY: 'field-dictionary-secret',
        RESTAURANT_STAFF_WORKCHAT_WEBHOOK_URL: 'https://staff.example/webhook',
        RESTAURANT_STAFF_RECIPIENT_MAP: 'recipient-map-secret',
        RESTAURANT_STAFF_NOTIFY_APPROVAL: 'approved',
      },
      fetcher: (async () => new Response(JSON.stringify({ ok: true }), { status: 200 })) as typeof fetch,
    });

    expect(wizard.verdict).toBe('ready-to-forward');
    expect(wizard.canForward).toBe(true);
    expect(wizard.summary.blockedSteps).toBe(0);
    expect(wizard.executionPackage.status).toBe('ready-to-forward');
    expect(wizard.runtimeProbe.summary.ready).toBe(3);
    expect(JSON.stringify(wizard)).not.toContain('openclaw-secret');
    expect(JSON.stringify(wizard)).not.toContain('profile-secret');
  });

  it('serves the wizard through the restaurant runtime API', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'external-execution-wizard',
        runtimeTarget: 'openclaw',
        requestedAction: 'capture_public_receipt',
        restaurant: '北城面馆',
        offer: '番茄牛腩面套餐',
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.externalExecutionWizard.payloadShape).toBe('restaurant-external-execution-wizard-v1');
    expect(payload.externalExecutionWizard.restaurant).toBe('北城面馆');
    expect(payload.externalExecutionWizard.offer).toBe('番茄牛腩面套餐');
    expect(payload.externalExecutionWizard.verdict).toBe('setup-required');
    expect(payload.externalExecutionWizard.steps.map((step: { id: string }) => step.id)).toContain('manual-fallback');
  });
});

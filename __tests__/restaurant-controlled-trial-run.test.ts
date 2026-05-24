import { afterEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { clearRestaurantAgentReceiptsForTest } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest } from '@/lib/restaurant-agent-run-store';
import { runRestaurantControlledTrialRun } from '@/lib/restaurant-controlled-trial-run';

describe('restaurant controlled trial run', () => {
  afterEach(() => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
  });

  it('runs a local signed callback loop after the execution wizard without claiming real provider execution', async () => {
    const report = await runRestaurantControlledTrialRun({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      target: 'openclaw',
      signalType: 'visit-intent',
      visitIntentCount: 6,
      now: new Date('2026-05-23T08:00:00.000Z'),
      env: {},
    });

    expect(report.payloadShape).toBe('restaurant-controlled-trial-run-v1');
    expect(report.mode).toBe('local-simulator');
    expect(report.verdict).toBe('simulated-accepted');
    expect(report.canForwardExternally).toBe(false);
    expect(report.wizard.verdict).toBe('setup-required');
    expect(report.simulation.callback.signatureVerified).toBe(true);
    expect(report.simulation.receipt.status).toBe('accepted');
    expect(report.runHealth.summary.accepted).toBe(1);
    expect(report.businessSignals.summary.visitIntent).toBe(6);
    expect(report.operatorCloseout.map(item => item.owner)).toEqual(expect.arrayContaining([
      '运营负责人',
      'runtime-admin',
      'store-manager',
    ]));
    expect(report.externalRequired.join(' ')).toContain('RESTAURANT_AGENT');
    expect(report.safetyBoundary).toContain('does not publish');
  });

  it('marks the trial as external-ready when all execution gates are configured and probe succeeds', async () => {
    const report = await runRestaurantControlledTrialRun({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      target: 'openclaw',
      signalType: 'reservation',
      reservationCount: 4,
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
      },
      fetcher: (async () => new Response(JSON.stringify({ ok: true }), { status: 200 })) as typeof fetch,
    });

    expect(report.mode).toBe('external-ready');
    expect(report.verdict).toBe('external-ready');
    expect(report.canForwardExternally).toBe(true);
    expect(report.wizard.canForward).toBe(true);
    expect(report.businessSignals.summary.reservations).toBe(4);
    expect(JSON.stringify(report)).not.toContain('openclaw-secret');
    expect(JSON.stringify(report)).not.toContain('profile-secret');
  });

  it('serves the controlled run through the restaurant runtime API', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'controlled-trial-run',
        runtimeTarget: 'openclaw',
        restaurant: '北城面馆',
        offer: '番茄牛腩面套餐',
        signalType: 'visit-intent',
        visitIntentCount: 5,
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.controlledTrialRun.payloadShape).toBe('restaurant-controlled-trial-run-v1');
    expect(payload.controlledTrialRun.restaurant).toBe('北城面馆');
    expect(payload.controlledTrialRun.offer).toBe('番茄牛腩面套餐');
    expect(payload.controlledTrialRun.simulation.receipt.status).toBe('accepted');
    expect(payload.controlledTrialRun.businessSignals.summary.visitIntent).toBe(5);
  });
});

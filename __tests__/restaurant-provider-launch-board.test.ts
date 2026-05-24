import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import {
  buildRestaurantCapabilityTrainingPlanFromLedger,
  clearRestaurantCapabilityTrainingRecordsForTest,
} from '@/lib/restaurant-capability-training';
import { buildRestaurantCustomerDemandGateway } from '@/lib/restaurant-customer-demand-gateway';
import { buildRestaurantProviderLaunchBoard } from '@/lib/restaurant-provider-launch-board';
import { buildRestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import {
  buildRestaurantProviderSetupStateSummary,
  clearRestaurantProviderSetupStateForTest,
  recordRestaurantProviderSetupState,
} from '@/lib/restaurant-provider-setup-state-store';
import { buildRestaurantVoiceOrderConsole } from '@/lib/restaurant-voice-order-console';

describe('restaurant provider launch board', () => {
  beforeEach(() => {
    clearRestaurantCapabilityTrainingRecordsForTest();
    clearRestaurantProviderSetupStateForTest();
  });

  it('separates internal work from missing providers without claiming external automation', async () => {
    const providerSetupState = buildRestaurantProviderSetupStateSummary(new Date('2026-05-24T13:00:00.000Z'));
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
      now: new Date('2026-05-24T13:01:00.000Z'),
    });
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger();
    const customerDemandGateway = buildRestaurantCustomerDemandGateway({
      restaurant: 'Launch Bistro',
      offer: 'Weekend set',
      capabilityTrainingPlan,
      providerSetupState,
      now: new Date('2026-05-24T13:02:00.000Z'),
    });
    const voiceOrderConsole = buildRestaurantVoiceOrderConsole({
      restaurant: 'Launch Bistro',
      offer: 'Weekend set',
      customerDemandGateway,
      providerSetupState,
      now: new Date('2026-05-24T13:03:00.000Z'),
    });

    const board = buildRestaurantProviderLaunchBoard({
      restaurant: 'Launch Bistro',
      offer: 'Weekend set',
      providerSetupState,
      providerReadinessHealth,
      customerDemandGateway,
      voiceOrderConsole,
      now: new Date('2026-05-24T13:04:00.000Z'),
    });

    expect(board.payloadShape).toBe('restaurant-provider-launch-board-v1');
    expect(board.summary.capabilities).toBe(8);
    expect(board.summary.missingProvider).toBeGreaterThanOrEqual(6);
    expect(board.summary.forbiddenInClient).toBe(1);
    expect(board.summary.canClaimExternalAutomation).toBe(false);
    expect(board.capabilities.find(item => item.id === 'private-customer-data')?.status).toBe('forbidden-in-client');
    expect(board.externalRequired.join(' ')).toContain('RESTAURANT_AGENT_CALLBACK_SECRET');
    expect(board.safetyBoundary).toContain('not a secret store');
  });

  it('uses remembered setup as setup evidence only and never leaks secret values', async () => {
    recordRestaurantProviderSetupState({
      restaurant: 'Launch Bistro',
      offer: 'Weekend set',
      configuredEnvKeys: [
        'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL',
        'RESTAURANT_AGENT_OPENCLAW_API_KEY',
        'RESTAURANT_AGENT_CALLBACK_SECRET',
        'POS_ORDER_API_URL',
      ],
      merchantApprovals: ['merchant platform authorization', 'call forwarding approval'],
      dataContracts: ['aggregate POS/coupon/member export cadence', 'menu item ids'],
      submittedBy: 'runtime-admin',
      now: new Date('2026-05-24T13:05:00.000Z'),
    });
    const providerSetupState = buildRestaurantProviderSetupStateSummary(new Date('2026-05-24T13:06:00.000Z'));
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
      now: new Date('2026-05-24T13:07:00.000Z'),
    });
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger();
    const customerDemandGateway = buildRestaurantCustomerDemandGateway({
      restaurant: 'Launch Bistro',
      offer: 'Weekend set',
      capabilityTrainingPlan,
      providerSetupState,
      now: new Date('2026-05-24T13:08:00.000Z'),
    });
    const voiceOrderConsole = buildRestaurantVoiceOrderConsole({
      restaurant: 'Launch Bistro',
      offer: 'Weekend set',
      customerDemandGateway,
      providerSetupState,
      now: new Date('2026-05-24T13:09:00.000Z'),
    });

    const board = buildRestaurantProviderLaunchBoard({
      restaurant: 'Launch Bistro',
      offer: 'Weekend set',
      providerSetupState,
      providerReadinessHealth,
      customerDemandGateway,
      voiceOrderConsole,
      now: new Date('2026-05-24T13:10:00.000Z'),
    });
    const serialized = JSON.stringify(board);

    expect(board.summary.setupRecorded).toBeGreaterThan(0);
    expect(board.summary.canClaimExternalAutomation).toBe(false);
    expect(board.capabilities.find(item => item.id === 'public-platform-proof')?.status).toBe('setup-recorded');
    expect(serialized).not.toContain('secret-value');
    expect(serialized).not.toContain('13800000000');
    expect(serialized).not.toContain('wx-openid-value');
  });

  it('exposes the launch board through the runtime API and redacts sensitive command text', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'provider-launch-board',
        command: 'Call customer 13800000000, auto redeem coupon and publish to Dianping now.',
        restaurant: 'API Bistro',
        offer: 'Late dinner set',
      }),
    }));
    const payload = await response.json();
    const serialized = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(payload.providerLaunchBoard.payloadShape).toBe('restaurant-provider-launch-board-v1');
    expect(payload.commandRoute.command).toBe('[redacted-sensitive-command]');
    expect(payload.providerLaunchBoard.summary.canClaimExternalAutomation).toBe(false);
    expect(serialized).not.toContain('13800000000');
    expect(payload.providerLaunchBoard.safetyBoundary).toContain('It never returns API key values');
  });
});

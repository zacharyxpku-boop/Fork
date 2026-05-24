import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import {
  buildRestaurantCapabilityTrainingPlanFromLedger,
  clearRestaurantCapabilityTrainingRecordsForTest,
} from '@/lib/restaurant-capability-training';
import { buildRestaurantCustomerDemandGateway } from '@/lib/restaurant-customer-demand-gateway';
import {
  buildRestaurantProviderSetupStateSummary,
  clearRestaurantProviderSetupStateForTest,
  recordRestaurantProviderSetupState,
} from '@/lib/restaurant-provider-setup-state-store';
import { buildRestaurantVoiceOrderConsole } from '@/lib/restaurant-voice-order-console';

describe('restaurant voice order console', () => {
  beforeEach(() => {
    clearRestaurantCapabilityTrainingRecordsForTest();
    clearRestaurantProviderSetupStateForTest();
  });

  it('builds an audit-safe front-desk console without live call or POS claims', () => {
    const providerSetupState = buildRestaurantProviderSetupStateSummary(new Date('2026-05-24T12:00:00.000Z'));
    const trainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger();
    const customerDemandGateway = buildRestaurantCustomerDemandGateway({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      audience: 'nearby dinner guests',
      visitReason: 'arrive before 19:30 without waiting',
      capabilityTrainingPlan: trainingPlan,
      providerSetupState,
      now: new Date('2026-05-24T12:01:00.000Z'),
    });
    const consolePack = buildRestaurantVoiceOrderConsole({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      audience: 'nearby dinner guests',
      visitReason: 'arrive before 19:30 without waiting',
      customerDemandGateway,
      providerSetupState,
      now: new Date('2026-05-24T12:02:00.000Z'),
    });

    expect(consolePack.payloadShape).toBe('restaurant-voice-order-console-v1');
    expect(consolePack.summary.canAnswerCallsNow).toBe(false);
    expect(consolePack.summary.canWriteOrdersNow).toBe(false);
    expect(consolePack.summary.canTakePaymentNow).toBe(false);
    expect(consolePack.summary.canDispatchDeliveryNow).toBe(false);
    expect(consolePack.orderDrafts[0].status).toBe('provider-gated');
    expect(consolePack.syncGates.find(item => item.id === 'private-customer-data')?.status).toBe('forbidden-in-client');
    expect(consolePack.safetyBoundary).toContain('does not answer live calls');
  });

  it('shows provider-labeled readiness only after setup state is remembered', () => {
    recordRestaurantProviderSetupState({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      configuredEnvKeys: ['VOICE_PROVIDER_URL', 'POS_ORDER_API_URL', 'PAYMENT_PROVIDER_URL', 'DELIVERY_PROVIDER_URL'],
      merchantApprovals: ['call forwarding approval', 'POS order write approval', 'delivery dispatch approval'],
      dataContracts: ['menu item mapping', 'test order receipt', 'signed payment callback', 'dispatch receipt'],
      submittedBy: 'runtime-admin',
      now: new Date('2026-05-24T12:03:00.000Z'),
    });
    const providerSetupState = buildRestaurantProviderSetupStateSummary(new Date('2026-05-24T12:04:00.000Z'));
    const basePlan = buildRestaurantCapabilityTrainingPlanFromLedger();
    const trainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger({
      availableMaterials: basePlan.items.flatMap(item => item.trainingMaterials),
      configuredProviders: basePlan.items.flatMap(item => item.externalProviders),
    });
    const customerDemandGateway = buildRestaurantCustomerDemandGateway({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      capabilityTrainingPlan: trainingPlan,
      providerSetupState,
      now: new Date('2026-05-24T12:05:00.000Z'),
    });
    const consolePack = buildRestaurantVoiceOrderConsole({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      customerDemandGateway,
      providerSetupState,
      now: new Date('2026-05-24T12:06:00.000Z'),
    });

    expect(consolePack.summary.canWriteOrdersNow).toBe(true);
    expect(consolePack.summary.canTakePaymentNow).toBe(true);
    expect(consolePack.summary.canDispatchDeliveryNow).toBe(true);
    expect(consolePack.syncGates.filter(item => item.status === 'ready-by-label').length).toBeGreaterThanOrEqual(4);
    expect(JSON.stringify(consolePack)).not.toContain('VOICE_PROVIDER_URL=');
    expect(JSON.stringify(consolePack)).not.toContain('customer phone');
  });

  it('is exposed through the runtime API and redacts sensitive command text', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'voice-order-console',
        command: 'Answer the call from 13800000000 and charge payment automatically.',
        restaurant: 'API Noodle',
        offer: 'Dinner set',
      }),
    }));
    const payload = await response.json();
    const serialized = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(payload.voiceOrderConsole.payloadShape).toBe('restaurant-voice-order-console-v1');
    expect(payload.commandRoute.command).toBe('[redacted-sensitive-command]');
    expect(serialized).not.toContain('13800000000');
    expect(payload.voiceOrderConsole.safetyBoundary).toContain('does not answer live calls');
  });
});

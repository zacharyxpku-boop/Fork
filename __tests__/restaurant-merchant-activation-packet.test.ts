import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantMerchantActivationPacket } from '@/lib/restaurant-merchant-activation-packet';
import { buildRestaurantProviderLaunchBoard } from '@/lib/restaurant-provider-launch-board';
import { buildRestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import { buildRestaurantProviderSetupStateSummary } from '@/lib/restaurant-provider-setup-state-store';
import { buildRestaurantProviderSetupWizard } from '@/lib/restaurant-provider-setup-wizard';
import { buildRestaurantProviderUnlockLadder } from '@/lib/restaurant-provider-unlock-ladder';
import { buildRestaurantCapabilityTrainingPlan } from '@/lib/restaurant-capability-training';
import { buildRestaurantCustomerDemandGateway } from '@/lib/restaurant-customer-demand-gateway';
import { buildRestaurantVoiceOrderConsole } from '@/lib/restaurant-voice-order-console';

describe('restaurant merchant activation packet', () => {
  it('turns provider launch readiness into a safe merchant-facing implementation request', async () => {
    const providerSetupState = buildRestaurantProviderSetupStateSummary(new Date('2026-05-25T08:00:00.000Z'));
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
      now: new Date('2026-05-25T08:01:00.000Z'),
    });
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlan();
    const customerDemandGateway = buildRestaurantCustomerDemandGateway({
      restaurant: 'Test Noodle Shop',
      offer: 'Dinner set',
      capabilityTrainingPlan,
      providerSetupState,
    });
    const voiceOrderConsole = buildRestaurantVoiceOrderConsole({
      restaurant: 'Test Noodle Shop',
      offer: 'Dinner set',
      customerDemandGateway,
      providerSetupState,
    });
    const providerLaunchBoard = buildRestaurantProviderLaunchBoard({
      restaurant: 'Test Noodle Shop',
      offer: 'Dinner set',
      providerSetupState,
      providerReadinessHealth,
      customerDemandGateway,
      voiceOrderConsole,
      now: new Date('2026-05-25T08:02:00.000Z'),
    });
    const providerSetupWizard = buildRestaurantProviderSetupWizard({
      restaurant: 'Test Noodle Shop',
      offer: 'Dinner set',
      provided: providerSetupState.provided,
      now: new Date('2026-05-25T08:03:00.000Z'),
    });
    const providerUnlockLadder = buildRestaurantProviderUnlockLadder({
      setupState: providerSetupState,
      health: providerReadinessHealth,
    });
    const packet = buildRestaurantMerchantActivationPacket({
      providerLaunchBoard,
      providerSetupWizard,
      providerUnlockLadder,
      now: new Date('2026-05-25T08:04:00.000Z'),
    });
    const serialized = JSON.stringify(packet);

    expect(packet.payloadShape).toBe('restaurant-merchant-activation-packet-v1');
    expect(packet.verdict).toBe('merchant-setup-required');
    expect(packet.summary.providerKeys).toBeGreaterThan(0);
    expect(packet.summary.merchantApprovals).toBeGreaterThan(0);
    expect(packet.summary.dataContracts).toBeGreaterThan(0);
    expect(packet.summary.canClaimExternalAutomation).toBe(false);
    expect(packet.nextAskForUser).toContain('Provide setup evidence');
    expect(packet.safetyBoundary).toContain('not a secret store');
    expect(serialized).toContain('RESTAURANT_AGENT_OPENCLAW_API_KEY');
    expect(serialized).not.toContain('sk-test-secret');
    expect(serialized).not.toContain('cookie=');
  });

  it('is exposed through the runtime API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'merchant-activation-packet',
        restaurant: 'Test Noodle Shop',
        offer: 'Dinner set',
        audience: 'nearby dinner guests',
        channels: 'Dianping / Xiaohongshu / Douyin / WeChat group',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.merchantActivationPacket.payloadShape).toBe('restaurant-merchant-activation-packet-v1');
    expect(payload.merchantActivationPacket.providerKeyChecklist.length).toBeGreaterThan(0);
    expect(payload.merchantActivationPacket.doNotSend.join(' ')).toContain('API key values');
    expect(payload.providerLaunchBoard.payloadShape).toBe('restaurant-provider-launch-board-v1');
    expect(payload.providerSetupWizard.payloadShape).toBe('restaurant-provider-setup-wizard-v1');
    expect(payload.providerUnlockLadder.payloadShape).toBe('restaurant-provider-unlock-ladder-v1');
  });
});

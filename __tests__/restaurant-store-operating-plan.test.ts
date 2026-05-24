import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import {
  buildRestaurantCapabilityTrainingPlanFromLedger,
  clearRestaurantCapabilityTrainingRecordsForTest,
} from '@/lib/restaurant-capability-training';
import { buildRestaurantCommandRoute } from '@/lib/restaurant-command-router';
import { buildRestaurantAiConsultantCopilot } from '@/lib/restaurant-ai-consultant-copilot';
import { buildRestaurantCustomerDemandGateway } from '@/lib/restaurant-customer-demand-gateway';
import { buildRestaurantDayZeroMissionPack } from '@/lib/restaurant-day-zero-mission-pack';
import { buildRestaurantProviderLaunchBoard } from '@/lib/restaurant-provider-launch-board';
import { buildRestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import {
  buildRestaurantProviderSetupStateSummary,
  clearRestaurantProviderSetupStateForTest,
} from '@/lib/restaurant-provider-setup-state-store';
import { buildRestaurantStoreOperatingPlan } from '@/lib/restaurant-store-operating-plan';
import { buildRestaurantVoiceOrderConsole } from '@/lib/restaurant-voice-order-console';

async function buildBase(command = 'Build today operating plan for dinner traffic and closeout review.') {
  const providerSetupState = buildRestaurantProviderSetupStateSummary(new Date('2026-05-24T15:00:00.000Z'));
  const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
    providerSetupState,
    now: new Date('2026-05-24T15:01:00.000Z'),
  });
  const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger();
  const commandRoute = buildRestaurantCommandRoute({
    command,
    restaurant: 'Plan Bistro',
    offer: 'Dinner combo',
  });
  const customerDemandGateway = buildRestaurantCustomerDemandGateway({
    restaurant: 'Plan Bistro',
    offer: 'Dinner combo',
    commandRoute,
    capabilityTrainingPlan,
    providerSetupState,
    now: new Date('2026-05-24T15:02:00.000Z'),
  });
  const voiceOrderConsole = buildRestaurantVoiceOrderConsole({
    restaurant: 'Plan Bistro',
    offer: 'Dinner combo',
    customerDemandGateway,
    providerSetupState,
    now: new Date('2026-05-24T15:03:00.000Z'),
  });
  const providerLaunchBoard = buildRestaurantProviderLaunchBoard({
    restaurant: 'Plan Bistro',
    offer: 'Dinner combo',
    providerSetupState,
    providerReadinessHealth,
    customerDemandGateway,
    voiceOrderConsole,
    now: new Date('2026-05-24T15:04:00.000Z'),
  });
  const aiConsultantCopilot = buildRestaurantAiConsultantCopilot({
    restaurant: 'Plan Bistro',
    offer: 'Dinner combo',
    commandRoute,
    customerDemandGateway,
    voiceOrderConsole,
    providerLaunchBoard,
    now: new Date('2026-05-24T15:05:00.000Z'),
  });
  const dayZeroMissionPack = buildRestaurantDayZeroMissionPack({
    restaurant: 'Plan Bistro',
    offer: 'Dinner combo',
    visitReason: 'tonight dinner traffic',
    now: new Date('2026-05-24T15:06:00.000Z'),
  });
  return { aiConsultantCopilot, customerDemandGateway, voiceOrderConsole, providerLaunchBoard, dayZeroMissionPack };
}

describe('restaurant store operating plan', () => {
  beforeEach(() => {
    clearRestaurantCapabilityTrainingRecordsForTest();
    clearRestaurantProviderSetupStateForTest();
  });

  it('turns consultant advice into a time-windowed store plan without automation claims', async () => {
    const base = await buildBase();
    const plan = buildRestaurantStoreOperatingPlan({
      restaurant: 'Plan Bistro',
      offer: 'Dinner combo',
      ...base,
      now: new Date('2026-05-24T15:07:00.000Z'),
    });

    expect(plan.payloadShape).toBe('restaurant-store-operating-plan-v1');
    expect(plan.summary.timeBlocks).toBe(10);
    expect(plan.dayPlan.map(item => item.id)).toEqual(expect.arrayContaining([
      'opening-brief',
      'content-proof',
      'dinner-traffic',
      'closeout-review',
    ]));
    expect(plan.summary.canRunTodayInternally).toBe(true);
    expect(plan.summary.canClaimAutomation).toBe(false);
    expect(plan.providerUnlocks).toContain('RESTAURANT_AGENT_CALLBACK_SECRET');
    expect(plan.safetyBoundary).toContain('does not auto-publish');
  });

  it('keeps the plan useful while leaving provider-gated lanes explicit', async () => {
    const base = await buildBase();
    const plan = buildRestaurantStoreOperatingPlan({
      restaurant: 'Plan Bistro',
      offer: 'Dinner combo',
      ...base,
      now: new Date('2026-05-24T15:08:00.000Z'),
    });

    expect(plan.dayPlan.find(item => item.id === 'opening-brief')?.status).toBe('needs-merchant-evidence');
    expect(plan.dayPlan.find(item => item.id === 'front-desk-order')?.status).toBe('provider-gated');
    expect(plan.managerStandup.join(' ')).toContain('Anything involving auto-publish');
    expect(plan.evidenceBoard.join(' ')).toContain('merchant-approved offer brief');
  });

  it('is exposed through the runtime API and redacts sensitive command text', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'store-operating-plan',
        command: 'Call 13800000000, export chats and auto redeem coupons during dinner.',
        restaurant: 'API Plan Bistro',
        offer: 'Late dinner combo',
      }),
    }));
    const payload = await response.json();
    const serialized = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(payload.storeOperatingPlan.payloadShape).toBe('restaurant-store-operating-plan-v1');
    expect(payload.commandRoute.command).toBe('[redacted-sensitive-command]');
    expect(payload.storeOperatingPlan.summary.canClaimAutomation).toBe(false);
    expect(serialized).not.toContain('13800000000');
    expect(payload.storeOperatingPlan.safetyBoundary).toContain('does not auto-publish');
  });
});

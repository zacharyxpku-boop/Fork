import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import {
  buildRestaurantCapabilityTrainingPlanFromLedger,
  clearRestaurantCapabilityTrainingRecordsForTest,
} from '@/lib/restaurant-capability-training';
import { buildRestaurantCommandRoute } from '@/lib/restaurant-command-router';
import { buildRestaurantAiCockpit } from '@/lib/restaurant-ai-cockpit';
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

async function buildBase(command = 'Build the restaurant AI cockpit for dinner service and provider launch.') {
  const providerSetupState = buildRestaurantProviderSetupStateSummary(new Date('2026-05-24T16:00:00.000Z'));
  const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
    providerSetupState,
    now: new Date('2026-05-24T16:01:00.000Z'),
  });
  const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger();
  const commandRoute = buildRestaurantCommandRoute({
    command,
    restaurant: 'Cockpit Bistro',
    offer: 'Dinner combo',
  });
  const customerDemandGateway = buildRestaurantCustomerDemandGateway({
    restaurant: 'Cockpit Bistro',
    offer: 'Dinner combo',
    commandRoute,
    capabilityTrainingPlan,
    providerSetupState,
    now: new Date('2026-05-24T16:02:00.000Z'),
  });
  const voiceOrderConsole = buildRestaurantVoiceOrderConsole({
    restaurant: 'Cockpit Bistro',
    offer: 'Dinner combo',
    customerDemandGateway,
    providerSetupState,
    now: new Date('2026-05-24T16:03:00.000Z'),
  });
  const providerLaunchBoard = buildRestaurantProviderLaunchBoard({
    restaurant: 'Cockpit Bistro',
    offer: 'Dinner combo',
    providerSetupState,
    providerReadinessHealth,
    customerDemandGateway,
    voiceOrderConsole,
    now: new Date('2026-05-24T16:04:00.000Z'),
  });
  const aiConsultantCopilot = buildRestaurantAiConsultantCopilot({
    restaurant: 'Cockpit Bistro',
    offer: 'Dinner combo',
    commandRoute,
    customerDemandGateway,
    voiceOrderConsole,
    providerLaunchBoard,
    now: new Date('2026-05-24T16:05:00.000Z'),
  });
  const dayZeroMissionPack = buildRestaurantDayZeroMissionPack({
    restaurant: 'Cockpit Bistro',
    offer: 'Dinner combo',
    visitReason: 'dinner service',
    now: new Date('2026-05-24T16:06:00.000Z'),
  });
  const storeOperatingPlan = buildRestaurantStoreOperatingPlan({
    restaurant: 'Cockpit Bistro',
    offer: 'Dinner combo',
    aiConsultantCopilot,
    customerDemandGateway,
    voiceOrderConsole,
    providerLaunchBoard,
    dayZeroMissionPack,
    now: new Date('2026-05-24T16:07:00.000Z'),
  });
  return { storeOperatingPlan, aiConsultantCopilot, providerLaunchBoard };
}

describe('restaurant AI cockpit', () => {
  beforeEach(() => {
    clearRestaurantCapabilityTrainingRecordsForTest();
    clearRestaurantProviderSetupStateForTest();
  });

  it('organizes restaurant capabilities into four operator zones', async () => {
    const base = await buildBase();
    const cockpit = buildRestaurantAiCockpit({
      ...base,
      now: new Date('2026-05-24T16:08:00.000Z'),
    });

    expect(cockpit.payloadShape).toBe('restaurant-ai-cockpit-v1');
    expect(cockpit.zones.map(item => item.id)).toEqual([
      'today-operations',
      'ai-consultant',
      'automation-launch',
      'evidence-review',
    ]);
    expect(cockpit.summary.zones).toBe(4);
    expect(cockpit.summary.canClaimAutomation).toBe(false);
    expect(cockpit.zones.find(item => item.id === 'automation-launch')?.status).toBe('provider-gated');
    expect(cockpit.providerUnlocks).toContain('RESTAURANT_AGENT_CALLBACK_SECRET');
    expect(cockpit.safetyBoundary).toContain('does not log in');
  });

  it('exposes the cockpit through the runtime API and redacts sensitive command text', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ai-cockpit',
        command: 'Call 13800000000 and auto publish all platforms tonight.',
        restaurant: 'API Cockpit Bistro',
        offer: 'Late dinner combo',
      }),
    }));
    const payload = await response.json();
    const serialized = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(payload.aiCockpit.payloadShape).toBe('restaurant-ai-cockpit-v1');
    expect(payload.aiCockpit.zones).toHaveLength(4);
    expect(payload.commandRoute.command).toBe('[redacted-sensitive-command]');
    expect(payload.aiCockpit.summary.canClaimAutomation).toBe(false);
    expect(serialized).not.toContain('13800000000');
  });
});

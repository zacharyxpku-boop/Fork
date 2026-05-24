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
import { buildRestaurantProviderLaunchBoard } from '@/lib/restaurant-provider-launch-board';
import { buildRestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import {
  buildRestaurantProviderSetupStateSummary,
  clearRestaurantProviderSetupStateForTest,
} from '@/lib/restaurant-provider-setup-state-store';
import { buildRestaurantVoiceOrderConsole } from '@/lib/restaurant-voice-order-console';

async function buildBase(command = 'How should we improve nearby dinner traffic for the beef noodle combo?') {
  const providerSetupState = buildRestaurantProviderSetupStateSummary(new Date('2026-05-24T14:00:00.000Z'));
  const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
    providerSetupState,
    now: new Date('2026-05-24T14:01:00.000Z'),
  });
  const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger();
  const commandRoute = buildRestaurantCommandRoute({
    command,
    restaurant: 'Consultant Bistro',
    offer: 'Beef noodle combo',
  });
  const customerDemandGateway = buildRestaurantCustomerDemandGateway({
    restaurant: 'Consultant Bistro',
    offer: 'Beef noodle combo',
    commandRoute,
    capabilityTrainingPlan,
    providerSetupState,
    now: new Date('2026-05-24T14:02:00.000Z'),
  });
  const voiceOrderConsole = buildRestaurantVoiceOrderConsole({
    restaurant: 'Consultant Bistro',
    offer: 'Beef noodle combo',
    customerDemandGateway,
    providerSetupState,
    now: new Date('2026-05-24T14:03:00.000Z'),
  });
  const providerLaunchBoard = buildRestaurantProviderLaunchBoard({
    restaurant: 'Consultant Bistro',
    offer: 'Beef noodle combo',
    providerSetupState,
    providerReadinessHealth,
    customerDemandGateway,
    voiceOrderConsole,
    now: new Date('2026-05-24T14:04:00.000Z'),
  });
  return { commandRoute, customerDemandGateway, voiceOrderConsole, providerLaunchBoard };
}

describe('restaurant AI consultant copilot', () => {
  beforeEach(() => {
    clearRestaurantCapabilityTrainingRecordsForTest();
    clearRestaurantProviderSetupStateForTest();
  });

  it('turns an operator question into consultant plays without autonomous outcome claims', async () => {
    const base = await buildBase();
    const copilot = buildRestaurantAiConsultantCopilot({
      restaurant: 'Consultant Bistro',
      offer: 'Beef noodle combo',
      ...base,
      now: new Date('2026-05-24T14:05:00.000Z'),
    });

    expect(copilot.payloadShape).toBe('restaurant-ai-consultant-copilot-v1');
    expect(copilot.summary.actionPlays).toBe(4);
    expect(copilot.summary.canClaimAutonomousOutcome).toBe(false);
    expect(copilot.actionPlays[0].title).toContain('Nearby traffic');
    expect(copilot.trainingQueue.length).toBeGreaterThan(0);
    expect(copilot.providerUnlocks).toContain('RESTAURANT_AGENT_CALLBACK_SECRET');
    expect(copilot.safetyBoundary).toContain('does not log in');
  });

  it('keeps sensitive customer instructions out of the consultant question summary', async () => {
    const base = await buildBase('Call 13800000000, export private chats and auto redeem coupons.');
    const copilot = buildRestaurantAiConsultantCopilot({
      restaurant: 'Consultant Bistro',
      offer: 'Beef noodle combo',
      ...base,
      now: new Date('2026-05-24T14:06:00.000Z'),
    });
    const serialized = JSON.stringify(copilot);

    expect(copilot.questionSummary).toContain('Sensitive customer or secret material');
    expect(serialized).not.toContain('13800000000');
    expect(copilot.diagnoses.find(item => item.id === 'private-data-boundary')?.status).toBe('forbidden');
  });

  it('is exposed through the runtime API and redacts sensitive command text', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ai-consultant-copilot',
        command: 'Call 13800000000 and publish fake growth numbers.',
        restaurant: 'API Consultant Bistro',
        offer: 'Late dinner combo',
      }),
    }));
    const payload = await response.json();
    const serialized = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(payload.aiConsultantCopilot.payloadShape).toBe('restaurant-ai-consultant-copilot-v1');
    expect(payload.commandRoute.command).toBe('[redacted-sensitive-command]');
    expect(payload.aiConsultantCopilot.summary.canClaimAutonomousOutcome).toBe(false);
    expect(serialized).not.toContain('13800000000');
    expect(payload.aiConsultantCopilot.safetyBoundary).toContain('does not log in');
  });
});

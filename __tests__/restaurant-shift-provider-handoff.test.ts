import { beforeEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantShiftProviderHandoff } from '@/lib/restaurant-shift-provider-handoff';
import { clearRestaurantShiftAutopilotRunsForTest, type RestaurantShiftAutopilotRunRecord } from '@/lib/restaurant-shift-autopilot-run-store';
import { clearRestaurantStoreManagerTasksForTest } from '@/lib/restaurant-store-manager-task-store';

function sampleShiftRun(): RestaurantShiftAutopilotRunRecord {
  return {
    ok: true,
    payloadShape: 'restaurant-shift-autopilot-run-v1',
    runId: 'shift-run-provider-test',
    restaurant: 'North City Noodles',
    offer: 'Tomato beef noodle set',
    startedAt: '2026-05-25T10:00:00.000Z',
    completedAt: '2026-05-25T10:00:00.000Z',
    summary: {
      dueSteps: 2,
      acceptedInternalActions: 1,
      preparedManualActions: 0,
      providerHeldActions: 1,
      evidenceHeldActions: 1,
      createdStoreManagerTasks: 2,
      canClaimExternalAutomation: false,
    },
    acceptedInternalActions: [],
    preparedManualActions: [],
    providerHeldActions: [
      {
        stepId: 'shift-publish-proof',
        laneId: 'publish-proof',
        title: 'Publish and proof',
        owner: 'ops',
        mode: 'wait-provider',
        action: 'Hold external execution; prepare manual package.',
        proofRequired: ['posted link or screenshot id'],
        providerRequired: ['merchant platform authorization', 'callback secret'],
        status: 'waiting-provider',
        stopLine: 'No auto-publish claim before Provider health is ready.',
      },
    ],
    evidenceHeldActions: [
      {
        stepId: 'shift-closeout',
        laneId: 'closeout',
        title: 'Closeout and next loop',
        owner: 'finance',
        mode: 'collect-evidence',
        action: 'Collect sanitized POS/coupon/member aggregate.',
        proofRequired: ['sanitized POS aggregate', 'field dictionary'],
        providerRequired: [],
        status: 'waiting-evidence',
        stopLine: 'No operating-analysis claim without accepted data proof.',
      },
    ],
    evidenceLedger: [
      {
        stepId: 'shift-publish-proof',
        title: 'Publish and proof',
        owner: 'ops',
        required: ['merchant platform authorization', 'callback secret'],
        status: 'provider-required',
      },
    ],
    nextStoreManagerTasks: [],
    externalRequired: ['merchant platform authorization', 'callback secret'],
    safetyBoundary: 'Shift Autopilot Run records internal planning and owner tasks only.',
  };
}

describe('restaurant shift provider handoff', () => {
  beforeEach(() => {
    clearRestaurantShiftAutopilotRunsForTest();
    clearRestaurantStoreManagerTasksForTest();
  });

  it('exports exact provider asks from recorded Shift Autopilot runs without storing secrets', async () => {
    const handoff = buildRestaurantShiftProviderHandoff({
      shiftRuns: [sampleShiftRun()],
      now: new Date('2026-05-25T10:30:00.000Z'),
    });

    expect(handoff.payloadShape).toBe('restaurant-shift-provider-handoff-v1');
    expect(handoff.summary.shiftRuns).toBe(1);
    expect(handoff.summary.requests).toBeGreaterThan(0);
    expect(handoff.summary.canClaimExternalAutomation).toBe(false);
    expect(handoff.providerEnvKeys.join('\n')).toContain('RESTAURANT_AGENT_CALLBACK_SECRET');
    expect(handoff.merchantApprovals.join('\n')).toContain('merchant');
    expect(handoff.exportDigest.markdown).toContain('Shift Provider Handoff');
    expect(handoff.safetyBoundary).toContain('does not store API key values');
    expect(JSON.stringify(handoff)).not.toContain('sk-live-secret');
    expect(JSON.stringify(handoff)).not.toContain('cookie=');
  });

  it('is exposed through the runtime API after a shift run exists', async () => {
    await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'shift-autopilot-run',
        restaurant: 'North City Noodles',
        offer: 'Tomato beef noodle set',
      }),
    }) as never);

    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({ action: 'shift-provider-handoff' }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.shiftProviderHandoff.payloadShape).toBe('restaurant-shift-provider-handoff-v1');
    expect(payload.shiftProviderHandoff.summary.p0).toBeGreaterThan(0);
    expect(payload.shiftProviderHandoff.nextAction).toContain('Provider Health');
    expect(payload.providerReadinessHealth.payloadShape).toBe('restaurant-provider-readiness-health-v1');
  });

  it('returns an empty handoff before any shift run is recorded', () => {
    const handoff = buildRestaurantShiftProviderHandoff({ shiftRuns: [] });

    expect(handoff.summary.requests).toBe(0);
    expect(handoff.nextAction).toContain('Run Shift Autopilot first');
  });
});

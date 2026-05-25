import { beforeEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantShiftProviderHandoff } from '@/lib/restaurant-shift-provider-handoff';
import { buildRestaurantShiftSandboxAcceptance } from '@/lib/restaurant-shift-sandbox-acceptance';
import type { RestaurantShiftAutopilotRunRecord } from '@/lib/restaurant-shift-autopilot-run-store';
import { clearRestaurantShiftAutopilotRunsForTest } from '@/lib/restaurant-shift-autopilot-run-store';
import { clearRestaurantStoreManagerTasksForTest } from '@/lib/restaurant-store-manager-task-store';

function sampleShiftRun(): RestaurantShiftAutopilotRunRecord {
  return {
    ok: true,
    payloadShape: 'restaurant-shift-autopilot-run-v1',
    runId: 'shift-run-sandbox-test',
    restaurant: 'North City Noodles',
    offer: 'Tomato beef noodle set',
    startedAt: '2026-05-25T10:00:00.000Z',
    completedAt: '2026-05-25T10:00:00.000Z',
    summary: { dueSteps: 1, acceptedInternalActions: 0, preparedManualActions: 0, providerHeldActions: 1, evidenceHeldActions: 0, createdStoreManagerTasks: 1, canClaimExternalAutomation: false },
    acceptedInternalActions: [],
    preparedManualActions: [],
    providerHeldActions: [{
      stepId: 'shift-publish-proof',
      laneId: 'publish-proof',
      title: 'Publish and proof',
      owner: 'ops',
      mode: 'wait-provider',
      action: 'Hold external execution.',
      proofRequired: ['posted link or screenshot id'],
      providerRequired: ['merchant platform authorization', 'callback secret', 'OpenClaw runtime URL and API key'],
      status: 'waiting-provider',
      stopLine: 'No auto-publish claim before Provider health is ready.',
    }],
    evidenceHeldActions: [],
    evidenceLedger: [{ stepId: 'shift-publish-proof', title: 'Publish and proof', owner: 'ops', required: ['merchant platform authorization', 'callback secret'], status: 'provider-required' }],
    nextStoreManagerTasks: [],
    externalRequired: ['merchant platform authorization', 'callback secret'],
    safetyBoundary: 'internal only',
  };
}

describe('restaurant shift sandbox acceptance', () => {
  beforeEach(() => {
    clearRestaurantShiftAutopilotRunsForTest();
    clearRestaurantStoreManagerTasksForTest();
  });

  it('turns shift provider asks into sandbox acceptance stages without claiming automation', () => {
    const handoff = buildRestaurantShiftProviderHandoff({
      shiftRuns: [sampleShiftRun()],
      now: new Date('2026-05-25T10:30:00.000Z'),
    });
    const acceptance = buildRestaurantShiftSandboxAcceptance({
      shiftProviderHandoff: handoff,
      now: new Date('2026-05-25T10:31:00.000Z'),
    });

    expect(acceptance.payloadShape).toBe('restaurant-shift-sandbox-acceptance-v1');
    expect(acceptance.summary.providerRequests).toBeGreaterThan(0);
    expect(acceptance.summary.canClaimExternalAutomation).toBe(false);
    expect(acceptance.stages.map(stage => stage.id)).toEqual([
      'handoff-built',
      'p0-owner-assigned',
      'runtime-health',
      'callback-signature',
      'merchant-data-gates',
      'receipt-contract',
    ]);
    expect(acceptance.submitContract.callbackHeader).toBe('x-restaurant-agent-signature');
    expect(acceptance.submitContract.forbiddenFields).toContain('API key values');
    expect(acceptance.safetyBoundary).toContain('does not submit provider runs');
    expect(JSON.stringify(acceptance)).not.toContain('sk-live-secret');
  });

  it('is exposed through the runtime API', async () => {
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
      body: JSON.stringify({ action: 'shift-sandbox-acceptance' }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.shiftSandboxAcceptance.payloadShape).toBe('restaurant-shift-sandbox-acceptance-v1');
    expect(payload.shiftSandboxAcceptance.submitContract.callbackAction).toBe('external-receipt');
    expect(payload.providerSandboxContract.payloadShape).toBe('restaurant-provider-sandbox-contract-v1');
  });
});

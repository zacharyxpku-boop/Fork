import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantClawExperienceDefaultPath } from '@/lib/restaurant-claw-experience-default-path';

describe('restaurant claw experience default path', () => {
  it('combines route decision, skill workbench, trial workflow and activation gates into one default path', async () => {
    const path = await buildRestaurantClawExperienceDefaultPath({
      restaurant: 'Default Path Bistro',
      offer: 'Two-person dinner set',
      audience: 'nearby dinner guests',
      channels: 'Dianping / Xiaohongshu / WeChat group',
      visitReason: 'reserve tonight without waiting',
      now: new Date('2026-05-25T17:20:00.000Z'),
    });

    expect(path.payloadShape).toBe('restaurant-claw-experience-default-path-v1');
    expect(path.mode).toBe('internal-first-provider-gated');
    expect(path.summary.steps).toBe(7);
    expect(path.summary.readyNow).toBeGreaterThan(0);
    expect(path.summary.trainingNeeded).toBeGreaterThan(0);
    expect(path.summary.providerGated).toBeGreaterThan(0);
    expect(path.summary.canRunTodayWithoutProvider).toBe(true);
    expect(path.summary.canClaimExternalAutomation).toBe(false);
    expect(path.primaryPath.map(step => step.id)).toEqual([
      'route',
      'brief',
      'skill-pack',
      'training',
      'controlled-run',
      'provider-unlock',
      'automation-boundary',
    ]);
    expect(path.quickActions.map(action => action.action)).toContain('claw-skill-workbench');
    expect(path.routeDecision.finalTarget).toBe('platform-spine-plus-claw-experience-plus-restaurant-data-contracts');
    expect(path.skillWorkbench.summary.runnableNow).toBeGreaterThan(0);
    expect(path.trialWorkflow.summary.canAutoExecuteExternally).toBe(false);
    expect(path.providerNeeded.length).toBeGreaterThan(0);
    expect(path.safetyBoundary).toContain('does not log in');
  });

  it('is exposed through the runtime API without claiming external automation', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claw-experience-default-path',
        restaurant: 'API Default Bistro',
        offer: 'Late dinner set',
      }),
    }));
    const payload = await response.json();
    const serialized = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(payload.clawExperienceDefaultPath.payloadShape).toBe('restaurant-claw-experience-default-path-v1');
    expect(payload.clawExperienceDefaultPath.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.clawExperienceDefaultPath.routeDecision.providerKeyChecklist).toContain('RESTAURANT_AGENT_CALLBACK_SECRET');
    expect(payload.clawSkillWorkbench.payloadShape).toBe('restaurant-claw-skill-workbench-v1');
    expect(payload.clawSkillExecutionRecord.payloadShape).toBe('restaurant-claw-skill-execution-record-v1');
    expect(payload.storeManagerTaskQueue.payloadShape).toBe('restaurant-store-manager-task-queue-v1');
    expect(payload.staffNotificationHandoff.payloadShape).toBe('restaurant-staff-notification-handoff-v1');
    expect(payload.providerSetupPack.payloadShape).toBe('restaurant-provider-setup-pack-v1');
    expect(payload.externalUnlockRequestPack.payloadShape).toBe('restaurant-external-unlock-request-pack-v1');
    expect(payload.providerSetupPack.summary.readyForExternalExecution).toBe(false);
    expect(payload.externalUnlockRequestPack.summary.canClaimExternalAutomation).toBe(false);
    expect(serialized).not.toContain('secret-value');
    expect(serialized).not.toContain('cookie-value');
    expect(serialized).not.toContain('token-value');
  });
});

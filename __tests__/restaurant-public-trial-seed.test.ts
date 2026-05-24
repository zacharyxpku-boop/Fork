import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantPublicTrialSeed } from '@/lib/restaurant-public-trial-seed';

describe('restaurant public trial seed', () => {
  it('converts public store context into a controlled trial workflow input', () => {
    const seed = buildRestaurantPublicTrialSeed({
      sampleId: 'osm-node-600243400',
      suggestedOffer: 'weekday lunch set',
      now: new Date('2026-05-24T12:00:00.000Z'),
    });
    const serialized = JSON.stringify(seed);

    expect(seed.payloadShape).toBe('restaurant-public-trial-seed-v1');
    expect(seed.trialIntake.restaurant).toBeTruthy();
    expect(seed.trialIntake.offer).toBeTruthy();
    expect(seed.publicSourceHarvestPack.payloadShape).toBe('restaurant-public-source-harvest-pack-v1');
    expect(seed.trialWorkflowPack.payloadShape).toBe('restaurant-trial-workflow-pack');
    expect(seed.summary.workflowReadySteps).toBeGreaterThan(0);
    expect(seed.normalizedEvidence.map(item => item.field)).toContain('source_url');
    expect(seed.nextActions.map(item => item.owner)).toContain('merchant');
    expect(seed.externalRequired.length).toBeGreaterThan(0);
    expect(seed.safetyBoundary).toContain('does not log in');
    expect(seed.safetyBoundary).toContain('merchant authorization');
    expect(serialized).not.toContain('sk-');
    expect(serialized).not.toContain('token=');
  });

  it('exposes public trial seed through the runtime API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'public-trial-seed',
        sampleId: 'osm-node-600243400',
        suggestedOffer: 'Dinner set',
        suggestedAudience: 'Nearby dinner guests',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.publicTrialSeed.payloadShape).toBe('restaurant-public-trial-seed-v1');
    expect(payload.publicTrialSeed.trialIntake.offer).toBeTruthy();
    expect(payload.publicTrialSeed.trialWorkflowPack.summary.steps).toBeGreaterThan(0);
    expect(payload.publicTrialSeed.safetyBoundary).toContain('does not log in');
  });
});

import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantCompetitorTrainingBlueprint } from '@/lib/restaurant-competitor-training-blueprint';

describe('restaurant competitor training blueprint', () => {
  it('turns competitor parity into trainable internal backlog, provider contracts and acceptance gates', async () => {
    const blueprint = await buildRestaurantCompetitorTrainingBlueprint({
      restaurant: 'South City Bistro',
      offer: 'Dinner set',
      channels: 'Dianping / Xiaohongshu / Douyin',
      now: new Date('2026-05-25T15:00:00.000Z'),
    });

    expect(blueprint.payloadShape).toBe('restaurant-competitor-training-blueprint-v1');
    expect(blueprint.restaurant).toBe('South City Bistro');
    expect(blueprint.summary.dimensions).toBeGreaterThanOrEqual(6);
    expect(blueprint.summary.trainableNow).toBeGreaterThan(0);
    expect(blueprint.summary.providerContracts).toBeGreaterThan(0);
    expect(blueprint.summary.acceptanceGates).toBeGreaterThan(0);
    expect(blueprint.summary.canClaimCompetitorParity).toBe(false);
    expect(blueprint.internalTrainingBacklog[0]).toEqual(expect.objectContaining({
      capabilityId: expect.any(String),
      material: expect.any(String),
      reason: expect.any(String),
    }));
    expect(blueprint.providerContractBacklog[0]).toEqual(expect.objectContaining({
      capabilityId: expect.any(String),
      provider: expect.any(String),
      unlocks: expect.any(String),
    }));
    expect(blueprint.lanes.map(lane => lane.currentStatus)).toContain('external-required');
    expect(blueprint.lanes.flatMap(lane => lane.acceptanceEvidence)).toContain('accepted receipt');
    expect(blueprint.externalRequired.length).toBeGreaterThan(0);
    expect(blueprint.safetyBoundary).toContain('does not claim full');
  });

  it('exposes the blueprint through the runtime API without enabling fake auto outcomes', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'competitor-training-blueprint',
        restaurant: 'South City Bistro',
        offer: 'Dinner set',
        audience: 'Nearby dinner guests',
        channels: 'Dianping / Xiaohongshu',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.competitorTrainingBlueprint.payloadShape).toBe('restaurant-competitor-training-blueprint-v1');
    expect(payload.competitorTrainingBlueprint.summary.canClaimCompetitorParity).toBe(false);
    expect(payload.competitorTrainingBlueprint.missionControl.summary.canClaimAutonomousOutcomes).toBe(false);
    expect(JSON.stringify(payload)).not.toContain('secret-value');
  });
});

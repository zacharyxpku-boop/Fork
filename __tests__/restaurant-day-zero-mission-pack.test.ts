import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantDayZeroMissionPack } from '@/lib/restaurant-day-zero-mission-pack';

describe('restaurant day zero mission pack', () => {
  it('turns a public trial seed into owner missions without claiming external execution', () => {
    const pack = buildRestaurantDayZeroMissionPack({
      sampleId: 'osm-node-600243400',
      offer: 'weekday lunch set',
      audience: 'nearby office diners',
      now: new Date('2026-05-24T12:00:00.000Z'),
    });
    const serialized = JSON.stringify(pack);

    expect(pack.payloadShape).toBe('restaurant-day-zero-mission-pack-v1');
    expect(pack.trialSeed.payloadShape).toBe('restaurant-public-trial-seed-v1');
    expect(pack.summary.missions).toBe(7);
    expect(pack.summary.readyInternal).toBeGreaterThan(0);
    expect(pack.summary.needsMerchantEvidence).toBeGreaterThan(0);
    expect(pack.summary.externalGated).toBeGreaterThan(0);
    expect(pack.missions.map(item => item.lane)).toEqual(expect.arrayContaining([
      'brief',
      'content',
      'publish-proof',
      'lead-followup',
      'operating-data',
      'runtime',
    ]));
    expect(pack.storeManagerChecklist.length).toBeGreaterThan(0);
    expect(pack.evidenceImportFields.join(' ')).toContain('source_url');
    expect(pack.providerUnlocks.length).toBeGreaterThan(0);
    expect(pack.safetyBoundary).toContain('does not auto-publish');
    expect(pack.safetyBoundary).toContain('merchant authorization');
    expect(serialized).not.toContain('sk-');
    expect(serialized).not.toContain('token=');
    expect(serialized).not.toContain('cookie=');
  });

  it('exposes day zero mission pack through the runtime API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'day-zero-mission-pack',
        sampleId: 'osm-node-600243400',
        offer: 'Dinner set',
        audience: 'Nearby dinner guests',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.dayZeroMissionPack.payloadShape).toBe('restaurant-day-zero-mission-pack-v1');
    expect(payload.dayZeroMissionPack.summary.missions).toBe(7);
    expect(payload.dayZeroMissionPack.missions[0]).toEqual(expect.objectContaining({
      owner: expect.any(String),
      evidenceRequired: expect.any(String),
      nextAction: expect.any(String),
    }));
    expect(payload.dayZeroMissionPack.safetyBoundary).toContain('does not auto-publish');
  });
});

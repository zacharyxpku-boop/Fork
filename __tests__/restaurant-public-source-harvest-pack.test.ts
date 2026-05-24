import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantPublicIntelligenceBrief } from '@/lib/restaurant-public-intelligence-brief';
import { buildRestaurantPublicProfileIntake } from '@/lib/restaurant-public-profile-intake';
import { buildRestaurantPublicSourceHarvestPack } from '@/lib/restaurant-public-source-harvest-pack';

describe('restaurant public source harvest pack', () => {
  it('turns public profile and intelligence brief into governed public collection targets', () => {
    const publicProfile = buildRestaurantPublicProfileIntake({
      sampleId: 'osm-node-600243400',
      suggestedOffer: 'weekday lunch set',
    });
    const publicIntelligenceBrief = buildRestaurantPublicIntelligenceBrief({ publicProfile });
    const pack = buildRestaurantPublicSourceHarvestPack({
      publicProfile,
      publicIntelligenceBrief,
      now: new Date('2026-05-24T11:00:00.000Z'),
    });

    expect(pack.payloadShape).toBe('restaurant-public-source-harvest-pack-v1');
    expect(pack.targets.map(item => item.id)).toEqual(expect.arrayContaining([
      'poi-identity',
      'dianping-meituan-proof',
      'xiaohongshu-local-content',
      'douyin-short-video',
      'wechat-community-followup',
    ]));
    expect(pack.normalizedImportTemplate.map(item => item.field)).toContain('source_url');
    expect(pack.browserRunnerInstructions.join('\n')).toContain('never capture cookies');
    expect(pack.safetyBoundary).toContain('does not bypass logins');
  });

  it('exposes public source harvest pack through the runtime API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'public-source-harvest-pack',
        sampleId: 'osm-node-600243400',
        suggestedOffer: '工作日双人套餐',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.publicSourceHarvestPack.payloadShape).toBe('restaurant-public-source-harvest-pack-v1');
    expect(payload.publicSourceHarvestPack.targets.length).toBeGreaterThanOrEqual(5);
    expect(payload.publicIntelligenceBrief.payloadShape).toBe('restaurant-public-intelligence-brief-v1');
  });
});

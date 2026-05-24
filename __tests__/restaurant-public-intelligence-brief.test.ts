import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { RESTAURANT_PUBLIC_SAMPLES } from '@/lib/restaurant-public-data';
import { buildRestaurantPublicIntelligenceBrief } from '@/lib/restaurant-public-intelligence-brief';
import { buildRestaurantPublicProfileIntake } from '@/lib/restaurant-public-profile-intake';

describe('restaurant public intelligence brief', () => {
  it('turns public profile intake into platform-specific next actions and external gates', () => {
    const publicProfile = buildRestaurantPublicProfileIntake({ sampleId: RESTAURANT_PUBLIC_SAMPLES[0].id });
    const brief = buildRestaurantPublicIntelligenceBrief({
      publicProfile,
      now: new Date('2026-05-24T03:00:00.000Z'),
    });

    expect(brief.payloadShape).toBe('restaurant-public-intelligence-brief-v1');
    expect(brief.readiness.canStartTrial).toBe(true);
    expect(brief.readiness.internalActions).toBeGreaterThanOrEqual(4);
    expect(brief.platformProfiles.map(item => item.platform)).toEqual([
      'dianping-meituan',
      'xiaohongshu',
      'douyin',
      'wechat-community',
      'poi-map',
    ]);
    expect(brief.materialChecklist.map(item => item.id)).toContain('provider-runtime');
    expect(brief.externalRequired.join('\n')).toContain('OpenClaw');
    expect(brief.safetyBoundary).toContain('does not scrape private data');
  });

  it('keeps manual text useful internally while requiring real proof for automation', () => {
    const brief = buildRestaurantPublicIntelligenceBrief({
      manualText: [
        'restaurant: Lake Side Bistro',
        'city: Shanghai',
        'area: Xuhui Riverside',
        'cuisine: local',
        'scenario: dinner with friends',
        'offer: two-person dinner set',
        'audience: nearby office workers',
      ].join('\n'),
    });

    expect(brief.readiness.canStartTrial).toBe(true);
    expect(brief.platformProfiles.find(item => item.platform === 'poi-map')?.usableNow).toBe(false);
    expect(brief.materialChecklist.find(item => item.id === 'platform-proof')?.status).toBe('missing');
    expect(brief.operatorScript.join('\n')).toContain('provider runtime');
  });

  it('is returned together with public profile intake from the runtime API', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'public-profile',
        sampleId: RESTAURANT_PUBLIC_SAMPLES[0].id,
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.publicProfile.ok).toBe(true);
    expect(payload.publicIntelligenceBrief.payloadShape).toBe('restaurant-public-intelligence-brief-v1');
    expect(payload.publicIntelligenceBrief.sourcePlan.length).toBeGreaterThanOrEqual(4);
  });
});

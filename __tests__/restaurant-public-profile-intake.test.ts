import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { RESTAURANT_PUBLIC_SAMPLES } from '@/lib/restaurant-public-data';
import { buildRestaurantPublicProfileIntake } from '@/lib/restaurant-public-profile-intake';

describe('restaurant public profile intake', () => {
  it('turns an attributed public sample into profile fields evidence and memory writes', () => {
    const report = buildRestaurantPublicProfileIntake({ sampleId: RESTAURANT_PUBLIC_SAMPLES[0].id });

    expect(report.ok).toBe(true);
    expect(report.mode).toBe('public-sample');
    expect(report.canUseNow).toBe(true);
    expect(report.fields.filter(field => field.confidence !== 'missing').length).toBeGreaterThanOrEqual(8);
    expect(report.evidenceLedger[0]).toEqual(expect.objectContaining({ license: 'ODbL' }));
    expect(report.memoryUpserts.map(item => item.entity)).toEqual(['Restaurant', 'Offer']);
    expect(report.missingForActivation).toContain('merchant_menu_prices');
    expect(report.safetyBoundary).toContain('不登录平台');
    expect(JSON.stringify(report)).not.toContain('13800138000');
    expect(JSON.stringify(report)).not.toContain('wxid_');
  });

  it('accepts manual public text but keeps platform and POS work blocked', () => {
    const report = buildRestaurantPublicProfileIntake({
      manualText: [
        '餐厅：湖东小馆',
        '城市：上海',
        '商圈：徐汇滨江',
        '菜系：本帮菜',
        '场景：朋友聚餐',
        '套餐：双人晚市套餐',
        '客群：附近下班聚餐客',
        '公开链接：https://www.openstreetmap.org/node/123456',
      ].join('\n'),
    });

    expect(report.mode).toBe('manual-public-profile');
    expect(report.canUseNow).toBe(true);
    expect(report.profile.restaurant).toBe('湖东小馆');
    expect(report.fields.find(field => field.field === 'sourceUrl')).toEqual(expect.objectContaining({ confidence: 'manual-public' }));
    expect(report.blockedExternal).toContain('auto publish requires runtime, operator approval and signed receipt callback');
    expect(report.missingForActivation).toContain('publish_receipt_or_screenshot');
  });

  it('does not treat non-allowlisted URLs as public evidence', () => {
    const report = buildRestaurantPublicProfileIntake({
      restaurant: '测试门店',
      sourceUrl: 'https://private.example.com/admin/shop',
    });

    expect(report.canUseNow).toBe(true);
    expect(report.fields.find(field => field.field === 'sourceUrl')).toEqual(expect.objectContaining({ confidence: 'missing' }));
    expect(report.missingForActivation).toContain('allowlisted_public_url');
    expect(report.evidenceLedger[0].boundary).toContain('不自动打开平台');
  });

  it('exposes public profile intake through the runtime API', async () => {
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
    expect(payload.publicProfile.mode).toBe('public-sample');
    expect(payload.publicIntelligenceBrief.payloadShape).toBe('restaurant-public-intelligence-brief-v1');
    expect(payload.publicProfile.evidenceLedger[0].license).toBe('ODbL');
    expect(payload.publicProfile.blockedExternal).toContain('merchant platform profile sync requires merchant authorization');
  });
});

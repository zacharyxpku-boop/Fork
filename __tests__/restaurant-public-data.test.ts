import { describe, expect, it } from 'vitest';

import {
  RESTAURANT_EXTERNAL_DATA_SOURCES,
  RESTAURANT_EXTERNAL_SETUP_NEEDS,
  RESTAURANT_PUBLIC_SAMPLES,
  getRestaurantPublicSampleCities,
  getRestaurantPublicSampleImportRows,
  getRestaurantPublicSamplesByCity,
  publicSampleToTrialIntake,
} from '@/lib/restaurant-public-data';

describe('restaurant public data samples', () => {
  it('keeps public restaurant samples attributed and bounded', () => {
    expect(RESTAURANT_PUBLIC_SAMPLES.length).toBeGreaterThanOrEqual(8);

    for (const sample of RESTAURANT_PUBLIC_SAMPLES) {
      expect(sample.id).toMatch(/^osm-node-/);
      expect(sample.city).toBeTruthy();
      expect(sample.scenario).toBeTruthy();
      expect(sample.publicSignals.length).toBeGreaterThan(0);
      expect(sample.source.name).toContain('OpenStreetMap');
      expect(sample.source.license).toBe('ODbL');
      expect(sample.suggestedEvidence).toContain('仍需');
      expect(sample.coordinates.lat).toBeGreaterThan(20);
      expect(sample.coordinates.lon).toBeGreaterThan(100);
    }
  });

  it('covers multiple city sample packs without private customer data', () => {
    expect(getRestaurantPublicSampleCities()).toEqual(['全部', '上海', '北京', '成都', '广州']);
    expect(getRestaurantPublicSamplesByCity('北京')).toHaveLength(2);
    expect(getRestaurantPublicSamplesByCity('全部')).toHaveLength(RESTAURANT_PUBLIC_SAMPLES.length);

    const serialized = JSON.stringify(RESTAURANT_PUBLIC_SAMPLES);
    expect(serialized).not.toContain('私信内容');
    expect(serialized).not.toContain('手机号');
    expect(serialized).not.toContain('身份证');
  });

  it('turns public samples into manual import rows', () => {
    const rows = getRestaurantPublicSampleImportRows(getRestaurantPublicSamplesByCity('成都'));

    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual(expect.objectContaining({
      city: '成都',
      license: 'ODbL',
      source: expect.stringContaining('openstreetmap.org/node/'),
      evidenceBoundary: expect.stringContaining('仍需'),
    }));
    expect(rows[0].latitude).toMatch(/^\d+\.\d{6}$/);
    expect(rows[0].longitude).toMatch(/^\d+\.\d{6}$/);
  });

  it('turns a public POI into a trial intake without claiming platform integration', () => {
    const intake = publicSampleToTrialIntake(RESTAURANT_PUBLIC_SAMPLES[0]);

    expect(intake.restaurant).toBeTruthy();
    expect(intake.offer).toBeTruthy();
    expect(intake.channels).toContain('大众点评');
    expect(intake.evidence).toContain('OSM');
    expect(intake.evidence).toContain('仍需');
    expect(intake.evidence).not.toContain('已接入');
  });

  it('separates usable public samples from account-gated data sources and user setup needs', () => {
    expect(RESTAURANT_EXTERNAL_DATA_SOURCES).toEqual(expect.arrayContaining([
      expect.objectContaining({
        name: 'OpenStreetMap / Overpass',
        canUseNow: true,
        status: 'public-sample-ready',
      }),
      expect.objectContaining({
        name: '大众点评 / 美团',
        canUseNow: false,
        status: 'requires-merchant-account',
      }),
      expect.objectContaining({
        name: '收银汇总 / 会员 / 库存',
        canUseNow: false,
        status: 'manual-import-only',
      }),
    ]));

    expect(RESTAURANT_EXTERNAL_SETUP_NEEDS).toEqual(expect.arrayContaining([
      expect.objectContaining({
        title: '真实门店基础档案',
      }),
      expect.objectContaining({
        title: '平台商家账号或发布凭证',
      }),
      expect.objectContaining({
        title: 'POS / 会员 / 库存样表',
      }),
    ]));
  });
});

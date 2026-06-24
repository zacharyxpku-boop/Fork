import { describe, expect, it } from 'vitest';

import { buildRestaurantBenchmarkStrategy } from '@/lib/restaurant-benchmark-strategy';

describe('restaurant benchmark strategy', () => {
  it('chooses a platform-grade spine with a Claw-style agent layer', () => {
    const strategy = buildRestaurantBenchmarkStrategy();

    expect(strategy.payloadShape).toBe('restaurant-benchmark-strategy');
    expect(strategy.recommendation).toBe('kuaizi-platform-spine-plus-claw-agent-layer');
    expect(strategy.candidates.map(item => item.id)).toEqual([
      'kuaizi-platform',
      'claw-agent',
      'restaurant-saas',
    ]);
    expect(strategy.candidates.find(item => item.id === 'kuaizi-platform')).toEqual(expect.objectContaining({
      role: 'primary-spine',
      fitScore: expect.any(Number),
    }));
    expect(strategy.candidates.find(item => item.id === 'claw-agent')).toEqual(expect.objectContaining({
      role: 'experience-layer',
    }));
  });

  it('keeps external gates explicit instead of claiming platform execution', () => {
    const strategy = buildRestaurantBenchmarkStrategy();

    expect(strategy.nextBuildOrder.map(item => item.id)).toEqual([
      'platform-spine-ledger',
      'agent-runtime-control',
      'restaurant-data-contracts',
    ]);
    expect(strategy.nextBuildOrder[0].externalGate).toContain('平台授权');
    expect(strategy.nextBuildOrder[1].externalGate).toContain('OpenClaw');
    expect(strategy.nextBuildOrder[2].externalGate).toContain('POS');
    expect(strategy.safetyBoundary).toContain('不代表外部平台');
    expect(JSON.stringify(strategy)).not.toContain('api_key');
    expect(JSON.stringify(strategy)).not.toContain('cookie');
    expect(JSON.stringify(strategy)).not.toContain('token');
  });
});

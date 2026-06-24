import { describe, expect, it } from 'vitest';

import { buildRestaurantCompetitorCapabilityMatrix } from '@/lib/restaurant-competitor-capability-matrix';

describe('restaurant competitor capability matrix', () => {
  it('turns competitor references into Wenai-owned modules across the six-loop OS', () => {
    const matrix = buildRestaurantCompetitorCapabilityMatrix({
      restaurantName: '南城小馆',
      offerName: '晚市双人套餐',
      now: new Date('2026-06-22T04:30:00.000Z'),
    });

    expect(matrix.payloadShape).toBe('restaurant-competitor-capability-matrix-v1');
    expect(matrix.restaurantName).toBe('南城小馆');
    expect(matrix.offerName).toBe('晚市双人套餐');
    expect(matrix.summary.modules).toBeGreaterThanOrEqual(8);
    expect(matrix.summary.loopStages).toBe(6);
    expect(matrix.summary.visibleNow).toBeGreaterThan(4);
    expect(matrix.modules.map(item => item.loopStage)).toEqual(expect.arrayContaining([
      'Intake',
      'Diagnose',
      'Create',
      'Publish Proof',
      'Recover',
      'Review Loop',
    ]));
    expect(matrix.modules.map(item => item.source)).toEqual(expect.arrayContaining([
      'Kuaizi',
      'Meituan',
      'Voice AI',
      'Owner.com',
      'SevenRooms',
      'MarketMan',
      'Restaurant Ops',
    ]));
    expect(matrix.modules.map(item => item.wenaiModule)).toEqual(expect.arrayContaining([
      '今日门店任务',
      '发布凭证看板',
      '电话接待门禁',
      '菜品成本/库存复核',
    ]));
    expect(matrix.ownerNextActions[0]).toEqual(expect.objectContaining({
      owner: expect.any(String),
      action: expect.any(String),
      evidenceRequired: expect.any(String),
    }));
  });

  it('keeps benchmark-inspired modules gated instead of claiming parity or automation', () => {
    const matrix = buildRestaurantCompetitorCapabilityMatrix();
    const serialized = JSON.stringify(matrix);

    expect(matrix.summary.canClaimCompetitorParity).toBe(false);
    expect(matrix.summary.canClaimAutomaticPublishing).toBe(false);
    expect(matrix.summary.canClaimTrueOperatingAttribution).toBe(false);
    expect(matrix.modules.find(item => item.id === 'content-production-chain')?.stopLine).toContain('不宣称一键成片');
    expect(matrix.modules.find(item => item.id === 'publish-proof-board')?.stopLine).toContain('不宣称自动发布');
    expect(matrix.modules.find(item => item.id === 'cost-inventory-review')?.stopLine).toContain('不写真实毛利');
    expect(matrix.modules.find(item => item.id === 'first-party-repeat-loop')?.canShowNow).toBe(false);
    expect(matrix.advancedModules.map(item => item.id)).toEqual(expect.arrayContaining([
      'first-party-repeat-loop',
      'multi-order-data-spine',
    ]));
    expect(serialized).not.toContain('API key');
    expect(serialized).not.toContain('token');
    expect(serialized).not.toContain('cookie');
    expect(serialized).not.toContain('手机号');
    expect(serialized).not.toContain('微信号');
  });
});

import { describe, expect, it } from 'vitest';

import { buildRestaurantDecision } from '@/lib/restaurant-decision-engine';

describe('restaurant decision engine', () => {
  const baseInput = {
    restaurant: '南城川味小馆',
    offer: '双人酸菜鱼套餐',
    price: 168,
    foodCostRate: 0.36,
    availablePortions: 42,
    targetRevenue: 9800,
    yesterdayRevenue: 7200,
    couponClaims: 38,
    reservations: 11,
    privateMessages: 17,
    redemptions: 14,
    averageTicket: 156,
    serviceWindow: '今晚 18:00-20:30',
    owner: '店长 / 社群负责人',
  };

  it('turns restaurant inputs into a concrete operating decision', () => {
    const decision = buildRestaurantDecision(baseInput);

    expect(decision.grossProfitPerOrder).toBe(108);
    expect(decision.revenueGap).toBe(2600);
    expect(decision.ordersNeeded).toBe(16);
    expect(decision.leadPressure).toBe('high');
    expect(decision.inventoryRisk).toBe('safe');
    expect(decision.decision).toContain('今天先推 双人酸菜鱼套餐');
    expect(decision.decision).toContain('目标补 16 单');
  });

  it('builds channel copy, owner actions and evidence requirements', () => {
    const decision = buildRestaurantDecision(baseInput);

    expect(decision.channelPack).toHaveLength(4);
    expect(decision.channelPack.map(item => item.channel)).toEqual(['大众点评', '小红书', '抖音', '微信社群']);
    expect(decision.channelPack[0].proof).toContain('核销截图');
    expect(decision.actionQueue).toEqual(expect.arrayContaining([
      expect.objectContaining({
        owner: '店长 / 社群负责人',
        evidence: expect.stringContaining('后厨备货确认'),
      }),
      expect.objectContaining({
        owner: '运营',
        action: expect.stringContaining('4 个渠道版本'),
      }),
    ]));
  });

  it('keeps external automation blocked until credentials and data exist', () => {
    const decision = buildRestaurantDecision({
      ...baseInput,
      availablePortions: 8,
      targetRevenue: 12000,
      yesterdayRevenue: 4000,
    });

    expect(decision.inventoryRisk).toBe('tight');
    expect(decision.why.join(' ')).toContain('限量');
    expect(decision.blockedAutomation).toEqual(expect.arrayContaining([
      expect.objectContaining({
        capability: '自动发布',
        missing: expect.stringContaining('平台账号授权'),
      }),
      expect.objectContaining({
        capability: '自动核销',
        missing: expect.stringContaining('核销接口'),
      }),
      expect.objectContaining({
        capability: '真实经营分析',
        missing: expect.stringContaining('POS 流水'),
      }),
    ]));
  });
});

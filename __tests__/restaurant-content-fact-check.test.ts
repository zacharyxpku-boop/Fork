import { describe, expect, it } from 'vitest';

import { checkContentFacts } from '@/lib/restaurant-content-fact-check';

const intake = {
  restaurant: '椒香记·川味面馆（国贸店）',
  offer: '藤椒鸡丝拌面双人套餐 ¥59.9',
  visitReason: '工作日 17:30-20:00 到店免排队',
  constraints: '周末不适用；每天限量 40 份',
  freebie: '两杯酸梅汤',
};

describe('restaurant content fact check', () => {
  it('passes clean copy that only uses merchant facts', () => {
    const warnings = checkContentFacts('工作日来国贸店，双人套餐 ¥59.9，每天限量 40 份，送两杯酸梅汤。', intake);
    expect(warnings).toEqual([]);
  });

  it('flags prices that do not match the merchant offer', () => {
    const warnings = checkContentFacts('双人套餐只要 ¥49.9，快来！', intake);
    expect(warnings.some(warning => warning.code === 'price-mismatch' && warning.message.includes('49.9'))).toBe(true);
  });

  it('flags invented prices when the intake has none', () => {
    const warnings = checkContentFacts('特价 ¥39 走起', { restaurant: '小店', offer: '招牌面' });
    expect(warnings.some(warning => warning.code === 'invented-price')).toBe(true);
  });

  it('flags mismatched limit counts, banned words and growth promises', () => {
    const warnings = checkContentFacts('每天限量 99 份，全城最好吃，保证爆单！', intake);
    const codes = warnings.map(warning => warning.code);
    expect(codes).toContain('limit-mismatch');
    expect(codes).toContain('banned-word');
    expect(codes).toContain('growth-promise');
  });
});

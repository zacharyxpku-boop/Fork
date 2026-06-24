import { describe, expect, it } from 'vitest';

import {
  RESTAURANT_DISH_COST_INVENTORY_DEMO_ROWS,
  buildRestaurantDishCostInventorySample,
  buildRestaurantDishCostInventoryPasteTemplate,
  parseRestaurantDishCostInventoryPaste,
} from '@/lib/restaurant-dish-cost-inventory-sample';

describe('restaurant dish cost inventory sample', () => {
  it('turns MarketMan-style cost and inventory rows into owner questions', () => {
    const report = buildRestaurantDishCostInventorySample({
      restaurantName: '北城牛肉面',
      offerName: '午市牛肉面套餐',
      rows: RESTAURANT_DISH_COST_INVENTORY_DEMO_ROWS,
      now: new Date('2026-06-22T03:00:00.000Z'),
    });

    expect(report.payloadShape).toBe('restaurant-dish-cost-inventory-sample-v1');
    expect(report.restaurantName).toBe('北城牛肉面');
    expect(report.offerName).toBe('午市牛肉面套餐');
    expect(report.status).toBe('missing-data-contract');
    expect(report.summary.totalRows).toBe(3);
    expect(report.summary.validRows).toBe(3);
    expect(report.summary.dishCount).toBe(2);
    expect(report.summary.ingredientCount).toBe(3);
    expect(report.summary.needsReorderCount).toBeGreaterThan(0);
    expect(report.summary.wasteRiskCount).toBeGreaterThan(0);
    expect(report.ownerQuestions.map(item => item.owner)).toEqual(['店长', '后厨', '采购', '财务']);
    expect(report.nextActions.join('\n')).toContain('补货线');
    expect(report.nextActions.join('\n')).toContain('损耗');
    expect(report.stopLines.join('\n')).toContain('不写真实毛利或库存优化结论');
  });

  it('rejects private, order-level and credential-like fields or values', () => {
    const report = buildRestaurantDishCostInventorySample({
      rows: [
        {
          dishName: '招牌套餐',
          ingredientName: '牛肉',
          unit: 'kg',
          plannedUsage: 5,
          stockOnHand: 6,
          reorderPoint: 4,
          purchaseCost: 70,
          owner: '店长',
          phone: '13800138000',
        },
        {
          dishName: '招牌套餐',
          ingredientName: '面条',
          unit: '份',
          plannedUsage: 40,
          stockOnHand: 42,
          reorderPoint: 30,
          purchaseCost: 2,
          evidence: 'token=secret',
        },
        {
          dishName: '招牌套餐',
          ingredientName: '青菜',
          unit: '份',
          plannedUsage: 40,
          stockOnHand: 42,
          reorderPoint: 30,
          purchaseCost: 1.2,
          rawPosRow: 'line item detail',
        },
      ],
    });

    expect(report.summary.totalRows).toBe(3);
    expect(report.summary.validRows).toBe(0);
    expect(report.summary.rejectedRows).toBe(3);
    expect(report.status).toBe('needs-cleanup');
    expect(report.issues.map(issue => issue.code)).toEqual(expect.arrayContaining([
      'unsafe-field',
      'unsafe-value',
    ]));
    expect(JSON.stringify(report.sampleRows)).not.toContain('13800138000');
    expect(JSON.stringify(report.sampleRows)).not.toContain('token=secret');
    expect(JSON.stringify(report.sampleRows)).not.toContain('line item detail');
  });

  it('never promotes sample rows into true margin or inventory optimization claims', () => {
    const report = buildRestaurantDishCostInventorySample({
      rows: [{
        dishName: '番茄牛腩饭',
        ingredientName: '牛腩',
        unit: 'kg',
        plannedUsage: 3,
        stockOnHand: 9,
        reorderPoint: 3,
        purchaseCost: 88,
        wasteCount: 0,
        evidence: '老板成本样表',
      }],
    });

    expect(report.summary.canClaimGrossMargin).toBe(false);
    expect(report.summary.canClaimInventoryOptimization).toBe(false);
    expect(report.status).toBe('missing-data-contract');
    expect(report.ownerQuestions.find(item => item.owner === '财务')?.question).toContain('毛利判断');
  });
  it('parses a pasted cost and inventory template into safe sample rows', () => {
    const template = buildRestaurantDishCostInventoryPasteTemplate();
    const parsed = parseRestaurantDishCostInventoryPaste({
      text: [
        '菜品/套餐\t原料\t单位\t计划用量\t当前库存\t补货线\t采购成本\t损耗\t证据\t负责人',
        '招牌牛肉面套餐\t牛腱子\tkg\t8\t12\t10\t78\t1\t后厨备货表\t后厨',
        '招牌牛肉面套餐\t手工面\t份\t80\t66\t70\t2.4\t6\t日盘点表\t采购',
      ].join('\n'),
    });
    const report = buildRestaurantDishCostInventorySample({ rows: parsed.rows });

    expect(template.payloadShape).toBe('restaurant-dish-cost-inventory-paste-template-v1');
    expect(template.columns.map(column => column.field)).toEqual(expect.arrayContaining([
      'dishName',
      'ingredientName',
      'stockOnHand',
      'reorderPoint',
      'purchaseCost',
    ]));
    expect(template.sampleText).toContain('菜品/套餐');
    expect(template.stopLine).toContain('不要粘贴顾客');
    expect(parsed.payloadShape).toBe('restaurant-dish-cost-inventory-paste-parse-v1');
    expect(parsed.summary.dataRows).toBe(2);
    expect(parsed.rows[0]).toEqual(expect.objectContaining({
      dishName: '招牌牛肉面套餐',
      ingredientName: '牛腱子',
      stockOnHand: '12',
      reorderPoint: '10',
    }));
    expect(report.summary.validRows).toBe(2);
    expect(report.summary.needsReorderCount).toBe(1);
    expect(report.summary.canClaimGrossMargin).toBe(false);
  });

  it('keeps unknown pasted columns so unsafe data is still rejected', () => {
    const parsed = parseRestaurantDishCostInventoryPaste({
      text: [
        'dishName,ingredientName,unit,plannedUsage,stockOnHand,reorderPoint,purchaseCost,phone,apiKey',
        '招牌套餐,牛肉,kg,5,6,4,70,13800138000,api_key=secret',
      ].join('\n'),
    });
    const report = buildRestaurantDishCostInventorySample({ rows: parsed.rows });

    expect(parsed.warnings).toContain('unknown-columns-kept-for-safety-check');
    expect(report.summary.validRows).toBe(0);
    expect(report.summary.rejectedRows).toBe(1);
    expect(report.issues.map(issue => issue.code)).toEqual(expect.arrayContaining([
      'unsafe-field',
      'unsafe-value',
    ]));
    expect(JSON.stringify(report.sampleRows)).not.toContain('13800138000');
    expect(JSON.stringify(report.sampleRows)).not.toContain('api_key=secret');
  });

  it('keeps an intentionally empty paste import empty instead of falling back to demo rows', () => {
    const parsed = parseRestaurantDishCostInventoryPaste({ text: '' });
    const report = buildRestaurantDishCostInventorySample({ rows: parsed.rows });

    expect(parsed.warnings).toContain('empty-paste');
    expect(report.summary.totalRows).toBe(0);
    expect(report.summary.validRows).toBe(0);
    expect(report.status).toBe('needs-cleanup');
  });
});

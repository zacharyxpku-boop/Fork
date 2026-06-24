import { describe, expect, it } from 'vitest';

import {
  RESTAURANT_PUBLISH_PROOF_DEMO_PLANS,
  buildRestaurantPublishProofLedger,
  detectPublishProofPrivacyWarnings,
  type RestaurantPublishProofPlan,
} from '@/lib/restaurant-publish-proof-ledger';

describe('restaurant publish proof ledger', () => {
  it('keeps every publish action tied to channel, owner, schedule, proof, status, and next action', () => {
    const ledger = buildRestaurantPublishProofLedger({
      restaurantName: '样例餐厅',
      offerName: '招牌双人套餐',
      plans: RESTAURANT_PUBLISH_PROOF_DEMO_PLANS,
    });

    expect(ledger.payloadShape).toBe('restaurant-publish-proof-ledger-v1');
    expect(ledger.summary).toEqual(expect.objectContaining({
      total: 3,
      accepted: 0,
      needsProof: 3,
      canClaimExternalPublish: false,
    }));
    expect(ledger.items[0]).toEqual(expect.objectContaining({
      channel: 'dianping',
      owner: '运营',
      scheduledAt: '今天 17:30',
      status: 'needs-proof',
    }));
    expect(ledger.items[0].blockers).toContain('缺发布链接或截图凭证');
    expect(ledger.nextActions.join('\n')).toContain('大众点评 / 运营');
    expect(ledger.stopLines).toContain('没有平台账号或商户授权，不宣称自动发布。');
  });

  it('accepts public links or screenshots while keeping recovered signals aggregate-only', () => {
    const plan: RestaurantPublishProofPlan = {
      id: 'publish-xhs-proof',
      restaurantName: '样例餐厅',
      storeName: '人民广场店',
      offerName: '招牌双人套餐',
      channel: 'xiaohongshu',
      owner: '运营',
      scheduledAt: '今天 18:30',
      status: 'planned',
      nextAction: '发布后回填链接或截图。',
      externalGates: [],
    };
    const ledger = buildRestaurantPublishProofLedger({
      restaurantName: '样例餐厅',
      offerName: '招牌双人套餐',
      plans: [plan],
      receipts: [{
        planId: plan.id,
        channel: 'xiaohongshu',
        publicUrl: 'https://www.xiaohongshu.com/explore/proof-demo',
        publishedAt: '2026-06-22T18:40:00.000Z',
        aggregateSignals: {
          reservationCount: 3,
          couponClaimCount: 8,
          inquiryCount: 5,
          reviewCount: 1,
          visitIntentCount: 6,
        },
      }],
    });

    expect(ledger.summary.canClaimExternalPublish).toBe(true);
    expect(ledger.items[0]).toEqual(expect.objectContaining({
      status: 'accepted',
      publicUrl: 'https://www.xiaohongshu.com/explore/proof-demo',
      publishedAt: '2026-06-22T18:40:00.000Z',
      aggregateSignals: {
        reservationCount: 3,
        couponClaimCount: 8,
        inquiryCount: 5,
        reviewCount: 1,
        visitIntentCount: 6,
      },
    }));
    expect(ledger.items[0].privacyWarnings).toEqual([]);
  });

  it('blocks receipts that try to store phone numbers, WeChat IDs, coupon codes, orders, POS rows, cookies, tokens, or API keys', () => {
    const warnings = detectPublishProofPrivacyWarnings({
      planId: 'sensitive-proof',
      channel: 'wechat-community',
      screenshotId: 'shot-1',
      publishedAt: '2026-06-22T19:00:00.000Z',
      note: '顾客手机号 13812345678，微信 wx:abc12345，优惠码 code:VIP8888，订单号 order id:O12345，raw POS row and token=secret123456',
    });

    expect(warnings).toEqual(expect.arrayContaining([
      '不得保存手机号',
      '不得保存微信号',
      '不得保存优惠码',
      '不得保存订单明细',
      '不得保存原始 POS 行',
      '不得保存cookie/token/API key',
    ]));

    const ledger = buildRestaurantPublishProofLedger({
      restaurantName: '样例餐厅',
      offerName: '招牌双人套餐',
      plans: [{
        id: 'sensitive-proof',
        restaurantName: '样例餐厅',
        storeName: '人民广场店',
        offerName: '招牌双人套餐',
        channel: 'wechat-community',
        owner: '店长',
        scheduledAt: '今天 19:00',
        status: 'planned',
        nextAction: '回填社群截图和脱敏咨询数量。',
        externalGates: [],
      }],
      receipts: [{
        planId: 'sensitive-proof',
        channel: 'wechat-community',
        screenshotId: 'shot-1',
        publishedAt: '2026-06-22T19:00:00.000Z',
        note: '手机号 13812345678；优惠码 code:VIP8888',
      }],
    });

    expect(ledger.summary.canClaimExternalPublish).toBe(false);
    expect(ledger.items[0].status).toBe('blocked');
    expect(ledger.items[0].blockers).toContain('包含不能保存的敏感信息');
  });
});

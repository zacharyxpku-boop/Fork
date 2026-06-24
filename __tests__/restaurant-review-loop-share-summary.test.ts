import { describe, expect, it } from 'vitest';

import {
  RESTAURANT_PUBLISH_PROOF_DEMO_PLANS,
  buildRestaurantPublishProofLedger,
} from '@/lib/restaurant-publish-proof-ledger';
import {
  RESTAURANT_RECOVER_SIGNAL_DEMO_ROWS,
  buildRestaurantRecoverSignalImportReport,
} from '@/lib/restaurant-recover-signal-import';
import { buildRestaurantReviewLoopBossRecap } from '@/lib/restaurant-review-loop-boss-recap';
import { buildRestaurantReviewLoopShareSummary } from '@/lib/restaurant-review-loop-share-summary';

describe('restaurant review loop share summary', () => {
  it('builds a boss and store-manager friendly markdown summary from the review loop recap', () => {
    const plans = RESTAURANT_PUBLISH_PROOF_DEMO_PLANS.map(plan => ({
      ...plan,
      externalGates: [],
      status: 'planned' as const,
    }));
    const publishProofLedger = buildRestaurantPublishProofLedger({
      restaurantName: '北城面馆',
      offerName: '番茄牛腩面套餐',
      plans,
      receipts: plans.map((plan, index) => ({
        planId: plan.id,
        channel: plan.channel,
        screenshotId: `proof-shot-${index + 1}`,
        publishedAt: `2026-06-22T1${index}:00:00.000Z`,
      })),
    });
    const recoverImport = buildRestaurantRecoverSignalImportReport({
      restaurantName: '北城面馆',
      offerName: '番茄牛腩面套餐',
      rows: RESTAURANT_RECOVER_SIGNAL_DEMO_ROWS,
    });
    const recap = buildRestaurantReviewLoopBossRecap({ publishProofLedger, recoverImport });
    const summary = buildRestaurantReviewLoopShareSummary({
      recap,
      publicUrl: 'https://share.example.test/review-loop/demo',
    });

    expect(summary.payloadShape).toBe('restaurant-review-loop-share-summary-v1');
    expect(summary.title).toContain('北城面馆 / 番茄牛腩面套餐');
    expect(summary.audience).toBe('老板/店长');
    expect(summary.decisionLabel).toBe('小步放大');
    expect(summary.lines.join('\n')).toContain('下一轮推什么');
    expect(summary.ownerChecklist.map(item => item.owner)).toEqual(expect.arrayContaining([
      '运营',
      '店长',
      '社群负责人',
      '老板',
    ]));
    expect(summary.evidenceChecklist.join('\n')).toContain('发布凭证账本');
    expect(summary.evidenceChecklist.join('\n')).toContain('脱敏回流');
    expect(summary.markdown).toContain('## 结论');
    expect(summary.markdown).toContain('## 负责人');
    expect(summary.markdown).toContain('## 边界');
    expect(summary.markdown).toContain('https://share.example.test/review-loop/demo');
  });

  it('keeps pause decisions and privacy boundaries visible when evidence is missing', () => {
    const publishProofLedger = buildRestaurantPublishProofLedger({
      restaurantName: '样例餐厅',
      offerName: '招牌双人套餐',
      plans: RESTAURANT_PUBLISH_PROOF_DEMO_PLANS,
    });
    const recoverImport = buildRestaurantRecoverSignalImportReport({
      rows: [{
        source: 'manual-summary',
        owner: '店长',
        evidence: '群截图',
        inquiryCount: 2,
        privateMessageText: '顾客手机号 13812345678，今晚 7 点到店',
        couponCode: 'VIP8888',
      }],
    });
    const recap = buildRestaurantReviewLoopBossRecap({ publishProofLedger, recoverImport });
    const summary = buildRestaurantReviewLoopShareSummary({ recap });
    const serialized = JSON.stringify(summary);

    expect(summary.decisionLabel).toBe('暂停放大');
    expect(summary.markdown).toContain('本轮判断：暂停放大');
    expect(summary.markdown).toContain('没有脱敏聚合回流，不宣称真实经营归因');
    expect(summary.stopLines.join('\n')).toContain('不包含顾客身份、私信原文、券码、订单明细或收银明细');
    expect(serialized).not.toContain('13812345678');
    expect(serialized).not.toContain('今晚 7 点到店');
    expect(serialized).not.toContain('VIP8888');
  });
});

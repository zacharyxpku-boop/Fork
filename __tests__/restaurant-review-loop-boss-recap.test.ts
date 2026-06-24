import { describe, expect, it } from 'vitest';

import {
  RESTAURANT_PUBLISH_PROOF_DEMO_PLANS,
  buildRestaurantPublishProofLedger,
  type RestaurantPublishProofPlan,
} from '@/lib/restaurant-publish-proof-ledger';
import {
  RESTAURANT_RECOVER_SIGNAL_DEMO_ROWS,
  buildRestaurantRecoverSignalImportReport,
} from '@/lib/restaurant-recover-signal-import';
import { buildRestaurantReviewLoopBossRecap } from '@/lib/restaurant-review-loop-boss-recap';

function acceptedPlans(): RestaurantPublishProofPlan[] {
  return RESTAURANT_PUBLISH_PROOF_DEMO_PLANS.map(plan => ({
    ...plan,
    status: 'planned',
    externalGates: [],
  }));
}

describe('restaurant review loop boss recap', () => {
  it('turns accepted publish proof and aggregate recover signals into a boss-facing next loop decision', () => {
    const plans = acceptedPlans();
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
      now: new Date('2026-06-22T12:00:00.000Z'),
    });

    const recap = buildRestaurantReviewLoopBossRecap({
      publishProofLedger,
      recoverImport,
      owner: '张老板',
      now: new Date('2026-06-22T13:00:00.000Z'),
    });

    expect(recap.payloadShape).toBe('restaurant-review-loop-boss-recap-v1');
    expect(recap.decision).toBe('amplify');
    expect(recap.headline).toContain('番茄牛腩面套餐');
    expect(recap.summary).toEqual(expect.objectContaining({
      acceptedProofs: 3,
      pendingProofs: 0,
      recoverRows: 3,
      couponClaimCount: 21,
      visitIntentCount: 17,
      evidenceReady: true,
      canClaimAttribution: true,
    }));
    expect(recap.nextDishAction).toContain('继续主推');
    expect(recap.evidenceSources.join('\n')).toContain('发布凭证账本');
    expect(recap.evidenceSources.join('\n')).toContain('脱敏回流');
    expect(recap.ownerActions.map(item => item.owner)).toEqual(expect.arrayContaining([
      '运营',
      '店长',
      '社群负责人',
      '老板',
    ]));
    expect(recap.ownerActions.map(item => item.evidenceRequired).join('\n')).toContain('发布凭证账本记录');
  });

  it('pauses when proof is missing or recover import is rejected before claiming growth attribution', () => {
    const publishProofLedger = buildRestaurantPublishProofLedger({
      restaurantName: '北城面馆',
      offerName: '番茄牛腩面套餐',
      plans: RESTAURANT_PUBLISH_PROOF_DEMO_PLANS,
    });
    const recoverImport = buildRestaurantRecoverSignalImportReport({
      rows: [{
        source: 'inquiry',
        owner: '社群负责人',
        evidence: '社群截图',
        inquiryCount: 2,
        phone: '13812345678',
      }],
    });

    const recap = buildRestaurantReviewLoopBossRecap({ publishProofLedger, recoverImport });

    expect(recap.decision).toBe('pause');
    expect(recap.summary).toEqual(expect.objectContaining({
      acceptedProofs: 0,
      evidenceReady: false,
      canClaimAttribution: false,
    }));
    expect(recap.nextDishAction).toContain('暂不加推');
    expect(recap.materialGaps.join('\n')).toContain('重新导入只含聚合数量的回流表');
    expect(recap.stopLines.join('\n')).toContain('没有脱敏聚合回流，不宣称真实经营归因');
    expect(recap.stopLines.join('\n')).toContain('不宣称自动发布、自动核销或真实复购归因');
  });

  it('keeps private recover values out of the recap payload', () => {
    const publishProofLedger = buildRestaurantPublishProofLedger({
      restaurantName: '样例餐厅',
      offerName: '招牌双人套餐',
      plans: [acceptedPlans()[0]],
      receipts: [{
        planId: acceptedPlans()[0].id,
        channel: acceptedPlans()[0].channel,
        screenshotId: 'proof-shot-clean',
        publishedAt: '2026-06-22T18:00:00.000Z',
      }],
    });
    const recoverImport = buildRestaurantRecoverSignalImportReport({
      rows: [{
        source: 'manual-summary',
        owner: '店长',
        evidence: '汇总截图',
        reservationCount: 1,
        couponClaimCount: 2,
        inquiryCount: 3,
        reviewCount: 0,
        communityFeedbackCount: 0,
        visitIntentCount: 1,
        redemptionCount: 0,
        privateMessageText: '今晚 7 点到店',
        token: 'secret123456',
      }],
    });

    const recap = buildRestaurantReviewLoopBossRecap({ publishProofLedger, recoverImport });
    const serialized = JSON.stringify(recap);

    expect(recap.decision).toBe('pause');
    expect(serialized).not.toContain('138');
    expect(serialized).not.toContain('今晚 7 点到店');
    expect(serialized).not.toContain('secret123456');
    expect(recap.ownerActions.join('\n')).not.toContain('privateMessageText');
  });
});

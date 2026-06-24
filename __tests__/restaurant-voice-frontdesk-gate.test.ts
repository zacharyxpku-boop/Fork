import { describe, expect, it } from 'vitest';

import {
  buildRestaurantVoiceFrontdeskGate,
  buildRestaurantVoiceFrontdeskSopSummary,
} from '@/lib/restaurant-voice-frontdesk-gate';

describe('restaurant voice frontdesk gate', () => {
  it('keeps phone reception as staff-reviewed drafts before external phone POS and payment contracts exist', () => {
    const gate = buildRestaurantVoiceFrontdeskGate({
      restaurantName: '北城面馆',
      offerName: '番茄牛腩面套餐',
      menuApproved: true,
      couponRulesReady: true,
      staffTakeoverReady: true,
    });

    expect(gate.payloadShape).toBe('restaurant-voice-frontdesk-gate-v1');
    expect(gate.summary).toEqual(expect.objectContaining({
      lanes: 6,
      canAnswerCallsNow: false,
      canWriteOrdersNow: false,
      canTakePaymentNow: false,
    }));
    expect(gate.lanes.map(lane => lane.title)).toEqual([
      '菜单问答',
      '订位/排队',
      '点餐草稿',
      '团购券问题',
      '转人工',
      '通话摘要',
    ]);
    expect(gate.lanes.find(lane => lane.id === 'order-draft')).toEqual(expect.objectContaining({
      status: 'external-gated',
      owner: '收银负责人',
    }));
    expect(gate.staffScripts.map(item => item.staffCheck).join('\n')).toContain('没有桌台容量和服务时段证据前，不承诺有位');
    expect(gate.stopLines).toContain('没有电话接入和店长授权，不宣称可以接听真实来电。');
  });

  it('opens order and call lanes only when evidence contracts are present', () => {
    const gate = buildRestaurantVoiceFrontdeskGate({
      restaurantName: '北城面馆',
      offerName: '番茄牛腩面套餐',
      menuApproved: true,
      reservationTableReady: true,
      orderMenuMapped: true,
      couponRulesReady: true,
      staffTakeoverReady: true,
      callSummaryTemplateReady: true,
      voiceProviderReady: true,
      posContractReady: true,
      paymentContractReady: true,
    });

    expect(gate.summary.canAnswerCallsNow).toBe(true);
    expect(gate.summary.canWriteOrdersNow).toBe(true);
    expect(gate.summary.canTakePaymentNow).toBe(true);
    expect(gate.summary.externalGated).toBe(0);
    expect(gate.lanes.find(lane => lane.id === 'order-draft')?.status).toBe('needs-staff-review');
    expect(gate.lanes.find(lane => lane.id === 'call-summary')?.status).toBe('needs-staff-review');
  });

  it('never stores private customer content in the gate output', () => {
    const gate = buildRestaurantVoiceFrontdeskGate({
      restaurantName: '顾客电话 13812345678',
      offerName: '微信 wx:private123 套餐',
      voiceProviderReady: false,
    });
    const serialized = JSON.stringify(gate);

    expect(gate.summary.canAnswerCallsNow).toBe(false);
    expect(serialized).not.toContain('13812345678');
    expect(serialized).not.toContain('private123');
    expect(serialized).not.toContain('通话原文：');
    expect(serialized).not.toContain('支付单号');
    expect(serialized).not.toContain('API key');
    expect(gate.stopLines.join('\n')).toContain('不保存顾客身份、聊天原文、通话原文、券码、订单明细或收银明细');
  });

  it('turns the front-desk gate into a shareable staff SOP summary without live-call claims', () => {
    const gate = buildRestaurantVoiceFrontdeskGate({
      restaurantName: '北城面馆',
      offerName: '番茄牛腩面套餐',
      menuApproved: true,
      couponRulesReady: true,
      staffTakeoverReady: true,
      callSummaryTemplateReady: true,
      voiceProviderReady: false,
    });

    const summary = buildRestaurantVoiceFrontdeskSopSummary(gate);

    expect(summary.payloadShape).toBe('restaurant-voice-frontdesk-sop-summary-v1');
    expect(summary.title).toContain('前厅接待 SOP 摘要');
    expect(summary.audience).toEqual(['店长', '前厅负责人', '收银负责人', '运营']);
    expect(summary.readinessLine).toContain('不承诺接听真实来电、写入订单或收款');
    expect(summary.handoffRules).toContain('价格、库存、过敏、满座、投诉、退款和临时加菜必须转给员工。');
    expect(summary.staffChecklist.find(item => item.owner === '前厅负责人')?.action).toContain('订位/排队');
    expect(summary.markdown).toContain('## 店员先照这个做');
    expect(summary.markdown).toContain('## 必须转给员工');
    expect(summary.markdown).toContain('## 负责人清单');
    expect(summary.safetyBoundary).toContain('员工审核和前厅交接');
    expect(summary.safetyBoundary).toContain('不接真实来电、不写入订单、不收款');
    expect(JSON.stringify(summary)).not.toContain('13812345678');
    expect(JSON.stringify(summary)).not.toContain('API key');
  });
});

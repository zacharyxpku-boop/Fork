export type RestaurantVoiceFrontdeskLaneId =
  | 'menu-faq'
  | 'reservation'
  | 'order-draft'
  | 'coupon-question'
  | 'staff-takeover'
  | 'call-summary';

export type RestaurantVoiceFrontdeskLaneStatus = 'internal-ready' | 'needs-staff-review' | 'external-gated';

export type RestaurantVoiceFrontdeskLane = {
  id: RestaurantVoiceFrontdeskLaneId;
  title: string;
  status: RestaurantVoiceFrontdeskLaneStatus;
  owner: '店长' | '前厅负责人' | '收银负责人' | '社群负责人' | '运营';
  canDoNow: string;
  externalGate: string;
  evidenceRequired: string[];
  nextAction: string;
};

export type RestaurantVoiceFrontdeskGate = {
  ok: true;
  payloadShape: 'restaurant-voice-frontdesk-gate-v1';
  restaurantName: string;
  offerName: string;
  summary: {
    lanes: number;
    internalReady: number;
    staffReview: number;
    externalGated: number;
    canAnswerCallsNow: boolean;
    canWriteOrdersNow: boolean;
    canTakePaymentNow: boolean;
  };
  lanes: RestaurantVoiceFrontdeskLane[];
  staffScripts: Array<{
    scenario: string;
    draft: string;
    staffCheck: string;
  }>;
  stopLines: string[];
};

export type RestaurantVoiceFrontdeskSopSummary = {
  ok: true;
  payloadShape: 'restaurant-voice-frontdesk-sop-summary-v1';
  title: string;
  audience: Array<'店长' | '前厅负责人' | '收银负责人' | '运营'>;
  restaurantName: string;
  offerName: string;
  readinessLine: string;
  handoffRules: string[];
  staffChecklist: Array<{
    owner: RestaurantVoiceFrontdeskLane['owner'];
    action: string;
    evidenceRequired: string;
  }>;
  markdown: string;
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value
    .replace(/(?:\+?86[-\s]?)?1[3-9]\d{9}/g, '[已脱敏]')
    .replace(/(?:微信|wechat|weixin|wx)[:：\s-]*[a-zA-Z][-_a-zA-Z0-9]{5,19}/gi, '[已脱敏]')
    .trim()
    .replace(/\s+/g, ' ');
  return trimmed || fallback;
}

function statusFrom(ready: boolean, reviewOnly = false): RestaurantVoiceFrontdeskLaneStatus {
  if (ready) return 'internal-ready';
  return reviewOnly ? 'needs-staff-review' : 'external-gated';
}

export function buildRestaurantVoiceFrontdeskGate(input: {
  restaurantName?: string;
  offerName?: string;
  menuApproved?: boolean;
  reservationTableReady?: boolean;
  orderMenuMapped?: boolean;
  couponRulesReady?: boolean;
  staffTakeoverReady?: boolean;
  callSummaryTemplateReady?: boolean;
  voiceProviderReady?: boolean;
  posContractReady?: boolean;
  paymentContractReady?: boolean;
} = {}): RestaurantVoiceFrontdeskGate {
  const restaurantName = clean(input.restaurantName, '样例餐厅');
  const offerName = clean(input.offerName, '招牌套餐');
  const voiceProviderReady = Boolean(input.voiceProviderReady);
  const posContractReady = Boolean(input.posContractReady);
  const paymentContractReady = Boolean(input.paymentContractReady);
  const staffTakeoverReady = Boolean(input.staffTakeoverReady);

  const lanes: RestaurantVoiceFrontdeskLane[] = [
    {
      id: 'menu-faq',
      title: '菜单问答',
      status: statusFrom(Boolean(input.menuApproved), true),
      owner: '店长',
      canDoNow: `准备 ${offerName} 的菜单、价格、可用时段和忌口说明。`,
      externalGate: '接电话前需要确认菜单口径和服务时段。',
      evidenceRequired: ['菜单截图', '价格确认', '可用时段', '忌口/过敏说明'],
      nextAction: input.menuApproved ? '可以生成员工审核话术。' : '先让店长确认菜单和价格口径。',
    },
    {
      id: 'reservation',
      title: '订位/排队',
      status: voiceProviderReady && Boolean(input.reservationTableReady) ? 'internal-ready' : 'external-gated',
      owner: '前厅负责人',
      canDoNow: '生成询问人数、时间段、到店场景和排队风险的话术。',
      externalGate: '需要电话接入、桌台容量或预约表，才能确认位置。',
      evidenceRequired: ['预约表', '桌台容量', '服务时段', '前厅确认'],
      nextAction: input.reservationTableReady ? '接入电话和前厅确认后再承诺订位。' : '先补桌台容量或预约表。',
    },
    {
      id: 'order-draft',
      title: '点餐草稿',
      status: posContractReady && Boolean(input.orderMenuMapped) ? 'needs-staff-review' : 'external-gated',
      owner: '收银负责人',
      canDoNow: '把顾客需求整理成待员工确认的点餐草稿。',
      externalGate: '需要菜单字段、库存口径和收银/订单数据约定，才能写入订单。',
      evidenceRequired: ['菜单字段表', '库存确认', '收银/订单数据约定', '员工确认'],
      nextAction: input.orderMenuMapped ? '员工确认后才可进入收银或后厨。' : '先映射菜品、规格和库存口径。',
    },
    {
      id: 'coupon-question',
      title: '团购券问题',
      status: statusFrom(Boolean(input.couponRulesReady), true),
      owner: '运营',
      canDoNow: '回答团购券可用时间、适用菜品和不可用边界。',
      externalGate: '没有平台授权和核销数据前，只解释规则，不改券状态。',
      evidenceRequired: ['团购券说明截图', '可用时段', '不可用边界', '店长确认'],
      nextAction: input.couponRulesReady ? '生成员工审核回复。' : '先补团购券规则和店长确认。',
    },
    {
      id: 'staff-takeover',
      title: '转人工',
      status: staffTakeoverReady ? 'internal-ready' : 'needs-staff-review',
      owner: '店长',
      canDoNow: '定义什么情况必须交给员工处理。',
      externalGate: '需要值班负责人、营业时段和异常处理规则。',
      evidenceRequired: ['值班负责人', '异常类型', '营业时段', '升级规则'],
      nextAction: staffTakeoverReady ? '把转人工规则写进门店接待 SOP。' : '先确认谁接手价格、投诉、过敏和满座问题。',
    },
    {
      id: 'call-summary',
      title: '通话摘要',
      status: voiceProviderReady && Boolean(input.callSummaryTemplateReady) ? 'needs-staff-review' : 'external-gated',
      owner: '运营',
      canDoNow: '只保留意图、数量、时间段和员工下一步。',
      externalGate: '需要电话接入、录音告知和摘要模板，且不保存原始通话内容。',
      evidenceRequired: ['电话接入', '录音告知', '摘要模板', '员工复核'],
      nextAction: input.callSummaryTemplateReady ? '员工复核摘要后再进入回流。' : '先定义摘要字段，只保留脱敏聚合信息。',
    },
  ];

  const internalReady = lanes.filter(lane => lane.status === 'internal-ready').length;
  const staffReview = lanes.filter(lane => lane.status === 'needs-staff-review').length;
  const externalGated = lanes.filter(lane => lane.status === 'external-gated').length;

  return {
    ok: true,
    payloadShape: 'restaurant-voice-frontdesk-gate-v1',
    restaurantName,
    offerName,
    summary: {
      lanes: lanes.length,
      internalReady,
      staffReview,
      externalGated,
      canAnswerCallsNow: voiceProviderReady && externalGated === 0,
      canWriteOrdersNow: voiceProviderReady && posContractReady && Boolean(input.orderMenuMapped),
      canTakePaymentNow: voiceProviderReady && posContractReady && paymentContractReady,
    },
    lanes,
    staffScripts: [
      {
        scenario: '菜单问答',
        draft: `${restaurantName} 的 ${offerName} 需要先按店长确认的菜单、价格和可用时段回答。`,
        staffCheck: '价格、库存、过敏、等待时间不确定时交给员工。',
      },
      {
        scenario: '订位/排队',
        draft: '先询问人数、到店时间和是否接受等待，再交给前厅确认。',
        staffCheck: '没有桌台容量和服务时段证据前，不承诺有位。',
      },
      {
        scenario: '点餐草稿',
        draft: '只整理菜品、数量、规格和取餐时间，员工确认后再进入收银或后厨。',
        staffCheck: '没有菜单字段、库存和收银约定前，不写入订单。',
      },
    ],
    stopLines: [
      '没有电话接入和店长授权，不宣称可以接听真实来电。',
      '没有菜单字段、库存和收银/订单数据约定，不写入订单。',
      '没有支付约定，不收款、不退费、不承诺支付结果。',
      '没有桌台容量或预约表，不承诺订位成功。',
      '不保存顾客身份、聊天原文、通话原文、券码、订单明细或收银明细。',
    ],
  };
}

export function buildRestaurantVoiceFrontdeskSopSummary(
  gate: RestaurantVoiceFrontdeskGate,
): RestaurantVoiceFrontdeskSopSummary {
  const readinessLine = gate.summary.canAnswerCallsNow
    ? '电话条件已满足后仍需员工复核摘要、订位和点餐草稿。'
    : '当前只交付前厅接待话术和负责人清单，不承诺接听真实来电、写入订单或收款。';

  const handoffRules = [
    '价格、库存、过敏、满座、投诉、退款和临时加菜必须转给员工。',
    '订位先记录人数、时间段和到店场景，再由前厅确认。',
    '点餐只整理菜品、数量、规格和取餐时间，员工确认后再进入收银或后厨。',
    '通话摘要只保留意图、数量、时间段、证据来源和员工下一步。',
  ];

  const staffChecklist = gate.lanes.map(lane => ({
    owner: lane.owner,
    action: `${lane.title}：${lane.nextAction}`,
    evidenceRequired: lane.evidenceRequired.slice(0, 2).join('、'),
  }));

  const markdownLines = [
    `# 前厅接待 SOP 摘要 - ${gate.restaurantName}`,
    '',
    `主推：${gate.offerName}`,
    `状态：${readinessLine}`,
    '',
    '## 店员先照这个做',
    ...gate.staffScripts.map(item => `- ${item.scenario}：${item.draft}（复核：${item.staffCheck}）`),
    '',
    '## 必须转给员工',
    ...handoffRules.map(rule => `- ${rule}`),
    '',
    '## 负责人清单',
    ...staffChecklist.map(item => `- ${item.owner}：${item.action}；证据：${item.evidenceRequired}`),
    '',
    '边界：不保存顾客身份、聊天原文、通话原文、券码、订单明细或收银明细。',
  ];

  return {
    ok: true,
    payloadShape: 'restaurant-voice-frontdesk-sop-summary-v1',
    title: `前厅接待 SOP 摘要 - ${gate.restaurantName}`,
    audience: ['店长', '前厅负责人', '收银负责人', '运营'],
    restaurantName: gate.restaurantName,
    offerName: gate.offerName,
    readinessLine,
    handoffRules,
    staffChecklist,
    markdown: markdownLines.join('\n'),
    safetyBoundary: '只用于员工审核和前厅交接；没有电话接入、菜单字段、收银/订单和支付约定前，不接真实来电、不写入订单、不收款。',
  };
}

export type RestaurantCompetitorSource =
  | 'Kuaizi'
  | 'Meituan'
  | 'Voice AI'
  | 'Owner.com'
  | 'SevenRooms'
  | 'MarketMan'
  | 'Restaurant Ops';

export type RestaurantCapabilityLoopStage =
  | 'Intake'
  | 'Diagnose'
  | 'Create'
  | 'Publish Proof'
  | 'Recover'
  | 'Review Loop';

export type RestaurantCapabilityOwner = '老板' | '店长' | '运营' | '社群负责人' | '前厅' | '后厨' | '采购';

export type RestaurantCompetitorCapabilityModule = {
  id: string;
  source: RestaurantCompetitorSource;
  wenaiModule: string;
  loopStage: RestaurantCapabilityLoopStage;
  customerJob: string;
  input: string[];
  output: string[];
  evidence: string[];
  owner: RestaurantCapabilityOwner;
  canShowNow: boolean;
  nextAction: string;
  gate: string;
  stopLine: string;
};

export type RestaurantCompetitorCapabilityMatrix = {
  ok: true;
  payloadShape: 'restaurant-competitor-capability-matrix-v1';
  generatedAt: string;
  restaurantName: string;
  offerName: string;
  summary: {
    modules: number;
    loopStages: number;
    visibleNow: number;
    gated: number;
    canClaimCompetitorParity: false;
    canClaimAutomaticPublishing: false;
    canClaimTrueOperatingAttribution: false;
  };
  modules: RestaurantCompetitorCapabilityModule[];
  firstScreenModules: RestaurantCompetitorCapabilityModule[];
  advancedModules: RestaurantCompetitorCapabilityModule[];
  ownerNextActions: Array<{
    owner: RestaurantCapabilityOwner;
    action: string;
    evidenceRequired: string;
  }>;
  externalGates: string[];
  safetyBoundary: string;
};

function cleanText(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed || fallback;
}

function module(input: RestaurantCompetitorCapabilityModule): RestaurantCompetitorCapabilityModule {
  return input;
}

export function buildRestaurantCompetitorCapabilityMatrix(input: {
  restaurantName?: string;
  offerName?: string;
  now?: Date;
} = {}): RestaurantCompetitorCapabilityMatrix {
  const restaurantName = cleanText(input.restaurantName, '样例餐厅');
  const offerName = cleanText(input.offerName, '招牌套餐');
  const modules = [
    module({
      id: 'today-store-task',
      source: 'Meituan',
      wenaiModule: '今日门店任务',
      loopStage: 'Intake',
      customerJob: `让老板先决定今天围绕「${offerName}」做哪件事。`,
      input: ['餐厅和门店', '主推菜/套餐', '到店场景', '优惠边界', '素材现状'],
      output: ['今日任务卡', '负责人', '下一步按钮'],
      evidence: ['门店输入', '店长确认'],
      owner: '店长',
      canShowNow: true,
      nextAction: '先生成今天的门店工单。',
      gate: '真实门店资料和活动边界由店长确认。',
      stopLine: '不把试跑任务写成真实经营结果。',
    }),
    module({
      id: 'visit-reason-diagnosis',
      source: 'Meituan',
      wenaiModule: '到店理由诊断',
      loopStage: 'Diagnose',
      customerJob: '把评价、场景和竞品机会翻译成今天最值得讲的卖点。',
      input: ['公开资料', '人工输入', '脱敏反馈', '竞品观察'],
      output: ['到店理由', '差评风险', '素材缺口', '平台建议'],
      evidence: ['公开链接或截图', '人工备注', '脱敏汇总'],
      owner: '运营',
      canShowNow: true,
      nextAction: '补一条公开主页或评价截图。',
      gate: '没有平台授权时只读公开资料或人工输入。',
      stopLine: '不宣称已读取平台后台或真实顾客画像。',
    }),
    module({
      id: 'content-production-chain',
      source: 'Kuaizi',
      wenaiModule: '内容生产任务链',
      loopStage: 'Create',
      customerJob: '把脚本、素材、剪辑、海报和店长审核放进同一张任务表。',
      input: ['菜品照片', '菜单截图', '卖点', '活动边界', '素材授权'],
      output: ['短视频脚本', '图文笔记', '社群话术', '海报 brief', '素材清单'],
      evidence: ['素材授权', '店长审核', '成片或草稿证明'],
      owner: '运营',
      canShowNow: true,
      nextAction: '先补菜品图和菜单截图。',
      gate: '视频通道和成片证明补齐后才能说成片完成。',
      stopLine: '不宣称一键成片、批量混剪或真实投放已完成。',
    }),
    module({
      id: 'publish-proof-board',
      source: 'Kuaizi',
      wenaiModule: '发布凭证看板',
      loopStage: 'Publish Proof',
      customerJob: '让每个渠道都有负责人、发布时间、链接或截图。',
      input: ['渠道计划', '负责人', '发布时间', '发布截图或链接'],
      output: ['发布凭证账本', '缺口清单', '回填提醒'],
      evidence: ['大众点评/美团/小红书/抖音/社群链接或截图'],
      owner: '运营',
      canShowNow: true,
      nextAction: '先安排渠道并留一条凭证。',
      gate: '账号和商户授权确认前只做排期和人工凭证。',
      stopLine: '不宣称自动发布或平台动作已经完成。',
    }),
    module({
      id: 'voice-frontdesk-gate',
      source: 'Voice AI',
      wenaiModule: '电话接待门禁',
      loopStage: 'Recover',
      customerJob: '把订位、点餐、菜单问答、转人工和摘要先变成员工审核草稿。',
      input: ['菜单字段', '订位规则', '团购券规则', '转人工边界'],
      output: ['接待话术', '点餐草稿', '前厅问题清单', '通话摘要模板'],
      evidence: ['员工确认', '菜单字段表', '订位规则'],
      owner: '前厅',
      canShowNow: true,
      nextAction: '先确认菜单和转人工边界。',
      gate: '电话接入、菜单字段、收银和支付约定未补齐前只做草稿。',
      stopLine: '不宣称已经接真实来电、写入订单或收款。',
    }),
    module({
      id: 'first-party-repeat-loop',
      source: 'Owner.com',
      wenaiModule: '复购与会员动作',
      loopStage: 'Recover',
      customerJob: '把官网、会员、复购和社群触达拆成可跟进动作。',
      input: ['活动页面', '会员规则', '社群分组', '复购优惠边界'],
      output: ['复购话术', '会员任务', '社群跟进清单'],
      evidence: ['活动页面截图', '会员规则确认', '社群汇总'],
      owner: '社群负责人',
      canShowNow: false,
      nextAction: '先定义会员或社群分组口径。',
      gate: '没有域名、订单、支付或会员授权前，只能做动作草稿。',
      stopLine: '不宣称真实订单增长、自动复购或会员归因。',
    }),
    module({
      id: 'guest-experience-recovery',
      source: 'SevenRooms',
      wenaiModule: '客情与评价回收',
      loopStage: 'Recover',
      customerJob: '把预约、评价、客情和服务反馈变成店长可处理的聚合信号。',
      input: ['预约数量', '评价摘要', '社群反馈', '到店意向'],
      output: ['高意向跟进', '评价回复建议', '服务风险提醒'],
      evidence: ['脱敏汇总表', '公开评价截图', '店长确认'],
      owner: '店长',
      canShowNow: true,
      nextAction: '导入预约、评价和到店意向汇总。',
      gate: '只保存聚合信号，不保存顾客身份或聊天原文。',
      stopLine: '不宣称已经拥有完整顾客档案或自动触达顾客。',
    }),
    module({
      id: 'cost-inventory-review',
      source: 'MarketMan',
      wenaiModule: '菜品成本/库存复核',
      loopStage: 'Review Loop',
      customerJob: '把库存、订货、成本、毛利和浪费控制转成负责人问题清单。',
      input: ['原料样表', '库存', '补货线', '采购成本', '损耗'],
      output: ['成本/库存样表', '补货提醒', '损耗问题', '财务确认项'],
      evidence: ['备货表', '采购样表', '财务汇总'],
      owner: '采购',
      canShowNow: true,
      nextAction: '先让采购和后厨复核样表。',
      gate: '销售、库存、采购和财务汇总约定补齐后再判断毛利。',
      stopLine: '不写真实毛利或库存优化结论。',
    }),
    module({
      id: 'multi-order-data-spine',
      source: 'Restaurant Ops',
      wenaiModule: '订单与菜单数据骨架',
      loopStage: 'Review Loop',
      customerJob: '为后续多渠道订单、菜单同步、核销和经营复盘预留字段。',
      input: ['菜单字段', '核销汇总', '订单汇总', '平台反馈'],
      output: ['数据字段清单', '导入模板', '经营复盘门禁'],
      evidence: ['字段字典', '脱敏汇总样表', '负责人确认'],
      owner: '老板',
      canShowNow: false,
      nextAction: '先确定字段字典和数据负责人。',
      gate: '没有数据约定前只做模板和字段检查。',
      stopLine: '不宣称真实经营归因、自动核销或订单同步。',
    }),
  ];

  const loopStages = new Set(modules.map(item => item.loopStage)).size;
  const visibleNow = modules.filter(item => item.canShowNow).length;
  const ownerNextActions = modules.slice(0, 6).map(item => ({
    owner: item.owner,
    action: item.nextAction,
    evidenceRequired: item.evidence[0],
  }));

  return {
    ok: true,
    payloadShape: 'restaurant-competitor-capability-matrix-v1',
    generatedAt: (input.now || new Date()).toISOString(),
    restaurantName,
    offerName,
    summary: {
      modules: modules.length,
      loopStages,
      visibleNow,
      gated: modules.length - visibleNow,
      canClaimCompetitorParity: false,
      canClaimAutomaticPublishing: false,
      canClaimTrueOperatingAttribution: false,
    },
    modules,
    firstScreenModules: modules.filter(item => item.canShowNow).slice(0, 4),
    advancedModules: modules.filter(item => !item.canShowNow),
    ownerNextActions,
    externalGates: Array.from(new Set(modules.map(item => item.gate))).slice(0, 8),
    safetyBoundary: 'Competitor capability matrix converts benchmarks into Wenai modules, owners, evidence and gates. It does not claim competitor parity, automatic publishing, finished-video automation, live phone answering, order attribution, real margin analysis or private data storage.',
  };
}

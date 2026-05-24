import { buildRestaurantGrantChecklist, type RestaurantGrantChecklist } from '@/lib/restaurant-agent-grant-checklist';

export type RestaurantActivationGateStatus = 'ready' | 'blocked' | 'forbidden';

export type RestaurantActivationGate = {
  id: 'auto-publish' | 'auto-acquisition' | 'auto-redemption' | 'operating-analysis' | 'private-message-reading';
  name: string;
  status: RestaurantActivationGateStatus;
  customerPromise: string;
  canDoInternallyNow: string[];
  mustHaveExternal: string[];
  blockingReason: string;
  nextAction: string;
  evidenceRequired: string[];
  safetyBoundary: string;
};

export type RestaurantActivationGateReport = {
  ok: true;
  payloadShape: 'restaurant-agent-activation-gates-v1';
  gates: RestaurantActivationGate[];
  summary: {
    total: number;
    ready: number;
    blocked: number;
    forbidden: number;
    internalAlternatives: number;
  };
  checklist: Pick<RestaurantGrantChecklist, 'payloadShape' | 'checklistId' | 'merchant' | 'summary'>;
  audit: {
    secretsIncluded: false;
    privateDataIncluded: false;
    fakeResultsIncluded: false;
  };
  answerToCustomer: string;
};

function gate(input: RestaurantActivationGate): RestaurantActivationGate {
  return input;
}

export function buildRestaurantActivationGates(input: {
  restaurant?: string;
  operator?: string;
  expiresAt?: string;
  revoked?: boolean;
  env?: Record<string, string | undefined>;
  now?: Date;
} = {}): RestaurantActivationGateReport {
  const checklist = buildRestaurantGrantChecklist(input);
  const blockedMap = new Map(checklist.blockedCapabilities.map(item => [item.capability, item]));
  const autoPublishReady = checklist.summary.canEnableAutoPublish;
  const receiptReady = checklist.summary.canEnableReceiptCapture;
  const posReady = checklist.summary.canEnablePosImport;
  const analysisReady = checklist.summary.canEnableOperatingAnalysis;

  const gates: RestaurantActivationGate[] = [
    gate({
      id: 'auto-publish',
      name: '自动发布',
      status: autoPublishReady ? 'ready' : 'blocked',
      customerPromise: '把已审批内容交给受控浏览器 runtime，在授权平台账号内提交，并写回签名回执。',
      canDoInternallyNow: ['生成平台发布草稿', '生成发布步骤', '生成证据字段', '生成执行投递包', '校验签名回执'],
      mustHaveExternal: ['商家平台账号授权', '隔离浏览器 profile', 'Lobu/OpenClaw/Hermes runtime', 'callback secret', '每次发布前运营审批'],
      blockingReason: autoPublishReady ? '' : blockedMap.get('auto-publish')?.reason || 'External publishing gates are missing.',
      nextAction: autoPublishReady ? 'Run a controlled external execution package and require signed receipt validation.' : '先补 Grant Checklist Wizard 里的平台授权、runtime、browser profile 和 callback gates。',
      evidenceRequired: ['content id', 'posted link', 'screenshot id', 'externalRunId', 'operator approval'],
      safetyBoundary: '不绕过登录、验证码或平台审核；没有授权时只生成草稿和手工发布清单。',
    }),
    gate({
      id: 'auto-acquisition',
      name: '自动获客',
      status: receiptReady ? 'ready' : 'blocked',
      customerPromise: '只在真实发布回执、预约/券领取/咨询聚合数据回流后，把线索信号交给店长跟进。',
      canDoInternallyNow: ['生成获客内容计划', '导入发布链接或截图', '汇总手工录入的预约/领券/咨询数量', '生成负责人下一步动作'],
      mustHaveExternal: ['发布回执', '平台线索聚合导出或 webhook', '商家授权的数据使用边界', '去标识化字段合同'],
      blockingReason: receiptReady ? '' : blockedMap.get('receipt-capture')?.reason || 'Receipt and lead-signal capture gates are missing.',
      nextAction: receiptReady ? 'Attach platform receipt capture and aggregate lead-count callbacks.' : '先让平台回执或手工证据进入验收账本，不要宣称自动获客。',
      evidenceRequired: ['source channel', 'time window', 'aggregate count', 'evidence link or screenshot', 'owner'],
      safetyBoundary: '不读取或保存私信原文、手机号、微信号、顾客姓名等可识别信息。',
    }),
    gate({
      id: 'auto-redemption',
      name: '自动核销',
      status: posReady ? 'ready' : 'blocked',
      customerPromise: '读取授权导出的核销聚合数据，进入 POS import validator 和经营信号聚合。',
      canDoInternallyNow: ['校验脱敏 POS 样表', '聚合领券/核销/订单/销售额', '生成可审计回执草稿'],
      mustHaveExternal: ['POS/API 或 CSV/sheet 导出', '字段字典', '核销来源', '商家数据授权合同'],
      blockingReason: posReady ? '' : blockedMap.get('pos-import')?.reason || 'POS and redemption contract gates are missing.',
      nextAction: posReady ? 'Import governed redemption aggregates and reject row-level private data.' : '先拿一张脱敏 POS/核销样表跑 validator；没合同前不能自动核销。',
      evidenceRequired: ['data mode', 'field dictionary', 'redemption source', 'import batch id', 'aggregate counts'],
      safetyBoundary: '不写回核销、不保存订单明细、支付流水、手机号、地址或顾客身份。',
    }),
    gate({
      id: 'operating-analysis',
      name: '真实经营分析',
      status: analysisReady ? 'ready' : 'blocked',
      customerPromise: '只基于已验收的发布回执、预约/领券/核销聚合数和 POS 摘要，输出下一轮经营动作。',
      canDoInternallyNow: ['分析手工导入的聚合样表', '生成库存/核销/客单复盘', '把结论写入门店记忆和 watcher'],
      mustHaveExternal: ['真实 POS 或核销聚合数据', '平台线索聚合数据', '字段口径', '时间窗口和门店范围'],
      blockingReason: analysisReady ? '' : blockedMap.get('operating-analysis')?.reason || 'Operating analysis needs accepted business aggregates.',
      nextAction: analysisReady ? 'Run business-signal aggregation after receipt/POS validation.' : '先让核销和线索聚合数据通过回执或 POS validator，再做经营分析。',
      evidenceRequired: ['accepted receipt', 'POS aggregate batch', 'source channel', 'time window', 'owner'],
      safetyBoundary: '不编造增长数字，不用生成内容数量代替经营结果。',
    }),
    gate({
      id: 'private-message-reading',
      name: '私信原文读取',
      status: 'forbidden',
      customerPromise: '不提供。',
      canDoInternallyNow: ['使用商家手工提供的脱敏摘要或聚合数量'],
      mustHaveExternal: [],
      blockingReason: '私信原文和顾客身份信息永久禁止进入系统。',
      nextAction: '只接收商家确认过的聚合数或脱敏主题摘要。',
      evidenceRequired: [],
      safetyBoundary: '不读取、不存储、不展示私信原文、手机号、微信号、顾客姓名或可识别身份信息。',
    }),
  ];

  const ready = gates.filter(item => item.status === 'ready').length;
  const forbidden = gates.filter(item => item.status === 'forbidden').length;
  const internalAlternatives = gates.reduce((sum, item) => sum + item.canDoInternallyNow.length, 0);

  return {
    ok: true,
    payloadShape: 'restaurant-agent-activation-gates-v1',
    gates,
    summary: {
      total: gates.length,
      ready,
      blocked: gates.filter(item => item.status === 'blocked').length,
      forbidden,
      internalAlternatives,
    },
    checklist: {
      payloadShape: checklist.payloadShape,
      checklistId: checklist.checklistId,
      merchant: checklist.merchant,
      summary: checklist.summary,
    },
    audit: {
      secretsIncluded: false,
      privateDataIncluded: false,
      fakeResultsIncluded: false,
    },
    answerToCustomer: ready
      ? `已有 ${ready} 个能力具备受控执行条件；其余能力仍按缺口清单处理。`
      : '当前能内部跑的是草稿、任务、证据、回执校验、POS 脱敏样表和经营信号聚合；真正自动发布/获客/核销/经营分析必须先补外部授权和数据合同。',
  };
}

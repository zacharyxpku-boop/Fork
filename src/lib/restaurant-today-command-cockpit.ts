import type { RestaurantAiCockpit } from '@/lib/restaurant-ai-cockpit';
import type { RestaurantLeadSandboxAcceptanceFlow } from '@/lib/restaurant-lead-sandbox-acceptance-flow';
import type { RestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import type { RestaurantOperatingInsightReport } from '@/lib/restaurant-operating-insight-report';
import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import type { RestaurantPublishExecutionInbox } from '@/lib/restaurant-publish-execution-inbox';
import type { RestaurantShiftOperatingLoopPack } from '@/lib/restaurant-shift-operating-loop-pack';
import type { RestaurantStoreOperatingPlan, RestaurantStoreOperatingTimeBlock } from '@/lib/restaurant-store-operating-plan';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantTodayCommandLaneId =
  | 'get-customers'
  | 'publish-proof'
  | 'redeem-and-pos'
  | 'review-and-train';

export type RestaurantTodayCommandLane = {
  id: RestaurantTodayCommandLaneId;
  title: string;
  status: 'run-now' | 'needs-proof' | 'provider-gated' | 'blocked';
  owner: 'store-manager' | 'ops' | 'runtime-admin' | 'finance' | 'community-ops';
  businessQuestion: string;
  todayAction: string;
  proofToCollect: string[];
  providerGate: string[];
  acceptance: string;
  stopLine: string;
  sourceEvidence: string[];
};

export type RestaurantTodayCommandCockpit = {
  ok: true;
  payloadShape: 'restaurant-today-command-cockpit-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'operator-ready' | 'proof-first' | 'provider-unlock-first' | 'blocked-sensitive';
  summary: {
    lanes: number;
    runNow: number;
    needsProof: number;
    providerGated: number;
    blocked: number;
    providerHealthReady: number;
    acceptedLeadReceipts: number;
    acceptedPublishReceipts: number;
    measuredInsights: number;
    canClaimAutoPublish: false;
    canClaimAutoAcquisition: false;
    canClaimAutoRedemption: false;
    canClaimTrueOperatingAnalysis: false;
  };
  nextBestAction: {
    laneId: RestaurantTodayCommandLaneId;
    owner: RestaurantTodayCommandLane['owner'];
    action: string;
    reason: string;
    evidenceRequired: string[];
  };
  lanes: RestaurantTodayCommandLane[];
  oneScreenRunbook: string[];
  staffHandoff: Array<{
    owner: RestaurantTodayCommandLane['owner'];
    message: string;
    due: string;
    evidence: string;
  }>;
  externalUnlocks: string[];
  proofLedgerContract: {
    acceptedProof: string[];
    rejectedProof: string[];
    memoryWriteRule: 'accepted-proof-or-sanitized-aggregate-only';
    forbiddenFields: string[];
  };
  sourceSnapshots: {
    aiCockpit: Pick<RestaurantAiCockpit, 'payloadShape' | 'verdict' | 'summary'>;
    shiftLoop: Pick<RestaurantShiftOperatingLoopPack, 'payloadShape' | 'verdict' | 'summary' | 'nextBestAction'>;
    leadFlow: Pick<RestaurantLeadSandboxAcceptanceFlow, 'payloadShape' | 'verdict' | 'summary'>;
    publishInbox: Pick<RestaurantPublishExecutionInbox, 'payloadShape' | 'verdict' | 'summary'>;
    insightReport: Pick<RestaurantOperatingInsightReport, 'payloadShape' | 'verdict' | 'summary'>;
  };
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string, max = 120): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function unique(values: string[], limit = 18): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function firstBlock(plan: RestaurantStoreOperatingPlan, id: string): RestaurantStoreOperatingTimeBlock | undefined {
  return plan.dayPlan.find(item => item.id === id) || plan.weekPlan.find(item => item.id === id);
}

function lane(input: RestaurantTodayCommandLane): RestaurantTodayCommandLane {
  return input;
}

function statusFrom(input: { blocked?: boolean; provider?: boolean; proof?: boolean }): RestaurantTodayCommandLane['status'] {
  if (input.blocked) return 'blocked';
  if (input.provider) return 'provider-gated';
  if (input.proof) return 'needs-proof';
  return 'run-now';
}

function nextBestAction(lanes: RestaurantTodayCommandLane[]): RestaurantTodayCommandCockpit['nextBestAction'] {
  const selected = lanes.find(item => item.status === 'blocked')
    || lanes.find(item => item.status === 'provider-gated')
    || lanes.find(item => item.status === 'needs-proof')
    || lanes[0];
  return {
    laneId: selected.id,
    owner: selected.owner,
    action: selected.todayAction,
    reason: selected.businessQuestion,
    evidenceRequired: selected.proofToCollect,
  };
}

function shiftOwnerToLaneOwner(owner: RestaurantShiftOperatingLoopPack['nextBestAction']['owner']): RestaurantTodayCommandLane['owner'] {
  if (owner === 'data-ops') return 'finance';
  if (owner === 'merchant') return 'store-manager';
  return owner;
}

export function buildRestaurantTodayCommandCockpit(input: RestaurantTrialIntake & {
  aiCockpit: RestaurantAiCockpit;
  storeOperatingPlan: RestaurantStoreOperatingPlan;
  shiftOperatingLoopPack: RestaurantShiftOperatingLoopPack;
  leadSandboxAcceptanceFlow: RestaurantLeadSandboxAcceptanceFlow;
  publishExecutionInbox: RestaurantPublishExecutionInbox;
  operatingDataContract: RestaurantOperatingDataContract;
  operatingInsightReport: RestaurantOperatingInsightReport;
  providerReadinessHealth: RestaurantProviderReadinessHealth;
  now?: Date;
}): RestaurantTodayCommandCockpit {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, input.aiCockpit.restaurant || input.storeOperatingPlan.restaurant);
  const offer = clean(input.offer, input.aiCockpit.offer || input.storeOperatingPlan.offer);
  const trafficBlock = firstBlock(input.storeOperatingPlan, 'dinner-traffic');
  const proofBlock = firstBlock(input.storeOperatingPlan, 'content-proof');
  const closeoutBlock = firstBlock(input.storeOperatingPlan, 'closeout-review');
  const dataBlock = firstBlock(input.storeOperatingPlan, 'week-day3');
  const leadFlow = input.leadSandboxAcceptanceFlow;
  const publishInbox = input.publishExecutionInbox;
  const insightReport = input.operatingInsightReport;

  const lanes = [
    lane({
      id: 'get-customers',
      title: '把顾客引到店里',
      status: statusFrom({
        blocked: leadFlow.verdict === 'blocked-sensitive',
        provider: !leadFlow.summary.canSubmitProviderPackage && leadFlow.summary.acceptedLeadReceipts === 0,
        proof: leadFlow.summary.acceptedLeadReceipts === 0,
      }),
      owner: 'community-ops',
      businessQuestion: '今天能把预约、领券、咨询和到店意向变成店长可见的跟进任务吗？',
      todayAction: leadFlow.summary.acceptedLeadReceipts > 0
        ? '把已验收汇总线索回执推进为店长跟进任务。'
        : trafficBlock?.action || '创建经员工审核的预约、领券和咨询跟进任务。',
      proofToCollect: leadFlow.receiptAcceptance.acceptedEvidence,
      providerGate: unique([
        ...leadFlow.externalRequired,
        ...leadFlow.sanitizedProviderPackage.lanes.flatMap(item => item.providerUnlocks),
      ], 6),
      acceptance: leadFlow.receiptAcceptance.closeoutRule,
      stopLine: leadFlow.safetyBoundary,
      sourceEvidence: [`leadFlow:${leadFlow.verdict}`, `acceptedLeadReceipts:${leadFlow.summary.acceptedLeadReceipts}`],
    }),
    lane({
      id: 'publish-proof',
      title: '只用凭证槽发布',
      status: statusFrom({
        provider: publishInbox.summary.waitingProvider > 0 && publishInbox.summary.acceptedReceipts === 0,
        proof: publishInbox.summary.acceptedReceipts === 0,
        blocked: publishInbox.summary.blocked > 0,
      }),
      owner: 'ops',
      businessQuestion: '内容能用公开凭证链接、截图 id 或签名回调替代口头宣称吗？',
      todayAction: publishInbox.summary.acceptedReceipts > 0
        ? '在下一轮内容和跟进循环中使用已验收发布凭证。'
        : proofBlock?.action || publishInbox.tasks[0]?.action || '准备已审批内容和公开凭证槽。',
      proofToCollect: unique(publishInbox.tasks.flatMap(item => item.evidenceRequired), 8),
      providerGate: publishInbox.providerUnlocks.slice(0, 8),
      acceptance: '收尾前每条发布项必须有渠道、凭证 id、负责人和下一轮用途。',
      stopLine: publishInbox.safetyBoundary,
      sourceEvidence: [`publishInbox:${publishInbox.verdict}`, `acceptedPublishReceipts:${publishInbox.summary.acceptedReceipts}`],
    }),
    lane({
      id: 'redeem-and-pos',
      title: '核销券码并导入 POS 汇总',
      status: statusFrom({
        provider: !input.operatingDataContract.summary.canClaimTrueOperatingAnalysis,
        proof: insightReport.summary.acceptedPosImports === 0,
        blocked: insightReport.summary.blocked > 0 && insightReport.summary.acceptedPosImports === 0,
      }),
      owner: 'finance',
      businessQuestion: '能从脱敏汇总数据说清楚券码核销、订单和销售吗？',
      todayAction: insightReport.summary.acceptedPosImports > 0
        ? insightReport.storeManagerActions[0]?.action || '复核汇总核销和 POS 信号。'
        : dataBlock?.action || '导入脱敏 POS、券码和核销汇总字段。',
      proofToCollect: unique([
        'businessDate',
        'storeName',
        'offerName',
        'couponClaimCount',
        'redemptionCount',
        'grossSales',
        'orderCount',
        ...input.operatingDataContract.tracks.flatMap(item => item.requiredFields).slice(0, 4),
      ], 10),
      providerGate: input.operatingDataContract.providerSetupRequests.map(item => `${item.provider}: ${item.evidenceRequired}`).slice(0, 8),
      acceptance: '经营分析只限于已验收汇总行和字段字典凭证。',
      stopLine: insightReport.safetyBoundary,
      sourceEvidence: [`operatingInsight:${insightReport.verdict}`, `posImports:${insightReport.summary.acceptedPosImports}`],
    }),
    lane({
      id: 'review-and-train',
      title: '复盘班次并训练智能体',
      status: statusFrom({
        provider: input.shiftOperatingLoopPack.summary.waitingProvider > 0,
        proof: input.shiftOperatingLoopPack.summary.waitingProof > 0,
        blocked: input.shiftOperatingLoopPack.summary.blocked > 0,
      }),
      owner: shiftOwnerToLaneOwner(input.shiftOperatingLoopPack.nextBestAction.owner),
      businessQuestion: '下一班次能从已验收凭证、训练记录和单一下一步动作出发吗？',
      todayAction: input.shiftOperatingLoopPack.nextBestAction.label || closeoutBlock?.action || '用凭证和训练关闭循环。',
      proofToCollect: unique([
        ...input.shiftOperatingLoopPack.providerReceiptInbox.externalRequired,
        ...input.shiftOperatingLoopPack.shiftCloseoutTrainingPack.externalRequired,
        '已验收回执',
        '员工确认',
        '脱敏汇总导入',
      ], 8),
      providerGate: input.shiftOperatingLoopPack.externalRequired.slice(0, 8),
      acceptance: '下一班次只能复用已验收凭证、员工确认、脱敏汇总导入或已验收训练记录。',
      stopLine: input.shiftOperatingLoopPack.safetyBoundary,
      sourceEvidence: [`shiftLoop:${input.shiftOperatingLoopPack.verdict}`, `activatedInternal:${input.shiftOperatingLoopPack.summary.activatedInternal}`],
    }),
  ];

  const runNow = lanes.filter(item => item.status === 'run-now').length;
  const needsProof = lanes.filter(item => item.status === 'needs-proof').length;
  const providerGated = lanes.filter(item => item.status === 'provider-gated').length;
  const blocked = lanes.filter(item => item.status === 'blocked').length;
  const verdict: RestaurantTodayCommandCockpit['verdict'] = blocked > 0
    ? 'blocked-sensitive'
    : providerGated > 0
      ? 'provider-unlock-first'
      : needsProof > 0
        ? 'proof-first'
        : 'operator-ready';

  return {
    ok: true,
    payloadShape: 'restaurant-today-command-cockpit-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    verdict,
    summary: {
      lanes: lanes.length,
      runNow,
      needsProof,
      providerGated,
      blocked,
      providerHealthReady: input.providerReadinessHealth.summary.healthReady,
      acceptedLeadReceipts: leadFlow.summary.acceptedLeadReceipts,
      acceptedPublishReceipts: publishInbox.summary.acceptedReceipts,
      measuredInsights: insightReport.summary.measured,
      canClaimAutoPublish: false,
      canClaimAutoAcquisition: false,
      canClaimAutoRedemption: false,
      canClaimTrueOperatingAnalysis: false,
    },
    nextBestAction: nextBestAction(lanes),
    lanes,
    oneScreenRunbook: [
      `从 ${offer} 开始：任何外部动作前确认活动边界、负责人和凭证槽。`,
      '以四条链路跑线索承接、发布、核销/POS 和复盘，每条链路保持可见凭证和停止线。',
      '把外部通道条件当做精确的配置请求：试跑通道 URL/密钥、回调密钥、店长授权、浏览器配置文件和去隐私数据合同。',
      '只把已验收回执或脱敏汇总导入推进到记忆、训练和下一班次计划。',
    ],
    staffHandoff: lanes.map(item => ({
      owner: item.owner,
      message: `${item.title}: ${item.todayAction}`,
      due: item.id === 'review-and-train' ? '收尾' : item.id === 'redeem-and-pos' ? '收尾前' : '今天',
      evidence: item.proofToCollect.slice(0, 3).join(' / ') || '已验收凭证',
    })),
    externalUnlocks: unique([
      ...input.providerReadinessHealth.externalRequired,
      ...lanes.flatMap(item => item.providerGate),
    ], 20),
    proofLedgerContract: {
      acceptedProof: ['公开 URL', '截图 id', '签名回执', '员工确认', '脱敏汇总导入'],
      rejectedProof: ['样本链接', '未签名回调', '私信文本', '顾客标识', '原始 POS 行', '券码', '支付 id', '密钥值'],
      memoryWriteRule: 'accepted-proof-or-sanitized-aggregate-only',
      forbiddenFields: ['phone', 'WeChat ID', 'member name', 'private message body', 'coupon code', 'payment id', 'cookie', 'token', 'raw POS row', 'browser profile secret'],
    },
    sourceSnapshots: {
      aiCockpit: {
        payloadShape: input.aiCockpit.payloadShape,
        verdict: input.aiCockpit.verdict,
        summary: input.aiCockpit.summary,
      },
      shiftLoop: {
        payloadShape: input.shiftOperatingLoopPack.payloadShape,
        verdict: input.shiftOperatingLoopPack.verdict,
        summary: input.shiftOperatingLoopPack.summary,
        nextBestAction: input.shiftOperatingLoopPack.nextBestAction,
      },
      leadFlow: {
        payloadShape: leadFlow.payloadShape,
        verdict: leadFlow.verdict,
        summary: leadFlow.summary,
      },
      publishInbox: {
        payloadShape: publishInbox.payloadShape,
        verdict: publishInbox.verdict,
        summary: publishInbox.summary,
      },
      insightReport: {
        payloadShape: insightReport.payloadShape,
        verdict: insightReport.verdict,
        summary: insightReport.summary,
      },
    },
    safetyBoundary: '今日指挥台是面向店长的经营操作面。只协调内部任务、凭证槽、外部条件和员工交接；不发布、不联系顾客、不确认预约、不核销券码、不写入 POS/订单、不收款、不派送、不读取私信、不存储个人信息、不暴露密钥、不拉取原始 POS 行、无已验收凭证和店长授权外部通道不宣称增长。',
  };
}

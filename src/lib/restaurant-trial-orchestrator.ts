import { buildRestaurantBusinessSignals, type RestaurantBusinessSignalReport } from '@/lib/restaurant-agent-business-signals';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantContentDeliveryPack, type RestaurantContentChannel, type RestaurantContentDeliveryPack } from '@/lib/restaurant-content-delivery-pack';
import { buildRestaurantStoreManagerFollowupPack, type RestaurantStoreManagerFollowupPack } from '@/lib/restaurant-store-manager-followup';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';
import { buildRestaurantTrialWorkflowPack, type RestaurantTrialWorkflowPack } from '@/lib/restaurant-trial-workflow-pack';
import { buildStandardPack, formatStandardPackFollowup, formatStandardPackMarkdown, getStandardPackExecutionPlan, type StandardPack, type StandardPackExecutionPlan } from '@/lib/sop-workflows';
import { POC_STANDARD_PACK_ROUTE } from '@/lib/standard-pack-routing';

export type RestaurantTrialOrchestratorStageId =
  | 'trial-intake'
  | 'standard-pack'
  | 'content-production'
  | 'publish-proof'
  | 'ops-followup';

export type RestaurantTrialOrchestratorStage = {
  id: RestaurantTrialOrchestratorStageId;
  title: string;
  status: 'ready' | 'needs-review' | 'external-gated';
  owner: 'merchant' | 'ops' | 'store-manager' | 'runtime-admin';
  evidence: string[];
  outputRef: string;
  nextAction: string;
};

export type RestaurantPublishProofSlot = {
  channel: string;
  requiredProof: string;
  status: 'waiting-proof' | 'accepted-proof';
  receiptId?: string;
  evidenceUrl?: string;
  screenshotId?: string;
};

export type RestaurantTrialOrchestratorPack = {
  ok: true;
  payloadShape: 'restaurant-trial-orchestrator-v1';
  generatedAt: string;
  spine: 'trial-input -> standard-pack -> content-production -> publish-proof -> ops-followup';
  intake: {
    restaurant: string;
    offer: string;
    audience: string;
    channels: string[];
    visitReason: string;
    constraints: string;
    evidence: string;
  };
  summary: {
    stages: number;
    readyStages: number;
    needsReviewStages: number;
    externalGatedStages: number;
    publishProofSlots: number;
    acceptedProofs: number;
    followupTasks: number;
    canRunInternallyToday: boolean;
    canClaimExternalExecution: false;
  };
  stages: RestaurantTrialOrchestratorStage[];
  standardPack: {
    route: string;
    pack: StandardPack;
    markdown: string;
    followup: string;
    executionPlan: StandardPackExecutionPlan;
  };
  trialWorkflow: RestaurantTrialWorkflowPack;
  contentDelivery: RestaurantContentDeliveryPack;
  publishProofLedger: RestaurantPublishProofSlot[];
  businessSignals: RestaurantBusinessSignalReport;
  followupPack: RestaurantStoreManagerFollowupPack;
  managerQueue: RestaurantStoreManagerFollowupPack['tasks'];
  externalGates: string[];
  safetyBoundary: string;
};

export type RestaurantTrialOrchestratorInput = RestaurantTrialIntake & {
  runs?: RestaurantAgentRunRecord[];
  receipts?: RestaurantAgentReceiptRecord[];
  now?: Date;
};

function cleanText(value: unknown, fallback: string, max = 160): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function splitChannels(value: string): string[] {
  const channels = value
    .split(/[\/,，、]/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 6);
  return channels.length ? channels : ['Dianping', 'Xiaohongshu', 'Douyin', 'WeChat group'];
}

function mapContentChannels(channels: string[]): RestaurantContentChannel[] {
  const mapped = channels.map(channel => {
    const lower = channel.toLowerCase();
    if (/dianping|点评|meituan|美团/.test(lower)) return 'dianping';
    if (/xhs|xiaohongshu|小红书/.test(lower)) return 'xiaohongshu';
    if (/douyin|抖音|tiktok/.test(lower)) return 'douyin';
    if (/wechat|wecom|微信|社群|私域/.test(lower)) return 'wechat';
    return undefined;
  }).filter((channel): channel is RestaurantContentChannel => Boolean(channel));

  return Array.from(new Set(mapped.length ? mapped : ['dianping', 'xiaohongshu', 'douyin']));
}

function buildAcceptedProofSlots(contentPack: RestaurantContentDeliveryPack, receipts: RestaurantAgentReceiptRecord[]): RestaurantPublishProofSlot[] {
  const acceptedReceipts = receipts.filter(receipt => receipt.status === 'accepted');

  return contentPack.publishProofSlots.map((slot, index) => {
    const receipt = acceptedReceipts[index];
    return {
      channel: slot.split(':')[0] || `channel-${index + 1}`,
      requiredProof: slot,
      status: receipt ? 'accepted-proof' : 'waiting-proof',
      receiptId: receipt?.receiptId,
      evidenceUrl: receipt?.evidenceUrl,
      screenshotId: receipt?.screenshotId,
    };
  });
}

function stageCounts(stages: RestaurantTrialOrchestratorStage[]) {
  return {
    readyStages: stages.filter(stage => stage.status === 'ready').length,
    needsReviewStages: stages.filter(stage => stage.status === 'needs-review').length,
    externalGatedStages: stages.filter(stage => stage.status === 'external-gated').length,
  };
}

export function buildRestaurantTrialOrchestratorPack(input: RestaurantTrialOrchestratorInput = {}): RestaurantTrialOrchestratorPack {
  const now = input.now || new Date();
  const restaurant = cleanText(input.restaurant, '试跑门店');
  const offer = cleanText(input.offer, '今日主推套餐');
  const audience = cleanText(input.audience, '附近食客');
  const visitReason = cleanText(input.visitReason, '今天来店的明确理由');
  const constraints = cleanText(input.constraints, '店长须审核价格、库存、券码规则和禁止宣称');
  const evidence = cleanText(input.evidence, '菜单截图、菜品照片、公开帖子链接或券码凭证');
  const channels = splitChannels(cleanText(input.channels, '点评 / 小红书 / 抖音 / 微信社群', 180));
  const runs = input.runs || [];
  const receipts = input.receipts || [];

  const standardPack = buildStandardPack({
    goal: `${visitReason}; audience: ${audience}; constraints: ${constraints}`,
    brand: restaurant,
    sku: offer,
    links: evidence,
    workflowId: 'batch-ugc',
  });
  const executionPlan = getStandardPackExecutionPlan(standardPack);
  const trialWorkflow = buildRestaurantTrialWorkflowPack({
    restaurant,
    offer,
    audience,
    channels: channels.join(' / '),
    visitReason,
    constraints,
    evidence,
  }, now);
  const contentDelivery = buildRestaurantContentDeliveryPack({
    restaurantName: restaurant,
    dishOrOffer: offer,
    audience,
    channels: mapContentChannels(channels),
    referenceEvidence: evidence,
    constraints,
  });
  const publishProofLedger = buildAcceptedProofSlots(contentDelivery, receipts);
  const businessSignals = buildRestaurantBusinessSignals(runs, receipts, now);
  const followupPack = buildRestaurantStoreManagerFollowupPack({
    restaurant,
    offer,
    audience,
    channels: channels.join(' / '),
    visitReason,
    constraints,
    evidence,
    runs,
    receipts,
    now,
  });

  const stages: RestaurantTrialOrchestratorStage[] = [
    {
      id: 'trial-intake',
      title: '门店试跑录入',
      status: trialWorkflow.summary.canRunInternallyToday ? 'ready' : 'needs-review',
      owner: 'merchant',
      evidence: trialWorkflow.evidenceChecklist.slice(0, 3),
      outputRef: trialWorkflow.workOrder.eventId,
      nextAction: trialWorkflow.workflowSteps[0]?.nextAction || '确认门店活动边界。',
    },
    {
      id: 'standard-pack',
      title: '门店标准交付包',
      status: standardPack.readiness.decision === 'hypothesis-only' ? 'needs-review' : 'ready',
      owner: 'ops',
      evidence: standardPack.readiness.reviewChecklist.slice(0, 3),
      outputRef: POC_STANDARD_PACK_ROUTE,
      nextAction: standardPack.readiness.nextStepLabel,
    },
    {
      id: 'content-production',
      title: '本地内容与短视频生产包',
      status: contentDelivery.status === 'ready_for_manager_review' ? 'ready' : 'needs-review',
      owner: 'ops',
      evidence: contentDelivery.managerReviewChecklist.slice(0, 3),
      outputRef: contentDelivery.title,
      nextAction: contentDelivery.followUpTasks[0] || '发布前审查脚本和 B-roll 素材。',
    },
    {
      id: 'publish-proof',
      title: '发布凭证台账',
      status: publishProofLedger.some(slot => slot.status === 'accepted-proof') ? 'ready' : 'needs-review',
      owner: 'runtime-admin',
      evidence: publishProofLedger.map(slot => slot.requiredProof).slice(0, 4),
      outputRef: `proof-slots:${publishProofLedger.length}`,
      nextAction: '经营宣称前收齐公开链接、截图、签名回执或脱敏汇总凭证。',
    },
    {
      id: 'ops-followup',
      title: '店长跟进队列',
      status: followupPack.summary.blocked > 0 ? 'needs-review' : 'ready',
      owner: 'store-manager',
      evidence: followupPack.managerBrief,
      outputRef: `followup-tasks:${followupPack.summary.tasks}`,
      nextAction: followupPack.tasks[0]?.action || '等待已验收凭证再分配跟进任务。',
    },
  ];
  const counts = stageCounts(stages);
  const acceptedProofs = publishProofLedger.filter(slot => slot.status === 'accepted-proof').length;

  return {
    ok: true,
    payloadShape: 'restaurant-trial-orchestrator-v1',
    generatedAt: now.toISOString(),
    spine: 'trial-input -> standard-pack -> content-production -> publish-proof -> ops-followup',
    intake: {
      restaurant,
      offer,
      audience,
      channels,
      visitReason,
      constraints,
      evidence,
    },
    summary: {
      stages: stages.length,
      ...counts,
      publishProofSlots: publishProofLedger.length,
      acceptedProofs,
      followupTasks: followupPack.summary.tasks,
      canRunInternallyToday: stages.every(stage => stage.status !== 'external-gated'),
      canClaimExternalExecution: false,
    },
    stages,
    standardPack: {
      route: POC_STANDARD_PACK_ROUTE,
      pack: standardPack,
      markdown: formatStandardPackMarkdown(standardPack),
      followup: formatStandardPackFollowup(standardPack),
      executionPlan,
    },
    trialWorkflow,
    contentDelivery,
    publishProofLedger,
    businessSignals,
    followupPack,
    managerQueue: followupPack.tasks,
    externalGates: [
      '受控浏览器交接前需要服务端试跑通道配置和店长授权。',
      '读取平台或发布之前，先拿到店长的平台授权。',
      '凭证被验收前需要签名回执或公开链接/截图。',
      '经营汇总复盘前需要收银、核销、会员汇总数据约定。',
      '不读取原始私信、手机号、微信 ID 或订单级 POS 行。',
    ],
    safetyBoundary: '此编排器只组合本地产包、凭证槽和负责人队列。不发布、不联系顾客、不核销券码、不读取私信、不拉取收银明细；没有试跑通道配置、店长授权、回执和数据约定时，只能保持待补资料。',
  };
}

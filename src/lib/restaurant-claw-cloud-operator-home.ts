import type { RestaurantAgentCommandCenter } from '@/lib/restaurant-agent-command-center';
import type { RestaurantDefaultPathForwardableBrief } from '@/lib/restaurant-default-path-forwardable-brief';
import type { RestaurantProviderKeyGapBoard } from '@/lib/restaurant-provider-key-gap-board';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantClawCloudHomeLane = {
  id: 'ask-ai-employee' | 'run-shift' | 'publish-and-proof' | 'leads-and-redemption' | 'provider-unlock';
  label: string;
  status: 'ready-internal' | 'needs-review' | 'provider-gated' | 'data-gated';
  owner: 'ai-employee' | 'store-manager' | 'ops' | 'runtime-admin' | 'data-ops';
  customerPromise: string;
  actionNow: string;
  visibleProof: string;
  externalNeeded: string[];
  stopLine: string;
};

export type RestaurantClawCloudOperatorHome = {
  ok: true;
  payloadShape: 'restaurant-claw-cloud-operator-home-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  positioning: 'claw-cloud-style-ai-employee-home';
  hero: {
    title: string;
    status: 'working-internally' | 'waiting-provider' | 'waiting-proof';
    promise: string;
    primaryAction: string;
    secondaryAction: string;
  };
  summary: {
    lanes: number;
    readyInternal: number;
    needsReview: number;
    providerGated: number;
    dataGated: number;
    canUseAsAiEmployeeToday: boolean;
    canClaimExternalAutomation: false;
  };
  lanes: RestaurantClawCloudHomeLane[];
  aiEmployeeBrief: string[];
  ownerQueue: string[];
  providerQueue: string[];
  evidenceQueue: string[];
  redactedFields: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function unique(values: string[], limit = 10): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function countStatus(lanes: RestaurantClawCloudHomeLane[], status: RestaurantClawCloudHomeLane['status']) {
  return lanes.filter(lane => lane.status === status).length;
}

export function buildRestaurantClawCloudOperatorHome(input: RestaurantTrialIntake & {
  commandCenter: Pick<RestaurantAgentCommandCenter, 'mode' | 'headline' | 'primaryAction' | 'nextAction' | 'aiEmployeeInbox' | 'gmCommandDeck' | 'storeManagerTaskQueue' | 'externalRequired' | 'safetyBoundary'>;
  forwardableBrief?: RestaurantDefaultPathForwardableBrief;
  providerKeyGapBoard?: RestaurantProviderKeyGapBoard;
  now?: Date;
}): RestaurantClawCloudOperatorHome {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant || input.forwardableBrief?.restaurant, 'Trial restaurant');
  const offer = clean(input.offer || input.forwardableBrief?.offer, '今日主推套餐');
  const aiMessage = input.commandCenter.aiEmployeeInbox.messages[0];
  const gmLane = input.commandCenter.gmCommandDeck.lanes[0];
  const task = input.commandCenter.storeManagerTaskQueue.tasks[0];
  const providerGap = input.providerKeyGapBoard?.rows.find(row => row.status !== 'internal-ready');

  const lanes: RestaurantClawCloudHomeLane[] = [
    {
      id: 'ask-ai-employee',
      label: 'Ask AI employee',
      status: input.commandCenter.aiEmployeeInbox.summary.internalRunnable > 0 ? 'ready-internal' : 'needs-review',
      owner: 'ai-employee',
      customerPromise: '用户从一条 AI 店员回答开始，而不是一堆专家工具目录。',
      actionNow: aiMessage?.body || input.commandCenter.primaryAction.reason,
      visibleProof: input.commandCenter.aiEmployeeInbox.memory.slice(0, 4).map(item => `${item.label}:${item.value}`).join(' / '),
      externalNeeded: input.commandCenter.aiEmployeeInbox.externalRequired.slice(0, 4),
      stopLine: input.commandCenter.aiEmployeeInbox.safetyBoundary,
    },
    {
      id: 'run-shift',
      label: 'Run today shift',
      status: input.commandCenter.gmCommandDeck.summary.canRunWithoutProvider ? 'ready-internal' : 'needs-review',
      owner: 'store-manager',
      customerPromise: '开班简报、服务时段巡视和收尾连成一个门店班次循环。',
      actionNow: gmLane?.actionNow || input.commandCenter.gmCommandDeck.aiAutopilotQueue[0] || input.commandCenter.nextAction,
      visibleProof: gmLane?.visibleProof || 'owner task queue and staff handoff',
      externalNeeded: input.commandCenter.gmCommandDeck.providerQueue.slice(0, 4),
      stopLine: input.commandCenter.gmCommandDeck.safetyBoundary,
    },
    {
      id: 'publish-and-proof',
      label: '发布与凭证',
      status: 'provider-gated',
      owner: 'ops',
      customerPromise: '已审核的本地内容可以先在内部备好，真实平台发布要等凭证验收。',
      actionNow: '任何外部执行前，先准备一个已审核的渠道任务包和凭证槽。',
      visibleProof: 'public URL, screenshot id or signed callback receipt',
      externalNeeded: unique([
        'merchant platform authorization',
        'isolated browser profile',
        'callback secret',
        ...(input.providerKeyGapBoard?.rows.find(row => row.id === 'auto-publish')?.externalNeeded || []),
      ], 5),
      stopLine: '外部条件、店长授权和已验收公开回执齐之前，不宣称代发布。',
    },
    {
      id: 'leads-and-redemption',
      label: '线索与核销',
      status: 'data-gated',
      owner: 'data-ops',
      customerPromise: '预约、领券和 POS 汇总会变成跟进任务和收尾凭证。',
      actionNow: task?.action || '判断经营结果前，先导入线索、券码和 POS 的汇总字段。',
      visibleProof: task?.evidenceRequired || 'aggregate lead/redemption/POS import and accepted receipt',
      externalNeeded: unique([
        'lead source authorization',
        'coupon/POS field dictionary',
        'no-PII aggregate data contract',
        ...(input.providerKeyGapBoard?.rows.find(row => row.id === 'true-operating-analysis')?.externalNeeded || []),
      ], 5),
      stopLine: '顾客隐私、私信原文、券码、支付单号和原始 POS 行一概不进 AI 店员。',
    },
    {
      id: 'provider-unlock',
      label: '解锁外部执行',
      status: 'provider-gated',
      owner: 'runtime-admin',
      customerPromise: '每条对标自动化链路都有外部资料请求、回执字段和停止线。',
      actionNow: providerGap?.nextAction || '沙箱提交前先配通道地址/账号、回执密钥、店长授权和数据约定。',
      visibleProof: providerGap?.acceptanceEvidence.join(' / ') || 'provider health, signed callback and accepted receipt',
      externalNeeded: providerGap?.externalNeeded.slice(0, 5) || input.commandCenter.externalRequired.slice(0, 5),
      stopLine: providerGap?.stopLine || '外部凭证验收之前，外部执行保持关闭。',
    },
  ];

  const providerQueue = unique([
    ...lanes.flatMap(lane => lane.externalNeeded),
    ...(input.forwardableBrief?.externalRequired || []),
  ], 12);
  const ownerQueue = unique([
    input.forwardableBrief?.todayOperatingOrder[0]?.action || '',
    input.forwardableBrief?.todayOperatingOrder[2]?.action || '',
    input.commandCenter.primaryAction.reason,
    input.commandCenter.nextAction,
  ], 6);
  const evidenceQueue = unique([
    ...lanes.map(lane => `${lane.label}: ${lane.visibleProof}`),
    ...(input.forwardableBrief?.evidenceStatus.map(item => `${item.lane}: ${item.evidence}`) || []),
  ], 10);
  const heroStatus: RestaurantClawCloudOperatorHome['hero']['status'] =
    countStatus(lanes, 'provider-gated') > 0 ? 'waiting-provider'
      : countStatus(lanes, 'needs-review') > 0 ? 'waiting-proof'
        : 'working-internally';

  return {
    ok: true,
    payloadShape: 'restaurant-claw-cloud-operator-home-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    positioning: 'claw-cloud-style-ai-employee-home',
    hero: {
      title: 'Wenai 门店操作员已就绪，可以跑第一个受控班次',
      status: heroStatus,
      promise: `${restaurant} sees one AI employee command surface: ask, run shift, prepare publish proof, follow leads and unlock Provider lanes.`,
      primaryAction: input.commandCenter.primaryAction.label,
      secondaryAction: input.forwardableBrief?.headline || '生成一份可转发的经营简报',
    },
    summary: {
      lanes: lanes.length,
      readyInternal: countStatus(lanes, 'ready-internal'),
      needsReview: countStatus(lanes, 'needs-review'),
      providerGated: countStatus(lanes, 'provider-gated'),
      dataGated: countStatus(lanes, 'data-gated'),
      canUseAsAiEmployeeToday: countStatus(lanes, 'ready-internal') > 0,
      canClaimExternalAutomation: false,
    },
    lanes,
    aiEmployeeBrief: unique([
      input.commandCenter.headline,
      input.commandCenter.aiEmployeeInbox.messages[0]?.title || '',
      input.commandCenter.gmCommandDeck.answerForOwner,
      input.forwardableBrief?.operatorSummary || '',
    ], 5),
    ownerQueue,
    providerQueue,
    evidenceQueue,
    redactedFields: input.forwardableBrief?.redactedFields || [
      'api keys',
      'cookies',
      'private message text',
      'customer PII',
      'coupon codes',
      'payment ids',
      'raw POS rows',
    ],
    safetyBoundary: '操作台首页只是盖在本地任务、凭证队列和外部条件上的指挥界面。没有店长授权、外部条件、签名回执和汇总数据约定，不登录、不发布、不触达顾客、不核销、不读私信、不写 POS、不暴露密钥、不宣称外部自动化。',
  };
}

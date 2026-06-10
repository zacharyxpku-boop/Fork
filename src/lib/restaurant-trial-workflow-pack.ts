import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantDecision } from '@/lib/restaurant-decision-engine';
import { buildRestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantTrialWorkflowStepStatus = 'ready' | 'needs-review' | 'external-gated';

export type RestaurantTrialWorkflowStep = {
  id: string;
  title: string;
  status: RestaurantTrialWorkflowStepStatus;
  owner: 'merchant' | 'ops' | 'store-manager' | 'runtime-admin' | 'data-ops';
  inputNeeded: string[];
  output: string;
  evidenceRequired: string;
  nextAction: string;
};

export type RestaurantTrialWorkflowPack = {
  ok: true;
  payloadShape: 'restaurant-trial-workflow-pack';
  generatedAt: string;
  workOrder: {
    eventId: string;
    tenantId: string;
    restaurant: string;
    offer: string;
    audience: string;
    channels: string[];
    visitReason: string;
    constraints: string;
    owner: string;
  };
  summary: {
    steps: number;
    readySteps: number;
    needsReviewSteps: number;
    externalGatedSteps: number;
    canRunInternallyToday: boolean;
    canAutoExecuteExternally: boolean;
  };
  decisionBrief: {
    headline: string;
    decision: string;
    reasons: string[];
  };
  channelDrafts: Array<{
    channel: string;
    job: string;
    draft: string;
    proofRequired: string;
  }>;
  workflowSteps: RestaurantTrialWorkflowStep[];
  ownerQueue: Array<{
    owner: string;
    action: string;
    due: string;
    evidence: string;
  }>;
  evidenceChecklist: string[];
  trainingQueue: Array<{
    capability: string;
    material: string;
    acceptance: string;
  }>;
  externalUnlocks: Array<{
    capability: string;
    missing: string;
    providerRequest: string;
  }>;
  safetyBoundary: string;
};

function cleanText(value: unknown, fallback: string, max = 120): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function splitChannels(value: string): string[] {
  const channels = value
    .split(/[\/,，、|]/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 6);
  return channels.length ? channels : ['Dianping', 'Xiaohongshu', 'Douyin', 'WeChat group'];
}

function buildDecisionInput(input: RestaurantTrialIntake) {
  return {
    restaurant: cleanText(input.restaurant, 'Trial restaurant'),
    offer: cleanText(input.offer, 'Today featured set meal'),
    price: 168,
    foodCostRate: 0.36,
    availablePortions: 42,
    targetRevenue: 9800,
    yesterdayRevenue: 7200,
    couponClaims: 38,
    reservations: 11,
    privateMessages: 17,
    redemptions: 14,
    averageTicket: 156,
    serviceWindow: cleanText(input.visitReason, 'today dinner service', 80),
    owner: 'store-manager / community owner',
  };
}

export function buildRestaurantTrialWorkflowPack(input: RestaurantTrialIntake = {}, now = new Date()): RestaurantTrialWorkflowPack {
  const restaurant = cleanText(input.restaurant, '试跑餐厅');
  const offer = cleanText(input.offer, '今日主推套餐');
  const audience = cleanText(input.audience, '周边食客');
  const visitReason = cleanText(input.visitReason, '今日到店的明确理由');
  const constraints = cleanText(input.constraints, '店长须核查价格、库存、券码规则及禁止宣称事项');
  const channels = splitChannels(cleanText(input.channels, 'Dianping / Xiaohongshu / Douyin / WeChat group', 160));
  const evidence = cleanText(input.evidence, '菜单截图、菜品照片、公开帖子链接或券码凭证');
  const dispatch = buildRestaurantAgentDispatch({
    taskId: 'browser-publish-check',
    restaurant,
    offer,
    owner: 'ops',
    runtimeTarget: 'local',
    source: 'trial_workflow_pack',
  });
  const decision = buildRestaurantDecision(buildDecisionInput(input));
  const dataContract = buildRestaurantOperatingDataContract({ now });
  const canAutoExecuteExternally = dataContract.summary.canClaimAutoRedemption;

  const workflowSteps: RestaurantTrialWorkflowStep[] = [
    {
      id: 'intake',
      title: '确认餐厅活动简报',
      status: 'ready',
      owner: 'merchant',
      inputNeeded: ['restaurant', 'offer', 'audience', 'visitReason', 'constraints'],
      output: `${restaurant} / ${offer} 试跑工单`,
      evidenceRequired: evidence,
      nextAction: '店长确认活动边界、库存、价格及禁止宣称事项。',
    },
    {
      id: 'selling-points',
      title: '将菜品事实转化为到店理由',
      status: 'needs-review',
      owner: 'ops',
      inputNeeded: ['菜品照片', '菜单价格', '服务时段', 'audience'],
      output: decision.headline,
      evidenceRequired: '菜品事实及菜单凭证已由门店审核',
      nextAction: '选定最强的用餐场景后再生成内容。',
    },
    {
      id: 'local-content-plan',
      title: '生成本地内容计划',
      status: 'ready',
      owner: 'ops',
      inputNeeded: channels,
      output: `${decision.channelPack.length} 个渠道草稿及凭证要求`,
      evidenceRequired: '草稿文本、渠道、负责人、凭证字段及审批状态',
      nextAction: '审核草稿后，决定手动发布或使用受控浏览器执行手册。',
    },
    {
      id: 'browser-runbook',
      title: '准备受控浏览器执行手册',
      status: canAutoExecuteExternally ? 'ready' : 'external-gated',
      owner: 'runtime-admin',
      inputNeeded: ['试跑通道 URL/密钥', '隔离浏览器配置文件', '店长登录授权', '回执密钥'],
      output: '仅限交接的执行手册，待试跑通道与店长授权配置完成后启用',
      evidenceRequired: dispatch.workerPayload.evidenceRequired,
      nextAction: canAutoExecuteExternally
        ? '转交执行包并要求返回签名回执。'
        : '保持手动交接；试跑通道与授权未就绪前不宣称平台发布。',
    },
    {
      id: 'receipt-ledger',
      title: '收集发布与线索凭证',
      status: 'ready',
      owner: 'store-manager',
      inputNeeded: ['公开帖子链接', 'screenshotId', '预约数量', 'coupon claim count', 'visit intent count'],
      output: '手动或签名回执，可用于运行健康与业务信号',
      evidenceRequired: '公开链接、截图、externalRunId 或脱敏汇总回执',
      nextAction: '发布后导入凭证；被拒回执不进入经营分析。',
    },
    {
      id: 'operating-data',
      title: '挂载 POS、核销与利润合同',
      status: dataContract.summary.canClaimTrueOperatingAnalysis ? 'ready' : 'external-gated',
      owner: 'data-ops',
      inputNeeded: dataContract.importTemplate.slice(0, 6).map(item => item.field),
      output: '手动 POS/核销模板及外部资料申请',
      evidenceRequired: '脱敏汇总 POS/核销数据行、字段字典及店长授权',
      nextAction: '今日使用手动汇总导入；宣称真实经营分析前须申请 POS/财务字段。',
    },
    {
      id: 'follow-up',
      title: '分配门店跟进与记忆回写',
      status: 'ready',
      owner: 'store-manager',
      inputNeeded: ['已接受回执', '线索数量', 'owner', '下一步行动'],
      output: '店长跟进队列及可复用活动记忆',
      evidenceRequired: '负责人行动、截止时间、凭证来源及不含原始私信',
      nextAction: '通过预约、券码、到店意向或人工审核回执完成闭环。',
    },
  ];

  const externalUnlocks = decision.blockedAutomation.map(item => ({
    capability: item.capability,
    missing: item.missing,
    providerRequest: item.whyCompetitorsCan,
  }));

  const trainingQueue = [
    {
      capability: '餐厅活动简报',
      material: '菜单截图、菜品照片、价格、库存、服务时段及禁止宣称事项',
      acceptance: '店主可在无隐性假设的情况下审批简报。',
    },
    {
      capability: '本地渠道文案',
      material: '该餐厅品类的点评/小红书/抖音/微信群示例',
      acceptance: '每份草稿包含渠道、凭证要求、负责人及审批状态。',
    },
    {
      capability: '回执与跟进',
      material: '公开凭证链接、截图、预约/券码/到访汇总及下一步行动',
      acceptance: '不存储原始私信或客户标识符。',
    },
  ];

  const readySteps = workflowSteps.filter(step => step.status === 'ready').length;
  const needsReviewSteps = workflowSteps.filter(step => step.status === 'needs-review').length;
  const externalGatedSteps = workflowSteps.filter(step => step.status === 'external-gated').length;

  return {
    ok: true,
    payloadShape: 'restaurant-trial-workflow-pack',
    generatedAt: now.toISOString(),
    workOrder: {
      eventId: dispatch.eventId,
      tenantId: dispatch.tenantId,
      restaurant,
      offer,
      audience,
      channels,
      visitReason,
      constraints,
      owner: 'ops',
    },
    summary: {
      steps: workflowSteps.length,
      readySteps,
      needsReviewSteps,
      externalGatedSteps,
      canRunInternallyToday: readySteps + needsReviewSteps > externalGatedSteps,
      canAutoExecuteExternally,
    },
    decisionBrief: {
      headline: decision.headline,
      decision: decision.decision,
      reasons: decision.why,
    },
    channelDrafts: decision.channelPack.map(item => ({
      channel: item.channel,
      job: item.job,
      draft: item.copy,
      proofRequired: item.proof,
    })),
    workflowSteps,
    ownerQueue: decision.actionQueue,
    evidenceChecklist: [
      evidence,
      '手动发布后的公开帖子链接或截图',
      '预约、券码宣称、到店意向或人工审核汇总',
      '经营分析前的脱敏 POS/核销导出',
      '浏览器执行或平台读取前的店长授权',
    ],
    trainingQueue,
    externalUnlocks,
    safetyBoundary: '工作流包可作为内部工单、内容计划、凭证清单及跟进队列执行。在所需外部资料密钥、试跑通道、店长授权、回执及数据合同配置完成前，不宣称平台发布、线索捕获、核销、私信访问或真实 POS/财务分析。',
  };
}

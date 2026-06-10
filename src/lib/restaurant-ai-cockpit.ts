import type { RestaurantAiConsultantCopilot } from '@/lib/restaurant-ai-consultant-copilot';
import type { RestaurantProviderLaunchBoard } from '@/lib/restaurant-provider-launch-board';
import type { RestaurantStoreOperatingPlan } from '@/lib/restaurant-store-operating-plan';

export type RestaurantAiCockpitZoneId =
  | 'today-operations'
  | 'ai-consultant'
  | 'automation-launch'
  | 'evidence-review';

export type RestaurantAiCockpitZone = {
  id: RestaurantAiCockpitZoneId;
  title: string;
  status: 'ready-internal' | 'needs-evidence' | 'provider-gated' | 'blocked';
  owner: 'store-manager' | 'ops' | 'runtime-admin' | 'finance';
  answer: string;
  primaryAction: string;
  visibleProof: string[];
  providerGate: string;
  stopLine: string;
};

export type RestaurantAiCockpit = {
  ok: true;
  payloadShape: 'restaurant-ai-cockpit-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'usable-cockpit-now' | 'merchant-evidence-first' | 'provider-unlock-first';
  summary: {
    zones: number;
    readyInternal: number;
    needsEvidence: number;
    providerGated: number;
    blocked: number;
    todayBlocks: number;
    providerUnlocks: number;
    canClaimAutomation: boolean;
  };
  zones: RestaurantAiCockpitZone[];
  primaryRunbook: string[];
  evidenceBoard: string[];
  providerUnlocks: string[];
  sourceSnapshots: {
    operatingPlan: Pick<RestaurantStoreOperatingPlan, 'payloadShape' | 'verdict' | 'summary'>;
    consultant: Pick<RestaurantAiConsultantCopilot, 'payloadShape' | 'mode' | 'summary'>;
    providerLaunch: Pick<RestaurantProviderLaunchBoard, 'payloadShape' | 'summary'>;
  };
  safetyBoundary: string;
};

type CockpitInput = {
  storeOperatingPlan: RestaurantStoreOperatingPlan;
  aiConsultantCopilot: RestaurantAiConsultantCopilot;
  providerLaunchBoard: RestaurantProviderLaunchBoard;
  now?: Date;
};

function unique(values: string[], limit = 16) {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function zone(input: RestaurantAiCockpitZone): RestaurantAiCockpitZone {
  return input;
}

function statusFrom(counts: { providerGated?: number; needsEvidence?: number; blocked?: number }): RestaurantAiCockpitZone['status'] {
  if ((counts.blocked || 0) > 0) return 'blocked';
  if ((counts.providerGated || 0) > 0) return 'provider-gated';
  if ((counts.needsEvidence || 0) > 0) return 'needs-evidence';
  return 'ready-internal';
}

export function buildRestaurantAiCockpit(input: CockpitInput): RestaurantAiCockpit {
  const now = input.now || new Date();
  const operating = input.storeOperatingPlan;
  const consultant = input.aiConsultantCopilot;
  const provider = input.providerLaunchBoard;
  const firstToday = operating.dayPlan[0];
  const proofBlock = operating.dayPlan.find(item => item.id === 'content-proof');
  const closeoutBlock = operating.dayPlan.find(item => item.id === 'closeout-review');
  const launchOrder = provider.launchOrder[0];
  const zones = [
    zone({
      id: 'today-operations',
      title: 'Today Operations',
      status: statusFrom({
        providerGated: operating.dayPlan.filter(item => item.status === 'provider-gated').length,
        needsEvidence: operating.dayPlan.filter(item => item.status === 'needs-merchant-evidence').length,
      }),
      owner: 'store-manager',
      answer: firstToday?.action || '今天开始前确认活动内容、服务时段、负责人和凭证要求。',
      primaryAction: firstToday?.acceptance || '执行门店经营计划。',
      visibleProof: operating.dayPlan.slice(0, 4).map(item => `${item.window}: ${item.title}`),
      providerGate: operating.providerUnlocks.slice(0, 4).join(' / ') || 'none',
      stopLine: '价格、库存、服务时段或宣称边界未确认前不推流获客。',
    }),
    zone({
      id: 'ai-consultant',
      title: 'AI Consultant',
      status: statusFrom({
        providerGated: consultant.summary.providerGated,
        needsEvidence: consultant.summary.needsTraining,
        blocked: consultant.summary.forbidden,
      }),
      owner: 'ops',
      answer: consultant.executiveAnswer,
      primaryAction: consultant.actionPlays[0]?.title || '生成餐饮顾问处方。',
      visibleProof: consultant.actionPlays.slice(0, 3).map(item => `${item.owner}: ${item.title}`),
      providerGate: consultant.providerUnlocks.slice(0, 4).join(' / ') || 'none',
      stopLine: '建议只有在负责人、凭证和停止线可见后才变成任务。',
    }),
    zone({
      id: 'automation-launch',
      title: 'Automation Launch',
      status: provider.summary.canClaimExternalAutomation ? 'ready-internal' : 'provider-gated',
      owner: 'runtime-admin',
      answer: launchOrder?.action || '选择一条外部通道，在生产宣称前跑一次签名沙箱回执。',
      primaryAction: launchOrder?.evidenceRequired || '配置外部通道密钥、店长授权、回调和数据合同。',
      visibleProof: provider.capabilities.slice(0, 4).map(item => `${item.name}: ${item.status}`),
      providerGate: provider.providerKeyChecklist.slice(0, 5).join(' / ') || 'none',
      stopLine: '无已验收外部通道回执，不宣称自动发布、电话接听、POS 写入、收款、配送或核销。',
    }),
    zone({
      id: 'evidence-review',
      title: 'Evidence Review',
      status: closeoutBlock?.status === 'ready-internal' ? 'ready-internal' : 'needs-evidence',
      owner: 'finance',
      answer: closeoutBlock?.action || '收尾只使用公开凭证和脱敏汇总经营数据。',
      primaryAction: closeoutBlock?.acceptance || '导入已验收凭证和脱敏汇总行。',
      visibleProof: unique([
        ...(proofBlock?.evidenceRequired || []),
        ...(closeoutBlock?.evidenceRequired || []),
        ...operating.evidenceBoard,
      ], 6),
      providerGate: closeoutBlock?.providerGate || '汇总 POS/券码/会员字段字典',
      stopLine: '不读取原始 POS 行、支付 id、会员 id、手机号、券码或无来源的增长宣称。',
    }),
  ];
  const readyInternal = zones.filter(item => item.status === 'ready-internal').length;
  const providerGated = zones.filter(item => item.status === 'provider-gated').length;
  const needsEvidence = zones.filter(item => item.status === 'needs-evidence').length;
  const blocked = zones.filter(item => item.status === 'blocked').length;
  const verdict: RestaurantAiCockpit['verdict'] = providerGated > 0
    ? 'provider-unlock-first'
    : needsEvidence > 0
      ? 'merchant-evidence-first'
      : 'usable-cockpit-now';

  return {
    ok: true,
    payloadShape: 'restaurant-ai-cockpit-v1',
    generatedAt: now.toISOString(),
    restaurant: operating.restaurant,
    offer: operating.offer,
    verdict,
    summary: {
      zones: zones.length,
      readyInternal,
      needsEvidence,
      providerGated,
      blocked,
      todayBlocks: operating.dayPlan.length,
      providerUnlocks: operating.providerUnlocks.length,
      canClaimAutomation: false,
    },
    zones,
    primaryRunbook: [
      '先打开今日运营，确认店长凭证。',
      '只用 AI 经营顾问生成负责人可见的动作，不做隐式自动化。',
      '真实代办启动逐条通道推进：外部通道健康、店长授权、签名回调各一步。',
      '下一轮决策前用公开凭证或脱敏汇总导入关闭凭证复核。',
    ],
    evidenceBoard: unique([
      ...operating.evidenceBoard,
      ...zones.flatMap(item => item.visibleProof),
    ], 16),
    providerUnlocks: unique([
      ...operating.providerUnlocks,
      ...provider.providerKeyChecklist,
      ...consultant.providerUnlocks,
    ], 18),
    sourceSnapshots: {
      operatingPlan: {
        payloadShape: operating.payloadShape,
        verdict: operating.verdict,
        summary: operating.summary,
      },
      consultant: {
        payloadShape: consultant.payloadShape,
        mode: consultant.mode,
        summary: consultant.summary,
      },
      providerLaunch: {
        payloadShape: provider.payloadShape,
        summary: provider.summary,
      },
    },
    safetyBoundary: '门店 AI 操作台是经营控制台。不登录账号、不发布、不联系顾客、不接听电话、不核销券码、不写入 POS 订单、不收款、不派送、不暴露外部通道密钥、不存储私聊记录、不存储顾客标识、不拉取原始 POS 行、无已验收凭证不宣称增长。',
  };
}

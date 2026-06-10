import type { RestaurantProviderKeyGapBoard } from '@/lib/restaurant-provider-key-gap-board';
import type { RestaurantProviderSetupWizard } from '@/lib/restaurant-provider-setup-wizard';
import type { RestaurantProviderUnlockLadder } from '@/lib/restaurant-provider-unlock-ladder';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantExternalAccessGuideStep = {
  id: 'runtime' | 'merchant-grants' | 'callback-proof' | 'operating-data' | 'staff-channel';
  title: string;
  owner: 'merchant' | 'runtime-admin' | 'data-ops' | 'ops';
  status: 'ready-to-check' | 'missing-evidence' | 'provider-gated' | 'data-gated';
  customerAsk: string;
  providerAsk: string[];
  unlocks: string[];
  acceptanceEvidence: string[];
  nextAction: string;
  stopLine: string;
};

export type RestaurantExternalAccessGuide = {
  ok: true;
  payloadShape: 'restaurant-external-access-guide-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  answerForCustomer: string;
  summary: {
    steps: number;
    readyToCheck: number;
    missingEvidence: number;
    providerGated: number;
    dataGated: number;
    setupCompletionPercent: number;
    canStartSandbox: boolean;
    canClaimExternalAutomation: false;
  };
  steps: RestaurantExternalAccessGuideStep[];
  ownerPacket: Array<{
    owner: RestaurantExternalAccessGuideStep['owner'];
    giveThis: string[];
    unlocks: string[];
  }>;
  customerScript: string[];
  providerScript: string[];
  redactedFields: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function unique(values: string[], limit = 10): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function countStatus(steps: RestaurantExternalAccessGuideStep[], status: RestaurantExternalAccessGuideStep['status']) {
  return steps.filter(step => step.status === status).length;
}

function fieldsFor(wizard: RestaurantProviderSetupWizard, sectionId: RestaurantProviderSetupWizard['sections'][number]['id']) {
  return wizard.sections.find(section => section.id === sectionId)?.fields || [];
}

function ladderItem(ladder: RestaurantProviderUnlockLadder, id: RestaurantProviderUnlockLadder['items'][number]['id']) {
  return ladder.items.find(item => item.id === id);
}

function gapRow(board: RestaurantProviderKeyGapBoard, id: RestaurantProviderKeyGapBoard['rows'][number]['id']) {
  return board.rows.find(row => row.id === id);
}

function statusFrom(input: {
  missingFields: number;
  ladderStage?: RestaurantProviderUnlockLadder['items'][number]['stage'];
  data?: boolean;
}): RestaurantExternalAccessGuideStep['status'] {
  if (input.data) return 'data-gated';
  if (input.ladderStage === 'provider-health-ready') return 'ready-to-check';
  if (input.ladderStage === 'setup-evidence-signed') return 'missing-evidence';
  if (input.missingFields > 0) return 'provider-gated';
  return 'missing-evidence';
}

export function buildRestaurantExternalAccessGuide(input: RestaurantTrialIntake & {
  providerSetupWizard: RestaurantProviderSetupWizard;
  providerUnlockLadder: RestaurantProviderUnlockLadder;
  providerKeyGapBoard: RestaurantProviderKeyGapBoard;
  now?: Date;
}): RestaurantExternalAccessGuide {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant || input.providerSetupWizard.restaurant, 'Trial restaurant');
  const offer = clean(input.offer || input.providerSetupWizard.offer, 'Today featured offer');
  const runtimeFields = fieldsFor(input.providerSetupWizard, 'runtime');
  const merchantFields = fieldsFor(input.providerSetupWizard, 'merchant-platforms');
  const staffFields = fieldsFor(input.providerSetupWizard, 'staff-delivery');
  const dataFields = fieldsFor(input.providerSetupWizard, 'operating-data');
  const callbackFields = fieldsFor(input.providerSetupWizard, 'proof-callback');
  const runtime = ladderItem(input.providerUnlockLadder, 'persistent-browser');
  const publish = ladderItem(input.providerUnlockLadder, 'auto-publish-proof');
  const redemption = ladderItem(input.providerUnlockLadder, 'coupon-redemption');
  const analysis = ladderItem(input.providerUnlockLadder, 'operating-analysis');
  const memory = ladderItem(input.providerUnlockLadder, 'memory-follow-up');
  const browserGap = gapRow(input.providerKeyGapBoard, 'persistent-browser-runner');
  const publishGap = gapRow(input.providerKeyGapBoard, 'auto-publish');
  const leadGap = gapRow(input.providerKeyGapBoard, 'auto-lead-acquisition');
  const couponGap = gapRow(input.providerKeyGapBoard, 'auto-coupon-redemption');
  const analysisGap = gapRow(input.providerKeyGapBoard, 'true-operating-analysis');
  const staffGap = gapRow(input.providerKeyGapBoard, 'staff-delivery');

  const steps: RestaurantExternalAccessGuideStep[] = [
    {
      id: 'runtime',
      title: '接入一个隔离的浏览器试跑通道',
      owner: 'runtime-admin',
      status: statusFrom({ missingFields: runtimeFields.filter(field => field.status === 'missing').length, ladderStage: runtime?.stage }),
      customerAsk: '选择 OpenClaw、Lobu、Hermes 或其他受控浏览器试跑通道，在服务端配置 URL/密钥/浏览器 profile。',
      providerAsk: unique([
        ...runtimeFields.map(field => field.label),
        ...(browserGap?.externalNeeded || []),
      ], 7),
      unlocks: ['持久浏览器 agent', '沙箱提交包', '试跑通道心跳', '失败恢复'],
      acceptanceEvidence: browserGap?.acceptanceEvidence || ['runtime health ready', 'signed callback', 'accepted receipt'],
      nextAction: runtime?.nextAction || browserGap?.nextAction || '配置试跑通道 URL/密钥、浏览器 profile 和回调密钥。',
      stopLine: browserGap?.stopLine || '试跑通道健康、隔离 profile、店长授权和已接受回执缺一不可，不得执行真实浏览器操作。',
    },
    {
      id: 'merchant-grants',
      title: '签署店长平台授权',
      owner: 'merchant',
      status: statusFrom({ missingFields: merchantFields.filter(field => field.status === 'missing').length, ladderStage: publish?.stage }),
      customerAsk: '审批第一个平台通道，包括允许的账号、允许的操作、凭证类型、有效期和撤销负责人。',
      providerAsk: unique([
        ...merchantFields.map(field => field.label),
        ...(publishGap?.merchantGrant || []),
        ...(leadGap?.merchantGrant || []),
      ], 8),
      unlocks: ['自动发布凭证', '线索捕获回执', '公开证据结算'],
      acceptanceEvidence: unique([
        ...(publishGap?.acceptanceEvidence || []),
        ...(leadGap?.acceptanceEvidence || []),
      ], 8),
      nextAction: publish?.nextAction || publishGap?.nextAction || '沙箱发布凭证前先收集范围明确的店长平台授权。',
      stopLine: '公开门店信息不等于店长授权，未取得明确授权前不得执行任何账号操作。',
    },
    {
      id: 'callback-proof',
      title: '开启签名凭证回调',
      owner: 'runtime-admin',
      status: statusFrom({ missingFields: callbackFields.filter(field => field.status === 'missing').length, ladderStage: publish?.stage }),
      customerAsk: '配置回调密钥和回执字段，确保每次外部通道试跑都返回公开凭证或拒绝原因。',
      providerAsk: unique([
        ...callbackFields.map(field => field.label),
        'x-restaurant-agent-signature',
        'eventId',
        'externalRunId or evidenceUrl or screenshotId',
      ], 8),
      unlocks: ['已接受发布回执', '线索获取回执', '记忆写入条件'],
      acceptanceEvidence: ['签名回调头', '公开凭证 URL 或截图 id', '操作摘要', '已接受回执 id'],
      nextAction: '开启重复外部试跑前先返回一条签名沙箱回执。',
      stopLine: '未签名回调、私密负载和无法核验的截图必须保持拒绝状态。',
    },
    {
      id: 'operating-data',
      title: '审批 POS、券码与经营数据合约',
      owner: 'data-ops',
      status: 'data-gated',
      customerAsk: '在做核销或真实经营结论前，提供汇总字段字典、导出频次、数据来源负责人和无隐私样本。',
      providerAsk: unique([
        ...dataFields.map(field => field.label),
        ...(couponGap?.externalNeeded || []),
        ...(analysisGap?.externalNeeded || []),
      ], 8),
      unlocks: ['券码核销对账', '真实经营分析', '下班结算'],
      acceptanceEvidence: unique([
        ...(couponGap?.acceptanceEvidence || []),
        ...(analysisGap?.acceptanceEvidence || []),
        ...(redemption?.providerEvidence || []),
        ...(analysis?.providerEvidence || []),
      ], 8),
      nextAction: analysis?.nextAction || analysisGap?.nextAction || '判断门店经营前先导入一份脱敏 POS/券码汇总。',
      stopLine: '无授权汇总数据时，不得使用原始 POS 明细、支付 id、券码、用户标识或毛利宣称。',
    },
    {
      id: 'staff-channel',
      title: '审批员工通知与记忆跟进',
      owner: 'ops',
      status: statusFrom({ missingFields: staffFields.filter(field => field.status === 'missing').length, ladderStage: memory?.stage }),
      customerAsk: '选择员工专属通道、接收范围、消息模板和确认回执。',
      providerAsk: unique([
        ...staffFields.map(field => field.label),
        ...(staffGap?.externalNeeded || []),
      ], 7),
      unlocks: ['员工工单下发', '恢复告警', '记忆跟进唤醒'],
      acceptanceEvidence: unique([
        ...(staffGap?.acceptanceEvidence || []),
        ...(memory?.providerEvidence || []),
      ], 8),
      nextAction: memory?.nextAction || staffGap?.nextAction || '在店长审批接收范围前，内容仅在内部保留备用。',
      stopLine: '不触达客户、不读取私信、不冒充员工、不进行隐性自主跟进。',
    },
  ];

  const ownerPacket = (['merchant', 'runtime-admin', 'data-ops', 'ops'] as const).map(owner => {
    const owned = steps.filter(step => step.owner === owner);
    return {
      owner,
      giveThis: unique(owned.flatMap(step => [step.customerAsk, ...step.providerAsk]), 8),
      unlocks: unique(owned.flatMap(step => step.unlocks), 8),
    };
  }).filter(packet => packet.giveThis.length > 0);

  return {
    ok: true,
    payloadShape: 'restaurant-external-access-guide-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    answerForCustomer: `${restaurant} 今天可以继续使用内部 AI 员工。要为 ${offer} 解锁对标竞品的外部执行能力，请按顺序完成试跑通道、店长授权、回调凭证、数据合约和员工通道的配置。`,
    summary: {
      steps: steps.length,
      readyToCheck: countStatus(steps, 'ready-to-check'),
      missingEvidence: countStatus(steps, 'missing-evidence'),
      providerGated: countStatus(steps, 'provider-gated'),
      dataGated: countStatus(steps, 'data-gated'),
      setupCompletionPercent: input.providerSetupWizard.summary.completionPercent,
      canStartSandbox: input.providerUnlockLadder.summary.setupEvidenceSigned > 0 || input.providerUnlockLadder.summary.providerHealthReady > 0,
      canClaimExternalAutomation: false,
    },
    steps,
    ownerPacket,
    customerScript: [
      '先选一个平台和一个门店活动，不要一次打开所有外部权限。',
      '所有 key、callback secret、browser profile 只放服务端，不在页面、聊天或导出包里出现。',
      '先跑一条 sandbox receipt，验收公开链接/截图/签名回执，再扩大到多平台。',
      'POS、核销、会员和财务只接聚合字段；没有字段字典就不做真实经营结论。',
    ],
    providerScript: [
      '仅返回签名回执字段，包括 eventId、externalRunId/evidenceUrl/screenshotId、操作摘要、signedAt。',
      '遇到登录验证、验证码、私信、用户标识、券码、支付 id 或 POS 明细时立即停止。',
      '每次失败试跑必须返回拒绝原因和恢复负责人，不得静默重试。',
    ],
    redactedFields: [
      'api keys',
      'auth tokens',
      'cookies',
      'browser profile ids',
      'private message text',
      'customer PII',
      'coupon codes',
      'payment ids',
      'raw POS rows',
    ],
    safetyBoundary: '外部资料接入指南仅是配置与验收指南。不收集或暴露密钥、不登录、不发布、不触达客户、不核销券码，在外部通道健康、店长授权、签名回执和汇总数据合约被接受前，不宣称经营结果。',
  };
}

import type { RestaurantBusinessSignalReport } from '@/lib/restaurant-agent-business-signals';
import type { RestaurantAgentChannelHub } from '@/lib/restaurant-agent-channel-hub';
import type { RestaurantCustomerDemandGateway } from '@/lib/restaurant-customer-demand-gateway';
import type { RestaurantNextLoopChannelPlan } from '@/lib/restaurant-next-loop-channel-plan';
import type { RestaurantReputationCloseoutPack } from '@/lib/restaurant-reputation-closeout-pack';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantLeadCaptureSource = {
  id: 'reservation' | 'coupon-claim' | 'private-domain-inquiry' | 'visit-intent' | 'review-recovery';
  label: string;
  status: 'internal-ready' | 'needs-evidence' | 'provider-gated';
  signalCount: number;
  owner: 'store-manager' | 'community-ops' | 'ops' | 'runtime-admin';
  canDoNow: string[];
  evidenceRequired: string[];
  providerRequiredFor: string[];
  nextAction: string;
};

export type RestaurantLeadCaptureItem = {
  id: string;
  sourceId: RestaurantLeadCaptureSource['id'];
  priority: 'today' | 'next-shift' | 'blocked';
  owner: RestaurantLeadCaptureSource['owner'];
  title: string;
  signalCount: number;
  intent: 'book-table' | 'claim-coupon' | 'ask-question' | 'visit-later' | 'recover-service';
  staffAction: string;
  approvedTalkTrack: string;
  evidenceRequired: string;
  stopLine: string;
};

export type RestaurantLeadCaptureInbox = {
  ok: true;
  payloadShape: 'restaurant-lead-capture-inbox-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'inbox-ready-internal' | 'needs-public-proof' | 'provider-unlock-first';
  summary: {
    sources: number;
    internalReady: number;
    needsEvidence: number;
    providerGated: number;
    leadItems: number;
    todayItems: number;
    blockedItems: number;
    aggregateSignals: number;
    canClaimAutoLeadCapture: boolean;
    canClaimAutoCustomerContact: boolean;
  };
  sources: RestaurantLeadCaptureSource[];
  leadItems: RestaurantLeadCaptureItem[];
  staffQueue: Array<{
    owner: RestaurantLeadCaptureSource['owner'];
    action: string;
    evidenceRequired: string;
    dueWindow: string;
  }>;
  providerUnlocks: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, 120) : fallback;
}

function unique(values: string[], limit = 16) {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function sourceStatus(count: number, providerBlocked: boolean): RestaurantLeadCaptureSource['status'] {
  if (providerBlocked) return count > 0 ? 'internal-ready' : 'provider-gated';
  return count > 0 ? 'internal-ready' : 'needs-evidence';
}

export function buildRestaurantLeadCaptureInbox(input: RestaurantTrialIntake & {
  customerDemandGateway: RestaurantCustomerDemandGateway;
  businessSignals: RestaurantBusinessSignalReport;
  channelHub: RestaurantAgentChannelHub;
  nextLoopChannelPlan: RestaurantNextLoopChannelPlan;
  reputationCloseoutPack?: RestaurantReputationCloseoutPack;
  now?: Date;
}): RestaurantLeadCaptureInbox {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, input.customerDemandGateway.restaurant || 'Trial restaurant');
  const offer = clean(input.offer, input.customerDemandGateway.offer || 'Today offer');
  const signals = input.businessSignals.summary;
  const hasProviderReadyChannel = input.channelHub.summary.providerReadyChannels > 0;
  const demandProviderGated = input.customerDemandGateway.summary.providerGated > 0;
  const reviewRecoverySignals = input.reputationCloseoutPack?.summary.recoveryActions || 0;

  const sources: RestaurantLeadCaptureSource[] = [
    {
      id: 'reservation',
      label: '预约与候位意向',
      status: sourceStatus(signals.reservations, demandProviderGated),
      signalCount: signals.reservations,
      owner: 'store-manager',
      canDoNow: ['汇总预约数量', '准备产能确认任务', '起草员工审核后的回复'],
      evidenceRequired: ['服务时段', '聚合桌位人数', '员工产能确认'],
      providerRequiredFor: ['自动预约确认', '餐桌系统写入', '顾客提醒发送'],
      nextAction: signals.reservations > 0
        ? '任何回复或桌位承诺前，请店长确认产能。'
        : '路由桌位意向前，导入公开凭证回执或脱敏预约汇总。',
    },
    {
      id: 'coupon-claim',
      label: '券码与团购宣称',
      status: sourceStatus(signals.couponClaims, demandProviderGated),
      signalCount: signals.couponClaims,
      owner: 'ops',
      canDoNow: ['按活动归组宣称', '核查券码边界', '创建核销备用任务'],
      evidenceRequired: ['券码规则凭证', '汇总宣称数量', '核销时段'],
      providerRequiredFor: ['点评/美团券码同步', '自动券码跟进', '核销对账'],
      nextAction: signals.couponClaims > 0
        ? '下次内容或员工跟进前确认券码规则和核销时段。'
        : '收集券码规则凭证和汇总宣称数量。',
    },
    {
      id: 'private-domain-inquiry',
      label: '私域询问汇总',
      status: hasProviderReadyChannel ? sourceStatus(signals.inquiries, false) : 'provider-gated',
      signalCount: signals.inquiries,
      owner: 'community-ops',
      canDoNow: ['接受手动汇总询问数量', '分类意向桶', '准备员工审批话术'],
      evidenceRequired: ['来源渠道', '汇总询问数量', '已审批回复脚本', '不含原始私信文本'],
      providerRequiredFor: ['企微/微信/短信同步', '发送消息', 'CRM/会员扩充'],
      nextAction: hasProviderReadyChannel
        ? '将汇总询问主题路由至员工审核跟进。'
        : '员工渠道外部资料与店长审批配置完成前保持人工汇总。',
    },
    {
      id: 'visit-intent',
      label: '来自公开凭证的到店意向',
      status: sourceStatus(signals.visitIntent, false),
      signalCount: signals.visitIntent,
      owner: 'store-manager',
      canDoNow: ['将意向数量转化为服务备餐', '附上负责人和截止时段', '输入下次内容角度'],
      evidenceRequired: ['公开链接/截图', '时间窗口', 'owner', '到店意向汇总'],
      providerRequiredFor: ['平台评论同步', '自动意向标记', '顾客联系动作'],
      nextAction: signals.visitIntent > 0
        ? '根据汇总意向准备下次服务时段和内容跟进。'
        : '宣称到店意向前收集公开凭证或已接受回执。',
    },
    {
      id: 'review-recovery',
      label: '评价触发的服务补救',
      status: input.reputationCloseoutPack ? 'internal-ready' : 'needs-evidence',
      signalCount: reviewRecoverySignals,
      owner: 'runtime-admin',
      canDoNow: ['将评价主题关联到补救负责人', '起草员工审核回复', '授权前屏蔽自动回复'],
      evidenceRequired: ['公开评价/凭证 URL 或截图', '补救负责人', '店长审批的语气'],
      providerRequiredFor: ['评价收件箱同步', '自动评价回复', '补偿/券码流程'],
      nextAction: input.reputationCloseoutPack
        ? '以口碑收尾行动作为服务补救队列。'
        : '评价驱动跟进前先构建口碑收尾包。',
    },
  ];

  const leadItems: RestaurantLeadCaptureItem[] = [
    {
      id: 'lead-reservation-capacity',
      sourceId: 'reservation',
      priority: signals.reservations > 0 ? 'today' : 'blocked',
      owner: 'store-manager',
      title: '回复前确认预约产能',
      signalCount: signals.reservations,
      intent: 'book-table',
      staffAction: '核查服务时段、餐桌产能及排队压力；员工联系顾客前须审批回复内容。',
      approvedTalkTrack: `关于 ${offer}，承诺桌位前确认可用性及预计等候时间。`,
      evidenceRequired: '服务时段 + 产能备注 + 汇总预约数量',
      stopLine: '无外部资料授权不得自动确认、不存储顾客电话、不写入餐桌系统。',
    },
    {
      id: 'lead-coupon-redemption-prep',
      sourceId: 'coupon-claim',
      priority: signals.couponClaims > 0 ? 'today' : 'blocked',
      owner: 'ops',
      title: '准备券码宣称到核销的跟进',
      signalCount: signals.couponClaims,
      intent: 'claim-coupon',
      staffAction: '在下次员工脚本和内容循环中明确券码有效性、排除条款及核销时段。',
      approvedTalkTrack: `询问 ${offer} 的顾客在内容和门店回复中应看到相同的券码边界。`,
      evidenceRequired: '券码规则凭证 + 汇总宣称数量 + 核销时段',
      stopLine: '无已接受的汇总核销凭证不得进行核销、处理券码或宣称 ROI。',
    },
    {
      id: 'lead-private-domain-summary',
      sourceId: 'private-domain-inquiry',
      priority: hasProviderReadyChannel || signals.inquiries > 0 ? 'next-shift' : 'blocked',
      owner: 'community-ops',
      title: '在不存储聊天的情况下分类私域询问',
      signalCount: signals.inquiries,
      intent: 'ask-question',
      staffAction: '汇总询问主题，起草员工审批的回复供手动发送。',
      approvedTalkTrack: '仅使用已审批的回复片段；将私信文本和客户标识符排除在工作台外。',
      evidenceRequired: '来源渠道 + 汇总数量 + 已审批回复脚本',
      stopLine: '未经授权不得读取私信、导出微信号、自动联系顾客或扩充 CRM。',
    },
    {
      id: 'lead-visit-intent-next-loop',
      sourceId: 'visit-intent',
      priority: signals.visitIntent > 0 ? 'today' : 'blocked',
      owner: 'store-manager',
      title: '将到店意向转化为下次服务备餐',
      signalCount: signals.visitIntent,
      intent: 'visit-later',
      staffAction: '根据汇总意向准备排队、菜品供应及下次内容角度。',
      approvedTalkTrack: '仅在店长确认后提及当日可用性和排队状态。',
      evidenceRequired: '公开凭证或已接受回执 + 汇总到店意向数量',
      stopLine: '不得根据公开评论进行个体再营销或客户识别。',
    },
    {
      id: 'lead-review-recovery',
      sourceId: 'review-recovery',
      priority: input.reputationCloseoutPack ? 'next-shift' : 'blocked',
      owner: 'runtime-admin',
      title: '将评价补救路由给负责人',
      signalCount: reviewRecoverySignals,
      intent: 'recover-service',
      staffAction: '下次发布/跟进循环前附上补救负责人、回复草稿及凭证要求。',
      approvedTalkTrack: '确认问题，说明运营边界，让店长审核最终回复。',
      evidenceRequired: '公开评价/凭证 + 补救负责人 + 已审批语气',
      stopLine: '未经店长审批不得自动回复、提供补偿、发放券码或读取平台收件箱。',
    },
  ];

  const internalReady = sources.filter(item => item.status === 'internal-ready').length;
  const needsEvidence = sources.filter(item => item.status === 'needs-evidence').length;
  const providerGated = sources.filter(item => item.status === 'provider-gated').length;
  const blockedItems = leadItems.filter(item => item.priority === 'blocked').length;
  const aggregateSignals = signals.reservations + signals.couponClaims + signals.inquiries + signals.visitIntent + reviewRecoverySignals;
  const verdict: RestaurantLeadCaptureInbox['verdict'] = providerGated > internalReady
    ? 'provider-unlock-first'
    : needsEvidence > 0
      ? 'needs-public-proof'
      : 'inbox-ready-internal';

  return {
    ok: true,
    payloadShape: 'restaurant-lead-capture-inbox-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    verdict,
    summary: {
      sources: sources.length,
      internalReady,
      needsEvidence,
      providerGated,
      leadItems: leadItems.length,
      todayItems: leadItems.filter(item => item.priority === 'today').length,
      blockedItems,
      aggregateSignals,
      canClaimAutoLeadCapture: false,
      canClaimAutoCustomerContact: false,
    },
    sources,
    leadItems,
    staffQueue: leadItems.slice(0, 4).map(item => ({
      owner: item.owner,
      action: item.staffAction,
      evidenceRequired: item.evidenceRequired,
      dueWindow: item.priority === 'today' ? '今日服务时段前' : item.priority === 'next-shift' ? '下班收尾时' : '凭证/外部资料解锁后',
    })),
    providerUnlocks: unique([
      '线索来源所需的店长平台授权',
      '员工渠道外部资料与收件人角色审批',
      '回调密钥与已接受回执格式',
      'no-PII private-domain data contract',
      '券码/预约/POS 汇总导出合同',
    ]),
    externalRequired: unique([
      ...sources.flatMap(item => item.status === 'internal-ready' ? [] : item.providerRequiredFor),
      ...sources.flatMap(item => item.status === 'needs-evidence' ? item.evidenceRequired : []),
      ...input.customerDemandGateway.externalRequired,
      ...input.nextLoopChannelPlan.externalRequired,
    ]),
    safetyBoundary: '线索捕获收件箱仅使用公开凭证、已接受回执、手动汇总数量及脱敏运营信号。在获得店长授权和外部资料回执前，不读取私信、不存储隐私信息、不导出顾客联系方式、不确认预约、不发送回复、不核销券码、不扩充 CRM 记录、不暴露外部资料密钥，也不宣称自动线索捕获。',
  };
}

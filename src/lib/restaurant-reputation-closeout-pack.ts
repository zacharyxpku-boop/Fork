import type { RestaurantBusinessSignalReport } from '@/lib/restaurant-agent-business-signals';
import type { RestaurantNextLoopChannelPlan } from '@/lib/restaurant-next-loop-channel-plan';
import type { RestaurantPostRunReviewPack } from '@/lib/restaurant-post-run-review-pack';
import type { RestaurantPublicIntelligenceBrief } from '@/lib/restaurant-public-intelligence-brief';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantReputationSource = {
  id: 'dianping-meituan' | 'xiaohongshu' | 'douyin' | 'wechat-community' | 'manual-review-import';
  label: string;
  status: 'internal-ready' | 'needs-public-proof' | 'provider-gated';
  canDoNow: string[];
  evidenceRequired: string[];
  providerRequiredFor: string[];
  nextAction: string;
  stopLine: string;
};

export type RestaurantReputationTheme = {
  id: 'taste-offer-fit' | 'wait-time-service' | 'coupon-expectation' | 'photo-proof-gap' | 'repeat-visit';
  label: string;
  signal: 'positive' | 'mixed' | 'risk' | 'unknown';
  source: string;
  evidence: string[];
  operatorAction: string;
  staffScript: string;
};

export type RestaurantReputationCloseoutPack = {
  ok: true;
  payloadShape: 'restaurant-reputation-closeout-pack-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'review-loop-ready' | 'needs-public-proof' | 'provider-unlock-first';
  summary: {
    sources: number;
    internalReady: number;
    needsPublicProof: number;
    providerGated: number;
    themes: number;
    recoveryActions: number;
    responseDrafts: number;
    canClaimAutoReviewReply: boolean;
    canClaimReviewAnalytics: boolean;
  };
  sources: RestaurantReputationSource[];
  themes: RestaurantReputationTheme[];
  recoveryQueue: Array<{
    owner: 'store-manager' | 'shift-lead' | 'ops' | 'runtime-admin';
    action: string;
    evidenceRequired: string;
    dueWindow: string;
  }>;
  responseDrafts: Array<{
    platform: string;
    status: 'staff-review' | 'provider-gated';
    draft: string;
    proofNeeded: string;
  }>;
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

export function buildRestaurantReputationCloseoutPack(input: RestaurantTrialIntake & {
  publicIntelligenceBrief?: RestaurantPublicIntelligenceBrief;
  postRunReviewPack: RestaurantPostRunReviewPack;
  nextLoopChannelPlan: RestaurantNextLoopChannelPlan;
  businessSignals: RestaurantBusinessSignalReport;
  now?: Date;
}): RestaurantReputationCloseoutPack {
  const restaurant = clean(input.restaurant || input.publicIntelligenceBrief?.profile.restaurant, 'Trial restaurant');
  const offer = clean(input.offer || input.publicIntelligenceBrief?.profile.suggestedOffer, 'Today offer');
  const acceptedProof = input.postRunReviewPack.summary.acceptedReceipts;
  const acceptedPos = input.postRunReviewPack.summary.acceptedPosImports;
  const providerGatedActions = input.nextLoopChannelPlan.summary.providerGatedActions;
  const hasPublicProof = acceptedProof > 0;
  const hasAggregateOperatingData = acceptedPos > 0;

  const sources: RestaurantReputationSource[] = [
    {
      id: 'dianping-meituan',
      label: '点评/美团评价与券码凭证',
      status: hasPublicProof ? 'internal-ready' : 'needs-public-proof',
      canDoNow: ['准备评价回复草稿', '将券码预期关联到活动边界', '路由店长补救任务'],
      evidenceRequired: ['公开评价/凭证 URL 或截图 id', '活动边界', '店长审批的回复语气'],
      providerRequiredFor: ['自动回复', '评价收件箱同步', '券码评价对账'],
      nextAction: hasPublicProof
        ? '根据已接受的公开凭证起草一份负责人审核回复和一条门店补救行动。'
        : '评价分析前收集公开凭证 URL/截图或已签名的试跑通道回执。',
      stopLine: '未经店长授权不读取私人评价数据、不自动回复、不读取平台收件箱。',
    },
    {
      id: 'xiaohongshu',
      label: '小红书笔记评论与到店意向',
      status: hasPublicProof ? 'internal-ready' : 'needs-public-proof',
      canDoNow: ['店长提供汇总文本时归纳公开评论主题', '准备图片凭证清单', '起草员工审核回复'],
      evidenceRequired: ['公开笔记 URL/截图', '评论/询问汇总数量', '图片版权'],
      providerRequiredFor: ['评论同步', '私信路由', '自动回复'],
      nextAction: '仅使用店长提供的公开凭证；将高频问题转化为下篇笔记和服务备餐任务。',
      stopLine: '不读取私信、不导出账号、不从工作台联系顾客。',
    },
    {
      id: 'douyin',
      label: '抖音公开评论与短视频反馈',
      status: hasPublicProof ? 'internal-ready' : 'needs-public-proof',
      canDoNow: ['准备公开评论常见问题', '捕捉内容凭证缺口', '将到店意向汇总转化为下班任务'],
      evidenceRequired: ['公开视频 URL/截图', '汇总评论数量', '运营审核'],
      providerRequiredFor: ['评论信息流同步', '自动回复', '创作者账号操作'],
      nextAction: '将公开评论问题转化为已审核的常见问题和下一个视频钩子。',
      stopLine: '不抓取私密评论、不进行账号操作、无回执不宣称效果数据。',
    },
    {
      id: 'wechat-community',
      label: '微信社群反馈',
      status: 'provider-gated',
      canDoNow: ['准备员工话术', '导入手动汇总反馈', '创建服务补救负责人队列'],
      evidenceRequired: ['员工提供的汇总摘要', '已审批话术', '顾客同意边界'],
      providerRequiredFor: ['群发消息', '会员同步', '私域自动化'],
      nextAction: '员工渠道和同意边界配置完成前，微信反馈保持手动汇总。',
      stopLine: '绝不读取群聊/私聊内容，不存储微信号、电话或顾客标识符。',
    },
    {
      id: 'manual-review-import',
      label: '手动评价与服务日志导入',
      status: 'internal-ready',
      canDoNow: ['接受脱敏问题数量', '分配补救负责人', '将评价主题关联到门店经营计划'],
      evidenceRequired: ['主题数量', '服务时段', 'owner', '不含顾客标识符'],
      providerRequiredFor: ['实时评价分析', 'CRM/会员扩充', '自动服务补救'],
      nextAction: '下次服务时段前使用去隐私汇总服务日志完成补救行动。',
      stopLine: '手动导入不得包含姓名、电话、地址、订单 id、会员 id 或私信文本。',
    },
  ];

  const themes: RestaurantReputationTheme[] = [
    {
      id: 'taste-offer-fit',
      label: '菜品口味与活动匹配度',
      signal: hasPublicProof ? 'positive' : 'unknown',
      source: '公开凭证 + 店长简报',
      evidence: hasPublicProof ? [`acceptedReceipts:${acceptedProof}`, offer] : ['公开凭证缺失'],
      operatorAction: hasPublicProof ? '沿用已验证的菜品角度，但保持价格/库存边界可见。' : '将口味宣称转化为内容前先收集公开凭证。',
      staffScript: `顾客询问 ${offer} 时，推荐加购前先确认可用性和服务时段。`,
    },
    {
      id: 'wait-time-service',
      label: '等候时间与服务补救',
      signal: input.businessSignals.summary.visitIntent > 0 ? 'mixed' : 'unknown',
      source: '到店意向 + 下次服务备餐',
      evidence: [`visitIntent:${input.businessSignals.summary.visitIntent}`, `storeTasks:${input.postRunReviewPack.summary.storeTasks}`],
      operatorAction: '将排队处理、翻台及员工负责人附到下次发布/跟进循环。',
      staffScript: '出现排队压力时，说明预计等候时间并提供明确的预约或外带替代方案。',
    },
    {
      id: 'coupon-expectation',
      label: '券码预期与核销清晰度',
      signal: hasAggregateOperatingData ? 'mixed' : 'risk',
      source: 'POS 汇总 + 券码凭证',
      evidence: [`couponClaims:${input.businessSignals.summary.couponClaims}`, `redemptions:${input.businessSignals.summary.redemptions}`, `acceptedPosImports:${acceptedPos}`],
      operatorAction: hasAggregateOperatingData ? '在下次内容和员工脚本中明确券码范围和核销时段。' : '判断券码摩擦前先导入脱敏券码/POS 汇总。',
      staffScript: '顾客到店前确认券码有效性、排除品项及核销步骤。',
    },
    {
      id: 'photo-proof-gap',
      label: '图片凭证与预期落差',
      signal: input.publicIntelligenceBrief?.readiness.canStartTrial ? 'mixed' : 'risk',
      source: '公开情报素材清单',
      evidence: input.publicIntelligenceBrief?.materialChecklist.slice(0, 3).map(item => `${item.id}:${item.status}`) || ['公开情报未生成'],
      operatorAction: '跨平台重复内容前先收集已审批的菜品/门店照片。',
      staffScript: '仅使用店长审批的照片，不夸大分量、等候时间或可用性。',
    },
    {
      id: 'repeat-visit',
      label: '复访与跟进',
      signal: input.nextLoopChannelPlan.summary.canRunInternallyNow ? 'positive' : 'risk',
      source: '下次渠道计划',
      evidence: [`scheduledActions:${input.nextLoopChannelPlan.summary.scheduledActions}`, `providerGatedActions:${providerGatedActions}`],
      operatorAction: '根据汇总意向和已接受凭证安排员工审核跟进，不依赖顾客标识符。',
      staffScript: '仅通过已审批的公开/门店自有渠道邀请顾客回访；不导出联系方式列表。',
    },
  ];

  const internalReady = sources.filter(item => item.status === 'internal-ready').length;
  const needsPublicProof = sources.filter(item => item.status === 'needs-public-proof').length;
  const providerGated = sources.filter(item => item.status === 'provider-gated').length;
  const verdict: RestaurantReputationCloseoutPack['verdict'] = providerGated > 2
    ? 'provider-unlock-first'
    : needsPublicProof > 0
      ? 'needs-public-proof'
      : 'review-loop-ready';

  return {
    ok: true,
    payloadShape: 'restaurant-reputation-closeout-pack-v1',
    generatedAt: (input.now || new Date()).toISOString(),
    restaurant,
    offer,
    verdict,
    summary: {
      sources: sources.length,
      internalReady,
      needsPublicProof,
      providerGated,
      themes: themes.length,
      recoveryActions: 4,
      responseDrafts: 3,
      canClaimAutoReviewReply: false,
      canClaimReviewAnalytics: hasPublicProof && hasAggregateOperatingData,
    },
    sources,
    themes,
    recoveryQueue: [
      {
        owner: 'store-manager',
        action: '下次内容推送前确认等候时间、库存和服务时段边界。',
        evidenceRequired: '当班负责人备注 + 服务时段',
        dueWindow: '下次午餐/晚餐服务前',
      },
      {
        owner: 'shift-lead',
        action: '准备关于券码有效性和核销步骤的员工回复脚本。',
        evidenceRequired: '券码规则 + 核销时段',
        dueWindow: '券码跟进前',
      },
      {
        owner: 'ops',
        action: '将已接受的公开凭证转化为一份已审核回复和一个下次内容角度。',
        evidenceRequired: '公开 URL/截图 + 负责人审批',
        dueWindow: '当日收尾',
      },
      {
        owner: 'runtime-admin',
        action: '在店长平台授权配置完成前，保持自动回复和评价收件箱同步处于屏蔽状态。',
        evidenceRequired: '外部资料健康状态 + 店长授权 + 回调回执',
        dueWindow: '宣称外部评价自动化前',
      },
    ],
    responseDrafts: [
      {
        platform: '点评/美团',
        status: 'staff-review',
        draft: `感谢您的反馈。${restaurant} 将确认 ${offer} 的出餐时段、券码规则及门店服务方案，再由店长审核最终回复。`,
        proofNeeded: '公开评价/凭证 URL 或截图 id',
      },
      {
        platform: '小红书/抖音',
        status: 'staff-review',
        draft: '回复仅使用已审批的菜品详情、照片及用餐场景。若等候时间或券码规则有变，员工应引导顾客查看当日门店公告。',
        proofNeeded: '已审批的公开笔记/视频凭证及图片版权',
      },
      {
        platform: '微信社群',
        status: 'provider-gated',
        draft: '社群回复需员工确认并划定明确的顾客同意边界。当前模式仅生成员工话术，不自动发送消息。',
        proofNeeded: '员工收件人审批及顾客同意边界',
      },
    ],
    externalRequired: unique([
      ...sources.flatMap(item => item.providerRequiredFor),
      ...sources.flatMap(item => item.status !== 'internal-ready' ? item.evidenceRequired : []),
      ...input.postRunReviewPack.externalRequired,
    ], 14),
    safetyBoundary: '口碑收尾包仅使用公开凭证、店长提供的汇总评价摘要及脱敏运营信号。在获得店长授权和已接受凭证前，不抓取私人评价、不读取私信、不识别顾客、不导出联系方式、不存储隐私信息、不自动回复、不提供补偿、不核销券码、不暴露密钥，也不宣称评价分析能力。',
  };
}

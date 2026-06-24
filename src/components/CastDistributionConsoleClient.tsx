'use client';

import { useState, type FormEvent } from 'react';

import { FactoryFriendTrialExperience } from '@/components/FactoryFriendTrialExperience';
import { FactoryVariantConsole } from '@/components/FactoryVariantConsole';
import type { ChannelAccountSnapshot } from '@/lib/channel-account-ledger';
import type { FactoryUiVariantId } from '@/lib/factory-readiness-view';
import {
  RESTAURANT_PUBLISH_PROOF_DEMO_PLANS,
  buildRestaurantPublishProofLedger,
  type RestaurantPublishProofLedger,
} from '@/lib/restaurant-publish-proof-ledger';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

type CastPlaybook = {
  title: string;
  primaryAction: string;
  proofToCheck: string;
  handoffBoundary: string;
  cards: string[];
};

export type CastManageOperatingCheck = {
  stage: string;
  ready: boolean;
  evidence: string;
  next: string;
};

export type AdDeliveryGuardrail = {
  rule: string;
  ready: boolean;
  evidence: string;
  operatorAction: string;
  stopLine: string;
};

export type ManualPublishReceiptCheck = {
  gate: string;
  ready: boolean;
  evidence: string;
  operatorAction: string;
  externalGate: string;
};

const CAST_VARIANTS: Record<FactoryUiVariantId, {
  label: string;
  audience: string;
  headline: string;
  body: string;
  firstAction: string;
  stopLine: string;
}> = {
  partner: {
    label: '合作者视角',
    audience: '给合作者、客户负责人和投资评审看 Cast 是否真的接近餐饮同城发布和证据回流能力。',
    headline: 'Cast 是同城渠道、发布凭证、活动账本和到店反馈的统一调度层。',
    body: '这一层不把发布执行当口号展示，而是把渠道授权、可发布状态、发布槽位、活动预算、链接/截图凭证和反馈回流放在同一条链路里验收。',
    firstAction: '先看同城渠道、门店活动发布账本和链接/截图凭证是否齐全，再判断能不能进入真实外部平台接入。',
    stopLine: '没有平台授权、商户授权、发布 API 和平台/社群反馈回流前，不能宣称平台级自动分发或自动优化。',
  },
  operator: {
    label: '运营视角',
    audience: '给内部运营每天判断该补渠道、补槽位、补发布凭证还是补反馈回流。',
    headline: 'Cast 的运营任务是把分发动作从聊天记录搬到账本里。',
    body: '运营不需要先写一堆报告，只要按页面暴露的 gap 补齐渠道、可用状态、发布槽位、活动预算、发布链接/截图和到店反馈。',
    firstAction: '先补 next actions 里最前面的缺口；没有可用渠道和可用槽位时，不要推进发布状态。',
    stopLine: '外部平台未接入时，只能做手工发布交接和证据回填，不能标记外部发布完成。',
  },
  friend_trial: {
    label: '朋友试用视角',
    audience: '给非技术朋友只看一件事：内容是否能从可发布计划走到有证据的结果。',
    headline: '朋友不需要理解平台授权，只要看到能发到哪里、谁负责、有没有结果。',
    body: '这一视角隐藏内部发布术语，把复杂的渠道矩阵压缩成“可发布 / 待补材料 / 已有回流”三个判断。',
    firstAction: '先准备一个发布渠道、一个可发布槽位和一条证据链接；没有真实结果时不要让朋友误以为已经发布。',
    stopLine: '没有真实发布证据和表现回流时，只能试用流程，不能试用自动分发效果。',
  },
};

function money(cents: number) {
  return `¥${(cents / 100).toFixed(2)}`;
}

function castScore(snapshot: ChannelAccountSnapshot | null) {
  if (!snapshot) return 0;
  return [
    snapshot.accountCount > 0,
    snapshot.connectedAccountCount > 0,
    snapshot.healthyAccountCount > 0,
    snapshot.availableSlotCount > 0,
    snapshot.adCampaignCount > 0,
    snapshot.adEvidenceCount > 0,
    snapshot.measuredAdCampaignCount > 0,
  ].filter(Boolean).length;
}

export function buildCastManageOperatingChecks(snapshot: ChannelAccountSnapshot | null): CastManageOperatingCheck[] {
  const activityCount = snapshot?.adCampaignCount || 0;
  const accountCount = snapshot?.accountCount || 0;
  const healthyCount = snapshot?.healthyAccountCount || 0;
  const slotCount = snapshot?.availableSlotCount || 0;
  const budgetCents = snapshot?.adBudgetCents || 0;
  const evidenceCount = snapshot?.adEvidenceCount || 0;
  const measuredCount = snapshot?.measuredAdCampaignCount || 0;
  const gaps = [...(snapshot?.missingLinks || []), ...(snapshot?.adMissingLinks || [])];
  const nextActions = snapshot?.nextActions || [];

  return [
    {
      stage: '内容版本 / 门店活动绑定',
      ready: activityCount > 0,
      evidence: `活动发布账本 ${activityCount} 条`,
      next: activityCount > 0
        ? '把每个内容版本绑定到门店活动、菜品/套餐、发布负责人和证据入口。'
        : '先创建门店活动发布账本；没有活动归属就无法对齐内容、发布证明和到店跟进。',
    },
    {
      stage: '渠道与发布槽位',
      ready: accountCount > 0 && healthyCount > 0 && slotCount > 0,
      evidence: `渠道 ${accountCount} / 可用 ${healthyCount} / 槽位 ${slotCount}`,
      next: '补齐平台授权前先保持人工安排；有可用渠道和发布槽位后才允许进入发布交接。',
    },
    {
      stage: '活动预算与发布门禁',
      ready: budgetCents > 0,
      evidence: `预算 ${money(budgetCents)} / 花费 ${money(snapshot?.adSpendCents || 0)}`,
      next: budgetCents > 0
        ? '继续补预算上限、暂停规则和门店确认记录。'
        : '先写入活动预算上限；没有预算门禁不能安排外部发布执行。',
    },
    {
      stage: '发布凭证',
      ready: evidenceCount > 0,
      evidence: `发布链接或截图 ${evidenceCount} 条`,
      next: evidenceCount > 0
        ? '把链接、截图或备注继续绑定到发布安排和客户审核后的内容版本。'
        : '没有链接或截图时只能标记为待发布或手工交接，不能宣称已完成外部发布。',
    },
    {
      stage: '预约/券领取/私信回流',
      ready: measuredCount > 0,
      evidence: `已回收聚合信号 ${measuredCount} 条`,
      next: measuredCount > 0
        ? '把预约、券领取、私信或社群反馈反哺下一轮内容和店长跟进。'
        : '补平台/社群反馈回流或手工汇总；没有回流就不能宣称经营效果。',
    },
    {
      stage: '下一轮门店动作队列',
      ready: gaps.length === 0,
      evidence: gaps.length ? `阻断 ${gaps.length} 项 / 动作 ${nextActions.length} 条` : `动作队列 ${nextActions.length} 条 / 无硬阻断`,
      next: gaps.length
        ? `先处理：${gaps[0]}。`
        : '进入下一轮内容版本、活动预算、平台授权和店长跟进验收。',
    },
  ];
}

export function buildAdDeliveryGuardrails(snapshot: ChannelAccountSnapshot | null): AdDeliveryGuardrail[] {
  const campaignCount = snapshot?.adCampaignCount || 0;
  const activeCampaignCount = snapshot?.activeAdCampaignCount || 0;
  const measuredCount = snapshot?.measuredAdCampaignCount || 0;
  const budgetCents = snapshot?.adBudgetCents || 0;
  const spendCents = snapshot?.adSpendCents || 0;
  const evidenceCount = snapshot?.adEvidenceCount || 0;
  const missing = snapshot?.adMissingLinks || [];
  const overBudget = budgetCents > 0 && spendCents > budgetCents;
  const spendRatio = budgetCents > 0 ? spendCents / budgetCents : 0;

  return [
    {
      rule: '预算上限',
      ready: budgetCents > 0 && !overBudget,
      evidence: `活动预算 ${money(budgetCents)} / 已用 ${money(spendCents)}`,
      operatorAction: budgetCents > 0
        ? '预算已进入内部门禁；继续等待门店确认和平台授权后再执行外部发布。'
        : '先写入测试预算上限；没有预算上限时，任何外部发布都只能停在计划状态。',
      stopLine: overBudget
        ? '花费已经超过预算，必须暂停或回滚，不能继续放量。'
        : '没有门店确认和预算回执前，不把预算门禁包装成发布完成。',
    },
    {
      rule: '暂停规则',
      ready: campaignCount > 0 && (overBudget || missing.length > 0 || spendRatio >= 0.8),
      evidence: `活动 ${campaignCount} / 缺口 ${missing.length} / 已用 ${(spendRatio * 100).toFixed(0)}%`,
      operatorAction: overBudget
        ? '立即标记暂停，补回滚原因和发布凭证。'
        : missing.length > 0
          ? `先处理发布阻断：${missing[0]}。`
          : spendRatio >= 0.8
            ? '预算消耗接近上限，先暂停等待到店反馈，不做自动加预算。'
            : '保持监控；未触发预算或证据风险时不需要暂停。',
      stopLine: '没有暂停/回滚规则前，不允许自动优化或自动加预算。',
    },
    {
      rule: '平台证据',
      ready: evidenceCount > 0,
      evidence: `发布链接或截图 ${evidenceCount} / 已启用活动 ${activeCampaignCount}`,
      operatorAction: evidenceCount > 0
        ? '把平台链接、截图或回执绑定到门店活动发布账本。'
        : '补发布链接或截图；没有证据时只能说活动假设，不能说真实发布。',
      stopLine: '没有平台回执或发布凭证前，不宣称外部发布已执行。',
    },
    {
      rule: '放量规则',
      ready: measuredCount > 0 && !overBudget,
      evidence: `已回流活动 ${measuredCount} / 已用 ${money(spendCents)}`,
      operatorAction: measuredCount > 0
        ? '只有有预约、券领取、私信或社群反馈的活动，才能进入下一轮预算建议和内容复用。'
        : '先导入预约、券领取、私信咨询或社群反馈；没有回流时不做放量建议。',
      stopLine: '没有到店或反馈回流前，不把方向性数据当作自动放量依据。',
    },
    {
      rule: '回滚原因',
      ready: missing.length === 0 && !overBudget && campaignCount > 0,
      evidence: missing.length ? missing.join(' / ') : campaignCount > 0 ? 'no hard publish blockers' : 'missing activity ledger',
      operatorAction: missing.length
        ? '把阻断项写成回滚原因，进入下一轮门店动作队列。'
        : campaignCount > 0
          ? '当前活动发布账本没有硬阻断；下一步只允许进入真实平台授权验收。'
          : '先建立活动发布账本；没有账本就没有可回滚对象。',
      stopLine: '任何外部发布失败都必须保留原因、证据、预算状态和下一步 owner。',
    },
  ];
}

export function buildManualPublishReceiptChecks(snapshot: ChannelAccountSnapshot | null): ManualPublishReceiptCheck[] {
  const accountCount = snapshot?.accountCount || 0;
  const healthyCount = snapshot?.healthyAccountCount || 0;
  const rateLimitedCount = snapshot?.rateLimitedAccountCount || 0;
  const totalLimit = snapshot?.totalDailyPublishLimit || 0;
  const scheduledCount = snapshot?.scheduledCount || 0;
  const availableSlotCount = snapshot?.availableSlotCount || 0;
  const evidenceCount = snapshot?.adEvidenceCount || 0;
  const measuredCount = snapshot?.measuredAdCampaignCount || 0;
  const campaignCount = snapshot?.adCampaignCount || 0;
  const gaps = [...(snapshot?.missingLinks || []), ...(snapshot?.adMissingLinks || [])];

  return [
    {
      gate: '渠道可用门禁',
      ready: accountCount > 0 && healthyCount > 0 && rateLimitedCount === 0,
      evidence: `渠道 ${accountCount} / 可用 ${healthyCount} / 限频 ${rateLimitedCount}`,
      operatorAction: healthyCount > 0
        ? '优先使用已确认可发布的渠道或社群；受限、阻断、限频渠道不能进入发布排期。'
        : '先补一个人工可发布且负责人明确的渠道，否则同城发布只能停在计划。'
      ,
      externalGate: '真实外部发布仍需要平台授权、商户授权和发布权限。',
    },
    {
      gate: '发布频次余量门禁',
      ready: totalLimit > 0 && scheduledCount <= totalLimit && availableSlotCount > 0,
      evidence: `日上限 ${totalLimit} / 已排 ${scheduledCount} / 余量 ${availableSlotCount}`,
      operatorAction: availableSlotCount > 0
        ? '把下一条内容排到有余量的渠道槽位，避免同一渠道过密发布。'
        : '先减少排期或换渠道，不能继续塞入同一个渠道。'
      ,
      externalGate: '自动限频需要平台返回 rate limit、渠道状态和发布失败码。',
    },
    {
      gate: '内容去重排期门禁',
      ready: campaignCount > 0 && scheduledCount <= Math.max(totalLimit, 1),
      evidence: `活动发布账本 ${campaignCount} / 已排期 ${scheduledCount}`,
      operatorAction: campaignCount > 0
        ? '同一内容必须绑定门店活动和发布安排后再排期，避免重复发同一版本。'
        : '先建立门店活动发布账本；没有版本归属就不进入矩阵排期。'
      ,
      externalGate: '跨平台自动去重仍需要发布回执、内容版本和平台内容 ID。',
    },
    {
      gate: '人工发布凭证门禁',
      ready: evidenceCount > 0,
      evidence: `发布链接或截图 ${evidenceCount}`,
      operatorAction: evidenceCount > 0
        ? '把平台链接、后台截图或门店备注绑定到发布账本，作为人工发布完成证据。'
        : '没有链接或截图时只能标记为待证明，不能标记已发布完成。'
      ,
      externalGate: '自动回执需要发布 API、平台内容 ID 和 webhook 或轮询同步。',
    },
    {
      gate: '到店信号回流门禁',
      ready: measuredCount > 0,
      evidence: `已回流预约/券领取/私信聚合信号 ${measuredCount}`,
      operatorAction: measuredCount > 0
        ? '把预约、券领取、私信咨询或社群反馈写回下一轮门店动作队列。'
        : gaps.length
          ? `先处理阻断项：${gaps[0]}。`
          : '发布后导入手工汇总或等待平台/社群反馈回流，未回流前不宣称经营效果。'
      ,
      externalGate: '自动信号回流需要平台 API、指标映射、授权范围和同步频率。',
    },
  ];
}

export function buildCastPublishProofLedger(
  snapshot: ChannelAccountSnapshot | null,
  input: Pick<RestaurantTrialIntake, 'restaurant' | 'offer'> = {},
): RestaurantPublishProofLedger {
  const restaurantName = input.restaurant || '样例餐厅';
  const offerName = input.offer || '招牌双人套餐';
  const acceptedCount = Math.min(snapshot?.adEvidenceCount || 0, RESTAURANT_PUBLISH_PROOF_DEMO_PLANS.length);
  const measured = (snapshot?.measuredAdCampaignCount || 0) > 0;
  const receipts = RESTAURANT_PUBLISH_PROOF_DEMO_PLANS.slice(0, acceptedCount).map((plan, index) => ({
    planId: plan.id,
    channel: plan.channel,
    publicUrl: `https://proof.example.test/${plan.channel}/${index + 1}`,
    screenshotId: `manual-proof-${index + 1}`,
    publishedAt: '2026-06-22T18:30:00.000Z',
    owner: plan.owner,
    aggregateSignals: measured
      ? {
        reservationCount: 2 + index,
        couponClaimCount: 6 + index,
        inquiryCount: 3 + index,
        reviewCount: index === 0 ? 1 : 0,
        visitIntentCount: 4 + index,
      }
      : undefined,
  }));

  return buildRestaurantPublishProofLedger({
    restaurantName,
    offerName,
    plans: RESTAURANT_PUBLISH_PROOF_DEMO_PLANS.map(plan => ({
      ...plan,
      restaurantName,
      offerName,
      status: snapshot && snapshot.accountCount === 0 ? 'needs-account' : plan.status,
      externalGates: snapshot && snapshot.connectedAccountCount > 0 ? [] : plan.externalGates,
    })),
    receipts,
  });
}

export function buildCastVariantPlaybook(
  snapshot: ChannelAccountSnapshot | null,
  variant: FactoryUiVariantId,
): CastPlaybook {
  const accountCount = snapshot?.accountCount || 0;
  const connectedCount = snapshot?.connectedAccountCount || 0;
  const healthyCount = snapshot?.healthyAccountCount || 0;
  const slotCount = snapshot?.availableSlotCount || 0;
  const campaignCount = snapshot?.adCampaignCount || 0;
  const activeCampaignCount = snapshot?.activeAdCampaignCount || 0;
  const evidenceCount = snapshot?.adEvidenceCount || 0;
  const measuredCount = snapshot?.measuredAdCampaignCount || 0;
  const gaps = [...(snapshot?.missingLinks || []), ...(snapshot?.adMissingLinks || [])];
  const score = castScore(snapshot);

  if (variant === 'operator') {
    return {
      title: 'Cast 运营动作剧本',
      primaryAction: gaps.length
        ? `先处理分发缺口：${gaps[0]}。`
        : '可以把发布安排推进到手工发布、证据回填和到店反馈导入。',
      proofToCheck: '每个发布动作都要能追到发布渠道、排期安排、发布链接/截图、活动预算和反馈回流。',
      handoffBoundary: '平台授权、发布 API 和平台/社群反馈回流没接入前，运营只能标记人工待证明或已收证据，不能标记自动化完成。',
      cards: [
        `渠道 ${accountCount} / 已连接 ${connectedCount} / 可用 ${healthyCount}`,
        `可发布槽位 ${slotCount} / 活动 ${campaignCount} / 已启用 ${activeCampaignCount}`,
        `发布凭证 ${evidenceCount} / 已回流 ${measuredCount} / Cast score ${score}/7`,
      ],
    };
  }

  if (variant === 'friend_trial') {
    const readyForTrial = accountCount > 0 && slotCount > 0 && (evidenceCount > 0 || campaignCount === 0);
    return {
      title: '朋友试用 Cast 路径',
      primaryAction: readyForTrial
        ? '把一个已准备好的发布渠道、发布时间和证据入口展示给朋友；只验证流程，不宣称已经发布。'
        : '先补一个可用渠道和可用发布槽位，否则朋友会卡在“到底能发到哪里”。',
      proofToCheck: '朋友只看三项：发布渠道是否明确、下一次发布是否有槽位、发布后是否能看到链接/截图或回流。',
      handoffBoundary: '没有真实发布链接、截图或反馈汇总时，页面必须说清楚这是流程试用，不是自动分发效果试用。',
      cards: [
        `可用渠道 ${healthyCount}/${accountCount}`,
        `可发布槽位 ${slotCount}`,
        `证据 ${evidenceCount} / 回流 ${measuredCount}`,
      ],
    };
  }

  return {
    title: 'Cast 商业验收剧本',
    primaryAction: score >= 5
      ? '可以进入外部平台接入验收：逐项配置平台授权、商户授权、发布 API 和反馈回流。'
      : '先补内部渠道矩阵、活动发布账本、发布槽位和证据回流，再谈矩阵分发能力。',
    proofToCheck: '合作者要看到渠道池、授权状态、可用度、发布频率、活动预算、平台证据和回流指标在同一项目账本里闭环。',
    handoffBoundary: '91M+ creative output、42M+ video distribution 只能作为竞品规模对标；Wenai 没有审计账本前不能当自有规模展示。',
    cards: [
      `Cast readiness ${score}/7`,
      `渠道 ${accountCount} / 槽位 ${slotCount} / 活动 ${campaignCount}`,
      `预算 ${money(snapshot?.adBudgetCents || 0)} / 花费 ${money(snapshot?.adSpendCents || 0)} / 证据 ${evidenceCount}`,
    ],
  };
}

export function CastDistributionConsoleClient({
  initialProjectId = 'default-project',
  initialSnapshot = null,
  selectedVariantId = 'partner',
  initialIntake = {},
}: {
  initialProjectId?: string;
  initialSnapshot?: ChannelAccountSnapshot | null;
  selectedVariantId?: FactoryUiVariantId;
  initialIntake?: RestaurantTrialIntake;
}) {
  const [projectId, setProjectId] = useState(initialProjectId);
  const [snapshot, setSnapshot] = useState<ChannelAccountSnapshot | null>(initialSnapshot);
  const [platform, setPlatform] = useState('大众点评');
  const [handle, setHandle] = useState('门店点评号 / 社群负责人');
  const [dailyPublishLimit, setDailyPublishLimit] = useState('3');
  const [scheduledCount, setScheduledCount] = useState('0');
  const [campaignName, setCampaignName] = useState('双人酸菜鱼晚餐到店活动');
  const [budgetCents, setBudgetCents] = useState('50000');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedVariant = CAST_VARIANTS[selectedVariantId];
  const playbook = buildCastVariantPlaybook(snapshot, selectedVariantId);
  const operatingChecks = buildCastManageOperatingChecks(snapshot);
  const adGuardrails = buildAdDeliveryGuardrails(snapshot);
  const manualReceiptChecks = buildManualPublishReceiptChecks(snapshot);
  const publishProofLedger = buildCastPublishProofLedger(snapshot, initialIntake);
  const nextActions = snapshot?.nextActions || [];
  const gaps = [...(snapshot?.missingLinks || []), ...(snapshot?.adMissingLinks || [])];

  async function refresh(nextProjectId = projectId) {
    setLoading(true);
    const res = await fetch(`/api/channel-accounts?projectId=${encodeURIComponent(nextProjectId || 'default-project')}`, { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.message || data.error || 'Cast 数据刷新失败');
      return;
    }
    setError('');
    setSnapshot(data.snapshot);
  }

  async function seedMatrix(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const res = await fetch('/api/channel-accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: projectId || 'default-project',
        account: {
          platform,
          handle,
          authorizationStatus: 'manual_ready',
          healthStatus: 'healthy',
          dailyPublishLimit: Number(dailyPublishLimit),
          scheduledCount: Number(scheduledCount),
        },
        campaign: campaignName.trim()
          ? {
            platform,
            campaignName,
            objective: 'sales',
            status: evidenceUrl.trim() ? 'active' : 'ready',
            budgetCents: Number(budgetCents),
            spendCents: 0,
            evidenceUrl: evidenceUrl.trim() || undefined,
          }
          : undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.message || data.error || '同城发布安排写入失败');
      return;
    }
    setError('');
    setNotice('已写入同城发布安排和门店活动账本；未回填链接或截图前，只保持待证明状态。');
    setSnapshot(data.snapshot);
  }

  if ((selectedVariantId as FactoryUiVariantId) === 'friend_trial') {
    const receiptFields = [
      { label: '发布平台', value: '大众点评 / 小红书 / 抖音 / 微信社群' },
      { label: '发布时间', value: '待门店或运营回填' },
      { label: '发布链接', value: '未回填前保持待补' },
      { label: '截图/备注', value: '可记录截图文件名或审核备注' },
      { label: '负责人', value: '运营 / 店长 / 社群负责人' },
      { label: '当前状态', value: '待发布 / 已发布待证明 / 已证明' },
    ];
    const restaurantReceiptChecks = manualReceiptChecks.slice(0, 4).map(item => ({
      ...item,
      gate: item.gate
        .replace('渠道可用门禁', '渠道可用')
        .replace('发布频次余量门禁', '发布频次余量')
        .replace('内容去重排期门禁', '内容去重排期')
        .replace('人工发布凭证门禁', '人工发布凭证'),
      evidence: item.evidence
        .replace(/campaign/gi, '活动计划')
        .replace(/scheduled/gi, '已排期')
        .replace(/evidence URL/gi, '发布凭证')
        .replace(/active/gi, '已启用'),
    }));

    return (
      <FactoryFriendTrialExperience
        active="cast"
        title="发到本地平台，并留下证明"
        subtitle="把内容排到大众点评、小红书、抖音、微信社群等渠道，发布链接、截图和状态都能给门店看。"
        metrics={[
          { label: '门店渠道', value: '待确认', detail: '账号/社群/排期', tone: 'emerald' },
          { label: '发布动作', value: '待安排', detail: '先审核后发布', tone: 'slate' },
          { label: '发布证明', value: '待回填', detail: '链接/截图', tone: 'amber' },
        ]}
        funnel={[
          { label: '账号', value: 82 },
          { label: '排期', value: 74 },
          { label: '发布', value: 62 },
          { label: '证明', value: 54 },
          { label: '回收', value: 42 },
        ]}
        actions={[
          { role: '运营', title: '安排发布', value: '选择渠道、社群、排期和负责人', href: '#cast-schedule' },
          { role: '餐饮客户', title: '查看证明', value: '发布后补链接或截图，门店能追溯', href: '#cast-proof' },
          { role: '店长/社群', title: '进入跟进', value: '把真实预约、券领取和私信交给负责人处理', href: '/factory/manage?variant=friend_trial' },
        ]}
        intake={initialIntake}
        nextHref="/factory/manage?variant=friend_trial"
        nextLabel="去看到店跟进"
      >
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <form id="cast-schedule" onSubmit={seedMatrix} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Local Publish Plan</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">新增同城发布安排</h2>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">可排期</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ['项目', projectId, setProjectId],
                ['同城渠道', platform, setPlatform],
                ['发布负责人', handle, setHandle],
                ['门店活动', campaignName, setCampaignName],
              ].map(([label, value, setter]) => (
                <label className="text-sm text-slate-700" key={String(label)}>
                  {String(label)}
                  <input
                    value={String(value)}
                    onChange={event => (setter as (value: string) => void)(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none focus:border-slate-400"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button disabled={loading} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-200 disabled:text-slate-500">
                写入发布安排
              </button>
              <button type="button" onClick={() => refresh()} disabled={loading} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:text-slate-400">
                刷新
              </button>
            </div>
            {notice ? <p className="mt-3 text-sm text-emerald-700">{notice}</p> : null}
            {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
          </form>

          <section id="cast-proof" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-950">发布链路</h2>
              <span className="text-xs font-medium text-slate-500">链接/截图</span>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {receiptFields.map(item => (
                <label className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-slate-700" key={item.label}>
                  <span className="text-xs font-semibold text-amber-700">{item.label}</span>
                  <input
                    className="mt-2 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-amber-400"
                    defaultValue={item.value}
                  />
                </label>
              ))}
              {restaurantReceiptChecks.map(item => (
                <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={item.gate}>
                  <div className={`text-xs font-semibold ${item.ready ? 'text-emerald-700' : 'text-amber-700'}`}>{item.ready ? '可用' : '待补'}</div>
                  <h3 className="mt-2 text-sm font-semibold text-slate-950">{item.gate.replace('门禁', '')}</h3>
                  <p className="mt-2 text-xs text-slate-500">{item.evidence}</p>
                </article>
              ))}
            </div>
          </section>
        </section>
      </FactoryFriendTrialExperience>
    );
  }

  return (
    <main className="min-h-screen bg-[#07110f] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="rounded-[8px] border border-emerald-200/15 bg-[#0d1a17] p-5 shadow-2xl shadow-black/30">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">Local Publish Console</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-normal text-white sm:text-4xl">同城发布凭证控制台</h1>
              <p className="mt-3 text-sm leading-6 text-emerald-50/70">{selectedVariant.headline}</p>
              <p className="mt-2 text-sm leading-6 text-white/55">{selectedVariant.body}</p>
            </div>
          </div>
        </section>

        <FactoryVariantConsole
          accent="emerald"
          basePath="/factory/cast"
          evidenceCards={playbook.cards}
          eyebrow="Cast Publish Playbook"
          firstScreen={selectedVariant.body}
          nextAction={selectedVariant.firstAction}
          primaryAction={playbook.primaryAction}
          projectId={projectId}
          proofFocus={playbook.proofToCheck}
          selectedVariantId={selectedVariantId}
          stopLine={playbook.handoffBoundary}
          title={playbook.title}
          variants={CAST_VARIANTS}
        />

        <section className="rounded-[8px] border border-emerald-200/15 bg-white/[0.04] p-5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">Restaurant Operating Board</p>
              <h2 className="mt-2 text-xl font-semibold">Cast/Manage 门店发布验收板</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                这里把内容版本、渠道、预算、门店活动、发布凭证、反馈回流和下一轮门店动作队列放到同一块板上；缺一项就保持手工门禁。
              </p>
            </div>
            <div className="text-sm font-semibold text-emerald-100">
              {operatingChecks.filter(item => item.ready).length}/{operatingChecks.length} 就绪
            </div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {operatingChecks.map(item => (
              <div key={item.stage} className={`rounded-[8px] border p-4 ${
                item.ready ? 'border-emerald-200/25 bg-emerald-300/10' : 'border-amber-200/20 bg-amber-300/10'
              }`}>
                <div className={`text-xs font-semibold ${item.ready ? 'text-emerald-100' : 'text-amber-100'}`}>
                  {item.ready ? '已具备证据' : '继续补证据'}
                </div>
                <h3 className="mt-2 text-sm font-semibold text-white">{item.stage}</h3>
                <p className="mt-2 text-xs leading-5 text-white/60">{item.evidence}</p>
                <p className="mt-2 text-xs leading-5 text-white/45">{item.next}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[8px] border border-lime-200/15 bg-lime-950/15 p-5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-lime-200">发布凭证门禁</p>
              <h2 className="mt-2 text-xl font-semibold">活动发布止损与到店回流门禁</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                这层参考成熟活动运营的门禁结构，但改成餐饮活动发布：预算上限、暂停规则、发布凭证、到店反馈和回滚原因必须同屏可见；没有平台和商户授权前只做人工门禁，不宣称自动优化。
              </p>
            </div>
            <div className="text-sm font-semibold text-lime-100">
              {adGuardrails.filter(item => item.ready).length}/{adGuardrails.length} publish gates ready
            </div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-5">
            {adGuardrails.map(item => (
              <div key={item.rule} className={`rounded-[8px] border p-4 ${
                item.ready ? 'border-lime-200/25 bg-lime-300/10' : 'border-amber-200/20 bg-amber-300/10'
              }`}>
                <div className={`text-xs font-semibold ${item.ready ? 'text-lime-100' : 'text-amber-100'}`}>
                  {item.ready ? '门禁有证据' : '继续补门禁'}
                </div>
                <h3 className="mt-2 text-sm font-semibold text-white">{item.rule}</h3>
                <p className="mt-2 text-xs leading-5 text-white/60">{item.evidence}</p>
                <p className="mt-2 text-xs leading-5 text-lime-100/70">{item.operatorAction}</p>
                <p className="mt-2 text-xs leading-5 text-white/45">{item.stopLine}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[8px] border border-cyan-200/15 bg-cyan-950/15 p-5">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Publish Proof Board</p>
              <h2 className="mt-2 text-xl font-semibold">人工发布凭证与渠道频控验收板</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                没接外部平台授权时，Cast 也不能停在计划。这里把渠道可用、频控余量、去重排期、人工发布凭证和到店反馈拆成门禁；没有平台证据时只允许人工待证明，不把人工流程包装成自动分发。
              </p>
            </div>
            <div className="text-sm font-semibold text-cyan-100">
              {manualReceiptChecks.filter(item => item.ready).length}/{manualReceiptChecks.length} receipt gates ready
            </div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-5">
            {manualReceiptChecks.map(item => (
              <div key={item.gate} className={`rounded-[8px] border p-4 ${
                item.ready ? 'border-cyan-200/25 bg-cyan-300/10' : 'border-amber-200/20 bg-amber-300/10'
              }`}>
                <div className={`text-xs font-semibold ${item.ready ? 'text-cyan-100' : 'text-amber-100'}`}>
                  {item.ready ? '已有证据' : '继续补证据'}
                </div>
                <h3 className="mt-2 text-sm font-semibold text-white">{item.gate}</h3>
                <p className="mt-2 text-xs leading-5 text-white/60">{item.evidence}</p>
                <p className="mt-2 text-xs leading-5 text-cyan-100/70">{item.operatorAction}</p>
                <p className="mt-2 text-xs leading-5 text-white/45">{item.externalGate}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-[8px] border border-cyan-200/20 bg-black/20 p-4">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Shared Publish Proof Ledger</p>
                <h3 className="mt-2 text-lg font-semibold text-white">发布凭证账本合同</h3>
                <p className="mt-2 text-sm leading-6 text-white/55">
                  这张账本和朋友试用入口共用同一套规则：每条发布都必须有渠道、负责人、发布时间、链接或截图、状态和下一步。
                </p>
              </div>
              <div className="grid grid-cols-3 overflow-hidden rounded-[8px] border border-white/10 text-center text-xs">
                <div className="border-r border-white/10 px-3 py-2">
                  <div className="font-semibold text-white">{publishProofLedger.summary.total}</div>
                  <div className="mt-0.5 text-white/45">渠道</div>
                </div>
                <div className="border-r border-white/10 px-3 py-2">
                  <div className="font-semibold text-white">{publishProofLedger.summary.accepted}</div>
                  <div className="mt-0.5 text-white/45">已收</div>
                </div>
                <div className="px-3 py-2">
                  <div className="font-semibold text-white">{publishProofLedger.summary.nextActionCount}</div>
                  <div className="mt-0.5 text-white/45">待办</div>
                </div>
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {publishProofLedger.items.map(item => (
                <div key={item.id} className={`rounded-[8px] border p-3 ${
                  item.status === 'accepted' ? 'border-emerald-200/25 bg-emerald-300/10' : 'border-amber-200/20 bg-amber-300/10'
                }`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item.storeName}</h4>
                      <p className="mt-1 text-xs leading-5 text-white/55">负责人：{item.owner} · 排期：{item.scheduledAt}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-semibold text-white/75">{item.status === 'accepted' ? '凭证已收' : '待补凭证'}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/60">{item.proofSummary}</p>
                  <p className="mt-2 rounded-[6px] bg-black/25 px-2 py-1 text-xs leading-5 text-cyan-100/75">下一步：{item.blockers[0] || item.nextAction}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs leading-5 text-white/45">回流只收脱敏汇总，不保存顾客身份、聊天原文、券码、订单或收银明细。</p>
          </div>
        </section>

        <section className="grid gap-4">
          <form onSubmit={seedMatrix} className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">Publish Plan Seed</p>
            <h2 className="mt-2 text-xl font-semibold">补一个可验证发布安排</h2>
            <p className="mt-2 text-sm leading-6 text-white/55">一次写入渠道安排和门店活动发布账本；没有发布链接或截图时保持待证明，不伪装发布完成。</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm text-white/70">
                项目
                <input value={projectId} onChange={event => setProjectId(event.target.value)} className="mt-1 w-full rounded-[6px] border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-emerald-300" />
              </label>
              <label className="text-sm text-white/70">
                平台
                <input value={platform} onChange={event => setPlatform(event.target.value)} className="mt-1 w-full rounded-[6px] border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-emerald-300" />
              </label>
              <label className="text-sm text-white/70">
                发布负责人
                <input value={handle} onChange={event => setHandle(event.target.value)} className="mt-1 w-full rounded-[6px] border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-emerald-300" />
              </label>
              <label className="text-sm text-white/70">
                日发布上限
                <input value={dailyPublishLimit} onChange={event => setDailyPublishLimit(event.target.value)} className="mt-1 w-full rounded-[6px] border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-emerald-300" />
              </label>
              <label className="text-sm text-white/70">
                已排期数量
                <input value={scheduledCount} onChange={event => setScheduledCount(event.target.value)} className="mt-1 w-full rounded-[6px] border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-emerald-300" />
              </label>
              <label className="text-sm text-white/70">
                活动预算（分）
                <input value={budgetCents} onChange={event => setBudgetCents(event.target.value)} className="mt-1 w-full rounded-[6px] border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-emerald-300" />
              </label>
              <label className="text-sm text-white/70 sm:col-span-2">
                门店活动名称
                <input value={campaignName} onChange={event => setCampaignName(event.target.value)} className="mt-1 w-full rounded-[6px] border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-emerald-300" />
              </label>
              <label className="text-sm text-white/70 sm:col-span-2">
                发布链接或截图备注（没有则保持待证明）
                <input value={evidenceUrl} onChange={event => setEvidenceUrl(event.target.value)} className="mt-1 w-full rounded-[6px] border border-white/10 bg-black/30 px-3 py-2 text-white outline-none focus:border-emerald-300" />
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button disabled={loading} className="rounded-[6px] bg-emerald-300 px-4 py-2 text-sm font-semibold text-[#07110f] disabled:opacity-50">
                写入矩阵账本
              </button>
              <button type="button" onClick={() => refresh()} disabled={loading} className="rounded-[6px] border border-white/15 px-4 py-2 text-sm text-white/80 disabled:opacity-50">
                刷新 Cast 状态
              </button>
            </div>
            {notice ? <p className="mt-3 text-sm text-emerald-100">{notice}</p> : null}
            {error ? <p className="mt-3 text-sm text-red-200">{error}</p> : null}
          </form>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Matrix</p>
            <div className="mt-3 text-3xl font-semibold">{snapshot?.accountCount || 0}</div>
            <p className="mt-2 text-sm text-white/60">账号池 · 已连接 {snapshot?.connectedAccountCount || 0} · 健康 {snapshot?.healthyAccountCount || 0}</p>
          </div>
          <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">Slots</p>
            <div className="mt-3 text-3xl font-semibold">{snapshot?.availableSlotCount || 0}</div>
            <p className="mt-2 text-sm text-white/60">总上限 {snapshot?.totalDailyPublishLimit || 0} · 已排期 {snapshot?.scheduledCount || 0}</p>
          </div>
          <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-white/45">门店活动</p>
            <div className="mt-3 text-3xl font-semibold">{snapshot?.adCampaignCount || 0}</div>
            <p className="mt-2 text-sm text-white/60">活跃 {snapshot?.activeAdCampaignCount || 0} · 已衡量 {snapshot?.measuredAdCampaignCount || 0} · 证据 {snapshot?.adEvidenceCount || 0}</p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-semibold">Cast 缺口</h2>
            <div className="mt-3 space-y-2">
              {(gaps.length ? gaps : ['内部 Cast 账本当前没有阻断项，下一步是接真实平台授权。']).map(item => (
                <div key={item} className="rounded-[6px] border border-white/10 bg-black/20 p-3 text-sm text-white/70">{item}</div>
              ))}
            </div>
          </div>
          <div className="rounded-[8px] border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-semibold">下一步队列</h2>
            <div className="mt-3 space-y-2">
              {(nextActions.length ? nextActions : [
                selectedVariant.firstAction,
                selectedVariant.stopLine,
              ]).map(item => (
                <div key={item} className="rounded-[6px] border border-white/10 bg-black/20 p-3 text-sm text-white/70">{item}</div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

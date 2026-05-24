import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import CastFactoryPage from '@/app/factory/cast/page';
import {
  CastDistributionConsoleClient,
  buildAdDeliveryGuardrails,
  buildCastManageOperatingChecks,
  buildCastVariantPlaybook,
  buildManualPublishReceiptChecks,
} from '@/components/CastDistributionConsoleClient';
import type { ChannelAccountSnapshot } from '@/lib/channel-account-ledger';

function snapshot(overrides: Partial<ChannelAccountSnapshot> = {}): ChannelAccountSnapshot {
  return {
    orgId: 'test-org',
    projectId: 'cast-project',
    accountCount: 0,
    connectedAccountCount: 0,
    healthyAccountCount: 0,
    blockedAccountCount: 0,
    rateLimitedAccountCount: 0,
    totalDailyPublishLimit: 0,
    scheduledCount: 0,
    availableSlotCount: 0,
    adCampaignCount: 0,
    readyAdCampaignCount: 0,
    activeAdCampaignCount: 0,
    measuredAdCampaignCount: 0,
    adBudgetCents: 0,
    adSpendCents: 0,
    adEvidenceCount: 0,
    adMissingLinks: ['Missing ad campaign ledger'],
    missingLinks: ['Missing channel account matrix'],
    nextActions: [
      'Close channel gap: Missing channel account matrix',
      'Close ad campaign gap: Missing ad campaign ledger',
    ],
    ...overrides,
  };
}

describe('cast distribution console page', () => {
  it('renders the Cast variant UI and links all role variants', async () => {
    const page = await CastFactoryPage({
      searchParams: Promise.resolve({ projectId: 'launch-cast', variant: 'operator' }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain('分发投放控制台');
    expect(html).toContain('Cast Distribution Variant');
    expect(html).toContain('Cast Action Playbook');
    expect(html).toContain('Cast 运营动作剧本');
    expect(html).toContain('Smartly式 Cast/Manage 一体化验收板');
    expect(html).toContain('Ad Delivery Guardrails');
    expect(html).toContain('Manual Publish Receipt Board');
    expect(html).toContain('人工发布回执与矩阵频控验收板');
    expect(html).toContain('账号健康门禁');
    expect(html).toContain('频控余量门禁');
    expect(html).toContain('去重排期门禁');
    expect(html).toContain('人工发布回执门禁');
    expect(html).toContain('表现回流门禁');
    expect(html).toContain('广告投放止损与放量门禁');
    expect(html).toContain('预算 cap');
    expect(html).toContain('不宣称自动优化');
    expect(html).toContain('Matrix Seed');
    expect(html).toContain('账号矩阵');
    expect(html).toContain('广告 campaign ledger');
    expect(html).toContain('/factory/cast?projectId=launch-cast&amp;variant=partner');
    expect(html).toContain('/factory/cast?projectId=launch-cast&amp;variant=friend_trial');
  });

  it('renders distinct partner and friend trial Cast variants', () => {
    const ready = snapshot({
      accountCount: 2,
      connectedAccountCount: 2,
      healthyAccountCount: 2,
      totalDailyPublishLimit: 6,
      scheduledCount: 2,
      availableSlotCount: 4,
      adCampaignCount: 1,
      activeAdCampaignCount: 1,
      adEvidenceCount: 1,
      missingLinks: [],
      adMissingLinks: [],
      nextActions: [],
    });

    const partnerHtml = renderToStaticMarkup(
      <CastDistributionConsoleClient initialProjectId="partner-cast" initialSnapshot={ready} selectedVariantId="partner" />,
    );
    const friendHtml = renderToStaticMarkup(
      <CastDistributionConsoleClient initialProjectId="friend-cast" initialSnapshot={ready} selectedVariantId="friend_trial" />,
    );

    expect(partnerHtml).toContain('合作者视角');
    expect(partnerHtml).toContain('Cast 商业验收剧本');
    expect(partnerHtml).toContain('91M+ creative output、42M+ video distribution');
    expect(partnerHtml).toContain('OAuth、广告账户授权、自动发布 API 和 analytics sync');

    expect(friendHtml).toContain('Wenai 餐饮门店增长工作台');
    expect(friendHtml).toContain('发到本地平台，并留下证明');
    expect(friendHtml).toContain('创建一个门店活动任务');
    expect(friendHtml).toContain('发到本地平台，并留下证明');
    expect(friendHtml).toContain('Channel Matrix');
    expect(friendHtml).toContain('新增发布账号');
    expect(friendHtml).toContain('发布链路');
    expect(friendHtml).toContain('/factory/manage?variant=friend_trial');
  });

  it('builds role-specific Cast playbooks from account and ad evidence', () => {
    const blocked = snapshot();
    const ready = snapshot({
      accountCount: 2,
      connectedAccountCount: 2,
      healthyAccountCount: 1,
      totalDailyPublishLimit: 4,
      scheduledCount: 1,
      availableSlotCount: 3,
      adCampaignCount: 1,
      readyAdCampaignCount: 1,
      activeAdCampaignCount: 1,
      measuredAdCampaignCount: 1,
      adBudgetCents: 50000,
      adSpendCents: 12000,
      adEvidenceCount: 1,
      missingLinks: [],
      adMissingLinks: [],
      nextActions: [],
    });

    expect(buildCastVariantPlaybook(blocked, 'operator')).toEqual(expect.objectContaining({
      title: 'Cast 运营动作剧本',
      primaryAction: expect.stringContaining('Missing channel account matrix'),
      handoffBoundary: expect.stringContaining('manual-ready'),
    }));

    expect(buildCastVariantPlaybook(ready, 'partner')).toEqual(expect.objectContaining({
      title: 'Cast 商业验收剧本',
      primaryAction: expect.stringContaining('外部平台接入验收'),
      cards: expect.arrayContaining([
        expect.stringContaining('Cast readiness 7/7'),
      ]),
    }));

    expect(buildCastVariantPlaybook(ready, 'friend_trial')).toEqual(expect.objectContaining({
      title: '朋友试用 Cast 路径',
      proofToCheck: expect.stringContaining('朋友只看三项'),
    }));
  });

  it('builds Smartly-style Cast/Manage operating checks from matrix and campaign evidence', () => {
    const ready = snapshot({
      accountCount: 2,
      connectedAccountCount: 2,
      healthyAccountCount: 1,
      totalDailyPublishLimit: 4,
      scheduledCount: 1,
      availableSlotCount: 3,
      adCampaignCount: 1,
      readyAdCampaignCount: 1,
      activeAdCampaignCount: 1,
      measuredAdCampaignCount: 1,
      adBudgetCents: 50000,
      adSpendCents: 12000,
      adEvidenceCount: 1,
      missingLinks: [],
      adMissingLinks: [],
      nextActions: [],
    });

    expect(buildCastManageOperatingChecks(ready)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        stage: '素材版本 / Campaign 绑定',
        ready: true,
      }),
      expect.objectContaining({
        stage: '账号与发布槽位',
        ready: true,
      }),
      expect.objectContaining({
        stage: '预算与投放门禁',
        ready: true,
      }),
      expect.objectContaining({
        stage: '平台回执',
        ready: true,
      }),
      expect.objectContaining({
        stage: '表现回流',
        ready: true,
      }),
      expect.objectContaining({
        stage: '下一轮 Action Queue',
        ready: true,
      }),
    ]));
  });

  it('builds ad delivery guardrails for budget caps, pause rules, scale rules, and rollback reasons', () => {
    const blocked = snapshot({
      adCampaignCount: 1,
      readyAdCampaignCount: 1,
      activeAdCampaignCount: 1,
      adBudgetCents: 10000,
      adSpendCents: 12000,
      adEvidenceCount: 0,
      measuredAdCampaignCount: 0,
      adMissingLinks: ['Ad campaign missing platform evidence URL', 'Ad campaign spend exceeds budget'],
    });

    expect(buildAdDeliveryGuardrails(blocked)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        rule: '预算上限',
        ready: false,
        stopLine: expect.stringContaining('必须暂停或回滚'),
      }),
      expect.objectContaining({
        rule: '暂停规则',
        ready: true,
        operatorAction: expect.stringContaining('立即标记暂停'),
      }),
      expect.objectContaining({
        rule: '平台证据',
        ready: false,
        operatorAction: expect.stringContaining('没有证据时只能说 campaign hypothesis'),
      }),
      expect.objectContaining({
        rule: '放量规则',
        ready: false,
        stopLine: expect.stringContaining('不把方向性数据当作自动放量依据'),
      }),
      expect.objectContaining({
        rule: '回滚原因',
        ready: false,
        evidence: expect.stringContaining('Ad campaign missing platform evidence URL'),
      }),
    ]));

    const ready = snapshot({
      adCampaignCount: 1,
      readyAdCampaignCount: 1,
      activeAdCampaignCount: 1,
      measuredAdCampaignCount: 1,
      adBudgetCents: 50000,
      adSpendCents: 12000,
      adEvidenceCount: 1,
      adMissingLinks: [],
    });

    expect(buildAdDeliveryGuardrails(ready)).toEqual(expect.arrayContaining([
      expect.objectContaining({ rule: '预算上限', ready: true }),
      expect.objectContaining({ rule: '平台证据', ready: true }),
      expect.objectContaining({ rule: '放量规则', ready: true }),
      expect.objectContaining({ rule: '回滚原因', ready: true }),
    ]));
  });

  it('builds manual publish receipt checks for account health frequency dedupe evidence and return flow', () => {
    const blocked = snapshot({
      accountCount: 1,
      connectedAccountCount: 1,
      healthyAccountCount: 0,
      rateLimitedAccountCount: 1,
      totalDailyPublishLimit: 2,
      scheduledCount: 2,
      availableSlotCount: 0,
      adCampaignCount: 0,
      adEvidenceCount: 0,
      measuredAdCampaignCount: 0,
    });

    expect(buildManualPublishReceiptChecks(blocked)).toEqual(expect.arrayContaining([
      expect.objectContaining({ gate: '账号健康门禁', ready: false }),
      expect.objectContaining({ gate: '频控余量门禁', ready: false }),
      expect.objectContaining({ gate: '去重排期门禁', ready: false }),
      expect.objectContaining({ gate: '人工发布回执门禁', ready: false }),
      expect.objectContaining({ gate: '表现回流门禁', ready: false }),
    ]));

    const ready = snapshot({
      accountCount: 2,
      connectedAccountCount: 2,
      healthyAccountCount: 2,
      rateLimitedAccountCount: 0,
      totalDailyPublishLimit: 6,
      scheduledCount: 2,
      availableSlotCount: 4,
      adCampaignCount: 1,
      adEvidenceCount: 1,
      measuredAdCampaignCount: 1,
      missingLinks: [],
      adMissingLinks: [],
    });

    expect(buildManualPublishReceiptChecks(ready)).toEqual(expect.arrayContaining([
      expect.objectContaining({ gate: '账号健康门禁', ready: true }),
      expect.objectContaining({ gate: '频控余量门禁', ready: true }),
      expect.objectContaining({ gate: '去重排期门禁', ready: true }),
      expect.objectContaining({ gate: '人工发布回执门禁', ready: true }),
      expect.objectContaining({ gate: '表现回流门禁', ready: true }),
      expect.objectContaining({
        gate: '人工发布回执门禁',
        externalGate: expect.stringContaining('发布 API'),
      }),
    ]));
  });
});

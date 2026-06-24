import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import CastFactoryPage from '@/app/factory/cast/page';
import {
  CastDistributionConsoleClient,
  buildAdDeliveryGuardrails,
  buildCastPublishProofLedger,
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
    adMissingLinks: ['Missing activity ledger'],
    missingLinks: ['Missing channel account matrix'],
    nextActions: [
      'Close channel gap: Missing channel account matrix',
      'Close activity gap: Missing activity ledger',
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

    expect(html).toContain('同城发布凭证控制台');
    expect(html).toContain('Local Publish Console');
    expect(html).toContain('Cast Publish Playbook');
    expect(html).toContain('Cast 运营动作剧本');
    expect(html).toContain('Cast/Manage 门店发布验收板');
    expect(html).toContain('发布凭证门禁');
    expect(html).toContain('Publish Proof Board');
    expect(html).toContain('人工发布凭证与渠道频控验收板');
    expect(html).toContain('Shared Publish Proof Ledger');
    expect(html).toContain('发布凭证账本合同');
    expect(html).toContain('每条发布都必须有渠道、负责人、发布时间、链接或截图、状态和下一步');
    expect(html).toContain('回流只收脱敏汇总，不保存顾客身份、聊天原文、券码、订单或收银明细。');
    expect(html).toContain('渠道可用门禁');
    expect(html).toContain('发布频次余量门禁');
    expect(html).toContain('内容去重排期门禁');
    expect(html).toContain('人工发布凭证门禁');
    expect(html).toContain('到店信号回流门禁');
    expect(html).toContain('活动发布止损与到店回流门禁');
    expect(html).toContain('预算上限');
    expect(html).toContain('不宣称自动优化');
    expect(html).toContain('Publish Plan Seed');
    expect(html).toContain('可验证发布安排');
    expect(html).toContain('门店活动发布账本');
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
    expect(partnerHtml).toContain('平台授权、商户授权、发布 API 和反馈回流');

    expect(friendHtml).toContain('Wenai 餐饮门店增长工作台');
    expect(friendHtml).toContain('发到本地平台，并留下证明');
    expect(friendHtml).toContain('创建一个门店活动任务');
    expect(friendHtml).toContain('发到本地平台，并留下证明');
    expect(friendHtml).toContain('Local Publish Plan');
    expect(friendHtml).toContain('新增同城发布安排');
    expect(friendHtml).toContain('同城渠道');
    expect(friendHtml).toContain('发布负责人');
    expect(friendHtml).toContain('发布链接');
    expect(friendHtml).toContain('截图/备注');
    expect(friendHtml).toContain('去看到店跟进');
    expect(friendHtml).toContain('/factory/manage?variant=friend_trial');
    expect(friendHtml).not.toContain('Ad Delivery Guardrails');
    expect(friendHtml).not.toContain('Campaign 名称');
    expect(friendHtml).not.toContain('广告预算');
    expect(friendHtml).not.toContain('Manual Publish Receipt Board');
    expect(friendHtml).not.toContain('analytics sync');
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
      handoffBoundary: expect.stringContaining('人工待证明'),
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

  it('builds restaurant Cast/Manage operating checks from activity and publish proof evidence', () => {
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
        stage: '内容版本 / 门店活动绑定',
        ready: true,
      }),
      expect.objectContaining({
        stage: '渠道与发布槽位',
        ready: true,
      }),
      expect.objectContaining({
        stage: '活动预算与发布门禁',
        ready: true,
      }),
      expect.objectContaining({
        stage: '发布凭证',
        ready: true,
      }),
      expect.objectContaining({
        stage: '预约/券领取/私信回流',
        ready: true,
      }),
      expect.objectContaining({
        stage: '下一轮门店动作队列',
        ready: true,
      }),
    ]));
  });

  it('builds publish guardrails for budget caps, pause rules, scale rules, and rollback reasons', () => {
    const blocked = snapshot({
      adCampaignCount: 1,
      readyAdCampaignCount: 1,
      activeAdCampaignCount: 1,
      adBudgetCents: 10000,
      adSpendCents: 12000,
      adEvidenceCount: 0,
      measuredAdCampaignCount: 0,
      adMissingLinks: ['Activity missing publish proof', 'Activity spend exceeds budget'],
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
        operatorAction: expect.stringContaining('没有证据时只能说活动假设'),
      }),
      expect.objectContaining({
        rule: '放量规则',
        ready: false,
        stopLine: expect.stringContaining('不把方向性数据当作自动放量依据'),
      }),
      expect.objectContaining({
        rule: '回滚原因',
        ready: false,
        evidence: expect.stringContaining('Activity missing publish proof'),
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

  it('builds manual publish receipt checks for channel availability frequency proof and return flow', () => {
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
      expect.objectContaining({ gate: '渠道可用门禁', ready: false }),
      expect.objectContaining({ gate: '发布频次余量门禁', ready: false }),
      expect.objectContaining({ gate: '内容去重排期门禁', ready: false }),
      expect.objectContaining({ gate: '人工发布凭证门禁', ready: false }),
      expect.objectContaining({ gate: '到店信号回流门禁', ready: false }),
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
      expect.objectContaining({ gate: '渠道可用门禁', ready: true }),
      expect.objectContaining({ gate: '发布频次余量门禁', ready: true }),
      expect.objectContaining({ gate: '内容去重排期门禁', ready: true }),
      expect.objectContaining({ gate: '人工发布凭证门禁', ready: true }),
      expect.objectContaining({ gate: '到店信号回流门禁', ready: true }),
      expect.objectContaining({
        gate: '人工发布凭证门禁',
        externalGate: expect.stringContaining('发布 API'),
      }),
    ]));
  });

  it('adapts Cast channel evidence into the shared restaurant publish proof ledger', () => {
    const blockedLedger = buildCastPublishProofLedger(snapshot(), {
      restaurant: '北城面馆',
      offer: '番茄牛腩面套餐',
    });

    expect(blockedLedger.payloadShape).toBe('restaurant-publish-proof-ledger-v1');
    expect(blockedLedger.restaurantName).toBe('北城面馆');
    expect(blockedLedger.offerName).toBe('番茄牛腩面套餐');
    expect(blockedLedger.summary.canClaimExternalPublish).toBe(false);
    expect(blockedLedger.items[0]).toEqual(expect.objectContaining({
      status: 'needs-account',
      owner: '运营',
    }));
    expect(blockedLedger.nextActions.join('\n')).toContain('缺外部账号/授权');

    const readyLedger = buildCastPublishProofLedger(snapshot({
      accountCount: 2,
      connectedAccountCount: 2,
      healthyAccountCount: 2,
      adEvidenceCount: 2,
      measuredAdCampaignCount: 1,
      missingLinks: [],
      adMissingLinks: [],
    }));

    expect(readyLedger.summary.accepted).toBe(2);
    expect(readyLedger.summary.canClaimExternalPublish).toBe(false);
    expect(readyLedger.items.slice(0, 2).map(item => item.status)).toEqual(['accepted', 'accepted']);
    expect(readyLedger.items[0].aggregateSignals.reservationCount).toBeGreaterThan(0);
    expect(readyLedger.items[2].status).toBe('needs-proof');
  });
});

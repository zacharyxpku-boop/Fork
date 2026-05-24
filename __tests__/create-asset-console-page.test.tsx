import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import CreateFactoryPage from '@/app/factory/create/page';
import { CreateAssetConsoleClient, buildCreateBrandProductionChecks, buildCreateVariantPlaybook } from '@/components/CreateAssetConsoleClient';
import type { IndustrializationSnapshot } from '@/lib/industrial-chain-store';

function snapshot(overrides: Partial<IndustrializationSnapshot> = {}): IndustrializationSnapshot {
  return {
    orgId: 'test-org',
    projectId: 'create-project',
    assetCount: 0,
    reportAssetCount: 0,
    approvedAssetCount: 0,
    reusableAssetCount: 0,
    blockedAssetCount: 0,
    rightsIssueAssetCount: 0,
    assetGovernanceIssueCount: 0,
    deliverableAssetCount: 0,
    clientReviewAssetCount: 0,
    approvedDeliverableCount: 0,
    revisionRequestedCount: 0,
    deliveryIssueCount: 0,
    planCount: 0,
    draftPlanCount: 0,
    nextRoundAssetPlanCount: 0,
    readyPlanCount: 0,
    dispatchCount: 0,
    executableDispatchCount: 0,
    publishedDispatchCount: 0,
    publishedWithEvidenceCount: 0,
    missingPublishEvidenceCount: 0,
    overdueReviewDispatchCount: 0,
    measuredDispatchCount: 0,
    performanceReturnCount: 0,
    scaleDecisionCount: 0,
    assetMatchAmbiguousCount: 0,
    assetMatchUnmatchedCount: 0,
    assetMatchIssueCount: 0,
    missingLinks: ['Missing production brief or script asset'],
    nextActions: ['Close gap: Missing production brief or script asset'],
    ...overrides,
  };
}

describe('create asset console page', () => {
  it('renders the Create variant UI and links all role variants', async () => {
    const page = await CreateFactoryPage({
      searchParams: Promise.resolve({ projectId: 'launch-create', variant: 'operator' }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain('资产生产控制台');
    expect(html).toContain('Create Asset Variant');
    expect(html).toContain('Create Action Playbook');
    expect(html).toContain('Create 运营动作剧本');
    expect(html).toContain('Creatopy / Pencil 参考层');
    expect(html).toContain('品牌安全批量生产验收板');
    expect(html).toContain('Create Seed');
    expect(html).toContain('brief、benchmark、script 和 visual asset');
    expect(html).toContain('/factory/create?projectId=launch-create&amp;variant=partner');
    expect(html).toContain('/factory/create?projectId=launch-create&amp;variant=friend_trial');
  });

  it('renders distinct partner and friend trial Create variants', () => {
    const ready = snapshot({
      assetCount: 4,
      approvedAssetCount: 4,
      reusableAssetCount: 4,
      rightsIssueAssetCount: 0,
      deliverableAssetCount: 1,
      clientReviewAssetCount: 1,
      approvedDeliverableCount: 1,
      missingLinks: [],
      nextActions: [],
    });

    const partnerHtml = renderToStaticMarkup(
      <CreateAssetConsoleClient initialProjectId="partner-create" initialSnapshot={ready} selectedVariantId="partner" />,
    );
    const friendHtml = renderToStaticMarkup(
      <CreateAssetConsoleClient initialProjectId="friend-create" initialSnapshot={ready} selectedVariantId="friend_trial" />,
    );

    expect(partnerHtml).toContain('合作者视角');
    expect(partnerHtml).toContain('Create 商业验收剧本');
    expect(partnerHtml).toContain('真实 provider 和企业云资产接入验收');
    expect(partnerHtml).toContain('一键视频、智能混剪和批量生成');

    expect(friendHtml).toContain('Wenai 餐饮门店增长工作台');
    expect(friendHtml).toContain('把菜品和门店资料变成本地内容素材');
    expect(friendHtml).toContain('创建一个门店活动任务');
    expect(friendHtml).toContain('Asset Builder');
    expect(friendHtml).toContain('新增内容资产');
    expect(friendHtml).toContain('资产状态');
    expect(friendHtml).toContain('/factory/video?variant=friend_trial');
  });

  it('builds role-specific Create playbooks from asset evidence', () => {
    const blocked = snapshot();
    const ready = snapshot({
      assetCount: 5,
      approvedAssetCount: 5,
      reusableAssetCount: 5,
      rightsIssueAssetCount: 0,
      deliverableAssetCount: 1,
      clientReviewAssetCount: 1,
      approvedDeliverableCount: 1,
      deliveryIssueCount: 0,
      missingLinks: [],
      nextActions: [],
    });

    expect(buildCreateVariantPlaybook(blocked, 'operator')).toEqual(expect.objectContaining({
      title: 'Create 运营动作剧本',
      primaryAction: expect.stringContaining('Missing production brief or script asset'),
      handoffBoundary: expect.stringContaining('不能标记自动生成完成'),
    }));

    expect(buildCreateVariantPlaybook(ready, 'partner')).toEqual(expect.objectContaining({
      title: 'Create 商业验收剧本',
      primaryAction: expect.stringContaining('真实 provider'),
      cards: expect.arrayContaining([
        expect.stringContaining('Create readiness 7/7'),
      ]),
    }));

    expect(buildCreateVariantPlaybook(ready, 'friend_trial')).toEqual(expect.objectContaining({
      title: '朋友试用 Create 路径',
      proofToCheck: expect.stringContaining('朋友只看三项'),
    }));
  });

  it('builds Creatopy and Pencil style brand production checks from asset evidence', () => {
    const ready = snapshot({
      assetCount: 5,
      approvedAssetCount: 5,
      reusableAssetCount: 4,
      rightsIssueAssetCount: 0,
      assetGovernanceIssueCount: 0,
      planCount: 1,
      nextRoundAssetPlanCount: 1,
      deliverableAssetCount: 1,
      clientReviewAssetCount: 1,
      approvedDeliverableCount: 1,
      missingLinks: [],
      nextActions: [],
    });

    expect(buildCreateBrandProductionChecks(ready)).toEqual(expect.arrayContaining([
      expect.objectContaining({ stage: '品牌资产与素材权属', ready: true }),
      expect.objectContaining({ stage: '模板与版本矩阵', ready: true }),
      expect.objectContaining({ stage: '生产交接与 provider 门禁', ready: true }),
      expect.objectContaining({ stage: '客户审核与批准', ready: true }),
      expect.objectContaining({ stage: '治理与发布前停止线', ready: true }),
    ]));
  });
});

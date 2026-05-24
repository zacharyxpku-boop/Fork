import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import VideoFactoryPage from '@/app/factory/video/page';
import {
  VideoProductionQueueClient,
  buildCutOperatingChecks,
  buildVideoFactoryVariantPlaybook,
  buildVideoProviderSandboxChecks,
  buildVideoProductionPassport,
} from '@/components/VideoProductionQueueClient';
import type { OneClickVideoOperationResult, VideoProductionQueue } from '@/lib/industrial-video-workflow';

describe('video production queue page', () => {
  it('renders the video factory page as a Chinese operator queue surface', async () => {
    const page = await VideoFactoryPage({
      searchParams: Promise.resolve({ projectId: 'launch-video', variant: 'operator' }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain('视频生产队列');
    expect(html).toContain('Video Factory Variant');
    expect(html).toContain('Variant Action Playbook');
    expect(html).toContain('运营执行路径');
    expect(html).toContain('Friend Trial Readiness');
    expect(html).toContain('Commercial Cut Readiness');
    expect(html).toContain('Provider Sandbox Contract');
    expect(html).toContain('视频 provider 沙盒接入合约');
    expect(html).toContain('提交适配器门禁');
    expect(html).toContain('回调验签门禁');
    expect(html).toContain('失败恢复门禁');
    expect(html).toContain('成片入库门禁');
    expect(html).toContain('客户验收门禁');
    expect(html).toContain('Cut Operating Checks');
    expect(html).toContain('商用 Cut 放行门禁');
    expect(html).toContain('视频工厂商用品质验收板');
    expect(html).toContain('Hookshot');
    expect(html).toContain('Creatify');
    expect(html).toContain('VidMob');
    expect(html).toContain('AI 视频解析');
    expect(html).toContain('Provider 执行闭环');
    expect(html).toContain('仍是 provider-gated POC');
    expect(html).toContain('score 0/5');
    expect(html).toContain('真实视频 provider 回调');
    expect(html).toContain('没有 provider 完成回调、成片、客户批准和表现回流前，不能宣称筷子级稳定视频工厂');
    expect(html).toContain('朋友试用放行判断');
    expect(html).toContain('非技术用户能不能从视频任务进入客户审核');
    expect(html).toContain('运营视角');
    expect(html).toContain('先看卡在哪里，再把下一步动作写回队列');
    expect(html).toContain('/factory/video?projectId=launch-video&amp;variant=partner');
    expect(html).toContain('/factory/video?projectId=launch-video&amp;variant=friend_trial');
    expect(html).toContain('智能混剪');
    expect(html).toContain('从 Hook 结构库到智能混剪包');
    expect(html).toContain('Hook Bank 入场');
    expect(html).toContain('UGC Script Spine 成片');
    expect(html).toContain('Offer Test Matrix 分发');
    expect(html).toContain('Cut Production Line');
    expect(html).toContain('AI 视频分析');
    expect(html).toContain('一键视频');
    expect(html).toContain('客户审核');
    expect(html).toContain('分发回流');
    expect(html).toContain('从视频解析到分发回流的一条成片生产线');
    expect(html).toContain('创建视频工作流');
    expect(html).toContain('创建任务并写入分发队列');
    expect(html).toContain('回灌成片并生成审核链接');
    expect(html).toContain('写入成片并创建客户审核');
    expect(html).toContain('运营动作包');
    expect(html).toContain('launch-video');
  });

  it('renders distinct video factory variants for partner and friend trial workflows', async () => {
    const partnerHtml = renderToStaticMarkup(
      <VideoProductionQueueClient initialProjectId="partner-video" selectedVariantId="partner" />,
    );
    const friendHtml = renderToStaticMarkup(
      <VideoProductionQueueClient initialProjectId="friend-video" selectedVariantId="friend_trial" />,
    );

    expect(partnerHtml).toContain('合作者视角');
    expect(partnerHtml).toContain('合作者验收路径');
    expect(partnerHtml).toContain('未接真实视频 provider、平台 OAuth、广告账户、analytics sync 和审计规模账本前，不展示 91M+/42M+ 为 Wenai 自有能力');
    expect(partnerHtml).toContain('Cut 不是单个生成按钮，而是一条可审计的视频工业化生产线');
    expect(partnerHtml).toContain('Hookly / Omneky');
    expect(partnerHtml).toContain('筷子科技的编拍剪投管');
    expect(partnerHtml).toContain('未接真实视频 provider、平台 OAuth、广告账户和 analytics sync 前，不宣称自动规模化');

    expect(friendHtml).toContain('Wenai 餐饮门店增长工作台');
    expect(friendHtml).toContain('一组到店理由生成多条本地内容');
    expect(friendHtml).toContain('创建一个门店活动任务');
    expect(friendHtml).toContain('Video Batch');
    expect(friendHtml).toContain('新增批量剪辑任务');
    expect(friendHtml).toContain('生产队列');
    expect(friendHtml).toContain('/factory/cast?variant=friend_trial');
    expect(friendHtml).toContain('一眼看懂：这套内容怎么帮门店拿到预约、券领取和私信咨询');
    expect(friendHtml).toContain('/factory?variant=friend_trial');
  });

  it('builds variant-specific video factory action playbooks from queue evidence', () => {
    const queue: VideoProductionQueue = {
      orgId: 'test-org',
      projectId: 'variant-playbook-project',
      itemCount: 1,
      providerReadyCount: 0,
      handoffOnlyCount: 1,
      blockedCount: 1,
      measuredCount: 0,
      providerExecutionCount: 0,
      submittedProviderExecutionCount: 0,
      completedProviderExecutionCount: 0,
      failedProviderExecutionCount: 0,
      retryableProviderExecutionCount: 0,
      resultAssetCount: 0,
      clientReviewCount: 1,
      approvedDeliverableCount: 0,
      revisionRequestedCount: 0,
      averageLoopCompletionScore: 30,
      items: [],
    };

    expect(buildVideoFactoryVariantPlaybook(queue, 'operator')).toEqual(expect.objectContaining({
      title: '运营执行路径',
      primaryAction: expect.stringContaining('先处理阻断项'),
      proofToCheck: expect.stringContaining('missing evidence'),
      handoffBoundary: expect.stringContaining('人工交接和手动回流'),
      cards: expect.arrayContaining([
        expect.stringContaining('队列任务 1 / 阻断 1'),
      ]),
    }));
    expect(buildVideoFactoryVariantPlaybook(queue, 'partner')).toEqual(expect.objectContaining({
      title: '合作者验收路径',
      handoffBoundary: expect.stringContaining('不展示 91M+/42M+ 为 Wenai 自有能力'),
    }));
    expect(buildVideoFactoryVariantPlaybook(queue, 'friend_trial')).toEqual(expect.objectContaining({
      title: '朋友试用操作路径',
      proofToCheck: expect.stringContaining('没有真实成片 URL'),
    }));
  });

  it('builds Cut operating checks that separate internal progress from external gates', () => {
    const emptyQueue: VideoProductionQueue = {
      orgId: 'test-org',
      projectId: 'cut-empty-project',
      itemCount: 0,
      providerReadyCount: 0,
      handoffOnlyCount: 0,
      blockedCount: 0,
      measuredCount: 0,
      providerExecutionCount: 0,
      submittedProviderExecutionCount: 0,
      completedProviderExecutionCount: 0,
      failedProviderExecutionCount: 0,
      retryableProviderExecutionCount: 0,
      resultAssetCount: 0,
      clientReviewCount: 0,
      approvedDeliverableCount: 0,
      revisionRequestedCount: 0,
      averageLoopCompletionScore: 0,
      items: [],
    };

    expect(buildCutOperatingChecks(emptyQueue)).toEqual(expect.arrayContaining([
      expect.objectContaining({
        label: 'AI 视频解析',
        status: 'blocked',
        externalGate: expect.stringContaining('真实多模态解析 provider'),
      }),
      expect.objectContaining({
        label: '一键视频编排',
        status: 'blocked',
        internalMove: expect.stringContaining('provider-gated'),
      }),
      expect.objectContaining({
        label: '分发表现回流',
        status: 'blocked',
        externalGate: expect.stringContaining('平台 OAuth'),
      }),
    ]));
  });

  it('builds video provider sandbox checks for submit callback recovery result and review gates', () => {
    const readyQueue: VideoProductionQueue = {
      orgId: 'test-org',
      projectId: 'provider-sandbox-project',
      itemCount: 1,
      providerReadyCount: 1,
      handoffOnlyCount: 0,
      blockedCount: 0,
      measuredCount: 1,
      providerExecutionCount: 2,
      submittedProviderExecutionCount: 1,
      completedProviderExecutionCount: 1,
      failedProviderExecutionCount: 0,
      retryableProviderExecutionCount: 0,
      resultAssetCount: 1,
      clientReviewCount: 1,
      approvedDeliverableCount: 1,
      revisionRequestedCount: 0,
      averageLoopCompletionScore: 90,
      items: [],
    };

    expect(buildVideoProviderSandboxChecks(readyQueue)).toEqual(expect.arrayContaining([
      expect.objectContaining({ gate: '提交适配器门禁', ready: true }),
      expect.objectContaining({ gate: '回调验签门禁', ready: true }),
      expect.objectContaining({ gate: '失败恢复门禁', ready: true }),
      expect.objectContaining({ gate: '成片入库门禁', ready: true }),
      expect.objectContaining({ gate: '客户验收门禁', ready: true }),
    ]));

    expect(buildVideoProviderSandboxChecks(null)).toEqual(expect.arrayContaining([
      expect.objectContaining({ gate: '提交适配器门禁', ready: false }),
      expect.objectContaining({ gate: '回调验签门禁', ready: false }),
      expect.objectContaining({ gate: '成片入库门禁', ready: false }),
      expect.objectContaining({ gate: '客户验收门禁', ready: false }),
    ]));
  });

  it('shows provider gating in Chinese instead of pretending automatic video generation', () => {
    const html = renderToStaticMarkup(<VideoProductionQueueClient initialProjectId="video-project" />);

    expect(html).toContain('仅交接');
    expect(html).toContain('供应商就绪');
    expect(html).toContain('服务时限');
    expect(html).toContain('正在加载');
    expect(html).toContain('不伪装自动生成');
    expect(html).toContain('只有 provider、素材授权、平台账号和回流都接上');
    expect(html).toContain('没有平台 OAuth、广告账户和 analytics sync 前，只能做计划与手工回灌');
    expect(html).toContain('多模态视频解析 provider、合法视频源、下载/存储权限');
    expect(html).toContain('真实剪辑引擎、素材授权、音频/字体授权和成片回调');
    expect(html).toContain('视频生成 provider token、任务回调、失败重试和成本额度');
    expect(html).toContain('正式域名、客户权限策略、素材下载/水印策略');
    expect(html).toContain('平台 OAuth、广告账户授权、自动发布和 analytics sync');
    expect(html).toContain('成片 URL');
    expect(html).not.toContain('一键生成成片');
    expect(html).not.toContain('handoff_only');
    expect(html).not.toContain('provider_ready');
  });

  it('renders one-click video operation capabilities, blockers, and scale-claim guards', () => {
    const queue: VideoProductionQueue = {
      orgId: 'test-org',
      projectId: 'one-click-project',
      itemCount: 0,
      providerReadyCount: 0,
      handoffOnlyCount: 0,
      blockedCount: 0,
      measuredCount: 0,
      providerExecutionCount: 0,
      submittedProviderExecutionCount: 0,
      completedProviderExecutionCount: 0,
      failedProviderExecutionCount: 0,
      retryableProviderExecutionCount: 0,
      resultAssetCount: 0,
      clientReviewCount: 0,
      approvedDeliverableCount: 0,
      revisionRequestedCount: 0,
      averageLoopCompletionScore: 0,
      items: [],
    };
    const operation = {
      queue,
      autoCreated: ['workflow_asset:asset-1', 'distribution_plan:plan-1:TikTok Shop', 'dispatch:dispatch-1:manual_ready'],
      externalRequirements: ['A real video generation/editing provider is required before automatic finished-video output.'],
      scaleClaimGuards: [
        { requestedBenchmark: '91M+ creative output', canDisplay: false },
        { requestedBenchmark: '42M+ video distribution', canDisplay: false },
      ],
      capabilityStates: [
        { id: 'compose', label: 'Compose / creative intelligence', status: 'internal_ready', evidence: 'insights=3', nextStep: 'Continue source harvest.' },
        { id: 'one_click_video', label: 'One-click video operation', status: 'provider_gated', evidence: 'asset=1; plans=1; dispatches=1', nextStep: 'Connect provider.', externalRequirement: 'Real video provider token.' },
      ],
      commerciallyExecutable: false,
      operatorSummary: 'Internal workflow created; external provider/platform gates remain.',
    } as unknown as OneClickVideoOperationResult;

    const html = renderToStaticMarkup(
      <VideoProductionQueueClient initialProjectId="one-click-project" initialQueue={queue} initialOperation={operation} />,
    );

    expect(html).toContain('一键视频运营编排');
    expect(html).toContain('一键视频闭环判定');
    expect(html).toContain('内部已完成');
    expect(html).toContain('仍需外部接入');
    expect(html).toContain('运营下一步');
    expect(html).toContain('禁止伪规模');
    expect(html).toContain('不能自动出片或自动发布');
    expect(html).toContain('能力');
    expect(html).toContain('外部阻塞清单');
    expect(html).toContain('规模化数字展示保护');
    expect(html).toContain('内部已就绪');
    expect(html).toContain('等待外部接入');
    expect(html).toContain('91M+ creative output');
    expect(html).toContain('42M+ video distribution');
    expect(html).toContain('禁止作为 Wenai 指标展示');
    expect(html).toContain('Real video provider token.');
    expect(html).not.toContain('可商用自动化');
  });

  it('renders the production handoff packet and operator action evidence without raw internal labels', () => {
    const queue: VideoProductionQueue = {
      orgId: 'test-org',
      projectId: 'video-project',
      itemCount: 1,
      providerReadyCount: 0,
      handoffOnlyCount: 1,
      blockedCount: 1,
      measuredCount: 0,
      providerExecutionCount: 0,
      submittedProviderExecutionCount: 0,
      completedProviderExecutionCount: 0,
      failedProviderExecutionCount: 0,
      retryableProviderExecutionCount: 0,
      resultAssetCount: 0,
      clientReviewCount: 0,
      approvedDeliverableCount: 0,
      revisionRequestedCount: 0,
      averageLoopCompletionScore: 30,
      items: [{
        assetId: 'asset-video-1',
        title: 'Video workflow: Travel Bag',
        mode: 'handoff_only',
        stage: 'provider_gate',
        priority: 'medium',
        slaHoursRemaining: 42,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        planCount: 1,
        dispatchCount: 1,
        providerReadyDispatchCount: 0,
        manualReadyDispatchCount: 1,
        blockedDispatchCount: 0,
        measuredDispatchCount: 0,
        providerExecutionCount: 0,
        submittedProviderExecutionCount: 0,
        completedProviderExecutionCount: 0,
        failedProviderExecutionCount: 0,
        resultAssetCount: 0,
        clientReviewAssetCount: 1,
        approvedDeliverableCount: 0,
        revisionRequestedCount: 0,
        reviewLinks: [{
          token: 'review-video-1',
          projectId: 'video-project',
          assetId: 'asset-video-1',
          assetTitle: 'Travel Bag 成片',
          status: 'active',
          statusLabel: '待客户验收',
          clientHeadline: '请先预览成片，再选择反馈或批准',
          clientRisk: '批准会写回生产链路。',
          supportAction: '打不开就先提交问题反馈。',
          nextAction: '先预览成片，再反馈或批准。',
          clientChecklist: [],
          clientReceipt: {
            title: '客户验收回执',
            summary: '客户当前可以查看交付物，并决定是反馈还是批准。',
            nextStep: '批准后进入分发、CRM 交接和表现回流。',
            operatorRecipient: '运营 / 客服',
            evidenceToCheck: ['成片可打开'],
            shareNote: '审核码 review-video-1 可继续验收。',
          },
          clientDecision: {
            primaryActionLabel: '确认无误后批准',
            primaryActionState: 'approve',
            operatorNextStep: '批准后进入分发。',
            evidenceToCheck: ['成片可打开'],
          },
          escalationMessage: '请运营重新确认链接。',
          canSubmitFeedback: true,
          canApprove: true,
          feedbackCount: 0,
          expiresAt: new Date(Date.now() + 86400_000).toISOString(),
        }],
        resultUrls: [],
        channels: ['TikTok Shop'],
        remixPlan: [{
          id: 'remix-1',
          label: 'TikTok Shop proof_test 变体',
          source: 'creative-opportunity',
          hook: 'Open with the result before product detail.',
          cutPlan: ['0-2s proof frame', '2-6s product role', '6-11s usage scene'],
          assetInstructions: ['Use approved product footage.'],
          platformAdaptation: 'Attach creative_insight_id before dispatch.',
          acceptance: ['First 3 seconds are legible.'],
          riskBoundary: 'Do not copy reference footage.',
        }],
        providerRecovery: {
          retryableExecutionCount: 0,
          blockedExecutionCount: 0,
          failedReasons: [],
        },
        loopCompletionScore: 30,
        handoffPacket: {
          summary: 'provider_gate / handoff_only / plans:1 / dispatches:1 / results:0 / reviews:0 / approved:0',
          missingEvidence: ['Missing completed provider/editor result URL.'],
          reviewPortalUrls: ['/review/review-video-1'],
          executionTrace: ['handoff_asset:asset-video-1'],
        },
        blockers: ['Provider generation remains handoff-only until config, consent, references, and product assets are ready.'],
        nextActions: ['Ingest completed provider/editor result URLs through /api/industrial-chain/production-result.'],
        runbookActions: [{
          id: 'ingest-production-result',
          label: '导入供应商或剪辑结果',
          endpoint: '/api/industrial-chain/production-result',
          method: 'POST',
          payload: { projectId: 'video-project', sourceHandoffAssetId: 'asset-video-1' },
        }],
      }],
    };
    expect(buildVideoProductionPassport(queue.items[0])).toEqual(expect.arrayContaining([
      expect.objectContaining({ title: '洞察来源', value: '1 个混剪变体', tone: 'ready' }),
      expect.objectContaining({ title: '生产执行', value: '人工交接', detail: expect.stringContaining('外部 provider') }),
      expect.objectContaining({ title: '成片证据', value: '待回填成片', tone: 'locked' }),
      expect.objectContaining({ title: '客户验收', value: '审核中' }),
      expect.objectContaining({ title: '分发证据', value: '1 条计划' }),
    ]));
    const html = renderToStaticMarkup(
      <VideoProductionQueueClient initialProjectId="video-project" initialQueue={queue} selectedVariantId="friend_trial" />,
    );

    expect(html).toContain('Wenai 餐饮门店增长工作台');
    expect(html).toContain('一组到店理由生成多条本地内容');
    expect(html).toContain('生成草稿');
    expect(html).toContain('生产队列');
    expect(html).toContain('Video workflow: Travel Bag');
    expect(html).toContain('1 版本');
    expect(html).toContain('进入发布');
    expect(html).toContain('/factory/cast?variant=friend_trial');
    expect(html).toContain('新增批量剪辑任务');
    expect(html).toContain('同一套餐饮素材，拆成短视频、图文脚本、社群话术和不同平台版本');
    expect(html).toContain('Video workflow: Travel Bag');
    expect(html).toContain('provider_gate');
    expect(html).not.toContain('payload:');
  });
});

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import CreativeFactoryPage from '@/app/factory/creative/page';
import {
  CreativeMonitoringConsoleClient,
  buildCreativeComposeActionPlaybook,
  buildCreativeFactoryVariantPlaybook,
  buildCreativeHarvestAcceptanceChecks,
  buildCreativeIntelligenceChecks,
} from '@/components/CreativeMonitoringConsoleClient';

describe('creative monitoring console page', () => {
  it('renders the friend trial creative console as a light enterprise workflow', async () => {
    const page = await CreativeFactoryPage({
      searchParams: Promise.resolve({ projectId: 'friend-creative', variant: 'friend_trial' }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain('Wenai 餐饮门店增长工作台');
    expect(html).toContain('先找到能带来到店意向的角度');
    expect(html).toContain('创建一个门店活动任务');
    expect(html).toContain('先找到能带来到店意向的角度');
    expect(html).toContain('今日机会');
    expect(html).toContain('来源健康度');
    expect(html).toContain('/factory/create?variant=friend_trial');
    expect(html).not.toContain('automation-ready');
    expect(html).not.toContain('OAuth 已连接');
    expect(html).not.toContain('自动发布已接通');
  });

  it('renders the creative factory as a Chinese operator console', async () => {
    const page = await CreativeFactoryPage({
      searchParams: Promise.resolve({ projectId: 'creative-launch', variant: 'operator' }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain('创意情报台');
    expect(html).toContain('竞品账号、榜单和视频拆解监控');
    expect(html).toContain('写入监控清单');
    expect(html).toContain('补齐三类监控');
    expect(html).toContain('结算到期采集');
    expect(html).toContain('采集器执行清单');
    expect(html).toContain('回灌采集器结果');
    expect(html).toContain('写入采集运行');
    expect(html).toContain('创意机会地图');
    expect(html).toContain('可复用打法簇');
    expect(html).toContain('护城河分');
    expect(html).toContain('生成脚本与分发计划');
    expect(html).toContain('采集器接入状态');
    expect(html).toContain('Hookshot / Hookly 参考层');
    expect(html).toContain('可复用到店内容结构库');
    expect(html).toContain('Hook Bank');
    expect(html).toContain('UGC Script Spine');
    expect(html).toContain('Offer Test Matrix');
    expect(html).toContain('Compose Intelligence Stack');
    expect(html).toContain('VidMob / Superads 参考层');
    expect(html).toContain('AI 视频分析、创意疲劳和跨平台 performance signal 一起看');
    expect(html).toContain('Creative analytics / fatigue 观察');
    expect(html).toContain('跨平台优化输入');
    expect(html).toContain('Creative Harvest Acceptance Board');
    expect(html).toContain('创意收割商用品质验收板');
    expect(html).toContain('来源广度门禁');
    expect(html).toContain('重复采集门禁');
    expect(html).toContain('多模态视频解析门禁');
    expect(html).toContain('生产交接门禁');
    expect(html).toContain('复利学习门禁');
    expect(html).toContain('对标 Hookshot、Omneky、VidMob、Superads 的真实能力');
    expect(html).toContain('Compose Action Playbook');
    expect(html).toContain('Compose Variant Console');
    expect(html).toContain('/factory/creative?projectId=creative-launch&amp;variant=partner');
    expect(html).toContain('/factory/creative?projectId=creative-launch&amp;variant=friend_trial');
    expect(html).toContain('Compose 启动下一步');
    expect(html).toContain('全网灵感管理');
    expect(html).toContain('热门视频解析');
    expect(html).toContain('把灵感、视频、Hook 和到店内容假设串成一条生产约束链');
    expect(html).toContain('不是只保存素材');
    expect(html).toContain('内部可做');
    expect(html).toContain('外部需要');
    expect(html).toContain('creative-launch');
  });

  it('states the manual authorization boundary instead of pretending automatic scraping', () => {
    const html = renderToStaticMarkup(<CreativeMonitoringConsoleClient initialProjectId="creative-project" />);

    expect(html).toContain('当前不伪装未授权自动抓取');
    expect(html).toContain('只提取结构，不复制表达');
    expect(html).toContain('竞品账号');
    expect(html).toContain('榜单趋势');
    expect(html).toContain('视频关键词');
    expect(html).toContain('暂无机会地图');
    expect(html).toContain('暂无可复用打法簇');
    expect(html).toContain('系统才会把它升级成可复用打法');
    expect(html).toContain('先导入竞品账号、榜单或视频拆解信号');
    expect(html).toContain('只导入公开可用或已授权观察');
    expect(html).toContain('只复用结构和验证逻辑');
    expect(html).toContain('没有平台授权、商户授权和反馈回流前，只能生成门店活动发布方案');
    expect(html).toContain('平台授权、榜单/视频数据源、合法抓取或官方 API');
    expect(html).toContain('多模态视频解析 provider、素材授权、下载/存储权限');
    expect(html).toContain('平台/社群反馈回流和真实到店信号，验证哪个 hook 真正带来到店意向');
    expect(html).toContain('平台授权、商户授权、发布回执和平台/社群反馈回流');
    expect(html).toContain('开头钩子');
    expect(html).toContain('空结果只记录缺口，不生成洞察');
    expect(html).toContain('当前继续走人工运营回灌，不假装已完成未授权自动抓取。');
    expect(html).toContain('没有授权来源、公开证据或手工观察前，不生成伪洞察');
    expect(html).not.toContain('provider-gated');
    expect(html).not.toContain('automation-ready');
    expect(html).not.toContain('Manifest');
  });

  it('builds a compose action playbook from monitoring and creative evidence', () => {
    expect(buildCreativeComposeActionPlaybook({
      orgId: 'test-org',
      projectId: 'compose-playbook-project',
      monitorCount: 3,
      activeMonitorCount: 3,
      competitorAccountMonitorCount: 1,
      trendRankMonitorCount: 1,
      videoKeywordMonitorCount: 1,
      dueTaskCount: 0,
      importedInsightCount: 3,
      harvestRunCount: 1,
      harvestedInsightCount: 3,
      collectorTargetCount: 3,
      collectorProviderReady: false,
      collectorAdapterStatus: 'manual_ops',
      sourceCount: 3,
      providerReadySourceCount: 0,
      sourceSyncRunCount: 0,
      providerSourceFreshCount: 0,
      providerSourceFailureCount: 0,
      sourceSyncAccountObservationCount: 0,
      sourceSyncTrendRankObservationCount: 0,
      sourceSyncVideoTeardownObservationCount: 0,
      sourceSyncMultimodalParsedCount: 0,
      sourceSyncCoverageScore: 60,
      creativeSourceObservationCount: 3,
      creativeSourceRepeatObservationSourceCount: 2,
      creativeSourceScaleScore: 55,
      creativeSourceDepthScore: 70,
      creativeReadySourceHealthCardCount: 0,
      accountTrackingCoverageTargetCount: 2,
      trendRankCoverageSignalCount: 1,
      videoTeardownRepeatReady: false,
      accountTrackingSourceReady: false,
      trendRankSourceReady: false,
      videoTeardownSourceReady: false,
      multimodalTeardownReady: false,
      missingLinks: [],
      nextActions: [],
    }, {
      insightCount: 3,
      competitorAccountCount: 1,
      trendRankCount: 1,
      teardownCount: 1,
      opportunityCount: 2,
      averageConfidenceScore: 78,
      opportunityMap: [],
      patternClusterCount: 1,
      crossSourcePatternCount: 1,
      creativeMoatScore: 72,
      patternClusters: [],
      missingLinks: [],
    }, {
      providerReady: false,
      dispatchMode: 'manual_ops',
      adapterStatus: {
        status: 'not_configured',
        mode: 'manual_ops',
        providerName: 'manual-creative-ops',
        endpointConfigured: false,
        authConfigured: false,
        missingLinks: [],
        nextActions: [],
        supportedMonitorTypes: [],
        providerReady: false,
        failureCount: 0,
      },
      orgId: 'test-org',
      projectId: 'compose-playbook-project',
      generatedAt: new Date().toISOString(),
      targetCount: 0,
      highPriorityCount: 0,
      retryTargetCount: 0,
      targets: [],
      batchInstructions: [],
    })).toEqual(expect.objectContaining({
      title: 'Compose 到生产的下一步',
      primaryAction: expect.stringContaining('脚本资产'),
      proofToCheck: expect.stringContaining('creative_opportunity_id'),
      handoffBoundary: expect.stringContaining('不宣称全网自动监控'),
      cards: expect.arrayContaining([
        expect.stringContaining('洞察 3 / 机会 2 / 模式簇 1'),
      ]),
    }));

    expect(buildCreativeComposeActionPlaybook(undefined, undefined, undefined)).toEqual(expect.objectContaining({
      title: 'Compose 启动下一步',
      primaryAction: expect.stringContaining('三类监控'),
      handoffBoundary: expect.stringContaining('不生成伪洞察'),
    }));
  });

  it('builds VidMob and Superads style creative intelligence checks', () => {
    const checks = buildCreativeIntelligenceChecks({
      orgId: 'test-org',
      projectId: 'creative-intelligence-project',
      monitorCount: 3,
      activeMonitorCount: 3,
      competitorAccountMonitorCount: 1,
      trendRankMonitorCount: 1,
      videoKeywordMonitorCount: 1,
      dueTaskCount: 0,
      importedInsightCount: 3,
      harvestRunCount: 1,
      harvestedInsightCount: 3,
      collectorTargetCount: 3,
      collectorProviderReady: true,
      collectorAdapterStatus: 'provider_ready',
      sourceCount: 3,
      providerReadySourceCount: 2,
      sourceSyncRunCount: 1,
      providerSourceFreshCount: 1,
      providerSourceFailureCount: 0,
      sourceSyncAccountObservationCount: 1,
      sourceSyncTrendRankObservationCount: 1,
      sourceSyncVideoTeardownObservationCount: 1,
      sourceSyncMultimodalParsedCount: 1,
      sourceSyncCoverageScore: 100,
      creativeSourceObservationCount: 3,
      creativeSourceRepeatObservationSourceCount: 2,
      creativeSourceScaleScore: 80,
      creativeSourceDepthScore: 72,
      creativeReadySourceHealthCardCount: 3,
      accountTrackingCoverageTargetCount: 2,
      trendRankCoverageSignalCount: 1,
      videoTeardownRepeatReady: true,
      accountTrackingSourceReady: true,
      trendRankSourceReady: true,
      videoTeardownSourceReady: true,
      multimodalTeardownReady: true,
      missingLinks: [],
      nextActions: [],
    }, {
      insightCount: 3,
      competitorAccountCount: 1,
      trendRankCount: 1,
      teardownCount: 1,
      opportunityCount: 2,
      averageConfidenceScore: 78,
      opportunityMap: [],
      patternClusterCount: 1,
      crossSourcePatternCount: 1,
      creativeMoatScore: 72,
      patternClusters: [],
      missingLinks: [],
    });

    expect(checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ stage: 'AI 视频分析 / 多模态解析', ready: true }),
      expect.objectContaining({ stage: 'Creative analytics / fatigue 观察', ready: true }),
      expect.objectContaining({ stage: '品牌安全模板化生产', ready: true }),
      expect.objectContaining({ stage: '跨平台优化输入', ready: true }),
    ]));
  });

  it('builds commercial acceptance gates for the creative harvest layer', () => {
    const checks = buildCreativeHarvestAcceptanceChecks({
      orgId: 'test-org',
      projectId: 'creative-harvest-acceptance',
      monitorCount: 3,
      activeMonitorCount: 3,
      competitorAccountMonitorCount: 1,
      trendRankMonitorCount: 1,
      videoKeywordMonitorCount: 1,
      dueTaskCount: 0,
      importedInsightCount: 3,
      harvestRunCount: 2,
      harvestedInsightCount: 6,
      collectorTargetCount: 0,
      collectorProviderReady: true,
      collectorAdapterStatus: 'provider_ready',
      sourceCount: 3,
      providerReadySourceCount: 3,
      sourceSyncRunCount: 2,
      providerSourceFreshCount: 3,
      providerSourceFailureCount: 0,
      sourceSyncAccountObservationCount: 2,
      sourceSyncTrendRankObservationCount: 2,
      sourceSyncVideoTeardownObservationCount: 2,
      sourceSyncMultimodalParsedCount: 2,
      sourceSyncCoverageScore: 100,
      creativeSourceObservationCount: 6,
      creativeSourceRepeatObservationSourceCount: 3,
      creativeSourceScaleScore: 85,
      creativeSourceDepthScore: 82,
      creativeReadySourceHealthCardCount: 3,
      accountTrackingCoverageTargetCount: 3,
      trendRankCoverageSignalCount: 3,
      videoTeardownRepeatReady: true,
      accountTrackingSourceReady: true,
      trendRankSourceReady: true,
      videoTeardownSourceReady: true,
      multimodalTeardownReady: true,
      missingLinks: [],
      nextActions: [],
    }, {
      insightCount: 6,
      competitorAccountCount: 2,
      trendRankCount: 2,
      teardownCount: 2,
      opportunityCount: 4,
      averageConfidenceScore: 81,
      opportunityMap: [],
      patternClusterCount: 2,
      crossSourcePatternCount: 2,
      creativeMoatScore: 80,
      patternClusters: [],
      missingLinks: [],
    });

    expect(checks).toHaveLength(5);
    expect(checks).toEqual(expect.arrayContaining([
      expect.objectContaining({ gate: '来源广度门禁', ready: true }),
      expect.objectContaining({ gate: '重复采集门禁', ready: true }),
      expect.objectContaining({ gate: '多模态视频解析门禁', ready: true }),
      expect.objectContaining({ gate: '生产交接门禁', ready: true }),
      expect.objectContaining({ gate: '复利学习门禁', ready: true }),
    ]));

    const emptyChecks = buildCreativeHarvestAcceptanceChecks(undefined, undefined);
    expect(emptyChecks.find(check => check.gate === '来源广度门禁')).toEqual(expect.objectContaining({
      ready: false,
      externalGate: expect.stringContaining('全网灵感自动管理'),
    }));
  });

  it('builds distinct creative variant playbooks for partner, operator, and friend trial views', () => {
    expect(buildCreativeFactoryVariantPlaybook(undefined, undefined, 'partner')).toEqual(expect.objectContaining({
      label: '合作者视角',
      title: 'Compose 商业验收剧本',
      nextAction: expect.stringContaining('三类监控源'),
    }));
    expect(buildCreativeFactoryVariantPlaybook(undefined, undefined, 'operator')).toEqual(expect.objectContaining({
      label: '运营工作台',
      title: 'Compose 执行队列剧本',
      stopLine: expect.stringContaining('未授权来源'),
    }));
    expect(buildCreativeFactoryVariantPlaybook(undefined, undefined, 'friend_trial')).toEqual(expect.objectContaining({
      label: '朋友试用版',
      proofFocus: expect.stringContaining('为什么可用'),
      stopLine: expect.stringContaining('不暴露 provider'),
    }));
  });
});

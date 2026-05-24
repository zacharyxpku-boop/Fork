import { describe, expect, it } from 'vitest';
import { GET as GET_CHAIN, POST as POST_CHAIN } from '@/app/api/industrial-chain/route';
import { GET as GET_ACTION_QUEUE } from '@/app/api/industrial-chain/action-queue/route';
import { PATCH as PATCH_DISPATCH, POST as POST_DISPATCH } from '@/app/api/industrial-chain/dispatch/route';
import { upsertAssetPermission } from '@/lib/asset-permission-ledger';
import { upsertChannelAccount } from '@/lib/channel-account-ledger';
import { addCreativeInsight } from '@/lib/creative-intelligence';
import {
  addContentAsset,
  addDistributionPlan,
  addPerformanceReturn,
  createDistributionDispatch,
  getIndustrializationSnapshot,
  updateContentAssetDelivery,
  updateDistributionDispatch,
} from '@/lib/industrial-chain-store';
import { buildIndustrialActionQueue } from '@/lib/industrial-action-queue';
import { evaluatePerformanceImport, parsePerformanceCsv } from '@/lib/performance-import';

describe('industrial action queue', () => {
  it('turns a thin project snapshot into executable API actions', async () => {
    const orgId = `action-queue-${Date.now()}`;
    const projectId = `thin-${Date.now()}`;
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);

    const actions = buildIndustrialActionQueue({
      projectId,
      snapshot,
      assets: [],
      plans: [],
      dispatches: [],
      performanceReturns: [],
    });

    expect(actions.map(action => action.title)).toContain('Add production brief or script asset');
    expect(actions.map(action => action.title)).toContain('Add image or video asset');
    expect(actions.map(action => action.title)).toContain('Add benchmark evidence asset');
    expect(actions.map(action => action.title)).toContain('Import competitor creative intelligence');
    expect(actions.map(action => action.title)).toContain('Create channel account matrix');
    expect(actions.map(action => action.title)).toContain('Create enterprise asset permission ledger');
    expect(actions.map(action => action.title)).toContain('Create first distribution plan');
    expect(actions.every(action => action.endpoint.startsWith('/api/'))).toBe(true);
    expect(actions.every(action => action.acceptance.length > 0)).toBe(true);
  });

  it('serves action queue through industrial-chain GET and dedicated route', async () => {
    const headers = { 'x-org-id': `action-route-${Date.now()}` };
    const projectId = 'action-route-project';

    await POST_CHAIN(new Request('http://localhost/api/industrial-chain', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'asset',
        asset: { projectId, type: 'brief', title: 'Launch brief', evidence: '10 SKU claim sheet' },
      }),
    }) as unknown as Parameters<typeof POST_CHAIN>[0]);

    const chainRes = await GET_CHAIN(new Request(`http://localhost/api/industrial-chain?projectId=${projectId}`, {
      headers,
    }) as unknown as Parameters<typeof GET_CHAIN>[0]);
    const chainBody = await chainRes.json();
    expect(chainBody.actionQueue.length).toBeGreaterThan(0);
    expect(chainBody.actionQueue.some((action: { title: string }) => action.title === 'Create first distribution plan')).toBe(true);

    const queueRes = await GET_ACTION_QUEUE(new Request(`http://localhost/api/industrial-chain/action-queue?projectId=${projectId}`, {
      headers,
    }) as unknown as Parameters<typeof GET_ACTION_QUEUE>[0]);
    const queueBody = await queueRes.json();
    expect(queueBody.actionCount).toBe(chainBody.actionQueue.length);
    expect(queueBody.actions[0].payload).toBeTruthy();
  });

  it('moves from plan gap to dispatch and evidence actions as the project advances', async () => {
    const headers = { 'x-org-id': `action-flow-${Date.now()}` };
    const projectId = 'action-flow-project';
    const assetRes = await POST_CHAIN(new Request('http://localhost/api/industrial-chain', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'asset',
        asset: { projectId, type: 'video', title: 'Launch video', evidence: 'Approved creative' },
      }),
    }) as unknown as Parameters<typeof POST_CHAIN>[0]);
    const assetBody = await assetRes.json();
    const planRes = await POST_CHAIN(new Request('http://localhost/api/industrial-chain', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'distribution-plan',
        distributionPlan: {
          projectId,
          channel: 'TikTok Shop',
          assetIds: [assetBody.asset.id],
          status: 'ready',
        },
      }),
    }) as unknown as Parameters<typeof POST_CHAIN>[0]);
    const planBody = await planRes.json();

    const beforeDispatchRes = await GET_ACTION_QUEUE(new Request(`http://localhost/api/industrial-chain/action-queue?projectId=${projectId}`, {
      headers,
    }) as unknown as Parameters<typeof GET_ACTION_QUEUE>[0]);
    const beforeDispatch = await beforeDispatchRes.json();
    expect(beforeDispatch.actions.some((action: { title: string }) => action.title === 'Create dispatch handoff package')).toBe(true);

    const dispatchRes = await POST_DISPATCH(new Request('http://localhost/api/industrial-chain/dispatch', {
      method: 'POST',
      headers,
      body: JSON.stringify({ dispatch: { planId: planBody.distributionPlan.id } }),
    }) as unknown as Parameters<typeof POST_DISPATCH>[0]);
    const dispatchBody = await dispatchRes.json();

    await upsertAssetPermission(headers['x-org-id'], {
      projectId,
      assetId: assetBody.asset.id,
      owner: 'ops',
      scope: 'project',
      roles: ['owner', 'distribution'],
      allowedActions: ['view', 'download', 'share', 'publish'],
      auditNote: 'Distribution publish permission granted before publish evidence follow-up.',
    });
    await upsertChannelAccount(headers['x-org-id'], {
      projectId,
      platform: 'TikTok Shop',
      handle: '@action-queue-brand',
      authorizationStatus: 'manual_ready',
      healthStatus: 'healthy',
      dailyPublishLimit: 4,
      scheduledCount: 1,
    });

    await PATCH_DISPATCH(new Request('http://localhost/api/industrial-chain/dispatch', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        dispatchId: dispatchBody.dispatch.id,
        patch: { status: 'published' },
      }),
    }) as unknown as Parameters<typeof PATCH_DISPATCH>[0]);

    const afterPublishRes = await GET_ACTION_QUEUE(new Request(`http://localhost/api/industrial-chain/action-queue?projectId=${projectId}`, {
      headers,
    }) as unknown as Parameters<typeof GET_ACTION_QUEUE>[0]);
    const afterPublish = await afterPublishRes.json();
    const evidenceAction = afterPublish.actions.find((action: { title: string }) => action.title === 'Attach publish evidence URL');
    expect(evidenceAction.endpoint).toBe('/api/industrial-chain/dispatch');
    expect(evidenceAction.payload.dispatchId).toBe(dispatchBody.dispatch.id);
  });

  it('requests next-round lineage when scale decisions are not covered by winning assets', async () => {
    const orgId = `action-lineage-${Date.now()}`;
    const projectId = `lineage-${Date.now()}`;
    const winner = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Winning creative',
      evidence: 'ROAS winner',
    });
    const report = await addContentAsset(orgId, {
      projectId,
      type: 'report',
      title: 'Performance report',
      evidence: 'scale=1',
    });
    await addDistributionPlan(orgId, {
      projectId,
      channel: 'TikTok Shop',
      assetIds: [winner.id],
      status: 'ready',
    });
    const dispatch = await createDistributionDispatch(orgId, { projectId, channel: 'TikTok Shop' });
    await updateDistributionDispatch(orgId, dispatch.id, {
      status: 'measured',
      evidenceUrls: ['https://example.test/post'],
    });
    const performance = await addPerformanceReturn(orgId, {
      projectId,
      dispatchId: dispatch.id,
      report: evaluatePerformanceImport(parsePerformanceCsv(`sku,asset,platform,impressions,clicks,spend,orders,revenue
sku-1,${winner.id},TikTok Shop,10000,300,120,12,560`)),
    });
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);

    const actions = buildIndustrialActionQueue({
      projectId,
      snapshot,
      assets: [winner, report],
      plans: [],
      dispatches: [],
      performanceReturns: [performance],
    });

    const nextRoundAction = actions.find(action => action.title === 'Create next-round plan with winning asset lineage');
    expect(nextRoundAction?.payload).toMatchObject({
      action: 'distribution-plan',
    });
    expect(JSON.stringify(nextRoundAction?.payload)).toContain(winner.id);
    expect(JSON.stringify(nextRoundAction?.payload)).toContain(report.id);
  });

  it('creates an executable client-approval action for unapproved production deliverables', async () => {
    const orgId = `action-delivery-${Date.now()}`;
    const projectId = `delivery-${Date.now()}`;
    const deliverable = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Produced video',
      source: 'kuaizi-production-result',
      tags: ['production-result'],
      evidence: 'Provider result URL',
      deliveryStatus: 'client_review',
      clientReviewUrl: 'https://review.example/video',
    });
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);

    const actions = buildIndustrialActionQueue({
      projectId,
      snapshot,
      assets: [deliverable],
      plans: [],
      dispatches: [],
      performanceReturns: [],
    });

    const approvalAction = actions.find(action => action.title === 'Create client review link for production deliverable');
    expect(approvalAction?.endpoint).toBe('/api/industrial-chain/review-links');
    expect(approvalAction?.payload).toMatchObject({
      assetId: deliverable.id,
      ttlDays: 30,
    });

    await updateContentAssetDelivery(orgId, deliverable.id, { deliveryStatus: 'approved' });
    const approvedSnapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(approvedSnapshot.deliveryIssueCount).toBe(0);
  });

  it('turns partial creative intelligence into an industrial application action', async () => {
    const orgId = `action-creative-${Date.now()}`;
    const projectId = `creative-${Date.now()}`;
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);

    const actions = buildIndustrialActionQueue({
      projectId,
      snapshot,
      assets: [],
      plans: [],
      dispatches: [],
      performanceReturns: [],
      creativeSnapshot: {
        orgId,
        projectId,
        insightCount: 1,
        competitorAccountCount: 1,
        trendRankCount: 0,
        teardownCount: 0,
        reusableAngleCount: 1,
        topHookType: 'demo',
        topPacing: 'fast',
        topPlatform: 'TikTok Shop',
        totalViews: 1000,
        totalSales: 12,
        totalRevenue: 300,
        opportunityCount: 1,
        averageConfidenceScore: 55,
        opportunityMap: [],
        patternClusterCount: 0,
        crossSourcePatternCount: 0,
        creativeMoatScore: 25,
        patternClusters: [],
        opportunityBacklogCount: 0,
        readyOpportunityCount: 0,
        opportunityBacklog: [],
        missingLinks: ['Missing trend/rank benchmark signal'],
        nextActions: ['Close creative gap: Missing trend/rank benchmark signal'],
        brandLearningProfile: {
          preferredHookType: 'demo',
          preferredPacing: 'fast',
          avoidPatterns: [],
          nextTestAngles: ['TikTok Shop: demo angle'],
        },
      },
    });

    const creativeAction = actions.find(action => action.title === 'Convert creative intelligence into industrial assets');
    expect(creativeAction?.endpoint).toBe('/api/creative-intelligence');
    expect(creativeAction?.payload).toMatchObject({
      projectId,
      action: 'apply-to-industrial-chain',
    });
    const clusterAction = actions.find(action => action.title === 'Build reusable creative pattern clusters');
    expect(clusterAction?.endpoint).toBe('/api/creative-intelligence');
    expect(clusterAction?.evidence).toContain('creativeMoatScore=25');
    expect(clusterAction?.payload).toMatchObject({
      projectId,
      insights: expect.arrayContaining([
        expect.objectContaining({ source: 'competitor-account' }),
        expect.objectContaining({ source: 'trend-rank' }),
        expect.objectContaining({ source: 'video-teardown' }),
      ]),
    });
    expect(clusterAction?.acceptance).toContain('crossSourcePatternCount > 0');
  });

  it('turns creative opportunity backlog into production and evidence-closing actions', async () => {
    const orgId = `action-creative-backlog-${Date.now()}`;
    const projectId = `creative-backlog-${Date.now()}`;
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);

    const actions = buildIndustrialActionQueue({
      projectId,
      snapshot,
      assets: [],
      plans: [],
      dispatches: [],
      performanceReturns: [],
      creativeSnapshot: {
        orgId,
        projectId,
        insightCount: 4,
        competitorAccountCount: 1,
        trendRankCount: 1,
        teardownCount: 1,
        reusableAngleCount: 4,
        topHookType: 'proof',
        topPacing: 'fast',
        topPlatform: 'TikTok Shop',
        totalViews: 88000,
        totalSales: 420,
        totalRevenue: 12800,
        opportunityCount: 4,
        averageConfidenceScore: 72,
        opportunityMap: [],
        patternClusterCount: 2,
        crossSourcePatternCount: 1,
        creativeMoatScore: 72,
        patternClusters: [],
        opportunityBacklogCount: 2,
        readyOpportunityCount: 1,
        opportunityBacklog: [
          {
            id: 'opportunity_cluster_tiktok_fast',
            priority: 'P0',
            readiness: 'ready_to_produce',
            platform: 'TikTok Shop',
            clusterId: 'cluster_tiktok_fast',
            sourceMix: ['competitor-account', 'trend-rank', 'video-teardown'],
            insightIds: ['ci_1', 'ci_2', 'ci_3'],
            evidenceScore: 82,
            sourceDepthScore: 100,
            commercialScore: 100,
            repeatabilityScore: 88,
            missingEvidence: [],
            productionMove: 'Produce a Wenai-owned proof-first variant.',
            distributionMove: 'Run tagged TikTok Shop variant with cluster_id=cluster_tiktok_fast.',
            providerBoundary: 'Ready for Wenai-owned production variant; still do not copy protected expression.',
            acceptance: 'Create a Wenai-owned variant, dispatch with cluster_id, and import performance return.',
          },
          {
            id: 'opportunity_cluster_reels_fast',
            priority: 'P1',
            readiness: 'needs_video_teardown',
            platform: 'Instagram Reels',
            clusterId: 'cluster_reels_fast',
            sourceMix: ['competitor-account'],
            insightIds: ['ci_4'],
            evidenceScore: 48,
            sourceDepthScore: 35,
            commercialScore: 20,
            repeatabilityScore: 42,
            missingEvidence: [
              'Add trend/rank source signal',
              'Add structured multimodal video teardown',
              'Add sales/revenue or post-publish performance signal',
            ],
            productionMove: 'Wait for source depth before production.',
            distributionMove: 'Do not dispatch until evidence closes.',
            providerBoundary: 'Do not claim this pattern is market-proven until evidence is complete.',
            acceptance: 'Close missing evidence, then rerun creative intelligence application before production.',
          },
        ],
        missingLinks: ['Missing ready-to-produce creative opportunity backlog item'],
        nextActions: ['Close creative gap: Missing ready-to-produce creative opportunity backlog item'],
        brandLearningProfile: {
          preferredHookType: 'proof',
          preferredPacing: 'fast',
          avoidPatterns: [],
          nextTestAngles: ['TikTok Shop: proof angle'],
        },
      },
    });

    const productionAction = actions.find(action => action.title === 'Produce ready creative opportunity');
    expect(productionAction?.endpoint).toBe('/api/creative-intelligence');
    expect(productionAction?.payload).toMatchObject({
      projectId,
      action: 'apply-to-industrial-chain',
      opportunityId: 'opportunity_cluster_tiktok_fast',
      clusterId: 'cluster_tiktok_fast',
    });
    expect(productionAction?.acceptance).toContain('benchmark/script assets');

    const evidenceAction = actions.find(action => action.title === 'Close creative opportunity evidence gap');
    expect(evidenceAction?.endpoint).toBe('/api/creative-intelligence');
    expect(evidenceAction?.evidence).toContain('Add structured multimodal video teardown');
    expect(evidenceAction?.payload).toMatchObject({
      projectId,
      opportunityId: 'opportunity_cluster_reels_fast',
      clusterId: 'cluster_reels_fast',
    });
    expect((evidenceAction?.payload.insights as Array<{ source: string }>).map(item => item.source)).toEqual([
      'trend-rank',
      'video-teardown',
      'manual',
    ]);
  });

  it('turns creative monitoring harvest gaps into scheduler actions', async () => {
    const orgId = `action-monitoring-${Date.now()}`;
    const projectId = `monitoring-${Date.now()}`;
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);

    const actions = buildIndustrialActionQueue({
      projectId,
      snapshot,
      assets: [],
      plans: [],
      dispatches: [],
      performanceReturns: [],
      creativeMonitoringSnapshot: {
        orgId,
        projectId,
        monitorCount: 3,
        activeMonitorCount: 3,
        competitorAccountMonitorCount: 1,
        trendRankMonitorCount: 1,
        videoKeywordMonitorCount: 1,
        dueTaskCount: 3,
        importedInsightCount: 0,
        harvestRunCount: 0,
        harvestedInsightCount: 0,
        collectorTargetCount: 3,
        collectorAdapterStatus: 'manual_ops',
        collectorProviderReady: false,
        sourceCount: 3,
        providerReadySourceCount: 0,
        sourceSyncRunCount: 0,
        providerSourceFreshCount: 0,
        providerSourceFailureCount: 0,
        sourceSyncAccountObservationCount: 0,
        sourceSyncTrendRankObservationCount: 0,
        sourceSyncVideoTeardownObservationCount: 0,
        sourceSyncMultimodalParsedCount: 0,
        sourceSyncCoverageScore: 0,
        creativeSourceObservationCount: 0,
        creativeSourceRepeatObservationSourceCount: 0,
        creativeSourceScaleScore: 0,
        creativeSourceDepthScore: 0,
        accountTrackingCoverageTargetCount: 0,
        trendRankCoverageSignalCount: 0,
        videoTeardownRepeatReady: false,
        accountTrackingSourceReady: false,
        trendRankSourceReady: false,
        videoTeardownSourceReady: false,
        multimodalTeardownReady: true,
        missingLinks: ['Missing scheduled creative harvest run evidence'],
        nextActions: ['Close creative monitoring gap: Missing scheduled creative harvest run evidence'],
      },
    });

    const harvestAction = actions.find(action => action.title === 'Run scheduled creative harvest');
    expect(harvestAction?.endpoint).toBe('/api/creative-monitoring');
    expect(harvestAction?.payload).toMatchObject({
      projectId,
      action: 'run-harvest',
    });
  });

  it('turns incomplete provider creative source coverage into full source sync actions', async () => {
    const orgId = `action-source-sync-${Date.now()}`;
    const projectId = `source-sync-action-${Date.now()}`;
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);

    const actions = buildIndustrialActionQueue({
      projectId,
      snapshot,
      assets: [],
      plans: [],
      dispatches: [],
      performanceReturns: [],
      creativeMonitoringSnapshot: {
        orgId,
        projectId,
        monitorCount: 3,
        activeMonitorCount: 3,
        competitorAccountMonitorCount: 1,
        trendRankMonitorCount: 1,
        videoKeywordMonitorCount: 1,
        dueTaskCount: 0,
        importedInsightCount: 1,
        harvestRunCount: 1,
        harvestedInsightCount: 1,
        collectorTargetCount: 0,
        collectorAdapterStatus: 'provider_ready',
        collectorProviderReady: true,
        sourceCount: 3,
        providerReadySourceCount: 3,
        sourceSyncRunCount: 1,
        providerSourceFreshCount: 3,
        providerSourceFailureCount: 0,
        sourceSyncAccountObservationCount: 0,
        sourceSyncTrendRankObservationCount: 0,
        sourceSyncVideoTeardownObservationCount: 1,
        sourceSyncMultimodalParsedCount: 1,
        sourceSyncCoverageScore: 33,
        creativeSourceObservationCount: 1,
        creativeSourceRepeatObservationSourceCount: 0,
        creativeSourceScaleScore: 12,
        creativeSourceDepthScore: 20,
        accountTrackingCoverageTargetCount: 1,
        trendRankCoverageSignalCount: 1,
        videoTeardownRepeatReady: false,
        accountTrackingSourceReady: true,
        trendRankSourceReady: true,
        videoTeardownSourceReady: true,
        multimodalTeardownReady: true,
        missingLinks: ['Latest provider creative source sync did not cover account, trend/rank, and multimodal video signals'],
        nextActions: ['Close creative monitoring gap: Latest provider creative source sync did not cover account, trend/rank, and multimodal video signals'],
      },
    });

    const syncAction = actions.find(action => action.title === 'Run full creative source sync coverage');
    expect(syncAction?.endpoint).toBe('/api/creative-monitoring');
    expect(syncAction?.payload).toMatchObject({
      projectId,
      action: 'run-source-sync',
    });
    expect((syncAction?.payload.observations as Array<{ type: string }>).map(item => item.type)).toEqual([
      'competitor_account',
      'trend_rank',
      'video_keyword',
    ]);
    expect(syncAction?.acceptance).toContain('sourceSyncCoverageScore=100');
  });

  it('turns creative source depth gaps into explicit account, rank, and video parsing actions', async () => {
    const orgId = `action-source-depth-${Date.now()}`;
    const projectId = `source-depth-action-${Date.now()}`;
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);

    const actions = buildIndustrialActionQueue({
      projectId,
      snapshot,
      assets: [],
      plans: [],
      dispatches: [],
      performanceReturns: [],
      creativeMonitoringSnapshot: {
        orgId,
        projectId,
        monitorCount: 3,
        activeMonitorCount: 3,
        competitorAccountMonitorCount: 1,
        trendRankMonitorCount: 1,
        videoKeywordMonitorCount: 1,
        dueTaskCount: 0,
        importedInsightCount: 2,
        harvestRunCount: 1,
        harvestedInsightCount: 2,
        collectorTargetCount: 0,
        collectorAdapterStatus: 'provider_ready',
        collectorProviderReady: true,
        sourceCount: 3,
        providerReadySourceCount: 3,
        sourceSyncRunCount: 1,
        providerSourceFreshCount: 3,
        providerSourceFailureCount: 0,
        sourceSyncAccountObservationCount: 1,
        sourceSyncTrendRankObservationCount: 1,
        sourceSyncVideoTeardownObservationCount: 1,
        sourceSyncMultimodalParsedCount: 1,
        sourceSyncCoverageScore: 100,
        creativeSourceObservationCount: 3,
        creativeSourceRepeatObservationSourceCount: 1,
        creativeSourceScaleScore: 45,
        creativeSourceDepthScore: 48,
        creativeReadySourceHealthCardCount: 0,
        creativeSourceHealthCards: [
          {
            kind: 'video_teardown',
            label: 'multimodal video teardown',
            readiness: 'needs_repeat_evidence',
            configuredSourceCount: 1,
            providerReadySourceCount: 1,
            freshSourceCount: 1,
            coverageTargetCount: 1,
            observationCount: 1,
            repeatSourceCount: 0,
            depthScore: 80,
            missingEvidence: ['repeat_evidence'],
            nextAction: 'Close multimodal video teardown gap: repeat_evidence',
            acceptance: 'Provider-ready source, coverage depth, fresh sync observation, and repeat evidence are all present.',
          },
        ],
        accountTrackingCoverageTargetCount: 1,
        trendRankCoverageSignalCount: 1,
        videoTeardownRepeatReady: false,
        accountTrackingSourceReady: true,
        trendRankSourceReady: true,
        videoTeardownSourceReady: true,
        multimodalTeardownReady: true,
        missingLinks: [
          'Account tracking source covers fewer than 3 competitor accounts',
          'Trend/rank source lacks rank, trend, ad-library, or seller-feed breadth',
          'Video teardown source lacks repeat parsed sample evidence',
          'Creative source depth score below commercial benchmark threshold',
        ],
        nextActions: [],
      },
    });

    const accountAction = actions.find(action => action.title === 'Expand competitor account tracking source depth');
    expect(accountAction?.endpoint).toBe('/api/creative-monitoring');
    expect(accountAction?.payload).toMatchObject({
      projectId,
      action: 'configure-source',
      source: {
        kind: 'account_tracking',
        coverageTarget: '@competitor-a, @competitor-b, @competitor-c',
      },
    });
    expect(accountAction?.acceptance).toContain('accountTrackingCoverageTargetCount >= 3');

    const rankAction = actions.find(action => action.title === 'Expand trend and rank source breadth');
    expect(rankAction?.payload).toMatchObject({
      projectId,
      action: 'configure-source',
      source: {
        kind: 'trend_rank',
        coverageTarget: 'category rank videos, trend feed, ad library, top seller feed',
      },
    });
    expect(rankAction?.acceptance).toContain('trendRankCoverageSignalCount >= 3');

    const videoAction = actions.find(action => action.title === 'Collect repeat multimodal video teardown sample');
    expect(videoAction?.payload).toMatchObject({
      projectId,
      action: 'run-source-sync',
    });
    expect((videoAction?.payload.observations as Array<{ type: string; sceneBeats: string[] }>)[0]).toMatchObject({
      type: 'video_keyword',
      sceneBeats: ['problem frame', 'proof moment', 'product demo', 'CTA'],
    });
    expect(videoAction?.acceptance).toContain('videoTeardownRepeatReady=1');

    const healthAction = actions.find(action => action.title === 'Close weakest creative source health gap');
    expect(healthAction?.priority).toBe('P0');
    expect(healthAction?.evidence).toContain('kind=video_teardown');
    expect(healthAction?.payload).toMatchObject({
      projectId,
      action: 'run-source-sync',
    });
  });

  it('turns monitored creative signals into a brand learning materialization action', async () => {
    const orgId = `action-brand-learning-${Date.now()}`;
    const projectId = `brand-learning-action-${Date.now()}`;
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);

    const actions = buildIndustrialActionQueue({
      projectId,
      snapshot,
      assets: [],
      plans: [],
      dispatches: [],
      performanceReturns: [],
      creativeSnapshot: {
        orgId,
        projectId,
        insightCount: 1,
        competitorAccountCount: 1,
        trendRankCount: 0,
        teardownCount: 0,
        reusableAngleCount: 1,
        topHookType: 'proof',
        topPacing: 'fast',
        topPlatform: 'TikTok Shop',
        totalViews: 12000,
        totalSales: 20,
        totalRevenue: 900,
        opportunityCount: 1,
        averageConfidenceScore: 60,
        opportunityMap: [],
        patternClusterCount: 0,
        crossSourcePatternCount: 0,
        creativeMoatScore: 30,
        patternClusters: [],
        opportunityBacklogCount: 0,
        readyOpportunityCount: 0,
        opportunityBacklog: [],
        missingLinks: ['Missing trend/rank benchmark signal'],
        nextActions: [],
        brandLearningProfile: {
          preferredHookType: 'proof',
          preferredPacing: 'fast',
          avoidPatterns: [],
          nextTestAngles: ['TikTok Shop: proof angle'],
        },
      },
      brandLearningProfile: {
        orgId,
        projectId,
        creativeSignalCount: 1,
        performanceSignalCount: 0,
        approvedDeliverableCount: 0,
        winningAssetRefs: [],
        preferredHookType: 'proof',
        preferredPacing: 'fast',
        preferredPlatforms: ['TikTok Shop'],
        approvedAssetPatterns: [],
        avoidPatterns: [],
        nextCreativeRules: ['Use proof hook as the default first-frame structure.'],
        nextDistributionRules: ['Schedule the next batch first on TikTok Shop.'],
        missingLinks: ['Missing performance returns for brand learning'],
        nextActions: [],
      },
    });

    const brandLearningAction = actions.find(action => action.title === 'Materialize creative harvest into brand learning assets');
    expect(brandLearningAction?.endpoint).toBe('/api/brand-learning-profile');
    expect(brandLearningAction?.payload).toEqual({ projectId, action: 'materialize' });
    expect(brandLearningAction?.acceptance).toContain('brand-learning report asset');
  });

  it('serves brand learning materialization actions from the API route', async () => {
    const headers = { 'x-org-id': `action-brand-learning-api-${Date.now()}` };
    const projectId = 'brand-learning-action-api-project';
    await addCreativeInsight(headers['x-org-id'], {
      projectId,
      source: 'competitor-account',
      platform: 'TikTok Shop',
      title: 'Proof hook from monitored account',
      hookType: 'proof',
      pacing: 'fast',
      reusableAngle: 'Open with proof result, then rebuild the offer for our SKU.',
      metrics: { views: 18000, sales: 30 },
    });

    const queueRes = await GET_ACTION_QUEUE(new Request(`http://localhost/api/industrial-chain/action-queue?projectId=${projectId}`, {
      headers,
    }) as unknown as Parameters<typeof GET_ACTION_QUEUE>[0]);
    const queueBody = await queueRes.json();
    const action = queueBody.actions.find((item: { title: string }) => item.title === 'Materialize creative harvest into brand learning assets');

    expect(queueRes.status).toBe(200);
    expect(queueBody.brandLearningProfile.creativeSignalCount).toBe(1);
    expect(action.endpoint).toBe('/api/brand-learning-profile');
  });

  it('turns channel account capacity gaps into matrix actions', async () => {
    const orgId = `action-channel-${Date.now()}`;
    const projectId = `channel-${Date.now()}`;
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);

    const actions = buildIndustrialActionQueue({
      projectId,
      snapshot,
      assets: [],
      plans: [],
      dispatches: [],
      performanceReturns: [],
      channelSnapshot: {
        orgId,
        projectId,
        accountCount: 1,
        connectedAccountCount: 1,
        healthyAccountCount: 0,
        blockedAccountCount: 0,
        rateLimitedAccountCount: 1,
        totalDailyPublishLimit: 0,
        scheduledCount: 1,
        availableSlotCount: 0,
        adCampaignCount: 0,
        readyAdCampaignCount: 0,
        activeAdCampaignCount: 0,
        measuredAdCampaignCount: 0,
        adBudgetCents: 0,
        adSpendCents: 0,
        adEvidenceCount: 0,
        adMissingLinks: ['Missing ad campaign ledger'],
        missingLinks: ['Rate-limited channel accounts (1)', 'No available publishing slots in channel matrix'],
        nextActions: ['Close channel gap: Rate-limited channel accounts (1)'],
      },
    });

    const channelAction = actions.find(action => action.title === 'Resolve channel account matrix gaps');
    expect(channelAction?.endpoint).toBe('/api/channel-accounts');
    expect(channelAction?.payload).toMatchObject({
      projectId,
      account: {
        authorizationStatus: 'manual_ready',
        healthStatus: 'healthy',
      },
    });
    const adAction = actions.find(action => action.title === 'Create or fix ad campaign casting ledger');
    expect(adAction?.endpoint).toBe('/api/channel-accounts');
    expect(adAction?.payload).toMatchObject({
      projectId,
      campaign: {
        objective: 'sales',
        status: 'ready',
        budgetCents: 25000,
      },
    });
  });

  it('turns missing enterprise asset permissions into RBAC actions', async () => {
    const orgId = `action-permission-${Date.now()}`;
    const projectId = `permission-${Date.now()}`;
    const asset = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Governed video',
      evidence: 'Needs enterprise permissions before distribution',
    });
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);

    const actions = buildIndustrialActionQueue({
      projectId,
      snapshot,
      assets: [asset],
      plans: [],
      dispatches: [],
      performanceReturns: [],
      permissionSnapshot: {
        orgId,
        projectId,
        permissionRecordCount: 0,
        governedAssetCount: 0,
        shareableAssetCount: 0,
        downloadableAssetCount: 0,
        storageObjectCount: 0,
        downloadableObjectCount: 0,
        shareableObjectCount: 0,
        missingStorageObjectCount: 0,
        activeAccessGrantCount: 0,
        expiredAccessGrantCount: 0,
        revokedAccessGrantCount: 0,
        expiredPermissionCount: 0,
        clientReviewScopeCount: 0,
        securityPolicyCount: 0,
        watermarkRequiredCount: 0,
        watermarkAppliedCount: 0,
        dlpPassedPolicyCount: 0,
        dlpFailedPolicyCount: 0,
        publicShareBlockedCount: 0,
        retentionPolicyCount: 0,
        auditEventCount: 0,
        accessAuditEventCount: 0,
        downloadableAccessReadyCount: 0,
        shareableAccessReadyCount: 0,
        assetAccessStates: [],
        missingLinks: ['Missing enterprise asset permission ledger'],
        nextActions: ['Close asset permission gap: Missing enterprise asset permission ledger'],
      },
    });

    const permissionAction = actions.find(action => action.title === 'Create enterprise asset permission ledger');
    expect(permissionAction?.endpoint).toBe('/api/asset-permissions');
    expect(permissionAction?.payload).toMatchObject({
      projectId,
      permission: {
        assetId: asset.id,
        scope: 'project',
      },
      securityPolicy: {
        assetId: asset.id,
        watermarkApplied: true,
        dlpScanStatus: 'passed',
        publicShareAllowed: false,
      },
    });
  });

  it('turns enterprise asset cloud gaps into storage, security, and grant actions', async () => {
    const orgId = `action-asset-cloud-${Date.now()}`;
    const projectId = `asset-cloud-${Date.now()}`;
    const asset = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Cloud governed video',
      evidence: 'Needs object storage, DLP policy, and temporary grants.',
    });
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);

    const actions = buildIndustrialActionQueue({
      projectId,
      snapshot,
      assets: [asset],
      plans: [],
      dispatches: [],
      performanceReturns: [],
      permissionSnapshot: {
        orgId,
        projectId,
        permissionRecordCount: 1,
        governedAssetCount: 1,
        shareableAssetCount: 1,
        downloadableAssetCount: 1,
        storageObjectCount: 0,
        downloadableObjectCount: 0,
        shareableObjectCount: 0,
        missingStorageObjectCount: 1,
        activeAccessGrantCount: 0,
        expiredAccessGrantCount: 0,
        revokedAccessGrantCount: 0,
        expiredPermissionCount: 0,
        clientReviewScopeCount: 0,
        securityPolicyCount: 0,
        watermarkRequiredCount: 0,
        watermarkAppliedCount: 0,
        dlpPassedPolicyCount: 0,
        dlpFailedPolicyCount: 0,
        publicShareBlockedCount: 0,
        retentionPolicyCount: 0,
        auditEventCount: 1,
        accessAuditEventCount: 0,
        downloadableAccessReadyCount: 0,
        shareableAccessReadyCount: 0,
        assetAccessStates: [{
          assetId: asset.id,
          hasActivePermission: true,
          canDownload: true,
          canShare: true,
          hasStorageObject: false,
          hasSecurityPolicy: false,
          hasActiveDownloadGrant: false,
          hasActiveShareGrant: false,
          downloadableAccessReady: false,
          shareableAccessReady: false,
          blockers: ['missing_storage_object', 'missing_security_policy', 'missing_download_grant', 'missing_share_grant'],
        }],
        missingLinks: [
          'Download/share permission missing storage object (1)',
          'Missing active asset access grant for download/share enforcement',
          'Download/share asset missing enterprise security policy',
        ],
        nextActions: [],
      },
    });

    const storageAction = actions.find(action => action.title === 'Attach governed asset storage object');
    expect(storageAction?.endpoint).toBe('/api/asset-permissions');
    expect(storageAction?.payload).toMatchObject({
      projectId,
      storageObject: {
        assetId: asset.id,
        provider: 'external',
        status: 'available',
      },
    });
    expect(storageAction?.acceptance).toContain('missingStorageObjectCount=0');

    const securityAction = actions.find(action => action.title === 'Attach enterprise asset security policy');
    expect(securityAction?.payload).toMatchObject({
      projectId,
      securityPolicy: {
        assetId: asset.id,
        watermarkApplied: true,
        dlpScanStatus: 'passed',
        publicShareAllowed: false,
      },
    });
    expect(securityAction?.acceptance).toContain('dlpPassedPolicyCount > 0');

    const grantAction = actions.find(action => action.title === 'Issue temporary download/share access grant');
    expect(grantAction?.endpoint).toBe('/api/asset-permissions/access');
    expect(grantAction?.payload).toMatchObject({
      projectId,
      assetId: asset.id,
      action: 'download',
      role: 'distribution',
      issueGrant: true,
      maxUses: 1,
    });
    expect(grantAction?.acceptance).toContain('activeAccessGrantCount > 0');
    expect(grantAction?.acceptance).toContain('accessUrls contains');
  });

  it('turns video production queue gaps into executable provider, review, and performance actions', async () => {
    const orgId = `action-video-queue-${Date.now()}`;
    const projectId = `video-queue-${Date.now()}`;
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);
    const now = new Date().toISOString();
    const baseItem = {
      assetId: 'video-handoff-1',
      title: 'Launch video workflow',
      sku: 'sku-video',
      mode: 'provider_ready' as const,
      stage: 'ready_for_execution' as const,
      priority: 'high' as const,
      slaHoursRemaining: 24,
      createdAt: now,
      updatedAt: now,
      planCount: 1,
      dispatchCount: 1,
      providerReadyDispatchCount: 1,
      manualReadyDispatchCount: 0,
      blockedDispatchCount: 0,
      measuredDispatchCount: 0,
      providerExecutionCount: 0,
      submittedProviderExecutionCount: 0,
      completedProviderExecutionCount: 0,
      failedProviderExecutionCount: 0,
      providerRecovery: {
        retryableExecutionCount: 0,
        blockedExecutionCount: 0,
        failedReasons: [],
      },
      resultAssetCount: 0,
      clientReviewAssetCount: 0,
      approvedDeliverableCount: 0,
      revisionRequestedCount: 0,
      reviewLinks: [],
      resultUrls: [],
      channels: ['TikTok Shop'],
      remixPlan: [],
      loopCompletionScore: 30,
      handoffPacket: {
        summary: 'ready_for_execution / provider_ready',
        missingEvidence: ['Missing completed provider/editor result URL.'],
        reviewPortalUrls: [],
        executionTrace: ['handoff_asset:video-handoff-1', 'dispatch:dispatch-1:queued'],
      },
      blockers: [],
      nextActions: ['Ingest completed provider/editor result URLs through /api/industrial-chain/production-result.'],
      runbookActions: [
        {
          id: 'submit-provider-execution',
          label: 'submit provider',
          endpoint: '/api/industrial-chain/video-workflow',
          method: 'POST' as const,
          payload: {
            projectId,
            sourceHandoffAssetId: 'video-handoff-1',
            dispatchId: 'dispatch-1',
            providerName: 'configured-video-provider',
          },
        },
        {
          id: 'ingest-production-result',
          label: 'ingest result',
          endpoint: '/api/industrial-chain/production-result',
          method: 'POST' as const,
          payload: {
            projectId,
            sourceHandoffAssetId: 'video-handoff-1',
            dispatchId: 'dispatch-1',
            task: { taskId: 'provider-task-id', status: 'completed', assetUrls: ['https://cdn.example/video.mp4'] },
          },
        },
      ],
    };

    const actions = buildIndustrialActionQueue({
      projectId,
      snapshot,
      assets: [],
      plans: [],
      dispatches: [],
      performanceReturns: [],
      videoProductionQueue: {
        orgId,
        projectId,
        itemCount: 3,
        providerReadyCount: 1,
        handoffOnlyCount: 0,
        blockedCount: 1,
        measuredCount: 0,
        providerExecutionCount: 1,
        submittedProviderExecutionCount: 0,
        completedProviderExecutionCount: 0,
        failedProviderExecutionCount: 1,
        retryableProviderExecutionCount: 1,
        resultAssetCount: 1,
        clientReviewCount: 1,
        approvedDeliverableCount: 1,
        revisionRequestedCount: 0,
        averageLoopCompletionScore: 55,
        items: [
          baseItem,
          {
            ...baseItem,
            assetId: 'video-result-1',
            stage: 'result_ingestion',
            failedProviderExecutionCount: 1,
            providerRecovery: {
              retryableExecutionCount: 1,
              blockedExecutionCount: 0,
              latestFailedTaskId: 'provider-failed-task',
              failedReasons: ['video_provider_submit_http_429'],
              nextAction: 'Retry the failed provider execution with the same governed workflow and dispatch context.',
            },
            resultAssetCount: 1,
            resultUrls: ['https://cdn.example/video.mp4'],
            runbookActions: [{
              id: 'retry-provider-execution',
              label: 'retry provider',
              endpoint: '/api/industrial-chain/video-workflow',
              method: 'POST',
              payload: {
                action: 'execute-provider-submission',
                projectId,
                sourceHandoffAssetId: 'video-result-1',
                dispatchId: 'dispatch-1',
                providerName: 'configured-video-provider',
              },
            }, {
              id: 'create-review-links',
              label: 'create review',
              endpoint: '/api/industrial-chain/review-links',
              method: 'POST',
              payload: { projectId, assetId: 'produced-video-1', ttlDays: 14 },
            }],
          },
          {
            ...baseItem,
            assetId: 'video-approved-1',
            stage: 'approved',
            resultAssetCount: 1,
            clientReviewAssetCount: 1,
            approvedDeliverableCount: 1,
            reviewLinks: [{
              token: 'wrv_video',
              projectId,
              assetId: 'produced-video-2',
              assetTitle: 'Produced video',
              expiresAt: now,
              status: 'approved',
              statusLabel: 'Approved',
              clientHeadline: 'Approved',
              clientRisk: 'none',
              supportAction: 'import performance',
              nextAction: 'import performance',
              clientDecision: {
                primaryActionLabel: '已批准，只读留档',
                primaryActionState: 'locked',
                operatorNextStep: '导入表现回流并进入复盘。',
                evidenceToCheck: ['成片链接', '批准记录', '表现回流'],
              },
              clientReceipt: {
                title: '客户验收回执',
                summary: '已由 Client 批准，结果进入分发、CRM 交接和表现回流。',
                nextStep: '运营继续推进分发、投放或复购跟进。',
                operatorRecipient: '运营 / CRM / 分发',
                evidenceToCheck: ['批准人', '批准时间', '交付物链接'],
                shareNote: '审核码 wrv_video 已批准，可继续下游动作。',
              },
              clientChecklist: [
                { label: '批准后动作', state: 'locked', detail: 'Result is approved and ready for performance return.' },
              ],
              escalationMessage: 'Approved by client; import performance return.',
              canSubmitFeedback: false,
              canApprove: false,
              feedbackCount: 1,
              approvedAt: now,
              approvalName: 'Client',
            }],
            runbookActions: [{
              id: 'import-performance-return',
              label: 'import performance',
              endpoint: '/api/performance-import',
              method: 'POST',
              payload: { projectId, dispatchId: 'dispatch-2', csv: 'sku,asset,platform,impressions,clicks,spend,orders,revenue' },
            }],
          },
        ],
      },
    });

    expect(actions.map(action => action.title)).toContain('Submit real video provider execution');
    expect(actions.map(action => action.title)).toContain('Retry failed video provider execution');
    expect(actions.map(action => action.title)).toContain('Ingest completed video production result');
    expect(actions.map(action => action.title)).toContain('Create video client review link');
    expect(actions.map(action => action.title)).toContain('Import post-publish video performance return');
    expect(actions.find(action => action.title === 'Submit real video provider execution')?.payload).toMatchObject({
      action: 'submit-provider-execution',
      sourceHandoffAssetId: 'video-handoff-1',
      dispatchId: 'dispatch-1',
    });
    expect(actions.find(action => action.title === 'Retry failed video provider execution')?.payload).toMatchObject({
      action: 'execute-provider-submission',
      sourceHandoffAssetId: 'video-result-1',
      dispatchId: 'dispatch-1',
    });
  });
});

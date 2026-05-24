import {
  type ContentAssetRecord,
  type DistributionDispatchRecord,
  type DistributionPlanRecord,
  type IndustrialPerformanceRecord,
  type IndustrializationSnapshot,
} from '@/lib/industrial-chain-store';
import type { AssetPermissionSnapshot } from '@/lib/asset-permission-ledger';
import type { BrandLearningProfile } from '@/lib/brand-learning-profile';
import type { CreativeIntelligenceSnapshot } from '@/lib/creative-intelligence';
import type { CreativeMonitoringSnapshot } from '@/lib/creative-monitoring';
import type { ChannelAccountSnapshot } from '@/lib/channel-account-ledger';
import type { VideoProductionQueue, VideoProductionQueueItem } from '@/lib/industrial-video-workflow';

export type IndustrialActionPriority = 'P0' | 'P1' | 'P2';
export type IndustrialActionOwner = 'ops' | 'creative' | 'distribution' | 'analytics' | 'crm' | 'admin';

export interface IndustrialActionItem {
  id: string;
  priority: IndustrialActionPriority;
  owner: IndustrialActionOwner;
  title: string;
  evidence: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PATCH';
  payload: Record<string, unknown>;
  acceptance: string;
}

export interface IndustrialActionQueueInput {
  projectId: string;
  snapshot: IndustrializationSnapshot;
  assets: ContentAssetRecord[];
  plans: DistributionPlanRecord[];
  dispatches: DistributionDispatchRecord[];
  performanceReturns: IndustrialPerformanceRecord[];
  creativeSnapshot?: CreativeIntelligenceSnapshot;
  creativeMonitoringSnapshot?: CreativeMonitoringSnapshot;
  channelSnapshot?: ChannelAccountSnapshot;
  permissionSnapshot?: AssetPermissionSnapshot;
  brandLearningProfile?: BrandLearningProfile;
  videoProductionQueue?: VideoProductionQueue;
}

function actionId(projectId: string, suffix: string) {
  return `action_${projectId}_${suffix}`.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 160);
}

function hasBriefAsset(assets: ContentAssetRecord[]) {
  return assets.some(asset => asset.type === 'brief' || asset.type === 'script' || asset.type === 'production_handoff');
}

function hasVisualAsset(assets: ContentAssetRecord[]) {
  return assets.some(asset => asset.type === 'image' || asset.type === 'video');
}

function hasBenchmarkAsset(assets: ContentAssetRecord[]) {
  return assets.some(asset => asset.type === 'benchmark');
}

function makeAssetAction(input: IndustrialActionQueueInput, type: ContentAssetRecord['type'], title: string, evidence: string): IndustrialActionItem {
  return {
    id: actionId(input.projectId, `create_${type}`),
    priority: 'P0',
    owner: type === 'benchmark' ? 'creative' : 'ops',
    title,
    evidence,
    endpoint: '/api/industrial-chain',
    method: 'POST',
    payload: {
      action: 'asset',
      asset: {
        projectId: input.projectId,
        type,
        title,
        evidence: 'Attach source URL, file URL, or approved production note.',
        approvalStatus: 'approved',
        rightsStatus: 'owned',
        reusable: true,
      },
    },
    acceptance: `snapshot.${type === 'benchmark' ? 'assetCount' : 'assetCount'} increases and the related missing link disappears.`,
  };
}

function firstAssetPermissionState(input: IndustrialActionQueueInput, blocker?: string) {
  const states = input.permissionSnapshot?.assetAccessStates || [];
  if (blocker) {
    const match = states.find(state => state.blockers.includes(blocker));
    if (match) return match;
  }
  return states.find(state => state.blockers.length > 0) || states[0];
}

function firstAssetPermissionTarget(input: IndustrialActionQueueInput, blocker?: string) {
  return firstAssetPermissionState(input, blocker)?.assetId || input.assets[0]?.id || 'asset_id';
}

function firstGrantAction(input: IndustrialActionQueueInput): 'download' | 'share' {
  const state = firstAssetPermissionState(input, 'missing_download_grant') || firstAssetPermissionState(input, 'missing_share_grant');
  if (state?.blockers.includes('missing_download_grant')) return 'download';
  if (state?.blockers.includes('missing_share_grant')) return 'share';
  return (input.permissionSnapshot?.downloadableAssetCount || 0) > 0 ? 'download' : 'share';
}

function firstRunbookPayload(item: VideoProductionQueueItem, actionIdValue: string): Record<string, unknown> {
  return item.runbookActions.find(action => action.id === actionIdValue)?.payload || {};
}

function buildVideoProductionActions(input: IndustrialActionQueueInput): IndustrialActionItem[] {
  const queue = input.videoProductionQueue;
  if (!queue || queue.itemCount === 0) return [];

  const actions: IndustrialActionItem[] = [];
  const firstProviderGate = queue.items.find(item =>
    item.stage === 'provider_gate' || item.failedProviderExecutionCount > 0 || item.blockedDispatchCount > 0,
  );
  const firstRetryableProviderFailure = queue.items.find(item => item.providerRecovery.retryableExecutionCount > 0);
  const firstReadyExecution = queue.items.find(item =>
    item.stage === 'ready_for_execution' &&
    item.mode === 'provider_ready' &&
    item.providerReadyDispatchCount > 0 &&
    item.submittedProviderExecutionCount === 0,
  );
  const firstMissingResult = queue.items.find(item =>
    item.dispatchCount > 0 &&
    item.resultAssetCount === 0 &&
    item.submittedProviderExecutionCount === 0,
  );
  const firstMissingReview = queue.items.find(item =>
    item.resultAssetCount > 0 &&
    item.clientReviewAssetCount === 0,
  );
  const firstReviewPending = queue.items.find(item =>
    item.clientReviewAssetCount > 0 &&
    item.approvedDeliverableCount === 0 &&
    item.revisionRequestedCount === 0,
  );
  const firstRevision = queue.items.find(item => item.revisionRequestedCount > 0);
  const firstMissingPerformance = queue.items.find(item =>
    item.approvedDeliverableCount > 0 &&
    item.measuredDispatchCount === 0,
  );

  if (firstReadyExecution) {
    actions.push({
      id: actionId(input.projectId, `submit_video_provider_execution_${firstReadyExecution.assetId}`),
      priority: 'P0',
      owner: 'ops',
      title: 'Submit real video provider execution',
      evidence: `asset=${firstReadyExecution.assetId}; stage=${firstReadyExecution.stage}; providerReadyDispatches=${firstReadyExecution.providerReadyDispatchCount}; submittedExecutions=0`,
      endpoint: '/api/industrial-chain/video-workflow',
      method: 'POST',
      payload: {
        action: 'submit-provider-execution',
        ...firstRunbookPayload(firstReadyExecution, 'submit-provider-execution'),
      },
      acceptance: 'videoProductionQueue.submittedProviderExecutionCount > 0 or completedProviderExecutionCount > 0 for this workflow asset.',
    });
  }

  if (firstRetryableProviderFailure) {
    actions.push({
      id: actionId(input.projectId, `retry_video_provider_execution_${firstRetryableProviderFailure.assetId}`),
      priority: 'P0',
      owner: 'ops',
      title: 'Retry failed video provider execution',
      evidence: `asset=${firstRetryableProviderFailure.assetId}; retryable=${firstRetryableProviderFailure.providerRecovery.retryableExecutionCount}; latestFailedTask=${firstRetryableProviderFailure.providerRecovery.latestFailedTaskId || 'unknown'}; reasons=${firstRetryableProviderFailure.providerRecovery.failedReasons.join('; ') || 'none'}`,
      endpoint: '/api/industrial-chain/video-workflow',
      method: 'POST',
      payload: {
        action: 'execute-provider-submission',
        ...firstRunbookPayload(firstRetryableProviderFailure, 'retry-provider-execution'),
      },
      acceptance: 'videoProductionQueue.retryableProviderExecutionCount decreases, a new submitted/completed execution is recorded, or the blocker is explicitly marked non-retryable with evidence.',
    });
  }

  if (firstProviderGate) {
    actions.push({
      id: actionId(input.projectId, `resolve_video_provider_gate_${firstProviderGate.assetId}`),
      priority: 'P0',
      owner: 'admin',
      title: 'Resolve video provider execution gate',
      evidence: `asset=${firstProviderGate.assetId}; stage=${firstProviderGate.stage}; mode=${firstProviderGate.mode}; failedExecutions=${firstProviderGate.failedProviderExecutionCount}; blockedDispatches=${firstProviderGate.blockedDispatchCount}; blockers=${firstProviderGate.blockers.join('; ') || 'none'}`,
      endpoint: firstProviderGate.mode === 'provider_ready' ? '/api/industrial-chain/video-workflow' : '/api/readiness',
      method: firstProviderGate.mode === 'provider_ready' ? 'POST' : 'GET',
      payload: firstProviderGate.mode === 'provider_ready'
        ? {
            action: 'execute-provider-submission',
            ...firstRunbookPayload(firstProviderGate, 'submit-provider-execution'),
            retryAfterFailure: firstProviderGate.failedProviderExecutionCount > 0,
          }
        : {
            projectId: input.projectId,
            requiredExternalInputs: [
              'VIDEO_PROVIDER_SUBMIT_ENDPOINT',
              'VIDEO_PROVIDER_SUBMIT_TOKEN',
              'legal consent',
              'licensed reference clips',
              'owned product assets',
            ],
          },
      acceptance: 'The queue item moves out of provider_gate, has a submitted/completed provider execution, or is explicitly converted to manual handoff with evidence.',
    });
  }

  if (firstMissingResult) {
    actions.push({
      id: actionId(input.projectId, `ingest_video_production_result_${firstMissingResult.assetId}`),
      priority: 'P0',
      owner: 'ops',
      title: 'Ingest completed video production result',
      evidence: `asset=${firstMissingResult.assetId}; dispatches=${firstMissingResult.dispatchCount}; resultAssets=0; resultUrls=${firstMissingResult.resultUrls.length}`,
      endpoint: '/api/industrial-chain/production-result',
      method: 'POST',
      payload: {
        ...firstRunbookPayload(firstMissingResult, 'ingest-production-result'),
        projectId: input.projectId,
        sourceHandoffAssetId: firstMissingResult.assetId,
        createReviewLinks: true,
      },
      acceptance: 'videoProductionQueue.resultAssetCount > 0 and result URLs are attached to the workflow trace.',
    });
  }

  if (firstMissingReview) {
    actions.push({
      id: actionId(input.projectId, `create_video_review_link_${firstMissingReview.assetId}`),
      priority: 'P0',
      owner: 'crm',
      title: 'Create video client review link',
      evidence: `asset=${firstMissingReview.assetId}; resultAssets=${firstMissingReview.resultAssetCount}; reviewLinks=0`,
      endpoint: '/api/industrial-chain/review-links',
      method: 'POST',
      payload: {
        ...firstRunbookPayload(firstMissingReview, 'create-review-links'),
        projectId: input.projectId,
        ttlDays: 14,
      },
      acceptance: 'videoProductionQueue.clientReviewCount > 0 and /review/[token] opens without login for the client.',
    });
  }

  if (firstReviewPending) {
    actions.push({
      id: actionId(input.projectId, `capture_video_review_decision_${firstReviewPending.assetId}`),
      priority: 'P0',
      owner: 'crm',
      title: 'Capture video client review decision',
      evidence: `asset=${firstReviewPending.assetId}; reviewLinks=${firstReviewPending.reviewLinks.length}; approvedDeliverables=0`,
      endpoint: firstReviewPending.reviewLinks[0]?.token
        ? `/api/industrial-chain/review/${firstReviewPending.reviewLinks[0].token}/feedback`
        : '/api/industrial-chain/review-links',
      method: 'POST',
      payload: firstReviewPending.reviewLinks[0]?.token
        ? {
            reviewerName: 'client name',
            feedback: 'approve or request specific revisions with timestamped notes',
          }
        : {
            projectId: input.projectId,
            assetId: firstReviewPending.assetId,
            ttlDays: 14,
          },
      acceptance: 'The review token records feedback, approval, or revision_requested status; approvedDeliverableCount or revisionRequestedCount increases.',
    });
  }

  if (firstRevision) {
    actions.push({
      id: actionId(input.projectId, `rework_video_revision_${firstRevision.assetId}`),
      priority: 'P0',
      owner: 'ops',
      title: 'Rework video revision request',
      evidence: `asset=${firstRevision.assetId}; revisionRequested=${firstRevision.revisionRequestedCount}; reviewLinks=${firstRevision.reviewLinks.length}`,
      endpoint: '/api/industrial-chain/video-workflow',
      method: 'POST',
      payload: {
        projectId: input.projectId,
        productName: firstRevision.title,
        references: firstRevision.resultUrls,
        createDistributionPlans: true,
        createDispatches: true,
        revisionFromAssetId: firstRevision.assetId,
        revisionNotes: firstRevision.reviewLinks[0]
          ? `Use review token ${firstRevision.reviewLinks[0].token} feedback to create the next controlled cut.`
          : 'Use client review feedback to create the next controlled cut.',
      },
      acceptance: 'A new workflow asset or result asset is created from the revision request, then routed back to client review.',
    });
  }

  if (firstMissingPerformance) {
    actions.push({
      id: actionId(input.projectId, `import_video_performance_return_${firstMissingPerformance.assetId}`),
      priority: 'P1',
      owner: 'analytics',
      title: 'Import post-publish video performance return',
      evidence: `asset=${firstMissingPerformance.assetId}; approvedDeliverables=${firstMissingPerformance.approvedDeliverableCount}; measuredDispatches=0`,
      endpoint: '/api/performance-import',
      method: 'POST',
      payload: {
        ...firstRunbookPayload(firstMissingPerformance, 'import-performance-return'),
        projectId: input.projectId,
        csv: 'sku,asset,platform,impressions,clicks,spend,orders,revenue',
      },
      acceptance: 'videoProductionQueue.measuredCount > 0 and brand learning can reuse the winning video structure.',
    });
  }

  return actions;
}

function buildCreativeOpportunityBacklogActions(input: IndustrialActionQueueInput): IndustrialActionItem[] {
  const snapshot = input.creativeSnapshot;
  if (!snapshot || snapshot.opportunityBacklogCount === 0) return [];

  const actions: IndustrialActionItem[] = [];
  const ready = snapshot.opportunityBacklog.find(item => item.readiness === 'ready_to_produce');
  const blocked = snapshot.opportunityBacklog.find(item => item.readiness !== 'ready_to_produce');

  if (ready) {
    actions.push({
      id: actionId(input.projectId, `produce_ready_creative_opportunity_${ready.id}`),
      priority: 'P0',
      owner: 'creative',
      title: 'Produce ready creative opportunity',
      evidence: `opportunity=${ready.id}; readiness=${ready.readiness}; repeatabilityScore=${ready.repeatabilityScore}; sourceDepth=${ready.sourceDepthScore}; commercialScore=${ready.commercialScore}`,
      endpoint: '/api/creative-intelligence',
      method: 'POST',
      payload: {
        projectId: input.projectId,
        action: 'apply-to-industrial-chain',
        opportunityId: ready.id,
        clusterId: ready.clusterId,
        productionMove: ready.productionMove,
        distributionMove: ready.distributionMove,
        providerBoundary: ready.providerBoundary,
      },
      acceptance: 'creative-intelligence application creates benchmark/script assets and a tagged distribution plan for this ready opportunity.',
    });
  }

  if (blocked) {
    const needsCompetitor = blocked.missingEvidence.some(item => item.includes('competitor account'));
    const needsTrend = blocked.missingEvidence.some(item => item.includes('trend/rank'));
    const needsVideo = blocked.missingEvidence.some(item => item.includes('video teardown'));
    const needsCommercial = blocked.missingEvidence.some(item => item.includes('sales/revenue') || item.includes('performance'));
    actions.push({
      id: actionId(input.projectId, `close_creative_opportunity_evidence_${blocked.id}`),
      priority: blocked.priority,
      owner: 'creative',
      title: 'Close creative opportunity evidence gap',
      evidence: `opportunity=${blocked.id}; readiness=${blocked.readiness}; missingEvidence=${blocked.missingEvidence.join('; ') || 'none'}`,
      endpoint: '/api/creative-intelligence',
      method: 'POST',
      payload: {
        projectId: input.projectId,
        opportunityId: blocked.id,
        clusterId: blocked.clusterId,
        insights: [
          needsCompetitor ? {
            source: 'competitor-account',
            platform: blocked.platform,
            title: 'Authorized competitor account signal for blocked opportunity',
            hookType: input.creativeSnapshot?.topHookType || 'proof',
            pacing: input.creativeSnapshot?.topPacing || 'fast',
            reusableAngle: `Close source-depth gap for ${blocked.id} with an authorized competitor account observation on the same platform and pacing.`,
            metrics: { views: 0, sales: 0, revenue: 0 },
            riskNotes: ['Use structure only; do not copy protected expression.'],
          } : null,
          needsTrend ? {
            source: 'trend-rank',
            platform: blocked.platform,
            title: 'Authorized trend or rank signal for blocked opportunity',
            hookType: input.creativeSnapshot?.topHookType || 'proof',
            pacing: input.creativeSnapshot?.topPacing || 'fast',
            reusableAngle: `Close rank/trend gap for ${blocked.id} with category ranking, trend, ad-library, or seller-feed evidence.`,
            metrics: { views: 0, sales: 0, revenue: 0 },
            riskNotes: ['Use public or licensed ranking evidence only.'],
          } : null,
          needsVideo ? {
            source: 'video-teardown',
            platform: blocked.platform,
            title: 'Structured multimodal teardown for blocked opportunity',
            hookType: input.creativeSnapshot?.topHookType || 'proof',
            pacing: input.creativeSnapshot?.topPacing || 'fast',
            reusableAngle: `Close video teardown gap for ${blocked.id} with parsed scene beats, proof moment, product moment, and CTA moment.`,
            teardown: {
              sceneBeats: ['problem frame', 'proof moment', 'product moment', 'CTA'],
              complianceNotes: ['Rebuild all footage, captions, music, and claim language.'],
            },
            metrics: { views: 0, sales: 0, revenue: 0 },
            riskNotes: ['Do not copy original footage, captions, music, or creator identity.'],
          } : null,
          needsCommercial ? {
            source: 'manual',
            platform: blocked.platform,
            title: 'Commercial performance evidence for blocked opportunity',
            hookType: input.creativeSnapshot?.topHookType || 'proof',
            pacing: input.creativeSnapshot?.topPacing || 'fast',
            reusableAngle: `Attach post-publish sales, revenue, or performance evidence before claiming ${blocked.id} is production-ready.`,
            metrics: { views: 0, sales: 0, revenue: 0 },
            riskNotes: ['Replace placeholder metrics with real platform or commerce performance evidence before applying to production.'],
          } : null,
        ].filter(Boolean),
      },
      acceptance: 'creativeSnapshot.readyOpportunityCount increases, or the blocked opportunity missingEvidence list becomes empty after real source evidence is imported.',
    });
  }

  return actions;
}

export function buildIndustrialActionQueue(input: IndustrialActionQueueInput): IndustrialActionItem[] {
  const actions: IndustrialActionItem[] = [];
  const firstReadyPlan = input.plans.find(plan => plan.status === 'ready' || plan.status === 'published' || plan.status === 'measured');
  const firstDraftPlan = input.plans.find(plan => plan.status === 'draft');
  const firstPublishedWithoutEvidence = input.dispatches.find(dispatch =>
    (dispatch.status === 'published' || dispatch.status === 'measured') && dispatch.evidenceUrls.length === 0,
  );
  const firstMeasuredDispatch = input.dispatches.find(dispatch => dispatch.status === 'measured');
  const firstReportAsset = input.assets.find(asset => asset.type === 'report');
  const firstWinningAsset = input.assets.find(asset => asset.type !== 'report' && (asset.type === 'image' || asset.type === 'video' || asset.type === 'script'));
  const hasBrandLearningReport = input.assets.some(asset => asset.source === 'brand-learning-profile' && asset.type === 'report');
  const hasBrandLearningScript = input.assets.some(asset => asset.source === 'brand-learning-profile' && asset.type === 'script');
  const firstUnapprovedDeliverable = input.assets.find(asset =>
    (asset.type === 'image' || asset.type === 'video') &&
    (asset.source === 'kuaizi-production-result' || asset.tags.includes('production-result')) &&
    (asset.deliveryStatus !== 'approved' || !asset.clientApprovedAt),
  );

  if (!hasBriefAsset(input.assets)) {
    actions.push(makeAssetAction(input, 'brief', 'Add production brief or script asset', 'No brief/script/production_handoff asset exists for the project.'));
  }
  if (!hasVisualAsset(input.assets)) {
    actions.push(makeAssetAction(input, 'video', 'Add image or video asset', 'No image/video production asset exists for distribution.'));
  }
  if (!hasBenchmarkAsset(input.assets)) {
    actions.push(makeAssetAction(input, 'benchmark', 'Add benchmark evidence asset', 'No competitor or historical benchmark evidence exists.'));
  }

  if (!input.creativeSnapshot || input.creativeSnapshot.insightCount === 0) {
    actions.push({
      id: actionId(input.projectId, 'import_creative_intelligence'),
      priority: 'P0',
      owner: 'creative',
      title: 'Import competitor creative intelligence',
      evidence: input.creativeSnapshot
        ? `creativeInsightCount=${input.creativeSnapshot.insightCount}`
        : 'creative intelligence snapshot is missing',
      endpoint: '/api/creative-intelligence',
      method: 'POST',
      payload: {
        projectId: input.projectId,
        insight: {
          source: 'competitor-account',
          platform: 'TikTok Shop',
          account: 'competitor_account',
          title: 'Winning competitor video',
          hookType: 'demo',
          pacing: 'fast',
          reusableAngle: 'Translate competitor hook structure into a differentiated Wenai script angle.',
          metrics: { views: 0, sales: 0, revenue: 0 },
          tags: ['manual-import', 'competitor'],
        },
      },
      acceptance: 'creativeSnapshot.insightCount > 0 and creativeSnapshot.reusableAngleCount > 0.',
    });
  } else {
    const patternClusterWeak =
      input.creativeSnapshot.patternClusterCount === 0 ||
      input.creativeSnapshot.crossSourcePatternCount === 0 ||
      input.creativeSnapshot.creativeMoatScore < 60;
    if (patternClusterWeak) {
      actions.push({
        id: actionId(input.projectId, 'build_creative_pattern_clusters'),
        priority: 'P1',
        owner: 'creative',
        title: 'Build reusable creative pattern clusters',
        evidence: `patternClusters=${input.creativeSnapshot.patternClusterCount}; crossSourcePatterns=${input.creativeSnapshot.crossSourcePatternCount}; creativeMoatScore=${input.creativeSnapshot.creativeMoatScore}`,
        endpoint: '/api/creative-intelligence',
        method: 'POST',
        payload: {
          projectId: input.projectId,
          insights: [
            {
              source: 'competitor-account',
              platform: input.creativeSnapshot.topPlatform || 'TikTok Shop',
              title: 'Authorized competitor account signal',
              hookType: input.creativeSnapshot.topHookType || 'proof',
              pacing: input.creativeSnapshot.topPacing || 'fast',
              reusableAngle: 'Import an authorized account signal that matches the target platform and pacing so it can join a reusable pattern cluster.',
              metrics: { views: 0, sales: 0, revenue: 0 },
              riskNotes: ['Use structure only; do not copy protected expression.'],
            },
            {
              source: 'trend-rank',
              platform: input.creativeSnapshot.topPlatform || 'TikTok Shop',
              title: 'Authorized rank or trend signal',
              hookType: input.creativeSnapshot.topHookType || 'proof',
              pacing: input.creativeSnapshot.topPacing || 'fast',
              reusableAngle: 'Import a rank or trend signal on the same platform and pacing to prove this is a repeatable market pattern, not a one-off clip.',
              metrics: { views: 0, sales: 0, revenue: 0 },
              riskNotes: ['Use public or licensed ranking evidence only.'],
            },
            {
              source: 'video-teardown',
              platform: input.creativeSnapshot.topPlatform || 'TikTok Shop',
              title: 'Authorized multimodal video teardown',
              hookType: input.creativeSnapshot.topHookType || 'proof',
              pacing: input.creativeSnapshot.topPacing || 'fast',
              reusableAngle: 'Import a structured teardown with scene beats, proof moment, product moment, and CTA moment to turn the pattern into production instructions.',
              teardown: {
                sceneBeats: ['problem frame', 'proof moment', 'product moment', 'CTA'],
                complianceNotes: ['Rebuild all footage, captions, music, and claim language.'],
              },
              metrics: { views: 0, sales: 0, revenue: 0 },
              riskNotes: ['Do not copy the original footage, caption, music, or protected expression.'],
            },
          ],
        },
        acceptance: 'creativeSnapshot.patternClusterCount > 0, crossSourcePatternCount > 0, and creativeMoatScore >= 60.',
      });
    }
  }

  if (input.creativeSnapshot && input.creativeSnapshot.insightCount > 0 && input.creativeSnapshot.missingLinks.length > 0) {
    actions.push({
      id: actionId(input.projectId, 'apply_creative_intelligence'),
      priority: 'P1',
      owner: 'creative',
      title: 'Convert creative intelligence into industrial assets',
      evidence: `creativeMissingLinks=${input.creativeSnapshot.missingLinks.join('; ')}`,
      endpoint: '/api/creative-intelligence',
      method: 'POST',
      payload: {
        projectId: input.projectId,
        action: 'apply-to-industrial-chain',
      },
      acceptance: 'A benchmark asset, script angle asset, and draft distribution plan are created from creative intelligence.',
    });
  }

  actions.push(...buildCreativeOpportunityBacklogActions(input));

  if (!input.creativeMonitoringSnapshot || input.creativeMonitoringSnapshot.monitorCount === 0) {
    actions.push({
      id: actionId(input.projectId, 'create_creative_monitoring_watchlist'),
      priority: 'P0',
      owner: 'creative',
      title: 'Create creative monitoring watchlist',
      evidence: input.creativeMonitoringSnapshot
        ? `creativeMonitorCount=${input.creativeMonitoringSnapshot.monitorCount}`
        : 'creative monitoring snapshot is missing',
      endpoint: '/api/creative-monitoring',
      method: 'POST',
      payload: {
        projectId: input.projectId,
        monitor: {
          type: 'competitor_account',
          platform: 'TikTok Shop',
          target: 'competitor_account',
          cadenceHours: 24,
          status: 'active',
        },
      },
      acceptance: 'creativeMonitoringSnapshot.monitorCount > 0 and activeMonitorCount > 0.',
    });
  } else if (input.creativeMonitoringSnapshot.missingLinks.length > 0) {
    const monitoringMissing = input.creativeMonitoringSnapshot.missingLinks;
    const needsHarvestRun = monitoringMissing.some(item => item.includes('scheduled creative harvest'));
    const needsSourceSync = monitoringMissing.some(item =>
      item.includes('provider creative source sync') ||
      item.includes('provider creative sources') ||
      item.includes('multimodal video signals') ||
      item.includes('observation volume') ||
      item.includes('repeat observations') ||
      item.includes('source depth score'),
    );
    const needsAccountCoverage = monitoringMissing.some(item => item.includes('Account tracking source covers fewer than 3 competitor accounts'));
    const needsTrendBreadth = monitoringMissing.some(item => item.includes('Trend/rank source lacks rank, trend, ad-library, or seller-feed breadth'));
    const needsVideoRepeatSample = monitoringMissing.some(item => item.includes('Video teardown source lacks repeat parsed sample evidence'));
    const needsVideoMonitor = monitoringMissing.some(item => item.includes('video keyword'));
    const needsTrendMonitor = monitoringMissing.some(item => item.includes('trend/rank'));
    const weakestSourceCard = input.creativeMonitoringSnapshot.creativeSourceHealthCards?.find(card => card.readiness !== 'ready');
    if (weakestSourceCard) {
      const needsProvider = weakestSourceCard.readiness === 'needs_provider' || weakestSourceCard.readiness === 'needs_coverage';
      actions.push({
        id: actionId(input.projectId, `close_creative_source_health_${weakestSourceCard.kind}`),
        priority: weakestSourceCard.kind === 'video_teardown' ? 'P0' : 'P1',
        owner: 'creative',
        title: 'Close weakest creative source health gap',
        evidence: `kind=${weakestSourceCard.kind}; readiness=${weakestSourceCard.readiness}; depthScore=${weakestSourceCard.depthScore}; missingEvidence=${weakestSourceCard.missingEvidence.join('; ')}`,
        endpoint: '/api/creative-monitoring',
        method: 'POST',
        payload: needsProvider
          ? {
            projectId: input.projectId,
            action: 'configure-source',
            source: {
              kind: weakestSourceCard.kind,
              platform: 'TikTok Shop',
              providerName: weakestSourceCard.kind === 'video_teardown' ? 'authorized-multimodal-video-parser' : 'authorized-creative-source',
              endpointConfigured: true,
              authConfigured: true,
              coverageTarget: weakestSourceCard.kind === 'account_tracking'
                ? '@competitor-a, @competitor-b, @competitor-c'
                : weakestSourceCard.kind === 'trend_rank'
                  ? 'category rank videos, trend feed, ad library, top seller feed'
                  : 'licensed viral video teardown samples',
              notes: 'Close the highest-risk creative source health gap with authorized or licensed data only.',
            },
          }
          : {
            projectId: input.projectId,
            action: 'run-source-sync',
            observations: [],
          },
        acceptance: weakestSourceCard.acceptance,
      });
    }
    if (needsAccountCoverage) {
      actions.push({
        id: actionId(input.projectId, 'expand_account_tracking_source_depth'),
        priority: 'P1',
        owner: 'creative',
        title: 'Expand competitor account tracking source depth',
        evidence: `accountTrackingCoverageTargetCount=${input.creativeMonitoringSnapshot.accountTrackingCoverageTargetCount}; missing=Account tracking source covers fewer than 3 competitor accounts`,
        endpoint: '/api/creative-monitoring',
        method: 'POST',
        payload: {
          projectId: input.projectId,
          action: 'configure-source',
          source: {
            kind: 'account_tracking',
            platform: 'TikTok Shop',
            providerName: 'authorized-account-tracker',
            endpointConfigured: true,
            authConfigured: true,
            coverageTarget: '@competitor-a, @competitor-b, @competitor-c',
            notes: 'Attach authorized account tracker coverage for at least three competitor or adjacent accounts; do not store credentials in payload.',
          },
        },
        acceptance: 'creativeMonitoringSnapshot.accountTrackingCoverageTargetCount >= 3 and the account coverage missing link disappears.',
      });
    }
    if (needsTrendBreadth) {
      actions.push({
        id: actionId(input.projectId, 'expand_trend_rank_source_breadth'),
        priority: 'P1',
        owner: 'creative',
        title: 'Expand trend and rank source breadth',
        evidence: `trendRankCoverageSignalCount=${input.creativeMonitoringSnapshot.trendRankCoverageSignalCount}; missing=Trend/rank source lacks rank, trend, ad-library, or seller-feed breadth`,
        endpoint: '/api/creative-monitoring',
        method: 'POST',
        payload: {
          projectId: input.projectId,
          action: 'configure-source',
          source: {
            kind: 'trend_rank',
            platform: 'TikTok Shop',
            providerName: 'authorized-rank-feed',
            endpointConfigured: true,
            authConfigured: true,
            coverageTarget: 'category rank videos, trend feed, ad library, top seller feed',
            notes: 'Attach authorized rank/trend/ad-library/seller-feed source breadth; use public or licensed exports only.',
          },
        },
        acceptance: 'creativeMonitoringSnapshot.trendRankCoverageSignalCount >= 3 and the trend/rank breadth missing link disappears.',
      });
    }
    if (needsVideoRepeatSample) {
      actions.push({
        id: actionId(input.projectId, 'collect_repeat_video_teardown_sample'),
        priority: 'P1',
        owner: 'creative',
        title: 'Collect repeat multimodal video teardown sample',
        evidence: `videoTeardownRepeatReady=${input.creativeMonitoringSnapshot.videoTeardownRepeatReady ? 1 : 0}; videoTeardowns=${input.creativeMonitoringSnapshot.sourceSyncVideoTeardownObservationCount}`,
        endpoint: '/api/creative-monitoring',
        method: 'POST',
        payload: {
          projectId: input.projectId,
          action: 'run-source-sync',
          observations: [
            {
              type: 'video_keyword',
              platform: 'TikTok Shop',
              target: 'category_video_teardown',
              title: 'Authorized repeat multimodal teardown sample',
              hookType: 'demo',
              pacing: 'fast',
              reusableAngle: 'Use the repeated parsed beat pattern only; rebuild all scenes, copy, music, claims, and CTA expression.',
              sceneBeats: ['problem frame', 'proof moment', 'product demo', 'CTA'],
              transcriptSummary: 'Second authorized parser sample confirms problem, proof, product, and CTA beats.',
              detectedObjects: ['product context', 'usage moment'],
              textOverlays: ['problem', 'proof', 'CTA'],
              metrics: { views: 0, saves: 0 },
            },
          ],
        },
        acceptance: 'creativeMonitoringSnapshot.videoTeardownRepeatReady=1 and video teardown source has at least two parsed observations.',
      });
    }
    actions.push({
      id: actionId(input.projectId, needsSourceSync ? 'run_creative_source_sync' : needsHarvestRun ? 'run_creative_monitoring_harvest' : 'resolve_creative_monitoring_watchlist'),
      priority: 'P1',
      owner: 'creative',
      title: needsSourceSync ? 'Run full creative source sync coverage' : needsHarvestRun ? 'Run scheduled creative harvest' : 'Resolve creative monitoring gaps',
      evidence: `creativeMonitoringMissingLinks=${monitoringMissing.join('; ')}`,
      endpoint: '/api/creative-monitoring',
      method: 'POST',
      payload: needsSourceSync
        ? {
          projectId: input.projectId,
          action: 'run-source-sync',
          observations: [
            {
              type: 'competitor_account',
              platform: 'TikTok Shop',
              target: 'competitor_account',
              title: 'Authorized account tracking signal',
              hookType: 'proof',
              pacing: 'fast',
              reusableAngle: 'Capture account-level hook structure and rebuild it as a differentiated Wenai script angle.',
              metrics: { views: 0, sales: 0, revenue: 0 },
            },
            {
              type: 'trend_rank',
              platform: 'TikTok Shop',
              target: 'category_rank',
              title: 'Authorized trend or rank signal',
              hookType: 'comparison',
              pacing: 'fast',
              reusableAngle: 'Capture rank movement as a platform-native comparison angle for the next batch.',
              metrics: { views: 0, sales: 0, revenue: 0 },
            },
            {
              type: 'video_keyword',
              platform: 'TikTok Shop',
              target: 'category_video_teardown',
              title: 'Authorized multimodal video teardown signal',
              hookType: 'demo',
              pacing: 'fast',
              reusableAngle: 'Extract beat order only and rebuild all footage, caption, claim, and CTA expression.',
              sceneBeats: ['problem frame', 'proof moment', 'product demo', 'CTA'],
              transcriptSummary: 'Attach provider parser summary with problem, proof, product, and CTA beats.',
              metrics: { views: 0, saves: 0 },
            },
          ],
        }
        : needsHarvestRun
        ? {
          projectId: input.projectId,
          action: 'run-harvest',
          observations: [],
        }
        : {
          projectId: input.projectId,
          monitor: {
            type: needsVideoMonitor ? 'video_keyword' : needsTrendMonitor ? 'trend_rank' : 'competitor_account',
            platform: 'TikTok Shop',
            target: needsVideoMonitor ? 'category_video_teardown' : needsTrendMonitor ? 'category_rank' : 'competitor_account',
            cadenceHours: 24,
            status: 'active',
          },
        },
      acceptance: needsSourceSync
        ? 'creativeMonitoringSnapshot.sourceSyncCoverageScore=100 with account, trend/rank, and multimodal video teardown observations.'
        : needsHarvestRun
        ? 'creativeMonitoringSnapshot.harvestRunCount > 0 and harvestedInsightCount increases when observations are supplied.'
        : 'creativeMonitoringSnapshot has competitor, trend/rank, and video keyword monitors, with due task or imported signal evidence.',
    });
  }

  const brandLearningCreativeSignals = input.brandLearningProfile?.creativeSignalCount || input.creativeSnapshot?.insightCount || 0;
  if (brandLearningCreativeSignals > 0 && (!hasBrandLearningReport || !hasBrandLearningScript)) {
    actions.push({
      id: actionId(input.projectId, 'materialize_brand_learning_profile'),
      priority: 'P1',
      owner: 'creative',
      title: 'Materialize creative harvest into brand learning assets',
      evidence: input.brandLearningProfile
        ? `brandLearningCreativeSignals=${input.brandLearningProfile.creativeSignalCount}; hasReport=${hasBrandLearningReport}; hasScript=${hasBrandLearningScript}`
        : `creativeInsightCount=${input.creativeSnapshot?.insightCount || 0}; brand learning profile not supplied`,
      endpoint: '/api/brand-learning-profile',
      method: 'POST',
      payload: {
        projectId: input.projectId,
        action: 'materialize',
      },
      acceptance: 'A brand-learning report asset, next-script asset, and draft distribution plan are created from monitored creative signals.',
    });
  }

  if (!input.channelSnapshot || input.channelSnapshot.accountCount === 0) {
    actions.push({
      id: actionId(input.projectId, 'create_channel_account_matrix'),
      priority: 'P0',
      owner: 'distribution',
      title: 'Create channel account matrix',
      evidence: input.channelSnapshot ? `channelAccountCount=${input.channelSnapshot.accountCount}` : 'channel account snapshot is missing',
      endpoint: '/api/channel-accounts',
      method: 'POST',
      payload: {
        projectId: input.projectId,
        account: {
          platform: 'TikTok Shop',
          handle: 'brand_or_operator_account',
          authorizationStatus: 'manual_ready',
          healthStatus: 'warmup',
          dailyPublishLimit: 2,
          scheduledCount: 0,
          owner: 'distribution',
        },
      },
      acceptance: 'channelSnapshot.accountCount > 0 and channelSnapshot.availableSlotCount > 0.',
    });
  } else if (input.channelSnapshot.missingLinks.length > 0) {
    actions.push({
      id: actionId(input.projectId, 'resolve_channel_account_matrix'),
      priority: 'P1',
      owner: 'distribution',
      title: 'Resolve channel account matrix gaps',
      evidence: `channelMissingLinks=${input.channelSnapshot.missingLinks.join('; ')}`,
      endpoint: '/api/channel-accounts',
      method: 'POST',
      payload: {
        projectId: input.projectId,
        account: {
          platform: 'TikTok Shop',
          handle: 'healthy_account_handle',
          authorizationStatus: 'manual_ready',
          healthStatus: 'healthy',
          dailyPublishLimit: 2,
          scheduledCount: 0,
          owner: 'distribution',
        },
      },
      acceptance: 'channelSnapshot.missingLinks is empty and availableSlotCount > 0.',
    });
  }

  if (input.channelSnapshot && input.channelSnapshot.adMissingLinks.length > 0) {
    actions.push({
      id: actionId(input.projectId, 'resolve_ad_campaign_casting'),
      priority: 'P1',
      owner: 'distribution',
      title: 'Create or fix ad campaign casting ledger',
      evidence: `adMissingLinks=${input.channelSnapshot.adMissingLinks.join('; ')}; adCampaigns=${input.channelSnapshot.adCampaignCount}; readyAds=${input.channelSnapshot.readyAdCampaignCount}; adBudgetCents=${input.channelSnapshot.adBudgetCents}`,
      endpoint: '/api/channel-accounts',
      method: 'POST',
      payload: {
        projectId: input.projectId,
        campaign: {
          platform: 'TikTok Shop',
          campaignName: 'launch-paid-boost',
          objective: 'sales',
          status: 'ready',
          budgetCents: 25000,
          spendCents: 0,
          evidenceUrl: 'replace-with-platform-campaign-url',
        },
      },
      acceptance: 'channelSnapshot.adCampaignCount > 0, readyAdCampaignCount > 0, adBudgetCents > 0, and adEvidenceCount > 0.',
    });
  }

  if (!input.permissionSnapshot || input.permissionSnapshot.permissionRecordCount === 0) {
    const targetAssetId = firstAssetPermissionTarget(input);
    actions.push({
      id: actionId(input.projectId, 'create_asset_permission_ledger'),
      priority: 'P0',
      owner: 'admin',
      title: 'Create enterprise asset permission ledger',
      evidence: input.permissionSnapshot ? `permissionRecordCount=${input.permissionSnapshot.permissionRecordCount}` : 'asset permission snapshot is missing',
      endpoint: '/api/asset-permissions',
      method: 'POST',
      payload: {
        projectId: input.projectId,
        permission: {
          assetId: targetAssetId,
          owner: 'ops',
          scope: 'project',
          roles: ['owner', 'admin', 'creative', 'distribution'],
          allowedActions: ['view', 'download', 'share', 'publish'],
          auditNote: 'Create enterprise asset permission policy before client or platform handoff.',
        },
        securityPolicy: {
          assetId: targetAssetId,
          watermarkRequired: true,
          watermarkApplied: true,
          dlpScanStatus: 'passed',
          publicShareAllowed: false,
          retentionDays: 365,
          auditNote: 'Create enterprise security policy before download, share, or publish handoff.',
        },
      },
      acceptance: 'permissionSnapshot.permissionRecordCount > 0, securityPolicyCount > 0, DLP is passed, watermark is applied, and permissionSnapshot.auditEventCount > 0.',
    });
  } else if (input.permissionSnapshot.missingLinks.length > 0) {
    const assetPermissionMissing = input.permissionSnapshot.missingLinks;
    const needsStorageObject = assetPermissionMissing.some(item => item.includes('missing storage object'));
    const needsAccessGrant = assetPermissionMissing.some(item => item.includes('Missing active asset access grant'));
    const needsSecurityPolicy = assetPermissionMissing.some(item => item.includes('missing enterprise security policy'));
    if (needsStorageObject) {
      const targetAssetId = firstAssetPermissionTarget(input, 'missing_storage_object');
      actions.push({
        id: actionId(input.projectId, 'create_asset_storage_object'),
        priority: 'P1',
        owner: 'admin',
        title: 'Attach governed asset storage object',
        evidence: `assetPermissionMissingLinks=${assetPermissionMissing.join('; ')}; storageObjects=${input.permissionSnapshot.storageObjectCount}`,
        endpoint: '/api/asset-permissions',
        method: 'POST',
        payload: {
          projectId: input.projectId,
          storageObject: {
            assetId: targetAssetId,
            provider: 'external',
            objectKey: `${input.projectId}/${targetAssetId}`,
            contentType: 'application/octet-stream',
            downloadUrl: 'replace-with-private-object-download-url-or-provider-object-key',
            shareUrl: 'replace-with-governed-share-url-or-provider-object-key',
            status: 'available',
          },
        },
        acceptance: 'permissionSnapshot.storageObjectCount > 0, downloadableObjectCount > 0, shareableObjectCount > 0, and missingStorageObjectCount=0.',
      });
    }
    if (needsSecurityPolicy) {
      const targetAssetId = firstAssetPermissionTarget(input, 'missing_security_policy');
      actions.push({
        id: actionId(input.projectId, 'create_asset_security_policy'),
        priority: 'P1',
        owner: 'admin',
        title: 'Attach enterprise asset security policy',
        evidence: `assetPermissionMissingLinks=${assetPermissionMissing.join('; ')}; securityPolicies=${input.permissionSnapshot.securityPolicyCount}`,
        endpoint: '/api/asset-permissions',
        method: 'POST',
        payload: {
          projectId: input.projectId,
          securityPolicy: {
            assetId: targetAssetId,
            watermarkRequired: true,
            watermarkApplied: true,
            dlpScanStatus: 'passed',
            publicShareAllowed: false,
            retentionDays: 365,
            auditNote: 'Attach DLP, watermark, retention, and public-share policy before issuing download/share grants.',
          },
        },
        acceptance: 'permissionSnapshot.securityPolicyCount > 0, dlpPassedPolicyCount > 0, watermarkAppliedCount > 0, publicShareBlockedCount > 0, and retentionPolicyCount > 0.',
      });
    }
    if (needsAccessGrant) {
      const grantAction = firstGrantAction(input);
      const targetAssetId = firstAssetPermissionTarget(input, grantAction === 'download' ? 'missing_download_grant' : 'missing_share_grant');
      actions.push({
        id: actionId(input.projectId, 'issue_asset_access_grant'),
        priority: 'P1',
        owner: 'admin',
        title: 'Issue temporary download/share access grant',
        evidence: `assetPermissionMissingLinks=${assetPermissionMissing.join('; ')}; activeAccessGrants=${input.permissionSnapshot.activeAccessGrantCount}`,
        endpoint: '/api/asset-permissions/access',
        method: 'POST',
        payload: {
          projectId: input.projectId,
          assetId: targetAssetId,
          action: grantAction,
          role: 'distribution',
          issueGrant: true,
          expiresInSeconds: 3600,
          maxUses: 1,
        },
        acceptance: 'permissionSnapshot.activeAccessGrantCount > 0, accessUrls contains a governed /api/industrial-chain/assets URL, and download/share routes require the grant token before returning object content or signed URLs.',
      });
    }
    const targetAssetId = firstAssetPermissionTarget(input);
    actions.push({
      id: actionId(input.projectId, 'resolve_asset_permission_ledger'),
      priority: 'P1',
      owner: 'admin',
      title: 'Resolve enterprise asset permission gaps',
      evidence: `assetPermissionMissingLinks=${input.permissionSnapshot.missingLinks.join('; ')}`,
      endpoint: '/api/asset-permissions',
      method: 'POST',
      payload: {
        projectId: input.projectId,
        permission: {
          assetId: targetAssetId,
          owner: 'ops',
          scope: 'project',
          roles: ['owner', 'admin', 'creative', 'distribution'],
          allowedActions: ['view', 'download', 'share', 'publish'],
          auditNote: 'Refresh permission policy and clear expired or incomplete access rules.',
        },
        securityPolicy: {
          assetId: targetAssetId,
          watermarkRequired: true,
          watermarkApplied: true,
          dlpScanStatus: 'passed',
          publicShareAllowed: false,
          retentionDays: 365,
          auditNote: 'Refresh enterprise security policy and clear DLP, watermark, retention, or public-share gaps.',
        },
      },
      acceptance: 'permissionSnapshot.missingLinks is empty and securityPolicyCount, dlpPassedPolicyCount, watermarkAppliedCount, and retentionPolicyCount are positive.',
    });
  }

  if (input.plans.length === 0) {
    actions.push({
      id: actionId(input.projectId, 'create_distribution_plan'),
      priority: 'P0',
      owner: 'distribution',
      title: 'Create first distribution plan',
      evidence: 'snapshot.planCount=0',
      endpoint: '/api/industrial-chain',
      method: 'POST',
      payload: {
        action: 'distribution-plan',
        distributionPlan: {
          projectId: input.projectId,
          channel: 'TikTok Shop',
          assetIds: input.assets.slice(0, 3).map(asset => asset.id),
          status: 'ready',
          owner: 'ops',
          returnMetric: 'CTR / CPC / orders / revenue',
        },
      },
      acceptance: 'snapshot.planCount > 0 and snapshot.readyPlanCount > 0.',
    });
  }

  if (input.plans.length > 0 && input.snapshot.readyPlanCount === 0 && firstDraftPlan) {
    actions.push({
      id: actionId(input.projectId, 'promote_draft_plan'),
      priority: 'P0',
      owner: 'distribution',
      title: 'Promote draft plan into executable dispatch',
      evidence: `plan=${firstDraftPlan.id}; status=draft`,
      endpoint: '/api/industrial-chain/dispatch',
      method: 'POST',
      payload: { planIds: [firstDraftPlan.id] },
      acceptance: 'snapshot.readyPlanCount > 0 and snapshot.executableDispatchCount > 0.',
    });
  }

  if (input.plans.length > 0 && input.dispatches.length === 0 && firstReadyPlan) {
    actions.push({
      id: actionId(input.projectId, 'create_dispatch'),
      priority: 'P0',
      owner: 'distribution',
      title: 'Create dispatch handoff package',
      evidence: `plan=${firstReadyPlan.id}; dispatchCount=0`,
      endpoint: '/api/industrial-chain/dispatch',
      method: 'POST',
      payload: { dispatch: { planId: firstReadyPlan.id } },
      acceptance: 'snapshot.dispatchCount > 0 and dispatch.handoffPackage contains UTM plus evidence checklist.',
    });
  }

  if (input.dispatches.some(dispatch => dispatch.status === 'provider_gated' || dispatch.status === 'blocked')) {
    actions.push({
      id: actionId(input.projectId, 'resolve_provider_gated_dispatch'),
      priority: 'P1',
      owner: 'admin',
      title: 'Resolve provider-gated dispatch',
      evidence: 'At least one dispatch is provider_gated or blocked.',
      endpoint: '/api/readiness',
      method: 'GET',
      payload: { projectId: input.projectId },
      acceptance: 'Provider credentials are configured or the dispatch is recreated as manual_ready with explicit handoff evidence.',
    });
  }

  if (firstPublishedWithoutEvidence) {
    actions.push({
      id: actionId(input.projectId, 'attach_publish_evidence'),
      priority: 'P0',
      owner: 'distribution',
      title: 'Attach publish evidence URL',
      evidence: `dispatch=${firstPublishedWithoutEvidence.id}; evidenceUrls=0`,
      endpoint: '/api/industrial-chain/dispatch',
      method: 'PATCH',
      payload: {
        dispatchId: firstPublishedWithoutEvidence.id,
        patch: {
          status: firstPublishedWithoutEvidence.status,
          evidenceUrls: ['https://platform.example/post-or-ad-url'],
          resultUrls: ['https://platform.example/analytics-export'],
        },
      },
      acceptance: 'snapshot.missingPublishEvidenceCount=0.',
    });
  }

  if (input.snapshot.measuredDispatchCount > 0 && input.performanceReturns.length === 0 && firstMeasuredDispatch) {
    actions.push({
      id: actionId(input.projectId, 'import_performance'),
      priority: 'P0',
      owner: 'analytics',
      title: 'Import performance CSV',
      evidence: `dispatch=${firstMeasuredDispatch.id}; performanceReturnCount=0`,
      endpoint: '/api/performance-import',
      method: 'POST',
      payload: {
        projectId: input.projectId,
        dispatchId: firstMeasuredDispatch.id,
        persist: true,
        csv: 'sku,asset,platform,impressions,clicks,spend,orders,revenue\nsku-1,asset-title,TikTok,10000,300,120,12,560',
      },
      acceptance: 'snapshot.performanceReturnCount > 0 and a report asset is created.',
    });
  }

  if (input.performanceReturns.length > 0 && input.snapshot.reportAssetCount === 0) {
    actions.push({
      id: actionId(input.projectId, 'create_performance_report_asset'),
      priority: 'P0',
      owner: 'analytics',
      title: 'Create performance report asset',
      evidence: `performanceReturnCount=${input.performanceReturns.length}; reportAssetCount=0`,
      endpoint: '/api/industrial-chain',
      method: 'POST',
      payload: {
        action: 'asset',
        asset: {
          projectId: input.projectId,
          type: 'report',
          title: `Performance return report: ${input.projectId}`,
          source: 'performance-import',
          evidence: 'Summarize rows, scale/iterate/pause counts, spend, revenue, and winning asset ids.',
          approvalStatus: 'approved',
          rightsStatus: 'owned',
        },
      },
      acceptance: 'snapshot.reportAssetCount > 0.',
    });
  }

  if (input.snapshot.assetGovernanceIssueCount > 0) {
    const target = input.assets.find(asset =>
      asset.approvalStatus !== 'approved' || asset.rightsStatus === 'needs_review' || asset.rightsStatus === 'expired',
    );
    actions.push({
      id: actionId(input.projectId, 'resolve_asset_governance'),
      priority: 'P0',
      owner: 'creative',
      title: 'Resolve asset approval and rights',
      evidence: `assetGovernanceIssueCount=${input.snapshot.assetGovernanceIssueCount}`,
      endpoint: '/api/industrial-chain',
      method: 'POST',
      payload: {
        action: 'asset-governance',
        assetId: target?.id || 'asset_id',
        governance: {
          approvalStatus: 'approved',
          rightsStatus: 'licensed',
          reusable: true,
        },
      },
      acceptance: 'snapshot.assetGovernanceIssueCount=0.',
    });
  }

  if (input.snapshot.deliveryIssueCount > 0 && firstUnapprovedDeliverable) {
    actions.push({
      id: actionId(input.projectId, 'approve_production_deliverable'),
      priority: 'P0',
      owner: 'crm',
      title: 'Create client review link for production deliverable',
      evidence: `deliverable=${firstUnapprovedDeliverable.id}; deliveryStatus=${firstUnapprovedDeliverable.deliveryStatus || 'not_ready'}`,
      endpoint: '/api/industrial-chain/review-links',
      method: 'POST',
      payload: {
        assetId: firstUnapprovedDeliverable.id,
        ttlDays: 30,
      },
      acceptance: 'A non-expired review token exists; client feedback is captured through /feedback and final approval through /approve clears deliveryIssueCount.',
    });
  }

  if (input.snapshot.assetMatchIssueCount > 0) {
    actions.push({
      id: actionId(input.projectId, 'resolve_asset_attribution'),
      priority: 'P1',
      owner: 'analytics',
      title: 'Resolve performance asset attribution',
      evidence: `ambiguous=${input.snapshot.assetMatchAmbiguousCount}; unmatched=${input.snapshot.assetMatchUnmatchedCount}`,
      endpoint: '/api/performance-import',
      method: 'POST',
      payload: {
        projectId: input.projectId,
        persist: true,
        csv: 'Re-import CSV after asset names match asset id, title, URL, source, or tags.',
      },
      acceptance: 'snapshot.assetMatchIssueCount=0 before scale decisions count as production evidence.',
    });
  }

  actions.push(...buildVideoProductionActions(input));

  if (input.snapshot.scaleDecisionCount > 0 && input.snapshot.nextRoundAssetPlanCount < input.snapshot.scaleDecisionCount) {
    actions.push({
      id: actionId(input.projectId, 'create_next_round_plan'),
      priority: 'P1',
      owner: 'distribution',
      title: 'Create next-round plan with winning asset lineage',
      evidence: `scaleDecisions=${input.snapshot.scaleDecisionCount}; nextRoundAssetPlans=${input.snapshot.nextRoundAssetPlanCount}`,
      endpoint: '/api/industrial-chain',
      method: 'POST',
      payload: {
        action: 'distribution-plan',
        distributionPlan: {
          projectId: input.projectId,
          channel: input.performanceReturns[0]?.decisions.find(item => item.decision === 'scale')?.row.platform || 'TikTok Shop',
          assetIds: [firstReportAsset?.id || 'performance_report_asset_id', firstWinningAsset?.id || 'winning_creative_asset_id'],
          status: 'draft',
          owner: 'ops',
          returnMetric: 'CTR / CPC / orders / revenue',
        },
      },
      acceptance: 'snapshot.nextRoundAssetPlanCount >= snapshot.scaleDecisionCount.',
    });
  }

  if (actions.length === 0) {
    actions.push({
      id: actionId(input.projectId, 'continue_iteration'),
      priority: 'P2',
      owner: 'crm',
      title: 'Continue measured iteration and CRM follow-up',
      evidence: 'Snapshot has no blocking missingLinks.',
      endpoint: '/api/industrial-chain/handoff',
      method: 'POST',
      payload: {
        projectId: input.projectId,
        inquiryId: 'inquiry_id',
        reviewer: 'ops',
      },
      acceptance: 'CRM handoff report is attached and next commercial action is owned.',
    });
  }

  return actions;
}

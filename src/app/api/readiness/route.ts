import { NextResponse, type NextRequest } from 'next/server';
import { getAssetPermissionSnapshot } from '@/lib/asset-permission-ledger';
import { getBrandLearningProfile } from '@/lib/brand-learning-profile';
import { getChannelAccountSnapshot } from '@/lib/channel-account-ledger';
import { getCreativeIntelligenceSnapshot } from '@/lib/creative-intelligence';
import { getCreativeMonitoringSnapshot } from '@/lib/creative-monitoring';
import { getIndustrializationSnapshot } from '@/lib/industrial-chain-store';
import { getIndustrialVideoProductionQueue } from '@/lib/industrial-video-workflow';
import { resolveOrgId } from '@/lib/org-id';
import { evaluateProductReadiness } from '@/lib/product-readiness';
import { buildReadinessInput } from '@/lib/readiness-input';
import { getScaleClaimSnapshot, scaleClaimSnapshotFacts } from '@/lib/scale-claim-ledger';

export { buildReadinessInput };

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get('projectId')?.trim();
  const orgId = await resolveOrgId(request);
  const [projectSnapshot, creativeSnapshot, creativeMonitoringSnapshot, channelSnapshot, permissionSnapshot, videoQueue, brandLearningProfile, scaleClaimSnapshot] = projectId
    ? await Promise.all([
      getIndustrializationSnapshot(orgId, projectId),
      getCreativeIntelligenceSnapshot(orgId, projectId),
      getCreativeMonitoringSnapshot(orgId, projectId),
      getChannelAccountSnapshot(orgId, projectId),
      getAssetPermissionSnapshot(orgId, projectId),
      getIndustrialVideoProductionQueue(orgId, projectId),
      getBrandLearningProfile(orgId, projectId),
      getScaleClaimSnapshot(orgId, projectId),
    ])
    : [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
  const enrichedProjectSnapshot = projectSnapshot
    ? {
      ...projectSnapshot,
      creativeInsightCount: creativeSnapshot?.insightCount || 0,
      creativeCompetitorAccountCount: creativeSnapshot?.competitorAccountCount || 0,
      creativeTrendRankCount: creativeSnapshot?.trendRankCount || 0,
      creativeReusableAngleCount: creativeSnapshot?.reusableAngleCount || 0,
      creativeOpportunityCount: creativeSnapshot?.opportunityCount || 0,
      creativeAverageOpportunityConfidence: creativeSnapshot?.averageConfidenceScore || 0,
      creativePatternClusterCount: creativeSnapshot?.patternClusterCount || 0,
      creativeCrossSourcePatternCount: creativeSnapshot?.crossSourcePatternCount || 0,
      creativeMoatScore: creativeSnapshot?.creativeMoatScore || 0,
      creativeMissingLinks: creativeSnapshot?.missingLinks || [],
      creativeMonitorCount: creativeMonitoringSnapshot?.monitorCount || 0,
      creativeActiveMonitorCount: creativeMonitoringSnapshot?.activeMonitorCount || 0,
      creativeDueTaskCount: creativeMonitoringSnapshot?.dueTaskCount || 0,
      creativeImportedMonitorSignalCount: creativeMonitoringSnapshot?.importedInsightCount || 0,
      creativeHarvestRunCount: creativeMonitoringSnapshot?.harvestRunCount || 0,
      creativeHarvestedInsightCount: creativeMonitoringSnapshot?.harvestedInsightCount || 0,
      creativeCollectorAdapterStatus: creativeMonitoringSnapshot?.collectorAdapterStatus || 'unknown',
      creativeCollectorProviderReady: Boolean(creativeMonitoringSnapshot?.collectorProviderReady),
      creativeSourceCount: creativeMonitoringSnapshot?.sourceCount || 0,
      creativeProviderReadySourceCount: creativeMonitoringSnapshot?.providerReadySourceCount || 0,
      creativeSourceSyncRunCount: creativeMonitoringSnapshot?.sourceSyncRunCount || 0,
      creativeProviderSourceFreshCount: creativeMonitoringSnapshot?.providerSourceFreshCount || 0,
      creativeProviderSourceFailureCount: creativeMonitoringSnapshot?.providerSourceFailureCount || 0,
      creativeSourceSyncAccountObservationCount: creativeMonitoringSnapshot?.sourceSyncAccountObservationCount || 0,
      creativeSourceSyncTrendRankObservationCount: creativeMonitoringSnapshot?.sourceSyncTrendRankObservationCount || 0,
      creativeSourceSyncVideoTeardownObservationCount: creativeMonitoringSnapshot?.sourceSyncVideoTeardownObservationCount || 0,
      creativeSourceSyncMultimodalParsedCount: creativeMonitoringSnapshot?.sourceSyncMultimodalParsedCount || 0,
      creativeSourceSyncCoverageScore: creativeMonitoringSnapshot?.sourceSyncCoverageScore || 0,
      creativeSourceObservationCount: creativeMonitoringSnapshot?.creativeSourceObservationCount || 0,
      creativeSourceRepeatObservationSourceCount: creativeMonitoringSnapshot?.creativeSourceRepeatObservationSourceCount || 0,
      creativeSourceScaleScore: creativeMonitoringSnapshot?.creativeSourceScaleScore || 0,
      creativeSourceDepthScore: creativeMonitoringSnapshot?.creativeSourceDepthScore || 0,
      creativeReadySourceHealthCardCount: creativeMonitoringSnapshot?.creativeReadySourceHealthCardCount || 0,
      creativeAccountTrackingCoverageTargetCount: creativeMonitoringSnapshot?.accountTrackingCoverageTargetCount || 0,
      creativeTrendRankCoverageSignalCount: creativeMonitoringSnapshot?.trendRankCoverageSignalCount || 0,
      creativeVideoTeardownRepeatReady: Boolean(creativeMonitoringSnapshot?.videoTeardownRepeatReady),
      creativeAccountTrackingSourceReady: Boolean(creativeMonitoringSnapshot?.accountTrackingSourceReady),
      creativeTrendRankSourceReady: Boolean(creativeMonitoringSnapshot?.trendRankSourceReady),
      creativeVideoTeardownSourceReady: Boolean(creativeMonitoringSnapshot?.videoTeardownSourceReady),
      creativeMonitoringMissingLinks: creativeMonitoringSnapshot?.missingLinks || [],
      channelAccountCount: channelSnapshot?.accountCount || 0,
      channelConnectedAccountCount: channelSnapshot?.connectedAccountCount || 0,
      channelHealthyAccountCount: channelSnapshot?.healthyAccountCount || 0,
      channelAvailableSlotCount: channelSnapshot?.availableSlotCount || 0,
      channelAdCampaignCount: channelSnapshot?.adCampaignCount || 0,
      channelReadyAdCampaignCount: channelSnapshot?.readyAdCampaignCount || 0,
      channelActiveAdCampaignCount: channelSnapshot?.activeAdCampaignCount || 0,
      channelMeasuredAdCampaignCount: channelSnapshot?.measuredAdCampaignCount || 0,
      channelAdBudgetCents: channelSnapshot?.adBudgetCents || 0,
      channelAdSpendCents: channelSnapshot?.adSpendCents || 0,
      channelAdEvidenceCount: channelSnapshot?.adEvidenceCount || 0,
      channelAdMissingLinks: channelSnapshot?.adMissingLinks || [],
      channelMissingLinks: channelSnapshot?.missingLinks || [],
      assetPermissionRecordCount: permissionSnapshot?.permissionRecordCount || 0,
      governedAssetCount: permissionSnapshot?.governedAssetCount || 0,
      assetPermissionAuditEventCount: permissionSnapshot?.auditEventCount || 0,
      assetPermissionAccessAuditEventCount: permissionSnapshot?.accessAuditEventCount || 0,
      assetStorageObjectCount: permissionSnapshot?.storageObjectCount || 0,
      assetMissingStorageObjectCount: permissionSnapshot?.missingStorageObjectCount || 0,
      assetSecurityPolicyCount: permissionSnapshot?.securityPolicyCount || 0,
      assetWatermarkRequiredCount: permissionSnapshot?.watermarkRequiredCount || 0,
      assetWatermarkAppliedCount: permissionSnapshot?.watermarkAppliedCount || 0,
      assetDlpPassedPolicyCount: permissionSnapshot?.dlpPassedPolicyCount || 0,
      assetDlpFailedPolicyCount: permissionSnapshot?.dlpFailedPolicyCount || 0,
      assetPublicShareBlockedCount: permissionSnapshot?.publicShareBlockedCount || 0,
      assetRetentionPolicyCount: permissionSnapshot?.retentionPolicyCount || 0,
      activeAssetAccessGrantCount: permissionSnapshot?.activeAccessGrantCount || 0,
      expiredAssetAccessGrantCount: permissionSnapshot?.expiredAccessGrantCount || 0,
      revokedAssetAccessGrantCount: permissionSnapshot?.revokedAccessGrantCount || 0,
      expiredAssetPermissionCount: permissionSnapshot?.expiredPermissionCount || 0,
      downloadableAssetAccessReadyCount: permissionSnapshot?.downloadableAccessReadyCount || 0,
      shareableAssetAccessReadyCount: permissionSnapshot?.shareableAccessReadyCount || 0,
      assetPermissionMissingLinks: permissionSnapshot?.missingLinks || [],
      videoProductionQueueItemCount: videoQueue?.itemCount || 0,
      videoProviderExecutionCount: videoQueue?.providerExecutionCount || 0,
      videoSubmittedProviderExecutionCount: videoQueue?.submittedProviderExecutionCount || 0,
      videoCompletedProviderExecutionCount: videoQueue?.completedProviderExecutionCount || 0,
      videoFailedProviderExecutionCount: videoQueue?.failedProviderExecutionCount || 0,
      videoRetryableProviderExecutionCount: videoQueue?.retryableProviderExecutionCount || 0,
      videoResultAssetCount: videoQueue?.resultAssetCount || 0,
      videoClientReviewCount: videoQueue?.clientReviewCount || 0,
      videoApprovedDeliverableCount: videoQueue?.approvedDeliverableCount || 0,
      videoMeasuredCount: videoQueue?.measuredCount || 0,
      videoAverageLoopCompletionScore: videoQueue?.averageLoopCompletionScore || 0,
      brandLearningCreativeSignalCount: brandLearningProfile?.creativeSignalCount || 0,
      brandLearningPerformanceSignalCount: brandLearningProfile?.performanceSignalCount || 0,
      brandLearningApprovedDeliverableCount: brandLearningProfile?.approvedDeliverableCount || 0,
      brandLearningWinningAssetCount: brandLearningProfile?.winningAssetRefs.length || 0,
      brandLearningRuleCount: (brandLearningProfile?.nextCreativeRules.length || 0) + (brandLearningProfile?.nextDistributionRules.length || 0),
      brandLearningMissingLinks: brandLearningProfile?.missingLinks || [],
      ...(scaleClaimSnapshot ? scaleClaimSnapshotFacts(scaleClaimSnapshot) : {}),
    }
    : undefined;

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    benchmark: 'kuaizi',
    projectId: projectSnapshot?.projectId,
    creativeIntelligence: creativeSnapshot,
    creativeMonitoring: creativeMonitoringSnapshot,
    channelAccounts: channelSnapshot,
    assetPermissions: permissionSnapshot,
    videoProductionQueue: videoQueue,
    brandLearning: brandLearningProfile,
    scaleClaims: scaleClaimSnapshot,
    report: evaluateProductReadiness({
      ...buildReadinessInput(),
      project: enrichedProjectSnapshot,
    }),
  });
}

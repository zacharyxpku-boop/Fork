import { NextRequest, NextResponse } from 'next/server';
import { getAssetPermissionSnapshot } from '@/lib/asset-permission-ledger';
import { getBrandLearningProfile } from '@/lib/brand-learning-profile';
import { getChannelAccountSnapshot } from '@/lib/channel-account-ledger';
import { getCreativeIntelligenceSnapshot } from '@/lib/creative-intelligence';
import { getCreativeMonitoringSnapshot } from '@/lib/creative-monitoring';
import { buildIndustrialActionQueue } from '@/lib/industrial-action-queue';
import { getIndustrialVideoProductionQueue } from '@/lib/industrial-video-workflow';
import {
  getIndustrializationSnapshot,
  listContentAssets,
  listDistributionDispatches,
  listDistributionPlans,
  listPerformanceReturns,
} from '@/lib/industrial-chain-store';
import { resolveOrgId } from '@/lib/org-id';

export async function GET(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const url = new URL(request.url);
  const projectId = url.searchParams.get('projectId') || 'default-project';
  const [snapshot, assets, plans, dispatches, performanceReturns, creativeSnapshot, creativeMonitoringSnapshot, channelSnapshot, permissionSnapshot, brandLearningProfile, videoProductionQueue] = await Promise.all([
    getIndustrializationSnapshot(orgId, projectId),
    listContentAssets(orgId, projectId, 200),
    listDistributionPlans(orgId, projectId, 200),
    listDistributionDispatches(orgId, projectId, 200),
    listPerformanceReturns(orgId, projectId, 200),
    getCreativeIntelligenceSnapshot(orgId, projectId),
    getCreativeMonitoringSnapshot(orgId, projectId),
    getChannelAccountSnapshot(orgId, projectId),
    getAssetPermissionSnapshot(orgId, projectId),
    getBrandLearningProfile(orgId, projectId),
    getIndustrialVideoProductionQueue(orgId, projectId),
  ]);

  const actions = buildIndustrialActionQueue({
    projectId,
    snapshot,
    assets,
    plans,
    dispatches,
    performanceReturns,
    creativeSnapshot,
    creativeMonitoringSnapshot,
    channelSnapshot,
    permissionSnapshot,
    brandLearningProfile,
    videoProductionQueue,
  });

  return NextResponse.json({
    orgId,
    projectId,
    snapshot,
    creativeSnapshot,
    creativeMonitoringSnapshot,
    channelSnapshot,
    permissionSnapshot,
    brandLearningProfile,
    videoProductionQueue,
    actionCount: actions.length,
    actions,
  });
}

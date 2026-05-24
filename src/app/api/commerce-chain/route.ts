import { NextRequest, NextResponse } from 'next/server';
import { resolveOrgId } from '@/lib/org-id';
import { getKuaiziServerConfig } from '@/lib/kuaizi-server';
import { buildCommerceChain, type CommerceChainInput } from '@/lib/commerce-chain';
import { buildPlatformConnectorReadiness } from '@/lib/platform-connector-readiness';
import {
  getIndustrializationSnapshot,
  listContentAssets,
  listPerformanceReturns,
  listDistributionPlans,
} from '@/lib/industrial-chain-store';

async function enrichFromIndustrialSnapshot(request: NextRequest, input: CommerceChainInput): Promise<{
  input: CommerceChainInput;
  snapshot?: Awaited<ReturnType<typeof getIndustrializationSnapshot>>;
}> {
  if (!input.projectId) return { input };

  const orgId = await resolveOrgId(request);
  const projectId = input.projectId;
  const [snapshot, assets, plans, performanceReturns] = await Promise.all([
    getIndustrializationSnapshot(orgId, projectId),
    listContentAssets(orgId, projectId, 20),
    listDistributionPlans(orgId, projectId, 20),
    listPerformanceReturns(orgId, projectId, 20),
  ]);
  const scaleDecisionCount = performanceReturns.reduce((sum, item) => sum + item.summary.scaleCount, 0);
  return {
    snapshot,
    input: {
      ...input,
      assets: input.assets && input.assets.length > 0 ? input.assets : assets.map(asset => asset.title),
      channels: input.channels && input.channels.length > 0 ? input.channels : plans.map(plan => plan.channel),
      industrialAssetCount: input.industrialAssetCount ?? snapshot.assetCount,
      reportAssetCount: input.reportAssetCount ?? snapshot.reportAssetCount,
      assetGovernanceIssueCount: input.assetGovernanceIssueCount ?? snapshot.assetGovernanceIssueCount,
      blockedAssetCount: input.blockedAssetCount ?? snapshot.blockedAssetCount,
      rightsIssueAssetCount: input.rightsIssueAssetCount ?? snapshot.rightsIssueAssetCount,
      distributionPlanCount: input.distributionPlanCount ?? snapshot.planCount,
      draftPlanCount: input.draftPlanCount ?? snapshot.draftPlanCount,
      readyPlanCount: input.readyPlanCount ?? snapshot.readyPlanCount,
      distributionDispatchCount: input.distributionDispatchCount ?? snapshot.dispatchCount,
      executableDispatchCount: input.executableDispatchCount ?? snapshot.executableDispatchCount,
      publishedDispatchCount: input.publishedDispatchCount ?? snapshot.publishedDispatchCount,
      publishedWithEvidenceCount: input.publishedWithEvidenceCount ?? snapshot.publishedWithEvidenceCount,
      missingPublishEvidenceCount: input.missingPublishEvidenceCount ?? snapshot.missingPublishEvidenceCount,
      overdueReviewDispatchCount: input.overdueReviewDispatchCount ?? snapshot.overdueReviewDispatchCount,
      measuredDispatchCount: input.measuredDispatchCount ?? snapshot.measuredDispatchCount,
      performanceReturnCount: input.performanceReturnCount ?? snapshot.performanceReturnCount,
      scaleDecisionCount: input.scaleDecisionCount ?? scaleDecisionCount,
      nextRoundAssetPlanCount: input.nextRoundAssetPlanCount ?? snapshot.nextRoundAssetPlanCount,
      assetMatchIssueCount: input.assetMatchIssueCount ?? snapshot.assetMatchIssueCount,
      assetMatchAmbiguousCount: input.assetMatchAmbiguousCount ?? snapshot.assetMatchAmbiguousCount,
      assetMatchUnmatchedCount: input.assetMatchUnmatchedCount ?? snapshot.assetMatchUnmatchedCount,
    },
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({})) as CommerceChainInput;
  const enriched = await enrichFromIndustrialSnapshot(request, body);
  return NextResponse.json({
    projectId: body.projectId,
    industrialSnapshot: enriched.snapshot,
    report: buildCommerceChain({
      ...enriched.input,
      productionProviderConfigured: enriched.input.productionProviderConfigured ?? Boolean(getKuaiziServerConfig()),
      platformConnectors: buildPlatformConnectorReadiness(),
    }),
  });
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const projectId = url.searchParams.get('projectId') || undefined;
  const skuCount = Number.parseInt(url.searchParams.get('skuCount') || '', 10) || undefined;
  const brief = url.searchParams.get('brief') || undefined;
  const crmOwner = url.searchParams.get('crmOwner') || undefined;
  const enriched = await enrichFromIndustrialSnapshot(request, { projectId, skuCount, brief, crmOwner });

  return NextResponse.json({
    projectId,
    industrialSnapshot: enriched.snapshot,
    report: buildCommerceChain({
      ...enriched.input,
      productionProviderConfigured: Boolean(getKuaiziServerConfig()),
      platformConnectors: buildPlatformConnectorReadiness(),
    }),
  });
}

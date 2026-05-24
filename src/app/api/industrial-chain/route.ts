import { NextRequest, NextResponse } from 'next/server';
import { getAssetPermissionSnapshot } from '@/lib/asset-permission-ledger';
import { getChannelAccountSnapshot } from '@/lib/channel-account-ledger';
import { getCreativeIntelligenceSnapshot } from '@/lib/creative-intelligence';
import { buildIndustrialActionQueue } from '@/lib/industrial-action-queue';
import { getIndustrialVideoProductionQueue } from '@/lib/industrial-video-workflow';
import { resolveOrgId } from '@/lib/org-id';
import {
  addContentAsset,
  addDistributionPlan,
  getIndustrializationSnapshot,
  listContentAssets,
  listDistributionDispatches,
  listPerformanceReturns,
  listDistributionPlans,
  updateContentAssetDelivery,
  updateContentAssetGovernance,
} from '@/lib/industrial-chain-store';

export async function GET(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const url = new URL(request.url);
  const projectId = url.searchParams.get('projectId') || 'default-project';
  const [assets, distributionPlans, distributionDispatches, performanceReturns, snapshot, creativeSnapshot, channelSnapshot, permissionSnapshot, videoProductionQueue] = await Promise.all([
    listContentAssets(orgId, projectId, 100),
    listDistributionPlans(orgId, projectId, 100),
    listDistributionDispatches(orgId, projectId, 100),
    listPerformanceReturns(orgId, projectId, 100),
    getIndustrializationSnapshot(orgId, projectId),
    getCreativeIntelligenceSnapshot(orgId, projectId),
    getChannelAccountSnapshot(orgId, projectId),
    getAssetPermissionSnapshot(orgId, projectId),
    getIndustrialVideoProductionQueue(orgId, projectId),
  ]);
  const actionQueue = buildIndustrialActionQueue({
    projectId,
    snapshot,
    assets,
    plans: distributionPlans,
    dispatches: distributionDispatches,
    performanceReturns,
    creativeSnapshot,
    channelSnapshot,
    permissionSnapshot,
    videoProductionQueue,
  });
  return NextResponse.json({ orgId, projectId, assets, distributionPlans, distributionDispatches, performanceReturns, snapshot, creativeSnapshot, channelSnapshot, permissionSnapshot, videoProductionQueue, actionQueue });
}

export async function POST(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const body = await request.json().catch(() => null) as {
    action?: string;
    asset?: unknown;
    assetId?: string;
    delivery?: unknown;
    governance?: unknown;
    distributionPlan?: unknown;
  } | null;
  if (!body) return NextResponse.json({ error: 'invalid_request_body', message: '请求格式错误，请提交有效的 JSON。' }, { status: 400 });

  if (body.action === 'asset') {
    const asset = await addContentAsset(orgId, body.asset && typeof body.asset === 'object' ? body.asset : {});
    return NextResponse.json({ ok: true, asset }, { status: 201 });
  }

  if (body.action === 'asset-governance') {
    if (!body.assetId) return NextResponse.json({ error: 'assetId_required', message: '缺少资产 ID，无法更新资产治理信息。' }, { status: 400 });
    const asset = await updateContentAssetGovernance(
      orgId,
      body.assetId,
      body.governance && typeof body.governance === 'object' ? body.governance : {},
    );
    if (!asset) return NextResponse.json({ error: 'asset_not_found', message: '没有找到该资产，请确认项目和资产 ID。' }, { status: 404 });
    return NextResponse.json({ ok: true, asset });
  }

  if (body.action === 'asset-delivery') {
    if (!body.assetId) return NextResponse.json({ error: 'assetId_required', message: '缺少资产 ID，无法更新交付状态。' }, { status: 400 });
    const asset = await updateContentAssetDelivery(
      orgId,
      body.assetId,
      body.delivery && typeof body.delivery === 'object' ? body.delivery : {},
    );
    if (!asset) return NextResponse.json({ error: 'asset_not_found', message: '没有找到该资产，请确认项目和资产 ID。' }, { status: 404 });
    return NextResponse.json({ ok: true, asset });
  }

  if (body.action === 'distribution-plan') {
    const distributionPlan = await addDistributionPlan(
      orgId,
      body.distributionPlan && typeof body.distributionPlan === 'object' ? body.distributionPlan : {},
    );
    return NextResponse.json({ ok: true, distributionPlan }, { status: 201 });
  }

  return NextResponse.json({
    error: 'unsupported_action',
    message: '不支持该操作，请使用 asset、asset-governance、asset-delivery 或 distribution-plan。',
  }, { status: 400 });
}

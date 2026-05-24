import { NextRequest, NextResponse } from 'next/server';
import { resolveOrgId } from '@/lib/org-id';
import {
  assetPermissionDenyMessage,
  evaluateAssetPermissionBatchAccess,
  recordAssetPermissionAccessAudit,
} from '@/lib/asset-permission-ledger';
import { evaluateChannelDispatchReadiness } from '@/lib/channel-account-ledger';
import {
  createDistributionDispatch,
  getDistributionDispatch,
  getIndustrializationSnapshot,
  listDistributionDispatches,
  updateDistributionDispatch,
} from '@/lib/industrial-chain-store';

export async function GET(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const url = new URL(request.url);
  const projectId = url.searchParams.get('projectId') || 'default-project';
  const dispatches = await listDistributionDispatches(orgId, projectId, 100);
  return NextResponse.json({ orgId, projectId, dispatches });
}

export async function POST(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const body = await request.json().catch(() => null) as {
    dispatch?: unknown;
    planIds?: unknown;
    providerAdapter?: unknown;
  } | null;
  if (!body) {
    return NextResponse.json({ error: 'dispatch_payload_required', message: '请提供分发执行记录或分发计划 ID。' }, { status: 400 });
  }

  if (Array.isArray(body.planIds)) {
    const planIds = body.planIds.map(item => String(item).trim()).filter(Boolean).slice(0, 20);
    if (planIds.length === 0) {
      return NextResponse.json({ error: 'plan_id_required', message: '请至少提供一个有效的分发计划 ID。' }, { status: 400 });
    }

    const dispatches = await Promise.all(planIds.map(planId => createDistributionDispatch(orgId, {
      planId,
      providerAdapter: typeof body.providerAdapter === 'object' && body.providerAdapter !== null
        ? body.providerAdapter as Parameters<typeof createDistributionDispatch>[1]['providerAdapter']
        : undefined,
      notes: 'Created from next-round distribution plan batch.',
    })));
    const snapshot = await getIndustrializationSnapshot(orgId, dispatches[0]?.projectId);
    return NextResponse.json({ ok: true, dispatches, snapshot }, { status: 201 });
  }

  if (!body.dispatch || typeof body.dispatch !== 'object') {
    return NextResponse.json({ error: 'dispatch_payload_required', message: '请提供分发执行记录，或提供分发计划 ID 批量创建。' }, { status: 400 });
  }

  const dispatch = await createDistributionDispatch(orgId, body.dispatch);
  return NextResponse.json({ ok: true, dispatch }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const body = await request.json().catch(() => null) as { dispatchId?: string; patch?: unknown } | null;
  if (!body?.dispatchId || !body.patch || typeof body.patch !== 'object') {
    return NextResponse.json({ error: 'dispatch_patch_required', message: '请提供分发执行记录 ID 和要更新的状态内容。' }, { status: 400 });
  }
  const patch = body.patch as { status?: string; requireAdCampaign?: boolean; adCampaignRequired?: boolean };
  if (patch.status === 'published' || patch.status === 'measured') {
    const existing = await getDistributionDispatch(orgId, body.dispatchId);
    if (!existing) return NextResponse.json({ error: 'dispatch_not_found', message: '没有找到该分发执行记录。' }, { status: 404 });
    const access = await evaluateAssetPermissionBatchAccess(orgId, {
      projectId: existing.projectId,
      assetIds: existing.handoffPackage.assetIds,
      action: 'publish',
      role: 'distribution',
    });
    await Promise.all(access.results.map(item => recordAssetPermissionAccessAudit(orgId, {
      projectId: existing.projectId,
      assetId: item.assetId,
      action: 'publish',
      role: 'distribution',
      actor: 'distribution',
      operation: 'distribution_dispatch_publish',
      allowed: item.allowed,
      reason: item.reason,
      record: item.record,
    })));
    if (!access.allowed) {
      return NextResponse.json({
        error: 'asset_publish_permission_denied',
        message: assetPermissionDenyMessage('publish'),
        access,
      }, { status: 403 });
    }

    const readiness = await evaluateChannelDispatchReadiness(orgId, {
      projectId: existing.projectId,
      channel: existing.channel,
      dispatchId: existing.id,
      requireAdCampaign: patch.status === 'measured' || patch.requireAdCampaign === true || patch.adCampaignRequired === true,
      requireMeasurement: patch.status === 'measured',
    });
    if (!readiness.allowed) {
      return NextResponse.json({
        error: 'channel_dispatch_readiness_denied',
        message: readiness.message,
        readiness,
      }, { status: 409 });
    }
  }

  const dispatch = await updateDistributionDispatch(orgId, body.dispatchId, body.patch);
  if (!dispatch) return NextResponse.json({ error: 'dispatch_not_found', message: '没有找到该分发执行记录。' }, { status: 404 });
  return NextResponse.json({ ok: true, dispatch });
}

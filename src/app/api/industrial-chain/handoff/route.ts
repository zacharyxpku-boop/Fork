import { NextRequest, NextResponse } from 'next/server';
import { resolveOrgId } from '@/lib/org-id';
import { assetPermissionDenyMessage, evaluateAssetPermissionBatchAccess, recordAssetPermissionAccessAudit } from '@/lib/asset-permission-ledger';
import {
  addContentAsset,
  addPerformanceReturn,
  getDistributionDispatch,
  getIndustrializationSnapshot,
  updateDistributionDispatch,
} from '@/lib/industrial-chain-store';
import { evaluatePerformanceImport, parsePerformanceCsv } from '@/lib/performance-import';
import { buildIndustrialCrmHandoff } from '@/lib/industrial-crm-handoff';
import { patchInquiryHandoff } from '@/app/api/sales/inquiry/route';

export async function POST(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const body = await request.json().catch(() => null) as {
    inquiryId?: string;
    projectId?: string;
    dispatchId?: string;
    performanceCsv?: string;
    evidenceUrls?: unknown;
    resultUrls?: unknown;
    owner?: string;
  } | null;
  if (!body?.inquiryId) {
    return NextResponse.json({
      error: 'inquiry_id_required',
      message: '请提供销售线索 ID，才能把生产结果写回 CRM 交接。',
    }, { status: 400 });
  }

  const projectId = body.projectId || 'default-project';
  let dispatchUpdate = null;
  if (body.dispatchId) {
    const existingDispatch = await getDistributionDispatch(orgId, body.dispatchId);
    if (!existingDispatch) {
      return NextResponse.json({
        error: 'dispatch_not_found',
        message: '没有找到该分发执行记录，无法写回 CRM 交接。',
      }, { status: 404 });
    }
    const access = await evaluateAssetPermissionBatchAccess(orgId, {
      projectId: existingDispatch.projectId,
      assetIds: existingDispatch.handoffPackage.assetIds,
      action: 'publish',
      role: 'distribution',
    });
    await Promise.all(access.results.map(item => recordAssetPermissionAccessAudit(orgId, {
      projectId: existingDispatch.projectId,
      assetId: item.assetId,
      action: 'publish',
      role: access.role,
      actor: access.role || 'distribution',
      operation: 'crm_handoff_publish',
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
    dispatchUpdate = await updateDistributionDispatch(orgId, body.dispatchId, {
      status: body.performanceCsv ? 'measured' : 'published',
      evidenceUrls: Array.isArray(body.evidenceUrls) ? body.evidenceUrls : undefined,
      resultUrls: Array.isArray(body.resultUrls) ? body.resultUrls : undefined,
      notes: body.performanceCsv ? 'Performance CSV returned during industrial CRM handoff.' : undefined,
    });
    if (!dispatchUpdate) {
      return NextResponse.json({
        error: 'dispatch_not_found',
        message: '没有找到该分发执行记录，无法更新发布或表现状态。',
      }, { status: 404 });
    }
  }

  const snapshot = await getIndustrializationSnapshot(orgId, projectId);
  const performanceRows = body.performanceCsv ? parsePerformanceCsv(body.performanceCsv) : [];
  const performance = performanceRows.length > 0 ? evaluatePerformanceImport(performanceRows) : undefined;
  const performanceRecord = performance
    ? await addPerformanceReturn(orgId, {
      projectId,
      dispatchId: body.dispatchId,
      source: 'crm-handoff',
      report: performance,
    })
    : null;
  const patch = buildIndustrialCrmHandoff({
    inquiryId: body.inquiryId,
    projectId,
    owner: body.owner,
    snapshot,
    performance,
  });
  const result = await patchInquiryHandoff(body.inquiryId, patch);
  if (!result.ok) {
    return NextResponse.json({
      error: result.error,
      message: 'CRM 交接写回失败，请确认销售线索仍存在且可更新。',
    }, { status: result.status });
  }
  const handoffReport = await addContentAsset(orgId, {
    projectId,
    type: 'report',
    title: `Industrial CRM handoff report: ${projectId}`,
    source: 'industrial-crm-handoff',
    tags: [
      'industrial-chain',
      'crm-handoff',
      patch.reviewDecision,
      patch.contractStage,
      performance ? 'performance-returned' : 'needs-performance',
    ],
    evidence: [
      `Inquiry: ${body.inquiryId}`,
      `Decision: ${patch.reviewDecision}`,
      `Priority: ${patch.priority}`,
      `Next action: ${patch.nextAction}`,
      `Contract next step: ${patch.contractNextStep}`,
      patch.reviewNotes,
    ].join('\n').slice(0, 2000),
  });
  const dispatchWithReport = body.dispatchId
    ? await updateDistributionDispatch(orgId, body.dispatchId, {
      status: performance ? 'measured' : dispatchUpdate?.status,
      assetIds: [handoffReport.id],
      notes: `CRM handoff report ${handoffReport.id} attached to dispatch.`,
    })
    : null;
  const updatedSnapshot = await getIndustrializationSnapshot(orgId, projectId);
  return NextResponse.json({
    ok: true,
    snapshot: updatedSnapshot,
    performance,
    performanceRecord,
    handoffReport,
    dispatch: dispatchWithReport || dispatchUpdate,
    patch,
    updatedAt: result.updatedAt,
  });
}

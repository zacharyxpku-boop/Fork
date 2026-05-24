import { NextRequest, NextResponse } from 'next/server';
import { resolveOrgId } from '@/lib/org-id';
import { assetPermissionDenyMessage, evaluateAssetPermissionBatchAccess, recordAssetPermissionAccessAudit } from '@/lib/asset-permission-ledger';
import { getDistributionDispatch } from '@/lib/industrial-chain-store';
import { ingestIndustrialProductionResult } from '@/lib/industrial-production-result';
import { getKuaiziTask, sanitizeKuaiziError } from '@/lib/kuaizi-server';
import type { KuaiziProductionTask } from '@/lib/kuaizi-shared';

function parseTask(input: unknown): KuaiziProductionTask | null {
  if (!input || typeof input !== 'object') return null;
  const task = input as { taskId?: unknown; status?: unknown; assetUrls?: unknown };
  if (typeof task.taskId !== 'string' || typeof task.status !== 'string' || !Array.isArray(task.assetUrls)) return null;
  return {
    taskId: task.taskId,
    status: task.status as KuaiziProductionTask['status'],
    assetUrls: task.assetUrls.map(item => String(item)),
  };
}

export async function POST(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const body = await request.json().catch(() => null) as {
    projectId?: string;
    sku?: string;
    sourceHandoffAssetId?: string;
    dispatchId?: string;
    channel?: string;
    clientReviewUrl?: string;
    createReviewLinks?: boolean;
    reviewTtlDays?: number;
    taskId?: string;
    task?: unknown;
  } | null;

  if (!body?.projectId || (!body.task && !body.taskId)) {
    return NextResponse.json({
      error: 'production_result_required',
      message: '请提供项目 ID，并提交生产任务结果或任务 ID。',
    }, { status: 400 });
  }

  let task = parseTask(body.task);
  if (!task && body.taskId) {
    try {
      task = await getKuaiziTask(body.taskId);
    } catch (error) {
      return NextResponse.json({
        error: sanitizeKuaiziError(error),
        code: 'KUAIZI_TASK_FETCH_FAILED',
        message: '获取外部视频生产任务失败，请检查任务 ID、服务配置或稍后重试。',
      }, { status: 502 });
    }
  }
  if (!task) {
    return NextResponse.json({
      error: 'production_task_invalid',
      message: '生产任务必须包含 taskId、status 和 assetUrls，才能写入成品资产。',
    }, { status: 400 });
  }

  if (body.dispatchId) {
    const dispatch = await getDistributionDispatch(orgId, body.dispatchId);
    if (!dispatch) {
      return NextResponse.json({
        error: 'dispatch_not_found',
        message: '没有找到该分发执行记录，无法把生产结果写回发布链路。',
      }, { status: 404 });
    }
    const access = await evaluateAssetPermissionBatchAccess(orgId, {
      projectId: dispatch.projectId,
      assetIds: dispatch.handoffPackage.assetIds,
      action: 'publish',
      role: 'distribution',
    });
    await Promise.all(access.results.map(item => recordAssetPermissionAccessAudit(orgId, {
      projectId: dispatch.projectId,
      assetId: item.assetId,
      action: 'publish',
      role: access.role,
      actor: access.role || 'distribution',
      operation: 'production_result_publish',
      allowed: item.allowed,
      reason: item.reason,
      record: item.record,
    })));
    if (!access.allowed) {
      return NextResponse.json({
        error: 'asset_publish_permission_denied',
        message: assetPermissionDenyMessage('publish'),
        access,
      }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
    }
  }

  const result = await ingestIndustrialProductionResult(orgId, {
    projectId: body.projectId,
    sku: body.sku,
    sourceHandoffAssetId: body.sourceHandoffAssetId,
    dispatchId: body.dispatchId,
    channel: body.channel,
    clientReviewUrl: body.clientReviewUrl,
    createReviewLinks: body.createReviewLinks,
    reviewTtlDays: body.reviewTtlDays,
    task,
  });

  const status = result.blockedReason ? 202 : 201;
  return NextResponse.json({ ok: !result.blockedReason, ...result }, { status });
}

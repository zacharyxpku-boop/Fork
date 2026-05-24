import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { resolveOrgId } from '@/lib/org-id';
import {
  createIndustrialVideoWorkflow,
  createOneClickVideoOperation,
  executeVideoProviderSubmission,
  getIndustrialVideoProductionQueue,
  submitVideoProviderExecution,
  updateVideoProviderExecution,
  type IndustrialVideoWorkflowInput,
} from '@/lib/industrial-video-workflow';

type VideoWorkflowRequestBody = (Partial<IndustrialVideoWorkflowInput> & {
  action?: string;
  sourceHandoffAssetId?: string;
  dispatchId?: string;
  providerName?: string;
  taskId?: string;
  requestPayload?: Record<string, unknown>;
  executionId?: string;
  status?: 'running' | 'completed' | 'failed';
  resultUrls?: unknown;
  errorMessage?: string;
  maxCostCents?: number;
  estimatedCostCents?: number;
  actualCostCents?: number;
  retryAfterSeconds?: number;
  callbackNonce?: string;
}) | null;

function parseVideoWorkflowBody(rawBody: string): VideoWorkflowRequestBody {
  try {
    return JSON.parse(rawBody) as VideoWorkflowRequestBody;
  } catch {
    return null;
  }
}

function verifyProviderWebhookSignature(rawBody: string, signatureHeader: string | null, secret?: string) {
  if (!secret) {
    return { ok: false, status: 503, error: 'video_provider_signature_not_configured' };
  }

  const provided = (signatureHeader || '').trim().replace(/^sha256=/i, '');
  if (!/^[a-f0-9]{64}$/i.test(provided)) {
    return { ok: false, status: 403, error: 'video_provider_signature_required' };
  }

  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const providedBuffer = Buffer.from(provided, 'hex');
  const expectedBuffer = Buffer.from(expected, 'hex');
  if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) {
    return { ok: false, status: 403, error: 'video_provider_signature_invalid' };
  }

  return { ok: true, status: 200, error: null };
}

export async function GET(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const projectId = new URL(request.url).searchParams.get('projectId') || 'default-project';
  const queue = await getIndustrialVideoProductionQueue(orgId, projectId);
  return NextResponse.json({ ok: true, queue }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const rawBody = await request.text();
  const body = parseVideoWorkflowBody(rawBody);

  if (body?.action === 'submit-provider-execution') {
    if (!body.projectId || !body.sourceHandoffAssetId || !body.dispatchId) {
      return NextResponse.json({
        error: 'video_provider_execution_required',
        message: '提交视频 provider 执行需要项目、来源交接资产和执行记录。',
      }, { status: 400 });
    }
    const execution = await submitVideoProviderExecution(orgId, {
      projectId: body.projectId,
      sourceHandoffAssetId: body.sourceHandoffAssetId,
      dispatchId: body.dispatchId,
      providerName: body.providerName,
      taskId: body.taskId,
      requestPayload: body.requestPayload,
      maxCostCents: body.maxCostCents,
      estimatedCostCents: body.estimatedCostCents,
    });
    const queue = await getIndustrialVideoProductionQueue(orgId, body.projectId);
    return NextResponse.json({ ok: execution.status !== 'blocked', execution, queue }, {
      status: execution.status === 'blocked' ? 409 : 201,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  if (body?.action === 'execute-provider-submission') {
    if (!body.projectId || !body.sourceHandoffAssetId || !body.dispatchId) {
      return NextResponse.json({
        error: 'video_provider_submission_required',
        message: '提交真实视频 provider 需要项目、来源交接资产和分发执行记录。',
      }, { status: 400 });
    }
    const submission = await executeVideoProviderSubmission(orgId, {
      projectId: body.projectId,
      sourceHandoffAssetId: body.sourceHandoffAssetId,
      dispatchId: body.dispatchId,
      providerName: body.providerName,
      requestPayload: body.requestPayload,
      maxCostCents: body.maxCostCents,
      estimatedCostCents: body.estimatedCostCents,
    });
    const queue = await getIndustrialVideoProductionQueue(orgId, body.projectId);
    const ok = submission.status === 'submitted';
    return NextResponse.json({ ok, submission, queue }, {
      status: submission.status === 'blocked' ? 409 : ok ? 201 : 502,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  if (body?.action === 'provider-callback') {
    const signatureCheck = verifyProviderWebhookSignature(
      rawBody,
      request.headers.get('x-wenai-video-signature'),
      process.env.VIDEO_PROVIDER_WEBHOOK_SECRET,
    );
    if (!signatureCheck.ok) {
      return NextResponse.json({
        error: signatureCheck.error,
        message: signatureCheck.error === 'video_provider_signature_not_configured'
          ? '视频 provider 回调签名密钥未配置，已拒绝写入回调。'
          : '视频 provider 回调签名缺失或不匹配，已拒绝写入回调。',
      }, { status: signatureCheck.status });
    }

    if (!body.projectId || (!body.executionId && !body.taskId) || !body.status) {
      return NextResponse.json({
        error: 'video_provider_callback_required',
        message: '视频 provider 回调需要项目、执行 ID 或任务 ID，以及 running/completed/failed 状态。',
      }, { status: 400 });
    }
    const execution = await updateVideoProviderExecution(orgId, {
      projectId: body.projectId,
      executionId: body.executionId,
      taskId: body.taskId,
      status: body.status,
      resultUrls: Array.isArray(body.resultUrls) ? body.resultUrls.map(String) : undefined,
      errorMessage: body.errorMessage,
      actualCostCents: body.actualCostCents,
      retryAfterSeconds: body.retryAfterSeconds,
      callbackNonce: body.callbackNonce,
    });
    if (!execution) {
      return NextResponse.json({
        error: 'video_provider_callback_denied',
        message: '没有找到可校验的视频 provider 执行记录，或回调校验码不匹配，已拒绝写入回调。',
      }, { status: 403 });
    }
    const queue = await getIndustrialVideoProductionQueue(orgId, body.projectId);
    return NextResponse.json({ ok: execution.status !== 'failed', execution, queue }, {
      status: execution.status === 'failed' ? 409 : 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  if (body?.action === 'create-one-click-operation') {
    if (!body.projectId || !body.productName) {
      return NextResponse.json({
        error: 'one_click_video_required',
        message: '创建一键视频运营编排需要项目 ID 和产品名。',
      }, { status: 400 });
    }

    const operation = await createOneClickVideoOperation(orgId, {
      projectId: body.projectId,
      sku: body.sku,
      productName: body.productName,
      category: body.category,
      market: body.market,
      goal: body.goal,
      audience: body.audience,
      platforms: Array.isArray(body.platforms) ? body.platforms : undefined,
      references: Array.isArray(body.references) ? body.references : undefined,
      productAssets: Array.isArray(body.productAssets) ? body.productAssets : undefined,
      owner: body.owner,
      providerConfigured: Boolean(body.providerConfigured),
      legalConsent: body.legalConsent === true,
      qualityTier: body.qualityTier,
      createDistributionPlans: body.createDistributionPlans,
      createDispatches: body.createDispatches,
    });
    return NextResponse.json({ ok: true, operation }, {
      status: 201,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  if (!body?.projectId || !body.productName) {
    return NextResponse.json({
      error: 'video_workflow_required',
      message: '请提供项目 ID 和产品名，才能创建视频生产任务。',
    }, { status: 400 });
  }

  const result = await createIndustrialVideoWorkflow(orgId, {
    projectId: body.projectId,
    sku: body.sku,
    productName: body.productName,
    category: body.category,
    market: body.market,
    goal: body.goal,
    audience: body.audience,
    platforms: Array.isArray(body.platforms) ? body.platforms : undefined,
    references: Array.isArray(body.references) ? body.references : undefined,
    productAssets: Array.isArray(body.productAssets) ? body.productAssets : undefined,
    owner: body.owner,
    providerConfigured: Boolean(body.providerConfigured),
    legalConsent: body.legalConsent === true,
    qualityTier: body.qualityTier,
    createDistributionPlans: body.createDistributionPlans,
    createDispatches: body.createDispatches,
  });

  const queue = await getIndustrialVideoProductionQueue(orgId, body.projectId);
  return NextResponse.json({ ok: true, ...result, queue }, { status: 201 });
}

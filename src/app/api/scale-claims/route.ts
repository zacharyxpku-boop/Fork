import { NextRequest, NextResponse } from 'next/server';

import {
  buildScaleClaimAuditChecklist,
  getScaleClaimSnapshot,
  listScaleClaimRecords,
  upsertScaleClaimRecord,
} from '@/lib/scale-claim-ledger';
import { resolveOrgId } from '@/lib/org-id';

export async function GET(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const projectId = new URL(request.url).searchParams.get('projectId') || 'default-project';
  const [records, snapshot] = await Promise.all([
    listScaleClaimRecords(orgId, projectId, 100),
    getScaleClaimSnapshot(orgId, projectId),
  ]);
  return NextResponse.json({
    orgId,
    projectId,
    records,
    snapshot,
    auditChecklist: buildScaleClaimAuditChecklist(snapshot),
  }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const body = await request.json().catch(() => null) as {
    projectId?: string;
    record?: unknown;
    records?: unknown;
  } | null;
  if (!body) return NextResponse.json({ error: 'invalid_request_body', message: '请提交有效的规模审计账本 JSON。' }, { status: 400 });
  const projectId = body.projectId || 'default-project';
  const rawRecords = Array.isArray(body.records)
    ? body.records
    : body.record && typeof body.record === 'object'
      ? [body.record]
      : [];
  if (rawRecords.length === 0) {
    return NextResponse.json({
      error: 'scale_claim_record_required',
      message: '请提供至少一条 Wenai 自有规模审计记录；竞品 91M+/42M+ 不能直接写成自有规模。',
    }, { status: 400 });
  }

  const records = await Promise.all(rawRecords.slice(0, 50).map(item => upsertScaleClaimRecord(orgId, {
    ...(item as Record<string, unknown>),
    projectId,
  })));
  const snapshot = await getScaleClaimSnapshot(orgId, projectId);
  return NextResponse.json({
    ok: true,
    projectId,
    records,
    snapshot,
    auditChecklist: buildScaleClaimAuditChecklist(snapshot),
  }, { status: 201 });
}

import { NextRequest, NextResponse } from 'next/server';
import {
  createIndustrialReviewLink,
  getIndustrialReviewPortalView,
  listIndustrialReviewLinks,
  revokeIndustrialReviewLink,
} from '@/lib/industrial-review-portal';
import { resolveOrgId } from '@/lib/org-id';

export async function GET(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const projectId = new URL(request.url).searchParams.get('projectId') || 'default-project';
  const links = await listIndustrialReviewLinks(orgId, projectId, 100);
  return NextResponse.json({
    orgId,
    projectId,
    links: links.map(getIndustrialReviewPortalView),
  });
}

export async function POST(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const body = await request.json().catch(() => null) as {
    assetId?: string;
    expiresAt?: string;
    ttlDays?: number;
  } | null;
  if (!body?.assetId) return NextResponse.json({ error: 'assetId_required', message: '缺少资产 ID，无法创建客户审核链接。' }, { status: 400 });

  const link = await createIndustrialReviewLink(orgId, {
    assetId: body.assetId,
    expiresAt: body.expiresAt,
    ttlDays: body.ttlDays,
  });
  if (!link) return NextResponse.json({ error: 'asset_not_found', message: '没有找到该资产，无法创建客户审核链接。' }, { status: 404 });
  return NextResponse.json({ ok: true, reviewLink: getIndustrialReviewPortalView(link) }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const body = await request.json().catch(() => null) as { token?: string; action?: string } | null;
  if (!body?.token || body.action !== 'revoke') {
    return NextResponse.json({ error: 'token_revoke_required', message: '请提供审核 token，并将操作设为 revoke。' }, { status: 400 });
  }
  const link = await revokeIndustrialReviewLink(orgId, body.token);
  if (!link) return NextResponse.json({ error: 'review_link_not_found', message: '没有找到该客户审核链接。' }, { status: 404 });
  return NextResponse.json({ ok: true, reviewLink: getIndustrialReviewPortalView(link) });
}

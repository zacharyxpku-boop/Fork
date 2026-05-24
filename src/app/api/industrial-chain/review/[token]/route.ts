import { NextRequest, NextResponse } from 'next/server';
import {
  assetPermissionDenyMessage,
  evaluateAssetPermissionAccess,
  recordAssetPermissionAccessAudit,
} from '@/lib/asset-permission-ledger';
import {
  getIndustrialReviewLink,
  getIndustrialReviewPortalView,
} from '@/lib/industrial-review-portal';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token || token.length > 80) return NextResponse.json({ error: 'bad_token', message: '审核链接格式不正确。' }, { status: 400 });
  const link = await getIndustrialReviewLink(token);
  if (!link) return NextResponse.json({ error: 'not_found', message: '没有找到该审核链接。' }, { status: 404 });
  const review = getIndustrialReviewPortalView(link);
  if (review.status === 'expired' || review.status === 'revoked') {
    return NextResponse.json({
      error: `review_${review.status}`,
      message: review.status === 'expired' ? '该审核链接已经过期。' : '该审核链接已经撤销。',
      review,
      feedback: [],
    }, { status: 410, headers: { 'Cache-Control': 'no-store' } });
  }
  const access = await evaluateAssetPermissionAccess(link.orgId, {
    projectId: link.projectId,
    assetId: link.assetId,
    action: 'view',
    role: 'client',
  });
  await recordAssetPermissionAccessAudit(link.orgId, {
    projectId: link.projectId,
    assetId: link.assetId,
    action: 'view',
    role: 'client',
    actor: 'client-review-token',
    operation: 'client_review_view',
    allowed: access.allowed,
    reason: access.reason,
    record: access.record,
  });
  if (!access.allowed) {
    return NextResponse.json({
      error: 'asset_view_permission_denied',
      message: assetPermissionDenyMessage('view'),
      access,
    }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }
  return NextResponse.json({
    review,
    feedback: link.feedback,
  }, { headers: { 'Cache-Control': 'no-store' } });
}

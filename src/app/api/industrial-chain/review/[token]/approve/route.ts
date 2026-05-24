import { NextRequest, NextResponse } from 'next/server';
import { approveIndustrialReviewLink, getIndustrialReviewPortalView } from '@/lib/industrial-review-portal';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token || token.length > 80) {
    return NextResponse.json({ error: 'bad_token', message: '审核链接格式不正确。' }, { status: 400 });
  }
  const body = await request.json().catch(() => null) as { approvalName?: string } | null;
  if (!body?.approvalName) {
    return NextResponse.json({ error: 'approvalName_required', message: '请填写批准人姓名或公司。' }, { status: 400 });
  }

  const result = await approveIndustrialReviewLink(token, { approvalName: body.approvalName });
  if (!result) {
    return NextResponse.json({ error: 'not_found', message: '没有找到该审核链接。' }, { status: 404 });
  }
  if (result.status === 'revoked') {
    return NextResponse.json({
      error: 'revoked',
      message: '该审核链接已撤销。',
      review: getIndustrialReviewPortalView(result.record),
    }, { status: 410 });
  }
  if (result.status === 'expired') {
    return NextResponse.json({
      error: 'expired',
      message: '该审核链接已过期。',
      review: getIndustrialReviewPortalView(result.record),
    }, { status: 410 });
  }
  if (!result.approvedNow) {
    return NextResponse.json({
      error: 'already_approved',
      message: '该交付物已经批准，无需重复操作。',
      review: getIndustrialReviewPortalView(result.record),
    }, { status: 409 });
  }

  return NextResponse.json({
    ok: true,
    approvedAt: result.record.approvedAt,
    review: getIndustrialReviewPortalView(result.record),
    asset: result.asset,
  }, { headers: { 'Cache-Control': 'no-store' } });
}

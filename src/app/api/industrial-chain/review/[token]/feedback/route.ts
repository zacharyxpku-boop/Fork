import { NextRequest, NextResponse } from 'next/server';
import { appendIndustrialReviewFeedback, getIndustrialReviewPortalView } from '@/lib/industrial-review-portal';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  if (!token || token.length > 80) {
    return NextResponse.json({ error: 'bad_token', message: '审核链接格式不正确。' }, { status: 400 });
  }
  const body = await request.json().catch(() => null) as {
    authorName?: string;
    type?: 'change' | 'question' | 'comment';
    body?: string;
    deliverableId?: string;
  } | null;
  if (!body?.authorName || !body.body) {
    return NextResponse.json({ error: 'feedback_required', message: '请填写反馈人姓名和具体反馈内容。' }, { status: 400 });
  }

  const result = await appendIndustrialReviewFeedback(token, {
    authorName: body.authorName,
    type: body.type || 'comment',
    body: body.body,
    deliverableId: body.deliverableId,
  });
  if (!result) {
    return NextResponse.json({ error: 'not_found', message: '没有找到该审核链接。' }, { status: 404 });
  }
  if (result.status === 'revoked') {
    return NextResponse.json({
      error: 'revoked',
      message: '该审核链接已撤销，不能继续提交反馈。',
      review: getIndustrialReviewPortalView(result.record),
    }, { status: 410 });
  }
  if (result.status === 'expired') {
    return NextResponse.json({
      error: 'expired',
      message: '该审核链接已过期，请联系运营重新生成。',
      review: getIndustrialReviewPortalView(result.record),
    }, { status: 410 });
  }
  if (result.status === 'approved') {
    return NextResponse.json({
      error: 'already_approved',
      message: '该交付物已经批准，反馈入口已锁定。',
      review: getIndustrialReviewPortalView(result.record),
    }, { status: 409 });
  }

  return NextResponse.json({
    ok: true,
    feedbackCount: result.record.feedback.length,
  }, { headers: { 'Cache-Control': 'no-store' } });
}

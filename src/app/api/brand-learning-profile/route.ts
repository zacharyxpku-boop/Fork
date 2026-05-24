import { NextRequest, NextResponse } from 'next/server';
import {
  getBrandLearningProfile,
  materializeBrandLearningProfile,
} from '@/lib/brand-learning-profile';
import { resolveOrgId } from '@/lib/org-id';

export async function GET(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const projectId = new URL(request.url).searchParams.get('projectId') || 'default-project';
  const profile = await getBrandLearningProfile(orgId, projectId);
  return NextResponse.json({ orgId, projectId, profile });
}

export async function POST(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const body = await request.json().catch(() => null) as { projectId?: string; action?: string } | null;
  if (!body) return NextResponse.json({ error: 'invalid_request_body', message: '请求格式错误，请提交有效的 JSON。' }, { status: 400 });

  const projectId = body.projectId || 'default-project';
  if (body.action !== 'materialize') {
    return NextResponse.json({ error: 'materialize_required', message: '请将 action 设置为 materialize，才能生成品牌学习资产。' }, { status: 400 });
  }

  const application = await materializeBrandLearningProfile(orgId, projectId);
  if (!application) {
    return NextResponse.json({
      error: 'brand_learning_evidence_required',
      message: '缺少创意洞察、表现回流或已批准交付证据，暂不能生成品牌学习资产。',
    }, { status: 422 });
  }
  return NextResponse.json({ ok: true, projectId, application }, { status: 201 });
}

import { NextRequest, NextResponse } from 'next/server';
import {
  addCreativeInsight,
  applyCreativeIntelligenceToIndustrialChain,
  getCreativeIntelligenceSnapshot,
  listCreativeInsights,
} from '@/lib/creative-intelligence';
import { resolveOrgId } from '@/lib/org-id';

export async function GET(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const projectId = new URL(request.url).searchParams.get('projectId') || 'default-project';
  const [insights, snapshot] = await Promise.all([
    listCreativeInsights(orgId, projectId, 100),
    getCreativeIntelligenceSnapshot(orgId, projectId),
  ]);
  return NextResponse.json({ orgId, projectId, insights, snapshot });
}

export async function POST(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const body = await request.json().catch(() => null) as {
    action?: string;
    projectId?: string;
    insight?: unknown;
    insights?: unknown;
  } | null;
  if (!body) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });

  const projectId = body.projectId || 'default-project';
  if (body.action === 'apply-to-industrial-chain') {
    const application = await applyCreativeIntelligenceToIndustrialChain(orgId, projectId);
    if (!application) return NextResponse.json({ error: 'creative insights are required before application' }, { status: 400 });
    const snapshot = await getCreativeIntelligenceSnapshot(orgId, projectId);
    return NextResponse.json({ ok: true, projectId, application, snapshot });
  }

  const rawInsights = Array.isArray(body.insights)
    ? body.insights
    : body.insight && typeof body.insight === 'object'
      ? [body.insight]
      : [];
  if (rawInsights.length === 0) {
    return NextResponse.json({ error: 'insight or insights is required' }, { status: 400 });
  }

  const insights = await Promise.all(rawInsights.slice(0, 50).map(item => addCreativeInsight(orgId, {
    ...(item as Record<string, unknown>),
    projectId,
  })));
  const snapshot = await getCreativeIntelligenceSnapshot(orgId, projectId);
  return NextResponse.json({ ok: true, projectId, insights, snapshot }, { status: 201 });
}

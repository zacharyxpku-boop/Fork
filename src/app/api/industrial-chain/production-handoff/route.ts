import { NextRequest, NextResponse } from 'next/server';
import { resolveOrgId } from '@/lib/org-id';
import { createIndustrialProductionHandoff } from '@/lib/industrial-production-handoff';

export async function POST(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const body = await request.json().catch(() => null) as {
    projectId?: string;
    sku?: string;
    source?: string;
    owner?: string;
    createDistributionPlans?: boolean;
    createDispatches?: boolean;
    handoffPack?: unknown;
  } | null;

  if (!body?.projectId || !body.handoffPack || typeof body.handoffPack !== 'object') {
    return NextResponse.json({ error: 'project_handoff_required', message: '缺少项目 ID 或生产交接包，无法创建生产交接。' }, { status: 400 });
  }
  const pack = body.handoffPack as { markdown?: unknown; selectedBrief?: unknown; platformSpecs?: unknown; evidence?: unknown };
  if (typeof pack.markdown !== 'string' || !Array.isArray(pack.platformSpecs) || !Array.isArray(pack.evidence)) {
    return NextResponse.json({ error: 'handoff_pack_incomplete', message: '生产交接包必须包含 markdown、平台规格和证据清单。' }, { status: 400 });
  }
  if (!pack.selectedBrief || typeof pack.selectedBrief !== 'object') {
    return NextResponse.json({ error: 'selected_brief_required', message: '生产交接包缺少已选 brief，无法交给生产团队。' }, { status: 400 });
  }

  const result = await createIndustrialProductionHandoff(orgId, {
    projectId: body.projectId,
    sku: body.sku,
    source: body.source,
    owner: body.owner,
    createDistributionPlans: body.createDistributionPlans,
    createDispatches: body.createDispatches,
    handoffPack: body.handoffPack as Parameters<typeof createIndustrialProductionHandoff>[1]['handoffPack'],
  });

  return NextResponse.json({ ok: true, ...result }, { status: 201 });
}

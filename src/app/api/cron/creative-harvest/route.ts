import { NextRequest, NextResponse } from 'next/server';

import {
  getCreativeCollectorManifest,
  getCreativeCollectorRunPlan,
  getCreativeMonitoringSnapshot,
  listCreativeHarvestRuns,
  listCreativeMonitoringProjects,
  runCreativeMonitoringHarvest,
} from '@/lib/creative-monitoring';
import { getCreativeIntelligenceSnapshot } from '@/lib/creative-intelligence';
import { resolveOrgId } from '@/lib/org-id';

type CreativeHarvestObservations = NonNullable<Parameters<typeof runCreativeMonitoringHarvest>[1]['observations']>;

function isAuthorized(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true;
  const provided = request.headers.get('x-vercel-cron-secret')
    || request.headers.get('authorization')?.replace(/^Bearer /, '')
    || new URL(request.url).searchParams.get('secret');
  return provided === cronSecret;
}

async function runHarvestForProject(
  orgId: string,
  projectId: string,
  observations: CreativeHarvestObservations = [],
) {
  const run = await runCreativeMonitoringHarvest(orgId, { projectId, observations });
  const [snapshot, creativeSnapshot, collectorManifest, collectorRunPlan, harvestRuns] = await Promise.all([
    getCreativeMonitoringSnapshot(orgId, projectId),
    getCreativeIntelligenceSnapshot(orgId, projectId),
    getCreativeCollectorManifest(orgId, projectId),
    getCreativeCollectorRunPlan(orgId, projectId),
    listCreativeHarvestRuns(orgId, projectId, 10),
  ]);
  return {
    projectId,
    run,
    snapshot,
    creativeSnapshot,
    collectorTargetCount: collectorManifest.length,
    collectorRunPlan,
    recentHarvestRunCount: harvestRuns.length,
    nextAction: run.importedInsightIds.length > 0
      ? '已写入洞察并触发品牌学习沉淀。'
      : run.missingObservationMonitorIds.length > 0
        ? '已记录缺观察监控项，等待采集器或运营补回真实观察。'
        : '本轮没有到期采集任务。',
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized', message: '创意周期采集入口需要有效的定时任务密钥。' }, { status: 401 });
  }

  const orgId = await resolveOrgId(request);
  const url = new URL(request.url);
  const explicitProjectId = url.searchParams.get('projectId') || '';
  const projectIds = explicitProjectId
    ? [explicitProjectId]
    : await listCreativeMonitoringProjects(orgId, 50);

  if (projectIds.length === 0) {
    return NextResponse.json({
      ok: true,
      orgId,
      projectCount: 0,
      runs: [],
      message: '当前组织还没有创意监控项目，未触发周期采集。',
    }, { headers: { 'Cache-Control': 'no-store' } });
  }

  const runs = [];
  for (const projectId of projectIds) {
    runs.push(await runHarvestForProject(orgId, projectId, []));
  }

  return NextResponse.json({
    ok: true,
    orgId,
    projectCount: runs.length,
    runs,
  }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'unauthorized', message: '创意采集回灌入口需要有效的定时任务密钥。' }, { status: 401 });
  }

  const orgId = await resolveOrgId(request);
  const body = await request.json().catch(() => null) as {
    projectId?: string;
    observations?: unknown;
  } | null;
  const projectId = typeof body?.projectId === 'string' && body.projectId.trim()
    ? body.projectId.trim()
    : '';
  const observations: CreativeHarvestObservations = Array.isArray(body?.observations)
    ? body.observations.slice(0, 100) as CreativeHarvestObservations
    : [];

  if (!projectId) {
    return NextResponse.json({
      error: 'project_id_required',
      message: '请提供项目 ID，采集器才能把观察结果写回对应创意监控项目。',
    }, { status: 400 });
  }
  if (observations.length === 0) {
    return NextResponse.json({
      error: 'collector_observations_required',
      message: '请提交至少一条真实观察结果；没有观察结果时请使用 GET 触发缺口记录，不要伪造洞察。',
    }, { status: 400 });
  }

  const result = await runHarvestForProject(orgId, projectId, observations);
  return NextResponse.json({
    ok: true,
    orgId,
    projectCount: 1,
    runs: [result],
  }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
}

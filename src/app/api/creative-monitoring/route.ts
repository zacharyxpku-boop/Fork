import { NextRequest, NextResponse } from 'next/server';
import {
  bootstrapCreativeMonitoringWatchlist,
  executeCreativeCollectorProviderRun,
  executeCreativeSourceProviderSync,
  getCreativeCollectorManifest,
  getCreativeCollectorRunPlan,
  getCreativeSourceSnapshot,
  getCreativeSourceSyncPlan,
  getCreativeMonitoringSnapshot,
  getDueCreativeCollectionTasks,
  importCreativeMonitorSignal,
  listCreativeSourceSyncRuns,
  listCreativeSources,
  listCreativeHarvestRuns,
  listCreativeMonitors,
  runCreativeMonitoringHarvest,
  runCreativeSourceSync,
  upsertCreativeCollectorAdapter,
  upsertCreativeSource,
  upsertCreativeMonitor,
} from '@/lib/creative-monitoring';
import { getCreativeIntelligenceSnapshot } from '@/lib/creative-intelligence';
import { resolveOrgId } from '@/lib/org-id';

type CreativeHarvestObservations = NonNullable<Parameters<typeof runCreativeMonitoringHarvest>[1]['observations']>;

export async function GET(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const projectId = new URL(request.url).searchParams.get('projectId') || 'default-project';
  const [monitors, dueTasks, harvestRuns, snapshot, creativeSnapshot] = await Promise.all([
    listCreativeMonitors(orgId, projectId, 100),
    getDueCreativeCollectionTasks(orgId, projectId),
    listCreativeHarvestRuns(orgId, projectId, 50),
    getCreativeMonitoringSnapshot(orgId, projectId),
    getCreativeIntelligenceSnapshot(orgId, projectId),
  ]);
  const [collectorManifest, collectorRunPlan, creativeSources, creativeSourceSnapshot, sourceSyncRuns] = await Promise.all([
    getCreativeCollectorManifest(orgId, projectId),
    getCreativeCollectorRunPlan(orgId, projectId),
    listCreativeSources(orgId, projectId, 100),
    getCreativeSourceSnapshot(orgId, projectId),
    listCreativeSourceSyncRuns(orgId, projectId, 50),
  ]);
  const sourceSyncPlan = await getCreativeSourceSyncPlan(orgId, projectId);
  return NextResponse.json({ orgId, projectId, monitors, dueTasks, collectorManifest, collectorRunPlan, creativeSources, creativeSourceSnapshot, sourceSyncPlan, sourceSyncRuns, harvestRuns, snapshot, creativeSnapshot }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const body = await request.json().catch(() => null) as {
    action?: string;
    projectId?: string;
    category?: string;
    platform?: string;
    competitorAccounts?: unknown;
    trendTargets?: unknown;
    videoKeywords?: unknown;
    cadenceHours?: unknown;
    monitor?: Record<string, unknown>;
    collectorAdapter?: Record<string, unknown>;
    source?: Record<string, unknown>;
    signal?: Record<string, unknown>;
    observations?: unknown;
  } | null;
  if (!body) return NextResponse.json({ error: 'invalid_request_body', message: '请求格式错误，请提交有效的 JSON。' }, { status: 400 });

  if (body.action === 'run-harvest' || body.action === 'ingest-collector-run') {
    const projectId = body.projectId || 'default-project';
    const observations: CreativeHarvestObservations = Array.isArray(body.observations)
      ? body.observations as CreativeHarvestObservations
      : [];
    if (body.action === 'ingest-collector-run' && observations.length === 0) {
      return NextResponse.json({
        error: 'collector_observations_required',
        message: '采集器回灌必须提供非空观察数组；空结果只能通过到期结算记录为缺口。',
      }, { status: 400 });
    }
    const run = await runCreativeMonitoringHarvest(orgId, {
      projectId,
      observations,
    });
    const [snapshot, creativeSnapshot, harvestRuns] = await Promise.all([
      getCreativeMonitoringSnapshot(orgId, projectId),
      getCreativeIntelligenceSnapshot(orgId, projectId),
      listCreativeHarvestRuns(orgId, projectId, 50),
    ]);
    const [collectorManifest, collectorRunPlan] = await Promise.all([
      getCreativeCollectorManifest(orgId, projectId),
      getCreativeCollectorRunPlan(orgId, projectId),
    ]);
    return NextResponse.json({ ok: true, run, harvestRuns, collectorManifest, collectorRunPlan, snapshot, creativeSnapshot }, { status: 201 });
  }

  if (body.action === 'run-source-sync') {
    const projectId = body.projectId || 'default-project';
    const observations: CreativeHarvestObservations = Array.isArray(body.observations)
      ? body.observations as CreativeHarvestObservations
      : [];
    const sourceSyncRun = await runCreativeSourceSync(orgId, {
      projectId,
      observations,
    });
    const [snapshot, creativeSnapshot, sourceSyncRuns, sourceSyncPlan, harvestRuns] = await Promise.all([
      getCreativeMonitoringSnapshot(orgId, projectId),
      getCreativeIntelligenceSnapshot(orgId, projectId),
      listCreativeSourceSyncRuns(orgId, projectId, 50),
      getCreativeSourceSyncPlan(orgId, projectId),
      listCreativeHarvestRuns(orgId, projectId, 50),
    ]);
    return NextResponse.json({ ok: true, sourceSyncRun, sourceSyncRuns, sourceSyncPlan, harvestRuns, snapshot, creativeSnapshot }, { status: 201 });
  }

  if (body.action === 'execute-source-provider-sync') {
    const projectId = body.projectId || 'default-project';
    const providerExecution = await executeCreativeSourceProviderSync(orgId, { projectId });
    const [snapshot, creativeSnapshot, sourceSyncRuns, sourceSyncPlan, harvestRuns] = await Promise.all([
      getCreativeMonitoringSnapshot(orgId, projectId),
      getCreativeIntelligenceSnapshot(orgId, projectId),
      listCreativeSourceSyncRuns(orgId, projectId, 50),
      getCreativeSourceSyncPlan(orgId, projectId),
      listCreativeHarvestRuns(orgId, projectId, 50),
    ]);
    return NextResponse.json({
      ok: providerExecution.status === 'completed',
      providerExecution,
      sourceSyncRuns,
      sourceSyncPlan,
      harvestRuns,
      snapshot,
      creativeSnapshot,
    }, { status: providerExecution.status === 'completed' ? 201 : 409 });
  }

  if (body.action === 'execute-collector-provider-run') {
    const projectId = body.projectId || 'default-project';
    const providerExecution = await executeCreativeCollectorProviderRun(orgId, { projectId });
    const [snapshot, creativeSnapshot, harvestRuns, collectorManifest, collectorRunPlan] = await Promise.all([
      getCreativeMonitoringSnapshot(orgId, projectId),
      getCreativeIntelligenceSnapshot(orgId, projectId),
      listCreativeHarvestRuns(orgId, projectId, 50),
      getCreativeCollectorManifest(orgId, projectId),
      getCreativeCollectorRunPlan(orgId, projectId),
    ]);
    return NextResponse.json({
      ok: providerExecution.status === 'completed',
      providerExecution,
      harvestRuns,
      collectorManifest,
      collectorRunPlan,
      snapshot,
      creativeSnapshot,
    }, { status: providerExecution.status === 'completed' ? 201 : 409 });
  }

  if (body.action === 'bootstrap-watchlist') {
    const result = await bootstrapCreativeMonitoringWatchlist(orgId, {
      projectId: body.projectId || 'default-project',
      category: typeof body.category === 'string' ? body.category : undefined,
      platform: typeof body.platform === 'string' ? body.platform : undefined,
      competitorAccounts: Array.isArray(body.competitorAccounts) ? body.competitorAccounts.map(String) : undefined,
      trendTargets: Array.isArray(body.trendTargets) ? body.trendTargets.map(String) : undefined,
      videoKeywords: Array.isArray(body.videoKeywords) ? body.videoKeywords.map(String) : undefined,
      cadenceHours: Number(body.cadenceHours),
    });
    const creativeSnapshot = await getCreativeIntelligenceSnapshot(orgId, result.projectId);
    const [collectorManifest, collectorRunPlan] = await Promise.all([
      getCreativeCollectorManifest(orgId, result.projectId),
      getCreativeCollectorRunPlan(orgId, result.projectId),
    ]);
    return NextResponse.json({ ok: true, ...result, collectorManifest, collectorRunPlan, creativeSnapshot }, { status: 201 });
  }

  if (body.action === 'configure-collector-adapter') {
    const projectId = body.projectId || 'default-project';
    const adapter = await upsertCreativeCollectorAdapter(orgId, {
      ...(body.collectorAdapter || {}),
      projectId,
    });
    const [snapshot, collectorManifest, collectorRunPlan] = await Promise.all([
      getCreativeMonitoringSnapshot(orgId, projectId),
      getCreativeCollectorManifest(orgId, projectId),
      getCreativeCollectorRunPlan(orgId, projectId),
    ]);
    return NextResponse.json({ ok: true, adapter, collectorManifest, collectorRunPlan, snapshot }, { status: 201 });
  }

  if (body.action === 'configure-source') {
    const projectId = body.projectId || 'default-project';
    const source = await upsertCreativeSource(orgId, {
      ...(body.source || {}),
      projectId,
    });
    const [sources, creativeSourceSnapshot, sourceSyncPlan, snapshot] = await Promise.all([
      listCreativeSources(orgId, projectId, 100),
      getCreativeSourceSnapshot(orgId, projectId),
      getCreativeSourceSyncPlan(orgId, projectId),
      getCreativeMonitoringSnapshot(orgId, projectId),
    ]);
    return NextResponse.json({ ok: true, source, creativeSources: sources, creativeSourceSnapshot, sourceSyncPlan, snapshot }, { status: 201 });
  }

  if (body.action === 'import-signal') {
    if (!body.signal?.monitorId || !body.signal.title || !body.signal.reusableAngle) {
      return NextResponse.json({
        error: 'creative_signal_required',
        message: '请提供监控项、观察标题和可复用创意角度。',
      }, { status: 400 });
    }
    const result = await importCreativeMonitorSignal(orgId, body.signal as Parameters<typeof importCreativeMonitorSignal>[1]);
    if (!result) return NextResponse.json({ error: 'monitor_not_found', message: '没有找到该创意监控项，请先补齐监控清单。' }, { status: 404 });
    const snapshot = await getCreativeMonitoringSnapshot(orgId, result.monitor.projectId);
    const creativeSnapshot = await getCreativeIntelligenceSnapshot(orgId, result.monitor.projectId);
    return NextResponse.json({ ok: true, ...result, snapshot, creativeSnapshot }, { status: 201 });
  }

  const monitor = await upsertCreativeMonitor(orgId, {
    ...(body.monitor || {}),
    projectId: body.projectId || (typeof body.monitor?.projectId === 'string' ? body.monitor.projectId : undefined) || 'default-project',
  });
  const snapshot = await getCreativeMonitoringSnapshot(orgId, monitor.projectId);
  return NextResponse.json({ ok: true, monitor, snapshot }, { status: 201 });
}

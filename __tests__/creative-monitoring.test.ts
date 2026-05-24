import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/creative-monitoring/route';
import {
  bootstrapCreativeMonitoringWatchlist,
  executeCreativeCollectorProviderRun,
  executeCreativeSourceProviderSync,
  getCreativeCollectorManifest,
  getCreativeCollectorRunPlan,
  getCreativeCollectorAdapterView,
  getCreativeSourceSnapshot,
  getCreativeSourceSyncPlan,
  getCreativeMonitoringSnapshot,
  getDueCreativeCollectionTasks,
  importCreativeMonitorSignal,
  listCreativeSourceSyncRuns,
  listCreativeSources,
  runCreativeSourceSync,
  runCreativeMonitoringHarvest,
  upsertCreativeCollectorAdapter,
  upsertCreativeSource,
  upsertCreativeMonitor,
} from '@/lib/creative-monitoring';
import { getCreativeIntelligenceSnapshot, listCreativeInsights } from '@/lib/creative-intelligence';
import { listContentAssets, listDistributionPlans } from '@/lib/industrial-chain-store';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('creative monitoring watchlist', () => {
  it('bootstraps account, ranking, and video teardown monitors for a category', async () => {
    const orgId = `creative-monitor-bootstrap-${Date.now()}`;
    const projectId = `monitor-bootstrap-${Date.now()}`;

    const result = await bootstrapCreativeMonitoringWatchlist(orgId, {
      projectId,
      category: 'travel storage',
      platform: 'TikTok Shop',
      competitorAccounts: ['@travel-competitor'],
      cadenceHours: 12,
    });

    expect(result.monitors).toHaveLength(3);
    expect(result.snapshot.competitorAccountMonitorCount).toBe(1);
    expect(result.snapshot.trendRankMonitorCount).toBe(1);
    expect(result.snapshot.videoKeywordMonitorCount).toBe(1);
    expect(result.dueTasks).toHaveLength(3);
    expect(result.dueTasks.map(task => task.type).sort()).toEqual(['competitor_account', 'trend_rank', 'video_keyword']);
    expect(result.dueTasks.find(task => task.type === 'video_keyword')?.evidenceSchema).toEqual(
      expect.arrayContaining(['sceneBeats', 'transcriptSummary', 'detectedObjects', 'audioCue', 'textOverlays']),
    );
    const manifest = await getCreativeCollectorManifest(orgId, projectId);
    expect(manifest).toHaveLength(3);
    expect(manifest[0]).toMatchObject({
      outputAction: 'ingest-collector-run',
      resultEndpoint: '/api/creative-monitoring',
      attempt: 1,
    });
    expect(manifest.some(target => target.priority === 'high' && target.type === 'video_keyword')).toBe(true);
    expect(manifest[0].complianceNotes.join(' ')).toContain('不生成伪洞察');
    const runPlan = await getCreativeCollectorRunPlan(orgId, projectId);
    expect(runPlan.targetCount).toBe(3);
    expect(runPlan.dispatchMode).toBe('manual_ops');
    expect(runPlan.providerReady).toBe(false);
    expect(runPlan.adapterStatus.missingLinks).toContain('Collector is still in manual-ops mode');
    expect(runPlan.highPriorityCount).toBeGreaterThanOrEqual(1);
    expect(runPlan.batchInstructions.join(' ')).toContain('不要伪造');
    expect(result.snapshot.missingLinks).not.toContain('Missing creative monitoring watchlist');
    expect(result.snapshot.collectorAdapterStatus).toBe('manual_ops');
    expect(result.snapshot.sourceCount).toBe(3);
    expect(result.snapshot.providerReadySourceCount).toBe(0);
    expect(result.snapshot.missingLinks).toContain('Missing provider-ready account tracking source');
    const sourceSnapshot = await getCreativeSourceSnapshot(orgId, projectId);
    expect(sourceSnapshot.manualReadySourceCount).toBe(3);
    expect(sourceSnapshot.sourceHealthCards).toHaveLength(3);
    expect(sourceSnapshot.sourceHealthCards.find(card => card.kind === 'account_tracking')).toMatchObject({
      readiness: 'needs_provider',
      providerReadySourceCount: 0,
      missingEvidence: expect.arrayContaining(['provider_ready_source']),
    });
  });

  it('tracks account, ranking, and video teardown sources separately from the collector adapter', async () => {
    const orgId = `creative-source-registry-${Date.now()}`;
    const projectId = `source-registry-${Date.now()}`;

    await upsertCreativeSource(orgId, {
      projectId,
      kind: 'account_tracking',
      platform: 'TikTok Shop',
      providerName: 'authorized-account-tracker',
      endpointConfigured: true,
      authConfigured: true,
      coverageTarget: '@competitor-a,@competitor-b',
      lastSyncAt: new Date().toISOString(),
    });
    await upsertCreativeSource(orgId, {
      projectId,
      kind: 'trend_rank',
      platform: 'TikTok Shop',
      providerName: 'authorized-rank-feed',
      endpointConfigured: true,
      authConfigured: true,
      coverageTarget: 'category top videos and ad library exports',
      lastSyncAt: new Date().toISOString(),
    });
    await upsertCreativeSource(orgId, {
      projectId,
      kind: 'video_teardown',
      platform: 'TikTok Shop',
      providerName: 'authorized-multimodal-parser',
      endpointConfigured: true,
      authConfigured: true,
      coverageTarget: 'public or licensed video samples',
      lastSyncAt: new Date().toISOString(),
    });

    const sources = await listCreativeSources(orgId, projectId);
    const sourceSnapshot = await getCreativeSourceSnapshot(orgId, projectId);
    expect(sources.map(source => source.kind).sort()).toEqual(['account_tracking', 'trend_rank', 'video_teardown']);
    expect(sourceSnapshot).toMatchObject({
      sourceCount: 3,
      providerReadySourceCount: 3,
      accountTrackingSourceReady: true,
      trendRankSourceReady: true,
      videoTeardownSourceReady: true,
    });
    expect(sourceSnapshot.sourceScaleScore).toBe(0);
    expect(sourceSnapshot.accountTrackingCoverageTargetCount).toBe(2);
    expect(sourceSnapshot.trendRankCoverageSignalCount).toBe(2);
    expect(sourceSnapshot.videoTeardownRepeatReady).toBe(false);
    expect(sourceSnapshot.sourceDepthScore).toBeLessThan(90);
    expect(sourceSnapshot.readySourceHealthCardCount).toBe(0);
    expect(sourceSnapshot.sourceHealthCards.find(card => card.kind === 'account_tracking')).toMatchObject({
      readiness: 'needs_coverage',
      coverageTargetCount: 2,
      missingEvidence: expect.arrayContaining(['coverage_depth', 'repeat_evidence']),
    });
    expect(sourceSnapshot.sourceHealthCards.find(card => card.kind === 'video_teardown')).toMatchObject({
      readiness: 'needs_repeat_evidence',
      providerReadySourceCount: 1,
      freshSourceCount: 1,
      observationCount: 0,
    });
    expect(sourceSnapshot.missingLinks).toEqual(expect.arrayContaining([
      'Account tracking source covers fewer than 3 competitor accounts',
      'Trend/rank source lacks rank, trend, ad-library, or seller-feed breadth',
      'Video teardown source lacks repeat parsed sample evidence',
      'Creative source observation volume below repeatable threshold',
      'Creative sources have not shown repeat observations across all core feeds',
      'Creative source depth score below commercial benchmark threshold',
    ]));
  });

  it('builds a provider source sync plan and treats stale provider feeds as collection gaps', async () => {
    const orgId = `creative-source-sync-plan-${Date.now()}`;
    const projectId = `source-sync-plan-${Date.now()}`;
    const staleSyncAt = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    await upsertCreativeSource(orgId, {
      projectId,
      kind: 'account_tracking',
      platform: 'TikTok Shop',
      providerName: 'authorized-account-tracker',
      endpointConfigured: true,
      authConfigured: true,
      coverageTarget: '@competitor-a,@competitor-b',
      lastSyncAt: staleSyncAt,
    });
    await upsertCreativeSource(orgId, {
      projectId,
      kind: 'trend_rank',
      platform: 'TikTok Shop',
      providerName: 'authorized-rank-feed',
      endpointConfigured: true,
      authConfigured: true,
      coverageTarget: 'category top videos',
      lastSyncAt: new Date().toISOString(),
    });
    await upsertCreativeSource(orgId, {
      projectId,
      kind: 'video_teardown',
      platform: 'TikTok Shop',
      providerName: 'authorized-multimodal-parser',
      endpointConfigured: true,
      authConfigured: true,
      coverageTarget: 'licensed video samples',
      lastSyncAt: staleSyncAt,
    });

    const plan = await getCreativeSourceSyncPlan(orgId, projectId);
    expect(plan.providerReadySourceCount).toBe(3);
    expect(plan.dueSourceCount).toBe(2);
    expect(plan.staleSourceCount).toBe(2);
    expect(plan.missingLinks).toContain('Provider creative sources are stale (2)');
    expect(plan.targets.find(target => target.kind === 'video_teardown')).toMatchObject({
      priority: 'high',
      requiredObservationType: 'video_keyword',
      syncCadenceHours: 72,
      stale: true,
    });
    expect(plan.targets.find(target => target.kind === 'video_teardown')?.evidenceSchema).toEqual(
      expect.arrayContaining(['sceneBeats', 'transcriptSummary', 'detectedObjects', 'audioCue', 'textOverlays']),
    );
    expect(plan.targets.find(target => target.kind === 'trend_rank')).toMatchObject({
      priority: 'low',
      requiredObservationType: 'trend_rank',
      stale: false,
    });

    const snapshot = await getCreativeMonitoringSnapshot(orgId, projectId);
    expect(snapshot.providerReadySourceCount).toBe(3);
    expect(snapshot.providerSourceFreshCount).toBe(1);
    expect(snapshot.missingLinks).toContain('Not all provider creative sources have fresh sync evidence');
  });

  it('executes stale creative source sync targets through a configured provider adapter without leaking tokens', async () => {
    const orgId = `creative-source-provider-exec-${Date.now()}`;
    const projectId = `source-provider-exec-${Date.now()}`;
    const staleSyncAt = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
    await bootstrapCreativeMonitoringWatchlist(orgId, {
      projectId,
      category: 'travel storage',
      platform: 'TikTok Shop',
      competitorAccounts: ['@provider-competitor'],
      trendTargets: ['travel storage rank'],
      videoKeywords: ['travel storage teardown'],
      cadenceHours: 12,
    });
    for (const kind of ['account_tracking', 'trend_rank', 'video_teardown'] as const) {
      await upsertCreativeSource(orgId, {
        projectId,
        kind,
        platform: 'TikTok Shop',
        providerName: `authorized-${kind}-provider`,
        endpointConfigured: true,
        authConfigured: true,
        coverageTarget: kind === 'account_tracking'
          ? '@provider-competitor'
          : kind === 'trend_rank'
            ? 'travel storage rank'
            : 'travel storage teardown',
        lastSyncAt: staleSyncAt,
      });
    }

    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetcher = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      return new Response(JSON.stringify({
        observations: [
          {
            type: 'competitor_account',
            platform: 'TikTok Shop',
            target: '@provider-competitor',
            title: 'Provider account hook',
            hookType: 'proof',
            pacing: 'fast',
            reusableAngle: 'Use account proof as the first-frame test without copying.',
            metrics: { views: 15000, sales: 24 },
          },
          {
            type: 'trend_rank',
            platform: 'TikTok Shop',
            target: 'travel storage rank',
            title: 'Provider rank hook',
            hookType: 'comparison',
            pacing: 'fast',
            reusableAngle: 'Use rank motion as the next comparison script seed.',
            metrics: { views: 26000, revenue: 5200 },
          },
          {
            type: 'video_keyword',
            platform: 'TikTok Shop',
            target: 'travel storage teardown',
            title: 'Provider multimodal teardown',
            hookType: 'demo',
            pacing: 'fast',
            reusableAngle: 'Use the beat order only and rebuild the expression.',
            sceneBeats: ['problem frame', 'proof result', 'product demo', 'CTA'],
            transcriptSummary: 'The provider extracted problem, proof, product, and CTA beats.',
            detectedObjects: ['storage bag', 'suitcase'],
            textOverlays: ['before', 'after'],
            metrics: { views: 48000, saves: 1300 },
          },
        ],
      }), { status: 200 });
    }) as unknown as typeof fetch;

    const execution = await executeCreativeSourceProviderSync(orgId, {
      projectId,
      providerEndpoint: 'https://provider.example.test/creative-source-sync',
      providerToken: 'provider-token-should-not-leak',
      providerName: 'authorized-source-provider',
      fetcher,
    });

    expect(execution.status).toBe('completed');
    expect(execution.targetCount).toBe(3);
    expect(execution.observationCount).toBe(3);
    expect(execution.importedInsightIds).toHaveLength(3);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://provider.example.test/creative-source-sync');
    expect(String(calls[0].init?.headers && JSON.stringify(calls[0].init.headers))).toContain('Bearer provider-token-should-not-leak');
    expect(String(calls[0].init?.body)).toContain('video_teardown');
    expect(String(calls[0].init?.body)).toContain('sceneBeats');
    expect(JSON.stringify(execution)).not.toContain('provider-token-should-not-leak');

    const snapshot = await getCreativeMonitoringSnapshot(orgId, projectId);
    expect(snapshot.providerSourceFreshCount).toBe(3);
    expect(snapshot.providerSourceFailureCount).toBe(0);
    expect(snapshot.sourceSyncAccountObservationCount).toBe(1);
    expect(snapshot.sourceSyncTrendRankObservationCount).toBe(1);
    expect(snapshot.sourceSyncVideoTeardownObservationCount).toBe(1);
    expect(snapshot.sourceSyncMultimodalParsedCount).toBe(1);
    expect(snapshot.sourceSyncCoverageScore).toBe(100);
    expect(snapshot.missingLinks).not.toContain('Not all provider creative sources have fresh sync evidence');
    expect(snapshot.missingLinks).not.toContain('Latest provider creative source sync did not cover account, trend/rank, and multimodal video signals');
  });

  it('executes due collector targets through a provider and materializes brand learning', async () => {
    const orgId = `creative-collector-provider-${Date.now()}`;
    const projectId = `collector-provider-${Date.now()}`;
    await bootstrapCreativeMonitoringWatchlist(orgId, {
      projectId,
      category: 'desk setup',
      platform: 'TikTok Shop',
      competitorAccounts: ['@desk-provider'],
      trendTargets: ['desk setup rank'],
      videoKeywords: ['desk setup teardown'],
      cadenceHours: 12,
    });
    await upsertCreativeCollectorAdapter(orgId, {
      projectId,
      mode: 'provider',
      providerName: 'authorized-collector-provider',
      endpointConfigured: true,
      authConfigured: true,
      supportedMonitorTypes: ['competitor_account', 'trend_rank', 'video_keyword'],
    });

    const blocked = await executeCreativeCollectorProviderRun(orgId, { projectId });
    expect(blocked.status).toBe('blocked');
    expect(blocked.blockedReasons).toEqual(expect.arrayContaining([
      'Creative collector provider endpoint is not configured.',
      'Creative collector provider token is not configured.',
    ]));

    const providerToken = 'collector-token-should-not-leak';
    const calls: Array<{ init?: RequestInit }> = [];
    const fetcher = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      calls.push({ init });
      const body = JSON.parse(String(init?.body || '{}')) as { targets: Array<{ monitorId: string; type: string; evidenceSchema: string[] }> };
      expect(init?.headers).toMatchObject({ Authorization: `Bearer ${providerToken}` });
      expect(body.targets).toHaveLength(3);
      expect(body.targets.find(target => target.type === 'video_keyword')?.evidenceSchema).toEqual(
        expect.arrayContaining(['sceneBeats', 'transcriptSummary', 'detectedObjects']),
      );
      return new Response(JSON.stringify({
        observations: body.targets.map(target => ({
          monitorId: target.monitorId,
          type: target.type,
          platform: 'TikTok Shop',
          target: target.type === 'competitor_account'
            ? '@desk-provider'
            : target.type === 'trend_rank'
              ? 'desk setup rank'
              : 'desk setup teardown',
          title: `${target.type} provider signal`,
          hookType: target.type === 'trend_rank' ? 'comparison' : 'proof',
          pacing: 'fast',
          reusableAngle: `Use ${target.type} structure as the next Wenai creative test without copying expression.`,
          sceneBeats: target.type === 'video_keyword' ? ['problem frame', 'proof result', 'product demo', 'CTA'] : undefined,
          transcriptSummary: target.type === 'video_keyword' ? 'Provider extracted a four-beat commercial teardown.' : undefined,
          detectedObjects: target.type === 'video_keyword' ? ['desk organizer', 'monitor stand'] : undefined,
          metrics: { views: 32000, saves: 900 },
        })),
      }), { status: 200 });
    }) as unknown as typeof fetch;

    const execution = await executeCreativeCollectorProviderRun(orgId, {
      projectId,
      providerEndpoint: 'https://provider.example.test/creative-collector-run',
      providerToken,
      fetcher,
    });

    expect(execution.status).toBe('completed');
    expect(execution.targetCount).toBe(3);
    expect(execution.observationCount).toBe(3);
    expect(execution.importedInsightIds).toHaveLength(3);
    expect(execution.brandLearningAssetIds).toHaveLength(2);
    expect(execution.brandLearningDistributionPlanId).toBeTruthy();
    expect(calls).toHaveLength(1);
    expect(JSON.stringify(execution)).not.toContain(providerToken);

    const insights = await listCreativeInsights(orgId, projectId);
    expect(insights).toHaveLength(3);
    const snapshot = await getCreativeMonitoringSnapshot(orgId, projectId);
    expect(snapshot.harvestRunCount).toBe(1);
    expect(snapshot.harvestedInsightCount).toBe(3);
    expect(snapshot.collectorProviderReady).toBe(true);
    expect(snapshot.missingLinks).not.toContain('Missing scheduled creative harvest run evidence');
  });

  it('serves collector provider execution through the API from server-side env only', async () => {
    const orgId = `creative-collector-api-${Date.now()}`;
    const projectId = `collector-api-${Date.now()}`;
    const headers = { 'x-tenant-id': orgId };
    const providerToken = 'collector-token-should-not-leak';
    vi.stubEnv('CREATIVE_COLLECTOR_PROVIDER_ENDPOINT', 'https://provider.example.test/creative-collector-run');
    vi.stubEnv('CREATIVE_COLLECTOR_PROVIDER_TOKEN', providerToken);

    await bootstrapCreativeMonitoringWatchlist(orgId, {
      projectId,
      category: 'kitchen organizer',
      platform: 'TikTok Shop',
      competitorAccounts: ['@kitchen-provider'],
      cadenceHours: 12,
    });
    await upsertCreativeCollectorAdapter(orgId, {
      projectId,
      mode: 'provider',
      providerName: 'authorized-collector-provider',
      endpointConfigured: true,
      authConfigured: true,
      supportedMonitorTypes: ['competitor_account', 'trend_rank', 'video_keyword'],
    });

    const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      expect(init?.headers).toMatchObject({ Authorization: `Bearer ${providerToken}` });
      const body = JSON.parse(String(init?.body || '{}')) as { targets: Array<{ monitorId: string; type: string }> };
      return new Response(JSON.stringify({
        observations: body.targets.map(target => ({
          monitorId: target.monitorId,
          type: target.type,
          platform: 'TikTok Shop',
          target: target.type === 'competitor_account' ? '@kitchen-provider' : 'kitchen organizer teardown',
          title: `${target.type} API provider signal`,
          hookType: 'proof',
          pacing: 'fast',
          reusableAngle: `Use ${target.type} as a provider-collected Wenai test angle.`,
          sceneBeats: target.type === 'video_keyword' ? ['before', 'proof', 'demo', 'CTA'] : undefined,
          transcriptSummary: target.type === 'video_keyword' ? 'Provider extracted a short commerce structure.' : undefined,
          metrics: { views: 18000, saves: 400 },
        })),
      }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const res = await POST(new Request('http://localhost/api/creative-monitoring', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'execute-collector-provider-run',
        projectId,
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.providerExecution.status).toBe('completed');
    expect(body.providerExecution.importedInsightIds.length).toBeGreaterThan(0);
    expect(body.providerExecution.brandLearningAssetIds).toHaveLength(2);
    expect(body.snapshot.harvestRunCount).toBe(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(body)).not.toContain(providerToken);
  });

  it('records provider source sync runs across account, ranking, and multimodal teardown sources', async () => {
    const orgId = `creative-source-sync-${Date.now()}`;
    const projectId = `source-sync-${Date.now()}`;
    await bootstrapCreativeMonitoringWatchlist(orgId, {
      projectId,
      category: 'travel storage',
      platform: 'TikTok Shop',
      competitorAccounts: ['@source-sync-competitor'],
      trendTargets: ['travel storage top videos'],
      videoKeywords: ['travel storage teardown'],
      cadenceHours: 12,
    });
    for (const kind of ['account_tracking', 'trend_rank', 'video_teardown'] as const) {
      await upsertCreativeSource(orgId, {
        projectId,
        kind,
        platform: 'TikTok Shop',
        providerName: `authorized-${kind}-feed`,
        endpointConfigured: true,
        authConfigured: true,
        coverageTarget: kind === 'account_tracking'
          ? '@source-sync-competitor'
          : kind === 'trend_rank'
            ? 'travel storage top videos'
            : 'travel storage teardown',
      });
    }

    const sourceSyncRun = await runCreativeSourceSync(orgId, {
      projectId,
      observations: [
        {
          type: 'competitor_account',
          platform: 'TikTok Shop',
          target: '@source-sync-competitor',
          title: 'Competitor account hook sync',
          hookType: 'proof',
          pacing: 'fast',
          reusableAngle: 'Use competitor proof structure as a non-copying Wenai hook test.',
          metrics: { views: 12000, sales: 18 },
        },
        {
          type: 'trend_rank',
          platform: 'TikTok Shop',
          target: 'travel storage top videos',
          title: 'Top ranked packing proof',
          hookType: 'comparison',
          pacing: 'fast',
          reusableAngle: 'Turn rank proof into a controlled comparison script.',
          metrics: { views: 24000, revenue: 3800 },
        },
        {
          type: 'video_keyword',
          platform: 'TikTok Shop',
          target: 'travel storage teardown',
          title: 'Travel storage multimodal teardown',
          hookType: 'demo',
          pacing: 'fast',
          reusableAngle: 'Reuse the scene order only: problem, proof, product, CTA.',
          sceneBeats: ['messy suitcase', 'packing cube close-up', 'organized result', 'CTA'],
          transcriptSummary: 'The video shows a messy suitcase before a fast organization proof.',
          detectedObjects: ['suitcase', 'packing cube'],
          textOverlays: ['before', 'after'],
          metrics: { views: 52000, saves: 1300 },
        },
      ],
    });

    expect(sourceSyncRun.status).toBe('completed');
    expect(sourceSyncRun.providerReadySourceCount).toBe(3);
    expect(sourceSyncRun.syncedSourceIds).toHaveLength(3);
    expect(sourceSyncRun.failedSourceIds).toEqual([]);
    expect(sourceSyncRun.accountObservationCount).toBe(1);
    expect(sourceSyncRun.trendRankObservationCount).toBe(1);
    expect(sourceSyncRun.videoTeardownObservationCount).toBe(1);
    expect(sourceSyncRun.multimodalParsedObservationCount).toBe(1);
    expect(sourceSyncRun.coverageKindCount).toBe(3);
    expect(sourceSyncRun.importedInsightIds).toHaveLength(3);
    expect(sourceSyncRun.harvestRunId).toBeTruthy();

    const secondSourceSyncRun = await runCreativeSourceSync(orgId, {
      projectId,
      now: new Date(Date.now() + 13 * 60 * 60 * 1000),
      observations: [
        {
          type: 'competitor_account',
          platform: 'TikTok Shop',
          target: '@source-sync-competitor',
          title: 'Competitor account follow-up hook sync',
          hookType: 'proof',
          pacing: 'fast',
          reusableAngle: 'Use the second account signal to validate the same proof-first structure.',
          metrics: { views: 16000, sales: 22 },
        },
        {
          type: 'trend_rank',
          platform: 'TikTok Shop',
          target: 'travel storage top videos',
          title: 'Second ranked packing proof',
          hookType: 'comparison',
          pacing: 'fast',
          reusableAngle: 'Use a second rank movement to validate the comparison angle.',
          metrics: { views: 28000, revenue: 4200 },
        },
        {
          type: 'video_keyword',
          platform: 'TikTok Shop',
          target: 'travel storage teardown',
          title: 'Second travel storage multimodal teardown',
          hookType: 'demo',
          pacing: 'fast',
          reusableAngle: 'Use the repeated beat order as evidence for the next remix batch.',
          sceneBeats: ['problem frame', 'proof result', 'product demo', 'CTA'],
          transcriptSummary: 'A second parser run extracted problem, proof, product, and CTA beats.',
          detectedObjects: ['travel bag', 'packing cube'],
          textOverlays: ['proof', 'shop'],
          metrics: { views: 56000, saves: 1400 },
        },
      ],
    });
    expect(secondSourceSyncRun.status).toBe('completed');

    const sourceSyncRuns = await listCreativeSourceSyncRuns(orgId, projectId);
    expect(sourceSyncRuns[0].id).toBe(secondSourceSyncRun.id);
    const snapshot = await getCreativeMonitoringSnapshot(orgId, projectId);
    expect(snapshot.sourceSyncRunCount).toBe(2);
    expect(snapshot.providerSourceFreshCount).toBe(3);
    expect(snapshot.providerSourceFailureCount).toBe(0);
    expect(snapshot.sourceSyncCoverageScore).toBe(100);
    expect(snapshot.creativeSourceObservationCount).toBe(6);
    expect(snapshot.creativeSourceRepeatObservationSourceCount).toBe(3);
    expect(snapshot.creativeSourceScaleScore).toBe(100);
    expect(snapshot.missingLinks).not.toContain('Missing provider creative source sync run evidence');
    expect(snapshot.missingLinks).not.toContain('Not all provider creative sources have fresh sync evidence');
    expect(snapshot.missingLinks).not.toContain('Latest provider creative source sync did not cover account, trend/rank, and multimodal video signals');
    expect(snapshot.missingLinks).not.toContain('Creative source observation volume below repeatable threshold');
    expect(snapshot.missingLinks).not.toContain('Creative sources have not shown repeat observations across all core feeds');
  });

  it('keeps source sync coverage incomplete until account, rank, and multimodal video observations all arrive', async () => {
    const orgId = `creative-source-coverage-gap-${Date.now()}`;
    const projectId = `source-coverage-gap-${Date.now()}`;
    await bootstrapCreativeMonitoringWatchlist(orgId, {
      projectId,
      category: 'travel storage',
      platform: 'TikTok Shop',
      competitorAccounts: ['@coverage-competitor'],
      trendTargets: ['travel storage rank'],
      videoKeywords: ['travel storage teardown'],
      cadenceHours: 12,
    });
    for (const kind of ['account_tracking', 'trend_rank', 'video_teardown'] as const) {
      await upsertCreativeSource(orgId, {
        projectId,
        kind,
        platform: 'TikTok Shop',
        providerName: `authorized-${kind}-feed`,
        endpointConfigured: true,
        authConfigured: true,
        coverageTarget: kind === 'account_tracking'
          ? '@coverage-competitor'
          : kind === 'trend_rank'
            ? 'travel storage rank'
            : 'travel storage teardown',
      });
    }

    const sourceSyncRun = await runCreativeSourceSync(orgId, {
      projectId,
      observations: [{
        type: 'video_keyword',
        platform: 'TikTok Shop',
        target: 'travel storage teardown',
        title: 'Video-only teardown',
        hookType: 'demo',
        pacing: 'fast',
        reusableAngle: 'Use only the beat order and rebuild all expression.',
        sceneBeats: ['problem', 'proof', 'product', 'CTA'],
        transcriptSummary: 'Parser extracted a four-beat video.',
        metrics: { views: 20000 },
      }],
    });

    expect(sourceSyncRun.status).toBe('partial');
    expect(sourceSyncRun.coverageKindCount).toBe(1);
    expect(sourceSyncRun.blockedReasons).toContain('Latest provider source sync did not cover account, trend/rank, and multimodal video teardown observations.');
    const snapshot = await getCreativeMonitoringSnapshot(orgId, projectId);
    expect(snapshot.sourceSyncCoverageScore).toBe(33);
    expect(snapshot.sourceSyncVideoTeardownObservationCount).toBe(1);
    expect(snapshot.sourceSyncMultimodalParsedCount).toBe(1);
    expect(snapshot.missingLinks).toContain('Latest provider creative source sync did not cover account, trend/rank, and multimodal video signals');
  });

  it('does not let one account observation mark unrelated account sources as synced', async () => {
    const orgId = `creative-source-target-gate-${Date.now()}`;
    const projectId = `source-target-gate-${Date.now()}`;
    await bootstrapCreativeMonitoringWatchlist(orgId, {
      projectId,
      category: 'travel storage',
      platform: 'TikTok Shop',
      competitorAccounts: ['@matched-competitor', '@unmatched-competitor'],
      cadenceHours: 12,
    });
    const matchedSource = await upsertCreativeSource(orgId, {
      projectId,
      kind: 'account_tracking',
      platform: 'TikTok Shop',
      providerName: 'authorized-account-feed',
      endpointConfigured: true,
      authConfigured: true,
      coverageTarget: '@matched-competitor',
    });
    const unmatchedSource = await upsertCreativeSource(orgId, {
      projectId,
      kind: 'account_tracking',
      platform: 'TikTok Shop',
      providerName: 'authorized-account-feed',
      endpointConfigured: true,
      authConfigured: true,
      coverageTarget: '@unmatched-competitor',
    });

    const sourceSyncRun = await runCreativeSourceSync(orgId, {
      projectId,
      observations: [{
        type: 'competitor_account',
        platform: 'TikTok Shop',
        target: '@matched-competitor',
        title: 'Matched account signal',
        hookType: 'proof',
        pacing: 'fast',
        reusableAngle: 'Only this account should refresh the matching source.',
        metrics: { views: 12000 },
      }],
    });

    expect(sourceSyncRun.status).toBe('partial');
    expect(sourceSyncRun.syncedSourceIds).toEqual([matchedSource.id]);
    expect(sourceSyncRun.failedSourceIds).toEqual([unmatchedSource.id]);
    expect(sourceSyncRun.blockedReasons).toContain(`Provider source account_tracking:${unmatchedSource.providerName} returned no observations.`);
    const sources = await listCreativeSources(orgId, projectId);
    expect(sources.find(source => source.id === matchedSource.id)?.totalObservationCount).toBe(1);
    expect(sources.find(source => source.id === unmatchedSource.id)?.totalObservationCount).toBe(0);
  });

  it('keeps provider source sync gaps visible instead of treating configured feeds as live data', async () => {
    const orgId = `creative-source-sync-gap-${Date.now()}`;
    const projectId = `source-sync-gap-${Date.now()}`;
    await bootstrapCreativeMonitoringWatchlist(orgId, {
      projectId,
      category: 'travel storage',
      platform: 'TikTok Shop',
      cadenceHours: 12,
    });
    await upsertCreativeSource(orgId, {
      projectId,
      kind: 'video_teardown',
      platform: 'TikTok Shop',
      providerName: 'authorized-video-parser',
      endpointConfigured: true,
      authConfigured: true,
      coverageTarget: 'licensed video teardown samples',
    });

    const sourceSyncRun = await runCreativeSourceSync(orgId, {
      projectId,
      observations: [],
    });

    expect(sourceSyncRun.status).toBe('blocked');
    expect(sourceSyncRun.failedSourceIds).toHaveLength(1);
    expect(sourceSyncRun.importedInsightIds).toEqual([]);
    expect(sourceSyncRun.blockedReasons[0]).toContain('returned no observations');
    const snapshot = await getCreativeMonitoringSnapshot(orgId, projectId);
    expect(snapshot.sourceSyncRunCount).toBe(1);
    expect(snapshot.providerSourceFreshCount).toBe(0);
    expect(snapshot.providerSourceFailureCount).toBe(1);
    expect(snapshot.missingLinks).toContain('Not all provider creative sources have fresh sync evidence');
    expect(snapshot.missingLinks).toContain('Provider creative source sync failures (1)');
  });

  it('tracks collector adapter readiness without pretending provider automation is configured', async () => {
    const orgId = `creative-collector-adapter-${Date.now()}`;
    const projectId = `collector-adapter-${Date.now()}`;
    await bootstrapCreativeMonitoringWatchlist(orgId, {
      projectId,
      category: 'travel storage',
      platform: 'TikTok Shop',
      cadenceHours: 12,
    });

    const manual = await getCreativeCollectorAdapterView(orgId, projectId);
    expect(manual.status).toBe('manual_ops');
    expect(manual.providerReady).toBe(false);
    expect(manual.missingLinks).toContain('Collector is still in manual-ops mode');

    await upsertCreativeCollectorAdapter(orgId, {
      projectId,
      mode: 'provider',
      providerName: 'authorized-video-rank-collector',
      endpointConfigured: true,
      authConfigured: false,
      supportedMonitorTypes: ['competitor_account', 'trend_rank', 'video_keyword'],
    });
    const notConfigured = await getCreativeCollectorAdapterView(orgId, projectId);
    expect(notConfigured.status).toBe('not_configured');
    expect(notConfigured.missingLinks).toContain('Missing collector provider auth');

    await upsertCreativeCollectorAdapter(orgId, {
      projectId,
      mode: 'provider',
      providerName: 'authorized-video-rank-collector',
      endpointConfigured: true,
      authConfigured: true,
      supportedMonitorTypes: ['competitor_account', 'trend_rank', 'video_keyword'],
      lastHeartbeatAt: new Date().toISOString(),
    });
    const ready = await getCreativeCollectorAdapterView(orgId, projectId);
    expect(ready.status).toBe('provider_ready');
    expect(ready.providerReady).toBe(true);
    expect(ready.missingLinks).toEqual([]);

    const runPlan = await getCreativeCollectorRunPlan(orgId, projectId);
    expect(runPlan.dispatchMode).toBe('provider');
    expect(runPlan.providerReady).toBe(true);
    expect(runPlan.batchInstructions[0]).toContain('authorized-video-rank-collector');

    const snapshot = await getCreativeMonitoringSnapshot(orgId, projectId);
    expect(snapshot.collectorAdapterStatus).toBe('provider_ready');
    expect(snapshot.collectorProviderReady).toBe(true);
    expect(snapshot.missingLinks).not.toContain('Collector provider is not ready');
  });

  it('tracks competitor and trend monitors and emits due collection tasks', async () => {
    const orgId = `creative-monitor-${Date.now()}`;
    const projectId = `monitor-project-${Date.now()}`;
    await upsertCreativeMonitor(orgId, {
      projectId,
      type: 'competitor_account',
      platform: 'TikTok Shop',
      target: '@competitor',
      cadenceHours: 12,
      nextCheckAt: new Date(Date.now() - 1000).toISOString(),
    });
    await upsertCreativeMonitor(orgId, {
      projectId,
      type: 'trend_rank',
      platform: 'TikTok Shop',
      target: 'storage category top videos',
      cadenceHours: 24,
      nextCheckAt: new Date(Date.now() - 1000).toISOString(),
    });
    await upsertCreativeMonitor(orgId, {
      projectId,
      type: 'video_keyword',
      platform: 'TikTok Shop',
      target: 'storage organizer viral teardown',
      cadenceHours: 24,
      nextCheckAt: new Date(Date.now() - 1000).toISOString(),
    });

    const tasks = await getDueCreativeCollectionTasks(orgId, projectId);
    expect(tasks).toHaveLength(3);
    expect(tasks[0].acceptance).toContain('structured creative insight');
    expect(tasks[0]).toMatchObject({
      ownerRole: 'creative-ops',
      status: 'due',
      resultEndpoint: '/api/creative-monitoring',
      brandLearningAction: 'auto_materialize_after_import',
    });

    const run = await runCreativeMonitoringHarvest(orgId, {
      projectId,
      observations: [
        {
          type: 'competitor_account',
          platform: 'TikTok Shop',
          target: '@competitor',
          title: 'Competitor account proof demo',
          hookType: 'proof',
          pacing: 'fast',
          reusableAngle: 'Start with visible proof, then rebuild the product demo in Wenai brand language.',
          metrics: { views: 18000, sales: 66 },
        },
        {
          type: 'trend_rank',
          platform: 'TikTok Shop',
          target: 'storage category top videos',
          title: 'Ranked storage comparison',
          hookType: 'comparison',
          pacing: 'fast',
          reusableAngle: 'Turn category rank proof into a three-scene comparison script.',
          metrics: { views: 26000, revenue: 7400 },
        },
        {
          type: 'video_keyword',
          platform: 'TikTok Shop',
          target: 'storage organizer viral teardown',
          title: 'Viral organizer teardown',
          hookType: 'demo',
          pacing: 'fast',
          reusableAngle: 'Reuse the beat order only: problem, proof, product, CTA.',
          proofPoint: 'Before/after result appears by second two.',
          cta: 'Shop the organizer set.',
          metrics: { views: 41000, saves: 1300 },
          teardown: {
            openingHook: 'Messy shelf appears before product reveal.',
            sceneBeats: ['messy shelf', 'product in hand', 'organized result', 'CTA overlay'],
            proofMoment: 'Organized result is the second beat.',
            productMoment: 'Product enters immediately after problem frame.',
            ctaMoment: 'CTA overlay after proof result.',
            visualRhythm: 'fast cuts with early proof',
            textOverlays: ['before', 'after', 'shop'],
            complianceNotes: ['Do not copy footage or on-screen phrasing.'],
          },
        },
      ],
    });
    expect(run.importedInsightIds).toHaveLength(3);
    expect(run.brandLearningAssetIds).toHaveLength(2);
    expect(run.brandLearningDistributionPlanId).toBeTruthy();

    const snapshot = await getCreativeMonitoringSnapshot(orgId, projectId);
    expect(snapshot.monitorCount).toBe(3);
    expect(snapshot.activeMonitorCount).toBe(3);
    expect(snapshot.competitorAccountMonitorCount).toBe(1);
    expect(snapshot.trendRankMonitorCount).toBe(1);
    expect(snapshot.videoKeywordMonitorCount).toBe(1);
    expect(snapshot.harvestRunCount).toBe(1);
    expect(snapshot.harvestedInsightCount).toBe(3);
    expect(snapshot.collectorTargetCount).toBe(0);
    expect(snapshot.missingLinks).toEqual(expect.arrayContaining([
      'Collector provider is not ready',
      'Missing provider-ready account tracking source',
      'Missing provider-ready trend/rank source',
      'Missing provider-ready multimodal video teardown source',
    ]));
    expect(snapshot.collectorProviderReady).toBe(false);
  });

  it('imports a monitored signal into creative intelligence and advances next check', async () => {
    const orgId = `creative-monitor-import-${Date.now()}`;
    const projectId = `monitor-import-${Date.now()}`;
    const monitor = await upsertCreativeMonitor(orgId, {
      projectId,
      type: 'competitor_account',
      platform: 'TikTok Shop',
      target: '@competitor',
      cadenceHours: 24,
      nextCheckAt: new Date(Date.now() - 1000).toISOString(),
    });

    const result = await importCreativeMonitorSignal(orgId, {
      monitorId: monitor.id,
      title: 'Competitor hook with proof demo',
      hookType: 'proof',
      pacing: 'fast',
      reusableAngle: 'Open with the proof result, then show the SKU in use without copying the original expression.',
      metrics: { views: 22000, sales: 90 },
    });

    expect(result?.insight.source).toBe('competitor-account');
    expect(result?.monitor.lastImportedInsightId).toBe(result?.insight.id);
    expect(Date.parse(result!.monitor.nextCheckAt)).toBeGreaterThan(Date.now());
    const creativeSnapshot = await getCreativeIntelligenceSnapshot(orgId, projectId);
    expect(creativeSnapshot.insightCount).toBe(1);
    expect(creativeSnapshot.topHookType).toBe('proof');
  });

  it('runs scheduled harvest batches and turns video keyword observations into teardowns', async () => {
    const orgId = `creative-monitor-harvest-${Date.now()}`;
    const projectId = `monitor-harvest-${Date.now()}`;
    await upsertCreativeMonitor(orgId, {
      projectId,
      type: 'video_keyword',
      platform: 'TikTok Shop',
      target: 'packing cube teardown',
      cadenceHours: 6,
      nextCheckAt: new Date(Date.now() - 1000).toISOString(),
    });

    const run = await runCreativeMonitoringHarvest(orgId, {
      projectId,
      observations: [{
        type: 'video_keyword',
        platform: 'TikTok Shop',
        target: 'packing cube teardown',
        title: 'Packing cube viral proof teardown',
        hookType: 'question',
        pacing: 'fast',
        proofPoint: 'Shows packed suitcase result in the first two seconds.',
        cta: 'Tap to pick the travel set.',
        sceneBeats: ['question frame', 'packed suitcase proof', 'product close-up', 'CTA'],
        transcriptSummary: 'Can this packing cube fit a weekend trip?',
        detectedObjects: ['packing cube', 'suitcase', 'travel set'],
        audioCue: 'fast upbeat sound with proof beat',
        textOverlays: ['weekend trip', 'fits more', 'tap to shop'],
        reusableAngle: 'Open with the packing question, show result proof, then rebuild the CTA for our offer.',
        metrics: { views: 88000, likes: 4100, saves: 900 },
      }],
    });

    expect(run.dueTaskCount).toBe(1);
    expect(run.importedInsightIds).toHaveLength(1);
    expect(run.brandLearningAssetIds).toHaveLength(2);
    expect(run.brandLearningDistributionPlanId).toBeTruthy();
    expect(run.blockedReasons).toEqual([]);
    const creativeSnapshot = await getCreativeIntelligenceSnapshot(orgId, projectId);
    expect(creativeSnapshot.teardownCount).toBe(1);
    const [insight] = await listCreativeInsights(orgId, projectId);
    expect(insight.teardown?.openingHook).toContain('packing cube');
    expect(insight.teardown?.sceneBeats).toContain('packed suitcase proof');
    expect(insight.teardown?.audioCue).toContain('upbeat');
    expect(insight.teardown?.textOverlays).toContain('tap to shop');
    expect(creativeSnapshot.missingLinks).toContain('Missing competitor account tracking signal');
    expect(creativeSnapshot.missingLinks).toContain('Missing trend/rank benchmark signal');
    expect(creativeSnapshot.missingLinks).not.toContain('Missing structured video teardown signal');
  });

  it('records due harvest gaps instead of fabricating observations', async () => {
    const orgId = `creative-monitor-gap-${Date.now()}`;
    const projectId = `monitor-gap-${Date.now()}`;
    const monitor = await upsertCreativeMonitor(orgId, {
      projectId,
      type: 'competitor_account',
      platform: 'TikTok Shop',
      target: '@gap-competitor',
      cadenceHours: 6,
      nextCheckAt: new Date(Date.now() - 1000).toISOString(),
    });

    const run = await runCreativeMonitoringHarvest(orgId, {
      projectId,
      observations: [],
    });

    expect(run.dueTaskCount).toBe(1);
    expect(run.importedInsightIds).toEqual([]);
    expect(run.missingObservationMonitorIds).toEqual([monitor.id]);
    expect(run.blockedReasons[0]).toContain('@gap-competitor');

    const creativeSnapshot = await getCreativeIntelligenceSnapshot(orgId, projectId);
    expect(creativeSnapshot.insightCount).toBe(0);
    const snapshot = await getCreativeMonitoringSnapshot(orgId, projectId);
    expect(snapshot.harvestRunCount).toBe(1);
    expect(snapshot.harvestedInsightCount).toBe(0);
    expect(snapshot.collectorTargetCount).toBe(1);
    expect(run.brandLearningAssetIds).toEqual([]);
    const retryPlan = await getCreativeCollectorRunPlan(orgId, projectId);
    expect(retryPlan.retryTargetCount).toBe(1);
    expect(retryPlan.targets[0]).toMatchObject({
      monitorId: monitor.id,
      attempt: 2,
      priority: 'medium',
    });
  });

  it('auto-materializes monitored harvest insights into brand learning assets and distribution rules', async () => {
    const orgId = `creative-monitor-brand-learning-${Date.now()}`;
    const projectId = `monitor-brand-learning-${Date.now()}`;
    await upsertCreativeMonitor(orgId, {
      projectId,
      type: 'trend_rank',
      platform: 'TikTok Shop',
      target: 'home storage top sellers',
      cadenceHours: 12,
      nextCheckAt: new Date(Date.now() - 1000).toISOString(),
    });

    const run = await runCreativeMonitoringHarvest(orgId, {
      projectId,
      observations: [{
        type: 'trend_rank',
        platform: 'TikTok Shop',
        target: 'home storage top sellers',
        title: 'Top seller proof-first ranking',
        hookType: 'proof',
        pacing: 'fast',
        reusableAngle: 'Use ranking proof as the first-frame trust signal, then rebuild the script for our SKU.',
        metrics: { views: 56000, sales: 140, revenue: 9200 },
      }],
    });

    expect(run.importedInsightIds).toHaveLength(1);
    expect(run.brandLearningAssetIds).toHaveLength(2);
    const assets = await listContentAssets(orgId, projectId, 20);
    expect(assets.some(asset => asset.source === 'brand-learning-profile' && asset.type === 'report')).toBe(true);
    expect(assets.some(asset => asset.source === 'brand-learning-profile' && asset.type === 'script')).toBe(true);
    const plans = await listDistributionPlans(orgId, projectId, 20);
    expect(plans.some(plan => plan.id === run.brandLearningDistributionPlanId)).toBe(true);
    expect(plans[0].returnMetric).toContain('brand_learning_profile');
  });

  it('serves monitor creation, due tasks, and signal imports through the API', async () => {
    const orgId = `creative-monitor-api-${Date.now()}`;
    const headers = { 'x-org-id': orgId };
    const projectId = 'creative-monitor-api-project';
    const createRes = await POST(new Request('http://localhost/api/creative-monitoring', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        projectId,
        monitor: {
          type: 'trend_rank',
          platform: 'TikTok Shop',
          target: 'travel storage rank',
          nextCheckAt: new Date(Date.now() - 1000).toISOString(),
        },
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const createBody = await createRes.json();
    expect(createRes.status).toBe(201);
    expect(createBody.snapshot.dueTaskCount).toBe(1);

    const bootstrapRes = await POST(new Request('http://localhost/api/creative-monitoring', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'bootstrap-watchlist',
        projectId,
        category: 'travel storage',
        platform: 'TikTok Shop',
        competitorAccounts: ['@travel-competitor'],
        cadenceHours: 12,
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const bootstrapBody = await bootstrapRes.json();
    expect(bootstrapRes.status).toBe(201);
    expect(bootstrapBody.monitors).toHaveLength(3);
    expect(bootstrapBody.dueTasks.length).toBeGreaterThanOrEqual(3);
    expect(bootstrapBody.collectorManifest.length).toBeGreaterThanOrEqual(3);
    expect(bootstrapBody.collectorManifest[0].outputAction).toBe('ingest-collector-run');
    expect(bootstrapBody.collectorRunPlan.targetCount).toBeGreaterThanOrEqual(3);
    expect(bootstrapBody.collectorRunPlan.highPriorityCount).toBeGreaterThanOrEqual(1);
    expect(bootstrapBody.snapshot.videoKeywordMonitorCount).toBeGreaterThanOrEqual(1);

    const importRes = await POST(new Request('http://localhost/api/creative-monitoring', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'import-signal',
        signal: {
          monitorId: createBody.monitor.id,
          title: 'Ranked travel storage proof',
          hookType: 'comparison',
          pacing: 'medium',
          reusableAngle: 'Compare messy packing versus organized packing in the first three seconds.',
          metrics: { views: 12000, revenue: 3000 },
        },
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const importBody = await importRes.json();
    expect(importRes.status).toBe(201);
    expect(importBody.creativeSnapshot.trendRankCount).toBe(1);

    const missingSignalRes = await POST(new Request('http://localhost/api/creative-monitoring', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'import-signal',
        signal: { monitorId: createBody.monitor.id, title: 'Incomplete signal' },
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const missingSignalBody = await missingSignalRes.json();
    expect(missingSignalRes.status).toBe(400);
    expect(missingSignalBody.message).toContain('可复用创意角度');

    const missingMonitorRes = await POST(new Request('http://localhost/api/creative-monitoring', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'import-signal',
        signal: {
          monitorId: 'missing-monitor',
          title: 'Missing monitor signal',
          reusableAngle: 'Use the structure only.',
        },
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const missingMonitorBody = await missingMonitorRes.json();
    expect(missingMonitorRes.status).toBe(404);
    expect(missingMonitorBody.message).toContain('没有找到该创意监控项');

    const harvestMonitorRes = await POST(new Request('http://localhost/api/creative-monitoring', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        projectId,
        monitor: {
          type: 'video_keyword',
          platform: 'TikTok Shop',
          target: 'travel storage teardown',
          nextCheckAt: new Date(Date.now() - 1000).toISOString(),
        },
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const harvestMonitorBody = await harvestMonitorRes.json();
    const harvestRes = await POST(new Request('http://localhost/api/creative-monitoring', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'ingest-collector-run',
        projectId,
        observations: [{
          monitorId: harvestMonitorBody.monitor.id,
          title: 'Travel storage teardown proof',
          hookType: 'proof',
          pacing: 'fast',
          reusableAngle: 'Use proof-first travel packing order without copying the source.',
          proofPoint: 'Shows packed bag result before product explanation.',
          sceneBeats: ['packed bag proof', 'zipper close-up', 'CTA overlay'],
          transcriptSummary: 'Packed bag proof before product explanation.',
          textOverlays: ['packed', 'proof'],
          metrics: { views: 34000, saves: 800 },
        }],
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const harvestBody = await harvestRes.json();
    expect(harvestRes.status).toBe(201);
    expect(harvestBody.run.importedInsightIds).toHaveLength(1);
    expect(harvestBody.run.brandLearningAssetIds).toHaveLength(2);
    expect(harvestBody.collectorManifest.length).toBeGreaterThanOrEqual(0);
    expect(harvestBody.creativeSnapshot.teardownCount).toBe(1);

    const adapterRes = await POST(new Request('http://localhost/api/creative-monitoring', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'configure-collector-adapter',
        projectId,
        collectorAdapter: {
          mode: 'provider',
          providerName: 'authorized-video-rank-collector',
          endpointConfigured: true,
          authConfigured: true,
          supportedMonitorTypes: ['competitor_account', 'trend_rank', 'video_keyword'],
        },
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const adapterBody = await adapterRes.json();
    expect(adapterRes.status).toBe(201);
    expect(adapterBody.adapter.status).toBe('provider_ready');
    expect(adapterBody.collectorRunPlan.providerReady).toBe(true);
    expect(adapterBody.snapshot.collectorProviderReady).toBe(true);

    const sourceKinds = ['account_tracking', 'trend_rank', 'video_teardown'];
    for (const kind of sourceKinds) {
      const sourceRes = await POST(new Request('http://localhost/api/creative-monitoring', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'configure-source',
          projectId,
          source: {
            kind,
            platform: 'TikTok Shop',
            providerName: `authorized-${kind}-source`,
            endpointConfigured: true,
            authConfigured: true,
            coverageTarget: kind === 'account_tracking'
              ? '@travel-competitor'
              : kind === 'trend_rank'
                ? 'travel storage top videos'
                : 'travel storage viral teardown',
            lastSyncAt: new Date().toISOString(),
          },
        }),
      }) as unknown as Parameters<typeof POST>[0]);
      const sourceBody = await sourceRes.json();
      expect(sourceRes.status).toBe(201);
      expect(sourceBody.source.status).toBe('provider_ready');
    }

    const emptyCollectorRes = await POST(new Request('http://localhost/api/creative-monitoring', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'ingest-collector-run',
        projectId,
        observations: [],
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const emptyCollectorBody = await emptyCollectorRes.json();
    expect(emptyCollectorRes.status).toBe(400);
    expect(emptyCollectorBody.error).toBe('collector_observations_required');
    expect(emptyCollectorBody.message).toContain('空结果只能通过到期结算记录为缺口');

    const providerBlockedRes = await POST(new Request('http://localhost/api/creative-monitoring', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'execute-source-provider-sync',
        projectId,
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const providerBlockedBody = await providerBlockedRes.json();
    expect(providerBlockedRes.status).toBe(409);
    expect(providerBlockedBody.ok).toBe(false);
    expect(providerBlockedBody.providerExecution.status).toBe('blocked');
    expect(providerBlockedBody.providerExecution.blockedReasons).toContain('Creative source provider endpoint or token is not configured.');
    expect(JSON.stringify(providerBlockedBody)).not.toContain('provider-token-should-not-leak');

    const gapHarvestRes = await POST(new Request('http://localhost/api/creative-monitoring', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'run-harvest',
        projectId,
        observations: [],
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const gapHarvestBody = await gapHarvestRes.json();
    expect(gapHarvestRes.status).toBe(201);
    expect(gapHarvestBody.run.importedInsightIds).toEqual([]);

    const sourceSyncRes = await POST(new Request('http://localhost/api/creative-monitoring', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'run-source-sync',
        projectId,
        observations: [
          {
            type: 'competitor_account',
            platform: 'TikTok Shop',
            target: '@travel-competitor',
            title: 'Source sync account proof',
            hookType: 'proof',
            pacing: 'fast',
            reusableAngle: 'Turn account proof into a Wenai-owned opening hook.',
            metrics: { views: 19000, sales: 40 },
          },
          {
            type: 'trend_rank',
            platform: 'TikTok Shop',
            target: 'travel storage top videos',
            title: 'Source sync rank proof',
            hookType: 'comparison',
            pacing: 'fast',
            reusableAngle: 'Use the ranking signal as a comparison script seed.',
            metrics: { views: 25000, revenue: 5100 },
          },
          {
            type: 'video_keyword',
            platform: 'TikTok Shop',
            target: 'travel storage viral teardown',
            title: 'Source sync video teardown',
            hookType: 'demo',
            pacing: 'fast',
            reusableAngle: 'Use the beat order only and rebuild all copy and footage.',
            sceneBeats: ['problem frame', 'product proof', 'organized result', 'CTA'],
            transcriptSummary: 'Problem frame moves into product proof and a CTA.',
            metrics: { views: 44000, saves: 1200 },
          },
        ],
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const sourceSyncBody = await sourceSyncRes.json();
    expect(sourceSyncRes.status).toBe(201);
    expect(sourceSyncBody.sourceSyncRun.providerReadySourceCount).toBe(3);
    expect(sourceSyncBody.sourceSyncRun.syncedSourceIds).toHaveLength(3);
    expect(sourceSyncBody.sourceSyncRun.importedInsightIds.length).toBeGreaterThanOrEqual(3);
    expect(sourceSyncBody.snapshot.sourceSyncRunCount).toBe(1);
    expect(sourceSyncBody.snapshot.providerSourceFailureCount).toBe(0);
    expect(sourceSyncBody.sourceSyncPlan.providerReadySourceCount).toBe(3);
    expect(sourceSyncBody.sourceSyncPlan.dueSourceCount).toBe(0);

    const getRes = await GET(new Request(`http://localhost/api/creative-monitoring?projectId=${projectId}`, {
      headers,
    }) as unknown as Parameters<typeof GET>[0]);
    const getBody = await getRes.json();
    expect(getBody.monitors.length).toBeGreaterThanOrEqual(5);
    expect(getBody.collectorManifest.length).toBeGreaterThanOrEqual(0);
    expect(getBody.collectorRunPlan.targetCount).toBe(getBody.collectorManifest.length);
    expect(getBody.creativeSourceSnapshot.providerReadySourceCount).toBe(3);
    expect(getBody.sourceSyncPlan.providerReadySourceCount).toBe(3);
    expect(getBody.sourceSyncPlan.targets.length).toBe(3);
    expect(getBody.sourceSyncPlan.targets.some((target: { kind: string; requiredObservationType: string }) => target.kind === 'video_teardown' && target.requiredObservationType === 'video_keyword')).toBe(true);
    expect(getBody.creativeSources.length).toBeGreaterThanOrEqual(3);
    expect(getBody.sourceSyncRuns).toHaveLength(1);
    expect(getBody.harvestRuns.length).toBeGreaterThanOrEqual(3);
    expect(getBody.snapshot.importedInsightCount).toBeGreaterThanOrEqual(5);
    expect(getBody.snapshot.competitorAccountMonitorCount).toBeGreaterThanOrEqual(1);
    expect(getBody.snapshot.videoKeywordMonitorCount).toBeGreaterThanOrEqual(1);
  });
});

import { describe, expect, it } from 'vitest';
import { GET, POST } from '@/app/api/creative-intelligence/route';
import {
  addCreativeInsight,
  applyCreativeIntelligenceToIndustrialChain,
  getCreativeIntelligenceSnapshot,
} from '@/lib/creative-intelligence';
import {
  getIndustrializationSnapshot,
  listContentAssets,
  listDistributionDispatches,
  listDistributionPlans,
} from '@/lib/industrial-chain-store';
import { upsertChannelAccount } from '@/lib/channel-account-ledger';

describe('creative intelligence ledger', () => {
  it('turns competitor and trend signals into a reusable brand learning snapshot', async () => {
    const orgId = `creative-ledger-${Date.now()}`;
    const projectId = `creative-${Date.now()}`;
    await addCreativeInsight(orgId, {
      projectId,
      source: 'competitor-account',
      platform: 'TikTok Shop',
      account: 'storage competitor',
      title: 'fast demo hook',
      hookType: 'demo',
      pacing: 'fast',
      reusableAngle: 'Open with a cluttered drawer, then reveal the product in one movement.',
      metrics: { views: 13000, sales: 996, revenue: 18300 },
      riskNotes: ['Do not copy the same opening line.'],
    });
    await addCreativeInsight(orgId, {
      projectId,
      source: 'trend-rank',
      platform: 'TikTok Shop',
      title: 'ranked comparison hook',
      hookType: 'comparison',
      pacing: 'fast',
      reusableAngle: 'Compare cheap, popular, and premium options before showing the SKU.',
      metrics: { views: 8000, sales: 240, revenue: 6200 },
    });
    await addCreativeInsight(orgId, {
      projectId,
      source: 'video-teardown',
      platform: 'TikTok Shop',
      title: 'viral drawer teardown',
      hookType: 'proof',
      pacing: 'fast',
      reusableAngle: 'Use the same proof-first sequence but rebuild scenes, claim language, and product evidence for this SKU.',
      metrics: { views: 21000, sales: 380, revenue: 9400 },
      teardown: {
        openingHook: 'Shows the messy drawer and proof result inside the first second.',
        sceneBeats: ['messy before', 'single product demo', 'organized after', 'CTA overlay'],
        proofMoment: 'Before/after result is visible before the product claim.',
        productMoment: 'Product enters during the second beat.',
        ctaMoment: 'Shop link callout after proof.',
        textOverlays: ['before', 'after', 'shop now'],
        complianceNotes: ['Do not reuse the same shots or phrasing.'],
      },
    });

    const snapshot = await getCreativeIntelligenceSnapshot(orgId, projectId);
    expect(snapshot.insightCount).toBe(3);
    expect(snapshot.competitorAccountCount).toBe(1);
    expect(snapshot.trendRankCount).toBe(1);
    expect(snapshot.teardownCount).toBe(1);
    expect(snapshot.topPacing).toBe('fast');
    expect(snapshot.totalRevenue).toBe(33900);
    expect(snapshot.brandLearningProfile.nextTestAngles).toHaveLength(3);
    expect(snapshot.opportunityCount).toBe(3);
    expect(snapshot.averageConfidenceScore).toBeGreaterThan(50);
    expect(snapshot.patternClusterCount).toBe(1);
    expect(snapshot.crossSourcePatternCount).toBe(1);
    expect(snapshot.creativeMoatScore).toBeGreaterThanOrEqual(60);
    expect(snapshot.opportunityBacklogCount).toBe(1);
    expect(snapshot.readyOpportunityCount).toBe(1);
    expect(snapshot.patternClusters[0]).toMatchObject({
      platform: 'TikTok Shop',
      pacing: 'fast',
      sourceMix: expect.arrayContaining(['competitor-account', 'trend-rank', 'video-teardown']),
    });
    expect(snapshot.opportunityBacklog[0]).toMatchObject({
      priority: 'P0',
      readiness: 'ready_to_produce',
      platform: 'TikTok Shop',
      sourceMix: expect.arrayContaining(['competitor-account', 'trend-rank', 'video-teardown']),
      missingEvidence: [],
    });
    expect(snapshot.opportunityBacklog[0].acceptance).toContain('Create a Wenai-owned variant');
    expect(snapshot.patternClusters[0].distributionTest).toContain('cluster_id=');
    expect(snapshot.opportunityMap[0]).toMatchObject({
      funnelStage: 'proof_test',
      primaryMetric: 'orders / revenue / creative_insight_id',
    });
    expect(snapshot.opportunityMap[0].productionInstruction).toContain('Wenai-owned assets');
    expect(snapshot.opportunityMap[0].complianceBoundary).toContain('copy');
    expect(snapshot.missingLinks).toEqual([]);
  });

  it('applies creative intelligence into benchmark, script, and draft distribution assets', async () => {
    const orgId = `creative-apply-${Date.now()}`;
    const projectId = `apply-${Date.now()}`;
    await addCreativeInsight(orgId, {
      projectId,
      source: 'competitor-account',
      platform: 'Instagram Reels',
      title: 'before after shelf reel',
      hookType: 'shock',
      pacing: 'fast',
      reusableAngle: 'Start with a messy before frame and cut to the organized result at second two.',
      metrics: { views: 50000, likes: 1200 },
    });

    const application = await applyCreativeIntelligenceToIndustrialChain(orgId, projectId);
    expect(application?.benchmarkAsset.type).toBe('benchmark');
    expect(application?.scriptAsset.type).toBe('script');
    expect(application?.distributionPlan?.status).toBe('draft');
    expect(application?.experimentPlans).toHaveLength(1);
    expect(application?.distributionDispatches).toHaveLength(0);
    expect(application?.benchmarkAsset.evidence).toContain('Creative opportunities: 1');
    expect(application?.benchmarkAsset.evidence).toContain('Pattern clusters: 1');
    expect(application?.benchmarkAsset.evidence).toContain('Creative moat score:');
    expect(application?.benchmarkAsset.evidence).toContain('Opportunity backlog: 1');
    expect(application?.scriptAsset.evidence).toContain('Production runbook:');
    expect(application?.scriptAsset.evidence).toContain('Pattern cluster runbook:');
    expect(application?.scriptAsset.evidence).toContain('Opportunity backlog runbook:');
    expect(application?.distributionPlan?.returnMetric).toContain('creative_opportunity_id');

    const assets = await listContentAssets(orgId, projectId, 20);
    const plans = await listDistributionPlans(orgId, projectId, 20);
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(assets.some(asset => asset.source === 'creative-intelligence' && asset.type === 'benchmark')).toBe(true);
    expect(assets.some(asset => asset.source === 'creative-intelligence' && asset.type === 'script')).toBe(true);
    expect(plans.some(plan => plan.assetIds.includes(application!.benchmarkAsset.id))).toBe(true);
    expect(snapshot.reportAssetCount).toBe(0);
    expect(snapshot.assetCount).toBeGreaterThanOrEqual(2);
  });

  it('turns creative opportunities into account-aware experiment plans and dispatches', async () => {
    const orgId = `creative-schedule-${Date.now()}`;
    const projectId = `schedule-${Date.now()}`;
    await upsertChannelAccount(orgId, {
      projectId,
      platform: 'TikTok Shop',
      handle: '@shop-main',
      authorizationStatus: 'manual_ready',
      healthStatus: 'healthy',
      dailyPublishLimit: 2,
      scheduledCount: 0,
    });
    await upsertChannelAccount(orgId, {
      projectId,
      platform: 'Instagram Reels',
      handle: '@reels-lab',
      authorizationStatus: 'oauth_ready',
      healthStatus: 'warmup',
      dailyPublishLimit: 1,
      scheduledCount: 0,
    });
    await addCreativeInsight(orgId, {
      projectId,
      source: 'competitor-account',
      platform: 'TikTok Shop',
      title: 'proof opener',
      hookType: 'proof',
      pacing: 'fast',
      reusableAngle: 'Lead with proof, then show the product role.',
      metrics: { views: 40000, sales: 140 },
    });
    await addCreativeInsight(orgId, {
      projectId,
      source: 'trend-rank',
      platform: 'Instagram Reels',
      title: 'comparison rank',
      hookType: 'comparison',
      pacing: 'medium',
      reusableAngle: 'Compare three buying options before the SKU reveal.',
      metrics: { views: 28000, revenue: 7200 },
    });

    const application = await applyCreativeIntelligenceToIndustrialChain(orgId, projectId);
    expect(application?.experimentPlans).toHaveLength(2);
    expect(application?.distributionDispatches).toHaveLength(2);
    expect(application?.channelSlotCount).toBe(3);
    expect(application?.experimentPlans.every(plan => plan.status === 'ready')).toBe(true);
    expect(application?.experimentPlans[0].scheduledAt).toBeTruthy();
    expect(application?.experimentPlans[0].returnMetric).toContain('creative_insight_id=');
    expect(application?.experimentPlans[0].returnMetric).toContain('channel_account=');

    const dispatches = await listDistributionDispatches(orgId, projectId, 20);
    expect(dispatches).toHaveLength(2);
    expect(dispatches.map(dispatch => dispatch.status)).toEqual(expect.arrayContaining(['manual_ready']));
    expect(dispatches.some(dispatch => dispatch.providerAdapter.mode === 'provider')).toBe(true);
  });

  it('serves import, snapshot, and industrial application through the API', async () => {
    const headers = { 'x-org-id': `creative-api-${Date.now()}` };
    const projectId = 'creative-api-project';
    const importRes = await POST(new Request('http://localhost/api/creative-intelligence', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        projectId,
        insights: [
          {
            source: 'competitor-account',
            platform: 'TikTok Shop',
            title: 'top seller demo',
            hookType: 'demo',
            pacing: 'fast',
            reusableAngle: 'Use the same proof order but swap all product claims and scenes.',
            metrics: { views: 12000, sales: 180 },
          },
          {
            source: 'trend-rank',
            platform: 'TikTok Shop',
            title: 'rank list proof',
            hookType: 'proof',
            pacing: 'fast',
            reusableAngle: 'Anchor the opening in category proof before moving into the SKU.',
            metrics: { views: 20000, revenue: 9000 },
          },
          {
            source: 'video-teardown',
            platform: 'TikTok Shop',
            title: 'top seller teardown',
            hookType: 'proof',
            pacing: 'fast',
            reusableAngle: 'Borrow the structural proof order while changing all visuals, claims, and SKU evidence.',
            metrics: { views: 32000, sales: 260 },
            teardown: {
              openingHook: 'Proof result appears before the product explanation.',
              sceneBeats: ['problem frame', 'proof result', 'product demo', 'CTA'],
              proofMoment: 'Result shown before product detail.',
              productMoment: 'Product demo after proof.',
              ctaMoment: 'Shop CTA at final beat.',
              textOverlays: ['proof', 'demo'],
              complianceNotes: ['No copied footage.'],
            },
          },
        ],
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const importBody = await importRes.json();
    expect(importRes.status).toBe(201);
    expect(importBody.snapshot.missingLinks).toEqual([]);

    const applyRes = await POST(new Request('http://localhost/api/creative-intelligence', {
      method: 'POST',
      headers,
      body: JSON.stringify({ projectId, action: 'apply-to-industrial-chain' }),
    }) as unknown as Parameters<typeof POST>[0]);
    const applyBody = await applyRes.json();
    expect(applyBody.application.benchmarkAsset.source).toBe('creative-intelligence');

    const getRes = await GET(new Request(`http://localhost/api/creative-intelligence?projectId=${projectId}`, {
      headers,
    }) as unknown as Parameters<typeof GET>[0]);
    const getBody = await getRes.json();
    expect(getBody.insights).toHaveLength(3);
    expect(getBody.snapshot.brandLearningProfile.preferredPacing).toBeTruthy();
    expect(getBody.snapshot.opportunityMap).toHaveLength(3);
    expect(getBody.snapshot.opportunityBacklogCount).toBeGreaterThanOrEqual(1);
    expect(getBody.snapshot.readyOpportunityCount).toBeGreaterThanOrEqual(1);
    expect(getBody.snapshot.opportunityBacklog[0].providerBoundary).toContain('Ready for Wenai-owned production variant');
    expect(getBody.snapshot.crossSourcePatternCount).toBeGreaterThanOrEqual(1);
    expect(getBody.snapshot.patternClusters.flatMap((cluster: { sourceMix: string[] }) => cluster.sourceMix)).toEqual(expect.arrayContaining(['competitor-account', 'trend-rank', 'video-teardown']));
    expect(getBody.snapshot.creativeMoatScore).toBeGreaterThanOrEqual(60);
    expect(getBody.snapshot.opportunityMap[0].distributionInstruction).toContain('creative_insight_id=');
  });
});

import { describe, expect, it } from 'vitest';
import { GET, POST } from '@/app/api/brand-learning-profile/route';
import { addCreativeInsight } from '@/lib/creative-intelligence';
import {
  addContentAsset,
  addPerformanceReturn,
  updateContentAssetDelivery,
} from '@/lib/industrial-chain-store';
import {
  getBrandLearningProfile,
  materializeBrandLearningProfile,
} from '@/lib/brand-learning-profile';
import { evaluatePerformanceImport, parsePerformanceCsv } from '@/lib/performance-import';

async function seedBrandLearningProject(orgId: string, projectId: string) {
  const video = await addContentAsset(orgId, {
    projectId,
    type: 'video',
    title: 'Proof-first storage video',
    source: 'kuaizi-production-result',
    tags: ['proof-hook', 'fast-cut'],
    evidence: 'Client accepted the proof-first hook.',
  });
  await updateContentAssetDelivery(orgId, video.id, {
    deliveryStatus: 'approved',
    clientApprovedAt: new Date().toISOString(),
    evidence: 'Client approved via review portal.',
  });
  await addCreativeInsight(orgId, {
    projectId,
    source: 'competitor-account',
    platform: 'TikTok Shop',
    title: 'Fast proof hook',
    hookType: 'proof',
    pacing: 'fast',
    reusableAngle: 'Show the messy shelf, then prove the storage result in three seconds.',
    metrics: { views: 50000, sales: 180, revenue: 12000 },
  });
  await addCreativeInsight(orgId, {
    projectId,
    source: 'video-teardown',
    platform: 'TikTok Shop',
    title: 'Slow story underperformed',
    hookType: 'story',
    pacing: 'slow',
    reusableAngle: 'Long family story before product reveal.',
    riskNotes: ['Slow reveal loses purchase intent before the product appears.'],
    metrics: { views: 3000, sales: 1 },
  });
  const report = evaluatePerformanceImport(parsePerformanceCsv(`sku,asset,platform,impressions,clicks,spend,orders,revenue
storage-box,${video.id},TikTok Shop,18000,620,180,25,1500
storage-box,slow-story,TikTok Shop,9000,40,90,0,0`));
  await addPerformanceReturn(orgId, { projectId, report });
  return video;
}

describe('brand learning profile', () => {
  it('distills creative, performance, and approved delivery evidence into reusable rules', async () => {
    const orgId = `brand-learning-${Date.now()}`;
    const projectId = `project-${Date.now()}`;
    const video = await seedBrandLearningProject(orgId, projectId);

    const profile = await getBrandLearningProfile(orgId, projectId);
    expect(profile.creativeSignalCount).toBe(2);
    expect(profile.performanceSignalCount).toBe(1);
    expect(profile.approvedDeliverableCount).toBe(1);
    expect(profile.preferredHookType).toBe('proof');
    expect(profile.preferredPacing).toBe('fast');
    expect(profile.winningAssetRefs).toContain(video.id);
    expect(profile.approvedAssetPatterns[0]).toContain('Proof-first storage video');
    expect(profile.avoidPatterns.some(item => item.includes('slow-story'))).toBe(true);
    expect(profile.missingLinks).toEqual([]);
  });

  it('materializes a profile report, next script, and next distribution plan', async () => {
    const orgId = `brand-learning-apply-${Date.now()}`;
    const projectId = `project-${Date.now()}`;
    await seedBrandLearningProject(orgId, projectId);

    const application = await materializeBrandLearningProfile(orgId, projectId);
    expect(application?.learningAsset.source).toBe('brand-learning-profile');
    expect(application?.scriptAsset.parentAssetId).toBe(application?.learningAsset.id);
    expect(application?.distributionPlan.assetIds).toEqual([
      application?.learningAsset.id,
      application?.scriptAsset.id,
    ]);
    expect(application?.distributionPlan.returnMetric).toContain('brand_learning_profile');
  });

  it('serves profile reads and materialization through the API', async () => {
    const orgId = `brand-learning-api-${Date.now()}`;
    const projectId = `project-${Date.now()}`;
    await seedBrandLearningProject(orgId, projectId);
    const headers = { 'x-org-id': orgId };

    const getRes = await GET(new Request(`http://localhost/api/brand-learning-profile?projectId=${projectId}`, {
      headers,
    }) as unknown as Parameters<typeof GET>[0]);
    const getBody = await getRes.json();
    expect(getBody.profile.preferredHookType).toBe('proof');

    const postRes = await POST(new Request('http://localhost/api/brand-learning-profile', {
      method: 'POST',
      headers,
      body: JSON.stringify({ projectId, action: 'materialize' }),
    }) as unknown as Parameters<typeof POST>[0]);
    const postBody = await postRes.json();
    expect(postRes.status).toBe(201);
    expect(postBody.application.learningAsset.type).toBe('report');
    expect(postBody.application.distributionPlan.channel).toBe('TikTok Shop');
  });

  it('explains why a brand learning profile cannot be materialized yet', async () => {
    const res = await POST(new Request('http://localhost/api/brand-learning-profile', {
      method: 'POST',
      body: JSON.stringify({ projectId: `empty-brand-${Date.now()}`, action: 'materialize' }),
    }) as unknown as Parameters<typeof POST>[0]);
    const body = await res.json();

    expect(res.status).toBe(422);
    expect(body.error).toBe('brand_learning_evidence_required');
    expect(body.message).toContain('创意洞察');
  });
});

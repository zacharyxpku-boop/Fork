import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/industrial-chain/route';
import {
  addContentAsset,
  addDistributionPlan,
  addPerformanceReturn,
  createDistributionDispatch,
  getDistributionPlan,
  getIndustrializationSnapshot,
  listContentAssets,
  listDistributionDispatches,
  listDistributionPlans,
  updateContentAssetGovernance,
  updateContentAssetDelivery,
  updateDistributionDispatch,
} from '@/lib/industrial-chain-store';
import { evaluatePerformanceImport, parsePerformanceCsv } from '@/lib/performance-import';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('industrial chain store', () => {
  it('stores assets and distribution plans with memory fallback', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    const orgId = `org-${Date.now()}`;
    const projectId = `project-${Date.now()}`;

    const asset = await addContentAsset(orgId, {
      projectId,
      type: 'benchmark',
      title: 'Winning hook benchmark',
      evidence: 'Competitor hook with 3.2% CTR',
      tags: ['hook', 'benchmark'],
    });
    const plan = await addDistributionPlan(orgId, {
      projectId,
      channel: 'TikTok Shop',
      assetIds: [asset.id],
      status: 'ready',
      owner: 'ops',
    });

    await expect(listContentAssets(orgId, projectId)).resolves.toHaveLength(1);
    await expect(listDistributionPlans(orgId, projectId)).resolves.toHaveLength(1);
    expect(plan.utmCode).toContain('TikTok');
  });

  it('builds a missing-link snapshot for content industrialization', async () => {
    const orgId = `org-snapshot-${Date.now()}`;
    const projectId = `project-snapshot-${Date.now()}`;

    await addContentAsset(orgId, { projectId, type: 'brief', title: 'Brief', evidence: '10 SKU launch brief' });
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);

    expect(snapshot.assetCount).toBe(1);
    expect(snapshot.missingLinks).toContain('Missing image or video asset');
    expect(snapshot.nextActions[0]).toContain('Close gap');
  });

  it('turns a distribution plan into an executable handoff package with evidence tracking', async () => {
    const orgId = `org-dispatch-${Date.now()}`;
    const projectId = `project-dispatch-${Date.now()}`;
    const asset = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Short video v1',
      evidence: 'Approved creative file',
    });
    await addContentAsset(orgId, {
      projectId,
      type: 'benchmark',
      title: 'Competitor matrix',
      evidence: 'Hook and CTA reference set',
    });
    await addContentAsset(orgId, {
      projectId,
      type: 'brief',
      title: 'Launch brief',
      evidence: 'Audience, offer, and SKU claim sheet',
    });
    const plan = await addDistributionPlan(orgId, {
      projectId,
      channel: 'TikTok Shop',
      assetIds: [asset.id],
      status: 'ready',
      owner: 'ops',
      scheduledAt: '2026-05-20T09:00:00.000Z',
    });

    const dispatch = await createDistributionDispatch(orgId, { planId: plan.id });
    expect(dispatch.status).toBe('manual_ready');
    expect(dispatch.handoffPackage.assetIds).toEqual([asset.id]);
    expect(dispatch.handoffPackage.checklist).toContain('Capture evidence URL after publish');
    expect(dispatch.providerAdapter.blocker).toContain('No platform publishing adapter');

    const published = await updateDistributionDispatch(orgId, dispatch.id, {
      status: 'measured',
      evidenceUrls: ['https://example.test/post/1'],
      resultUrls: ['https://example.test/report/1'],
    });
    expect(published?.status).toBe('measured');
    expect(published?.evidenceUrls).toHaveLength(1);
    await expect(getDistributionPlan(orgId, plan.id)).resolves.toMatchObject({ status: 'measured' });
    await expect(listDistributionDispatches(orgId, projectId)).resolves.toHaveLength(1);

    const snapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(snapshot.dispatchCount).toBe(1);
    expect(snapshot.publishedDispatchCount).toBe(1);
    expect(snapshot.publishedWithEvidenceCount).toBe(1);
    expect(snapshot.missingPublishEvidenceCount).toBe(0);
    expect(snapshot.measuredDispatchCount).toBe(1);
    expect(snapshot.missingLinks).not.toContain('Missing distribution dispatch record');
  });

  it('flags published dispatches that lack publish evidence or miss the review window', async () => {
    const orgId = `org-dispatch-evidence-${Date.now()}`;
    const projectId = `project-dispatch-evidence-${Date.now()}`;
    const asset = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Launch video',
      evidence: 'Approved and licensed creative',
    });
    const plan = await addDistributionPlan(orgId, {
      projectId,
      channel: 'TikTok Shop',
      assetIds: [asset.id],
      status: 'ready',
      nextReviewAt: '2000-01-01T00:00:00.000Z',
    });
    const dispatch = await createDistributionDispatch(orgId, { planId: plan.id });
    await updateDistributionDispatch(orgId, dispatch.id, { status: 'published' });

    const missingEvidence = await getIndustrializationSnapshot(orgId, projectId);
    expect(missingEvidence.publishedDispatchCount).toBe(1);
    expect(missingEvidence.publishedWithEvidenceCount).toBe(0);
    expect(missingEvidence.missingPublishEvidenceCount).toBe(1);
    expect(missingEvidence.overdueReviewDispatchCount).toBe(1);
    expect(missingEvidence.missingLinks).toContain('Published dispatch missing evidence URL (1)');
    expect(missingEvidence.missingLinks).toContain('Published dispatch overdue for performance import (1)');

    await updateDistributionDispatch(orgId, dispatch.id, {
      status: 'published',
      evidenceUrls: ['https://example.test/published/post'],
    });
    const withEvidence = await getIndustrializationSnapshot(orgId, projectId);
    expect(withEvidence.publishedWithEvidenceCount).toBe(1);
    expect(withEvidence.missingPublishEvidenceCount).toBe(0);
    expect(withEvidence.missingLinks).not.toContain('Published dispatch missing evidence URL (1)');
  });

  it('treats asset approval and rights as production gate inputs', async () => {
    const orgId = `org-asset-governance-${Date.now()}`;
    const projectId = `project-asset-governance-${Date.now()}`;
    const asset = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Unreviewed launch video',
      evidence: 'Generated creative that still needs rights review',
      approvalStatus: 'review',
      rightsStatus: 'needs_review',
    });
    await addDistributionPlan(orgId, {
      projectId,
      channel: 'TikTok Shop',
      assetIds: [asset.id],
      status: 'ready',
    });

    const blockedSnapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(blockedSnapshot.assetGovernanceIssueCount).toBe(1);
    expect(blockedSnapshot.rightsIssueAssetCount).toBe(1);
    expect(blockedSnapshot.missingLinks).toContain('Distribution uses blocked or rights-unready asset (1)');

    await updateContentAssetGovernance(orgId, asset.id, {
      approvalStatus: 'approved',
      rightsStatus: 'licensed',
      reusable: true,
      tags: ['approved-for-paid-social'],
    });
    const approvedSnapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(approvedSnapshot.assetGovernanceIssueCount).toBe(0);
    expect(approvedSnapshot.approvedAssetCount).toBe(1);
    expect(approvedSnapshot.missingLinks).not.toContain('Distribution uses blocked or rights-unready asset (1)');
  });

  it('treats client approval as a production deliverable release gate', async () => {
    const orgId = `org-delivery-${Date.now()}`;
    const projectId = `project-delivery-${Date.now()}`;
    const asset = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Produced deliverable',
      source: 'kuaizi-production-result',
      tags: ['production-result'],
      evidence: 'Provider result is ready for customer review',
      deliveryStatus: 'client_review',
      clientReviewUrl: 'https://review.example/video',
    });

    const pendingSnapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(pendingSnapshot.deliverableAssetCount).toBe(1);
    expect(pendingSnapshot.clientReviewAssetCount).toBe(1);
    expect(pendingSnapshot.approvedDeliverableCount).toBe(0);
    expect(pendingSnapshot.deliveryIssueCount).toBe(1);
    expect(pendingSnapshot.missingLinks).toContain('Production deliverables missing client approval (0/1)');

    const approved = await updateContentAssetDelivery(orgId, asset.id, {
      deliveryStatus: 'approved',
      evidence: 'Client approved in review portal',
    });
    expect(approved?.clientApprovedAt).toMatch(/T/);

    const approvedSnapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(approvedSnapshot.approvedDeliverableCount).toBe(1);
    expect(approvedSnapshot.deliveryIssueCount).toBe(0);
    expect(approvedSnapshot.missingLinks).not.toContain('Production deliverables missing client approval (0/1)');
  });

  it('promotes a draft distribution plan to ready when an executable dispatch is created', async () => {
    const orgId = `org-promote-${Date.now()}`;
    const projectId = `project-promote-${Date.now()}`;
    const asset = await addContentAsset(orgId, {
      projectId,
      type: 'report',
      title: 'Performance return report',
      evidence: 'scale-ready hook evidence',
    });
    const plan = await addDistributionPlan(orgId, {
      projectId,
      channel: 'TikTok Shop',
      assetIds: [asset.id],
      status: 'draft',
      owner: 'ops',
    });

    const dispatch = await createDistributionDispatch(orgId, { planId: plan.id });

    expect(dispatch.status).toBe('manual_ready');
    await expect(getDistributionPlan(orgId, plan.id)).resolves.toMatchObject({ status: 'ready' });
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(snapshot.readyPlanCount).toBe(1);
    expect(snapshot.executableDispatchCount).toBe(1);
    expect(snapshot.missingLinks).not.toContain('Distribution plan is not ready/published/measured');
  });

  it('keeps provider-gated dispatches from promoting draft plans', async () => {
    const orgId = `org-provider-gated-${Date.now()}`;
    const projectId = `project-provider-gated-${Date.now()}`;
    const asset = await addContentAsset(orgId, {
      projectId,
      type: 'report',
      title: 'Performance report',
      evidence: 'Scale candidate, but provider auth is missing',
    });
    const plan = await addDistributionPlan(orgId, {
      projectId,
      channel: 'TikTok Shop',
      assetIds: [asset.id],
      status: 'draft',
    });

    const dispatch = await createDistributionDispatch(orgId, {
      planId: plan.id,
      providerAdapter: { mode: 'provider', configured: false, providerName: 'TikTok Shop' },
    });

    expect(dispatch.status).toBe('provider_gated');
    await expect(getDistributionPlan(orgId, plan.id)).resolves.toMatchObject({ status: 'draft' });
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(snapshot.readyPlanCount).toBe(0);
    expect(snapshot.executableDispatchCount).toBe(0);
    expect(snapshot.missingLinks).toContain('Distribution dispatch is blocked or provider-gated');
  });

  it('requires next-round scale plans to carry a non-report winning asset', async () => {
    const orgId = `org-next-round-lineage-${Date.now()}`;
    const projectId = `project-next-round-lineage-${Date.now()}`;
    const winner = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Winning creative',
      evidence: 'Published creative with winning ROAS',
    });
    const report = await addContentAsset(orgId, {
      projectId,
      type: 'report',
      title: 'Performance report',
      evidence: 'scale=1',
    });
    await addPerformanceReturn(orgId, {
      projectId,
      report: evaluatePerformanceImport(parsePerformanceCsv(`sku,asset,platform,impressions,clicks,spend,orders,revenue
sku-1,${winner.id},TikTok,10000,300,120,12,560`)),
    });
    await addDistributionPlan(orgId, {
      projectId,
      channel: 'TikTok Shop',
      assetIds: [report.id],
      status: 'draft',
    });

    const reportOnlySnapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(reportOnlySnapshot.nextRoundAssetPlanCount).toBe(0);
    expect(reportOnlySnapshot.missingLinks).toContain('Missing winning asset reuse in next-round distribution plan (0/1)');

    await addDistributionPlan(orgId, {
      projectId,
      channel: 'TikTok Shop',
      assetIds: [report.id, winner.id],
      status: 'draft',
    });
    const lineageSnapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(lineageSnapshot.nextRoundAssetPlanCount).toBe(1);
    expect(lineageSnapshot.missingLinks.join(' ')).not.toContain('Missing winning asset reuse in next-round distribution plan');
  });

  it('reports partial winning-asset coverage across multiple scale decisions', async () => {
    const orgId = `org-partial-lineage-${Date.now()}`;
    const projectId = `project-partial-lineage-${Date.now()}`;
    const winner = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Winning creative',
      evidence: 'First winning creative is matched',
    });
    const report = await addContentAsset(orgId, {
      projectId,
      type: 'report',
      title: 'Performance report',
      evidence: 'scale=2',
    });
    await addPerformanceReturn(orgId, {
      projectId,
      report: evaluatePerformanceImport(parsePerformanceCsv(`sku,asset,platform,impressions,clicks,spend,orders,revenue
sku-1,${winner.id},TikTok,10000,300,120,12,560
sku-2,missing-creative,TikTok,10000,300,120,12,560`)),
    });
    await addDistributionPlan(orgId, {
      projectId,
      channel: 'TikTok Shop',
      assetIds: [report.id, winner.id],
      status: 'draft',
    });

    const snapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(snapshot.scaleDecisionCount).toBe(2);
    expect(snapshot.nextRoundAssetPlanCount).toBe(1);
    expect(snapshot.missingLinks).toContain('Missing winning asset reuse in next-round distribution plan (1/2)');
  });

  it('keeps unresolved attribution as a release-blocking industrial gap', async () => {
    const orgId = `org-attribution-gap-${Date.now()}`;
    const projectId = `project-attribution-gap-${Date.now()}`;
    const winner = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Winning creative',
      evidence: 'Published creative, but platform CSV exported an ambiguous alias',
    });
    const report = await addContentAsset(orgId, {
      projectId,
      type: 'report',
      title: 'Performance report',
      evidence: 'scale=1 with unresolved attribution',
    });
    await addPerformanceReturn(orgId, {
      projectId,
      report: evaluatePerformanceImport(parsePerformanceCsv(`sku,asset,platform,impressions,clicks,spend,orders,revenue
sku-1,Duplicate Hook,TikTok,10000,300,120,12,560`)),
      assetMatchSummary: {
        matchedCount: 0,
        ambiguousCount: 1,
        unmatchedCount: 0,
        matched: [],
        ambiguous: [{ assetRef: 'Duplicate Hook', assetIds: [winner.id, 'asset_other'] }],
        unmatched: [],
      },
    });
    await addDistributionPlan(orgId, {
      projectId,
      channel: 'TikTok Shop',
      assetIds: [report.id, winner.id],
      status: 'draft',
    });

    const snapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(snapshot.nextRoundAssetPlanCount).toBe(1);
    expect(snapshot.assetMatchIssueCount).toBe(1);
    expect(snapshot.missingLinks).toContain('Unresolved performance asset attribution (ambiguous=1; unmatched=0)');
  });

  it('does not count unrelated draft asset plans as next-round scale lineage', async () => {
    const orgId = `org-unrelated-draft-${Date.now()}`;
    const projectId = `project-unrelated-draft-${Date.now()}`;
    const winner = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Winning creative',
      evidence: 'The scale decision points to this asset',
    });
    await addContentAsset(orgId, {
      projectId,
      type: 'report',
      title: 'Performance report',
      evidence: 'scale=1',
    });
    await addPerformanceReturn(orgId, {
      projectId,
      report: evaluatePerformanceImport(parsePerformanceCsv(`sku,asset,platform,impressions,clicks,spend,orders,revenue
sku-1,${winner.id},TikTok,10000,300,120,12,560`)),
    });
    await addDistributionPlan(orgId, {
      projectId,
      channel: 'TikTok Shop',
      assetIds: [winner.id],
      status: 'draft',
    });

    const snapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(snapshot.nextRoundAssetPlanCount).toBe(0);
    expect(snapshot.missingLinks).toContain('Missing winning asset reuse in next-round distribution plan (0/1)');
  });

  it('serves asset, plan, and dispatch snapshots for the full chain', async () => {
    const request = (body: unknown) => new Request('http://localhost/api/industrial-chain', {
      method: 'POST',
      headers: { 'x-org-id': 'industrial-api-test' },
      body: JSON.stringify(body),
    }) as unknown as Parameters<typeof POST>[0];

    const assetRes = await POST(request({
      action: 'asset',
      asset: { projectId: 'launch-1', type: 'image', title: 'Main image', evidence: 'Generated from pipeline 03', approvalStatus: 'review', rightsStatus: 'needs_review' },
    }));
    const assetBody = await assetRes.json();
    expect(assetRes.status).toBe(201);

    const governanceRes = await POST(request({
      action: 'asset-governance',
      assetId: assetBody.asset.id,
      governance: { approvalStatus: 'approved', rightsStatus: 'owned', reusable: true },
    }));
    const governanceBody = await governanceRes.json();
    expect(governanceRes.status).toBe(200);
    expect(governanceBody.asset).toMatchObject({ approvalStatus: 'approved', rightsStatus: 'owned', reusable: true });

    const missingGovernanceRes = await POST(request({
      action: 'asset-governance',
      governance: { reusable: true },
    }));
    const missingGovernanceBody = await missingGovernanceRes.json();
    expect(missingGovernanceRes.status).toBe(400);
    expect(missingGovernanceBody.message).toContain('缺少资产 ID');

    const planRes = await POST(request({
      action: 'distribution-plan',
      distributionPlan: { projectId: 'launch-1', channel: 'Amazon', assetIds: [assetBody.asset.id], status: 'ready' },
    }));
    expect(planRes.status).toBe(201);

    const getRes = await GET(new Request('http://localhost/api/industrial-chain?projectId=launch-1', {
      headers: { 'x-org-id': 'industrial-api-test' },
    }) as unknown as Parameters<typeof GET>[0]);
    const getBody = await getRes.json();
    expect(getBody.assets).toHaveLength(1);
    expect(getBody.distributionPlans).toHaveLength(1);
    expect(getBody.distributionDispatches).toHaveLength(0);
    expect(getBody.performanceReturns).toHaveLength(0);
    expect(getBody.snapshot.readyPlanCount).toBe(1);
  });
});

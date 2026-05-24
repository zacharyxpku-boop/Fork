import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as postInquiry, GET as getInquiries } from '@/app/api/sales/inquiry/route';
import { POST as postIndustrial } from '@/app/api/industrial-chain/route';
import { POST as postHandoff } from '@/app/api/industrial-chain/handoff/route';
import { listAssetPermissionAccessAudits, upsertAssetPermission } from '@/lib/asset-permission-ledger';
import { createDistributionDispatch, listContentAssets, listDistributionDispatches } from '@/lib/industrial-chain-store';
import { buildIndustrialCrmHandoff } from '@/lib/industrial-crm-handoff';

afterEach(() => {
  vi.unstubAllEnvs();
});

function req(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(url, init);
}

const performanceCsv = `sku,asset,platform,impressions,clicks,spend,orders,revenue
storage-box,hook-a,TikTok,10000,260,120,12,520`;

function completeSnapshot() {
  return {
    orgId: 'org',
    projectId: 'launch-1',
    assetCount: 3,
    reportAssetCount: 1,
    approvedAssetCount: 3,
    reusableAssetCount: 3,
    blockedAssetCount: 0,
    rightsIssueAssetCount: 0,
    assetGovernanceIssueCount: 0,
    deliverableAssetCount: 1,
    clientReviewAssetCount: 0,
    approvedDeliverableCount: 1,
    revisionRequestedCount: 0,
    deliveryIssueCount: 0,
    planCount: 2,
    draftPlanCount: 1,
    nextRoundAssetPlanCount: 1,
    readyPlanCount: 1,
    dispatchCount: 1,
    executableDispatchCount: 1,
    publishedDispatchCount: 1,
    publishedWithEvidenceCount: 1,
    missingPublishEvidenceCount: 0,
    overdueReviewDispatchCount: 0,
    measuredDispatchCount: 1,
    performanceReturnCount: 1,
    scaleDecisionCount: 1,
    assetMatchAmbiguousCount: 0,
    assetMatchUnmatchedCount: 0,
    assetMatchIssueCount: 0,
    missingLinks: [],
    nextActions: [],
  };
}

describe('industrial CRM handoff', () => {
  it('builds a CRM patch from industrial snapshot and performance return', () => {
    const patch = buildIndustrialCrmHandoff({
      inquiryId: 'inq_1',
      projectId: 'launch-1',
      owner: 'ops',
      snapshot: completeSnapshot(),
      performance: {
        rows: [],
        decisions: [{
          row: { sku: 'storage-box', asset: 'hook-a', platform: 'TikTok', impressions: 10000, clicks: 260, spend: 120, orders: 12, revenue: 520 },
          ctr: 0.026,
          cpc: 0.46,
          conversionRate: 0.046,
          roas: 4.33,
          decision: 'scale',
          nextAction: 'scale it',
        }],
        summary: { totalSpend: 120, totalRevenue: 520, averageCtr: 0.026, averageConversionRate: 0.046, scaleCount: 1, iterateCount: 0, pauseCount: 0 },
        acceptanceNotes: [],
      },
    });

    expect(patch.reviewDecision).toBe('expand_sku');
    expect(patch.contractStage).toBe('proposal');
    expect(patch.quoteStatus).toBe('drafting');
    expect(patch.paymentStatus).toBe('pending');
    expect(patch.lifecycleStage).toBe('opportunity');
    expect(patch.dealProbability).toBe('68');
    expect(patch.renewalPotential).toBe('high');
    expect(patch.nextActionDue).toMatch(/T/);
    expect(patch.closeDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(patch.reviewNotes).toContain('Industrial snapshot');
    expect(patch.reviewNotes).toContain('Commercial handoff');
  });

  it('writes industrial handoff back to the inquiry CRM loop without Redis', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    vi.stubEnv('ADMIN_KEY', '');
    const orgId = `industrial-crm-${Date.now()}`;
    const projectId = `launch-${Date.now()}`;

    const created = await postInquiry(req('https://wenai.test/api/sales/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `10.0.0.${Math.floor(Math.random() * 200) + 1}` },
      body: JSON.stringify({
        company: `Industrial CRM ${Date.now()}`,
        contact: 'buyer@example.com',
        channel: 'email',
        scale: '50-200',
        category: 'home',
        skuCount: '10',
        platforms: 'TikTok Shop',
        assetsReady: 'partial',
        painPoint: 'Need content production, distribution, data return, and contract follow-up in one chain.',
      }),
    }));
    const createdJson = await created.json();

    const industrialHeaders = { 'Content-Type': 'application/json', 'x-tenant-id': orgId };
    const asset = await postIndustrial(req('https://wenai.test/api/industrial-chain', {
      method: 'POST',
      headers: industrialHeaders,
      body: JSON.stringify({
        action: 'asset',
        asset: { projectId, type: 'benchmark', title: 'Benchmark hook', evidence: '3.2% CTR benchmark' },
      }),
    }));
    const assetJson = await asset.json();
    const plan = await postIndustrial(req('https://wenai.test/api/industrial-chain', {
      method: 'POST',
      headers: industrialHeaders,
      body: JSON.stringify({
        action: 'distribution-plan',
        distributionPlan: { projectId, channel: 'TikTok Shop', assetIds: [assetJson.asset.id], status: 'ready', owner: 'ops' },
      }),
    }));
    const planJson = await plan.json();
    const dispatch = await createDistributionDispatch(orgId, { planId: planJson.distributionPlan.id });

    const deniedHandoff = await postHandoff(req('https://wenai.test/api/industrial-chain/handoff', {
      method: 'POST',
      headers: industrialHeaders,
      body: JSON.stringify({
        inquiryId: createdJson.id,
        projectId,
        dispatchId: dispatch.id,
        performanceCsv,
        evidenceUrls: ['https://example.test/tiktok/post'],
        resultUrls: ['https://example.test/tiktok/report'],
        owner: 'ops',
      }),
    }));
    const deniedHandoffJson = await deniedHandoff.json();
    expect(deniedHandoff.status).toBe(403);
    expect(deniedHandoffJson.error).toBe('asset_publish_permission_denied');
    expect(deniedHandoffJson.message).toContain('缺少资产发布权限');
    expect(deniedHandoffJson.access.deniedAssetIds).toEqual([assetJson.asset.id]);
    await expect(listAssetPermissionAccessAudits(orgId, projectId)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          assetId: assetJson.asset.id,
          action: 'publish',
          operation: 'crm_handoff_publish',
          allowed: false,
        }),
      ]),
    );

    await upsertAssetPermission(orgId, {
      projectId,
      assetId: assetJson.asset.id,
      owner: 'ops',
      scope: 'project',
      roles: ['owner', 'distribution'],
      allowedActions: ['view', 'download', 'share', 'publish'],
      auditNote: 'Distribution publish permission granted before CRM handoff.',
      actor: 'ops',
    });

    const handoff = await postHandoff(req('https://wenai.test/api/industrial-chain/handoff', {
      method: 'POST',
      headers: industrialHeaders,
      body: JSON.stringify({
        inquiryId: createdJson.id,
        projectId,
        dispatchId: dispatch.id,
        performanceCsv,
        evidenceUrls: ['https://example.test/tiktok/post'],
        resultUrls: ['https://example.test/tiktok/report'],
        owner: 'ops',
      }),
    }));
    const handoffJson = await handoff.json();
    expect(handoff.status).toBe(200);
    expect(handoffJson.snapshot.measuredDispatchCount).toBe(1);
    expect(handoffJson.snapshot.performanceReturnCount).toBe(1);
    expect(handoffJson.snapshot.scaleDecisionCount).toBe(1);
    expect(handoffJson.performanceRecord.summary.scaleCount).toBe(1);
    expect(handoffJson.dispatch.status).toBe('measured');
    expect(handoffJson.handoffReport.type).toBe('report');
    expect(handoffJson.handoffReport.tags).toContain('crm-handoff');
    expect(handoffJson.dispatch.handoffPackage.assetIds).toContain(handoffJson.handoffReport.id);
    expect(handoffJson.patch.reviewDecision).toBe('expand_sku');
    expect(handoffJson.patch.quoteStatus).toBe('drafting');
    expect(handoffJson.patch.paymentStatus).toBe('pending');
    expect(handoffJson.patch.lifecycleStage).toBe('opportunity');
    expect(handoffJson.patch.renewalPotential).toBe('high');
    await expect(listAssetPermissionAccessAudits(orgId, projectId)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          assetId: assetJson.asset.id,
          action: 'publish',
          operation: 'crm_handoff_publish',
          allowed: true,
        }),
      ]),
    );
    await expect(listDistributionDispatches(orgId, projectId)).resolves.toMatchObject([{ status: 'measured' }]);
    await expect(listContentAssets(orgId, projectId)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: handoffJson.handoffReport.id,
          type: 'report',
          source: 'industrial-crm-handoff',
        }),
      ]),
    );

    const listed = await getInquiries(req('https://wenai.test/api/sales/inquiry'));
    const listedJson = await listed.json();
    const updated = listedJson.inquiries.find((item: { id: string }) => item.id === createdJson.id);

    expect(updated.reviewDecision).toBe('expand_sku');
    expect(updated.contractNextStep).toContain('contract discussion');
    expect(updated.reviewNotes).toContain('Industrial snapshot');
    expect(updated.nextActionDue).toMatch(/T/);
    expect(updated.quoteStatus).toBe('drafting');
    expect(updated.paymentStatus).toBe('pending');
    expect(updated.lifecycleStage).toBe('opportunity');
    expect(updated.dealProbability).toBe('68');
    expect(updated.renewalPotential).toBe('high');
    expect(updated.tags).toContain('industrial-chain');
  });

  it('returns operator-readable validation errors when CRM handoff lacks an inquiry', async () => {
    const res = await postHandoff(req('https://wenai.test/api/industrial-chain/handoff', {
      method: 'POST',
      body: JSON.stringify({ projectId: 'missing-inquiry' }),
    }));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('inquiry_id_required');
    expect(body.message).toContain('销售线索 ID');
  });
});

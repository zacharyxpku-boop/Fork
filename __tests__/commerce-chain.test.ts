import { afterEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/commerce-chain/route';
import {
  addContentAsset,
  addDistributionPlan,
  addPerformanceReturn,
  createDistributionDispatch,
  updateDistributionDispatch,
} from '@/lib/industrial-chain-store';
import { buildCommerceChain } from '@/lib/commerce-chain';
import { evaluatePerformanceImport, parsePerformanceCsv } from '@/lib/performance-import';
import { buildPlatformConnectorReadiness } from '@/lib/platform-connector-readiness';

const performanceCsv = `sku,asset,platform,impressions,clicks,spend,orders,revenue
storage-box,hook-a,TikTok,10000,260,120,12,520`;

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('commerce full-chain orchestration', () => {
  it('marks a complete chain ready for friend trial', () => {
    const report = buildCommerceChain({
      skuCount: 10,
      brief: 'Launch 10 storage SKUs with evidence-first content.',
      assets: ['benchmark link', 'product image pack'],
      channels: ['TikTok Shop', 'Amazon'],
      productionProviderConfigured: true,
      performanceCsv,
      crmOwner: 'ops',
      distributionPlanCount: 1,
      readyPlanCount: 1,
      distributionDispatchCount: 1,
      executableDispatchCount: 1,
      publishedDispatchCount: 1,
      publishedWithEvidenceCount: 1,
      measuredDispatchCount: 1,
      performanceReturnCount: 1,
      reportAssetCount: 1,
      nextRoundAssetPlanCount: 1,
    });

    expect(report.verdict).toBe('ready-for-friend-trial');
    expect(report.acceptanceGate.verdict).toBe('pass');
    expect(report.acceptanceGate.p0).toHaveLength(0);
    expect(report.blockers).toHaveLength(0);
    expect(report.operatorRunbook.map(item => item.stage)).toEqual([
      'intake',
      'asset',
      'production',
      'distribution',
      'performance',
      'crm',
    ]);
    expect(report.operatorRunbook.find(item => item.stage === 'distribution')?.evidenceRequired).toContain('UTM');
    expect(report.handoffPack.crmNextStep).toContain('Prioritize scale');
  });

  it('does not pretend full production when provider is missing', () => {
    const report = buildCommerceChain({
      skuCount: 10,
      brief: 'Launch 10 storage SKUs.',
      assets: ['product image pack'],
      channels: ['TikTok Shop'],
      productionProviderConfigured: false,
      performanceCsv,
      crmOwner: 'ops',
    });

    expect(report.verdict).toBe('provider-gated');
    expect(report.acceptanceGate.verdict).toBe('fail');
    expect(report.acceptanceGate.p0.join(' ')).toContain('Distribution has executable handoff');
    expect(report.blockers.join(' ')).toContain('provider');
  });

  it('serves full-chain reports through /api/commerce-chain', async () => {
    vi.stubEnv('TIKTOK_OAUTH_CLIENT_SECRET', 'oauth_secret_should_not_leak');
    vi.stubEnv('TIKTOK_ACCESS_TOKEN', 'ad_token_should_not_leak');

    const response = await POST(new Request('http://localhost/api/commerce-chain', {
      method: 'POST',
      body: JSON.stringify({
        skuCount: 10,
        brief: 'Launch 10 storage SKUs.',
        assets: ['benchmark'],
        channels: ['TikTok Shop'],
        productionProviderConfigured: true,
        performanceCsv,
        crmOwner: 'ops',
        distributionPlanCount: 1,
        readyPlanCount: 1,
        distributionDispatchCount: 1,
        executableDispatchCount: 1,
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.report.stages.map((stage: { id: string }) => stage.id)).toEqual([
      'intake',
      'asset',
      'production',
      'distribution',
      'performance',
      'crm',
    ]);
    expect(JSON.stringify(body)).not.toContain('oauth_secret_should_not_leak');
    expect(JSON.stringify(body)).not.toContain('ad_token_should_not_leak');
  });

  it('keeps commerce acceptance conditional until platform automation connectors are complete', () => {
    const report = buildCommerceChain({
      skuCount: 10,
      brief: 'Launch 10 storage SKUs with evidence-first content.',
      assets: ['benchmark link', 'product image pack'],
      channels: ['TikTok Shop'],
      productionProviderConfigured: true,
      performanceCsv,
      crmOwner: 'ops',
      distributionPlanCount: 1,
      readyPlanCount: 1,
      distributionDispatchCount: 1,
      executableDispatchCount: 1,
      publishedDispatchCount: 1,
      publishedWithEvidenceCount: 1,
      measuredDispatchCount: 1,
      performanceReturnCount: 1,
      reportAssetCount: 1,
      platformConnectors: buildPlatformConnectorReadiness({
        TIKTOK_OAUTH_CLIENT_ID: 'client-id',
        TIKTOK_OAUTH_CLIENT_SECRET: 'client-secret',
      }),
    });

    const connectorGate = report.acceptanceGate.checklist.find(item => item.item === 'Platform automation connectors are configured');
    expect(connectorGate?.ok).toBe(false);
    expect(connectorGate?.evidence).toContain('missing=');
    expect(report.acceptanceGate.verdict).toBe('conditional');
    expect(report.blockers.join(' ')).toContain('Platform automation connectors');
  });

  it('builds project reports from industrial assets, dispatches, and persisted performance returns', async () => {
    const orgId = `commerce-project-${Date.now()}`;
    const projectId = `commerce-launch-${Date.now()}`;
    const brief = await addContentAsset(orgId, {
      projectId,
      type: 'brief',
      title: '10 SKU launch brief',
      evidence: 'Audience, SKU, offer, and acceptance metric are attached',
    });
    await addContentAsset(orgId, {
      projectId,
      type: 'benchmark',
      title: 'Hook benchmark',
      evidence: 'Reference CTR and competitor hook notes',
    });
    const plan = await addDistributionPlan(orgId, {
      projectId,
      channel: 'TikTok Shop',
      assetIds: [brief.id],
      status: 'ready',
      owner: 'ops',
    });
    const dispatch = await createDistributionDispatch(orgId, { planId: plan.id });
    await updateDistributionDispatch(orgId, dispatch.id, {
      status: 'measured',
      evidenceUrls: ['https://example.test/tiktok/post'],
      resultUrls: ['https://example.test/tiktok/report'],
    });
    await addPerformanceReturn(orgId, {
      projectId,
      dispatchId: dispatch.id,
      source: 'csv-import',
      report: evaluatePerformanceImport(parsePerformanceCsv(performanceCsv)),
    });
    const reportAsset = await addContentAsset(orgId, {
      projectId,
      type: 'report',
      title: 'Performance return report',
      source: 'performance-import',
      evidence: 'Rows: 1; Scale: 1',
    });
    await addDistributionPlan(orgId, {
      projectId,
      channel: 'TikTok Shop',
      assetIds: [reportAsset.id, brief.id],
      status: 'draft',
      owner: 'ops',
    });

    const response = await GET(new Request(`http://localhost/api/commerce-chain?projectId=${projectId}&skuCount=10&brief=Launch`, {
      headers: { 'x-tenant-id': orgId },
    }) as unknown as Parameters<typeof GET>[0]);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.industrialSnapshot.assetCount).toBe(3);
    expect(body.industrialSnapshot.reportAssetCount).toBe(1);
    expect(body.industrialSnapshot.dispatchCount).toBe(1);
    expect(body.industrialSnapshot.performanceReturnCount).toBe(1);
    expect(body.report.acceptanceGate.verdict).toBe('conditional');
    expect(body.report.acceptanceGate.p0).toHaveLength(0);
    expect(body.report.acceptanceGate.checklist.find((item: { item: string }) => item.item.includes('Report asset')).ok).toBe(true);
    expect(body.report.acceptanceGate.checklist.find((item: { item: string }) => item.item.includes('winning assets')).ok).toBe(true);
    const distribution = body.report.stages.find((stage: { id: string }) => stage.id === 'distribution');
    expect(distribution.evidence).toContain('dispatches: 1');
    expect(distribution.evidence).toContain('readyPlans: 1');
    expect(distribution.evidence).toContain('measured: 1');
    const performance = body.report.stages.find((stage: { id: string }) => stage.id === 'performance');
    expect(performance.status).toBe('ready');
    expect(performance.evidence).toContain('persisted performance returns');
    expect(body.report.operatorRunbook.find((item: { stage: string }) => item.stage === 'performance').evidenceRequired).toContain('CSV rows');
    expect(body.report.handoffPack.crmNextStep).toContain('scale decisions');
  });

  it('does not treat draft next-round plans as executable distribution', () => {
    const report = buildCommerceChain({
      skuCount: 10,
      brief: 'Launch 10 storage SKUs.',
      assets: ['performance report'],
      channels: ['TikTok Shop'],
      productionProviderConfigured: true,
      crmOwner: 'ops',
      distributionPlanCount: 1,
      readyPlanCount: 0,
      distributionDispatchCount: 0,
      executableDispatchCount: 0,
      measuredDispatchCount: 0,
      performanceReturnCount: 1,
      scaleDecisionCount: 1,
    });

    const distribution = report.stages.find(stage => stage.id === 'distribution');
    expect(distribution?.status).toBe('needs-input');
    expect(distribution?.nextAction).toContain('Promote draft plans');
    expect(report.verdict).toBe('needs-input');
  });

  it('flags scale loops that create report-only next-round plans without winning asset reuse', () => {
    const report = buildCommerceChain({
      skuCount: 10,
      brief: 'Launch 10 storage SKUs.',
      assets: ['performance report'],
      channels: ['TikTok Shop'],
      productionProviderConfigured: true,
      crmOwner: 'ops',
      distributionPlanCount: 2,
      draftPlanCount: 1,
      readyPlanCount: 1,
      distributionDispatchCount: 1,
      executableDispatchCount: 1,
      measuredDispatchCount: 1,
      performanceReturnCount: 1,
      reportAssetCount: 1,
      scaleDecisionCount: 1,
      nextRoundAssetPlanCount: 0,
    });

    expect(report.acceptanceGate.verdict).toBe('conditional');
    expect(report.acceptanceGate.p0).toHaveLength(0);
    expect(report.acceptanceGate.p1.join(' ')).toContain('winning creative asset id');
  });

  it('requires winning asset reuse coverage for every scale decision', () => {
    const report = buildCommerceChain({
      skuCount: 10,
      brief: 'Launch 10 storage SKUs.',
      assets: ['winning creative', 'performance report'],
      channels: ['TikTok Shop'],
      productionProviderConfigured: true,
      crmOwner: 'ops',
      distributionPlanCount: 3,
      draftPlanCount: 2,
      readyPlanCount: 1,
      distributionDispatchCount: 1,
      executableDispatchCount: 1,
      measuredDispatchCount: 1,
      performanceReturnCount: 1,
      reportAssetCount: 1,
      scaleDecisionCount: 2,
      nextRoundAssetPlanCount: 1,
    });

    const reuseCheck = report.acceptanceGate.checklist.find(item => item.item === 'Next-round plans reuse winning assets');
    expect(reuseCheck?.ok).toBe(false);
    expect(reuseCheck?.evidence).toContain('scaleDecisions=2');
    expect(report.acceptanceGate.verdict).toBe('conditional');
  });

  it('keeps commerce acceptance conditional when scaled assets have unresolved attribution', () => {
    const report = buildCommerceChain({
      skuCount: 10,
      brief: 'Launch 10 storage SKUs.',
      assets: ['winning creative', 'performance report'],
      channels: ['TikTok Shop'],
      productionProviderConfigured: true,
      crmOwner: 'ops',
      distributionPlanCount: 2,
      draftPlanCount: 1,
      readyPlanCount: 1,
      distributionDispatchCount: 1,
      executableDispatchCount: 1,
      measuredDispatchCount: 1,
      performanceReturnCount: 1,
      reportAssetCount: 1,
      scaleDecisionCount: 1,
      nextRoundAssetPlanCount: 1,
      assetMatchIssueCount: 1,
      assetMatchAmbiguousCount: 1,
      assetMatchUnmatchedCount: 0,
    });

    const attributionCheck = report.acceptanceGate.checklist.find(item => item.item === 'Performance attribution is resolved');
    expect(attributionCheck?.ok).toBe(false);
    expect(attributionCheck?.evidence).toContain('ambiguous=1');
    expect(report.acceptanceGate.verdict).toBe('conditional');
    expect(report.acceptanceGate.p1.join(' ')).toContain('Resolve ambiguous or unmatched platform asset names');
  });

  it('blocks commerce acceptance when ready distribution uses unapproved or rights-unready assets', () => {
    const report = buildCommerceChain({
      skuCount: 10,
      brief: 'Launch 10 storage SKUs.',
      assets: ['launch video'],
      channels: ['TikTok Shop'],
      productionProviderConfigured: true,
      crmOwner: 'ops',
      distributionPlanCount: 1,
      readyPlanCount: 1,
      distributionDispatchCount: 1,
      executableDispatchCount: 1,
      measuredDispatchCount: 1,
      performanceReturnCount: 1,
      reportAssetCount: 1,
      assetGovernanceIssueCount: 1,
      blockedAssetCount: 0,
      rightsIssueAssetCount: 1,
    });

    const assetGate = report.acceptanceGate.checklist.find(item => item.item === 'Asset rights and approval are clear');
    expect(assetGate?.ok).toBe(false);
    expect(assetGate?.evidence).toContain('rightsIssues=1');
    expect(report.acceptanceGate.verdict).toBe('fail');
    expect(report.acceptanceGate.p0.join(' ')).toContain('Approve production assets');
  });

  it('blocks commerce acceptance when published dispatch evidence or review import is missing', () => {
    const report = buildCommerceChain({
      skuCount: 10,
      brief: 'Launch 10 storage SKUs.',
      assets: ['launch video'],
      channels: ['TikTok Shop'],
      productionProviderConfigured: true,
      crmOwner: 'ops',
      distributionPlanCount: 1,
      readyPlanCount: 1,
      distributionDispatchCount: 1,
      executableDispatchCount: 1,
      publishedDispatchCount: 1,
      publishedWithEvidenceCount: 0,
      missingPublishEvidenceCount: 1,
      overdueReviewDispatchCount: 1,
      measuredDispatchCount: 0,
      performanceReturnCount: 0,
      reportAssetCount: 0,
    });

    const evidenceGate = report.acceptanceGate.checklist.find(item => item.item === 'Published dispatch has evidence and review timing');
    expect(evidenceGate?.ok).toBe(false);
    expect(evidenceGate?.evidence).toContain('missingEvidence=1');
    expect(report.acceptanceGate.verdict).toBe('fail');
    expect(report.acceptanceGate.p0.join(' ')).toContain('Attach publish evidence URLs');
  });
});

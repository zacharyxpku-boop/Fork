import { describe, expect, it } from 'vitest';
import { POST } from '@/app/api/performance-import/route';
import { evaluatePerformanceImport, parsePerformanceCsv } from '@/lib/performance-import';
import {
  addContentAsset,
  addDistributionPlan,
  createDistributionDispatch,
  getIndustrializationSnapshot,
  listContentAssets,
  listDistributionPlans,
  listPerformanceReturns,
} from '@/lib/industrial-chain-store';

const csv = `sku,asset,platform,impressions,clicks,spend,orders,revenue
storage-box,hook-a,TikTok,10000,260,120,12,520
storage-box,hook-b,TikTok,8000,70,90,1,60
storage-box,hook-c,TikTok,5000,12,80,0,0`;

describe('performance import loop', () => {
  it('parses platform CSV into traceable SKU asset rows', () => {
    const rows = parsePerformanceCsv(csv);

    expect(rows).toHaveLength(3);
    expect(rows[0]).toMatchObject({ sku: 'storage-box', asset: 'hook-a', platform: 'TikTok' });
    expect(rows[0].spend).toBe(120);
  });

  it('turns returned performance into next-round decisions', () => {
    const report = evaluatePerformanceImport(parsePerformanceCsv(csv));

    expect(report.summary.scaleCount).toBe(1);
    expect(report.summary.iterateCount).toBe(1);
    expect(report.summary.pauseCount).toBe(1);
    expect(report.decisions.map(item => item.decision)).toEqual(['scale', 'iterate', 'pause']);
  });

  it('serves the CSV import report through /api/performance-import', async () => {
    const response = await POST(new Request('http://localhost/api/performance-import', {
      method: 'POST',
      body: JSON.stringify({ csv }),
    }) as unknown as Parameters<typeof POST>[0]);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.report.acceptanceNotes.join(' ')).toContain('POC');
    expect(body.report.decisions[0].decision).toBe('scale');
    expect(body.performanceRecord).toBeNull();
  });

  it('returns stable error codes and Chinese guidance for invalid CSV imports', async () => {
    const missing = await POST(new Request('http://localhost/api/performance-import', {
      method: 'POST',
      body: JSON.stringify({ csv: '' }),
    }) as unknown as Parameters<typeof POST>[0]);
    const missingBody = await missing.json();
    expect(missing.status).toBe(400);
    expect(missingBody.error).toBe('performance_csv_required');
    expect(missingBody.message).toContain('平台表现 CSV');

    const emptyRows = await POST(new Request('http://localhost/api/performance-import', {
      method: 'POST',
      body: JSON.stringify({ csv: 'sku,asset,platform' }),
    }) as unknown as Parameters<typeof POST>[0]);
    const emptyRowsBody = await emptyRows.json();
    expect(emptyRows.status).toBe(422);
    expect(emptyRowsBody.error).toBe('performance_rows_not_found');
    expect(emptyRowsBody.message).toContain('impressions');
  });

  it('can persist platform returns into the industrial performance ledger', async () => {
    const orgId = `perf-ledger-${Date.now()}`;
    const projectId = `perf-project-${Date.now()}`;
    const response = await POST(new Request('http://localhost/api/performance-import', {
      method: 'POST',
      headers: { 'x-tenant-id': orgId },
      body: JSON.stringify({ csv, projectId, dispatchId: 'dispatch-1' }),
    }) as unknown as Parameters<typeof POST>[0]);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.performanceRecord.rowCount).toBe(3);
    expect(body.performanceRecord.summary.scaleCount).toBe(1);
    expect(body.performanceReportAsset.type).toBe('report');
    expect(body.performanceReportAsset.source).toBe('performance-import');
    expect(body.nextRoundPlans).toHaveLength(1);
    expect(body.nextRoundPlans[0]).toMatchObject({
      channel: 'TikTok',
      status: 'draft',
      assetIds: [body.performanceReportAsset.id],
    });
    await expect(listPerformanceReturns(orgId, projectId)).resolves.toHaveLength(1);
    await expect(listContentAssets(orgId, projectId)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: body.performanceReportAsset.id,
          type: 'report',
          source: 'performance-import',
        }),
      ]),
    );
    await expect(listDistributionPlans(orgId, projectId)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: body.nextRoundPlans[0].id,
          status: 'draft',
          assetIds: [body.performanceReportAsset.id],
        }),
      ]),
    );
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(snapshot.performanceReturnCount).toBe(1);
    expect(snapshot.scaleDecisionCount).toBe(1);
  });

  it('carries matched winning asset ids into next-round scale plans', async () => {
    const orgId = `perf-lineage-${Date.now()}`;
    const projectId = `perf-lineage-project-${Date.now()}`;
    const winner = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Winning hook video',
      evidence: 'Published creative asset that won the first round',
    });
    const lineageCsv = `sku,asset,platform,impressions,clicks,spend,orders,revenue
storage-box,${winner.id},TikTok,10000,280,120,12,580`;

    const response = await POST(new Request('http://localhost/api/performance-import', {
      method: 'POST',
      headers: { 'x-tenant-id': orgId },
      body: JSON.stringify({ csv: lineageCsv, projectId }),
    }) as unknown as Parameters<typeof POST>[0]);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.nextRoundPlans).toHaveLength(1);
    expect(body.nextRoundPlans[0].assetIds).toContain(body.performanceReportAsset.id);
    expect(body.nextRoundPlans[0].assetIds).toContain(winner.id);
    await expect(listDistributionPlans(orgId, projectId)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: body.nextRoundPlans[0].id,
          assetIds: expect.arrayContaining([body.performanceReportAsset.id, winner.id]),
        }),
      ]),
    );
  });

  it('matches platform creative names back to project asset titles for scale lineage', async () => {
    const orgId = `perf-title-lineage-${Date.now()}`;
    const projectId = `perf-title-lineage-project-${Date.now()}`;
    const winner = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Winning Hook Video V2',
      url: 'https://cdn.example.test/winning-hook-v2.mp4',
      source: 'kuaizi-task-1001',
      tags: ['creative-1001'],
      evidence: 'Platform export uses the creative title, not Wenai asset id',
    });
    const titleCsv = `sku,asset,platform,impressions,clicks,spend,orders,revenue
storage-box,winning hook video v2,TikTok,10000,280,120,12,580`;

    const response = await POST(new Request('http://localhost/api/performance-import', {
      method: 'POST',
      headers: { 'x-tenant-id': orgId },
      body: JSON.stringify({ csv: titleCsv, projectId }),
    }) as unknown as Parameters<typeof POST>[0]);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.nextRoundPlans).toHaveLength(1);
    expect(body.nextRoundPlans[0].assetIds).toContain(winner.id);
    expect(body.nextRoundPlans[0].assetIds).toContain(body.performanceReportAsset.id);
    expect(body.performanceReportAsset.evidence).toContain('Asset matches: 1');
    expect(body.assetMatchSummary).toMatchObject({
      matchedCount: 1,
      ambiguousCount: 0,
      unmatchedCount: 0,
      matched: [{ assetRef: 'winning hook video v2', assetId: winner.id }],
    });
  });

  it('does not attach ambiguous creative-name matches to next-round plans', async () => {
    const orgId = `perf-ambiguous-lineage-${Date.now()}`;
    const projectId = `perf-ambiguous-lineage-project-${Date.now()}`;
    const first = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Duplicate Hook',
      evidence: 'First candidate with the same platform creative name',
    });
    const second = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Duplicate Hook',
      evidence: 'Second candidate with the same platform creative name',
    });
    const ambiguousCsv = `sku,asset,platform,impressions,clicks,spend,orders,revenue
storage-box,Duplicate Hook,TikTok,10000,280,120,12,580`;

    const response = await POST(new Request('http://localhost/api/performance-import', {
      method: 'POST',
      headers: { 'x-tenant-id': orgId },
      body: JSON.stringify({ csv: ambiguousCsv, projectId }),
    }) as unknown as Parameters<typeof POST>[0]);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.nextRoundPlans).toHaveLength(1);
    expect(body.nextRoundPlans[0].assetIds).toEqual([body.performanceReportAsset.id]);
    expect(body.nextRoundPlans[0].assetIds).not.toContain(first.id);
    expect(body.nextRoundPlans[0].assetIds).not.toContain(second.id);
    expect(body.performanceReportAsset.evidence).toContain('Ambiguous asset matches: 1');
    expect(body.performanceReportAsset.evidence).toContain('ambiguous: Duplicate Hook');
    expect(body.assetMatchSummary.ambiguousCount).toBe(1);
    expect(body.assetMatchSummary.ambiguous[0]).toMatchObject({
      assetRef: 'Duplicate Hook',
      assetIds: expect.arrayContaining([first.id, second.id]),
    });
    await expect(listPerformanceReturns(orgId, projectId)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          assetMatchSummary: expect.objectContaining({
            ambiguousCount: 1,
            unmatchedCount: 0,
          }),
        }),
      ]),
    );
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(snapshot.assetMatchIssueCount).toBe(1);
    expect(snapshot.assetMatchAmbiguousCount).toBe(1);
    expect(snapshot.missingLinks).toContain('Unresolved performance asset attribution (ambiguous=1; unmatched=0)');
  });

  it('marks a real dispatch as measured when performance is imported for that dispatch', async () => {
    const orgId = `perf-dispatch-${Date.now()}`;
    const projectId = `perf-dispatch-project-${Date.now()}`;
    const asset = await addContentAsset(orgId, {
      projectId,
      type: 'video',
      title: 'Hook video',
      evidence: 'Published creative asset',
    });
    await addContentAsset(orgId, {
      projectId,
      type: 'brief',
      title: 'Launch brief',
      evidence: 'Approved launch claim sheet',
    });
    await addContentAsset(orgId, {
      projectId,
      type: 'benchmark',
      title: 'Benchmark',
      evidence: 'Reference hooks and metrics',
    });
    const plan = await addDistributionPlan(orgId, {
      projectId,
      channel: 'TikTok',
      assetIds: [asset.id],
      status: 'ready',
    });
    const dispatch = await createDistributionDispatch(orgId, { planId: plan.id });

    const response = await POST(new Request('http://localhost/api/performance-import', {
      method: 'POST',
      headers: { 'x-tenant-id': orgId },
      body: JSON.stringify({
        csv: `sku,asset,platform,impressions,clicks,spend,orders,revenue
storage-box,${asset.id},TikTok,10000,260,120,12,520`,
        projectId,
        dispatchId: dispatch.id,
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.performanceReportAsset.type).toBe('report');
    expect(body.nextRoundPlans).toHaveLength(1);
    expect(body.measuredDispatch.status).toBe('measured');
    expect(body.measuredDispatch.handoffPackage.assetIds).toContain(body.performanceReportAsset.id);
    expect(body.measuredDispatch.handoffPackage.assetIds).toContain(asset.id);
    expect(body.measuredDispatch.notes).toContain('Performance CSV imported');
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(snapshot.measuredDispatchCount).toBe(1);
    expect(snapshot.performanceReturnCount).toBe(1);
    expect(snapshot.missingLinks).not.toContain('No dispatch has measured performance evidence yet');
  });
});

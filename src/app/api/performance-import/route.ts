import { NextRequest, NextResponse } from 'next/server';
import { evaluatePerformanceImport, parsePerformanceCsv } from '@/lib/performance-import';
import { resolveOrgId } from '@/lib/org-id';
import {
  addContentAsset,
  addDistributionPlan,
  addPerformanceReturn,
  type ContentAssetRecord,
  type IndustrialAssetMatchSummary,
  listContentAssets,
  updateDistributionDispatch,
} from '@/lib/industrial-chain-store';

function normalizeAssetKey(value: string | undefined) {
  return (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function buildAssetMatchIndex(assets: ContentAssetRecord[]) {
  const index = new Map<string, Set<string>>();
  for (const asset of assets) {
    [
      asset.id,
      asset.title,
      asset.url,
      asset.source,
      ...asset.tags,
    ].forEach(value => {
      const key = normalizeAssetKey(value);
      if (!key) return;
      const ids = index.get(key) || new Set<string>();
      ids.add(asset.id);
      index.set(key, ids);
    });
  }
  return index;
}

function summarizeAssetMatches(decisionAssetNames: string[], index: ReturnType<typeof buildAssetMatchIndex>) {
  const matched = new Map<string, string>();
  const ambiguous = new Map<string, string[]>();
  const unmatched = new Set<string>();
  for (const raw of decisionAssetNames) {
    const key = normalizeAssetKey(raw);
    if (!key) continue;
    const ids = index.get(key);
    if (!ids || ids.size === 0) {
      unmatched.add(raw);
    } else if (ids.size === 1) {
      matched.set(raw, Array.from(ids)[0]);
    } else {
      ambiguous.set(raw, Array.from(ids));
    }
  }
  return { matched, ambiguous, unmatched };
}

function serializeAssetMatchSummary(summary: ReturnType<typeof summarizeAssetMatches>): IndustrialAssetMatchSummary {
  return {
    matchedCount: summary.matched.size,
    ambiguousCount: summary.ambiguous.size,
    unmatchedCount: summary.unmatched.size,
    matched: Array.from(summary.matched.entries()).map(([assetRef, assetId]) => ({ assetRef, assetId })),
    ambiguous: Array.from(summary.ambiguous.entries()).map(([assetRef, assetIds]) => ({ assetRef, assetIds })),
    unmatched: Array.from(summary.unmatched),
  };
}

export async function POST(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const body = await request.json().catch(() => null) as { csv?: string; projectId?: string; dispatchId?: string; persist?: boolean } | null;
  const csv = body?.csv?.trim();
  if (!csv) {
    return NextResponse.json({
      error: 'performance_csv_required',
      message: '请粘贴平台表现 CSV，再生成复盘决策。',
    }, { status: 400 });
  }

  const rows = parsePerformanceCsv(csv);
  if (rows.length === 0) {
    return NextResponse.json({
      error: 'performance_rows_not_found',
      message: '没有识别到可复盘的数据行。至少需要 impressions/clicks/spend/orders/revenue 中的一列。',
    }, { status: 422 });
  }

  const report = evaluatePerformanceImport(rows);
  const projectAssets = body?.projectId
    ? await listContentAssets(orgId, body.projectId, 500)
    : [];
  const projectAssetIndex = buildAssetMatchIndex(projectAssets);
  const assetMatchSummary = summarizeAssetMatches(report.decisions.map(item => item.row.asset), projectAssetIndex);
  const serializedAssetMatchSummary = serializeAssetMatchSummary(assetMatchSummary);
  const resolveAssetId = (value: string) => assetMatchSummary.matched.get(value);
  const matchedDecisionAssetIds = Array.from(new Set(Array.from(assetMatchSummary.matched.values())));
  const performanceRecord = body?.projectId || body?.persist
    ? await addPerformanceReturn(orgId, {
      projectId: body.projectId,
      dispatchId: body.dispatchId,
      source: 'csv-import',
      report,
      assetMatchSummary: serializedAssetMatchSummary,
    })
    : null;
  const performanceReportAsset = performanceRecord
    ? await addContentAsset(orgId, {
      projectId: performanceRecord.projectId,
      type: 'report',
      title: `Performance return report: ${performanceRecord.projectId}`,
      source: 'performance-import',
      tags: [
        'performance-return',
        report.summary.scaleCount > 0 ? 'scale-ready' : '',
        report.summary.iterateCount > 0 ? 'iterate' : '',
        report.summary.pauseCount > 0 ? 'pause' : '',
      ].filter(Boolean),
      evidence: [
        `Rows: ${report.rows.length}`,
        `Scale: ${report.summary.scaleCount}`,
        `Iterate: ${report.summary.iterateCount}`,
        `Pause: ${report.summary.pauseCount}`,
        `Spend: ${report.summary.totalSpend}`,
        `Revenue: ${report.summary.totalRevenue}`,
        `Asset matches: ${assetMatchSummary.matched.size}`,
        `Ambiguous asset matches: ${assetMatchSummary.ambiguous.size}`,
        `Unmatched assets: ${assetMatchSummary.unmatched.size}`,
        ...Array.from(assetMatchSummary.ambiguous.keys()).slice(0, 5).map(item => `ambiguous: ${item}`),
        ...Array.from(assetMatchSummary.unmatched).slice(0, 5).map(item => `unmatched: ${item}`),
        ...report.decisions.slice(0, 5).map(item => `${item.decision}: ${item.row.sku} / ${item.row.asset} / ${item.row.platform}`),
      ].join('\n').slice(0, 2000),
    })
    : null;
  const measuredDispatch = performanceRecord && body?.dispatchId
    ? await updateDistributionDispatch(orgId, body.dispatchId, {
      status: 'measured',
      assetIds: performanceReportAsset
        ? Array.from(new Set([performanceReportAsset.id, ...matchedDecisionAssetIds]))
        : matchedDecisionAssetIds,
      notes: `Performance CSV imported: ${report.rows.length} rows; scale=${report.summary.scaleCount}, iterate=${report.summary.iterateCount}, pause=${report.summary.pauseCount}.`,
    })
    : null;
  const nextRoundPlans = performanceRecord && performanceReportAsset
    ? await Promise.all(report.decisions
      .filter(item => item.decision === 'scale')
      .slice(0, 5)
      .map(item => addDistributionPlan(orgId, {
        projectId: performanceRecord.projectId,
        channel: item.row.platform,
        assetIds: Array.from(new Set([
          performanceReportAsset.id,
          resolveAssetId(item.row.asset) || '',
        ].filter(Boolean))),
        status: 'draft',
        owner: 'ops',
        returnMetric: 'CTR / CPC / orders / revenue',
        nextReviewAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      })))
    : [];

  return NextResponse.json({
    report,
    performanceRecord,
    performanceReportAsset,
    measuredDispatch,
    nextRoundPlans,
    assetMatchSummary: serializedAssetMatchSummary,
  });
}

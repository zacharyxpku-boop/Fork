import { describe, expect, it } from 'vitest';

import { GET, POST } from '@/app/api/scale-claims/route';
import {
  buildScaleClaimAuditChecklist,
  getScaleClaimSnapshot,
  scaleClaimSnapshotFacts,
  upsertScaleClaimRecord,
} from '@/lib/scale-claim-ledger';
import { evaluateProductReadiness } from '@/lib/product-readiness';

describe('scale claim ledger', () => {
  it('keeps Kuaizi-scale numbers locked until Wenai has audited ledgers', async () => {
    const orgId = `scale-guard-${Date.now()}`;
    const projectId = 'scale-project';

    await upsertScaleClaimRecord(orgId, {
      projectId,
      metric: 'creative_output',
      count: 1200,
      platform: 'TikTok Shop',
      source: 'manual-audit',
      dateRange: '2026-05-01..2026-05-18',
      dedupeRule: 'unique asset id plus platform receipt id',
      evidenceUrl: 'https://evidence.example.test/creative-ledger',
      auditorNote: 'customer confirmed ledger sample',
    });
    await upsertScaleClaimRecord(orgId, {
      projectId,
      metric: 'video_distribution',
      count: 320,
      platform: 'TikTok Shop',
      source: 'manual-audit',
      dateRange: '2026-05-01..2026-05-18',
      dedupeRule: 'unique platform video id',
      evidenceUrl: 'https://evidence.example.test/video-ledger',
      auditorNote: 'customer confirmed distribution sample',
    });

    const snapshot = await getScaleClaimSnapshot(orgId, projectId);
    const checklist = buildScaleClaimAuditChecklist(snapshot);
    expect(snapshot.creativeOutputCount).toBe(1200);
    expect(snapshot.videoDistributionCount).toBe(320);
    expect(snapshot.ledgerRecordCount).toBe(2);
    expect(snapshot.canDisplayCreativeBenchmark).toBe(false);
    expect(snapshot.canDisplayVideoBenchmark).toBe(false);
    expect(snapshot.missingLinks).toContain('Audited creative output below 91M benchmark');
    expect(snapshot.missingLinks).toContain('Audited video distribution below 42M benchmark');
    expect(checklist).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'owned-ledger', ready: true }),
      expect.objectContaining({ id: 'evidence-urls', ready: true }),
      expect.objectContaining({ id: 'public-claim-boundary', ready: false }),
    ]));
  });

  it('keeps the public scale checklist fail-closed when evidence is incomplete', async () => {
    const orgId = `scale-checklist-${Date.now()}`;
    const projectId = 'scale-checklist-project';

    await upsertScaleClaimRecord(orgId, {
      projectId,
      metric: 'creative_output',
      count: 91_000_000,
      platform: 'audited-production-ledger',
      source: 'customer-confirmed-ledger',
      dateRange: '2025-01-01..2026-05-18',
      dedupeRule: 'unique generated asset id reconciled to production task id',
      evidenceUrl: '',
      auditorNote: 'auditor confirmed creative output count',
    });
    await upsertScaleClaimRecord(orgId, {
      projectId,
      metric: 'video_distribution',
      count: 42_000_000,
      platform: 'audited-platform-ledger',
      source: 'customer-confirmed-ledger',
      dateRange: '',
      dedupeRule: 'unique platform video id reconciled to dispatch id',
      evidenceUrl: 'https://evidence.example.test/video-42m',
      auditorNote: 'auditor confirmed video distribution count',
    });

    const snapshot = await getScaleClaimSnapshot(orgId, projectId);
    const checklist = buildScaleClaimAuditChecklist(snapshot);

    expect(snapshot.canDisplayCreativeBenchmark).toBe(false);
    expect(snapshot.canDisplayVideoBenchmark).toBe(false);
    expect(checklist).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'evidence-urls', ready: false, severity: 'P0' }),
      expect.objectContaining({ id: 'date-range', ready: false, severity: 'P0' }),
      expect.objectContaining({
        id: 'public-claim-boundary',
        ready: false,
        publicClaimBoundary: expect.stringContaining('竞品 benchmark'),
      }),
    ]));
  });

  it('feeds audited scale facts into product readiness guards without leaking competitor numbers as Wenai claims', async () => {
    const orgId = `scale-readiness-${Date.now()}`;
    const projectId = 'scale-readiness-project';
    await upsertScaleClaimRecord(orgId, {
      projectId,
      metric: 'creative_output',
      count: 91_000_000,
      platform: 'audited-production-ledger',
      source: 'customer-confirmed-ledger',
      dateRange: '2025-01-01..2026-05-18',
      dedupeRule: 'unique generated asset id reconciled to production task id',
      evidenceUrl: 'https://evidence.example.test/creative-91m',
      auditorNote: 'auditor confirmed creative output count',
    });
    await upsertScaleClaimRecord(orgId, {
      projectId,
      metric: 'video_distribution',
      count: 42_000_000,
      platform: 'audited-platform-ledger',
      source: 'customer-confirmed-ledger',
      dateRange: '2025-01-01..2026-05-18',
      dedupeRule: 'unique platform video id reconciled to dispatch id',
      evidenceUrl: 'https://evidence.example.test/video-42m',
      auditorNote: 'auditor confirmed video distribution count',
    });
    const snapshot = await getScaleClaimSnapshot(orgId, projectId);
    const report = evaluateProductReadiness({
      aiConfigured: true,
      storageConfigured: true,
      kuaiziConfigured: true,
      imageConfigured: true,
      videoConfigured: true,
      videoTeardownConfigured: true,
      performanceImportAvailable: true,
      commerceChainAvailable: true,
      industrialChainAvailable: true,
      distributionExecutionAvailable: true,
      emailConfigured: true,
      authConfigured: true,
      project: {
        orgId,
        projectId,
        assetCount: 1,
        planCount: 1,
        readyPlanCount: 1,
        dispatchCount: 1,
        executableDispatchCount: 1,
        publishedDispatchCount: 1,
        measuredDispatchCount: 1,
        performanceReturnCount: 1,
        scaleDecisionCount: 1,
        missingLinks: [],
        nextActions: [],
        ...scaleClaimSnapshotFacts(snapshot),
      },
    });

    expect(report.scaleClaimGuards).toEqual(expect.arrayContaining([
      expect.objectContaining({ requestedBenchmark: '91M+ creative output', canDisplay: true }),
      expect.objectContaining({ requestedBenchmark: '42M+ video distribution', canDisplay: true }),
    ]));
  });

  it('serves audited scale records through the API and rejects empty writes', async () => {
    const headers = { 'x-org-id': `scale-api-${Date.now()}` };
    const emptyRes = await POST(new Request('http://localhost/api/scale-claims', {
      method: 'POST',
      headers,
      body: JSON.stringify({ projectId: 'scale-api-project' }),
    }) as unknown as Parameters<typeof POST>[0]);
    expect(emptyRes.status).toBe(400);

    const postRes = await POST(new Request('http://localhost/api/scale-claims', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        projectId: 'scale-api-project',
        records: [{
          metric: 'creative_output',
          count: 100,
          platform: 'manual',
          source: 'manual-audit',
          dateRange: '2026-05',
          dedupeRule: 'unique asset id',
          evidenceUrl: 'https://evidence.example.test/scale',
          auditorNote: 'ops verified sample',
        }],
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    expect(postRes.status).toBe(201);
    const postBody = await postRes.json();
    expect(postBody.snapshot.creativeOutputCount).toBe(100);
    expect(postBody.snapshot.canDisplayCreativeBenchmark).toBe(false);
    expect(postBody.auditChecklist).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'owned-ledger', ready: false }),
    ]));

    const getRes = await GET(new Request('http://localhost/api/scale-claims?projectId=scale-api-project', {
      headers,
    }) as unknown as Parameters<typeof GET>[0]);
    const getBody = await getRes.json();
    expect(getBody.records).toHaveLength(1);
    expect(getBody.auditChecklist).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'public-claim-boundary', ready: false }),
    ]));
    expect(getBody.snapshot.missingLinks).toContain('Missing audited video distribution count');
  });
});

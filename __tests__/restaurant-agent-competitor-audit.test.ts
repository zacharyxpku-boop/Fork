import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantCompetitorAuditReport } from '@/lib/restaurant-agent-competitor-audit';

describe('restaurant agent competitor audit', () => {
  it('maps public Claw Lobu OpenClaw and Hermes patterns into restaurant agent dimensions', () => {
    const report = buildRestaurantCompetitorAuditReport();

    expect(report.payloadShape).toBe('restaurant-agent-competitor-audit-v1');
    expect(report.sources.map(source => source.id)).toEqual(['abacus-claw', 'lobu', 'openclaw', 'hermes']);
    expect(report.dimensions.map(dimension => dimension.id)).toEqual([
      'multi-tenant-runtime',
      'shared-memory-watchers',
      'cloud-agent-ops',
      'browser-execution',
      'secret-proxy-tool-policy',
      'execution-receipts',
      'restaurant-platform-data',
    ]);
    expect(report.audit.publicSourceBacked).toBe(true);
    expect(report.audit.fakeExecutionIncluded).toBe(false);
    expect(report.summary.total).toBe(7);
    expect(report.summary.internalConnectors).toBeGreaterThan(20);
    expect(report.dimensions.find(dimension => dimension.id === 'cloud-agent-ops')?.targetState).toContain('next wakeup');
  });

  it('keeps platform and POS data closure external-required while preserving internal build order', () => {
    const report = buildRestaurantCompetitorAuditReport();
    const dataClosure = report.dimensions.find(dimension => dimension.id === 'restaurant-platform-data');

    expect(dataClosure).toEqual(expect.objectContaining({
      status: 'external-required',
      externalRequired: expect.stringContaining('Merchant account authorization'),
    }));
    expect(dataClosure?.safetyBoundary).toContain('do not scrape backends');
    expect(report.nextBuildOrder[0].buildableNow).toBe(true);
    expect(report.nextBuildOrder.at(-1)?.dimensionId).toBe('restaurant-platform-data');
  });

  it('exposes the source-backed audit through the runtime API', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({ action: 'competitor-audit' }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.competitorAudit.payloadShape).toBe('restaurant-agent-competitor-audit-v1');
    expect(payload.competitorAudit.sources.map((source: { name: string }) => source.name)).toContain('Abacus Claw');
    expect(JSON.stringify(payload)).not.toContain('secret-value');
    expect(payload.competitorAudit.audit.privateDataIncluded).toBe(false);
  });
});

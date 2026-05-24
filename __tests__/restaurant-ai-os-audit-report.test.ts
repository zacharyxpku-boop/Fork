import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAiOsAuditReport } from '@/lib/restaurant-ai-os-audit-report';

describe('restaurant AI OS audit report', () => {
  it('aggregates trial, connector, public harvest and operating insight readiness without leaking secrets', () => {
    const report = buildRestaurantAiOsAuditReport({
      restaurant: 'Sandbox Bistro',
      offer: 'Dinner set',
      audience: 'Nearby dinner guests',
      evidence: 'https://example.com/public-store-page',
      env: {
        RESTAURANT_AGENT_OPENCLAW_API_KEY: 'sk-should-not-render',
        RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL: 'https://runtime.example.com',
      },
      now: new Date('2026-05-24T13:00:00.000Z'),
    });
    const serialized = JSON.stringify(report);

    expect(report.payloadShape).toBe('restaurant-ai-os-audit-report-v1');
    expect(report.lanes.map(lane => lane.id)).toEqual([
      'customer-trial-workbench',
      'content-proof-loop',
      'platform-automation',
      'operating-analysis',
      'private-data-boundary',
    ]);
    expect(report.cockpit.payloadShape).toBe('restaurant-activation-cockpit-v1');
    expect(report.connectorMatrix.payloadShape).toBe('restaurant-platform-connector-matrix-v1');
    expect(report.publicHarvest.payloadShape).toBe('restaurant-public-source-harvest-pack-v1');
    expect(report.operatingInsight.payloadShape).toBe('restaurant-operating-insight-report-v1');
    expect(serialized).not.toContain('sk-should-not-render');
    expect(report.safetyBoundary).toContain('does not log in');
    expect(report.safetyBoundary).toContain('expose provider keys');
    expect(report.safetyBoundary).toContain('claim true production automation before provider');
  });

  it('exposes AI OS audit report through the runtime API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ai-os-audit-report',
        restaurant: 'Sandbox Bistro',
        offer: 'Dinner set',
        audience: 'Nearby dinner guests',
        channels: 'Dianping / Xiaohongshu / Douyin / WeChat community',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.aiOsAuditReport.payloadShape).toBe('restaurant-ai-os-audit-report-v1');
    expect(payload.aiOsAuditReport.summary.lanes).toBe(5);
    expect(payload.aiOsAuditReport.externalRequired.length).toBeGreaterThan(0);
    expect(payload.aiOsAuditReport.safetyBoundary).toContain('does not log in');
  });
});

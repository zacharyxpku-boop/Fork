import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantBusinessSignals } from '@/lib/restaurant-agent-business-signals';
import { buildRestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import { buildRestaurantOperatingInsightReport } from '@/lib/restaurant-operating-insight-report';
import { buildRestaurantPosImportReport } from '@/lib/restaurant-pos-import-validator';

describe('restaurant operating insight report', () => {
  it('computes only evidence-backed operating insights from sanitized aggregate POS imports', () => {
    const posImport = buildRestaurantPosImportReport({
      rows: [{
        businessDate: '2026-05-23',
        storeName: 'Sandbox Bistro',
        offerName: 'Dinner set',
        couponClaimCount: 40,
        redemptionCount: 20,
        grossSales: 2400,
        orderCount: 24,
        inventoryUsed: 20,
      }],
      now: new Date('2026-05-24T13:00:00.000Z'),
    });
    const operatingDataContract = buildRestaurantOperatingDataContract({
      posImports: [posImport],
      now: new Date('2026-05-24T13:01:00.000Z'),
    });
    const report = buildRestaurantOperatingInsightReport({
      posImports: [posImport],
      operatingDataContract,
      businessSignals: buildRestaurantBusinessSignals([], [], new Date('2026-05-24T13:02:00.000Z')),
      now: new Date('2026-05-24T13:03:00.000Z'),
    });

    expect(report.payloadShape).toBe('restaurant-operating-insight-report-v1');
    expect(report.verdict).toBe('usable-internal-analysis');
    expect(report.insights.find(item => item.id === 'coupon-redemption-rate')?.value).toContain('50%');
    expect(report.insights.find(item => item.id === 'order-sales-aggregate')?.value).toContain('24 orders');
    expect(report.summary.canClaimTrueOperatingAnalysis).toBe(false);
    expect(report.safetyBoundary).toContain('does not store raw POS rows');
  });

  it('exposes operating insight report through the runtime API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'operating-insight-report',
        rows: [{
          businessDate: '2026-05-23',
          storeName: '北城面馆',
          offerName: '工作日双人套餐',
          couponClaimCount: 38,
          redemptionCount: 21,
          grossSales: 2180,
          orderCount: 24,
          inventoryUsed: 21,
        }],
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.operatingInsightReport.payloadShape).toBe('restaurant-operating-insight-report-v1');
    expect(payload.operatingInsightReport.insights.map((item: { id: string }) => item.id)).toContain('average-ticket');
    expect(payload.operatingInsightReport.safetyBoundary).toContain('does not claim true operating analysis');
  });
});

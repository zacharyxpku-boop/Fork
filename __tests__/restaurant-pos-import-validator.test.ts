import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantPosImportReport } from '@/lib/restaurant-pos-import-validator';
import { clearRestaurantAgentReceiptsForTest } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest } from '@/lib/restaurant-agent-run-store';

describe('restaurant POS import validator', () => {
  it('accepts sanitized POS redemption rows and creates an aggregate receipt draft', () => {
    const report = buildRestaurantPosImportReport({
      eventId: 'restaurant-agent-pos-proof',
      now: new Date('2026-05-23T00:00:00.000Z'),
      rows: [
        {
          businessDate: '2026-05-23',
          storeName: 'North Store',
          offerName: 'Lunch Set',
          couponClaimCount: 20,
          redemptionCount: 12,
          grossSales: 1200,
          orderCount: 12,
          inventoryUsed: 12,
        },
        {
          businessDate: '2026-05-23',
          storeName: 'North Store',
          offerName: 'Dinner Set',
          couponClaimCount: '10',
          redemptionCount: '8',
          grossSales: '880',
          orderCount: '8',
        },
      ],
    });

    expect(report.status).toBe('accepted');
    expect(report.summary).toEqual(expect.objectContaining({
      totalRows: 2,
      validRows: 2,
      couponClaimCount: 30,
      redemptionCount: 20,
      orderCount: 20,
      grossSalesCents: 208000,
    }));
    expect(report.receiptDraft).toEqual(expect.objectContaining({
      signalType: 'redemption',
      couponClaimCount: 30,
      redemptionCount: 20,
    }));
    expect(JSON.stringify(report)).not.toContain('13812345678');
  });

  it('rejects POS rows with customer PII or missing required fields', () => {
    const report = buildRestaurantPosImportReport({
      rows: [
        {
          businessDate: '2026-05-23',
          storeName: 'North Store',
          offerName: 'Lunch Set',
          customerPhone: '13812345678',
          couponClaimCount: 20,
          redemptionCount: 12,
          grossSales: 1200,
        },
      ],
    });

    expect(report.status).toBe('rejected');
    expect(report.receiptDraft).toBeUndefined();
    expect(report.issues.map(item => item.code)).toEqual(expect.arrayContaining([
      'forbidden_sensitive_field',
      'forbidden_sensitive_value',
      'required_field_missing',
    ]));
    expect(report.safetyBoundary).toContain('Raw order rows');
  });

  it('exposes POS import through the runtime API and stores only aggregate receipt data', async () => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();

    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'pos-import',
        restaurant: 'North Store',
        offer: 'Lunch Set',
        operator: 'ops',
        rows: [
          {
            businessDate: '2026-05-23',
            storeName: 'North Store',
            offerName: 'Lunch Set',
            couponClaimCount: 9,
            redemptionCount: 7,
            grossSales: 700,
            orderCount: 7,
          },
        ],
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.posImport.status).toBe('accepted');
    expect(payload.receipt.status).toBe('accepted');
    expect(payload.receipt.businessSignals.redemptionCount).toBe(7);
    expect(payload.businessSignals.summary.redemptions).toBe(7);
    expect(JSON.stringify(payload)).not.toContain('13812345678');
  });
});

import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import { buildRestaurantPosImportReport } from '@/lib/restaurant-pos-import-validator';
import { buildRestaurantStoreDataImportCenter } from '@/lib/restaurant-store-data-import-center';

const rows = [
  {
    businessDate: '2026-05-23',
    storeName: 'Import Bistro',
    offerName: 'Late dinner set',
    channel: 'group-buy coupon',
    couponClaimCount: 38,
    redemptionCount: 21,
    grossSales: 2180,
    orderCount: 24,
    inventoryUsed: 21,
  },
];

describe('restaurant store data import center', () => {
  it('maps store data sources, sample rows and provider gates without claiming true analysis', () => {
    const posImport = buildRestaurantPosImportReport({ rows, eventId: 'event-import-center' });
    const operatingDataContract = buildRestaurantOperatingDataContract({ posImports: [posImport] });
    const center = buildRestaurantStoreDataImportCenter({
      restaurant: 'Import Bistro',
      offer: 'Late dinner set',
      operatingDataContract,
      posImport,
      now: new Date('2026-05-25T10:00:00.000Z'),
    });

    expect(center.payloadShape).toBe('restaurant-store-data-import-center-v1');
    expect(center.summary.sources).toBe(8);
    expect(center.summary.acceptedPosImports).toBe(1);
    expect(center.summary.mappedFields).toBeGreaterThan(0);
    expect(center.summary.missingRequiredFields).toBeGreaterThan(0);
    expect(center.summary.forbiddenFields).toBeGreaterThan(0);
    expect(center.summary.canClaimTrueOperatingAnalysis).toBe(false);
    expect(center.summary.canClaimAutoRedemption).toBe(false);
    expect(center.sources.map(source => source.id)).toContain('finance-margin');
    expect(center.sources.find(source => source.id === 'pos-sales')?.status).toBe('sample-ready');
    expect(center.validationQueue.map(item => item.id)).toContain('field-dictionary');
    expect(center.sampleRows[0].storeName).toBe('Import Bistro');
    expect(JSON.stringify(center)).not.toMatch(/1[3-9]\d{9}/);
    expect(center.safetyBoundary).toContain('不存储原始 POS 数据行');
  });

  it('is returned with operating data contract and the default Claw path API', async () => {
    const contractResponse = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'operating-data-contract',
        restaurant: 'API Import Bistro',
        offer: 'Dinner set',
        rows,
      }),
    }));
    const contractPayload = await contractResponse.json();

    expect(contractResponse.status).toBe(200);
    expect(contractPayload.storeDataImportCenter.payloadShape).toBe('restaurant-store-data-import-center-v1');
    expect(contractPayload.storeDataImportCenter.summary.canClaimTrueOperatingAnalysis).toBe(false);
    expect(contractPayload.storeDataImportCenter.sources.map((item: { id: string }) => item.id)).toContain('coupon-redemption');

    const defaultPathResponse = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claw-experience-default-path',
        restaurant: 'Default Import Bistro',
        offer: 'Dinner set',
      }),
    }));
    const defaultPathPayload = await defaultPathResponse.json();

    expect(defaultPathResponse.status).toBe(200);
    expect(defaultPathPayload.storeDataImportCenter.payloadShape).toBe('restaurant-store-data-import-center-v1');
    expect(defaultPathPayload.storeDataImportCenter.summary.canClaimAutoRedemption).toBe(false);
    expect(defaultPathPayload.storeDataImportCenter.fieldMappings.map((item: { status: string }) => item.status)).toContain('forbidden');
  });
});

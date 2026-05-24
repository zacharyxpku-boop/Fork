import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantPosImportReport } from '@/lib/restaurant-pos-import-validator';

function jsonRequest(body: unknown) {
  return new NextRequest('http://localhost/api/restaurant-agent/runtime', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('restaurant operating data contract', () => {
  afterEach(() => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
  });

  it('separates internal imports from provider-gated operating claims', () => {
    const dispatch = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'North City Noodles',
      offer: 'Lunch beef noodle set',
      owner: 'ops',
      runtimeTarget: 'local',
    });
    const run = recordRestaurantAgentRun(dispatch, 'local', undefined, new Date('2026-05-23T07:55:00.000Z'));
    const receipt = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: 'dianping',
      evidenceUrl: 'https://www.dianping.com/shop/123/review/456',
      screenshotId: 'shot-data-contract',
      operator: 'ops',
      signalType: 'reservation',
      reservationCount: 3,
      summary: 'Public proof and aggregate reservation count imported.',
    }, new Date('2026-05-23T08:00:00.000Z'));
    const posImport = buildRestaurantPosImportReport({
      eventId: 'contract-pos-run',
      now: new Date('2026-05-23T08:05:00.000Z'),
      rows: [{
        businessDate: '2026-05-23',
        storeName: 'North City Noodles',
        offerName: 'Lunch beef noodle set',
        couponClaimCount: 38,
        redemptionCount: 21,
        grossSales: 2180,
        orderCount: 24,
        inventoryUsed: 21,
      }],
    });

    const contract = buildRestaurantOperatingDataContract({
      receipts: [receipt],
      posImports: [posImport],
      now: new Date('2026-05-23T08:10:00.000Z'),
    });

    expect(contract.payloadShape).toBe('restaurant-operating-data-contract');
    expect(contract.summary.tracks).toBe(7);
    expect(contract.summary.acceptedReceipts).toBe(1);
    expect(contract.summary.posImportsAccepted).toBe(1);
    expect(contract.summary.manualImportReady).toBeGreaterThanOrEqual(3);
    expect(contract.summary.providerGated).toBeGreaterThan(0);
    expect(contract.summary.canClaimAutoRedemption).toBe(false);
    expect(contract.summary.canClaimTrueOperatingAnalysis).toBe(false);
    expect(contract.tracks.find(track => track.id === 'coupon-redemption')).toEqual(expect.objectContaining({
      status: 'manual-import-ready',
    }));
    expect(contract.tracks.find(track => track.id === 'finance-margin')).toEqual(expect.objectContaining({
      status: 'provider-gated',
    }));
    expect(contract.importTemplate.map(item => item.field)).toEqual(expect.arrayContaining([
      'businessDate',
      'couponClaimCount',
      'redemptionCount',
      'grossSales',
      'ingredientCost',
    ]));
    expect(contract.providerSetupRequests.map(item => item.provider)).toContain('POS/redemption data source');
    expect(contract.safetyBoundary).toContain('raw POS rows');
    expect(JSON.stringify(contract)).not.toContain('13800138000');
    expect(JSON.stringify(contract)).not.toContain('api_key');
    expect(JSON.stringify(contract)).not.toContain('token=');
  });

  it('exposes the data contract through the runtime API with optional POS rows', async () => {
    const response = await POST(jsonRequest({
      action: 'operating-data-contract',
      rows: [{
        businessDate: '2026-05-23',
        storeName: 'River Bistro',
        offerName: 'Weekend dinner set',
        couponClaimCount: 12,
        redemptionCount: 8,
        grossSales: 864,
        orderCount: 8,
        inventoryUsed: 8,
      }],
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.operatingDataContract.payloadShape).toBe('restaurant-operating-data-contract');
    expect(payload.posImport.status).toBe('accepted');
    expect(payload.operatingDataContract.summary.posImportsAccepted).toBe(1);
    expect(payload.operatingDataContract.operatingQuestions.map((item: { question: string }) => item.question)).toContain('Can Wenai claim automatic redemption?');
  });
});

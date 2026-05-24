import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantPostRunReviewPack } from '@/lib/restaurant-post-run-review-pack';
import { buildRestaurantPosImportReport } from '@/lib/restaurant-pos-import-validator';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantStoreManagerTaskQueue, clearRestaurantStoreManagerTasksForTest } from '@/lib/restaurant-store-manager-task-store';
import { clearRestaurantProviderSetupStateForTest } from '@/lib/restaurant-provider-setup-state-store';

describe('restaurant post run review pack', () => {
  beforeEach(() => {
    clearRestaurantProviderSetupStateForTest();
    clearRestaurantStoreManagerTasksForTest();
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
  });

  it('blocks post-run claims when proof is missing', () => {
    const pack = buildRestaurantPostRunReviewPack({
      restaurant: 'Proof Bistro',
      offer: 'Lunch set',
      queue: buildRestaurantStoreManagerTaskQueue(new Date('2026-05-24T12:00:00.000Z')),
      runs: [],
      receipts: [],
      readiness: buildRestaurantExternalReadiness({}),
      now: new Date('2026-05-24T12:01:00.000Z'),
    });

    expect(pack.payloadShape).toBe('restaurant-post-run-review-pack-v1');
    expect(pack.verdict).toBe('needs-proof');
    expect(pack.summary.acceptedReceipts).toBe(0);
    expect(pack.summary.canClaimTrueOperatingAnalysis).toBe(false);
    expect(pack.lanes.find(item => item.id === 'proof')?.status).toBe('blocked');
    expect(pack.nextLoopSop[0].stopLine).toContain('No accepted proof');
  });

  it('turns accepted proof and sanitized POS aggregates into next-loop SOP without raw data claims', () => {
    const dispatch = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'Proof Bistro',
      offer: 'Lunch set',
      owner: 'ops',
    });
    const run = recordRestaurantAgentRun(dispatch, 'openclaw', {
      ok: true,
      target: 'openclaw',
      status: 'forwarded',
      message: 'forwarded',
      externalRunId: 'openclaw-proof-1',
      audit: {
        secretExposed: false,
        payloadShape: 'restaurant-agent-external-execution-v1',
        blockedActions: [],
        canForward: true,
      },
    }, new Date('2026-05-24T12:10:00.000Z'));
    const receipt = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: 'Dianping',
      evidenceUrl: 'https://www.dianping.com/shop/123/review/456',
      screenshotId: 'shot-public-proof',
      externalRunId: 'openclaw-proof-1',
      operator: 'external-runtime',
      summary: 'Public proof was captured and includes aggregate visit intent.',
      signalType: 'redemption',
      couponClaimCount: 38,
      redemptionCount: 21,
      visitIntentCount: 9,
    }, new Date('2026-05-24T12:11:00.000Z'));
    const posImport = buildRestaurantPosImportReport({
      eventId: run.eventId,
      rows: [{
        businessDate: '2026-05-23',
        storeName: 'Proof Bistro',
        offerName: 'Lunch set',
        channel: 'group-buy coupon',
        couponClaimCount: 38,
        redemptionCount: 21,
        grossSales: 2180,
        orderCount: 24,
        inventoryUsed: 21,
      }],
    });

    const pack = buildRestaurantPostRunReviewPack({
      restaurant: 'Proof Bistro',
      offer: 'Lunch set',
      queue: buildRestaurantStoreManagerTaskQueue(new Date('2026-05-24T12:12:00.000Z')),
      runs: [run],
      receipts: [receipt],
      posImports: [posImport],
      readiness: buildRestaurantExternalReadiness({}),
      now: new Date('2026-05-24T12:13:00.000Z'),
    });
    const serialized = JSON.stringify(pack);

    expect(pack.verdict).toBe('manual-review-ready');
    expect(pack.summary.acceptedReceipts).toBe(1);
    expect(pack.summary.acceptedPosImports).toBe(1);
    expect(pack.summary.storeTasks).toBeGreaterThan(0);
    expect(pack.lanes.find(item => item.id === 'proof')?.status).toBe('ready');
    expect(pack.lanes.find(item => item.id === 'operating-data')?.status).toBe('ready');
    expect(pack.nextLoopSop.map(item => item.step)).toContain('Prepare next controlled loop');
    expect(pack.safetyBoundary).toContain('does not invent growth numbers');
    expect(serialized).not.toContain('13800000000');
    expect(serialized).not.toContain('openclaw-secret-value');
  });

  it('is exposed through the runtime API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'post-run-review-pack',
        restaurant: 'API Bistro',
        offer: 'Dinner set',
        rows: [{
          businessDate: '2026-05-23',
          storeName: 'API Bistro',
          offerName: 'Dinner set',
          channel: 'group-buy coupon',
          couponClaimCount: 12,
          redemptionCount: 7,
          grossSales: 988,
          orderCount: 9,
          inventoryUsed: 7,
        }],
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.postRunReviewPack.payloadShape).toBe('restaurant-post-run-review-pack-v1');
    expect(payload.postRunReviewPack.summary.canClaimTrueOperatingAnalysis).toBe(false);
    expect(payload.postRunReviewPack.safetyBoundary).toContain('does not invent growth numbers');
    expect(JSON.stringify(payload)).not.toContain('API key=');
  });
});

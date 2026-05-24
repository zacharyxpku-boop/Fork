import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantBusinessSignals } from '@/lib/restaurant-agent-business-signals';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';

describe('restaurant agent business signals', () => {
  beforeEach(() => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
  });

  afterEach(() => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
  });

  it('aggregates only accepted proof receipts into restaurant operating signals', () => {
    const run = recordRestaurantAgentRun(buildRestaurantAgentDispatch({
      taskId: 'redemption-review',
      restaurant: 'South City Bistro',
      offer: 'Dinner coupon',
      owner: 'Store manager',
    }), 'local');
    const accepted = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: 'Dianping',
      evidenceUrl: 'https://www.dianping.com/shop/123/review/456',
      screenshotId: 'shot-business-proof',
      signalType: 'redemption',
      reservationCount: 3,
      couponClaimCount: 18,
      redemptionCount: 7,
      inquiryCount: 5,
      visitIntentCount: 4,
      summary: 'Public coupon and redemption summary imported.',
    });
    const rejected = recordRestaurantAgentReceipt({
      eventId: 'unknown-event',
      channel: 'Dianping',
      evidenceUrl: 'https://www.dianping.com/shop/123/review/789',
      couponClaimCount: 100,
      summary: 'Should not enter operating analysis.',
    });

    const report = buildRestaurantBusinessSignals([run], [accepted, rejected], new Date('2026-05-23T08:00:00.000Z'));

    expect(report.summary).toEqual(expect.objectContaining({
      acceptedReceipts: 1,
      rejectedReceipts: 1,
      reservations: 3,
      couponClaims: 18,
      redemptions: 7,
      inquiries: 5,
      visitIntent: 4,
      externalDataBlocked: true,
    }));
    expect(report.items[0]).toEqual(expect.objectContaining({
      signalType: 'redemption',
      restaurant: 'South City Bistro',
      owner: 'Store manager',
    }));
    expect(report.blockers.join(' ')).toContain('POS');
    expect(JSON.stringify(report)).not.toContain('100');
  });

  it('exposes business signal aggregation through the runtime API', async () => {
    const runResponse = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 'redemption-review',
        restaurant: 'North City Noodles',
        offer: 'Lunch coupon',
        owner: 'Store manager',
        runtimeTarget: 'local',
      }),
    }) as never);
    const runPayload = await runResponse.json();
    await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'receipt',
        eventId: runPayload.run.eventId,
        channel: 'Dianping',
        evidenceUrl: 'https://www.dianping.com/shop/456/review/888',
        screenshotId: 'shot-business-api',
        signalType: 'coupon-claim',
        couponClaimCount: 12,
        inquiryCount: 2,
        summary: 'Public coupon claim proof imported.',
      }),
    }) as never);

    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({ action: 'business-signals' }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.businessSignals.summary.couponClaims).toBe(12);
    expect(payload.businessSignals.summary.inquiries).toBe(2);
    expect(payload.businessSignals.safetyBoundary).toContain('不宣称自动获客');
  });
});

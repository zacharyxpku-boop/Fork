import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantPlatformOperatingSpine } from '@/lib/restaurant-platform-operating-spine';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';

function jsonRequest(body: unknown) {
  return new NextRequest('http://localhost/api/restaurant-agent/runtime', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('restaurant platform operating spine', () => {
  afterEach(() => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
  });

  it('turns strategy training runs receipts signals and external gates into one platform timeline', () => {
    const dispatch = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'North City Noodles',
      offer: 'Lunch beef noodle set',
      owner: 'ops',
      runtimeTarget: 'local',
    });
    const run = recordRestaurantAgentRun(dispatch, 'local', undefined, new Date('2026-05-23T08:00:00.000Z'));
    const receipt = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: 'dianping',
      evidenceUrl: 'https://www.dianping.com/shop/123/review/456',
      screenshotId: 'shot-platform-spine',
      operator: 'ops',
      summary: 'Public proof imported for the lunch offer.',
      signalType: 'coupon-claim',
      couponClaimCount: 12,
    }, new Date('2026-05-23T08:10:00.000Z'));

    const spine = buildRestaurantPlatformOperatingSpine({
      runs: [run],
      receipts: [receipt],
      now: new Date('2026-05-23T08:15:00.000Z'),
    });

    expect(spine.payloadShape).toBe('restaurant-platform-operating-spine');
    expect(spine.productSpine).toBe('kuaizi-platform-spine-plus-claw-agent-layer');
    expect(spine.summary).toEqual(expect.objectContaining({
      strategyReady: true,
      runs: 1,
      acceptedReceipts: 1,
      businessSignals: 1,
      platformReadiness: 'external-gated',
    }));
    expect(spine.timeline.map(item => item.stage)).toEqual(expect.arrayContaining([
      'strategy',
      'training',
      'receipt',
      'business-signal',
      'external-gate',
    ]));
    expect(spine.externalGates.map(item => item.id)).toEqual(expect.arrayContaining([
      'lobu-runtime',
      'browser-executor',
      'merchant-platform-auth',
      'pos-redemption-data',
    ]));
    expect(spine.auditBoundary.canDoInternallyNow.join(' ')).toContain('evidence ledger');
    expect(spine.auditBoundary.mustHaveExternalBeforeClaiming.join(' ')).toContain('automatic publishing');
    expect(spine.safetyBoundary).toContain('auto-publish');
    expect(JSON.stringify(spine)).not.toContain('api_key');
    expect(JSON.stringify(spine)).not.toContain('cookie');
    expect(JSON.stringify(spine)).not.toContain('token=');
  });

  it('exposes the operating spine through the runtime API', async () => {
    const runResponse = await POST(jsonRequest({
      taskId: 'memory-followup',
      restaurant: 'River Bistro',
      offer: 'Weekend two-person dinner',
      owner: 'store-manager',
      runtimeTarget: 'local',
    }));
    const runPayload = await runResponse.json();

    await POST(jsonRequest({
      action: 'receipt',
      eventId: runPayload.dispatch.eventId,
      channel: 'xiaohongshu',
      evidenceUrl: 'https://www.xiaohongshu.com/explore/platform-spine-proof',
      screenshotId: 'shot-platform-api',
      operator: 'ops',
      summary: 'Public post proof imported for store follow-up.',
      signalType: 'reservation',
      reservationCount: 3,
    }));

    const response = await POST(jsonRequest({ action: 'platform-operating-spine' }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.platformOperatingSpine.payloadShape).toBe('restaurant-platform-operating-spine');
    expect(payload.platformOperatingSpine.summary.runs).toBeGreaterThanOrEqual(1);
    expect(payload.platformOperatingSpine.summary.acceptedReceipts).toBeGreaterThanOrEqual(1);
    expect(payload.platformOperatingSpine.nextPlatformActions.map((item: { owner: string }) => item.owner)).toContain('runtime-admin');
  });
});

import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentChannelDeliveryReport, clearRestaurantAgentChannelDeliveryAttemptsForTest } from '@/lib/restaurant-agent-channel-delivery-store';
import { buildRestaurantAgentChannelHub } from '@/lib/restaurant-agent-channel-hub';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantNextLoopChannelPlan } from '@/lib/restaurant-next-loop-channel-plan';
import { buildRestaurantPosImportReport } from '@/lib/restaurant-pos-import-validator';
import { buildRestaurantPostRunReviewPack } from '@/lib/restaurant-post-run-review-pack';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantStoreManagerTaskQueue, clearRestaurantStoreManagerTasksForTest } from '@/lib/restaurant-store-manager-task-store';
import { clearRestaurantProviderSetupStateForTest } from '@/lib/restaurant-provider-setup-state-store';

describe('restaurant next loop channel plan', () => {
  beforeEach(() => {
    clearRestaurantProviderSetupStateForTest();
    clearRestaurantStoreManagerTasksForTest();
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
    clearRestaurantAgentChannelDeliveryAttemptsForTest();
  });

  it('keeps the next loop in proof-first mode when no public evidence exists', () => {
    const queue = buildRestaurantStoreManagerTaskQueue(new Date('2026-05-24T09:00:00.000Z'));
    const postRunReviewPack = buildRestaurantPostRunReviewPack({
      restaurant: 'Shift Bistro',
      offer: 'Dinner set',
      queue,
      runs: [],
      receipts: [],
      readiness: buildRestaurantExternalReadiness({}),
      now: new Date('2026-05-24T09:01:00.000Z'),
    });
    const plan = buildRestaurantNextLoopChannelPlan({
      restaurant: 'Shift Bistro',
      offer: 'Dinner set',
      postRunReviewPack,
      channelHub: buildRestaurantAgentChannelHub({
        restaurant: 'Shift Bistro',
        offer: 'Dinner set',
        env: {},
        now: new Date('2026-05-24T09:02:00.000Z'),
      }),
      channelDeliveryReport: buildRestaurantAgentChannelDeliveryReport(new Date('2026-05-24T09:03:00.000Z')),
      storeManagerTaskQueue: queue,
      now: new Date('2026-05-24T09:04:00.000Z'),
    });

    expect(plan.payloadShape).toBe('restaurant-next-loop-channel-plan-v1');
    expect(plan.verdict).toBe('manual-proof-first');
    expect(plan.summary.acceptedReceipts).toBe(0);
    expect(plan.lanes.find(item => item.id === 'public-proof')?.status).toBe('needs-evidence');
    expect(plan.scheduledActions.some(item => item.laneId === 'public-proof')).toBe(true);
    expect(plan.summary.canClaimExternalAutomation).toBe(false);
    expect(plan.safetyBoundary).toContain('does not publish');
  });

  it('combines accepted proof, POS aggregate and channel gates into a daily shift plan without secrets', () => {
    const dispatch = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'Shift Bistro',
      offer: 'Dinner set',
      owner: 'ops',
    });
    const run = recordRestaurantAgentRun(dispatch, 'openclaw', {
      ok: true,
      target: 'openclaw',
      status: 'forwarded',
      message: 'forwarded',
      externalRunId: 'openclaw-next-loop-1',
      audit: {
        secretExposed: false,
        payloadShape: 'restaurant-agent-external-execution-v1',
        blockedActions: [],
        canForward: true,
      },
    }, new Date('2026-05-24T10:00:00.000Z'));
    const receipt = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: 'Dianping',
      evidenceUrl: 'https://www.dianping.com/shop/123/review/789',
      screenshotId: 'shift-proof',
      externalRunId: 'openclaw-next-loop-1',
      operator: 'external-runtime',
      summary: 'Public proof and aggregate dinner signal captured.',
      signalType: 'redemption',
      couponClaimCount: 18,
      redemptionCount: 11,
      visitIntentCount: 6,
    }, new Date('2026-05-24T10:01:00.000Z'));
    const posImport = buildRestaurantPosImportReport({
      eventId: run.eventId,
      rows: [{
        businessDate: '2026-05-23',
        storeName: 'Shift Bistro',
        offerName: 'Dinner set',
        channel: 'group-buy coupon',
        couponClaimCount: 18,
        redemptionCount: 11,
        grossSales: 1380,
        orderCount: 14,
        inventoryUsed: 11,
      }],
    });
    const queue = buildRestaurantStoreManagerTaskQueue(new Date('2026-05-24T10:02:00.000Z'));
    const postRunReviewPack = buildRestaurantPostRunReviewPack({
      restaurant: 'Shift Bistro',
      offer: 'Dinner set',
      queue,
      runs: [run],
      receipts: [receipt],
      posImports: [posImport],
      readiness: buildRestaurantExternalReadiness({}),
      now: new Date('2026-05-24T10:03:00.000Z'),
    });
    const plan = buildRestaurantNextLoopChannelPlan({
      restaurant: 'Shift Bistro',
      offer: 'Dinner set',
      postRunReviewPack,
      channelHub: buildRestaurantAgentChannelHub({
        restaurant: 'Shift Bistro',
        offer: 'Dinner set',
        env: {},
        now: new Date('2026-05-24T10:04:00.000Z'),
      }),
      channelDeliveryReport: buildRestaurantAgentChannelDeliveryReport(new Date('2026-05-24T10:05:00.000Z')),
      storeManagerTaskQueue: queue,
      now: new Date('2026-05-24T10:06:00.000Z'),
    });
    const serialized = JSON.stringify(plan);

    expect(plan.summary.acceptedReceipts).toBe(1);
    expect(plan.summary.acceptedPosImports).toBe(1);
    expect(plan.summary.internalReadyLanes).toBeGreaterThanOrEqual(3);
    expect(plan.scheduledActions.map(item => item.laneId)).toContain('pos-redemption');
    expect(plan.externalRequired.join(' ')).toContain('provider');
    expect(serialized).not.toContain('https://provider.example.test');
    expect(serialized).not.toContain('13800000000');
  });

  it('is exposed through the restaurant runtime API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'next-loop-channel-plan',
        restaurant: 'API Shift Bistro',
        offer: 'Dinner set',
        rows: [{
          businessDate: '2026-05-23',
          storeName: 'API Shift Bistro',
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
    expect(payload.nextLoopChannelPlan.payloadShape).toBe('restaurant-next-loop-channel-plan-v1');
    expect(payload.nextLoopChannelPlan.summary.scheduledActions).toBeGreaterThan(0);
    expect(payload.nextLoopChannelPlan.channelHub.payloadShape).toBe('restaurant-agent-channel-hub-v1');
    expect(JSON.stringify(payload)).not.toContain('API key=');
  });
});

import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantAgentRecoveryPlan } from '@/lib/restaurant-agent-recovery';
import { buildRestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantCapabilityTrainingPlanFromLedger, clearRestaurantCapabilityTrainingRecordsForTest } from '@/lib/restaurant-capability-training';
import { buildRestaurantPosImportReport } from '@/lib/restaurant-pos-import-validator';
import { buildRestaurantPostRunReviewPack } from '@/lib/restaurant-post-run-review-pack';
import { buildRestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';
import { buildRestaurantShiftCloseoutTrainingPack } from '@/lib/restaurant-shift-closeout-training-pack';
import { buildRestaurantStoreManagerTaskQueue, clearRestaurantStoreManagerTasksForTest } from '@/lib/restaurant-store-manager-task-store';

describe('restaurant shift closeout training pack', () => {
  beforeEach(() => {
    clearRestaurantStoreManagerTasksForTest();
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
    clearRestaurantCapabilityTrainingRecordsForTest();
  });

  it('waits for proof before recording training drafts', () => {
    const runs: RestaurantAgentRunRecord[] = [];
    const receipts: RestaurantAgentReceiptRecord[] = [];
    const readiness = buildRestaurantExternalReadiness({});
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({
      runs,
      receipts,
      readiness,
      now: new Date('2026-05-24T14:00:00.000Z'),
    });
    const postRunReviewPack = buildRestaurantPostRunReviewPack({
      restaurant: 'Closeout Bistro',
      offer: 'Dinner set',
      queue: buildRestaurantStoreManagerTaskQueue(new Date('2026-05-24T14:01:00.000Z')),
      runs,
      receipts,
      readiness,
      now: new Date('2026-05-24T14:02:00.000Z'),
    });
    const pack = buildRestaurantShiftCloseoutTrainingPack({
      providerReceiptInbox,
      recovery: buildRestaurantAgentRecoveryPlan(runs, receipts, readiness, new Date('2026-05-24T14:03:00.000Z')),
      postRunReviewPack,
      capabilityTrainingPlan: buildRestaurantCapabilityTrainingPlanFromLedger(),
      now: new Date('2026-05-24T14:04:00.000Z'),
    });

    expect(pack.payloadShape).toBe('restaurant-shift-closeout-training-pack-v1');
    expect(pack.verdict).toBe('recover-first');
    expect(pack.summary.canRecordTraining).toBe(false);
    expect(pack.lanes.find(lane => lane.id === 'receipt-watch')?.status).toBe('blocked');
    expect(pack.trainingDrafts[0].blockedWhen).toContain('No proof');
    expect(pack.safetyBoundary).toContain('does not auto-publish');
  });

  it('drafts proof and POS aggregate training after accepted receipts', () => {
    const dispatch = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'Closeout Bistro',
      offer: 'Dinner set',
      owner: 'ops',
    });
    const run = recordRestaurantAgentRun(dispatch, 'openclaw', {
      ok: true,
      target: 'openclaw',
      status: 'forwarded',
      message: 'forwarded',
      externalRunId: 'openclaw-closeout-1',
      audit: {
        secretExposed: false,
        payloadShape: 'restaurant-agent-external-execution-v1',
        blockedActions: [],
        canForward: true,
      },
    }, new Date('2026-05-24T14:10:00.000Z'));
    const receipt = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: 'Dianping',
      evidenceUrl: 'https://www.dianping.com/shop/123/review/456',
      screenshotId: 'shot-closeout-proof',
      externalRunId: 'openclaw-closeout-1',
      operator: 'external-runtime',
      summary: 'Public proof accepted for closeout training.',
      signalType: 'redemption',
      couponClaimCount: 18,
      redemptionCount: 9,
    }, new Date('2026-05-24T14:11:00.000Z'));
    const runs = [run];
    const receipts = [receipt];
    const readiness = buildRestaurantExternalReadiness({});
    const posImport = buildRestaurantPosImportReport({
      eventId: run.eventId,
      rows: [{
        businessDate: '2026-05-24',
        storeName: 'Closeout Bistro',
        offerName: 'Dinner set',
        channel: 'group-buy coupon',
        couponClaimCount: 18,
        redemptionCount: 9,
        grossSales: 1280,
        orderCount: 10,
        inventoryUsed: 9,
      }],
    });
    const postRunReviewPack = buildRestaurantPostRunReviewPack({
      restaurant: 'Closeout Bistro',
      offer: 'Dinner set',
      queue: buildRestaurantStoreManagerTaskQueue(new Date('2026-05-24T14:12:00.000Z')),
      runs,
      receipts,
      posImports: [posImport],
      readiness,
      now: new Date('2026-05-24T14:13:00.000Z'),
    });
    const pack = buildRestaurantShiftCloseoutTrainingPack({
      providerReceiptInbox: buildRestaurantProviderReceiptInbox({
        runs,
        receipts,
        readiness,
        now: new Date('2026-05-24T14:14:00.000Z'),
      }),
      recovery: buildRestaurantAgentRecoveryPlan(runs, receipts, readiness, new Date('2026-05-24T14:15:00.000Z')),
      postRunReviewPack,
      capabilityTrainingPlan: buildRestaurantCapabilityTrainingPlanFromLedger(),
      now: new Date('2026-05-24T14:16:00.000Z'),
    });
    const serialized = JSON.stringify(pack);

    expect(pack.verdict).toBe('train-from-proof');
    expect(pack.summary.canRecordTraining).toBe(true);
    expect(pack.trainingDrafts.map(draft => draft.capabilityId)).toEqual(expect.arrayContaining(['auto-publish-receipts', 'real-operating-analysis']));
    expect(pack.lanes.find(lane => lane.id === 'capability-training')?.status).toBe('ready');
    expect(serialized).not.toContain('openclaw-secret-value');
    expect(serialized).not.toContain('13800000000');
  });

  it('is exposed through the runtime API as a guarded closeout pack', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'shift-closeout-training-pack',
        restaurant: 'API Closeout Bistro',
        offer: 'Dinner set',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.shiftCloseoutTrainingPack.payloadShape).toBe('restaurant-shift-closeout-training-pack-v1');
    expect(payload.shiftCloseoutTrainingPack.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.shiftCloseoutTrainingPack.safetyBoundary).toContain('does not auto-publish');
  });
});

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantTrialOrchestratorPack } from '@/lib/restaurant-trial-orchestrator';

const intake = {
  restaurant: 'North City Noodles',
  offer: 'Lunch beef noodle set',
  audience: 'nearby office lunch diners',
  channels: 'Dianping / Xiaohongshu / Douyin / WeChat group',
  visitReason: 'fast lunch without queue',
  constraints: 'manager must approve coupon rules and stock',
  evidence: 'menu screenshot; dish photo; dianping public proof',
};

describe('restaurant trial orchestrator', () => {
  beforeEach(() => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
  });

  afterEach(() => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
  });

  it('connects trial input standard pack content proof and store follow-up into one typed spine', () => {
    const now = new Date('2026-05-23T08:00:00.000Z');
    const dispatch = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: intake.restaurant,
      offer: intake.offer,
      owner: 'store-manager',
      runtimeTarget: 'local',
    });
    const run = recordRestaurantAgentRun(dispatch, 'local', undefined, now);
    const receipt = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: 'Dianping',
      evidenceUrl: 'https://www.dianping.com/shop/123/review/456',
      screenshotId: 'shot-orchestrator-proof',
      signalType: 'coupon-claim',
      couponClaimCount: 8,
      inquiryCount: 2,
      summary: 'Public coupon claim proof imported for the lunch offer.',
    }, now);

    const pack = buildRestaurantTrialOrchestratorPack({
      ...intake,
      runs: [run],
      receipts: [receipt],
      now,
    });

    expect(pack.payloadShape).toBe('restaurant-trial-orchestrator-v1');
    expect(pack.spine).toBe('trial-input -> standard-pack -> content-production -> publish-proof -> ops-followup');
    expect(pack.summary).toEqual(expect.objectContaining({
      stages: 5,
      acceptedProofs: 1,
      canRunInternallyToday: true,
      canClaimExternalExecution: false,
    }));
    expect(pack.stages.map(stage => stage.id)).toEqual([
      'trial-intake',
      'standard-pack',
      'content-production',
      'publish-proof',
      'ops-followup',
    ]);
    expect(pack.standardPack.route).toContain('/modules/standard-pack');
    expect(pack.standardPack.pack.readiness.decision).not.toBe('hypothesis-only');
    expect(pack.trialWorkflow.workOrder.restaurant).toBe(intake.restaurant);
    expect(pack.contentDelivery.scripts.length).toBeGreaterThanOrEqual(3);
    expect(pack.publishProofLedger).toEqual(expect.arrayContaining([
      expect.objectContaining({
        status: 'accepted-proof',
        receiptId: receipt.receiptId,
      }),
    ]));
    expect(pack.businessSignals.summary.couponClaims).toBe(8);
    expect(pack.businessSignals.summary.inquiries).toBe(2);
    expect(pack.managerQueue.length).toBeGreaterThan(0);
    expect(pack.managerQueue[0].owner).toBe('community-ops');
    expect(pack.externalGates.join(' ')).toContain('店长的平台授权');
    expect(JSON.stringify(pack)).not.toContain('自动发布');
    expect(JSON.stringify(pack)).not.toContain('OAuth');
    expect(JSON.stringify(pack)).not.toContain('商品 brief');
  });

  it('keeps publish proof and follow-up gated when no accepted receipt exists', () => {
    const pack = buildRestaurantTrialOrchestratorPack({
      ...intake,
      now: new Date('2026-05-23T08:00:00.000Z'),
    });

    expect(pack.summary.acceptedProofs).toBe(0);
    expect(pack.summary.followupTasks).toBe(1);
    expect(pack.publishProofLedger.every(slot => slot.status === 'waiting-proof')).toBe(true);
    expect(pack.stages.find(stage => stage.id === 'publish-proof')?.status).toBe('needs-review');
    expect(pack.followupPack.summary.blocked).toBe(1);
    expect(pack.safetyBoundary).toContain('不发布');
    expect(pack.safetyBoundary).toContain('不');
  });

  it('exposes the orchestrated spine through the restaurant runtime API', async () => {
    const now = new Date('2026-05-23T08:00:00.000Z');
    const dispatch = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: intake.restaurant,
      offer: intake.offer,
      owner: 'store-manager',
      runtimeTarget: 'local',
    });
    const run = recordRestaurantAgentRun(dispatch, 'local', undefined, now);
    const receipt = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: 'Xiaohongshu',
      evidenceUrl: 'https://www.xiaohongshu.com/explore/orchestrator-proof',
      screenshotId: 'shot-orchestrator-api-proof',
      signalType: 'reservation',
      reservationCount: 3,
      summary: 'Public reservation proof imported for runtime API test.',
    }, now);

    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'trial-orchestrator-pack',
        ...intake,
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.trialOrchestratorPack.payloadShape).toBe('restaurant-trial-orchestrator-v1');
    expect(payload.trialOrchestratorPack.summary.acceptedProofs).toBeGreaterThanOrEqual(1);
    expect(payload.trialOrchestratorPack.publishProofLedger.map((slot: { receiptId?: string }) => slot.receiptId)).toContain(receipt.receiptId);
    expect(payload.trialOrchestratorPack.managerQueue.length).toBeGreaterThan(0);
  });
});

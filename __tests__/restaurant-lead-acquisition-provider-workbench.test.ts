import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantBusinessSignals } from '@/lib/restaurant-agent-business-signals';
import { buildRestaurantAgentChannelDeliveryReport } from '@/lib/restaurant-agent-channel-delivery-store';
import { buildRestaurantAgentChannelHub } from '@/lib/restaurant-agent-channel-hub';
import { buildRestaurantCapabilityTrainingPlanFromLedger } from '@/lib/restaurant-capability-training';
import { buildRestaurantCustomerDemandGateway } from '@/lib/restaurant-customer-demand-gateway';
import { buildRestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantLeadAcquisitionProviderWorkbench } from '@/lib/restaurant-lead-acquisition-provider-workbench';
import { buildRestaurantLeadCaptureInbox } from '@/lib/restaurant-lead-capture-inbox';
import { buildRestaurantNextLoopChannelPlan } from '@/lib/restaurant-next-loop-channel-plan';
import { buildRestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import { buildRestaurantPosImportReport } from '@/lib/restaurant-pos-import-validator';
import { buildRestaurantPostRunReviewPack } from '@/lib/restaurant-post-run-review-pack';
import { buildRestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import { buildRestaurantProviderSetupStateSummary } from '@/lib/restaurant-provider-setup-state-store';
import { buildRestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';

describe('restaurant lead acquisition provider workbench', () => {
  it('turns lead capture into provider acceptance lanes without claiming automatic contact', async () => {
    const now = new Date('2026-05-26T12:00:00.000Z');
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger({
      availableMaterials: ['lead follow-up script', 'coupon rules', 'reservation capacity policy'],
      configuredProviders: [],
    });
    const providerSetupState = buildRestaurantProviderSetupStateSummary(now);
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({ providerSetupState, now });
    const customerDemandGateway = buildRestaurantCustomerDemandGateway({
      restaurant: 'Provider Lead Bistro',
      offer: 'Dinner set',
      capabilityTrainingPlan,
      providerSetupState,
      now,
    });
    const queue = buildRestaurantStoreManagerTaskQueue(now);
    const postRunReviewPack = buildRestaurantPostRunReviewPack({
      restaurant: 'Provider Lead Bistro',
      offer: 'Dinner set',
      queue,
      runs: [],
      receipts: [],
      readiness: buildRestaurantExternalReadiness({}),
      now,
    });
    const channelHub = buildRestaurantAgentChannelHub({ restaurant: 'Provider Lead Bistro', offer: 'Dinner set', now });
    const nextLoopChannelPlan = buildRestaurantNextLoopChannelPlan({
      restaurant: 'Provider Lead Bistro',
      offer: 'Dinner set',
      postRunReviewPack,
      channelHub,
      channelDeliveryReport: buildRestaurantAgentChannelDeliveryReport(now),
      storeManagerTaskQueue: queue,
      now,
    });
    const leadCaptureInbox = buildRestaurantLeadCaptureInbox({
      restaurant: 'Provider Lead Bistro',
      offer: 'Dinner set',
      customerDemandGateway,
      businessSignals: buildRestaurantBusinessSignals([], [], now),
      channelHub,
      nextLoopChannelPlan,
      now,
    });
    const posImport = buildRestaurantPosImportReport({
      rows: [{
        businessDate: '2026-05-26',
        storeName: 'Provider Lead Bistro',
        offerName: 'Dinner set',
        couponClaimCount: 12,
        redemptionCount: 8,
        grossSales: 880,
        orderCount: 9,
      }],
      now,
    });
    const operatingDataContract = buildRestaurantOperatingDataContract({
      posImports: [posImport],
      now,
    });
    const workbench = buildRestaurantLeadAcquisitionProviderWorkbench({
      restaurant: 'Provider Lead Bistro',
      offer: 'Dinner set',
      leadCaptureInbox,
      customerDemandGateway,
      providerReadinessHealth,
      operatingDataContract,
      now,
    });
    const serialized = JSON.stringify(workbench);

    expect(workbench.payloadShape).toBe('restaurant-lead-acquisition-provider-workbench-v1');
    expect(workbench.summary.lanes).toBe(5);
    expect(workbench.lanes.map(lane => lane.id)).toEqual(['reservation', 'coupon-claim', 'private-domain', 'visit-intent', 'review-recovery']);
    expect(workbench.summary.canClaimAutoLeadCapture).toBe(false);
    expect(workbench.summary.canClaimAutoCustomerContact).toBe(false);
    expect(workbench.summary.canClaimAutoReservation).toBe(false);
    expect(workbench.providerAcceptanceContract.callbackHeader).toBe('x-restaurant-agent-signature');
    expect(workbench.providerAcceptanceContract.forbiddenPayloadFields).toContain('raw private message');
    expect(workbench.operatorQueue.some(item => item.priority === 'blocked')).toBe(true);
    expect(workbench.safetyBoundary).toContain('does not scrape private messages');
    expect(serialized).not.toContain('13800000000');
    expect(serialized).not.toContain('token-value');
    expect(serialized).not.toContain('cookie-value');
  });

  it('is included in the default Claw path API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claw-experience-default-path',
        restaurant: 'Default Provider Lead Bistro',
        offer: 'Dinner set',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.leadAcquisitionProviderWorkbench.payloadShape).toBe('restaurant-lead-acquisition-provider-workbench-v1');
    expect(payload.leadAcquisitionProviderWorkbench.summary.canClaimAutoCustomerContact).toBe(false);
    expect(payload.leadAcquisitionProviderWorkbench.lanes.map((item: { id: string }) => item.id)).toContain('private-domain');
    expect(payload.leadAcquisitionProviderWorkbench.providerAcceptanceContract.requiredEnv).toContain('RESTAURANT_AGENT_CALLBACK_SECRET');
  });
});

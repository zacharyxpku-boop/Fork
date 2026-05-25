import { describe, expect, it } from 'vitest';

import { buildRestaurantBusinessSignals } from '@/lib/restaurant-agent-business-signals';
import { buildRestaurantAgentChannelDeliveryReport } from '@/lib/restaurant-agent-channel-delivery-store';
import { buildRestaurantAgentChannelHub } from '@/lib/restaurant-agent-channel-hub';
import { buildRestaurantCustomerDemandGateway } from '@/lib/restaurant-customer-demand-gateway';
import { buildRestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantLeadCaptureInbox } from '@/lib/restaurant-lead-capture-inbox';
import { buildRestaurantNextLoopChannelPlan } from '@/lib/restaurant-next-loop-channel-plan';
import { buildRestaurantPostRunReviewPack } from '@/lib/restaurant-post-run-review-pack';
import { buildRestaurantCapabilityTrainingPlanFromLedger } from '@/lib/restaurant-capability-training';
import { buildRestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';

describe('restaurant lead capture inbox', () => {
  it('creates a governed lead queue without claiming automatic customer contact', () => {
    const now = new Date('2026-05-26T11:20:00.000Z');
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger({
      availableMaterials: ['lead follow-up script', 'coupon rules', 'reservation capacity policy'],
      configuredProviders: [],
    });
    const customerDemandGateway = buildRestaurantCustomerDemandGateway({
      restaurant: 'Lead Bistro',
      offer: 'Lunch set',
      capabilityTrainingPlan,
      providerSetupState: {
        provided: { envKeys: [], merchantApprovals: [], dataContracts: [] },
        summary: { records: 0, configuredEnvKeys: 0, merchantApprovals: 0, dataContracts: 0, latestSubmittedBy: 'none' },
      },
      now,
    });
    const queue = buildRestaurantStoreManagerTaskQueue(now);
    const postRunReviewPack = buildRestaurantPostRunReviewPack({
      restaurant: 'Lead Bistro',
      offer: 'Lunch set',
      queue,
      runs: [],
      receipts: [],
      readiness: buildRestaurantExternalReadiness({}),
      now,
    });
    const channelHub = buildRestaurantAgentChannelHub({ restaurant: 'Lead Bistro', offer: 'Lunch set', now });
    const nextLoopChannelPlan = buildRestaurantNextLoopChannelPlan({
      restaurant: 'Lead Bistro',
      offer: 'Lunch set',
      postRunReviewPack,
      channelHub,
      channelDeliveryReport: buildRestaurantAgentChannelDeliveryReport(now),
      storeManagerTaskQueue: queue,
      now,
    });
    const inbox = buildRestaurantLeadCaptureInbox({
      restaurant: 'Lead Bistro',
      offer: 'Lunch set',
      customerDemandGateway,
      businessSignals: buildRestaurantBusinessSignals([], [], now),
      channelHub,
      nextLoopChannelPlan,
      now,
    });
    const serialized = JSON.stringify(inbox);

    expect(inbox.payloadShape).toBe('restaurant-lead-capture-inbox-v1');
    expect(inbox.sources.map(item => item.id)).toEqual([
      'reservation',
      'coupon-claim',
      'private-domain-inquiry',
      'visit-intent',
      'review-recovery',
    ]);
    expect(inbox.summary.canClaimAutoLeadCapture).toBe(false);
    expect(inbox.summary.canClaimAutoCustomerContact).toBe(false);
    expect(inbox.leadItems.some(item => item.sourceId === 'private-domain-inquiry')).toBe(true);
    expect(inbox.providerUnlocks).toContain('no-PII private-domain data contract');
    expect(inbox.safetyBoundary).toContain('private messages');
    expect(inbox.safetyBoundary).toContain('PII');
    expect(serialized).not.toContain('13800000000');
    expect(serialized).not.toContain('openid');
    expect(serialized).not.toContain('token-value');
  });
});

import { describe, expect, it } from 'vitest';

import { buildRestaurantBusinessSignals } from '@/lib/restaurant-agent-business-signals';
import { buildRestaurantAgentChannelDeliveryReport } from '@/lib/restaurant-agent-channel-delivery-store';
import { buildRestaurantAgentChannelHub } from '@/lib/restaurant-agent-channel-hub';
import { buildRestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantNextLoopChannelPlan } from '@/lib/restaurant-next-loop-channel-plan';
import { buildRestaurantPostRunReviewPack } from '@/lib/restaurant-post-run-review-pack';
import { buildRestaurantPublicIntelligenceBrief } from '@/lib/restaurant-public-intelligence-brief';
import { buildRestaurantReputationCloseoutPack } from '@/lib/restaurant-reputation-closeout-pack';
import { buildRestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';

describe('restaurant reputation closeout pack', () => {
  it('turns public proof gaps and manual review imports into a safe service recovery loop', () => {
    const now = new Date('2026-05-26T10:00:00.000Z');
    const queue = buildRestaurantStoreManagerTaskQueue(now);
    const postRunReviewPack = buildRestaurantPostRunReviewPack({
      restaurant: 'Reputation Bistro',
      offer: 'Dinner set',
      queue,
      runs: [],
      receipts: [],
      readiness: buildRestaurantExternalReadiness({}),
      now,
    });
    const nextLoopChannelPlan = buildRestaurantNextLoopChannelPlan({
      restaurant: 'Reputation Bistro',
      offer: 'Dinner set',
      postRunReviewPack,
      channelHub: buildRestaurantAgentChannelHub({ restaurant: 'Reputation Bistro', offer: 'Dinner set', now }),
      channelDeliveryReport: buildRestaurantAgentChannelDeliveryReport(now),
      storeManagerTaskQueue: queue,
      now,
    });
    const pack = buildRestaurantReputationCloseoutPack({
      restaurant: 'Reputation Bistro',
      offer: 'Dinner set',
      publicIntelligenceBrief: buildRestaurantPublicIntelligenceBrief({
        restaurant: 'Reputation Bistro',
        suggestedOffer: 'Dinner set',
        manualText: 'public menu and approved dish photos',
        now,
      }),
      postRunReviewPack,
      nextLoopChannelPlan,
      businessSignals: buildRestaurantBusinessSignals([], [], now),
      now,
    });
    const serialized = JSON.stringify(pack);

    expect(pack.payloadShape).toBe('restaurant-reputation-closeout-pack-v1');
    expect(pack.sources.map(item => item.id)).toContain('dianping-meituan');
    expect(pack.sources.map(item => item.id)).toContain('manual-review-import');
    expect(pack.summary.canClaimAutoReviewReply).toBe(false);
    expect(pack.summary.canClaimReviewAnalytics).toBe(false);
    expect(pack.recoveryQueue.length).toBeGreaterThanOrEqual(3);
    expect(pack.responseDrafts.some(item => item.status === 'provider-gated')).toBe(true);
    expect(pack.safetyBoundary).toContain('private messages');
    expect(pack.safetyBoundary).toContain('PII');
    expect(serialized).not.toContain('cookie');
    expect(serialized).not.toContain('token-value');
    expect(serialized).not.toContain('13800000000');
  });
});

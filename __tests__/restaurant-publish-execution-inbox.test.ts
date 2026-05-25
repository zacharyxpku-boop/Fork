import { describe, expect, it } from 'vitest';

import { buildRestaurantAgentChannelDeliveryReport } from '@/lib/restaurant-agent-channel-delivery-store';
import { buildRestaurantBusinessSignals } from '@/lib/restaurant-agent-business-signals';
import { buildRestaurantAgentRecoveryPlan } from '@/lib/restaurant-agent-recovery';
import { buildRestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantBrowserGatewayPack } from '@/lib/restaurant-browser-gateway-pack';
import { buildRestaurantPublishExecutionInbox } from '@/lib/restaurant-publish-execution-inbox';
import { buildRestaurantRuntimeRunnerLoopPack } from '@/lib/restaurant-runtime-runner-loop-pack';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';

describe('restaurant publish execution inbox', () => {
  it('turns browser runner and receipt gates into a governed execution queue', () => {
    const now = new Date('2026-05-26T12:30:00.000Z');
    const readiness = buildRestaurantExternalReadiness({});
    const runs: RestaurantAgentRunRecord[] = [];
    const receipts: RestaurantAgentReceiptRecord[] = [];
    const browserGatewayPack = buildRestaurantBrowserGatewayPack({
      restaurant: 'Publish Bistro',
      offer: 'Dinner set',
      targetUrl: 'merchant-approved-url-or-public-proof-url',
      now,
    });
    const runtimeRunnerLoopPack = buildRestaurantRuntimeRunnerLoopPack({
      runs,
      receipts,
      runnerEvents: [],
      readiness,
      now,
    });
    const inbox = buildRestaurantPublishExecutionInbox({
      restaurant: 'Publish Bistro',
      offer: 'Dinner set',
      browserGatewayPack,
      runtimeRunnerLoopPack,
      channelDeliveryReport: buildRestaurantAgentChannelDeliveryReport(now),
      businessSignals: buildRestaurantBusinessSignals(runs, receipts, now),
      recovery: buildRestaurantAgentRecoveryPlan(runs, receipts, readiness, now),
      now,
    });
    const serialized = JSON.stringify(inbox);

    expect(inbox.payloadShape).toBe('restaurant-publish-execution-inbox-v1');
    expect(inbox.tasks.map(item => item.id)).toContain('submit-browser-runner');
    expect(inbox.tasks.map(item => item.id)).toContain('recover-failed-run');
    expect(inbox.summary.canClaimAutoPublish).toBe(false);
    expect(inbox.runnerCommands.map(item => item.action)).toContain('send_signed_receipt');
    expect(inbox.providerUnlocks).toContain('callback secret and signature validation');
    expect(inbox.safetyBoundary).toContain('does not auto-publish');
    expect(serialized).not.toContain('cookie-value');
    expect(serialized).not.toContain('token-value');
    expect(serialized).not.toContain('13800000000');
  });
});

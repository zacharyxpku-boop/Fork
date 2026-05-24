import { afterEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { runRestaurantCallbackSimulator } from '@/lib/restaurant-agent-callback-simulator';
import { clearRestaurantAgentReceiptsForTest } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest } from '@/lib/restaurant-agent-run-store';

describe('restaurant agent callback simulator', () => {
  afterEach(() => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
  });

  it('runs a local signed callback loop without claiming real external execution', () => {
    const report = runRestaurantCallbackSimulator({
      target: 'openclaw',
      restaurant: 'South City Bistro',
      offer: 'Dinner Set',
      owner: 'Operator',
      signalType: 'reservation',
      reservationCount: 5,
      now: new Date('2026-05-23T00:00:00.000Z'),
    });

    expect(report.payloadShape).toBe('restaurant-agent-callback-simulator-v1');
    expect(report.callback).toEqual(expect.objectContaining({
      signatureVerified: true,
      secretExposed: false,
      rawBodyStored: false,
    }));
    expect(report.receipt.status).toBe('accepted');
    expect(report.receipt.source).toBe('external-runtime');
    expect(report.receipt.businessSignals.reservationCount).toBe(5);
    expect(report.businessSignals.summary.reservations).toBe(5);
    expect(report.run.target).toBe('local');
    expect(report.blockedExternal.join(' ')).toContain('Local simulator does not log in');
    expect(report.safetyBoundary).toContain('never opens a merchant account');
    expect(JSON.stringify(report)).not.toContain('local-simulator-');
  });

  it('simulates redemption receipts through the same signed receipt and business signal path', () => {
    const report = runRestaurantCallbackSimulator({
      target: 'hermes',
      taskId: 'redemption-review',
      restaurant: 'North Noodle',
      offer: 'Lunch Coupon',
      owner: 'Store Ops',
      signalType: 'redemption',
      couponClaimCount: 18,
      redemptionCount: 11,
      now: new Date('2026-05-23T00:00:00.000Z'),
    });

    expect(report.executionPackage.requestedAction).toBe('pull_pos_redemption');
    expect(report.receipt.signalType).toBe('redemption');
    expect(report.receipt.businessSignals.redemptionCount).toBe(11);
    expect(report.businessSignals.summary.redemptions).toBe(11);
    expect(report.receipt.summary).toContain('not a real platform publish');
  });

  it('exposes the simulator through the runtime API', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'callback-simulator',
        runtimeTarget: 'openclaw',
        restaurant: 'Demo Store',
        offer: 'Dinner Set',
        owner: 'Ops',
        signalType: 'visit-intent',
        visitIntentCount: 7,
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.callbackSimulation.payloadShape).toBe('restaurant-agent-callback-simulator-v1');
    expect(payload.callbackSimulation.callback.signatureVerified).toBe(true);
    expect(payload.callbackSimulation.receipt.status).toBe('accepted');
    expect(payload.callbackSimulation.businessSignals.summary.visitIntent).toBe(7);
    expect(payload.callbackSimulation.callback.secretExposed).toBe(false);
  });
});

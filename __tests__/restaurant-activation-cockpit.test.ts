import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantActivationCockpit } from '@/lib/restaurant-activation-cockpit';

describe('restaurant activation cockpit', () => {
  it('separates internal ability, training gaps and external provider gates', () => {
    const cockpit = buildRestaurantActivationCockpit({
      restaurant: 'North City Noodle',
      offer: 'Tomato beef noodle set',
      now: new Date('2026-05-24T02:00:00.000Z'),
    });

    expect(cockpit.payloadShape).toBe('restaurant-activation-cockpit-v1');
    expect(cockpit.summary.lanes).toBeGreaterThanOrEqual(5);
    expect(cockpit.summary.providerGated).toBeGreaterThan(0);
    expect(cockpit.summary.providerKeysNeeded).toBeGreaterThan(0);
    expect(cockpit.summary.forbidden).toBe(1);
    expect(cockpit.lanes.find(item => item.id === 'publish-and-proof')).toEqual(expect.objectContaining({
      status: expect.stringMatching(/provider-gated|trainable-now/),
      title: 'Auto publish and proof capture',
    }));
    expect(cockpit.lanes.find(item => item.id === 'private-message-reading')?.status).toBe('forbidden');
    expect(cockpit.answerForCustomer).toContain('Internal cockpit is ready');
    expect(cockpit.safetyBoundary).toContain('does not copy competitor branding');
  });

  it('is exposed through the restaurant runtime API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'activation-cockpit',
        restaurant: 'North City Noodle',
        offer: 'Tomato beef noodle set',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.activationCockpit.payloadShape).toBe('restaurant-activation-cockpit-v1');
    expect(payload.activationCockpit.restaurant).toBe('North City Noodle');
    expect(payload.activationCockpit.lanes.map((item: { id: string }) => item.id)).toContain('redemption-and-operating-analysis');
  });
});

import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantBrowserGatewayPack } from '@/lib/restaurant-browser-gateway-pack';

describe('restaurant browser gateway pack', () => {
  it('builds a browser.request-style gateway without leaking secrets or raw profile state', () => {
    const pack = buildRestaurantBrowserGatewayPack({
      runtimeTarget: 'openclaw',
      eventId: 'restaurant-agent-gateway',
      restaurant: 'South City Bistro',
      offer: 'Dinner set',
      channel: 'Dianping',
      targetUrl: 'https://www.dianping.com/shop/123',
      env: {
        RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL: 'https://openclaw.example',
        RESTAURANT_AGENT_OPENCLAW_API_KEY: 'openclaw-secret',
        RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'profile-secret',
        RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret',
      },
      now: new Date('2026-05-25T12:00:00.000Z'),
    });
    const serialized = JSON.stringify(pack);

    expect(pack.payloadShape).toBe('restaurant-browser-gateway-pack-v1');
    expect(pack.canExecuteNow).toBe(true);
    expect(pack.browserRequest.endpointPath).toBe('/browser/request');
    expect(pack.browserRequest.acceptedActions).toContain('capture_public_proof');
    expect(pack.browserRequest.acceptedActions).toContain('send_signed_receipt');
    expect(pack.snapshotPolicy.redactedFields).toContain('private message text');
    expect(pack.contextBudget.stopWhenBudgetExhausted).toBe(true);
    expect(serialized).not.toContain('openclaw-secret');
    expect(serialized).not.toContain('profile-secret');
    expect(serialized).not.toContain('callback-secret');
  });

  it('stays handoff-only until runtime profile and callback gates are configured', () => {
    const pack = buildRestaurantBrowserGatewayPack({
      runtimeTarget: 'hermes',
      restaurant: 'South City Bistro',
      offer: 'Dinner set',
    });

    expect(pack.canExecuteNow).toBe(false);
    expect(pack.browserRequest.acceptedActions).toEqual(['emit_runner_event', 'stop_and_handoff']);
    expect(pack.actionSchema.find(item => item.action === 'open_public_page')?.allowed).toBe(false);
    expect(pack.actionSchema.find(item => item.action === 'stop_and_handoff')?.allowed).toBe(true);
    expect(pack.externalRequired).toContain('hermes runtime URL');
    expect(pack.safetyBoundary).toContain('never exposes API key values');
  });

  it('is exposed through the runtime API for the customer trial workbench', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'browser-gateway-pack',
        runtimeTarget: 'openclaw',
        restaurant: 'South City Bistro',
        offer: 'Dinner set',
        channel: 'Dianping',
        targetUrl: 'https://www.dianping.com/shop/123',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.browserGatewayPack.payloadShape).toBe('restaurant-browser-gateway-pack-v1');
    expect(payload.browserGatewayPack.browserRequest.forbiddenFields).toContain('cookie');
    expect(payload.browserGatewayPack.actionSchema.some((item: { action: string }) => item.action === 'send_signed_receipt')).toBe(true);
  });
});

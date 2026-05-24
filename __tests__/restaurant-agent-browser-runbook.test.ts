import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantBrowserRunbookPackage } from '@/lib/restaurant-agent-browser-runbook';

describe('restaurant agent browser runbook package', () => {
  it('builds a handoff-only browser runbook with ordered steps and stop conditions', () => {
    const runbook = buildRestaurantBrowserRunbookPackage({
      runtimeTarget: 'openclaw',
      eventId: 'restaurant-agent-proof',
      restaurant: 'South City Bistro',
      offer: 'Dinner set',
      targetUrl: 'https://www.dianping.com/shop/example',
      env: {},
    });

    expect(runbook.payloadShape).toBe('restaurant-browser-runbook-v1');
    expect(runbook.canExecuteNow).toBe(false);
    expect(runbook.steps.map(step => step.type)).toEqual([
      'preflight',
      'navigate',
      'inspect',
      'capture',
      'extract',
      'callback',
      'stop',
    ]);
    expect(runbook.steps.find(step => step.id === 'open-authorized-public-or-merchant-page')).toEqual(expect.objectContaining({
      allowed: false,
      tool: 'browser_open',
    }));
    expect(runbook.steps.flatMap(step => step.stopIf).join(' ')).toContain('captcha');
    expect(runbook.audit.fakeExecutionIncluded).toBe(false);
    expect(JSON.stringify(runbook)).not.toContain('secret-api-key');
  });

  it('allows executable browser proof steps only when runtime profile api key and callback secret are configured', () => {
    const runbook = buildRestaurantBrowserRunbookPackage({
      runtimeTarget: 'hermes',
      eventId: 'restaurant-agent-proof',
      targetUrl: 'https://www.xiaohongshu.com/explore/example',
      allowedDomains: ['xiaohongshu.com', 'douyin.com', 'not a domain'],
      env: {
        RESTAURANT_AGENT_HERMES_RUNTIME_URL: 'https://hermes.example/runtime',
        RESTAURANT_AGENT_HERMES_API_KEY: 'secret-api-key',
        RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'profile-1',
        RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret',
      },
    });

    expect(runbook.canExecuteNow).toBe(true);
    expect(runbook.allowedDomains).toEqual(['xiaohongshu.com', 'douyin.com']);
    expect(runbook.steps.find(step => step.type === 'navigate')).toEqual(expect.objectContaining({ allowed: true }));
    expect(runbook.steps.find(step => step.type === 'callback')).toEqual(expect.objectContaining({ allowed: true }));
    expect(runbook.handoff.nextAction).toContain('hermes');
    const serialized = JSON.stringify(runbook);
    expect(serialized).not.toContain('secret-api-key');
    expect(serialized).not.toContain('callback-secret');
    expect(serialized).not.toContain('profile-1');
  });

  it('exposes browser runbook through the runtime API without private data', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'browser-runbook',
        runtimeTarget: 'openclaw',
        eventId: 'restaurant-agent-proof',
        restaurant: 'North City Noodles',
        offer: 'Tomato beef noodle set',
        targetUrl: 'https://www.dianping.com/shop/example',
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.browserRunbook.payloadShape).toBe('restaurant-browser-runbook-v1');
    expect(payload.browserRunbook.session.task.restaurant).toBe('North City Noodles');
    expect(payload.browserRunbook.callback.action).toBe('external-receipt');
    expect(payload.browserRunbook.audit.privateDataIncluded).toBe(false);
    expect(JSON.stringify(payload)).not.toContain('private message raw');
  });
});

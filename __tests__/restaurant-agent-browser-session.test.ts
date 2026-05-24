import { afterEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantBrowserSessionManifest } from '@/lib/restaurant-agent-browser-session';
import { buildRestaurantBrowserSessionHealth, clearRestaurantBrowserSessionsForTest, heartbeatRestaurantBrowserSession, recordRestaurantBrowserSession } from '@/lib/restaurant-agent-browser-session-store';

describe('restaurant agent browser session manifest', () => {
  afterEach(() => {
    clearRestaurantBrowserSessionsForTest();
  });

  it('builds a handoff-only browser manifest until runtime profile and callback are configured', () => {
    const manifest = buildRestaurantBrowserSessionManifest({
      runtimeTarget: 'openclaw',
      eventId: 'restaurant-agent-proof',
      restaurant: 'South City Bistro',
      offer: 'Dinner set',
      env: {},
    });

    expect(manifest.ok).toBe(true);
    expect(manifest.canExecuteNow).toBe(false);
    expect(manifest.profile.configured).toBe(false);
    expect(manifest.toolPolicy.find(tool => tool.name === 'browser_open')).toEqual(expect.objectContaining({ allowed: false }));
    expect(manifest.toolPolicy.find(tool => tool.name === 'read_private_message')).toEqual(expect.objectContaining({ allowed: false }));
    expect(manifest.callbackContract.action).toBe('external-receipt');
    expect(JSON.stringify(manifest)).not.toContain('API key');
  });

  it('allows browser proof tools only when runtime profile api key and callback secret are configured', () => {
    const manifest = buildRestaurantBrowserSessionManifest({
      runtimeTarget: 'hermes',
      eventId: 'restaurant-agent-proof',
      env: {
        RESTAURANT_AGENT_HERMES_RUNTIME_URL: 'https://hermes.example/runtime',
        RESTAURANT_AGENT_HERMES_API_KEY: 'secret-api-key',
        RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'profile-1',
        RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret',
      },
    });

    expect(manifest.canExecuteNow).toBe(true);
    expect(manifest.runtimeTarget).toBe('hermes');
    expect(manifest.toolPolicy.find(tool => tool.name === 'browser_screenshot')).toEqual(expect.objectContaining({ allowed: true }));
    expect(manifest.toolPolicy.find(tool => tool.name === 'submit_platform_publish')).toEqual(expect.objectContaining({ allowed: false }));
    expect(JSON.stringify(manifest)).not.toContain('secret-api-key');
  });

  it('exposes browser session manifest and registry health through the runtime API', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'browser-session',
        runtimeTarget: 'openclaw',
        eventId: 'restaurant-agent-proof',
        restaurant: 'North City Noodles',
        offer: 'Tomato beef noodle set',
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.browserSession.mode).toBe('isolated-browser-handoff');
    expect(payload.browserSessionRecord.status).toBe('blocked');
    expect(payload.browserSessionHealth.summary.total).toBeGreaterThanOrEqual(1);
    expect(payload.browserSession.task.restaurant).toBe('North City Noodles');
    expect(payload.browserSession.stopConditions).toContain('login or captcha challenge appears');
  });

  it('stores browser sessions with lease heartbeat and health states without secrets', () => {
    const readyManifest = buildRestaurantBrowserSessionManifest({
      runtimeTarget: 'hermes',
      eventId: 'restaurant-agent-ready',
      env: {
        RESTAURANT_AGENT_HERMES_RUNTIME_URL: 'https://hermes.example/runtime',
        RESTAURANT_AGENT_HERMES_API_KEY: 'secret-api-key',
        RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'profile-1',
        RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret',
      },
    });
    const blockedManifest = buildRestaurantBrowserSessionManifest({
      runtimeTarget: 'openclaw',
      eventId: 'restaurant-agent-blocked',
      env: {},
    });

    const ready = recordRestaurantBrowserSession(readyManifest, new Date('2026-05-23T08:00:00.000Z'));
    const blocked = recordRestaurantBrowserSession(blockedManifest, new Date('2026-05-23T08:00:00.000Z'));
    const heartbeat = heartbeatRestaurantBrowserSession(ready.sessionId, new Date('2026-05-23T08:05:00.000Z'));
    const health = buildRestaurantBrowserSessionHealth([heartbeat!, blocked], new Date('2026-05-23T08:06:00.000Z'));

    expect(ready.status).toBe('ready');
    expect(blocked.status).toBe('blocked');
    expect(blocked.blockedReasons).toContain('missing_browser_profile');
    expect(heartbeat?.lastHeartbeatAt).toBe('2026-05-23T08:05:00.000Z');
    expect(health.summary).toEqual(expect.objectContaining({ total: 2, ready: 1, blocked: 1 }));
    expect(JSON.stringify(health)).not.toContain('secret-api-key');
  });
});

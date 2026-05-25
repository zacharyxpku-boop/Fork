import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentChannelHub } from '@/lib/restaurant-agent-channel-hub';

describe('restaurant agent channel hub', () => {
  it('maps chat channels, schedules and external gates without pretending delivery is configured', () => {
    const hub = buildRestaurantAgentChannelHub({
      restaurant: 'North City Noodle',
      offer: 'Tomato beef noodle set',
      env: {},
      now: new Date('2026-05-24T03:00:00.000Z'),
    });

    expect(hub.payloadShape).toBe('restaurant-agent-channel-hub-v1');
    expect(hub.summary.channels).toBe(5);
    expect(hub.summary.internalHandoffChannels).toBeGreaterThanOrEqual(1);
    expect(hub.summary.providerGatedChannels).toBeGreaterThan(0);
    expect(hub.summary.scheduledJobs).toBe(5);
    expect(hub.summary.providerGatedJobs).toBeGreaterThan(0);
    expect(hub.channels.find(item => item.id === 'webchat')?.status).toBe('internal-handoff');
    expect(hub.channels.find(item => item.id === 'wecom')?.externalRequired).toContain('RESTAURANT_AGENT_WECOM_WEBHOOK_URL');
    expect(hub.scheduledJobs.map(item => item.id)).toContain('night-closeout');
    expect(hub.commandSuggestions[0].routeTo).toBe('publish-and-proof');
    expect(hub.commandSuggestions[0].command).toContain('今晚把 Tomato beef noodle set 做成到店活动');
    expect(hub.commandSuggestions[1].command).toContain('店长待办');
    expect(hub.commandSuggestions[2].command).toContain('库存异常');
    expect(JSON.stringify(hub.commandSuggestions)).not.toMatch(/[鍟椁骞涓绛鎺鐗璐缁妗鏁浠]{2,}/);
    expect(hub.safetyBoundary).toContain('does not send messages without provider configuration');
  });

  it('marks configured and approved channels as provider ready from server-side evidence', () => {
    const hub = buildRestaurantAgentChannelHub({
      env: {
        RESTAURANT_AGENT_WECOM_WEBHOOK_URL: 'configured-webhook',
        RESTAURANT_AGENT_FEISHU_WEBHOOK_URL: 'configured-webhook',
        RESTAURANT_AGENT_CHANNEL_APPROVAL: 'approved',
      },
    });

    expect(hub.channels.find(item => item.id === 'wecom')?.status).toBe('provider-ready');
    expect(hub.channels.find(item => item.id === 'feishu')?.status).toBe('provider-ready');
    expect(JSON.stringify(hub)).not.toContain('configured-webhook');
  });

  it('is exposed through the restaurant runtime API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'channel-hub',
        restaurant: 'North City Noodle',
        offer: 'Tomato beef noodle set',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.channelHub.payloadShape).toBe('restaurant-agent-channel-hub-v1');
    expect(payload.channelHub.restaurant).toBe('North City Noodle');
    expect(payload.channelHub.scheduledJobs.map((item: { id: string }) => item.id)).toContain('runtime-heartbeat');
  });
});

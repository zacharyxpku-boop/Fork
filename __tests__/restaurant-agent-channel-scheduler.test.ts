import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { clearRestaurantAgentChannelDeliveryAttemptsForTest } from '@/lib/restaurant-agent-channel-delivery-store';
import { runRestaurantAgentChannelSchedule } from '@/lib/restaurant-agent-channel-scheduler';

describe('restaurant agent channel scheduler', () => {
  beforeEach(() => {
    clearRestaurantAgentChannelDeliveryAttemptsForTest();
  });

  it('turns due scheduled jobs into governed blocked delivery attempts when providers are missing', async () => {
    const run = await runRestaurantAgentChannelSchedule({
      restaurant: 'North City Noodle',
      offer: 'Tomato beef noodle set',
      env: {},
      now: new Date(2026, 4, 24, 23, 0, 0),
      limit: 3,
    });

    expect(run.payloadShape).toBe('restaurant-agent-channel-schedule-run-v1');
    expect(run.summary.dueJobs).toBe(3);
    expect(run.summary.attempted).toBe(3);
    expect(run.summary.blocked).toBeGreaterThan(0);
    expect(run.summary.retryRecommended).toBeGreaterThan(0);
    expect(run.acceptance.verdict).toBe('internal-schedule-ran-provider-gated');
    expect(run.acceptance.canClaimAlwaysOnAutomation).toBe(false);
    expect(run.acceptance.blockedProviderGates).toBeGreaterThan(0);
    expect(run.acceptance.nextWakeupAt).toBe('2026-05-24T16:00:00.000Z');
    expect(run.operatorTimeline[0].status).toBe('blocked');
    expect(run.operatorTimeline[0].externalGate).not.toBe('none');
    expect(run.recovery[0].nextAction).toContain('Configure');
    expect(run.deliveryReport.summary.total).toBeGreaterThanOrEqual(3);
    expect(run.safetyBoundary).toContain('does not run forever');
  });

  it('forwards configured due staff jobs without leaking provider endpoints', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetcher = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      return { ok: true, status: 200 } as Response;
    });
    const secretWebhook = 'https://provider.example.test/wecom-secret-url';

    const run = await runRestaurantAgentChannelSchedule({
      env: {
        RESTAURANT_AGENT_WECOM_WEBHOOK_URL: secretWebhook,
        RESTAURANT_AGENT_FEISHU_WEBHOOK_URL: 'https://provider.example.test/feishu-secret-url',
        RESTAURANT_AGENT_DINGTALK_WEBHOOK_URL: 'https://provider.example.test/dingtalk-secret-url',
        RESTAURANT_AGENT_CHANNEL_APPROVAL: 'approved',
      },
      fetcher,
      now: new Date(2026, 4, 24, 23, 0, 0),
      limit: 3,
    });

    expect(run.summary.forwarded).toBeGreaterThan(0);
    expect(run.acceptance.canRunStaffSchedule).toBe(true);
    expect(run.acceptance.canClaimAlwaysOnAutomation).toBe(false);
    expect(run.operatorTimeline.some(item => item.status === 'forwarded')).toBe(true);
    expect(calls.length).toBeGreaterThan(0);
    expect(JSON.stringify(run)).not.toContain(secretWebhook);
  });

  it('is exposed through the restaurant runtime API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'channel-schedule-run',
        restaurant: 'North City Noodle',
        offer: 'Tomato beef noodle set',
        limit: 2,
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.channelScheduleRun.payloadShape).toBe('restaurant-agent-channel-schedule-run-v1');
    expect(payload.channelScheduleRun.summary.attempted).toBeGreaterThan(0);
    expect(payload.channelScheduleRun.acceptance.canClaimAlwaysOnAutomation).toBe(false);
    expect(payload.channelScheduleRun.operatorTimeline.length).toBeGreaterThan(0);
    expect(payload.channelDeliveryReport.payloadShape).toBe('restaurant-agent-channel-delivery-report-v1');
  });
});

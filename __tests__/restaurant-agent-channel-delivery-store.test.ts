import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import {
  buildRestaurantAgentChannelDeliveryReport,
  clearRestaurantAgentChannelDeliveryAttemptsForTest,
  executeRestaurantAgentChannelDeliveryAttempt,
  recordRestaurantAgentChannelDeliveryAcknowledgement,
} from '@/lib/restaurant-agent-channel-delivery-store';

describe('restaurant agent channel delivery store', () => {
  beforeEach(() => {
    clearRestaurantAgentChannelDeliveryAttemptsForTest();
  });

  it('records blocked provider attempts when staff channel gates are missing', async () => {
    const result = await executeRestaurantAgentChannelDeliveryAttempt({
      restaurant: 'North City Noodle',
      offer: 'Tomato beef noodle set',
      channelId: 'wecom',
      jobId: 'morning-prep',
      env: {},
      now: new Date('2026-05-24T04:00:00.000Z'),
    });

    expect(result.attempt.status).toBe('blocked');
    expect(result.attempt.missing).toContain('RESTAURANT_AGENT_WECOM_WEBHOOK_URL');
    expect(result.report.summary.blocked).toBeGreaterThanOrEqual(1);
    expect(JSON.stringify(result)).not.toContain('webhook.test');
  });

  it('forwards only sanitized staff payloads through configured provider evidence', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const fetcher = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), init });
      return { ok: true, status: 200 } as Response;
    });
    const secretWebhook = 'https://provider.example.test/wecom-secret-url';

    const result = await executeRestaurantAgentChannelDeliveryAttempt({
      restaurant: 'North City Noodle',
      offer: 'Tomato beef noodle set',
      channelId: 'wecom',
      jobId: 'morning-prep',
      env: {
        RESTAURANT_AGENT_WECOM_WEBHOOK_URL: secretWebhook,
        RESTAURANT_AGENT_CHANNEL_APPROVAL: 'approved',
      },
      fetcher,
      now: new Date('2026-05-24T04:05:00.000Z'),
    });

    expect(result.attempt.status).toBe('forwarded');
    expect(result.attempt.providerEvidence).toBe('wecom:configured');
    expect(result.attempt.externalRunId).toContain('channel-wecom');
    expect(calls[0].url).toBe(secretWebhook);
    expect(calls[0].init?.body && String(calls[0].init.body)).toContain('North City Noodle');
    expect(JSON.stringify(result)).not.toContain(secretWebhook);
  });

  it('serves blocked attempts through the runtime API without leaking provider secrets', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'channel-delivery-attempt',
        restaurant: 'North City Noodle',
        offer: 'Tomato beef noodle set',
        channelId: 'wecom',
        jobId: 'morning-prep',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.channelDeliveryAttempt.status).toBe('blocked');
    expect(payload.channelDeliveryReport.payloadShape).toBe('restaurant-agent-channel-delivery-report-v1');
  });

  it('records staff acknowledgements against delivery attempts without claiming customer impact', async () => {
    const attemptResult = await executeRestaurantAgentChannelDeliveryAttempt({
      restaurant: 'North City Noodle',
      offer: 'Tomato beef noodle set',
      channelId: 'webchat',
      jobId: 'morning-prep',
      now: new Date('2026-05-24T04:08:00.000Z'),
    });

    const result = recordRestaurantAgentChannelDeliveryAcknowledgement({
      attemptId: attemptResult.attempt.attemptId,
      operator: 'shift manager',
      note: 'Manager saw the prep task and will collect public proof after posting.',
      evidenceUrl: 'internal://staff-channel/morning-prep',
      now: new Date('2026-05-24T04:09:00.000Z'),
    });

    expect(result.acknowledgement.status).toBe('acknowledged');
    expect(result.report.summary.acknowledged).toBe(1);
    expect(result.report.latestAcknowledgements[0].attemptId).toBe(attemptResult.attempt.attemptId);
    expect(result.acknowledgement.safetyBoundary).toContain('does not verify customer outreach');
  });

  it('serves staff acknowledgements through the runtime API', async () => {
    const attemptResult = await executeRestaurantAgentChannelDeliveryAttempt({
      channelId: 'webchat',
      jobId: 'night-closeout',
      now: new Date('2026-05-24T04:11:00.000Z'),
    });
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'channel-delivery-acknowledgement',
        attemptId: attemptResult.attempt.attemptId,
        operator: 'ops',
        note: 'Acknowledged in staff console.',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.channelDeliveryAcknowledgement.status).toBe('acknowledged');
    expect(payload.channelDeliveryReport.summary.acknowledged).toBe(1);
  });

  it('returns a delivery report from ledger state', () => {
    const report = buildRestaurantAgentChannelDeliveryReport(new Date('2026-05-24T04:10:00.000Z'));

    expect(report.payloadShape).toBe('restaurant-agent-channel-delivery-report-v1');
    expect(report.summary.latestStatus).toBe('none');
    expect(report.safetyBoundary).toContain('never exposes webhook URLs');
  });
});

import { afterEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { signRestaurantAgentCallback, verifyRestaurantAgentCallback } from '@/lib/restaurant-agent-callback';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { clearRestaurantAgentReceiptsForTest } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';

describe('restaurant agent signed runtime callback', () => {
  afterEach(() => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
    delete process.env.RESTAURANT_AGENT_CALLBACK_SECRET;
  });

  it('verifies HMAC signatures without exposing the callback secret', () => {
    const rawBody = JSON.stringify({ action: 'external-receipt', eventId: 'restaurant-agent-proof' });
    const signature = signRestaurantAgentCallback(rawBody, 'callback-secret');

    expect(verifyRestaurantAgentCallback(rawBody, signature, 'callback-secret')).toEqual(expect.objectContaining({
      ok: true,
      status: 202,
      secretConfigured: true,
    }));
    expect(verifyRestaurantAgentCallback(rawBody, 'sha256=bad', 'callback-secret')).toEqual(expect.objectContaining({
      ok: false,
      status: 401,
      secretConfigured: true,
    }));
    expect(JSON.stringify(verifyRestaurantAgentCallback(rawBody, signature, 'callback-secret'))).not.toContain('callback-secret');
  });

  it('rejects external runtime receipts until the callback secret is configured', async () => {
    const rawBody = JSON.stringify({
      action: 'external-receipt',
      eventId: 'restaurant-agent-proof',
      channel: 'Lobu',
      externalRunId: 'lobu-run-1',
      summary: 'External runtime finished a browser proof task.',
    });
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'x-restaurant-agent-signature': signRestaurantAgentCallback(rawBody, 'callback-secret') },
      body: rawBody,
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.error).toBe('external_receipt_signature_denied');
    expect(payload.audit.secretExposed).toBe(false);
  });

  it('accepts signed external runtime receipts and feeds heartbeat', async () => {
    process.env.RESTAURANT_AGENT_CALLBACK_SECRET = 'callback-secret';
    const run = recordRestaurantAgentRun(
      buildRestaurantAgentDispatch({ taskId: 'browser-publish-check', restaurant: 'South City Bistro', offer: 'Dinner set', owner: 'Operator' }),
      'openclaw',
      { ok: true, target: 'openclaw', status: 'forwarded', message: 'forwarded', externalRunId: 'openclaw-run-1', audit: { secretExposed: false, payloadShape: 'restaurant-agent-external-execution-v1', blockedActions: [], canForward: true } },
    );
    const rawBody = JSON.stringify({
      action: 'external-receipt',
      eventId: run.eventId,
      channel: 'OpenClaw',
      externalRunId: 'openclaw-run-1',
      screenshotId: 'browser-proof-1',
      operator: 'external-runtime',
      summary: 'External browser executor saved a signed proof receipt.',
    });

    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'x-restaurant-agent-signature': signRestaurantAgentCallback(rawBody, 'callback-secret') },
      body: rawBody,
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(202);
    expect(payload.ok).toBe(true);
    expect(payload.receipt.status).toBe('accepted');
    expect(payload.receipt.source).toBe('external-runtime');
    expect(payload.receipt.evidenceLevel).toBe('strong');
    expect(payload.providerCallbackCloseoutConsole.payloadShape).toBe('restaurant-provider-callback-closeout-console-v1');
    expect(payload.providerCallbackCloseoutConsole.verdict).toBe('accepted-train-next-run');
    expect(payload.providerCallbackCloseoutConsole.summary).toEqual(expect.objectContaining({
      signatureVerified: true,
      receiptAccepted: true,
      canWriteMemory: true,
      canClaimExternalAutomation: false,
    }));
    expect(payload.providerCallbackCloseoutConsole.trainingGate.forbiddenWrites).toContain('private-message text');
    expect(JSON.stringify(payload.providerCallbackCloseoutConsole)).not.toContain('callback-secret');
    expect(payload.audit).toEqual(expect.objectContaining({ signatureVerified: true, secretExposed: false }));
    expect(payload.heartbeat.acceptedReceipts).toBeGreaterThanOrEqual(1);
  });

  it('rejects signed external receipts for unknown event ids', async () => {
    process.env.RESTAURANT_AGENT_CALLBACK_SECRET = 'callback-secret';
    const rawBody = JSON.stringify({
      action: 'external-receipt',
      eventId: 'unknown-external-event',
      channel: 'OpenClaw',
      externalRunId: 'openclaw-run-2',
      screenshotId: 'browser-proof-2',
      operator: 'external-runtime',
      summary: 'External browser executor saved a signed proof receipt.',
    });

    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'x-restaurant-agent-signature': signRestaurantAgentCallback(rawBody, 'callback-secret') },
      body: rawBody,
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(422);
    expect(payload.ok).toBe(false);
    expect(payload.receipt.status).toBe('rejected');
    expect(payload.receipt.rejectedReason).toBe('external_receipt_event_not_found');
    expect(payload.providerCallbackCloseoutConsole.verdict).toBe('rejected-recover');
    expect(payload.providerCallbackCloseoutConsole.summary.canWriteMemory).toBe(false);
    expect(payload.providerCallbackCloseoutConsole.recoveryQueue.length).toBeGreaterThan(0);
  });
});

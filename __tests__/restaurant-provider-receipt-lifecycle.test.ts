import { afterEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { signRestaurantAgentCallback } from '@/lib/restaurant-agent-callback';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantPostRunReviewPack } from '@/lib/restaurant-post-run-review-pack';
import { buildRestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';
import { buildRestaurantProviderReceiptLifecycle } from '@/lib/restaurant-provider-receipt-lifecycle';
import { buildRestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';

describe('restaurant provider receipt lifecycle', () => {
  afterEach(() => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
    delete process.env.RESTAURANT_AGENT_CALLBACK_SECRET;
  });

  it('connects accepted provider receipt to business signals, post-run review and memory boundary', () => {
    const now = new Date('2026-05-26T16:00:00.000Z');
    const run = recordRestaurantAgentRun(
      buildRestaurantAgentDispatch({
        taskId: 'browser-publish-check',
        restaurant: 'Lifecycle Bistro',
        offer: 'Late dinner set',
        owner: 'ops',
      }),
      'openclaw',
      {
        ok: true,
        target: 'openclaw',
        status: 'forwarded',
        message: 'forwarded',
        externalRunId: 'openclaw-lifecycle-run',
        audit: { secretExposed: false, payloadShape: 'restaurant-agent-external-execution-v1', blockedActions: [], canForward: true },
      },
      now,
    );
    const receipt = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: 'OpenClaw',
      externalRunId: 'openclaw-lifecycle-run',
      screenshotId: 'lifecycle-proof-shot',
      operator: 'external-runtime',
      summary: 'External runtime returned signed public proof and aggregate visit intent counts.',
      source: 'external-runtime',
      signalType: 'visit-intent',
      visitIntentCount: 7,
    }, new Date('2026-05-26T16:02:00.000Z'));
    const runs = [run];
    const receipts = [receipt];
    const readiness = buildRestaurantExternalReadiness({});
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({ runs, receipts, readiness, now });
    const postRunReviewPack = buildRestaurantPostRunReviewPack({
      restaurant: 'Lifecycle Bistro',
      offer: 'Late dinner set',
      queue: buildRestaurantStoreManagerTaskQueue(now),
      runs,
      receipts,
      readiness,
      providerReceiptInbox,
      now,
    });
    const lifecycle = buildRestaurantProviderReceiptLifecycle({
      runs,
      receipts,
      providerReceiptInbox,
      postRunReviewPack,
      now,
    });
    const serialized = JSON.stringify(lifecycle);

    expect(lifecycle.payloadShape).toBe('restaurant-provider-receipt-lifecycle-v1');
    expect(lifecycle.verdict).toBe('accepted-closeout-ready');
    expect(lifecycle.summary.canWriteMemory).toBe(true);
    expect(lifecycle.summary.canClaimExternalAutomation).toBe(false);
    expect(lifecycle.stages.map(stage => stage.id)).toEqual(['submit', 'callback', 'validation', 'signals', 'post-run', 'next-loop']);
    expect(lifecycle.memoryWriteRule.allowed).toBe(true);
    expect(lifecycle.memoryWriteRule.forbidden).toContain('private-message text');
    expect(serialized).not.toContain('callback-secret');
    expect(serialized).not.toContain('cookie-value');
    expect(serialized).not.toMatch(/1[3-9]\d{9}/);
  });

  it('is exposed through the runtime API', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({ action: 'provider-receipt-lifecycle' }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.providerReceiptLifecycle.payloadShape).toBe('restaurant-provider-receipt-lifecycle-v1');
    expect(payload.providerReceiptLifecycle.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.providerReceiptLifecycle.memoryWriteRule.forbidden).toContain('raw POS rows');
    expect(payload.providerReceiptInbox.payloadShape).toBe('restaurant-provider-receipt-inbox-v1');
    expect(payload.postRunReviewPack.payloadShape).toBe('restaurant-post-run-review-pack-v1');
  });

  it('returns lifecycle after signed external receipt callback', async () => {
    process.env.RESTAURANT_AGENT_CALLBACK_SECRET = 'callback-secret';
    const run = recordRestaurantAgentRun(
      buildRestaurantAgentDispatch({
        taskId: 'browser-publish-check',
        restaurant: 'Callback Lifecycle Bistro',
        offer: 'Dinner proof',
        owner: 'ops',
      }),
      'openclaw',
      {
        ok: true,
        target: 'openclaw',
        status: 'forwarded',
        message: 'forwarded',
        externalRunId: 'openclaw-callback-lifecycle',
        audit: { secretExposed: false, payloadShape: 'restaurant-agent-external-execution-v1', blockedActions: [], canForward: true },
      },
    );
    const rawBody = JSON.stringify({
      action: 'external-receipt',
      eventId: run.eventId,
      channel: 'OpenClaw',
      externalRunId: 'openclaw-callback-lifecycle',
      screenshotId: 'callback-lifecycle-shot',
      operator: 'external-runtime',
      summary: 'External runtime returned signed public proof.',
      signalType: 'publish-proof',
    });
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'x-restaurant-agent-signature': signRestaurantAgentCallback(rawBody, 'callback-secret') },
      body: rawBody,
    }) as never);
    const payload = await response.json();
    const serialized = JSON.stringify(payload);

    expect(response.status).toBe(202);
    expect(payload.receipt.status).toBe('accepted');
    expect(payload.providerReceiptLifecycle.payloadShape).toBe('restaurant-provider-receipt-lifecycle-v1');
    expect(payload.providerReceiptLifecycle.verdict).toBe('accepted-closeout-ready');
    expect(payload.providerReceiptLifecycle.summary.canWriteMemory).toBe(true);
    expect(payload.providerReceiptLifecycle.summary.canClaimExternalAutomation).toBe(false);
    expect(serialized).not.toContain('callback-secret');
    expect(serialized).not.toContain('cookie-value');
  });
});

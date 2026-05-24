import { afterEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantAgentHeartbeat } from '@/lib/restaurant-agent-heartbeat';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';

describe('restaurant agent receipt store', () => {
  afterEach(() => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
  });

  it('rejects sample manual receipts instead of treating demo links as real proof', () => {
    const run = recordRestaurantAgentRun(buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'Trial Restaurant',
      offer: 'Lunch set',
      owner: 'Operator',
    }), 'local');

    const receipt = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: 'Dianping',
      evidenceUrl: 'https://example.com/proof',
      operator: 'Operator',
      summary: 'Sample receipt imported for demo only.',
    });

    expect(receipt.status).toBe('rejected');
    expect(receipt.evidenceLevel).toBe('invalid');
    expect(receipt.rejectedReason).toBe('sample_evidence_url_not_real_proof');
    expect(receipt.validationWarnings).toContain('sample_or_demo_evidence_url');
  });

  it('accepts matched real proof receipts and scores the evidence', () => {
    const run = recordRestaurantAgentRun(buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'South City Bistro',
      offer: 'Dinner set',
      owner: 'Store manager',
    }), 'local');

    const receipt = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: 'Dianping',
      evidenceUrl: 'https://www.dianping.com/shop/123/review/456',
      screenshotId: 'shot-public-proof-1',
      operator: 'Operator',
      summary: 'Public publish proof saved.',
    });

    expect(receipt.status).toBe('accepted');
    expect(receipt.runMatched).toBe(true);
    expect(receipt.channelClass).toBe('dianping-meituan');
    expect(receipt.evidenceScore).toBeGreaterThanOrEqual(55);
    expect(receipt.receiptId).toContain('restaurant-receipt-');
  });

  it('rejects unknown events, duplicate evidence, missing evidence and private content', () => {
    const run = recordRestaurantAgentRun(buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'East Gate Noodles',
      offer: 'Late dinner set',
      owner: 'Operator',
    }), 'local');

    const unknown = recordRestaurantAgentReceipt({
      eventId: 'missing-run-event',
      channel: 'Xiaohongshu',
      evidenceUrl: 'https://www.xiaohongshu.com/explore/abc',
      summary: 'Public note proof saved.',
    });
    const first = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: 'Xiaohongshu',
      evidenceUrl: 'https://www.xiaohongshu.com/explore/abc',
      screenshotId: 'shot-xhs-proof',
      summary: 'Public note proof saved.',
    });
    const duplicate = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: 'Xiaohongshu',
      evidenceUrl: 'https://www.xiaohongshu.com/explore/abc',
      screenshotId: 'shot-xhs-proof',
      summary: 'Public note proof saved again.',
    });
    const noEvidence = recordRestaurantAgentReceipt({ eventId: run.eventId, channel: 'Douyin' });
    const sensitive = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: 'Wechat community',
      screenshotId: 'shot-private',
      summary: 'private message contains phone 13800000000',
    });

    expect(unknown.status).toBe('rejected');
    expect(unknown.rejectedReason).toBe('manual_receipt_event_not_found');
    expect(first.status).toBe('accepted');
    expect(duplicate.status).toBe('rejected');
    expect(duplicate.duplicate).toBe(true);
    expect(duplicate.rejectedReason).toBe('duplicate_receipt_evidence');
    expect(noEvidence.status).toBe('rejected');
    expect(noEvidence.rejectedReason).toBe('receipt_missing_evidence');
    expect(sensitive.status).toBe('rejected');
    expect(sensitive.rejectedReason).toBe('receipt_contains_sensitive_or_private_content');
    expect(JSON.stringify(sensitive)).not.toContain('private message contains phone');
  });

  it('imports validated receipts through the runtime API and feeds heartbeat followup', async () => {
    const runResponse = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 'browser-publish-check',
        restaurant: 'South City Bistro',
        offer: 'Dinner set',
        owner: 'Store manager',
        runtimeTarget: 'local',
      }),
    }) as never);
    const runPayload = await runResponse.json();

    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'receipt',
        eventId: runPayload.run.eventId,
        channel: 'Dianping',
        evidenceUrl: 'https://www.dianping.com/shop/123/review/456',
        screenshotId: 'shot-public-proof-2',
        operator: 'Operator',
        summary: 'Public publish proof saved.',
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(201);
    expect(payload.receipt.status).toBe('accepted');
    expect(payload.receipt.evidenceScore).toBeGreaterThanOrEqual(55);
    expect(payload.heartbeat.acceptedReceipts).toBe(1);
    expect(buildRestaurantAgentHeartbeat([runPayload.run], [payload.receipt]).followups[0].nextAction).toContain('更新门店记忆');
  });
});

import { afterEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantRunHealth } from '@/lib/restaurant-agent-run-health';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';

describe('restaurant agent run health', () => {
  afterEach(() => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
  });

  it('summarizes accepted waiting blocked failed queued and rejected receipt states', () => {
    const base = buildRestaurantAgentDispatch({ taskId: 'browser-publish-check', restaurant: '南城川味小馆', offer: '双人酸菜鱼套餐', owner: '店长' });
    const queued = recordRestaurantAgentRun(base, 'local', undefined, new Date('2026-05-23T00:00:00.000Z'));
    const blocked = recordRestaurantAgentRun(
      buildRestaurantAgentDispatch({ taskId: 'browser-publish-check', restaurant: '北城面馆', offer: '番茄牛腩面套餐', runtimeTarget: 'lobu' }),
      'lobu',
      { ok: false, target: 'lobu', status: 'blocked', message: 'missing auth', audit: { secretExposed: false, payloadShape: 'restaurant-agent-external-execution-v1', blockedActions: [], canForward: false } },
      new Date('2026-05-23T00:05:00.000Z'),
    );
    const forwarded = recordRestaurantAgentRun(
      buildRestaurantAgentDispatch({ taskId: 'browser-publish-check', restaurant: '西湖小馆', offer: '夜宵套餐', owner: '运营' }),
      'openclaw',
      { ok: true, target: 'openclaw', status: 'forwarded', message: 'forwarded', externalRunId: 'openclaw-1', audit: { secretExposed: false, payloadShape: 'restaurant-agent-external-execution-v1', blockedActions: [], canForward: true } },
      new Date('2026-05-23T00:10:00.000Z'),
    );
    const failed = recordRestaurantAgentRun(
      buildRestaurantAgentDispatch({ taskId: 'memory-followup', restaurant: '湖东小馆', offer: '社群套餐' }),
      'hermes',
      { ok: false, target: 'hermes', status: 'failed', message: 'runtime 599', audit: { secretExposed: false, payloadShape: 'restaurant-agent-external-execution-v1', blockedActions: [], canForward: true } },
      new Date('2026-05-23T00:15:00.000Z'),
    );

    const acceptedReceipt = recordRestaurantAgentReceipt({
      eventId: forwarded.eventId,
      channel: '大众点评',
      evidenceUrl: 'https://www.dianping.com/shop/123/review/456',
      screenshotId: 'shot-public-proof',
      operator: '运营',
      summary: '发布链接已回填。',
    }, new Date('2026-05-23T00:20:00.000Z'));
    recordRestaurantAgentReceipt({
      eventId: failed.eventId,
      channel: '微信',
      screenshotId: 'shot-1',
      operator: '运营',
      summary: '私信原文含手机号 13800000000',
    }, new Date('2026-05-23T00:25:00.000Z'));

    const health = buildRestaurantRunHealth(
      [failed, forwarded, blocked, queued],
      [acceptedReceipt],
      buildRestaurantExternalReadiness({}),
      new Date('2026-05-23T00:30:00.000Z'),
    );

    expect(health.summary.totalRuns).toBe(4);
    expect(health.summary.accepted).toBe(1);
    expect(health.summary.blockedAuth).toBe(1);
    expect(health.summary.failed).toBe(1);
    expect(health.summary.queuedLocal).toBe(1);
    expect(health.items.find(item => item.eventId === forwarded.eventId)).toEqual(expect.objectContaining({
      state: 'accepted',
      evidenceState: 'accepted',
      latestReceiptId: acceptedReceipt.receiptId,
    }));
    expect(health.items.find(item => item.eventId === blocked.eventId)?.nextAction).toContain('补齐 runtime');
    expect(health.safetyBoundary).toContain('不展示 API key');
  });

  it('marks rejected receipts as health blockers without exposing private data', () => {
    const run = recordRestaurantAgentRun(
      buildRestaurantAgentDispatch({ taskId: 'browser-publish-check', restaurant: '东城面馆', offer: '晚餐套餐' }),
      'openclaw',
      { ok: true, target: 'openclaw', status: 'forwarded', message: 'forwarded', audit: { secretExposed: false, payloadShape: 'restaurant-agent-external-execution-v1', blockedActions: [], canForward: true } },
      new Date('2026-05-23T00:00:00.000Z'),
    );
    const rejected = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: '微信',
      screenshotId: 'shot-private',
      operator: '运营',
      summary: '顾客手机号 13900000000',
    }, new Date('2026-05-23T00:01:00.000Z'));
    const health = buildRestaurantRunHealth([run], [rejected], undefined, new Date('2026-05-23T00:10:00.000Z'));

    expect(rejected.status).toBe('rejected');
    expect(health.summary.rejectedReceipts).toBe(1);
    expect(health.items[0]).toEqual(expect.objectContaining({
      state: 'receipt-rejected',
      evidenceState: 'rejected',
    }));
    expect(JSON.stringify(health)).not.toContain('13900000000');
  });

  it('exposes run health through the runtime API', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({ action: 'run-health' }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.runHealth.ok).toBe(true);
    expect(payload.runHealth.summary).toEqual(expect.objectContaining({
      totalRuns: expect.any(Number),
      externalBlockedGroups: expect.any(Number),
    }));
    expect(payload.runHealth.safetyBoundary).toContain('私信原文');
  });
});

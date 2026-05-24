import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantStoreManagerFollowupPack } from '@/lib/restaurant-store-manager-followup';

describe('restaurant store manager followup', () => {
  it('turns accepted aggregate business signals into owner tasks and talk tracks', () => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();

    const dispatch = buildRestaurantAgentDispatch({
      taskId: 'visit-intent-followup',
      restaurant: '北城面馆',
      offer: '番茄牛腩面套餐',
      owner: '店长',
      runtimeTarget: 'openclaw',
    });
    const run = recordRestaurantAgentRun(dispatch, 'openclaw', {
      ok: true,
      target: 'openclaw',
      status: 'forwarded',
      message: 'forwarded',
      audit: { secretExposed: false, payloadShape: 'restaurant-agent-external-execution-v1', blockedActions: [], canForward: true },
    }, new Date('2026-05-23T10:00:00.000Z'));
    const receipt = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: '大众点评',
      evidenceUrl: 'https://www.dianping.com/shop/123/review/456',
      externalRunId: 'openclaw-run-visit-1',
      operator: '店长',
      summary: 'Public visit intent proof accepted.',
      source: 'external-runtime',
      signalType: 'visit-intent',
      visitIntentCount: 3,
      couponClaimCount: 1,
    }, new Date('2026-05-23T10:05:00.000Z'));

    const pack = buildRestaurantStoreManagerFollowupPack({
      restaurant: '北城面馆',
      offer: '番茄牛腩面套餐',
      runs: [run],
      receipts: [receipt],
      now: new Date('2026-05-23T10:06:00.000Z'),
    });

    expect(pack.payloadShape).toBe('restaurant-store-manager-followup-v1');
    expect(pack.summary.today).toBe(1);
    expect(pack.tasks[0]).toEqual(expect.objectContaining({
      owner: 'store-manager',
      priority: 'today',
      signal: 'visit-intent',
    }));
    expect(pack.tasks[0].talkTrack).toContain('番茄牛腩面套餐');
    expect(pack.tasks[0].stopLine).toContain('私信');
    expect(pack.safetyBoundary).toContain('does not contact customers');
  });

  it('returns a blocked bootstrap task before accepted receipts exist', () => {
    const pack = buildRestaurantStoreManagerFollowupPack({
      restaurant: '北城面馆',
      offer: '番茄牛腩面套餐',
      runs: [],
      receipts: [],
      now: new Date('2026-05-23T10:06:00.000Z'),
    });

    expect(pack.summary.blocked).toBe(1);
    expect(pack.tasks[0].action).toContain('真实公开发布链接');
    expect(pack.managerBrief.join('\n')).toContain('阻断 1');
  });

  it('is exposed through the restaurant runtime API', async () => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();

    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'store-manager-followup',
        restaurant: '北城面馆',
        offer: '番茄牛腩面套餐',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.storeManagerFollowup.payloadShape).toBe('restaurant-store-manager-followup-v1');
    expect(['store-manager', 'shift-lead', 'community-ops', 'runtime-admin']).toContain(payload.storeManagerFollowup.tasks[0].owner);
    expect(payload.commandCenter.payloadShape).toBe('restaurant-agent-command-center-v1');
    expect(['store-manager', 'shift-lead', 'community-ops', 'runtime-admin']).toContain(payload.commandCenter.storeManagerFollowup.tasks[0].owner);
  });
});

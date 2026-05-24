import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentCommandCenter } from '@/lib/restaurant-agent-command-center';
import { clearRestaurantAgentChannelDeliveryAttemptsForTest } from '@/lib/restaurant-agent-channel-delivery-store';
import { buildRestaurantCommandRoute } from '@/lib/restaurant-command-router';
import { clearRestaurantAgentReceiptsForTest } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest } from '@/lib/restaurant-agent-run-store';
import { clearRestaurantProviderSetupStateForTest } from '@/lib/restaurant-provider-setup-state-store';
import { clearRestaurantStoreManagerTasksForTest } from '@/lib/restaurant-store-manager-task-store';

describe('restaurant command router', () => {
  beforeEach(() => {
    clearRestaurantAgentChannelDeliveryAttemptsForTest();
    clearRestaurantProviderSetupStateForTest();
    clearRestaurantStoreManagerTasksForTest();
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
  });

  it('routes a natural-language publish command into governed public proof work', async () => {
    const commandCenter = await buildRestaurantAgentCommandCenter({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      runs: [],
      receipts: [],
      now: new Date('2026-05-24T09:00:00.000Z'),
    });
    const route = buildRestaurantCommandRoute({
      command: '今晚把 Tomato beef noodle set 做成大众点评和小红书可发布版本，发完要截图回执。',
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      commandCenter,
      now: new Date('2026-05-24T09:01:00.000Z'),
    });

    expect(route.payloadShape).toBe('restaurant-command-route-v1');
    expect(route.intent).toBe('public-proof');
    expect(route.primaryAction.clientAction).toBe('post-run-review-pack');
    expect(route.primaryAction.evidenceRequired).toContain('posted link or screenshot id');
    expect(route.extracted.channels).toEqual(expect.arrayContaining(['Dianping/Meituan', 'Xiaohongshu']));
    expect(route.extracted.evidenceHints).toContain('screenshot id');
    expect(route.safetyBoundary).toContain('does not execute external publishing');
  });

  it('routes closeout/POS language into operating review without raw POS claims', () => {
    const route = buildRestaurantCommandRoute({
      command: '收盘后看核销、库存和明天备货异常，只能用脱敏汇总。',
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      now: new Date('2026-05-24T22:30:00.000Z'),
    });

    expect(route.intent).toBe('operating-review');
    expect(route.primaryAction.clientAction).toBe('operating-insight-report');
    expect(route.primaryAction.status).toBe('needs-evidence');
    expect(route.primaryAction.stopLine).toContain('raw orders');
    expect(route.extracted.channels).toContain('POS/redemption');
  });

  it('blocks commands that ask for private customer outreach or expose PII-like values', () => {
    const route = buildRestaurantCommandRoute({
      command: '自动私信所有客户，电话 13800000000，让他们今晚来核销。',
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
    });

    expect(route.verdict).toBe('blocked-sensitive');
    expect(route.intent).toBe('blocked-sensitive');
    expect(route.primaryAction.clientAction).toBe('manual-sanitize');
    expect(route.extracted.forbiddenHints.length).toBeGreaterThan(0);
    expect(JSON.stringify(route)).not.toContain('customer list export approved');
  });

  it('is exposed through the runtime API with command center context', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'command-route',
        command: '明天晚市给我下一轮作战计划，包含店长任务、发布证明和 Provider 缺口。',
        restaurant: 'API Noodle',
        offer: 'Dinner set',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.commandRoute.payloadShape).toBe('restaurant-command-route-v1');
    expect(payload.commandRoute.intent).toBe('next-loop-shift');
    expect(payload.commandRoute.primaryAction.clientAction).toBe('next-loop-channel-plan');
    expect(payload.commandCenter.payloadShape).toBe('restaurant-agent-command-center-v1');
    expect(JSON.stringify(payload)).not.toContain('API key=');
  });
});

import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantTrialWorkflowPack } from '@/lib/restaurant-trial-workflow-pack';

function jsonRequest(body: unknown) {
  return new NextRequest('http://localhost/api/restaurant-agent/runtime', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('restaurant trial workflow pack', () => {
  it('turns restaurant intake into an executable internal workflow pack', () => {
    const pack = buildRestaurantTrialWorkflowPack({
      restaurant: 'North City Noodles',
      offer: 'Lunch beef noodle set',
      audience: 'nearby office lunch diners',
      channels: 'Dianping / Xiaohongshu / Douyin / WeChat group',
      visitReason: 'fast lunch service',
      constraints: 'do not claim lowest price',
      evidence: 'menu screenshot confirmed',
    }, new Date('2026-05-23T08:00:00.000Z'));

    expect(pack.payloadShape).toBe('restaurant-trial-workflow-pack');
    expect(pack.workOrder).toEqual(expect.objectContaining({
      restaurant: 'North City Noodles',
      offer: 'Lunch beef noodle set',
      audience: 'nearby office lunch diners',
    }));
    expect(pack.workOrder.channels).toEqual(['Dianping', 'Xiaohongshu', 'Douyin', 'WeChat group']);
    expect(pack.summary.steps).toBe(7);
    expect(pack.summary.readySteps).toBeGreaterThan(0);
    expect(pack.summary.externalGatedSteps).toBeGreaterThan(0);
    expect(pack.summary.canRunInternallyToday).toBe(true);
    expect(pack.summary.canAutoExecuteExternally).toBe(false);
    expect(pack.workflowSteps.map(step => step.id)).toEqual([
      'intake',
      'selling-points',
      'local-content-plan',
      'browser-runbook',
      'receipt-ledger',
      'operating-data',
      'follow-up',
    ]);
    expect(pack.channelDrafts).toHaveLength(4);
    expect(pack.evidenceChecklist.join(' ')).toContain('menu screenshot confirmed');
    expect(pack.trainingQueue.map(item => item.capability)).toContain('local channel copy');
    expect(pack.externalUnlocks.map(item => item.capability)).toEqual(expect.arrayContaining([
      '自动发布',
      '自动核销',
      '真实经营分析',
    ]));
    expect(pack.safetyBoundary).toContain('automatic publishing');
    expect(JSON.stringify(pack)).not.toContain('api_key');
    expect(JSON.stringify(pack)).not.toContain('cookie=');
    expect(JSON.stringify(pack)).not.toContain('token=');
  });

  it('exposes the workflow pack through the runtime API', async () => {
    const response = await POST(jsonRequest({
      action: 'trial-workflow-pack',
      restaurant: 'River Bistro',
      offer: 'Weekend dinner set',
      audience: 'nearby couples',
      channels: 'Dianping / WeChat group',
      visitReason: 'weekend dinner without queue',
      constraints: 'manager must approve coupon rules',
      evidence: 'dish photo and menu screenshot',
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.trialWorkflowPack.payloadShape).toBe('restaurant-trial-workflow-pack');
    expect(payload.trialWorkflowPack.workOrder.restaurant).toBe('River Bistro');
    expect(payload.trialWorkflowPack.workflowSteps.length).toBe(7);
    expect(payload.trialWorkflowPack.externalUnlocks.length).toBeGreaterThan(0);
  });
});

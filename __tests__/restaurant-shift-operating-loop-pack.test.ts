import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';

describe('restaurant shift operating loop pack', () => {
  it('exposes one customer operating path without claiming external automation', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'shift-operating-loop-pack',
        restaurant: 'Test Noodle Shop',
        offer: 'Dinner set',
        audience: 'nearby dinner guests',
        channels: 'Dianping / Xiaohongshu / Douyin / WeChat group',
        visitReason: 'walk in tonight without queueing',
        constraints: 'store manager must confirm price, coupon rule and stock',
        evidence: 'menu screenshot and coupon rule',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.shiftOperatingLoopPack.payloadShape).toBe('restaurant-shift-operating-loop-pack-v1');
    expect(payload.shiftOperatingLoopPack.summary.stages).toBe(9);
    expect(payload.shiftOperatingLoopPack.nextBestAction.label).toBeTruthy();
    expect(payload.shiftOperatingLoopPack.stages.map((item: { id: string }) => item.id)).toEqual([
      'command-center',
      'shift-run',
      'provider-handoff',
      'sandbox-acceptance',
      'forwardable-package',
      'sandbox-forward',
      'receipt-inbox',
      'closeout-training',
      'capability-activation',
    ]);
    expect(payload.shiftOperatingLoopPack.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.shiftOperatingLoopPack.safetyBoundary).toContain('does not call providers');
  });
});

import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';

describe('restaurant today command cockpit', () => {
  it('collapses restaurant AI work into four operator lanes without automation claims', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claw-experience-default-path',
        restaurant: 'Today Command Bistro',
        offer: 'Late dinner set',
        audience: 'nearby dinner guests',
        channels: 'Dianping / Xiaohongshu / WeChat group',
      }),
    }));
    const payload = await response.json();
    const cockpit = payload.todayCommandCockpit;
    const serialized = JSON.stringify(cockpit);

    expect(response.status).toBe(200);
    expect(cockpit.payloadShape).toBe('restaurant-today-command-cockpit-v1');
    expect(cockpit.summary.lanes).toBe(4);
    expect(cockpit.lanes.map((item: { id: string }) => item.id)).toEqual([
      'get-customers',
      'publish-proof',
      'redeem-and-pos',
      'review-and-train',
    ]);
    expect(cockpit.nextBestAction.action).toBeTruthy();
    expect(cockpit.proofLedgerContract.memoryWriteRule).toBe('accepted-proof-or-sanitized-aggregate-only');
    expect(cockpit.summary.canClaimAutoPublish).toBe(false);
    expect(cockpit.summary.canClaimAutoAcquisition).toBe(false);
    expect(cockpit.summary.canClaimAutoRedemption).toBe(false);
    expect(cockpit.summary.canClaimTrueOperatingAnalysis).toBe(false);
    expect(cockpit.safetyBoundary).toContain('不发布、不联系顾客');
    expect(serialized).not.toContain('13800000000');
    expect(serialized).not.toContain('token-value');
    expect(serialized).not.toContain('cookie-value');
  });
});

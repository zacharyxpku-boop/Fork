import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';

describe('restaurant provider run packet', () => {
  it('is exposed by the default path API as a safe external handoff contract', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claw-experience-default-path',
        restaurant: 'Provider Packet Bistro',
        offer: 'Late dinner set',
      }),
    }));
    const payload = await response.json();
    const packet = payload.providerRunPacket;
    const serialized = JSON.stringify(packet);

    expect(response.status).toBe(200);
    expect(packet.payloadShape).toBe('restaurant-provider-run-packet-v1');
    expect(packet.summary.canClaimExternalAutomation).toBe(false);
    expect(packet.request.method).toBe('POST');
    expect(packet.request.auth).toBe('server-side-bearer-only');
    expect(packet.request.bodyPreview.audit.includesSecrets).toBe(false);
    expect(packet.callbackReceiptExample.action).toBe('external-receipt');
    expect(packet.callbackReceiptExample.requiredHeader).toBe('x-restaurant-agent-signature');
    expect(packet.acceptanceChecklist.map((item: { id: string }) => item.id)).toEqual([
      'provider-response',
      'signed-callback',
      'public-proof',
      'memory-training',
      'claim-boundary',
    ]);
    expect(packet.request.forbiddenFields).toContain('cookies');
    expect(serialized).not.toContain('secret-value');
    expect(serialized).not.toContain('cookie-value');
    expect(serialized).not.toContain('rawPrivateMessage');
  });
});

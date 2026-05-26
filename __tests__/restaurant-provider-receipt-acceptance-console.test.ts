import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';

describe('restaurant provider receipt acceptance console', () => {
  it('is exposed by the default path API as the callback-to-training gate', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claw-experience-default-path',
        restaurant: 'Receipt Console Bistro',
        offer: 'Weekend dinner set',
      }),
    }));
    const payload = await response.json();
    const consolePayload = payload.providerReceiptAcceptanceConsole;
    const serialized = JSON.stringify(consolePayload);

    expect(response.status).toBe(200);
    expect(consolePayload.payloadShape).toBe('restaurant-provider-receipt-acceptance-console-v1');
    expect(consolePayload.summary.canClaimExternalAutomation).toBe(false);
    expect(consolePayload.run.callbackAction).toBe('external-receipt');
    expect(consolePayload.run.callbackHeader).toBe('x-restaurant-agent-signature');
    expect(consolePayload.validationChecks.map((item: { id: string }) => item.id)).toEqual([
      'signature',
      'run-id',
      'public-proof',
      'private-data-boundary',
      'business-signal',
      'memory-write',
      'claim-boundary',
    ]);
    expect(consolePayload.callbackContract.rejectedFields).toContain('cookies');
    expect(consolePayload.closeoutTraining.forbiddenWrites).toContain('private-message text');
    expect(serialized).not.toContain('secret-value');
    expect(serialized).not.toContain('cookie-value');
    expect(serialized).not.toContain('rawPrivateMessage');
  });
});

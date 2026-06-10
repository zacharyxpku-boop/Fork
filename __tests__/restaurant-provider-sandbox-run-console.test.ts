import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';

describe('restaurant provider sandbox run console', () => {
  it('exposes a submit-to-closeout timeline through the default path API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claw-experience-default-path',
        restaurant: 'Run Console Bistro',
        offer: 'Late dinner set',
      }),
    }));
    const payload = await response.json();
    const consolePayload = payload.providerSandboxRunConsole;
    const serialized = JSON.stringify(consolePayload);

    expect(response.status).toBe(200);
    expect(consolePayload.payloadShape).toBe('restaurant-provider-sandbox-run-console-v1');
    expect(consolePayload.summary.canClaimExternalAutomation).toBe(false);
    expect(consolePayload.summary.steps).toBe(6);
    expect(consolePayload.timeline.map((step: { id: string }) => step.id)).toEqual([
      'readiness',
      'submit-package',
      'dispatch',
      'runner-events',
      'signed-callback',
      'closeout',
    ]);
    expect(consolePayload.providerCallbackContract.header).toBe('x-restaurant-agent-signature');
    expect(consolePayload.providerCallbackContract.forbiddenFields).toContain('raw POS rows');
    expect(consolePayload.closeoutChecklist.map((item: { label: string }) => item.label)).toContain('签名回执已接受');
    expect(typeof consolePayload.summary.canWriteMemory).toBe('boolean');
    expect(consolePayload.verdict).toMatch(/blocked-before-submit|waiting-signed-callback|recovery-required|accepted-closeout-ready/);
    expect(serialized).not.toContain('secret-value');
    expect(serialized).not.toContain('cookie-value');
    expect(serialized).not.toContain('token-value');
    expect(serialized).not.toMatch(/1[3-9]\d{9}/);
  });
});

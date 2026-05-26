import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';

describe('restaurant provider live run gate', () => {
  it('summarizes the final go/no-go gates before real Provider execution', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claw-experience-default-path',
        restaurant: 'Live Gate Bistro',
        offer: 'Chef menu',
      }),
    }));
    const payload = await response.json();
    const gate = payload.providerLiveRunGate;
    const serialized = JSON.stringify(gate);

    expect(response.status).toBe(200);
    expect(gate.payloadShape).toBe('restaurant-provider-live-run-gate-v1');
    expect(gate.summary.canClaimExternalAutomation).toBe(false);
    expect(gate.summary.canStartRealProviderNow).toBe(false);
    expect(gate.selectedRun.callbackAction).toBe('external-receipt');
    expect(gate.selectedRun.callbackHeader).toBe('x-restaurant-agent-signature');
    expect(gate.launchChecklist.map((item: { id: string }) => item.id)).toEqual([
      'runtime-health',
      'browser-gateway',
      'provider-package',
      'merchant-auth',
      'data-contract',
      'signed-callback',
      'receipt-closeout',
      'claim-boundary',
    ]);
    expect(gate.firstLiveAction.acceptedResult).toContain('signed external-receipt');
    expect(gate.externalRequired.length).toBeGreaterThan(0);
    expect(payload.providerLiveRunLaunchAttempt.payloadShape).toBe('restaurant-provider-live-run-launch-attempt-v1');
    expect(payload.providerLiveRunLaunchAttempt.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.providerLiveRunLaunchAttempt.selected.packageId).toBe(gate.selectedRun.packageId);
    expect(payload.providerLiveRunLaunchAttempt.closeoutExpectation.callbackHeader).toBe('x-restaurant-agent-signature');
    expect(payload.providerLiveRunLaunchAttempt.operatorDecision.stopLine).toBeTruthy();
    expect(serialized).not.toContain('secret-value');
    expect(serialized).not.toContain('cookie-value');
    expect(serialized).not.toContain('rawBrowserProfileId:');
  });
});

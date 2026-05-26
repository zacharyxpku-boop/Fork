import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';

describe('restaurant provider adapter config workbench', () => {
  it('chooses simulator versus real-provider mode for Lobu OpenClaw and Hermes without exposing secrets', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claw-experience-default-path',
        restaurant: 'Adapter Config Bistro',
        offer: 'Late dinner set',
      }),
    }));
    const payload = await response.json();
    const workbench = payload.providerAdapterConfigWorkbench;
    const serialized = JSON.stringify(workbench);

    expect(response.status).toBe(200);
    expect(workbench.payloadShape).toBe('restaurant-provider-adapter-config-workbench-v1');
    expect(workbench.summary.targets).toBe(3);
    expect(workbench.summary.canUseSimulatorNow).toBe(true);
    expect(workbench.summary.canClaimExternalAutomation).toBe(false);
    expect(workbench.targets.map((item: { target: string }) => item.target)).toEqual(['lobu', 'openclaw', 'hermes']);
    expect(workbench.recommended.target).toBe('openclaw');
    expect(workbench.targets.every((item: { callbackRequired: string[] }) => item.callbackRequired.includes('x-restaurant-agent-signature'))).toBe(true);
    expect(workbench.sandboxVsReal.realProviderRequires).toContain('RESTAURANT_AGENT_CALLBACK_SECRET');
    expect(workbench.providerOfTheKeyRequest.length).toBeGreaterThan(0);
    expect(workbench.redactedFields).toContain('raw POS rows');
    expect(serialized).not.toContain('secret-value');
    expect(serialized).not.toContain('token-value');
    expect(serialized).not.toContain('cookie-value');
    expect(serialized).not.toMatch(/1[3-9]\d{9}/);
  });
});

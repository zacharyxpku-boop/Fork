import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';

describe('restaurant provider forwardable setup dossier', () => {
  it('packages external setup asks for provider, merchant, data and ops owners', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claw-experience-default-path',
        restaurant: 'Dossier Bistro',
        offer: 'Weekday group-buy set',
      }),
    }));
    const payload = await response.json();
    const dossier = payload.providerForwardableSetupDossier;
    const serialized = JSON.stringify(dossier);

    expect(response.status).toBe(200);
    expect(dossier.payloadShape).toBe('restaurant-provider-forwardable-setup-dossier-v1');
    expect(dossier.summary.canClaimExternalAutomation).toBe(false);
    expect(dossier.packets.map((item: { id: string }) => item.id)).toEqual([
      'runtime-provider',
      'merchant-owner',
      'data-owner',
      'ops-lead',
    ]);
    expect(dossier.envTemplate[0].value).toBe('<server-side-only>');
    expect(dossier.firstLiveRunContract.callbackAction).toBe('external-receipt');
    expect(dossier.firstLiveRunContract.callbackHeader).toBe('x-restaurant-agent-signature');
    expect(dossier.exportDigest.markdown).toContain('Forwardable Provider Setup Dossier');
    expect(serialized).not.toContain('secret-value');
    expect(serialized).not.toContain('cookie-value');
    expect(serialized).not.toContain('rawPrivateMessage');
  });
});

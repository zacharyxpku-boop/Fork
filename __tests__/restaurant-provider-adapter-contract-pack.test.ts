import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';

describe('restaurant provider adapter contract pack', () => {
  it('returns concrete provider adapter contracts without exposing secrets or claiming parity', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claw-experience-default-path',
        restaurant: 'Adapter Contract Bistro',
        offer: 'Weekend coupon set',
      }),
    }));
    const payload = await response.json();
    const pack = payload.providerAdapterContractPack;
    const serialized = JSON.stringify(pack);

    expect(response.status).toBe(200);
    expect(pack.payloadShape).toBe('restaurant-provider-adapter-contract-pack-v1');
    expect(pack.summary.adapters).toBe(6);
    expect(pack.adapters.map((item: { id: string }) => item.id)).toEqual([
      'runtime-browser-agent',
      'platform-publish-proof',
      'lead-acquisition',
      'staff-delivery',
      'pos-redemption',
      'model-intelligence',
    ]);
    expect(pack.firstProviderToConfigure.action).toBeTruthy();
    expect(pack.providerSecretPolicy.storage).toBe('server-env-or-secret-manager-only');
    expect(pack.providerSecretPolicy.neverCollectInClient).toContain('API keys');
    expect(pack.callbackContract.signatureHeader).toBe('x-restaurant-agent-signature');
    expect(pack.summary.canClaimCompetitorParity).toBe(false);
    expect(pack.safetyBoundary).toContain('defines integration contracts and acceptance tests only');
    expect(serialized).not.toContain('secret-value');
    expect(serialized).not.toContain('token-value');
    expect(serialized).not.toContain('cookie-value');
  });
});

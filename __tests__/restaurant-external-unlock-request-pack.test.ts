import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantExternalUnlockRequestPack } from '@/lib/restaurant-external-unlock-request-pack';

describe('restaurant external unlock request pack', () => {
  it('turns provider, merchant and data gates into a customer-ready request pack', () => {
    const pack = buildRestaurantExternalUnlockRequestPack({
      restaurant: 'Mission Bistro',
      offer: 'Dinner tasting set',
      audience: 'nearby dinner guests',
      env: {
        RESTAURANT_AGENT_CALLBACK_SECRET: 'secret-callback-value',
        RESTAURANT_AGENT_OPENCLAW_API_KEY: 'sk-secret-openclaw',
      },
      now: new Date('2026-05-24T14:00:00.000Z'),
    });
    const serialized = JSON.stringify(pack);

    expect(pack.payloadShape).toBe('restaurant-external-unlock-request-pack-v1');
    expect(pack.restaurant).toBe('Mission Bistro');
    expect(pack.summary.requests).toBeGreaterThan(0);
    expect(pack.summary.p0).toBeGreaterThan(0);
    expect(pack.summary.providerKeys).toBeGreaterThan(0);
    expect(pack.summary.merchantAuthorizations).toBeGreaterThan(0);
    expect(pack.summary.operatingData).toBeGreaterThan(0);
    expect(pack.summary.canStartInternally).toBe(true);
    expect(pack.summary.canClaimExternalAutomation).toBe(false);
    expect(pack.providerEnvKeys.map(item => item.key)).toEqual(expect.arrayContaining([
      'RESTAURANT_AGENT_LOBU_RUNTIME_URL',
      'RESTAURANT_AGENT_HERMES_RUNTIME_URL',
    ]));
    expect(pack.providerEnvKeys.every(item => item.placeholder === '<server-side-only>')).toBe(true);
    expect(pack.merchantAuthorizationPacket.length).toBeGreaterThan(0);
    expect(pack.operatingDataPacket.map(item => item.provider)).toContain('POS/redemption data source');
    expect(pack.requests.map(item => item.category)).toEqual(expect.arrayContaining([
      'browser-runtime',
      'merchant-authorization',
      'operating-data',
      'staff-channel',
    ]));
    expect(pack.customerHandoffCopy.join(' ')).toContain('server-side environment');
    expect(pack.signoffChecklist.length).toBeGreaterThan(0);
    expect(pack.signoffChecklist[0].acceptance).toContain('unlocks');
    expect(pack.ownerHandoff.map(item => item.target)).toEqual(expect.arrayContaining([
      'runtime-admin',
      'merchant-owner',
      'data-owner',
    ]));
    expect(pack.acceptanceReceiptTemplate.requiredFields).toContain('revocationOwner');
    expect(pack.acceptanceReceiptTemplate.forbiddenFields).toContain('API keys');
    expect(pack.exportDigest.markdown).toContain('Provider Unlock Signoff');
    expect(pack.exportDigest.csv).toContain('id,priority,owner,handoff_target,title,proof_required,status,stop_line');
    expect(pack.safetyBoundary).toContain('never exposes secret values');
    expect(serialized).not.toContain('secret-callback-value');
    expect(serialized).not.toContain('sk-secret-openclaw');
    expect(serialized).not.toContain('cookie=');
    expect(serialized).not.toContain('token=');
  });

  it('exposes the unlock request pack through the runtime API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'external-unlock-request-pack',
        restaurant: 'River Bistro',
        offer: 'Weekend dinner set',
        audience: 'nearby couples',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.externalUnlockRequestPack.payloadShape).toBe('restaurant-external-unlock-request-pack-v1');
    expect(payload.externalUnlockRequestPack.restaurant).toBe('River Bistro');
    expect(payload.externalUnlockRequestPack.summary.p0).toBeGreaterThan(0);
    expect(payload.externalUnlockRequestPack.providerEnvKeys.length).toBeGreaterThan(0);
    expect(payload.externalUnlockRequestPack.merchantAuthorizationPacket.length).toBeGreaterThan(0);
    expect(payload.externalUnlockRequestPack.operatingDataPacket.length).toBeGreaterThan(0);
    expect(payload.externalUnlockRequestPack.signoffChecklist.length).toBeGreaterThan(0);
    expect(payload.externalUnlockRequestPack.acceptanceReceiptTemplate.acceptedWhen.join(' ')).toContain('health-checked');
    expect(payload.externalUnlockRequestPack.exportDigest.markdown).toContain('Signoff Checklist');
    expect(payload.externalUnlockRequestPack.safetyBoundary).toContain('does not claim external automation');
  });
});

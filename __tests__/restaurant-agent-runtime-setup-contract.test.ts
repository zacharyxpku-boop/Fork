import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantRuntimeSetupContract } from '@/lib/restaurant-agent-runtime-setup-contract';

describe('restaurant agent runtime setup contract', () => {
  it('maps competitor runtime needs into explicit setup tracks without leaking secrets', () => {
    const contract = buildRestaurantRuntimeSetupContract({
      env: {},
      now: new Date('2026-05-23T00:00:00.000Z'),
    });

    expect(contract.payloadShape).toBe('restaurant-agent-runtime-setup-contract-v1');
    expect(contract.summary.tracks).toBe(6);
    expect(contract.summary.readyTracks).toBe(0);
    expect(contract.summary.blockedTracks).toBe(6);
    expect(contract.tracks.map(track => track.id)).toEqual([
      'lobu-gateway',
      'openclaw-browser',
      'hermes-browser',
      'merchant-platform-auth',
      'pos-redemption-contract',
      'staff-notification-provider',
    ]);
    expect(contract.blockedCapabilities.map(item => item.capability)).toEqual([
      'auto-publish',
      'auto-acquisition',
      'auto-redemption',
      'true-operating-analysis',
      'auto-staff-notification',
    ]);
    expect(contract.sourceMap.map(item => item.competitor)).toEqual(['Lobu', 'OpenClaw', 'Hermes', 'Restaurant SaaS', 'Restaurant SaaS']);
    expect(JSON.stringify(contract)).not.toContain('API key=');
    expect(contract.safetyBoundary).toContain('never returns API keys');
  });

  it('marks tracks ready only when runtime, callback, profile, merchant auth and POS gates are configured', () => {
    const contract = buildRestaurantRuntimeSetupContract({
      env: {
        RESTAURANT_AGENT_LOBU_RUNTIME_URL: 'https://lobu.example/runtime',
        RESTAURANT_AGENT_LOBU_API_KEY: 'lobu-secret',
        RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL: 'https://openclaw.example/runtime',
        RESTAURANT_AGENT_OPENCLAW_API_KEY: 'openclaw-secret',
        RESTAURANT_AGENT_HERMES_RUNTIME_URL: 'https://hermes.example/runtime',
        RESTAURANT_AGENT_HERMES_API_KEY: 'hermes-secret',
        RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret',
        RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'profile-secret',
        RESTAURANT_AGENT_TENANT_SCOPE: 'tenant-scope-secret',
        RESTAURANT_DIANPING_AUTH_STATUS: 'authorized',
        RESTAURANT_SOCIAL_AUTH_STATUS: 'authorized',
        RESTAURANT_POS_DATA_MODE: 'csv',
        RESTAURANT_POS_FIELD_DICTIONARY: 'field-dictionary-secret',
        RESTAURANT_STAFF_WORKCHAT_WEBHOOK_URL: 'https://staff.example/webhook',
        RESTAURANT_STAFF_RECIPIENT_MAP: 'recipient-map-secret',
        RESTAURANT_STAFF_NOTIFY_APPROVAL: 'approved',
      },
      now: new Date('2026-05-23T00:00:00.000Z'),
    });

    expect(contract.summary.readyTracks).toBe(6);
    expect(contract.summary.missingRequirements).toBe(0);
    expect(contract.blockedCapabilities).toEqual([]);
    expect(contract.tracks.every(track => track.canRunNow)).toBe(true);
    expect(JSON.stringify(contract)).not.toContain('lobu-secret');
    expect(JSON.stringify(contract)).not.toContain('profile-secret');
    expect(JSON.stringify(contract)).not.toContain('field-dictionary-secret');
  });

  it('exposes the setup contract through the runtime API', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({ action: 'runtime-setup-contract' }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.runtimeSetupContract.payloadShape).toBe('restaurant-agent-runtime-setup-contract-v1');
    expect(payload.runtimeSetupContract.summary.tracks).toBe(6);
    expect(payload.runtimeSetupContract.safetyBoundary).toContain('private-message raw text');
  });
});

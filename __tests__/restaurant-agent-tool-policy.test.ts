import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentToolPolicyReport } from '@/lib/restaurant-agent-tool-policy';

const readyEnv = {
  RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL: 'https://openclaw.example/runtime',
  RESTAURANT_AGENT_OPENCLAW_API_KEY: 'openclaw-secret',
  RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'profile-1',
  RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret',
  RESTAURANT_AGENT_OPERATOR_APPROVAL: 'approved',
  RESTAURANT_SOCIAL_AUTH_STATUS: 'authorized',
};

describe('restaurant agent tool policy', () => {
  it('keeps draft and public planning internal while external actions stay blocked without auth', () => {
    const report = buildRestaurantAgentToolPolicyReport({
      env: {},
      now: new Date('2026-05-23T08:00:00.000Z'),
    });

    expect(report.summary).toEqual({
      total: 7,
      internalReady: 2,
      externalReady: 0,
      blocked: 4,
      forbidden: 1,
    });
    expect(report.decisions.find(item => item.action === 'open_public_page')).toEqual(expect.objectContaining({ decision: 'internal-ready' }));
    expect(report.decisions.find(item => item.action === 'prepare_publish_draft')).toEqual(expect.objectContaining({ decision: 'internal-ready' }));
    expect(report.decisions.find(item => item.action === 'submit_platform_publish')).toEqual(expect.objectContaining({ decision: 'blocked' }));
    expect(report.decisions.find(item => item.action === 'pull_pos_redemption')).toEqual(expect.objectContaining({ decision: 'blocked' }));
    expect(report.secretProxy.exposedSecretCount).toBe(0);
    expect(report.secretProxy.slots.every(slot => slot.exposedToClient === false)).toBe(true);
    expect(JSON.stringify(report)).not.toContain('openclaw-secret');
  });

  it('allows public receipt capture through an external browser runtime only when runtime and merchant grant are ready', () => {
    const report = buildRestaurantAgentToolPolicyReport({
      target: 'openclaw',
      browserRuntimeTarget: 'openclaw',
      env: readyEnv,
      now: new Date('2026-05-23T08:00:00.000Z'),
    });

    expect(report.summary.externalReady).toBeGreaterThanOrEqual(2);
    expect(report.decisions.find(item => item.action === 'capture_public_receipt')).toEqual(expect.objectContaining({
      decision: 'external-ready',
      canRunExternally: true,
      mappedBrowserTool: 'extract_public_receipt',
    }));
    expect(report.decisions.find(item => item.action === 'summarize_lead_counts')).toEqual(expect.objectContaining({ decision: 'external-ready' }));
    expect(JSON.stringify(report)).not.toContain('openclaw-secret');
    expect(JSON.stringify(report)).not.toContain('callback-secret');
  });

  it('forbids private message raw text even when runtime and merchant authorization are configured', () => {
    const report = buildRestaurantAgentToolPolicyReport({
      env: readyEnv,
      now: new Date('2026-05-23T08:00:00.000Z'),
    });

    expect(report.decisions.find(item => item.action === 'read_private_message')).toEqual(expect.objectContaining({
      decision: 'forbidden',
      canRunInternally: false,
      canRunExternally: false,
      blockedReasons: expect.arrayContaining(['private_message_raw_text_forbidden']),
    }));
  });

  it('exposes the tool policy report through the runtime API', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'tool-policy',
        runtimeTarget: 'openclaw',
        browserRuntimeTarget: 'openclaw',
        restaurant: 'North City Noodles',
        offer: 'Dinner set',
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.toolPolicy.ok).toBe(true);
    expect(payload.toolPolicy.target).toBe('openclaw');
    expect(payload.toolPolicy.decisions.map((item: { action: string }) => item.action)).toContain('read_private_message');
    expect(payload.toolPolicy.secretProxy.exposedSecretCount).toBe(0);
  });
});

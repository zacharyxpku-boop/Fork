import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantBrowserRunnerCallbackContract } from '@/lib/restaurant-agent-browser-runner-contract';

describe('restaurant browser runner callback contract', () => {
  it('builds a final-receipt callback contract from the browser runbook without secrets', () => {
    const contract = buildRestaurantBrowserRunnerCallbackContract({
      runtimeTarget: 'openclaw',
      eventId: 'restaurant-agent-runner',
      restaurant: 'South City Bistro',
      offer: 'Dinner set',
      targetUrl: 'https://www.dianping.com/shop/example',
      env: {},
    });

    expect(contract.payloadShape).toBe('restaurant-browser-runner-callback-contract-v1');
    expect(contract.runbook.payloadShape).toBe('restaurant-browser-runbook-v1');
    expect(contract.canAcceptSignedFinalReceipt).toBe(false);
    expect(contract.eventRules.map(rule => rule.type)).toEqual([
      'run-started',
      'step-completed',
      'step-blocked',
      'run-failed',
      'run-completed',
    ]);
    expect(contract.stepRules).toHaveLength(7);
    expect(contract.stepRules.find(rule => rule.type === 'capture')).toEqual(expect.objectContaining({
      retryable: true,
      maxAttempts: 2,
    }));
    expect(contract.externalSetupRequired).toEqual(expect.arrayContaining([
      'openclaw runtime URL',
      'openclaw runtime API key',
      'isolated browser profile',
      'signed callback secret',
      'merchant grant and approved target URL',
    ]));
    expect(contract.audit.fakeExecutionIncluded).toBe(false);
    expect(JSON.stringify(contract)).not.toContain('secret-api-key');
    expect(JSON.stringify(contract)).not.toContain('private message raw');
  });

  it('unlocks signed final receipt only when callback secret and runner setup are configured', () => {
    const contract = buildRestaurantBrowserRunnerCallbackContract({
      runtimeTarget: 'hermes',
      env: {
        RESTAURANT_AGENT_HERMES_RUNTIME_URL: 'https://hermes.example/runtime',
        RESTAURANT_AGENT_HERMES_API_KEY: 'secret-api-key',
        RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'profile-1',
        RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret',
      },
    });

    expect(contract.canAcceptSignedFinalReceipt).toBe(true);
    expect(contract.runbook.canExecuteNow).toBe(true);
    expect(contract.eventRules.find(rule => rule.type === 'run-completed')).toEqual(expect.objectContaining({
      writesTo: 'signed-receipt',
      requiredFields: ['eventId', 'channel', 'externalRunId or screenshotId or evidenceUrl', 'summary'],
    }));
    expect(contract.externalSetupRequired).toEqual(['merchant grant and approved target URL']);
    const serialized = JSON.stringify(contract);
    expect(serialized).not.toContain('secret-api-key');
    expect(serialized).not.toContain('callback-secret');
    expect(serialized).not.toContain('profile-1');
  });

  it('exposes the contract through runtime API', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'browser-runner-contract',
        runtimeTarget: 'openclaw',
        eventId: 'restaurant-agent-runner',
        restaurant: 'North City Noodles',
        offer: 'Tomato beef noodle set',
        targetUrl: 'https://www.dianping.com/shop/example',
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.browserRunnerContract.payloadShape).toBe('restaurant-browser-runner-callback-contract-v1');
    expect(payload.browserRunnerContract.stepEventEndpoint.action).toBe('external-receipt');
    expect(payload.browserRunnerContract.runbook.audit.privateDataIncluded).toBe(false);
  });
});

import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentExecutionPackage } from '@/lib/restaurant-agent-execution-package';

describe('restaurant agent external execution package', () => {
  it('combines dispatch browser session grant manifest and callback contract without secrets', () => {
    const pack = buildRestaurantAgentExecutionPackage({
      target: 'openclaw',
      restaurant: '南城川味小馆',
      offer: '双人酸菜鱼套餐',
      owner: '运营负责人',
      env: {},
      now: new Date('2026-05-23T00:00:00.000Z'),
    });

    expect(pack.payloadShape).toBe('restaurant-agent-external-execution-v1');
    expect(pack.canForward).toBe(false);
    expect(pack.status).toBe('blocked');
    expect(pack.dispatch.workerPayload.restaurant).toBe('南城川味小馆');
    expect(pack.browserSession.callbackContract.action).toBe('external-receipt');
    expect(pack.grantManifest.merchant.grantStatus).toBe('blocked');
    expect(pack.runtimeContract).toEqual(expect.objectContaining({
      endpointKind: 'openclaw-tasks',
      callbackHeader: 'x-restaurant-agent-signature',
    }));
    expect(pack.executionPolicy.blockedRuntimeActions).toEqual(expect.arrayContaining([
      'read_private_message',
      'submit_platform_publish',
      'pull_pos_redemption',
    ]));
    expect(pack.audit).toEqual(expect.objectContaining({
      secretsIncluded: false,
      privateDataIncluded: false,
      browserProfileExposed: false,
      packageSafeToSend: true,
    }));
    expect(JSON.stringify(pack)).not.toContain('secret-api-key');
    expect(JSON.stringify(pack)).not.toContain('profile-1');
  });

  it('is ready to forward only when runtime browser callback merchant auth and requested action are allowed', () => {
    const pack = buildRestaurantAgentExecutionPackage({
      target: 'hermes',
      requestedAction: 'capture_public_receipt',
      expiresAt: '2026-06-23T00:00:00.000Z',
      env: {
        RESTAURANT_AGENT_HERMES_RUNTIME_URL: 'https://hermes.example/runs',
        RESTAURANT_AGENT_HERMES_API_KEY: 'secret-api-key',
        RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'profile-1',
        RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret',
        RESTAURANT_AGENT_OPERATOR_APPROVAL: 'approved',
        RESTAURANT_DIANPING_AUTH_STATUS: 'authorized',
      },
      now: new Date('2026-05-23T00:00:00.000Z'),
    });

    expect(pack.status).toBe('ready-to-forward');
    expect(pack.canForward).toBe(true);
    expect(pack.runtimeContract.endpointKind).toBe('hermes-runs');
    expect(pack.executionPolicy.allowedRuntimeActions).toEqual(expect.arrayContaining([
      'browser_open',
      'browser_screenshot',
      'capture_public_receipt',
      'extract_public_receipt',
    ]));
    expect(pack.executionPolicy.blockedRuntimeActions).toEqual(expect.arrayContaining([
      'read_private_message',
      'submit_platform_publish',
    ]));
    expect(JSON.stringify(pack)).not.toContain('secret-api-key');
    expect(JSON.stringify(pack)).not.toContain('callback-secret');
    expect(JSON.stringify(pack)).not.toContain('profile-1');
  });

  it('keeps platform publish blocked even when runtime and browser proof capture are ready', () => {
    const pack = buildRestaurantAgentExecutionPackage({
      target: 'openclaw',
      requestedAction: 'submit_platform_publish',
      expiresAt: '2026-06-23T00:00:00.000Z',
      env: {
        RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL: 'https://openclaw.example/tasks',
        RESTAURANT_AGENT_OPENCLAW_API_KEY: 'secret-api-key',
        RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'profile-1',
        RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret',
        RESTAURANT_AGENT_OPERATOR_APPROVAL: 'approved',
        RESTAURANT_SOCIAL_AUTH_STATUS: 'authorized',
      },
      now: new Date('2026-05-23T00:00:00.000Z'),
    });

    expect(pack.canForward).toBe(false);
    expect(pack.status).toBe('handoff-only');
    expect(pack.blockedReasons.join(' ')).toContain('submit_platform_publish');
    expect(pack.browserSession.toolPolicy.find(tool => tool.name === 'submit_platform_publish')).toEqual(expect.objectContaining({ allowed: false }));
  });

  it('exposes execution package through runtime API', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'execution-package',
        runtimeTarget: 'lobu',
        restaurant: '北城面馆',
        offer: '番茄牛腩面套餐',
        requestedAction: 'capture_public_receipt',
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.executionPackage.target).toBe('lobu');
    expect(payload.executionPackage.runtimeContract.endpointKind).toBe('lobu-events');
    expect(payload.executionPackage.dispatch.workerPayload.offer).toBe('番茄牛腩面套餐');
  });
});

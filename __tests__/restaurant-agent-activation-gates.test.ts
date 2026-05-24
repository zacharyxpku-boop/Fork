import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantActivationGates } from '@/lib/restaurant-agent-activation-gates';

describe('restaurant agent activation gates', () => {
  it('answers what the product can do internally when external automation is blocked', () => {
    const report = buildRestaurantActivationGates({
      restaurant: '试用门店',
      operator: '运营负责人',
      env: {},
      now: new Date('2026-05-23T00:00:00.000Z'),
    });

    expect(report.payloadShape).toBe('restaurant-agent-activation-gates-v1');
    expect(report.summary.ready).toBe(0);
    expect(report.summary.blocked).toBe(4);
    expect(report.summary.forbidden).toBe(1);
    expect(report.gates.find(item => item.id === 'auto-publish')).toEqual(expect.objectContaining({
      status: 'blocked',
      canDoInternallyNow: expect.arrayContaining(['生成平台发布草稿', '校验签名回执']),
    }));
    expect(report.answerToCustomer).toContain('当前能内部跑的是草稿');
    expect(report.audit.fakeResultsIncluded).toBe(false);
  });

  it('marks governable capabilities ready only when the checklist gates are ready', () => {
    const report = buildRestaurantActivationGates({
      restaurant: '北城面馆',
      operator: '运营负责人',
      expiresAt: '2026-06-23T00:00:00.000Z',
      env: {
        RESTAURANT_AGENT_OPERATOR_APPROVAL: 'approved',
        RESTAURANT_AGENT_LOBU_RUNTIME_URL: 'https://runtime.example.com',
        RESTAURANT_AGENT_LOBU_API_KEY: 'secret-runtime-key',
        RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'profile-secret-value',
        RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret-value',
        RESTAURANT_DIANPING_AUTH_STATUS: 'authorized',
        RESTAURANT_SOCIAL_AUTH_STATUS: 'authorized',
        RESTAURANT_POS_DATA_MODE: 'csv',
        RESTAURANT_POS_FIELD_DICTIONARY: 'configured',
        RESTAURANT_REDEMPTION_SOURCE: 'voucher-export',
      },
      now: new Date('2026-05-23T00:00:00.000Z'),
    });

    expect(report.summary.ready).toBe(4);
    expect(report.summary.forbidden).toBe(1);
    expect(report.gates.find(item => item.id === 'auto-publish')?.status).toBe('ready');
    expect(report.gates.find(item => item.id === 'operating-analysis')?.status).toBe('ready');
    const serialized = JSON.stringify(report);
    expect(serialized).not.toContain('secret-runtime-key');
    expect(serialized).not.toContain('profile-secret-value');
    expect(serialized).not.toContain('callback-secret-value');
    expect(serialized).not.toContain('voucher-export');
  });

  it('exposes activation gates through the runtime API', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'activation-gates',
        restaurant: '西湖小馆',
        operator: '门店运营',
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.activationGates.payloadShape).toBe('restaurant-agent-activation-gates-v1');
    expect(payload.activationGates.gates.map((item: { id: string }) => item.id)).toContain('auto-redemption');
    expect(payload.activationGates.audit.privateDataIncluded).toBe(false);
  });
});

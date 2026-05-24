import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantGrantChecklist } from '@/lib/restaurant-agent-grant-checklist';

describe('restaurant agent merchant grant checklist', () => {
  it('shows the missing gates for auto publish receipt capture POS import and operating analysis', () => {
    const checklist = buildRestaurantGrantChecklist({
      restaurant: '南城川味小馆',
      operator: '店长',
      env: {},
      now: new Date('2026-05-23T00:00:00.000Z'),
    });

    expect(checklist.payloadShape).toBe('restaurant-agent-grant-checklist-v1');
    expect(checklist.merchant.grantStatus).toBe('blocked');
    expect(checklist.summary.canEnableAutoPublish).toBe(false);
    expect(checklist.summary.canEnableReceiptCapture).toBe(false);
    expect(checklist.summary.canEnablePosImport).toBe(false);
    expect(checklist.summary.canEnableOperatingAnalysis).toBe(false);
    expect(checklist.summary.forbidden).toBe(1);
    expect(checklist.blockedCapabilities.map(item => item.capability)).toEqual([
      'auto-publish',
      'receipt-capture',
      'pos-import',
      'operating-analysis',
      'private-message-reading',
    ]);
    expect(JSON.stringify(checklist)).not.toContain('token=');
    expect(JSON.stringify(checklist)).not.toContain('cookie=');
  });

  it('unlocks governable external execution only when runtime browser callback platform and POS gates are ready', () => {
    const checklist = buildRestaurantGrantChecklist({
      restaurant: '北城面馆',
      operator: '运营负责人',
      expiresAt: '2026-06-23T00:00:00.000Z',
      env: {
        RESTAURANT_AGENT_OPERATOR_APPROVAL: 'approved',
        RESTAURANT_AGENT_RUNTIME_URL: 'https://runtime.example.com',
        RESTAURANT_AGENT_RUNTIME_KEY: 'secret-runtime-key',
        RESTAURANT_BROWSER_PROFILE_ID: 'profile-secret-value',
        RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret-value',
        RESTAURANT_DIANPING_AUTH_STATUS: 'authorized',
        RESTAURANT_SOCIAL_AUTH_STATUS: 'authorized',
        RESTAURANT_POS_DATA_MODE: 'csv',
        RESTAURANT_POS_FIELD_DICTIONARY: 'configured',
        RESTAURANT_REDEMPTION_SOURCE: 'voucher-export',
      },
      now: new Date('2026-05-23T00:00:00.000Z'),
    });

    expect(checklist.merchant.grantStatus).toBe('active');
    expect(checklist.summary.canEnableAutoPublish).toBe(true);
    expect(checklist.summary.canEnableReceiptCapture).toBe(true);
    expect(checklist.summary.canEnablePosImport).toBe(true);
    expect(checklist.summary.canEnableOperatingAnalysis).toBe(true);
    expect(checklist.blockedCapabilities.map(item => item.capability)).toEqual(['private-message-reading']);
    expect(checklist.audit).toEqual(expect.objectContaining({
      secretsIncluded: false,
      privateDataIncluded: false,
      rawPosRowsIncluded: false,
    }));
    const serialized = JSON.stringify(checklist);
    expect(serialized).not.toContain('secret-runtime-key');
    expect(serialized).not.toContain('profile-secret-value');
    expect(serialized).not.toContain('callback-secret-value');
    expect(serialized).not.toContain('voucher-export');
  });

  it('blocks external execution when a grant is expired or revoked', () => {
    const expired = buildRestaurantGrantChecklist({
      expiresAt: '2026-05-01T00:00:00.000Z',
      env: {
        RESTAURANT_AGENT_OPERATOR_APPROVAL: 'approved',
        RESTAURANT_AGENT_RUNTIME_URL: 'https://runtime.example.com',
        RESTAURANT_AGENT_RUNTIME_KEY: 'key',
        RESTAURANT_BROWSER_PROFILE_ID: 'profile',
        RESTAURANT_AGENT_CALLBACK_SECRET: 'secret',
        RESTAURANT_SOCIAL_AUTH_STATUS: 'authorized',
      },
      now: new Date('2026-05-23T00:00:00.000Z'),
    });
    const revoked = buildRestaurantGrantChecklist({
      revoked: true,
      env: {
        RESTAURANT_AGENT_OPERATOR_APPROVAL: 'approved',
        RESTAURANT_AGENT_RUNTIME_URL: 'https://runtime.example.com',
        RESTAURANT_AGENT_RUNTIME_KEY: 'key',
        RESTAURANT_BROWSER_PROFILE_ID: 'profile',
        RESTAURANT_AGENT_CALLBACK_SECRET: 'secret',
        RESTAURANT_SOCIAL_AUTH_STATUS: 'authorized',
      },
      now: new Date('2026-05-23T00:00:00.000Z'),
    });

    expect(expired.merchant.grantStatus).toBe('expired');
    expect(revoked.merchant.grantStatus).toBe('revoked');
    expect(expired.summary.canEnableAutoPublish).toBe(false);
    expect(revoked.summary.canEnableReceiptCapture).toBe(false);
    expect(revoked.sections.flatMap(section => section.steps).find(step => step.id === 'grant-revocation-path')).toEqual(expect.objectContaining({
      status: 'blocked',
    }));
  });

  it('exposes the checklist through the runtime API without returning secrets or private data', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'grant-checklist',
        restaurant: '西湖小馆',
        operator: '门店运营',
        revoked: true,
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.grantChecklist.payloadShape).toBe('restaurant-agent-grant-checklist-v1');
    expect(payload.grantChecklist.merchant.restaurant).toBe('西湖小馆');
    expect(payload.grantChecklist.merchant.grantStatus).toBe('revoked');
    expect(payload.grantChecklist.audit.secretsIncluded).toBe(false);
    expect(JSON.stringify(payload)).not.toContain('API_KEY');
    expect(JSON.stringify(payload)).not.toContain('private message raw');
  });
});

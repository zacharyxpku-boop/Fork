import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantMerchantGrantManifest } from '@/lib/restaurant-agent-grant-manifest';

describe('restaurant agent merchant grant manifest', () => {
  it('keeps platform publish POS and private messages blocked without explicit merchant authorization', () => {
    const manifest = buildRestaurantMerchantGrantManifest({
      restaurant: '南城川味小馆',
      operator: '店长',
      env: {},
      now: new Date('2026-05-23T00:00:00.000Z'),
    });

    expect(manifest.merchant.grantStatus).toBe('blocked');
    expect(manifest.actionPolicy.find(action => action.action === 'prepare_publish_draft')).toEqual(expect.objectContaining({ allowed: true }));
    expect(manifest.actionPolicy.find(action => action.action === 'submit_platform_publish')).toEqual(expect.objectContaining({ allowed: false }));
    expect(manifest.actionPolicy.find(action => action.action === 'pull_pos_redemption')).toEqual(expect.objectContaining({ allowed: false }));
    expect(manifest.actionPolicy.find(action => action.action === 'read_private_message')).toEqual(expect.objectContaining({ allowed: false }));
    expect(manifest.audit).toEqual(expect.objectContaining({
      secretsIncluded: false,
      privateDataIncluded: false,
      tokenFieldsReturned: [],
    }));
    expect(manifest.privacyBoundary.join(' ')).toContain('cookie');
    expect(JSON.stringify(manifest)).not.toContain('token=');
    expect(manifest.privacyBoundary.join(' ')).toContain('不读取或保存私信原文');
  });

  it('allows publish and POS only when grants env auth approval and data contracts are ready', () => {
    const manifest = buildRestaurantMerchantGrantManifest({
      restaurant: '北城面馆',
      operator: '运营负责人',
      expiresAt: '2026-06-23T00:00:00.000Z',
      env: {
        RESTAURANT_AGENT_OPERATOR_APPROVAL: 'approved',
        RESTAURANT_DIANPING_AUTH_STATUS: 'authorized',
        RESTAURANT_SOCIAL_AUTH_STATUS: 'authorized',
        RESTAURANT_POS_DATA_MODE: 'csv',
        RESTAURANT_POS_FIELD_DICTIONARY: 'configured',
        RESTAURANT_REDEMPTION_SOURCE: 'voucher-export',
      },
      now: new Date('2026-05-23T00:00:00.000Z'),
    });

    expect(manifest.merchant.grantStatus).toBe('active');
    expect(manifest.channels.find(channel => channel.channel === 'douyin')?.authorized).toBe(true);
    expect(manifest.channels.find(channel => channel.channel === 'pos-redemption')?.authorized).toBe(true);
    expect(manifest.actionPolicy.find(action => action.action === 'submit_platform_publish')).toEqual(expect.objectContaining({ allowed: true }));
    expect(manifest.actionPolicy.find(action => action.action === 'pull_pos_redemption')).toEqual(expect.objectContaining({ allowed: true }));
    expect(manifest.actionPolicy.find(action => action.action === 'read_private_message')).toEqual(expect.objectContaining({ allowed: false }));
    expect(JSON.stringify(manifest)).not.toContain('voucher-export');
  });

  it('blocks every external action when the grant is expired or revoked', () => {
    const expired = buildRestaurantMerchantGrantManifest({
      expiresAt: '2026-05-01T00:00:00.000Z',
      env: {
        RESTAURANT_AGENT_OPERATOR_APPROVAL: 'approved',
        RESTAURANT_SOCIAL_AUTH_STATUS: 'authorized',
        RESTAURANT_POS_DATA_MODE: 'api',
        RESTAURANT_POS_FIELD_DICTIONARY: 'configured',
        RESTAURANT_REDEMPTION_SOURCE: 'pos-api',
      },
      now: new Date('2026-05-23T00:00:00.000Z'),
    });
    const revoked = buildRestaurantMerchantGrantManifest({
      revoked: true,
      env: {
        RESTAURANT_AGENT_OPERATOR_APPROVAL: 'approved',
        RESTAURANT_SOCIAL_AUTH_STATUS: 'authorized',
      },
      now: new Date('2026-05-23T00:00:00.000Z'),
    });

    expect(expired.merchant.grantStatus).toBe('expired');
    expect(revoked.merchant.grantStatus).toBe('revoked');
    for (const manifest of [expired, revoked]) {
      expect(manifest.actionPolicy.find(action => action.action === 'capture_public_receipt')).toEqual(expect.objectContaining({ allowed: false }));
      expect(manifest.actionPolicy.find(action => action.action === 'submit_platform_publish')).toEqual(expect.objectContaining({ allowed: false }));
      expect(manifest.actionPolicy.find(action => action.action === 'pull_pos_redemption')).toEqual(expect.objectContaining({ allowed: false }));
    }
  });

  it('exposes grant manifest through the runtime API without returning secrets or private data', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'grant-manifest',
        restaurant: '西湖小馆',
        operator: '门店运营',
        revoked: true,
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.grantManifest.merchant.restaurant).toBe('西湖小馆');
    expect(payload.grantManifest.merchant.grantStatus).toBe('revoked');
    expect(payload.grantManifest.audit.secretsIncluded).toBe(false);
    expect(JSON.stringify(payload)).not.toContain('API_KEY');
    expect(JSON.stringify(payload)).not.toContain('private message');
  });
});

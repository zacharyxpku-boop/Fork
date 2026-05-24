import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantPlatformConnectorMatrix } from '@/lib/restaurant-platform-connector-matrix';

describe('restaurant platform connector matrix', () => {
  it('maps restaurant platform capabilities to internal actions provider gates and evidence', () => {
    const matrix = buildRestaurantPlatformConnectorMatrix({
      env: {
        RESTAURANT_AGENT_CALLBACK_SECRET: 'callback-secret-value',
        RESTAURANT_AGENT_BROWSER_PROFILE_ID: 'browser-profile-secret',
        RESTAURANT_POS_DATA_MODE: 'csv',
      },
      now: new Date('2026-05-24T12:00:00.000Z'),
    });

    expect(matrix.payloadShape).toBe('restaurant-platform-connector-matrix-v1');
    expect(matrix.connectors.map(item => item.id)).toEqual(expect.arrayContaining([
      'dianping-meituan',
      'xiaohongshu',
      'douyin',
      'wechat-community',
      'pos-redemption',
      'agent-runtime-provider',
    ]));
    expect(matrix.capabilityCoverage.map(item => item.capability)).toContain('auto-publish');
    expect(matrix.envChecklist.map(item => item.key)).toContain('RESTAURANT_AGENT_CALLBACK_SECRET');
    expect(matrix.pilotOrder.join('\n')).toContain('browser runtime');
    expect(JSON.stringify(matrix)).not.toContain('callback-secret-value');
    expect(JSON.stringify(matrix)).not.toContain('browser-profile-secret');
  });

  it('exposes platform connector matrix through the runtime API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'platform-connector-matrix' }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.platformConnectorMatrix.payloadShape).toBe('restaurant-platform-connector-matrix-v1');
    expect(payload.platformConnectorMatrix.safetyBoundary).toContain('does not log in');
  });
});

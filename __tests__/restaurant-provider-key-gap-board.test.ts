import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantProviderKeyGapBoard } from '@/lib/restaurant-provider-key-gap-board';

describe('restaurant provider key gap board', () => {
  it('maps competitor-grade abilities to internal work and external provider requirements', () => {
    const board = buildRestaurantProviderKeyGapBoard({
      restaurant: 'Gap Bistro',
      offer: 'Dinner set',
      env: {},
      now: new Date('2026-05-26T18:00:00.000Z'),
    });
    const serialized = JSON.stringify(board);

    expect(board.payloadShape).toBe('restaurant-provider-key-gap-board-v1');
    expect(board.summary.capabilities).toBe(7);
    expect(board.summary.canClaimCompetitorParity).toBe(false);
    expect(board.rows.map(row => row.id)).toEqual([
      'persistent-browser-runner',
      'auto-publish',
      'auto-lead-acquisition',
      'auto-coupon-redemption',
      'true-operating-analysis',
      'memory-followup',
      'staff-delivery',
    ]);
    expect(board.providerKeyPacket.some(item => item.key === 'RESTAURANT_AGENT_OPENCLAW_API_KEY')).toBe(true);
    expect(board.rows.find(row => row.id === 'true-operating-analysis')?.status).toBe('data-gated');
    expect(board.safetyBoundary).toContain('never asks users to paste secrets');
    expect(serialized).not.toContain('sk-live');
    expect(serialized).not.toContain('cookie-value');
  });

  it('is exposed through the runtime API and keeps snapshots aligned', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'provider-key-gap-board',
        restaurant: 'API Gap Bistro',
        offer: 'Late dinner',
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.providerKeyGapBoard.payloadShape).toBe('restaurant-provider-key-gap-board-v1');
    expect(payload.providerKeyGapBoard.snapshots.connectorMatrix.payloadShape).toBe('restaurant-platform-connector-matrix-v1');
    expect(payload.providerKeyGapBoard.snapshots.externalUnlockRequestPack.payloadShape).toBe('restaurant-external-unlock-request-pack-v1');
    expect(payload.providerKeyGapBoard.snapshots.providerSetupWizard.payloadShape).toBe('restaurant-provider-setup-wizard-v1');
    expect(payload.providerKeyGapBoard.summary.canClaimCompetitorParity).toBe(false);
  });

  it('is included in the Claw-style default path so the trial shows what external setup is still missing', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'claw-experience-default-path',
        restaurant: 'Default Gap Bistro',
        offer: 'Weekend set',
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.providerKeyGapBoard.payloadShape).toBe('restaurant-provider-key-gap-board-v1');
    expect(payload.providerKeyGapBoard.rows.some((row: { id: string }) => row.id === 'persistent-browser-runner')).toBe(true);
    expect(payload.providerKeyGapBoard.summary.canClaimCompetitorParity).toBe(false);
  });
});

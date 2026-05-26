import { describe, expect, it } from 'vitest';

import { buildRestaurantExternalAccessGuide } from '@/lib/restaurant-external-access-guide';
import { buildRestaurantProviderKeyGapBoard } from '@/lib/restaurant-provider-key-gap-board';
import { buildRestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import { buildRestaurantProviderSetupStateSummary } from '@/lib/restaurant-provider-setup-state-store';
import { buildRestaurantProviderSetupWizard } from '@/lib/restaurant-provider-setup-wizard';
import { buildRestaurantProviderUnlockLadder } from '@/lib/restaurant-provider-unlock-ladder';
import { buildRestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';

describe('restaurant external access guide', () => {
  it('turns Provider setup into customer-owned unlock steps without exposing secrets', async () => {
    const now = new Date('2026-05-26T10:00:00.000Z');
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
      runtimeProbe: await buildRestaurantRuntimeProbe({ now }),
    });
    const providerSetupWizard = buildRestaurantProviderSetupWizard({
      restaurant: 'Access Bistro',
      offer: 'Dinner coupon',
      provided: providerSetupState.provided,
      now,
    });
    const guide = buildRestaurantExternalAccessGuide({
      restaurant: 'Access Bistro',
      offer: 'Dinner coupon',
      providerSetupWizard,
      providerUnlockLadder: buildRestaurantProviderUnlockLadder({
        setupState: providerSetupState,
        health: providerReadinessHealth,
      }),
      providerKeyGapBoard: buildRestaurantProviderKeyGapBoard({
        restaurant: 'Access Bistro',
        offer: 'Dinner coupon',
        env: {},
        now,
      }),
      now,
    });

    expect(guide.payloadShape).toBe('restaurant-external-access-guide-v1');
    expect(guide.summary.steps).toBe(5);
    expect(guide.summary.canClaimExternalAutomation).toBe(false);
    expect(guide.steps.map(step => step.id)).toEqual([
      'runtime',
      'merchant-grants',
      'callback-proof',
      'operating-data',
      'staff-channel',
    ]);
    expect(guide.steps.map(step => step.status)).toContain('provider-gated');
    expect(guide.steps.map(step => step.status)).toContain('data-gated');
    expect(guide.ownerPacket.map(packet => packet.owner)).toContain('merchant');
    expect(guide.customerScript.join(' ')).toContain('sandbox receipt');
    expect(guide.redactedFields).toContain('raw POS rows');
    expect(JSON.stringify(guide)).not.toContain('secret-value');
  });
});

import { describe, expect, it } from 'vitest';

import { buildRestaurantClawExperienceDefaultPath } from '@/lib/restaurant-claw-experience-default-path';
import { buildRestaurantDefaultPathForwardableBrief } from '@/lib/restaurant-default-path-forwardable-brief';
import { buildRestaurantProviderKeyGapBoard } from '@/lib/restaurant-provider-key-gap-board';

describe('restaurant default path forwardable brief', () => {
  it('turns the default path into a customer-forwardable operating brief without automation claims', async () => {
    const defaultPath = await buildRestaurantClawExperienceDefaultPath({
      restaurant: 'Forwardable Bistro',
      offer: 'Dinner set',
      audience: 'nearby dinner guests',
      now: new Date('2026-05-25T18:00:00.000Z'),
    });
    const brief = buildRestaurantDefaultPathForwardableBrief({
      restaurant: 'Forwardable Bistro',
      offer: 'Dinner set',
      defaultPath,
      providerKeyGapBoard: buildRestaurantProviderKeyGapBoard({
        restaurant: 'Forwardable Bistro',
        offer: 'Dinner set',
        env: {},
        now: new Date('2026-05-25T18:00:00.000Z'),
      }),
      now: new Date('2026-05-25T18:00:00.000Z'),
    });

    expect(brief.payloadShape).toBe('restaurant-default-path-forwardable-brief-v1');
    expect(brief.summary.canForwardToStoreManager).toBe(true);
    expect(brief.summary.canClaimExternalAutomation).toBe(false);
    expect(brief.summary.canClaimTrueOperatingAnalysis).toBe(false);
    expect(brief.todayOperatingOrder.map(item => item.id)).toEqual([
      'confirm-offer',
      'run-internal-pack',
      'store-manager-followup',
      'provider-unlock',
      'data-contract',
      'claim-boundary',
    ]);
    expect(brief.todayOperatingOrder.map(item => item.status)).toContain('needs-provider');
    expect(brief.externalRequired.join(' ')).toContain('OPENCLAW');
    expect(brief.shareText).toContain('Forwardable Bistro / Dinner set');
    expect(brief.stopLines.join(' ')).toContain('No Provider key');
    expect(brief.redactedFields).toContain('raw POS rows');
  });
});

import { describe, expect, it } from 'vitest';

import { buildRestaurantAgentCommandCenter } from '@/lib/restaurant-agent-command-center';
import { buildRestaurantClawCloudOperatorHome } from '@/lib/restaurant-claw-cloud-operator-home';
import { buildRestaurantClawExperienceDefaultPath } from '@/lib/restaurant-claw-experience-default-path';
import { buildRestaurantDefaultPathForwardableBrief } from '@/lib/restaurant-default-path-forwardable-brief';
import { buildRestaurantProviderKeyGapBoard } from '@/lib/restaurant-provider-key-gap-board';

describe('restaurant claw cloud operator home', () => {
  it('turns command-center complexity into an AI employee home without external automation claims', async () => {
    const now = new Date('2026-05-25T19:00:00.000Z');
    const commandCenter = await buildRestaurantAgentCommandCenter({
      restaurant: 'Cloud Home Bistro',
      offer: 'Late dinner set',
      now,
    });
    const defaultPath = await buildRestaurantClawExperienceDefaultPath({
      restaurant: 'Cloud Home Bistro',
      offer: 'Late dinner set',
      now,
    });
    const forwardableBrief = buildRestaurantDefaultPathForwardableBrief({
      restaurant: 'Cloud Home Bistro',
      offer: 'Late dinner set',
      defaultPath,
      now,
    });
    const home = buildRestaurantClawCloudOperatorHome({
      restaurant: 'Cloud Home Bistro',
      offer: 'Late dinner set',
      commandCenter,
      forwardableBrief,
      providerKeyGapBoard: buildRestaurantProviderKeyGapBoard({
        restaurant: 'Cloud Home Bistro',
        offer: 'Late dinner set',
        env: {},
        now,
      }),
      now,
    });

    expect(home.payloadShape).toBe('restaurant-claw-cloud-operator-home-v1');
    expect(home.positioning).toBe('claw-cloud-style-ai-employee-home');
    expect(home.summary.canUseAsAiEmployeeToday).toBe(true);
    expect(home.summary.canClaimExternalAutomation).toBe(false);
    expect(home.lanes.map(lane => lane.id)).toEqual([
      'ask-ai-employee',
      'run-shift',
      'publish-and-proof',
      'leads-and-redemption',
      'provider-unlock',
    ]);
    expect(home.lanes.map(lane => lane.status)).toContain('provider-gated');
    expect(home.providerQueue.join(' ')).toContain('callback');
    expect(home.redactedFields).toContain('raw POS rows');
    expect(home.safetyBoundary).toContain('does not log in');
  });
});

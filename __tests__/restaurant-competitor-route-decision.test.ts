import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantCompetitorRouteDecision } from '@/lib/restaurant-competitor-route-decision';

describe('restaurant competitor route decision', () => {
  it('chooses a platform spine with Claw experience and explicit runtime/data contracts', async () => {
    const decision = await buildRestaurantCompetitorRouteDecision({
      restaurant: 'Route Bistro',
      offer: 'Dinner set',
      now: new Date('2026-05-25T16:30:00.000Z'),
    });

    expect(decision.payloadShape).toBe('restaurant-competitor-route-decision-v1');
    expect(decision.finalTarget).toBe('platform-spine-plus-claw-experience-plus-restaurant-data-contracts');
    expect(decision.summary.options).toBe(4);
    expect(decision.summary.internalCanShipNow).toBeGreaterThan(8);
    expect(decision.summary.trainingItems).toBeGreaterThan(0);
    expect(decision.summary.externalRequired).toBeGreaterThan(0);
    expect(decision.summary.canClaimFullCompetitorParity).toBe(false);
    expect(decision.referenceModels.map(model => model.id)).toEqual([
      'kuaizi-platform',
      'shaozi-claw-cloud',
      'lobu-browser-agent',
    ]);
    expect(decision.finalShape.productBase).toBe('kuaizi-style-platform-spine');
    expect(decision.finalShape.operatorLayer).toBe('shaozi-claw-cloud-style-ai-employee-workbench');
    expect(decision.finalShape.runtimeLayer).toBe('lobu-openclaw-hermes-browser-agent');
    expect(decision.finalShape.reason).toContain('纯龙虾更 fancy 但不够产品化');
    expect(decision.finalShape.firstScreenRule).toContain('填什么');
    expect(decision.referenceModels.find(model => model.id === 'shaozi-claw-cloud')?.uiUxToReplicate).toContain('单击默认路径');
    expect(decision.options.map(option => option.id)).toEqual([
      'platform-spine',
      'claw-experience',
      'lobu-runtime',
      'restaurant-data',
    ]);
    expect(decision.options.find(option => option.id === 'platform-spine')?.verdict).toBe('adopt-as-spine');
    expect(decision.options.find(option => option.id === 'restaurant-data')?.verdict).toBe('must-have-contract');
    expect(decision.providerKeyChecklist).toContain('RESTAURANT_AGENT_CALLBACK_SECRET');
    expect(decision.merchantInputsNeeded).toContain('sanitized POS/coupon/member sample');
    expect(decision.safetyBoundary).toContain('does not claim full');
  });

  it('exposes the route decision through the runtime API without leaking provider values', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'competitor-route-decision',
        restaurant: 'API Route Bistro',
        offer: 'Late dinner set',
      }),
    }));
    const payload = await response.json();
    const serialized = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(payload.competitorRouteDecision.payloadShape).toBe('restaurant-competitor-route-decision-v1');
    expect(payload.competitorRouteDecision.summary.canClaimFullCompetitorParity).toBe(false);
    expect(payload.competitorRouteDecision.options.find((item: { id: string }) => item.id === 'claw-experience')).toBeTruthy();
    expect(payload.competitorRouteDecision.referenceModels.find((item: { id: string }) => item.id === 'lobu-browser-agent').recommendedUse).toBe('runtime-tool');
    expect(payload.competitorRouteDecision.finalShape.productBase).toBe('kuaizi-style-platform-spine');
    expect(serialized).not.toContain('secret-value');
    expect(serialized).not.toContain('cookie');
    expect(serialized).not.toContain('token');
  });
});

import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';

describe('restaurant runner mission timeline', () => {
  it('exposes a Claw-style execution timeline without claiming real automation', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claw-experience-default-path',
        restaurant: 'Timeline Bistro',
        offer: 'Dinner proof run',
      }),
    }));
    const payload = await response.json();
    const timeline = payload.runnerMissionTimeline;
    const serialized = JSON.stringify(timeline);

    expect(response.status).toBe(200);
    expect(timeline.payloadShape).toBe('restaurant-runner-mission-timeline-v1');
    expect(timeline.summary.canClaimExternalAutomation).toBe(false);
    expect(timeline.mission.providerTarget).toBe(payload.providerLiveRunGate.selectedRun.providerTarget);
    expect(timeline.mission.packageId).toBe(payload.providerLiveRunGate.selectedRun.packageId);
    expect(timeline.timeline.map((item: { id: string }) => item.id)).toContain('launch-decision');
    expect(timeline.timeline.map((item: { id: string }) => item.id)).toContain('signed-receipt-closeout');
    expect(timeline.externalRequired.length).toBeGreaterThan(0);
    expect(serialized).not.toContain('secret-value');
    expect(serialized).not.toContain('cookie-value');
    expect(serialized).not.toContain('rawPrivateMessage');
  });
});

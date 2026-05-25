import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantBuildQueue } from '@/lib/restaurant-agent-build-queue';

describe('restaurant agent build queue', () => {
  it('turns the competitor audit next build order into an actionable queue', () => {
    const queue = buildRestaurantBuildQueue();

    expect(queue.payloadShape).toBe('restaurant-agent-build-queue-v1');
    expect(queue.summary.total).toBe(7);
    expect(queue.summary.readyToBuild).toBeGreaterThan(0);
    expect(queue.nextInternalSprint).toHaveLength(3);
    expect(queue.items[0]).toEqual(expect.objectContaining({
      status: 'ready-to-build',
      lane: 'internal-build',
    }));
    expect(queue.items[0].acceptanceCriteria.join(' ')).toContain('/factory?variant=friend_trial');
    expect(queue.items.some(item => item.dimensionId === 'cloud-agent-ops')).toBe(true);
    expect(queue.items.find(item => item.dimensionId === 'cloud-agent-ops')?.internalDeliverable).toContain('AI employee console');
    expect(queue.audit.fakeExecutionIncluded).toBe(false);
  });

  it('keeps platform and POS closure as external setup instead of fake internal execution', () => {
    const queue = buildRestaurantBuildQueue();
    const platformData = queue.items.find(item => item.dimensionId === 'restaurant-platform-data');

    expect(platformData).toEqual(expect.objectContaining({
      lane: 'external-setup',
      status: 'waiting-external',
      owner: 'merchant',
    }));
    expect(platformData?.externalRequired.join(' ')).toContain('Merchant account authorization');
    expect(platformData?.externalRequired).toContain('platform API/export');
    expect(platformData?.externalRequired.length).toBeGreaterThan(3);
    expect(platformData?.blockedBy.length).toBeGreaterThan(0);
    expect(queue.externalSetupRequests[0].dimensionId).toBe('restaurant-platform-data');
    expect(queue.safetyBoundary).toContain('do not imply real platform execution');
  });

  it('exposes the build queue through the runtime API without leaking secrets or private data', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({ action: 'build-queue' }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.buildQueue.payloadShape).toBe('restaurant-agent-build-queue-v1');
    expect(payload.buildQueue.audit.secretsIncluded).toBe(false);
    expect(JSON.stringify(payload)).not.toContain('secret-value');
    expect(JSON.stringify(payload)).not.toContain('private message raw');
  });
});

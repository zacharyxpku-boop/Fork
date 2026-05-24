import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';

function request(pathname: string) {
  return new NextRequest(`http://localhost${pathname}`);
}

describe('proxy public review portal access', () => {
  it('allows the public status console through the proxy', async () => {
    const response = await proxy(request('/status?variant=friend_trial'));

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('allows public status read-only APIs without opening write surfaces', async () => {
    const readinessResponse = await proxy(request('/api/readiness?projectId=default-project'));
    const actionQueueResponse = await proxy(request('/api/industrial-chain/action-queue?projectId=default-project'));
    const assetPermissionResponse = await proxy(request('/api/asset-permissions?projectId=default-project'));
    const restaurantRuntimeResponse = await proxy(request('/api/restaurant-agent/runtime'));
    const adminReviewLinksResponse = await proxy(request('/api/industrial-chain/review-links'));

    expect(readinessResponse.status).toBe(200);
    expect(actionQueueResponse.status).toBe(200);
    expect(assetPermissionResponse.status).toBe(200);
    expect(restaurantRuntimeResponse.status).toBe(200);
    expect(adminReviewLinksResponse.status).toBe(307);
    expect(adminReviewLinksResponse.headers.get('location')).toBe('http://localhost/login');
  });

  it('allows no-login client review pages through the proxy', async () => {
    const response = await proxy(request('/review/wrv_browser_smoke'));

    expect(response.status).toBe(200);
    expect(response.headers.get('location')).toBeNull();
  });

  it('allows token-scoped review API calls without exposing the review-link admin API', async () => {
    const publicReviewResponse = await proxy(request('/api/industrial-chain/review/wrv_browser_smoke'));
    const publicFeedbackResponse = await proxy(request('/api/industrial-chain/review/wrv_browser_smoke/feedback'));
    const adminReviewLinksResponse = await proxy(request('/api/industrial-chain/review-links'));

    expect(publicReviewResponse.status).toBe(200);
    expect(publicReviewResponse.headers.get('location')).toBeNull();
    expect(publicFeedbackResponse.status).toBe(200);
    expect(publicFeedbackResponse.headers.get('location')).toBeNull();
    expect(adminReviewLinksResponse.status).toBe(307);
    expect(adminReviewLinksResponse.headers.get('location')).toBe('http://localhost/login');
  });
});

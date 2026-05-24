import { describe, expect, it } from 'vitest';
import { GET, POST } from '@/app/api/channel-accounts/route';
import {
  evaluateChannelDispatchReadiness,
  getChannelAccountSnapshot,
  upsertChannelAdCampaign,
  upsertChannelAccount,
} from '@/lib/channel-account-ledger';

describe('channel account ledger', () => {
  it('summarizes account authorization, health, and publishing capacity', async () => {
    const orgId = `channel-ledger-${Date.now()}`;
    const projectId = `matrix-${Date.now()}`;
    await upsertChannelAccount(orgId, {
      projectId,
      platform: 'TikTok Shop',
      handle: '@brand-main',
      authorizationStatus: 'manual_ready',
      healthStatus: 'healthy',
      dailyPublishLimit: 3,
      scheduledCount: 1,
    });
    await upsertChannelAccount(orgId, {
      projectId,
      platform: 'Instagram Reels',
      handle: '@brand-secondary',
      authorizationStatus: 'manual_ready',
      healthStatus: 'rate_limited',
      dailyPublishLimit: 2,
      scheduledCount: 2,
    });
    await upsertChannelAdCampaign(orgId, {
      projectId,
      platform: 'TikTok Shop',
      campaignName: 'Launch conversion boost',
      objective: 'sales',
      status: 'active',
      budgetCents: 50000,
      spendCents: 12000,
      evidenceUrl: 'https://ads.example.test/campaign/launch',
      metrics: { impressions: 12000, clicks: 420 },
    });

    const snapshot = await getChannelAccountSnapshot(orgId, projectId);
    expect(snapshot.accountCount).toBe(2);
    expect(snapshot.connectedAccountCount).toBe(2);
    expect(snapshot.healthyAccountCount).toBe(1);
    expect(snapshot.rateLimitedAccountCount).toBe(1);
    expect(snapshot.availableSlotCount).toBe(0);
    expect(snapshot.adCampaignCount).toBe(1);
    expect(snapshot.activeAdCampaignCount).toBe(1);
    expect(snapshot.adBudgetCents).toBe(50000);
    expect(snapshot.adSpendCents).toBe(12000);
    expect(snapshot.adEvidenceCount).toBe(1);
    expect(snapshot.adMissingLinks).toEqual([]);
    expect(snapshot.missingLinks).toContain('Rate-limited channel accounts (1)');
    expect(snapshot.missingLinks).toContain('No available publishing slots in channel matrix');
  });

  it('serves account import and matrix snapshot through the API', async () => {
    const headers = { 'x-org-id': `channel-api-${Date.now()}` };
    const projectId = 'channel-api-project';
    const postRes = await POST(new Request('http://localhost/api/channel-accounts', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        projectId,
        account: {
          platform: 'TikTok Shop',
          handle: '@operator',
          authorizationStatus: 'manual_ready',
          healthStatus: 'healthy',
          dailyPublishLimit: 4,
          scheduledCount: 1,
        },
        campaign: {
          platform: 'TikTok Shop',
          campaignName: 'Operator paid boost',
          objective: 'sales',
          status: 'ready',
          budgetCents: 25000,
          spendCents: 0,
        },
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const postBody = await postRes.json();
    expect(postRes.status).toBe(201);
    expect(postBody.snapshot.availableSlotCount).toBe(3);
    expect(postBody.snapshot.adCampaignCount).toBe(1);
    expect(postBody.snapshot.readyAdCampaignCount).toBe(1);
    expect(postBody.snapshot.missingLinks).toEqual([]);

    const getRes = await GET(new Request(`http://localhost/api/channel-accounts?projectId=${projectId}`, {
      headers,
    }) as unknown as Parameters<typeof GET>[0]);
    const getBody = await getRes.json();
    expect(getBody.accounts).toHaveLength(1);
    expect(getBody.campaigns).toHaveLength(1);
    expect(getBody.snapshot.healthyAccountCount).toBe(1);
  });

  it('keeps ad campaign readiness explicit instead of pretending ad automation is connected', async () => {
    const orgId = `channel-ad-${Date.now()}`;
    const projectId = `ad-${Date.now()}`;
    await upsertChannelAdCampaign(orgId, {
      projectId,
      platform: 'TikTok Shop',
      campaignName: 'Bad campaign',
      status: 'active',
      budgetCents: 1000,
      spendCents: 1200,
    });

    const snapshot = await getChannelAccountSnapshot(orgId, projectId);
    expect(snapshot.adCampaignCount).toBe(1);
    expect(snapshot.activeAdCampaignCount).toBe(1);
    expect(snapshot.adMissingLinks).toEqual(expect.arrayContaining([
      'Ad campaign missing platform evidence URL',
      'Ad campaign spend exceeds budget',
    ]));
    expect(snapshot.nextActions).toEqual(expect.arrayContaining([
      'Close ad campaign gap: Ad campaign missing platform evidence URL',
      'Close ad campaign gap: Ad campaign spend exceeds budget',
    ]));
  });

  it('evaluates channel dispatch readiness before publish or ad measurement claims', async () => {
    const orgId = `channel-readiness-${Date.now()}`;
    const projectId = `dispatch-readiness-${Date.now()}`;

    const missingAccount = await evaluateChannelDispatchReadiness(orgId, {
      projectId,
      channel: 'TikTok Shop',
    });
    expect(missingAccount.allowed).toBe(false);
    expect(missingAccount.reason).toBe('missing_channel_account');

    const account = await upsertChannelAccount(orgId, {
      projectId,
      platform: 'TikTok Shop',
      handle: '@brand-matrix',
      authorizationStatus: 'manual_ready',
      healthStatus: 'healthy',
      dailyPublishLimit: 1,
      scheduledCount: 1,
    });
    const noSlot = await evaluateChannelDispatchReadiness(orgId, {
      projectId,
      channel: 'TikTok Shop',
    });
    expect(noSlot.allowed).toBe(false);
    expect(noSlot.reason).toBe('no_available_publish_slot');

    await upsertChannelAccount(orgId, {
      id: account.id,
      projectId,
      platform: 'TikTok Shop',
      handle: '@brand-matrix',
      authorizationStatus: 'manual_ready',
      healthStatus: 'healthy',
      dailyPublishLimit: 3,
      scheduledCount: 1,
    });
    const organicReady = await evaluateChannelDispatchReadiness(orgId, {
      projectId,
      channel: 'TikTok Shop',
    });
    expect(organicReady.allowed).toBe(true);
    expect(organicReady.reason).toBe('allowed');

    await upsertChannelAdCampaign(orgId, {
      projectId,
      platform: 'TikTok Shop',
      campaignName: 'Launch boost without evidence',
      accountId: account.id,
      status: 'active',
      budgetCents: 50000,
      spendCents: 8000,
    });
    const missingEvidence = await evaluateChannelDispatchReadiness(orgId, {
      projectId,
      channel: 'TikTok Shop',
      requireAdCampaign: true,
    });
    expect(missingEvidence.allowed).toBe(false);
    expect(missingEvidence.reason).toBe('ad_campaign_missing_evidence');

    await upsertChannelAdCampaign(orgId, {
      projectId,
      platform: 'TikTok Shop',
      campaignName: 'Launch boost with evidence',
      accountId: account.id,
      status: 'active',
      budgetCents: 50000,
      spendCents: 8000,
      evidenceUrl: 'https://ads.example.test/campaign/tiktok-launch',
      metrics: { impressions: 10000, clicks: 300 },
    });
    const paidReady = await evaluateChannelDispatchReadiness(orgId, {
      projectId,
      channel: 'TikTok Shop',
      requireAdCampaign: true,
    });
    expect(paidReady.allowed).toBe(true);
    expect(paidReady.campaign?.evidenceUrl).toContain('ads.example.test');
  });

  it('returns operator-readable validation errors for empty account imports', async () => {
    const res = await POST(new Request('http://localhost/api/channel-accounts', {
      method: 'POST',
      body: JSON.stringify({ projectId: 'missing-account' }),
    }) as unknown as Parameters<typeof POST>[0]);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('channel_account_required');
    expect(body.message).toContain('平台账号');
  });
});

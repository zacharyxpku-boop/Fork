import { describe, expect, it } from 'vitest';
import { GET as GET_CHAIN, POST as POST_CHAIN } from '@/app/api/industrial-chain/route';
import { GET, PATCH, POST } from '@/app/api/industrial-chain/dispatch/route';
import { listAssetPermissionAccessAudits, upsertAssetPermission } from '@/lib/asset-permission-ledger';
import { upsertChannelAccount, upsertChannelAdCampaign } from '@/lib/channel-account-ledger';

describe('industrial dispatch API', () => {
  it('creates, lists, and updates distribution dispatch records', async () => {
    const headers = { 'x-org-id': `dispatch-api-${Date.now()}` };
    const assetRes = await POST_CHAIN(new Request('http://localhost/api/industrial-chain', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'asset',
        asset: { projectId: 'launch-dispatch', type: 'script', title: 'Script', evidence: 'Approved script' },
      }),
    }) as unknown as Parameters<typeof POST_CHAIN>[0]);
    const assetBody = await assetRes.json();
    const planRes = await POST_CHAIN(new Request('http://localhost/api/industrial-chain', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'distribution-plan',
        distributionPlan: {
          projectId: 'launch-dispatch',
          channel: 'Amazon',
          assetIds: [assetBody.asset.id],
          status: 'ready',
        },
      }),
    }) as unknown as Parameters<typeof POST_CHAIN>[0]);
    const planBody = await planRes.json();

    const createRes = await POST(new Request('http://localhost/api/industrial-chain/dispatch', {
      method: 'POST',
      headers,
      body: JSON.stringify({ dispatch: { planId: planBody.distributionPlan.id } }),
    }) as unknown as Parameters<typeof POST>[0]);
    const createBody = await createRes.json();
    expect(createRes.status).toBe(201);
    expect(createBody.dispatch.status).toBe('manual_ready');

    const deniedRes = await PATCH(new Request('http://localhost/api/industrial-chain/dispatch', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        dispatchId: createBody.dispatch.id,
        patch: {
          status: 'published',
          evidenceUrls: ['https://example.test/amazon/listing'],
        },
      }),
    }) as unknown as Parameters<typeof PATCH>[0]);
    const deniedBody = await deniedRes.json();
    expect(deniedRes.status).toBe(403);
    expect(deniedBody.error).toBe('asset_publish_permission_denied');
    expect(deniedBody.message).toContain('缺少资产发布权限');
    expect(deniedBody.access.deniedAssetIds).toEqual([assetBody.asset.id]);
    const deniedAudits = await listAssetPermissionAccessAudits(headers['x-org-id'], 'launch-dispatch', 10);
    expect(deniedAudits[0]).toMatchObject({
      assetId: assetBody.asset.id,
      action: 'publish',
      operation: 'distribution_dispatch_publish',
      allowed: false,
      reason: 'missing_permission_record',
    });

    await upsertAssetPermission(headers['x-org-id'], {
      projectId: 'launch-dispatch',
      assetId: assetBody.asset.id,
      owner: 'ops',
      scope: 'project',
      roles: ['owner', 'distribution'],
      allowedActions: ['view', 'download', 'share', 'publish'],
      auditNote: 'Distribution publish permission granted for launch dispatch.',
      actor: 'ops',
    });

    const channelDeniedRes = await PATCH(new Request('http://localhost/api/industrial-chain/dispatch', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        dispatchId: createBody.dispatch.id,
        patch: {
          status: 'published',
          evidenceUrls: ['https://example.test/amazon/listing'],
        },
      }),
    }) as unknown as Parameters<typeof PATCH>[0]);
    const channelDeniedBody = await channelDeniedRes.json();
    expect(channelDeniedRes.status).toBe(409);
    expect(channelDeniedBody.error).toBe('channel_dispatch_readiness_denied');
    expect(channelDeniedBody.readiness.reason).toBe('missing_channel_account');

    await upsertChannelAccount(headers['x-org-id'], {
      projectId: 'launch-dispatch',
      platform: 'Amazon',
      handle: 'brand-amazon-store',
      authorizationStatus: 'manual_ready',
      healthStatus: 'healthy',
      dailyPublishLimit: 3,
      scheduledCount: 1,
    });

    const patchRes = await PATCH(new Request('http://localhost/api/industrial-chain/dispatch', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        dispatchId: createBody.dispatch.id,
        patch: {
          status: 'published',
          evidenceUrls: ['https://example.test/amazon/listing'],
        },
      }),
    }) as unknown as Parameters<typeof PATCH>[0]);
    const patchBody = await patchRes.json();
    expect(patchBody.dispatch.status).toBe('published');
    expect(patchBody.dispatch.evidenceUrls).toHaveLength(1);
    const publishAudits = await listAssetPermissionAccessAudits(headers['x-org-id'], 'launch-dispatch', 10);
    expect(publishAudits[0]).toMatchObject({
      assetId: assetBody.asset.id,
      action: 'publish',
      operation: 'distribution_dispatch_publish',
      allowed: true,
      reason: 'allowed',
    });

    const listRes = await GET(new Request('http://localhost/api/industrial-chain/dispatch?projectId=launch-dispatch', {
      headers,
    }) as unknown as Parameters<typeof GET>[0]);
    const listBody = await listRes.json();
    expect(listBody.dispatches).toHaveLength(1);

    const otherOrgRes = await GET(new Request('http://localhost/api/industrial-chain/dispatch?projectId=launch-dispatch', {
      headers: { 'x-org-id': `other-${headers['x-org-id']}` },
    }) as unknown as Parameters<typeof GET>[0]);
    const otherOrgBody = await otherOrgRes.json();
    expect(otherOrgBody.dispatches).toHaveLength(0);
  });

  it('blocks measured dispatch claims until the ad campaign has platform evidence and conversion return', async () => {
    const headers = { 'x-org-id': `dispatch-ad-gate-${Date.now()}` };
    const projectId = 'paid-dispatch';
    const assetRes = await POST_CHAIN(new Request('http://localhost/api/industrial-chain', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'asset',
        asset: { projectId, type: 'video', title: 'Paid launch video', evidence: 'Approved paid launch creative' },
      }),
    }) as unknown as Parameters<typeof POST_CHAIN>[0]);
    const assetBody = await assetRes.json();
    const planRes = await POST_CHAIN(new Request('http://localhost/api/industrial-chain', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'distribution-plan',
        distributionPlan: {
          projectId,
          channel: 'TikTok Shop',
          assetIds: [assetBody.asset.id],
          status: 'ready',
        },
      }),
    }) as unknown as Parameters<typeof POST_CHAIN>[0]);
    const planBody = await planRes.json();
    const createRes = await POST(new Request('http://localhost/api/industrial-chain/dispatch', {
      method: 'POST',
      headers,
      body: JSON.stringify({ dispatch: { planId: planBody.distributionPlan.id } }),
    }) as unknown as Parameters<typeof POST>[0]);
    const createBody = await createRes.json();
    await upsertAssetPermission(headers['x-org-id'], {
      projectId,
      assetId: assetBody.asset.id,
      owner: 'ops',
      scope: 'project',
      roles: ['owner', 'distribution'],
      allowedActions: ['view', 'download', 'share', 'publish'],
      actor: 'ops',
    });
    const account = await upsertChannelAccount(headers['x-org-id'], {
      projectId,
      platform: 'TikTok Shop',
      handle: '@paid-brand',
      authorizationStatus: 'manual_ready',
      healthStatus: 'healthy',
      dailyPublishLimit: 5,
      scheduledCount: 1,
    });
    await upsertChannelAdCampaign(headers['x-org-id'], {
      projectId,
      platform: 'TikTok Shop',
      campaignName: 'Paid launch boost',
      accountId: account.id,
      dispatchId: createBody.dispatch.id,
      status: 'completed',
      budgetCents: 80000,
      spendCents: 40000,
      evidenceUrl: 'https://ads.example.test/tiktok/paid-launch',
      metrics: { impressions: 50000, clicks: 1800 },
    });

    const deniedRes = await PATCH(new Request('http://localhost/api/industrial-chain/dispatch', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        dispatchId: createBody.dispatch.id,
        patch: {
          status: 'measured',
          evidenceUrls: ['https://example.test/tiktok/video'],
          resultUrls: ['https://ads.example.test/tiktok/paid-launch'],
        },
      }),
    }) as unknown as Parameters<typeof PATCH>[0]);
    const deniedBody = await deniedRes.json();
    expect(deniedRes.status).toBe(409);
    expect(deniedBody.readiness.reason).toBe('ad_campaign_missing_measurement');

    await upsertChannelAdCampaign(headers['x-org-id'], {
      projectId,
      platform: 'TikTok Shop',
      campaignName: 'Paid launch boost',
      accountId: account.id,
      dispatchId: createBody.dispatch.id,
      status: 'completed',
      budgetCents: 80000,
      spendCents: 40000,
      evidenceUrl: 'https://ads.example.test/tiktok/paid-launch',
      metrics: { impressions: 50000, clicks: 1800, conversions: 92, revenueCents: 230000 },
    });
    const measuredRes = await PATCH(new Request('http://localhost/api/industrial-chain/dispatch', {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        dispatchId: createBody.dispatch.id,
        patch: {
          status: 'measured',
          evidenceUrls: ['https://example.test/tiktok/video'],
          resultUrls: ['https://ads.example.test/tiktok/paid-launch'],
        },
      }),
    }) as unknown as Parameters<typeof PATCH>[0]);
    const measuredBody = await measuredRes.json();
    expect(measuredRes.status).toBe(200);
    expect(measuredBody.dispatch.status).toBe('measured');
  });

  it('promotes next-round draft plans into executable dispatch packages in one batch', async () => {
    const headers = { 'x-org-id': `dispatch-batch-${Date.now()}` };
    const assetRes = await POST_CHAIN(new Request('http://localhost/api/industrial-chain', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'asset',
        asset: { projectId: 'next-round', type: 'report', title: 'Performance report', evidence: 'Scale decision from CSV import' },
      }),
    }) as unknown as Parameters<typeof POST_CHAIN>[0]);
    const assetBody = await assetRes.json();
    const planIds: string[] = [];
    for (const channel of ['TikTok', 'Instagram']) {
      const planRes = await POST_CHAIN(new Request('http://localhost/api/industrial-chain', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'distribution-plan',
          distributionPlan: {
            projectId: 'next-round',
            channel,
            assetIds: [assetBody.asset.id],
            status: 'draft',
          },
        }),
      }) as unknown as Parameters<typeof POST_CHAIN>[0]);
      const planBody = await planRes.json();
      planIds.push(planBody.distributionPlan.id);
    }

    const createRes = await POST(new Request('http://localhost/api/industrial-chain/dispatch', {
      method: 'POST',
      headers,
      body: JSON.stringify({ planIds }),
    }) as unknown as Parameters<typeof POST>[0]);
    const createBody = await createRes.json();

    expect(createRes.status).toBe(201);
    expect(createBody.dispatches).toHaveLength(2);
    expect(createBody.dispatches.map((item: { status: string }) => item.status)).toEqual(['manual_ready', 'manual_ready']);
    expect(createBody.snapshot.readyPlanCount).toBe(2);
    expect(createBody.snapshot.executableDispatchCount).toBe(2);
  });

  it('returns operator-readable validation errors for incomplete dispatch writes', async () => {
    const createRes = await POST(new Request('http://localhost/api/industrial-chain/dispatch', {
      method: 'POST',
      body: JSON.stringify({ planIds: [] }),
    }) as unknown as Parameters<typeof POST>[0]);
    const createBody = await createRes.json();
    expect(createRes.status).toBe(400);
    expect(createBody.error).toBe('plan_id_required');
    expect(createBody.message).toContain('分发计划 ID');

    const patchRes = await PATCH(new Request('http://localhost/api/industrial-chain/dispatch', {
      method: 'PATCH',
      body: JSON.stringify({ dispatchId: 'missing-dispatch', patch: { status: 'published' } }),
    }) as unknown as Parameters<typeof PATCH>[0]);
    const patchBody = await patchRes.json();
    expect(patchRes.status).toBe(404);
    expect(patchBody.error).toBe('dispatch_not_found');
    expect(patchBody.message).toContain('分发执行记录');
  });

  it('accepts client approval for production deliverables through the industrial chain API', async () => {
    const headers = { 'x-org-id': `delivery-api-${Date.now()}` };
    const projectId = 'client-delivery';
    const assetRes = await POST_CHAIN(new Request('http://localhost/api/industrial-chain', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'asset',
        asset: {
          projectId,
          type: 'video',
          title: 'Client review video pack',
          url: 'https://review.example.test/video-pack',
          evidence: 'Provider result ready for client review',
          source: 'kuaizi-production-result',
          tags: ['production-result'],
          deliveryStatus: 'client_review',
          clientReviewUrl: 'https://review.example.test/video-pack',
        },
      }),
    }) as unknown as Parameters<typeof POST_CHAIN>[0]);
    const assetBody = await assetRes.json();
    expect(assetBody.asset.deliveryStatus).toBe('client_review');

    const pendingRes = await GET_CHAIN(new Request(`http://localhost/api/industrial-chain?projectId=${projectId}`, {
      headers,
    }) as unknown as Parameters<typeof GET_CHAIN>[0]);
    const pendingBody = await pendingRes.json();
    expect(pendingBody.snapshot.deliveryIssueCount).toBe(1);

    const approvalRes = await POST_CHAIN(new Request('http://localhost/api/industrial-chain', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'asset-delivery',
        assetId: assetBody.asset.id,
        delivery: {
          deliveryStatus: 'approved',
          evidence: 'Client approved final video pack',
        },
      }),
    }) as unknown as Parameters<typeof POST_CHAIN>[0]);
    const approvalBody = await approvalRes.json();
    expect(approvalBody.asset.deliveryStatus).toBe('approved');
    expect(approvalBody.asset.clientApprovedAt).toMatch(/T/);

    const approvedRes = await GET_CHAIN(new Request(`http://localhost/api/industrial-chain?projectId=${projectId}`, {
      headers,
    }) as unknown as Parameters<typeof GET_CHAIN>[0]);
    const approvedBody = await approvedRes.json();
    expect(approvedBody.snapshot.approvedDeliverableCount).toBe(1);
    expect(approvedBody.snapshot.deliveryIssueCount).toBe(0);
  });
});

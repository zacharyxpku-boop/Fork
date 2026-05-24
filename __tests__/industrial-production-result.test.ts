import { afterEach, describe, expect, it, vi } from 'vitest';
import { POST } from '@/app/api/industrial-chain/production-result/route';
import {
  addContentAsset,
  addDistributionPlan,
  createDistributionDispatch,
  getDistributionPlan,
  getIndustrializationSnapshot,
  listContentAssets,
  updateContentAssetDelivery,
} from '@/lib/industrial-chain-store';
import { ingestIndustrialProductionResult } from '@/lib/industrial-production-result';
import { listAssetPermissionAccessAudits, upsertAssetPermission } from '@/lib/asset-permission-ledger';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('industrial production result ingestion', () => {
  it('turns completed provider result URLs into publishable industrial assets', async () => {
    const orgId = `production-result-${Date.now()}`;
    const projectId = `project-result-${Date.now()}`;
    const sourceAsset = await addContentAsset(orgId, {
      projectId,
      type: 'script',
      title: 'Approved source script',
      evidence: 'Approved script for provider production.',
    });
    const plan = await addDistributionPlan(orgId, {
      projectId,
      channel: 'TikTok',
      status: 'ready',
      assetIds: [sourceAsset.id],
    });
    const dispatch = await createDistributionDispatch(orgId, { planId: plan.id });

    const result = await ingestIndustrialProductionResult(orgId, {
      projectId,
      dispatchId: dispatch.id,
      channel: 'TikTok',
      task: {
        taskId: 'kz-task-1',
        status: 'completed',
        assetUrls: ['https://cdn.example.test/result.mp4', 'https://cdn.example.test/cover.jpg'],
      },
    });

    expect(result.blockedReason).toBeUndefined();
    expect(result.assets.map(asset => asset.type)).toEqual(['video', 'image']);
    expect(result.assets.every(asset => asset.deliveryStatus === 'internal_review')).toBe(true);
    expect(result.dispatch?.status).toBe('published');
    expect(result.dispatch?.resultUrls).toHaveLength(2);
    expect(result.dispatch?.handoffPackage.assetIds).toEqual(expect.arrayContaining(result.assets.map(asset => asset.id)));
    expect(result.distributionPlan?.assetIds).toEqual(expect.arrayContaining(result.assets.map(asset => asset.id)));
    await expect(getDistributionPlan(orgId, plan.id)).resolves.toMatchObject({
      assetIds: expect.arrayContaining(result.assets.map(asset => asset.id)),
    });
    const projectAssets = await listContentAssets(orgId, projectId);
    expect(projectAssets.filter(asset => asset.source === 'kuaizi-production-result')).toHaveLength(2);
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(snapshot.missingLinks).not.toContain('Missing image or video asset');
    expect(snapshot.deliverableAssetCount).toBe(2);
    expect(snapshot.approvedDeliverableCount).toBe(0);
    expect(snapshot.deliveryIssueCount).toBe(2);
    expect(snapshot.missingLinks).toContain('Production deliverables missing client approval (0/2)');

    for (const asset of result.assets) {
      await updateContentAssetDelivery(orgId, asset.id, {
        deliveryStatus: 'approved',
        clientReviewUrl: 'https://review.example/approved',
      });
    }
    const approvedSnapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(approvedSnapshot.approvedDeliverableCount).toBe(2);
    expect(approvedSnapshot.deliveryIssueCount).toBe(0);
    expect(approvedSnapshot.missingLinks).not.toContain('Production deliverables missing client approval (0/2)');
  });

  it('blocks production result publish updates when dispatch assets lack publish permission', async () => {
    const orgId = `production-result-denied-${Date.now()}`;
    const projectId = `project-result-denied-${Date.now()}`;
    const sourceAsset = await addContentAsset(orgId, {
      projectId,
      type: 'script',
      title: 'Unapproved source script',
      evidence: 'Source asset exists but has no publish permission.',
    });
    const plan = await addDistributionPlan(orgId, {
      projectId,
      channel: 'TikTok',
      status: 'ready',
      assetIds: [sourceAsset.id],
    });
    const dispatch = await createDistributionDispatch(orgId, { planId: plan.id });

    const response = await POST(new Request('http://localhost/api/industrial-chain/production-result', {
      method: 'POST',
      headers: { 'x-tenant-id': orgId },
      body: JSON.stringify({
        projectId,
        dispatchId: dispatch.id,
        channel: 'TikTok',
        task: {
          taskId: 'kz-task-denied',
          status: 'completed',
          assetUrls: ['https://cdn.example.test/blocked-result.mp4'],
        },
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe('asset_publish_permission_denied');
    expect(body.message).toContain('缺少资产发布权限');
    expect(body.access.deniedAssetIds).toEqual([sourceAsset.id]);
    await expect(listAssetPermissionAccessAudits(orgId, projectId)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          assetId: sourceAsset.id,
          action: 'publish',
          operation: 'production_result_publish',
          allowed: false,
        }),
      ]),
    );
    const assets = await listContentAssets(orgId, projectId);
    expect(assets.some(asset => asset.source === 'kuaizi-production-result')).toBe(false);
  });

  it('does not create fake assets for unfinished production tasks', async () => {
    const orgId = `production-blocked-${Date.now()}`;
    const projectId = `project-blocked-${Date.now()}`;
    const result = await ingestIndustrialProductionResult(orgId, {
      projectId,
      task: {
        taskId: 'kz-task-2',
        status: 'processing',
        assetUrls: ['https://cdn.example.test/not-ready.mp4'],
      },
    });

    expect(result.assets).toHaveLength(0);
    expect(result.blockedReason).toContain('processing');
    await expect(listContentAssets(orgId, projectId)).resolves.toHaveLength(0);
  });

  it('serves production result ingestion through the API without leaking provider raw data', async () => {
    const orgId = `production-result-api-${Date.now()}`;
    const projectId = `project-result-api-${Date.now()}`;
    const response = await POST(new Request('http://localhost/api/industrial-chain/production-result', {
      method: 'POST',
      headers: { 'x-tenant-id': orgId },
      body: JSON.stringify({
        projectId,
        channel: 'Amazon',
        clientReviewUrl: 'https://review.example/amazon-main',
        task: {
          taskId: 'kz-task-api',
          status: 'completed',
          assetUrls: ['https://cdn.example.test/amazon-main.jpg'],
          providerRaw: { token: 'secret-should-not-return' },
        },
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.assets).toHaveLength(1);
    expect(body.assets[0].url).toContain('amazon-main.jpg');
    expect(body.assets[0].deliveryStatus).toBe('client_review');
    expect(body.assets[0].clientReviewUrl).toContain('review.example');
    expect(JSON.stringify(body)).not.toContain('secret-should-not-return');
  });

  it('returns operator-readable validation errors for malformed production results', async () => {
    const missing = await POST(new Request('http://localhost/api/industrial-chain/production-result', {
      method: 'POST',
      body: JSON.stringify({ projectId: 'missing-task' }),
    }) as unknown as Parameters<typeof POST>[0]);
    const missingBody = await missing.json();
    expect(missing.status).toBe(400);
    expect(missingBody.error).toBe('production_result_required');
    expect(missingBody.message).toContain('生产任务');

    const malformed = await POST(new Request('http://localhost/api/industrial-chain/production-result', {
      method: 'POST',
      body: JSON.stringify({ projectId: 'bad-task', task: { taskId: 'task-only' } }),
    }) as unknown as Parameters<typeof POST>[0]);
    const malformedBody = await malformed.json();
    expect(malformed.status).toBe(400);
    expect(malformedBody.error).toBe('production_task_invalid');
    expect(malformedBody.message).toContain('assetUrls');
  });

  it('can fetch a Kuaizi task by taskId before ingesting completed results', async () => {
    vi.stubEnv('KUAIZI_API_KEY', 'kz_live_secret_123456');
    vi.stubEnv('KUAIZI_BASE_URL', 'https://kuaizi.example.test/v1');
    const fetchSpy = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        taskId: 'kz-task-fetched',
        status: 'completed',
        assetUrls: ['https://cdn.example.test/fetched.mp4'],
        providerRaw: { token: 'secret-should-not-return' },
      }),
    })) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fetchSpy);

    const orgId = `production-fetch-api-${Date.now()}`;
    const projectId = `project-fetch-api-${Date.now()}`;
    const sourceAsset = await addContentAsset(orgId, {
      projectId,
      type: 'script',
      title: 'Approved Kuaizi task source',
      evidence: 'Approved source handoff asset.',
    });
    const plan = await addDistributionPlan(orgId, { projectId, channel: 'TikTok', status: 'ready', assetIds: [sourceAsset.id] });
    const dispatch = await createDistributionDispatch(orgId, { planId: plan.id });
    await upsertAssetPermission(orgId, {
      projectId,
      assetId: sourceAsset.id,
      owner: 'ops',
      scope: 'project',
      roles: ['owner', 'distribution'],
      allowedActions: ['view', 'download', 'share', 'publish'],
      auditNote: 'Distribution can publish the approved Kuaizi source handoff.',
      actor: 'ops',
    });

    const response = await POST(new Request('http://localhost/api/industrial-chain/production-result', {
      method: 'POST',
      headers: { 'x-tenant-id': orgId },
      body: JSON.stringify({
        projectId,
        dispatchId: dispatch.id,
        channel: 'TikTok',
        taskId: 'kz-task-fetched',
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://kuaizi.example.test/v1/production-tasks/kz-task-fetched',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer kz_live_secret_123456' }),
      }),
    );
    expect(body.assets).toHaveLength(1);
    expect(body.dispatch.status).toBe('published');
    expect(body.dispatch.handoffPackage.assetIds).toContain(body.assets[0].id);
    expect(body.distributionPlan.assetIds).toContain(body.assets[0].id);
    await expect(listAssetPermissionAccessAudits(orgId, projectId)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          assetId: sourceAsset.id,
          action: 'publish',
          operation: 'production_result_publish',
          allowed: true,
        }),
      ]),
    );
    expect(JSON.stringify(body)).not.toContain('secret-should-not-return');
    expect(JSON.stringify(body)).not.toContain('kz_live_secret_123456');
  });
});

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GET as GET_ASSET } from '@/app/api/industrial-chain/assets/[assetId]/route';
import { POST as POST_CHAIN } from '@/app/api/industrial-chain/route';
import { POST as POST_SHARE } from '@/app/api/share/route';
import {
  createAssetAccessGrant,
  listAssetPermissionAccessAudits,
  upsertAssetPermission,
  upsertAssetSecurityPolicy,
  upsertAssetStorageObject,
} from '@/lib/asset-permission-ledger';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

async function upsertPassedSecurityPolicy(orgId: string, projectId: string, assetId: string) {
  await upsertAssetSecurityPolicy(orgId, {
    projectId,
    assetId,
    watermarkRequired: true,
    watermarkApplied: true,
    dlpScanStatus: 'passed',
    publicShareAllowed: false,
    retentionDays: 365,
    auditNote: 'Enterprise security checks passed before asset access.',
  });
}

describe('industrial asset access enforcement', () => {
  it('fails closed for asset downloads until download permission exists', async () => {
    const headers = { 'x-org-id': `asset-access-${Date.now()}` };
    const projectId = 'asset-access-project';
    const assetRes = await POST_CHAIN(new Request('http://localhost/api/industrial-chain', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'asset',
        asset: {
          projectId,
          type: 'video',
          title: 'Approved launch video',
          url: 'https://cdn.example.test/launch-video.mp4',
          evidence: 'Client approved final launch video.',
          approvalStatus: 'approved',
          rightsStatus: 'owned',
        },
      }),
    }) as unknown as Parameters<typeof POST_CHAIN>[0]);
    const assetBody = await assetRes.json();
    const assetId = assetBody.asset.id;

    const deniedRes = await GET_ASSET(new Request(`http://localhost/api/industrial-chain/assets/${assetId}?projectId=${projectId}&action=download&role=creative`, {
      headers,
    }) as unknown as Parameters<typeof GET_ASSET>[0], {
      params: Promise.resolve({ assetId }),
    });
    const deniedBody = await deniedRes.json();
    expect(deniedRes.status).toBe(403);
    expect(deniedBody.error).toBe('asset_permission_denied');
    expect(deniedBody.message).toContain('没有下载该资产的权限');
    expect(deniedBody.access.reason).toBe('missing_permission_record');
    let audits = await listAssetPermissionAccessAudits(headers['x-org-id'], projectId);
    expect(audits[0]).toMatchObject({
      assetId,
      action: 'download',
      allowed: false,
      operation: 'industrial_asset_route',
    });

    await upsertAssetPermission(headers['x-org-id'], {
      projectId,
      assetId,
      owner: 'ops',
      scope: 'project',
      roles: ['owner', 'creative', 'distribution'],
      allowedActions: ['view', 'download', 'share', 'publish'],
      auditNote: 'Allow creative and distribution teams to download approved launch video.',
      actor: 'ops',
    });

    const missingObjectRes = await GET_ASSET(new Request(`http://localhost/api/industrial-chain/assets/${assetId}?projectId=${projectId}&action=download&role=creative`, {
      headers,
    }) as unknown as Parameters<typeof GET_ASSET>[0], {
      params: Promise.resolve({ assetId }),
    });
    const missingObjectBody = await missingObjectRes.json();
    expect(missingObjectRes.status).toBe(409);
    expect(missingObjectBody.error).toBe('asset_object_unavailable');
    expect(missingObjectBody.objectAccess.reason).toBe('missing_storage_object');

    await upsertAssetStorageObject(headers['x-org-id'], {
      projectId,
      assetId,
      provider: 'inline',
      objectKey: `approved/${assetId}.json`,
      contentType: 'application/json',
      inlineContent: JSON.stringify({ assetId, title: 'Approved launch video' }),
    });
    await upsertPassedSecurityPolicy(headers['x-org-id'], projectId, assetId);
    const grant = await createAssetAccessGrant(headers['x-org-id'], {
      projectId,
      assetId,
      action: 'download',
      role: 'creative',
      maxUses: 1,
    });

    const allowedRes = await GET_ASSET(new Request(`http://localhost/api/industrial-chain/assets/${assetId}?projectId=${projectId}&action=download&role=creative&grantToken=${grant.token}`, {
      headers,
    }) as unknown as Parameters<typeof GET_ASSET>[0], {
      params: Promise.resolve({ assetId }),
    });
    const allowedText = await allowedRes.text();
    expect(allowedRes.status).toBe(200);
    expect(allowedRes.headers.get('Content-Disposition')).toContain('attachment');
    expect(allowedRes.headers.get('X-Wenai-Object-Key')).toContain(assetId);
    expect(allowedText).toContain(assetId);
    audits = await listAssetPermissionAccessAudits(headers['x-org-id'], projectId);
    expect(audits[0]).toMatchObject({
      assetId,
      action: 'download',
      allowed: true,
    });
    expect(audits).toEqual(expect.arrayContaining([expect.objectContaining({
      assetId,
      action: 'download',
      allowed: true,
      operation: 'industrial_asset_grant_route',
    })]));

    const exhaustedGrantRes = await GET_ASSET(new Request(`http://localhost/api/industrial-chain/assets/${assetId}?projectId=${projectId}&action=download&role=creative&grantToken=${grant.token}`, {
      headers,
    }) as unknown as Parameters<typeof GET_ASSET>[0], {
      params: Promise.resolve({ assetId }),
    });
    const exhaustedGrantBody = await exhaustedGrantRes.json();
    expect(exhaustedGrantRes.status).toBe(403);
    expect(exhaustedGrantBody.error).toBe('asset_access_grant_denied');
    expect(exhaustedGrantBody.grantAccess.reason).toBe('access_grant_exhausted');

    const missingShareGrantRes = await GET_ASSET(new Request(`http://localhost/api/industrial-chain/assets/${assetId}?projectId=${projectId}&action=share&role=distribution`, {
      headers,
    }) as unknown as Parameters<typeof GET_ASSET>[0], {
      params: Promise.resolve({ assetId }),
    });
    const missingShareGrantBody = await missingShareGrantRes.json();
    expect(missingShareGrantRes.status).toBe(403);
    expect(missingShareGrantBody.error).toBe('asset_access_grant_denied');
    expect(missingShareGrantBody.grantAccess.reason).toBe('missing_access_grant');

    const shareGrant = await createAssetAccessGrant(headers['x-org-id'], {
      projectId,
      assetId,
      action: 'share',
      role: 'distribution',
      maxUses: 1,
    });
    const shareRes = await GET_ASSET(new Request(`http://localhost/api/industrial-chain/assets/${assetId}?projectId=${projectId}&action=share&role=distribution&grantToken=${shareGrant.token}`, {
      headers,
    }) as unknown as Parameters<typeof GET_ASSET>[0], {
      params: Promise.resolve({ assetId }),
    });
    const shareBody = await shareRes.json();
    expect(shareRes.status).toBe(200);
    audits = await listAssetPermissionAccessAudits(headers['x-org-id'], projectId);
    expect(audits[0]).toMatchObject({
      assetId,
      action: 'share',
      allowed: true,
    });
    expect(shareBody.share.content).toContain('链接：https://cdn.example.test/launch-video.mp4');
  });

  it('blocks public share creation when asset share permission is missing', async () => {
    const headers = { 'x-org-id': `asset-share-${Date.now()}` };
    const projectId = 'asset-share-project';
    const deniedRes = await POST_SHARE(new Request('http://localhost/api/share', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        moduleId: 'content-decision-os',
        title: 'Launch share',
        content: 'This share is long enough to pass content validation.',
        projectId,
        assetIds: ['asset-without-share-permission'],
        role: 'crm',
      }),
    }) as unknown as Parameters<typeof POST_SHARE>[0]);
    const deniedBody = await deniedRes.json();

    expect(deniedRes.status).toBe(403);
    expect(deniedBody.error).toBe('asset_share_permission_denied');
    expect(deniedBody.message).toContain('没有公开分享这些资产的权限');
    expect(deniedBody.access.deniedAssetIds).toEqual(['asset-without-share-permission']);
    const audits = await listAssetPermissionAccessAudits(headers['x-org-id'], projectId);
    expect(audits[0]).toMatchObject({
      assetId: 'asset-without-share-permission',
      action: 'share',
      allowed: false,
      operation: 'public_share_create',
    });
  });

  it('redirects external downloads and returns governed share object URLs only after grant validation', async () => {
    const headers = { 'x-org-id': `asset-external-access-${Date.now()}` };
    const projectId = 'asset-external-access-project';
    const assetRes = await POST_CHAIN(new Request('http://localhost/api/industrial-chain', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'asset',
        asset: {
          projectId,
          type: 'video',
          title: 'External cloud launch video',
          url: 'https://cdn.example.test/external-launch-video.mp4',
          evidence: 'Cloud stored launch video with enterprise grant enforcement.',
          approvalStatus: 'approved',
          rightsStatus: 'owned',
        },
      }),
    }) as unknown as Parameters<typeof POST_CHAIN>[0]);
    const assetBody = await assetRes.json();
    const assetId = assetBody.asset.id;

    await upsertAssetPermission(headers['x-org-id'], {
      projectId,
      assetId,
      owner: 'ops',
      scope: 'project',
      roles: ['distribution'],
      allowedActions: ['download', 'share'],
      auditNote: 'Allow distribution to access cloud object through grants only.',
      actor: 'ops',
    });
    await upsertAssetStorageObject(headers['x-org-id'], {
      projectId,
      assetId,
      provider: 'external',
      objectKey: `cloud/${assetId}.mp4`,
      contentType: 'video/mp4',
      byteSize: 2048,
      downloadUrl: 'https://assets.example.test/download/external-launch-video.mp4',
      shareUrl: 'https://assets.example.test/share/external-launch-video',
    });
    await upsertPassedSecurityPolicy(headers['x-org-id'], projectId, assetId);

    const downloadGrant = await createAssetAccessGrant(headers['x-org-id'], {
      projectId,
      assetId,
      action: 'download',
      role: 'distribution',
      maxUses: 1,
    });
    const downloadRes = await GET_ASSET(new Request(`http://localhost/api/industrial-chain/assets/${assetId}?projectId=${projectId}&action=download&role=distribution&grantToken=${downloadGrant.token}`, {
      headers,
      redirect: 'manual',
    }) as unknown as Parameters<typeof GET_ASSET>[0], {
      params: Promise.resolve({ assetId }),
    });
    expect(downloadRes.status).toBe(302);
    expect(downloadRes.headers.get('Location')).toBe('https://assets.example.test/download/external-launch-video.mp4');
    expect(downloadRes.headers.get('X-Wenai-Object-Key')).toBe(`cloud/${assetId}.mp4`);
    expect(downloadRes.headers.get('X-Wenai-Storage-Provider')).toBe('external');

    const shareGrant = await createAssetAccessGrant(headers['x-org-id'], {
      projectId,
      assetId,
      action: 'share',
      role: 'distribution',
      maxUses: 1,
    });
    const shareRes = await GET_ASSET(new Request(`http://localhost/api/industrial-chain/assets/${assetId}?projectId=${projectId}&action=share&role=distribution&grantToken=${shareGrant.token}`, {
      headers,
    }) as unknown as Parameters<typeof GET_ASSET>[0], {
      params: Promise.resolve({ assetId }),
    });
    const shareBody = await shareRes.json();
    expect(shareRes.status).toBe(200);
    expect(shareBody.share.object).toMatchObject({
      provider: 'external',
      objectKey: `cloud/${assetId}.mp4`,
      shareUrl: 'https://assets.example.test/share/external-launch-video',
    });
    expect(shareBody.share.object.downloadUrl).toBeUndefined();

    const audits = await listAssetPermissionAccessAudits(headers['x-org-id'], projectId);
    expect(audits).toEqual(expect.arrayContaining([expect.objectContaining({
      assetId,
      action: 'download',
      allowed: true,
      operation: 'industrial_asset_grant_route',
    })]));
    expect(audits).toEqual(expect.arrayContaining([expect.objectContaining({
      assetId,
      action: 'share',
      allowed: true,
      operation: 'industrial_asset_grant_route',
    })]));
  });

  it('signs cloud object downloads and share URLs through storage provider after grant validation', async () => {
    const headers = { 'x-org-id': `asset-signed-access-${Date.now()}` };
    const projectId = 'asset-signed-access-project';
    const providerToken = 'asset-storage-token-should-not-leak';
    vi.stubEnv('ASSET_STORAGE_SIGN_ENDPOINT', 'https://storage.example.test/sign');
    vi.stubEnv('ASSET_STORAGE_SIGN_TOKEN', providerToken);
    const fetchMock = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body || '{}')) as { operation: string; objectKey: string };
      expect(init?.headers).toMatchObject({ Authorization: `Bearer ${providerToken}` });
      return new Response(JSON.stringify({
        signedUrl: `https://signed.example.test/${body.operation}/${body.objectKey}?ttl=900`,
        expiresAt: '2026-05-18T14:45:00.000Z',
      }), { status: 200 });
    });
    vi.stubGlobal('fetch', fetchMock);

    const assetRes = await POST_CHAIN(new Request('http://localhost/api/industrial-chain', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        action: 'asset',
        asset: {
          projectId,
          type: 'video',
          title: 'Signed cloud launch video',
          evidence: 'Cloud object stored without a pre-baked public URL.',
          approvalStatus: 'approved',
          rightsStatus: 'owned',
        },
      }),
    }) as unknown as Parameters<typeof POST_CHAIN>[0]);
    const assetBody = await assetRes.json();
    const assetId = assetBody.asset.id;

    await upsertAssetPermission(headers['x-org-id'], {
      projectId,
      assetId,
      owner: 'ops',
      scope: 'project',
      roles: ['distribution'],
      allowedActions: ['download', 'share'],
    });
    await upsertAssetStorageObject(headers['x-org-id'], {
      projectId,
      assetId,
      provider: 'external',
      objectKey: `cloud/${assetId}.mp4`,
      contentType: 'video/mp4',
      byteSize: 2048,
    });
    await upsertPassedSecurityPolicy(headers['x-org-id'], projectId, assetId);

    const downloadGrant = await createAssetAccessGrant(headers['x-org-id'], {
      projectId,
      assetId,
      action: 'download',
      role: 'distribution',
      maxUses: 1,
    });
    const downloadRes = await GET_ASSET(new Request(`http://localhost/api/industrial-chain/assets/${assetId}?projectId=${projectId}&action=download&role=distribution&grantToken=${downloadGrant.token}`, {
      headers,
      redirect: 'manual',
    }) as unknown as Parameters<typeof GET_ASSET>[0], {
      params: Promise.resolve({ assetId }),
    });
    expect(downloadRes.status).toBe(302);
    expect(downloadRes.headers.get('Location')).toContain(`https://signed.example.test/download/cloud/${assetId}.mp4`);
    expect(downloadRes.headers.get('X-Wenai-Signed-Url-Expires-At')).toBe('2026-05-18T14:45:00.000Z');

    const shareGrant = await createAssetAccessGrant(headers['x-org-id'], {
      projectId,
      assetId,
      action: 'share',
      role: 'distribution',
      maxUses: 1,
    });
    const shareRes = await GET_ASSET(new Request(`http://localhost/api/industrial-chain/assets/${assetId}?projectId=${projectId}&action=share&role=distribution&grantToken=${shareGrant.token}`, {
      headers,
    }) as unknown as Parameters<typeof GET_ASSET>[0], {
      params: Promise.resolve({ assetId }),
    });
    const shareBody = await shareRes.json();
    expect(shareRes.status).toBe(200);
    expect(shareBody.share.object.shareUrl).toContain(`https://signed.example.test/share/cloud/${assetId}.mp4`);
    expect(shareBody.share.object.signedUrlExpiresAt).toBe('2026-05-18T14:45:00.000Z');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(shareBody)).not.toContain(providerToken);

    const audits = await listAssetPermissionAccessAudits(headers['x-org-id'], projectId);
    expect(audits).toEqual(expect.arrayContaining([expect.objectContaining({
      assetId,
      action: 'download',
      allowed: true,
      operation: 'industrial_asset_storage_provider_route',
    })]));
    expect(audits).toEqual(expect.arrayContaining([expect.objectContaining({
      assetId,
      action: 'share',
      allowed: true,
      operation: 'industrial_asset_storage_provider_route',
    })]));
  });

  it('audits successful public share creation for governed assets', async () => {
    const headers = { 'x-org-id': `asset-share-allowed-${Date.now()}` };
    const projectId = 'asset-share-allowed-project';
    await upsertAssetPermission(headers['x-org-id'], {
      projectId,
      assetId: 'asset-share-ready',
      owner: 'ops',
      scope: 'project',
      roles: ['crm'],
      allowedActions: ['share'],
    });
    await upsertAssetStorageObject(headers['x-org-id'], {
      projectId,
      assetId: 'asset-share-ready',
      provider: 'external',
      objectKey: 'shares/asset-share-ready',
      contentType: 'text/markdown',
      byteSize: 512,
      shareUrl: 'https://assets.example.test/share/asset-share-ready',
    });
    await upsertPassedSecurityPolicy(headers['x-org-id'], projectId, 'asset-share-ready');

    const missingGrantRes = await POST_SHARE(new Request('http://localhost/api/share', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        moduleId: 'content-decision-os',
        title: 'Launch share',
        content: 'This governed asset share is long enough to pass content validation.',
        projectId,
        assetIds: ['asset-share-ready'],
        role: 'crm',
      }),
    }) as unknown as Parameters<typeof POST_SHARE>[0]);
    const missingGrantBody = await missingGrantRes.json();

    expect(missingGrantRes.status).toBe(403);
    expect(missingGrantBody.error).toBe('asset_share_grant_denied');
    expect(missingGrantBody.grantResults[0].reason).toBe('missing_access_grant');

    const grant = await createAssetAccessGrant(headers['x-org-id'], {
      projectId,
      assetId: 'asset-share-ready',
      action: 'share',
      role: 'crm',
      maxUses: 1,
    });
    const res = await POST_SHARE(new Request('http://localhost/api/share', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        moduleId: 'content-decision-os',
        title: 'Launch share',
        content: 'This governed asset share is long enough to pass content validation.',
        projectId,
        assetIds: ['asset-share-ready'],
        grantTokens: { 'asset-share-ready': grant.token },
        role: 'crm',
      }),
    }) as unknown as Parameters<typeof POST_SHARE>[0]);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.url).toContain('/share/');
    const audits = await listAssetPermissionAccessAudits(headers['x-org-id'], projectId);
    expect(audits).toEqual(expect.arrayContaining([expect.objectContaining({
      assetId: 'asset-share-ready',
      action: 'share',
      allowed: true,
      operation: 'public_share_create',
    })]));
    expect(audits).toEqual(expect.arrayContaining([expect.objectContaining({
      assetId: 'asset-share-ready',
      action: 'share',
      allowed: true,
      operation: 'public_share_object_gate',
    })]));
    expect(audits).toEqual(expect.arrayContaining([expect.objectContaining({
      assetId: 'asset-share-ready',
      action: 'share',
      allowed: true,
      operation: 'public_share_access_grant',
    })]));
  });

  it('returns operator-readable not-found errors for missing industrial assets', async () => {
    const res = await GET_ASSET(new Request('http://localhost/api/industrial-chain/assets/missing-asset?projectId=missing-project', {
      headers: { 'x-org-id': `asset-not-found-${Date.now()}` },
    }) as unknown as Parameters<typeof GET_ASSET>[0], {
      params: Promise.resolve({ assetId: 'missing-asset' }),
    });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe('asset_not_found');
    expect(body.message).toContain('没有找到该资产');
  });

  it('keeps listing factory public shares wired to asset permission context', () => {
    const root = process.cwd();
    const listingSource = readFileSync(join(root, 'src/components/marketing/ListingFactorySections.tsx'), 'utf8');
    const shareHookSource = readFileSync(join(root, 'src/lib/use-share.ts'), 'utf8');

    expect(listingSource).toContain('getShareableAssetIds(run)');
    expect(listingSource).toContain('projectId: run.project.id');
    expect(listingSource).toContain('role: \'crm\'');
    expect(listingSource).toContain('公开分享被资产权限拦截');
    expect(shareHookSource).toContain('projectId?: string');
    expect(shareHookSource).toContain('assetIds?: string[]');
    expect(shareHookSource).toContain('role?: AssetPrincipalRole');
  });
});

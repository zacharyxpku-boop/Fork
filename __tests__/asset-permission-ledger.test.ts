import { describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/app/api/asset-permissions/route';
import { POST as POST_ACCESS } from '@/app/api/asset-permissions/access/route';
import {
  createAssetAccessGrant,
  executeAssetStorageProviderAccess,
  evaluateAssetObjectAccess,
  evaluateAssetPermissionBatchAccess,
  evaluateAssetPermissionAccess,
  verifyAssetAccessGrant,
  revokeAssetAccessGrant,
  getAssetPermissionSnapshot,
  listAssetPermissionAccessAudits,
  listAssetAccessGrants,
  upsertAssetStorageObject,
  recordAssetPermissionAccessAudit,
  upsertAssetSecurityPolicy,
  upsertAssetPermission,
} from '@/lib/asset-permission-ledger';

async function upsertPassedSecurityPolicy(orgId: string, projectId: string, assetId: string) {
  return upsertAssetSecurityPolicy(orgId, {
    projectId,
    assetId,
    watermarkRequired: true,
    watermarkApplied: true,
    dlpScanStatus: 'passed',
    publicShareAllowed: false,
    retentionDays: 365,
    auditNote: 'Enterprise security checks passed before download/share.',
  });
}

describe('asset permission ledger', () => {
  it('tracks asset scope, roles, actions, expiry, and audit trail', async () => {
    const orgId = `asset-permission-${Date.now()}`;
    const projectId = `rbac-${Date.now()}`;
    await upsertAssetPermission(orgId, {
      projectId,
      assetId: 'asset-video-1',
      owner: 'ops',
      scope: 'client_review',
      roles: ['owner', 'admin', 'client'],
      allowedActions: ['view', 'share', 'approve'],
      auditNote: 'Client review permissions created.',
      actor: 'ops',
    });
    await upsertAssetStorageObject(orgId, {
      projectId,
      assetId: 'asset-video-1',
      provider: 'external',
      objectKey: 'client-review/asset-video-1.mp4',
      contentType: 'video/mp4',
      byteSize: 2048,
      downloadUrl: 'https://assets.example.test/asset-video-1.mp4',
      shareUrl: 'https://assets.example.test/review/asset-video-1',
    });
    await upsertAssetPermission(orgId, {
      projectId,
      assetId: 'asset-expired',
      owner: 'ops',
      scope: 'project',
      roles: ['owner', 'creative'],
      allowedActions: ['view', 'download'],
      expiresAt: new Date(Date.now() - 1000).toISOString(),
      auditNote: 'Legacy access policy imported.',
    });

    const snapshot = await getAssetPermissionSnapshot(orgId, projectId);
    expect(snapshot.permissionRecordCount).toBe(2);
    expect(snapshot.governedAssetCount).toBe(2);
    expect(snapshot.clientReviewScopeCount).toBe(1);
    expect(snapshot.shareableAssetCount).toBe(1);
    expect(snapshot.storageObjectCount).toBe(1);
    expect(snapshot.shareableObjectCount).toBe(1);
    expect(snapshot.downloadableAssetCount).toBe(0);
    expect(snapshot.expiredPermissionCount).toBe(1);
    expect(snapshot.activeAccessGrantCount).toBe(0);
    expect(snapshot.auditEventCount).toBe(2);
    expect(snapshot.missingLinks).toContain('Expired asset permissions (1)');
  });

  it('serves permission upsert and snapshot through the API', async () => {
    const headers = { 'x-org-id': `asset-permission-api-${Date.now()}` };
    const projectId = 'asset-permission-api-project';
    const postRes = await POST(new Request('http://localhost/api/asset-permissions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        projectId,
        permission: {
          assetId: 'asset-video-2',
          owner: 'ops',
          scope: 'project',
          roles: ['owner', 'admin', 'distribution'],
          allowedActions: ['view', 'download', 'share', 'publish'],
          auditNote: 'Ready for distribution handoff.',
        },
        storageObject: {
          assetId: 'asset-video-2',
          provider: 'inline',
          objectKey: 'asset-permission-api-project/asset-video-2.json',
          contentType: 'application/json',
          inlineContent: '{"ok":true}',
        },
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const postBody = await postRes.json();
    expect(postRes.status).toBe(201);
    expect(postBody.storageObjects).toHaveLength(1);
    expect(postBody.snapshot.missingLinks).not.toContain('Download/share permission missing storage object (1)');
    await createAssetAccessGrant(headers['x-org-id'], {
      projectId,
      assetId: 'asset-video-2',
      action: 'download',
      role: 'distribution',
      maxUses: 2,
    });
    await upsertPassedSecurityPolicy(headers['x-org-id'], projectId, 'asset-video-2');

    const getRes = await GET(new Request(`http://localhost/api/asset-permissions?projectId=${projectId}`, {
      headers,
    }) as unknown as Parameters<typeof GET>[0]);
    const getBody = await getRes.json();
    expect(getBody.permissions).toHaveLength(1);
    expect(getBody.storageObjects).toHaveLength(1);
    expect(getBody.snapshot.governedAssetCount).toBe(1);
    expect(getBody.snapshot.missingLinks).toEqual([]);
    expect(getBody.snapshot.downloadableObjectCount).toBe(1);
    expect(getBody.snapshot.activeAccessGrantCount).toBe(1);
    expect(getBody.snapshot.securityPolicyCount).toBe(1);
    expect(getBody.securityPolicies).toHaveLength(1);
    expect(getBody.snapshot.auditEventCount).toBe(1);
    expect(getBody.accessAudits).toEqual([]);
    expect(getBody.accessGrants).toHaveLength(1);
  });

  it('returns operator-readable validation errors for missing permission records', async () => {
    const res = await POST(new Request('http://localhost/api/asset-permissions', {
      method: 'POST',
      body: JSON.stringify({ projectId: 'missing-permission' }),
    }) as unknown as Parameters<typeof POST>[0]);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('asset_permission_required');
    expect(body.message).toContain('资产权限');
  });

  it('enforces action, role, and expiry before an asset operation is allowed', async () => {
    const orgId = `asset-permission-access-${Date.now()}`;
    const projectId = `access-${Date.now()}`;
    await upsertAssetPermission(orgId, {
      projectId,
      assetId: 'asset-video-3',
      owner: 'ops',
      scope: 'client_review',
      roles: ['owner', 'client'],
      allowedActions: ['view', 'approve'],
      auditNote: 'Client can review and approve.',
    });

    await expect(evaluateAssetPermissionAccess(orgId, {
      projectId,
      assetId: 'asset-video-3',
      action: 'approve',
      role: 'client',
    })).resolves.toMatchObject({ allowed: true, reason: 'allowed' });

    await expect(evaluateAssetPermissionAccess(orgId, {
      projectId,
      assetId: 'asset-video-3',
      action: 'publish',
      role: 'client',
    })).resolves.toMatchObject({ allowed: false, reason: 'action_not_allowed' });

    await expect(evaluateAssetPermissionAccess(orgId, {
      projectId,
      assetId: 'asset-video-3',
      action: 'approve',
      role: 'analytics',
    })).resolves.toMatchObject({ allowed: false, reason: 'role_not_allowed' });

    await upsertAssetPermission(orgId, {
      projectId,
      assetId: 'asset-expired-2',
      owner: 'ops',
      scope: 'project',
      roles: ['owner'],
      allowedActions: ['download'],
      expiresAt: new Date(Date.now() - 1000).toISOString(),
    });
    await expect(evaluateAssetPermissionAccess(orgId, {
      projectId,
      assetId: 'asset-expired-2',
      action: 'download',
      role: 'owner',
    })).resolves.toMatchObject({ allowed: false, reason: 'permission_expired' });
  });

  it('tracks enterprise storage objects behind governed asset permissions', async () => {
    const orgId = `asset-storage-${Date.now()}`;
    const projectId = `storage-${Date.now()}`;
    await upsertAssetPermission(orgId, {
      projectId,
      assetId: 'asset-storage-ready',
      owner: 'ops',
      scope: 'project',
      roles: ['creative', 'distribution'],
      allowedActions: ['view', 'download', 'share'],
    });

    let snapshot = await getAssetPermissionSnapshot(orgId, projectId);
    expect(snapshot.missingStorageObjectCount).toBe(1);
    expect(snapshot.missingLinks).toContain('Download/share permission missing storage object (1)');

    await upsertAssetStorageObject(orgId, {
      projectId,
      assetId: 'asset-storage-ready',
      provider: 'inline',
      objectKey: 'storage/asset-storage-ready.json',
      contentType: 'application/json',
      inlineContent: '{"asset":"ready"}',
      checksum: 'sha256-demo',
    });
    await createAssetAccessGrant(orgId, {
      projectId,
      assetId: 'asset-storage-ready',
      action: 'download',
      role: 'creative',
      maxUses: 3,
    });
    await upsertPassedSecurityPolicy(orgId, projectId, 'asset-storage-ready');

    snapshot = await getAssetPermissionSnapshot(orgId, projectId);
    expect(snapshot.storageObjectCount).toBe(1);
    expect(snapshot.downloadableObjectCount).toBe(1);
    expect(snapshot.shareableObjectCount).toBe(1);
    expect(snapshot.missingStorageObjectCount).toBe(0);
    expect(snapshot.activeAccessGrantCount).toBe(1);
    expect(snapshot.missingLinks).toEqual([]);
  });

  it('requires enterprise security policy, watermark, DLP, and retention for downloadable assets', async () => {
    const orgId = `asset-security-${Date.now()}`;
    const projectId = `security-${Date.now()}`;
    await upsertAssetPermission(orgId, {
      projectId,
      assetId: 'asset-security-ready',
      owner: 'ops',
      scope: 'project',
      roles: ['creative', 'distribution'],
      allowedActions: ['view', 'download', 'share'],
    });
    await upsertAssetStorageObject(orgId, {
      projectId,
      assetId: 'asset-security-ready',
      provider: 'external',
      objectKey: 'security/asset-security-ready.mp4',
      contentType: 'video/mp4',
      downloadUrl: 'https://assets.example.test/security-ready.mp4',
      shareUrl: 'https://assets.example.test/share/security-ready',
    });
    await createAssetAccessGrant(orgId, {
      projectId,
      assetId: 'asset-security-ready',
      action: 'share',
      role: 'distribution',
      maxUses: 2,
    });

    let snapshot = await getAssetPermissionSnapshot(orgId, projectId);
    expect(snapshot.missingLinks).toContain('Download/share asset missing enterprise security policy');

    await upsertAssetSecurityPolicy(orgId, {
      projectId,
      assetId: 'asset-security-ready',
      watermarkRequired: true,
      watermarkApplied: false,
      dlpScanStatus: 'pending',
      publicShareAllowed: true,
      retentionDays: 0,
    });
    snapshot = await getAssetPermissionSnapshot(orgId, projectId);
    expect(snapshot.securityPolicyCount).toBe(1);
    expect(snapshot.missingLinks).toEqual(expect.arrayContaining([
      'Watermark required but not applied',
      'DLP scan still pending',
      'Public share allowed before DLP pass or waiver',
    ]));

    await upsertPassedSecurityPolicy(orgId, projectId, 'asset-security-ready');
    snapshot = await getAssetPermissionSnapshot(orgId, projectId);
    expect(snapshot.watermarkAppliedCount).toBe(1);
    expect(snapshot.dlpPassedPolicyCount).toBe(1);
    expect(snapshot.publicShareBlockedCount).toBe(1);
    expect(snapshot.retentionPolicyCount).toBe(1);
    expect(snapshot.shareableAccessReadyCount).toBe(1);
    expect(snapshot.downloadableAccessReadyCount).toBe(0);
    expect(snapshot.assetAccessStates[0]).toMatchObject({
      assetId: 'asset-security-ready',
      hasStorageObject: true,
      hasSecurityPolicy: true,
      hasActiveShareGrant: true,
      shareableAccessReady: true,
      downloadableAccessReady: false,
    });
    expect(snapshot.assetAccessStates[0].blockers).toContain('missing_download_grant');
    expect(snapshot.missingLinks).toEqual([]);
  });

  it('issues, consumes, expires, and revokes temporary asset access grants', async () => {
    const orgId = `asset-grant-${Date.now()}`;
    const projectId = `grant-${Date.now()}`;
    await upsertAssetPermission(orgId, {
      projectId,
      assetId: 'asset-grant-ready',
      owner: 'ops',
      scope: 'project',
      roles: ['distribution'],
      allowedActions: ['download', 'share'],
    });
    await upsertAssetStorageObject(orgId, {
      projectId,
      assetId: 'asset-grant-ready',
      provider: 'external',
      objectKey: 'grant/asset-grant-ready.mp4',
      contentType: 'video/mp4',
      byteSize: 1024,
      downloadUrl: 'https://assets.example.test/grant-ready.mp4',
      shareUrl: 'https://assets.example.test/share/grant-ready',
    });

    const grant = await createAssetAccessGrant(orgId, {
      projectId,
      assetId: 'asset-grant-ready',
      action: 'download',
      role: 'distribution',
      maxUses: 1,
      expiresInSeconds: 60,
    });
    expect(grant.token).toMatch(/^wag_/);
    await expect(verifyAssetAccessGrant(orgId, {
      projectId,
      assetId: 'asset-grant-ready',
      action: 'download',
      role: 'distribution',
      token: grant.token,
      consume: true,
    })).resolves.toMatchObject({ allowed: true, reason: 'allowed' });
    await expect(verifyAssetAccessGrant(orgId, {
      projectId,
      assetId: 'asset-grant-ready',
      action: 'download',
      role: 'distribution',
      token: grant.token,
    })).resolves.toMatchObject({ allowed: false, reason: 'access_grant_exhausted' });

    const revocable = await createAssetAccessGrant(orgId, {
      projectId,
      assetId: 'asset-grant-ready',
      action: 'share',
      role: 'distribution',
      maxUses: 2,
    });
    await revokeAssetAccessGrant(orgId, revocable.token);
    await expect(verifyAssetAccessGrant(orgId, {
      projectId,
      assetId: 'asset-grant-ready',
      action: 'share',
      role: 'distribution',
      token: revocable.token,
    })).resolves.toMatchObject({ allowed: false, reason: 'access_grant_revoked' });

    const grants = await listAssetAccessGrants(orgId, projectId);
    const snapshot = await getAssetPermissionSnapshot(orgId, projectId);
    expect(grants).toHaveLength(2);
    expect(snapshot.expiredAccessGrantCount).toBe(1);
    expect(snapshot.revokedAccessGrantCount).toBe(1);
  });

  it('signs external cloud storage objects through a provider without leaking tokens', async () => {
    const orgId = `asset-storage-sign-${Date.now()}`;
    const projectId = `sign-${Date.now()}`;
    await upsertAssetStorageObject(orgId, {
      projectId,
      assetId: 'asset-cloud-only',
      provider: 'external',
      objectKey: 'cloud/asset-cloud-only.mp4',
      contentType: 'video/mp4',
      byteSize: 4096,
    });

    const blocked = await executeAssetStorageProviderAccess(orgId, {
      projectId,
      assetId: 'asset-cloud-only',
      action: 'download',
    });
    expect(blocked.status).toBe('blocked');
    expect(blocked.blockedReasons).toEqual(expect.arrayContaining([
      'missing_asset_security_policy',
      'asset_storage_sign_endpoint_not_configured',
      'asset_storage_sign_token_not_configured',
    ]));

    await upsertPassedSecurityPolicy(orgId, projectId, 'asset-cloud-only');

    const providerToken = 'asset-storage-token-should-not-leak';
    const fetcher = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body || '{}')) as Record<string, unknown>;
      expect(init?.headers).toMatchObject({ Authorization: `Bearer ${providerToken}` });
      expect(body).toMatchObject({
        action: 'asset-storage-sign',
        projectId,
        assetId: 'asset-cloud-only',
        operation: 'download',
        objectKey: 'cloud/asset-cloud-only.mp4',
      });
      return new Response(JSON.stringify({
        signedUrl: 'https://signed.example.test/cloud/asset-cloud-only.mp4?ttl=900',
        expiresAt: '2026-05-18T14:30:00.000Z',
      }), { status: 200 });
    }) as unknown as typeof fetch;

    const signed = await executeAssetStorageProviderAccess(orgId, {
      projectId,
      assetId: 'asset-cloud-only',
      action: 'download',
      providerEndpoint: 'https://storage.example.test/sign',
      providerToken,
      fetcher,
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(signed.status).toBe('completed');
    expect(signed.url).toContain('https://signed.example.test/cloud/asset-cloud-only.mp4');
    expect(signed.objectKey).toBe('cloud/asset-cloud-only.mp4');
    expect(JSON.stringify(signed)).not.toContain(providerToken);
  });

  it('blocks download and share object access until enterprise security policy passes', async () => {
    const orgId = `asset-security-gate-${Date.now()}`;
    const projectId = `security-gate-${Date.now()}`;
    await upsertAssetStorageObject(orgId, {
      projectId,
      assetId: 'asset-needs-security',
      provider: 'external',
      objectKey: 'secure/asset-needs-security.mp4',
      contentType: 'video/mp4',
      byteSize: 4096,
      shareUrl: 'https://assets.example.test/share/asset-needs-security',
    });

    await expect(evaluateAssetObjectAccess(orgId, {
      projectId,
      assetId: 'asset-needs-security',
      action: 'share',
    })).resolves.toMatchObject({
      allowed: false,
      reason: 'missing_asset_security_policy',
    });

    await upsertAssetSecurityPolicy(orgId, {
      projectId,
      assetId: 'asset-needs-security',
      watermarkRequired: true,
      watermarkApplied: false,
      dlpScanStatus: 'passed',
      publicShareAllowed: false,
      retentionDays: 365,
    });
    await expect(evaluateAssetObjectAccess(orgId, {
      projectId,
      assetId: 'asset-needs-security',
      action: 'download',
    })).resolves.toMatchObject({
      allowed: false,
      reason: 'asset_watermark_required',
    });

    await upsertAssetSecurityPolicy(orgId, {
      projectId,
      assetId: 'asset-needs-security',
      watermarkApplied: true,
      dlpScanStatus: 'failed',
    });
    await expect(evaluateAssetObjectAccess(orgId, {
      projectId,
      assetId: 'asset-needs-security',
      action: 'share',
    })).resolves.toMatchObject({
      allowed: false,
      reason: 'asset_dlp_scan_failed',
    });

    await upsertPassedSecurityPolicy(orgId, projectId, 'asset-needs-security');
    await expect(evaluateAssetObjectAccess(orgId, {
      projectId,
      assetId: 'asset-needs-security',
      action: 'share',
    })).resolves.toMatchObject({
      allowed: true,
      reason: 'allowed',
    });
  });

  it('evaluates batch access so multi-asset publish operations fail closed', async () => {
    const orgId = `asset-permission-batch-${Date.now()}`;
    const projectId = `batch-${Date.now()}`;
    await upsertAssetPermission(orgId, {
      projectId,
      assetId: 'asset-publishable',
      owner: 'ops',
      scope: 'project',
      roles: ['owner', 'distribution'],
      allowedActions: ['view', 'download', 'share', 'publish'],
    });
    await upsertAssetPermission(orgId, {
      projectId,
      assetId: 'asset-client-only',
      owner: 'ops',
      scope: 'client_review',
      roles: ['client'],
      allowedActions: ['view', 'approve'],
    });

    await expect(evaluateAssetPermissionBatchAccess(orgId, {
      projectId,
      assetIds: ['asset-publishable'],
      action: 'publish',
      role: 'distribution',
    })).resolves.toMatchObject({
      allowed: true,
      deniedAssetIds: [],
    });

    const denied = await evaluateAssetPermissionBatchAccess(orgId, {
      projectId,
      assetIds: ['asset-publishable', 'asset-client-only', 'asset-missing'],
      action: 'publish',
      role: 'distribution',
    });
    expect(denied.allowed).toBe(false);
    expect(denied.deniedAssetIds).toEqual(['asset-client-only', 'asset-missing']);
    expect(denied.results.map(result => result.reason)).toEqual(['allowed', 'action_not_allowed', 'missing_permission_record']);
  });

  it('records allow and deny audit events for asset operations', async () => {
    const orgId = `asset-permission-audit-${Date.now()}`;
    const projectId = `audit-${Date.now()}`;
    await upsertAssetPermission(orgId, {
      projectId,
      assetId: 'asset-audited',
      owner: 'ops',
      scope: 'project',
      roles: ['distribution'],
      allowedActions: ['publish'],
    });

    const allowed = await evaluateAssetPermissionAccess(orgId, {
      projectId,
      assetId: 'asset-audited',
      action: 'publish',
      role: 'distribution',
    });
    await recordAssetPermissionAccessAudit(orgId, {
      projectId,
      assetId: 'asset-audited',
      action: 'publish',
      role: 'distribution',
      operation: 'test_publish',
      allowed: allowed.allowed,
      reason: allowed.reason,
      record: allowed.record,
    });
    await recordAssetPermissionAccessAudit(orgId, {
      projectId,
      assetId: 'asset-missing-audit',
      action: 'publish',
      role: 'distribution',
      operation: 'test_publish',
      allowed: false,
      reason: 'missing_permission_record',
    });

    const events = await listAssetPermissionAccessAudits(orgId, projectId);
    const snapshot = await getAssetPermissionSnapshot(orgId, projectId);
    expect(events).toHaveLength(2);
    expect(events.map(event => event.allowed)).toEqual([false, true]);
    expect(snapshot.accessAuditEventCount).toBe(2);
    expect(snapshot.auditEventCount).toBeGreaterThanOrEqual(2);
  });

  it('serves access checks through a fail-closed API endpoint', async () => {
    const headers = { 'x-org-id': `asset-permission-access-api-${Date.now()}` };
    const projectId = 'asset-permission-access-api-project';
    await upsertAssetPermission(headers['x-org-id'], {
      projectId,
      assetId: 'asset-api-publishable',
      owner: 'ops',
      scope: 'project',
      roles: ['distribution'],
      allowedActions: ['publish'],
    });

    const allowedRes = await POST_ACCESS(new Request('http://localhost/api/asset-permissions/access', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        projectId,
        assetId: 'asset-api-publishable',
        action: 'publish',
        role: 'distribution',
      }),
    }) as unknown as Parameters<typeof POST_ACCESS>[0]);
    const allowedBody = await allowedRes.json();
    expect(allowedRes.status).toBe(200);
    expect(allowedBody.allowed).toBe(true);
    expect(allowedBody.grants).toEqual([]);
    let audits = await listAssetPermissionAccessAudits(headers['x-org-id'], projectId);
    expect(audits[0]).toMatchObject({
      assetId: 'asset-api-publishable',
      action: 'publish',
      allowed: true,
      operation: 'api_asset_access_check',
    });

    const deniedRes = await POST_ACCESS(new Request('http://localhost/api/asset-permissions/access', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        projectId,
        assetIds: ['asset-api-publishable', 'asset-api-missing'],
        action: 'publish',
        role: 'distribution',
      }),
    }) as unknown as Parameters<typeof POST_ACCESS>[0]);
    const deniedBody = await deniedRes.json();
    expect(deniedRes.status).toBe(403);
    expect(deniedBody.deniedAssetIds).toEqual(['asset-api-missing']);
    audits = await listAssetPermissionAccessAudits(headers['x-org-id'], projectId);
    expect(audits.some(event => event.assetId === 'asset-api-missing' && !event.allowed)).toBe(true);

    const getRes = await GET(new Request(`http://localhost/api/asset-permissions?projectId=${projectId}`, {
      headers,
    }) as unknown as Parameters<typeof GET>[0]);
    const getBody = await getRes.json();
    expect(getBody.accessAudits.length).toBeGreaterThanOrEqual(3);
    expect(getBody.accessAudits.some((event: { assetId: string; allowed: boolean }) =>
      event.assetId === 'asset-api-missing' && event.allowed === false,
    )).toBe(true);
  });

  it('can issue a temporary grant through the access API after permission succeeds', async () => {
    const headers = { 'x-org-id': `asset-permission-grant-api-${Date.now()}` };
    const projectId = 'asset-permission-grant-api-project';
    await upsertAssetPermission(headers['x-org-id'], {
      projectId,
      assetId: 'asset-api-downloadable',
      owner: 'ops',
      scope: 'project',
      roles: ['distribution'],
      allowedActions: ['download'],
    });
    await upsertAssetStorageObject(headers['x-org-id'], {
      projectId,
      assetId: 'asset-api-downloadable',
      provider: 'external',
      objectKey: 'grant-api/asset-api-downloadable.mp4',
      contentType: 'video/mp4',
      byteSize: 2048,
      downloadUrl: 'https://assets.example.test/downloadable.mp4',
    });
    await upsertPassedSecurityPolicy(headers['x-org-id'], projectId, 'asset-api-downloadable');

    const res = await POST_ACCESS(new Request('http://localhost/api/asset-permissions/access', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        projectId,
        assetId: 'asset-api-downloadable',
        action: 'download',
        role: 'distribution',
        issueGrant: true,
        maxUses: 2,
      }),
    }) as unknown as Parameters<typeof POST_ACCESS>[0]);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.allowed).toBe(true);
    expect(body.grants).toHaveLength(1);
    expect(body.grants[0].token).toMatch(/^wag_/);
    expect(body.accessUrls).toHaveLength(1);
    expect(body.accessUrls[0]).toMatchObject({
      assetId: 'asset-api-downloadable',
      action: 'download',
      role: 'distribution',
      maxUses: 2,
    });
    expect(body.accessUrls[0].url).toContain('/api/industrial-chain/assets/asset-api-downloadable?');
    expect(body.accessUrls[0].url).toContain('action=download');
    expect(body.accessUrls[0].url).toContain(`grantToken=${body.grants[0].token}`);
  });

  it('refuses to issue temporary grants when object security policy is missing', async () => {
    const headers = { 'x-org-id': `asset-permission-grant-security-${Date.now()}` };
    const projectId = 'asset-permission-grant-security-project';
    await upsertAssetPermission(headers['x-org-id'], {
      projectId,
      assetId: 'asset-api-unsecured',
      owner: 'ops',
      scope: 'project',
      roles: ['distribution'],
      allowedActions: ['share'],
    });
    await upsertAssetStorageObject(headers['x-org-id'], {
      projectId,
      assetId: 'asset-api-unsecured',
      provider: 'external',
      objectKey: 'grant-api/asset-api-unsecured.mp4',
      contentType: 'video/mp4',
      byteSize: 2048,
      shareUrl: 'https://assets.example.test/share/unsecured',
    });

    const res = await POST_ACCESS(new Request('http://localhost/api/asset-permissions/access', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        projectId,
        assetId: 'asset-api-unsecured',
        action: 'share',
        role: 'distribution',
        issueGrant: true,
      }),
    }) as unknown as Parameters<typeof POST_ACCESS>[0]);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.allowed).toBe(false);
    expect(body.deniedAssetIds).toEqual(['asset-api-unsecured']);
    expect(body.objectResults[0].reason).toBe('missing_asset_security_policy');
    expect(body.grants).toEqual([]);
  });

  it('returns operator-readable validation errors for invalid access checks', async () => {
    const res = await POST_ACCESS(new Request('http://localhost/api/asset-permissions/access', {
      method: 'POST',
      body: JSON.stringify({ projectId: 'missing-access', action: 'publish' }),
    }) as unknown as Parameters<typeof POST_ACCESS>[0]);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe('asset_access_request_required');
    expect(body.message).toContain('资产 ID');
  });
});

import { NextRequest, NextResponse } from 'next/server';
import {
  createAssetAccessGrant,
  evaluateAssetObjectAccess,
  evaluateAssetPermissionBatchAccess,
  recordAssetPermissionAccessAudit,
  revokeAssetAccessGrant,
  type AssetPermissionAction,
  type AssetPrincipalRole,
} from '@/lib/asset-permission-ledger';
import { resolveOrgId } from '@/lib/org-id';

function cleanAction(value: unknown): AssetPermissionAction | null {
  return ['view', 'download', 'share', 'approve', 'publish'].includes(value as string)
    ? value as AssetPermissionAction
    : null;
}

function cleanRole(value: unknown): AssetPrincipalRole | undefined {
  return ['owner', 'admin', 'creative', 'distribution', 'analytics', 'crm', 'client'].includes(value as string)
    ? value as AssetPrincipalRole
    : undefined;
}

function buildAssetAccessUrl(input: {
  projectId?: string;
  assetId: string;
  action: Extract<AssetPermissionAction, 'download' | 'share'>;
  role?: AssetPrincipalRole;
  grantToken: string;
}) {
  const params = new URLSearchParams({
    projectId: input.projectId || 'default-project',
    action: input.action,
    grantToken: input.grantToken,
  });
  if (input.role) params.set('role', input.role);
  return `/api/industrial-chain/assets/${encodeURIComponent(input.assetId)}?${params.toString()}`;
}

export async function POST(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const body = await request.json().catch(() => null) as {
    projectId?: string;
    assetId?: string;
    assetIds?: unknown;
    action?: unknown;
    role?: unknown;
    issueGrant?: unknown;
    revokeGrantToken?: unknown;
    expiresInSeconds?: unknown;
    maxUses?: unknown;
  } | null;
  if (body?.revokeGrantToken && typeof body.revokeGrantToken === 'string') {
    const revoked = await revokeAssetAccessGrant(orgId, body.revokeGrantToken);
    return NextResponse.json({ ok: Boolean(revoked), grant: revoked }, {
      status: revoked ? 200 : 404,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
  const action = cleanAction(body?.action);
  const assetIds = Array.isArray(body?.assetIds)
    ? body.assetIds.map(String)
    : body?.assetId
      ? [body.assetId]
      : [];
  if (!body || !action || assetIds.length === 0) {
    return NextResponse.json({
      error: 'asset_access_request_required',
      message: '请提供资产 ID 和有效操作，才能校验资产权限。',
    }, { status: 400 });
  }

  const result = await evaluateAssetPermissionBatchAccess(orgId, {
    projectId: body.projectId,
    assetIds,
    action,
    role: cleanRole(body.role),
  });
  await Promise.all(result.results.map(item => recordAssetPermissionAccessAudit(orgId, {
    projectId: body.projectId,
    assetId: item.assetId,
    action,
    role: result.role,
    actor: result.role || 'system',
    operation: 'api_asset_access_check',
    allowed: item.allowed,
    reason: item.reason,
    record: item.record,
  })));
  const grantableAction = action === 'download' || action === 'share';
  const objectResults = result.allowed && body.issueGrant && grantableAction
    ? await Promise.all(assetIds.map(async assetId => ({
      assetId,
      ...await evaluateAssetObjectAccess(orgId, {
        projectId: body.projectId,
        assetId,
        action,
      }),
    })))
    : [];
  await Promise.all(objectResults.map(item => recordAssetPermissionAccessAudit(orgId, {
    projectId: body.projectId,
    assetId: item.assetId,
    action,
    role: result.role,
    actor: result.role || 'system',
    operation: 'api_asset_access_object_gate',
    allowed: item.allowed,
    reason: item.reason,
    record: result.results.find(resultItem => resultItem.assetId === item.assetId)?.record,
  })));
  const objectDenied = objectResults.filter(item => !item.allowed);
  const grants = result.allowed && body.issueGrant && grantableAction && objectDenied.length === 0
    ? await Promise.all(assetIds.map(assetId => createAssetAccessGrant(orgId, {
      projectId: body.projectId,
      assetId,
      action,
      role: result.role,
      actor: result.role || 'system',
      expiresInSeconds: Number(body.expiresInSeconds),
      maxUses: Number(body.maxUses),
    })))
    : [];
  const accessUrls = grants.map(grant => ({
    assetId: grant.assetId,
    action: grant.action,
    role: grant.role,
    expiresAt: grant.expiresAt,
    maxUses: grant.maxUses,
    url: buildAssetAccessUrl({
      projectId: grant.projectId,
      assetId: grant.assetId,
      action: grant.action,
      role: grant.role,
      grantToken: grant.token,
    }),
  }));
  const allowed = result.allowed && objectDenied.length === 0;
  return NextResponse.json({
    ...result,
    allowed,
    objectResults,
    deniedAssetIds: Array.from(new Set([...result.deniedAssetIds, ...objectDenied.map(item => item.assetId)])),
    grants,
    accessUrls,
  }, { status: allowed ? 200 : 403, headers: { 'Cache-Control': 'no-store' } });
}

import { NextRequest, NextResponse } from 'next/server';
import {
  getAssetPermissionSnapshot,
  listAssetStorageObjects,
  listAssetAccessGrants,
  listAssetPermissionAccessAudits,
  listAssetPermissions,
  listAssetSecurityPolicies,
  upsertAssetStorageObject,
  upsertAssetSecurityPolicy,
  upsertAssetPermission,
} from '@/lib/asset-permission-ledger';
import { resolveOrgId } from '@/lib/org-id';

export async function GET(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const projectId = new URL(request.url).searchParams.get('projectId') || 'default-project';
  const [permissions, snapshot] = await Promise.all([
    listAssetPermissions(orgId, projectId, 100),
    getAssetPermissionSnapshot(orgId, projectId),
  ]);
  const [accessAudits, accessGrants] = await Promise.all([
    listAssetPermissionAccessAudits(orgId, projectId, 50),
    listAssetAccessGrants(orgId, projectId, 50),
  ]);
  const [securityPolicies, storageObjects] = await Promise.all([
    listAssetSecurityPolicies(orgId, projectId, 100),
    listAssetStorageObjects(orgId, projectId, 100),
  ]);
  return NextResponse.json({ orgId, projectId, permissions, securityPolicies, storageObjects, snapshot, accessAudits, accessGrants }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const body = await request.json().catch(() => null) as {
    projectId?: string;
    permission?: unknown;
    permissions?: unknown;
    storageObject?: unknown;
    storageObjects?: unknown;
    securityPolicy?: unknown;
    securityPolicies?: unknown;
  } | null;
  if (!body) return NextResponse.json({ error: 'invalid_request_body', message: '请求格式错误，请提交有效的 JSON。' }, { status: 400 });
  const projectId = body.projectId || 'default-project';
  const rawPermissions = Array.isArray(body.permissions)
    ? body.permissions
    : body.permission && typeof body.permission === 'object'
      ? [body.permission]
      : [];
  const rawSecurityPolicies = Array.isArray(body.securityPolicies)
    ? body.securityPolicies
    : body.securityPolicy && typeof body.securityPolicy === 'object'
      ? [body.securityPolicy]
      : [];
  const rawStorageObjects = Array.isArray(body.storageObjects)
    ? body.storageObjects
    : body.storageObject && typeof body.storageObject === 'object'
      ? [body.storageObject]
      : [];
  if (rawPermissions.length === 0 && rawSecurityPolicies.length === 0 && rawStorageObjects.length === 0) {
    return NextResponse.json({ error: 'asset_permission_required', message: '请提供一个或多个资产权限配置，或企业资产安全策略。' }, { status: 400 });
  }

  const permissions = await Promise.all(rawPermissions.slice(0, 50).map(item => upsertAssetPermission(orgId, {
    ...(item as Record<string, unknown>),
    projectId,
  })));
  const storageObjects = await Promise.all(rawStorageObjects.slice(0, 50).map(item => upsertAssetStorageObject(orgId, {
    ...(item as Record<string, unknown>),
    projectId,
  })));
  const securityPolicies = await Promise.all(rawSecurityPolicies.slice(0, 50).map(item => upsertAssetSecurityPolicy(orgId, {
    ...(item as Record<string, unknown>),
    projectId,
  })));
  const snapshot = await getAssetPermissionSnapshot(orgId, projectId);
  return NextResponse.json({ ok: true, projectId, permissions, storageObjects, securityPolicies, snapshot }, { status: 201 });
}

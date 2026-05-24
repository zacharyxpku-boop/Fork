import { NextRequest, NextResponse } from 'next/server';

import {
  assetPermissionDenyMessage,
  executeAssetStorageProviderAccess,
  evaluateAssetObjectAccess,
  evaluateAssetPermissionAccess,
  recordAssetPermissionAccessAudit,
  verifyAssetAccessGrant,
  type AssetPermissionAction,
  type AssetPrincipalRole,
} from '@/lib/asset-permission-ledger';
import { getContentAsset } from '@/lib/industrial-chain-store';
import { resolveOrgId } from '@/lib/org-id';

function cleanAction(value: string | null): AssetPermissionAction {
  if (value === 'download' || value === 'share' || value === 'approve' || value === 'publish') return value;
  return 'view';
}

function cleanRole(value: string | null): AssetPrincipalRole | undefined {
  return ['owner', 'admin', 'creative', 'distribution', 'analytics', 'crm', 'client'].includes(value || '')
    ? value as AssetPrincipalRole
    : undefined;
}

function safeFilename(input: string) {
  return `${input || 'asset'}`.replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'asset';
}

export async function GET(request: NextRequest, context: { params: Promise<{ assetId: string }> }) {
  const orgId = await resolveOrgId(request);
  const { assetId } = await context.params;
  const url = new URL(request.url);
  const projectId = url.searchParams.get('projectId') || 'default-project';
  const action = cleanAction(url.searchParams.get('action'));
  const role = cleanRole(url.searchParams.get('role'));
  const grantToken = url.searchParams.get('grantToken') || undefined;

  if (!assetId?.trim()) {
    return NextResponse.json({
      error: 'asset_id_required',
      message: '缺少资产 ID，无法读取资产内容。',
    }, { status: 400 });
  }

  const asset = await getContentAsset(orgId, assetId);
  if (!asset || asset.projectId !== projectId) {
    return NextResponse.json({
      error: 'asset_not_found',
      message: '没有找到该资产，或资产不属于当前项目。',
    }, { status: 404 });
  }

  const access = await evaluateAssetPermissionAccess(orgId, {
    projectId,
    assetId: asset.id,
    action,
    role,
  });
  await recordAssetPermissionAccessAudit(orgId, {
    projectId,
    assetId: asset.id,
    action,
    role,
    actor: role || 'system',
    operation: 'industrial_asset_route',
    allowed: access.allowed,
    reason: access.reason,
    record: access.record,
  });
  if (!access.allowed) {
    return NextResponse.json({
      error: 'asset_permission_denied',
      message: assetPermissionDenyMessage(action),
      access,
    }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }

  const objectAccess = action === 'download' || action === 'share'
    ? await evaluateAssetObjectAccess(orgId, {
      projectId,
      assetId: asset.id,
      action,
    })
    : undefined;
  if (objectAccess && !objectAccess.allowed) {
    await recordAssetPermissionAccessAudit(orgId, {
      projectId,
      assetId: asset.id,
      action,
      role,
      actor: role || 'system',
      operation: 'industrial_asset_object_route',
      allowed: false,
      reason: objectAccess.reason,
      record: access.record,
    });
    return NextResponse.json({
      error: 'asset_object_unavailable',
      message: 'Asset permission passed, but the enterprise asset object is not available for this operation.',
      objectAccess,
    }, { status: 409, headers: { 'Cache-Control': 'no-store' } });
  }
  if (action === 'download' || action === 'share') {
    const grantAccess = await verifyAssetAccessGrant(orgId, {
      projectId,
      assetId: asset.id,
      action,
      role,
      token: grantToken,
      consume: true,
    });
    await recordAssetPermissionAccessAudit(orgId, {
      projectId,
      assetId: asset.id,
      action,
      role,
      actor: role || 'system',
      operation: 'industrial_asset_grant_route',
      allowed: grantAccess.allowed,
      reason: grantAccess.reason,
      record: access.record,
    });
    if (!grantAccess.allowed) {
      return NextResponse.json({
        error: 'asset_access_grant_denied',
        message: '资产权限已通过，但下载/分享必须携带有效的企业资产临时授权。',
        grantAccess,
      }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
    }
  }

  const download = action === 'download'
    ? {
      filename: `${safeFilename(asset.title || asset.id)}.json`,
      contentType: objectAccess?.object?.contentType || 'application/json',
      objectKey: objectAccess?.object?.objectKey,
      byteSize: objectAccess?.object?.byteSize,
      provider: objectAccess?.object?.provider,
      downloadUrl: objectAccess?.object?.downloadUrl,
    }
    : undefined;
  const share = action === 'share'
    ? {
      title: asset.title,
      content: [`# ${asset.title}`, '', asset.evidence, asset.url ? `链接：${asset.url}` : ''].join('\n').trim(),
    }
    : undefined;

  if (action === 'download' && objectAccess?.object?.provider === 'inline') {
    return new NextResponse(objectAccess.object.inlineContent || '', {
      headers: {
        'Cache-Control': 'no-store',
        'Content-Type': download?.contentType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${download?.filename}"`,
        'X-Wenai-Asset-Id': asset.id,
        'X-Wenai-Object-Key': objectAccess.object.objectKey,
      },
    });
  }

  if (action === 'download' && objectAccess?.object?.provider === 'external' && objectAccess.object.downloadUrl) {
    return NextResponse.redirect(objectAccess.object.downloadUrl, {
      status: 302,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Disposition': `attachment; filename="${download?.filename}"`,
        'X-Wenai-Asset-Id': asset.id,
        'X-Wenai-Object-Key': objectAccess.object.objectKey,
        'X-Wenai-Storage-Provider': objectAccess.object.provider,
      },
    });
  }

  if (action === 'download' && objectAccess?.object?.provider === 'external' && !objectAccess.object.downloadUrl) {
    const providerAccess = await executeAssetStorageProviderAccess(orgId, {
      projectId,
      assetId: asset.id,
      action: 'download',
    });
    await recordAssetPermissionAccessAudit(orgId, {
      projectId,
      assetId: asset.id,
      action,
      role,
      actor: role || 'system',
      operation: 'industrial_asset_storage_provider_route',
      allowed: providerAccess.status === 'completed',
      reason: providerAccess.status === 'completed' ? 'signed_url_issued' : providerAccess.blockedReasons[0] || providerAccess.status,
      record: access.record,
    });
    if (providerAccess.status !== 'completed' || !providerAccess.url) {
      return NextResponse.json({
        error: 'asset_storage_provider_denied',
        message: '企业云资产权限已通过，但对象存储暂时无法签发临时下载链接。',
        providerAccess,
      }, { status: providerAccess.status === 'blocked' ? 409 : 502, headers: { 'Cache-Control': 'no-store' } });
    }
    return NextResponse.redirect(providerAccess.url, {
      status: 302,
      headers: {
        'Cache-Control': 'no-store',
        'Content-Disposition': `attachment; filename="${download?.filename}"`,
        'X-Wenai-Asset-Id': asset.id,
        'X-Wenai-Object-Key': objectAccess.object.objectKey,
        'X-Wenai-Storage-Provider': objectAccess.object.provider,
        'X-Wenai-Signed-Url-Expires-At': providerAccess.expiresAt || '',
      },
    });
  }

  const shareProviderAccess = action === 'share' && objectAccess?.object?.provider === 'external' && !objectAccess.object.shareUrl && !objectAccess.object.downloadUrl
    ? await executeAssetStorageProviderAccess(orgId, {
      projectId,
      assetId: asset.id,
      action: 'share',
    })
    : undefined;
  if (shareProviderAccess) {
    await recordAssetPermissionAccessAudit(orgId, {
      projectId,
      assetId: asset.id,
      action,
      role,
      actor: role || 'system',
      operation: 'industrial_asset_storage_provider_route',
      allowed: shareProviderAccess.status === 'completed',
      reason: shareProviderAccess.status === 'completed' ? 'signed_url_issued' : shareProviderAccess.blockedReasons[0] || shareProviderAccess.status,
      record: access.record,
    });
    if (shareProviderAccess.status !== 'completed' || !shareProviderAccess.url) {
      return NextResponse.json({
        error: 'asset_storage_provider_denied',
        message: '企业云资产权限已通过，但对象存储暂时无法签发临时分享链接。',
        providerAccess: shareProviderAccess,
      }, { status: shareProviderAccess.status === 'blocked' ? 409 : 502, headers: { 'Cache-Control': 'no-store' } });
    }
  }

  return NextResponse.json({
    ok: true,
    action,
    asset: {
      id: asset.id,
      projectId: asset.projectId,
      type: asset.type,
      title: asset.title,
      url: asset.url,
      evidence: asset.evidence,
      approvalStatus: asset.approvalStatus,
      rightsStatus: asset.rightsStatus,
      deliveryStatus: asset.deliveryStatus,
      updatedAt: asset.updatedAt,
    },
    download,
    share: share ? {
      ...share,
      object: objectAccess?.object ? {
        provider: objectAccess.object.provider,
        objectKey: objectAccess.object.objectKey,
        contentType: objectAccess.object.contentType,
        byteSize: objectAccess.object.byteSize,
        shareUrl: objectAccess.object.shareUrl || shareProviderAccess?.url,
        signedUrlExpiresAt: shareProviderAccess?.expiresAt,
        downloadUrl: objectAccess.object.shareUrl ? undefined : objectAccess.object.downloadUrl,
      } : undefined,
    } : undefined,
  }, {
    headers: {
      'Cache-Control': 'no-store',
      ...(download ? { 'Content-Disposition': `attachment; filename="${download.filename}"` } : {}),
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

import {
  assetPermissionDenyMessage,
  evaluateAssetObjectAccess,
  evaluateAssetPermissionBatchAccess,
  recordAssetPermissionAccessAudit,
  verifyAssetAccessGrant,
  type AssetPrincipalRole,
} from '@/lib/asset-permission-ledger';
import { getCookieName, verifyToken } from '@/lib/auth';
import { resolveOrgId } from '@/lib/org-id';
import { checkRateLimit } from '@/lib/ratelimit';
import { getShare, setMemoryShare, type ShareData } from '@/lib/share-readonly';

interface SharePayload {
  id?: string;
  moduleId: string;
  title: string;
  content: string;
  source?: 'pipeline-01' | 'pipeline-02' | 'pipeline-03' | 'poc-report' | 'module';
  projectId?: string;
  assetIds?: string[];
  grantTokens?: Record<string, string>;
  role?: AssetPrincipalRole;
}

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

const TTL_SECONDS = 7 * 24 * 60 * 60;

function genId(): string {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `${ts}${rand}`;
}

export async function POST(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  let body: SharePayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
  if (!body.content || body.content.length < 20) {
    return NextResponse.json({ error: '内容过短' }, { status: 400 });
  }
  if (body.content.length > 30000) {
    return NextResponse.json({ error: '内容过长，不能超过 30000 字符' }, { status: 413 });
  }

  const assetIds = Array.isArray(body.assetIds)
    ? body.assetIds.map(item => String(item).trim()).filter(Boolean).slice(0, 50)
    : [];
  if (assetIds.length > 0) {
    const access = await evaluateAssetPermissionBatchAccess(orgId, {
      projectId: body.projectId,
      assetIds,
      action: 'share',
      role: body.role || 'crm',
    });
    await Promise.all(access.results.map(item => recordAssetPermissionAccessAudit(orgId, {
      projectId: body.projectId,
      assetId: item.assetId,
      action: 'share',
      role: access.role,
      actor: access.role || 'crm',
      operation: 'public_share_create',
      allowed: item.allowed,
      reason: item.reason,
      record: item.record,
    })));
    if (!access.allowed) {
      return NextResponse.json({
        error: 'asset_share_permission_denied',
        message: assetPermissionDenyMessage('share'),
        access,
      }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
    }
    const objectResults = await Promise.all(assetIds.map(async assetId => ({
      assetId,
      ...await evaluateAssetObjectAccess(orgId, {
        projectId: body.projectId,
        assetId,
        action: 'share',
      }),
    })));
    const objectDenied = objectResults.filter(item => !item.allowed);
    await Promise.all(objectResults.map(item => recordAssetPermissionAccessAudit(orgId, {
      projectId: body.projectId,
      assetId: item.assetId,
      action: 'share',
      role: access.role,
      actor: access.role || 'crm',
      operation: 'public_share_object_gate',
      allowed: item.allowed,
      reason: item.reason,
      record: access.results.find(result => result.assetId === item.assetId)?.record,
    })));
    if (objectDenied.length > 0) {
      return NextResponse.json({
        error: 'asset_share_object_unavailable',
        message: 'Asset share permission passed, but one or more enterprise asset objects are unavailable.',
        deniedAssetIds: objectDenied.map(item => item.assetId),
        objectResults,
      }, { status: 409, headers: { 'Cache-Control': 'no-store' } });
    }
    const grantTokens = body.grantTokens && typeof body.grantTokens === 'object' ? body.grantTokens : {};
    const grantResults = await Promise.all(assetIds
      .map(async assetId => ({
        assetId,
        ...await verifyAssetAccessGrant(orgId, {
          projectId: body.projectId,
          assetId,
          action: 'share',
          role: access.role,
          token: typeof grantTokens[assetId] === 'string' ? grantTokens[assetId].trim() : undefined,
          consume: true,
        }),
      })));
    await Promise.all(grantResults.map(item => recordAssetPermissionAccessAudit(orgId, {
      projectId: body.projectId,
      assetId: item.assetId,
      action: 'share',
      role: access.role,
      actor: access.role || 'crm',
      operation: 'public_share_access_grant',
      allowed: item.allowed,
      reason: item.reason,
      record: access.results.find(result => result.assetId === item.assetId)?.record,
    })));
    const grantDenied = grantResults.filter(item => !item.allowed);
    if (grantDenied.length > 0) {
      return NextResponse.json({
        error: 'asset_share_grant_denied',
        message: '资产分享权限已通过，但公开分享必须为每个企业资产携带有效的临时分享授权。',
        deniedAssetIds: grantDenied.map(item => item.assetId),
        grantResults,
      }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
    }
  }

  let rateKey = 'anon';
  try {
    const token = request.cookies.get(getCookieName())?.value;
    if (token) {
      const payload = await verifyToken(token);
      if (payload?.username) rateKey = payload.username;
    }
  } catch {}
  const limit = await checkRateLimit('share', rateKey);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `分享链接每日 30 次上限已达，${new Date(limit.resetAt).toLocaleString('zh-CN')} 重置` },
      { status: 429 },
    );
  }

  const id = typeof body.id === 'string' && body.id.trim().length > 0 ? body.id.trim() : genId();
  const payload: ShareData = {
    moduleId: body.moduleId || 'unknown',
    title: (body.title || '').slice(0, 120),
    content: body.content.slice(0, 30000),
    source: body.source || 'module',
    createdAt: new Date().toISOString(),
  };

  if (redis) {
    try {
      await redis.hset(`wenai:share:${id}`, { ...payload });
      await redis.expire(`wenai:share:${id}`, TTL_SECONDS);
    } catch (error) {
      console.warn('[share] redis fail, fallback memory', error);
      setMemoryShare(id, payload, TTL_SECONDS);
    }
  } else {
    setMemoryShare(id, payload, TTL_SECONDS);
  }

  return NextResponse.json({ id, url: `/share/${id}`, ttlDays: 7 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 });

  if (redis) {
    try {
      const data = await redis.hgetall(`wenai:share:${id}`);
      if (data && Object.keys(data).length > 0) {
        return NextResponse.json({ ok: true, data });
      }
    } catch (error) {
      console.warn('[share] redis read fail', error);
    }
  }

  const mem = await getShare(id);
  if (mem) return NextResponse.json({ ok: true, data: mem });

  return NextResponse.json({ error: '分享已过期或不存在' }, { status: 404 });
}

import { NextRequest, NextResponse } from 'next/server';
import {
  getChannelAccountSnapshot,
  listChannelAdCampaigns,
  listChannelAccounts,
  upsertChannelAdCampaign,
  upsertChannelAccount,
} from '@/lib/channel-account-ledger';
import { resolveOrgId } from '@/lib/org-id';

export async function GET(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const projectId = new URL(request.url).searchParams.get('projectId') || 'default-project';
  const [accounts, campaigns, snapshot] = await Promise.all([
    listChannelAccounts(orgId, projectId, 100),
    listChannelAdCampaigns(orgId, projectId, 100),
    getChannelAccountSnapshot(orgId, projectId),
  ]);
  return NextResponse.json({ orgId, projectId, accounts, campaigns, snapshot });
}

export async function POST(request: NextRequest) {
  const orgId = await resolveOrgId(request);
  const body = await request.json().catch(() => null) as {
    projectId?: string;
    account?: unknown;
    accounts?: unknown;
    campaign?: unknown;
    campaigns?: unknown;
  } | null;
  if (!body) return NextResponse.json({ error: 'invalid_request_body', message: '请求格式错误，请提交有效的 JSON。' }, { status: 400 });
  const projectId = body.projectId || 'default-project';
  const rawAccounts = Array.isArray(body.accounts)
    ? body.accounts
    : body.account && typeof body.account === 'object'
      ? [body.account]
      : [];
  const rawCampaigns = Array.isArray(body.campaigns)
    ? body.campaigns
    : body.campaign && typeof body.campaign === 'object'
      ? [body.campaign]
      : [];
  if (rawAccounts.length === 0 && rawCampaigns.length === 0) {
    return NextResponse.json({ error: 'channel_account_required', message: '请提供一个或多个平台账号，或广告投放活动，才能写入矩阵账号池。' }, { status: 400 });
  }

  const accounts = await Promise.all(rawAccounts.slice(0, 50).map(item => upsertChannelAccount(orgId, {
    ...(item as Record<string, unknown>),
    projectId,
  })));
  const campaigns = await Promise.all(rawCampaigns.slice(0, 50).map(item => upsertChannelAdCampaign(orgId, {
    ...(item as Record<string, unknown>),
    projectId,
  })));
  const snapshot = await getChannelAccountSnapshot(orgId, projectId);
  return NextResponse.json({ ok: true, projectId, accounts, campaigns, snapshot }, { status: 201 });
}

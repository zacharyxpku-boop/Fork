export type ChannelAuthorizationStatus = 'not_connected' | 'manual_ready' | 'oauth_ready' | 'expired' | 'blocked';
export type ChannelHealthStatus = 'healthy' | 'warmup' | 'rate_limited' | 'at_risk' | 'blocked';
export type AdCampaignStatus = 'draft' | 'ready' | 'active' | 'paused' | 'completed' | 'blocked';

export interface ChannelAccountRecord {
  id: string;
  orgId: string;
  projectId: string;
  platform: string;
  handle: string;
  owner?: string;
  authorizationStatus: ChannelAuthorizationStatus;
  healthStatus: ChannelHealthStatus;
  dailyPublishLimit: number;
  scheduledCount: number;
  lastPublishedAt?: string;
  riskNotes: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ChannelAccountSnapshot {
  orgId: string;
  projectId: string;
  accountCount: number;
  connectedAccountCount: number;
  healthyAccountCount: number;
  blockedAccountCount: number;
  rateLimitedAccountCount: number;
  totalDailyPublishLimit: number;
  scheduledCount: number;
  availableSlotCount: number;
  adCampaignCount: number;
  readyAdCampaignCount: number;
  activeAdCampaignCount: number;
  measuredAdCampaignCount: number;
  adBudgetCents: number;
  adSpendCents: number;
  adEvidenceCount: number;
  adMissingLinks: string[];
  missingLinks: string[];
  nextActions: string[];
}

export interface ChannelDispatchReadinessResult {
  allowed: boolean;
  reason: 'allowed'
    | 'missing_channel_account'
    | 'channel_account_not_connected'
    | 'channel_account_unhealthy'
    | 'no_available_publish_slot'
    | 'missing_ad_campaign'
    | 'ad_campaign_not_ready'
    | 'ad_campaign_missing_budget'
    | 'ad_campaign_missing_evidence'
    | 'ad_campaign_over_budget'
    | 'ad_campaign_missing_measurement';
  message: string;
  account?: ChannelAccountRecord;
  campaign?: ChannelAdCampaignRecord;
  snapshot: ChannelAccountSnapshot;
}

export interface ChannelAdCampaignRecord {
  id: string;
  orgId: string;
  projectId: string;
  platform: string;
  campaignName: string;
  accountId?: string;
  dispatchId?: string;
  objective: 'traffic' | 'conversion' | 'sales' | 'awareness' | 'retargeting';
  status: AdCampaignStatus;
  budgetCents: number;
  spendCents: number;
  evidenceUrl?: string;
  metrics: {
    impressions?: number;
    clicks?: number;
    conversions?: number;
    revenueCents?: number;
  };
  riskNotes: string[];
  createdAt: string;
  updatedAt: string;
}

type ChannelGlobal = typeof globalThis & {
  __wenaiChannelAccounts?: Map<string, ChannelAccountRecord>;
  __wenaiChannelAccountLists?: Map<string, string[]>;
  __wenaiChannelAdCampaigns?: Map<string, ChannelAdCampaignRecord>;
  __wenaiChannelAdCampaignLists?: Map<string, string[]>;
};

function stores() {
  const target = globalThis as ChannelGlobal;
  if (!target.__wenaiChannelAccounts) target.__wenaiChannelAccounts = new Map();
  if (!target.__wenaiChannelAccountLists) target.__wenaiChannelAccountLists = new Map();
  if (!target.__wenaiChannelAdCampaigns) target.__wenaiChannelAdCampaigns = new Map();
  if (!target.__wenaiChannelAdCampaignLists) target.__wenaiChannelAdCampaignLists = new Map();
  return {
    accounts: target.__wenaiChannelAccounts,
    lists: target.__wenaiChannelAccountLists,
    campaigns: target.__wenaiChannelAdCampaigns,
    campaignLists: target.__wenaiChannelAdCampaignLists,
  };
}

function genId() {
  return `acct_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function genCampaignId() {
  return `ad_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function cleanString(value: unknown, fallback: string, limit = 160) {
  return (typeof value === 'string' ? value : fallback).trim().slice(0, limit) || fallback;
}

function cleanOptionalString(value: unknown, limit = 160) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, limit) : undefined;
}

function cleanNotes(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map(item => String(item).trim()).filter(Boolean).slice(0, 12);
}

function normalizeAuth(value: unknown): ChannelAuthorizationStatus {
  const allowed: ChannelAuthorizationStatus[] = ['not_connected', 'manual_ready', 'oauth_ready', 'expired', 'blocked'];
  return allowed.includes(value as ChannelAuthorizationStatus) ? value as ChannelAuthorizationStatus : 'not_connected';
}

function normalizeHealth(value: unknown): ChannelHealthStatus {
  const allowed: ChannelHealthStatus[] = ['healthy', 'warmup', 'rate_limited', 'at_risk', 'blocked'];
  return allowed.includes(value as ChannelHealthStatus) ? value as ChannelHealthStatus : 'warmup';
}

function cleanLimit(value: unknown) {
  const num = Math.floor(Number(value));
  return Number.isFinite(num) && num > 0 ? Math.min(num, 200) : 1;
}

function cleanScheduled(value: unknown) {
  const num = Math.floor(Number(value));
  return Number.isFinite(num) && num >= 0 ? Math.min(num, 500) : 0;
}

function cleanMoney(value: unknown) {
  const num = Math.floor(Number(value));
  return Number.isFinite(num) && num >= 0 ? Math.min(num, 1_000_000_000) : 0;
}

function cleanMetric(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? Math.floor(num) : undefined;
}

function normalizeCampaignStatus(value: unknown): AdCampaignStatus {
  const allowed: AdCampaignStatus[] = ['draft', 'ready', 'active', 'paused', 'completed', 'blocked'];
  return allowed.includes(value as AdCampaignStatus) ? value as AdCampaignStatus : 'draft';
}

function normalizeObjective(value: unknown): ChannelAdCampaignRecord['objective'] {
  const allowed: ChannelAdCampaignRecord['objective'][] = ['traffic', 'conversion', 'sales', 'awareness', 'retargeting'];
  return allowed.includes(value as ChannelAdCampaignRecord['objective']) ? value as ChannelAdCampaignRecord['objective'] : 'sales';
}

function normalizeComparable(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function samePlatform(left: string, right: string) {
  return normalizeComparable(left) === normalizeComparable(right);
}

function isConnected(account: ChannelAccountRecord) {
  return account.authorizationStatus === 'manual_ready' || account.authorizationStatus === 'oauth_ready';
}

function isPublishHealthy(account: ChannelAccountRecord) {
  return account.healthStatus === 'healthy' || account.healthStatus === 'warmup';
}

function availableSlots(account: ChannelAccountRecord) {
  return Math.max(0, account.dailyPublishLimit - account.scheduledCount);
}

export async function upsertChannelAccount(orgId: string, input: Partial<ChannelAccountRecord>): Promise<ChannelAccountRecord> {
  const now = new Date().toISOString();
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const id = input.id || genId();
  const existing = stores().accounts.get(`${orgId}:${id}`);
  const record: ChannelAccountRecord = {
    id,
    orgId,
    projectId,
    platform: cleanString(input.platform, existing?.platform || 'manual-platform', 80),
    handle: cleanString(input.handle, existing?.handle || 'account_handle', 120),
    owner: cleanOptionalString(input.owner) || existing?.owner,
    authorizationStatus: normalizeAuth(input.authorizationStatus || existing?.authorizationStatus),
    healthStatus: normalizeHealth(input.healthStatus || existing?.healthStatus),
    dailyPublishLimit: cleanLimit(input.dailyPublishLimit ?? existing?.dailyPublishLimit),
    scheduledCount: cleanScheduled(input.scheduledCount ?? existing?.scheduledCount),
    lastPublishedAt: cleanOptionalString(input.lastPublishedAt, 80) || existing?.lastPublishedAt,
    riskNotes: cleanNotes(input.riskNotes ?? existing?.riskNotes),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  const store = stores();
  store.accounts.set(`${orgId}:${id}`, record);
  const listKey = `${orgId}:${projectId}`;
  const list = store.lists.get(listKey) || [];
  store.lists.set(listKey, [id, ...list.filter(item => item !== id)].slice(0, 500));
  return record;
}

export async function listChannelAccounts(orgId: string, projectId = 'default-project', limit = 100): Promise<ChannelAccountRecord[]> {
  const store = stores();
  const ids = store.lists.get(`${orgId}:${projectId}`) || [];
  return ids.slice(0, limit).map(id => store.accounts.get(`${orgId}:${id}`)).filter(Boolean) as ChannelAccountRecord[];
}

export async function upsertChannelAdCampaign(orgId: string, input: Partial<ChannelAdCampaignRecord>): Promise<ChannelAdCampaignRecord> {
  const now = new Date().toISOString();
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const id = input.id || genCampaignId();
  const existing = stores().campaigns.get(`${orgId}:${id}`);
  const record: ChannelAdCampaignRecord = {
    id,
    orgId,
    projectId,
    platform: cleanString(input.platform, existing?.platform || 'TikTok Shop', 80),
    campaignName: cleanString(input.campaignName, existing?.campaignName || 'launch-ad-campaign', 160),
    accountId: cleanOptionalString(input.accountId) || existing?.accountId,
    dispatchId: cleanOptionalString(input.dispatchId) || existing?.dispatchId,
    objective: normalizeObjective(input.objective || existing?.objective),
    status: normalizeCampaignStatus(input.status || existing?.status),
    budgetCents: cleanMoney(input.budgetCents ?? existing?.budgetCents),
    spendCents: cleanMoney(input.spendCents ?? existing?.spendCents),
    evidenceUrl: cleanOptionalString(input.evidenceUrl, 1000) || existing?.evidenceUrl,
    metrics: {
      impressions: cleanMetric(input.metrics?.impressions ?? existing?.metrics.impressions),
      clicks: cleanMetric(input.metrics?.clicks ?? existing?.metrics.clicks),
      conversions: cleanMetric(input.metrics?.conversions ?? existing?.metrics.conversions),
      revenueCents: cleanMetric(input.metrics?.revenueCents ?? existing?.metrics.revenueCents),
    },
    riskNotes: cleanNotes(input.riskNotes ?? existing?.riskNotes),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  const store = stores();
  store.campaigns.set(`${orgId}:${id}`, record);
  const listKey = `${orgId}:${projectId}`;
  const list = store.campaignLists.get(listKey) || [];
  store.campaignLists.set(listKey, [id, ...list.filter(item => item !== id)].slice(0, 500));
  return record;
}

export async function listChannelAdCampaigns(orgId: string, projectId = 'default-project', limit = 100): Promise<ChannelAdCampaignRecord[]> {
  const store = stores();
  const ids = store.campaignLists.get(`${orgId}:${projectId}`) || [];
  return ids.slice(0, limit).map(id => store.campaigns.get(`${orgId}:${id}`)).filter(Boolean) as ChannelAdCampaignRecord[];
}

export async function getChannelAccountSnapshot(orgId: string, projectId = 'default-project'): Promise<ChannelAccountSnapshot> {
  const [accounts, campaigns] = await Promise.all([
    listChannelAccounts(orgId, projectId, 200),
    listChannelAdCampaigns(orgId, projectId, 200),
  ]);
  const connected = accounts.filter(account => account.authorizationStatus === 'manual_ready' || account.authorizationStatus === 'oauth_ready');
  const healthy = connected.filter(account => account.healthStatus === 'healthy' || account.healthStatus === 'warmup');
  const blocked = accounts.filter(account => account.authorizationStatus === 'blocked' || account.healthStatus === 'blocked');
  const rateLimited = accounts.filter(account => account.healthStatus === 'rate_limited');
  const totalDailyPublishLimit = healthy.reduce((sum, account) => sum + account.dailyPublishLimit, 0);
  const scheduledCount = accounts.reduce((sum, account) => sum + account.scheduledCount, 0);
  const availableSlotCount = Math.max(0, totalDailyPublishLimit - scheduledCount);
  const readyCampaigns = campaigns.filter(campaign => campaign.status === 'ready' || campaign.status === 'active' || campaign.status === 'completed');
  const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active');
  const measuredCampaigns = campaigns.filter(campaign => campaign.status === 'completed' && ((campaign.metrics.conversions || 0) > 0 || (campaign.metrics.revenueCents || 0) > 0));
  const linkedAccountIds = new Set(accounts.map(account => account.id));
  const adBudgetCents = campaigns.reduce((sum, campaign) => sum + campaign.budgetCents, 0);
  const adSpendCents = campaigns.reduce((sum, campaign) => sum + campaign.spendCents, 0);
  const adEvidenceCount = campaigns.filter(campaign => Boolean(campaign.evidenceUrl)).length;
  const adMissingLinks = [
    campaigns.length === 0 ? 'Missing ad campaign ledger' : '',
    campaigns.length > 0 && readyCampaigns.length === 0 ? 'Missing ready or active ad campaign' : '',
    campaigns.some(campaign => campaign.accountId && !linkedAccountIds.has(campaign.accountId)) ? 'Ad campaign references missing channel account' : '',
    activeCampaigns.some(campaign => campaign.budgetCents === 0) ? 'Active ad campaign missing budget' : '',
    campaigns.some(campaign => (campaign.status === 'active' || campaign.status === 'completed') && !campaign.evidenceUrl) ? 'Ad campaign missing platform evidence URL' : '',
    campaigns.some(campaign => campaign.budgetCents > 0 && campaign.spendCents > campaign.budgetCents) ? 'Ad campaign spend exceeds budget' : '',
  ].filter(Boolean);
  const missingLinks = [
    accounts.length === 0 ? 'Missing channel account matrix' : '',
    connected.length === 0 ? 'Missing connected or manual-ready channel account' : '',
    healthy.length === 0 ? 'Missing healthy channel account' : '',
    blocked.length > 0 ? `Blocked channel accounts (${blocked.length})` : '',
    rateLimited.length > 0 ? `Rate-limited channel accounts (${rateLimited.length})` : '',
    accounts.length > 0 && availableSlotCount === 0 ? 'No available publishing slots in channel matrix' : '',
  ].filter(Boolean);

  return {
    orgId,
    projectId,
    accountCount: accounts.length,
    connectedAccountCount: connected.length,
    healthyAccountCount: healthy.length,
    blockedAccountCount: blocked.length,
    rateLimitedAccountCount: rateLimited.length,
    totalDailyPublishLimit,
    scheduledCount,
    availableSlotCount,
    adCampaignCount: campaigns.length,
    readyAdCampaignCount: readyCampaigns.length,
    activeAdCampaignCount: activeCampaigns.length,
    measuredAdCampaignCount: measuredCampaigns.length,
    adBudgetCents,
    adSpendCents,
    adEvidenceCount,
    adMissingLinks,
    missingLinks,
    nextActions: [
      ...missingLinks.map(item => `Close channel gap: ${item}`),
      ...adMissingLinks.map(item => `Close ad campaign gap: ${item}`),
    ],
  };
}

export async function evaluateChannelDispatchReadiness(
  orgId: string,
  input: {
    projectId?: string;
    channel?: string;
    dispatchId?: string;
    requireAdCampaign?: boolean;
    requireMeasurement?: boolean;
  },
): Promise<ChannelDispatchReadinessResult> {
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const channel = cleanString(input.channel, 'manual-channel', 80);
  const [accounts, campaigns, snapshot] = await Promise.all([
    listChannelAccounts(orgId, projectId, 200),
    listChannelAdCampaigns(orgId, projectId, 200),
    getChannelAccountSnapshot(orgId, projectId),
  ]);
  const matchingAccounts = accounts.filter(account => samePlatform(account.platform, channel));
  const connectedAccounts = matchingAccounts.filter(isConnected);
  const healthyAccounts = connectedAccounts.filter(isPublishHealthy);
  const account = healthyAccounts
    .filter(item => availableSlots(item) > 0)
    .sort((a, b) => availableSlots(b) - availableSlots(a))[0];

  if (matchingAccounts.length === 0) {
    return {
      allowed: false,
      reason: 'missing_channel_account',
      message: `缺少 ${channel} 的矩阵账号，不能把分发执行标记为已发布。`,
      snapshot,
    };
  }
  if (connectedAccounts.length === 0) {
    return {
      allowed: false,
      reason: 'channel_account_not_connected',
      message: `${channel} 账号尚未 manual_ready 或 oauth_ready，不能发布。`,
      account: matchingAccounts[0],
      snapshot,
    };
  }
  if (healthyAccounts.length === 0) {
    return {
      allowed: false,
      reason: 'channel_account_unhealthy',
      message: `${channel} 账号健康状态不是 healthy/warmup，不能发布。`,
      account: connectedAccounts[0],
      snapshot,
    };
  }
  if (!account) {
    return {
      allowed: false,
      reason: 'no_available_publish_slot',
      message: `${channel} 账号今日发布槽位已用完，不能继续发布。`,
      account: healthyAccounts[0],
      snapshot,
    };
  }

  if (input.requireAdCampaign) {
    const linkedCampaigns = campaigns.filter(campaign => {
      const dispatchMatches = !campaign.dispatchId || !input.dispatchId || campaign.dispatchId === input.dispatchId;
      const accountMatches = !campaign.accountId || campaign.accountId === account.id;
      return dispatchMatches && accountMatches && samePlatform(campaign.platform, channel);
    });
    const campaign = linkedCampaigns.find(item => item.status === 'active')
      || linkedCampaigns.find(item => item.status === 'ready')
      || linkedCampaigns.find(item => item.status === 'completed');
    if (!campaign) {
      return {
        allowed: false,
        reason: 'missing_ad_campaign',
        message: `${channel} 缺少 ready/active/completed 广告活动，不能声明广告投放或投放回流。`,
        account,
        snapshot,
      };
    }
    if (!['ready', 'active', 'completed'].includes(campaign.status)) {
      return {
        allowed: false,
        reason: 'ad_campaign_not_ready',
        message: `${channel} 广告活动未进入 ready/active/completed，不能进入投放执行。`,
        account,
        campaign,
        snapshot,
      };
    }
    if ((campaign.status === 'active' || campaign.status === 'completed') && campaign.budgetCents <= 0) {
      return {
        allowed: false,
        reason: 'ad_campaign_missing_budget',
        message: `${channel} 广告活动缺少预算，不能作为真实投放闭环。`,
        account,
        campaign,
        snapshot,
      };
    }
    if ((campaign.status === 'active' || campaign.status === 'completed') && !campaign.evidenceUrl) {
      return {
        allowed: false,
        reason: 'ad_campaign_missing_evidence',
        message: `${channel} 广告活动缺少平台证据链接，不能作为真实投放闭环。`,
        account,
        campaign,
        snapshot,
      };
    }
    if (campaign.budgetCents > 0 && campaign.spendCents > campaign.budgetCents) {
      return {
        allowed: false,
        reason: 'ad_campaign_over_budget',
        message: `${channel} 广告活动花费超过预算，需要先处理投放风险。`,
        account,
        campaign,
        snapshot,
      };
    }
    if (input.requireMeasurement && campaign.status === 'completed') {
      const measured = (campaign.metrics.conversions || 0) > 0 || (campaign.metrics.revenueCents || 0) > 0;
      if (!measured) {
        return {
          allowed: false,
          reason: 'ad_campaign_missing_measurement',
          message: `${channel} 广告活动已完成但缺少转化或收入指标，不能标记为已回流。`,
          account,
          campaign,
          snapshot,
        };
      }
    }
    return { allowed: true, reason: 'allowed', message: '渠道账号和广告活动已满足执行条件。', account, campaign, snapshot };
  }

  return { allowed: true, reason: 'allowed', message: '渠道账号已满足发布条件。', account, snapshot };
}

import { Redis } from '@upstash/redis';
import type { PerformanceImportReport } from '@/lib/performance-import';

export type ContentAssetType = 'brief' | 'image' | 'video' | 'script' | 'benchmark' | 'report' | 'production_handoff';
export type ContentAssetApprovalStatus = 'draft' | 'review' | 'approved' | 'blocked';
export type ContentAssetRightsStatus = 'owned' | 'licensed' | 'needs_review' | 'expired';
export type ContentAssetDeliveryStatus = 'not_ready' | 'internal_review' | 'client_review' | 'approved' | 'revision_requested';
export type DistributionPlanStatus = 'draft' | 'ready' | 'published' | 'measured';
export type DistributionDispatchStatus = 'queued' | 'manual_ready' | 'provider_gated' | 'published' | 'measured' | 'blocked';

export interface ContentAssetRecord {
  id: string;
  orgId: string;
  projectId: string;
  sku?: string;
  type: ContentAssetType;
  title: string;
  url?: string;
  source?: string;
  tags: string[];
  evidence: string;
  approvalStatus: ContentAssetApprovalStatus;
  rightsStatus: ContentAssetRightsStatus;
  version: number;
  parentAssetId?: string;
  reusable: boolean;
  expiresAt?: string;
  deliveryStatus?: ContentAssetDeliveryStatus;
  clientReviewUrl?: string;
  clientApprovedAt?: string;
  revisionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DistributionPlanRecord {
  id: string;
  orgId: string;
  projectId: string;
  channel: string;
  assetIds: string[];
  status: DistributionPlanStatus;
  scheduledAt?: string;
  owner?: string;
  utmCode: string;
  returnMetric: string;
  nextReviewAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DistributionDispatchRecord {
  id: string;
  orgId: string;
  projectId: string;
  planId: string;
  channel: string;
  status: DistributionDispatchStatus;
  handoffPackage: {
    assetIds: string[];
    utmCode: string;
    returnMetric: string;
    owner?: string;
    scheduledAt?: string;
    checklist: string[];
  };
  providerAdapter: {
    mode: 'manual' | 'provider';
    configured: boolean;
    providerName?: string;
    blocker?: string;
  };
  evidenceUrls: string[];
  resultUrls: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IndustrialPerformanceRecord {
  id: string;
  orgId: string;
  projectId: string;
  dispatchId?: string;
  source: 'csv-import' | 'crm-handoff' | 'api';
  rowCount: number;
  summary: PerformanceImportReport['summary'];
  decisions: PerformanceImportReport['decisions'];
  assetMatchSummary?: IndustrialAssetMatchSummary;
  importedAt: string;
}

export interface IndustrialAssetMatchSummary {
  matchedCount: number;
  ambiguousCount: number;
  unmatchedCount: number;
  matched: Array<{ assetRef: string; assetId: string }>;
  ambiguous: Array<{ assetRef: string; assetIds: string[] }>;
  unmatched: string[];
}

export interface IndustrializationSnapshot {
  orgId: string;
  projectId: string;
  assetCount: number;
  reportAssetCount: number;
  approvedAssetCount: number;
  reusableAssetCount: number;
  blockedAssetCount: number;
  rightsIssueAssetCount: number;
  assetGovernanceIssueCount: number;
  deliverableAssetCount: number;
  clientReviewAssetCount: number;
  approvedDeliverableCount: number;
  revisionRequestedCount: number;
  deliveryIssueCount: number;
  planCount: number;
  draftPlanCount: number;
  nextRoundAssetPlanCount: number;
  readyPlanCount: number;
  dispatchCount: number;
  executableDispatchCount: number;
  publishedDispatchCount: number;
  publishedWithEvidenceCount: number;
  missingPublishEvidenceCount: number;
  overdueReviewDispatchCount: number;
  measuredDispatchCount: number;
  performanceReturnCount: number;
  scaleDecisionCount: number;
  assetMatchAmbiguousCount: number;
  assetMatchUnmatchedCount: number;
  assetMatchIssueCount: number;
  missingLinks: string[];
  nextActions: string[];
}

type StoreGlobal = typeof globalThis & {
  __wenaiIndustrialAssets?: Map<string, ContentAssetRecord>;
  __wenaiIndustrialAssetLists?: Map<string, string[]>;
  __wenaiIndustrialPlans?: Map<string, DistributionPlanRecord>;
  __wenaiIndustrialPlanLists?: Map<string, string[]>;
  __wenaiIndustrialDispatches?: Map<string, DistributionDispatchRecord>;
  __wenaiIndustrialDispatchLists?: Map<string, string[]>;
  __wenaiIndustrialPerformance?: Map<string, IndustrialPerformanceRecord>;
  __wenaiIndustrialPerformanceLists?: Map<string, string[]>;
};

let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
}

function stores() {
  const target = globalThis as StoreGlobal;
  if (!target.__wenaiIndustrialAssets) target.__wenaiIndustrialAssets = new Map();
  if (!target.__wenaiIndustrialAssetLists) target.__wenaiIndustrialAssetLists = new Map();
  if (!target.__wenaiIndustrialPlans) target.__wenaiIndustrialPlans = new Map();
  if (!target.__wenaiIndustrialPlanLists) target.__wenaiIndustrialPlanLists = new Map();
  if (!target.__wenaiIndustrialDispatches) target.__wenaiIndustrialDispatches = new Map();
  if (!target.__wenaiIndustrialDispatchLists) target.__wenaiIndustrialDispatchLists = new Map();
  if (!target.__wenaiIndustrialPerformance) target.__wenaiIndustrialPerformance = new Map();
  if (!target.__wenaiIndustrialPerformanceLists) target.__wenaiIndustrialPerformanceLists = new Map();
  return {
    assets: target.__wenaiIndustrialAssets,
    assetLists: target.__wenaiIndustrialAssetLists,
    plans: target.__wenaiIndustrialPlans,
    planLists: target.__wenaiIndustrialPlanLists,
    dispatches: target.__wenaiIndustrialDispatches,
    dispatchLists: target.__wenaiIndustrialDispatchLists,
    performance: target.__wenaiIndustrialPerformance,
    performanceLists: target.__wenaiIndustrialPerformanceLists,
  };
}

function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function scopedListKey(kind: 'asset' | 'plan' | 'dispatch' | 'performance', orgId: string, projectId: string) {
  return `wenai:industrial:${kind}:list:${orgId}:${projectId}`;
}

function recordKey(kind: 'asset' | 'plan' | 'dispatch' | 'performance', orgId: string, id: string) {
  return `wenai:industrial:${kind}:${orgId}:${id}`;
}

function cleanTags(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input.map(item => String(item).trim()).filter(Boolean).slice(0, 12);
}

function cleanStrings(input: unknown, limit = 20): string[] {
  if (!Array.isArray(input)) return [];
  return input.map(item => String(item).trim()).filter(Boolean).slice(0, limit);
}

function normalizeProjectId(projectId?: string) {
  return (projectId || 'default-project').trim().slice(0, 120) || 'default-project';
}

function normalizeDispatchStatus(status?: string): DistributionDispatchStatus {
  const allowed: DistributionDispatchStatus[] = ['queued', 'manual_ready', 'provider_gated', 'published', 'measured', 'blocked'];
  return allowed.includes(status as DistributionDispatchStatus) ? status as DistributionDispatchStatus : 'queued';
}

function normalizeApprovalStatus(status?: string): ContentAssetApprovalStatus {
  const allowed: ContentAssetApprovalStatus[] = ['draft', 'review', 'approved', 'blocked'];
  return allowed.includes(status as ContentAssetApprovalStatus) ? status as ContentAssetApprovalStatus : 'approved';
}

function normalizeRightsStatus(status?: string): ContentAssetRightsStatus {
  const allowed: ContentAssetRightsStatus[] = ['owned', 'licensed', 'needs_review', 'expired'];
  return allowed.includes(status as ContentAssetRightsStatus) ? status as ContentAssetRightsStatus : 'owned';
}

function normalizeDeliveryStatus(status?: string): ContentAssetDeliveryStatus {
  const allowed: ContentAssetDeliveryStatus[] = ['not_ready', 'internal_review', 'client_review', 'approved', 'revision_requested'];
  return allowed.includes(status as ContentAssetDeliveryStatus) ? status as ContentAssetDeliveryStatus : 'not_ready';
}

function cleanAssetMatchSummary(input?: Partial<IndustrialAssetMatchSummary>): IndustrialAssetMatchSummary | undefined {
  if (!input) return undefined;
  const matched = Array.isArray(input.matched)
    ? input.matched.map(item => ({
      assetRef: String(item.assetRef || '').trim().slice(0, 200),
      assetId: String(item.assetId || '').trim().slice(0, 160),
    })).filter(item => item.assetRef && item.assetId).slice(0, 100)
    : [];
  const ambiguous = Array.isArray(input.ambiguous)
    ? input.ambiguous.map(item => ({
      assetRef: String(item.assetRef || '').trim().slice(0, 200),
      assetIds: cleanStrings(item.assetIds, 20),
    })).filter(item => item.assetRef && item.assetIds.length > 0).slice(0, 100)
    : [];
  const unmatched = cleanStrings(input.unmatched, 100);

  return {
    matchedCount: Number.isFinite(input.matchedCount) ? Number(input.matchedCount) : matched.length,
    ambiguousCount: Number.isFinite(input.ambiguousCount) ? Number(input.ambiguousCount) : ambiguous.length,
    unmatchedCount: Number.isFinite(input.unmatchedCount) ? Number(input.unmatchedCount) : unmatched.length,
    matched,
    ambiguous,
    unmatched,
  };
}

export async function addContentAsset(orgId: string, input: Partial<ContentAssetRecord>): Promise<ContentAssetRecord> {
  const now = new Date().toISOString();
  const projectId = normalizeProjectId(input.projectId);
  const id = input.id || genId('asset');
  const record: ContentAssetRecord = {
    id,
    orgId,
    projectId,
    sku: input.sku?.slice(0, 160),
    type: input.type || 'brief',
    title: input.title?.trim().slice(0, 200) || 'Untitled asset',
    url: input.url?.trim().slice(0, 1000),
    source: input.source?.trim().slice(0, 120),
    tags: cleanTags(input.tags),
    evidence: input.evidence?.trim().slice(0, 2000) || 'No evidence attached',
    approvalStatus: normalizeApprovalStatus(input.approvalStatus),
    rightsStatus: normalizeRightsStatus(input.rightsStatus),
    version: Number.isFinite(input.version) && Number(input.version) > 0 ? Math.floor(Number(input.version)) : 1,
    parentAssetId: input.parentAssetId?.trim().slice(0, 160),
    reusable: input.reusable !== false,
    expiresAt: input.expiresAt,
    deliveryStatus: input.deliveryStatus ? normalizeDeliveryStatus(input.deliveryStatus) : undefined,
    clientReviewUrl: input.clientReviewUrl?.trim().slice(0, 1000),
    clientApprovedAt: input.clientApprovedAt,
    revisionReason: input.revisionReason?.trim().slice(0, 1000),
    createdAt: now,
    updatedAt: now,
  };

  if (redis) {
    try {
      await redis.hset(recordKey('asset', orgId, id), record as unknown as Record<string, unknown>);
      await redis.lpush(scopedListKey('asset', orgId, projectId), id);
      await redis.ltrim(scopedListKey('asset', orgId, projectId), 0, 499);
      return record;
    } catch {
      // fall through to memory
    }
  }

  const store = stores();
  store.assets.set(`${orgId}:${id}`, record);
  const key = `${orgId}:${projectId}`;
  const list = store.assetLists.get(key) || [];
  store.assetLists.set(key, [id, ...list.filter(item => item !== id)].slice(0, 500));
  return record;
}

export async function listContentAssets(orgId: string, projectId = 'default-project', limit = 100): Promise<ContentAssetRecord[]> {
  const normalizedProjectId = normalizeProjectId(projectId);
  if (redis) {
    try {
      const ids = await redis.lrange(scopedListKey('asset', orgId, normalizedProjectId), 0, limit - 1);
      const records = await Promise.all(ids.map(async id => {
        const raw = await redis!.hgetall(recordKey('asset', orgId, id));
        return raw && Object.keys(raw).length > 0 ? raw as unknown as ContentAssetRecord : null;
      }));
      return records.filter(Boolean) as ContentAssetRecord[];
    } catch {
      return [];
    }
  }

  const store = stores();
  const ids = store.assetLists.get(`${orgId}:${normalizedProjectId}`) || [];
  return ids.slice(0, limit).map(id => store.assets.get(`${orgId}:${id}`)).filter(Boolean) as ContentAssetRecord[];
}

export async function getContentAsset(orgId: string, assetId: string): Promise<ContentAssetRecord | null> {
  if (redis) {
    try {
      const raw = await redis.hgetall(recordKey('asset', orgId, assetId));
      return raw && Object.keys(raw).length > 0 ? raw as unknown as ContentAssetRecord : null;
    } catch {
      return null;
    }
  }

  return stores().assets.get(`${orgId}:${assetId}`) || null;
}

export async function updateContentAssetGovernance(
  orgId: string,
  assetId: string,
  patch: Partial<Pick<ContentAssetRecord, 'approvalStatus' | 'rightsStatus' | 'reusable' | 'expiresAt' | 'evidence' | 'tags'>>,
): Promise<ContentAssetRecord | null> {
  const existing = await getContentAsset(orgId, assetId);
  if (!existing) return null;

  const next: ContentAssetRecord = {
    ...existing,
    approvalStatus: patch.approvalStatus ? normalizeApprovalStatus(patch.approvalStatus) : existing.approvalStatus,
    rightsStatus: patch.rightsStatus ? normalizeRightsStatus(patch.rightsStatus) : existing.rightsStatus,
    reusable: typeof patch.reusable === 'boolean' ? patch.reusable : existing.reusable,
    expiresAt: patch.expiresAt === undefined ? existing.expiresAt : patch.expiresAt,
    evidence: patch.evidence?.trim().slice(0, 2000) || existing.evidence,
    tags: patch.tags ? cleanTags(patch.tags) : existing.tags,
    updatedAt: new Date().toISOString(),
  };

  if (redis) {
    try {
      await redis.hset(recordKey('asset', orgId, assetId), next as unknown as Record<string, unknown>);
      return next;
    } catch {
      // fall through to memory
    }
  }

  stores().assets.set(`${orgId}:${assetId}`, next);
  return next;
}

export async function updateContentAssetDelivery(
  orgId: string,
  assetId: string,
  patch: Partial<Pick<ContentAssetRecord, 'deliveryStatus' | 'clientReviewUrl' | 'clientApprovedAt' | 'revisionReason' | 'evidence' | 'tags'>>,
): Promise<ContentAssetRecord | null> {
  const existing = await getContentAsset(orgId, assetId);
  if (!existing) return null;

  const deliveryStatus = patch.deliveryStatus ? normalizeDeliveryStatus(patch.deliveryStatus) : existing.deliveryStatus;
  const now = new Date().toISOString();
  const clientApprovedAt = deliveryStatus === 'approved'
    ? (patch.clientApprovedAt?.trim() || existing.clientApprovedAt || now)
    : patch.clientApprovedAt === undefined
      ? existing.clientApprovedAt
      : patch.clientApprovedAt?.trim() || undefined;
  const next: ContentAssetRecord = {
    ...existing,
    deliveryStatus,
    clientReviewUrl: patch.clientReviewUrl === undefined ? existing.clientReviewUrl : patch.clientReviewUrl?.trim().slice(0, 1000),
    clientApprovedAt,
    revisionReason: patch.revisionReason === undefined ? existing.revisionReason : patch.revisionReason?.trim().slice(0, 1000),
    evidence: patch.evidence?.trim().slice(0, 2000) || existing.evidence,
    tags: patch.tags ? cleanTags(patch.tags) : existing.tags,
    updatedAt: now,
  };

  if (redis) {
    try {
      await redis.hset(recordKey('asset', orgId, assetId), next as unknown as Record<string, unknown>);
      return next;
    } catch {
      // fall through to memory
    }
  }

  stores().assets.set(`${orgId}:${assetId}`, next);
  return next;
}

export async function addDistributionPlan(orgId: string, input: Partial<DistributionPlanRecord>): Promise<DistributionPlanRecord> {
  const now = new Date().toISOString();
  const projectId = normalizeProjectId(input.projectId);
  const id = input.id || genId('plan');
  const channel = input.channel?.trim().slice(0, 80) || 'manual-channel';
  const record: DistributionPlanRecord = {
    id,
    orgId,
    projectId,
    channel,
    assetIds: Array.isArray(input.assetIds) ? input.assetIds.map(String).filter(Boolean).slice(0, 50) : [],
    status: input.status || 'draft',
    scheduledAt: input.scheduledAt,
    owner: input.owner?.trim().slice(0, 120),
    utmCode: input.utmCode?.trim().slice(0, 160) || `wenai_${projectId}_${channel}`.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 160),
    returnMetric: input.returnMetric?.trim().slice(0, 160) || 'CTR / CPC / orders / revenue',
    nextReviewAt: input.nextReviewAt,
    createdAt: now,
    updatedAt: now,
  };

  if (redis) {
    try {
      await redis.hset(recordKey('plan', orgId, id), record as unknown as Record<string, unknown>);
      await redis.lpush(scopedListKey('plan', orgId, projectId), id);
      await redis.ltrim(scopedListKey('plan', orgId, projectId), 0, 499);
      return record;
    } catch {
      // fall through to memory
    }
  }

  const store = stores();
  store.plans.set(`${orgId}:${id}`, record);
  const key = `${orgId}:${projectId}`;
  const list = store.planLists.get(key) || [];
  store.planLists.set(key, [id, ...list.filter(item => item !== id)].slice(0, 500));
  return record;
}

export async function listDistributionPlans(orgId: string, projectId = 'default-project', limit = 100): Promise<DistributionPlanRecord[]> {
  const normalizedProjectId = normalizeProjectId(projectId);
  if (redis) {
    try {
      const ids = await redis.lrange(scopedListKey('plan', orgId, normalizedProjectId), 0, limit - 1);
      const records = await Promise.all(ids.map(async id => {
        const raw = await redis!.hgetall(recordKey('plan', orgId, id));
        return raw && Object.keys(raw).length > 0 ? raw as unknown as DistributionPlanRecord : null;
      }));
      return records.filter(Boolean) as DistributionPlanRecord[];
    } catch {
      return [];
    }
  }

  const store = stores();
  const ids = store.planLists.get(`${orgId}:${normalizedProjectId}`) || [];
  return ids.slice(0, limit).map(id => store.plans.get(`${orgId}:${id}`)).filter(Boolean) as DistributionPlanRecord[];
}

export async function getDistributionPlan(orgId: string, planId: string): Promise<DistributionPlanRecord | null> {
  if (redis) {
    try {
      const raw = await redis.hgetall(recordKey('plan', orgId, planId));
      return raw && Object.keys(raw).length > 0 ? raw as unknown as DistributionPlanRecord : null;
    } catch {
      return null;
    }
  }

  return stores().plans.get(`${orgId}:${planId}`) || null;
}

export async function updateDistributionPlanAssets(
  orgId: string,
  planId: string,
  assetIds: string[],
): Promise<DistributionPlanRecord | null> {
  const existing = await getDistributionPlan(orgId, planId);
  if (!existing) return null;

  const next: DistributionPlanRecord = {
    ...existing,
    assetIds: Array.from(new Set([...existing.assetIds, ...assetIds.map(String).filter(Boolean)])).slice(0, 50),
    updatedAt: new Date().toISOString(),
  };

  if (redis) {
    try {
      await redis.hset(recordKey('plan', orgId, planId), next as unknown as Record<string, unknown>);
      return next;
    } catch {
      // fall through to memory
    }
  }
  stores().plans.set(`${orgId}:${planId}`, next);
  return next;
}

export async function updateDistributionPlanStatus(
  orgId: string,
  planId: string,
  status: DistributionPlanStatus,
): Promise<DistributionPlanRecord | null> {
  const existing = await getDistributionPlan(orgId, planId);
  if (!existing) return null;

  const next: DistributionPlanRecord = {
    ...existing,
    status,
    updatedAt: new Date().toISOString(),
  };

  if (redis) {
    try {
      await redis.hset(recordKey('plan', orgId, planId), next as unknown as Record<string, unknown>);
      return next;
    } catch {
      // fall through to memory
    }
  }
  stores().plans.set(`${orgId}:${planId}`, next);
  return next;
}

export async function createDistributionDispatch(
  orgId: string,
  input: Partial<DistributionDispatchRecord> & { planId?: string },
): Promise<DistributionDispatchRecord> {
  const now = new Date().toISOString();
  const plan = input.planId ? await getDistributionPlan(orgId, input.planId) : null;
  const projectId = normalizeProjectId(input.projectId || plan?.projectId);
  const channel = (input.channel || plan?.channel || 'manual-channel').trim().slice(0, 80);
  const providerConfigured = Boolean(input.providerAdapter?.configured);
  const providerMode = input.providerAdapter?.mode || (providerConfigured ? 'provider' : 'manual');
  const fallbackStatus = providerMode === 'provider' && !providerConfigured ? 'provider_gated' : 'manual_ready';
  const record: DistributionDispatchRecord = {
    id: input.id || genId('dispatch'),
    orgId,
    projectId,
    planId: input.planId || plan?.id || 'manual-plan',
    channel,
    status: normalizeDispatchStatus(input.status || fallbackStatus),
    handoffPackage: {
      assetIds: input.handoffPackage?.assetIds?.map(String).filter(Boolean).slice(0, 50) || plan?.assetIds || [],
      utmCode: input.handoffPackage?.utmCode?.trim().slice(0, 160) || plan?.utmCode || `wenai_${projectId}_${channel}`.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 160),
      returnMetric: input.handoffPackage?.returnMetric?.trim().slice(0, 160) || plan?.returnMetric || 'CTR / CPC / orders / revenue',
      owner: input.handoffPackage?.owner?.trim().slice(0, 120) || plan?.owner,
      scheduledAt: input.handoffPackage?.scheduledAt || plan?.scheduledAt,
      checklist: input.handoffPackage?.checklist?.map(String).filter(Boolean).slice(0, 20) || [
        'Export creative files and copy deck',
        'Attach UTM code to every platform link',
        'Publish or hand off to channel operator',
        'Capture evidence URL after publish',
        'Import performance CSV before next review',
      ],
    },
    providerAdapter: {
      mode: providerMode,
      configured: providerConfigured,
      providerName: input.providerAdapter?.providerName?.trim().slice(0, 80),
      blocker: input.providerAdapter?.blocker?.trim().slice(0, 240)
        || (providerConfigured ? undefined : 'No platform publishing adapter configured; manual handoff package is required.'),
    },
    evidenceUrls: cleanStrings(input.evidenceUrls),
    resultUrls: cleanStrings(input.resultUrls),
    notes: input.notes?.trim().slice(0, 1000),
    createdAt: now,
    updatedAt: now,
  };

  if (redis) {
    try {
      await redis.hset(recordKey('dispatch', orgId, record.id), record as unknown as Record<string, unknown>);
      await redis.lpush(scopedListKey('dispatch', orgId, projectId), record.id);
      await redis.ltrim(scopedListKey('dispatch', orgId, projectId), 0, 499);
      if (plan?.id && record.status !== 'provider_gated' && record.status !== 'blocked' && plan.status === 'draft') {
        await updateDistributionPlanStatus(orgId, plan.id, 'ready');
      }
      return record;
    } catch {
      // fall through to memory
    }
  }

  const store = stores();
  store.dispatches.set(`${orgId}:${record.id}`, record);
  const key = `${orgId}:${projectId}`;
  const list = store.dispatchLists.get(key) || [];
  store.dispatchLists.set(key, [record.id, ...list.filter(item => item !== record.id)].slice(0, 500));
  if (plan?.id && record.status !== 'provider_gated' && record.status !== 'blocked' && plan.status === 'draft') {
    await updateDistributionPlanStatus(orgId, plan.id, 'ready');
  }
  return record;
}

export async function listDistributionDispatches(orgId: string, projectId = 'default-project', limit = 100): Promise<DistributionDispatchRecord[]> {
  const normalizedProjectId = normalizeProjectId(projectId);
  if (redis) {
    try {
      const ids = await redis.lrange(scopedListKey('dispatch', orgId, normalizedProjectId), 0, limit - 1);
      const records = await Promise.all(ids.map(async id => {
        const raw = await redis!.hgetall(recordKey('dispatch', orgId, id));
        return raw && Object.keys(raw).length > 0 ? raw as unknown as DistributionDispatchRecord : null;
      }));
      return records.filter(Boolean) as DistributionDispatchRecord[];
    } catch {
      return [];
    }
  }

  const store = stores();
  const ids = store.dispatchLists.get(`${orgId}:${normalizedProjectId}`) || [];
  return ids.slice(0, limit).map(id => store.dispatches.get(`${orgId}:${id}`)).filter(Boolean) as DistributionDispatchRecord[];
}

export async function getDistributionDispatch(orgId: string, dispatchId: string): Promise<DistributionDispatchRecord | null> {
  if (redis) {
    try {
      const raw = await redis.hgetall(recordKey('dispatch', orgId, dispatchId));
      return raw && Object.keys(raw).length > 0 ? raw as unknown as DistributionDispatchRecord : null;
    } catch {
      return null;
    }
  }

  return stores().dispatches.get(`${orgId}:${dispatchId}`) || null;
}

export async function updateDistributionDispatch(
  orgId: string,
  dispatchId: string,
  patch: Partial<Pick<DistributionDispatchRecord, 'status' | 'evidenceUrls' | 'resultUrls' | 'notes'>> & { assetIds?: string[] },
): Promise<DistributionDispatchRecord | null> {
  const existing = await getDistributionDispatch(orgId, dispatchId);
  if (!existing) return null;

  const next: DistributionDispatchRecord = {
    ...existing,
    status: normalizeDispatchStatus(patch.status || existing.status),
    handoffPackage: {
      ...existing.handoffPackage,
      assetIds: patch.assetIds
        ? Array.from(new Set([...existing.handoffPackage.assetIds, ...patch.assetIds.map(String).filter(Boolean)])).slice(0, 50)
        : existing.handoffPackage.assetIds,
    },
    evidenceUrls: patch.evidenceUrls ? cleanStrings(patch.evidenceUrls) : existing.evidenceUrls,
    resultUrls: patch.resultUrls ? cleanStrings(patch.resultUrls) : existing.resultUrls,
    notes: patch.notes?.trim().slice(0, 1000) || existing.notes,
    updatedAt: new Date().toISOString(),
  };
  const nextPlanStatus = next.status === 'measured'
    ? 'measured'
    : next.status === 'published'
      ? 'published'
      : undefined;

  if (redis) {
    try {
      await redis.hset(recordKey('dispatch', orgId, dispatchId), next as unknown as Record<string, unknown>);
      if (nextPlanStatus) await updateDistributionPlanStatus(orgId, next.planId, nextPlanStatus);
      return next;
    } catch {
      // fall through to memory
    }
  }
  stores().dispatches.set(`${orgId}:${dispatchId}`, next);
  if (nextPlanStatus) await updateDistributionPlanStatus(orgId, next.planId, nextPlanStatus);
  return next;
}

export async function addPerformanceReturn(
  orgId: string,
  input: {
    projectId?: string;
    dispatchId?: string;
    source?: IndustrialPerformanceRecord['source'];
    report: PerformanceImportReport;
    assetMatchSummary?: IndustrialAssetMatchSummary;
  },
): Promise<IndustrialPerformanceRecord> {
  const projectId = normalizeProjectId(input.projectId);
  const assetMatchSummary = cleanAssetMatchSummary(input.assetMatchSummary);
  const record: IndustrialPerformanceRecord = {
    id: genId('perf'),
    orgId,
    projectId,
    dispatchId: input.dispatchId,
    source: input.source || 'api',
    rowCount: input.report.rows.length,
    summary: input.report.summary,
    decisions: input.report.decisions.slice(0, 100),
    ...(assetMatchSummary ? { assetMatchSummary } : {}),
    importedAt: new Date().toISOString(),
  };

  if (redis) {
    try {
      await redis.hset(recordKey('performance', orgId, record.id), record as unknown as Record<string, unknown>);
      await redis.lpush(scopedListKey('performance', orgId, projectId), record.id);
      await redis.ltrim(scopedListKey('performance', orgId, projectId), 0, 499);
      return record;
    } catch {
      // fall through to memory
    }
  }

  const store = stores();
  store.performance.set(`${orgId}:${record.id}`, record);
  const key = `${orgId}:${projectId}`;
  const list = store.performanceLists.get(key) || [];
  store.performanceLists.set(key, [record.id, ...list.filter(item => item !== record.id)].slice(0, 500));
  return record;
}

export async function listPerformanceReturns(orgId: string, projectId = 'default-project', limit = 100): Promise<IndustrialPerformanceRecord[]> {
  const normalizedProjectId = normalizeProjectId(projectId);
  if (redis) {
    try {
      const ids = await redis.lrange(scopedListKey('performance', orgId, normalizedProjectId), 0, limit - 1);
      const records = await Promise.all(ids.map(async id => {
        const raw = await redis!.hgetall(recordKey('performance', orgId, id));
        return raw && Object.keys(raw).length > 0 ? raw as unknown as IndustrialPerformanceRecord : null;
      }));
      return records.filter(Boolean) as IndustrialPerformanceRecord[];
    } catch {
      return [];
    }
  }

  const store = stores();
  const ids = store.performanceLists.get(`${orgId}:${normalizedProjectId}`) || [];
  return ids.slice(0, limit).map(id => store.performance.get(`${orgId}:${id}`)).filter(Boolean) as IndustrialPerformanceRecord[];
}

export async function getIndustrializationSnapshot(orgId: string, projectId = 'default-project'): Promise<IndustrializationSnapshot> {
  const [assets, plans, dispatches, performanceReturns] = await Promise.all([
    listContentAssets(orgId, projectId, 200),
    listDistributionPlans(orgId, projectId, 200),
    listDistributionDispatches(orgId, projectId, 200),
    listPerformanceReturns(orgId, projectId, 200),
  ]);
  const readyPlanCount = plans.filter(plan => plan.status === 'ready' || plan.status === 'published' || plan.status === 'measured').length;
  const draftPlanCount = plans.filter(plan => plan.status === 'draft').length;
  const executableDispatchCount = dispatches.filter(dispatch => ['manual_ready', 'queued', 'published', 'measured'].includes(dispatch.status)).length;
  const publishedDispatchCount = dispatches.filter(dispatch => dispatch.status === 'published' || dispatch.status === 'measured').length;
  const publishedWithEvidenceCount = dispatches.filter(dispatch =>
    (dispatch.status === 'published' || dispatch.status === 'measured') && dispatch.evidenceUrls.length > 0,
  ).length;
  const missingPublishEvidenceCount = dispatches.filter(dispatch =>
    (dispatch.status === 'published' || dispatch.status === 'measured') && dispatch.evidenceUrls.length === 0,
  ).length;
  const nowMs = Date.now();
  const overdueReviewDispatchCount = dispatches.filter(dispatch => {
    if (dispatch.status !== 'published') return false;
    const nextReviewAt = plans.find(plan => plan.id === dispatch.planId)?.nextReviewAt;
    if (!nextReviewAt) return false;
    const time = Date.parse(nextReviewAt);
    return Number.isFinite(time) && time < nowMs;
  }).length;
  const measuredDispatchCount = dispatches.filter(dispatch => dispatch.status === 'measured').length;
  const scaleDecisionCount = performanceReturns.reduce((sum, item) => sum + item.summary.scaleCount, 0);
  const assetMatchAmbiguousCount = performanceReturns.reduce((sum, item) => sum + (item.assetMatchSummary?.ambiguousCount || 0), 0);
  const assetMatchUnmatchedCount = performanceReturns.reduce((sum, item) => sum + (item.assetMatchSummary?.unmatchedCount || 0), 0);
  const assetMatchIssueCount = assetMatchAmbiguousCount + assetMatchUnmatchedCount;
  const reportAssetCount = assets.filter(asset => asset.type === 'report').length;
  const deliverableAssets = assets.filter(asset =>
    (asset.type === 'image' || asset.type === 'video') &&
    (asset.source === 'kuaizi-production-result' || asset.tags.includes('production-result')),
  );
  const deliverableAssetCount = deliverableAssets.length;
  const clientReviewAssetCount = deliverableAssets.filter(asset => asset.deliveryStatus === 'client_review' || Boolean(asset.clientReviewUrl)).length;
  const approvedDeliverableCount = deliverableAssets.filter(asset => asset.deliveryStatus === 'approved' && Boolean(asset.clientApprovedAt)).length;
  const revisionRequestedCount = deliverableAssets.filter(asset => asset.deliveryStatus === 'revision_requested').length;
  const deliveryIssueCount = deliverableAssets.filter(asset =>
    asset.deliveryStatus !== 'approved' || !asset.clientApprovedAt,
  ).length;
  const approvedAssetCount = assets.filter(asset => (asset.approvalStatus || 'approved') === 'approved').length;
  const reusableAssetCount = assets.filter(asset => asset.reusable !== false).length;
  const blockedAssetCount = assets.filter(asset => (asset.approvalStatus || 'approved') === 'blocked').length;
  const rightsIssueAssetCount = assets.filter(asset => ['needs_review', 'expired'].includes(asset.rightsStatus || 'owned')).length;
  const executablePlanAssetIds = new Set(plans
    .filter(plan => plan.status === 'ready' || plan.status === 'published' || plan.status === 'measured')
    .flatMap(plan => plan.assetIds));
  const assetGovernanceIssueCount = assets.filter(asset =>
    executablePlanAssetIds.has(asset.id) &&
    ((asset.approvalStatus || 'approved') !== 'approved' || ['needs_review', 'expired'].includes(asset.rightsStatus || 'owned')),
  ).length;
  const reportAssetIds = new Set(assets.filter(asset => asset.type === 'report').map(asset => asset.id));
  const nextRoundAssetPlanCount = plans.filter(plan =>
    plan.status === 'draft' &&
    plan.assetIds.some(assetId => reportAssetIds.has(assetId)) &&
    plan.assetIds.some(assetId => !reportAssetIds.has(assetId)),
  ).length;
  const hasBrief = assets.some(asset => asset.type === 'brief' || asset.type === 'script' || asset.type === 'production_handoff');
  const hasVisual = assets.some(asset => asset.type === 'image' || asset.type === 'video');
  const hasBenchmark = assets.some(asset => asset.type === 'benchmark');
  const missingLinks = [
    !hasBrief ? 'Missing production brief or script asset' : '',
    !hasVisual ? 'Missing image or video asset' : '',
    !hasBenchmark ? 'Missing benchmark evidence' : '',
    plans.length === 0 ? 'Missing distribution plan' : '',
    plans.length > 0 && readyPlanCount === 0 ? 'Distribution plan is not ready/published/measured' : '',
    plans.length > 0 && dispatches.length === 0 ? 'Missing distribution dispatch record' : '',
    dispatches.length > 0 && executableDispatchCount === 0 ? 'Distribution dispatch is blocked or provider-gated' : '',
    missingPublishEvidenceCount > 0 ? `Published dispatch missing evidence URL (${missingPublishEvidenceCount})` : '',
    overdueReviewDispatchCount > 0 ? `Published dispatch overdue for performance import (${overdueReviewDispatchCount})` : '',
    dispatches.length > 0 && measuredDispatchCount === 0 ? 'No dispatch has measured performance evidence yet' : '',
    measuredDispatchCount > 0 && performanceReturns.length === 0 ? 'Missing persisted performance return record' : '',
    performanceReturns.length > 0 && reportAssetCount === 0 ? 'Missing performance or CRM report asset' : '',
    deliverableAssetCount > 0 && approvedDeliverableCount < deliverableAssetCount
      ? `Production deliverables missing client approval (${approvedDeliverableCount}/${deliverableAssetCount})`
      : '',
    revisionRequestedCount > 0 ? `Production deliverables need revision (${revisionRequestedCount})` : '',
    assetGovernanceIssueCount > 0 ? `Distribution uses blocked or rights-unready asset (${assetGovernanceIssueCount})` : '',
    scaleDecisionCount > 0 && assetMatchIssueCount > 0
      ? `Unresolved performance asset attribution (ambiguous=${assetMatchAmbiguousCount}; unmatched=${assetMatchUnmatchedCount})`
      : '',
    scaleDecisionCount > 0 && draftPlanCount === 0 ? 'Missing next-round draft distribution plan for scale decisions' : '',
    scaleDecisionCount > 0 && nextRoundAssetPlanCount < scaleDecisionCount
      ? `Missing winning asset reuse in next-round distribution plan (${nextRoundAssetPlanCount}/${scaleDecisionCount})`
      : '',
  ].filter(Boolean);

  return {
    orgId,
    projectId: normalizeProjectId(projectId),
    assetCount: assets.length,
    reportAssetCount,
    approvedAssetCount,
    reusableAssetCount,
    blockedAssetCount,
    rightsIssueAssetCount,
    assetGovernanceIssueCount,
    deliverableAssetCount,
    clientReviewAssetCount,
    approvedDeliverableCount,
    revisionRequestedCount,
    deliveryIssueCount,
    planCount: plans.length,
    draftPlanCount,
    nextRoundAssetPlanCount,
    readyPlanCount,
    dispatchCount: dispatches.length,
    executableDispatchCount,
    publishedDispatchCount,
    publishedWithEvidenceCount,
    missingPublishEvidenceCount,
    overdueReviewDispatchCount,
    measuredDispatchCount,
    performanceReturnCount: performanceReturns.length,
    scaleDecisionCount,
    assetMatchAmbiguousCount,
    assetMatchUnmatchedCount,
    assetMatchIssueCount,
    missingLinks,
    nextActions: missingLinks.length > 0
      ? missingLinks.map(item => `Close gap: ${item}`)
      : ['Import performance CSV and generate the next scale / iterate / pause decision.'],
  };
}

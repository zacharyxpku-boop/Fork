export type AssetPrincipalRole = 'owner' | 'admin' | 'creative' | 'distribution' | 'analytics' | 'crm' | 'client';
export type AssetPermissionScope = 'private' | 'project' | 'org' | 'client_review' | 'public';
export type AssetPermissionAction = 'view' | 'download' | 'share' | 'approve' | 'publish';
export type AssetStorageProvider = 'inline' | 'external';
export type AssetStorageStatus = 'available' | 'revoked' | 'missing';
export type AssetAccessGrantStatus = 'active' | 'revoked' | 'expired' | 'exhausted';
export type AssetDlpScanStatus = 'pending' | 'passed' | 'failed' | 'waived';

export interface AssetPermissionRecord {
  id: string;
  orgId: string;
  projectId: string;
  assetId: string;
  owner: string;
  scope: AssetPermissionScope;
  roles: AssetPrincipalRole[];
  allowedActions: AssetPermissionAction[];
  expiresAt?: string;
  auditTrail: Array<{
    id: string;
    actor: string;
    action: string;
    note: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AssetPermissionAccessAuditEvent {
  id: string;
  orgId: string;
  projectId: string;
  assetId: string;
  action: AssetPermissionAction;
  role?: AssetPrincipalRole;
  actor: string;
  operation: string;
  allowed: boolean;
  reason: string;
  permissionRecordId?: string;
  createdAt: string;
}

export interface AssetStorageObjectRecord {
  id: string;
  orgId: string;
  projectId: string;
  assetId: string;
  provider: AssetStorageProvider;
  objectKey: string;
  contentType: string;
  byteSize: number;
  checksum?: string;
  inlineContent?: string;
  downloadUrl?: string;
  shareUrl?: string;
  status: AssetStorageStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AssetAccessGrantRecord {
  id: string;
  token: string;
  orgId: string;
  projectId: string;
  assetId: string;
  action: Extract<AssetPermissionAction, 'download' | 'share'>;
  role?: AssetPrincipalRole;
  actor: string;
  objectKey?: string;
  expiresAt: string;
  maxUses: number;
  useCount: number;
  revokedAt?: string;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssetSecurityPolicyRecord {
  id: string;
  orgId: string;
  projectId: string;
  assetId: string;
  watermarkRequired: boolean;
  watermarkApplied: boolean;
  dlpScanStatus: AssetDlpScanStatus;
  publicShareAllowed: boolean;
  retentionDays: number;
  piiRiskNotes: string[];
  auditTrail: Array<{
    id: string;
    actor: string;
    note: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AssetPermissionSnapshot {
  orgId: string;
  projectId: string;
  permissionRecordCount: number;
  governedAssetCount: number;
  shareableAssetCount: number;
  downloadableAssetCount: number;
  storageObjectCount: number;
  downloadableObjectCount: number;
  shareableObjectCount: number;
  missingStorageObjectCount: number;
  activeAccessGrantCount: number;
  expiredAccessGrantCount: number;
  revokedAccessGrantCount: number;
  expiredPermissionCount: number;
  clientReviewScopeCount: number;
  securityPolicyCount: number;
  watermarkRequiredCount: number;
  watermarkAppliedCount: number;
  dlpPassedPolicyCount: number;
  dlpFailedPolicyCount: number;
  publicShareBlockedCount: number;
  retentionPolicyCount: number;
  auditEventCount: number;
  accessAuditEventCount: number;
  downloadableAccessReadyCount: number;
  shareableAccessReadyCount: number;
  assetAccessStates: AssetPermissionAccessState[];
  missingLinks: string[];
  nextActions: string[];
}

export interface AssetPermissionAccessResult {
  allowed: boolean;
  reason: string;
  record?: AssetPermissionRecord;
}

export interface AssetObjectAccessResult {
  allowed: boolean;
  reason: string;
  object?: AssetStorageObjectRecord;
  securityPolicy?: AssetSecurityPolicyRecord;
}

export interface AssetAccessGrantResult {
  allowed: boolean;
  reason: string;
  grant?: AssetAccessGrantRecord;
}

export interface AssetStorageProviderAccessResult {
  status: 'completed' | 'blocked' | 'failed';
  action: Extract<AssetPermissionAction, 'download' | 'share'>;
  provider: AssetStorageProvider;
  objectKey?: string;
  url?: string;
  expiresAt?: string;
  providerStatus?: number;
  blockedReasons: string[];
}

export interface AssetPermissionAccessState {
  assetId: string;
  hasActivePermission: boolean;
  canDownload: boolean;
  canShare: boolean;
  hasStorageObject: boolean;
  hasSecurityPolicy: boolean;
  hasActiveDownloadGrant: boolean;
  hasActiveShareGrant: boolean;
  downloadableAccessReady: boolean;
  shareableAccessReady: boolean;
  blockers: string[];
}

export interface AssetPermissionBatchAccessResult {
  allowed: boolean;
  action: AssetPermissionAction;
  role?: AssetPrincipalRole;
  results: Array<AssetPermissionAccessResult & { assetId: string }>;
  deniedAssetIds: string[];
}

export interface AssetSecurityPolicyAccessResult {
  allowed: boolean;
  reason: string;
  securityPolicy?: AssetSecurityPolicyRecord;
}

export function assetPermissionDenyMessage(action: AssetPermissionAction): string {
  if (action === 'download') return '当前角色没有下载该资产的权限，请先由运营或资产 owner 授权。';
  if (action === 'share') return '当前角色没有公开分享这些资产的权限，请先补齐企业资产授权。';
  if (action === 'publish') return '当前分发动作缺少资产发布权限，系统已阻止写回发布状态。';
  if (action === 'approve') return '当前角色没有批准该资产的权限。';
  return '当前角色没有查看该资产的权限。';
}

type PermissionGlobal = typeof globalThis & {
  __wenaiAssetPermissions?: Map<string, AssetPermissionRecord>;
  __wenaiAssetPermissionLists?: Map<string, string[]>;
  __wenaiAssetPermissionAccessAudits?: Map<string, AssetPermissionAccessAuditEvent[]>;
  __wenaiAssetStorageObjects?: Map<string, AssetStorageObjectRecord>;
  __wenaiAssetStorageObjectLists?: Map<string, string[]>;
  __wenaiAssetAccessGrants?: Map<string, AssetAccessGrantRecord>;
  __wenaiAssetAccessGrantLists?: Map<string, string[]>;
  __wenaiAssetSecurityPolicies?: Map<string, AssetSecurityPolicyRecord>;
  __wenaiAssetSecurityPolicyLists?: Map<string, string[]>;
};

function stores() {
  const target = globalThis as PermissionGlobal;
  if (!target.__wenaiAssetPermissions) target.__wenaiAssetPermissions = new Map();
  if (!target.__wenaiAssetPermissionLists) target.__wenaiAssetPermissionLists = new Map();
  if (!target.__wenaiAssetPermissionAccessAudits) target.__wenaiAssetPermissionAccessAudits = new Map();
  if (!target.__wenaiAssetStorageObjects) target.__wenaiAssetStorageObjects = new Map();
  if (!target.__wenaiAssetStorageObjectLists) target.__wenaiAssetStorageObjectLists = new Map();
  if (!target.__wenaiAssetAccessGrants) target.__wenaiAssetAccessGrants = new Map();
  if (!target.__wenaiAssetAccessGrantLists) target.__wenaiAssetAccessGrantLists = new Map();
  if (!target.__wenaiAssetSecurityPolicies) target.__wenaiAssetSecurityPolicies = new Map();
  if (!target.__wenaiAssetSecurityPolicyLists) target.__wenaiAssetSecurityPolicyLists = new Map();
  return {
    records: target.__wenaiAssetPermissions,
    lists: target.__wenaiAssetPermissionLists,
    accessAudits: target.__wenaiAssetPermissionAccessAudits,
    storageObjects: target.__wenaiAssetStorageObjects,
    storageObjectLists: target.__wenaiAssetStorageObjectLists,
    accessGrants: target.__wenaiAssetAccessGrants,
    accessGrantLists: target.__wenaiAssetAccessGrantLists,
    securityPolicies: target.__wenaiAssetSecurityPolicies,
    securityPolicyLists: target.__wenaiAssetSecurityPolicyLists,
  };
}

function genId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function scopedListKey(orgId: string, projectId: string) {
  return `${orgId}:${projectId}`;
}

function cleanString(value: unknown, fallback: string, limit = 160) {
  return (typeof value === 'string' ? value : fallback).trim().slice(0, limit) || fallback;
}

function cleanOptionalString(value: unknown, limit = 1000) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, limit) : undefined;
}

function cleanEnumList<T extends string>(value: unknown, allowed: readonly T[], fallback: T[], limit = 12): T[] {
  if (!Array.isArray(value)) return fallback;
  const clean = value.filter(item => allowed.includes(item as T)) as T[];
  return Array.from(new Set(clean)).slice(0, limit);
}

function normalizeScope(value: unknown): AssetPermissionScope {
  const allowed: AssetPermissionScope[] = ['private', 'project', 'org', 'client_review', 'public'];
  return allowed.includes(value as AssetPermissionScope) ? value as AssetPermissionScope : 'project';
}

function normalizeStorageProvider(value: unknown): AssetStorageProvider {
  return value === 'external' ? 'external' : 'inline';
}

function normalizeStorageStatus(value: unknown): AssetStorageStatus {
  if (value === 'revoked' || value === 'missing') return value;
  return 'available';
}

function normalizeDlpStatus(value: unknown): AssetDlpScanStatus {
  if (value === 'passed' || value === 'failed' || value === 'waived') return value;
  return 'pending';
}

function cleanRetentionDays(value: unknown) {
  const num = Math.floor(Number(value));
  return Number.isFinite(num) && num > 0 ? Math.min(num, 3650) : 365;
}

function cleanNotes(value: unknown, limit = 12) {
  if (!Array.isArray(value)) return [];
  return value.map(item => String(item).trim()).filter(Boolean).slice(0, limit);
}

function isExpired(value?: string) {
  if (!value) return false;
  const time = Date.parse(value);
  return Number.isFinite(time) && time < Date.now();
}

function byteSize(value: string) {
  return new TextEncoder().encode(value).length;
}

function grantToken() {
  return `wag_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}

function grantStatus(grant: AssetAccessGrantRecord): AssetAccessGrantStatus {
  if (grant.revokedAt) return 'revoked';
  if (Date.parse(grant.expiresAt) <= Date.now()) return 'expired';
  if (grant.useCount >= grant.maxUses) return 'exhausted';
  return 'active';
}

function grantExpiry(value: unknown) {
  const seconds = Number(value);
  const ttlSeconds = Number.isFinite(seconds) && seconds > 0
    ? Math.min(Math.floor(seconds), 7 * 24 * 60 * 60)
    : 60 * 60;
  return new Date(Date.now() + ttlSeconds * 1000).toISOString();
}

function storageProviderExpiry(value: unknown) {
  const seconds = Number(value);
  const ttlSeconds = Number.isFinite(seconds) && seconds > 0
    ? Math.min(Math.floor(seconds), 24 * 60 * 60)
    : 15 * 60;
  return new Date(Date.now() + ttlSeconds * 1000).toISOString();
}

export async function upsertAssetStorageObject(
  orgId: string,
  input: Partial<AssetStorageObjectRecord>,
): Promise<AssetStorageObjectRecord> {
  const store = stores();
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const assetId = cleanString(input.assetId, 'asset_id', 160);
  const id = input.id || `${projectId}:${assetId}:object`;
  const existing = store.storageObjects.get(`${orgId}:${id}`);
  const now = new Date().toISOString();
  const provider = normalizeStorageProvider(input.provider ?? existing?.provider);
  const inlineContent = cleanOptionalString(input.inlineContent ?? existing?.inlineContent, 30000);
  const downloadUrl = cleanOptionalString(input.downloadUrl ?? existing?.downloadUrl, 1000);
  const shareUrl = cleanOptionalString(input.shareUrl ?? existing?.shareUrl, 1000);
  const contentType = cleanString(input.contentType ?? existing?.contentType, provider === 'inline' ? 'application/json' : 'application/octet-stream', 120);
  const record: AssetStorageObjectRecord = {
    id,
    orgId,
    projectId,
    assetId,
    provider,
    objectKey: cleanString(input.objectKey ?? existing?.objectKey, `${projectId}/${assetId}`, 240),
    contentType,
    byteSize: Math.max(0, Math.floor(Number(input.byteSize ?? existing?.byteSize ?? byteSize(inlineContent || downloadUrl || shareUrl || '')))),
    checksum: cleanOptionalString(input.checksum ?? existing?.checksum, 160),
    inlineContent,
    downloadUrl,
    shareUrl,
    status: normalizeStorageStatus(input.status ?? existing?.status),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  store.storageObjects.set(`${orgId}:${id}`, record);
  const listKey = scopedListKey(orgId, projectId);
  const list = store.storageObjectLists.get(listKey) || [];
  store.storageObjectLists.set(listKey, [id, ...list.filter(item => item !== id)].slice(0, 500));
  return record;
}

export async function listAssetStorageObjects(orgId: string, projectId = 'default-project', limit = 100): Promise<AssetStorageObjectRecord[]> {
  const store = stores();
  const ids = store.storageObjectLists.get(scopedListKey(orgId, projectId)) || [];
  return ids.slice(0, limit).map(id => store.storageObjects.get(`${orgId}:${id}`)).filter(Boolean) as AssetStorageObjectRecord[];
}

export async function getAssetStorageObject(orgId: string, projectId: string, assetId: string): Promise<AssetStorageObjectRecord | undefined> {
  const objects = await listAssetStorageObjects(orgId, projectId, 500);
  return objects.find(object => object.assetId === assetId);
}

export async function createAssetAccessGrant(
  orgId: string,
  input: {
    projectId?: string;
    assetId: string;
    action: Extract<AssetPermissionAction, 'download' | 'share'>;
    role?: AssetPrincipalRole;
    actor?: string;
    expiresInSeconds?: number;
    maxUses?: number;
  },
): Promise<AssetAccessGrantRecord> {
  const store = stores();
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const assetId = cleanString(input.assetId, 'asset_id', 160);
  const object = await getAssetStorageObject(orgId, projectId, assetId);
  const now = new Date().toISOString();
  const token = grantToken();
  const grant: AssetAccessGrantRecord = {
    id: genId('asset_grant'),
    token,
    orgId,
    projectId,
    assetId,
    action: input.action,
    role: input.role,
    actor: cleanString(input.actor, input.role || 'system', 120),
    objectKey: object?.objectKey,
    expiresAt: grantExpiry(input.expiresInSeconds),
    maxUses: Math.max(1, Math.min(Math.floor(Number(input.maxUses || 1)), 100)),
    useCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  store.accessGrants.set(`${orgId}:${token}`, grant);
  const listKey = scopedListKey(orgId, projectId);
  const list = store.accessGrantLists.get(listKey) || [];
  store.accessGrantLists.set(listKey, [token, ...list.filter(item => item !== token)].slice(0, 1000));
  return grant;
}

export async function listAssetAccessGrants(orgId: string, projectId = 'default-project', limit = 100): Promise<AssetAccessGrantRecord[]> {
  const store = stores();
  const tokens = store.accessGrantLists.get(scopedListKey(orgId, projectId)) || [];
  return tokens.slice(0, limit).map(token => store.accessGrants.get(`${orgId}:${token}`)).filter(Boolean) as AssetAccessGrantRecord[];
}

export async function upsertAssetSecurityPolicy(
  orgId: string,
  input: Partial<AssetSecurityPolicyRecord> & { auditNote?: string; actor?: string },
): Promise<AssetSecurityPolicyRecord> {
  const store = stores();
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const assetId = cleanString(input.assetId, 'asset_id', 160);
  const id = input.id || `${projectId}:${assetId}:security`;
  const existing = store.securityPolicies.get(`${orgId}:${id}`);
  const now = new Date().toISOString();
  const auditTrail = existing?.auditTrail ? [...existing.auditTrail] : [];
  auditTrail.push({
    id: genId('security_audit'),
    actor: cleanString(input.actor, 'system', 120),
    note: cleanString(input.auditNote, existing ? 'Updated asset security policy.' : 'Created asset security policy.', 500),
    createdAt: now,
  });
  const record: AssetSecurityPolicyRecord = {
    id,
    orgId,
    projectId,
    assetId,
    watermarkRequired: Boolean(input.watermarkRequired ?? existing?.watermarkRequired ?? true),
    watermarkApplied: Boolean(input.watermarkApplied ?? existing?.watermarkApplied ?? false),
    dlpScanStatus: normalizeDlpStatus(input.dlpScanStatus ?? existing?.dlpScanStatus),
    publicShareAllowed: Boolean(input.publicShareAllowed ?? existing?.publicShareAllowed ?? false),
    retentionDays: cleanRetentionDays(input.retentionDays ?? existing?.retentionDays),
    piiRiskNotes: cleanNotes(input.piiRiskNotes ?? existing?.piiRiskNotes),
    auditTrail: auditTrail.slice(-50),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  store.securityPolicies.set(`${orgId}:${id}`, record);
  const listKey = scopedListKey(orgId, projectId);
  const list = store.securityPolicyLists.get(listKey) || [];
  store.securityPolicyLists.set(listKey, [id, ...list.filter(item => item !== id)].slice(0, 500));
  return record;
}

export async function listAssetSecurityPolicies(orgId: string, projectId = 'default-project', limit = 100): Promise<AssetSecurityPolicyRecord[]> {
  const store = stores();
  const ids = store.securityPolicyLists.get(scopedListKey(orgId, projectId)) || [];
  return ids.slice(0, limit).map(id => store.securityPolicies.get(`${orgId}:${id}`)).filter(Boolean) as AssetSecurityPolicyRecord[];
}

export async function getAssetSecurityPolicy(orgId: string, projectId = 'default-project', assetId: string): Promise<AssetSecurityPolicyRecord | null> {
  const policies = await listAssetSecurityPolicies(orgId, projectId, 500);
  return policies.find(policy => policy.assetId === assetId) || null;
}

export async function evaluateAssetSecurityPolicyAccess(
  orgId: string,
  input: {
    projectId?: string;
    assetId: string;
    action: Extract<AssetPermissionAction, 'download' | 'share'>;
  },
): Promise<AssetSecurityPolicyAccessResult> {
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const securityPolicy = await getAssetSecurityPolicy(orgId, projectId, input.assetId);
  if (!securityPolicy) return { allowed: false, reason: 'missing_asset_security_policy' };
  if (securityPolicy.retentionDays <= 0) return { allowed: false, reason: 'asset_retention_policy_invalid', securityPolicy };
  if (securityPolicy.watermarkRequired && !securityPolicy.watermarkApplied) {
    return { allowed: false, reason: 'asset_watermark_required', securityPolicy };
  }
  if (securityPolicy.dlpScanStatus === 'pending') return { allowed: false, reason: 'asset_dlp_scan_pending', securityPolicy };
  if (securityPolicy.dlpScanStatus === 'failed') return { allowed: false, reason: 'asset_dlp_scan_failed', securityPolicy };
  if (input.action === 'share' && securityPolicy.publicShareAllowed && !['passed', 'waived'].includes(securityPolicy.dlpScanStatus)) {
    return { allowed: false, reason: 'asset_public_share_requires_dlp_pass', securityPolicy };
  }
  return { allowed: true, reason: 'allowed', securityPolicy };
}

export async function verifyAssetAccessGrant(
  orgId: string,
  input: {
    projectId?: string;
    assetId: string;
    action: Extract<AssetPermissionAction, 'download' | 'share'>;
    token?: string;
    role?: AssetPrincipalRole;
    consume?: boolean;
  },
): Promise<AssetAccessGrantResult> {
  if (!input.token) return { allowed: false, reason: 'missing_access_grant' };
  const store = stores();
  const grant = store.accessGrants.get(`${orgId}:${input.token}`);
  if (!grant) return { allowed: false, reason: 'access_grant_not_found' };
  const projectId = cleanString(input.projectId, 'default-project', 120);
  if (grant.projectId !== projectId || grant.assetId !== input.assetId || grant.action !== input.action) {
    return { allowed: false, reason: 'access_grant_scope_mismatch', grant };
  }
  if (input.role && grant.role && grant.role !== input.role) {
    return { allowed: false, reason: 'access_grant_role_mismatch', grant };
  }
  const status = grantStatus(grant);
  if (status !== 'active') return { allowed: false, reason: `access_grant_${status}`, grant };
  if (input.consume) {
    const now = new Date().toISOString();
    const next = { ...grant, useCount: grant.useCount + 1, lastUsedAt: now, updatedAt: now };
    store.accessGrants.set(`${orgId}:${grant.token}`, next);
    return { allowed: true, reason: 'allowed', grant: next };
  }
  return { allowed: true, reason: 'allowed', grant };
}

export async function revokeAssetAccessGrant(orgId: string, token: string): Promise<AssetAccessGrantRecord | null> {
  const store = stores();
  const existing = store.accessGrants.get(`${orgId}:${token}`);
  if (!existing) return null;
  const now = new Date().toISOString();
  const next = { ...existing, revokedAt: now, updatedAt: now };
  store.accessGrants.set(`${orgId}:${token}`, next);
  return next;
}

export async function evaluateAssetObjectAccess(
  orgId: string,
  input: {
    projectId?: string;
    assetId: string;
    action: Extract<AssetPermissionAction, 'download' | 'share'>;
  },
): Promise<AssetObjectAccessResult> {
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const object = await getAssetStorageObject(orgId, projectId, input.assetId);
  if (!object) return { allowed: false, reason: 'missing_storage_object' };
  if (object.status !== 'available') return { allowed: false, reason: `storage_object_${object.status}`, object };
  if (input.action === 'download' && object.provider === 'inline' && !object.inlineContent) return { allowed: false, reason: 'missing_inline_download_content', object };
  if (input.action === 'download' && object.provider === 'external' && !object.downloadUrl && !object.objectKey) return { allowed: false, reason: 'missing_external_download_reference', object };
  if (input.action === 'share' && !object.shareUrl && !object.downloadUrl && !object.inlineContent && !object.objectKey) return { allowed: false, reason: 'missing_shareable_object_reference', object };
  const securityAccess = await evaluateAssetSecurityPolicyAccess(orgId, {
    projectId,
    assetId: input.assetId,
    action: input.action,
  });
  if (!securityAccess.allowed) return { allowed: false, reason: securityAccess.reason, object, securityPolicy: securityAccess.securityPolicy };
  return { allowed: true, reason: 'allowed', object, securityPolicy: securityAccess.securityPolicy };
}

export async function executeAssetStorageProviderAccess(
  orgId: string,
  input: {
    projectId?: string;
    assetId: string;
    action: Extract<AssetPermissionAction, 'download' | 'share'>;
    expiresInSeconds?: number;
    providerEndpoint?: string;
    providerToken?: string;
    fetcher?: typeof fetch;
  },
): Promise<AssetStorageProviderAccessResult> {
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const object = await getAssetStorageObject(orgId, projectId, input.assetId);
  const objectAccess = await evaluateAssetObjectAccess(orgId, {
    projectId,
    assetId: input.assetId,
    action: input.action,
  });
  const providerEndpoint = cleanOptionalString(input.providerEndpoint || process.env.ASSET_STORAGE_SIGN_ENDPOINT, 1000);
  const providerToken = cleanOptionalString(input.providerToken || process.env.ASSET_STORAGE_SIGN_TOKEN, 1000);
  const expiresAt = storageProviderExpiry(input.expiresInSeconds);
  const blockedReasons = [
    !objectAccess.allowed ? objectAccess.reason : '',
    !object ? 'asset_storage_object_not_found' : '',
    object && object.status !== 'available' ? `asset_storage_object_${object.status}` : '',
    object && object.provider !== 'external' ? 'asset_storage_provider_not_external' : '',
    object && !object.objectKey ? 'asset_storage_object_key_missing' : '',
    !providerEndpoint ? 'asset_storage_sign_endpoint_not_configured' : '',
    !providerToken ? 'asset_storage_sign_token_not_configured' : '',
  ].filter(Boolean);

  if (blockedReasons.length > 0) {
    return {
      status: 'blocked',
      action: input.action,
      provider: object?.provider || 'external',
      objectKey: object?.objectKey,
      expiresAt,
      blockedReasons,
    };
  }

  try {
    const response = await (input.fetcher || fetch)(providerEndpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${providerToken}`,
      },
      body: JSON.stringify({
        action: 'asset-storage-sign',
        orgId,
        projectId,
        assetId: input.assetId,
        operation: input.action,
        objectKey: object!.objectKey,
        contentType: object!.contentType,
        byteSize: object!.byteSize,
        expiresAt,
      }),
    });

    if (!response.ok) {
      return {
        status: 'failed',
        action: input.action,
        provider: 'external',
        objectKey: object!.objectKey,
        expiresAt,
        providerStatus: response.status,
        blockedReasons: [`asset_storage_provider_http_${response.status}`],
      };
    }

    const payload = await response.json().catch(() => null) as { signedUrl?: unknown; downloadUrl?: unknown; shareUrl?: unknown; expiresAt?: unknown } | null;
    const url = cleanOptionalString(
      input.action === 'download'
        ? payload?.downloadUrl || payload?.signedUrl
        : payload?.shareUrl || payload?.signedUrl,
      1000,
    );
    if (!url) {
      return {
        status: 'failed',
        action: input.action,
        provider: 'external',
        objectKey: object!.objectKey,
        expiresAt,
        providerStatus: response.status,
        blockedReasons: ['asset_storage_provider_missing_signed_url'],
      };
    }

    return {
      status: 'completed',
      action: input.action,
      provider: 'external',
      objectKey: object!.objectKey,
      url,
      expiresAt: cleanOptionalString(payload?.expiresAt, 80) || expiresAt,
      providerStatus: response.status,
      blockedReasons: [],
    };
  } catch (error) {
    return {
      status: 'failed',
      action: input.action,
      provider: 'external',
      objectKey: object?.objectKey,
      expiresAt,
      blockedReasons: [error instanceof Error ? error.message : 'asset_storage_provider_sign_failed'],
    };
  }
}

export async function evaluateAssetPermissionAccess(
  orgId: string,
  input: {
    projectId?: string;
    assetId: string;
    action: AssetPermissionAction;
    role?: AssetPrincipalRole;
  },
): Promise<AssetPermissionAccessResult> {
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const records = await listAssetPermissions(orgId, projectId, 200);
  const candidates = records.filter(record => record.assetId === input.assetId);
  if (candidates.length === 0) {
    return { allowed: false, reason: 'missing_permission_record' };
  }
  const active = candidates.filter(record => !isExpired(record.expiresAt));
  if (active.length === 0) {
    return { allowed: false, reason: 'permission_expired', record: candidates[0] };
  }
  const actionRecord = active.find(record => record.allowedActions.includes(input.action));
  if (!actionRecord) {
    return { allowed: false, reason: 'action_not_allowed', record: active[0] };
  }
  if (input.role && !actionRecord.roles.includes(input.role)) {
    return { allowed: false, reason: 'role_not_allowed', record: actionRecord };
  }
  return { allowed: true, reason: 'allowed', record: actionRecord };
}

export async function evaluateAssetPermissionBatchAccess(
  orgId: string,
  input: {
    projectId?: string;
    assetIds: string[];
    action: AssetPermissionAction;
    role?: AssetPrincipalRole;
  },
): Promise<AssetPermissionBatchAccessResult> {
  const assetIds = Array.from(new Set(input.assetIds.map(item => String(item).trim()).filter(Boolean))).slice(0, 100);
  const results = await Promise.all(assetIds.map(async assetId => ({
    assetId,
    ...await evaluateAssetPermissionAccess(orgId, {
      projectId: input.projectId,
      assetId,
      action: input.action,
      role: input.role,
    }),
  })));
  const deniedAssetIds = results.filter(result => !result.allowed).map(result => result.assetId);
  return {
    allowed: deniedAssetIds.length === 0 && assetIds.length > 0,
    action: input.action,
    role: input.role,
    results,
    deniedAssetIds,
  };
}

export async function recordAssetPermissionAccessAudit(
  orgId: string,
  input: {
    projectId?: string;
    assetId: string;
    action: AssetPermissionAction;
    role?: AssetPrincipalRole;
    actor?: string;
    operation?: string;
    allowed: boolean;
    reason: string;
    record?: AssetPermissionRecord;
  },
): Promise<AssetPermissionAccessAuditEvent> {
  const store = stores();
  const now = new Date().toISOString();
  const projectId = cleanString(input.projectId, input.record?.projectId || 'default-project', 120);
  const assetId = cleanString(input.assetId, input.record?.assetId || 'asset_id', 160);
  const event: AssetPermissionAccessAuditEvent = {
    id: genId('access_audit'),
    orgId,
    projectId,
    assetId,
    action: input.action,
    role: input.role,
    actor: cleanString(input.actor, input.role || 'system', 120),
    operation: cleanString(input.operation, 'asset_operation', 120),
    allowed: Boolean(input.allowed),
    reason: cleanString(input.reason, input.allowed ? 'allowed' : 'denied', 160),
    permissionRecordId: input.record?.id,
    createdAt: now,
  };

  const listKey = scopedListKey(orgId, projectId);
  const events = store.accessAudits.get(listKey) || [];
  store.accessAudits.set(listKey, [event, ...events].slice(0, 1000));

  if (input.record) {
    const recordKey = `${orgId}:${input.record.id}`;
    const existing = store.records.get(recordKey);
    if (existing) {
      const auditTrail = [
        ...existing.auditTrail,
        {
          id: event.id,
          actor: event.actor,
          action: event.allowed ? 'asset_access_allowed' : 'asset_access_denied',
          note: `${event.operation}:${event.action}:${event.reason}`,
          createdAt: now,
        },
      ].slice(-50);
      store.records.set(recordKey, {
        ...existing,
        auditTrail,
        updatedAt: now,
      });
    }
  }

  return event;
}

export async function listAssetPermissionAccessAudits(
  orgId: string,
  projectId = 'default-project',
  limit = 100,
): Promise<AssetPermissionAccessAuditEvent[]> {
  const store = stores();
  return (store.accessAudits.get(scopedListKey(orgId, projectId)) || []).slice(0, limit);
}

export async function upsertAssetPermission(
  orgId: string,
  input: Partial<AssetPermissionRecord> & { auditNote?: string; actor?: string },
): Promise<AssetPermissionRecord> {
  const store = stores();
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const assetId = cleanString(input.assetId, 'asset_id', 160);
  const id = input.id || `${projectId}:${assetId}`;
  const existing = store.records.get(`${orgId}:${id}`);
  const now = new Date().toISOString();
  const roles = cleanEnumList(input.roles ?? existing?.roles, ['owner', 'admin', 'creative', 'distribution', 'analytics', 'crm', 'client'] as const, existing?.roles || ['owner']);
  const allowedActions = cleanEnumList(input.allowedActions ?? existing?.allowedActions, ['view', 'download', 'share', 'approve', 'publish'] as const, existing?.allowedActions || ['view']);
  const auditTrail = existing?.auditTrail ? [...existing.auditTrail] : [];
  auditTrail.push({
    id: genId('audit'),
    actor: cleanString(input.actor, 'system', 120),
    action: existing ? 'permission_updated' : 'permission_created',
    note: cleanString(input.auditNote, existing ? 'Updated asset permission policy.' : 'Created asset permission policy.', 500),
    createdAt: now,
  });
  const record: AssetPermissionRecord = {
    id,
    orgId,
    projectId,
    assetId,
    owner: cleanString(input.owner ?? existing?.owner, 'ops', 120),
    scope: normalizeScope(input.scope ?? existing?.scope),
    roles,
    allowedActions,
    expiresAt: cleanOptionalString(input.expiresAt ?? existing?.expiresAt, 80),
    auditTrail: auditTrail.slice(-50),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  store.records.set(`${orgId}:${id}`, record);
  const listKey = scopedListKey(orgId, projectId);
  const list = store.lists.get(listKey) || [];
  store.lists.set(listKey, [id, ...list.filter(item => item !== id)].slice(0, 500));
  return record;
}

export async function listAssetPermissions(orgId: string, projectId = 'default-project', limit = 100): Promise<AssetPermissionRecord[]> {
  const store = stores();
  const ids = store.lists.get(scopedListKey(orgId, projectId)) || [];
  return ids.slice(0, limit).map(id => store.records.get(`${orgId}:${id}`)).filter(Boolean) as AssetPermissionRecord[];
}

function securityPolicyReady(policy?: AssetSecurityPolicyRecord) {
  if (!policy) return false;
  if (policy.retentionDays <= 0) return false;
  if (policy.watermarkRequired && !policy.watermarkApplied) return false;
  if (policy.dlpScanStatus === 'pending' || policy.dlpScanStatus === 'failed') return false;
  if (policy.publicShareAllowed && policy.dlpScanStatus !== 'passed' && policy.dlpScanStatus !== 'waived') return false;
  return true;
}

function buildAssetAccessStates(input: {
  records: AssetPermissionRecord[];
  storageObjects: AssetStorageObjectRecord[];
  grants: AssetAccessGrantRecord[];
  securityPolicies: AssetSecurityPolicyRecord[];
}): AssetPermissionAccessState[] {
  const assetIds = new Set<string>();
  input.records.forEach(record => assetIds.add(record.assetId));
  input.storageObjects.forEach(object => assetIds.add(object.assetId));
  input.grants.forEach(grant => assetIds.add(grant.assetId));
  input.securityPolicies.forEach(policy => assetIds.add(policy.assetId));

  return Array.from(assetIds).sort().map(assetId => {
    const activeRecords = input.records.filter(record => record.assetId === assetId && !isExpired(record.expiresAt));
    const object = input.storageObjects.find(item => item.assetId === assetId && item.status === 'available');
    const policy = input.securityPolicies.find(item => item.assetId === assetId);
    const policyReady = securityPolicyReady(policy);
    const activeGrants = input.grants.filter(grant => grant.assetId === assetId && grantStatus(grant) === 'active');
    const canDownload = activeRecords.some(record => record.allowedActions.includes('download'));
    const canShare = activeRecords.some(record => record.allowedActions.includes('share'));
    const hasActiveDownloadGrant = activeGrants.some(grant => grant.action === 'download');
    const hasActiveShareGrant = activeGrants.some(grant => grant.action === 'share');
    const hasDownloadReference = Boolean(object && (object.inlineContent || object.downloadUrl || object.objectKey));
    const hasShareReference = Boolean(object && (object.shareUrl || object.downloadUrl || object.inlineContent || object.objectKey));
    const blockers = [
      activeRecords.length === 0 ? 'missing_active_permission' : '',
      !object ? 'missing_storage_object' : '',
      object && !hasDownloadReference && canDownload ? 'missing_download_reference' : '',
      object && !hasShareReference && canShare ? 'missing_share_reference' : '',
      !policy ? 'missing_security_policy' : '',
      policy && !policyReady ? 'security_policy_not_passed' : '',
      canDownload && !hasActiveDownloadGrant ? 'missing_download_grant' : '',
      canShare && !hasActiveShareGrant ? 'missing_share_grant' : '',
    ].filter(Boolean);

    return {
      assetId,
      hasActivePermission: activeRecords.length > 0,
      canDownload,
      canShare,
      hasStorageObject: Boolean(object),
      hasSecurityPolicy: Boolean(policy),
      hasActiveDownloadGrant,
      hasActiveShareGrant,
      downloadableAccessReady: canDownload && Boolean(object) && hasDownloadReference && policyReady && hasActiveDownloadGrant,
      shareableAccessReady: canShare && Boolean(object) && hasShareReference && policyReady && hasActiveShareGrant,
      blockers,
    };
  });
}

export async function getAssetPermissionSnapshot(orgId: string, projectId = 'default-project'): Promise<AssetPermissionSnapshot> {
  const [records, accessAudits, storageObjects, grants, securityPolicies] = await Promise.all([
    listAssetPermissions(orgId, projectId, 200),
    listAssetPermissionAccessAudits(orgId, projectId, 500),
    listAssetStorageObjects(orgId, projectId, 500),
    listAssetAccessGrants(orgId, projectId, 500),
    listAssetSecurityPolicies(orgId, projectId, 500),
  ]);
  const objectAssetIds = new Set(storageObjects.filter(object => object.status === 'available').map(object => object.assetId));
  const governedAssetCount = new Set(records.map(record => record.assetId)).size;
  const expiredPermissionCount = records.filter(record => isExpired(record.expiresAt)).length;
  const shareableAssetCount = records.filter(record =>
    record.allowedActions.includes('share') && !isExpired(record.expiresAt) && record.scope !== 'public',
  ).length;
  const downloadableAssetCount = records.filter(record =>
    record.allowedActions.includes('download') && !isExpired(record.expiresAt),
  ).length;
  const storageObjectCount = storageObjects.length;
  const downloadableObjectCount = storageObjects.filter(object => object.status === 'available' && (object.inlineContent || object.downloadUrl || object.objectKey)).length;
  const shareableObjectCount = storageObjects.filter(object => object.status === 'available' && (object.shareUrl || object.downloadUrl || object.inlineContent || object.objectKey)).length;
  const missingStorageObjectCount = records.filter(record =>
    !isExpired(record.expiresAt) &&
    (record.allowedActions.includes('download') || record.allowedActions.includes('share')) &&
    !objectAssetIds.has(record.assetId),
  ).length;
  const clientReviewScopeCount = records.filter(record => record.scope === 'client_review' && record.roles.includes('client')).length;
  const auditEventCount = records.reduce((sum, record) => sum + record.auditTrail.length, 0);
  const activeAccessGrantCount = grants.filter(grant => grantStatus(grant) === 'active').length;
  const expiredAccessGrantCount = grants.filter(grant => grantStatus(grant) === 'expired' || grantStatus(grant) === 'exhausted').length;
  const revokedAccessGrantCount = grants.filter(grant => grantStatus(grant) === 'revoked').length;
  const securityAssetIds = new Set(securityPolicies.map(policy => policy.assetId));
  const watermarkRequiredCount = securityPolicies.filter(policy => policy.watermarkRequired).length;
  const watermarkAppliedCount = securityPolicies.filter(policy => policy.watermarkRequired && policy.watermarkApplied).length;
  const dlpPassedPolicyCount = securityPolicies.filter(policy => policy.dlpScanStatus === 'passed' || policy.dlpScanStatus === 'waived').length;
  const dlpFailedPolicyCount = securityPolicies.filter(policy => policy.dlpScanStatus === 'failed').length;
  const publicShareBlockedCount = securityPolicies.filter(policy => !policy.publicShareAllowed).length;
  const retentionPolicyCount = securityPolicies.filter(policy => policy.retentionDays > 0).length;
  const assetAccessStates = buildAssetAccessStates({ records, storageObjects, grants, securityPolicies });
  const downloadableAccessReadyCount = assetAccessStates.filter(state => state.downloadableAccessReady).length;
  const shareableAccessReadyCount = assetAccessStates.filter(state => state.shareableAccessReady).length;
  const shareDownloadRecords = records.filter(record =>
    !isExpired(record.expiresAt) &&
    (record.allowedActions.includes('download') || record.allowedActions.includes('share')),
  );
  const missingLinks = [
    records.length === 0 ? 'Missing enterprise asset permission ledger' : '',
    governedAssetCount === 0 ? 'No governed assets in permission ledger' : '',
    records.some(record => record.roles.length === 0) ? 'Asset permission record missing roles' : '',
    records.some(record => record.allowedActions.length === 0) ? 'Asset permission record missing actions' : '',
    expiredPermissionCount > 0 ? `Expired asset permissions (${expiredPermissionCount})` : '',
    missingStorageObjectCount > 0 ? `Download/share permission missing storage object (${missingStorageObjectCount})` : '',
    records.some(record => !isExpired(record.expiresAt) && (record.allowedActions.includes('download') || record.allowedActions.includes('share'))) && activeAccessGrantCount === 0
      ? 'Missing active asset access grant for download/share enforcement'
      : '',
    shareDownloadRecords.some(record => !securityAssetIds.has(record.assetId)) ? 'Download/share asset missing enterprise security policy' : '',
    securityPolicies.some(policy => policy.watermarkRequired && !policy.watermarkApplied) ? 'Watermark required but not applied' : '',
    securityPolicies.some(policy => policy.dlpScanStatus === 'pending') ? 'DLP scan still pending' : '',
    dlpFailedPolicyCount > 0 ? `DLP scan failed (${dlpFailedPolicyCount})` : '',
    securityPolicies.some(policy => policy.publicShareAllowed && policy.dlpScanStatus !== 'passed' && policy.dlpScanStatus !== 'waived') ? 'Public share allowed before DLP pass or waiver' : '',
    records.length > 0 && auditEventCount === 0 ? 'Missing asset permission audit trail' : '',
  ].filter(Boolean);

  return {
    orgId,
    projectId,
    permissionRecordCount: records.length,
    governedAssetCount,
    shareableAssetCount,
    downloadableAssetCount,
    storageObjectCount,
    downloadableObjectCount,
    shareableObjectCount,
    missingStorageObjectCount,
    activeAccessGrantCount,
    expiredAccessGrantCount,
    revokedAccessGrantCount,
    expiredPermissionCount,
    clientReviewScopeCount,
    securityPolicyCount: securityPolicies.length,
    watermarkRequiredCount,
    watermarkAppliedCount,
    dlpPassedPolicyCount,
    dlpFailedPolicyCount,
    publicShareBlockedCount,
    retentionPolicyCount,
    auditEventCount,
    accessAuditEventCount: accessAudits.length,
    downloadableAccessReadyCount,
    shareableAccessReadyCount,
    assetAccessStates,
    missingLinks,
    nextActions: missingLinks.map(item => `Close asset permission gap: ${item}`),
  };
}

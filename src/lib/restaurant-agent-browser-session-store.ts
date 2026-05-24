import type { RestaurantBrowserRuntimeTarget, RestaurantBrowserSessionManifest } from '@/lib/restaurant-agent-browser-session';
import { appendRestaurantAgentLedgerEntry, clearRestaurantAgentLedgerKindForTest, listRestaurantAgentLedgerEntries } from '@/lib/restaurant-agent-ledger-store';

export type RestaurantBrowserSessionStatus = 'ready' | 'handoff-only' | 'blocked' | 'expired';

export type RestaurantBrowserSessionRecord = {
  sessionId: string;
  runtimeTarget: RestaurantBrowserRuntimeTarget;
  status: RestaurantBrowserSessionStatus;
  eventId: string;
  restaurant: string;
  offer: string;
  channel: string;
  profileConfigured: boolean;
  runtimeConfigured: boolean;
  callbackSecretConfigured: boolean;
  canExecuteNow: boolean;
  allowedTools: number;
  blockedTools: number;
  blockedReasons: string[];
  leaseExpiresAt: string;
  lastHeartbeatAt?: string;
  nextAction: string;
  createdAt: string;
  updatedAt: string;
};

export type RestaurantBrowserSessionHealth = {
  ok: true;
  generatedAt: string;
  summary: {
    total: number;
    ready: number;
    handoffOnly: number;
    blocked: number;
    expired: number;
    needsHeartbeat: number;
  };
  sessions: RestaurantBrowserSessionRecord[];
  operatorQueue: Array<{
    sessionId: string;
    owner: 'tech' | 'operator';
    nextAction: string;
    blockedReasons: string[];
  }>;
  safetyBoundary: string;
};

const memorySessions: RestaurantBrowserSessionRecord[] = [];
const MAX_SESSIONS = 30;

function isSessionRecord(value: unknown): value is RestaurantBrowserSessionRecord {
  const record = value as RestaurantBrowserSessionRecord;
  return Boolean(
    record &&
    typeof record.sessionId === 'string' &&
    typeof record.status === 'string' &&
    typeof record.runtimeTarget === 'string' &&
    typeof record.updatedAt === 'string',
  );
}

function dedupeSessions(records: RestaurantBrowserSessionRecord[]): RestaurantBrowserSessionRecord[] {
  const seen = new Set<string>();
  return records
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .filter(record => {
      if (seen.has(record.sessionId)) return false;
      seen.add(record.sessionId);
      return true;
    })
    .slice(0, MAX_SESSIONS);
}

function minutesFrom(now: Date, minutes: number): string {
  return new Date(now.getTime() + minutes * 60000).toISOString();
}

function statusFor(manifest: RestaurantBrowserSessionManifest): RestaurantBrowserSessionStatus {
  if (manifest.canExecuteNow) return 'ready';
  if (!manifest.runtime.configured || !manifest.profile.configured || !manifest.runtime.callbackSecretConfigured) return 'blocked';
  return 'handoff-only';
}

function blockedReasonsFor(manifest: RestaurantBrowserSessionManifest): string[] {
  const reasons: string[] = [];
  if (!manifest.profile.configured) reasons.push('missing_browser_profile');
  if (!manifest.runtime.urlConfigured) reasons.push('missing_runtime_url');
  if (!manifest.runtime.configured) reasons.push('missing_runtime_api_key');
  if (!manifest.runtime.callbackSecretConfigured) reasons.push('missing_callback_secret');
  if (manifest.toolPolicy.some(tool => tool.name === 'submit_platform_publish' && !tool.allowed)) reasons.push('platform_publish_blocked_until_merchant_approval');
  return Array.from(new Set(reasons));
}

function nextActionFor(record: Pick<RestaurantBrowserSessionRecord, 'status' | 'blockedReasons' | 'runtimeTarget'>): string {
  if (record.status === 'ready') return `保持 ${record.runtimeTarget} 会话心跳；执行后必须用签名 external-receipt 回写证据。`;
  if (record.status === 'expired') return '会话租约已过期；重新生成 session manifest，确认 profile、runtime 和 callback 后再投递。';
  if (record.blockedReasons.includes('missing_browser_profile')) return '配置隔离浏览器 profile，并由商家在该 profile 内完成登录授权。';
  if (record.blockedReasons.includes('missing_runtime_url') || record.blockedReasons.includes('missing_runtime_api_key')) return `配置 ${record.runtimeTarget} runtime URL/API key；密钥只留在服务端。`;
  if (record.blockedReasons.includes('missing_callback_secret')) return '配置 RESTAURANT_AGENT_CALLBACK_SECRET，否则外部执行器不能安全回写回执。';
  return '保持 handoff-only，不登录平台、不点击后台、不读取私信，等待外部条件补齐。';
}

export function recordRestaurantBrowserSession(
  manifest: RestaurantBrowserSessionManifest,
  now = new Date(),
): RestaurantBrowserSessionRecord {
  const status = statusFor(manifest);
  const blockedReasons = blockedReasonsFor(manifest);
  const existing = listRestaurantBrowserSessions(now).find(item => item.sessionId === manifest.sessionId);
  const record: RestaurantBrowserSessionRecord = {
    sessionId: manifest.sessionId,
    runtimeTarget: manifest.runtimeTarget,
    status,
    eventId: manifest.task.eventId,
    restaurant: manifest.task.restaurant,
    offer: manifest.task.offer,
    channel: manifest.task.channel,
    profileConfigured: manifest.profile.configured,
    runtimeConfigured: manifest.runtime.configured,
    callbackSecretConfigured: manifest.runtime.callbackSecretConfigured,
    canExecuteNow: manifest.canExecuteNow,
    allowedTools: manifest.toolPolicy.filter(tool => tool.allowed).length,
    blockedTools: manifest.toolPolicy.filter(tool => !tool.allowed).length,
    blockedReasons,
    leaseExpiresAt: minutesFrom(now, manifest.canExecuteNow ? 30 : 120),
    lastHeartbeatAt: existing?.lastHeartbeatAt,
    nextAction: '',
    createdAt: existing?.createdAt || now.toISOString(),
    updatedAt: now.toISOString(),
  };
  record.nextAction = nextActionFor(record);

  const previousIndex = memorySessions.findIndex(item => item.sessionId === record.sessionId);
  if (previousIndex >= 0) memorySessions.splice(previousIndex, 1);
  memorySessions.unshift(record);
  memorySessions.splice(MAX_SESSIONS);
  appendRestaurantAgentLedgerEntry('browser-session', record, now);
  return record;
}

export function heartbeatRestaurantBrowserSession(sessionId: string, now = new Date()): RestaurantBrowserSessionRecord | undefined {
  const existing = listRestaurantBrowserSessions(now).find(item => item.sessionId === sessionId);
  if (!existing) return undefined;
  const expired = Date.parse(existing.leaseExpiresAt) <= now.getTime();
  const record: RestaurantBrowserSessionRecord = {
    ...existing,
    status: expired ? 'expired' : existing.status,
    lastHeartbeatAt: now.toISOString(),
    updatedAt: now.toISOString(),
    nextAction: nextActionFor({ ...existing, status: expired ? 'expired' : existing.status }),
  };
  const previousIndex = memorySessions.findIndex(item => item.sessionId === record.sessionId);
  if (previousIndex >= 0) memorySessions.splice(previousIndex, 1);
  memorySessions.unshift(record);
  appendRestaurantAgentLedgerEntry('browser-session', record, now);
  return record;
}

export function listRestaurantBrowserSessions(now = new Date()): RestaurantBrowserSessionRecord[] {
  const ledgerSessions = listRestaurantAgentLedgerEntries<RestaurantBrowserSessionRecord>('browser-session')
    .map(entry => entry.payload)
    .filter(isSessionRecord);
  return dedupeSessions([...memorySessions, ...ledgerSessions]).map(record => {
    if (record.status === 'expired' || Date.parse(record.leaseExpiresAt) > now.getTime()) return record;
    return {
      ...record,
      status: 'expired',
      nextAction: nextActionFor({ ...record, status: 'expired' }),
    };
  });
}

export function buildRestaurantBrowserSessionHealth(
  sessions = listRestaurantBrowserSessions(),
  now = new Date(),
): RestaurantBrowserSessionHealth {
  const needsHeartbeat = sessions.filter(session => {
    if (session.status !== 'ready') return false;
    if (!session.lastHeartbeatAt) return true;
    return now.getTime() - Date.parse(session.lastHeartbeatAt) > 10 * 60000;
  }).length;

  return {
    ok: true,
    generatedAt: now.toISOString(),
    summary: {
      total: sessions.length,
      ready: sessions.filter(session => session.status === 'ready').length,
      handoffOnly: sessions.filter(session => session.status === 'handoff-only').length,
      blocked: sessions.filter(session => session.status === 'blocked').length,
      expired: sessions.filter(session => session.status === 'expired').length,
      needsHeartbeat,
    },
    sessions: sessions.slice(0, 10),
    operatorQueue: sessions
      .filter(session => session.status !== 'ready' || needsHeartbeat)
      .slice(0, 5)
      .map(session => ({
        sessionId: session.sessionId,
        owner: session.blockedReasons.some(reason => reason.includes('runtime') || reason.includes('callback')) ? 'tech' : 'operator',
        nextAction: session.nextAction,
        blockedReasons: session.blockedReasons,
      })),
    safetyBoundary: 'Browser session registry 只保存 session 状态、租约、profile 是否配置和工具权限摘要；不保存 cookie、token、验证码、密码、私信原文或平台后台数据。',
  };
}

export function clearRestaurantBrowserSessionsForTest() {
  memorySessions.splice(0);
  clearRestaurantAgentLedgerKindForTest('browser-session');
}

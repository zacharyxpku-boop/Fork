import { appendRestaurantAgentLedgerEntry, clearRestaurantAgentLedgerKindForTest, listRestaurantAgentLedgerEntries } from '@/lib/restaurant-agent-ledger-store';

export type RestaurantProviderSetupStateRecord = {
  stateId: string;
  restaurant: string;
  offer: string;
  source: 'merchant-setup-wizard' | 'runtime-admin' | 'test';
  configuredEnvKeys: string[];
  merchantApprovals: string[];
  dataContracts: string[];
  notes: string[];
  submittedBy: string;
  createdAt: string;
  safetyBoundary: string;
};

export type RestaurantProviderSetupStateSummary = {
  ok: true;
  payloadShape: 'restaurant-provider-setup-state-summary-v1';
  generatedAt: string;
  summary: {
    records: number;
    configuredEnvKeys: number;
    merchantApprovals: number;
    dataContracts: number;
    latestSubmittedBy: string;
  };
  provided: {
    envKeys: string[];
    merchantApprovals: string[];
    dataContracts: string[];
  };
  latest: RestaurantProviderSetupStateRecord[];
  safetyBoundary: string;
};

const memoryRecords: RestaurantProviderSetupStateRecord[] = [];
const MAX_RECORDS = 80;

function stableId(parts: string[]) {
  let hash = 0;
  const text = parts.join('|');
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 53 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function clean(value: unknown, fallback: string, max = 120) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function cleanList(values: unknown, max = 80) {
  if (!Array.isArray(values)) return [];
  return Array.from(new Set(values
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => item.slice(0, max))));
}

function isSensitive(value: string) {
  return /(secret|token|cookie|password|bearer|sk-[a-z0-9]|phone|mobile|openid|wxid|验证码|密码|手机号|微信号|私信|顾客)/i.test(value);
}

function safeList(values: unknown, max = 80) {
  return cleanList(values, max).filter(item => !isSensitive(item));
}

function cleanEnvKeys(values: unknown) {
  return cleanList(values, 100).filter(item => /^[A-Z0-9_]+$/.test(item));
}

function isRecord(value: unknown): value is RestaurantProviderSetupStateRecord {
  const record = value as RestaurantProviderSetupStateRecord;
  return Boolean(
    record &&
    typeof record.stateId === 'string' &&
    typeof record.restaurant === 'string' &&
    typeof record.offer === 'string' &&
    Array.isArray(record.configuredEnvKeys) &&
    Array.isArray(record.merchantApprovals) &&
    Array.isArray(record.dataContracts) &&
    typeof record.createdAt === 'string',
  );
}

function dedupe(records: RestaurantProviderSetupStateRecord[]) {
  const seen = new Set<string>();
  return records
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .filter(record => {
      if (seen.has(record.stateId)) return false;
      seen.add(record.stateId);
      return true;
    })
    .slice(0, MAX_RECORDS);
}

function allRecords() {
  const ledgerRecords = listRestaurantAgentLedgerEntries<RestaurantProviderSetupStateRecord>('provider-setup-state')
    .map(entry => entry.payload)
    .filter(isRecord);
  return dedupe([...memoryRecords, ...ledgerRecords]);
}

export function recordRestaurantProviderSetupState(input: {
  restaurant?: string;
  offer?: string;
  source?: RestaurantProviderSetupStateRecord['source'];
  configuredEnvKeys?: unknown;
  merchantApprovals?: unknown;
  dataContracts?: unknown;
  notes?: unknown;
  submittedBy?: string;
  now?: Date;
}) {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, 'Trial restaurant');
  const offer = clean(input.offer, 'Today featured set meal');
  const configuredEnvKeys = cleanEnvKeys(input.configuredEnvKeys);
  const merchantApprovals = safeList(input.merchantApprovals, 160);
  const dataContracts = safeList(input.dataContracts, 160);
  const notes = safeList(input.notes, 220);
  const submittedBy = clean(input.submittedBy, 'merchant-operator', 80);
  const record: RestaurantProviderSetupStateRecord = {
    stateId: `provider-setup-${stableId([restaurant, offer, configuredEnvKeys.join(','), merchantApprovals.join(','), dataContracts.join(','), now.toISOString()])}`,
    restaurant,
    offer,
    source: input.source || 'merchant-setup-wizard',
    configuredEnvKeys,
    merchantApprovals,
    dataContracts,
    notes,
    submittedBy: isSensitive(submittedBy) ? 'redacted-operator' : submittedBy,
    createdAt: now.toISOString(),
    safetyBoundary: 'Provider setup state stores configured/missing evidence only. It never stores secret values, cookies, tokens, raw browser profile identifiers, private messages, customer identifiers, coupon codes or POS rows.',
  };
  memoryRecords.unshift(record);
  memoryRecords.splice(MAX_RECORDS);
  appendRestaurantAgentLedgerEntry('provider-setup-state', record, now);
  return {
    record,
    summary: buildRestaurantProviderSetupStateSummary(now),
  };
}

export function buildRestaurantProviderSetupStateSummary(now = new Date()): RestaurantProviderSetupStateSummary {
  const records = allRecords();
  const envKeys = Array.from(new Set(records.flatMap(record => record.configuredEnvKeys)));
  const merchantApprovals = Array.from(new Set(records.flatMap(record => record.merchantApprovals)));
  const dataContracts = Array.from(new Set(records.flatMap(record => record.dataContracts)));
  return {
    ok: true,
    payloadShape: 'restaurant-provider-setup-state-summary-v1',
    generatedAt: now.toISOString(),
    summary: {
      records: records.length,
      configuredEnvKeys: envKeys.length,
      merchantApprovals: merchantApprovals.length,
      dataContracts: dataContracts.length,
      latestSubmittedBy: records[0]?.submittedBy || 'none',
    },
    provided: {
      envKeys,
      merchantApprovals,
      dataContracts,
    },
    latest: records.slice(0, 6),
    safetyBoundary: 'Provider setup state summary exposes only sanitized configured item identifiers and setup evidence counts. Secret values and private customer or platform data are never returned.',
  };
}

export function clearRestaurantProviderSetupStateForTest() {
  memoryRecords.splice(0);
  clearRestaurantAgentLedgerKindForTest('provider-setup-state');
}

import { appendRestaurantAgentLedgerEntry, clearRestaurantAgentLedgerKindForTest, listRestaurantAgentLedgerEntries } from '@/lib/restaurant-agent-ledger-store';
import {
  buildRestaurantCapabilityTrainingPlan,
  type RestaurantCapabilityTrainingInput,
  type RestaurantCapabilityTrainingRecord,
  type RestaurantCapabilityTrainingRecordInput,
  type RestaurantCapabilityTrainingRecordKind,
} from '@/lib/restaurant-capability-training-plan';

export {
  buildRestaurantCapabilityTrainingPlan,
  type RestaurantCapabilityTrainingInput,
  type RestaurantCapabilityTrainingItem,
  type RestaurantCapabilityTrainingPlan,
  type RestaurantCapabilityTrainingRecord,
  type RestaurantCapabilityTrainingRecordInput,
  type RestaurantCapabilityTrainingRecordKind,
  type RestaurantCapabilityTrainingStatus,
} from '@/lib/restaurant-capability-training-plan';

const trainingRecords: RestaurantCapabilityTrainingRecord[] = [];
const MAX_TRAINING_RECORDS = 100;

function cleanText(value: unknown, fallback: string, max = 160): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 37 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function isSensitiveTrainingText(value: string) {
  return /(api[_ -]?key|secret|token|cookie|password|验证码|咨询原文|手机号|身份证|银行卡|openid|session)/i.test(value);
}

function isTrainingRecord(value: unknown): value is RestaurantCapabilityTrainingRecord {
  const record = value as RestaurantCapabilityTrainingRecord;
  return Boolean(
    record &&
    typeof record.recordId === 'string' &&
    (record.kind === 'material' || record.kind === 'provider') &&
    typeof record.capabilityId === 'string' &&
    typeof record.name === 'string' &&
    typeof record.createdAt === 'string',
  );
}

function dedupeTrainingRecords(records: RestaurantCapabilityTrainingRecord[]): RestaurantCapabilityTrainingRecord[] {
  const seen = new Set<string>();
  return records
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .filter(record => {
      if (seen.has(record.recordId)) return false;
      seen.add(record.recordId);
      return true;
    })
    .slice(0, MAX_TRAINING_RECORDS);
}

export function recordRestaurantCapabilityTrainingRecord(
  input: RestaurantCapabilityTrainingRecordInput,
  now = new Date(),
): RestaurantCapabilityTrainingRecord {
  const kind: RestaurantCapabilityTrainingRecordKind = input.kind === 'provider' ? 'provider' : 'material';
  const capabilityId = cleanText(input.capabilityId, 'cross-platform-operating-qa', 80);
  const name = cleanText(input.name, kind === 'provider' ? '待配置 Provider' : '待补训练材料', 80);
  const owner = cleanText(input.owner, kind === 'provider' ? '技术' : '运营', 40);
  const source = input.source === 'public-profile' || input.source === 'pos-import' || input.source === 'provider-setup'
    ? input.source
    : 'manual';
  const evidenceSummary = cleanText(input.evidenceSummary, 'Training evidence summary pending.', 220);
  const rejectedReason = [capabilityId, name, owner, evidenceSummary].some(isSensitiveTrainingText)
    ? 'capability_training_record_contains_sensitive_or_private_content'
    : undefined;
  const record: RestaurantCapabilityTrainingRecord = {
    recordId: `restaurant-training-${stableId([kind, capabilityId, name])}`,
    kind,
    capabilityId,
    name,
    owner,
    source,
    evidenceSummary: rejectedReason ? 'Training record rejected because it contains private or sensitive content.' : evidenceSummary,
    accepted: !rejectedReason,
    rejectedReason,
    createdAt: now.toISOString(),
  };

  const previousIndex = trainingRecords.findIndex(item => item.recordId === record.recordId);
  if (previousIndex >= 0) trainingRecords.splice(previousIndex, 1);
  trainingRecords.unshift(record);
  trainingRecords.splice(MAX_TRAINING_RECORDS);
  appendRestaurantAgentLedgerEntry('capability-training', record, now);
  return record;
}

export function listRestaurantCapabilityTrainingRecords(): RestaurantCapabilityTrainingRecord[] {
  const ledgerRecords = listRestaurantAgentLedgerEntries<RestaurantCapabilityTrainingRecord>('capability-training')
    .map(entry => entry.payload)
    .filter(isTrainingRecord);

  return dedupeTrainingRecords([...trainingRecords, ...ledgerRecords]);
}

export function buildRestaurantCapabilityTrainingPlanFromLedger(input: RestaurantCapabilityTrainingInput = {}) {
  return buildRestaurantCapabilityTrainingPlan({
    ...input,
    trainingRecords: [...listRestaurantCapabilityTrainingRecords(), ...(input.trainingRecords || [])],
  });
}

export function clearRestaurantCapabilityTrainingRecordsForTest() {
  trainingRecords.splice(0);
  clearRestaurantAgentLedgerKindForTest('capability-training');
}

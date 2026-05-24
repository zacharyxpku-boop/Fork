import { appendRestaurantAgentLedgerEntry, clearRestaurantAgentLedgerKindForTest, listRestaurantAgentLedgerEntries } from '@/lib/restaurant-agent-ledger-store';
import { validateRestaurantAgentReceipt, type RestaurantReceiptChannelClass, type RestaurantReceiptEvidenceLevel, type RestaurantReceiptSource } from '@/lib/restaurant-agent-receipt-validation';
import { listRestaurantAgentRuns } from '@/lib/restaurant-agent-run-store';

export type RestaurantAgentReceiptStatus = 'accepted' | 'rejected';

export type RestaurantAgentReceiptInput = {
  eventId?: string;
  channel?: string;
  evidenceUrl?: string;
  screenshotId?: string;
  externalRunId?: string;
  operator?: string;
  summary?: string;
  source?: RestaurantReceiptSource;
  signalType?: RestaurantBusinessSignalType;
  reservationCount?: number;
  couponClaimCount?: number;
  redemptionCount?: number;
  inquiryCount?: number;
  visitIntentCount?: number;
};

export type RestaurantBusinessSignalType =
  | 'publish-proof'
  | 'reservation'
  | 'coupon-claim'
  | 'redemption'
  | 'private-domain-followup'
  | 'visit-intent'
  | 'manual-review';

export type RestaurantAgentReceiptRecord = {
  receiptId: string;
  status: RestaurantAgentReceiptStatus;
  eventId: string;
  channel: string;
  evidenceUrl?: string;
  screenshotId?: string;
  externalRunId?: string;
  operator: string;
  summary: string;
  source: RestaurantReceiptSource;
  signalType: RestaurantBusinessSignalType;
  businessSignals: {
    reservationCount: number;
    couponClaimCount: number;
    redemptionCount: number;
    inquiryCount: number;
    visitIntentCount: number;
  };
  evidenceScore: number;
  evidenceLevel: RestaurantReceiptEvidenceLevel;
  channelClass: RestaurantReceiptChannelClass;
  runMatched: boolean;
  duplicate: boolean;
  validationWarnings: string[];
  rejectedReason?: string;
  createdAt: string;
};

const receiptRecords: RestaurantAgentReceiptRecord[] = [];
const MAX_RECEIPTS = 50;

function isReceiptRecord(value: unknown): value is RestaurantAgentReceiptRecord {
  const record = value as RestaurantAgentReceiptRecord;
  return Boolean(
    record &&
    typeof record.receiptId === 'string' &&
    typeof record.status === 'string' &&
    typeof record.eventId === 'string' &&
    typeof record.channel === 'string' &&
    typeof record.createdAt === 'string',
  );
}

function dedupeReceipts(records: RestaurantAgentReceiptRecord[]): RestaurantAgentReceiptRecord[] {
  const seen = new Set<string>();
  return records
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .filter(record => {
      if (seen.has(record.receiptId)) return false;
      seen.add(record.receiptId);
      return true;
    })
    .slice(0, MAX_RECEIPTS);
}

function cleanText(value: unknown, fallback: string, max = 160): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function cleanCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.min(100000, Math.floor(value)))
    : 0;
}

function cleanSignalType(value: unknown, summary: string): RestaurantBusinessSignalType {
  if (
    value === 'publish-proof'
    || value === 'reservation'
    || value === 'coupon-claim'
    || value === 'redemption'
    || value === 'private-domain-followup'
    || value === 'visit-intent'
    || value === 'manual-review'
  ) {
    return value;
  }
  if (/核销|redemption/i.test(summary)) return 'redemption';
  if (/预约|reservation/i.test(summary)) return 'reservation';
  if (/领券|券|coupon/i.test(summary)) return 'coupon-claim';
  if (/咨询|私域|社群|follow/i.test(summary)) return 'private-domain-followup';
  if (/到店|visit/i.test(summary)) return 'visit-intent';
  return 'publish-proof';
}

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 37 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function recordRestaurantAgentReceipt(input: RestaurantAgentReceiptInput, now = new Date()): RestaurantAgentReceiptRecord {
  const eventId = cleanText(input.eventId, 'unknown-event', 96);
  const channel = cleanText(input.channel, 'manual', 40);
  const evidenceUrl = typeof input.evidenceUrl === 'string' && /^https?:\/\//.test(input.evidenceUrl.trim())
    ? input.evidenceUrl.trim().slice(0, 240)
    : undefined;
  const screenshotId = cleanText(input.screenshotId, '', 80) || undefined;
  const externalRunId = cleanText(input.externalRunId, '', 80) || undefined;
  const operator = cleanText(input.operator, 'operator', 40);
  const summary = cleanText(input.summary, 'Execution receipt imported.', 180);
  const source = input.source || 'manual';
  const signalType = cleanSignalType(input.signalType, summary);
  const businessSignals = {
    reservationCount: cleanCount(input.reservationCount),
    couponClaimCount: cleanCount(input.couponClaimCount),
    redemptionCount: cleanCount(input.redemptionCount),
    inquiryCount: cleanCount(input.inquiryCount),
    visitIntentCount: cleanCount(input.visitIntentCount),
  };
  const validation = validateRestaurantAgentReceipt({
    eventId,
    channel,
    evidenceUrl,
    screenshotId,
    externalRunId,
    operator,
    summary,
    source,
  }, listRestaurantAgentRuns(), listRestaurantAgentReceipts());
  const status: RestaurantAgentReceiptStatus = validation.accepted ? 'accepted' : 'rejected';
  const storedSummary = validation.rejectedReason === 'receipt_contains_sensitive_or_private_content'
    ? 'Receipt rejected because it contains private or sensitive content.'
    : summary;

  const record: RestaurantAgentReceiptRecord = {
    receiptId: `restaurant-receipt-${stableId([eventId, channel, evidenceUrl || screenshotId || externalRunId || 'missing'])}`,
    status,
    eventId,
    channel,
    evidenceUrl,
    screenshotId,
    externalRunId,
    operator,
    summary: storedSummary,
    source,
    signalType,
    businessSignals: status === 'accepted'
      ? businessSignals
      : {
          reservationCount: 0,
          couponClaimCount: 0,
          redemptionCount: 0,
          inquiryCount: 0,
          visitIntentCount: 0,
        },
    evidenceScore: validation.evidenceScore,
    evidenceLevel: validation.evidenceLevel,
    channelClass: validation.channelClass,
    runMatched: validation.runMatched,
    duplicate: validation.duplicate,
    validationWarnings: validation.warnings,
    rejectedReason: validation.rejectedReason,
    createdAt: now.toISOString(),
  };

  const previousIndex = receiptRecords.findIndex(item => item.receiptId === record.receiptId);
  if (previousIndex >= 0) receiptRecords.splice(previousIndex, 1);
  receiptRecords.unshift(record);
  receiptRecords.splice(MAX_RECEIPTS);
  appendRestaurantAgentLedgerEntry('receipt', record, now);
  return record;
}

export function listRestaurantAgentReceipts(): RestaurantAgentReceiptRecord[] {
  const ledgerReceipts = listRestaurantAgentLedgerEntries<RestaurantAgentReceiptRecord>('receipt')
    .map(entry => entry.payload)
    .filter(isReceiptRecord);

  return dedupeReceipts([...receiptRecords, ...ledgerReceipts]);
}

export function clearRestaurantAgentReceiptsForTest() {
  receiptRecords.splice(0);
  clearRestaurantAgentLedgerKindForTest('receipt');
}

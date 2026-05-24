import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';

export type RestaurantReceiptSource = 'manual' | 'external-runtime';

export type RestaurantReceiptEvidenceLevel = 'strong' | 'medium' | 'weak' | 'invalid';

export type RestaurantReceiptChannelClass =
  | 'dianping-meituan'
  | 'xiaohongshu'
  | 'douyin'
  | 'wechat-community'
  | 'runtime'
  | 'manual'
  | 'unknown';

export type RestaurantReceiptValidationInput = {
  eventId: string;
  channel: string;
  evidenceUrl?: string;
  screenshotId?: string;
  externalRunId?: string;
  operator: string;
  summary: string;
  source?: RestaurantReceiptSource;
};

export type RestaurantReceiptExistingRecord = {
  receiptId: string;
  eventId: string;
  channel: string;
  evidenceUrl?: string;
  screenshotId?: string;
  externalRunId?: string;
};

export type RestaurantReceiptValidationResult = {
  accepted: boolean;
  evidenceScore: number;
  evidenceLevel: RestaurantReceiptEvidenceLevel;
  channelClass: RestaurantReceiptChannelClass;
  runMatched: boolean;
  duplicate: boolean;
  warnings: string[];
  rejectedReason?: string;
};

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function classifyChannel(channel: string): RestaurantReceiptChannelClass {
  const normalized = normalize(channel);
  if (!normalized || normalized === 'manual') return 'manual';
  if (/(dianping|meituan|大众|点评|美团)/i.test(channel)) return 'dianping-meituan';
  if (/(xiaohongshu|red|小红书)/i.test(channel)) return 'xiaohongshu';
  if (/(douyin|tiktok|抖音)/i.test(channel)) return 'douyin';
  if (/(wechat|weixin|微信|社群)/i.test(channel)) return 'wechat-community';
  if (/(lobu|openclaw|claw|hermes|runtime)/i.test(channel)) return 'runtime';
  return 'unknown';
}

function isSampleEvidenceUrl(evidenceUrl?: string): boolean {
  if (!evidenceUrl) return false;
  try {
    const url = new URL(evidenceUrl);
    return ['example.com', 'example.test', 'localhost', '127.0.0.1'].includes(url.hostname);
  } catch {
    return true;
  }
}

function looksLikeSensitiveContact(text: string): boolean {
  return /1[3-9]\d{9}/.test(text)
    || /(微信|weixin|wechat|手机号|手机|电话|身份证|私信原文|private message|phone|id card)/i.test(text);
}

function evidenceKey(input: RestaurantReceiptValidationInput): string {
  return [
    normalize(input.eventId),
    normalize(input.channel),
    normalize(input.evidenceUrl || ''),
    normalize(input.screenshotId || ''),
    normalize(input.externalRunId || ''),
  ].join('|');
}

function isDuplicate(input: RestaurantReceiptValidationInput, existingReceipts: RestaurantReceiptExistingRecord[]): boolean {
  const nextKey = evidenceKey(input);
  return existingReceipts.some(receipt => evidenceKey({
    eventId: receipt.eventId,
    channel: receipt.channel,
    evidenceUrl: receipt.evidenceUrl,
    screenshotId: receipt.screenshotId,
    externalRunId: receipt.externalRunId,
    operator: '',
    summary: '',
  }) === nextKey);
}

function matchesRunTarget(run: RestaurantAgentRunRecord | undefined, input: RestaurantReceiptValidationInput): boolean {
  if (!run || !input.externalRunId) return true;
  if (run.target === 'local') return true;
  const externalRunId = normalize(input.externalRunId);
  const channel = normalize(input.channel);
  return externalRunId.includes(run.target) || channel.includes(run.target) || channel === 'runtime';
}

export function validateRestaurantAgentReceipt(
  input: RestaurantReceiptValidationInput,
  runs: RestaurantAgentRunRecord[] = [],
  existingReceipts: RestaurantReceiptExistingRecord[] = [],
): RestaurantReceiptValidationResult {
  const source = input.source || 'manual';
  const channelClass = classifyChannel(input.channel);
  const run = runs.find(item => item.eventId === input.eventId);
  const runMatched = Boolean(run);
  const hasEvidenceUrl = Boolean(input.evidenceUrl);
  const hasScreenshot = Boolean(input.screenshotId);
  const hasExternalRun = Boolean(input.externalRunId);
  const sampleEvidence = isSampleEvidenceUrl(input.evidenceUrl);
  const duplicate = isDuplicate(input, existingReceipts);
  const sensitive = looksLikeSensitiveContact([input.eventId, input.channel, input.operator, input.summary].join(' '));
  const warnings: string[] = [];

  let evidenceScore = 0;
  if (hasEvidenceUrl) evidenceScore += sampleEvidence ? 15 : 35;
  if (hasScreenshot) evidenceScore += 25;
  if (hasExternalRun) evidenceScore += source === 'external-runtime' ? 35 : 20;
  if (source === 'external-runtime') evidenceScore += 15;
  if (runMatched) evidenceScore += 15;
  if (channelClass === 'unknown') evidenceScore -= 10;
  if (sampleEvidence) {
    evidenceScore -= 20;
    warnings.push('sample_or_demo_evidence_url');
  }
  if (duplicate) {
    evidenceScore -= 35;
    warnings.push('duplicate_evidence');
  }
  if (!runMatched) warnings.push('event_id_not_found_in_run_ledger');
  if (channelClass === 'unknown') warnings.push('unknown_channel');

  evidenceScore = Math.max(0, Math.min(100, evidenceScore));
  const evidenceLevel: RestaurantReceiptEvidenceLevel = evidenceScore >= 80
    ? 'strong'
    : evidenceScore >= 55
      ? 'medium'
      : evidenceScore >= 25
        ? 'weak'
        : 'invalid';

  let rejectedReason: string | undefined;
  if (!hasEvidenceUrl && !hasScreenshot && !hasExternalRun) {
    rejectedReason = 'receipt_missing_evidence';
  } else if (sensitive) {
    rejectedReason = 'receipt_contains_sensitive_or_private_content';
  } else if (duplicate) {
    rejectedReason = 'duplicate_receipt_evidence';
  } else if (source === 'external-runtime' && !runMatched) {
    rejectedReason = 'external_receipt_event_not_found';
  } else if (source === 'external-runtime' && !hasExternalRun) {
    rejectedReason = 'external_receipt_missing_external_run_id';
  } else if (!matchesRunTarget(run, input)) {
    rejectedReason = 'external_receipt_target_mismatch';
  } else if (sampleEvidence) {
    rejectedReason = 'sample_evidence_url_not_real_proof';
  } else if (!runMatched) {
    rejectedReason = 'manual_receipt_event_not_found';
  } else if (evidenceScore < (source === 'manual' ? 40 : 55)) {
    rejectedReason = 'receipt_evidence_too_weak';
  }

  return {
    accepted: !rejectedReason,
    evidenceScore,
    evidenceLevel,
    channelClass,
    runMatched,
    duplicate,
    warnings,
    rejectedReason,
  };
}

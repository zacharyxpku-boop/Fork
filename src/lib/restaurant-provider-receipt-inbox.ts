import { buildRestaurantRunHealth, type RestaurantRunHealth, type RestaurantRunHealthItem } from '@/lib/restaurant-agent-run-health';
import type { RestaurantAgentReceiptRecord, RestaurantBusinessSignalType } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
import type { RestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';

export type RestaurantProviderReceiptRequestStatus =
  | 'accepted'
  | 'waiting-receipt'
  | 'blocked-before-dispatch'
  | 'provider-failed'
  | 'queued-local'
  | 'receipt-rejected';

export type RestaurantProviderReceiptRequest = {
  requestId: string;
  eventId: string;
  target: RestaurantAgentRunRecord['target'];
  status: RestaurantProviderReceiptRequestStatus;
  priority: 'critical' | 'high' | 'medium' | 'low';
  restaurant: string;
  offer: string;
  owner: string;
  requiredEvidence: string[];
  callback: {
    endpoint: '/api/restaurant-agent/runtime';
    action: 'external-receipt';
    header: 'x-restaurant-agent-signature';
    signatureRequired: boolean;
  };
  safeReceiptDraft: {
    action: 'external-receipt';
    eventId: string;
    channel: string;
    evidenceUrl?: string;
    screenshotId?: string;
    externalRunId?: string;
    operator: string;
    summary: string;
    signalType: RestaurantBusinessSignalType;
  };
  latestReceipt?: Pick<RestaurantAgentReceiptRecord, 'receiptId' | 'status' | 'evidenceScore' | 'evidenceLevel' | 'validationWarnings' | 'rejectedReason'>;
  blockedReasons: string[];
  nextAction: string;
};

export type RestaurantProviderReceiptInbox = {
  ok: true;
  payloadShape: 'restaurant-provider-receipt-inbox-v1';
  generatedAt: string;
  summary: {
    total: number;
    waitingReceipt: number;
    blockedBeforeDispatch: number;
    providerFailed: number;
    queuedLocal: number;
    accepted: number;
    receiptRejected: number;
    actionRequired: number;
  };
  requests: RestaurantProviderReceiptRequest[];
  runHealth: Pick<RestaurantRunHealth, 'summary' | 'operatorQueue' | 'safetyBoundary'>;
  externalRequired: string[];
  safetyBoundary: string;
};

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 59 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function statusFromHealth(state: RestaurantRunHealthItem['state']): RestaurantProviderReceiptRequestStatus {
  if (state === 'blocked-auth') return 'blocked-before-dispatch';
  if (state === 'failed') return 'provider-failed';
  return state;
}

function priorityFromStatus(status: RestaurantProviderReceiptRequestStatus): RestaurantProviderReceiptRequest['priority'] {
  if (status === 'provider-failed' || status === 'receipt-rejected') return 'critical';
  if (status === 'blocked-before-dispatch' || status === 'waiting-receipt') return 'high';
  if (status === 'queued-local') return 'medium';
  return 'low';
}

function channelFor(target: RestaurantAgentRunRecord['target']): string {
  if (target === 'local') return 'manual';
  return `${target}-runtime`;
}

function requiredEvidenceFor(status: RestaurantProviderReceiptRequestStatus): string[] {
  if (status === 'accepted') return ['accepted receipt id', 'post-run review note'];
  if (status === 'receipt-rejected') return ['replacement public proof link or screenshot id', 'sanitized summary', 'operator review'];
  if (status === 'blocked-before-dispatch') return ['runtime URL/API key', 'callback secret', 'merchant authorization', 'isolated browser profile'];
  if (status === 'provider-failed') return ['provider error code', 'retry decision', 'fallback owner', 'manual proof if available'];
  if (status === 'queued-local') return ['manual execution proof', 'public link or screenshot id', 'operator'];
  return ['externalRunId', 'public proof URL or screenshot id', 'operator', 'summary'];
}

function blockedReasonsFor(item: RestaurantRunHealthItem, status: RestaurantProviderReceiptRequestStatus): string[] {
  return [
    status === 'blocked-before-dispatch' ? item.nextAction : '',
    status === 'provider-failed' ? item.nextAction : '',
    status === 'receipt-rejected' ? item.evidenceWarnings?.join('; ') || item.nextAction : '',
    status === 'waiting-receipt' ? 'External runtime has not returned a signed receipt yet.' : '',
    status === 'queued-local' ? 'Run is still local; external provider receipt is not available.' : '',
  ].filter(Boolean);
}

function latestReceiptFor(item: RestaurantRunHealthItem, receipts: RestaurantAgentReceiptRecord[]) {
  return receipts.find(receipt => receipt.receiptId === item.latestReceiptId);
}

export function buildRestaurantProviderReceiptInbox(input: {
  runs: RestaurantAgentRunRecord[];
  receipts?: RestaurantAgentReceiptRecord[];
  readiness?: RestaurantExternalReadiness;
  now?: Date;
}): RestaurantProviderReceiptInbox {
  const now = input.now || new Date();
  const receipts = input.receipts || [];
  const runHealth = buildRestaurantRunHealth(input.runs, receipts, input.readiness, now);
  const requests = runHealth.items.map(item => {
    const status = statusFromHealth(item.state);
    const latestReceipt = latestReceiptFor(item, receipts);
    const blockedReasons = blockedReasonsFor(item, status);
    return {
      requestId: `provider-receipt-${stableId([item.eventId, item.target, status])}`,
      eventId: item.eventId,
      target: item.target,
      status,
      priority: priorityFromStatus(status),
      restaurant: item.restaurant,
      offer: item.offer,
      owner: item.owner,
      requiredEvidence: requiredEvidenceFor(status),
      callback: {
        endpoint: '/api/restaurant-agent/runtime',
        action: 'external-receipt',
        header: 'x-restaurant-agent-signature',
        signatureRequired: item.target !== 'local',
      },
      safeReceiptDraft: {
        action: 'external-receipt',
        eventId: item.eventId,
        channel: channelFor(item.target),
        evidenceUrl: status === 'waiting-receipt' ? 'https://public-proof.example/replace-me' : undefined,
        screenshotId: status === 'waiting-receipt' ? `${item.target}-screenshot-id` : undefined,
        externalRunId: item.target === 'local' ? undefined : `${item.target}-run-id`,
        operator: item.target === 'local' ? item.owner : 'external-runtime',
        summary: status === 'accepted'
          ? 'Accepted receipt already exists; move to post-run review.'
          : 'Replace this draft with public proof, screenshot id, external run id, result summary and aggregate signal counts.',
        signalType: 'publish-proof',
      },
      latestReceipt: latestReceipt
        ? {
            receiptId: latestReceipt.receiptId,
            status: latestReceipt.status,
            evidenceScore: latestReceipt.evidenceScore,
            evidenceLevel: latestReceipt.evidenceLevel,
            validationWarnings: latestReceipt.validationWarnings,
            rejectedReason: latestReceipt.rejectedReason,
          }
        : undefined,
      blockedReasons,
      nextAction: status === 'accepted'
        ? 'Close the provider receipt request only after post-run review and store-manager follow-up are recorded.'
        : blockedReasons[0] || item.nextAction,
    } satisfies RestaurantProviderReceiptRequest;
  });

  const actionRequired = requests.filter(request => request.status !== 'accepted').length;

  return {
    ok: true,
    payloadShape: 'restaurant-provider-receipt-inbox-v1',
    generatedAt: now.toISOString(),
    summary: {
      total: requests.length,
      waitingReceipt: requests.filter(request => request.status === 'waiting-receipt').length,
      blockedBeforeDispatch: requests.filter(request => request.status === 'blocked-before-dispatch').length,
      providerFailed: requests.filter(request => request.status === 'provider-failed').length,
      queuedLocal: requests.filter(request => request.status === 'queued-local').length,
      accepted: requests.filter(request => request.status === 'accepted').length,
      receiptRejected: requests.filter(request => request.status === 'receipt-rejected').length,
      actionRequired,
    },
    requests,
    runHealth: {
      summary: runHealth.summary,
      operatorQueue: runHealth.operatorQueue,
      safetyBoundary: runHealth.safetyBoundary,
    },
    externalRequired: Array.from(new Set(requests.flatMap(request => request.blockedReasons))).slice(0, 8),
    safetyBoundary: 'Provider Receipt Inbox only describes signed callback requirements, public proof fields, blocked reasons and recovery actions. It never stores API keys, cookies, tokens, browser profile IDs, private-message raw text, raw POS rows or customer PII.',
  };
}

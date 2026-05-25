import { buildRestaurantBusinessSignals, type RestaurantBusinessSignalReport } from '@/lib/restaurant-agent-business-signals';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
import type { RestaurantPostRunReviewPack } from '@/lib/restaurant-post-run-review-pack';
import type { RestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';

export type RestaurantProviderReceiptLifecycleStage = {
  id: 'submit' | 'callback' | 'validation' | 'signals' | 'post-run' | 'next-loop';
  label: string;
  status: 'done' | 'waiting' | 'blocked';
  owner: 'runtime-admin' | 'ops' | 'store-manager' | 'data-ops';
  evidence: string[];
  nextAction: string;
  stopLine: string;
};

export type RestaurantProviderReceiptLifecycle = {
  ok: true;
  payloadShape: 'restaurant-provider-receipt-lifecycle-v1';
  generatedAt: string;
  verdict: 'accepted-closeout-ready' | 'waiting-signed-receipt' | 'receipt-rejected' | 'blocked-before-callback';
  summary: {
    runs: number;
    waitingReceipts: number;
    acceptedReceipts: number;
    rejectedReceipts: number;
    actionRequired: number;
    businessSignalItems: number;
    storeTasks: number;
    canWriteMemory: boolean;
    canUpdateOperatingInsight: boolean;
    canClaimExternalAutomation: false;
  };
  latestRun?: Pick<RestaurantAgentRunRecord, 'eventId' | 'status' | 'target' | 'restaurant' | 'offer' | 'owner' | 'nextAction' | 'createdAt'>;
  latestReceipt?: Pick<RestaurantAgentReceiptRecord, 'receiptId' | 'status' | 'eventId' | 'channel' | 'externalRunId' | 'evidenceLevel' | 'evidenceScore' | 'signalType' | 'businessSignals' | 'validationWarnings' | 'rejectedReason' | 'createdAt'>;
  stages: RestaurantProviderReceiptLifecycleStage[];
  receiptInbox: Pick<RestaurantProviderReceiptInbox, 'payloadShape' | 'summary' | 'requests' | 'externalRequired' | 'safetyBoundary'>;
  businessSignals: Pick<RestaurantBusinessSignalReport, 'summary' | 'items' | 'nextActions' | 'safetyBoundary'>;
  postRunReview: Pick<RestaurantPostRunReviewPack, 'payloadShape' | 'verdict' | 'summary' | 'lanes' | 'nextLoopSop' | 'safetyBoundary'>;
  memoryWriteRule: {
    allowed: boolean;
    writes: string[];
    forbidden: string[];
  };
  externalRequired: string[];
  safetyBoundary: string;
};

function latestRun(runs: RestaurantAgentRunRecord[]): RestaurantAgentRunRecord | undefined {
  return [...runs].sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
}

function latestReceipt(receipts: RestaurantAgentReceiptRecord[]): RestaurantAgentReceiptRecord | undefined {
  return [...receipts].sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
}

function verdict(input: {
  waitingReceipts: number;
  acceptedReceipts: number;
  rejectedReceipts: number;
  actionRequired: number;
}): RestaurantProviderReceiptLifecycle['verdict'] {
  if (input.acceptedReceipts > 0) return 'accepted-closeout-ready';
  if (input.rejectedReceipts > 0) return 'receipt-rejected';
  if (input.waitingReceipts > 0) return 'waiting-signed-receipt';
  return input.actionRequired > 0 ? 'blocked-before-callback' : 'waiting-signed-receipt';
}

function stage(input: RestaurantProviderReceiptLifecycleStage): RestaurantProviderReceiptLifecycleStage {
  return input;
}

export function buildRestaurantProviderReceiptLifecycle(input: {
  runs: RestaurantAgentRunRecord[];
  receipts: RestaurantAgentReceiptRecord[];
  providerReceiptInbox: RestaurantProviderReceiptInbox;
  postRunReviewPack: RestaurantPostRunReviewPack;
  now?: Date;
}): RestaurantProviderReceiptLifecycle {
  const now = input.now || new Date();
  const businessSignals = buildRestaurantBusinessSignals(input.runs, input.receipts, now);
  const latestRunRecord = latestRun(input.runs);
  const latestReceiptRecord = latestReceipt(input.receipts);
  const acceptedReceipts = input.receipts.filter(item => item.status === 'accepted').length;
  const rejectedReceipts = input.receipts.filter(item => item.status === 'rejected').length;
  const waitingReceipts = input.providerReceiptInbox.summary.waitingReceipt;
  const actionRequired = input.providerReceiptInbox.summary.actionRequired;
  const canWriteMemory = acceptedReceipts > 0;
  const canUpdateOperatingInsight = input.postRunReviewPack.summary.acceptedReceipts > 0;

  const stages = [
    stage({
      id: 'submit',
      label: 'Sandbox submit recorded',
      status: latestRunRecord ? latestRunRecord.status === 'forwarded' ? 'done' : 'blocked' : 'waiting',
      owner: 'ops',
      evidence: latestRunRecord
        ? [`eventId:${latestRunRecord.eventId}`, `target:${latestRunRecord.target}`, `status:${latestRunRecord.status}`]
        : ['no run recorded'],
      nextAction: latestRunRecord
        ? latestRunRecord.status === 'forwarded'
          ? 'Wait for signed external receipt callback.'
          : latestRunRecord.nextAction
        : 'Run a controlled provider sandbox submit attempt first.',
      stopLine: 'No recorded run means no provider execution claim.',
    }),
    stage({
      id: 'callback',
      label: 'Signed callback received',
      status: latestReceiptRecord?.source === 'external-runtime' && latestReceiptRecord.status === 'accepted'
        ? 'done'
        : waitingReceipts > 0 ? 'waiting' : 'blocked',
      owner: 'runtime-admin',
      evidence: latestReceiptRecord
        ? [`receipt:${latestReceiptRecord.receiptId}`, `source:${latestReceiptRecord.source}`, `status:${latestReceiptRecord.status}`]
        : [`waiting:${waitingReceipts}`, `actionRequired:${actionRequired}`],
      nextAction: latestReceiptRecord?.source === 'external-runtime'
        ? latestReceiptRecord.status === 'accepted'
          ? 'Move receipt into validation, business signal extraction and closeout.'
          : latestReceiptRecord.rejectedReason || 'Replace rejected provider receipt with valid signed/public evidence.'
        : 'Require x-restaurant-agent-signature and externalRunId before accepting provider completion.',
      stopLine: 'Unsigned callbacks, missing externalRunId and private payloads are rejected.',
    }),
    stage({
      id: 'validation',
      label: 'Receipt validation',
      status: latestReceiptRecord?.status === 'accepted' ? 'done' : latestReceiptRecord?.status === 'rejected' ? 'blocked' : 'waiting',
      owner: 'ops',
      evidence: latestReceiptRecord
        ? [`level:${latestReceiptRecord.evidenceLevel}`, `score:${latestReceiptRecord.evidenceScore}`, `warnings:${latestReceiptRecord.validationWarnings.length}`]
        : ['no receipt validated'],
      nextAction: latestReceiptRecord?.status === 'accepted'
        ? 'Use only this accepted receipt for customer-visible proof and memory write.'
        : latestReceiptRecord?.rejectedReason || 'Collect public URL, screenshot id or signed externalRunId.',
      stopLine: 'Rejected receipts do not enter operating analysis or memory.',
    }),
    stage({
      id: 'signals',
      label: 'Business signal extraction',
      status: businessSignals.summary.acceptedReceipts > 0 ? 'done' : 'waiting',
      owner: 'ops',
      evidence: [
        `reservations:${businessSignals.summary.reservations}`,
        `couponClaims:${businessSignals.summary.couponClaims}`,
        `redemptions:${businessSignals.summary.redemptions}`,
        `inquiries:${businessSignals.summary.inquiries}`,
      ],
      nextAction: businessSignals.nextActions[0] || 'Wait for accepted receipt before extracting aggregate business signals.',
      stopLine: 'No private messages, customer identifiers, coupon codes or raw POS rows.',
    }),
    stage({
      id: 'post-run',
      label: 'Post-run review',
      status: input.postRunReviewPack.summary.acceptedReceipts > 0 ? 'done' : 'blocked',
      owner: 'store-manager',
      evidence: [
        `verdict:${input.postRunReviewPack.verdict}`,
        `storeTasks:${input.postRunReviewPack.summary.storeTasks}`,
        `blockedInsights:${input.postRunReviewPack.summary.blockedInsights}`,
      ],
      nextAction: input.postRunReviewPack.lanes.find(item => item.status !== 'ready')?.nextAction
        || input.postRunReviewPack.nextLoopSop[0]?.output
        || 'Close the run with store manager follow-up.',
      stopLine: 'Do not claim true operating analysis without sanitized merchant data contracts.',
    }),
    stage({
      id: 'next-loop',
      label: 'Next loop memory and tasking',
      status: canWriteMemory ? 'done' : 'waiting',
      owner: 'data-ops',
      evidence: canWriteMemory
        ? ['accepted receipt can write aggregate memory', `businessItems:${businessSignals.items.length}`]
        : ['memory write blocked until accepted receipt'],
      nextAction: canWriteMemory
        ? 'Write only accepted proof, aggregate counts, owner and next action into reusable restaurant memory.'
        : 'Keep memory in preflight mode until proof is accepted.',
      stopLine: 'Never write secrets, raw browser profile ids, private chat text, customer PII, coupon codes or raw POS rows.',
    }),
  ];

  return {
    ok: true,
    payloadShape: 'restaurant-provider-receipt-lifecycle-v1',
    generatedAt: now.toISOString(),
    verdict: verdict({ waitingReceipts, acceptedReceipts, rejectedReceipts, actionRequired }),
    summary: {
      runs: input.runs.length,
      waitingReceipts,
      acceptedReceipts,
      rejectedReceipts,
      actionRequired,
      businessSignalItems: businessSignals.items.length,
      storeTasks: input.postRunReviewPack.summary.storeTasks,
      canWriteMemory,
      canUpdateOperatingInsight,
      canClaimExternalAutomation: false,
    },
    latestRun: latestRunRecord ? {
      eventId: latestRunRecord.eventId,
      status: latestRunRecord.status,
      target: latestRunRecord.target,
      restaurant: latestRunRecord.restaurant,
      offer: latestRunRecord.offer,
      owner: latestRunRecord.owner,
      nextAction: latestRunRecord.nextAction,
      createdAt: latestRunRecord.createdAt,
    } : undefined,
    latestReceipt: latestReceiptRecord ? {
      receiptId: latestReceiptRecord.receiptId,
      status: latestReceiptRecord.status,
      eventId: latestReceiptRecord.eventId,
      channel: latestReceiptRecord.channel,
      externalRunId: latestReceiptRecord.externalRunId,
      evidenceLevel: latestReceiptRecord.evidenceLevel,
      evidenceScore: latestReceiptRecord.evidenceScore,
      signalType: latestReceiptRecord.signalType,
      businessSignals: latestReceiptRecord.businessSignals,
      validationWarnings: latestReceiptRecord.validationWarnings,
      rejectedReason: latestReceiptRecord.rejectedReason,
      createdAt: latestReceiptRecord.createdAt,
    } : undefined,
    stages,
    receiptInbox: {
      payloadShape: input.providerReceiptInbox.payloadShape,
      summary: input.providerReceiptInbox.summary,
      requests: input.providerReceiptInbox.requests.slice(0, 6),
      externalRequired: input.providerReceiptInbox.externalRequired,
      safetyBoundary: input.providerReceiptInbox.safetyBoundary,
    },
    businessSignals: {
      summary: businessSignals.summary,
      items: businessSignals.items.slice(0, 8),
      nextActions: businessSignals.nextActions,
      safetyBoundary: businessSignals.safetyBoundary,
    },
    postRunReview: {
      payloadShape: input.postRunReviewPack.payloadShape,
      verdict: input.postRunReviewPack.verdict,
      summary: input.postRunReviewPack.summary,
      lanes: input.postRunReviewPack.lanes,
      nextLoopSop: input.postRunReviewPack.nextLoopSop,
      safetyBoundary: input.postRunReviewPack.safetyBoundary,
    },
    memoryWriteRule: {
      allowed: canWriteMemory,
      writes: ['accepted proof id', 'aggregate signal counts', 'store owner', 'next action', 'blocked external requirements'],
      forbidden: ['API keys', 'cookies', 'raw browser profile ids', 'private-message text', 'customer PII', 'coupon codes', 'payment ids', 'raw POS rows'],
    },
    externalRequired: Array.from(new Set([
      ...input.providerReceiptInbox.externalRequired,
      ...input.postRunReviewPack.externalRequired,
      ...stages.filter(item => item.status !== 'done').map(item => item.nextAction),
    ])).slice(0, 12),
    safetyBoundary: 'Provider Receipt Lifecycle is a callback-to-closeout state machine. It accepts only signed/public proof and sanitized aggregate signals; it never stores provider secrets, cookies, raw browser profile ids, private messages, customer PII, coupon codes, payment ids or raw POS rows, and it never claims external automation without accepted receipts.',
  };
}

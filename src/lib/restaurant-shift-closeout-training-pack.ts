import type { RestaurantAgentRecoveryPlan } from '@/lib/restaurant-agent-recovery';
import type { RestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';
import type { RestaurantPostRunReviewPack } from '@/lib/restaurant-post-run-review-pack';
import type { RestaurantCapabilityTrainingPlan, RestaurantCapabilityTrainingRecord, RestaurantCapabilityTrainingRecordInput } from '@/lib/restaurant-capability-training';

export type RestaurantShiftCloseoutTrainingLane = {
  id: 'receipt-watch' | 'recovery' | 'post-run-review' | 'capability-training' | 'next-loop';
  status: 'ready' | 'waiting' | 'blocked';
  owner: 'ops' | 'runtime-admin' | 'store-manager' | 'finance';
  evidence: string[];
  nextAction: string;
};

export type RestaurantShiftCloseoutTrainingPack = {
  ok: true;
  payloadShape: 'restaurant-shift-closeout-training-pack-v1';
  generatedAt: string;
  verdict: 'train-from-proof' | 'waiting-receipt' | 'recover-first' | 'manual-closeout';
  summary: {
    acceptedReceipts: number;
    waitingReceipts: number;
    recoveryActions: number;
    postRunVerdict: RestaurantPostRunReviewPack['verdict'];
    trainingDrafts: number;
    canRecordTraining: boolean;
    canClaimExternalAutomation: false;
  };
  lanes: RestaurantShiftCloseoutTrainingLane[];
  trainingDrafts: Array<RestaurantCapabilityTrainingRecordInput & {
    acceptedWhen: string;
    blockedWhen: string;
  }>;
  providerReceiptInbox: Pick<RestaurantProviderReceiptInbox, 'payloadShape' | 'summary' | 'requests' | 'externalRequired' | 'safetyBoundary'>;
  recovery: Pick<RestaurantAgentRecoveryPlan, 'inspectedRuns' | 'acceptedReceipts' | 'actions' | 'retryPolicy' | 'blockedExternal'>;
  postRunReviewPack: Pick<RestaurantPostRunReviewPack, 'payloadShape' | 'verdict' | 'summary' | 'lanes' | 'nextLoopSop' | 'externalRequired' | 'safetyBoundary'>;
  capabilityTrainingPlan: Pick<RestaurantCapabilityTrainingPlan, 'payloadShape' | 'summary' | 'items' | 'safetyBoundary'>;
  operatorRunbook: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

export type RestaurantShiftCloseoutTrainingRecordAttempt = {
  ok: boolean;
  payloadShape: 'restaurant-shift-closeout-training-record-attempt-v1';
  generatedAt: string;
  verdict: 'recorded' | 'blocked-waiting-proof' | 'partially-recorded';
  summary: {
    drafts: number;
    recordableDrafts: number;
    recorded: number;
    rejected: number;
    canClaimExternalAutomation: false;
  };
  records: RestaurantCapabilityTrainingRecord[];
  rejectedDrafts: Array<{
    capabilityId: string;
    name: string;
    reason: string;
  }>;
  nextAction: string;
  safetyBoundary: string;
};

function lane(input: RestaurantShiftCloseoutTrainingLane): RestaurantShiftCloseoutTrainingLane {
  return input;
}

function verdict(input: {
  acceptedReceipts: number;
  waitingReceipts: number;
  recoveryActions: number;
  canRecordTraining: boolean;
}): RestaurantShiftCloseoutTrainingPack['verdict'] {
  if (input.canRecordTraining) return 'train-from-proof';
  if (input.waitingReceipts > 0) return 'waiting-receipt';
  if (input.recoveryActions > 0) return 'recover-first';
  return 'manual-closeout';
}

function buildTrainingDrafts(input: {
  postRunReviewPack: RestaurantPostRunReviewPack;
  providerReceiptInbox: RestaurantProviderReceiptInbox;
}): RestaurantShiftCloseoutTrainingPack['trainingDrafts'] {
  const hasProof = input.postRunReviewPack.summary.acceptedReceipts > 0;
  const hasOperatingData = input.postRunReviewPack.summary.acceptedPosImports > 0;
  const drafts: RestaurantShiftCloseoutTrainingPack['trainingDrafts'] = [];

  drafts.push({
    kind: 'material',
    capabilityId: 'auto-publish-receipts',
    name: 'Accepted public proof closeout pattern',
    owner: 'ops',
    source: 'manual',
    evidenceSummary: hasProof
      ? `Accepted receipt count ${input.postRunReviewPack.summary.acceptedReceipts}; train content closeout on public proof, screenshot id and signed callback fields only.`
      : 'Waiting for accepted public proof before training content closeout.',
    acceptedWhen: 'At least one public proof URL, screenshot id or signed external receipt is accepted.',
    blockedWhen: 'No proof, private message body, account cookie, token, or unverifiable screenshot is the only evidence.',
  });

  drafts.push({
    kind: 'material',
    capabilityId: 'real-operating-analysis',
    name: 'Sanitized POS aggregate closeout pattern',
    owner: 'finance',
    source: 'pos-import',
    evidenceSummary: hasOperatingData
      ? `Accepted POS aggregate imports ${input.postRunReviewPack.summary.acceptedPosImports}; train only on coupon claims, redemptions, gross sales, order count and inventory aggregate fields.`
      : 'Waiting for sanitized POS/coupon aggregate import before training operating analysis.',
    acceptedWhen: 'A no-PII POS/coupon/member aggregate import passes field validation.',
    blockedWhen: 'Raw order rows, customer identifiers, payment ids or coupon codes are required.',
  });

  if (input.providerReceiptInbox.summary.waitingReceipt > 0 || input.providerReceiptInbox.summary.blockedBeforeDispatch > 0) {
    drafts.push({
      kind: 'provider',
      capabilityId: 'runtime-recovery-and-receipts',
      name: 'Provider receipt recovery pattern',
      owner: 'runtime-admin',
      source: 'provider-setup',
      evidenceSummary: `Receipt inbox waiting ${input.providerReceiptInbox.summary.waitingReceipt}, blocked ${input.providerReceiptInbox.summary.blockedBeforeDispatch}; train recovery on signed callback, retry limit and manual proof fallback.`,
      acceptedWhen: 'A provider run has a signed receipt or a manual public proof fallback path.',
      blockedWhen: 'Runtime key, callback secret, browser profile or merchant grant is missing.',
    });
  }

  return drafts;
}

export function selectRecordableShiftTrainingDrafts(pack: RestaurantShiftCloseoutTrainingPack): RestaurantShiftCloseoutTrainingPack['trainingDrafts'] {
  if (!pack.summary.canRecordTraining) return [];
  return pack.trainingDrafts.filter(draft => !/^waiting/i.test(draft.evidenceSummary || ''));
}

export function buildRestaurantShiftCloseoutTrainingRecordAttempt(input: {
  pack: RestaurantShiftCloseoutTrainingPack;
  records: RestaurantCapabilityTrainingRecord[];
  now?: Date;
}): RestaurantShiftCloseoutTrainingRecordAttempt {
  const now = input.now || new Date();
  const recordableDrafts = selectRecordableShiftTrainingDrafts(input.pack);
  const rejectedDrafts = input.pack.trainingDrafts
    .filter(draft => !recordableDrafts.includes(draft))
    .map(draft => ({
      capabilityId: draft.capabilityId || 'unknown-capability',
      name: draft.name || 'unnamed draft',
      reason: input.pack.summary.canRecordTraining ? draft.blockedWhen : 'Closeout proof or recovery gate is not ready.',
    }));
  const rejected = input.records.filter(record => !record.accepted).length + rejectedDrafts.length;
  const accepted = input.records.filter(record => record.accepted).length;
  const verdict: RestaurantShiftCloseoutTrainingRecordAttempt['verdict'] = accepted > 0 && rejected > 0
    ? 'partially-recorded'
    : accepted > 0
      ? 'recorded'
      : 'blocked-waiting-proof';

  return {
    ok: accepted > 0,
    payloadShape: 'restaurant-shift-closeout-training-record-attempt-v1',
    generatedAt: now.toISOString(),
    verdict,
    summary: {
      drafts: input.pack.trainingDrafts.length,
      recordableDrafts: recordableDrafts.length,
      recorded: accepted,
      rejected,
      canClaimExternalAutomation: false,
    },
    records: input.records,
    rejectedDrafts,
    nextAction: accepted > 0
      ? 'Rebuild capability training plan and use only accepted training records for the next controlled loop.'
      : input.pack.externalRequired[0] || 'Accept public proof or sanitized aggregate data before recording training.',
    safetyBoundary: 'Shift Closeout Training Record Attempt writes only accepted closeout training records. It never records secrets, cookies, private messages, customer identifiers, coupon codes, payment ids, raw POS rows, or unverified performance claims.',
  };
}

export function buildRestaurantShiftCloseoutTrainingPack(input: {
  providerReceiptInbox: RestaurantProviderReceiptInbox;
  recovery: RestaurantAgentRecoveryPlan;
  postRunReviewPack: RestaurantPostRunReviewPack;
  capabilityTrainingPlan: RestaurantCapabilityTrainingPlan;
  now?: Date;
}): RestaurantShiftCloseoutTrainingPack {
  const now = input.now || new Date();
  const acceptedReceipts = input.postRunReviewPack.summary.acceptedReceipts;
  const waitingReceipts = input.providerReceiptInbox.summary.waitingReceipt;
  const trainingDrafts = buildTrainingDrafts({
    postRunReviewPack: input.postRunReviewPack,
    providerReceiptInbox: input.providerReceiptInbox,
  });
  const canRecordTraining = acceptedReceipts > 0 && input.recovery.actions.filter(action => action.priority === 'critical').length === 0;
  const lanes = [
    lane({
      id: 'receipt-watch',
      status: acceptedReceipts > 0 ? 'ready' : waitingReceipts > 0 ? 'waiting' : 'blocked',
      owner: 'ops',
      evidence: [`accepted:${acceptedReceipts}`, `waiting:${waitingReceipts}`, `actionRequired:${input.providerReceiptInbox.summary.actionRequired}`],
      nextAction: acceptedReceipts > 0
        ? 'Use accepted receipts as the only training and next-loop source.'
        : 'Wait for signed external-receipt callback or import public proof manually.',
    }),
    lane({
      id: 'recovery',
      status: input.recovery.actions.length ? 'blocked' : 'ready',
      owner: input.recovery.actions[0]?.action === 'configure-runtime' ? 'runtime-admin' : 'ops',
      evidence: [`actions:${input.recovery.actions.length}`, `acceptedReceipts:${input.recovery.acceptedReceipts}`],
      nextAction: input.recovery.actions[0]?.nextStep || 'No recovery action is open; keep watching receipts.',
    }),
    lane({
      id: 'post-run-review',
      status: input.postRunReviewPack.verdict === 'needs-proof' ? 'blocked' : input.postRunReviewPack.verdict === 'needs-operating-data' ? 'waiting' : 'ready',
      owner: 'store-manager',
      evidence: [`verdict:${input.postRunReviewPack.verdict}`, `storeTasks:${input.postRunReviewPack.summary.storeTasks}`, `blockedInsights:${input.postRunReviewPack.summary.blockedInsights}`],
      nextAction: input.postRunReviewPack.lanes[0]?.nextAction || 'Build post-run review before training.',
    }),
    lane({
      id: 'capability-training',
      status: canRecordTraining ? 'ready' : 'waiting',
      owner: 'ops',
      evidence: [`drafts:${trainingDrafts.length}`, `existingTraining:${input.capabilityTrainingPlan.summary.total}`],
      nextAction: canRecordTraining
        ? 'Record the accepted proof and aggregate-data drafts into capability training.'
        : 'Keep drafts pending until proof is accepted and critical recovery is clear.',
    }),
    lane({
      id: 'next-loop',
      status: input.postRunReviewPack.verdict === 'ready-for-next-loop' || input.postRunReviewPack.verdict === 'manual-review-ready' ? 'ready' : 'waiting',
      owner: 'store-manager',
      evidence: input.postRunReviewPack.nextLoopSop.slice(0, 3).map(item => `${item.step}:${item.owner}`),
      nextAction: input.postRunReviewPack.nextLoopSop.find(item => item.step === 'Prepare next controlled loop')?.output || 'Prepare the next controlled loop after proof.',
    }),
  ];

  return {
    ok: true,
    payloadShape: 'restaurant-shift-closeout-training-pack-v1',
    generatedAt: now.toISOString(),
    verdict: verdict({
      acceptedReceipts,
      waitingReceipts,
      recoveryActions: input.recovery.actions.length,
      canRecordTraining,
    }),
    summary: {
      acceptedReceipts,
      waitingReceipts,
      recoveryActions: input.recovery.actions.length,
      postRunVerdict: input.postRunReviewPack.verdict,
      trainingDrafts: trainingDrafts.length,
      canRecordTraining,
      canClaimExternalAutomation: false,
    },
    lanes,
    trainingDrafts,
    providerReceiptInbox: {
      payloadShape: input.providerReceiptInbox.payloadShape,
      summary: input.providerReceiptInbox.summary,
      requests: input.providerReceiptInbox.requests.slice(0, 6),
      externalRequired: input.providerReceiptInbox.externalRequired,
      safetyBoundary: input.providerReceiptInbox.safetyBoundary,
    },
    recovery: {
      inspectedRuns: input.recovery.inspectedRuns,
      acceptedReceipts: input.recovery.acceptedReceipts,
      actions: input.recovery.actions.slice(0, 6),
      retryPolicy: input.recovery.retryPolicy,
      blockedExternal: input.recovery.blockedExternal,
    },
    postRunReviewPack: {
      payloadShape: input.postRunReviewPack.payloadShape,
      verdict: input.postRunReviewPack.verdict,
      summary: input.postRunReviewPack.summary,
      lanes: input.postRunReviewPack.lanes,
      nextLoopSop: input.postRunReviewPack.nextLoopSop,
      externalRequired: input.postRunReviewPack.externalRequired,
      safetyBoundary: input.postRunReviewPack.safetyBoundary,
    },
    capabilityTrainingPlan: {
      payloadShape: input.capabilityTrainingPlan.payloadShape,
      summary: input.capabilityTrainingPlan.summary,
      items: input.capabilityTrainingPlan.items.slice(0, 8),
      safetyBoundary: input.capabilityTrainingPlan.safetyBoundary,
    },
    operatorRunbook: [
      'If the sandbox run is forwarded, watch provider receipt inbox before any claim.',
      'If a receipt is missing, run recovery once and then fall back to manual public proof.',
      'Train only from accepted public proof and sanitized aggregate operating data.',
      'Keep next-loop planning to one changed variable: offer, channel, audience or service window.',
      'Never train on keys, cookies, private messages, coupon codes, payment ids, raw POS rows or customer identifiers.',
    ],
    externalRequired: Array.from(new Set([
      ...input.providerReceiptInbox.externalRequired,
      ...input.recovery.blockedExternal,
      ...input.postRunReviewPack.externalRequired,
      ...lanes.filter(item => item.status !== 'ready').map(item => item.nextAction),
    ])).slice(0, 14),
    safetyBoundary: 'Shift Closeout Training Pack closes the loop after a guarded shift sandbox run. It can draft training records and next-loop actions, but it does not auto-publish, auto-contact customers, auto-redeem coupons, expose provider secrets, read private messages, store raw POS rows, or claim external automation without accepted receipts.',
  };
}

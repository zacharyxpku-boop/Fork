import type { RestaurantBusinessSignalReport } from '@/lib/restaurant-agent-business-signals';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';
import type { RestaurantProviderReceiptLifecycle } from '@/lib/restaurant-provider-receipt-lifecycle';

export type RestaurantProviderCallbackCloseoutConsole = {
  ok: true;
  payloadShape: 'restaurant-provider-callback-closeout-console-v1';
  generatedAt: string;
  verdict: 'accepted-train-next-run' | 'rejected-recover' | 'waiting-valid-receipt';
  summary: {
    signatureVerified: boolean;
    receiptAccepted: boolean;
    canWriteMemory: boolean;
    canTrainNextRun: boolean;
    canUpdateOperatingInsight: boolean;
    canClaimExternalAutomation: false;
  };
  callback: {
    receiptId: string;
    eventId: string;
    externalRunId?: string;
    status: RestaurantAgentReceiptRecord['status'];
    source: RestaurantAgentReceiptRecord['source'];
    evidenceLevel: RestaurantAgentReceiptRecord['evidenceLevel'];
    evidenceScore: number;
    rejectedReason?: string;
    validationWarnings: string[];
  };
  trainingGate: {
    allowedWrites: string[];
    nextRunInputs: string[];
    forbiddenWrites: string[];
  };
  operatingUpdate: {
    acceptedReceipts: number;
    rejectedReceipts: number;
    reservations: number;
    couponClaims: number;
    redemptions: number;
    inquiries: number;
    visitIntent: number;
  };
  recoveryQueue: Array<{
    owner: 'runtime-admin' | 'provider' | 'ops' | 'store-manager' | 'data-ops';
    reason: string;
    nextAction: string;
  }>;
  externalRequired: string[];
  safetyBoundary: string;
};

function unique(values: string[], limit = 12): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function verdictFor(input: {
  receipt: RestaurantAgentReceiptRecord;
  lifecycle: RestaurantProviderReceiptLifecycle;
}): RestaurantProviderCallbackCloseoutConsole['verdict'] {
  if (input.receipt.status === 'accepted' && input.lifecycle.summary.canWriteMemory) return 'accepted-train-next-run';
  if (input.receipt.status === 'rejected') return 'rejected-recover';
  return 'waiting-valid-receipt';
}

export function buildRestaurantProviderCallbackCloseoutConsole(input: {
  receipt: RestaurantAgentReceiptRecord;
  providerReceiptLifecycle: RestaurantProviderReceiptLifecycle;
  providerReceiptInbox: RestaurantProviderReceiptInbox;
  businessSignals: RestaurantBusinessSignalReport;
  signatureVerified: boolean;
  now?: Date;
}): RestaurantProviderCallbackCloseoutConsole {
  const now = input.now || new Date();
  const receiptAccepted = input.receipt.status === 'accepted';
  const canWriteMemory = input.providerReceiptLifecycle.summary.canWriteMemory && receiptAccepted;
  const blockedStages = input.providerReceiptLifecycle.stages.filter(stage => stage.status !== 'done');
  const nextRunInputs = receiptAccepted
    ? unique([
      `receipt:${input.receipt.receiptId}`,
      `event:${input.receipt.eventId}`,
      `signal:${input.receipt.signalType}`,
      `evidence:${input.receipt.evidenceLevel}`,
      ...input.businessSignals.nextActions,
    ], 8)
    : ['accepted signed provider receipt required'];

  return {
    ok: true,
    payloadShape: 'restaurant-provider-callback-closeout-console-v1',
    generatedAt: now.toISOString(),
    verdict: verdictFor({
      receipt: input.receipt,
      lifecycle: input.providerReceiptLifecycle,
    }),
    summary: {
      signatureVerified: input.signatureVerified,
      receiptAccepted,
      canWriteMemory,
      canTrainNextRun: canWriteMemory && input.businessSignals.summary.acceptedReceipts > 0,
      canUpdateOperatingInsight: input.providerReceiptLifecycle.summary.canUpdateOperatingInsight,
      canClaimExternalAutomation: false,
    },
    callback: {
      receiptId: input.receipt.receiptId,
      eventId: input.receipt.eventId,
      externalRunId: input.receipt.externalRunId,
      status: input.receipt.status,
      source: input.receipt.source,
      evidenceLevel: input.receipt.evidenceLevel,
      evidenceScore: input.receipt.evidenceScore,
      rejectedReason: input.receipt.rejectedReason,
      validationWarnings: input.receipt.validationWarnings,
    },
    trainingGate: {
      allowedWrites: canWriteMemory ? input.providerReceiptLifecycle.memoryWriteRule.writes : [],
      nextRunInputs,
      forbiddenWrites: input.providerReceiptLifecycle.memoryWriteRule.forbidden,
    },
    operatingUpdate: {
      acceptedReceipts: input.businessSignals.summary.acceptedReceipts,
      rejectedReceipts: input.businessSignals.summary.rejectedReceipts,
      reservations: input.businessSignals.summary.reservations,
      couponClaims: input.businessSignals.summary.couponClaims,
      redemptions: input.businessSignals.summary.redemptions,
      inquiries: input.businessSignals.summary.inquiries,
      visitIntent: input.businessSignals.summary.visitIntent,
    },
    recoveryQueue: blockedStages.map(stage => ({
      owner: stage.owner,
      reason: stage.stopLine,
      nextAction: stage.nextAction,
    })),
    externalRequired: unique([
      ...input.providerReceiptInbox.externalRequired,
      ...input.providerReceiptLifecycle.externalRequired,
      ...blockedStages.map(stage => stage.nextAction),
    ]),
    safetyBoundary: 'Provider Callback Closeout Console is the post-callback gate for one signed external receipt. It can train the next run only from accepted public proof and sanitized aggregate signals; it never stores provider secrets, cookies, browser profile ids, private messages, customer identifiers, coupon codes, payment ids or raw POS rows, and it keeps production automation claims blocked.',
  };
}

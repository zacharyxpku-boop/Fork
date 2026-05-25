import type { RestaurantAiCockpit } from '@/lib/restaurant-ai-cockpit';
import type { RestaurantLeadSandboxAcceptanceFlow } from '@/lib/restaurant-lead-sandbox-acceptance-flow';
import type { RestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import type { RestaurantOperatingInsightReport } from '@/lib/restaurant-operating-insight-report';
import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import type { RestaurantPublishExecutionInbox } from '@/lib/restaurant-publish-execution-inbox';
import type { RestaurantShiftOperatingLoopPack } from '@/lib/restaurant-shift-operating-loop-pack';
import type { RestaurantStoreOperatingPlan, RestaurantStoreOperatingTimeBlock } from '@/lib/restaurant-store-operating-plan';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantTodayCommandLaneId =
  | 'get-customers'
  | 'publish-proof'
  | 'redeem-and-pos'
  | 'review-and-train';

export type RestaurantTodayCommandLane = {
  id: RestaurantTodayCommandLaneId;
  title: string;
  status: 'run-now' | 'needs-proof' | 'provider-gated' | 'blocked';
  owner: 'store-manager' | 'ops' | 'runtime-admin' | 'finance' | 'community-ops';
  businessQuestion: string;
  todayAction: string;
  proofToCollect: string[];
  providerGate: string[];
  acceptance: string;
  stopLine: string;
  sourceEvidence: string[];
};

export type RestaurantTodayCommandCockpit = {
  ok: true;
  payloadShape: 'restaurant-today-command-cockpit-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'operator-ready' | 'proof-first' | 'provider-unlock-first' | 'blocked-sensitive';
  summary: {
    lanes: number;
    runNow: number;
    needsProof: number;
    providerGated: number;
    blocked: number;
    providerHealthReady: number;
    acceptedLeadReceipts: number;
    acceptedPublishReceipts: number;
    measuredInsights: number;
    canClaimAutoPublish: false;
    canClaimAutoAcquisition: false;
    canClaimAutoRedemption: false;
    canClaimTrueOperatingAnalysis: false;
  };
  nextBestAction: {
    laneId: RestaurantTodayCommandLaneId;
    owner: RestaurantTodayCommandLane['owner'];
    action: string;
    reason: string;
    evidenceRequired: string[];
  };
  lanes: RestaurantTodayCommandLane[];
  oneScreenRunbook: string[];
  staffHandoff: Array<{
    owner: RestaurantTodayCommandLane['owner'];
    message: string;
    due: string;
    evidence: string;
  }>;
  externalUnlocks: string[];
  proofLedgerContract: {
    acceptedProof: string[];
    rejectedProof: string[];
    memoryWriteRule: 'accepted-proof-or-sanitized-aggregate-only';
    forbiddenFields: string[];
  };
  sourceSnapshots: {
    aiCockpit: Pick<RestaurantAiCockpit, 'payloadShape' | 'verdict' | 'summary'>;
    shiftLoop: Pick<RestaurantShiftOperatingLoopPack, 'payloadShape' | 'verdict' | 'summary' | 'nextBestAction'>;
    leadFlow: Pick<RestaurantLeadSandboxAcceptanceFlow, 'payloadShape' | 'verdict' | 'summary'>;
    publishInbox: Pick<RestaurantPublishExecutionInbox, 'payloadShape' | 'verdict' | 'summary'>;
    insightReport: Pick<RestaurantOperatingInsightReport, 'payloadShape' | 'verdict' | 'summary'>;
  };
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string, max = 120): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function unique(values: string[], limit = 18): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function firstBlock(plan: RestaurantStoreOperatingPlan, id: string): RestaurantStoreOperatingTimeBlock | undefined {
  return plan.dayPlan.find(item => item.id === id) || plan.weekPlan.find(item => item.id === id);
}

function lane(input: RestaurantTodayCommandLane): RestaurantTodayCommandLane {
  return input;
}

function statusFrom(input: { blocked?: boolean; provider?: boolean; proof?: boolean }): RestaurantTodayCommandLane['status'] {
  if (input.blocked) return 'blocked';
  if (input.provider) return 'provider-gated';
  if (input.proof) return 'needs-proof';
  return 'run-now';
}

function nextBestAction(lanes: RestaurantTodayCommandLane[]): RestaurantTodayCommandCockpit['nextBestAction'] {
  const selected = lanes.find(item => item.status === 'blocked')
    || lanes.find(item => item.status === 'provider-gated')
    || lanes.find(item => item.status === 'needs-proof')
    || lanes[0];
  return {
    laneId: selected.id,
    owner: selected.owner,
    action: selected.todayAction,
    reason: selected.businessQuestion,
    evidenceRequired: selected.proofToCollect,
  };
}

function shiftOwnerToLaneOwner(owner: RestaurantShiftOperatingLoopPack['nextBestAction']['owner']): RestaurantTodayCommandLane['owner'] {
  if (owner === 'data-ops') return 'finance';
  if (owner === 'merchant') return 'store-manager';
  return owner;
}

export function buildRestaurantTodayCommandCockpit(input: RestaurantTrialIntake & {
  aiCockpit: RestaurantAiCockpit;
  storeOperatingPlan: RestaurantStoreOperatingPlan;
  shiftOperatingLoopPack: RestaurantShiftOperatingLoopPack;
  leadSandboxAcceptanceFlow: RestaurantLeadSandboxAcceptanceFlow;
  publishExecutionInbox: RestaurantPublishExecutionInbox;
  operatingDataContract: RestaurantOperatingDataContract;
  operatingInsightReport: RestaurantOperatingInsightReport;
  providerReadinessHealth: RestaurantProviderReadinessHealth;
  now?: Date;
}): RestaurantTodayCommandCockpit {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, input.aiCockpit.restaurant || input.storeOperatingPlan.restaurant);
  const offer = clean(input.offer, input.aiCockpit.offer || input.storeOperatingPlan.offer);
  const trafficBlock = firstBlock(input.storeOperatingPlan, 'dinner-traffic');
  const proofBlock = firstBlock(input.storeOperatingPlan, 'content-proof');
  const closeoutBlock = firstBlock(input.storeOperatingPlan, 'closeout-review');
  const dataBlock = firstBlock(input.storeOperatingPlan, 'week-day3');
  const leadFlow = input.leadSandboxAcceptanceFlow;
  const publishInbox = input.publishExecutionInbox;
  const insightReport = input.operatingInsightReport;

  const lanes = [
    lane({
      id: 'get-customers',
      title: 'Get customers into the store',
      status: statusFrom({
        blocked: leadFlow.verdict === 'blocked-sensitive',
        provider: !leadFlow.summary.canSubmitProviderPackage && leadFlow.summary.acceptedLeadReceipts === 0,
        proof: leadFlow.summary.acceptedLeadReceipts === 0,
      }),
      owner: 'community-ops',
      businessQuestion: 'Can we turn reservations, coupon claims, inquiries and visit intent into owner-visible follow-up today?',
      todayAction: leadFlow.summary.acceptedLeadReceipts > 0
        ? 'Promote accepted aggregate lead receipts into store-manager follow-up tasks.'
        : trafficBlock?.action || 'Create staff-reviewed reservation, coupon and inquiry follow-up tasks.',
      proofToCollect: leadFlow.receiptAcceptance.acceptedEvidence,
      providerGate: unique([
        ...leadFlow.externalRequired,
        ...leadFlow.sanitizedProviderPackage.lanes.flatMap(item => item.providerUnlocks),
      ], 6),
      acceptance: leadFlow.receiptAcceptance.closeoutRule,
      stopLine: leadFlow.safetyBoundary,
      sourceEvidence: [`leadFlow:${leadFlow.verdict}`, `acceptedLeadReceipts:${leadFlow.summary.acceptedLeadReceipts}`],
    }),
    lane({
      id: 'publish-proof',
      title: 'Publish only with proof slots',
      status: statusFrom({
        provider: publishInbox.summary.waitingProvider > 0 && publishInbox.summary.acceptedReceipts === 0,
        proof: publishInbox.summary.acceptedReceipts === 0,
        blocked: publishInbox.summary.blocked > 0,
      }),
      owner: 'ops',
      businessQuestion: 'Can content go out with a public proof link, screenshot id or signed callback instead of a verbal claim?',
      todayAction: publishInbox.summary.acceptedReceipts > 0
        ? 'Use accepted publish proof in the next content and follow-up loop.'
        : proofBlock?.action || publishInbox.tasks[0]?.action || 'Prepare approved content and public proof slot.',
      proofToCollect: unique(publishInbox.tasks.flatMap(item => item.evidenceRequired), 8),
      providerGate: publishInbox.providerUnlocks.slice(0, 8),
      acceptance: 'Every published item must have channel, proof id, owner and next-loop use before closeout.',
      stopLine: publishInbox.safetyBoundary,
      sourceEvidence: [`publishInbox:${publishInbox.verdict}`, `acceptedPublishReceipts:${publishInbox.summary.acceptedReceipts}`],
    }),
    lane({
      id: 'redeem-and-pos',
      title: 'Redeem coupons and import POS aggregates',
      status: statusFrom({
        provider: !input.operatingDataContract.summary.canClaimTrueOperatingAnalysis,
        proof: insightReport.summary.acceptedPosImports === 0,
        blocked: insightReport.summary.blocked > 0 && insightReport.summary.acceptedPosImports === 0,
      }),
      owner: 'finance',
      businessQuestion: 'Can we explain coupon redemption, orders and sales from sanitized aggregate data?',
      todayAction: insightReport.summary.acceptedPosImports > 0
        ? insightReport.storeManagerActions[0]?.action || 'Review aggregate redemption and POS signals.'
        : dataBlock?.action || 'Import sanitized POS, coupon and redemption aggregate fields.',
      proofToCollect: unique([
        'businessDate',
        'storeName',
        'offerName',
        'couponClaimCount',
        'redemptionCount',
        'grossSales',
        'orderCount',
        ...input.operatingDataContract.tracks.flatMap(item => item.requiredFields).slice(0, 4),
      ], 10),
      providerGate: input.operatingDataContract.providerSetupRequests.map(item => `${item.provider}: ${item.evidenceRequired}`).slice(0, 8),
      acceptance: 'Operating analysis is limited to accepted aggregate rows and field dictionary evidence.',
      stopLine: insightReport.safetyBoundary,
      sourceEvidence: [`operatingInsight:${insightReport.verdict}`, `posImports:${insightReport.summary.acceptedPosImports}`],
    }),
    lane({
      id: 'review-and-train',
      title: 'Review the shift and train the agent',
      status: statusFrom({
        provider: input.shiftOperatingLoopPack.summary.waitingProvider > 0,
        proof: input.shiftOperatingLoopPack.summary.waitingProof > 0,
        blocked: input.shiftOperatingLoopPack.summary.blocked > 0,
      }),
      owner: shiftOwnerToLaneOwner(input.shiftOperatingLoopPack.nextBestAction.owner),
      businessQuestion: 'Can the next shift start from accepted proof, training records and a single next action?',
      todayAction: input.shiftOperatingLoopPack.nextBestAction.label || closeoutBlock?.action || 'Close the loop with proof and training.',
      proofToCollect: unique([
        ...input.shiftOperatingLoopPack.providerReceiptInbox.externalRequired,
        ...input.shiftOperatingLoopPack.shiftCloseoutTrainingPack.externalRequired,
        'accepted receipt',
        'staff acknowledgement',
        'sanitized aggregate import',
      ], 8),
      providerGate: input.shiftOperatingLoopPack.externalRequired.slice(0, 8),
      acceptance: 'The next shift can only reuse accepted proof, staff acknowledgement, sanitized aggregate imports or accepted training records.',
      stopLine: input.shiftOperatingLoopPack.safetyBoundary,
      sourceEvidence: [`shiftLoop:${input.shiftOperatingLoopPack.verdict}`, `activatedInternal:${input.shiftOperatingLoopPack.summary.activatedInternal}`],
    }),
  ];

  const runNow = lanes.filter(item => item.status === 'run-now').length;
  const needsProof = lanes.filter(item => item.status === 'needs-proof').length;
  const providerGated = lanes.filter(item => item.status === 'provider-gated').length;
  const blocked = lanes.filter(item => item.status === 'blocked').length;
  const verdict: RestaurantTodayCommandCockpit['verdict'] = blocked > 0
    ? 'blocked-sensitive'
    : providerGated > 0
      ? 'provider-unlock-first'
      : needsProof > 0
        ? 'proof-first'
        : 'operator-ready';

  return {
    ok: true,
    payloadShape: 'restaurant-today-command-cockpit-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    verdict,
    summary: {
      lanes: lanes.length,
      runNow,
      needsProof,
      providerGated,
      blocked,
      providerHealthReady: input.providerReadinessHealth.summary.healthReady,
      acceptedLeadReceipts: leadFlow.summary.acceptedLeadReceipts,
      acceptedPublishReceipts: publishInbox.summary.acceptedReceipts,
      measuredInsights: insightReport.summary.measured,
      canClaimAutoPublish: false,
      canClaimAutoAcquisition: false,
      canClaimAutoRedemption: false,
      canClaimTrueOperatingAnalysis: false,
    },
    nextBestAction: nextBestAction(lanes),
    lanes,
    oneScreenRunbook: [
      `Start with ${offer}: confirm offer boundary, owner and proof slot before any external action.`,
      'Run lead intake, publishing, redemption/POS and review as four lanes with visible proof and stop lines.',
      'Use Provider gates as exact setup requests: runtime URL/key, callback secret, merchant grants, browser profile and no-PII data contracts.',
      'Promote only accepted receipts or sanitized aggregate imports into memory, training and next-shift plans.',
    ],
    staffHandoff: lanes.map(item => ({
      owner: item.owner,
      message: `${item.title}: ${item.todayAction}`,
      due: item.id === 'review-and-train' ? 'closeout' : item.id === 'redeem-and-pos' ? 'before closeout' : 'today',
      evidence: item.proofToCollect.slice(0, 3).join(' / ') || 'accepted proof',
    })),
    externalUnlocks: unique([
      ...input.providerReadinessHealth.externalRequired,
      ...lanes.flatMap(item => item.providerGate),
    ], 20),
    proofLedgerContract: {
      acceptedProof: ['public URL', 'screenshot id', 'signed callback receipt', 'staff acknowledgement', 'sanitized aggregate import'],
      rejectedProof: ['sample link', 'unsigned callback', 'private message text', 'customer identifiers', 'raw POS row', 'coupon code', 'payment id', 'secret value'],
      memoryWriteRule: 'accepted-proof-or-sanitized-aggregate-only',
      forbiddenFields: ['phone', 'WeChat ID', 'member name', 'private message body', 'coupon code', 'payment id', 'cookie', 'token', 'raw POS row', 'browser profile secret'],
    },
    sourceSnapshots: {
      aiCockpit: {
        payloadShape: input.aiCockpit.payloadShape,
        verdict: input.aiCockpit.verdict,
        summary: input.aiCockpit.summary,
      },
      shiftLoop: {
        payloadShape: input.shiftOperatingLoopPack.payloadShape,
        verdict: input.shiftOperatingLoopPack.verdict,
        summary: input.shiftOperatingLoopPack.summary,
        nextBestAction: input.shiftOperatingLoopPack.nextBestAction,
      },
      leadFlow: {
        payloadShape: leadFlow.payloadShape,
        verdict: leadFlow.verdict,
        summary: leadFlow.summary,
      },
      publishInbox: {
        payloadShape: publishInbox.payloadShape,
        verdict: publishInbox.verdict,
        summary: publishInbox.summary,
      },
      insightReport: {
        payloadShape: insightReport.payloadShape,
        verdict: insightReport.verdict,
        summary: insightReport.summary,
      },
    },
    safetyBoundary: 'Today Command Cockpit is a customer-facing operating surface. It coordinates internal tasks, proof slots, provider gates and staff handoff only; it does not publish, contact customers, confirm reservations, redeem coupons, write POS/orders, take payment, dispatch delivery, read private messages, store PII, expose secrets, pull raw POS rows or claim growth without accepted proof and merchant-authorized providers.',
  };
}

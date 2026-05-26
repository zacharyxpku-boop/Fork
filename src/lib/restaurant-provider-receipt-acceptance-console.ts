import type { RestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';
import type { RestaurantProviderReceiptLifecycle } from '@/lib/restaurant-provider-receipt-lifecycle';
import type { RestaurantProviderRunPacket } from '@/lib/restaurant-provider-run-packet';

export type RestaurantProviderReceiptAcceptanceConsole = {
  ok: true;
  payloadShape: 'restaurant-provider-receipt-acceptance-console-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'accepted-train-next-run' | 'waiting-provider-callback' | 'blocked-before-dispatch' | 'receipt-rejected-recovery' | 'simulator-only';
  summary: {
    checks: number;
    ready: number;
    waiting: number;
    blocked: number;
    acceptedReceipts: number;
    waitingReceipts: number;
    rejectedReceipts: number;
    canAcceptReceiptNow: boolean;
    canWriteMemory: boolean;
    canTrainNextRun: boolean;
    canClaimExternalAutomation: false;
  };
  run: {
    runId: string;
    targetProvider: string;
    packageId: string;
    callbackAction: 'external-receipt';
    callbackHeader: 'x-restaurant-agent-signature';
    signalType: string;
  };
  validationChecks: Array<{
    id: 'signature' | 'run-id' | 'public-proof' | 'private-data-boundary' | 'business-signal' | 'memory-write' | 'claim-boundary';
    status: 'ready' | 'waiting' | 'blocked' | 'accepted';
    owner: 'runtime-admin' | 'provider' | 'ops' | 'store-manager' | 'data-ops';
    evidence: string[];
    nextAction: string;
    stopLine: string;
  }>;
  callbackContract: {
    endpoint: '/api/restaurant-agent/runtime';
    action: 'external-receipt';
    requiredHeader: 'x-restaurant-agent-signature';
    acceptedFields: string[];
    rejectedFields: string[];
    sampleBody: RestaurantProviderRunPacket['callbackReceiptExample']['sampleBody'];
  };
  closeoutTraining: {
    memoryWriteAllowed: boolean;
    allowedWrites: string[];
    forbiddenWrites: string[];
    nextRunInputs: string[];
  };
  recoveryQueue: Array<{
    owner: 'runtime-admin' | 'provider' | 'ops' | 'store-manager' | 'data-ops';
    reason: string;
    nextAction: string;
  }>;
  externalRequired: string[];
  safetyBoundary: string;
};

function unique(values: string[], limit = 14): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function verdictFor(input: {
  canTrainNextRun: boolean;
  rejectedReceipts: number;
  waitingReceipts: number;
  providerRunPacket: RestaurantProviderRunPacket;
  actionRequired: number;
}): RestaurantProviderReceiptAcceptanceConsole['verdict'] {
  if (input.canTrainNextRun) return 'accepted-train-next-run';
  if (input.rejectedReceipts > 0) return 'receipt-rejected-recovery';
  if (input.waitingReceipts > 0) return 'waiting-provider-callback';
  if (input.providerRunPacket.summary.canSubmitSimulatorNow && !input.providerRunPacket.summary.canSubmitRealProviderNow) return 'simulator-only';
  return input.actionRequired > 0 ? 'blocked-before-dispatch' : 'waiting-provider-callback';
}

function countChecks(
  checks: RestaurantProviderReceiptAcceptanceConsole['validationChecks'],
  status: RestaurantProviderReceiptAcceptanceConsole['validationChecks'][number]['status'],
): number {
  return checks.filter(item => item.status === status).length;
}

export function buildRestaurantProviderReceiptAcceptanceConsole(input: {
  providerRunPacket: RestaurantProviderRunPacket;
  providerReceiptInbox: RestaurantProviderReceiptInbox;
  providerReceiptLifecycle: RestaurantProviderReceiptLifecycle;
  now?: Date;
}): RestaurantProviderReceiptAcceptanceConsole {
  const now = input.now || new Date();
  const packet = input.providerRunPacket;
  const lifecycle = input.providerReceiptLifecycle;
  const inbox = input.providerReceiptInbox;
  const acceptedReceipts = lifecycle.summary.acceptedReceipts;
  const waitingReceipts = lifecycle.summary.waitingReceipts || inbox.summary.waitingReceipt;
  const rejectedReceipts = lifecycle.summary.rejectedReceipts || inbox.summary.receiptRejected;
  const canWriteMemory = lifecycle.summary.canWriteMemory;
  const canAcceptReceiptNow = packet.summary.packageSelected && packet.summary.scopeSelected;
  const canTrainNextRun = canWriteMemory && acceptedReceipts > 0;
  const sample = packet.callbackReceiptExample.sampleBody;
  const checks: RestaurantProviderReceiptAcceptanceConsole['validationChecks'] = [
    {
      id: 'signature',
      status: canAcceptReceiptNow ? 'ready' : 'blocked',
      owner: 'runtime-admin',
      evidence: [packet.callbackReceiptExample.requiredHeader, 'HMAC server-side secret required'],
      nextAction: canAcceptReceiptNow ? 'Validate x-restaurant-agent-signature before accepting the callback.' : 'Configure callback secret and select a run packet first.',
      stopLine: 'Unsigned callbacks never close a provider run.',
    },
    {
      id: 'run-id',
      status: packet.request.bodyPreview.packageId ? 'ready' : 'blocked',
      owner: 'provider',
      evidence: [sample.eventId, sample.externalRunId, packet.selected.packageId],
      nextAction: 'Match eventId and externalRunId to the selected provider run packet.',
      stopLine: 'Missing run id or mismatched event id keeps the run open.',
    },
    {
      id: 'public-proof',
      status: acceptedReceipts > 0 ? 'accepted' : waitingReceipts > 0 ? 'waiting' : 'blocked',
      owner: 'ops',
      evidence: unique(packet.callbackReceiptExample.acceptedFields, 8),
      nextAction: acceptedReceipts > 0 ? 'Use accepted receipt in post-run review.' : 'Collect public proof URL, screenshot id or sanitized aggregate receipt.',
      stopLine: 'Private inbox screenshots, unverifiable proof and raw customer data are rejected.',
    },
    {
      id: 'private-data-boundary',
      status: 'ready',
      owner: 'ops',
      evidence: unique(packet.request.forbiddenFields, 8),
      nextAction: 'Reject callback payloads containing forbidden fields.',
      stopLine: 'No API keys, cookies, private-message text, customer identifiers, coupon codes, payment ids or raw POS rows.',
    },
    {
      id: 'business-signal',
      status: lifecycle.summary.businessSignalItems > 0 ? 'accepted' : acceptedReceipts > 0 ? 'ready' : 'waiting',
      owner: 'data-ops',
      evidence: [
        `businessSignalItems:${lifecycle.summary.businessSignalItems}`,
        `signalType:${sample.signalType}`,
        `storeTasks:${lifecycle.summary.storeTasks}`,
      ],
      nextAction: lifecycle.summary.businessSignalItems > 0 ? 'Attach aggregate signals to post-run review.' : 'Wait for accepted receipt before extracting business signals.',
      stopLine: 'No true operating analysis from generated content alone.',
    },
    {
      id: 'memory-write',
      status: canWriteMemory ? 'accepted' : 'blocked',
      owner: 'store-manager',
      evidence: lifecycle.memoryWriteRule.allowed ? lifecycle.memoryWriteRule.writes : ['memory write blocked until accepted receipt'],
      nextAction: canWriteMemory ? 'Write accepted proof summary, aggregate counts, owner and next action into memory.' : 'Keep memory preflight-only until receipt is accepted.',
      stopLine: 'Memory cannot store pending proof, private data, raw POS rows or secrets.',
    },
    {
      id: 'claim-boundary',
      status: 'blocked',
      owner: 'ops',
      evidence: ['canClaimExternalAutomation:false', `acceptedReceipts:${acceptedReceipts}`],
      nextAction: 'Keep production automation claims blocked until repeated real provider receipts and merchant data contracts exist.',
      stopLine: 'A simulator packet or one unaccepted run is not a production automation proof.',
    },
  ];

  const recoveryQueue = checks
    .filter(item => item.status === 'blocked' || item.status === 'waiting')
    .map(item => ({
      owner: item.owner,
      reason: item.stopLine,
      nextAction: item.nextAction,
    }));

  return {
    ok: true,
    payloadShape: 'restaurant-provider-receipt-acceptance-console-v1',
    generatedAt: now.toISOString(),
    restaurant: packet.restaurant,
    offer: packet.offer,
    verdict: verdictFor({
      canTrainNextRun,
      rejectedReceipts,
      waitingReceipts,
      providerRunPacket: packet,
      actionRequired: inbox.summary.actionRequired,
    }),
    summary: {
      checks: checks.length,
      ready: countChecks(checks, 'ready'),
      waiting: countChecks(checks, 'waiting'),
      blocked: countChecks(checks, 'blocked'),
      acceptedReceipts,
      waitingReceipts,
      rejectedReceipts,
      canAcceptReceiptNow,
      canWriteMemory,
      canTrainNextRun,
      canClaimExternalAutomation: false,
    },
    run: {
      runId: packet.selected.runId,
      targetProvider: packet.summary.targetProvider,
      packageId: packet.selected.packageId,
      callbackAction: 'external-receipt',
      callbackHeader: 'x-restaurant-agent-signature',
      signalType: sample.signalType,
    },
    validationChecks: checks,
    callbackContract: {
      endpoint: '/api/restaurant-agent/runtime',
      action: 'external-receipt',
      requiredHeader: 'x-restaurant-agent-signature',
      acceptedFields: packet.callbackReceiptExample.acceptedFields,
      rejectedFields: packet.request.forbiddenFields,
      sampleBody: sample,
    },
    closeoutTraining: {
      memoryWriteAllowed: canWriteMemory,
      allowedWrites: lifecycle.memoryWriteRule.writes,
      forbiddenWrites: lifecycle.memoryWriteRule.forbidden,
      nextRunInputs: unique([
        ...lifecycle.memoryWriteRule.writes,
        ...(packet.acceptanceChecklist.find(item => item.id === 'memory-training')?.evidence || []),
        'accepted provider receipt only',
      ], 8),
    },
    recoveryQueue,
    externalRequired: unique([
      ...packet.externalRequired,
      ...lifecycle.externalRequired,
      ...inbox.externalRequired,
      ...recoveryQueue.map(item => item.nextAction),
    ]),
    safetyBoundary: 'Provider Receipt Acceptance Console validates signed callbacks, public proof and sanitized aggregate signals before closeout training. It never stores provider secrets, cookies, raw browser profile ids, private messages, customer identifiers, coupon codes, payment ids or raw POS rows, and it keeps external automation claims blocked until accepted real receipts and merchant data contracts exist.',
  };
}

import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantLeadAcquisitionProviderWorkbench, RestaurantLeadAcquisitionProviderLane } from '@/lib/restaurant-lead-acquisition-provider-workbench';
import type { RestaurantProviderSandboxContract } from '@/lib/restaurant-provider-sandbox-contract';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantLeadSandboxAcceptanceStage = {
  id: 'sanitized-package' | 'provider-submit-gate' | 'signed-lead-receipt' | 'staff-approval' | 'recovery-path' | 'memory-write-boundary';
  label: string;
  status: 'passed' | 'waiting-provider' | 'waiting-proof' | 'blocked';
  owner: 'ops' | 'runtime-admin' | 'store-manager' | 'merchant' | 'data-ops';
  evidence: string[];
  nextAction: string;
  stopLine: string;
};

export type RestaurantLeadSandboxAcceptanceFlow = {
  ok: true;
  payloadShape: 'restaurant-lead-sandbox-acceptance-flow-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'ready-for-provider-submit' | 'waiting-provider-setup' | 'waiting-proof' | 'blocked-sensitive';
  summary: {
    stages: number;
    passed: number;
    waitingProvider: number;
    waitingProof: number;
    blocked: number;
    acceptedLeadReceipts: number;
    rejectedLeadReceipts: number;
    canSubmitProviderPackage: boolean;
    memoryWriteReady: boolean;
    canClaimAutoAcquisition: false;
    canContactCustomer: false;
  };
  sanitizedProviderPackage: {
    packageId: string;
    action: 'lead-acquisition-provider-submit';
    lanes: Array<Pick<RestaurantLeadAcquisitionProviderLane, 'id' | 'label' | 'owner' | 'status'> & {
      allowedAggregateFields: string[];
      providerUnlocks: string[];
    }>;
    callbackAction: 'lead-acquisition-receipt';
    callbackHeader: 'x-restaurant-agent-signature';
    forbiddenFields: string[];
    operatorApprovalRequired: true;
  };
  stages: RestaurantLeadSandboxAcceptanceStage[];
  receiptAcceptance: {
    acceptedReceiptIds: string[];
    rejectedReceiptIds: string[];
    requiredSignalTypes: string[];
    acceptedEvidence: string[];
    closeoutRule: string;
  };
  leadMemoryGate: {
    writeMode: 'aggregate-only-after-accepted-receipt';
    status: 'ready' | 'waiting-receipt' | 'blocked-sensitive';
    allowedFields: string[];
    forbiddenFields: string[];
    nextAction: string;
  };
  recoveryPlan: Array<{
    id: string;
    trigger: string;
    owner: 'runtime-admin' | 'store-manager' | 'merchant' | 'data-ops';
    action: string;
    evidenceRequired: string;
  }>;
  externalRequired: string[];
  safetyBoundary: string;
};

const LEAD_SIGNAL_TYPES = new Set(['reservation', 'coupon-claim', 'private-domain-followup', 'visit-intent', 'manual-review']);

function clean(value: unknown, fallback: string, max = 120): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 33 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function stage(input: RestaurantLeadSandboxAcceptanceStage): RestaurantLeadSandboxAcceptanceStage {
  return input;
}

function leadReceipts(receipts: RestaurantAgentReceiptRecord[]): RestaurantAgentReceiptRecord[] {
  return receipts.filter(receipt => LEAD_SIGNAL_TYPES.has(receipt.signalType));
}

function laneBlocked(workbench: RestaurantLeadAcquisitionProviderWorkbench): boolean {
  return workbench.lanes.some(lane => lane.status === 'blocked');
}

export function buildRestaurantLeadSandboxAcceptanceFlow(input: RestaurantTrialIntake & {
  leadAcquisitionProviderWorkbench: RestaurantLeadAcquisitionProviderWorkbench;
  providerSandboxContract?: RestaurantProviderSandboxContract;
  receipts?: RestaurantAgentReceiptRecord[];
  now?: Date;
}): RestaurantLeadSandboxAcceptanceFlow {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, input.leadAcquisitionProviderWorkbench.restaurant || 'Trial restaurant');
  const offer = clean(input.offer, input.leadAcquisitionProviderWorkbench.offer || 'Today offer');
  const receipts = leadReceipts(input.receipts || []);
  const acceptedLeadReceipts = receipts.filter(receipt => receipt.status === 'accepted');
  const rejectedLeadReceipts = receipts.filter(receipt => receipt.status === 'rejected');
  const blockedSensitive = laneBlocked(input.leadAcquisitionProviderWorkbench);
  const packageId = `lead-sandbox-${stableId([restaurant, offer, input.leadAcquisitionProviderWorkbench.generatedAt])}`;
  const providerCanRunSandbox = Boolean(input.providerSandboxContract?.summary.canRunSandbox);
  const callbackReady = input.leadAcquisitionProviderWorkbench.summary.callbackReady
    || Boolean(input.providerSandboxContract?.checks.some(check => check.id === 'callback-signature' && check.status === 'passed'));
  const hasAcceptedReceipt = acceptedLeadReceipts.length > 0;
  const canSubmitProviderPackage = !blockedSensitive && providerCanRunSandbox && callbackReady;
  const memoryWriteReady = hasAcceptedReceipt;

  const stages = [
    stage({
      id: 'sanitized-package',
      label: 'Sanitized lead provider package',
      status: input.leadAcquisitionProviderWorkbench.lanes.length ? 'passed' : 'blocked',
      owner: 'ops',
      evidence: [`package:${packageId}`, `lanes:${input.leadAcquisitionProviderWorkbench.summary.lanes}`],
      nextAction: 'Send only aggregate source counts, owner tasks and proof ids to the Provider sandbox.',
      stopLine: 'Do not include phone, WeChat ID, member name, private message text, coupon code, cookie, token or raw browser profile id.',
    }),
    stage({
      id: 'provider-submit-gate',
      label: 'Provider sandbox submit gate',
      status: canSubmitProviderPackage ? 'passed' : blockedSensitive ? 'blocked' : 'waiting-provider',
      owner: blockedSensitive ? 'merchant' : 'runtime-admin',
      evidence: input.providerSandboxContract
        ? [`canRunSandbox:${input.providerSandboxContract.summary.canRunSandbox}`, `verdict:${input.providerSandboxContract.verdict}`]
        : ['provider sandbox contract not built'],
      nextAction: canSubmitProviderPackage
        ? 'Submit the sanitized package to the configured sandbox runtime and wait for signed lead receipt.'
        : blockedSensitive
          ? 'Resolve sensitive/private-domain lane blocks before any provider submit.'
          : 'Configure runtime URL, server key, callback secret, merchant grant and cost/retry limits.',
      stopLine: 'A submit attempt is not an acquisition claim until an accepted receipt exists.',
    }),
    stage({
      id: 'signed-lead-receipt',
      label: 'Signed lead receipt acceptance',
      status: hasAcceptedReceipt ? 'passed' : rejectedLeadReceipts.length ? 'waiting-proof' : 'waiting-proof',
      owner: 'runtime-admin',
      evidence: hasAcceptedReceipt
        ? acceptedLeadReceipts.map(receipt => `${receipt.receiptId}:${receipt.signalType}`).slice(0, 5)
        : rejectedLeadReceipts.map(receipt => `${receipt.receiptId}:${receipt.rejectedReason || 'rejected'}`).slice(0, 5).concat('no accepted lead receipt'),
      nextAction: hasAcceptedReceipt ? 'Promote accepted aggregate counts into lead memory and store-manager follow-up.' : 'Import a signed lead-acquisition receipt with externalRunId, proof id and aggregate lead count.',
      stopLine: 'Unsigned, duplicate, private or low-evidence receipts cannot unlock memory writes.',
    }),
    stage({
      id: 'staff-approval',
      label: 'Staff approval before contact',
      status: input.leadAcquisitionProviderWorkbench.operatorQueue.some(item => item.owner === 'store-manager' && item.priority !== 'blocked') ? 'passed' : 'waiting-proof',
      owner: 'store-manager',
      evidence: input.leadAcquisitionProviderWorkbench.operatorQueue.map(item => `${item.owner}:${item.priority}`).slice(0, 5),
      nextAction: 'Store manager approves reservation capacity, coupon rules and reply script before any human send.',
      stopLine: 'The system may draft follow-up tasks, but it does not contact customers automatically.',
    }),
    stage({
      id: 'recovery-path',
      label: 'Failed callback recovery path',
      status: rejectedLeadReceipts.length || !hasAcceptedReceipt ? 'waiting-proof' : 'passed',
      owner: 'runtime-admin',
      evidence: [`rejectedLeadReceipts:${rejectedLeadReceipts.length}`, `acceptedLeadReceipts:${acceptedLeadReceipts.length}`],
      nextAction: rejectedLeadReceipts.length ? 'Route rejected receipts to recovery with reason, owner and manual fallback proof.' : 'Keep recovery watcher active until provider receipt arrives.',
      stopLine: 'Do not retry with broader permissions to bypass merchant or data gates.',
    }),
    stage({
      id: 'memory-write-boundary',
      label: 'Aggregate lead memory write',
      status: memoryWriteReady ? 'passed' : blockedSensitive ? 'blocked' : 'waiting-proof',
      owner: 'data-ops',
      evidence: [`memoryWriteReady:${memoryWriteReady}`, `acceptedLeadReceipts:${acceptedLeadReceipts.length}`],
      nextAction: memoryWriteReady ? 'Write aggregate lead counts, source ids, owner and next action only.' : 'Wait for accepted receipt before writing lead memory.',
      stopLine: 'Never write raw customer identity, private message content, coupon code, payment id or raw POS rows into memory.',
    }),
  ];

  const passed = stages.filter(item => item.status === 'passed').length;
  const waitingProvider = stages.filter(item => item.status === 'waiting-provider').length;
  const waitingProof = stages.filter(item => item.status === 'waiting-proof').length;
  const blocked = stages.filter(item => item.status === 'blocked').length;
  const verdict: RestaurantLeadSandboxAcceptanceFlow['verdict'] = blocked > 0
    ? 'blocked-sensitive'
    : canSubmitProviderPackage && !hasAcceptedReceipt
      ? 'ready-for-provider-submit'
      : hasAcceptedReceipt
        ? 'waiting-proof'
        : 'waiting-provider-setup';

  return {
    ok: true,
    payloadShape: 'restaurant-lead-sandbox-acceptance-flow-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    verdict,
    summary: {
      stages: stages.length,
      passed,
      waitingProvider,
      waitingProof,
      blocked,
      acceptedLeadReceipts: acceptedLeadReceipts.length,
      rejectedLeadReceipts: rejectedLeadReceipts.length,
      canSubmitProviderPackage,
      memoryWriteReady,
      canClaimAutoAcquisition: false,
      canContactCustomer: false,
    },
    sanitizedProviderPackage: {
      packageId,
      action: 'lead-acquisition-provider-submit',
      lanes: input.leadAcquisitionProviderWorkbench.lanes.map(lane => ({
        id: lane.id,
        label: lane.label,
        owner: lane.owner,
        status: lane.status,
        allowedAggregateFields: ['sourceId', 'aggregateLeadCount', 'timeWindow', 'evidenceUrl or screenshotId', 'owner', 'nextAction'],
        providerUnlocks: lane.providerUnlocks.slice(0, 5),
      })),
      callbackAction: 'lead-acquisition-receipt',
      callbackHeader: 'x-restaurant-agent-signature',
      forbiddenFields: input.leadAcquisitionProviderWorkbench.providerAcceptanceContract.forbiddenPayloadFields,
      operatorApprovalRequired: true,
    },
    stages,
    receiptAcceptance: {
      acceptedReceiptIds: acceptedLeadReceipts.map(receipt => receipt.receiptId),
      rejectedReceiptIds: rejectedLeadReceipts.map(receipt => receipt.receiptId),
      requiredSignalTypes: Array.from(LEAD_SIGNAL_TYPES),
      acceptedEvidence: ['externalRunId', 'evidenceUrl or screenshotId', 'operator', 'aggregate lead count', 'signed callback header'],
      closeoutRule: 'Close or train lead acquisition only after an accepted aggregate receipt and staff-approved follow-up task exist.',
    },
    leadMemoryGate: {
      writeMode: 'aggregate-only-after-accepted-receipt',
      status: memoryWriteReady ? 'ready' : blockedSensitive ? 'blocked-sensitive' : 'waiting-receipt',
      allowedFields: ['receiptId', 'signalType', 'source channel', 'aggregate counts', 'owner', 'next action', 'proof id'],
      forbiddenFields: input.leadAcquisitionProviderWorkbench.providerAcceptanceContract.forbiddenPayloadFields,
      nextAction: memoryWriteReady ? 'Promote accepted aggregate signal into store-manager queue.' : 'Collect accepted lead receipt before writing memory.',
    },
    recoveryPlan: [
      {
        id: 'lead-callback-missing',
        trigger: 'No signed lead receipt after provider submit SLA.',
        owner: 'runtime-admin',
        action: 'Open provider run, capture failure reason and switch to manual public proof import.',
        evidenceRequired: 'externalRunId or provider error code',
      },
      {
        id: 'lead-receipt-rejected',
        trigger: 'Receipt rejected for low evidence, duplicate or sensitive content.',
        owner: 'data-ops',
        action: 'Ask Provider for aggregate-only receipt and remove forbidden fields before retry.',
        evidenceRequired: 'rejectedReason and sanitized replacement receipt',
      },
      {
        id: 'staff-contact-blocked',
        trigger: 'Staff has not approved reply script, capacity or coupon boundary.',
        owner: 'store-manager',
        action: 'Hold customer contact; create human follow-up checklist only.',
        evidenceRequired: 'staff approval note and role owner',
      },
    ],
    externalRequired: Array.from(new Set([
      ...input.leadAcquisitionProviderWorkbench.externalRequired,
      ...(input.providerSandboxContract?.externalRequired || []),
      ...stages.filter(item => item.status !== 'passed').map(item => item.nextAction),
    ])).slice(0, 12),
    safetyBoundary: 'Lead Sandbox Acceptance Flow is the governed bridge from lead workbench to Provider execution. It only submits sanitized aggregate packages and only writes lead memory after accepted receipts; it does not contact customers, confirm reservations, issue or redeem coupons, scrape private messages, store PII, expose secrets, use raw browser profiles, or claim automatic acquisition without merchant grants and signed proof.',
  };
}

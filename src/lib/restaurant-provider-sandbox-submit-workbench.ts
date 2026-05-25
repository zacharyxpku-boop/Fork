import type { RestaurantRuntimeBridgeResult, RestaurantRuntimeTarget } from '@/lib/restaurant-agent-runtime-bridge';
import type { RestaurantProviderAcceptanceWorkbench } from '@/lib/restaurant-provider-acceptance-workbench';
import type { RestaurantProviderReceiptInbox, RestaurantProviderReceiptRequest } from '@/lib/restaurant-provider-receipt-inbox';
import type { RestaurantProviderSandboxContract } from '@/lib/restaurant-provider-sandbox-contract';
import type { RestaurantTaskProviderHandoff, RestaurantTaskProviderHandoffItem } from '@/lib/restaurant-task-provider-handoff';

type CapabilityMatrixItem = RestaurantProviderAcceptanceWorkbench['capabilityAcceptanceMatrix'][number];

export type RestaurantProviderSandboxSubmitStatus =
  | 'ready-to-submit'
  | 'blocked-provider'
  | 'blocked-data-contract'
  | 'waiting-receipt'
  | 'accepted';

export type RestaurantProviderSandboxSubmitPackage = {
  capabilityId: CapabilityMatrixItem['id'];
  capabilityLabel: string;
  targetRuntime: RestaurantRuntimeTarget;
  status: RestaurantProviderSandboxSubmitStatus;
  selectedPackageId?: string;
  selectedTaskId?: string;
  selectedRequestedAction?: string;
  blockedReason?: string;
  safePayload?: RestaurantTaskProviderHandoffItem['safePayload'];
  submitEndpointShape: {
    method: 'POST';
    target: RestaurantRuntimeTarget;
    endpointEnv: string;
    payloadShape: 'restaurant-agent-external-execution-v1';
    includesSecrets: false;
  };
  callback: {
    endpoint: '/api/restaurant-agent/runtime';
    action: 'external-receipt';
    header: 'x-restaurant-agent-signature';
    signatureRequired: true;
  };
  receiptExpectation: string[];
  recoveryOwner: 'runtime-admin' | 'merchant' | 'ops' | 'data-ops';
  nextAction: string;
  stopLine: string;
};

export type RestaurantProviderSandboxSubmitWorkbench = {
  ok: true;
  payloadShape: 'restaurant-provider-sandbox-submit-workbench-v1';
  generatedAt: string;
  targetRuntime: RestaurantRuntimeTarget;
  summary: {
    capabilities: number;
    readyToSubmit: number;
    blocked: number;
    waitingReceipt: number;
    acceptedReceipt: number;
    canClaimExternalAutomation: false;
  };
  submitPackages: RestaurantProviderSandboxSubmitPackage[];
  capabilitySubmissions: Array<{
    capabilityId: CapabilityMatrixItem['id'];
    label: string;
    status: RestaurantProviderSandboxSubmitStatus;
    selectedPackageId?: string;
    receiptRequestId?: string;
    nextAction: string;
  }>;
  externalRequired: string[];
  bridgeAttempt?: Pick<RestaurantRuntimeBridgeResult, 'ok' | 'target' | 'status' | 'endpoint' | 'externalRunId' | 'message' | 'audit'>;
  safetyBoundary: string;
};

const TARGET_ENDPOINT_ENV: Record<RestaurantRuntimeTarget, string> = {
  lobu: 'RESTAURANT_AGENT_LOBU_RUNTIME_URL + /events',
  openclaw: 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL + /tasks',
  hermes: 'RESTAURANT_AGENT_HERMES_RUNTIME_URL + /runs',
};

const OWNER_BY_CAPABILITY: Record<CapabilityMatrixItem['id'], RestaurantProviderSandboxSubmitPackage['recoveryOwner']> = {
  'auto-publish-proof': 'ops',
  'auto-lead-acquisition': 'merchant',
  'auto-coupon-redemption': 'data-ops',
  'true-operating-analysis': 'data-ops',
  'staff-delivery': 'ops',
};

function unique(values: string[], limit = 16): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function receiptMatchesCapability(request: RestaurantProviderReceiptRequest, capabilityId: CapabilityMatrixItem['id']): boolean {
  if (capabilityId === 'auto-publish-proof') return request.safeReceiptDraft.signalType === 'publish-proof';
  if (capabilityId === 'auto-lead-acquisition') {
    return ['reservation', 'coupon-claim', 'private-domain-followup', 'visit-intent'].includes(request.safeReceiptDraft.signalType);
  }
  if (capabilityId === 'auto-coupon-redemption') return request.safeReceiptDraft.signalType === 'redemption';
  if (capabilityId === 'true-operating-analysis') return ['redemption', 'manual-review'].includes(request.safeReceiptDraft.signalType);
  return request.safeReceiptDraft.signalType === 'manual-review' || request.owner.toLowerCase().includes('ops');
}

function selectReceipt(input: {
  capabilityId: CapabilityMatrixItem['id'];
  receiptInbox: RestaurantProviderReceiptInbox;
}): RestaurantProviderReceiptRequest | undefined {
  return input.receiptInbox.requests.find(request => receiptMatchesCapability(request, input.capabilityId))
    || input.receiptInbox.requests.find(request => request.status === 'waiting-receipt')
    || input.receiptInbox.requests.find(request => request.status === 'accepted')
    || input.receiptInbox.requests[0];
}

function selectPackage(input: {
  capability: CapabilityMatrixItem;
  taskProviderHandoff: RestaurantTaskProviderHandoff;
}): RestaurantTaskProviderHandoffItem | undefined {
  const text = `${input.capability.id} ${input.capability.label} ${input.capability.firstSandboxAction}`.toLowerCase();
  const packages = [...input.taskProviderHandoff.packages, ...input.taskProviderHandoff.blockedPackages];
  const preferred = packages.find(item => {
    if (text.includes('publish')) return item.requestedAction === 'prepare_publish_draft' || item.requestedAction === 'capture_public_receipt';
    if (text.includes('lead') || text.includes('acquisition')) return item.requestedAction === 'summarize_lead_counts';
    if (text.includes('coupon') || text.includes('redemption')) return item.safePayload.evidenceRequired.toLowerCase().includes('redemption')
      || item.safePayload.action.toLowerCase().includes('coupon')
      || item.requestedAction === 'summarize_lead_counts';
    if (text.includes('staff')) return item.safePayload.owner.toLowerCase().includes('ops') || item.safePayload.owner.toLowerCase().includes('store');
    return item.canForward;
  });
  return preferred || packages.find(item => item.canForward) || packages[0];
}

function statusFor(input: {
  capability: CapabilityMatrixItem;
  selectedPackage?: RestaurantTaskProviderHandoffItem;
  receipt?: RestaurantProviderReceiptRequest;
  sandboxContract: RestaurantProviderSandboxContract;
  bridgeAttempt?: RestaurantRuntimeBridgeResult;
}): RestaurantProviderSandboxSubmitStatus {
  if (input.receipt?.status === 'accepted') return 'accepted';
  if (input.receipt?.status === 'waiting-receipt' || input.bridgeAttempt?.status === 'forwarded') return 'waiting-receipt';
  if (input.capability.sandboxStatus === 'needs-data-contract') return 'blocked-data-contract';
  if (input.capability.sandboxStatus === 'needs-provider') return 'blocked-provider';
  if (!input.sandboxContract.summary.canRunSandbox) return 'blocked-provider';
  if (!input.selectedPackage?.canForward) return 'blocked-provider';
  return 'ready-to-submit';
}

function blockedReasonFor(input: {
  capability: CapabilityMatrixItem;
  selectedPackage?: RestaurantTaskProviderHandoffItem;
  sandboxContract: RestaurantProviderSandboxContract;
  receipt?: RestaurantProviderReceiptRequest;
  status: RestaurantProviderSandboxSubmitStatus;
}): string | undefined {
  if (input.status === 'accepted') return undefined;
  if (input.status === 'waiting-receipt') return input.receipt?.nextAction || 'Sandbox run is submitted; wait for signed external receipt.';
  if (input.status === 'blocked-data-contract') return input.capability.dataContractRequired.join(' / ');
  if (!input.sandboxContract.summary.canRunSandbox) return input.sandboxContract.externalRequired[0] || 'Sandbox contract is not ready.';
  if (!input.selectedPackage) return 'No provider handoff package exists yet.';
  if (!input.selectedPackage.canForward) return input.selectedPackage.blockedReasons[0] || input.selectedPackage.nextAction;
  return input.capability.nextAction;
}

export function buildRestaurantProviderSandboxSubmitWorkbench(input: {
  providerAcceptanceWorkbench: RestaurantProviderAcceptanceWorkbench;
  providerSandboxContract: RestaurantProviderSandboxContract;
  taskProviderHandoff: RestaurantTaskProviderHandoff;
  providerReceiptInbox: RestaurantProviderReceiptInbox;
  target?: RestaurantRuntimeTarget;
  bridgeAttempt?: RestaurantRuntimeBridgeResult;
  now?: Date;
}): RestaurantProviderSandboxSubmitWorkbench {
  const targetRuntime = input.target || 'openclaw';
  const submitPackages = input.providerAcceptanceWorkbench.capabilityAcceptanceMatrix.map(capability => {
    const selectedPackage = selectPackage({ capability, taskProviderHandoff: input.taskProviderHandoff });
    const receipt = selectReceipt({ capabilityId: capability.id, receiptInbox: input.providerReceiptInbox });
    const status = statusFor({
      capability,
      selectedPackage,
      receipt,
      sandboxContract: input.providerSandboxContract,
      bridgeAttempt: input.bridgeAttempt,
    });
    const blockedReason = blockedReasonFor({
      capability,
      selectedPackage,
      sandboxContract: input.providerSandboxContract,
      receipt,
      status,
    });

    return {
      capabilityId: capability.id,
      capabilityLabel: capability.label,
      targetRuntime,
      status,
      selectedPackageId: selectedPackage?.executionPackage.packageId,
      selectedTaskId: selectedPackage?.safePayload.taskId,
      selectedRequestedAction: selectedPackage?.requestedAction,
      blockedReason,
      safePayload: selectedPackage?.safePayload,
      submitEndpointShape: {
        method: 'POST',
        target: targetRuntime,
        endpointEnv: TARGET_ENDPOINT_ENV[targetRuntime],
        payloadShape: 'restaurant-agent-external-execution-v1',
        includesSecrets: false,
      },
      callback: {
        endpoint: '/api/restaurant-agent/runtime',
        action: 'external-receipt',
        header: 'x-restaurant-agent-signature',
        signatureRequired: true,
      },
      receiptExpectation: unique([
        ...capability.receiptRequired,
        ...input.providerSandboxContract.acceptanceContract.callbackRequires,
        ...(receipt?.requiredEvidence || []),
      ], 8),
      recoveryOwner: OWNER_BY_CAPABILITY[capability.id],
      nextAction: status === 'ready-to-submit'
        ? `Submit ${selectedPackage?.executionPackage.packageId || 'the selected package'} to ${targetRuntime}, then keep the run open until signed receipt is accepted.`
        : status === 'accepted'
          ? 'Accepted receipt exists; move to post-run review and aggregate memory write.'
          : blockedReason || capability.nextAction,
      stopLine: capability.stopLine,
    } satisfies RestaurantProviderSandboxSubmitPackage;
  });

  const readyToSubmit = submitPackages.filter(item => item.status === 'ready-to-submit').length;
  const waitingReceipt = submitPackages.filter(item => item.status === 'waiting-receipt').length;
  const acceptedReceipt = submitPackages.filter(item => item.status === 'accepted').length;
  const blocked = submitPackages.filter(item => item.status === 'blocked-provider' || item.status === 'blocked-data-contract').length;

  return {
    ok: true,
    payloadShape: 'restaurant-provider-sandbox-submit-workbench-v1',
    generatedAt: (input.now || new Date()).toISOString(),
    targetRuntime,
    summary: {
      capabilities: submitPackages.length,
      readyToSubmit,
      blocked,
      waitingReceipt,
      acceptedReceipt,
      canClaimExternalAutomation: false,
    },
    submitPackages,
    capabilitySubmissions: submitPackages.map(item => ({
      capabilityId: item.capabilityId,
      label: item.capabilityLabel,
      status: item.status,
      selectedPackageId: item.selectedPackageId,
      receiptRequestId: selectReceipt({ capabilityId: item.capabilityId, receiptInbox: input.providerReceiptInbox })?.requestId,
      nextAction: item.nextAction,
    })),
    externalRequired: unique([
      ...submitPackages.filter(item => item.status !== 'ready-to-submit' && item.status !== 'accepted').map(item => item.blockedReason || item.nextAction),
      ...input.providerAcceptanceWorkbench.externalRequired,
      ...input.providerSandboxContract.externalRequired,
      ...input.taskProviderHandoff.externalRequired,
      ...input.providerReceiptInbox.externalRequired,
    ]),
    bridgeAttempt: input.bridgeAttempt ? {
      ok: input.bridgeAttempt.ok,
      target: input.bridgeAttempt.target,
      status: input.bridgeAttempt.status,
      endpoint: input.bridgeAttempt.endpoint,
      externalRunId: input.bridgeAttempt.externalRunId,
      message: input.bridgeAttempt.message,
      audit: input.bridgeAttempt.audit,
    } : undefined,
    safetyBoundary: 'Provider Sandbox Submit Workbench only builds sanitized submit packages and receipt expectations. It does not execute browser actions by itself, expose provider keys, cookies, raw browser profile ids, private messages, customer PII, coupon codes, payment ids or raw POS rows, and it keeps canClaimExternalAutomation false until signed public receipts and aggregate data contracts are accepted.',
  };
}

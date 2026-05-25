import type { RestaurantRuntimeBridgeResult, RestaurantRuntimeTarget } from '@/lib/restaurant-agent-runtime-bridge';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
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

export type RestaurantProviderSandboxSubmitAttempt = {
  ok: boolean;
  payloadShape: 'restaurant-provider-sandbox-submit-attempt-v1';
  generatedAt: string;
  verdict: 'forwarded-waiting-receipt' | 'blocked-before-dispatch' | 'provider-failed';
  capabilityId?: CapabilityMatrixItem['id'];
  capabilityLabel?: string;
  summary: {
    packageSelected: boolean;
    packageCanForward: boolean;
    workbenchStatus?: RestaurantProviderSandboxSubmitStatus;
    bridgeStatus: RestaurantRuntimeBridgeResult['status'];
    runRecorded: boolean;
    canClaimExternalAutomation: false;
  };
  selectedPackage?: Pick<RestaurantProviderSandboxSubmitPackage, 'capabilityId' | 'capabilityLabel' | 'targetRuntime' | 'status' | 'selectedPackageId' | 'selectedTaskId' | 'selectedRequestedAction' | 'safePayload' | 'receiptExpectation' | 'recoveryOwner' | 'nextAction' | 'stopLine'>;
  bridge: RestaurantRuntimeBridgeResult;
  run?: RestaurantAgentRunRecord;
  receiptExpectation: {
    callbackAction: 'external-receipt';
    callbackHeader: 'x-restaurant-agent-signature';
    acceptedEvidence: string[];
    closeoutRule: string;
  };
  recoveryNextAction: string;
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

function attemptVerdict(bridge: RestaurantRuntimeBridgeResult): RestaurantProviderSandboxSubmitAttempt['verdict'] {
  if (bridge.status === 'forwarded') return 'forwarded-waiting-receipt';
  if (bridge.status === 'failed') return 'provider-failed';
  return 'blocked-before-dispatch';
}

export function selectRestaurantProviderSandboxSubmitPackage(input: {
  workbench: RestaurantProviderSandboxSubmitWorkbench;
  capabilityId?: CapabilityMatrixItem['id'] | string;
  packageId?: string;
}): RestaurantProviderSandboxSubmitPackage | undefined {
  return input.workbench.submitPackages.find(item => input.packageId && item.selectedPackageId === input.packageId)
    || input.workbench.submitPackages.find(item => input.capabilityId && item.capabilityId === input.capabilityId)
    || input.workbench.submitPackages.find(item => item.status === 'ready-to-submit')
    || input.workbench.submitPackages.find(item => item.status === 'waiting-receipt')
    || input.workbench.submitPackages[0];
}

export function blockedRestaurantProviderSandboxBridge(input: {
  workbench: RestaurantProviderSandboxSubmitWorkbench;
  selectedPackage?: RestaurantProviderSandboxSubmitPackage;
}): RestaurantRuntimeBridgeResult {
  const target = input.selectedPackage?.targetRuntime || input.workbench.targetRuntime;
  const blockedReasons = [
    input.selectedPackage ? '' : 'No provider sandbox submit package is selected.',
    input.selectedPackage?.status === 'blocked-data-contract' ? input.selectedPackage.blockedReason || 'Capability is blocked by data contract.' : '',
    input.selectedPackage?.status === 'blocked-provider' ? input.selectedPackage.blockedReason || 'Capability is blocked by provider setup.' : '',
    input.selectedPackage?.status === 'accepted' ? 'Capability already has an accepted receipt; do not resubmit without a new operator decision.' : '',
    input.selectedPackage?.status === 'waiting-receipt' ? 'Capability is already waiting for signed provider receipt.' : '',
    input.selectedPackage?.safePayload ? '' : 'Selected package has no sanitized safePayload.',
  ].filter(Boolean);

  return {
    ok: false,
    target,
    status: 'blocked',
    message: blockedReasons[0] || 'Provider sandbox submit is blocked before dispatch.',
    audit: {
      secretExposed: false,
      payloadShape: 'restaurant-agent-external-execution-v1',
      packageId: input.selectedPackage?.selectedPackageId,
      canForward: false,
      blockedReasons,
      blockedActions: [],
    },
  };
}

export function buildRestaurantProviderSandboxSubmitAttempt(input: {
  workbench: RestaurantProviderSandboxSubmitWorkbench;
  bridge: RestaurantRuntimeBridgeResult;
  selectedPackage?: RestaurantProviderSandboxSubmitPackage;
  run?: RestaurantAgentRunRecord;
  now?: Date;
}): RestaurantProviderSandboxSubmitAttempt {
  const now = input.now || new Date();
  const selectedPackage = input.selectedPackage;
  const verdict = attemptVerdict(input.bridge);
  return {
    ok: input.bridge.ok,
    payloadShape: 'restaurant-provider-sandbox-submit-attempt-v1',
    generatedAt: now.toISOString(),
    verdict,
    capabilityId: selectedPackage?.capabilityId,
    capabilityLabel: selectedPackage?.capabilityLabel,
    summary: {
      packageSelected: Boolean(selectedPackage),
      packageCanForward: selectedPackage?.status === 'ready-to-submit',
      workbenchStatus: selectedPackage?.status,
      bridgeStatus: input.bridge.status,
      runRecorded: Boolean(input.run),
      canClaimExternalAutomation: false,
    },
    selectedPackage: selectedPackage ? {
      capabilityId: selectedPackage.capabilityId,
      capabilityLabel: selectedPackage.capabilityLabel,
      targetRuntime: selectedPackage.targetRuntime,
      status: selectedPackage.status,
      selectedPackageId: selectedPackage.selectedPackageId,
      selectedTaskId: selectedPackage.selectedTaskId,
      selectedRequestedAction: selectedPackage.selectedRequestedAction,
      safePayload: selectedPackage.safePayload,
      receiptExpectation: selectedPackage.receiptExpectation,
      recoveryOwner: selectedPackage.recoveryOwner,
      nextAction: selectedPackage.nextAction,
      stopLine: selectedPackage.stopLine,
    } : undefined,
    bridge: input.bridge,
    run: input.run,
    receiptExpectation: {
      callbackAction: 'external-receipt',
      callbackHeader: 'x-restaurant-agent-signature',
      acceptedEvidence: selectedPackage?.receiptExpectation || ['externalRunId', 'public proof URL or screenshot id', 'operator summary'],
      closeoutRule: 'Do not close the task or claim external automation until a signed callback or public proof receipt is accepted.',
    },
    recoveryNextAction: verdict === 'forwarded-waiting-receipt'
      ? 'Open Provider Receipt Inbox and wait for a signed external-receipt callback before closeout.'
      : input.bridge.message,
    safetyBoundary: 'Provider Sandbox Submit Attempt is the controlled bridge handoff audit. It sends only sanitized execution packages; it never exposes API keys, cookies, tokens, raw browser profile ids, private messages, customer identifiers, coupon codes, payment ids or raw POS rows, and it cannot claim production automation without accepted receipts.',
  };
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

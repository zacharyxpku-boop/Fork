import type { RestaurantProviderLaunchBoard } from '@/lib/restaurant-provider-launch-board';
import type { RestaurantProviderSetupWizard, RestaurantProviderSetupWizardField, RestaurantProviderSetupWizardSection } from '@/lib/restaurant-provider-setup-wizard';
import type { RestaurantProviderUnlockLadder } from '@/lib/restaurant-provider-unlock-ladder';

export type RestaurantMerchantActivationPacketSection = {
  id: RestaurantProviderSetupWizardSection['id'] | 'capability-proof' | 'permanent-boundary';
  title: string;
  owner: 'merchant' | 'ops' | 'runtime-admin' | 'legal';
  status: 'ready' | 'missing' | 'blocked';
  requestedItems: Array<{
    id: string;
    label: string;
    kind: RestaurantProviderSetupWizardField['inputType'] | 'approval' | 'data-contract' | 'stop-line';
    safeInstruction: string;
    evidenceRequired: string;
    unlocks: string[];
  }>;
};

export type RestaurantMerchantActivationPacket = {
  ok: true;
  payloadShape: 'restaurant-merchant-activation-packet-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'internal-pilot-ready' | 'merchant-setup-required' | 'sandbox-ready' | 'external-automation-ready';
  summary: {
    capabilities: number;
    providerKeys: number;
    merchantApprovals: number;
    dataContracts: number;
    setupFieldsMissing: number;
    sandboxReady: number;
    externalBlocked: number;
    canClaimExternalAutomation: boolean;
  };
  promiseToMerchant: string[];
  internalCanRunNow: string[];
  sections: RestaurantMerchantActivationPacketSection[];
  sandboxAcceptancePlan: Array<{
    capabilityId: string;
    action: string;
    evidenceRequired: string;
    stopLine: string;
  }>;
  providerKeyChecklist: string[];
  merchantApprovalChecklist: string[];
  dataContractChecklist: string[];
  doNotSend: string[];
  nextAskForUser: string;
  providerLaunchBoard: Pick<RestaurantProviderLaunchBoard, 'payloadShape' | 'summary' | 'providerKeyChecklist' | 'externalRequired' | 'safetyBoundary'>;
  providerSetupWizard: Pick<RestaurantProviderSetupWizard, 'payloadShape' | 'summary' | 'handoffPayload' | 'externalRequired' | 'safetyBoundary'>;
  providerUnlockLadder: Pick<RestaurantProviderUnlockLadder, 'payloadShape' | 'summary' | 'nextExternalAsks' | 'safetyBoundary'>;
  safetyBoundary: string;
};

function unique(values: string[], limit = 24) {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function fieldsFor(section: RestaurantProviderSetupWizardSection): RestaurantMerchantActivationPacketSection['requestedItems'] {
  return section.fields
    .filter(field => field.status === 'missing')
    .map(field => ({
      id: field.id,
      label: field.label,
      kind: field.inputType,
      safeInstruction: field.safePlaceholder,
      evidenceRequired: field.evidenceRequired,
      unlocks: field.unlocks,
    }));
}

function ownerFor(section: RestaurantProviderSetupWizardSection): RestaurantMerchantActivationPacketSection['owner'] {
  return section.id === 'proof-callback' ? 'runtime-admin' : section.owner;
}

function verdict(input: {
  launchBoard: RestaurantProviderLaunchBoard;
  setupWizard: RestaurantProviderSetupWizard;
}): RestaurantMerchantActivationPacket['verdict'] {
  if (input.launchBoard.summary.canClaimExternalAutomation) return 'external-automation-ready';
  if (input.launchBoard.summary.readyToSandbox > 0) return 'sandbox-ready';
  if (input.setupWizard.summary.missing > 0) return 'merchant-setup-required';
  return 'internal-pilot-ready';
}

export function buildRestaurantMerchantActivationPacket(input: {
  providerLaunchBoard: RestaurantProviderLaunchBoard;
  providerSetupWizard: RestaurantProviderSetupWizard;
  providerUnlockLadder: RestaurantProviderUnlockLadder;
  now?: Date;
}): RestaurantMerchantActivationPacket {
  const now = input.now || new Date();
  const launchBoard = input.providerLaunchBoard;
  const setupWizard = input.providerSetupWizard;
  const providerKeyChecklist = unique(launchBoard.providerKeyChecklist, 30);
  const merchantApprovalChecklist = unique([
    ...launchBoard.capabilities.flatMap(capability => capability.merchantApprovalsNeeded),
    ...setupWizard.handoffPayload.merchantApprovals,
  ], 30);
  const dataContractChecklist = unique([
    ...launchBoard.capabilities.flatMap(capability => capability.dataContractsNeeded),
    ...setupWizard.handoffPayload.dataContracts,
  ], 30);
  const setupSections: RestaurantMerchantActivationPacketSection[] = setupWizard.sections.map(section => ({
    id: section.id,
    title: section.title,
    owner: ownerFor(section),
    status: section.status === 'ready' ? 'ready' : 'missing',
    requestedItems: fieldsFor(section),
  }));
  const capabilitySection: RestaurantMerchantActivationPacketSection = {
    id: 'capability-proof',
    title: 'Capability sandbox proof',
    owner: 'ops',
    status: launchBoard.summary.readyToSandbox > 0 ? 'ready' : 'missing',
    requestedItems: launchBoard.capabilities
      .filter(capability => capability.status !== 'ready-to-sandbox')
      .map(capability => ({
        id: capability.id,
        label: capability.name,
        kind: 'approval',
        safeInstruction: capability.launchStep,
        evidenceRequired: unique([
          ...capability.providerKeysNeeded,
          ...capability.merchantApprovalsNeeded,
          ...capability.dataContractsNeeded,
        ], 6).join(' / ') || capability.stopLine,
        unlocks: [capability.customerPromise],
      })),
  };
  const boundarySection: RestaurantMerchantActivationPacketSection = {
    id: 'permanent-boundary',
    title: 'Permanent data boundary',
    owner: 'legal',
    status: 'blocked',
    requestedItems: launchBoard.capabilities
      .filter(capability => capability.status === 'forbidden-in-client')
      .map(capability => ({
        id: capability.id,
        label: capability.name,
        kind: 'stop-line',
        safeInstruction: capability.launchStep,
        evidenceRequired: capability.stopLine,
        unlocks: capability.canDoInternallyNow,
      })),
  };
  const sandboxAcceptancePlan = launchBoard.capabilities
    .filter(capability => capability.status !== 'forbidden-in-client')
    .slice(0, 8)
    .map(capability => ({
      capabilityId: capability.id,
      action: capability.launchStep,
      evidenceRequired: unique([
        ...capability.healthEvidence,
        ...capability.providerKeysNeeded,
        ...capability.merchantApprovalsNeeded,
        ...capability.dataContractsNeeded,
      ], 5).join(' / '),
      stopLine: capability.stopLine,
    }));
  const missingFields = setupWizard.summary.missing;
  const nextAskForUser = missingFields > 0
    ? `Provide setup evidence for ${missingFields} missing field(s): ${setupWizard.externalRequired.slice(0, 3).join(' / ')}.`
    : launchBoard.summary.readyToSandbox > 0
      ? 'Approve one sandbox run and require signed/public receipt before production use.'
      : 'Run the internal pilot first, then rebuild this packet from accepted proof.';

  return {
    ok: true,
    payloadShape: 'restaurant-merchant-activation-packet-v1',
    generatedAt: now.toISOString(),
    restaurant: launchBoard.restaurant,
    offer: launchBoard.offer,
    verdict: verdict({ launchBoard, setupWizard }),
    summary: {
      capabilities: launchBoard.summary.capabilities,
      providerKeys: providerKeyChecklist.length,
      merchantApprovals: merchantApprovalChecklist.length,
      dataContracts: dataContractChecklist.length,
      setupFieldsMissing: missingFields,
      sandboxReady: launchBoard.summary.readyToSandbox,
      externalBlocked: launchBoard.summary.missingProvider + input.providerUnlockLadder.summary.externalBlocked,
      canClaimExternalAutomation: launchBoard.summary.canClaimExternalAutomation,
    },
    promiseToMerchant: [
      'We can run internal planning, staff work orders, content/package preparation, proof review and closeout training before keys are ready.',
      'We need provider keys, merchant authorization, callback receipts and aggregate data contracts before claiming automatic publish, lead capture, coupon redemption or operating analysis.',
      'Each external lane launches through a sandbox run first; production claims require signed/public proof and merchant-visible evidence.',
    ],
    internalCanRunNow: unique(launchBoard.capabilities.flatMap(capability => capability.canDoInternallyNow), 18),
    sections: [...setupSections, capabilitySection, boundarySection],
    sandboxAcceptancePlan,
    providerKeyChecklist,
    merchantApprovalChecklist,
    dataContractChecklist,
    doNotSend: [
      'API key values, callback secrets, cookies or tokens',
      'Raw browser profile identifiers',
      'Private messages, phone numbers, WeChat IDs, openid, addresses or raw transcripts',
      'Coupon codes, payment ids, raw POS rows, member ids or order-level rows',
      'Unaccepted screenshots, unsourced growth claims or manual notes presented as automation proof',
    ],
    nextAskForUser,
    providerLaunchBoard: {
      payloadShape: launchBoard.payloadShape,
      summary: launchBoard.summary,
      providerKeyChecklist: launchBoard.providerKeyChecklist,
      externalRequired: launchBoard.externalRequired,
      safetyBoundary: launchBoard.safetyBoundary,
    },
    providerSetupWizard: {
      payloadShape: setupWizard.payloadShape,
      summary: setupWizard.summary,
      handoffPayload: setupWizard.handoffPayload,
      externalRequired: setupWizard.externalRequired,
      safetyBoundary: setupWizard.safetyBoundary,
    },
    providerUnlockLadder: {
      payloadShape: input.providerUnlockLadder.payloadShape,
      summary: input.providerUnlockLadder.summary,
      nextExternalAsks: input.providerUnlockLadder.nextExternalAsks,
      safetyBoundary: input.providerUnlockLadder.safetyBoundary,
    },
    safetyBoundary: 'Merchant Activation Packet is a safe implementation request, not a secret store or production automation claim. It lists provider key names, merchant approvals, data contracts, sandbox acceptance evidence and stop lines only; it never asks for or returns secret values, cookies, tokens, raw browser profiles, private messages, customer identifiers, coupon codes, payment ids or raw POS rows.',
  };
}

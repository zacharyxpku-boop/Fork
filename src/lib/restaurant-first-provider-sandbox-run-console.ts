import type { RestaurantMerchantAuthorizationPacket } from '@/lib/restaurant-merchant-authorization-packet';
import type { RestaurantProviderAdapterConfigWorkbench } from '@/lib/restaurant-provider-adapter-config-workbench';
import type { RestaurantProviderSandboxReadinessBoard } from '@/lib/restaurant-provider-sandbox-readiness-board';
import type { RestaurantProviderSandboxRunConsole } from '@/lib/restaurant-provider-sandbox-run-console';
import type { RestaurantProviderSandboxSubmitPackage, RestaurantProviderSandboxSubmitWorkbench } from '@/lib/restaurant-provider-sandbox-submit-workbench';

type MerchantScope = RestaurantMerchantAuthorizationPacket['scopes'][number];

export type RestaurantFirstProviderSandboxRunStepStatus = 'ready' | 'blocked' | 'waiting' | 'accepted';

export type RestaurantFirstProviderSandboxRunConsole = {
  ok: true;
  payloadShape: 'restaurant-first-provider-sandbox-run-console-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict:
    | 'ready-for-first-provider-submit'
    | 'sign-merchant-scope-first'
    | 'configure-provider-first'
    | 'waiting-signed-receipt'
    | 'closeout-training-ready';
  summary: {
    steps: number;
    ready: number;
    blocked: number;
    waiting: number;
    accepted: number;
    selectedScopeReady: boolean;
    selectedPackageReady: boolean;
    providerReady: boolean;
    canStartFirstSandboxRun: boolean;
    canTrainNextRun: boolean;
    canClaimExternalAutomation: false;
  };
  selectedRun: {
    runId: string;
    scopeId: MerchantScope['id'];
    scopeLabel: string;
    capabilityId: RestaurantProviderSandboxSubmitPackage['capabilityId'];
    capabilityLabel: string;
    targetProvider: string;
    packageId: string;
    callbackAction: 'external-receipt';
    callbackHeader: 'x-restaurant-agent-signature';
  };
  steps: Array<{
    id: 'merchant-scope' | 'provider-choice' | 'submit-package' | 'dispatch' | 'signed-callback' | 'closeout-training';
    label: string;
    status: RestaurantFirstProviderSandboxRunStepStatus;
    owner: 'merchant' | 'runtime-admin' | 'ops' | 'provider' | 'store-manager' | 'data-ops';
    evidence: string[];
    nextAction: string;
    stopLine: string;
  }>;
  providerSubmitCard: {
    method: 'POST';
    endpointEnv: string;
    targetPath: string;
    includesSecrets: false;
    payloadShape: 'restaurant-agent-external-execution-v1';
    allowedPayload: string[];
    forbiddenPayload: string[];
  };
  closeoutRule: {
    acceptedReceipt: string[];
    memoryWriteAllowedWhen: string;
    nextRunTraining: string[];
  };
  externalRequired: string[];
  operatorScript: string[];
  redactedFields: string[];
  safetyBoundary: string;
};

const CAPABILITY_BY_SCOPE: Record<MerchantScope['id'], RestaurantProviderSandboxSubmitPackage['capabilityId']> = {
  'dianping-meituan': 'auto-publish-proof',
  xiaohongshu: 'auto-publish-proof',
  douyin: 'auto-publish-proof',
  'wechat-community': 'auto-lead-acquisition',
  'pos-redemption': 'auto-coupon-redemption',
};

function unique(values: string[], limit = 14): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 41 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function selectScope(packet: RestaurantMerchantAuthorizationPacket): MerchantScope {
  return packet.scopes.find(scope => scope.status === 'ready-to-sign')
    || packet.scopes.find(scope => scope.status !== 'missing-data-contract')
    || packet.scopes[0];
}

function selectPackage(input: {
  scope: MerchantScope;
  workbench: RestaurantProviderSandboxSubmitWorkbench;
}): RestaurantProviderSandboxSubmitPackage {
  const capabilityId = CAPABILITY_BY_SCOPE[input.scope.id] || 'auto-publish-proof';
  return input.workbench.submitPackages.find(item => item.capabilityId === capabilityId)
    || input.workbench.submitPackages.find(item => item.status === 'ready-to-submit')
    || input.workbench.submitPackages[0];
}

function stepCount(steps: RestaurantFirstProviderSandboxRunConsole['steps'], status: RestaurantFirstProviderSandboxRunStepStatus): number {
  return steps.filter(step => step.status === status).length;
}

function verdictFor(summary: RestaurantFirstProviderSandboxRunConsole['summary']): RestaurantFirstProviderSandboxRunConsole['verdict'] {
  if (summary.canTrainNextRun) return 'closeout-training-ready';
  if (!summary.selectedScopeReady) return 'sign-merchant-scope-first';
  if (!summary.providerReady) return 'configure-provider-first';
  if (summary.canStartFirstSandboxRun) return 'ready-for-first-provider-submit';
  if (summary.waiting > 0 && summary.selectedPackageReady) return 'waiting-signed-receipt';
  return 'configure-provider-first';
}

export function buildRestaurantFirstProviderSandboxRunConsole(input: {
  merchantAuthorizationPacket: RestaurantMerchantAuthorizationPacket;
  providerAdapterConfigWorkbench: RestaurantProviderAdapterConfigWorkbench;
  providerSandboxReadinessBoard: RestaurantProviderSandboxReadinessBoard;
  providerSandboxSubmitWorkbench: RestaurantProviderSandboxSubmitWorkbench;
  providerSandboxRunConsole: RestaurantProviderSandboxRunConsole;
  now?: Date;
}): RestaurantFirstProviderSandboxRunConsole {
  const now = input.now || new Date();
  const scope = selectScope(input.merchantAuthorizationPacket);
  const selectedPackage = selectPackage({ scope, workbench: input.providerSandboxSubmitWorkbench });
  const recommended = input.providerAdapterConfigWorkbench.recommended;
  const selectedScopeReady = scope.status === 'ready-to-sign';
  const selectedPackageReady = selectedPackage.status === 'ready-to-submit';
  const providerReady = input.providerAdapterConfigWorkbench.summary.canSubmitRealProviderNow
    || input.providerSandboxReadinessBoard.summary.canSubmitSandboxNow;
  const canTrainNextRun = input.providerSandboxRunConsole.summary.canWriteMemory
    || input.providerSandboxRunConsole.summary.acceptedReceipts > 0;
  const canStartFirstSandboxRun = selectedScopeReady && selectedPackageReady && providerReady && !canTrainNextRun;
  const waitingReceipt = selectedPackage.status === 'waiting-receipt' || input.providerSandboxRunConsole.summary.waitingReceipts > 0;
  const acceptedReceipt = selectedPackage.status === 'accepted' || input.providerSandboxRunConsole.summary.acceptedReceipts > 0;

  const steps: RestaurantFirstProviderSandboxRunConsole['steps'] = [
    {
      id: 'merchant-scope',
      label: 'Merchant signs one scope',
      status: selectedScopeReady ? 'ready' : scope.status === 'runtime-callback-blocked' ? 'waiting' : 'blocked',
      owner: scope.owner === 'operator' ? 'ops' : scope.owner,
      evidence: unique([scope.id, scope.status, ...scope.requiredFields.slice(0, 3), ...scope.acceptanceEvidence.slice(0, 2)], 8),
      nextAction: selectedScopeReady ? 'Use this signed scope for one controlled provider sandbox run.' : scope.nextAction,
      stopLine: scope.stopLine,
    },
    {
      id: 'provider-choice',
      label: 'Choose Provider target',
      status: providerReady ? 'ready' : 'blocked',
      owner: 'runtime-admin',
      evidence: unique([
        `recommended:${recommended.target}`,
        `mode:${recommended.mode}`,
        `realReady:${input.providerAdapterConfigWorkbench.summary.realProviderReady}`,
        `missingEnv:${input.providerAdapterConfigWorkbench.summary.missingEnvKeys}`,
      ], 8),
      nextAction: providerReady ? recommended.nextAction : 'Configure runtime URL/API key, isolated browser profile and signed callback before real submit.',
      stopLine: 'No provider submit without server-side runtime config, callback secret, browser profile and merchant scope.',
    },
    {
      id: 'submit-package',
      label: 'Select sanitized submit package',
      status: selectedPackageReady ? 'ready' : selectedPackage.status === 'accepted' ? 'accepted' : selectedPackage.status === 'waiting-receipt' ? 'waiting' : 'blocked',
      owner: selectedPackage.recoveryOwner,
      evidence: unique([
        selectedPackage.capabilityId,
        selectedPackage.selectedPackageId || 'no-package',
        selectedPackage.submitEndpointShape.endpointEnv,
        ...selectedPackage.receiptExpectation.slice(0, 3),
      ], 8),
      nextAction: selectedPackage.nextAction,
      stopLine: selectedPackage.stopLine,
    },
    {
      id: 'dispatch',
      label: 'Dispatch one sandbox run',
      status: acceptedReceipt ? 'accepted' : waitingReceipt ? 'waiting' : canStartFirstSandboxRun ? 'ready' : 'blocked',
      owner: 'ops',
      evidence: unique([
        `submitAllowed:${canStartFirstSandboxRun}`,
        `target:${recommended.target}`,
        `package:${selectedPackage.selectedPackageId || 'none'}`,
      ], 8),
      nextAction: canStartFirstSandboxRun
        ? `POST ${selectedPackage.selectedPackageId || 'selected package'} to ${recommended.target}; keep run open until signed receipt.`
        : input.providerSandboxRunConsole.selectedLane.nextAction,
      stopLine: 'Dispatch is not closeout; only signed/public proof or sanitized aggregate receipt can close the run.',
    },
    {
      id: 'signed-callback',
      label: 'Signed callback receipt',
      status: acceptedReceipt ? 'accepted' : waitingReceipt ? 'waiting' : 'blocked',
      owner: 'runtime-admin',
      evidence: unique([
        input.providerSandboxRunConsole.providerCallbackContract.action,
        input.providerSandboxRunConsole.providerCallbackContract.header,
        ...input.providerSandboxRunConsole.providerCallbackContract.acceptedEvidence.slice(0, 4),
      ], 8),
      nextAction: acceptedReceipt ? 'Move to closeout training.' : 'Wait for signed external-receipt with public proof or sanitized aggregate receipt.',
      stopLine: 'Unsigned callbacks, unverifiable screenshots and private inbox content are rejected.',
    },
    {
      id: 'closeout-training',
      label: 'Closeout and train next run',
      status: canTrainNextRun ? 'accepted' : acceptedReceipt ? 'ready' : 'waiting',
      owner: 'store-manager',
      evidence: unique([
        `canWriteMemory:${input.providerSandboxRunConsole.summary.canWriteMemory}`,
        `acceptedReceipts:${input.providerSandboxRunConsole.summary.acceptedReceipts}`,
        'accepted proof or sanitized aggregate only',
      ], 8),
      nextAction: canTrainNextRun ? 'Write accepted proof summary into memory and generate the next run plan.' : 'Do not train from the run until accepted receipt exists.',
      stopLine: 'No memory write from pending, unsigned, private-message or raw POS evidence.',
    },
  ];

  const summary = {
    steps: steps.length,
    ready: stepCount(steps, 'ready'),
    blocked: stepCount(steps, 'blocked'),
    waiting: stepCount(steps, 'waiting'),
    accepted: stepCount(steps, 'accepted'),
    selectedScopeReady,
    selectedPackageReady,
    providerReady,
    canStartFirstSandboxRun,
    canTrainNextRun,
    canClaimExternalAutomation: false,
  } satisfies RestaurantFirstProviderSandboxRunConsole['summary'];

  return {
    ok: true,
    payloadShape: 'restaurant-first-provider-sandbox-run-console-v1',
    generatedAt: now.toISOString(),
    restaurant: input.merchantAuthorizationPacket.restaurant,
    offer: input.merchantAuthorizationPacket.offer,
    verdict: verdictFor(summary),
    summary,
    selectedRun: {
      runId: `first-provider-run-${stableId([input.merchantAuthorizationPacket.restaurant, scope.id, selectedPackage.capabilityId, selectedPackage.selectedPackageId || 'no-package'])}`,
      scopeId: scope.id,
      scopeLabel: scope.label,
      capabilityId: selectedPackage.capabilityId,
      capabilityLabel: selectedPackage.capabilityLabel,
      targetProvider: recommended.target,
      packageId: selectedPackage.selectedPackageId || 'not-selected',
      callbackAction: 'external-receipt',
      callbackHeader: 'x-restaurant-agent-signature',
    },
    steps,
    providerSubmitCard: {
      method: 'POST',
      endpointEnv: selectedPackage.submitEndpointShape.endpointEnv,
      targetPath: recommended.target === 'lobu' ? '/events' : recommended.target === 'hermes' ? '/runs' : '/tasks',
      includesSecrets: false,
      payloadShape: 'restaurant-agent-external-execution-v1',
      allowedPayload: unique([
        'scope id',
        'sanitized safePayload',
        'approved action',
        'public proof fields',
        'callback action and signature header name',
        'owner and next action',
      ], 8),
      forbiddenPayload: unique(input.merchantAuthorizationPacket.providerHandOff.neverGiveProvider, 12),
    },
    closeoutRule: {
      acceptedReceipt: unique(input.providerSandboxRunConsole.providerCallbackContract.acceptedEvidence, 10),
      memoryWriteAllowedWhen: 'Only after signed external-receipt or manually accepted public proof / sanitized aggregate receipt.',
      nextRunTraining: [
        'store accepted evidence id, owner, channel and next action',
        'update task queue and provider receipt lifecycle',
        'train the next run from accepted proof or sanitized aggregate counts only',
      ],
    },
    externalRequired: unique([
      ...input.merchantAuthorizationPacket.scopes.filter(item => item.status !== 'ready-to-sign').map(item => item.nextAction),
      ...input.providerAdapterConfigWorkbench.providerOfTheKeyRequest.flatMap(item => item.giveThis),
      ...input.providerSandboxReadinessBoard.rows.flatMap(item => item.missing),
      ...input.providerSandboxRunConsole.externalRequired,
    ]),
    operatorScript: [
      `First run target: ${scope.label} -> ${selectedPackage.capabilityLabel} on ${recommended.target}.`,
      selectedScopeReady ? 'Scope is ready to attach to one run.' : scope.nextAction,
      providerReady ? recommended.nextAction : 'Runtime key, callback secret and browser profile still block real submit.',
      'Closeout only after signed external-receipt or accepted public proof.',
    ],
    redactedFields: input.merchantAuthorizationPacket.redactedFields,
    safetyBoundary: 'First Provider Sandbox Run Console is a controlled first-run surface. It selects one merchant scope, one sanitized package and one provider target, but it does not execute browser actions, publish content, contact customers, redeem coupons, read private messages, expose secrets, write POS records or claim external automation before signed receipts and accepted evidence exist.',
  };
}

import type { RestaurantFirstProviderSandboxRunConsole } from '@/lib/restaurant-first-provider-sandbox-run-console';
import type { RestaurantMerchantAuthorizationPacket } from '@/lib/restaurant-merchant-authorization-packet';
import type { RestaurantProviderAdapterConfigWorkbench } from '@/lib/restaurant-provider-adapter-config-workbench';
import type { RestaurantProviderSandboxSubmitPackage, RestaurantProviderSandboxSubmitWorkbench } from '@/lib/restaurant-provider-sandbox-submit-workbench';

export type RestaurantProviderRunPacket = {
  ok: true;
  payloadShape: 'restaurant-provider-run-packet-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'ready-real-provider-packet' | 'ready-simulator-packet' | 'blocked-missing-provider' | 'blocked-missing-scope' | 'blocked-missing-package';
  summary: {
    targetProvider: string;
    packageSelected: boolean;
    scopeSelected: boolean;
    realProviderReady: boolean;
    simulatorReady: boolean;
    canSubmitRealProviderNow: boolean;
    canSubmitSimulatorNow: boolean;
    canClaimExternalAutomation: false;
  };
  selected: {
    runId: string;
    scopeId: string;
    scopeLabel: string;
    capabilityId: string;
    capabilityLabel: string;
    packageId: string;
    endpointEnv: string;
    endpointPath: '/events' | '/tasks' | '/runs';
  };
  request: {
    method: 'POST';
    endpoint: string;
    auth: 'server-side-bearer-only';
    contentType: 'application/json';
    bodyShape: 'restaurant-agent-external-execution-v1';
    bodyPreview: {
      packageId: string;
      taskId?: string;
      capabilityId: string;
      requestedAction?: string;
      restaurant: string;
      offer: string;
      owner: string;
      evidenceRequired: string[];
      callback: {
        endpoint: '/api/restaurant-agent/runtime';
        action: 'external-receipt';
        header: 'x-restaurant-agent-signature';
      };
      audit: {
        includesSecrets: false;
        includesPrivateData: false;
        includesRawPosRows: false;
      };
    };
    forbiddenFields: string[];
  };
  callbackReceiptExample: {
    action: 'external-receipt';
    requiredHeader: 'x-restaurant-agent-signature';
    acceptedFields: string[];
    sampleBody: {
      action: 'external-receipt';
      eventId: string;
      externalRunId: string;
      signalType: 'publish-proof' | 'reservation' | 'coupon-claim' | 'redemption' | 'manual-review';
      evidenceUrl: string;
      screenshotId: string;
      summary: string;
      operator: string;
    };
  };
  acceptanceChecklist: Array<{
    id: 'provider-response' | 'signed-callback' | 'public-proof' | 'memory-training' | 'claim-boundary';
    status: 'ready' | 'blocked' | 'waiting';
    owner: 'provider' | 'runtime-admin' | 'ops' | 'store-manager';
    evidence: string[];
    nextAction: string;
  }>;
  externalRequired: string[];
  providerScript: string[];
  redactedFields: string[];
  safetyBoundary: string;
};

function unique(values: string[], limit = 14): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function endpointPath(target: string): '/events' | '/tasks' | '/runs' {
  if (target === 'lobu') return '/events';
  if (target === 'hermes') return '/runs';
  return '/tasks';
}

function selectPackage(input: {
  firstRun: RestaurantFirstProviderSandboxRunConsole;
  workbench: RestaurantProviderSandboxSubmitWorkbench;
}): RestaurantProviderSandboxSubmitPackage | undefined {
  return input.workbench.submitPackages.find(item => item.selectedPackageId === input.firstRun.selectedRun.packageId)
    || input.workbench.submitPackages.find(item => item.capabilityId === input.firstRun.selectedRun.capabilityId)
    || input.workbench.submitPackages[0];
}

function verdictFor(input: {
  hasScope: boolean;
  hasPackage: boolean;
  realProviderReady: boolean;
  simulatorReady: boolean;
}): RestaurantProviderRunPacket['verdict'] {
  if (!input.hasScope) return 'blocked-missing-scope';
  if (!input.hasPackage) return 'blocked-missing-package';
  if (input.realProviderReady) return 'ready-real-provider-packet';
  if (input.simulatorReady) return 'ready-simulator-packet';
  return 'blocked-missing-provider';
}

function signalType(capabilityId: string): RestaurantProviderRunPacket['callbackReceiptExample']['sampleBody']['signalType'] {
  if (capabilityId === 'auto-lead-acquisition') return 'reservation';
  if (capabilityId === 'auto-coupon-redemption') return 'redemption';
  if (capabilityId === 'true-operating-analysis') return 'manual-review';
  return 'publish-proof';
}

export function buildRestaurantProviderRunPacket(input: {
  merchantAuthorizationPacket: RestaurantMerchantAuthorizationPacket;
  firstProviderSandboxRunConsole: RestaurantFirstProviderSandboxRunConsole;
  providerAdapterConfigWorkbench: RestaurantProviderAdapterConfigWorkbench;
  providerSandboxSubmitWorkbench: RestaurantProviderSandboxSubmitWorkbench;
  now?: Date;
}): RestaurantProviderRunPacket {
  const now = input.now || new Date();
  const firstRun = input.firstProviderSandboxRunConsole;
  const selectedPackage = selectPackage({ firstRun, workbench: input.providerSandboxSubmitWorkbench });
  const scope = input.merchantAuthorizationPacket.scopes.find(item => item.id === firstRun.selectedRun.scopeId);
  const path = endpointPath(firstRun.selectedRun.targetProvider);
  const realProviderReady = firstRun.summary.canStartFirstSandboxRun
    && input.providerAdapterConfigWorkbench.summary.canSubmitRealProviderNow;
  const simulatorReady = Boolean(selectedPackage) && input.providerAdapterConfigWorkbench.summary.canUseSimulatorNow;
  const hasScope = Boolean(scope);
  const hasPackage = Boolean(selectedPackage);
  const safePayload = selectedPackage?.safePayload;
  const forbiddenFields = unique([
    ...input.merchantAuthorizationPacket.providerHandOff.neverGiveProvider,
    'apiKey',
    'secret',
    'rawBrowserProfileId',
    'privateMessages',
    'customerIdentifiers',
    'couponCodes',
    'paymentIds',
    'rawPosRows',
  ], 16);

  return {
    ok: true,
    payloadShape: 'restaurant-provider-run-packet-v1',
    generatedAt: now.toISOString(),
    restaurant: input.merchantAuthorizationPacket.restaurant,
    offer: input.merchantAuthorizationPacket.offer,
    verdict: verdictFor({ hasScope, hasPackage, realProviderReady, simulatorReady }),
    summary: {
      targetProvider: firstRun.selectedRun.targetProvider,
      packageSelected: hasPackage,
      scopeSelected: hasScope,
      realProviderReady,
      simulatorReady,
      canSubmitRealProviderNow: realProviderReady,
      canSubmitSimulatorNow: simulatorReady,
      canClaimExternalAutomation: false,
    },
    selected: {
      runId: firstRun.selectedRun.runId,
      scopeId: firstRun.selectedRun.scopeId,
      scopeLabel: firstRun.selectedRun.scopeLabel,
      capabilityId: firstRun.selectedRun.capabilityId,
      capabilityLabel: firstRun.selectedRun.capabilityLabel,
      packageId: selectedPackage?.selectedPackageId || firstRun.selectedRun.packageId,
      endpointEnv: selectedPackage?.submitEndpointShape.endpointEnv || firstRun.providerSubmitCard.endpointEnv,
      endpointPath: path,
    },
    request: {
      method: 'POST',
      endpoint: selectedPackage?.submitEndpointShape.endpointEnv || firstRun.providerSubmitCard.endpointEnv,
      auth: 'server-side-bearer-only',
      contentType: 'application/json',
      bodyShape: 'restaurant-agent-external-execution-v1',
      bodyPreview: {
        packageId: selectedPackage?.selectedPackageId || firstRun.selectedRun.packageId,
        taskId: selectedPackage?.selectedTaskId,
        capabilityId: firstRun.selectedRun.capabilityId,
        requestedAction: selectedPackage?.selectedRequestedAction,
        restaurant: safePayload?.restaurant || input.merchantAuthorizationPacket.restaurant,
        offer: safePayload?.offer || input.merchantAuthorizationPacket.offer,
        owner: safePayload?.owner || 'ops',
        evidenceRequired: unique([
          ...(selectedPackage?.receiptExpectation || []),
          safePayload?.evidenceRequired || '',
        ], 8),
        callback: {
          endpoint: '/api/restaurant-agent/runtime',
          action: 'external-receipt',
          header: 'x-restaurant-agent-signature',
        },
        audit: {
          includesSecrets: false,
          includesPrivateData: false,
          includesRawPosRows: false,
        },
      },
      forbiddenFields,
    },
    callbackReceiptExample: {
      action: 'external-receipt',
      requiredHeader: 'x-restaurant-agent-signature',
      acceptedFields: unique(firstRun.closeoutRule.acceptedReceipt, 10),
      sampleBody: {
        action: 'external-receipt',
        eventId: `${firstRun.selectedRun.runId}-event`,
        externalRunId: `${firstRun.selectedRun.targetProvider}-run-id`,
        signalType: signalType(firstRun.selectedRun.capabilityId),
        evidenceUrl: 'https://public-platform.example/proof-or-post',
        screenshotId: 'provider-screenshot-id',
        summary: 'Provider completed the controlled sandbox run and returned public proof only.',
        operator: 'restaurant-ops',
      },
    },
    acceptanceChecklist: [
      {
        id: 'provider-response',
        status: hasPackage ? 'ready' : 'blocked',
        owner: 'provider',
        evidence: ['HTTP 200/201/202', 'runId or taskId', 'no secret echo'],
        nextAction: hasPackage ? 'Return a stable run id and keep the run waiting for signed callback.' : 'Select a sanitized provider package first.',
      },
      {
        id: 'signed-callback',
        status: realProviderReady || simulatorReady ? 'waiting' : 'blocked',
        owner: 'runtime-admin',
        evidence: ['x-restaurant-agent-signature', 'external-receipt', 'externalRunId'],
        nextAction: 'Validate callback signature before accepting any receipt.',
      },
      {
        id: 'public-proof',
        status: 'waiting',
        owner: 'ops',
        evidence: firstRun.closeoutRule.acceptedReceipt,
        nextAction: 'Accept only public proof URL, screenshot id or sanitized aggregate receipt.',
      },
      {
        id: 'memory-training',
        status: firstRun.summary.canTrainNextRun ? 'ready' : 'blocked',
        owner: 'store-manager',
        evidence: firstRun.closeoutRule.nextRunTraining,
        nextAction: firstRun.summary.canTrainNextRun ? 'Train the next run from accepted proof.' : 'Wait for accepted receipt before memory write.',
      },
      {
        id: 'claim-boundary',
        status: 'blocked',
        owner: 'ops',
        evidence: ['canClaimExternalAutomation:false'],
        nextAction: 'Do not claim production automation until repeated signed receipts and merchant-approved data contracts exist.',
      },
    ],
    externalRequired: unique([
      ...firstRun.externalRequired,
      ...input.providerAdapterConfigWorkbench.providerOfTheKeyRequest.flatMap(item => item.giveThis),
      ...input.providerSandboxSubmitWorkbench.externalRequired,
    ]),
    providerScript: [
      `Submit one packet to ${firstRun.selectedRun.targetProvider}${path}; do not submit more than one scope in the first run.`,
      'Use server-side bearer auth only; never place API keys, cookies, tokens or browser profile ids in the payload.',
      'Return run id from submit response, then close only through signed external-receipt callback.',
      'Stop on captcha, login challenge, private inbox, customer identifiers, coupon codes, payment ids or raw POS rows.',
    ],
    redactedFields: forbiddenFields,
    safetyBoundary: 'Provider Run Packet is the external handoff contract for one controlled sandbox run. It is safe to forward as a shape and checklist, but it does not include provider secrets, execute browser actions, publish content, contact customers, redeem coupons, read private messages, write POS records or claim production automation without signed receipts and accepted evidence.',
  };
}

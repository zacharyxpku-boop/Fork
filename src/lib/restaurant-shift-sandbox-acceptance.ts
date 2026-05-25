import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import type { RestaurantProviderSandboxContract } from '@/lib/restaurant-provider-sandbox-contract';
import type { RestaurantShiftProviderHandoff } from '@/lib/restaurant-shift-provider-handoff';

export type RestaurantShiftSandboxAcceptanceStage = {
  id: 'handoff-built' | 'p0-owner-assigned' | 'runtime-health' | 'callback-signature' | 'merchant-data-gates' | 'receipt-contract';
  status: 'passed' | 'waiting-external' | 'blocked';
  owner: 'runtime-admin' | 'merchant' | 'ops' | 'data-ops';
  evidence: string[];
  nextAction: string;
};

export type RestaurantShiftSandboxAcceptance = {
  ok: true;
  payloadShape: 'restaurant-shift-sandbox-acceptance-v1';
  generatedAt: string;
  verdict: 'ready-for-sandbox-submit' | 'waiting-provider' | 'blocked';
  summary: {
    stages: number;
    passed: number;
    waitingExternal: number;
    blocked: number;
    providerRequests: number;
    p0: number;
    canSubmitSandbox: boolean;
    canClaimExternalAutomation: false;
  };
  stages: RestaurantShiftSandboxAcceptanceStage[];
  submitContract: {
    sendToRuntime: 'safePayload-and-executionPackage-only';
    callbackAction: 'external-receipt';
    callbackHeader: 'x-restaurant-agent-signature';
    requiredReceiptFields: string[];
    forbiddenFields: string[];
  };
  providerAskDigest: {
    providerEnvKeys: string[];
    merchantApprovals: string[];
    dataContracts: string[];
  };
  operatorRunbook: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

function stage(input: RestaurantShiftSandboxAcceptanceStage): RestaurantShiftSandboxAcceptanceStage {
  return input;
}

function hasHealth(health: RestaurantProviderReadinessHealth | undefined, category: 'runtime' | 'callback' | 'merchant-auth' | 'operating-data') {
  return Boolean(health?.items.some(item => item.category === category && item.status === 'health-ready'));
}

export function buildRestaurantShiftSandboxAcceptance(input: {
  shiftProviderHandoff: RestaurantShiftProviderHandoff;
  providerReadinessHealth?: RestaurantProviderReadinessHealth;
  providerSandboxContract?: RestaurantProviderSandboxContract;
  now?: Date;
}): RestaurantShiftSandboxAcceptance {
  const now = input.now || new Date();
  const handoff = input.shiftProviderHandoff;
  const hasRequests = handoff.summary.requests > 0;
  const hasP0 = handoff.summary.p0 > 0;
  const runtimeReady = hasHealth(input.providerReadinessHealth, 'runtime');
  const callbackReady = hasHealth(input.providerReadinessHealth, 'callback');
  const merchantReady = hasHealth(input.providerReadinessHealth, 'merchant-auth');
  const dataReady = hasHealth(input.providerReadinessHealth, 'operating-data');
  const receiptContractReady = Boolean(input.providerSandboxContract?.acceptanceContract.callbackRequires.includes('x-restaurant-agent-signature'));

  const stages = [
    stage({
      id: 'handoff-built',
      status: hasRequests ? 'passed' : 'blocked',
      owner: 'ops',
      evidence: [`requests:${handoff.summary.requests}`, `shiftRuns:${handoff.summary.shiftRuns}`],
      nextAction: hasRequests ? 'Use the Shift Provider Handoff as the source of truth for external asks.' : 'Run Shift Autopilot, then build Shift Provider Handoff from its provider-held actions.',
    }),
    stage({
      id: 'p0-owner-assigned',
      status: hasP0 ? 'waiting-external' : hasRequests ? 'passed' : 'blocked',
      owner: 'runtime-admin',
      evidence: [`p0:${handoff.summary.p0}`, `providerEnvKeys:${handoff.summary.providerEnvKeys}`, `merchantApprovals:${handoff.summary.merchantApprovals}`],
      nextAction: hasP0
        ? 'Assign every P0 runtime/callback/merchant authorization ask to runtime-admin or merchant owner before sandbox submit.'
        : 'No P0 ask is open; keep lower-priority asks in the launch board.',
    }),
    stage({
      id: 'runtime-health',
      status: runtimeReady ? 'passed' : handoff.providerEnvKeys.length ? 'waiting-external' : 'blocked',
      owner: 'runtime-admin',
      evidence: input.providerReadinessHealth?.items.filter(item => item.category === 'runtime').map(item => `${item.label}:${item.status}`) || ['provider health not run'],
      nextAction: runtimeReady ? 'Attach runtime health evidence to the sandbox submit.' : 'Configure and health-check Lobu/OpenClaw/Hermes runtime URL and API key.',
    }),
    stage({
      id: 'callback-signature',
      status: callbackReady ? 'passed' : handoff.providerEnvKeys.some(key => key.includes('CALLBACK')) ? 'waiting-external' : 'blocked',
      owner: 'runtime-admin',
      evidence: ['callback action:external-receipt', 'header:x-restaurant-agent-signature'],
      nextAction: callbackReady ? 'Require signed callbacks for every provider result.' : 'Configure RESTAURANT_AGENT_CALLBACK_SECRET and verify signature handling.',
    }),
    stage({
      id: 'merchant-data-gates',
      status: merchantReady || dataReady ? 'passed' : handoff.merchantApprovals.length || handoff.dataContracts.length ? 'waiting-external' : 'blocked',
      owner: handoff.dataContracts.length ? 'data-ops' : 'merchant',
      evidence: [`merchantApprovals:${handoff.merchantApprovals.length}`, `dataContracts:${handoff.dataContracts.length}`],
      nextAction: merchantReady || dataReady
        ? 'Keep merchant/data gate evidence attached to the sandbox receipt.'
        : 'Collect merchant platform authorization and aggregate/no-PII data contract before claiming production automation.',
    }),
    stage({
      id: 'receipt-contract',
      status: receiptContractReady ? 'passed' : 'waiting-external',
      owner: 'ops',
      evidence: input.providerSandboxContract?.acceptanceContract.callbackRequires || ['sandbox contract not built'],
      nextAction: receiptContractReady ? 'Accept only signed external-receipt callbacks or manual public proof receipts.' : 'Build Provider Sandbox Contract before submitting a provider run.',
    }),
  ];

  const passed = stages.filter(item => item.status === 'passed').length;
  const waitingExternal = stages.filter(item => item.status === 'waiting-external').length;
  const blocked = stages.filter(item => item.status === 'blocked').length;
  const canSubmitSandbox = hasRequests && runtimeReady && callbackReady && receiptContractReady && blocked === 0;
  const verdict: RestaurantShiftSandboxAcceptance['verdict'] = canSubmitSandbox
    ? 'ready-for-sandbox-submit'
    : blocked > 0
      ? 'blocked'
      : 'waiting-provider';

  return {
    ok: true,
    payloadShape: 'restaurant-shift-sandbox-acceptance-v1',
    generatedAt: now.toISOString(),
    verdict,
    summary: {
      stages: stages.length,
      passed,
      waitingExternal,
      blocked,
      providerRequests: handoff.summary.requests,
      p0: handoff.summary.p0,
      canSubmitSandbox,
      canClaimExternalAutomation: false,
    },
    stages,
    submitContract: {
      sendToRuntime: 'safePayload-and-executionPackage-only',
      callbackAction: 'external-receipt',
      callbackHeader: 'x-restaurant-agent-signature',
      requiredReceiptFields: ['eventId', 'channel', 'externalRunId or screenshotId or evidenceUrl', 'operator', 'summary'],
      forbiddenFields: ['API key values', 'cookies', 'tokens', 'browser profile raw ids', 'private-message bodies', 'customer identifiers', 'coupon codes', 'payment ids', 'raw POS rows'],
    },
    providerAskDigest: {
      providerEnvKeys: handoff.providerEnvKeys,
      merchantApprovals: handoff.merchantApprovals,
      dataContracts: handoff.dataContracts,
    },
    operatorRunbook: [
      'Run Shift Autopilot and build Shift Provider Handoff from the recorded provider-held actions.',
      'Resolve P0 runtime, callback and merchant authorization asks; never paste secret values into the client.',
      'Submit only sanitized payloads to a sandbox runtime and require signed external-receipt callbacks.',
      'Keep production automation claims blocked until sandbox submit, callback, receipt inbox, merchant grants and data contracts are all proven.',
    ],
    externalRequired: stages.filter(item => item.status !== 'passed').map(item => item.nextAction).slice(0, 10),
    safetyBoundary: 'Shift Sandbox Acceptance is a preflight acceptance contract. It does not submit provider runs, log in, publish, contact customers, redeem coupons, pull POS rows, expose secrets, or claim automation without signed/public proof.',
  };
}

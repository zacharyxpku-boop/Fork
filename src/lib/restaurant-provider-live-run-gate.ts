import type { RestaurantBrowserGatewayPack } from '@/lib/restaurant-browser-gateway-pack';
import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import type { RestaurantProviderReceiptAcceptanceConsole } from '@/lib/restaurant-provider-receipt-acceptance-console';
import type { RestaurantProviderRunPacket } from '@/lib/restaurant-provider-run-packet';
import type { RestaurantProviderSandboxSubmitWorkbench } from '@/lib/restaurant-provider-sandbox-submit-workbench';

export type RestaurantProviderLiveRunGate = {
  ok: true;
  payloadShape: 'restaurant-provider-live-run-gate-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict:
    | 'ready-real-provider-run'
    | 'ready-supervised-browser-run'
    | 'simulator-only'
    | 'waiting-provider-receipt'
    | 'accepted-closeout-ready'
    | 'blocked-provider-setup';
  summary: {
    healthReady: number;
    healthItems: number;
    readinessScore: number;
    browserExecutable: boolean;
    packageReady: boolean;
    receiptWaiting: boolean;
    receiptAccepted: boolean;
    canStartRealProviderNow: boolean;
    canStartSupervisedBrowserNow: boolean;
    canClaimExternalAutomation: false;
  };
  selectedRun: {
    providerTarget: string;
    packageId: string;
    endpointEnv: string;
    endpointPath: '/events' | '/tasks' | '/runs';
    gatewayId: string;
    callbackAction: 'external-receipt';
    callbackHeader: 'x-restaurant-agent-signature';
  };
  launchChecklist: Array<{
    id: 'runtime-health' | 'browser-gateway' | 'provider-package' | 'merchant-auth' | 'data-contract' | 'signed-callback' | 'receipt-closeout' | 'claim-boundary';
    status: 'ready' | 'waiting' | 'blocked' | 'accepted';
    owner: 'runtime-admin' | 'provider' | 'merchant' | 'data-ops' | 'ops' | 'store-manager';
    evidence: string[];
    nextAction: string;
    stopLine: string;
  }>;
  firstLiveAction: {
    mode: 'real-provider' | 'supervised-browser' | 'simulator';
    method: 'POST';
    endpoint: string;
    bodyShape: 'restaurant-agent-external-execution-v1' | 'restaurant-browser-gateway-request-v1';
    acceptedResult: string[];
  };
  externalRequired: string[];
  safetyBoundary: string;
};

function unique(values: string[], limit = 14): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function itemEvidence(health: RestaurantProviderReadinessHealth, id: string): string[] {
  const item = health.items.find(entry => entry.id === id || entry.category === id);
  return item ? [...item.configuredEvidence, ...item.missingEvidence].filter(Boolean).slice(0, 5) : [];
}

function hasReady(health: RestaurantProviderReadinessHealth, id: string): boolean {
  return health.items.some(item => (item.id === id || item.category === id) && item.status === 'health-ready');
}

function verdictFor(input: {
  receiptAccepted: boolean;
  receiptWaiting: boolean;
  canStartRealProviderNow: boolean;
  canStartSupervisedBrowserNow: boolean;
  simulatorReady: boolean;
}): RestaurantProviderLiveRunGate['verdict'] {
  if (input.receiptAccepted) return 'accepted-closeout-ready';
  if (input.receiptWaiting) return 'waiting-provider-receipt';
  if (input.canStartRealProviderNow) return 'ready-real-provider-run';
  if (input.canStartSupervisedBrowserNow) return 'ready-supervised-browser-run';
  if (input.simulatorReady) return 'simulator-only';
  return 'blocked-provider-setup';
}

export function buildRestaurantProviderLiveRunGate(input: {
  providerReadinessHealth: RestaurantProviderReadinessHealth;
  browserGatewayPack: RestaurantBrowserGatewayPack;
  providerSandboxSubmitWorkbench: RestaurantProviderSandboxSubmitWorkbench;
  providerRunPacket: RestaurantProviderRunPacket;
  providerReceiptAcceptanceConsole: RestaurantProviderReceiptAcceptanceConsole;
  now?: Date;
}): RestaurantProviderLiveRunGate {
  const now = input.now || new Date();
  const health = input.providerReadinessHealth;
  const runPacket = input.providerRunPacket;
  const receiptConsole = input.providerReceiptAcceptanceConsole;
  const packageReady = input.providerSandboxSubmitWorkbench.summary.readyToSubmit > 0
    || runPacket.summary.canSubmitRealProviderNow;
  const receiptWaiting = receiptConsole.summary.waitingReceipts > 0
    || input.providerSandboxSubmitWorkbench.summary.waitingReceipt > 0;
  const receiptAccepted = receiptConsole.summary.acceptedReceipts > 0
    || input.providerSandboxSubmitWorkbench.summary.acceptedReceipt > 0;
  const runtimeHealthReady = health.items.some(item => item.category === 'runtime' && item.status === 'health-ready');
  const callbackReady = hasReady(health, 'callback-secret');
  const merchantReady = hasReady(health, 'merchant-platform-authorization');
  const dataReady = hasReady(health, 'operating-data-contract');
  const browserExecutable = input.browserGatewayPack.canExecuteNow;
  const canStartRealProviderNow = health.summary.canEnableExternalAutomation
    && runPacket.summary.canSubmitRealProviderNow
    && packageReady
    && callbackReady
    && merchantReady
    && !receiptWaiting
    && !receiptAccepted;
  const canStartSupervisedBrowserNow = browserExecutable
    && packageReady
    && callbackReady
    && merchantReady
    && !receiptWaiting
    && !receiptAccepted;
  const verdict = verdictFor({
    receiptAccepted,
    receiptWaiting,
    canStartRealProviderNow,
    canStartSupervisedBrowserNow,
    simulatorReady: runPacket.summary.canSubmitSimulatorNow,
  });

  const launchChecklist: RestaurantProviderLiveRunGate['launchChecklist'] = [
    {
      id: 'runtime-health',
      status: runtimeHealthReady ? 'ready' : health.summary.rememberedNotProbed > 0 ? 'waiting' : 'blocked',
      owner: 'runtime-admin',
      evidence: health.items.filter(item => item.category === 'runtime').flatMap(item => item.configuredEvidence).slice(0, 6),
      nextAction: runtimeHealthReady ? 'Keep the selected runtime behind one governed run packet.' : health.nextActions.find(item => /runtime|URL|key|probe/i.test(item)) || 'Configure one runtime URL/key pair and run Provider Health.',
      stopLine: 'No live Provider run without reachable runtime health.',
    },
    {
      id: 'browser-gateway',
      status: browserExecutable ? 'ready' : 'blocked',
      owner: 'provider',
      evidence: [input.browserGatewayPack.gatewayId, `acceptedActions:${input.browserGatewayPack.browserRequest.acceptedActions.length}`],
      nextAction: browserExecutable ? 'Forward only the gateway request and runbook id.' : input.browserGatewayPack.externalRequired[0] || 'Configure isolated browser profile and callback secret.',
      stopLine: 'No unmanaged browser, raw profile id, cookie export or private page capture.',
    },
    {
      id: 'provider-package',
      status: packageReady ? 'ready' : 'blocked',
      owner: 'ops',
      evidence: [runPacket.selected.packageId, `readyPackages:${input.providerSandboxSubmitWorkbench.summary.readyToSubmit}`],
      nextAction: packageReady ? 'Submit one package only; keep run open until signed receipt.' : input.providerSandboxSubmitWorkbench.externalRequired[0] || 'Build a safe provider package.',
      stopLine: 'No package with secrets, raw POS rows, customer identifiers or private-message text.',
    },
    {
      id: 'merchant-auth',
      status: merchantReady ? 'ready' : 'blocked',
      owner: 'merchant',
      evidence: itemEvidence(health, 'merchant-platform-authorization'),
      nextAction: merchantReady ? 'Attach scope, expiry and revocation owner to the run.' : 'Collect merchant platform authorization before live publish, lead capture or coupon actions.',
      stopLine: 'No platform action without merchant-approved scope.',
    },
    {
      id: 'data-contract',
      status: dataReady ? 'ready' : 'waiting',
      owner: 'data-ops',
      evidence: itemEvidence(health, 'operating-data-contract'),
      nextAction: dataReady ? 'Use aggregate/no-PII operating data only.' : 'Keep true operating analysis and redemption reconciliation in manual/import mode.',
      stopLine: 'No true operating analysis from generated content or raw POS rows.',
    },
    {
      id: 'signed-callback',
      status: callbackReady ? 'ready' : 'blocked',
      owner: 'runtime-admin',
      evidence: itemEvidence(health, 'callback-secret').concat(receiptConsole.run.callbackHeader).slice(0, 5),
      nextAction: callbackReady ? 'Require signed external-receipt for closeout.' : 'Configure RESTAURANT_AGENT_CALLBACK_SECRET server-side.',
      stopLine: 'Unsigned callbacks do not close runs or train memory.',
    },
    {
      id: 'receipt-closeout',
      status: receiptAccepted ? 'accepted' : receiptWaiting ? 'waiting' : 'blocked',
      owner: 'store-manager',
      evidence: [`accepted:${receiptConsole.summary.acceptedReceipts}`, `waiting:${receiptConsole.summary.waitingReceipts}`, `rejected:${receiptConsole.summary.rejectedReceipts}`],
      nextAction: receiptAccepted ? 'Move accepted proof into closeout review and next-run memory.' : receiptWaiting ? 'Wait for signed public proof callback.' : 'Do not train next run until one accepted receipt exists.',
      stopLine: 'No memory write or next-run training from pending or rejected proof.',
    },
    {
      id: 'claim-boundary',
      status: 'blocked',
      owner: 'ops',
      evidence: ['canClaimExternalAutomation:false', `verdict:${verdict}`],
      nextAction: 'Only claim live automation after repeated accepted real receipts and merchant data contracts.',
      stopLine: 'Simulator readiness or one packet is not a production automation claim.',
    },
  ];

  const mode: RestaurantProviderLiveRunGate['firstLiveAction']['mode'] = canStartRealProviderNow
    ? 'real-provider'
    : canStartSupervisedBrowserNow
      ? 'supervised-browser'
      : 'simulator';

  return {
    ok: true,
    payloadShape: 'restaurant-provider-live-run-gate-v1',
    generatedAt: now.toISOString(),
    restaurant: runPacket.restaurant,
    offer: runPacket.offer,
    verdict,
    summary: {
      healthReady: health.summary.healthReady,
      healthItems: health.summary.items,
      readinessScore: health.summary.readinessScore,
      browserExecutable,
      packageReady,
      receiptWaiting,
      receiptAccepted,
      canStartRealProviderNow,
      canStartSupervisedBrowserNow,
      canClaimExternalAutomation: false,
    },
    selectedRun: {
      providerTarget: runPacket.summary.targetProvider,
      packageId: runPacket.selected.packageId,
      endpointEnv: runPacket.selected.endpointEnv,
      endpointPath: runPacket.selected.endpointPath,
      gatewayId: input.browserGatewayPack.gatewayId,
      callbackAction: 'external-receipt',
      callbackHeader: 'x-restaurant-agent-signature',
    },
    launchChecklist,
    firstLiveAction: {
      mode,
      method: 'POST',
      endpoint: mode === 'supervised-browser'
        ? input.browserGatewayPack.browserRequest.endpointPath
        : `${runPacket.selected.endpointEnv}${runPacket.selected.endpointPath}`,
      bodyShape: mode === 'supervised-browser'
        ? 'restaurant-browser-gateway-request-v1'
        : 'restaurant-agent-external-execution-v1',
      acceptedResult: ['externalRunId', 'signed external-receipt', 'public proof URL or screenshot id', 'sanitized aggregate signal counts'],
    },
    externalRequired: unique([
      ...health.externalRequired,
      ...input.browserGatewayPack.externalRequired,
      ...input.providerSandboxSubmitWorkbench.externalRequired,
      ...receiptConsole.externalRequired,
      ...launchChecklist.filter(item => item.status !== 'ready' && item.status !== 'accepted').map(item => item.nextAction),
    ], 18),
    safetyBoundary: 'Provider Live Run Gate is the final go/no-go surface before a real Provider or supervised browser run. It does not publish, acquire leads, redeem coupons, read private messages, pull raw POS rows, expose secrets or claim production automation; it only permits a live run when runtime health, merchant scope, callback, package safety and receipt closeout gates are satisfied.',
  };
}

import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import type { RestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';
import type { RestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';
import type { RestaurantTaskProviderHandoff } from '@/lib/restaurant-task-provider-handoff';

export type RestaurantProviderSandboxCheck = {
  id: string;
  label: string;
  status: 'passed' | 'blocked' | 'external-required';
  owner: 'runtime-admin' | 'merchant' | 'ops';
  evidence: string[];
  unlocks: string[];
  nextAction: string;
};

export type RestaurantProviderSandboxContract = {
  ok: true;
  payloadShape: 'restaurant-provider-sandbox-contract-v1';
  generatedAt: string;
  verdict: 'sandbox-ready' | 'setup-required' | 'external-required';
  summary: {
    checks: number;
    passed: number;
    blocked: number;
    externalRequired: number;
    canRunSandbox: boolean;
    canClaimAutomation: boolean;
  };
  checks: RestaurantProviderSandboxCheck[];
  acceptanceContract: {
    submitRequires: string[];
    callbackRequires: string[];
    recoveryRequires: string[];
    forbiddenInPayload: string[];
  };
  operatorScript: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

function check(input: RestaurantProviderSandboxCheck): RestaurantProviderSandboxCheck {
  return input;
}

function hasReadyRuntime(probe?: RestaurantRuntimeProbe): boolean {
  return Boolean(probe?.targets.some(target => target.status === 'ready'));
}

function hasCallbackReady(probe?: RestaurantRuntimeProbe, health?: RestaurantProviderReadinessHealth): boolean {
  return Boolean(
    probe?.gates.some(gate => gate.id === 'callback-secret' && gate.status === 'ready')
    || health?.items.some(item => item.id === 'callback-secret' && item.status === 'health-ready'),
  );
}

export function buildRestaurantProviderSandboxContract(input: {
  runtimeProbe?: RestaurantRuntimeProbe;
  providerReadinessHealth?: RestaurantProviderReadinessHealth;
  taskProviderHandoff?: RestaurantTaskProviderHandoff;
  providerReceiptInbox?: RestaurantProviderReceiptInbox;
  now?: Date;
}): RestaurantProviderSandboxContract {
  const runtimeReady = hasReadyRuntime(input.runtimeProbe);
  const callbackReady = hasCallbackReady(input.runtimeProbe, input.providerReadinessHealth);
  const hasForwardablePackage = Boolean(input.taskProviderHandoff?.packages.some(item => item.canForward));
  const hasReceiptRequest = Boolean(input.providerReceiptInbox?.requests.length);
  const hasActionRequired = Boolean(input.providerReceiptInbox?.summary.actionRequired);
  const healthReady = Boolean(input.providerReadinessHealth?.summary.canEnableExternalAutomation);

  const checks = [
    check({
      id: 'runtime-health',
      label: 'Runtime health probe',
      status: runtimeReady ? 'passed' : 'external-required',
      owner: 'runtime-admin',
      evidence: input.runtimeProbe?.targets.map(target => `${target.target}:${target.status}`) || ['runtime probe not run'],
      unlocks: ['provider submit attempt', 'external run id'],
      nextAction: runtimeReady ? 'Keep runtime health in the sandbox evidence pack.' : 'Configure at least one reachable Lobu/OpenClaw/Hermes runtime URL and API key.',
    }),
    check({
      id: 'callback-signature',
      label: 'Signed callback gate',
      status: callbackReady ? 'passed' : 'external-required',
      owner: 'runtime-admin',
      evidence: input.runtimeProbe?.gates.filter(gate => gate.id === 'callback-secret').map(gate => gate.evidence)
        || input.providerReadinessHealth?.items.filter(item => item.id === 'callback-secret').flatMap(item => item.configuredEvidence)
        || ['callback secret not checked'],
      unlocks: ['external-receipt acceptance', 'run health closeout'],
      nextAction: callbackReady ? 'Require every provider completion to call external-receipt with the signature header.' : 'Configure RESTAURANT_AGENT_CALLBACK_SECRET outside the UI.',
    }),
    check({
      id: 'safe-forward-package',
      label: 'Safe task package',
      status: hasForwardablePackage ? 'passed' : input.taskProviderHandoff ? 'blocked' : 'external-required',
      owner: 'ops',
      evidence: input.taskProviderHandoff
        ? [`packages:${input.taskProviderHandoff.summary.packages}`, `forwardable:${input.taskProviderHandoff.summary.forwardable}`, `blocked:${input.taskProviderHandoff.summary.blocked}`]
        : ['task provider handoff not built'],
      unlocks: ['governed provider submit', 'blocked run audit'],
      nextAction: hasForwardablePackage ? 'Use only the sanitized executionPackage and safePayload for provider submit.' : 'Move a task to ready-for-provider and rebuild handoff after evidence review.',
    }),
    check({
      id: 'receipt-inbox',
      label: 'Receipt inbox contract',
      status: hasReceiptRequest ? (hasActionRequired ? 'blocked' : 'passed') : 'external-required',
      owner: 'ops',
      evidence: input.providerReceiptInbox
        ? [`requests:${input.providerReceiptInbox.summary.total}`, `actionRequired:${input.providerReceiptInbox.summary.actionRequired}`]
        : ['provider receipt inbox not built'],
      unlocks: ['run health review', 'recovery workflow'],
      nextAction: hasReceiptRequest ? 'Collect signed external-receipt callbacks or resolve each inbox blocker.' : 'Forward a governed package or import a manual receipt to create inbox requests.',
    }),
    check({
      id: 'merchant-and-data-gates',
      label: 'Merchant auth and data gates',
      status: healthReady ? 'passed' : input.providerReadinessHealth ? 'external-required' : 'blocked',
      owner: 'merchant',
      evidence: input.providerReadinessHealth
        ? [`score:${input.providerReadinessHealth.summary.readinessScore}`, `ready:${input.providerReadinessHealth.summary.healthReady}/${input.providerReadinessHealth.summary.items}`]
        : ['provider readiness health not run'],
      unlocks: ['auto publish boundary', 'lead count summary', 'operating analysis'],
      nextAction: healthReady ? 'Sandbox can proceed, but production automation still needs signed receipts per run.' : 'Collect merchant platform auth, browser profile, provider credentials and aggregate POS data contract.',
    }),
  ];

  const passed = checks.filter(item => item.status === 'passed').length;
  const blocked = checks.filter(item => item.status === 'blocked').length;
  const externalRequired = checks.filter(item => item.status === 'external-required').length;
  const canRunSandbox = runtimeReady && callbackReady && (hasForwardablePackage || Boolean(input.taskProviderHandoff));
  const canClaimAutomation = canRunSandbox && healthReady && hasReceiptRequest && !hasActionRequired && blocked === 0 && externalRequired === 0;
  const verdict: RestaurantProviderSandboxContract['verdict'] = canClaimAutomation
    ? 'sandbox-ready'
    : externalRequired > 0
      ? 'external-required'
      : 'setup-required';

  return {
    ok: true,
    payloadShape: 'restaurant-provider-sandbox-contract-v1',
    generatedAt: (input.now || new Date()).toISOString(),
    verdict,
    summary: {
      checks: checks.length,
      passed,
      blocked,
      externalRequired,
      canRunSandbox,
      canClaimAutomation,
    },
    checks,
    acceptanceContract: {
      submitRequires: ['runtime URL', 'runtime API key', 'sanitized executionPackage', 'merchant scope', 'cost/retry limit'],
      callbackRequires: ['x-restaurant-agent-signature', 'eventId', 'channel', 'externalRunId or screenshotId or evidenceUrl', 'operator', 'summary'],
      recoveryRequires: ['provider error code or blocked reason', 'next owner', 'retry decision', 'manual fallback proof'],
      forbiddenInPayload: ['API keys', 'cookies', 'tokens', 'browser profile raw ids', 'private-message bodies', 'raw POS rows', 'customer PII'],
    },
    operatorScript: [
      'Run Provider Health, build Task Provider Handoff, forward through the runtime bridge, then open Provider Receipt Inbox.',
      'Sandbox passes only when submit, callback, receipt validation and recovery evidence all exist.',
      'Do not claim auto-publish, auto-acquisition, auto-redemption or true operating analysis until sandbox and merchant/data gates are proven.',
    ],
    externalRequired: Array.from(new Set(checks.filter(item => item.status !== 'passed').map(item => item.nextAction))).slice(0, 8),
    safetyBoundary: 'Provider Sandbox Contract is a readiness and acceptance contract only. It does not log in, publish, read private messages, redeem coupons, pull raw POS rows, expose secrets, or convert setup evidence into automation claims.',
  };
}

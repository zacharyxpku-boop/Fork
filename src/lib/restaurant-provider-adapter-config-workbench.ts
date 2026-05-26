import { buildRestaurantAgentExecutionPackage } from '@/lib/restaurant-agent-execution-package';
import type { RestaurantRuntimeTarget } from '@/lib/restaurant-agent-runtime-bridge';
import type { RestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';
import { buildRestaurantRuntimeAdapterContract, type RestaurantRuntimeAdapterContract } from '@/lib/restaurant-runtime-adapter-contract';
import type { RestaurantProviderAdapterContractPack } from '@/lib/restaurant-provider-adapter-contract-pack';
import type { RestaurantProviderSandboxReadinessBoard } from '@/lib/restaurant-provider-sandbox-readiness-board';
import type { RestaurantProviderSandboxRunConsole } from '@/lib/restaurant-provider-sandbox-run-console';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

type EnvMap = Record<string, string | undefined>;

export type RestaurantProviderAdapterConfigTarget = {
  target: RestaurantRuntimeTarget;
  label: string;
  mode: 'real-provider' | 'sandbox-simulator' | 'setup-required';
  status: 'ready-real-submit' | 'simulator-ready' | 'missing-runtime' | 'missing-callback' | 'missing-merchant-grant' | 'missing-data-contract';
  submitAllowed: boolean;
  simulatorAllowed: boolean;
  endpointEnv: string;
  apiKeyEnv: string;
  submitPath: '/events' | '/tasks' | '/runs';
  healthPath: '/health';
  configuredEvidence: string[];
  missingEnvKeys: string[];
  missingBusinessEvidence: string[];
  callbackRequired: string[];
  acceptanceEvidence: string[];
  firstTest: string;
  stopLine: string;
};

export type RestaurantProviderAdapterConfigWorkbench = {
  ok: true;
  payloadShape: 'restaurant-provider-adapter-config-workbench-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'real-provider-ready' | 'simulator-first' | 'merchant-auth-first' | 'callback-first' | 'runtime-keys-first';
  summary: {
    targets: number;
    realProviderReady: number;
    simulatorReady: number;
    setupRequired: number;
    missingEnvKeys: number;
    missingBusinessEvidence: number;
    canUseSimulatorNow: boolean;
    canSubmitRealProviderNow: boolean;
    canClaimExternalAutomation: false;
  };
  recommended: {
    target: RestaurantRuntimeTarget;
    mode: RestaurantProviderAdapterConfigTarget['mode'];
    reason: string;
    nextAction: string;
  };
  targets: RestaurantProviderAdapterConfigTarget[];
  providerOfTheKeyRequest: Array<{
    owner: 'runtime-admin' | 'merchant' | 'data-ops' | 'ops';
    giveThis: string[];
    unlocks: string[];
  }>;
  sandboxVsReal: {
    simulatorCanDo: string[];
    realProviderRequires: string[];
    productionClaimRequires: string[];
  };
  adapterContracts: Array<Pick<RestaurantRuntimeAdapterContract, 'payloadShape' | 'target' | 'verdict' | 'summary' | 'adapterSpec' | 'requestContract' | 'callbackContract' | 'safetyBoundary'>>;
  redactedFields: string[];
  safetyBoundary: string;
};

const TARGETS: Array<{
  target: RestaurantRuntimeTarget;
  label: string;
  endpointEnv: string;
  apiKeyEnv: string;
  submitPath: '/events' | '/tasks' | '/runs';
}> = [
  {
    target: 'lobu',
    label: 'Lobu-compatible worker',
    endpointEnv: 'RESTAURANT_AGENT_LOBU_RUNTIME_URL',
    apiKeyEnv: 'RESTAURANT_AGENT_LOBU_API_KEY',
    submitPath: '/events',
  },
  {
    target: 'openclaw',
    label: 'OpenClaw browser agent',
    endpointEnv: 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL',
    apiKeyEnv: 'RESTAURANT_AGENT_OPENCLAW_API_KEY',
    submitPath: '/tasks',
  },
  {
    target: 'hermes',
    label: 'Hermes resident runtime',
    endpointEnv: 'RESTAURANT_AGENT_HERMES_RUNTIME_URL',
    apiKeyEnv: 'RESTAURANT_AGENT_HERMES_API_KEY',
    submitPath: '/runs',
  },
];

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().replace(/\s+/g, ' ').slice(0, 120) : fallback;
}

function hasValue(env: EnvMap, key: string): boolean {
  return typeof env[key] === 'string' && env[key]!.trim().length > 0;
}

function unique(values: string[], limit = 12): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function targetStatus(input: {
  contract: RestaurantRuntimeAdapterContract;
  callbackReady: boolean;
  readiness: RestaurantProviderSandboxReadinessBoard;
  businessMissing: string[];
}): RestaurantProviderAdapterConfigTarget['status'] {
  if (input.contract.summary.canSubmitSandbox && input.readiness.summary.canSubmitSandboxNow) return 'ready-real-submit';
  if (input.businessMissing.some(item => /merchant|authorization|grant/i.test(item))) return 'missing-merchant-grant';
  if (input.businessMissing.some(item => /data|POS|coupon|field|redemption/i.test(item))) return 'missing-data-contract';
  if (!input.callbackReady) return 'missing-callback';
  return 'missing-runtime';
}

function verdictFor(targets: RestaurantProviderAdapterConfigTarget[]): RestaurantProviderAdapterConfigWorkbench['verdict'] {
  if (targets.some(item => item.submitAllowed)) return 'real-provider-ready';
  if (targets.some(item => item.status === 'missing-merchant-grant')) return 'merchant-auth-first';
  if (targets.some(item => item.status === 'missing-callback')) return 'callback-first';
  if (targets.some(item => item.simulatorAllowed)) return 'simulator-first';
  return 'runtime-keys-first';
}

function keyRequest(
  input: RestaurantProviderAdapterConfigWorkbench['providerOfTheKeyRequest'][number],
): RestaurantProviderAdapterConfigWorkbench['providerOfTheKeyRequest'][number] {
  return input;
}

export function buildRestaurantProviderAdapterConfigWorkbench(input: RestaurantTrialIntake & {
  providerAdapterContractPack: RestaurantProviderAdapterContractPack;
  providerSandboxReadinessBoard: RestaurantProviderSandboxReadinessBoard;
  providerSandboxRunConsole: RestaurantProviderSandboxRunConsole;
  runtimeProbe?: RestaurantRuntimeProbe;
  env?: EnvMap;
  now?: Date;
}): RestaurantProviderAdapterConfigWorkbench {
  const now = input.now || new Date();
  const env = input.env || process.env;
  const restaurant = clean(input.restaurant, input.providerSandboxRunConsole.restaurant);
  const offer = clean(input.offer, input.providerSandboxRunConsole.offer);
  const callbackReady = hasValue(env, 'RESTAURANT_AGENT_CALLBACK_SECRET')
    || input.providerAdapterContractPack.adapters.some(adapter => adapter.status === 'ready-to-test' && adapter.callbackEvents.length > 0);
  const businessMissing = unique([
    ...input.providerSandboxReadinessBoard.rows.flatMap(row => row.missing),
    ...input.providerSandboxRunConsole.externalRequired,
  ], 20);

  const contracts = TARGETS.map(target => buildRestaurantRuntimeAdapterContract({
    target: target.target,
    executionPackage: buildRestaurantAgentExecutionPackage({
      target: target.target,
      restaurant,
      offer,
      owner: 'restaurant-ops',
      env,
      now,
    }),
    runtimeProbe: input.runtimeProbe,
    now,
  }));

  const targets = TARGETS.map(target => {
    const contract = contracts.find(item => item.target === target.target)!;
    const missingEnvKeys = [
      !hasValue(env, target.endpointEnv) ? target.endpointEnv : '',
      !hasValue(env, target.apiKeyEnv) ? target.apiKeyEnv : '',
      !hasValue(env, 'RESTAURANT_AGENT_CALLBACK_SECRET') ? 'RESTAURANT_AGENT_CALLBACK_SECRET' : '',
      !hasValue(env, 'RESTAURANT_AGENT_BROWSER_PROFILE_ID') ? 'RESTAURANT_AGENT_BROWSER_PROFILE_ID' : '',
    ].filter(Boolean);
    const status = targetStatus({
      contract,
      callbackReady,
      readiness: input.providerSandboxReadinessBoard,
      businessMissing,
    });
    const submitAllowed = status === 'ready-real-submit';
    const simulatorAllowed = input.providerSandboxRunConsole.summary.steps > 0;
    const mode: RestaurantProviderAdapterConfigTarget['mode'] = submitAllowed
      ? 'real-provider'
      : simulatorAllowed
        ? 'sandbox-simulator'
        : 'setup-required';

    return {
      target: target.target,
      label: target.label,
      mode,
      status,
      submitAllowed,
      simulatorAllowed,
      endpointEnv: target.endpointEnv,
      apiKeyEnv: target.apiKeyEnv,
      submitPath: target.submitPath,
      healthPath: '/health',
      configuredEvidence: unique([
        hasValue(env, target.endpointEnv) ? `${target.endpointEnv}:configured` : '',
        hasValue(env, target.apiKeyEnv) ? `${target.apiKeyEnv}:configured` : '',
        hasValue(env, 'RESTAURANT_AGENT_CALLBACK_SECRET') ? 'callback-secret:configured' : '',
        hasValue(env, 'RESTAURANT_AGENT_BROWSER_PROFILE_ID') ? 'browser-profile:configured' : '',
        `adapter:${contract.verdict}`,
      ], 8),
      missingEnvKeys,
      missingBusinessEvidence: businessMissing.slice(0, 8),
      callbackRequired: [
        '/api/restaurant-agent/runtime',
        'external-receipt',
        'x-restaurant-agent-signature',
      ],
      acceptanceEvidence: unique([
        ...contract.callbackContract.acceptedEvidence,
        ...input.providerSandboxRunConsole.providerCallbackContract.acceptedEvidence,
      ], 10),
      firstTest: submitAllowed
        ? `Submit one sanitized package to ${target.target}${target.submitPath}; close only after signed receipt.`
        : `Run simulator timeline now; collect ${missingEnvKeys[0] || businessMissing[0] || 'provider acceptance evidence'} before real submit.`,
      stopLine: 'No real provider submit, publish, lead contact, coupon redemption, POS write or production claim without runtime key, merchant grant, callback and accepted receipt.',
    } satisfies RestaurantProviderAdapterConfigTarget;
  });

  const realProviderReady = targets.filter(item => item.submitAllowed).length;
  const simulatorReady = targets.filter(item => item.simulatorAllowed).length;
  const setupRequired = targets.filter(item => item.mode === 'setup-required' || !item.submitAllowed).length;
  const missingEnvKeys = unique(targets.flatMap(item => item.missingEnvKeys), 20);
  const missingBusinessEvidence = unique(targets.flatMap(item => item.missingBusinessEvidence), 20);
  const recommended = targets.find(item => item.submitAllowed)
    || targets.find(item => item.target === 'openclaw')
    || targets[0];

  return {
    ok: true,
    payloadShape: 'restaurant-provider-adapter-config-workbench-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    verdict: verdictFor(targets),
    summary: {
      targets: targets.length,
      realProviderReady,
      simulatorReady,
      setupRequired,
      missingEnvKeys: missingEnvKeys.length,
      missingBusinessEvidence: missingBusinessEvidence.length,
      canUseSimulatorNow: simulatorReady > 0,
      canSubmitRealProviderNow: realProviderReady > 0,
      canClaimExternalAutomation: false,
    },
    recommended: {
      target: recommended.target,
      mode: recommended.mode,
      reason: recommended.submitAllowed
        ? 'This target has runtime, callback and sandbox evidence ready enough for one controlled provider submit.'
        : 'OpenClaw is the closest fit for Claw-style browser execution; keep simulator mode until runtime key, merchant grant and callback are accepted.',
      nextAction: recommended.firstTest,
    },
    targets,
    providerOfTheKeyRequest: [
      keyRequest({
        owner: 'runtime-admin',
        giveThis: missingEnvKeys.filter(key => key.includes('RUNTIME_URL') || key.includes('API_KEY') || key.includes('CALLBACK') || key.includes('BROWSER')).slice(0, 8),
        unlocks: ['real provider sandbox submit', 'runner heartbeat', 'signed callback closeout'],
      }),
      keyRequest({
        owner: 'merchant',
        giveThis: missingBusinessEvidence.filter(item => /merchant|authorization|grant|platform|account/i.test(item)).slice(0, 8),
        unlocks: ['platform proof capture', 'lead summary receipt', 'approved account action scope'],
      }),
      keyRequest({
        owner: 'data-ops',
        giveThis: missingBusinessEvidence.filter(item => /data|POS|coupon|field|redemption|grossSales|order/i.test(item)).slice(0, 8),
        unlocks: ['coupon redemption reconciliation', 'true operating analysis', 'closeout training'],
      }),
    ].filter(item => item.giveThis.length > 0),
    sandboxVsReal: {
      simulatorCanDo: [
        'show the exact submit timeline, callback contract, receipt lifecycle and closeout checklist',
        'train staff on owner/evidence/next-action flow without touching platform accounts',
        'validate payload shape and stop lines before giving any provider keys',
      ],
      realProviderRequires: [
        'one runtime URL and server-side API key',
        'RESTAURANT_AGENT_CALLBACK_SECRET',
        'isolated browser profile alias',
        'merchant platform authorization and allowed action scope',
        'accepted signed receipt from the first sandbox run',
      ],
      productionClaimRequires: [
        'provider health ready',
        'merchant grant active',
        'callback signature accepted',
        'public proof or sanitized aggregate receipt accepted',
        'no forbidden fields in payload, callback or memory',
      ],
    },
    adapterContracts: contracts.map(contract => ({
      payloadShape: contract.payloadShape,
      target: contract.target,
      verdict: contract.verdict,
      summary: contract.summary,
      adapterSpec: contract.adapterSpec,
      requestContract: contract.requestContract,
      callbackContract: contract.callbackContract,
      safetyBoundary: contract.safetyBoundary,
    })),
    redactedFields: [
      'api keys',
      'callback secret',
      'auth tokens',
      'cookies',
      'raw browser profile ids',
      'private-message text',
      'customer PII',
      'coupon codes',
      'payment ids',
      'raw POS rows',
    ],
    safetyBoundary: 'Provider Adapter Config Workbench chooses simulator versus real-provider mode and lists missing external keys, grants and receipts. It never collects or returns secret values, never executes browser actions itself, and never claims external automation until the chosen adapter passes runtime health, merchant authorization, signed callback and accepted proof-ledger checks.',
  };
}

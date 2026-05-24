import type { RestaurantCapabilityTrainingPlan } from '@/lib/restaurant-capability-training';
import type { RestaurantProviderSandboxContract } from '@/lib/restaurant-provider-sandbox-contract';
import type { RestaurantProviderSetupPack } from '@/lib/restaurant-provider-setup-pack';
import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import type { RestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';

export type RestaurantProviderLaunchTrainingTrack = {
  id: string;
  title: string;
  status: 'train-now' | 'provider-required' | 'sandbox-required' | 'ready';
  owner: 'ops' | 'runtime-admin' | 'merchant' | 'data';
  goal: string;
  inputs: string[];
  acceptance: string[];
  providerKeys: string[];
  nextAction: string;
};

export type RestaurantProviderLaunchTrainingPack = {
  ok: true;
  payloadShape: 'restaurant-provider-launch-training-pack-v1';
  generatedAt: string;
  verdict: 'internal-training' | 'provider-setup-required' | 'sandbox-required' | 'ready-to-pilot';
  summary: {
    tracks: number;
    ready: number;
    trainNow: number;
    providerRequired: number;
    sandboxRequired: number;
    missingTrainingMaterials: number;
    missingExternalProviders: number;
    sandboxPassed: number;
    sandboxChecks: number;
  };
  tracks: RestaurantProviderLaunchTrainingTrack[];
  providerKeyChecklist: string[];
  trainingQueue: Array<{
    capabilityId: string;
    material: string;
    owner: string;
  }>;
  providerSetupQueue: Array<{
    capabilityId: string;
    provider: string;
    owner: string;
  }>;
  pilotAcceptance: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

function track(input: RestaurantProviderLaunchTrainingTrack): RestaurantProviderLaunchTrainingTrack {
  return input;
}

function statusForProvider(count: number): RestaurantProviderLaunchTrainingTrack['status'] {
  return count > 0 ? 'provider-required' : 'ready';
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).slice(0, 12);
}

export function buildRestaurantProviderLaunchTrainingPack(input: {
  capabilityTrainingPlan: RestaurantCapabilityTrainingPlan;
  providerSetupPack: RestaurantProviderSetupPack;
  providerReadinessHealth: RestaurantProviderReadinessHealth;
  runtimeProbe: RestaurantRuntimeProbe;
  providerSandboxContract: RestaurantProviderSandboxContract;
  now?: Date;
}): RestaurantProviderLaunchTrainingPack {
  const training = input.capabilityTrainingPlan;
  const setup = input.providerSetupPack;
  const sandbox = input.providerSandboxContract;
  const runtimeReady = input.runtimeProbe.summary.ready > 0;
  const readinessReady = input.providerReadinessHealth.summary.canEnableExternalAutomation;

  const tracks = [
    track({
      id: 'content-and-menu-training',
      title: 'Menu, offer and local content skill training',
      status: training.summary.missingTrainingMaterialCount > 0 ? 'train-now' : 'ready',
      owner: 'ops',
      goal: 'Train the restaurant agent to turn menu, offer, scene and public proof into usable local store actions.',
      inputs: unique(training.nextInternalTraining.map(item => item.material)),
      acceptance: [
        'Every generated suggestion cites the provided menu/offer/material source.',
        'No growth number is claimed without accepted receipt or imported operating data.',
      ],
      providerKeys: [],
      nextAction: training.nextInternalTraining[0]
        ? `Collect training material: ${training.nextInternalTraining[0].material}.`
        : 'Keep training examples versioned and run the workbench acceptance checks.',
    }),
    track({
      id: 'runtime-provider-keys',
      title: 'Runtime provider and browser runner setup',
      status: statusForProvider(setup.envTemplate.length),
      owner: 'runtime-admin',
      goal: 'Make OpenClaw/Lobu/Hermes or an equivalent browser runner reachable without exposing secrets in the UI.',
      inputs: setup.envTemplate.map(item => item.key),
      acceptance: [
        'Runtime health has at least one ready target.',
        'Callback secret is configured and never returned to the browser.',
        'Browser profile is an isolated profile id, not a raw cookie or password dump.',
      ],
      providerKeys: setup.envTemplate.map(item => item.key),
      nextAction: setup.envTemplate[0]
        ? `Configure ${setup.envTemplate[0].key} server-side, then rerun Provider Health.`
        : 'Run a sandbox submit and require signed callback receipt.',
    }),
    track({
      id: 'merchant-platform-grants',
      title: 'Merchant platform grants',
      status: statusForProvider(setup.merchantRequests.length),
      owner: 'merchant',
      goal: 'Unlock platform-specific publish proof, lead intake, coupon/redemption evidence and operating exports.',
      inputs: setup.merchantRequests.slice(0, 8).map(item => item.evidence),
      acceptance: [
        'Each grant names allowed action, expiry, revocation owner and evidence source.',
        'Private messages and customer identifiers are summarized or redacted before entering the agent.',
      ],
      providerKeys: [],
      nextAction: setup.merchantRequests[0]?.ask || 'Keep merchant grants auditable before any external run.',
    }),
    track({
      id: 'pos-data-contract',
      title: 'POS, coupon and operating data contract',
      status: readinessReady ? 'ready' : 'provider-required',
      owner: 'data',
      goal: 'Enable real operating analysis from authorized aggregate fields instead of invented attribution.',
      inputs: input.providerReadinessHealth.items
        .filter(item => item.id.includes('pos') || item.id.includes('merchant') || item.id.includes('dianping'))
        .flatMap(item => item.configuredEvidence),
      acceptance: [
        'Field dictionary maps revenue, dish sales, coupon claims, redemptions and time windows.',
        'No raw POS rows, phone numbers, member ids or private chat bodies are stored in the launch pack.',
      ],
      providerKeys: ['RESTAURANT_POS_DATA_MODE', 'RESTAURANT_POS_FIELD_DICTIONARY', 'RESTAURANT_DIANPING_AUTH_STATUS'],
      nextAction: readinessReady
        ? 'Run controlled pilot with aggregate data and accepted receipt closeout.'
        : 'Collect merchant authorization and aggregate POS/data export contract.',
    }),
    track({
      id: 'sandbox-submit-callback-receipt',
      title: 'Sandbox submit, callback, receipt and recovery acceptance',
      status: sandbox.summary.canClaimAutomation
        ? 'ready'
        : runtimeReady && sandbox.summary.canRunSandbox
          ? 'sandbox-required'
          : 'provider-required',
      owner: 'runtime-admin',
      goal: 'Prove the same loop a competitor would need: submit a governed package, receive signed callback, validate receipt, and recover failures.',
      inputs: sandbox.checks.map(item => `${item.id}:${item.status}`),
      acceptance: [
        'A provider run returns externalRunId or proof URL/screenshot id.',
        'Receipt is accepted only through the external-receipt contract or equivalent manual proof.',
        'Blocked runs produce owner, retry decision and fallback proof.',
      ],
      providerKeys: ['RESTAURANT_AGENT_CALLBACK_SECRET', 'RESTAURANT_AGENT_BROWSER_PROFILE_ID'],
      nextAction: sandbox.externalRequired[0] || 'Forward one governed package to sandbox and collect signed external receipt.',
    }),
  ];

  const ready = tracks.filter(item => item.status === 'ready').length;
  const trainNow = tracks.filter(item => item.status === 'train-now').length;
  const providerRequired = tracks.filter(item => item.status === 'provider-required').length;
  const sandboxRequired = tracks.filter(item => item.status === 'sandbox-required').length;
  const verdict: RestaurantProviderLaunchTrainingPack['verdict'] = ready === tracks.length
    ? 'ready-to-pilot'
    : providerRequired > 0
      ? 'provider-setup-required'
      : sandboxRequired > 0
        ? 'sandbox-required'
        : 'internal-training';

  return {
    ok: true,
    payloadShape: 'restaurant-provider-launch-training-pack-v1',
    generatedAt: (input.now || new Date()).toISOString(),
    verdict,
    summary: {
      tracks: tracks.length,
      ready,
      trainNow,
      providerRequired,
      sandboxRequired,
      missingTrainingMaterials: training.summary.missingTrainingMaterialCount,
      missingExternalProviders: training.summary.missingExternalProviderCount,
      sandboxPassed: sandbox.summary.passed,
      sandboxChecks: sandbox.summary.checks,
    },
    tracks,
    providerKeyChecklist: unique([
      ...setup.envTemplate.map(item => item.key),
      ...tracks.flatMap(item => item.providerKeys),
    ]),
    trainingQueue: training.nextInternalTraining,
    providerSetupQueue: training.externalSetupRequests,
    pilotAcceptance: [
      'The pilot must include one governed provider package, one signed or manually accepted receipt, one recovery branch, and one store-manager follow-up.',
      'Auto-publish, auto-acquisition, auto-redemption and true operating analysis stay disabled until the pilot acceptance evidence exists.',
      'Every external run must be reproducible from runtime health, sandbox contract, callback receipt and non-secret audit entries.',
    ],
    externalRequired: unique([
      ...setup.merchantRequests.map(item => item.ask),
      ...sandbox.externalRequired,
      ...training.externalSetupRequests.map(item => `${item.capabilityId}: ${item.provider}`),
    ]),
    safetyBoundary: 'Provider Launch Training Pack prepares competitor-grade launch evidence and training queues. It does not log in, publish, acquire leads, redeem coupons, expose provider keys, store cookies, read private messages, pull raw POS rows, or claim real operating results before provider and merchant gates pass.',
  };
}

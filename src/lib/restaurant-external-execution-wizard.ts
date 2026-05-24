import { buildRestaurantAgentExecutionPackage, type RestaurantExecutionPackage } from '@/lib/restaurant-agent-execution-package';
import { buildRestaurantRuntimeProbe, type RestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';
import type { RestaurantGrantAction } from '@/lib/restaurant-agent-grant-manifest';
import type { RestaurantRuntimeTarget } from '@/lib/restaurant-agent-runtime-bridge';
import { buildRestaurantProviderSetupPack, type RestaurantProviderSetupPack } from '@/lib/restaurant-provider-setup-pack';

export type RestaurantExternalExecutionWizardStep = {
  id: string;
  title: string;
  status: 'ready' | 'blocked' | 'handoff';
  owner: 'runtime-admin' | 'merchant' | 'ops' | 'store-manager';
  detail: string;
  evidence: string[];
  nextAction: string;
};

export type RestaurantExternalExecutionWizard = {
  ok: true;
  payloadShape: 'restaurant-external-execution-wizard-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  target: RestaurantRuntimeTarget;
  requestedAction: RestaurantGrantAction;
  verdict: 'ready-to-forward' | 'setup-required' | 'manual-handoff';
  canForward: boolean;
  summary: {
    steps: number;
    readySteps: number;
    blockedSteps: number;
    handoffSteps: number;
    missingProviderGates: number;
    blockedCapabilities: number;
  };
  steps: RestaurantExternalExecutionWizardStep[];
  providerSetupPack: Pick<RestaurantProviderSetupPack, 'payloadShape' | 'summary' | 'envTemplate' | 'merchantRequests' | 'internalFallbacks' | 'copyForMerchant'>;
  runtimeProbe: RestaurantRuntimeProbe;
  executionPackage: Pick<RestaurantExecutionPackage, 'payloadShape' | 'packageId' | 'target' | 'status' | 'canForward' | 'blockedReasons' | 'nextStep' | 'runtimeContract' | 'executionPolicy' | 'audit'>;
  operatorScript: string[];
  safetyBoundary: string;
};

type EnvMap = Record<string, string | undefined>;

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function step(input: RestaurantExternalExecutionWizardStep): RestaurantExternalExecutionWizardStep {
  return input;
}

function targetProbe(probe: RestaurantRuntimeProbe, target: RestaurantRuntimeTarget) {
  return probe.targets.find(item => item.target === target);
}

function runtimeOwner(target: RestaurantRuntimeTarget): 'runtime-admin' {
  return target === 'lobu' || target === 'openclaw' || target === 'hermes' ? 'runtime-admin' : 'runtime-admin';
}

export async function buildRestaurantExternalExecutionWizard(input: {
  target?: RestaurantRuntimeTarget;
  requestedAction?: RestaurantGrantAction;
  restaurant?: string;
  offer?: string;
  owner?: string;
  env?: EnvMap;
  fetcher?: typeof fetch;
  now?: Date;
} = {}): Promise<RestaurantExternalExecutionWizard> {
  const env = input.env || process.env;
  const target = input.target || 'openclaw';
  const requestedAction = input.requestedAction || 'capture_public_receipt';
  const restaurant = clean(input.restaurant, '试用门店');
  const offer = clean(input.offer, '今日主推套餐');
  const providerSetupPack = buildRestaurantProviderSetupPack({
    restaurant,
    offer,
    env,
    now: input.now,
  });
  const runtimeProbe = await buildRestaurantRuntimeProbe({
    env,
    fetcher: input.fetcher,
    now: input.now,
  });
  const executionPackage = buildRestaurantAgentExecutionPackage({
    target,
    requestedAction,
    restaurant,
    offer,
    owner: input.owner,
    env,
    now: input.now,
  });
  const probeTarget = targetProbe(runtimeProbe, target);
  const coreProviderRequests = providerSetupPack.priorityRequests.filter(item => item.trackId !== 'staff-notification-provider');
  const coreMissingProviderGates = coreProviderRequests.filter(item => item.status === 'missing').length;
  const coreMerchantRequests = providerSetupPack.merchantRequests.filter(item => item.capability !== 'Staff notification delivery provider');
  const coreBlockedCapabilities = providerSetupPack.blockedCapabilities.filter(item => item.capability !== 'auto-staff-notification');
  const externalGateReady = coreMissingProviderGates === 0 && coreBlockedCapabilities.length === 0;
  const probeReady = probeTarget?.status === 'ready';

  const steps: RestaurantExternalExecutionWizardStep[] = [
    step({
      id: 'provider-setup',
      title: 'Provider gates',
      status: coreMissingProviderGates ? 'blocked' : 'ready',
      owner: 'runtime-admin',
      detail: coreMissingProviderGates
        ? `${coreMissingProviderGates} setup gates are missing before competitor-grade external execution.`
        : 'Provider setup gates are configured.',
      evidence: coreProviderRequests.filter(item => item.status === 'missing').slice(0, 6).map(item => item.envKey || item.evidence),
      nextAction: coreMissingProviderGates
        ? coreProviderRequests.find(item => item.status === 'missing')?.nextAction || 'Configure missing provider gates.'
        : 'Keep provider gates in runtime health checks.',
    }),
    step({
      id: 'merchant-grant',
      title: 'Merchant authorization',
      status: coreMerchantRequests.length ? 'blocked' : 'ready',
      owner: 'merchant',
      detail: coreMerchantRequests.length
        ? 'Merchant platform/POS authorization is still required before auto-publish, acquisition, redemption or true operating analysis.'
        : 'Merchant authorization requests are clear.',
      evidence: coreMerchantRequests.slice(0, 4).map(item => item.evidence),
      nextAction: coreMerchantRequests[0]?.ask || 'Keep merchant grant expiry and revocation owner visible.',
    }),
    step({
      id: 'runtime-probe',
      title: `${target} runtime health`,
      status: probeReady ? 'ready' : 'blocked',
      owner: runtimeOwner(target),
      detail: probeTarget ? `${target} probe is ${probeTarget.status}.` : `${target} probe target is missing.`,
      evidence: [
        probeTarget?.endpoint || 'missing',
        ...runtimeProbe.gates.filter(item => item.status === 'blocked').map(item => item.evidence),
      ],
      nextAction: probeTarget?.nextAction || 'Run runtime probe after configuring the target.',
    }),
    step({
      id: 'execution-package',
      title: 'Execution package',
      status: executionPackage.canForward ? 'ready' : executionPackage.status === 'handoff-only' ? 'handoff' : 'blocked',
      owner: 'ops',
      detail: `${executionPackage.payloadShape} is ${executionPackage.status}.`,
      evidence: executionPackage.executionPolicy.evidenceRequired,
      nextAction: executionPackage.nextStep,
    }),
    step({
      id: 'manual-fallback',
      title: 'Internal fallback',
      status: externalGateReady && executionPackage.canForward ? 'ready' : 'handoff',
      owner: 'store-manager',
      detail: providerSetupPack.internalFallbacks.slice(0, 2).map(item => `${item.capability}: ${item.canDoNow.slice(0, 2).join(', ')}`).join(' / ') || 'No fallback needed.',
      evidence: ['manual work order', 'public receipt or screenshot', 'sanitized aggregate data only'],
      nextAction: externalGateReady && executionPackage.canForward
        ? 'Forward externally, then require signed receipt callback before closing the run.'
        : 'Use internal work order, manual publish proof, POS sample validator and follow-up ledger until setup gates are ready.',
    }),
  ];

  const readySteps = steps.filter(item => item.status === 'ready').length;
  const blockedSteps = steps.filter(item => item.status === 'blocked').length;
  const handoffSteps = steps.filter(item => item.status === 'handoff').length;
  const verdict: RestaurantExternalExecutionWizard['verdict'] = executionPackage.canForward && probeReady
    ? 'ready-to-forward'
    : coreMissingProviderGates || blockedSteps
      ? 'setup-required'
      : 'manual-handoff';

  return {
    ok: true,
    payloadShape: 'restaurant-external-execution-wizard-v1',
    generatedAt: (input.now || new Date()).toISOString(),
    restaurant,
    offer,
    target,
    requestedAction,
    verdict,
    canForward: verdict === 'ready-to-forward',
    summary: {
      steps: steps.length,
      readySteps,
      blockedSteps,
      handoffSteps,
      missingProviderGates: coreMissingProviderGates,
      blockedCapabilities: coreBlockedCapabilities.length,
    },
    steps,
    providerSetupPack: {
      payloadShape: providerSetupPack.payloadShape,
      summary: providerSetupPack.summary,
      envTemplate: providerSetupPack.envTemplate,
      merchantRequests: providerSetupPack.merchantRequests,
      internalFallbacks: providerSetupPack.internalFallbacks,
      copyForMerchant: providerSetupPack.copyForMerchant,
    },
    runtimeProbe,
    executionPackage: {
      payloadShape: executionPackage.payloadShape,
      packageId: executionPackage.packageId,
      target: executionPackage.target,
      status: executionPackage.status,
      canForward: executionPackage.canForward,
      blockedReasons: executionPackage.blockedReasons,
      nextStep: executionPackage.nextStep,
      runtimeContract: executionPackage.runtimeContract,
      executionPolicy: executionPackage.executionPolicy,
      audit: executionPackage.audit,
    },
    operatorScript: [
      `${restaurant} / ${offer}: first resolve Provider Setup Pack gates, then rerun Runtime Probe.`,
      `Only forward ${requestedAction} to ${target} when the wizard verdict is ready-to-forward and the execution package canForward=true.`,
      'If any step is blocked, stay in manual handoff: drafts, public proof, signed/manual receipt, sanitized POS aggregate, and store-manager follow-up.',
    ],
    safetyBoundary: 'External Execution Wizard orchestrates setup, health, execution package and fallback only. It does not forward runs, log in, publish, read private messages, write redemption, expose API keys/cookies/tokens/browser profile values, or store raw POS/customer identifiers.',
  };
}

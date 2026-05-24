import { buildRestaurantActivationGates, type RestaurantActivationGateReport } from '@/lib/restaurant-agent-activation-gates';
import { buildRestaurantRuntimeSetupContract, type RestaurantRuntimeSetupContract, type RestaurantRuntimeSetupRequirement } from '@/lib/restaurant-agent-runtime-setup-contract';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantProviderSetupRequest = {
  id: string;
  trackId: string;
  trackName: string;
  owner: RestaurantRuntimeSetupRequirement['owner'];
  source: RestaurantRuntimeSetupRequirement['source'];
  label: string;
  status: 'ready' | 'missing';
  envKey?: string;
  evidence: string;
  unlocks: string[];
  missingImpact: string;
  nextAction: string;
  safetyBoundary: string;
};

export type RestaurantProviderSetupPack = {
  ok: true;
  payloadShape: 'restaurant-provider-setup-pack-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  summary: {
    requests: number;
    ready: number;
    missing: number;
    owners: string[];
    blockedCapabilities: number;
    readyForExternalExecution: boolean;
  };
  priorityRequests: RestaurantProviderSetupRequest[];
  envTemplate: Array<{
    key: string;
    value: '<configure-server-side>';
    owner: RestaurantRuntimeSetupRequirement['owner'];
    unlocks: string[];
  }>;
  merchantRequests: Array<{
    capability: string;
    ask: string;
    evidence: string;
    unlocks: string[];
  }>;
  internalFallbacks: Array<{
    capability: string;
    canDoNow: string[];
    stopLine: string;
  }>;
  blockedCapabilities: RestaurantRuntimeSetupContract['blockedCapabilities'];
  activationGates: Pick<RestaurantActivationGateReport, 'payloadShape' | 'summary' | 'answerToCustomer'>;
  copyForMerchant: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function extractEnvKey(evidence: string): string | undefined {
  const match = evidence.match(/^([A-Z0-9_]+)=/);
  return match?.[1];
}

function requestStatus(requirement: RestaurantRuntimeSetupRequirement): 'ready' | 'missing' {
  return requirement.configured ? 'ready' : 'missing';
}

function nextActionFor(requirement: RestaurantRuntimeSetupRequirement, trackName: string): string {
  if (requirement.configured) return `${trackName}: keep this gate in health checks before forwarding runs.`;
  if (requirement.source === 'env') return `Configure ${extractEnvKey(requirement.evidence) || requirement.label} on the server, then rerun Runtime Probe.`;
  if (requirement.source === 'merchant-authorization' || requirement.source === 'platform-account') return `Get merchant approval for ${requirement.label}, including allowed actions, expiry, and revocation owner.`;
  if (requirement.source === 'pos-contract') return `Collect the data mode, field dictionary, owner, export cadence, and no-PII sample for ${requirement.label}.`;
  return `Provide evidence for ${requirement.label}.`;
}

export function buildRestaurantProviderSetupPack(
  input: RestaurantTrialIntake & {
    env?: Record<string, string | undefined>;
    now?: Date;
  } = {},
): RestaurantProviderSetupPack {
  const restaurant = clean(input.restaurant, 'Trial restaurant');
  const offer = clean(input.offer, 'Today featured set meal');
  const setup = buildRestaurantRuntimeSetupContract({ env: input.env, now: input.now });
  const activationGates = buildRestaurantActivationGates({
    restaurant,
    env: input.env,
    now: input.now,
  });

  const allRequests = setup.tracks.flatMap(track => track.requirements.map(requirement => ({
    id: `${track.id}:${requirement.id}`,
    trackId: track.id,
    trackName: track.name,
    owner: requirement.owner,
    source: requirement.source,
    label: requirement.label,
    status: requestStatus(requirement),
    envKey: extractEnvKey(requirement.evidence),
    evidence: requirement.evidence,
    unlocks: requirement.unlocks,
    missingImpact: requirement.missingImpact,
    nextAction: nextActionFor(requirement, track.name),
    safetyBoundary: requirement.safetyBoundary,
  } satisfies RestaurantProviderSetupRequest)));

  const priorityRequests = allRequests
    .sort((left, right) => Number(left.status === 'ready') - Number(right.status === 'ready'))
    .slice(0, 14);
  const envTemplate = allRequests
    .filter(request => request.status === 'missing' && request.source === 'env' && request.envKey)
    .map(request => ({
      key: request.envKey!,
      value: '<configure-server-side>' as const,
      owner: request.owner,
      unlocks: request.unlocks,
    }));
  const merchantRequests = allRequests
    .filter(request => request.status === 'missing' && request.source !== 'env')
    .map(request => ({
      capability: request.trackName,
      ask: request.nextAction,
      evidence: request.evidence,
      unlocks: request.unlocks,
    }));

  const internalFallbacks = activationGates.gates
    .filter(gate => gate.status !== 'ready')
    .map(gate => ({
      capability: gate.name,
      canDoNow: gate.canDoInternallyNow,
      stopLine: gate.safetyBoundary,
    }));

  const missing = allRequests.filter(request => request.status === 'missing').length;
  const owners = Array.from(new Set(allRequests.filter(request => request.status === 'missing').map(request => request.owner)));

  return {
    ok: true,
    payloadShape: 'restaurant-provider-setup-pack-v1',
    generatedAt: (input.now || new Date()).toISOString(),
    restaurant,
    offer,
    summary: {
      requests: allRequests.length,
      ready: allRequests.length - missing,
      missing,
      owners,
      blockedCapabilities: setup.blockedCapabilities.length,
      readyForExternalExecution: setup.blockedCapabilities.length === 0 && missing === 0,
    },
    priorityRequests,
    envTemplate,
    merchantRequests,
    internalFallbacks,
    blockedCapabilities: setup.blockedCapabilities,
    activationGates: {
      payloadShape: activationGates.payloadShape,
      summary: activationGates.summary,
      answerToCustomer: activationGates.answerToCustomer,
    },
    copyForMerchant: [
      `${restaurant} / ${offer}: Wenai can run the internal work order, content plan, evidence checklist, POS sample validator, and follow-up ledger now.`,
      'Automatic publishing needs merchant platform authorization, an isolated browser runtime, callback secret, and operator approval for each publish run.',
      'Automatic acquisition and redemption need accepted public receipts plus aggregate lead/POS data; raw private messages, phone numbers, WeChat IDs, and order-level POS rows stay out of the system.',
    ],
    safetyBoundary: 'Provider Setup Pack lists missing gates and server-side env keys only. It does not expose secret values, cookies, browser profile paths, private-message raw text, POS rows, customer identifiers, or platform credentials.',
  };
}

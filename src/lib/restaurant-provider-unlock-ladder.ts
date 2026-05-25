import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import type { RestaurantProviderSetupStateSummary } from '@/lib/restaurant-provider-setup-state-store';

export type RestaurantProviderUnlockStage =
  | 'internal-ready'
  | 'setup-evidence-signed'
  | 'provider-health-ready'
  | 'external-blocked';

export type RestaurantProviderUnlockLadderItem = {
  id: 'persistent-browser' | 'auto-publish-proof' | 'auto-lead-capture' | 'coupon-redemption' | 'operating-analysis' | 'memory-follow-up';
  label: string;
  stage: RestaurantProviderUnlockStage;
  internalCanDo: string;
  setupEvidence: string[];
  providerEvidence: string[];
  stillNeeds: string[];
  nextAction: string;
};

export type RestaurantProviderUnlockLadder = {
  ok: true;
  payloadShape: 'restaurant-provider-unlock-ladder-v1';
  summary: {
    capabilities: number;
    providerHealthReady: number;
    setupEvidenceSigned: number;
    internalReady: number;
    externalBlocked: number;
    canClaimExternalAutomation: boolean;
  };
  items: RestaurantProviderUnlockLadderItem[];
  nextExternalAsks: string[];
  safetyBoundary: string;
};

function includesAny(values: string[], fragments: string[]) {
  const normalized = values.map(value => value.toLowerCase());
  return fragments.some(fragment => normalized.some(value => value.includes(fragment.toLowerCase())));
}

function evidenceForSetup(
  provided: RestaurantProviderSetupStateSummary['provided'],
  fragments: string[],
) {
  return [
    ...provided.envKeys.filter(value => includesAny([value], fragments)),
    ...provided.merchantApprovals.filter(value => includesAny([value], fragments)),
    ...provided.dataContracts.filter(value => includesAny([value], fragments)),
  ].slice(0, 6);
}

function healthEvidenceFor(
  health: RestaurantProviderReadinessHealth,
  fragments: string[],
) {
  return health.items
    .filter(item => item.status === 'health-ready' && (
      includesAny([item.id, item.label, item.category], fragments) ||
      includesAny(item.unlocks, fragments)
    ))
    .flatMap(item => item.configuredEvidence.length ? item.configuredEvidence : [item.label])
    .slice(0, 6);
}

function missingFor(
  health: RestaurantProviderReadinessHealth,
  fragments: string[],
) {
  return health.items
    .filter(item => item.status !== 'health-ready' && (
      includesAny([item.id, item.label, item.category], fragments) ||
      includesAny(item.unlocks, fragments)
    ))
    .flatMap(item => item.missingEvidence.length ? item.missingEvidence : [item.nextAction])
    .slice(0, 6);
}

function stageFor(input: {
  providerEvidence: string[];
  setupEvidence: string[];
  stillNeeds: string[];
}): RestaurantProviderUnlockStage {
  if (input.providerEvidence.length > 0 && input.stillNeeds.length === 0) return 'provider-health-ready';
  if (input.setupEvidence.length > 0) return 'setup-evidence-signed';
  if (input.stillNeeds.length > 0) return 'external-blocked';
  return 'internal-ready';
}

function item(input: {
  id: RestaurantProviderUnlockLadderItem['id'];
  label: string;
  fragments: string[];
  internalCanDo: string;
  setupState: RestaurantProviderSetupStateSummary;
  health: RestaurantProviderReadinessHealth;
  fallbackAsk: string;
}): RestaurantProviderUnlockLadderItem {
  const setupEvidence = evidenceForSetup(input.setupState.provided, input.fragments);
  const providerEvidence = healthEvidenceFor(input.health, input.fragments);
  const stillNeeds = missingFor(input.health, input.fragments);
  const stage = stageFor({ providerEvidence, setupEvidence, stillNeeds });
  return {
    id: input.id,
    label: input.label,
    stage,
    internalCanDo: input.internalCanDo,
    setupEvidence,
    providerEvidence,
    stillNeeds: stillNeeds.length ? stillNeeds : providerEvidence.length ? [] : [input.fallbackAsk],
    nextAction: stage === 'provider-health-ready'
      ? 'Pilot through governed execution package and signed receipt only.'
      : stage === 'setup-evidence-signed'
        ? 'Convert signed setup evidence into real server env, scoped provider auth and health probe.'
        : input.fallbackAsk,
  };
}

export function buildRestaurantProviderUnlockLadder(input: {
  setupState: RestaurantProviderSetupStateSummary;
  health: RestaurantProviderReadinessHealth;
}): RestaurantProviderUnlockLadder {
  const items = [
    item({
      id: 'persistent-browser',
      label: 'Persistent browser agent',
      fragments: ['openclaw', 'hermes', 'lobu', 'browser', 'runtime'],
      internalCanDo: 'Build governed task packages, recovery runbooks and proof requirements.',
      fallbackAsk: 'Provide OpenClaw/Hermes/Lobu URL and API key through server-side env.',
      setupState: input.setupState,
      health: input.health,
    }),
    item({
      id: 'auto-publish-proof',
      label: 'Auto publish and proof capture',
      fragments: ['merchant', 'platform', 'authorization', 'callback', 'proof', 'receipt'],
      internalCanDo: 'Prepare channel copy, staff checklist and proof ledger without claiming publication.',
      fallbackAsk: 'Provide scoped merchant platform authorization and signed proof callback.',
      setupState: input.setupState,
      health: input.health,
    }),
    item({
      id: 'auto-lead-capture',
      label: 'Auto lead capture',
      fragments: ['merchant', 'platform', 'authorization', 'staff', 'social'],
      internalCanDo: 'Classify imported inquiries, reservations and visit intent into manager tasks.',
      fallbackAsk: 'Provide platform inbox/lead export permission or approved manual import cadence.',
      setupState: input.setupState,
      health: input.health,
    }),
    item({
      id: 'coupon-redemption',
      label: 'Coupon redemption reconciliation',
      fragments: ['pos', 'coupon', 'redemption', 'operating-data'],
      internalCanDo: 'Accept no-PII aggregate imports and reconcile claimed vs redeemed counts.',
      fallbackAsk: 'Provide POS/coupon field dictionary, export cadence and no-PII sample shape.',
      setupState: input.setupState,
      health: input.health,
    }),
    item({
      id: 'operating-analysis',
      label: 'True operating analysis',
      fragments: ['pos', 'operating', 'data', 'analysis'],
      internalCanDo: 'Separate directional observations from measured store operation signals.',
      fallbackAsk: 'Provide aggregate sales, redemption, table/order and campaign source fields.',
      setupState: input.setupState,
      health: input.health,
    }),
    item({
      id: 'memory-follow-up',
      label: 'Memory follow-up loop',
      fragments: ['hermes', 'memory', 'follow-up', 'staff'],
      internalCanDo: 'Keep sanitized tasks, wakeups, next actions and owner handoff history.',
      fallbackAsk: 'Provide persistent runtime and staff delivery channel before autonomous follow-up.',
      setupState: input.setupState,
      health: input.health,
    }),
  ];
  const count = (stage: RestaurantProviderUnlockStage) => items.filter(item => item.stage === stage).length;
  return {
    ok: true,
    payloadShape: 'restaurant-provider-unlock-ladder-v1',
    summary: {
      capabilities: items.length,
      providerHealthReady: count('provider-health-ready'),
      setupEvidenceSigned: count('setup-evidence-signed'),
      internalReady: count('internal-ready'),
      externalBlocked: count('external-blocked'),
      canClaimExternalAutomation: input.health.summary.canEnableExternalAutomation && items.every(item => item.stage === 'provider-health-ready'),
    },
    items,
    nextExternalAsks: Array.from(new Set(items.flatMap(item => item.stillNeeds))).slice(0, 8),
    safetyBoundary: 'Unlock Ladder distinguishes internal readiness, signed setup evidence and live provider health. It never treats remembered evidence as real automation, and never exposes secrets, cookies, raw profiles, private messages, customer identifiers, coupon codes or POS rows.',
  };
}

import type { RestaurantActivationGate, RestaurantActivationGateReport } from '@/lib/restaurant-agent-activation-gates';
import { buildRestaurantActivationGates } from '@/lib/restaurant-agent-activation-gates';
import { buildRestaurantAgentCapabilityPlan, type RestaurantCompetitorCapability } from '@/lib/restaurant-agent-capabilities';
import { buildRestaurantCapabilityTrainingPlanFromLedger, type RestaurantCapabilityTrainingItem, type RestaurantCapabilityTrainingPlan } from '@/lib/restaurant-capability-training';
import type { RestaurantProviderSetupPack } from '@/lib/restaurant-provider-setup-pack';
import { buildRestaurantProviderSetupPack } from '@/lib/restaurant-provider-setup-pack';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantActivationCockpitLaneStatus =
  | 'usable-now'
  | 'trainable-now'
  | 'provider-gated'
  | 'forbidden';

export type RestaurantActivationCockpitLane = {
  id: string;
  title: string;
  competitorEquivalent: string;
  status: RestaurantActivationCockpitLaneStatus;
  customerOutcome: string;
  internalCanRunNow: string[];
  trainingNeeded: string[];
  externalRequired: string[];
  providerKeysNeeded: string[];
  acceptance: string;
  nextAction: string;
  evidenceRequired: string[];
  safetyBoundary: string;
};

export type RestaurantActivationCockpit = {
  ok: true;
  payloadShape: 'restaurant-activation-cockpit-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  summary: {
    lanes: number;
    usableNow: number;
    trainableNow: number;
    providerGated: number;
    forbidden: number;
    providerKeysNeeded: number;
    externalRequests: number;
  };
  lanes: RestaurantActivationCockpitLane[];
  nextInternalTraining: RestaurantCapabilityTrainingPlan['nextInternalTraining'];
  externalSetupRequests: RestaurantCapabilityTrainingPlan['externalSetupRequests'];
  providerSetup: Pick<RestaurantProviderSetupPack, 'payloadShape' | 'summary' | 'priorityRequests'>;
  activationGates: Pick<RestaurantActivationGateReport, 'payloadShape' | 'summary' | 'audit' | 'answerToCustomer'>;
  answerForCustomer: string;
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function findGate(gates: RestaurantActivationGate[], id: RestaurantActivationGate['id']) {
  return gates.find(item => item.id === id);
}

function findTraining(items: RestaurantCapabilityTrainingItem[], id: string) {
  return items.find(item => item.id === id);
}

function providerKeysFor(providerSetup: RestaurantProviderSetupPack, trackIds: string[]) {
  return providerSetup.priorityRequests
    .filter(item => item.status === 'missing' && item.envKey && trackIds.includes(item.trackId))
    .map(item => item.envKey!)
    .filter((item, index, list) => list.indexOf(item) === index);
}

function externalFor(providerSetup: RestaurantProviderSetupPack, trackIds: string[]) {
  return providerSetup.priorityRequests
    .filter(item => item.status === 'missing' && trackIds.includes(item.trackId))
    .map(item => item.nextAction)
    .filter((item, index, list) => list.indexOf(item) === index)
    .slice(0, 6);
}

function capabilityEvidence(capabilities: RestaurantCompetitorCapability[], ids: string[]) {
  return capabilities
    .filter(item => ids.includes(item.id))
    .map(item => item.internalImplementation)
    .slice(0, 4);
}

function laneStatus(input: {
  forbidden?: boolean;
  gates: Array<RestaurantActivationGate | undefined>;
  training?: RestaurantCapabilityTrainingItem;
  externalRequired: string[];
  providerKeysNeeded: string[];
}): RestaurantActivationCockpitLaneStatus {
  if (input.forbidden) return 'forbidden';
  if (input.gates.some(gate => gate?.status === 'blocked') || input.externalRequired.length > 0 || input.providerKeysNeeded.length > 0) {
    return 'provider-gated';
  }
  if (input.training?.status === 'trainable-now') return 'trainable-now';
  return 'usable-now';
}

function nextActionFor(input: {
  status: RestaurantActivationCockpitLaneStatus;
  training?: RestaurantCapabilityTrainingItem;
  externalRequired: string[];
  acceptance: string;
}) {
  if (input.status === 'forbidden') return 'Keep this permanently blocked; accept only aggregate or de-identified summaries.';
  if (input.training?.status === 'trainable-now') return input.training.nextAction;
  if (input.externalRequired.length > 0) return input.externalRequired[0];
  return input.acceptance;
}

export function buildRestaurantActivationCockpit(input: RestaurantTrialIntake & {
  env?: Record<string, string | undefined>;
  now?: Date;
} = {}): RestaurantActivationCockpit {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, 'Trial restaurant');
  const offer = clean(input.offer, 'Today featured set meal');
  const activationGates = buildRestaurantActivationGates({ restaurant, env: input.env, now });
  const providerSetup = buildRestaurantProviderSetupPack({ restaurant, offer, env: input.env, now });
  const trainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger();
  const capabilityPlan = buildRestaurantAgentCapabilityPlan();

  const publishGate = findGate(activationGates.gates, 'auto-publish');
  const acquisitionGate = findGate(activationGates.gates, 'auto-acquisition');
  const redemptionGate = findGate(activationGates.gates, 'auto-redemption');
  const analysisGate = findGate(activationGates.gates, 'operating-analysis');
  const privateMessageGate = findGate(activationGates.gates, 'private-message-reading');

  const lanes: RestaurantActivationCockpitLane[] = [
    {
      id: 'publish-and-proof',
      title: 'Auto publish and proof capture',
      competitorEquivalent: 'Shaozi Cloud / OpenClaw style browser execution',
      customerOutcome: 'Approved restaurant content can become a governed publish package, then return public links, screenshots, run ids and blocker reasons.',
      internalCanRunNow: [
        ...(publishGate?.canDoInternallyNow || []),
        ...capabilityEvidence(capabilityPlan.capabilities, ['browser-runbook-package', 'browser-runner-callback-contract', 'browser-runner-event-ledger']),
      ],
      trainingNeeded: findTraining(trainingPlan.items, 'auto-publish-receipts')?.missingTrainingMaterials.slice(0, 5) || [],
      externalRequired: [
        ...(publishGate?.mustHaveExternal || []),
        ...externalFor(providerSetup, ['openclaw-browser', 'hermes-browser', 'merchant-platform-auth']),
      ].slice(0, 8),
      providerKeysNeeded: providerKeysFor(providerSetup, ['openclaw-browser', 'hermes-browser']),
      acceptance: 'A publish lane is complete only when the callback stores externalRunId, posted link or screenshot id, score, owner and blocker state.',
      evidenceRequired: publishGate?.evidenceRequired || [],
      status: 'provider-gated',
      nextAction: '',
      safetyBoundary: publishGate?.safetyBoundary || 'No auto-publish without merchant approval, runtime and signed receipt.',
    },
    {
      id: 'lead-and-community-followup',
      title: 'Auto acquisition and store follow-up',
      competitorEquivalent: 'Restaurant SaaS lead loop plus AI employee follow-up',
      customerOutcome: 'Reservations, coupon claims, inquiries and visit intent become owner-routed follow-up tasks without storing private customer identities.',
      internalCanRunNow: [
        ...(acquisitionGate?.canDoInternallyNow || []),
        ...capabilityEvidence(capabilityPlan.capabilities, ['business-signal-loop', 'watcher-policy-orchestrator', 'agent-ops-console']),
      ],
      trainingNeeded: findTraining(trainingPlan.items, 'auto-acquisition-followup')?.missingTrainingMaterials.slice(0, 5) || [],
      externalRequired: [
        ...(acquisitionGate?.mustHaveExternal || []),
        ...externalFor(providerSetup, ['merchant-platform-auth', 'staff-notification-provider']),
      ].slice(0, 8),
      providerKeysNeeded: providerKeysFor(providerSetup, ['staff-notification-provider']),
      acceptance: 'A lead lane is complete only when aggregate counts, channel, time window, owner and next action are attached to an accepted receipt.',
      evidenceRequired: acquisitionGate?.evidenceRequired || [],
      status: 'provider-gated',
      nextAction: '',
      safetyBoundary: acquisitionGate?.safetyBoundary || 'No private-message raw text or customer identifiers enter the system.',
    },
    {
      id: 'redemption-and-operating-analysis',
      title: 'Redemption and true operating analysis',
      competitorEquivalent: 'Restaurant SaaS POS, coupon and finance contract',
      customerOutcome: 'Coupon claims, redemptions, item sales, stock and margin signals can support a next operating action only after source fields are validated.',
      internalCanRunNow: [
        ...(redemptionGate?.canDoInternallyNow || []),
        ...(analysisGate?.canDoInternallyNow || []),
        ...capabilityEvidence(capabilityPlan.capabilities, ['pos-import-schema-validator', 'business-signal-loop']),
      ],
      trainingNeeded: findTraining(trainingPlan.items, 'redemption-operating-analytics')?.missingTrainingMaterials.slice(0, 5) || [],
      externalRequired: [
        ...(redemptionGate?.mustHaveExternal || []),
        ...(analysisGate?.mustHaveExternal || []),
        ...externalFor(providerSetup, ['pos-redemption-contract']),
      ].slice(0, 8),
      providerKeysNeeded: providerKeysFor(providerSetup, ['pos-redemption-contract']),
      acceptance: 'No source field, no attribution. A completed lane has data mode, field dictionary, import batch id, aggregate counts and owner.',
      evidenceRequired: Array.from(new Set([...(redemptionGate?.evidenceRequired || []), ...(analysisGate?.evidenceRequired || [])])),
      status: 'provider-gated',
      nextAction: '',
      safetyBoundary: analysisGate?.safetyBoundary || 'No fake growth numbers, no row-level POS data and no customer identifiers.',
    },
    {
      id: 'resident-agent-runtime',
      title: 'Resident browser agent runtime',
      competitorEquivalent: 'Lobu / OpenClaw / Hermes always-on agent runtime',
      customerOutcome: 'The product can show which runtime, browser profile, callback and session health gates make an AI employee executable rather than just chatty.',
      internalCanRunNow: capabilityEvidence(capabilityPlan.capabilities, [
        'tenant-event-gateway',
        'persistent-browser-session-registry',
        'runtime-setup-contract',
        'deterministic-tool-policy-evaluator',
      ]),
      trainingNeeded: findTraining(trainingPlan.items, 'layered-memory-evolution')?.missingTrainingMaterials.slice(0, 5) || [],
      externalRequired: externalFor(providerSetup, ['lobu-gateway', 'openclaw-browser', 'hermes-browser']),
      providerKeysNeeded: providerKeysFor(providerSetup, ['lobu-gateway', 'openclaw-browser', 'hermes-browser']),
      acceptance: 'A runtime lane is complete when every external step has a sanitized event, callback verification, retry policy and recovery owner.',
      evidenceRequired: ['runtime health probe', 'browser session id', 'callback signature', 'tool policy verdict'],
      status: 'provider-gated',
      nextAction: '',
      safetyBoundary: 'The resident agent never receives raw API keys, cookies, verification codes, private messages, POS rows or customer identifiers.',
    },
    {
      id: 'private-message-reading',
      title: 'Private message reading',
      competitorEquivalent: 'Explicit non-goal even if a competitor appears to imply it',
      customerOutcome: 'The product refuses raw private chats and only accepts merchant-approved summaries or aggregate counts.',
      internalCanRunNow: privateMessageGate?.canDoInternallyNow || [],
      trainingNeeded: [],
      externalRequired: [],
      providerKeysNeeded: [],
      acceptance: 'Keep raw private messages, phone numbers, WeChat ids and customer names outside the system.',
      evidenceRequired: privateMessageGate?.evidenceRequired || [],
      status: 'forbidden',
      nextAction: '',
      safetyBoundary: privateMessageGate?.safetyBoundary || 'Raw private-message reading remains forbidden.',
    },
  ].map(lane => {
    const training = lane.id === 'publish-and-proof'
      ? findTraining(trainingPlan.items, 'auto-publish-receipts')
      : lane.id === 'lead-and-community-followup'
        ? findTraining(trainingPlan.items, 'auto-acquisition-followup')
        : lane.id === 'redemption-and-operating-analysis'
          ? findTraining(trainingPlan.items, 'redemption-operating-analytics')
          : lane.id === 'resident-agent-runtime'
            ? findTraining(trainingPlan.items, 'layered-memory-evolution')
            : undefined;
    const gates = lane.id === 'publish-and-proof'
      ? [publishGate]
      : lane.id === 'lead-and-community-followup'
        ? [acquisitionGate]
        : lane.id === 'redemption-and-operating-analysis'
          ? [redemptionGate, analysisGate]
          : lane.id === 'private-message-reading'
            ? [privateMessageGate]
            : [];
    const status = laneStatus({
      forbidden: lane.id === 'private-message-reading',
      gates,
      training,
      externalRequired: lane.externalRequired,
      providerKeysNeeded: lane.providerKeysNeeded,
    });
    return {
      ...lane,
      status,
      nextAction: nextActionFor({
        status,
        training,
        externalRequired: lane.externalRequired,
        acceptance: lane.acceptance,
      }),
    };
  });

  const providerKeysNeeded = Array.from(new Set(lanes.flatMap(item => item.providerKeysNeeded)));
  const externalRequests = Array.from(new Set(lanes.flatMap(item => item.externalRequired)));

  return {
    ok: true,
    payloadShape: 'restaurant-activation-cockpit-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    summary: {
      lanes: lanes.length,
      usableNow: lanes.filter(item => item.status === 'usable-now').length,
      trainableNow: lanes.filter(item => item.status === 'trainable-now').length,
      providerGated: lanes.filter(item => item.status === 'provider-gated').length,
      forbidden: lanes.filter(item => item.status === 'forbidden').length,
      providerKeysNeeded: providerKeysNeeded.length,
      externalRequests: externalRequests.length,
    },
    lanes,
    nextInternalTraining: trainingPlan.nextInternalTraining,
    externalSetupRequests: trainingPlan.externalSetupRequests,
    providerSetup: {
      payloadShape: providerSetup.payloadShape,
      summary: providerSetup.summary,
      priorityRequests: providerSetup.priorityRequests.slice(0, 8),
    },
    activationGates: {
      payloadShape: activationGates.payloadShape,
      summary: activationGates.summary,
      audit: activationGates.audit,
      answerToCustomer: activationGates.answerToCustomer,
    },
    answerForCustomer: providerKeysNeeded.length > 0
      ? `Internal cockpit is ready for ${restaurant} / ${offer}; external execution still needs ${providerKeysNeeded.slice(0, 4).join(', ')} plus merchant authorization and data contracts.`
      : `Internal cockpit is ready for ${restaurant} / ${offer}; run governed proof capture before claiming automation.`,
    safetyBoundary: 'Activation Cockpit separates internal capability, training gaps and external provider gates. It does not copy competitor branding, expose secrets, log in, publish, redeem coupons, read private messages, pull POS rows or claim growth without accepted evidence.',
  };
}

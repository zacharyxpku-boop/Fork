import type { RestaurantCapabilityTrainingItem, RestaurantCapabilityTrainingPlan, RestaurantCapabilityTrainingRecord } from '@/lib/restaurant-capability-training';
import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import type { RestaurantShiftCloseoutTrainingRecordAttempt } from '@/lib/restaurant-shift-closeout-training-pack';

export type RestaurantShiftCapabilityActivation = {
  capabilityId: string;
  capability: string;
  competitorPattern: RestaurantCapabilityTrainingItem['competitorPattern'];
  status: 'activated-internal' | 'trained-needs-provider' | 'needs-training' | 'provider-blocked';
  acceptedRecords: number;
  materialGaps: string[];
  providerGaps: string[];
  providerEvidence: string[];
  nextAction: string;
};

export type RestaurantShiftCapabilityActivationPack = {
  ok: true;
  payloadShape: 'restaurant-shift-capability-activation-pack-v1';
  generatedAt: string;
  verdict: 'internal-capabilities-active' | 'provider-gated' | 'needs-training';
  summary: {
    capabilities: number;
    activatedInternal: number;
    trainedNeedsProvider: number;
    needsTraining: number;
    providerBlocked: number;
    acceptedTrainingRecords: number;
    canClaimExternalAutomation: false;
  };
  activations: RestaurantShiftCapabilityActivation[];
  latestRecordAttempt?: Pick<RestaurantShiftCloseoutTrainingRecordAttempt, 'payloadShape' | 'verdict' | 'summary' | 'nextAction' | 'safetyBoundary'>;
  trainingPlan: Pick<RestaurantCapabilityTrainingPlan, 'payloadShape' | 'summary' | 'nextInternalTraining' | 'externalSetupRequests' | 'safetyBoundary'>;
  providerReadinessHealth?: Pick<RestaurantProviderReadinessHealth, 'payloadShape' | 'summary' | 'items' | 'externalRequired' | 'safetyBoundary'>;
  internalRunbook: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

function recordsForCapability(records: RestaurantCapabilityTrainingRecord[], capabilityId: string) {
  return records.filter(record => record.accepted && record.capabilityId === capabilityId);
}

function providerEvidenceFor(health: RestaurantProviderReadinessHealth | undefined, item: RestaurantCapabilityTrainingItem) {
  if (!health) return [];
  const text = `${item.id} ${item.capability} ${item.externalProviders.join(' ')}`.toLowerCase();
  return health.items
    .filter(healthItem => {
      if (text.includes('pos') || text.includes('核销') || text.includes('经营')) return healthItem.category === 'operating-data' || healthItem.category === 'merchant-auth';
      if (text.includes('publish') || text.includes('发布') || text.includes('browser') || text.includes('runner')) return healthItem.category === 'runtime' || healthItem.category === 'callback' || healthItem.category === 'merchant-auth';
      if (text.includes('follow') || text.includes('获客') || text.includes('社群')) return healthItem.category === 'merchant-auth' || healthItem.category === 'callback';
      return healthItem.status === 'health-ready';
    })
    .flatMap(healthItem => [`${healthItem.id}:${healthItem.status}`, ...healthItem.configuredEvidence.slice(0, 2)])
    .slice(0, 6);
}

function activationStatus(input: {
  item: RestaurantCapabilityTrainingItem;
  acceptedRecords: number;
  providerEvidence: string[];
}): RestaurantShiftCapabilityActivation['status'] {
  if (input.acceptedRecords <= 0 && input.item.missingTrainingMaterials.length > 0) return 'needs-training';
  if (input.item.missingExternalProviders.length > 0 && input.providerEvidence.length === 0) {
    return input.acceptedRecords > 0 ? 'trained-needs-provider' : 'provider-blocked';
  }
  return input.acceptedRecords > 0 || input.item.status === 'activation-ready' ? 'activated-internal' : 'needs-training';
}

function nextAction(input: {
  item: RestaurantCapabilityTrainingItem;
  status: RestaurantShiftCapabilityActivation['status'];
  acceptedRecords: number;
}) {
  if (input.status === 'activated-internal') {
    return `Use ${input.acceptedRecords || 1} accepted training record(s) in the next controlled shift loop.`;
  }
  if (input.status === 'trained-needs-provider') {
    return `Internal samples exist; unlock provider gate: ${input.item.missingExternalProviders.slice(0, 2).join(' / ') || input.item.nextAction}.`;
  }
  if (input.status === 'provider-blocked') {
    return `Provider or merchant gate is missing before this can run: ${input.item.missingExternalProviders.slice(0, 2).join(' / ') || input.item.nextAction}.`;
  }
  return `Record accepted proof or sanitized aggregate training for ${input.item.id}.`;
}

export function buildRestaurantShiftCapabilityActivationPack(input: {
  capabilityTrainingPlan: RestaurantCapabilityTrainingPlan;
  trainingRecords: RestaurantCapabilityTrainingRecord[];
  providerReadinessHealth?: RestaurantProviderReadinessHealth;
  latestRecordAttempt?: RestaurantShiftCloseoutTrainingRecordAttempt;
  now?: Date;
}): RestaurantShiftCapabilityActivationPack {
  const now = input.now || new Date();
  const acceptedRecords = input.trainingRecords.filter(record => record.accepted);
  const activations = input.capabilityTrainingPlan.items.map(item => {
    const records = recordsForCapability(input.trainingRecords, item.id);
    const providerEvidence = providerEvidenceFor(input.providerReadinessHealth, item);
    const status = activationStatus({
      item,
      acceptedRecords: records.length,
      providerEvidence,
    });
    return {
      capabilityId: item.id,
      capability: item.capability,
      competitorPattern: item.competitorPattern,
      status,
      acceptedRecords: records.length,
      materialGaps: item.missingTrainingMaterials.slice(0, 5),
      providerGaps: item.missingExternalProviders.slice(0, 5),
      providerEvidence,
      nextAction: nextAction({ item, status, acceptedRecords: records.length }),
    } satisfies RestaurantShiftCapabilityActivation;
  });
  const activatedInternal = activations.filter(item => item.status === 'activated-internal').length;
  const trainedNeedsProvider = activations.filter(item => item.status === 'trained-needs-provider').length;
  const needsTraining = activations.filter(item => item.status === 'needs-training').length;
  const providerBlocked = activations.filter(item => item.status === 'provider-blocked').length;
  const verdict: RestaurantShiftCapabilityActivationPack['verdict'] = activatedInternal > 0
    ? 'internal-capabilities-active'
    : trainedNeedsProvider > 0 || providerBlocked > 0
      ? 'provider-gated'
      : 'needs-training';

  return {
    ok: true,
    payloadShape: 'restaurant-shift-capability-activation-pack-v1',
    generatedAt: now.toISOString(),
    verdict,
    summary: {
      capabilities: activations.length,
      activatedInternal,
      trainedNeedsProvider,
      needsTraining,
      providerBlocked,
      acceptedTrainingRecords: acceptedRecords.length,
      canClaimExternalAutomation: false,
    },
    activations,
    latestRecordAttempt: input.latestRecordAttempt ? {
      payloadShape: input.latestRecordAttempt.payloadShape,
      verdict: input.latestRecordAttempt.verdict,
      summary: input.latestRecordAttempt.summary,
      nextAction: input.latestRecordAttempt.nextAction,
      safetyBoundary: input.latestRecordAttempt.safetyBoundary,
    } : undefined,
    trainingPlan: {
      payloadShape: input.capabilityTrainingPlan.payloadShape,
      summary: input.capabilityTrainingPlan.summary,
      nextInternalTraining: input.capabilityTrainingPlan.nextInternalTraining,
      externalSetupRequests: input.capabilityTrainingPlan.externalSetupRequests,
      safetyBoundary: input.capabilityTrainingPlan.safetyBoundary,
    },
    providerReadinessHealth: input.providerReadinessHealth ? {
      payloadShape: input.providerReadinessHealth.payloadShape,
      summary: input.providerReadinessHealth.summary,
      items: input.providerReadinessHealth.items,
      externalRequired: input.providerReadinessHealth.externalRequired,
      safetyBoundary: input.providerReadinessHealth.safetyBoundary,
    } : undefined,
    internalRunbook: [
      'Use activated-internal capabilities only for local planning, proof review, next-loop SOPs and manager tasks.',
      'Use trained-needs-provider capabilities to prepare runtime/provider asks, not to claim automation.',
      'Rebuild this pack after each accepted receipt, POS aggregate import or provider setup update.',
      'Do not expose secrets or private customer data in activation evidence.',
    ],
    externalRequired: Array.from(new Set([
      ...activations.filter(item => item.status !== 'activated-internal').flatMap(item => [...item.materialGaps.slice(0, 2), ...item.providerGaps.slice(0, 2), item.nextAction]),
      ...(input.providerReadinessHealth?.externalRequired || []),
    ])).filter(Boolean).slice(0, 16),
    safetyBoundary: 'Shift Capability Activation Pack translates accepted training records into internal capability status. It does not auto-publish, auto-acquire leads, auto-redeem coupons, expose provider keys, read private messages, store raw POS rows, or claim external automation without provider and merchant proof.',
  };
}

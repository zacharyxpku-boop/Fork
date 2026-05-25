import { buildRestaurantCompetitorAuditReport, type RestaurantCompetitorAuditReport } from '@/lib/restaurant-agent-competitor-audit';
import { buildRestaurantCapabilityTrainingPlanFromLedger, type RestaurantCapabilityTrainingPlan } from '@/lib/restaurant-capability-training';
import { buildRestaurantResidentAgentMissionControl, type RestaurantResidentAgentMissionControl } from '@/lib/restaurant-resident-agent-mission-control';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
import type { RestaurantBrowserRunnerEventRecord } from '@/lib/restaurant-agent-browser-runner-event-store';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantCompetitorTrainingBlueprintLane = {
  id: string;
  title: string;
  targetState: string;
  currentStatus: 'internal-ready' | 'bridge-ready' | 'external-required';
  trainableNow: string[];
  acceptanceEvidence: string[];
  providerRequired: string[];
  owner: 'ops' | 'runtime-admin' | 'store-manager' | 'merchant';
  nextAction: string;
};

export type RestaurantCompetitorTrainingBlueprint = {
  ok: true;
  payloadShape: 'restaurant-competitor-training-blueprint-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'train-internal-first' | 'provider-contract-needed' | 'activation-review-ready';
  summary: {
    dimensions: number;
    internalReady: number;
    bridgeReady: number;
    externalRequired: number;
    trainableNow: number;
    providerContracts: number;
    acceptanceGates: number;
    canClaimCompetitorParity: false;
  };
  lanes: RestaurantCompetitorTrainingBlueprintLane[];
  internalTrainingBacklog: Array<{
    capabilityId: string;
    material: string;
    owner: string;
    reason: string;
  }>;
  providerContractBacklog: Array<{
    capabilityId: string;
    provider: string;
    owner: string;
    unlocks: string;
  }>;
  missionControl: Pick<RestaurantResidentAgentMissionControl, 'payloadShape' | 'mode' | 'summary' | 'primaryAction' | 'safetyBoundary'>;
  sourceAudit: Pick<RestaurantCompetitorAuditReport, 'payloadShape' | 'summary' | 'nextBuildOrder' | 'audit' | 'safetyBoundary'>;
  trainingPlan: Pick<RestaurantCapabilityTrainingPlan, 'payloadShape' | 'summary' | 'nextInternalTraining' | 'externalSetupRequests' | 'safetyBoundary'>;
  externalRequired: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function unique(values: string[], limit = 14): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function evidenceFor(dimensionId: string): string[] {
  if (dimensionId.includes('browser')) return ['browser gateway pack', 'runner event ledger', 'signed callback or screenshot/public proof'];
  if (dimensionId.includes('receipt')) return ['accepted receipt', 'evidence score', 'recovery action when rejected'];
  if (dimensionId.includes('memory') || dimensionId.includes('watcher')) return ['heartbeat followup', 'memory suggestion', 'owner next action'];
  if (dimensionId.includes('platform') || dimensionId.includes('data')) return ['merchant authorization', 'sanitized POS/data contract', 'accepted aggregate import'];
  return ['command center primary action', 'owner', 'evidence required'];
}

function ownerFor(status: RestaurantCompetitorTrainingBlueprintLane['currentStatus'], externalRequired: string): RestaurantCompetitorTrainingBlueprintLane['owner'] {
  if (status === 'external-required' && /merchant|授权|商家|POS|OAuth/i.test(externalRequired)) return 'merchant';
  if (status === 'external-required' || status === 'bridge-ready') return 'runtime-admin';
  return 'ops';
}

function verdictFor(input: {
  providerContracts: number;
  trainableNow: number;
  externalRequired: number;
}): RestaurantCompetitorTrainingBlueprint['verdict'] {
  if (input.externalRequired || input.providerContracts) return 'provider-contract-needed';
  if (input.trainableNow) return 'train-internal-first';
  return 'activation-review-ready';
}

export async function buildRestaurantCompetitorTrainingBlueprint(input: RestaurantTrialIntake & {
  runs?: RestaurantAgentRunRecord[];
  receipts?: RestaurantAgentReceiptRecord[];
  runnerEvents?: RestaurantBrowserRunnerEventRecord[];
  now?: Date;
} = {}): Promise<RestaurantCompetitorTrainingBlueprint> {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, '试用门店');
  const offer = clean(input.offer, '今日主推套餐');
  const sourceAudit = buildRestaurantCompetitorAuditReport();
  const trainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger();
  const missionControl = await buildRestaurantResidentAgentMissionControl({
    ...input,
    restaurant,
    offer,
    now,
  });

  const lanes = sourceAudit.dimensions.map(dimension => {
    const relatedTraining = trainingPlan.items.filter(item => {
      const text = `${dimension.id} ${dimension.name} ${dimension.targetState} ${dimension.internalNext}`.toLowerCase();
      return text.includes(item.id.split('-')[0]) || text.includes(item.competitorPattern.toLowerCase().split('/')[0]);
    });
    const trainableNow = relatedTraining.flatMap(item => item.missingTrainingMaterials.slice(0, 2));
    const providerRequired = unique([
      dimension.externalRequired,
      ...relatedTraining.flatMap(item => item.missingExternalProviders.slice(0, 2)),
    ], 6);

    return {
      id: dimension.id,
      title: dimension.name,
      targetState: dimension.targetState,
      currentStatus: dimension.status,
      trainableNow,
      acceptanceEvidence: evidenceFor(dimension.id),
      providerRequired,
      owner: ownerFor(dimension.status, dimension.externalRequired),
      nextAction: dimension.status === 'internal-ready'
        ? `Record acceptance evidence: ${evidenceFor(dimension.id).join(' / ')}.`
        : dimension.status === 'bridge-ready'
          ? `Train internal materials, then attach provider contract: ${providerRequired[0] || dimension.externalRequired}.`
          : `External setup required before parity claim: ${dimension.externalRequired}.`,
    } satisfies RestaurantCompetitorTrainingBlueprintLane;
  });

  const internalTrainingBacklog = trainingPlan.nextInternalTraining.map(item => ({
    ...item,
    reason: `Needed before ${trainingPlan.items.find(candidate => candidate.id === item.capabilityId)?.capability || item.capabilityId} can be activated.`,
  }));
  const providerContractBacklog = trainingPlan.externalSetupRequests.map(item => ({
    ...item,
    unlocks: trainingPlan.items.find(candidate => candidate.id === item.capabilityId)?.capability || item.capabilityId,
  }));
  const externalRequired = unique([
    ...lanes.flatMap(lane => lane.providerRequired),
    ...missionControl.externalRequired,
  ]);

  return {
    ok: true,
    payloadShape: 'restaurant-competitor-training-blueprint-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    verdict: verdictFor({
      providerContracts: providerContractBacklog.length,
      trainableNow: internalTrainingBacklog.length,
      externalRequired: sourceAudit.summary.externalRequired,
    }),
    summary: {
      dimensions: lanes.length,
      internalReady: sourceAudit.summary.internalReady,
      bridgeReady: sourceAudit.summary.bridgeReady,
      externalRequired: sourceAudit.summary.externalRequired,
      trainableNow: internalTrainingBacklog.length,
      providerContracts: providerContractBacklog.length,
      acceptanceGates: lanes.reduce((sum, lane) => sum + lane.acceptanceEvidence.length, 0),
      canClaimCompetitorParity: false,
    },
    lanes,
    internalTrainingBacklog,
    providerContractBacklog,
    missionControl: {
      payloadShape: missionControl.payloadShape,
      mode: missionControl.mode,
      summary: missionControl.summary,
      primaryAction: missionControl.primaryAction,
      safetyBoundary: missionControl.safetyBoundary,
    },
    sourceAudit: {
      payloadShape: sourceAudit.payloadShape,
      summary: sourceAudit.summary,
      nextBuildOrder: sourceAudit.nextBuildOrder,
      audit: sourceAudit.audit,
      safetyBoundary: sourceAudit.safetyBoundary,
    },
    trainingPlan: {
      payloadShape: trainingPlan.payloadShape,
      summary: trainingPlan.summary,
      nextInternalTraining: trainingPlan.nextInternalTraining,
      externalSetupRequests: trainingPlan.externalSetupRequests,
      safetyBoundary: trainingPlan.safetyBoundary,
    },
    externalRequired,
    safetyBoundary: 'Competitor Training Blueprint turns parity into trainable internal materials, acceptance evidence and provider contracts. It does not claim full Claw/Cloud/OpenClaw/Hermes parity, automatic publishing, automatic acquisition, automatic redemption or operating analytics until real provider keys, merchant authorization, signed receipts and data contracts are configured and verified.',
  };
}

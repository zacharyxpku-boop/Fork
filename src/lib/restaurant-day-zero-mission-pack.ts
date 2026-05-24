import { buildRestaurantPublicTrialSeed, type RestaurantPublicTrialSeed } from '@/lib/restaurant-public-trial-seed';
import { buildRestaurantTrialWorkflowPack, type RestaurantTrialWorkflowStep } from '@/lib/restaurant-trial-workflow-pack';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantDayZeroMissionStatus = 'ready-internal' | 'needs-merchant-evidence' | 'external-gated';

export type RestaurantDayZeroMission = {
  id: string;
  lane: 'brief' | 'content' | 'publish-proof' | 'lead-followup' | 'operating-data' | 'runtime';
  title: string;
  status: RestaurantDayZeroMissionStatus;
  owner: RestaurantTrialWorkflowStep['owner'];
  action: string;
  evidenceRequired: string;
  nextAction: string;
  sourceStepId: string;
};

export type RestaurantDayZeroMissionPack = {
  ok: true;
  payloadShape: 'restaurant-day-zero-mission-pack-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'can-start-today' | 'needs-merchant-evidence' | 'external-provider-required';
  summary: {
    missions: number;
    readyInternal: number;
    needsMerchantEvidence: number;
    externalGated: number;
    normalizedEvidenceFields: number;
    providerUnlocks: number;
  };
  trialSeed: Pick<RestaurantPublicTrialSeed, 'payloadShape' | 'verdict' | 'summary' | 'trialIntake'>;
  missions: RestaurantDayZeroMission[];
  storeManagerChecklist: Array<{
    owner: string;
    due: string;
    action: string;
    evidence: string;
  }>;
  providerUnlocks: string[];
  evidenceImportFields: string[];
  safetyBoundary: string;
};

function laneFromStep(stepId: string): RestaurantDayZeroMission['lane'] {
  if (stepId === 'intake' || stepId === 'selling-points') return 'brief';
  if (stepId === 'local-content-plan') return 'content';
  if (stepId === 'receipt-ledger') return 'publish-proof';
  if (stepId === 'follow-up') return 'lead-followup';
  if (stepId === 'operating-data') return 'operating-data';
  return 'runtime';
}

function missionStatusFromStep(step: RestaurantTrialWorkflowStep): RestaurantDayZeroMissionStatus {
  if (step.status === 'external-gated') return 'external-gated';
  if (step.status === 'needs-review') return 'needs-merchant-evidence';
  if (step.id === 'receipt-ledger' || step.id === 'follow-up') return 'needs-merchant-evidence';
  return 'ready-internal';
}

function dueFromStatus(status: RestaurantDayZeroMissionStatus): string {
  if (status === 'ready-internal') return 'today before content review';
  if (status === 'needs-merchant-evidence') return 'today before publish or follow-up closeout';
  return 'after provider, merchant authorization and data contract are configured';
}

function verdictFromSummary(summary: RestaurantDayZeroMissionPack['summary']): RestaurantDayZeroMissionPack['verdict'] {
  if (summary.externalGated > 0) return 'external-provider-required';
  if (summary.needsMerchantEvidence > 0) return 'needs-merchant-evidence';
  return 'can-start-today';
}

export function buildRestaurantDayZeroMissionPack(input: RestaurantTrialIntake & {
  sampleId?: string;
  city?: string;
  area?: string;
  cuisine?: string;
  sourceUrl?: string;
  manualText?: string;
  now?: Date;
} = {}): RestaurantDayZeroMissionPack {
  const now = input.now || new Date();
  const trialSeed = buildRestaurantPublicTrialSeed({
    sampleId: input.sampleId,
    restaurant: input.restaurant,
    city: input.city,
    area: input.area,
    cuisine: input.cuisine,
    scenario: input.visitReason,
    sourceUrl: input.sourceUrl,
    suggestedOffer: input.offer,
    suggestedAudience: input.audience,
    manualText: input.manualText,
    now,
  });
  const workflowPack = buildRestaurantTrialWorkflowPack(trialSeed.trialIntake, now);
  const missions = workflowPack.workflowSteps.map(step => {
    const status = missionStatusFromStep(step);
    return {
      id: `day0-${step.id}`,
      lane: laneFromStep(step.id),
      title: step.title,
      status,
      owner: step.owner,
      action: step.output,
      evidenceRequired: step.evidenceRequired,
      nextAction: step.nextAction,
      sourceStepId: step.id,
    };
  });
  const summary = {
    missions: missions.length,
    readyInternal: missions.filter(item => item.status === 'ready-internal').length,
    needsMerchantEvidence: missions.filter(item => item.status === 'needs-merchant-evidence').length,
    externalGated: missions.filter(item => item.status === 'external-gated').length,
    normalizedEvidenceFields: trialSeed.normalizedEvidence.length,
    providerUnlocks: trialSeed.externalRequired.length,
  };

  return {
    ok: true,
    payloadShape: 'restaurant-day-zero-mission-pack-v1',
    generatedAt: now.toISOString(),
    restaurant: trialSeed.trialIntake.restaurant,
    offer: trialSeed.trialIntake.offer,
    verdict: verdictFromSummary(summary),
    summary,
    trialSeed: {
      payloadShape: trialSeed.payloadShape,
      verdict: trialSeed.verdict,
      summary: trialSeed.summary,
      trialIntake: trialSeed.trialIntake,
    },
    missions,
    storeManagerChecklist: missions.slice(0, 7).map(item => ({
      owner: item.owner,
      due: dueFromStatus(item.status),
      action: item.nextAction,
      evidence: item.evidenceRequired,
    })),
    providerUnlocks: trialSeed.externalRequired,
    evidenceImportFields: trialSeed.normalizedEvidence.map(item => `${item.field}: ${item.requiredFor}`),
    safetyBoundary: 'Day-0 Mission Pack turns public or manually supplied restaurant context into internal owner tasks only. It does not auto-publish, contact customers, redeem coupons, read private messages, collect identifiers, pull POS rows, expose provider keys, or treat public store context as merchant authorization.',
  };
}

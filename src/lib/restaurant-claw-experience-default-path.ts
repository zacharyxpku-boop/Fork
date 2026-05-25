import { buildRestaurantActivationCockpit, type RestaurantActivationCockpit } from '@/lib/restaurant-activation-cockpit';
import type { RestaurantClawModule } from '@/lib/restaurant-claw-skill-catalog';
import { buildRestaurantClawSkillWorkbench, type RestaurantClawSkillWorkbench } from '@/lib/restaurant-claw-skill-workbench';
import { buildRestaurantCompetitorRouteDecision, type RestaurantCompetitorRouteDecision } from '@/lib/restaurant-competitor-route-decision';
import { buildRestaurantTrialWorkflowPack, type RestaurantTrialWorkflowPack } from '@/lib/restaurant-trial-workflow-pack';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantClawExperiencePathStep = {
  id: string;
  label: string;
  owner: 'merchant' | 'runtime-admin' | 'data-ops' | 'product' | RestaurantClawModule['owner'];
  status: 'ready-now' | 'review-needed' | 'training-needed' | 'provider-gated' | 'blocked-boundary';
  customerAction: string;
  internalOutput: string;
  evidenceRequired: string;
};

export type RestaurantClawExperienceDefaultPath = {
  ok: true;
  payloadShape: 'restaurant-claw-experience-default-path-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  mode: 'internal-first-provider-gated';
  answerForCustomer: string;
  summary: {
    steps: number;
    readyNow: number;
    reviewNeeded: number;
    trainingNeeded: number;
    providerGated: number;
    canRunTodayWithoutProvider: boolean;
    canClaimExternalAutomation: false;
  };
  primaryPath: RestaurantClawExperiencePathStep[];
  quickActions: Array<{
    label: string;
    action: 'trial-workflow-pack' | 'claw-skill-workbench' | 'competitor-route-decision' | 'activation-cockpit' | 'provider-setup-pack';
    reason: string;
  }>;
  customerVisibleProof: string[];
  trainingNow: string[];
  providerNeeded: string[];
  routeDecision: Pick<RestaurantCompetitorRouteDecision, 'payloadShape' | 'finalTarget' | 'answerForOwner' | 'summary' | 'referenceModels' | 'finalShape' | 'providerKeyChecklist' | 'merchantInputsNeeded' | 'safetyBoundary'>;
  skillWorkbench: Pick<RestaurantClawSkillWorkbench, 'payloadShape' | 'mode' | 'summary' | 'deliverables' | 'externalRequired' | 'safetyBoundary'>;
  trialWorkflow: Pick<RestaurantTrialWorkflowPack, 'payloadShape' | 'summary' | 'decisionBrief' | 'evidenceChecklist' | 'trainingQueue' | 'externalUnlocks' | 'safetyBoundary'>;
  activationCockpit: Pick<RestaurantActivationCockpit, 'payloadShape' | 'summary' | 'answerForCustomer' | 'safetyBoundary'>;
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function unique(values: string[], limit = 14): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function countStatus(steps: RestaurantClawExperiencePathStep[], status: RestaurantClawExperiencePathStep['status']) {
  return steps.filter(step => step.status === status).length;
}

export async function buildRestaurantClawExperienceDefaultPath(input: RestaurantTrialIntake & {
  now?: Date;
} = {}): Promise<RestaurantClawExperienceDefaultPath> {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, 'Trial restaurant');
  const offer = clean(input.offer, 'Today featured set meal');
  const routeDecision = await buildRestaurantCompetitorRouteDecision({ ...input, restaurant, offer, now });
  const skillWorkbench = buildRestaurantClawSkillWorkbench({ ...input, restaurant, offer, now });
  const trialWorkflow = buildRestaurantTrialWorkflowPack({ ...input, restaurant, offer }, now);
  const activationCockpit = buildRestaurantActivationCockpit({ ...input, restaurant, offer, now });

  const firstReadySkill = skillWorkbench.workbench.find(item => item.canRunNow);
  const firstTrainingSkill = skillWorkbench.workbench.find(item => item.status === 'training-needed');
  const firstProviderLane = activationCockpit.lanes.find(item => item.status === 'provider-gated');

  const primaryPath: RestaurantClawExperiencePathStep[] = [
    {
      id: 'route',
      label: 'Choose product route',
      owner: 'product',
      status: 'ready-now',
      customerAction: 'Use platform spine as base, Claw-style workbench as experience layer, runtime/data contracts as unlocks.',
      internalOutput: routeDecision.finalTarget,
      evidenceRequired: 'route decision payload with provider checklist and merchant input list',
    },
    {
      id: 'brief',
      label: 'Confirm restaurant brief',
      owner: 'merchant',
      status: 'review-needed',
      customerAction: 'Confirm offer, audience, channels, visit reason, stock, price and forbidden claims.',
      internalOutput: trialWorkflow.decisionBrief.headline,
      evidenceRequired: trialWorkflow.evidenceChecklist[0] || 'merchant-approved brief evidence',
    },
    {
      id: 'skill-pack',
      label: 'Run Claw skill pack',
      owner: firstReadySkill?.owner || 'ops',
      status: skillWorkbench.summary.runnableNow ? 'ready-now' : 'training-needed',
      customerAction: firstReadySkill
        ? `Run ${firstReadySkill.moduleName} / ${firstReadySkill.skillName} in review state.`
        : 'Collect merchant-approved samples before reusable skill execution.',
      internalOutput: skillWorkbench.deliverables.find(item => item.id === 'internal-store-task-pack')?.title || 'internal task pack',
      evidenceRequired: firstReadySkill?.evidenceRequired.join(' / ') || 'training sample and merchant review note',
    },
    {
      id: 'training',
      label: 'Train reusable gaps',
      owner: 'ops',
      status: skillWorkbench.summary.trainingNeeded ? 'training-needed' : 'ready-now',
      customerAction: firstTrainingSkill
        ? firstTrainingSkill.nextAction
        : 'No immediate training blocker for the selected path.',
      internalOutput: skillWorkbench.deliverables.find(item => item.id === 'training-backlog')?.title || 'training backlog',
      evidenceRequired: firstTrainingSkill?.evidenceRequired.join(' / ') || 'accepted training record',
    },
    {
      id: 'controlled-run',
      label: 'Run controlled trial',
      owner: 'store-manager',
      status: trialWorkflow.summary.canRunInternallyToday ? 'ready-now' : 'provider-gated',
      customerAction: 'Generate content, proof checklist, owner queue and follow-up without claiming external automation.',
      internalOutput: `${trialWorkflow.summary.readySteps}/${trialWorkflow.summary.steps} workflow steps ready`,
      evidenceRequired: trialWorkflow.evidenceChecklist.slice(0, 3).join(' / '),
    },
    {
      id: 'provider-unlock',
      label: 'Unlock Provider lanes',
      owner: 'runtime-admin',
      status: activationCockpit.summary.providerGated ? 'provider-gated' : 'ready-now',
      customerAction: firstProviderLane
        ? firstProviderLane.nextAction
        : 'Provider gates are not blocking the current internal path.',
      internalOutput: firstProviderLane?.customerOutcome || activationCockpit.answerForCustomer,
      evidenceRequired: firstProviderLane?.evidenceRequired.join(' / ') || 'provider health and signed callback',
    },
    {
      id: 'automation-boundary',
      label: 'Keep external claims blocked',
      owner: 'runtime-admin',
      status: 'blocked-boundary',
      customerAction: 'Do not claim auto-publish, auto-acquisition, coupon redemption or true operating analysis until accepted proof exists.',
      internalOutput: 'external automation remains blocked until provider, merchant auth, callback and data contracts pass',
      evidenceRequired: 'accepted receipt, provider health, merchant grant and sanitized data contract',
    },
  ];

  const trainingNow = unique([
    ...skillWorkbench.workbench
      .filter(item => item.status === 'training-needed')
      .slice(0, 5)
      .map(item => `${item.moduleName}: ${item.skillName}`),
    ...trialWorkflow.trainingQueue.map(item => item.material),
    ...routeDecision.trainingPlan.nextInternalTraining.slice(0, 4).map(item => item.material),
  ], 12);
  const providerNeeded = unique([
    ...routeDecision.providerKeyChecklist,
    ...skillWorkbench.externalRequired,
    ...trialWorkflow.externalUnlocks.map(item => item.providerRequest),
    ...activationCockpit.externalSetupRequests.map(item => item.provider),
  ], 16);

  return {
    ok: true,
    payloadShape: 'restaurant-claw-experience-default-path-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    mode: 'internal-first-provider-gated',
    answerForCustomer: `Start with the default Claw-style path for ${restaurant} / ${offer}: route decision, merchant brief, runnable skill pack, controlled trial, then provider unlocks. External automation remains blocked until proof is accepted.`,
    summary: {
      steps: primaryPath.length,
      readyNow: countStatus(primaryPath, 'ready-now'),
      reviewNeeded: countStatus(primaryPath, 'review-needed'),
      trainingNeeded: countStatus(primaryPath, 'training-needed'),
      providerGated: countStatus(primaryPath, 'provider-gated') + countStatus(primaryPath, 'blocked-boundary'),
      canRunTodayWithoutProvider: trialWorkflow.summary.canRunInternallyToday && skillWorkbench.summary.runnableNow > 0,
      canClaimExternalAutomation: false,
    },
    primaryPath,
    quickActions: [
      { label: 'Build Trial Workflow Pack', action: 'trial-workflow-pack', reason: 'Creates the controlled customer work order and evidence checklist.' },
      { label: 'Open Skill Workbench', action: 'claw-skill-workbench', reason: 'Creates runnable skill packs, training backlog and provider unlock tasks.' },
      { label: 'Build Route Decision', action: 'competitor-route-decision', reason: 'Explains why platform spine plus Claw experience is the final product route.' },
      { label: 'Build Activation Cockpit', action: 'activation-cockpit', reason: 'Separates internal-ready lanes from Provider-gated automation claims.' },
      { label: 'Provider Setup Pack', action: 'provider-setup-pack', reason: 'Lists keys, grants, callbacks and data contracts needed before external execution.' },
    ],
    customerVisibleProof: unique([
      ...trialWorkflow.evidenceChecklist,
      ...skillWorkbench.deliverables.map(item => item.acceptance),
      'owner, blocker, next action and proof state visible in one path',
    ], 12),
    trainingNow,
    providerNeeded,
    routeDecision: {
      payloadShape: routeDecision.payloadShape,
      finalTarget: routeDecision.finalTarget,
      answerForOwner: routeDecision.answerForOwner,
      summary: routeDecision.summary,
      referenceModels: routeDecision.referenceModels,
      finalShape: routeDecision.finalShape,
      providerKeyChecklist: routeDecision.providerKeyChecklist,
      merchantInputsNeeded: routeDecision.merchantInputsNeeded,
      safetyBoundary: routeDecision.safetyBoundary,
    },
    skillWorkbench: {
      payloadShape: skillWorkbench.payloadShape,
      mode: skillWorkbench.mode,
      summary: skillWorkbench.summary,
      deliverables: skillWorkbench.deliverables,
      externalRequired: skillWorkbench.externalRequired,
      safetyBoundary: skillWorkbench.safetyBoundary,
    },
    trialWorkflow: {
      payloadShape: trialWorkflow.payloadShape,
      summary: trialWorkflow.summary,
      decisionBrief: trialWorkflow.decisionBrief,
      evidenceChecklist: trialWorkflow.evidenceChecklist,
      trainingQueue: trialWorkflow.trainingQueue,
      externalUnlocks: trialWorkflow.externalUnlocks,
      safetyBoundary: trialWorkflow.safetyBoundary,
    },
    activationCockpit: {
      payloadShape: activationCockpit.payloadShape,
      summary: activationCockpit.summary,
      answerForCustomer: activationCockpit.answerForCustomer,
      safetyBoundary: activationCockpit.safetyBoundary,
    },
    safetyBoundary: 'Default Path is an internal-first operator experience. It does not log in, publish, contact customers, read private messages, redeem coupons, pull POS rows, expose Provider key values or claim real operating results until Provider health, merchant authorization, signed receipts and sanitized data contracts are verified.',
  };
}

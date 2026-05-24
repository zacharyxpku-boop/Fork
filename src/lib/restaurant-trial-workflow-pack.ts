import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantDecision } from '@/lib/restaurant-decision-engine';
import { buildRestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantTrialWorkflowStepStatus = 'ready' | 'needs-review' | 'external-gated';

export type RestaurantTrialWorkflowStep = {
  id: string;
  title: string;
  status: RestaurantTrialWorkflowStepStatus;
  owner: 'merchant' | 'ops' | 'store-manager' | 'runtime-admin' | 'data-ops';
  inputNeeded: string[];
  output: string;
  evidenceRequired: string;
  nextAction: string;
};

export type RestaurantTrialWorkflowPack = {
  ok: true;
  payloadShape: 'restaurant-trial-workflow-pack';
  generatedAt: string;
  workOrder: {
    eventId: string;
    tenantId: string;
    restaurant: string;
    offer: string;
    audience: string;
    channels: string[];
    visitReason: string;
    constraints: string;
    owner: string;
  };
  summary: {
    steps: number;
    readySteps: number;
    needsReviewSteps: number;
    externalGatedSteps: number;
    canRunInternallyToday: boolean;
    canAutoExecuteExternally: boolean;
  };
  decisionBrief: {
    headline: string;
    decision: string;
    reasons: string[];
  };
  channelDrafts: Array<{
    channel: string;
    job: string;
    draft: string;
    proofRequired: string;
  }>;
  workflowSteps: RestaurantTrialWorkflowStep[];
  ownerQueue: Array<{
    owner: string;
    action: string;
    due: string;
    evidence: string;
  }>;
  evidenceChecklist: string[];
  trainingQueue: Array<{
    capability: string;
    material: string;
    acceptance: string;
  }>;
  externalUnlocks: Array<{
    capability: string;
    missing: string;
    providerRequest: string;
  }>;
  safetyBoundary: string;
};

function cleanText(value: unknown, fallback: string, max = 120): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function splitChannels(value: string): string[] {
  const channels = value
    .split(/[\/,，、|]/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 6);
  return channels.length ? channels : ['Dianping', 'Xiaohongshu', 'Douyin', 'WeChat group'];
}

function buildDecisionInput(input: RestaurantTrialIntake) {
  return {
    restaurant: cleanText(input.restaurant, 'Trial restaurant'),
    offer: cleanText(input.offer, 'Today featured set meal'),
    price: 168,
    foodCostRate: 0.36,
    availablePortions: 42,
    targetRevenue: 9800,
    yesterdayRevenue: 7200,
    couponClaims: 38,
    reservations: 11,
    privateMessages: 17,
    redemptions: 14,
    averageTicket: 156,
    serviceWindow: cleanText(input.visitReason, 'today dinner service', 80),
    owner: 'store-manager / community owner',
  };
}

export function buildRestaurantTrialWorkflowPack(input: RestaurantTrialIntake = {}, now = new Date()): RestaurantTrialWorkflowPack {
  const restaurant = cleanText(input.restaurant, 'Trial restaurant');
  const offer = cleanText(input.offer, 'Today featured set meal');
  const audience = cleanText(input.audience, 'nearby diners');
  const visitReason = cleanText(input.visitReason, 'clear reason to visit today');
  const constraints = cleanText(input.constraints, 'merchant must review price, stock, coupon rules and forbidden claims');
  const channels = splitChannels(cleanText(input.channels, 'Dianping / Xiaohongshu / Douyin / WeChat group', 160));
  const evidence = cleanText(input.evidence, 'menu screenshot, dish photo, public post link or coupon proof');
  const dispatch = buildRestaurantAgentDispatch({
    taskId: 'browser-publish-check',
    restaurant,
    offer,
    owner: 'ops',
    runtimeTarget: 'local',
    source: 'trial_workflow_pack',
  });
  const decision = buildRestaurantDecision(buildDecisionInput(input));
  const dataContract = buildRestaurantOperatingDataContract({ now });
  const canAutoExecuteExternally = dataContract.summary.canClaimAutoRedemption;

  const workflowSteps: RestaurantTrialWorkflowStep[] = [
    {
      id: 'intake',
      title: 'Confirm restaurant offer brief',
      status: 'ready',
      owner: 'merchant',
      inputNeeded: ['restaurant', 'offer', 'audience', 'visitReason', 'constraints'],
      output: `${restaurant} / ${offer} trial work order`,
      evidenceRequired: evidence,
      nextAction: 'Merchant confirms offer boundary, stock, price, and forbidden claims.',
    },
    {
      id: 'selling-points',
      title: 'Turn dish facts into visit reasons',
      status: 'needs-review',
      owner: 'ops',
      inputNeeded: ['dish photo', 'menu price', 'service window', 'audience'],
      output: decision.headline,
      evidenceRequired: 'dish facts and menu proof reviewed by the store',
      nextAction: 'Pick the strongest dining scenario before content generation.',
    },
    {
      id: 'local-content-plan',
      title: 'Generate local content plan',
      status: 'ready',
      owner: 'ops',
      inputNeeded: channels,
      output: `${decision.channelPack.length} channel drafts with proof requirements`,
      evidenceRequired: 'draft text, channel, owner, proof field and approval state',
      nextAction: 'Review drafts, then decide manual posting or governed browser runbook.',
    },
    {
      id: 'browser-runbook',
      title: 'Prepare governed browser execution runbook',
      status: canAutoExecuteExternally ? 'ready' : 'external-gated',
      owner: 'runtime-admin',
      inputNeeded: ['runtime URL/key', 'isolated browser profile', 'merchant login grant', 'callback secret'],
      output: 'handoff-only runbook until runtime and merchant authorization are configured',
      evidenceRequired: dispatch.workerPayload.evidenceRequired,
      nextAction: canAutoExecuteExternally
        ? 'Forward the execution package and require signed receipt callback.'
        : 'Keep as manual handoff; do not claim auto-publish before runtime and authorization exist.',
    },
    {
      id: 'receipt-ledger',
      title: 'Collect publishing and lead proof',
      status: 'ready',
      owner: 'store-manager',
      inputNeeded: ['public post link', 'screenshotId', 'reservation count', 'coupon claim count', 'visit intent count'],
      output: 'manual or signed receipt that can feed run health and business signals',
      evidenceRequired: 'public link, screenshot, externalRunId or sanitized aggregate receipt',
      nextAction: 'Import proof after posting; rejected receipts do not enter operating analysis.',
    },
    {
      id: 'operating-data',
      title: 'Attach POS, redemption and margin contract',
      status: dataContract.summary.canClaimTrueOperatingAnalysis ? 'ready' : 'external-gated',
      owner: 'data-ops',
      inputNeeded: dataContract.importTemplate.slice(0, 6).map(item => item.field),
      output: 'manual POS/redemption template plus provider setup requests',
      evidenceRequired: 'sanitized aggregate POS/redemption rows, field dictionary and merchant authorization',
      nextAction: 'Use manual aggregate import today; request POS/finance fields before claiming true operating analysis.',
    },
    {
      id: 'follow-up',
      title: 'Assign store follow-up and memory write-back',
      status: 'ready',
      owner: 'store-manager',
      inputNeeded: ['accepted receipts', 'lead counts', 'owner', 'next action'],
      output: 'store-manager follow-up queue and reusable campaign memory',
      evidenceRequired: 'owner action, due time, proof source and no raw private messages',
      nextAction: 'Close the loop with reservation, coupon, visit-intent or manual-review receipt.',
    },
  ];

  const externalUnlocks = decision.blockedAutomation.map(item => ({
    capability: item.capability,
    missing: item.missing,
    providerRequest: item.whyCompetitorsCan,
  }));

  const trainingQueue = [
    {
      capability: 'restaurant offer brief',
      material: 'menu screenshot, dish photo, price, stock, service window and forbidden claims',
      acceptance: 'Store owner can approve the brief without hidden assumptions.',
    },
    {
      capability: 'local channel copy',
      material: 'Dianping/Xiaohongshu/Douyin/WeChat examples for this restaurant category',
      acceptance: 'Each draft has channel, proof requirement, owner and approval state.',
    },
    {
      capability: 'receipt and follow-up',
      material: 'public proof link, screenshot, reservation/coupon/visit aggregate and next action',
      acceptance: 'No raw private messages or customer identifiers are stored.',
    },
  ];

  const readySteps = workflowSteps.filter(step => step.status === 'ready').length;
  const needsReviewSteps = workflowSteps.filter(step => step.status === 'needs-review').length;
  const externalGatedSteps = workflowSteps.filter(step => step.status === 'external-gated').length;

  return {
    ok: true,
    payloadShape: 'restaurant-trial-workflow-pack',
    generatedAt: now.toISOString(),
    workOrder: {
      eventId: dispatch.eventId,
      tenantId: dispatch.tenantId,
      restaurant,
      offer,
      audience,
      channels,
      visitReason,
      constraints,
      owner: 'ops',
    },
    summary: {
      steps: workflowSteps.length,
      readySteps,
      needsReviewSteps,
      externalGatedSteps,
      canRunInternallyToday: readySteps + needsReviewSteps > externalGatedSteps,
      canAutoExecuteExternally,
    },
    decisionBrief: {
      headline: decision.headline,
      decision: decision.decision,
      reasons: decision.why,
    },
    channelDrafts: decision.channelPack.map(item => ({
      channel: item.channel,
      job: item.job,
      draft: item.copy,
      proofRequired: item.proof,
    })),
    workflowSteps,
    ownerQueue: decision.actionQueue,
    evidenceChecklist: [
      evidence,
      'public post link or screenshot after manual publish',
      'reservation, coupon claim, visit intent or manual review aggregate',
      'sanitized POS/redemption export before operating analysis',
      'merchant authorization before browser execution or platform reads',
    ],
    trainingQueue,
    externalUnlocks,
    safetyBoundary: 'The workflow pack is executable as an internal work order, content plan, evidence checklist and follow-up queue. It must not claim automatic publishing, acquisition, redemption, private-message access or true POS/finance analysis until the required provider keys, runtime, merchant authorization, callback and data contracts are configured.',
  };
}

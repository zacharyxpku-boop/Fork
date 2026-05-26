import type { RestaurantAgentCommandCenter } from '@/lib/restaurant-agent-command-center';
import type { RestaurantDefaultPathForwardableBrief } from '@/lib/restaurant-default-path-forwardable-brief';
import type { RestaurantProviderKeyGapBoard } from '@/lib/restaurant-provider-key-gap-board';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantClawCloudHomeLane = {
  id: 'ask-ai-employee' | 'run-shift' | 'publish-and-proof' | 'leads-and-redemption' | 'provider-unlock';
  label: string;
  status: 'ready-internal' | 'needs-review' | 'provider-gated' | 'data-gated';
  owner: 'ai-employee' | 'store-manager' | 'ops' | 'runtime-admin' | 'data-ops';
  customerPromise: string;
  actionNow: string;
  visibleProof: string;
  externalNeeded: string[];
  stopLine: string;
};

export type RestaurantClawCloudOperatorHome = {
  ok: true;
  payloadShape: 'restaurant-claw-cloud-operator-home-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  positioning: 'claw-cloud-style-ai-employee-home';
  hero: {
    title: string;
    status: 'working-internally' | 'waiting-provider' | 'waiting-proof';
    promise: string;
    primaryAction: string;
    secondaryAction: string;
  };
  summary: {
    lanes: number;
    readyInternal: number;
    needsReview: number;
    providerGated: number;
    dataGated: number;
    canUseAsAiEmployeeToday: boolean;
    canClaimExternalAutomation: false;
  };
  lanes: RestaurantClawCloudHomeLane[];
  aiEmployeeBrief: string[];
  ownerQueue: string[];
  providerQueue: string[];
  evidenceQueue: string[];
  redactedFields: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function unique(values: string[], limit = 10): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function countStatus(lanes: RestaurantClawCloudHomeLane[], status: RestaurantClawCloudHomeLane['status']) {
  return lanes.filter(lane => lane.status === status).length;
}

export function buildRestaurantClawCloudOperatorHome(input: RestaurantTrialIntake & {
  commandCenter: Pick<RestaurantAgentCommandCenter, 'mode' | 'headline' | 'primaryAction' | 'nextAction' | 'aiEmployeeInbox' | 'gmCommandDeck' | 'storeManagerTaskQueue' | 'externalRequired' | 'safetyBoundary'>;
  forwardableBrief?: RestaurantDefaultPathForwardableBrief;
  providerKeyGapBoard?: RestaurantProviderKeyGapBoard;
  now?: Date;
}): RestaurantClawCloudOperatorHome {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant || input.forwardableBrief?.restaurant, 'Trial restaurant');
  const offer = clean(input.offer || input.forwardableBrief?.offer, 'Today featured offer');
  const aiMessage = input.commandCenter.aiEmployeeInbox.messages[0];
  const gmLane = input.commandCenter.gmCommandDeck.lanes[0];
  const task = input.commandCenter.storeManagerTaskQueue.tasks[0];
  const providerGap = input.providerKeyGapBoard?.rows.find(row => row.status !== 'internal-ready');

  const lanes: RestaurantClawCloudHomeLane[] = [
    {
      id: 'ask-ai-employee',
      label: 'Ask AI employee',
      status: input.commandCenter.aiEmployeeInbox.summary.internalRunnable > 0 ? 'ready-internal' : 'needs-review',
      owner: 'ai-employee',
      customerPromise: 'The user starts from one AI employee answer, not a catalog of expert tools.',
      actionNow: aiMessage?.body || input.commandCenter.primaryAction.reason,
      visibleProof: input.commandCenter.aiEmployeeInbox.memory.slice(0, 4).map(item => `${item.label}:${item.value}`).join(' / '),
      externalNeeded: input.commandCenter.aiEmployeeInbox.externalRequired.slice(0, 4),
      stopLine: input.commandCenter.aiEmployeeInbox.safetyBoundary,
    },
    {
      id: 'run-shift',
      label: 'Run today shift',
      status: input.commandCenter.gmCommandDeck.summary.canRunWithoutProvider ? 'ready-internal' : 'needs-review',
      owner: 'store-manager',
      customerPromise: 'Opening brief, service-window watch and closeout become one restaurant shift loop.',
      actionNow: gmLane?.actionNow || input.commandCenter.gmCommandDeck.aiAutopilotQueue[0] || input.commandCenter.nextAction,
      visibleProof: gmLane?.visibleProof || 'owner task queue and staff handoff',
      externalNeeded: input.commandCenter.gmCommandDeck.providerQueue.slice(0, 4),
      stopLine: input.commandCenter.gmCommandDeck.safetyBoundary,
    },
    {
      id: 'publish-and-proof',
      label: 'Publish and proof',
      status: 'provider-gated',
      owner: 'ops',
      customerPromise: 'Approved local content can be prepared internally; real platform publishing needs accepted proof.',
      actionNow: 'Prepare one approved channel package and proof slot before any Provider run.',
      visibleProof: 'public URL, screenshot id or signed callback receipt',
      externalNeeded: unique([
        'merchant platform authorization',
        'isolated browser profile',
        'callback secret',
        ...(input.providerKeyGapBoard?.rows.find(row => row.id === 'auto-publish')?.externalNeeded || []),
      ], 5),
      stopLine: 'No auto-publish claim until provider health, merchant grant and accepted public receipt exist.',
    },
    {
      id: 'leads-and-redemption',
      label: 'Leads and redemption',
      status: 'data-gated',
      owner: 'data-ops',
      customerPromise: 'Reservations, coupon claims and POS aggregates become follow-up tasks and closeout evidence.',
      actionNow: task?.action || 'Import aggregate lead, coupon and POS fields before judging business results.',
      visibleProof: task?.evidenceRequired || 'aggregate lead/redemption/POS import and accepted receipt',
      externalNeeded: unique([
        'lead source authorization',
        'coupon/POS field dictionary',
        'no-PII aggregate data contract',
        ...(input.providerKeyGapBoard?.rows.find(row => row.id === 'true-operating-analysis')?.externalNeeded || []),
      ], 5),
      stopLine: 'No customer PII, private-message body, coupon code, payment id or raw POS row can enter the AI employee.',
    },
    {
      id: 'provider-unlock',
      label: 'Unlock external execution',
      status: 'provider-gated',
      owner: 'runtime-admin',
      customerPromise: 'Every competitor-grade automation lane has a Provider ask, receipt schema and stop line.',
      actionNow: providerGap?.nextAction || 'Configure runtime URL/key, callback secret, merchant grants and data contract before sandbox submit.',
      visibleProof: providerGap?.acceptanceEvidence.join(' / ') || 'provider health, signed callback and accepted receipt',
      externalNeeded: providerGap?.externalNeeded.slice(0, 5) || input.commandCenter.externalRequired.slice(0, 5),
      stopLine: providerGap?.stopLine || 'External execution remains blocked until Provider proof is accepted.',
    },
  ];

  const providerQueue = unique([
    ...lanes.flatMap(lane => lane.externalNeeded),
    ...(input.forwardableBrief?.externalRequired || []),
  ], 12);
  const ownerQueue = unique([
    input.forwardableBrief?.todayOperatingOrder[0]?.action || '',
    input.forwardableBrief?.todayOperatingOrder[2]?.action || '',
    input.commandCenter.primaryAction.reason,
    input.commandCenter.nextAction,
  ], 6);
  const evidenceQueue = unique([
    ...lanes.map(lane => `${lane.label}: ${lane.visibleProof}`),
    ...(input.forwardableBrief?.evidenceStatus.map(item => `${item.lane}: ${item.evidence}`) || []),
  ], 10);
  const heroStatus: RestaurantClawCloudOperatorHome['hero']['status'] =
    countStatus(lanes, 'provider-gated') > 0 ? 'waiting-provider'
      : countStatus(lanes, 'needs-review') > 0 ? 'waiting-proof'
        : 'working-internally';

  return {
    ok: true,
    payloadShape: 'restaurant-claw-cloud-operator-home-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    positioning: 'claw-cloud-style-ai-employee-home',
    hero: {
      title: 'Wenai Store Operator is ready for the first controlled shift',
      status: heroStatus,
      promise: `${restaurant} sees one AI employee command surface: ask, run shift, prepare publish proof, follow leads and unlock Provider lanes.`,
      primaryAction: input.commandCenter.primaryAction.label,
      secondaryAction: input.forwardableBrief?.headline || 'Generate one forwardable operating brief',
    },
    summary: {
      lanes: lanes.length,
      readyInternal: countStatus(lanes, 'ready-internal'),
      needsReview: countStatus(lanes, 'needs-review'),
      providerGated: countStatus(lanes, 'provider-gated'),
      dataGated: countStatus(lanes, 'data-gated'),
      canUseAsAiEmployeeToday: countStatus(lanes, 'ready-internal') > 0,
      canClaimExternalAutomation: false,
    },
    lanes,
    aiEmployeeBrief: unique([
      input.commandCenter.headline,
      input.commandCenter.aiEmployeeInbox.messages[0]?.title || '',
      input.commandCenter.gmCommandDeck.answerForOwner,
      input.forwardableBrief?.operatorSummary || '',
    ], 5),
    ownerQueue,
    providerQueue,
    evidenceQueue,
    redactedFields: input.forwardableBrief?.redactedFields || [
      'api keys',
      'cookies',
      'private message text',
      'customer PII',
      'coupon codes',
      'payment ids',
      'raw POS rows',
    ],
    safetyBoundary: 'Claw Cloud Operator Home is an AI employee command surface over internal tasks, proof queues and Provider gates. It does not log in, publish, contact customers, redeem coupons, read private messages, write POS data, expose secrets or claim external automation without merchant authorization, Provider health, signed receipts and aggregate data contracts.',
  };
}

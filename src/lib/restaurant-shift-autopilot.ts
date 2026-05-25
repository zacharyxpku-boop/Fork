import type { RestaurantAgentChannelHub, RestaurantAgentScheduledJob } from '@/lib/restaurant-agent-channel-hub';
import type { RestaurantGmCommandDeck, RestaurantGmCommandLane } from '@/lib/restaurant-gm-command-deck';

export type RestaurantShiftAutopilotStep = {
  id: string;
  laneId: RestaurantGmCommandLane['id'];
  jobId?: string;
  title: string;
  mode: 'run-internal' | 'prepare-manual' | 'wait-provider' | 'collect-evidence';
  dueNow: boolean;
  owner: RestaurantGmCommandLane['owner'] | RestaurantAgentScheduledJob['owner'];
  trigger: string;
  action: string;
  proofRequired: string[];
  providerRequired: string[];
  nextWakeup: string;
  stopLine: string;
};

export type RestaurantShiftAutopilot = {
  ok: true;
  payloadShape: 'restaurant-shift-autopilot-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  summary: {
    steps: number;
    dueNow: number;
    internalRunnable: number;
    manualPrep: number;
    providerBlocked: number;
    evidenceBlocked: number;
    nextWakeups: number;
    canRunNowWithoutProvider: boolean;
    canClaimExternalAutomation: boolean;
  };
  steps: RestaurantShiftAutopilotStep[];
  nowQueue: string[];
  nextWakeups: string[];
  providerQueue: string[];
  evidenceQueue: string[];
  operatingPolicy: string[];
  safetyBoundary: string;
};

const LANE_JOB_MATCH: Record<RestaurantGmCommandLane['id'], string[]> = {
  opening: ['morning-prep', 'runtime-heartbeat'],
  demand: ['lunch-pulse'],
  'publish-proof': ['dinner-publish-window'],
  'service-window': ['lunch-pulse', 'runtime-heartbeat'],
  closeout: ['night-closeout'],
};

function localMinutes(now: Date) {
  return now.getHours() * 60 + now.getMinutes();
}

function cadenceDue(cadence: string, now: Date) {
  if (cadence.startsWith('every ')) return true;
  const match = cadence.match(/daily\s+(\d{2}):(\d{2})/);
  if (!match) return false;
  return localMinutes(now) >= Number(match[1]) * 60 + Number(match[2]);
}

function cadenceWakeup(cadence: string) {
  if (cadence.startsWith('every ')) return cadence;
  const match = cadence.match(/daily\s+(\d{2}):(\d{2})/);
  return match ? `${match[1]}:${match[2]} local` : cadence;
}

function modeFor(lane: RestaurantGmCommandLane, job?: RestaurantAgentScheduledJob): RestaurantShiftAutopilotStep['mode'] {
  if (lane.status === 'provider-required' || job?.status === 'provider-gated') return 'wait-provider';
  if (lane.status === 'evidence-required') return 'collect-evidence';
  if (lane.status === 'staff-review') return 'prepare-manual';
  return 'run-internal';
}

function unique(values: string[], limit = 10) {
  return Array.from(new Set(values.map(value => value.trim()).filter(Boolean))).slice(0, limit);
}

function proofFor(lane: RestaurantGmCommandLane, job?: RestaurantAgentScheduledJob) {
  return unique([
    lane.visibleProof,
    ...(job?.evidenceRequired || []),
  ], 5);
}

function providerFor(lane: RestaurantGmCommandLane, job?: RestaurantAgentScheduledJob) {
  return unique([
    lane.providerAsk,
    ...(job?.externalRequired || []),
  ], 6);
}

export function buildRestaurantShiftAutopilot(input: {
  restaurant: string;
  offer: string;
  gmCommandDeck: Pick<RestaurantGmCommandDeck, 'lanes' | 'summary' | 'providerQueue' | 'evidenceQueue'>;
  channelHub: Pick<RestaurantAgentChannelHub, 'scheduledJobs' | 'externalRequired'>;
  now?: Date;
}): RestaurantShiftAutopilot {
  const now = input.now || new Date();
  const steps = input.gmCommandDeck.lanes.map(lane => {
    const job = input.channelHub.scheduledJobs.find(item => LANE_JOB_MATCH[lane.id].includes(item.id));
    const mode = modeFor(lane, job);
    return {
      id: `shift-${lane.id}-${job?.id || 'manual'}`,
      laneId: lane.id,
      jobId: job?.id,
      title: lane.title,
      mode,
      dueNow: job ? cadenceDue(job.cadence, now) : mode !== 'wait-provider',
      owner: job?.owner || lane.owner,
      trigger: job?.trigger || lane.customerPromise,
      action: mode === 'wait-provider'
        ? `Hold external execution; prepare manual package for ${lane.title}.`
        : lane.actionNow,
      proofRequired: proofFor(lane, job),
      providerRequired: mode === 'wait-provider' ? providerFor(lane, job) : [],
      nextWakeup: job ? cadenceWakeup(job.cadence) : 'after owner evidence changes',
      stopLine: lane.stopLine,
    } satisfies RestaurantShiftAutopilotStep;
  });
  const count = (mode: RestaurantShiftAutopilotStep['mode']) => steps.filter(item => item.mode === mode).length;
  const dueNow = steps.filter(item => item.dueNow).length;
  return {
    ok: true,
    payloadShape: 'restaurant-shift-autopilot-v1',
    generatedAt: now.toISOString(),
    restaurant: input.restaurant,
    offer: input.offer,
    summary: {
      steps: steps.length,
      dueNow,
      internalRunnable: count('run-internal'),
      manualPrep: count('prepare-manual'),
      providerBlocked: count('wait-provider'),
      evidenceBlocked: count('collect-evidence'),
      nextWakeups: steps.length,
      canRunNowWithoutProvider: steps.some(item => item.dueNow && item.mode === 'run-internal'),
      canClaimExternalAutomation: input.gmCommandDeck.summary.canClaimExternalAutomation && count('wait-provider') === 0 && count('collect-evidence') === 0,
    },
    steps,
    nowQueue: steps
      .filter(item => item.dueNow && item.mode !== 'wait-provider')
      .map(item => `${item.title}: ${item.action}`)
      .slice(0, 8),
    nextWakeups: steps.map(item => `${item.title}: ${item.nextWakeup}`).slice(0, 8),
    providerQueue: unique([
      ...steps.flatMap(item => item.providerRequired),
      ...input.gmCommandDeck.providerQueue,
      ...input.channelHub.externalRequired,
    ], 10),
    evidenceQueue: unique([
      ...steps.flatMap(item => item.proofRequired),
      ...input.gmCommandDeck.evidenceQueue,
    ], 10),
    operatingPolicy: [
      'Run internal planning, staff review and proof preparation without Provider keys.',
      'Hold publish, lead capture, redemption and operating-analysis claims until provider health and accepted proof exist.',
      'Every due step must have owner, proof, provider ask and stop line before it can be forwarded.',
    ],
    safetyBoundary: 'Shift Autopilot builds a bounded shift plan and wakeup queue only. It does not run forever, log in, publish, contact customers, scrape private messages, redeem coupons, write POS orders, expose secrets, pull raw POS rows or claim external automation without provider health and accepted proof.',
  };
}

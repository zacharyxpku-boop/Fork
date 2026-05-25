import { buildRestaurantAgentChannelDeliveryReport, executeRestaurantAgentChannelDeliveryAttempt, type RestaurantAgentChannelDeliveryAttempt } from '@/lib/restaurant-agent-channel-delivery-store';
import { buildRestaurantAgentChannelHub, type RestaurantAgentChannel, type RestaurantAgentChannelHub, type RestaurantAgentScheduledJob } from '@/lib/restaurant-agent-channel-hub';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantAgentChannelScheduleRunItem = {
  jobId: string;
  title: string;
  cadence: string;
  due: boolean;
  selectedChannel: RestaurantAgentChannel['id'];
  previousAttempts: number;
  retryRecommended: boolean;
  attempt?: RestaurantAgentChannelDeliveryAttempt;
  nextAction: string;
};

export type RestaurantAgentChannelScheduleRun = {
  ok: true;
  payloadShape: 'restaurant-agent-channel-schedule-run-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  summary: {
    jobs: number;
    dueJobs: number;
    attempted: number;
    blocked: number;
    manualReady: number;
    forwarded: number;
    failed: number;
    retryRecommended: number;
  };
  acceptance: {
    verdict: 'internal-schedule-ran-provider-gated' | 'ready-for-staff-delivery' | 'needs-recovery';
    canRunStaffSchedule: boolean;
    canClaimAlwaysOnAutomation: false;
    internalActionsReady: number;
    blockedProviderGates: number;
    nextWakeupAt: string;
    operatorCloseout: string[];
  };
  items: RestaurantAgentChannelScheduleRunItem[];
  operatorTimeline: Array<{
    id: string;
    status: 'attempted' | 'blocked' | 'manual-ready' | 'forwarded' | 'waiting';
    owner: 'runtime-admin' | 'ops' | 'store-manager' | 'Wenai Store Operator';
    channel: RestaurantAgentChannel['id'];
    signal: string;
    nextAction: string;
    evidenceRequired: string[];
    externalGate: string;
  }>;
  channelHub: Pick<RestaurantAgentChannelHub, 'payloadShape' | 'summary' | 'externalRequired'>;
  deliveryReport: ReturnType<typeof buildRestaurantAgentChannelDeliveryReport>;
  recovery: Array<{
    jobId: string;
    reason: string;
    owner: 'runtime-admin' | 'ops' | 'store-manager';
    nextAction: string;
  }>;
  externalRequired: string[];
  safetyBoundary: string;
};

type EnvMap = Record<string, string | undefined>;

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function localMinutes(now: Date) {
  return now.getHours() * 60 + now.getMinutes();
}

function cadenceDue(cadence: string, now: Date): boolean {
  if (cadence.startsWith('every ')) return true;
  const match = cadence.match(/daily\s+(\d{2}):(\d{2})/);
  if (!match) return false;
  const target = Number(match[1]) * 60 + Number(match[2]);
  return localMinutes(now) >= target;
}

function channelForJob(job: RestaurantAgentScheduledJob, hub: RestaurantAgentChannelHub): RestaurantAgentChannel['id'] {
  if (job.owner === 'runtime-admin') return 'dingtalk';
  if (job.owner === 'store-manager') return 'wecom';
  if (job.owner === 'ops') return 'feishu';
  const firstReady = hub.channels.find(item => item.status === 'provider-ready');
  return firstReady?.id || 'wecom';
}

function previousAttemptsFor(jobId: string, attempts: RestaurantAgentChannelDeliveryAttempt[]) {
  return attempts.filter(item => item.jobId === jobId).length;
}

function retryRecommendedFor(jobId: string, attempts: RestaurantAgentChannelDeliveryAttempt[]) {
  const latest = attempts.find(item => item.jobId === jobId);
  return latest?.status === 'blocked' || latest?.status === 'failed';
}

function nextWakeupAt(now: Date) {
  const next = new Date(now);
  next.setMinutes(0, 0, 0);
  next.setHours(next.getHours() + 1);
  return next.toISOString();
}

function scheduleStatusFromAttempt(
  item: RestaurantAgentChannelScheduleRunItem,
): 'attempted' | 'blocked' | 'manual-ready' | 'forwarded' | 'waiting' {
  if (!item.attempt) return item.due ? 'attempted' : 'waiting';
  if (item.attempt.status === 'blocked') return 'blocked';
  if (item.attempt.status === 'manual-ready') return 'manual-ready';
  if (item.attempt.status === 'forwarded') return 'forwarded';
  return 'attempted';
}

export async function runRestaurantAgentChannelSchedule(input: RestaurantTrialIntake & {
  env?: EnvMap;
  fetcher?: typeof fetch;
  now?: Date;
  limit?: number;
  includeProviderGated?: boolean;
} = {}): Promise<RestaurantAgentChannelScheduleRun> {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, 'Trial restaurant');
  const offer = clean(input.offer, 'Today featured set meal');
  const hub = buildRestaurantAgentChannelHub({
    restaurant,
    offer,
    env: input.env,
    now,
  });
  const beforeReport = buildRestaurantAgentChannelDeliveryReport(now);
  const attemptsBefore = beforeReport.attempts;
  const candidateJobs = hub.scheduledJobs
    .filter(job => cadenceDue(job.cadence, now))
    .filter(job => input.includeProviderGated !== false || job.status !== 'provider-gated')
    .slice(0, Math.max(1, Math.min(input.limit || 4, 8)));

  const items: RestaurantAgentChannelScheduleRunItem[] = [];
  for (const job of candidateJobs) {
    const selectedChannel = channelForJob(job, hub);
    const result = await executeRestaurantAgentChannelDeliveryAttempt({
      restaurant,
      offer,
      channelId: selectedChannel,
      jobId: job.id,
      env: input.env,
      fetcher: input.fetcher,
      now,
    });
    items.push({
      jobId: job.id,
      title: job.title,
      cadence: job.cadence,
      due: true,
      selectedChannel,
      previousAttempts: previousAttemptsFor(job.id, attemptsBefore),
      retryRecommended: result.attempt.status === 'blocked' || result.attempt.status === 'failed',
      attempt: result.attempt,
      nextAction: result.attempt.nextAction,
    });
  }

  const notDueItems: RestaurantAgentChannelScheduleRunItem[] = hub.scheduledJobs
    .filter(job => !candidateJobs.some(item => item.id === job.id))
    .slice(0, 4)
    .map(job => ({
      jobId: job.id,
      title: job.title,
      cadence: job.cadence,
      due: cadenceDue(job.cadence, now),
      selectedChannel: channelForJob(job, hub),
      previousAttempts: previousAttemptsFor(job.id, attemptsBefore),
      retryRecommended: retryRecommendedFor(job.id, attemptsBefore),
      nextAction: cadenceDue(job.cadence, now)
        ? 'Due but skipped by this run limit; run the scheduler again or raise the limit.'
        : `Wait for cadence ${job.cadence}.`,
    } satisfies RestaurantAgentChannelScheduleRunItem));

  const allItems = [...items, ...notDueItems];
  const afterReport = buildRestaurantAgentChannelDeliveryReport(now);
  const attempted = items.map(item => item.attempt).filter(Boolean) as RestaurantAgentChannelDeliveryAttempt[];
  const recovery = attempted
    .filter(attempt => attempt.status === 'blocked' || attempt.status === 'failed')
    .map(attempt => ({
      jobId: attempt.jobId,
      reason: attempt.blockedReason || attempt.missing[0] || attempt.status,
      owner: attempt.status === 'failed' ? 'runtime-admin' as const : 'ops' as const,
      nextAction: attempt.nextAction,
    }));
  const operatorTimeline = allItems.map(item => {
    const job = hub.scheduledJobs.find(scheduledJob => scheduledJob.id === item.jobId);
    const missing = item.attempt?.missing || job?.externalRequired || [];
    return {
      id: item.jobId,
      status: scheduleStatusFromAttempt(item),
      owner: job?.owner || 'ops',
      channel: item.selectedChannel,
      signal: item.due ? `Due now: ${item.cadence}` : `Waiting: ${item.cadence}`,
      nextAction: item.nextAction,
      evidenceRequired: job?.evidenceRequired || [],
      externalGate: missing[0] || 'none',
    };
  });
  const blockedProviderGates = operatorTimeline.filter(item => item.status === 'blocked' || item.externalGate !== 'none').length;
  const internalActionsReady = operatorTimeline.filter(item => item.status === 'manual-ready' || item.status === 'forwarded' || item.externalGate === 'none').length;
  const verdict = attempted.some(item => item.status === 'failed')
    ? 'needs-recovery'
    : blockedProviderGates > 0
      ? 'internal-schedule-ran-provider-gated'
      : 'ready-for-staff-delivery';

  return {
    ok: true,
    payloadShape: 'restaurant-agent-channel-schedule-run-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    summary: {
      jobs: hub.scheduledJobs.length,
      dueJobs: candidateJobs.length,
      attempted: attempted.length,
      blocked: attempted.filter(item => item.status === 'blocked').length,
      manualReady: attempted.filter(item => item.status === 'manual-ready').length,
      forwarded: attempted.filter(item => item.status === 'forwarded').length,
      failed: attempted.filter(item => item.status === 'failed').length,
      retryRecommended: allItems.filter(item => item.retryRecommended).length,
    },
    acceptance: {
      verdict,
      canRunStaffSchedule: attempted.length > 0,
      canClaimAlwaysOnAutomation: false,
      internalActionsReady,
      blockedProviderGates,
      nextWakeupAt: nextWakeupAt(now),
      operatorCloseout: [
        attempted.length
          ? `${attempted.length} due staff jobs were converted into governed delivery attempts.`
          : 'No due staff job was attempted in this run window.',
        blockedProviderGates
          ? `${blockedProviderGates} provider gates still block real staff delivery or external automation claims.`
          : 'No provider gate blocked this staff schedule run.',
        'Keep customer outreach, private messages, coupon redemption and POS writes out of scope until signed provider callbacks are accepted.',
      ],
    },
    items: allItems,
    operatorTimeline,
    channelHub: {
      payloadShape: hub.payloadShape,
      summary: hub.summary,
      externalRequired: hub.externalRequired,
    },
    deliveryReport: afterReport,
    recovery,
    externalRequired: Array.from(new Set([
      ...hub.externalRequired,
      ...recovery.map(item => item.reason),
    ])).slice(0, 10),
    safetyBoundary: 'Channel schedule runner only turns due staff jobs into governed delivery attempts. It does not run forever, does not contact customers, does not bypass provider gates, does not expose secrets, and does not claim real publishing, redemption or operating impact without accepted evidence.',
  };
}

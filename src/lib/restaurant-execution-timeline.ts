import { buildRestaurantBusinessSignals, type RestaurantBusinessSignalReport } from '@/lib/restaurant-agent-business-signals';
import { buildRestaurantBrowserSessionHealth, type RestaurantBrowserSessionHealth, type RestaurantBrowserSessionRecord } from '@/lib/restaurant-agent-browser-session-store';
import { buildRestaurantExternalReadiness, type RestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantAgentHeartbeat, type RestaurantAgentHeartbeat } from '@/lib/restaurant-agent-heartbeat';
import { buildRestaurantAgentRecoveryPlan, type RestaurantAgentRecoveryAction, type RestaurantAgentRecoveryPlan } from '@/lib/restaurant-agent-recovery';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import { buildRestaurantRunHealth, type RestaurantRunHealth, type RestaurantRunHealthItem } from '@/lib/restaurant-agent-run-health';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantAgentWatcherPolicy, type RestaurantAgentWatcherPolicy, type RestaurantWatcherWakeup } from '@/lib/restaurant-agent-watcher-policy';

export type RestaurantExecutionTimelineStage = 'queued' | 'forwarded' | 'receipt' | 'business' | 'recovery' | 'watcher';

export type RestaurantExecutionTimelineItem = {
  id: string;
  eventId: string;
  stage: RestaurantExecutionTimelineStage;
  status: 'ready' | 'waiting' | 'accepted' | 'blocked' | 'rejected';
  restaurant: string;
  offer: string;
  owner: string;
  title: string;
  detail: string;
  evidence: string;
  nextAction: string;
  memoryWrite: string;
};

export type RestaurantExecutionTimeline = {
  ok: true;
  payloadShape: 'restaurant-execution-timeline-v1';
  generatedAt: string;
  mode: 'no-run' | 'local-watch' | 'waiting-receipt' | 'needs-recovery' | 'business-review';
  summary: {
    runs: number;
    acceptedReceipts: number;
    blockedRuns: number;
    waitingReceipt: number;
    watcherWakeups: number;
    businessSignals: number;
    recoveryActions: number;
    readyBrowserSessions: number;
    canAutoContinue: boolean;
  };
  items: RestaurantExecutionTimelineItem[];
  nextHeartbeat: Pick<RestaurantAgentHeartbeat, 'heartbeatId' | 'watchedRuns' | 'acceptedReceipts' | 'followups' | 'blockedExternal'>;
  watcherPolicy: Pick<RestaurantAgentWatcherPolicy, 'policyId' | 'summary' | 'wakeups' | 'memoryUpserts' | 'blockedExternal'>;
  runHealth: Pick<RestaurantRunHealth, 'summary' | 'operatorQueue'>;
  recovery: Pick<RestaurantAgentRecoveryPlan, 'actions' | 'retryPolicy' | 'blockedExternal'>;
  businessSignals: Pick<RestaurantBusinessSignalReport, 'summary' | 'items' | 'nextActions' | 'blockers'>;
  browserSessionHealth: Pick<RestaurantBrowserSessionHealth, 'summary'>;
  safetyBoundary: string;
};

function latestReceiptFor(run: RestaurantAgentRunRecord, receipts: RestaurantAgentReceiptRecord[]): RestaurantAgentReceiptRecord | undefined {
  return receipts
    .filter(receipt => receipt.eventId === run.eventId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
}

function recoveryFor(run: RestaurantAgentRunRecord, actions: RestaurantAgentRecoveryAction[]): RestaurantAgentRecoveryAction | undefined {
  return actions.find(action => action.eventId === run.eventId);
}

function wakeupFor(run: RestaurantAgentRunRecord, wakeups: RestaurantWatcherWakeup[]): RestaurantWatcherWakeup | undefined {
  return wakeups.find(wakeup => wakeup.eventId === run.eventId);
}

function healthFor(run: RestaurantAgentRunRecord, items: RestaurantRunHealthItem[]): RestaurantRunHealthItem | undefined {
  return items.find(item => item.eventId === run.eventId);
}

function stageFor(run: RestaurantAgentRunRecord, receipt?: RestaurantAgentReceiptRecord): RestaurantExecutionTimelineStage {
  if (receipt?.status === 'accepted') return receipt.businessSignals.reservationCount
    || receipt.businessSignals.couponClaimCount
    || receipt.businessSignals.redemptionCount
    || receipt.businessSignals.inquiryCount
    || receipt.businessSignals.visitIntentCount
    ? 'business'
    : 'receipt';
  if (receipt?.status === 'rejected') return 'recovery';
  if (run.status === 'blocked' || run.status === 'failed') return 'recovery';
  if (run.status === 'forwarded') return 'forwarded';
  return 'queued';
}

function statusFor(run: RestaurantAgentRunRecord, receipt?: RestaurantAgentReceiptRecord): RestaurantExecutionTimelineItem['status'] {
  if (receipt?.status === 'accepted') return 'accepted';
  if (receipt?.status === 'rejected') return 'rejected';
  if (run.status === 'blocked' || run.status === 'failed') return 'blocked';
  if (run.status === 'forwarded') return 'waiting';
  return 'waiting';
}

function timelineItem(input: {
  run: RestaurantAgentRunRecord;
  receipt?: RestaurantAgentReceiptRecord;
  health?: RestaurantRunHealthItem;
  recovery?: RestaurantAgentRecoveryAction;
  wakeup?: RestaurantWatcherWakeup;
}): RestaurantExecutionTimelineItem {
  const stage = stageFor(input.run, input.receipt);
  const status = statusFor(input.run, input.receipt);
  return {
    id: `timeline-${input.run.eventId}-${stage}`,
    eventId: input.run.eventId,
    stage,
    status,
    restaurant: input.run.restaurant,
    offer: input.run.offer,
    owner: input.wakeup?.owner || input.recovery?.owner || input.run.owner,
    title: `${input.run.restaurant} / ${input.run.offer}`,
    detail: input.receipt
      ? `${input.receipt.signalType} receipt ${input.receipt.status}; evidence ${input.receipt.evidenceLevel} / ${input.receipt.evidenceScore}.`
      : input.health?.nextAction || input.run.nextAction,
    evidence: input.receipt?.evidenceUrl || input.receipt?.screenshotId || input.receipt?.externalRunId || input.health?.evidenceRequired || input.run.evidenceRequired,
    nextAction: input.recovery?.nextStep || input.wakeup?.nextAction || input.health?.nextAction || input.run.nextAction,
    memoryWrite: input.wakeup?.memoryWrite || (input.receipt?.status === 'accepted'
      ? `${input.run.restaurant} / ${input.run.offer} confirmed receipt and signal summary.`
      : `${input.run.restaurant} / ${input.run.offer} waiting for proof.`),
  };
}

function modeFor(summary: RestaurantExecutionTimeline['summary']): RestaurantExecutionTimeline['mode'] {
  if (!summary.runs) return 'no-run';
  if (summary.blockedRuns) return 'needs-recovery';
  if (summary.waitingReceipt) return 'waiting-receipt';
  if (summary.businessSignals) return 'business-review';
  if (summary.recoveryActions > summary.acceptedReceipts) return 'needs-recovery';
  return 'local-watch';
}

export function buildRestaurantExecutionTimeline(input: {
  runs: RestaurantAgentRunRecord[];
  receipts?: RestaurantAgentReceiptRecord[];
  readiness?: RestaurantExternalReadiness;
  browserSessions?: RestaurantBrowserSessionRecord[];
  now?: Date;
}): RestaurantExecutionTimeline {
  const now = input.now || new Date();
  const receipts = input.receipts || [];
  const readiness = input.readiness || buildRestaurantExternalReadiness();
  const runHealth = buildRestaurantRunHealth(input.runs, receipts, readiness, now);
  const recovery = buildRestaurantAgentRecoveryPlan(input.runs, receipts, readiness, now);
  const watcherPolicy = buildRestaurantAgentWatcherPolicy({ runs: input.runs, receipts });
  const heartbeat = buildRestaurantAgentHeartbeat(input.runs, receipts);
  const businessSignals = buildRestaurantBusinessSignals(input.runs, receipts, now);
  const browserSessionHealth = buildRestaurantBrowserSessionHealth(input.browserSessions, now);
  const items = input.runs.slice(0, 10).map(run => timelineItem({
    run,
    receipt: latestReceiptFor(run, receipts),
    health: healthFor(run, runHealth.items),
    recovery: recoveryFor(run, recovery.actions),
    wakeup: wakeupFor(run, watcherPolicy.wakeups),
  }));

  if (!items.length) {
    const bootstrap = recovery.actions[0];
    items.push({
      id: 'timeline-bootstrap',
      eventId: 'no-run-yet',
      stage: 'queued',
      status: 'waiting',
      restaurant: '未创建门店任务',
      offer: '未创建活动',
      owner: bootstrap?.owner || '运营',
      title: 'Start first controlled trial run',
      detail: '还没有可监听的 run；先生成 Controlled Trial Run 或本地 Agent 任务。',
      evidence: bootstrap?.evidenceRequired || 'eventId, tenantId, worker payload',
      nextAction: bootstrap?.nextStep || 'Run Controlled Trial Run.',
      memoryWrite: 'bootstrap 状态，不写经营结论。',
    });
  }

  const summary = {
    runs: input.runs.length,
    acceptedReceipts: receipts.filter(receipt => receipt.status === 'accepted').length,
    blockedRuns: runHealth.summary.blockedAuth + runHealth.summary.failed,
    waitingReceipt: runHealth.summary.waitingReceipt,
    watcherWakeups: watcherPolicy.summary.wakeups,
    businessSignals: businessSignals.items.length,
    recoveryActions: recovery.actions.length,
    readyBrowserSessions: browserSessionHealth.summary.ready,
    canAutoContinue: false,
  };
  summary.canAutoContinue = summary.waitingReceipt > 0 && summary.readyBrowserSessions > 0 && readiness.summary.blocked === 0;

  return {
    ok: true,
    payloadShape: 'restaurant-execution-timeline-v1',
    generatedAt: now.toISOString(),
    mode: modeFor(summary),
    summary,
    items,
    nextHeartbeat: {
      heartbeatId: heartbeat.heartbeatId,
      watchedRuns: heartbeat.watchedRuns,
      acceptedReceipts: heartbeat.acceptedReceipts,
      followups: heartbeat.followups,
      blockedExternal: heartbeat.blockedExternal,
    },
    watcherPolicy: {
      policyId: watcherPolicy.policyId,
      summary: watcherPolicy.summary,
      wakeups: watcherPolicy.wakeups,
      memoryUpserts: watcherPolicy.memoryUpserts,
      blockedExternal: watcherPolicy.blockedExternal,
    },
    runHealth: {
      summary: runHealth.summary,
      operatorQueue: runHealth.operatorQueue,
    },
    recovery: {
      actions: recovery.actions,
      retryPolicy: recovery.retryPolicy,
      blockedExternal: recovery.blockedExternal,
    },
    businessSignals: {
      summary: businessSignals.summary,
      items: businessSignals.items,
      nextActions: businessSignals.nextActions,
      blockers: businessSignals.blockers,
    },
    browserSessionHealth: {
      summary: browserSessionHealth.summary,
    },
    safetyBoundary: 'Execution Timeline is a read-only control lane over local runs, receipts, watcher wakeups, recovery actions and aggregate business signals. It does not auto-publish, auto-redeem, read private messages, expose secrets, or treat simulated receipts as real platform results.',
  };
}

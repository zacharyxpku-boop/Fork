import { buildRestaurantBrowserRunnerEventHealth, type RestaurantBrowserRunnerEventHealth, type RestaurantBrowserRunnerEventRecord } from '@/lib/restaurant-agent-browser-runner-event-store';
import { buildRestaurantExternalReadiness, type RestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantAgentRecoveryPlan, type RestaurantAgentRecoveryPlan } from '@/lib/restaurant-agent-recovery';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantExecutionTimeline, type RestaurantExecutionTimeline } from '@/lib/restaurant-execution-timeline';
import { buildRestaurantProviderReceiptInbox, type RestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';

export type RestaurantRuntimeRunnerLoopStageId =
  | 'adapter-ready'
  | 'runner-started'
  | 'step-events'
  | 'final-callback'
  | 'receipt-accepted'
  | 'recovery-needed'
  | 'memory-followup';

export type RestaurantRuntimeRunnerLoopStage = {
  id: RestaurantRuntimeRunnerLoopStageId;
  status: 'ready' | 'waiting' | 'blocked' | 'complete';
  owner: 'runtime-admin' | 'provider' | 'ops' | 'store-manager';
  evidence: string[];
  nextAction: string;
};

export type RestaurantRuntimeRunnerLoopPack = {
  ok: true;
  payloadShape: 'restaurant-runtime-runner-loop-pack-v1';
  generatedAt: string;
  verdict: 'no-runner-yet' | 'waiting-final-callback' | 'needs-recovery' | 'receipt-closeout-ready' | 'memory-followup-ready';
  summary: {
    localRuns: number;
    externalRuns: number;
    runnerEvents: number;
    activeRunnerRuns: number;
    completedRunnerRuns: number;
    staleRunnerRuns: number;
    waitingReceipts: number;
    acceptedReceipts: number;
    recoveryActions: number;
    canContinueInternally: boolean;
    canClaimExternalAutomation: false;
  };
  stages: RestaurantRuntimeRunnerLoopStage[];
  nextBestAction: string;
  runnerEventHealth: Pick<RestaurantBrowserRunnerEventHealth, 'summary' | 'runs' | 'operatorQueue' | 'safetyBoundary'>;
  providerReceiptInbox: Pick<RestaurantProviderReceiptInbox, 'summary' | 'requests' | 'externalRequired' | 'safetyBoundary'>;
  executionTimeline: Pick<RestaurantExecutionTimeline, 'mode' | 'summary' | 'items' | 'safetyBoundary'>;
  recovery: Pick<RestaurantAgentRecoveryPlan, 'actions' | 'blockedExternal' | 'retryPolicy'>;
  externalRequired: string[];
  safetyBoundary: string;
};

function stage(input: RestaurantRuntimeRunnerLoopStage): RestaurantRuntimeRunnerLoopStage {
  return input;
}

function verdict(input: {
  runnerEvents: number;
  waitingReceipts: number;
  acceptedReceipts: number;
  recoveryActions: number;
  staleRunnerRuns: number;
}): RestaurantRuntimeRunnerLoopPack['verdict'] {
  if (input.acceptedReceipts) return 'memory-followup-ready';
  if (input.waitingReceipts) return 'waiting-final-callback';
  if (!input.runnerEvents) return 'no-runner-yet';
  if (input.recoveryActions || input.staleRunnerRuns) return 'needs-recovery';
  return 'receipt-closeout-ready';
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).slice(0, 12);
}

export function buildRestaurantRuntimeRunnerLoopPack(input: {
  runs: RestaurantAgentRunRecord[];
  receipts?: RestaurantAgentReceiptRecord[];
  runnerEvents?: RestaurantBrowserRunnerEventRecord[];
  readiness?: RestaurantExternalReadiness;
  now?: Date;
}): RestaurantRuntimeRunnerLoopPack {
  const now = input.now || new Date();
  const receipts = input.receipts || [];
  const runnerEvents = input.runnerEvents || [];
  const readiness = input.readiness || buildRestaurantExternalReadiness();
  const runnerEventHealth = buildRestaurantBrowserRunnerEventHealth(runnerEvents, now);
  const providerReceiptInbox = buildRestaurantProviderReceiptInbox({
    runs: input.runs,
    receipts,
    readiness,
    now,
  });
  const recovery = buildRestaurantAgentRecoveryPlan(input.runs, receipts, readiness, now);
  const executionTimeline = buildRestaurantExecutionTimeline({
    runs: input.runs,
    receipts,
    readiness,
    now,
  });

  const externalRuns = input.runs.filter(run => run.target !== 'local').length;
  const waitingReceipts = providerReceiptInbox.summary.waitingReceipt;
  const acceptedReceipts = providerReceiptInbox.summary.accepted;
  const recoveryActions = recovery.actions.length + runnerEventHealth.operatorQueue.length;
  const stages = [
    stage({
      id: 'adapter-ready',
      status: readiness.summary.blocked === 0 && externalRuns > 0 ? 'ready' : 'blocked',
      owner: 'runtime-admin',
      evidence: [`externalRuns:${externalRuns}`, `readinessBlocked:${readiness.summary.blocked}`],
      nextAction: readiness.summary.blocked === 0 ? 'Keep runtime health, callback secret and merchant authorization under preflight.' : 'Finish runtime key, callback secret, isolated browser profile and merchant authorization gates.',
    }),
    stage({
      id: 'runner-started',
      status: runnerEventHealth.summary.totalEvents ? 'complete' : 'waiting',
      owner: 'provider',
      evidence: [`events:${runnerEventHealth.summary.totalEvents}`, `active:${runnerEventHealth.summary.activeRuns}`],
      nextAction: runnerEventHealth.summary.totalEvents ? 'Continue watching sanitized runner events until final callback.' : 'Ask OpenClaw/Hermes runner to emit run-started and step-completed events with sanitized evidence.',
    }),
    stage({
      id: 'step-events',
      status: runnerEventHealth.summary.rejected || runnerEventHealth.summary.staleRuns ? 'blocked' : runnerEventHealth.summary.activeRuns ? 'ready' : 'waiting',
      owner: 'provider',
      evidence: [`accepted:${runnerEventHealth.summary.accepted}`, `rejected:${runnerEventHealth.summary.rejected}`, `stale:${runnerEventHealth.summary.staleRuns}`],
      nextAction: runnerEventHealth.operatorQueue[0]?.nextAction || 'Keep appending sanitized step-completed events; reject private messages, cookies, tokens and raw customer data.',
    }),
    stage({
      id: 'final-callback',
      status: waitingReceipts ? 'waiting' : runnerEventHealth.summary.completedRuns ? 'ready' : 'waiting',
      owner: 'provider',
      evidence: [`completedRunnerRuns:${runnerEventHealth.summary.completedRuns}`, `waitingReceipts:${waitingReceipts}`],
      nextAction: waitingReceipts ? 'Send signed external-receipt callback or public proof receipt for each waiting run.' : 'Use signed callback only; provider submit alone is not proof.',
    }),
    stage({
      id: 'receipt-accepted',
      status: acceptedReceipts ? 'complete' : 'waiting',
      owner: 'ops',
      evidence: [`acceptedReceipts:${acceptedReceipts}`, `receiptRejected:${providerReceiptInbox.summary.receiptRejected}`],
      nextAction: acceptedReceipts ? 'Move accepted receipts into post-run review and store-manager follow-up.' : 'Accept only public proof URL, screenshot id or externalRunId with sanitized aggregate signal summary.',
    }),
    stage({
      id: 'recovery-needed',
      status: recoveryActions ? 'blocked' : 'ready',
      owner: 'ops',
      evidence: [`recoveryActions:${recoveryActions}`, `blockedExternal:${recovery.blockedExternal.length}`],
      nextAction: recovery.actions[0]?.nextStep || runnerEventHealth.operatorQueue[0]?.nextAction || 'No recovery action is open; keep the runner loop in watch mode.',
    }),
    stage({
      id: 'memory-followup',
      status: acceptedReceipts ? 'ready' : 'waiting',
      owner: 'store-manager',
      evidence: [`timelineMode:${executionTimeline.mode}`, `timelineItems:${executionTimeline.items.length}`],
      nextAction: acceptedReceipts ? 'Write accepted proof summary into store memory and assign next local follow-up owner.' : 'Do not write growth claims; wait for accepted receipt evidence.',
    }),
  ];

  const summary = {
    localRuns: input.runs.filter(run => run.target === 'local').length,
    externalRuns,
    runnerEvents: runnerEventHealth.summary.totalEvents,
    activeRunnerRuns: runnerEventHealth.summary.activeRuns,
    completedRunnerRuns: runnerEventHealth.summary.completedRuns,
    staleRunnerRuns: runnerEventHealth.summary.staleRuns,
    waitingReceipts,
    acceptedReceipts,
    recoveryActions,
    canContinueInternally: runnerEventHealth.summary.totalEvents > 0 && recoveryActions === 0,
    canClaimExternalAutomation: false as const,
  };
  const nextBestAction = stages.find(item => item.status === 'blocked')?.nextAction
    || stages.find(item => item.status === 'waiting')?.nextAction
    || stages.find(item => item.status === 'ready')?.nextAction
    || 'Loop is closed; prepare next restaurant operating run.';

  return {
    ok: true,
    payloadShape: 'restaurant-runtime-runner-loop-pack-v1',
    generatedAt: now.toISOString(),
    verdict: verdict({
      runnerEvents: summary.runnerEvents,
      waitingReceipts: summary.waitingReceipts,
      acceptedReceipts: summary.acceptedReceipts,
      recoveryActions: summary.recoveryActions,
      staleRunnerRuns: summary.staleRunnerRuns,
    }),
    summary,
    stages,
    nextBestAction,
    runnerEventHealth: {
      summary: runnerEventHealth.summary,
      runs: runnerEventHealth.runs,
      operatorQueue: runnerEventHealth.operatorQueue,
      safetyBoundary: runnerEventHealth.safetyBoundary,
    },
    providerReceiptInbox: {
      summary: providerReceiptInbox.summary,
      requests: providerReceiptInbox.requests,
      externalRequired: providerReceiptInbox.externalRequired,
      safetyBoundary: providerReceiptInbox.safetyBoundary,
    },
    executionTimeline: {
      mode: executionTimeline.mode,
      summary: executionTimeline.summary,
      items: executionTimeline.items,
      safetyBoundary: executionTimeline.safetyBoundary,
    },
    recovery: {
      actions: recovery.actions,
      blockedExternal: recovery.blockedExternal,
      retryPolicy: recovery.retryPolicy,
    },
    externalRequired: unique([
      ...providerReceiptInbox.externalRequired,
      ...recovery.blockedExternal,
      ...stages.filter(item => item.status === 'blocked').map(item => item.nextAction),
    ]),
    safetyBoundary: 'Runtime Runner Loop Pack is a read-only operations layer over runner step events, signed callback expectations, receipt inbox, recovery and memory follow-up. It does not auto-publish, auto-acquire customers, auto-redeem coupons, read private messages, expose secrets, or claim production automation without provider health, merchant authorization and accepted public/signed receipts.',
  };
}

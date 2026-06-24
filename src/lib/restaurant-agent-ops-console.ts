import { buildRestaurantBusinessSignals, type RestaurantBusinessSignalReport } from '@/lib/restaurant-agent-business-signals';
import { buildRestaurantBrowserSessionHealth, type RestaurantBrowserSessionHealth, type RestaurantBrowserSessionRecord } from '@/lib/restaurant-agent-browser-session-store';
import { buildRestaurantExternalReadiness, type RestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantAgentRecoveryPlan, type RestaurantAgentRecoveryPlan } from '@/lib/restaurant-agent-recovery';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import { buildRestaurantRunHealth, type RestaurantRunHealth, type RestaurantRunHealthItem } from '@/lib/restaurant-agent-run-health';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantAgentWatcherPolicy, type RestaurantAgentWatcherPolicy } from '@/lib/restaurant-agent-watcher-policy';

export type RestaurantAgentOpsConsoleStage =
  | 'queued'
  | 'forwarded'
  | 'receipt'
  | 'watcher'
  | 'business'
  | 'recovery';

export type RestaurantAgentOpsConsoleTimelineItem = {
  stage: RestaurantAgentOpsConsoleStage;
  status: 'ready' | 'waiting' | 'blocked' | 'accepted' | 'rejected';
  eventId: string;
  owner: string;
  title: string;
  detail: string;
  evidence: string;
};

export type RestaurantAgentOpsConsole = {
  ok: true;
  generatedAt: string;
  summary: {
    runs: number;
    acceptedReceipts: number;
    rejectedReceipts: number;
    waitingReceipt: number;
    blockedRuns: number;
    recoveryActions: number;
    watcherWakeups: number;
    businessSignals: number;
    readyBrowserSessions: number;
    blockedExternalGroups: number;
  };
  timeline: RestaurantAgentOpsConsoleTimelineItem[];
  runHealth: RestaurantRunHealth;
  recovery: RestaurantAgentRecoveryPlan;
  watcherPolicy: RestaurantAgentWatcherPolicy;
  businessSignals: RestaurantBusinessSignalReport;
  browserSessionHealth: RestaurantBrowserSessionHealth;
  readiness: RestaurantExternalReadiness;
  blockedExternal: string[];
  safetyBoundary: string;
};

function latestReceiptFor(eventId: string, receipts: RestaurantAgentReceiptRecord[]): RestaurantAgentReceiptRecord | undefined {
  return receipts
    .filter(receipt => receipt.eventId === eventId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
}

function timelineFromRun(item: RestaurantRunHealthItem, receipts: RestaurantAgentReceiptRecord[]): RestaurantAgentOpsConsoleTimelineItem {
  const receipt = latestReceiptFor(item.eventId, receipts);
  if (item.state === 'accepted') {
    return {
      stage: 'receipt',
      status: 'accepted',
      eventId: item.eventId,
      owner: item.owner,
      title: `${item.restaurant} / ${item.offer}`,
      detail: `回执已验收，证据 ${item.evidenceLevel || 'unscored'} / ${item.evidenceScore ?? 0}。`,
      evidence: receipt?.evidenceUrl || receipt?.screenshotId || receipt?.externalRunId || item.evidenceRequired,
    };
  }
  if (item.state === 'receipt-rejected') {
    return {
      stage: 'receipt',
      status: 'rejected',
      eventId: item.eventId,
      owner: item.owner,
      title: `${item.restaurant} / ${item.offer}`,
      detail: item.nextAction,
      evidence: receipt?.rejectedReason || 'receipt rejected',
    };
  }
  if (item.state === 'blocked-auth' || item.state === 'failed') {
    return {
      stage: 'recovery',
      status: 'blocked',
      eventId: item.eventId,
      owner: item.owner,
      title: `${item.target} execution blocked`,
      detail: item.nextAction,
      evidence: item.evidenceRequired,
    };
  }
  if (item.state === 'waiting-receipt') {
    return {
      stage: 'forwarded',
      status: 'waiting',
      eventId: item.eventId,
      owner: item.owner,
      title: `${item.target} runtime 已接收`,
      detail: item.nextAction,
      evidence: item.evidenceRequired,
    };
  }
  return {
    stage: 'queued',
    status: 'waiting',
    eventId: item.eventId,
    owner: item.owner,
    title: `${item.taskId} 本地队列`,
    detail: item.nextAction,
    evidence: item.evidenceRequired,
  };
}

function browserTimeline(sessions: RestaurantBrowserSessionRecord[]): RestaurantAgentOpsConsoleTimelineItem[] {
  return sessions.slice(0, 2).map(session => ({
    stage: 'forwarded',
    status: session.status === 'ready' ? 'ready' : session.status === 'expired' ? 'blocked' : 'waiting',
    eventId: session.eventId,
    owner: session.status === 'ready' ? 'operator' : 'tech',
    title: `${session.runtimeTarget} browser session ${session.status}`,
    detail: session.nextAction,
    evidence: `${session.allowedTools}/${session.allowedTools + session.blockedTools} tools; ${session.blockedReasons.join(' / ') || 'ready'}`,
  }));
}

export function buildRestaurantAgentOpsConsole(input: {
  runs: RestaurantAgentRunRecord[];
  receipts: RestaurantAgentReceiptRecord[];
  readiness?: RestaurantExternalReadiness;
  browserSessions?: RestaurantBrowserSessionRecord[];
  now?: Date;
}): RestaurantAgentOpsConsole {
  const now = input.now || new Date();
  const readiness = input.readiness || buildRestaurantExternalReadiness();
  const runHealth = buildRestaurantRunHealth(input.runs, input.receipts, readiness, now);
  const recovery = buildRestaurantAgentRecoveryPlan(input.runs, input.receipts, readiness, now);
  const watcherPolicy = buildRestaurantAgentWatcherPolicy({ runs: input.runs, receipts: input.receipts });
  const businessSignals = buildRestaurantBusinessSignals(input.runs, input.receipts, now);
  const browserSessionHealth = buildRestaurantBrowserSessionHealth(input.browserSessions, now);
  const timeline = [
    ...runHealth.items.slice(0, 6).map(item => timelineFromRun(item, input.receipts)),
    ...browserTimeline(browserSessionHealth.sessions),
    ...watcherPolicy.wakeups.slice(0, 2).map(wakeup => ({
      stage: 'watcher' as const,
      status: wakeup.priority === 'high' ? 'blocked' as const : 'waiting' as const,
      eventId: wakeup.eventId,
      owner: wakeup.owner,
      title: `watcher ${wakeup.priority}`,
      detail: wakeup.nextAction,
      evidence: wakeup.evidenceRequired,
    })),
  ].slice(0, 10);

  return {
    ok: true,
    generatedAt: now.toISOString(),
    summary: {
      runs: input.runs.length,
      acceptedReceipts: input.receipts.filter(receipt => receipt.status === 'accepted').length,
      rejectedReceipts: input.receipts.filter(receipt => receipt.status === 'rejected').length,
      waitingReceipt: runHealth.summary.waitingReceipt,
      blockedRuns: runHealth.summary.blockedAuth + runHealth.summary.failed,
      recoveryActions: recovery.actions.length,
      watcherWakeups: watcherPolicy.summary.wakeups,
      businessSignals: businessSignals.items.length,
      readyBrowserSessions: browserSessionHealth.summary.ready,
      blockedExternalGroups: readiness.summary.blocked,
    },
    timeline,
    runHealth,
    recovery,
    watcherPolicy,
    businessSignals,
    browserSessionHealth,
    readiness,
    blockedExternal: Array.from(new Set([
      ...recovery.blockedExternal,
      ...watcherPolicy.blockedExternal,
      ...businessSignals.blockers,
      ...readiness.groups.filter(group => group.status === 'blocked').map(group => group.nextAction),
    ])).slice(0, 10),
    safetyBoundary: 'Agent Ops Console 只聚合本地 run、授权状态、浏览器 session 摘要、签名/手工回执和脱敏经营信号；不登录平台、不代发、不读取私信、不展示 API key/cookie/token/POS 明细或个人联系方式。',
  };
}

import type { RestaurantBrowserGatewayPack } from '@/lib/restaurant-browser-gateway-pack';
import type { RestaurantBrowserRunnerEventHealth, RestaurantBrowserRunnerEventRecord } from '@/lib/restaurant-agent-browser-runner-event-store';
import type { RestaurantProviderLiveRunGate } from '@/lib/restaurant-provider-live-run-gate';
import type { RestaurantProviderLiveRunLaunchAttempt } from '@/lib/restaurant-provider-live-run-launch-attempt';

export type RestaurantRunnerMissionTimeline = {
  ok: true;
  payloadShape: 'restaurant-runner-mission-timeline-v1';
  generatedAt: string;
  missionId: string;
  verdict: 'live-running' | 'waiting-receipt' | 'blocked-needs-owner' | 'planned-simulator' | 'complete-ready-closeout';
  summary: {
    timelineItems: number;
    liveEvents: number;
    plannedSteps: number;
    blockedItems: number;
    staleRuns: number;
    completedRuns: number;
    canClaimExternalAutomation: false;
  };
  mission: {
    providerTarget: string;
    gatewayId: string;
    packageId: string;
    launchVerdict: RestaurantProviderLiveRunLaunchAttempt['verdict'];
    runMustStayOpenUntilReceipt: boolean;
  };
  timeline: Array<{
    id: string;
    order: number;
    source: 'runner-event' | 'planned-runbook' | 'launch-gate' | 'receipt-closeout';
    status: 'done' | 'running' | 'waiting' | 'blocked' | 'rejected';
    title: string;
    owner: 'provider' | 'runtime-admin' | 'ops' | 'store-manager';
    evidence: string[];
    nextAction: string;
    stopLine: string;
    occurredAt?: string;
  }>;
  operatorQueue: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    owner: 'provider' | 'runtime-admin' | 'ops' | 'store-manager';
    reason: string;
    nextAction: string;
  }>;
  externalRequired: string[];
  safetyBoundary: string;
};

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 53 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function unique(values: string[], limit = 14): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function eventStatus(event: RestaurantBrowserRunnerEventRecord): RestaurantRunnerMissionTimeline['timeline'][number]['status'] {
  if (event.status === 'rejected') return 'rejected';
  if (event.status === 'blocked') return 'blocked';
  if (event.type === 'run-completed') return 'done';
  return 'running';
}

function titleForEvent(event: RestaurantBrowserRunnerEventRecord): string {
  if (event.type === 'run-started') return 'Runner started';
  if (event.type === 'step-completed') return `Step completed${event.stepId ? `: ${event.stepId}` : ''}`;
  if (event.type === 'step-blocked') return `Step blocked${event.stepId ? `: ${event.stepId}` : ''}`;
  if (event.type === 'run-failed') return 'Runner failed';
  return 'Runner completed';
}

function verdictFor(input: {
  launch: RestaurantProviderLiveRunLaunchAttempt;
  health: RestaurantBrowserRunnerEventHealth;
}): RestaurantRunnerMissionTimeline['verdict'] {
  if (input.launch.verdict === 'already-closeout-ready' || input.health.summary.completedRuns > 0) return 'complete-ready-closeout';
  if (input.launch.verdict === 'already-waiting-receipt') return 'waiting-receipt';
  if (input.health.summary.rejected > 0 || input.health.summary.staleRuns > 0 || input.launch.verdict === 'blocked-before-launch') return 'blocked-needs-owner';
  if (input.health.summary.activeRuns > 0 || input.launch.summary.canForwardNow) return 'live-running';
  return 'planned-simulator';
}

export function buildRestaurantRunnerMissionTimeline(input: {
  browserGatewayPack: RestaurantBrowserGatewayPack;
  runnerEvents: RestaurantBrowserRunnerEventRecord[];
  runnerEventHealth: RestaurantBrowserRunnerEventHealth;
  providerLiveRunGate: RestaurantProviderLiveRunGate;
  providerLiveRunLaunchAttempt: RestaurantProviderLiveRunLaunchAttempt;
  now?: Date;
}): RestaurantRunnerMissionTimeline {
  const now = input.now || new Date();
  const launch = input.providerLiveRunLaunchAttempt;
  const missionId = `restaurant-runner-mission-${stableId([
    input.providerLiveRunGate.selectedRun.packageId,
    input.providerLiveRunGate.selectedRun.gatewayId,
    launch.verdict,
  ])}`;
  const eventItems = input.runnerEvents.slice(0, 8).map((event, index) => ({
    id: event.runnerEventId,
    order: index + 1,
    source: 'runner-event' as const,
    status: eventStatus(event),
    title: titleForEvent(event),
    owner: event.status === 'blocked' || event.status === 'rejected' ? 'ops' as const : 'provider' as const,
    evidence: [event.evidenceSummary, event.externalRunId, event.stepId || 'run'].filter(Boolean),
    nextAction: event.nextAction,
    stopLine: event.blockedReason || 'Continue only through governed runner event and signed receipt rules.',
    occurredAt: event.occurredAt,
  }));

  const plannedItems = eventItems.length ? [] : input.browserGatewayPack.actionSchema.slice(0, 6).map((action, index) => ({
    id: `planned-${action.action}`,
    order: index + 1,
    source: 'planned-runbook' as const,
    status: action.allowed ? 'waiting' as const : 'blocked' as const,
    title: action.action,
    owner: action.owner === 'provider' ? 'provider' as const : action.owner === 'runtime-admin' ? 'runtime-admin' as const : 'ops' as const,
    evidence: action.requiredEvidence.slice(0, 4),
    nextAction: action.allowed ? 'Run this step only after launch gate is ready.' : input.browserGatewayPack.externalRequired[0] || 'Resolve browser gateway setup first.',
    stopLine: action.stopIf.slice(0, 3).join(' / ') || 'Stop and hand off on unsafe browser state.',
  }));

  const gateItem = {
    id: 'launch-decision',
    order: 0,
    source: 'launch-gate' as const,
    status: launch.summary.canForwardNow ? 'running' as const : launch.verdict === 'already-closeout-ready' ? 'done' as const : 'blocked' as const,
    title: 'Launch decision',
    owner: launch.operatorDecision.owner === 'merchant' || launch.operatorDecision.owner === 'data-ops' ? 'ops' as const : launch.operatorDecision.owner,
    evidence: launch.operatorDecision.evidenceRequired.slice(0, 4),
    nextAction: launch.operatorDecision.primaryAction,
    stopLine: launch.operatorDecision.stopLine,
  };

  const receiptItem = {
    id: 'signed-receipt-closeout',
    order: eventItems.length + plannedItems.length + 2,
    source: 'receipt-closeout' as const,
    status: input.providerLiveRunGate.summary.receiptAccepted ? 'done' as const : input.providerLiveRunGate.summary.receiptWaiting ? 'waiting' as const : 'blocked' as const,
    title: 'Signed receipt closeout',
    owner: 'store-manager' as const,
    evidence: input.providerLiveRunGate.firstLiveAction.acceptedResult,
    nextAction: input.providerLiveRunGate.summary.receiptAccepted
      ? 'Close post-run review and train the next run from accepted proof.'
      : input.providerLiveRunGate.summary.receiptWaiting
        ? 'Wait for signed callback or escalate stale runner activity.'
        : 'Do not close mission until public proof or sanitized aggregate receipt is accepted.',
    stopLine: 'No next-run memory or automation claim from pending, unsigned or rejected proof.',
  };

  const timeline = [gateItem, ...eventItems, ...plannedItems, receiptItem]
    .sort((left, right) => left.order - right.order)
    .map((item, index) => ({ ...item, order: index + 1 }));
  const operatorQueue = [
    ...input.runnerEventHealth.operatorQueue.map(item => ({
      priority: item.priority,
      owner: 'ops' as const,
      reason: item.reason,
      nextAction: item.nextAction,
    })),
    ...(launch.summary.canForwardNow ? [] : [{
      priority: launch.verdict === 'blocked-before-launch' ? 'high' as const : 'medium' as const,
      owner: launch.operatorDecision.owner === 'merchant' || launch.operatorDecision.owner === 'data-ops' ? 'ops' as const : launch.operatorDecision.owner,
      reason: launch.operatorDecision.blockedBy || launch.verdict,
      nextAction: launch.operatorDecision.primaryAction,
    }]),
  ].slice(0, 8);

  return {
    ok: true,
    payloadShape: 'restaurant-runner-mission-timeline-v1',
    generatedAt: now.toISOString(),
    missionId,
    verdict: verdictFor({ launch, health: input.runnerEventHealth }),
    summary: {
      timelineItems: timeline.length,
      liveEvents: eventItems.length,
      plannedSteps: plannedItems.length,
      blockedItems: timeline.filter(item => item.status === 'blocked' || item.status === 'rejected').length,
      staleRuns: input.runnerEventHealth.summary.staleRuns,
      completedRuns: input.runnerEventHealth.summary.completedRuns,
      canClaimExternalAutomation: false,
    },
    mission: {
      providerTarget: input.providerLiveRunGate.selectedRun.providerTarget,
      gatewayId: input.providerLiveRunGate.selectedRun.gatewayId,
      packageId: input.providerLiveRunGate.selectedRun.packageId,
      launchVerdict: launch.verdict,
      runMustStayOpenUntilReceipt: launch.summary.runMustStayOpenUntilReceipt,
    },
    timeline,
    operatorQueue,
    externalRequired: unique([
      ...input.providerLiveRunGate.externalRequired,
      ...launch.externalRequired,
      ...input.browserGatewayPack.externalRequired,
      ...operatorQueue.map(item => item.nextAction),
    ], 18),
    safetyBoundary: 'Runner Mission Timeline is a customer-visible execution现场 view built from launch gates, sanitized runner events and receipt closeout state. It does not run browsers, publish content, contact customers, redeem coupons, expose secrets, read private messages, store raw browser profile data or claim production automation without accepted signed receipts.',
  };
}

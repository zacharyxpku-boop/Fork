import { appendRestaurantAgentLedgerEntry, clearRestaurantAgentLedgerKindForTest, listRestaurantAgentLedgerEntries } from '@/lib/restaurant-agent-ledger-store';
import type { RestaurantBrowserRunnerEventType } from '@/lib/restaurant-agent-browser-runner-contract';
import type { RestaurantBrowserRuntimeTarget } from '@/lib/restaurant-agent-browser-session';

export type RestaurantBrowserRunnerEventStatus = 'accepted' | 'blocked' | 'rejected';

export type RestaurantBrowserRunnerEventInput = {
  eventId?: string;
  runbookId?: string;
  runtimeTarget?: RestaurantBrowserRuntimeTarget;
  externalRunId?: string;
  stepId?: string;
  type?: RestaurantBrowserRunnerEventType;
  evidenceSummary?: string;
  blockedReason?: string;
  nextAction?: string;
  occurredAt?: string;
};

export type RestaurantBrowserRunnerEventRecord = {
  runnerEventId: string;
  eventId: string;
  runbookId: string;
  runtimeTarget: RestaurantBrowserRuntimeTarget;
  externalRunId: string;
  stepId?: string;
  type: RestaurantBrowserRunnerEventType;
  status: RestaurantBrowserRunnerEventStatus;
  evidenceSummary: string;
  blockedReason?: string;
  retryable: boolean;
  nextAction: string;
  validationWarnings: string[];
  occurredAt: string;
  createdAt: string;
};

export type RestaurantBrowserRunnerEventHealth = {
  ok: true;
  payloadShape: 'restaurant-browser-runner-event-health-v1';
  summary: {
    totalEvents: number;
    accepted: number;
    blocked: number;
    rejected: number;
    activeRuns: number;
    completedRuns: number;
    staleRuns: number;
  };
  runs: Array<{
    eventId: string;
    externalRunId: string;
    runtimeTarget: RestaurantBrowserRuntimeTarget;
    latestType: RestaurantBrowserRunnerEventType;
    latestStatus: RestaurantBrowserRunnerEventStatus;
    latestAt: string;
    eventCount: number;
    nextAction: string;
  }>;
  operatorQueue: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    eventId: string;
    externalRunId: string;
    reason: string;
    nextAction: string;
  }>;
  safetyBoundary: string;
};

const memoryEvents: RestaurantBrowserRunnerEventRecord[] = [];
const MAX_EVENTS = 80;

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 43 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function cleanText(value: unknown, fallback: string, max = 160): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function cleanRuntime(value: unknown): RestaurantBrowserRuntimeTarget {
  return value === 'hermes' ? 'hermes' : 'openclaw';
}

function cleanEventType(value: unknown): RestaurantBrowserRunnerEventType {
  return value === 'run-started'
    || value === 'step-completed'
    || value === 'step-blocked'
    || value === 'run-failed'
    || value === 'run-completed'
    ? value
    : 'step-blocked';
}

function looksSensitive(text: string): boolean {
  return /private message raw|cookie|token|api key|password|sms code|wechat id|phone number|\b1[3-9]\d{9}\b/i.test(text);
}

function warningsFor(input: {
  eventId: string;
  externalRunId: string;
  type: RestaurantBrowserRunnerEventType;
  evidenceSummary: string;
  blockedReason: string;
}): string[] {
  return [
    input.eventId === 'unknown-event' ? 'missing_event_id' : '',
    input.externalRunId === 'unknown-external-run' ? 'missing_external_run_id' : '',
    input.type === 'run-completed' && !input.evidenceSummary ? 'missing_final_evidence_summary' : '',
    looksSensitive(`${input.evidenceSummary} ${input.blockedReason}`) ? 'contains_sensitive_or_private_content' : '',
  ].filter(Boolean);
}

function statusFor(type: RestaurantBrowserRunnerEventType, warnings: string[]): RestaurantBrowserRunnerEventStatus {
  if (warnings.includes('contains_sensitive_or_private_content')) return 'rejected';
  if (type === 'step-blocked' || type === 'run-failed') return 'blocked';
  if (warnings.length) return 'rejected';
  return 'accepted';
}

function retryableFor(type: RestaurantBrowserRunnerEventType, status: RestaurantBrowserRunnerEventStatus): boolean {
  if (status === 'rejected') return false;
  return type === 'run-failed';
}

function isRunnerEventRecord(value: unknown): value is RestaurantBrowserRunnerEventRecord {
  const record = value as RestaurantBrowserRunnerEventRecord;
  return Boolean(
    record &&
    typeof record.runnerEventId === 'string' &&
    typeof record.eventId === 'string' &&
    typeof record.externalRunId === 'string' &&
    typeof record.type === 'string' &&
    typeof record.status === 'string' &&
    typeof record.createdAt === 'string',
  );
}

function dedupeEvents(records: RestaurantBrowserRunnerEventRecord[]): RestaurantBrowserRunnerEventRecord[] {
  const seen = new Set<string>();
  return records
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .filter(record => {
      if (seen.has(record.runnerEventId)) return false;
      seen.add(record.runnerEventId);
      return true;
    })
    .slice(0, MAX_EVENTS);
}

export function recordRestaurantBrowserRunnerEvent(input: RestaurantBrowserRunnerEventInput, now = new Date()): RestaurantBrowserRunnerEventRecord {
  const eventId = cleanText(input.eventId, 'unknown-event', 96);
  const runbookId = cleanText(input.runbookId, 'unknown-runbook', 120);
  const runtimeTarget = cleanRuntime(input.runtimeTarget);
  const externalRunId = cleanText(input.externalRunId, 'unknown-external-run', 96);
  const stepId = cleanText(input.stepId, '', 120) || undefined;
  const type = cleanEventType(input.type);
  const rawEvidenceSummary = cleanText(input.evidenceSummary, '', 180);
  const rawBlockedReason = cleanText(input.blockedReason, '', 180);
  const validationWarnings = warningsFor({
    eventId,
    externalRunId,
    type,
    evidenceSummary: rawEvidenceSummary,
    blockedReason: rawBlockedReason,
  });
  const status = statusFor(type, validationWarnings);
  const evidenceSummary = validationWarnings.includes('contains_sensitive_or_private_content')
    ? 'Runner event rejected because it contains private or sensitive content.'
    : rawEvidenceSummary;
  const blockedReason = validationWarnings.includes('contains_sensitive_or_private_content')
    ? 'runner_event_contains_sensitive_or_private_content'
    : rawBlockedReason || undefined;
  const retryable = retryableFor(type, status);
  const nextAction = status === 'rejected'
    ? 'Discard private/sensitive payload and ask the runner or operator for a sanitized event summary.'
    : cleanText(input.nextAction, type === 'run-completed' ? 'Await final signed external-receipt validation.' : 'Continue governed runner workflow.', 180);
  const occurredAt = cleanText(input.occurredAt, now.toISOString(), 40);

  const record: RestaurantBrowserRunnerEventRecord = {
    runnerEventId: `restaurant-runner-event-${stableId([eventId, externalRunId, stepId || 'run', type, occurredAt])}`,
    eventId,
    runbookId,
    runtimeTarget,
    externalRunId,
    stepId,
    type,
    status,
    evidenceSummary,
    blockedReason,
    retryable,
    nextAction,
    validationWarnings,
    occurredAt,
    createdAt: now.toISOString(),
  };

  const previousIndex = memoryEvents.findIndex(item => item.runnerEventId === record.runnerEventId);
  if (previousIndex >= 0) memoryEvents.splice(previousIndex, 1);
  memoryEvents.unshift(record);
  memoryEvents.splice(MAX_EVENTS);
  appendRestaurantAgentLedgerEntry('browser-runner-event', record, now);
  return record;
}

export function listRestaurantBrowserRunnerEvents(): RestaurantBrowserRunnerEventRecord[] {
  const ledgerEvents = listRestaurantAgentLedgerEntries<RestaurantBrowserRunnerEventRecord>('browser-runner-event')
    .map(entry => entry.payload)
    .filter(isRunnerEventRecord);

  return dedupeEvents([...memoryEvents, ...ledgerEvents]);
}

export function buildRestaurantBrowserRunnerEventHealth(events = listRestaurantBrowserRunnerEvents(), now = new Date()): RestaurantBrowserRunnerEventHealth {
  const byRun = new Map<string, RestaurantBrowserRunnerEventRecord[]>();
  for (const event of events) {
    const key = `${event.eventId}:${event.externalRunId}`;
    byRun.set(key, [...(byRun.get(key) || []), event]);
  }

  const runs = Array.from(byRun.values()).map(group => {
    const ordered = group.sort((left, right) => right.createdAt.localeCompare(left.createdAt));
    const latest = ordered[0];
    const ageMinutes = Math.max(0, Math.floor((now.getTime() - Date.parse(latest.createdAt)) / 60000));
    const stale = latest.type !== 'run-completed' && latest.status === 'accepted' && ageMinutes >= 30;
    return {
      eventId: latest.eventId,
      externalRunId: latest.externalRunId,
      runtimeTarget: latest.runtimeTarget,
      latestType: latest.type,
      latestStatus: latest.status,
      latestAt: latest.createdAt,
      eventCount: ordered.length,
      nextAction: stale ? 'Runner has no fresh step event for 30 minutes; move to recovery and operator check.' : latest.nextAction,
    };
  }).sort((left, right) => right.latestAt.localeCompare(left.latestAt));

  const operatorQueue = runs
    .filter(run => run.latestStatus !== 'accepted' || run.nextAction.includes('30 minutes'))
    .map(run => ({
      priority: run.latestStatus === 'rejected' ? 'critical' as const : run.latestStatus === 'blocked' ? 'high' as const : 'medium' as const,
      eventId: run.eventId,
      externalRunId: run.externalRunId,
      reason: `${run.latestType}:${run.latestStatus}`,
      nextAction: run.nextAction,
    }));

  return {
    ok: true,
    payloadShape: 'restaurant-browser-runner-event-health-v1',
    summary: {
      totalEvents: events.length,
      accepted: events.filter(event => event.status === 'accepted').length,
      blocked: events.filter(event => event.status === 'blocked').length,
      rejected: events.filter(event => event.status === 'rejected').length,
      activeRuns: runs.filter(run => run.latestType !== 'run-completed' && run.latestStatus === 'accepted').length,
      completedRuns: runs.filter(run => run.latestType === 'run-completed' && run.latestStatus === 'accepted').length,
      staleRuns: runs.filter(run => run.nextAction.includes('30 minutes')).length,
    },
    runs,
    operatorQueue,
    safetyBoundary: 'Runner event health stores only sanitized step state, blocker summaries, retry flags and next actions. It does not store cookies, tokens, browser profile raw values, private-message raw text, customer identifiers or POS rows.',
  };
}

export function clearRestaurantBrowserRunnerEventsForTest() {
  memoryEvents.splice(0);
  clearRestaurantAgentLedgerKindForTest('browser-runner-event');
}

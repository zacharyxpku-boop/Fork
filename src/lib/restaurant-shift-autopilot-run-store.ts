import { appendRestaurantAgentLedgerEntry, clearRestaurantAgentLedgerKindForTest, listRestaurantAgentLedgerEntries } from '@/lib/restaurant-agent-ledger-store';
import type { RestaurantShiftAutopilot, RestaurantShiftAutopilotStep } from '@/lib/restaurant-shift-autopilot';
import { recordRestaurantStoreManagerTasksFromShiftAutopilotRun, type RestaurantStoreManagerTaskRecord, type RestaurantStoreManagerTaskStatus } from '@/lib/restaurant-store-manager-task-store';
import type { RestaurantStoreManagerFollowupTask } from '@/lib/restaurant-store-manager-followup';

export type RestaurantShiftAutopilotRunAction = {
  stepId: string;
  laneId: RestaurantShiftAutopilotStep['laneId'];
  jobId?: string;
  title: string;
  owner: RestaurantShiftAutopilotStep['owner'];
  mode: RestaurantShiftAutopilotStep['mode'];
  action: string;
  proofRequired: string[];
  providerRequired: string[];
  status: 'accepted-internal' | 'prepared-manual' | 'waiting-provider' | 'waiting-evidence';
  stopLine: string;
};

export type RestaurantShiftAutopilotRunRecord = {
  ok: true;
  payloadShape: 'restaurant-shift-autopilot-run-v1';
  runId: string;
  restaurant: string;
  offer: string;
  startedAt: string;
  completedAt: string;
  summary: {
    dueSteps: number;
    acceptedInternalActions: number;
    preparedManualActions: number;
    providerHeldActions: number;
    evidenceHeldActions: number;
    createdStoreManagerTasks: number;
    canClaimExternalAutomation: false;
  };
  acceptedInternalActions: RestaurantShiftAutopilotRunAction[];
  preparedManualActions: RestaurantShiftAutopilotRunAction[];
  providerHeldActions: RestaurantShiftAutopilotRunAction[];
  evidenceHeldActions: RestaurantShiftAutopilotRunAction[];
  evidenceLedger: Array<{
    stepId: string;
    title: string;
    owner: RestaurantShiftAutopilotStep['owner'];
    required: string[];
    status: 'required-before-closeout' | 'provider-required' | 'manual-proof-required';
  }>;
  nextStoreManagerTasks: RestaurantStoreManagerTaskRecord[];
  externalRequired: string[];
  safetyBoundary: string;
};

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 41 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function unique(values: string[], limit = 12) {
  return Array.from(new Set(values.map(value => value.trim()).filter(Boolean))).slice(0, limit);
}

function actionFromStep(step: RestaurantShiftAutopilotStep, status: RestaurantShiftAutopilotRunAction['status']): RestaurantShiftAutopilotRunAction {
  return {
    stepId: step.id,
    laneId: step.laneId,
    jobId: step.jobId,
    title: step.title,
    owner: step.owner,
    mode: step.mode,
    action: step.action,
    proofRequired: step.proofRequired,
    providerRequired: step.providerRequired,
    status,
    stopLine: step.stopLine,
  };
}

function taskOwner(owner: RestaurantShiftAutopilotStep['owner']): RestaurantStoreManagerFollowupTask['owner'] {
  if (owner === 'runtime-admin') return 'runtime-admin';
  if (owner === 'ops' || owner === 'Wenai Store Operator') return 'community-ops';
  if (owner === 'finance') return 'shift-lead';
  return 'store-manager';
}

function taskSignal(step: RestaurantShiftAutopilotStep): RestaurantStoreManagerFollowupTask['signal'] {
  if (step.mode === 'wait-provider') return 'setup-gap';
  if (step.mode === 'collect-evidence') return 'redemption';
  if (step.laneId === 'publish-proof') return 'publish-proof';
  if (step.laneId === 'demand') return 'visit-intent';
  return 'manual-review';
}

function taskStatus(step: RestaurantShiftAutopilotStep): RestaurantStoreManagerTaskStatus {
  if (step.mode === 'wait-provider') return 'blocked';
  if (step.mode === 'collect-evidence') return 'needs-evidence';
  if (step.mode === 'prepare-manual') return 'open';
  return 'needs-evidence';
}

function taskPriority(step: RestaurantShiftAutopilotStep): RestaurantStoreManagerFollowupTask['priority'] {
  if (step.mode === 'wait-provider') return 'blocked';
  if (step.mode === 'collect-evidence') return 'next-shift';
  return 'today';
}

function taskFromStep(step: RestaurantShiftAutopilotStep, autopilot: RestaurantShiftAutopilot): RestaurantStoreManagerFollowupTask & {
  status: RestaurantStoreManagerTaskStatus;
  externalRequired: string[];
} {
  return {
    id: `shift-${step.id}`,
    owner: taskOwner(step.owner),
    priority: taskPriority(step),
    restaurant: autopilot.restaurant,
    offer: autopilot.offer,
    signal: taskSignal(step),
    action: step.mode === 'wait-provider'
      ? `Provider held: ${step.providerRequired.slice(0, 2).join(' / ') || step.title}`
      : step.action,
    talkTrack: `${step.title}: ${step.trigger}. Owner reviews the proof list before any external action is claimed.`,
    evidenceRequired: step.proofRequired.join(' / ') || 'Owner signoff receipt',
    dueWindow: step.mode === 'wait-provider'
      ? 'after provider unlock'
      : step.mode === 'collect-evidence'
        ? 'before closeout'
        : 'today in this shift',
    stopLine: step.stopLine,
    status: taskStatus(step),
    externalRequired: step.mode === 'wait-provider'
      ? unique(step.providerRequired, 6)
      : ['Owner approval or public proof before marking done.'],
  };
}

function isRunRecord(value: unknown): value is RestaurantShiftAutopilotRunRecord {
  const record = value as RestaurantShiftAutopilotRunRecord;
  return Boolean(
    record &&
    record.payloadShape === 'restaurant-shift-autopilot-run-v1' &&
    typeof record.runId === 'string' &&
    typeof record.restaurant === 'string' &&
    typeof record.offer === 'string',
  );
}

export function runRestaurantShiftAutopilot(input: {
  autopilot: RestaurantShiftAutopilot;
  now?: Date;
}): RestaurantShiftAutopilotRunRecord {
  const now = input.now || new Date();
  const dueSteps = input.autopilot.steps.filter(step => step.dueNow);
  const acceptedInternalActions = dueSteps
    .filter(step => step.mode === 'run-internal')
    .map(step => actionFromStep(step, 'accepted-internal'));
  const preparedManualActions = dueSteps
    .filter(step => step.mode === 'prepare-manual')
    .map(step => actionFromStep(step, 'prepared-manual'));
  const providerHeldActions = input.autopilot.steps
    .filter(step => step.mode === 'wait-provider')
    .map(step => actionFromStep(step, 'waiting-provider'));
  const evidenceHeldActions = dueSteps
    .filter(step => step.mode === 'collect-evidence')
    .map(step => actionFromStep(step, 'waiting-evidence'));
  const taskSteps = input.autopilot.steps.filter(step => step.mode === 'wait-provider' || (step.dueNow && step.mode !== 'run-internal'));
  const runId = `shift-run-${stableId([input.autopilot.restaurant, input.autopilot.offer, now.toISOString()])}`;
  const nextStoreManagerTasks = recordRestaurantStoreManagerTasksFromShiftAutopilotRun({
    runId,
    restaurant: input.autopilot.restaurant,
    offer: input.autopilot.offer,
    tasks: taskSteps.map(step => taskFromStep(step, input.autopilot)),
    now,
  });
  const evidenceLedger = input.autopilot.steps
    .filter(step => step.proofRequired.length || step.providerRequired.length)
    .map(step => ({
      stepId: step.id,
      title: step.title,
      owner: step.owner,
      required: unique([...step.proofRequired, ...step.providerRequired], 8),
      status: step.mode === 'wait-provider'
        ? 'provider-required' as const
        : step.mode === 'collect-evidence'
          ? 'required-before-closeout' as const
          : 'manual-proof-required' as const,
    }));
  const record: RestaurantShiftAutopilotRunRecord = {
    ok: true,
    payloadShape: 'restaurant-shift-autopilot-run-v1',
    runId,
    restaurant: input.autopilot.restaurant,
    offer: input.autopilot.offer,
    startedAt: now.toISOString(),
    completedAt: now.toISOString(),
    summary: {
      dueSteps: dueSteps.length,
      acceptedInternalActions: acceptedInternalActions.length,
      preparedManualActions: preparedManualActions.length,
      providerHeldActions: providerHeldActions.length,
      evidenceHeldActions: evidenceHeldActions.length,
      createdStoreManagerTasks: nextStoreManagerTasks.length,
      canClaimExternalAutomation: false,
    },
    acceptedInternalActions,
    preparedManualActions,
    providerHeldActions,
    evidenceHeldActions,
    evidenceLedger,
    nextStoreManagerTasks,
    externalRequired: unique([
      ...providerHeldActions.flatMap(action => action.providerRequired),
      ...input.autopilot.providerQueue,
    ], 12),
    safetyBoundary: 'Shift Autopilot Run records internal planning and owner tasks only. It does not log in, publish, contact customers, scrape private messages, redeem coupons, write POS orders, expose secrets, pull raw POS rows, run forever, or claim external automation without provider health and accepted proof.',
  };
  appendRestaurantAgentLedgerEntry('shift-autopilot-run', record, now);
  return record;
}

export function listRestaurantShiftAutopilotRuns(): RestaurantShiftAutopilotRunRecord[] {
  return listRestaurantAgentLedgerEntries<RestaurantShiftAutopilotRunRecord>('shift-autopilot-run')
    .map(entry => entry.payload)
    .filter(isRunRecord)
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt));
}

export function clearRestaurantShiftAutopilotRunsForTest() {
  clearRestaurantAgentLedgerKindForTest('shift-autopilot-run');
}

import { buildRestaurantAgentCapabilityPlan } from '@/lib/restaurant-agent-capabilities';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
import type { RestaurantShiftAutopilotRunRecord } from '@/lib/restaurant-shift-autopilot-run-store';
import type { RestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';
import { buildRestaurantStoreManagerTaskWatcher, type RestaurantStoreManagerTaskWatcher } from '@/lib/restaurant-store-manager-task-watcher';
import { buildRestaurantAgentWatcherPolicy, type RestaurantAgentWatcherPolicy } from '@/lib/restaurant-agent-watcher-policy';

export type RestaurantAgentHeartbeatFollowup = {
  id: string;
  priority: 'high' | 'medium' | 'low';
  owner: string;
  reason: string;
  nextAction: string;
  evidenceRequired: string;
};

export type RestaurantAgentHeartbeat = {
  ok: true;
  heartbeatId: string;
  watchedRuns: number;
  watcherEvents: string[];
  followups: RestaurantAgentHeartbeatFollowup[];
  memorySuggestions: string[];
  watcherPolicy: RestaurantAgentWatcherPolicy;
  storeManagerTaskWatcher?: RestaurantStoreManagerTaskWatcher;
  blockedExternal: string[];
  acceptedReceipts: number;
  shiftAutopilotRuns: number;
  taskWakeups: number;
};

function stableId(input: string): string {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33 + input.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function followupFromRun(run: RestaurantAgentRunRecord, acceptedReceiptEventIds: Set<string>): RestaurantAgentHeartbeatFollowup {
  if (acceptedReceiptEventIds.has(run.eventId)) {
    return {
      id: `followup-${stableId(`${run.eventId}-receipt`)}`,
      priority: 'low',
      owner: run.owner,
      reason: 'This run already has an accepted receipt and can move into review memory.',
      nextAction: '更新门店记忆：store reusable material, signal source and the next campaign action.',
      evidenceRequired: 'Accepted public link, screenshot id, callback receipt or sanitized aggregate proof.',
    };
  }

  if (run.status === 'blocked') {
    return {
      id: `followup-${stableId(`${run.eventId}-blocked`)}`,
      priority: 'high',
      owner: 'runtime-admin / ops',
      reason: `${run.target} runtime is missing required execution evidence.`,
      nextAction: run.nextAction,
      evidenceRequired: 'runtime URL, API key name, isolated tenant/browser profile, merchant grant and callback receipt.',
    };
  }

  if (run.status === 'forwarded') {
    return {
      id: `followup-${stableId(`${run.eventId}-forwarded`)}`,
      priority: 'medium',
      owner: run.owner,
      reason: 'The external runner accepted the task and is waiting for a receipt write-back.',
      nextAction: 'Attach externalRunId, screenshot, content id, public link or platform result.',
      evidenceRequired: 'External runtime receipt, public publish proof, screenshot id or failure reason.',
    };
  }

  return {
    id: `followup-${stableId(`${run.eventId}-queued`)}`,
    priority: 'medium',
    owner: run.owner,
    reason: 'The local task is queued but has no accepted platform proof yet.',
    nextAction: 'Attach public proof, screenshot, or hand the task to the Lobu/OpenClaw/Hermes bridge.',
    evidenceRequired: run.evidenceRequired,
  };
}

export function buildRestaurantAgentHeartbeat(
  runs: RestaurantAgentRunRecord[],
  receipts: RestaurantAgentReceiptRecord[] = [],
  input: {
    shiftAutopilotRuns?: RestaurantShiftAutopilotRunRecord[];
    storeManagerTaskQueue?: RestaurantStoreManagerTaskQueue;
    now?: Date;
  } = {},
): RestaurantAgentHeartbeat {
  const plan = buildRestaurantAgentCapabilityPlan();
  const recentRuns = runs.slice(0, 8);
  const watcherPolicy = buildRestaurantAgentWatcherPolicy({ runs: recentRuns, receipts });
  const storeManagerTaskWatcher = input.storeManagerTaskQueue
    ? buildRestaurantStoreManagerTaskWatcher(input.storeManagerTaskQueue, input.now)
    : undefined;
  const recentShiftRuns = (input.shiftAutopilotRuns || []).slice(0, 3);
  const acceptedReceipts = receipts.filter(receipt => receipt.status === 'accepted');
  const acceptedReceiptEventIds = new Set(acceptedReceipts.map(receipt => receipt.eventId));

  const runFollowups = recentRuns.map(run => followupFromRun(run, acceptedReceiptEventIds));
  const shiftRunFollowups: RestaurantAgentHeartbeatFollowup[] = recentShiftRuns.map(run => ({
    id: `followup-${stableId(`${run.runId}-shift-autopilot`)}`,
    priority: run.summary.providerHeldActions > 0 || run.summary.evidenceHeldActions > 0 ? 'high' : 'medium',
    owner: run.summary.providerHeldActions > 0 ? 'runtime-admin / store-manager' : 'store-manager',
    reason: `Shift Autopilot run ${run.runId} produced ${run.summary.createdStoreManagerTasks} owner tasks and ${run.summary.providerHeldActions} provider-held actions.`,
    nextAction: run.summary.providerHeldActions > 0
      ? 'Assign provider-held actions to runtime-admin; keep external publish, lead capture, coupon redemption and POS analysis blocked until proof is accepted.'
      : 'Review created owner tasks and close them only with public proof, signed callback or sanitized aggregate evidence.',
    evidenceRequired: run.evidenceLedger.slice(0, 3).map(item => `${item.title}: ${item.required.join(' / ')}`).join('; ') || 'Shift Autopilot run ledger receipt',
  }));
  const taskWakeupFollowups: RestaurantAgentHeartbeatFollowup[] = (storeManagerTaskWatcher?.wakeups || []).slice(0, 4).map(wakeup => ({
    id: `followup-${stableId(`${wakeup.id}-task-wakeup`)}`,
    priority: wakeup.priority,
    owner: wakeup.owner,
    reason: wakeup.reason,
    nextAction: wakeup.nextAction,
    evidenceRequired: wakeup.evidenceRequired,
  }));

  const followups = [...shiftRunFollowups, ...taskWakeupFollowups, ...runFollowups].slice(0, 10);
  if (followups.length === 0) {
    followups.push({
      id: 'followup-bootstrap-runtime',
      priority: 'low',
      owner: 'ops',
      reason: 'No restaurant agent run or Shift Autopilot run has been recorded yet.',
      nextAction: 'Create the first governed local agent task or run Shift Autopilot so the system has auditable work to follow.',
      evidenceRequired: 'local eventId, tenantId, worker payload or shift-autopilot-run ledger receipt.',
    });
  }

  const memorySuggestions = [
    ...recentShiftRuns.map(run => `${run.restaurant} / ${run.offer}: shift autopilot ${run.runId}; ${run.summary.createdStoreManagerTasks} owner tasks; ${run.summary.providerHeldActions} provider-held.`),
    ...recentRuns.slice(0, 3).map(run => `${run.restaurant} / ${run.offer}: ${run.status}; next owner ${run.owner}.`),
  ].slice(0, 5);

  return {
    ok: true,
    heartbeatId: `restaurant-heartbeat-${stableId(followups.map(item => item.id).join('|'))}`,
    watchedRuns: recentRuns.length,
    watcherEvents: plan.session.watchers.map(watcher => watcher.event),
    followups,
    memorySuggestions,
    watcherPolicy,
    storeManagerTaskWatcher,
    blockedExternal: [
      'platform_publish requires merchant account authorization',
      'browser_open_click_type requires isolated browser runtime',
      'pos_redemption_pull requires POS export/API',
    ],
    acceptedReceipts: acceptedReceipts.length,
    shiftAutopilotRuns: recentShiftRuns.length,
    taskWakeups: storeManagerTaskWatcher?.summary.wakeups || 0,
  };
}

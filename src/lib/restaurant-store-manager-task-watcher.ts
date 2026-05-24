import type { RestaurantStoreManagerTaskQueue, RestaurantStoreManagerTaskRecord } from '@/lib/restaurant-store-manager-task-store';

export type RestaurantStoreManagerTaskWatcherWakeup = {
  id: string;
  priority: 'high' | 'medium' | 'low';
  taskMemoryId: string;
  owner: RestaurantStoreManagerTaskRecord['owner'];
  reason: string;
  nextAction: string;
  evidenceRequired: string;
  escalation: string;
};

export type RestaurantStoreManagerTaskWatcher = {
  ok: true;
  payloadShape: 'restaurant-store-manager-task-watcher-v1';
  generatedAt: string;
  summary: {
    watchedTasks: number;
    wakeups: number;
    highPriority: number;
    blocked: number;
    staleOpen: number;
    done: number;
  };
  wakeups: RestaurantStoreManagerTaskWatcherWakeup[];
  memoryWrites: Array<{
    entity: 'StoreManagerTask' | 'Restaurant' | 'Offer';
    key: string;
    signal: string;
    nextUse: string;
  }>;
  externalRequired: string[];
  safetyBoundary: string;
};

function stableId(input: string): string {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 41 + input.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function hoursSince(iso: string, now: Date): number {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return 0;
  return Math.max(0, (now.getTime() - time) / 36e5);
}

function priorityFor(task: RestaurantStoreManagerTaskRecord, now: Date): RestaurantStoreManagerTaskWatcherWakeup['priority'] {
  if (task.status === 'blocked') return 'high';
  if (task.status === 'done') return 'low';
  const ageHours = hoursSince(task.updatedAt || task.createdAt, now);
  if (task.priority === 'today' && ageHours >= 4) return 'high';
  if (task.priority === 'today') return 'medium';
  if (task.priority === 'next-shift' && ageHours >= 12) return 'medium';
  return 'low';
}

function wakeupFor(task: RestaurantStoreManagerTaskRecord, now: Date): RestaurantStoreManagerTaskWatcherWakeup | undefined {
  if (task.status === 'done') return undefined;
  const priority = priorityFor(task, now);
  const ageHours = Math.round(hoursSince(task.updatedAt || task.createdAt, now));
  const blocked = task.status === 'blocked';
  return {
    id: `task-watch-${stableId(`${task.taskMemoryId}:${task.status}:${ageHours}`)}`,
    priority,
    taskMemoryId: task.taskMemoryId,
    owner: task.owner,
    reason: blocked
      ? 'Task is blocked because required public proof, authorization, or sanitized operating data is missing.'
      : `Task is still ${task.status} after about ${ageHours} hours; owner should either close it with evidence or refresh the next action.`,
    nextAction: blocked
      ? task.action
      : `Review stop line, complete the owner action, then mark done with evidence: ${task.evidenceRequired}`,
    evidenceRequired: task.evidenceRequired,
    escalation: blocked
      ? 'Escalate to runtime-admin or merchant owner for the missing gate; do not invent operating impact.'
      : `Escalate to ${task.owner} before ${task.dueWindow}; if evidence is unavailable, mark blocked instead of claiming completion.`,
  };
}

export function buildRestaurantStoreManagerTaskWatcher(
  queue: RestaurantStoreManagerTaskQueue,
  now = new Date(),
): RestaurantStoreManagerTaskWatcher {
  const wakeups = queue.tasks
    .map(task => wakeupFor(task, now))
    .filter((item): item is RestaurantStoreManagerTaskWatcherWakeup => Boolean(item))
    .sort((left, right) => {
      const rank = { high: 0, medium: 1, low: 2 };
      return rank[left.priority] - rank[right.priority];
    })
    .slice(0, 8);
  const highPriority = wakeups.filter(wakeup => wakeup.priority === 'high').length;
  const blocked = queue.tasks.filter(task => task.status === 'blocked').length;
  const done = queue.tasks.filter(task => task.status === 'done').length;
  const staleOpen = queue.tasks.filter(task => task.status === 'open' && hoursSince(task.updatedAt || task.createdAt, now) >= 4).length;

  return {
    ok: true,
    payloadShape: 'restaurant-store-manager-task-watcher-v1',
    generatedAt: now.toISOString(),
    summary: {
      watchedTasks: queue.tasks.length,
      wakeups: wakeups.length,
      highPriority,
      blocked,
      staleOpen,
      done,
    },
    wakeups,
    memoryWrites: queue.tasks.slice(0, 8).map(task => ({
      entity: 'StoreManagerTask',
      key: task.taskMemoryId,
      signal: `${task.restaurant} / ${task.offer}: ${task.status} ${task.priority} task owned by ${task.owner}.`,
      nextUse: task.status === 'done'
        ? 'Keep as closed shift memory and avoid repeated reminders.'
        : 'Use in Command Center, heartbeat and next-shift owner reminders.',
    })),
    externalRequired: [
      'Automatic staff reminder delivery requires an approved notification provider or merchant work-chat integration.',
      'Customer contact remains external-gated by merchant authorization and no raw private-message storage.',
      'Redemption closeout requires POS/coupon aggregate export or API data contract.',
    ],
    safetyBoundary: 'Task watcher only reads internal task memory and aggregate evidence requirements. It does not message customers, notify staff externally, redeem coupons, read private chats, expose PII, or pull POS rows without approved integrations.',
  };
}

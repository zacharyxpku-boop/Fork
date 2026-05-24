import { appendRestaurantAgentLedgerEntry, clearRestaurantAgentLedgerKindForTest, listRestaurantAgentLedgerEntries } from '@/lib/restaurant-agent-ledger-store';
import type { RestaurantStoreManagerFollowupTask } from '@/lib/restaurant-store-manager-followup';

export type RestaurantStoreManagerTaskStatus = 'open' | 'blocked' | 'done';

export type RestaurantStoreManagerTaskRecord = RestaurantStoreManagerFollowupTask & {
  taskMemoryId: string;
  status: RestaurantStoreManagerTaskStatus;
  createdAt: string;
  updatedAt: string;
  source: 'followup-pack' | 'manual';
  auditNote: string;
};

export type RestaurantStoreManagerTaskQueue = {
  ok: true;
  payloadShape: 'restaurant-store-manager-task-queue-v1';
  generatedAt: string;
  summary: {
    total: number;
    open: number;
    blocked: number;
    done: number;
    today: number;
    nextShift: number;
  };
  tasks: RestaurantStoreManagerTaskRecord[];
  nextAction: string;
  safetyBoundary: string;
};

const memoryTasks: RestaurantStoreManagerTaskRecord[] = [];
const MAX_TASKS = 60;

function isTaskRecord(value: unknown): value is RestaurantStoreManagerTaskRecord {
  const record = value as RestaurantStoreManagerTaskRecord;
  return Boolean(
    record &&
    typeof record.taskMemoryId === 'string' &&
    typeof record.id === 'string' &&
    typeof record.owner === 'string' &&
    typeof record.status === 'string' &&
    typeof record.createdAt === 'string' &&
    typeof record.updatedAt === 'string',
  );
}

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 37 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function statusFromTask(task: RestaurantStoreManagerFollowupTask): RestaurantStoreManagerTaskStatus {
  return task.priority === 'blocked' ? 'blocked' : 'open';
}

function dedupeTasks(records: RestaurantStoreManagerTaskRecord[]): RestaurantStoreManagerTaskRecord[] {
  const seen = new Set<string>();
  return records
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .filter(record => {
      if (seen.has(record.taskMemoryId)) return false;
      seen.add(record.taskMemoryId);
      return true;
    })
    .slice(0, MAX_TASKS);
}

export function recordRestaurantStoreManagerTasks(
  tasks: RestaurantStoreManagerFollowupTask[],
  now = new Date(),
): RestaurantStoreManagerTaskRecord[] {
  return tasks.map(task => {
    const taskMemoryId = `store-task-${stableId([task.id, task.restaurant, task.offer, task.evidenceRequired])}`;
    const previous = listRestaurantStoreManagerTasks().find(item => item.taskMemoryId === taskMemoryId);
    const record: RestaurantStoreManagerTaskRecord = {
      ...task,
      taskMemoryId,
      status: previous?.status || statusFromTask(task),
      createdAt: previous?.createdAt || now.toISOString(),
      updatedAt: now.toISOString(),
      source: 'followup-pack',
      auditNote: 'Generated from accepted public receipts or a blocked bootstrap gap. No customer contact, coupon redemption, POS pull, or private-message read is executed by this queue.',
    };

    const previousIndex = memoryTasks.findIndex(item => item.taskMemoryId === record.taskMemoryId);
    if (previousIndex >= 0) memoryTasks.splice(previousIndex, 1);
    memoryTasks.unshift(record);
    memoryTasks.splice(MAX_TASKS);
    appendRestaurantAgentLedgerEntry('store-manager-task', record, now);
    return record;
  });
}

export function listRestaurantStoreManagerTasks(): RestaurantStoreManagerTaskRecord[] {
  const ledgerTasks = listRestaurantAgentLedgerEntries<RestaurantStoreManagerTaskRecord>('store-manager-task')
    .map(entry => entry.payload)
    .filter(isTaskRecord);

  return dedupeTasks([...memoryTasks, ...ledgerTasks]);
}

export function updateRestaurantStoreManagerTaskStatus(input: {
  taskMemoryId?: string;
  status?: RestaurantStoreManagerTaskStatus;
  auditNote?: string;
  now?: Date;
}): RestaurantStoreManagerTaskRecord | undefined {
  const taskMemoryId = typeof input.taskMemoryId === 'string' ? input.taskMemoryId : '';
  const status = input.status === 'open' || input.status === 'blocked' || input.status === 'done'
    ? input.status
    : undefined;
  const existing = listRestaurantStoreManagerTasks().find(task => task.taskMemoryId === taskMemoryId);
  if (!existing || !status) return undefined;

  const now = input.now || new Date();
  const record: RestaurantStoreManagerTaskRecord = {
    ...existing,
    status,
    updatedAt: now.toISOString(),
    auditNote: input.auditNote && input.auditNote.trim()
      ? input.auditNote.trim().slice(0, 240)
      : `Status changed to ${status}.`,
  };
  const previousIndex = memoryTasks.findIndex(item => item.taskMemoryId === record.taskMemoryId);
  if (previousIndex >= 0) memoryTasks.splice(previousIndex, 1);
  memoryTasks.unshift(record);
  memoryTasks.splice(MAX_TASKS);
  appendRestaurantAgentLedgerEntry('store-manager-task', record, now);
  return record;
}

export function buildRestaurantStoreManagerTaskQueue(now = new Date()): RestaurantStoreManagerTaskQueue {
  const tasks = listRestaurantStoreManagerTasks();
  const open = tasks.filter(task => task.status === 'open').length;
  const blocked = tasks.filter(task => task.status === 'blocked').length;
  const done = tasks.filter(task => task.status === 'done').length;
  const today = tasks.filter(task => task.priority === 'today' && task.status === 'open').length;
  const nextShift = tasks.filter(task => task.priority === 'next-shift' && task.status === 'open').length;

  return {
    ok: true,
    payloadShape: 'restaurant-store-manager-task-queue-v1',
    generatedAt: now.toISOString(),
    summary: {
      total: tasks.length,
      open,
      blocked,
      done,
      today,
      nextShift,
    },
    tasks: tasks.slice(0, 12),
    nextAction: tasks[0]?.action || 'Generate a Store Manager Follow-up Pack after the first accepted public receipt or controlled trial.',
    safetyBoundary: 'The task queue is an internal operating memory. It records owners, evidence, due windows and stop lines; it does not contact customers, publish messages, redeem coupons, read private chats, expose PII, or pull POS rows.',
  };
}

export function clearRestaurantStoreManagerTasksForTest() {
  memoryTasks.splice(0);
  clearRestaurantAgentLedgerKindForTest('store-manager-task');
}

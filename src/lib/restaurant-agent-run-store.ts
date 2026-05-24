import type { RestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { appendRestaurantAgentLedgerEntry, clearRestaurantAgentLedgerKindForTest, listRestaurantAgentLedgerEntries } from '@/lib/restaurant-agent-ledger-store';
import type { RestaurantRuntimeBridgeResult } from '@/lib/restaurant-agent-runtime-bridge';

export type RestaurantAgentRunRecord = {
  eventId: string;
  tenantId: string;
  taskId: string;
  status: 'queued' | 'blocked' | 'forwarded' | 'failed';
  target: 'local' | 'lobu' | 'openclaw' | 'hermes';
  restaurant: string;
  offer: string;
  owner: string;
  evidenceRequired: string;
  blockedActions: string[];
  nextAction: string;
  createdAt: string;
};

const memoryRuns: RestaurantAgentRunRecord[] = [];
const MAX_RUNS = 30;

function isRunRecord(value: unknown): value is RestaurantAgentRunRecord {
  const record = value as RestaurantAgentRunRecord;
  return Boolean(
    record &&
    typeof record.eventId === 'string' &&
    typeof record.tenantId === 'string' &&
    typeof record.taskId === 'string' &&
    typeof record.target === 'string' &&
    typeof record.status === 'string' &&
    typeof record.createdAt === 'string',
  );
}

function dedupeRuns(records: RestaurantAgentRunRecord[]): RestaurantAgentRunRecord[] {
  const seen = new Set<string>();
  return records
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .filter(record => {
      const key = `${record.eventId}:${record.target}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, MAX_RUNS);
}

export function recordRestaurantAgentRun(
  dispatch: RestaurantAgentDispatch,
  target: RestaurantAgentRunRecord['target'],
  bridge?: RestaurantRuntimeBridgeResult,
  now = new Date(),
): RestaurantAgentRunRecord {
  const status = bridge
    ? bridge.status === 'forwarded'
      ? 'forwarded'
      : bridge.status
    : dispatch.status;
  const record: RestaurantAgentRunRecord = {
    eventId: dispatch.eventId,
    tenantId: dispatch.tenantId,
    taskId: dispatch.taskId,
    status,
    target,
    restaurant: dispatch.workerPayload.restaurant,
    offer: dispatch.workerPayload.offer,
    owner: dispatch.workerPayload.owner,
    evidenceRequired: dispatch.workerPayload.evidenceRequired,
    blockedActions: dispatch.workerPayload.blockedActions,
    nextAction: bridge?.message || dispatch.nextAttachStep,
    createdAt: now.toISOString(),
  };

  const previousIndex = memoryRuns.findIndex(item => item.eventId === record.eventId && item.target === record.target);
  if (previousIndex >= 0) memoryRuns.splice(previousIndex, 1);
  memoryRuns.unshift(record);
  memoryRuns.splice(MAX_RUNS);
  appendRestaurantAgentLedgerEntry('run', record, now);
  return record;
}

export function listRestaurantAgentRuns(): RestaurantAgentRunRecord[] {
  const ledgerRuns = listRestaurantAgentLedgerEntries<RestaurantAgentRunRecord>('run')
    .map(entry => entry.payload)
    .filter(isRunRecord);

  return dedupeRuns([...memoryRuns, ...ledgerRuns]);
}

export function clearRestaurantAgentRunsForTest() {
  memoryRuns.splice(0);
  clearRestaurantAgentLedgerKindForTest('run');
}

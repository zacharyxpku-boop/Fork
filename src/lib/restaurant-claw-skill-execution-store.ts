import { appendRestaurantAgentLedgerEntry, clearRestaurantAgentLedgerKindForTest, listRestaurantAgentLedgerEntries } from '@/lib/restaurant-agent-ledger-store';
import type { RestaurantClawSkillWorkbench } from '@/lib/restaurant-claw-skill-workbench';

export type RestaurantClawSkillExecutionStatus = 'ready-now' | 'needs-training' | 'provider-gated';

export type RestaurantClawSkillExecutionRecord = {
  recordId: string;
  payloadShape: 'restaurant-claw-skill-execution-record-v1';
  createdAt: string;
  restaurant: string;
  offer: string;
  status: RestaurantClawSkillExecutionStatus;
  selectedSkills: number;
  runnableNow: number;
  trainingNeeded: number;
  providerGated: number;
  deliverables: Array<{
    id: string;
    title: string;
    owner: string;
    status: RestaurantClawSkillExecutionStatus;
  }>;
  owners: string[];
  nextAction: string;
  evidenceRequired: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

export type RestaurantClawSkillExecutionLedger = {
  ok: true;
  payloadShape: 'restaurant-claw-skill-execution-ledger-v1';
  generatedAt: string;
  summary: {
    total: number;
    readyNow: number;
    needsTraining: number;
    providerGated: number;
    latestRunnableSkills: number;
  };
  latest: RestaurantClawSkillExecutionRecord[];
  nextAction: string;
  safetyBoundary: string;
};

const memoryRecords: RestaurantClawSkillExecutionRecord[] = [];
const MAX_RECORDS = 40;

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 37 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function isExecutionRecord(value: unknown): value is RestaurantClawSkillExecutionRecord {
  const record = value as RestaurantClawSkillExecutionRecord;
  return Boolean(
    record &&
    record.payloadShape === 'restaurant-claw-skill-execution-record-v1' &&
    typeof record.recordId === 'string' &&
    typeof record.createdAt === 'string' &&
    typeof record.restaurant === 'string' &&
    typeof record.offer === 'string' &&
    typeof record.status === 'string',
  );
}

function dedupe(records: RestaurantClawSkillExecutionRecord[]) {
  const seen = new Set<string>();
  return records
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .filter(record => {
      if (seen.has(record.recordId)) return false;
      seen.add(record.recordId);
      return true;
    })
    .slice(0, MAX_RECORDS);
}

function statusFromWorkbench(workbench: RestaurantClawSkillWorkbench): RestaurantClawSkillExecutionStatus {
  if (workbench.summary.providerGated > 0) return 'provider-gated';
  if (workbench.summary.trainingNeeded > 0) return 'needs-training';
  return 'ready-now';
}

export function recordRestaurantClawSkillExecution(
  workbench: RestaurantClawSkillWorkbench,
  now = new Date(workbench.generatedAt),
): RestaurantClawSkillExecutionRecord {
  const status = statusFromWorkbench(workbench);
  const record: RestaurantClawSkillExecutionRecord = {
    recordId: `claw-skill-execution-${stableId([
      workbench.restaurant,
      workbench.offer,
      String(workbench.summary.selectedSkills),
      workbench.selectedModules.map(module => module.id).join(','),
    ])}`,
    payloadShape: 'restaurant-claw-skill-execution-record-v1',
    createdAt: now.toISOString(),
    restaurant: workbench.restaurant,
    offer: workbench.offer,
    status,
    selectedSkills: workbench.summary.selectedSkills,
    runnableNow: workbench.summary.runnableNow,
    trainingNeeded: workbench.summary.trainingNeeded,
    providerGated: workbench.summary.providerGated,
    deliverables: workbench.deliverables.map(item => ({
      id: item.id,
      title: item.title,
      owner: item.owner,
      status: item.status,
    })),
    owners: Array.from(new Set(workbench.workbench.map(item => item.owner))),
    nextAction: workbench.commandScript[1] || 'Run the ready internal skills and keep blocked skills behind training or provider gates.',
    evidenceRequired: Array.from(new Set(workbench.workbench.flatMap(item => item.evidenceRequired))).slice(0, 8),
    externalRequired: workbench.externalRequired,
    safetyBoundary: 'Execution ledger records selected skills, owners, next actions and evidence requirements only. It does not execute external platform actions, store secrets, read private messages, redeem coupons, expose PII or pull raw POS rows.',
  };

  const previousIndex = memoryRecords.findIndex(item => item.recordId === record.recordId);
  if (previousIndex >= 0) memoryRecords.splice(previousIndex, 1);
  memoryRecords.unshift(record);
  memoryRecords.splice(MAX_RECORDS);
  appendRestaurantAgentLedgerEntry('claw-skill-execution', record, now);
  return record;
}

export function listRestaurantClawSkillExecutionRecords(): RestaurantClawSkillExecutionRecord[] {
  const ledgerRecords = listRestaurantAgentLedgerEntries<RestaurantClawSkillExecutionRecord>('claw-skill-execution')
    .map(entry => entry.payload)
    .filter(isExecutionRecord);

  return dedupe([...memoryRecords, ...ledgerRecords]);
}

export function buildRestaurantClawSkillExecutionLedger(now = new Date()): RestaurantClawSkillExecutionLedger {
  const records = listRestaurantClawSkillExecutionRecords();
  const readyNow = records.filter(record => record.status === 'ready-now').length;
  const needsTraining = records.filter(record => record.status === 'needs-training').length;
  const providerGated = records.filter(record => record.status === 'provider-gated').length;

  return {
    ok: true,
    payloadShape: 'restaurant-claw-skill-execution-ledger-v1',
    generatedAt: now.toISOString(),
    summary: {
      total: records.length,
      readyNow,
      needsTraining,
      providerGated,
      latestRunnableSkills: records[0]?.runnableNow || 0,
    },
    latest: records.slice(0, 6),
    nextAction: records[0]?.nextAction || 'Open Skill Workbench to create the first remembered restaurant skill execution pack.',
    safetyBoundary: 'The ledger is internal memory for skill-pack execution planning. It records owners, evidence and blocker state; it does not claim automatic publishing, acquisition, coupon redemption, private-message access or real operating analysis.',
  };
}

export function clearRestaurantClawSkillExecutionsForTest() {
  memoryRecords.splice(0);
  clearRestaurantAgentLedgerKindForTest('claw-skill-execution');
}

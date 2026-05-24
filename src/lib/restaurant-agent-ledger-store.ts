import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';

export type RestaurantAgentLedgerKind =
  | 'run'
  | 'receipt'
  | 'browser-session'
  | 'browser-runner-event'
  | 'capability-training'
  | 'store-manager-task'
  | 'staff-notification-audit'
  | 'channel-delivery-attempt'
  | 'channel-delivery-acknowledgement'
  | 'provider-setup-state'
  | 'claw-skill-execution';

export type RestaurantAgentLedgerEntry<TPayload = unknown> = {
  kind: RestaurantAgentLedgerKind;
  payload: TPayload;
  writtenAt: string;
};

const LEDGER_DIR = 'data';
const DEFAULT_LEDGER_PATH = 'data/restaurant-agent-ledger.jsonl';
const TEST_LEDGER_PATH = 'data/test-restaurant-agent-ledger.jsonl';

function ledgerPath(): string {
  if (process.env.RESTAURANT_AGENT_LEDGER_PATH) return process.env.RESTAURANT_AGENT_LEDGER_PATH;
  if (process.env.NODE_ENV === 'test') return TEST_LEDGER_PATH;
  return DEFAULT_LEDGER_PATH;
}

function readEntries(): RestaurantAgentLedgerEntry[] {
  try {
    const raw = readFileSync(ledgerPath(), 'utf8');
    return raw
      .split(/\r?\n/)
      .filter(Boolean)
      .map(line => JSON.parse(line) as RestaurantAgentLedgerEntry)
      .filter(entry => entry.kind === 'run'
        || entry.kind === 'receipt'
        || entry.kind === 'browser-session'
        || entry.kind === 'browser-runner-event'
        || entry.kind === 'capability-training'
        || entry.kind === 'store-manager-task'
        || entry.kind === 'staff-notification-audit'
        || entry.kind === 'channel-delivery-attempt'
        || entry.kind === 'channel-delivery-acknowledgement'
        || entry.kind === 'provider-setup-state'
        || entry.kind === 'claw-skill-execution');
  } catch {
    return [];
  }
}

export function appendRestaurantAgentLedgerEntry<TPayload>(
  kind: RestaurantAgentLedgerKind,
  payload: TPayload,
  now = new Date(),
) {
  try {
    const file = ledgerPath();
    mkdirSync(LEDGER_DIR, { recursive: true });
    const entries = readEntries()
      .filter(entry => {
        if (kind === 'run' && entry.kind === 'run') {
          const existing = entry.payload as { eventId?: string; target?: string };
          const next = payload as { eventId?: string; target?: string };
          return existing.eventId !== next.eventId || existing.target !== next.target;
        }

        if (kind === 'receipt' && entry.kind === 'receipt') {
          const existing = entry.payload as { receiptId?: string };
          const next = payload as { receiptId?: string };
          return existing.receiptId !== next.receiptId;
        }

        if (kind === 'browser-session' && entry.kind === 'browser-session') {
          const existing = entry.payload as { sessionId?: string };
          const next = payload as { sessionId?: string };
          return existing.sessionId !== next.sessionId;
        }

        if (kind === 'browser-runner-event' && entry.kind === 'browser-runner-event') {
          const existing = entry.payload as { runnerEventId?: string };
          const next = payload as { runnerEventId?: string };
          return existing.runnerEventId !== next.runnerEventId;
        }

        if (kind === 'capability-training' && entry.kind === 'capability-training') {
          const existing = entry.payload as { recordId?: string };
          const next = payload as { recordId?: string };
          return existing.recordId !== next.recordId;
        }

        if (kind === 'store-manager-task' && entry.kind === 'store-manager-task') {
          const existing = entry.payload as { taskMemoryId?: string };
          const next = payload as { taskMemoryId?: string };
          return existing.taskMemoryId !== next.taskMemoryId;
        }

        if (kind === 'staff-notification-audit' && entry.kind === 'staff-notification-audit') {
          const existing = entry.payload as { auditId?: string };
          const next = payload as { auditId?: string };
          return existing.auditId !== next.auditId;
        }

        if (kind === 'channel-delivery-attempt' && entry.kind === 'channel-delivery-attempt') {
          const existing = entry.payload as { attemptId?: string };
          const next = payload as { attemptId?: string };
          return existing.attemptId !== next.attemptId;
        }

        if (kind === 'channel-delivery-acknowledgement' && entry.kind === 'channel-delivery-acknowledgement') {
          const existing = entry.payload as { acknowledgementId?: string };
          const next = payload as { acknowledgementId?: string };
          return existing.acknowledgementId !== next.acknowledgementId;
        }

        if (kind === 'provider-setup-state' && entry.kind === 'provider-setup-state') {
          const existing = entry.payload as { stateId?: string };
          const next = payload as { stateId?: string };
          return existing.stateId !== next.stateId;
        }

        if (kind === 'claw-skill-execution' && entry.kind === 'claw-skill-execution') {
          const existing = entry.payload as { recordId?: string };
          const next = payload as { recordId?: string };
          return existing.recordId !== next.recordId;
        }

        return true;
      });
    entries.push({ kind, payload, writtenAt: now.toISOString() });
    writeFileSync(file, `${entries.map(entry => JSON.stringify(entry)).join('\n')}\n`, 'utf8');
  } catch {
    // The in-memory store remains the fallback when the local filesystem is not writable.
  }
}

export function listRestaurantAgentLedgerEntries<TPayload>(kind: RestaurantAgentLedgerKind): RestaurantAgentLedgerEntry<TPayload>[] {
  return readEntries().filter(entry => entry.kind === kind) as RestaurantAgentLedgerEntry<TPayload>[];
}

export function clearRestaurantAgentLedgerKindForTest(kind: RestaurantAgentLedgerKind) {
  try {
    const file = ledgerPath();
    const remaining = readEntries().filter(entry => entry.kind !== kind);
    if (remaining.length) {
      writeFileSync(file, `${remaining.map(entry => JSON.stringify(entry)).join('\n')}\n`, 'utf8');
    } else {
      unlinkSync(file);
    }
  } catch {
    // Test cleanup should not fail when the ledger file does not exist.
  }
}

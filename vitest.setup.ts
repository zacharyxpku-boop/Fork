import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { afterAll, beforeEach } from 'vitest';

// Each test file gets its own ledger file so runs stay idempotent: the shared
// data/test-restaurant-agent-ledger.jsonl used to accumulate entries across
// runs and leak state between test files.
const ledgerDir = mkdtempSync(path.join(tmpdir(), 'wenai-test-ledger-'));
const ledgerPath = path.join(ledgerDir, 'restaurant-agent-ledger.jsonl');
process.env.RESTAURANT_AGENT_LEDGER_PATH = ledgerPath;

beforeEach(() => {
  // Some suites override the path and delete it in their afterEach; restore
  // the per-file default so later tests never fall back to the shared file.
  if (!process.env.RESTAURANT_AGENT_LEDGER_PATH) {
    process.env.RESTAURANT_AGENT_LEDGER_PATH = ledgerPath;
  }
});

afterAll(() => {
  rmSync(ledgerDir, { recursive: true, force: true });
});

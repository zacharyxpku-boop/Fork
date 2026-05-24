import { existsSync, readFileSync, rmSync } from 'node:fs';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { clearRestaurantAgentReceiptsForTest, listRestaurantAgentReceipts, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, listRestaurantAgentRuns, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';

const ledgerPath = 'data/test-restaurant-agent-ledger-store.jsonl';

describe('restaurant agent persistent ledger store', () => {
  beforeEach(() => {
    process.env.RESTAURANT_AGENT_LEDGER_PATH = ledgerPath;
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
    rmSync(ledgerPath, { force: true });
  });

  afterEach(() => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
    rmSync(ledgerPath, { force: true });
    delete process.env.RESTAURANT_AGENT_LEDGER_PATH;
  });

  it('persists run records to a local JSONL ledger without storing external secrets', () => {
    const dispatch = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'South City Bistro',
      offer: 'Dinner set',
      owner: 'Store manager',
    });

    recordRestaurantAgentRun(dispatch, 'local', undefined, new Date('2026-05-23T01:00:00.000Z'));

    const raw = readFileSync(ledgerPath, 'utf8');
    expect(raw).toContain('"kind":"run"');
    expect(raw).toContain('South City Bistro');
    expect(raw).not.toContain('API key');
    expect(listRestaurantAgentRuns()[0].eventId).toBe(dispatch.eventId);
  });

  it('persists receipt records and dedupes repeated imports by receipt id', () => {
    const run = recordRestaurantAgentRun(buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'Receipt Bistro',
      offer: 'Dinner set',
      owner: 'Operator',
    }), 'local', undefined, new Date('2026-05-23T01:30:00.000Z'));
    const receiptInput = {
      eventId: run.eventId,
      channel: 'Dianping',
      evidenceUrl: 'https://www.dianping.com/shop/123/review/456',
      screenshotId: 'shot-ledger-proof',
      operator: 'Operator',
      summary: 'Public publish proof saved.',
    };

    recordRestaurantAgentReceipt(receiptInput, new Date('2026-05-23T02:00:00.000Z'));
    recordRestaurantAgentReceipt(receiptInput, new Date('2026-05-23T02:01:00.000Z'));

    const raw = readFileSync(ledgerPath, 'utf8');
    expect(raw).toContain('"kind":"receipt"');
    expect(raw.match(/restaurant-receipt-/g)).toHaveLength(1);
    expect(listRestaurantAgentReceipts()).toHaveLength(1);
    expect(listRestaurantAgentReceipts()[0].duplicate).toBe(true);
  });

  it('keeps running with in-memory fallback when the ledger file is absent', () => {
    rmSync(ledgerPath, { force: true });
    const run = recordRestaurantAgentRun(buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'Fallback Bistro',
      offer: 'Dinner set',
      owner: 'Operator',
    }), 'local');

    const receipt = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: 'manual',
      screenshotId: 'shot-fallback',
      operator: 'Operator',
      summary: 'Local fallback receipt remains readable.',
    });

    expect(receipt.status).toBe('accepted');
    expect(existsSync(ledgerPath)).toBe(true);
    expect(listRestaurantAgentReceipts()[0].receiptId).toBe(receipt.receiptId);
  });
});

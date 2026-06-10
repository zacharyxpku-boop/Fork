import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { appendRestaurantStoreMemory, listRestaurantStoreMemory, renderRestaurantStoreMemoryForPrompt } from '@/lib/restaurant-store-memory';

let tempDir: string;
const originalPath = process.env.RESTAURANT_STORE_MEMORY_PATH;

beforeAll(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'wenai-store-memory-'));
  process.env.RESTAURANT_STORE_MEMORY_PATH = join(tempDir, 'memory.jsonl');
});

afterAll(() => {
  if (originalPath === undefined) {
    delete process.env.RESTAURANT_STORE_MEMORY_PATH;
  } else {
    process.env.RESTAURANT_STORE_MEMORY_PATH = originalPath;
  }
  rmSync(tempDir, { recursive: true, force: true });
});

describe('restaurant store memory', () => {
  it('appends per-store notes and lists them back', () => {
    const first = appendRestaurantStoreMemory({
      restaurant: '椒香记',
      kind: 'effective-angle',
      note: '工作日晚高峰免排队这个角度有顾客提到',
      source: 'proof-backfill',
      now: new Date('2026-06-11T20:00:00.000Z'),
    });
    expect(first.ok).toBe(true);
    const second = appendRestaurantStoreMemory({
      restaurant: '椒香记',
      kind: 'revision-preference',
      note: '老板不要文艺腔，文案要口语',
      now: new Date('2026-06-11T20:01:00.000Z'),
    });
    expect(second.ok).toBe(true);

    const entries = listRestaurantStoreMemory('椒香记');
    expect(entries).toHaveLength(2);
    expect(listRestaurantStoreMemory('别家店')).toHaveLength(0);
  });

  it('blocks notes containing customer PII patterns', () => {
    const blocked = appendRestaurantStoreMemory({
      restaurant: '椒香记',
      kind: 'channel-feedback',
      note: '顾客王女士 13812345678 说下次再来',
    });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.reason).toBe('pii-blocked');
  });

  it('deduplicates identical notes and renders a prompt block with kind labels', () => {
    appendRestaurantStoreMemory({ restaurant: '椒香记', kind: 'campaign-note', note: '酸梅汤赠品反响不错', now: new Date('2026-06-11T20:02:00.000Z') });
    appendRestaurantStoreMemory({ restaurant: '椒香记', kind: 'campaign-note', note: '酸梅汤赠品反响不错', now: new Date('2026-06-11T20:03:00.000Z') });
    const entries = listRestaurantStoreMemory('椒香记');
    expect(entries.filter(entry => entry.note === '酸梅汤赠品反响不错')).toHaveLength(1);

    const block = renderRestaurantStoreMemoryForPrompt('椒香记');
    expect(block).toContain('经营记忆');
    expect(block).toContain('[活动效果备注] 酸梅汤赠品反响不错');
    expect(block).toContain('[文案偏好] 老板不要文艺腔');
    expect(renderRestaurantStoreMemoryForPrompt('没记忆的店')).toBe('');
  });
});

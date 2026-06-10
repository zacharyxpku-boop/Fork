import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

export type RestaurantStoreMemoryKind =
  | 'effective-angle'
  | 'channel-feedback'
  | 'revision-preference'
  | 'campaign-note';

export interface RestaurantStoreMemoryEntry {
  id: string;
  restaurant: string;
  kind: RestaurantStoreMemoryKind;
  note: string;
  source: 'owner' | 'proof-backfill' | 'revision';
  writtenAt: string;
}

const MEMORY_DIR = 'data';
const DEFAULT_MEMORY_PATH = 'data/restaurant-store-memory.jsonl';
const TEST_MEMORY_PATH = 'data/test-restaurant-store-memory.jsonl';
const MAX_NOTE_LENGTH = 200;
const MAX_ENTRIES_PER_STORE = 60;

const KINDS: RestaurantStoreMemoryKind[] = ['effective-angle', 'channel-feedback', 'revision-preference', 'campaign-note'];

const KIND_LABELS: Record<RestaurantStoreMemoryKind, string> = {
  'effective-angle': '有效内容角度',
  'channel-feedback': '渠道反馈',
  'revision-preference': '文案偏好',
  'campaign-note': '活动效果备注',
};

// 红线：记忆只存经营偏好和已验收事实。这些模式一旦出现就拒绝写入，避免顾客个人信息进店铺记忆。
const FORBIDDEN_PATTERNS = [/1[3-9]\d{9}/, /微信号[:：]?\s*\S+/, /wxid[_-]?\w+/i, /身份证/, /\d{15,18}[xX]?/];

function memoryPath(): string {
  if (process.env.RESTAURANT_STORE_MEMORY_PATH) return process.env.RESTAURANT_STORE_MEMORY_PATH;
  if (process.env.NODE_ENV === 'test') return TEST_MEMORY_PATH;
  return DEFAULT_MEMORY_PATH;
}

function readAll(): RestaurantStoreMemoryEntry[] {
  try {
    const raw = readFileSync(memoryPath(), 'utf8');
    return raw
      .split(/\r?\n/)
      .filter(Boolean)
      .map(line => JSON.parse(line) as RestaurantStoreMemoryEntry)
      .filter(entry => KINDS.includes(entry.kind) && Boolean(entry.restaurant));
  } catch {
    return [];
  }
}

function writeAll(entries: RestaurantStoreMemoryEntry[]) {
  mkdirSync(MEMORY_DIR, { recursive: true });
  writeFileSync(memoryPath(), entries.map(entry => JSON.stringify(entry)).join('\n') + (entries.length ? '\n' : ''), 'utf8');
}

export function appendRestaurantStoreMemory(input: {
  restaurant: string;
  kind: RestaurantStoreMemoryKind;
  note: string;
  source?: RestaurantStoreMemoryEntry['source'];
  now?: Date;
}): { ok: true; entry: RestaurantStoreMemoryEntry } | { ok: false; reason: 'empty-note' | 'pii-blocked' | 'unknown-kind' } {
  const note = (input.note || '').trim().slice(0, MAX_NOTE_LENGTH);
  if (!note || !input.restaurant?.trim()) return { ok: false, reason: 'empty-note' };
  if (!KINDS.includes(input.kind)) return { ok: false, reason: 'unknown-kind' };
  if (FORBIDDEN_PATTERNS.some(pattern => pattern.test(note))) return { ok: false, reason: 'pii-blocked' };

  const now = input.now || new Date();
  const entry: RestaurantStoreMemoryEntry = {
    id: `memory-${now.getTime()}-${Math.abs(hashCode(`${input.restaurant}|${note}`)).toString(16)}`,
    restaurant: input.restaurant.trim(),
    kind: input.kind,
    note,
    source: input.source || 'owner',
    writtenAt: now.toISOString(),
  };
  const all = readAll().filter(existing => !(existing.restaurant === entry.restaurant && existing.note === entry.note));
  all.push(entry);
  const byStore = all.filter(item => item.restaurant === entry.restaurant);
  if (byStore.length > MAX_ENTRIES_PER_STORE) {
    const overflow = byStore.length - MAX_ENTRIES_PER_STORE;
    const oldestIds = byStore.slice(0, overflow).map(item => item.id);
    writeAll(all.filter(item => !oldestIds.includes(item.id)));
  } else {
    writeAll(all);
  }
  return { ok: true, entry };
}

export function listRestaurantStoreMemory(restaurant: string): RestaurantStoreMemoryEntry[] {
  if (!restaurant?.trim()) return [];
  return readAll().filter(entry => entry.restaurant === restaurant.trim());
}

export function renderRestaurantStoreMemoryForPrompt(restaurant: string, limit = 8): string {
  const entries = listRestaurantStoreMemory(restaurant).slice(-limit);
  if (entries.length === 0) return '';
  const lines = entries.map(entry => `- [${KIND_LABELS[entry.kind]}] ${entry.note}`);
  return `这家店此前确认过的经营记忆（生成时要尊重这些偏好和事实）：\n${lines.join('\n')}`;
}

function hashCode(text: string): number {
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

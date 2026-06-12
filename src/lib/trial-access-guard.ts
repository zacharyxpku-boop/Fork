import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';

/**
 * 商用第一层访问控制：
 * - 口令制：TRIAL_ACCESS_TOKENS 配逗号分隔的口令（如 "jxj-2026,sjx-2026"），每家试用门店发一个
 * - 计量：每口令每日 LLM 调用次数上限（TRIAL_DAILY_LLM_LIMIT，默认 60）
 * - 未配置 TRIAL_ACCESS_TOKENS 时视为开发模式：放行并使用 'dev' 租户（本地开发不受影响）
 */

export interface TrialAccessResult {
  allowed: boolean;
  tenant: string;
  reason?: 'missing-token' | 'invalid-token' | 'daily-limit-reached';
  remainingToday?: number;
}

interface UsageEntry {
  tenant: string;
  date: string;
  count: number;
}

const USAGE_DIR = 'data';
const DEFAULT_USAGE_PATH = 'data/trial-llm-usage.jsonl';
const TEST_USAGE_PATH = 'data/test-trial-llm-usage.jsonl';
const DEFAULT_DAILY_LIMIT = 60;

function usagePath(): string {
  if (process.env.TRIAL_USAGE_PATH) return process.env.TRIAL_USAGE_PATH;
  if (process.env.NODE_ENV === 'test') return TEST_USAGE_PATH;
  return DEFAULT_USAGE_PATH;
}

function configuredTokens(): string[] {
  return (process.env.TRIAL_ACCESS_TOKENS || '')
    .split(',')
    .map(token => token.trim())
    .filter(Boolean);
}

function dailyLimit(): number {
  const parsed = Number(process.env.TRIAL_DAILY_LLM_LIMIT);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_DAILY_LIMIT;
}

function readUsage(): UsageEntry[] {
  try {
    return readFileSync(usagePath(), 'utf8')
      .split(/\r?\n/)
      .filter(Boolean)
      .map(line => JSON.parse(line) as UsageEntry);
  } catch {
    return [];
  }
}

function writeUsage(entries: UsageEntry[]) {
  mkdirSync(USAGE_DIR, { recursive: true });
  writeFileSync(usagePath(), entries.map(entry => JSON.stringify(entry)).join('\n') + (entries.length ? '\n' : ''), 'utf8');
}

function todayKey(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export function resolveTrialAccess(token: string | null | undefined, now = new Date()): TrialAccessResult {
  const tokens = configuredTokens();
  if (tokens.length === 0) {
    return { allowed: true, tenant: 'dev' };
  }
  const provided = (token || '').trim();
  if (!provided) return { allowed: false, tenant: '', reason: 'missing-token' };
  if (!tokens.includes(provided)) return { allowed: false, tenant: '', reason: 'invalid-token' };

  const date = todayKey(now);
  const usage = readUsage().filter(entry => entry.date === date);
  const current = usage.find(entry => entry.tenant === provided)?.count || 0;
  const limit = dailyLimit();
  if (current >= limit) {
    return { allowed: false, tenant: provided, reason: 'daily-limit-reached', remainingToday: 0 };
  }
  return { allowed: true, tenant: provided, remainingToday: limit - current };
}

export function recordTrialLlmUsage(tenant: string, calls: number, now = new Date()) {
  if (!tenant || tenant === 'dev' || calls <= 0) return;
  const date = todayKey(now);
  const usage = readUsage().filter(entry => entry.date === date);
  const existing = usage.find(entry => entry.tenant === tenant);
  if (existing) {
    existing.count += calls;
  } else {
    usage.push({ tenant, date, count: calls });
  }
  writeUsage(usage);
}

export const TRIAL_TOKEN_HEADER = 'x-trial-token';

/** 记忆等持久数据按口令隔离：开发模式直接用店名，生产口令加前缀防止重名串店。 */
export function tenantScopedKey(tenant: string, restaurant: string): string {
  return !tenant || tenant === 'dev' ? restaurant : `${tenant}::${restaurant}`;
}

export function accessDeniedMessage(reason: TrialAccessResult['reason']): string {
  switch (reason) {
    case 'missing-token':
      return '缺少试用口令。在页面右上角填入门店口令后再试；没有口令请联系发起试用的人。';
    case 'invalid-token':
      return '试用口令不对，确认后重新填。';
    case 'daily-limit-reached':
      return '这家店今天的 AI 用量已到上限，明天自动恢复；着急的话联系发起试用的人提额。';
    default:
      return '访问被拒绝。';
  }
}

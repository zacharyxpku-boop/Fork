import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { accessDeniedMessage, recordTrialLlmUsage, resolveTrialAccess, tenantScopedKey } from '@/lib/trial-access-guard';

let tempDir: string;
const originalTokens = process.env.TRIAL_ACCESS_TOKENS;
const originalLimit = process.env.TRIAL_DAILY_LLM_LIMIT;
const originalPath = process.env.TRIAL_USAGE_PATH;

beforeAll(() => {
  tempDir = mkdtempSync(join(tmpdir(), 'wenai-trial-guard-'));
  process.env.TRIAL_USAGE_PATH = join(tempDir, 'usage.jsonl');
});

afterEach(() => {
  if (originalTokens === undefined) delete process.env.TRIAL_ACCESS_TOKENS;
  else process.env.TRIAL_ACCESS_TOKENS = originalTokens;
  if (originalLimit === undefined) delete process.env.TRIAL_DAILY_LLM_LIMIT;
  else process.env.TRIAL_DAILY_LLM_LIMIT = originalLimit;
});

afterAll(() => {
  if (originalPath === undefined) delete process.env.TRIAL_USAGE_PATH;
  else process.env.TRIAL_USAGE_PATH = originalPath;
  rmSync(tempDir, { recursive: true, force: true });
});

describe('trial access guard', () => {
  it('allows everything as dev tenant when no tokens are configured', () => {
    delete process.env.TRIAL_ACCESS_TOKENS;
    const access = resolveTrialAccess(null);
    expect(access).toEqual({ allowed: true, tenant: 'dev' });
    expect(tenantScopedKey('dev', '椒香记')).toBe('椒香记');
  });

  it('rejects missing and invalid tokens once tokens are configured', () => {
    process.env.TRIAL_ACCESS_TOKENS = 'jxj-2026, sjx-2026';
    expect(resolveTrialAccess(null).reason).toBe('missing-token');
    expect(resolveTrialAccess('wrong').reason).toBe('invalid-token');
    const ok = resolveTrialAccess('jxj-2026');
    expect(ok.allowed).toBe(true);
    expect(ok.tenant).toBe('jxj-2026');
    expect(tenantScopedKey('jxj-2026', '椒香记')).toBe('jxj-2026::椒香记');
  });

  it('enforces the per-token daily llm limit and resets by date', () => {
    process.env.TRIAL_ACCESS_TOKENS = 'jxj-2026';
    process.env.TRIAL_DAILY_LLM_LIMIT = '5';
    const day1 = new Date('2026-06-12T10:00:00.000Z');
    recordTrialLlmUsage('jxj-2026', 5, day1);
    const blocked = resolveTrialAccess('jxj-2026', day1);
    expect(blocked.allowed).toBe(false);
    expect(blocked.reason).toBe('daily-limit-reached');
    expect(accessDeniedMessage(blocked.reason)).toContain('上限');

    const day2 = new Date('2026-06-13T10:00:00.000Z');
    const fresh = resolveTrialAccess('jxj-2026', day2);
    expect(fresh.allowed).toBe(true);
    expect(fresh.remainingToday).toBe(5);
  });

  it('does not meter the dev tenant', () => {
    delete process.env.TRIAL_ACCESS_TOKENS;
    recordTrialLlmUsage('dev', 100);
    expect(resolveTrialAccess(null).allowed).toBe(true);
  });
});

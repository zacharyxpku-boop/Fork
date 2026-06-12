import { NextRequest, NextResponse } from 'next/server';
import { buildTodayActionsPrompt } from '@/lib/restaurant-advisor-prompts';
import type { RestaurantContentIntake } from '@/lib/restaurant-content-prompts';
import { parseLlmJson } from '@/lib/llm-output-parser';
import { llmChat, LlmError } from '@/lib/llm-client';
import { accessDeniedMessage, recordTrialLlmUsage, resolveTrialAccess, tenantScopedKey, TRIAL_TOKEN_HEADER } from '@/lib/trial-access-guard';

interface TodayActionItem {
  title: string;
  doNow: string;
  owner: string;
  evidence: string;
}

function parseActions(output: string): TodayActionItem[] {
  // 先尝试整体数组（模型按要求输出 JSON 数组时 parseLlmJson 会误截首个对象，所以数组优先）
  let raw: unknown = null;
  const fenced = output.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] || output).trim();
  const start = candidate.indexOf('[');
  const end = candidate.lastIndexOf(']');
  if (start !== -1 && end > start) {
    try {
      raw = JSON.parse(candidate.slice(start, end + 1));
    } catch {
      raw = null;
    }
  }
  if (!raw) {
    const direct = parseLlmJson(output);
    raw = direct.ok ? direct.data : null;
  }
  const list = Array.isArray(raw) ? raw : raw && typeof raw === 'object' ? Object.values(raw).find(Array.isArray) : null;
  if (!Array.isArray(list)) return [];
  return list
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map(item => ({
      title: String(item.title || '').trim(),
      doNow: String(item.doNow || item.do_now || '').trim(),
      owner: String(item.owner || '店长').trim(),
      evidence: String(item.evidence || '').trim(),
    }))
    .filter(item => item.title && item.doNow)
    .slice(0, 3);
}

export async function POST(request: NextRequest) {
  let body: { intake?: RestaurantContentIntake };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid-json' }, { status: 400 });
  }
  const intake = body.intake;
  if (!intake?.restaurant || !intake?.offer) {
    return NextResponse.json({ ok: false, error: 'missing-restaurant-or-offer' }, { status: 400 });
  }

  const access = resolveTrialAccess(request.headers.get(TRIAL_TOKEN_HEADER));
  if (!access.allowed) {
    return NextResponse.json({ ok: false, error: `access-${access.reason}`, message: accessDeniedMessage(access.reason) }, { status: 429 });
  }

  const prompt = buildTodayActionsPrompt(intake, tenantScopedKey(access.tenant, intake.restaurant));

  try {
    const result = await llmChat({ system: prompt.system, user: prompt.user, temperature: 0.6, maxTokens: 600 });
    if (result.mode === 'no-key') {
      return NextResponse.json({ ok: true, mode: 'prompt-preview', actions: [] });
    }
    recordTrialLlmUsage(access.tenant, 1);
    const actions = parseActions(result.output);
    if (actions.length < 3) {
      return NextResponse.json({ ok: false, error: 'parse-incomplete', raw: result.output.slice(0, 400) }, { status: 502 });
    }
    return NextResponse.json({ ok: true, mode: 'generated', actions });
  } catch (error) {
    const kind = error instanceof LlmError ? error.kind : 'unknown';
    return NextResponse.json({ ok: false, error: `llm-${kind}` }, { status: 502 });
  }
}

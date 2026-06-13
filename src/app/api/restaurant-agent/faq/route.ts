import { NextRequest, NextResponse } from 'next/server';
import { buildFaqPrompt } from '@/lib/restaurant-advisor-prompts';
import type { RestaurantContentIntake } from '@/lib/restaurant-content-prompts';
import { parseLlmJsonArray } from '@/lib/llm-output-parser';
import { llmChat, LlmError } from '@/lib/llm-client';
import { accessDeniedMessage, recordTrialLlmUsage, resolveTrialAccess, tenantScopedKey, TRIAL_TOKEN_HEADER } from '@/lib/trial-access-guard';

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

  const prompt = buildFaqPrompt(intake, tenantScopedKey(access.tenant, intake.restaurant));
  try {
    const result = await llmChat({ system: prompt.system, user: prompt.user, temperature: 0.5, maxTokens: 1500 });
    if (result.mode === 'no-key') {
      return NextResponse.json({ ok: true, mode: 'prompt-preview', prompt: result.renderedPrompt });
    }
    recordTrialLlmUsage(access.tenant, 1);
    const list = parseLlmJsonArray(result.output) || [];
    const faqs = list
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map(item => ({ q: String(item.q || '').trim(), a: String(item.a || '').trim() }))
      .filter(item => item.q && item.a)
      .slice(0, 10);
    if (faqs.length === 0) {
      return NextResponse.json({ ok: false, error: 'parse-empty' }, { status: 502 });
    }
    return NextResponse.json({
      ok: true,
      mode: 'generated',
      faqs,
      message: '把带【店长补充】的地方填上真实信息，存到手机备忘录或店员群，顾客私信问到直接复制回。',
    });
  } catch (error) {
    const kind = error instanceof LlmError ? error.kind : 'unknown';
    return NextResponse.json({ ok: false, error: `llm-${kind}` }, { status: 502 });
  }
}

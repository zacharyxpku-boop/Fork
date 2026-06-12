import { NextRequest, NextResponse } from 'next/server';
import { buildWeeklyPlanPrompt } from '@/lib/restaurant-advisor-prompts';
import type { RestaurantContentIntake } from '@/lib/restaurant-content-prompts';
import { parseLlmJsonArray } from '@/lib/llm-output-parser';
import { llmChat, LlmError } from '@/lib/llm-client';
import { accessDeniedMessage, recordTrialLlmUsage, resolveTrialAccess, tenantScopedKey, TRIAL_TOKEN_HEADER } from '@/lib/trial-access-guard';

interface WeeklyPlanDay {
  day: string;
  angle: string;
  channel: string;
  publishTime: string;
  why: string;
  hook: string;
}

function parsePlan(output: string): WeeklyPlanDay[] {
  const list = parseLlmJsonArray(output);
  if (!list) return [];
  return list
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map(item => ({
      day: String(item.day || '').trim(),
      angle: String(item.angle || '').trim(),
      channel: String(item.channel || '').trim(),
      publishTime: String(item.publishTime || item.publish_time || '').trim(),
      why: String(item.why || '').trim(),
      hook: String(item.hook || '').trim(),
    }))
    .filter(item => item.day && item.angle)
    .slice(0, 7);
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

  const prompt = buildWeeklyPlanPrompt(intake, tenantScopedKey(access.tenant, intake.restaurant));

  try {
    const result = await llmChat({ system: prompt.system, user: prompt.user, temperature: 0.7, maxTokens: 1400 });
    if (result.mode === 'no-key') {
      return NextResponse.json({
        ok: true,
        mode: 'prompt-preview',
        message: '还没配置 AI 账号。复制下面的指令到任意对话模型，可以得到这家店的一周内容计划。',
        prompt: result.renderedPrompt,
      });
    }
    recordTrialLlmUsage(access.tenant, 1);
    const plan = parsePlan(result.output);
    if (plan.length < 5) {
      return NextResponse.json({ ok: false, error: 'parse-incomplete' }, { status: 502 });
    }
    return NextResponse.json({
      ok: true,
      mode: 'generated',
      plan,
      message: '一周计划是节奏参考，老板按店里实际情况调整；涉及价格和活动的内容发布前逐条核对。',
    });
  } catch (error) {
    const kind = error instanceof LlmError ? error.kind : 'unknown';
    return NextResponse.json({ ok: false, error: `llm-${kind}` }, { status: 502 });
  }
}

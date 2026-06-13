import { NextRequest, NextResponse } from 'next/server';
import { buildBatchReviewPrompt } from '@/lib/restaurant-advisor-prompts';
import type { RestaurantContentIntake } from '@/lib/restaurant-content-prompts';
import { parseLlmJsonArray } from '@/lib/llm-output-parser';
import { llmChat, LlmError } from '@/lib/llm-client';
import { accessDeniedMessage, recordTrialLlmUsage, resolveTrialAccess, tenantScopedKey, TRIAL_TOKEN_HEADER } from '@/lib/trial-access-guard';

interface ReviewReply {
  sentiment: string;
  reply: string;
  needsOffline: boolean;
  offlineNote: string;
}

export async function POST(request: NextRequest) {
  let body: { intake?: RestaurantContentIntake; reviews?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid-json' }, { status: 400 });
  }
  const intake = body.intake;
  const reviews = (body.reviews || '').trim();
  if (!intake?.restaurant || !intake?.offer) {
    return NextResponse.json({ ok: false, error: 'missing-restaurant-or-offer' }, { status: 400 });
  }
  if (!reviews) {
    return NextResponse.json({ ok: false, error: 'missing-reviews' }, { status: 400 });
  }

  const access = resolveTrialAccess(request.headers.get(TRIAL_TOKEN_HEADER));
  if (!access.allowed) {
    return NextResponse.json({ ok: false, error: `access-${access.reason}`, message: accessDeniedMessage(access.reason) }, { status: 429 });
  }

  const prompt = buildBatchReviewPrompt(intake, reviews, tenantScopedKey(access.tenant, intake.restaurant));
  try {
    const result = await llmChat({ system: prompt.system, user: prompt.user, temperature: 0.6, maxTokens: 2000 });
    if (result.mode === 'no-key') {
      return NextResponse.json({ ok: true, mode: 'prompt-preview', prompt: result.renderedPrompt });
    }
    recordTrialLlmUsage(access.tenant, 1);
    const list = parseLlmJsonArray(result.output) || [];
    const replies: ReviewReply[] = list
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map(item => ({
        sentiment: String(item.sentiment || 'neutral'),
        reply: String(item.reply || '').trim(),
        needsOffline: Boolean(item.needs_offline),
        offlineNote: String(item.offline_note || '').trim(),
      }))
      .filter(item => item.reply);
    if (replies.length === 0) {
      return NextResponse.json({ ok: false, error: 'parse-empty' }, { status: 502 });
    }
    return NextResponse.json({
      ok: true,
      mode: 'generated',
      replies,
      message: '回复发出前店长核对：涉及补偿、价格的内容必须和店里实际一致。标了"需线下处理"的差评请优先打电话或当面解决。',
    });
  } catch (error) {
    const kind = error instanceof LlmError ? error.kind : 'unknown';
    return NextResponse.json({ ok: false, error: `llm-${kind}` }, { status: 502 });
  }
}

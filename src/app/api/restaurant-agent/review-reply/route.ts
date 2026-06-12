import { NextRequest, NextResponse } from 'next/server';
import { buildReviewReplySystemPrompt, buildReviewReplyUserPrompt } from '@/lib/restaurant-advisor-prompts';
import type { RestaurantContentIntake } from '@/lib/restaurant-content-prompts';
import { llmChat, LlmError } from '@/lib/llm-client';
import { checkContentFacts } from '@/lib/restaurant-content-fact-check';
import { accessDeniedMessage, recordTrialLlmUsage, resolveTrialAccess, tenantScopedKey, TRIAL_TOKEN_HEADER } from '@/lib/trial-access-guard';

interface ReviewReplyRequestBody {
  intake?: RestaurantContentIntake;
  reviewText?: string;
  sentiment?: 'positive' | 'negative';
}

export async function POST(request: NextRequest) {
  let body: ReviewReplyRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid-json' }, { status: 400 });
  }
  const intake = body.intake;
  const reviewText = (body.reviewText || '').trim();
  const sentiment = body.sentiment === 'positive' ? 'positive' : 'negative';
  if (!intake?.restaurant || !intake?.offer) {
    return NextResponse.json({ ok: false, error: 'missing-restaurant-or-offer' }, { status: 400 });
  }
  if (!reviewText) {
    return NextResponse.json({ ok: false, error: 'missing-review-text' }, { status: 400 });
  }

  const access = resolveTrialAccess(request.headers.get(TRIAL_TOKEN_HEADER));
  if (!access.allowed) {
    return NextResponse.json({ ok: false, error: `access-${access.reason}`, message: accessDeniedMessage(access.reason) }, { status: 429 });
  }

  const system = buildReviewReplySystemPrompt(intake, tenantScopedKey(access.tenant, intake.restaurant));
  const user = buildReviewReplyUserPrompt(reviewText, sentiment);

  try {
    const result = await llmChat({ system, user, temperature: 0.6 });
    if (result.mode === 'no-key') {
      return NextResponse.json({
        ok: true,
        mode: 'prompt-preview',
        message: '还没配置 AI 账号。把下面的指令复制到任意对话模型，会得到针对这条评价的店主回复。',
        prompt: result.renderedPrompt,
      });
    }
    recordTrialLlmUsage(access.tenant, 1);
    return NextResponse.json({
      ok: true,
      mode: 'generated',
      reply: result.output,
      warnings: checkContentFacts(result.output, intake),
      message: '回复发出前店长确认事实：涉及补偿、价格和时段的内容必须和店里实际一致。',
    });
  } catch (error) {
    const kind = error instanceof LlmError ? error.kind : 'unknown';
    return NextResponse.json({ ok: false, error: `llm-${kind}`, message: '回复生成失败，稍后重试。' }, { status: 502 });
  }
}

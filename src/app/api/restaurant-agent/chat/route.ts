import { NextRequest, NextResponse } from 'next/server';
import { buildAdvisorSystemPrompt, buildAdvisorUserPrompt, buildRevisionUserPrompt, type AdvisorProofSummary } from '@/lib/restaurant-advisor-prompts';
import type { RestaurantContentIntake } from '@/lib/restaurant-content-prompts';
import { llmChat, LlmError, type LlmChatMessage } from '@/lib/llm-client';

interface ChatRequestBody {
  intake?: RestaurantContentIntake;
  question?: string;
  history?: LlmChatMessage[];
  proofs?: AdvisorProofSummary[];
  revision?: { previousOutput?: string; feedback?: string };
}

export async function POST(request: NextRequest) {
  let body: ChatRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid-json' }, { status: 400 });
  }
  const intake = body.intake;
  const question = (body.question || '').trim();
  if (!intake?.restaurant || !intake?.offer) {
    return NextResponse.json({ ok: false, error: 'missing-restaurant-or-offer' }, { status: 400 });
  }
  if (!question) {
    return NextResponse.json({ ok: false, error: 'missing-question' }, { status: 400 });
  }

  const system = buildAdvisorSystemPrompt(intake, body.proofs || []);
  const baseUser = buildAdvisorUserPrompt(question);
  const user = body.revision?.previousOutput && body.revision?.feedback
    ? buildRevisionUserPrompt(body.revision.previousOutput, body.revision.feedback, baseUser)
    : baseUser;
  const history = (body.history || []).slice(-6);

  try {
    const result = await llmChat({ system, user, history, temperature: 0.7 });
    if (result.mode === 'no-key') {
      return NextResponse.json({
        ok: true,
        mode: 'prompt-preview',
        message: '还没配置 AI 账号。把下面的指令复制到任意对话模型（如 DeepSeek 网页版），就是这位顾问会说的话。',
        prompt: result.renderedPrompt,
      });
    }
    return NextResponse.json({ ok: true, mode: 'generated', reply: result.output });
  } catch (error) {
    const kind = error instanceof LlmError ? error.kind : 'unknown';
    return NextResponse.json({ ok: false, error: `llm-${kind}`, message: '顾问暂时没回上来，稍后重试。' }, { status: 502 });
  }
}

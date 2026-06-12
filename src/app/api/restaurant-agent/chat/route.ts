import { NextRequest, NextResponse } from 'next/server';
import { buildAdvisorSystemPrompt, buildAdvisorUserPrompt, buildRevisionUserPrompt, type AdvisorProofSummary } from '@/lib/restaurant-advisor-prompts';
import type { RestaurantContentIntake } from '@/lib/restaurant-content-prompts';
import { llmChat, LlmError, type LlmChatMessage } from '@/lib/llm-client';

/** 模型偶尔会用 JSON 数组回建议；这里转成老板能读的编号段落，转不动就原样返回。 */
function humanizeAdvisorReply(raw: string): string {
  const trimmed = (raw || '').trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] || trimmed).trim();
  if (!candidate.startsWith('[') && !candidate.startsWith('{')) return raw;
  try {
    const parsed = JSON.parse(candidate);
    const items = Array.isArray(parsed) ? parsed : [parsed];
    const lines: string[] = [];
    items.forEach((item, index) => {
      if (typeof item !== 'object' || item === null) return;
      const record = item as Record<string, unknown>;
      const action = String(record['建议动作'] || record['建议'] || record['动作'] || record.action || '').trim();
      const owner = String(record['负责人'] || record.owner || '').trim();
      const evidence = String(record['需要留的凭证'] || record['凭证要求'] || record['凭证'] || record.evidence || '').trim();
      if (!action) return;
      let line = `${index + 1}. ${action}`;
      if (owner && !action.includes(`负责人`)) line += `（负责人：${owner}）`;
      if (evidence && !action.includes(evidence)) line += ` 要留的凭证：${evidence}。`;
      lines.push(line);
    });
    return lines.length ? lines.join('\n\n') : raw;
  } catch {
    return raw;
  }
}

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
    return NextResponse.json({ ok: true, mode: 'generated', reply: humanizeAdvisorReply(result.output) });
  } catch (error) {
    const kind = error instanceof LlmError ? error.kind : 'unknown';
    return NextResponse.json({ ok: false, error: `llm-${kind}`, message: '顾问暂时没回上来，稍后重试。' }, { status: 502 });
  }
}

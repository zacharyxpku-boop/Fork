import { NextRequest, NextResponse } from 'next/server';
import { buildAllContentPrompts, type RestaurantContentIntake, type RestaurantContentPrompt } from '@/lib/restaurant-content-prompts';
import { buildRevisionUserPrompt } from '@/lib/restaurant-advisor-prompts';
import { renderRestaurantStoreMemoryForPrompt } from '@/lib/restaurant-store-memory';
import { parseLlmJson, toContentFields, type ContentField } from '@/lib/llm-output-parser';
import { checkContentFacts, type ContentFactWarning } from '@/lib/restaurant-content-fact-check';
import { hasLlmKey, llmChat, LlmError } from '@/lib/llm-client';

interface GeneratedContent {
  kind: RestaurantContentPrompt['kind'];
  label: string;
  output: string;
  fields: ContentField[];
  warnings: ContentFactWarning[];
}

interface ContentRequestBody {
  intake?: RestaurantContentIntake;
  revision?: { kind?: RestaurantContentPrompt['kind']; previousOutput?: string; feedback?: string };
}

function withStoreMemory(prompt: RestaurantContentPrompt, memoryBlock: string): RestaurantContentPrompt {
  if (!memoryBlock) return prompt;
  return { ...prompt, system: `${prompt.system}\n\n${memoryBlock}` };
}

export async function POST(request: NextRequest) {
  let body: ContentRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid-json' }, { status: 400 });
  }
  const intake = body.intake;
  if (!intake?.restaurant || !intake?.offer) {
    return NextResponse.json({ ok: false, error: 'missing-restaurant-or-offer' }, { status: 400 });
  }

  const memoryBlock = renderRestaurantStoreMemoryForPrompt(intake.restaurant);
  const allPrompts = buildAllContentPrompts(intake).map(prompt => withStoreMemory(prompt, memoryBlock));

  const revision = body.revision;
  const isRevision = Boolean(revision?.kind && revision?.previousOutput && revision?.feedback);
  const prompts = isRevision
    ? allPrompts
        .filter(prompt => prompt.kind === revision!.kind)
        .map(prompt => ({ ...prompt, user: buildRevisionUserPrompt(revision!.previousOutput!, revision!.feedback!, prompt.user) }))
    : allPrompts;

  if (prompts.length === 0) {
    return NextResponse.json({ ok: false, error: 'unknown-revision-kind' }, { status: 400 });
  }

  if (!hasLlmKey()) {
    return NextResponse.json({
      ok: true,
      mode: 'prompt-preview',
      message: '还没配置 AI 账号。下面是为这家门店渲染好的生成指令，可以复制到任何对话模型先验证内容质量；配置 DEEPSEEK_API_KEY 后这里会直接返回成品文案。',
      prompts: prompts.map(prompt => ({
        kind: prompt.kind,
        label: prompt.label,
        system: prompt.system,
        user: prompt.user,
        outputSchema: prompt.outputSchema,
      })),
    });
  }

  const results: GeneratedContent[] = [];
  const failures: { kind: string; error: string }[] = [];
  for (const prompt of prompts) {
    try {
      const result = await llmChat({ system: prompt.system, user: prompt.user });
      if (result.mode === 'generated') {
        const parsed = parseLlmJson(result.output);
        results.push({
          kind: prompt.kind,
          label: prompt.label,
          output: result.output,
          fields: parsed.ok ? toContentFields(prompt.kind, parsed.data) : [],
          warnings: checkContentFacts(result.output, intake),
        });
      }
    } catch (error) {
      failures.push({ kind: prompt.kind, error: error instanceof LlmError ? error.kind : 'unknown' });
    }
  }

  return NextResponse.json({
    ok: failures.length < prompts.length,
    mode: 'generated',
    message: failures.length ? `部分内容生成失败（${failures.length}/${prompts.length}），可重试。` : '已生成全部内容，发布前必须由店长逐条确认事实和价格。',
    results,
    failures,
  });
}

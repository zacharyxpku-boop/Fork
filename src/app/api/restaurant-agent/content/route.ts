import { NextRequest, NextResponse } from 'next/server';
import { buildAllContentPrompts, type RestaurantContentIntake, type RestaurantContentPrompt } from '@/lib/restaurant-content-prompts';

interface GeneratedContent {
  kind: RestaurantContentPrompt['kind'];
  label: string;
  output: string;
}

const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';

async function generateWithDeepseek(prompt: RestaurantContentPrompt, apiKey: string): Promise<GeneratedContent> {
  const response = await fetch(DEEPSEEK_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      temperature: 0.8,
      max_tokens: 800,
    }),
  });
  if (!response.ok) {
    throw new Error(`deepseek-http-${response.status}`);
  }
  const payload = await response.json();
  const text: string = payload?.choices?.[0]?.message?.content || '';
  return { kind: prompt.kind, label: prompt.label, output: text };
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

  const prompts = buildAllContentPrompts(intake);
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
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
      results.push(await generateWithDeepseek(prompt, apiKey));
    } catch (error) {
      failures.push({ kind: prompt.kind, error: error instanceof Error ? error.message : 'unknown' });
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

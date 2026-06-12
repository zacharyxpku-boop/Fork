import { NextRequest, NextResponse } from 'next/server';
import { buildAllPosterSpecs, buildPosterSpec, buildVideoPromptRequest, type RestaurantPosterKind } from '@/lib/restaurant-visual-prompts';
import type { RestaurantContentIntake } from '@/lib/restaurant-content-prompts';
import { generateWanxImage, hasWanxKey } from '@/lib/wanx-image';
import { parseLlmJson } from '@/lib/llm-output-parser';
import { llmChat, LlmError } from '@/lib/llm-client';
import { accessDeniedMessage, recordTrialLlmUsage, resolveTrialAccess, TRIAL_TOKEN_HEADER } from '@/lib/trial-access-guard';

interface VisualRequestBody {
  intake?: RestaurantContentIntake;
  action?: 'poster' | 'video-prompt';
  posterKind?: RestaurantPosterKind;
  videoAngle?: { angle: string; hook: string };
}

const POSTER_KINDS: RestaurantPosterKind[] = ['dish-hero', 'dining-scene', 'promo-poster', 'group-card'];

export async function POST(request: NextRequest) {
  let body: VisualRequestBody;
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

  if (body.action === 'video-prompt') {
    const prompt = buildVideoPromptRequest(intake, body.videoAngle);
    try {
      const result = await llmChat({ system: prompt.system, user: prompt.user, temperature: 0.7, maxTokens: 700 });
      if (result.mode === 'no-key') {
        return NextResponse.json({ ok: true, mode: 'prompt-preview', prompt: result.renderedPrompt });
      }
      recordTrialLlmUsage(access.tenant, 1);
      const parsed = parseLlmJson(result.output);
      return NextResponse.json({
        ok: true,
        mode: 'generated',
        videoPrompt: parsed.ok
          ? {
              videoPrompt: String(parsed.data.video_prompt || ''),
              voiceover: String(parsed.data.voiceover || ''),
              duration: String(parsed.data.duration || ''),
            }
          : { videoPrompt: result.output, voiceover: '', duration: '' },
        message: '把视频提示词粘贴到即梦或同类工具生成；画面里不带文字，价格和活动信息后期剪辑时再加。',
      });
    } catch (error) {
      const kind = error instanceof LlmError ? error.kind : 'unknown';
      return NextResponse.json({ ok: false, error: `llm-${kind}` }, { status: 502 });
    }
  }

  // 宣传图：有 AI_API_KEY 走万相直出，否则返回画面提示词让老板贴到即梦/万相网页版
  const kind = body.posterKind && POSTER_KINDS.includes(body.posterKind) ? body.posterKind : null;
  if (!kind) {
    return NextResponse.json({
      ok: true,
      mode: 'spec-list',
      specs: buildAllPosterSpecs(intake).map(spec => ({ kind: spec.kind, label: spec.label, usage: spec.usage })),
      wanxReady: hasWanxKey(),
    });
  }

  const spec = buildPosterSpec(intake, kind);
  if (!hasWanxKey()) {
    return NextResponse.json({
      ok: true,
      mode: 'prompt-preview',
      poster: { kind: spec.kind, label: spec.label, usage: spec.usage, prompt: spec.prompt },
      message: '还没配置生图账号（AI_API_KEY）。复制这段画面描述到即梦或通义万相网页版即可生成；配置后这里直接出图。',
    });
  }

  const result = await generateWanxImage(spec.prompt);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error, poster: { kind: spec.kind, label: spec.label, prompt: spec.prompt } }, { status: 502 });
  }
  return NextResponse.json({
    ok: true,
    mode: 'generated',
    poster: { kind: spec.kind, label: spec.label, usage: spec.usage, prompt: spec.prompt, url: result.url },
    message: '图片链接 24 小时内有效，确认满意请立即保存到手机；AI 生成的菜品图与实物可能有差异，发布平台要求标注 AI 生成时记得勾选。',
  });
}

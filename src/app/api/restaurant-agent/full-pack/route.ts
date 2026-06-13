import { NextRequest, NextResponse } from 'next/server';
import {
  buildStrategyPrompt,
  buildTodayActionsPrompt,
  renderStrategyBlock,
  type RestaurantStrategy,
} from '@/lib/restaurant-advisor-prompts';
import { buildPosterSpec, buildVideoPromptRequest } from '@/lib/restaurant-visual-prompts';
import { buildAllContentPrompts, type RestaurantContentIntake } from '@/lib/restaurant-content-prompts';
import { renderRestaurantStoreMemoryForPrompt } from '@/lib/restaurant-store-memory';
import { parseLlmJson, parseLlmJsonArray, toContentFields } from '@/lib/llm-output-parser';
import { checkContentFacts } from '@/lib/restaurant-content-fact-check';
import { generateWanxImage, hasWanxKey, persistWanxImage } from '@/lib/wanx-image';
import { hasLlmKey, llmChat, LlmError } from '@/lib/llm-client';
import { accessDeniedMessage, recordTrialLlmUsage, resolveTrialAccess, tenantScopedKey, TRIAL_TOKEN_HEADER } from '@/lib/trial-access-guard';

/**
 * 一键出餐：老板点一下拿到当天全套成品。
 * 第一步先做经营推理（最强卖点/客群洞察/本周主攻/语气/风险），
 * 推理结果注入所有下游生成，保证文案、三件事、视频稿共享同一个策略判断。
 */

function parseStrategy(output: string): RestaurantStrategy | null {
  const parsed = parseLlmJson(output);
  if (!parsed.ok) return null;
  const text = (key: string) => String(parsed.data[key] || '').trim();
  const strategy: RestaurantStrategy = {
    strongestSellingPoint: text('strongest_selling_point'),
    customerInsight: text('customer_insight'),
    hiddenOpportunity: text('hidden_opportunity'),
    weekFocus: text('week_focus'),
    tone: text('tone'),
    riskNote: text('risk_note'),
  };
  return strategy.strongestSellingPoint && strategy.weekFocus ? strategy : null;
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
  if (!hasLlmKey()) {
    return NextResponse.json({ ok: false, error: 'no-key', message: '一键出餐需要配置 AI 账号（DEEPSEEK_API_KEY）。' }, { status: 503 });
  }

  const access = resolveTrialAccess(request.headers.get(TRIAL_TOKEN_HEADER));
  if (!access.allowed) {
    return NextResponse.json({ ok: false, error: `access-${access.reason}`, message: accessDeniedMessage(access.reason) }, { status: 429 });
  }
  const memoryScope = tenantScopedKey(access.tenant, intake.restaurant);

  try {
    // 第一步：经营推理（内嵌 reasoning，串行，后续全部依赖它）
    const strategyPrompt = buildStrategyPrompt(intake, memoryScope);
    const strategyResult = await llmChat({ system: strategyPrompt.system, user: strategyPrompt.user, temperature: 0.5, maxTokens: 500 });
    if (strategyResult.mode !== 'generated') {
      return NextResponse.json({ ok: false, error: 'strategy-unavailable' }, { status: 502 });
    }
    const strategy = parseStrategy(strategyResult.output);
    const strategyBlock = strategy ? renderStrategyBlock(strategy) : '';
    const memoryBlock = renderRestaurantStoreMemoryForPrompt(memoryScope);

    const withStrategy = (system: string) => [system, strategyBlock].filter(Boolean).join('\n\n');

    // 第二步：并行生成全套（4 条文案 + 三件事 + 视频稿 + 海报）
    const contentPrompts = buildAllContentPrompts(intake).map(prompt => ({
      ...prompt,
      system: withStrategy(memoryBlock ? `${prompt.system}\n\n${memoryBlock}` : prompt.system),
    }));
    const actionsPrompt = buildTodayActionsPrompt(intake, memoryScope);
    const videoPrompt = buildVideoPromptRequest(intake, strategy ? { angle: strategy.weekFocus, hook: strategy.strongestSellingPoint } : undefined);
    const posterSpec = buildPosterSpec(intake, 'dish-hero');

    const [contentResults, actionsResult, videoResult, posterResult] = await Promise.all([
      Promise.all(contentPrompts.map(async prompt => {
        try {
          const result = await llmChat({ system: prompt.system, user: prompt.user });
          if (result.mode !== 'generated') return null;
          const parsed = parseLlmJson(result.output);
          return {
            kind: prompt.kind,
            label: prompt.label,
            output: result.output,
            fields: parsed.ok ? toContentFields(prompt.kind, parsed.data) : [],
            warnings: checkContentFacts(result.output, intake),
          };
        } catch {
          return null;
        }
      })),
      llmChat({ system: withStrategy(actionsPrompt.system), user: actionsPrompt.user, temperature: 0.6, maxTokens: 600 }).catch(() => null),
      llmChat({ system: withStrategy(videoPrompt.system), user: videoPrompt.user, temperature: 0.7, maxTokens: 700 }).catch(() => null),
      hasWanxKey() ? generateWanxImage(posterSpec.prompt).catch(() => null) : Promise.resolve(null),
    ]);

    const contents = contentResults.filter(Boolean);
    const actions = actionsResult && actionsResult.mode === 'generated'
      ? (parseLlmJsonArray(actionsResult.output) || [])
          .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
          .map(item => ({
            title: String(item.title || '').trim(),
            doNow: String(item.doNow || item.do_now || '').trim(),
            owner: String(item.owner || '店长').trim(),
            evidence: String(item.evidence || '').trim(),
          }))
          .filter(item => item.title && item.doNow)
          .slice(0, 3)
      : [];
    let video: { videoPrompt: string; voiceover: string; duration: string } | null = null;
    if (videoResult && videoResult.mode === 'generated') {
      const parsed = parseLlmJson(videoResult.output);
      video = parsed.ok
        ? { videoPrompt: String(parsed.data.video_prompt || ''), voiceover: String(parsed.data.voiceover || ''), duration: String(parsed.data.duration || '') }
        : { videoPrompt: videoResult.output, voiceover: '', duration: '' };
    }

    const llmCalls = 1 + contents.length + (actionsResult ? 1 : 0) + (videoResult ? 1 : 0);
    recordTrialLlmUsage(access.tenant, llmCalls);

    return NextResponse.json({
      ok: true,
      mode: 'generated',
      strategy,
      contents,
      actions,
      video,
      poster: posterResult && posterResult.ok
        ? { label: posterSpec.label, url: (await persistWanxImage(posterResult.url)) || posterResult.url, prompt: posterSpec.prompt }
        : { label: posterSpec.label, prompt: posterSpec.prompt },
      posterLive: Boolean(posterResult && posterResult.ok),
      message: '全套已生成。发布前店长逐条确认事实和价格；图片如已生成请尽快保存。',
    });
  } catch (error) {
    const kind = error instanceof LlmError ? error.kind : 'unknown';
    return NextResponse.json({ ok: false, error: `llm-${kind}` }, { status: 502 });
  }
}

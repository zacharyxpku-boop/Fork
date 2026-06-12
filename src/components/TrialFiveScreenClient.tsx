'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  buildShareSummary,
  deriveTodayActions,
  deriveTomorrowPlan,
  type TrialMemoryNote,
  type TrialProofEntry,
} from '@/lib/restaurant-trial-five-screen';
import { buildFactChecklist } from '@/lib/llm-output-parser';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

const STORAGE_KEYS = {
  intake: 'wenai-trial-intake',
  proofs: 'wenai-trial-proofs',
  content: 'wenai-trial-content',
  step: 'wenai-trial-step',
  advisor: 'wenai-trial-advisor',
  token: 'wenai-trial-token',
} as const;

interface AdvisorTurn {
  role: 'user' | 'assistant';
  content: string;
}

interface ContentPromptPreview {
  kind: string;
  label: string;
  system: string;
  user: string;
}

interface ContentGenerated {
  kind: string;
  label: string;
  output: string;
  fields?: { key: string; label: string; value: string }[];
  warnings?: { code: string; message: string }[];
}

interface ContentState {
  mode: 'prompt-preview' | 'generated';
  message: string;
  prompts?: ContentPromptPreview[];
  results?: ContentGenerated[];
}

const EMPTY_INTAKE: RestaurantTrialIntake = {
  restaurant: '',
  offer: '',
  audience: '',
  channels: '',
  visitReason: '',
  constraints: '',
  evidence: '',
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable (private mode); the flow still works in-memory
  }
}

const STEP_TITLES = ['填门店', '今天三件事', '能直接发的内容', '回填凭证', '明日动作'] as const;

export function TrialFiveScreenClient() {
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(1);
  const [intake, setIntake] = useState<RestaurantTrialIntake>(EMPTY_INTAKE);
  const [proofs, setProofs] = useState<TrialProofEntry[]>([]);
  const [content, setContent] = useState<ContentState | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState('');
  const [copyFeedback, setCopyFeedback] = useState('');
  const [proofDraft, setProofDraft] = useState({ channel: '', proofUrl: '', note: '' });
  const [revisionDrafts, setRevisionDrafts] = useState<Record<string, string>>({});
  const [revisionBusy, setRevisionBusy] = useState('');
  const [reviewDraft, setReviewDraft] = useState({ text: '', sentiment: 'negative' as 'positive' | 'negative' });
  const [reviewResult, setReviewResult] = useState<{ mode: string; text: string } | null>(null);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [advisorQuestion, setAdvisorQuestion] = useState('');
  const [advisorResult, setAdvisorResult] = useState<{ mode: string; text: string } | null>(null);
  const [advisorBusy, setAdvisorBusy] = useState(false);
  const [advisorTurns, setAdvisorTurns] = useState<AdvisorTurn[]>([]);
  const [memoryNotes, setMemoryNotes] = useState<TrialMemoryNote[]>([]);
  const [accessToken, setAccessToken] = useState('');

  function apiHeaders(): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (accessToken.trim()) headers['x-trial-token'] = accessToken.trim();
    return headers;
  }

  useEffect(() => {
    setIntake(readJson(STORAGE_KEYS.intake, EMPTY_INTAKE));
    setProofs(readJson(STORAGE_KEYS.proofs, [] as TrialProofEntry[]));
    setContent(readJson<ContentState | null>(STORAGE_KEYS.content, null));
    setStep(readJson(STORAGE_KEYS.step, 1));
    setAdvisorTurns(readJson(STORAGE_KEYS.advisor, [] as AdvisorTurn[]));
    try { setAccessToken(window.localStorage.getItem(STORAGE_KEYS.token) || ''); } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeJson(STORAGE_KEYS.intake, intake);
  }, [hydrated, intake]);
  useEffect(() => {
    if (hydrated) writeJson(STORAGE_KEYS.proofs, proofs);
  }, [hydrated, proofs]);
  useEffect(() => {
    if (hydrated && content) writeJson(STORAGE_KEYS.content, content);
  }, [hydrated, content]);
  useEffect(() => {
    if (hydrated) writeJson(STORAGE_KEYS.step, step);
  }, [hydrated, step]);
  useEffect(() => {
    if (hydrated) writeJson(STORAGE_KEYS.advisor, advisorTurns.slice(-12));
  }, [hydrated, advisorTurns]);
  useEffect(() => {
    if (hydrated) { try { window.localStorage.setItem(STORAGE_KEYS.token, accessToken); } catch { /* ignore */ } }
  }, [hydrated, accessToken]);

  const intakeReady = Boolean(intake.restaurant && intake.offer);
  const todayActions = useMemo(() => (intakeReady ? deriveTodayActions(intake) : []), [intake, intakeReady]);
  const tomorrowPlan = useMemo(
    () => (intakeReady ? deriveTomorrowPlan(intake, proofs, memoryNotes) : []),
    [intake, intakeReady, proofs, memoryNotes],
  );

  useEffect(() => {
    if (!hydrated || !intake.restaurant) return;
    fetch('/api/restaurant-agent/memory', {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify({ action: 'list', restaurant: intake.restaurant }),
    })
      .then(response => response.json())
      .then(payload => {
        if (payload?.ok && Array.isArray(payload.entries)) {
          setMemoryNotes(payload.entries.map((entry: { kind: string; note: string }) => ({ kind: entry.kind, note: entry.note })));
        }
      })
      .catch(() => {
        // 记忆读不到不阻塞主流程
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- apiHeaders 仅依赖 accessToken，已在依赖里
  }, [hydrated, intake.restaurant, accessToken]);

  function rememberRevisionPreference(feedback: string) {
    if (!intake.restaurant) return;
    void fetch('/api/restaurant-agent/memory', {
      method: 'POST',
      headers: apiHeaders(),
      body: JSON.stringify({ restaurant: intake.restaurant, kind: 'revision-preference', note: feedback, source: 'revision' }),
    }).catch(() => undefined);
  }

  async function reviseContent(kind: string, previousOutput: string) {
    const feedback = (revisionDrafts[kind] || '').trim();
    if (!feedback) return;
    setRevisionBusy(kind);
    try {
      const response = await fetch('/api/restaurant-agent/content', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ intake, revision: { kind, previousOutput, feedback } }),
      });
      const payload = await response.json();
      if (!payload?.ok) throw new Error(payload?.error || 'revision-failed');
      setContent(previous => {
        if (!previous) return previous;
        if (payload.mode === 'prompt-preview' && payload.prompts?.[0]) {
          return {
            ...previous,
            prompts: (previous.prompts || []).map(p => (p.kind === kind ? payload.prompts[0] : p)),
          };
        }
        if (payload.mode === 'generated' && payload.results?.[0]) {
          return {
            ...previous,
            results: (previous.results || []).map(r => (r.kind === kind ? payload.results[0] : r)),
          };
        }
        return previous;
      });
      rememberRevisionPreference(feedback);
      setRevisionDrafts(previous => ({ ...previous, [kind]: '' }));
      setCopyFeedback('已按你的意见重新生成这条');
      window.setTimeout(() => setCopyFeedback(''), 2500);
    } catch {
      setCopyFeedback('重新生成失败，稍后再试');
      window.setTimeout(() => setCopyFeedback(''), 2500);
    } finally {
      setRevisionBusy('');
    }
  }

  async function submitReviewReply() {
    if (!reviewDraft.text.trim()) return;
    setReviewBusy(true);
    setReviewResult(null);
    try {
      const response = await fetch('/api/restaurant-agent/review-reply', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ intake, reviewText: reviewDraft.text, sentiment: reviewDraft.sentiment }),
      });
      const payload = await response.json();
      if (!payload?.ok) throw new Error(payload?.error || 'review-reply-failed');
      setReviewResult(
        payload.mode === 'prompt-preview'
          ? { mode: 'prompt-preview', text: `${payload.prompt.system}\n\n${payload.prompt.user}` }
          : { mode: 'generated', text: payload.reply },
      );
    } catch {
      setReviewResult({ mode: 'error', text: '生成失败，稍后再试。' });
    } finally {
      setReviewBusy(false);
    }
  }

  async function askAdvisor() {
    const question = advisorQuestion.trim();
    if (!question) return;
    setAdvisorBusy(true);
    setAdvisorResult(null);
    try {
      const response = await fetch('/api/restaurant-agent/chat', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({
          intake,
          question,
          history: advisorTurns.slice(-6),
          proofs: proofs.map(proof => ({ channel: proof.channel, note: proof.proofUrl || proof.note })),
        }),
      });
      const payload = await response.json();
      if (!payload?.ok) throw new Error(payload?.error || 'chat-failed');
      if (payload.mode === 'prompt-preview') {
        setAdvisorResult({ mode: 'prompt-preview', text: `${payload.prompt.system}\n\n${payload.prompt.user}` });
      } else {
        setAdvisorResult({ mode: 'generated', text: payload.reply });
        setAdvisorTurns(previous => [...previous, { role: 'user', content: question }, { role: 'assistant', content: payload.reply }]);
        setAdvisorQuestion('');
      }
    } catch {
      setAdvisorResult({ mode: 'error', text: '顾问暂时没回上来，稍后再试。' });
    } finally {
      setAdvisorBusy(false);
    }
  }

  async function copyText(text: string, label: string) {
    let copied = false;
    try {
      await navigator.clipboard.writeText(text);
      copied = true;
    } catch {
      // 微信内置浏览器等环境没有 clipboard API，用隐藏 textarea 兜底
      try {
        const holder = document.createElement('textarea');
        holder.value = text;
        holder.style.position = 'fixed';
        holder.style.opacity = '0';
        document.body.appendChild(holder);
        holder.select();
        copied = document.execCommand('copy');
        document.body.removeChild(holder);
      } catch {
        copied = false;
      }
    }
    setCopyFeedback(copied ? `已复制：${label}` : '复制失败，请手动长按选择文本');
    window.setTimeout(() => setCopyFeedback(''), 2500);
  }

  async function generateContent() {
    setContentLoading(true);
    setContentError('');
    try {
      const response = await fetch('/api/restaurant-agent/content', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ intake }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.ok) {
        throw new Error(payload?.error || `http-${response.status}`);
      }
      setContent({
        mode: payload.mode,
        message: payload.message,
        prompts: payload.prompts,
        results: payload.results,
      });
    } catch (error) {
      setContentError(error instanceof Error ? error.message : '生成失败，请重试');
    } finally {
      setContentLoading(false);
    }
  }

  function addProof() {
    if (!proofDraft.channel || (!proofDraft.proofUrl && !proofDraft.note)) return;
    const entry: TrialProofEntry = {
      id: `proof-${proofs.length + 1}-${proofDraft.channel}`,
      channel: proofDraft.channel,
      proofUrl: proofDraft.proofUrl,
      note: proofDraft.note,
      recordedAt: new Date().toISOString(),
    };
    setProofs(previous => [...previous, entry]);
    setProofDraft({ channel: '', proofUrl: '', note: '' });
  }

  function resetAll() {
    for (const key of Object.values(STORAGE_KEYS)) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // ignore
      }
    }
    setIntake(EMPTY_INTAKE);
    setProofs([]);
    setContent(null);
    setStep(1);
    setAdvisorTurns([]);
    setAdvisorResult(null);
  }

  function shareCurrentScreen() {
    const text = buildShareSummary({
      screen: step as 1 | 2 | 3 | 4 | 5,
      intake,
      todayActions,
      proofs,
      tomorrow: tomorrowPlan,
    });
    void copyText(text, '给店长的微信摘要');
  }

  const field = (label: string, key: keyof RestaurantTrialIntake, props: { textarea?: boolean; placeholder?: string } = {}) => (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-stone-800">{label}</span>
      {props.textarea ? (
        <textarea
          className="w-full border border-stone-300 bg-white p-3 text-base leading-6 text-stone-900"
          rows={3}
          placeholder={props.placeholder}
          value={intake[key] || ''}
          onChange={event => setIntake(previous => ({ ...previous, [key]: event.target.value }))}
        />
      ) : (
        <input
          className="w-full border border-stone-300 bg-white p-3 text-base text-stone-900"
          placeholder={props.placeholder}
          value={intake[key] || ''}
          onChange={event => setIntake(previous => ({ ...previous, [key]: event.target.value }))}
        />
      )}
    </label>
  );

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-24">
      <nav aria-label="步骤" className="sticky top-0 z-10 -mx-4 mb-4 flex gap-1 overflow-x-auto bg-[#faf9f6] px-4 py-3">
        {STEP_TITLES.map((title, index) => {
          const number = index + 1;
          const active = step === number;
          return (
            <button
              key={title}
              type="button"
              onClick={() => setStep(number)}
              className={`shrink-0 border px-2 py-1 text-xs font-semibold ${active ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 bg-white text-stone-600'}`}
            >
              {number} {title}
            </button>
          );
        })}
      </nav>

      {copyFeedback ? <p className="mb-3 border border-emerald-300 bg-emerald-50 p-2 text-sm text-emerald-800">{copyFeedback}</p> : null}

      {step === 1 ? (
        <section aria-label="第一屏">
          <div className="space-y-4">
            {field('门店名称', 'restaurant', { placeholder: '例：椒香记·川味面馆（国贸店）' })}
            {field('主推菜 / 套餐（带价格）', 'offer', { placeholder: '例：藤椒鸡丝拌面双人套餐 ¥59.9' })}
            {field('目标客群', 'audience', { placeholder: '例：附近三公里写字楼晚餐白领' })}
            {field('主推渠道', 'channels', { placeholder: '例：大众点评 / 小红书 / 微信社群' })}
            {field('到店理由', 'visitReason', { textarea: true, placeholder: '例：工作日 17:30-20:00 到店免排队，套餐送酸梅汤' })}
            {field('活动边界（必须遵守的限制）', 'constraints', { textarea: true, placeholder: '例：周末不适用；每桌限一张券；每天限量 40 份' })}
            {field('已有素材', 'evidence', { textarea: true, placeholder: '例：菜单截图、菜品图、团购券规则截图' })}
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-stone-800">试用口令（发起试用的人给你的）</span>
              <input
                className="w-full border border-stone-300 bg-white p-3 text-base text-stone-900"
                placeholder="没有口令可先体验，AI 生成需要口令"
                value={accessToken}
                onChange={event => setAccessToken(event.target.value)}
              />
            </label>
          </div>
          <button
            type="button"
            disabled={!intakeReady}
            onClick={() => setStep(2)}
            className="mt-5 w-full border border-stone-900 bg-stone-900 p-3 text-base font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            生成今天的三件事
          </button>
          {!intakeReady ? <p className="mt-2 text-sm text-stone-500">先填门店名称和主推套餐，其他可以稍后补。</p> : null}
        </section>
      ) : null}

      {step === 2 ? (
        <section aria-label="第二屏">
          <div className="space-y-3">
            {todayActions.map((action, index) => (
              <article key={action.id} className="border border-stone-300 bg-white p-4">
                <h3 className="text-base font-bold text-stone-900">{index + 1}. {action.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-700">{action.doNow}</p>
                <p className="mt-2 text-sm text-stone-600">负责人：{action.ownerLabel}</p>
                <p className="mt-1 text-sm text-stone-600">要留的凭证：{action.evidenceRequired}</p>
              </article>
            ))}
          </div>
          <button type="button" onClick={() => setStep(3)} className="mt-5 w-full border border-stone-900 bg-stone-900 p-3 text-base font-bold text-white">
            看能直接发的内容
          </button>
        </section>
      ) : null}

      {step === 3 ? (
        <section aria-label="第三屏">
          {!content ? (
            <div>
              <p className="text-sm leading-6 text-stone-700">为「{intake.offer || '主推套餐'}」准备四类渠道内容：小红书探店、点评好评回复、差评挽回、社群话术。</p>
              <button
                type="button"
                disabled={contentLoading}
                onClick={() => void generateContent()}
                className="mt-4 w-full border border-stone-900 bg-stone-900 p-3 text-base font-bold text-white disabled:opacity-50"
              >
                {contentLoading ? '正在准备…' : '准备渠道内容'}
              </button>
              {contentError ? <p className="mt-2 text-sm text-rose-700">出错了：{contentError}</p> : null}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-900">{content.message}</p>
              {content.mode === 'prompt-preview'
                ? (content.prompts || []).map(prompt => (
                    <article key={prompt.kind} className="border border-stone-300 bg-white p-4">
                      <h3 className="text-base font-bold text-stone-900">{prompt.label}</h3>
                      <p className="mt-1 text-sm text-stone-600">复制下面的指令到任意对话模型（如 DeepSeek 网页版）生成内容。</p>
                      <button
                        type="button"
                        onClick={() => void copyText(`${prompt.system}\n\n${prompt.user}`, prompt.label)}
                        className="mt-3 w-full border border-stone-900 p-2 text-sm font-bold text-stone-900"
                      >
                        一键复制生成指令
                      </button>
                      <div className="mt-3 border-t border-stone-200 pt-3">
                        <input
                          className="w-full border border-stone-300 p-2 text-sm"
                          placeholder="不满意？说哪里不行，例：太文艺了，口语点"
                          value={revisionDrafts[prompt.kind] || ''}
                          onChange={event => setRevisionDrafts(previous => ({ ...previous, [prompt.kind]: event.target.value }))}
                        />
                        <button
                          type="button"
                          disabled={revisionBusy === prompt.kind || !(revisionDrafts[prompt.kind] || '').trim()}
                          onClick={() => void reviseContent(prompt.kind, prompt.user)}
                          className="mt-2 w-full border border-stone-400 p-2 text-sm font-bold text-stone-700 disabled:opacity-40"
                        >
                          {revisionBusy === prompt.kind ? '正在改…' : '按我的意见重新生成'}
                        </button>
                      </div>
                    </article>
                  ))
                : (content.results || []).map(result => (
                    <article key={result.kind} className="border border-stone-300 bg-white p-4">
                      <h3 className="text-base font-bold text-stone-900">{result.label}</h3>
                      {result.warnings && result.warnings.length > 0 ? (
                        <div className="mt-2 border border-rose-300 bg-rose-50 p-2">
                          <p className="text-xs font-bold text-rose-800">发布前必须处理：</p>
                          {result.warnings.map(warning => (
                            <p key={`${warning.code}-${warning.message}`} className="mt-1 text-xs leading-5 text-rose-700">· {warning.message}</p>
                          ))}
                        </div>
                      ) : null}
                      {result.fields && result.fields.length > 0 ? (
                        <div className="mt-2 space-y-3">
                          {result.fields.map(fieldItem => (
                            <div key={fieldItem.key}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold text-stone-500">{fieldItem.label}</span>
                                <button
                                  type="button"
                                  onClick={() => void copyText(fieldItem.value, `${result.label}·${fieldItem.label}`)}
                                  className="border border-stone-300 px-2 py-1 text-xs font-bold text-stone-600"
                                >
                                  复制
                                </button>
                              </div>
                              <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-stone-800">{fieldItem.value}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <pre className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-stone-800">{result.output}</pre>
                      )}
                      <button
                        type="button"
                        onClick={() => void copyText(result.fields?.length ? result.fields.map(fieldItem => fieldItem.value).join('\n\n') : result.output, result.label)}
                        className="mt-3 w-full border border-stone-900 p-2 text-sm font-bold text-stone-900"
                      >
                        复制整条内容
                      </button>
                      <div className="mt-3 border-t border-stone-200 pt-3">
                        <input
                          className="w-full border border-stone-300 p-2 text-sm"
                          placeholder="不满意？说哪里不行，例：太文艺了，口语点"
                          value={revisionDrafts[result.kind] || ''}
                          onChange={event => setRevisionDrafts(previous => ({ ...previous, [result.kind]: event.target.value }))}
                        />
                        <button
                          type="button"
                          disabled={revisionBusy === result.kind || !(revisionDrafts[result.kind] || '').trim()}
                          onClick={() => void reviseContent(result.kind, result.output)}
                          className="mt-2 w-full border border-stone-400 p-2 text-sm font-bold text-stone-700 disabled:opacity-40"
                        >
                          {revisionBusy === result.kind ? '正在改…' : '按我的意见重新生成'}
                        </button>
                      </div>
                    </article>
                  ))}
              <div className="border border-stone-300 bg-stone-100 p-3">
                <p className="text-sm font-semibold leading-6 text-stone-800">发布前店长逐条确认事实和价格，逐项过一遍：</p>
                <ul className="mt-2 space-y-1">
                  {buildFactChecklist(intake).map(item => (
                    <li key={item} className="text-sm leading-6 text-stone-700">□ {item}</li>
                  ))}
                </ul>
              </div>
              <details className="border border-stone-300 bg-white p-4">
                <summary className="cursor-pointer text-base font-bold text-stone-900">收到顾客评价？粘贴进来生成店主回复</summary>
                <div className="mt-3 space-y-3">
                  <textarea
                    className="w-full border border-stone-300 p-3 text-sm leading-6"
                    rows={4}
                    placeholder="把顾客评价原文粘贴到这里，例：等位四十分钟，面都坨了…"
                    value={reviewDraft.text}
                    onChange={event => setReviewDraft(previous => ({ ...previous, text: event.target.value }))}
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setReviewDraft(previous => ({ ...previous, sentiment: 'negative' }))}
                      className={`flex-1 border p-2 text-sm font-bold ${reviewDraft.sentiment === 'negative' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 text-stone-600'}`}
                    >
                      这是差评
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewDraft(previous => ({ ...previous, sentiment: 'positive' }))}
                      className={`flex-1 border p-2 text-sm font-bold ${reviewDraft.sentiment === 'positive' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 text-stone-600'}`}
                    >
                      这是好评
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={reviewBusy || !reviewDraft.text.trim()}
                    onClick={() => void submitReviewReply()}
                    className="w-full border border-stone-900 bg-stone-900 p-3 text-base font-bold text-white disabled:opacity-40"
                  >
                    {reviewBusy ? '正在写…' : '生成店主回复'}
                  </button>
                  {reviewResult ? (
                    <div className="border border-stone-300 bg-stone-50 p-3">
                      {reviewResult.mode === 'prompt-preview' ? (
                        <p className="text-sm text-stone-600">还没配置 AI 账号，复制下面的指令到任意对话模型即可得到回复。</p>
                      ) : null}
                      <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-6 text-stone-800">{reviewResult.text}</pre>
                      <button
                        type="button"
                        onClick={() => void copyText(reviewResult.text, '店主回复')}
                        className="mt-2 w-full border border-stone-900 p-2 text-sm font-bold text-stone-900"
                      >
                        复制
                      </button>
                    </div>
                  ) : null}
                </div>
              </details>
            </div>
          )}
          <button type="button" onClick={() => setStep(4)} className="mt-5 w-full border border-stone-400 bg-white p-3 text-base font-bold text-stone-800">
            发完了，去回填凭证
          </button>
        </section>
      ) : null}

      {step === 4 ? (
        <section aria-label="第四屏">
          <div className="space-y-3 border border-stone-300 bg-white p-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-stone-800">发布渠道</span>
              <input
                className="w-full border border-stone-300 p-3 text-base"
                placeholder="例：小红书 / 大众点评 / 微信社群"
                value={proofDraft.channel}
                onChange={event => setProofDraft(previous => ({ ...previous, channel: event.target.value }))}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-stone-800">公开链接（没有就留空）</span>
              <input
                className="w-full border border-stone-300 p-3 text-base"
                placeholder="例：https://..."
                value={proofDraft.proofUrl}
                onChange={event => setProofDraft(previous => ({ ...previous, proofUrl: event.target.value }))}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-stone-800">截图说明 / 备注</span>
              <input
                className="w-full border border-stone-300 p-3 text-base"
                placeholder="例：已发小红书，截图存在店长手机相册"
                value={proofDraft.note}
                onChange={event => setProofDraft(previous => ({ ...previous, note: event.target.value }))}
              />
            </label>
            <button type="button" onClick={addProof} className="w-full border border-stone-900 bg-stone-900 p-3 text-base font-bold text-white">
              回填这条凭证
            </button>
          </div>
          <div className="mt-4 space-y-2">
            {proofs.length === 0 ? (
              <p className="border border-stone-300 bg-stone-100 p-3 text-sm text-stone-700">还没有回填凭证。待补资料：发布后把链接或截图说明填回来，明天的复盘才有依据。</p>
            ) : (
              proofs.map(proof => (
                <p key={proof.id} className="border border-stone-300 bg-white p-3 text-sm text-stone-800">
                  <span className="font-semibold">{proof.channel}</span>：{proof.proofUrl || proof.note}
                </p>
              ))
            )}
          </div>
          <button type="button" onClick={() => setStep(5)} className="mt-5 w-full border border-stone-900 bg-stone-900 p-3 text-base font-bold text-white">
            看明天怎么干
          </button>
        </section>
      ) : null}

      {step === 5 ? (
        <section aria-label="第五屏">
          <div className="space-y-3">
            {tomorrowPlan.map(item => (
              <article key={item.id} className={`border p-4 ${item.kind === 'missing-material' ? 'border-amber-400 bg-amber-50' : 'border-stone-300 bg-white'}`}>
                <h3 className="text-base font-bold text-stone-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-stone-700">{item.detail}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 border border-stone-300 bg-white p-4">
            <h3 className="text-base font-bold text-stone-900">问顾问一句</h3>
            <p className="mt-1 text-sm text-stone-600">例：周三晚上没人来怎么办？顾问知道你的门店、边界和今天的凭证。</p>
            {advisorTurns.length > 0 ? (
              <div className="mt-3 max-h-48 space-y-2 overflow-y-auto border border-stone-200 bg-stone-50 p-2">
                {advisorTurns.slice(-6).map((turn, index) => (
                  <p key={`${turn.role}-${index}`} className={`whitespace-pre-wrap break-words text-sm leading-6 ${turn.role === 'user' ? 'font-semibold text-stone-900' : 'text-stone-700'}`}>
                    {turn.role === 'user' ? '你：' : '顾问：'}{turn.content}
                  </p>
                ))}
              </div>
            ) : null}
            <input
              className="mt-3 w-full border border-stone-300 p-3 text-base"
              placeholder="输入你的问题"
              value={advisorQuestion}
              onChange={event => setAdvisorQuestion(event.target.value)}
            />
            <button
              type="button"
              disabled={advisorBusy || !advisorQuestion.trim()}
              onClick={() => void askAdvisor()}
              className="mt-3 w-full border border-stone-900 bg-stone-900 p-3 text-base font-bold text-white disabled:opacity-40"
            >
              {advisorBusy ? '顾问在想…' : '问顾问'}
            </button>
            {advisorResult ? (
              <div className="mt-3 border border-stone-300 bg-stone-50 p-3">
                {advisorResult.mode === 'prompt-preview' ? (
                  <p className="text-sm text-stone-600">还没配置 AI 账号，复制下面的指令到任意对话模型，就是顾问会说的话。</p>
                ) : null}
                <pre className="mt-2 max-h-48 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-6 text-stone-800">{advisorResult.text}</pre>
                <button
                  type="button"
                  onClick={() => void copyText(advisorResult.text, '顾问回答')}
                  className="mt-2 w-full border border-stone-900 p-2 text-sm font-bold text-stone-900"
                >
                  复制
                </button>
              </div>
            ) : null}
          </div>
          <button type="button" onClick={resetAll} className="mt-6 w-full border border-stone-400 bg-white p-3 text-base font-bold text-stone-700">
            清空重来（换一家门店）
          </button>
        </section>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 border-t border-stone-300 bg-white p-3">
        <button type="button" onClick={shareCurrentScreen} className="mx-auto block w-full max-w-md border border-stone-900 p-3 text-base font-bold text-stone-900">
          分享给店长（复制微信摘要）
        </button>
      </div>
    </div>
  );
}

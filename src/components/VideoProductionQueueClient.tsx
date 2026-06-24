'use client';

import { useState, type FormEvent } from 'react';

import { FactoryFriendTrialExperience } from '@/components/FactoryFriendTrialExperience';
import { FactoryVariantConsole } from '@/components/FactoryVariantConsole';
import type { FactoryUiVariantId } from '@/lib/factory-readiness-view';
import type { OneClickVideoOperationResult, VideoProductionQueue } from '@/lib/industrial-video-workflow';
import {
  buildRestaurantContentDeliveryPack,
  type RestaurantContentChannel,
} from '@/lib/restaurant-content-delivery-pack';
import { buildRestaurantVideoProductionPassport } from '@/lib/restaurant-video-production-passport';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

const DEFAULT_PLATFORMS = '大众点评,小红书,抖音,微信社群';

function parseRestaurantContentChannels(value: string): RestaurantContentChannel[] {
  const normalized = value.toLowerCase();
  const channels: RestaurantContentChannel[] = [];

  if (/大众点评|点评|dianping/.test(normalized)) channels.push('dianping');
  if (/小红书|xiaohongshu|red/.test(normalized)) channels.push('xiaohongshu');
  if (/抖音|douyin|tiktok/.test(normalized)) channels.push('douyin');
  if (/微信|社群|wechat|wecom/.test(normalized)) channels.push('wechat');

  return Array.from(new Set(channels));
}

function capabilityStatusLabel(status: string) {
  if (status === 'internal_ready') return '内部已就绪';
  if (status === 'provider_gated') return '等待外部接入';
  return '缺内部证据';
}

function capabilityStatusClass(status: string) {
  if (status === 'internal_ready') return 'border-emerald-300/35 text-emerald-100';
  if (status === 'provider_gated') return 'border-amber-300/35 text-amber-100';
  return 'border-red-300/35 text-red-100';
}

function modeLabel(mode: string) {
  if (mode === 'provider_ready') return '供应商就绪';
  if (mode === 'handoff_only') return '仅交接';
  return mode;
}

function stageLabel(stage: string) {
  const map: Record<string, string> = {
    intake: '待补齐',
    provider_gate: '供应商闸门',
    ready_for_execution: '可执行',
    result_ingestion: '待建审核',
    client_review: '客户审核',
    revision: '返修',
    approved: '已批准',
    performance_return: '表现回流',
  };
  return map[stage] || stage;
}

function priorityLabel(priority: string) {
  if (priority === 'high') return '高优先级';
  if (priority === 'medium') return '中优先级';
  return '低优先级';
}

function displayVideoTitle(title: string) {
  return title.replace(/^Video workflow:\s*/i, '视频任务：');
}

function readableHandoffSummary(summary: string) {
  const [stage, mode, ...counts] = summary.split('/').map(item => item.trim()).filter(Boolean);
  const countLabels: Record<string, string> = {
    plans: '计划',
    dispatches: '分发',
    results: '成片',
    reviews: '审核',
    approved: '批准',
  };
  const readableCounts = counts
    .map(item => {
      const [key, value] = item.split(':').map(part => part.trim());
      return `${countLabels[key] || key} ${value || '0'}`;
    })
    .join(' · ');
  return `阶段 ${stageLabel(stage || '')} · 模式 ${modeLabel(mode || '')}${readableCounts ? ` · ${readableCounts}` : ''}`;
}

function payloadLabel(key: string) {
  const map: Record<string, string> = {
    projectId: '项目',
    sourceHandoffAssetId: '来源交接资产',
    assetId: '资产',
    deliveryUrl: '交付链接',
    resultUrl: '成片链接',
    dispatchId: '执行记录',
    owner: '负责人',
    status: '状态',
  };
  return map[key] || key;
}

function readablePayload(payload: Record<string, unknown>) {
  return Object.entries(payload)
    .map(([key, value]) => `${payloadLabel(key)}：${Array.isArray(value) ? value.join('、') : String(value)}`)
    .join('；');
}

function reviewUrlWithVariant(url: string, variant: FactoryUiVariantId) {
  try {
    const parsed = new URL(url, 'https://wenai.local');
    parsed.searchParams.set('variant', variant);
    if (url.startsWith('http://') || url.startsWith('https://')) return parsed.toString();
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}variant=${variant}`;
  }
}

function reviewIdentity(value: string) {
  const match = value.match(/\/review\/([^/?#]+)/);
  return match?.[1] || value;
}

function queueText(value: string) {
  const map: Record<string, string> = {
    'Provider generation remains handoff-only until config, consent, references, and product assets are ready.': '供应商生成仍处于仅交接状态，需要完成配置、授权、参考视频和门店素材后才能执行。',
    'Produced video assets are waiting for client review approval.': '已产出的视频资产正在等待客户审核批准。',
    'Client requested revisions on at least one produced video asset.': '客户已对至少一个视频资产提出返修。',
    'Create distribution plans for the video workflow asset.': '为视频工作流资产创建分发计划。',
    'Create dispatch records and assign an owner for every target platform.': '为每个目标平台创建分发记录并分配负责人。',
    'Attach provider credentials, legal consent, references, and product assets before provider execution.': '执行供应商生成前，需要补齐供应商凭据、授权、参考视频和门店素材。',
    'Ingest completed provider/editor result URLs through /api/industrial-chain/production-result.': '通过生产结果接口导入已完成的视频或剪辑结果链接。',
    'Create client review links for produced video assets.': '为已产出的视频资产创建客户审核链接。',
    'Send the review portal link to the client and capture approval or revision feedback.': '把审核链接发给客户，并收集批准或返修反馈。',
    'Publish or hand off the video, capture evidence URL, then import performance CSV.': '发布或交接视频，记录发布证据链接，然后导入表现 CSV。',
    'Missing platform distribution plans for this video workflow.': '缺少这条视频工作流的平台分发计划。',
    'Missing dispatch records for target platforms.': '缺少目标平台的执行记录。',
    'Provider automation gate is not fully satisfied; keep execution as manual handoff.': '供应商自动化门槛未全部满足，当前保持人工交接。',
    'Missing completed provider/editor result URL.': '缺少供应商或剪辑完成后的成片链接。',
    'Missing client review portal link for produced video.': '缺少成片对应的客户审核门户链接。',
    'Missing client approval or revision decision.': '缺少客户批准或返修结论。',
    'Missing post-publish performance return.': '缺少发布后的表现回流。',
  };
  return map[value] || value;
}

function remixSourceLabel(value: string) {
  if (value === 'creative-opportunity') return '创意机会';
  if (value === 'pattern-cluster') return '打法簇';
  return '基础模板';
}

function operationClosureCards(operation: OneClickVideoOperationResult) {
  return [{
    title: '内部已完成',
    body: `已创建 ${operation.autoCreated.length} 个资产、计划或执行记录，Compose 到 Cast 的账本已经串起来。`,
  }, {
    title: '仍需外部接入',
    body: operation.externalRequirements.length
      ? `还有 ${operation.externalRequirements.length} 个账号资料条件，未补齐前只能交接，不能标记成片或外部发布完成。`
      : '外部 gate 暂无阻塞，可以继续按供应商或平台自动化验收。',
  }, {
    title: '运营下一步',
    body: operation.commerciallyExecutable
      ? '进入供应商执行、成片回写、客户审核和表现回流。'
      : '先补视频试跑通道、授权素材、平台账号和发布/回流证据。',
  }, {
    title: '禁止伪规模',
    body: '91M+ / 42M+ 只作竞品对标，未有审计账本前不能作为 Wenai 自有指标展示。',
  }];
}

function TrialQueueMetricCard({
  label,
  value,
  detail,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  detail: string;
  tone?: 'neutral' | 'success' | 'warning' | 'danger';
}) {
  const toneClass = tone === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
    : tone === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-900'
      : tone === 'danger'
        ? 'border-rose-200 bg-rose-50 text-rose-900'
        : 'border-neutral-200 bg-white text-neutral-900';

  return (
    <article className={`rounded-2xl border p-4 shadow-sm ${toneClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-xs font-semibold uppercase text-neutral-500">{label}</div>
        <span className="rounded-full border border-neutral-200 bg-white px-2 py-0.5 text-[11px] text-neutral-500">live</span>
      </div>
      <div className="mt-3 text-3xl font-semibold tabular-nums">{value}</div>
      <p className="mt-2 text-pretty text-sm leading-5 text-neutral-600">{detail}</p>
    </article>
  );
}

function FriendTrialProductionConsole({
  queue,
  trialReadiness,
  providerReadyRatio,
  cutReadiness,
  providerSandboxChecks,
  cutOperatingChecks,
}: {
  queue: VideoProductionQueue | null;
  trialReadiness: ReturnType<typeof friendTrialReadiness>;
  providerReadyRatio: string;
  cutReadiness: ReturnType<typeof commercialCutReadiness>;
  providerSandboxChecks: VideoProviderSandboxCheck[];
  cutOperatingChecks: CutOperatingCheck[];
}) {
  const items = queue?.items || [];
  const blockedGates = providerSandboxChecks.filter(check => !check.ready);
  const latestLogs = [
    {
      time: '14:32:05',
      level: 'INFO',
      text: queue
        ? `素材库已索引 ${queue.itemCount} 个视频任务，项目 ${queue.projectId} 保持可追踪。`
        : '视频队列正在加载，等待项目任务与证据落库。',
    },
    {
      time: '14:28:12',
      level: 'WARN',
      text: blockedGates.length
        ? `账号资料条件仍未接通：${blockedGates.map(check => check.gate).slice(0, 2).join(' · ')}。`
        : '账号资料条件已达到当前队列所需的最小可运行状态。',
    },
    {
      time: '14:15:33',
      level: 'INFO',
      text: `客户审核链接 ${queue?.clientReviewCount || 0} 条，表现回流 ${queue?.measuredCount || 0} 条。`,
    },
    {
      time: '14:02:01',
      level: 'ERR',
      text: queue && queue.blockedCount > 0
        ? `仍有 ${queue.blockedCount} 个阻断任务停留在手工交接或 provider 阶段。`
        : '当前队列没有新增阻断项。',
    },
  ];

  const blockerCards = [
    {
      label: '视频服务商',
      detail: '缺少剪映 / HeyGen 等真实执行接入时，队列只保留交接与审核证据。',
      state: providerSandboxChecks[0]?.ready ? 'ready' : 'blocked',
    },
    {
      label: '平台授权',
      detail: '抖音 / 小红书 / 微信的店长授权、发布权限和回执仍需补齐资料。',
      state: providerSandboxChecks[1]?.ready ? 'ready' : 'blocked',
    },
    {
      label: '数据同步',
      detail: '发布证据与表现回流必须接入平台同步或人工回填，不能假装自动化。',
      state: providerSandboxChecks[4]?.ready ? 'ready' : 'blocked',
    },
    {
      label: '商用 Cut',
      detail: `当前 Cut 评分 ${cutReadiness.score}，仍需继续补齐成片、审核与回流证据。`,
      state: cutReadiness.verdict === '可进入商用 Cut 验收' ? 'ready' : 'warning',
    },
  ];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-[#fafafa] text-neutral-900 shadow-sm">
      <div className="grid min-h-[920px] lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="flex flex-col border-r border-neutral-200 bg-white">
          <div className="border-b border-neutral-100 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-900 text-sm font-semibold text-white">W</div>
              <div>
                <div className="text-base font-semibold text-neutral-900">Wenai</div>
                <div className="text-xs text-neutral-500">视频生产工厂</div>
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
            {['指挥中心', '视频工坊', '创意洞察', '分发运营', '效果回流', '客户移交'].map((label, index) => (
              <div
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${index === 0 ? 'border-l-2 border-neutral-900 bg-neutral-50 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-50'}`}
                key={label}
              >
                <span className="size-2 rounded-full bg-neutral-400" />
                <span>{label}</span>
              </div>
            ))}
          </nav>

          <div className="border-t border-neutral-100 p-4">
            <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 shadow-sm">
              <div className="flex size-10 items-center justify-center rounded-xl bg-neutral-900 text-sm font-semibold text-white">A</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-neutral-900">Wenai Admin</div>
                <div className="text-xs text-neutral-500">工作空间</div>
              </div>
              <span className="text-neutral-400">⌄</span>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="flex flex-col gap-4 border-b border-neutral-200 bg-white px-6 py-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase text-neutral-500">Wenai 视频生产总控台</p>
              <h2 className="text-balance text-3xl font-semibold text-neutral-950 sm:text-4xl">视频生产队列</h2>
              <p className="max-w-3xl text-pretty text-sm leading-6 text-neutral-600">
                从创意洞察、素材库、视频生产到分发计划、表现回流和到店跟进交接的可验证工作流。
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                内部链路已验证
              </span>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                账号资料条件 {blockedGates.length ? `${blockedGates.length} 项待配置` : '已收敛'}
              </span>
              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700">
                {providerReadyRatio} 供应商就绪
              </span>
            </div>
          </header>

          <div className="space-y-6 p-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <TrialQueueMetricCard
                detail={queue ? `项目 ${queue.projectId} · ${queue.items.length} 条生产任务` : '等待队列加载'}
                label="队列任务"
                value={String(queue?.itemCount || 0)}
              />
              <TrialQueueMetricCard
                detail={`试跑通道就绪 ${providerReadyRatio}`}
                label="供应商就绪"
                tone={queue && queue.providerReadyCount === queue.itemCount ? 'success' : 'warning'}
                value={providerReadyRatio}
              />
              <TrialQueueMetricCard
                detail="免登录审核入口与客户反馈写回"
                label="审核链接"
                tone={queue && queue.clientReviewCount > 0 ? 'success' : 'warning'}
                value={String(queue?.clientReviewCount || 0)}
              />
              <TrialQueueMetricCard
                detail="发布证据与表现回流进入下一轮创意"
                label="表现回流"
                tone={queue && queue.measuredCount > 0 ? 'success' : 'warning'}
                value={String(queue?.measuredCount || 0)}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
              <section className="rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase text-neutral-500">Queue evidence</p>
                    <h3 className="mt-2 text-xl font-semibold text-neutral-950">视频任务与交接证据</h3>
                  </div>
                  <div className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700">
                    {queue?.itemCount || 0} items
                  </div>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200">
                  <div className="grid grid-cols-12 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase text-neutral-500">
                    <div className="col-span-4">任务</div>
                    <div className="col-span-2">阶段</div>
                    <div className="col-span-2">优先级</div>
                    <div className="col-span-2">渠道</div>
                    <div className="col-span-2 text-right">下一步</div>
                  </div>
                  <div className="divide-y divide-neutral-200 bg-white">
                    {items.length ? items.slice(0, 5).map(item => (
                      <div className="grid grid-cols-12 gap-3 px-4 py-4" key={item.assetId}>
                        <div className="col-span-4 min-w-0">
                          <div className="truncate text-sm font-semibold text-neutral-950">{displayVideoTitle(item.title)}</div>
                          <div className="mt-1 truncate text-xs text-neutral-500">{item.assetId}</div>
                        </div>
                        <div className="col-span-2 text-sm text-neutral-700">{stageLabel(item.stage)}</div>
                        <div className="col-span-2 text-sm text-neutral-700">{priorityLabel(item.priority)}</div>
                        <div className="col-span-2 text-sm text-neutral-700">{item.channels.slice(0, 2).join(' / ') || '未配置'}</div>
                        <div className="col-span-2 text-right text-xs leading-5 text-neutral-500">{item.nextActions[0] || '等待下一步'}</div>
                      </div>
                    )) : (
                      <div className="px-4 py-8 text-sm text-neutral-500">队列为空，先创建视频工作流再写入成片和审核。</div>
                    )}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="text-xs font-semibold uppercase text-neutral-500">Friend trial gate</div>
                    <p className="mt-2 text-sm leading-6 text-neutral-700">{trialReadiness.nextAction}</p>
                  </div>
                  <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                    <div className="text-xs font-semibold uppercase text-neutral-500">Commercial cut score</div>
                    <p className="mt-2 text-sm leading-6 text-neutral-700">
                      {cutReadiness.verdict}，score {cutReadiness.score}。
                    </p>
                  </div>
                </div>
              </section>

              <div className="space-y-6">
                <section className="overflow-hidden rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">Terminal // Production Logs</p>
                      <h3 className="mt-2 text-lg font-semibold text-neutral-950">系统门禁日志</h3>
                    </div>
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Live</span>
                  </div>
                  <div className="mt-4 space-y-2 rounded-lg border border-neutral-200 bg-neutral-50 p-3 font-mono text-xs leading-6 text-neutral-700">
                    {latestLogs.map(entry => (
                      <p className="rounded-md bg-white px-3 py-2 shadow-[0_1px_0_rgba(15,23,42,0.04)]" key={`${entry.time}-${entry.level}`}>
                        <span className="mr-2 text-neutral-400">[{entry.time}]</span>
                        <span className={`mr-2 rounded px-1.5 py-0.5 ${entry.level === 'WARN' ? 'bg-amber-50 text-amber-700' : entry.level === 'ERR' ? 'bg-rose-50 text-rose-700' : 'bg-sky-50 text-sky-700'}`}>[{entry.level}]</span>
                        <span>{entry.text}</span>
                      </p>
                    ))}
                    <p className="px-3 pt-2">
                      <span className="text-emerald-700">readiness@wenai-core:~#</span>{' '}
                      <span className="inline-block h-4 w-2 animate-pulse align-middle bg-neutral-500" />
                    </p>
                  </div>
                </section>

                <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase text-neutral-500">Blockers</p>
                      <h3 className="mt-2 text-lg font-semibold text-neutral-950">关键账号资料条件</h3>
                    </div>
                    <div className="text-xs font-medium text-neutral-500">
                      {providerSandboxChecks.filter(check => check.ready).length}/{providerSandboxChecks.length} ready
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3">
                    {blockerCards.map(card => (
                      <article className="rounded-lg border border-neutral-200 bg-neutral-50 p-4" key={card.label}>
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm font-semibold text-neutral-950">{card.label}</h4>
                          <span className={`rounded-full border px-2 py-1 text-[11px] font-medium ${card.state === 'ready' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : card.state === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
                            {card.state === 'ready' ? '就绪' : card.state === 'warning' ? '观察中' : '阻断'}
                          </span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-neutral-600">{card.detail}</p>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <section className="rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase text-neutral-500">Readiness matrix</p>
                  <h3 className="mt-2 text-lg font-semibold text-neutral-950">模块准备度评估</h3>
                </div>
                <div className="text-xs font-medium text-neutral-500">
                  已验证 {cutOperatingChecks.filter(check => check.status === 'ready').length}/{cutOperatingChecks.length}
                </div>
              </div>
              <div className="mt-4 overflow-hidden rounded-2xl border border-neutral-200">
                <div className="grid grid-cols-12 border-b border-neutral-200 bg-neutral-50 px-4 py-3 text-xs font-semibold uppercase text-neutral-500">
                  <div className="col-span-4">模块</div>
                  <div className="col-span-2">状态</div>
                  <div className="col-span-3">证据</div>
                  <div className="col-span-3 text-right">门禁</div>
                </div>
                <div className="divide-y divide-neutral-200">
                  {cutOperatingChecks.map(check => (
                    <div className="grid grid-cols-12 gap-3 px-4 py-4" key={check.label}>
                      <div className="col-span-4 text-sm font-semibold text-neutral-950">{check.label}</div>
                      <div className="col-span-2 text-sm text-neutral-700">{check.status === 'ready' ? '就绪' : '阻断'}</div>
                      <div className="col-span-3 text-sm leading-6 text-neutral-600">{check.evidence}</div>
                      <div className="col-span-3 text-right text-sm leading-6 text-neutral-600">{check.externalGate}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

function manualTrialRunbook(item: VideoProductionQueue['items'][number]) {
  const hasResult = item.resultAssetCount > 0;
  const hasReview = item.clientReviewAssetCount > 0 || item.reviewLinks.length > 0;
  const hasApproval = item.approvedDeliverableCount > 0;
  const hasPerformance = item.measuredDispatchCount > 0;

  return [
    {
      title: '导出剪辑交接包',
      state: item.remixPlan.length > 0 ? '已就绪' : '待补剪辑计划',
      detail: item.remixPlan.length > 0
        ? '已有 Hook、镜头顺序、素材说明、平台适配和风险边界，可交给剪辑师或 provider。'
        : '先补 Hook Bank、脚本骨架和平台时长规则，避免只给一句模糊需求。',
    },
    {
      title: '人工/供应商执行',
      state: item.mode === 'provider_ready' ? '可走 provider' : '人工交接',
      detail: item.mode === 'provider_ready'
        ? '账号资料条件已满足，可进入人工确认后的交接队列。'
        : '账号资料未接齐时，按交接包人工剪辑；不要宣称已产出成片。',
    },
    {
      title: '成片回灌',
      state: hasResult ? '已回写' : '待回写',
      detail: hasResult
        ? '成片 URL 已进入生产结果，可继续客户审核或分发。'
        : '剪辑完成后在本页写入成片 URL，系统会生成客户审核链接。',
    },
    {
      title: '客户审核',
      state: hasApproval ? '已批准' : hasReview ? '审核中' : '待创建',
      detail: hasApproval
        ? '客户批准已写回生产链路。'
        : hasReview
          ? '客户可通过审核链接反馈或批准。'
          : '成片回灌后必须创建审核链接，不能只在聊天里确认。',
    },
    {
      title: '分发与回流',
      state: hasPerformance ? '已回流' : '待发布证据',
      detail: hasPerformance
        ? '表现数据已回到队列，可进入复盘和下一轮创意。'
        : '发布后补链接/截图凭证和平台/社群反馈；没有商户授权前保持手工回流。',
    },
  ];
}

export function buildVideoProductionPassport(item: VideoProductionQueue['items'][number]) {
  const hasRemixPlan = item.remixPlan.length > 0;
  const providerReady = item.mode === 'provider_ready';
  const hasResult = item.resultAssetCount > 0;
  const hasReview = item.clientReviewAssetCount > 0 || item.reviewLinks.length > 0;
  const hasApproval = item.approvedDeliverableCount > 0;
  const hasPerformance = item.measuredDispatchCount > 0;

  return [
    {
      title: '洞察来源',
      value: hasRemixPlan ? `${item.remixPlan.length} 个混剪变体` : '待补 Hook 结构',
      tone: hasRemixPlan ? 'ready' : 'attention',
      detail: hasRemixPlan
        ? '已从创意机会、打法簇或基础模板生成可执行剪辑结构。'
        : '缺少 Hook、节奏、镜头顺序和平台适配时，不进入生产。',
    },
    {
      title: '生产执行',
      value: providerReady ? 'provider 可提交' : '人工交接',
      tone: providerReady ? 'ready' : 'attention',
      detail: providerReady
        ? '素材、授权和账号资料条件已满足，可进入外部 provider 试跑交接队列。'
        : '外部 provider / 试跑通道未满足前，只交付剪辑包和手工回填入口。',
    },
    {
      title: '成片证据',
      value: hasResult ? '已有成片 URL' : '待回填成片',
      tone: hasResult ? 'ready' : 'locked',
      detail: hasResult
        ? '成片已经写回生产结果，可继续客户审核。'
        : '没有可打开成片前，不能宣称一键视频已完成。',
    },
    {
      title: '客户验收',
      value: hasApproval ? '已批准' : hasReview ? '审核中' : '待生成审核',
      tone: hasApproval ? 'ready' : hasReview ? 'attention' : 'locked',
      detail: hasApproval
        ? '客户批准已写回，后续可进入分发/到店跟进。'
        : hasReview
          ? '客户可通过审核链接反馈或批准。'
          : '成片回填后必须生成免登录审核链接。',
    },
    {
      title: '分发证据',
      value: item.measuredDispatchCount > 0 ? `${item.measuredDispatchCount} 条回流` : `${item.dispatchCount} 条计划`,
      tone: hasPerformance ? 'ready' : item.dispatchCount > 0 ? 'attention' : 'locked',
      detail: hasPerformance
        ? '发布表现或到店反馈已经回流，可进入复盘和品牌学习。'
        : item.dispatchCount > 0
          ? '已有分发计划或 dispatch，仍需发布证据和表现数据。'
          : '缺少分发计划时不能形成 Cast/Manage 闭环。',
    },
  ];
}

function productionPassportClass(tone: string) {
  if (tone === 'ready') return 'border-emerald-300/25 bg-emerald-950/20 text-emerald-100';
  if (tone === 'locked') return 'border-red-300/25 bg-red-950/25 text-red-100';
  return 'border-amber-300/25 bg-amber-950/20 text-amber-100';
}

function friendTrialReadiness(queue: VideoProductionQueue | null, variant: FactoryUiVariantId) {
  const hasTask = (queue?.itemCount || 0) > 0;
  const hasResult = (queue?.resultAssetCount || 0) > 0;
  const itemReviewKeys = new Set((queue?.items || []).flatMap(item => [
    ...item.reviewLinks.map(link => link.token),
    ...item.handoffPacket.reviewPortalUrls.map(reviewIdentity),
  ]));
  const itemReviewCount = itemReviewKeys.size;
  const reviewCount = Math.max(queue?.clientReviewCount || 0, itemReviewCount);
  const hasReview = reviewCount > 0;
  const hasApproval = (queue?.approvedDeliverableCount || 0) > 0;
  const hasReturn = (queue?.measuredCount || 0) > 0;
  const firstReviewLink = (queue?.items || [])
    .flatMap(item => item.reviewLinks.map(link => `/review/${link.token}`))
    [0];
  const verdict = hasTask && hasResult && hasReview
    ? '可以发起完整朋友试用'
    : hasTask && hasReview
      ? '只能测试审核入口'
      : '暂不建议直接发给朋友';

  return {
    verdict,
    evidence: [
      hasTask ? `已有 ${queue?.itemCount || 0} 个视频任务` : '还没有视频任务',
      hasResult ? `已有 ${queue?.resultAssetCount || 0} 个成片结果` : '尚未回写成片链接',
      hasReview ? `已有 ${reviewCount} 个客户审核入口` : '尚未生成客户审核链接',
      hasApproval ? `已有 ${queue?.approvedDeliverableCount || 0} 个批准结果` : '尚未获得客户批准',
      hasReturn ? `已有 ${queue?.measuredCount || 0} 条表现回流` : '尚未形成发布后表现回流',
    ],
    firstReviewLink: firstReviewLink ? reviewUrlWithVariant(firstReviewLink, variant) : '',
    nextAction: !hasTask
      ? '先创建一个视频工作流，把菜品/套餐、平台、参考视频和素材写入队列。'
      : !hasResult
        ? '先回写成片链接；没有可打开成片时，只能测试审核入口，不能算完整朋友试用。'
      : !hasReview
        ? '先回写成片链接，并让系统生成客户审核链接。'
        : !hasApproval
          ? '把审核链接发给朋友或客户，让他们只做反馈或批准。'
          : !hasReturn
            ? '批准后进入分发或手工发布，并补回发布证据与表现数据。'
            : '把表现回流写入品牌学习档案，进入下一轮 Compose / Cut 优化。',
    stopLine: hasResult && hasReview
      ? '可以让朋友试用审核动作，但未接真实 provider 和平台授权前仍不能宣称成片或外部发布已完成。'
      : hasReview
        ? '有审核入口但没有成片链接，只能验证客户前台，不能让朋友以为视频已经产出。'
      : '缺少审核链接前，不要把内部队列截图发给朋友；先回写成片并生成审核入口。',
  };
}

function commercialCutReadiness(queue: VideoProductionQueue | null) {
  const providerCompleted = (queue?.completedProviderExecutionCount || 0) > 0;
  const hasResult = (queue?.resultAssetCount || 0) > 0;
  const hasReview = (queue?.clientReviewCount || 0) > 0;
  const hasApproval = (queue?.approvedDeliverableCount || 0) > 0;
  const hasPerformance = (queue?.measuredCount || 0) > 0;
  const providerFailures = (queue?.failedProviderExecutionCount || 0) + (queue?.retryableProviderExecutionCount || 0);
  const gates = [
    {
      label: '真实视频 provider 回调',
      ok: providerCompleted,
      detail: providerCompleted
        ? `已有 ${queue?.completedProviderExecutionCount || 0} 条完成回执。`
        : '还没有完成的 provider execution；只能算人工交接或本地队列。',
    },
    {
      label: '可打开成片资产',
      ok: hasResult,
      detail: hasResult ? `已有 ${queue?.resultAssetCount || 0} 个成片结果。` : '还没有成片链接写回。',
    },
    {
      label: '客户审核入口',
      ok: hasReview,
      detail: hasReview ? `已有 ${queue?.clientReviewCount || 0} 个审核入口。` : '还没有审核链接。',
    },
    {
      label: '客户批准',
      ok: hasApproval,
      detail: hasApproval ? `已有 ${queue?.approvedDeliverableCount || 0} 个批准结果。` : '还没有客户批准或返修结论。',
    },
    {
      label: '发布/表现回流',
      ok: hasPerformance,
      detail: hasPerformance ? `已有 ${queue?.measuredCount || 0} 条表现回流。` : '还没有发布证据或表现数据。',
    },
  ];
  const passed = gates.filter(gate => gate.ok).length;
  return {
    verdict: passed === gates.length ? '可进入商用 Cut 验收' : '仍是 provider-gated POC',
    score: `${passed}/${gates.length}`,
    gates,
    risk: providerFailures > 0
      ? `存在 ${providerFailures} 条 provider 失败或待重试记录，商用前必须处理。`
      : '暂无 provider 失败记录；主要风险仍是外部授权与真实回流证据。',
    stopLine: passed === gates.length
      ? '可以进入小规模商用验收，但仍需按平台授权、商户授权和资产权限继续扩展。'
      : '没有 provider 完成回调、成片、客户批准和表现回流前，不能宣称筷子级稳定视频工厂。',
  };
}

export interface CutOperatingCheck {
  label: string;
  status: 'ready' | 'blocked';
  evidence: string;
  internalMove: string;
  externalGate: string;
}

export interface VideoProviderSandboxCheck {
  gate: string;
  ready: boolean;
  evidence: string;
  internalMove: string;
  externalGate: string;
}

export function buildVideoProviderSandboxChecks(queue: VideoProductionQueue | null): VideoProviderSandboxCheck[] {
  const providerReadyCount = queue?.providerReadyCount || 0;
  const submittedCount = queue?.submittedProviderExecutionCount || 0;
  const completedCount = queue?.completedProviderExecutionCount || 0;
  const failedCount = queue?.failedProviderExecutionCount || 0;
  const retryableCount = queue?.retryableProviderExecutionCount || 0;
  const resultCount = queue?.resultAssetCount || 0;
  const reviewCount = queue?.clientReviewCount || 0;
  const approvedCount = queue?.approvedDeliverableCount || 0;

  return [
    {
      gate: '提交适配器门禁',
      ready: providerReadyCount > 0 || submittedCount > 0 || completedCount > 0,
      evidence: `试跑通道就绪 ${providerReadyCount} / 已交接 ${submittedCount}`,
      internalMove: '保留交接内容、客户请求编号、分发编号、来源素材编号和通道名称，不把账号配置值写入页面或台账。',
      externalGate: '需要试跑通道交接地址、服务端账号配置、沙盒账号和成本上限。',
    },
    {
      gate: '回调验签门禁',
      ready: completedCount > 0,
      evidence: `完成回执 ${completedCount} / 失败 ${failedCount}`,
      internalMove: '继续使用回执编号、签名规则、任务编号和成片链接对齐同一条试跑记录。',
      externalGate: '需要回执签名配置、回执地址白名单和签名回执样例。',
    },
    {
      gate: '失败恢复门禁',
      ready: submittedCount > 0 && failedCount === 0 && retryableCount === 0,
      evidence: `失败 ${failedCount} / 可重试 ${retryableCount}`,
      internalMove: '失败时记录 errorMessage、nextRetryAt、blockedReasons 和人工回填入口，避免静默卡死。',
      externalGate: '需要 provider 错误码、重试策略、费用失败处理和 SLA 约定。',
    },
    {
      gate: '成片入库门禁',
      ready: resultCount > 0,
      evidence: `成片 ${resultCount}`,
      internalMove: 'provider/editor result URL 必须通过 production-result 入库，不能只停在供应商后台或聊天记录。',
      externalGate: '需要可打开的成片 URL、存储权限、下载/水印策略和素材授权证明。',
    },
    {
      gate: '客户验收门禁',
      ready: reviewCount > 0 && approvedCount > 0,
      evidence: `审核 ${reviewCount} / 批准 ${approvedCount}`,
      internalMove: '成片必须生成审核入口，客户反馈或批准要写回生产链路。',
      externalGate: '需要正式域名、客户访问权限、通知通道和可审计的验收记录。',
    },
  ];
}

export function buildCutOperatingChecks(queue: VideoProductionQueue | null): CutOperatingCheck[] {
  const items = queue?.items || [];
  const hasTask = (queue?.itemCount || 0) > 0;
  const hasRemixPlan = items.some(item => item.remixPlan.length > 0);
  const providerReady = (queue?.providerReadyCount || 0) > 0;
  const providerCompleted = (queue?.completedProviderExecutionCount || 0) > 0;
  const hasResult = (queue?.resultAssetCount || 0) > 0;
  const hasReview = (queue?.clientReviewCount || 0) > 0;
  const hasApproval = (queue?.approvedDeliverableCount || 0) > 0;
  const hasPerformance = (queue?.measuredCount || 0) > 0;
  const hasProviderRecovery = (queue?.failedProviderExecutionCount || 0) > 0 || (queue?.retryableProviderExecutionCount || 0) > 0;

  return [
    {
      label: 'AI 视频解析',
      status: hasTask && hasRemixPlan ? 'ready' : 'blocked',
      evidence: hasTask
        ? `任务 ${queue?.itemCount || 0} 条 / remix plan ${items.reduce((sum, item) => sum + item.remixPlan.length, 0)} 条`
        : '还没有视频任务和可拆解素材结构。',
      internalMove: '继续把竞品视频、Hook、scene beat、字幕节奏、风险边界写入同一条视频任务护照。',
      externalGate: '真实多模态解析 provider、合法视频源、下载/转写/存储授权。',
    },
    {
      label: '智能混剪',
      status: hasRemixPlan ? 'ready' : 'blocked',
      evidence: hasRemixPlan ? '已有可交给剪辑师或 provider 的镜头顺序、素材说明和平台适配。' : '还没有可执行 remix plan。',
      internalMove: '把 15s/30s/45s 版本、素材清单、字幕节奏、平台时长规则和禁用表达沉淀为可复用模板。',
      externalGate: '真实剪辑引擎、素材授权、音频/字体授权和成片回调。',
    },
    {
      label: '一键视频编排',
      status: hasTask ? 'ready' : 'blocked',
      evidence: hasTask
        ? `已能从 brief 创建生产交接包、分发计划和分发记录，试跑通道就绪 ${queue?.providerReadyCount || 0}/${queue?.itemCount || 0}。`
        : '还没有从 brief 自动生成视频工作流。',
      internalMove: '保留一键编排能力，但界面必须继续标注 provider-gated 和待补资料，避免把编排误说成已产出成片。',
      externalGate: '视频试跑通道账号、回执签名规则、成本上限、失败重试和回执验签。',
    },
    {
      label: 'Provider 执行闭环',
      status: providerReady && providerCompleted && !hasProviderRecovery ? 'ready' : 'blocked',
      evidence: providerCompleted
        ? `完成回执 ${queue?.completedProviderExecutionCount || 0} 条 / 失败或待重试 ${(queue?.failedProviderExecutionCount || 0) + (queue?.retryableProviderExecutionCount || 0)} 条`
        : `已提交 ${queue?.submittedProviderExecutionCount || 0} 条 / 完成 0 条`,
      internalMove: '继续保留回执编号、失败原因、可重试状态和人工回填入口。',
      externalGate: '试跑通道沙箱账号、任务回执、失败码、重试策略、成本账单。',
    },
    {
      label: '成片入库与客户审核',
      status: hasResult && hasReview && hasApproval ? 'ready' : 'blocked',
      evidence: `成片 ${queue?.resultAssetCount || 0} / 审核 ${queue?.clientReviewCount || 0} / 批准 ${queue?.approvedDeliverableCount || 0}`,
      internalMove: '成片链接必须进入结果库，再生成审核入口，客户批准或返修要写回生产链路。',
      externalGate: '正式域名、客户权限策略、签名 URL、下载/水印/DLP 策略。',
    },
    {
      label: '分发表现回流',
      status: hasPerformance ? 'ready' : 'blocked',
      evidence: `已回流 ${queue?.measuredCount || 0} 条表现数据 / dispatch ${items.reduce((sum, item) => sum + item.dispatchCount, 0)} 条`,
      internalMove: '把发布凭证、活动假设、平台/社群反馈数据回写到门店活动、素材、渠道和品牌学习档案。',
      externalGate: '平台授权、商户授权、发布回执、反馈回流、归因窗口。',
    },
  ];
}

const MIXCUT_OPERATION_BOARD = [
  {
    title: 'Hook Bank 入场',
    input: '来自创意工厂的开头钩子、痛点句、证据点和可复用角度',
    action: '生成 3 秒开场、字幕节奏、首屏镜头和平台差异化钩子',
    gate: '没有授权参考视频时，只能复用结构，不能复制画面、原句或素材表达',
  },
  {
    title: 'UGC Script Spine 成片',
    input: '真人口播骨架、产品使用场景、前后对比和 CTA',
    action: '拆成 15s / 30s / 45s 三档剪辑包，进入供应商或剪辑师交接',
    gate: '需要视频试跑通道、门店素材链接、生成授权和回执配置后，才能交接成片',
  },
  {
    title: 'Offer Test Matrix 分发',
    input: '折扣、套装、赠品、信任背书、平台活动和目标受众',
    action: '写入分发计划、dispatch、活动假设、停止条件和反馈回流字段',
    gate: '没有平台授权、商户授权和反馈回流前，只能做计划与手工回灌',
  },
];

const CUT_PRODUCTION_LINE = [
  {
    stage: 'AI 视频分析',
    input: '授权视频 URL、转写摘要、画面节奏、字幕、物体、评论区需求和互动指标',
    output: '拆出 hook、scene beats、proof point、CTA、风险表达和可混剪素材需求',
    internal: '内部可做：结构化字段、解析结果回灌、脚本约束、视频任务交接',
    external: '外部需要：多模态视频解析 provider、合法视频源、下载/存储权限',
  },
  {
    stage: '智能混剪',
    input: 'Hook Bank、UGC Script Spine、门店素材、参考节奏和平台时长规则',
    output: '生成 15s / 30s / 45s 版本的镜头顺序、字幕节奏、素材清单和风险边界',
    internal: '内部可做：混剪计划、镜头清单、变体策略、供应商交接包',
    external: '还需要：真实剪辑引擎、素材授权、音频/字体授权和成片回调',
  },
  {
    stage: '一键视频',
    input: '门店 brief、素材 URL、参考视频、授权确认、平台列表和分发目标',
    output: '创建生产交接包、分发计划、分发记录、客户审核链接和表现回流字段',
    internal: '内部可做：一键编排、队列状态、门禁判断、审计证据',
    external: '还需要：视频生成 provider token、任务回调、失败重试和成本额度',
  },
  {
    stage: '客户审核',
    input: '成片链接、交付包、审核入口、客户反馈和批准/返修结论',
    output: '把批准状态写回生产链路，进入分发或返修，不让结果停在聊天里',
    internal: '内部可做：审核门户、反馈、批准、过期/撤销、审计日志',
    external: '外部需要：正式域名、客户权限策略、素材下载/水印策略',
  },
  {
    stage: '分发回流',
    input: '平台账号、发布凭证、活动假设、自然流量、预约/券领取/私信和销售指标',
    output: '回写平台/社群反馈数据，沉淀胜出结构并反哺下一轮 Compose 和 Cut',
    internal: '内部可做：dispatch gate、门店活动账本、反馈导入、复盘字段',
    external: '外部需要：平台授权、商户授权、发布执行和反馈回流',
  },
];

const VIDEO_FACTORY_UI_VARIANTS: Record<FactoryUiVariantId, {
  label: string;
  audience: string;
  headline: string;
  body: string;
  firstAction: string;
  proof: string;
  stopLine: string;
  reference: string;
}> = {
  partner: {
    label: '合作者视角',
    audience: '给合作者、客户负责人和投资评审看清产品形态',
    headline: 'Cut 不是单个生成按钮，而是一条可审计的视频工业化生产线',
    body: '这一屏展示 Wenai 如何把 AI 视频分析、智能混剪、一键视频、客户审核、分发回流串成闭环；Hookly / Omneky 这类内容运营平台提供 UGC 变体和反馈优化参考，筷子科技提供编拍剪投管的全链路参照。',
    firstAction: '先看能力矩阵和账号资料条件，再判断是否具备交付条件。',
    proof: '证明点：队列、交接包、审核入口、分发记录、表现回流都是同一项目账本。',
    stopLine: '未接真实视频 provider、平台授权、商户授权和反馈回流前，不宣称自动规模化；未接真实视频 provider、平台授权、商户授权、反馈回流和审计规模账本前，不展示 91M+/42M+ 为 Wenai 自有能力。',
    reference: '参考：筷子科技的编拍剪投管；Hookly/Hookshot 类平台的 hook/UGC 变体；Omneky 的内容表现回流。',
  },
  operator: {
    label: '运营视角',
    audience: '给内部运营、剪辑交付和增长负责人每天处理任务',
    headline: '先看卡在哪里，再把下一步动作写回队列',
    body: '这一屏优先暴露任务阶段、账号资料条件、成片回写、客户审核、返修和表现回流，避免视频任务停在聊天记录、表格或供应商私信里。',
    firstAction: '创建视频工作流，回写成片链接，然后把审核链接交给客户确认。',
    proof: '证明点：每个任务都有 missing evidence、runbook action、SLA、渠道和闭环分数。',
    stopLine: '缺素材授权、试跑通道账号、平台账号或发布证据时，只能人工交接，不能标记平台发布完成。',
    reference: '参考：Clico 的客户 review / production handoff；内容平台的任务看板和结果回灌。',
  },
  friend_trial: {
    label: '朋友试用视角',
    audience: '给非技术朋友或客户第一次打开时不迷路',
    headline: '给一个菜品/套餐和参考视频，系统帮你排出可审核的视频生产流程',
    body: '这一屏少讲内部术语，只保留三件事：创建任务、等待成片、打开审核链接。复杂的 provider、平台授权、商户授权和数据回流都放在后台边界里。',
    firstAction: '填写菜品/套餐、平台、参考视频和素材链接，先生成一个可交接的视频任务。',
    proof: '证明点：朋友不需要理解 API，也能看到任务、成片、审核和下一步。',
    stopLine: '如果没有成片链接，页面不能让用户误以为视频已经生成。',
    reference: '参考：短视频内容工具的一键试用体验，但保留 Wenai 的审核与回流闭环。',
  },
};

export function buildVideoFactoryVariantPlaybook(queue: VideoProductionQueue | null, variant: FactoryUiVariantId) {
  const trial = friendTrialReadiness(queue, variant);
  const cut = commercialCutReadiness(queue);
  const itemCount = queue?.itemCount || 0;
  const blockedCount = queue?.blockedCount || 0;
  const resultCount = queue?.resultAssetCount || 0;
  const reviewCount = queue?.clientReviewCount || 0;
  const approvedCount = queue?.approvedDeliverableCount || 0;
  const measuredCount = queue?.measuredCount || 0;

  if (variant === 'friend_trial') {
    return {
      title: '朋友试用操作路径',
      primaryAction: trial.firstReviewLink
        ? `把 ${trial.firstReviewLink} 发给朋友，只让对方预览、反馈或批准。`
        : trial.nextAction,
      proofToCheck: '必须有可打开成片和客户审核入口；没有真实成片 URL 时，只能验证审核前台，不能说视频已经生成。',
      handoffBoundary: trial.stopLine,
      cards: [
        `任务 ${itemCount} / 成片 ${resultCount} / 审核入口 ${reviewCount}`,
        `客户批准 ${approvedCount} / 表现回流 ${measuredCount}`,
        '朋友不看 provider、平台授权、商户授权和内部账本，只看交付物能否验收。',
      ],
    };
  }

  if (variant === 'operator') {
    return {
      title: '运营执行路径',
      primaryAction: blockedCount > 0
        ? '先处理阻断项：补素材授权、试跑通道配置、成片链接、审核链接或发布回流证据。'
        : '继续创建视频工作流、回灌成片、生成审核链接，并把下一步动作写回队列。',
      proofToCheck: '每个视频任务都要有 missing evidence、操作动作、负责人和可追踪的下一步。',
      handoffBoundary: '账号配置、平台账号、店长授权或反馈回流未接入时，运营只能走人工交接和手动回流。',
      cards: [
        `队列任务 ${itemCount} / 阻断 ${blockedCount} / Cut readiness ${cut.score}`,
        `成片 ${resultCount} / 审核 ${reviewCount} / 批准 ${approvedCount}`,
        '运营视角必须把聊天里的确认转成系统里的反馈、批准、返修、发布证据和表现回流。',
      ],
    };
  }

  return {
    title: '合作者验收路径',
    primaryAction: '先看 Commercial Cut Readiness 和 Scale Claim Guard，再判断是否已经具备商用交付边界。',
    proofToCheck: '证明 Wenai 是 Compose/Create/Cut/Cast/Manage 的闭环，不是单个生成按钮：队列、handoff、review、dispatch、performance return 必须同项目可追踪。',
    handoffBoundary: '未接视频试跑通道、平台授权、商户授权、反馈回流和审计规模账本前，不展示 91M+/42M+ 为 Wenai 自有能力。',
    cards: [
      `Cut readiness ${cut.score} / ${cut.verdict}`,
      `任务 ${itemCount} / 成片 ${resultCount} / 表现回流 ${measuredCount}`,
      '合作者视角要看到待补资料清单、本地已完成能力和不能越线宣传的边界。',
    ],
  };
}

export function VideoProductionQueueClient({
  initialProjectId = 'default-project',
  initialQueue = null,
  initialOperation = null,
  selectedVariantId = 'partner',
  initialIntake = {},
}: {
  initialProjectId?: string;
  initialQueue?: VideoProductionQueue | null;
  initialOperation?: OneClickVideoOperationResult | null;
  selectedVariantId?: FactoryUiVariantId;
  initialIntake?: RestaurantTrialIntake;
}) {
  const [projectId, setProjectId] = useState(initialProjectId);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [platforms, setPlatforms] = useState(DEFAULT_PLATFORMS);
  const [reference, setReference] = useState('');
  const [productAsset, setProductAsset] = useState('');
  const [legalConsent, setLegalConsent] = useState(false);
  const [providerConfigured, setProviderConfigured] = useState(false);
  const [resultAssetId, setResultAssetId] = useState('');
  const [resultTaskId, setResultTaskId] = useState('');
  const [resultUrls, setResultUrls] = useState('');
  const [resultChannel, setResultChannel] = useState('');
  const [queue, setQueue] = useState<VideoProductionQueue | null>(initialQueue);
  const [operation, setOperation] = useState<OneClickVideoOperationResult | null>(initialOperation);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  async function refreshQueue(nextProjectId = projectId, clearNotice = true) {
    setLoading(true);
    const res = await fetch(`/api/industrial-chain/video-workflow?projectId=${encodeURIComponent(nextProjectId || 'default-project')}`, { cache: 'no-store' });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || '视频队列刷新失败');
      return;
    }
    setError('');
    if (clearNotice) setNotice('');
    setOperation(null);
    setQueue(data.queue);
  }

  async function createWorkflow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const res = await fetch('/api/industrial-chain/video-workflow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create-one-click-operation',
        projectId: projectId || 'default-project',
        productName,
        category,
        platforms: platforms.split(',').map(item => item.trim()).filter(Boolean),
        references: reference ? [reference] : undefined,
        productAssets: productAsset ? [productAsset] : undefined,
        providerConfigured,
        legalConsent,
        createDistributionPlans: true,
        createDispatches: true,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || '视频工作流创建失败');
      return;
    }
    setError('');
    setNotice('视频工作流已创建，并写入生产交接、分发计划和执行队列。');
    setOperation(data.operation || null);
    setQueue(data.operation?.queue || data.queue);
    setProductName('');
    setCategory('');
    setReference('');
    setProductAsset('');
  }

  const items = queue?.items || [];
  const resultTarget = items.find(item => item.assetId === resultAssetId) || items[0];
  const resultAction = resultTarget?.runbookActions.find(action => action.id === 'ingest-production-result');
  const providerReadyRatio = queue && queue.itemCount > 0
    ? `${queue.providerReadyCount}/${queue.itemCount}`
    : '0/0';
  const selectedVariant = VIDEO_FACTORY_UI_VARIANTS[selectedVariantId];
  const trialReadiness = friendTrialReadiness(queue, selectedVariantId);
  const cutReadiness = commercialCutReadiness(queue);
  const cutOperatingChecks = buildCutOperatingChecks(queue);
  const providerSandboxChecks = buildVideoProviderSandboxChecks(queue);
  const variantPlaybook = buildVideoFactoryVariantPlaybook(queue, selectedVariantId);
  const isFriendTrialVariant = selectedVariantId === 'friend_trial';

  if (selectedVariantId === 'friend_trial') {
    const videoCards = items.slice(0, 4).map(item => ({
      id: item.assetId,
      title: item.title,
      status: item.stage,
      versions: item.remixPlan.length,
      dispatches: item.dispatchCount,
    }));
    const draftPackage = [
      { title: '短视频口播', body: '先生成 15-30 秒镜头脚本和口播，不冒充已剪出成片。' },
      { title: '图文笔记', body: '输出标题、封面建议、正文结构和点评/小红书差异。' },
      { title: '社群话术', body: '给群主可发送的活动说明、券领取提醒和私信回复。' },
      { title: '剪辑交接包', body: '视频试跑通道未接入前，只给素材、镜头、审核和负责人。' },
    ];
    const contentDeliveryPack = buildRestaurantContentDeliveryPack({
      restaurantName: initialIntake.restaurant || '南城川味小馆',
      dishOrOffer: productName || initialIntake.offer || '双人酸菜鱼套餐',
      audience: initialIntake.audience || '附近 3 公里工作日晚餐客',
      localArea: initialIntake.visitReason || category || '本地商圈',
      channels: parseRestaurantContentChannels(initialIntake.channels || platforms),
      referenceEvidence: reference || initialIntake.evidence,
      constraints: initialIntake.constraints || '价格、库存、限量、核销和食品安全边界待店长确认',
    });
    const contentProductionPassport = buildRestaurantVideoProductionPassport({
      contentPack: contentDeliveryPack,
      externalVideoChannelReady: false,
      finishedVideoUrl: resultUrls.split(/[\n,]/).map(item => item.trim()).filter(Boolean)[0],
      managerApproved: false,
      publishProofReady: false,
      recoveredAggregateReady: false,
    });

    return (
      <FactoryFriendTrialExperience
        active="video"
        title="一组到店理由生成多条本地内容"
        subtitle="同一套餐饮素材，拆成短视频、图文脚本、社群话术和不同平台版本。"
        metrics={[
          { label: '本地内容草稿', value: '待生成', detail: '短视频/图文/社群', tone: 'slate' },
          { label: '门店审核', value: '待确认', detail: '审核后发布', tone: 'emerald' },
          { label: '发布回收', value: '待回填', detail: '不虚构效果', tone: 'amber' },
        ]}
        funnel={[
          { label: '素材', value: 84 },
          { label: '脚本', value: 76 },
          { label: '成片', value: 64 },
          { label: '审核', value: 52 },
          { label: '发布', value: 40 },
        ]}
        actions={[
          { role: '运营', title: '生成草稿', value: '先产出可审核的标题、口播、画面和社群话术', href: '#video-create' },
          { role: '餐饮客户', title: '审核内容', value: '门店确认后再进入发布安排', href: '#video-board' },
          { role: '运营', title: '进入发布', value: '只发布已确认的内容版本', href: '/factory/cast?variant=friend_trial' },
        ]}
        intake={initialIntake}
        nextHref="/factory/cast?variant=friend_trial"
        nextLabel="去多平台发"
      >
        <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <form id="video-create" onSubmit={createWorkflow} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Video Batch</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-950">新增批量剪辑任务</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{providerReadyRatio} 可生产</span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ['项目', projectId, setProjectId],
                ['菜品/套餐', productName, setProductName],
                ['用餐场景', category, setCategory],
                ['平台', platforms, setPlatforms],
                ['参考', reference, setReference],
                ['素材', productAsset, setProductAsset],
              ].map(([label, value, setter]) => (
                <label className="text-sm text-slate-700" key={String(label)}>
                  {String(label)}
                  <input
                    value={String(value)}
                    onChange={event => (setter as (value: string) => void)(event.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-950 outline-none focus:border-slate-400"
                  />
                </label>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button disabled={loading} className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-200 disabled:text-slate-500">
                创建任务
              </button>
              <button type="button" onClick={() => refreshQueue()} disabled={loading} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:text-slate-400">
                刷新
              </button>
            </div>
            {notice ? <p className="mt-3 text-sm text-emerald-700">{notice}</p> : null}
            {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
          </form>

          <section id="video-board" className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-950">生产队列</h2>
              <span className="text-xs font-medium text-slate-500">{items.length ? '已有任务' : '等待创建'}</span>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {videoCards.length ? videoCards.map(item => (
                <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={item.id}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="truncate text-sm font-semibold text-slate-950">{item.title}</h3>
                    <span className="rounded-full bg-white px-2 py-1 text-[11px] font-medium text-slate-500">{item.status}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">{item.versions} 版本 · {item.dispatches} 分发</p>
                </article>
              )) : draftPackage.map(item => (
                <article className="rounded-xl border border-amber-200 bg-amber-50 p-4" key={item.title}>
                  <div className="text-xs font-semibold text-amber-700">待创建任务</div>
                  <h3 className="mt-2 text-sm font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{item.body}</p>
                </article>
              ))}
            </div>
          </section>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">餐饮内容交付包</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">{contentDeliveryPack.title}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{contentDeliveryPack.note}</p>
            </div>
            <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              {contentDeliveryPack.status === 'ready_for_manager_review' ? '待店长审核' : '草稿待补证据'}
            </span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3">
              {contentDeliveryPack.scripts.map(script => (
                <article className="rounded-xl border border-slate-200 bg-slate-50 p-4" key={script.title}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-950">{script.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{script.hook}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">15-30s</span>
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    {script.storyboard.slice(0, 4).map(item => (
                      <p className="rounded-lg bg-white px-3 py-2 text-xs leading-5 text-slate-600" key={item}>{item}</p>
                    ))}
                  </div>
                  <p className="mt-3 text-xs font-semibold text-slate-700">CTA: {script.cta}</p>
                </article>
              ))}
            </div>

            <div className="space-y-3">
              {[
                ['补充镜头素材', contentDeliveryPack.brollChecklist],
                ['发布证明', contentDeliveryPack.publishProofSlots],
                ['店长审核', contentDeliveryPack.managerReviewChecklist],
                ['跟进任务', contentDeliveryPack.followUpTasks],
              ].map(([title, items]) => (
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm" key={String(title)}>
                  <h3 className="text-sm font-semibold text-slate-950">{String(title)}</h3>
                  <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
                    {(items as string[]).slice(0, 4).map(item => (
                      <li className="flex gap-2" key={item}>
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">视频生产护照</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">脚本、素材、剪辑、成片、审核和发布证明在一张表里</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">这不是成片生成按钮。它只告诉店长：现在能准备什么、缺哪份凭证、谁负责，等成片链接或截图回填后再进入发布。</p>
            </div>
            <div className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
              已准备 {contentProductionPassport.summary.readyStages}/{contentProductionPassport.summary.totalStages}
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-7">
            {contentProductionPassport.stages.map(stage => (
              <article
                className={`rounded-xl border p-3 ${
                  stage.status === 'ready'
                    ? 'border-emerald-200 bg-emerald-50'
                    : stage.status === 'external-gated'
                      ? 'border-amber-200 bg-amber-50'
                      : 'border-slate-200 bg-slate-50'
                }`}
                key={stage.id}
              >
                <div className="text-xs font-semibold text-slate-500">{stage.owner}</div>
                <h3 className="mt-1 text-sm font-semibold text-slate-950">{stage.title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-600">{stage.output}</p>
                <p className="mt-2 rounded-lg bg-white px-2 py-1 text-[11px] leading-4 text-slate-500">下一步：{stage.nextAction}</p>
              </article>
            ))}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-sm font-semibold text-slate-950">负责人待办</h3>
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {contentProductionPassport.ownerChecklist.slice(0, 4).map(item => (
                  <div className="rounded-lg bg-white px-3 py-2 text-xs leading-5 text-slate-600" key={`${item.owner}-${item.evidenceRequired}`}>
                    <span className="font-semibold text-slate-900">{item.owner}：</span>{item.action}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h3 className="text-sm font-semibold text-amber-900">停止线</h3>
              <p className="mt-2 text-xs leading-5 text-amber-800">没有外部视频通道资料和成片凭证，不说视频已经完成。</p>
              <p className="mt-2 text-xs leading-5 text-amber-800">没有店长审核、发布证明和脱敏反馈，不写成真实经营结果。</p>
            </div>
          </div>
        </section>
      </FactoryFriendTrialExperience>
    );
  }

  const friendTrialVariantBoard = (
    <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">{variantPlaybook.title}</p>
          <h2 className="mt-2 text-2xl font-semibold text-neutral-950">{selectedVariant.headline}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-neutral-600">
            {selectedVariant.body}
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:w-[520px]">
          {Object.values(VIDEO_FACTORY_UI_VARIANTS).map(variant => (
            <a
              aria-current={variant === selectedVariant ? 'page' : undefined}
              className={`rounded-2xl border p-3 text-left transition ${variant === selectedVariant ? 'border-neutral-900 bg-neutral-900 text-white shadow-sm' : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300 hover:bg-white'}`}
              href={`/factory/video?projectId=${encodeURIComponent(projectId || queue?.projectId || 'default-project')}&variant=${variant === selectedVariant ? selectedVariantId : variant.label === '运营视角' ? 'operator' : variant.label === '朋友试用视角' ? 'friend_trial' : 'partner'}`}
              key={variant.label}
            >
              <span className="block text-sm font-semibold">{variant.label}</span>
              <span className="mt-1 block text-[11px] leading-4">{variant.audience}</span>
            </a>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_0.8fr]">
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">
          <div className="text-xs font-semibold uppercase text-neutral-500">第一动作</div>
          <p className="mt-2">{selectedVariant.firstAction}</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 text-sm leading-6 text-cyan-700">
          <div className="text-xs font-semibold uppercase text-neutral-500">证据检查</div>
          <p className="mt-2">{selectedVariant.proof}</p>
        </div>
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-700">
          <div className="text-xs font-semibold uppercase text-neutral-500">停止线</div>
          <p className="mt-2">{selectedVariant.stopLine}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 md:grid-cols-4">
        {variantPlaybook.cards.map(card => (
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-xs leading-5 text-neutral-600" key={card}>
            {card}
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-600">
        <span className="font-semibold text-neutral-950">{selectedVariant.reference.split('；')[0]}</span>
      </div>
    </section>
  );
  const friendTrialEvidenceStack = (
    <>
      <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Friend Trial Readiness</p>
            <h2 className="mt-2 text-xl font-semibold text-neutral-950">朋友试用放行判断</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
              这张卡不看“页面是否好看”，只看非技术用户能不能从视频任务进入客户审核并完成反馈或批准。
            </p>
          </div>
          <span className={`w-fit rounded-full border px-3 py-1 text-xs ${trialReadiness.firstReviewLink ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
            {trialReadiness.verdict}
          </span>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs font-semibold uppercase text-neutral-500">试用证据</div>
            <div className="mt-2 space-y-1">
              {trialReadiness.evidence.map(item => (
                <div className="text-xs leading-5 text-neutral-600" key={item}>{item}</div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs font-semibold uppercase text-neutral-500">可发入口</div>
            {trialReadiness.firstReviewLink ? (
              <a className="mt-2 block truncate text-xs leading-5 text-cyan-700 underline-offset-4 hover:underline" href={trialReadiness.firstReviewLink}>
                {trialReadiness.firstReviewLink}
              </a>
            ) : (
              <p className="mt-2 text-xs leading-5 text-amber-700">先写入成片 URL，并生成客户审核链接。</p>
            )}
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-xs font-semibold uppercase text-neutral-500">停止线</div>
            <p className="mt-2 text-xs leading-5 text-amber-700">{trialReadiness.stopLine}</p>
            <p className="mt-2 text-xs leading-5 text-cyan-700">内部下一步：{trialReadiness.nextAction}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Commercial Cut Readiness</p>
            <h2 className="mt-2 text-xl font-semibold text-neutral-950">商用 Cut 放行门禁</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
              这层只判断视频工厂是否已经能进入试跑验收：试跑回执、成片资产、客户审核、客户批准、发布或表现回流必须全部有证据。
            </p>
          </div>
          <div className="flex w-fit flex-col items-start gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs">
            <span className={cutReadiness.verdict === '可进入商用 Cut 验收' ? 'text-emerald-700' : 'text-amber-700'}>
              {cutReadiness.verdict}
            </span>
            <span className="text-neutral-500">score {cutReadiness.score}</span>
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {cutReadiness.gates.map(gate => (
            <div
              className={`rounded-2xl border p-3 ${gate.ok ? 'border-emerald-200 bg-emerald-50' : 'border-neutral-200 bg-neutral-50'}`}
              key={gate.label}
            >
              <div className={gate.ok ? 'text-xs font-semibold text-emerald-700' : 'text-xs font-semibold text-neutral-700'}>
                {gate.label}
              </div>
              <p className="mt-2 text-xs leading-5 text-neutral-600">{gate.detail}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <div className="text-xs font-semibold text-amber-700">商用风险</div>
            <p className="mt-2 text-xs leading-5 text-amber-700/80">{cutReadiness.risk}</p>
          </div>
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3">
            <div className="text-xs font-semibold text-rose-700">停止线</div>
            <p className="mt-2 text-xs leading-5 text-rose-700/80">{cutReadiness.stopLine}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Provider Sandbox Contract</p>
            <h2 className="mt-2 text-xl font-semibold text-neutral-950">视频 provider 沙盒接入合约 / 视频试跑通道沙盒接入合约</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
              这层不配置真实账号值，也不伪装已产出成片。它把接入视频试跑通道前必须验证的交接、回执、失败恢复、成片入库和客户验收拆成沙盒条件，等账号资料齐后直接对照验收。
            </p>
          </div>
          <div className="w-fit rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
            已通过 {providerSandboxChecks.filter(check => check.ready).length}/{providerSandboxChecks.length}
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-5">
          {providerSandboxChecks.map(check => (
            <article
              className={`rounded-2xl border p-3 ${check.ready ? 'border-emerald-200 bg-emerald-50' : 'border-neutral-200 bg-neutral-50'}`}
              key={check.gate}
            >
              <div className={`text-sm font-semibold ${check.ready ? 'text-emerald-700' : 'text-neutral-900'}`}>{check.gate}</div>
              <p className="mt-2 text-xs leading-5 text-neutral-600">证据：{check.evidence}</p>
              <p className="mt-2 text-xs leading-5 text-cyan-700">内部推进：{check.internalMove}</p>
              <p className="mt-2 text-xs leading-5 text-amber-700">账号资料条件：{check.externalGate}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Cut Operating Checks</p>
            <h2 className="mt-2 text-xl font-semibold text-neutral-950">视频工厂商用品质验收板</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-600">
              对照筷子科技、Hookshot、Creatify、Pencil、VidMob 这一类平台，Cut 不能只看“有没有按钮”，而要逐项检查 AI 视频解析、智能混剪、一键视频、provider 执行、成片审核和表现回流是否真的闭环。
            </p>
          </div>
          <div className="w-fit rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-700">
            ready {cutOperatingChecks.filter(check => check.status === 'ready').length}/{cutOperatingChecks.length}
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {cutOperatingChecks.map(check => (
            <article
              className={`rounded-2xl border p-4 ${check.status === 'ready' ? 'border-emerald-200 bg-emerald-50' : 'border-neutral-200 bg-neutral-50'}`}
              key={check.label}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-neutral-950">{check.label}</h3>
                <span className={`shrink-0 rounded-full border px-2 py-1 text-[11px] ${check.status === 'ready' ? 'border-emerald-200 bg-white text-emerald-700' : 'border-amber-200 bg-white text-amber-700'}`}>
                  {check.status === 'ready' ? '内部已具备' : '仍有阻断'}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-neutral-600">证据：{check.evidence}</p>
              <p className="mt-2 text-xs leading-5 text-cyan-700">内部推进：{check.internalMove}</p>
              <p className="mt-2 text-xs leading-5 text-amber-700">账号资料条件：{check.externalGate}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Cut / One-click Video Board</p>
            <h2 className="mt-2 text-xl font-semibold text-neutral-950">从 Hook 结构库到智能混剪包</h2>
          </div>
          <div className="max-w-sm text-xs leading-5 text-neutral-600">
            这层承接创意工厂，不把“创建任务”说成“已产出成片”。只有 provider、素材授权、平台账号和回流都接上，才进入可复用的视频工厂。
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-3">
          {MIXCUT_OPERATION_BOARD.map(item => (
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4" key={item.title}>
              <div className="text-sm font-semibold text-neutral-950">{item.title}</div>
              <div className="mt-2 text-xs leading-5 text-neutral-600">输入：{item.input}</div>
              <div className="mt-2 text-xs leading-5 text-cyan-700">动作：{item.action}</div>
              <div className="mt-2 text-xs leading-5 text-amber-700">门禁：{item.gate}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-neutral-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">Cut Production Line</p>
            <h2 className="mt-2 text-xl font-semibold text-neutral-950">从视频解析到分发回流的一条成片生产线</h2>
          </div>
          <p className="max-w-md text-xs leading-5 text-neutral-600">
            这层承接 Clico 的视频任务体验，也对齐筷子式批量混剪和一键视频。Wenai 先把任务、证据、审核、返修和回流做成可验收闭环；试跑通道接入前，不把计划页包装成已产出成片。
          </p>
        </div>
        <div className="mt-4 grid gap-3 xl:grid-cols-5">
          {CUT_PRODUCTION_LINE.map(item => (
            <article className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4" key={item.stage}>
              <div className="text-sm font-semibold text-neutral-950">{item.stage}</div>
              <div className="mt-3 space-y-2 text-xs leading-5">
                <p className="text-neutral-600"><span className="text-neutral-900">输入：</span>{item.input}</p>
                <p className="text-cyan-700"><span className="text-neutral-900">输出：</span>{item.output}</p>
                <p className="text-neutral-500"><span className="text-neutral-900">内部：</span>{item.internal}</p>
                <p className="text-amber-700"><span className="text-neutral-900">外部：</span>{item.external}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );

  async function ingestProductionResult(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const target = resultTarget;
    if (!target) {
      setError('请先创建一个视频生产任务，再回灌成片。');
      return;
    }
    const urls = resultUrls.split(/[\n,]/).map(item => item.trim()).filter(Boolean);
    if (!resultTaskId.trim() || urls.length === 0) {
      setError('请填写生产任务编号和至少一个成片 URL。');
      return;
    }
    const payload = resultAction?.payload || {};
    setLoading(true);
    const res = await fetch('/api/industrial-chain/production-result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: projectId || queue?.projectId || 'default-project',
        sourceHandoffAssetId: target.assetId,
        dispatchId: typeof payload.dispatchId === 'string' ? payload.dispatchId : undefined,
        channel: resultChannel || target.channels[0],
        createReviewLinks: true,
        reviewTtlDays: 14,
        task: {
          taskId: resultTaskId.trim(),
          status: 'completed',
          assetUrls: urls,
        },
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.message || data.error || '成片回灌失败');
      return;
    }
    setError('');
    setNotice(`成片已写回生产链路，生成 ${data.reviewLinks?.length || 0} 个客户审核链接。`);
    setResultTaskId('');
    setResultUrls('');
    await refreshQueue(projectId || queue?.projectId || 'default-project', false);
  }

  const friendTrialOperationTools = (
    <section className="rounded-[1.75rem] border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 border-b border-neutral-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Production operations</p>
          <h2 className="mt-2 text-xl font-semibold text-neutral-950">视频生产操作台</h2>
          <p className="mt-2 max-h-10 max-w-2xl overflow-hidden text-sm leading-5 text-neutral-600">
            创建视频工作流、回灌成片、生成审核入口和查看队列动作包都在同一张可验证工作台内完成。
          </p>
        </div>
        <div className="grid gap-2 text-xs text-neutral-600 sm:grid-cols-3 lg:w-[480px]">
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
            <span className="block font-semibold text-neutral-950">{queue?.itemCount || 0}</span>
            队列任务
          </div>
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
            <span className="block font-semibold text-neutral-950">{queue?.resultAssetCount || 0}</span>
            成片回灌
          </div>
          <div className="rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2">
            <span className="block font-semibold text-neutral-950">{queue?.clientReviewCount || 0}</span>
            审核入口
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
      <div className="space-y-5">
        <form className="rounded-lg border border-neutral-200 bg-neutral-50 p-5" onSubmit={createWorkflow}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-neutral-500">Create workflow</p>
              <h2 className="mt-2 text-lg font-semibold text-neutral-950">创建视频工作流</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                只创建可交接的生产任务、分发计划和执行记录；试跑通道未配置时不会宣称已产出成片。
              </p>
            </div>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
              provider-gated
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            <input className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-400" value={projectId} onChange={event => setProjectId(event.target.value)} placeholder="项目 ID" />
            <input className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-400" value={productName} onChange={event => setProductName(event.target.value)} placeholder="菜品/套餐名" required />
            <input className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-400" value={category} onChange={event => setCategory(event.target.value)} placeholder="类目" />
            <input className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-400" value={platforms} onChange={event => setPlatforms(event.target.value)} placeholder="平台，用逗号分隔" />
            <input className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-400" value={reference} onChange={event => setReference(event.target.value)} placeholder="参考视频 URL" />
            <input className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-400" value={productAsset} onChange={event => setProductAsset(event.target.value)} placeholder="门店素材 URL" />
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" checked={providerConfigured} onChange={event => setProviderConfigured(event.target.checked)} />
              供应商已配置
            </label>
            <label className="flex items-center gap-2 text-sm text-neutral-700">
              <input type="checkbox" checked={legalConsent} onChange={event => setLegalConsent(event.target.checked)} />
              已获得素材与生成授权
            </label>
            <button disabled={loading} className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white disabled:bg-neutral-200 disabled:text-neutral-500" type="submit">
              创建任务并写入分发队列
            </button>
            <button disabled={loading} className="rounded-md border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 disabled:text-neutral-400" type="button" onClick={() => void refreshQueue()}>
              刷新队列
            </button>
          </div>
        </form>

        <form className="rounded-lg border border-neutral-200 bg-white p-5" onSubmit={ingestProductionResult}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase text-neutral-500">Ingest result</p>
              <h2 className="mt-2 text-lg font-semibold text-neutral-950">回灌成片并生成审核链接</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                供应商或剪辑师完成后，把成片链接写回生产链路，系统再创建客户审核门户。
              </p>
            </div>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              审核就绪
            </span>
          </div>
          <div className="mt-5 grid gap-3">
            <select className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-400" value={resultTarget?.assetId || ''} onChange={event => setResultAssetId(event.target.value)}>
              {items.length ? items.map(item => (
                <option value={item.assetId} key={item.assetId}>{displayVideoTitle(item.title)}</option>
              )) : <option value="">请先创建视频任务</option>}
            </select>
            <input className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-400" value={resultTaskId} onChange={event => setResultTaskId(event.target.value)} placeholder="生产任务编号或剪辑批次号" />
            <input className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-400" value={resultChannel} onChange={event => setResultChannel(event.target.value)} placeholder="渠道，默认使用任务首个渠道" />
            <textarea className="min-h-24 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-400" value={resultUrls} onChange={event => setResultUrls(event.target.value)} placeholder="成片 URL，可一行一个或用逗号分隔" />
            <button disabled={loading || !items.length} className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-semibold text-white disabled:bg-neutral-200 disabled:text-neutral-500" type="submit">
              写入成片并创建客户审核
            </button>
          </div>
        </form>
      </div>

      <div className="self-start rounded-lg border border-neutral-200 bg-neutral-50 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-neutral-500">Queue operations</p>
            <h2 className="mt-2 text-lg font-semibold text-neutral-950">队列状态</h2>
          </div>
          <div className="text-xs text-neutral-500">
            {queue ? `${queue.itemCount} 个任务 · 试跑通道就绪 ${providerReadyRatio} · 结果 ${queue.resultAssetCount} · 审核 ${queue.clientReviewCount} · 已批准 ${queue.approvedDeliverableCount}` : '正在加载 · 试跑通道就绪 0/0'}
          </div>
        </div>
        <p className="mt-3 max-h-10 overflow-hidden text-sm leading-5 text-neutral-600">
          运营动作包会把阶段、优先级、服务时限、下一步动作和交接内容汇总出来，方便手工执行或后续接试跑队列。
        </p>
        <div className="mt-4 grid gap-2 text-sm text-neutral-700 sm:grid-cols-4">
          <div className="rounded-md border border-neutral-200 bg-white px-3 py-2">仅交接：{queue?.handoffOnlyCount || 0}</div>
          <div className="rounded-md border border-neutral-200 bg-white px-3 py-2">阻塞：{queue?.blockedCount || 0}</div>
          <div className="rounded-md border border-neutral-200 bg-white px-3 py-2">已回流：{queue?.measuredCount || 0}</div>
          <div className="rounded-md border border-neutral-200 bg-white px-3 py-2">闭环：{queue?.averageLoopCompletionScore || 0}/100</div>
        </div>
        <div className="mt-5 space-y-4">
          {items.length ? items.map(item => (
            <article className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm" key={item.assetId}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-neutral-950">{displayVideoTitle(item.title)}</div>
                  <div className="mt-1 text-xs text-neutral-500">{item.assetId}</div>
                </div>
                <span className={`w-fit rounded-full border px-2 py-1 text-xs ${item.mode === 'provider_ready' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                  {modeLabel(item.mode)}
                </span>
              </div>
              <dl className="mt-4 grid gap-2 text-sm text-neutral-700 sm:grid-cols-4">
                <div><dt className="text-xs text-neutral-400">阶段</dt><dd>{stageLabel(item.stage)}</dd></div>
                <div><dt className="text-xs text-neutral-400">优先级</dt><dd>{priorityLabel(item.priority)}</dd></div>
                <div><dt className="text-xs text-neutral-400">SLA</dt><dd>{item.slaHoursRemaining} 小时</dd></div>
                <div><dt className="text-xs text-neutral-400">计划</dt><dd>{item.planCount}</dd></div>
                <div><dt className="text-xs text-neutral-400">分发</dt><dd>{item.dispatchCount}</dd></div>
                <div><dt className="text-xs text-neutral-400">待手工交接</dt><dd>{item.manualReadyDispatchCount}</dd></div>
                <div><dt className="text-xs text-neutral-400">已回流</dt><dd>{item.measuredDispatchCount}</dd></div>
                <div><dt className="text-xs text-neutral-400">结果</dt><dd>{item.resultAssetCount}</dd></div>
                <div><dt className="text-xs text-neutral-400">审核</dt><dd>{item.clientReviewAssetCount}</dd></div>
                <div><dt className="text-xs text-neutral-400">已批准</dt><dd>{item.approvedDeliverableCount}</dd></div>
                <div><dt className="text-xs text-neutral-400">返修</dt><dd>{item.revisionRequestedCount}</dd></div>
                <div><dt className="text-xs text-neutral-400">闭环分</dt><dd>{item.loopCompletionScore}/100</dd></div>
              </dl>
              <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                <div className="text-xs font-semibold uppercase text-neutral-500">生产交接包</div>
                <div className="mt-1 text-sm text-neutral-600">{readableHandoffSummary(item.handoffPacket.summary)}</div>
                {item.handoffPacket.reviewPortalUrls.length ? (
                  <div className="mt-2 space-y-1">
                    {item.handoffPacket.reviewPortalUrls.map(url => (
                      <a className="block truncate text-xs text-emerald-700 underline-offset-4 hover:underline" href={reviewUrlWithVariant(url, selectedVariantId)} key={url}>客户审核门户：{reviewUrlWithVariant(url, selectedVariantId)}</a>
                    ))}
                  </div>
                ) : null}
                {item.handoffPacket.missingEvidence.length ? (
                  <div className="mt-2 space-y-1">
                    {item.handoffPacket.missingEvidence.slice(0, 4).map(item => <div className="text-xs text-amber-700" key={item}>缺证据：{queueText(item)}</div>)}
                  </div>
                ) : <div className="mt-2 text-xs text-emerald-700">交接证据已覆盖计划、执行、成片、审核、批准和表现回流。</div>}
              </div>
              <div className="mt-3 text-xs text-neutral-500">渠道：{item.channels.join(', ') || '-'}</div>
              <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase text-sky-800">视频生产护照</div>
                    <div className="mt-1 text-xs leading-5 text-sky-700">把智能混剪和一键视频拆成可验收门禁</div>
                  </div>
                  <div className="text-xs leading-5 text-sky-700">
                    没有成片、客户批准和回流证据前，不把任务队列说成真实视频工厂。
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-5">
                  {buildVideoProductionPassport(item).map(gate => (
                    <div className={`rounded-md border px-3 py-2 ${productionPassportClass(gate.tone)}`} key={gate.title}>
                      <div className="text-xs opacity-65">{gate.title}</div>
                      <div className="mt-1 text-sm font-semibold">{gate.value}</div>
                      <div className="mt-1 text-xs leading-5 opacity-75">{gate.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
              {item.remixPlan.length ? (
                <div className="mt-4 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
                  <div className="text-xs font-semibold uppercase text-neutral-500">智能混剪计划</div>
                  <div className="mt-2 space-y-3">
                    {item.remixPlan.slice(0, 3).map(variant => (
                      <div className="border-b border-neutral-200 pb-2 text-xs text-neutral-600 last:border-b-0 last:pb-0" key={variant.id}>
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                          <div className="font-semibold text-neutral-950">{variant.label}</div>
                          <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">{remixSourceLabel(variant.source)}</span>
                        </div>
                        <div className="mt-1">钩子：{variant.hook}</div>
                        <div className="mt-1 text-neutral-500">剪辑：{variant.cutPlan.slice(0, 3).join(' / ')}</div>
                        <div className="mt-1 text-amber-700">边界：{variant.riskBoundary}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className="mt-4 rounded-lg border border-sky-200 bg-sky-50 p-3">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                  <div className="text-xs font-semibold uppercase text-sky-800">人工成片试跑 Runbook</div>
                  <div className="text-xs leading-5 text-sky-700">不等 provider，也能把 Clico 式交付链路跑完</div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-5">
                  {manualTrialRunbook(item).map(step => (
                    <div className="rounded-md border border-sky-100 bg-white px-3 py-2" key={step.title}>
                      <div className="text-xs font-semibold text-neutral-950">{step.title}</div>
                      <div className="mt-1 w-fit rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] text-sky-700">{step.state}</div>
                      <div className="mt-2 text-xs leading-5 text-neutral-600">{step.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
              {item.reviewLinks.length ? (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <div className="text-xs font-semibold uppercase text-emerald-800">客户试用出口</div>
                  <p className="mt-1 text-xs leading-5 text-emerald-700">
                    把下面链接发给客户或朋友；当前会进入 {selectedVariant.label}，客户只需要预览、反馈或批准。
                  </p>
                  <div className="mt-2 space-y-1">
                    {item.reviewLinks.map(link => (
                      <a className="block truncate text-xs text-emerald-700 underline-offset-4 hover:underline" href={reviewUrlWithVariant(`/review/${link.token}`, selectedVariantId)} key={link.token}>
                        审核：{link.assetTitle} / {link.status} / {reviewUrlWithVariant(`/review/${link.token}`, selectedVariantId)}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
              {item.runbookActions.length ? (
                <div className="mt-4 border-t border-neutral-200 pt-3">
                  <div className="text-xs font-semibold uppercase text-neutral-500">运营动作包</div>
                  <div className="mt-2 space-y-1">
                    {item.runbookActions.map(action => (
                      <div className="text-xs text-neutral-600" key={action.id}>
                        {action.label} · 交接方式 {action.method} · 交接位置 {action.endpoint}
                        <div className="mt-1 truncate text-neutral-400">请求内容：{readablePayload(action.payload)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          )) : (
            <div className="rounded-lg border border-neutral-200 bg-white px-4 py-8 text-sm text-neutral-500">
              当前项目还没有视频生产任务。创建任务后，系统会自动生成生产交接资产、分发计划和执行记录。
            </div>
          )}
        </div>
      </div>
      </div>
    </section>
  );

  return (
    <main className={isFriendTrialVariant ? 'min-h-screen bg-[#f3f4f6] text-neutral-900' : 'min-h-screen bg-[#0d1014] text-[#f4efe7]'}>
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8">
        <header className={isFriendTrialVariant ? 'border-b border-neutral-200 pb-6' : 'border-b border-white/10 pb-6'}>
          <p className={isFriendTrialVariant ? 'text-xs uppercase text-neutral-500' : 'text-xs uppercase tracking-[0.24em] text-amber-200'}>Wenai 视频工厂</p>
          <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight sm:text-5xl">视频生产队列</h1>
          <p className={isFriendTrialVariant ? 'mt-4 max-w-3xl text-sm leading-6 text-neutral-600' : 'mt-4 max-w-3xl text-sm leading-6 text-white/65'}>
            把门店 brief、参考视频、菜品/门店素材、AI 视频分析、智能混剪、供应商门禁、分发计划和执行记录统一到一条队列里。没有真实供应商授权时，任务保持仅交接，不伪装自动生成。供应商就绪只代表试跑通道资料齐，不代表已产出成片。
          </p>
        </header>

        {isFriendTrialVariant ? (
          <FriendTrialProductionConsole
            cutOperatingChecks={cutOperatingChecks}
            cutReadiness={cutReadiness}
            providerReadyRatio={providerReadyRatio}
            providerSandboxChecks={providerSandboxChecks}
            queue={queue}
            trialReadiness={trialReadiness}
          />
        ) : null}

        {isFriendTrialVariant ? (
          <>
            {friendTrialVariantBoard}
            {friendTrialOperationTools}
            {friendTrialEvidenceStack}
            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
            {notice ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div> : null}
          </>
        ) : (
          <>
        <FactoryVariantConsole
          accent="cyan"
          basePath="/factory/video"
          evidenceCards={[
            ...variantPlaybook.cards,
            selectedVariant.proof,
            selectedVariant.stopLine,
            selectedVariant.reference,
          ]}
          eyebrow="Video Factory Variant / Variant Action Playbook"
          firstScreen={`${selectedVariant.headline} ${selectedVariant.body}`}
          nextAction={selectedVariant.firstAction}
          primaryAction={variantPlaybook.primaryAction}
          projectId={projectId || queue?.projectId || 'default-project'}
          proofFocus={variantPlaybook.proofToCheck}
          selectedVariantId={selectedVariantId}
          stopLine={variantPlaybook.handoffBoundary}
          title={variantPlaybook.title}
          variants={VIDEO_FACTORY_UI_VARIANTS}
        />

        <section className="border border-cyan-300/20 bg-cyan-950/20 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Friend Trial Readiness</p>
              <h2 className="mt-2 text-xl font-semibold">朋友试用放行判断</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                这张卡不看“页面是否好看”，只看非技术用户能不能从视频任务进入客户审核并完成反馈或批准。
              </p>
            </div>
            <span className={`w-fit border px-3 py-1 text-xs ${trialReadiness.firstReviewLink ? 'border-emerald-300/35 text-emerald-100' : 'border-amber-300/35 text-amber-100'}`}>
              {trialReadiness.verdict}
            </span>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_1fr]">
            <div className="border border-white/10 bg-black/20 p-3">
              <div className="text-xs font-semibold text-white/80">试用证据</div>
              <div className="mt-2 space-y-1">
                {trialReadiness.evidence.map(item => (
                  <div className="text-xs leading-5 text-white/55" key={item}>{item}</div>
                ))}
              </div>
            </div>
            <div className="border border-white/10 bg-black/20 p-3">
              <div className="text-xs font-semibold text-white/80">可发入口</div>
              {trialReadiness.firstReviewLink ? (
                <a className="mt-2 block truncate text-xs leading-5 text-cyan-200 underline-offset-4 hover:underline" href={trialReadiness.firstReviewLink}>
                  {trialReadiness.firstReviewLink}
                </a>
              ) : (
                <p className="mt-2 text-xs leading-5 text-amber-100">先写入成片 URL，并生成客户审核链接。</p>
              )}
            </div>
            <div className="border border-white/10 bg-black/20 p-3">
              <div className="text-xs font-semibold text-white/80">停止线</div>
              <p className="mt-2 text-xs leading-5 text-amber-100">{trialReadiness.stopLine}</p>
              <p className="mt-2 text-xs leading-5 text-cyan-100">内部下一步：{trialReadiness.nextAction}</p>
            </div>
          </div>
        </section>

        <section className="border border-violet-300/20 bg-violet-950/20 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-violet-200">Commercial Cut Readiness</p>
              <h2 className="mt-2 text-xl font-semibold">商用 Cut 放行门禁</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
              这层只判断视频工厂是否已经能进入试跑验收：试跑回执、成片资产、客户审核、客户批准、发布或表现回流必须全部有证据。
              </p>
            </div>
            <div className="flex w-fit flex-col items-start gap-2 border border-white/10 bg-black/25 px-3 py-2 text-xs">
              <span className={cutReadiness.verdict === '可进入商用 Cut 验收' ? 'text-emerald-100' : 'text-amber-100'}>
                {cutReadiness.verdict}
              </span>
              <span className="text-white/55">score {cutReadiness.score}</span>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {cutReadiness.gates.map(gate => (
              <div
                className={`border p-3 ${gate.ok ? 'border-emerald-300/25 bg-emerald-950/20' : 'border-white/10 bg-black/20'}`}
                key={gate.label}
              >
                <div className={gate.ok ? 'text-xs font-semibold text-emerald-100' : 'text-xs font-semibold text-white/80'}>
                  {gate.label}
                </div>
                <p className="mt-2 text-xs leading-5 text-white/55">{gate.detail}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="border border-amber-300/20 bg-black/20 p-3">
              <div className="text-xs font-semibold text-amber-100">商用风险</div>
              <p className="mt-2 text-xs leading-5 text-amber-100/80">{cutReadiness.risk}</p>
            </div>
            <div className="border border-rose-300/20 bg-black/20 p-3">
              <div className="text-xs font-semibold text-rose-100">停止线</div>
              <p className="mt-2 text-xs leading-5 text-rose-100/80">{cutReadiness.stopLine}</p>
            </div>
          </div>
        </section>

        <section className="border border-cyan-300/20 bg-cyan-950/20 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-200">Provider Sandbox Contract</p>
              <h2 className="mt-2 text-xl font-semibold">视频 provider 沙盒接入合约 / 视频试跑通道沙盒接入合约</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                这层不配置真实账号值，也不伪装已产出成片。它把接入视频试跑通道前必须验证的交接、回执、失败恢复、成片入库和客户验收拆成沙盒条件，等账号资料齐后直接对照验收。
              </p>
            </div>
            <div className="w-fit border border-white/10 bg-black/25 px-3 py-2 text-xs text-cyan-100">
              ready {providerSandboxChecks.filter(check => check.ready).length}/{providerSandboxChecks.length}
            </div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-5">
            {providerSandboxChecks.map(check => (
              <article
                className={`border p-3 ${check.ready ? 'border-emerald-300/25 bg-emerald-950/15' : 'border-cyan-300/20 bg-black/20'}`}
                key={check.gate}
              >
                <div className={`text-sm font-semibold ${check.ready ? 'text-emerald-100' : 'text-cyan-100'}`}>{check.gate}</div>
                <p className="mt-2 text-xs leading-5 text-white/55">证据：{check.evidence}</p>
                <p className="mt-2 text-xs leading-5 text-cyan-100/80">内部推进：{check.internalMove}</p>
                <p className="mt-2 text-xs leading-5 text-amber-100">账号资料条件：{check.externalGate}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border border-orange-300/20 bg-orange-950/20 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-orange-200">Cut Operating Checks</p>
              <h2 className="mt-2 text-xl font-semibold">视频工厂商用品质验收板</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                对照筷子科技、Hookshot、Creatify、Pencil、VidMob 这一类平台，Cut 不能只看“有没有按钮”，而要逐项检查 AI 视频解析、智能混剪、一键视频、provider 执行、成片审核和表现回流是否真的闭环。
              </p>
            </div>
            <div className="w-fit border border-white/10 bg-black/25 px-3 py-2 text-xs text-orange-100">
              ready {cutOperatingChecks.filter(check => check.status === 'ready').length}/{cutOperatingChecks.length}
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {cutOperatingChecks.map(check => (
              <article
                className={`border p-4 ${check.status === 'ready' ? 'border-emerald-300/25 bg-emerald-950/15' : 'border-amber-300/20 bg-black/20'}`}
                key={check.label}
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold text-white">{check.label}</h3>
                  <span className={`shrink-0 border px-2 py-1 text-[11px] ${check.status === 'ready' ? 'border-emerald-300/35 text-emerald-100' : 'border-amber-300/35 text-amber-100'}`}>
                    {check.status === 'ready' ? '内部已具备' : '仍有阻断'}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-white/55">证据：{check.evidence}</p>
                <p className="mt-2 text-xs leading-5 text-orange-100/80">内部推进：{check.internalMove}</p>
                <p className="mt-2 text-xs leading-5 text-amber-100">账号资料条件：{check.externalGate}</p>
              </article>
            ))}
          </div>
        </section>

        {error ? <div className="border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        {notice ? <div className="border border-emerald-400/40 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-100">{notice}</div> : null}
        {operation ? (
          <section className="border border-amber-300/25 bg-amber-950/15 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-amber-200">One-click operation</p>
                <h2 className="mt-2 text-xl font-semibold">一键视频运营编排</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">{operation.operatorSummary}</p>
              </div>
              <span className={`w-fit border px-3 py-1 text-xs ${operation.commerciallyExecutable ? 'border-emerald-300/35 text-emerald-100' : 'border-amber-300/35 text-amber-100'}`}>
                {operation.commerciallyExecutable ? '可商用自动化' : '外部能力未接入'}
              </span>
            </div>
            <div className="mt-4 border border-white/10 bg-black/20 p-3">
              <div className="text-xs font-semibold text-white/75">一键视频闭环判定</div>
              <div className="mt-3 grid gap-2 md:grid-cols-4">
                {operationClosureCards(operation).map(card => (
                  <div className="border border-white/10 bg-white/[0.03] px-3 py-2" key={card.title}>
                    <div className="text-xs font-semibold text-white/85">{card.title}</div>
                    <div className="mt-1 text-xs leading-5 text-white/55">{card.body}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="border border-white/10 bg-black/20 p-3">
                <div className="text-xs font-semibold text-white/75">自动创建物</div>
                <div className="mt-2 space-y-1">
                  {operation.autoCreated.slice(0, 6).map(item => (
                    <div className="truncate text-xs text-white/55" key={item}>{item}</div>
                  ))}
                </div>
              </div>
              <div className="border border-white/10 bg-black/20 p-3">
                <div className="text-xs font-semibold text-white/75">外部阻塞清单</div>
                <div className="mt-2 space-y-1">
                  {operation.externalRequirements.length ? operation.externalRequirements.slice(0, 6).map(item => (
                    <div className="text-xs text-amber-100" key={item}>{item}</div>
                  )) : <div className="text-xs text-emerald-100">暂无外部阻塞。</div>}
                </div>
              </div>
              <div className="border border-white/10 bg-black/20 p-3">
                <div className="text-xs font-semibold text-white/75">规模化数字展示保护</div>
                <div className="mt-2 space-y-1">
                  {operation.scaleClaimGuards.map(claim => (
                    <div className="text-xs text-white/55" key={claim.requestedBenchmark}>
                      <span className="text-amber-100">{claim.requestedBenchmark}</span>：{claim.canDisplay ? '可展示' : '禁止作为 Wenai 指标展示'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs font-semibold text-white/75">能力矩阵</div>
            <div className="mt-2 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {operation.capabilityStates.map(state => (
                <div className="border border-white/10 bg-black/20 p-3" key={state.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-sm font-semibold text-white/85">{state.label}</div>
                    <span className={`shrink-0 border px-2 py-1 text-[11px] ${capabilityStatusClass(state.status)}`}>{capabilityStatusLabel(state.status)}</span>
                  </div>
                  <div className="mt-2 text-xs leading-5 text-white/50">{state.evidence}</div>
                  <div className="mt-2 text-xs leading-5 text-white/60">下一步：{state.nextStep}</div>
                  {state.externalRequirement ? <div className="mt-2 text-xs leading-5 text-amber-100">外部要求：{state.externalRequirement}</div> : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="border border-emerald-300/20 bg-emerald-300/[0.055] p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">Cut / One-click Video Board</p>
              <h2 className="mt-2 text-xl font-semibold">从 Hook 结构库到智能混剪包</h2>
            </div>
            <div className="max-w-sm text-xs leading-5 text-emerald-100/80">
              这层承接创意工厂，不把“创建任务”说成“已产出成片”。只有 provider、素材授权、平台账号和回流都接上，才进入可复用的视频工厂。
            </div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {MIXCUT_OPERATION_BOARD.map(item => (
              <article className="border border-white/10 bg-black/20 p-4" key={item.title}>
                <div className="text-sm font-semibold text-white">{item.title}</div>
                <div className="mt-2 text-xs leading-5 text-white/65">输入：{item.input}</div>
                <div className="mt-2 text-xs leading-5 text-emerald-200">动作：{item.action}</div>
                <div className="mt-2 text-xs leading-5 text-amber-100">门禁：{item.gate}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="border border-white/10 bg-white/[0.035] p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-sky-200">Cut Production Line</p>
              <h2 className="mt-2 text-xl font-semibold">从视频解析到分发回流的一条成片生产线</h2>
            </div>
            <p className="max-w-md text-xs leading-5 text-white/55">
              这层承接 Clico 的视频任务体验，也对齐筷子式批量混剪和一键视频。Wenai 先把任务、证据、审核、返修和回流做成可验收闭环；试跑通道接入前，不把计划页包装成已产出成片。
            </p>
          </div>
          <div className="mt-4 grid gap-3 xl:grid-cols-5">
            {CUT_PRODUCTION_LINE.map(item => (
              <article className="border border-white/10 bg-black/20 p-4" key={item.stage}>
                <div className="text-sm font-semibold text-white">{item.stage}</div>
                <div className="mt-3 space-y-2 text-xs leading-5">
                  <p className="text-white/60"><span className="text-white/90">输入：</span>{item.input}</p>
                  <p className="text-sky-200"><span className="text-white/90">输出：</span>{item.output}</p>
                  <p className="text-white/55"><span className="text-white/90">内部：</span>{item.internal}</p>
                  <p className="text-amber-100"><span className="text-white/90">外部：</span>{item.external}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="space-y-5">
            <form className="border border-white/10 bg-white/[0.03] p-5" onSubmit={createWorkflow}>
              <h2 className="text-base font-semibold">创建视频工作流</h2>
              <div className="mt-4 grid gap-3">
                <input className="border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300" value={projectId} onChange={event => setProjectId(event.target.value)} placeholder="项目 ID" />
                <input className="border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300" value={productName} onChange={event => setProductName(event.target.value)} placeholder="菜品/套餐名" required />
                <input className="border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300" value={category} onChange={event => setCategory(event.target.value)} placeholder="类目" />
                <input className="border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300" value={platforms} onChange={event => setPlatforms(event.target.value)} placeholder="平台，用逗号分隔" />
                <input className="border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300" value={reference} onChange={event => setReference(event.target.value)} placeholder="参考视频 URL" />
                <input className="border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300" value={productAsset} onChange={event => setProductAsset(event.target.value)} placeholder="门店素材 URL" />
                <label className="flex items-center gap-2 text-sm text-white/65">
                  <input type="checkbox" checked={providerConfigured} onChange={event => setProviderConfigured(event.target.checked)} />
                  供应商已配置
                </label>
                <label className="flex items-center gap-2 text-sm text-white/65">
                  <input type="checkbox" checked={legalConsent} onChange={event => setLegalConsent(event.target.checked)} />
                  已获得素材与生成授权
                </label>
                <button disabled={loading} className="bg-amber-300 px-4 py-2 text-sm font-semibold text-black disabled:bg-white/20 disabled:text-white/40" type="submit">
                  创建任务并写入分发队列
                </button>
                <button disabled={loading} className="border border-white/15 px-4 py-2 text-sm text-white/75 disabled:text-white/30" type="button" onClick={() => void refreshQueue()}>
                  刷新队列
                </button>
              </div>
            </form>

            <form className="border border-white/10 bg-white/[0.03] p-5" onSubmit={ingestProductionResult}>
              <h2 className="text-base font-semibold">回灌成片并生成审核链接</h2>
              <p className="mt-2 text-xs leading-5 text-white/50">
                供应商或剪辑师完成后，把成片链接写回生产链路，系统会创建客户审核门户链接。
              </p>
              <div className="mt-4 grid gap-3">
                <select className="border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300" value={resultTarget?.assetId || ''} onChange={event => setResultAssetId(event.target.value)}>
                  {items.length ? items.map(item => (
                    <option value={item.assetId} key={item.assetId}>{displayVideoTitle(item.title)}</option>
                  )) : <option value="">请先创建视频任务</option>}
                </select>
                <input className="border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300" value={resultTaskId} onChange={event => setResultTaskId(event.target.value)} placeholder="生产任务编号或剪辑批次号" />
                <input className="border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300" value={resultChannel} onChange={event => setResultChannel(event.target.value)} placeholder="渠道，默认使用任务首个渠道" />
                <textarea className="min-h-24 border border-white/15 bg-black/30 px-3 py-2 text-sm outline-none focus:border-amber-300" value={resultUrls} onChange={event => setResultUrls(event.target.value)} placeholder="成片 URL，可一行一个或用逗号分隔" />
                <button disabled={loading || !items.length} className="bg-emerald-300 px-4 py-2 text-sm font-semibold text-black disabled:bg-white/20 disabled:text-white/40" type="submit">
                  写入成片并创建客户审核
                </button>
              </div>
            </form>
          </div>

          <div className="border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold">队列状态</h2>
              <div className="text-xs text-white/50">
                {queue ? `${queue.itemCount} 个任务 · 试跑通道就绪 ${providerReadyRatio} · 结果 ${queue.resultAssetCount} · 审核 ${queue.clientReviewCount} · 已批准 ${queue.approvedDeliverableCount}` : '正在加载 · 试跑通道就绪 0/0'}
              </div>
            </div>
            <p className="mt-2 text-xs leading-5 text-white/45">
              运营动作包会把每个视频任务的阶段、优先级、服务时限、下一步动作和交接内容汇总出来，方便手工执行或后续接试跑队列。
            </p>
            <div className="mt-4 grid gap-2 text-xs text-white/60 sm:grid-cols-4">
              <div className="border border-white/10 px-3 py-2">仅交接：{queue?.handoffOnlyCount || 0}</div>
              <div className="border border-white/10 px-3 py-2">阻塞：{queue?.blockedCount || 0}</div>
              <div className="border border-white/10 px-3 py-2">已回流：{queue?.measuredCount || 0}</div>
              <div className="border border-white/10 px-3 py-2">闭环：{queue?.averageLoopCompletionScore || 0}/100</div>
            </div>
            <div className="mt-5 space-y-4">
              {items.length ? items.map(item => (
                <article className="border border-white/10 bg-black/20 p-4" key={item.assetId}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold">{displayVideoTitle(item.title)}</div>
                      <div className="mt-1 text-xs text-white/45">{item.assetId}</div>
                    </div>
                    <span className={`w-fit border px-2 py-1 text-xs ${item.mode === 'provider_ready' ? 'border-emerald-300/40 text-emerald-200' : 'border-amber-300/40 text-amber-200'}`}>
                      {modeLabel(item.mode)}
                    </span>
                  </div>
                  <dl className="mt-4 grid gap-2 text-xs text-white/65 sm:grid-cols-4">
                    <div><dt className="text-white/35">阶段</dt><dd>{stageLabel(item.stage)}</dd></div>
                    <div><dt className="text-white/35">优先级</dt><dd>{priorityLabel(item.priority)}</dd></div>
                    <div><dt className="text-white/35">SLA</dt><dd>{item.slaHoursRemaining} 小时</dd></div>
                    <div><dt className="text-white/35">计划</dt><dd>{item.planCount}</dd></div>
                    <div><dt className="text-white/35">分发</dt><dd>{item.dispatchCount}</dd></div>
                    <div><dt className="text-white/35">待手工交接</dt><dd>{item.manualReadyDispatchCount}</dd></div>
                    <div><dt className="text-white/35">已回流</dt><dd>{item.measuredDispatchCount}</dd></div>
                    <div><dt className="text-white/35">结果</dt><dd>{item.resultAssetCount}</dd></div>
                    <div><dt className="text-white/35">审核</dt><dd>{item.clientReviewAssetCount}</dd></div>
                    <div><dt className="text-white/35">已批准</dt><dd>{item.approvedDeliverableCount}</dd></div>
                    <div><dt className="text-white/35">返修</dt><dd>{item.revisionRequestedCount}</dd></div>
                    <div><dt className="text-white/35">闭环分</dt><dd>{item.loopCompletionScore}/100</dd></div>
                  </dl>
                  <div className="mt-3 border border-white/10 bg-white/[0.03] p-3">
                    <div className="text-xs font-semibold text-white/75">生产交接包</div>
                    <div className="mt-1 text-xs text-white/50">{readableHandoffSummary(item.handoffPacket.summary)}</div>
                    {item.handoffPacket.reviewPortalUrls.length ? (
                      <div className="mt-2 space-y-1">
                        {item.handoffPacket.reviewPortalUrls.map(url => (
                          <a className="block truncate text-xs text-emerald-200 underline-offset-4 hover:underline" href={reviewUrlWithVariant(url, selectedVariantId)} key={url}>客户审核门户：{reviewUrlWithVariant(url, selectedVariantId)}</a>
                        ))}
                      </div>
                    ) : null}
                    {item.handoffPacket.missingEvidence.length ? (
                      <div className="mt-2 space-y-1">
                        {item.handoffPacket.missingEvidence.slice(0, 4).map(item => <div className="text-xs text-amber-100" key={item}>缺证据：{queueText(item)}</div>)}
                      </div>
                    ) : <div className="mt-2 text-xs text-emerald-200">交接证据已覆盖计划、执行、成片、审核、批准和表现回流。</div>}
                  </div>
                  <div className="mt-3 text-xs text-white/55">渠道：{item.channels.join(', ') || '-'}</div>
                  <div className="mt-3 border border-cyan-300/20 bg-cyan-950/20 p-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="text-xs font-semibold text-cyan-100">视频生产护照</div>
                        <div className="mt-1 text-[11px] leading-5 text-cyan-100/65">把智能混剪和一键视频拆成可验收门禁</div>
                      </div>
                      <div className="text-[11px] leading-5 text-cyan-100/55">
                        没有成片、客户批准和回流证据前，不把任务队列说成真实视频工厂。
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-5">
                      {buildVideoProductionPassport(item).map(gate => (
                        <div className={`border px-3 py-2 ${productionPassportClass(gate.tone)}`} key={gate.title}>
                          <div className="text-xs opacity-65">{gate.title}</div>
                          <div className="mt-1 text-sm font-semibold">{gate.value}</div>
                          <div className="mt-1 text-xs leading-5 opacity-75">{gate.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {item.remixPlan.length ? (
                    <div className="mt-3 border border-white/10 bg-white/[0.03] p-3">
                      <div className="text-xs font-semibold text-white/75">智能混剪计划</div>
                      <div className="mt-2 space-y-3">
                        {item.remixPlan.slice(0, 3).map(variant => (
                          <div className="border-b border-white/10 pb-2 text-xs text-white/60 last:border-b-0 last:pb-0" key={variant.id}>
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                              <div className="font-semibold text-white/85">{variant.label}</div>
                              <span className="w-fit border border-emerald-300/30 px-2 py-1 text-emerald-100">{remixSourceLabel(variant.source)}</span>
                            </div>
                            <div className="mt-1 text-white/55">钩子：{variant.hook}</div>
                            <div className="mt-1 text-white/45">剪辑：{variant.cutPlan.slice(0, 3).join(' / ')}</div>
                            <div className="mt-1 text-amber-100">边界：{variant.riskBoundary}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  {item.resultUrls.length ? (
                    <div className="mt-3 space-y-1">
                      {item.resultUrls.map(url => <div className="truncate text-xs text-white/60" key={url}>结果：{url}</div>)}
                    </div>
                  ) : null}
                  <div className="mt-3 border border-sky-300/20 bg-sky-950/20 p-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <div className="text-xs font-semibold text-sky-100">人工成片试跑 Runbook</div>
                      <div className="text-[11px] leading-5 text-sky-100/65">不等 provider，也能把 Clico 式交付链路跑完</div>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-5">
                      {manualTrialRunbook(item).map(step => (
                        <div className="border border-sky-300/15 bg-black/20 px-3 py-2" key={step.title}>
                          <div className="text-xs font-semibold text-white/85">{step.title}</div>
                          <div className="mt-1 w-fit border border-sky-200/20 px-2 py-0.5 text-[11px] text-sky-100/70">{step.state}</div>
                          <div className="mt-2 text-xs leading-5 text-white/55">{step.detail}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {item.reviewLinks.length ? (
                    <div className="mt-3 border border-emerald-300/20 bg-emerald-950/20 p-3">
                      <div className="text-xs font-semibold text-emerald-100">客户试用出口</div>
                      <p className="mt-1 text-xs leading-5 text-emerald-100/70">
                        把下面链接发给客户或朋友；当前会进入 {selectedVariant.label}，客户只需要预览、反馈或批准。
                      </p>
                      <div className="mt-2 space-y-1">
                      {item.reviewLinks.map(link => (
                        <a className="block truncate text-xs text-emerald-200 underline-offset-4 hover:underline" href={reviewUrlWithVariant(`/review/${link.token}`, selectedVariantId)} key={link.token}>
                          审核：{link.assetTitle} / {link.status} / {reviewUrlWithVariant(`/review/${link.token}`, selectedVariantId)}
                        </a>
                      ))}
                      </div>
                    </div>
                  ) : null}
                  {item.blockers.length ? (
                    <div className="mt-3 space-y-1">
                      {item.blockers.map(blocker => <div className="text-xs text-amber-200" key={blocker}>阻塞：{queueText(blocker)}</div>)}
                    </div>
                  ) : null}
                  {item.nextActions.length ? (
                    <div className="mt-3 space-y-1">
                      {item.nextActions.map(action => <div className="text-xs text-white/70" key={action}>下一步：{queueText(action)}</div>)}
                    </div>
                  ) : <div className="mt-3 text-xs text-emerald-200">已进入可回流复盘状态。</div>}
                  {item.runbookActions.length ? (
                    <div className="mt-3 border-t border-white/10 pt-3">
                      <div className="text-xs font-semibold text-white/70">运营动作包</div>
                      <div className="mt-2 space-y-1">
                        {item.runbookActions.map(action => (
                          <div className="text-xs text-white/55" key={action.id}>
                            {action.label} · 交接方式 {action.method} · 交接位置 {action.endpoint}
                            <div className="mt-1 truncate text-white/35">请求内容：{readablePayload(action.payload)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </article>
              )) : (
                <div className="border border-white/10 px-4 py-8 text-sm text-white/55">
                  当前项目还没有视频生产任务。创建任务后，系统会自动生成生产交接资产、分发计划和执行记录。
                </div>
              )}
            </div>
          </div>
        </section>
          </>
        )}
      </section>
    </main>
  );
}

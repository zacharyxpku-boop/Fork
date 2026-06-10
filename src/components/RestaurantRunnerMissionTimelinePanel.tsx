'use client';

import type { RestaurantRunnerMissionTimeline } from '@/lib/restaurant-runner-mission-timeline';

const fallbackTimeline = [
  { id: 'launch-decision', status: 'blocked', title: 'Launch decision', owner: 'ops', evidence: ['runtime health', 'merchant grant'], nextAction: 'Resolve launch gates first.' },
  { id: 'open_public_page', status: 'waiting', title: 'open_public_page', owner: 'provider', evidence: ['opened url'], nextAction: 'Run after gateway is ready.' },
  { id: 'signed-receipt-closeout', status: 'blocked', title: 'Signed receipt closeout', owner: 'store-manager', evidence: ['signed external-receipt'], nextAction: 'Wait for accepted proof.' },
];

export function RestaurantRunnerMissionTimelinePanel({ timeline }: { timeline?: RestaurantRunnerMissionTimeline }) {
  const items = timeline?.timeline || fallbackTimeline;

  return (
    <div className="mt-3 border border-amber-200/15 bg-amber-200/[0.035] p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/65">执行任务时间线</div>
          <p className="mt-1 text-xs font-black text-white">Claw-style execution现场: launch decision, runner steps, blockers and signed receipt closeout.</p>
          <p className="mt-1 text-[11px] leading-4 text-amber-100/55">任务编号: {timeline?.missionId || 'waiting-for-launch'} / 结论(内部值): {timeline?.verdict || 'blocked-needs-owner'}</p>
        </div>
        <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">回执前保持打开</div>
          <div className="mt-1 text-xs font-black text-white">{timeline?.mission.runMustStayOpenUntilReceipt ? 'yes' : 'blocked'}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-6">
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">条目</div>
          <div className="mt-1 text-xs font-black text-amber-100/75">{timeline?.summary.timelineItems ?? items.length}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">进行中</div>
          <div className="mt-1 text-xs font-black text-amber-100/75">{timeline?.summary.liveEvents ?? 0}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">已计划</div>
          <div className="mt-1 text-xs font-black text-white">{timeline?.summary.plannedSteps ?? 0}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">受阻</div>
          <div className="mt-1 text-xs font-black text-rose-100/75">{timeline?.summary.blockedItems ?? 1}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">停滞</div>
          <div className="mt-1 text-xs font-black text-sky-100/75">{timeline?.summary.staleRuns ?? 0}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">宣称</div>
          <div className="mt-1 text-xs font-black text-white">{timeline?.summary.canClaimExternalAutomation ? 'ready' : 'blocked'}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 lg:grid-cols-4">
        {items.slice(0, 8).map((item, index) => (
          <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-white">{index + 1}. {item.title}</span>
              <span className={item.status === 'done' ? 'text-[10px] text-lime-100/70' : item.status === 'running' ? 'text-[10px] text-emerald-100/70' : item.status === 'waiting' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{item.status}</span>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-amber-100/55">负责人: {item.owner}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/45">{item.evidence.slice(0, 3).join(' / ') || 'missing evidence'}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/55">{item.nextAction}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-amber-100/55">
        queue: {(timeline?.operatorQueue || []).map(item => `${item.priority}:${item.reason}`).slice(0, 3).join(' / ') || 'no live runner queue yet'} / target {timeline?.mission.providerTarget || 'openclaw'}
      </p>
    </div>
  );
}

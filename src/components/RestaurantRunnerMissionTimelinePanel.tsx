'use client';

import type { RestaurantRunnerMissionTimeline } from '@/lib/restaurant-runner-mission-timeline';

const fallbackTimeline = [
  { id: 'launch-decision', status: 'blocked', title: '启动判断', owner: 'ops', evidence: ['通道健康', '店长授权'], nextAction: '先解决启动条件。' },
  { id: 'open_public_page', status: 'waiting', title: '打开公开页面', owner: 'provider', evidence: ['待回填公开链接'], nextAction: '试跑交接条件补齐并复核后再执行。' },
  { id: 'signed-receipt-closeout', status: 'blocked', title: '签名回执收尾', owner: 'store-manager', evidence: ['签名回执待复核'], nextAction: '等待待复核凭证。' },
];

const panelStatusLabel: Record<string, string> = {
  blocked: '待补资料',
  'blocked-needs-owner': '待负责人确认',
  done: '待复核',
  running: '进行中',
  waiting: '等待中',
};

const panelOwnerLabel: Record<string, string> = {
  ops: '运营',
  provider: '试跑通道',
  'store-manager': '店长',
};

const panelSchemaLabel: Record<string, string> = {
  'external-receipt': '签名回执',
  'missing evidence': '待补凭证',
  open_public_page: '打开公开页面',
};

const formatPanelStatus = (value: string) => panelStatusLabel[value] || value;
const formatPanelOwner = (value: string) => panelOwnerLabel[value] || value;
const formatPanelSchema = (value: string) => panelSchemaLabel[value] || value;
const formatPanelSchemaList = (values: string[] | undefined, emptyLabel = '待补凭证') =>
  values?.length ? values.map(formatPanelSchema).join(' / ') : emptyLabel;

export function RestaurantRunnerMissionTimelinePanel({ timeline }: { timeline?: RestaurantRunnerMissionTimeline }) {
  const items = timeline?.timeline || fallbackTimeline;

  return (
    <div className="mt-3 border border-amber-200/15 bg-amber-200/[0.035] p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/65">执行任务时间线</div>
          <p className="mt-1 text-xs font-black text-white">执行现场: 启动判断、执行步骤、阻断项和签名回执收尾。</p>
          <p className="mt-1 text-[11px] leading-4 text-amber-100/55">任务状态: {timeline?.missionId ? '已生成' : '待启动'} / 结论: {formatPanelStatus(timeline?.verdict || 'blocked-needs-owner')}</p>
        </div>
        <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">回执前保持打开</div>
          <div className="mt-1 text-xs font-black text-white">{timeline?.mission.runMustStayOpenUntilReceipt ? '等回执' : '待补资料'}</div>
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
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待复核计划</div>
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
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">交接复核</div>
          <div className="mt-1 text-xs font-black text-white">{timeline?.summary.canClaimExternalAutomation ? '待复核' : '受阻'}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 lg:grid-cols-4">
        {items.slice(0, 8).map((item, index) => (
          <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-white">{index + 1}. {item.title}</span>
              <span className={item.status === 'done' ? 'text-[10px] text-lime-100/70' : item.status === 'running' ? 'text-[10px] text-emerald-100/70' : item.status === 'waiting' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatPanelStatus(item.status)}</span>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-amber-100/55">负责人: {formatPanelOwner(item.owner)}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/45">{formatPanelSchemaList(item.evidence.slice(0, 3))}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/55">{item.nextAction}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-amber-100/55">
        队列: {(timeline?.operatorQueue || []).map(item => `${formatPanelStatus(item.priority)}:${item.reason}`).slice(0, 3).join(' / ') || '暂无试跑交接队列'} / 目标通道 试跑通道
      </p>
    </div>
  );
}

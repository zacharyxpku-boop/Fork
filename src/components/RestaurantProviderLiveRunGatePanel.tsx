'use client';

import type { RestaurantProviderLiveRunGate } from '@/lib/restaurant-provider-live-run-gate';
import type { RestaurantProviderLiveRunLaunchAttempt } from '@/lib/restaurant-provider-live-run-launch-attempt';

const fallbackChecks = [
  { id: 'runtime-health', status: 'blocked', owner: 'runtime-admin', evidence: ['通道地址/账号'], nextAction: '先把试跑通道健康检查配通。' },
  { id: 'browser-gateway', status: 'blocked', owner: 'provider', evidence: ['隔离试跑环境'], nextAction: '准备受监督的隔离试跑交接。' },
  { id: 'provider-package', status: 'blocked', owner: 'ops', evidence: ['脱敏任务包'], nextAction: '选一个脱敏任务包。' },
  { id: 'merchant-auth', status: 'blocked', owner: 'merchant', evidence: ['店长授权范围'], nextAction: '先收店长授权。' },
  { id: 'signed-callback', status: 'blocked', owner: 'runtime-admin', evidence: ['签名回执规则'], nextAction: '补齐回执配置。' },
  { id: 'claim-boundary', status: 'blocked', owner: 'ops', evidence: ['canClaimExternalAutomation:false'], nextAction: '资料不齐先保持待补。' },
];

const panelStatusLabel: Record<string, string> = {
  accepted: '待复核',
  blocked: '待补资料',
  'blocked-before-launch': '启动前待补资料',
  'blocked-provider-setup': '待补账号配置',
  none: '待补资料',
  ready: '可复核',
  simulator: '模拟试跑',
  waiting: '等待中',
};

const panelOwnerLabel: Record<string, string> = {
  merchant: '店长',
  ops: '运营',
  provider: '试跑通道',
  'runtime-admin': '技术复核',
};

const panelSchemaLabel: Record<string, string> = {
  'external-receipt': '签名回执',
  'x-restaurant-agent-signature': '签名回执规则',
  'canClaimExternalAutomation:false': '待补资料，不承诺交接待复核',
};

const panelCheckLabel: Record<string, string> = {
  'runtime-health': '试跑通道健康',
  'browser-gateway': '隔离试跑交接',
  'provider-package': '脱敏任务包',
  'merchant-auth': '店长授权',
  'data-contract': '经营数据规则',
  'signed-callback': '签名回执',
  'receipt-closeout': '回执收尾',
  'claim-boundary': '承诺边界',
};

const formatPanelStatus = (value: string) => panelStatusLabel[value] || value;
const formatPanelOwner = (value: string) => panelOwnerLabel[value] || value;
const formatPanelSchema = (value: string) => panelSchemaLabel[value] || value;
const formatPanelCheck = (value: string) => panelCheckLabel[value] || value;
const formatPanelGate = (value: boolean | undefined, readyLabel = '资料待复核', blockedLabel = '待补资料') =>
  value ? readyLabel : blockedLabel;
const formatPanelSchemaList = (values: string[] | undefined, emptyLabel = '无') =>
  values?.length ? values.map(formatPanelSchema).join(' / ') : emptyLabel;

export function RestaurantProviderLiveRunGatePanel({ liveRunGate, launchAttempt }: { liveRunGate?: RestaurantProviderLiveRunGate; launchAttempt?: RestaurantProviderLiveRunLaunchAttempt }) {
  const checks = liveRunGate?.launchChecklist || fallbackChecks;

  return (
    <div className="mt-3 border border-cyan-200/15 bg-cyan-200/[0.035] p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/65">试跑交接闸门</div>
          <p className="mt-1 text-xs font-black text-white">试跑交接或受监督浏览器交接前的最终放行判断。</p>
          <p className="mt-1 text-[11px] leading-4 text-cyan-100/55">结论: {formatPanelStatus(liveRunGate?.verdict || 'blocked-provider-setup')} / 目标通道: 试跑通道</p>
        </div>
        <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">试跑交接</div>
          <div className="mt-1 text-xs font-black text-white">{formatPanelGate(liveRunGate?.summary.canStartRealProviderNow)}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-6">
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">健康</div>
          <div className="mt-1 text-xs font-black text-cyan-100/75">{liveRunGate ? `${liveRunGate.summary.healthReady}/${liveRunGate.summary.healthItems}` : '0/6'}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">评分</div>
          <div className="mt-1 text-xs font-black text-cyan-100/75">{liveRunGate?.summary.readinessScore ?? 0}%</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">浏览器</div>
          <div className="mt-1 text-xs font-black text-white">{formatPanelGate(liveRunGate?.summary.browserExecutable, '环境待复核')}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">任务包</div>
          <div className="mt-1 text-xs font-black text-white">{formatPanelGate(liveRunGate?.summary.packageReady, '资料待复核')}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">回执</div>
          <div className="mt-1 text-xs font-black text-white">{liveRunGate?.summary.receiptAccepted ? '待复核' : liveRunGate?.summary.receiptWaiting ? '等待中' : '待补资料'}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">边界</div>
          <div className="mt-1 text-xs font-black text-white">{formatPanelGate(liveRunGate?.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 lg:grid-cols-4">
        {checks.map(item => (
          <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-white">{formatPanelCheck(item.id)}</span>
              <span className={item.status === 'accepted' ? 'text-[10px] text-lime-100/70' : item.status === 'ready' ? 'text-[10px] text-emerald-100/70' : item.status === 'waiting' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatPanelStatus(item.status)}</span>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-cyan-100/55">负责人: {formatPanelOwner(item.owner)}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/45">{formatPanelSchemaList(item.evidence.slice(0, 3), '待补凭证')}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/55">{item.nextAction}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-cyan-100/55">
        第一步: {formatPanelStatus(liveRunGate?.firstLiveAction.mode || 'simulator')} / 服务端试跑通道配置项 / 回执 {formatPanelSchema(liveRunGate?.selectedRun.callbackAction || 'external-receipt')} / {formatPanelSchema(liveRunGate?.selectedRun.callbackHeader || 'x-restaurant-agent-signature')}
      </p>
      <div className="mt-2 border border-white/10 bg-stone-950/45 p-2">
        <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">启动尝试</div>
            <p className="mt-1 text-[11px] leading-4 text-white/60">{launchAttempt?.operatorDecision.primaryAction || '尝试试跑交接前，先解决第一个卡住的启动条件。'}</p>
          </div>
          <div className="text-left lg:text-right">
            <div className="text-xs font-black text-white">{formatPanelStatus(launchAttempt?.verdict || 'blocked-before-launch')}</div>
            <div className="mt-1 text-[10px] text-cyan-100/55">{launchAttempt?.operatorDecision.blockedBy || '暂无进行中的启动'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

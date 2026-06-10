'use client';

import type { RestaurantProviderLiveRunGate } from '@/lib/restaurant-provider-live-run-gate';
import type { RestaurantProviderLiveRunLaunchAttempt } from '@/lib/restaurant-provider-live-run-launch-attempt';

const fallbackChecks = [
  { id: 'runtime-health', status: 'blocked', owner: 'runtime-admin', evidence: ['通道地址/账号'], nextAction: '先把外部通道健康检查配通。' },
  { id: 'browser-gateway', status: 'blocked', owner: 'provider', evidence: ['隔离浏览器环境'], nextAction: '准备受监督的浏览器网关。' },
  { id: 'provider-package', status: 'blocked', owner: 'ops', evidence: ['脱敏任务包'], nextAction: '选一个脱敏任务包。' },
  { id: 'merchant-auth', status: 'blocked', owner: 'merchant', evidence: ['店长授权范围'], nextAction: '先收店长授权。' },
  { id: 'signed-callback', status: 'blocked', owner: 'runtime-admin', evidence: ['x-restaurant-agent-signature'], nextAction: '配置回执密钥。' },
  { id: 'claim-boundary', status: 'blocked', owner: 'ops', evidence: ['canClaimExternalAutomation:false'], nextAction: '不宣称已实现自动代办。' },
];

export function RestaurantProviderLiveRunGatePanel({ liveRunGate, launchAttempt }: { liveRunGate?: RestaurantProviderLiveRunGate; launchAttempt?: RestaurantProviderLiveRunLaunchAttempt }) {
  const checks = liveRunGate?.launchChecklist || fallbackChecks;

  return (
    <div className="mt-3 border border-cyan-200/15 bg-cyan-200/[0.035] p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/65">真实执行闸门</div>
          <p className="mt-1 text-xs font-black text-white">真实外部执行或受监督浏览器执行前的最终放行判断。</p>
          <p className="mt-1 text-[11px] leading-4 text-cyan-100/55">结论(内部值): {liveRunGate?.verdict || 'blocked-provider-setup'} / 目标通道: {liveRunGate?.selectedRun.providerTarget || 'openclaw'}</p>
        </div>
        <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">真实执行</div>
          <div className="mt-1 text-xs font-black text-white">{liveRunGate?.summary.canStartRealProviderNow ? '就绪' : '受阻'}</div>
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
          <div className="mt-1 text-xs font-black text-white">{liveRunGate?.summary.browserExecutable ? '就绪' : '受阻'}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">任务包</div>
          <div className="mt-1 text-xs font-black text-white">{liveRunGate?.summary.packageReady ? '就绪' : '受阻'}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">回执</div>
          <div className="mt-1 text-xs font-black text-white">{liveRunGate?.summary.receiptAccepted ? 'accepted' : liveRunGate?.summary.receiptWaiting ? 'waiting' : 'none'}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">宣称</div>
          <div className="mt-1 text-xs font-black text-white">{liveRunGate?.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 lg:grid-cols-4">
        {checks.map(item => (
          <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-white">{item.id}</span>
              <span className={item.status === 'accepted' ? 'text-[10px] text-lime-100/70' : item.status === 'ready' ? 'text-[10px] text-emerald-100/70' : item.status === 'waiting' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{item.status}</span>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-cyan-100/55">负责人: {item.owner}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/45">{item.evidence.slice(0, 3).join(' / ') || 'missing evidence'}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/55">{item.nextAction}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-cyan-100/55">
        第一步: {(liveRunGate?.firstLiveAction.mode || 'simulator')} / {liveRunGate?.firstLiveAction.method || 'POST'} {liveRunGate?.firstLiveAction.endpoint || '外部通道或浏览器网关'} / 回执 {liveRunGate?.selectedRun.callbackAction || 'external-receipt'} 带签名头 {liveRunGate?.selectedRun.callbackHeader || 'x-restaurant-agent-signature'}
      </p>
      <div className="mt-2 border border-white/10 bg-stone-950/45 p-2">
        <div className="flex flex-col gap-1 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">启动尝试</div>
            <p className="mt-1 text-[11px] leading-4 text-white/60">{launchAttempt?.operatorDecision.primaryAction || '尝试真实执行前，先解决第一个卡住的启动条件。'}</p>
          </div>
          <div className="text-left lg:text-right">
            <div className="text-xs font-black text-white">{launchAttempt?.verdict || 'blocked-before-launch'}</div>
            <div className="mt-1 text-[10px] text-cyan-100/55">{launchAttempt?.operatorDecision.blockedBy || '暂无进行中的启动'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

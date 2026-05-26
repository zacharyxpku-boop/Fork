'use client';

import type { RestaurantProviderLiveRunGate } from '@/lib/restaurant-provider-live-run-gate';

const fallbackChecks = [
  { id: 'runtime-health', status: 'blocked', owner: 'runtime-admin', evidence: ['runtime URL/API key'], nextAction: 'Configure Provider health.' },
  { id: 'browser-gateway', status: 'blocked', owner: 'provider', evidence: ['isolated browser profile'], nextAction: 'Prepare supervised browser gateway.' },
  { id: 'provider-package', status: 'blocked', owner: 'ops', evidence: ['safe package'], nextAction: 'Select one safe package.' },
  { id: 'merchant-auth', status: 'blocked', owner: 'merchant', evidence: ['merchant scope'], nextAction: 'Collect merchant authorization.' },
  { id: 'signed-callback', status: 'blocked', owner: 'runtime-admin', evidence: ['x-restaurant-agent-signature'], nextAction: 'Configure callback secret.' },
  { id: 'claim-boundary', status: 'blocked', owner: 'ops', evidence: ['canClaimExternalAutomation:false'], nextAction: 'Do not claim production automation.' },
];

export function RestaurantProviderLiveRunGatePanel({ liveRunGate }: { liveRunGate?: RestaurantProviderLiveRunGate }) {
  const checks = liveRunGate?.launchChecklist || fallbackChecks;

  return (
    <div className="mt-3 border border-cyan-200/15 bg-cyan-200/[0.035] p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/65">live run gate</div>
          <p className="mt-1 text-xs font-black text-white">Final go/no-go for real Provider or supervised browser execution.</p>
          <p className="mt-1 text-[11px] leading-4 text-cyan-100/55">verdict: {liveRunGate?.verdict || 'blocked-provider-setup'} / target: {liveRunGate?.selectedRun.providerTarget || 'openclaw'}</p>
        </div>
        <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">real run</div>
          <div className="mt-1 text-xs font-black text-white">{liveRunGate?.summary.canStartRealProviderNow ? 'ready' : 'blocked'}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-6">
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">health</div>
          <div className="mt-1 text-xs font-black text-cyan-100/75">{liveRunGate ? `${liveRunGate.summary.healthReady}/${liveRunGate.summary.healthItems}` : '0/6'}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">score</div>
          <div className="mt-1 text-xs font-black text-cyan-100/75">{liveRunGate?.summary.readinessScore ?? 0}%</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">browser</div>
          <div className="mt-1 text-xs font-black text-white">{liveRunGate?.summary.browserExecutable ? 'ready' : 'blocked'}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">package</div>
          <div className="mt-1 text-xs font-black text-white">{liveRunGate?.summary.packageReady ? 'ready' : 'blocked'}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">receipt</div>
          <div className="mt-1 text-xs font-black text-white">{liveRunGate?.summary.receiptAccepted ? 'accepted' : liveRunGate?.summary.receiptWaiting ? 'waiting' : 'none'}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">claim</div>
          <div className="mt-1 text-xs font-black text-white">{liveRunGate?.summary.canClaimExternalAutomation ? 'ready' : 'blocked'}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 lg:grid-cols-4">
        {checks.map(item => (
          <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-white">{item.id}</span>
              <span className={item.status === 'accepted' ? 'text-[10px] text-lime-100/70' : item.status === 'ready' ? 'text-[10px] text-emerald-100/70' : item.status === 'waiting' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{item.status}</span>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-cyan-100/55">owner: {item.owner}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/45">{item.evidence.slice(0, 3).join(' / ') || 'missing evidence'}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/55">{item.nextAction}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-cyan-100/55">
        first action: {liveRunGate?.firstLiveAction.mode || 'simulator'} / {liveRunGate?.firstLiveAction.method || 'POST'} {liveRunGate?.firstLiveAction.endpoint || 'provider runtime or browser gateway'} / callback {liveRunGate?.selectedRun.callbackAction || 'external-receipt'} with {liveRunGate?.selectedRun.callbackHeader || 'x-restaurant-agent-signature'}
      </p>
    </div>
  );
}

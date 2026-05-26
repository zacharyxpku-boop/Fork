'use client';

import type { RestaurantProviderReceiptAcceptanceConsole } from '@/lib/restaurant-provider-receipt-acceptance-console';

const fallbackChecks = [
  { id: 'signature', status: 'blocked', owner: 'runtime-admin', evidence: ['x-restaurant-agent-signature'], nextAction: 'Validate callback signature.' },
  { id: 'run-id', status: 'blocked', owner: 'provider', evidence: ['eventId', 'externalRunId'], nextAction: 'Match run id to the packet.' },
  { id: 'public-proof', status: 'waiting', owner: 'ops', evidence: ['public proof URL', 'screenshot id'], nextAction: 'Collect verifiable proof.' },
  { id: 'business-signal', status: 'waiting', owner: 'data-ops', evidence: ['aggregate signal'], nextAction: 'Extract only accepted aggregate signals.' },
  { id: 'memory-write', status: 'blocked', owner: 'store-manager', evidence: ['accepted proof only'], nextAction: 'Wait before writing memory.' },
  { id: 'claim-boundary', status: 'blocked', owner: 'ops', evidence: ['canClaimExternalAutomation:false'], nextAction: 'No production claim yet.' },
];

export function RestaurantProviderReceiptAcceptancePanel({ consoleData }: { consoleData?: RestaurantProviderReceiptAcceptanceConsole }) {
  const checks = consoleData?.validationChecks || fallbackChecks;

  return (
    <div className="mt-3 border border-emerald-200/15 bg-emerald-200/[0.035] p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/65">receipt acceptance console</div>
          <p className="mt-1 text-xs font-black text-white">Signed callback validation, proof acceptance, business-signal extraction and next-run memory gate.</p>
          <p className="mt-1 text-[11px] leading-4 text-emerald-100/55">run: {consoleData?.run.runId || 'first-provider-run'} / verdict: {consoleData?.verdict || 'blocked-before-dispatch'}</p>
        </div>
        <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">train next</div>
          <div className="mt-1 text-xs font-black text-white">{consoleData?.summary.canTrainNextRun ? 'ready' : 'blocked'}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-6">
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">checks</div>
          <div className="mt-1 text-xs font-black text-emerald-100/75">{consoleData?.summary.checks ?? 7}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">ready</div>
          <div className="mt-1 text-xs font-black text-emerald-100/75">{consoleData?.summary.ready ?? 0}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">waiting</div>
          <div className="mt-1 text-xs font-black text-sky-100/75">{consoleData?.summary.waiting ?? 2}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">blocked</div>
          <div className="mt-1 text-xs font-black text-rose-100/75">{consoleData?.summary.blocked ?? 4}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">accepted</div>
          <div className="mt-1 text-xs font-black text-lime-100/75">{consoleData?.summary.acceptedReceipts ?? 0}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">claim</div>
          <div className="mt-1 text-xs font-black text-white">{consoleData?.summary.canClaimExternalAutomation ? 'ready' : 'blocked'}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 lg:grid-cols-7">
        {checks.map(item => (
          <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-white">{item.id}</span>
              <span className={item.status === 'accepted' ? 'text-[10px] text-lime-100/70' : item.status === 'ready' ? 'text-[10px] text-emerald-100/70' : item.status === 'waiting' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{item.status}</span>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-emerald-100/55">owner: {item.owner}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/45">{item.evidence.slice(0, 3).join(' / ')}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/55">{item.nextAction}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-emerald-100/55">
        callback: {consoleData?.callbackContract.action || 'external-receipt'} with {consoleData?.callbackContract.requiredHeader || 'x-restaurant-agent-signature'} / memory {consoleData?.closeoutTraining.memoryWriteAllowed ? 'allowed' : 'blocked'} / forbidden {(consoleData?.closeoutTraining.forbiddenWrites || ['cookies', 'private-message text', 'raw POS rows']).slice(0, 4).join(' / ')}
      </p>
    </div>
  );
}

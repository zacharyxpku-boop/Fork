'use client';

import type { RestaurantProviderRunPacket } from '@/lib/restaurant-provider-run-packet';

const fallbackChecklist = [
  { id: 'provider-response', status: 'blocked', owner: 'provider', evidence: ['HTTP 200/201/202', 'runId or taskId'], nextAction: 'Return stable run id.' },
  { id: 'signed-callback', status: 'blocked', owner: 'runtime-admin', evidence: ['external-receipt', 'signature'], nextAction: 'Validate callback signature.' },
  { id: 'public-proof', status: 'waiting', owner: 'ops', evidence: ['public proof URL', 'screenshot id'], nextAction: 'Accept public proof only.' },
  { id: 'memory-training', status: 'blocked', owner: 'store-manager', evidence: ['accepted proof only'], nextAction: 'Wait before memory write.' },
  { id: 'claim-boundary', status: 'blocked', owner: 'ops', evidence: ['canClaimExternalAutomation:false'], nextAction: 'No production claim yet.' },
];

export function RestaurantProviderRunPacketPanel({ providerRunPacket }: { providerRunPacket?: RestaurantProviderRunPacket }) {
  const checklist = providerRunPacket?.acceptanceChecklist || fallbackChecklist;

  return (
    <div className="mt-3 border border-blue-200/15 bg-blue-200/[0.035] p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-100/65">provider run packet</div>
          <p className="mt-1 text-xs font-black text-white">External handoff contract for one runtime run: POST shape, callback sample, acceptance checklist and forbidden fields.</p>
          <p className="mt-1 text-[11px] leading-4 text-blue-100/55">endpoint: {providerRunPacket?.request.endpoint || 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL + /tasks'} / verdict: {providerRunPacket?.verdict || 'blocked-missing-scope'}</p>
        </div>
        <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">real submit</div>
          <div className="mt-1 text-xs font-black text-white">{providerRunPacket?.summary.canSubmitRealProviderNow ? 'ready' : 'blocked'}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-6">
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">target</div>
          <div className="mt-1 text-xs font-black text-blue-100/75">{providerRunPacket?.summary.targetProvider || 'openclaw'}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">package</div>
          <div className="mt-1 text-xs font-black text-white">{providerRunPacket?.summary.packageSelected ? 'selected' : 'missing'}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">scope</div>
          <div className="mt-1 text-xs font-black text-white">{providerRunPacket?.summary.scopeSelected ? 'selected' : 'missing'}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">simulator</div>
          <div className="mt-1 text-xs font-black text-sky-100/75">{providerRunPacket?.summary.canSubmitSimulatorNow ? 'ready' : 'blocked'}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">callback</div>
          <div className="mt-1 text-xs font-black text-white">{providerRunPacket?.callbackReceiptExample.requiredHeader || 'x-restaurant-agent-signature'}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">claim</div>
          <div className="mt-1 text-xs font-black text-white">{providerRunPacket?.summary.canClaimExternalAutomation ? 'ready' : 'blocked'}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 lg:grid-cols-5">
        {checklist.map(item => (
          <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-white">{item.id}</span>
              <span className={item.status === 'ready' ? 'text-[10px] text-emerald-100/70' : item.status === 'waiting' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{item.status}</span>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-blue-100/55">owner: {item.owner}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/45">{item.evidence.slice(0, 3).join(' / ')}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/55">{item.nextAction}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-blue-100/55">
        body preview: {providerRunPacket?.request.bodyPreview.packageId || 'packageId'} / {providerRunPacket?.request.bodyPreview.capabilityId || 'auto-publish-proof'} / forbidden {(providerRunPacket?.request.forbiddenFields || ['cookies', 'private-message text', 'raw POS rows']).slice(0, 4).join(' / ')}
      </p>
    </div>
  );
}

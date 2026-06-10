'use client';

import type { RestaurantProviderForwardableSetupDossier } from '@/lib/restaurant-provider-forwardable-setup-dossier';

const fallbackPackets = [
  { id: 'runtime-provider', title: 'Runtime Provider Setup', sendTo: 'Provider engineer', asks: ['Configure runtime URL/API key and callback secret'], evidenceRequired: ['runtime health ready'], firstMessage: 'Configure one runtime target server-side.' },
  { id: 'merchant-owner', title: 'Merchant Authorization Setup', sendTo: 'Merchant owner', asks: ['Approve one platform scope'], evidenceRequired: ['scope and expiry'], firstMessage: 'Approve allowed actions and revocation owner.' },
  { id: 'data-owner', title: 'Operating Data Setup', sendTo: 'Data/POS owner', asks: ['Provide no-PII aggregate fields'], evidenceRequired: ['field dictionary'], firstMessage: 'Send aggregate data contract only.' },
  { id: 'ops-lead', title: 'Store Ops Launch Setup', sendTo: 'Store ops lead', asks: ['Review launch gate and closeout'], evidenceRequired: ['accepted receipt'], firstMessage: 'Keep run open until proof is accepted.' },
];

export function RestaurantProviderForwardableSetupDossierPanel({ dossier }: { dossier?: RestaurantProviderForwardableSetupDossier }) {
  const packets = dossier?.packets || fallbackPackets;

  return (
    <div className="mt-3 border border-violet-200/15 bg-violet-200/[0.035] p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/65">可转发配置档案</div>
          <p className="mt-1 text-xs font-black text-white">给外部对接工程师、店长、数据负责人和门店运营各一份资料包。</p>
          <p className="mt-1 text-[11px] leading-4 text-violet-100/55">约定(内部值): {dossier?.firstLiveRunContract.launchVerdict || 'blocked-before-launch'} / 回执签名头 {dossier?.firstLiveRunContract.callbackHeader || 'x-restaurant-agent-signature'}</p>
        </div>
        <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">真实外部</div>
          <div className="mt-1 text-xs font-black text-white">{dossier?.summary.canStartLiveProviderNow ? 'ready' : 'blocked'}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-6">
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">资料包</div>
          <div className="mt-1 text-xs font-black text-violet-100/75">{dossier?.summary.packets ?? packets.length}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">p0</div>
          <div className="mt-1 text-xs font-black text-violet-100/75">{dossier?.summary.p0Items ?? 0}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">配置项</div>
          <div className="mt-1 text-xs font-black text-white">{dossier?.summary.providerEnvKeys ?? 0}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">店长侧</div>
          <div className="mt-1 text-xs font-black text-white">{dossier?.summary.merchantSignoffs ?? 0}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">数据</div>
          <div className="mt-1 text-xs font-black text-white">{dossier?.summary.dataContracts ?? 0}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">宣称</div>
          <div className="mt-1 text-xs font-black text-white">{dossier?.summary.canClaimExternalAutomation ? 'ready' : 'blocked'}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 lg:grid-cols-4">
        {packets.map(item => (
          <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
            <div className="text-xs font-black text-white">{item.title}</div>
            <p className="mt-1 text-[11px] leading-4 text-violet-100/55">to: {item.sendTo}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/45">{item.asks.slice(0, 2).join(' / ')}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/55">{item.evidenceRequired.slice(0, 2).join(' / ')}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-violet-100/55">
        digest: {dossier?.exportDigest.markdown.split('\n')[0] || 'Forwardable Provider Setup Dossier'} / env values always {dossier?.envTemplate[0]?.value || '<server-side-only>'}
      </p>
    </div>
  );
}

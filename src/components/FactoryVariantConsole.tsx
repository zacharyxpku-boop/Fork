import Link from 'next/link';

import { FACTORY_UI_VARIANT_IDS, type FactoryUiVariantId } from '@/lib/factory-readiness-view';

export type FactoryVariantConsoleVariant = {
  label: string;
  audience: string;
};

export type FactoryVariantConsoleProps = {
  basePath: string;
  projectId: string;
  selectedVariantId: FactoryUiVariantId;
  variants: Record<FactoryUiVariantId, FactoryVariantConsoleVariant>;
  eyebrow: string;
  title: string;
  firstScreen: string;
  primaryAction: string;
  proofFocus: string;
  stopLine: string;
  evidenceCards: string[];
  nextAction: string;
  accent?: 'emerald' | 'amber' | 'sky' | 'cyan';
};

const ACCENT = {
  emerald: {
    eyebrow: 'text-emerald-200',
    active: 'border-emerald-300/60 bg-emerald-300/10 text-white',
    hover: 'hover:border-emerald-300/35',
    proof: 'text-emerald-100/85',
  },
  amber: {
    eyebrow: 'text-amber-200',
    active: 'border-amber-300/60 bg-amber-300/10 text-white',
    hover: 'hover:border-amber-300/35',
    proof: 'text-amber-100/85',
  },
  sky: {
    eyebrow: 'text-sky-200',
    active: 'border-sky-300/60 bg-sky-300/10 text-white',
    hover: 'hover:border-sky-300/35',
    proof: 'text-sky-100/85',
  },
  cyan: {
    eyebrow: 'text-cyan-200',
    active: 'border-cyan-300/60 bg-cyan-300/10 text-white',
    hover: 'hover:border-cyan-300/35',
    proof: 'text-cyan-100/85',
  },
};

export function FactoryVariantConsole({
  basePath,
  projectId,
  selectedVariantId,
  variants,
  eyebrow,
  title,
  firstScreen,
  primaryAction,
  proofFocus,
  stopLine,
  evidenceCards,
  nextAction,
  accent = 'emerald',
}: FactoryVariantConsoleProps) {
  const tone = ACCENT[accent];

  return (
    <section className="border border-white/10 bg-white/[0.035] p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className={`text-xs uppercase tracking-[0.22em] ${tone.eyebrow}`}>{eyebrow}</p>
          <h2 className="mt-2 text-xl font-semibold">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">{firstScreen}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-3 lg:w-[520px]">
          {FACTORY_UI_VARIANT_IDS.map(variantId => {
            const variant = variants[variantId];
            const href = `${basePath}?projectId=${encodeURIComponent(projectId || 'default-project')}&variant=${variantId}`;
            return (
              <Link
                aria-current={variantId === selectedVariantId ? 'page' : undefined}
                className={`border p-3 text-left transition ${
                  variantId === selectedVariantId
                    ? tone.active
                    : `border-white/10 bg-black/20 text-white/60 ${tone.hover} hover:bg-white/[0.05]`
                }`}
                href={href}
                key={variantId}
              >
                <span className="block text-sm font-semibold">{variant.label}</span>
                <span className="mt-1 block text-[11px] leading-4">{variant.audience}</span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_0.8fr]">
        <div className="border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/70">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">第一动作</div>
          <p className="mt-2">{primaryAction}</p>
        </div>
        <div className={`border border-white/10 bg-black/20 p-4 text-sm leading-6 ${tone.proof}`}>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">证据检查</div>
          <p className="mt-2">{proofFocus}</p>
        </div>
        <div className="border border-rose-300/20 bg-rose-950/20 p-4 text-sm leading-6 text-rose-100">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">停止线</div>
          <p className="mt-2">{stopLine}</p>
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        {evidenceCards.map(card => (
          <div className="border border-white/10 bg-black/20 p-3 text-xs leading-5 text-white/60" key={card}>{card}</div>
        ))}
        <div className="border border-amber-300/20 bg-amber-300/10 p-3 text-xs leading-5 text-amber-100">
          下一步：{nextAction}
        </div>
      </div>
    </section>
  );
}

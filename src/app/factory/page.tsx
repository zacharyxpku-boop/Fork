import type { Metadata } from 'next';
import Link from 'next/link';
import { FactoryFriendTrialExperience } from '@/components/FactoryFriendTrialExperience';
import { RestaurantAgentRuntimeClient } from '@/components/RestaurantAgentRuntimeClient';
import { RestaurantDecisionCopilotClient } from '@/components/RestaurantDecisionCopilotClient';
import { RestaurantOperatingLoopClient } from '@/components/RestaurantOperatingLoopClient';
import { RestaurantAdvancedAuditDisclosure } from '@/components/RestaurantAdvancedAuditDisclosure';
import { ListingFactoryConsole } from '@/components/marketing/ListingFactorySections';
import {
  buildFactoryMobileCapabilities,
  buildFactoryOperatingLayers,
  buildFactoryReadinessSlices,
  buildFactoryUiVariants,
  normalizeFactoryUiVariantId,
  orderFactoryUiVariants,
} from '@/lib/factory-readiness-view';
import { evaluateProductReadiness } from '@/lib/product-readiness';
import { buildReadinessInput } from '@/lib/readiness-input';
import { appendRestaurantTrialIntake, pickRestaurantTrialIntake, type RestaurantTrialSearchParams } from '@/lib/restaurant-trial-intake';

export const metadata: Metadata = {
  title: '餐饮门店增长工作台 | Wenai Restaurant Factory',
  description: '集中查看餐厅、菜品套餐、门店活动、本地内容、发布凭证和到店跟进状态。',
};

export default async function FactoryPage({
  searchParams,
}: {
  searchParams?: Promise<RestaurantTrialSearchParams>;
}) {
  const params = searchParams ? await searchParams : {};
  const intake = pickRestaurantTrialIntake(params);
  const withIntake = (href: string) => appendRestaurantTrialIntake(href, intake);
  const selectedVariantId = normalizeFactoryUiVariantId(params.variant);
  const readinessReport = evaluateProductReadiness(buildReadinessInput());
  const factoryOperatingLayers = buildFactoryOperatingLayers(readinessReport);
  const factoryUiVariants = orderFactoryUiVariants(buildFactoryUiVariants(readinessReport), selectedVariantId);
  const selectedVariant = factoryUiVariants[0];
  const factoryReadinessSlices = buildFactoryReadinessSlices(readinessReport);
  const mobileCapabilityStrips = buildFactoryMobileCapabilities(readinessReport);

  if (selectedVariantId === 'friend_trial') {
    const operatingLinks = [
      { label: '第 1 步', title: '选择今天主推的到店理由', href: '/factory/creative?variant=friend_trial', value: '先确认菜品和场景' },
      { label: '第 2 步', title: '补齐菜品图和活动边界', href: '/factory/create?variant=friend_trial', value: '避免素材和优惠不可用' },
      { label: '第 3 步', title: '生成本地内容草稿', href: '/factory/video?variant=friend_trial', value: '门店先审核' },
      { label: '第 4 步', title: '安排同城发布渠道', href: '/factory/cast?variant=friend_trial', value: '留下链接或截图' },
      { label: '第 5 步', title: '交给店长或社群跟进', href: '/factory/manage?variant=friend_trial', value: '记录负责人' },
    ];
    const usabilityGaps = [
      { gap: '原通用工厂入口太像概念展板', fix: '第一屏改成餐厅活动表单，客户直接填餐厅、菜品、客群、渠道和证据。', owner: '内部已解决' },
      { gap: '缺少餐饮真实经营输入', fix: '把预约、POS、库存、券核销、评价和社群反馈列成接入门槛。', owner: '外部数据必需' },
      { gap: '不能把内容生成说成经营自动化', fix: '所有自动化都带停止线：无凭证不说已发布，无授权不联系顾客。', owner: '内部护栏已解决' },
    ];
    const contentScaleAudit = [
      { label: '默认可操作区', value: '6 块', detail: '入口表单、步骤卡、差距提示、门店作战板、规模判断、高级入口' },
      { label: '高级审计区', value: '折叠', detail: 'Claw 对标、终局定义、接入门槛、Agent 和数据门禁' },
      { label: '当前判断', value: '先跑闭环', detail: '默认页不再加模块，后续只加到作战板或折叠审计里' },
    ];

    return (
      <FactoryFriendTrialExperience
        active="overview"
        title="从一家餐厅和一道主推菜开始，生成可审核的门店内容任务"
        subtitle="客户先录入餐厅、菜品/套餐、目标客群和渠道，系统给出菜品卖点、素材清单、本地内容、发布凭证和到店跟进的下一步。"
        metrics={[
          { label: '门店资料', value: '待确认', detail: '客户可编辑', tone: 'slate' },
          { label: '本地内容计划', value: '待生成', detail: '先审核后发布', tone: 'emerald' },
          { label: '到店跟进', value: '待分配', detail: '不虚构预约或券领取', tone: 'amber' },
        ]}
        actions={[
          { role: '餐饮客户', title: '先填门店活动', value: '确认餐厅、菜品/套餐、目标客群和渠道', href: '/factory?variant=friend_trial' },
          { role: '运营', title: '处理本地内容任务', value: '从菜品卖点、用餐场景和素材开始', href: '/factory/creative?variant=friend_trial' },
          { role: '店长/社群', title: '接收到店跟进事项', value: '只接真实预约、券领取、私信和客户确认', href: '/factory/manage?variant=friend_trial' },
        ]}
        intake={intake}
        nextHref="/factory/creative?variant=friend_trial"
        nextLabel="选择到店理由"
      >
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {operatingLinks.map(item => (
            <Link className="group rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-lg" href={withIntake(item.href)} key={item.href}>
              <div className="text-xs font-medium text-stone-500">{item.label}</div>
              <h2 className="mt-2 text-base font-semibold text-stone-950">{item.title}</h2>
              <p className="mt-4 rounded-xl bg-stone-50 px-3 py-2 text-sm font-medium text-stone-600">{item.value}</p>
            </Link>
          ))}
        </section>

        <section className="grid gap-3 lg:grid-cols-3">
          {usabilityGaps.map(item => (
            <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm" key={item.gap}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-sm font-black text-stone-950">{item.gap}</h2>
                <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-500">{item.owner}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-stone-600">{item.fix}</p>
            </article>
          ))}
        </section>

        <RestaurantDecisionCopilotClient />

        <RestaurantAgentRuntimeClient intake={intake} />

        <RestaurantOperatingLoopClient />

        <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-700">Content Scale Audit</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">内容规模先收住</h2>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-stone-600">
              当前工作台已经具备完整战略说明，但默认界面不能像说明书。餐饮客户先跑闭环，深度对标和外部依赖放到高级审计里。
            </p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {contentScaleAudit.map(item => (
              <article className="rounded-2xl border border-stone-200 bg-[#fbfaf7] p-4" key={item.label}>
                <div className="text-[11px] font-semibold text-stone-500">{item.label}</div>
                <div className="mt-2 text-xl font-black text-stone-950">{item.value}</div>
                <p className="mt-2 text-xs leading-5 text-stone-600">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <RestaurantAdvancedAuditDisclosure />
      </FactoryFriendTrialExperience>
    );
  }

  return (
    <main>
      <section className="border-b border-slate-200 bg-slate-950 px-6 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="text-[12px] font-black uppercase tracking-[0.22em] text-amber-200">Wenai 电商增长作战台</div>
          <div className="mt-3 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-3xl font-black leading-tight sm:text-5xl">
                从 SKU 上新到创意、视频、分发、审核和回流的一张工作台
              </h1>
              <p className="mt-4 max-w-3xl text-[14px] leading-7 text-white/70">
                这里是最终产品形态入口：筷子科技给出全链路工业化参照，Hookshot / Hookly 给出 hook 和 UGC 广告结构参照，Wenai 的目标是把它们收成可验收、可交接、可复盘的电商增长系统。
              </p>
            </div>
            <div className="rounded-md border border-amber-300/25 bg-amber-300/10 p-4 text-[13px] leading-6 text-amber-50">
              当前边界：内部闭环已可跑；真实 OAuth、自动发布、广告投放、视频 provider、平台数据同步和企业云资产接入前，不宣称平台级规模执行。
            </div>
          </div>

          <div className="mt-6 border-y border-white/10 py-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/45">UI Variant Workflow</div>
                <h2 className="mt-1 text-2xl font-black">同一套工厂，按对象切三种视角</h2>
              </div>
              <p className="max-w-xl text-[12px] leading-6 text-white/60">
                Variant 不是换颜色，而是决定用户先看到什么、能做什么、哪些能力必须被明确挡住。先把三种视角跑通，再继续加厚创意、视频、分发和管理页面。
              </p>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {factoryUiVariants.map(variant => (
                <Link
                  aria-current={variant.id === selectedVariantId ? 'page' : undefined}
                  href={`/factory?variant=${variant.id}`}
                  key={variant.id}
                  className={`rounded-md border p-4 transition hover:border-amber-300/40 hover:bg-white/[0.07] ${
                    variant.id === selectedVariantId
                      ? 'border-amber-300/55 bg-amber-300/10 shadow-[0_0_0_1px_rgba(252,211,77,0.18)]'
                      : 'border-white/10 bg-white/[0.045]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[15px] font-black text-white">{variant.label}</div>
                    <div className="rounded-sm border border-amber-200/30 px-2 py-1 text-[10px] font-black uppercase text-amber-100">{variant.id}</div>
                  </div>
                  <p className="mt-2 text-[12px] leading-5 text-amber-100/80">{variant.audience}</p>
                  <div className="mt-3 space-y-2 text-[12px] leading-5 text-white/70">
                    <p><span className="font-black text-white">首屏重点：</span>{variant.focus}</p>
                    <p><span className="font-black text-white">第一动作：</span>{variant.firstAction}</p>
                    <p><span className="font-black text-rose-100">停止线：</span>{variant.stopLine}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-4 rounded-md border border-amber-300/30 bg-slate-900/70 p-4">
              <div className="text-[11px] font-black uppercase tracking-[0.22em] text-amber-200">Active Variant</div>
              <div className="mt-2 grid gap-3 md:grid-cols-[0.8fr_1fr_1fr]">
                <div>
                  <div className="text-xl font-black text-white">{selectedVariant.label}</div>
                  <p className="mt-2 text-[12px] leading-5 text-white/65">{selectedVariant.audience}</p>
                </div>
                <p className="text-[12px] leading-6 text-white/75">{selectedVariant.focus}</p>
                <p className="text-[12px] leading-6 text-amber-100/85">{selectedVariant.firstAction}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {factoryReadinessSlices.map(slice => (
              <div key={slice.title} className="rounded-md border border-white/10 bg-slate-900/80 p-4">
                <div className="text-[13px] font-black text-amber-100">{slice.title}</div>
                <ul className="mt-3 space-y-2 text-[12px] leading-5 text-white/65">
                  {slice.items.map(item => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1 w-1 flex-none rounded-full bg-amber-200" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-md border border-white/10 bg-white/[0.045] p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-[11px] font-black uppercase tracking-[0.22em] text-white/45">Mobile Capability Strip</div>
                <h2 className="mt-1 text-2xl font-black">移动端介绍要讲清楚的六个能力</h2>
              </div>
              <p className="max-w-xl text-[12px] leading-6 text-white/60">
                这些是对外最容易被理解的入口：能展示内部闭环，但每张卡都必须带外部门禁，避免把竞品级规模能力误写成当前已商用。
              </p>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {mobileCapabilityStrips.map(item => (
                <article className="rounded-md border border-white/10 bg-slate-900/80 p-4" key={item.title}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-[15px] font-black text-white">{item.title}</div>
                    <span className="rounded-sm border border-amber-200/30 px-2 py-1 text-[10px] font-black uppercase text-amber-100">{item.layer}</span>
                  </div>
                  <p className="mt-3 text-[12px] leading-5 text-emerald-100/85">内部可用：{item.internal}</p>
                  <p className="mt-2 text-[12px] leading-5 text-amber-100/85">外部门禁：{item.external}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {factoryOperatingLayers.map(layer => (
              <Link
                className="rounded-md border border-white/10 bg-white/[0.045] p-4 transition hover:border-amber-300/40 hover:bg-white/[0.07]"
                href={`${layer.href}?variant=${selectedVariantId}`}
                key={layer.name}
              >
                <div className="text-[11px] font-black text-amber-200">{layer.name}</div>
                <div className="mt-1 text-[15px] font-black">{layer.title}</div>
                <p className="mt-2 text-[12px] leading-5 text-white/70">{layer.body}</p>
                <p className="mt-3 text-[11px] leading-5 text-emerald-100/80">{layer.state}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <ListingFactoryConsole />
    </main>
  );
}

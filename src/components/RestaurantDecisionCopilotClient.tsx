'use client';

import { useMemo, useState } from 'react';

import { buildRestaurantDecision, type RestaurantDecisionInput } from '@/lib/restaurant-decision-engine';

const DEFAULT_INPUT: RestaurantDecisionInput = {
  restaurant: '南城川味小馆',
  offer: '双人酸菜鱼套餐',
  price: 168,
  foodCostRate: 0.36,
  availablePortions: 42,
  targetRevenue: 9800,
  yesterdayRevenue: 7200,
  couponClaims: 38,
  reservations: 11,
  privateMessages: 17,
  redemptions: 14,
  averageTicket: 156,
  serviceWindow: '今晚 18:00-20:30',
  owner: '店长 / 社群负责人',
};

type NumericField = keyof Pick<RestaurantDecisionInput,
  'price' | 'foodCostRate' | 'availablePortions' | 'targetRevenue' | 'yesterdayRevenue' | 'couponClaims' | 'reservations' | 'privateMessages' | 'redemptions' | 'averageTicket'
>;

export function RestaurantDecisionCopilotClient() {
  const [input, setInput] = useState<RestaurantDecisionInput>(DEFAULT_INPUT);
  const decision = useMemo(() => buildRestaurantDecision(input), [input]);

  const setText = (field: keyof RestaurantDecisionInput, value: string) => {
    setInput(prev => ({ ...prev, [field]: value }));
  };

  const setNumber = (field: NumericField, value: string) => {
    const parsed = Number(value);
    setInput(prev => ({ ...prev, [field]: Number.isFinite(parsed) ? parsed : 0 }));
  };

  return (
    <section className="overflow-hidden rounded-lg border border-emerald-200 bg-white shadow-sm">
      <div className="grid gap-4 border-b border-emerald-100 bg-emerald-950 p-5 text-white lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">餐厅决策助手</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight">今晚到底推什么，先算出来</h2>
        </div>
        <p className="text-sm leading-6 text-emerald-50/80">
          这里不是公开样例和账本，而是老板能直接判断的经营试算：输入价格、成本、库存、券领取、预约、私信和核销，系统马上给出主推决策、渠道内容、负责人动作和不能自行操作的原因。
        </p>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[0.86fr_1.14fr]">
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <TextInput label="门店" value={input.restaurant} onChange={value => setText('restaurant', value)} />
            <TextInput label="负责人" value={input.owner} onChange={value => setText('owner', value)} />
            <TextInput label="主推套餐" value={input.offer} onChange={value => setText('offer', value)} />
            <TextInput label="服务时段" value={input.serviceWindow} onChange={value => setText('serviceWindow', value)} />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <NumberInput label="套餐价" suffix="元" value={input.price} onChange={value => setNumber('price', value)} />
            <NumberInput label="食材成本率" suffix="0.36=36%" value={input.foodCostRate} step="0.01" onChange={value => setNumber('foodCostRate', value)} />
            <NumberInput label="今日可售份数" suffix="份" value={input.availablePortions} onChange={value => setNumber('availablePortions', value)} />
            <NumberInput label="目标营业额" suffix="元" value={input.targetRevenue} onChange={value => setNumber('targetRevenue', value)} />
            <NumberInput label="昨日营业额" suffix="元" value={input.yesterdayRevenue} onChange={value => setNumber('yesterdayRevenue', value)} />
            <NumberInput label="当前客单" suffix="元" value={input.averageTicket} onChange={value => setNumber('averageTicket', value)} />
            <NumberInput label="券领取" suffix="条" value={input.couponClaims} onChange={value => setNumber('couponClaims', value)} />
            <NumberInput label="预约" suffix="桌/条" value={input.reservations} onChange={value => setNumber('reservations', value)} />
            <NumberInput label="私信咨询" suffix="条" value={input.privateMessages} onChange={value => setNumber('privateMessages', value)} />
            <NumberInput label="已核销" suffix="单" value={input.redemptions} onChange={value => setNumber('redemptions', value)} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-stone-200 bg-stone-950 p-4 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">今日决策</p>
            <h3 className="mt-2 text-2xl font-black">{decision.headline}</h3>
            <p className="mt-3 text-sm leading-6 text-emerald-100">{decision.decision}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <Metric label="单份毛利" value={`${decision.grossProfitPerOrder} 元`} />
              <Metric label="还差营业额" value={`${decision.revenueGap} 元`} />
              <Metric label="目标单数" value={`${decision.ordersNeeded} 单`} />
            </div>
            <div className="mt-4 grid gap-2">
              {decision.why.map(item => (
                <p className="rounded-lg bg-white/[0.06] px-3 py-2 text-xs leading-5 text-stone-200" key={item}>{item}</p>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-[#fbfaf7] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">渠道方案</p>
                <h3 className="mt-1 text-lg font-black text-stone-950">今天可以直接交给运营的 4 个渠道版本</h3>
              </div>
              <span className="w-fit rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-600">草稿需门店确认</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {decision.channelPack.map(item => (
                <article className="rounded-lg border border-stone-200 bg-white p-3" key={item.channel}>
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-sm font-black text-stone-950">{item.channel}</h4>
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-800">{item.job}</span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-stone-700">{item.copy}</p>
                  <p className="mt-2 rounded-lg bg-stone-50 px-3 py-2 text-xs leading-5 text-stone-500">凭证：{item.proof}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">今日行动队列</p>
            <h3 className="mt-1 text-lg font-black text-stone-950">不是“下一步动作”，是今天谁必须做什么</h3>
            <div className="mt-4 space-y-2">
              {decision.actionQueue.map(item => (
                <article className="grid gap-2 rounded-lg border border-stone-200 bg-[#fbfaf7] p-3 md:grid-cols-[0.55fr_1.45fr_0.55fr]" key={item.action}>
                  <div className="text-sm font-black text-stone-950">{item.owner}</div>
                  <div>
                    <p className="text-sm leading-5 text-stone-800">{item.action}</p>
                    <p className="mt-1 text-xs leading-5 text-stone-500">凭证：{item.evidence}</p>
                  </div>
                  <div className="text-xs font-bold text-amber-700">{item.due}</div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700">竞品为何看起来更强</p>
            <h3 className="mt-1 text-lg font-black text-rose-950">不是做不到，是缺账号、数据和交易权限</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {decision.blockedAutomation.map(item => (
                <article className="rounded-lg border border-rose-100 bg-white p-3" key={item.capability}>
                  <h4 className="text-sm font-black text-rose-950">{item.capability}</h4>
                  <p className="mt-2 text-xs leading-5 text-rose-800">缺：{item.missing}</p>
                  <p className="mt-2 text-xs leading-5 text-stone-600">{item.whyCompetitorsCan}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="rounded-lg border border-stone-200 bg-white p-3">
      <span className="text-[11px] font-semibold text-stone-500">{label}</span>
      <input className="mt-2 w-full bg-transparent text-sm font-bold text-stone-950 outline-none" value={value} onChange={event => onChange(event.target.value)} />
    </label>
  );
}

function NumberInput({
  label,
  suffix,
  value,
  step = '1',
  onChange,
}: {
  label: string;
  suffix: string;
  value: number;
  step?: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="rounded-lg border border-stone-200 bg-white p-3">
      <span className="text-[11px] font-semibold text-stone-500">{label}</span>
      <div className="mt-2 flex items-center gap-2">
        <input className="min-w-0 flex-1 bg-transparent text-sm font-bold text-stone-950 outline-none" type="number" step={step} value={value} onChange={event => onChange(event.target.value)} />
        <span className="shrink-0 text-[11px] font-semibold text-stone-400">{suffix}</span>
      </div>
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-lg bg-white/[0.08] p-3">
      <div className="text-[11px] font-semibold text-stone-400">{label}</div>
      <div className="mt-1 text-xl font-black text-white">{value}</div>
    </article>
  );
}

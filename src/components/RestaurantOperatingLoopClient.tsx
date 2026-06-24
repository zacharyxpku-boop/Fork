'use client';

import { useEffect, useMemo, useState } from 'react';

import {
  RESTAURANT_EXTERNAL_DATA_SOURCES,
  RESTAURANT_EXTERNAL_SETUP_NEEDS,
  RESTAURANT_PUBLIC_SAMPLES,
  getRestaurantPublicSampleCities,
  getRestaurantPublicSampleImportRows,
  getRestaurantPublicSamplesByCity,
  type RestaurantPublicSample,
  publicSampleToTrialIntake,
} from '@/lib/restaurant-public-data';

type LoopState = {
  restaurant: string;
  owner: string;
  focusDish: string;
  channel: string;
  dailyData: string;
  evidence: string;
  publishProof: string;
  followup: string;
  memory: string;
};

type TaskRow = {
  title: string;
  owner: string;
  proof: string;
  next: string;
  status: 'ready' | 'needs-proof' | 'blocked';
};

const STORAGE_KEY = 'wenai.restaurant.operating-loop.v3';

const DEFAULT_STATE: LoopState = {
  restaurant: '南城川味小馆',
  owner: '店长 / 社群负责人',
  focusDish: '双人酸菜鱼套餐',
  channel: '大众点评、小红书、抖音、微信社群',
  dailyData: '昨日营业额、桌数、客单、缺货、差评原因：待门店补充。',
  evidence: '菜单截图、菜品图、团购券规则、评价链接或截图。',
  publishProof: '待回填发布链接或截图。',
  followup: '待分配券领取、预约、私信咨询和到店意向。',
  memory: '记录门店语气、菜品红线、客群反馈和负责人。',
};

const LOOP_STEPS = [
  { title: '门店档案', key: 'restaurant', doneText: '门店和负责人已明确' },
  { title: '手工数据', key: 'dailyData', doneText: '经营数据槽位已准备' },
  { title: 'AI 任务', key: 'evidence', doneText: '证据和素材可进入任务' },
  { title: '发布凭证', key: 'publishProof', doneText: '链接/截图有回填位置' },
  { title: '到店跟进', key: 'followup', doneText: '预约/券/私信有负责人' },
  { title: '记忆写回', key: 'memory', doneText: '复盘可写回下一轮' },
] as const;

const MANUAL_IMPORTS = [
  { source: '收银汇总', fields: '营业额、桌数、客单、菜品销量', stopLine: '未导入前不判断实际盈亏' },
  { source: '菜单 / 库存', fields: '菜品价格、售罄、缺货、食材红线', stopLine: '未确认前不自动定价' },
  { source: '平台发布', fields: '大众点评/小红书/抖音链接或截图', stopLine: '无凭证不标记已发布' },
  { source: '社群 / 私信', fields: '券领取、预约、咨询、到店意向', stopLine: '无授权不自动联系顾客' },
  { source: '复盘反馈', fields: '核销、差评原因、爆款场景、负责人备注', stopLine: '无来源不做增长承诺' },
];

const STATUS_COPY: Record<TaskRow['status'], string> = {
  ready: '可执行',
  'needs-proof': '等凭证',
  blocked: '外部阻断',
};

const formatRestaurantExternalCopy = (value: string) =>
  value
    .replaceAll('API key', '服务端账号配置')
    .replaceAll('API', '接口')
    .replaceAll('Google Places', 'Google 地图')
    .replaceAll('Yelp', '海外点评平台')
    .replaceAll('URL', '链接')
    .replaceAll('地区可用性确认', '地区资料确认')
    .replaceAll('可用性确认', '资料确认')
    .replaceAll('审计边界', '复核边界')
    .replaceAll('审计', '复核')
    .replaceAll('provider', '试跑通道账号')
    .replaceAll('Provider', '试跑通道账号');

function loadSavedState(): LoopState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATE;
  }
}

function buildTaskRows(state: LoopState): TaskRow[] {
  return [
    {
      title: '核对菜品卖点和禁用表达',
      owner: state.owner,
      proof: state.evidence,
      next: `确认 ${state.focusDish} 的食材、价格、套餐边界和不能说的话。`,
      status: state.evidence.trim() ? 'ready' : 'needs-proof',
    },
    {
      title: '生成本地门店内容任务',
      owner: '运营',
      proof: state.channel,
      next: '按渠道拆成点评笔记、小红书种草、抖音脚本和社群短句。',
      status: state.channel.trim() ? 'ready' : 'needs-proof',
    },
    {
      title: '回填发布凭证',
      owner: '运营 / 门店',
      proof: state.publishProof,
      next: '发布后补链接或截图；没有凭证时只停留在待发布。',
      status: state.publishProof.includes('待回填') ? 'needs-proof' : 'ready',
    },
    {
      title: '分配到店跟进',
      owner: state.owner,
      proof: state.followup,
      next: '把预约、券领取、私信咨询、到店意向分到具体负责人。',
      status: state.followup.includes('待分配') ? 'needs-proof' : 'ready',
    },
    {
      title: '写回复盘记忆',
      owner: '店长',
      proof: state.memory,
      next: '沉淀门店语气、菜品红线、客群反馈和下轮动作。',
      status: state.memory.trim() ? 'ready' : 'needs-proof',
    },
    {
      title: '等待资料和授权补齐',
      owner: '产品 / 技术',
      proof: '收银、库存、预约、会员、店长授权范围、消息通知、复核记录。',
      next: '未接入前只做手工导入和证据账本，不能标记经营分析结论。',
      status: 'blocked',
    },
  ];
}

export function RestaurantOperatingLoopClient() {
  const [state, setState] = useState<LoopState>(DEFAULT_STATE);
  const [loaded, setLoaded] = useState(false);
  const [lastAction, setLastAction] = useState('本地试用数据尚未同步到外部系统。');
  const [sampleCity, setSampleCity] = useState('全部');

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setState(loadSavedState());
      setLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [loaded, state]);

  const closedSteps = useMemo(() => (
    LOOP_STEPS.filter(step => {
      const value = state[step.key];
      return typeof value === 'string' && value.trim().length > 0;
    })
  ), [state]);

  const taskRows = useMemo(() => buildTaskRows(state), [state]);
  const readyTasks = taskRows.filter(task => task.status === 'ready').length;
  const sampleCities = useMemo(() => getRestaurantPublicSampleCities(), []);
  const visibleSamples = useMemo(() => getRestaurantPublicSamplesByCity(sampleCity), [sampleCity]);
  const importRows = useMemo(() => getRestaurantPublicSampleImportRows(visibleSamples).slice(0, 4), [visibleSamples]);

  const updateField = (field: keyof LoopState, value: string) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  const generateLocalPlan = () => {
    setState(prev => ({
      ...prev,
      evidence: `${prev.focusDish}：菜品图、菜单价、套餐边界、禁用表达、至少 1 条顾客反馈凭证。`,
      publishProof: `${prev.channel}：先生成发布任务；发布后回填链接或截图；无凭证不标记已发布。`,
      followup: `${prev.owner}：跟进券领取、预约、私信咨询和到店意向；未授权不自动联系顾客。`,
      memory: `${prev.restaurant} / ${prev.focusDish}：写回菜品卖点、价格红线、客群反馈、负责人和下轮复盘。`,
    }));
    setLastAction('已生成本地任务闭环；仍需人工补实际数据和外部凭证。');
  };

  const applyPublicSample = (sample: RestaurantPublicSample) => {
    const intake = publicSampleToTrialIntake(sample);
    setState(prev => ({
      ...prev,
      restaurant: intake.restaurant,
      focusDish: intake.offer,
      channel: intake.channels,
      evidence: intake.evidence,
      dailyData: `${sample.area} 公开 POI 样例；场景：${sample.scenario}；经纬度 ${sample.coordinates.lat}, ${sample.coordinates.lon}；实际营业额、桌数、客单、库存和券核销仍需门店导入。`,
      publishProof: `${sample.name} 尚未接入平台发布；可先用大众点评/小红书/抖音/微信社群的链接或截图手工回填。`,
      followup: `${intake.audience}；等待预约、券领取、私信咨询或到店意向凭证后分配给 ${prev.owner}。`,
      memory: `${sample.name} 样例来自 ${sample.source.name}（${sample.source.license}）；只能作为公开门店输入演示，不代表门店授权或经营表现。`,
    }));
    setLastAction(`已载入公开样例：${sample.name}。下一步仍需门店补菜单、价格、图片、活动边界和发布凭证。`);
  };

  const resetLoop = () => {
    setState(DEFAULT_STATE);
    setLastAction('已重置为样例门店；未删除任何外部数据。');
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <section className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="grid gap-4 border-b border-stone-200 p-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">本地经营循环</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">本地可先准备的 100% 试用闭环</h2>
        </div>
        <p className="text-sm leading-6 text-stone-600">
          本地能补的先补成可复核任务：任务流、表单字段、证据账本、负责人、手工数据导入、复核边界、内容和到店跟进都在这里跑通。外部系统未接入前，不冒充云端同步和经营分析结论。
        </p>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[0.88fr_1.12fr]">
        <div className="space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <TextInput label="餐厅 / 门店" value={state.restaurant} onChange={value => updateField('restaurant', value)} />
            <TextInput label="负责人" value={state.owner} onChange={value => updateField('owner', value)} />
            <TextInput label="主推菜 / 活动" value={state.focusDish} onChange={value => updateField('focusDish', value)} />
            <TextInput label="渠道" value={state.channel} onChange={value => updateField('channel', value)} />
          </div>

          <FieldArea label="手工经营数据" value={state.dailyData} onChange={value => updateField('dailyData', value)} />
          <FieldArea label="证据账本" value={state.evidence} onChange={value => updateField('evidence', value)} />
          <FieldArea label="发布凭证" value={state.publishProof} onChange={value => updateField('publishProof', value)} />
          <FieldArea label="到店跟进" value={state.followup} onChange={value => updateField('followup', value)} />
          <FieldArea label="记忆写回" value={state.memory} onChange={value => updateField('memory', value)} />

          <div className="flex flex-wrap gap-2">
            <button className="rounded-lg bg-stone-950 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800" type="button" onClick={generateLocalPlan}>
              生成本地闭环任务
            </button>
            <button className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50" type="button" onClick={resetLoop}>
              重置样例
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <SummaryCard label="内部闭环" value={`${closedSteps.length}/${LOOP_STEPS.length}`} detail="字段已填即可进入任务" />
            <SummaryCard label="可执行任务" value={`${readyTasks}/${taskRows.length}`} detail="仍保留外部阻断线" />
            <SummaryCard label="公开样本" value={`${RESTAURANT_PUBLIC_SAMPLES.length} 条`} detail="4 城商圈 OSM / ODbL" />
          </div>

          <div className="rounded-lg border border-stone-200 bg-stone-950 p-4 text-white">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">任务台账</p>
                <h3 className="mt-1 text-lg font-black">任务、证据、负责人和下一步</h3>
              </div>
              <span className="w-fit rounded-full bg-amber-200 px-2.5 py-1 text-[11px] font-black text-stone-950">先手工试跑</span>
            </div>
            <div className="mt-4 space-y-3">
              {taskRows.map(task => (
                <article className="rounded-lg border border-white/10 bg-white/[0.06] p-4" key={task.title}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="text-sm font-black text-white">{task.title}</h4>
                      <p className="mt-1 text-xs leading-5 text-stone-300">负责人：{task.owner}</p>
                    </div>
                    <span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-black ${
                      task.status === 'ready' ? 'bg-emerald-200 text-emerald-950' : task.status === 'blocked' ? 'bg-rose-200 text-rose-950' : 'bg-amber-200 text-stone-950'
                    }`}>
                      {STATUS_COPY[task.status]}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-5 text-stone-300"><span className="font-bold text-white">证据：</span>{task.proof}</p>
                  <p className="mt-1 text-xs leading-5 text-amber-100"><span className="font-bold text-amber-200">下一步：</span>{task.next}</p>
                </article>
              ))}
            </div>
            <p className="mt-4 rounded-lg border border-amber-200/30 bg-amber-200/10 p-3 text-xs leading-5 text-amber-100">{lastAction}</p>
          </div>

          <div className="rounded-lg border border-stone-200 bg-[#fbfaf7] p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">人工导入条件</p>
                <h3 className="mt-1 text-lg font-black text-stone-950">手工导入先跑，资料补齐后再交接</h3>
              </div>
              <span className="w-fit rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-600">不假装已接通</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {MANUAL_IMPORTS.map(item => (
                <article className="rounded-lg border border-stone-200 bg-white p-3" key={item.source}>
                  <h4 className="text-sm font-black text-stone-950">{item.source}</h4>
                  <p className="mt-2 text-xs leading-5 text-stone-600">{item.fields}</p>
                  <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium leading-5 text-amber-800">{item.stopLine}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">公开数据样例包</p>
                <h3 className="mt-1 text-lg font-black text-stone-950">公开门店信息样本包，不冒充平台接入</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {sampleCities.map(city => (
                  <button
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold ${city === sampleCity ? 'bg-stone-950 text-white' : 'border border-stone-200 bg-stone-50 text-stone-700'}`}
                    key={city}
                    onClick={() => setSampleCity(city)}
                    type="button"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {visibleSamples.map(sample => (
                <article className="rounded-lg border border-stone-200 bg-[#fbfaf7] p-3" key={sample.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-black text-stone-950">{sample.name}</h4>
                      <p className="mt-1 text-xs text-stone-500">{sample.city} · {sample.district} / {sample.cuisine}</p>
                    </div>
                    <button
                      className="rounded-lg bg-stone-950 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-stone-800"
                      onClick={() => applyPublicSample(sample)}
                      type="button"
                    >
                      载入
                    </button>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-stone-600">{sample.scenario}</p>
                  <p className="mt-2 text-xs leading-5 text-stone-500">{sample.publicSignals.join(' / ')}</p>
                  <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs leading-5 text-stone-600">{sample.suggestedEvidence}</p>
                </article>
              ))}
            </div>

            <div className="mt-4 rounded-lg border border-stone-200 bg-stone-50 p-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Import preview</p>
                  <h4 className="mt-1 text-sm font-black text-stone-950">可复制成 CSV 的字段结构</h4>
                </div>
                <span className="text-[11px] font-semibold text-stone-500">仅展示前 4 条</span>
              </div>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-[760px] text-left text-xs">
                  <thead className="text-stone-500">
                    <tr>
                      <th className="border-b border-stone-200 px-2 py-2">门店</th>
                      <th className="border-b border-stone-200 px-2 py-2">城市</th>
                      <th className="border-b border-stone-200 px-2 py-2">场景</th>
                      <th className="border-b border-stone-200 px-2 py-2">经纬度</th>
                      <th className="border-b border-stone-200 px-2 py-2">来源</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importRows.map(row => (
                      <tr className="align-top text-stone-700" key={`${row.restaurant}-${row.latitude}`}>
                        <td className="border-b border-stone-200 px-2 py-2 font-bold text-stone-950">{row.restaurant}</td>
                        <td className="border-b border-stone-200 px-2 py-2">{row.city}</td>
                        <td className="border-b border-stone-200 px-2 py-2">{row.scenario}</td>
                        <td className="border-b border-stone-200 px-2 py-2">{row.latitude}, {row.longitude}</td>
                        <td className="border-b border-stone-200 px-2 py-2">{row.license}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">外部配置清单</p>
                <h3 className="mt-1 text-lg font-black text-stone-950">需要你配置后才能继续补的外部能力</h3>
              </div>
              <span className="w-fit rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">现在只保留人工回填</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {RESTAURANT_EXTERNAL_SETUP_NEEDS.map(item => (
                <article className="rounded-lg border border-stone-200 bg-[#fbfaf7] p-3" key={item.title}>
                  <h4 className="text-sm font-black text-stone-950">{formatRestaurantExternalCopy(item.title)}</h4>
                  <p className="mt-2 text-xs leading-5 text-stone-600"><span className="font-bold text-stone-950">需要：</span>{formatRestaurantExternalCopy(item.neededFromUser)}</p>
                  <p className="mt-2 text-xs leading-5 text-emerald-800"><span className="font-bold">解锁：</span>{formatRestaurantExternalCopy(item.unlocks)}</p>
                  <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs leading-5 text-stone-600">{formatRestaurantExternalCopy(item.internalFallback)}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">外部数据边界</p>
                <h3 className="mt-1 text-lg font-black text-stone-950">外部数据源能否现在用</h3>
              </div>
              <span className="w-fit rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-800">需要授权的不会伪装接入</span>
            </div>
            <div className="mt-4 space-y-2">
              {RESTAURANT_EXTERNAL_DATA_SOURCES.map(source => (
                <article className="rounded-lg border border-stone-200 bg-[#fbfaf7] p-3" key={source.name}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h4 className="text-sm font-black text-stone-950">{formatRestaurantExternalCopy(source.name)}</h4>
                      <p className="mt-1 text-xs leading-5 text-stone-600">{formatRestaurantExternalCopy(source.usefulFor)}</p>
                    </div>
                    <span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-black ${source.canUseNow ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {source.canUseNow ? '可做样例' : '需外部条件'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-stone-500">内部替代：{formatRestaurantExternalCopy(source.internalFallback)}</p>
                  <p className="mt-1 text-xs leading-5 text-amber-800">外部必需：{formatRestaurantExternalCopy(source.externalRequirement)}</p>
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
    <label className="rounded-lg border border-stone-200 bg-[#fbfaf7] p-3">
      <span className="text-[11px] font-semibold text-stone-500">{label}</span>
      <input className="mt-2 w-full bg-transparent text-sm font-bold text-stone-950 outline-none" value={value} onChange={event => onChange(event.target.value)} />
    </label>
  );
}

function FieldArea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block rounded-lg border border-stone-200 bg-white p-3">
      <span className="text-[11px] font-semibold text-stone-500">{label}</span>
      <textarea className="mt-2 min-h-20 w-full resize-none bg-transparent text-sm leading-5 text-stone-700 outline-none" value={value} onChange={event => onChange(event.target.value)} />
    </label>
  );
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <div className="text-[11px] font-semibold text-stone-500">{label}</div>
      <div className="mt-2 text-2xl font-black text-stone-950">{value}</div>
      <p className="mt-2 text-xs leading-5 text-stone-600">{detail}</p>
    </article>
  );
}

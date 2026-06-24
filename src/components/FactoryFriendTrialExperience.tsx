import Link from 'next/link';
import type { ReactNode } from 'react';

import { buildRestaurantClawSkillCatalog } from '@/lib/restaurant-claw-skill-catalog';
import { buildRestaurantCapabilityTrainingPlan } from '@/lib/restaurant-capability-training-plan';
import { buildRestaurantCompetitorCapabilityMatrix } from '@/lib/restaurant-competitor-capability-matrix';
import {
  RESTAURANT_GROWTH_LOOP_EXTERNAL_GATES_NOW,
  RESTAURANT_GROWTH_LOOP_INTERNAL_READY_NOW,
  RESTAURANT_GROWTH_LOOP_STAGES,
  RESTAURANT_TODAY_TASK_CARDS,
} from '@/lib/restaurant-growth-loop';
import { RESTAURANT_FRIEND_TRIAL_PRODUCT_INDEX } from '@/lib/restaurant-friend-trial-product-index';
import {
  RESTAURANT_PUBLISH_PROOF_DEMO_PLANS,
  buildRestaurantPublishProofLedger,
  type RestaurantPublishProofStatus,
} from '@/lib/restaurant-publish-proof-ledger';
import {
  RESTAURANT_RECOVER_SIGNAL_DEMO_ROWS,
  buildRestaurantRecoverSignalImportReport,
} from '@/lib/restaurant-recover-signal-import';
import { buildRestaurantReviewLoopBossRecap } from '@/lib/restaurant-review-loop-boss-recap';
import { buildRestaurantTrialOrchestratorPack } from '@/lib/restaurant-trial-orchestrator';
import { appendRestaurantTrialIntake, type RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

type Tone = 'slate' | 'emerald' | 'amber' | 'sky';

export type FactoryFriendMetric = {
  label: string;
  value: string;
  detail?: string;
  tone?: Tone;
};

export type FactoryFriendStage = {
  label: string;
  value: number;
};

export type FactoryFriendAction = {
  role: string;
  title: string;
  value: string;
  href: string;
};

export type FactoryFriendTrialExperienceProps = {
  active: 'overview' | 'creative' | 'create' | 'video' | 'cast' | 'manage';
  title: string;
  subtitle: string;
  eyebrow?: string;
  badge?: string;
  metrics: FactoryFriendMetric[];
  funnel?: FactoryFriendStage[];
  actions: FactoryFriendAction[];
  nextHref?: string;
  nextLabel?: string;
  intake?: RestaurantTrialIntake;
  children?: ReactNode;
};

const NAV = [
  { id: 'overview', label: '工作台', hint: '创建门店任务', href: '/factory?variant=friend_trial' },
  { id: 'creative', label: '卖点', hint: '选择到店理由', href: '/factory/creative?variant=friend_trial' },
  { id: 'create', label: '素材', hint: '整理菜品资料', href: '/factory/create?variant=friend_trial' },
  { id: 'video', label: '内容', hint: '生成本地内容', href: '/factory/video?variant=friend_trial' },
  { id: 'cast', label: '发布', hint: '安排门店渠道', href: '/factory/cast?variant=friend_trial' },
  { id: 'manage', label: '跟进', hint: '交给店长处理', href: '/factory/manage?variant=friend_trial' },
] as const;

const WORKFLOW = [
  { title: '录入门店', body: '先填餐厅、菜品或套餐、目标客群和这次活动边界。' },
  { title: '确认理由', body: '从菜品卖点、用餐场景、客评和同城内容里选今天要讲的角度。' },
  { title: '生成内容', body: '把到店理由变成短视频脚本、图文、团购券说明和社群话术。' },
  { title: '安排发布', body: '选择大众点评、小红书、抖音、微信社群等渠道，保留链接或截图。' },
  { title: '门店跟进', body: '把预约、券领取、私信咨询和到店意向交给店长或社群负责人。' },
];

const PRODUCT_FIELDS = [
  { label: '餐厅 / 门店', name: 'restaurant', value: '南城川味小馆' },
  { label: '菜品 / 套餐 / 活动', name: 'offer', value: '双人酸菜鱼套餐' },
  { label: '目标客群', name: 'audience', value: '附近 3 公里晚餐双人客' },
  { label: '主推渠道', name: 'channels', value: '大众点评 / 小红书 / 微信社群' },
];

function customerStopLineFor(moduleId: string): string {
  if (moduleId === 'content-production-chain') return '没有视频通道资料和成片证明，不说视频已经做好。';
  if (moduleId === 'publish-proof-board') return '没有账号确认和发布凭证，不说平台已经发出。';
  if (moduleId === 'voice-frontdesk-gate') return '没有电话接入、菜单字段、收银和支付约定，不说能接真实来电或收款。';
  if (moduleId === 'cost-inventory-review') return '没有销售、库存、采购和财务汇总约定，不写真实毛利或库存优化结论。';
  if (moduleId === 'first-party-repeat-loop') return '没有订单、支付和会员授权，不说真实订单增长。';
  if (moduleId === 'guest-experience-recovery') return '只看聚合信号，不保存顾客身份或聊天原文。';
  return '只说今天能做什么、还缺什么、谁负责和凭证在哪里。';
}

function customerLoopStageLabel(stage: string): string {
  if (stage === 'Intake') return '录入';
  if (stage === 'Diagnose') return '诊断';
  if (stage === 'Create') return '生成';
  if (stage === 'Publish Proof') return '发布凭证';
  if (stage === 'Recover') return '回收';
  if (stage === 'Review Loop') return '复盘';
  return stage;
}

const INTAKE_AUDIT_FIELDS = [
  { label: '到店理由', name: 'visitReason', placeholder: '例：工作日晚餐不用排队，双人套餐更适合附近白领。' },
  { label: '活动边界', name: 'constraints', placeholder: '例：不可写最低价；限量、食材来源、毛利和核销口径需店长确认。' },
  { label: '已有证据', name: 'evidence', placeholder: '例：菜单截图、菜品图、点评链接、社群反馈、券领取截图。' },
];

const INTAKE_REQUIREMENTS = [
  '菜单/价格/库存先手工确认',
  '发布链接或截图必须回填',
  '预约、券领取、私信只记录真实证据',
];

const DELIVERABLES = [
  { title: '菜品卖点卡', body: '今天主推哪道菜、适合什么用餐场景、哪些价格和食材表达要确认。' },
  { title: '本地内容计划', body: '短视频脚本、图文标题、团购券说明和社群话术，先给门店确认。' },
  { title: '发布与跟进表', body: '发布链接或截图、预约/券领取/私信记录、负责人和下一步动作。' },
];

const OPERATING_KERNEL = [
  { title: '餐饮技能内置', body: '把品牌定位、菜单优化、外卖增长、本地生活、会员增长和盈利分析拆成可调用任务。' },
  { title: '门店分层记忆', body: '记录常用菜品、禁用表达、客群偏好、活动边界和负责人，不让下一轮从零开始。' },
  { title: '样例安全隔离', body: '账号资料未确认前只做手动导入和证据回填，门店资料不会被伪装成已发布结果。' },
  { title: '任务分工清楚', body: '文案、表格、长文档、图片理解和逻辑复盘分开处理，页面只展示可审核结论。' },
];

const RESTAURANT_SKILLS = [
  '品牌定位',
  '营运服务',
  '品牌宣传',
  '法务合规',
  '食品安全',
  '选址开发',
  '菜单优化',
  '外卖增长',
  '本地生活',
  '会员增长',
  '媒体公关',
  '盈利分析',
  '连锁扩张',
  '人力资源',
  '企业文化',
  '门头优化',
  '库存管理',
  '门店标准',
  '布局评测',
  '采购供应',
];

const DATA_INPUTS = [
  { label: '大众点评', value: '链接 / 截图 / 手工表格' },
  { label: '小红书', value: '笔记链接 / 评论摘录' },
  { label: '抖音', value: '视频链接 / 私信截图' },
  { label: '微信社群', value: '群反馈 / 券领取记录' },
];

const CLAW_FEATURES = [
  { title: '今日任务包', detail: '把门店、菜品、活动边界和渠道变成可审核的工作单，不让客户从空白页开始。', state: '可试用' },
  { title: '证据回执', detail: '发布链接、截图、券领取、预约和私信咨询先进入证据账本，再交给负责人处理。', state: '本地试跑' },
  { title: '经营汇总', detail: '先支持链接、截图、表格和人工回填；核销、会员和评论数据等店长确认后再用。', state: '等店长确认' },
  { title: '发布凭证清单', detail: '先生成每个渠道该怎么发、谁负责、要回填什么截图；确认账号后再回填凭证步骤。', state: '等店长确认' },
  { title: '安全边界', detail: '没确认账号不读取，没回填凭证不说已发布，没来源不做经营结论。', state: '已产品化' },
];

const OPENING_STEPS = [
  { title: '填门店任务', detail: '先确认餐厅、菜品/套餐、目标客群、渠道和本轮活动边界。' },
  { title: '生成今日工单', detail: '生成内容计划、负责人、凭证要求和下一步，不把待办说成已交付结果。' },
  { title: '补缺的资料', detail: '需要真实发布、核销或经营分析时，再让店长补账号确认、截图或经营汇总表。' },
];

const AI_EMPLOYEE_TRIAL_STEPS = [
  {
    label: '第 1 步',
    title: '填门店和本次活动',
    body: '只要先填餐厅、主推菜/套餐、想吸引的人群、准备发到哪里，以及哪些话不能乱说。',
  },
  {
    label: '第 2 步',
    title: '生成今天能执行的方案',
    body: '工作台整理出内容草稿、需要的图片/菜单/券信息、发布后要回填的链接或截图，以及谁来负责。',
  },
  {
    label: '第 3 步',
    title: '交给店长跟进',
    body: '把预约、券领取、私信咨询、社群跟进和下一步动作交给店长；没确认过的结果不写成已经完成。',
  },
];

const RESTAURANT_SCENARIOS = [
  { title: '菜单定价与结构分析', detail: '输入菜单、销量、毛利或缺失字段，输出主推菜、下架风险、价格待确认项。' },
  { title: '外卖活动方案设计', detail: '把套餐边界、平台活动和库存限制转成可审查的活动说明与发布素材。' },
  { title: '门店选址量化评估', detail: '沉淀商圈、人流、竞品、租金和堂食/外卖结构，缺真实数据时只给评估清单。' },
  { title: '财务报表解读与诊断', detail: '从营业额、客单、毛利、损耗和人效看异常，不接收银系统前不做实时结论。' },
  { title: '节日会员营销策划', detail: '按会员标签、券领取、复购意向生成社群话术、负责人和下一次触达。' },
  { title: '员工绩效改进方案', detail: '从投诉、排班、翻台和服务 SOP 形成复盘问题，避免替代管理决策。' },
];

const HERMES_LAYERS = [
  { title: '深度分层记忆', detail: '门店、菜品、客群、证据、负责人分层写回，下一轮任务能复用已确认边界。' },
  { title: '沙箱安全隔离', detail: '外部账号、顾客数据、财务数据和发布动作都要求店长确认、记录、停止条件和人工复核。' },
  { title: '受控浏览器执行', detail: '常驻浏览器只执行确认过的操作清单，回传步骤记录、截图证据和失败原因。' },
  { title: '主动跟进', detail: '把预约、券领取、私信、差评和复购信号变成店长/社群/运营的下一步任务。' },
];

const activeStepLabel: Record<FactoryFriendTrialExperienceProps['active'], string> = {
  overview: '先创建一个门店活动任务',
  creative: '正在选择到店理由',
  create: '正在整理菜品素材',
  video: '正在生成本地内容版本',
  cast: '正在安排门店渠道发布',
  manage: '正在回收预约和咨询',
};

const ORCHESTRATOR_STAGE_LABELS = {
  'trial-intake': '试跑输入',
  'standard-pack': '标准交付包',
  'content-production': '内容/素材生产',
  'publish-proof': '发布凭证',
  'ops-followup': '线索/店长跟进',
} as const;

const ORCHESTRATOR_STATUS_LABELS = {
  ready: '内部可处理',
  'needs-review': '待复核',
  'external-gated': '等账号资料',
} as const;

const ORCHESTRATOR_OWNER_LABELS = {
  merchant: '商户',
  ops: '运营',
  'store-manager': '店长',
  'runtime-admin': '技术复核',
} as const;

const PUBLISH_PROOF_STATUS_LABELS: Record<RestaurantPublishProofStatus, string> = {
  planned: '已排期',
  'needs-account': '等账号确认',
  'needs-proof': '等凭证',
  'proof-ready': '待复核',
  accepted: '凭证已收',
  blocked: '已阻断',
};

export function FactoryFriendTrialExperience({
  active,
  title,
  subtitle,
  eyebrow = '餐饮客户可试用工作台',
  badge = '门店样例工作区',
  metrics,
  actions,
  nextHref,
  nextLabel = '继续下一步',
  intake = {},
  children,
}: FactoryFriendTrialExperienceProps) {
  const activeIndex = Math.max(0, NAV.findIndex(item => item.id === active));
  const withIntake = (href: string) => appendRestaurantTrialIntake(href, intake);
  const rawPrimaryActionHref = nextHref ?? NAV[Math.min(activeIndex + 1, NAV.length - 1)].href;
  const primaryActionHref = withIntake(rawPrimaryActionHref);
  const formActionHref = rawPrimaryActionHref.split('?')[0];
  const clawSkillCatalog = buildRestaurantClawSkillCatalog();
  const productFields = PRODUCT_FIELDS.map(item => ({
    ...item,
    value: intake[item.name as keyof RestaurantTrialIntake] || item.value,
  }));
  const trialOrchestratorPack = buildRestaurantTrialOrchestratorPack({
    restaurant: productFields[0]?.value,
    offer: productFields[1]?.value,
    audience: productFields[2]?.value,
    channels: productFields[3]?.value,
    visitReason: intake.visitReason || '工作日晚餐不用排队，双人套餐更适合附近白领。',
    constraints: intake.constraints || '价格、库存、核销口径由店长确认，发布前必须回填链接或截图。',
    evidence: intake.evidence || '菜单截图、菜品图、点评链接或券领取截图。',
  });
  const publishProofLedger = buildRestaurantPublishProofLedger({
    restaurantName: productFields[0]?.value,
    offerName: productFields[1]?.value,
    plans: RESTAURANT_PUBLISH_PROOF_DEMO_PLANS.map(plan => ({
      ...plan,
      restaurantName: productFields[0]?.value,
      offerName: productFields[1]?.value,
    })),
  });
  const recoverSignalImport = buildRestaurantRecoverSignalImportReport({
    restaurantName: productFields[0]?.value,
    offerName: productFields[1]?.value,
    rows: RESTAURANT_RECOVER_SIGNAL_DEMO_ROWS,
  });
  const reviewLoopBossRecap = buildRestaurantReviewLoopBossRecap({
    publishProofLedger,
    recoverImport: recoverSignalImport,
  });
  const competitorCapabilityMatrix = buildRestaurantCompetitorCapabilityMatrix({
    restaurantName: productFields[0]?.value,
    offerName: productFields[1]?.value,
  });
  const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlan();

  return (
    <main className="h-screen w-full overflow-hidden bg-[#f5f6f3] text-stone-950 antialiased">
      <div className="flex h-full w-full">
        <aside className="hidden h-full w-[268px] shrink-0 flex-col border-r border-stone-200 bg-white lg:flex">
          <div className="flex h-16 items-center gap-3 border-b border-stone-100 px-5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-stone-950 text-sm font-bold text-white">W</div>
            <div>
              <div className="text-[17px] font-semibold tracking-tight">Wenai</div>
              <div className="text-[11px] text-stone-500">餐饮门店增长工作台</div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {NAV.map((item, index) => (
              <Link
                aria-current={item.id === active ? 'page' : undefined}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  item.id === active ? 'bg-stone-950 text-white shadow-sm' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-950'
                }`}
                href={withIntake(item.href)}
                key={item.id}
              >
                <span className={`flex size-7 items-center justify-center rounded-lg text-[11px] font-semibold ${item.id === active ? 'bg-white text-stone-950' : 'bg-stone-100 text-stone-500'}`}>
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold">{item.label}</span>
                  <span className={`block text-[11px] ${item.id === active ? 'text-white/60' : 'text-stone-400'}`}>{item.hint}</span>
                </span>
              </Link>
            ))}
          </nav>

          <div className="border-t border-stone-100 p-4">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <div className="text-xs font-semibold text-stone-500">当前任务</div>
              <div className="mt-2 text-sm font-semibold text-stone-950">{activeStepLabel[active]}</div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.min(100, 18 + activeIndex * 15)}%` }} />
              </div>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <header className="flex min-h-16 shrink-0 flex-col gap-3 border-b border-stone-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="min-w-0">
              <h1 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
                Wenai 餐饮门店增长工作台
                <span className="rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600 ring-1 ring-inset ring-stone-200">{badge}</span>
              </h1>
              <p className="mt-0.5 text-[13px] text-stone-500">给餐饮客户直接试用：先填餐厅和菜品，再生成可审核的本地内容和到店跟进任务。</p>
              <p className="sr-only">一眼看懂：这套内容怎么帮门店拿到预约、券领取和私信咨询。</p>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">不承诺爆单，只跑清楚第一轮</span>
              {nextHref ? (
                <Link className="rounded-full bg-stone-950 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-stone-800" href={withIntake(nextHref)}>
                  {nextLabel}
                </Link>
              ) : null}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <section aria-label="friend trial product index" className="sr-only">
              {RESTAURANT_FRIEND_TRIAL_PRODUCT_INDEX.map(item => (
                <span key={item}>{item}</span>
              ))}
            </section>
            <div className="mx-auto max-w-[1180px] space-y-5 pb-12">
              <section className="overflow-hidden rounded-3xl border border-stone-200 bg-[#fdfcf9] shadow-[0_18px_60px_rgba(28,25,23,0.08)]">
                <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_360px]">
                  <div className="p-5 sm:p-6 lg:p-7">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">今日门店任务控制台</p>
                    <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <h2 className="max-w-3xl text-3xl font-black leading-tight text-stone-950 sm:text-4xl">今天该做哪件事：先把一道主推菜变成可审核工单</h2>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">任务、负责人、证据、状态和下一步，先在门店内部跑清楚，再去补平台账号、商户授权和经营汇总表。</p>
                      </div>
                      <Link className="inline-flex w-fit items-center justify-center rounded-xl bg-stone-950 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-stone-800" href={primaryActionHref}>
                        生成今日门店工单
                      </Link>
                    </div>

                    <form action={formActionHref} className="mt-5 grid gap-3 lg:grid-cols-4" method="get">
                      <input name="variant" type="hidden" value="friend_trial" />
                      {productFields.map(item => (
                        <label className="block rounded-xl border border-stone-200 bg-white px-3 py-2.5" key={item.label}>
                          <span className="text-[11px] font-bold text-stone-500">{item.label}</span>
                          <input className="mt-1 w-full bg-transparent text-sm font-black text-stone-950 outline-none" defaultValue={item.value} name={item.name} />
                        </label>
                      ))}
                      <label className="block rounded-xl border border-stone-200 bg-white px-3 py-2.5 lg:col-span-2">
                        <span className="text-[11px] font-bold text-stone-500">到店场景 / 今天理由</span>
                        <input className="mt-1 w-full bg-transparent text-sm font-black text-stone-950 outline-none" defaultValue={intake.visitReason || ''} name="visitReason" placeholder="例：工作日晚餐、周末家庭、出门前双人" />
                      </label>
                      <label className="block rounded-xl border border-stone-200 bg-white px-3 py-2.5">
                        <span className="text-[11px] font-bold text-stone-500">优惠边界</span>
                        <input className="mt-1 w-full bg-transparent text-sm font-black text-stone-950 outline-none" defaultValue={intake.constraints || ''} name="constraints" />
                      </label>
                      <label className="block rounded-xl border border-stone-200 bg-white px-3 py-2.5">
                        <span className="text-[11px] font-bold text-stone-500">素材现状</span>
                        <input className="mt-1 w-full bg-transparent text-sm font-black text-stone-950 outline-none" defaultValue={intake.evidence || ''} name="evidence" />
                      </label>
                      <button className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-black text-emerald-800 transition hover:bg-emerald-100 lg:col-span-4" type="submit">
                        生成今日门店工单
                      </button>
                    </form>

                    <div className="mt-4 grid gap-3 lg:grid-cols-3">
                      {RESTAURANT_TODAY_TASK_CARDS.map(card => (
                        <article className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm" key={card.title}>
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-sm font-black text-stone-950">{card.title}</h3>
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200">{card.status}</span>
                          </div>
                          <dl className="mt-3 space-y-2 text-[11px] leading-4 text-stone-600">
                            <div><dt className="inline font-bold text-stone-900">负责人：</dt><dd className="inline">{card.owner}</dd></div>
                            <div><dt className="inline font-bold text-stone-900">证据：</dt><dd className="inline">{card.evidence}</dd></div>
                            <div><dt className="inline font-bold text-stone-900">下一步：</dt><dd className="inline">{card.next}</dd></div>
                          </dl>
                        </article>
                      ))}
                    </div>

                    <section className="mt-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm" aria-label="发布凭证账本">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">发布凭证账本</p>
                          <h3 className="mt-1 text-lg font-black text-stone-950">每个渠道都要留下负责人、时间、链接或截图</h3>
                          <p className="mt-1 text-xs leading-5 text-stone-600">没有账号确认和凭证回填时，只生成排期和待补清单，不说已经发出。</p>
                        </div>
                        <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-stone-200 bg-stone-50 text-center text-xs">
                          <div className="border-r border-stone-200 px-3 py-2">
                            <div className="font-black text-stone-950">{publishProofLedger.summary.total}</div>
                            <div className="mt-0.5 text-[10px] font-bold text-stone-500">渠道</div>
                          </div>
                          <div className="border-r border-stone-200 px-3 py-2">
                            <div className="font-black text-stone-950">{publishProofLedger.summary.accepted}</div>
                            <div className="mt-0.5 text-[10px] font-bold text-stone-500">已收</div>
                          </div>
                          <div className="px-3 py-2">
                            <div className="font-black text-stone-950">{publishProofLedger.summary.nextActionCount}</div>
                            <div className="mt-0.5 text-[10px] font-bold text-stone-500">待办</div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 grid gap-2 md:grid-cols-3">
                        {publishProofLedger.items.map(item => (
                          <article className="rounded-xl border border-stone-200 bg-[#fbfaf7] p-3" key={item.id}>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-black text-stone-950">{item.storeName}</h4>
                                <p className="mt-1 text-[11px] leading-4 text-stone-500">负责人：{item.owner} · 时间：{item.scheduledAt}</p>
                              </div>
                              <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-800">{PUBLISH_PROOF_STATUS_LABELS[item.status]}</span>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-stone-600">{item.proofSummary}</p>
                            <div className="mt-2 rounded-lg border border-stone-200 bg-white px-2 py-1 text-[11px] font-bold text-stone-500">下一步：{item.blockers[0] || item.nextAction}</div>
                          </article>
                        ))}
                      </div>
                      <p className="mt-3 rounded-xl bg-stone-950 px-3 py-2 text-[11px] leading-5 text-stone-100">回流只看脱敏汇总：预约、券领取、咨询、评价和到店意向；不保存顾客身份、聊天原文、券码、订单和收银明细。</p>
                    </section>

                    <section className="mt-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm" aria-label="老板版下一轮复盘">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-emerald-700">老板版下一轮复盘</p>
                          <h3 className="mt-1 text-lg font-black text-stone-950">{reviewLoopBossRecap.headline}</h3>
                          <p className="mt-1 text-xs leading-5 text-stone-600">复盘只引用发布凭证账本和脱敏回流，不把待补资料写成经营归因。</p>
                        </div>
                        <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs">
                          <div className="text-[10px] font-bold text-stone-500">本轮判断</div>
                          <div className="mt-1 font-black text-stone-950">
                            {reviewLoopBossRecap.decision === 'amplify' ? '小步放大' : reviewLoopBossRecap.decision === 'iterate' ? '继续验证' : '暂停放大'}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
                        <div className="grid gap-2 sm:grid-cols-2">
                          {[
                            ['下一轮推什么', reviewLoopBossRecap.nextDishAction],
                            ['卖点怎么改', reviewLoopBossRecap.sellingPointChange],
                            ['先补什么素材', reviewLoopBossRecap.materialGaps[0]],
                            ['证据来源', `发布凭证账本：已收 ${reviewLoopBossRecap.summary.acceptedProofs}/${publishProofLedger.summary.total}；脱敏回流：${reviewLoopBossRecap.summary.recoverRows} 行。`],
                          ].map(([label, value]) => (
                            <div className="rounded-xl border border-stone-200 bg-[#fbfaf7] p-3" key={label}>
                              <div className="text-[11px] font-bold text-stone-500">{label}</div>
                              <p className="mt-1 text-xs font-bold leading-5 text-stone-800">{value}</p>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                          <div className="text-[11px] font-black text-stone-950">负责人下一步</div>
                          <div className="mt-2 space-y-2">
                            {reviewLoopBossRecap.ownerActions.slice(0, 3).map(item => (
                              <div className="rounded-lg bg-white px-2 py-1.5 text-[11px] leading-4 text-stone-600" key={`${item.owner}-${item.evidenceRequired}`}>
                                <span className="font-black text-stone-900">{item.owner}：</span>{item.action}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-[11px] leading-5 text-amber-800 ring-1 ring-inset ring-amber-200">放大前必须补齐发布凭证和脱敏回流；没有平台授权、核销数据约定和店长确认时，只给下一步动作，不宣称真实增长结果。</p>
                    </section>
                  </div>

                  <aside className="border-t border-stone-200 bg-stone-950 p-5 text-white xl:border-l xl:border-t-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.16em] text-amber-200">当前能跑 / 还缺什么</p>
                    <div className="mt-4 space-y-3">
                      <div className="rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3">
                        <h3 className="text-sm font-black text-emerald-100">当前内部可完成</h3>
                        <ul className="mt-2 space-y-1 text-[11px] leading-4 text-emerald-50/85">
                          {RESTAURANT_GROWTH_LOOP_INTERNAL_READY_NOW.map(item => <li key={item}>路 {item}</li>)}
                        </ul>
                      </div>
                      <div className="rounded-xl border border-amber-300/25 bg-amber-300/10 p-3">
                        <h3 className="text-sm font-black text-amber-100">账号 / 授权 / 数据条件</h3>
                        <ul className="mt-2 space-y-1 text-[11px] leading-4 text-amber-50/90">
                          {RESTAURANT_GROWTH_LOOP_EXTERNAL_GATES_NOW.map(item => <li key={item}>路 {item}</li>)}
                        </ul>
                        <p className="mt-2 text-[11px] leading-4 text-amber-50/90">账号资料：补齐账号、截图或经营表格后解锁</p>
                      </div>
                    </div>
                  </aside>
                </div>

                <div className="grid gap-2 border-t border-stone-200 bg-[#fbfaf7] p-4 md:grid-cols-3 xl:grid-cols-6">
                  {RESTAURANT_GROWTH_LOOP_STAGES.map(step => (
                    <article className="rounded-xl border border-stone-200 bg-white p-3" key={step.id}>
                      <div className="text-[10px] font-black uppercase tracking-[0.12em] text-emerald-700">{step.customerStage}</div>
                      <h3 className="mt-1 text-sm font-black text-stone-950">{step.title}</h3>
                      <p className="mt-2 min-h-16 text-[11px] leading-4 text-stone-600">{step.body}</p>
                      <div className="mt-2 rounded-lg bg-stone-50 px-2 py-1 text-[11px] font-bold text-stone-500">证据：{step.proof}</div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="relative overflow-hidden rounded-3xl border border-emerald-900/45 bg-[#07130f] text-white shadow-[0_24px_80px_rgba(7,19,15,0.28)]">
                <div className="absolute inset-0 opacity-45 [background-image:linear-gradient(rgba(16,185,129,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.12)_1px,transparent_1px)] [background-size:42px_42px]" />
                <div className="absolute -right-28 -top-28 h-72 w-72 rounded-full border border-emerald-300/20" />
                <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full border border-lime-200/10" />

                <div className="relative grid gap-0 lg:grid-cols-[minmax(0,1fr)_390px]">
                  <div className="p-5 sm:p-7 lg:p-8">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-[11px] font-semibold tracking-[0.12em] text-emerald-200">门店今天就能试跑</span>
                      <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold text-stone-200">本地门店试跑入口</span>
                    </div>

                    <h2 className="mt-6 max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                      今天先跑一张门店经营工单
                    </h2>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
                      从菜品、套餐、门店活动和本地渠道开始，生成可审核的内容计划、发布凭证、负责人和下一步。今天先用公开资料、本地工具和手工回填跑出老板能执行的工单，需要账号、核销或经营表格时再提示补齐。
                    </p>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link className="rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-black text-stone-950 shadow-sm transition hover:bg-emerald-200" href={primaryActionHref}>
                        开始门店任务
                      </Link>
                      <Link className="rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/[0.1]" href={withIntake('/factory/manage?variant=friend_trial')}>
                        查看跟进闭环
                      </Link>
                    </div>

                    <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        { label: '先看今天能做啥', body: '直接告诉老板今天能先做哪几件事', href: '#restaurant-trial-spine' },
                        { label: '生成试跑工单', body: '做出一张门店活动工单、负责人和回填凭证要求', href: '#restaurant-trial-spine' },
                        { label: '补缺的资料', body: '不用等账号配置，先列出还差哪些截图或表格', href: '#restaurant-trial-spine' },
                        { label: '看回收结果', body: '只用链接、截图、预约、券领取和去掉隐私的汇总表做判断', href: withIntake('/factory/manage?variant=friend_trial') },
                      ].map(item => (
                        <a className="border border-white/10 bg-white/[0.055] px-3 py-2 text-left transition hover:border-emerald-200/40 hover:bg-emerald-200/10" href={item.href} key={item.label}>
                          <span className="block text-xs font-black text-white">{item.label}</span>
                          <span className="mt-1 block text-[11px] leading-4 text-stone-400">{item.body}</span>
                        </a>
                      ))}
                    </div>

                    <div className="mt-4 rounded-2xl border border-sky-200/20 bg-sky-200/[0.07] p-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="text-[10px] font-semibold tracking-[0.16em] text-sky-100/70">第一次使用，只走 3 步</div>
                          <p className="mt-1 text-sm font-black text-white">1 家门店、1 个爆品、1 个到店理由。</p>
                        </div>
                        <a className="w-fit rounded-full border border-sky-100/30 px-3 py-1.5 text-[11px] font-black text-sky-100 transition hover:bg-sky-100/10" href="#restaurant-trial-spine">
                          从这里开始
                        </a>
                      </div>
                      <div className="mt-3 grid gap-2 md:grid-cols-3">
                        {AI_EMPLOYEE_TRIAL_STEPS.map(item => (
                          <div className="border border-white/10 bg-black/20 p-3" key={item.title}>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/60">{item.label}</div>
                            <div className="mt-1 text-sm font-black text-white">{item.title}</div>
                            <p className="mt-1 text-[11px] leading-4 text-stone-400">{item.body}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 grid gap-2 md:grid-cols-3">
                        <div className="border border-white/10 bg-black/20 p-3">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/60">开跑前 30 秒检查</div>
                          <p className="mt-1 text-[11px] leading-4 text-stone-400">缺账号、授权或经营汇总表就停在待补资料</p>
                        </div>
                        <div className="border border-white/10 bg-black/20 p-3">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/60">7 分钟现场演示路径</div>
                          <p className="mt-1 text-[11px] leading-4 text-stone-400">2 分钟填门店和主推套餐，结束后回填凭证、负责人和停止线</p>
                        </div>
                        <div className="border border-white/10 bg-black/20 p-3">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/60">现场永远不说</div>
                          <p className="mt-1 text-[11px] leading-4 text-stone-400">只说今天能做什么、需要补什么、谁负责、凭证在哪里</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-7 grid gap-3 md:grid-cols-5">
                      {CLAW_FEATURES.map(item => (
                        <article className="rounded-2xl border border-white/10 bg-white/[0.055] p-3 backdrop-blur" key={item.title}>
                          <div className="text-sm font-black text-white">{item.title}</div>
                          <p className="mt-2 min-h-16 text-[11px] leading-5 text-stone-400">{item.detail}</p>
                          <div className="mt-3 w-fit rounded-full bg-emerald-300/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">{item.state}</div>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-white/10 bg-black/20 p-5 lg:border-l lg:border-t-0">
                    <div className="rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">试用路径</p>
                      <div className="mt-4 space-y-3">
                        {OPENING_STEPS.map((item, index) => (
                          <div className="rounded-2xl border border-white/10 bg-[#07130f]/75 p-3" key={item.title}>
                            <div className="flex items-center gap-3">
                              <span className="flex size-7 items-center justify-center rounded-full bg-emerald-300 text-xs font-black text-stone-950">{index + 1}</span>
                              <h3 className="text-sm font-black">{item.title}</h3>
                            </div>
                            <p className="mt-2 pl-10 text-[11px] leading-5 text-stone-400">{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 rounded-3xl border border-white/10 bg-white/[0.055] p-4">
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-stone-400">上线前需要准备</p>
                      <ul className="mt-3 space-y-2 text-xs leading-5 text-stone-300">
                        <li>公开资料和门店素材：菜单、菜品图、活动规则、点评链接或截图先手工确认。</li>
                        <li>发布账号确认：需要真实发布、核销或评论回收时，再由店长确认账号和权限。</li>
                        <li>经营汇总表：核销、会员和预约数据先用汇总表，不能上传顾客隐私。</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-[0_18px_60px_rgba(28,25,23,0.08)]">
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_390px]">
                  <div className="p-5 sm:p-6 lg:p-7">
                    <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      {eyebrow}
                    </div>

                    <div className="mt-5 grid gap-6 xl:grid-cols-[1fr_360px]">
                      <div>
                        <h2 className="max-w-2xl text-3xl font-black leading-tight tracking-tight text-stone-950 sm:text-5xl">{title}</h2>
                        <p className="mt-4 max-w-xl text-sm leading-6 text-stone-600">{subtitle}</p>

                        <form action={formActionHref} className="mt-6 rounded-2xl border border-stone-200 bg-[#fbfaf7] p-4" method="get">
                          <input name="variant" type="hidden" value="friend_trial" />
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h3 className="text-base font-semibold text-stone-950">今天先创建一个门店活动任务</h3>
                              <p className="mt-1 text-xs text-stone-500">这不是演示卡片。客户填完后直接带着信息进入“到店理由”工作台。</p>
                            </div>
                            <button className="w-fit rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700" type="submit">
                              带着信息进入下一步
                            </button>
                          </div>
                          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                            {productFields.map(item => (
                              <label className="block rounded-xl border border-stone-200 bg-white px-3 py-2.5" key={item.label}>
                                <span className="text-[11px] font-medium text-stone-500">{item.label}</span>
                                <input className="mt-1 w-full bg-transparent text-sm font-semibold text-stone-950 outline-none" defaultValue={item.value} name={item.name} />
                              </label>
                            ))}
                          </div>
                          <div className="mt-3 grid gap-3 lg:grid-cols-3">
                            {INTAKE_AUDIT_FIELDS.map(item => (
                              <label className="block rounded-xl border border-stone-200 bg-white px-3 py-2.5" key={item.label}>
                                <span className="text-[11px] font-medium text-stone-500">{item.label}</span>
                                <textarea className="mt-2 min-h-20 w-full resize-none bg-transparent text-sm leading-5 text-stone-800 outline-none" defaultValue={intake[item.name as keyof RestaurantTrialIntake] || ''} name={item.name} placeholder={item.placeholder} />
                              </label>
                            ))}
                          </div>
                          <div className="mt-3 grid gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 sm:grid-cols-3">
                            {INTAKE_REQUIREMENTS.map(item => (
                              <label className="flex items-start gap-2" key={item}>
                                <input className="mt-0.5 accent-amber-700" defaultChecked name="confirmedBoundary" type="checkbox" value={item} />
                                <span>{item}</span>
                              </label>
                            ))}
                          </div>
                          <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                            <div className="grid gap-3 md:grid-cols-3">
                              {metrics.map(item => (
                                <div className="rounded-xl border border-stone-200 bg-white px-3 py-3" key={item.label}>
                                  <div className="text-[11px] font-medium text-stone-500">{item.label}</div>
                                  <div className="mt-1 text-sm font-semibold text-stone-950">{item.value}</div>
                                  {item.detail ? <p className="mt-2 text-xs leading-5 text-stone-500">{item.detail}</p> : null}
                                </div>
                              ))}
                            </div>
                            <Link className="flex min-h-[120px] flex-col justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-stone-950 transition hover:border-emerald-300 hover:bg-emerald-100/70" href={primaryActionHref}>
                              <div>
                                <div className="text-[11px] font-semibold tracking-[0.16em] text-emerald-700">下一步</div>
                                <div className="mt-2 text-base font-semibold">{nextLabel}</div>
                                <p className="mt-2 text-xs leading-5 text-stone-600">先确认当前门店任务状态，再进入下一步，不用靠口头解释继续试用。</p>
                              </div>
                              <span className="mt-3 text-sm font-semibold text-emerald-700">打开流程入口</span>
                            </Link>
                          </div>
                        </form>
                      </div>

                      <div className="rounded-2xl border border-stone-200 bg-stone-950 p-4 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[11px] font-semibold tracking-[0.16em] text-stone-400">今天要做</p>
                            <h3 className="mt-1 text-lg font-bold">下一步很明确</h3>
                          </div>
                          <span className="rounded-full bg-emerald-400 px-2.5 py-1 text-[11px] font-bold text-stone-950">可继续</span>
                        </div>
                        <div className="mt-4 space-y-2">
                          {WORKFLOW.map((item, index) => (
                            <div className={`rounded-xl border p-3 ${index === activeIndex || (active === 'overview' && index === 0) ? 'border-emerald-300/35 bg-emerald-300/10' : 'border-white/10 bg-white/[0.05]'}`} key={item.title}>
                              <div className="flex items-center gap-2">
                                <span className="flex size-6 items-center justify-center rounded-full bg-white text-[11px] font-black text-stone-950">{index + 1}</span>
                                <h4 className="text-sm font-bold">{item.title}</h4>
                              </div>
                              <p className="mt-1 pl-8 text-[11px] leading-4 text-stone-400">{item.body}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-stone-200 bg-[#f8f6f0] p-5 lg:border-l lg:border-t-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-stone-950">客户会拿到的东西</h3>
                      <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-stone-500 ring-1 ring-stone-200">不是效果承诺</span>
                    </div>
                    <div className="mt-4 space-y-3">
                      {DELIVERABLES.map(item => (
                        <article className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm" key={item.title}>
                          <h4 className="text-sm font-bold text-stone-950">{item.title}</h4>
                          <p className="mt-2 text-xs leading-5 text-stone-500">{item.body}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 border-t border-stone-200 bg-white lg:grid-cols-6">
                  {NAV.map((item, index) => (
                    <Link className="group border-r border-stone-200 p-3 last:border-r-0 hover:bg-stone-50 sm:p-4" href={withIntake(item.href)} key={item.id}>
                      <div className="flex items-center gap-2">
                        <span className={`flex size-7 items-center justify-center rounded-lg text-[11px] font-semibold ${item.id === active ? 'bg-stone-950 text-white' : 'bg-stone-100 text-stone-500'}`}>{index + 1}</span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-stone-900">{item.label}</h3>
                          <div className="hidden truncate text-[11px] text-stone-400 sm:block">{item.hint}</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {actions.map(item => (
                  <Link className="group rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-lg" href={withIntake(item.href)} key={`${item.role}-${item.title}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[11px] font-semibold text-stone-500">{item.role}</div>
                        <h3 className="mt-2 text-base font-semibold text-stone-950">{item.title}</h3>
                      </div>
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-medium text-stone-500">打开</span>
                    </div>
                    <p className="mt-4 text-sm leading-5 text-stone-600">{item.value}</p>
                  </Link>
                ))}
              </section>

              <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm" id="restaurant-trial-spine">
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_330px]">
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold tracking-[0.16em] text-emerald-700">门店试跑主流程</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">五段试跑主链路</h2>
                        <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{trialOrchestratorPack.spine}</p>
                        <p className="mt-2 text-xs font-bold text-stone-500">试跑输入 -&gt; 标准交付包 -&gt; 内容素材生产 -&gt; 发布凭证 -&gt; 店长跟进</p>
                      </div>
                      <div className="grid w-full grid-cols-3 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50 text-center sm:w-[310px]">
                        <div className="border-r border-stone-200 p-3">
                          <div className="text-[11px] font-semibold text-stone-500">阶段</div>
                          <div className="mt-1 text-xl font-black text-stone-950">{trialOrchestratorPack.summary.stages}</div>
                        </div>
                        <div className="border-r border-stone-200 p-3">
                          <div className="text-[11px] font-semibold text-stone-500">发布凭证</div>
                          <div className="mt-1 text-xl font-black text-stone-950">{trialOrchestratorPack.summary.acceptedProofs}/{trialOrchestratorPack.summary.publishProofSlots}</div>
                        </div>
                        <div className="p-3">
                          <div className="text-[11px] font-semibold text-stone-500">店长跟进</div>
                          <div className="mt-1 text-xl font-black text-stone-950">{trialOrchestratorPack.summary.followupTasks}</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 xl:grid-cols-5">
                      {trialOrchestratorPack.stages.map(stage => (
                        <article className="flex min-h-[188px] flex-col justify-between rounded-2xl border border-stone-200 bg-[#fbfaf7] p-4" key={stage.id}>
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="text-[11px] font-semibold text-stone-500">{stage.id}</div>
                                <h3 className="mt-1 text-sm font-black text-stone-950">{ORCHESTRATOR_STAGE_LABELS[stage.id]}</h3>
                              </div>
                              <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${stage.status === 'ready' ? 'bg-emerald-100 text-emerald-800' : stage.status === 'external-gated' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'}`}>
                                {ORCHESTRATOR_STATUS_LABELS[stage.status]}
                              </span>
                            </div>
                            <p className="mt-3 text-xs leading-5 text-stone-600">{stage.nextAction}</p>
                          </div>
                          <div className="mt-4 space-y-2 text-[11px] leading-4 text-stone-500">
                            <div>负责人：{ORCHESTRATOR_OWNER_LABELS[stage.owner]}</div>
                            <div>证据项：{stage.evidence.length}</div>
                            <div className="truncate">输出：{stage.outputRef}</div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-stone-200 bg-stone-950 p-5 text-white lg:border-l lg:border-t-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">主链路边界</p>
                    <h3 className="mt-2 text-lg font-black">内部产包、凭证槽和任务队列先跑通</h3>
                    <div className="mt-4 space-y-3">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                        <div className="text-xs font-semibold text-stone-400">标准交付包</div>
                        <div className="mt-1 text-sm font-bold">{trialOrchestratorPack.standardPack.route}</div>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                        <div className="text-xs font-semibold text-stone-400">内容交付包</div>
                        <div className="mt-1 text-sm font-bold">{trialOrchestratorPack.contentDelivery.title}</div>
                      </div>
                      <div className="rounded-2xl border border-amber-300/20 bg-amber-300/10 p-3">
                        <div className="text-xs font-semibold text-amber-100">外部解锁条件</div>
                        <ul className="mt-2 space-y-1 text-[11px] leading-4 text-amber-50/90">
                          {trialOrchestratorPack.externalGates.slice(0, 3).map(item => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <p className="text-[11px] leading-5 text-stone-400">{trialOrchestratorPack.safetyBoundary}</p>
                      <p className="text-[11px] leading-5 text-amber-100/75">读取平台或发布之前，先拿到店长确认的授权范围。</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-[11px] font-semibold tracking-[0.16em] text-emerald-700">门店经营记忆</p>
                        <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">餐饮人的门店任务助手，不是一次性聊天框</h2>
                      </div>
                      <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800">只展示已确认能力</span>
                    </div>
                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                      {OPERATING_KERNEL.map(item => (
                        <article className="rounded-2xl border border-stone-200 bg-stone-50 p-4" key={item.title}>
                          <h3 className="text-sm font-bold text-stone-950">{item.title}</h3>
                          <p className="mt-2 text-xs leading-5 text-stone-600">{item.body}</p>
                        </article>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-stone-200 bg-stone-950 p-5 text-white lg:border-l lg:border-t-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-400">数据条件</p>
                    <h3 className="mt-2 text-lg font-bold">先接证据，再谈优化</h3>
                    <div className="mt-4 space-y-2">
                      {DATA_INPUTS.map(item => (
                        <div className="rounded-xl border border-white/10 bg-white/[0.06] p-3" key={item.label}>
                          <div className="text-sm font-semibold">{item.label}</div>
                          <div className="mt-1 text-[11px] leading-4 text-stone-400">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t border-stone-200 bg-white p-5 sm:p-6">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.16em] text-emerald-700">内部能力清单</p>
                      <h3 className="mt-2 text-xl font-black tracking-tight text-stone-950">20 模块 / 200 技能 / 60 工具，逐项标注能否现在执行</h3>
                    </div>
                    <p className="max-w-2xl text-sm leading-6 text-stone-600">{clawSkillCatalog.safetyBoundary}</p>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                      <div className="text-[11px] font-semibold text-stone-500">模块 / 技能 / 工具</div>
                      <div className="mt-2 text-2xl font-black text-stone-950">{clawSkillCatalog.summary.modules} / {clawSkillCatalog.summary.skills} / {clawSkillCatalog.summary.tools}</div>
                      <p className="mt-2 text-xs leading-5 text-stone-600">不是口号，每个模块固定 10 个技能，每个工具都有安全动作和补资料条件。</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="text-[11px] font-semibold text-emerald-700">内部可用 / 待训练 / 等账号资料</div>
                      <div className="mt-2 text-2xl font-black text-emerald-950">{clawSkillCatalog.summary.internalReadySkills} / {clawSkillCatalog.summary.trainingNeededSkills} / {clawSkillCatalog.summary.providerGatedSkills}</div>
                      <p className="mt-2 text-xs leading-5 text-emerald-900">先把内部技能训练成任务包；外部执行只在账号确认后解锁。</p>
                    </div>
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <div className="text-[11px] font-semibold text-amber-700">工具权限</div>
                      <div className="mt-2 text-2xl font-black text-amber-950">{clawSkillCatalog.summary.internalReadyTools} / {clawSkillCatalog.summary.trainingNeededTools} / {clawSkillCatalog.summary.providerGatedTools}</div>
                      <p className="mt-2 text-xs leading-5 text-amber-900">导入器、检查器可先处理；回执器、复盘器必须等平台、收银系统或执行工具。</p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                      {clawSkillCatalog.modules.slice(0, 8).map(module => (
                        <article className="rounded-2xl border border-stone-200 bg-[#fbfaf7] p-3" key={module.id}>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-black text-stone-950">{module.name}</h4>
                            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-stone-500 ring-1 ring-stone-200">{module.skills.length} skills</span>
                          </div>
                          <p className="mt-2 min-h-10 text-xs leading-5 text-stone-600">{module.job}</p>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {module.skills.slice(0, 3).map(skill => (
                              <span className="rounded-full border border-stone-200 bg-white px-2 py-0.5 text-[11px] text-stone-600" key={skill.id}>{skill.name.replace(module.name, '')}</span>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                    <div className="rounded-2xl border border-stone-900 bg-stone-950 p-4 text-white">
                      <h4 className="text-sm font-black">下一轮复用与补资料</h4>
                      <div className="mt-3 space-y-2">
                        {clawSkillCatalog.nextInternalTraining.slice(0, 4).map(item => (
                          <div className="rounded-xl border border-white/10 bg-white/[0.06] p-2 text-[11px] leading-4 text-stone-300" key={`${item.moduleId}-${item.skillId}`}>
                            训练：{item.material}
                          </div>
                        ))}
                        {clawSkillCatalog.externalSetupRequests.slice(0, 3).map(item => (
                          <div className="rounded-xl border border-amber-300/20 bg-amber-300/10 p-2 text-[11px] leading-4 text-amber-100" key={`${item.toolId}-${item.unlocks}`}>
                            外部账号：补齐账号、截图或经营表格后解锁 {item.unlocks}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-stone-200 bg-[#fbfaf7] p-5 sm:p-6">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-sm font-bold text-stone-950">餐饮技能矩阵</h3>
                    <p className="text-xs leading-5 text-stone-500">先在试用工作台暴露任务入口，真实代办等账号、数据和权限确认后再打开。</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {RESTAURANT_SKILLS.map(skill => (
                      <span className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-700 shadow-sm" key={skill}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">真实餐饮场景</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">门店试跑场景，即刻体验</h2>
                  </div>
                  <p className="max-w-2xl text-sm leading-6 text-stone-600">
                    这些不是泛泛的内容生成入口，而是餐饮老板每天会问的问题。没有外部数据时，工作台只输出清单、草稿和待确认项；账号确认后再升级为真实经营分析和执行。
                  </p>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {RESTAURANT_SCENARIOS.map(item => (
                    <article className="rounded-2xl border border-stone-200 bg-[#fbfaf7] p-4" key={item.title}>
                      <h3 className="text-base font-black text-stone-950">{item.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-stone-600">{item.detail}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="overflow-hidden rounded-3xl border border-stone-800 bg-stone-950 text-white shadow-sm">
                <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
                  <div className="border-b border-white/10 p-5 sm:p-6 lg:border-b-0 lg:border-r">
                    <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-300">门店安全记忆</p>
                    <h2 className="mt-3 text-3xl font-black tracking-tight">把确认过的门店经验记下来</h2>
                    <div className="mt-5 grid gap-3">
                      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4">
                        <h3 className="text-lg font-black text-emerald-100">不追求领先，但追求安全</h3>
                        <p className="mt-2 text-sm leading-6 text-stone-300">外部账号、顾客数据、财务数据和发布动作必须带店长确认、回执和复核记录。</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                        <h3 className="text-lg font-black text-white">不追求完美，但追求适配</h3>
                        <p className="mt-2 text-sm leading-6 text-stone-400">先让单店能跑通一个真实经营闭环，再把多店权限、长期记忆和自动执行接进来。</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 p-5 sm:p-6 md:grid-cols-2">
                    {HERMES_LAYERS.map(item => (
                      <article className="rounded-2xl border border-white/10 bg-white/[0.06] p-4" key={item.title}>
                        <h3 className="text-base font-black text-white">{item.title}</h3>
                        <p className="mt-3 text-sm leading-6 text-stone-400">{item.detail}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                <div className="border-b border-stone-200 bg-[#fbfaf7] p-5 sm:p-6">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-700">竞品能力转成 Wenai 模块</p>
                      <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">不是堆竞品名，而是每项都有负责人、证据和停止线</h2>
                    </div>
                    <p className="max-w-2xl text-sm leading-6 text-stone-600">
                      参考 Kuaizi、美团智能掌柜、语音接待、Owner.com、SevenRooms、MarketMan 和餐饮运营工具，但统一翻译成门店增长闭环里的任务模块。
                    </p>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-4">
                    {[
                      ['模块', competitorCapabilityMatrix.summary.modules],
                      ['闭环阶段', competitorCapabilityMatrix.summary.loopStages],
                      ['当前能展示', competitorCapabilityMatrix.summary.visibleNow],
                      ['待补条件', competitorCapabilityMatrix.summary.gated],
                    ].map(([label, value]) => (
                      <div className="rounded-2xl border border-stone-200 bg-white px-3 py-2 text-center" key={label}>
                        <div className="text-[11px] font-semibold text-stone-500">{label}</div>
                        <div className="mt-1 text-xl font-black text-stone-950">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-3 p-5 sm:p-6 lg:grid-cols-2">
                  {competitorCapabilityMatrix.modules.slice(0, 8).map(item => (
                    <article className="rounded-2xl border border-stone-200 bg-[#fbfaf7] p-4" key={item.id}>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="text-[11px] font-semibold text-emerald-700">{customerLoopStageLabel(item.loopStage)} · {item.source}</div>
                          <h3 className="mt-1 text-lg font-black text-stone-950">{item.wenaiModule}</h3>
                        </div>
                        <span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-black ${item.canShowNow ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'}`}>
                          {item.canShowNow ? '可先展示' : '待补资料'}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-stone-700">{item.customerJob}</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <div className="rounded-xl border border-stone-200 bg-white p-3">
                          <div className="text-[11px] font-bold text-stone-500">输出</div>
                          <p className="mt-1 text-xs leading-5 text-stone-700">{item.output.join(' / ')}</p>
                        </div>
                        <div className="rounded-xl border border-stone-200 bg-white p-3">
                          <div className="text-[11px] font-bold text-stone-500">证据</div>
                          <p className="mt-1 text-xs leading-5 text-stone-700">{item.evidence.join(' / ')}</p>
                        </div>
                      </div>
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                        <span className="font-black">负责人：{item.owner}。</span>{item.nextAction} {item.gate}
                      </div>
                      <p className="mt-2 text-[11px] leading-5 text-stone-500">{customerStopLineFor(item.id)}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                <div className="border-b border-stone-200 bg-[#fbfaf7] p-5 sm:p-6">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold tracking-[0.18em] text-emerald-700">能力训练清单</p>
                      <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">竞品能力训练与接入矩阵</h2>
                    </div>
                    <p className="max-w-2xl text-sm leading-6 text-stone-600">
                      目标不是堆技能数量，而是每项能力都有训练材料、外部条件、凭证要求和第一步。内部能做的先训练成任务包，外部要补的明确列出来。
                    </p>
                  </div>
                </div>
                <div className="divide-y divide-stone-200">
                  {capabilityTrainingPlan.items.map(item => (
                    <article className="grid gap-0 lg:grid-cols-[220px_minmax(0,1fr)]" key={item.capability}>
                      <div className="border-stone-200 bg-stone-950 p-4 text-white lg:border-r">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300">能力</div>
                        <h3 className="mt-2 text-lg font-black">{item.capability}</h3>
                        <p className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-3 text-xs leading-5 text-emerald-50">
                          第一步：{item.firstRun}
                        </p>
                      </div>
                      <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border border-stone-200 bg-stone-50 p-3">
                          <div className="text-[11px] font-semibold text-stone-500">内部已具备</div>
                          <p className="mt-2 text-xs leading-5 text-stone-700">{item.internal}</p>
                        </div>
                        <div className="rounded-2xl border border-stone-200 bg-white p-3">
                          <div className="text-[11px] font-semibold text-stone-500">需要训练材料</div>
                          <p className="mt-2 text-xs leading-5 text-stone-700">{item.trainingMaterials.join(' / ')}</p>
                        </div>
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
                          <div className="text-[11px] font-semibold text-amber-700">外部账号 / 权限</div>
                          <p className="mt-2 text-xs leading-5 text-amber-900">补齐账号确认、公开链接、截图、核销汇总表或经营导出表。</p>
                        </div>
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                          <div className="text-[11px] font-semibold text-emerald-700">验收标准</div>
                          <p className="mt-2 text-xs leading-5 text-emerald-900">{item.acceptance}</p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              {children}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import PageViewTracker from '@/components/analytics/PageViewTracker';
import { AnimatedMetric } from '@/components/marketing/AnimatedMetric';
import LandingDecisionDemo from '@/components/marketing/LandingDecisionDemo';
import TopNav from '@/components/marketing/TopNav';
import MarketingFooter from '@/components/marketing/MarketingFooter';
import { PricingIntentCards } from '@/components/marketing/PricingIntentCards';
import { VisitorRouter } from '@/components/marketing/VisitorRouter';

export const metadata: Metadata = {
  title: 'Wenai | 餐饮门店增长试跑工作台',
  description: '导入门店活动、菜品素材和反馈证据，生成下一轮内容生产、发布凭证和店长跟进动作。',
};

const proof = [
  { value: 5, suffix: ' 类渠道', label: '覆盖点评、小红书、抖音、微信社群和门店私域证据' },
  { value: 100, suffix: '% 门禁优先', label: '未接授权前只做人工凭证和内部试跑' },
  { value: 4, suffix: ' 类动作', label: '暂停、加素材、继续测试和店长跟进都有明确负责人' },
];

const steps = [
  { title: '输入门店试跑', text: '填入餐厅、菜品/套餐、到店理由、目标渠道和已有素材。' },
  { title: '生成交付包', text: '首屏看到标准包、内容任务、发布凭证槽位和外部门禁。' },
  { title: '交给店长跟进', text: '导出内容 Brief、人工发布凭证、预约/券领取/私信跟进事项。' },
];

export default function HomePage() {
  return (
    <>
      <PageViewTracker page="landing" />
      <TopNav />
      <main className="bg-bg-root text-text-primary">
        <section className="border-b border-border-subtle">
          <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-16 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-24">
            <div className="flex flex-col justify-center">
              <div className="text-[10px] font-mono uppercase tracking-widest text-accent">Restaurant Trial OS</div>
              <h1 className="mt-4 max-w-[13ch] text-4xl font-semibold leading-[1.03] tracking-tight text-text-primary sm:text-6xl">
                从门店活动，跑出下一轮内容和跟进。
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-7 text-text-secondary sm:text-base">
                Wenai 把菜品/套餐、门店素材、发布凭证和到店反馈连起来，输出餐饮商家能执行的下一轮动作：补什么素材、发到哪里、谁跟进，以及交给内容和店长的生产 Brief。
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/dashboard" className="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-[13px] font-semibold text-bg-root transition-colors hover:bg-accent-hover">
                  免费开始门店试跑
                </Link>
                <Link href="/pricing" className="inline-flex min-h-11 items-center justify-center rounded-md border border-border-subtle px-5 text-[13px] font-semibold text-text-primary transition-colors hover:border-accent hover:text-accent">
                  查看定价
                </Link>
              </div>
            </div>

            <LandingDecisionDemo />
          </div>
        </section>

        <VisitorRouter />

        <section className="border-b border-border-subtle py-12">
          <div className="mx-auto grid max-w-[1200px] gap-4 px-5 sm:px-6 md:grid-cols-3 lg:px-8">
            {proof.map(item => <AnimatedMetric key={item.label} value={item.value} suffix={item.suffix} label={item.label} />)}
          </div>
        </section>

        <section className="border-b border-border-subtle py-16" id="flow">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="text-[10px] font-mono uppercase tracking-widest text-accent">3 Step Workflow</div>
              <h2 className="mt-3 text-3xl font-semibold text-text-primary">从门店活动到执行，不让商家卡在聊天和表格里。</h2>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-md border border-border-subtle bg-bg-surface p-5">
                  <div className="font-mono text-[11px] text-accent">{String(index + 1).padStart(2, '0')}</div>
                  <h3 className="mt-4 text-lg font-semibold text-text-primary">{step.title}</h3>
                  <p className="mt-2 text-[13px] leading-6 text-text-secondary">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16" id="pricing">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-accent">Pricing</div>
                <h2 className="mt-3 text-3xl font-semibold text-text-primary">从免费复盘第一轮开始。</h2>
              </div>
              <Link href="/pricing" className="text-[13px] font-semibold text-accent hover:text-accent-hover">
                查看完整对比
              </Link>
            </div>
            <PricingIntentCards compact />
          </div>
        </section>
      </main>
      <MarketingFooter />
    </>
  );
}

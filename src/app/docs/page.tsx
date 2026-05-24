import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '文档中心 | wenai',
  description:
    '如何运行 10 SKU POC、生成标准包、查看老板版报告，并把合格账户推进到正式商务流程。',
};

const SECTIONS = [
  {
    id: 'quick-start',
    title: '5 分钟客户路径',
    body: [
      '先选择类目，再粘贴一条真实 SKU 说明。',
      '生成标准上新包和验收材料。',
      '打开 POC 报告查看是否具备推进条件。',
      '把老板版页面发给决策人，或者直接提交 POC 需求。',
    ],
  },
  {
    id: 'poc',
    title: '10 SKU POC 交付标准',
    body: [
      '合格的 POC 需要真实 SKU、类目、目标平台、卖点、价格带、素材、参考链接和品牌禁区。',
      '输出应包含上新文案、视觉方向、合规提示、客服话术、内容方向、验收分和下一步动作。',
      '高风险宣称、商标、强监管类目和平台政策问题必须保留人工复核。',
    ],
  },
  {
    id: 'marketing',
    title: '内容营销层',
    body: [
      '营销模块应该服务电商 POC，而不是变成泛社媒工具箱。',
      '理想路径是：benchmark 证据、hook 矩阵、UGC 或轮播 brief、测试计划、复盘报告。',
      '当 benchmark 数据不足时，系统必须标注为假设，而不是假装研究已经完成。',
    ],
  },
  {
    id: 'crm',
    title: 'CRM 交接层',
    body: [
      '交付完成后，要记录负责人、状态、合同阶段、报价状态、付款状态、SLA 到期日和下一步动作。',
      '老板版报告用于内部评审，询盘详情页用于推进商务动作。',
      '目标只有一个：判断这个账户是否应该进入主站合同和支付流程。',
    ],
  },
];

const BLUEPRINT_LINKS = [
  {
    href: '/status',
    title: '终局蓝图',
    body: '查看 Compose / Create / Cut / Cast / Manage 的当前进度、竞品差距和外部门禁。',
  },
  {
    href: '/settings/kuaizi',
    title: '外部材料',
    body: '查看视频 provider、平台 OAuth、广告账户、回流、云资产和规模审计的材料包。',
  },
  {
    href: '/factory/video',
    title: '视频工厂',
    body: '查看 AI 视频分析、智能混剪、一键视频、Clico 模板矩阵和 provider 沙盒边界。',
  },
];

const FRIEND_TRIAL_STEPS = [
  {
    href: '/status?variant=friend_trial',
    title: '1. 看能不能试用',
    body: '先确认哪些链路只是内部骨架，哪些已经能给非技术用户跑一遍。',
  },
  {
    href: '/factory/creative?variant=friend_trial',
    title: '2. 放入灵感线索',
    body: '用一个竞品账号、榜单或视频线索生成可执行的创意下一步。',
  },
  {
    href: '/factory/create?variant=friend_trial',
    title: '3. 生成生产包',
    body: '确认 brief、脚本、素材、权属和客户审核入口是否齐全。',
  },
  {
    href: '/factory/video?variant=friend_trial',
    title: '4. 排出视频任务',
    body: '查看智能混剪、一键视频和 Clico 模板矩阵如何进入待生产队列。',
  },
  {
    href: '/factory/cast?variant=friend_trial',
    title: '5. 只看分发证据',
    body: '没有 OAuth 和发布回执前，只验证计划和手工证据，不宣称自动投放。',
  },
];

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-[1000px] px-6 py-10">
      <div className="mb-8 text-center">
        <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-accent">文档中心</div>
        <h1 className="mb-3 text-2xl font-bold text-text-primary lg:text-3xl font-[family-name:var(--font-outfit)]">
          wenai 使用说明
        </h1>
        <p className="mx-auto max-w-[660px] text-[13px] leading-relaxed text-text-secondary">
          这不是说明书堆砌页，而是客户和运营都能看懂的操作指引：SKU 输入、规则、Brand IQ、内容营销、POC 报告和商务推进。
        </p>
      </div>

      <div className="mb-6 rounded-md border border-border-subtle bg-bg-surface/50 p-4">
        <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">目录</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {SECTIONS.map((section) => (
            <a key={section.id} href={`#${section.id}`} className="text-[12px] text-text-secondary hover:text-accent">
              {section.title}
            </a>
          ))}
        </div>
      </div>

      <section className="mb-10 rounded-md border border-amber-200 bg-amber-50 p-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-700">Final Blueprint</div>
        <h2 className="mt-2 text-[18px] font-black text-slate-950">终局产品形态与外部接入边界</h2>
        <p className="mt-2 text-[12px] leading-6 text-slate-700">
          合作者先看 <span className="font-semibold">docs/FINAL_PRODUCT_BLUEPRINT.md</span>，再进入下面三个入口确认当前能力、外部材料和视频生产边界。没有 provider callback、平台 OAuth、广告账户授权、analytics sync、企业云资产和规模审计前，不宣称筷子科技等价。
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {BLUEPRINT_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md border border-amber-200 bg-white p-4 text-left hover:border-amber-400">
              <div className="text-[13px] font-black text-slate-950">{item.title}</div>
              <p className="mt-2 text-[12px] leading-5 text-slate-600">{item.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-10 rounded-md border border-sky-200 bg-sky-50 p-5">
        <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-sky-700">Friend Trial Runbook</div>
        <h2 className="mt-2 text-[18px] font-black text-slate-950">朋友/合作者零解释试用顺序</h2>
        <p className="mt-2 text-[12px] leading-6 text-slate-700">
          试用时不要从后台 API 或工程概念开始。按下面 5 步走，只看用户能不能理解输入、生产包、视频任务、客户审核和分发证据；遇到 provider、OAuth、广告账户或云资产门禁，就停在材料清单。
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-5">
          {FRIEND_TRIAL_STEPS.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-md border border-sky-200 bg-white p-4 hover:border-sky-400">
              <div className="text-[12px] font-black text-slate-950">{item.title}</div>
              <p className="mt-2 text-[12px] leading-5 text-slate-600">{item.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-6">
            <h2 className="mb-3 border-l-2 border-accent pl-3 text-[18px] font-bold text-text-primary font-[family-name:var(--font-outfit)]">
              {section.title}
            </h2>
            <ul className="space-y-2 text-[12px] leading-relaxed text-text-secondary">
              {section.body.map((item) => (
                <li key={item} className="rounded-md border border-border-subtle bg-bg-surface/40 p-3">
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 gap-3 border-t border-border-subtle pt-6 sm:grid-cols-3">
        <Link href="/poc" className="rounded-md border border-border-default px-4 py-3 text-center text-[12px] font-semibold text-text-primary hover:border-accent">
          打开 POC
        </Link>
        <Link href="/pipelines/marketing-campaign" className="rounded-md border border-border-default px-4 py-3 text-center text-[12px] font-semibold text-text-primary hover:border-accent">
          打开营销包
        </Link>
        <Link href="/pricing" className="rounded-md border border-accent/40 px-4 py-3 text-center text-[12px] font-semibold text-accent hover:bg-accent/10">
          查看方案
        </Link>
      </div>
    </div>
  );
}

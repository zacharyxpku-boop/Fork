import Link from 'next/link';

interface ColLink {
  href: string;
  label: string;
  external?: boolean;
}

const COL_TOOLS: ColLink[] = [
  { href: '/tools', label: '全部工具' },
  { href: '/tools/hook-score', label: 'Hook 跑前打分' },
  { href: '/tools/aigc-compliance', label: 'AIGC 合规速查' },
  { href: '/me/inventory', label: '库存监控' },
];

const COL_PRODUCT: ColLink[] = [
  { href: '/factory', label: '内容工厂' },
  { href: '/factory/creative', label: '创意情报台' },
  { href: '/factory/video', label: '视频生产队列' },
  { href: '/pipelines/new-listing', label: '新品上新流水线' },
  { href: '/pipelines/product-image', label: '主图工厂' },
  { href: '/pipelines/data-insights', label: '数据洞察' },
  { href: '/me/skus', label: '我的 SKU 库' },
];

const COL_RESOURCE: ColLink[] = [
  { href: '/changelog', label: '更新日志' },
  { href: '/roadmap', label: '路线图' },
  { href: '/status', label: '系统状态' },
  { href: '/pricing', label: '定价' },
  { href: '/inquire', label: '企业询盘' },
];

const COL_LEGAL: ColLink[] = [
  { href: '/terms', label: '服务条款' },
  { href: '/privacy', label: '隐私政策' },
  { href: 'https://github.com/zacharyxpku-boop/wenai', label: 'GitHub', external: true },
];

function LinkColumn({ title, items }: { title: string; items: ColLink[] }) {
  return (
    <div>
      <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
        {title}
      </div>
      <ul className="space-y-1.5">
        {items.map(item => (
          <li key={item.href}>
            {item.external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] text-text-secondary hover:text-accent"
              >
                {item.label} →
              </a>
            ) : (
              <Link href={item.href} className="text-[12px] text-text-secondary hover:text-accent">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mb-16 mt-12 border-t border-border-subtle pb-8 pt-6 sm:mb-0">
      <div className="mx-auto max-w-[1100px] px-4 lg:px-0">
        <div className="mb-6 grid grid-cols-2 gap-6 md:grid-cols-4">
          <LinkColumn title="免费工具" items={COL_TOOLS} />
          <LinkColumn title="产品能力" items={COL_PRODUCT} />
          <LinkColumn title="资源" items={COL_RESOURCE} />
          <LinkColumn title="法律" items={COL_LEGAL} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-4 text-[10px] font-mono text-text-tertiary">
          <div>
            Wenai · 跨境电商内容工业化系统 · 把空白 SKU 跑成可验收、可复盘、可交接的增长流水线
          </div>
          <div>
            © {new Date().getFullYear()} · built for operator-grade delivery
          </div>
        </div>
      </div>
    </footer>
  );
}

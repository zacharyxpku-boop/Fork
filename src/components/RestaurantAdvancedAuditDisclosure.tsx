'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const DynamicRestaurantAdvancedAudit = dynamic(
  () => import('@/components/RestaurantAdvancedAudit').then(module => module.RestaurantAdvancedAudit),
  {
    loading: () => (
      <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm font-medium text-stone-600">
        正在加载高级复核内容...
      </div>
    ),
    ssr: false,
  },
);

export function RestaurantAdvancedAuditDisclosure() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details
      className="group rounded-3xl border border-stone-200 bg-white shadow-sm"
      onToggle={event => setIsOpen(event.currentTarget.open)}
    >
      <summary className="flex cursor-pointer list-none flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">内部复核</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">展开查看打法对标、产品边界和待补资料</h2>
        </div>
        <span className="w-fit rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600 group-open:bg-stone-950 group-open:text-white">
          默认收起
        </span>
      </summary>
      <div className="space-y-5 border-t border-stone-100 p-5">
        {isOpen ? (
          <DynamicRestaurantAdvancedAudit />
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm leading-6 text-stone-600">
            高级复核默认不加载到工作台正文。需要做打法对标、产品边界、待补资料和闭环验收时再展开。
          </div>
        )}
      </div>
    </details>
  );
}

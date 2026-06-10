import type { Metadata } from 'next';
import { TrialFiveScreenClient } from '@/components/TrialFiveScreenClient';

export const metadata: Metadata = {
  title: '门店试跑 · 五步走完第一轮',
  description: '填门店、看今天三件事、拿能直接发的内容、回填凭证、看明日动作。不承诺爆单，只跑清楚第一轮。',
};

export default function TrialPage() {
  return (
    <main className="min-h-screen bg-[#faf9f6] text-stone-900" style={{ fontFamily: 'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif' }}>
      <header className="mx-auto w-full max-w-md px-4 pt-6">
        <h1 className="text-xl font-black">门店试跑：五步走完第一轮</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          填门店、看今天能做的三件事、拿到能直接发的内容、回填凭证、看明日动作。不承诺爆单，不自动发布，没有凭证只能算待补资料。
        </p>
      </header>
      <div className="mx-auto w-full max-w-md px-4 py-2 text-xs leading-5 text-stone-500">
        <p>第1屏 填门店 · 第2屏 今天三件事 · 第3屏 能直接发的内容 · 第4屏 回填凭证 · 第5屏 明日动作</p>
        <p className="mt-1">发布前店长逐条确认事实和价格。数据只存在这台设备的浏览器里，可随时清空重来。</p>
      </div>
      <TrialFiveScreenClient />
    </main>
  );
}

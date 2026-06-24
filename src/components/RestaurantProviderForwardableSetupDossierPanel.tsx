'use client';

import type { RestaurantProviderForwardableSetupDossier } from '@/lib/restaurant-provider-forwardable-setup-dossier';

const fallbackPackets = [
  { id: 'runtime-provider', title: '试跑通道配置包', sendTo: '通道对接工程师', asks: ['在服务端配置通道地址/账号和回执配置'], evidenceRequired: ['通道健康检查通过'], firstMessage: '先在服务端配置一条试跑通道。' },
  { id: 'merchant-owner', title: '店长授权配置包', sendTo: '店长', asks: ['确认一个平台的授权范围'], evidenceRequired: ['授权范围和有效期'], firstMessage: '确认允许动作和撤销负责人。' },
  { id: 'data-owner', title: '经营数据配置包', sendTo: '数据 / 收银汇总负责人', asks: ['提供去隐私的汇总字段'], evidenceRequired: ['字段表'], firstMessage: '只发汇总数据约定。' },
  { id: 'ops-lead', title: '门店启动配置包', sendTo: '门店运营负责人', asks: ['复核启动条件和收尾'], evidenceRequired: ['待复核回执'], firstMessage: '凭证复核前保持试跑打开。' },
];

const panelStatusLabel: Record<string, string> = {
  'blocked-before-launch': '启动前待补资料',
  blocked: '待补资料',
  ready: '可复核',
};

const panelSchemaLabel: Record<string, string> = {
  'x-restaurant-agent-signature': '签名回执规则',
};

const formatPanelStatus = (value: string) => panelStatusLabel[value] || value;
const formatPanelSchema = (value: string) => panelSchemaLabel[value] || value;
const formatPanelGate = (value: boolean | undefined, readyLabel = '资料待复核', blockedLabel = '待补资料') =>
  value ? readyLabel : blockedLabel;
const formatPanelText = (value: string) =>
  formatPanelSchema(value)
    .replaceAll('Provider runtime setup', '试跑通道配置包')
    .replaceAll('RESTAURANT_AGENT_LOBU_RUNTIME_URL', '事件型试跑通道地址')
    .replaceAll('RESTAURANT_AGENT_LOBU_API_KEY', '事件型试跑通道账号')
    .replaceAll('RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', '隔离试跑通道地址')
    .replaceAll('RESTAURANT_AGENT_OPENCLAW_API_KEY', '隔离试跑通道账号')
    .replaceAll('RESTAURANT_AGENT_HERMES_RUNTIME_URL', '常驻试跑通道地址')
    .replaceAll('RESTAURANT_AGENT_HERMES_API_KEY', '常驻试跑通道账号')
    .replaceAll('RESTAURANT_AGENT_', '服务端试跑通道配置项')
    .replaceAll('x-restaurant-agent-signature', '签名回执规则')
    .replaceAll('external-receipt', '签名回执')
    .replaceAll('已验收', '待复核')
    .replaceAll('server-env-or-secret-manager-only', '仅服务端安全保存')
    .replaceAll('runtime URL', '试跑通道地址')
    .replaceAll('runtime key', '试跑通道账号')
    .replaceAll('runtime-admin', '技术复核')
    .replaceAll('Runtime', '试跑通道')
    .replaceAll('runtime', '试跑通道')
    .replaceAll('provider key', '试跑通道账号')
    .replaceAll('provider', '试跑通道')
    .replaceAll('Provider', '试跑通道')
    .replaceAll('setup', '配置')
    .replaceAll('endpoint', '通道地址')
    .replaceAll('POST /tasks', '提交到试跑通道')
    .replaceAll('/tasks', '试跑任务入口')
    .replaceAll('/health', '通道健康检查')
    .replaceAll('/events', '事件回执入口')
    .replaceAll('/runs', '试跑记录入口');
const formatPanelTextList = (values: string[] | undefined, emptyLabel = '无') =>
  values?.length ? values.map(formatPanelText).join(' / ') : emptyLabel;

export function RestaurantProviderForwardableSetupDossierPanel({ dossier }: { dossier?: RestaurantProviderForwardableSetupDossier }) {
  const packets = dossier?.packets || fallbackPackets;

  return (
    <div className="mt-3 border border-violet-200/15 bg-violet-200/[0.035] p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/65">可转发配置档案</div>
          <p className="mt-1 text-xs font-black text-white">给技术复核、店长、数据负责人和门店运营各一份资料包。</p>
          <p className="mt-1 text-[11px] leading-4 text-violet-100/55">约定: {formatPanelStatus(dossier?.firstLiveRunContract.launchVerdict || 'blocked-before-launch')} / 回执规则 {formatPanelSchema(dossier?.firstLiveRunContract.callbackHeader || 'x-restaurant-agent-signature')}</p>
        </div>
        <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">试跑交接</div>
          <div className="mt-1 text-xs font-black text-white">{formatPanelGate(dossier?.summary.canStartLiveProviderNow)}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-6">
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">资料包</div>
          <div className="mt-1 text-xs font-black text-violet-100/75">{dossier?.summary.packets ?? packets.length}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">优先级</div>
          <div className="mt-1 text-xs font-black text-violet-100/75">{dossier?.summary.p0Items ?? 0}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">配置项</div>
          <div className="mt-1 text-xs font-black text-white">{dossier?.summary.providerEnvKeys ?? 0}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">店长侧</div>
          <div className="mt-1 text-xs font-black text-white">{dossier?.summary.merchantSignoffs ?? 0}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">数据</div>
          <div className="mt-1 text-xs font-black text-white">{dossier?.summary.dataContracts ?? 0}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">边界</div>
          <div className="mt-1 text-xs font-black text-white">{formatPanelGate(dossier?.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 lg:grid-cols-4">
        {packets.map(item => (
          <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
            <div className="text-xs font-black text-white">{formatPanelText(item.title)}</div>
            <p className="mt-1 text-[11px] leading-4 text-violet-100/55">发给: {formatPanelText(item.sendTo)}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/45">{formatPanelTextList(item.asks.slice(0, 2))}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/55">{formatPanelTextList(item.evidenceRequired.slice(0, 2))}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-violet-100/55">
        导出摘要: {formatPanelText(dossier?.exportDigest.markdown.split('\n')[0] || '可转发配置档案')} / 配置值一律服务端保存
      </p>
    </div>
  );
}

'use client';

import type { RestaurantProviderReceiptAcceptanceConsole } from '@/lib/restaurant-provider-receipt-acceptance-console';

const fallbackChecks = [
  { id: 'signature', status: 'blocked', owner: 'runtime-admin', evidence: ['签名回执规则'], nextAction: '校验回执签名。' },
  { id: 'run-id', status: 'blocked', owner: 'provider', evidence: ['eventId', 'externalRunId'], nextAction: '把运行编号和交接包对上。' },
  { id: 'public-proof', status: 'waiting', owner: 'ops', evidence: ['公开凭证链接', '截图编号'], nextAction: '收集可核验凭证。' },
  { id: 'business-signal', status: 'waiting', owner: 'data-ops', evidence: ['汇总信号'], nextAction: '只提取待复核的汇总信号。' },
  { id: 'memory-write', status: 'blocked', owner: 'store-manager', evidence: ['仅限待复核凭证'], nextAction: '凭证复核前不写记忆。' },
  { id: 'claim-boundary', status: 'blocked', owner: 'ops', evidence: ['待补资料，不承诺交接待复核'], nextAction: '资料不齐先保持待补。' },
];

const panelStatusLabel: Record<string, string> = {
  accepted: '待复核',
  blocked: '待补资料',
  'blocked-before-dispatch': '投递前待补资料',
  ready: '可复核',
  waiting: '等待中',
};

const panelOwnerLabel: Record<string, string> = {
  'data-ops': '数据复核',
  ops: '运营',
  provider: '试跑通道',
  'runtime-admin': '技术复核',
  'store-manager': '店长',
};

const panelSchemaLabel: Record<string, string> = {
  'canClaimExternalAutomation:false': '待补资料，不承诺交接待复核',
  cookies: '登录状态',
  eventId: '事件编号',
  externalRunId: '试跑回执编号',
  'external-receipt': '签名回执',
  'private-message text': '私信原文',
  'raw POS rows': '收银明细（不接收）',
  'x-restaurant-agent-signature': '签名回执规则',
};

const panelCheckLabel: Record<string, string> = {
  signature: '签名校验',
  'run-id': '试跑编号核对',
  'public-proof': '公开凭证',
  'business-signal': '经营信号',
  'memory-write': '门店记忆写入',
  'claim-boundary': '承诺边界',
};

const formatPanelStatus = (value: string) => panelStatusLabel[value] || value;
const formatPanelOwner = (value: string) => panelOwnerLabel[value] || value;
const formatPanelSchema = (value: string) => panelSchemaLabel[value] || value;
const formatPanelCheck = (value: string) => panelCheckLabel[value] || value;
const formatPanelGate = (value: boolean | undefined, readyLabel = '资料待复核', blockedLabel = '待补资料') =>
  value ? readyLabel : blockedLabel;
const formatPanelText = (value: string) =>
  formatPanelSchema(value)
    .replaceAll('provider error code', '试跑通道错误说明')
    .replaceAll('signed lead receipt', '线索确认回执')
    .replaceAll('signed external-receipt', '签名回执')
    .replaceAll('external-receipt', '签名回执')
    .replaceAll('x-restaurant-agent-signature', '签名回执规则')
    .replaceAll('eventId', '事件编号')
    .replaceAll('externalRunId', '试跑回执编号')
    .replaceAll('runId', '试跑编号')
    .replaceAll('receiptId', '回执编号')
    .replaceAll('canClaimExternalAutomation:false', '待补资料，不承诺交接待复核')
    .replaceAll('已验收', '待复核')
    .replaceAll('凭证可用', '凭证待复核')
    .replaceAll('raw POS rows', '收银明细（不接收）')
    .replaceAll('private-message text', '私信原文')
    .replaceAll('cookies', '登录状态')
    .replaceAll('cookie', '登录状态');
const formatPanelTextList = (values: string[] | undefined, emptyLabel = '无') =>
  values?.length ? values.map(formatPanelText).join(' / ') : emptyLabel;

export function RestaurantProviderReceiptAcceptancePanel({ consoleData }: { consoleData?: RestaurantProviderReceiptAcceptanceConsole }) {
  const checks = consoleData?.validationChecks || fallbackChecks;

  return (
    <div className="mt-3 border border-emerald-200/15 bg-emerald-200/[0.035] p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/65">回执复核台</div>
          <p className="mt-1 text-xs font-black text-white">签名回执校验、凭证复核、经营信号提取和下一轮记忆门槛。</p>
          <p className="mt-1 text-[11px] leading-4 text-emerald-100/55">运行状态: {consoleData?.run.runId ? '已生成' : '待生成'} / 结论: {formatPanelStatus(consoleData?.verdict || 'blocked-before-dispatch')}</p>
        </div>
        <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">训练下一轮</div>
          <div className="mt-1 text-xs font-black text-white">{formatPanelGate(consoleData?.summary.canTrainNextRun, '凭证待复核', '待补凭证')}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-6">
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">检查项</div>
          <div className="mt-1 text-xs font-black text-emerald-100/75">{consoleData?.summary.checks ?? 7}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">可复核</div>
          <div className="mt-1 text-xs font-black text-emerald-100/75">{consoleData?.summary.ready ?? 0}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">等待</div>
          <div className="mt-1 text-xs font-black text-sky-100/75">{consoleData?.summary.waiting ?? 2}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">受阻</div>
          <div className="mt-1 text-xs font-black text-rose-100/75">{consoleData?.summary.blocked ?? 4}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待复核</div>
          <div className="mt-1 text-xs font-black text-lime-100/75">{consoleData?.summary.acceptedReceipts ?? 0}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">边界</div>
          <div className="mt-1 text-xs font-black text-white">{formatPanelGate(consoleData?.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 lg:grid-cols-7">
        {checks.map(item => (
          <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-white">{formatPanelCheck(item.id)}</span>
              <span className={item.status === 'accepted' ? 'text-[10px] text-lime-100/70' : item.status === 'ready' ? 'text-[10px] text-emerald-100/70' : item.status === 'waiting' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatPanelStatus(item.status)}</span>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-emerald-100/55">负责人: {formatPanelOwner(item.owner)}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/45">{formatPanelTextList(item.evidence.slice(0, 3))}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/55">{formatPanelText(item.nextAction)}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-emerald-100/55">
        回执: {formatPanelText(consoleData?.callbackContract.action || 'external-receipt')} / {formatPanelText(consoleData?.callbackContract.requiredHeader || 'x-restaurant-agent-signature')} / 记忆写入 {consoleData?.closeoutTraining.memoryWriteAllowed ? '允许' : '待补凭证'} / 禁止写入 {formatPanelTextList((consoleData?.closeoutTraining.forbiddenWrites || ['登录状态', '私信原文', '收银明细（不接收）']).slice(0, 4))}
      </p>
    </div>
  );
}

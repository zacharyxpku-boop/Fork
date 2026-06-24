'use client';

import type { RestaurantProviderRunPacket } from '@/lib/restaurant-provider-run-packet';

const fallbackChecklist = [
  { id: 'provider-response', status: 'blocked', owner: 'provider', evidence: ['HTTP 200/201/202', 'runId 或 taskId'], nextAction: '返回稳定的运行编号。' },
  { id: 'signed-callback', status: 'blocked', owner: 'runtime-admin', evidence: ['签名回执', '签名'], nextAction: '校验回执签名。' },
  { id: 'public-proof', status: 'waiting', owner: 'ops', evidence: ['公开凭证链接', '截图编号'], nextAction: '只接受公开凭证。' },
  { id: 'memory-training', status: 'blocked', owner: 'store-manager', evidence: ['仅限待复核凭证'], nextAction: '凭证复核前不写记忆。' },
  { id: 'claim-boundary', status: 'blocked', owner: 'ops', evidence: ['canClaimExternalAutomation:false'], nextAction: '资料不齐先保持待补。' },
];

const panelStatusLabel: Record<string, string> = {
  blocked: '待补资料',
  'blocked-missing-scope': '待补授权范围',
  missing: '待补资料',
  ready: '可复核',
  selected: '待复核',
  waiting: '等待中',
};

const panelOwnerLabel: Record<string, string> = {
  ops: '运营',
  provider: '试跑通道',
  'runtime-admin': '技术复核',
  'store-manager': '店长',
};

const panelSchemaLabel: Record<string, string> = {
  cookies: '登录状态',
  'external-receipt': '签名回执',
  'HTTP 200/201/202': '试跑通道稳定响应',
  'runId 或 taskId': '试跑编号',
  'runId or taskId': '试跑编号',
  'canClaimExternalAutomation:false': '待补资料，不承诺交接待复核',
  'private-message text': '私信原文',
  'raw POS rows': '收银明细（不接收）',
  'x-restaurant-agent-signature': '签名回执规则',
};

const panelChecklistLabel: Record<string, string> = {
  'provider-response': '试跑通道回执',
  'signed-callback': '签名回执',
  'public-proof': '公开凭证',
  'memory-training': '门店记忆训练',
  'claim-boundary': '承诺边界',
};

const formatPanelStatus = (value: string) => panelStatusLabel[value] || value;
const formatPanelOwner = (value: string) => panelOwnerLabel[value] || value;
const formatPanelSchema = (value: string) => panelSchemaLabel[value] || value;
const formatPanelChecklist = (value: string) => panelChecklistLabel[value] || value;
const formatPanelGate = (value: boolean | undefined, readyLabel = '资料待复核', blockedLabel = '待补资料') =>
  value ? readyLabel : blockedLabel;
const formatPanelSchemaList = (values: string[] | undefined, emptyLabel = '无') =>
  values?.length ? values.map(formatPanelSchema).join(' / ') : emptyLabel;

export function RestaurantProviderRunPacketPanel({ providerRunPacket }: { providerRunPacket?: RestaurantProviderRunPacket }) {
  const checklist = providerRunPacket?.acceptanceChecklist || fallbackChecklist;

  return (
    <div className="mt-3 border border-blue-200/15 bg-blue-200/[0.035] p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-blue-100/65">试跑交接包</div>
          <p className="mt-1 text-xs font-black text-white">一次试跑交接的约定：交接格式、回执样例、验收清单和禁止字段。</p>
          <p className="mt-1 text-[11px] leading-4 text-blue-100/55">提交通道: 服务端试跑通道配置项 / 结论: {formatPanelStatus(providerRunPacket?.verdict || 'blocked-missing-scope')}</p>
        </div>
        <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">试跑交接</div>
          <div className="mt-1 text-xs font-black text-white">{formatPanelGate(providerRunPacket?.summary.canSubmitRealProviderNow)}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-6">
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">目标</div>
          <div className="mt-1 text-xs font-black text-blue-100/75">试跑通道</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">任务包</div>
          <div className="mt-1 text-xs font-black text-white">{providerRunPacket?.summary.packageSelected ? '待复核' : '待补资料'}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">授权范围</div>
          <div className="mt-1 text-xs font-black text-white">{providerRunPacket?.summary.scopeSelected ? '待复核' : '待补资料'}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">模拟器</div>
          <div className="mt-1 text-xs font-black text-sky-100/75">{formatPanelGate(providerRunPacket?.summary.canSubmitSimulatorNow, '样例可先准备')}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">回执</div>
          <div className="mt-1 text-xs font-black text-white">{formatPanelSchema(providerRunPacket?.callbackReceiptExample.requiredHeader || 'x-restaurant-agent-signature')}</div>
        </div>
        <div className="border border-white/10 bg-stone-950/45 p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">边界</div>
          <div className="mt-1 text-xs font-black text-white">{formatPanelGate(providerRunPacket?.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
        </div>
      </div>
      <div className="mt-3 grid gap-2 lg:grid-cols-5">
        {checklist.map(item => (
          <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black text-white">{formatPanelChecklist(item.id)}</span>
              <span className={item.status === 'ready' ? 'text-[10px] text-emerald-100/70' : item.status === 'waiting' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatPanelStatus(item.status)}</span>
            </div>
            <p className="mt-1 text-[11px] leading-4 text-blue-100/55">负责人: {formatPanelOwner(item.owner)}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/45">{formatPanelSchemaList(item.evidence.slice(0, 3))}</p>
            <p className="mt-1 text-[11px] leading-4 text-white/55">{item.nextAction}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-blue-100/55">
        交接内容预览: 脱敏任务包 / 发布凭证能力 / 禁止字段 {formatPanelSchemaList((providerRunPacket?.request.forbiddenFields || ['cookies', '私信原文', '收银明细（不接收）']).slice(0, 4))}
      </p>
    </div>
  );
}

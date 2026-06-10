import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import type { RestaurantProviderSetupStateSummary } from '@/lib/restaurant-provider-setup-state-store';

export type RestaurantProviderUnlockStage =
  | 'internal-ready'
  | 'setup-evidence-signed'
  | 'provider-health-ready'
  | 'external-blocked';

export type RestaurantProviderUnlockLadderItem = {
  id: 'persistent-browser' | 'auto-publish-proof' | 'auto-lead-capture' | 'coupon-redemption' | 'operating-analysis' | 'memory-follow-up';
  label: string;
  stage: RestaurantProviderUnlockStage;
  internalCanDo: string;
  setupEvidence: string[];
  providerEvidence: string[];
  stillNeeds: string[];
  nextAction: string;
};

export type RestaurantProviderUnlockLadder = {
  ok: true;
  payloadShape: 'restaurant-provider-unlock-ladder-v1';
  summary: {
    capabilities: number;
    providerHealthReady: number;
    setupEvidenceSigned: number;
    internalReady: number;
    externalBlocked: number;
    canClaimExternalAutomation: boolean;
  };
  items: RestaurantProviderUnlockLadderItem[];
  nextExternalAsks: string[];
  safetyBoundary: string;
};

function includesAny(values: string[], fragments: string[]) {
  const normalized = values.map(value => value.toLowerCase());
  return fragments.some(fragment => normalized.some(value => value.includes(fragment.toLowerCase())));
}

function evidenceForSetup(
  provided: RestaurantProviderSetupStateSummary['provided'],
  fragments: string[],
) {
  return [
    ...provided.envKeys.filter(value => includesAny([value], fragments)),
    ...provided.merchantApprovals.filter(value => includesAny([value], fragments)),
    ...provided.dataContracts.filter(value => includesAny([value], fragments)),
  ].slice(0, 6);
}

function healthEvidenceFor(
  health: RestaurantProviderReadinessHealth,
  fragments: string[],
) {
  return health.items
    .filter(item => item.status === 'health-ready' && (
      includesAny([item.id, item.label, item.category], fragments) ||
      includesAny(item.unlocks, fragments)
    ))
    .flatMap(item => item.configuredEvidence.length ? item.configuredEvidence : [item.label])
    .slice(0, 6);
}

function missingFor(
  health: RestaurantProviderReadinessHealth,
  fragments: string[],
) {
  return health.items
    .filter(item => item.status !== 'health-ready' && (
      includesAny([item.id, item.label, item.category], fragments) ||
      includesAny(item.unlocks, fragments)
    ))
    .flatMap(item => item.missingEvidence.length ? item.missingEvidence : [item.nextAction])
    .slice(0, 6);
}

function stageFor(input: {
  providerEvidence: string[];
  setupEvidence: string[];
  stillNeeds: string[];
}): RestaurantProviderUnlockStage {
  if (input.providerEvidence.length > 0 && input.stillNeeds.length === 0) return 'provider-health-ready';
  if (input.setupEvidence.length > 0) return 'setup-evidence-signed';
  if (input.stillNeeds.length > 0) return 'external-blocked';
  return 'internal-ready';
}

function item(input: {
  id: RestaurantProviderUnlockLadderItem['id'];
  label: string;
  fragments: string[];
  internalCanDo: string;
  setupState: RestaurantProviderSetupStateSummary;
  health: RestaurantProviderReadinessHealth;
  fallbackAsk: string;
}): RestaurantProviderUnlockLadderItem {
  const setupEvidence = evidenceForSetup(input.setupState.provided, input.fragments);
  const providerEvidence = healthEvidenceFor(input.health, input.fragments);
  const stillNeeds = missingFor(input.health, input.fragments);
  const stage = stageFor({ providerEvidence, setupEvidence, stillNeeds });
  return {
    id: input.id,
    label: input.label,
    stage,
    internalCanDo: input.internalCanDo,
    setupEvidence,
    providerEvidence,
    stillNeeds: stillNeeds.length ? stillNeeds : providerEvidence.length ? [] : [input.fallbackAsk],
    nextAction: stage === 'provider-health-ready'
      ? '只通过受控执行包和签名回执做试点。'
      : stage === 'setup-evidence-signed'
        ? '把已签收的配置凭证落成真实服务端配置、限定范围的外部授权和健康探测。'
        : input.fallbackAsk,
  };
}

export function buildRestaurantProviderUnlockLadder(input: {
  setupState: RestaurantProviderSetupStateSummary;
  health: RestaurantProviderReadinessHealth;
}): RestaurantProviderUnlockLadder {
  const items = [
    item({
      id: 'persistent-browser',
      label: '常驻浏览器代办',
      fragments: ['openclaw', 'hermes', 'lobu', 'browser', 'runtime'],
      internalCanDo: '生成受控任务包、恢复手册和凭证要求。',
      fallbackAsk: '通过服务端配置提供 OpenClaw/Hermes/Lobu 的通道地址和账号密钥。',
      setupState: input.setupState,
      health: input.health,
    }),
    item({
      id: 'auto-publish-proof',
      label: '代发布和凭证回收',
      fragments: ['merchant', 'platform', 'authorization', 'callback', 'proof', 'receipt'],
      internalCanDo: '可先准备渠道文案、员工清单和凭证台账，不宣称已发布。',
      fallbackAsk: '提供限定范围的店长平台授权和签名凭证回执。',
      setupState: input.setupState,
      health: input.health,
    }),
    item({
      id: 'auto-lead-capture',
      label: '代接线索',
      fragments: ['merchant', 'platform', 'authorization', 'staff', 'social'],
      internalCanDo: '把导入的咨询、预约和到店意向归类成店长任务。',
      fallbackAsk: '提供平台收件箱/线索导出权限，或确认人工导入节奏。',
      setupState: input.setupState,
      health: input.health,
    }),
    item({
      id: 'coupon-redemption',
      label: '券码核销对账',
      fragments: ['pos', 'coupon', 'redemption', 'operating-data'],
      internalCanDo: '接收去隐私汇总导入，对账领取数和核销数。',
      fallbackAsk: '提供 POS/券码字段表、导出节奏和去隐私样例格式。',
      setupState: input.setupState,
      health: input.health,
    }),
    item({
      id: 'operating-analysis',
      label: '真实经营分析',
      fragments: ['pos', 'operating', 'data', 'analysis'],
      internalCanDo: '把方向性观察和可量化的经营信号分开。',
      fallbackAsk: '提供销售、核销、桌位/订单和活动来源的汇总字段。',
      setupState: input.setupState,
      health: input.health,
    }),
    item({
      id: 'memory-follow-up',
      label: '门店记忆跟进循环',
      fragments: ['hermes', 'memory', 'follow-up', 'staff'],
      internalCanDo: '保留脱敏任务、唤醒、下一步和负责人交接历史。',
      fallbackAsk: '自动跟进前先提供常驻通道和员工下发渠道。',
      setupState: input.setupState,
      health: input.health,
    }),
  ];
  const count = (stage: RestaurantProviderUnlockStage) => items.filter(item => item.stage === stage).length;
  return {
    ok: true,
    payloadShape: 'restaurant-provider-unlock-ladder-v1',
    summary: {
      capabilities: items.length,
      providerHealthReady: count('provider-health-ready'),
      setupEvidenceSigned: count('setup-evidence-signed'),
      internalReady: count('internal-ready'),
      externalBlocked: count('external-blocked'),
      canClaimExternalAutomation: input.health.summary.canEnableExternalAutomation && items.every(item => item.stage === 'provider-health-ready'),
    },
    items,
    nextExternalAsks: Array.from(new Set(items.flatMap(item => item.stillNeeds))).slice(0, 8),
    safetyBoundary: 'Unlock Ladder distinguishes internal readiness, signed setup evidence and live provider health. It never treats remembered evidence as real automation, and never exposes secrets, cookies, raw profiles, private messages, customer identifiers, coupon codes or POS rows.',
  };
}

import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';

export type RestaurantWatcherLaneStatus = 'armed' | 'manual-only' | 'needs-external';
export type RestaurantWatcherWakeupPriority = 'high' | 'medium' | 'low';

export type RestaurantWatcherLane = {
  id: string;
  source: 'run-ledger' | 'receipt-ledger' | 'browser-session' | 'merchant-grant';
  trigger: string;
  status: RestaurantWatcherLaneStatus;
  cadence: string;
  internalAction: string;
  externalRequirement: string;
  memoryWrite: string;
  safetyBoundary: string;
};

export type RestaurantWatcherWakeup = {
  id: string;
  priority: RestaurantWatcherWakeupPriority;
  eventId: string;
  owner: string;
  reason: string;
  nextAction: string;
  memoryWrite: string;
  evidenceRequired: string;
};

export type RestaurantWatcherMemoryUpsert = {
  entity: 'Restaurant' | 'Offer' | 'LeadSignal' | 'ExecutionRun';
  key: string;
  signal: string;
  confidence: 'confirmed' | 'needs-proof' | 'blocked';
  writeScope: string;
  nextUse: string;
};

export type RestaurantAgentWatcherPolicy = {
  ok: true;
  policyId: string;
  lanes: RestaurantWatcherLane[];
  wakeups: RestaurantWatcherWakeup[];
  memoryUpserts: RestaurantWatcherMemoryUpsert[];
  blockedExternal: string[];
  summary: {
    lanes: number;
    armed: number;
    needsExternal: number;
    wakeups: number;
    highPriority: number;
    memoryUpserts: number;
  };
  safetyBoundary: string;
};

function stableId(input: string): string {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 37 + input.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function laneSet(): RestaurantWatcherLane[] {
  return [
    {
      id: 'publish-receipt-watcher',
      source: 'receipt-ledger',
      trigger: '发布链接、截图、contentId 或 externalRunId 写回',
      status: 'armed',
      cadence: 'receipt-write',
      internalAction: '校验证据、更新 run health、写入发布素材记忆并生成下一步经营动作。',
      externalRequirement: '真实平台发布链接、截图或 signed runtime callback。',
      memoryWrite: 'Restaurant/Offer 的可复用素材、渠道、负责人、证据等级。',
      safetyBoundary: '只处理公开发布证明和脱敏摘要，不读取私信原文。',
    },
    {
      id: 'lead-signal-watcher',
      source: 'receipt-ledger',
      trigger: '预约、领券、私域跟进或到店意向回执写回',
      status: 'armed',
      cadence: 'receipt-write',
      internalAction: '把线索数量和来源转成 LeadSignal 记忆、负责人提醒和下一轮跟进。',
      externalRequirement: '平台回执、社群脱敏统计或运营手工导入。',
      memoryWrite: 'LeadSignal 的来源、数量、时间窗、下一步。',
      safetyBoundary: '不保存手机号、微信号、私信全文或可识别个人身份信息。',
    },
    {
      id: 'blocked-run-watcher',
      source: 'run-ledger',
      trigger: 'runtime blocked、missing auth、missing callback 或 missing profile',
      status: 'armed',
      cadence: 'heartbeat',
      internalAction: '生成配置缺口、负责人、最小解锁路径和人工兜底动作。',
      externalRequirement: 'runtime URL/key、商家授权、隔离浏览器 profile、callback secret。',
      memoryWrite: 'ExecutionRun 的阻断原因、责任人和恢复动作。',
      safetyBoundary: '不自动重试平台登录，不绕过验证码或账号授权。',
    },
    {
      id: 'pos-redemption-watcher',
      source: 'merchant-grant',
      trigger: '核销表、POS 摘要或库存字段进入系统',
      status: 'manual-only',
      cadence: 'manual-import',
      internalAction: '只在授权数据导入后做核销、客单、库存压力和下轮活动建议。',
      externalRequirement: 'POS API、CSV/sheet 导出、字段字典、核销来源。',
      memoryWrite: 'Offer 的核销表现、库存风险和复盘建议。',
      safetyBoundary: '没有真实 POS 数据前不声称自动核销或实时经营分析。',
    },
    {
      id: 'browser-session-watcher',
      source: 'browser-session',
      trigger: 'OpenClaw/Hermes session ready、expired、heartbeat missing',
      status: 'needs-external',
      cadence: 'session-heartbeat',
      internalAction: '当前只能登记 session manifest/registry 和恢复动作。',
      externalRequirement: '真实外部浏览器执行器、持久 profile、心跳回调。',
      memoryWrite: 'ExecutionRun 的 session 状态和可执行工具摘要。',
      safetyBoundary: '不保存 cookie、token、验证码、密码或商家后台原始数据。',
    },
  ];
}

function buildWakeupFromRun(run: RestaurantAgentRunRecord, acceptedEventIds: Set<string>, rejectedEventIds: Set<string>): RestaurantWatcherWakeup {
  if (acceptedEventIds.has(run.eventId)) {
    return {
      id: `watch-${stableId(`${run.eventId}-accepted`)}`,
      priority: 'low',
      eventId: run.eventId,
      owner: run.owner,
      reason: '任务已有 accepted 回执，可以进入复盘和记忆写回。',
      nextAction: '抽取可复用卖点、渠道表现、负责人和下轮活动建议。',
      memoryWrite: `${run.restaurant} / ${run.offer} 的 confirmed 经营记忆。`,
      evidenceRequired: 'accepted receipt、发布链接、截图或 externalRunId。',
    };
  }

  if (rejectedEventIds.has(run.eventId)) {
    return {
      id: `watch-${stableId(`${run.eventId}-rejected`)}`,
      priority: 'high',
      eventId: run.eventId,
      owner: run.owner,
      reason: '回执被证据门拒收，不能进入经营分析。',
      nextAction: '补真实发布链接、截图、externalRunId 或改为人工复核。',
      memoryWrite: `${run.restaurant} / ${run.offer} 的 proof gap。`,
      evidenceRequired: '非样例链接、匹配 eventId 的截图或 signed callback。',
    };
  }

  if (run.status === 'blocked') {
    return {
      id: `watch-${stableId(`${run.eventId}-blocked`)}`,
      priority: 'high',
      eventId: run.eventId,
      owner: '技术 / 运营负责人',
      reason: `${run.target} 执行条件未满足。`,
      nextAction: run.nextAction,
      memoryWrite: `${run.restaurant} 的 external blocker 和最小解锁路径。`,
      evidenceRequired: 'runtime URL/API key、profile、callback secret、商家授权。',
    };
  }

  if (run.status === 'forwarded') {
    return {
      id: `watch-${stableId(`${run.eventId}-forwarded`)}`,
      priority: 'medium',
      eventId: run.eventId,
      owner: run.owner,
      reason: '外部 runtime 已接收但尚未写回可验证回执。',
      nextAction: '等待 signed callback；超时后改为人工补证据或恢复计划。',
      memoryWrite: `${run.restaurant} 的 waiting receipt 状态。`,
      evidenceRequired: 'externalRunId、发布链接、截图或失败原因。',
    };
  }

  return {
    id: `watch-${stableId(`${run.eventId}-queued`)}`,
    priority: 'medium',
    eventId: run.eventId,
    owner: run.owner,
    reason: '本地任务已入队，但没有外部回执。',
    nextAction: '交给 runtime bridge 或补手工发布证明。',
    memoryWrite: `${run.restaurant} / ${run.offer} 的 queued 待证据状态。`,
    evidenceRequired: run.evidenceRequired,
  };
}

function memoryUpsertsFromReceipts(receipts: RestaurantAgentReceiptRecord[]): RestaurantWatcherMemoryUpsert[] {
  return receipts.slice(0, 8).map(receipt => ({
    entity: receipt.signalType === 'publish-proof' ? 'Offer' : 'LeadSignal',
    key: `${receipt.eventId}:${receipt.channel}`,
    signal: receipt.status === 'accepted'
      ? `${receipt.channel} ${receipt.signalType || 'receipt'} accepted；证据 ${receipt.evidenceLevel || 'unscored'} / ${receipt.evidenceScore ?? 0}。`
      : `${receipt.channel} receipt rejected；${receipt.rejectedReason || '需要补证据'}。`,
    confidence: receipt.status === 'accepted' ? 'confirmed' : 'needs-proof',
    writeScope: '脱敏业务摘要、渠道、证据等级、负责人和下一步动作。',
    nextUse: receipt.status === 'accepted' ? '进入经营信号聚合和下一轮活动建议。' : '进入恢复计划，不进入经营分析。',
  }));
}

export function buildRestaurantAgentWatcherPolicy(input: {
  runs: RestaurantAgentRunRecord[];
  receipts?: RestaurantAgentReceiptRecord[];
}): RestaurantAgentWatcherPolicy {
  const receipts = input.receipts || [];
  const acceptedEventIds = new Set(receipts.filter(receipt => receipt.status === 'accepted').map(receipt => receipt.eventId));
  const rejectedEventIds = new Set(receipts.filter(receipt => receipt.status === 'rejected').map(receipt => receipt.eventId));
  const wakeups = input.runs.slice(0, 8).map(run => buildWakeupFromRun(run, acceptedEventIds, rejectedEventIds));
  const lanes = laneSet();
  const memoryUpserts = [
    ...memoryUpsertsFromReceipts(receipts),
    ...wakeups.slice(0, 5).map(wakeup => ({
      entity: 'ExecutionRun' as const,
      key: wakeup.eventId,
      signal: wakeup.reason,
      confidence: wakeup.priority === 'high' ? 'blocked' as const : 'needs-proof' as const,
      writeScope: '事件状态、负责人、下一步动作和证据要求。',
      nextUse: 'Heartbeat、recovery 和 run health 的主动跟进。',
    })),
  ];

  if (wakeups.length === 0) {
    wakeups.push({
      id: 'watch-bootstrap',
      priority: 'low',
      eventId: 'no-run-yet',
      owner: '运营',
      reason: '还没有可监听的餐饮 Agent run。',
      nextAction: '先生成本地 Agent 任务或导入一条真实回执。',
      memoryWrite: 'bootstrap 状态，不写经营结论。',
      evidenceRequired: 'eventId、tenantId、任务和负责人。',
    });
  }

  return {
    ok: true,
    policyId: `restaurant-watcher-${stableId([...wakeups.map(item => item.id), ...receipts.map(item => item.receiptId)].join('|'))}`,
    lanes,
    wakeups,
    memoryUpserts,
    blockedExternal: [
      'platform webhooks require merchant account authorization',
      'browser session heartbeat requires OpenClaw/Hermes runtime',
      'POS redemption watcher requires POS export/API and field dictionary',
      'private message raw text remains forbidden',
    ],
    summary: {
      lanes: lanes.length,
      armed: lanes.filter(lane => lane.status === 'armed').length,
      needsExternal: lanes.filter(lane => lane.status === 'needs-external').length,
      wakeups: wakeups.length,
      highPriority: wakeups.filter(wakeup => wakeup.priority === 'high').length,
      memoryUpserts: memoryUpserts.length,
    },
    safetyBoundary: 'Watcher policy 只处理本地 run、签名回执、手工导入和脱敏摘要；没有 runtime/账号/POS/商家授权时不自动发布、不自动核销、不读取私信或后台明细。',
  };
}

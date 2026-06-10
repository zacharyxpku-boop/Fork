import type { RestaurantAiEmployeeInbox } from '@/lib/restaurant-ai-employee-inbox';
import type { RestaurantProviderUnlockLadder } from '@/lib/restaurant-provider-unlock-ladder';
import type { RestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';

export type RestaurantGmCommandLaneStatus =
  | 'ai-can-run-internal'
  | 'staff-review'
  | 'provider-required'
  | 'evidence-required';

export type RestaurantGmCommandLane = {
  id: 'opening' | 'demand' | 'publish-proof' | 'service-window' | 'closeout';
  title: string;
  status: RestaurantGmCommandLaneStatus;
  owner: 'ai-employee' | 'store-manager' | 'ops' | 'runtime-admin' | 'finance';
  customerPromise: string;
  actionNow: string;
  visibleProof: string;
  providerAsk: string;
  stopLine: string;
};

export type RestaurantGmCommandDeck = {
  ok: true;
  payloadShape: 'restaurant-gm-command-deck-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  shiftMode: 'pre-open' | 'live-service' | 'closeout-review';
  answerForOwner: string;
  summary: {
    lanes: number;
    aiCanRunInternal: number;
    staffReview: number;
    providerRequired: number;
    evidenceRequired: number;
    canRunWithoutProvider: boolean;
    canClaimExternalAutomation: boolean;
  };
  lanes: RestaurantGmCommandLane[];
  aiAutopilotQueue: string[];
  staffQueue: string[];
  providerQueue: string[];
  evidenceQueue: string[];
  safetyBoundary: string;
};

type DeckInput = {
  restaurant: string;
  offer: string;
  storeManagerTaskQueue: Pick<RestaurantStoreManagerTaskQueue, 'summary' | 'tasks' | 'nextAction'>;
  aiEmployeeInbox: Pick<RestaurantAiEmployeeInbox, 'summary' | 'messages' | 'memory' | 'nextWakeup'>;
  providerUnlockLadder: Pick<RestaurantProviderUnlockLadder, 'summary' | 'items' | 'nextExternalAsks'>;
  now?: Date;
};

function countStatus(lanes: RestaurantGmCommandLane[], status: RestaurantGmCommandLaneStatus) {
  return lanes.filter(lane => lane.status === status).length;
}

function findUnlock(input: DeckInput, id: RestaurantProviderUnlockLadder['items'][number]['id']) {
  return input.providerUnlockLadder.items.find(item => item.id === id);
}

function providerStatus(unlock: RestaurantProviderUnlockLadder['items'][number] | undefined): RestaurantGmCommandLaneStatus {
  if (!unlock) return 'provider-required';
  if (unlock.stage === 'provider-health-ready') return 'ai-can-run-internal';
  if (unlock.stage === 'setup-evidence-signed') return 'staff-review';
  return 'provider-required';
}

function providerAsk(unlock: RestaurantProviderUnlockLadder['items'][number] | undefined, fallback: string) {
  if (!unlock) return fallback;
  return unlock.stillNeeds.slice(0, 2).join(' / ') || unlock.nextAction;
}

function unique(values: string[], limit = 8) {
  return Array.from(new Set(values.map(value => value.trim()).filter(Boolean))).slice(0, limit);
}

export function buildRestaurantGmCommandDeck(input: DeckInput): RestaurantGmCommandDeck {
  const now = input.now || new Date();
  const publishUnlock = findUnlock(input, 'auto-publish-proof');
  const leadUnlock = findUnlock(input, 'auto-lead-capture');
  const redemptionUnlock = findUnlock(input, 'coupon-redemption');
  const analysisUnlock = findUnlock(input, 'operating-analysis');
  const memoryUnlock = findUnlock(input, 'memory-follow-up');
  const task = input.storeManagerTaskQueue.tasks[0];
  const inboxMessage = input.aiEmployeeInbox.messages[0];
  const lanes: RestaurantGmCommandLane[] = [
    {
      id: 'opening',
      title: '开班指令',
      status: 'ai-can-run-internal',
      owner: 'ai-employee',
      customerPromise: '推流前门店已确认活动内容、负责人、服务时段和凭证要求。',
      actionNow: inboxMessage?.title || '从脱敏门店事实生成早班简报、任务负责人和停止线。',
      visibleProof: input.aiEmployeeInbox.memory.map(item => `${item.label}:${item.value}`).slice(0, 3).join(' / ') || '记忆卡片和负责人清单',
      providerAsk: providerAsk(memoryUnlock, '自动跟进前需要持久试跑通道和员工下发渠道。'),
      stopLine: '开班期间不触达外部账号，店长授权和员工渠道未配置前不执行任何外部动作。',
    },
    {
      id: 'demand',
      title: '获客与线索承接',
      status: providerStatus(leadUnlock),
      owner: leadUnlock?.stage === 'provider-health-ready' ? 'ai-employee' : 'store-manager',
      customerPromise: '预约、领券、私信和到店意向变成店长可见的跟进任务。',
      actionNow: task?.action || input.storeManagerTaskQueue.nextAction,
      visibleProof: task?.evidenceRequired || '已验收公开凭证、导入线索汇总或员工确认',
      providerAsk: providerAsk(leadUnlock, '需要平台收件箱/导出权限或经批准的人工导入节奏。'),
      stopLine: '不读取私信、不存储顾客标识、无授权来源凭证前不宣称自动获客。',
    },
    {
      id: 'publish-proof',
      title: '发布与凭证',
      status: providerStatus(publishUnlock),
      owner: publishUnlock?.stage === 'provider-health-ready' ? 'runtime-admin' : 'ops',
      customerPromise: '本地内容只通过已审批渠道发布，并以公开链接、截图或签名回执关闭。',
      actionNow: '准备一个受控渠道包，在进入下一个渠道前收齐回执。',
      visibleProof: publishUnlock?.providerEvidence.join(' / ') || publishUnlock?.setupEvidence.join(' / ') || '公开链接、截图 id 或签名回执',
      providerAsk: providerAsk(publishUnlock, '需要限定范围的店长平台授权和签名凭证回调。'),
      stopLine: '外部通道健康、店长授权和签名回执全部就绪前不宣称自动发布。',
    },
    {
      id: 'service-window',
      title: '服务时段巡视',
      status: redemptionUnlock?.stage === 'provider-health-ready' ? 'ai-can-run-internal' : 'staff-review',
      owner: 'store-manager',
      customerPromise: 'AI 以任务形式监控库存、券码压力和服务风险，不直接改写 POS。',
      actionNow: '在用餐时段审查券码领取压力、低库存提示和员工恢复队列。',
      visibleProof: redemptionUnlock?.setupEvidence.join(' / ') || '员工确认、券码规则截图和核销汇总备注',
      providerAsk: providerAsk(redemptionUnlock, '需要 POS/券码核销字段字典和去隐私汇总导入。'),
      stopLine: '不从此操作台做券码变更、收款、配送、电话接听或 POS 写入。',
    },
    {
      id: 'closeout',
      title: '收尾与下一轮',
      status: analysisUnlock?.stage === 'provider-health-ready' ? 'ai-can-run-internal' : 'evidence-required',
      owner: 'finance',
      customerPromise: '当天以可量化凭证、未解问题和明日动作收尾，不虚报增长数字。',
      actionNow: '分离公开凭证、线索计数、核销汇总和下一轮渠道任务。',
      visibleProof: analysisUnlock?.providerEvidence.join(' / ') || analysisUnlock?.setupEvidence.join(' / ') || '脱敏 POS/券码/会员汇总和字段字典',
      providerAsk: providerAsk(analysisUnlock, '需要汇总销售、核销、订单和活动来源字段。'),
      stopLine: '无汇总经营数据合同和已验收凭证，不宣称真实经营分析。',
    },
  ];

  const aiAutopilotQueue = unique(lanes
    .filter(lane => lane.status === 'ai-can-run-internal')
    .map(lane => `${lane.title}: ${lane.actionNow}`));
  const staffQueue = unique(lanes
    .filter(lane => lane.status === 'staff-review' || lane.status === 'evidence-required')
    .map(lane => `${lane.title}: ${lane.visibleProof}`));
  const providerQueue = unique([
    ...lanes.filter(lane => lane.status === 'provider-required').map(lane => `${lane.title}: ${lane.providerAsk}`),
    ...input.providerUnlockLadder.nextExternalAsks,
  ], 10);
  const evidenceQueue = unique(lanes.map(lane => `${lane.title}: ${lane.visibleProof}`), 10);
  const providerRequired = countStatus(lanes, 'provider-required');
  const evidenceRequired = countStatus(lanes, 'evidence-required');

  return {
    ok: true,
    payloadShape: 'restaurant-gm-command-deck-v1',
    generatedAt: now.toISOString(),
    restaurant: input.restaurant,
    offer: input.offer,
    shiftMode: providerRequired > 2 ? 'pre-open' : evidenceRequired > 0 ? 'closeout-review' : 'live-service',
    answerForOwner: providerRequired > 0
      ? '今天可以作为内部 AI 店长使用，外部自动化还需要外部通道健康、店长授权和数据合同。'
      : '内部指挥台可以跑完整班次循环，每个外部动作都要有签名回执和凭证。',
    summary: {
      lanes: lanes.length,
      aiCanRunInternal: countStatus(lanes, 'ai-can-run-internal'),
      staffReview: countStatus(lanes, 'staff-review'),
      providerRequired,
      evidenceRequired,
      canRunWithoutProvider: aiAutopilotQueue.length > 0,
      canClaimExternalAutomation: input.providerUnlockLadder.summary.canClaimExternalAutomation && providerRequired === 0 && evidenceRequired === 0,
    },
    lanes,
    aiAutopilotQueue,
    staffQueue,
    providerQueue,
    evidenceQueue,
    safetyBoundary: '店总指挥台是脱敏任务、员工审核、外部条件和凭证队列上的班次指令面。不登录账号、不发布、不读取私信、不核销券码、不写入 POS 订单、不收款、不派送、不暴露密钥、不存储顾客标识、不拉取原始 POS 行、无已验收凭证不宣称增长。',
  };
}

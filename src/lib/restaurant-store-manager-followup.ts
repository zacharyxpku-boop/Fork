import { buildRestaurantBusinessSignals, type RestaurantBusinessSignalItem } from '@/lib/restaurant-agent-business-signals';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantStoreManagerFollowupTask = {
  id: string;
  owner: 'store-manager' | 'shift-lead' | 'community-ops' | 'runtime-admin';
  priority: 'today' | 'next-shift' | 'blocked';
  restaurant: string;
  offer: string;
  signal: RestaurantBusinessSignalItem['signalType'] | 'setup-gap';
  action: string;
  talkTrack: string;
  evidenceRequired: string;
  dueWindow: string;
  stopLine: string;
};

export type RestaurantStoreManagerFollowupPack = {
  ok: true;
  payloadShape: 'restaurant-store-manager-followup-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  summary: {
    tasks: number;
    today: number;
    nextShift: number;
    blocked: number;
    acceptedReceipts: number;
    visitIntent: number;
    couponClaims: number;
    redemptions: number;
  };
  tasks: RestaurantStoreManagerFollowupTask[];
  managerBrief: string[];
  evidenceLedger: Array<{
    receiptId: string;
    channel: string;
    evidenceLevel: string;
    evidenceScore: number;
    accepted: boolean;
  }>;
  externalRequired: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function taskFromSignal(item: RestaurantBusinessSignalItem): RestaurantStoreManagerFollowupTask {
  if (item.signalType === 'coupon-claim') {
    return {
      id: `followup-${item.receiptId}-coupon`,
      owner: 'community-ops',
      priority: item.signals.couponClaimCount > 0 ? 'today' : 'next-shift',
      restaurant: item.restaurant,
      offer: item.offer,
      signal: item.signalType,
      action: '把领券用户转成到店提醒，确认券面、可用时段、门店路线和排队预期。',
      talkTrack: `${item.offer} 今天可用，建议到店前看清使用时段；如果带朋友来，先确认人数和口味偏好。`,
      evidenceRequired: `${item.channel} accepted receipt ${item.receiptId}; coupon claim aggregate only.`,
      dueWindow: '今日营业高峰前',
      stopLine: '不读取私信原文、手机号、微信号或单个用户核销明细。',
    };
  }
  if (item.signalType === 'redemption') {
    return {
      id: `followup-${item.receiptId}-redemption`,
      owner: 'shift-lead',
      priority: item.signals.redemptionCount > 0 ? 'today' : 'next-shift',
      restaurant: item.restaurant,
      offer: item.offer,
      signal: item.signalType,
      action: '复盘核销摘要和备货压力，调整下一班次出品节奏、券面库存和服务提醒。',
      talkTrack: `${item.offer} 已有核销信号，先确认备货和出餐速度，下一轮不要盲目加券。`,
      evidenceRequired: `${item.channel} accepted receipt ${item.receiptId}; sanitized redemption aggregate.`,
      dueWindow: '本班次收尾前',
      stopLine: '没有 POS 导出或 API 前，不做订单级利润、会员画像或真实财务判断。',
    };
  }
  if (item.signalType === 'reservation') {
    return {
      id: `followup-${item.receiptId}-reservation`,
      owner: 'store-manager',
      priority: 'today',
      restaurant: item.restaurant,
      offer: item.offer,
      signal: item.signalType,
      action: '确认预约承接：桌位、排班、接待话术和到店提醒。',
      talkTrack: `已看到 ${item.offer} 的预约信号，请提前确认到店时间；到店后直接报套餐名即可。`,
      evidenceRequired: `${item.channel} accepted receipt ${item.receiptId}; reservation aggregate only.`,
      dueWindow: '下一餐段开始前',
      stopLine: '不保存顾客姓名、电话、微信或私信原文。',
    };
  }
  if (item.signalType === 'visit-intent') {
    return {
      id: `followup-${item.receiptId}-visit`,
      owner: 'store-manager',
      priority: item.signals.visitIntentCount > 0 ? 'today' : 'next-shift',
      restaurant: item.restaurant,
      offer: item.offer,
      signal: item.signalType,
      action: '把到店意向转成门店接待任务：门口物料、排队说明、推荐加购和二次触达。',
      talkTrack: `${item.offer} 适合今天到店吃；如果赶时间，建议避开最拥挤时段或提前到店。`,
      evidenceRequired: `${item.channel} accepted receipt ${item.receiptId}; visit-intent aggregate.`,
      dueWindow: '今日晚高峰前',
      stopLine: '只能使用聚合意向数，不能反推个人身份或私信内容。',
    };
  }
  return {
    id: `followup-${item.receiptId}-general`,
    owner: 'store-manager',
    priority: item.signals.inquiryCount > 0 ? 'today' : 'next-shift',
    restaurant: item.restaurant,
    offer: item.offer,
    signal: item.signalType,
    action: item.nextAction,
    talkTrack: `${item.offer} 有新的公开回执信号，先确认门店能承接，再决定是否继续放大。`,
    evidenceRequired: `${item.channel} accepted receipt ${item.receiptId}; aggregate signal only.`,
    dueWindow: '下一班次前',
    stopLine: '不把模拟回执、弱证据或未授权平台数据当成真实经营结果。',
  };
}

export function buildRestaurantStoreManagerFollowupPack(input: RestaurantTrialIntake & {
  runs: RestaurantAgentRunRecord[];
  receipts: RestaurantAgentReceiptRecord[];
  now?: Date;
}): RestaurantStoreManagerFollowupPack {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, '试用门店');
  const offer = clean(input.offer, '今日主推套餐');
  const businessSignals = buildRestaurantBusinessSignals(input.runs, input.receipts, now);
  const signalTasks = businessSignals.items.slice(0, 8).map(taskFromSignal);
  const tasks = signalTasks.length ? signalTasks : [{
    id: 'followup-bootstrap-proof',
    owner: 'store-manager' as const,
    priority: 'blocked' as const,
    restaurant,
    offer,
    signal: 'setup-gap' as const,
    action: '先补一条真实公开发布链接、截图或签名 runtime 回执，再生成店长跟进任务。',
    talkTrack: `${offer} 还没有可验收经营信号，先完成一次受控试跑或手工导入公开证据。`,
    evidenceRequired: 'accepted public proof receipt, screenshot id, or signed externalRunId',
    dueWindow: '生成第一条验收回执后',
    stopLine: '没有 accepted receipt 前，不生成经营结论或销售承诺。',
  }];
  const blocked = tasks.filter(task => task.priority === 'blocked').length;
  const nextShift = tasks.filter(task => task.priority === 'next-shift').length;
  const today = tasks.filter(task => task.priority === 'today').length;

  return {
    ok: true,
    payloadShape: 'restaurant-store-manager-followup-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    summary: {
      tasks: tasks.length,
      today,
      nextShift,
      blocked,
      acceptedReceipts: businessSignals.summary.acceptedReceipts,
      visitIntent: businessSignals.summary.visitIntent,
      couponClaims: businessSignals.summary.couponClaims,
      redemptions: businessSignals.summary.redemptions,
    },
    tasks,
    managerBrief: [
      `${restaurant} / ${offer}: ${tasks[0]?.action || '等待第一条可验收回执。'}`,
      `今日任务 ${today} 个，下一班次 ${nextShift} 个，阻断 ${blocked} 个。`,
      '只使用公开回执和脱敏聚合指标；不要读取或复制私信原文、手机号、微信号、订单明细或会员信息。',
    ],
    evidenceLedger: input.receipts.slice(0, 8).map(receipt => ({
      receiptId: receipt.receiptId,
      channel: receipt.channel,
      evidenceLevel: receipt.evidenceLevel,
      evidenceScore: receipt.evidenceScore,
      accepted: receipt.status === 'accepted',
    })),
    externalRequired: [
      'Platform private-message lead summaries require merchant authorization and no raw message storage.',
      'Coupon redemption and POS analysis require sanitized aggregate export, field dictionary, cadence and owner.',
      'Automatic follow-up posting requires isolated browser runtime, merchant grant, callback secret and revocation owner.',
    ],
    safetyBoundary: 'Store Manager Follow-up Pack converts accepted public receipts and aggregate signals into owner tasks. It does not contact customers, publish messages, read private chats, reveal personal data, redeem coupons, pull POS rows, or claim true operating impact without merchant-authorized data.',
  };
}

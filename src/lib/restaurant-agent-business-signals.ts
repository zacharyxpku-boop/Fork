import type { RestaurantAgentReceiptRecord, RestaurantBusinessSignalType } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';

export type RestaurantBusinessSignalSummary = {
  acceptedReceipts: number;
  rejectedReceipts: number;
  reservations: number;
  couponClaims: number;
  redemptions: number;
  inquiries: number;
  visitIntent: number;
  evidenceScoreAverage: number;
  externalDataBlocked: boolean;
};

export type RestaurantBusinessSignalItem = {
  receiptId: string;
  eventId: string;
  signalType: RestaurantBusinessSignalType;
  channel: string;
  owner: string;
  restaurant: string;
  offer: string;
  evidenceLevel: RestaurantAgentReceiptRecord['evidenceLevel'];
  evidenceScore: number;
  signals: RestaurantAgentReceiptRecord['businessSignals'];
  nextAction: string;
};

export type RestaurantBusinessSignalReport = {
  ok: true;
  generatedAt: string;
  summary: RestaurantBusinessSignalSummary;
  items: RestaurantBusinessSignalItem[];
  blockers: string[];
  nextActions: string[];
  safetyBoundary: string;
};

function runFor(receipt: RestaurantAgentReceiptRecord, runs: RestaurantAgentRunRecord[]): RestaurantAgentRunRecord | undefined {
  return runs.find(run => run.eventId === receipt.eventId);
}

function nextActionFor(receipt: RestaurantAgentReceiptRecord, run?: RestaurantAgentRunRecord): string {
  if (receipt.signalType === 'redemption') return '用核销摘要复盘套餐、时段、备货和下一轮券面，不读取 POS 明细前只做手工导入分析。';
  if (receipt.signalType === 'reservation') return '把预约量交给店长确认排班、桌位和到店承接动作。';
  if (receipt.signalType === 'coupon-claim') return '检查领券到核销断点，补券面说明、门店路径或社群提醒。';
  if (receipt.signalType === 'private-domain-followup') return '只保留聚合咨询数和跟进负责人，不保存私信原文或个人联系方式。';
  if (receipt.signalType === 'visit-intent') return '把到店意向转成门店接待任务和二次触达计划。';
  if (run?.status === 'forwarded') return '等待外部 runtime 继续回写线索、预约或核销摘要。';
  return '更新门店记忆，沉淀可复用内容、渠道反馈和下一步经营动作。';
}

export function buildRestaurantBusinessSignals(
  runs: RestaurantAgentRunRecord[],
  receipts: RestaurantAgentReceiptRecord[],
  now = new Date(),
): RestaurantBusinessSignalReport {
  const accepted = receipts.filter(receipt => receipt.status === 'accepted');
  const rejected = receipts.filter(receipt => receipt.status === 'rejected');
  const items = accepted.slice(0, 12).map(receipt => {
    const run = runFor(receipt, runs);
    return {
      receiptId: receipt.receiptId,
      eventId: receipt.eventId,
      signalType: receipt.signalType,
      channel: receipt.channel,
      owner: run?.owner || receipt.operator,
      restaurant: run?.restaurant || 'unknown restaurant',
      offer: run?.offer || 'unknown offer',
      evidenceLevel: receipt.evidenceLevel,
      evidenceScore: receipt.evidenceScore,
      signals: receipt.businessSignals,
      nextAction: nextActionFor(receipt, run),
    } satisfies RestaurantBusinessSignalItem;
  });
  const scoreSum = accepted.reduce((sum, receipt) => sum + receipt.evidenceScore, 0);
  const summary = {
    acceptedReceipts: accepted.length,
    rejectedReceipts: rejected.length,
    reservations: accepted.reduce((sum, receipt) => sum + receipt.businessSignals.reservationCount, 0),
    couponClaims: accepted.reduce((sum, receipt) => sum + receipt.businessSignals.couponClaimCount, 0),
    redemptions: accepted.reduce((sum, receipt) => sum + receipt.businessSignals.redemptionCount, 0),
    inquiries: accepted.reduce((sum, receipt) => sum + receipt.businessSignals.inquiryCount, 0),
    visitIntent: accepted.reduce((sum, receipt) => sum + receipt.businessSignals.visitIntentCount, 0),
    evidenceScoreAverage: accepted.length ? Math.round(scoreSum / accepted.length) : 0,
    externalDataBlocked: true,
  };

  const blockers = [
    'POS、团购券核销和平台私信仍需要商家授权或导出样表；当前只聚合已验收回执里的脱敏指标。',
    ...rejected.slice(0, 3).map(receipt => `回执 ${receipt.receiptId} 未入经营分析：${receipt.rejectedReason || 'evidence rejected'}`),
  ];
  const nextActions = items.length
    ? items.slice(0, 4).map(item => `${item.owner}: ${item.nextAction}`)
    : ['先生成本地 Agent 任务，再导入带真实链接、截图或签名 externalRunId 的回执。'];

  return {
    ok: true,
    generatedAt: now.toISOString(),
    summary,
    items,
    blockers,
    nextActions,
    safetyBoundary: 'Business signals 只汇总预约、领券、核销、咨询和到店意向数量；没有商家授权、POS 导出或平台 API 前，不宣称线索已承接、核销已完成或真实经营同步。',
  };
}

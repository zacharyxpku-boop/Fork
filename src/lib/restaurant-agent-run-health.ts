import type { RestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantAgentRecoveryPlan, type RestaurantAgentRecoveryPlan } from '@/lib/restaurant-agent-recovery';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';

export type RestaurantRunHealthState =
  | 'accepted'
  | 'waiting-receipt'
  | 'blocked-auth'
  | 'failed'
  | 'queued-local'
  | 'receipt-rejected';

export type RestaurantRunHealthItem = {
  eventId: string;
  target: RestaurantAgentRunRecord['target'];
  taskId: string;
  restaurant: string;
  offer: string;
  owner: string;
  state: RestaurantRunHealthState;
  ageMinutes: number;
  evidenceState: 'accepted' | 'missing' | 'rejected';
  latestReceiptId?: string;
  evidenceScore?: number;
  evidenceLevel?: RestaurantAgentReceiptRecord['evidenceLevel'];
  evidenceWarnings?: string[];
  nextAction: string;
  evidenceRequired: string;
};

export type RestaurantRunHealth = {
  ok: true;
  generatedAt: string;
  summary: {
    totalRuns: number;
    accepted: number;
    waitingReceipt: number;
    blockedAuth: number;
    failed: number;
    queuedLocal: number;
    rejectedReceipts: number;
    externalBlockedGroups: number;
  };
  items: RestaurantRunHealthItem[];
  operatorQueue: Array<{
    priority: 'critical' | 'high' | 'medium' | 'low';
    owner: string;
    eventId: string;
    nextAction: string;
    evidenceRequired: string;
  }>;
  recovery: RestaurantAgentRecoveryPlan;
  safetyBoundary: string;
};

function minutesBetween(now: Date, createdAt: string): number {
  const created = Date.parse(createdAt);
  if (!Number.isFinite(created)) return 0;
  return Math.max(0, Math.floor((now.getTime() - created) / 60000));
}

function latestReceiptFor(run: RestaurantAgentRunRecord, receipts: RestaurantAgentReceiptRecord[]): RestaurantAgentReceiptRecord | undefined {
  return receipts
    .filter(receipt => receipt.eventId === run.eventId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
}

function stateFor(run: RestaurantAgentRunRecord, receipt?: RestaurantAgentReceiptRecord): RestaurantRunHealthState {
  if (receipt?.status === 'accepted') return 'accepted';
  if (receipt?.status === 'rejected') return 'receipt-rejected';
  if (run.status === 'blocked') return 'blocked-auth';
  if (run.status === 'failed') return 'failed';
  if (run.status === 'forwarded') return 'waiting-receipt';
  return 'queued-local';
}

function nextActionFor(run: RestaurantAgentRunRecord, state: RestaurantRunHealthState, receipt?: RestaurantAgentReceiptRecord): string {
  if (state === 'accepted') return '进入门店复盘和记忆写回，不再重复触发外部执行。';
  if (state === 'receipt-rejected') return receipt?.rejectedReason || '回执被拒收，补充合规证据后重新导入。';
  if (state === 'blocked-auth') return '补齐 runtime、隔离 profile、callback secret、商家授权或数据合同后再外发。';
  if (state === 'failed') return '检查 runtime health 和签名回执入口；最多重试 2 次，仍失败转人工兜底。';
  if (state === 'waiting-receipt') return '等待外部 runtime 回写 externalRunId、截图、发布链接或失败原因。';
  return '按证据字段手工回填，或在外部 runtime 就绪后生成受控 execution package。';
}

function evidenceStateFor(receipt?: RestaurantAgentReceiptRecord): RestaurantRunHealthItem['evidenceState'] {
  if (receipt?.status === 'accepted') return 'accepted';
  if (receipt?.status === 'rejected') return 'rejected';
  return 'missing';
}

function summarize(items: RestaurantRunHealthItem[], receipts: RestaurantAgentReceiptRecord[], readiness?: RestaurantExternalReadiness): RestaurantRunHealth['summary'] {
  return {
    totalRuns: items.length,
    accepted: items.filter(item => item.state === 'accepted').length,
    waitingReceipt: items.filter(item => item.state === 'waiting-receipt').length,
    blockedAuth: items.filter(item => item.state === 'blocked-auth').length,
    failed: items.filter(item => item.state === 'failed').length,
    queuedLocal: items.filter(item => item.state === 'queued-local').length,
    rejectedReceipts: receipts.filter(receipt => receipt.status === 'rejected').length,
    externalBlockedGroups: readiness?.groups.filter(group => group.status === 'blocked').length || 0,
  };
}

export function buildRestaurantRunHealth(
  runs: RestaurantAgentRunRecord[],
  receipts: RestaurantAgentReceiptRecord[],
  readiness?: RestaurantExternalReadiness,
  now = new Date(),
): RestaurantRunHealth {
  const items = runs.slice(0, 12).map(run => {
    const receipt = latestReceiptFor(run, receipts);
    const state = stateFor(run, receipt);
    return {
      eventId: run.eventId,
      target: run.target,
      taskId: run.taskId,
      restaurant: run.restaurant,
      offer: run.offer,
      owner: run.owner,
      state,
      ageMinutes: minutesBetween(now, run.createdAt),
      evidenceState: evidenceStateFor(receipt),
      latestReceiptId: receipt?.receiptId,
      evidenceScore: receipt?.evidenceScore,
      evidenceLevel: receipt?.evidenceLevel,
      evidenceWarnings: receipt?.validationWarnings,
      nextAction: nextActionFor(run, state, receipt),
      evidenceRequired: state === 'accepted' ? '已验收回执。' : run.evidenceRequired,
    } satisfies RestaurantRunHealthItem;
  });
  const recovery = buildRestaurantAgentRecoveryPlan(runs, receipts, readiness, now);

  return {
    ok: true,
    generatedAt: now.toISOString(),
    summary: summarize(items, receipts, readiness),
    items,
    operatorQueue: recovery.actions.slice(0, 6).map(action => ({
      priority: action.priority,
      owner: action.owner,
      eventId: action.eventId,
      nextAction: action.nextStep,
      evidenceRequired: action.evidenceRequired,
    })),
    recovery,
    safetyBoundary: 'Run health 只展示运行状态、聚合回执和下一步动作；不展示 API key、cookie、token、手机号、微信号或私信原文。',
  };
}

import type { RestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';

export type RestaurantAgentRecoveryAction = {
  id: string;
  eventId: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  runStatus: RestaurantAgentRunRecord['status'] | 'no-run';
  runTarget: RestaurantAgentRunRecord['target'] | 'none';
  action: 'configure-runtime' | 'import-receipt' | 'retry-bridge' | 'manual-fallback' | 'post-receipt-review' | 'start-local-run';
  owner: string;
  reason: string;
  nextStep: string;
  evidenceRequired: string;
  canRunInternally: boolean;
};

export type RestaurantAgentRecoveryPlan = {
  ok: true;
  generatedAt: string;
  inspectedRuns: number;
  acceptedReceipts: number;
  actions: RestaurantAgentRecoveryAction[];
  retryPolicy: {
    maxAttempts: number;
    backoff: string;
    stopWhen: string[];
  };
  blockedExternal: string[];
};

function stableId(input: string): string {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 39 + input.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function hasAcceptedReceipt(run: RestaurantAgentRunRecord, receipts: RestaurantAgentReceiptRecord[]) {
  return receipts.some(receipt => receipt.status === 'accepted' && receipt.eventId === run.eventId);
}

function readinessBlockers(readiness?: RestaurantExternalReadiness): string[] {
  if (!readiness) return [];
  return readiness.groups
    .filter(group => group.status === 'blocked')
    .map(group => `${group.name}: ${group.requirements.filter(requirement => !requirement.configured).map(requirement => requirement.label).join(' / ')}`);
}

export function buildRestaurantAgentRecoveryPlan(
  runs: RestaurantAgentRunRecord[],
  receipts: RestaurantAgentReceiptRecord[] = [],
  readiness?: RestaurantExternalReadiness,
  now = new Date(),
): RestaurantAgentRecoveryPlan {
  const recentRuns = runs.slice(0, 12);
  const acceptedReceipts = receipts.filter(receipt => receipt.status === 'accepted');
  const blockedExternal = readinessBlockers(readiness);

  const actions: RestaurantAgentRecoveryAction[] = recentRuns.map(run => {
    const hasReceipt = hasAcceptedReceipt(run, acceptedReceipts);

    if (hasReceipt) {
      return {
        id: `recovery-${stableId(`${run.eventId}-post-receipt`)}`,
        eventId: run.eventId,
        priority: 'low',
        runStatus: run.status,
        runTarget: run.target,
        action: 'post-receipt-review',
        owner: run.owner,
        reason: '任务已有可验证回执，恢复重点转为复盘和记忆写回。',
        nextStep: '生成门店复盘摘要，沉淀可复用菜品卖点、渠道表现和下一轮动作。',
        evidenceRequired: '已验收的 evidenceUrl、screenshotId 或 externalRunId。',
        canRunInternally: true,
      } satisfies RestaurantAgentRecoveryAction;
    }

    if (run.status === 'blocked') {
      return {
        id: `recovery-${stableId(`${run.eventId}-blocked`)}`,
        eventId: run.eventId,
        priority: 'critical',
        runStatus: run.status,
        runTarget: run.target,
        action: 'configure-runtime',
        owner: '技术 / 运营',
        reason: `${run.target} 执行条件未满足，不能重试真实平台动作。`,
        nextStep: '先补 runtime URL、callback secret、隔离 profile、租户隔离和商家授权；未补齐前只保留本地任务。',
        evidenceRequired: blockedExternal.join('；') || 'runtime URL、callback secret、商家账号授权、平台/POS 数据来源。',
        canRunInternally: false,
      } satisfies RestaurantAgentRecoveryAction;
    }

    if (run.status === 'forwarded') {
      return {
        id: `recovery-${stableId(`${run.eventId}-forwarded`)}`,
        eventId: run.eventId,
        priority: 'high',
        runStatus: run.status,
        runTarget: run.target,
        action: 'import-receipt',
        owner: run.owner,
        reason: '外部执行器已接收任务，但还没有签名回执写回。',
        nextStep: '等待或触发外部 runtime 用 action=external-receipt 回写 externalRunId、截图或发布链接。',
        evidenceRequired: 'x-restaurant-agent-signature、externalRunId、screenshotId 或 evidenceUrl。',
        canRunInternally: true,
      } satisfies RestaurantAgentRecoveryAction;
    }

    if (run.status === 'failed') {
      return {
        id: `recovery-${stableId(`${run.eventId}-failed`)}`,
        eventId: run.eventId,
        priority: 'high',
        runStatus: run.status,
        runTarget: run.target,
        action: 'retry-bridge',
        owner: '技术',
        reason: '任务失败但仍保留 eventId、owner 和 blockedActions，可从本地 payload 重试或转人工。',
        nextStep: '先检查签名回执入口和 runtime health；最多重试 2 次，仍失败则转人工发布/导入回执。',
        evidenceRequired: '失败原因、runtime health、重试时间、最终回执或人工兜底记录。',
        canRunInternally: true,
      } satisfies RestaurantAgentRecoveryAction;
    }

    return {
      id: `recovery-${stableId(`${run.eventId}-queued`)}`,
      eventId: run.eventId,
      priority: 'medium',
      runStatus: run.status,
      runTarget: run.target,
      action: 'manual-fallback',
      owner: run.owner,
      reason: '本地任务已排队，但尚未交给外部执行器或人工补回执。',
      nextStep: '先按证据字段手工发布/截图，或在外部 runtime 就绪后投递 bridge。',
      evidenceRequired: run.evidenceRequired,
      canRunInternally: true,
    } satisfies RestaurantAgentRecoveryAction;
  });

  if (actions.length === 0) {
    actions.push({
      id: 'recovery-bootstrap-local-run',
      eventId: 'none',
      priority: 'medium',
      runStatus: 'no-run',
      runTarget: 'none',
      action: 'start-local-run',
      owner: '运营',
      reason: '还没有可恢复的 Agent run。',
      nextStep: '先生成本地 Agent 任务，创建 eventId、tenantId、worker payload 和审计记录。',
      evidenceRequired: '本地 run 记录。',
      canRunInternally: true,
    });
  }

  return {
    ok: true,
    generatedAt: now.toISOString(),
    inspectedRuns: recentRuns.length,
    acceptedReceipts: acceptedReceipts.length,
    actions,
    retryPolicy: {
      maxAttempts: 2,
      backoff: 'manual review between attempts; do not loop platform actions automatically',
      stopWhen: [
        'callback signature mismatch',
        'merchant authorization missing',
        'platform captcha/login challenge appears',
        'receipt contains personal contact or private-message raw text',
      ],
    },
    blockedExternal,
  };
}

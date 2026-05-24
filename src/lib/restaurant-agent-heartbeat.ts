import { buildRestaurantAgentCapabilityPlan } from '@/lib/restaurant-agent-capabilities';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantAgentWatcherPolicy, type RestaurantAgentWatcherPolicy } from '@/lib/restaurant-agent-watcher-policy';

export type RestaurantAgentHeartbeatFollowup = {
  id: string;
  priority: 'high' | 'medium' | 'low';
  owner: string;
  reason: string;
  nextAction: string;
  evidenceRequired: string;
};

export type RestaurantAgentHeartbeat = {
  ok: true;
  heartbeatId: string;
  watchedRuns: number;
  watcherEvents: string[];
  followups: RestaurantAgentHeartbeatFollowup[];
  memorySuggestions: string[];
  watcherPolicy: RestaurantAgentWatcherPolicy;
  blockedExternal: string[];
  acceptedReceipts: number;
};

function stableId(input: string): string {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33 + input.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function buildRestaurantAgentHeartbeat(runs: RestaurantAgentRunRecord[], receipts: RestaurantAgentReceiptRecord[] = []): RestaurantAgentHeartbeat {
  const plan = buildRestaurantAgentCapabilityPlan();
  const recentRuns = runs.slice(0, 8);
  const watcherPolicy = buildRestaurantAgentWatcherPolicy({ runs: recentRuns, receipts });
  const acceptedReceipts = receipts.filter(receipt => receipt.status === 'accepted');
  const acceptedReceiptEventIds = new Set(acceptedReceipts.map(receipt => receipt.eventId));
  const followups: RestaurantAgentHeartbeatFollowup[] = recentRuns.map(run => {
    if (acceptedReceiptEventIds.has(run.eventId)) {
      return {
        id: `followup-${stableId(`${run.eventId}-receipt`)}`,
        priority: 'low',
        owner: run.owner,
        reason: '该任务已有执行回执，系统可以进入复盘和下一轮跟进。',
        nextAction: '更新门店记忆，整理可复用素材、线索来源和下一次活动建议。',
        evidenceRequired: '已导入发布链接、截图编号或外部 runtime 回执。',
      };
    }

    if (run.status === 'blocked') {
      return {
        id: `followup-${stableId(`${run.eventId}-blocked`)}`,
        priority: 'high',
        owner: '技术 / 运营负责人',
        reason: `${run.target} runtime 未满足执行条件。`,
        nextAction: run.nextAction,
        evidenceRequired: 'runtime URL、API key、租户隔离、商家账号授权。',
      };
    }

    if (run.status === 'forwarded') {
      return {
        id: `followup-${stableId(`${run.eventId}-forwarded`)}`,
        priority: 'medium',
        owner: run.owner,
        reason: '外部执行器已接收任务，等待回执写回。',
        nextAction: '回填 externalRunId、截图、内容 ID 或平台执行结果。',
        evidenceRequired: '外部 runtime 回执、发布链接、截图或失败原因。',
      };
    }

    return {
      id: `followup-${stableId(`${run.eventId}-queued`)}`,
      priority: 'medium',
      owner: run.owner,
      reason: '本地任务已入队，还没有真实平台回执。',
      nextAction: '先补发布链接/截图或把任务交给 Lobu/OpenClaw/Hermes bridge。',
      evidenceRequired: run.evidenceRequired,
    };
  });

  if (followups.length === 0) {
    followups.push({
      id: 'followup-bootstrap-runtime',
      priority: 'low',
      owner: '运营',
      reason: '还没有餐饮 Agent 运行记录。',
      nextAction: '先点击“生成本地 Agent 任务”，让系统创建第一条可审计 run。',
      evidenceRequired: '本地 eventId、tenantId、worker payload。',
    });
  }

  return {
    ok: true,
    heartbeatId: `restaurant-heartbeat-${stableId(followups.map(item => item.id).join('|'))}`,
    watchedRuns: recentRuns.length,
    watcherEvents: plan.session.watchers.map(watcher => watcher.event),
    followups,
    memorySuggestions: recentRuns.slice(0, 3).map(run => `${run.restaurant} / ${run.offer}：${run.status}，下一步交给 ${run.owner}。`),
    watcherPolicy,
    blockedExternal: [
      'platform_publish requires merchant account authorization',
      'browser_open_click_type requires isolated browser runtime',
      'pos_redemption_pull requires POS export/API',
    ],
    acceptedReceipts: acceptedReceipts.length,
  };
}

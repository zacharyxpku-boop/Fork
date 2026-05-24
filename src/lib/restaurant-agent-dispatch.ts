import { buildRestaurantAgentRuntime } from '@/lib/restaurant-agent-runtime';

export type RestaurantAgentDispatchInput = {
  taskId?: string;
  restaurant?: string;
  offer?: string;
  owner?: string;
  source?: string;
  runtimeTarget?: 'local' | 'lobu' | 'openclaw' | 'hermes';
};

export type RestaurantAgentDispatch = {
  ok: boolean;
  eventId: string;
  adapter: 'lobu-compatible-local';
  status: 'queued' | 'blocked';
  taskId: string;
  tenantId: string;
  workerPayload: {
    type: 'restaurant.agent.task';
    taskId: string;
    restaurant: string;
    offer: string;
    owner: string;
    allowedActions: string[];
    blockedActions: string[];
    evidenceRequired: string;
  };
  memoryWrites: Array<{
    entity: string;
    key: string;
    value: string;
    retention: string;
  }>;
  auditLog: Array<{
    at: string;
    actor: string;
    action: string;
    result: string;
  }>;
  nextAttachStep: string;
};

const ALLOWED_TASKS = new Set(['browser-publish-check', 'memory-followup', 'redemption-review', 'external-runtime-attach']);

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 31 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function buildRestaurantAgentDispatch(input: RestaurantAgentDispatchInput = {}): RestaurantAgentDispatch {
  const runtime = buildRestaurantAgentRuntime();
  const taskId = input.taskId || 'browser-publish-check';
  const task = runtime.tasks.find(item => item.id === taskId);
  const restaurant = input.restaurant?.trim() || '待确认门店';
  const offer = input.offer?.trim() || '待确认菜品/套餐';
  const owner = input.owner?.trim() || task?.owner || '运营负责人';
  const eventId = `restaurant-agent-${stableId([taskId, restaurant, offer, owner])}`;
  const tenantId = `restaurant-${stableId([restaurant]).slice(0, 6)}`;
  const knownTask = Boolean(task && ALLOWED_TASKS.has(taskId));
  const wantsExternalRuntime = input.runtimeTarget !== undefined && input.runtimeTarget !== 'local';

  const blockedActions = [
    'external_platform_publish',
    'private_message_read',
    'pos_pull',
    'coupon_redemption_write',
  ];

  const allowedActions = knownTask
    ? ['queue_task', 'write_structured_memory', 'generate_evidence_checklist', 'append_audit_log']
    : [];

  return {
    ok: knownTask && !wantsExternalRuntime,
    eventId,
    adapter: 'lobu-compatible-local',
    status: knownTask && !wantsExternalRuntime ? 'queued' : 'blocked',
    taskId,
    tenantId,
    workerPayload: {
      type: 'restaurant.agent.task',
      taskId,
      restaurant,
      offer,
      owner,
      allowedActions,
      blockedActions,
      evidenceRequired: task?.evidenceRequired || '需要选择白名单餐饮任务。',
    },
    memoryWrites: [
      {
        entity: 'Restaurant',
        key: restaurant,
        value: `门店 ${restaurant} 已创建 Agent 任务 ${taskId}，负责人 ${owner}。`,
        retention: 'tenant memory, editable by restaurant owner',
      },
      {
        entity: 'Offer',
        key: offer,
        value: `菜品/套餐 ${offer} 进入 ${task?.agent || 'Agent'} 队列，等待证据回填。`,
        retention: 'campaign memory until post-campaign review',
      },
    ],
    auditLog: [
      {
        at: 'server-now',
        actor: 'wenai-restaurant-runtime',
        action: wantsExternalRuntime ? `blocked_external_runtime_${input.runtimeTarget}` : 'queued_local_lobu_compatible_task',
        result: knownTask
          ? '本地 runtime 已生成 worker payload；外部平台动作仍需授权。'
          : '未知任务被拒绝。',
      },
    ],
    nextAttachStep: wantsExternalRuntime
      ? '请先配置 runtime URL、secret proxy、租户隔离和商家账号授权，再投递到外部执行器。'
      : '下一步可把该 payload 投递到 Lobu gateway / worker，或交给 OpenClaw/Hermes browser executor。',
  };
}

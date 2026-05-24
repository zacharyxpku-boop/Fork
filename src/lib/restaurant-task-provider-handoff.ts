import { buildRestaurantAgentExecutionPackage, type RestaurantExecutionPackage } from '@/lib/restaurant-agent-execution-package';
import type { RestaurantGrantAction } from '@/lib/restaurant-agent-grant-manifest';
import type { RestaurantRuntimeTarget } from '@/lib/restaurant-agent-runtime-bridge';
import type { RestaurantStoreManagerTaskQueue, RestaurantStoreManagerTaskRecord } from '@/lib/restaurant-store-manager-task-store';

export type RestaurantTaskProviderHandoffStatus = 'ready-to-forward' | 'handoff-only' | 'blocked';

export type RestaurantTaskProviderHandoffItem = {
  handoffId: string;
  taskMemoryId: string;
  status: RestaurantTaskProviderHandoffStatus;
  canForward: boolean;
  runtimeTarget: RestaurantRuntimeTarget;
  requestedAction: RestaurantGrantAction;
  safePayload: {
    taskId: string;
    restaurant: string;
    offer: string;
    owner: string;
    action: string;
    evidenceRequired: string;
    externalRequired: string[];
    stopLine: string;
  };
  executionPackage: Pick<RestaurantExecutionPackage, 'payloadShape' | 'packageId' | 'target' | 'status' | 'canForward' | 'blockedReasons' | 'runtimeContract' | 'executionPolicy' | 'audit' | 'nextStep'>;
  blockedReasons: string[];
  nextAction: string;
};

export type RestaurantTaskProviderHandoff = {
  ok: true;
  payloadShape: 'restaurant-task-provider-handoff-v1';
  generatedAt: string;
  summary: {
    tasks: number;
    readyTasks: number;
    packages: number;
    forwardable: number;
    handoffOnly: number;
    blocked: number;
  };
  packages: RestaurantTaskProviderHandoffItem[];
  blockedPackages: RestaurantTaskProviderHandoffItem[];
  providerContract: {
    acceptedTaskStatus: 'ready-for-provider';
    allowedTargets: RestaurantRuntimeTarget[];
    callbackAction: 'external-receipt';
    callbackHeader: 'x-restaurant-agent-signature';
    requiredReceiptFields: string[];
  };
  operatorChecklist: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

type EnvMap = Record<string, string | undefined>;

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 53 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function requestedActionFor(task: RestaurantStoreManagerTaskRecord): RestaurantGrantAction {
  const text = `${task.signal} ${task.action} ${task.evidenceRequired}`.toLowerCase();
  if (text.includes('publish') || text.includes('post') || text.includes('发布')) return 'prepare_publish_draft';
  if (text.includes('redemption') || text.includes('coupon') || text.includes('核销') || text.includes('券')) return 'summarize_lead_counts';
  if (text.includes('private') || text.includes('message') || text.includes('私信')) return 'summarize_lead_counts';
  return 'capture_public_receipt';
}

function buildItem(input: {
  task: RestaurantStoreManagerTaskRecord;
  target: RestaurantRuntimeTarget;
  env?: EnvMap;
  now: Date;
}): RestaurantTaskProviderHandoffItem {
  const requestedAction = requestedActionFor(input.task);
  const executionPackage = buildRestaurantAgentExecutionPackage({
    target: input.target,
    taskId: 'external-runtime-attach',
    restaurant: input.task.restaurant,
    offer: input.task.offer,
    owner: input.task.owner,
    requestedAction,
    env: input.env,
    now: input.now,
  });
  const statusBlockedReasons = input.task.status === 'ready-for-provider'
    ? []
    : [`Task status is ${input.task.status}; only ready-for-provider tasks can be handed to an external runtime.`];
  const blockedReasons = [...statusBlockedReasons, ...executionPackage.blockedReasons];
  const canForward = input.task.status === 'ready-for-provider' && executionPackage.canForward;
  const status: RestaurantTaskProviderHandoffStatus = canForward
    ? 'ready-to-forward'
    : executionPackage.status === 'handoff-only' && input.task.status === 'ready-for-provider'
      ? 'handoff-only'
      : 'blocked';

  return {
    handoffId: `task-handoff-${stableId([input.task.taskMemoryId, input.target, requestedAction, executionPackage.packageId])}`,
    taskMemoryId: input.task.taskMemoryId,
    status,
    canForward,
    runtimeTarget: input.target,
    requestedAction,
    safePayload: {
      taskId: input.task.id,
      restaurant: input.task.restaurant,
      offer: input.task.offer,
      owner: input.task.owner,
      action: input.task.action,
      evidenceRequired: input.task.evidenceRequired,
      externalRequired: input.task.externalRequired,
      stopLine: input.task.stopLine,
    },
    executionPackage: {
      payloadShape: executionPackage.payloadShape,
      packageId: executionPackage.packageId,
      target: executionPackage.target,
      status: executionPackage.status,
      canForward: executionPackage.canForward,
      blockedReasons: executionPackage.blockedReasons,
      runtimeContract: executionPackage.runtimeContract,
      executionPolicy: executionPackage.executionPolicy,
      audit: executionPackage.audit,
      nextStep: executionPackage.nextStep,
    },
    blockedReasons,
    nextAction: canForward
      ? `Forward ${executionPackage.packageId} to ${input.target}, then require a signed external-receipt callback before closing the task.`
      : blockedReasons[0] || executionPackage.nextStep,
  };
}

export function buildRestaurantTaskProviderHandoff(input: {
  queue: RestaurantStoreManagerTaskQueue;
  target?: RestaurantRuntimeTarget;
  env?: EnvMap;
  now?: Date;
}): RestaurantTaskProviderHandoff {
  const now = input.now || new Date();
  const target = input.target || 'openclaw';
  const readyTasks = input.queue.tasks.filter(task => task.status === 'ready-for-provider');
  const candidateTasks = input.queue.tasks.filter(task => task.status !== 'done');
  const items = candidateTasks.map(task => buildItem({ task, target, env: input.env, now }));
  const packages = items.filter(item => item.status !== 'blocked');
  const blockedPackages = items.filter(item => item.status === 'blocked');
  const externalRequired = Array.from(new Set([
    ...items.flatMap(item => item.blockedReasons),
    ...readyTasks.flatMap(task => task.externalRequired),
  ])).slice(0, 8);

  return {
    ok: true,
    payloadShape: 'restaurant-task-provider-handoff-v1',
    generatedAt: now.toISOString(),
    summary: {
      tasks: input.queue.tasks.length,
      readyTasks: readyTasks.length,
      packages: packages.length,
      forwardable: packages.filter(item => item.canForward).length,
      handoffOnly: packages.filter(item => item.status === 'handoff-only').length,
      blocked: blockedPackages.length,
    },
    packages,
    blockedPackages,
    providerContract: {
      acceptedTaskStatus: 'ready-for-provider',
      allowedTargets: ['lobu', 'openclaw', 'hermes'],
      callbackAction: 'external-receipt',
      callbackHeader: 'x-restaurant-agent-signature',
      requiredReceiptFields: ['eventId', 'channel', 'screenshotId or evidenceUrl', 'externalRunId', 'operator', 'summary'],
    },
    operatorChecklist: [
      'Move a task to ready-for-provider only after the owner has reviewed evidence and stop line.',
      'Send only safePayload and executionPackage metadata to the runtime; never send API keys, cookies, browser profile IDs, raw POS rows, PII, or private-message bodies.',
      'Keep the task open until a signed receipt, public proof link, screenshot id, or sanitized aggregate receipt is recorded.',
    ],
    externalRequired,
    safetyBoundary: 'Task Provider Handoff converts ready-for-provider store-manager tasks into sanitized runtime packages. It does not log in, publish, contact customers, read private messages, redeem coupons, pull raw POS data, expose secrets, or close tasks without signed/public evidence.',
  };
}

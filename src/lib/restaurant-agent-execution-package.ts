import { buildRestaurantAgentDispatch, type RestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantBrowserSessionManifest, type RestaurantBrowserRuntimeTarget, type RestaurantBrowserSessionManifest } from '@/lib/restaurant-agent-browser-session';
import { buildRestaurantMerchantGrantManifest, type RestaurantGrantAction, type RestaurantMerchantGrantManifest } from '@/lib/restaurant-agent-grant-manifest';
import type { RestaurantRuntimeTarget } from '@/lib/restaurant-agent-runtime-bridge';

export type RestaurantExecutionPackageStatus = 'ready-to-forward' | 'handoff-only' | 'blocked';

export type RestaurantExecutionPackage = {
  ok: true;
  packageId: string;
  payloadShape: 'restaurant-agent-external-execution-v1';
  target: RestaurantRuntimeTarget;
  status: RestaurantExecutionPackageStatus;
  canForward: boolean;
  requestedAction: RestaurantGrantAction;
  dispatch: Pick<RestaurantAgentDispatch, 'eventId' | 'tenantId' | 'taskId' | 'workerPayload' | 'memoryWrites' | 'auditLog'>;
  browserSession: RestaurantBrowserSessionManifest;
  grantManifest: RestaurantMerchantGrantManifest;
  runtimeContract: {
    endpointKind: 'lobu-events' | 'openclaw-tasks' | 'hermes-runs';
    callbackEndpoint: '/api/restaurant-agent/runtime';
    callbackAction: 'external-receipt';
    callbackHeader: 'x-restaurant-agent-signature';
    requiredReceiptFields: string[];
  };
  executionPolicy: {
    allowedRuntimeActions: string[];
    blockedRuntimeActions: string[];
    stopConditions: string[];
    evidenceRequired: string[];
  };
  audit: {
    secretsIncluded: false;
    privateDataIncluded: false;
    browserProfileExposed: false;
    packageSafeToSend: boolean;
  };
  blockedReasons: string[];
  nextStep: string;
};

type EnvMap = Record<string, string | undefined>;

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 47 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function cleanText(value: unknown, fallback: string, max = 80): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function browserTargetFor(target: RestaurantRuntimeTarget, requested?: RestaurantBrowserRuntimeTarget): RestaurantBrowserRuntimeTarget {
  if (requested) return requested;
  return target === 'hermes' ? 'hermes' : 'openclaw';
}

function runtimeEndpointKind(target: RestaurantRuntimeTarget): RestaurantExecutionPackage['runtimeContract']['endpointKind'] {
  if (target === 'lobu') return 'lobu-events';
  if (target === 'hermes') return 'hermes-runs';
  return 'openclaw-tasks';
}

function hasRuntimeEnv(target: RestaurantRuntimeTarget, env: EnvMap): boolean {
  if (target === 'lobu') return Boolean(env.RESTAURANT_AGENT_LOBU_RUNTIME_URL?.trim() && env.RESTAURANT_AGENT_LOBU_API_KEY?.trim());
  if (target === 'hermes') return Boolean(env.RESTAURANT_AGENT_HERMES_RUNTIME_URL?.trim() && env.RESTAURANT_AGENT_HERMES_API_KEY?.trim());
  return Boolean(env.RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL?.trim() && env.RESTAURANT_AGENT_OPENCLAW_API_KEY?.trim());
}

function unique(items: string[]): string[] {
  return Array.from(new Set(items.filter(Boolean)));
}

export function buildRestaurantAgentExecutionPackage(input: {
  target?: RestaurantRuntimeTarget;
  browserRuntimeTarget?: RestaurantBrowserRuntimeTarget;
  taskId?: string;
  restaurant?: string;
  offer?: string;
  owner?: string;
  requestedAction?: RestaurantGrantAction;
  expiresAt?: string;
  revoked?: boolean;
  env?: EnvMap;
  now?: Date;
} = {}): RestaurantExecutionPackage {
  const env = input.env || process.env;
  const target = input.target || 'openclaw';
  const requestedAction = input.requestedAction || 'capture_public_receipt';
  const restaurant = cleanText(input.restaurant, '试用门店');
  const offer = cleanText(input.offer, '今日主推套餐');
  const owner = cleanText(input.owner, '运营负责人');
  const dispatch = buildRestaurantAgentDispatch({
    taskId: input.taskId || 'browser-publish-check',
    restaurant,
    offer,
    owner,
    runtimeTarget: 'local',
    source: 'external_execution_package',
  });
  const browserSession = buildRestaurantBrowserSessionManifest({
    runtimeTarget: browserTargetFor(target, input.browserRuntimeTarget),
    eventId: dispatch.eventId,
    restaurant,
    offer,
    env,
  });
  const grantManifest = buildRestaurantMerchantGrantManifest({
    restaurant,
    operator: owner,
    expiresAt: input.expiresAt,
    revoked: input.revoked,
    env,
    now: input.now,
  });
  const requestedPolicy = grantManifest.actionPolicy.find(policy => policy.action === requestedAction);
  const runtimeConfigured = hasRuntimeEnv(target, env);
  const callbackReady = browserSession.runtime.callbackSecretConfigured;
  const grantReady = grantManifest.merchant.grantStatus === 'active';
  const actionAllowed = Boolean(requestedPolicy?.allowed);
  const browserRequestedToolAllowed = requestedAction === 'submit_platform_publish'
    ? Boolean(browserSession.toolPolicy.find(policy => policy.name === 'submit_platform_publish')?.allowed)
    : true;
  const blockedReasons = [
    dispatch.ok ? '' : '本地 Lobu-compatible dispatch 未生成。',
    runtimeConfigured ? '' : `${target} runtime URL/API key 未配置。`,
    browserSession.canExecuteNow ? '' : '隔离浏览器 profile、browser runtime 或 callback secret 未配置。',
    grantReady ? '' : `商家授权状态为 ${grantManifest.merchant.grantStatus}。`,
    actionAllowed ? '' : `${requestedAction} 未被 grant manifest 允许。`,
    browserRequestedToolAllowed ? '' : `${requestedAction} 未被 browser session toolPolicy 允许。`,
    callbackReady ? '' : '签名 callback secret 未配置。',
  ].filter(Boolean);
  const blockedRuntimeActions = unique([
    ...dispatch.workerPayload.blockedActions,
    ...grantManifest.actionPolicy.filter(policy => !policy.allowed).map(policy => policy.action),
    ...browserSession.toolPolicy.filter(policy => !policy.allowed).map(policy => policy.name),
  ]);
  const allowedRuntimeActions = unique([
    ...dispatch.workerPayload.allowedActions,
    ...grantManifest.actionPolicy.filter(policy => policy.allowed).map(policy => policy.action),
    ...browserSession.toolPolicy.filter(policy => policy.allowed).map(policy => policy.name),
  ]);
  const canForward = blockedReasons.length === 0;

  return {
    ok: true,
    packageId: `restaurant-exec-${stableId([target, browserSession.sessionId, grantManifest.manifestId, requestedAction])}`,
    payloadShape: 'restaurant-agent-external-execution-v1',
    target,
    status: canForward ? 'ready-to-forward' : runtimeConfigured || browserSession.runtime.configured ? 'handoff-only' : 'blocked',
    canForward,
    requestedAction,
    dispatch: {
      eventId: dispatch.eventId,
      tenantId: dispatch.tenantId,
      taskId: dispatch.taskId,
      workerPayload: dispatch.workerPayload,
      memoryWrites: dispatch.memoryWrites,
      auditLog: dispatch.auditLog,
    },
    browserSession,
    grantManifest,
    runtimeContract: {
      endpointKind: runtimeEndpointKind(target),
      callbackEndpoint: '/api/restaurant-agent/runtime',
      callbackAction: 'external-receipt',
      callbackHeader: 'x-restaurant-agent-signature',
      requiredReceiptFields: browserSession.callbackContract.requiredFields,
    },
    executionPolicy: {
      allowedRuntimeActions,
      blockedRuntimeActions,
      stopConditions: unique([...browserSession.stopConditions, ...grantManifest.privacyBoundary]),
      evidenceRequired: unique([
        ...browserSession.evidencePlan,
        ...(requestedPolicy?.evidenceRequired || []),
        dispatch.workerPayload.evidenceRequired,
      ]),
    },
    audit: {
      secretsIncluded: false,
      privateDataIncluded: false,
      browserProfileExposed: false,
      packageSafeToSend: true,
    },
    blockedReasons,
    nextStep: canForward
      ? `可以把 execution package 投递给 ${target}；执行后必须用签名 external-receipt 回写。`
      : `先补齐阻断项：${blockedReasons.join('；')}`,
  };
}

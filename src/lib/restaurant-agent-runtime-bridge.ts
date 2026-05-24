import type { RestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantAgentExecutionPackage, type RestaurantExecutionPackage } from '@/lib/restaurant-agent-execution-package';

export type RestaurantRuntimeTarget = 'lobu' | 'openclaw' | 'hermes';

export type RestaurantRuntimeBridgeConfig = {
  target: RestaurantRuntimeTarget;
  runtimeUrl?: string;
  apiKey?: string;
  env?: Record<string, string | undefined>;
};

export type RestaurantRuntimeBridgeResult = {
  ok: boolean;
  target: RestaurantRuntimeTarget;
  status: 'blocked' | 'forwarded' | 'failed';
  endpoint?: string;
  externalRunId?: string;
  message: string;
  audit: {
    secretExposed: false;
    payloadShape: 'lobu-compatible-restaurant-task' | 'restaurant-agent-external-execution-v1';
    packageId?: string;
    canForward?: boolean;
    blockedReasons?: string[];
    blockedActions: string[];
  };
};

const TARGET_ENV: Record<RestaurantRuntimeTarget, { url: string; key: string; defaultPath: string }> = {
  lobu: {
    url: 'RESTAURANT_AGENT_LOBU_RUNTIME_URL',
    key: 'RESTAURANT_AGENT_LOBU_API_KEY',
    defaultPath: '/events',
  },
  openclaw: {
    url: 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL',
    key: 'RESTAURANT_AGENT_OPENCLAW_API_KEY',
    defaultPath: '/tasks',
  },
  hermes: {
    url: 'RESTAURANT_AGENT_HERMES_RUNTIME_URL',
    key: 'RESTAURANT_AGENT_HERMES_API_KEY',
    defaultPath: '/runs',
  },
};

function trimSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function buildEndpoint(runtimeUrl: string, defaultPath: string): string {
  const normalized = trimSlash(runtimeUrl.trim());
  if (normalized.endsWith('/events') || normalized.endsWith('/tasks') || normalized.endsWith('/runs')) return normalized;
  return `${normalized}${defaultPath}`;
}

export function readRestaurantRuntimeBridgeConfig(target: RestaurantRuntimeTarget): RestaurantRuntimeBridgeConfig {
  const env = TARGET_ENV[target];
  return {
    target,
    runtimeUrl: process.env[env.url],
    apiKey: process.env[env.key],
  };
}

export async function forwardRestaurantAgentDispatch(
  dispatch: RestaurantAgentDispatch,
  config: RestaurantRuntimeBridgeConfig,
  fetcher: typeof fetch = fetch,
): Promise<RestaurantRuntimeBridgeResult> {
  const env = TARGET_ENV[config.target];
  const baseEnv = config.env || process.env;
  const executionPackage = buildRestaurantAgentExecutionPackage({
    target: config.target,
    taskId: dispatch.taskId,
    restaurant: dispatch.workerPayload.restaurant,
    offer: dispatch.workerPayload.offer,
    owner: dispatch.workerPayload.owner,
    env: {
      ...baseEnv,
      [env.url]: config.runtimeUrl || baseEnv[env.url],
      [env.key]: config.apiKey || baseEnv[env.key],
    },
  });

  return forwardRestaurantAgentExecutionPackage(executionPackage, config, fetcher);
}

export async function forwardRestaurantAgentExecutionPackage(
  executionPackage: RestaurantExecutionPackage,
  config: RestaurantRuntimeBridgeConfig,
  fetcher: typeof fetch = fetch,
): Promise<RestaurantRuntimeBridgeResult> {
  const env = TARGET_ENV[config.target];
  const blockedActions = executionPackage.executionPolicy.blockedRuntimeActions;
  if (!config.runtimeUrl || !config.apiKey) {
    return {
      ok: false,
      target: config.target,
      status: 'blocked',
      message: `缺少 ${env.url} 或 ${env.key}，不会外发到 ${config.target}。`,
      audit: {
        secretExposed: false,
        payloadShape: 'restaurant-agent-external-execution-v1',
        packageId: executionPackage.packageId,
        canForward: false,
        blockedReasons: executionPackage.blockedReasons,
        blockedActions,
      },
    };
  }

  if (!executionPackage.canForward) {
    return {
      ok: false,
      target: config.target,
      status: 'blocked',
      message: `execution package 未满足外发条件：${executionPackage.blockedReasons.join('；')}`,
      audit: {
        secretExposed: false,
        payloadShape: 'restaurant-agent-external-execution-v1',
        packageId: executionPackage.packageId,
        canForward: false,
        blockedReasons: executionPackage.blockedReasons,
        blockedActions,
      },
    };
  }

  const endpoint = buildEndpoint(config.runtimeUrl, env.defaultPath);
  const response = await fetcher(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...executionPackage,
      source: 'wenai-restaurant-agent-runtime',
    }),
  }).catch(error => ({
    ok: false,
    status: 599,
    json: async () => ({ error: error instanceof Error ? error.message : 'runtime_fetch_failed' }),
  } as Response));

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      target: config.target,
      status: 'failed',
      endpoint,
      message: `外部 ${config.target} runtime 返回 ${response.status}，任务未确认执行。`,
      audit: {
        secretExposed: false,
        payloadShape: 'restaurant-agent-external-execution-v1',
        packageId: executionPackage.packageId,
        canForward: executionPackage.canForward,
        blockedReasons: executionPackage.blockedReasons,
        blockedActions,
      },
    };
  }

  return {
    ok: true,
    target: config.target,
    status: 'forwarded',
    endpoint,
    externalRunId: typeof payload.runId === 'string' ? payload.runId : typeof payload.id === 'string' ? payload.id : undefined,
    message: `已把任务转发到 ${config.target} runtime；平台发布、私信、POS 和核销仍由目标 runtime 的授权策略决定。`,
    audit: {
      secretExposed: false,
      payloadShape: 'restaurant-agent-external-execution-v1',
      packageId: executionPackage.packageId,
      canForward: true,
      blockedReasons: [],
      blockedActions,
    },
  };
}

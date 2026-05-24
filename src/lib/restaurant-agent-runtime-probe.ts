import type { RestaurantRuntimeTarget } from '@/lib/restaurant-agent-runtime-bridge';

export type RestaurantRuntimeProbeStatus = 'ready' | 'missing-config' | 'unreachable' | 'blocked-external';

export type RestaurantRuntimeProbeTarget = {
  target: RestaurantRuntimeTarget;
  status: RestaurantRuntimeProbeStatus;
  configured: boolean;
  endpoint: string;
  healthPath: string;
  statusCode?: number;
  latencyMs?: number;
  nextAction: string;
};

export type RestaurantRuntimeProbe = {
  ok: true;
  generatedAt: string;
  summary: {
    ready: number;
    missingConfig: number;
    unreachable: number;
    blockedExternal: number;
    probed: number;
  };
  targets: RestaurantRuntimeProbeTarget[];
  gates: Array<{
    id: string;
    status: 'ready' | 'blocked';
    evidence: string;
    nextAction: string;
  }>;
  safetyBoundary: string;
};

type EnvMap = Record<string, string | undefined>;

const TARGET_CONFIG: Record<RestaurantRuntimeTarget, { url: string; key: string; defaultHealthPath: string }> = {
  lobu: {
    url: 'RESTAURANT_AGENT_LOBU_RUNTIME_URL',
    key: 'RESTAURANT_AGENT_LOBU_API_KEY',
    defaultHealthPath: '/health',
  },
  openclaw: {
    url: 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL',
    key: 'RESTAURANT_AGENT_OPENCLAW_API_KEY',
    defaultHealthPath: '/health',
  },
  hermes: {
    url: 'RESTAURANT_AGENT_HERMES_RUNTIME_URL',
    key: 'RESTAURANT_AGENT_HERMES_API_KEY',
    defaultHealthPath: '/health',
  },
};

function hasValue(env: EnvMap, key: string): boolean {
  return typeof env[key] === 'string' && env[key]!.trim().length > 0;
}

function safeEndpoint(value: string | undefined): string {
  if (!value) return 'missing';
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname.replace(/\/+$/, '') || '/'}`;
  } catch {
    return 'invalid-url';
  }
}

function healthEndpoint(value: string, defaultHealthPath: string): string {
  const url = new URL(value);
  const path = url.pathname.replace(/\/+$/, '');
  url.pathname = path.endsWith('/health') ? path : `${path}${defaultHealthPath}`;
  url.search = '';
  url.hash = '';
  return url.toString();
}

async function probeRuntimeTarget(
  target: RestaurantRuntimeTarget,
  env: EnvMap,
  fetcher: typeof fetch,
): Promise<RestaurantRuntimeProbeTarget> {
  const config = TARGET_CONFIG[target];
  const urlValue = env[config.url]?.trim();
  const keyValue = env[config.key]?.trim();
  const configured = Boolean(urlValue && keyValue);
  const endpoint = safeEndpoint(urlValue);

  if (!configured || !urlValue || !keyValue) {
    return {
      target,
      status: 'missing-config',
      configured: false,
      endpoint,
      healthPath: config.defaultHealthPath,
      nextAction: `配置 ${config.url} 和 ${config.key} 后再探测 ${target} health。`,
    };
  }

  let healthUrl: string;
  try {
    healthUrl = healthEndpoint(urlValue, config.defaultHealthPath);
  } catch {
    return {
      target,
      status: 'missing-config',
      configured: false,
      endpoint: 'invalid-url',
      healthPath: config.defaultHealthPath,
      nextAction: `${config.url} 不是有效 URL。`,
    };
  }

  const startedAt = Date.now();
  const response = await fetcher(healthUrl, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${keyValue}`,
      Accept: 'application/json',
      'x-restaurant-agent-probe': 'health-only',
    },
  }).catch(error => ({
    ok: false,
    status: 599,
    json: async () => ({ error: error instanceof Error ? error.message : 'runtime_probe_failed' }),
  } as Response));
  const latencyMs = Math.max(0, Date.now() - startedAt);

  return {
    target,
    status: response.ok ? 'ready' : 'unreachable',
    configured: true,
    endpoint,
    healthPath: config.defaultHealthPath,
    statusCode: response.status,
    latencyMs,
    nextAction: response.ok
      ? `${target} health 可达；仍需按 execution package 的 grant/session/policy 决定是否外发。`
      : `${target} health 返回 ${response.status}；检查 runtime、网络、API key 或 health 路径。`,
  };
}

function gate(id: string, ready: boolean, evidence: string, nextAction: string): RestaurantRuntimeProbe['gates'][number] {
  return {
    id,
    status: ready ? 'ready' : 'blocked',
    evidence,
    nextAction,
  };
}

export async function buildRestaurantRuntimeProbe(
  input: {
    env?: EnvMap;
    fetcher?: typeof fetch;
    now?: Date;
  } = {},
): Promise<RestaurantRuntimeProbe> {
  const env = input.env || process.env;
  const fetcher = input.fetcher || fetch;
  const targets = await Promise.all(
    (['lobu', 'openclaw', 'hermes'] as RestaurantRuntimeTarget[]).map(target => probeRuntimeTarget(target, env, fetcher)),
  );
  const gates = [
    gate(
      'callback-secret',
      hasValue(env, 'RESTAURANT_AGENT_CALLBACK_SECRET'),
      hasValue(env, 'RESTAURANT_AGENT_CALLBACK_SECRET') ? 'RESTAURANT_AGENT_CALLBACK_SECRET=configured' : 'RESTAURANT_AGENT_CALLBACK_SECRET=missing',
      '配置签名密钥后，外部 runtime 才能回写 external-receipt。',
    ),
    gate(
      'browser-profile',
      hasValue(env, 'RESTAURANT_AGENT_BROWSER_PROFILE_ID'),
      hasValue(env, 'RESTAURANT_AGENT_BROWSER_PROFILE_ID') ? 'RESTAURANT_AGENT_BROWSER_PROFILE_ID=configured' : 'RESTAURANT_AGENT_BROWSER_PROFILE_ID=missing',
      '配置隔离浏览器 profile，并由商家完成授权登录。',
    ),
    gate(
      'merchant-auth',
      env.RESTAURANT_DIANPING_AUTH_STATUS === 'authorized' || env.RESTAURANT_SOCIAL_AUTH_STATUS === 'authorized',
      `platformAuth=${env.RESTAURANT_DIANPING_AUTH_STATUS || env.RESTAURANT_SOCIAL_AUTH_STATUS || 'missing'}`,
      '至少完成一个门店平台授权后，才能抓取公开回执或线索摘要。',
    ),
    gate(
      'pos-data-contract',
      ['api', 'csv', 'sheet'].includes(env.RESTAURANT_POS_DATA_MODE || '') && hasValue(env, 'RESTAURANT_POS_FIELD_DICTIONARY'),
      `RESTAURANT_POS_DATA_MODE=${env.RESTAURANT_POS_DATA_MODE || 'missing'}`,
      '补 POS 数据模式、字段字典和核销来源后，才能进入真实经营分析。',
    ),
  ];

  return {
    ok: true,
    generatedAt: (input.now || new Date()).toISOString(),
    summary: {
      ready: targets.filter(target => target.status === 'ready').length,
      missingConfig: targets.filter(target => target.status === 'missing-config').length,
      unreachable: targets.filter(target => target.status === 'unreachable').length,
      blockedExternal: gates.filter(item => item.status === 'blocked').length,
      probed: targets.filter(target => target.configured).length,
    },
    targets,
    gates,
    safetyBoundary: 'Runtime probe 只访问 health 端点和 configured/missing 状态；不登录平台、不发布、不读取 POS 或私信；不返回 API key、cookie、token、浏览器 profile 原始值、私信原文或顾客个人信息。',
  };
}

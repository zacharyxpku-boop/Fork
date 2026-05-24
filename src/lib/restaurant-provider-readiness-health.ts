import { buildRestaurantRuntimeProbe, type RestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';
import { buildRestaurantProviderSetupStateSummary, type RestaurantProviderSetupStateSummary } from '@/lib/restaurant-provider-setup-state-store';
import type { RestaurantRuntimeTarget } from '@/lib/restaurant-agent-runtime-bridge';

export type RestaurantProviderReadinessHealthStatus =
  | 'health-ready'
  | 'remembered-not-probed'
  | 'configured-but-unreachable'
  | 'missing-config'
  | 'merchant-auth-gated'
  | 'data-contract-gated';

export type RestaurantProviderReadinessHealthItem = {
  id: string;
  label: string;
  category: 'runtime' | 'callback' | 'merchant-auth' | 'operating-data';
  status: RestaurantProviderReadinessHealthStatus;
  configuredEvidence: string[];
  missingEvidence: string[];
  probeStatus?: RestaurantRuntimeProbe['targets'][number]['status'];
  statusCode?: number;
  latencyMs?: number;
  unlocks: string[];
  nextAction: string;
};

export type RestaurantProviderReadinessHealth = {
  ok: true;
  payloadShape: 'restaurant-provider-readiness-health-v1';
  generatedAt: string;
  summary: {
    items: number;
    healthReady: number;
    rememberedNotProbed: number;
    configuredButUnreachable: number;
    missingConfig: number;
    merchantAuthGated: number;
    dataContractGated: number;
    canEnableExternalAutomation: boolean;
    readinessScore: number;
  };
  providerState: Pick<RestaurantProviderSetupStateSummary, 'payloadShape' | 'summary' | 'provided'>;
  items: RestaurantProviderReadinessHealthItem[];
  nextActions: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

type EnvMap = Record<string, string | undefined>;

const RUNTIME_KEYS: Record<RestaurantRuntimeTarget, { url: string; key: string; label: string; unlocks: string[] }> = {
  lobu: {
    url: 'RESTAURANT_AGENT_LOBU_RUNTIME_URL',
    key: 'RESTAURANT_AGENT_LOBU_API_KEY',
    label: 'Lobu multi-tenant runtime',
    unlocks: ['governed task forwarding', 'external run receipt callback'],
  },
  openclaw: {
    url: 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL',
    key: 'RESTAURANT_AGENT_OPENCLAW_API_KEY',
    label: 'OpenClaw browser runtime',
    unlocks: ['public proof capture', 'browser runbook execution'],
  },
  hermes: {
    url: 'RESTAURANT_AGENT_HERMES_RUNTIME_URL',
    key: 'RESTAURANT_AGENT_HERMES_API_KEY',
    label: 'Hermes persistent agent runtime',
    unlocks: ['memory-backed follow-up', 'long-running browser task loop'],
  },
};

function hasValue(env: EnvMap, key: string) {
  return typeof env[key] === 'string' && env[key]!.trim().length > 0;
}

function hasProvidedKey(provided: RestaurantProviderSetupStateSummary['provided'], key: string) {
  return provided.envKeys.includes(key);
}

function hasAnyProvided(provided: RestaurantProviderSetupStateSummary['provided'], values: string[]) {
  return values.some(value => provided.envKeys.includes(value));
}

function runtimeItem(
  target: RestaurantRuntimeTarget,
  env: EnvMap,
  provided: RestaurantProviderSetupStateSummary['provided'],
  probe: RestaurantRuntimeProbe,
): RestaurantProviderReadinessHealthItem {
  const keys = RUNTIME_KEYS[target];
  const targetProbe = probe.targets.find(item => item.target === target);
  const actualUrl = hasValue(env, keys.url);
  const actualKey = hasValue(env, keys.key);
  const rememberedUrl = hasProvidedKey(provided, keys.url);
  const rememberedKey = hasProvidedKey(provided, keys.key);
  const configuredEvidence = [
    actualUrl ? `${keys.url}:env-configured` : rememberedUrl ? `${keys.url}:remembered` : '',
    actualKey ? `${keys.key}:env-configured` : rememberedKey ? `${keys.key}:remembered` : '',
  ].filter(Boolean);
  const missingEvidence = [
    actualUrl || rememberedUrl ? '' : keys.url,
    actualKey || rememberedKey ? '' : keys.key,
  ].filter(Boolean);

  if (targetProbe?.status === 'ready') {
    return {
      id: `runtime-${target}`,
      label: keys.label,
      category: 'runtime',
      status: 'health-ready',
      configuredEvidence,
      missingEvidence: [],
      probeStatus: targetProbe.status,
      statusCode: targetProbe.statusCode,
      latencyMs: targetProbe.latencyMs,
      unlocks: keys.unlocks,
      nextAction: `${target} health is reachable. Keep it behind governed execution packages and signed receipts.`,
    };
  }

  if (targetProbe?.status === 'unreachable') {
    return {
      id: `runtime-${target}`,
      label: keys.label,
      category: 'runtime',
      status: 'configured-but-unreachable',
      configuredEvidence,
      missingEvidence: [],
      probeStatus: targetProbe.status,
      statusCode: targetProbe.statusCode,
      latencyMs: targetProbe.latencyMs,
      unlocks: keys.unlocks,
      nextAction: `${target} has server env configured but health is not reachable. Check runtime URL, API key, network and health path before enabling external execution.`,
    };
  }

  if (!actualUrl && !actualKey && (rememberedUrl || rememberedKey)) {
    return {
      id: `runtime-${target}`,
      label: keys.label,
      category: 'runtime',
      status: 'remembered-not-probed',
      configuredEvidence,
      missingEvidence,
      probeStatus: targetProbe?.status,
      unlocks: keys.unlocks,
      nextAction: `Setup evidence mentions ${target}, but this server still cannot probe it. Configure the real server-side URL and API key, then run Provider Health again.`,
    };
  }

  if ((actualUrl || actualKey || rememberedUrl || rememberedKey) && (!actualUrl || !actualKey)) {
    return {
      id: `runtime-${target}`,
      label: keys.label,
      category: 'runtime',
      status: 'missing-config',
      configuredEvidence,
      missingEvidence,
      probeStatus: targetProbe?.status,
      unlocks: keys.unlocks,
      nextAction: `${target} is only partially configured. Add the missing server-side URL/key pair before it can be probed.`,
    };
  }

  return {
    id: `runtime-${target}`,
    label: keys.label,
    category: 'runtime',
    status: 'missing-config',
    configuredEvidence,
    missingEvidence,
    probeStatus: targetProbe?.status,
    unlocks: keys.unlocks,
    nextAction: `Configure ${keys.url} and ${keys.key}, or record setup evidence first if the merchant has not supplied runtime access yet.`,
  };
}

function callbackItem(env: EnvMap, provided: RestaurantProviderSetupStateSummary['provided']): RestaurantProviderReadinessHealthItem {
  const key = 'RESTAURANT_AGENT_CALLBACK_SECRET';
  const actual = hasValue(env, key);
  const remembered = hasProvidedKey(provided, key);
  return {
    id: 'callback-secret',
    label: 'Signed proof callback',
    category: 'callback',
    status: actual ? 'health-ready' : remembered ? 'remembered-not-probed' : 'missing-config',
    configuredEvidence: actual ? [`${key}:env-configured`] : remembered ? [`${key}:remembered`] : [],
    missingEvidence: actual || remembered ? [] : [key],
    unlocks: ['external receipt acceptance', 'callback signature verification'],
    nextAction: actual
      ? 'Callback secret is configured. Keep accepting only signed external receipts.'
      : remembered
        ? 'Callback secret is remembered as a required setup item, but this server still needs the real secret value configured outside the UI.'
        : 'Configure the callback secret before any provider can close external execution with a signed receipt.',
  };
}

function merchantAuthItem(env: EnvMap, provided: RestaurantProviderSetupStateSummary['provided']): RestaurantProviderReadinessHealthItem {
  const envAuthorized = env.RESTAURANT_DIANPING_AUTH_STATUS === 'authorized' || env.RESTAURANT_SOCIAL_AUTH_STATUS === 'authorized';
  const remembered = provided.merchantApprovals.length > 0;
  return {
    id: 'merchant-platform-authorization',
    label: 'Merchant platform authorization',
    category: 'merchant-auth',
    status: envAuthorized ? 'health-ready' : 'merchant-auth-gated',
    configuredEvidence: envAuthorized ? ['platform-auth:env-authorized'] : remembered ? provided.merchantApprovals.slice(0, 4) : [],
    missingEvidence: envAuthorized || remembered ? [] : ['Dianping/Meituan, Xiaohongshu, Douyin or WeChat merchant grant'],
    unlocks: ['public platform action scope', 'authorized browser session use'],
    nextAction: envAuthorized
      ? 'At least one merchant platform is authorized. Keep scope, expiry and revocation owner attached to each run.'
      : remembered
        ? 'Merchant approval was recorded, but runtime env is not authorized. Convert the approval into scoped platform login/session before claiming automation.'
        : 'Collect merchant platform authorization, action scope, expiry and revocation owner.',
  };
}

function operatingDataItem(env: EnvMap, provided: RestaurantProviderSetupStateSummary['provided']): RestaurantProviderReadinessHealthItem {
  const modeReady = ['api', 'csv', 'sheet'].includes(env.RESTAURANT_POS_DATA_MODE || '');
  const dictionaryReady = hasValue(env, 'RESTAURANT_POS_FIELD_DICTIONARY');
  const envReady = modeReady && dictionaryReady;
  const remembered = provided.dataContracts.length > 0 || hasAnyProvided(provided, ['RESTAURANT_POS_DATA_MODE', 'RESTAURANT_POS_FIELD_DICTIONARY']);
  return {
    id: 'operating-data-contract',
    label: 'POS, coupon and redemption data contract',
    category: 'operating-data',
    status: envReady ? 'health-ready' : 'data-contract-gated',
    configuredEvidence: envReady
      ? [`RESTAURANT_POS_DATA_MODE:${env.RESTAURANT_POS_DATA_MODE}`, 'RESTAURANT_POS_FIELD_DICTIONARY:env-configured']
      : remembered
        ? [...provided.dataContracts.slice(0, 4), ...provided.envKeys.filter(key => key.startsWith('RESTAURANT_POS_')).slice(0, 2)]
        : [],
    missingEvidence: envReady ? [] : ['aggregate POS/coupon/member field dictionary and import cadence'],
    unlocks: ['true operating analysis', 'redemption reconciliation'],
    nextAction: envReady
      ? 'Operating data contract is configured. Use aggregate/no-PII imports or approved API pulls only.'
      : remembered
        ? 'Data contract evidence exists, but the server still needs POS mode and field dictionary configured before claiming real analysis.'
        : 'Define POS/coupon/member fields, aggregation rules, export cadence and no-PII boundary.',
  };
}

function summarize(items: RestaurantProviderReadinessHealthItem[]) {
  const count = (status: RestaurantProviderReadinessHealthStatus) => items.filter(item => item.status === status).length;
  const healthReady = count('health-ready');
  const hardBlocked = count('missing-config') + count('merchant-auth-gated') + count('data-contract-gated') + count('configured-but-unreachable');
  return {
    items: items.length,
    healthReady,
    rememberedNotProbed: count('remembered-not-probed'),
    configuredButUnreachable: count('configured-but-unreachable'),
    missingConfig: count('missing-config'),
    merchantAuthGated: count('merchant-auth-gated'),
    dataContractGated: count('data-contract-gated'),
    canEnableExternalAutomation: hardBlocked === 0 && healthReady >= 3,
    readinessScore: items.length ? Math.round((healthReady / items.length) * 100) : 0,
  };
}

export async function buildRestaurantProviderReadinessHealth(input: {
  env?: EnvMap;
  fetcher?: typeof fetch;
  providerSetupState?: RestaurantProviderSetupStateSummary;
  runtimeProbe?: RestaurantRuntimeProbe;
  now?: Date;
} = {}): Promise<RestaurantProviderReadinessHealth> {
  const env = input.env || process.env;
  const providerState = input.providerSetupState || buildRestaurantProviderSetupStateSummary(input.now);
  const runtimeProbe = input.runtimeProbe || await buildRestaurantRuntimeProbe({
    env,
    fetcher: input.fetcher,
    now: input.now,
  });
  const runtimeItems = (['lobu', 'openclaw', 'hermes'] as RestaurantRuntimeTarget[])
    .map(target => runtimeItem(target, env, providerState.provided, runtimeProbe));
  const items = [
    ...runtimeItems,
    callbackItem(env, providerState.provided),
    merchantAuthItem(env, providerState.provided),
    operatingDataItem(env, providerState.provided),
  ];
  const summary = summarize(items);
  const nextActions = items
    .filter(item => item.status !== 'health-ready')
    .map(item => item.nextAction)
    .slice(0, 6);

  return {
    ok: true,
    payloadShape: 'restaurant-provider-readiness-health-v1',
    generatedAt: (input.now || new Date()).toISOString(),
    summary,
    providerState: {
      payloadShape: providerState.payloadShape,
      summary: providerState.summary,
      provided: providerState.provided,
    },
    items,
    nextActions,
    externalRequired: items
      .filter(item => item.status !== 'health-ready')
      .flatMap(item => item.missingEvidence.length ? item.missingEvidence : [item.nextAction])
      .slice(0, 8),
    safetyBoundary: 'Provider readiness health only reports configured identifiers, remembered setup evidence, health status codes and next actions. It never returns API key values, cookies, tokens, raw browser profile identifiers, private platform data, POS rows, coupon codes or customer personal data.',
  };
}

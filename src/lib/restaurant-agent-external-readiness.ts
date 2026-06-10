export type RestaurantExternalReadinessStatus = 'ready' | 'blocked';

export type RestaurantExternalReadinessRequirement = {
  id: string;
  label: string;
  configured: boolean;
  source: 'env' | 'merchant-auth' | 'data-contract' | 'operator';
  evidence: string;
};

export type RestaurantExternalReadinessGroup = {
  id: string;
  name: string;
  purpose: string;
  status: RestaurantExternalReadinessStatus;
  requirements: RestaurantExternalReadinessRequirement[];
  nextAction: string;
};

export type RestaurantExternalReadiness = {
  ok: true;
  groups: RestaurantExternalReadinessGroup[];
  summary: {
    total: number;
    ready: number;
    blocked: number;
    configuredRequirements: number;
    totalRequirements: number;
  };
  missingExternal: string[];
  safetyBoundary: string;
};

type EnvMap = Record<string, string | undefined>;

function hasValue(env: EnvMap, key: string): boolean {
  return typeof env[key] === 'string' && env[key]!.trim().length > 0;
}

function envRequirement(env: EnvMap, id: string, label: string, key: string): RestaurantExternalReadinessRequirement {
  return {
    id,
    label,
    configured: hasValue(env, key),
    source: 'env',
    evidence: hasValue(env, key) ? `${key}=configured` : `${key}=missing`,
  };
}

function merchantRequirement(id: string, label: string, configured: boolean, evidence: string): RestaurantExternalReadinessRequirement {
  return {
    id,
    label,
    configured,
    source: 'merchant-auth',
    evidence,
  };
}

function dataRequirement(id: string, label: string, configured: boolean, evidence: string): RestaurantExternalReadinessRequirement {
  return {
    id,
    label,
    configured,
    source: 'data-contract',
    evidence,
  };
}

function group(
  id: string,
  name: string,
  purpose: string,
  requirements: RestaurantExternalReadinessRequirement[],
  nextAction: string,
): RestaurantExternalReadinessGroup {
  return {
    id,
    name,
    purpose,
    requirements,
    status: requirements.every(item => item.configured) ? 'ready' : 'blocked',
    nextAction,
  };
}

export function buildRestaurantExternalReadiness(env: EnvMap = process.env): RestaurantExternalReadiness {
  const groups = [
    group(
      'lobu-runtime',
      'Lobu 多租户 Runtime',
      '把本地 tenant event 投递给 gateway / worker / watcher，并接收执行回执。',
      [
        envRequirement(env, 'lobu-url', 'Lobu 试跑通道地址', 'RESTAURANT_AGENT_LOBU_RUNTIME_URL'),
        envRequirement(env, 'lobu-key', 'Lobu 服务端账号密钥', 'RESTAURANT_AGENT_LOBU_API_KEY'),
        envRequirement(env, 'tenant-policy', '租户隔离策略', 'RESTAURANT_AGENT_TENANT_ISOLATION_POLICY'),
        envRequirement(env, 'callback-secret', '回执 webhook 签名密钥', 'RESTAURANT_AGENT_CALLBACK_SECRET'),
      ],
      '部署或接入 Lobu runtime，配置 URL/key/租户隔离/回执签名后再开启自动 worker。',
    ),
    group(
      'browser-executor',
      'OpenClaw / Hermes 浏览器执行器',
      '让 Agent 在隔离 profile 中打开平台、截图、回写回执，不污染个人浏览器。',
      [
        envRequirement(env, 'openclaw-url', 'OpenClaw 试跑通道地址', 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL'),
        envRequirement(env, 'openclaw-key', 'OpenClaw 服务端账号密钥', 'RESTAURANT_AGENT_OPENCLAW_API_KEY'),
        envRequirement(env, 'hermes-url', 'Hermes 试跑通道地址', 'RESTAURANT_AGENT_HERMES_RUNTIME_URL'),
        envRequirement(env, 'browser-profile', '隔离浏览器 profile id', 'RESTAURANT_AGENT_BROWSER_PROFILE_ID'),
      ],
      '至少接一个浏览器 runtime，并由商家在隔离 profile 中完成平台登录授权。',
    ),
    group(
      'merchant-platform-auth',
      '门店平台授权',
      '连接大众点评/美团、小红书、抖音、微信社群，读取发布证明和线索摘要。',
      [
        merchantRequirement('dianping-auth', '大众点评/美团商家授权', env.RESTAURANT_DIANPING_AUTH_STATUS === 'authorized', `RESTAURANT_DIANPING_AUTH_STATUS=${env.RESTAURANT_DIANPING_AUTH_STATUS || 'missing'}`),
        merchantRequirement('social-auth', '小红书/抖音/微信授权', env.RESTAURANT_SOCIAL_AUTH_STATUS === 'authorized', `RESTAURANT_SOCIAL_AUTH_STATUS=${env.RESTAURANT_SOCIAL_AUTH_STATUS || 'missing'}`),
        merchantRequirement('operator-approval', '代发/代操作审批边界', env.RESTAURANT_AGENT_OPERATOR_APPROVAL === 'approved', `RESTAURANT_AGENT_OPERATOR_APPROVAL=${env.RESTAURANT_AGENT_OPERATOR_APPROVAL || 'missing'}`),
      ],
      '让商家明确授权账号范围、可执行动作、审核规则和可撤销机制。',
    ),
    group(
      'pos-redemption-data',
      'POS / 核销 / 经营数据',
      '把团购券领取、核销、客单、库存和毛利导入真实经营分析。',
      [
        dataRequirement('pos-mode', 'POS 数据模式', ['api', 'csv', 'sheet'].includes(env.RESTAURANT_POS_DATA_MODE || ''), `RESTAURANT_POS_DATA_MODE=${env.RESTAURANT_POS_DATA_MODE || 'missing'}`),
        dataRequirement('pos-dictionary', 'POS 字段字典', hasValue(env, 'RESTAURANT_POS_FIELD_DICTIONARY'), hasValue(env, 'RESTAURANT_POS_FIELD_DICTIONARY') ? 'RESTAURANT_POS_FIELD_DICTIONARY=configured' : 'RESTAURANT_POS_FIELD_DICTIONARY=missing'),
        dataRequirement('redemption-source', '核销数据来源', hasValue(env, 'RESTAURANT_REDEMPTION_SOURCE'), hasValue(env, 'RESTAURANT_REDEMPTION_SOURCE') ? 'RESTAURANT_REDEMPTION_SOURCE=configured' : 'RESTAURANT_REDEMPTION_SOURCE=missing'),
      ],
      '先导入一张字段清晰的 POS/核销样表，再决定是否接 API。',
    ),
  ];

  const ready = groups.filter(item => item.status === 'ready').length;
  const totalRequirements = groups.reduce((sum, item) => sum + item.requirements.length, 0);
  const configuredRequirements = groups.reduce(
    (sum, item) => sum + item.requirements.filter(requirement => requirement.configured).length,
    0,
  );

  return {
    ok: true,
    groups,
    summary: {
      total: groups.length,
      ready,
      blocked: groups.length - ready,
      configuredRequirements,
      totalRequirements,
    },
    missingExternal: groups
      .filter(item => item.status === 'blocked')
      .map(item => `${item.name}: ${item.requirements.filter(requirement => !requirement.configured).map(requirement => requirement.label).join(' / ')}`),
    safetyBoundary: '就绪检查只返回 configured/missing，不返回 API key、cookie、token、私信原文或顾客个人信息。',
  };
}

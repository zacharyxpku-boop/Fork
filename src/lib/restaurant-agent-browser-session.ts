export type RestaurantBrowserRuntimeTarget = 'openclaw' | 'hermes';

export type RestaurantBrowserSessionTool = {
  name: 'browser_open' | 'browser_click' | 'browser_type' | 'browser_screenshot' | 'extract_public_receipt' | 'read_private_message' | 'submit_platform_publish';
  allowed: boolean;
  reason: string;
};

export type RestaurantBrowserSessionManifest = {
  ok: true;
  sessionId: string;
  runtimeTarget: RestaurantBrowserRuntimeTarget;
  mode: 'isolated-browser-handoff';
  canExecuteNow: boolean;
  profile: {
    profileId: string;
    configured: boolean;
    isolation: 'dedicated-restaurant-profile';
  };
  runtime: {
    configured: boolean;
    urlConfigured: boolean;
    callbackSecretConfigured: boolean;
  };
  task: {
    eventId: string;
    restaurant: string;
    offer: string;
    channel: string;
  };
  toolPolicy: RestaurantBrowserSessionTool[];
  evidencePlan: string[];
  stopConditions: string[];
  callbackContract: {
    endpoint: '/api/restaurant-agent/runtime';
    action: 'external-receipt';
    requiredHeader: 'x-restaurant-agent-signature';
    requiredFields: string[];
  };
  handoff: {
    payloadShape: 'restaurant-browser-session-v1';
    safeToSendToExternalRuntime: boolean;
    secretsIncluded: false;
    nextStep: string;
  };
};

type EnvMap = Record<string, string | undefined>;

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 41 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function cleanText(value: unknown, fallback: string, max = 80): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function runtimeUrlKey(target: RestaurantBrowserRuntimeTarget): string {
  return target === 'openclaw' ? 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL' : 'RESTAURANT_AGENT_HERMES_RUNTIME_URL';
}

function runtimeApiKey(target: RestaurantBrowserRuntimeTarget): string {
  return target === 'openclaw' ? 'RESTAURANT_AGENT_OPENCLAW_API_KEY' : 'RESTAURANT_AGENT_HERMES_API_KEY';
}

function hasValue(env: EnvMap, key: string): boolean {
  return typeof env[key] === 'string' && env[key]!.trim().length > 0;
}

export function buildRestaurantBrowserSessionManifest(input: {
  runtimeTarget?: RestaurantBrowserRuntimeTarget;
  eventId?: string;
  restaurant?: string;
  offer?: string;
  channel?: string;
  env?: EnvMap;
} = {}): RestaurantBrowserSessionManifest {
  const env = input.env || process.env;
  const runtimeTarget = input.runtimeTarget || 'openclaw';
  const restaurant = cleanText(input.restaurant, '试用门店');
  const offer = cleanText(input.offer, '今日主推套餐');
  const channel = cleanText(input.channel, '大众点评 / 小红书 / 抖音 / 微信社群');
  const eventId = cleanText(input.eventId, `restaurant-agent-${stableId([runtimeTarget, restaurant, offer, channel])}`, 96);
  const profileConfigured = hasValue(env, 'RESTAURANT_AGENT_BROWSER_PROFILE_ID');
  const urlConfigured = hasValue(env, runtimeUrlKey(runtimeTarget));
  const apiConfigured = hasValue(env, runtimeApiKey(runtimeTarget));
  const callbackSecretConfigured = hasValue(env, 'RESTAURANT_AGENT_CALLBACK_SECRET');
  const canExecuteNow = profileConfigured && urlConfigured && apiConfigured && callbackSecretConfigured;

  return {
    ok: true,
    sessionId: `restaurant-browser-session-${stableId([eventId, runtimeTarget])}`,
    runtimeTarget,
    mode: 'isolated-browser-handoff',
    canExecuteNow,
    profile: {
      profileId: profileConfigured ? 'configured' : 'missing',
      configured: profileConfigured,
      isolation: 'dedicated-restaurant-profile',
    },
    runtime: {
      configured: urlConfigured && apiConfigured,
      urlConfigured,
      callbackSecretConfigured,
    },
    task: {
      eventId,
      restaurant,
      offer,
      channel,
    },
    toolPolicy: [
      { name: 'browser_open', allowed: canExecuteNow, reason: canExecuteNow ? '隔离 profile 和 runtime 已配置。' : '缺少 runtime/profile/callback secret 前只生成 handoff。' },
      { name: 'browser_click', allowed: canExecuteNow, reason: '只允许在商家授权页面内执行白名单步骤。' },
      { name: 'browser_type', allowed: canExecuteNow, reason: '禁止输入验证码、密码、手机号、私信原文或未授权客户信息。' },
      { name: 'browser_screenshot', allowed: canExecuteNow, reason: '仅截取发布证明、审核结果或公开页面，不截取私信原文。' },
      { name: 'extract_public_receipt', allowed: canExecuteNow, reason: '只抽取链接、内容 ID、截图编号、审核状态和失败原因。' },
      { name: 'read_private_message', allowed: false, reason: '私信原文和可识别个人信息不进入系统。' },
      { name: 'submit_platform_publish', allowed: false, reason: '代发布需要额外商家批准和平台审核边界，本 manifest 默认只做证明回写。' },
    ],
    evidencePlan: [
      'platform channel',
      'content id or publish url',
      'screenshot id',
      'external run id',
      'operator',
      'blocked action if any',
      'next action',
    ],
    stopConditions: [
      'login or captcha challenge appears',
      'merchant authorization is missing or expired',
      'page asks for password, SMS code or payment confirmation',
      'private message raw text or personal contact appears',
      'platform policy warning or review failure appears',
      'callback signature cannot be generated',
    ],
    callbackContract: {
      endpoint: '/api/restaurant-agent/runtime',
      action: 'external-receipt',
      requiredHeader: 'x-restaurant-agent-signature',
      requiredFields: ['eventId', 'channel', 'externalRunId or screenshotId or evidenceUrl', 'summary'],
    },
    handoff: {
      payloadShape: 'restaurant-browser-session-v1',
      safeToSendToExternalRuntime: true,
      secretsIncluded: false,
      nextStep: canExecuteNow
        ? `可以把 manifest 投递给 ${runtimeTarget}，执行后用签名 callback 写回回执。`
        : `先配置 ${runtimeUrlKey(runtimeTarget)}、${runtimeApiKey(runtimeTarget)}、RESTAURANT_AGENT_BROWSER_PROFILE_ID 和 RESTAURANT_AGENT_CALLBACK_SECRET。`,
    },
  };
}

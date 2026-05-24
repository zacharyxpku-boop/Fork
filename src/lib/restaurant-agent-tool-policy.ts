import { buildRestaurantBrowserSessionManifest, type RestaurantBrowserSessionTool, type RestaurantBrowserRuntimeTarget } from '@/lib/restaurant-agent-browser-session';
import { buildRestaurantMerchantGrantManifest, type RestaurantGrantAction } from '@/lib/restaurant-agent-grant-manifest';
import type { RestaurantRuntimeTarget } from '@/lib/restaurant-agent-runtime-bridge';

export type RestaurantAgentToolDecision = 'internal-ready' | 'external-ready' | 'blocked' | 'forbidden';

export type RestaurantAgentToolPolicyDecision = {
  action: RestaurantGrantAction;
  decision: RestaurantAgentToolDecision;
  canRunInternally: boolean;
  canRunExternally: boolean;
  mappedBrowserTool?: RestaurantBrowserSessionTool['name'];
  blockedReasons: string[];
  requiredEvidence: string[];
  nextAction: string;
};

export type RestaurantAgentSecretSlot = {
  slot: string;
  configured: boolean;
  exposedToClient: false;
  usedBy: string;
};

export type RestaurantAgentToolPolicyReport = {
  ok: true;
  generatedAt: string;
  target: RestaurantRuntimeTarget;
  browserRuntimeTarget: RestaurantBrowserRuntimeTarget;
  decisions: RestaurantAgentToolPolicyDecision[];
  secretProxy: {
    mode: 'server-side-placeholder-only';
    slots: RestaurantAgentSecretSlot[];
    exposedSecretCount: 0;
  };
  domainPolicy: {
    allowedFamilies: string[];
    blockedFamilies: string[];
  };
  summary: {
    total: number;
    internalReady: number;
    externalReady: number;
    blocked: number;
    forbidden: number;
  };
  safetyBoundary: string;
};

type EnvMap = Record<string, string | undefined>;

const ACTIONS: RestaurantGrantAction[] = [
  'open_public_page',
  'capture_public_receipt',
  'prepare_publish_draft',
  'submit_platform_publish',
  'pull_pos_redemption',
  'summarize_lead_counts',
  'read_private_message',
];

function hasValue(env: EnvMap, key: string): boolean {
  return typeof env[key] === 'string' && env[key]!.trim().length > 0;
}

function browserTargetFor(target: RestaurantRuntimeTarget, requested?: RestaurantBrowserRuntimeTarget): RestaurantBrowserRuntimeTarget {
  if (requested) return requested;
  return target === 'hermes' ? 'hermes' : 'openclaw';
}

function browserToolFor(action: RestaurantGrantAction): RestaurantBrowserSessionTool['name'] | undefined {
  if (action === 'open_public_page') return 'browser_open';
  if (action === 'capture_public_receipt') return 'extract_public_receipt';
  if (action === 'submit_platform_publish') return 'submit_platform_publish';
  if (action === 'summarize_lead_counts') return 'extract_public_receipt';
  if (action === 'read_private_message') return 'read_private_message';
  return undefined;
}

function runtimeSlots(target: RestaurantRuntimeTarget, browserTarget: RestaurantBrowserRuntimeTarget, env: EnvMap): RestaurantAgentSecretSlot[] {
  const targetSlots = target === 'lobu'
    ? ['RESTAURANT_AGENT_LOBU_RUNTIME_URL', 'RESTAURANT_AGENT_LOBU_API_KEY']
    : target === 'hermes'
      ? ['RESTAURANT_AGENT_HERMES_RUNTIME_URL', 'RESTAURANT_AGENT_HERMES_API_KEY']
      : ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', 'RESTAURANT_AGENT_OPENCLAW_API_KEY'];
  const browserSlots = browserTarget === 'hermes'
    ? ['RESTAURANT_AGENT_HERMES_RUNTIME_URL', 'RESTAURANT_AGENT_HERMES_API_KEY']
    : ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', 'RESTAURANT_AGENT_OPENCLAW_API_KEY'];
  return Array.from(new Set([
    ...targetSlots,
    ...browserSlots,
    'RESTAURANT_AGENT_BROWSER_PROFILE_ID',
    'RESTAURANT_AGENT_CALLBACK_SECRET',
    'RESTAURANT_AGENT_OPERATOR_APPROVAL',
    'RESTAURANT_DIANPING_AUTH_STATUS',
    'RESTAURANT_SOCIAL_AUTH_STATUS',
    'RESTAURANT_POS_DATA_MODE',
    'RESTAURANT_POS_FIELD_DICTIONARY',
    'RESTAURANT_REDEMPTION_SOURCE',
  ])).map(slot => ({
    slot,
    configured: hasValue(env, slot),
    exposedToClient: false,
    usedBy: slot.includes('POS') || slot.includes('REDEMPTION')
      ? 'pos-redemption'
      : slot.includes('CALLBACK')
        ? 'signed-receipt-callback'
        : slot.includes('AUTH') || slot.includes('APPROVAL')
          ? 'merchant-grant'
          : 'runtime-bridge',
  }));
}

function nextActionFor(decision: RestaurantAgentToolDecision, action: RestaurantGrantAction, blockedReasons: string[]): string {
  if (decision === 'external-ready') return `${action} 可以交给外部 runtime，但执行后必须用签名回执写回证据。`;
  if (decision === 'internal-ready') return `${action} 只能在本地生成计划、草稿、检查清单或手工导入证据。`;
  if (decision === 'forbidden') return `${action} 永久禁止；只允许导入脱敏聚合摘要，不能读取原文或个人联系方式。`;
  if (blockedReasons.includes('browser_session_not_ready')) return '先补 runtime URL/API key、隔离 profile 和 callback secret，再生成可执行 session。';
  if (blockedReasons.includes('merchant_grant_not_active')) return '先补商家授权、有效期、运营审批和可撤销边界。';
  if (blockedReasons.includes('grant_action_denied')) return '该动作未被 grant manifest 允许，保持人工交接或降级为草稿/证据导入。';
  return '补齐阻断项后重新评估 tool policy。';
}

export function buildRestaurantAgentToolPolicyReport(input: {
  target?: RestaurantRuntimeTarget;
  browserRuntimeTarget?: RestaurantBrowserRuntimeTarget;
  restaurant?: string;
  offer?: string;
  operator?: string;
  expiresAt?: string;
  revoked?: boolean;
  env?: EnvMap;
  now?: Date;
} = {}): RestaurantAgentToolPolicyReport {
  const env = input.env || process.env;
  const target = input.target || 'openclaw';
  const browserRuntimeTarget = browserTargetFor(target, input.browserRuntimeTarget);
  const browserSession = buildRestaurantBrowserSessionManifest({
    runtimeTarget: browserRuntimeTarget,
    restaurant: input.restaurant,
    offer: input.offer,
    env,
  });
  const grantManifest = buildRestaurantMerchantGrantManifest({
    restaurant: input.restaurant,
    operator: input.operator,
    expiresAt: input.expiresAt,
    revoked: input.revoked,
    env,
    now: input.now,
  });

  const decisions = ACTIONS.map(action => {
    const grantPolicy = grantManifest.actionPolicy.find(policy => policy.action === action);
    const mappedBrowserTool = browserToolFor(action);
    const browserPolicy = mappedBrowserTool
      ? browserSession.toolPolicy.find(policy => policy.name === mappedBrowserTool)
      : undefined;
    const internalOnly = action === 'prepare_publish_draft' || action === 'open_public_page';
    const forbidden = action === 'read_private_message';
    const blockedReasons = [
      grantPolicy?.allowed ? '' : 'grant_action_denied',
      grantManifest.merchant.grantStatus === 'active' || internalOnly || forbidden ? '' : 'merchant_grant_not_active',
      !mappedBrowserTool || browserPolicy?.allowed || internalOnly || forbidden ? '' : 'browser_session_not_ready',
      forbidden ? 'private_message_raw_text_forbidden' : '',
    ].filter(Boolean);
    const canRunExternally = !forbidden && !internalOnly && blockedReasons.length === 0;
    const canRunInternally = !forbidden && internalOnly && Boolean(grantPolicy?.allowed);
    const decision: RestaurantAgentToolDecision = forbidden
      ? 'forbidden'
      : canRunExternally
        ? 'external-ready'
        : canRunInternally
          ? 'internal-ready'
          : 'blocked';

    return {
      action,
      decision,
      canRunInternally,
      canRunExternally,
      mappedBrowserTool,
      blockedReasons: Array.from(new Set(blockedReasons)),
      requiredEvidence: grantPolicy?.evidenceRequired || [],
      nextAction: nextActionFor(decision, action, blockedReasons),
    } satisfies RestaurantAgentToolPolicyDecision;
  });

  return {
    ok: true,
    generatedAt: (input.now || new Date()).toISOString(),
    target,
    browserRuntimeTarget,
    decisions,
    secretProxy: {
      mode: 'server-side-placeholder-only',
      slots: runtimeSlots(target, browserRuntimeTarget, env),
      exposedSecretCount: 0,
    },
    domainPolicy: {
      allowedFamilies: ['public restaurant pages', 'authorized merchant platform pages', 'authorized POS export endpoint'],
      blockedFamilies: ['private messages', 'payment confirmation', 'captcha or SMS challenge', 'personal contact fields'],
    },
    summary: {
      total: decisions.length,
      internalReady: decisions.filter(decision => decision.decision === 'internal-ready').length,
      externalReady: decisions.filter(decision => decision.decision === 'external-ready').length,
      blocked: decisions.filter(decision => decision.decision === 'blocked').length,
      forbidden: decisions.filter(decision => decision.decision === 'forbidden').length,
    },
    safetyBoundary: 'Tool policy 只返回动作级 allowed/blocked、缺失条件和 secret slot 配置状态；不返回 API key、cookie、token、验证码、密码、手机号、微信号或私信原文。',
  };
}

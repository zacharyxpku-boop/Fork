import type { RestaurantStaffNotificationDraft, RestaurantStaffNotificationHandoff } from '@/lib/restaurant-staff-notification-handoff';

export type RestaurantStaffNotificationDeliveryItem = {
  id: string;
  draftId: string;
  channel: RestaurantStaffNotificationDraft['channel'];
  owner: string;
  status: 'ready-for-manual-copy' | 'ready-for-provider' | 'blocked';
  provider: 'manual-copy' | 'work-chat' | 'sms';
  payloadPreview: {
    subject: string;
    message: string;
    evidenceRequired: string;
  };
  missing: string[];
  nextAction: string;
  safetyBoundary: string;
};

export type RestaurantStaffNotificationDeliveryBridge = {
  ok: true;
  payloadShape: 'restaurant-staff-notification-delivery-bridge-v1';
  generatedAt: string;
  summary: {
    items: number;
    manualReady: number;
    providerReady: number;
    blocked: number;
    missingRequirements: number;
  };
  items: RestaurantStaffNotificationDeliveryItem[];
  envTemplate: Array<{
    key: string;
    value: '<configure-server-side>';
    unlocks: string[];
  }>;
  externalRequired: string[];
  safetyBoundary: string;
};

type EnvMap = Record<string, string | undefined>;

function hasValue(env: EnvMap, key: string): boolean {
  return typeof env[key] === 'string' && env[key]!.trim().length > 0;
}

function requirementsFor(draft: RestaurantStaffNotificationDraft, env: EnvMap): string[] {
  if (draft.channel === 'internal-copy') return [];
  if (draft.channel === 'work-chat') {
    return [
      hasValue(env, 'RESTAURANT_STAFF_WORKCHAT_WEBHOOK_URL') ? '' : 'RESTAURANT_STAFF_WORKCHAT_WEBHOOK_URL',
      hasValue(env, 'RESTAURANT_STAFF_RECIPIENT_MAP') ? '' : 'RESTAURANT_STAFF_RECIPIENT_MAP',
      env.RESTAURANT_STAFF_NOTIFY_APPROVAL === 'approved' ? '' : 'RESTAURANT_STAFF_NOTIFY_APPROVAL=approved',
    ].filter(Boolean);
  }
  return [
    hasValue(env, 'RESTAURANT_STAFF_SMS_PROVIDER_URL') ? '' : 'RESTAURANT_STAFF_SMS_PROVIDER_URL',
    hasValue(env, 'RESTAURANT_STAFF_SMS_API_KEY') ? '' : 'RESTAURANT_STAFF_SMS_API_KEY',
    hasValue(env, 'RESTAURANT_STAFF_RECIPIENT_MAP') ? '' : 'RESTAURANT_STAFF_RECIPIENT_MAP',
    env.RESTAURANT_STAFF_NOTIFY_APPROVAL === 'approved' ? '' : 'RESTAURANT_STAFF_NOTIFY_APPROVAL=approved',
  ].filter(Boolean);
}

function itemFor(draft: RestaurantStaffNotificationDraft, env: EnvMap): RestaurantStaffNotificationDeliveryItem {
  const missing = requirementsFor(draft, env);
  const provider = draft.channel === 'sms' ? 'sms' : draft.channel === 'work-chat' ? 'work-chat' : 'manual-copy';
  const status = draft.channel === 'internal-copy'
    ? 'ready-for-manual-copy'
    : missing.length
      ? 'blocked'
      : 'ready-for-provider';

  return {
    id: `delivery-${draft.id}`,
    draftId: draft.id,
    channel: draft.channel,
    owner: draft.owner,
    status,
    provider,
    payloadPreview: {
      subject: draft.subject,
      message: draft.message,
      evidenceRequired: draft.evidenceRequired,
    },
    missing,
    nextAction: status === 'blocked'
      ? `Configure ${missing[0]} before provider delivery; keep using manual copy meanwhile.`
      : status === 'ready-for-provider'
        ? '只通过带审计日志和撤销负责人的服务端通道代码转发。'
        : '把这份草稿复制到店长批准的内部员工群，凭证复核后再把任务标记完成。',
    safetyBoundary: '投递通道在本次请求里不发任何消息，也绝不包含密钥、手机号、微信号、私信原文、券码、POS 行、cookies、tokens 或平台凭据。',
  };
}

export function buildRestaurantStaffNotificationDeliveryBridge(input: {
  handoff: RestaurantStaffNotificationHandoff;
  env?: EnvMap;
  now?: Date;
}): RestaurantStaffNotificationDeliveryBridge {
  const env = input.env || process.env;
  const items = input.handoff.drafts.map(draft => itemFor(draft, env));
  const missingKeys = Array.from(new Set(items.flatMap(item => item.missing)));

  return {
    ok: true,
    payloadShape: 'restaurant-staff-notification-delivery-bridge-v1',
    generatedAt: (input.now || new Date()).toISOString(),
    summary: {
      items: items.length,
      manualReady: items.filter(item => item.status === 'ready-for-manual-copy').length,
      providerReady: items.filter(item => item.status === 'ready-for-provider').length,
      blocked: items.filter(item => item.status === 'blocked').length,
      missingRequirements: missingKeys.length,
    },
    items,
    envTemplate: missingKeys.map(key => ({
      key,
      value: '<configure-server-side>' as const,
      unlocks: ['staff-provider-delivery', 'delivery-audit-log', 'owner-escalation'],
    })),
    externalRequired: [
      '企业微信/短信通道的凭据必须留在服务端。',
      '店长必须确认员工接收名单和撤销负责人。',
      '这条通道不做面向顾客的投递。',
    ],
    safetyBoundary: '员工通知投递通道只准备安全投递内容和就绪状态。不发消息、不触达顾客、不暴露凭据、不存隐私、不核销、不拉 POS 行、不绕过店长确认。',
  };
}

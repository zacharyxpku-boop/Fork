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
        ? 'Forward only through server-side provider code with audit logging and revocation owner.'
        : 'Copy this draft into the merchant-approved internal staff channel and then mark the task done after evidence review.',
    safetyBoundary: 'Delivery bridge never sends messages in this request and never includes secrets, phone numbers, WeChat IDs, private-message raw text, coupon codes, POS rows, cookies, tokens, or platform credentials.',
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
      'Work-chat/SMS provider credentials must stay server-side.',
      'Merchant must approve staff recipient mapping and revocation owner.',
      'Customer-facing delivery is out of scope for this bridge.',
    ],
    safetyBoundary: 'Staff Notification Delivery Bridge prepares provider-safe delivery payloads and readiness only. It does not send messages, contact customers, expose credentials, store PII, redeem coupons, pull POS rows, or bypass merchant approval.',
  };
}

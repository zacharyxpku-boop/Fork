import type { RestaurantStoreManagerTaskWatcher } from '@/lib/restaurant-store-manager-task-watcher';

export type RestaurantStaffNotificationDraft = {
  id: string;
  channel: 'internal-copy' | 'work-chat' | 'sms';
  owner: string;
  priority: 'high' | 'medium' | 'low';
  subject: string;
  message: string;
  evidenceRequired: string;
  sendGate: 'copy-ready' | 'provider-required';
  providerRequired: string[];
  stopLine: string;
};

export type RestaurantStaffNotificationHandoff = {
  ok: true;
  payloadShape: 'restaurant-staff-notification-handoff-v1';
  generatedAt: string;
  summary: {
    drafts: number;
    copyReady: number;
    providerRequired: number;
    highPriority: number;
  };
  drafts: RestaurantStaffNotificationDraft[];
  externalRequired: string[];
  operatorChecklist: string[];
  safetyBoundary: string;
};

function stableId(input: string): string {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 43 + input.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function channelForOwner(owner: string): RestaurantStaffNotificationDraft['channel'] {
  if (/community|社群|私域/i.test(owner)) return 'work-chat';
  if (/store-manager|shift-lead|店长|班/i.test(owner)) return 'internal-copy';
  return 'internal-copy';
}

export function buildRestaurantStaffNotificationHandoff(
  watcher: RestaurantStoreManagerTaskWatcher,
  now = new Date(),
): RestaurantStaffNotificationHandoff {
  const drafts = watcher.wakeups.slice(0, 8).map(wakeup => {
    const channel = channelForOwner(wakeup.owner);
    const providerRequired = channel === 'internal-copy'
      ? []
      : ['Approved merchant work-chat provider', 'Staff recipient mapping', 'Revocation owner and send audit log'];
    return {
      id: `staff-notice-${stableId(`${wakeup.id}:${wakeup.owner}`)}`,
      channel,
      owner: wakeup.owner,
      priority: wakeup.priority,
      subject: `${wakeup.priority.toUpperCase()} / ${wakeup.owner} follow-up needed`,
      message: [
        wakeup.reason,
        `Next action: ${wakeup.nextAction}`,
        `Evidence required: ${wakeup.evidenceRequired}`,
        `Escalation: ${wakeup.escalation}`,
      ].join('\n'),
      evidenceRequired: wakeup.evidenceRequired,
      sendGate: providerRequired.length ? 'provider-required' as const : 'copy-ready' as const,
      providerRequired,
      stopLine: 'Do not send to customers, do not include phone numbers, WeChat IDs, private-message raw text, coupon codes, POS rows, cookies, tokens, or platform credentials.',
    };
  });
  const copyReady = drafts.filter(draft => draft.sendGate === 'copy-ready').length;
  const providerRequired = drafts.length - copyReady;

  return {
    ok: true,
    payloadShape: 'restaurant-staff-notification-handoff-v1',
    generatedAt: now.toISOString(),
    summary: {
      drafts: drafts.length,
      copyReady,
      providerRequired,
      highPriority: drafts.filter(draft => draft.priority === 'high').length,
    },
    drafts,
    externalRequired: [
      'Automatic staff delivery requires approved work-chat/SMS provider credentials and recipient mapping.',
      'Customer-facing messages require merchant authorization and a separate no-PII policy review.',
      'POS/coupon closeout notifications require sanitized aggregate data or provider callback.',
    ],
    operatorChecklist: [
      'Review the stop line before sending any staff message.',
      'Attach only public proof links, screenshot ids, signed callback ids, or sanitized aggregate evidence.',
      'If evidence is missing, keep the task blocked instead of claiming execution.',
      'After the owner confirms completion, mark the task done in the command center.',
    ],
    safetyBoundary: 'Staff Notification Handoff prepares internal reminder drafts only. It does not send external notifications, contact customers, read private chats, expose PII, redeem coupons, pull POS rows, or access merchant work-chat without approved provider configuration.',
  };
}

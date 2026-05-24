import type { RestaurantCommandRoute } from '@/lib/restaurant-command-router';
import type { RestaurantCapabilityTrainingPlan } from '@/lib/restaurant-capability-training';
import type { RestaurantProviderSetupStateSummary } from '@/lib/restaurant-provider-setup-state-store';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantCustomerDemandChannel = {
  id: string;
  name: string;
  job: 'phone-order' | 'chat-inquiry' | 'reservation' | 'coupon-lead' | 'delivery-order' | 'loyalty-winback';
  status: 'internal-ready' | 'provider-gated' | 'needs-training' | 'blocked-sensitive';
  internalNow: string[];
  externalRequired: string[];
  evidenceRequired: string[];
  owner: 'ops' | 'store-manager' | 'runtime-admin' | 'merchant';
  nextAction: string;
};

export type RestaurantCustomerDemandGateway = {
  ok: true;
  payloadShape: 'restaurant-customer-demand-gateway-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  summary: {
    channels: number;
    internalReady: number;
    providerGated: number;
    needsTraining: number;
    blockedSensitive: number;
    canClaimAutoCustomerContact: false;
    canClaimAutoOrderTaking: boolean;
  };
  channels: RestaurantCustomerDemandChannel[];
  intakeSchema: Array<{
    field: string;
    purpose: string;
    storage: 'allowed-aggregate' | 'allowed-operational' | 'forbidden-raw-private';
    example: string;
  }>;
  staffHandoff: Array<{
    owner: string;
    action: string;
    evidenceRequired: string;
  }>;
  externalRequired: string[];
  customerPromise: string;
  safetyBoundary: string;
};

type GatewayInput = RestaurantTrialIntake & {
  commandRoute?: RestaurantCommandRoute;
  capabilityTrainingPlan: RestaurantCapabilityTrainingPlan;
  providerSetupState: Pick<RestaurantProviderSetupStateSummary, 'provided' | 'summary'>;
  now?: Date;
};

function clean(value: unknown, fallback: string, max = 120): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function unique(values: string[], limit = 12) {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function hasProvider(input: GatewayInput, patterns: string[]) {
  const configured = [
    ...input.providerSetupState.provided.envKeys,
    ...input.providerSetupState.provided.merchantApprovals,
    ...input.providerSetupState.provided.dataContracts,
  ].join(' | ').toLowerCase();
  return patterns.some(pattern => configured.includes(pattern.toLowerCase()));
}

function trainingMissing(input: GatewayInput, capabilityId: string) {
  const item = input.capabilityTrainingPlan.items.find(planItem => planItem.id === capabilityId);
  return item?.missingTrainingMaterials.slice(0, 3) || [];
}

function statusFor(input: GatewayInput, capabilityId: string, providerPatterns: string[]): RestaurantCustomerDemandChannel['status'] {
  if (input.commandRoute?.verdict === 'blocked-sensitive') return 'blocked-sensitive';
  if (trainingMissing(input, capabilityId).length > 0) return 'needs-training';
  return hasProvider(input, providerPatterns) ? 'internal-ready' : 'provider-gated';
}

export function buildRestaurantCustomerDemandGateway(input: GatewayInput): RestaurantCustomerDemandGateway {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, 'Trial restaurant');
  const offer = clean(input.offer, 'Today featured set meal');
  const audience = clean(input.audience, 'nearby guests');
  const visitReason = clean(input.visitReason, 'merchant-approved visit reason');

  const baseChannels: RestaurantCustomerDemandChannel[] = [
    {
      id: 'phone-ai-reception',
      name: 'AI phone receptionist',
      job: 'phone-order',
      status: statusFor(input, 'auto-acquisition-followup', ['VOICE', 'TWILIO', 'PHONE', 'CALL']),
      internalNow: [
        'Build menu FAQ and objection-handling script.',
        'Generate order-intent extraction schema for staff review.',
        'Prepare missed-call callback queue without dialing customers.',
      ],
      externalRequired: ['voice provider number', 'call recording consent policy', 'menu/order webhook', 'store phone forwarding approval'],
      evidenceRequired: ['approved menu FAQ', 'call handling policy', 'staff escalation rule', 'test call receipt'],
      owner: 'runtime-admin',
      nextAction: 'Configure a voice provider and merchant call-forwarding approval before claiming 24/7 phone automation.',
    },
    {
      id: 'wechat-sms-inquiry',
      name: 'WeChat/SMS inquiry capture',
      job: 'chat-inquiry',
      status: statusFor(input, 'auto-acquisition-followup', ['WECOM', 'WECHAT', 'SMS', 'WHATSAPP']),
      internalNow: [
        'Classify inquiry screenshots into reservation, coupon, visit intent and complaint buckets.',
        'Draft merchant-approved replies for staff to send manually.',
        'Create aggregate lead counts by source without storing private chat text.',
      ],
      externalRequired: ['WeCom/WeChat/SMS/WhatsApp provider', 'merchant recipient-role grant', 'no raw private-message storage contract'],
      evidenceRequired: ['aggregate inquiry count', 'source channel', 'approved reply script', 'staff owner'],
      owner: 'store-manager',
      nextAction: 'Use staff-only handoff until messaging provider and customer-contact authorization are configured.',
    },
    {
      id: 'reservation-intake',
      name: 'Reservation and waitlist intake',
      job: 'reservation',
      status: statusFor(input, 'auto-acquisition-followup', ['RESERVATION', 'BOOKING', 'WAITLIST']),
      internalNow: [
        `Turn ${audience} demand into capacity questions for the shift lead.`,
        'Generate reservation confirmation checklist for manual staff use.',
        'Flag capacity conflicts before promising a table.',
      ],
      externalRequired: ['reservation provider API or export', 'table capacity source', 'merchant confirmation rules'],
      evidenceRequired: ['service window', 'table capacity', 'manual reservation count', 'staff confirmation note'],
      owner: 'store-manager',
      nextAction: 'Collect service-window capacity and reservation data contract before enabling automatic confirmations.',
    },
    {
      id: 'coupon-lead-capture',
      name: 'Coupon and group-buy lead capture',
      job: 'coupon-lead',
      status: statusFor(input, 'auto-acquisition-followup', ['COUPON', 'GROUPBUY', 'DIANPING', 'MEITUAN']),
      internalNow: [
        `Build lead-routing checklist for ${offer}.`,
        'Validate coupon rules and forbidden claims before publishing.',
        'Create store-manager follow-up tasks from aggregate claim counts.',
      ],
      externalRequired: ['Dianping/Meituan merchant grant', 'coupon aggregate export', 'redemption callback or signed receipt'],
      evidenceRequired: ['coupon rule screenshot', 'aggregate claim count', 'redemption aggregate', 'public proof link or screenshot id'],
      owner: 'ops',
      nextAction: 'Require coupon rule proof and redemption aggregate before talking about conversion or ROI.',
    },
    {
      id: 'delivery-pos-order-bridge',
      name: 'Delivery/POS order bridge',
      job: 'delivery-order',
      status: statusFor(input, 'redemption-operating-analytics', ['POS', 'DELIVERY', 'UBER', 'RAPPI', 'MEITUAN']),
      internalNow: [
        'Validate sanitized POS/export fields.',
        'Prepare kitchen handoff schema without payment ids or member ids.',
        'Detect missing menu item, stock and modifier fields before runtime handoff.',
      ],
      externalRequired: ['POS API/export contract', 'delivery dispatch provider', 'kitchen printer or order webhook', 'field dictionary'],
      evidenceRequired: ['business date', 'order aggregate', 'redemption aggregate', 'field dictionary', 'provider test receipt'],
      owner: 'runtime-admin',
      nextAction: 'Do not pull raw orders; first pass a sanitized aggregate import and provider test receipt.',
    },
    {
      id: 'loyalty-winback',
      name: 'Loyalty and win-back campaign',
      job: 'loyalty-winback',
      status: statusFor(input, 'auto-acquisition-followup', ['LOYALTY', 'CRM', 'MEMBER']),
      internalNow: [
        `Create a staff-reviewed ${visitReason} campaign concept.`,
        'Segment only by merchant-provided aggregate tags.',
        'Draft welcome, birthday and win-back copy for manual approval.',
      ],
      externalRequired: ['CRM/member system authorization', 'opt-in status source', 'message delivery provider', 'unsubscribe handling'],
      evidenceRequired: ['aggregate segment size', 'opt-in policy', 'approved copy', 'delivery receipt if sent externally'],
      owner: 'merchant',
      nextAction: 'Keep as draft-only until CRM opt-in source and delivery provider are configured.',
    },
  ];

  const channels = baseChannels.map((channel): RestaurantCustomerDemandChannel => {
    if (channel.status === 'needs-training') {
      return {
        ...channel,
        nextAction: `Train missing materials first: ${trainingMissing(input, channel.id === 'delivery-pos-order-bridge' ? 'redemption-operating-analytics' : 'auto-acquisition-followup').join(' / ')}`,
      };
    }
    if (channel.status === 'blocked-sensitive') {
      return {
        ...channel,
        nextAction: 'Rewrite the command without customer identifiers, private chats, phone numbers, coupon codes, secrets or raw POS rows.',
      };
    }
    return channel;
  });

  const externalRequired = unique(channels.flatMap(channel => channel.status === 'internal-ready' ? [] : channel.externalRequired));
  const providerGated = channels.filter(channel => channel.status === 'provider-gated').length;
  const needsTraining = channels.filter(channel => channel.status === 'needs-training').length;
  const blockedSensitive = channels.filter(channel => channel.status === 'blocked-sensitive').length;

  return {
    ok: true,
    payloadShape: 'restaurant-customer-demand-gateway-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    summary: {
      channels: channels.length,
      internalReady: channels.filter(channel => channel.status === 'internal-ready').length,
      providerGated,
      needsTraining,
      blockedSensitive,
      canClaimAutoCustomerContact: false,
      canClaimAutoOrderTaking: providerGated === 0 && needsTraining === 0 && blockedSensitive === 0,
    },
    channels,
    intakeSchema: [
      { field: 'source_channel', purpose: 'Know whether the lead came from phone, chat, public platform, coupon, reservation or delivery.', storage: 'allowed-aggregate', example: 'Dianping aggregate inquiry count' },
      { field: 'guest_need', purpose: 'Classify intent without storing raw private chat content.', storage: 'allowed-operational', example: 'reservation / coupon question / waitlist / complaint' },
      { field: 'party_size_time_window', purpose: 'Let staff confirm capacity before promising a table.', storage: 'allowed-operational', example: '4 guests, dinner window' },
      { field: 'customer_identifier', purpose: 'Direct identifiers are forbidden in this workbench payload.', storage: 'forbidden-raw-private', example: 'phone number, WeChat ID, openid, payment id' },
      { field: 'order_or_redemption_row', purpose: 'Raw POS rows must stay outside this UI; use sanitized aggregate imports.', storage: 'forbidden-raw-private', example: 'raw order id, payment id, member id' },
    ],
    staffHandoff: [
      { owner: 'store-manager', action: 'Approve offer rules, capacity and staff reply script.', evidenceRequired: 'merchant-approved script and service-window capacity' },
      { owner: 'ops', action: 'Convert public proof and aggregate lead counts into next-loop content and follow-up tasks.', evidenceRequired: 'public link/screenshot id and aggregate counts' },
      { owner: 'runtime-admin', action: 'Wire provider callbacks only after server-side config and merchant grants are present.', evidenceRequired: 'provider health, callback receipt and data contract' },
    ],
    externalRequired,
    customerPromise: externalRequired.length
      ? 'We can prepare the customer-demand operating layer internally today, but automatic customer contact, order taking, delivery dispatch and POS analysis require provider grants and receipts.'
      : 'Provider gates appear configured by label; run health checks and signed receipts before claiming external automation.',
    safetyBoundary: 'Customer Demand Gateway never contacts customers, answers calls, sends messages, confirms reservations, dispatches delivery, redeems coupons, reads private chats, stores customer identifiers, stores raw POS rows, exposes secrets, or claims automated revenue without merchant authorization, opt-in/data contracts and provider receipts.',
  };
}

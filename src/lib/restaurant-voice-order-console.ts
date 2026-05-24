import type { RestaurantCustomerDemandGateway } from '@/lib/restaurant-customer-demand-gateway';
import type { RestaurantProviderSetupStateSummary } from '@/lib/restaurant-provider-setup-state-store';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantVoiceOrderIntent = {
  id: string;
  label: string;
  status: 'internal-ready' | 'provider-gated' | 'needs-staff-review' | 'blocked-sensitive';
  confidence: 'high' | 'medium' | 'low';
  customerNeed: string;
  safeResponse: string;
  staffEscalation: string;
  evidenceRequired: string[];
};

export type RestaurantVoiceOrderDraft = {
  id: string;
  status: 'draft-only' | 'ready-for-staff-review' | 'provider-gated' | 'blocked-sensitive';
  serviceMode: 'dine-in' | 'pickup' | 'delivery' | 'reservation' | 'coupon-question';
  items: Array<{
    name: string;
    quantity: number;
    modifiers: string[];
    evidenceRequired: string;
  }>;
  missingFields: string[];
  handoffTo: 'store-manager' | 'shift-lead' | 'cashier' | 'runtime-admin';
  nextAction: string;
};

export type RestaurantVoiceOrderConsole = {
  ok: true;
  payloadShape: 'restaurant-voice-order-console-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  summary: {
    intents: number;
    internalReady: number;
    providerGated: number;
    staffReview: number;
    orderDrafts: number;
    canAnswerCallsNow: boolean;
    canWriteOrdersNow: boolean;
    canTakePaymentNow: boolean;
    canDispatchDeliveryNow: boolean;
  };
  menuKnowledge: Array<{
    topic: string;
    answer: string;
    sourceRequired: string;
  }>;
  intents: RestaurantVoiceOrderIntent[];
  orderDrafts: RestaurantVoiceOrderDraft[];
  syncGates: Array<{
    id: string;
    label: string;
    status: 'ready-by-label' | 'missing-provider' | 'forbidden-in-client';
    requiredEvidence: string[];
    nextAction: string;
  }>;
  staffTakeoverRules: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

type VoiceOrderInput = RestaurantTrialIntake & {
  customerDemandGateway: RestaurantCustomerDemandGateway;
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

function providerEvidence(input: VoiceOrderInput) {
  return [
    ...input.providerSetupState.provided.envKeys,
    ...input.providerSetupState.provided.merchantApprovals,
    ...input.providerSetupState.provided.dataContracts,
  ].join(' | ').toLowerCase();
}

function hasProvider(input: VoiceOrderInput, patterns: string[]) {
  const evidence = providerEvidence(input);
  return patterns.some(pattern => evidence.includes(pattern.toLowerCase()));
}

function demandStatus(input: VoiceOrderInput, job: RestaurantCustomerDemandGateway['channels'][number]['job']) {
  return input.customerDemandGateway.channels.find(channel => channel.job === job)?.status || 'provider-gated';
}

function intentStatus(input: VoiceOrderInput, job: RestaurantCustomerDemandGateway['channels'][number]['job']): RestaurantVoiceOrderIntent['status'] {
  const status = demandStatus(input, job);
  if (status === 'blocked-sensitive') return 'blocked-sensitive';
  if (status === 'internal-ready') return 'internal-ready';
  if (status === 'needs-training') return 'needs-staff-review';
  return 'provider-gated';
}

function gate(input: VoiceOrderInput, id: string, label: string, patterns: string[], requiredEvidence: string[]) {
  const ready = hasProvider(input, patterns);
  return {
    id,
    label,
    status: ready ? 'ready-by-label' as const : 'missing-provider' as const,
    requiredEvidence,
    nextAction: ready
      ? 'Run a health check and signed callback before claiming live automation.'
      : `Collect ${requiredEvidence.slice(0, 2).join(' and ')} before enabling this lane.`,
  };
}

export function buildRestaurantVoiceOrderConsole(input: VoiceOrderInput): RestaurantVoiceOrderConsole {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, input.customerDemandGateway.restaurant);
  const offer = clean(input.offer, input.customerDemandGateway.offer);
  const audience = clean(input.audience, 'nearby guests');
  const visitReason = clean(input.visitReason, 'merchant-approved visit reason');
  const voiceReady = hasProvider(input, ['VOICE', 'TWILIO', 'PHONE', 'CALL']);
  const posReady = hasProvider(input, ['POS', 'ORDER', 'MENU']);
  const paymentReady = hasProvider(input, ['PAYMENT', 'STRIPE', 'WECHAT_PAY', 'ALIPAY']);
  const deliveryReady = hasProvider(input, ['DELIVERY', 'UBER', 'RAPPI', 'MEITUAN']);

  const intents: RestaurantVoiceOrderIntent[] = [
    {
      id: 'menu-hours-faq',
      label: 'Menu and hours FAQ',
      status: intentStatus(input, 'phone-order') === 'blocked-sensitive' ? 'blocked-sensitive' : 'needs-staff-review',
      confidence: 'high',
      customerNeed: `${audience} asks what ${offer} includes and whether the store can serve now.`,
      safeResponse: `Answer only from approved menu, hours, price and availability evidence for ${restaurant}.`,
      staffEscalation: 'Escalate if menu price, allergen, sold-out status or wait time is missing.',
      evidenceRequired: ['approved menu', 'store hours', 'price/allergen notes', 'sold-out policy'],
    },
    {
      id: 'reservation-or-waitlist',
      label: 'Reservation or waitlist',
      status: intentStatus(input, 'reservation'),
      confidence: 'medium',
      customerNeed: `Guest asks whether ${visitReason} is possible.`,
      safeResponse: 'Collect party size and time window for staff review; do not promise a table without capacity proof.',
      staffEscalation: 'Escalate to shift lead when requested time is within service peak or capacity is missing.',
      evidenceRequired: ['party size', 'time window', 'capacity source', 'staff confirmation note'],
    },
    {
      id: 'coupon-or-groupbuy',
      label: 'Coupon and group-buy question',
      status: intentStatus(input, 'coupon-lead'),
      confidence: 'medium',
      customerNeed: `Guest asks how to use or redeem ${offer}.`,
      safeResponse: 'Explain only merchant-approved coupon rules; do not redeem or modify coupon state.',
      staffEscalation: 'Escalate when coupon validity, exclusions or redemption count are missing.',
      evidenceRequired: ['coupon rule screenshot', 'public proof link or screenshot id', 'redemption aggregate if available'],
    },
    {
      id: 'pickup-or-delivery-order',
      label: 'Pickup or delivery order draft',
      status: intentStatus(input, 'delivery-order'),
      confidence: posReady && deliveryReady ? 'high' : 'low',
      customerNeed: `Guest wants to order ${offer} for pickup or delivery.`,
      safeResponse: 'Create a staff-reviewed order draft; do not write to POS, charge payment or dispatch delivery without providers.',
      staffEscalation: 'Escalate if modifier, stock, delivery address, payment or kitchen handoff is missing.',
      evidenceRequired: ['menu item mapping', 'modifier rules', 'stock signal', 'POS/order provider receipt'],
    },
  ];

  const orderDrafts: RestaurantVoiceOrderDraft[] = [
    {
      id: 'draft-featured-offer',
      status: posReady ? 'ready-for-staff-review' : 'provider-gated',
      serviceMode: 'pickup',
      items: [
        {
          name: offer,
          quantity: 1,
          modifiers: ['spice level pending', 'pickup time pending'],
          evidenceRequired: 'menu item id, price, modifier rules and stock confirmation',
        },
      ],
      missingFields: [
        ...(!posReady ? ['POS menu item id'] : []),
        'guest-approved pickup time',
        'staff stock confirmation',
      ],
      handoffTo: posReady ? 'cashier' : 'runtime-admin',
      nextAction: posReady
        ? 'Ask staff to review the draft and confirm stock before any POS write.'
        : 'Map menu item, modifiers and stock source before enabling order write.',
    },
    {
      id: 'draft-reservation',
      status: demandStatus(input, 'reservation') === 'internal-ready' ? 'ready-for-staff-review' : 'provider-gated',
      serviceMode: 'reservation',
      items: [],
      missingFields: ['party size', 'time window', 'table capacity', 'staff confirmation'],
      handoffTo: 'shift-lead',
      nextAction: 'Collect capacity proof and staff confirmation before promising a table.',
    },
  ];

  const syncGates = [
    gate(input, 'voice-provider', 'Voice provider and call forwarding', ['VOICE', 'TWILIO', 'PHONE', 'CALL'], ['voice provider number', 'call recording consent', 'test call receipt']),
    gate(input, 'pos-order-write', 'POS/menu/order write', ['POS', 'ORDER', 'MENU'], ['POS API/export contract', 'menu item ids', 'field dictionary', 'test order receipt']),
    gate(input, 'payment-capture', 'Payment capture', ['PAYMENT', 'STRIPE', 'WECHAT_PAY', 'ALIPAY'], ['payment provider authorization', 'refund policy', 'signed payment callback']),
    gate(input, 'delivery-dispatch', 'Delivery dispatch', ['DELIVERY', 'UBER', 'RAPPI', 'MEITUAN'], ['delivery provider contract', 'address handling policy', 'dispatch receipt']),
    {
      id: 'private-customer-data',
      label: 'Private customer data',
      status: 'forbidden-in-client' as const,
      requiredEvidence: ['never return phone, WeChat ID, openid, payment id, address or raw transcript to this client payload'],
      nextAction: 'Keep direct identifiers inside approved provider systems; this console only shows sanitized intent and staff handoff.',
    },
  ];

  const externalRequired = unique([
    ...syncGates.filter(item => item.status === 'missing-provider').flatMap(item => item.requiredEvidence),
    ...input.customerDemandGateway.externalRequired,
  ]);
  const internalReady = intents.filter(intent => intent.status === 'internal-ready').length;
  const providerGated = intents.filter(intent => intent.status === 'provider-gated').length + syncGates.filter(item => item.status === 'missing-provider').length;
  const staffReview = intents.filter(intent => intent.status === 'needs-staff-review').length;

  return {
    ok: true,
    payloadShape: 'restaurant-voice-order-console-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    summary: {
      intents: intents.length,
      internalReady,
      providerGated,
      staffReview,
      orderDrafts: orderDrafts.length,
      canAnswerCallsNow: voiceReady && providerGated === 0,
      canWriteOrdersNow: posReady && voiceReady,
      canTakePaymentNow: paymentReady && posReady,
      canDispatchDeliveryNow: deliveryReady && posReady,
    },
    menuKnowledge: [
      { topic: 'Featured offer', answer: `${offer} can be described only after menu, price and availability are approved.`, sourceRequired: 'approved menu and store-manager price note' },
      { topic: 'Service promise', answer: visitReason, sourceRequired: 'service-window capacity and staff confirmation' },
      { topic: 'Coupon policy', answer: 'Use merchant-approved coupon rules only; no redemption mutation in this console.', sourceRequired: 'coupon rule screenshot and redemption aggregate' },
      { topic: 'Allergen or food safety', answer: 'Escalate to staff when allergen, ingredient or preparation evidence is missing.', sourceRequired: 'store-approved allergen/ingredient policy' },
    ],
    intents,
    orderDrafts,
    syncGates,
    staffTakeoverRules: [
      'Staff takes over whenever price, stock, allergen, wait time, table capacity, payment, refund, address or complaint evidence is missing.',
      'Do not promise a reservation, charge payment, dispatch delivery, redeem coupons or write POS orders from this client-only console.',
      'Every live call/order lane needs provider receipt, merchant authorization and data contract evidence before external automation is claimed.',
    ],
    externalRequired,
    safetyBoundary: 'Voice Order Console is an audit-safe restaurant front-desk model. It prepares menu answers, intent classification, order drafts, sync gates and staff handoff only. It does not answer live calls, contact customers, store phone numbers, store addresses, store raw transcripts, write POS orders, take payment, dispatch delivery, redeem coupons, expose secrets or claim live automation without provider receipts and merchant authorization.',
  };
}

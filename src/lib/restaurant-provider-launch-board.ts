import type { RestaurantCustomerDemandGateway } from '@/lib/restaurant-customer-demand-gateway';
import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import type { RestaurantProviderSetupStateSummary } from '@/lib/restaurant-provider-setup-state-store';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';
import type { RestaurantVoiceOrderConsole } from '@/lib/restaurant-voice-order-console';

export type RestaurantProviderLaunchCapability = {
  id: string;
  name: string;
  status: 'internal-ready' | 'ready-to-sandbox' | 'setup-recorded' | 'missing-provider' | 'forbidden-in-client';
  customerPromise: string;
  canDoInternallyNow: string[];
  providerKeysNeeded: string[];
  merchantApprovalsNeeded: string[];
  dataContractsNeeded: string[];
  healthEvidence: string[];
  launchStep: string;
  stopLine: string;
};

export type RestaurantProviderLaunchBoard = {
  ok: true;
  payloadShape: 'restaurant-provider-launch-board-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  summary: {
    capabilities: number;
    internalReady: number;
    readyToSandbox: number;
    setupRecorded: number;
    missingProvider: number;
    forbiddenInClient: number;
    canClaimExternalAutomation: boolean;
  };
  capabilities: RestaurantProviderLaunchCapability[];
  launchOrder: Array<{
    capabilityId: string;
    owner: 'runtime-admin' | 'merchant' | 'ops' | 'store-manager';
    action: string;
    evidenceRequired: string;
  }>;
  externalRequired: string[];
  providerKeyChecklist: string[];
  safetyBoundary: string;
};

type LaunchBoardInput = RestaurantTrialIntake & {
  providerSetupState: Pick<RestaurantProviderSetupStateSummary, 'provided' | 'summary'>;
  providerReadinessHealth: Pick<RestaurantProviderReadinessHealth, 'summary' | 'items' | 'externalRequired'>;
  customerDemandGateway: RestaurantCustomerDemandGateway;
  voiceOrderConsole: RestaurantVoiceOrderConsole;
  now?: Date;
};

function clean(value: unknown, fallback: string, max = 120): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function unique(values: string[], limit = 16) {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function providedText(input: LaunchBoardInput) {
  return [
    ...input.providerSetupState.provided.envKeys,
    ...input.providerSetupState.provided.merchantApprovals,
    ...input.providerSetupState.provided.dataContracts,
    ...input.providerReadinessHealth.items.flatMap(item => item.configuredEvidence),
  ].join(' | ').toLowerCase();
}

function hasAny(input: LaunchBoardInput, patterns: string[]) {
  const text = providedText(input);
  return patterns.some(pattern => text.includes(pattern.toLowerCase()));
}

function healthEvidence(input: LaunchBoardInput, healthIds: string[]) {
  return input.providerReadinessHealth.items
    .filter(item => healthIds.includes(item.id) || healthIds.includes(item.category))
    .flatMap(item => [
      `${item.label}: ${item.status}`,
      ...item.configuredEvidence.slice(0, 2),
    ])
    .slice(0, 6);
}

function capability(input: LaunchBoardInput, definition: Omit<RestaurantProviderLaunchCapability, 'status' | 'healthEvidence'> & {
  providerPatterns: string[];
  healthIds: string[];
  hardReady?: boolean;
}): RestaurantProviderLaunchCapability {
  const hasProvider = hasAny(input, definition.providerPatterns);
  const evidence = healthEvidence(input, definition.healthIds);
  const liveHealthReady = input.providerReadinessHealth.items
    .filter(item => definition.healthIds.includes(item.id) || definition.healthIds.includes(item.category))
    .every(item => item.status === 'health-ready');
  const status: RestaurantProviderLaunchCapability['status'] = definition.id === 'private-customer-data'
    ? 'forbidden-in-client'
    : definition.hardReady || liveHealthReady
      ? 'ready-to-sandbox'
      : hasProvider
        ? 'setup-recorded'
        : definition.providerKeysNeeded.length || definition.merchantApprovalsNeeded.length || definition.dataContractsNeeded.length
          ? 'missing-provider'
          : 'internal-ready';
  return {
    ...definition,
    status,
    healthEvidence: evidence,
  };
}

export function buildRestaurantProviderLaunchBoard(input: LaunchBoardInput): RestaurantProviderLaunchBoard {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, input.customerDemandGateway.restaurant);
  const offer = clean(input.offer, input.customerDemandGateway.offer);

  const capabilities = [
    capability(input, {
      id: 'voice-reception',
      name: 'AI phone reception and call triage',
      customerPromise: 'Answer menu, hours, reservation and order-intent questions after voice provider and merchant call policy are ready.',
      canDoInternallyNow: ['menu FAQ draft', 'intent classifier', 'staff escalation rules', 'test-call checklist'],
      providerKeysNeeded: ['VOICE_PROVIDER_URL', 'VOICE_PROVIDER_API_KEY', 'RESTAURANT_AGENT_CALLBACK_SECRET'],
      merchantApprovalsNeeded: ['call forwarding approval', 'call recording/consent policy'],
      dataContractsNeeded: ['menu, hours, price and availability source'],
      providerPatterns: ['VOICE', 'TWILIO', 'PHONE', 'CALL'],
      healthIds: ['callback-secret'],
      launchStep: 'Run a sandbox call and require a signed callback before turning on live phone handling.',
      stopLine: 'No live call answering, no raw transcripts and no phone-number storage in the client.',
    }),
    capability(input, {
      id: 'public-platform-proof',
      name: 'Dianping/Meituan/Xiaohongshu/Douyin proof loop',
      customerPromise: 'Prepare and verify public proof links or screenshots for local-life content and group-buy proof.',
      canDoInternallyNow: ['content work order', 'proof checklist', 'manual screenshot receipt', 'next-loop plan'],
      providerKeysNeeded: ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', 'RESTAURANT_AGENT_OPENCLAW_API_KEY'],
      merchantApprovalsNeeded: ['merchant platform authorization', 'allowed action scope', 'revocation owner'],
      dataContractsNeeded: ['public proof URL or screenshot receipt format'],
      providerPatterns: ['OPENCLAW', 'DIANPING', 'MEITUAN', 'XIAOHONGSHU', 'DOUYIN'],
      healthIds: ['runtime-openclaw', 'merchant-platform-authorization', 'callback-secret'],
      launchStep: 'Forward a governed browser runbook to sandbox runtime and accept only signed proof callbacks.',
      stopLine: 'No auto-publish claim without platform authorization and accepted proof receipt.',
    }),
    capability(input, {
      id: 'staff-and-customer-messaging',
      name: 'Staff channel and customer messaging',
      customerPromise: 'Send staff-only work orders now; customer messaging requires opt-in source and delivery provider.',
      canDoInternallyNow: ['staff handoff draft', 'approved reply script', 'aggregate inquiry classification'],
      providerKeysNeeded: ['WECOM_PROVIDER_URL or SMS_PROVIDER_URL', 'STAFF_NOTIFICATION_WEBHOOK'],
      merchantApprovalsNeeded: ['staff recipient roles', 'customer contact authorization', 'unsubscribe owner'],
      dataContractsNeeded: ['opt-in status source', 'no raw private-message storage contract'],
      providerPatterns: ['WECOM', 'WECHAT', 'SMS', 'WHATSAPP', 'STAFF_NOTIFICATION'],
      healthIds: ['merchant-platform-authorization'],
      launchStep: 'Start with staff-only channel delivery; open customer messaging only after opt-in and provider receipts.',
      stopLine: 'No customer outreach, private-message reads or contact export from this workbench.',
    }),
    capability(input, {
      id: 'reservation-waitlist',
      name: 'Reservation and waitlist sync',
      customerPromise: 'Collect reservation intent and route to staff until reservation provider and capacity source are connected.',
      canDoInternallyNow: ['party-size/time-window intake', 'capacity conflict checklist', 'staff confirmation handoff'],
      providerKeysNeeded: ['RESERVATION_PROVIDER_URL', 'RESERVATION_PROVIDER_API_KEY'],
      merchantApprovalsNeeded: ['table capacity rules', 'confirmation wording approval'],
      dataContractsNeeded: ['service window and table capacity source'],
      providerPatterns: ['RESERVATION', 'BOOKING', 'WAITLIST'],
      healthIds: ['merchant-platform-authorization'],
      launchStep: 'Run sandbox reservation creation and require staff confirmation receipt.',
      stopLine: 'Do not promise a table without capacity evidence and merchant confirmation rules.',
    }),
    capability(input, {
      id: 'pos-order-payment-delivery',
      name: 'POS order, payment and delivery bridge',
      customerPromise: 'Create staff-reviewed order drafts; live POS writes, payment capture and delivery dispatch need separate providers.',
      canDoInternallyNow: ['order draft', 'menu item mapping checklist', 'modifier/stock missing-field detector', 'cashier handoff'],
      providerKeysNeeded: ['POS_ORDER_API_URL', 'POS_ORDER_API_KEY', 'PAYMENT_PROVIDER_URL', 'DELIVERY_PROVIDER_URL'],
      merchantApprovalsNeeded: ['POS write approval', 'refund/payment policy', 'delivery dispatch approval'],
      dataContractsNeeded: ['menu item ids', 'field dictionary', 'test order receipt', 'signed payment callback', 'dispatch receipt'],
      providerPatterns: ['POS', 'ORDER', 'MENU', 'PAYMENT', 'DELIVERY', 'STRIPE', 'WECHAT_PAY', 'ALIPAY'],
      healthIds: ['operating-data-contract', 'callback-secret'],
      launchStep: 'Sandbox one order from draft to POS receipt, then separately test payment and delivery callbacks.',
      stopLine: 'No POS write, payment capture, delivery dispatch or raw order row in the client.',
    }),
    capability(input, {
      id: 'operating-analysis',
      name: 'Redemption and real operating analysis',
      customerPromise: 'Analyze coupon, redemption, menu and stock performance only from sanitized aggregate imports or approved APIs.',
      canDoInternallyNow: ['POS import validator', 'operating insight report', 'field dictionary review', 'anomaly checklist'],
      providerKeysNeeded: ['RESTAURANT_POS_DATA_MODE', 'RESTAURANT_POS_FIELD_DICTIONARY'],
      merchantApprovalsNeeded: ['finance/inventory owner approval'],
      dataContractsNeeded: ['aggregate POS/coupon/member export cadence', 'no-PII field dictionary'],
      providerPatterns: ['POS', 'COUPON', 'REDEMPTION', 'RESTAURANT_POS'],
      healthIds: ['operating-data-contract'],
      launchStep: 'Pass one sanitized aggregate import before claiming real operating insight.',
      stopLine: 'No raw POS rows, member ids, payment ids, margin claims or unsourced attribution.',
    }),
    capability(input, {
      id: 'persistent-agent-runtime',
      name: 'Persistent browser/runtime agent',
      customerPromise: 'Use Lobu/OpenClaw/Hermes-style runtime for governed long-running tasks, memory and callbacks.',
      canDoInternallyNow: ['runbook package', 'memory pack', 'task provider handoff', 'sandbox acceptance contract'],
      providerKeysNeeded: ['RESTAURANT_AGENT_LOBU_RUNTIME_URL or RESTAURANT_AGENT_HERMES_RUNTIME_URL', 'runtime API key', 'callback secret'],
      merchantApprovalsNeeded: ['runtime action scope', 'browser profile isolation approval'],
      dataContractsNeeded: ['signed callback receipt contract', 'audit retention policy'],
      providerPatterns: ['LOBU', 'HERMES', 'OPENCLAW', 'RUNTIME', 'CALLBACK'],
      healthIds: ['runtime-lobu', 'runtime-hermes', 'runtime-openclaw', 'callback-secret'],
      launchStep: 'Run one sandbox package, verify callback signature, then unlock only the proven action lane.',
      stopLine: 'No cookies, tokens, raw browser profile identifiers or unbounded browser actions in payloads.',
    }),
    capability(input, {
      id: 'private-customer-data',
      name: 'Private customer data boundary',
      customerPromise: 'Direct identifiers stay outside the workbench; only sanitized intent, aggregates and proof receipts are visible.',
      canDoInternallyNow: ['PII stop-line', 'sensitive command redaction', 'aggregate-only schema', 'staff takeover rule'],
      providerKeysNeeded: [],
      merchantApprovalsNeeded: [],
      dataContractsNeeded: [],
      providerPatterns: [],
      healthIds: [],
      launchStep: 'Keep this permanently forbidden in client payloads.',
      stopLine: 'Never expose phone numbers, WeChat IDs, openid, addresses, payment ids, private chats, raw transcripts, coupon codes or raw POS rows.',
    }),
  ];

  const launchOrder = capabilities
    .filter(item => item.status !== 'ready-to-sandbox' && item.status !== 'forbidden-in-client')
    .slice(0, 6)
    .map(item => ({
      capabilityId: item.id,
      owner: item.id.includes('pos') || item.id.includes('persistent') || item.id.includes('voice') ? 'runtime-admin' as const : item.id.includes('reservation') ? 'store-manager' as const : 'merchant' as const,
      action: item.launchStep,
      evidenceRequired: unique([...item.providerKeysNeeded, ...item.merchantApprovalsNeeded, ...item.dataContractsNeeded], 4).join(' / ') || item.stopLine,
    }));
  const providerKeyChecklist = unique(capabilities.flatMap(item => item.providerKeysNeeded), 20);
  const externalRequired = unique([
    ...providerKeyChecklist,
    ...capabilities.flatMap(item => item.merchantApprovalsNeeded),
    ...capabilities.flatMap(item => item.dataContractsNeeded),
    ...input.providerReadinessHealth.externalRequired,
    ...input.customerDemandGateway.externalRequired,
    ...input.voiceOrderConsole.externalRequired,
  ], 24);

  return {
    ok: true,
    payloadShape: 'restaurant-provider-launch-board-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    summary: {
      capabilities: capabilities.length,
      internalReady: capabilities.filter(item => item.status === 'internal-ready').length,
      readyToSandbox: capabilities.filter(item => item.status === 'ready-to-sandbox').length,
      setupRecorded: capabilities.filter(item => item.status === 'setup-recorded').length,
      missingProvider: capabilities.filter(item => item.status === 'missing-provider').length,
      forbiddenInClient: capabilities.filter(item => item.status === 'forbidden-in-client').length,
      canClaimExternalAutomation: capabilities.some(item => item.status === 'ready-to-sandbox') && input.providerReadinessHealth.summary.canEnableExternalAutomation,
    },
    capabilities,
    launchOrder,
    externalRequired,
    providerKeyChecklist,
    safetyBoundary: 'Provider Launch Board is a launch-readiness map, not a secret store or automation claim. It lists key names, merchant approvals, data contracts, health evidence and stop lines only. It never returns API key values, cookies, tokens, browser profile identifiers, private messages, customer identifiers, phone numbers, addresses, raw transcripts, coupon codes, payment ids or POS rows.',
  };
}

import type { RestaurantCustomerDemandGateway } from '@/lib/restaurant-customer-demand-gateway';
import type { RestaurantLeadCaptureInbox, RestaurantLeadCaptureSource } from '@/lib/restaurant-lead-capture-inbox';
import type { RestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantLeadAcquisitionLaneId =
  | 'reservation'
  | 'coupon-claim'
  | 'private-domain'
  | 'visit-intent'
  | 'review-recovery';

export type RestaurantLeadAcquisitionProviderStage = {
  id: 'merchant-auth' | 'source-contract' | 'staff-approval' | 'callback-receipt' | 'data-boundary';
  label: string;
  status: 'passed' | 'needs-evidence' | 'provider-gated' | 'blocked';
  owner: 'merchant' | 'store-manager' | 'community-ops' | 'runtime-admin' | 'data-ops';
  evidenceRequired: string[];
  nextAction: string;
  stopLine: string;
};

export type RestaurantLeadAcquisitionProviderLane = {
  id: RestaurantLeadAcquisitionLaneId;
  label: string;
  status: 'internal-ready' | 'sample-ready' | 'provider-gated' | 'blocked';
  owner: RestaurantLeadCaptureSource['owner'];
  signalCount: number;
  internalNow: string[];
  providerUnlocks: string[];
  stages: RestaurantLeadAcquisitionProviderStage[];
  firstRunnableTask: string;
  acceptanceReceipt: {
    receiptType: 'lead-acquisition-provider-receipt';
    requiredFields: string[];
    forbiddenFields: string[];
  };
};

export type RestaurantLeadAcquisitionProviderWorkbench = {
  ok: true;
  payloadShape: 'restaurant-lead-acquisition-provider-workbench-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'internal-followup-ready' | 'provider-setup-required' | 'blocked-sensitive';
  summary: {
    lanes: number;
    internalReady: number;
    sampleReady: number;
    providerGated: number;
    blocked: number;
    stages: number;
    passedStages: number;
    evidenceStages: number;
    providerStages: number;
    callbackReady: boolean;
    canClaimAutoLeadCapture: false;
    canClaimAutoCustomerContact: false;
    canClaimAutoReservation: false;
  };
  lanes: RestaurantLeadAcquisitionProviderLane[];
  operatorQueue: Array<{
    id: string;
    owner: RestaurantLeadAcquisitionProviderStage['owner'] | RestaurantLeadCaptureSource['owner'];
    priority: 'today' | 'next-shift' | 'blocked';
    action: string;
    evidenceRequired: string;
    providerRequired: string[];
  }>;
  providerAcceptanceContract: {
    callbackAction: 'lead-acquisition-receipt';
    callbackHeader: 'x-restaurant-agent-signature';
    requiredEnv: string[];
    requiredMerchantGrants: string[];
    requiredDataContracts: string[];
    forbiddenPayloadFields: string[];
  };
  handoffCopy: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string, max = 120): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function unique(values: string[], limit = 16): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function healthCount(health: RestaurantProviderReadinessHealth, category: RestaurantProviderReadinessHealth['items'][number]['category']): number {
  return health.items.filter(item => item.category === category && item.status === 'health-ready').length;
}

function hasDataContract(contract: RestaurantOperatingDataContract, id: string): boolean {
  return contract.tracks.some(track => track.id === id && track.status !== 'provider-gated');
}

function stage(input: RestaurantLeadAcquisitionProviderStage): RestaurantLeadAcquisitionProviderStage {
  return input;
}

function buildStages(input: {
  lane: RestaurantLeadAcquisitionLaneId;
  source?: RestaurantLeadCaptureSource;
  health: RestaurantProviderReadinessHealth;
  contract: RestaurantOperatingDataContract;
  hasStaffChannel: boolean;
  hasCallback: boolean;
}): RestaurantLeadAcquisitionProviderStage[] {
  const merchantAuthReady = healthCount(input.health, 'merchant-auth') > 0;
  const sourceContractReady =
    input.lane === 'reservation' ? hasDataContract(input.contract, 'reservation-leads')
      : input.lane === 'coupon-claim' ? hasDataContract(input.contract, 'coupon-redemption')
        : input.lane === 'private-domain' ? hasDataContract(input.contract, 'member-retention')
          : input.lane === 'visit-intent' ? hasDataContract(input.contract, 'public-proof')
            : true;
  return [
    stage({
      id: 'merchant-auth',
      label: 'Merchant lead-source authorization',
      status: merchantAuthReady ? 'passed' : 'provider-gated',
      owner: 'merchant',
      evidenceRequired: ['platform grant', 'allowed source list', 'allowed action policy'],
      nextAction: merchantAuthReady ? 'Keep authorization scoped to aggregate lead capture.' : 'Collect merchant authorization for reservation, coupon, private-domain or review source.',
      stopLine: 'Public page access is not permission to read private leads or contact customers.',
    }),
    stage({
      id: 'source-contract',
      label: 'Lead source data contract',
      status: sourceContractReady || (input.source?.signalCount || 0) > 0 ? 'passed' : 'needs-evidence',
      owner: 'data-ops',
      evidenceRequired: input.source?.evidenceRequired || ['aggregate count', 'source channel', 'time window'],
      nextAction: sourceContractReady ? 'Use sanitized aggregate fields only.' : input.source?.nextAction || 'Define the lead source fields and import sample.',
      stopLine: 'No phone, WeChat ID, private message body, coupon code, payment id or member identity in payload.',
    }),
    stage({
      id: 'staff-approval',
      label: 'Staff approval and talk track',
      status: input.source?.owner === 'runtime-admin' ? 'needs-evidence' : 'passed',
      owner: input.source?.owner === 'community-ops' ? 'community-ops' : 'store-manager',
      evidenceRequired: ['approved reply script', 'role owner', 'service capacity or coupon boundary'],
      nextAction: 'Attach a staff-approved script before any message, reservation confirmation or recovery reply.',
      stopLine: 'No customer contact automation without staff approval and consent boundary.',
    }),
    stage({
      id: 'callback-receipt',
      label: 'Signed callback receipt',
      status: input.hasCallback ? 'passed' : 'provider-gated',
      owner: 'runtime-admin',
      evidenceRequired: ['RESTAURANT_AGENT_CALLBACK_SECRET', 'signed lead receipt', 'externalRunId'],
      nextAction: input.hasCallback ? 'Accept only signed receipts with aggregate lead counts.' : 'Configure callback secret and receipt schema before provider execution.',
      stopLine: 'Unsigned callbacks, raw private payloads and secret values must be rejected.',
    }),
    stage({
      id: 'data-boundary',
      label: 'No-PII data boundary',
      status: input.hasStaffChannel || input.lane !== 'private-domain' ? 'passed' : 'blocked',
      owner: 'runtime-admin',
      evidenceRequired: ['no-PII contract', 'redaction rule', 'retention policy'],
      nextAction: input.lane === 'private-domain'
        ? 'Use manual aggregate summaries until messaging provider, recipient role and no-PII contract are accepted.'
        : 'Keep lead payload limited to aggregate counts, proof ids and owner tasks.',
      stopLine: 'Do not read, store, enrich or export private messages or customer identifiers.',
    }),
  ];
}

function laneStatus(stages: RestaurantLeadAcquisitionProviderStage[], source?: RestaurantLeadCaptureSource): RestaurantLeadAcquisitionProviderLane['status'] {
  if (stages.some(item => item.status === 'blocked')) return 'blocked';
  if (stages.some(item => item.status === 'provider-gated')) return 'provider-gated';
  if ((source?.signalCount || 0) > 0) return 'sample-ready';
  return 'internal-ready';
}

function buildLane(input: {
  id: RestaurantLeadAcquisitionLaneId;
  label: string;
  source?: RestaurantLeadCaptureSource;
  health: RestaurantProviderReadinessHealth;
  contract: RestaurantOperatingDataContract;
  hasStaffChannel: boolean;
  hasCallback: boolean;
  firstRunnableTask: string;
}): RestaurantLeadAcquisitionProviderLane {
  const stages = buildStages({
    lane: input.id,
    source: input.source,
    health: input.health,
    contract: input.contract,
    hasStaffChannel: input.hasStaffChannel,
    hasCallback: input.hasCallback,
  });
  return {
    id: input.id,
    label: input.label,
    status: laneStatus(stages, input.source),
    owner: input.source?.owner || 'ops',
    signalCount: input.source?.signalCount || 0,
    internalNow: input.source?.canDoNow || ['prepare staff-reviewed lead follow-up task', 'attach proof and owner', 'hold provider execution'],
    providerUnlocks: input.source?.providerRequiredFor || [],
    stages,
    firstRunnableTask: input.firstRunnableTask,
    acceptanceReceipt: {
      receiptType: 'lead-acquisition-provider-receipt',
      requiredFields: ['externalRunId', 'sourceId', 'aggregateLeadCount', 'evidenceUrl or screenshotId', 'operator', 'signedAt'],
      forbiddenFields: ['phone', 'WeChat ID', 'member name', 'raw private message', 'coupon code', 'payment id', 'cookie', 'token'],
    },
  };
}

export function buildRestaurantLeadAcquisitionProviderWorkbench(input: RestaurantTrialIntake & {
  leadCaptureInbox: RestaurantLeadCaptureInbox;
  customerDemandGateway: RestaurantCustomerDemandGateway;
  providerReadinessHealth: RestaurantProviderReadinessHealth;
  operatingDataContract: RestaurantOperatingDataContract;
  now?: Date;
}): RestaurantLeadAcquisitionProviderWorkbench {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, input.leadCaptureInbox.restaurant || 'Trial restaurant');
  const offer = clean(input.offer, input.leadCaptureInbox.offer || 'Today offer');
  const sourceById = new Map(input.leadCaptureInbox.sources.map(source => [source.id, source]));
  const hasStaffChannel = input.customerDemandGateway.channels.some(channel =>
    channel.id === 'wechat-sms-inquiry' && channel.status === 'internal-ready',
  );
  const hasCallback = input.providerReadinessHealth.items.some(item => item.id === 'callback-secret' && item.status === 'health-ready');
  const lanes = [
    buildLane({
      id: 'reservation',
      label: 'Reservation and waitlist capture',
      source: sourceById.get('reservation'),
      health: input.providerReadinessHealth,
      contract: input.operatingDataContract,
      hasStaffChannel,
      hasCallback,
      firstRunnableTask: 'Create a staff-reviewed capacity check before any reservation reply.',
    }),
    buildLane({
      id: 'coupon-claim',
      label: 'Coupon and group-buy lead capture',
      source: sourceById.get('coupon-claim'),
      health: input.providerReadinessHealth,
      contract: input.operatingDataContract,
      hasStaffChannel,
      hasCallback,
      firstRunnableTask: 'Confirm coupon rules and aggregate claims before redemption follow-up.',
    }),
    buildLane({
      id: 'private-domain',
      label: 'Private-domain inquiry follow-up',
      source: sourceById.get('private-domain-inquiry'),
      health: input.providerReadinessHealth,
      contract: input.operatingDataContract,
      hasStaffChannel,
      hasCallback,
      firstRunnableTask: 'Classify aggregate inquiry themes and draft approved replies for staff send.',
    }),
    buildLane({
      id: 'visit-intent',
      label: 'Public visit-intent capture',
      source: sourceById.get('visit-intent'),
      health: input.providerReadinessHealth,
      contract: input.operatingDataContract,
      hasStaffChannel,
      hasCallback,
      firstRunnableTask: 'Turn public proof into service-prep and next-loop content tasks.',
    }),
    buildLane({
      id: 'review-recovery',
      label: 'Review-led recovery follow-up',
      source: sourceById.get('review-recovery'),
      health: input.providerReadinessHealth,
      contract: input.operatingDataContract,
      hasStaffChannel,
      hasCallback,
      firstRunnableTask: 'Assign recovery owner and approved reply draft before platform response.',
    }),
  ];
  const stages = lanes.flatMap(lane => lane.stages);
  const providerGated = lanes.filter(lane => lane.status === 'provider-gated').length;
  const blocked = lanes.filter(lane => lane.status === 'blocked').length;
  const externalRequired = unique([
    ...input.leadCaptureInbox.providerUnlocks,
    ...input.leadCaptureInbox.externalRequired,
    ...input.customerDemandGateway.externalRequired,
    ...lanes.flatMap(lane => lane.providerUnlocks),
    ...input.providerReadinessHealth.externalRequired,
  ], 18);
  return {
    ok: true,
    payloadShape: 'restaurant-lead-acquisition-provider-workbench-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    verdict: blocked > 0
      ? 'blocked-sensitive'
      : providerGated > 0
        ? 'provider-setup-required'
        : 'internal-followup-ready',
    summary: {
      lanes: lanes.length,
      internalReady: lanes.filter(lane => lane.status === 'internal-ready').length,
      sampleReady: lanes.filter(lane => lane.status === 'sample-ready').length,
      providerGated,
      blocked,
      stages: stages.length,
      passedStages: stages.filter(stageItem => stageItem.status === 'passed').length,
      evidenceStages: stages.filter(stageItem => stageItem.status === 'needs-evidence').length,
      providerStages: stages.filter(stageItem => stageItem.status === 'provider-gated').length,
      callbackReady: hasCallback,
      canClaimAutoLeadCapture: false,
      canClaimAutoCustomerContact: false,
      canClaimAutoReservation: false,
    },
    lanes,
    operatorQueue: lanes.slice(0, 5).map(lane => {
      const firstGate = lane.stages.find(stageItem => stageItem.status !== 'passed');
      return {
        id: `lead-provider-${lane.id}`,
        owner: firstGate?.owner || lane.owner,
        priority: lane.status === 'blocked' || lane.status === 'provider-gated' ? 'blocked' : lane.status === 'sample-ready' ? 'today' : 'next-shift',
        action: firstGate?.nextAction || lane.firstRunnableTask,
        evidenceRequired: firstGate?.evidenceRequired.join(' / ') || 'accepted aggregate lead receipt',
        providerRequired: lane.providerUnlocks.slice(0, 5),
      };
    }),
    providerAcceptanceContract: {
      callbackAction: 'lead-acquisition-receipt',
      callbackHeader: 'x-restaurant-agent-signature',
      requiredEnv: [
        'RESTAURANT_AGENT_CALLBACK_SECRET',
        'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL or RESTAURANT_AGENT_HERMES_RUNTIME_URL',
        'staff channel provider env when message delivery is enabled',
      ],
      requiredMerchantGrants: [
        'reservation/coupon/review source read authorization',
        'staff recipient-role approval',
        'explicit customer-contact policy before any send action',
      ],
      requiredDataContracts: [
        'no-PII private-domain aggregate contract',
        'coupon/reservation/POS aggregate export contract',
        'callback receipt schema with signed aggregate counts',
      ],
      forbiddenPayloadFields: ['phone', 'WeChat ID', 'member name', 'raw private message', 'coupon code', 'payment id', 'cookie', 'token', 'browser profile secret'],
    },
    handoffCopy: [
      `${restaurant} / ${offer}: lead acquisition can run as owner-reviewed tasks now; automatic capture/contact remains Provider-gated.`,
      'Provider must return signed aggregate receipts only: source, count, proof id, operator and timestamp.',
      'Messaging, reservation confirmation, coupon redemption and CRM enrichment require merchant authorization plus staff approval.',
    ],
    externalRequired,
    safetyBoundary: 'Lead Acquisition Provider Workbench prepares authorized lead capture and follow-up execution only. It does not scrape private messages, store PII, send customer replies, confirm reservations, issue or redeem coupons, enrich CRM/member records, expose provider keys, use raw browser profiles, or claim automatic acquisition without merchant grants, signed callback receipts, staff approval and no-PII data contracts.',
  };
}

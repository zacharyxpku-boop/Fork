import type { RestaurantBusinessSignalReport } from '@/lib/restaurant-agent-business-signals';
import type { RestaurantAgentChannelHub } from '@/lib/restaurant-agent-channel-hub';
import type { RestaurantCustomerDemandGateway } from '@/lib/restaurant-customer-demand-gateway';
import type { RestaurantNextLoopChannelPlan } from '@/lib/restaurant-next-loop-channel-plan';
import type { RestaurantReputationCloseoutPack } from '@/lib/restaurant-reputation-closeout-pack';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantLeadCaptureSource = {
  id: 'reservation' | 'coupon-claim' | 'private-domain-inquiry' | 'visit-intent' | 'review-recovery';
  label: string;
  status: 'internal-ready' | 'needs-evidence' | 'provider-gated';
  signalCount: number;
  owner: 'store-manager' | 'community-ops' | 'ops' | 'runtime-admin';
  canDoNow: string[];
  evidenceRequired: string[];
  providerRequiredFor: string[];
  nextAction: string;
};

export type RestaurantLeadCaptureItem = {
  id: string;
  sourceId: RestaurantLeadCaptureSource['id'];
  priority: 'today' | 'next-shift' | 'blocked';
  owner: RestaurantLeadCaptureSource['owner'];
  title: string;
  signalCount: number;
  intent: 'book-table' | 'claim-coupon' | 'ask-question' | 'visit-later' | 'recover-service';
  staffAction: string;
  approvedTalkTrack: string;
  evidenceRequired: string;
  stopLine: string;
};

export type RestaurantLeadCaptureInbox = {
  ok: true;
  payloadShape: 'restaurant-lead-capture-inbox-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'inbox-ready-internal' | 'needs-public-proof' | 'provider-unlock-first';
  summary: {
    sources: number;
    internalReady: number;
    needsEvidence: number;
    providerGated: number;
    leadItems: number;
    todayItems: number;
    blockedItems: number;
    aggregateSignals: number;
    canClaimAutoLeadCapture: boolean;
    canClaimAutoCustomerContact: boolean;
  };
  sources: RestaurantLeadCaptureSource[];
  leadItems: RestaurantLeadCaptureItem[];
  staffQueue: Array<{
    owner: RestaurantLeadCaptureSource['owner'];
    action: string;
    evidenceRequired: string;
    dueWindow: string;
  }>;
  providerUnlocks: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, 120) : fallback;
}

function unique(values: string[], limit = 16) {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function sourceStatus(count: number, providerBlocked: boolean): RestaurantLeadCaptureSource['status'] {
  if (providerBlocked) return count > 0 ? 'internal-ready' : 'provider-gated';
  return count > 0 ? 'internal-ready' : 'needs-evidence';
}

export function buildRestaurantLeadCaptureInbox(input: RestaurantTrialIntake & {
  customerDemandGateway: RestaurantCustomerDemandGateway;
  businessSignals: RestaurantBusinessSignalReport;
  channelHub: RestaurantAgentChannelHub;
  nextLoopChannelPlan: RestaurantNextLoopChannelPlan;
  reputationCloseoutPack?: RestaurantReputationCloseoutPack;
  now?: Date;
}): RestaurantLeadCaptureInbox {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, input.customerDemandGateway.restaurant || 'Trial restaurant');
  const offer = clean(input.offer, input.customerDemandGateway.offer || 'Today offer');
  const signals = input.businessSignals.summary;
  const hasProviderReadyChannel = input.channelHub.summary.providerReadyChannels > 0;
  const demandProviderGated = input.customerDemandGateway.summary.providerGated > 0;
  const reviewRecoverySignals = input.reputationCloseoutPack?.summary.recoveryActions || 0;

  const sources: RestaurantLeadCaptureSource[] = [
    {
      id: 'reservation',
      label: 'Reservation and waitlist intent',
      status: sourceStatus(signals.reservations, demandProviderGated),
      signalCount: signals.reservations,
      owner: 'store-manager',
      canDoNow: ['summarize aggregate reservation count', 'prepare capacity confirmation task', 'draft staff-reviewed reply'],
      evidenceRequired: ['service window', 'party-size aggregate', 'staff capacity confirmation'],
      providerRequiredFor: ['automatic reservation confirmation', 'table system write', 'customer reminder send'],
      nextAction: signals.reservations > 0
        ? 'Ask store manager to confirm capacity before any reply or table promise.'
        : 'Import a public proof receipt or sanitized reservation aggregate before routing table intent.',
    },
    {
      id: 'coupon-claim',
      label: 'Coupon and group-buy claims',
      status: sourceStatus(signals.couponClaims, demandProviderGated),
      signalCount: signals.couponClaims,
      owner: 'ops',
      canDoNow: ['group claims by offer', 'check coupon boundary', 'create redemption-prep task'],
      evidenceRequired: ['coupon rule proof', 'aggregate claim count', 'redemption window'],
      providerRequiredFor: ['Dianping/Meituan coupon sync', 'automatic coupon follow-up', 'redemption reconciliation'],
      nextAction: signals.couponClaims > 0
        ? 'Confirm coupon rules and redemption window before the next content or staff follow-up.'
        : 'Collect coupon rule proof and aggregate claim count.',
    },
    {
      id: 'private-domain-inquiry',
      label: 'Private-domain inquiry summary',
      status: hasProviderReadyChannel ? sourceStatus(signals.inquiries, false) : 'provider-gated',
      signalCount: signals.inquiries,
      owner: 'community-ops',
      canDoNow: ['accept manual aggregate inquiry count', 'classify intent bucket', 'prepare staff-approved talk track'],
      evidenceRequired: ['source channel', 'aggregate inquiry count', 'approved reply script', 'no raw private text'],
      providerRequiredFor: ['WeCom/WeChat/SMS sync', 'message send', 'CRM/member enrichment'],
      nextAction: hasProviderReadyChannel
        ? 'Route aggregate inquiry themes into staff-reviewed follow-up.'
        : 'Keep as manual summary until staff channel provider and merchant approval are configured.',
    },
    {
      id: 'visit-intent',
      label: 'Visit intent from public proof',
      status: sourceStatus(signals.visitIntent, false),
      signalCount: signals.visitIntent,
      owner: 'store-manager',
      canDoNow: ['turn intent count into service prep', 'attach owner and due window', 'feed next-loop content angle'],
      evidenceRequired: ['public link/screenshot', 'time window', 'owner', 'visit-intent aggregate'],
      providerRequiredFor: ['platform comment sync', 'automatic intent tagging', 'customer contact action'],
      nextAction: signals.visitIntent > 0
        ? 'Prepare the next service window and content follow-up from aggregate intent.'
        : 'Collect public proof or accepted receipt before claiming visit intent.',
    },
    {
      id: 'review-recovery',
      label: 'Review-triggered service recovery',
      status: input.reputationCloseoutPack ? 'internal-ready' : 'needs-evidence',
      signalCount: reviewRecoverySignals,
      owner: 'runtime-admin',
      canDoNow: ['link review theme to recovery owner', 'draft staff-reviewed response', 'block auto-reply until authorized'],
      evidenceRequired: ['public review/proof URL or screenshot', 'recovery owner', 'merchant-approved tone'],
      providerRequiredFor: ['review inbox sync', 'auto review reply', 'compensation/coupon workflow'],
      nextAction: input.reputationCloseoutPack
        ? 'Use reputation closeout actions as the service recovery queue.'
        : 'Build a reputation closeout pack before review-led follow-up.',
    },
  ];

  const leadItems: RestaurantLeadCaptureItem[] = [
    {
      id: 'lead-reservation-capacity',
      sourceId: 'reservation',
      priority: signals.reservations > 0 ? 'today' : 'blocked',
      owner: 'store-manager',
      title: 'Confirm reservation capacity before replying',
      signalCount: signals.reservations,
      intent: 'book-table',
      staffAction: 'Check service window, table capacity and queue pressure; approve the reply before staff contacts guests.',
      approvedTalkTrack: `For ${offer}, confirm availability and expected wait time before promising a table.`,
      evidenceRequired: 'service window + capacity note + aggregate reservation count',
      stopLine: 'No automatic confirmation, no customer phone storage and no table-system write without provider authorization.',
    },
    {
      id: 'lead-coupon-redemption-prep',
      sourceId: 'coupon-claim',
      priority: signals.couponClaims > 0 ? 'today' : 'blocked',
      owner: 'ops',
      title: 'Prepare coupon claim to redemption follow-up',
      signalCount: signals.couponClaims,
      intent: 'claim-coupon',
      staffAction: 'Clarify coupon validity, exclusions and redemption window in the next staff script and content loop.',
      approvedTalkTrack: `Guests asking about ${offer} should see the same coupon boundary in content and in-store replies.`,
      evidenceRequired: 'coupon rule proof + aggregate claim count + redemption window',
      stopLine: 'No coupon redemption, no coupon-code handling and no ROI claim without accepted aggregate redemption evidence.',
    },
    {
      id: 'lead-private-domain-summary',
      sourceId: 'private-domain-inquiry',
      priority: hasProviderReadyChannel || signals.inquiries > 0 ? 'next-shift' : 'blocked',
      owner: 'community-ops',
      title: 'Classify private-domain inquiries without storing chats',
      signalCount: signals.inquiries,
      intent: 'ask-question',
      staffAction: 'Summarize aggregate inquiry themes and draft staff-approved replies for manual send.',
      approvedTalkTrack: 'Use approved answer snippets only; keep private chat text and customer identifiers out of the workbench.',
      evidenceRequired: 'source channel + aggregate count + approved reply script',
      stopLine: 'No private message read, no WeChat ID export, no customer contact automation and no CRM enrichment without authorization.',
    },
    {
      id: 'lead-visit-intent-next-loop',
      sourceId: 'visit-intent',
      priority: signals.visitIntent > 0 ? 'today' : 'blocked',
      owner: 'store-manager',
      title: 'Turn visit intent into next service prep',
      signalCount: signals.visitIntent,
      intent: 'visit-later',
      staffAction: 'Prepare queue, dish availability and next content angle based on aggregate intent.',
      approvedTalkTrack: 'Mention same-day availability and queue status only after store manager confirmation.',
      evidenceRequired: 'public proof or accepted receipt + aggregate visit-intent count',
      stopLine: 'No individual retargeting or customer identification from public comments.',
    },
    {
      id: 'lead-review-recovery',
      sourceId: 'review-recovery',
      priority: input.reputationCloseoutPack ? 'next-shift' : 'blocked',
      owner: 'runtime-admin',
      title: 'Route review recovery to an owner',
      signalCount: reviewRecoverySignals,
      intent: 'recover-service',
      staffAction: 'Attach a recovery owner, response draft and proof requirement before the next publish/follow-up loop.',
      approvedTalkTrack: 'Acknowledge the issue, confirm the operating boundary and let the store manager review the final response.',
      evidenceRequired: 'public review/proof + recovery owner + approved tone',
      stopLine: 'No auto-reply, compensation, coupon issue or platform inbox read without merchant approval.',
    },
  ];

  const internalReady = sources.filter(item => item.status === 'internal-ready').length;
  const needsEvidence = sources.filter(item => item.status === 'needs-evidence').length;
  const providerGated = sources.filter(item => item.status === 'provider-gated').length;
  const blockedItems = leadItems.filter(item => item.priority === 'blocked').length;
  const aggregateSignals = signals.reservations + signals.couponClaims + signals.inquiries + signals.visitIntent + reviewRecoverySignals;
  const verdict: RestaurantLeadCaptureInbox['verdict'] = providerGated > internalReady
    ? 'provider-unlock-first'
    : needsEvidence > 0
      ? 'needs-public-proof'
      : 'inbox-ready-internal';

  return {
    ok: true,
    payloadShape: 'restaurant-lead-capture-inbox-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    verdict,
    summary: {
      sources: sources.length,
      internalReady,
      needsEvidence,
      providerGated,
      leadItems: leadItems.length,
      todayItems: leadItems.filter(item => item.priority === 'today').length,
      blockedItems,
      aggregateSignals,
      canClaimAutoLeadCapture: false,
      canClaimAutoCustomerContact: false,
    },
    sources,
    leadItems,
    staffQueue: leadItems.slice(0, 4).map(item => ({
      owner: item.owner,
      action: item.staffAction,
      evidenceRequired: item.evidenceRequired,
      dueWindow: item.priority === 'today' ? 'today before service window' : item.priority === 'next-shift' ? 'next shift closeout' : 'after proof/provider unlock',
    })),
    providerUnlocks: unique([
      'merchant platform authorization for lead sources',
      'staff channel provider and recipient-role approval',
      'callback secret and accepted receipt schema',
      'no-PII private-domain data contract',
      'coupon/reservation/POS aggregate export contract',
    ]),
    externalRequired: unique([
      ...sources.flatMap(item => item.status === 'internal-ready' ? [] : item.providerRequiredFor),
      ...sources.flatMap(item => item.status === 'needs-evidence' ? item.evidenceRequired : []),
      ...input.customerDemandGateway.externalRequired,
      ...input.nextLoopChannelPlan.externalRequired,
    ]),
    safetyBoundary: 'Lead Capture Inbox only uses public proof, accepted receipts, manual aggregate counts and sanitized operating signals. It does not scrape private messages, store PII, export customer contacts, confirm reservations, send replies, redeem coupons, enrich CRM records, expose provider keys or claim automatic lead capture without merchant authorization and provider receipts.',
  };
}

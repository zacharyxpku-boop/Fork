import type { RestaurantBusinessSignalReport } from '@/lib/restaurant-agent-business-signals';
import type { RestaurantNextLoopChannelPlan } from '@/lib/restaurant-next-loop-channel-plan';
import type { RestaurantPostRunReviewPack } from '@/lib/restaurant-post-run-review-pack';
import type { RestaurantPublicIntelligenceBrief } from '@/lib/restaurant-public-intelligence-brief';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantReputationSource = {
  id: 'dianping-meituan' | 'xiaohongshu' | 'douyin' | 'wechat-community' | 'manual-review-import';
  label: string;
  status: 'internal-ready' | 'needs-public-proof' | 'provider-gated';
  canDoNow: string[];
  evidenceRequired: string[];
  providerRequiredFor: string[];
  nextAction: string;
  stopLine: string;
};

export type RestaurantReputationTheme = {
  id: 'taste-offer-fit' | 'wait-time-service' | 'coupon-expectation' | 'photo-proof-gap' | 'repeat-visit';
  label: string;
  signal: 'positive' | 'mixed' | 'risk' | 'unknown';
  source: string;
  evidence: string[];
  operatorAction: string;
  staffScript: string;
};

export type RestaurantReputationCloseoutPack = {
  ok: true;
  payloadShape: 'restaurant-reputation-closeout-pack-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'review-loop-ready' | 'needs-public-proof' | 'provider-unlock-first';
  summary: {
    sources: number;
    internalReady: number;
    needsPublicProof: number;
    providerGated: number;
    themes: number;
    recoveryActions: number;
    responseDrafts: number;
    canClaimAutoReviewReply: boolean;
    canClaimReviewAnalytics: boolean;
  };
  sources: RestaurantReputationSource[];
  themes: RestaurantReputationTheme[];
  recoveryQueue: Array<{
    owner: 'store-manager' | 'shift-lead' | 'ops' | 'runtime-admin';
    action: string;
    evidenceRequired: string;
    dueWindow: string;
  }>;
  responseDrafts: Array<{
    platform: string;
    status: 'staff-review' | 'provider-gated';
    draft: string;
    proofNeeded: string;
  }>;
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

export function buildRestaurantReputationCloseoutPack(input: RestaurantTrialIntake & {
  publicIntelligenceBrief?: RestaurantPublicIntelligenceBrief;
  postRunReviewPack: RestaurantPostRunReviewPack;
  nextLoopChannelPlan: RestaurantNextLoopChannelPlan;
  businessSignals: RestaurantBusinessSignalReport;
  now?: Date;
}): RestaurantReputationCloseoutPack {
  const restaurant = clean(input.restaurant || input.publicIntelligenceBrief?.profile.restaurant, 'Trial restaurant');
  const offer = clean(input.offer || input.publicIntelligenceBrief?.profile.suggestedOffer, 'Today offer');
  const acceptedProof = input.postRunReviewPack.summary.acceptedReceipts;
  const acceptedPos = input.postRunReviewPack.summary.acceptedPosImports;
  const providerGatedActions = input.nextLoopChannelPlan.summary.providerGatedActions;
  const hasPublicProof = acceptedProof > 0;
  const hasAggregateOperatingData = acceptedPos > 0;

  const sources: RestaurantReputationSource[] = [
    {
      id: 'dianping-meituan',
      label: 'Dianping / Meituan reviews and coupon proof',
      status: hasPublicProof ? 'internal-ready' : 'needs-public-proof',
      canDoNow: ['prepare review response draft', 'link coupon expectation to offer boundary', 'route store-manager recovery task'],
      evidenceRequired: ['public review/proof URL or screenshot id', 'offer boundary', 'merchant-approved response tone'],
      providerRequiredFor: ['auto reply', 'review inbox sync', 'coupon review reconciliation'],
      nextAction: hasPublicProof
        ? 'Draft one owner-reviewed response and one store recovery action from accepted public proof.'
        : 'Collect public proof URL/screenshot or signed runtime receipt before review analysis.',
      stopLine: 'No private reviewer data, no automated reply and no platform inbox read without merchant authorization.',
    },
    {
      id: 'xiaohongshu',
      label: 'Xiaohongshu note comments and visit intent',
      status: hasPublicProof ? 'internal-ready' : 'needs-public-proof',
      canDoNow: ['summarize public comment themes if merchant provides aggregate text', 'prepare photo-proof checklist', 'draft staff-reviewed reply'],
      evidenceRequired: ['public note URL/screenshot', 'comment/inquiry aggregate count', 'photo rights'],
      providerRequiredFor: ['comment sync', 'private inquiry routing', 'auto reply'],
      nextAction: 'Use merchant-provided public proof only; turn recurring questions into next note and service prep tasks.',
      stopLine: 'Do not read private messages, export accounts or contact customers from this workbench.',
    },
    {
      id: 'douyin',
      label: 'Douyin public comments and short-video feedback',
      status: hasPublicProof ? 'internal-ready' : 'needs-public-proof',
      canDoNow: ['prepare public comment FAQ', 'capture content-proof gaps', 'turn visit-intent aggregate into next-shift task'],
      evidenceRequired: ['public video URL/screenshot', 'aggregate comment count', 'operator review'],
      providerRequiredFor: ['comment feed sync', 'auto response', 'creator account action'],
      nextAction: 'Convert public comment questions into a reviewed FAQ and next video hook.',
      stopLine: 'No scraping private comments, no account action and no performance claim without receipt.',
    },
    {
      id: 'wechat-community',
      label: 'WeChat community feedback',
      status: 'provider-gated',
      canDoNow: ['prepare staff talk track', 'import manual aggregate feedback', 'create service recovery owner queue'],
      evidenceRequired: ['staff-provided aggregate summary', 'approved talk track', 'customer consent boundary'],
      providerRequiredFor: ['group message send', 'member sync', 'private-domain automation'],
      nextAction: 'Keep WeChat feedback as manual aggregate until staff channel and consent boundary are configured.',
      stopLine: 'Never read group/private chat bodies or store WeChat IDs, phone numbers or customer identifiers.',
    },
    {
      id: 'manual-review-import',
      label: 'Manual review and service log import',
      status: 'internal-ready',
      canDoNow: ['accept sanitized issue counts', 'assign recovery owner', 'link review theme to store operating plan'],
      evidenceRequired: ['theme count', 'service window', 'owner', 'no customer identifiers'],
      providerRequiredFor: ['live review analytics', 'CRM/member enrichment', 'automatic service recovery'],
      nextAction: 'Use a no-PII aggregate service log to close recovery actions before the next service window.',
      stopLine: 'Manual import must not contain names, phone numbers, addresses, order ids, member ids or private chat text.',
    },
  ];

  const themes: RestaurantReputationTheme[] = [
    {
      id: 'taste-offer-fit',
      label: 'Dish taste and offer fit',
      signal: hasPublicProof ? 'positive' : 'unknown',
      source: 'public proof + merchant brief',
      evidence: hasPublicProof ? [`acceptedReceipts:${acceptedProof}`, offer] : ['public proof missing'],
      operatorAction: hasPublicProof ? 'Reuse the verified dish angle but keep price/stock boundary visible.' : 'Collect public proof before turning taste claims into content.',
      staffScript: `When guests ask about ${offer}, confirm availability and service window before recommending add-ons.`,
    },
    {
      id: 'wait-time-service',
      label: 'Wait time and service recovery',
      signal: input.businessSignals.summary.visitIntent > 0 ? 'mixed' : 'unknown',
      source: 'visit intent + next-loop service prep',
      evidence: [`visitIntent:${input.businessSignals.summary.visitIntent}`, `storeTasks:${input.postRunReviewPack.summary.storeTasks}`],
      operatorAction: 'Attach queue handling, table turnover and staff owner to the next publish/follow-up loop.',
      staffScript: 'If queue pressure appears, explain expected wait and offer a clear reservation or pickup alternative.',
    },
    {
      id: 'coupon-expectation',
      label: 'Coupon expectation and redemption clarity',
      signal: hasAggregateOperatingData ? 'mixed' : 'risk',
      source: 'POS aggregate + coupon proof',
      evidence: [`couponClaims:${input.businessSignals.summary.couponClaims}`, `redemptions:${input.businessSignals.summary.redemptions}`, `acceptedPosImports:${acceptedPos}`],
      operatorAction: hasAggregateOperatingData ? 'Clarify coupon scope and redemption window in the next content and staff script.' : 'Import sanitized coupon/POS aggregate before judging coupon friction.',
      staffScript: 'Confirm coupon validity, excluded items and redemption steps before guests arrive.',
    },
    {
      id: 'photo-proof-gap',
      label: 'Photo proof and expectation gap',
      signal: input.publicIntelligenceBrief?.readiness.canStartTrial ? 'mixed' : 'risk',
      source: 'public intelligence material checklist',
      evidence: input.publicIntelligenceBrief?.materialChecklist.slice(0, 3).map(item => `${item.id}:${item.status}`) || ['public intelligence not generated'],
      operatorAction: 'Collect approved dish/store photos before repeating content across platforms.',
      staffScript: 'Use only merchant-approved photos and avoid overstating portion size, wait time or availability.',
    },
    {
      id: 'repeat-visit',
      label: 'Repeat visit and follow-up',
      signal: input.nextLoopChannelPlan.summary.canRunInternallyNow ? 'positive' : 'risk',
      source: 'next-loop channel plan',
      evidence: [`scheduledActions:${input.nextLoopChannelPlan.summary.scheduledActions}`, `providerGatedActions:${providerGatedActions}`],
      operatorAction: 'Schedule staff-reviewed follow-up from aggregate intent and accepted proof, not customer identifiers.',
      staffScript: 'Invite guests to return through approved public/store-owned channels only; do not export contact lists.',
    },
  ];

  const internalReady = sources.filter(item => item.status === 'internal-ready').length;
  const needsPublicProof = sources.filter(item => item.status === 'needs-public-proof').length;
  const providerGated = sources.filter(item => item.status === 'provider-gated').length;
  const verdict: RestaurantReputationCloseoutPack['verdict'] = providerGated > 2
    ? 'provider-unlock-first'
    : needsPublicProof > 0
      ? 'needs-public-proof'
      : 'review-loop-ready';

  return {
    ok: true,
    payloadShape: 'restaurant-reputation-closeout-pack-v1',
    generatedAt: (input.now || new Date()).toISOString(),
    restaurant,
    offer,
    verdict,
    summary: {
      sources: sources.length,
      internalReady,
      needsPublicProof,
      providerGated,
      themes: themes.length,
      recoveryActions: 4,
      responseDrafts: 3,
      canClaimAutoReviewReply: false,
      canClaimReviewAnalytics: hasPublicProof && hasAggregateOperatingData,
    },
    sources,
    themes,
    recoveryQueue: [
      {
        owner: 'store-manager',
        action: 'Confirm wait-time, stock and service-window boundaries before the next content push.',
        evidenceRequired: 'shift owner note + service window',
        dueWindow: 'before next lunch/dinner service',
      },
      {
        owner: 'shift-lead',
        action: 'Prepare a staff reply script for coupon validity and redemption steps.',
        evidenceRequired: 'coupon rule + redemption window',
        dueWindow: 'before coupon follow-up',
      },
      {
        owner: 'ops',
        action: 'Turn accepted public proof into one reviewed response and one next-loop content angle.',
        evidenceRequired: 'public URL/screenshot + owner approval',
        dueWindow: 'same day closeout',
      },
      {
        owner: 'runtime-admin',
        action: 'Keep auto-reply and review inbox sync blocked until merchant platform authorization is configured.',
        evidenceRequired: 'provider health + merchant grant + callback receipt',
        dueWindow: 'before external review automation claim',
      },
    ],
    responseDrafts: [
      {
        platform: 'Dianping/Meituan',
        status: 'staff-review',
        draft: `Thanks for the feedback. ${restaurant} will confirm the serving window, coupon rules and in-store service plan for ${offer}, then have the store manager review the final reply.`,
        proofNeeded: 'public review/proof URL or screenshot id',
      },
      {
        platform: 'Xiaohongshu/Douyin',
        status: 'staff-review',
        draft: 'This reply should use only approved dish details, photos and visit scenes. If wait time or coupon rules change, staff should point guests to the same-day store notice.',
        proofNeeded: 'approved public note/video proof and photo rights',
      },
      {
        platform: 'WeChat community',
        status: 'provider-gated',
        draft: 'Community replies require staff confirmation and a clear customer-consent boundary. Current mode only generates a staff talk track and does not send messages automatically.',
        proofNeeded: 'staff recipient approval and customer consent boundary',
      },
    ],
    externalRequired: unique([
      ...sources.flatMap(item => item.providerRequiredFor),
      ...sources.flatMap(item => item.status !== 'internal-ready' ? item.evidenceRequired : []),
      ...input.postRunReviewPack.externalRequired,
    ], 14),
    safetyBoundary: 'Reputation Closeout Pack uses public proof, merchant-provided aggregate review summaries and sanitized operating signals only. It does not scrape private reviews, read private messages, identify customers, export contacts, store PII, auto-reply, offer compensation, redeem coupons, expose secrets or claim review analytics without merchant authorization and accepted evidence.',
  };
}

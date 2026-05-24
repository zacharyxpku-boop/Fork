import type { RestaurantAiConsultantCopilot } from '@/lib/restaurant-ai-consultant-copilot';
import type { RestaurantProviderLaunchBoard } from '@/lib/restaurant-provider-launch-board';
import type { RestaurantStoreOperatingPlan } from '@/lib/restaurant-store-operating-plan';

export type RestaurantAiCockpitZoneId =
  | 'today-operations'
  | 'ai-consultant'
  | 'automation-launch'
  | 'evidence-review';

export type RestaurantAiCockpitZone = {
  id: RestaurantAiCockpitZoneId;
  title: string;
  status: 'ready-internal' | 'needs-evidence' | 'provider-gated' | 'blocked';
  owner: 'store-manager' | 'ops' | 'runtime-admin' | 'finance';
  answer: string;
  primaryAction: string;
  visibleProof: string[];
  providerGate: string;
  stopLine: string;
};

export type RestaurantAiCockpit = {
  ok: true;
  payloadShape: 'restaurant-ai-cockpit-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'usable-cockpit-now' | 'merchant-evidence-first' | 'provider-unlock-first';
  summary: {
    zones: number;
    readyInternal: number;
    needsEvidence: number;
    providerGated: number;
    blocked: number;
    todayBlocks: number;
    providerUnlocks: number;
    canClaimAutomation: boolean;
  };
  zones: RestaurantAiCockpitZone[];
  primaryRunbook: string[];
  evidenceBoard: string[];
  providerUnlocks: string[];
  sourceSnapshots: {
    operatingPlan: Pick<RestaurantStoreOperatingPlan, 'payloadShape' | 'verdict' | 'summary'>;
    consultant: Pick<RestaurantAiConsultantCopilot, 'payloadShape' | 'mode' | 'summary'>;
    providerLaunch: Pick<RestaurantProviderLaunchBoard, 'payloadShape' | 'summary'>;
  };
  safetyBoundary: string;
};

type CockpitInput = {
  storeOperatingPlan: RestaurantStoreOperatingPlan;
  aiConsultantCopilot: RestaurantAiConsultantCopilot;
  providerLaunchBoard: RestaurantProviderLaunchBoard;
  now?: Date;
};

function unique(values: string[], limit = 16) {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function zone(input: RestaurantAiCockpitZone): RestaurantAiCockpitZone {
  return input;
}

function statusFrom(counts: { providerGated?: number; needsEvidence?: number; blocked?: number }): RestaurantAiCockpitZone['status'] {
  if ((counts.blocked || 0) > 0) return 'blocked';
  if ((counts.providerGated || 0) > 0) return 'provider-gated';
  if ((counts.needsEvidence || 0) > 0) return 'needs-evidence';
  return 'ready-internal';
}

export function buildRestaurantAiCockpit(input: CockpitInput): RestaurantAiCockpit {
  const now = input.now || new Date();
  const operating = input.storeOperatingPlan;
  const consultant = input.aiConsultantCopilot;
  const provider = input.providerLaunchBoard;
  const firstToday = operating.dayPlan[0];
  const proofBlock = operating.dayPlan.find(item => item.id === 'content-proof');
  const closeoutBlock = operating.dayPlan.find(item => item.id === 'closeout-review');
  const launchOrder = provider.launchOrder[0];
  const zones = [
    zone({
      id: 'today-operations',
      title: 'Today Operations',
      status: statusFrom({
        providerGated: operating.dayPlan.filter(item => item.status === 'provider-gated').length,
        needsEvidence: operating.dayPlan.filter(item => item.status === 'needs-merchant-evidence').length,
      }),
      owner: 'store-manager',
      answer: firstToday?.action || 'Confirm the offer, service window, owner and proof requirements before today starts.',
      primaryAction: firstToday?.acceptance || 'Run the store operating plan.',
      visibleProof: operating.dayPlan.slice(0, 4).map(item => `${item.window}: ${item.title}`),
      providerGate: operating.providerUnlocks.slice(0, 4).join(' / ') || 'none',
      stopLine: 'Do not push demand if price, stock, service window or claim boundaries are not confirmed.',
    }),
    zone({
      id: 'ai-consultant',
      title: 'AI Consultant',
      status: statusFrom({
        providerGated: consultant.summary.providerGated,
        needsEvidence: consultant.summary.needsTraining,
        blocked: consultant.summary.forbidden,
      }),
      owner: 'ops',
      answer: consultant.executiveAnswer,
      primaryAction: consultant.actionPlays[0]?.title || 'Build restaurant consultant prescription.',
      visibleProof: consultant.actionPlays.slice(0, 3).map(item => `${item.owner}: ${item.title}`),
      providerGate: consultant.providerUnlocks.slice(0, 4).join(' / ') || 'none',
      stopLine: 'Advice becomes a task only when owner, evidence and stop line are visible.',
    }),
    zone({
      id: 'automation-launch',
      title: 'Automation Launch',
      status: provider.summary.canClaimExternalAutomation ? 'ready-internal' : 'provider-gated',
      owner: 'runtime-admin',
      answer: launchOrder?.action || 'Choose one Provider lane and run a signed sandbox receipt before production claims.',
      primaryAction: launchOrder?.evidenceRequired || 'Configure provider keys, merchant grants, callback and data contracts.',
      visibleProof: provider.capabilities.slice(0, 4).map(item => `${item.name}: ${item.status}`),
      providerGate: provider.providerKeyChecklist.slice(0, 5).join(' / ') || 'none',
      stopLine: 'No auto-publish, live call, POS write, payment, delivery or redemption claim without accepted Provider receipt.',
    }),
    zone({
      id: 'evidence-review',
      title: 'Evidence Review',
      status: closeoutBlock?.status === 'ready-internal' ? 'ready-internal' : 'needs-evidence',
      owner: 'finance',
      answer: closeoutBlock?.action || 'Closeout only uses public proof and sanitized aggregate operating data.',
      primaryAction: closeoutBlock?.acceptance || 'Import accepted proof and sanitized aggregate rows.',
      visibleProof: unique([
        ...(proofBlock?.evidenceRequired || []),
        ...(closeoutBlock?.evidenceRequired || []),
        ...operating.evidenceBoard,
      ], 6),
      providerGate: closeoutBlock?.providerGate || 'aggregate POS/coupon/member field dictionary',
      stopLine: 'No raw POS rows, payment ids, member ids, phone numbers, coupon codes or unsourced growth claims.',
    }),
  ];
  const readyInternal = zones.filter(item => item.status === 'ready-internal').length;
  const providerGated = zones.filter(item => item.status === 'provider-gated').length;
  const needsEvidence = zones.filter(item => item.status === 'needs-evidence').length;
  const blocked = zones.filter(item => item.status === 'blocked').length;
  const verdict: RestaurantAiCockpit['verdict'] = providerGated > 0
    ? 'provider-unlock-first'
    : needsEvidence > 0
      ? 'merchant-evidence-first'
      : 'usable-cockpit-now';

  return {
    ok: true,
    payloadShape: 'restaurant-ai-cockpit-v1',
    generatedAt: now.toISOString(),
    restaurant: operating.restaurant,
    offer: operating.offer,
    verdict,
    summary: {
      zones: zones.length,
      readyInternal,
      needsEvidence,
      providerGated,
      blocked,
      todayBlocks: operating.dayPlan.length,
      providerUnlocks: operating.providerUnlocks.length,
      canClaimAutomation: false,
    },
    zones,
    primaryRunbook: [
      'Open Today Operations first and confirm merchant evidence.',
      'Use AI Consultant only to create owner-visible plays, not hidden automation.',
      'Move Automation Launch one lane at a time through Provider health, merchant grant and signed callback.',
      'Close Evidence Review with public proof or sanitized aggregate imports before next-loop decisions.',
    ],
    evidenceBoard: unique([
      ...operating.evidenceBoard,
      ...zones.flatMap(item => item.visibleProof),
    ], 16),
    providerUnlocks: unique([
      ...operating.providerUnlocks,
      ...provider.providerKeyChecklist,
      ...consultant.providerUnlocks,
    ], 18),
    sourceSnapshots: {
      operatingPlan: {
        payloadShape: operating.payloadShape,
        verdict: operating.verdict,
        summary: operating.summary,
      },
      consultant: {
        payloadShape: consultant.payloadShape,
        mode: consultant.mode,
        summary: consultant.summary,
      },
      providerLaunch: {
        payloadShape: provider.payloadShape,
        summary: provider.summary,
      },
    },
    safetyBoundary: 'Restaurant AI Cockpit is an operating console. It does not log in, publish, contact customers, answer live calls, redeem coupons, write POS orders, take payment, dispatch delivery, expose provider keys, store private chats, store customer identifiers, pull raw POS rows or claim growth without accepted proof.',
  };
}

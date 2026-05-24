import type { RestaurantAiConsultantCopilot, RestaurantAiConsultantActionPlay } from '@/lib/restaurant-ai-consultant-copilot';
import type { RestaurantCustomerDemandGateway } from '@/lib/restaurant-customer-demand-gateway';
import type { RestaurantDayZeroMissionPack } from '@/lib/restaurant-day-zero-mission-pack';
import type { RestaurantProviderLaunchBoard } from '@/lib/restaurant-provider-launch-board';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';
import type { RestaurantVoiceOrderConsole } from '@/lib/restaurant-voice-order-console';

export type RestaurantStoreOperatingPlanStatus =
  | 'ready-internal'
  | 'needs-merchant-evidence'
  | 'provider-gated'
  | 'forbidden';

export type RestaurantStoreOperatingTimeBlock = {
  id: string;
  day: 'today' | 'tomorrow' | 'this-week';
  window: string;
  title: string;
  owner: 'store-manager' | 'chef' | 'community-ops' | 'runtime-admin' | 'finance' | 'ops' | 'shift-lead';
  status: RestaurantStoreOperatingPlanStatus;
  action: string;
  checklist: string[];
  evidenceRequired: string[];
  providerGate: string;
  acceptance: string;
  stopLine: string;
};

export type RestaurantStoreOperatingPlan = {
  ok: true;
  payloadShape: 'restaurant-store-operating-plan-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'can-run-today' | 'merchant-evidence-first' | 'provider-unlock-first';
  summary: {
    timeBlocks: number;
    readyInternal: number;
    needsMerchantEvidence: number;
    providerGated: number;
    forbidden: number;
    weeklyFocus: number;
    providerUnlocks: number;
    canRunTodayInternally: boolean;
    canClaimAutomation: boolean;
  };
  dayPlan: RestaurantStoreOperatingTimeBlock[];
  weekPlan: RestaurantStoreOperatingTimeBlock[];
  managerStandup: string[];
  staffTalkTracks: string[];
  evidenceBoard: string[];
  providerUnlocks: string[];
  consultantSnapshot: Pick<RestaurantAiConsultantCopilot, 'payloadShape' | 'mode' | 'summary' | 'executiveAnswer'>;
  missionSnapshot: Pick<RestaurantDayZeroMissionPack, 'payloadShape' | 'verdict' | 'summary'>;
  safetyBoundary: string;
};

type PlanInput = RestaurantTrialIntake & {
  aiConsultantCopilot: RestaurantAiConsultantCopilot;
  customerDemandGateway: RestaurantCustomerDemandGateway;
  voiceOrderConsole: RestaurantVoiceOrderConsole;
  providerLaunchBoard: RestaurantProviderLaunchBoard;
  dayZeroMissionPack: RestaurantDayZeroMissionPack;
  now?: Date;
};

function clean(value: unknown, fallback: string, max = 140): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function unique(values: string[], limit = 18) {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function statusFrom(gate: string[], needsEvidence: boolean, forbidden = false): RestaurantStoreOperatingPlanStatus {
  if (forbidden) return 'forbidden';
  if (gate.length) return 'provider-gated';
  if (needsEvidence) return 'needs-merchant-evidence';
  return 'ready-internal';
}

function firstPlay(copilot: RestaurantAiConsultantCopilot, mode: RestaurantAiConsultantActionPlay['mode']) {
  return copilot.actionPlays.find(play => play.mode === mode) || copilot.actionPlays[0];
}

function timeBlock(input: RestaurantStoreOperatingTimeBlock): RestaurantStoreOperatingTimeBlock {
  return input;
}

export function buildRestaurantStoreOperatingPlan(input: PlanInput): RestaurantStoreOperatingPlan {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, input.aiConsultantCopilot.restaurant || input.customerDemandGateway.restaurant);
  const offer = clean(input.offer, input.aiConsultantCopilot.offer || input.customerDemandGateway.offer);
  const trafficPlay = firstPlay(input.aiConsultantCopilot, 'traffic-growth');
  const contentPlay = firstPlay(input.aiConsultantCopilot, 'brand-content');
  const conversionPlay = firstPlay(input.aiConsultantCopilot, 'conversion-followup');
  const operationsPlay = firstPlay(input.aiConsultantCopilot, 'operations-review');
  const providerPlay = firstPlay(input.aiConsultantCopilot, 'provider-launch');
  const chefPlay = firstPlay(input.aiConsultantCopilot, 'menu-profit');
  const missionByLane = new Map(input.dayZeroMissionPack.missions.map(mission => [mission.lane, mission]));
  const providerUnlocks = unique([
    ...input.aiConsultantCopilot.providerUnlocks,
    ...input.providerLaunchBoard.externalRequired,
    ...input.dayZeroMissionPack.providerUnlocks,
  ]);

  const dayPlan = [
    timeBlock({
      id: 'opening-brief',
      day: 'today',
      window: '09:30 opening standup',
      title: 'Confirm offer boundary and visit reason',
      owner: 'store-manager',
      status: missionByLane.get('brief')?.status === 'ready-internal' ? 'ready-internal' : 'needs-merchant-evidence',
      action: `Confirm ${offer} price, stock, photo permission, service window and forbidden claims.`,
      checklist: ['menu price', 'available portions', 'service window', 'photo rights', 'forbidden claims'],
      evidenceRequired: ['merchant-approved offer brief', 'menu or dish proof'],
      providerGate: 'none',
      acceptance: 'The offer brief can be handed to staff and content ops without hidden assumptions.',
      stopLine: 'Do not publish or brief staff if price, stock, service window or claims are not confirmed.',
    }),
    timeBlock({
      id: 'kitchen-prep',
      day: 'today',
      window: '10:30 kitchen prep',
      title: 'Kitchen and front-desk talk track',
      owner: 'chef',
      status: statusFrom(chefPlay.providerDependencies, chefPlay.trainingNeeded.length > 0),
      action: chefPlay.steps[0] || `Turn ${offer} into one dining scene and one upsell sentence.`,
      checklist: chefPlay.trainingNeeded.slice(0, 5),
      evidenceRequired: chefPlay.acceptanceEvidence,
      providerGate: chefPlay.providerDependencies.join(' / ') || 'none',
      acceptance: chefPlay.customerOutcome,
      stopLine: chefPlay.stopLine,
    }),
    timeBlock({
      id: 'content-proof',
      day: 'today',
      window: '15:30 content proof window',
      title: 'Local content and public proof',
      owner: 'ops',
      status: statusFrom(contentPlay.providerDependencies, contentPlay.trainingNeeded.length > 0),
      action: contentPlay.steps[1] || 'Create platform-native content drafts with proof requirements.',
      checklist: contentPlay.trainingNeeded.slice(0, 5),
      evidenceRequired: contentPlay.acceptanceEvidence,
      providerGate: contentPlay.providerDependencies.join(' / ') || 'none',
      acceptance: 'Every content item has target platform, owner, proof receipt and next-loop use.',
      stopLine: contentPlay.stopLine,
    }),
    timeBlock({
      id: 'dinner-traffic',
      day: 'today',
      window: '17:30 dinner traffic loop',
      title: 'Nearby traffic and reservation/coupon intake',
      owner: 'community-ops',
      status: statusFrom(trafficPlay.providerDependencies, trafficPlay.trainingNeeded.length > 0),
      action: trafficPlay.steps[0] || 'Pick one target customer scene and one service window.',
      checklist: trafficPlay.trainingNeeded.slice(0, 5),
      evidenceRequired: trafficPlay.acceptanceEvidence,
      providerGate: trafficPlay.providerDependencies.join(' / ') || 'none',
      acceptance: 'Coupon, reservation, inquiry and visit-intent signals become aggregate owner tasks.',
      stopLine: trafficPlay.stopLine,
    }),
    timeBlock({
      id: 'front-desk-order',
      day: 'today',
      window: '18:00-20:30 service peak',
      title: 'Front-desk voice/order handoff',
      owner: 'shift-lead',
      status: input.voiceOrderConsole.summary.canWriteOrdersNow ? 'ready-internal' : 'provider-gated',
      action: 'Use intent classification and staff takeover rules for phone/order/reservation demand.',
      checklist: input.voiceOrderConsole.intents.slice(0, 4).map(intent => intent.label),
      evidenceRequired: ['intent category', 'staff owner', 'order draft or reservation note', 'no raw phone storage'],
      providerGate: input.voiceOrderConsole.externalRequired.slice(0, 5).join(' / ') || 'none',
      acceptance: 'Every live customer-facing action remains staff-reviewed until voice/POS/payment providers are proven.',
      stopLine: input.voiceOrderConsole.safetyBoundary,
    }),
    timeBlock({
      id: 'closeout-review',
      day: 'today',
      window: '22:30 closeout',
      title: 'Closeout operating review',
      owner: 'finance',
      status: statusFrom(operationsPlay.providerDependencies, operationsPlay.trainingNeeded.length > 0),
      action: operationsPlay.steps[0] || 'Validate business date, store, offer and POS field dictionary.',
      checklist: operationsPlay.trainingNeeded.slice(0, 5),
      evidenceRequired: operationsPlay.acceptanceEvidence,
      providerGate: operationsPlay.providerDependencies.join(' / ') || 'none',
      acceptance: 'Tomorrow action is based on sanitized aggregate proof, not raw POS rows or made-up attribution.',
      stopLine: operationsPlay.stopLine,
    }),
  ];

  const weekPlan = [
    timeBlock({
      id: 'week-day1',
      day: 'tomorrow',
      window: 'Day 1',
      title: 'Repeat only the proven content angle',
      owner: 'ops',
      status: missionByLane.get('publish-proof')?.status === 'external-gated' ? 'provider-gated' : 'needs-merchant-evidence',
      action: 'Use accepted public proof or manual screenshot to decide the next content variation.',
      checklist: ['accepted proof', 'platform', 'angle', 'owner'],
      evidenceRequired: ['public link or screenshot id', 'operator note'],
      providerGate: input.providerLaunchBoard.capabilities.find(item => item.id === 'public-platform-proof')?.providerKeysNeeded.join(' / ') || 'none',
      acceptance: 'No accepted proof, no repeated claim.',
      stopLine: 'Do not claim ranking, traffic or conversion lift without proof receipt.',
    }),
    timeBlock({
      id: 'week-day2',
      day: 'this-week',
      window: 'Day 2',
      title: 'Build staff-owned follow-up habit',
      owner: 'store-manager',
      status: statusFrom(conversionPlay.providerDependencies, conversionPlay.trainingNeeded.length > 0),
      action: conversionPlay.steps[2] || 'Assign owner, due time, evidence and next action.',
      checklist: conversionPlay.trainingNeeded.slice(0, 5),
      evidenceRequired: conversionPlay.acceptanceEvidence,
      providerGate: conversionPlay.providerDependencies.join(' / ') || 'none',
      acceptance: 'Every inquiry/coupon/reservation signal has an owner and staff-safe next action.',
      stopLine: conversionPlay.stopLine,
    }),
    timeBlock({
      id: 'week-day3',
      day: 'this-week',
      window: 'Day 3',
      title: 'Connect operating data contract',
      owner: 'finance',
      status: input.providerLaunchBoard.capabilities.find(item => item.id === 'operating-analysis')?.status === 'ready-to-sandbox' ? 'ready-internal' : 'provider-gated',
      action: 'Define aggregate POS/coupon/member field dictionary and import cadence.',
      checklist: ['business date', 'offer name', 'claim count', 'redemption count', 'order count', 'field dictionary'],
      evidenceRequired: ['sanitized aggregate import', 'field dictionary', 'merchant data owner'],
      providerGate: input.providerLaunchBoard.capabilities.find(item => item.id === 'operating-analysis')?.providerKeysNeeded.join(' / ') || 'none',
      acceptance: 'Operating insight can be rerun from aggregate fields without exposing customers.',
      stopLine: 'No raw POS rows, payment ids, member ids or unsourced margin claims.',
    }),
    timeBlock({
      id: 'week-day4',
      day: 'this-week',
      window: 'Day 4',
      title: 'Provider sandbox unlock',
      owner: 'runtime-admin',
      status: 'provider-gated',
      action: providerPlay.steps[1] || 'Configure server-side URL/key, callback secret and scoped merchant authorization.',
      checklist: providerPlay.trainingNeeded.slice(0, 5),
      evidenceRequired: providerPlay.acceptanceEvidence,
      providerGate: providerPlay.providerDependencies.join(' / ') || providerUnlocks.slice(0, 5).join(' / '),
      acceptance: 'One sandbox job returns signed callback receipt before production wording changes.',
      stopLine: providerPlay.stopLine,
    }),
  ];

  const allBlocks = [...dayPlan, ...weekPlan];
  const readyInternal = allBlocks.filter(item => item.status === 'ready-internal').length;
  const needsMerchantEvidence = allBlocks.filter(item => item.status === 'needs-merchant-evidence').length;
  const providerGated = allBlocks.filter(item => item.status === 'provider-gated').length;
  const forbidden = allBlocks.filter(item => item.status === 'forbidden').length;
  const verdict: RestaurantStoreOperatingPlan['verdict'] = dayPlan.some(item => item.status === 'provider-gated')
    ? 'provider-unlock-first'
    : dayPlan.some(item => item.status === 'needs-merchant-evidence')
      ? 'merchant-evidence-first'
      : 'can-run-today';

  return {
    ok: true,
    payloadShape: 'restaurant-store-operating-plan-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    verdict,
    summary: {
      timeBlocks: allBlocks.length,
      readyInternal,
      needsMerchantEvidence,
      providerGated,
      forbidden,
      weeklyFocus: weekPlan.length,
      providerUnlocks: providerUnlocks.length,
      canRunTodayInternally: dayPlan.some(item => item.status === 'ready-internal' || item.status === 'needs-merchant-evidence'),
      canClaimAutomation: false,
    },
    dayPlan,
    weekPlan,
    managerStandup: [
      `Today we sell ${offer} only inside confirmed price, stock, service-window and claim boundaries.`,
      'Content, reservation, coupon, inquiry and order signals must close with owner and evidence.',
      'Anything involving auto-publish, live calls, POS writes, payment, delivery or redemption waits for Provider proof.',
    ],
    staffTalkTracks: [
      `Front desk: ${offer} is available only if stock and service window are confirmed by store-manager.`,
      'Community ops: use approved scripts and aggregate counts; do not export contacts or read private messages.',
      'Finance: closeout uses sanitized aggregate rows only.',
    ],
    evidenceBoard: unique([
      ...dayPlan.flatMap(item => item.evidenceRequired),
      ...input.dayZeroMissionPack.evidenceImportFields,
    ], 16),
    providerUnlocks,
    consultantSnapshot: {
      payloadShape: input.aiConsultantCopilot.payloadShape,
      mode: input.aiConsultantCopilot.mode,
      summary: input.aiConsultantCopilot.summary,
      executiveAnswer: input.aiConsultantCopilot.executiveAnswer,
    },
    missionSnapshot: {
      payloadShape: input.dayZeroMissionPack.payloadShape,
      verdict: input.dayZeroMissionPack.verdict,
      summary: input.dayZeroMissionPack.summary,
    },
    safetyBoundary: 'Store Operating Plan turns restaurant consultant advice into owner, time-window, evidence and provider-unlock work. It does not auto-publish, contact customers, answer live calls, redeem coupons, write POS orders, take payment, dispatch delivery, expose provider keys, store private chats, store customer identifiers, pull raw POS rows or claim growth without accepted proof.',
  };
}

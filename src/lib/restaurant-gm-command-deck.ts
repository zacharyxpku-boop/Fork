import type { RestaurantAiEmployeeInbox } from '@/lib/restaurant-ai-employee-inbox';
import type { RestaurantProviderUnlockLadder } from '@/lib/restaurant-provider-unlock-ladder';
import type { RestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';

export type RestaurantGmCommandLaneStatus =
  | 'ai-can-run-internal'
  | 'staff-review'
  | 'provider-required'
  | 'evidence-required';

export type RestaurantGmCommandLane = {
  id: 'opening' | 'demand' | 'publish-proof' | 'service-window' | 'closeout';
  title: string;
  status: RestaurantGmCommandLaneStatus;
  owner: 'ai-employee' | 'store-manager' | 'ops' | 'runtime-admin' | 'finance';
  customerPromise: string;
  actionNow: string;
  visibleProof: string;
  providerAsk: string;
  stopLine: string;
};

export type RestaurantGmCommandDeck = {
  ok: true;
  payloadShape: 'restaurant-gm-command-deck-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  shiftMode: 'pre-open' | 'live-service' | 'closeout-review';
  answerForOwner: string;
  summary: {
    lanes: number;
    aiCanRunInternal: number;
    staffReview: number;
    providerRequired: number;
    evidenceRequired: number;
    canRunWithoutProvider: boolean;
    canClaimExternalAutomation: boolean;
  };
  lanes: RestaurantGmCommandLane[];
  aiAutopilotQueue: string[];
  staffQueue: string[];
  providerQueue: string[];
  evidenceQueue: string[];
  safetyBoundary: string;
};

type DeckInput = {
  restaurant: string;
  offer: string;
  storeManagerTaskQueue: Pick<RestaurantStoreManagerTaskQueue, 'summary' | 'tasks' | 'nextAction'>;
  aiEmployeeInbox: Pick<RestaurantAiEmployeeInbox, 'summary' | 'messages' | 'memory' | 'nextWakeup'>;
  providerUnlockLadder: Pick<RestaurantProviderUnlockLadder, 'summary' | 'items' | 'nextExternalAsks'>;
  now?: Date;
};

function countStatus(lanes: RestaurantGmCommandLane[], status: RestaurantGmCommandLaneStatus) {
  return lanes.filter(lane => lane.status === status).length;
}

function findUnlock(input: DeckInput, id: RestaurantProviderUnlockLadder['items'][number]['id']) {
  return input.providerUnlockLadder.items.find(item => item.id === id);
}

function providerStatus(unlock: RestaurantProviderUnlockLadder['items'][number] | undefined): RestaurantGmCommandLaneStatus {
  if (!unlock) return 'provider-required';
  if (unlock.stage === 'provider-health-ready') return 'ai-can-run-internal';
  if (unlock.stage === 'setup-evidence-signed') return 'staff-review';
  return 'provider-required';
}

function providerAsk(unlock: RestaurantProviderUnlockLadder['items'][number] | undefined, fallback: string) {
  if (!unlock) return fallback;
  return unlock.stillNeeds.slice(0, 2).join(' / ') || unlock.nextAction;
}

function unique(values: string[], limit = 8) {
  return Array.from(new Set(values.map(value => value.trim()).filter(Boolean))).slice(0, limit);
}

export function buildRestaurantGmCommandDeck(input: DeckInput): RestaurantGmCommandDeck {
  const now = input.now || new Date();
  const publishUnlock = findUnlock(input, 'auto-publish-proof');
  const leadUnlock = findUnlock(input, 'auto-lead-capture');
  const redemptionUnlock = findUnlock(input, 'coupon-redemption');
  const analysisUnlock = findUnlock(input, 'operating-analysis');
  const memoryUnlock = findUnlock(input, 'memory-follow-up');
  const task = input.storeManagerTaskQueue.tasks[0];
  const inboxMessage = input.aiEmployeeInbox.messages[0];
  const lanes: RestaurantGmCommandLane[] = [
    {
      id: 'opening',
      title: 'Open-shift command',
      status: 'ai-can-run-internal',
      owner: 'ai-employee',
      customerPromise: 'The restaurant knows the offer, owner, service window and proof requirement before traffic is pushed.',
      actionNow: inboxMessage?.title || 'Build the morning brief, task owners and stop line from sanitized restaurant facts.',
      visibleProof: input.aiEmployeeInbox.memory.map(item => `${item.label}:${item.value}`).slice(0, 3).join(' / ') || 'memory cards and owner checklist',
      providerAsk: providerAsk(memoryUnlock, 'Persistent runtime and staff delivery channel are required before autonomous follow-up.'),
      stopLine: 'No external contact or account action during opening unless merchant authorization and staff channel are configured.',
    },
    {
      id: 'demand',
      title: 'Demand and lead capture',
      status: providerStatus(leadUnlock),
      owner: leadUnlock?.stage === 'provider-health-ready' ? 'ai-employee' : 'store-manager',
      customerPromise: 'Reservations, coupon claims, private messages and visit intent become owner-visible follow-up tasks.',
      actionNow: task?.action || input.storeManagerTaskQueue.nextAction,
      visibleProof: task?.evidenceRequired || 'accepted public proof, imported lead aggregate or staff acknowledgement',
      providerAsk: providerAsk(leadUnlock, 'Platform inbox/export permission or approved manual import cadence.'),
      stopLine: 'Do not scrape private messages, store customer identifiers or claim auto-acquisition without authorized source proof.',
    },
    {
      id: 'publish-proof',
      title: 'Publish and proof',
      status: providerStatus(publishUnlock),
      owner: publishUnlock?.stage === 'provider-health-ready' ? 'runtime-admin' : 'ops',
      customerPromise: 'Local content is published only through an approved lane and closed by a public link, screenshot or signed callback.',
      actionNow: 'Prepare one governed channel package, then collect receipt before the next channel.',
      visibleProof: publishUnlock?.providerEvidence.join(' / ') || publishUnlock?.setupEvidence.join(' / ') || 'public link, screenshot id or signed callback receipt',
      providerAsk: providerAsk(publishUnlock, 'Scoped merchant platform authorization and signed proof callback.'),
      stopLine: 'No auto-publish claim until provider health, merchant grant and callback receipt are all ready.',
    },
    {
      id: 'service-window',
      title: 'Service window watch',
      status: redemptionUnlock?.stage === 'provider-health-ready' ? 'ai-can-run-internal' : 'staff-review',
      owner: 'store-manager',
      customerPromise: 'The AI watches stock, coupon pressure and service risk as tasks, not as hidden POS mutations.',
      actionNow: 'Review coupon claim pressure, low-stock notes and staff recovery queue during the meal window.',
      visibleProof: redemptionUnlock?.setupEvidence.join(' / ') || 'staff acknowledgement, coupon rule screenshot and aggregate redemption note',
      providerAsk: providerAsk(redemptionUnlock, 'POS/coupon redemption field dictionary and no-PII aggregate import.'),
      stopLine: 'No coupon mutation, payment, delivery, live call or POS write from this cockpit.',
    },
    {
      id: 'closeout',
      title: 'Closeout and next loop',
      status: analysisUnlock?.stage === 'provider-health-ready' ? 'ai-can-run-internal' : 'evidence-required',
      owner: 'finance',
      customerPromise: 'The day ends with measured evidence, unanswered questions and tomorrow actions, not fake growth numbers.',
      actionNow: 'Separate public proof, lead counts, redemption aggregate and next-loop channel tasks.',
      visibleProof: analysisUnlock?.providerEvidence.join(' / ') || analysisUnlock?.setupEvidence.join(' / ') || 'sanitized POS/coupon/member aggregate and field dictionary',
      providerAsk: providerAsk(analysisUnlock, 'Aggregate sales, redemption, order and campaign source fields.'),
      stopLine: 'No true operating-analysis claim without aggregate operating data contract and accepted proof.',
    },
  ];

  const aiAutopilotQueue = unique(lanes
    .filter(lane => lane.status === 'ai-can-run-internal')
    .map(lane => `${lane.title}: ${lane.actionNow}`));
  const staffQueue = unique(lanes
    .filter(lane => lane.status === 'staff-review' || lane.status === 'evidence-required')
    .map(lane => `${lane.title}: ${lane.visibleProof}`));
  const providerQueue = unique([
    ...lanes.filter(lane => lane.status === 'provider-required').map(lane => `${lane.title}: ${lane.providerAsk}`),
    ...input.providerUnlockLadder.nextExternalAsks,
  ], 10);
  const evidenceQueue = unique(lanes.map(lane => `${lane.title}: ${lane.visibleProof}`), 10);
  const providerRequired = countStatus(lanes, 'provider-required');
  const evidenceRequired = countStatus(lanes, 'evidence-required');

  return {
    ok: true,
    payloadShape: 'restaurant-gm-command-deck-v1',
    generatedAt: now.toISOString(),
    restaurant: input.restaurant,
    offer: input.offer,
    shiftMode: providerRequired > 2 ? 'pre-open' : evidenceRequired > 0 ? 'closeout-review' : 'live-service',
    answerForOwner: providerRequired > 0
      ? 'It is usable as an internal AI store manager today, but external automation still needs provider health, merchant authorization and data contracts.'
      : 'The internal command deck can run the shift loop; keep every external action behind signed receipts and proof.',
    summary: {
      lanes: lanes.length,
      aiCanRunInternal: countStatus(lanes, 'ai-can-run-internal'),
      staffReview: countStatus(lanes, 'staff-review'),
      providerRequired,
      evidenceRequired,
      canRunWithoutProvider: aiAutopilotQueue.length > 0,
      canClaimExternalAutomation: input.providerUnlockLadder.summary.canClaimExternalAutomation && providerRequired === 0 && evidenceRequired === 0,
    },
    lanes,
    aiAutopilotQueue,
    staffQueue,
    providerQueue,
    evidenceQueue,
    safetyBoundary: 'GM Command Deck is a shift command surface over sanitized tasks, staff review, provider gates and proof queues. It does not log in, publish, scrape private messages, redeem coupons, write POS orders, take payment, dispatch delivery, expose secrets, store customer identifiers, pull raw POS rows or claim growth without accepted proof.',
  };
}

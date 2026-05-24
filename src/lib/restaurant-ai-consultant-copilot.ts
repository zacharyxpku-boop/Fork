import type { RestaurantCommandRoute } from '@/lib/restaurant-command-router';
import type { RestaurantCustomerDemandGateway } from '@/lib/restaurant-customer-demand-gateway';
import type { RestaurantProviderLaunchBoard } from '@/lib/restaurant-provider-launch-board';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';
import type { RestaurantVoiceOrderConsole } from '@/lib/restaurant-voice-order-console';

export type RestaurantAiConsultantMode =
  | 'menu-profit'
  | 'traffic-growth'
  | 'conversion-followup'
  | 'operations-review'
  | 'brand-content'
  | 'provider-launch';

export type RestaurantAiConsultantStatus =
  | 'internal-ready'
  | 'needs-training'
  | 'provider-gated'
  | 'forbidden';

export type RestaurantAiConsultantDiagnosis = {
  id: string;
  label: string;
  status: RestaurantAiConsultantStatus;
  finding: string;
  evidence: string[];
  nextAction: string;
};

export type RestaurantAiConsultantActionPlay = {
  id: string;
  title: string;
  mode: RestaurantAiConsultantMode;
  owner: 'store-manager' | 'chef' | 'community-ops' | 'runtime-admin' | 'finance' | 'ops';
  customerOutcome: string;
  steps: string[];
  canExecuteInternallyNow: boolean;
  trainingNeeded: string[];
  providerDependencies: string[];
  acceptanceEvidence: string[];
  stopLine: string;
};

export type RestaurantAiConsultantCopilot = {
  ok: true;
  payloadShape: 'restaurant-ai-consultant-copilot-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  mode: RestaurantAiConsultantMode;
  questionSummary: string;
  executiveAnswer: string;
  summary: {
    diagnoses: number;
    actionPlays: number;
    internalReady: number;
    needsTraining: number;
    providerGated: number;
    forbidden: number;
    canClaimAutonomousOutcome: boolean;
  };
  diagnoses: RestaurantAiConsultantDiagnosis[];
  actionPlays: RestaurantAiConsultantActionPlay[];
  trainingQueue: Array<{
    id: string;
    owner: RestaurantAiConsultantActionPlay['owner'];
    material: string;
    reason: string;
  }>;
  providerUnlocks: string[];
  operatorScript: string[];
  boardSnapshot: Pick<RestaurantProviderLaunchBoard, 'payloadShape' | 'summary' | 'providerKeyChecklist'>;
  safetyBoundary: string;
};

type ConsultantInput = RestaurantTrialIntake & {
  commandRoute?: RestaurantCommandRoute;
  customerDemandGateway: RestaurantCustomerDemandGateway;
  voiceOrderConsole: RestaurantVoiceOrderConsole;
  providerLaunchBoard: RestaurantProviderLaunchBoard;
  now?: Date;
};

function clean(value: unknown, fallback: string, max = 140): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function unique(values: string[], limit = 16) {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function includesAny(text: string, words: string[]) {
  const lowered = text.toLowerCase();
  return words.some(word => lowered.includes(word.toLowerCase()));
}

function inferMode(commandRoute: RestaurantCommandRoute | undefined, text: string): RestaurantAiConsultantMode {
  if (commandRoute?.intent === 'provider-setup') return 'provider-launch';
  if (commandRoute?.intent === 'operating-review') return 'operations-review';
  if (commandRoute?.intent === 'store-followup') return 'conversion-followup';
  if (commandRoute?.intent === 'public-proof') return 'brand-content';
  if (includesAny(text, ['traffic', 'customer', 'nearby', 'coupon', 'reservation', 'visit', '获客', '到店', '领券', '预约'])) return 'traffic-growth';
  if (includesAny(text, ['profit', 'gross margin', 'margin', 'cost', 'menu', 'dish', 'combo', 'price', '毛利', '菜单', '菜品', '套餐'])) return 'menu-profit';
  if (includesAny(text, ['brand', 'content', 'xiaohongshu', 'douyin', 'dianping', 'wechat', '宣传', '小红书', '抖音', '点评'])) return 'brand-content';
  return 'traffic-growth';
}

function statusFrom(providerDependencies: string[], trainingNeeded: string[], forbidden = false): RestaurantAiConsultantStatus {
  if (forbidden) return 'forbidden';
  if (providerDependencies.length) return 'provider-gated';
  if (trainingNeeded.length) return 'needs-training';
  return 'internal-ready';
}

function buildPlays(input: {
  mode: RestaurantAiConsultantMode;
  restaurant: string;
  offer: string;
  customerDemandGateway: RestaurantCustomerDemandGateway;
  voiceOrderConsole: RestaurantVoiceOrderConsole;
  providerLaunchBoard: RestaurantProviderLaunchBoard;
}): RestaurantAiConsultantActionPlay[] {
  const launch = input.providerLaunchBoard;
  const publicProof = launch.capabilities.find(item => item.id === 'public-platform-proof');
  const operating = launch.capabilities.find(item => item.id === 'operating-analysis');
  const voice = launch.capabilities.find(item => item.id === 'voice-reception');
  const messaging = launch.capabilities.find(item => item.id === 'staff-and-customer-messaging');
  const pos = launch.capabilities.find(item => item.id === 'pos-order-payment-delivery');
  const runtime = launch.capabilities.find(item => item.id === 'persistent-agent-runtime');

  const menuPlay: RestaurantAiConsultantActionPlay = {
    id: 'menu-profit-prescription',
    title: 'Menu and combo profit prescription',
    mode: 'menu-profit',
    owner: 'chef',
    customerOutcome: `${input.offer} gets a sellable story, staff talk track, menu proof and a source-field list before any margin claim.`,
    steps: [
      'Rewrite the offer into one clear dining scene, one reason to visit today and one staff upsell sentence.',
      'Separate hard facts from assumptions: price, portion, stock, prep pressure, redemption rule and photo permission.',
      'Create two content angles: local-life search intent and social sharing intent.',
      'Ask finance for aggregate cost or POS fields before saying margin improved.',
    ],
    canExecuteInternallyNow: true,
    trainingNeeded: ['dish photo', 'menu price', 'portion rule', 'store capacity window'],
    providerDependencies: operating?.status === 'ready-to-sandbox' ? [] : ['aggregate POS/coupon/member field dictionary'],
    acceptanceEvidence: ['approved menu card', 'staff talk track', 'aggregate cost or POS field list'],
    stopLine: 'No gross-margin, stock or sales conclusion without source fields.',
  };

  const trafficPlay: RestaurantAiConsultantActionPlay = {
    id: 'nearby-traffic-loop',
    title: 'Nearby traffic and coupon loop',
    mode: 'traffic-growth',
    owner: 'community-ops',
    customerOutcome: 'Turn local intent into a content proof, coupon/reservation signal and store-manager follow-up lane.',
    steps: [
      'Pick one target customer scene and one time window.',
      'Generate Dianping/Xiaohongshu/Douyin/WeChat variants with platform-specific proof requirements.',
      'Route coupon claim, reservation, inquiry and visit intent into aggregate follow-up tasks.',
      'Close the loop with public link/screenshot or manual proof before the next action.',
    ],
    canExecuteInternallyNow: true,
    trainingNeeded: ['target block or mall', 'coupon rule', 'service window', 'proof screenshot/link'],
    providerDependencies: unique([...(publicProof?.providerKeysNeeded || []), ...(messaging?.providerKeysNeeded || [])], 5),
    acceptanceEvidence: ['content work order', 'public proof link or screenshot', 'aggregate lead count', 'store owner'],
    stopLine: 'No auto-acquisition claim without provider receipt and opt-in proof.',
  };

  const conversionPlay: RestaurantAiConsultantActionPlay = {
    id: 'inquiry-to-visit-followup',
    title: 'Inquiry to visit follow-up',
    mode: 'conversion-followup',
    owner: 'store-manager',
    customerOutcome: 'Convert reservations, coupon claims and private-domain intent into staff-owned tasks without exporting customer contacts.',
    steps: [
      'Classify intent by phone order, reservation, coupon, private-domain inquiry and delivery/POS bridge.',
      'Draft the staff-only reply and escalation rule.',
      'Assign owner, due time, evidence and next action.',
      'Only open customer messaging after opt-in source and delivery provider are proven.',
    ],
    canExecuteInternallyNow: input.customerDemandGateway.summary.internalReady > 0,
    trainingNeeded: ['approved reply scripts', 'store capacity rule', 'coupon terms', 'staff owner roster'],
    providerDependencies: messaging?.status === 'ready-to-sandbox' ? [] : messaging?.providerKeysNeeded || [],
    acceptanceEvidence: ['aggregate intent count', 'staff handoff id', 'owner acknowledgement'],
    stopLine: 'No private-message reads, customer contact export or unsolicited outreach.',
  };

  const operationsPlay: RestaurantAiConsultantActionPlay = {
    id: 'closeout-operating-review',
    title: 'Closeout operating review',
    mode: 'operations-review',
    owner: 'finance',
    customerOutcome: 'After service, produce a next-day operating decision from sanitized coupon, stock, sales and prep-pressure aggregates.',
    steps: [
      'Validate the business date, store, offer and POS field dictionary.',
      'Compare claim, redemption, order count, stock pressure and staff notes.',
      'Flag only source-backed anomalies.',
      'Create tomorrow preparation, content and follow-up tasks.',
    ],
    canExecuteInternallyNow: true,
    trainingNeeded: ['field dictionary', 'coupon claim count', 'redemption count', 'stock or prep note'],
    providerDependencies: unique([...(operating?.providerKeysNeeded || []), ...(pos?.providerKeysNeeded || [])], 6),
    acceptanceEvidence: ['sanitized import batch', 'field dictionary', 'owner-reviewed next-day action'],
    stopLine: 'No raw POS rows, payment ids, member ids, coupon codes or unsourced attribution.',
  };

  const brandPlay: RestaurantAiConsultantActionPlay = {
    id: 'brand-content-consultant',
    title: 'Brand content consultant',
    mode: 'brand-content',
    owner: 'ops',
    customerOutcome: 'Build a local-life content plan that explains why this restaurant is worth visiting today and how proof returns.',
    steps: [
      'Choose the hero scene: date night, office lunch, family meal, late dinner or first-visit tasting.',
      'Convert food facts into platform-native angles.',
      'Attach required asset and claim boundaries to every draft.',
      'Schedule proof capture and store-manager follow-up.',
    ],
    canExecuteInternallyNow: true,
    trainingNeeded: ['dish photos', 'store exterior photo', 'brand tone', 'forbidden claims'],
    providerDependencies: publicProof?.status === 'ready-to-sandbox' ? [] : publicProof?.providerKeysNeeded || [],
    acceptanceEvidence: ['approved content pack', 'public proof receipt', 'next-loop plan'],
    stopLine: 'No fake review, fake traffic number, fake ranking or unauthenticated publish claim.',
  };

  const providerPlay: RestaurantAiConsultantActionPlay = {
    id: 'provider-launch-prescription',
    title: 'Provider launch prescription',
    mode: 'provider-launch',
    owner: 'runtime-admin',
    customerOutcome: 'Translate competitor-grade automatic publishing, calls, POS, payment, delivery and persistent agents into exact keys, grants, callbacks and sandbox receipts.',
    steps: [
      'Start with the one capability that has the clearest merchant value and least PII risk.',
      'Configure server-side URL/key, callback secret and scoped merchant authorization.',
      'Run one sandbox job and accept only signed proof receipts.',
      'Unlock production wording only for the proven lane.',
    ],
    canExecuteInternallyNow: false,
    trainingNeeded: ['merchant action scope', 'revocation owner', 'sandbox acceptance criteria'],
    providerDependencies: unique([...(runtime?.providerKeysNeeded || []), ...(voice?.providerKeysNeeded || []), ...(pos?.providerKeysNeeded || [])], 8),
    acceptanceEvidence: ['provider health ready', 'signed callback receipt', 'sandbox run id', 'audit owner'],
    stopLine: 'No cookies, tokens, browser profile identifiers, live calls, POS writes, payments or delivery dispatch without Provider receipts.',
  };

  const plays = [menuPlay, trafficPlay, conversionPlay, operationsPlay, brandPlay, providerPlay];
  const preferred = plays.find(item => item.mode === input.mode);
  return preferred ? [preferred, ...plays.filter(item => item.id !== preferred.id)].slice(0, 4) : plays.slice(0, 4);
}

export function buildRestaurantAiConsultantCopilot(input: ConsultantInput): RestaurantAiConsultantCopilot {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, input.customerDemandGateway.restaurant || 'Trial restaurant');
  const offer = clean(input.offer, input.customerDemandGateway.offer || 'Today featured set meal');
  const commandText = input.commandRoute?.command || '';
  const mode = inferMode(input.commandRoute, commandText);
  const plays = buildPlays({
    mode,
    restaurant,
    offer,
    customerDemandGateway: input.customerDemandGateway,
    voiceOrderConsole: input.voiceOrderConsole,
    providerLaunchBoard: input.providerLaunchBoard,
  });
  const diagnoses: RestaurantAiConsultantDiagnosis[] = [
    {
      id: 'demand-entry',
      label: 'Demand entry',
      status: input.customerDemandGateway.summary.internalReady > 0 ? 'internal-ready' : 'needs-training',
      finding: `${input.customerDemandGateway.summary.channels} demand channels are modeled; ${input.customerDemandGateway.summary.providerGated} need provider proof before automation claims.`,
      evidence: input.customerDemandGateway.channels.slice(0, 3).map(item => `${item.name}: ${item.status}`),
      nextAction: input.customerDemandGateway.staffHandoff[0]?.action || 'Attach owner, source and next action to each demand signal.',
    },
    {
      id: 'voice-and-order',
      label: 'Voice and order intent',
      status: input.voiceOrderConsole.summary.canWriteOrdersNow ? 'internal-ready' : 'provider-gated',
      finding: `${input.voiceOrderConsole.summary.intents} phone/order intents are available; POS write is ${input.voiceOrderConsole.summary.canWriteOrdersNow ? 'ready' : 'gated'}.`,
      evidence: input.voiceOrderConsole.intents.slice(0, 3).map(item => `${item.label}: ${item.status}`),
      nextAction: input.voiceOrderConsole.syncGates.find(item => item.status !== 'ready-by-label')?.nextAction || 'Run a sandbox order draft before POS write.',
    },
    {
      id: 'provider-reality',
      label: 'Provider reality',
      status: input.providerLaunchBoard.summary.canClaimExternalAutomation ? 'internal-ready' : 'provider-gated',
      finding: `${input.providerLaunchBoard.summary.readyToSandbox} capabilities are sandbox-ready; ${input.providerLaunchBoard.summary.missingProvider} still miss provider setup.`,
      evidence: input.providerLaunchBoard.capabilities.slice(0, 4).map(item => `${item.name}: ${item.status}`),
      nextAction: input.providerLaunchBoard.launchOrder[0]?.action || 'Pick one provider lane and run signed sandbox proof.',
    },
    {
      id: 'private-data-boundary',
      label: 'Private data boundary',
      status: 'forbidden',
      finding: 'Raw customer identifiers, private chats, payment ids, coupon codes and POS rows stay outside the client.',
      evidence: ['sensitive command redaction', 'provider launch stop lines', 'aggregate-only data contracts'],
      nextAction: 'Use aggregate counts, public proof receipts and staff-owned tasks only.',
    },
  ];
  const trainingQueue = plays
    .flatMap(play => play.trainingNeeded.map((material, index) => ({
      id: `${play.id}-training-${index + 1}`,
      owner: play.owner,
      material,
      reason: play.title,
    })))
    .slice(0, 12);
  const providerUnlocks = unique([
    ...plays.flatMap(item => item.providerDependencies),
    ...input.providerLaunchBoard.externalRequired,
  ], 18);
  const statusCounts = plays.map(play => statusFrom(play.providerDependencies, play.trainingNeeded, false));

  return {
    ok: true,
    payloadShape: 'restaurant-ai-consultant-copilot-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    mode,
    questionSummary: input.commandRoute?.extracted.forbiddenHints.length
      ? 'Sensitive customer or secret material was detected, so the consultant uses only sanitized restaurant context.'
      : `${mode} advice for ${restaurant} / ${offer}`,
    executiveAnswer: `Start with ${plays[0].title}: ${plays[0].customerOutcome} The system can prepare the internal plan now, but it cannot claim autonomous results until provider receipts, merchant authorization and data contracts match the lane.`,
    summary: {
      diagnoses: diagnoses.length,
      actionPlays: plays.length,
      internalReady: statusCounts.filter(item => item === 'internal-ready').length,
      needsTraining: statusCounts.filter(item => item === 'needs-training').length,
      providerGated: statusCounts.filter(item => item === 'provider-gated').length,
      forbidden: diagnoses.filter(item => item.status === 'forbidden').length,
      canClaimAutonomousOutcome: false,
    },
    diagnoses,
    actionPlays: plays,
    trainingQueue,
    providerUnlocks,
    operatorScript: [
      `Ask the merchant to confirm ${offer} facts: price, photo rights, availability, service window and forbidden claims.`,
      `Run ${plays[0].title} internally first; attach owner, evidence and next action before any provider handoff.`,
      'If the merchant wants automatic publishing, calls, POS writes, payment, delivery or redemption, configure Provider keys and run a signed sandbox receipt first.',
    ],
    boardSnapshot: {
      payloadShape: input.providerLaunchBoard.payloadShape,
      summary: input.providerLaunchBoard.summary,
      providerKeyChecklist: input.providerLaunchBoard.providerKeyChecklist,
    },
    safetyBoundary: 'Restaurant AI Consultant Copilot gives operating advice, task plans, training queues and provider unlock lists. It does not log in, publish, contact customers, answer live calls, redeem coupons, write POS orders, take payment, dispatch delivery, expose secrets, store private chats, store customer identifiers, pull raw POS rows or claim growth without accepted evidence.',
  };
}

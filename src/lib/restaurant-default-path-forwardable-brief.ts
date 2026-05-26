import type { RestaurantClawExperienceDefaultPath } from '@/lib/restaurant-claw-experience-default-path';
import type { RestaurantExternalUnlockRequestPack } from '@/lib/restaurant-external-unlock-request-pack';
import type { RestaurantOperatingInsightReport } from '@/lib/restaurant-operating-insight-report';
import type { RestaurantProviderKeyGapBoard } from '@/lib/restaurant-provider-key-gap-board';
import type { RestaurantProviderReceiptLifecycle } from '@/lib/restaurant-provider-receipt-lifecycle';
import type { RestaurantProviderSetupPack } from '@/lib/restaurant-provider-setup-pack';
import type { RestaurantPublishExecutionInbox } from '@/lib/restaurant-publish-execution-inbox';
import type { RestaurantShiftOperatingLoopPack } from '@/lib/restaurant-shift-operating-loop-pack';
import type { RestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';
import type { RestaurantTodayCommandCockpit } from '@/lib/restaurant-today-command-cockpit';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantForwardableBriefRow = {
  id: string;
  owner: 'merchant' | 'store-manager' | 'ops' | 'runtime-admin' | 'data-ops' | 'provider';
  title: string;
  status: 'ready-now' | 'needs-merchant-review' | 'needs-provider' | 'needs-data-contract' | 'blocked-boundary';
  action: string;
  proofRequired: string;
};

export type RestaurantDefaultPathForwardableBrief = {
  ok: true;
  payloadShape: 'restaurant-default-path-forwardable-brief-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  headline: string;
  operatorSummary: string;
  summary: {
    internalReady: number;
    merchantReview: number;
    providerBlocked: number;
    dataBlocked: number;
    canForwardToStoreManager: boolean;
    canClaimExternalAutomation: false;
    canClaimTrueOperatingAnalysis: false;
  };
  todayOperatingOrder: RestaurantForwardableBriefRow[];
  managerHandoff: string[];
  providerHandoff: string[];
  evidenceStatus: Array<{
    lane: string;
    status: 'accepted' | 'waiting-proof' | 'provider-gated' | 'data-gated';
    evidence: string;
  }>;
  externalRequired: string[];
  stopLines: string[];
  redactedFields: string[];
  shareText: string;
};

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function unique(values: unknown[], limit = 12): string[] {
  return Array.from(new Set(values
    .filter((item): item is string => typeof item === 'string')
    .map(item => item.trim())
    .filter(Boolean))).slice(0, limit);
}

function countRows(rows: RestaurantForwardableBriefRow[], status: RestaurantForwardableBriefRow['status']) {
  return rows.filter(row => row.status === status).length;
}

export function buildRestaurantDefaultPathForwardableBrief(input: RestaurantTrialIntake & {
  defaultPath: RestaurantClawExperienceDefaultPath;
  storeManagerTaskQueue?: RestaurantStoreManagerTaskQueue;
  providerSetupPack?: RestaurantProviderSetupPack;
  externalUnlockRequestPack?: RestaurantExternalUnlockRequestPack;
  todayCommandCockpit?: RestaurantTodayCommandCockpit;
  publishExecutionInbox?: RestaurantPublishExecutionInbox;
  shiftOperatingLoopPack?: RestaurantShiftOperatingLoopPack;
  operatingInsightReport?: RestaurantOperatingInsightReport;
  providerReceiptLifecycle?: RestaurantProviderReceiptLifecycle;
  providerKeyGapBoard?: RestaurantProviderKeyGapBoard;
  now?: Date;
}): RestaurantDefaultPathForwardableBrief {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant || input.defaultPath.restaurant, 'Trial restaurant');
  const offer = clean(input.offer || input.defaultPath.offer, 'Today featured offer');
  const firstOpenTask = input.storeManagerTaskQueue?.tasks.find(task => task.status !== 'done');
  const firstProviderGap = input.providerKeyGapBoard?.rows.find(item => item.status !== 'internal-ready');
  const firstCockpitLane = input.todayCommandCockpit?.lanes.find(lane => lane.status !== 'run-now');

  const todayOperatingOrder: RestaurantForwardableBriefRow[] = [
    {
      id: 'confirm-offer',
      owner: 'merchant',
      title: 'Confirm the store offer and stop lines',
      status: 'needs-merchant-review',
      action: `Confirm ${offer}, target diners, channel, coupon rules, stock/price limits and forbidden claims.`,
      proofRequired: 'merchant-approved offer brief or menu/coupon screenshot',
    },
    {
      id: 'run-internal-pack',
      owner: 'ops',
      title: 'Run the internal Claw-style work pack',
      status: input.defaultPath.summary.canRunTodayWithoutProvider ? 'ready-now' : 'needs-merchant-review',
      action: 'Create content plan, publish proof slots, owner queue, staff handoff and manual follow-up script.',
      proofRequired: 'default path payload, task queue and staff handoff',
    },
    {
      id: 'store-manager-followup',
      owner: 'store-manager',
      title: firstOpenTask?.action || 'Store manager follows the first customer-facing action',
      status: firstOpenTask ? 'ready-now' : 'needs-merchant-review',
      action: firstOpenTask?.talkTrack || firstCockpitLane?.todayAction || 'Review the generated tasks and collect public proof before any external claim.',
      proofRequired: firstOpenTask?.evidenceRequired || 'public link, screenshot id or manager approval note',
    },
    {
      id: 'provider-unlock',
      owner: 'runtime-admin',
      title: firstProviderGap?.label || 'Unlock provider execution lanes',
      status: 'needs-provider',
      action: firstProviderGap?.nextAction || 'Configure runtime URL/key, callback secret, merchant grant and isolated browser profile before sandbox submit.',
      proofRequired: 'provider health, signed callback, merchant authorization and accepted receipt',
    },
    {
      id: 'data-contract',
      owner: 'data-ops',
      title: 'Connect aggregate POS, coupon and member data',
      status: 'needs-data-contract',
      action: 'Import only aggregate operating fields before claiming redemption or true operating analysis.',
      proofRequired: 'field dictionary, accepted aggregate import and no-PII sample',
    },
    {
      id: 'claim-boundary',
      owner: 'provider',
      title: 'Keep competitor-grade claims blocked until receipts close',
      status: 'blocked-boundary',
      action: 'Do not claim auto-publish, auto-acquisition, auto-redemption or true analysis until accepted provider receipts exist.',
      proofRequired: input.providerReceiptLifecycle?.summary.waitingReceipts ? 'signed provider receipt still waiting' : 'accepted public proof and signed receipt',
    },
  ];

  const providerHandoff = unique([
    ...(input.externalUnlockRequestPack?.customerHandoffCopy || []),
    ...(input.providerSetupPack?.copyForMerchant || []),
    ...(input.providerKeyGapBoard?.rows.flatMap(item => item.externalNeeded) || []),
  ], 8);

  const externalRequired = unique([
    ...input.defaultPath.providerNeeded,
    ...(input.providerSetupPack?.priorityRequests.map(item => item.label) || []),
    ...(input.externalUnlockRequestPack?.signoffChecklist.map(item => item.title) || []),
    ...(input.providerKeyGapBoard?.rows.flatMap(item => item.externalNeeded) || []),
  ], 14);

  const managerHandoff = unique([
    `Today focus: ${restaurant} / ${offer}.`,
    `Start with internal work now: ${input.defaultPath.summary.readyNow} ready steps, ${input.defaultPath.summary.trainingNeeded} training gaps, ${input.defaultPath.summary.providerGated} provider or boundary gates.`,
    firstOpenTask ? `First owner task: ${firstOpenTask.action}` : 'First owner task: confirm offer, proof slot and publish/follow-up owner.',
    input.shiftOperatingLoopPack?.nextBestAction.label || 'Next shift action: collect proof, review receipts and update the next operating loop.',
  ], 6);

  const evidenceStatus = [
    {
      lane: 'internal work pack',
      status: input.defaultPath.summary.canRunTodayWithoutProvider ? 'accepted' as const : 'waiting-proof' as const,
      evidence: 'default path, skill workbench, task queue and handoff generated',
    },
    {
      lane: 'publish and browser runner',
      status: input.publishExecutionInbox?.summary.canClaimAutoPublish ? 'accepted' as const : 'provider-gated' as const,
      evidence: input.publishExecutionInbox?.verdict || 'provider-unlock-first',
    },
    {
      lane: 'provider receipts',
      status: input.providerReceiptLifecycle?.verdict === 'accepted-closeout-ready' ? 'accepted' as const : 'provider-gated' as const,
      evidence: input.providerReceiptLifecycle?.verdict || 'waiting signed/public accepted receipt',
    },
    {
      lane: 'operating analysis',
      status: input.operatingInsightReport?.summary.canClaimTrueOperatingAnalysis ? 'accepted' as const : 'data-gated' as const,
      evidence: 'true analysis requires accepted aggregate POS/coupon/member contract',
    },
  ];

  const stopLines = [
    'No Provider key, merchant grant, callback secret or isolated browser profile means no real external execution claim.',
    'No signed callback and accepted public receipt means no auto-publish or auto-acquisition claim.',
    'No aggregate POS/coupon/member data contract means no redemption or true operating analysis claim.',
    'Never send secrets, cookies, raw private messages, customer PII, coupon codes, payment ids or raw POS rows.',
  ];

  const shareText = [
    `${restaurant} / ${offer}`,
    `Today: ${todayOperatingOrder[0].action}`,
    `Internal now: ${input.defaultPath.summary.readyNow} ready steps; external automation remains blocked until provider proof is accepted.`,
    `Next owner task: ${todayOperatingOrder[2].action}`,
    `Provider ask: ${externalRequired.slice(0, 3).join(' / ') || 'runtime URL/key, callback secret and merchant grant'}`,
  ].join('\n');

  return {
    ok: true,
    payloadShape: 'restaurant-default-path-forwardable-brief-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    headline: 'One-page operating brief for the first restaurant AI shift',
    operatorSummary: `${restaurant} can run the internal work pack now, but external automation stays blocked until provider, merchant authorization, callback receipt and data contracts are accepted.`,
    summary: {
      internalReady: countRows(todayOperatingOrder, 'ready-now'),
      merchantReview: countRows(todayOperatingOrder, 'needs-merchant-review'),
      providerBlocked: countRows(todayOperatingOrder, 'needs-provider') + countRows(todayOperatingOrder, 'blocked-boundary'),
      dataBlocked: countRows(todayOperatingOrder, 'needs-data-contract'),
      canForwardToStoreManager: true,
      canClaimExternalAutomation: false,
      canClaimTrueOperatingAnalysis: false,
    },
    todayOperatingOrder,
    managerHandoff,
    providerHandoff,
    evidenceStatus,
    externalRequired,
    stopLines,
    redactedFields: [
      'api keys',
      'auth tokens',
      'cookies',
      'browser profile ids',
      'private message text',
      'customer phone or WeChat id',
      'coupon codes',
      'payment ids',
      'raw POS rows',
    ],
    shareText,
  };
}

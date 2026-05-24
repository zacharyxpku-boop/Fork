import type { RestaurantAgentChannelDeliveryReport } from '@/lib/restaurant-agent-channel-delivery-store';
import { buildRestaurantAgentChannelHub, type RestaurantAgentChannelHub } from '@/lib/restaurant-agent-channel-hub';
import type { RestaurantAgentChannelScheduleRun } from '@/lib/restaurant-agent-channel-scheduler';
import type { RestaurantPostRunReviewPack } from '@/lib/restaurant-post-run-review-pack';
import type { RestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantNextLoopChannelLaneId =
  | 'service-prep'
  | 'public-proof'
  | 'staff-notification'
  | 'community-followup'
  | 'pos-redemption'
  | 'provider-unlock';

export type RestaurantNextLoopChannelLane = {
  id: RestaurantNextLoopChannelLaneId;
  status: 'internal-ready' | 'needs-evidence' | 'provider-gated';
  owner: 'ops' | 'store-manager' | 'shift-lead' | 'community-ops' | 'finance' | 'runtime-admin';
  title: string;
  source: string;
  evidenceRequired: string[];
  nextAction: string;
  stopLine: string;
};

export type RestaurantNextLoopScheduledAction = {
  id: string;
  laneId: RestaurantNextLoopChannelLaneId;
  dueWindow: string;
  owner: RestaurantNextLoopChannelLane['owner'];
  channel: string;
  action: string;
  status: 'ready-internal' | 'manual-only' | 'provider-gated';
  evidenceRequired: string[];
  providerGate: string;
  manualFallback: string;
  nextAction: string;
};

export type RestaurantNextLoopChannelPlan = {
  ok: true;
  payloadShape: 'restaurant-next-loop-channel-plan-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'ready-for-internal-shift' | 'manual-proof-first' | 'provider-unlock-first';
  summary: {
    lanes: number;
    internalReadyLanes: number;
    evidenceNeededLanes: number;
    providerGatedLanes: number;
    scheduledActions: number;
    readyInternalActions: number;
    manualOnlyActions: number;
    providerGatedActions: number;
    acceptedReceipts: number;
    storeTasks: number;
    acceptedPosImports: number;
    staffDeliveryAttempts: number;
    canRunInternallyNow: boolean;
    canClaimExternalAutomation: boolean;
    canClaimTrueOperatingAnalysis: boolean;
  };
  lanes: RestaurantNextLoopChannelLane[];
  scheduledActions: RestaurantNextLoopScheduledAction[];
  channelHub: Pick<RestaurantAgentChannelHub, 'payloadShape' | 'summary' | 'scheduledJobs' | 'externalRequired' | 'safetyBoundary'>;
  postRunReview: Pick<RestaurantPostRunReviewPack, 'payloadShape' | 'verdict' | 'summary' | 'nextLoopSop' | 'externalRequired' | 'safetyBoundary'>;
  channelDeliveryReport?: Pick<RestaurantAgentChannelDeliveryReport, 'payloadShape' | 'summary' | 'latest' | 'externalRequired' | 'safetyBoundary'>;
  channelScheduleRun?: Pick<RestaurantAgentChannelScheduleRun, 'payloadShape' | 'summary' | 'items' | 'recovery' | 'externalRequired' | 'safetyBoundary'>;
  externalRequired: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, 120) : fallback;
}

function unique(values: string[]) {
  return values.filter((item, index, list) => item.trim() && list.indexOf(item) === index);
}

function lane(input: RestaurantNextLoopChannelLane): RestaurantNextLoopChannelLane {
  return input;
}

function action(input: RestaurantNextLoopScheduledAction): RestaurantNextLoopScheduledAction {
  return input;
}

function computeVerdict(input: {
  internalReady: number;
  providerGated: number;
  acceptedReceipts: number;
}): RestaurantNextLoopChannelPlan['verdict'] {
  if (input.acceptedReceipts <= 0) return 'manual-proof-first';
  if (input.internalReady >= 3) return 'ready-for-internal-shift';
  if (input.providerGated > 0) return 'provider-unlock-first';
  return 'manual-proof-first';
}

function buildLanes(input: {
  postRunReviewPack: RestaurantPostRunReviewPack;
  channelHub: RestaurantAgentChannelHub;
  storeManagerTaskQueue?: RestaurantStoreManagerTaskQueue;
}): RestaurantNextLoopChannelLane[] {
  const proofReady = input.postRunReviewPack.summary.acceptedReceipts > 0;
  const posReady = input.postRunReviewPack.summary.acceptedPosImports > 0;
  const staffChannelReady = input.channelHub.summary.providerReadyChannels > 0 || input.channelHub.summary.internalHandoffChannels > 0;
  const storeTasks = input.storeManagerTaskQueue?.summary.total || input.postRunReviewPack.summary.storeTasks;

  return [
    lane({
      id: 'service-prep',
      status: storeTasks > 0 ? 'internal-ready' : 'needs-evidence',
      owner: 'store-manager',
      title: 'Next shift service prep',
      source: 'store-manager queue + post-run SOP',
      evidenceRequired: ['confirmed offer', 'service window', 'staff owner', 'material checklist'],
      nextAction: storeTasks > 0
        ? 'Assign the highest-priority store task to the next service window.'
        : 'Create store-manager tasks from an accepted receipt or merchant-provided operating note.',
      stopLine: 'Do not push demand if capacity, price, inventory or queue handling is unknown.',
    }),
    lane({
      id: 'public-proof',
      status: proofReady ? 'internal-ready' : 'needs-evidence',
      owner: 'ops',
      title: 'Public proof and content loop',
      source: 'accepted public receipts',
      evidenceRequired: ['posted link or screenshot id', 'platform', 'operator', 'accepted receipt id'],
      nextAction: proofReady
        ? 'Reuse only the verified angle and prepare one controlled channel variation.'
        : 'Import a Dianping/Xiaohongshu/Douyin/WeChat proof link, screenshot id, or signed runtime receipt.',
      stopLine: 'No accepted proof means no performance claim and no repeated campaign claim.',
    }),
    lane({
      id: 'staff-notification',
      status: staffChannelReady ? 'internal-ready' : 'provider-gated',
      owner: 'runtime-admin',
      title: 'Staff notification and acknowledgement',
      source: 'AI employee channel hub',
      evidenceRequired: ['staff channel', 'message preview', 'delivery attempt id or manual handoff', 'staff acknowledgement'],
      nextAction: staffChannelReady
        ? 'Use the staff-only web handoff or configured staff channel for the next due job.'
        : 'Configure WeCom/Feishu/DingTalk/SMS provider and merchant-approved staff recipient roles.',
      stopLine: 'Staff channels cannot contact customers or contain phone numbers, WeChat IDs, private chats or secrets.',
    }),
    lane({
      id: 'community-followup',
      status: proofReady ? 'needs-evidence' : 'provider-gated',
      owner: 'community-ops',
      title: 'Community and private-domain follow-up',
      source: 'business signals + merchant approval',
      evidenceRequired: ['aggregate inquiry count', 'approved talk track', 'merchant authorization', 'follow-up owner'],
      nextAction: proofReady
        ? 'Draft owner-reviewed follow-up tasks from aggregate visit intent and coupon signals.'
        : 'Collect public proof and merchant-approved follow-up scope before any private-domain workflow.',
      stopLine: 'Do not read private messages, export contacts, DM customers or claim automatic acquisition here.',
    }),
    lane({
      id: 'pos-redemption',
      status: posReady ? 'internal-ready' : 'needs-evidence',
      owner: 'finance',
      title: 'POS and redemption aggregate',
      source: 'sanitized POS/coupon import',
      evidenceRequired: ['business date', 'offer name', 'claim count', 'redemption count', 'field dictionary'],
      nextAction: posReady
        ? 'Use sanitized aggregate rows to decide whether the next loop changes offer, window or inventory.'
        : 'Import sanitized POS/coupon aggregate rows before making redemption or operating-analysis claims.',
      stopLine: 'No raw order rows, payment ids, phone numbers, member ids, customer names or margin claims.',
    }),
    lane({
      id: 'provider-unlock',
      status: input.postRunReviewPack.summary.canClaimExternalAutomation ? 'internal-ready' : 'provider-gated',
      owner: 'runtime-admin',
      title: 'Provider unlock and resident runtime',
      source: 'provider gates + runtime health',
      evidenceRequired: ['runtime URL/key configured server-side', 'callback secret', 'isolated browser profile', 'merchant grant', 'provider receipt'],
      nextAction: input.postRunReviewPack.summary.canClaimExternalAutomation
        ? 'Attach provider receipt and merchant scope before describing the automation as live.'
        : 'Collect provider keys, callback secret, isolated browser profile, merchant authorizations and callback receipts.',
      stopLine: 'Never expose secrets, cookies, raw browser profiles or merchant private data in the client payload.',
    }),
  ];
}

function buildScheduledActions(input: {
  restaurant: string;
  offer: string;
  lanes: RestaurantNextLoopChannelLane[];
  channelHub: RestaurantAgentChannelHub;
  postRunReviewPack: RestaurantPostRunReviewPack;
  deliveryReport?: RestaurantAgentChannelDeliveryReport;
  scheduleRun?: RestaurantAgentChannelScheduleRun;
}): RestaurantNextLoopScheduledAction[] {
  const jobById = new Map(input.channelHub.scheduledJobs.map(job => [job.id, job]));
  const scheduleItems = (input.scheduleRun?.items || []).slice(0, 4).map(item => {
    const job = jobById.get(item.jobId);
    const laneId: RestaurantNextLoopChannelLaneId = item.jobId === 'night-closeout'
      ? 'pos-redemption'
      : item.jobId === 'dinner-publish-window'
        ? 'public-proof'
        : item.jobId === 'lunch-pulse'
          ? 'community-followup'
          : item.jobId === 'runtime-heartbeat'
            ? 'provider-unlock'
            : 'staff-notification';
    return action({
      id: `scheduled-${item.jobId}`,
      laneId,
      dueWindow: item.cadence,
      owner: laneId === 'community-followup' ? 'community-ops' : laneId === 'pos-redemption' ? 'finance' : laneId === 'provider-unlock' ? 'runtime-admin' : 'ops',
      channel: item.selectedChannel,
      action: job?.action || item.title,
      status: item.attempt?.status === 'blocked' || job?.status === 'provider-gated' ? 'provider-gated' : item.attempt?.status === 'manual-ready' ? 'manual-only' : 'ready-internal',
      evidenceRequired: job?.evidenceRequired || ['job evidence'],
      providerGate: item.attempt?.blockedReason || job?.externalRequired.join(' / ') || 'none',
      manualFallback: item.nextAction,
      nextAction: item.nextAction,
    });
  });

  const defaultActions: RestaurantNextLoopScheduledAction[] = [
    action({
      id: 'shift-prep-0930',
      laneId: 'service-prep',
      dueWindow: 'today 09:30 before lunch/dinner prep',
      owner: 'store-manager',
      channel: 'webchat',
      action: `Confirm ${input.offer} price, inventory, staff owner and service-window constraints for ${input.restaurant}.`,
      status: 'ready-internal',
      evidenceRequired: ['offer approval', 'service window', 'inventory/capacity note'],
      providerGate: 'none',
      manualFallback: 'Use the in-product store-manager queue.',
      nextAction: input.postRunReviewPack.storeManagerFollowup.tasks[0]?.action || 'Assign one store-manager task before the next service window.',
    }),
    action({
      id: 'proof-loop-1630',
      laneId: 'public-proof',
      dueWindow: 'today 16:30 publish/proof window',
      owner: 'ops',
      channel: 'Dianping / Xiaohongshu / Douyin / WeChat',
      action: 'Prepare the next controlled local-life content work order and proof checklist.',
      status: input.postRunReviewPack.summary.acceptedReceipts > 0 ? 'ready-internal' : 'manual-only',
      evidenceRequired: ['approved content', 'target platform', 'public proof receipt'],
      providerGate: input.postRunReviewPack.summary.canClaimExternalAutomation ? 'provider receipt required for automation claim' : 'browser/runtime provider not unlocked',
      manualFallback: 'Export copy, owner, platform and proof checklist for manual posting.',
      nextAction: input.postRunReviewPack.lanes.find(item => item.id === 'proof')?.nextAction || 'Collect proof first.',
    }),
    action({
      id: 'closeout-2230',
      laneId: 'pos-redemption',
      dueWindow: 'today 22:30 closeout',
      owner: 'finance',
      channel: 'manual POS aggregate',
      action: 'Import sanitized coupon/POS aggregate and decide the next loop variable.',
      status: input.postRunReviewPack.summary.acceptedPosImports > 0 ? 'ready-internal' : 'manual-only',
      evidenceRequired: ['aggregate POS/coupon rows', 'field dictionary', 'redemption window'],
      providerGate: 'POS provider or merchant export required for automated analysis.',
      manualFallback: 'Paste sanitized aggregate rows through the operating data contract.',
      nextAction: input.postRunReviewPack.lanes.find(item => item.id === 'operating-data')?.nextAction || 'Import aggregate data.',
    }),
    action({
      id: 'runtime-unlock',
      laneId: 'provider-unlock',
      dueWindow: 'before any external automation claim',
      owner: 'runtime-admin',
      channel: 'OpenClaw / Lobu / Hermes provider',
      action: 'Close the missing provider keys, callback, browser profile, merchant grants and receipt callback.',
      status: input.postRunReviewPack.summary.canClaimExternalAutomation ? 'ready-internal' : 'provider-gated',
      evidenceRequired: ['server-side runtime config', 'callback receipt', 'merchant grant', 'browser profile id'],
      providerGate: input.channelHub.externalRequired[0] || 'provider runtime and merchant grants required',
      manualFallback: 'Keep all external execution as manual handoff until the provider sandbox contract passes.',
      nextAction: input.postRunReviewPack.lanes.find(item => item.id === 'external-unlock')?.nextAction || 'Complete provider unlock.',
    }),
  ];

  return [...scheduleItems, ...defaultActions]
    .filter((item, index, list) => list.findIndex(candidate => candidate.id === item.id) === index)
    .slice(0, 8);
}

export function buildRestaurantNextLoopChannelPlan(input: RestaurantTrialIntake & {
  postRunReviewPack: RestaurantPostRunReviewPack;
  channelHub?: RestaurantAgentChannelHub;
  channelDeliveryReport?: RestaurantAgentChannelDeliveryReport;
  channelScheduleRun?: RestaurantAgentChannelScheduleRun;
  storeManagerTaskQueue?: RestaurantStoreManagerTaskQueue;
  now?: Date;
}): RestaurantNextLoopChannelPlan {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, input.postRunReviewPack.restaurant);
  const offer = clean(input.offer, input.postRunReviewPack.offer);
  const channelHub = input.channelHub || buildRestaurantAgentChannelHub({ restaurant, offer, now });
  const lanes = buildLanes({
    postRunReviewPack: input.postRunReviewPack,
    channelHub,
    storeManagerTaskQueue: input.storeManagerTaskQueue,
  });
  const scheduledActions = buildScheduledActions({
    restaurant,
    offer,
    lanes,
    channelHub,
    postRunReviewPack: input.postRunReviewPack,
    deliveryReport: input.channelDeliveryReport,
    scheduleRun: input.channelScheduleRun,
  });
  const internalReadyLanes = lanes.filter(item => item.status === 'internal-ready').length;
  const providerGatedLanes = lanes.filter(item => item.status === 'provider-gated').length;
  const verdict = computeVerdict({
    internalReady: internalReadyLanes,
    providerGated: providerGatedLanes,
    acceptedReceipts: input.postRunReviewPack.summary.acceptedReceipts,
  });
  const externalRequired = unique([
    ...input.postRunReviewPack.externalRequired,
    ...channelHub.externalRequired,
    ...(input.channelDeliveryReport?.externalRequired || []),
    ...(input.channelScheduleRun?.externalRequired || []),
    ...lanes.filter(item => item.status === 'provider-gated').map(item => item.nextAction),
    ...scheduledActions.filter(item => item.status === 'provider-gated').map(item => item.providerGate),
  ]).slice(0, 14);

  return {
    ok: true,
    payloadShape: 'restaurant-next-loop-channel-plan-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    verdict,
    summary: {
      lanes: lanes.length,
      internalReadyLanes,
      evidenceNeededLanes: lanes.filter(item => item.status === 'needs-evidence').length,
      providerGatedLanes,
      scheduledActions: scheduledActions.length,
      readyInternalActions: scheduledActions.filter(item => item.status === 'ready-internal').length,
      manualOnlyActions: scheduledActions.filter(item => item.status === 'manual-only').length,
      providerGatedActions: scheduledActions.filter(item => item.status === 'provider-gated').length,
      acceptedReceipts: input.postRunReviewPack.summary.acceptedReceipts,
      storeTasks: input.storeManagerTaskQueue?.summary.total || input.postRunReviewPack.summary.storeTasks,
      acceptedPosImports: input.postRunReviewPack.summary.acceptedPosImports,
      staffDeliveryAttempts: input.channelDeliveryReport?.summary.total || 0,
      canRunInternallyNow: internalReadyLanes >= 2 && scheduledActions.some(item => item.status !== 'provider-gated'),
      canClaimExternalAutomation: input.postRunReviewPack.summary.canClaimExternalAutomation,
      canClaimTrueOperatingAnalysis: input.postRunReviewPack.summary.canClaimTrueOperatingAnalysis,
    },
    lanes,
    scheduledActions,
    channelHub: {
      payloadShape: channelHub.payloadShape,
      summary: channelHub.summary,
      scheduledJobs: channelHub.scheduledJobs,
      externalRequired: channelHub.externalRequired,
      safetyBoundary: channelHub.safetyBoundary,
    },
    postRunReview: {
      payloadShape: input.postRunReviewPack.payloadShape,
      verdict: input.postRunReviewPack.verdict,
      summary: input.postRunReviewPack.summary,
      nextLoopSop: input.postRunReviewPack.nextLoopSop,
      externalRequired: input.postRunReviewPack.externalRequired,
      safetyBoundary: input.postRunReviewPack.safetyBoundary,
    },
    channelDeliveryReport: input.channelDeliveryReport ? {
      payloadShape: input.channelDeliveryReport.payloadShape,
      summary: input.channelDeliveryReport.summary,
      latest: input.channelDeliveryReport.latest,
      externalRequired: input.channelDeliveryReport.externalRequired,
      safetyBoundary: input.channelDeliveryReport.safetyBoundary,
    } : undefined,
    channelScheduleRun: input.channelScheduleRun ? {
      payloadShape: input.channelScheduleRun.payloadShape,
      summary: input.channelScheduleRun.summary,
      items: input.channelScheduleRun.items,
      recovery: input.channelScheduleRun.recovery,
      externalRequired: input.channelScheduleRun.externalRequired,
      safetyBoundary: input.channelScheduleRun.safetyBoundary,
    } : undefined,
    externalRequired,
    safetyBoundary: 'Next Loop Channel Plan converts accepted proof, store tasks, staff-channel schedules and sanitized operating aggregates into a daily restaurant operating plan. It does not publish, contact customers, auto-redeem coupons, read private messages, pull raw POS rows, expose secrets, or claim automated acquisition/true operating impact without provider receipts, merchant authorization and data contracts.',
  };
}

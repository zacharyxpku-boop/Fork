import { buildRestaurantBusinessSignals, type RestaurantBusinessSignalReport } from '@/lib/restaurant-agent-business-signals';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
import type { RestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantFirstRunControlTower, type RestaurantFirstRunControlTower } from '@/lib/restaurant-first-run-control-tower';
import { buildRestaurantOperatingDataContract, type RestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import { buildRestaurantOperatingInsightReport, type RestaurantOperatingInsightReport } from '@/lib/restaurant-operating-insight-report';
import type { RestaurantPosImportReport } from '@/lib/restaurant-pos-import-validator';
import { buildRestaurantStoreManagerFollowupPack, type RestaurantStoreManagerFollowupPack } from '@/lib/restaurant-store-manager-followup';
import type { RestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';
import type { RestaurantRuntimeTarget } from '@/lib/restaurant-agent-runtime-bridge';
import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import type { RestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';
import type { RestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantPostRunReviewLane = {
  id: 'proof' | 'store-followup' | 'operating-data' | 'next-campaign' | 'external-unlock';
  status: 'ready' | 'waiting' | 'blocked';
  owner: 'ops' | 'store-manager' | 'finance' | 'merchant' | 'runtime-admin';
  title: string;
  evidence: string[];
  decision: string;
  nextAction: string;
};

export type RestaurantPostRunReviewPack = {
  ok: true;
  payloadShape: 'restaurant-post-run-review-pack-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'ready-for-next-loop' | 'manual-review-ready' | 'needs-proof' | 'needs-operating-data';
  summary: {
    acceptedReceipts: number;
    rejectedReceipts: number;
    measuredInsights: number;
    directionalInsights: number;
    blockedInsights: number;
    storeTasks: number;
    todayTasks: number;
    acceptedPosImports: number;
    canClaimTrueOperatingAnalysis: boolean;
    canClaimExternalAutomation: boolean;
  };
  lanes: RestaurantPostRunReviewLane[];
  businessSignals: Pick<RestaurantBusinessSignalReport, 'summary' | 'items' | 'blockers' | 'nextActions' | 'safetyBoundary'>;
  storeManagerFollowup: Pick<RestaurantStoreManagerFollowupPack, 'payloadShape' | 'summary' | 'tasks' | 'managerBrief' | 'evidenceLedger' | 'safetyBoundary'>;
  operatingDataContract: Pick<RestaurantOperatingDataContract, 'payloadShape' | 'summary' | 'operatingQuestions' | 'providerSetupRequests' | 'safetyBoundary'>;
  operatingInsightReport: Pick<RestaurantOperatingInsightReport, 'payloadShape' | 'verdict' | 'summary' | 'insights' | 'storeManagerActions' | 'safetyBoundary'>;
  firstRunControlTower: Pick<RestaurantFirstRunControlTower, 'payloadShape' | 'verdict' | 'summary' | 'lanes' | 'safetyBoundary'>;
  nextLoopSop: Array<{
    step: string;
    owner: 'ops' | 'store-manager' | 'finance' | 'runtime-admin';
    input: string;
    output: string;
    stopLine: string;
  }>;
  externalRequired: string[];
  safetyBoundary: string;
};

function cleanText(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, 120) : fallback;
}

function lane(input: RestaurantPostRunReviewLane): RestaurantPostRunReviewLane {
  return input;
}

function computeVerdict(input: {
  acceptedReceipts: number;
  acceptedPosImports: number;
  canClaimTrueOperatingAnalysis: boolean;
}): RestaurantPostRunReviewPack['verdict'] {
  if (input.canClaimTrueOperatingAnalysis) return 'ready-for-next-loop';
  if (input.acceptedReceipts <= 0) return 'needs-proof';
  if (input.acceptedPosImports <= 0) return 'needs-operating-data';
  return 'manual-review-ready';
}

function buildLanes(input: {
  businessSignals: RestaurantBusinessSignalReport;
  storeManagerFollowup: RestaurantStoreManagerFollowupPack;
  operatingInsightReport: RestaurantOperatingInsightReport;
  operatingDataContract: RestaurantOperatingDataContract;
  firstRunControlTower: RestaurantFirstRunControlTower;
}): RestaurantPostRunReviewLane[] {
  const hasProof = input.businessSignals.summary.acceptedReceipts > 0;
  const hasStoreTasks = input.storeManagerFollowup.summary.tasks > 0 && input.storeManagerFollowup.summary.blocked === 0;
  const hasPos = input.operatingInsightReport.summary.acceptedPosImports > 0;
  return [
    lane({
      id: 'proof',
      status: hasProof ? 'ready' : 'blocked',
      owner: 'ops',
      title: 'Proof review',
      evidence: hasProof
        ? input.businessSignals.items.slice(0, 3).map(item => `${item.channel}:${item.receiptId}`)
        : ['no accepted public proof receipt'],
      decision: hasProof ? 'Use accepted receipts as the only source of post-run claims.' : 'Keep the run in draft/manual mode.',
      nextAction: hasProof ? 'Promote accepted proof into store follow-up and next content loop.' : 'Import public link, screenshot, or signed external receipt first.',
    }),
    lane({
      id: 'store-followup',
      status: hasStoreTasks ? 'ready' : input.storeManagerFollowup.summary.tasks ? 'waiting' : 'blocked',
      owner: 'store-manager',
      title: 'Store manager tasks',
      evidence: [`tasks:${input.storeManagerFollowup.summary.tasks}`, `today:${input.storeManagerFollowup.summary.today}`, `blocked:${input.storeManagerFollowup.summary.blocked}`],
      decision: hasStoreTasks ? 'Store can act on aggregate proof today.' : 'Follow-up is limited until proof or authorization improves.',
      nextAction: input.storeManagerFollowup.tasks[0]?.action || 'Build store follow-up tasks from accepted proof.',
    }),
    lane({
      id: 'operating-data',
      status: hasPos ? 'ready' : 'blocked',
      owner: 'finance',
      title: 'Operating data',
      evidence: [`acceptedPosImports:${input.operatingInsightReport.summary.acceptedPosImports}`, `blockedInsights:${input.operatingInsightReport.summary.blocked}`],
      decision: hasPos ? 'Use POS aggregate for directional operating review.' : 'Do not infer revenue, redemption or margin from engagement.',
      nextAction: hasPos ? 'Confirm redemption window, field dictionary and service capacity.' : 'Import sanitized POS/coupon aggregate rows.',
    }),
    lane({
      id: 'next-campaign',
      status: hasProof ? 'ready' : 'waiting',
      owner: 'ops',
      title: 'Next campaign loop',
      evidence: [`visitIntent:${input.businessSignals.summary.visitIntent}`, `couponClaims:${input.businessSignals.summary.couponClaims}`, `redemptions:${input.businessSignals.summary.redemptions}`],
      decision: hasProof ? 'Prepare the next controlled loop from actual proof and store capacity.' : 'Wait for proof before repeating the offer.',
      nextAction: hasProof ? 'Reuse only the verified angle, then change one variable: offer, channel, service window or audience.' : 'Run a controlled trial and collect proof first.',
    }),
    lane({
      id: 'external-unlock',
      status: input.firstRunControlTower.summary.canClaimAutomation ? 'ready' : 'blocked',
      owner: 'merchant',
      title: 'External automation unlock',
      evidence: [
        `canForward:${input.firstRunControlTower.summary.canForwardFirstRun}`,
        `canClaimAutomation:${input.firstRunControlTower.summary.canClaimAutomation}`,
        `providerGated:${input.operatingDataContract.summary.providerGated}`,
      ],
      decision: input.firstRunControlTower.summary.canClaimAutomation
        ? 'External automation can be described only for the proven sandbox scope.'
        : 'Keep automation copy in preflight/setup mode.',
      nextAction: input.firstRunControlTower.summary.canClaimAutomation
        ? 'Attach provider receipts and merchant/data scope to any automation claim.'
        : 'Collect provider keys, callback secret, browser profile, merchant auth and POS/data contracts.',
    }),
  ];
}

export function buildRestaurantPostRunReviewPack(input: RestaurantTrialIntake & {
  queue: RestaurantStoreManagerTaskQueue;
  runs: RestaurantAgentRunRecord[];
  receipts?: RestaurantAgentReceiptRecord[];
  posImports?: RestaurantPosImportReport[];
  readiness?: RestaurantExternalReadiness;
  target?: RestaurantRuntimeTarget;
  env?: Record<string, string | undefined>;
  runtimeProbe?: RestaurantRuntimeProbe;
  providerReadinessHealth?: RestaurantProviderReadinessHealth;
  providerReceiptInbox?: RestaurantProviderReceiptInbox;
  now?: Date;
}): RestaurantPostRunReviewPack {
  const now = input.now || new Date();
  const restaurant = cleanText(input.restaurant, 'Trial restaurant');
  const offer = cleanText(input.offer, 'Today offer');
  const receipts = input.receipts || [];
  const posImports = input.posImports || [];
  const readiness = input.readiness;
  const businessSignals = buildRestaurantBusinessSignals(input.runs, receipts, now);
  const operatingDataContract = buildRestaurantOperatingDataContract({
    receipts,
    posImports,
    readiness,
    now,
  });
  const operatingInsightReport = buildRestaurantOperatingInsightReport({
    posImports,
    operatingDataContract,
    businessSignals,
    now,
  });
  const storeManagerFollowup = buildRestaurantStoreManagerFollowupPack({
    restaurant,
    offer,
    runs: input.runs,
    receipts,
    now,
  });
  const firstRunControlTower = buildRestaurantFirstRunControlTower({
    queue: input.queue,
    runs: input.runs,
    receipts,
    readiness,
    target: input.target,
    env: input.env,
    runtimeProbe: input.runtimeProbe,
    providerReadinessHealth: input.providerReadinessHealth,
    providerReceiptInbox: input.providerReceiptInbox,
    now,
  });
  const lanes = buildLanes({
    businessSignals,
    storeManagerFollowup,
    operatingInsightReport,
    operatingDataContract,
    firstRunControlTower,
  });
  const canClaimTrueOperatingAnalysis = operatingInsightReport.summary.canClaimTrueOperatingAnalysis;
  const verdict = computeVerdict({
    acceptedReceipts: businessSignals.summary.acceptedReceipts,
    acceptedPosImports: operatingInsightReport.summary.acceptedPosImports,
    canClaimTrueOperatingAnalysis,
  });

  return {
    ok: true,
    payloadShape: 'restaurant-post-run-review-pack-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    verdict,
    summary: {
      acceptedReceipts: businessSignals.summary.acceptedReceipts,
      rejectedReceipts: businessSignals.summary.rejectedReceipts,
      measuredInsights: operatingInsightReport.summary.measured,
      directionalInsights: operatingInsightReport.summary.directional,
      blockedInsights: operatingInsightReport.summary.blocked,
      storeTasks: storeManagerFollowup.summary.tasks,
      todayTasks: storeManagerFollowup.summary.today,
      acceptedPosImports: operatingInsightReport.summary.acceptedPosImports,
      canClaimTrueOperatingAnalysis,
      canClaimExternalAutomation: firstRunControlTower.summary.canClaimAutomation,
    },
    lanes,
    businessSignals: {
      summary: businessSignals.summary,
      items: businessSignals.items.slice(0, 8),
      blockers: businessSignals.blockers,
      nextActions: businessSignals.nextActions,
      safetyBoundary: businessSignals.safetyBoundary,
    },
    storeManagerFollowup: {
      payloadShape: storeManagerFollowup.payloadShape,
      summary: storeManagerFollowup.summary,
      tasks: storeManagerFollowup.tasks.slice(0, 8),
      managerBrief: storeManagerFollowup.managerBrief,
      evidenceLedger: storeManagerFollowup.evidenceLedger,
      safetyBoundary: storeManagerFollowup.safetyBoundary,
    },
    operatingDataContract: {
      payloadShape: operatingDataContract.payloadShape,
      summary: operatingDataContract.summary,
      operatingQuestions: operatingDataContract.operatingQuestions,
      providerSetupRequests: operatingDataContract.providerSetupRequests,
      safetyBoundary: operatingDataContract.safetyBoundary,
    },
    operatingInsightReport: {
      payloadShape: operatingInsightReport.payloadShape,
      verdict: operatingInsightReport.verdict,
      summary: operatingInsightReport.summary,
      insights: operatingInsightReport.insights,
      storeManagerActions: operatingInsightReport.storeManagerActions,
      safetyBoundary: operatingInsightReport.safetyBoundary,
    },
    firstRunControlTower: {
      payloadShape: firstRunControlTower.payloadShape,
      verdict: firstRunControlTower.verdict,
      summary: firstRunControlTower.summary,
      lanes: firstRunControlTower.lanes,
      safetyBoundary: firstRunControlTower.safetyBoundary,
    },
    nextLoopSop: [
      {
        step: 'Lock proof',
        owner: 'ops',
        input: 'Accepted public receipt, screenshot id, or signed externalRunId',
        output: 'One approved proof source for the next loop',
        stopLine: 'No accepted proof means no performance claim.',
      },
      {
        step: 'Confirm store capacity',
        owner: 'store-manager',
        input: 'Store follow-up tasks, service window and prep capacity',
        output: 'Go/no-go for repeating or adjusting the offer',
        stopLine: 'Do not increase demand if staffing, inventory or queue handling is unknown.',
      },
      {
        step: 'Attach operating aggregate',
        owner: 'finance',
        input: 'Sanitized POS/coupon aggregate and field dictionary',
        output: 'Directional operating review or true-analysis readiness',
        stopLine: 'No raw orders, payment ids, customer identities or private chat content.',
      },
      {
        step: 'Prepare next controlled loop',
        owner: 'ops',
        input: 'Proof, store capacity and one changed variable',
        output: 'Next content/follow-up work order',
        stopLine: 'Change one variable at a time; do not claim automatic acquisition without provider evidence.',
      },
      {
        step: 'Update provider gate',
        owner: 'runtime-admin',
        input: 'Provider keys, callback, browser profile, merchant grant and data contracts',
        output: 'External unlock request or sandbox-ready claim',
        stopLine: 'Never expose secrets or merchant private data in the UI.',
      },
    ],
    externalRequired: Array.from(new Set([
      ...businessSignals.blockers,
      ...operatingInsightReport.externalRequired,
      ...storeManagerFollowup.externalRequired,
      ...firstRunControlTower.externalRequired,
      ...lanes.filter(item => item.status === 'blocked').map(item => item.nextAction),
    ])).slice(0, 12),
    safetyBoundary: 'Post Run Review Pack turns accepted receipts, sanitized aggregates and owner tasks into a next-loop SOP. It does not invent growth numbers, contact customers, publish content, redeem coupons, read private messages, expose secrets, store raw POS rows, or claim true operating impact without merchant-authorized data.',
  };
}

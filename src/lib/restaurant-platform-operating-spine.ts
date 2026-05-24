import { buildRestaurantAgentOpsConsole } from '@/lib/restaurant-agent-ops-console';
import { buildRestaurantBusinessSignals } from '@/lib/restaurant-agent-business-signals';
import type { RestaurantBrowserSessionRecord } from '@/lib/restaurant-agent-browser-session-store';
import { buildRestaurantBenchmarkStrategy } from '@/lib/restaurant-benchmark-strategy';
import { buildRestaurantClawTrainingBatch } from '@/lib/restaurant-claw-skill-catalog';
import { buildRestaurantExternalReadiness, type RestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantAgentRecoveryPlan } from '@/lib/restaurant-agent-recovery';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';

export type RestaurantPlatformSpineStage =
  | 'strategy'
  | 'training'
  | 'content-task'
  | 'execution'
  | 'receipt'
  | 'business-signal'
  | 'recovery'
  | 'external-gate';

export type RestaurantPlatformSpineTimelineItem = {
  stage: RestaurantPlatformSpineStage;
  status: 'ready' | 'waiting' | 'blocked' | 'accepted' | 'training';
  owner: 'strategy' | 'marketing' | 'ops' | 'store-manager' | 'runtime-admin' | 'merchant' | 'data-ops';
  title: string;
  detail: string;
  evidence: string;
  nextAction: string;
};

export type RestaurantPlatformOperatingSpine = {
  ok: true;
  payloadShape: 'restaurant-platform-operating-spine';
  generatedAt: string;
  productSpine: 'kuaizi-platform-spine-plus-claw-agent-layer';
  summary: {
    strategyReady: boolean;
    internalTrainingTasks: number;
    providerUnlockTasks: number;
    runs: number;
    acceptedReceipts: number;
    businessSignals: number;
    recoveryActions: number;
    blockedExternalGroups: number;
    platformReadiness: 'internal-operable' | 'external-gated';
  };
  timeline: RestaurantPlatformSpineTimelineItem[];
  externalGates: Array<{
    id: string;
    name: string;
    missing: string[];
    unlocks: string;
    nextAction: string;
  }>;
  nextPlatformActions: Array<{
    owner: RestaurantPlatformSpineTimelineItem['owner'];
    action: string;
    acceptance: string;
  }>;
  auditBoundary: {
    canDoInternallyNow: string[];
    mustHaveExternalBeforeClaiming: string[];
  };
  safetyBoundary: string;
};

function latestReceiptFor(run: RestaurantAgentRunRecord, receipts: RestaurantAgentReceiptRecord[]): RestaurantAgentReceiptRecord | undefined {
  return receipts
    .filter(receipt => receipt.eventId === run.eventId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
}

function runTimeline(runs: RestaurantAgentRunRecord[], receipts: RestaurantAgentReceiptRecord[]): RestaurantPlatformSpineTimelineItem[] {
  return runs.slice(0, 4).map(run => {
    const receipt = latestReceiptFor(run, receipts);
    if (receipt?.status === 'accepted') {
      return {
        stage: 'receipt',
        status: 'accepted',
        owner: 'ops',
        title: `${run.restaurant} / ${run.offer}`,
        detail: `${receipt.channel} receipt accepted with evidence score ${receipt.evidenceScore}.`,
        evidence: receipt.evidenceUrl || receipt.screenshotId || receipt.externalRunId || receipt.receiptId,
        nextAction: 'Feed the accepted proof into business signal review and store-manager follow-up.',
      };
    }

    if (run.status === 'forwarded') {
      return {
        stage: 'execution',
        status: 'waiting',
        owner: 'runtime-admin',
        title: `${run.target} execution waiting for receipt`,
        detail: run.nextAction,
        evidence: run.evidenceRequired,
        nextAction: 'Wait for signed external receipt, screenshot, public link, or failure reason.',
      };
    }

    if (run.status === 'blocked' || run.status === 'failed') {
      return {
        stage: 'recovery',
        status: 'blocked',
        owner: 'runtime-admin',
        title: `${run.target} execution blocked`,
        detail: run.nextAction,
        evidence: run.evidenceRequired,
        nextAction: 'Fix runtime, callback, merchant grant, browser profile, or move to manual handoff.',
      };
    }

    return {
      stage: 'content-task',
      status: 'waiting',
      owner: 'ops',
      title: `${run.taskId} queued locally`,
      detail: `${run.restaurant} / ${run.offer}`,
      evidence: run.evidenceRequired,
      nextAction: 'Attach public proof manually or generate a governed execution package after external gates are ready.',
    };
  });
}

function externalGateRows(readiness: RestaurantExternalReadiness): RestaurantPlatformOperatingSpine['externalGates'] {
  return readiness.groups
    .filter(group => group.status === 'blocked')
    .map(group => ({
      id: group.id,
      name: group.name,
      missing: group.requirements.filter(requirement => !requirement.configured).map(requirement => requirement.label),
      unlocks: group.purpose,
      nextAction: group.nextAction,
    }));
}

export function buildRestaurantPlatformOperatingSpine(input: {
  runs: RestaurantAgentRunRecord[];
  receipts: RestaurantAgentReceiptRecord[];
  readiness?: RestaurantExternalReadiness;
  browserSessions?: RestaurantBrowserSessionRecord[];
  now?: Date;
}): RestaurantPlatformOperatingSpine {
  const now = input.now || new Date();
  const readiness = input.readiness || buildRestaurantExternalReadiness();
  const benchmark = buildRestaurantBenchmarkStrategy();
  const trainingBatch = buildRestaurantClawTrainingBatch({ internalLimit: 8, providerLimit: 6 });
  const businessSignals = buildRestaurantBusinessSignals(input.runs, input.receipts, now);
  const recovery = buildRestaurantAgentRecoveryPlan(input.runs, input.receipts, readiness, now);
  const opsConsole = buildRestaurantAgentOpsConsole({
    runs: input.runs,
    receipts: input.receipts,
    readiness,
    browserSessions: input.browserSessions,
    now,
  });
  const gates = externalGateRows(readiness);
  const platformReadiness = gates.length ? 'external-gated' : 'internal-operable';

  const timeline: RestaurantPlatformSpineTimelineItem[] = [
    {
      stage: 'strategy' as const,
      status: 'ready' as const,
      owner: 'strategy' as const,
      title: 'Product spine selected',
      detail: benchmark.recommendation,
      evidence: benchmark.payloadShape,
      nextAction: benchmark.nextBuildOrder[0]?.internalNow || 'Keep the platform ledger as the product control layer.',
    },
    {
      stage: 'training' as const,
      status: trainingBatch.summary.internalTrainingTasks ? 'training' as const : 'ready' as const,
      owner: 'marketing' as const,
      title: 'Claw capability training batch',
      detail: `${trainingBatch.summary.internalTrainingTasks} internal tasks, ${trainingBatch.summary.providerUnlockTasks} provider unlock tasks.`,
      evidence: trainingBatch.payloadShape,
      nextAction: trainingBatch.internalTrainingTasks[0]?.evidenceRequired || 'Keep capability evidence current.',
    },
    ...runTimeline(input.runs, input.receipts),
    ...businessSignals.items.slice(0, 2).map(item => ({
      stage: 'business-signal' as const,
      status: 'accepted' as const,
      owner: 'store-manager' as const,
      title: `${item.signalType}: ${item.restaurant}`,
      detail: item.nextAction,
      evidence: `${item.channel}; evidence score ${item.evidenceScore}`,
      nextAction: 'Assign the next store action without storing private customer messages or raw POS rows.',
    })),
    ...gates.slice(0, 3).map(gate => ({
      stage: 'external-gate' as const,
      status: 'blocked' as const,
      owner: gate.id === 'pos-redemption-data' ? 'data-ops' as const : 'merchant' as const,
      title: gate.name,
      detail: gate.missing.join(' / ') || 'external setup missing',
      evidence: gate.id,
      nextAction: gate.nextAction,
    })),
  ].slice(0, 12);

  return {
    ok: true,
    payloadShape: 'restaurant-platform-operating-spine',
    generatedAt: now.toISOString(),
    productSpine: 'kuaizi-platform-spine-plus-claw-agent-layer',
    summary: {
      strategyReady: true,
      internalTrainingTasks: trainingBatch.summary.internalTrainingTasks,
      providerUnlockTasks: trainingBatch.summary.providerUnlockTasks,
      runs: input.runs.length,
      acceptedReceipts: input.receipts.filter(receipt => receipt.status === 'accepted').length,
      businessSignals: businessSignals.items.length,
      recoveryActions: recovery.actions.length,
      blockedExternalGroups: readiness.summary.blocked,
      platformReadiness,
    },
    timeline,
    externalGates: gates,
    nextPlatformActions: [
      {
        owner: 'ops',
        action: opsConsole.timeline.length
          ? 'Review the platform timeline and close the oldest waiting receipt or recovery action.'
          : 'Create the first local restaurant content/execution task and attach a public proof requirement.',
        acceptance: 'A run exists with owner, evidence requirement, next action, and no fake external execution claim.',
      },
      {
        owner: 'marketing',
        action: 'Complete the first Claw internal training batch for restaurant scenario, offer, channel, and follow-up wording.',
        acceptance: 'Training records reference non-sensitive public materials and a reviewer/owner.',
      },
      {
        owner: 'runtime-admin',
        action: 'Connect OpenClaw/Hermes or Lobu only after URL, server key, browser profile, callback secret, and tenant policy are configured.',
        acceptance: 'Runtime probe is ready and signed callback receipts can be accepted without exposing secrets.',
      },
      {
        owner: 'data-ops',
        action: 'Import sanitized POS/redemption CSV or field dictionary before claiming real operating analysis.',
        acceptance: 'Aggregated coupon, redemption, revenue, order, inventory, and margin fields are mapped without raw customer identifiers.',
      },
    ],
    auditBoundary: {
      canDoInternallyNow: [
        'restaurant intake, offer brief, local content task queue, evidence ledger, owner/next-action workflow',
        'Claw-style capability catalog, internal training batch, governed browser runbook/package generation',
        'manual public proof import, signed receipt validation, run health, recovery queue, aggregated business signals',
      ],
      mustHaveExternalBeforeClaiming: [
        'automatic publishing or platform operations need merchant OAuth/account authorization and governed browser/runtime setup',
        'automatic acquisition or private-message handling needs platform API/grant plus privacy-safe aggregation rules',
        'automatic redemption and real operating analysis need POS/redemption/member/inventory/finance data contract or API',
      ],
    },
    safetyBoundary: 'Platform spine is an operating control layer. It can coordinate tasks, training, receipts, recovery, and aggregated signals; it must not claim auto-publish, auto-acquisition, auto-redemption, private-message access, or real POS analytics until the matching external provider, merchant authorization, callback, and data contract are configured.',
  };
}

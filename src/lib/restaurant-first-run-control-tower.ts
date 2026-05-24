import { buildRestaurantAgentRecoveryPlan, type RestaurantAgentRecoveryPlan } from '@/lib/restaurant-agent-recovery';
import { buildRestaurantRunHealth, type RestaurantRunHealth } from '@/lib/restaurant-agent-run-health';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
import type { RestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantFirstForwardableRunPack, type RestaurantFirstForwardableRunPack } from '@/lib/restaurant-first-forwardable-run-pack';
import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import { buildRestaurantProviderReceiptInbox, type RestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';
import type { RestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';
import type { RestaurantRuntimeTarget } from '@/lib/restaurant-agent-runtime-bridge';
import type { RestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';

export type RestaurantFirstRunControlTowerLane = {
  id: 'candidate' | 'dispatch' | 'receipt' | 'recovery' | 'claim';
  label: string;
  status: 'ready' | 'waiting' | 'blocked' | 'done';
  owner: 'ops' | 'runtime-admin' | 'merchant' | 'store-manager';
  evidence: string[];
  nextAction: string;
};

export type RestaurantFirstRunControlTower = {
  ok: true;
  payloadShape: 'restaurant-first-run-control-tower-v1';
  generatedAt: string;
  target: RestaurantRuntimeTarget;
  verdict: 'can-forward-first-run' | 'waiting-receipt' | 'manual-fallback' | 'needs-setup' | 'post-run-review';
  summary: {
    candidateTasks: number;
    forwardablePackages: number;
    totalRuns: number;
    waitingReceipts: number;
    acceptedReceipts: number;
    recoveryActions: number;
    blockedLanes: number;
    canForwardFirstRun: boolean;
    canClaimAutomation: boolean;
  };
  lanes: RestaurantFirstRunControlTowerLane[];
  firstForwardableRunPack: Pick<RestaurantFirstForwardableRunPack, 'payloadShape' | 'verdict' | 'summary' | 'selectedPackage' | 'stages' | 'externalRequired' | 'safetyBoundary'>;
  runHealth: Pick<RestaurantRunHealth, 'summary' | 'operatorQueue' | 'safetyBoundary'>;
  providerReceiptInbox: Pick<RestaurantProviderReceiptInbox, 'payloadShape' | 'summary' | 'requests' | 'externalRequired' | 'safetyBoundary'>;
  recovery: Pick<RestaurantAgentRecoveryPlan, 'inspectedRuns' | 'acceptedReceipts' | 'actions' | 'retryPolicy' | 'blockedExternal'>;
  operatorScript: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

function lane(input: RestaurantFirstRunControlTowerLane): RestaurantFirstRunControlTowerLane {
  return input;
}

function latestRun(runs: RestaurantAgentRunRecord[]): RestaurantAgentRunRecord | undefined {
  return runs.slice().sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
}

function computeVerdict(input: {
  firstRun: RestaurantFirstForwardableRunPack;
  runHealth: RestaurantRunHealth;
  recovery: RestaurantAgentRecoveryPlan;
}): RestaurantFirstRunControlTower['verdict'] {
  if (input.runHealth.summary.accepted > 0) return 'post-run-review';
  if (input.runHealth.summary.waitingReceipt > 0) return 'waiting-receipt';
  if (input.firstRun.summary.canForwardFirstRun) return 'can-forward-first-run';
  if (input.recovery.actions.some(action => action.action === 'manual-fallback' || action.action === 'start-local-run')) return 'manual-fallback';
  return 'needs-setup';
}

function buildLanes(input: {
  firstRun: RestaurantFirstForwardableRunPack;
  runHealth: RestaurantRunHealth;
  receiptInbox: RestaurantProviderReceiptInbox;
  recovery: RestaurantAgentRecoveryPlan;
  latest?: RestaurantAgentRunRecord;
}): RestaurantFirstRunControlTowerLane[] {
  const selectedPackage = input.firstRun.selectedPackage;
  const firstReceiptRequest = input.receiptInbox.requests[0];
  const firstRecoveryAction = input.recovery.actions[0];
  return [
    lane({
      id: 'candidate',
      label: 'Task candidate',
      status: input.firstRun.summary.canForwardFirstRun ? 'ready' : input.firstRun.summary.readyTasks ? 'waiting' : 'blocked',
      owner: 'ops',
      evidence: [
        `readyTasks:${input.firstRun.summary.readyTasks}`,
        `forwardable:${input.firstRun.summary.forwardable}`,
        selectedPackage ? `package:${selectedPackage.packageId}` : 'no-package-selected',
      ],
      nextAction: selectedPackage?.canForward
        ? 'Use the selected sanitized package for the first provider run.'
        : selectedPackage?.blockedReasons[0] || 'Mark one evidence-reviewed task as ready-for-provider.',
    }),
    lane({
      id: 'dispatch',
      label: 'Provider dispatch',
      status: input.latest?.status === 'forwarded'
        ? 'done'
        : input.firstRun.summary.canForwardFirstRun
          ? 'ready'
          : input.latest?.status === 'blocked' || input.latest?.status === 'failed'
            ? 'blocked'
            : 'waiting',
      owner: 'runtime-admin',
      evidence: input.latest
        ? [`run:${input.latest.eventId}`, `target:${input.latest.target}`, `status:${input.latest.status}`]
        : [`target:${input.firstRun.target}`, `handoffOnly:${input.firstRun.summary.handoffOnly}`],
      nextAction: input.latest?.status === 'forwarded'
        ? 'Wait for signed external-receipt callback or import public proof.'
        : input.firstRun.summary.canForwardFirstRun
          ? 'Forward one package through the runtime bridge with provider retry limits.'
          : 'Do not call a provider until runtime, callback, profile and merchant gates are ready.',
    }),
    lane({
      id: 'receipt',
      label: 'Proof receipt',
      status: input.receiptInbox.summary.accepted
        ? 'done'
        : input.receiptInbox.summary.waitingReceipt
          ? 'waiting'
          : input.receiptInbox.summary.actionRequired
            ? 'blocked'
            : 'waiting',
      owner: 'ops',
      evidence: firstReceiptRequest
        ? [`request:${firstReceiptRequest.requestId}`, `status:${firstReceiptRequest.status}`, `event:${firstReceiptRequest.eventId}`]
        : ['no-receipt-request-yet'],
      nextAction: firstReceiptRequest?.nextAction || 'Create a run first, then require public proof or a signed callback.',
    }),
    lane({
      id: 'recovery',
      label: 'Recovery owner',
      status: firstRecoveryAction?.priority === 'critical' || firstRecoveryAction?.priority === 'high' ? 'blocked' : 'waiting',
      owner: firstRecoveryAction?.action === 'configure-runtime' ? 'runtime-admin' : 'store-manager',
      evidence: firstRecoveryAction
        ? [`action:${firstRecoveryAction.action}`, `priority:${firstRecoveryAction.priority}`, `event:${firstRecoveryAction.eventId}`]
        : ['no-recovery-action'],
      nextAction: firstRecoveryAction?.nextStep || 'No recovery action yet.',
    }),
    lane({
      id: 'claim',
      label: 'Automation claim',
      status: input.firstRun.summary.canClaimAutomation ? 'ready' : 'blocked',
      owner: 'merchant',
      evidence: [
        `canForward:${input.firstRun.summary.canForwardFirstRun}`,
        `canClaimAutomation:${input.firstRun.summary.canClaimAutomation}`,
        `acceptedReceipts:${input.runHealth.summary.accepted}`,
      ],
      nextAction: input.firstRun.summary.canClaimAutomation
        ? 'Automation can be described as configured for the proven sandbox scope only.'
        : 'Keep customer-facing copy in preflight/manual-proof mode until provider, receipt and merchant data gates are proven.',
    }),
  ];
}

export function buildRestaurantFirstRunControlTower(input: {
  queue: RestaurantStoreManagerTaskQueue;
  runs: RestaurantAgentRunRecord[];
  receipts?: RestaurantAgentReceiptRecord[];
  readiness?: RestaurantExternalReadiness;
  target?: RestaurantRuntimeTarget;
  env?: Record<string, string | undefined>;
  runtimeProbe?: RestaurantRuntimeProbe;
  providerReadinessHealth?: RestaurantProviderReadinessHealth;
  providerReceiptInbox?: RestaurantProviderReceiptInbox;
  now?: Date;
}): RestaurantFirstRunControlTower {
  const now = input.now || new Date();
  const target = input.target || 'openclaw';
  const receipts = input.receipts || [];
  const providerReceiptInbox = input.providerReceiptInbox || buildRestaurantProviderReceiptInbox({
    runs: input.runs,
    receipts,
    readiness: input.readiness,
    now,
  });
  const firstForwardableRunPack = buildRestaurantFirstForwardableRunPack({
    queue: input.queue,
    target,
    env: input.env,
    runtimeProbe: input.runtimeProbe,
    providerReadinessHealth: input.providerReadinessHealth,
    providerReceiptInbox,
    now,
  });
  const runHealth = buildRestaurantRunHealth(input.runs, receipts, input.readiness, now);
  const recovery = buildRestaurantAgentRecoveryPlan(input.runs, receipts, input.readiness, now);
  const latest = latestRun(input.runs);
  const lanes = buildLanes({
    firstRun: firstForwardableRunPack,
    runHealth,
    receiptInbox: providerReceiptInbox,
    recovery,
    latest,
  });
  const blockedLanes = lanes.filter(item => item.status === 'blocked').length;

  return {
    ok: true,
    payloadShape: 'restaurant-first-run-control-tower-v1',
    generatedAt: now.toISOString(),
    target,
    verdict: computeVerdict({ firstRun: firstForwardableRunPack, runHealth, recovery }),
    summary: {
      candidateTasks: firstForwardableRunPack.summary.readyTasks,
      forwardablePackages: firstForwardableRunPack.summary.forwardable,
      totalRuns: runHealth.summary.totalRuns,
      waitingReceipts: runHealth.summary.waitingReceipt,
      acceptedReceipts: runHealth.summary.accepted,
      recoveryActions: recovery.actions.length,
      blockedLanes,
      canForwardFirstRun: firstForwardableRunPack.summary.canForwardFirstRun,
      canClaimAutomation: firstForwardableRunPack.summary.canClaimAutomation,
    },
    lanes,
    firstForwardableRunPack: {
      payloadShape: firstForwardableRunPack.payloadShape,
      verdict: firstForwardableRunPack.verdict,
      summary: firstForwardableRunPack.summary,
      selectedPackage: firstForwardableRunPack.selectedPackage,
      stages: firstForwardableRunPack.stages,
      externalRequired: firstForwardableRunPack.externalRequired,
      safetyBoundary: firstForwardableRunPack.safetyBoundary,
    },
    runHealth: {
      summary: runHealth.summary,
      operatorQueue: runHealth.operatorQueue,
      safetyBoundary: runHealth.safetyBoundary,
    },
    providerReceiptInbox: {
      payloadShape: providerReceiptInbox.payloadShape,
      summary: providerReceiptInbox.summary,
      requests: providerReceiptInbox.requests.slice(0, 6),
      externalRequired: providerReceiptInbox.externalRequired,
      safetyBoundary: providerReceiptInbox.safetyBoundary,
    },
    recovery: {
      inspectedRuns: recovery.inspectedRuns,
      acceptedReceipts: recovery.acceptedReceipts,
      actions: recovery.actions.slice(0, 6),
      retryPolicy: recovery.retryPolicy,
      blockedExternal: recovery.blockedExternal,
    },
    operatorScript: [
      'Pick one ready-for-provider task only after evidence review.',
      'Forward one sanitized package or keep manual proof mode when gates are blocked.',
      'Accept only public proof or signed external-receipt callbacks.',
      'Run recovery before retrying; stop on auth, captcha, private data, or callback signature mismatch.',
      'Do not claim auto-publish, auto-acquisition, auto-redemption or operating analytics until this tower shows receipts and merchant/data gates.',
    ],
    externalRequired: Array.from(new Set([
      ...firstForwardableRunPack.externalRequired,
      ...providerReceiptInbox.externalRequired,
      ...recovery.blockedExternal,
      ...lanes.filter(item => item.status === 'blocked').map(item => item.nextAction),
    ])).slice(0, 12),
    safetyBoundary: 'First Run Control Tower is an operator control surface. It does not log in, publish, contact customers, redeem coupons, pull raw POS rows, expose secrets, close tasks, or upgrade claims without public proof, signed receipts and merchant/data authorization.',
  };
}

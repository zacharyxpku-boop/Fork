import type { RestaurantAgentCommandCenter } from '@/lib/restaurant-agent-command-center';
import type { RestaurantAgentRecoveryPlan } from '@/lib/restaurant-agent-recovery';
import type { RestaurantCapabilityTrainingPlan, RestaurantCapabilityTrainingRecord } from '@/lib/restaurant-capability-training';
import type { RestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';
import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import type { RestaurantProviderSandboxContract } from '@/lib/restaurant-provider-sandbox-contract';
import type { RestaurantShiftAutopilotRunRecord } from '@/lib/restaurant-shift-autopilot-run-store';
import type { RestaurantShiftCapabilityActivationPack } from '@/lib/restaurant-shift-capability-activation-pack';
import type { RestaurantShiftCloseoutTrainingPack } from '@/lib/restaurant-shift-closeout-training-pack';
import type { RestaurantShiftFirstForwardableRun } from '@/lib/restaurant-shift-first-forwardable-run';
import type { RestaurantShiftProviderHandoff } from '@/lib/restaurant-shift-provider-handoff';
import type { RestaurantShiftSandboxAcceptance } from '@/lib/restaurant-shift-sandbox-acceptance';
import type { RestaurantShiftSandboxForwardAttempt } from '@/lib/restaurant-shift-sandbox-forward';
import type { RestaurantTaskProviderHandoff } from '@/lib/restaurant-task-provider-handoff';

export type RestaurantShiftOperatingLoopStage = {
  id:
    | 'command-center'
    | 'shift-run'
    | 'provider-handoff'
    | 'sandbox-acceptance'
    | 'forwardable-package'
    | 'sandbox-forward'
    | 'receipt-inbox'
    | 'closeout-training'
    | 'capability-activation';
  title: string;
  status: 'ready' | 'running' | 'waiting-provider' | 'waiting-proof' | 'needs-action' | 'blocked';
  owner: 'ops' | 'runtime-admin' | 'store-manager' | 'merchant' | 'data-ops';
  customerVisible: string;
  evidence: string[];
  primaryAction: string;
};

export type RestaurantShiftOperatingLoopPack = {
  ok: true;
  payloadShape: 'restaurant-shift-operating-loop-pack-v1';
  generatedAt: string;
  verdict: 'ready-to-run-internal' | 'ready-for-sandbox-submit' | 'waiting-provider' | 'waiting-proof' | 'needs-closeout-training';
  summary: {
    stages: number;
    ready: number;
    waitingProvider: number;
    waitingProof: number;
    blocked: number;
    shiftRuns: number;
    providerRequests: number;
    receiptRequests: number;
    acceptedTrainingRecords: number;
    activatedInternal: number;
    canSubmitSandbox: boolean;
    canClaimExternalAutomation: false;
  };
  stages: RestaurantShiftOperatingLoopStage[];
  nextBestAction: {
    label: string;
    action:
      | 'run-shift-autopilot'
      | 'build-provider-handoff'
      | 'check-sandbox-acceptance'
      | 'build-first-forwardable-run'
      | 'submit-shift-sandbox-run'
      | 'collect-provider-receipt'
      | 'closeout-train'
      | 'record-training'
      | 'activation-pack';
    reason: string;
    owner: RestaurantShiftOperatingLoopStage['owner'];
  };
  commandCenter: Pick<RestaurantAgentCommandCenter, 'payloadShape' | 'mode' | 'summary' | 'primaryAction' | 'nextAction' | 'safetyBoundary'>;
  shiftFirstForwardableRun: Pick<RestaurantShiftFirstForwardableRun, 'payloadShape' | 'verdict' | 'summary' | 'selectedShiftRun' | 'externalRequired' | 'safetyBoundary'>;
  shiftProviderHandoff: Pick<RestaurantShiftProviderHandoff, 'payloadShape' | 'summary' | 'nextAction' | 'safetyBoundary'>;
  shiftSandboxAcceptance: Pick<RestaurantShiftSandboxAcceptance, 'payloadShape' | 'verdict' | 'summary' | 'externalRequired' | 'safetyBoundary'>;
  taskProviderHandoff: Pick<RestaurantTaskProviderHandoff, 'payloadShape' | 'summary' | 'providerContract' | 'safetyBoundary'>;
  providerSandboxContract: Pick<RestaurantProviderSandboxContract, 'payloadShape' | 'verdict' | 'summary' | 'safetyBoundary'>;
  providerReceiptInbox: Pick<RestaurantProviderReceiptInbox, 'payloadShape' | 'summary' | 'externalRequired' | 'safetyBoundary'>;
  providerReadinessHealth: Pick<RestaurantProviderReadinessHealth, 'payloadShape' | 'summary' | 'nextActions' | 'externalRequired' | 'safetyBoundary'>;
  recovery: Pick<RestaurantAgentRecoveryPlan, 'inspectedRuns' | 'acceptedReceipts' | 'actions' | 'retryPolicy' | 'blockedExternal'>;
  shiftCloseoutTrainingPack: Pick<RestaurantShiftCloseoutTrainingPack, 'payloadShape' | 'verdict' | 'summary' | 'lanes' | 'externalRequired' | 'safetyBoundary'>;
  shiftCapabilityActivationPack: Pick<RestaurantShiftCapabilityActivationPack, 'payloadShape' | 'verdict' | 'summary' | 'externalRequired' | 'safetyBoundary'>;
  trainingPlan: Pick<RestaurantCapabilityTrainingPlan, 'payloadShape' | 'summary' | 'nextInternalTraining' | 'externalSetupRequests' | 'safetyBoundary'>;
  latestForwardAttempt?: Pick<RestaurantShiftSandboxForwardAttempt, 'payloadShape' | 'verdict' | 'summary' | 'recoveryNextAction' | 'safetyBoundary'>;
  operatorRunbook: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

function latestShiftRun(runs: RestaurantShiftAutopilotRunRecord[]): RestaurantShiftAutopilotRunRecord | undefined {
  return runs.slice().sort((left, right) => right.completedAt.localeCompare(left.completedAt))[0];
}

function stage(input: RestaurantShiftOperatingLoopStage): RestaurantShiftOperatingLoopStage {
  return input;
}

function nextActionFrom(stages: RestaurantShiftOperatingLoopStage[]): RestaurantShiftOperatingLoopPack['nextBestAction'] {
  const firstBlocked = stages.find(item => item.status === 'blocked' || item.status === 'needs-action');
  const firstProvider = stages.find(item => item.status === 'waiting-provider');
  const firstProof = stages.find(item => item.status === 'waiting-proof');
  const selected = firstBlocked || firstProvider || firstProof || stages[stages.length - 1];
  const actionMap: Record<RestaurantShiftOperatingLoopStage['id'], RestaurantShiftOperatingLoopPack['nextBestAction']['action']> = {
    'command-center': 'run-shift-autopilot',
    'shift-run': 'run-shift-autopilot',
    'provider-handoff': 'build-provider-handoff',
    'sandbox-acceptance': 'check-sandbox-acceptance',
    'forwardable-package': 'build-first-forwardable-run',
    'sandbox-forward': 'submit-shift-sandbox-run',
    'receipt-inbox': 'collect-provider-receipt',
    'closeout-training': 'closeout-train',
    'capability-activation': 'activation-pack',
  };
  return {
    label: selected.primaryAction,
    action: actionMap[selected.id],
    reason: selected.customerVisible,
    owner: selected.owner,
  };
}

function verdict(input: {
  stages: RestaurantShiftOperatingLoopStage[];
  canSubmitSandbox: boolean;
  canRecordTraining: boolean;
}): RestaurantShiftOperatingLoopPack['verdict'] {
  if (input.canSubmitSandbox) return 'ready-for-sandbox-submit';
  if (input.stages.some(item => item.status === 'waiting-proof')) return 'waiting-proof';
  if (input.stages.some(item => item.status === 'waiting-provider')) return 'waiting-provider';
  if (input.canRecordTraining) return 'needs-closeout-training';
  return 'ready-to-run-internal';
}

export function buildRestaurantShiftOperatingLoopPack(input: {
  commandCenter: RestaurantAgentCommandCenter;
  shiftRuns: RestaurantShiftAutopilotRunRecord[];
  shiftProviderHandoff: RestaurantShiftProviderHandoff;
  shiftSandboxAcceptance: RestaurantShiftSandboxAcceptance;
  shiftFirstForwardableRun: RestaurantShiftFirstForwardableRun;
  taskProviderHandoff: RestaurantTaskProviderHandoff;
  providerSandboxContract: RestaurantProviderSandboxContract;
  providerReceiptInbox: RestaurantProviderReceiptInbox;
  providerReadinessHealth: RestaurantProviderReadinessHealth;
  recovery: RestaurantAgentRecoveryPlan;
  shiftCloseoutTrainingPack: RestaurantShiftCloseoutTrainingPack;
  shiftCapabilityActivationPack: RestaurantShiftCapabilityActivationPack;
  capabilityTrainingPlan: RestaurantCapabilityTrainingPlan;
  trainingRecords: RestaurantCapabilityTrainingRecord[];
  latestForwardAttempt?: RestaurantShiftSandboxForwardAttempt;
  now?: Date;
}): RestaurantShiftOperatingLoopPack {
  const now = input.now || new Date();
  const selectedRun = latestShiftRun(input.shiftRuns);
  const hasForwardAttempt = Boolean(input.latestForwardAttempt);
  const acceptedTrainingRecords = input.trainingRecords.filter(record => record.accepted).length;
  const stages = [
    stage({
      id: 'command-center',
      title: 'Command center',
      status: input.commandCenter.mode === 'setup-required' ? 'waiting-provider' : 'ready',
      owner: input.commandCenter.primaryAction.owner,
      customerVisible: input.commandCenter.headline,
      evidence: [`mode:${input.commandCenter.mode}`, `runs:${input.commandCenter.summary.runs}`, `receipts:${input.commandCenter.summary.acceptedReceipts}`],
      primaryAction: input.commandCenter.primaryAction.label,
    }),
    stage({
      id: 'shift-run',
      title: 'Shift autopilot run',
      status: selectedRun ? 'ready' : 'needs-action',
      owner: 'ops',
      customerVisible: selectedRun ? 'A recorded shift run can be used as the source of truth.' : 'Start by running one bounded shift plan from the restaurant intake.',
      evidence: selectedRun ? [`run:${selectedRun.runId}`, `tasks:${selectedRun.summary.createdStoreManagerTasks}`] : ['no shift run ledger record'],
      primaryAction: selectedRun ? 'Use latest shift run' : 'Run Shift Autopilot',
    }),
    stage({
      id: 'provider-handoff',
      title: 'Provider handoff',
      status: input.shiftProviderHandoff.summary.requests > 0
        ? input.shiftProviderHandoff.summary.waitingExternal > 0 ? 'waiting-provider' : 'ready'
        : 'needs-action',
      owner: input.shiftProviderHandoff.summary.p0 > 0 ? 'runtime-admin' : 'ops',
      customerVisible: input.shiftProviderHandoff.nextAction,
      evidence: [`requests:${input.shiftProviderHandoff.summary.requests}`, `p0:${input.shiftProviderHandoff.summary.p0}`, `sandboxReady:${input.shiftProviderHandoff.summary.readyToSandbox}`],
      primaryAction: 'Build Provider Handoff',
    }),
    stage({
      id: 'sandbox-acceptance',
      title: 'Sandbox acceptance',
      status: input.shiftSandboxAcceptance.summary.canSubmitSandbox
        ? 'ready'
        : input.shiftSandboxAcceptance.summary.waitingExternal > 0 ? 'waiting-provider' : 'blocked',
      owner: 'runtime-admin',
      customerVisible: input.shiftSandboxAcceptance.summary.canSubmitSandbox
        ? 'Sandbox contract is ready for a sanitized provider submit.'
        : input.shiftSandboxAcceptance.externalRequired[0] || 'Resolve sandbox acceptance gates.',
      evidence: [`verdict:${input.shiftSandboxAcceptance.verdict}`, `passed:${input.shiftSandboxAcceptance.summary.passed}/${input.shiftSandboxAcceptance.summary.stages}`],
      primaryAction: 'Check Sandbox Acceptance',
    }),
    stage({
      id: 'forwardable-package',
      title: 'First forwardable package',
      status: input.shiftFirstForwardableRun.summary.canForwardFirstShiftRun ? 'ready' : 'blocked',
      owner: 'ops',
      customerVisible: input.shiftFirstForwardableRun.summary.canForwardFirstShiftRun
        ? 'One sanitized package is ready for the sandbox runtime.'
        : input.shiftFirstForwardableRun.externalRequired[0] || 'Prepare one forwardable package from the latest shift run.',
      evidence: [`verdict:${input.shiftFirstForwardableRun.verdict}`, `packages:${input.shiftFirstForwardableRun.summary.forwardablePackages}`],
      primaryAction: 'Build Shift First Forwardable Run',
    }),
    stage({
      id: 'sandbox-forward',
      title: 'Sandbox forward',
      status: hasForwardAttempt
        ? input.latestForwardAttempt?.ok ? 'waiting-proof' : 'blocked'
        : input.shiftFirstForwardableRun.summary.canForwardFirstShiftRun ? 'ready' : 'blocked',
      owner: 'runtime-admin',
      customerVisible: hasForwardAttempt
        ? input.latestForwardAttempt?.recoveryNextAction || 'Watch the provider receipt inbox.'
        : 'Submit only after the package and sandbox acceptance are ready.',
      evidence: hasForwardAttempt
        ? [`verdict:${input.latestForwardAttempt?.verdict}`, `bridge:${input.latestForwardAttempt?.summary.bridgeStatus}`]
        : [`canForward:${input.shiftFirstForwardableRun.summary.canForwardFirstShiftRun}`],
      primaryAction: hasForwardAttempt ? 'Watch Receipt Inbox' : 'Submit Shift Sandbox Run',
    }),
    stage({
      id: 'receipt-inbox',
      title: 'Receipt inbox',
      status: input.providerReceiptInbox.summary.accepted > 0
        ? 'ready'
        : input.providerReceiptInbox.summary.waitingReceipt > 0 ? 'waiting-proof' : input.providerReceiptInbox.summary.actionRequired > 0 ? 'needs-action' : 'ready',
      owner: 'ops',
      customerVisible: input.providerReceiptInbox.summary.accepted > 0
        ? 'Accepted receipts can be reviewed and used for closeout.'
        : input.providerReceiptInbox.externalRequired[0] || 'Collect public proof or signed provider callback before closing the run.',
      evidence: [`requests:${input.providerReceiptInbox.summary.total}`, `accepted:${input.providerReceiptInbox.summary.accepted}`, `action:${input.providerReceiptInbox.summary.actionRequired}`],
      primaryAction: 'Collect Provider Receipt',
    }),
    stage({
      id: 'closeout-training',
      title: 'Closeout training',
      status: input.shiftCloseoutTrainingPack.summary.canRecordTraining ? 'ready' : 'waiting-proof',
      owner: 'data-ops',
      customerVisible: input.shiftCloseoutTrainingPack.externalRequired[0]
        || input.shiftCloseoutTrainingPack.lanes.find(item => item.status !== 'ready')?.nextAction
        || 'Use accepted proof or sanitized aggregate data before recording closeout training.',
      evidence: [`verdict:${input.shiftCloseoutTrainingPack.verdict}`, `drafts:${input.shiftCloseoutTrainingPack.summary.trainingDrafts}`, `recovery:${input.shiftCloseoutTrainingPack.summary.recoveryActions}`],
      primaryAction: input.shiftCloseoutTrainingPack.summary.canRecordTraining ? 'Record Training' : 'Closeout + Train',
    }),
    stage({
      id: 'capability-activation',
      title: 'Capability activation',
      status: input.shiftCapabilityActivationPack.summary.activatedInternal > 0
        ? input.shiftCapabilityActivationPack.summary.trainedNeedsProvider > 0 || input.shiftCapabilityActivationPack.summary.providerBlocked > 0 ? 'waiting-provider' : 'ready'
        : 'needs-action',
      owner: 'store-manager',
      customerVisible: input.shiftCapabilityActivationPack.externalRequired[0] || 'Use activated internal capabilities in the next shift loop.',
      evidence: [`internal:${input.shiftCapabilityActivationPack.summary.activatedInternal}`, `provider:${input.shiftCapabilityActivationPack.summary.trainedNeedsProvider}`, `records:${input.shiftCapabilityActivationPack.summary.acceptedTrainingRecords}`],
      primaryAction: 'Activation Pack',
    }),
  ];
  const ready = stages.filter(item => item.status === 'ready').length;
  const waitingProvider = stages.filter(item => item.status === 'waiting-provider').length;
  const waitingProof = stages.filter(item => item.status === 'waiting-proof').length;
  const blocked = stages.filter(item => item.status === 'blocked').length;

  return {
    ok: true,
    payloadShape: 'restaurant-shift-operating-loop-pack-v1',
    generatedAt: now.toISOString(),
    verdict: verdict({
      stages,
      canSubmitSandbox: input.shiftFirstForwardableRun.summary.canForwardFirstShiftRun && input.shiftSandboxAcceptance.summary.canSubmitSandbox,
      canRecordTraining: input.shiftCloseoutTrainingPack.summary.canRecordTraining,
    }),
    summary: {
      stages: stages.length,
      ready,
      waitingProvider,
      waitingProof,
      blocked,
      shiftRuns: input.shiftRuns.length,
      providerRequests: input.shiftProviderHandoff.summary.requests,
      receiptRequests: input.providerReceiptInbox.summary.total,
      acceptedTrainingRecords,
      activatedInternal: input.shiftCapabilityActivationPack.summary.activatedInternal,
      canSubmitSandbox: input.shiftFirstForwardableRun.summary.canForwardFirstShiftRun && input.shiftSandboxAcceptance.summary.canSubmitSandbox,
      canClaimExternalAutomation: false,
    },
    stages,
    nextBestAction: nextActionFrom(stages),
    commandCenter: {
      payloadShape: input.commandCenter.payloadShape,
      mode: input.commandCenter.mode,
      summary: input.commandCenter.summary,
      primaryAction: input.commandCenter.primaryAction,
      nextAction: input.commandCenter.nextAction,
      safetyBoundary: input.commandCenter.safetyBoundary,
    },
    shiftFirstForwardableRun: {
      payloadShape: input.shiftFirstForwardableRun.payloadShape,
      verdict: input.shiftFirstForwardableRun.verdict,
      summary: input.shiftFirstForwardableRun.summary,
      selectedShiftRun: input.shiftFirstForwardableRun.selectedShiftRun,
      externalRequired: input.shiftFirstForwardableRun.externalRequired,
      safetyBoundary: input.shiftFirstForwardableRun.safetyBoundary,
    },
    shiftProviderHandoff: {
      payloadShape: input.shiftProviderHandoff.payloadShape,
      summary: input.shiftProviderHandoff.summary,
      nextAction: input.shiftProviderHandoff.nextAction,
      safetyBoundary: input.shiftProviderHandoff.safetyBoundary,
    },
    shiftSandboxAcceptance: {
      payloadShape: input.shiftSandboxAcceptance.payloadShape,
      verdict: input.shiftSandboxAcceptance.verdict,
      summary: input.shiftSandboxAcceptance.summary,
      externalRequired: input.shiftSandboxAcceptance.externalRequired,
      safetyBoundary: input.shiftSandboxAcceptance.safetyBoundary,
    },
    taskProviderHandoff: {
      payloadShape: input.taskProviderHandoff.payloadShape,
      summary: input.taskProviderHandoff.summary,
      providerContract: input.taskProviderHandoff.providerContract,
      safetyBoundary: input.taskProviderHandoff.safetyBoundary,
    },
    providerSandboxContract: {
      payloadShape: input.providerSandboxContract.payloadShape,
      verdict: input.providerSandboxContract.verdict,
      summary: input.providerSandboxContract.summary,
      safetyBoundary: input.providerSandboxContract.safetyBoundary,
    },
    providerReceiptInbox: {
      payloadShape: input.providerReceiptInbox.payloadShape,
      summary: input.providerReceiptInbox.summary,
      externalRequired: input.providerReceiptInbox.externalRequired,
      safetyBoundary: input.providerReceiptInbox.safetyBoundary,
    },
    providerReadinessHealth: {
      payloadShape: input.providerReadinessHealth.payloadShape,
      summary: input.providerReadinessHealth.summary,
      nextActions: input.providerReadinessHealth.nextActions,
      externalRequired: input.providerReadinessHealth.externalRequired,
      safetyBoundary: input.providerReadinessHealth.safetyBoundary,
    },
    recovery: {
      inspectedRuns: input.recovery.inspectedRuns,
      acceptedReceipts: input.recovery.acceptedReceipts,
      actions: input.recovery.actions,
      retryPolicy: input.recovery.retryPolicy,
      blockedExternal: input.recovery.blockedExternal,
    },
    shiftCloseoutTrainingPack: {
      payloadShape: input.shiftCloseoutTrainingPack.payloadShape,
      verdict: input.shiftCloseoutTrainingPack.verdict,
      summary: input.shiftCloseoutTrainingPack.summary,
      lanes: input.shiftCloseoutTrainingPack.lanes,
      externalRequired: input.shiftCloseoutTrainingPack.externalRequired,
      safetyBoundary: input.shiftCloseoutTrainingPack.safetyBoundary,
    },
    shiftCapabilityActivationPack: {
      payloadShape: input.shiftCapabilityActivationPack.payloadShape,
      verdict: input.shiftCapabilityActivationPack.verdict,
      summary: input.shiftCapabilityActivationPack.summary,
      externalRequired: input.shiftCapabilityActivationPack.externalRequired,
      safetyBoundary: input.shiftCapabilityActivationPack.safetyBoundary,
    },
    trainingPlan: {
      payloadShape: input.capabilityTrainingPlan.payloadShape,
      summary: input.capabilityTrainingPlan.summary,
      nextInternalTraining: input.capabilityTrainingPlan.nextInternalTraining,
      externalSetupRequests: input.capabilityTrainingPlan.externalSetupRequests,
      safetyBoundary: input.capabilityTrainingPlan.safetyBoundary,
    },
    latestForwardAttempt: input.latestForwardAttempt ? {
      payloadShape: input.latestForwardAttempt.payloadShape,
      verdict: input.latestForwardAttempt.verdict,
      summary: input.latestForwardAttempt.summary,
      recoveryNextAction: input.latestForwardAttempt.recoveryNextAction,
      safetyBoundary: input.latestForwardAttempt.safetyBoundary,
    } : undefined,
    operatorRunbook: [
      'Use this pack as the single customer path: run one shift, unlock provider asks, submit one sanitized sandbox package, collect proof, close out and train.',
      'Every customer-visible claim must point to an accepted receipt, public proof, staff acknowledgement or sanitized aggregate import.',
      'Use provider-gated stages as exact asks for API keys, merchant authorization, callback secrets, isolated browser runtime, POS/member/coupon aggregate contracts and notification channels.',
      'Do not expose secrets, cookies, private messages, customer identifiers, coupon codes, payment ids, raw POS rows or unaccepted screenshots.',
    ],
    externalRequired: Array.from(new Set([
      ...stages.filter(item => item.status !== 'ready').map(item => `${item.title}: ${item.primaryAction}`),
      ...input.shiftFirstForwardableRun.externalRequired,
      ...input.shiftSandboxAcceptance.externalRequired,
      ...input.providerReceiptInbox.externalRequired,
      ...input.providerReadinessHealth.externalRequired,
      ...input.shiftCapabilityActivationPack.externalRequired,
      ...input.capabilityTrainingPlan.externalSetupRequests.map(request => `${request.capabilityId}: ${request.provider} (${request.owner})`),
    ])).filter(Boolean).slice(0, 24),
    safetyBoundary: 'Shift Operating Loop Pack is a read-only restaurant AI employee operating path. It does not call providers, keep a browser open, publish, contact customers, redeem coupons, read private messages, pull raw POS rows, expose secrets, record training, close tasks, or claim external automation without provider setup, merchant authorization, accepted receipts and sanitized aggregate data proof.',
  };
}

import type { RestaurantAgentChannelDeliveryReport } from '@/lib/restaurant-agent-channel-delivery-store';
import type { RestaurantBusinessSignalReport } from '@/lib/restaurant-agent-business-signals';
import type { RestaurantAgentRecoveryPlan } from '@/lib/restaurant-agent-recovery';
import type { RestaurantBrowserGatewayPack } from '@/lib/restaurant-browser-gateway-pack';
import type { RestaurantRuntimeRunnerLoopPack } from '@/lib/restaurant-runtime-runner-loop-pack';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantPublishExecutionTask = {
  id: 'prepare-publish-package' | 'submit-browser-runner' | 'capture-public-proof' | 'accept-final-receipt' | 'recover-failed-run' | 'write-memory-followup';
  title: string;
  status: 'ready-internal' | 'waiting-provider' | 'waiting-proof' | 'blocked' | 'done';
  owner: 'ops' | 'runtime-admin' | 'provider' | 'store-manager';
  lane: 'publish' | 'browser-runner' | 'receipt' | 'recovery' | 'memory';
  canRunNow: boolean;
  action: string;
  evidenceRequired: string[];
  stopLine: string;
};

export type RestaurantPublishExecutionInbox = {
  ok: true;
  payloadShape: 'restaurant-publish-execution-inbox-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'manual-ready' | 'provider-unlock-first' | 'waiting-receipt' | 'recovery-needed' | 'closed-loop-ready';
  summary: {
    tasks: number;
    readyInternal: number;
    waitingProvider: number;
    waitingProof: number;
    blocked: number;
    done: number;
    acceptedRunnerActions: number;
    runnerEvents: number;
    waitingReceipts: number;
    acceptedReceipts: number;
    recoveryActions: number;
    canClaimAutoPublish: boolean;
    canClaimBrowserExecution: boolean;
  };
  tasks: RestaurantPublishExecutionTask[];
  runnerCommands: Array<{
    action: string;
    allowed: boolean;
    writesTo: string;
    requiredEvidence: string[];
    stopIf: string[];
  }>;
  failureRecovery: Array<{
    priority: string;
    eventId: string;
    action: string;
    owner: string;
    nextStep: string;
    evidenceRequired: string;
  }>;
  operatorRunbook: string[];
  providerUnlocks: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, 120) : fallback;
}

function unique(values: string[], limit = 16) {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function statusCounts(tasks: RestaurantPublishExecutionTask[]) {
  return {
    readyInternal: tasks.filter(item => item.status === 'ready-internal').length,
    waitingProvider: tasks.filter(item => item.status === 'waiting-provider').length,
    waitingProof: tasks.filter(item => item.status === 'waiting-proof').length,
    blocked: tasks.filter(item => item.status === 'blocked').length,
    done: tasks.filter(item => item.status === 'done').length,
  };
}

function verdict(input: {
  canExecuteNow: boolean;
  waitingReceipts: number;
  acceptedReceipts: number;
  recoveryActions: number;
  blocked: number;
}): RestaurantPublishExecutionInbox['verdict'] {
  if (input.acceptedReceipts > 0) return 'closed-loop-ready';
  if (input.recoveryActions > 0 || input.blocked > 0) return 'recovery-needed';
  if (input.waitingReceipts > 0) return 'waiting-receipt';
  return input.canExecuteNow ? 'manual-ready' : 'provider-unlock-first';
}

export function buildRestaurantPublishExecutionInbox(input: RestaurantTrialIntake & {
  browserGatewayPack: RestaurantBrowserGatewayPack;
  runtimeRunnerLoopPack: RestaurantRuntimeRunnerLoopPack;
  channelDeliveryReport: RestaurantAgentChannelDeliveryReport;
  businessSignals: RestaurantBusinessSignalReport;
  recovery?: RestaurantAgentRecoveryPlan;
  now?: Date;
}): RestaurantPublishExecutionInbox {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, 'Trial restaurant');
  const offer = clean(input.offer, 'Today offer');
  const gateway = input.browserGatewayPack;
  const runner = input.runtimeRunnerLoopPack;
  const acceptedRunnerActions = gateway.browserRequest.acceptedActions.length;
  const waitingReceipts = runner.summary.waitingReceipts;
  const acceptedReceipts = runner.summary.acceptedReceipts;
  const recoveryActions = runner.summary.recoveryActions + (input.recovery?.actions.length || 0);
  const channelAttempts = input.channelDeliveryReport.summary.total;
  const hasAnyProofSignal = input.businessSignals.summary.acceptedReceipts > 0 || acceptedReceipts > 0;

  const tasks: RestaurantPublishExecutionTask[] = [
    {
      id: 'prepare-publish-package',
      title: 'Prepare publish package and proof slot',
      status: 'ready-internal',
      owner: 'ops',
      lane: 'publish',
      canRunNow: true,
      action: `Prepare approved content, target platform, proof requirement and owner for ${offer}.`,
      evidenceRequired: ['approved content', 'target channel', 'merchant boundary', 'proof slot'],
      stopLine: 'Do not publish or claim distribution before platform proof is accepted.',
    },
    {
      id: 'submit-browser-runner',
      title: 'Submit governed browser runner task',
      status: gateway.canExecuteNow ? 'ready-internal' : 'waiting-provider',
      owner: 'runtime-admin',
      lane: 'browser-runner',
      canRunNow: gateway.canExecuteNow,
      action: gateway.canExecuteNow
        ? 'Send the allowlisted browser request with runbook id, snapshot policy and callback endpoint.'
        : 'Collect runtime URL/key, callback secret, isolated browser profile and merchant authorization before browser execution.',
      evidenceRequired: ['gateway id', 'runbook id', 'allowed domain', 'callback endpoint', 'runtime health'],
      stopLine: 'Stop on login challenge, captcha, private inbox, customer identifiers, cookies, tokens or payment/POS pages.',
    },
    {
      id: 'capture-public-proof',
      title: 'Capture public proof or screenshot id',
      status: runner.summary.runnerEvents > 0 ? 'waiting-proof' : 'waiting-provider',
      owner: 'provider',
      lane: 'browser-runner',
      canRunNow: gateway.browserRequest.acceptedActions.includes('capture_public_proof'),
      action: 'Capture only public page state, screenshot id, visible channel and sanitized blocker summary.',
      evidenceRequired: ['public URL or screenshot id', 'timestamp', 'visible channel', 'sanitized evidence summary'],
      stopLine: 'No private messages, customer identifiers, coupon codes, payment ids or raw browser state.',
    },
    {
      id: 'accept-final-receipt',
      title: 'Accept signed final receipt',
      status: acceptedReceipts > 0 ? 'done' : waitingReceipts > 0 || runner.summary.completedRunnerRuns > 0 ? 'waiting-proof' : 'waiting-provider',
      owner: 'ops',
      lane: 'receipt',
      canRunNow: true,
      action: 'Validate signed callback or manual public proof receipt, then move it into post-run review.',
      evidenceRequired: ['eventId', 'externalRunId or screenshotId or evidenceUrl', 'operator', 'summary', 'business-signal aggregate'],
      stopLine: 'Reject samples, placeholders, unsigned provider callbacks and any private or sensitive payload.',
    },
    {
      id: 'recover-failed-run',
      title: 'Recover blocked, stale or failed runner run',
      status: recoveryActions > 0 ? 'blocked' : 'ready-internal',
      owner: 'runtime-admin',
      lane: 'recovery',
      canRunNow: true,
      action: runner.recovery.actions[0]?.nextStep || input.recovery?.actions[0]?.nextStep || 'Keep recovery watch open and use manual fallback if provider proof does not arrive.',
      evidenceRequired: ['blocked reason', 'owner', 'retry attempt', 'manual fallback proof if used'],
      stopLine: 'Retry at most twice; stop on missing authorization, signature mismatch, captcha/login challenge or private data exposure.',
    },
    {
      id: 'write-memory-followup',
      title: 'Write memory follow-up after accepted proof',
      status: hasAnyProofSignal ? 'ready-internal' : 'waiting-proof',
      owner: 'store-manager',
      lane: 'memory',
      canRunNow: hasAnyProofSignal,
      action: hasAnyProofSignal
        ? 'Turn accepted proof into store memory, next-shift task and channel follow-up.'
        : 'Wait for accepted proof before writing any performance or growth memory.',
      evidenceRequired: ['accepted receipt', 'owner', 'next action', 'no raw customer identifiers'],
      stopLine: 'Do not write growth claims, ROI claims or customer-level records from unverified runner state.',
    },
  ];

  const counts = statusCounts(tasks);
  const runnerCommands = gateway.actionSchema.map(item => ({
    action: item.action,
    allowed: item.allowed,
    writesTo: item.writesTo,
    requiredEvidence: item.requiredEvidence,
    stopIf: item.stopIf,
  }));

  return {
    ok: true,
    payloadShape: 'restaurant-publish-execution-inbox-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    verdict: verdict({
      canExecuteNow: gateway.canExecuteNow,
      waitingReceipts,
      acceptedReceipts,
      recoveryActions,
      blocked: counts.blocked,
    }),
    summary: {
      tasks: tasks.length,
      ...counts,
      acceptedRunnerActions,
      runnerEvents: runner.summary.runnerEvents,
      waitingReceipts,
      acceptedReceipts,
      recoveryActions,
      canClaimAutoPublish: false,
      canClaimBrowserExecution: gateway.canExecuteNow && acceptedRunnerActions > 2,
    },
    tasks,
    runnerCommands,
    failureRecovery: [
      ...runner.recovery.actions,
      ...(input.recovery?.actions || []),
    ].slice(0, 5).map(item => ({
      priority: item.priority,
      eventId: item.eventId,
      action: item.action,
      owner: item.owner,
      nextStep: item.nextStep,
      evidenceRequired: item.evidenceRequired,
    })),
    operatorRunbook: [
      '1. Prepare content package and proof slot internally.',
      gateway.canExecuteNow ? '2. Submit governed browser runner request through the configured Provider.' : '2. Keep as manual publish checklist until runtime URL/key, callback secret, isolated browser profile and merchant authorization exist.',
      channelAttempts > 0 ? '3. Reconcile channel delivery attempt with signed receipt.' : '3. Capture public proof URL or screenshot id before closing the task.',
      '4. Accept signed/public receipt, then write only aggregate memory and next-shift tasks.',
      '5. If blocked, run failure recovery and manual fallback; never loop platform actions automatically.',
    ],
    providerUnlocks: unique([
      ...gateway.externalRequired,
      ...runner.externalRequired,
      'browser runtime URL/key',
      'callback secret and signature validation',
      'merchant platform authorization',
      'isolated browser profile',
      'public proof receipt callback',
    ]),
    externalRequired: unique([
      ...gateway.externalRequired,
      ...runner.externalRequired,
      ...tasks.filter(item => item.status === 'waiting-provider' || item.status === 'blocked').flatMap(item => item.evidenceRequired),
    ]),
    safetyBoundary: 'Publish Execution Inbox prepares and watches governed browser/runtime work only. It does not auto-publish, contact customers, read private messages, bypass login/captcha, store cookies or tokens, redeem coupons, write POS/orders, expose provider keys, or claim external automation without configured Provider health, merchant authorization and accepted public/signed receipts.',
  };
}

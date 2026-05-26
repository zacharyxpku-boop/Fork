import type { RestaurantProviderReceiptLifecycle } from '@/lib/restaurant-provider-receipt-lifecycle';
import type { RestaurantProviderSandboxReadinessBoard } from '@/lib/restaurant-provider-sandbox-readiness-board';
import type { RestaurantProviderSandboxSubmitAttempt, RestaurantProviderSandboxSubmitWorkbench } from '@/lib/restaurant-provider-sandbox-submit-workbench';
import type { RestaurantRuntimeRunnerLoopPack } from '@/lib/restaurant-runtime-runner-loop-pack';

export type RestaurantProviderSandboxRunConsoleStep = {
  id: 'readiness' | 'submit-package' | 'dispatch' | 'runner-events' | 'signed-callback' | 'closeout';
  label: string;
  status: 'ready' | 'waiting' | 'blocked' | 'done';
  owner: 'runtime-admin' | 'provider' | 'ops' | 'store-manager' | 'data-ops' | 'merchant';
  evidence: string[];
  nextAction: string;
  stopLine: string;
};

export type RestaurantProviderSandboxRunConsole = {
  ok: true;
  payloadShape: 'restaurant-provider-sandbox-run-console-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict:
    | 'blocked-before-submit'
    | 'ready-to-submit'
    | 'submitted-watching-runner'
    | 'waiting-signed-callback'
    | 'accepted-closeout-ready'
    | 'recovery-required';
  summary: {
    steps: number;
    ready: number;
    waiting: number;
    blocked: number;
    done: number;
    submitAllowed: boolean;
    runnerEvents: number;
    waitingReceipts: number;
    acceptedReceipts: number;
    canCloseoutRun: boolean;
    canWriteMemory: boolean;
    canClaimExternalAutomation: false;
  };
  selectedLane: {
    capabilityId: string;
    packageId?: string;
    status: string;
    owner: string;
    nextAction: string;
  };
  timeline: RestaurantProviderSandboxRunConsoleStep[];
  closeoutChecklist: Array<{
    label: string;
    status: 'done' | 'waiting' | 'blocked';
    evidence: string;
  }>;
  operatorCommands: string[];
  providerCallbackContract: {
    endpoint: '/api/restaurant-agent/runtime';
    action: 'external-receipt';
    header: 'x-restaurant-agent-signature';
    acceptedEvidence: string[];
    forbiddenFields: string[];
  };
  externalRequired: string[];
  safetyBoundary: string;
};

function unique(values: string[], limit = 12): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function statusCount(steps: RestaurantProviderSandboxRunConsoleStep[], status: RestaurantProviderSandboxRunConsoleStep['status']) {
  return steps.filter(step => step.status === status).length;
}

function verdictFor(input: {
  blocked: number;
  submitAllowed: boolean;
  runnerEvents: number;
  waitingReceipts: number;
  acceptedReceipts: number;
  recoveryActions: number;
}): RestaurantProviderSandboxRunConsole['verdict'] {
  if (input.acceptedReceipts > 0) return 'accepted-closeout-ready';
  if (input.recoveryActions > 0) return 'recovery-required';
  if (input.waitingReceipts > 0) return 'waiting-signed-callback';
  if (input.runnerEvents > 0) return 'submitted-watching-runner';
  if (input.submitAllowed) return 'ready-to-submit';
  return 'blocked-before-submit';
}

export function buildRestaurantProviderSandboxRunConsole(input: {
  providerSandboxReadinessBoard: RestaurantProviderSandboxReadinessBoard;
  providerSandboxSubmitWorkbench: RestaurantProviderSandboxSubmitWorkbench;
  runtimeRunnerLoopPack: RestaurantRuntimeRunnerLoopPack;
  providerReceiptLifecycle: RestaurantProviderReceiptLifecycle;
  providerSandboxSubmitAttempt?: RestaurantProviderSandboxSubmitAttempt;
  now?: Date;
}): RestaurantProviderSandboxRunConsole {
  const now = input.now || new Date();
  const readyRow = input.providerSandboxReadinessBoard.rows.find(row => row.submitAllowed);
  const selectedRow = readyRow
    || input.providerSandboxReadinessBoard.rows.find(row => row.status === 'waiting-receipt')
    || input.providerSandboxReadinessBoard.rows.find(row => row.status === 'accepted')
    || input.providerSandboxReadinessBoard.rows[0];
  const selectedPackage = selectedRow
    ? input.providerSandboxSubmitWorkbench.submitPackages.find(item => item.capabilityId === selectedRow.capabilityId)
    : undefined;
  const runner = input.runtimeRunnerLoopPack;
  const lifecycle = input.providerReceiptLifecycle;
  const submitAttempt = input.providerSandboxSubmitAttempt;
  const submitAllowed = Boolean(selectedRow?.submitAllowed);
  const waitingReceipts = runner.summary.waitingReceipts || lifecycle.summary.waitingReceipts;
  const acceptedReceipts = runner.summary.acceptedReceipts || lifecycle.summary.acceptedReceipts;
  const recoveryActions = runner.summary.recoveryActions;

  const timeline: RestaurantProviderSandboxRunConsoleStep[] = [
    {
      id: 'readiness',
      label: 'Sandbox readiness decision',
      status: submitAllowed || selectedRow?.status === 'accepted' ? 'done' : 'blocked',
      owner: selectedRow?.owner || 'ops',
      evidence: [
        `verdict:${input.providerSandboxReadinessBoard.verdict}`,
        `submitAllowed:${submitAllowed}`,
        `missing:${selectedRow?.missing.slice(0, 3).join('|') || 'none'}`,
      ],
      nextAction: submitAllowed
        ? 'Use the selected sanitized package and start a controlled sandbox submit.'
        : selectedRow?.nextAction || 'Complete provider setup before sandbox submit.',
      stopLine: 'No submit when provider keys, merchant grant, callback or data-contract evidence is missing.',
    },
    {
      id: 'submit-package',
      label: 'Sanitized submit package selected',
      status: selectedPackage?.status === 'ready-to-submit' ? 'ready' : selectedPackage?.status === 'accepted' ? 'done' : 'blocked',
      owner: selectedPackage?.recoveryOwner || 'ops',
      evidence: [
        `package:${selectedPackage?.selectedPackageId || 'none'}`,
        `endpoint:${selectedPackage?.submitEndpointShape.endpointEnv || 'not-ready'}`,
        `secrets:${selectedPackage?.submitEndpointShape.includesSecrets ? 'blocked' : 'false'}`,
      ],
      nextAction: selectedPackage?.status === 'ready-to-submit'
        ? selectedPackage.nextAction
        : selectedPackage?.nextAction || 'Build a safe provider package before dispatch.',
      stopLine: selectedPackage?.stopLine || 'No raw credentials, private messages, coupon codes or POS rows in submit payload.',
    },
    {
      id: 'dispatch',
      label: 'Provider dispatch attempt',
      status: submitAttempt
        ? submitAttempt.verdict === 'forwarded-waiting-receipt' ? 'done' : 'blocked'
        : runner.summary.externalRuns > 0 ? 'done' : submitAllowed ? 'waiting' : 'blocked',
      owner: 'ops',
      evidence: submitAttempt
        ? [`verdict:${submitAttempt.verdict}`, `bridge:${submitAttempt.summary.bridgeStatus}`, `runRecorded:${submitAttempt.summary.runRecorded}`]
        : [`externalRuns:${runner.summary.externalRuns}`, `localRuns:${runner.summary.localRuns}`],
      nextAction: submitAttempt?.recoveryNextAction || runner.stages.find(stage => stage.id === 'adapter-ready')?.nextAction || 'Submit the selected package to the provider sandbox.',
      stopLine: 'Dispatch alone is not proof; the run stays open until a signed/public receipt is accepted.',
    },
    {
      id: 'runner-events',
      label: 'Runner events and heartbeat',
      status: runner.summary.recoveryActions > 0 || runner.summary.staleRunnerRuns > 0
        ? 'blocked'
        : runner.summary.runnerEvents > 0 ? 'done' : 'waiting',
      owner: 'provider',
      evidence: [
        `runnerEvents:${runner.summary.runnerEvents}`,
        `active:${runner.summary.activeRunnerRuns}`,
        `completed:${runner.summary.completedRunnerRuns}`,
        `stale:${runner.summary.staleRunnerRuns}`,
      ],
      nextAction: runner.runnerEventHealth.operatorQueue[0]?.nextAction || runner.nextBestAction,
      stopLine: 'Runner events must be sanitized summaries; reject cookies, tokens, captchas, private inbox content and customer identifiers.',
    },
    {
      id: 'signed-callback',
      label: 'Signed external receipt callback',
      status: acceptedReceipts > 0 ? 'done' : waitingReceipts > 0 ? 'waiting' : 'blocked',
      owner: 'runtime-admin',
      evidence: [
        `waitingReceipts:${waitingReceipts}`,
        `acceptedReceipts:${acceptedReceipts}`,
        `actionRequired:${lifecycle.summary.actionRequired}`,
      ],
      nextAction: lifecycle.stages.find(stage => stage.id === 'callback')?.nextAction || 'Require x-restaurant-agent-signature and externalRunId before closeout.',
      stopLine: 'Unsigned callbacks and unverifiable screenshots never close the run.',
    },
    {
      id: 'closeout',
      label: 'Closeout, memory and next loop',
      status: lifecycle.summary.canWriteMemory ? 'done' : acceptedReceipts > 0 ? 'ready' : 'waiting',
      owner: 'store-manager',
      evidence: [
        `canWriteMemory:${lifecycle.summary.canWriteMemory}`,
        `canUpdateOperatingInsight:${lifecycle.summary.canUpdateOperatingInsight}`,
        `businessSignals:${lifecycle.summary.businessSignalItems}`,
      ],
      nextAction: lifecycle.stages.find(stage => stage.id === 'next-loop')?.nextAction || 'Wait for accepted proof before memory and next-loop planning.',
      stopLine: 'Memory only stores accepted proof, aggregate counts, owner and next action; no growth claim without evidence.',
    },
  ];

  const summary = {
    steps: timeline.length,
    ready: statusCount(timeline, 'ready'),
    waiting: statusCount(timeline, 'waiting'),
    blocked: statusCount(timeline, 'blocked'),
    done: statusCount(timeline, 'done'),
    submitAllowed,
    runnerEvents: runner.summary.runnerEvents,
    waitingReceipts,
    acceptedReceipts,
    canCloseoutRun: acceptedReceipts > 0 && recoveryActions === 0,
    canWriteMemory: lifecycle.summary.canWriteMemory,
    canClaimExternalAutomation: false,
  } satisfies RestaurantProviderSandboxRunConsole['summary'];

  return {
    ok: true,
    payloadShape: 'restaurant-provider-sandbox-run-console-v1',
    generatedAt: now.toISOString(),
    restaurant: input.providerSandboxReadinessBoard.restaurant,
    offer: input.providerSandboxReadinessBoard.offer,
    verdict: verdictFor({
      blocked: summary.blocked,
      submitAllowed,
      runnerEvents: summary.runnerEvents,
      waitingReceipts,
      acceptedReceipts,
      recoveryActions,
    }),
    summary,
    selectedLane: {
      capabilityId: selectedRow?.capabilityId || 'unknown',
      packageId: selectedRow?.selectedPackageId,
      status: selectedRow?.status || 'blocked-provider',
      owner: selectedRow?.owner || 'ops',
      nextAction: selectedRow?.nextAction || 'Complete readiness before sandbox submit.',
    },
    timeline,
    closeoutChecklist: [
      {
        label: 'Sanitized package exists',
        status: selectedPackage?.safePayload ? 'done' : 'blocked',
        evidence: selectedPackage?.selectedPackageId || 'no package selected',
      },
      {
        label: 'Provider run recorded',
        status: runner.summary.externalRuns > 0 || submitAttempt?.summary.runRecorded ? 'done' : submitAllowed ? 'waiting' : 'blocked',
        evidence: submitAttempt?.selectedPackage?.selectedPackageId || `externalRuns:${runner.summary.externalRuns}`,
      },
      {
        label: 'Signed receipt accepted',
        status: acceptedReceipts > 0 ? 'done' : waitingReceipts > 0 ? 'waiting' : 'blocked',
        evidence: lifecycle.latestReceipt?.receiptId || `waiting:${waitingReceipts}`,
      },
      {
        label: 'Memory write allowed',
        status: lifecycle.summary.canWriteMemory ? 'done' : 'waiting',
        evidence: lifecycle.memoryWriteRule.allowed ? lifecycle.memoryWriteRule.writes.join(' / ') : 'blocked until accepted proof',
      },
    ],
    operatorCommands: unique([
      submitAllowed ? `Submit package ${selectedRow?.selectedPackageId || 'selected package'} to ${selectedPackage?.targetRuntime || input.providerSandboxSubmitWorkbench.targetRuntime}.` : selectedRow?.nextAction || '',
      runner.nextBestAction,
      lifecycle.stages.find(stage => stage.status !== 'done')?.nextAction || '',
      'Close only after signed receipt, public proof or sanitized aggregate receipt is accepted.',
    ], 6),
    providerCallbackContract: {
      endpoint: '/api/restaurant-agent/runtime',
      action: 'external-receipt',
      header: 'x-restaurant-agent-signature',
      acceptedEvidence: unique([
        ...(selectedRow?.evidenceRequired || []),
        ...(selectedPackage?.receiptExpectation || []),
        'eventId',
        'externalRunId',
        'operator summary',
      ], 10),
      forbiddenFields: [
        'api keys',
        'auth tokens',
        'cookies',
        'raw browser profile ids',
        'private-message text',
        'customer PII',
        'coupon codes',
        'payment ids',
        'raw POS rows',
      ],
    },
    externalRequired: unique([
      ...input.providerSandboxReadinessBoard.rows.flatMap(row => row.missing),
      ...input.providerSandboxSubmitWorkbench.externalRequired,
      ...runner.externalRequired,
      ...lifecycle.externalRequired,
    ], 12),
    safetyBoundary: 'Provider Sandbox Run Console is an observable control surface for sandbox dispatch, runner events, signed callback, receipt closeout and memory eligibility. It does not execute browser actions, publish content, contact customers, redeem coupons, read private messages, write POS records, expose secrets or claim production automation without accepted provider receipts and merchant-approved aggregate data contracts.',
  };
}

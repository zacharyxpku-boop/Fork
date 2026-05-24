import type { RestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';
import type { RestaurantRuntimeTarget } from '@/lib/restaurant-agent-runtime-bridge';
import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import type { RestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';
import { buildRestaurantProviderSandboxContract, type RestaurantProviderSandboxContract } from '@/lib/restaurant-provider-sandbox-contract';
import { buildRestaurantTaskProviderHandoff, type RestaurantTaskProviderHandoff, type RestaurantTaskProviderHandoffItem } from '@/lib/restaurant-task-provider-handoff';
import type { RestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';

export type RestaurantFirstForwardableRunStage = {
  id: 'task-ready' | 'package-safe' | 'runtime-health' | 'callback-contract' | 'receipt-inbox' | 'merchant-data-gates';
  status: 'passed' | 'blocked' | 'external-required';
  owner: 'ops' | 'runtime-admin' | 'merchant';
  evidence: string[];
  nextAction: string;
};

export type RestaurantFirstForwardableRunPack = {
  ok: true;
  payloadShape: 'restaurant-first-forwardable-run-pack-v1';
  generatedAt: string;
  target: RestaurantRuntimeTarget;
  verdict: 'ready-to-forward' | 'handoff-only' | 'setup-required';
  summary: {
    tasks: number;
    readyTasks: number;
    forwardable: number;
    handoffOnly: number;
    blockedPackages: number;
    passedStages: number;
    externalRequiredStages: number;
    blockedStages: number;
    canForwardFirstRun: boolean;
    canClaimAutomation: boolean;
  };
  selectedPackage?: {
    handoffId: string;
    taskMemoryId: string;
    packageId: string;
    runtimeTarget: RestaurantRuntimeTarget;
    requestedAction: string;
    canForward: boolean;
    blockedReasons: string[];
    callbackAction: 'external-receipt';
    callbackHeader: 'x-restaurant-agent-signature';
    safePayload: RestaurantTaskProviderHandoffItem['safePayload'];
  };
  stages: RestaurantFirstForwardableRunStage[];
  handoff: Pick<RestaurantTaskProviderHandoff, 'payloadShape' | 'summary' | 'providerContract' | 'operatorChecklist' | 'safetyBoundary'>;
  sandboxContract: Pick<RestaurantProviderSandboxContract, 'payloadShape' | 'verdict' | 'summary' | 'acceptanceContract' | 'safetyBoundary'>;
  receiptInbox?: Pick<RestaurantProviderReceiptInbox, 'payloadShape' | 'summary' | 'externalRequired' | 'safetyBoundary'>;
  operatorRunbook: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

function stage(input: RestaurantFirstForwardableRunStage): RestaurantFirstForwardableRunStage {
  return input;
}

function runtimeReady(target: RestaurantRuntimeTarget, probe?: RestaurantRuntimeProbe): boolean {
  return Boolean(probe?.targets.some(item => item.target === target && item.status === 'ready'));
}

function callbackReady(probe?: RestaurantRuntimeProbe, health?: RestaurantProviderReadinessHealth): boolean {
  return Boolean(
    probe?.gates.some(item => item.id === 'callback-secret' && item.status === 'ready')
    || health?.items.some(item => item.id === 'callback-secret' && item.status === 'health-ready'),
  );
}

function healthReady(health?: RestaurantProviderReadinessHealth): boolean {
  return Boolean(health?.summary.canEnableExternalAutomation);
}

function firstPackage(handoff: RestaurantTaskProviderHandoff): RestaurantTaskProviderHandoffItem | undefined {
  return handoff.packages.find(item => item.canForward)
    || handoff.packages[0]
    || handoff.blockedPackages[0];
}

function verdict(input: {
  selected?: RestaurantTaskProviderHandoffItem;
  handoff: RestaurantTaskProviderHandoff;
}): RestaurantFirstForwardableRunPack['verdict'] {
  if (input.selected?.canForward) return 'ready-to-forward';
  if (input.handoff.summary.handoffOnly > 0) return 'handoff-only';
  return 'setup-required';
}

export function buildRestaurantFirstForwardableRunPack(input: {
  queue: RestaurantStoreManagerTaskQueue;
  target?: RestaurantRuntimeTarget;
  env?: Record<string, string | undefined>;
  runtimeProbe?: RestaurantRuntimeProbe;
  providerReadinessHealth?: RestaurantProviderReadinessHealth;
  providerReceiptInbox?: RestaurantProviderReceiptInbox;
  now?: Date;
}): RestaurantFirstForwardableRunPack {
  const now = input.now || new Date();
  const target = input.target || 'openclaw';
  const handoff = buildRestaurantTaskProviderHandoff({
    queue: input.queue,
    target,
    env: input.env,
    now,
  });
  const selected = firstPackage(handoff);
  const sandboxContract = buildRestaurantProviderSandboxContract({
    runtimeProbe: input.runtimeProbe,
    providerReadinessHealth: input.providerReadinessHealth,
    taskProviderHandoff: handoff,
    providerReceiptInbox: input.providerReceiptInbox,
    now,
  });
  const stages = [
    stage({
      id: 'task-ready',
      status: handoff.summary.readyTasks > 0 ? 'passed' : 'blocked',
      owner: 'ops',
      evidence: [`readyTasks:${handoff.summary.readyTasks}`, `tasks:${handoff.summary.tasks}`],
      nextAction: handoff.summary.readyTasks > 0
        ? 'Use the first ready-for-provider task as the sandbox candidate.'
        : 'Move one store-manager task to ready-for-provider after owner evidence review.',
    }),
    stage({
      id: 'package-safe',
      status: selected?.canForward ? 'passed' : selected ? 'blocked' : 'external-required',
      owner: 'ops',
      evidence: selected ? [`package:${selected.executionPackage.packageId}`, `canForward:${selected.canForward}`] : ['no provider package selected'],
      nextAction: selected?.canForward
        ? 'Forward only the sanitized executionPackage and safePayload.'
        : selected?.blockedReasons[0] || 'Build a task provider handoff package first.',
    }),
    stage({
      id: 'runtime-health',
      status: runtimeReady(target, input.runtimeProbe) || selected?.canForward ? 'passed' : input.runtimeProbe ? 'external-required' : 'blocked',
      owner: 'runtime-admin',
      evidence: input.runtimeProbe?.targets.map(item => `${item.target}:${item.status}`) || [selected?.canForward ? 'execution package has runtime env configured' : 'runtime probe not run'],
      nextAction: runtimeReady(target, input.runtimeProbe) || selected?.canForward
        ? 'Keep runtime health attached to the first forwardable run evidence.'
        : 'Configure and probe the selected Lobu/OpenClaw/Hermes runtime before forwarding.',
    }),
    stage({
      id: 'callback-contract',
      status: callbackReady(input.runtimeProbe, input.providerReadinessHealth) || selected?.canForward ? 'passed' : 'external-required',
      owner: 'runtime-admin',
      evidence: ['callback action:external-receipt', 'header:x-restaurant-agent-signature'],
      nextAction: callbackReady(input.runtimeProbe, input.providerReadinessHealth) || selected?.canForward
        ? 'Require the provider to return a signed external-receipt callback.'
        : 'Configure callback secret and verify signature handling before closing any run.',
    }),
    stage({
      id: 'receipt-inbox',
      status: input.providerReceiptInbox?.summary.accepted ? 'passed' : input.providerReceiptInbox?.summary.total ? 'blocked' : 'external-required',
      owner: 'ops',
      evidence: input.providerReceiptInbox ? [`requests:${input.providerReceiptInbox.summary.total}`, `actionRequired:${input.providerReceiptInbox.summary.actionRequired}`] : ['provider receipt inbox has no run yet'],
      nextAction: input.providerReceiptInbox?.summary.accepted
        ? 'Use accepted receipt for run health and post-run review.'
        : 'After forwarding, wait for signed receipt or import public proof manually.',
    }),
    stage({
      id: 'merchant-data-gates',
      status: healthReady(input.providerReadinessHealth) ? 'passed' : input.providerReadinessHealth ? 'external-required' : 'blocked',
      owner: 'merchant',
      evidence: input.providerReadinessHealth ? [`score:${input.providerReadinessHealth.summary.readinessScore}`, `ready:${input.providerReadinessHealth.summary.healthReady}`] : ['provider readiness health not run'],
      nextAction: healthReady(input.providerReadinessHealth)
        ? 'Automation can be tested in sandbox, but every production claim still needs accepted evidence.'
        : 'Collect merchant platform authorization and aggregate POS/data contracts before production automation claims.',
    }),
  ];
  const passedStages = stages.filter(item => item.status === 'passed').length;
  const externalRequiredStages = stages.filter(item => item.status === 'external-required').length;
  const blockedStages = stages.filter(item => item.status === 'blocked').length;

  return {
    ok: true,
    payloadShape: 'restaurant-first-forwardable-run-pack-v1',
    generatedAt: now.toISOString(),
    target,
    verdict: verdict({ selected, handoff }),
    summary: {
      tasks: handoff.summary.tasks,
      readyTasks: handoff.summary.readyTasks,
      forwardable: handoff.summary.forwardable,
      handoffOnly: handoff.summary.handoffOnly,
      blockedPackages: handoff.summary.blocked,
      passedStages,
      externalRequiredStages,
      blockedStages,
      canForwardFirstRun: Boolean(selected?.canForward),
      canClaimAutomation: sandboxContract.summary.canClaimAutomation,
    },
    selectedPackage: selected ? {
      handoffId: selected.handoffId,
      taskMemoryId: selected.taskMemoryId,
      packageId: selected.executionPackage.packageId,
      runtimeTarget: selected.runtimeTarget,
      requestedAction: selected.requestedAction,
      canForward: selected.canForward,
      blockedReasons: selected.blockedReasons,
      callbackAction: 'external-receipt',
      callbackHeader: 'x-restaurant-agent-signature',
      safePayload: selected.safePayload,
    } : undefined,
    stages,
    handoff: {
      payloadShape: handoff.payloadShape,
      summary: handoff.summary,
      providerContract: handoff.providerContract,
      operatorChecklist: handoff.operatorChecklist,
      safetyBoundary: handoff.safetyBoundary,
    },
    sandboxContract: {
      payloadShape: sandboxContract.payloadShape,
      verdict: sandboxContract.verdict,
      summary: sandboxContract.summary,
      acceptanceContract: sandboxContract.acceptanceContract,
      safetyBoundary: sandboxContract.safetyBoundary,
    },
    receiptInbox: input.providerReceiptInbox ? {
      payloadShape: input.providerReceiptInbox.payloadShape,
      summary: input.providerReceiptInbox.summary,
      externalRequired: input.providerReceiptInbox.externalRequired,
      safetyBoundary: input.providerReceiptInbox.safetyBoundary,
    } : undefined,
    operatorRunbook: [
      'Pick one ready-for-provider task only after owner evidence review.',
      'Forward only selectedPackage.safePayload plus the sanitized execution package; never send keys, cookies, browser profile ids, private messages or POS rows.',
      'Require x-restaurant-agent-signature and external-receipt fields before closing the run.',
      'If provider forwarding is blocked, keep the task in manual proof mode and attach public link/screenshot evidence.',
    ],
    externalRequired: Array.from(new Set(stages.filter(item => item.status !== 'passed').map(item => item.nextAction))).slice(0, 10),
    safetyBoundary: 'First Forwardable Run Pack is a preflight and handoff plan. It does not call external runtimes, log in, publish, contact customers, redeem coupons, read private messages, pull raw POS rows, expose secrets, or close any task without signed/public evidence.',
  };
}

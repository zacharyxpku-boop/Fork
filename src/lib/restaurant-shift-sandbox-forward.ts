import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
import type { RestaurantRuntimeBridgeResult } from '@/lib/restaurant-agent-runtime-bridge';
import type { RestaurantShiftFirstForwardableRun } from '@/lib/restaurant-shift-first-forwardable-run';
import type { RestaurantTaskProviderHandoff, RestaurantTaskProviderHandoffItem } from '@/lib/restaurant-task-provider-handoff';

export type RestaurantShiftSandboxForwardAttempt = {
  ok: boolean;
  payloadShape: 'restaurant-shift-sandbox-forward-attempt-v1';
  generatedAt: string;
  verdict: 'forwarded-waiting-receipt' | 'blocked-before-dispatch' | 'provider-failed';
  summary: {
    canForwardFirstShiftRun: boolean;
    selectedPackageFound: boolean;
    bridgeStatus: RestaurantRuntimeBridgeResult['status'];
    runRecorded: boolean;
    canClaimExternalAutomation: false;
  };
  selectedPackage?: Pick<RestaurantTaskProviderHandoffItem, 'handoffId' | 'taskMemoryId' | 'status' | 'canForward' | 'runtimeTarget' | 'requestedAction' | 'safePayload' | 'blockedReasons' | 'nextAction'> & {
    packageId: string;
  };
  bridge: RestaurantRuntimeBridgeResult;
  run?: RestaurantAgentRunRecord;
  shiftFirstForwardableRun: Pick<RestaurantShiftFirstForwardableRun, 'payloadShape' | 'verdict' | 'summary' | 'selectedShiftRun' | 'externalRequired' | 'safetyBoundary'>;
  taskProviderHandoff: Pick<RestaurantTaskProviderHandoff, 'payloadShape' | 'summary' | 'providerContract' | 'safetyBoundary'>;
  receiptExpectation: {
    callbackAction: 'external-receipt';
    callbackHeader: 'x-restaurant-agent-signature';
    acceptedEvidence: string[];
    closeoutRule: string;
  };
  recoveryNextAction: string;
  safetyBoundary: string;
};

export function selectShiftForwardPackage(input: {
  shiftFirstForwardableRun: RestaurantShiftFirstForwardableRun;
  taskProviderHandoff: RestaurantTaskProviderHandoff;
}): RestaurantTaskProviderHandoffItem | undefined {
  const packageId = input.shiftFirstForwardableRun.selectedPackage?.packageId;
  return input.taskProviderHandoff.packages.find(item => item.executionPackage.packageId === packageId)
    || input.taskProviderHandoff.blockedPackages.find(item => item.executionPackage.packageId === packageId)
    || input.taskProviderHandoff.packages[0]
    || input.taskProviderHandoff.blockedPackages[0];
}

export function blockedShiftSandboxBridge(input: {
  shiftFirstForwardableRun: RestaurantShiftFirstForwardableRun;
  selectedPackage?: RestaurantTaskProviderHandoffItem;
}): RestaurantRuntimeBridgeResult {
  const target = input.selectedPackage?.runtimeTarget || input.shiftFirstForwardableRun.selectedPackage?.runtimeTarget || 'openclaw';
  const blockedReasons = [
    input.shiftFirstForwardableRun.summary.canForwardFirstShiftRun ? '' : `Shift first forwardable run is ${input.shiftFirstForwardableRun.verdict}.`,
    ...(input.selectedPackage?.blockedReasons || []),
    input.selectedPackage ? '' : 'No task provider package is selected.',
  ].filter(Boolean);
  return {
    ok: false,
    target,
    status: 'blocked',
    message: blockedReasons[0] || 'Shift sandbox forward is blocked before provider dispatch.',
    audit: {
      secretExposed: false,
      payloadShape: 'restaurant-agent-external-execution-v1',
      packageId: input.selectedPackage?.executionPackage.packageId || input.shiftFirstForwardableRun.selectedPackage?.packageId,
      canForward: false,
      blockedReasons,
      blockedActions: input.selectedPackage?.executionPackage.executionPolicy.blockedRuntimeActions || [],
    },
  };
}

function verdict(bridge: RestaurantRuntimeBridgeResult): RestaurantShiftSandboxForwardAttempt['verdict'] {
  if (bridge.status === 'forwarded') return 'forwarded-waiting-receipt';
  if (bridge.status === 'failed') return 'provider-failed';
  return 'blocked-before-dispatch';
}

export function buildRestaurantShiftSandboxForwardAttempt(input: {
  shiftFirstForwardableRun: RestaurantShiftFirstForwardableRun;
  taskProviderHandoff: RestaurantTaskProviderHandoff;
  bridge: RestaurantRuntimeBridgeResult;
  selectedPackage?: RestaurantTaskProviderHandoffItem;
  run?: RestaurantAgentRunRecord;
  now?: Date;
}): RestaurantShiftSandboxForwardAttempt {
  const now = input.now || new Date();
  const selectedPackage = input.selectedPackage;
  const bridgeVerdict = verdict(input.bridge);

  return {
    ok: input.bridge.ok,
    payloadShape: 'restaurant-shift-sandbox-forward-attempt-v1',
    generatedAt: now.toISOString(),
    verdict: bridgeVerdict,
    summary: {
      canForwardFirstShiftRun: input.shiftFirstForwardableRun.summary.canForwardFirstShiftRun,
      selectedPackageFound: Boolean(selectedPackage),
      bridgeStatus: input.bridge.status,
      runRecorded: Boolean(input.run),
      canClaimExternalAutomation: false,
    },
    selectedPackage: selectedPackage ? {
      handoffId: selectedPackage.handoffId,
      taskMemoryId: selectedPackage.taskMemoryId,
      packageId: selectedPackage.executionPackage.packageId,
      status: selectedPackage.status,
      canForward: selectedPackage.canForward,
      runtimeTarget: selectedPackage.runtimeTarget,
      requestedAction: selectedPackage.requestedAction,
      safePayload: selectedPackage.safePayload,
      blockedReasons: selectedPackage.blockedReasons,
      nextAction: selectedPackage.nextAction,
    } : undefined,
    bridge: input.bridge,
    run: input.run,
    shiftFirstForwardableRun: {
      payloadShape: input.shiftFirstForwardableRun.payloadShape,
      verdict: input.shiftFirstForwardableRun.verdict,
      summary: input.shiftFirstForwardableRun.summary,
      selectedShiftRun: input.shiftFirstForwardableRun.selectedShiftRun,
      externalRequired: input.shiftFirstForwardableRun.externalRequired,
      safetyBoundary: input.shiftFirstForwardableRun.safetyBoundary,
    },
    taskProviderHandoff: {
      payloadShape: input.taskProviderHandoff.payloadShape,
      summary: input.taskProviderHandoff.summary,
      providerContract: input.taskProviderHandoff.providerContract,
      safetyBoundary: input.taskProviderHandoff.safetyBoundary,
    },
    receiptExpectation: {
      callbackAction: 'external-receipt',
      callbackHeader: 'x-restaurant-agent-signature',
      acceptedEvidence: ['public proof URL', 'screenshot id', 'externalRunId', 'operator summary'],
      closeoutRule: 'Do not close the task or claim external automation until a signed callback or public proof receipt is accepted.',
    },
    recoveryNextAction: bridgeVerdict === 'forwarded-waiting-receipt'
      ? 'Watch the provider receipt inbox and run recovery if no signed/public receipt arrives.'
      : input.bridge.message,
    safetyBoundary: 'Shift Sandbox Forward Attempt is the only shift path allowed to call a runtime bridge. It sends sanitized execution packages only; it never exposes API key values, cookies, tokens, raw browser profile ids, private messages, customer identifiers, coupon codes, payment ids or raw POS rows, and it cannot claim production automation without accepted receipts.',
  };
}

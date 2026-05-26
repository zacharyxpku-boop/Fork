import type { RestaurantRuntimeBridgeResult } from '@/lib/restaurant-agent-runtime-bridge';
import type { RestaurantProviderLiveRunGate } from '@/lib/restaurant-provider-live-run-gate';

export type RestaurantProviderLiveRunLaunchAttempt = {
  ok: true;
  payloadShape: 'restaurant-provider-live-run-launch-attempt-v1';
  generatedAt: string;
  verdict:
    | 'forward-real-provider-now'
    | 'forward-supervised-browser-now'
    | 'run-simulator-only'
    | 'already-waiting-receipt'
    | 'already-closeout-ready'
    | 'blocked-before-launch';
  summary: {
    launchMode: RestaurantProviderLiveRunGate['firstLiveAction']['mode'];
    canForwardNow: boolean;
    bridgeForwarded: boolean;
    runMustStayOpenUntilReceipt: boolean;
    canClaimExternalAutomation: false;
  };
  selected: {
    providerTarget: string;
    packageId: string;
    gatewayId: string;
    endpoint: string;
    bodyShape: RestaurantProviderLiveRunGate['firstLiveAction']['bodyShape'];
  };
  operatorDecision: {
    primaryAction: string;
    blockedBy?: RestaurantProviderLiveRunGate['launchChecklist'][number]['id'];
    owner: RestaurantProviderLiveRunGate['launchChecklist'][number]['owner'];
    evidenceRequired: string[];
    stopLine: string;
  };
  bridgeAttempt?: Pick<RestaurantRuntimeBridgeResult, 'ok' | 'target' | 'status' | 'endpoint' | 'externalRunId' | 'message' | 'audit'>;
  closeoutExpectation: {
    callbackAction: 'external-receipt';
    callbackHeader: 'x-restaurant-agent-signature';
    acceptedResult: string[];
    memoryRule: string;
  };
  externalRequired: string[];
  safetyBoundary: string;
};

function firstBlockingGate(gate: RestaurantProviderLiveRunGate) {
  return gate.launchChecklist.find(item => item.id !== 'claim-boundary' && item.status === 'blocked')
    || gate.launchChecklist.find(item => item.id !== 'claim-boundary' && item.status === 'waiting')
    || gate.launchChecklist.find(item => item.id === 'claim-boundary');
}

function verdictFor(input: {
  gate: RestaurantProviderLiveRunGate;
  bridgeAttempt?: RestaurantRuntimeBridgeResult;
}): RestaurantProviderLiveRunLaunchAttempt['verdict'] {
  if (input.gate.verdict === 'accepted-closeout-ready') return 'already-closeout-ready';
  if (input.gate.verdict === 'waiting-provider-receipt') return 'already-waiting-receipt';
  if (input.bridgeAttempt?.status === 'forwarded') return 'forward-real-provider-now';
  if (input.gate.summary.canStartRealProviderNow) return 'forward-real-provider-now';
  if (input.gate.summary.canStartSupervisedBrowserNow) return 'forward-supervised-browser-now';
  if (input.gate.verdict === 'simulator-only') return 'run-simulator-only';
  return 'blocked-before-launch';
}

export function buildRestaurantProviderLiveRunLaunchAttempt(input: {
  providerLiveRunGate: RestaurantProviderLiveRunGate;
  bridgeAttempt?: RestaurantRuntimeBridgeResult;
  now?: Date;
}): RestaurantProviderLiveRunLaunchAttempt {
  const now = input.now || new Date();
  const gate = input.providerLiveRunGate;
  const verdict = verdictFor({ gate, bridgeAttempt: input.bridgeAttempt });
  const blocked = firstBlockingGate(gate);
  const canForwardNow = verdict === 'forward-real-provider-now' || verdict === 'forward-supervised-browser-now';

  const primaryAction = verdict === 'forward-real-provider-now'
    ? 'Submit exactly one sanitized provider package, then wait for signed external-receipt.'
    : verdict === 'forward-supervised-browser-now'
      ? 'Submit the browser gateway request and runbook id; stop on login, captcha, private data or unapproved page.'
      : verdict === 'run-simulator-only'
        ? 'Run the simulator path and collect the missing external Provider keys, merchant grant and callback setup.'
        : verdict === 'already-waiting-receipt'
          ? 'Do not resubmit; wait for the signed provider receipt or close the blocker.'
          : verdict === 'already-closeout-ready'
            ? 'Move the accepted receipt into post-run review and next-run training.'
            : blocked?.nextAction || 'Resolve the first blocking launch gate before attempting a live run.';

  return {
    ok: true,
    payloadShape: 'restaurant-provider-live-run-launch-attempt-v1',
    generatedAt: now.toISOString(),
    verdict,
    summary: {
      launchMode: gate.firstLiveAction.mode,
      canForwardNow,
      bridgeForwarded: input.bridgeAttempt?.status === 'forwarded',
      runMustStayOpenUntilReceipt: canForwardNow || verdict === 'already-waiting-receipt',
      canClaimExternalAutomation: false,
    },
    selected: {
      providerTarget: gate.selectedRun.providerTarget,
      packageId: gate.selectedRun.packageId,
      gatewayId: gate.selectedRun.gatewayId,
      endpoint: gate.firstLiveAction.endpoint,
      bodyShape: gate.firstLiveAction.bodyShape,
    },
    operatorDecision: {
      primaryAction,
      blockedBy: canForwardNow ? undefined : blocked?.id,
      owner: blocked?.owner || 'ops',
      evidenceRequired: canForwardNow
        ? gate.firstLiveAction.acceptedResult
        : blocked?.evidence.length ? blocked.evidence : gate.externalRequired.slice(0, 5),
      stopLine: canForwardNow
        ? 'No success claim until signed receipt is accepted.'
        : blocked?.stopLine || 'No live launch without satisfying Provider gates.',
    },
    bridgeAttempt: input.bridgeAttempt ? {
      ok: input.bridgeAttempt.ok,
      target: input.bridgeAttempt.target,
      status: input.bridgeAttempt.status,
      endpoint: input.bridgeAttempt.endpoint,
      externalRunId: input.bridgeAttempt.externalRunId,
      message: input.bridgeAttempt.message,
      audit: input.bridgeAttempt.audit,
    } : undefined,
    closeoutExpectation: {
      callbackAction: gate.selectedRun.callbackAction,
      callbackHeader: gate.selectedRun.callbackHeader,
      acceptedResult: gate.firstLiveAction.acceptedResult,
      memoryRule: 'Only accepted signed receipt and sanitized aggregate counts can train the next run.',
    },
    externalRequired: canForwardNow
      ? ['signed external-receipt callback', 'public proof URL or screenshot id', 'accepted provider closeout']
      : gate.externalRequired,
    safetyBoundary: 'Provider Live Run Launch Attempt is a launch decision record. It does not invent execution, auto-publish, contact customers, redeem coupons, read private messages, expose secrets, pull raw POS rows or claim production automation. A run remains open until a signed external receipt is accepted.',
  };
}

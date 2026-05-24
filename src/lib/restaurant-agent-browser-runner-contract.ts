import { buildRestaurantBrowserRunbookPackage, type RestaurantBrowserRunbookPackage, type RestaurantBrowserRunbookStepType } from '@/lib/restaurant-agent-browser-runbook';
import type { RestaurantBrowserRuntimeTarget } from '@/lib/restaurant-agent-browser-session';

export type RestaurantBrowserRunnerEventType = 'run-started' | 'step-completed' | 'step-blocked' | 'run-failed' | 'run-completed';

export type RestaurantBrowserRunnerEventRule = {
  type: RestaurantBrowserRunnerEventType;
  requiredFields: string[];
  writesTo: 'audit-only' | 'recovery' | 'signed-receipt' | 'watcher';
  retryable: boolean;
  nextAction: string;
};

export type RestaurantBrowserRunnerStepRule = {
  stepId: string;
  order: number;
  type: RestaurantBrowserRunbookStepType;
  callbackEvent: RestaurantBrowserRunnerEventType;
  retryable: boolean;
  maxAttempts: number;
  evidenceRequired: string[];
  blockedEscalation: string;
};

export type RestaurantBrowserRunnerCallbackContract = {
  ok: true;
  payloadShape: 'restaurant-browser-runner-callback-contract-v1';
  contractId: string;
  runtimeTarget: RestaurantBrowserRuntimeTarget;
  runbook: Pick<RestaurantBrowserRunbookPackage, 'runbookId' | 'payloadShape' | 'canExecuteNow' | 'allowedDomains' | 'callback' | 'audit'>;
  canAcceptSignedFinalReceipt: boolean;
  stepEventEndpoint: {
    endpoint: '/api/restaurant-agent/runtime';
    action: 'external-receipt';
    mode: 'final-receipt-only';
    requiredHeader: 'x-restaurant-agent-signature';
  };
  eventRules: RestaurantBrowserRunnerEventRule[];
  stepRules: RestaurantBrowserRunnerStepRule[];
  idempotency: {
    keyFields: string[];
    duplicatePolicy: string;
  };
  recoveryPolicy: {
    retryBudget: number;
    backoff: string;
    stopAndEscalateWhen: string[];
  };
  externalSetupRequired: string[];
  handoff: {
    safeToSendToRunner: boolean;
    secretsIncluded: false;
    nextAction: string;
  };
  audit: {
    secretsIncluded: false;
    rawBrowserProfileIncluded: false;
    privateDataIncluded: false;
    fakeExecutionIncluded: false;
  };
  safetyBoundary: string;
};

type EnvMap = Record<string, string | undefined>;

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 47 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function setupRequired(runbook: RestaurantBrowserRunbookPackage): string[] {
  return [
    !runbook.session.runtime.urlConfigured ? `${runbook.runtimeTarget} runtime URL` : '',
    !runbook.session.runtime.configured ? `${runbook.runtimeTarget} runtime API key` : '',
    !runbook.session.profile.configured ? 'isolated browser profile' : '',
    !runbook.session.runtime.callbackSecretConfigured ? 'signed callback secret' : '',
    'merchant grant and approved target URL',
  ].filter(Boolean);
}

function eventRules(canAcceptSignedFinalReceipt: boolean): RestaurantBrowserRunnerEventRule[] {
  return [
    {
      type: 'run-started',
      requiredFields: ['eventId', 'externalRunId', 'runtimeTarget'],
      writesTo: 'audit-only',
      retryable: false,
      nextAction: 'Keep waiting for governed step events or final signed receipt.',
    },
    {
      type: 'step-completed',
      requiredFields: ['eventId', 'externalRunId', 'stepId', 'evidenceSummary'],
      writesTo: 'audit-only',
      retryable: false,
      nextAction: 'Continue the ordered runbook until capture/extract/callback or a stop condition appears.',
    },
    {
      type: 'step-blocked',
      requiredFields: ['eventId', 'externalRunId', 'stepId', 'blockedReason', 'nextAction'],
      writesTo: 'recovery',
      retryable: false,
      nextAction: 'Stop runner activity and route the blocked reason into recovery and operator queue.',
    },
    {
      type: 'run-failed',
      requiredFields: ['eventId', 'externalRunId', 'failedReason', 'nextAction'],
      writesTo: 'recovery',
      retryable: true,
      nextAction: 'Retry only after runtime health and authorization are still valid; otherwise move to manual fallback.',
    },
    {
      type: 'run-completed',
      requiredFields: canAcceptSignedFinalReceipt
        ? ['eventId', 'channel', 'externalRunId or screenshotId or evidenceUrl', 'summary']
        : ['eventId', 'blockedReason', 'nextAction'],
      writesTo: canAcceptSignedFinalReceipt ? 'signed-receipt' : 'watcher',
      retryable: false,
      nextAction: canAcceptSignedFinalReceipt
        ? 'Write the final signed external-receipt, then run health, watcher and business signals can advance.'
        : 'Hold as handoff-only until callback secret is configured; do not mark execution complete.',
    },
  ];
}

function stepRules(runbook: RestaurantBrowserRunbookPackage): RestaurantBrowserRunnerStepRule[] {
  return runbook.steps.map(step => {
    const terminal = step.type === 'callback' || step.type === 'stop';
    const retryable = step.type === 'navigate' || step.type === 'capture' || step.type === 'extract';
    return {
      stepId: step.id,
      order: step.order,
      type: step.type,
      callbackEvent: terminal ? 'run-completed' : 'step-completed',
      retryable,
      maxAttempts: retryable ? 2 : 1,
      evidenceRequired: step.expectedEvidence,
      blockedEscalation: step.stopIf.slice(0, 3).join(' / ') || 'manual operator review',
    };
  });
}

export function buildRestaurantBrowserRunnerCallbackContract(input: {
  runtimeTarget?: RestaurantBrowserRuntimeTarget;
  eventId?: string;
  restaurant?: string;
  offer?: string;
  channel?: string;
  targetUrl?: string;
  allowedDomains?: string[];
  env?: EnvMap;
} = {}): RestaurantBrowserRunnerCallbackContract {
  const runbook = buildRestaurantBrowserRunbookPackage(input);
  const canAcceptSignedFinalReceipt = runbook.session.runtime.callbackSecretConfigured;
  const missing = setupRequired(runbook);

  return {
    ok: true,
    payloadShape: 'restaurant-browser-runner-callback-contract-v1',
    contractId: `restaurant-browser-runner-contract-${stableId([runbook.runbookId, runbook.runtimeTarget, String(canAcceptSignedFinalReceipt)])}`,
    runtimeTarget: runbook.runtimeTarget,
    runbook: {
      runbookId: runbook.runbookId,
      payloadShape: runbook.payloadShape,
      canExecuteNow: runbook.canExecuteNow,
      allowedDomains: runbook.allowedDomains,
      callback: runbook.callback,
      audit: runbook.audit,
    },
    canAcceptSignedFinalReceipt,
    stepEventEndpoint: {
      endpoint: '/api/restaurant-agent/runtime',
      action: 'external-receipt',
      mode: 'final-receipt-only',
      requiredHeader: runbook.callback.requiredHeader,
    },
    eventRules: eventRules(canAcceptSignedFinalReceipt),
    stepRules: stepRules(runbook),
    idempotency: {
      keyFields: ['eventId', 'externalRunId', 'stepId or evidenceUrl or screenshotId'],
      duplicatePolicy: 'Duplicate runner callbacks must update audit/recovery state only once; final receipts still pass receipt evidence duplicate checks.',
    },
    recoveryPolicy: {
      retryBudget: 2,
      backoff: 'operator-reviewed retry; never loop platform actions automatically',
      stopAndEscalateWhen: [
        'login or captcha appears',
        'merchant grant missing or expired',
        'private inbox content or customer identifier appears',
        'callback signature missing or rejected',
        'platform policy warning appears',
      ],
    },
    externalSetupRequired: missing,
    handoff: {
      safeToSendToRunner: runbook.handoff.safeToSendToExternalRuntime,
      secretsIncluded: false,
      nextAction: missing.length
        ? `Resolve setup first: ${missing.join(' / ')}.`
        : 'Forward the runbook and require final signed external-receipt before run health moves to accepted.',
    },
    audit: {
      secretsIncluded: false,
      rawBrowserProfileIncluded: false,
      privateDataIncluded: false,
      fakeExecutionIncluded: false,
    },
    safetyBoundary: 'This contract governs external browser-runner callbacks. It does not create a platform login, bypass captcha, auto-publish without approval, read private messages, write redemptions, pull POS data or fabricate completion.',
  };
}

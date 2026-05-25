import type { RestaurantExecutionPackage } from '@/lib/restaurant-agent-execution-package';
import type { RestaurantRuntimeTarget } from '@/lib/restaurant-agent-runtime-bridge';
import type { RestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';

export type RestaurantRuntimeAdapterSpec = {
  target: RestaurantRuntimeTarget;
  endpointPath: '/events' | '/tasks' | '/runs';
  submitAction: string;
  acceptedRunIdFields: string[];
  healthPath: '/health';
  callbackAction: 'external-receipt';
  callbackHeader: 'x-restaurant-agent-signature';
  providerExpectation: string;
};

export type RestaurantRuntimeAdapterCheck = {
  id: 'endpoint' | 'auth' | 'payload' | 'response' | 'callback' | 'receipt' | 'secret-boundary';
  status: 'ready' | 'missing' | 'blocked';
  owner: 'runtime-admin' | 'provider' | 'ops';
  evidence: string[];
  nextAction: string;
};

export type RestaurantRuntimeAdapterContract = {
  ok: true;
  payloadShape: 'restaurant-runtime-adapter-contract-v1';
  generatedAt: string;
  target: RestaurantRuntimeTarget;
  verdict: 'adapter-ready' | 'needs-runtime-config' | 'needs-package' | 'needs-callback-proof';
  summary: {
    checks: number;
    ready: number;
    missing: number;
    blocked: number;
    canSubmitSandbox: boolean;
    canClaimExternalAutomation: false;
  };
  adapterSpec: RestaurantRuntimeAdapterSpec;
  requestContract: {
    method: 'POST';
    authHeader: 'Authorization: Bearer <server-side-runtime-api-key>';
    contentType: 'application/json';
    bodyShape: 'restaurant-agent-external-execution-v1';
    requiredTopLevelFields: string[];
    forbiddenFields: string[];
  };
  responseContract: {
    acceptedStatuses: number[];
    runIdFields: string[];
    failureHandling: string[];
  };
  callbackContract: {
    endpoint: '/api/restaurant-agent/runtime';
    action: 'external-receipt';
    header: 'x-restaurant-agent-signature';
    requiredReceiptFields: string[];
    acceptedEvidence: string[];
  };
  checks: RestaurantRuntimeAdapterCheck[];
  sandboxScript: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

const SPECS: Record<RestaurantRuntimeTarget, RestaurantRuntimeAdapterSpec> = {
  lobu: {
    target: 'lobu',
    endpointPath: '/events',
    submitAction: 'create_event',
    acceptedRunIdFields: ['runId', 'eventId', 'id'],
    healthPath: '/health',
    callbackAction: 'external-receipt',
    callbackHeader: 'x-restaurant-agent-signature',
    providerExpectation: 'Lobu-compatible runtime accepts event packages and returns a stable runId/eventId.',
  },
  openclaw: {
    target: 'openclaw',
    endpointPath: '/tasks',
    submitAction: 'create_task',
    acceptedRunIdFields: ['runId', 'taskId', 'id'],
    healthPath: '/health',
    callbackAction: 'external-receipt',
    callbackHeader: 'x-restaurant-agent-signature',
    providerExpectation: 'OpenClaw-style runtime accepts governed task packages and returns runId/taskId.',
  },
  hermes: {
    target: 'hermes',
    endpointPath: '/runs',
    submitAction: 'create_run',
    acceptedRunIdFields: ['runId', 'id'],
    healthPath: '/health',
    callbackAction: 'external-receipt',
    callbackHeader: 'x-restaurant-agent-signature',
    providerExpectation: 'Hermes-style runtime accepts persistent run packages and returns runId/id.',
  },
};

function probeEvidence(probe: RestaurantRuntimeProbe | undefined, target: RestaurantRuntimeTarget) {
  const item = probe?.targets.find(candidate => candidate.target === target);
  if (!item) return { ready: false, evidence: [`${target}: no runtime probe result`] };
  return {
    ready: item.status === 'ready',
    evidence: [`${target}:${item.status}`, item.endpoint ? `endpoint:${item.endpoint}` : '', item.statusCode ? `status:${item.statusCode}` : ''].filter(Boolean),
  };
}

function check(input: RestaurantRuntimeAdapterCheck): RestaurantRuntimeAdapterCheck {
  return input;
}

function verdict(input: {
  hasPackage: boolean;
  canForward: boolean;
  callbackReady: boolean;
  runtimeReady: boolean;
}): RestaurantRuntimeAdapterContract['verdict'] {
  if (!input.runtimeReady) return 'needs-runtime-config';
  if (!input.hasPackage || !input.canForward) return 'needs-package';
  if (!input.callbackReady) return 'needs-callback-proof';
  return 'adapter-ready';
}

export function buildRestaurantRuntimeAdapterContract(input: {
  target?: RestaurantRuntimeTarget;
  executionPackage?: RestaurantExecutionPackage;
  runtimeProbe?: RestaurantRuntimeProbe;
  now?: Date;
} = {}): RestaurantRuntimeAdapterContract {
  const now = input.now || new Date();
  const target = input.target || input.executionPackage?.target || 'openclaw';
  const spec = SPECS[target];
  const probe = probeEvidence(input.runtimeProbe, target);
  const executionPackage = input.executionPackage;
  const hasPackage = Boolean(executionPackage);
  const canForward = Boolean(executionPackage?.canForward);
  const callbackReady = Boolean(executionPackage?.browserSession.runtime.callbackSecretConfigured);
  const safePackage = Boolean(executionPackage?.audit.packageSafeToSend && !executionPackage.audit.secretsIncluded && !executionPackage.audit.privateDataIncluded && !executionPackage.audit.browserProfileExposed);
  const requiredReceiptFields = executionPackage?.runtimeContract.requiredReceiptFields || ['eventId', 'channel', 'summary', 'operator', 'signalType'];
  const checks = [
    check({
      id: 'endpoint',
      status: probe.ready ? 'ready' : 'missing',
      owner: 'runtime-admin',
      evidence: probe.evidence,
      nextAction: probe.ready ? 'Keep endpoint in health checks before each sandbox submit.' : `Configure ${target} runtime URL/API key and verify ${spec.healthPath}.`,
    }),
    check({
      id: 'auth',
      status: hasPackage && executionPackage!.status !== 'blocked' ? 'ready' : 'missing',
      owner: 'runtime-admin',
      evidence: [`package:${executionPackage?.packageId || 'none'}`, `status:${executionPackage?.status || 'none'}`],
      nextAction: hasPackage ? 'Keep API key server-side; never place it in payloads or browser state.' : 'Build an execution package from a governed task before adapter submit.',
    }),
    check({
      id: 'payload',
      status: hasPackage && safePackage ? 'ready' : 'blocked',
      owner: 'ops',
      evidence: [
        `shape:${executionPackage?.payloadShape || 'none'}`,
        `canForward:${canForward}`,
        `safe:${safePackage}`,
      ],
      nextAction: safePackage ? 'Submit only this sanitized execution package shape.' : 'Remove secrets, private data, raw browser profiles and blocked actions before submit.',
    }),
    check({
      id: 'response',
      status: hasPackage ? 'ready' : 'missing',
      owner: 'provider',
      evidence: [`accepted:${spec.acceptedRunIdFields.join('|')}`, 'status:200/201/202'],
      nextAction: `Provider must return one of ${spec.acceptedRunIdFields.join(', ')} and a non-2xx response must be treated as failed.`,
    }),
    check({
      id: 'callback',
      status: callbackReady ? 'ready' : 'missing',
      owner: 'runtime-admin',
      evidence: [`header:${spec.callbackHeader}`, `action:${spec.callbackAction}`, `callbackReady:${callbackReady}`],
      nextAction: callbackReady ? 'Require HMAC signed external-receipt callback for closeout.' : 'Configure RESTAURANT_AGENT_CALLBACK_SECRET server-side before sandbox submit.',
    }),
    check({
      id: 'receipt',
      status: callbackReady ? 'ready' : 'missing',
      owner: 'provider',
      evidence: requiredReceiptFields.slice(0, 8),
      nextAction: 'Provider must return public proof URL/screenshot/externalRunId plus sanitized summary and aggregate signal type.',
    }),
    check({
      id: 'secret-boundary',
      status: safePackage ? 'ready' : 'blocked',
      owner: 'ops',
      evidence: ['secretExposed:false', 'privateDataIncluded:false', 'browserProfileExposed:false'],
      nextAction: 'Reject any adapter payload containing API keys, cookies, tokens, raw profile ids, private messages, coupon codes, payment ids or raw POS rows.',
    }),
  ];
  const ready = checks.filter(item => item.status === 'ready').length;
  const missing = checks.filter(item => item.status === 'missing').length;
  const blocked = checks.filter(item => item.status === 'blocked').length;

  return {
    ok: true,
    payloadShape: 'restaurant-runtime-adapter-contract-v1',
    generatedAt: now.toISOString(),
    target,
    verdict: verdict({
      hasPackage,
      canForward,
      callbackReady,
      runtimeReady: probe.ready,
    }),
    summary: {
      checks: checks.length,
      ready,
      missing,
      blocked,
      canSubmitSandbox: probe.ready && canForward && callbackReady && blocked === 0,
      canClaimExternalAutomation: false,
    },
    adapterSpec: spec,
    requestContract: {
      method: 'POST',
      authHeader: 'Authorization: Bearer <server-side-runtime-api-key>',
      contentType: 'application/json',
      bodyShape: 'restaurant-agent-external-execution-v1',
      requiredTopLevelFields: ['packageId', 'target', 'requestedAction', 'dispatch', 'browserSession', 'grantManifest', 'runtimeContract', 'executionPolicy', 'audit'],
      forbiddenFields: ['apiKey', 'secret', 'cookie', 'token', 'rawBrowserProfileId', 'privateMessages', 'customerIdentifiers', 'couponCodes', 'paymentIds', 'rawPosRows'],
    },
    responseContract: {
      acceptedStatuses: [200, 201, 202],
      runIdFields: spec.acceptedRunIdFields,
      failureHandling: [
        'Non-2xx response becomes provider-failed and must not create an accepted receipt.',
        'Missing run id keeps the run waiting for receipt and recovery.',
        'Provider completion is not trusted until signed callback or public proof receipt is accepted.',
      ],
    },
    callbackContract: {
      endpoint: '/api/restaurant-agent/runtime',
      action: 'external-receipt',
      header: spec.callbackHeader,
      requiredReceiptFields,
      acceptedEvidence: ['public proof URL', 'screenshot id', 'externalRunId', 'operator summary', 'sanitized aggregate signal type'],
    },
    checks,
    sandboxScript: [
      `POST sanitized package to ${target}${spec.endpointPath} using server-side bearer auth.`,
      `Accept response only when HTTP status is 200/201/202 and one run id field exists: ${spec.acceptedRunIdFields.join(', ')}.`,
      'Record forwarded run as waiting-receipt; do not mark outcome complete from submit response alone.',
      'Close only after signed external-receipt callback or public proof receipt is accepted.',
      'Run recovery if callback is missing, rejected or provider returns non-2xx.',
    ],
    externalRequired: Array.from(new Set(checks.filter(item => item.status !== 'ready').map(item => item.nextAction))).slice(0, 12),
    safetyBoundary: 'Runtime Adapter Contract defines how Lobu/OpenClaw/Hermes-style runtimes may accept sanitized restaurant execution packages. It never exposes API key values, cookies, tokens, raw browser profile identifiers, private messages, customer identifiers, coupon codes, payment ids or raw POS rows, and it does not treat provider submit as proof of production automation.',
  };
}

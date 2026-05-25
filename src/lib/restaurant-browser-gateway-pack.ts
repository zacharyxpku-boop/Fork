import { buildRestaurantBrowserRunnerCallbackContract, type RestaurantBrowserRunnerCallbackContract } from '@/lib/restaurant-agent-browser-runner-contract';
import { buildRestaurantBrowserRunbookPackage, type RestaurantBrowserRunbookPackage } from '@/lib/restaurant-agent-browser-runbook';
import { buildRestaurantBrowserSessionManifest, type RestaurantBrowserRuntimeTarget, type RestaurantBrowserSessionManifest } from '@/lib/restaurant-agent-browser-session';

export type RestaurantBrowserGatewayAction =
  | 'open_public_page'
  | 'inspect_public_state'
  | 'capture_public_proof'
  | 'extract_receipt_fields'
  | 'emit_runner_event'
  | 'send_signed_receipt'
  | 'stop_and_handoff';

export type RestaurantBrowserGatewayPack = {
  ok: true;
  payloadShape: 'restaurant-browser-gateway-pack-v1';
  generatedAt: string;
  gatewayId: string;
  runtimeTarget: RestaurantBrowserRuntimeTarget;
  mode: 'browser-request-gateway';
  canExecuteNow: boolean;
  browserRequest: {
    endpointPath: '/browser/request';
    method: 'POST';
    authHeader: 'Authorization: Bearer <server-side-runtime-api-key>';
    acceptedActions: RestaurantBrowserGatewayAction[];
    requestShape: {
      gatewayId: string;
      eventId: string;
      runbookId: string;
      action: RestaurantBrowserGatewayAction;
      allowedDomains: string[];
      targetUrl: string;
      snapshotPolicyId: string;
      callbackEndpoint: '/api/restaurant-agent/runtime';
    };
    forbiddenFields: string[];
  };
  actionSchema: Array<{
    action: RestaurantBrowserGatewayAction;
    allowed: boolean;
    owner: 'runtime-admin' | 'provider' | 'ops';
    requiredEvidence: string[];
    stopIf: string[];
    writesTo: 'runner-event' | 'signed-receipt' | 'manual-handoff';
  }>;
  snapshotPolicy: {
    policyId: string;
    allowedFields: string[];
    redactedFields: string[];
    maxCharacters: number;
    maxScreenshots: number;
    retention: string;
  };
  contextBudget: {
    maxSteps: number;
    maxAttemptsPerStep: number;
    maxRuntimeMinutes: number;
    maxEventSummaries: number;
    stopWhenBudgetExhausted: true;
  };
  wiring: {
    session: Pick<RestaurantBrowserSessionManifest, 'sessionId' | 'runtimeTarget' | 'canExecuteNow' | 'task' | 'profile' | 'runtime'>;
    runbook: Pick<RestaurantBrowserRunbookPackage, 'runbookId' | 'payloadShape' | 'allowedDomains' | 'callback' | 'audit'>;
    runnerContract: Pick<RestaurantBrowserRunnerCallbackContract, 'contractId' | 'payloadShape' | 'canAcceptSignedFinalReceipt' | 'eventRules' | 'recoveryPolicy'>;
  };
  externalRequired: string[];
  safetyBoundary: string;
};

type EnvMap = Record<string, string | undefined>;

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 61 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function cleanTarget(value: unknown): RestaurantBrowserRuntimeTarget {
  return value === 'hermes' ? 'hermes' : 'openclaw';
}

function cleanText(value: unknown, fallback: string, max = 180): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function allowedFor(action: RestaurantBrowserGatewayAction, canExecuteNow: boolean) {
  if (action === 'stop_and_handoff') return true;
  return canExecuteNow;
}

function actionSchema(input: {
  canExecuteNow: boolean;
  callbackReady: boolean;
  runbook: RestaurantBrowserRunbookPackage;
}): RestaurantBrowserGatewayPack['actionSchema'] {
  return [
    {
      action: 'open_public_page',
      allowed: allowedFor('open_public_page', input.canExecuteNow),
      owner: 'provider',
      requiredEvidence: ['opened url', 'domain', 'page title'],
      stopIf: ['domain not allowlisted', 'login challenge appears', 'captcha appears'],
      writesTo: 'runner-event',
    },
    {
      action: 'inspect_public_state',
      allowed: allowedFor('inspect_public_state', input.canExecuteNow),
      owner: 'provider',
      requiredEvidence: ['channel', 'visible status', 'public content id when present'],
      stopIf: ['private inbox content appears', 'customer identifier appears', 'platform policy warning appears'],
      writesTo: 'runner-event',
    },
    {
      action: 'capture_public_proof',
      allowed: allowedFor('capture_public_proof', input.canExecuteNow),
      owner: 'provider',
      requiredEvidence: ['screenshot id', 'timestamp', 'visible channel'],
      stopIf: ['private data visible', 'payment page visible', 'unapproved backend table visible'],
      writesTo: 'runner-event',
    },
    {
      action: 'extract_receipt_fields',
      allowed: allowedFor('extract_receipt_fields', input.canExecuteNow),
      owner: 'provider',
      requiredEvidence: input.runbook.callback.requiredFields,
      stopIf: ['required receipt evidence missing', 'sample or placeholder proof only'],
      writesTo: 'runner-event',
    },
    {
      action: 'emit_runner_event',
      allowed: true,
      owner: 'provider',
      requiredEvidence: ['eventId', 'externalRunId', 'eventType', 'sanitized evidence summary'],
      stopIf: ['event contains private text', 'event contains secret or credential'],
      writesTo: 'runner-event',
    },
    {
      action: 'send_signed_receipt',
      allowed: input.canExecuteNow && input.callbackReady,
      owner: 'provider',
      requiredEvidence: ['x-restaurant-agent-signature', 'eventId', 'channel', 'summary', 'externalRunId or screenshotId or evidenceUrl'],
      stopIf: ['callback secret missing', 'signature rejected', 'receipt validation rejected'],
      writesTo: 'signed-receipt',
    },
    {
      action: 'stop_and_handoff',
      allowed: true,
      owner: 'ops',
      requiredEvidence: ['blocked reason', 'owner', 'next action'],
      stopIf: input.runbook.steps.flatMap(step => step.stopIf).slice(0, 8),
      writesTo: 'manual-handoff',
    },
  ];
}

export function buildRestaurantBrowserGatewayPack(input: {
  runtimeTarget?: RestaurantBrowserRuntimeTarget;
  eventId?: string;
  restaurant?: string;
  offer?: string;
  channel?: string;
  targetUrl?: string;
  allowedDomains?: string[];
  env?: EnvMap;
  now?: Date;
} = {}): RestaurantBrowserGatewayPack {
  const now = input.now || new Date();
  const runtimeTarget = cleanTarget(input.runtimeTarget);
  const targetUrl = cleanText(input.targetUrl, 'merchant-approved-url-or-public-proof-url', 180);
  const session = buildRestaurantBrowserSessionManifest({
    runtimeTarget,
    eventId: input.eventId,
    restaurant: input.restaurant,
    offer: input.offer,
    channel: input.channel,
    env: input.env,
  });
  const runbook = buildRestaurantBrowserRunbookPackage({
    runtimeTarget,
    eventId: session.task.eventId,
    restaurant: session.task.restaurant,
    offer: session.task.offer,
    channel: session.task.channel,
    targetUrl,
    allowedDomains: input.allowedDomains,
    env: input.env,
  });
  const runnerContract = buildRestaurantBrowserRunnerCallbackContract({
    runtimeTarget,
    eventId: session.task.eventId,
    restaurant: session.task.restaurant,
    offer: session.task.offer,
    channel: session.task.channel,
    targetUrl,
    allowedDomains: input.allowedDomains,
    env: input.env,
  });
  const gatewayId = `restaurant-browser-gateway-${stableId([session.sessionId, runbook.runbookId, targetUrl])}`;
  const callbackReady = session.runtime.callbackSecretConfigured;
  const schema = actionSchema({
    canExecuteNow: session.canExecuteNow,
    callbackReady,
    runbook,
  });

  return {
    ok: true,
    payloadShape: 'restaurant-browser-gateway-pack-v1',
    generatedAt: now.toISOString(),
    gatewayId,
    runtimeTarget,
    mode: 'browser-request-gateway',
    canExecuteNow: session.canExecuteNow,
    browserRequest: {
      endpointPath: '/browser/request',
      method: 'POST',
      authHeader: 'Authorization: Bearer <server-side-runtime-api-key>',
      acceptedActions: schema.filter(item => item.allowed).map(item => item.action),
      requestShape: {
        gatewayId,
        eventId: session.task.eventId,
        runbookId: runbook.runbookId,
        action: 'open_public_page',
        allowedDomains: runbook.allowedDomains,
        targetUrl,
        snapshotPolicyId: `snapshot-${stableId([gatewayId, 'public-proof'])}`,
        callbackEndpoint: runbook.callback.endpoint,
      },
      forbiddenFields: ['apiKey', 'token', 'cookie', 'password', 'smsCode', 'rawBrowserProfileId', 'privateMessages', 'customerIdentifiers', 'couponCodes', 'paymentIds', 'rawPosRows'],
    },
    actionSchema: schema,
    snapshotPolicy: {
      policyId: `snapshot-${stableId([gatewayId, 'public-proof'])}`,
      allowedFields: ['url domain', 'page title', 'public content id', 'public proof status', 'screenshot id', 'visible channel', 'sanitized blocker summary'],
      redactedFields: ['password', 'SMS code', 'cookie', 'token', 'phone number', 'WeChat ID', 'customer name', 'private message text', 'payment id', 'raw POS row'],
      maxCharacters: 1200,
      maxScreenshots: 2,
      retention: 'store only sanitized summaries and screenshot ids until post-run review; never store raw browser profile state',
    },
    contextBudget: {
      maxSteps: runbook.steps.length,
      maxAttemptsPerStep: 2,
      maxRuntimeMinutes: 30,
      maxEventSummaries: 12,
      stopWhenBudgetExhausted: true,
    },
    wiring: {
      session: {
        sessionId: session.sessionId,
        runtimeTarget: session.runtimeTarget,
        canExecuteNow: session.canExecuteNow,
        task: session.task,
        profile: session.profile,
        runtime: session.runtime,
      },
      runbook: {
        runbookId: runbook.runbookId,
        payloadShape: runbook.payloadShape,
        allowedDomains: runbook.allowedDomains,
        callback: runbook.callback,
        audit: runbook.audit,
      },
      runnerContract: {
        contractId: runnerContract.contractId,
        payloadShape: runnerContract.payloadShape,
        canAcceptSignedFinalReceipt: runnerContract.canAcceptSignedFinalReceipt,
        eventRules: runnerContract.eventRules,
        recoveryPolicy: runnerContract.recoveryPolicy,
      },
    },
    externalRequired: runnerContract.externalSetupRequired,
    safetyBoundary: 'Browser Gateway Pack defines a governed browser.request-style contract for OpenClaw/Hermes-compatible runners. It can open approved public or merchant pages, capture public proof and send signed receipts only after runtime, profile, callback secret and merchant authorization are configured. It never exposes API key values, cookies, tokens, raw browser profile identifiers, private messages, customer identifiers, coupon codes, payment ids or raw POS rows.',
  };
}

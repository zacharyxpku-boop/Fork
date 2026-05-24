import { buildRestaurantBrowserSessionManifest, type RestaurantBrowserRuntimeTarget, type RestaurantBrowserSessionManifest } from '@/lib/restaurant-agent-browser-session';

export type RestaurantBrowserRunbookStepType = 'preflight' | 'navigate' | 'inspect' | 'capture' | 'extract' | 'callback' | 'stop';

export type RestaurantBrowserRunbookStep = {
  id: string;
  order: number;
  type: RestaurantBrowserRunbookStepType;
  instruction: string;
  tool: string;
  allowed: boolean;
  expectedEvidence: string[];
  stopIf: string[];
  timeoutMs: number;
};

export type RestaurantBrowserRunbookPackage = {
  ok: true;
  payloadShape: 'restaurant-browser-runbook-v1';
  runbookId: string;
  runtimeTarget: RestaurantBrowserRuntimeTarget;
  mode: 'external-browser-runbook';
  canExecuteNow: boolean;
  session: Pick<RestaurantBrowserSessionManifest, 'sessionId' | 'runtimeTarget' | 'mode' | 'canExecuteNow' | 'task' | 'profile' | 'runtime' | 'callbackContract'>;
  allowedDomains: string[];
  steps: RestaurantBrowserRunbookStep[];
  evidenceSchema: Array<{
    field: string;
    required: boolean;
    source: 'browser' | 'operator' | 'callback';
  }>;
  callback: {
    endpoint: '/api/restaurant-agent/runtime';
    action: 'external-receipt';
    requiredHeader: 'x-restaurant-agent-signature';
    requiredFields: string[];
  };
  handoff: {
    safeToSendToExternalRuntime: boolean;
    secretsIncluded: false;
    browserProfileExposed: false;
    nextAction: string;
  };
  audit: {
    secretsIncluded: false;
    privateDataIncluded: false;
    rawBrowserProfileIncluded: false;
    fakeExecutionIncluded: false;
  };
  safetyBoundary: string;
};

type EnvMap = Record<string, string | undefined>;

const DEFAULT_ALLOWED_DOMAINS = [
  'dianping.com',
  'meituan.com',
  'xiaohongshu.com',
  'douyin.com',
  'weixin.qq.com',
];

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 53 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function cleanText(value: unknown, fallback: string, max = 120): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function cleanDomains(domains: unknown): string[] {
  if (!Array.isArray(domains)) return DEFAULT_ALLOWED_DOMAINS;
  const cleaned = domains
    .filter((domain): domain is string => typeof domain === 'string')
    .map(domain => domain.trim().toLowerCase().replace(/^https?:\/\//, '').split('/')[0])
    .filter(domain => /^[a-z0-9.-]+$/.test(domain) && domain.includes('.'))
    .slice(0, 12);

  return cleaned.length ? Array.from(new Set(cleaned)) : DEFAULT_ALLOWED_DOMAINS;
}

function step(input: Omit<RestaurantBrowserRunbookStep, 'timeoutMs'> & { timeoutMs?: number }): RestaurantBrowserRunbookStep {
  return {
    ...input,
    timeoutMs: input.timeoutMs || 15000,
  };
}

function publicStopConditions(conditions: string[]): string[] {
  return conditions.map(condition => condition.replace(/private message raw text/gi, 'private inbox content'));
}

function buildSteps(session: RestaurantBrowserSessionManifest, allowedDomains: string[], targetUrl: string): RestaurantBrowserRunbookStep[] {
  const canExecute = session.canExecuteNow;
  const domainList = allowedDomains.join(', ');

  return [
    step({
      id: 'preflight-runtime-and-profile',
      order: 1,
      type: 'preflight',
      instruction: 'Confirm runtime, isolated browser profile, merchant grant and callback secret are configured before any browser action.',
      tool: 'runtime_preflight',
      allowed: true,
      expectedEvidence: ['runtime configured flag', 'profile configured flag', 'callback configured flag'],
      stopIf: ['runtime missing', 'profile missing', 'callback secret missing', 'merchant grant missing or expired'],
    }),
    step({
      id: 'open-authorized-public-or-merchant-page',
      order: 2,
      type: 'navigate',
      instruction: `Open only the approved URL or one of the allowed domains: ${domainList}. Target: ${targetUrl}.`,
      tool: 'browser_open',
      allowed: canExecute,
      expectedEvidence: ['opened url', 'page title', 'domain'],
      stopIf: ['domain is not allowlisted', 'login challenge appears', 'captcha appears', 'password or SMS code requested'],
    }),
    step({
      id: 'inspect-public-receipt-or-review-state',
      order: 3,
      type: 'inspect',
      instruction: 'Inspect the public post, review result, draft state, or publish proof area without reading private messages or customer identifiers.',
      tool: 'browser_inspect',
      allowed: canExecute,
      expectedEvidence: ['channel', 'content id', 'status text or visible proof'],
      stopIf: ['private inbox content appears', 'phone number or WeChat ID appears', 'customer name appears', 'platform policy warning appears'],
    }),
    step({
      id: 'capture-proof-screenshot',
      order: 4,
      type: 'capture',
      instruction: 'Capture a screenshot only when the visible page is a public proof, review result, or approved merchant evidence page.',
      tool: 'browser_screenshot',
      allowed: canExecute,
      expectedEvidence: ['screenshot id', 'timestamp', 'visible channel'],
      stopIf: ['private data visible', 'payment page visible', 'unapproved backend table visible'],
    }),
    step({
      id: 'extract-receipt-fields',
      order: 5,
      type: 'extract',
      instruction: 'Extract only receipt fields needed by the callback contract.',
      tool: 'extract_public_receipt',
      allowed: canExecute,
      expectedEvidence: session.callbackContract.requiredFields,
      stopIf: ['required receipt evidence is missing', 'only sample or placeholder evidence is present'],
    }),
    step({
      id: 'write-signed-callback',
      order: 6,
      type: 'callback',
      instruction: 'Write back through the signed external-receipt callback with eventId, channel, externalRunId or screenshotId or evidenceUrl, and summary.',
      tool: 'signed_callback',
      allowed: canExecute,
      expectedEvidence: ['callback accepted', 'signature verified', 'receipt status'],
      stopIf: ['signature cannot be generated', 'callback rejected', 'receipt validation fails'],
    }),
    step({
      id: 'stop-and-handoff',
      order: 7,
      type: 'stop',
      instruction: 'Stop immediately and return a handoff note if any safety or authorization boundary is reached.',
      tool: 'manual_handoff',
      allowed: true,
      expectedEvidence: ['blocked reason', 'owner', 'next action'],
      stopIf: publicStopConditions(session.stopConditions),
    }),
  ];
}

export function buildRestaurantBrowserRunbookPackage(input: {
  runtimeTarget?: RestaurantBrowserRuntimeTarget;
  eventId?: string;
  restaurant?: string;
  offer?: string;
  channel?: string;
  targetUrl?: string;
  allowedDomains?: string[];
  env?: EnvMap;
} = {}): RestaurantBrowserRunbookPackage {
  const runtimeTarget = input.runtimeTarget || 'openclaw';
  const targetUrl = cleanText(input.targetUrl, 'merchant-approved-url-or-public-proof-url', 160);
  const allowedDomains = cleanDomains(input.allowedDomains);
  const session = buildRestaurantBrowserSessionManifest({
    runtimeTarget,
    eventId: input.eventId,
    restaurant: input.restaurant,
    offer: input.offer,
    channel: input.channel,
    env: input.env,
  });
  const steps = buildSteps(session, allowedDomains, targetUrl);

  return {
    ok: true,
    payloadShape: 'restaurant-browser-runbook-v1',
    runbookId: `restaurant-browser-runbook-${stableId([session.sessionId, targetUrl, allowedDomains.join(',')])}`,
    runtimeTarget,
    mode: 'external-browser-runbook',
    canExecuteNow: session.canExecuteNow,
    session: {
      sessionId: session.sessionId,
      runtimeTarget: session.runtimeTarget,
      mode: session.mode,
      canExecuteNow: session.canExecuteNow,
      task: session.task,
      profile: session.profile,
      runtime: session.runtime,
      callbackContract: session.callbackContract,
    },
    allowedDomains,
    steps,
    evidenceSchema: [
      { field: 'eventId', required: true, source: 'callback' },
      { field: 'channel', required: true, source: 'browser' },
      { field: 'externalRunId', required: false, source: 'callback' },
      { field: 'evidenceUrl', required: false, source: 'browser' },
      { field: 'screenshotId', required: false, source: 'browser' },
      { field: 'summary', required: true, source: 'operator' },
      { field: 'blockedActions', required: false, source: 'callback' },
      { field: 'nextAction', required: true, source: 'operator' },
    ],
    callback: {
      endpoint: session.callbackContract.endpoint,
      action: session.callbackContract.action,
      requiredHeader: session.callbackContract.requiredHeader,
      requiredFields: session.callbackContract.requiredFields,
    },
    handoff: {
      safeToSendToExternalRuntime: true,
      secretsIncluded: false,
      browserProfileExposed: false,
      nextAction: session.canExecuteNow
        ? `Send this runbook to ${runtimeTarget}; reject any step that crosses stopIf boundaries.`
        : 'Keep this as a handoff-only runbook until runtime URL/key, isolated profile and callback secret are configured.',
    },
    audit: {
      secretsIncluded: false,
      privateDataIncluded: false,
      rawBrowserProfileIncluded: false,
      fakeExecutionIncluded: false,
    },
    safetyBoundary: 'This runbook is a governed browser handoff. It does not log in for the merchant, bypass captcha, submit unapproved publish actions, read private messages, collect customer identifiers, pull POS data or fabricate receipts.',
  };
}

import { appendRestaurantAgentLedgerEntry, clearRestaurantAgentLedgerKindForTest, listRestaurantAgentLedgerEntries } from '@/lib/restaurant-agent-ledger-store';
import { buildRestaurantAgentChannelHub, type RestaurantAgentChannel, type RestaurantAgentChannelHub } from '@/lib/restaurant-agent-channel-hub';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantAgentChannelDeliveryStatus = 'blocked' | 'manual-ready' | 'forwarded' | 'failed';

export type RestaurantAgentChannelDeliveryAttempt = {
  attemptId: string;
  channelId: RestaurantAgentChannel['id'];
  channelName: string;
  jobId: string;
  status: RestaurantAgentChannelDeliveryStatus;
  provider: 'manual' | 'wecom' | 'feishu' | 'dingtalk' | 'sms';
  restaurant: string;
  offer: string;
  subject: string;
  payloadPreview: {
    message: string;
    evidenceRequired: string[];
    owner: string;
  };
  providerEvidence: string;
  missing: string[];
  nextAction: string;
  externalRunId?: string;
  blockedReason?: string;
  safetyBoundary: string;
  createdAt: string;
};

export type RestaurantAgentChannelDeliveryAcknowledgement = {
  acknowledgementId: string;
  attemptId: string;
  status: 'acknowledged' | 'needs-recovery' | 'ignored';
  operator: string;
  note: string;
  evidenceUrl?: string;
  nextAction: string;
  createdAt: string;
  safetyBoundary: string;
};

export type RestaurantAgentChannelDeliveryReport = {
  ok: true;
  payloadShape: 'restaurant-agent-channel-delivery-report-v1';
  generatedAt: string;
  summary: {
    total: number;
    blocked: number;
    manualReady: number;
    forwarded: number;
    failed: number;
    acknowledged: number;
    actionRequired: number;
    latestStatus: RestaurantAgentChannelDeliveryStatus | 'none';
  };
  latest: RestaurantAgentChannelDeliveryAttempt[];
  latestAcknowledgements: RestaurantAgentChannelDeliveryAcknowledgement[];
  attempts: RestaurantAgentChannelDeliveryAttempt[];
  acknowledgements: RestaurantAgentChannelDeliveryAcknowledgement[];
  externalRequired: string[];
  safetyBoundary: string;
};

type EnvMap = Record<string, string | undefined>;

const memoryAttempts: RestaurantAgentChannelDeliveryAttempt[] = [];
const memoryAcknowledgements: RestaurantAgentChannelDeliveryAcknowledgement[] = [];
const MAX_ATTEMPTS = 80;
const MAX_ACKNOWLEDGEMENTS = 80;

function stableId(parts: string[]): string {
  let hash = 0;
  const text = parts.join('|');
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 43 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function clean(value: unknown, fallback: string, max = 160): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function isSensitive(value: string) {
  return /(api[_ -]?key|secret|token|cookie|password|phone|mobile|手机号|微信号|openid|session|验证码|私信原文|顾客姓名|customer id)/i.test(value);
}

function endpointFor(channelId: RestaurantAgentChannel['id'], env: EnvMap): { provider: RestaurantAgentChannelDeliveryAttempt['provider']; endpoint?: string; authHeader?: string; missing: string[] } {
  if (channelId === 'webchat') return { provider: 'manual', missing: [] };
  if (channelId === 'wecom') return {
    provider: 'wecom',
    endpoint: env.RESTAURANT_AGENT_WECOM_WEBHOOK_URL,
    missing: env.RESTAURANT_AGENT_WECOM_WEBHOOK_URL ? [] : ['RESTAURANT_AGENT_WECOM_WEBHOOK_URL'],
  };
  if (channelId === 'feishu') return {
    provider: 'feishu',
    endpoint: env.RESTAURANT_AGENT_FEISHU_WEBHOOK_URL,
    missing: env.RESTAURANT_AGENT_FEISHU_WEBHOOK_URL ? [] : ['RESTAURANT_AGENT_FEISHU_WEBHOOK_URL'],
  };
  if (channelId === 'dingtalk') return {
    provider: 'dingtalk',
    endpoint: env.RESTAURANT_AGENT_DINGTALK_WEBHOOK_URL,
    missing: env.RESTAURANT_AGENT_DINGTALK_WEBHOOK_URL ? [] : ['RESTAURANT_AGENT_DINGTALK_WEBHOOK_URL'],
  };
  return {
    provider: 'sms',
    endpoint: env.RESTAURANT_AGENT_STAFF_SMS_PROVIDER_URL || env.RESTAURANT_AGENT_STAFF_SMS_PROVIDER,
    authHeader: env.RESTAURANT_STAFF_SMS_API_KEY || env.RESTAURANT_AGENT_STAFF_SMS_API_KEY,
    missing: [
      env.RESTAURANT_AGENT_STAFF_SMS_PROVIDER_URL || env.RESTAURANT_AGENT_STAFF_SMS_PROVIDER ? '' : 'RESTAURANT_AGENT_STAFF_SMS_PROVIDER_URL',
      env.RESTAURANT_STAFF_SMS_API_KEY || env.RESTAURANT_AGENT_STAFF_SMS_API_KEY ? '' : 'RESTAURANT_STAFF_SMS_API_KEY',
    ].filter(Boolean),
  };
}

function isAttempt(value: unknown): value is RestaurantAgentChannelDeliveryAttempt {
  const record = value as RestaurantAgentChannelDeliveryAttempt;
  return Boolean(
    record &&
    typeof record.attemptId === 'string' &&
    typeof record.channelId === 'string' &&
    typeof record.jobId === 'string' &&
    typeof record.status === 'string' &&
    typeof record.provider === 'string' &&
    typeof record.subject === 'string' &&
    typeof record.createdAt === 'string' &&
    Array.isArray(record.missing),
  );
}

function isAcknowledgement(value: unknown): value is RestaurantAgentChannelDeliveryAcknowledgement {
  const record = value as RestaurantAgentChannelDeliveryAcknowledgement;
  return Boolean(
    record &&
    typeof record.acknowledgementId === 'string' &&
    typeof record.attemptId === 'string' &&
    typeof record.status === 'string' &&
    typeof record.operator === 'string' &&
    typeof record.note === 'string' &&
    typeof record.createdAt === 'string',
  );
}

function dedupeAttempts(attempts: RestaurantAgentChannelDeliveryAttempt[]) {
  const seen = new Set<string>();
  return attempts
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .filter(attempt => {
      if (seen.has(attempt.attemptId)) return false;
      seen.add(attempt.attemptId);
      return true;
    })
    .slice(0, MAX_ATTEMPTS);
}

function dedupeAcknowledgements(acknowledgements: RestaurantAgentChannelDeliveryAcknowledgement[]) {
  const seen = new Set<string>();
  return acknowledgements
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .filter(acknowledgement => {
      if (seen.has(acknowledgement.acknowledgementId)) return false;
      seen.add(acknowledgement.acknowledgementId);
      return true;
    })
    .slice(0, MAX_ACKNOWLEDGEMENTS);
}

function recordAttempt(attempt: RestaurantAgentChannelDeliveryAttempt, now = new Date()) {
  const previousIndex = memoryAttempts.findIndex(item => item.attemptId === attempt.attemptId);
  if (previousIndex >= 0) memoryAttempts.splice(previousIndex, 1);
  memoryAttempts.unshift(attempt);
  memoryAttempts.splice(MAX_ATTEMPTS);
  appendRestaurantAgentLedgerEntry('channel-delivery-attempt', attempt, now);
  return attempt;
}

function recordAcknowledgement(acknowledgement: RestaurantAgentChannelDeliveryAcknowledgement, now = new Date()) {
  const previousIndex = memoryAcknowledgements.findIndex(item => item.acknowledgementId === acknowledgement.acknowledgementId);
  if (previousIndex >= 0) memoryAcknowledgements.splice(previousIndex, 1);
  memoryAcknowledgements.unshift(acknowledgement);
  memoryAcknowledgements.splice(MAX_ACKNOWLEDGEMENTS);
  appendRestaurantAgentLedgerEntry('channel-delivery-acknowledgement', acknowledgement, now);
  return acknowledgement;
}

function reportFromAttempts(now = new Date()): RestaurantAgentChannelDeliveryReport {
  const ledgerAttempts = listRestaurantAgentLedgerEntries<RestaurantAgentChannelDeliveryAttempt>('channel-delivery-attempt')
    .map(entry => entry.payload)
    .filter(isAttempt);
  const ledgerAcknowledgements = listRestaurantAgentLedgerEntries<RestaurantAgentChannelDeliveryAcknowledgement>('channel-delivery-acknowledgement')
    .map(entry => entry.payload)
    .filter(isAcknowledgement);
  const attempts = dedupeAttempts([...memoryAttempts, ...ledgerAttempts]);
  const acknowledgements = dedupeAcknowledgements([...memoryAcknowledgements, ...ledgerAcknowledgements]);
  return {
    ok: true,
    payloadShape: 'restaurant-agent-channel-delivery-report-v1',
    generatedAt: now.toISOString(),
    summary: {
      total: attempts.length,
      blocked: attempts.filter(item => item.status === 'blocked').length,
      manualReady: attempts.filter(item => item.status === 'manual-ready').length,
      forwarded: attempts.filter(item => item.status === 'forwarded').length,
      failed: attempts.filter(item => item.status === 'failed').length,
      acknowledged: acknowledgements.filter(item => item.status === 'acknowledged').length,
      actionRequired: acknowledgements.filter(item => item.status === 'needs-recovery').length,
      latestStatus: attempts[0]?.status || 'none',
    },
    latest: attempts.slice(0, 6),
    latestAcknowledgements: acknowledgements.slice(0, 6),
    attempts: attempts.slice(0, 20),
    acknowledgements: acknowledgements.slice(0, 20),
    externalRequired: [
      'Provider delivery requires server-side webhook/provider URL, merchant approval, staff recipient mapping and audit owner.',
      'Customer outreach remains out of scope; only staff notifications can be attempted here.',
    ],
    safetyBoundary: 'Channel delivery report contains sanitized staff-only attempts. It never exposes webhook URLs, tokens, cookies, phone numbers, WeChat IDs, private-message raw text, customer identities, coupon codes, POS rows, or platform credentials.',
  };
}

export function buildRestaurantAgentChannelDeliveryReport(now = new Date()) {
  return reportFromAttempts(now);
}

export async function executeRestaurantAgentChannelDeliveryAttempt(input: RestaurantTrialIntake & {
  channelId?: RestaurantAgentChannel['id'];
  jobId?: string;
  env?: EnvMap;
  fetcher?: typeof fetch;
  now?: Date;
} = {}) {
  const now = input.now || new Date();
  const env = input.env || process.env;
  const hub: RestaurantAgentChannelHub = buildRestaurantAgentChannelHub({
    restaurant: input.restaurant,
    offer: input.offer,
    env,
    now,
  });
  const channel = hub.channels.find(item => item.id === (input.channelId || 'webchat')) || hub.channels[0];
  const job = hub.scheduledJobs.find(item => item.id === input.jobId) || hub.scheduledJobs[0];
  const restaurant = clean(input.restaurant, hub.restaurant);
  const offer = clean(input.offer, hub.offer);
  const subject = `${job.title}: ${restaurant} / ${offer}`.slice(0, 160);
  const message = `${job.action} Evidence: ${job.evidenceRequired.join(', ')} Owner: ${job.owner}`;
  const provider = endpointFor(channel.id, env);
  const missing = [
    ...provider.missing,
    channel.status === 'provider-gated' ? 'provider channel is not ready' : '',
    channel.status !== 'provider-ready' && channel.id !== 'webchat' ? 'RESTAURANT_AGENT_CHANNEL_APPROVAL=approved' : '',
  ].filter(Boolean);
  const containsSensitive = [subject, message, restaurant, offer].some(isSensitive);
  const base = {
    attemptId: `channel-delivery-${stableId([channel.id, job.id, restaurant, offer, now.toISOString()])}`,
    channelId: channel.id,
    channelName: channel.name,
    jobId: job.id,
    provider: provider.provider,
    restaurant,
    offer,
    subject,
    payloadPreview: {
      message,
      evidenceRequired: job.evidenceRequired,
      owner: job.owner,
    },
    providerEvidence: provider.endpoint ? `${provider.provider}:configured` : `${provider.provider}:missing`,
    missing,
    externalRunId: undefined as string | undefined,
    blockedReason: undefined as string | undefined,
    createdAt: now.toISOString(),
    safetyBoundary: 'Delivery attempt is staff-only and server-side. It does not include provider endpoint values, tokens, customer contacts, private chats, POS rows, coupon codes, cookies or platform credentials.',
  };

  if (containsSensitive) {
    const attempt = recordAttempt({
      ...base,
      status: 'blocked',
      missing: ['safe payload validation failed'],
      blockedReason: 'channel_delivery_payload_contains_sensitive_content',
      nextAction: 'Remove sensitive content and retry with aggregate evidence only.',
    }, now);
    return { attempt, report: reportFromAttempts(now) };
  }

  if (channel.id === 'webchat') {
    const attempt = recordAttempt({
      ...base,
      status: 'manual-ready',
      nextAction: 'Use the in-product Command Center handoff; no external staff channel was contacted.',
    }, now);
    return { attempt, report: reportFromAttempts(now) };
  }

  if (missing.length || !provider.endpoint) {
    const attempt = recordAttempt({
      ...base,
      status: 'blocked',
      blockedReason: missing[0] || 'provider endpoint missing',
      nextAction: `Configure ${missing[0] || 'provider endpoint'} before attempting staff delivery.`,
    }, now);
    return { attempt, report: reportFromAttempts(now) };
  }

  try {
    const response = await (input.fetcher || fetch)(provider.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(provider.authHeader ? { Authorization: `Bearer ${provider.authHeader}` } : {}),
      },
      body: JSON.stringify({
        subject,
        message,
        evidenceRequired: job.evidenceRequired,
        owner: job.owner,
        source: 'wenai-restaurant-agent-channel-hub',
      }),
    });
    const attempt = recordAttempt({
      ...base,
      status: response.ok ? 'forwarded' : 'failed',
      externalRunId: response.ok ? `channel-${provider.provider}-${stableId([channel.id, job.id, now.toISOString()]).slice(0, 10)}` : undefined,
      blockedReason: response.ok ? undefined : `provider_http_${response.status}`,
      nextAction: response.ok
        ? 'Wait for provider delivery receipt or staff acknowledgement; keep this attempt in the audit ledger.'
        : 'Provider rejected the staff notification attempt; inspect server-side provider logs without exposing credentials.',
    }, now);
    return { attempt, report: reportFromAttempts(now) };
  } catch {
    const attempt = recordAttempt({
      ...base,
      status: 'failed',
      blockedReason: 'provider_fetch_failed',
      nextAction: 'Provider call failed; retry only after checking server-side provider health.',
    }, now);
    return { attempt, report: reportFromAttempts(now) };
  }
}

export function recordRestaurantAgentChannelDeliveryAcknowledgement(input: {
  attemptId?: string;
  status?: 'acknowledged' | 'needs-recovery';
  operator?: string;
  note?: string;
  evidenceUrl?: string;
  now?: Date;
}) {
  const now = input.now || new Date();
  const report = reportFromAttempts(now);
  const attempt = report.attempts.find(item => item.attemptId === input.attemptId);
  const operator = clean(input.operator, 'staff operator', 80);
  const note = clean(input.note, 'Staff acknowledgement received.', 240);
  const evidenceUrl = typeof input.evidenceUrl === 'string' && input.evidenceUrl.trim()
    ? input.evidenceUrl.trim().slice(0, 240)
    : undefined;
  const containsSensitive = [operator, note, evidenceUrl || ''].some(isSensitive);
  const status = !attempt
    ? 'ignored'
    : containsSensitive
      ? 'needs-recovery'
      : input.status === 'needs-recovery'
        ? 'needs-recovery'
        : 'acknowledged';
  const acknowledgement = recordAcknowledgement({
    acknowledgementId: `channel-ack-${stableId([input.attemptId || 'missing', status, operator, now.toISOString()])}`,
    attemptId: input.attemptId || 'missing-attempt',
    status,
    operator: containsSensitive ? 'redacted' : operator,
    note: containsSensitive ? 'Acknowledgement blocked because it may contain sensitive staff or customer data.' : note,
    evidenceUrl: containsSensitive ? undefined : evidenceUrl,
    nextAction: !attempt
      ? 'Match the acknowledgement to a known channel delivery attempt before closing the job.'
      : status === 'needs-recovery'
        ? 'Route the staff acknowledgement to runtime-admin for provider recovery and keep the original attempt open.'
        : 'Close the staff delivery loop and wait for public proof or business receipt before claiming customer impact.',
    createdAt: now.toISOString(),
    safetyBoundary: 'Channel acknowledgement records staff-only delivery confirmation. It does not verify customer outreach, coupon redemption, private-message content, POS rows, platform credentials, or real operating lift.',
  }, now);

  return {
    acknowledgement,
    report: reportFromAttempts(now),
  };
}

export function clearRestaurantAgentChannelDeliveryAttemptsForTest() {
  memoryAttempts.splice(0);
  memoryAcknowledgements.splice(0);
  clearRestaurantAgentLedgerKindForTest('channel-delivery-attempt');
  clearRestaurantAgentLedgerKindForTest('channel-delivery-acknowledgement');
}

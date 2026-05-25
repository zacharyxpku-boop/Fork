import type { RestaurantExternalUnlockRequestPack } from '@/lib/restaurant-external-unlock-request-pack';
import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import type { RestaurantProviderSetupWizard } from '@/lib/restaurant-provider-setup-wizard';
import type { RestaurantTodayCommandCockpit } from '@/lib/restaurant-today-command-cockpit';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantProviderAdapterId =
  | 'runtime-browser-agent'
  | 'platform-publish-proof'
  | 'lead-acquisition'
  | 'staff-delivery'
  | 'pos-redemption'
  | 'model-intelligence';

export type RestaurantProviderAdapterContract = {
  id: RestaurantProviderAdapterId;
  label: string;
  status: 'ready-to-test' | 'needs-server-key' | 'needs-merchant-auth' | 'needs-data-contract' | 'blocked';
  owner: 'runtime-admin' | 'merchant' | 'ops' | 'data-ops';
  providerChoices: string[];
  requiredEnvKeys: string[];
  merchantGrant: string[];
  callbackEvents: string[];
  healthCheck: string;
  sandboxAcceptance: string[];
  unlocks: string[];
  fallbackNow: string;
  stopLine: string;
};

export type RestaurantProviderAdapterContractPack = {
  ok: true;
  payloadShape: 'restaurant-provider-adapter-contract-pack-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'first-provider-ready' | 'server-keys-first' | 'merchant-auth-first' | 'data-contract-first' | 'blocked-sensitive';
  summary: {
    adapters: number;
    readyToTest: number;
    needsServerKey: number;
    needsMerchantAuth: number;
    needsDataContract: number;
    blocked: number;
    canClaimCompetitorParity: false;
  };
  firstProviderToConfigure: {
    adapterId: RestaurantProviderAdapterId;
    owner: RestaurantProviderAdapterContract['owner'];
    action: string;
    evidenceRequired: string[];
  };
  adapters: RestaurantProviderAdapterContract[];
  setupOrder: Array<{
    step: number;
    adapterId: RestaurantProviderAdapterId;
    action: string;
    acceptance: string;
  }>;
  providerSecretPolicy: {
    storage: 'server-env-or-secret-manager-only';
    neverCollectInClient: string[];
    healthEvidenceAllowed: string[];
  };
  merchantAuthorizationTemplate: {
    requiredFields: string[];
    allowedActionScopes: string[];
    revocationRule: string;
  };
  callbackContract: {
    endpointAction: 'external-receipt' | 'lead-acquisition-receipt';
    signatureHeader: 'x-restaurant-agent-signature';
    requiredFields: string[];
    forbiddenFields: string[];
  };
  externalRequired: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().replace(/\s+/g, ' ').slice(0, 120) : fallback;
}

function unique(values: string[], limit = 20): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function hasReadyHealth(health: RestaurantProviderReadinessHealth, category: RestaurantProviderReadinessHealth['items'][number]['category']) {
  return health.items.some(item => item.category === category && item.status === 'health-ready');
}

function hasEnv(wizard: RestaurantProviderSetupWizard, key: string): boolean {
  return wizard.handoffPayload.configuredEnvKeys.includes(key);
}

function hasAnyEnv(wizard: RestaurantProviderSetupWizard, keys: string[]): boolean {
  return keys.some(key => hasEnv(wizard, key));
}

function contract(input: RestaurantProviderAdapterContract): RestaurantProviderAdapterContract {
  return input;
}

function firstProvider(adapters: RestaurantProviderAdapterContract[]): RestaurantProviderAdapterContract {
  return adapters.find(item => item.status === 'needs-server-key')
    || adapters.find(item => item.status === 'needs-merchant-auth')
    || adapters.find(item => item.status === 'needs-data-contract')
    || adapters.find(item => item.status === 'blocked')
    || adapters[0];
}

export function buildRestaurantProviderAdapterContractPack(input: RestaurantTrialIntake & {
  externalUnlockRequestPack: RestaurantExternalUnlockRequestPack;
  providerSetupWizard: RestaurantProviderSetupWizard;
  providerReadinessHealth: RestaurantProviderReadinessHealth;
  todayCommandCockpit: RestaurantTodayCommandCockpit;
  now?: Date;
}): RestaurantProviderAdapterContractPack {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, input.todayCommandCockpit.restaurant);
  const offer = clean(input.offer, input.todayCommandCockpit.offer);
  const wizard = input.providerSetupWizard;
  const health = input.providerReadinessHealth;
  const runtimeReady = hasReadyHealth(health, 'runtime');
  const callbackReady = hasReadyHealth(health, 'callback');
  const merchantReady = hasReadyHealth(health, 'merchant-auth');
  const dataReady = hasReadyHealth(health, 'operating-data');
  const runtimeKeys = [
    'RESTAURANT_AGENT_LOBU_RUNTIME_URL',
    'RESTAURANT_AGENT_LOBU_API_KEY',
    'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL',
    'RESTAURANT_AGENT_OPENCLAW_API_KEY',
    'RESTAURANT_AGENT_HERMES_RUNTIME_URL',
    'RESTAURANT_AGENT_HERMES_API_KEY',
  ];
  const staffKeys = [
    'RESTAURANT_AGENT_WECOM_WEBHOOK_URL',
    'RESTAURANT_AGENT_FEISHU_WEBHOOK_URL',
    'RESTAURANT_AGENT_DINGTALK_WEBHOOK_URL',
    'RESTAURANT_AGENT_STAFF_SMS_PROVIDER_KEY',
  ];
  const adapters = [
    contract({
      id: 'runtime-browser-agent',
      label: 'Persistent browser / agent runtime',
      status: runtimeReady && callbackReady ? 'ready-to-test' : 'needs-server-key',
      owner: 'runtime-admin',
      providerChoices: ['OpenClaw runtime', 'Hermes resident browser', 'Lobu multi-tenant worker'],
      requiredEnvKeys: runtimeKeys.concat('RESTAURANT_AGENT_CALLBACK_SECRET'),
      merchantGrant: ['allowed runtime target', 'cost/retry limit', 'operator approval for each run'],
      callbackEvents: ['external-receipt', 'provider-error', 'runner-step-event'],
      healthCheck: runtimeReady ? 'runtime health ready' : 'GET /health with server-side API key, then signed callback probe',
      sandboxAcceptance: ['sanitized execution package accepted', 'externalRunId returned', 'signed receipt accepted', 'no secret exposed'],
      unlocks: ['auto publish proof capture', 'browser runbook execution', 'resident heartbeat', 'failure recovery'],
      fallbackNow: 'Generate browser runbook and manual proof checklist; do not call external runtime.',
      stopLine: 'No cookies, tokens, raw browser profile ids, private inboxes, captcha bypass, payment or POS pages.',
    }),
    contract({
      id: 'platform-publish-proof',
      label: 'Dianping / Xiaohongshu / Douyin / WeChat publish proof',
      status: merchantReady ? (runtimeReady && callbackReady ? 'ready-to-test' : 'needs-server-key') : 'needs-merchant-auth',
      owner: merchantReady ? 'runtime-admin' : 'merchant',
      providerChoices: ['merchant platform API/OAuth', 'authorized browser session', 'manual public link/screenshot import'],
      requiredEnvKeys: runtimeKeys.concat('RESTAURANT_AGENT_CALLBACK_SECRET'),
      merchantGrant: ['platform account authorization', 'allowed publish/proof actions', 'expiry', 'revocation owner'],
      callbackEvents: ['external-receipt'],
      healthCheck: merchantReady ? 'merchant authorization recorded' : 'merchant grant missing',
      sandboxAcceptance: ['approved content only', 'public URL or screenshot id', 'operator summary', 'signed receipt'],
      unlocks: ['auto publish proof', 'publish receipt inbox', 'post-run review'],
      fallbackNow: 'Prepare content package, proof slot and staff owner; import public proof manually.',
      stopLine: 'No publish claim, ranking claim or platform action without merchant grant and accepted proof.',
    }),
    contract({
      id: 'lead-acquisition',
      label: 'Reservation, coupon claim and inquiry lead intake',
      status: input.todayCommandCockpit.summary.blocked > 0
        ? 'blocked'
        : merchantReady && callbackReady
          ? 'ready-to-test'
          : merchantReady ? 'needs-server-key' : 'needs-merchant-auth',
      owner: merchantReady ? 'runtime-admin' : 'merchant',
      providerChoices: ['reservation export/API', 'group-buy/coupon aggregate export', 'WeCom/WeChat/SMS staff channel', 'platform public proof import'],
      requiredEnvKeys: ['RESTAURANT_AGENT_CALLBACK_SECRET', ...staffKeys],
      merchantGrant: ['lead source read authorization', 'staff recipient-role approval', 'customer-contact policy'],
      callbackEvents: ['lead-acquisition-receipt'],
      healthCheck: callbackReady ? 'lead receipt signature ready' : 'callback secret missing',
      sandboxAcceptance: ['aggregate lead count only', 'source id', 'proof id', 'staff approval', 'no PII fields'],
      unlocks: ['reservation follow-up', 'coupon claim owner tasks', 'private-domain aggregate follow-up'],
      fallbackNow: 'Classify aggregate inquiry themes and create staff-reviewed follow-up tasks.',
      stopLine: 'No private message scraping, customer contact automation, reservation confirmation or member enrichment.',
    }),
    contract({
      id: 'staff-delivery',
      label: 'Staff-only notification delivery',
      status: hasAnyEnv(wizard, staffKeys) ? 'ready-to-test' : 'needs-server-key',
      owner: 'ops',
      providerChoices: ['WeCom bot', 'Feishu webhook', 'DingTalk webhook', 'SMS provider for staff only'],
      requiredEnvKeys: staffKeys,
      merchantGrant: ['staff recipient mapping', 'role approval', 'no customer-recipient policy'],
      callbackEvents: ['staff-delivery-ack', 'delivery-failed'],
      healthCheck: hasAnyEnv(wizard, staffKeys) ? 'staff channel configured evidence exists' : 'staff channel webhook/key missing',
      sandboxAcceptance: ['staff recipient id', 'delivery acknowledgement', 'audit event', 'no customer payload'],
      unlocks: ['store-manager alerts', 'recovery escalation', 'shift handoff delivery'],
      fallbackNow: 'Keep staff notices copy-ready in the dashboard and require manual acknowledgement.',
      stopLine: 'No customer outreach and no private lead details in staff notifications.',
    }),
    contract({
      id: 'pos-redemption',
      label: 'POS, coupon redemption and operating data',
      status: dataReady ? 'ready-to-test' : 'needs-data-contract',
      owner: 'data-ops',
      providerChoices: ['POS aggregate CSV', 'coupon redemption export', 'member aggregate export', 'merchant-approved POS API'],
      requiredEnvKeys: ['RESTAURANT_POS_DATA_MODE', 'RESTAURANT_POS_FIELD_DICTIONARY'],
      merchantGrant: ['data owner', 'field dictionary', 'export cadence', 'no-PII sample', 'retention rule'],
      callbackEvents: ['pos-import-accepted', 'redemption-aggregate-receipt'],
      healthCheck: dataReady ? 'POS data contract ready' : 'POS mode/field dictionary missing',
      sandboxAcceptance: ['businessDate', 'storeName', 'offerName', 'couponClaimCount', 'redemptionCount', 'grossSales', 'orderCount'],
      unlocks: ['coupon redemption reconciliation', 'true operating analysis', 'finance closeout'],
      fallbackNow: 'Use manual sanitized aggregate CSV import and keep analysis directional.',
      stopLine: 'No raw POS rows, payment ids, member ids, customer identity, coupon codes or profit claims without cost fields.',
    }),
    contract({
      id: 'model-intelligence',
      label: 'Model provider for generation and multimodal understanding',
      status: hasAnyEnv(wizard, ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'LOCAL_MODEL_BASE_URL']) ? 'ready-to-test' : 'needs-server-key',
      owner: 'runtime-admin',
      providerChoices: ['OpenAI', 'Claude', 'local model endpoint'],
      requiredEnvKeys: ['OPENAI_API_KEY or ANTHROPIC_API_KEY or LOCAL_MODEL_BASE_URL'],
      merchantGrant: ['approved menu/material usage', 'image/document use permission', 'forbidden claims list'],
      callbackEvents: ['model-run-audit'],
      healthCheck: 'server-side model key or local endpoint health check',
      sandboxAcceptance: ['prompt template id', 'source material ids', 'reviewer', 'no unsupported factual claims'],
      unlocks: ['real content generation', 'menu/material parsing', 'training batch creation'],
      fallbackNow: 'Use deterministic templates and sample-safe copy until a model provider is configured.',
      stopLine: 'No unsupported claims, no private documents without permission, no key values in client payloads.',
    }),
  ];
  const readyToTest = adapters.filter(item => item.status === 'ready-to-test').length;
  const needsServerKey = adapters.filter(item => item.status === 'needs-server-key').length;
  const needsMerchantAuth = adapters.filter(item => item.status === 'needs-merchant-auth').length;
  const needsDataContract = adapters.filter(item => item.status === 'needs-data-contract').length;
  const blocked = adapters.filter(item => item.status === 'blocked').length;
  const first = firstProvider(adapters);
  const verdict: RestaurantProviderAdapterContractPack['verdict'] = readyToTest > 0
    ? 'first-provider-ready'
    : blocked > 0
      ? 'blocked-sensitive'
      : needsServerKey > 0
        ? 'server-keys-first'
        : needsMerchantAuth > 0
          ? 'merchant-auth-first'
          : 'data-contract-first';

  return {
    ok: true,
    payloadShape: 'restaurant-provider-adapter-contract-pack-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    verdict,
    summary: {
      adapters: adapters.length,
      readyToTest,
      needsServerKey,
      needsMerchantAuth,
      needsDataContract,
      blocked,
      canClaimCompetitorParity: false,
    },
    firstProviderToConfigure: {
      adapterId: first.id,
      owner: first.owner,
      action: first.status === 'ready-to-test' ? `Run one sandbox test for ${first.label}.` : `Configure ${first.label}: ${first.healthCheck}.`,
      evidenceRequired: first.sandboxAcceptance,
    },
    adapters,
    setupOrder: adapters.map((item, index) => ({
      step: index + 1,
      adapterId: item.id,
      action: item.status === 'ready-to-test' ? `Sandbox test ${item.label}.` : `Resolve ${item.status} for ${item.label}.`,
      acceptance: item.sandboxAcceptance.join(' / '),
    })),
    providerSecretPolicy: {
      storage: 'server-env-or-secret-manager-only',
      neverCollectInClient: ['API keys', 'callback secret', 'cookies', 'tokens', 'browser profile raw ids', 'private message exports', 'customer identifiers', 'raw POS rows'],
      healthEvidenceAllowed: ['configured/missing', 'status code', 'latency', 'provider name', 'scope id', 'expiry', 'revocation owner'],
    },
    merchantAuthorizationTemplate: {
      requiredFields: ['merchant legal name', 'store id', 'platform', 'allowed actions', 'expiry', 'operator approver', 'revocation owner', 'data scope'],
      allowedActionScopes: ['public proof capture', 'approved content publish', 'aggregate lead intake', 'staff-only notification', 'aggregate POS/coupon import'],
      revocationRule: 'Merchant can revoke any platform/provider scope; all future runs must stop and require fresh proof.',
    },
    callbackContract: {
      endpointAction: 'external-receipt',
      signatureHeader: 'x-restaurant-agent-signature',
      requiredFields: ['eventId', 'adapterId', 'externalRunId or evidenceUrl or screenshotId', 'operator', 'summary', 'signedAt'],
      forbiddenFields: ['API keys', 'cookies', 'tokens', 'browser profile raw ids', 'private-message bodies', 'customer identifiers', 'coupon codes', 'payment ids', 'raw POS rows'],
    },
    externalRequired: unique([
      ...input.externalUnlockRequestPack.requests.map(item => item.ask),
      ...input.providerReadinessHealth.externalRequired,
      ...adapters.filter(item => item.status !== 'ready-to-test').flatMap(item => [item.healthCheck, ...item.requiredEnvKeys, ...item.merchantGrant]),
    ], 24),
    safetyBoundary: 'Provider Adapter Contract Pack defines integration contracts and acceptance tests only. It never stores or returns secret values, cookies, raw browser profile ids, private messages, customer identifiers, coupon codes, payment ids or raw POS rows, and it cannot claim parity until a provider adapter passes sandbox health, merchant authorization, signed callback and proof-ledger acceptance.',
  };
}

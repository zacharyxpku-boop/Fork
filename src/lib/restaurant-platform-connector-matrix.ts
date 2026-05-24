export type RestaurantPlatformConnectorStatus = 'internal-ready' | 'manual-ready' | 'provider-required' | 'blocked';

export type RestaurantPlatformConnectorCapability =
  | 'public-profile'
  | 'content-draft'
  | 'auto-publish'
  | 'publish-receipt'
  | 'lead-intake'
  | 'coupon-redemption'
  | 'operating-analysis';

export type RestaurantPlatformConnector = {
  id: string;
  platform: string;
  role: string;
  status: RestaurantPlatformConnectorStatus;
  capabilities: RestaurantPlatformConnectorCapability[];
  canDoInternallyNow: string[];
  providerRequiredFor: string[];
  requiredEnvKeys: string[];
  merchantGrant: string[];
  acceptanceEvidence: string[];
  nextAction: string;
  safetyBoundary: string;
};

export type RestaurantPlatformConnectorMatrix = {
  ok: true;
  payloadShape: 'restaurant-platform-connector-matrix-v1';
  generatedAt: string;
  verdict: 'internal-workbench-ready' | 'provider-setup-required' | 'production-ready';
  summary: {
    connectors: number;
    internalReady: number;
    manualReady: number;
    providerRequired: number;
    blocked: number;
    configuredEnvKeys: number;
    totalEnvKeys: number;
  };
  connectors: RestaurantPlatformConnector[];
  capabilityCoverage: Array<{
    capability: RestaurantPlatformConnectorCapability;
    internalConnectors: string[];
    providerConnectors: string[];
    missingEvidence: string[];
  }>;
  envChecklist: Array<{
    key: string;
    configured: boolean;
    unlocks: string[];
  }>;
  pilotOrder: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

type EnvMap = Record<string, string | undefined>;

function hasValue(env: EnvMap, key: string): boolean {
  return typeof env[key] === 'string' && env[key]!.trim().length > 0;
}

function envStatus(env: EnvMap, keys: string[]) {
  if (keys.length === 0) return 'internal-ready' as const;
  const configured = keys.filter(key => hasValue(env, key)).length;
  if (configured === keys.length) return 'manual-ready' as const;
  if (configured > 0) return 'provider-required' as const;
  return 'blocked' as const;
}

function connector(input: Omit<RestaurantPlatformConnector, 'status'>, env: EnvMap): RestaurantPlatformConnector {
  return {
    ...input,
    status: envStatus(env, input.requiredEnvKeys),
  };
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

const CAPABILITIES: RestaurantPlatformConnectorCapability[] = [
  'public-profile',
  'content-draft',
  'auto-publish',
  'publish-receipt',
  'lead-intake',
  'coupon-redemption',
  'operating-analysis',
];

export function buildRestaurantPlatformConnectorMatrix(input: {
  env?: EnvMap;
  now?: Date;
} = {}): RestaurantPlatformConnectorMatrix {
  const env = input.env || process.env;
  const connectors: RestaurantPlatformConnector[] = [
    connector({
      id: 'public-profile-intake',
      platform: 'Public POI / merchant-provided profile',
      role: 'Seed restaurant identity, local scene and evidence gaps before merchant auth exists.',
      capabilities: ['public-profile', 'content-draft'],
      canDoInternallyNow: ['normalize public/manual store fields', 'build local content brief', 'create missing material checklist'],
      providerRequiredFor: ['batch POI search', 'platform backend sync', 'real publish or lead proof'],
      requiredEnvKeys: [],
      merchantGrant: ['public URL or merchant-provided profile text'],
      acceptanceEvidence: ['source URL or manual text', 'field confidence ledger', 'missing activation checklist'],
      nextAction: 'Use this as the first customer trial input, then ask merchant for menu, photos, campaign boundary and proof.',
      safetyBoundary: 'Public profile data is context only; it is not merchant authorization, lead proof, redemption proof or operating performance.',
    }, env),
    connector({
      id: 'dianping-meituan',
      platform: 'Dianping / Meituan',
      role: 'Store page, local ranking context, group-buy coupon proof, booking and redemption evidence.',
      capabilities: ['public-profile', 'auto-publish', 'publish-receipt', 'lead-intake', 'coupon-redemption'],
      canDoInternallyNow: ['prepare store proof checklist', 'draft Dianping/Meituan content tasks', 'validate manual public proof receipt'],
      providerRequiredFor: ['auto publish', 'coupon claim sync', 'redemption sync', 'merchant backend evidence'],
      requiredEnvKeys: ['RESTAURANT_DIANPING_AUTH_STATUS', 'RESTAURANT_AGENT_BROWSER_PROFILE_ID', 'RESTAURANT_AGENT_CALLBACK_SECRET'],
      merchantGrant: ['merchant backend authorization', 'allowed publish/coupon actions', 'grant expiry and revocation owner'],
      acceptanceEvidence: ['public store URL', 'published content URL or screenshot', 'externalRunId', 'coupon/redemption export if claimed'],
      nextAction: 'Collect merchant authorization and browser profile before enabling Dianping/Meituan automation.',
      safetyBoundary: 'Without merchant authorization this connector only creates drafts, proof slots and manual receipt checks.',
    }, env),
    connector({
      id: 'xiaohongshu',
      platform: 'Xiaohongshu',
      role: 'Local note planning, authorized photo usage, publish proof and aggregate inquiry summary.',
      capabilities: ['content-draft', 'auto-publish', 'publish-receipt', 'lead-intake'],
      canDoInternallyNow: ['draft scenario-first notes', 'build photo authorization checklist', 'validate public note receipt'],
      providerRequiredFor: ['auto publish', 'comment/inquiry aggregate sync', 'account health checks'],
      requiredEnvKeys: ['RESTAURANT_SOCIAL_AUTH_STATUS', 'RESTAURANT_AGENT_BROWSER_PROFILE_ID', 'RESTAURANT_AGENT_CALLBACK_SECRET'],
      merchantGrant: ['account authorization', 'photo rights', 'forbidden claims list', 'operator approval rule'],
      acceptanceEvidence: ['approved note draft', 'public note URL or screenshot', 'aggregate inquiry/comment summary'],
      nextAction: 'Keep note generation internal until account auth and signed receipt callback are configured.',
      safetyBoundary: 'Private messages and customer identifiers are never read; only public proof or merchant-provided aggregate summaries are accepted.',
    }, env),
    connector({
      id: 'douyin',
      platform: 'Douyin',
      role: 'Short-video shot list, local content release proof and aggregate comment/inquiry signals.',
      capabilities: ['content-draft', 'auto-publish', 'publish-receipt', 'lead-intake'],
      canDoInternallyNow: ['generate shot list', 'prepare video proof checklist', 'turn public receipt into follow-up task'],
      providerRequiredFor: ['auto publish', 'video receipt capture', 'aggregate comment/inquiry sync'],
      requiredEnvKeys: ['RESTAURANT_SOCIAL_AUTH_STATUS', 'RESTAURANT_AGENT_BROWSER_PROFILE_ID', 'RESTAURANT_AGENT_CALLBACK_SECRET'],
      merchantGrant: ['account authorization', 'operator approval', 'footage usage rights', 'comment handling boundary'],
      acceptanceEvidence: ['approved script', 'public video URL or screenshot', 'aggregate signal receipt'],
      nextAction: 'Use internal shot planning now; enable runner only after social auth, browser profile and callback are ready.',
      safetyBoundary: 'The connector does not scrape private comments/messages, bypass account checks or claim video performance without receipts.',
    }, env),
    connector({
      id: 'wechat-community',
      platform: 'WeChat community / private domain',
      role: 'Staff-owned group follow-up, booking sheet, coupon claim sheet and manual closeout.',
      capabilities: ['content-draft', 'lead-intake'],
      canDoInternallyNow: ['create staff handoff', 'create booking/coupon sheet template', 'summarize merchant-provided aggregate follow-up'],
      providerRequiredFor: ['automated staff notification', 'CRM/member sync', 'message send or private-domain automation'],
      requiredEnvKeys: ['RESTAURANT_WECHAT_WORK_AUTH_STATUS', 'RESTAURANT_AGENT_CALLBACK_SECRET'],
      merchantGrant: ['staff owner', 'customer consent boundary', 'approved message template', 'manual closeout cadence'],
      acceptanceEvidence: ['booking sheet', 'coupon claim sheet', 'staff acknowledgement', 'aggregate closeout summary'],
      nextAction: 'Use merchant-provided sheets and staff acknowledgements until WeCom/CRM authorization is configured.',
      safetyBoundary: 'The connector never reads private chat bodies or stores phone numbers, WeChat IDs or customer identifiers.',
    }, env),
    connector({
      id: 'pos-redemption',
      platform: 'POS / coupon / inventory',
      role: 'Redemption, sales, margin, inventory and operating analysis from authorized aggregate data.',
      capabilities: ['coupon-redemption', 'operating-analysis'],
      canDoInternallyNow: ['validate sanitized CSV/schema', 'block PII fields', 'aggregate redemption and dish-sales signals'],
      providerRequiredFor: ['live POS sync', 'redemption writeback', 'true operating analytics'],
      requiredEnvKeys: ['RESTAURANT_POS_DATA_MODE', 'RESTAURANT_POS_FIELD_DICTIONARY', 'RESTAURANT_REDEMPTION_SOURCE'],
      merchantGrant: ['field dictionary', 'export cadence', 'no-PII sample', 'data owner and revocation owner'],
      acceptanceEvidence: ['sanitized POS sample', 'field dictionary', 'aggregate redemption counts', 'source time window'],
      nextAction: 'Collect a no-PII POS/redemption sample and field dictionary before claiming true operating analysis.',
      safetyBoundary: 'Raw POS rows, member ids, phone numbers, names, addresses and payment identifiers are not stored or returned.',
    }, env),
    connector({
      id: 'agent-runtime-provider',
      platform: 'OpenClaw / Lobu / Hermes runtime',
      role: 'Persistent browser execution, worker dispatch, callback receipt, recovery and watcher heartbeat.',
      capabilities: ['auto-publish', 'publish-receipt', 'lead-intake', 'coupon-redemption'],
      canDoInternallyNow: ['build governed execution package', 'build sandbox contract', 'simulate signed callback', 'inspect receipt inbox'],
      providerRequiredFor: ['real browser execution', 'real worker dispatch', 'real sandbox submit', 'real callback receipt'],
      requiredEnvKeys: ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', 'RESTAURANT_AGENT_OPENCLAW_API_KEY', 'RESTAURANT_AGENT_CALLBACK_SECRET', 'RESTAURANT_AGENT_BROWSER_PROFILE_ID'],
      merchantGrant: ['allowed action scope', 'operator approval', 'sandbox quota', 'cost/retry limit'],
      acceptanceEvidence: ['runtime health ready', 'externalRunId', 'signed callback', 'accepted receipt', 'recovery event if blocked'],
      nextAction: 'Configure one runtime target and callback secret, then run one sandbox package through receipt validation.',
      safetyBoundary: 'Runtime payloads never include API keys, cookies, raw browser profile values, private messages, customer PII or raw POS rows.',
    }, env),
  ];

  const allEnvKeys = unique(connectors.flatMap(item => item.requiredEnvKeys));
  const configuredEnvKeys = allEnvKeys.filter(key => hasValue(env, key));
  const capabilityCoverage = CAPABILITIES.map(capability => {
    const matching = connectors.filter(item => item.capabilities.includes(capability));
    const internalConnectors = matching.filter(item => item.status === 'internal-ready' || item.status === 'manual-ready').map(item => item.id);
    const providerConnectors = matching.filter(item => item.status === 'provider-required' || item.status === 'blocked').map(item => item.id);
    return {
      capability,
      internalConnectors,
      providerConnectors,
      missingEvidence: unique(matching.flatMap(item => item.acceptanceEvidence)).slice(0, 5),
    };
  });
  const providerRequired = connectors.filter(item => item.status === 'provider-required').length;
  const blocked = connectors.filter(item => item.status === 'blocked').length;
  const productionReady = connectors.every(item => item.status === 'internal-ready' || item.status === 'manual-ready');

  return {
    ok: true,
    payloadShape: 'restaurant-platform-connector-matrix-v1',
    generatedAt: (input.now || new Date()).toISOString(),
    verdict: productionReady ? 'production-ready' : blocked || providerRequired ? 'provider-setup-required' : 'internal-workbench-ready',
    summary: {
      connectors: connectors.length,
      internalReady: connectors.filter(item => item.status === 'internal-ready').length,
      manualReady: connectors.filter(item => item.status === 'manual-ready').length,
      providerRequired,
      blocked,
      configuredEnvKeys: configuredEnvKeys.length,
      totalEnvKeys: allEnvKeys.length,
    },
    connectors,
    capabilityCoverage,
    envChecklist: allEnvKeys.map(key => ({
      key,
      configured: hasValue(env, key),
      unlocks: connectors.filter(item => item.requiredEnvKeys.includes(key)).map(item => item.platform),
    })),
    pilotOrder: [
      'Start with public-profile-intake and internal content draft.',
      'Add one manual public receipt or signed callback receipt.',
      'Configure one browser runtime and callback secret for sandbox submit.',
      'Add one merchant platform grant, then test auto-publish proof only.',
      'Add POS/redemption aggregate sample before claiming operating analysis.',
    ],
    externalRequired: unique(connectors
      .filter(item => item.status !== 'internal-ready' && item.status !== 'manual-ready')
      .flatMap(item => [item.nextAction, ...item.requiredEnvKeys.map(key => `${key}=missing`)]))
      .slice(0, 12),
    safetyBoundary: 'Platform Connector Matrix is a readiness map for restaurant platform capability. It does not log in, publish, scrape private messages, redeem coupons, pull raw POS rows, expose provider keys, or convert missing providers into production claims.',
  };
}

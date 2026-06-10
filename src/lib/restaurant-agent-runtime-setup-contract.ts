import type { RestaurantRuntimeTarget } from '@/lib/restaurant-agent-runtime-bridge';

export type RestaurantRuntimeSetupStatus = 'ready' | 'missing' | 'blocked';

export type RestaurantRuntimeSetupRequirement = {
  id: string;
  label: string;
  owner: 'Wenai' | 'merchant' | 'runtime-admin' | 'ops';
  source: 'internal' | 'env' | 'merchant-authorization' | 'pos-contract' | 'platform-account';
  configured: boolean;
  evidence: string;
  unlocks: string[];
  missingImpact: string;
  safetyBoundary: string;
};

export type RestaurantRuntimeSetupTrack = {
  id: string;
  name: string;
  target?: RestaurantRuntimeTarget | 'merchant-platform' | 'pos';
  status: RestaurantRuntimeSetupStatus;
  canRunNow: boolean;
  requirements: RestaurantRuntimeSetupRequirement[];
  unlocks: string[];
  nextAction: string;
};

export type RestaurantRuntimeSetupContract = {
  ok: true;
  generatedAt: string;
  payloadShape: 'restaurant-agent-runtime-setup-contract-v1';
  summary: {
    tracks: number;
    readyTracks: number;
    missingRequirements: number;
    blockedTracks: number;
    internalSolved: string[];
    externalRequired: string[];
  };
  tracks: RestaurantRuntimeSetupTrack[];
  blockedCapabilities: Array<{
    capability: string;
    reason: string;
    requiredBy: string[];
  }>;
  sourceMap: Array<{
    competitor: 'Lobu' | 'OpenClaw' | 'Hermes' | 'Restaurant SaaS';
    publicPattern: string;
    wenaiContract: string;
  }>;
  safetyBoundary: string;
};

type EnvMap = Record<string, string | undefined>;

function hasValue(env: EnvMap, key: string): boolean {
  return typeof env[key] === 'string' && env[key]!.trim().length > 0;
}

function evidenceFor(env: EnvMap, key: string): string {
  return hasValue(env, key) ? `${key}=configured` : `${key}=missing`;
}

function envRequirement(
  env: EnvMap,
  input: {
    id: string;
    key: string;
    label: string;
    owner: RestaurantRuntimeSetupRequirement['owner'];
    unlocks: string[];
    missingImpact: string;
    safetyBoundary?: string;
  },
): RestaurantRuntimeSetupRequirement {
  return {
    id: input.id,
    label: input.label,
    owner: input.owner,
    source: 'env',
    configured: hasValue(env, input.key),
    evidence: evidenceFor(env, input.key),
    unlocks: input.unlocks,
    missingImpact: input.missingImpact,
    safetyBoundary: input.safetyBoundary || 'Only configured/missing is exposed. Secret values, cookies, tokens, profile paths, and API keys stay server-side.',
  };
}

function staticRequirement(input: {
  id: string;
  label: string;
  owner: RestaurantRuntimeSetupRequirement['owner'];
  source: RestaurantRuntimeSetupRequirement['source'];
  configured: boolean;
  evidence: string;
  unlocks: string[];
  missingImpact: string;
  safetyBoundary?: string;
}): RestaurantRuntimeSetupRequirement {
  return {
    ...input,
    safetyBoundary: input.safetyBoundary || 'This gate records authorization state only. It does not log in, scrape private pages, or store customer PII.',
  };
}

function trackStatus(requirements: RestaurantRuntimeSetupRequirement[]): RestaurantRuntimeSetupStatus {
  if (requirements.every(item => item.configured)) return 'ready';
  if (requirements.some(item => item.source === 'merchant-authorization' || item.source === 'platform-account' || item.source === 'pos-contract')) return 'blocked';
  return 'missing';
}

function buildTrack(input: Omit<RestaurantRuntimeSetupTrack, 'status' | 'canRunNow'>): RestaurantRuntimeSetupTrack {
  const status = trackStatus(input.requirements);
  return {
    ...input,
    status,
    canRunNow: status === 'ready',
  };
}

export function buildRestaurantRuntimeSetupContract(
  input: {
    env?: EnvMap;
    now?: Date;
  } = {},
): RestaurantRuntimeSetupContract {
  const env = input.env || process.env;
  const callbackSecret = envRequirement(env, {
    id: 'callback-secret',
    key: 'RESTAURANT_AGENT_CALLBACK_SECRET',
    label: 'Signed callback secret',
    owner: 'runtime-admin',
    unlocks: ['external-receipt', 'run-health', 'watcher-memory-upsert'],
    missingImpact: 'External Lobu/OpenClaw/Hermes runs cannot write trusted receipts back to Wenai.',
  });
  const browserProfile = envRequirement(env, {
    id: 'browser-profile',
    key: 'RESTAURANT_AGENT_BROWSER_PROFILE_ID',
    label: 'Isolated browser profile slot',
    owner: 'runtime-admin',
    unlocks: ['browser-session-heartbeat', 'public-receipt-capture', 'platform-draft-review'],
    missingImpact: 'Browser actions stay as handoff manifests; Wenai cannot claim browser execution.',
  });
  const tenantScope = envRequirement(env, {
    id: 'tenant-scope',
    key: 'RESTAURANT_AGENT_TENANT_SCOPE',
    label: 'Tenant isolation policy',
    owner: 'Wenai',
    unlocks: ['multi-store-events', 'audit-partition', 'grant-revocation'],
    missingImpact: 'Multi-store execution must remain local/manual until event and memory isolation is explicit.',
  });

  const tracks: RestaurantRuntimeSetupTrack[] = [
    buildTrack({
      id: 'lobu-gateway',
      name: 'Lobu gateway and worker bridge',
      target: 'lobu',
      requirements: [
        envRequirement(env, {
          id: 'lobu-runtime-url',
          key: 'RESTAURANT_AGENT_LOBU_RUNTIME_URL',
          label: 'Lobu 试跑通道地址',
          owner: 'runtime-admin',
          unlocks: ['tenant-event-forwarding', 'worker-dispatch'],
          missingImpact: 'Restaurant tasks are queued locally and cannot be forwarded to Lobu workers.',
        }),
        envRequirement(env, {
          id: 'lobu-api-key',
          key: 'RESTAURANT_AGENT_LOBU_API_KEY',
          label: 'Lobu runtime API key slot',
          owner: 'runtime-admin',
          unlocks: ['gateway-health-probe', 'worker-dispatch'],
          missingImpact: 'Gateway health and worker forwarding remain blocked.',
        }),
        callbackSecret,
        tenantScope,
      ],
      unlocks: ['multi-tenant gateway', 'server-side secret proxy', 'worker dispatch', 'cross-session memory route'],
      nextAction: 'Configure Lobu URL/key, callback secret, and tenant scope; then use runtime-probe before forwarding any execution package.',
    }),
    buildTrack({
      id: 'openclaw-browser',
      name: 'OpenClaw browser executor',
      target: 'openclaw',
      requirements: [
        envRequirement(env, {
          id: 'openclaw-runtime-url',
          key: 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL',
          label: 'OpenClaw 试跑通道地址',
          owner: 'runtime-admin',
          unlocks: ['browser-tool-forwarding', 'session-heartbeat'],
          missingImpact: 'Browser session manifests can be generated, but no browser tool can execute.',
        }),
        envRequirement(env, {
          id: 'openclaw-api-key',
          key: 'RESTAURANT_AGENT_OPENCLAW_API_KEY',
          label: 'OpenClaw API key slot',
          owner: 'runtime-admin',
          unlocks: ['runtime-health-probe', 'browser-session-dispatch'],
          missingImpact: 'OpenClaw bridge stays blocked at server boundary.',
        }),
        browserProfile,
        callbackSecret,
      ],
      unlocks: ['persistent browser session', 'public proof capture', 'draft review steps', 'browser session health'],
      nextAction: 'Attach an isolated OpenClaw profile and callback secret before enabling browser action forwarding.',
    }),
    buildTrack({
      id: 'hermes-browser',
      name: 'Hermes / browser-use executor',
      target: 'hermes',
      requirements: [
        envRequirement(env, {
          id: 'hermes-runtime-url',
          key: 'RESTAURANT_AGENT_HERMES_RUNTIME_URL',
          label: 'Hermes 试跑通道地址',
          owner: 'runtime-admin',
          unlocks: ['browser-use-workflow', 'cloud-browser-run'],
          missingImpact: 'Hermes/browser-use workflows remain a handoff payload only.',
        }),
        envRequirement(env, {
          id: 'hermes-api-key',
          key: 'RESTAURANT_AGENT_HERMES_API_KEY',
          label: 'Hermes API key slot',
          owner: 'runtime-admin',
          unlocks: ['runtime-health-probe', 'workflow-dispatch'],
          missingImpact: 'Hermes bridge cannot receive execution packages.',
        }),
        browserProfile,
        callbackSecret,
      ],
      unlocks: ['browser workflow runner', 'screenshot receipt', 'external run recovery'],
      nextAction: 'Configure Hermes URL/key and a dedicated profile; keep merchant login approval separate from runtime health.',
    }),
    buildTrack({
      id: 'merchant-platform-auth',
      name: 'Merchant platform authorization',
      target: 'merchant-platform',
      requirements: [
        staticRequirement({
          id: 'dianping-meituan-auth',
          label: 'Dianping/Meituan merchant authorization',
          owner: 'merchant',
          source: 'merchant-authorization',
          configured: env.RESTAURANT_DIANPING_AUTH_STATUS === 'authorized',
          evidence: `RESTAURANT_DIANPING_AUTH_STATUS=${env.RESTAURANT_DIANPING_AUTH_STATUS || 'missing'}`,
          unlocks: ['store-page-proof', 'coupon-status', 'redemption-proof'],
          missingImpact: 'No backend reads, coupon checks, or redemption claims can be represented as automated.',
        }),
        staticRequirement({
          id: 'social-platform-auth',
          label: 'Xiaohongshu/Douyin/WeChat merchant authorization',
          owner: 'merchant',
          source: 'platform-account',
          configured: env.RESTAURANT_SOCIAL_AUTH_STATUS === 'authorized',
          evidence: `RESTAURANT_SOCIAL_AUTH_STATUS=${env.RESTAURANT_SOCIAL_AUTH_STATUS || 'missing'}`,
          unlocks: ['publish-link-receipt', 'comment-summary', 'private-domain-followup-summary'],
          missingImpact: 'Wenai can prepare drafts and manual checklists, but cannot claim auto-publish or auto-acquisition.',
          safetyBoundary: 'Private message raw text remains forbidden even after authorization; only merchant-provided summaries or aggregate counts can enter the ledger.',
        }),
      ],
      unlocks: ['platform receipt import', 'authorized proof capture', 'lead summary without raw private messages'],
      nextAction: 'Merchant must authorize each platform and define which actions are publish, read-only, or manual approval only.',
    }),
    buildTrack({
      id: 'pos-redemption-contract',
      name: 'POS, coupon and redemption data contract',
      target: 'pos',
      requirements: [
        staticRequirement({
          id: 'pos-data-mode',
          label: 'POS data mode',
          owner: 'merchant',
          source: 'pos-contract',
          configured: ['api', 'csv', 'sheet'].includes(env.RESTAURANT_POS_DATA_MODE || ''),
          evidence: `RESTAURANT_POS_DATA_MODE=${env.RESTAURANT_POS_DATA_MODE || 'missing'}`,
          unlocks: ['redemption-analysis', 'menu-sales-analysis'],
          missingImpact: 'True operating analysis cannot run; only manual sample receipts can be summarized.',
        }),
        envRequirement(env, {
          id: 'pos-field-dictionary',
          key: 'RESTAURANT_POS_FIELD_DICTIONARY',
          label: 'POS field dictionary',
          owner: 'ops',
          unlocks: ['field-validation', 'redemption-reconciliation'],
          missingImpact: 'Imported POS/coupon files cannot be validated against a stable schema.',
          safetyBoundary: 'The dictionary describes field names only; raw order rows, phone numbers, payments, and customer identifiers must not be stored in the runtime contract.',
        }),
      ],
      unlocks: ['manual POS import validation', 'redemption reconciliation', 'operating signal aggregation'],
      nextAction: 'Collect the POS export/API mode and a field dictionary before claiming real redemption or operating analytics.',
    }),
    buildTrack({
      id: 'staff-notification-provider',
      name: 'Staff notification delivery provider',
      target: 'merchant-platform',
      requirements: [
        envRequirement(env, {
          id: 'workchat-webhook',
          key: 'RESTAURANT_STAFF_WORKCHAT_WEBHOOK_URL',
          label: 'Staff work-chat webhook URL',
          owner: 'runtime-admin',
          unlocks: ['staff-workchat-delivery', 'manager-reminder-audit'],
          missingImpact: 'Wenai can draft staff notices, but cannot forward them to work-chat automatically.',
        }),
        envRequirement(env, {
          id: 'recipient-map',
          key: 'RESTAURANT_STAFF_RECIPIENT_MAP',
          label: 'Staff recipient mapping',
          owner: 'merchant',
          unlocks: ['owner-routing', 'shift-lead-routing', 'community-ops-routing'],
          missingImpact: 'Staff reminders cannot be routed to verified recipients.',
          safetyBoundary: 'Recipient mapping must use merchant-approved staff ids or roles only; phone numbers, private WeChat IDs, and customer identifiers must not be exposed.',
        }),
        staticRequirement({
          id: 'notification-approval',
          label: 'Staff notification approval',
          owner: 'merchant',
          source: 'merchant-authorization',
          configured: env.RESTAURANT_STAFF_NOTIFY_APPROVAL === 'approved',
          evidence: `RESTAURANT_STAFF_NOTIFY_APPROVAL=${env.RESTAURANT_STAFF_NOTIFY_APPROVAL || 'missing'}`,
          unlocks: ['staff-provider-delivery', 'send-audit-log'],
          missingImpact: 'Notification delivery remains manual copy only until the merchant approves staff reminders.',
          safetyBoundary: 'Approval covers internal staff reminders only. It does not authorize customer outreach, private-message reads, coupon redemption, or POS access.',
        }),
      ],
      unlocks: ['provider-safe staff reminder delivery', 'notification audit log', 'owner escalation routing'],
      nextAction: 'Configure staff work-chat provider, recipient mapping, and merchant approval before enabling automatic staff notifications.',
    }),
  ];

  const allRequirements = tracks.flatMap(track => track.requirements);
  const missingRequirements = allRequirements.filter(item => !item.configured);
  const blockedCapabilities = [
    {
      capability: 'auto-publish',
      reason: 'Requires browser runtime, merchant platform authorization, callback secret, and platform-specific approval policy.',
      requiredBy: ['openclaw-browser', 'hermes-browser', 'merchant-platform-auth'],
    },
    {
      capability: 'auto-acquisition',
      reason: 'Requires authorized receipt sources and aggregate lead signals; raw private messages remain forbidden.',
      requiredBy: ['merchant-platform-auth', 'pos-redemption-contract'],
    },
    {
      capability: 'auto-redemption',
      reason: 'Requires merchant platform/POS authorization and a validated redemption data contract.',
      requiredBy: ['merchant-platform-auth', 'pos-redemption-contract'],
    },
    {
      capability: 'true-operating-analysis',
      reason: 'Requires POS/coupon field dictionary and authorized aggregate data import.',
      requiredBy: ['pos-redemption-contract'],
    },
    {
      capability: 'auto-staff-notification',
      reason: 'Requires staff work-chat/SMS provider, merchant approval, recipient mapping, and audit logging.',
      requiredBy: ['staff-notification-provider'],
    },
  ].filter(item => item.requiredBy.some(trackId => tracks.find(track => track.id === trackId)?.status !== 'ready'));

  return {
    ok: true,
    generatedAt: (input.now || new Date()).toISOString(),
    payloadShape: 'restaurant-agent-runtime-setup-contract-v1',
    summary: {
      tracks: tracks.length,
      readyTracks: tracks.filter(track => track.status === 'ready').length,
      missingRequirements: missingRequirements.length,
      blockedTracks: tracks.filter(track => track.status !== 'ready').length,
      internalSolved: [
        'local task queue',
        'execution package',
        'browser session manifest',
        'grant manifest',
        'signed receipt endpoint',
        'watcher policy',
        'run health',
        'ops console',
        'staff notification handoff',
        'staff notification delivery bridge',
      ],
      externalRequired: missingRequirements.map(item => item.label),
    },
    tracks,
    blockedCapabilities,
    sourceMap: [
      {
        competitor: 'Lobu',
        publicPattern: 'gateway, sandboxed workers, shared memory, watcher lanes, secret proxy',
        wenaiContract: 'lobu-gateway track plus tenant scope, callback secret, execution package, and local ledger',
      },
      {
        competitor: 'OpenClaw',
        publicPattern: 'browser tool, profile selection, tool allow/deny policy, persistent local execution',
        wenaiContract: 'openclaw-browser track plus isolated profile, browser session registry, and tool policy evaluator',
      },
      {
        competitor: 'Hermes',
        publicPattern: 'browser-use style workflow runner with profile-backed browser actions',
        wenaiContract: 'hermes-browser track plus browser-use payload, callback receipt, and recovery ladder',
      },
      {
        competitor: 'Restaurant SaaS',
        publicPattern: 'platform authorization, coupon/redemption/POS data, lead follow-up and operating analysis',
        wenaiContract: 'merchant-platform-auth and pos-redemption-contract tracks with explicit no-auth blocking',
      },
      {
        competitor: 'Restaurant SaaS',
        publicPattern: 'staff reminders, shift owner routing, work-chat or SMS delivery, audit log',
        wenaiContract: 'staff-notification-provider track plus internal notification handoff and delivery bridge',
      },
    ],
    safetyBoundary: 'The setup contract exposes readiness, missing gates, and unlocked capabilities only. It never returns API keys, cookies, tokens, browser profile raw values, private-message raw text, POS rows, phone numbers, WeChat IDs, or customer identifiers.',
  };
}

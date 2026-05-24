import { buildRestaurantMerchantGrantManifest } from '@/lib/restaurant-agent-grant-manifest';

export type RestaurantGrantChecklistStepStatus = 'done' | 'missing' | 'blocked' | 'forbidden';

export type RestaurantGrantChecklistStep = {
  id: string;
  title: string;
  owner: 'merchant' | 'operator' | 'technical' | 'compliance';
  status: RestaurantGrantChecklistStepStatus;
  unlocks: string[];
  evidenceRequired: string[];
  blockedReason: string;
  nextAction: string;
  safetyBoundary: string;
};

export type RestaurantGrantChecklistSection = {
  id: string;
  title: string;
  purpose: string;
  steps: RestaurantGrantChecklistStep[];
};

export type RestaurantGrantChecklist = {
  ok: true;
  payloadShape: 'restaurant-agent-grant-checklist-v1';
  checklistId: string;
  merchant: {
    restaurant: string;
    operator: string;
    grantStatus: 'active' | 'blocked' | 'expired' | 'revoked';
  };
  sections: RestaurantGrantChecklistSection[];
  summary: {
    total: number;
    done: number;
    missing: number;
    blocked: number;
    forbidden: number;
    canEnableAutoPublish: boolean;
    canEnableReceiptCapture: boolean;
    canEnablePosImport: boolean;
    canEnableOperatingAnalysis: boolean;
  };
  blockedCapabilities: Array<{
    capability: 'auto-publish' | 'receipt-capture' | 'pos-import' | 'operating-analysis' | 'private-message-reading';
    reason: string;
    nextAction: string;
  }>;
  audit: {
    secretsIncluded: false;
    privateDataIncluded: false;
    rawPosRowsIncluded: false;
    generatedFrom: 'merchant-grant-and-runtime-env';
  };
  safetyBoundary: string;
  nextStep: string;
};

type EnvMap = Record<string, string | undefined>;

function hasValue(env: EnvMap, key: string): boolean {
  return typeof env[key] === 'string' && env[key]!.trim().length > 0;
}

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 37 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function makeStep(input: Omit<RestaurantGrantChecklistStep, 'blockedReason'> & { blockedReason?: string }): RestaurantGrantChecklistStep {
  return {
    ...input,
    blockedReason: input.status === 'done' || input.status === 'forbidden'
      ? input.blockedReason || ''
      : input.blockedReason || 'Required gate is not ready.',
  };
}

function countSteps(sections: RestaurantGrantChecklistSection[]) {
  return sections.flatMap(section => section.steps).reduce((acc, step) => {
    acc.total += 1;
    acc[step.status] += 1;
    return acc;
  }, {
    total: 0,
    done: 0,
    missing: 0,
    blocked: 0,
    forbidden: 0,
  } as Record<RestaurantGrantChecklistStepStatus | 'total', number>);
}

export function buildRestaurantGrantChecklist(input: {
  restaurant?: string;
  operator?: string;
  expiresAt?: string;
  revoked?: boolean;
  env?: EnvMap;
  now?: Date;
} = {}): RestaurantGrantChecklist {
  const env = input.env || process.env;
  const manifest = buildRestaurantMerchantGrantManifest(input);
  const grantActive = manifest.merchant.grantStatus === 'active';
  const grantBlockedReason = grantActive ? '' : `Merchant grant is ${manifest.merchant.grantStatus}.`;
  const runtimeReady = (hasValue(env, 'RESTAURANT_AGENT_RUNTIME_URL') && hasValue(env, 'RESTAURANT_AGENT_RUNTIME_KEY'))
    || (hasValue(env, 'RESTAURANT_AGENT_LOBU_RUNTIME_URL') && hasValue(env, 'RESTAURANT_AGENT_LOBU_API_KEY'))
    || (hasValue(env, 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL') && hasValue(env, 'RESTAURANT_AGENT_OPENCLAW_API_KEY'))
    || (hasValue(env, 'RESTAURANT_AGENT_HERMES_RUNTIME_URL') && hasValue(env, 'RESTAURANT_AGENT_HERMES_API_KEY'));
  const browserReady = hasValue(env, 'RESTAURANT_AGENT_BROWSER_PROFILE_ID') || hasValue(env, 'RESTAURANT_BROWSER_PROFILE_ID');
  const callbackReady = hasValue(env, 'RESTAURANT_AGENT_CALLBACK_SECRET');
  const socialAuthorized = manifest.channels.some(channel => channel.authorized && ['xiaohongshu', 'douyin', 'wechat-community'].includes(channel.channel));
  const dianpingAuthorized = manifest.channels.some(channel => channel.channel === 'dianping-meituan' && channel.authorized);
  const posAuthorized = manifest.channels.some(channel => channel.channel === 'pos-redemption' && channel.authorized);
  const publishAllowed = Boolean(manifest.actionPolicy.find(action => action.action === 'submit_platform_publish')?.allowed);
  const receiptAllowed = Boolean(manifest.actionPolicy.find(action => action.action === 'capture_public_receipt')?.allowed);
  const posAllowed = Boolean(manifest.actionPolicy.find(action => action.action === 'pull_pos_redemption')?.allowed);

  const sections: RestaurantGrantChecklistSection[] = [
    {
      id: 'merchant-identity',
      title: 'Merchant identity and operator approval',
      purpose: 'Prove who owns the store workflow before any platform action is handed to an external runtime.',
      steps: [
        makeStep({
          id: 'merchant-operator-approved',
          title: 'Operator approval recorded',
          owner: 'merchant',
          status: grantActive ? 'done' : 'missing',
          unlocks: ['draft generation', 'runtime handoff review'],
          evidenceRequired: ['restaurant name', 'operator owner', 'approval timestamp', 'grant expiry'],
          blockedReason: grantBlockedReason || 'RESTAURANT_AGENT_OPERATOR_APPROVAL is not approved.',
          nextAction: grantActive ? 'Keep the expiry and revocation path visible.' : 'Ask the merchant operator to approve the agent scope and expiry.',
          safetyBoundary: 'Approval is a workflow gate only; it is not a password, token or account login.',
        }),
        makeStep({
          id: 'grant-revocation-path',
          title: 'Revocation and expiry path',
          owner: 'compliance',
          status: manifest.merchant.revoked ? 'blocked' : 'done',
          unlocks: ['safe shutdown', 'runtime stop condition'],
          evidenceRequired: ['expiresAt or no-expiry decision', 'revocation flag', 'operator owner'],
          blockedReason: manifest.merchant.revoked ? 'Grant has been revoked.' : '',
          nextAction: manifest.merchant.revoked ? 'Stop external execution and request a new merchant grant.' : 'Pass expiry and revocation flags into every execution package.',
          safetyBoundary: 'Expired or revoked grants downgrade every external action to draft, checklist or manual handoff.',
        }),
      ],
    },
    {
      id: 'platform-authorization',
      title: 'Platform account authorization',
      purpose: 'Separate draft planning from real Dianping/Meituan, Xiaohongshu, Douyin and WeChat community execution.',
      steps: [
        makeStep({
          id: 'dianping-meituan-authorized',
          title: 'Dianping / Meituan merchant account grant',
          owner: 'merchant',
          status: dianpingAuthorized ? 'done' : grantActive ? 'missing' : 'blocked',
          unlocks: ['receipt capture', 'voucher evidence review'],
          evidenceRequired: ['authorized channel', 'scope', 'operator approval', 'posted link or screenshot requirement'],
          blockedReason: dianpingAuthorized ? '' : grantBlockedReason || 'Dianping/Meituan merchant authorization is missing.',
          nextAction: dianpingAuthorized ? 'Use only public receipt and approved export fields.' : 'Provide merchant-side authorization or keep this channel in manual proof mode.',
          safetyBoundary: 'Do not crawl merchant backend pages or claim redemption automation without the merchant grant and data contract.',
        }),
        makeStep({
          id: 'social-platforms-authorized',
          title: 'Xiaohongshu / Douyin / WeChat publishing grant',
          owner: 'merchant',
          status: socialAuthorized ? 'done' : grantActive ? 'missing' : 'blocked',
          unlocks: ['auto-publish handoff', 'social receipt capture'],
          evidenceRequired: ['authorized account', 'approved content scope', 'review owner', 'publish receipt fields'],
          blockedReason: socialAuthorized ? '' : grantBlockedReason || 'Social publishing authorization is missing.',
          nextAction: socialAuthorized ? 'Pass channel scope to the tool policy evaluator.' : 'Keep generated posts as drafts until account authorization exists.',
          safetyBoundary: 'Private message raw text and customer identifiers remain forbidden even when publishing is authorized.',
        }),
      ],
    },
    {
      id: 'runtime-and-browser',
      title: 'Runtime and browser readiness',
      purpose: 'Make Lobu/OpenClaw/Hermes style execution explicit before enabling browser actions.',
      steps: [
        makeStep({
          id: 'external-runtime-configured',
          title: 'External runtime URL and key configured',
          owner: 'technical',
          status: runtimeReady ? 'done' : 'missing',
          unlocks: ['worker dispatch', 'retryable external run'],
          evidenceRequired: ['runtime provider', 'health endpoint', 'tenant scope', 'secret slot configured flag'],
          blockedReason: runtimeReady ? '' : 'A Lobu/OpenClaw/Hermes runtime URL/key or generic RESTAURANT_AGENT_RUNTIME_URL/key pair is missing.',
          nextAction: runtimeReady ? 'Probe runtime health before forwarding production tasks.' : 'Attach Lobu/OpenClaw/Hermes runtime or stay in local-only mode.',
          safetyBoundary: 'Only configured/missing is returned; runtime keys never leave the server.',
        }),
        makeStep({
          id: 'isolated-browser-profile-ready',
          title: 'Isolated browser profile ready',
          owner: 'technical',
          status: browserReady ? 'done' : 'missing',
          unlocks: ['browser workflow runner', 'screenshot evidence'],
          evidenceRequired: ['profile alias', 'allowed domains', 'session owner', 'heartbeat interval'],
          blockedReason: browserReady ? '' : 'RESTAURANT_AGENT_BROWSER_PROFILE_ID is missing.',
          nextAction: browserReady ? 'Create a session manifest and require operator approval before platform submit.' : 'Create an isolated profile; do not use a personal browser by default.',
          safetyBoundary: 'Do not return cookies, tokens, verification codes, passwords or raw profile identifiers.',
        }),
        makeStep({
          id: 'signed-callback-ready',
          title: 'Signed callback proof ready',
          owner: 'technical',
          status: callbackReady ? 'done' : 'missing',
          unlocks: ['execution receipt validation', 'run health', 'watcher wakeup'],
          evidenceRequired: ['callback URL', 'HMAC signature header', 'external runId', 'screenshot or link'],
          blockedReason: callbackReady ? '' : 'RESTAURANT_AGENT_CALLBACK_SECRET is missing.',
          nextAction: callbackReady ? 'Require every external run to write back through signed receipts.' : 'Configure a callback secret before claiming real external execution.',
          safetyBoundary: 'The callback body is validated and summarized; secrets and raw private messages are not persisted.',
        }),
      ],
    },
    {
      id: 'pos-and-analysis',
      title: 'POS / redemption data contract',
      purpose: 'Turn redemption and operating analysis into a governed data import instead of a fake dashboard.',
      steps: [
        makeStep({
          id: 'pos-field-contract-ready',
          title: 'POS field dictionary and redemption source',
          owner: 'merchant',
          status: posAuthorized ? 'done' : grantActive ? 'missing' : 'blocked',
          unlocks: ['pos import', 'operating analysis', 'voucher review'],
          evidenceRequired: ['data mode', 'field dictionary', 'redemption source', 'aggregation period'],
          blockedReason: posAuthorized ? '' : grantBlockedReason || 'POS mode, field dictionary or redemption source is missing.',
          nextAction: posAuthorized ? 'Run the POS import validator before business-signal aggregation.' : 'Provide sanitized CSV/sheet/API contract; keep analysis manual until then.',
          safetyBoundary: 'Only aggregate counts and sanitized previews are accepted; raw order rows and customer identifiers are rejected.',
        }),
      ],
    },
    {
      id: 'forbidden-boundary',
      title: 'Permanent privacy boundary',
      purpose: 'Keep competitor-grade automation from crossing into private-message or personal-data collection.',
      steps: [
        makeStep({
          id: 'private-message-reading-forbidden',
          title: 'Private message raw reading remains forbidden',
          owner: 'compliance',
          status: 'forbidden',
          unlocks: [],
          evidenceRequired: [],
          blockedReason: '',
          nextAction: 'Use manually supplied aggregate counts or merchant-approved summaries only.',
          safetyBoundary: 'Do not read or store private-message raw text, phone numbers, WeChat IDs, customer names or identifiable customer data.',
        }),
      ],
    },
  ];

  const counts = countSteps(sections);
  const canEnableAutoPublish = publishAllowed && runtimeReady && browserReady && callbackReady;
  const canEnableReceiptCapture = receiptAllowed && runtimeReady && browserReady && callbackReady;
  const canEnablePosImport = posAllowed;
  const canEnableOperatingAnalysis = posAllowed;

  const blockedCapabilities: RestaurantGrantChecklist['blockedCapabilities'] = [
    canEnableAutoPublish ? undefined : {
      capability: 'auto-publish' as const,
      reason: 'Needs active merchant grant, platform authorization, runtime, isolated browser profile and signed callback.',
      nextAction: 'Finish platform, runtime, browser and callback checklist steps before enabling submit_platform_publish.',
    },
    canEnableReceiptCapture ? undefined : {
      capability: 'receipt-capture' as const,
      reason: 'Needs platform authorization plus runtime/browser/callback proof path.',
      nextAction: 'Keep receipt capture as manual link/screenshot import until those gates are done.',
    },
    canEnablePosImport ? undefined : {
      capability: 'pos-import' as const,
      reason: 'Needs POS data mode, field dictionary and redemption source under active merchant grant.',
      nextAction: 'Use the POS import validator with sanitized sample rows while waiting for the real contract.',
    },
    canEnableOperatingAnalysis ? undefined : {
      capability: 'operating-analysis' as const,
      reason: 'Needs accepted POS/redemption aggregates before operating analysis can be trusted.',
      nextAction: 'Import governed aggregate redemption data first; do not infer performance from generated content alone.',
    },
    {
      capability: 'private-message-reading',
      reason: 'Private-message raw text and customer identifiers are permanently forbidden.',
      nextAction: 'Use merchant-approved summaries or aggregate counts only.',
    },
  ].filter(Boolean) as RestaurantGrantChecklist['blockedCapabilities'];

  return {
    ok: true,
    payloadShape: 'restaurant-agent-grant-checklist-v1',
    checklistId: `restaurant-grant-checklist-${stableId([manifest.manifestId, String(counts.done), String(counts.blocked), String(counts.missing)])}`,
    merchant: {
      restaurant: manifest.merchant.restaurant,
      operator: manifest.merchant.operator,
      grantStatus: manifest.merchant.grantStatus,
    },
    sections,
    summary: {
      total: counts.total,
      done: counts.done,
      missing: counts.missing,
      blocked: counts.blocked,
      forbidden: counts.forbidden,
      canEnableAutoPublish,
      canEnableReceiptCapture,
      canEnablePosImport,
      canEnableOperatingAnalysis,
    },
    blockedCapabilities,
    audit: {
      secretsIncluded: false,
      privateDataIncluded: false,
      rawPosRowsIncluded: false,
      generatedFrom: 'merchant-grant-and-runtime-env',
    },
    safetyBoundary: 'This checklist unlocks only governed handoff gates. It does not log in, bypass captcha, auto-publish, read private messages, write redemptions, pull raw POS rows or fabricate operating results.',
    nextStep: blockedCapabilities.length
      ? `Finish ${counts.missing + counts.blocked} missing or blocked checklist steps before external execution.`
      : 'All governable gates are ready; still require per-run operator approval and signed receipt validation.',
  };
}

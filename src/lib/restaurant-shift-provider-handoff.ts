import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import type { RestaurantShiftAutopilotRunRecord } from '@/lib/restaurant-shift-autopilot-run-store';

export type RestaurantShiftProviderHandoffItem = {
  id: string;
  sourceRunId: string;
  sourceStepId: string;
  title: string;
  owner: 'runtime-admin' | 'merchant' | 'ops' | 'data-ops';
  priority: 'p0' | 'p1' | 'p2';
  capability: 'browser-runtime' | 'platform-authorization' | 'callback' | 'staff-channel' | 'operating-data' | 'provider-key';
  ask: string;
  providerEnvKeys: string[];
  merchantApprovals: string[];
  dataContracts: string[];
  healthEvidence: string[];
  status: 'ready-to-sandbox' | 'remembered-not-probed' | 'waiting-external';
  unlocks: string[];
  acceptance: string;
  stopLine: string;
};

export type RestaurantShiftProviderHandoff = {
  ok: true;
  payloadShape: 'restaurant-shift-provider-handoff-v1';
  generatedAt: string;
  summary: {
    shiftRuns: number;
    sourceActions: number;
    requests: number;
    p0: number;
    readyToSandbox: number;
    waitingExternal: number;
    providerEnvKeys: number;
    merchantApprovals: number;
    dataContracts: number;
    canClaimExternalAutomation: false;
  };
  requests: RestaurantShiftProviderHandoffItem[];
  providerEnvKeys: string[];
  merchantApprovals: string[];
  dataContracts: string[];
  nextAction: string;
  exportDigest: {
    markdown: string;
    csv: string;
  };
  safetyBoundary: string;
};

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 43 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function unique(values: string[], limit = 24) {
  return Array.from(new Set(values.map(value => value.trim()).filter(Boolean))).slice(0, limit);
}

function classify(text: string): Pick<RestaurantShiftProviderHandoffItem, 'owner' | 'priority' | 'capability' | 'providerEnvKeys' | 'merchantApprovals' | 'dataContracts'> {
  const lower = text.toLowerCase();
  if (lower.includes('callback') || lower.includes('回调')) {
    return {
      owner: 'runtime-admin',
      priority: 'p0',
      capability: 'callback',
      providerEnvKeys: ['RESTAURANT_AGENT_CALLBACK_SECRET'],
      merchantApprovals: [],
      dataContracts: ['signed external-receipt callback contract'],
    };
  }
  if (lower.includes('pos') || lower.includes('coupon') || lower.includes('redemption') || lower.includes('核销') || lower.includes('field dictionary') || lower.includes('aggregate')) {
    return {
      owner: 'data-ops',
      priority: 'p1',
      capability: 'operating-data',
      providerEnvKeys: ['RESTAURANT_POS_DATA_MODE', 'RESTAURANT_POS_FIELD_DICTIONARY'],
      merchantApprovals: ['finance/inventory owner approval'],
      dataContracts: ['aggregate POS/coupon/member export cadence', 'no-PII field dictionary'],
    };
  }
  if (lower.includes('wecom') || lower.includes('feishu') || lower.includes('dingtalk') || lower.includes('sms') || lower.includes('staff') || lower.includes('webhook')) {
    return {
      owner: 'ops',
      priority: 'p1',
      capability: 'staff-channel',
      providerEnvKeys: ['RESTAURANT_AGENT_WECOM_WEBHOOK_URL or RESTAURANT_AGENT_FEISHU_WEBHOOK_URL'],
      merchantApprovals: ['merchant-approved staff recipient roles'],
      dataContracts: ['staff-only notification audit contract'],
    };
  }
  if (lower.includes('openclaw') || lower.includes('lobu') || lower.includes('hermes') || lower.includes('runtime') || lower.includes('browser')) {
    return {
      owner: 'runtime-admin',
      priority: 'p0',
      capability: 'browser-runtime',
      providerEnvKeys: ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', 'RESTAURANT_AGENT_OPENCLAW_API_KEY', 'RESTAURANT_AGENT_LOBU_RUNTIME_URL or RESTAURANT_AGENT_HERMES_RUNTIME_URL'],
      merchantApprovals: ['browser profile isolation approval', 'runtime action scope approval'],
      dataContracts: ['signed callback receipt contract'],
    };
  }
  if (lower.includes('merchant') || lower.includes('authorization') || lower.includes('platform') || lower.includes('授权') || lower.includes('账号')) {
    return {
      owner: 'merchant',
      priority: 'p0',
      capability: 'platform-authorization',
      providerEnvKeys: ['platform runtime key name if API/browser provider is used'],
      merchantApprovals: ['Dianping/Meituan, Xiaohongshu, Douyin or WeChat merchant grant', 'allowed action scope', 'revocation owner'],
      dataContracts: ['public proof URL or screenshot receipt format'],
    };
  }
  return {
    owner: 'runtime-admin',
    priority: 'p2',
    capability: 'provider-key',
    providerEnvKeys: ['server-side provider key name'],
    merchantApprovals: [],
    dataContracts: ['accepted proof receipt format'],
  };
}

function healthEvidenceFor(health: RestaurantProviderReadinessHealth | undefined, item: ReturnType<typeof classify>) {
  if (!health) return [];
  const healthItems = health.items.filter(healthItem => {
    if (item.capability === 'callback') return healthItem.category === 'callback';
    if (item.capability === 'operating-data') return healthItem.category === 'operating-data';
    if (item.capability === 'platform-authorization') return healthItem.category === 'merchant-auth';
    if (item.capability === 'browser-runtime') return healthItem.category === 'runtime' || healthItem.category === 'callback';
    return false;
  });
  return healthItems.flatMap(healthItem => [
    `${healthItem.label}: ${healthItem.status}`,
    ...healthItem.configuredEvidence.slice(0, 2),
  ]).slice(0, 6);
}

function statusFor(health: RestaurantProviderReadinessHealth | undefined, item: ReturnType<typeof classify>): RestaurantShiftProviderHandoffItem['status'] {
  const evidence = healthEvidenceFor(health, item).join(' ').toLowerCase();
  if (evidence.includes('health-ready') && (item.capability === 'callback' || item.capability === 'operating-data' || item.capability === 'platform-authorization')) {
    return 'ready-to-sandbox';
  }
  if (evidence.includes('remembered')) return 'remembered-not-probed';
  return 'waiting-external';
}

function csvCell(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function buildExportDigest(input: {
  requests: RestaurantShiftProviderHandoffItem[];
  generatedAt: string;
  safetyBoundary: string;
}) {
  return {
    markdown: [
      '# Shift Provider Handoff',
      '',
      `Generated: ${input.generatedAt}`,
      '',
      '## Requests',
      ...input.requests.map(request => `- [${request.priority}] ${request.owner} / ${request.capability}: ${request.ask} | acceptance: ${request.acceptance}`),
      '',
      '## Safety Boundary',
      input.safetyBoundary,
    ].join('\n'),
    csv: [
      'id,priority,owner,capability,ask,provider_env_keys,merchant_approvals,data_contracts,status,acceptance,stop_line',
      ...input.requests.map(request => [
        request.id,
        request.priority,
        request.owner,
        request.capability,
        request.ask,
        request.providerEnvKeys.join(' / '),
        request.merchantApprovals.join(' / '),
        request.dataContracts.join(' / '),
        request.status,
        request.acceptance,
        request.stopLine,
      ].map(csvCell).join(',')),
    ].join('\n'),
  };
}

export function buildRestaurantShiftProviderHandoff(input: {
  shiftRuns: RestaurantShiftAutopilotRunRecord[];
  providerReadinessHealth?: RestaurantProviderReadinessHealth;
  now?: Date;
}): RestaurantShiftProviderHandoff {
  const now = input.now || new Date();
  const shiftRuns = input.shiftRuns.slice(0, 5);
  const sourceActions = shiftRuns.flatMap(run => [
    ...run.providerHeldActions,
    ...run.evidenceHeldActions.filter(action => action.proofRequired.some(item => /pos|coupon|redemption|aggregate|核销/i.test(item))),
  ]);
  const requests = sourceActions.flatMap(action => {
    const asks = unique([
      ...action.providerRequired,
      ...(action.mode === 'collect-evidence' ? action.proofRequired : []),
    ], 8);
    return asks.map(ask => {
      const classification = classify(ask);
      const healthEvidence = healthEvidenceFor(input.providerReadinessHealth, classification);
      return {
        id: `shift-provider-${stableId([action.stepId, ask])}`,
        sourceRunId: shiftRuns.find(run => run.providerHeldActions.some(item => item.stepId === action.stepId) || run.evidenceHeldActions.some(item => item.stepId === action.stepId))?.runId || 'unknown-shift-run',
        sourceStepId: action.stepId,
        title: action.title,
        ask,
        ...classification,
        healthEvidence,
        status: statusFor(input.providerReadinessHealth, classification),
        unlocks: [
          action.title,
          action.action,
          ...action.proofRequired.slice(0, 3),
        ],
        acceptance: `${classification.providerEnvKeys.concat(classification.merchantApprovals, classification.dataContracts).slice(0, 4).join(' / ')}; accepted only after health proof or signed/public receipt.`,
        stopLine: action.stopLine,
      } satisfies RestaurantShiftProviderHandoffItem;
    });
  });
  const deduped = Array.from(new Map(requests.map(request => [`${request.capability}:${request.ask}`, request])).values());
  const providerEnvKeys = unique(deduped.flatMap(item => item.providerEnvKeys), 30);
  const merchantApprovals = unique(deduped.flatMap(item => item.merchantApprovals), 30);
  const dataContracts = unique(deduped.flatMap(item => item.dataContracts), 30);
  const safetyBoundary = 'Shift Provider Handoff lists exact external asks produced by real Shift Autopilot run records. It stores key names and acceptance proof only; it does not store API key values, cookies, tokens, browser profiles, private messages, customer identifiers, coupon codes, payment ids, raw POS rows, or claim external automation.';
  const exportDigest = buildExportDigest({ requests: deduped, generatedAt: now.toISOString(), safetyBoundary });

  return {
    ok: true,
    payloadShape: 'restaurant-shift-provider-handoff-v1',
    generatedAt: now.toISOString(),
    summary: {
      shiftRuns: shiftRuns.length,
      sourceActions: sourceActions.length,
      requests: deduped.length,
      p0: deduped.filter(item => item.priority === 'p0').length,
      readyToSandbox: deduped.filter(item => item.status === 'ready-to-sandbox').length,
      waitingExternal: deduped.filter(item => item.status === 'waiting-external').length,
      providerEnvKeys: providerEnvKeys.length,
      merchantApprovals: merchantApprovals.length,
      dataContracts: dataContracts.length,
      canClaimExternalAutomation: false,
    },
    requests: deduped,
    providerEnvKeys,
    merchantApprovals,
    dataContracts,
    nextAction: deduped.length
      ? `Send ${deduped.filter(item => item.priority === 'p0').length} P0 provider asks to runtime-admin/merchant owners, then rerun Provider Health before forwarding any external action.`
      : 'Run Shift Autopilot first; this handoff only exports provider asks that came from a recorded shift run.',
    exportDigest,
    safetyBoundary,
  };
}

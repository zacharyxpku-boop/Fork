import { buildRestaurantExternalReadiness, type RestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantExternalUnlockRequestPack, type RestaurantExternalUnlockRequestPack } from '@/lib/restaurant-external-unlock-request-pack';
import { buildRestaurantPlatformConnectorMatrix, type RestaurantPlatformConnectorMatrix } from '@/lib/restaurant-platform-connector-matrix';
import { buildRestaurantProviderSetupWizard, type RestaurantProviderSetupWizard } from '@/lib/restaurant-provider-setup-wizard';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantProviderKeyGapCapability =
  | 'persistent-browser-runner'
  | 'auto-publish'
  | 'auto-lead-acquisition'
  | 'auto-coupon-redemption'
  | 'true-operating-analysis'
  | 'memory-followup'
  | 'staff-delivery';

export type RestaurantProviderKeyGapRow = {
  id: RestaurantProviderKeyGapCapability;
  label: string;
  competitorExpectation: string;
  internalNow: string[];
  externalNeeded: string[];
  requiredEnvKeys: string[];
  merchantGrant: string[];
  acceptanceEvidence: string[];
  owner: 'runtime-admin' | 'merchant' | 'ops' | 'data-ops';
  status: 'internal-ready' | 'provider-gated' | 'merchant-gated' | 'data-gated';
  nextAction: string;
  stopLine: string;
};

export type RestaurantProviderKeyGapBoard = {
  ok: true;
  payloadShape: 'restaurant-provider-key-gap-board-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  summary: {
    capabilities: number;
    internalReady: number;
    providerGated: number;
    merchantGated: number;
    dataGated: number;
    configuredEnvKeys: number;
    totalEnvKeys: number;
    canClaimCompetitorParity: false;
  };
  rows: RestaurantProviderKeyGapRow[];
  providerKeyPacket: Array<{
    key: string;
    requiredFor: string[];
    configured: boolean;
    placeholder: '<server-side-only>';
  }>;
  merchantPacket: Array<{
    grant: string;
    requiredFor: string[];
    proof: string;
  }>;
  dataPacket: Array<{
    contract: string;
    requiredFor: string[];
    proof: string;
  }>;
  firstUnlockOrder: string[];
  snapshots: {
    connectorMatrix: Pick<RestaurantPlatformConnectorMatrix, 'payloadShape' | 'verdict' | 'summary'>;
    externalUnlockRequestPack: Pick<RestaurantExternalUnlockRequestPack, 'payloadShape' | 'summary'>;
    providerSetupWizard: Pick<RestaurantProviderSetupWizard, 'payloadShape' | 'summary'>;
    readiness: RestaurantExternalReadiness['summary'];
  };
  customerCopy: string[];
  safetyBoundary: string;
};

type EnvMap = Record<string, string | undefined>;

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function hasValue(env: EnvMap, key: string): boolean {
  return typeof env[key] === 'string' && env[key]!.trim().length > 0;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function row(input: RestaurantProviderKeyGapRow): RestaurantProviderKeyGapRow {
  return input;
}

function statusFor(input: {
  env: EnvMap;
  keys: string[];
  merchantGrant: string[];
  dataRequired?: boolean;
}): RestaurantProviderKeyGapRow['status'] {
  if (input.dataRequired) return 'data-gated';
  if (input.keys.length && !input.keys.every(key => hasValue(input.env, key))) return 'provider-gated';
  if (input.merchantGrant.length) return 'merchant-gated';
  return 'internal-ready';
}

export function buildRestaurantProviderKeyGapBoard(input: RestaurantTrialIntake & {
  env?: EnvMap;
  now?: Date;
} = {}): RestaurantProviderKeyGapBoard {
  const now = input.now || new Date();
  const env = input.env || process.env;
  const restaurant = clean(input.restaurant, 'Trial restaurant');
  const offer = clean(input.offer, 'Today featured set meal');
  const connectorMatrix = buildRestaurantPlatformConnectorMatrix({ env, now });
  const externalUnlockRequestPack = buildRestaurantExternalUnlockRequestPack({ ...input, restaurant, offer, env, now });
  const providerSetupWizard = buildRestaurantProviderSetupWizard({ ...input, restaurant, offer, env, now });
  const readiness = buildRestaurantExternalReadiness(env);

  const rows: RestaurantProviderKeyGapRow[] = [
    row({
      id: 'persistent-browser-runner',
      label: 'Persistent browser runner',
      competitorExpectation: 'A cloud agent keeps an isolated browser/session alive, executes approved store tasks, emits heartbeat, screenshot and signed callback.',
      internalNow: ['runtime setup contract', 'browser runbook', 'sandbox submit package', 'receipt inbox', 'recovery plan'],
      externalNeeded: ['OpenClaw/Lobu/Hermes runtime endpoint', 'server-side API key', 'isolated browser profile', 'callback secret'],
      requiredEnvKeys: ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', 'RESTAURANT_AGENT_OPENCLAW_API_KEY', 'RESTAURANT_AGENT_BROWSER_PROFILE_ID', 'RESTAURANT_AGENT_CALLBACK_SECRET'],
      merchantGrant: ['merchant approves platform login inside isolated profile', 'operator approval scope'],
      acceptanceEvidence: ['runtime health ready', 'externalRunId', 'signed callback', 'accepted receipt'],
      owner: 'runtime-admin',
      status: statusFor({ env, keys: ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', 'RESTAURANT_AGENT_OPENCLAW_API_KEY', 'RESTAURANT_AGENT_BROWSER_PROFILE_ID', 'RESTAURANT_AGENT_CALLBACK_SECRET'], merchantGrant: ['merchant profile approval'] }),
      nextAction: 'Configure one runtime target and callback secret, then run exactly one sandbox submit attempt through receipt lifecycle.',
      stopLine: 'No real autonomous browser execution claim without endpoint, key, isolated profile, signed callback and accepted receipt.',
    }),
    row({
      id: 'auto-publish',
      label: 'Auto publish',
      competitorExpectation: 'Draft, approve, publish to Dianping/Meituan, Xiaohongshu, Douyin or WeChat, then return public proof.',
      internalNow: ['local content plan', 'platform task package', 'approval checklist', 'manual public proof validation'],
      externalNeeded: ['merchant platform authorization', 'browser runtime', 'signed proof callback'],
      requiredEnvKeys: ['RESTAURANT_DIANPING_AUTH_STATUS', 'RESTAURANT_SOCIAL_AUTH_STATUS', 'RESTAURANT_AGENT_BROWSER_PROFILE_ID', 'RESTAURANT_AGENT_CALLBACK_SECRET'],
      merchantGrant: ['allowed platforms', 'allowed action types', 'photo/video rights', 'approval and revocation owner'],
      acceptanceEvidence: ['approved draft', 'public URL or screenshot id', 'externalRunId', 'accepted publish receipt'],
      owner: 'merchant',
      status: statusFor({ env, keys: ['RESTAURANT_AGENT_BROWSER_PROFILE_ID', 'RESTAURANT_AGENT_CALLBACK_SECRET'], merchantGrant: ['platform authorization'] }),
      nextAction: 'Start with one platform and one publish-proof lane before expanding to multi-platform posting.',
      stopLine: 'No auto-publish claim when the system only produced drafts or manual copy.',
    }),
    row({
      id: 'auto-lead-acquisition',
      label: 'Auto lead acquisition',
      competitorExpectation: 'Collect reservations, group-buy claims, inquiries, visit intent and staff follow-up tasks from approved channels.',
      internalNow: ['lead inbox schema', 'customer demand gateway', 'aggregate signal extraction', 'store-manager follow-up queue'],
      externalNeeded: ['merchant-approved lead sources', 'public/aggregate signal receipts', 'staff follow-up channel'],
      requiredEnvKeys: ['RESTAURANT_SOCIAL_AUTH_STATUS', 'RESTAURANT_WECHAT_WORK_AUTH_STATUS', 'RESTAURANT_AGENT_CALLBACK_SECRET'],
      merchantGrant: ['lead source scope', 'no private-message body rule', 'staff owner and response SLA'],
      acceptanceEvidence: ['aggregate inquiry summary', 'booking/coupon sheet', 'staff acknowledgement', 'accepted lead receipt'],
      owner: 'ops',
      status: statusFor({ env, keys: ['RESTAURANT_AGENT_CALLBACK_SECRET'], merchantGrant: ['lead source scope'] }),
      nextAction: 'Use aggregate receipts first; add staff notification only after merchant approves recipient and template.',
      stopLine: 'No private message reading, customer PII capture or outreach automation without explicit merchant grant and compliant data contract.',
    }),
    row({
      id: 'auto-coupon-redemption',
      label: 'Auto coupon redemption',
      competitorExpectation: 'Track group-buy coupon claims and redemptions, reconcile store action and follow-up without leaking coupon/payment identifiers.',
      internalNow: ['redemption proof slot', 'POS import validator', 'business signal report', 'post-run review'],
      externalNeeded: ['Dianping/Meituan grant', 'redemption export/API', 'no-PII aggregate data contract'],
      requiredEnvKeys: ['RESTAURANT_DIANPING_AUTH_STATUS', 'RESTAURANT_REDEMPTION_SOURCE', 'RESTAURANT_POS_DATA_MODE'],
      merchantGrant: ['coupon action scope', 'export cadence', 'data owner and revocation owner'],
      acceptanceEvidence: ['aggregate claims', 'aggregate redemptions', 'source time window', 'accepted redemption receipt'],
      owner: 'data-ops',
      status: statusFor({ env, keys: ['RESTAURANT_REDEMPTION_SOURCE', 'RESTAURANT_POS_DATA_MODE'], merchantGrant: ['coupon grant'], dataRequired: !hasValue(env, 'RESTAURANT_REDEMPTION_SOURCE') }),
      nextAction: 'Collect a no-PII redemption sample before enabling any live redemption connector.',
      stopLine: 'No coupon redemption or payment conclusion from screenshots, chat summaries or raw coupon/payment ids.',
    }),
    row({
      id: 'true-operating-analysis',
      label: 'True operating analysis',
      competitorExpectation: 'Connect POS, sales, item mix, margin, inventory and redemption signals into actual store decisions.',
      internalNow: ['operating data contract', 'POS schema validator', 'blocked insight ledger', 'post-run review'],
      externalNeeded: ['POS mode', 'field dictionary', 'sanitized sample', 'export cadence'],
      requiredEnvKeys: ['RESTAURANT_POS_DATA_MODE', 'RESTAURANT_POS_FIELD_DICTIONARY', 'RESTAURANT_REDEMPTION_SOURCE'],
      merchantGrant: ['aggregate POS export permission', 'field dictionary signoff', 'PII exclusion rule'],
      acceptanceEvidence: ['field dictionary', 'no-PII sample', 'aggregate item/redemption counts', 'source time window'],
      owner: 'data-ops',
      status: statusFor({ env, keys: ['RESTAURANT_POS_DATA_MODE', 'RESTAURANT_POS_FIELD_DICTIONARY'], merchantGrant: ['POS data contract'], dataRequired: !hasValue(env, 'RESTAURANT_POS_FIELD_DICTIONARY') }),
      nextAction: 'Import one sanitized POS/redemption sample and keep every insight source-bound.',
      stopLine: 'No true operating analysis, margin, inventory or ROI claim without authorized aggregate operating data.',
    }),
    row({
      id: 'memory-followup',
      label: 'Memory and proactive follow-up',
      competitorExpectation: 'Remember accepted proof, aggregate signals, owner and next action, then continue the next loop without re-asking context.',
      internalNow: ['AI employee memory pack', 'receipt lifecycle memory rule', 'task watcher', 'next-loop channel plan'],
      externalNeeded: ['accepted receipt', 'aggregate signal source', 'staff owner'],
      requiredEnvKeys: ['RESTAURANT_AGENT_CALLBACK_SECRET'],
      merchantGrant: ['approved memory fields', 'staff owner', 'revocation rule'],
      acceptanceEvidence: ['accepted receipt id', 'aggregate counts', 'owner task', 'next action'],
      owner: 'ops',
      status: statusFor({ env, keys: ['RESTAURANT_AGENT_CALLBACK_SECRET'], merchantGrant: ['memory field approval'] }),
      nextAction: 'Write memory only after a receipt is accepted; keep unsupported claims in blocked evidence.',
      stopLine: 'No secrets, private-message text, customer PII, coupon codes, payment ids or raw POS rows in memory.',
    }),
    row({
      id: 'staff-delivery',
      label: 'Staff delivery',
      competitorExpectation: 'Push approved work orders, recovery alerts and store closeout to the right staff channel.',
      internalNow: ['staff handoff', 'delivery bridge', 'notification audit log', 'manager task watcher'],
      externalNeeded: ['WeCom/Feishu/DingTalk/SMS provider', 'merchant-approved recipient', 'message template'],
      requiredEnvKeys: ['RESTAURANT_WECHAT_WORK_AUTH_STATUS', 'RESTAURANT_AGENT_CALLBACK_SECRET'],
      merchantGrant: ['staff recipient scope', 'approved template', 'manual escalation owner'],
      acceptanceEvidence: ['staff acknowledgement', 'delivery receipt', 'audit event', 'closeout task status'],
      owner: 'ops',
      status: statusFor({ env, keys: ['RESTAURANT_WECHAT_WORK_AUTH_STATUS'], merchantGrant: ['staff recipient approval'] }),
      nextAction: 'Keep staff copy-ready internally until the merchant approves a delivery channel and recipient scope.',
      stopLine: 'No customer outreach, private chat reading or staff impersonation from this product.',
    }),
  ];

  const allKeys = unique(rows.flatMap(item => item.requiredEnvKeys));
  const configuredKeys = allKeys.filter(key => hasValue(env, key));
  const providerKeyPacket = allKeys.map(key => ({
    key,
    requiredFor: rows.filter(rowItem => rowItem.requiredEnvKeys.includes(key)).map(rowItem => rowItem.label),
    configured: hasValue(env, key),
    placeholder: '<server-side-only>' as const,
  }));
  const merchantPacket = unique(rows.flatMap(item => item.merchantGrant)).map(grant => ({
    grant,
    requiredFor: rows.filter(rowItem => rowItem.merchantGrant.includes(grant)).map(rowItem => rowItem.label),
    proof: 'merchant signoff with scope, expiry and revocation owner',
  }));
  const dataPacket = rows
    .filter(item => item.status === 'data-gated' || item.id === 'true-operating-analysis' || item.id === 'auto-coupon-redemption')
    .map(item => ({
      contract: item.label,
      requiredFor: item.externalNeeded,
      proof: item.acceptanceEvidence.join(' / '),
    }));

  return {
    ok: true,
    payloadShape: 'restaurant-provider-key-gap-board-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    summary: {
      capabilities: rows.length,
      internalReady: rows.filter(item => item.status === 'internal-ready').length,
      providerGated: rows.filter(item => item.status === 'provider-gated').length,
      merchantGated: rows.filter(item => item.status === 'merchant-gated').length,
      dataGated: rows.filter(item => item.status === 'data-gated').length,
      configuredEnvKeys: configuredKeys.length,
      totalEnvKeys: allKeys.length,
      canClaimCompetitorParity: false,
    },
    rows,
    providerKeyPacket,
    merchantPacket,
    dataPacket,
    firstUnlockOrder: [
      'Pick one runtime provider: OpenClaw, Lobu or Hermes.',
      'Configure runtime URL, server-side API key, isolated browser profile and callback secret.',
      'Get merchant authorization for one platform and one allowed action.',
      'Run one sandbox submit and accept one signed/public receipt.',
      'Import one no-PII POS/redemption sample before claiming operating analysis.',
    ],
    snapshots: {
      connectorMatrix: {
        payloadShape: connectorMatrix.payloadShape,
        verdict: connectorMatrix.verdict,
        summary: connectorMatrix.summary,
      },
      externalUnlockRequestPack: {
        payloadShape: externalUnlockRequestPack.payloadShape,
        summary: externalUnlockRequestPack.summary,
      },
      providerSetupWizard: {
        payloadShape: providerSetupWizard.payloadShape,
        summary: providerSetupWizard.summary,
      },
      readiness: readiness.summary,
    },
    customerCopy: [
      `${restaurant} can use the internal workbench now for plans, task packs, proof slots, receipts and owner follow-up.`,
      'Competitor-grade automation starts only after runtime key, merchant grant, signed callback and accepted receipt are present.',
      'Operating analysis starts only after a no-PII POS/redemption data contract is accepted.',
    ],
    safetyBoundary: 'Provider Key Gap Board maps missing external providers and merchant/data grants. It never asks users to paste secrets into chat/client UI, never stores cookies or raw browser profiles, never reads private messages or customer PII, and never treats drafts, plans or manual screenshots as completed external automation.',
  };
}

import { buildRestaurantAgentChannelHub, type RestaurantAgentChannelHub } from '@/lib/restaurant-agent-channel-hub';
import { buildRestaurantDayZeroMissionPack, type RestaurantDayZeroMissionPack } from '@/lib/restaurant-day-zero-mission-pack';
import { buildRestaurantOperatingDataContract, type RestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import { buildRestaurantProviderSetupPack, type RestaurantProviderSetupPack } from '@/lib/restaurant-provider-setup-pack';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantExternalUnlockCategory =
  | 'provider-key'
  | 'merchant-authorization'
  | 'browser-runtime'
  | 'callback'
  | 'staff-channel'
  | 'operating-data';

export type RestaurantExternalUnlockRequest = {
  id: string;
  category: RestaurantExternalUnlockCategory;
  owner: 'merchant' | 'runtime-admin' | 'ops' | 'data-ops';
  priority: 'p0' | 'p1' | 'p2';
  ask: string;
  evidenceRequired: string;
  unlocks: string[];
  internalFallback: string;
  stopLine: string;
};

export type RestaurantExternalUnlockSignoffItem = {
  id: string;
  owner: RestaurantExternalUnlockRequest['owner'];
  priority: RestaurantExternalUnlockRequest['priority'];
  title: string;
  acceptance: string;
  proofRequired: string;
  handoffTarget: 'merchant-owner' | 'runtime-admin' | 'ops-lead' | 'data-owner';
  status: 'ready-to-send' | 'waiting-external';
  stopLine: string;
};

export type RestaurantExternalUnlockRequestPack = {
  ok: true;
  payloadShape: 'restaurant-external-unlock-request-pack-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  summary: {
    requests: number;
    p0: number;
    p1: number;
    p2: number;
    providerKeys: number;
    merchantAuthorizations: number;
    operatingData: number;
    canStartInternally: boolean;
    canClaimExternalAutomation: boolean;
  };
  requests: RestaurantExternalUnlockRequest[];
  providerEnvKeys: Array<{
    key: string;
    owner: 'runtime-admin' | 'ops' | 'merchant';
    unlocks: string[];
    placeholder: '<server-side-only>';
  }>;
  merchantAuthorizationPacket: Array<{
    capability: string;
    ask: string;
    proof: string;
    revocationOwner: 'merchant';
  }>;
  operatingDataPacket: Array<{
    field: string;
    provider: string;
    evidenceRequired: string;
  }>;
  internalFallbacks: RestaurantProviderSetupPack['internalFallbacks'];
  signoffChecklist: RestaurantExternalUnlockSignoffItem[];
  ownerHandoff: Array<{
    owner: RestaurantExternalUnlockRequest['owner'];
    target: RestaurantExternalUnlockSignoffItem['handoffTarget'];
    requests: number;
    firstAction: string;
  }>;
  acceptanceReceiptTemplate: {
    title: string;
    requiredFields: string[];
    forbiddenFields: string[];
    acceptedWhen: string[];
  };
  exportDigest: {
    markdown: string;
    csv: string;
  };
  snapshots: {
    providerSetup: Pick<RestaurantProviderSetupPack, 'payloadShape' | 'summary'>;
    dayZeroMission: Pick<RestaurantDayZeroMissionPack, 'payloadShape' | 'summary' | 'verdict'>;
    channelHub: Pick<RestaurantAgentChannelHub, 'payloadShape' | 'summary'>;
    operatingDataContract: Pick<RestaurantOperatingDataContract, 'payloadShape' | 'summary'>;
  };
  customerHandoffCopy: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function categoryFromEnvKey(key: string): RestaurantExternalUnlockCategory {
  if (key.includes('CALLBACK')) return 'callback';
  if (key.includes('BROWSER') || key.includes('RUNTIME') || key.includes('LOBU') || key.includes('OPENCLAW') || key.includes('HERMES')) return 'browser-runtime';
  if (key.includes('STAFF') || key.includes('WECOM') || key.includes('FEISHU') || key.includes('DINGTALK')) return 'staff-channel';
  return 'provider-key';
}

function ownerFromCategory(category: RestaurantExternalUnlockCategory): RestaurantExternalUnlockRequest['owner'] {
  if (category === 'merchant-authorization') return 'merchant';
  if (category === 'operating-data') return 'data-ops';
  if (category === 'staff-channel') return 'ops';
  return 'runtime-admin';
}

function priorityFromCategory(category: RestaurantExternalUnlockCategory): RestaurantExternalUnlockRequest['priority'] {
  if (category === 'browser-runtime' || category === 'callback' || category === 'merchant-authorization') return 'p0';
  if (category === 'operating-data' || category === 'staff-channel') return 'p1';
  return 'p2';
}

function uniqueById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

function handoffTargetFor(owner: RestaurantExternalUnlockRequest['owner']): RestaurantExternalUnlockSignoffItem['handoffTarget'] {
  if (owner === 'merchant') return 'merchant-owner';
  if (owner === 'data-ops') return 'data-owner';
  if (owner === 'ops') return 'ops-lead';
  return 'runtime-admin';
}

function buildSignoffChecklist(requests: RestaurantExternalUnlockRequest[]): RestaurantExternalUnlockSignoffItem[] {
  return requests.slice(0, 18).map(request => ({
    id: `signoff-${request.id}`,
    owner: request.owner,
    priority: request.priority,
    title: request.ask,
    acceptance: `${request.evidenceRequired}; unlocks ${request.unlocks.slice(0, 3).join(' / ') || 'the scoped provider lane'}.`,
    proofRequired: request.evidenceRequired,
    handoffTarget: handoffTargetFor(request.owner),
    status: 'waiting-external',
    stopLine: request.stopLine,
  }));
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function buildExportDigest(input: {
  restaurant: string;
  offer: string;
  generatedAt: string;
  requests: RestaurantExternalUnlockRequest[];
  signoffChecklist: RestaurantExternalUnlockSignoffItem[];
  safetyBoundary: string;
}) {
  const markdown = [
    `# ${input.restaurant} / ${input.offer} Provider Unlock Signoff`,
    '',
    `Generated: ${input.generatedAt}`,
    '',
    '## P0/P1 Requests',
    ...input.requests.slice(0, 12).map(request => `- [${request.priority}] ${request.owner} / ${request.category}: ${request.ask} | proof: ${request.evidenceRequired}`),
    '',
    '## Signoff Checklist',
    ...input.signoffChecklist.slice(0, 12).map(item => `- [ ] ${item.handoffTarget}: ${item.title} | acceptance: ${item.acceptance}`),
    '',
    '## Safety Boundary',
    input.safetyBoundary,
  ].join('\n');
  const csv = [
    'id,priority,owner,handoff_target,title,proof_required,status,stop_line',
    ...input.signoffChecklist.map(item => [
      item.id,
      item.priority,
      item.owner,
      item.handoffTarget,
      item.title,
      item.proofRequired,
      item.status,
      item.stopLine,
    ].map(csvCell).join(',')),
  ].join('\n');

  return { markdown, csv };
}

export function buildRestaurantExternalUnlockRequestPack(input: RestaurantTrialIntake & {
  sampleId?: string;
  env?: Record<string, string | undefined>;
  now?: Date;
} = {}): RestaurantExternalUnlockRequestPack {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, 'Trial restaurant');
  const offer = clean(input.offer, 'Today featured set meal');
  const providerSetup = buildRestaurantProviderSetupPack({ ...input, restaurant, offer, env: input.env, now });
  const dayZeroMission = buildRestaurantDayZeroMissionPack({ ...input, restaurant, offer, sampleId: input.sampleId, now });
  const channelHub = buildRestaurantAgentChannelHub({ ...input, restaurant, offer, env: input.env, now });
  const operatingDataContract = buildRestaurantOperatingDataContract({ now });

  const envRequests = providerSetup.envTemplate.map(item => {
    const category = categoryFromEnvKey(item.key);
    return {
      id: `env-${item.key.toLowerCase()}`,
      category,
      owner: ownerFromCategory(category),
      priority: priorityFromCategory(category),
      ask: `Configure ${item.key} on the server side; do not paste the value into chat or client UI.`,
      evidenceRequired: `${item.key}=configured health state, without revealing the value`,
      unlocks: item.unlocks,
      internalFallback: 'Keep the task as manual copy/runbook and require public proof or screenshot import.',
      stopLine: 'No external worker, browser execution, staff delivery or callback closeout until the server-side key is configured and health-checked.',
    } satisfies RestaurantExternalUnlockRequest;
  });
  const merchantRequests = providerSetup.merchantRequests.map((item, index) => {
    const category: RestaurantExternalUnlockCategory = item.capability.includes('POS') || item.capability.includes('redemption')
      ? 'operating-data'
      : 'merchant-authorization';
    return {
      id: `merchant-${index}-${item.capability.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      category,
      owner: ownerFromCategory(category),
      priority: priorityFromCategory(category),
      ask: item.ask,
      evidenceRequired: item.evidence,
      unlocks: item.unlocks,
      internalFallback: category === 'operating-data'
        ? 'Use no-PII aggregate CSV/manual import and keep analysis source-bound.'
        : 'Keep publish, lead and redemption tasks in manual proof mode.',
      stopLine: category === 'operating-data'
        ? 'No true operating analysis, profit claim, coupon redemption or POS conclusion without authorized aggregate data.'
        : 'No platform login, auto-publish, private-message read, coupon action or customer contact without merchant authorization.',
    } satisfies RestaurantExternalUnlockRequest;
  });
  const channelRequests = channelHub.externalRequired.map((item, index) => ({
    id: `channel-${index}`,
    category: item.includes('WEBHOOK') || item.includes('SMS') ? 'staff-channel' as const : 'provider-key' as const,
    owner: item.includes('approval') || item.includes('recipient') ? 'merchant' as const : 'ops' as const,
    priority: 'p1' as const,
    ask: item,
    evidenceRequired: 'Configured/missing state plus merchant-approved staff recipient scope.',
    unlocks: ['staff-only delivery attempts', 'notification audit log', 'owner escalation'],
    internalFallback: 'Keep the notice copy-ready in the dashboard and let staff copy it manually.',
    stopLine: 'No customer delivery and no staff notification provider call without approved recipient mapping.',
  }));
  const requests = uniqueById([...envRequests, ...merchantRequests, ...channelRequests])
    .sort((left, right) => left.priority.localeCompare(right.priority))
    .slice(0, 24);
  const generatedAt = now.toISOString();
  const signoffChecklist = buildSignoffChecklist(requests);
  const ownerHandoff = Array.from(new Set(signoffChecklist.map(item => item.owner))).map(owner => {
    const ownerItems = signoffChecklist.filter(item => item.owner === owner);
    return {
      owner,
      target: handoffTargetFor(owner),
      requests: ownerItems.length,
      firstAction: ownerItems[0]?.title || 'No action required.',
    };
  });
  const acceptanceReceiptTemplate = {
    title: `${restaurant} / ${offer} external unlock acceptance receipt`,
    requiredFields: [
      'requestId',
      'owner',
      'handoffTarget',
      'configuredOrApprovedEvidence',
      'allowedActions',
      'expiryOrReviewDate',
      'revocationOwner',
      'signedAt',
    ],
    forbiddenFields: [
      'API keys',
      'cookies',
      'tokens',
      'browser profile files',
      'private-message raw text',
      'customer phone numbers',
      'coupon codes',
      'order-level POS rows',
    ],
    acceptedWhen: [
      'The proof matches a signoff checklist item.',
      'Merchant authorization includes allowed actions, expiry and revocation owner.',
      'Provider keys are configured server-side and health-checked without exposing values.',
      'Operating data arrives as no-PII aggregate contract with field dictionary.',
    ],
  };
  const safetyBoundary = 'External Unlock Request Pack is a setup request artifact only. It lists required keys, grants, contracts, owners and safe placeholders; it never exposes secret values, cookies, raw browser profiles, private messages, customer identifiers, coupon codes or order-level POS rows, and it does not claim external automation until health and evidence prove it.';
  const exportDigest = buildExportDigest({
    restaurant,
    offer,
    generatedAt,
    requests,
    signoffChecklist,
    safetyBoundary,
  });

  return {
    ok: true,
    payloadShape: 'restaurant-external-unlock-request-pack-v1',
    generatedAt,
    restaurant,
    offer,
    summary: {
      requests: requests.length,
      p0: requests.filter(item => item.priority === 'p0').length,
      p1: requests.filter(item => item.priority === 'p1').length,
      p2: requests.filter(item => item.priority === 'p2').length,
      providerKeys: requests.filter(item => item.category === 'provider-key' || item.category === 'browser-runtime' || item.category === 'callback').length,
      merchantAuthorizations: requests.filter(item => item.category === 'merchant-authorization').length,
      operatingData: requests.filter(item => item.category === 'operating-data').length,
      canStartInternally: dayZeroMission.summary.readyInternal > 0,
      canClaimExternalAutomation: providerSetup.summary.readyForExternalExecution,
    },
    requests,
    providerEnvKeys: providerSetup.envTemplate.map(item => ({
      key: item.key,
      owner: item.owner === 'merchant' ? 'merchant' : item.owner === 'ops' ? 'ops' : 'runtime-admin',
      unlocks: item.unlocks,
      placeholder: '<server-side-only>',
    })),
    merchantAuthorizationPacket: providerSetup.merchantRequests.map(item => ({
      capability: item.capability,
      ask: item.ask,
      proof: item.evidence,
      revocationOwner: 'merchant',
    })),
    operatingDataPacket: operatingDataContract.providerSetupRequests.map(item => ({
      field: item.provider,
      provider: item.provider,
      evidenceRequired: item.evidenceRequired,
    })),
    internalFallbacks: providerSetup.internalFallbacks,
    signoffChecklist,
    ownerHandoff,
    acceptanceReceiptTemplate,
    exportDigest,
    snapshots: {
      providerSetup: {
        payloadShape: providerSetup.payloadShape,
        summary: providerSetup.summary,
      },
      dayZeroMission: {
        payloadShape: dayZeroMission.payloadShape,
        summary: dayZeroMission.summary,
        verdict: dayZeroMission.verdict,
      },
      channelHub: {
        payloadShape: channelHub.payloadShape,
        summary: channelHub.summary,
      },
      operatingDataContract: {
        payloadShape: operatingDataContract.payloadShape,
        summary: operatingDataContract.summary,
      },
    },
    customerHandoffCopy: [
      `${restaurant} / ${offer}: Wenai can start internal Day-0 missions now, but external automation remains blocked until the P0 items are configured.`,
      'Send Provider keys only through server-side environment configuration. Do not paste keys, cookies, browser profile files, customer contacts or POS rows into the trial page.',
      'Merchant authorization must define platforms, allowed actions, expiry, revocation owner and proof callback requirements before publishing, lead follow-up or coupon/redemption automation.',
      'POS/redemption/member data should arrive as no-PII aggregate CSV/API contract with field dictionary before any operating analysis claim.',
    ],
    safetyBoundary,
  };
}

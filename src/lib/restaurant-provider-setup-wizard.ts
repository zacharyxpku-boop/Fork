import { buildRestaurantProviderSetupPack, type RestaurantProviderSetupPack, type RestaurantProviderSetupRequest } from '@/lib/restaurant-provider-setup-pack';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantProviderSetupWizardField = {
  id: string;
  label: string;
  inputType: 'url' | 'secret' | 'text' | 'textarea' | 'checkbox' | 'file-note';
  required: boolean;
  status: 'configured' | 'missing';
  owner: 'merchant' | 'ops' | 'runtime-admin' | 'legal';
  envKey?: string;
  safePlaceholder: string;
  evidenceRequired: string;
  unlocks: string[];
  nextAction: string;
};

export type RestaurantProviderSetupWizardSection = {
  id: 'runtime' | 'merchant-platforms' | 'staff-delivery' | 'operating-data' | 'proof-callback';
  title: string;
  purpose: string;
  status: 'ready' | 'blocked';
  owner: RestaurantProviderSetupWizardField['owner'];
  fields: RestaurantProviderSetupWizardField[];
};

export type RestaurantProviderSetupWizard = {
  ok: true;
  payloadShape: 'restaurant-provider-setup-wizard-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  summary: {
    sections: number;
    fields: number;
    configured: number;
    missing: number;
    completionPercent: number;
    canEnableExternalAutomation: boolean;
  };
  sections: RestaurantProviderSetupWizardSection[];
  handoffPayload: {
    restaurant: string;
    offer: string;
    configuredEnvKeys: string[];
    missingEnvKeys: string[];
    merchantApprovals: string[];
    dataContracts: string[];
    nextActions: string[];
  };
  setupPack: Pick<RestaurantProviderSetupPack, 'payloadShape' | 'summary' | 'copyForMerchant' | 'safetyBoundary'>;
  externalRequired: string[];
  safetyBoundary: string;
};

type ProvidedSetup = {
  envKeys?: string[];
  merchantApprovals?: string[];
  dataContracts?: string[];
};

function clean(value: unknown, fallback: string) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function normalizedSet(values: string[] | undefined) {
  return new Set((values || []).map(value => value.trim()).filter(Boolean));
}

function fieldId(request: RestaurantProviderSetupRequest) {
  return request.id.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
}

function inputTypeFor(request: RestaurantProviderSetupRequest): RestaurantProviderSetupWizardField['inputType'] {
  if (request.envKey?.includes('SECRET') || request.envKey?.includes('KEY')) return 'secret';
  if (request.envKey?.includes('URL') || /url|webhook/i.test(request.label)) return 'url';
  if (request.source === 'pos-contract') return 'file-note';
  if (request.source === 'merchant-authorization' || request.source === 'platform-account') return 'checkbox';
  return 'text';
}

function ownerFor(request: RestaurantProviderSetupRequest): RestaurantProviderSetupWizardField['owner'] {
  if (request.owner === 'merchant') return 'merchant';
  if (request.owner === 'ops') return 'ops';
  return 'runtime-admin';
}

function isProvided(request: RestaurantProviderSetupRequest, provided: ProvidedSetup) {
  const envKeys = normalizedSet(provided.envKeys);
  const approvals = normalizedSet(provided.merchantApprovals);
  const contracts = normalizedSet(provided.dataContracts);
  if (request.status === 'ready') return true;
  if (request.envKey && envKeys.has(request.envKey)) return true;
  if ((request.source === 'merchant-authorization' || request.source === 'platform-account') && approvals.has(request.id)) return true;
  if (request.source === 'pos-contract' && contracts.has(request.id)) return true;
  return false;
}

function safePlaceholderFor(request: RestaurantProviderSetupRequest) {
  if (request.envKey?.includes('SECRET') || request.envKey?.includes('KEY')) return '<stored server-side; never shown here>';
  if (request.envKey) return `<configure ${request.envKey} server-side>`;
  if (request.source === 'pos-contract') return 'Attach field dictionary, export cadence, owner, and a no-PII sample description.';
  if (request.source === 'merchant-authorization' || request.source === 'platform-account') return 'Confirm allowed platforms, actions, expiry, and revocation owner.';
  return 'Provide setup evidence.';
}

function toWizardField(request: RestaurantProviderSetupRequest, provided: ProvidedSetup): RestaurantProviderSetupWizardField {
  const configured = isProvided(request, provided);
  return {
    id: fieldId(request),
    label: request.label,
    inputType: inputTypeFor(request),
    required: true,
    status: configured ? 'configured' : 'missing',
    owner: ownerFor(request),
    envKey: request.envKey,
    safePlaceholder: safePlaceholderFor(request),
    evidenceRequired: request.evidence,
    unlocks: request.unlocks,
    nextAction: configured ? 'Keep this item in runtime health checks and do not expose raw values.' : request.nextAction,
  };
}

function sectionFor(request: RestaurantProviderSetupRequest): RestaurantProviderSetupWizardSection['id'] {
  if (request.trackId.includes('runtime') || request.envKey?.includes('RUNTIME') || request.envKey?.includes('BROWSER')) return 'runtime';
  if (request.trackId.includes('merchant') || request.source === 'merchant-authorization' || request.source === 'platform-account') return 'merchant-platforms';
  if (request.trackId.includes('staff') || request.envKey?.includes('STAFF') || request.envKey?.includes('WECOM') || request.envKey?.includes('FEISHU') || request.envKey?.includes('DINGTALK')) return 'staff-delivery';
  if (request.source === 'pos-contract' || request.trackId.includes('pos')) return 'operating-data';
  return 'proof-callback';
}

const SECTION_META: Record<RestaurantProviderSetupWizardSection['id'], Pick<RestaurantProviderSetupWizardSection, 'title' | 'purpose' | 'owner'>> = {
  runtime: {
    title: 'Agent runtime and isolated browser',
    purpose: 'Unlock controlled browser execution through OpenClaw/Hermes/Lobu without exposing keys, cookies or raw profiles.',
    owner: 'runtime-admin',
  },
  'merchant-platforms': {
    title: 'Merchant platform authorization',
    purpose: 'Define which Dianping/Meituan, Xiaohongshu, Douyin and WeChat actions are allowed, who approves them and when access expires.',
    owner: 'merchant',
  },
  'staff-delivery': {
    title: 'Staff delivery channel',
    purpose: 'Send staff-only work orders and recovery alerts to WeCom, Feishu, DingTalk or SMS without customer outreach.',
    owner: 'ops',
  },
  'operating-data': {
    title: 'POS, coupon and operating data',
    purpose: 'Connect redemption and operating analysis only through an approved aggregate data contract or no-PII import.',
    owner: 'merchant',
  },
  'proof-callback': {
    title: 'Proof callback and audit closeout',
    purpose: 'Require signed callbacks, public proof links or screenshots before claiming execution or business feedback.',
    owner: 'runtime-admin',
  },
};

export function buildRestaurantProviderSetupWizard(input: RestaurantTrialIntake & {
  env?: Record<string, string | undefined>;
  provided?: ProvidedSetup;
  now?: Date;
} = {}): RestaurantProviderSetupWizard {
  const restaurant = clean(input.restaurant, 'Trial restaurant');
  const offer = clean(input.offer, 'Today featured set meal');
  const setupPack = buildRestaurantProviderSetupPack({ ...input, restaurant, offer });
  const provided = input.provided || {};
  const grouped = new Map<RestaurantProviderSetupWizardSection['id'], RestaurantProviderSetupWizardField[]>();
  for (const request of setupPack.priorityRequests) {
    const sectionId = sectionFor(request);
    const fields = grouped.get(sectionId) || [];
    fields.push(toWizardField(request, provided));
    grouped.set(sectionId, fields);
  }

  const sections = (Object.keys(SECTION_META) as RestaurantProviderSetupWizardSection['id'][])
    .map(id => {
      const fields = grouped.get(id) || [];
      const meta = SECTION_META[id];
      return {
        id,
        title: meta.title,
        purpose: meta.purpose,
        owner: meta.owner,
        status: fields.length > 0 && fields.every(field => field.status === 'configured') ? 'ready' as const : 'blocked' as const,
        fields,
      };
    })
    .filter(section => section.fields.length > 0);

  const allFields = sections.flatMap(section => section.fields);
  const configured = allFields.filter(field => field.status === 'configured').length;
  const missing = allFields.length - configured;
  const missingEnvKeys = allFields.filter(field => field.status === 'missing' && field.envKey).map(field => field.envKey!);
  const configuredEnvKeys = allFields.filter(field => field.status === 'configured' && field.envKey).map(field => field.envKey!);

  return {
    ok: true,
    payloadShape: 'restaurant-provider-setup-wizard-v1',
    generatedAt: (input.now || new Date()).toISOString(),
    restaurant,
    offer,
    summary: {
      sections: sections.length,
      fields: allFields.length,
      configured,
      missing,
      completionPercent: allFields.length ? Math.round((configured / allFields.length) * 100) : 0,
      canEnableExternalAutomation: missing === 0 && setupPack.summary.readyForExternalExecution,
    },
    sections,
    handoffPayload: {
      restaurant,
      offer,
      configuredEnvKeys,
      missingEnvKeys,
      merchantApprovals: allFields.filter(field => field.owner === 'merchant').map(field => field.label),
      dataContracts: allFields.filter(field => field.id.includes('pos') || field.id.includes('redemption') || field.inputType === 'file-note').map(field => field.label),
      nextActions: allFields.filter(field => field.status === 'missing').map(field => field.nextAction).slice(0, 8),
    },
    setupPack: {
      payloadShape: setupPack.payloadShape,
      summary: setupPack.summary,
      copyForMerchant: setupPack.copyForMerchant,
      safetyBoundary: setupPack.safetyBoundary,
    },
    externalRequired: Array.from(new Set(allFields.filter(field => field.status === 'missing').map(field => field.nextAction))).slice(0, 10),
    safetyBoundary: 'Provider Setup Wizard collects setup evidence and configured/missing states only. It never returns secret values, cookies, tokens, raw browser profiles, private messages, customer identifiers, coupon codes or POS rows.',
  };
}

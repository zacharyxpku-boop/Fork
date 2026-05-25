import type { RestaurantOperatingDataContract, RestaurantOperatingDataContractTrack, RestaurantOperatingDataDomain } from '@/lib/restaurant-operating-data-contract';
import type { RestaurantPosImportReport } from '@/lib/restaurant-pos-import-validator';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantStoreDataImportSourceId =
  | 'public-profile'
  | 'publish-proof'
  | 'reservation-leads'
  | 'coupon-redemption'
  | 'pos-sales'
  | 'member-retention'
  | 'inventory-prep'
  | 'finance-margin';

export type RestaurantStoreDataImportSource = {
  id: RestaurantStoreDataImportSourceId;
  label: string;
  status: 'ready-internal' | 'sample-ready' | 'needs-field-mapping' | 'provider-gated';
  owner: 'store-manager' | 'ops' | 'data-ops' | 'runtime-admin' | 'finance';
  businessQuestion: string;
  acceptedInputs: string[];
  forbiddenInputs: string[];
  nextAction: string;
  externalRequired: string[];
};

export type RestaurantStoreDataFieldMapping = {
  canonicalField: string;
  sourceHeaders: string[];
  source: RestaurantStoreDataImportSourceId;
  required: boolean;
  status: 'mapped' | 'missing' | 'forbidden';
  owner: 'store-manager' | 'ops' | 'data-ops' | 'runtime-admin' | 'finance';
  example: string;
  validation: string;
};

export type RestaurantStoreDataImportCenter = {
  ok: true;
  payloadShape: 'restaurant-store-data-import-center-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'sample-ready' | 'needs-field-mapping' | 'provider-gated';
  summary: {
    sources: number;
    readyInternal: number;
    sampleReady: number;
    needsFieldMapping: number;
    providerGated: number;
    mappedFields: number;
    missingRequiredFields: number;
    forbiddenFields: number;
    acceptedPosImports: number;
    canClaimTrueOperatingAnalysis: false;
    canClaimAutoRedemption: false;
  };
  sources: RestaurantStoreDataImportSource[];
  fieldMappings: RestaurantStoreDataFieldMapping[];
  sampleRows: Array<Record<string, string | number>>;
  validationQueue: Array<{
    id: string;
    owner: RestaurantStoreDataImportSource['owner'];
    priority: 'today' | 'next-shift' | 'blocked';
    action: string;
    evidenceRequired: string;
    stopLine: string;
  }>;
  importChecklist: string[];
  nextBestAction: {
    label: string;
    owner: RestaurantStoreDataImportSource['owner'];
    reason: string;
    evidenceRequired: string;
  };
  externalRequired: string[];
  safetyBoundary: string;
};

const SOURCE_BY_TRACK: Partial<Record<RestaurantOperatingDataDomain, RestaurantStoreDataImportSourceId>> = {
  'public-proof': 'publish-proof',
  'reservation-leads': 'reservation-leads',
  'coupon-redemption': 'coupon-redemption',
  'pos-sales': 'pos-sales',
  'menu-inventory': 'inventory-prep',
  'member-retention': 'member-retention',
  'finance-margin': 'finance-margin',
};

function clean(value: unknown, fallback: string, max = 120): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function unique(values: string[], limit = 16): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function sourceStatus(track?: RestaurantOperatingDataContractTrack, posImport?: RestaurantPosImportReport): RestaurantStoreDataImportSource['status'] {
  if (posImport?.status === 'accepted' && (track?.id === 'coupon-redemption' || track?.id === 'pos-sales' || track?.id === 'menu-inventory')) {
    return 'sample-ready';
  }
  if (!track) return 'provider-gated';
  if (track.status === 'internal-ready') return 'ready-internal';
  if (track.status === 'manual-import-ready') return 'needs-field-mapping';
  return 'provider-gated';
}

function ownerFor(source: RestaurantStoreDataImportSourceId): RestaurantStoreDataImportSource['owner'] {
  if (source === 'finance-margin') return 'finance';
  if (source === 'publish-proof') return 'ops';
  if (source === 'public-profile' || source === 'reservation-leads') return 'store-manager';
  if (source === 'coupon-redemption' || source === 'pos-sales' || source === 'inventory-prep' || source === 'member-retention') return 'data-ops';
  return 'runtime-admin';
}

function buildSource(source: RestaurantStoreDataImportSourceId, input: {
  label: string;
  track?: RestaurantOperatingDataContractTrack;
  posImport?: RestaurantPosImportReport;
  fallbackQuestion: string;
  acceptedInputs: string[];
  forbiddenInputs: string[];
  nextAction: string;
  externalRequired: string[];
}): RestaurantStoreDataImportSource {
  const status = sourceStatus(input.track, input.posImport);
  return {
    id: source,
    label: input.label,
    status,
    owner: ownerFor(source),
    businessQuestion: input.track?.businessQuestion || input.fallbackQuestion,
    acceptedInputs: unique([...(input.track?.requiredFields || []), ...input.acceptedInputs], 8),
    forbiddenInputs: unique([...(input.track?.forbiddenFields || []), ...input.forbiddenInputs], 8),
    nextAction: status === 'sample-ready'
      ? 'Review accepted sample rows, confirm definitions, then promote aggregate receipt only.'
      : input.track?.nextAction || input.nextAction,
    externalRequired: unique([...(input.track?.externalRequired || []), ...input.externalRequired], 8),
  };
}

function splitFields(fields: string[]): string[] {
  return fields.flatMap(field => field.split(/\s+or\s+|,|\//i)).map(field => field.trim()).filter(Boolean);
}

function buildMappings(contract: RestaurantOperatingDataContract, posImport?: RestaurantPosImportReport): RestaurantStoreDataFieldMapping[] {
  const posFields = new Set([
    ...(posImport?.schema.required || []),
    ...(posImport?.schema.optional || []),
  ]);
  const acceptedPos = posImport?.status === 'accepted';
  const tracks = contract.tracks.filter(track => track.id !== 'public-proof');
  const mappings: RestaurantStoreDataFieldMapping[] = [];

  tracks.forEach(track => {
    const source = SOURCE_BY_TRACK[track.id] || 'pos-sales';
    const owner = ownerFor(source);
    splitFields(track.requiredFields).slice(0, 7).forEach(field => {
      const isPosField = posFields.has(field);
      const mappedBySample = acceptedPos && (
        source === 'coupon-redemption'
        || source === 'pos-sales'
        || source === 'inventory-prep'
      ) && isPosField;
      mappings.push({
        canonicalField: field,
        sourceHeaders: isPosField ? [field] : [],
        source,
        required: true,
        status: mappedBySample || track.status === 'internal-ready' ? 'mapped' : 'missing',
        owner,
        example: contract.importTemplate.find(item => item.field === field)?.example || field,
        validation: mappedBySample
          ? 'Accepted by sanitized POS import sample.'
          : 'Needs merchant field dictionary before import or provider claim.',
      });
    });
    splitFields(track.forbiddenFields).slice(0, 2).forEach(field => {
      mappings.push({
        canonicalField: field,
        sourceHeaders: [],
        source,
        required: false,
        status: 'forbidden',
        owner,
        example: 'do not import',
        validation: 'Reject before upload; keep outside Wenai client and API payloads.',
      });
    });
  });

  return mappings.slice(0, 48);
}

function fallbackSampleRows(input: RestaurantTrialIntake): Array<Record<string, string | number>> {
  return [
    {
      businessDate: new Date().toISOString().slice(0, 10),
      storeName: clean(input.restaurant, 'Trial restaurant'),
      offerName: clean(input.offer, 'Today offer'),
      channel: 'coupon or reservation aggregate',
      couponClaimCount: 0,
      redemptionCount: 0,
      grossSales: 0,
      orderCount: 0,
      inventoryUsed: 0,
    },
  ];
}

function nextBestActionFor(input: {
  sources: RestaurantStoreDataImportSource[];
  mappings: RestaurantStoreDataFieldMapping[];
  posImport?: RestaurantPosImportReport;
}): RestaurantStoreDataImportCenter['nextBestAction'] {
  if (input.posImport?.status === 'accepted') {
    return {
      label: 'Confirm POS Definitions',
      owner: 'data-ops',
      reason: 'A sanitized sample is accepted; the next risk is definition drift for coupon claims, redemptions, gross sales and inventory used.',
      evidenceRequired: 'merchant-approved field dictionary and date/source window',
    };
  }
  const missing = input.mappings.find(item => item.required && item.status === 'missing');
  if (missing) {
    return {
      label: `Map ${missing.canonicalField}`,
      owner: missing.owner,
      reason: `${missing.source} cannot be trusted until required fields are mapped to merchant exports.`,
      evidenceRequired: 'sample header, field meaning, date grain and no-PII confirmation',
    };
  }
  const provider = input.sources.find(item => item.status === 'provider-gated');
  return {
    label: provider ? `Unlock ${provider.label}` : 'Review Import Samples',
    owner: provider?.owner || 'data-ops',
    reason: provider?.nextAction || 'Review sample rows and promote only aggregate receipts.',
    evidenceRequired: provider?.externalRequired[0] || 'accepted sanitized aggregate import',
  };
}

export function buildRestaurantStoreDataImportCenter(input: RestaurantTrialIntake & {
  operatingDataContract: RestaurantOperatingDataContract;
  posImport?: RestaurantPosImportReport;
  now?: Date;
}): RestaurantStoreDataImportCenter {
  const contract = input.operatingDataContract;
  const posImport = input.posImport;
  const trackById = new Map(contract.tracks.map(track => [track.id, track]));
  const sources: RestaurantStoreDataImportSource[] = [
    buildSource('public-profile', {
      label: 'Public profile and menu facts',
      fallbackQuestion: 'What can be learned from public store facts before merchant data access?',
      acceptedInputs: ['public store name', 'address area', 'menu highlights', 'opening window'],
      forbiddenInputs: ['customer reviews with private identity', 'staff private contacts'],
      nextAction: 'Import public profile facts or merchant-approved menu text.',
      externalRequired: [],
    }),
    buildSource('publish-proof', {
      label: 'Publish proof and screenshots',
      track: trackById.get('public-proof'),
      fallbackQuestion: 'Which post link or screenshot proves a channel action happened?',
      acceptedInputs: ['public URL', 'screenshot id', 'operator note'],
      forbiddenInputs: ['cookies', 'tokens', 'private messages'],
      nextAction: 'Attach one public proof URL or screenshot receipt.',
      externalRequired: ['merchant platform authorization for automatic capture'],
    }),
    buildSource('reservation-leads', {
      label: 'Reservation and visit intent aggregate',
      track: trackById.get('reservation-leads'),
      fallbackQuestion: 'Which inquiries need store-manager follow-up before service time?',
      acceptedInputs: ['reservation count', 'visit intent count', 'service window'],
      forbiddenInputs: ['phone', 'WeChat ID', 'raw private message'],
      nextAction: 'Import only aggregate reservation or visit-intent counts.',
      externalRequired: ['authorized platform/API export'],
    }),
    buildSource('coupon-redemption', {
      label: 'Coupon claim and redemption export',
      track: trackById.get('coupon-redemption'),
      posImport,
      fallbackQuestion: 'Where do coupon claims fail to become in-store redemptions?',
      acceptedInputs: ['couponClaimCount', 'redemptionCount', 'businessDate'],
      forbiddenInputs: ['coupon code', 'order id', 'payment id'],
      nextAction: 'Map claim/redemption fields from merchant export.',
      externalRequired: ['POS/coupon field dictionary'],
    }),
    buildSource('pos-sales', {
      label: 'POS sales and order aggregate',
      track: trackById.get('pos-sales'),
      posImport,
      fallbackQuestion: 'Did the campaign produce real orders and sales?',
      acceptedInputs: ['grossSales', 'orderCount', 'averageTicket'],
      forbiddenInputs: ['line-item order rows', 'payment transaction id'],
      nextAction: 'Import sanitized POS aggregate rows.',
      externalRequired: ['POS CSV/API contract'],
    }),
    buildSource('member-retention', {
      label: 'Member and community retention aggregate',
      track: trackById.get('member-retention'),
      fallbackQuestion: 'Which diner segments should receive follow-up without exposing identity?',
      acceptedInputs: ['segmentName', 'followupCount', 'repeatVisitCount'],
      forbiddenInputs: ['member name', 'phone', 'WeChat ID', 'raw chat log'],
      nextAction: 'Define privacy-safe segment exports with the merchant.',
      externalRequired: ['merchant-approved member/group export'],
    }),
    buildSource('inventory-prep', {
      label: 'Inventory, prep and service capacity',
      track: trackById.get('menu-inventory'),
      posImport,
      fallbackQuestion: 'Can the kitchen support the next content push without stockout or waste?',
      acceptedInputs: ['inventoryUsed', 'prepBatch', 'stockoutCount', 'wasteCount'],
      forbiddenInputs: ['supplier bank data', 'employee private contact'],
      nextAction: 'Add aggregate prep or inventory-used fields.',
      externalRequired: ['inventory export or kitchen prep sheet'],
    }),
    buildSource('finance-margin', {
      label: 'Finance, margin and discount guardrail',
      track: trackById.get('finance-margin'),
      fallbackQuestion: 'Is the offer profitable after discount, platform fee, ingredient and labor cost?',
      acceptedInputs: ['ingredientCost', 'discountCost', 'platformFee', 'laborCost'],
      forbiddenInputs: ['bank account', 'payroll identity', 'payment transaction id'],
      nextAction: 'Collect merchant-approved aggregate cost fields before recommending discount scale.',
      externalRequired: ['finance export or owner cost sheet'],
    }),
  ];
  const fieldMappings = buildMappings(contract, posImport);
  const mappedFields = fieldMappings.filter(item => item.status === 'mapped').length;
  const missingRequiredFields = fieldMappings.filter(item => item.required && item.status === 'missing').length;
  const forbiddenFields = fieldMappings.filter(item => item.status === 'forbidden').length;
  const nextBestAction = nextBestActionFor({ sources, mappings: fieldMappings, posImport });
  const externalRequired = unique([
    ...sources.flatMap(source => source.externalRequired),
    ...contract.providerSetupRequests.map(request => request.evidenceRequired),
  ], 14);
  const providerGated = sources.filter(source => source.status === 'provider-gated').length;
  const needsFieldMapping = sources.filter(source => source.status === 'needs-field-mapping').length;
  const sampleReady = sources.filter(source => source.status === 'sample-ready').length;
  const readyInternal = sources.filter(source => source.status === 'ready-internal').length;
  return {
    ok: true,
    payloadShape: 'restaurant-store-data-import-center-v1',
    generatedAt: (input.now || new Date()).toISOString(),
    restaurant: clean(input.restaurant, 'Trial restaurant'),
    offer: clean(input.offer, 'Today featured offer'),
    verdict: providerGated > 0 ? 'provider-gated' : missingRequiredFields > 0 ? 'needs-field-mapping' : 'sample-ready',
    summary: {
      sources: sources.length,
      readyInternal,
      sampleReady,
      needsFieldMapping,
      providerGated,
      mappedFields,
      missingRequiredFields,
      forbiddenFields,
      acceptedPosImports: posImport?.status === 'accepted' ? 1 : 0,
      canClaimTrueOperatingAnalysis: false,
      canClaimAutoRedemption: false,
    },
    sources,
    fieldMappings,
    sampleRows: posImport?.sanitizedPreview.length ? posImport.sanitizedPreview : fallbackSampleRows(input),
    validationQueue: [
      {
        id: 'field-dictionary',
        owner: 'data-ops',
        priority: missingRequiredFields > 0 ? 'today' : 'next-shift',
        action: 'Confirm canonical fields, source headers, time grain and definitions for POS, coupon, member, inventory and finance exports.',
        evidenceRequired: 'merchant-approved field dictionary with no PII fields',
        stopLine: 'Do not import raw order rows, payment ids, coupon codes, private chats or customer identifiers.',
      },
      {
        id: 'sample-import',
        owner: 'store-manager',
        priority: posImport?.status === 'accepted' ? 'next-shift' : 'today',
        action: posImport?.status === 'accepted' ? 'Confirm sample import definitions before using it for operating review.' : 'Upload or paste a sanitized aggregate sample with required POS/coupon fields.',
        evidenceRequired: 'accepted sanitized aggregate sample row',
        stopLine: 'No true operating analysis claim before sample rows validate.',
      },
      {
        id: 'provider-data-contract',
        owner: 'runtime-admin',
        priority: externalRequired.length ? 'blocked' : 'next-shift',
        action: 'Collect Provider/API or browser-runner data contract only after merchant authorization and callback proof are ready.',
        evidenceRequired: 'provider mode, authorization scope, callback receipt and data-retention policy',
        stopLine: 'No automatic redemption, private-message access, POS write or finance claim without Provider proof.',
      },
    ],
    importChecklist: [
      'Use aggregate rows only: store/date/offer/channel/counts/sales/inventory/cost fields.',
      'Reject PII fields before upload: phone, WeChat, member name, address, payment id, raw chat and raw order id.',
      'Separate sample validation from Provider automation; accepted sample does not mean live API access.',
      'Attach owner, evidence, source window and next action to every import.',
      'Only promote accepted aggregate receipts into memory, business signals and next-shift decisions.',
    ],
    nextBestAction,
    externalRequired,
    safetyBoundary: 'Store Data Import Center maps and validates sanitized aggregate data only. It does not store raw POS rows, customer identifiers, private messages, payment ids, coupon codes, secrets, browser cookies, or claim automatic redemption/true operating analysis without merchant authorization, provider health, callback proof and accepted data contracts.',
  };
}

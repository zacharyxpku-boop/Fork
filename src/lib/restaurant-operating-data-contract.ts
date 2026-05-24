import { buildRestaurantExternalReadiness, type RestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantPosImportReport } from '@/lib/restaurant-pos-import-validator';

export type RestaurantOperatingDataDomain =
  | 'public-proof'
  | 'reservation-leads'
  | 'coupon-redemption'
  | 'pos-sales'
  | 'menu-inventory'
  | 'member-retention'
  | 'finance-margin';

export type RestaurantOperatingDataStatus = 'internal-ready' | 'manual-import-ready' | 'provider-gated';

export type RestaurantOperatingDataContractTrack = {
  id: RestaurantOperatingDataDomain;
  name: string;
  status: RestaurantOperatingDataStatus;
  businessQuestion: string;
  requiredFields: string[];
  optionalFields: string[];
  forbiddenFields: string[];
  internalNow: string;
  externalRequired: string[];
  evidence: string[];
  unlockedCapabilities: string[];
  nextAction: string;
};

export type RestaurantOperatingDataContract = {
  ok: true;
  payloadShape: 'restaurant-operating-data-contract';
  generatedAt: string;
  summary: {
    tracks: number;
    internalReady: number;
    manualImportReady: number;
    providerGated: number;
    acceptedReceipts: number;
    posImportsAccepted: number;
    canClaimTrueOperatingAnalysis: boolean;
    canClaimAutoRedemption: boolean;
  };
  tracks: RestaurantOperatingDataContractTrack[];
  importTemplate: Array<{
    field: string;
    requiredFor: RestaurantOperatingDataDomain[];
    type: 'date' | 'string' | 'integer' | 'money' | 'percent';
    example: string;
    piiSafe: boolean;
  }>;
  providerSetupRequests: Array<{
    provider: string;
    unlocks: string[];
    evidenceRequired: string;
  }>;
  operatingQuestions: Array<{
    question: string;
    canAnswerNow: boolean;
    blockedBy: string[];
  }>;
  safetyBoundary: string;
};

function hasEnvReadiness(readiness: RestaurantExternalReadiness, groupId: string): boolean {
  return readiness.groups.find(group => group.id === groupId)?.status === 'ready';
}

function acceptedBySignal(receipts: RestaurantAgentReceiptRecord[], signal: RestaurantAgentReceiptRecord['signalType']): number {
  return receipts.filter(receipt => receipt.status === 'accepted' && receipt.signalType === signal).length;
}

function aggregatePos(imports: RestaurantPosImportReport[]) {
  const accepted = imports.filter(item => item.status === 'accepted');
  return {
    accepted,
    couponClaims: accepted.reduce((sum, item) => sum + item.summary.couponClaimCount, 0),
    redemptions: accepted.reduce((sum, item) => sum + item.summary.redemptionCount, 0),
    orders: accepted.reduce((sum, item) => sum + item.summary.orderCount, 0),
    salesCents: accepted.reduce((sum, item) => sum + item.summary.grossSalesCents, 0),
    inventoryUsed: accepted.reduce((sum, item) => sum + item.summary.inventoryUsed, 0),
  };
}

export function buildRestaurantOperatingDataContract(input: {
  receipts?: RestaurantAgentReceiptRecord[];
  posImports?: RestaurantPosImportReport[];
  readiness?: RestaurantExternalReadiness;
  now?: Date;
} = {}): RestaurantOperatingDataContract {
  const receipts = input.receipts || [];
  const posImports = input.posImports || [];
  const readiness = input.readiness || buildRestaurantExternalReadiness();
  const pos = aggregatePos(posImports);
  const platformReady = hasEnvReadiness(readiness, 'merchant-platform-auth');
  const posReady = hasEnvReadiness(readiness, 'pos-redemption-data');
  const acceptedReceipts = receipts.filter(receipt => receipt.status === 'accepted');
  const hasProof = acceptedReceipts.length > 0;
  const hasReservations = acceptedBySignal(receipts, 'reservation') + acceptedBySignal(receipts, 'visit-intent') > 0;
  const hasRedemptionEvidence = pos.redemptions > 0 || acceptedBySignal(receipts, 'redemption') > 0;

  const tracks: RestaurantOperatingDataContractTrack[] = [
    {
      id: 'public-proof',
      name: 'Public post and proof ledger',
      status: hasProof ? 'internal-ready' : 'manual-import-ready',
      businessQuestion: 'Which store post, screenshot, or public link can be trusted as campaign proof?',
      requiredFields: ['eventId', 'channel', 'evidenceUrl or screenshotId', 'operator', 'summary'],
      optionalFields: ['externalRunId', 'signalType', 'reservationCount', 'couponClaimCount', 'visitIntentCount'],
      forbiddenFields: ['private message text', 'cookie', 'token', 'customer phone', 'customer WeChat'],
      internalNow: 'Manual public links, screenshots, signed external receipts, receipt validation, run health, and recovery queues are available.',
      externalRequired: platformReady ? [] : ['Merchant platform authorization', 'OpenClaw/Hermes/Lobu callback for automatic proof capture'],
      evidence: hasProof ? acceptedReceipts.slice(0, 3).map(receipt => receipt.receiptId) : ['receipt ledger empty'],
      unlockedCapabilities: ['publish proof review', 'content follow-up', 'run health', 'recovery'],
      nextAction: hasProof ? 'Use accepted proof to drive store-manager follow-up.' : 'Import the first public post link or screenshot receipt.',
    },
    {
      id: 'reservation-leads',
      name: 'Reservation and visit-intent leads',
      status: hasReservations ? 'internal-ready' : 'manual-import-ready',
      businessQuestion: 'Which inquiries should the store manager follow up before service time?',
      requiredFields: ['eventId', 'signalType', 'reservationCount or visitIntentCount', 'operator', 'summary'],
      optionalFields: ['channel', 'serviceWindow', 'tableNeed', 'followupOwner'],
      forbiddenFields: ['raw private messages', 'phone number', 'WeChat ID', 'customer real name'],
      internalNow: 'Aggregated reservation, inquiry, and visit-intent counts can enter business signals through receipts.',
      externalRequired: platformReady ? [] : ['Authorized platform/API export for reservation or message summary counts'],
      evidence: hasReservations ? [`reservation receipts=${acceptedBySignal(receipts, 'reservation')}`, `visit intent receipts=${acceptedBySignal(receipts, 'visit-intent')}`] : ['no reservation or visit-intent receipt yet'],
      unlockedCapabilities: ['store-manager follow-up queue', 'private-domain aggregate review'],
      nextAction: hasReservations ? 'Assign service-period follow-up and table planning.' : 'Import aggregate reservation or visit-intent counts without raw private messages.',
    },
    {
      id: 'coupon-redemption',
      name: 'Coupon claim to redemption reconciliation',
      status: hasRedemptionEvidence ? 'manual-import-ready' : 'provider-gated',
      businessQuestion: 'Where do coupon claims fail to become in-store redemptions?',
      requiredFields: ['businessDate', 'storeName', 'offerName', 'couponClaimCount', 'redemptionCount'],
      optionalFields: ['channel', 'evidenceUrl', 'externalRunId'],
      forbiddenFields: ['order detail id', 'payment id', 'customer identity', 'phone', 'address'],
      internalNow: 'Sanitized POS/coupon rows can be validated and promoted as aggregate redemption receipts.',
      externalRequired: posReady ? [] : ['POS/coupon export mode', 'redemption source', 'field dictionary'],
      evidence: hasRedemptionEvidence ? [`redemptions=${pos.redemptions}`, `couponClaims=${pos.couponClaims}`] : ['no accepted redemption import yet'],
      unlockedCapabilities: ['manual redemption review', 'coupon drop-off diagnosis'],
      nextAction: hasRedemptionEvidence ? 'Compare claim-to-redemption drop-off and adjust offer copy or store reminder.' : 'Import sanitized coupon/redemption export before claiming auto-redemption.',
    },
    {
      id: 'pos-sales',
      name: 'POS sales and order aggregate',
      status: pos.orders > 0 ? 'manual-import-ready' : 'provider-gated',
      businessQuestion: 'Did the offer produce real orders and sales after publishing?',
      requiredFields: ['businessDate', 'storeName', 'offerName', 'grossSales', 'orderCount'],
      optionalFields: ['averageTicket', 'channel', 'serviceWindow'],
      forbiddenFields: ['line-item order id', 'payment id', 'customer id', 'delivery address'],
      internalNow: 'Sanitized POS rows can validate aggregate gross sales, order count, and redemption rate.',
      externalRequired: posReady ? [] : ['POS CSV/sheet/API contract', 'field dictionary', 'merchant data authorization'],
      evidence: pos.orders > 0 ? [`orders=${pos.orders}`, `grossSales=${Math.round(pos.salesCents / 100)}`] : ['no accepted POS aggregate yet'],
      unlockedCapabilities: ['manual operating analysis', 'offer performance review'],
      nextAction: pos.orders > 0 ? 'Review sales/order trend with campaign proof and service capacity.' : 'Import a POS aggregate export; do not infer sales from content engagement.',
    },
    {
      id: 'menu-inventory',
      name: 'Menu, prep and inventory signal',
      status: pos.inventoryUsed > 0 ? 'manual-import-ready' : 'provider-gated',
      businessQuestion: 'Did the offer consume the right prep/inventory without hurting service?',
      requiredFields: ['businessDate', 'storeName', 'offerName', 'inventoryUsed'],
      optionalFields: ['prepBatch', 'stockoutCount', 'wasteCount'],
      forbiddenFields: ['supplier bank data', 'employee private contact', 'customer PII'],
      internalNow: 'Inventory used can be imported as an aggregate field with POS rows.',
      externalRequired: ['inventory export or kitchen prep sheet', 'store definition for stockout/waste'],
      evidence: pos.inventoryUsed > 0 ? [`inventoryUsed=${pos.inventoryUsed}`] : ['inventory/prep fields missing'],
      unlockedCapabilities: ['prep suggestion', 'stockout risk review'],
      nextAction: pos.inventoryUsed > 0 ? 'Tie the next content push to prep capacity.' : 'Ask store ops for aggregate prep or inventory-used fields.',
    },
    {
      id: 'member-retention',
      name: 'Member, group and repeat-visit retention',
      status: acceptedBySignal(receipts, 'private-domain-followup') > 0 ? 'manual-import-ready' : 'provider-gated',
      businessQuestion: 'Which diners should receive a follow-up offer without exposing private identity data?',
      requiredFields: ['businessDate', 'storeName', 'segmentName', 'followupCount'],
      optionalFields: ['repeatVisitCount', 'groupJoinCount', 'couponReclaimCount'],
      forbiddenFields: ['raw chat log', 'phone', 'WeChat ID', 'member name', 'address'],
      internalNow: 'Only aggregate follow-up counts and owner tasks can be stored.',
      externalRequired: ['merchant-approved member/group export', 'privacy-safe segment rules'],
      evidence: [`private-domain receipts=${acceptedBySignal(receipts, 'private-domain-followup')}`],
      unlockedCapabilities: ['private-domain follow-up plan', 'retention segment review'],
      nextAction: 'Import aggregate segment counts or keep follow-up as manual owner tasks.',
    },
    {
      id: 'finance-margin',
      name: 'Finance, margin and labor guardrail',
      status: 'provider-gated',
      businessQuestion: 'Is the offer profitable after ingredient, discount, platform and labor costs?',
      requiredFields: ['grossSales', 'ingredientCost', 'discountCost', 'platformFee', 'laborCost'],
      optionalFields: ['rentAllocation', 'wasteCost', 'refundAmount'],
      forbiddenFields: ['bank account', 'payroll identity', 'raw payment transaction id'],
      internalNow: 'Wenai can prepare the field dictionary and attach margin assumptions, but cannot claim profit analysis without merchant finance fields.',
      externalRequired: ['finance export or merchant-approved cost sheet', 'margin formula owner', 'cost field dictionary'],
      evidence: ['finance fields missing'],
      unlockedCapabilities: ['margin guardrail', 'discount safety review'],
      nextAction: 'Collect cost/margin fields before recommending discounts or scaling a coupon campaign.',
    },
  ];

  const providerSetupRequests = [
    {
      provider: 'Merchant platform auth',
      unlocks: ['auto proof capture', 'authorized publish/read-only receipts', 'reservation and lead summary'],
      evidenceRequired: 'OAuth/API authorization or merchant-approved browser profile plus action policy.',
    },
    {
      provider: 'POS/redemption data source',
      unlocks: ['auto redemption reconciliation', 'true operating analysis', 'sales/order review'],
      evidenceRequired: 'RESTAURANT_POS_DATA_MODE plus field dictionary and redemption source.',
    },
    {
      provider: 'Finance/inventory export',
      unlocks: ['margin guardrail', 'prep and stockout review', 'discount safety'],
      evidenceRequired: 'Merchant-approved aggregate cost, inventory, and labor fields without customer identifiers.',
    },
  ];

  const operatingQuestions = [
    {
      question: 'Can Wenai claim automatic publishing?',
      canAnswerNow: platformReady,
      blockedBy: platformReady ? [] : ['merchant platform authorization', 'browser/runtime callback'],
    },
    {
      question: 'Can Wenai claim automatic redemption?',
      canAnswerNow: posReady && platformReady,
      blockedBy: [platformReady ? '' : 'merchant platform authorization', posReady ? '' : 'POS/redemption data contract'].filter(Boolean),
    },
    {
      question: 'Can Wenai explain real sales and margin?',
      canAnswerNow: pos.orders > 0 && tracks.find(track => track.id === 'finance-margin')?.status !== 'provider-gated',
      blockedBy: ['finance/margin cost fields', pos.orders > 0 ? '' : 'accepted POS aggregate'].filter(Boolean),
    },
    {
      question: 'Can Wenai produce useful store actions today?',
      canAnswerNow: true,
      blockedBy: [],
    },
  ];

  const providerGated = tracks.filter(track => track.status === 'provider-gated').length;

  return {
    ok: true,
    payloadShape: 'restaurant-operating-data-contract',
    generatedAt: (input.now || new Date()).toISOString(),
    summary: {
      tracks: tracks.length,
      internalReady: tracks.filter(track => track.status === 'internal-ready').length,
      manualImportReady: tracks.filter(track => track.status === 'manual-import-ready').length,
      providerGated,
      acceptedReceipts: acceptedReceipts.length,
      posImportsAccepted: pos.accepted.length,
      canClaimTrueOperatingAnalysis: providerGated === 0 && pos.orders > 0,
      canClaimAutoRedemption: platformReady && posReady,
    },
    tracks,
    importTemplate: [
      { field: 'businessDate', requiredFor: ['coupon-redemption', 'pos-sales', 'menu-inventory'], type: 'date', example: '2026-05-23', piiSafe: true },
      { field: 'storeName', requiredFor: ['coupon-redemption', 'pos-sales', 'menu-inventory'], type: 'string', example: 'North City Noodles', piiSafe: true },
      { field: 'offerName', requiredFor: ['coupon-redemption', 'pos-sales', 'menu-inventory'], type: 'string', example: 'Lunch beef noodle set', piiSafe: true },
      { field: 'couponClaimCount', requiredFor: ['coupon-redemption'], type: 'integer', example: '38', piiSafe: true },
      { field: 'redemptionCount', requiredFor: ['coupon-redemption'], type: 'integer', example: '21', piiSafe: true },
      { field: 'grossSales', requiredFor: ['pos-sales', 'finance-margin'], type: 'money', example: '2180.00', piiSafe: true },
      { field: 'orderCount', requiredFor: ['pos-sales'], type: 'integer', example: '24', piiSafe: true },
      { field: 'inventoryUsed', requiredFor: ['menu-inventory'], type: 'integer', example: '21', piiSafe: true },
      { field: 'ingredientCost', requiredFor: ['finance-margin'], type: 'money', example: '920.00', piiSafe: true },
      { field: 'laborCost', requiredFor: ['finance-margin'], type: 'money', example: '360.00', piiSafe: true },
    ],
    providerSetupRequests,
    operatingQuestions,
    safetyBoundary: 'The operating data contract stores schemas, aggregate counts, and setup status only. It must not store or return raw POS rows, order line details, payment IDs, customer names, phones, WeChat IDs, addresses, raw private messages, cookies, tokens, or API keys.',
  };
}

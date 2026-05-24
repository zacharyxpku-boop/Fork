import type { RestaurantBusinessSignalReport } from '@/lib/restaurant-agent-business-signals';
import type { RestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import type { RestaurantPosImportReport } from '@/lib/restaurant-pos-import-validator';

export type RestaurantOperatingInsight = {
  id: string;
  label: string;
  status: 'measured' | 'directional' | 'blocked';
  value: string;
  evidence: string[];
  interpretation: string;
  nextAction: string;
};

export type RestaurantOperatingInsightReport = {
  ok: true;
  payloadShape: 'restaurant-operating-insight-report-v1';
  generatedAt: string;
  verdict: 'usable-internal-analysis' | 'needs-pos-evidence' | 'provider-gated';
  summary: {
    insights: number;
    measured: number;
    directional: number;
    blocked: number;
    acceptedPosImports: number;
    acceptedReceipts: number;
    canClaimTrueOperatingAnalysis: boolean;
  };
  insights: RestaurantOperatingInsight[];
  storeManagerActions: Array<{
    owner: 'store-manager' | 'ops' | 'finance' | 'merchant';
    action: string;
    evidence: string;
  }>;
  externalRequired: string[];
  safetyBoundary: string;
};

function money(cents: number) {
  return (cents / 100).toFixed(2);
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

function insight(input: RestaurantOperatingInsight): RestaurantOperatingInsight {
  return input;
}

export function buildRestaurantOperatingInsightReport(input: {
  posImports?: RestaurantPosImportReport[];
  operatingDataContract: RestaurantOperatingDataContract;
  businessSignals: RestaurantBusinessSignalReport;
  now?: Date;
}): RestaurantOperatingInsightReport {
  const pos = aggregatePos(input.posImports || []);
  const contract = input.operatingDataContract;
  const signals = input.businessSignals.summary;
  const hasPos = pos.accepted.length > 0 && pos.orders > 0;
  const redemptionRatePct = pos.couponClaims > 0 ? Math.round((pos.redemptions / pos.couponClaims) * 100) : 0;
  const averageTicketCents = pos.orders > 0 ? Math.round(pos.salesCents / pos.orders) : 0;
  const salesPerInventoryCents = pos.inventoryUsed > 0 ? Math.round(pos.salesCents / pos.inventoryUsed) : 0;

  const insights = [
    insight({
      id: 'receipt-quality',
      label: 'Receipt evidence quality',
      status: signals.acceptedReceipts > 0 ? 'measured' : 'directional',
      value: `${signals.acceptedReceipts} accepted / score ${signals.evidenceScoreAverage}`,
      evidence: signals.acceptedReceipts > 0 ? ['accepted receipt ledger', `average score=${signals.evidenceScoreAverage}`] : ['receipt ledger empty or simulated only'],
      interpretation: signals.acceptedReceipts > 0
        ? 'The workbench has evidence to drive follow-up, but this is not yet a platform-wide performance claim.'
        : 'No accepted receipt exists yet, so content or operating claims must stay in draft/review mode.',
      nextAction: signals.acceptedReceipts > 0 ? 'Use accepted receipts to assign owner follow-up.' : 'Import a public link, screenshot, or signed external receipt.',
    }),
    insight({
      id: 'coupon-redemption-rate',
      label: 'Coupon claim to redemption rate',
      status: hasPos && pos.couponClaims > 0 ? 'measured' : 'blocked',
      value: hasPos ? `${redemptionRatePct}% (${pos.redemptions}/${pos.couponClaims})` : 'missing POS/redemption import',
      evidence: hasPos ? pos.accepted.map(item => item.importId).slice(0, 3) : ['accepted POS import missing'],
      interpretation: hasPos
        ? 'This rate is calculated from sanitized aggregate import rows and should be confirmed against merchant coupon definitions.'
        : 'The product cannot discuss redemption performance until a sanitized POS/coupon aggregate is accepted.',
      nextAction: hasPos ? 'Ask the store manager to confirm whether claims and redemptions use the same activity window.' : 'Import sanitized couponClaimCount and redemptionCount fields.',
    }),
    insight({
      id: 'order-sales-aggregate',
      label: 'Order and gross sales aggregate',
      status: hasPos ? 'measured' : 'blocked',
      value: hasPos ? `${pos.orders} orders / gross sales ${money(pos.salesCents)}` : 'missing POS aggregate',
      evidence: hasPos ? [`accepted imports=${pos.accepted.length}`] : ['grossSales/orderCount not accepted'],
      interpretation: hasPos
        ? 'Orders and sales are usable as aggregate evidence, not as customer-level attribution.'
        : 'Do not infer revenue from content engagement, inquiries, or coupon claims.',
      nextAction: hasPos ? 'Compare service capacity and stock readiness before repeating the offer.' : 'Import grossSales and orderCount from a no-PII POS export.',
    }),
    insight({
      id: 'average-ticket',
      label: 'Average ticket guardrail',
      status: hasPos ? 'directional' : 'blocked',
      value: hasPos ? money(averageTicketCents) : 'missing order/sales aggregate',
      evidence: hasPos ? ['grossSales / orderCount'] : ['grossSales/orderCount missing'],
      interpretation: hasPos
        ? 'Average ticket is directional because item mix, discounts and platform fees still need merchant cost fields.'
        : 'Average ticket cannot be computed without accepted sales/order aggregates.',
      nextAction: hasPos ? 'Collect discount, platform fee and ingredient cost fields before recommending margin changes.' : 'Import sales and order counts first.',
    }),
    insight({
      id: 'prep-inventory-pressure',
      label: 'Prep and inventory pressure',
      status: hasPos && pos.inventoryUsed > 0 ? 'directional' : 'blocked',
      value: hasPos && pos.inventoryUsed > 0 ? `${pos.inventoryUsed} units / ${money(salesPerInventoryCents)} sales per unit` : 'inventory field missing',
      evidence: pos.inventoryUsed > 0 ? ['inventoryUsed aggregate'] : ['inventoryUsed missing'],
      interpretation: pos.inventoryUsed > 0
        ? 'Inventory pressure is only directional until stockout, waste and prep-batch definitions are confirmed.'
        : 'The product cannot advise prep or stockout risk without inventory/prep fields.',
      nextAction: pos.inventoryUsed > 0 ? 'Confirm stockout/waste definition and service window before scaling the push.' : 'Ask ops for aggregate inventoryUsed, stockoutCount or prepBatch fields.',
    }),
    insight({
      id: 'finance-margin-readiness',
      label: 'Finance and margin readiness',
      status: contract.summary.canClaimTrueOperatingAnalysis ? 'measured' : 'blocked',
      value: contract.summary.canClaimTrueOperatingAnalysis ? 'true operating analysis ready' : `${contract.summary.providerGated} data tracks provider-gated`,
      evidence: [`contract=${contract.payloadShape}`, `providerGated=${contract.summary.providerGated}`],
      interpretation: contract.summary.canClaimTrueOperatingAnalysis
        ? 'All required operating tracks are available for a stronger analysis claim.'
        : 'Margin and profit claims remain blocked until finance, cost and provider-gated fields are supplied.',
      nextAction: contract.summary.canClaimTrueOperatingAnalysis ? 'Run a reviewed operating analysis closeout.' : 'Collect cost, platform fee, labor and margin field dictionary.',
    }),
  ];

  const measured = insights.filter(item => item.status === 'measured').length;
  const directional = insights.filter(item => item.status === 'directional').length;
  const blocked = insights.filter(item => item.status === 'blocked').length;
  const verdict: RestaurantOperatingInsightReport['verdict'] = hasPos
    ? 'usable-internal-analysis'
    : contract.summary.providerGated > 0
      ? 'provider-gated'
      : 'needs-pos-evidence';

  return {
    ok: true,
    payloadShape: 'restaurant-operating-insight-report-v1',
    generatedAt: (input.now || new Date()).toISOString(),
    verdict,
    summary: {
      insights: insights.length,
      measured,
      directional,
      blocked,
      acceptedPosImports: pos.accepted.length,
      acceptedReceipts: signals.acceptedReceipts,
      canClaimTrueOperatingAnalysis: contract.summary.canClaimTrueOperatingAnalysis,
    },
    insights,
    storeManagerActions: [
      {
        owner: 'store-manager',
        action: hasPos ? 'Confirm redemption window, service capacity and next offer timing.' : 'Provide sanitized coupon/POS aggregate export.',
        evidence: hasPos ? `redemptionRate=${redemptionRatePct}%` : 'POS aggregate missing',
      },
      {
        owner: 'finance',
        action: contract.summary.canClaimTrueOperatingAnalysis ? 'Review margin closeout.' : 'Provide cost, discount, platform fee and labor field dictionary.',
        evidence: `providerGated=${contract.summary.providerGated}`,
      },
      {
        owner: 'ops',
        action: signals.acceptedReceipts > 0 ? 'Tie accepted proof to the next content and follow-up task.' : 'Collect first public proof receipt.',
        evidence: `acceptedReceipts=${signals.acceptedReceipts}`,
      },
    ],
    externalRequired: Array.from(new Set([
      ...contract.providerSetupRequests.map(item => `${item.provider}: ${item.evidenceRequired}`),
      ...insights.filter(item => item.status === 'blocked').map(item => item.nextAction),
    ])).slice(0, 10),
    safetyBoundary: 'Operating Insight Report uses accepted receipts and sanitized aggregate POS imports only. It does not store raw POS rows, order line details, payment IDs, customer names, phones, WeChat IDs, addresses, private messages, cookies, tokens, or API keys, and it does not claim true operating analysis while finance/POS/provider tracks remain gated.',
  };
}

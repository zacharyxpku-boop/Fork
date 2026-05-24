import { buildRestaurantBusinessSignals } from '@/lib/restaurant-agent-business-signals';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantActivationCockpit, type RestaurantActivationCockpit } from '@/lib/restaurant-activation-cockpit';
import { buildRestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import { buildRestaurantOperatingInsightReport, type RestaurantOperatingInsightReport } from '@/lib/restaurant-operating-insight-report';
import { buildRestaurantPlatformConnectorMatrix, type RestaurantPlatformConnectorMatrix } from '@/lib/restaurant-platform-connector-matrix';
import { buildRestaurantPosImportReport, type RestaurantPosImportReport } from '@/lib/restaurant-pos-import-validator';
import { buildRestaurantPublicIntelligenceBrief } from '@/lib/restaurant-public-intelligence-brief';
import { buildRestaurantPublicProfileIntake } from '@/lib/restaurant-public-profile-intake';
import { buildRestaurantPublicSourceHarvestPack, type RestaurantPublicSourceHarvestPack } from '@/lib/restaurant-public-source-harvest-pack';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantAiOsAuditLane = {
  id: string;
  title: string;
  status: 'usable-now' | 'manual-ready' | 'provider-required' | 'blocked' | 'forbidden';
  customerValue: string;
  proof: string[];
  nextAction: string;
};

export type RestaurantAiOsAuditReport = {
  ok: true;
  payloadShape: 'restaurant-ai-os-audit-report-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'trial-usable-now' | 'provider-setup-required' | 'production-ready';
  summary: {
    lanes: number;
    usableNow: number;
    manualReady: number;
    providerRequired: number;
    blocked: number;
    forbidden: number;
    configuredEnvKeys: number;
    totalEnvKeys: number;
  };
  lanes: RestaurantAiOsAuditLane[];
  topActions: Array<{
    owner: 'ops' | 'runtime-admin' | 'merchant' | 'store-manager' | 'finance';
    action: string;
    evidence: string;
  }>;
  cockpit: Pick<RestaurantActivationCockpit, 'payloadShape' | 'summary' | 'answerForCustomer'>;
  connectorMatrix: Pick<RestaurantPlatformConnectorMatrix, 'payloadShape' | 'verdict' | 'summary' | 'pilotOrder'>;
  publicHarvest: Pick<RestaurantPublicSourceHarvestPack, 'payloadShape' | 'verdict' | 'summary' | 'browserRunnerInstructions'>;
  operatingInsight: Pick<RestaurantOperatingInsightReport, 'payloadShape' | 'verdict' | 'summary'>;
  externalRequired: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().replace(/\s+/g, ' ').slice(0, 120) : fallback;
}

function samplePosImport(restaurant: string, offer: string, now: Date): RestaurantPosImportReport {
  return buildRestaurantPosImportReport({
    rows: [{
      businessDate: now.toISOString().slice(0, 10),
      storeName: restaurant,
      offerName: offer,
      couponClaimCount: 38,
      redemptionCount: 21,
      grossSales: 2180,
      orderCount: 24,
      inventoryUsed: 21,
    }],
    now,
  });
}

function count<T>(items: T[], predicate: (item: T) => boolean): number {
  return items.filter(predicate).length;
}

export function buildRestaurantAiOsAuditReport(input: RestaurantTrialIntake & {
  runs?: RestaurantAgentRunRecord[];
  receipts?: RestaurantAgentReceiptRecord[];
  env?: Record<string, string | undefined>;
  now?: Date;
} = {}): RestaurantAiOsAuditReport {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, 'Trial restaurant');
  const offer = clean(input.offer, 'Today featured set meal');
  const cockpit = buildRestaurantActivationCockpit({ ...input, restaurant, offer, now, env: input.env });
  const connectorMatrix = buildRestaurantPlatformConnectorMatrix({ env: input.env, now });
  const publicProfile = buildRestaurantPublicProfileIntake({
    restaurant,
    suggestedOffer: offer,
    suggestedAudience: input.audience,
    sourceUrl: input.evidence?.startsWith('http') ? input.evidence : undefined,
  });
  const publicIntelligenceBrief = buildRestaurantPublicIntelligenceBrief({ publicProfile, now });
  const publicHarvest = buildRestaurantPublicSourceHarvestPack({ publicProfile, publicIntelligenceBrief, now });
  const posImport = samplePosImport(restaurant, offer, now);
  const operatingDataContract = buildRestaurantOperatingDataContract({
    receipts: input.receipts || [],
    posImports: [posImport],
    now,
  });
  const businessSignals = buildRestaurantBusinessSignals(input.runs || [], input.receipts || [], now);
  const operatingInsight = buildRestaurantOperatingInsightReport({
    posImports: [posImport],
    operatingDataContract,
    businessSignals,
    now,
  });

  const publishReceiptCoverage = connectorMatrix.capabilityCoverage.find(item => item.capability === 'publish-receipt');
  const lanes: RestaurantAiOsAuditLane[] = [
    {
      id: 'customer-trial-workbench',
      title: 'Customer trial workbench',
      status: 'usable-now',
      customerValue: 'The customer can start from restaurant, menu item, visit reason, public evidence and local content planning instead of a generic marketing page.',
      proof: [cockpit.payloadShape, publicHarvest.payloadShape],
      nextAction: 'Import public store intel, then build the trial workflow pack.',
    },
    {
      id: 'content-proof-loop',
      title: 'Content, proof and receipt loop',
      status: publishReceiptCoverage?.internalConnectors.length ? 'manual-ready' : 'provider-required',
      customerValue: 'Content work closes through publish proof, receipt validation, owner assignment and the next store-manager action.',
      proof: ['provider receipt inbox', 'sandbox contract', 'public proof receipt'],
      nextAction: 'Collect one public link/screenshot or configure runtime callback for signed receipts.',
    },
    {
      id: 'platform-automation',
      title: 'Platform automation',
      status: connectorMatrix.summary.blocked > 0 ? 'provider-required' : 'manual-ready',
      customerValue: 'Dianping, Xiaohongshu, Douyin, WeChat community and POS automation are mapped by capability, provider key, merchant grant and acceptance evidence.',
      proof: [connectorMatrix.payloadShape, `env ${connectorMatrix.summary.configuredEnvKeys}/${connectorMatrix.summary.totalEnvKeys}`],
      nextAction: connectorMatrix.externalRequired[0] || 'Run one sandbox package through the configured connector.',
    },
    {
      id: 'operating-analysis',
      title: 'Evidence-backed operating analysis',
      status: operatingInsight.summary.canClaimTrueOperatingAnalysis ? 'manual-ready' : 'provider-required',
      customerValue: 'Redemption rate, sales, average ticket, prep pressure and finance readiness use accepted receipts plus sanitized POS aggregates only.',
      proof: [operatingInsight.payloadShape, `${operatingInsight.summary.measured} measured insights`],
      nextAction: operatingInsight.externalRequired[0] || 'Collect cost and margin fields before stronger claims.',
    },
    {
      id: 'private-data-boundary',
      title: 'Private data boundary',
      status: 'forbidden',
      customerValue: 'Raw private messages, customer phone numbers, WeChat IDs, order-level rows, cookies, tokens and API keys never enter the product output.',
      proof: ['tool policy', 'receipt validation', 'POS import validator'],
      nextAction: 'Accept only merchant-approved aggregate summaries or public proof.',
    },
  ];

  const providerRequired = count(lanes, lane => lane.status === 'provider-required');
  const blocked = count(lanes, lane => lane.status === 'blocked');
  const forbidden = count(lanes, lane => lane.status === 'forbidden');
  const manualReady = count(lanes, lane => lane.status === 'manual-ready');
  const usableNow = count(lanes, lane => lane.status === 'usable-now');
  const verdict: RestaurantAiOsAuditReport['verdict'] = providerRequired || blocked
    ? 'provider-setup-required'
    : 'production-ready';

  return {
    ok: true,
    payloadShape: 'restaurant-ai-os-audit-report-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    verdict: verdict === 'production-ready' && usableNow ? 'trial-usable-now' : verdict,
    summary: {
      lanes: lanes.length,
      usableNow,
      manualReady,
      providerRequired,
      blocked,
      forbidden,
      configuredEnvKeys: connectorMatrix.summary.configuredEnvKeys,
      totalEnvKeys: connectorMatrix.summary.totalEnvKeys,
    },
    lanes,
    topActions: [
      {
        owner: 'ops',
        action: 'Run public store intel and trial workflow pack as the first customer-facing path.',
        evidence: publicHarvest.payloadShape,
      },
      {
        owner: 'runtime-admin',
        action: connectorMatrix.externalRequired[0] || 'Run sandbox submit, callback and receipt validation.',
        evidence: connectorMatrix.payloadShape,
      },
      {
        owner: 'finance',
        action: operatingInsight.storeManagerActions.find(item => item.owner === 'finance')?.action || 'Collect POS/cost field dictionary.',
        evidence: operatingInsight.payloadShape,
      },
      {
        owner: 'merchant',
        action: 'Confirm menu price, photo rights, campaign boundary, platform grants and POS export fields.',
        evidence: 'merchant grant checklist',
      },
    ],
    cockpit: {
      payloadShape: cockpit.payloadShape,
      summary: cockpit.summary,
      answerForCustomer: cockpit.answerForCustomer,
    },
    connectorMatrix: {
      payloadShape: connectorMatrix.payloadShape,
      verdict: connectorMatrix.verdict,
      summary: connectorMatrix.summary,
      pilotOrder: connectorMatrix.pilotOrder,
    },
    publicHarvest: {
      payloadShape: publicHarvest.payloadShape,
      verdict: publicHarvest.verdict,
      summary: publicHarvest.summary,
      browserRunnerInstructions: publicHarvest.browserRunnerInstructions,
    },
    operatingInsight: {
      payloadShape: operatingInsight.payloadShape,
      verdict: operatingInsight.verdict,
      summary: operatingInsight.summary,
    },
    externalRequired: Array.from(new Set([
      ...connectorMatrix.externalRequired,
      ...publicHarvest.externalRequired,
      ...operatingInsight.externalRequired,
      ...cockpit.externalSetupRequests.map(item => `${item.capabilityId}: ${item.provider}`),
    ])).slice(0, 12),
    safetyBoundary: 'AI OS Audit Report is a customer-facing readiness and action report. It does not log in, publish, scrape private messages, redeem coupons, pull raw POS rows, expose provider keys, store cookies, or claim true production automation before provider, merchant, callback and data-contract evidence exists.',
  };
}

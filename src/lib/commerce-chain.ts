import { evaluatePerformanceImport, parsePerformanceCsv, type PerformanceImportReport } from '@/lib/performance-import';
import type { PlatformConnectorReadiness } from '@/lib/platform-connector-readiness';

export type ChainStageStatus = 'ready' | 'needs-input' | 'provider-gated';
export type ChainStageId = 'intake' | 'asset' | 'production' | 'distribution' | 'performance' | 'crm';

export interface CommerceChainInput {
  projectId?: string;
  inquiryId?: string;
  skuCount?: number;
  brief?: string;
  assets?: string[];
  channels?: string[];
  productionProviderConfigured?: boolean;
  performanceCsv?: string;
  crmOwner?: string;
  industrialAssetCount?: number;
  reportAssetCount?: number;
  assetGovernanceIssueCount?: number;
  blockedAssetCount?: number;
  rightsIssueAssetCount?: number;
  distributionPlanCount?: number;
  draftPlanCount?: number;
  readyPlanCount?: number;
  distributionDispatchCount?: number;
  executableDispatchCount?: number;
  publishedDispatchCount?: number;
  publishedWithEvidenceCount?: number;
  missingPublishEvidenceCount?: number;
  overdueReviewDispatchCount?: number;
  measuredDispatchCount?: number;
  performanceReturnCount?: number;
  scaleDecisionCount?: number;
  nextRoundAssetPlanCount?: number;
  assetMatchIssueCount?: number;
  assetMatchAmbiguousCount?: number;
  assetMatchUnmatchedCount?: number;
  platformConnectors?: PlatformConnectorReadiness;
}

export interface CommerceChainStage {
  id: ChainStageId;
  name: string;
  status: ChainStageStatus;
  evidence: string;
  nextAction: string;
}

export interface CommerceChainReport {
  verdict: 'ready-for-friend-trial' | 'needs-input' | 'provider-gated';
  stages: CommerceChainStage[];
  acceptanceGate: {
    verdict: 'pass' | 'conditional' | 'fail';
    score: number;
    p0: string[];
    p1: string[];
    checklist: Array<{
      item: string;
      ok: boolean;
      evidence: string;
      fix: string;
    }>;
  };
  operatorRunbook: Array<{
    stage: ChainStageId;
    owner: string;
    action: string;
    evidenceRequired: string;
    exitCriterion: string;
  }>;
  handoffPack: {
    title: string;
    owner: string;
    channels: string[];
    requiredAssets: string[];
    productionBrief: string;
    distributionPlan: string[];
    crmNextStep: string;
  };
  performance?: PerformanceImportReport;
  blockers: string[];
}

function hasText(value: string | undefined) {
  return Boolean(value && value.trim().length > 0);
}

function listOrDefault(values: string[] | undefined, fallback: string[]) {
  const clean = (values || []).map(item => item.trim()).filter(Boolean);
  return clean.length > 0 ? clean : fallback;
}

function makeStage(
  id: ChainStageId,
  name: string,
  status: ChainStageStatus,
  evidence: string,
  nextAction: string,
): CommerceChainStage {
  return { id, name, status, evidence, nextAction };
}

function buildOperatorRunbook(stages: CommerceChainStage[], input: CommerceChainInput) {
  const owner = input.crmOwner || 'ops';
  return stages.map(stage => {
    const evidenceRequired = stage.id === 'distribution'
      ? 'dispatch evidence URL, UTM code, result URL, and publish status'
      : stage.id === 'performance'
        ? 'CSV rows with impressions, clicks, spend, orders, and revenue'
        : stage.id === 'crm'
          ? 'CRM owner, review date, contract/payment next step, and handoff note'
          : stage.id === 'production'
            ? 'production task id or manual handoff package with accepted asset URLs'
            : 'accepted input asset or project record';
    const exitCriterion = stage.status === 'ready'
      ? `Keep evidence current: ${stage.evidence}`
      : stage.nextAction;
    return {
      stage: stage.id,
      owner,
      action: stage.status === 'ready' ? `Monitor ${stage.name} and keep the ledger updated.` : stage.nextAction,
      evidenceRequired,
      exitCriterion,
    };
  });
}

function buildAcceptanceGate(stages: CommerceChainStage[], input: CommerceChainInput, blockers: string[]): CommerceChainReport['acceptanceGate'] {
  const platformAutomationReady = Boolean(input.platformConnectors?.platformAutomationReady);
  const platformConnectorEvidence = input.platformConnectors
    ? `configured=${input.platformConnectors.configuredCapabilities.join(',') || 'none'}; missing=${input.platformConnectors.missingCapabilities.join(',') || 'none'}`
    : 'not checked';
  const checklist = [
    {
      item: 'Intake has 10 SKUs and usable brief',
      ok: stages.find(stage => stage.id === 'intake')?.status === 'ready',
      evidence: `skuCount=${input.skuCount || 0}; brief=${hasText(input.brief) ? 'present' : 'missing'}`,
      fix: 'Collect 10 SKUs, target platforms, acceptance metrics, and project owner.',
    },
    {
      item: 'Asset ledger contains production evidence',
      ok: (input.industrialAssetCount || 0) > 0 || (input.assets || []).length > 0,
      evidence: `industrialAssets=${input.industrialAssetCount || 0}; callerAssets=${input.assets?.length || 0}`,
      fix: 'Add brief, benchmark, image/video, or production handoff assets to the project ledger.',
    },
    {
      item: 'Asset rights and approval are clear',
      ok: (input.assetGovernanceIssueCount || 0) === 0,
      evidence: `assetGovernanceIssues=${input.assetGovernanceIssueCount || 0}; blocked=${input.blockedAssetCount || 0}; rightsIssues=${input.rightsIssueAssetCount || 0}`,
      fix: 'Approve production assets and resolve rights status before using them in ready distribution plans.',
    },
    {
      item: 'Distribution has executable handoff',
      ok: (input.readyPlanCount || 0) > 0 && (input.executableDispatchCount || 0) > 0,
      evidence: `plans=${input.distributionPlanCount || 0}; readyPlans=${input.readyPlanCount || 0}; dispatches=${input.distributionDispatchCount || 0}; executable=${input.executableDispatchCount || 0}`,
      fix: 'Promote distribution plans into manual-ready dispatches with UTM and evidence requirements.',
    },
    {
      item: 'Published dispatch has evidence and review timing',
      ok: (input.missingPublishEvidenceCount || 0) === 0 && (input.overdueReviewDispatchCount || 0) === 0,
      evidence: `published=${input.publishedDispatchCount || 0}; evidence=${input.publishedWithEvidenceCount || 0}; missingEvidence=${input.missingPublishEvidenceCount || 0}; overdueReviews=${input.overdueReviewDispatchCount || 0}`,
      fix: 'Attach publish evidence URLs and import performance before the next review window expires.',
    },
    {
      item: 'Performance return is persisted',
      ok: (input.measuredDispatchCount || 0) > 0 && (input.performanceReturnCount || 0) > 0,
      evidence: `measuredDispatches=${input.measuredDispatchCount || 0}; performanceReturns=${input.performanceReturnCount || 0}`,
      fix: 'Import platform CSV and attach the result to a real dispatch.',
    },
    {
      item: 'Report asset exists for CRM handoff',
      ok: (input.reportAssetCount || 0) > 0,
      evidence: `reportAssets=${input.reportAssetCount || 0}`,
      fix: 'Create a performance or CRM handoff report asset before calling the project ready.',
    },
    {
      item: 'Scale decisions have a next-round plan',
      ok: (input.scaleDecisionCount || 0) === 0 || (input.draftPlanCount || 0) > 0,
      evidence: `scaleDecisions=${input.scaleDecisionCount || 0}; draftPlans=${input.draftPlanCount || 0}`,
      fix: 'Create draft distribution plans for scale decisions so the next round is not stranded.',
    },
    {
      item: 'Next-round plans reuse winning assets',
      ok: (input.scaleDecisionCount || 0) === 0 || (input.nextRoundAssetPlanCount || 0) >= (input.scaleDecisionCount || 0),
      evidence: `scaleDecisions=${input.scaleDecisionCount || 0}; nextRoundAssetPlans=${input.nextRoundAssetPlanCount || 0}`,
      fix: 'Attach the winning creative asset id, not only the performance report, to each scale plan.',
    },
    {
      item: 'Performance attribution is resolved',
      ok: (input.scaleDecisionCount || 0) === 0 || (input.assetMatchIssueCount || 0) === 0,
      evidence: `assetMatchIssues=${input.assetMatchIssueCount || 0}; ambiguous=${input.assetMatchAmbiguousCount || 0}; unmatched=${input.assetMatchUnmatchedCount || 0}`,
      fix: 'Resolve ambiguous or unmatched platform asset names before treating scale decisions as production evidence.',
    },
    {
      item: 'Platform automation connectors are configured',
      ok: input.platformConnectors ? platformAutomationReady : true,
      evidence: platformConnectorEvidence,
      fix: 'Configure OAuth, ad account authorization, auto-publish, analytics sync, and enterprise asset permissions before claiming Kuaizi-like automation.',
    },
    {
      item: 'CRM owner can act',
      ok: hasText(input.crmOwner) || hasText(input.inquiryId),
      evidence: `crmOwner=${input.crmOwner || 'missing'}; inquiryId=${input.inquiryId || 'missing'}`,
      fix: 'Assign CRM owner or inquiryId with review date and contract/payment next step.',
    },
  ];
  const p0 = checklist.filter(item => !item.ok && [
    'Intake has 10 SKUs and usable brief',
    'Asset ledger contains production evidence',
    'Asset rights and approval are clear',
    'Distribution has executable handoff',
    'Published dispatch has evidence and review timing',
    'Performance return is persisted',
    'Report asset exists for CRM handoff',
  ].includes(item.item)).map(item => `${item.item}: ${item.fix}`);
  const p1 = [
    ...checklist.filter(item => !item.ok && !p0.some(p0Item => p0Item.startsWith(item.item))).map(item => `${item.item}: ${item.fix}`),
    ...blockers.filter(item => !p0.some(p0Item => item.includes(p0Item.split(':')[0]))),
  ];
  const score = Math.max(0, Math.round((checklist.filter(item => item.ok).length / checklist.length) * 100) - p1.length * 3);
  const providerGated = stages.some(stage => stage.status === 'provider-gated');
  const verdict = p0.length > 0
    ? 'fail'
    : providerGated || p1.length > 0 || score < 94
      ? 'conditional'
      : 'pass';
  return { verdict, score, p0, p1, checklist };
}

export function buildCommerceChain(input: CommerceChainInput): CommerceChainReport {
  const skuCount = input.skuCount || 0;
  const channels = listOrDefault(input.channels, ['TikTok Shop', 'Amazon', 'Shopify']);
  const assets = listOrDefault(input.assets, []);
  const hasBrief = hasText(input.brief);
  const hasAssets = assets.length > 0;
  const hasChannels = channels.length > 0;
  const hasIndustrialAssets = (input.industrialAssetCount || 0) > 0;
  const hasDistributionPlans = (input.distributionPlanCount || 0) > 0;
  const hasReadyPlans = (input.readyPlanCount || 0) > 0;
  const hasDistributionDispatch = (input.distributionDispatchCount || 0) > 0;
  const hasExecutableDispatch = (input.executableDispatchCount || 0) > 0;
  const hasMeasuredDispatch = (input.measuredDispatchCount || 0) > 0;
  const hasExecutableDistribution = hasReadyPlans || hasExecutableDispatch || hasMeasuredDispatch;
  const hasPerformanceReturns = (input.performanceReturnCount || 0) > 0;
  const scaleDecisionCount = input.scaleDecisionCount || 0;
  const performanceRows = input.performanceCsv ? parsePerformanceCsv(input.performanceCsv) : [];
  const performance = performanceRows.length > 0 ? evaluatePerformanceImport(performanceRows) : undefined;
  const platformAutomationReady = Boolean(input.platformConnectors?.platformAutomationReady);
  const platformConnectorEvidence = input.platformConnectors
    ? ` Platform connectors: configured=${input.platformConnectors.configuredCapabilities.join(',') || 'none'}; missing=${input.platformConnectors.missingCapabilities.join(',') || 'none'}.`
    : '';

  const stages: CommerceChainStage[] = [
    makeStage(
      'intake',
      'Qualified 10 SKU intake',
      skuCount >= 10 && hasBrief ? 'ready' : 'needs-input',
      skuCount >= 10 && hasBrief
        ? `${skuCount} SKUs and a usable brief are present.`
        : 'SKU count or brief is missing, so the POC cannot enter a stable production loop.',
      'Add 10 SKUs, target platforms, acceptance metrics, and an owner.',
    ),
    makeStage(
      'asset',
      'Asset and evidence pack',
      hasAssets || hasIndustrialAssets ? 'ready' : 'needs-input',
      hasAssets || hasIndustrialAssets
        ? `${assets.length} caller assets and ${input.industrialAssetCount || 0} industrial assets are available.`
        : 'Product assets, benchmark evidence, or proof material are missing.',
      'Attach product images, competitor links, review evidence, price, and compliance limits.',
    ),
    makeStage(
      'production',
      'Creative production handoff',
      input.productionProviderConfigured ? 'ready' : 'provider-gated',
      input.productionProviderConfigured
        ? 'External production provider is configured and can create real production tasks.'
        : 'Production provider is not configured; Wenai can still export handoff packs and manual briefs.',
      'Configure Kuaizi/image/video providers or keep the workflow explicitly manual.',
    ),
    makeStage(
      'distribution',
      'Distribution execution',
      hasExecutableDistribution ? 'ready' : 'needs-input',
      hasDistributionPlans || hasDistributionDispatch
        ? `Channels: ${hasChannels ? channels.join(' / ') : 'none'}; plans: ${input.distributionPlanCount || 0}; readyPlans: ${input.readyPlanCount || 0}; dispatches: ${input.distributionDispatchCount || 0}; executable: ${input.executableDispatchCount || 0}; published: ${input.publishedDispatchCount || 0}; evidence: ${input.publishedWithEvidenceCount || 0}; measured: ${input.measuredDispatchCount || 0}.${platformConnectorEvidence}`
        : 'No publishing channel, distribution plan, or dispatch record is present.',
      hasMeasuredDispatch
        ? 'Turn measured dispatches into scale / iterate / pause decisions.'
        : hasDistributionPlans
          ? 'Promote draft plans into ready/manual dispatch handoff packages with UTM/CSV return requirements.'
          : 'Create dispatch handoff packages with UTM/CSV return requirements; do not claim automatic OAuth publishing.',
    ),
    makeStage(
      'performance',
      'Performance feedback loop',
      performance || hasPerformanceReturns ? 'ready' : 'needs-input',
      performance
        ? `${performance.rows.length} returned performance rows can drive the next iteration.`
        : hasPerformanceReturns
          ? `${input.performanceReturnCount} persisted performance returns are available; scale decisions: ${scaleDecisionCount}.`
          : 'No platform performance return is available for scale / iterate / pause decisions.',
      hasPerformanceReturns || performance
        ? 'Write the return decision into CRM and move scale assets into the next SKU batch.'
        : 'Import impressions, clicks, spend, orders, and revenue CSV.',
    ),
    makeStage(
      'crm',
      'CRM next step',
      hasText(input.crmOwner) || hasText(input.inquiryId) ? 'ready' : 'needs-input',
      hasText(input.crmOwner) || hasText(input.inquiryId)
        ? `${input.crmOwner || input.inquiryId} owns the next step.`
        : 'No CRM owner or inquiryId is present, so delivery can stall after the report.',
      'Assign owner, review date, contract stage, and payment/contract next step.',
    ),
  ];

  const blockers = stages
    .filter(stage => stage.status !== 'ready')
    .map(stage => `${stage.name}: ${stage.nextAction}`);
  if (input.platformConnectors && !platformAutomationReady) {
    blockers.push(`Platform automation connectors: ${input.platformConnectors.missingCapabilities.join(', ') || 'missing'}`);
  }
  const providerGated = stages.some(stage => stage.status === 'provider-gated');
  const verdict = blockers.length === 0
    ? 'ready-for-friend-trial'
    : providerGated
      ? 'provider-gated'
      : 'needs-input';

  const bestPerformance = performance?.decisions.find(item => item.decision === 'scale');
  return {
    verdict,
    stages,
    acceptanceGate: buildAcceptanceGate(stages, input, blockers),
    operatorRunbook: buildOperatorRunbook(stages, input),
    handoffPack: {
      title: `${skuCount || 10} SKU ecommerce content chain`,
      owner: input.crmOwner || 'unassigned',
      channels,
      requiredAssets: [
        'SKU list with price and platform',
        'benchmark links or screenshots',
        'product images and compliance notes',
        'acceptance metric: CTR / conversion / ROAS / review outcome',
      ],
      productionBrief: hasBrief
        ? input.brief!.trim()
        : 'Add product, selling points, audience, platform, and acceptance metrics before production.',
      distributionPlan: channels.map(channel => `${channel}: publish/test with UTM or platform CSV export`),
      crmNextStep: bestPerformance
        ? `Prioritize scale for ${bestPerformance.row.sku} / ${bestPerformance.row.asset}, then review the next SKU batch.`
        : scaleDecisionCount > 0
          ? `${scaleDecisionCount} scale decisions are already persisted; move winning assets into the next SKU batch and contract discussion.`
          : 'Finish asset production and performance return before deciding scale, hook iteration, or pause.',
    },
    performance,
    blockers,
  };
}

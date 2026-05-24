import type { PlatformConnectorReadiness } from '@/lib/platform-connector-readiness';

export type ReadinessVerdict = 'pass' | 'conditional' | 'fail';
export type ReadinessRisk = 'high' | 'medium' | 'low';
export type ReadinessStatus = 'implemented' | 'partial' | 'missing' | 'pseudo';
export type CompetitorGap = 'none' | 'minor' | 'medium' | 'severe';

export interface ProjectReadinessFacts {
  orgId: string;
  projectId: string;
  assetCount: number;
  reportAssetCount?: number;
  approvedAssetCount?: number;
  reusableAssetCount?: number;
  blockedAssetCount?: number;
  rightsIssueAssetCount?: number;
  assetGovernanceIssueCount?: number;
  deliverableAssetCount?: number;
  clientReviewAssetCount?: number;
  approvedDeliverableCount?: number;
  revisionRequestedCount?: number;
  deliveryIssueCount?: number;
  planCount: number;
  draftPlanCount?: number;
  nextRoundAssetPlanCount?: number;
  readyPlanCount: number;
  dispatchCount: number;
  executableDispatchCount: number;
  publishedDispatchCount?: number;
  publishedWithEvidenceCount?: number;
  missingPublishEvidenceCount?: number;
  overdueReviewDispatchCount?: number;
  measuredDispatchCount: number;
  performanceReturnCount: number;
  scaleDecisionCount: number;
  assetMatchAmbiguousCount?: number;
  assetMatchUnmatchedCount?: number;
  assetMatchIssueCount?: number;
  creativeInsightCount?: number;
  creativeCompetitorAccountCount?: number;
  creativeTrendRankCount?: number;
  creativeReusableAngleCount?: number;
  creativeOpportunityCount?: number;
  creativeAverageOpportunityConfidence?: number;
  creativePatternClusterCount?: number;
  creativeCrossSourcePatternCount?: number;
  creativeMoatScore?: number;
  creativeMissingLinks?: string[];
  creativeMonitorCount?: number;
  creativeActiveMonitorCount?: number;
  creativeDueTaskCount?: number;
  creativeImportedMonitorSignalCount?: number;
  creativeHarvestRunCount?: number;
  creativeHarvestedInsightCount?: number;
  creativeCollectorAdapterStatus?: string;
  creativeCollectorProviderReady?: boolean;
  creativeSourceCount?: number;
  creativeProviderReadySourceCount?: number;
  creativeSourceSyncRunCount?: number;
  creativeProviderSourceFreshCount?: number;
  creativeProviderSourceFailureCount?: number;
  creativeSourceSyncAccountObservationCount?: number;
  creativeSourceSyncTrendRankObservationCount?: number;
  creativeSourceSyncVideoTeardownObservationCount?: number;
  creativeSourceSyncMultimodalParsedCount?: number;
  creativeSourceSyncCoverageScore?: number;
  creativeSourceObservationCount?: number;
  creativeSourceRepeatObservationSourceCount?: number;
  creativeSourceScaleScore?: number;
  creativeSourceDepthScore?: number;
  creativeReadySourceHealthCardCount?: number;
  creativeAccountTrackingCoverageTargetCount?: number;
  creativeTrendRankCoverageSignalCount?: number;
  creativeVideoTeardownRepeatReady?: boolean;
  creativeAccountTrackingSourceReady?: boolean;
  creativeTrendRankSourceReady?: boolean;
  creativeVideoTeardownSourceReady?: boolean;
  creativeMonitoringMissingLinks?: string[];
  channelAccountCount?: number;
  channelConnectedAccountCount?: number;
  channelHealthyAccountCount?: number;
  channelAvailableSlotCount?: number;
  channelAdCampaignCount?: number;
  channelReadyAdCampaignCount?: number;
  channelActiveAdCampaignCount?: number;
  channelMeasuredAdCampaignCount?: number;
  channelAdBudgetCents?: number;
  channelAdSpendCents?: number;
  channelAdEvidenceCount?: number;
  channelAdMissingLinks?: string[];
  channelMissingLinks?: string[];
  assetPermissionRecordCount?: number;
  governedAssetCount?: number;
  assetPermissionAuditEventCount?: number;
  assetPermissionAccessAuditEventCount?: number;
  assetStorageObjectCount?: number;
  assetMissingStorageObjectCount?: number;
  assetSecurityPolicyCount?: number;
  assetWatermarkRequiredCount?: number;
  assetWatermarkAppliedCount?: number;
  assetDlpPassedPolicyCount?: number;
  assetDlpFailedPolicyCount?: number;
  assetPublicShareBlockedCount?: number;
  assetRetentionPolicyCount?: number;
  activeAssetAccessGrantCount?: number;
  expiredAssetAccessGrantCount?: number;
  revokedAssetAccessGrantCount?: number;
  expiredAssetPermissionCount?: number;
  downloadableAssetAccessReadyCount?: number;
  shareableAssetAccessReadyCount?: number;
  assetPermissionMissingLinks?: string[];
  videoProductionQueueItemCount?: number;
  videoProviderExecutionCount?: number;
  videoSubmittedProviderExecutionCount?: number;
  videoCompletedProviderExecutionCount?: number;
  videoFailedProviderExecutionCount?: number;
  videoRetryableProviderExecutionCount?: number;
  videoResultAssetCount?: number;
  videoClientReviewCount?: number;
  videoApprovedDeliverableCount?: number;
  videoMeasuredCount?: number;
  videoAverageLoopCompletionScore?: number;
  brandLearningCreativeSignalCount?: number;
  brandLearningPerformanceSignalCount?: number;
  brandLearningApprovedDeliverableCount?: number;
  brandLearningWinningAssetCount?: number;
  brandLearningRuleCount?: number;
  brandLearningMissingLinks?: string[];
  auditedCreativeOutputCount?: number;
  auditedVideoDistributionCount?: number;
  auditedScaleLedgerRecordCount?: number;
  auditedScalePlatformBreakdownCount?: number;
  auditedScaleEvidenceUrlCount?: number;
  auditedScaleHasDedupeRule?: boolean;
  auditedScaleHasDateRange?: boolean;
  auditedScaleHasAuditorNote?: boolean;
  auditedScaleCanDisplayCreativeBenchmark?: boolean;
  auditedScaleCanDisplayVideoBenchmark?: boolean;
  auditedScaleMissingLinks?: string[];
  missingLinks: string[];
  nextActions: string[];
}

export interface ReadinessServiceInput {
  aiConfigured: boolean;
  storageConfigured: boolean;
  kuaiziConfigured: boolean;
  imageConfigured: boolean;
  videoConfigured: boolean;
  videoTeardownConfigured: boolean;
  performanceImportAvailable?: boolean;
  commerceChainAvailable?: boolean;
  industrialChainAvailable?: boolean;
  distributionExecutionAvailable?: boolean;
  platformConnectors?: PlatformConnectorReadiness;
  emailConfigured: boolean;
  authConfigured: boolean;
  project?: ProjectReadinessFacts;
}

export interface ReadinessFeature {
  name: string;
  status: ReadinessStatus;
  evidence: string;
  risk: ReadinessRisk;
  fix: string;
}

export interface ReadinessWorkflowCheck {
  name: string;
  ok: boolean;
  evidence: string;
  fix?: string;
}

export interface ReadinessIssue {
  priority: 'P0' | 'P1' | 'P2';
  title: string;
  evidence: string;
  fix: string;
}

export interface CompetitorDimension {
  name: string;
  gap: CompetitorGap;
  evidence: string;
}

export type ExternalRequirementStatus = 'configured' | 'missing' | 'evidence_required';
export type ExternalRequirementCategory =
  | 'video_provider'
  | 'video_analysis'
  | 'platform_oauth'
  | 'ad_delivery'
  | 'auto_publish'
  | 'analytics_sync'
  | 'asset_cloud'
  | 'scale_claims';

export interface ExternalIntegrationRequirement {
  id: string;
  category: ExternalRequirementCategory;
  label: string;
  status: ExternalRequirementStatus;
  owner: 'user' | 'provider' | 'wenai';
  materialPriority: 'P0' | 'P1';
  unlocks: string;
  blockedGate: string;
  missingImpact: string;
  operatorAction: string;
  evidence: string;
  requiredInputs: string[];
  acceptance: string;
  acceptanceEvidence: string;
  securityBoundary: string;
  releaseChecks: string[];
}

export interface MaterialGateSummary {
  total: number;
  configured: number;
  missingP0: number;
  missingP1: number;
  evidenceRequired: number;
  blocksCommercialLaunch: boolean;
  nextMaterialPacks: string[];
  evidence: string;
}

const EXTERNAL_REQUIREMENT_IMPACTS: Record<string, Pick<ExternalIntegrationRequirement, 'unlocks' | 'blockedGate' | 'missingImpact' | 'operatorAction' | 'acceptanceEvidence'>> = {
  'video-provider-submit-callback': {
    unlocks: 'One-click video, smart remix, batch finished-video output, signed provider callback, retry, result asset ingestion, and client review proof.',
    blockedGate: 'Create/Cut remain production handoff and manual result-fill workflows; do not claim automatic finished video or commercial smart remix.',
    missingImpact: 'Wenai can queue and review video work, but cannot behave like a stable video factory until provider execution and callback evidence exist.',
    operatorAction: 'Collect the provider submit endpoint, server token, webhook secret, sandbox quota, callback allowlist, and cost cap; then run one sandbox job.',
    acceptanceEvidence: 'A provider task id, signed callback, playable result URL, stored result asset, and review token all point to the same workflow.',
  },
  'multimodal-video-parser': {
    unlocks: 'Always-on AI video analysis: account tracking, trend rank capture, scene beat parsing, hook extraction, pacing tags, and next-script reuse.',
    blockedGate: 'Compose can only use manual or semi-automatic creative insight imports; do not claim Kuaizi/Narra-level continuous video parsing.',
    missingImpact: 'Creative depth remains ledger-driven rather than source-driven, so Wenai cannot yet build a scaled inspiration graph by itself.',
    operatorAction: 'Provide authorized sample URLs or feeds, parser endpoint, server token, and the scene-beat schema; validate account/rank/video observations.',
    acceptanceEvidence: 'One sync run creates account, rank, teardown, multimodal parsed observations, and ready source health cards for all source types.',
  },
  'platform-oauth-account-pool': {
    unlocks: 'Real account matrix: platform identity, OAuth state, account health, rate limits, risk state, scheduling slots, and dispatch gate reads.',
    blockedGate: 'Cast remains manual/provider-gated dispatch; no content is marked as truly published through a platform account.',
    missingImpact: 'Wenai can design matrix operations, but cannot operate like PubPal/matrix distribution until account grants exist.',
    operatorAction: 'Create developer apps, whitelist redirect URLs, grant sandbox accounts, and bind account ids to the channel account ledger.',
    acceptanceEvidence: 'At least one target platform account reaches oauth_ready and is readable by distribution readiness checks without exposing secrets.',
  },
  'ad-account-authorization': {
    unlocks: 'Campaign creation/read, budget caps, asset binding, stop rules, spend/order/revenue return, and campaign learning-loop evidence.',
    blockedGate: 'Only campaign hypotheses and manual performance imports are allowed; no automatic ad delivery or optimization claim is displayed.',
    missingImpact: 'Wenai cannot become an ecommerce growth operating system until real ad account evidence enters Cast/Manage.',
    operatorAction: 'Provide advertiser id, account id, least-privilege token, test budget, conversion event, and rollback/stop rules.',
    acceptanceEvidence: 'A test campaign can be read or created with capped spend and measured spend/impression/click/conversion data returns to Wenai.',
  },
  'platform-auto-publish': {
    unlocks: 'Asset upload, scheduled publishing, review state polling, platform URL capture, retry, manual fallback, and publication evidence.',
    blockedGate: 'Dispatches can be prepared, but not marked as auto-published or matrix-distributed without platform receipts.',
    missingImpact: 'Distribution remains operational planning rather than platform-level execution, which is a severe Kuaizi/PubPal gap.',
    operatorAction: 'Enable publish permission, upload endpoint access, content specs, platform review rules, rate limits, and sandbox publish scope.',
    acceptanceEvidence: 'One governed asset is uploaded and published through an adapter, producing a platform URL or receipt tied to the dispatch ledger.',
  },
  'platform-analytics-sync': {
    unlocks: 'Scheduled metric sync, field mapping, dedupe, attribution windows, brand learning updates, and next-round creative recommendations.',
    blockedGate: 'Use CSV/API manual import only; do not show real-time platform optimization or automatic post-mortem claims.',
    missingImpact: 'The learning loop is slower and less defensible without automatic source-of-truth performance data.',
    operatorAction: 'Provide analytics permission, account id, metric definitions, sync cadence, timezone, attribution window, and API quota.',
    acceptanceEvidence: 'A scheduled sync imports impressions, clicks, spend, orders, revenue, and asset_ref into performance returns without manual CSV.',
  },
  'enterprise-asset-cloud': {
    unlocks: 'Object storage, signed URLs, download/share/publish enforcement, team roles, DLP, watermark, retention, and access audit.',
    blockedGate: 'Manage remains an internal permission ledger; do not claim enterprise cloud drive or external team-space governance.',
    missingImpact: 'Enterprise customers still need a real storage and access-control layer before Wenai can protect shared production assets.',
    operatorAction: 'Provide an isolated bucket/project, service account, signed URL policy, team-role map, DLP/watermark rules, and retention policy.',
    acceptanceEvidence: 'The same asset returns different allowed actions for client/operator/distribution roles and writes an audit event for every access.',
  },
  'audited-scale-ledger': {
    unlocks: 'Wenai-owned creative output and video distribution counters with source breakdown, date range, dedupe rule, and public display permission.',
    blockedGate: '91M+ creative output and 42M+ video distribution remain competitor benchmarks, never Wenai-owned scale claims.',
    missingImpact: 'Wenai can explain the target scale, but cannot market itself with those numbers until audited ledgers prove them.',
    operatorAction: 'Provide audited production and distribution ledgers, platform evidence URLs, date ranges, dedupe rules, and auditor/customer notes.',
    acceptanceEvidence: 'Scale counters reconcile to Wenai production records, platform receipts, source breakdowns, and a documented date range.',
  },
};

export interface ScaleClaimGuard {
  label: string;
  requestedBenchmark: string;
  canDisplay: boolean;
  evidence: string;
  requiredEvidence: string[];
  auditGates?: {
    label: string;
    ready: boolean;
    severity: 'P0' | 'P1';
    evidence: string;
    action: string;
  }[];
}

export type ProductCapabilityLayerId = 'Compose' | 'Create' | 'Cut' | 'Cast' | 'Manage';

export interface ProductCapabilityLayer {
  id: ProductCapabilityLayerId;
  target: string;
  currentStatus: ReadinessStatus;
  internalCapability: string;
  externalGate: string;
  stopLine: string;
  evidence: string;
}

export interface AlternativeCompetitorReference {
  name: string;
  pattern: string;
  wenaiDecision: string;
  boundary: string;
}

export interface ProductUiVariantGuide {
  id: 'partner' | 'operator' | 'friend_trial';
  label: string;
  audience: string;
  firstScreen: string;
  primaryAction: string;
  stopLine: string;
}

export interface ProductReadinessReport {
  verdict: ReadinessVerdict;
  label: string;
  score: number;
  productBlueprint: ProductCapabilityLayer[];
  alternativeReferences: AlternativeCompetitorReference[];
  uiVariants: ProductUiVariantGuide[];
  competitor: CompetitorDimension[];
  features: ReadinessFeature[];
  workflows: ReadinessWorkflowCheck[];
  issues: ReadinessIssue[];
  friendTrialRisks: ReadinessIssue[];
  externalRequirements: ExternalIntegrationRequirement[];
  materialGateSummary: MaterialGateSummary;
  scaleClaimGuards: ScaleClaimGuard[];
  projectReadiness?: {
    verdict: ReadinessVerdict;
    score: number;
    evidence: string[];
    missingLinks: string[];
    nextActions: string[];
  };
  recommendation: '保留' | '修复后保留' | '不建议当前状态发布';
}

function makeExternalRequirement(
  id: string,
  category: ExternalRequirementCategory,
  label: string,
  configured: boolean,
  evidence: string,
  requiredInputs: string[],
  acceptance: string,
  owner: ExternalIntegrationRequirement['owner'] = 'user',
  materialPriority: ExternalIntegrationRequirement['materialPriority'] = 'P0',
  securityBoundary = 'Secrets must be configured server-side or in the deployment platform, never in browser state, chat, reports, or repository files.',
  releaseChecks: string[] = [
    'Material is configured in a secure server-side location.',
    'Sandbox or least-privilege access is available before production access.',
    'A verifiable callback, receipt, ledger, or audit event proves the integration.',
  ],
  impact: Partial<Pick<ExternalIntegrationRequirement, 'unlocks' | 'blockedGate' | 'missingImpact' | 'operatorAction' | 'acceptanceEvidence'>> = {},
): ExternalIntegrationRequirement {
  const requirementImpact = { ...EXTERNAL_REQUIREMENT_IMPACTS[id], ...impact };
  return {
    id,
    category,
    label,
    status: configured ? 'configured' : 'missing',
    owner,
    materialPriority,
    unlocks: requirementImpact.unlocks || `Unlocks the production-grade ${label} path.`,
    blockedGate: requirementImpact.blockedGate || `Keep ${label} provider-gated until secure material and proof exist.`,
    missingImpact: requirementImpact.missingImpact || `Wenai can model and queue this capability, but cannot claim real platform execution for ${label}.`,
    operatorAction: requirementImpact.operatorAction || `Collect the required material pack, configure it server-side, then run the release checks for ${label}.`,
    evidence,
    requiredInputs,
    acceptance,
    acceptanceEvidence: requirementImpact.acceptanceEvidence || acceptance,
    securityBoundary,
    releaseChecks,
  };
}

function buildExternalRequirements(input: ReadinessServiceInput): ExternalIntegrationRequirement[] {
  const connectors = input.platformConnectors;
  return [
    makeExternalRequirement(
      'video-provider-submit-callback',
      'video_provider',
      'Real video generation/editing provider',
      input.videoConfigured && Boolean(connectors?.videoWebhookSignatureConfigured),
      `videoConfigured=${input.videoConfigured ? 1 : 0}; webhookSignature=${connectors?.videoWebhookSignatureConfigured ? 1 : 0}`,
      ['provider submit endpoint', 'server-side provider token', 'webhook signing secret', 'sandbox task id', 'cost limit'],
      'Submit one provider-ready workflow, receive a signed callback, ingest result URL, create client review link, and keep provider tokens out of responses.',
    ),
    makeExternalRequirement(
      'multimodal-video-parser',
      'video_analysis',
      'AI video analysis / multimodal parser',
      input.videoTeardownConfigured && Boolean(input.project?.creativeVideoTeardownSourceReady),
      `videoTeardownConfigured=${input.videoTeardownConfigured ? 1 : 0}; projectVideoTeardownSourceReady=${input.project?.creativeVideoTeardownSourceReady ? 1 : 0}`,
      ['parser endpoint or authorized teardown feed', 'server-side parser token', 'licensed sample URLs', 'scene beat schema'],
      'Import account, rank, and video teardown observations; source health cards for all three source kinds are ready.',
      'provider',
    ),
    makeExternalRequirement(
      'platform-oauth-account-pool',
      'platform_oauth',
      'Multi-platform OAuth and account pool',
      Boolean(connectors?.oauthConfigured),
      `oauthConfigured=${connectors?.oauthConfigured ? 1 : 0}`,
      ['TikTok/Douyin OAuth app', 'XHS/Kuaishou/Meta app where applicable', 'redirect URLs', 'sandbox account grant'],
      'Complete at least one OAuth grant per target platform and bind it to channel account ledger without storing secrets in browser state.',
    ),
    makeExternalRequirement(
      'ad-account-authorization',
      'ad_delivery',
      'Ad account authorization',
      Boolean(connectors?.adAccountConfigured),
      `adAccountConfigured=${connectors?.adAccountConfigured ? 1 : 0}; readyAdCampaigns=${input.project?.channelReadyAdCampaignCount || 0}`,
      ['advertiser id', 'ad account access token', 'campaign create permission', 'budget cap', 'test campaign id'],
      'Create or validate one campaign with spend limits, attach evidence URL, and import measured spend/order/revenue.',
    ),
    makeExternalRequirement(
      'platform-auto-publish',
      'auto_publish',
      'Auto-publish / matrix distribution',
      Boolean(connectors?.autoPublishConfigured),
      `autoPublishConfigured=${connectors?.autoPublishConfigured ? 1 : 0}; availableSlots=${input.project?.channelAvailableSlotCount || 0}`,
      ['publish token', 'content upload endpoint permission', 'account rate limits', 'publish evidence URL'],
      'Publish one governed asset through a provider adapter, capture platform URL, and preserve manual-ready fallback.',
    ),
    makeExternalRequirement(
      'platform-analytics-sync',
      'analytics_sync',
      'Platform analytics sync',
      Boolean(connectors?.analyticsSyncConfigured),
      `analyticsSyncConfigured=${connectors?.analyticsSyncConfigured ? 1 : 0}; measuredDispatches=${input.project?.measuredDispatchCount || 0}`,
      ['analytics API token', 'platform account id', 'metric mapping', 'scheduled sync job'],
      'Sync impressions, clicks, spend, orders, revenue, and asset_ref for one published dispatch without manual CSV.',
      'user',
      'P1',
    ),
    makeExternalRequirement(
      'enterprise-asset-cloud',
      'asset_cloud',
      'Enterprise cloud asset storage and signed access',
      Boolean(connectors?.enterpriseAssetPermissionsConfigured) && input.storageConfigured,
      `enterpriseAssetPermissionsConfigured=${connectors?.enterpriseAssetPermissionsConfigured ? 1 : 0}; storageConfigured=${input.storageConfigured ? 1 : 0}; downloadableReady=${input.project?.downloadableAssetAccessReadyCount || 0}; shareableReady=${input.project?.shareableAssetAccessReadyCount || 0}`,
      ['object storage bucket/project', 'signed URL service', 'DLP/watermark policy', 'retention policy', 'team role mapping'],
      'Download/share/publish checks fail closed until RBAC, DLP, watermark, retention, and signed URL evidence pass.',
      'user',
      'P1',
    ),
    {
      id: 'audited-scale-ledger',
      category: 'scale_claims',
      label: 'Audited Wenai scale ledger for public numbers',
      status: 'evidence_required',
      owner: 'user',
      materialPriority: 'P1',
      ...EXTERNAL_REQUIREMENT_IMPACTS['audited-scale-ledger'],
      evidence: '91M+ creative output and 42M+ video distribution are competitor benchmarks, not audited Wenai metrics.',
      requiredInputs: ['audited generated creative count', 'audited published video count', 'platform/source breakdown', 'dedupe rule', 'date range'],
      acceptance: 'Only display Wenai-owned scale numbers after the counters reconcile to production and platform ledgers.',
      securityBoundary: 'Do not convert competitor public numbers into Wenai-owned claims; only audited Wenai ledgers, platform receipts, and date ranges can unlock public scale display.',
      releaseChecks: [
        'Creative output and video distribution ledgers reconcile to Wenai-owned production records.',
        'Platform/source breakdown, dedupe rule, and date range are documented.',
        'Scale claims remain benchmark-only until an auditor or customer-confirmed evidence note exists.',
      ],
    },
  ];
}

function buildMaterialGateSummary(requirements: ExternalIntegrationRequirement[]): MaterialGateSummary {
  const unresolved = requirements.filter(requirement => requirement.status !== 'configured');
  const missingP0 = unresolved.filter(requirement => requirement.materialPriority === 'P0').length;
  const missingP1 = unresolved.filter(requirement => requirement.materialPriority === 'P1').length;
  const evidenceRequired = requirements.filter(requirement => requirement.status === 'evidence_required').length;
  const nextMaterialPacks = unresolved
    .sort((left, right) => {
      if (left.materialPriority !== right.materialPriority) return left.materialPriority === 'P0' ? -1 : 1;
      return left.label.localeCompare(right.label);
    })
    .slice(0, 4)
    .map(requirement => `${requirement.materialPriority}: ${requirement.label}`);

  return {
    total: requirements.length,
    configured: requirements.filter(requirement => requirement.status === 'configured').length,
    missingP0,
    missingP1,
    evidenceRequired,
    blocksCommercialLaunch: missingP0 > 0,
    nextMaterialPacks,
    evidence: `configured=${requirements.filter(requirement => requirement.status === 'configured').length}/${requirements.length}; missingP0=${missingP0}; missingP1=${missingP1}; evidenceRequired=${evidenceRequired}`,
  };
}

function buildScaleClaimGuards(input: ReadinessServiceInput): ScaleClaimGuard[] {
  const project = input.project;
  const auditGates = [{
    label: '自有账本',
    ready: Boolean(project?.auditedCreativeOutputCount && project?.auditedVideoDistributionCount),
    severity: 'P0' as const,
    evidence: `records=${project?.auditedScaleLedgerRecordCount || 0}; creative=${project?.auditedCreativeOutputCount || 0}; video=${project?.auditedVideoDistributionCount || 0}`,
    action: '导入 Wenai 自有生产与分发账本，不把竞品规模写成自身成绩。',
  }, {
    label: '证据覆盖',
    ready: Boolean(project?.auditedScaleEvidenceUrlCount && project.auditedScaleEvidenceUrlCount >= (project.auditedScaleLedgerRecordCount || 1)),
    severity: 'P0' as const,
    evidence: `evidenceUrls=${project?.auditedScaleEvidenceUrlCount || 0}/${project?.auditedScaleLedgerRecordCount || 0}`,
    action: '每条规模记录都要有平台后台、客户确认或审计证据 URL。',
  }, {
    label: '去重/日期/确认',
    ready: Boolean(project?.auditedScaleHasDedupeRule && project.auditedScaleHasDateRange && project.auditedScaleHasAuditorNote),
    severity: 'P0' as const,
    evidence: `dedupe=${project?.auditedScaleHasDedupeRule ? 1 : 0}; dateRange=${project?.auditedScaleHasDateRange ? 1 : 0}; auditorNote=${project?.auditedScaleHasAuditorNote ? 1 : 0}`,
    action: '补齐去重口径、审计时间范围和客户/审计确认说明。',
  }, {
    label: '公开阈值',
    ready: Boolean(project?.auditedScaleCanDisplayCreativeBenchmark && project.auditedScaleCanDisplayVideoBenchmark),
    severity: 'P1' as const,
    evidence: `creative91M=${project?.auditedScaleCanDisplayCreativeBenchmark ? 1 : 0}; video42M=${project?.auditedScaleCanDisplayVideoBenchmark ? 1 : 0}`,
    action: '91M+/42M+ 未满足全部审计条件前只能作为竞品 benchmark。',
  }];
  return [{
    label: 'Creative output scale',
    requestedBenchmark: '91M+ creative output',
    canDisplay: Boolean(project?.auditedScaleCanDisplayCreativeBenchmark),
    evidence: `creativeInsights=${project?.creativeInsightCount || 0}; auditedWenaiCreativeOutput=${project?.auditedCreativeOutputCount || 0}; platformBreakdown=${project?.auditedScalePlatformBreakdownCount || 0}; evidenceUrls=${project?.auditedScaleEvidenceUrlCount || 0}`,
    requiredEvidence: ['production output ledger', 'dedupe rule', 'audited date range', 'source/platform breakdown'],
    auditGates,
  }, {
    label: 'Video distribution scale',
    requestedBenchmark: '42M+ video distribution',
    canDisplay: Boolean(project?.auditedScaleCanDisplayVideoBenchmark),
    evidence: `publishedDispatches=${project?.publishedDispatchCount || 0}; measuredDispatches=${project?.measuredDispatchCount || 0}; auditedWenaiVideoDistribution=${project?.auditedVideoDistributionCount || 0}; dedupe=${project?.auditedScaleHasDedupeRule ? 1 : 0}; dateRange=${project?.auditedScaleHasDateRange ? 1 : 0}; auditorNote=${project?.auditedScaleHasAuditorNote ? 1 : 0}`,
    requiredEvidence: ['platform publish ledger', 'video id ledger', 'analytics sync evidence', 'audited date range'],
    auditGates,
  }];
}

function buildProductBlueprint(input: ReadinessServiceInput, platformAutomationReady: boolean): ProductCapabilityLayer[] {
  const project = input.project;
  const composeDepthReady = Boolean(
    project?.creativeAccountTrackingSourceReady &&
    project?.creativeTrendRankSourceReady &&
    project?.creativeVideoTeardownSourceReady &&
    (project.creativeSourceDepthScore || 0) >= 90,
  );
  const videoLoopReady = Boolean(
    input.videoConfigured &&
    project?.videoCompletedProviderExecutionCount &&
    project.videoResultAssetCount &&
    project.videoClientReviewCount &&
    project.videoMeasuredCount,
  );
  const assetCloudReady = Boolean(
    input.storageConfigured &&
    input.platformConnectors?.enterpriseAssetPermissionsConfigured &&
    project?.downloadableAssetAccessReadyCount,
  );

  return [
    {
      id: 'Compose',
      target: '全网灵感管理、竞品账号追踪、热门视频解析、Hook Bank、品牌学习档案。',
      currentStatus: composeDepthReady ? 'implemented' : 'partial',
      internalCapability: '已有创意洞察 ledger、监控 watchlist、来源健康卡、品牌学习和 action queue，可以把手动/半自动导入沉淀成下一轮脚本与分发动作。',
      externalGate: '需要授权账号源、榜单源、持续采集任务和多模态视频解析 provider，才能从“洞察账本”升级为“全网灵感平台”。',
      stopLine: '没有持续来源和解析证据前，不能宣称全网自动监控或筷子级 Narra 视频解析。',
      evidence: `creativeInsights=${project?.creativeInsightCount || 0}; sourceDepth=${project?.creativeSourceDepthScore || 0}; videoTeardownReady=${project?.creativeVideoTeardownSourceReady ? 1 : 0}`,
    },
    {
      id: 'Create',
      target: 'SKU brief、图文素材、生产 handoff、客户交付包、资产权限和审计。',
      currentStatus: input.industrialChainAvailable ? 'implemented' : 'partial',
      internalCapability: '资产库、production handoff、客户交付、review 写回和 RBAC 账本已经可跑，适合先做商业化 POC 生产管理。',
      externalGate: '需要真实图片/视频 provider、对象存储、签名 URL 和团队空间后，才能承接规模化云资产生产。',
      stopLine: 'provider 未接齐时只展示生产规格和交接包，不把导出规格说成自动生成结果。',
      evidence: `industrialChain=${input.industrialChainAvailable ? 1 : 0}; storage=${input.storageConfigured ? 1 : 0}; governedAssets=${project?.governedAssetCount || 0}`,
    },
    {
      id: 'Cut',
      target: 'AI 视频分析、智能混剪、一键视频、人工/供应商试跑、成片回灌和客户审核。',
      currentStatus: videoLoopReady ? 'implemented' : 'partial',
      internalCapability: '已有视频 workflow、队列、provider gate、人工试跑 runbook、成片回灌、review token 和表现回流字段。',
      externalGate: '需要真实视频生成/剪辑 provider、素材授权、回调签名和成本上限，才能把队列变成稳定商用视频工厂。',
      stopLine: '没有 provider 完成记录和客户审核回写前，不能宣称一键视频或批量自动混剪真实可用。',
      evidence: `videoConfigured=${input.videoConfigured ? 1 : 0}; completedProviderExecutions=${project?.videoCompletedProviderExecutionCount || 0}; measuredVideos=${project?.videoMeasuredCount || 0}`,
    },
    {
      id: 'Cast',
      target: '多平台分发、PubPal/矩阵分发、广告投放、发布证据、平台数据同步和复盘决策。',
      currentStatus: platformAutomationReady ? 'implemented' : 'partial',
      internalCapability: '已有分发计划、dispatch、账号矩阵、广告 campaign ledger、预算/证据门禁和表现回流。',
      externalGate: '需要平台 OAuth、广告账户授权、自动发布权限、analytics sync 和平台回执，才能进入真实矩阵投放。',
      stopLine: '外部授权未完成前，只能说 manual/provider-gated dispatch，不能说自动发布、自动投放或自动优化。',
      evidence: `platformAutomationReady=${platformAutomationReady ? 1 : 0}; channelAccounts=${project?.channelAccountCount || 0}; readyAdCampaigns=${project?.channelReadyAdCampaignCount || 0}`,
    },
    {
      id: 'Manage',
      target: 'readiness、CRM handoff、客户 review、资产权限/RBAC/audit、表现回流和规模数字审计。',
      currentStatus: assetCloudReady ? 'implemented' : 'partial',
      internalCapability: '已有 readiness API、CRM/生产交接、review 写回、资产权限、DLP/watermark、审计和品牌学习闭环。',
      externalGate: '需要真实企业云资产、签名访问、团队权限、留存策略和审计后的规模计数，才能支撑企业级交付。',
      stopLine: '91M+ creative output、42M+ video distribution 只能作为竞品 benchmark；没有 Wenai 自有审计台账前不能对外展示为自身数据。',
      evidence: `assetCloudReady=${assetCloudReady ? 1 : 0}; accessAudits=${project?.assetPermissionAccessAuditEventCount || 0}; performanceReturns=${project?.performanceReturnCount || 0}`,
    },
  ];
}

function buildAlternativeReferences(): AlternativeCompetitorReference[] {
  return [
    {
      name: 'Hookshot / Hookly',
      pattern: '把爆款 hook、UGC 结构和行动队列做成可复用的创意生产系统。',
      wenaiDecision: 'Compose 不是只存竞品链接，而是把 hook、节奏、证明点、风险边界转成下一轮脚本、视频任务和分发实验。',
      boundary: '只学习结构和运营机制，不复制受保护表达、素材和账号内容。',
    },
    {
      name: 'Hooksy / Hooked',
      pattern: '用广告结构拆解和变体生成缩短从洞察到素材的时间。',
      wenaiDecision: '把胜出广告结构沉淀到品牌学习档案，并驱动 Create/Cut 的变体矩阵。',
      boundary: '必须保留 Wenai-owned variant 和合规审核，不把参考视频直接改写成近似副本。',
    },
    {
      name: 'Omneky',
      pattern: '把创意生成、广告投放和表现回流连成 campaign learning loop。',
      wenaiDecision: 'Cast/Manage 必须把 campaign ledger、预算、素材绑定、回流指标和下一轮规则放在同一条链路。',
      boundary: '广告账户和转化事件未授权前，只能做手动导入与 provider-gated 编排。',
    },
    {
      name: 'AdHawk / AI Media Buyer',
      pattern: '把投放操作变成可审计的动作建议、预算门禁和异常处理。',
      wenaiDecision: 'Wenai 的 action queue 需要记录做了什么、没做什么、为什么没做，避免 agent 直接碰生产系统。',
      boundary: '没有广告主授权、预算上限和回滚策略前，不做真实自动投放。',
    },
    {
      name: 'Creatify / UGC video ads',
      pattern: '把商品链接、素材和脚本结构快速转成 UGC 风格短视频广告变体。',
      wenaiDecision: 'Create/Cut 要把商品素材、avatar/voice/scene 选择、版本矩阵、成片 URL 和客户审核写进同一条视频任务，而不是只生成一段孤立视频。',
      boundary: '没有素材授权、肖像/声音授权和 provider 回调前，只能生成生产交接包与审核任务，不能宣称自动 UGC 成片。',
    },
    {
      name: 'Marpipe / catalog creative testing',
      pattern: '用商品 feed、设计变量和广告实验矩阵批量测试创意组合。',
      wenaiDecision: 'Cast/Manage 要把 SKU feed、offer、版式变量、受众、预算和表现回流绑定到可复盘实验，而不是只做单条内容分发。',
      boundary: '没有广告账户、catalog 权限和转化回流前，只能保留实验设计与手工导入结果。',
    },
    {
      name: 'Pencil / generative ad creative',
      pattern: '把生成式创意、品牌约束和投放表现合成持续学习的广告生产循环。',
      wenaiDecision: '品牌学习档案必须沉淀胜出的 hook、禁用表达、素材偏好和下一轮规则，反哺 Compose/Create/Cut。',
      boundary: '没有真实投放表现、品牌批准和素材权属证明前，不让自动生成内容绕过客户审核。',
    },
    {
      name: 'Smartly.io / creative-media-intelligence',
      pattern: '把 creative、media、intelligence 统一到一个跨平台广告运营系统里：创意交付、投放管理、实时优化和报告必须同屏协作。',
      wenaiDecision: 'Wenai 的 Cast/Manage 不能只停留在分发计划，要把素材版本、账号、预算、campaign、平台回执、表现回流和下一轮 action queue 合并成一个可审计运营面板。',
      boundary: '没有平台 OAuth、广告账户、analytics sync 和预算止损规则前，只能展示 readiness 和人工执行建议，不能宣称自动跨平台优化。',
    },
    {
      name: 'VidMob / creative analytics',
      pattern: '把 creative analytics、platform readiness、performance learning 和 account publishing 放进一个智能创意分析平台。',
      wenaiDecision: 'AI 视频分析和表现回流应升级为“看得见创意、看得见平台、看得见优化”的三层结构，而不是只保留任务状态。',
      boundary: '没有真实平台数据、ad account read-only 权限和 publish proof 前，不宣称已具备 VidMob 级创意分析。',
    },
    {
      name: 'Creatopy / brand-safe ad generation',
      pattern: '用 brand kit、URL-to-ad、模板复用和权限控制批量生产品牌安全广告。',
      wenaiDecision: 'Create/Cut 要把品牌资产、模板、权限和多语言版本统一起来，才能做出稳定规模化的内容工厂。',
      boundary: '没有品牌 kit、素材权属和模板权限前，只能做内部生产草案，不能宣称自动品牌化发布。',
    },
    {
      name: 'Superads / creative insights',
      pattern: '把 Meta / TikTok / Google / LinkedIn 等平台的 creative performance 统一分析，识别 fatigue、hook、format 和 cross-channel patterns。',
      wenaiDecision: 'Wenai 的创意洞察必须接到跨平台性能信号和疲劳识别，而不是只停留在竞品拆解和手工复盘。',
      boundary: '没有 analytics sync 和跨平台数据接入前，只能保留洞察假设和手工导入，不宣称自动创意分析。',
    },
  ];
}

function buildUiVariants(): ProductUiVariantGuide[] {
  return [
    {
      id: 'partner',
      label: '合作者/投资人版',
      audience: '合作者、供应商、潜在客户和投资人。',
      firstScreen: '先看 Wenai 是 Compose/Create/Cut/Cast/Manage 的全链路内容工业化工作台，再看哪些已经内部可跑、哪些等待外部接入。',
      primaryAction: '进入 /status 查看 readiness 与外部材料包，再打开 /factory/video 或 /review/[token] 证明生产与客户审核闭环。',
      stopLine: '不展示未审计规模数字，不把 provider-gated 能力说成已自动化。',
    },
    {
      id: 'operator',
      label: '运营工作台版',
      audience: '内容运营、投放、客户经理和生产负责人。',
      firstScreen: '先显示项目、待处理动作、阻塞门禁、素材/视频/分发/回流状态。',
      primaryAction: '从创意洞察进入视频任务，再把可发布素材推到分发计划和表现回流。',
      stopLine: '不让运营绕过 RBAC、DLP、客户审核、发布证据和预算门禁。',
    },
    {
      id: 'friend_trial',
      label: '朋友试用版',
      audience: '第一次使用、没有技术背景的真实用户。',
      firstScreen: '只保留项目入口、样例链路、客户审核和下一步，不暴露 provider、ledger、env 等工程概念。',
      primaryAction: '按“看洞察 -> 生成 brief -> 查看视频任务 -> 客户审核 -> 看回流”完成一次零解释试跑。',
      stopLine: '任何需要解释环境变量、后端任务或平台授权的步骤，都不能算朋友可独立完成。',
    },
  ];
}

function scoreFeature(feature: ReadinessFeature) {
  if (feature.status === 'implemented') return 12;
  if (feature.status === 'partial') return 7;
  if (feature.status === 'pseudo') return 0;
  return 2;
}

function makeFeature(
  name: string,
  status: ReadinessStatus,
  evidence: string,
  risk: ReadinessRisk,
  fix: string,
): ReadinessFeature {
  return { name, status, evidence, risk, fix };
}

function evaluateProjectReadiness(project?: ProjectReadinessFacts): ProductReadinessReport['projectReadiness'] {
  if (!project) return undefined;

  const checks = [
    project.assetCount > 0,
    project.planCount > 0,
    project.readyPlanCount > 0,
    project.dispatchCount > 0,
    project.executableDispatchCount > 0,
    (project.missingPublishEvidenceCount || 0) === 0,
    (project.overdueReviewDispatchCount || 0) === 0,
    project.measuredDispatchCount > 0,
    project.performanceReturnCount > 0,
    (project.reportAssetCount || 0) > 0,
    (project.assetGovernanceIssueCount || 0) === 0,
    (project.deliveryIssueCount || 0) === 0,
    project.scaleDecisionCount === 0 || (project.nextRoundAssetPlanCount || 0) >= project.scaleDecisionCount,
    project.scaleDecisionCount === 0 || (project.assetMatchIssueCount || 0) === 0,
    (project.creativeInsightCount || 0) > 0,
    (project.creativeReusableAngleCount || 0) > 0,
    (project.creativeOpportunityCount || 0) > 0,
    (project.creativeAverageOpportunityConfidence || 0) > 0,
    (project.creativePatternClusterCount || 0) > 0,
    (project.creativeCrossSourcePatternCount || 0) > 0,
    (project.creativeMoatScore || 0) >= 60,
    (project.creativeCompetitorAccountCount || 0) > 0 || (project.creativeTrendRankCount || 0) > 0,
    (project.creativeMonitorCount || 0) > 0,
    (project.creativeActiveMonitorCount || 0) > 0,
    (project.creativeDueTaskCount || 0) > 0 || (project.creativeImportedMonitorSignalCount || 0) > 0,
    (project.creativeSourceCount || 0) >= 3,
    (project.creativeProviderReadySourceCount || 0) >= 3,
    (project.creativeSourceSyncCoverageScore || 0) >= 100,
    (project.creativeSourceSyncAccountObservationCount || 0) > 0,
    (project.creativeSourceSyncTrendRankObservationCount || 0) > 0,
    (project.creativeSourceSyncVideoTeardownObservationCount || 0) > 0,
    (project.creativeSourceSyncMultimodalParsedCount || 0) > 0,
    (project.creativeSourceObservationCount || 0) >= 6,
    (project.creativeSourceRepeatObservationSourceCount || 0) >= 3,
    (project.creativeSourceScaleScore || 0) >= 100,
    (project.creativeSourceDepthScore || 0) >= 90,
    (project.creativeReadySourceHealthCardCount || 0) >= 3,
    (project.creativeAccountTrackingCoverageTargetCount || 0) >= 3,
    (project.creativeTrendRankCoverageSignalCount || 0) >= 3,
    Boolean(project.creativeVideoTeardownRepeatReady),
    Boolean(project.creativeAccountTrackingSourceReady),
    Boolean(project.creativeTrendRankSourceReady),
    Boolean(project.creativeVideoTeardownSourceReady),
    (project.channelAccountCount || 0) > 0,
    (project.channelConnectedAccountCount || 0) > 0,
    (project.channelHealthyAccountCount || 0) > 0,
    (project.channelAvailableSlotCount || 0) > 0,
    (project.channelAdCampaignCount || 0) > 0,
    (project.channelReadyAdCampaignCount || 0) > 0,
    (project.channelAdBudgetCents || 0) > 0,
    (project.channelAdEvidenceCount || 0) > 0,
    (project.assetPermissionRecordCount || 0) > 0,
    (project.governedAssetCount || 0) > 0,
    (project.assetPermissionAuditEventCount || 0) > 0,
    (project.assetPermissionAccessAuditEventCount || 0) > 0,
    (project.assetStorageObjectCount || 0) > 0,
    (project.assetMissingStorageObjectCount || 0) === 0,
    (project.assetSecurityPolicyCount || 0) > 0,
    (project.assetWatermarkRequiredCount || 0) === 0 || (project.assetWatermarkAppliedCount || 0) >= (project.assetWatermarkRequiredCount || 0),
    (project.assetDlpPassedPolicyCount || 0) >= (project.assetSecurityPolicyCount || 0),
    (project.assetDlpFailedPolicyCount || 0) === 0,
    (project.assetPublicShareBlockedCount || 0) > 0,
    (project.assetRetentionPolicyCount || 0) >= (project.assetSecurityPolicyCount || 0),
    (project.activeAssetAccessGrantCount || 0) > 0,
    (project.downloadableAssetAccessReadyCount || 0) > 0 || (project.shareableAssetAccessReadyCount || 0) > 0,
    (project.expiredAssetPermissionCount || 0) === 0,
    (project.videoProductionQueueItemCount || 0) > 0,
    (project.videoProviderExecutionCount || 0) > 0,
    (project.videoCompletedProviderExecutionCount || 0) > 0,
    (project.videoFailedProviderExecutionCount || 0) === 0,
    (project.videoResultAssetCount || 0) > 0,
    (project.videoClientReviewCount || 0) > 0,
    (project.videoApprovedDeliverableCount || 0) > 0,
    (project.videoMeasuredCount || 0) > 0,
    (project.videoAverageLoopCompletionScore || 0) > 0,
    (project.brandLearningCreativeSignalCount || 0) > 0,
    (project.brandLearningPerformanceSignalCount || 0) > 0,
    (project.brandLearningApprovedDeliverableCount || 0) > 0,
    (project.brandLearningWinningAssetCount || 0) > 0,
    (project.brandLearningRuleCount || 0) > 0,
  ];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const creativeMissingLinks = project.creativeMissingLinks || [];
  const creativeMonitoringMissingLinks = project.creativeMonitoringMissingLinks || [];
  const channelMissingLinks = project.channelMissingLinks || [];
  const channelAdMissingLinks = project.channelAdMissingLinks || [];
  const assetPermissionMissingLinks = project.assetPermissionMissingLinks || [];
  const brandLearningMissingLinks = project.brandLearningMissingLinks || [];
  const verdict: ReadinessVerdict = project.missingLinks.length === 0 && creativeMissingLinks.length === 0 && creativeMonitoringMissingLinks.length === 0 && channelMissingLinks.length === 0 && channelAdMissingLinks.length === 0 && assetPermissionMissingLinks.length === 0 && brandLearningMissingLinks.length === 0 && project.performanceReturnCount > 0 && (project.reportAssetCount || 0) > 0
    ? 'pass'
    : score >= 72 && project.executableDispatchCount > 0
      ? 'conditional'
      : 'fail';

  return {
    verdict,
    score,
    evidence: [
      `project=${project.projectId}`,
      `assets=${project.assetCount}`,
      `reportAssets=${project.reportAssetCount || 0}`,
      `approvedAssets=${project.approvedAssetCount || 0}`,
      `reusableAssets=${project.reusableAssetCount || 0}`,
      `assetGovernanceIssues=${project.assetGovernanceIssueCount || 0}`,
      `deliverableAssets=${project.deliverableAssetCount || 0}`,
      `clientReviewAssets=${project.clientReviewAssetCount || 0}`,
      `approvedDeliverables=${project.approvedDeliverableCount || 0}`,
      `revisionRequested=${project.revisionRequestedCount || 0}`,
      `deliveryIssues=${project.deliveryIssueCount || 0}`,
      `blockedAssets=${project.blockedAssetCount || 0}`,
      `rightsIssueAssets=${project.rightsIssueAssetCount || 0}`,
      `plans=${project.planCount}`,
      `draftPlans=${project.draftPlanCount || 0}`,
      `nextRoundAssetPlans=${project.nextRoundAssetPlanCount || 0}`,
      `readyPlans=${project.readyPlanCount}`,
      `dispatches=${project.dispatchCount}`,
      `publishedDispatches=${project.publishedDispatchCount || 0}`,
      `publishedWithEvidence=${project.publishedWithEvidenceCount || 0}`,
      `missingPublishEvidence=${project.missingPublishEvidenceCount || 0}`,
      `overdueReviews=${project.overdueReviewDispatchCount || 0}`,
      `measuredDispatches=${project.measuredDispatchCount}`,
      `performanceReturns=${project.performanceReturnCount}`,
      `scaleDecisions=${project.scaleDecisionCount}`,
      `assetMatchIssues=${project.assetMatchIssueCount || 0}`,
      `ambiguousAssetMatches=${project.assetMatchAmbiguousCount || 0}`,
      `unmatchedAssets=${project.assetMatchUnmatchedCount || 0}`,
      `creativeInsights=${project.creativeInsightCount || 0}`,
      `creativeCompetitorAccounts=${project.creativeCompetitorAccountCount || 0}`,
      `creativeTrendRanks=${project.creativeTrendRankCount || 0}`,
      `creativeReusableAngles=${project.creativeReusableAngleCount || 0}`,
      `creativeOpportunities=${project.creativeOpportunityCount || 0}`,
      `creativeAverageConfidence=${project.creativeAverageOpportunityConfidence || 0}`,
      `creativePatternClusters=${project.creativePatternClusterCount || 0}`,
      `creativeCrossSourcePatterns=${project.creativeCrossSourcePatternCount || 0}`,
      `creativeMoatScore=${project.creativeMoatScore || 0}`,
      `creativeMonitors=${project.creativeMonitorCount || 0}`,
      `creativeActiveMonitors=${project.creativeActiveMonitorCount || 0}`,
      `creativeDueTasks=${project.creativeDueTaskCount || 0}`,
      `creativeImportedMonitorSignals=${project.creativeImportedMonitorSignalCount || 0}`,
      `creativeHarvestRuns=${project.creativeHarvestRunCount || 0}`,
      `creativeHarvestedInsights=${project.creativeHarvestedInsightCount || 0}`,
      `creativeCollectorAdapter=${project.creativeCollectorAdapterStatus || 'unknown'}`,
      `creativeCollectorProviderReady=${project.creativeCollectorProviderReady ? 1 : 0}`,
      `creativeSources=${project.creativeSourceCount || 0}`,
      `creativeProviderReadySources=${project.creativeProviderReadySourceCount || 0}`,
      `creativeSourceSyncRuns=${project.creativeSourceSyncRunCount || 0}`,
      `creativeProviderSourceFresh=${project.creativeProviderSourceFreshCount || 0}`,
      `creativeProviderSourceFailures=${project.creativeProviderSourceFailureCount || 0}`,
      `creativeSourceSyncCoverageScore=${project.creativeSourceSyncCoverageScore || 0}`,
      `creativeSourceSyncAccountObservations=${project.creativeSourceSyncAccountObservationCount || 0}`,
      `creativeSourceSyncTrendRankObservations=${project.creativeSourceSyncTrendRankObservationCount || 0}`,
      `creativeSourceSyncVideoTeardowns=${project.creativeSourceSyncVideoTeardownObservationCount || 0}`,
      `creativeSourceSyncMultimodalParsed=${project.creativeSourceSyncMultimodalParsedCount || 0}`,
      `creativeSourceObservations=${project.creativeSourceObservationCount || 0}`,
      `creativeSourceRepeatSources=${project.creativeSourceRepeatObservationSourceCount || 0}`,
      `creativeSourceScaleScore=${project.creativeSourceScaleScore || 0}`,
      `creativeSourceDepthScore=${project.creativeSourceDepthScore || 0}`,
      `creativeReadySourceHealthCards=${project.creativeReadySourceHealthCardCount || 0}`,
      `creativeAccountCoverageTargets=${project.creativeAccountTrackingCoverageTargetCount || 0}`,
      `creativeTrendRankCoverageSignals=${project.creativeTrendRankCoverageSignalCount || 0}`,
      `creativeVideoTeardownRepeatReady=${project.creativeVideoTeardownRepeatReady ? 1 : 0}`,
      `creativeAccountTrackingSourceReady=${project.creativeAccountTrackingSourceReady ? 1 : 0}`,
      `creativeTrendRankSourceReady=${project.creativeTrendRankSourceReady ? 1 : 0}`,
      `creativeVideoTeardownSourceReady=${project.creativeVideoTeardownSourceReady ? 1 : 0}`,
      `channelAccounts=${project.channelAccountCount || 0}`,
      `channelConnectedAccounts=${project.channelConnectedAccountCount || 0}`,
      `channelHealthyAccounts=${project.channelHealthyAccountCount || 0}`,
      `channelAvailableSlots=${project.channelAvailableSlotCount || 0}`,
      `channelAdCampaigns=${project.channelAdCampaignCount || 0}`,
      `channelReadyAdCampaigns=${project.channelReadyAdCampaignCount || 0}`,
      `channelActiveAdCampaigns=${project.channelActiveAdCampaignCount || 0}`,
      `channelMeasuredAdCampaigns=${project.channelMeasuredAdCampaignCount || 0}`,
      `channelAdBudgetCents=${project.channelAdBudgetCents || 0}`,
      `channelAdSpendCents=${project.channelAdSpendCents || 0}`,
      `channelAdEvidence=${project.channelAdEvidenceCount || 0}`,
      `assetPermissionRecords=${project.assetPermissionRecordCount || 0}`,
      `governedAssets=${project.governedAssetCount || 0}`,
      `assetPermissionAuditEvents=${project.assetPermissionAuditEventCount || 0}`,
      `assetPermissionAccessAuditEvents=${project.assetPermissionAccessAuditEventCount || 0}`,
      `assetStorageObjects=${project.assetStorageObjectCount || 0}`,
      `assetMissingStorageObjects=${project.assetMissingStorageObjectCount || 0}`,
      `assetSecurityPolicies=${project.assetSecurityPolicyCount || 0}`,
      `assetWatermarkRequired=${project.assetWatermarkRequiredCount || 0}`,
      `assetWatermarkApplied=${project.assetWatermarkAppliedCount || 0}`,
      `assetDlpPassedPolicies=${project.assetDlpPassedPolicyCount || 0}`,
      `assetDlpFailedPolicies=${project.assetDlpFailedPolicyCount || 0}`,
      `assetPublicShareBlocked=${project.assetPublicShareBlockedCount || 0}`,
      `assetRetentionPolicies=${project.assetRetentionPolicyCount || 0}`,
      `activeAssetAccessGrants=${project.activeAssetAccessGrantCount || 0}`,
      `expiredAssetAccessGrants=${project.expiredAssetAccessGrantCount || 0}`,
      `revokedAssetAccessGrants=${project.revokedAssetAccessGrantCount || 0}`,
      `expiredAssetPermissions=${project.expiredAssetPermissionCount || 0}`,
      `downloadableAssetAccessReady=${project.downloadableAssetAccessReadyCount || 0}`,
      `shareableAssetAccessReady=${project.shareableAssetAccessReadyCount || 0}`,
      `videoQueueItems=${project.videoProductionQueueItemCount || 0}`,
      `videoProviderExecutions=${project.videoProviderExecutionCount || 0}`,
      `videoSubmittedProviderExecutions=${project.videoSubmittedProviderExecutionCount || 0}`,
      `videoCompletedProviderExecutions=${project.videoCompletedProviderExecutionCount || 0}`,
      `videoFailedProviderExecutions=${project.videoFailedProviderExecutionCount || 0}`,
      `videoRetryableProviderExecutions=${project.videoRetryableProviderExecutionCount || 0}`,
      `videoResultAssets=${project.videoResultAssetCount || 0}`,
      `videoClientReviews=${project.videoClientReviewCount || 0}`,
      `videoApprovedDeliverables=${project.videoApprovedDeliverableCount || 0}`,
      `videoMeasured=${project.videoMeasuredCount || 0}`,
      `videoAverageLoopScore=${project.videoAverageLoopCompletionScore || 0}`,
      `brandLearningCreativeSignals=${project.brandLearningCreativeSignalCount || 0}`,
      `brandLearningPerformanceSignals=${project.brandLearningPerformanceSignalCount || 0}`,
      `brandLearningApprovedDeliverables=${project.brandLearningApprovedDeliverableCount || 0}`,
      `brandLearningWinningAssets=${project.brandLearningWinningAssetCount || 0}`,
      `brandLearningRules=${project.brandLearningRuleCount || 0}`,
      `auditedWenaiCreativeOutput=${project.auditedCreativeOutputCount || 0}`,
      `auditedWenaiVideoDistribution=${project.auditedVideoDistributionCount || 0}`,
      `auditedScalePlatformBreakdown=${project.auditedScalePlatformBreakdownCount || 0}`,
      `auditedScaleEvidenceUrls=${project.auditedScaleEvidenceUrlCount || 0}`,
      `auditedScaleDedupeReady=${project.auditedScaleHasDedupeRule ? 1 : 0}`,
      `auditedScaleDateRangeReady=${project.auditedScaleHasDateRange ? 1 : 0}`,
      `auditedScaleAuditorNoteReady=${project.auditedScaleHasAuditorNote ? 1 : 0}`,
    ],
    missingLinks: [...project.missingLinks, ...creativeMissingLinks, ...creativeMonitoringMissingLinks, ...channelMissingLinks, ...channelAdMissingLinks, ...assetPermissionMissingLinks, ...brandLearningMissingLinks],
    nextActions: [
      ...project.nextActions,
      ...creativeMissingLinks.map(item => `Close creative gap: ${item}`),
      ...creativeMonitoringMissingLinks.map(item => `Close creative monitoring gap: ${item}`),
      ...channelMissingLinks.map(item => `Close channel gap: ${item}`),
      ...channelAdMissingLinks.map(item => `Close ad campaign gap: ${item}`),
      ...assetPermissionMissingLinks.map(item => `Close asset permission gap: ${item}`),
      ...brandLearningMissingLinks.map(item => `Close brand learning gap: ${item}`),
    ],
  };
}

export function evaluateProductReadiness(input: ReadinessServiceInput): ProductReadinessReport {
  const projectReadiness = evaluateProjectReadiness(input.project);
  const platformConnectors = input.platformConnectors;
  const platformAutomationReady = Boolean(platformConnectors?.platformAutomationReady);
  const externalRequirements = buildExternalRequirements(input);
  const materialGateSummary = buildMaterialGateSummary(externalRequirements);
  const scaleClaimGuards = buildScaleClaimGuards(input);
  const productBlueprint = buildProductBlueprint(input, platformAutomationReady);
  const alternativeReferences = buildAlternativeReferences();
  const uiVariants = buildUiVariants();
  const platformConnectorEvidence = platformConnectors
    ? `configured=${platformConnectors.configuredCapabilities.join(',') || 'none'}; missing=${platformConnectors.missingCapabilities.join(',') || 'none'}`
    : 'platform connector ledger is missing from readiness input.';
  const features: ReadinessFeature[] = [
    makeFeature(
      '10 SKU POC intake and standard-pack routing',
      'implemented',
      '/poc、/inquire、/api/sales/inquiry、/modules/standard-pack 已形成提交、标准包、报告、CRM 入口。',
      'low',
      '继续用 E2E 覆盖主链路。',
    ),
    makeFeature(
      'CRM-lite commercial loop',
      'implemented',
      '询盘 API 支持 Redis 持久化，并在无 Redis 时内存降级；后台可维护状态、合同阶段、付款状态和外部 CRM 映射。',
      'low',
      '生产环境配置 Redis，避免进程重启丢失试用询盘。',
    ),
    makeFeature(
      'Enterprise asset permissions ledger',
      'implemented',
      '/api/asset-permissions tracks asset owners, scopes, roles, actions, expiry, and audit trail so cloud-asset/RBAC readiness is executable before external storage is connected.',
      'low',
      'Bind these policies to the real asset cloud provider after bucket/project credentials are available.',
    ),
    makeFeature(
      'Client review token portal',
      'implemented',
      '/api/industrial-chain/review-links plus /api/industrial-chain/review/[token] support no-login review links, feedback, revoke/expiry, approval audit, and delivery status writeback.',
      'low',
      'Add a customer-facing page on top of the API after the next UI pass; keep token expiry and revoke semantics covered by tests.',
    ),
    makeFeature(
      'Brand learning profile',
      'implemented',
      '/api/brand-learning-profile merges competitor insight, performance returns, and client-approved deliverables into reusable hook, pacing, approved-pattern, avoid-pattern, and next distribution rules.',
      'low',
      'Materialize one brand learning profile after every measured campaign and approved delivery batch.',
    ),
    makeFeature(
      'Creative monitoring watchlist',
      'implemented',
      '/api/creative-monitoring tracks competitor accounts, trend/rank targets, and video-keyword watchlists, emits due collection tasks, and imports monitored signals into the creative intelligence ledger.',
      'low',
      'Connect this watchlist to real platform scraping/OAuth later; until then, use due tasks for manual structured imports.',
    ),
    makeFeature(
      'Creative intelligence ledger',
      'implemented',
      '/api/creative-intelligence can import competitor videos, account signals, trend/rank signals, hook structure, pacing, metrics, reusable angles, and convert them into benchmark/script/distribution assets.',
      'low',
      'Import at least one competitor-account signal and one trend-rank signal per project before claiming Kuaizi-like creative insight depth.',
    ),
    makeFeature(
      'Channel account matrix ledger',
      'implemented',
      '/api/channel-accounts tracks platform handles, authorization state, account health, daily publish limits, scheduled load, and available publishing slots before distribution claims are accepted.',
      'low',
      'Connect this ledger to real OAuth/ad account APIs after provider credentials are available; keep manual_ready as the non-secret fallback.',
    ),
    makeFeature(
      'Kuaizi production connector',
      input.kuaiziConfigured ? 'implemented' : 'partial',
      input.kuaiziConfigured
        ? '/api/kuaizi/* 服务端代理已配置，可创建和轮询生产任务。'
        : '/api/kuaizi/* 已存在，但服务端未配置 KUAIZI_API_KEY 时只能导出生产规格。',
      input.kuaiziConfigured ? 'low' : 'medium',
      '配置服务端 KUAIZI_API_KEY，并用真实沙盒任务验证一次 create/poll。',
    ),
    makeFeature(
      'Image production',
      input.imageConfigured ? 'implemented' : 'partial',
      input.imageConfigured ? '/api/image-gen 可调用图像 provider。' : '/api/image-gen 未配置时返回明确降级，不伪造生产结果。',
      input.imageConfigured ? 'low' : 'medium',
      '配置图片 provider 或把导出规格中心做成主路径。',
    ),
    makeFeature(
      'AI video production',
      input.videoConfigured ? 'implemented' : 'partial',
      input.videoConfigured ? '/api/video-gen 可调用视频 provider。' : '/api/video-gen 未配置时要求导出规格或提供可访问参考图。',
      input.videoConfigured ? 'low' : 'medium',
      '配置视频 provider；否则把视频生产标成“交接包”，避免朋友误以为可一键成片。',
    ),
    makeFeature(
      'Creative insight / video teardown',
      input.videoTeardownConfigured ? 'implemented' : 'partial',
      input.videoTeardownConfigured ? '/api/video-teardown 可拆解参考视频。' : '/api/video-teardown 未配置时只能导出生产规格。',
      input.videoTeardownConfigured ? 'low' : 'medium',
      '配置视频理解 provider，或将页面首屏改成上传后生成人工拆解清单。',
    ),
    makeFeature(
      'Industrial asset and distribution store',
      input.industrialChainAvailable ? 'implemented' : 'partial',
      input.industrialChainAvailable
        ? '/api/industrial-chain 可沉淀 content assets、benchmark、production handoff pack、分发计划、UTM 和 ready 状态。'
        : '缺统一资产库和分发计划存储。',
      input.industrialChainAvailable ? 'low' : 'medium',
      '补资产库/分发计划，避免每次生产和复盘都只停留在页面临时状态。',
    ),
    makeFeature(
      'Full-chain commerce orchestration',
      input.commerceChainAvailable ? 'implemented' : 'partial',
      input.commerceChainAvailable
        ? '/api/commerce-chain 可串联 intake、asset、production、distribution、performance、CRM 下一步。'
        : '各模块存在，但缺少统一全链路编排报告。',
      input.commerceChainAvailable ? 'low' : 'medium',
      '把 POC、生产、分发计划、数据回流和 CRM action 汇总到同一报告。',
    ),
    makeFeature(
      'Performance feedback import',
      input.performanceImportAvailable ? 'implemented' : 'partial',
      input.performanceImportAvailable
        ? '/api/performance-import 可把平台 CSV 回流为 scale / iterate / pause 复盘决策。'
        : '可人工记录复盘，但缺少统一 CSV 回流入口。',
      input.performanceImportAvailable ? 'low' : 'medium',
      '接入平台 CSV 或 UTM 回流，确保每条素材能追溯 SKU、asset、platform。',
    ),
    makeFeature(
      'Distribution and ad authorization',
      input.distributionExecutionAvailable ? 'partial' : 'missing',
      input.distributionExecutionAvailable
        ? '/api/industrial-chain/dispatch 支持从 distribution plan 生成手工交接包、UTM、发布证据、结果链接和 measured 状态；真实平台 OAuth 仍是 provider-gated。'
        : '尚无广告/分发执行台账，只有分发计划。',
      input.distributionExecutionAvailable ? 'medium' : 'high',
      '继续补平台 OAuth 前，不伪造发布能力；先把 manual-ready、provider-gated、published、measured 的证据闭环跑实。',
    ),
    makeFeature(
      'Platform connector automation ledger',
      platformAutomationReady ? 'implemented' : 'partial',
      platformConnectorEvidence,
      platformAutomationReady ? 'low' : 'medium',
      'Wire real platform OAuth, ad accounts, auto-publish, analytics sync, and enterprise asset RBAC env/config without exposing secret values.',
    ),
    makeFeature(
      'Enterprise cloud asset management',
      input.storageConfigured ? 'partial' : 'missing',
      input.storageConfigured ? '有 Redis/分享存储，但不是筷子云盘级工程/文件/协作者体系。' : '无持久存储时仅内存降级。',
      'medium',
      '下一阶段补项目资产库、交付包版本、协作者权限。',
    ),
    makeFeature(
      'Account and permission system',
      input.authConfigured ? 'partial' : 'partial',
      input.authConfigured ? 'JWT 账号体系可用，但不是企业级 RBAC。' : '无 JWT 时处于本地试用模式。',
      'medium',
      '朋友试用可接受；企业试用前补角色边界和审计记录。',
    ),
  ];

  const workflows: ReadinessWorkflowCheck[] = [
    {
      name: 'Visitor -> POC -> report -> inquiry -> CRM',
      ok: Boolean(input.commerceChainAvailable),
      evidence: input.commerceChainAvailable
        ? 'POC、标准包、报告、询盘、CRM-lite 和 /api/commerce-chain 已能汇总成端到端交付报告。'
        : 'POC、标准包、报告、询盘、CRM-lite 都有真实路由/API，但缺少统一编排报告。',
      fix: input.commerceChainAvailable ? undefined : '补全链路编排 API。',
    },
    {
      name: 'Assets -> distribution plan -> measurable UTM',
      ok: Boolean(input.industrialChainAvailable),
      evidence: input.industrialChainAvailable
        ? '/api/industrial-chain 已支持资产库、production handoff pack 入库、分发计划、UTM code 和 ready/published/measured 状态。'
        : '资产和分发计划没有统一存储，难以形成筷子式内容生产台账。',
      fix: input.industrialChainAvailable ? undefined : '补工业化资产库和分发计划 API。',
    },
    {
      name: 'Brief -> production handoff -> Kuaizi task',
      ok: true,
      evidence: '生产规格包可导出；Kuaizi 服务端代理存在；无 key 时明确提示手动执行。',
    },
    {
      name: 'Produced assets -> performance data -> next iteration',
      ok: Boolean(input.performanceImportAvailable),
      evidence: input.performanceImportAvailable
        ? '/api/performance-import 已支持平台 CSV -> scale / iterate / pause 复盘决策。'
        : 'Listing Factory 有表现记录与复盘结构，但真实平台数据回流仍依赖人工导入或 provider 配置。',
      fix: input.performanceImportAvailable ? undefined : '补统一数据回流入口：CSV/广告平台导入 -> report -> CRM 下一步。',
    },
    {
      name: 'Distribution -> ad account -> platform analytics',
      ok: Boolean(input.distributionExecutionAvailable),
      evidence: input.distributionExecutionAvailable
        ? '/api/industrial-chain/dispatch 已能记录发布执行、手工交接包、证据 URL、结果 URL 和 measured 状态；平台 OAuth/广告账号授权仍需真实 provider 接入。'
        : '尚无筷子级广告平台 OAuth、矩阵分发、账号追踪。',
      fix: input.distributionExecutionAvailable
        ? '下一阶段只在拿到真实授权后接 OAuth/广告账号；当前状态必须标注 manual/provider-gated。'
        : '不要把 Wenai 讲成分发平台；先收敛到 POC 交付与生产规格。',
    },
  ];

  workflows.push({
    name: 'Platform OAuth -> ad account -> auto publish -> analytics sync',
    ok: platformAutomationReady,
    evidence: platformAutomationReady
      ? `OAuth, ad account, auto-publish, analytics sync, and enterprise asset permissions are configured. ${platformConnectorEvidence}`
      : `Manual dispatch ledger is available=${Boolean(input.distributionExecutionAvailable)}; platform automation is incomplete. ${platformConnectorEvidence}`,
    fix: platformAutomationReady
      ? undefined
      : 'Complete platform connector config, then verify one OAuth grant, one ad account, one publish action, and one analytics sync.',
  });

  const competitor: CompetitorDimension[] = [
    {
      name: '产品完整度',
      gap: input.kuaiziConfigured && input.imageConfigured && input.videoConfigured ? 'medium' : 'severe',
      evidence: 'Wenai 覆盖 POC 交付与生产规格；筷子覆盖内容工业化全链路和大规模运营。',
    },
    {
      name: '工作流闭环',
      gap: 'medium',
      evidence: 'Wenai 的 POC/CRM 闭环可跑；真实生产、分发、数据回流仍非一站式。',
    },
    {
      name: '技术稳定性',
      gap: 'minor',
      evidence: '本地验证、降级、服务端代理和内存 fallback 已补齐；生产 provider 仍需真实验收。',
    },
    {
      name: '用户体验成熟度',
      gap: 'medium',
      evidence: '核心路径清楚；部分 pipeline 仍有 alert 反馈和 provider-gated 能力。',
    },
  ];
  competitor.push({
    name: 'Platform automation depth',
    gap: platformAutomationReady ? 'minor' : 'severe',
    evidence: platformAutomationReady
      ? 'The platform connector ledger reports OAuth, ad account, publish, analytics, and enterprise asset permissions ready.'
      : `External platform automation is still gated: ${platformConnectorEvidence}.`,
  });

  const issues: ReadinessIssue[] = [];
  if (!input.storageConfigured) {
    issues.push({
      priority: 'P1',
      title: '无 Redis 时询盘只保留在内存',
      evidence: '/api/sales/inquiry 已降级可用，但进程重启会丢。',
      fix: '生产/朋友长期试用前配置 Redis。',
    });
  }
  if (!input.kuaiziConfigured) {
    issues.push({
      priority: 'P1',
      title: 'Kuaizi 外部生产未实连',
      evidence: '/api/kuaizi/* 可用但缺服务端 key 时不能创建真实任务。',
      fix: '配置 KUAIZI_API_KEY 并跑一次沙盒任务。',
    });
  }
  if (!input.imageConfigured || !input.videoConfigured || !input.videoTeardownConfigured) {
    issues.push({
      priority: 'P1',
      title: '创意生产 provider 未完全配置',
      evidence: '图片、视频、视频拆解至少一项处于导出规格模式。',
      fix: '把未配置能力在 UI 上明确标成“交接包”，或补 provider。',
    });
  }
  if (!input.performanceImportAvailable) {
    issues.push({
      priority: 'P1',
      title: '平台表现数据缺少统一回流入口',
      evidence: '没有 CSV/UTM 回流时，复盘依赖人工描述，难以持续迭代素材。',
      fix: '补平台 CSV 导入 -> report -> CRM 下一步。',
    });
  }
  if (!input.commerceChainAvailable) {
    issues.push({
      priority: 'P1',
      title: '全链路能力缺少统一编排入口',
      evidence: '单点功能可用，但用户无法看到从 POC 到 CRM 的完整链路验收结果。',
      fix: '补 /api/commerce-chain，把阶段状态、交付包和下一步动作统一输出。',
    });
  }
  if (!input.industrialChainAvailable) {
    issues.push({
      priority: 'P1',
      title: '缺少内容工业化资产库和分发计划台账',
      evidence: '没有资产/benchmark/渠道计划存储时，无法持续接近筷子科技的生产管理厚度。',
      fix: '补 /api/industrial-chain，沉淀资产、分发计划和 UTM 回流字段。',
    });
  }
  if (input.project && projectReadiness?.verdict !== 'pass') {
    issues.push({
      priority: projectReadiness?.verdict === 'fail' ? 'P1' : 'P2',
      title: '项目级内容工业化闭环尚未完全验收',
      evidence: projectReadiness
        ? `project=${input.project.projectId}; score=${projectReadiness.score}; missing=${projectReadiness.missingLinks.join(' | ') || 'none'}`
        : `project=${input.project.projectId}; no project readiness evidence`,
      fix: projectReadiness?.nextActions.join(' | ') || '补齐项目资产、分发执行和数据回流台账。',
    });
  }
  if (!platformAutomationReady) {
    issues.push({
      priority: 'P1',
      title: 'Kuaizi-level platform automation is not fully configured',
      evidence: platformConnectorEvidence,
      fix: 'Configure OAuth, ad account authorization, auto-publish, analytics sync, and enterprise asset permissions; verify with sandbox accounts before claiming parity.',
    });
  }
  issues.push({
    priority: 'P2',
    title: '筷子级分发和账号追踪缺失',
    evidence: input.distributionExecutionAvailable
      ? '已有 dispatch 执行台账和证据回填，但没有多平台 OAuth、广告账号授权、榜单追踪。'
      : '没有多平台 OAuth、矩阵发布计划、广告账号授权、榜单追踪。',
    fix: input.distributionExecutionAvailable
      ? '保留 provider-gated 标注，等真实账号授权后再接平台 adapter。'
      : '作为后续阶段，不阻断 10 SKU POC 试用。',
  });

  const p0 = issues.filter(issue => issue.priority === 'P0');
  const highRiskPseudo = features.some(feature => feature.status === 'pseudo' && feature.risk === 'high');
  const baseScore = Math.min(100, features.reduce((sum, feature) => sum + scoreFeature(feature), 0));
  const workflowPenalty = workflows.filter(item => !item.ok).length * 3;
  const score = Math.max(0, baseScore - workflowPenalty);
  const hasP1 = issues.some(issue => issue.priority === 'P1');
  const hasP2 = issues.some(issue => issue.priority === 'P2');
  const allWorkflowsOk = workflows.every(item => item.ok) && (!projectReadiness || projectReadiness.verdict !== 'fail');
  const verdict: ReadinessVerdict = p0.length > 0 || highRiskPseudo
    ? 'fail'
    : score >= 94 && allWorkflowsOk && !hasP1 && !hasP2
      ? 'pass'
      : score >= 82 && workflows[0].ok
        ? 'conditional'
        : 'fail';

  const friendTrialRisks = issues.filter(issue => issue.priority !== 'P2');

  return {
    verdict,
    label: verdict === 'pass' ? '通过' : verdict === 'conditional' ? '有条件通过' : '不通过',
    score,
    productBlueprint,
    alternativeReferences,
    uiVariants,
    competitor,
    features,
    workflows,
    issues,
    friendTrialRisks,
    externalRequirements,
    materialGateSummary,
    scaleClaimGuards,
    projectReadiness,
    recommendation: verdict === 'fail' ? '修复后保留' : '修复后保留',
  };
}

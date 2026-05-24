import {
  addContentAsset,
  addDistributionPlan,
  createDistributionDispatch,
  getDistributionDispatch,
  listContentAssets,
  listDistributionDispatches,
  listDistributionPlans,
  updateDistributionDispatch,
  type ContentAssetRecord,
  type DistributionDispatchRecord,
  type DistributionPlanRecord,
} from '@/lib/industrial-chain-store';
import { getCreativeIntelligenceSnapshot, type CreativeIntelligenceSnapshot } from '@/lib/creative-intelligence';
import { listIndustrialReviewLinks, getIndustrialReviewPortalView, type IndustrialReviewPortalView } from '@/lib/industrial-review-portal';
import { ingestIndustrialProductionResult } from '@/lib/industrial-production-result';

export type VideoWorkflowMode = 'handoff_only' | 'provider_ready';
export type VideoProviderExecutionStatus = 'submitted' | 'running' | 'completed' | 'failed' | 'blocked';
export type VideoQueueStage =
  | 'intake'
  | 'provider_gate'
  | 'ready_for_execution'
  | 'result_ingestion'
  | 'client_review'
  | 'revision'
  | 'approved'
  | 'performance_return';
export type VideoQueuePriority = 'high' | 'medium' | 'low';

export interface IndustrialVideoWorkflowInput {
  projectId: string;
  sku?: string;
  productName: string;
  category?: string;
  market?: string;
  goal?: string;
  audience?: string;
  platforms?: string[];
  references?: string[];
  productAssets?: string[];
  owner?: string;
  providerConfigured?: boolean;
  legalConsent?: boolean;
  qualityTier?: 'standard' | 'pro' | 'master';
  createDistributionPlans?: boolean;
  createDispatches?: boolean;
}

export interface VideoWorkflowArtifact {
  title: string;
  type: 'brief' | 'script' | 'storyboard' | 'checklist' | 'handoff';
  content: string;
}

export interface VideoRemixVariant {
  id: string;
  label: string;
  source: 'creative-opportunity' | 'pattern-cluster' | 'fallback';
  hook: string;
  cutPlan: string[];
  assetInstructions: string[];
  platformAdaptation: string;
  acceptance: string[];
  riskBoundary: string;
}

export interface VideoProductionTemplate {
  id: 'batch_ugc' | 'street_interview' | 'animated_ad' | 'editing_orchestration' | 'slideshow_reels';
  label: string;
  sourceReference: string;
  executionKind: 'video_batch' | 'video_brief' | 'editing_plan';
  useWhen: string[];
  requiredInputs: string[];
  deliverables: string[];
  qualityChecks: string[];
  providerBoundary: string;
}

export interface IndustrialVideoWorkflowPack {
  mode: VideoWorkflowMode;
  providerGate: {
    configured: boolean;
    legalConsent: boolean;
    referenceReady: boolean;
    productAssetsReady: boolean;
    qualityTier: 'standard' | 'pro' | 'master';
    blocker?: string;
  };
  stages: Array<{
    id: string;
    title: string;
    exitCriterion: string;
  }>;
  artifacts: VideoWorkflowArtifact[];
  reviewGates: Array<{
    id: string;
    mustPass: boolean;
    checks: string[];
  }>;
  productionTemplates: VideoProductionTemplate[];
  remixPlan: VideoRemixVariant[];
  assetManifest: Array<{
    id: string;
    required: boolean;
    acceptance: string;
  }>;
  markdown: string;
}

export interface IndustrialVideoWorkflowResult {
  pack: IndustrialVideoWorkflowPack;
  asset: ContentAssetRecord;
  distributionPlans: DistributionPlanRecord[];
  distributionDispatches: DistributionDispatchRecord[];
}

export interface VideoProductionQueueItem {
  assetId: string;
  title: string;
  sku?: string;
  mode: VideoWorkflowMode;
  stage: VideoQueueStage;
  priority: VideoQueuePriority;
  slaHoursRemaining: number;
  createdAt: string;
  updatedAt: string;
  planCount: number;
  dispatchCount: number;
  providerReadyDispatchCount: number;
  manualReadyDispatchCount: number;
  blockedDispatchCount: number;
  measuredDispatchCount: number;
  providerExecutionCount: number;
  submittedProviderExecutionCount: number;
  completedProviderExecutionCount: number;
  failedProviderExecutionCount: number;
  resultAssetCount: number;
  clientReviewAssetCount: number;
  approvedDeliverableCount: number;
  revisionRequestedCount: number;
  reviewLinks: IndustrialReviewPortalView[];
  resultUrls: string[];
  channels: string[];
  remixPlan: VideoRemixVariant[];
  providerRecovery: {
    retryableExecutionCount: number;
    blockedExecutionCount: number;
    latestFailedTaskId?: string;
    nextRetryAt?: string;
    failedReasons: string[];
    nextAction?: string;
  };
  loopCompletionScore: number;
  handoffPacket: {
    summary: string;
    missingEvidence: string[];
    reviewPortalUrls: string[];
    executionTrace: string[];
  };
  blockers: string[];
  nextActions: string[];
  runbookActions: Array<{
    id: string;
    label: string;
    endpoint: string;
    method: 'POST' | 'PATCH';
    payload: Record<string, unknown>;
  }>;
}

export interface VideoProviderExecutionRecord {
  id: string;
  orgId: string;
  projectId: string;
  sourceHandoffAssetId: string;
  dispatchId: string;
  providerName: string;
  taskId: string;
  status: VideoProviderExecutionStatus;
  requestPayload: Record<string, unknown>;
  blockedReasons: string[];
  resultUrls: string[];
  callbackNonce?: string;
  errorMessage?: string;
  attempt: number;
  estimatedCostCents?: number;
  maxCostCents?: number;
  actualCostCents?: number;
  callbackCount: number;
  nextRetryAt?: string;
  resultAssetIds: string[];
  reviewPortalUrls: string[];
  submittedAt: string;
  updatedAt: string;
}

export interface VideoProviderSubmissionResult {
  status: 'submitted' | 'failed' | 'blocked';
  providerName: string;
  execution?: VideoProviderExecutionRecord;
  blockedReasons: string[];
  providerStatus?: number;
}

export interface VideoProductionQueue {
  orgId: string;
  projectId: string;
  itemCount: number;
  providerReadyCount: number;
  handoffOnlyCount: number;
  blockedCount: number;
  measuredCount: number;
  providerExecutionCount: number;
  submittedProviderExecutionCount: number;
  completedProviderExecutionCount: number;
  failedProviderExecutionCount: number;
  retryableProviderExecutionCount: number;
  resultAssetCount: number;
  clientReviewCount: number;
  approvedDeliverableCount: number;
  revisionRequestedCount: number;
  averageLoopCompletionScore: number;
  items: VideoProductionQueueItem[];
}

export type OneClickVideoCapabilityId =
  | 'compose'
  | 'create'
  | 'cut'
  | 'cast'
  | 'manage'
  | 'ai_video_analysis'
  | 'smart_remix'
  | 'one_click_video'
  | 'matrix_distribution'
  | 'ad_delivery'
  | 'scale_claims';

export type OneClickVideoCapabilityStatus = 'internal_ready' | 'provider_gated' | 'needs_internal_evidence';

export interface OneClickVideoCapabilityState {
  id: OneClickVideoCapabilityId;
  label: string;
  status: OneClickVideoCapabilityStatus;
  evidence: string;
  nextStep: string;
  externalRequirement?: string;
}

export interface OneClickVideoScaleClaimGuard {
  label: string;
  requestedBenchmark: string;
  canDisplay: boolean;
  evidence: string;
  nextStep: string;
}

export interface OneClickVideoOperationResult {
  workflow: IndustrialVideoWorkflowResult;
  queue: VideoProductionQueue;
  queueItem: VideoProductionQueueItem | null;
  capabilityStates: OneClickVideoCapabilityState[];
  autoCreated: string[];
  internalNextActions: string[];
  externalRequirements: string[];
  scaleClaimGuards: OneClickVideoScaleClaimGuard[];
  commerciallyExecutable: boolean;
  operatorSummary: string;
}

type VideoExecutionGlobal = typeof globalThis & {
  __wenaiVideoProviderExecutions?: Map<string, VideoProviderExecutionRecord>;
  __wenaiVideoProviderExecutionLists?: Map<string, string[]>;
};

function executionStores() {
  const target = globalThis as VideoExecutionGlobal;
  if (!target.__wenaiVideoProviderExecutions) target.__wenaiVideoProviderExecutions = new Map();
  if (!target.__wenaiVideoProviderExecutionLists) target.__wenaiVideoProviderExecutionLists = new Map();
  return {
    records: target.__wenaiVideoProviderExecutions,
    lists: target.__wenaiVideoProviderExecutionLists,
  };
}

function cleanList(values: string[] | undefined, fallback: string[], limit = 12) {
  const clean = (values || []).map(item => item.trim()).filter(Boolean);
  return (clean.length > 0 ? clean : fallback).slice(0, limit);
}

function safe(value: string | undefined, fallback: string, limit = 240) {
  return (value || fallback).trim().slice(0, limit) || fallback;
}

function genExecutionId() {
  return `vpx_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function genCallbackNonce() {
  return `vpcn_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 14)}`;
}

function genProviderClientRequestId() {
  return `vpcr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function cleanNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? Math.floor(number) : undefined;
}

function cleanUrls(value: unknown, limit = 12) {
  if (!Array.isArray(value)) return [];
  return value.map(item => String(item).trim()).filter(Boolean).slice(0, limit);
}

function executionListKey(orgId: string, projectId: string) {
  return `${orgId}:${projectId}`;
}

function buildScript(productName: string, category: string, audience: string, creativeSnapshot?: CreativeIntelligenceSnapshot) {
  const opportunityRows = (creativeSnapshot?.opportunityMap || []).slice(0, 3).map((item, index) =>
    `| Insight ${index + 1} | ${item.angle} | ${item.productionInstruction} | ${item.distributionInstruction} |`,
  );
  return [
    '| Variant | Hook | Beats | CTA |',
    '| --- | --- | --- | --- |',
    ...opportunityRows,
    `| Problem | Most ${category} buyers do not notice this until after checkout. | pain scene -> product proof -> one clear use moment | Save this before buying ${productName}. |`,
    `| Comparison | I compared the cheap option, the popular option, and ${productName}. | 3-way contrast -> hidden tradeoff -> product role | Comment "compare" for the checklist. |`,
    `| Routine | If you are ${audience}, this is where ${productName} fits. | daily scene -> friction -> product close-up -> result cue | Try this in the next routine. |`,
  ].join('\n');
}

function buildRemixPlan(input: {
  productName: string;
  platforms: string[];
  creativeSnapshot?: CreativeIntelligenceSnapshot;
}): VideoRemixVariant[] {
  const opportunityVariants: VideoRemixVariant[] = (input.creativeSnapshot?.opportunityMap || []).slice(0, 3).map((item, index) => ({
    id: `remix_opportunity_${index + 1}`,
    label: `${item.platform} ${item.funnelStage} 变体`,
    source: 'creative-opportunity',
    hook: item.angle,
    cutPlan: [
      `0-2s: ${item.hookType} hook, reveal the problem/result immediately.`,
      `2-6s: ${item.productionInstruction}`,
      '6-11s: product close-up, proof moment, and one usage scene.',
      `11-15s: CTA and tracking tag creative_insight_id=${item.insightId}.`,
    ],
    assetInstructions: [
      'Use Wenai-owned product footage or approved source assets only.',
      'Export caption text separately for platform adaptation.',
      `Primary metric: ${item.primaryMetric}.`,
    ],
    platformAdaptation: item.distributionInstruction,
    acceptance: [
      'First 3 seconds show problem, product role, or visible proof.',
      'Variant changes only one main test variable.',
      'UTM and creative_insight_id are attached before dispatch.',
    ],
    riskBoundary: item.complianceBoundary,
  }));

  const clusterVariants: VideoRemixVariant[] = (input.creativeSnapshot?.patternClusters || []).slice(0, 2).map((cluster, index) => ({
    id: `remix_cluster_${index + 1}`,
    label: `${cluster.platform} 打法簇混剪`,
    source: 'pattern-cluster',
    hook: cluster.synthesis,
    cutPlan: [
      '0-2s: rebuild the strongest shared hook from the cluster with owned footage.',
      '2-5s: cut to proof moment, not borrowed footage.',
      '5-10s: rotate 2 product use scenes that match the cluster pacing.',
      '10-15s: end card and platform-specific CTA.',
    ],
    assetInstructions: [
      `Source mix: ${cluster.sourceMix.join(' + ')}.`,
      `Evidence score: ${cluster.evidenceScore}.`,
      'Create at least two cuts: fast proof cut and slower explanation cut.',
    ],
    platformAdaptation: cluster.distributionTest,
    acceptance: [
      'Every cut maps to a cluster insight, not a copied expression.',
      'At least two platform-ready versions are exported.',
      'Performance import can attribute results to the cluster_id.',
    ],
    riskBoundary: cluster.riskBoundary,
  }));

  const fallback: VideoRemixVariant = {
    id: 'remix_fallback_1',
    label: '基础一键视频混剪',
    source: 'fallback',
    hook: `Show the real buying pain before introducing ${input.productName}.`,
    cutPlan: [
      '0-2s: pain frame or result frame.',
      '2-6s: product enters and solves one visible job.',
      '6-11s: before/after or comparison.',
      '11-15s: CTA, offer, and platform-safe caption.',
    ],
    assetInstructions: [
      'Requires one product source asset and one scenario shot.',
      'Use owned footage, generated footage with consent, or licensed footage.',
      'Export 9:16 MP4 plus captions.',
    ],
    platformAdaptation: `Ship one version per platform: ${input.platforms.join(', ')}.`,
    acceptance: [
      'No unsupported claims.',
      'Product remains visually accurate.',
      'Evidence URL is captured after dispatch.',
    ],
    riskBoundary: 'Do not copy reference footage, captions, music, creator identity, or protected expression.',
  };

  const variants = [...opportunityVariants, ...clusterVariants];
  return (variants.length ? variants : [fallback]).slice(0, 5);
}

function buildProductionTemplates(input: {
  productName: string;
  category: string;
  platforms: string[];
}): VideoProductionTemplate[] {
  const platformList = input.platforms.join(', ');
  return [{
    id: 'batch_ugc',
    label: 'Batch UGC Video Pack',
    sourceReference: 'Clico batch-ugc-video skill',
    executionKind: 'video_batch',
    useWhen: [
      `Need multiple hook tests for ${input.productName}.`,
      'Need every variant tied to one test variable.',
      'Need a manifest that can move into review and distribution.',
    ],
    requiredInputs: ['product asset pack', 'approved claims', 'reference URLs', 'target audience', 'test variable'],
    deliverables: ['variant matrix', 'script pack', 'shot plan', 'batch manifest', 'review criteria'],
    qualityChecks: [
      'Each variant changes only one core variable.',
      'Every asset can be traced back to owned or licensed sources.',
      'Review token can be created for each produced result.',
    ],
    providerBoundary: 'Can create the batch plan internally; final rendered videos still require provider/editor execution and callback evidence.',
  }, {
    id: 'street_interview',
    label: 'Street Interview Video Builder',
    sourceReference: 'Clico street-interview-video skill',
    executionKind: 'video_brief',
    useWhen: [
      `Need a conversational ${input.category} story instead of a stiff ad.`,
      'Need interviewer/respondent/caption structure.',
      'Need natural objection handling before CTA.',
    ],
    requiredInputs: ['interviewer persona', 'respondent persona', 'product proof', 'objection list', 'platform tone'],
    deliverables: ['Q&A script', 'caption plan', 'camera direction', 'correction notes'],
    qualityChecks: [
      'Questions sound like a real street interview.',
      'Product proof appears before the CTA.',
      'No false testimonial or copied creator identity.',
    ],
    providerBoundary: 'Can generate the script and shot request internally; human talent/avatar consent and provider execution are external gates.',
  }, {
    id: 'animated_ad',
    label: 'Animated AI Ads Builder',
    sourceReference: 'Clico animated-ai-ads skill',
    executionKind: 'video_brief',
    useWhen: [
      'Need a mascot, package, or visual world to become an ad.',
      'Need style lock before generation.',
      `Need segmented requests for ${platformList}.`,
    ],
    requiredInputs: ['brand kit', 'style references', 'product packshot', 'scene list', 'voiceover tone'],
    deliverables: ['style frame prompt', 'storyboard', 'voiceover script', 'segmented generation request'],
    qualityChecks: [
      'Style stays consistent across segments.',
      'Product shape and packaging remain accurate.',
      'Each generation segment has a clear rejection rule.',
    ],
    providerBoundary: 'Can prepare the animated request internally; actual animation generation, voice, and rendering require provider materials.',
  }, {
    id: 'editing_orchestration',
    label: 'Video Editing Orchestration',
    sourceReference: 'Clico video-editing-orchestration skill',
    executionKind: 'editing_plan',
    useWhen: [
      'Already have rough footage or generated clips.',
      'Need pacing, crop, B-roll, PiP, and caption rules.',
      'Need an editor-ready plan without starting new generation.',
    ],
    requiredInputs: ['rough cut URL', 'segment timestamps', 'target duration', 'caption style', 'platform ratio'],
    deliverables: ['edit decision plan', 'caption plan', 'B-roll insertion list', 'acceptance checklist'],
    qualityChecks: [
      'Every cut has a timestamp or segment rule.',
      'Caption and crop rules are platform-specific.',
      'Final export can be reviewed before dispatch.',
    ],
    providerBoundary: 'Can create the EDL-style handoff internally; actual editing/rendering still needs editor or processing provider.',
  }, {
    id: 'slideshow_reels',
    label: 'Slideshow / Reels Batch',
    sourceReference: 'Clico slideshow-reels-batch skill',
    executionKind: 'video_batch',
    useWhen: [
      'Need fast creative tests without full video production.',
      'Need image briefs and contact-sheet review.',
      'Need lightweight variants for short-form platforms.',
    ],
    requiredInputs: ['image asset pack', 'slide count', 'headline options', 'offer', 'platform destination'],
    deliverables: ['slide sequence', 'image brief list', 'contact-sheet plan', 'platform caption set'],
    qualityChecks: [
      'Each slide has one visual idea.',
      'Text remains legible on mobile.',
      'Sequence can be approved before export.',
    ],
    providerBoundary: 'Can plan slideshow variants internally; final images/video export require image/render provider or manual production.',
  }];
}

function hoursBetween(from: string, to = new Date()) {
  const time = Date.parse(from);
  if (!Number.isFinite(time)) return 0;
  return Math.max(0, Math.round((to.getTime() - time) / 36_000) / 100);
}

function deriveStage(input: {
  mode: VideoWorkflowMode;
  linkedDispatchCount: number;
  resultAssetCount: number;
  clientReviewAssetCount: number;
  approvedDeliverableCount: number;
  revisionRequestedCount: number;
  measuredDispatchCount: number;
}): VideoQueueStage {
  if (input.revisionRequestedCount > 0) return 'revision';
  if (input.approvedDeliverableCount > 0 && input.measuredDispatchCount > 0) return 'performance_return';
  if (input.approvedDeliverableCount > 0) return 'approved';
  if (input.clientReviewAssetCount > 0) return 'client_review';
  if (input.resultAssetCount > 0) return 'result_ingestion';
  if (input.linkedDispatchCount > 0 && input.mode === 'provider_ready') return 'ready_for_execution';
  if (input.linkedDispatchCount > 0) return 'provider_gate';
  return 'intake';
}

function derivePriority(stage: VideoQueueStage, ageHours: number): VideoQueuePriority {
  if (stage === 'revision' || stage === 'client_review') return 'high';
  if (ageHours >= 48 && stage !== 'performance_return') return 'high';
  if (stage === 'provider_gate' || stage === 'result_ingestion') return 'medium';
  return 'low';
}

function isRetryableProviderExecution(execution: VideoProviderExecutionRecord, now = new Date()) {
  if (execution.status !== 'failed' && execution.status !== 'blocked') return false;
  const nonRetryableReasons = ['estimated_cost_exceeds_budget', 'actual_cost_exceeds_budget', 'terminal_callback_ignored'];
  if (execution.blockedReasons.some(reason => nonRetryableReasons.includes(reason))) return false;
  if (!execution.nextRetryAt) return true;
  const retryTime = Date.parse(execution.nextRetryAt);
  return !Number.isFinite(retryTime) || retryTime <= now.getTime();
}

function buildProviderRecovery(executions: VideoProviderExecutionRecord[], now = new Date()): VideoProductionQueueItem['providerRecovery'] {
  const failed = executions.filter(execution => execution.status === 'failed' || execution.status === 'blocked');
  const retryable = failed.filter(execution => isRetryableProviderExecution(execution, now));
  const latestFailed = failed[0];
  const futureRetryTimes = failed
    .map(execution => execution.nextRetryAt)
    .filter(Boolean)
    .sort() as string[];
  const failedReasons = Array.from(new Set(failed.flatMap(execution => execution.blockedReasons.length
    ? execution.blockedReasons
    : [execution.errorMessage || 'provider_execution_failed'],
  ))).slice(0, 6);
  return {
    retryableExecutionCount: retryable.length,
    blockedExecutionCount: failed.filter(execution => !isRetryableProviderExecution(execution, now)).length,
    latestFailedTaskId: latestFailed?.taskId,
    nextRetryAt: futureRetryTimes[0],
    failedReasons,
    nextAction: retryable.length > 0
      ? 'Retry the failed provider execution with the same governed workflow and dispatch context.'
      : futureRetryTimes.length > 0
        ? 'Wait for provider retry window, then resubmit if the workflow still has no result asset.'
        : failed.length > 0
          ? 'Resolve provider blocker before retrying; do not fabricate a result asset.'
          : undefined,
  };
}

function buildRunbookActions(input: {
  projectId: string;
  assetId: string;
  linkedPlanIds: string[];
  linkedDispatchIds: string[];
  resultAssetIds: string[];
  providerRecovery: VideoProductionQueueItem['providerRecovery'];
  stage: VideoQueueStage;
  mode: VideoWorkflowMode;
}) {
  const actions: VideoProductionQueueItem['runbookActions'] = [];
  if (input.linkedDispatchIds.length === 0 && input.linkedPlanIds.length > 0) {
    actions.push({
      id: 'create-dispatches',
      label: '把分发计划推进为执行记录',
      endpoint: '/api/industrial-chain/dispatch',
      method: 'POST',
      payload: { projectId: input.projectId, planIds: input.linkedPlanIds },
    });
  }
  if (input.providerRecovery.retryableExecutionCount > 0 && input.linkedDispatchIds[0]) {
    actions.push({
      id: 'retry-provider-execution',
      label: '重试失败的视频 provider 执行',
      endpoint: '/api/industrial-chain/video-workflow',
      method: 'POST',
      payload: {
        action: 'execute-provider-submission',
        projectId: input.projectId,
        sourceHandoffAssetId: input.assetId,
        dispatchId: input.linkedDispatchIds[0],
        providerName: 'configured-video-provider',
        requestPayload: {
          retryOfTaskId: input.providerRecovery.latestFailedTaskId,
          retryReason: input.providerRecovery.failedReasons.join('; '),
        },
      },
    });
  }
  if (input.stage === 'ready_for_execution' || input.stage === 'provider_gate') {
    if (input.mode === 'provider_ready') {
      actions.push({
        id: 'submit-provider-execution',
        label: '提交真实视频 provider 执行',
        endpoint: '/api/industrial-chain/video-workflow',
        method: 'POST',
        payload: {
          action: 'submit-provider-execution',
          projectId: input.projectId,
          sourceHandoffAssetId: input.assetId,
          dispatchId: input.linkedDispatchIds[0],
          providerName: 'configured-video-provider',
        },
      });
    }
    actions.push({
      id: 'ingest-production-result',
      label: '导入供应商或剪辑结果',
      endpoint: '/api/industrial-chain/production-result',
      method: 'POST',
      payload: {
        projectId: input.projectId,
        sourceHandoffAssetId: input.assetId,
        dispatchId: input.linkedDispatchIds[0],
        createReviewLinks: true,
        task: { taskId: 'replace-with-provider-task-id', status: 'completed', assetUrls: ['https://...'] },
      },
    });
  }
  if (input.resultAssetIds.length > 0 && (input.stage === 'result_ingestion' || input.stage === 'revision')) {
    actions.push({
      id: 'create-review-links',
      label: '为成片创建客户审核链接',
      endpoint: '/api/industrial-chain/review-links',
      method: 'POST',
      payload: { projectId: input.projectId, assetId: input.resultAssetIds[0], ttlDays: 14 },
    });
  }
  if (input.stage === 'approved' || input.stage === 'performance_return') {
    actions.push({
      id: 'import-performance-return',
      label: '导入发布后表现 CSV',
      endpoint: '/api/performance-import',
      method: 'POST',
      payload: { projectId: input.projectId, dispatchId: input.linkedDispatchIds[0], csv: 'sku,asset,platform,impressions,clicks,spend,orders,revenue' },
    });
  }
  if (input.mode === 'handoff_only' && input.stage === 'provider_gate') {
    actions.push({
      id: 'refresh-provider-ready-workflow',
      label: '补齐授权后重建供应商就绪任务',
      endpoint: '/api/industrial-chain/video-workflow',
      method: 'POST',
      payload: { projectId: input.projectId, productName: 'replace-with-product-name', providerConfigured: true, legalConsent: true },
    });
  }
  return actions;
}

function completionScore(input: {
  planCount: number;
  dispatchCount: number;
  resultAssetCount: number;
  reviewLinkCount: number;
  approvedDeliverableCount: number;
  measuredDispatchCount: number;
}) {
  const score =
    (input.planCount > 0 ? 15 : 0) +
    (input.dispatchCount > 0 ? 15 : 0) +
    (input.resultAssetCount > 0 ? 20 : 0) +
    (input.reviewLinkCount > 0 ? 15 : 0) +
    (input.approvedDeliverableCount > 0 ? 20 : 0) +
    (input.measuredDispatchCount > 0 ? 15 : 0);
  return Math.min(100, score);
}

function remixPlanFromAsset(asset: ContentAssetRecord): VideoRemixVariant[] {
  const rows = asset.evidence
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('Remix: '))
    .slice(0, 5);
  return rows.map((line, index) => {
    const [label = `智能混剪变体 ${index + 1}`, source = 'fallback'] = line.replace(/^Remix:\s*/, '').split('/').map(item => item.trim());
    const normalizedSource: VideoRemixVariant['source'] =
      source === 'creative-opportunity' || source === 'pattern-cluster' ? source : 'fallback';
    return {
      id: `asset_remix_${index + 1}`,
      label,
      source: normalizedSource,
      hook: 'Use the approved video workflow brief and rebuild the hook with owned assets.',
      cutPlan: [
        '0-2s: visible hook or proof frame.',
        '2-6s: product role and first proof moment.',
        '6-11s: usage scene or comparison cut.',
        '11-15s: CTA, caption, and tracking tag.',
      ],
      assetInstructions: [
        'Use only approved product assets, generated assets with consent, or licensed footage.',
        'Export captions separately for platform adaptation.',
      ],
      platformAdaptation: 'Create platform-specific 9:16 variants and attach UTM / asset_ref before dispatch.',
      acceptance: [
        'First 3 seconds are legible without tiny text.',
        'Product is not distorted.',
        'Result can be attributed back to this workflow asset.',
      ],
      riskBoundary: 'Do not copy reference footage, captions, music, creator identity, or protected expression.',
    };
  });
}

function buildPack(input: IndustrialVideoWorkflowInput, creativeSnapshot?: CreativeIntelligenceSnapshot): IndustrialVideoWorkflowPack {
  const productName = safe(input.productName, 'Product');
  const category = safe(input.category, 'commerce product');
  const market = safe(input.market, 'US');
  const audience = safe(input.audience, 'target buyers');
  const goal = safe(input.goal, 'generate a controlled short-video production pack', 500);
  const platforms = cleanList(input.platforms, ['TikTok Shop', 'Instagram Reels']);
  const references = cleanList(input.references, ['manual reference import required'], 20);
  const productAssets = cleanList(input.productAssets, ['product image pack required'], 20);
  const qualityTier = input.qualityTier || 'standard';
  const productionTemplates = buildProductionTemplates({ productName, category, platforms });
  const referenceReady = references.some(item => item !== 'manual reference import required');
  const productAssetsReady = productAssets.some(item => item !== 'product image pack required');
  const mode: VideoWorkflowMode = input.providerConfigured && input.legalConsent && referenceReady && productAssetsReady
    ? 'provider_ready'
    : 'handoff_only';
  const providerGate = {
    configured: Boolean(input.providerConfigured),
    legalConsent: Boolean(input.legalConsent),
    referenceReady,
    productAssetsReady,
    qualityTier,
    blocker: mode === 'provider_ready'
      ? undefined
      : 'Provider execution needs configured video keys, explicit legal consent, at least one reference URL, at least one product asset, budget control, and a selected quality tier. The workflow remains executable as a manual production handoff.',
  };

  const stages = [
    { id: 'reference-intelligence', title: 'Reference intelligence', exitCriterion: '3-5 references are reduced to hook, pacing, proof, scene, and CTA patterns without copying protected expression.' },
    { id: 'script-transfer', title: 'Script transfer', exitCriterion: 'Each script changes one test variable and replaces all product facts, persona, claims, and scenes.' },
    { id: 'storyboard', title: 'Storyboard and asset manifest', exitCriterion: 'Every 2-3 seconds has a shot, overlay, product role, and required source asset.' },
    { id: 'template-ladder', title: 'Template ladder', exitCriterion: 'Batch UGC, street interview, animated ad, editing orchestration, and slideshow variants are all represented as structured templates.' },
    { id: 'provider-request', title: 'Provider request package', exitCriterion: 'Video generation or editor handoff contains prompt, duration, ratio, quality tier, source assets, and rejection rules.' },
    { id: 'qa-and-distribution', title: 'QA and distribution bridge', exitCriterion: 'The accepted variant has platform dimensions, UTM, return metric, evidence URL requirement, and performance import plan.' },
  ];

  const creativeOpportunities = (creativeSnapshot?.opportunityMap || []).slice(0, 3);
  const remixPlan = buildRemixPlan({ productName, platforms, creativeSnapshot });
  const scriptPack = buildScript(productName, category, audience, creativeSnapshot);
  const storyboard = [
    '| Time | Shot | Overlay | Asset |',
    '| --- | --- | --- | --- |',
    ...creativeOpportunities.slice(0, 2).map((item, index) =>
      `| Insight ${index + 1} | ${item.productionInstruction} | ${item.hookType} / ${item.pacing} | creative_insight_id=${item.insightId} |`,
    ),
    '| 0-2s | show the problem in context | name the pain | reference pattern + scenario asset |',
    '| 2-6s | product enters naturally | one proof point | product close-up |',
    '| 6-11s | demonstrate the use case | simple before/after cue | user scene / B-roll |',
    '| 11-15s | hold product and CTA | save / compare / try | clean end card |',
  ].join('\n');
  const providerRequest = [
    `Product: ${productName}`,
    `Market: ${market}`,
    `Platforms: ${platforms.join(', ')}`,
    `Quality tier: ${qualityTier}`,
    `Reference ready: ${referenceReady}`,
    `Product assets ready: ${productAssetsReady}`,
    'Ratio: 9:16 vertical; duration: 15 seconds; export: MP4 H.264 plus caption text.',
    'Generation rule: create one style frame first; do not create full video until the frame passes review.',
    'Rejection rule: reject if the product is distorted, claim is unsupported, caption covers product label, or first 3 seconds do not reveal the problem.',
    `Remix variants: ${remixPlan.length}`,
    ...remixPlan.map(item => `- ${item.label}: ${item.cutPlan.join(' / ')}`),
  ].join('\n');

  const artifacts: VideoWorkflowArtifact[] = [
    {
      title: 'Campaign Video Brief',
      type: 'brief',
      content: [
        `Product: ${productName}`,
        `Category: ${category}`,
        `Market: ${market}`,
        `Audience: ${audience}`,
        `Goal: ${goal}`,
        `Platforms: ${platforms.join(', ')}`,
        creativeSnapshot ? `Creative insights: ${creativeSnapshot.insightCount}` : 'Creative insights: 0',
        creativeSnapshot?.topHookType ? `Preferred hook: ${creativeSnapshot.topHookType}` : '',
        creativeSnapshot?.topPacing ? `Preferred pacing: ${creativeSnapshot.topPacing}` : '',
        '',
        'References:',
        ...references.map(item => `- ${item}`),
        creativeOpportunities.length ? '' : '',
        creativeOpportunities.length ? 'Creative opportunity inputs:' : '',
        ...creativeOpportunities.map(item => `- ${item.angle} (${item.platform}, ${item.primaryMetric})`),
      ].join('\n'),
    },
    { title: 'Script Pack', type: 'script', content: scriptPack },
    { title: 'Storyboard', type: 'storyboard', content: storyboard },
    {
      title: 'Production Template Matrix',
      type: 'checklist',
      content: productionTemplates.map(template => [
        `### ${template.label}`,
        `Source: ${template.sourceReference}`,
        `Kind: ${template.executionKind}`,
        `Use when: ${template.useWhen.join(' | ')}`,
        `Inputs: ${template.requiredInputs.join(' | ')}`,
        `Deliverables: ${template.deliverables.join(' | ')}`,
        `Quality: ${template.qualityChecks.join(' | ')}`,
        `Boundary: ${template.providerBoundary}`,
      ].join('\n')).join('\n\n'),
    },
    {
      title: 'Smart Remix Plan',
      type: 'checklist',
      content: remixPlan.map(item => [
        `### ${item.label}`,
        `Source: ${item.source}`,
        `Hook: ${item.hook}`,
        'Cut plan:',
        ...item.cutPlan.map(step => `- ${step}`),
        'Assets:',
        ...item.assetInstructions.map(step => `- ${step}`),
        `Platform adaptation: ${item.platformAdaptation}`,
        'Acceptance:',
        ...item.acceptance.map(step => `- ${step}`),
        `Risk boundary: ${item.riskBoundary}`,
      ].join('\n')).join('\n\n'),
    },
    { title: 'Provider Request', type: 'handoff', content: providerRequest },
  ];

  const assetManifest = [
    { id: 'product-source', required: true, acceptance: `At least one clear source image or model sheet for ${productName}. Current inputs: ${productAssets.length}.` },
    { id: 'reference-breakdown', required: true, acceptance: 'References are used only for structure, pacing, and shot logic.' },
    { id: 'caption-master', required: true, acceptance: 'Caption text is exported separately so platforms can adapt without re-rendering.' },
    { id: 'performance-tags', required: true, acceptance: 'Variant name, UTM, platform, and return metric are attached before publish.' },
  ];

  const reviewGates = [
    { id: 'claim-safety', mustPass: true, checks: ['No cure, guaranteed result, fake endorsement, or unverifiable comparison.', 'Every product claim can be traced to the brief or product facts.'] },
    { id: 'first-three-seconds', mustPass: true, checks: ['Problem, audience, or result is visible in the first 3 seconds.', 'Hook does not depend on tiny text.'] },
    { id: 'asset-integrity', mustPass: true, checks: ['Product shape, label, color, and usage context are not distorted.', 'Captions do not cover product evidence.'] },
    { id: 'distribution-traceability', mustPass: true, checks: ['UTM and return metric are defined before handoff.', 'Evidence URL and performance CSV import owner are assigned.'] },
    { id: 'generation-authorization', mustPass: true, checks: ['Provider mode requires legal consent, reference URL, product asset, and quality tier.', 'Demo or missing-consent runs stay handoff_only and must not create provider jobs.'] },
  ];

  const markdown = [
    '## Industrial Video Workflow Pack',
    `- Mode: ${mode}`,
    `- Provider configured: ${providerGate.configured}`,
    `- Legal consent: ${providerGate.legalConsent}`,
    `- Reference ready: ${providerGate.referenceReady}`,
    `- Product assets ready: ${providerGate.productAssetsReady}`,
    `- Quality tier: ${providerGate.qualityTier}`,
    providerGate.blocker ? `- Blocker: ${providerGate.blocker}` : '',
    '',
    '### Stages',
    ...stages.map(stage => `- ${stage.title}: ${stage.exitCriterion}`),
    '',
    '### Artifacts',
    ...artifacts.map(artifact => `#### ${artifact.title}\n${artifact.content}`),
    '',
    '### Smart Remix Plan',
    ...remixPlan.flatMap(item => [`#### ${item.label}`, ...item.cutPlan.map(step => `- ${step}`)]),
    '',
    '### Production Template Matrix',
    ...productionTemplates.flatMap(template => [
      `#### ${template.label}`,
      `- Source: ${template.sourceReference}`,
      `- Kind: ${template.executionKind}`,
      `- Use when: ${template.useWhen.join(' | ')}`,
      `- Inputs: ${template.requiredInputs.join(' | ')}`,
      `- Deliverables: ${template.deliverables.join(' | ')}`,
      `- Quality: ${template.qualityChecks.join(' | ')}`,
      `- Boundary: ${template.providerBoundary}`,
    ]),
    '',
    '### Asset Manifest',
    ...assetManifest.map(item => `- ${item.required ? 'Required' : 'Optional'} ${item.id}: ${item.acceptance}`),
    '',
    '### Review Gates',
    ...reviewGates.flatMap(gate => [`#### ${gate.id}`, ...gate.checks.map(check => `- ${check}`)]),
  ].filter(Boolean).join('\n');

  return { mode, providerGate, stages, artifacts, reviewGates, productionTemplates, remixPlan, assetManifest, markdown };
}

export async function createIndustrialVideoWorkflow(
  orgId: string,
  input: IndustrialVideoWorkflowInput,
): Promise<IndustrialVideoWorkflowResult> {
  const creativeSnapshot = await getCreativeIntelligenceSnapshot(orgId, input.projectId);
  const pack = buildPack(input, creativeSnapshot);
  const platforms = cleanList(input.platforms, ['TikTok Shop', 'Instagram Reels'], 5);
  const asset = await addContentAsset(orgId, {
    projectId: input.projectId,
    sku: input.sku,
    type: 'production_handoff',
    title: `Video workflow: ${safe(input.productName, input.projectId)}`.slice(0, 200),
    source: 'industrial-video-workflow',
    tags: ['video-workflow', pack.mode, ...platforms],
    evidence: [
      `Mode: ${pack.mode}`,
      `Stages: ${pack.stages.length}`,
      `Artifacts: ${pack.artifacts.length}`,
      `Production templates: ${pack.productionTemplates.length}`,
      ...pack.productionTemplates.slice(0, 5).map(item => `Template: ${item.label} / ${item.executionKind}`),
      `Remix variants: ${pack.remixPlan.length}`,
      ...pack.remixPlan.slice(0, 3).map(item => `Remix: ${item.label} / ${item.source}`),
      `Provider gate: ${pack.providerGate.blocker || 'ready'}`,
      `Reference ready: ${pack.providerGate.referenceReady}`,
      `Product assets ready: ${pack.providerGate.productAssetsReady}`,
      `Quality tier: ${pack.providerGate.qualityTier}`,
      `Creative insights: ${creativeSnapshot.insightCount}`,
      `Creative opportunities: ${creativeSnapshot.opportunityCount}`,
      creativeSnapshot.topHookType ? `Top hook: ${creativeSnapshot.topHookType}` : '',
      creativeSnapshot.topPacing ? `Top pacing: ${creativeSnapshot.topPacing}` : '',
      ...pack.reviewGates.slice(0, 3).map(gate => `Gate: ${gate.id}`),
    ].filter(Boolean).join('\n').slice(0, 2000),
  });

  const distributionPlans = input.createDistributionPlans === false
    ? []
    : await Promise.all(platforms.map(platform => addDistributionPlan(orgId, {
      projectId: input.projectId,
      channel: platform,
      assetIds: [asset.id],
      status: 'ready',
      owner: input.owner || 'creative-ops',
      returnMetric: 'impressions / clicks / spend / orders / revenue / asset_ref',
    })));

  const distributionDispatches = input.createDispatches === false
    ? []
    : await Promise.all(distributionPlans.map(plan => createDistributionDispatch(orgId, {
      planId: plan.id,
      providerAdapter: {
        mode: pack.mode === 'provider_ready' ? 'provider' : 'manual',
        configured: pack.mode === 'provider_ready',
        providerName: pack.mode === 'provider_ready' ? 'configured-video-provider' : undefined,
        blocker: pack.providerGate.blocker,
      },
      notes: `Created from industrial video workflow asset ${asset.id}.`,
    })));

  return { pack, asset, distributionPlans, distributionDispatches };
}

function capabilityState(
  id: OneClickVideoCapabilityId,
  label: string,
  ready: boolean,
  evidence: string,
  nextStep: string,
  externalRequirement?: string,
): OneClickVideoCapabilityState {
  return {
    id,
    label,
    status: externalRequirement ? 'provider_gated' : ready ? 'internal_ready' : 'needs_internal_evidence',
    evidence,
    nextStep,
    externalRequirement,
  };
}

function uniqueRequirements(states: OneClickVideoCapabilityState[]) {
  return Array.from(new Set(states.map(state => state.externalRequirement).filter(Boolean) as string[]));
}

function scaleClaimGuardsFor(creativeSnapshot: CreativeIntelligenceSnapshot, queue: VideoProductionQueue): OneClickVideoScaleClaimGuard[] {
  return [{
    label: 'Creative output scale',
    requestedBenchmark: '91M+ creative output',
    canDisplay: false,
    evidence: `Wenai verified creative insights=${creativeSnapshot.insightCount}; workflow items=${queue.itemCount}. No audited Wenai-scale output ledger exists.`,
    nextStep: 'Connect production output ledger, dedupe generated assets, and import audited historical volume before displaying benchmark-scale claims.',
  }, {
    label: 'Video distribution scale',
    requestedBenchmark: '42M+ video distribution',
    canDisplay: false,
    evidence: `Wenai verified video dispatches=${queue.items.reduce((sum, item) => sum + item.dispatchCount, 0)}; measured video items=${queue.measuredCount}. No audited platform distribution counter exists.`,
    nextStep: 'Connect platform publish and analytics sync APIs, then count verified published video IDs and reach by account/platform.',
  }];
}

function buildOneClickCapabilityStates(
  workflow: IndustrialVideoWorkflowResult,
  creativeSnapshot: CreativeIntelligenceSnapshot,
  queue: VideoProductionQueue,
  queueItem: VideoProductionQueueItem | null,
): OneClickVideoCapabilityState[] {
  const platformCount = workflow.distributionPlans.length;
  const dispatchCount = workflow.distributionDispatches.length;
  const hasWorkflowAsset = Boolean(workflow.asset.id);
  const hasVideoTeardown = creativeSnapshot.teardownCount > 0;
  const hasCreativeDepth = creativeSnapshot.insightCount > 0 && creativeSnapshot.opportunityCount > 0;
  const providerReady = workflow.pack.mode === 'provider_ready';
  const hasRemixPlan = workflow.pack.remixPlan.length > 0;
  const hasQueueItem = Boolean(queueItem);
  const hasMatrixDistribution = platformCount >= 2 && dispatchCount >= 2;
  const hasManagedTrace = Boolean(queueItem?.handoffPacket.executionTrace.length);

  return [
    capabilityState(
      'compose',
      'Compose / creative intelligence',
      hasCreativeDepth,
      `insights=${creativeSnapshot.insightCount}; opportunities=${creativeSnapshot.opportunityCount}; clusters=${creativeSnapshot.patternClusterCount}`,
      'Import competitor account, trend rank, and video teardown signals until at least one ready production opportunity exists.',
    ),
    capabilityState(
      'create',
      'Create / workflow asset',
      hasWorkflowAsset,
      `asset=${workflow.asset.id}; artifacts=${workflow.pack.artifacts.length}; mode=${workflow.pack.mode}`,
      'Create a governed workflow asset with script, storyboard, provider request, and review gates.',
    ),
    capabilityState(
      'cut',
      'Cut / smart remix',
      hasRemixPlan,
      `remixVariants=${workflow.pack.remixPlan.length}; videoTeardownSignals=${creativeSnapshot.teardownCount}`,
      'Keep remix variants tied to insight IDs, owned assets, first-3-second checks, and platform adaptation.',
    ),
    capabilityState(
      'cast',
      'Cast / platform distribution',
      dispatchCount > 0,
      `plans=${platformCount}; dispatches=${dispatchCount}; providerReadyDispatches=${queueItem?.providerReadyDispatchCount || 0}`,
      'Create dispatch records for every target channel and attach publish evidence before performance import.',
      providerReady ? undefined : 'Platform OAuth, auto-publish adapters, and channel account authorization are required for fully automatic Cast.',
    ),
    capabilityState(
      'manage',
      'Manage / queue and review governance',
      hasQueueItem && hasManagedTrace,
      `queueItem=${hasQueueItem ? 1 : 0}; loopScore=${queueItem?.loopCompletionScore || 0}; trace=${queueItem?.handoffPacket.executionTrace.length || 0}`,
      'Keep every generated workflow in the queue until result, review, approval, dispatch evidence, and performance return are present.',
    ),
    capabilityState(
      'ai_video_analysis',
      'AI video analysis',
      hasVideoTeardown,
      `videoTeardownSignals=${creativeSnapshot.teardownCount}; topPacing=${creativeSnapshot.topPacing || 'none'}`,
      'Import or collect structured video teardown with scene beats, proof moment, product moment, CTA, and metrics.',
      hasVideoTeardown ? undefined : 'A real multimodal video parser or authorized teardown feed is required for continuous AI video analysis.',
    ),
    capabilityState(
      'smart_remix',
      'Smart remix',
      hasRemixPlan,
      `remixVariants=${workflow.pack.remixPlan.length}; sources=${workflow.pack.remixPlan.map(item => item.source).join(',') || 'none'}`,
      'Generate controlled cut variants from reusable creative patterns and licensed/owned assets.',
    ),
    capabilityState(
      'one_click_video',
      'One-click video operation',
      hasWorkflowAsset && platformCount > 0 && dispatchCount > 0 && hasQueueItem,
      `asset=${hasWorkflowAsset ? 1 : 0}; plans=${platformCount}; dispatches=${dispatchCount}; queue=${hasQueueItem ? 1 : 0}`,
      'Use this operation endpoint to create the workflow, distribution plan, dispatch handoff, queue item, and next-action packet in one call.',
      providerReady ? undefined : 'A real video generation/editing provider is required before the one-click operation can claim automatic finished-video output.',
    ),
    capabilityState(
      'matrix_distribution',
      'PubPal / matrix distribution',
      hasMatrixDistribution,
      `platforms=${platformCount}; dispatches=${dispatchCount}`,
      'Bind channel account ledgers to every dispatch slot and keep manual-ready fallback until OAuth is available.',
      hasMatrixDistribution && providerReady ? undefined : 'Multi-platform OAuth, account pools, rate limits, and automated publish APIs are required for PubPal-level matrix distribution.',
    ),
    capabilityState(
      'ad_delivery',
      'Ad delivery',
      false,
      'campaignLedger=available; liveAdApi=0; authorizedAdAccounts=0',
      'Keep budget, evidence, and performance-return gates in Wenai, then attach real ad-account authorization before live spend.',
      'Ad account authorization, campaign creation API, spend limits, and platform reporting sync are required before live ad delivery.',
    ),
    capabilityState(
      'scale_claims',
      'Scale claims',
      false,
      `requestedBenchmarks=91M+ creative output / 42M+ video distribution; WenaiVerified=false`,
      'Show only audited Wenai counters. Do not display Kuaizi-scale numbers as Wenai metrics.',
      'Audited historical production and distribution ledgers are required before displaying scale claims.',
    ),
  ];
}

export async function createOneClickVideoOperation(
  orgId: string,
  input: IndustrialVideoWorkflowInput,
): Promise<OneClickVideoOperationResult> {
  const workflow = await createIndustrialVideoWorkflow(orgId, {
    ...input,
    createDistributionPlans: input.createDistributionPlans !== false,
    createDispatches: input.createDispatches !== false,
  });
  const [creativeSnapshot, queue] = await Promise.all([
    getCreativeIntelligenceSnapshot(orgId, input.projectId),
    getIndustrialVideoProductionQueue(orgId, input.projectId),
  ]);
  const queueItem = queue.items.find(item => item.assetId === workflow.asset.id) || null;
  const capabilityStates = buildOneClickCapabilityStates(workflow, creativeSnapshot, queue, queueItem);
  const externalRequirements = uniqueRequirements(capabilityStates);
  const internalNextActions = Array.from(new Set([
    ...capabilityStates
      .filter(state => state.status === 'needs_internal_evidence')
      .map(state => state.nextStep),
    ...(queueItem?.nextActions || []),
  ])).slice(0, 12);
  const scaleClaimGuards = scaleClaimGuardsFor(creativeSnapshot, queue);
  const autoCreated = [
    `workflow_asset:${workflow.asset.id}`,
    ...workflow.distributionPlans.map(plan => `distribution_plan:${plan.id}:${plan.channel}`),
    ...workflow.distributionDispatches.map(dispatch => `dispatch:${dispatch.id}:${dispatch.status}`),
    queueItem ? `queue_item:${queueItem.stage}:${queueItem.loopCompletionScore}` : '',
  ].filter(Boolean);
  const commerciallyExecutable = externalRequirements.length === 0 &&
    capabilityStates.every(state => state.status === 'internal_ready') &&
    scaleClaimGuards.every(claim => claim.canDisplay);

  return {
    workflow,
    queue,
    queueItem,
    capabilityStates,
    autoCreated,
    internalNextActions,
    externalRequirements,
    scaleClaimGuards,
    commerciallyExecutable,
    operatorSummary: commerciallyExecutable
      ? 'One-click video operation is ready for commercial automation.'
      : 'One-click video operation created the internal workflow, but external provider/platform gates still block Kuaizi-level automated execution.',
  };
}

export async function listVideoProviderExecutions(orgId: string, projectId = 'default-project', limit = 100): Promise<VideoProviderExecutionRecord[]> {
  const store = executionStores();
  const ids = store.lists.get(executionListKey(orgId, projectId)) || [];
  return ids.slice(0, limit).map(id => store.records.get(`${orgId}:${id}`)).filter(Boolean) as VideoProviderExecutionRecord[];
}

export async function submitVideoProviderExecution(
  orgId: string,
  input: {
    projectId: string;
    sourceHandoffAssetId: string;
    dispatchId: string;
    providerName?: string;
    taskId?: string;
    requestPayload?: Record<string, unknown>;
    maxCostCents?: number;
    estimatedCostCents?: number;
  },
): Promise<VideoProviderExecutionRecord> {
  const projectId = safe(input.projectId, 'default-project', 120);
  const [asset, dispatch] = await Promise.all([
    listContentAssets(orgId, projectId, 500).then(assets => assets.find(item => item.id === input.sourceHandoffAssetId)),
    getDistributionDispatch(orgId, input.dispatchId),
  ]);
  const estimatedCostCents = cleanNumber(input.estimatedCostCents ?? input.requestPayload?.estimatedCostCents);
  const maxCostCents = cleanNumber(input.maxCostCents ?? input.requestPayload?.maxCostCents);
  const blockedReasons = [
    !asset ? 'source_handoff_asset_not_found' : '',
    asset && !asset.tags.includes('provider_ready') ? 'workflow_not_provider_ready' : '',
    !dispatch ? 'dispatch_not_found' : '',
    dispatch && dispatch.projectId !== projectId ? 'dispatch_project_mismatch' : '',
    dispatch && dispatch.providerAdapter.mode !== 'provider' ? 'dispatch_not_provider_mode' : '',
    dispatch && !dispatch.providerAdapter.configured ? 'dispatch_provider_not_configured' : '',
    maxCostCents !== undefined && estimatedCostCents !== undefined && estimatedCostCents > maxCostCents ? 'estimated_cost_exceeds_budget' : '',
  ].filter(Boolean);
  const now = new Date().toISOString();
  const record: VideoProviderExecutionRecord = {
    id: genExecutionId(),
    orgId,
    projectId,
    sourceHandoffAssetId: input.sourceHandoffAssetId,
    dispatchId: input.dispatchId,
    providerName: safe(input.providerName || dispatch?.providerAdapter.providerName, 'configured-video-provider', 120),
    taskId: safe(input.taskId, `provider-${Date.now().toString(36)}`, 160),
    status: blockedReasons.length > 0 ? 'blocked' : 'submitted',
    requestPayload: input.requestPayload || {},
    blockedReasons,
    resultUrls: [],
    callbackNonce: blockedReasons.length > 0 ? undefined : genCallbackNonce(),
    attempt: 1,
    estimatedCostCents,
    maxCostCents,
    callbackCount: 0,
    resultAssetIds: [],
    reviewPortalUrls: [],
    submittedAt: now,
    updatedAt: now,
  };
  const store = executionStores();
  store.records.set(`${orgId}:${record.id}`, record);
  const key = executionListKey(orgId, projectId);
  const list = store.lists.get(key) || [];
  store.lists.set(key, [record.id, ...list.filter(item => item !== record.id)].slice(0, 500));
  if (record.status === 'submitted') {
    await updateDistributionDispatch(orgId, input.dispatchId, {
      status: 'queued',
      notes: `Video provider execution submitted: ${record.taskId}`,
    });
  }
  return record;
}

export async function executeVideoProviderSubmission(
  orgId: string,
  input: {
    projectId: string;
    sourceHandoffAssetId: string;
    dispatchId: string;
    providerName?: string;
    requestPayload?: Record<string, unknown>;
    maxCostCents?: number;
    estimatedCostCents?: number;
    providerEndpoint?: string;
    providerToken?: string;
    fetcher?: typeof fetch;
  },
): Promise<VideoProviderSubmissionResult> {
  const projectId = safe(input.projectId, 'default-project', 120);
  const providerName = safe(input.providerName, 'configured-video-provider', 120);
  const providerEndpoint = safe(input.providerEndpoint || process.env.VIDEO_PROVIDER_SUBMIT_ENDPOINT, '', 500);
  const providerToken = safe(input.providerToken || process.env.VIDEO_PROVIDER_SUBMIT_TOKEN, '', 500);
  const configBlockedReasons = [
    !providerEndpoint ? 'video_provider_submit_endpoint_not_configured' : '',
    !providerToken ? 'video_provider_submit_token_not_configured' : '',
  ].filter(Boolean);

  if (configBlockedReasons.length > 0) {
    return { status: 'blocked', providerName, blockedReasons: configBlockedReasons };
  }

  const clientRequestId = genProviderClientRequestId();
  const execution = await submitVideoProviderExecution(orgId, {
    projectId,
    sourceHandoffAssetId: input.sourceHandoffAssetId,
    dispatchId: input.dispatchId,
    providerName,
    taskId: clientRequestId,
    requestPayload: input.requestPayload,
    maxCostCents: input.maxCostCents,
    estimatedCostCents: input.estimatedCostCents,
  });

  if (execution.status === 'blocked') {
    return { status: 'blocked', providerName, execution, blockedReasons: execution.blockedReasons };
  }

  const providerPayload = {
    action: 'video-provider-submit',
    projectId,
    sourceHandoffAssetId: input.sourceHandoffAssetId,
    dispatchId: input.dispatchId,
    providerName,
    clientRequestId,
    executionId: execution.id,
    callbackNonce: execution.callbackNonce,
    callbackAction: 'provider-callback',
    callbackEndpoint: '/api/industrial-chain/video-workflow',
    request: input.requestPayload || {},
    budget: {
      maxCostCents: input.maxCostCents,
      estimatedCostCents: input.estimatedCostCents,
    },
  };

  const store = executionStores();
  store.records.set(`${orgId}:${execution.id}`, {
    ...execution,
    requestPayload: providerPayload,
    updatedAt: new Date().toISOString(),
  });

  try {
    const response = await (input.fetcher || fetch)(providerEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${providerToken}`,
      },
      body: JSON.stringify(providerPayload),
    });

    if (!response.ok) {
      const failed = await updateVideoProviderExecution(orgId, {
        projectId,
        executionId: execution.id,
        status: 'failed',
        errorMessage: `Video provider submit returned HTTP ${response.status}.`,
        callbackNonce: execution.callbackNonce,
      });
      return {
        status: 'failed',
        providerName,
        execution: failed || execution,
        providerStatus: response.status,
        blockedReasons: [`video_provider_submit_http_${response.status}`],
      };
    }

    const payload = await response.json().catch(() => null) as { taskId?: unknown; estimatedCostCents?: unknown } | null;
    const taskId = safe(typeof payload?.taskId === 'string' ? payload.taskId : undefined, '', 160);
    if (!taskId) {
      const failed = await updateVideoProviderExecution(orgId, {
        projectId,
        executionId: execution.id,
        status: 'failed',
        errorMessage: 'Video provider submit response did not include taskId.',
        callbackNonce: execution.callbackNonce,
      });
      return {
        status: 'failed',
        providerName,
        execution: failed || execution,
        providerStatus: response.status,
        blockedReasons: ['video_provider_submit_missing_task_id'],
      };
    }

    const submitted: VideoProviderExecutionRecord = {
      ...(store.records.get(`${orgId}:${execution.id}`) || execution),
      taskId,
      estimatedCostCents: cleanNumber(payload?.estimatedCostCents) ?? execution.estimatedCostCents,
      updatedAt: new Date().toISOString(),
    };
    store.records.set(`${orgId}:${execution.id}`, submitted);
    await updateDistributionDispatch(orgId, input.dispatchId, {
      status: 'queued',
      notes: `Video provider execution submitted: ${taskId}`,
    });

    return { status: 'submitted', providerName, execution: submitted, providerStatus: response.status, blockedReasons: [] };
  } catch (error) {
    const failed = await updateVideoProviderExecution(orgId, {
      projectId,
      executionId: execution.id,
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Video provider submit failed.',
      callbackNonce: execution.callbackNonce,
    });
    return {
      status: 'failed',
      providerName,
      execution: failed || execution,
      blockedReasons: ['video_provider_submit_failed'],
    };
  }
}

export async function updateVideoProviderExecution(
  orgId: string,
  input: {
    projectId: string;
    executionId?: string;
    taskId?: string;
    status: Exclude<VideoProviderExecutionStatus, 'submitted' | 'blocked'>;
    resultUrls?: string[];
    errorMessage?: string;
    actualCostCents?: number;
    retryAfterSeconds?: number;
    callbackNonce?: string;
  },
): Promise<VideoProviderExecutionRecord | null> {
  const projectId = safe(input.projectId, 'default-project', 120);
  const executions = await listVideoProviderExecutions(orgId, projectId, 500);
  const existing = executions.find(item =>
    (input.executionId && item.id === input.executionId) ||
    (input.taskId && item.taskId === input.taskId),
  );
  if (!existing) return null;
  if (existing.callbackNonce && input.callbackNonce !== existing.callbackNonce) return null;

  if (existing.status === 'completed' || existing.status === 'failed') {
    const now = new Date().toISOString();
    const terminal: VideoProviderExecutionRecord = {
      ...existing,
      callbackCount: existing.callbackCount + 1,
      blockedReasons: Array.from(new Set([
        ...existing.blockedReasons,
        input.status !== existing.status ? 'terminal_callback_ignored' : '',
      ].filter(Boolean))),
      updatedAt: now,
    };
    executionStores().records.set(`${orgId}:${existing.id}`, terminal);
    return terminal;
  }

  const resultUrls = cleanUrls(input.resultUrls);
  const actualCostCents = cleanNumber(input.actualCostCents);
  const blockedReasons = Array.from(new Set([
    ...existing.blockedReasons,
    input.status === 'completed' && resultUrls.length === 0 ? 'completed_callback_missing_result_url' : '',
    existing.maxCostCents !== undefined && actualCostCents !== undefined && actualCostCents > existing.maxCostCents ? 'actual_cost_exceeds_budget' : '',
  ].filter(Boolean)));
  const forcedFailure = blockedReasons.includes('completed_callback_missing_result_url') || blockedReasons.includes('actual_cost_exceeds_budget');
  const status: VideoProviderExecutionStatus = forcedFailure ? 'failed' : input.status;
  const now = new Date().toISOString();
  const nextRetryAt = input.retryAfterSeconds && status === 'failed'
    ? new Date(Date.now() + Math.max(1, Math.min(Math.floor(input.retryAfterSeconds), 86_400)) * 1000).toISOString()
    : undefined;
  const next: VideoProviderExecutionRecord = {
    ...existing,
    status,
    blockedReasons,
    resultUrls: resultUrls.length ? resultUrls : existing.resultUrls,
    errorMessage: input.errorMessage ? safe(input.errorMessage, 'provider execution failed', 500) : existing.errorMessage,
    actualCostCents,
    callbackCount: existing.callbackCount + 1,
    nextRetryAt,
    resultAssetIds: existing.resultAssetIds || [],
    reviewPortalUrls: existing.reviewPortalUrls || [],
    updatedAt: now,
  };
  const store = executionStores();
  store.records.set(`${orgId}:${existing.id}`, next);

  if (status === 'running') {
    await updateDistributionDispatch(orgId, existing.dispatchId, {
      status: 'queued',
      notes: `Video provider execution running: ${existing.taskId}`,
    });
  }
  if (status === 'completed') {
    const productionResult = await ingestIndustrialProductionResult(orgId, {
      projectId,
      sourceHandoffAssetId: existing.sourceHandoffAssetId,
      dispatchId: existing.dispatchId,
      createReviewLinks: true,
      reviewTtlDays: 14,
      task: {
        taskId: existing.taskId,
        status: 'completed',
        assetUrls: next.resultUrls,
        providerRaw: {
          providerName: existing.providerName,
          executionId: existing.id,
          actualCostCents,
        },
      },
    });
    const finalized: VideoProviderExecutionRecord = {
      ...next,
      resultAssetIds: productionResult.assets.map(asset => asset.id),
      reviewPortalUrls: productionResult.reviewLinks.map(link => `/review/${link.token}`),
      updatedAt: new Date().toISOString(),
    };
    store.records.set(`${orgId}:${existing.id}`, finalized);
    await updateDistributionDispatch(orgId, existing.dispatchId, {
      status: 'published',
      resultUrls: finalized.resultUrls,
      notes: `Video provider execution completed: ${existing.taskId}`,
    });
    return finalized;
  }
  if (status === 'failed') {
    await updateDistributionDispatch(orgId, existing.dispatchId, {
      status: 'provider_gated',
      notes: `Video provider execution failed: ${next.errorMessage || blockedReasons.join(',') || existing.taskId}`,
    });
  }
  return next;
}

export async function getIndustrialVideoProductionQueue(orgId: string, projectId = 'default-project'): Promise<VideoProductionQueue> {
  const [assets, plans, dispatches, reviewLinks, providerExecutions] = await Promise.all([
    listContentAssets(orgId, projectId, 200),
    listDistributionPlans(orgId, projectId, 200),
    listDistributionDispatches(orgId, projectId, 200),
    listIndustrialReviewLinks(orgId, projectId, 200),
    listVideoProviderExecutions(orgId, projectId, 200),
  ]);
  const workflowAssets = assets.filter(asset => asset.source === 'industrial-video-workflow');
  const items = workflowAssets.map(asset => {
    const mode: VideoWorkflowMode = asset.tags.includes('provider_ready') ? 'provider_ready' : 'handoff_only';
    const linkedPlans = plans.filter(plan => plan.assetIds.includes(asset.id));
    const linkedPlanIds = new Set(linkedPlans.map(plan => plan.id));
    const linkedDispatches = dispatches.filter(dispatch => linkedPlanIds.has(dispatch.planId));
    const itemProviderExecutions = providerExecutions.filter(execution => execution.sourceHandoffAssetId === asset.id);
    const providerRecovery = buildProviderRecovery(itemProviderExecutions);
    const providerReadyDispatchCount = linkedDispatches.filter(dispatch => dispatch.providerAdapter.mode === 'provider' && dispatch.providerAdapter.configured).length;
    const manualReadyDispatchCount = linkedDispatches.filter(dispatch => dispatch.status === 'manual_ready' || dispatch.status === 'queued').length;
    const blockedDispatchCount = linkedDispatches.filter(dispatch => dispatch.status === 'blocked' || dispatch.status === 'provider_gated').length;
    const measuredDispatchCount = linkedDispatches.filter(dispatch => dispatch.status === 'measured').length;
    const resultAssets = assets.filter(candidate =>
      candidate.source === 'kuaizi-production-result' &&
      candidate.tags.includes(asset.id),
    );
    const resultAssetIds = new Set(resultAssets.map(candidate => candidate.id));
    const itemReviewLinks = reviewLinks
      .filter(link => resultAssetIds.has(link.assetId))
      .map(getIndustrialReviewPortalView);
    const clientReviewAssetCount = resultAssets.filter(candidate => candidate.deliveryStatus === 'client_review' || Boolean(candidate.clientReviewUrl)).length;
    const approvedDeliverableCount = resultAssets.filter(candidate => candidate.deliveryStatus === 'approved' && Boolean(candidate.clientApprovedAt)).length;
    const revisionRequestedCount = resultAssets.filter(candidate => candidate.deliveryStatus === 'revision_requested').length;
    const resultUrls = Array.from(new Set([
      ...resultAssets.map(candidate => candidate.url || '').filter(Boolean),
      ...linkedDispatches.flatMap(dispatch => dispatch.resultUrls),
      ...itemProviderExecutions.flatMap(execution => execution.resultUrls),
    ])).slice(0, 12);
    const remixPlan = remixPlanFromAsset(asset);
    const blockers = Array.from(new Set([
      ...linkedDispatches.map(dispatch => dispatch.providerAdapter.blocker || '').filter(Boolean),
      asset.evidence.includes('Provider gate: ready') ? '' : 'Provider generation remains handoff-only until config, consent, references, and product assets are ready.',
      resultAssets.length > 0 && approvedDeliverableCount === 0 ? 'Produced video assets are waiting for client review approval.' : '',
      revisionRequestedCount > 0 ? 'Client requested revisions on at least one produced video asset.' : '',
    ].filter(Boolean))).slice(0, 5);
    const missingEvidence = [
      linkedPlans.length === 0 ? 'Missing platform distribution plans for this video workflow.' : '',
      linkedDispatches.length === 0 ? 'Missing dispatch records for target platforms.' : '',
      mode === 'handoff_only' ? 'Provider automation gate is not fully satisfied; keep execution as manual handoff.' : '',
      resultAssets.length === 0 ? 'Missing completed provider/editor result URL.' : '',
      resultAssets.length > 0 && itemReviewLinks.length === 0 ? 'Missing client review portal link for produced video.' : '',
      clientReviewAssetCount > 0 && approvedDeliverableCount === 0 ? 'Missing client approval or revision decision.' : '',
      approvedDeliverableCount > 0 && measuredDispatchCount === 0 ? 'Missing post-publish performance return.' : '',
    ].filter(Boolean);
    const nextActions = [
      linkedPlans.length === 0 ? 'Create distribution plans for the video workflow asset.' : '',
      linkedDispatches.length === 0 ? 'Create dispatch records and assign an owner for every target platform.' : '',
      mode === 'handoff_only' ? 'Attach provider credentials, legal consent, references, and product assets before provider execution.' : '',
      resultAssets.length === 0 && linkedDispatches.length > 0 ? 'Ingest completed provider/editor result URLs through /api/industrial-chain/production-result.' : '',
      resultAssets.length > 0 && itemReviewLinks.length === 0 ? 'Create client review links for produced video assets.' : '',
      clientReviewAssetCount > 0 && approvedDeliverableCount === 0 ? 'Send the review portal link to the client and capture approval or revision feedback.' : '',
      measuredDispatchCount === 0 && linkedDispatches.length > 0 ? 'Publish or hand off the video, capture evidence URL, then import performance CSV.' : '',
    ].filter(Boolean);
    const stage = deriveStage({
      mode,
      linkedDispatchCount: linkedDispatches.length,
      resultAssetCount: resultAssets.length,
      clientReviewAssetCount,
      approvedDeliverableCount,
      revisionRequestedCount,
      measuredDispatchCount,
    });
    const ageHours = hoursBetween(asset.createdAt);
    const priority = derivePriority(stage, ageHours);
    const reviewPortalUrls = itemReviewLinks.map(link => `/review/${link.token}`);
    const loopCompletionScore = completionScore({
      planCount: linkedPlans.length,
      dispatchCount: linkedDispatches.length,
      resultAssetCount: resultAssets.length,
      reviewLinkCount: itemReviewLinks.length,
      approvedDeliverableCount,
      measuredDispatchCount,
    });
    return {
      assetId: asset.id,
      title: asset.title,
      sku: asset.sku,
      mode,
      stage,
      priority,
      slaHoursRemaining: Math.max(0, 48 - ageHours),
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
      planCount: linkedPlans.length,
      dispatchCount: linkedDispatches.length,
      providerReadyDispatchCount,
      manualReadyDispatchCount,
      blockedDispatchCount,
      measuredDispatchCount,
      providerExecutionCount: itemProviderExecutions.length,
      submittedProviderExecutionCount: itemProviderExecutions.filter(execution => execution.status === 'submitted' || execution.status === 'running').length,
      completedProviderExecutionCount: itemProviderExecutions.filter(execution => execution.status === 'completed').length,
      failedProviderExecutionCount: itemProviderExecutions.filter(execution => execution.status === 'failed' || execution.status === 'blocked').length,
      resultAssetCount: resultAssets.length,
      clientReviewAssetCount,
      approvedDeliverableCount,
      revisionRequestedCount,
      reviewLinks: itemReviewLinks,
      resultUrls,
      channels: Array.from(new Set(linkedPlans.map(plan => plan.channel))).slice(0, 8),
      remixPlan,
      providerRecovery,
      loopCompletionScore,
      handoffPacket: {
        summary: `${stage} / ${mode} / plans:${linkedPlans.length} / dispatches:${linkedDispatches.length} / results:${resultAssets.length} / reviews:${itemReviewLinks.length} / approved:${approvedDeliverableCount}`,
        missingEvidence,
        reviewPortalUrls,
        executionTrace: [
          `handoff_asset:${asset.id}`,
          ...linkedPlans.map(plan => `plan:${plan.id}:${plan.channel}`),
          ...linkedDispatches.map(dispatch => `dispatch:${dispatch.id}:${dispatch.status}`),
          ...itemProviderExecutions.map(execution => `provider_execution:${execution.taskId}:${execution.status}`),
          ...resultAssets.map(result => `result_asset:${result.id}:${result.deliveryStatus || 'pending'}`),
          ...itemReviewLinks.map(link => `review:${link.token}:${link.status}`),
        ].slice(0, 20),
      },
      blockers,
      nextActions,
      runbookActions: buildRunbookActions({
        projectId,
        assetId: asset.id,
        linkedPlanIds: linkedPlans.map(plan => plan.id),
        linkedDispatchIds: linkedDispatches.map(dispatch => dispatch.id),
        resultAssetIds: Array.from(resultAssetIds),
        providerRecovery,
        stage,
        mode,
      }),
    };
  });

  return {
    orgId,
    projectId,
    itemCount: items.length,
    providerReadyCount: items.filter(item => item.mode === 'provider_ready').length,
    handoffOnlyCount: items.filter(item => item.mode === 'handoff_only').length,
    blockedCount: items.filter(item => item.blockedDispatchCount > 0 || item.blockers.length > 0).length,
    measuredCount: items.filter(item => item.measuredDispatchCount > 0).length,
    providerExecutionCount: items.reduce((sum, item) => sum + item.providerExecutionCount, 0),
    submittedProviderExecutionCount: items.reduce((sum, item) => sum + item.submittedProviderExecutionCount, 0),
    completedProviderExecutionCount: items.reduce((sum, item) => sum + item.completedProviderExecutionCount, 0),
    failedProviderExecutionCount: items.reduce((sum, item) => sum + item.failedProviderExecutionCount, 0),
    retryableProviderExecutionCount: items.reduce((sum, item) => sum + item.providerRecovery.retryableExecutionCount, 0),
    resultAssetCount: items.reduce((sum, item) => sum + item.resultAssetCount, 0),
    clientReviewCount: items.reduce((sum, item) => sum + item.clientReviewAssetCount, 0),
    approvedDeliverableCount: items.reduce((sum, item) => sum + item.approvedDeliverableCount, 0),
      revisionRequestedCount: items.reduce((sum, item) => sum + item.revisionRequestedCount, 0),
    averageLoopCompletionScore: items.length
      ? Math.round(items.reduce((sum, item) => sum + item.loopCompletionScore, 0) / items.length)
      : 0,
    items,
  };
}

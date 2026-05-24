import {
  addCreativeInsight,
  type CreativeHookType,
  type CreativeInsightRecord,
  type CreativeInsightSource,
  type CreativePacing,
} from '@/lib/creative-intelligence';
import { materializeBrandLearningProfile } from '@/lib/brand-learning-profile';

export type CreativeMonitorType = 'competitor_account' | 'trend_rank' | 'video_keyword';
export type CreativeMonitorStatus = 'active' | 'paused';
export type CreativeCollectorAdapterMode = 'manual_ops' | 'provider';
export type CreativeCollectorAdapterStatus = 'manual_ops' | 'provider_ready' | 'degraded' | 'not_configured';
export type CreativeSourceKind = 'account_tracking' | 'trend_rank' | 'video_teardown';
export type CreativeSourceStatus = 'manual_ready' | 'provider_ready' | 'not_configured' | 'degraded';

export interface CreativeMonitorRecord {
  id: string;
  orgId: string;
  projectId: string;
  type: CreativeMonitorType;
  platform: string;
  target: string;
  category?: string;
  cadenceHours: number;
  status: CreativeMonitorStatus;
  lastCheckedAt?: string;
  nextCheckAt: string;
  lastImportedInsightId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreativeCollectionTask {
  id: string;
  monitorId: string;
  projectId: string;
  ownerRole: 'creative-ops';
  status: 'due';
  platform: string;
  target: string;
  type: CreativeMonitorType;
  cadenceHours: number;
  dueAt: string;
  instruction: string;
  acceptance: string;
  collectorQuery: string;
  sourceHint: string;
  evidenceSchema: string[];
  resultEndpoint: '/api/creative-monitoring';
  brandLearningAction: 'auto_materialize_after_import';
}

export interface CreativeHarvestObservation {
  sourceId?: string;
  monitorId?: string;
  type?: CreativeMonitorType;
  platform?: string;
  target?: string;
  title: string;
  url?: string;
  observedAt?: string;
  hookType?: CreativeHookType;
  pacing?: CreativePacing;
  reusableAngle?: string;
  proofPoint?: string;
  cta?: string;
  visualPattern?: string;
  rank?: number;
  durationSeconds?: number;
  sceneBeats?: string[];
  transcriptSummary?: string;
  detectedObjects?: string[];
  audioCue?: string;
  textOverlays?: string[];
  metrics?: CreativeInsightRecord['metrics'];
  riskNotes?: string[];
  teardown?: CreativeInsightRecord['teardown'];
}

export interface CreativeCollectorTarget {
  id: string;
  monitorId: string;
  projectId: string;
  type: CreativeMonitorType;
  priority: 'high' | 'medium' | 'low';
  attempt: number;
  platform: string;
  target: string;
  cadenceHours: number;
  dueAt: string;
  deadlineAt: string;
  collectorQuery: string;
  sourceHint: string;
  evidenceSchema: string[];
  outputAction: 'ingest-collector-run';
  resultEndpoint: '/api/creative-monitoring';
  complianceNotes: string[];
}

export interface CreativeCollectorRunPlan {
  orgId: string;
  projectId: string;
  generatedAt: string;
  adapterStatus: CreativeCollectorAdapterView;
  dispatchMode: CreativeCollectorAdapterMode;
  providerReady: boolean;
  targetCount: number;
  highPriorityCount: number;
  retryTargetCount: number;
  targets: CreativeCollectorTarget[];
  batchInstructions: string[];
}

export interface CreativeCollectorProviderExecution {
  id: string;
  orgId: string;
  projectId: string;
  status: 'completed' | 'blocked' | 'failed';
  providerName: string;
  targetCount: number;
  observationCount: number;
  harvestRunId?: string;
  importedInsightIds: string[];
  brandLearningAssetIds: string[];
  brandLearningDistributionPlanId?: string;
  blockedReasons: string[];
  executedAt: string;
}

export interface CreativeCollectorAdapterRecord {
  id: string;
  orgId: string;
  projectId: string;
  providerName: string;
  mode: CreativeCollectorAdapterMode;
  endpointConfigured: boolean;
  authConfigured: boolean;
  supportedMonitorTypes: CreativeMonitorType[];
  status: CreativeCollectorAdapterStatus;
  lastHeartbeatAt?: string;
  lastRunAt?: string;
  failureCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreativeCollectorAdapterView {
  status: CreativeCollectorAdapterStatus;
  mode: CreativeCollectorAdapterMode;
  providerName: string;
  endpointConfigured: boolean;
  authConfigured: boolean;
  supportedMonitorTypes: CreativeMonitorType[];
  providerReady: boolean;
  missingLinks: string[];
  nextActions: string[];
  lastHeartbeatAt?: string;
  lastRunAt?: string;
  failureCount: number;
}

export interface CreativeSourceRecord {
  id: string;
  orgId: string;
  projectId: string;
  kind: CreativeSourceKind;
  platform: string;
  providerName: string;
  status: CreativeSourceStatus;
  endpointConfigured: boolean;
  authConfigured: boolean;
  coverageTarget: string;
  lastSyncAt?: string;
  lastObservationAt?: string;
  lastObservationCount: number;
  totalObservationCount: number;
  failureCount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreativeSourceSnapshot {
  sourceCount: number;
  providerReadySourceCount: number;
  manualReadySourceCount: number;
  accountTrackingSourceReady: boolean;
  trendRankSourceReady: boolean;
  videoTeardownSourceReady: boolean;
  accountTrackingCoverageTargetCount: number;
  trendRankCoverageSignalCount: number;
  videoTeardownRepeatReady: boolean;
  totalObservationCount: number;
  accountTrackingObservationCount: number;
  trendRankObservationCount: number;
  videoTeardownObservationCount: number;
  observedSourceCount: number;
  repeatObservationSourceCount: number;
  sourceScaleScore: number;
  sourceDepthScore: number;
  degradedSourceCount: number;
  sourceHealthCards: CreativeSourceHealthCard[];
  readySourceHealthCardCount: number;
  missingLinks: string[];
  nextActions: string[];
}

export interface CreativeSourceHealthCard {
  kind: CreativeSourceKind;
  label: string;
  readiness: 'ready' | 'needs_provider' | 'needs_coverage' | 'needs_fresh_observation' | 'needs_repeat_evidence';
  configuredSourceCount: number;
  providerReadySourceCount: number;
  freshSourceCount: number;
  coverageTargetCount: number;
  observationCount: number;
  repeatSourceCount: number;
  depthScore: number;
  missingEvidence: string[];
  nextAction: string;
  acceptance: string;
}

export interface CreativeSourceSyncTarget {
  id: string;
  sourceId: string;
  projectId: string;
  kind: CreativeSourceKind;
  platform: string;
  providerName: string;
  coverageTarget: string;
  priority: 'high' | 'medium' | 'low';
  requiredObservationType: CreativeMonitorType;
  evidenceSchema: string[];
  syncCadenceHours: number;
  lastSyncAt?: string;
  lastSyncAgeHours?: number;
  stale: boolean;
  collectorQuery: string;
  providerRequest: {
    action: 'creative-source-sync';
    sourceId: string;
    sourceKind: CreativeSourceKind;
    platform: string;
    coverageTarget: string;
    requiredObservationType: CreativeMonitorType;
    resultEndpoint: '/api/creative-monitoring';
  };
  acceptance: string;
}

export interface CreativeSourceSyncPlan {
  orgId: string;
  projectId: string;
  generatedAt: string;
  sourceCount: number;
  providerReadySourceCount: number;
  dueSourceCount: number;
  staleSourceCount: number;
  targets: CreativeSourceSyncTarget[];
  missingLinks: string[];
  nextActions: string[];
}

export interface CreativeSourceProviderSyncExecution {
  id: string;
  orgId: string;
  projectId: string;
  status: 'completed' | 'blocked' | 'failed';
  providerName: string;
  targetCount: number;
  observationCount: number;
  sourceSyncRunId?: string;
  importedInsightIds: string[];
  blockedReasons: string[];
  executedAt: string;
}

export interface CreativeHarvestRun {
  id: string;
  orgId: string;
  projectId: string;
  dueTaskCount: number;
  observationCount: number;
  importedInsightIds: string[];
  brandLearningAssetIds: string[];
  brandLearningDistributionPlanId?: string;
  missingObservationMonitorIds: string[];
  blockedReasons: string[];
  ranAt: string;
}

export interface CreativeSourceSyncRun {
  id: string;
  orgId: string;
  projectId: string;
  sourceCount: number;
  providerReadySourceCount: number;
  syncedSourceIds: string[];
  failedSourceIds: string[];
  observationCount: number;
  accountObservationCount: number;
  trendRankObservationCount: number;
  videoTeardownObservationCount: number;
  multimodalParsedObservationCount: number;
  coverageKindCount: number;
  importedInsightIds: string[];
  harvestRunId?: string;
  blockedReasons: string[];
  status: 'completed' | 'partial' | 'blocked';
  ranAt: string;
}

export interface CreativeMonitoringSnapshot {
  orgId: string;
  projectId: string;
  monitorCount: number;
  activeMonitorCount: number;
  competitorAccountMonitorCount: number;
  trendRankMonitorCount: number;
  videoKeywordMonitorCount: number;
  dueTaskCount: number;
  importedInsightCount: number;
  harvestRunCount: number;
  harvestedInsightCount: number;
  collectorTargetCount: number;
  collectorAdapterStatus: CreativeCollectorAdapterStatus;
  collectorProviderReady: boolean;
  sourceCount: number;
  providerReadySourceCount: number;
  sourceSyncRunCount: number;
  providerSourceFreshCount: number;
  providerSourceFailureCount: number;
  sourceSyncAccountObservationCount: number;
  sourceSyncTrendRankObservationCount: number;
  sourceSyncVideoTeardownObservationCount: number;
  sourceSyncMultimodalParsedCount: number;
  sourceSyncCoverageScore: number;
  creativeSourceObservationCount: number;
  creativeSourceRepeatObservationSourceCount: number;
  creativeSourceScaleScore: number;
  creativeSourceDepthScore: number;
  creativeSourceHealthCards?: CreativeSourceHealthCard[];
  creativeReadySourceHealthCardCount?: number;
  accountTrackingCoverageTargetCount: number;
  trendRankCoverageSignalCount: number;
  videoTeardownRepeatReady: boolean;
  accountTrackingSourceReady: boolean;
  trendRankSourceReady: boolean;
  videoTeardownSourceReady: boolean;
  multimodalTeardownReady: boolean;
  lastHarvestAt?: string;
  lastSourceSyncAt?: string;
  missingLinks: string[];
  nextActions: string[];
}

export interface CreativeMonitoringBootstrapResult {
  projectId: string;
  category: string;
  monitors: CreativeMonitorRecord[];
  dueTasks: CreativeCollectionTask[];
  snapshot: CreativeMonitoringSnapshot;
}

type MonitoringGlobal = typeof globalThis & {
  __wenaiCreativeMonitors?: Map<string, CreativeMonitorRecord>;
  __wenaiCreativeMonitorLists?: Map<string, string[]>;
  __wenaiCreativeHarvestRuns?: Map<string, CreativeHarvestRun>;
  __wenaiCreativeHarvestRunLists?: Map<string, string[]>;
  __wenaiCreativeCollectorAdapters?: Map<string, CreativeCollectorAdapterRecord>;
  __wenaiCreativeSources?: Map<string, CreativeSourceRecord>;
  __wenaiCreativeSourceLists?: Map<string, string[]>;
  __wenaiCreativeSourceSyncRuns?: Map<string, CreativeSourceSyncRun>;
  __wenaiCreativeSourceSyncRunLists?: Map<string, string[]>;
};

function stores() {
  const target = globalThis as MonitoringGlobal;
  if (!target.__wenaiCreativeMonitors) target.__wenaiCreativeMonitors = new Map();
  if (!target.__wenaiCreativeMonitorLists) target.__wenaiCreativeMonitorLists = new Map();
  if (!target.__wenaiCreativeHarvestRuns) target.__wenaiCreativeHarvestRuns = new Map();
  if (!target.__wenaiCreativeHarvestRunLists) target.__wenaiCreativeHarvestRunLists = new Map();
  if (!target.__wenaiCreativeCollectorAdapters) target.__wenaiCreativeCollectorAdapters = new Map();
  if (!target.__wenaiCreativeSources) target.__wenaiCreativeSources = new Map();
  if (!target.__wenaiCreativeSourceLists) target.__wenaiCreativeSourceLists = new Map();
  if (!target.__wenaiCreativeSourceSyncRuns) target.__wenaiCreativeSourceSyncRuns = new Map();
  if (!target.__wenaiCreativeSourceSyncRunLists) target.__wenaiCreativeSourceSyncRunLists = new Map();
  return {
    monitors: target.__wenaiCreativeMonitors,
    lists: target.__wenaiCreativeMonitorLists,
    harvestRuns: target.__wenaiCreativeHarvestRuns,
    harvestLists: target.__wenaiCreativeHarvestRunLists,
    collectorAdapters: target.__wenaiCreativeCollectorAdapters,
    sources: target.__wenaiCreativeSources,
    sourceLists: target.__wenaiCreativeSourceLists,
    sourceSyncRuns: target.__wenaiCreativeSourceSyncRuns,
    sourceSyncLists: target.__wenaiCreativeSourceSyncRunLists,
  };
}

function cleanString(value: unknown, fallback: string, limit = 200) {
  return (typeof value === 'string' ? value : fallback).trim().slice(0, limit) || fallback;
}

function cleanOptionalString(value: unknown, limit = 500) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, limit) : undefined;
}

function cleanList(value: unknown, limit = 12) {
  if (!Array.isArray(value)) return [];
  return value.map(item => String(item).trim()).filter(Boolean).slice(0, limit);
}

function normalizeType(value: unknown): CreativeMonitorType {
  const allowed: CreativeMonitorType[] = ['competitor_account', 'trend_rank', 'video_keyword'];
  return allowed.includes(value as CreativeMonitorType) ? value as CreativeMonitorType : 'competitor_account';
}

function normalizeStatus(value: unknown): CreativeMonitorStatus {
  return value === 'paused' ? 'paused' : 'active';
}

function normalizeAdapterMode(value: unknown): CreativeCollectorAdapterMode {
  return value === 'provider' ? 'provider' : 'manual_ops';
}

function normalizeMonitorTypes(value: unknown): CreativeMonitorType[] {
  const allowed: CreativeMonitorType[] = ['competitor_account', 'trend_rank', 'video_keyword'];
  if (!Array.isArray(value)) return allowed;
  const list = value.filter(item => allowed.includes(item as CreativeMonitorType)) as CreativeMonitorType[];
  return list.length ? Array.from(new Set(list)) : allowed;
}

function normalizeSourceKind(value: unknown): CreativeSourceKind {
  const allowed: CreativeSourceKind[] = ['account_tracking', 'trend_rank', 'video_teardown'];
  return allowed.includes(value as CreativeSourceKind) ? value as CreativeSourceKind : 'account_tracking';
}

function normalizeSourceStatus(value: unknown, input: {
  endpointConfigured: boolean;
  authConfigured: boolean;
  failureCount?: number;
}): CreativeSourceStatus {
  if ((input.failureCount || 0) >= 3) return 'degraded';
  if (input.endpointConfigured && input.authConfigured) return 'provider_ready';
  if (value === 'manual_ready') return 'manual_ready';
  return 'not_configured';
}

function computeAdapterStatus(input: {
  mode: CreativeCollectorAdapterMode;
  endpointConfigured: boolean;
  authConfigured: boolean;
  supportedMonitorTypes: CreativeMonitorType[];
  failureCount?: number;
}): CreativeCollectorAdapterStatus {
  if (input.mode === 'manual_ops') return 'manual_ops';
  if (!input.endpointConfigured || !input.authConfigured || input.supportedMonitorTypes.length === 0) return 'not_configured';
  if ((input.failureCount || 0) >= 3) return 'degraded';
  return 'provider_ready';
}

function nextCheck(cadenceHours: number, from = new Date()) {
  const date = new Date(from);
  date.setHours(date.getHours() + cadenceHours);
  return date.toISOString();
}

function cadence(value: unknown) {
  const hours = Number(value);
  return Number.isFinite(hours) && hours >= 1 ? Math.min(Math.floor(hours), 24 * 30) : 24;
}

function sourceFor(type: CreativeMonitorType): CreativeInsightSource {
  if (type === 'trend_rank') return 'trend-rank';
  if (type === 'video_keyword') return 'video-teardown';
  return 'competitor-account';
}

function sourceKindForMonitorType(type: CreativeMonitorType): CreativeSourceKind {
  if (type === 'trend_rank') return 'trend_rank';
  if (type === 'video_keyword') return 'video_teardown';
  return 'account_tracking';
}

function monitorTypeForSourceKind(kind: CreativeSourceKind): CreativeMonitorType {
  if (kind === 'trend_rank') return 'trend_rank';
  if (kind === 'video_teardown') return 'video_keyword';
  return 'competitor_account';
}

function hasMultimodalTeardownEvidence(observation: CreativeHarvestObservation) {
  return Boolean(
    observation.teardown ||
    cleanList(observation.sceneBeats, 12).length > 0 ||
    cleanOptionalString(observation.transcriptSummary, 1000) ||
    cleanList(observation.detectedObjects, 12).length > 0 ||
    cleanList(observation.textOverlays, 12).length > 0 ||
    cleanOptionalString(observation.audioCue, 300),
  );
}

function normalizedComparable(value: unknown) {
  return cleanString(value, '', 240).toLowerCase().replace(/\s+/g, ' ').trim();
}

function coverageTargets(value: string) {
  const normalized = value
    .replace(/\band\b/gi, ',')
    .replace(/[;|/]+/g, ',')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
  return normalized.length ? Array.from(new Set(normalized.map(item => item.toLowerCase()))) : [];
}

function trendRankSignals(value: string) {
  const target = normalizedComparable(value);
  return [
    target.includes('rank') || target.includes('榜') ? 'rank' : '',
    target.includes('top') || target.includes('hot') || target.includes('热门') ? 'top' : '',
    target.includes('trend') || target.includes('趋势') ? 'trend' : '',
    target.includes('ad') || target.includes('ads') || target.includes('广告') || target.includes('library') ? 'ad-library' : '',
    target.includes('seller') || target.includes('sales') || target.includes('热卖') ? 'seller-feed' : '',
    target.includes('feed') || target.includes('list') || target.includes('榜单') ? 'feed' : '',
  ].filter(Boolean);
}

function sourceKindLabel(kind: CreativeSourceKind) {
  if (kind === 'account_tracking') return 'competitor account tracking';
  if (kind === 'trend_rank') return 'trend/rank/ad-library feed';
  return 'multimodal video teardown';
}

function sourceCoverageCount(kind: CreativeSourceKind, sources: CreativeSourceRecord[]) {
  if (kind === 'account_tracking') {
    return new Set(sources.flatMap(source => coverageTargets(source.coverageTarget))).size;
  }
  if (kind === 'trend_rank') {
    return new Set(sources.flatMap(source => trendRankSignals(source.coverageTarget))).size;
  }
  return sources.length;
}

function sourceCoverageTarget(kind: CreativeSourceKind) {
  if (kind === 'account_tracking') return 3;
  if (kind === 'trend_rank') return 3;
  return 1;
}

function buildCreativeSourceHealthCards(sources: CreativeSourceRecord[], now: Date): CreativeSourceHealthCard[] {
  return (['account_tracking', 'trend_rank', 'video_teardown'] as CreativeSourceKind[]).map(kind => {
    const kindSources = sources.filter(source => source.kind === kind);
    const providerReadySources = kindSources.filter(source => source.status === 'provider_ready');
    const freshSourceCount = providerReadySources.filter(source => isSourceFresh(source, now)).length;
    const coverageTargetCount = sourceCoverageCount(kind, providerReadySources);
    const observationCount = kindSources.reduce((sum, source) => sum + source.totalObservationCount, 0);
    const repeatSourceCount = kindSources.filter(source => source.totalObservationCount >= 2).length;
    const targetCoverage = sourceCoverageTarget(kind);
    const repeatReady = kind === 'video_teardown' ? repeatSourceCount > 0 : repeatSourceCount > 0 || observationCount >= 2;
    const missingEvidence = [
      providerReadySources.length === 0 ? 'provider_ready_source' : '',
      coverageTargetCount < targetCoverage ? 'coverage_depth' : '',
      providerReadySources.length > 0 && freshSourceCount === 0 ? 'fresh_sync_observation' : '',
      providerReadySources.length > 0 && !repeatReady ? 'repeat_evidence' : '',
    ].filter(Boolean);
    const readiness: CreativeSourceHealthCard['readiness'] = providerReadySources.length === 0
      ? 'needs_provider'
      : coverageTargetCount < targetCoverage
        ? 'needs_coverage'
        : freshSourceCount === 0
          ? 'needs_fresh_observation'
          : !repeatReady
            ? 'needs_repeat_evidence'
            : 'ready';
    const depthScore = Math.min(100, Math.round(
      (providerReadySources.length > 0 ? 25 : 0) +
      (Math.min(coverageTargetCount, targetCoverage) / targetCoverage) * 25 +
      (freshSourceCount > 0 ? 20 : 0) +
      (Math.min(observationCount, 2) / 2) * 20 +
      (repeatReady ? 10 : 0),
    ));
    return {
      kind,
      label: sourceKindLabel(kind),
      readiness,
      configuredSourceCount: kindSources.length,
      providerReadySourceCount: providerReadySources.length,
      freshSourceCount,
      coverageTargetCount,
      observationCount,
      repeatSourceCount,
      depthScore,
      missingEvidence,
      nextAction: readiness === 'ready'
        ? `Keep ${sourceKindLabel(kind)} on schedule and route winning evidence into brand learning.`
        : `Close ${sourceKindLabel(kind)} gap: ${missingEvidence.join(', ')}`,
      acceptance: readiness === 'ready'
        ? 'Provider-ready source has fresh, repeatable evidence that can feed opportunity backlog.'
        : 'Provider-ready source, coverage depth, fresh sync observation, and repeat evidence are all present.',
    };
  });
}

function observationMatchesCreativeSource(observation: CreativeHarvestObservation, source: CreativeSourceRecord) {
  if (sourceKindForMonitorType(normalizeType(observation.type)) !== source.kind) return false;
  if (observation.platform && observation.platform !== source.platform) return false;
  if (observation.sourceId) return observation.sourceId === source.id;
  const observationTarget = normalizedComparable(observation.target);
  const coverageTarget = normalizedComparable(source.coverageTarget);
  if (!observationTarget || !coverageTarget) return false;
  const coverageParts = coverageTarget.split(',').map(item => item.trim()).filter(Boolean);
  return observationTarget === coverageTarget
    || coverageParts.includes(observationTarget)
    || observationTarget.includes(coverageTarget)
    || coverageTarget.includes(observationTarget);
}

function sourceSyncCadenceHours(kind: CreativeSourceKind) {
  if (kind === 'video_teardown') return 72;
  return 24;
}

function sourceLastSyncAgeHours(source: CreativeSourceRecord, now: Date) {
  if (!source.lastSyncAt) return undefined;
  const syncedAt = Date.parse(source.lastSyncAt);
  if (!Number.isFinite(syncedAt)) return undefined;
  return Math.max(0, Math.round(((now.getTime() - syncedAt) / 36e5) * 10) / 10);
}

function isSourceFresh(source: CreativeSourceRecord, now: Date, syncedInLatestRun = false) {
  if (syncedInLatestRun) return true;
  const age = sourceLastSyncAgeHours(source, now);
  return typeof age === 'number' && age <= sourceSyncCadenceHours(source.kind);
}

function genRunId() {
  return `chr_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function genSourceSyncRunId() {
  return `css_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function genProviderSyncExecutionId() {
  return `cpe_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function observationFingerprint(monitor: CreativeMonitorRecord, input: CreativeHarvestObservation) {
  return [
    monitor.platform,
    monitor.type,
    monitor.target,
    input.url || input.title,
    input.observedAt || '',
  ].join('|').toLowerCase().replace(/\s+/g, ' ').slice(0, 240);
}

function normalizeTeardown(input: CreativeHarvestObservation, monitor: CreativeMonitorRecord): CreativeInsightRecord['teardown'] | undefined {
  if (input.teardown) {
    return {
      openingHook: cleanOptionalString(input.teardown.openingHook, 500),
      sceneBeats: cleanList(input.teardown.sceneBeats, 12),
      proofMoment: cleanOptionalString(input.teardown.proofMoment, 500),
      productMoment: cleanOptionalString(input.teardown.productMoment, 500),
      ctaMoment: cleanOptionalString(input.teardown.ctaMoment, 500),
      visualRhythm: cleanOptionalString(input.teardown.visualRhythm, 300),
      audioCue: cleanOptionalString(input.teardown.audioCue, 300),
      textOverlays: cleanList(input.teardown.textOverlays, 12),
      complianceNotes: cleanList(input.teardown.complianceNotes, 8),
    };
  }
  if (monitor.type !== 'video_keyword') return undefined;
  const sceneBeats = cleanList(input.sceneBeats, 12);
  const textOverlays = cleanList(input.textOverlays, 12);
  const detectedObjects = cleanList(input.detectedObjects, 12);
  return {
    openingHook: input.transcriptSummary || input.proofPoint || input.title,
    sceneBeats: sceneBeats.length ? sceneBeats : [
      input.visualPattern || `Open with ${monitor.target} problem framing.`,
      input.proofPoint || 'Show the proof moment or result claim with visible evidence.',
      input.cta || 'Close with platform-native next action.',
    ],
    proofMoment: input.proofPoint,
    productMoment: input.visualPattern || (detectedObjects.length ? `Detected product/context objects: ${detectedObjects.join(', ')}` : undefined),
    ctaMoment: input.cta,
    visualRhythm: input.pacing === 'fast' ? 'fast cuts with early proof' : input.pacing === 'slow' ? 'slow demonstration with longer product hold' : undefined,
    audioCue: input.audioCue,
    textOverlays,
    complianceNotes: cleanList(input.riskNotes, 8),
  };
}

function taskInstruction(record: CreativeMonitorRecord) {
  if (record.type === 'trend_rank') {
    return `Collect top ranked videos for ${record.target} on ${record.platform}, extract hook, pacing, proof point, CTA, and metrics.`;
  }
  if (record.type === 'video_keyword') {
    return `Search ${record.platform} for ${record.target}, select a representative viral video, and import a teardown signal.`;
  }
  return `Review competitor account ${record.target} on ${record.platform}, import the strongest recent creative signal without copying protected expression.`;
}

function collectorQuery(record: CreativeMonitorRecord) {
  if (record.type === 'trend_rank') return `${record.platform} ranking:${record.target}`;
  if (record.type === 'video_keyword') return `${record.platform} video keyword:${record.target}`;
  return `${record.platform} account:${record.target}`;
}

function sourceHint(record: CreativeMonitorRecord) {
  if (record.type === 'trend_rank') return '平台榜单、类目热卖榜、公开趋势页或已授权数据导出。';
  if (record.type === 'video_keyword') return '公开短视频链接、授权素材库或人工确认可解析的视频样本。';
  return '公开竞品账号主页、已授权账号监控导出或人工确认的账号观察记录。';
}

function evidenceSchema(record: CreativeMonitorRecord) {
  const common = ['title', 'url', 'observedAt', 'hookType', 'pacing', 'reusableAngle', 'metrics'];
  if (record.type === 'video_keyword') {
    return [...common, 'durationSeconds', 'sceneBeats', 'transcriptSummary', 'detectedObjects', 'audioCue', 'textOverlays'];
  }
  if (record.type === 'trend_rank') return [...common, 'rank', 'proofPoint'];
  return [...common, 'account', 'proofPoint', 'visualPattern'];
}

function harvestAttemptsForMonitor(runs: CreativeHarvestRun[], monitorId: string) {
  return runs.filter(run =>
    run.missingObservationMonitorIds.includes(monitorId) ||
    run.blockedReasons.some(reason => reason.includes(monitorId)),
  ).length;
}

function deadlineForTask(task: CreativeCollectionTask, attempt: number) {
  const due = Date.parse(task.dueAt);
  const date = new Date(Number.isFinite(due) ? due : Date.now());
  date.setHours(date.getHours() + Math.max(2, Math.min(task.cadenceHours, 24)) + attempt * 2);
  return date.toISOString();
}

function priorityForTask(task: CreativeCollectionTask, attempt: number): CreativeCollectorTarget['priority'] {
  if (task.type === 'video_keyword' || attempt >= 2) return 'high';
  if (task.type === 'trend_rank' || attempt === 1) return 'medium';
  return 'low';
}

export async function upsertCreativeMonitor(
  orgId: string,
  input: Partial<CreativeMonitorRecord>,
): Promise<CreativeMonitorRecord> {
  const store = stores();
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const type = normalizeType(input.type);
  const platform = cleanString(input.platform, 'TikTok Shop', 80);
  const target = cleanString(input.target, type === 'competitor_account' ? 'competitor_account' : 'category_rank', 160);
  const id = input.id || `${projectId}:${type}:${platform}:${target}`.replace(/[^a-zA-Z0-9:_-]/g, '_').slice(0, 240);
  const existing = store.monitors.get(`${orgId}:${id}`);
  const now = new Date().toISOString();
  const cadenceHours = cadence(input.cadenceHours ?? existing?.cadenceHours);
  const record: CreativeMonitorRecord = {
    id,
    orgId,
    projectId,
    type,
    platform,
    target,
    category: cleanOptionalString(input.category ?? existing?.category, 120),
    cadenceHours,
    status: normalizeStatus(input.status ?? existing?.status),
    lastCheckedAt: cleanOptionalString(input.lastCheckedAt ?? existing?.lastCheckedAt, 80),
    nextCheckAt: cleanOptionalString(input.nextCheckAt ?? existing?.nextCheckAt, 80) || nextCheck(cadenceHours),
    lastImportedInsightId: cleanOptionalString(input.lastImportedInsightId ?? existing?.lastImportedInsightId, 160),
    notes: cleanOptionalString(input.notes ?? existing?.notes, 500),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  store.monitors.set(`${orgId}:${id}`, record);
  const listKey = `${orgId}:${projectId}`;
  const list = store.lists.get(listKey) || [];
  store.lists.set(listKey, [id, ...list.filter(item => item !== id)].slice(0, 500));
  return record;
}

export async function listCreativeMonitors(orgId: string, projectId = 'default-project', limit = 100): Promise<CreativeMonitorRecord[]> {
  const store = stores();
  const ids = store.lists.get(`${orgId}:${projectId}`) || [];
  return ids.slice(0, limit).map(id => store.monitors.get(`${orgId}:${id}`)).filter(Boolean) as CreativeMonitorRecord[];
}

export async function listCreativeMonitoringProjects(orgId: string, limit = 50): Promise<string[]> {
  const store = stores();
  const prefix = `${orgId}:`;
  const projectIds = new Set<string>();
  for (const key of store.lists.keys()) {
    if (!key.startsWith(prefix)) continue;
    const projectId = key.slice(prefix.length);
    if (projectId) projectIds.add(projectId);
    if (projectIds.size >= limit) break;
  }
  for (const monitor of store.monitors.values()) {
    if (monitor.orgId !== orgId) continue;
    if (monitor.projectId) projectIds.add(monitor.projectId);
    if (projectIds.size >= limit) break;
  }
  return Array.from(projectIds);
}

export async function upsertCreativeCollectorAdapter(
  orgId: string,
  input: Partial<CreativeCollectorAdapterRecord>,
): Promise<CreativeCollectorAdapterRecord> {
  const store = stores();
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const id = input.id || `${projectId}:creative-collector-adapter`;
  const existing = store.collectorAdapters.get(`${orgId}:${id}`);
  const now = new Date().toISOString();
  const mode = normalizeAdapterMode(input.mode ?? existing?.mode);
  const endpointConfigured = Boolean(input.endpointConfigured ?? existing?.endpointConfigured);
  const authConfigured = Boolean(input.authConfigured ?? existing?.authConfigured);
  const supportedMonitorTypes = normalizeMonitorTypes(input.supportedMonitorTypes ?? existing?.supportedMonitorTypes);
  const failureCount = Math.max(0, Math.floor(Number(input.failureCount ?? existing?.failureCount ?? 0)));
  const record: CreativeCollectorAdapterRecord = {
    id,
    orgId,
    projectId,
    providerName: cleanString(input.providerName ?? existing?.providerName, mode === 'provider' ? 'external-collector' : 'manual-creative-ops', 80),
    mode,
    endpointConfigured,
    authConfigured,
    supportedMonitorTypes,
    status: computeAdapterStatus({ mode, endpointConfigured, authConfigured, supportedMonitorTypes, failureCount }),
    lastHeartbeatAt: cleanOptionalString(input.lastHeartbeatAt ?? existing?.lastHeartbeatAt, 80),
    lastRunAt: cleanOptionalString(input.lastRunAt ?? existing?.lastRunAt, 80),
    failureCount,
    notes: cleanOptionalString(input.notes ?? existing?.notes, 500),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  store.collectorAdapters.set(`${orgId}:${id}`, record);
  return record;
}

export async function getCreativeCollectorAdapterView(orgId: string, projectId = 'default-project'): Promise<CreativeCollectorAdapterView> {
  const store = stores();
  const existing = store.collectorAdapters.get(`${orgId}:${projectId}:creative-collector-adapter`);
  const record = existing || await upsertCreativeCollectorAdapter(orgId, {
    projectId,
    mode: 'manual_ops',
    providerName: 'manual-creative-ops',
    supportedMonitorTypes: ['competitor_account', 'trend_rank', 'video_keyword'],
    notes: 'Manual collector mode keeps the monitoring loop usable before external OAuth and collector credentials are configured.',
  });
  const providerReady = record.status === 'provider_ready';
  const missingLinks = [
    record.mode === 'manual_ops' ? 'Collector is still in manual-ops mode' : '',
    record.mode === 'provider' && !record.endpointConfigured ? 'Missing collector provider endpoint' : '',
    record.mode === 'provider' && !record.authConfigured ? 'Missing collector provider auth' : '',
    record.mode === 'provider' && record.supportedMonitorTypes.length === 0 ? 'Missing supported monitor type mapping' : '',
    record.status === 'degraded' ? 'Collector provider has repeated failures' : '',
  ].filter(Boolean);
  return {
    status: record.status,
    mode: record.mode,
    providerName: record.providerName,
    endpointConfigured: record.endpointConfigured,
    authConfigured: record.authConfigured,
    supportedMonitorTypes: record.supportedMonitorTypes,
    providerReady,
    missingLinks,
    nextActions: missingLinks.map(item => `Close collector adapter gap: ${item}`),
    lastHeartbeatAt: record.lastHeartbeatAt,
    lastRunAt: record.lastRunAt,
    failureCount: record.failureCount,
  };
}

export async function upsertCreativeSource(
  orgId: string,
  input: Partial<CreativeSourceRecord>,
): Promise<CreativeSourceRecord> {
  const store = stores();
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const kind = normalizeSourceKind(input.kind);
  const platform = cleanString(input.platform, 'TikTok Shop', 80);
  const coverageTarget = cleanString(input.coverageTarget, kind === 'account_tracking' ? 'competitor accounts' : kind === 'trend_rank' ? 'category rank feeds' : 'short video teardown samples', 180);
  const sourceKey = `${kind}:${platform}:${coverageTarget}`.replace(/[^a-zA-Z0-9:_@.-]/g, '_').slice(0, 180);
  const id = input.id || `${projectId}:creative-source:${sourceKey}`.replace(/[^a-zA-Z0-9:_@.-]/g, '_').slice(0, 240);
  const existing = store.sources.get(`${orgId}:${id}`);
  const now = new Date().toISOString();
  const endpointConfigured = Boolean(input.endpointConfigured ?? existing?.endpointConfigured);
  const authConfigured = Boolean(input.authConfigured ?? existing?.authConfigured);
  const failureCount = Math.max(0, Math.floor(Number(input.failureCount ?? existing?.failureCount ?? 0)));
  const record: CreativeSourceRecord = {
    id,
    orgId,
    projectId,
    kind,
    platform,
    providerName: cleanString(input.providerName ?? existing?.providerName, kind === 'video_teardown' ? 'multimodal-video-parser' : 'platform-creative-source', 100),
    status: normalizeSourceStatus(input.status ?? existing?.status, { endpointConfigured, authConfigured, failureCount }),
    endpointConfigured,
    authConfigured,
    coverageTarget: cleanString(input.coverageTarget ?? existing?.coverageTarget, coverageTarget, 180),
    lastSyncAt: cleanOptionalString(input.lastSyncAt ?? existing?.lastSyncAt, 80),
    lastObservationAt: cleanOptionalString(input.lastObservationAt ?? existing?.lastObservationAt, 80),
    lastObservationCount: Math.max(0, Math.floor(Number(input.lastObservationCount ?? existing?.lastObservationCount ?? 0))),
    totalObservationCount: Math.max(0, Math.floor(Number(input.totalObservationCount ?? existing?.totalObservationCount ?? 0))),
    failureCount,
    notes: cleanOptionalString(input.notes ?? existing?.notes, 500),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };
  store.sources.set(`${orgId}:${id}`, record);
  const listKey = `${orgId}:${projectId}`;
  const list = store.sourceLists.get(listKey) || [];
  store.sourceLists.set(listKey, [id, ...list.filter(item => item !== id)].slice(0, 100));
  return record;
}

export async function listCreativeSources(orgId: string, projectId = 'default-project', limit = 100): Promise<CreativeSourceRecord[]> {
  const store = stores();
  const ids = store.sourceLists.get(`${orgId}:${projectId}`) || [];
  return ids.slice(0, limit).map(id => store.sources.get(`${orgId}:${id}`)).filter(Boolean) as CreativeSourceRecord[];
}

export async function getCreativeSourceSnapshot(orgId: string, projectId = 'default-project'): Promise<CreativeSourceSnapshot> {
  const sources = await listCreativeSources(orgId, projectId, 100);
  const now = new Date();
  const providerReady = sources.filter(item => item.status === 'provider_ready');
  const manualReady = sources.filter(item => item.status === 'manual_ready');
  const degraded = sources.filter(item => item.status === 'degraded');
  const accountSources = providerReady.filter(item => item.kind === 'account_tracking');
  const trendSources = providerReady.filter(item => item.kind === 'trend_rank');
  const videoSources = providerReady.filter(item => item.kind === 'video_teardown');
  const hasProviderKind = (kind: CreativeSourceKind) => providerReady.some(item => item.kind === kind);
  const accountTrackingSourceReady = hasProviderKind('account_tracking');
  const trendRankSourceReady = hasProviderKind('trend_rank');
  const videoTeardownSourceReady = hasProviderKind('video_teardown');
  const accountTrackingCoverageTargetCount = new Set(
    accountSources.flatMap(source => coverageTargets(source.coverageTarget)),
  ).size;
  const trendRankCoverageSignalCount = new Set(
    trendSources.flatMap(source => {
      const target = normalizedComparable(source.coverageTarget);
      return [
        target.includes('rank') || target.includes('榜') ? 'rank' : '',
        target.includes('top') || target.includes('hot') || target.includes('热门') ? 'top' : '',
        target.includes('trend') || target.includes('趋势') ? 'trend' : '',
        target.includes('ad') || target.includes('ads') || target.includes('广告') || target.includes('library') ? 'ad-library' : '',
        target.includes('seller') || target.includes('sales') || target.includes('热卖') ? 'seller-feed' : '',
        target.includes('feed') || target.includes('list') || target.includes('榜单') ? 'feed' : '',
      ].filter(Boolean);
    }),
  ).size;
  const observationCountFor = (kind: CreativeSourceKind) => sources
    .filter(source => source.kind === kind)
    .reduce((sum, source) => sum + source.totalObservationCount, 0);
  const totalObservationCount = sources.reduce((sum, source) => sum + source.totalObservationCount, 0);
  const accountTrackingObservationCount = observationCountFor('account_tracking');
  const trendRankObservationCount = observationCountFor('trend_rank');
  const videoTeardownObservationCount = observationCountFor('video_teardown');
  const observedSourceCount = sources.filter(source => source.totalObservationCount > 0).length;
  const repeatObservationSourceCount = sources.filter(source => source.totalObservationCount >= 2).length;
  const videoTeardownRepeatReady = videoSources.some(source => source.totalObservationCount >= 2);
  const sourceScaleScore = Math.min(100, Math.round(
    (Math.min(totalObservationCount, 6) / 6) * 70 +
    (Math.min(repeatObservationSourceCount, 3) / 3) * 30,
  ));
  const sourceDepthScore = Math.min(100, Math.round(
    (Math.min(accountTrackingCoverageTargetCount, 3) / 3) * 30 +
    (Math.min(trendRankCoverageSignalCount, 3) / 3) * 25 +
    (videoTeardownRepeatReady ? 20 : 0) +
    sourceScaleScore * 0.25,
  ));
  const sourceHealthCards = buildCreativeSourceHealthCards(sources, now);
  const missingLinks = [
    sources.length === 0 ? 'Missing creative source registry' : '',
    !accountTrackingSourceReady ? 'Missing provider-ready account tracking source' : '',
    !trendRankSourceReady ? 'Missing provider-ready trend/rank source' : '',
    !videoTeardownSourceReady ? 'Missing provider-ready multimodal video teardown source' : '',
    accountTrackingSourceReady && accountTrackingCoverageTargetCount < 3 ? 'Account tracking source covers fewer than 3 competitor accounts' : '',
    trendRankSourceReady && trendRankCoverageSignalCount < 3 ? 'Trend/rank source lacks rank, trend, ad-library, or seller-feed breadth' : '',
    videoTeardownSourceReady && !videoTeardownRepeatReady ? 'Video teardown source lacks repeat parsed sample evidence' : '',
    providerReady.length >= 3 && totalObservationCount < 6 ? 'Creative source observation volume below repeatable threshold' : '',
    providerReady.length >= 3 && repeatObservationSourceCount < 3 ? 'Creative sources have not shown repeat observations across all core feeds' : '',
    providerReady.length >= 3 && sourceDepthScore < 90 ? 'Creative source depth score below commercial benchmark threshold' : '',
    degraded.length > 0 ? `Creative source degraded (${degraded.length})` : '',
  ].filter(Boolean);
  return {
    sourceCount: sources.length,
    providerReadySourceCount: providerReady.length,
    manualReadySourceCount: manualReady.length,
    accountTrackingSourceReady,
    trendRankSourceReady,
    videoTeardownSourceReady,
    accountTrackingCoverageTargetCount,
    trendRankCoverageSignalCount,
    videoTeardownRepeatReady,
    totalObservationCount,
    accountTrackingObservationCount,
    trendRankObservationCount,
    videoTeardownObservationCount,
    observedSourceCount,
    repeatObservationSourceCount,
    sourceScaleScore,
    sourceDepthScore,
    degradedSourceCount: degraded.length,
    sourceHealthCards,
    readySourceHealthCardCount: sourceHealthCards.filter(card => card.readiness === 'ready').length,
    missingLinks,
    nextActions: missingLinks.map(item => `Close creative source gap: ${item}`),
  };
}

export async function getCreativeSourceSyncPlan(orgId: string, projectId = 'default-project', now = new Date()): Promise<CreativeSourceSyncPlan> {
  const sources = await listCreativeSources(orgId, projectId, 100);
  const providerReady = sources.filter(item => item.status === 'provider_ready');
  const targets = providerReady.map(source => {
    const requiredObservationType = monitorTypeForSourceKind(source.kind);
    const syncCadenceHours = sourceSyncCadenceHours(source.kind);
    const lastSyncAgeHours = sourceLastSyncAgeHours(source, now);
    const stale = !isSourceFresh(source, now);
    const priority: CreativeSourceSyncTarget['priority'] = stale && source.kind === 'video_teardown'
      ? 'high'
      : stale
        ? 'medium'
        : 'low';
    return {
      id: `source_sync_${source.id}`.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 190),
      sourceId: source.id,
      projectId: source.projectId,
      kind: source.kind,
      platform: source.platform,
      providerName: source.providerName,
      coverageTarget: source.coverageTarget,
      priority,
      requiredObservationType,
      evidenceSchema: evidenceSchema({
        id: source.id,
        orgId: source.orgId,
        projectId: source.projectId,
        type: requiredObservationType,
        platform: source.platform,
        target: source.coverageTarget,
        cadenceHours: syncCadenceHours,
        status: 'active',
        nextCheckAt: now.toISOString(),
        createdAt: source.createdAt,
        updatedAt: source.updatedAt,
      }),
      syncCadenceHours,
      lastSyncAt: source.lastSyncAt,
      lastSyncAgeHours,
      stale,
      collectorQuery: collectorQuery({
        id: source.id,
        orgId: source.orgId,
        projectId: source.projectId,
        type: requiredObservationType,
        platform: source.platform,
        target: source.coverageTarget,
        cadenceHours: syncCadenceHours,
        status: 'active',
        nextCheckAt: now.toISOString(),
        createdAt: source.createdAt,
        updatedAt: source.updatedAt,
      }),
      providerRequest: {
        action: 'creative-source-sync' as const,
        sourceId: source.id,
        sourceKind: source.kind,
        platform: source.platform,
        coverageTarget: source.coverageTarget,
        requiredObservationType,
        resultEndpoint: '/api/creative-monitoring' as const,
      },
      acceptance: 'Return at least one licensed or public observation with title, hookType, pacing, reusableAngle, metrics, and teardown fields for video sources.',
    };
  }).sort((a, b) => {
    const weight = { high: 0, medium: 1, low: 2 };
    return weight[a.priority] - weight[b.priority] || a.kind.localeCompare(b.kind);
  });
  const staleSourceCount = targets.filter(target => target.stale).length;
  const missingLinks = [
    providerReady.length === 0 ? 'No provider-ready creative sources are configured for scheduled sync' : '',
    staleSourceCount > 0 ? `Provider creative sources are stale (${staleSourceCount})` : '',
  ].filter(Boolean);
  return {
    orgId,
    projectId,
    generatedAt: now.toISOString(),
    sourceCount: sources.length,
    providerReadySourceCount: providerReady.length,
    dueSourceCount: targets.filter(target => target.stale).length,
    staleSourceCount,
    targets,
    missingLinks,
    nextActions: missingLinks.map(item => `Close creative source sync gap: ${item}`),
  };
}

export async function bootstrapCreativeMonitoringWatchlist(
  orgId: string,
  input: {
    projectId?: string;
    category?: string;
    platform?: string;
    competitorAccounts?: string[];
    trendTargets?: string[];
    videoKeywords?: string[];
    cadenceHours?: number;
  },
): Promise<CreativeMonitoringBootstrapResult> {
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const category = cleanString(input.category, 'commerce category', 120);
  const platform = cleanString(input.platform, 'TikTok Shop', 80);
  const cadenceHours = cadence(input.cadenceHours);
  const dueNow = new Date(Date.now() - 1000).toISOString();
  const competitorAccounts = cleanList(input.competitorAccounts, 5);
  const trendTargets = cleanList(input.trendTargets, 5);
  const videoKeywords = cleanList(input.videoKeywords, 5);

  const seeds: Array<Partial<CreativeMonitorRecord>> = [
    ...(competitorAccounts.length ? competitorAccounts : [`${category} competitor account`]).map(target => ({
      projectId,
      type: 'competitor_account' as const,
      platform,
      target,
      category,
      cadenceHours,
      nextCheckAt: dueNow,
      notes: 'Bootstrap monitor for account tracking and creative signal capture.',
    })),
    ...(trendTargets.length ? trendTargets : [`${category} top videos`]).map(target => ({
      projectId,
      type: 'trend_rank' as const,
      platform,
      target,
      category,
      cadenceHours,
      nextCheckAt: dueNow,
      notes: 'Bootstrap monitor for rank and trend benchmark capture.',
    })),
    ...(videoKeywords.length ? videoKeywords : [`${category} viral teardown`]).map(target => ({
      projectId,
      type: 'video_keyword' as const,
      platform,
      target,
      category,
      cadenceHours,
      nextCheckAt: dueNow,
      notes: 'Bootstrap monitor for structured video teardown capture.',
    })),
  ];

  const monitors: CreativeMonitorRecord[] = [];
  for (const seed of seeds) {
    monitors.push(await upsertCreativeMonitor(orgId, seed));
  }
  await Promise.all([
    upsertCreativeSource(orgId, {
      projectId,
      kind: 'account_tracking',
      platform,
      status: 'manual_ready',
      providerName: 'manual-account-watch',
      coverageTarget: competitorAccounts.join(', ') || `${category} competitor account`,
      notes: 'Manual source keeps competitor account tracking explicit before OAuth/provider access is connected.',
    }),
    upsertCreativeSource(orgId, {
      projectId,
      kind: 'trend_rank',
      platform,
      status: 'manual_ready',
      providerName: 'manual-rank-watch',
      coverageTarget: trendTargets.join(', ') || `${category} top videos`,
      notes: 'Manual source keeps rank and list evidence explicit before a provider feed is connected.',
    }),
    upsertCreativeSource(orgId, {
      projectId,
      kind: 'video_teardown',
      platform,
      status: 'manual_ready',
      providerName: 'manual-video-teardown',
      coverageTarget: videoKeywords.join(', ') || `${category} viral teardown`,
      notes: 'Manual source keeps video teardown evidence explicit before multimodal parsing is connected.',
    }),
  ]);
  const [dueTasks, snapshot] = await Promise.all([
    getDueCreativeCollectionTasks(orgId, projectId),
    getCreativeMonitoringSnapshot(orgId, projectId),
  ]);
  return { projectId, category, monitors, dueTasks, snapshot };
}

export async function getDueCreativeCollectionTasks(orgId: string, projectId = 'default-project', now = new Date()): Promise<CreativeCollectionTask[]> {
  const monitors = await listCreativeMonitors(orgId, projectId, 200);
  const nowMs = now.getTime();
  return monitors
    .filter(record => record.status === 'active' && Date.parse(record.nextCheckAt) <= nowMs)
    .map(record => ({
      id: `task_${record.id}`.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 180),
      monitorId: record.id,
      projectId: record.projectId,
      ownerRole: 'creative-ops',
      status: 'due',
      platform: record.platform,
      target: record.target,
      type: record.type,
      cadenceHours: record.cadenceHours,
      dueAt: record.nextCheckAt,
      instruction: taskInstruction(record),
      acceptance: 'At least one structured creative insight is imported with hookType, pacing, reusableAngle, and metrics.',
      collectorQuery: collectorQuery(record),
      sourceHint: sourceHint(record),
      evidenceSchema: evidenceSchema(record),
      resultEndpoint: '/api/creative-monitoring',
      brandLearningAction: 'auto_materialize_after_import',
    }));
}

export async function getCreativeCollectorManifest(orgId: string, projectId = 'default-project'): Promise<CreativeCollectorTarget[]> {
  const dueTasks = await getDueCreativeCollectionTasks(orgId, projectId);
  const harvestRuns = await listCreativeHarvestRuns(orgId, projectId, 50);
  return dueTasks.map(task => ({
    id: `collector_${task.id}`.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 190),
    monitorId: task.monitorId,
    projectId: task.projectId,
    type: task.type,
    priority: priorityForTask(task, harvestAttemptsForMonitor(harvestRuns, task.monitorId)),
    attempt: harvestAttemptsForMonitor(harvestRuns, task.monitorId) + 1,
    platform: task.platform,
    target: task.target,
    cadenceHours: task.cadenceHours,
    dueAt: task.dueAt,
    deadlineAt: deadlineForTask(task, harvestAttemptsForMonitor(harvestRuns, task.monitorId)),
    collectorQuery: task.collectorQuery,
    sourceHint: task.sourceHint,
    evidenceSchema: task.evidenceSchema,
    outputAction: 'ingest-collector-run',
    resultEndpoint: task.resultEndpoint,
    complianceNotes: [
      '只导入公开可用或已授权的观察信号。',
      '沉淀结构、节奏、证据点和指标，不复制原视频素材、文案或受保护表达。',
      '无法采集时返回空 observations，让系统记录缺口，不生成伪洞察。',
    ],
  }));
}

export async function getCreativeCollectorRunPlan(orgId: string, projectId = 'default-project'): Promise<CreativeCollectorRunPlan> {
  const [targets, adapterStatus] = await Promise.all([
    getCreativeCollectorManifest(orgId, projectId),
    getCreativeCollectorAdapterView(orgId, projectId),
  ]);
  const orderedTargets = [...targets].sort((a, b) => {
    const priorityWeight = { high: 0, medium: 1, low: 2 };
    return priorityWeight[a.priority] - priorityWeight[b.priority] || Date.parse(a.deadlineAt) - Date.parse(b.deadlineAt);
  });
  return {
    orgId,
    projectId,
    generatedAt: new Date().toISOString(),
    adapterStatus,
    dispatchMode: adapterStatus.mode,
    providerReady: adapterStatus.providerReady,
    targetCount: orderedTargets.length,
    highPriorityCount: orderedTargets.filter(target => target.priority === 'high').length,
    retryTargetCount: orderedTargets.filter(target => target.attempt > 1).length,
    targets: orderedTargets,
    batchInstructions: [
      adapterStatus.providerReady
        ? `Provider ${adapterStatus.providerName} is ready; dispatch targets through the configured collector adapter and require observation callbacks.`
        : `Provider collector is not ready (${adapterStatus.status}); keep manual ops import active and do not pretend automatic scraping.`,
      '先采集 high priority 的视频拆解和重试目标，再采集榜单与账号观察。',
      '每个 target 至少回传 title、hookType、pacing、reusableAngle、metrics；视频 target 必须回传 sceneBeats 或 transcriptSummary。',
      '采不到真实观察时不要伪造，使用 GET /api/cron/creative-harvest 记录缺口并提升下次 attempt。',
    ],
  };
}

export async function executeCreativeCollectorProviderRun(
  orgId: string,
  input: {
    projectId?: string;
    now?: Date;
    providerEndpoint?: string;
    providerToken?: string;
    providerName?: string;
    fetcher?: typeof fetch;
  },
): Promise<CreativeCollectorProviderExecution> {
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const now = input.now || new Date();
  const providerEndpoint = cleanOptionalString(input.providerEndpoint || process.env.CREATIVE_COLLECTOR_PROVIDER_ENDPOINT, 500);
  const providerToken = cleanOptionalString(input.providerToken || process.env.CREATIVE_COLLECTOR_PROVIDER_TOKEN, 500);
  const runPlan = await getCreativeCollectorRunPlan(orgId, projectId);
  const providerName = cleanString(input.providerName || runPlan.adapterStatus.providerName, 'creative-collector-provider', 100);
  const blockedReasons = [
    !runPlan.providerReady ? `Creative collector adapter is not provider-ready (${runPlan.adapterStatus.status}).` : '',
    !providerEndpoint ? 'Creative collector provider endpoint is not configured.' : '',
    !providerToken ? 'Creative collector provider token is not configured.' : '',
    runPlan.targets.length === 0 ? 'No due creative collector targets need execution.' : '',
  ].filter(Boolean);

  if (blockedReasons.length > 0) {
    return {
      id: genProviderSyncExecutionId(),
      orgId,
      projectId,
      status: 'blocked',
      providerName,
      targetCount: runPlan.targets.length,
      observationCount: 0,
      importedInsightIds: [],
      brandLearningAssetIds: [],
      blockedReasons,
      executedAt: now.toISOString(),
    };
  }

  try {
    const response = await (input.fetcher || fetch)(providerEndpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${providerToken}`,
      },
      body: JSON.stringify({
        action: 'creative-collector-run',
        orgId,
        projectId,
        providerName,
        generatedAt: now.toISOString(),
        targets: runPlan.targets.map(target => ({
          monitorId: target.monitorId,
          type: target.type,
          priority: target.priority,
          attempt: target.attempt,
          platform: target.platform,
          target: target.target,
          collectorQuery: target.collectorQuery,
          sourceHint: target.sourceHint,
          evidenceSchema: target.evidenceSchema,
          resultEndpoint: target.resultEndpoint,
          complianceNotes: target.complianceNotes,
        })),
      }),
    });

    if (!response.ok) {
      await upsertCreativeCollectorAdapter(orgId, {
        projectId,
        mode: 'provider',
        providerName,
        endpointConfigured: true,
        authConfigured: true,
        supportedMonitorTypes: runPlan.adapterStatus.supportedMonitorTypes,
        failureCount: runPlan.adapterStatus.failureCount + 1,
        notes: `Creative collector provider returned HTTP ${response.status}.`,
      });
      return {
        id: genProviderSyncExecutionId(),
        orgId,
        projectId,
        status: 'failed',
        providerName,
        targetCount: runPlan.targets.length,
        observationCount: 0,
        importedInsightIds: [],
        brandLearningAssetIds: [],
        blockedReasons: [`Creative collector provider returned HTTP ${response.status}.`],
        executedAt: now.toISOString(),
      };
    }

    const payload = await response.json().catch(() => null) as { observations?: CreativeHarvestObservation[] } | null;
    const observations = Array.isArray(payload?.observations) ? payload.observations.slice(0, 100) : [];
    const harvestRun = await runCreativeMonitoringHarvest(orgId, { projectId, now, observations });
    const status: CreativeCollectorProviderExecution['status'] = observations.length > 0 && harvestRun.importedInsightIds.length > 0
      ? 'completed'
      : 'failed';
    const blocked = [
      ...harvestRun.blockedReasons,
      observations.length === 0 ? 'Creative collector provider returned no observations.' : '',
      observations.length > 0 && harvestRun.importedInsightIds.length === 0 ? 'Collector observations did not match due monitors.' : '',
    ].filter(Boolean);

    await upsertCreativeCollectorAdapter(orgId, {
      projectId,
      mode: 'provider',
      providerName,
      endpointConfigured: true,
      authConfigured: true,
      supportedMonitorTypes: runPlan.adapterStatus.supportedMonitorTypes,
      lastRunAt: now.toISOString(),
      failureCount: status === 'completed' ? 0 : runPlan.adapterStatus.failureCount + 1,
      notes: status === 'completed' ? 'Creative collector provider run completed and materialized into brand learning.' : blocked.join(' '),
    });

    return {
      id: genProviderSyncExecutionId(),
      orgId,
      projectId,
      status,
      providerName,
      targetCount: runPlan.targets.length,
      observationCount: observations.length,
      harvestRunId: harvestRun.id,
      importedInsightIds: harvestRun.importedInsightIds,
      brandLearningAssetIds: harvestRun.brandLearningAssetIds,
      brandLearningDistributionPlanId: harvestRun.brandLearningDistributionPlanId,
      blockedReasons: blocked,
      executedAt: now.toISOString(),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Creative collector provider execution failed.';
    await upsertCreativeCollectorAdapter(orgId, {
      projectId,
      mode: 'provider',
      providerName,
      endpointConfigured: Boolean(providerEndpoint),
      authConfigured: Boolean(providerToken),
      supportedMonitorTypes: runPlan.adapterStatus.supportedMonitorTypes,
      failureCount: runPlan.adapterStatus.failureCount + 1,
      notes: message,
    });
    return {
      id: genProviderSyncExecutionId(),
      orgId,
      projectId,
      status: 'failed',
      providerName,
      targetCount: runPlan.targets.length,
      observationCount: 0,
      importedInsightIds: [],
      brandLearningAssetIds: [],
      blockedReasons: [message],
      executedAt: now.toISOString(),
    };
  }
}

export async function importCreativeMonitorSignal(
  orgId: string,
  input: {
    monitorId: string;
    title: string;
    hookType?: CreativeHookType;
    pacing?: CreativePacing;
    url?: string;
    reusableAngle: string;
    proofPoint?: string;
    cta?: string;
    visualPattern?: string;
    metrics?: CreativeInsightRecord['metrics'];
    riskNotes?: string[];
    observedAt?: string;
    contentFingerprint?: string;
    teardown?: CreativeInsightRecord['teardown'];
  },
): Promise<{ monitor: CreativeMonitorRecord; insight: CreativeInsightRecord } | null> {
  const store = stores();
  const monitor = store.monitors.get(`${orgId}:${input.monitorId}`);
  if (!monitor) return null;
  const insight = await addCreativeInsight(orgId, {
    projectId: monitor.projectId,
    source: sourceFor(monitor.type),
    platform: monitor.platform,
    account: monitor.type === 'competitor_account' ? monitor.target : undefined,
    url: input.url,
    observedAt: input.observedAt,
    contentFingerprint: input.contentFingerprint,
    title: input.title,
    category: monitor.category,
    hookType: input.hookType || 'unknown',
    pacing: input.pacing || 'unknown',
    proofPoint: input.proofPoint,
    cta: input.cta,
    visualPattern: input.visualPattern,
    metrics: input.metrics || {},
    tags: ['creative-monitoring', monitor.type, monitor.target],
    reusableAngle: input.reusableAngle,
    riskNotes: input.riskNotes || [],
    teardown: input.teardown,
  });
  const now = new Date();
  const next = await upsertCreativeMonitor(orgId, {
    ...monitor,
    lastCheckedAt: now.toISOString(),
    nextCheckAt: nextCheck(monitor.cadenceHours, now),
    lastImportedInsightId: insight.id,
  });
  return { monitor: next, insight };
}

export async function runCreativeMonitoringHarvest(
  orgId: string,
  input: {
    projectId?: string;
    now?: Date;
    observations?: CreativeHarvestObservation[];
  },
): Promise<CreativeHarvestRun> {
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const now = input.now || new Date();
  const dueTasks = await getDueCreativeCollectionTasks(orgId, projectId, now);
  const observations = Array.isArray(input.observations) ? input.observations.slice(0, 100) : [];
  const store = stores();
  const importedInsightIds: string[] = [];
  const brandLearningAssetIds: string[] = [];
  let brandLearningDistributionPlanId: string | undefined;
  const missingObservationMonitorIds: string[] = [];
  const blockedReasons: string[] = [];

  for (const task of dueTasks) {
    const monitor = store.monitors.get(`${orgId}:${task.monitorId}`);
    if (!monitor) {
      blockedReasons.push(`Monitor ${task.monitorId} was not found during harvest.`);
      continue;
    }
    const matched = observations.filter(item =>
      item.monitorId === monitor.id ||
      (!item.monitorId &&
        (!item.type || item.type === monitor.type) &&
        (!item.platform || item.platform === monitor.platform) &&
        (!item.target || item.target === monitor.target)),
    );
    if (matched.length === 0) {
      missingObservationMonitorIds.push(monitor.id);
      blockedReasons.push(`No harvested observation supplied for ${monitor.type}:${monitor.target}.`);
      continue;
    }
    for (const observation of matched.slice(0, 5)) {
      const result = await importCreativeMonitorSignal(orgId, {
        monitorId: monitor.id,
        title: observation.title,
        hookType: observation.hookType,
        pacing: observation.pacing,
        url: observation.url,
        reusableAngle: observation.reusableAngle || `Turn ${monitor.target} into a differentiated ${monitor.platform} test angle without copying protected expression.`,
        proofPoint: observation.proofPoint,
        cta: observation.cta,
        visualPattern: observation.visualPattern,
        metrics: observation.metrics,
        riskNotes: observation.riskNotes,
        observedAt: observation.observedAt || now.toISOString(),
        contentFingerprint: observationFingerprint(monitor, observation),
        teardown: normalizeTeardown(observation, monitor),
      });
      if (result) importedInsightIds.push(result.insight.id);
    }
  }

  if (importedInsightIds.length > 0) {
    const application = await materializeBrandLearningProfile(orgId, projectId);
    if (application) {
      brandLearningAssetIds.push(application.learningAsset.id, application.scriptAsset.id);
      brandLearningDistributionPlanId = application.distributionPlan.id;
    }
  }

  const run: CreativeHarvestRun = {
    id: genRunId(),
    orgId,
    projectId,
    dueTaskCount: dueTasks.length,
    observationCount: observations.length,
    importedInsightIds,
    brandLearningAssetIds,
    brandLearningDistributionPlanId,
    missingObservationMonitorIds,
    blockedReasons,
    ranAt: now.toISOString(),
  };
  store.harvestRuns.set(`${orgId}:${run.id}`, run);
  const listKey = `${orgId}:${projectId}`;
  const list = store.harvestLists.get(listKey) || [];
  store.harvestLists.set(listKey, [run.id, ...list.filter(item => item !== run.id)].slice(0, 200));
  return run;
}

export async function listCreativeHarvestRuns(orgId: string, projectId = 'default-project', limit = 50): Promise<CreativeHarvestRun[]> {
  const store = stores();
  const ids = store.harvestLists.get(`${orgId}:${projectId}`) || [];
  return ids.slice(0, limit).map(id => store.harvestRuns.get(`${orgId}:${id}`)).filter(Boolean) as CreativeHarvestRun[];
}

export async function runCreativeSourceSync(
  orgId: string,
  input: {
    projectId?: string;
    now?: Date;
    observations?: CreativeHarvestObservation[];
  },
): Promise<CreativeSourceSyncRun> {
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const now = input.now || new Date();
  const observations = Array.isArray(input.observations) ? input.observations.slice(0, 100) : [];
  const store = stores();
  const sources = await listCreativeSources(orgId, projectId, 100);
  const providerReadySources = sources.filter(source => source.status === 'provider_ready');
  const accountObservationCount = observations.filter(observation => normalizeType(observation.type) === 'competitor_account').length;
  const trendRankObservationCount = observations.filter(observation => normalizeType(observation.type) === 'trend_rank').length;
  const videoTeardownObservationCount = observations.filter(observation => normalizeType(observation.type) === 'video_keyword').length;
  const multimodalParsedObservationCount = observations.filter(observation =>
    normalizeType(observation.type) === 'video_keyword' && hasMultimodalTeardownEvidence(observation),
  ).length;
  const coverageKindCount = [
    accountObservationCount > 0,
    trendRankObservationCount > 0,
    videoTeardownObservationCount > 0 && multimodalParsedObservationCount > 0,
  ].filter(Boolean).length;
  const syncedSourceIds: string[] = [];
  const failedSourceIds: string[] = [];
  const blockedReasons: string[] = [];

  if (providerReadySources.length === 0) {
    blockedReasons.push('No provider-ready creative sources are configured for source sync.');
  }

  for (const source of providerReadySources) {
    const sourceObservations = observations.filter(observation => observationMatchesCreativeSource(observation, source));
    if (sourceObservations.length > 0) {
      syncedSourceIds.push(source.id);
      await upsertCreativeSource(orgId, {
        ...source,
        lastSyncAt: now.toISOString(),
        lastObservationAt: now.toISOString(),
        lastObservationCount: sourceObservations.length,
        totalObservationCount: source.totalObservationCount + sourceObservations.length,
        failureCount: 0,
      });
    } else {
      failedSourceIds.push(source.id);
      blockedReasons.push(`Provider source ${source.kind}:${source.providerName} returned no observations.`);
      await upsertCreativeSource(orgId, {
        ...source,
        lastObservationCount: 0,
        failureCount: source.failureCount + 1,
      });
    }
  }

  const harvestRun = observations.length > 0
    ? await runCreativeMonitoringHarvest(orgId, { projectId, now, observations })
    : undefined;
  const importedInsightIds = harvestRun?.importedInsightIds || [];
  const status: CreativeSourceSyncRun['status'] = providerReadySources.length === 0 || syncedSourceIds.length === 0
    ? 'blocked'
    : failedSourceIds.length > 0 || importedInsightIds.length === 0
      ? 'partial'
      : 'completed';
  if (observations.length > 0 && importedInsightIds.length === 0) {
    blockedReasons.push('Source sync received observations but no due monitor accepted them.');
  }
  if (providerReadySources.length >= 3 && coverageKindCount < 3) {
    blockedReasons.push('Latest provider source sync did not cover account, trend/rank, and multimodal video teardown observations.');
  }

  const run: CreativeSourceSyncRun = {
    id: genSourceSyncRunId(),
    orgId,
    projectId,
    sourceCount: sources.length,
    providerReadySourceCount: providerReadySources.length,
    syncedSourceIds,
    failedSourceIds,
    observationCount: observations.length,
    accountObservationCount,
    trendRankObservationCount,
    videoTeardownObservationCount,
    multimodalParsedObservationCount,
    coverageKindCount,
    importedInsightIds,
    harvestRunId: harvestRun?.id,
    blockedReasons,
    status,
    ranAt: now.toISOString(),
  };
  store.sourceSyncRuns.set(`${orgId}:${run.id}`, run);
  const listKey = `${orgId}:${projectId}`;
  const list = store.sourceSyncLists.get(listKey) || [];
  store.sourceSyncLists.set(listKey, [run.id, ...list.filter(item => item !== run.id)].slice(0, 200));
  return run;
}

export async function executeCreativeSourceProviderSync(
  orgId: string,
  input: {
    projectId?: string;
    now?: Date;
    providerEndpoint?: string;
    providerToken?: string;
    providerName?: string;
    fetcher?: typeof fetch;
  },
): Promise<CreativeSourceProviderSyncExecution> {
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const now = input.now || new Date();
  const providerEndpoint = cleanOptionalString(input.providerEndpoint || process.env.CREATIVE_SOURCE_PROVIDER_ENDPOINT, 500);
  const providerToken = cleanOptionalString(input.providerToken || process.env.CREATIVE_SOURCE_PROVIDER_TOKEN, 500);
  const providerName = cleanString(input.providerName, 'creative-source-provider', 100);
  const plan = await getCreativeSourceSyncPlan(orgId, projectId, now);
  const dueTargets = plan.targets.filter(target => target.stale);
  const blockedReasons: string[] = [];

  if (!providerEndpoint || !providerToken) {
    blockedReasons.push('Creative source provider endpoint or token is not configured.');
  }
  if (dueTargets.length === 0) {
    blockedReasons.push('No stale provider creative sources need execution.');
  }
  if (blockedReasons.length > 0) {
    return {
      id: genProviderSyncExecutionId(),
      orgId,
      projectId,
      status: 'blocked',
      providerName,
      targetCount: dueTargets.length,
      observationCount: 0,
      importedInsightIds: [],
      blockedReasons,
      executedAt: now.toISOString(),
    };
  }

  try {
    const fetcher = input.fetcher || fetch;
    const response = await fetcher(providerEndpoint!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${providerToken}`,
      },
      body: JSON.stringify({
        action: 'creative-source-sync',
        orgId,
        projectId,
        generatedAt: now.toISOString(),
        targets: dueTargets.map(target => ({
          sourceId: target.sourceId,
          sourceKind: target.kind,
          platform: target.platform,
          coverageTarget: target.coverageTarget,
          requiredObservationType: target.requiredObservationType,
          evidenceSchema: target.evidenceSchema,
          requiredObservationFields: ['sourceId', 'target', 'title', 'hookType', 'pacing', 'reusableAngle'],
          resultEndpoint: target.providerRequest.resultEndpoint,
        })),
      }),
    });
    if (!response.ok) {
      return {
        id: genProviderSyncExecutionId(),
        orgId,
        projectId,
        status: 'failed',
        providerName,
        targetCount: dueTargets.length,
        observationCount: 0,
        importedInsightIds: [],
        blockedReasons: [`Creative source provider returned HTTP ${response.status}.`],
        executedAt: now.toISOString(),
      };
    }
    const payload = await response.json().catch(() => null) as { observations?: CreativeHarvestObservation[] } | null;
    const observations = Array.isArray(payload?.observations) ? payload.observations : [];
    const sourceSyncRun = await runCreativeSourceSync(orgId, { projectId, now, observations });
    return {
      id: genProviderSyncExecutionId(),
      orgId,
      projectId,
      status: sourceSyncRun.status === 'completed' ? 'completed' : 'failed',
      providerName,
      targetCount: dueTargets.length,
      observationCount: observations.length,
      sourceSyncRunId: sourceSyncRun.id,
      importedInsightIds: sourceSyncRun.importedInsightIds,
      blockedReasons: sourceSyncRun.blockedReasons,
      executedAt: now.toISOString(),
    };
  } catch (error) {
    return {
      id: genProviderSyncExecutionId(),
      orgId,
      projectId,
      status: 'failed',
      providerName,
      targetCount: dueTargets.length,
      observationCount: 0,
      importedInsightIds: [],
      blockedReasons: [error instanceof Error ? error.message : 'Creative source provider execution failed.'],
      executedAt: now.toISOString(),
    };
  }
}

export async function listCreativeSourceSyncRuns(orgId: string, projectId = 'default-project', limit = 50): Promise<CreativeSourceSyncRun[]> {
  const store = stores();
  const ids = store.sourceSyncLists.get(`${orgId}:${projectId}`) || [];
  return ids.slice(0, limit).map(id => store.sourceSyncRuns.get(`${orgId}:${id}`)).filter(Boolean) as CreativeSourceSyncRun[];
}

export async function getCreativeMonitoringSnapshot(orgId: string, projectId = 'default-project'): Promise<CreativeMonitoringSnapshot> {
  const [monitors, dueTasks, harvestRuns, sourceSyncRuns, collectorAdapter, sourceSnapshot, sources] = await Promise.all([
    listCreativeMonitors(orgId, projectId, 200),
    getDueCreativeCollectionTasks(orgId, projectId),
    listCreativeHarvestRuns(orgId, projectId, 50),
    listCreativeSourceSyncRuns(orgId, projectId, 50),
    getCreativeCollectorAdapterView(orgId, projectId),
    getCreativeSourceSnapshot(orgId, projectId),
    listCreativeSources(orgId, projectId, 100),
  ]);
  const active = monitors.filter(item => item.status === 'active');
  const importedInsightCount = monitors.filter(item => item.lastImportedInsightId).length;
  const harvestedInsightCount = harvestRuns.reduce((sum, run) => sum + run.importedInsightIds.length, 0);
  const collectorTargetCount = dueTasks.length;
  const multimodalTeardownReady = dueTasks.some(task => task.type === 'video_keyword' && task.evidenceSchema.includes('sceneBeats'));
  const providerReadySources = sources.filter(item => item.status === 'provider_ready');
  const latestSourceSync = sourceSyncRuns[0];
  const now = new Date();
  const providerSourceFreshCount = providerReadySources.filter(source =>
    isSourceFresh(source, now, latestSourceSync?.syncedSourceIds.includes(source.id)),
  ).length;
  const providerSourceFailureCount = providerReadySources.filter(source => source.failureCount > 0).length;
  const sourceSyncCoverageScore = Math.round(((latestSourceSync?.coverageKindCount || 0) / 3) * 100);
  const missingLinks = [
    monitors.length === 0 ? 'Missing creative monitoring watchlist' : '',
    active.length === 0 ? 'No active creative monitors' : '',
    monitors.filter(item => item.type === 'competitor_account').length === 0 ? 'Missing competitor account monitor' : '',
    monitors.filter(item => item.type === 'trend_rank').length === 0 ? 'Missing trend/rank monitor' : '',
    monitors.filter(item => item.type === 'video_keyword').length === 0 ? 'Missing video keyword teardown monitor' : '',
    collectorTargetCount === 0 && importedInsightCount === 0 ? 'Missing collector manifest for scheduled harvest' : '',
    collectorAdapter.providerReady ? '' : 'Collector provider is not ready',
    ...sourceSnapshot.missingLinks,
    providerReadySources.length > 0 && sourceSyncRuns.length === 0 ? 'Missing provider creative source sync run evidence' : '',
    providerReadySources.length > 0 && providerSourceFreshCount < providerReadySources.length ? 'Not all provider creative sources have fresh sync evidence' : '',
    providerReadySources.length >= 3 && sourceSyncCoverageScore < 100 ? 'Latest provider creative source sync did not cover account, trend/rank, and multimodal video signals' : '',
    providerSourceFailureCount > 0 ? `Provider creative source sync failures (${providerSourceFailureCount})` : '',
    harvestRuns.length === 0 && importedInsightCount === 0 ? 'Missing scheduled creative harvest run evidence' : '',
    dueTasks.length === 0 && importedInsightCount === 0 && harvestedInsightCount === 0 ? 'No due collection task or imported monitor signal' : '',
  ].filter(Boolean);
  return {
    orgId,
    projectId,
    monitorCount: monitors.length,
    activeMonitorCount: active.length,
    competitorAccountMonitorCount: monitors.filter(item => item.type === 'competitor_account').length,
    trendRankMonitorCount: monitors.filter(item => item.type === 'trend_rank').length,
    videoKeywordMonitorCount: monitors.filter(item => item.type === 'video_keyword').length,
    dueTaskCount: dueTasks.length,
    importedInsightCount,
    harvestRunCount: harvestRuns.length,
    harvestedInsightCount,
    collectorTargetCount,
    collectorAdapterStatus: collectorAdapter.status,
    collectorProviderReady: collectorAdapter.providerReady,
    sourceCount: sourceSnapshot.sourceCount,
    providerReadySourceCount: sourceSnapshot.providerReadySourceCount,
    sourceSyncRunCount: sourceSyncRuns.length,
    providerSourceFreshCount,
    providerSourceFailureCount,
    sourceSyncAccountObservationCount: latestSourceSync?.accountObservationCount || 0,
    sourceSyncTrendRankObservationCount: latestSourceSync?.trendRankObservationCount || 0,
    sourceSyncVideoTeardownObservationCount: latestSourceSync?.videoTeardownObservationCount || 0,
    sourceSyncMultimodalParsedCount: latestSourceSync?.multimodalParsedObservationCount || 0,
    sourceSyncCoverageScore,
    creativeSourceObservationCount: sourceSnapshot.totalObservationCount,
    creativeSourceRepeatObservationSourceCount: sourceSnapshot.repeatObservationSourceCount,
    creativeSourceScaleScore: sourceSnapshot.sourceScaleScore,
    creativeSourceDepthScore: sourceSnapshot.sourceDepthScore,
    creativeSourceHealthCards: sourceSnapshot.sourceHealthCards,
    creativeReadySourceHealthCardCount: sourceSnapshot.readySourceHealthCardCount,
    accountTrackingCoverageTargetCount: sourceSnapshot.accountTrackingCoverageTargetCount,
    trendRankCoverageSignalCount: sourceSnapshot.trendRankCoverageSignalCount,
    videoTeardownRepeatReady: sourceSnapshot.videoTeardownRepeatReady,
    accountTrackingSourceReady: sourceSnapshot.accountTrackingSourceReady,
    trendRankSourceReady: sourceSnapshot.trendRankSourceReady,
    videoTeardownSourceReady: sourceSnapshot.videoTeardownSourceReady,
    multimodalTeardownReady,
    lastHarvestAt: harvestRuns[0]?.ranAt,
    lastSourceSyncAt: latestSourceSync?.ranAt,
    missingLinks,
    nextActions: missingLinks.map(item => `Close creative monitoring gap: ${item}`),
  };
}

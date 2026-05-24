import {
  addContentAsset,
  addDistributionPlan,
  createDistributionDispatch,
  type ContentAssetRecord,
  type DistributionDispatchRecord,
  type DistributionPlanRecord,
} from '@/lib/industrial-chain-store';
import { listChannelAccounts } from '@/lib/channel-account-ledger';

export type CreativeInsightSource = 'manual' | 'competitor-account' | 'trend-rank' | 'video-teardown';
export type CreativeHookType = 'question' | 'demo' | 'story' | 'shock' | 'comparison' | 'proof' | 'unknown';
export type CreativePacing = 'fast' | 'medium' | 'slow' | 'unknown';

export interface CreativeInsightRecord {
  id: string;
  orgId: string;
  projectId: string;
  source: CreativeInsightSource;
  platform: string;
  account?: string;
  url?: string;
  observedAt?: string;
  contentFingerprint?: string;
  title: string;
  category?: string;
  hookType: CreativeHookType;
  pacing: CreativePacing;
  proofPoint?: string;
  cta?: string;
  visualPattern?: string;
  metrics: {
    views?: number;
    likes?: number;
    comments?: number;
    saves?: number;
    sales?: number;
    revenue?: number;
  };
  tags: string[];
  reusableAngle: string;
  riskNotes: string[];
  teardown?: {
    openingHook?: string;
    sceneBeats: string[];
    proofMoment?: string;
    productMoment?: string;
    ctaMoment?: string;
    visualRhythm?: string;
    audioCue?: string;
    textOverlays: string[];
    complianceNotes: string[];
  };
  createdAt: string;
}

export interface CreativeOpportunity {
  insightId: string;
  source: CreativeInsightSource;
  platform: string;
  angle: string;
  hookType: CreativeHookType;
  pacing: CreativePacing;
  funnelStage: 'hook_test' | 'proof_test' | 'product_demo' | 'conversion_cta';
  primaryMetric: string;
  confidenceScore: number;
  productionInstruction: string;
  distributionInstruction: string;
  complianceBoundary: string;
}

export interface CreativePatternCluster {
  id: string;
  platform: string;
  pacing: CreativePacing;
  sourceMix: CreativeInsightSource[];
  insightIds: string[];
  totalViews: number;
  totalSales: number;
  totalRevenue: number;
  evidenceScore: number;
  dominantHooks: CreativeHookType[];
  reusableAngles: string[];
  synthesis: string;
  nextProductionMove: string;
  distributionTest: string;
  riskBoundary: string;
}

export interface CreativeOpportunityBacklogItem {
  id: string;
  priority: 'P0' | 'P1' | 'P2';
  readiness: 'ready_to_produce' | 'needs_source_depth' | 'needs_video_teardown' | 'needs_commercial_signal';
  platform: string;
  clusterId: string;
  sourceMix: CreativeInsightSource[];
  insightIds: string[];
  evidenceScore: number;
  sourceDepthScore: number;
  commercialScore: number;
  repeatabilityScore: number;
  missingEvidence: string[];
  productionMove: string;
  distributionMove: string;
  providerBoundary: string;
  acceptance: string;
}

export interface CreativeIntelligenceSnapshot {
  orgId: string;
  projectId: string;
  insightCount: number;
  competitorAccountCount: number;
  trendRankCount: number;
  teardownCount: number;
  reusableAngleCount: number;
  topHookType: CreativeHookType | null;
  topPacing: CreativePacing | null;
  topPlatform: string | null;
  totalViews: number;
  totalSales: number;
  totalRevenue: number;
  opportunityCount: number;
  averageConfidenceScore: number;
  opportunityMap: CreativeOpportunity[];
  patternClusterCount: number;
  crossSourcePatternCount: number;
  creativeMoatScore: number;
  patternClusters: CreativePatternCluster[];
  opportunityBacklogCount: number;
  readyOpportunityCount: number;
  opportunityBacklog: CreativeOpportunityBacklogItem[];
  missingLinks: string[];
  nextActions: string[];
  brandLearningProfile: {
    preferredHookType: CreativeHookType | null;
    preferredPacing: CreativePacing | null;
    avoidPatterns: string[];
    nextTestAngles: string[];
  };
}

export interface CreativeIntelligenceApplication {
  benchmarkAsset: ContentAssetRecord;
  scriptAsset: ContentAssetRecord;
  distributionPlan?: DistributionPlanRecord;
  experimentPlans: DistributionPlanRecord[];
  distributionDispatches: DistributionDispatchRecord[];
  channelSlotCount: number;
}

type CreativeGlobal = typeof globalThis & {
  __wenaiCreativeInsights?: Map<string, CreativeInsightRecord>;
  __wenaiCreativeInsightLists?: Map<string, string[]>;
};

function stores() {
  const target = globalThis as CreativeGlobal;
  if (!target.__wenaiCreativeInsights) target.__wenaiCreativeInsights = new Map();
  if (!target.__wenaiCreativeInsightLists) target.__wenaiCreativeInsightLists = new Map();
  return {
    insights: target.__wenaiCreativeInsights,
    lists: target.__wenaiCreativeInsightLists,
  };
}

function genId() {
  return `ci_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function cleanString(value: unknown, fallback: string, limit = 240) {
  return (typeof value === 'string' ? value : fallback).trim().slice(0, limit) || fallback;
}

function cleanOptionalString(value: unknown, limit = 500) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, limit) : undefined;
}

function cleanTags(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.map(item => String(item).trim()).filter(Boolean).slice(0, 20);
}

function cleanList(value: unknown, limit = 12) {
  if (!Array.isArray(value)) return [];
  return value.map(item => String(item).trim()).filter(Boolean).slice(0, limit);
}

function cleanNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) && num >= 0 ? num : undefined;
}

function normalizeSource(value: unknown): CreativeInsightSource {
  const allowed: CreativeInsightSource[] = ['manual', 'competitor-account', 'trend-rank', 'video-teardown'];
  return allowed.includes(value as CreativeInsightSource) ? value as CreativeInsightSource : 'manual';
}

function normalizeHook(value: unknown): CreativeHookType {
  const allowed: CreativeHookType[] = ['question', 'demo', 'story', 'shock', 'comparison', 'proof', 'unknown'];
  return allowed.includes(value as CreativeHookType) ? value as CreativeHookType : 'unknown';
}

function normalizePacing(value: unknown): CreativePacing {
  const allowed: CreativePacing[] = ['fast', 'medium', 'slow', 'unknown'];
  return allowed.includes(value as CreativePacing) ? value as CreativePacing : 'unknown';
}

function pickTop<T extends string>(items: T[]): T | null {
  const counts = new Map<T, number>();
  for (const item of items) counts.set(item, (counts.get(item) || 0) + 1);
  let top: T | null = null;
  let count = 0;
  for (const [item, itemCount] of counts.entries()) {
    if (item !== 'unknown' && itemCount > count) {
      top = item;
      count = itemCount;
    }
  }
  return top;
}

function confidenceForInsight(item: CreativeInsightRecord) {
  let score = 0;
  if (item.reusableAngle.trim().length > 0) score += 20;
  if ((item.metrics.views || 0) > 0 || (item.metrics.likes || 0) > 0 || (item.metrics.comments || 0) > 0) score += 15;
  if ((item.metrics.sales || 0) > 0 || (item.metrics.revenue || 0) > 0) score += 20;
  if (item.proofPoint) score += 15;
  if (item.cta) score += 10;
  if (item.teardown?.sceneBeats.length) score += 20;
  return Math.min(100, score);
}

function primaryMetricForInsight(item: CreativeInsightRecord) {
  if ((item.metrics.sales || 0) > 0 || (item.metrics.revenue || 0) > 0) return 'orders / revenue / creative_insight_id';
  if ((item.metrics.saves || 0) > 0) return 'save rate / replay / add-to-cart';
  if ((item.metrics.comments || 0) > 0) return 'comment intent / objection themes';
  return 'thumbstop rate / CTR / CPC';
}

function funnelStageForInsight(item: CreativeInsightRecord): CreativeOpportunity['funnelStage'] {
  if (item.hookType === 'proof' || item.proofPoint) return 'proof_test';
  if (item.hookType === 'demo' || item.visualPattern) return 'product_demo';
  if (item.cta) return 'conversion_cta';
  return 'hook_test';
}

function buildCreativeOpportunity(item: CreativeInsightRecord): CreativeOpportunity {
  const stage = funnelStageForInsight(item);
  const scenePlan = item.teardown?.sceneBeats.length ? item.teardown.sceneBeats.join(' -> ') : item.visualPattern || item.proofPoint || item.title;
  return {
    insightId: item.id,
    source: item.source,
    platform: item.platform,
    angle: item.reusableAngle,
    hookType: item.hookType,
    pacing: item.pacing,
    funnelStage: stage,
    primaryMetric: primaryMetricForInsight(item),
    confidenceScore: confidenceForInsight(item),
    productionInstruction: `Rebuild the ${stage} angle with Wenai-owned assets: ${scenePlan}`.slice(0, 500),
    distributionInstruction: `Ship one ${item.platform} variant, tag creative_insight_id=${item.id}, and compare ${primaryMetricForInsight(item)} within the next return cycle.`.slice(0, 500),
    complianceBoundary: item.riskNotes.length
      ? `Do not copy protected expression: ${item.riskNotes.join('; ')}`.slice(0, 500)
      : 'Use the structure and learning only; do not copy footage, captions, music, or protected expression.',
  };
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function buildCreativePatternClusters(insights: CreativeInsightRecord[]): CreativePatternCluster[] {
  const groups = new Map<string, CreativeInsightRecord[]>();
  for (const item of insights) {
    const key = `${item.platform || 'unknown'}:${item.pacing || 'unknown'}`;
    groups.set(key, [...(groups.get(key) || []), item]);
  }

  return Array.from(groups.entries())
    .map(([key, items]) => {
      const [platform, pacingValue] = key.split(':');
      const sourceMix = unique(items.map(item => item.source));
      const totalViews = items.reduce((sum, item) => sum + (item.metrics.views || 0), 0);
      const totalSales = items.reduce((sum, item) => sum + (item.metrics.sales || 0), 0);
      const totalRevenue = items.reduce((sum, item) => sum + (item.metrics.revenue || 0), 0);
      const confidence = Math.round(items.reduce((sum, item) => sum + confidenceForInsight(item), 0) / Math.max(items.length, 1));
      const sourceDepth = Math.min(30, sourceMix.length * 10);
      const teardownDepth = Math.min(20, items.filter(item => item.teardown?.sceneBeats.length).length * 10);
      const performanceDepth = totalSales > 0 || totalRevenue > 0 ? 20 : totalViews > 0 ? 10 : 0;
      const evidenceScore = Math.min(100, Math.round(confidence * 0.3 + sourceDepth + teardownDepth + performanceDepth));
      const dominantHooks = unique(items.map(item => item.hookType).filter(item => item !== 'unknown')).slice(0, 4);
      const reusableAngles = items.map(item => item.reusableAngle).filter(Boolean).slice(0, 5);
      const best = [...items].sort((a, b) => confidenceForInsight(b) - confidenceForInsight(a))[0];
      const riskNotes = unique(items.flatMap(item => item.riskNotes).concat(items.flatMap(item => item.teardown?.complianceNotes || []))).slice(0, 6);
      const clusterId = `cluster_${platform}_${pacingValue}`.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 160);
      return {
        id: clusterId,
        platform,
        pacing: normalizePacing(pacingValue),
        sourceMix,
        insightIds: items.map(item => item.id),
        totalViews,
        totalSales,
        totalRevenue,
        evidenceScore,
        dominantHooks,
        reusableAngles,
        synthesis: `Cross-source ${platform} ${pacingValue} pattern: ${dominantHooks.join(', ') || 'mixed hook'} with ${sourceMix.join(' + ')} evidence.`.slice(0, 500),
        nextProductionMove: `Produce a Wenai-owned variant from the strongest signal "${best?.title || 'creative pattern'}"; keep the pacing, rebuild footage, claims, proof, caption, and CTA.`.slice(0, 500),
        distributionTest: `Run tagged variants on ${platform} with cluster_id=${clusterId}; compare orders, revenue, CTR, and retention against source mix ${sourceMix.join('/')}.`.slice(0, 500),
        riskBoundary: riskNotes.length
          ? `Respect boundaries: ${riskNotes.join('; ')}`.slice(0, 500)
          : 'Use only the abstract pattern; do not copy footage, captions, music, account identity, claims, or protected expression.',
      };
    })
    .filter(cluster => cluster.insightIds.length > 0)
    .sort((a, b) => b.evidenceScore - a.evidenceScore || b.sourceMix.length - a.sourceMix.length)
    .slice(0, 8);
}

function creativeMoatScoreFor(clusters: CreativePatternCluster[], insights: CreativeInsightRecord[]) {
  const sourceTypes = unique(insights.map(item => item.source)).length;
  const crossSourceClusters = clusters.filter(cluster => cluster.sourceMix.length >= 2).length;
  const structuredTeardowns = insights.filter(item => item.teardown?.sceneBeats.length).length;
  const performanceSignals = insights.filter(item => (item.metrics.sales || 0) > 0 || (item.metrics.revenue || 0) > 0).length;
  const averageClusterScore = clusters.length
    ? Math.round(clusters.reduce((sum, item) => sum + item.evidenceScore, 0) / clusters.length)
    : 0;
  return Math.min(100, Math.round(
    sourceTypes * 8 +
    crossSourceClusters * 14 +
    structuredTeardowns * 8 +
    performanceSignals * 6 +
    averageClusterScore * 0.35,
  ));
}

function buildCreativeOpportunityBacklog(
  clusters: CreativePatternCluster[],
  insights: CreativeInsightRecord[],
): CreativeOpportunityBacklogItem[] {
  const insightById = new Map(insights.map(item => [item.id, item]));
  return clusters.map(cluster => {
    const clusterInsights = cluster.insightIds.map(id => insightById.get(id)).filter(Boolean) as CreativeInsightRecord[];
    const hasCompetitor = cluster.sourceMix.includes('competitor-account');
    const hasTrend = cluster.sourceMix.includes('trend-rank');
    const hasTeardown = clusterInsights.some(item => item.source === 'video-teardown' && (item.teardown?.sceneBeats.length || 0) > 0);
    const hasCommercial = cluster.totalSales > 0 || cluster.totalRevenue > 0;
    const sourceDepthScore = Math.min(100,
      cluster.sourceMix.length * 25 +
      (hasCompetitor ? 10 : 0) +
      (hasTrend ? 10 : 0) +
      (hasTeardown ? 15 : 0),
    );
    const commercialScore = Math.min(100,
      (cluster.totalRevenue > 0 ? 45 : 0) +
      (cluster.totalSales > 0 ? 35 : 0) +
      (cluster.totalViews > 0 ? 20 : 0),
    );
    const repeatabilityScore = Math.min(100, Math.round(cluster.evidenceScore * 0.55 + sourceDepthScore * 0.3 + commercialScore * 0.15));
    const missingEvidence = [
      !hasCompetitor ? 'Add competitor account tracking signal' : '',
      !hasTrend ? 'Add trend/rank source signal' : '',
      !hasTeardown ? 'Add structured multimodal video teardown' : '',
      !hasCommercial ? 'Add sales/revenue or post-publish performance signal' : '',
    ].filter(Boolean);
    const readiness: CreativeOpportunityBacklogItem['readiness'] =
      missingEvidence.length === 0 && repeatabilityScore >= 70
        ? 'ready_to_produce'
        : !hasTeardown
          ? 'needs_video_teardown'
          : !hasCommercial
            ? 'needs_commercial_signal'
            : 'needs_source_depth';
    const priority: CreativeOpportunityBacklogItem['priority'] =
      readiness === 'ready_to_produce' ? 'P0' : repeatabilityScore >= 55 ? 'P1' : 'P2';
    return {
      id: `opportunity_${cluster.id}`.slice(0, 180),
      priority,
      readiness,
      platform: cluster.platform,
      clusterId: cluster.id,
      sourceMix: cluster.sourceMix,
      insightIds: cluster.insightIds,
      evidenceScore: cluster.evidenceScore,
      sourceDepthScore,
      commercialScore,
      repeatabilityScore,
      missingEvidence,
      productionMove: cluster.nextProductionMove,
      distributionMove: cluster.distributionTest,
      providerBoundary: missingEvidence.length
        ? `Do not claim this pattern is market-proven until: ${missingEvidence.join('; ')}.`
        : 'Ready for Wenai-owned production variant; still do not copy footage, captions, music, or creator identity.',
      acceptance: readiness === 'ready_to_produce'
        ? 'Create a Wenai-owned variant, dispatch with cluster_id, and import performance return.'
        : 'Close missing evidence, then rerun creative intelligence application before production.',
    };
  })
    .sort((a, b) => {
      const priorityRank = { P0: 0, P1: 1, P2: 2 };
      return priorityRank[a.priority] - priorityRank[b.priority] || b.repeatabilityScore - a.repeatabilityScore;
    })
    .slice(0, 10);
}

function scheduledAtForExperiment(index: number) {
  const date = new Date();
  date.setHours(date.getHours() + 6 + index * 4, 0, 0, 0);
  return date.toISOString();
}

export async function addCreativeInsight(orgId: string, input: Partial<CreativeInsightRecord>): Promise<CreativeInsightRecord> {
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const record: CreativeInsightRecord = {
    id: input.id || genId(),
    orgId,
    projectId,
    source: normalizeSource(input.source),
    platform: cleanString(input.platform, 'manual-platform', 80),
    account: cleanOptionalString(input.account, 160),
    url: cleanOptionalString(input.url, 1000),
    observedAt: cleanOptionalString(input.observedAt, 80),
    contentFingerprint: cleanOptionalString(input.contentFingerprint, 240),
    title: cleanString(input.title, 'Untitled creative signal', 220),
    category: cleanOptionalString(input.category, 120),
    hookType: normalizeHook(input.hookType),
    pacing: normalizePacing(input.pacing),
    proofPoint: cleanOptionalString(input.proofPoint, 500),
    cta: cleanOptionalString(input.cta, 240),
    visualPattern: cleanOptionalString(input.visualPattern, 500),
    metrics: {
      views: cleanNumber(input.metrics?.views),
      likes: cleanNumber(input.metrics?.likes),
      comments: cleanNumber(input.metrics?.comments),
      saves: cleanNumber(input.metrics?.saves),
      sales: cleanNumber(input.metrics?.sales),
      revenue: cleanNumber(input.metrics?.revenue),
    },
    tags: cleanTags(input.tags),
    reusableAngle: cleanString(input.reusableAngle, 'Translate this signal into a differentiated Wenai test angle.', 800),
    riskNotes: Array.isArray(input.riskNotes) ? input.riskNotes.map(item => String(item).trim()).filter(Boolean).slice(0, 8) : [],
    teardown: input.teardown ? {
      openingHook: cleanOptionalString(input.teardown.openingHook, 500),
      sceneBeats: cleanList(input.teardown.sceneBeats, 12),
      proofMoment: cleanOptionalString(input.teardown.proofMoment, 500),
      productMoment: cleanOptionalString(input.teardown.productMoment, 500),
      ctaMoment: cleanOptionalString(input.teardown.ctaMoment, 500),
      visualRhythm: cleanOptionalString(input.teardown.visualRhythm, 300),
      audioCue: cleanOptionalString(input.teardown.audioCue, 300),
      textOverlays: cleanList(input.teardown.textOverlays, 12),
      complianceNotes: cleanList(input.teardown.complianceNotes, 8),
    } : undefined,
    createdAt: new Date().toISOString(),
  };

  const store = stores();
  store.insights.set(`${orgId}:${record.id}`, record);
  const listKey = `${orgId}:${projectId}`;
  const list = store.lists.get(listKey) || [];
  store.lists.set(listKey, [record.id, ...list.filter(item => item !== record.id)].slice(0, 500));
  return record;
}

export async function listCreativeInsights(orgId: string, projectId = 'default-project', limit = 100): Promise<CreativeInsightRecord[]> {
  const store = stores();
  const ids = store.lists.get(`${orgId}:${projectId}`) || [];
  return ids.slice(0, limit).map(id => store.insights.get(`${orgId}:${id}`)).filter(Boolean) as CreativeInsightRecord[];
}

export async function getCreativeIntelligenceSnapshot(orgId: string, projectId = 'default-project'): Promise<CreativeIntelligenceSnapshot> {
  const insights = await listCreativeInsights(orgId, projectId, 200);
  const reusable = insights.filter(item => item.reusableAngle.trim().length > 0);
  const totalViews = insights.reduce((sum, item) => sum + (item.metrics.views || 0), 0);
  const totalSales = insights.reduce((sum, item) => sum + (item.metrics.sales || 0), 0);
  const totalRevenue = insights.reduce((sum, item) => sum + (item.metrics.revenue || 0), 0);
  const topHookType = pickTop(insights.map(item => item.hookType));
  const topPacing = pickTop(insights.map(item => item.pacing));
  const topPlatform = pickTop(insights.map(item => item.platform).filter(Boolean));
  const nextTestAngles = reusable.slice(0, 5).map(item => `${item.platform}: ${item.reusableAngle}`);
  const opportunityMap = reusable
    .map(buildCreativeOpportunity)
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, 8);
  const patternClusters = buildCreativePatternClusters(insights);
  const opportunityBacklog = buildCreativeOpportunityBacklog(patternClusters, insights);
  const crossSourcePatternCount = patternClusters.filter(cluster => cluster.sourceMix.length >= 2).length;
  const creativeMoatScore = creativeMoatScoreFor(patternClusters, insights);
  const readyOpportunityCount = opportunityBacklog.filter(item => item.readiness === 'ready_to_produce').length;
  const averageConfidenceScore = opportunityMap.length
    ? Math.round(opportunityMap.reduce((sum, item) => sum + item.confidenceScore, 0) / opportunityMap.length)
    : 0;
  const avoidPatterns = insights.flatMap(item => item.riskNotes).slice(0, 8);
  const missingLinks = [
    insights.length === 0 ? 'Missing creative intelligence import' : '',
    insights.filter(item => item.source === 'competitor-account').length === 0 ? 'Missing competitor account tracking signal' : '',
    insights.filter(item => item.source === 'trend-rank').length === 0 ? 'Missing trend/rank benchmark signal' : '',
    insights.filter(item => item.source === 'video-teardown' && item.teardown && item.teardown.sceneBeats.length > 0).length === 0 ? 'Missing structured video teardown signal' : '',
    reusable.length === 0 ? 'Missing reusable creative angle' : '',
    !topHookType ? 'Missing hook structure classification' : '',
    !topPacing ? 'Missing pacing classification' : '',
    patternClusters.length === 0 ? 'Missing creative pattern clustering' : '',
    crossSourcePatternCount === 0 ? 'Missing cross-source creative pattern evidence' : '',
    opportunityBacklog.length > 0 && readyOpportunityCount === 0 ? 'Missing ready-to-produce creative opportunity backlog item' : '',
    creativeMoatScore < 60 ? 'Creative moat score below commercial threshold' : '',
  ].filter(Boolean);

  return {
    orgId,
    projectId,
    insightCount: insights.length,
    competitorAccountCount: insights.filter(item => item.source === 'competitor-account').length,
    trendRankCount: insights.filter(item => item.source === 'trend-rank').length,
    teardownCount: insights.filter(item => item.source === 'video-teardown').length,
    reusableAngleCount: reusable.length,
    topHookType,
    topPacing,
    topPlatform,
    totalViews,
    totalSales,
    totalRevenue,
    opportunityCount: opportunityMap.length,
    averageConfidenceScore,
    opportunityMap,
    patternClusterCount: patternClusters.length,
    crossSourcePatternCount,
    creativeMoatScore,
    patternClusters,
    opportunityBacklogCount: opportunityBacklog.length,
    readyOpportunityCount,
    opportunityBacklog,
    missingLinks,
    nextActions: missingLinks.map(item => `Close creative gap: ${item}`),
    brandLearningProfile: {
      preferredHookType: topHookType,
      preferredPacing: topPacing,
      avoidPatterns,
      nextTestAngles,
    },
  };
}

export async function applyCreativeIntelligenceToIndustrialChain(
  orgId: string,
  projectId: string,
): Promise<CreativeIntelligenceApplication | null> {
  const insights = await listCreativeInsights(orgId, projectId, 20);
  if (insights.length === 0) return null;
  const snapshot = await getCreativeIntelligenceSnapshot(orgId, projectId);
  const topInsights = insights.slice(0, 5);
  const benchmarkAsset = await addContentAsset(orgId, {
    projectId,
    type: 'benchmark',
    title: `Creative intelligence benchmark: ${projectId}`,
    source: 'creative-intelligence',
    tags: ['creative-intelligence', snapshot.topPlatform || 'multi-platform', snapshot.topHookType || 'unknown-hook'],
    evidence: [
      `Insights: ${snapshot.insightCount}`,
      `Competitor accounts: ${snapshot.competitorAccountCount}`,
      `Trend/rank signals: ${snapshot.trendRankCount}`,
      `Top hook: ${snapshot.topHookType || 'unknown'}`,
      `Top pacing: ${snapshot.topPacing || 'unknown'}`,
      `Views: ${snapshot.totalViews}`,
      `Sales: ${snapshot.totalSales}`,
      `Revenue: ${snapshot.totalRevenue}`,
      `Creative opportunities: ${snapshot.opportunityCount}`,
      `Average confidence: ${snapshot.averageConfidenceScore}`,
      `Pattern clusters: ${snapshot.patternClusterCount}`,
      `Cross-source patterns: ${snapshot.crossSourcePatternCount}`,
      `Creative moat score: ${snapshot.creativeMoatScore}`,
      `Opportunity backlog: ${snapshot.opportunityBacklogCount}`,
      `Ready opportunities: ${snapshot.readyOpportunityCount}`,
      ...topInsights.map(item => `Signal: ${item.platform} / ${item.title} / ${item.reusableAngle}`),
      ...snapshot.patternClusters.slice(0, 3).map(item => `Pattern cluster: ${item.id} / score ${item.evidenceScore} / ${item.synthesis}`),
      ...snapshot.opportunityBacklog.slice(0, 3).map(item => `Backlog: ${item.id} / ${item.priority} / ${item.readiness} / repeatability ${item.repeatabilityScore} / missing ${item.missingEvidence.join('; ') || 'none'}`),
      ...snapshot.opportunityMap.slice(0, 5).map(item => `Opportunity: ${item.insightId} / ${item.funnelStage} / ${item.primaryMetric} / confidence ${item.confidenceScore}`),
    ].join('\n').slice(0, 2000),
    approvalStatus: 'approved',
    rightsStatus: 'owned',
    reusable: true,
  });
  const scriptAsset = await addContentAsset(orgId, {
    projectId,
    type: 'script',
    title: `Script angles from creative intelligence: ${projectId}`,
    source: 'creative-intelligence',
    parentAssetId: benchmarkAsset.id,
    tags: ['script-angle', snapshot.topHookType || 'unknown-hook', snapshot.topPacing || 'unknown-pacing'],
    evidence: [
      `Preferred hook: ${snapshot.brandLearningProfile.preferredHookType || 'unknown'}`,
      `Preferred pacing: ${snapshot.brandLearningProfile.preferredPacing || 'unknown'}`,
      'Next test angles:',
      ...snapshot.brandLearningProfile.nextTestAngles.map(item => `- ${item}`),
      'Production runbook:',
      ...snapshot.opportunityMap.slice(0, 5).map(item => `- ${item.productionInstruction}`),
      'Distribution runbook:',
      ...snapshot.opportunityMap.slice(0, 5).map(item => `- ${item.distributionInstruction}`),
      'Pattern cluster runbook:',
      ...snapshot.patternClusters.slice(0, 3).map(item => `- ${item.nextProductionMove} / ${item.distributionTest}`),
      'Opportunity backlog runbook:',
      ...snapshot.opportunityBacklog.slice(0, 5).map(item => `- ${item.priority} ${item.readiness}: ${item.productionMove} / missing evidence: ${item.missingEvidence.join('; ') || 'none'} / ${item.acceptance}`),
      snapshot.brandLearningProfile.avoidPatterns.length ? 'Avoid patterns:' : '',
      ...snapshot.brandLearningProfile.avoidPatterns.map(item => `- ${item}`),
    ].filter(Boolean).join('\n').slice(0, 2000),
    approvalStatus: 'approved',
    rightsStatus: 'owned',
    reusable: true,
  });
  const accounts = await listChannelAccounts(orgId, projectId, 50);
  const availableAccounts = accounts.filter(account =>
    (account.authorizationStatus === 'manual_ready' || account.authorizationStatus === 'oauth_ready') &&
    (account.healthStatus === 'healthy' || account.healthStatus === 'warmup') &&
    account.scheduledCount < account.dailyPublishLimit,
  );
  const opportunities = snapshot.opportunityMap.slice(0, Math.max(1, Math.min(availableAccounts.length || 1, 3)));
  const experimentPlans = await Promise.all(opportunities.map((opportunity, index) => {
    const account = availableAccounts[index % Math.max(availableAccounts.length, 1)];
    const channel = account?.platform || opportunity.platform || snapshot.topPlatform || 'TikTok Shop';
    return addDistributionPlan(orgId, {
      projectId,
      channel,
      assetIds: [benchmarkAsset.id, scriptAsset.id],
      status: account ? 'ready' : 'draft',
      scheduledAt: scheduledAtForExperiment(index),
      nextReviewAt: scheduledAtForExperiment(index + 6),
      owner: account?.handle || 'creative-ops',
      utmCode: `wenai_${projectId}_${opportunity.insightId}`.replace(/[^a-zA-Z0-9_]/g, '_').slice(0, 160),
      returnMetric: [
        'CTR / orders / revenue',
        account ? `channel_account=${account.handle}` : 'channel_account=manual',
        `creative_insight_id=${opportunity.insightId}`,
        `creative_opportunity_id=${opportunity.insightId}`,
        `stage=${opportunity.funnelStage}`,
      ].join(' / '),
    });
  }));
  const distributionDispatches = availableAccounts.length
    ? await Promise.all(experimentPlans.map((plan, index) => createDistributionDispatch(orgId, {
      planId: plan.id,
      providerAdapter: {
        mode: availableAccounts[index % availableAccounts.length].authorizationStatus === 'oauth_ready' ? 'provider' : 'manual',
        configured: availableAccounts[index % availableAccounts.length].authorizationStatus === 'oauth_ready',
        providerName: availableAccounts[index % availableAccounts.length].authorizationStatus === 'oauth_ready' ? plan.channel : undefined,
        blocker: availableAccounts[index % availableAccounts.length].authorizationStatus === 'oauth_ready'
          ? undefined
          : 'Manual-ready account requires operator publish confirmation before automatic platform dispatch.',
      },
      notes: `Creative experiment from insight schedule for ${plan.utmCode}.`,
    })))
    : [];
  return {
    benchmarkAsset,
    scriptAsset,
    distributionPlan: experimentPlans[0],
    experimentPlans,
    distributionDispatches,
    channelSlotCount: availableAccounts.reduce((sum, account) => sum + Math.max(0, account.dailyPublishLimit - account.scheduledCount), 0),
  };
}

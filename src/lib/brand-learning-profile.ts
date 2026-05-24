import {
  addContentAsset,
  addDistributionPlan,
  listContentAssets,
  listPerformanceReturns,
  type ContentAssetRecord,
  type DistributionPlanRecord,
} from '@/lib/industrial-chain-store';
import {
  listCreativeInsights,
  type CreativeHookType,
  type CreativePacing,
} from '@/lib/creative-intelligence';

export interface BrandLearningProfile {
  orgId: string;
  projectId: string;
  creativeSignalCount: number;
  performanceSignalCount: number;
  approvedDeliverableCount: number;
  winningAssetRefs: string[];
  preferredHookType: CreativeHookType | null;
  preferredPacing: CreativePacing | null;
  preferredPlatforms: string[];
  approvedAssetPatterns: string[];
  avoidPatterns: string[];
  nextCreativeRules: string[];
  nextDistributionRules: string[];
  missingLinks: string[];
  nextActions: string[];
}

export interface BrandLearningApplication {
  profile: BrandLearningProfile;
  learningAsset: ContentAssetRecord;
  scriptAsset: ContentAssetRecord;
  distributionPlan: DistributionPlanRecord;
}

function pickWeightedTop<T extends string>(items: Array<{ value: T; weight: number }>, ignored: T[] = []): T | null {
  const counts = new Map<T, number>();
  for (const item of items) {
    if (!item.value || ignored.includes(item.value)) continue;
    counts.set(item.value, (counts.get(item.value) || 0) + Math.max(1, item.weight));
  }
  let top: T | null = null;
  let score = 0;
  for (const [value, valueScore] of counts.entries()) {
    if (valueScore > score) {
      top = value;
      score = valueScore;
    }
  }
  return top;
}

function uniq(items: string[], limit: number) {
  return Array.from(new Set(items.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function assetPattern(asset: ContentAssetRecord) {
  const tags = asset.tags.length ? ` tags=${asset.tags.join(',')}` : '';
  return `${asset.type}:${asset.title}${tags}`.slice(0, 240);
}

export async function getBrandLearningProfile(orgId: string, projectId = 'default-project'): Promise<BrandLearningProfile> {
  const [insights, assets, performanceReturns] = await Promise.all([
    listCreativeInsights(orgId, projectId, 200),
    listContentAssets(orgId, projectId, 200),
    listPerformanceReturns(orgId, projectId, 100),
  ]);
  const approvedDeliverables = assets.filter(asset =>
    (asset.type === 'image' || asset.type === 'video' || asset.type === 'script') &&
    asset.deliveryStatus === 'approved' &&
    Boolean(asset.clientApprovedAt),
  );
  const scaleDecisions = performanceReturns.flatMap(record =>
    record.decisions.filter(decision => decision.decision === 'scale'),
  );
  const iterateDecisions = performanceReturns.flatMap(record =>
    record.decisions.filter(decision => decision.decision === 'iterate'),
  );
  const pauseDecisions = performanceReturns.flatMap(record =>
    record.decisions.filter(decision => decision.decision === 'pause'),
  );
  const preferredHookType = pickWeightedTop(
    insights.map(item => ({
      value: item.hookType,
      weight: (item.metrics.sales || 0) * 6 + (item.metrics.revenue || 0) / 100 + (item.metrics.views || 0) / 1000,
    })),
    ['unknown'],
  );
  const preferredPacing = pickWeightedTop(
    insights.map(item => ({
      value: item.pacing,
      weight: (item.metrics.sales || 0) * 6 + (item.metrics.revenue || 0) / 100 + (item.metrics.views || 0) / 1000,
    })),
    ['unknown'],
  );
  const preferredPlatforms = uniq([
    ...scaleDecisions.map(item => item.row.platform),
    ...insights
      .sort((a, b) => ((b.metrics.sales || 0) + (b.metrics.revenue || 0) / 100) - ((a.metrics.sales || 0) + (a.metrics.revenue || 0) / 100))
      .map(item => item.platform),
  ], 5);
  const approvedAssetPatterns = uniq(approvedDeliverables.map(assetPattern), 8);
  const winningAssetRefs = uniq(scaleDecisions.map(item => item.row.asset), 12);
  const avoidPatterns = uniq([
    ...pauseDecisions.map(item => `${item.row.platform}:${item.row.asset}`),
    ...insights.flatMap(item => item.riskNotes),
  ], 10);
  const nextCreativeRules = uniq([
    preferredHookType ? `Use ${preferredHookType} hook as the default first-frame structure.` : '',
    preferredPacing ? `Keep pacing ${preferredPacing} unless the target platform demands another tempo.` : '',
    ...scaleDecisions.slice(0, 3).map(item => `Reuse winning asset "${item.row.asset}" angle for adjacent SKU tests.`),
    ...iterateDecisions.slice(0, 3).map(item => `Rewrite hook for "${item.row.asset}" but keep its audience or selling point.`),
    ...approvedAssetPatterns.slice(0, 3).map(item => `Preserve approved client pattern: ${item}.`),
  ], 10);
  const nextDistributionRules = uniq([
    preferredPlatforms[0] ? `Schedule the next batch first on ${preferredPlatforms[0]}.` : '',
    ...scaleDecisions.slice(0, 3).map(item => `Raise budget or SKU coverage for ${item.row.platform}:${item.row.asset}.`),
    ...pauseDecisions.slice(0, 3).map(item => `Pause or cap ${item.row.platform}:${item.row.asset} until the hook is replaced.`),
  ], 10);
  const missingLinks = [
    insights.length === 0 ? 'Missing creative insight signals for brand learning' : '',
    performanceReturns.length === 0 ? 'Missing performance returns for brand learning' : '',
    approvedDeliverables.length === 0 ? 'Missing client-approved deliverables for brand learning' : '',
    scaleDecisions.length === 0 ? 'Missing scale decisions to identify winning assets' : '',
    !preferredHookType ? 'Missing preferred hook from weighted creative signals' : '',
    !preferredPacing ? 'Missing preferred pacing from weighted creative signals' : '',
  ].filter(Boolean);

  return {
    orgId,
    projectId,
    creativeSignalCount: insights.length,
    performanceSignalCount: performanceReturns.length,
    approvedDeliverableCount: approvedDeliverables.length,
    winningAssetRefs,
    preferredHookType,
    preferredPacing,
    preferredPlatforms,
    approvedAssetPatterns,
    avoidPatterns,
    nextCreativeRules,
    nextDistributionRules,
    missingLinks,
    nextActions: missingLinks.map(item => `Close brand learning gap: ${item}`),
  };
}

export async function materializeBrandLearningProfile(orgId: string, projectId = 'default-project'): Promise<BrandLearningApplication | null> {
  const profile = await getBrandLearningProfile(orgId, projectId);
  if (profile.creativeSignalCount === 0 && profile.performanceSignalCount === 0 && profile.approvedDeliverableCount === 0) {
    return null;
  }
  const learningAsset = await addContentAsset(orgId, {
    projectId,
    type: 'report',
    title: `Brand learning profile: ${projectId}`,
    source: 'brand-learning-profile',
    tags: ['brand-learning', profile.preferredHookType || 'unknown-hook', profile.preferredPacing || 'unknown-pacing'],
    evidence: [
      `Creative signals: ${profile.creativeSignalCount}`,
      `Performance returns: ${profile.performanceSignalCount}`,
      `Approved deliverables: ${profile.approvedDeliverableCount}`,
      `Preferred platforms: ${profile.preferredPlatforms.join(',') || 'unknown'}`,
      `Winning assets: ${profile.winningAssetRefs.join(',') || 'unknown'}`,
      'Creative rules:',
      ...profile.nextCreativeRules.map(item => `- ${item}`),
      'Distribution rules:',
      ...profile.nextDistributionRules.map(item => `- ${item}`),
      profile.avoidPatterns.length ? 'Avoid patterns:' : '',
      ...profile.avoidPatterns.map(item => `- ${item}`),
    ].filter(Boolean).join('\n').slice(0, 2000),
    approvalStatus: profile.missingLinks.length === 0 ? 'approved' : 'review',
    rightsStatus: 'owned',
    reusable: true,
  });
  const scriptAsset = await addContentAsset(orgId, {
    projectId,
    type: 'script',
    title: `Next scripts from brand learning: ${projectId}`,
    source: 'brand-learning-profile',
    parentAssetId: learningAsset.id,
    tags: ['script-angle', 'brand-learning', profile.preferredHookType || 'unknown-hook'],
    evidence: profile.nextCreativeRules.join('\n').slice(0, 2000) || 'Brand learning profile needs more signals before script rules are reliable.',
    approvalStatus: 'review',
    rightsStatus: 'owned',
    reusable: true,
  });
  const distributionPlan = await addDistributionPlan(orgId, {
    projectId,
    channel: profile.preferredPlatforms[0] || 'manual-channel',
    assetIds: [learningAsset.id, scriptAsset.id],
    status: 'draft',
    owner: 'brand-ops',
    returnMetric: 'CTR / orders / revenue / approved_pattern_id / brand_learning_profile',
  });
  return { profile, learningAsset, scriptAsset, distributionPlan };
}

import {
  addContentAsset,
  getContentAsset,
  updateDistributionPlanAssets,
  updateDistributionDispatch,
  type ContentAssetRecord,
  type DistributionDispatchRecord,
  type DistributionPlanRecord,
} from '@/lib/industrial-chain-store';
import { createIndustrialReviewLink, getIndustrialReviewPortalView, type IndustrialReviewPortalView } from '@/lib/industrial-review-portal';
import type { KuaiziProductionTask } from '@/lib/kuaizi-shared';

export interface IndustrialProductionResultInput {
  projectId: string;
  sku?: string;
  sourceHandoffAssetId?: string;
  dispatchId?: string;
  channel?: string;
  clientReviewUrl?: string;
  createReviewLinks?: boolean;
  reviewTtlDays?: number;
  task: KuaiziProductionTask;
}

export interface IndustrialProductionResult {
  assets: ContentAssetRecord[];
  dispatch: DistributionDispatchRecord | null;
  distributionPlan: DistributionPlanRecord | null;
  reviewLinks: IndustrialReviewPortalView[];
  blockedReason?: string;
}

function inferAssetType(url: string): 'image' | 'video' {
  return /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(url) ? 'video' : 'image';
}

function taskEvidence(input: IndustrialProductionResultInput, url: string) {
  return [
    `Provider task: ${input.task.taskId}`,
    `Task status: ${input.task.status}`,
    input.sourceHandoffAssetId ? `Source handoff asset: ${input.sourceHandoffAssetId}` : '',
    `Result URL: ${url}`,
  ].filter(Boolean).join('\n');
}

export async function ingestIndustrialProductionResult(
  orgId: string,
  input: IndustrialProductionResultInput,
): Promise<IndustrialProductionResult> {
  const urls = input.task.assetUrls.map(item => item.trim()).filter(Boolean).slice(0, 50);
  if (input.task.status !== 'completed') {
    return {
      assets: [],
      dispatch: null,
      distributionPlan: null,
      reviewLinks: [],
      blockedReason: `Task ${input.task.taskId} is ${input.task.status}; only completed tasks can create publishable assets.`,
    };
  }
  if (urls.length === 0) {
    return {
      assets: [],
      dispatch: null,
      distributionPlan: null,
      reviewLinks: [],
      blockedReason: `Task ${input.task.taskId} completed without asset URLs.`,
    };
  }

  const assets = await Promise.all(urls.map((url, index) => addContentAsset(orgId, {
    projectId: input.projectId,
    sku: input.sku,
    type: inferAssetType(url),
    title: `${input.channel || 'Production'} result ${index + 1} from ${input.task.taskId}`,
    url,
    source: 'kuaizi-production-result',
    tags: ['production-result', input.task.taskId, input.channel || '', input.sourceHandoffAssetId || ''].filter(Boolean),
    evidence: taskEvidence(input, url),
    deliveryStatus: input.clientReviewUrl ? 'client_review' : 'internal_review',
    clientReviewUrl: input.clientReviewUrl,
  })));
  const reviewLinks = input.createReviewLinks
    ? (await Promise.all(assets.map(asset => createIndustrialReviewLink(orgId, {
      assetId: asset.id,
      ttlDays: input.reviewTtlDays || 14,
    })))).filter(Boolean).map(link => getIndustrialReviewPortalView(link!))
    : [];
  const reviewedAssets = reviewLinks.length > 0
    ? (await Promise.all(assets.map(asset => getContentAsset(orgId, asset.id)))).filter(Boolean) as ContentAssetRecord[]
    : assets;

  const dispatch = input.dispatchId
    ? await updateDistributionDispatch(orgId, input.dispatchId, {
      status: 'published',
      resultUrls: urls,
      assetIds: reviewedAssets.map(asset => asset.id),
      notes: `Production result ${input.task.taskId} attached to dispatch.`,
    })
    : null;
  const distributionPlan = dispatch
    ? await updateDistributionPlanAssets(orgId, dispatch.planId, reviewedAssets.map(asset => asset.id))
    : null;

  return { assets: reviewedAssets, dispatch, distributionPlan, reviewLinks };
}

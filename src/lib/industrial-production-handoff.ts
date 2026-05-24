import {
  addContentAsset,
  addDistributionPlan,
  createDistributionDispatch,
  type ContentAssetRecord,
  type DistributionDispatchRecord,
  type DistributionPlanRecord,
} from '@/lib/industrial-chain-store';
import type { ProductionHandoffPack } from '@/lib/production-handoff-pack';

export interface IndustrialProductionHandoffInput {
  projectId: string;
  sku?: string;
  source?: string;
  owner?: string;
  createDistributionPlans?: boolean;
  createDispatches?: boolean;
  handoffPack: Pick<ProductionHandoffPack, 'status' | 'statusLabel' | 'selectedBrief' | 'evidence' | 'platformSpecs' | 'markdown'>;
}

export interface IndustrialProductionHandoffResult {
  asset: ContentAssetRecord;
  distributionPlans: DistributionPlanRecord[];
  distributionDispatches: DistributionDispatchRecord[];
}

function compactEvidence(pack: IndustrialProductionHandoffInput['handoffPack']) {
  return [
    `Status: ${pack.statusLabel}`,
    `Brief: ${pack.selectedBrief.platform} / ${pack.selectedBrief.contentType}`,
    `Hook: ${pack.selectedBrief.hook}`,
    ...pack.evidence.slice(0, 5),
  ].join('\n').slice(0, 2000);
}

function packTitle(input: IndustrialProductionHandoffInput) {
  const hook = input.handoffPack.selectedBrief.hook.trim();
  const platform = input.handoffPack.selectedBrief.platform.trim();
  return `${platform || 'Commerce'} production handoff: ${hook || input.projectId}`.slice(0, 200);
}

export async function createIndustrialProductionHandoff(
  orgId: string,
  input: IndustrialProductionHandoffInput,
): Promise<IndustrialProductionHandoffResult> {
  const asset = await addContentAsset(orgId, {
    projectId: input.projectId,
    sku: input.sku,
    type: 'production_handoff',
    title: packTitle(input),
    source: input.source || 'production-handoff-pack',
    tags: [
      'production-handoff',
      input.handoffPack.status,
      input.handoffPack.selectedBrief.platform,
      ...input.handoffPack.platformSpecs.map(spec => spec.platform),
    ],
    evidence: compactEvidence(input.handoffPack),
    url: input.handoffPack.markdown.startsWith('http') ? input.handoffPack.markdown : undefined,
  });

  const distributionPlans = input.createDistributionPlans === false
    ? []
    : await Promise.all(input.handoffPack.platformSpecs.slice(0, 5).map(spec => addDistributionPlan(orgId, {
      projectId: input.projectId,
      channel: spec.platform,
      assetIds: [asset.id],
      status: 'ready',
      owner: input.owner,
      returnMetric: spec.returnMetrics.join(' / '),
    })));

  const distributionDispatches = input.createDispatches === false
    ? []
    : await Promise.all(distributionPlans.map(plan => createDistributionDispatch(orgId, {
      planId: plan.id,
      providerAdapter: {
        mode: 'manual',
        configured: false,
        blocker: 'No platform publishing adapter configured; production handoff is ready for manual channel execution.',
      },
      notes: `Created from production handoff asset ${asset.id}.`,
    })));

  return { asset, distributionPlans, distributionDispatches };
}

import { describe, expect, it } from 'vitest';
import { POST } from '@/app/api/industrial-chain/production-handoff/route';
import { createListingProject, createRunFromProject, type ListingProjectInput } from '@/lib/listing-factory-engine';
import { createIndustrialProductionHandoff } from '@/lib/industrial-production-handoff';
import {
  getIndustrializationSnapshot,
  listContentAssets,
  listDistributionDispatches,
  listDistributionPlans,
} from '@/lib/industrial-chain-store';
import { buildProductionHandoffPack } from '@/lib/production-handoff-pack';

const projectInput: ListingProjectInput = {
  productName: 'Portable Pet Slow Feeder',
  category: 'Pet supplies',
  targetPlatforms: ['TikTok', 'Amazon', 'Shopify'],
  priceBand: '$19-$29',
  sellingPoints: ['foldable travel bowl', 'slower feeding pace', 'easy to clean'],
  targetAudience: 'cross-border pet owners who travel with small dogs',
  contentGoal: 'validate first purchase intent',
  brandGuardrails: ['no medical claims', 'no guaranteed result'],
  categoryRules: ['show pet size fit', 'show cleaning method'],
  competitorNotes: 'Use category patterns without naming competitors.',
};

function productionPack() {
  const project = createListingProject(projectInput, new Date('2026-05-12T09:00:00Z'));
  return buildProductionHandoffPack(createRunFromProject(project, new Date('2026-05-12T09:00:00Z')));
}

describe('industrial production handoff ingestion', () => {
  it('persists a production handoff pack as an industrial asset and distribution plan set', async () => {
    const orgId = `handoff-ingest-${Date.now()}`;
    const projectId = `project-handoff-${Date.now()}`;
    const pack = productionPack();

    const result = await createIndustrialProductionHandoff(orgId, {
      projectId,
      owner: 'ops',
      handoffPack: pack,
    });

    expect(result.asset.type).toBe('production_handoff');
    expect(result.asset.evidence).toContain('Status:');
    expect(result.distributionPlans.map(plan => plan.channel)).toEqual(['TikTok', 'Amazon', 'Shopify']);
    expect(result.distributionDispatches).toHaveLength(3);
    expect(result.distributionDispatches.every(dispatch => dispatch.status === 'manual_ready')).toBe(true);

    await expect(listContentAssets(orgId, projectId)).resolves.toMatchObject([{ type: 'production_handoff' }]);
    await expect(listDistributionPlans(orgId, projectId)).resolves.toHaveLength(3);
    await expect(listDistributionDispatches(orgId, projectId)).resolves.toHaveLength(3);
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(snapshot.assetCount).toBe(1);
    expect(snapshot.readyPlanCount).toBe(3);
    expect(snapshot.dispatchCount).toBe(3);
    expect(snapshot.executableDispatchCount).toBe(3);
    expect(snapshot.missingLinks).not.toContain('Missing production brief or script asset');
    expect(snapshot.missingLinks).not.toContain('Missing distribution dispatch record');
  });

  it('serves production handoff ingestion through the API without fake provider execution', async () => {
    const orgId = `handoff-api-${Date.now()}`;
    const projectId = `project-handoff-api-${Date.now()}`;
    const response = await POST(new Request('http://localhost/api/industrial-chain/production-handoff', {
      method: 'POST',
      headers: { 'x-tenant-id': orgId },
      body: JSON.stringify({
        projectId,
        owner: 'ops',
        handoffPack: productionPack(),
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.asset.type).toBe('production_handoff');
    expect(body.distributionPlans.length).toBe(3);
    expect(body.distributionDispatches.length).toBe(3);
    expect(body.distributionDispatches[0].providerAdapter.blocker).toContain('manual channel execution');
    expect(JSON.stringify(body)).not.toMatch(/api[_-]?key|token|secret/i);
  });

  it('returns Chinese validation messages for incomplete production handoff packs', async () => {
    const response = await POST(new Request('http://localhost/api/industrial-chain/production-handoff', {
      method: 'POST',
      headers: { 'x-tenant-id': `handoff-validation-${Date.now()}` },
      body: JSON.stringify({
        projectId: 'project-handoff-validation',
        handoffPack: { markdown: '# Missing selected brief', platformSpecs: [], evidence: [] },
      }),
    }) as unknown as Parameters<typeof POST>[0]);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe('selected_brief_required');
    expect(body.message).toContain('缺少已选 brief');
  });

  it('can keep production ingestion as asset and plans only when dispatch creation is disabled', async () => {
    const orgId = `handoff-no-dispatch-${Date.now()}`;
    const projectId = `project-handoff-no-dispatch-${Date.now()}`;
    const result = await createIndustrialProductionHandoff(orgId, {
      projectId,
      owner: 'ops',
      createDispatches: false,
      handoffPack: productionPack(),
    });

    expect(result.distributionPlans).toHaveLength(3);
    expect(result.distributionDispatches).toHaveLength(0);
    const snapshot = await getIndustrializationSnapshot(orgId, projectId);
    expect(snapshot.missingLinks).toContain('Missing distribution dispatch record');
  });
});

import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import {
  buildRestaurantCapabilityTrainingPlan,
  clearRestaurantCapabilityTrainingRecordsForTest,
} from '@/lib/restaurant-capability-training';

function jsonRequest(body: unknown) {
  return new NextRequest('http://localhost/api/restaurant-agent/runtime', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('restaurant agent capability training route', () => {
  afterEach(() => {
    clearRestaurantCapabilityTrainingRecordsForTest();
  });

  it('returns a structured capability training plan through the runtime API', async () => {
    const basePlan = buildRestaurantCapabilityTrainingPlan();
    const qaBase = basePlan.items.find(item => item.id === 'cross-platform-operating-qa');
    expect(qaBase).toBeDefined();

    const response = await POST(jsonRequest({
      action: 'capability-training-plan',
      availableMaterials: qaBase?.trainingMaterials,
      configuredProviders: qaBase?.externalProviders.slice(0, 1),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.capabilityTrainingPlan.payloadShape).toBe('restaurant-capability-training-plan');
    expect(payload.capabilityTrainingPlan.summary.total).toBe(5);
    expect(payload.capabilityTrainingPlan.items[0]).toEqual(expect.objectContaining({
      id: 'cross-platform-operating-qa',
      status: 'provider-gated',
      missingTrainingMaterials: [],
      missingExternalProviders: qaBase?.externalProviders.slice(1),
    }));
    expect(payload.trainingRecords).toEqual([]);
    expect(payload.capabilityTrainingPlan.safetyBoundary).toContain('Provider');
  });

  it('returns the Claw skill catalog through the runtime API', async () => {
    const response = await POST(jsonRequest({ action: 'claw-skill-catalog' }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.clawSkillCatalog.payloadShape).toBe('restaurant-claw-skill-catalog');
    expect(payload.clawSkillCatalog.summary).toEqual(expect.objectContaining({
      modules: 20,
      skills: 200,
      tools: 60,
    }));
    expect(payload.clawSkillCatalog.nextInternalTraining.length).toBeGreaterThan(0);
    expect(payload.clawSkillCatalog.externalSetupRequests.length).toBeGreaterThan(0);
    expect(payload.clawSkillCatalog.safetyBoundary).toContain('外部服务接入');
  });

  it('returns an actionable Claw training batch through the runtime API', async () => {
    const response = await POST(jsonRequest({
      action: 'claw-training-batch',
      internalLimit: 5,
      providerLimit: 3,
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.clawTrainingBatch.payloadShape).toBe('restaurant-claw-training-batch');
    expect(payload.clawTrainingBatch.summary).toEqual(expect.objectContaining({
      internalTrainingTasks: 5,
      providerUnlockTasks: 3,
    }));
    expect(payload.clawTrainingBatch.internalTrainingTasks[0]).toEqual(expect.objectContaining({
      moduleId: 'brand-positioning',
      owner: 'marketing',
    }));
    expect(payload.clawTrainingBatch.providerUnlockTasks[0].evidenceRequired).toContain('configured');
    expect(payload.clawTrainingBatch.safetyBoundary).toContain('不会代发');
  });

  it('returns a benchmark strategy for choosing the restaurant product spine', async () => {
    const response = await POST(jsonRequest({ action: 'benchmark-strategy' }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.ok).toBe(true);
    expect(payload.benchmarkStrategy.payloadShape).toBe('restaurant-benchmark-strategy');
    expect(payload.benchmarkStrategy.recommendation).toBe('kuaizi-platform-spine-plus-claw-agent-layer');
    expect(payload.benchmarkStrategy.candidates.map((item: { id: string }) => item.id)).toEqual([
      'kuaizi-platform',
      'claw-agent',
      'restaurant-saas',
    ]);
    expect(payload.benchmarkStrategy.nextBuildOrder.map((item: { id: string }) => item.id)).toContain('platform-spine-ledger');
    expect(payload.benchmarkStrategy.safetyBoundary).toContain('不代表外部平台');
  });

  it('accepts a safe capability training record and rebuilds the plan from the ledger', async () => {
    const basePlan = buildRestaurantCapabilityTrainingPlan();
    const publishBase = basePlan.items.find(item => item.id === 'auto-publish-receipts');
    expect(publishBase).toBeDefined();
    const [firstMaterial, ...otherMaterials] = publishBase?.trainingMaterials || [];

    const response = await POST(jsonRequest({
      action: 'capability-training-record',
      kind: 'material',
      capabilityId: 'auto-publish-receipts',
      name: firstMaterial,
      owner: 'ops',
      source: 'manual',
      evidenceSummary: 'Store approved this publishing checklist for public platform posts.',
      availableMaterials: otherMaterials,
      configuredProviders: publishBase?.externalProviders.slice(0, 1),
    }));
    const payload = await response.json();
    const publish = payload.capabilityTrainingPlan.items.find((item: { id: string }) => item.id === 'auto-publish-receipts');

    expect(response.status).toBe(201);
    expect(payload.ok).toBe(true);
    expect(payload.trainingRecord).toEqual(expect.objectContaining({
      accepted: true,
      capabilityId: 'auto-publish-receipts',
      name: firstMaterial,
    }));
    expect(payload.trainingRecords).toHaveLength(1);
    expect(publish).toEqual(expect.objectContaining({
      status: 'provider-gated',
      missingTrainingMaterials: [],
    }));
  });

  it('rejects sensitive capability training records through the runtime API', async () => {
    const basePlan = buildRestaurantCapabilityTrainingPlan();
    const publishBase = basePlan.items.find(item => item.id === 'auto-publish-receipts');
    expect(publishBase).toBeDefined();
    const [firstMaterial, ...otherMaterials] = publishBase?.trainingMaterials || [];

    const response = await POST(jsonRequest({
      action: 'capability-training-record',
      kind: 'material',
      capabilityId: 'auto-publish-receipts',
      name: firstMaterial,
      evidenceSummary: 'token=private-session should be blocked before storage.',
      availableMaterials: otherMaterials,
      configuredProviders: publishBase?.externalProviders.slice(0, 1),
    }));
    const payload = await response.json();
    const publish = payload.capabilityTrainingPlan.items.find((item: { id: string }) => item.id === 'auto-publish-receipts');

    expect(response.status).toBe(422);
    expect(payload.ok).toBe(false);
    expect(payload.trainingRecord).toEqual(expect.objectContaining({
      accepted: false,
      rejectedReason: 'capability_training_record_contains_sensitive_or_private_content',
    }));
    expect(publish.missingTrainingMaterials).toContain(firstMaterial);
  });
});

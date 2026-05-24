import { afterEach, describe, expect, it } from 'vitest';

import {
  buildRestaurantCapabilityTrainingPlan,
  buildRestaurantCapabilityTrainingPlanFromLedger,
  clearRestaurantCapabilityTrainingRecordsForTest,
  listRestaurantCapabilityTrainingRecords,
  recordRestaurantCapabilityTrainingRecord,
} from '@/lib/restaurant-capability-training';

describe('restaurant capability training plan', () => {
  afterEach(() => {
    clearRestaurantCapabilityTrainingRecordsForTest();
  });

  it('turns Claw-grade capabilities into trainable materials and provider gates', () => {
    const plan = buildRestaurantCapabilityTrainingPlan();

    expect(plan.payloadShape).toBe('restaurant-capability-training-plan');
    expect(plan.summary.total).toBe(5);
    expect(plan.summary.trainableNow).toBe(5);
    expect(plan.summary.providerGated).toBe(0);
    expect(plan.summary.activationReady).toBe(0);
    expect(plan.items.map(item => item.id)).toEqual([
      'cross-platform-operating-qa',
      'auto-publish-receipts',
      'auto-acquisition-followup',
      'redemption-operating-analytics',
      'layered-memory-evolution',
    ]);

    const publish = plan.items.find(item => item.id === 'auto-publish-receipts');
    expect(publish).toEqual(expect.objectContaining({
      competitorPattern: 'OpenClaw',
      status: 'trainable-now',
      externalProviders: expect.arrayContaining(['Runner URL', 'callback secret']),
    }));
    expect(plan.safetyBoundary).toContain('Provider');
  });

  it('separates finished training from missing external providers', () => {
    const basePlan = buildRestaurantCapabilityTrainingPlan();
    const publishBase = basePlan.items.find(item => item.id === 'auto-publish-receipts');
    expect(publishBase).toBeDefined();

    const plan = buildRestaurantCapabilityTrainingPlan({
      availableMaterials: publishBase?.trainingMaterials,
      configuredProviders: publishBase?.externalProviders.slice(0, 1),
    });
    const publish = plan.items.find(item => item.id === 'auto-publish-receipts');

    expect(publish).toEqual(expect.objectContaining({
      status: 'provider-gated',
      missingTrainingMaterials: [],
      missingExternalProviders: publishBase?.externalProviders.slice(1),
    }));
    expect(plan.summary.providerGated).toBe(1);
    expect(plan.externalSetupRequests.map(item => item.provider)).toEqual(expect.arrayContaining(publishBase?.externalProviders.slice(1, 3) || []));
  });

  it('marks a capability ready only when training and provider gates are both satisfied', () => {
    const basePlan = buildRestaurantCapabilityTrainingPlan();
    const memoryBase = basePlan.items.find(item => item.id === 'layered-memory-evolution');
    expect(memoryBase).toBeDefined();

    const plan = buildRestaurantCapabilityTrainingPlan({
      availableMaterials: memoryBase?.trainingMaterials,
      configuredProviders: memoryBase?.externalProviders,
    });
    const memory = plan.items.find(item => item.id === 'layered-memory-evolution');

    expect(memory).toEqual(expect.objectContaining({
      status: 'activation-ready',
      missingTrainingMaterials: [],
      missingExternalProviders: [],
    }));
    expect(plan.summary.activationReady).toBe(1);
  });

  it('uses accepted ledger training records to satisfy Claw training materials', () => {
    const basePlan = buildRestaurantCapabilityTrainingPlan();
    const publishBase = basePlan.items.find(item => item.id === 'auto-publish-receipts');
    expect(publishBase).toBeDefined();
    const [firstMaterial, ...otherMaterials] = publishBase?.trainingMaterials || [];

    recordRestaurantCapabilityTrainingRecord({
      kind: 'material',
      capabilityId: 'auto-publish-receipts',
      name: firstMaterial,
      owner: 'ops',
      evidenceSummary: 'Dianping and Xiaohongshu publishing template confirmed by the store.',
    }, new Date('2026-05-23T03:00:00.000Z'));

    const plan = buildRestaurantCapabilityTrainingPlanFromLedger({
      availableMaterials: otherMaterials,
      configuredProviders: publishBase?.externalProviders.slice(0, 1),
    });
    const publish = plan.items.find(item => item.id === 'auto-publish-receipts');

    expect(listRestaurantCapabilityTrainingRecords()).toHaveLength(1);
    expect(publish).toEqual(expect.objectContaining({
      status: 'provider-gated',
      missingTrainingMaterials: [],
    }));
  });

  it('rejects sensitive training records before they can train a capability', () => {
    const basePlan = buildRestaurantCapabilityTrainingPlan();
    const publishBase = basePlan.items.find(item => item.id === 'auto-publish-receipts');
    expect(publishBase).toBeDefined();
    const [firstMaterial, ...otherMaterials] = publishBase?.trainingMaterials || [];

    const record = recordRestaurantCapabilityTrainingRecord({
      kind: 'material',
      capabilityId: 'auto-publish-receipts',
      name: firstMaterial,
      evidenceSummary: 'api_key=secret should never be stored in a training ledger.',
    }, new Date('2026-05-23T03:10:00.000Z'));
    const plan = buildRestaurantCapabilityTrainingPlanFromLedger({
      availableMaterials: otherMaterials,
      configuredProviders: publishBase?.externalProviders.slice(0, 1),
    });
    const publish = plan.items.find(item => item.id === 'auto-publish-receipts');

    expect(record.accepted).toBe(false);
    expect(record.rejectedReason).toBe('capability_training_record_contains_sensitive_or_private_content');
    expect(publish?.missingTrainingMaterials).toContain(firstMaterial);
  });
});

import { describe, expect, it } from 'vitest';

import { buildRestaurantClawSkillCatalog, buildRestaurantClawTrainingBatch } from '@/lib/restaurant-claw-skill-catalog';

describe('restaurant claw skill catalog', () => {
  it('materializes the claimed module, skill, and tool scale as auditable structured data', () => {
    const catalog = buildRestaurantClawSkillCatalog();

    expect(catalog.payloadShape).toBe('restaurant-claw-skill-catalog');
    expect(catalog.summary.modules).toBe(20);
    expect(catalog.summary.skills).toBe(200);
    expect(catalog.summary.tools).toBe(60);
    expect(catalog.modules).toHaveLength(20);
    expect(catalog.modules.every(module => module.skills.length === 10)).toBe(true);
    expect(catalog.tools.length).toBeGreaterThanOrEqual(50);
    expect(catalog.summary.internalReadySkills).toBeGreaterThan(0);
    expect(catalog.summary.trainingNeededSkills).toBeGreaterThan(0);
    expect(catalog.summary.providerGatedSkills).toBeGreaterThan(0);
  });

  it('keeps provider-gated automation explicit instead of pretending external execution is ready', () => {
    const catalog = buildRestaurantClawSkillCatalog();

    expect(catalog.externalSetupRequests.length).toBeGreaterThan(0);
    expect(catalog.externalSetupRequests.map(item => item.provider)).toEqual(expect.arrayContaining([
      '平台授权或 Browser Runner',
      'POS/核销/会员导出或 API',
    ]));
    expect(catalog.safetyBoundary).toContain('未配置 Provider');
    expect(catalog.safetyBoundary).toContain('不宣称自动发布');
  });

  it('identifies internal training work without needing merchant credentials', () => {
    const catalog = buildRestaurantClawSkillCatalog();

    expect(catalog.nextInternalTraining).toHaveLength(8);
    expect(catalog.nextInternalTraining[0]).toEqual(expect.objectContaining({
      moduleId: 'brand-positioning',
      owner: 'marketing',
    }));
    expect(JSON.stringify(catalog)).not.toContain('api_key');
    expect(JSON.stringify(catalog)).not.toContain('cookie');
    expect(JSON.stringify(catalog)).not.toContain('token');
  });

  it('turns the catalog into an actionable Claw training batch', () => {
    const batch = buildRestaurantClawTrainingBatch({
      now: new Date('2026-05-23T13:30:00.000Z'),
      internalLimit: 6,
      providerLimit: 4,
    });

    expect(batch.payloadShape).toBe('restaurant-claw-training-batch');
    expect(batch.batchId).toBe('restaurant-claw-training-20260523');
    expect(batch.summary).toEqual(expect.objectContaining({
      internalTrainingTasks: 6,
      providerUnlockTasks: 4,
    }));
    expect(batch.internalTrainingTasks[0]).toEqual(expect.objectContaining({
      moduleId: 'brand-positioning',
      owner: 'marketing',
      evidenceRequired: expect.stringContaining('门店确认人'),
    }));
    expect(batch.providerUnlockTasks[0]).toEqual(expect.objectContaining({
      owner: 'tech',
      evidenceRequired: expect.stringContaining('configured'),
    }));
    expect(batch.dispatchPreview.map(item => item.lane)).toEqual(['training', 'provider']);
    expect(batch.safetyBoundary).toContain('不会自动发布');
    expect(JSON.stringify(batch)).not.toContain('api_key');
    expect(JSON.stringify(batch)).not.toContain('cookie');
    expect(JSON.stringify(batch)).not.toContain('token');
  });
});

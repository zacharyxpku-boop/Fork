import { describe, expect, it } from 'vitest';

import {
  RESTAURANT_GROWTH_LOOP_EXTERNAL_GATES_NOW,
  RESTAURANT_GROWTH_LOOP_INTERNAL_READY_NOW,
  RESTAURANT_GROWTH_LOOP_STAGES,
  RESTAURANT_TODAY_TASK_CARDS,
} from '@/lib/restaurant-growth-loop';

describe('restaurant growth loop model', () => {
  it('defines the six long-term store growth OS stages in order', () => {
    expect(RESTAURANT_GROWTH_LOOP_STAGES.map(stage => stage.id)).toEqual([
      'intake',
      'diagnose',
      'create',
      'publish-proof',
      'recover',
      'review-loop',
    ]);

    expect(RESTAURANT_GROWTH_LOOP_STAGES.map(stage => stage.internalName)).toEqual([
      'Intake',
      'Diagnose',
      'Create',
      'Publish Proof',
      'Recover',
      'Review Loop',
    ]);

    expect(RESTAURANT_GROWTH_LOOP_STAGES.map(stage => stage.customerStage)).toEqual([
      '1 录入',
      '2 诊断',
      '3 生成',
      '4 发布凭证',
      '5 回收',
      '6 复盘',
    ]);
  });

  it('keeps every stage evidence-driven with owner, inputs, outputs, and gates', () => {
    for (const stage of RESTAURANT_GROWTH_LOOP_STAGES) {
      expect(stage.title.length).toBeGreaterThan(0);
      expect(stage.body.length).toBeGreaterThan(0);
      expect(stage.proof.length).toBeGreaterThan(0);
      expect(stage.inputs.length).toBeGreaterThan(0);
      expect(stage.outputs.length).toBeGreaterThan(0);
      expect(stage.evidence.length).toBeGreaterThan(0);
      expect(stage.externalGate.length).toBeGreaterThan(0);
      expect(stage.owner.length).toBeGreaterThan(0);
    }
  });

  it('uses competitor patterns as benchmark signals without claiming Wenai results', () => {
    const benchmarkCopy = RESTAURANT_GROWTH_LOOP_STAGES.map(stage => stage.benchmarkSignal).join('\n');

    expect(benchmarkCopy).toContain('Owner.com');
    expect(benchmarkCopy).toContain('MarketMan');
    expect(benchmarkCopy).toContain('Square Voice AI');
    expect(benchmarkCopy).not.toContain('Wenai 已完成');
    expect(benchmarkCopy).not.toContain('Wenai 自有成绩');
  });

  it('separates what the demo can do from what still needs outside access', () => {
    expect(RESTAURANT_TODAY_TASK_CARDS).toHaveLength(3);
    expect(RESTAURANT_GROWTH_LOOP_INTERNAL_READY_NOW.length).toBeGreaterThanOrEqual(3);
    expect(RESTAURANT_GROWTH_LOOP_EXTERNAL_GATES_NOW.length).toBeGreaterThanOrEqual(3);

    const gates = RESTAURANT_GROWTH_LOOP_EXTERNAL_GATES_NOW.join('\n');
    expect(gates).toContain('不自动发布');
    expect(gates).toContain('不读取后台');
    expect(gates).toContain('不联系顾客');
    expect(gates).toContain('不做真实经营归因');
  });
});

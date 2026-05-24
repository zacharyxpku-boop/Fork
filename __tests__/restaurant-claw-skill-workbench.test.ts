import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantClawSkillWorkbench } from '@/lib/restaurant-claw-skill-workbench';
import { buildRestaurantClawSkillExecutionLedger, clearRestaurantClawSkillExecutionsForTest, recordRestaurantClawSkillExecution } from '@/lib/restaurant-claw-skill-execution-store';

describe('restaurant claw skill workbench', () => {
  beforeEach(() => {
    clearRestaurantClawSkillExecutionsForTest();
  });

  it('turns the Claw catalog into runnable restaurant task packs', () => {
    const workbench = buildRestaurantClawSkillWorkbench({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      audience: 'nearby office lunch guests',
      channels: 'Dianping / WeChat group',
      visitReason: 'fast lunch without queueing',
      constraints: 'no lowest-price claim',
      evidence: 'menu screenshot confirmed',
      now: new Date('2026-05-24T09:00:00.000Z'),
    });

    expect(workbench.payloadShape).toBe('restaurant-claw-skill-workbench-v1');
    expect(workbench.summary.modules).toBe(6);
    expect(workbench.summary.runnableNow).toBeGreaterThan(0);
    expect(workbench.summary.trainingNeeded).toBeGreaterThan(0);
    expect(workbench.summary.providerGated).toBeGreaterThan(0);
    expect(workbench.deliverables.map(item => item.id)).toEqual([
      'internal-store-task-pack',
      'training-backlog',
      'provider-unlock-backlog',
    ]);
    expect(workbench.workbench[0].inputRequired.join(' ')).toContain('North City Noodles');
    expect(workbench.safetyBoundary).toContain('does not log in, publish');
  });

  it('records generated skill packs into an execution ledger', () => {
    const workbench = buildRestaurantClawSkillWorkbench({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      now: new Date('2026-05-24T09:00:00.000Z'),
    });
    const record = recordRestaurantClawSkillExecution(workbench, new Date('2026-05-24T09:01:00.000Z'));
    const ledger = buildRestaurantClawSkillExecutionLedger(new Date('2026-05-24T09:02:00.000Z'));

    expect(record.payloadShape).toBe('restaurant-claw-skill-execution-record-v1');
    expect(record.restaurant).toBe('North City Noodles');
    expect(record.runnableNow).toBe(workbench.summary.runnableNow);
    expect(record.evidenceRequired.length).toBeGreaterThan(0);
    expect(record.safetyBoundary).toContain('does not execute external platform actions');
    expect(ledger.payloadShape).toBe('restaurant-claw-skill-execution-ledger-v1');
    expect(ledger.summary.total).toBe(1);
    expect(ledger.latest[0].recordId).toBe(record.recordId);
  });

  it('is exposed through the restaurant runtime API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claw-skill-workbench',
        restaurant: 'River Bistro',
        offer: 'Dinner set',
        moduleIds: ['local-life-content', 'agent-ops'],
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.clawSkillWorkbench.payloadShape).toBe('restaurant-claw-skill-workbench-v1');
    expect(payload.clawSkillWorkbench.selectedModules.map((item: { id: string }) => item.id)).toEqual([
      'local-life-content',
      'agent-ops',
    ]);
    expect(payload.clawSkillWorkbench.summary.runnableNow).toBeGreaterThan(0);
    expect(payload.clawSkillExecutionRecord.payloadShape).toBe('restaurant-claw-skill-execution-record-v1');
    expect(payload.clawSkillExecutionLedger.payloadShape).toBe('restaurant-claw-skill-execution-ledger-v1');
    expect(payload.clawSkillExecutionLedger.summary.total).toBeGreaterThanOrEqual(1);
  });
});

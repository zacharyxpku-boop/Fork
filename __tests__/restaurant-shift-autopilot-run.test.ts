import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { clearRestaurantShiftAutopilotRunsForTest, listRestaurantShiftAutopilotRuns, runRestaurantShiftAutopilot } from '@/lib/restaurant-shift-autopilot-run-store';
import type { RestaurantShiftAutopilot } from '@/lib/restaurant-shift-autopilot';
import { buildRestaurantStoreManagerTaskQueue, clearRestaurantStoreManagerTasksForTest } from '@/lib/restaurant-store-manager-task-store';

function sampleAutopilot(): RestaurantShiftAutopilot {
  return {
    ok: true,
    payloadShape: 'restaurant-shift-autopilot-v1',
    generatedAt: '2026-05-25T09:00:00.000Z',
    restaurant: 'North City Noodles',
    offer: 'Tomato beef noodle set',
    summary: {
      steps: 4,
      dueNow: 3,
      internalRunnable: 1,
      manualPrep: 1,
      providerBlocked: 1,
      evidenceBlocked: 1,
      nextWakeups: 4,
      canRunNowWithoutProvider: true,
      canClaimExternalAutomation: false,
    },
    steps: [
      {
        id: 'shift-opening-morning-prep',
        laneId: 'opening',
        jobId: 'morning-prep',
        title: 'Open-shift command',
        mode: 'run-internal',
        dueNow: true,
        owner: 'ai-employee',
        trigger: 'store opens',
        action: 'Build the morning brief, material checklist and stop line.',
        proofRequired: ['menu photo', 'owner approval'],
        providerRequired: [],
        nextWakeup: '09:30 local',
        stopLine: 'No external publish claim.',
      },
      {
        id: 'shift-demand-lunch-pulse',
        laneId: 'demand',
        jobId: 'lunch-pulse',
        title: 'Demand and lead capture',
        mode: 'prepare-manual',
        dueNow: true,
        owner: 'store-manager',
        trigger: 'coupon claim aggregate arrives',
        action: 'Prepare store-manager follow-up tasks from aggregate signals.',
        proofRequired: ['aggregate count', 'source channel'],
        providerRequired: [],
        nextWakeup: '14:00 local',
        stopLine: 'No customer contact or private-message read.',
      },
      {
        id: 'shift-publish-proof-dinner-window',
        laneId: 'publish-proof',
        jobId: 'dinner-publish-window',
        title: 'Publish and proof',
        mode: 'wait-provider',
        dueNow: true,
        owner: 'ops',
        trigger: 'approved content enters publish window',
        action: 'Hold external execution; prepare manual package.',
        proofRequired: ['posted link or screenshot id'],
        providerRequired: ['merchant platform authorization', 'callback secret'],
        nextWakeup: '16:30 local',
        stopLine: 'No auto-publish claim before Provider health is ready.',
      },
      {
        id: 'shift-closeout-night',
        laneId: 'closeout',
        jobId: 'night-closeout',
        title: 'Closeout and next loop',
        mode: 'collect-evidence',
        dueNow: true,
        owner: 'finance',
        trigger: 'closeout starts',
        action: 'Collect sanitized POS/coupon/member aggregate.',
        proofRequired: ['sanitized POS aggregate', 'field dictionary'],
        providerRequired: [],
        nextWakeup: '22:30 local',
        stopLine: 'No operating-analysis claim without accepted data proof.',
      },
    ],
    nowQueue: ['Open-shift command: Build the morning brief.'],
    nextWakeups: ['Open-shift command: 09:30 local'],
    providerQueue: ['merchant platform authorization', 'callback secret'],
    evidenceQueue: ['sanitized POS aggregate'],
    operatingPolicy: [
      'Run internal planning, staff review and proof preparation without Provider keys.',
      'Hold external automation claims until provider health and accepted proof exist.',
    ],
    safetyBoundary: 'Shift Autopilot builds a bounded shift plan only. It does not log in, publish, contact customers, redeem coupons, write POS orders or expose secrets.',
  };
}

describe('restaurant shift autopilot run', () => {
  beforeEach(() => {
    clearRestaurantShiftAutopilotRunsForTest();
    clearRestaurantStoreManagerTasksForTest();
  });

  it('records one bounded internal shift run and creates owner tasks for non-internal lanes', () => {
    const run = runRestaurantShiftAutopilot({
      autopilot: sampleAutopilot(),
      now: new Date('2026-05-25T09:05:00.000Z'),
    });

    expect(run.payloadShape).toBe('restaurant-shift-autopilot-run-v1');
    expect(run.summary.acceptedInternalActions).toBe(1);
    expect(run.summary.createdStoreManagerTasks).toBe(3);
    expect(run.summary.providerHeldActions).toBe(1);
    expect(run.summary.canClaimExternalAutomation).toBe(false);
    expect(run.providerHeldActions[0].providerRequired).toContain('merchant platform authorization');
    expect(run.evidenceLedger.map(item => item.status)).toContain('provider-required');
    expect(run.safetyBoundary).toContain('does not log in, publish, contact customers');
    expect(JSON.stringify(run)).not.toContain('sk-live-secret');

    const runs = listRestaurantShiftAutopilotRuns();
    expect(runs).toHaveLength(1);
    expect(runs[0].runId).toBe(run.runId);

    const queue = buildRestaurantStoreManagerTaskQueue(new Date('2026-05-25T09:06:00.000Z'));
    expect(queue.summary.total).toBe(3);
    expect(queue.tasks.map(task => task.source)).toEqual(expect.arrayContaining(['shift-autopilot-run']));
    expect(queue.tasks.map(task => task.status)).toEqual(expect.arrayContaining(['blocked', 'needs-evidence']));
  });

  it('is exposed through the runtime API without claiming external automation', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'shift-autopilot-run',
        restaurant: 'North City Noodles',
        offer: 'Tomato beef noodle set',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.shiftAutopilot.payloadShape).toBe('restaurant-shift-autopilot-v1');
    expect(payload.shiftAutopilotRun.payloadShape).toBe('restaurant-shift-autopilot-run-v1');
    expect(payload.shiftAutopilotRun.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.shiftAutopilotRun.summary.createdStoreManagerTasks).toBeGreaterThan(0);
    expect(payload.storeManagerTaskQueue.tasks.map((task: { source: string }) => task.source)).toContain('shift-autopilot-run');
    expect(payload.storeManagerTaskWatcher.payloadShape).toBe('restaurant-store-manager-task-watcher-v1');
  });
});

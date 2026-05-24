import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { clearRestaurantAgentChannelDeliveryAttemptsForTest } from '@/lib/restaurant-agent-channel-delivery-store';
import { buildRestaurantAgentCommandCenter } from '@/lib/restaurant-agent-command-center';
import { buildRestaurantAiEmployeeMemoryPack } from '@/lib/restaurant-ai-employee-memory-pack';
import { clearRestaurantAgentReceiptsForTest } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest } from '@/lib/restaurant-agent-run-store';
import {
  buildRestaurantCapabilityTrainingPlanFromLedger,
  clearRestaurantCapabilityTrainingRecordsForTest,
  recordRestaurantCapabilityTrainingRecord,
} from '@/lib/restaurant-capability-training';
import { buildRestaurantCommandRoute } from '@/lib/restaurant-command-router';
import {
  buildRestaurantProviderSetupStateSummary,
  clearRestaurantProviderSetupStateForTest,
  recordRestaurantProviderSetupState,
} from '@/lib/restaurant-provider-setup-state-store';
import {
  buildRestaurantStoreManagerTaskQueue,
  clearRestaurantStoreManagerTasksForTest,
  recordRestaurantStoreManagerTasks,
} from '@/lib/restaurant-store-manager-task-store';
import { buildRestaurantStoreManagerTaskWatcher } from '@/lib/restaurant-store-manager-task-watcher';

describe('restaurant AI employee memory pack', () => {
  beforeEach(() => {
    clearRestaurantAgentChannelDeliveryAttemptsForTest();
    clearRestaurantProviderSetupStateForTest();
    clearRestaurantStoreManagerTasksForTest();
    clearRestaurantCapabilityTrainingRecordsForTest();
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
  });

  it('summarizes setup, training and task gaps without automation claims when empty', async () => {
    const commandCenter = await buildRestaurantAgentCommandCenter({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      now: new Date('2026-05-24T09:00:00.000Z'),
    });
    const trainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger();
    const providerSetupState = buildRestaurantProviderSetupStateSummary(new Date('2026-05-24T09:01:00.000Z'));
    const queue = buildRestaurantStoreManagerTaskQueue(new Date('2026-05-24T09:02:00.000Z'));
    const watcher = buildRestaurantStoreManagerTaskWatcher(queue, new Date('2026-05-24T09:03:00.000Z'));

    const pack = buildRestaurantAiEmployeeMemoryPack({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      commandCenter,
      capabilityTrainingPlan: trainingPlan,
      providerSetupState,
      storeManagerTaskQueue: queue,
      storeManagerTaskWatcher: watcher,
      now: new Date('2026-05-24T09:04:00.000Z'),
    });

    expect(pack.payloadShape).toBe('restaurant-ai-employee-memory-pack-v1');
    expect(pack.employee.safeToAutonomouslyRun).toBe(false);
    expect(pack.summary.trainingMissingMaterials).toBeGreaterThan(0);
    expect(pack.summary.providerGates).toBeGreaterThan(0);
    expect(pack.residentEmployeeBrief.join(' ')).toContain('Autonomy is gated');
    expect(pack.safetyBoundary).toContain('does not log in');
  });

  it('aggregates routed command, accepted training, provider state, store tasks and wakeups', async () => {
    recordRestaurantCapabilityTrainingRecord({
      kind: 'material',
      capabilityId: 'auto-publish-receipts',
      name: 'publishing template',
      owner: 'ops',
      evidenceSummary: 'approved public proof checklist',
    }, new Date('2026-05-24T10:00:00.000Z'));
    recordRestaurantProviderSetupState({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      configuredEnvKeys: ['OPENCLAW_RUNTIME_URL'],
      merchantApprovals: ['public proof review approval'],
      dataContracts: ['coupon aggregate export'],
      submittedBy: 'runtime-admin',
      now: new Date('2026-05-24T10:02:00.000Z'),
    });
    recordRestaurantStoreManagerTasks([{
      id: 'coupon-followup',
      owner: 'store-manager',
      priority: 'today',
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      signal: 'coupon-claim',
      action: 'Confirm today coupon inventory and attach public proof before closeout.',
      talkTrack: 'Use only merchant-approved follow-up wording.',
      evidenceRequired: 'coupon aggregate and public proof screenshot id',
      dueWindow: 'today before dinner shift',
      stopLine: 'Do not contact customers or redeem coupons from this task.',
    }], new Date('2026-05-24T10:03:00.000Z'));
    const commandCenter = await buildRestaurantAgentCommandCenter({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      now: new Date('2026-05-24T10:04:00.000Z'),
    });
    const commandRoute = buildRestaurantCommandRoute({
      command: 'Build the next loop plan for dinner proof and store-manager follow-up.',
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      commandCenter,
      now: new Date('2026-05-24T10:05:00.000Z'),
    });
    const queue = buildRestaurantStoreManagerTaskQueue(new Date('2026-05-24T10:06:00.000Z'));
    const watcher = buildRestaurantStoreManagerTaskWatcher(queue, new Date('2026-05-24T15:30:00.000Z'));
    const providerSetupState = buildRestaurantProviderSetupStateSummary(new Date('2026-05-24T10:07:00.000Z'));
    const trainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger({
      configuredProviders: [
        ...providerSetupState.provided.envKeys,
        ...providerSetupState.provided.merchantApprovals,
        ...providerSetupState.provided.dataContracts,
      ],
    });

    const pack = buildRestaurantAiEmployeeMemoryPack({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      commandRoute,
      commandCenter,
      capabilityTrainingPlan: trainingPlan,
      providerSetupState,
      storeManagerTaskQueue: queue,
      storeManagerTaskWatcher: watcher,
      now: new Date('2026-05-24T10:08:00.000Z'),
    });

    expect(pack.memoryCards.map(card => card.id)).toEqual(expect.arrayContaining([
      'command-route-memory',
      'training-progress-memory',
      'provider-gates-memory',
      'store-manager-task-memory',
    ]));
    expect(pack.summary.openTasks).toBeGreaterThan(0);
    expect(pack.nextWakeups.length).toBeGreaterThan(0);
    expect(JSON.stringify(pack)).not.toContain('OPENCLAW_RUNTIME_URL=');
    expect(JSON.stringify(pack)).not.toContain('customer phone');
  });

  it('is exposed through the runtime API and redacts sensitive commands from the response', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'ai-employee-memory-pack',
        command: 'Automatically DM every customer at 13800000000 with this coupon.',
        restaurant: 'API Noodle',
        offer: 'Dinner set',
      }),
    }));
    const payload = await response.json();
    const serialized = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(payload.aiEmployeeMemoryPack.payloadShape).toBe('restaurant-ai-employee-memory-pack-v1');
    expect(payload.commandRoute.command).toBe('[redacted-sensitive-command]');
    expect(serialized).not.toContain('13800000000');
    expect(payload.aiEmployeeMemoryPack.safetyBoundary).toContain('does not log in');
  });
});

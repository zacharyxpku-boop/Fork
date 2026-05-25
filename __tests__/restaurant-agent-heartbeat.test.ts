import { beforeEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantAgentHeartbeat } from '@/lib/restaurant-agent-heartbeat';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';
import { clearRestaurantShiftAutopilotRunsForTest } from '@/lib/restaurant-shift-autopilot-run-store';
import { clearRestaurantStoreManagerTasksForTest } from '@/lib/restaurant-store-manager-task-store';

describe('restaurant agent heartbeat', () => {
  beforeEach(() => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantShiftAutopilotRunsForTest();
    clearRestaurantStoreManagerTasksForTest();
  });

  it('creates a bootstrap followup when no runs exist', () => {
    const heartbeat = buildRestaurantAgentHeartbeat([]);

    expect(heartbeat.ok).toBe(true);
    expect(heartbeat.watchedRuns).toBe(0);
    expect(heartbeat.shiftAutopilotRuns).toBe(0);
    expect(heartbeat.taskWakeups).toBe(0);
    expect(heartbeat.followups[0].nextAction).toContain('Create the first governed local agent task');
    expect(heartbeat.watcherEvents).toContain('publish_receipt_added');
  });

  it('turns queued and blocked runs into proactive followups', () => {
    const queued = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'South City Sichuan Bistro',
      offer: 'Two-person pickled fish set',
      owner: 'store-manager',
    });
    const blocked = buildRestaurantAgentDispatch({
      taskId: 'browser-publish-check',
      restaurant: 'South City Sichuan Bistro',
      offer: 'Two-person pickled fish set',
      runtimeTarget: 'lobu',
    });

    const heartbeat = buildRestaurantAgentHeartbeat([
      recordRestaurantAgentRun(blocked, 'lobu', { ok: false, target: 'lobu', status: 'blocked', message: 'missing runtime URL', audit: { secretExposed: false, payloadShape: 'lobu-compatible-restaurant-task', blockedActions: [] } }),
      recordRestaurantAgentRun(queued, 'local'),
    ]);

    expect(heartbeat.followups.map(item => item.priority)).toEqual(['high', 'medium']);
    expect(heartbeat.followups[0].evidenceRequired).toContain('runtime URL');
    expect(heartbeat.blockedExternal).toContain('pos_redemption_pull requires POS export/API');
  });

  it('promotes Shift Autopilot run records and owner-task wakeups into resident followups', () => {
    const heartbeat = buildRestaurantAgentHeartbeat([], [], {
      now: new Date('2026-05-25T12:00:00.000Z'),
      shiftAutopilotRuns: [{
        ok: true,
        payloadShape: 'restaurant-shift-autopilot-run-v1',
        runId: 'shift-run-heartbeat-test',
        restaurant: 'North City Noodles',
        offer: 'Tomato beef noodle set',
        startedAt: '2026-05-25T10:00:00.000Z',
        completedAt: '2026-05-25T10:00:00.000Z',
        summary: { dueSteps: 1, acceptedInternalActions: 0, preparedManualActions: 0, providerHeldActions: 1, evidenceHeldActions: 0, createdStoreManagerTasks: 1, canClaimExternalAutomation: false },
        acceptedInternalActions: [],
        preparedManualActions: [],
        providerHeldActions: [{
          stepId: 'shift-publish-proof',
          laneId: 'publish-proof',
          title: 'Publish and proof',
          owner: 'ops',
          mode: 'wait-provider',
          action: 'Hold external execution.',
          proofRequired: ['posted link or screenshot id'],
          providerRequired: ['merchant platform authorization'],
          status: 'waiting-provider',
          stopLine: 'No auto-publish claim before Provider health is ready.',
        }],
        evidenceHeldActions: [],
        evidenceLedger: [{ stepId: 'shift-publish-proof', title: 'Publish and proof', owner: 'ops', required: ['merchant platform authorization'], status: 'provider-required' }],
        nextStoreManagerTasks: [],
        externalRequired: ['merchant platform authorization'],
        safetyBoundary: 'internal only',
      }],
      storeManagerTaskQueue: {
        ok: true,
        payloadShape: 'restaurant-store-manager-task-queue-v1',
        generatedAt: '2026-05-25T10:00:00.000Z',
        summary: { total: 1, open: 0, blocked: 1, needsEvidence: 0, readyForProvider: 0, done: 0, today: 0, nextShift: 0 },
        tasks: [{
          id: 'task-provider-held',
          taskMemoryId: 'task-provider-held-memory',
          owner: 'store-manager',
          priority: 'blocked',
          restaurant: 'North City Noodles',
          offer: 'Tomato beef noodle set',
          signal: 'setup-gap',
          action: 'Collect merchant platform authorization.',
          talkTrack: 'Provider-held action needs merchant owner.',
          evidenceRequired: 'merchant grant',
          dueWindow: 'after provider unlock',
          stopLine: 'No external action before proof.',
          status: 'blocked',
          createdAt: '2026-05-25T10:00:00.000Z',
          updatedAt: '2026-05-25T10:00:00.000Z',
          source: 'shift-autopilot-run',
          auditNote: 'test',
          externalRequired: ['merchant platform authorization'],
        }],
        nextAction: 'Collect merchant platform authorization.',
        safetyBoundary: 'internal task memory only',
      },
    });

    expect(heartbeat.shiftAutopilotRuns).toBe(1);
    expect(heartbeat.taskWakeups).toBeGreaterThan(0);
    expect(heartbeat.followups[0].reason).toContain('Shift Autopilot run');
    expect(heartbeat.storeManagerTaskWatcher?.payloadShape).toBe('restaurant-store-manager-task-watcher-v1');
    expect(heartbeat.memorySuggestions.join('\n')).toContain('shift autopilot');
  });

  it('exposes heartbeat through the runtime API', async () => {
    await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        taskId: 'browser-publish-check',
        restaurant: 'North City Noodles',
        offer: 'Tomato beef noodle set',
        owner: 'community-ops',
        runtimeTarget: 'local',
      }),
    }) as never);

    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({ action: 'heartbeat' }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.heartbeat.watchedRuns).toBeGreaterThanOrEqual(1);
    expect(payload.heartbeat.followups.map((item: { nextAction: string }) => item.nextAction).join('\n')).toContain('Attach public proof');
  });
});

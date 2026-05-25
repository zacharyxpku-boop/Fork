import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import type { RestaurantRuntimeBridgeResult } from '@/lib/restaurant-agent-runtime-bridge';
import { clearRestaurantAgentReceiptsForTest } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest } from '@/lib/restaurant-agent-run-store';
import { clearRestaurantShiftAutopilotRunsForTest } from '@/lib/restaurant-shift-autopilot-run-store';
import type { RestaurantShiftFirstForwardableRun } from '@/lib/restaurant-shift-first-forwardable-run';
import { blockedShiftSandboxBridge, buildRestaurantShiftSandboxForwardAttempt } from '@/lib/restaurant-shift-sandbox-forward';
import { clearRestaurantStoreManagerTasksForTest } from '@/lib/restaurant-store-manager-task-store';
import type { RestaurantTaskProviderHandoff, RestaurantTaskProviderHandoffItem } from '@/lib/restaurant-task-provider-handoff';

function fakeShiftFirstForwardableRun(): RestaurantShiftFirstForwardableRun {
  return {
    ok: true,
    payloadShape: 'restaurant-shift-first-forwardable-run-v1',
    generatedAt: '2026-05-24T13:00:00.000Z',
    verdict: 'waiting-provider',
    summary: {
      shiftRuns: 1,
      providerRequests: 2,
      sandboxStagesPassed: 4,
      forwardablePackages: 0,
      blockedStages: 1,
      waitingExternalStages: 1,
      canForwardFirstShiftRun: false,
      canSubmitSandbox: false,
      canClaimExternalAutomation: false,
    },
    stages: [],
    shiftProviderHandoff: {
      payloadShape: 'restaurant-shift-provider-handoff-v1',
      summary: {
        shiftRuns: 1,
        sourceActions: 2,
        requests: 2,
        p0: 1,
        readyToSandbox: 0,
        waitingExternal: 1,
        providerEnvKeys: 2,
        merchantApprovals: 1,
        dataContracts: 1,
        canClaimExternalAutomation: false,
      },
      providerEnvKeys: ['RESTAURANT_AGENT_OPENCLAW_API_KEY'],
      merchantApprovals: ['merchant grant'],
      dataContracts: ['signed callback'],
      nextAction: 'Resolve provider asks.',
      safetyBoundary: 'No secrets.',
    },
    shiftSandboxAcceptance: {
      payloadShape: 'restaurant-shift-sandbox-acceptance-v1',
      verdict: 'waiting-provider',
      summary: {
        stages: 6,
        passed: 4,
        waitingExternal: 1,
        blocked: 1,
        providerRequests: 2,
        p0: 1,
        canSubmitSandbox: false,
        canClaimExternalAutomation: false,
      },
      submitContract: {
        sendToRuntime: 'safePayload-and-executionPackage-only',
        callbackAction: 'external-receipt',
        callbackHeader: 'x-restaurant-agent-signature',
        requiredReceiptFields: ['eventId'],
        forbiddenFields: ['API key values'],
      },
      externalRequired: ['Configure runtime.'],
      safetyBoundary: 'No provider calls.',
    },
    firstForwardableRunPack: {
      payloadShape: 'restaurant-first-forwardable-run-pack-v1',
      verdict: 'setup-required',
      summary: {
        tasks: 1,
        readyTasks: 0,
        forwardable: 0,
        handoffOnly: 0,
        blockedPackages: 1,
        passedStages: 2,
        externalRequiredStages: 2,
        blockedStages: 2,
        canForwardFirstRun: false,
        canClaimAutomation: false,
      },
      externalRequired: ['Mark one task ready.'],
      safetyBoundary: 'No external automation.',
    },
    taskProviderHandoff: {
      payloadShape: 'restaurant-task-provider-handoff-v1',
      summary: {
        tasks: 1,
        readyTasks: 0,
        packages: 0,
        forwardable: 0,
        handoffOnly: 0,
        blocked: 1,
      },
      providerContract: {
        acceptedTaskStatus: 'ready-for-provider',
        allowedTargets: ['openclaw'],
        callbackAction: 'external-receipt',
        callbackHeader: 'x-restaurant-agent-signature',
        requiredReceiptFields: ['eventId'],
      },
      safetyBoundary: 'No secrets.',
    },
    providerSandboxContract: {
      payloadShape: 'restaurant-provider-sandbox-contract-v1',
      verdict: 'setup-required',
      summary: {
        checks: 1,
        passed: 0,
        blocked: 1,
        externalRequired: 1,
        canRunSandbox: false,
        canClaimAutomation: false,
      },
      acceptanceContract: {
        submitRequires: ['safePayload-and-executionPackage-only'],
        callbackRequires: ['x-restaurant-agent-signature'],
        recoveryRequires: ['manual fallback'],
        forbiddenInPayload: ['API key values'],
      },
      safetyBoundary: 'No calls.',
    },
    operatorScript: [],
    externalRequired: ['Configure runtime.'],
    safetyBoundary: 'Shift preflight only.',
  };
}

describe('restaurant shift sandbox forward', () => {
  beforeEach(() => {
    clearRestaurantStoreManagerTasksForTest();
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
    clearRestaurantShiftAutopilotRunsForTest();
  });

  it('exposes a guarded API action that blocks before provider dispatch when prerequisites are missing', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'shift-sandbox-forward', runtimeTarget: 'openclaw' }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.shiftSandboxForwardAttempt.payloadShape).toBe('restaurant-shift-sandbox-forward-attempt-v1');
    expect(payload.shiftSandboxForwardAttempt.verdict).toBe('blocked-before-dispatch');
    expect(payload.shiftSandboxForwardAttempt.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.shiftSandboxForwardAttempt.safetyBoundary).toContain('sanitized execution packages only');
  });

  it('formats blocked attempts without leaking package secrets', () => {
    const shiftFirstForwardableRun = fakeShiftFirstForwardableRun();
    const selectedPackage = {
      handoffId: 'handoff-1',
      taskMemoryId: 'task-memory-1',
      status: 'blocked',
      canForward: false,
      runtimeTarget: 'openclaw',
      requestedAction: 'capture_public_receipt',
      safePayload: {
        taskId: 'task-1',
        restaurant: 'Sandbox Bistro',
        offer: 'Dinner set',
        owner: 'runtime-admin',
        action: 'Capture public proof.',
        evidenceRequired: 'public proof',
        externalRequired: ['runtime'],
        stopLine: 'No secrets.',
      },
      executionPackage: {
        packageId: 'restaurant-exec-secret-check',
        executionPolicy: {
          blockedRuntimeActions: ['private_message_read'],
        },
      },
      blockedReasons: ['openclaw runtime URL/API key missing'],
      nextAction: 'Configure runtime.',
    } as unknown as RestaurantTaskProviderHandoffItem;
    const bridge: RestaurantRuntimeBridgeResult = blockedShiftSandboxBridge({
      shiftFirstForwardableRun,
      selectedPackage,
    });
    const attempt = buildRestaurantShiftSandboxForwardAttempt({
      shiftFirstForwardableRun,
      taskProviderHandoff: shiftFirstForwardableRun.taskProviderHandoff as RestaurantTaskProviderHandoff,
      selectedPackage,
      bridge,
      now: new Date('2026-05-24T13:01:00.000Z'),
    });
    const serialized = JSON.stringify(attempt);

    expect(attempt.verdict).toBe('blocked-before-dispatch');
    expect(attempt.summary.runRecorded).toBe(false);
    expect(attempt.receiptExpectation.callbackHeader).toBe('x-restaurant-agent-signature');
    expect(serialized).not.toContain('secret-value');
    expect(serialized).not.toContain('cookie=');
  });
});

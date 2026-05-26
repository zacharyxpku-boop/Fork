import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantBusinessSignals } from '@/lib/restaurant-agent-business-signals';
import { buildRestaurantAgentChannelDeliveryReport } from '@/lib/restaurant-agent-channel-delivery-store';
import { buildRestaurantAgentRecoveryPlan } from '@/lib/restaurant-agent-recovery';
import { buildRestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantBrowserGatewayPack } from '@/lib/restaurant-browser-gateway-pack';
import { buildRestaurantExternalAccessGuide } from '@/lib/restaurant-external-access-guide';
import { buildRestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import { buildRestaurantProviderAcceptanceWorkbench } from '@/lib/restaurant-provider-acceptance-workbench';
import { buildRestaurantProviderKeyGapBoard } from '@/lib/restaurant-provider-key-gap-board';
import { buildRestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import { buildRestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';
import { buildRestaurantProviderSandboxContract } from '@/lib/restaurant-provider-sandbox-contract';
import { buildRestaurantProviderSandboxReadinessBoard } from '@/lib/restaurant-provider-sandbox-readiness-board';
import { buildRestaurantProviderSandboxSubmitWorkbench } from '@/lib/restaurant-provider-sandbox-submit-workbench';
import { buildRestaurantProviderSetupStateSummary } from '@/lib/restaurant-provider-setup-state-store';
import { buildRestaurantProviderSetupWizard } from '@/lib/restaurant-provider-setup-wizard';
import { buildRestaurantProviderUnlockLadder } from '@/lib/restaurant-provider-unlock-ladder';
import { buildRestaurantPublishExecutionInbox } from '@/lib/restaurant-publish-execution-inbox';
import { buildRestaurantRuntimeRunnerLoopPack } from '@/lib/restaurant-runtime-runner-loop-pack';
import { buildRestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';
import { buildRestaurantTaskProviderHandoff } from '@/lib/restaurant-task-provider-handoff';

describe('restaurant provider sandbox readiness board', () => {
  it('decides sandbox submit readiness without claiming external automation', async () => {
    const now = new Date('2026-05-26T17:00:00.000Z');
    const env = {};
    const runs: RestaurantAgentRunRecord[] = [];
    const receipts: RestaurantAgentReceiptRecord[] = [];
    const readiness = buildRestaurantExternalReadiness(env);
    const providerSetupState = buildRestaurantProviderSetupStateSummary(now);
    const runtimeProbe = await buildRestaurantRuntimeProbe({ env, now });
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      env,
      providerSetupState,
      runtimeProbe,
      now,
    });
    const providerSetupWizard = buildRestaurantProviderSetupWizard({
      restaurant: 'Readiness Bistro',
      offer: 'Weekend set',
      provided: providerSetupState.provided,
      now,
    });
    const taskProviderHandoff = buildRestaurantTaskProviderHandoff({
      queue: buildRestaurantStoreManagerTaskQueue(now),
      target: 'openclaw',
      env,
      now,
    });
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({ runs, receipts, readiness, now });
    const providerSandboxContract = buildRestaurantProviderSandboxContract({
      runtimeProbe,
      providerReadinessHealth,
      taskProviderHandoff,
      providerReceiptInbox,
      now,
    });
    const browserGatewayPack = buildRestaurantBrowserGatewayPack({
      restaurant: 'Readiness Bistro',
      offer: 'Weekend set',
      env,
      now,
    });
    const runtimeRunnerLoopPack = buildRestaurantRuntimeRunnerLoopPack({ runs, receipts, readiness, now });
    const publishExecutionInbox = buildRestaurantPublishExecutionInbox({
      restaurant: 'Readiness Bistro',
      offer: 'Weekend set',
      browserGatewayPack,
      runtimeRunnerLoopPack,
      channelDeliveryReport: buildRestaurantAgentChannelDeliveryReport(now),
      businessSignals: buildRestaurantBusinessSignals(runs, receipts, now),
      recovery: buildRestaurantAgentRecoveryPlan(runs, receipts, readiness, now),
      now,
    });
    const operatingDataContract = buildRestaurantOperatingDataContract({ receipts, readiness, now });
    const providerAcceptanceWorkbench = buildRestaurantProviderAcceptanceWorkbench({
      restaurant: 'Readiness Bistro',
      offer: 'Weekend set',
      providerSetupWizard,
      providerReadinessHealth,
      providerSandboxContract,
      operatingDataContract,
      publishExecutionInbox,
      now,
    });
    const providerSandboxSubmitWorkbench = buildRestaurantProviderSandboxSubmitWorkbench({
      providerAcceptanceWorkbench,
      providerSandboxContract,
      taskProviderHandoff,
      providerReceiptInbox,
      target: 'openclaw',
      now,
    });
    const providerUnlockLadder = buildRestaurantProviderUnlockLadder({
      setupState: providerSetupState,
      health: providerReadinessHealth,
    });
    const providerKeyGapBoard = buildRestaurantProviderKeyGapBoard({
      restaurant: 'Readiness Bistro',
      offer: 'Weekend set',
      env,
      now,
    });
    const externalAccessGuide = buildRestaurantExternalAccessGuide({
      restaurant: 'Readiness Bistro',
      offer: 'Weekend set',
      providerSetupWizard,
      providerUnlockLadder,
      providerKeyGapBoard,
      now,
    });
    const board = buildRestaurantProviderSandboxReadinessBoard({
      providerSandboxSubmitWorkbench,
      providerAcceptanceWorkbench,
      providerSandboxContract,
      externalAccessGuide,
      providerKeyGapBoard,
      now,
    });
    const serialized = JSON.stringify(board);

    expect(board.payloadShape).toBe('restaurant-provider-sandbox-readiness-board-v1');
    expect(board.summary.capabilities).toBe(5);
    expect(board.summary.canSubmitSandboxNow).toBe(false);
    expect(board.summary.canClaimExternalAutomation).toBe(false);
    expect(board.verdict).toBe('blocked-provider-setup');
    expect(board.rows.map(row => row.capabilityId)).toEqual([
      'auto-publish-proof',
      'auto-lead-acquisition',
      'auto-coupon-redemption',
      'true-operating-analysis',
      'staff-delivery',
    ]);
    expect(board.rows.every(row => row.callbackRequired.includes('x-restaurant-agent-signature'))).toBe(true);
    expect(board.rows.some(row => row.missing.length > 0)).toBe(true);
    expect(board.firstRunnable).toBeUndefined();
    expect(board.providerScript.join(' ')).toContain('Submit only rows where submitAllowed=true');
    expect(board.redactedFields).toContain('raw POS rows');
    expect(serialized).not.toContain('secret-value');
    expect(serialized).not.toContain('cookie-value');
    expect(serialized).not.toMatch(/1[3-9]\d{9}/);
  });

  it('is exposed through the default path API', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claw-experience-default-path',
        restaurant: 'API Readiness Bistro',
        offer: 'Late dinner set',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.providerSandboxReadinessBoard.payloadShape).toBe('restaurant-provider-sandbox-readiness-board-v1');
    expect(payload.providerSandboxReadinessBoard.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.providerSandboxReadinessBoard.rows).toHaveLength(5);
    expect(payload.providerSandboxReadinessBoard.rows.map((row: { capabilityId: string }) => row.capabilityId)).toContain('auto-publish-proof');
  });
});

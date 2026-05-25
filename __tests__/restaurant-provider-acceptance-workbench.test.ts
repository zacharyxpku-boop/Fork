import { describe, expect, it } from 'vitest';

import { buildRestaurantAgentChannelDeliveryReport } from '@/lib/restaurant-agent-channel-delivery-store';
import { buildRestaurantBusinessSignals } from '@/lib/restaurant-agent-business-signals';
import { buildRestaurantAgentRecoveryPlan } from '@/lib/restaurant-agent-recovery';
import { buildRestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';
import { buildRestaurantBrowserGatewayPack } from '@/lib/restaurant-browser-gateway-pack';
import { buildRestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import { buildRestaurantProviderAcceptanceWorkbench } from '@/lib/restaurant-provider-acceptance-workbench';
import { buildRestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import { buildRestaurantProviderSandboxContract } from '@/lib/restaurant-provider-sandbox-contract';
import { buildRestaurantProviderSetupStateSummary } from '@/lib/restaurant-provider-setup-state-store';
import { buildRestaurantProviderSetupWizard } from '@/lib/restaurant-provider-setup-wizard';
import { buildRestaurantPublishExecutionInbox } from '@/lib/restaurant-publish-execution-inbox';
import { buildRestaurantRuntimeRunnerLoopPack } from '@/lib/restaurant-runtime-runner-loop-pack';
import { buildRestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';
import { buildRestaurantTaskProviderHandoff } from '@/lib/restaurant-task-provider-handoff';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';

describe('restaurant provider acceptance workbench', () => {
  it('combines setup health sandbox data and publish evidence gates without exposing secrets', async () => {
    const now = new Date('2026-05-26T13:30:00.000Z');
    const env = {};
    const runs: RestaurantAgentRunRecord[] = [];
    const receipts: RestaurantAgentReceiptRecord[] = [];
    const providerSetupState = buildRestaurantProviderSetupStateSummary(now);
    const runtimeProbe = await buildRestaurantRuntimeProbe({ env, now });
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      env,
      providerSetupState,
      runtimeProbe,
      now,
    });
    const providerSetupWizard = buildRestaurantProviderSetupWizard({
      restaurant: 'Provider Bistro',
      offer: 'Dinner set',
      provided: providerSetupState.provided,
      now,
    });
    const operatingDataContract = buildRestaurantOperatingDataContract({
      receipts,
      readiness: buildRestaurantExternalReadiness(env),
      now,
    });
    const browserGatewayPack = buildRestaurantBrowserGatewayPack({
      restaurant: 'Provider Bistro',
      offer: 'Dinner set',
      env,
      now,
    });
    const runtimeRunnerLoopPack = buildRestaurantRuntimeRunnerLoopPack({
      runs,
      receipts,
      readiness: buildRestaurantExternalReadiness(env),
      now,
    });
    const publishExecutionInbox = buildRestaurantPublishExecutionInbox({
      restaurant: 'Provider Bistro',
      offer: 'Dinner set',
      browserGatewayPack,
      runtimeRunnerLoopPack,
      channelDeliveryReport: buildRestaurantAgentChannelDeliveryReport(now),
      businessSignals: buildRestaurantBusinessSignals(runs, receipts, now),
      recovery: buildRestaurantAgentRecoveryPlan(runs, receipts, buildRestaurantExternalReadiness(env), now),
      now,
    });
    const providerSandboxContract = buildRestaurantProviderSandboxContract({
      runtimeProbe,
      providerReadinessHealth,
      taskProviderHandoff: buildRestaurantTaskProviderHandoff({ queue: buildRestaurantStoreManagerTaskQueue(now) }),
      now,
    });
    const workbench = buildRestaurantProviderAcceptanceWorkbench({
      restaurant: 'Provider Bistro',
      offer: 'Dinner set',
      providerSetupWizard,
      providerReadinessHealth,
      providerSandboxContract,
      operatingDataContract,
      publishExecutionInbox,
      now,
    });
    const serialized = JSON.stringify(workbench);

    expect(workbench.payloadShape).toBe('restaurant-provider-acceptance-workbench-v1');
    expect(workbench.stages.map(item => item.id)).toEqual([
      'runtime',
      'callback',
      'merchant-auth',
      'browser-profile',
      'staff-channel',
      'operating-data',
      'sandbox-receipt',
    ]);
    expect(workbench.summary.canClaimExternalAutomation).toBe(false);
    expect(workbench.acceptanceChecklist.map(item => item.source)).toContain('sandbox-contract');
    expect(workbench.safetyBoundary).toContain('provider key values');
    expect(serialized).not.toContain('secret-value');
    expect(serialized).not.toContain('cookie-value');
    expect(serialized).not.toContain('13800000000');
  });
});

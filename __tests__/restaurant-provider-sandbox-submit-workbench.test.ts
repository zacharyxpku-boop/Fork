import { describe, expect, it } from 'vitest';

import { buildRestaurantAgentChannelDeliveryReport } from '@/lib/restaurant-agent-channel-delivery-store';
import { buildRestaurantAgentRecoveryPlan } from '@/lib/restaurant-agent-recovery';
import { buildRestaurantBusinessSignals } from '@/lib/restaurant-agent-business-signals';
import { buildRestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantProviderAcceptanceWorkbench } from '@/lib/restaurant-provider-acceptance-workbench';
import { buildRestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import { buildRestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';
import { buildRestaurantProviderSandboxContract } from '@/lib/restaurant-provider-sandbox-contract';
import { buildRestaurantProviderSandboxSubmitWorkbench } from '@/lib/restaurant-provider-sandbox-submit-workbench';
import { buildRestaurantProviderSetupStateSummary } from '@/lib/restaurant-provider-setup-state-store';
import { buildRestaurantProviderSetupWizard } from '@/lib/restaurant-provider-setup-wizard';
import { buildRestaurantPublishExecutionInbox } from '@/lib/restaurant-publish-execution-inbox';
import { buildRestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import { buildRestaurantBrowserGatewayPack } from '@/lib/restaurant-browser-gateway-pack';
import { buildRestaurantRuntimeRunnerLoopPack } from '@/lib/restaurant-runtime-runner-loop-pack';
import { buildRestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';
import { buildRestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';
import { buildRestaurantTaskProviderHandoff } from '@/lib/restaurant-task-provider-handoff';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';

describe('restaurant provider sandbox submit workbench', () => {
  it('turns provider acceptance capabilities into safe sandbox submit packages', async () => {
    const now = new Date('2026-05-26T15:00:00.000Z');
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
      restaurant: 'Sandbox Bistro',
      offer: 'Late set',
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
      restaurant: 'Sandbox Bistro',
      offer: 'Late set',
      env,
      now,
    });
    const runtimeRunnerLoopPack = buildRestaurantRuntimeRunnerLoopPack({
      runs,
      receipts,
      readiness,
      now,
    });
    const publishExecutionInbox = buildRestaurantPublishExecutionInbox({
      restaurant: 'Sandbox Bistro',
      offer: 'Late set',
      browserGatewayPack,
      runtimeRunnerLoopPack,
      channelDeliveryReport: buildRestaurantAgentChannelDeliveryReport(now),
      businessSignals: buildRestaurantBusinessSignals(runs, receipts, now),
      recovery: buildRestaurantAgentRecoveryPlan(runs, receipts, readiness, now),
      now,
    });
    const providerAcceptanceWorkbench = buildRestaurantProviderAcceptanceWorkbench({
      restaurant: 'Sandbox Bistro',
      offer: 'Late set',
      providerSetupWizard,
      providerReadinessHealth,
      providerSandboxContract,
      operatingDataContract: buildRestaurantOperatingDataContract({ receipts, readiness, now }),
      publishExecutionInbox,
      now,
    });
    const workbench = buildRestaurantProviderSandboxSubmitWorkbench({
      providerAcceptanceWorkbench,
      providerSandboxContract,
      taskProviderHandoff,
      providerReceiptInbox,
      target: 'openclaw',
      now,
    });
    const serialized = JSON.stringify(workbench);

    expect(workbench.payloadShape).toBe('restaurant-provider-sandbox-submit-workbench-v1');
    expect(workbench.summary.capabilities).toBe(5);
    expect(workbench.summary.canClaimExternalAutomation).toBe(false);
    expect(workbench.submitPackages.map(item => item.capabilityId)).toEqual([
      'auto-publish-proof',
      'auto-lead-acquisition',
      'auto-coupon-redemption',
      'true-operating-analysis',
      'staff-delivery',
    ]);
    expect(workbench.submitPackages.every(item => item.callback.header === 'x-restaurant-agent-signature')).toBe(true);
    expect(workbench.submitPackages.every(item => item.submitEndpointShape.includesSecrets === false)).toBe(true);
    expect(workbench.submitPackages.every(item => item.submitEndpointShape.payloadShape === 'restaurant-agent-external-execution-v1')).toBe(true);
    expect(workbench.capabilitySubmissions).toHaveLength(5);
    expect(workbench.safetyBoundary).toContain('canClaimExternalAutomation false');
    expect(serialized).not.toContain('secret-value');
    expect(serialized).not.toContain('cookie-value');
    expect(serialized).not.toContain('token-value');
    expect(serialized).not.toMatch(/1[3-9]\d{9}/);
    expect(serialized).not.toContain('rawPrivateMessage');
  });
});

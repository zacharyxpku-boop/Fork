import { describe, expect, it } from 'vitest';

import { recordRestaurantAgentReceipt, clearRestaurantAgentReceiptsForTest } from '@/lib/restaurant-agent-receipt-store';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantBusinessSignals } from '@/lib/restaurant-agent-business-signals';
import { buildRestaurantAgentChannelDeliveryReport } from '@/lib/restaurant-agent-channel-delivery-store';
import { buildRestaurantAgentChannelHub } from '@/lib/restaurant-agent-channel-hub';
import { buildRestaurantCapabilityTrainingPlanFromLedger } from '@/lib/restaurant-capability-training';
import { buildRestaurantCustomerDemandGateway } from '@/lib/restaurant-customer-demand-gateway';
import { buildRestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantLeadAcquisitionProviderWorkbench } from '@/lib/restaurant-lead-acquisition-provider-workbench';
import { buildRestaurantLeadCaptureInbox } from '@/lib/restaurant-lead-capture-inbox';
import { buildRestaurantLeadSandboxAcceptanceFlow } from '@/lib/restaurant-lead-sandbox-acceptance-flow';
import { buildRestaurantNextLoopChannelPlan } from '@/lib/restaurant-next-loop-channel-plan';
import { buildRestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import { buildRestaurantPostRunReviewPack } from '@/lib/restaurant-post-run-review-pack';
import { buildRestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import { buildRestaurantProviderSandboxContract } from '@/lib/restaurant-provider-sandbox-contract';
import { buildRestaurantProviderSetupStateSummary } from '@/lib/restaurant-provider-setup-state-store';
import { buildRestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';
import { buildRestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';
import { buildRestaurantTaskProviderHandoff } from '@/lib/restaurant-task-provider-handoff';

describe('restaurant lead sandbox acceptance flow', () => {
  it('builds a sanitized provider package and blocks memory writes until accepted aggregate receipts exist', async () => {
    clearRestaurantAgentReceiptsForTest();
    clearRestaurantAgentRunsForTest();
    const now = new Date('2026-05-26T13:00:00.000Z');
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger({
      availableMaterials: ['reservation policy', 'coupon rules', 'staff reply script'],
      configuredProviders: [],
    });
    const providerSetupState = buildRestaurantProviderSetupStateSummary(now);
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({ providerSetupState, now });
    const customerDemandGateway = buildRestaurantCustomerDemandGateway({
      restaurant: 'Lead Sandbox Bistro',
      offer: 'Two person dinner',
      capabilityTrainingPlan,
      providerSetupState,
      now,
    });
    const queue = buildRestaurantStoreManagerTaskQueue(now);
    const postRunReviewPack = buildRestaurantPostRunReviewPack({
      restaurant: 'Lead Sandbox Bistro',
      offer: 'Two person dinner',
      queue,
      runs: [],
      receipts: [],
      readiness: buildRestaurantExternalReadiness({}),
      now,
    });
    const channelHub = buildRestaurantAgentChannelHub({ restaurant: 'Lead Sandbox Bistro', offer: 'Two person dinner', now });
    const nextLoopChannelPlan = buildRestaurantNextLoopChannelPlan({
      restaurant: 'Lead Sandbox Bistro',
      offer: 'Two person dinner',
      postRunReviewPack,
      channelHub,
      channelDeliveryReport: buildRestaurantAgentChannelDeliveryReport(now),
      storeManagerTaskQueue: queue,
      now,
    });
    const leadCaptureInbox = buildRestaurantLeadCaptureInbox({
      restaurant: 'Lead Sandbox Bistro',
      offer: 'Two person dinner',
      customerDemandGateway,
      businessSignals: buildRestaurantBusinessSignals([], [], now),
      channelHub,
      nextLoopChannelPlan,
      now,
    });
    const leadAcquisitionProviderWorkbench = buildRestaurantLeadAcquisitionProviderWorkbench({
      restaurant: 'Lead Sandbox Bistro',
      offer: 'Two person dinner',
      leadCaptureInbox,
      customerDemandGateway,
      providerReadinessHealth,
      operatingDataContract: buildRestaurantOperatingDataContract({ posImports: [], now }),
      now,
    });
    const providerSandboxContract = buildRestaurantProviderSandboxContract({
      runtimeProbe: await buildRestaurantRuntimeProbe({ now }),
      providerReadinessHealth,
      taskProviderHandoff: buildRestaurantTaskProviderHandoff({ queue, now }),
      now,
    });
    const flow = buildRestaurantLeadSandboxAcceptanceFlow({
      restaurant: 'Lead Sandbox Bistro',
      offer: 'Two person dinner',
      leadAcquisitionProviderWorkbench,
      providerSandboxContract,
      receipts: [],
      now,
    });
    const serialized = JSON.stringify(flow);

    expect(flow.payloadShape).toBe('restaurant-lead-sandbox-acceptance-flow-v1');
    expect(flow.sanitizedProviderPackage.action).toBe('lead-acquisition-provider-submit');
    expect(flow.sanitizedProviderPackage.callbackAction).toBe('lead-acquisition-receipt');
    expect(flow.summary.canClaimAutoAcquisition).toBe(false);
    expect(flow.summary.canContactCustomer).toBe(false);
    expect(flow.leadMemoryGate.status).not.toBe('ready');
    expect(flow.leadMemoryGate.forbiddenFields).toContain('raw private message');
    expect(flow.recoveryPlan.map(item => item.id)).toContain('lead-receipt-rejected');
    expect(serialized).not.toContain('13800000000');
    expect(serialized).not.toContain('token-value');
    expect(serialized).not.toContain('cookie-value');
  });

  it('allows aggregate-only memory writes after an accepted lead receipt', async () => {
    clearRestaurantAgentReceiptsForTest();
    clearRestaurantAgentRunsForTest();
    const now = new Date('2026-05-26T14:00:00.000Z');
    const run = recordRestaurantAgentRun(buildRestaurantAgentDispatch({
      taskId: 'memory-followup',
      restaurant: 'Accepted Lead Bistro',
      offer: 'Table booking',
      owner: 'store-manager',
    }), 'local', undefined, now);
    const receipt = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: 'dianping',
      evidenceUrl: 'https://merchant.example.cn/proof/lead-sandbox',
      externalRunId: 'external-lead-run-1',
      operator: 'runtime-admin',
      summary: 'reservation aggregate receipt accepted',
      source: 'manual',
      signalType: 'reservation',
      reservationCount: 3,
    }, now);
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger({
      availableMaterials: ['reservation policy'],
      configuredProviders: [],
    });
    const providerSetupState = buildRestaurantProviderSetupStateSummary(now);
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({ providerSetupState, now });
    const customerDemandGateway = buildRestaurantCustomerDemandGateway({
      restaurant: 'Accepted Lead Bistro',
      offer: 'Table booking',
      capabilityTrainingPlan,
      providerSetupState,
      now,
    });
    const queue = buildRestaurantStoreManagerTaskQueue(now);
    const channelHub = buildRestaurantAgentChannelHub({ restaurant: 'Accepted Lead Bistro', offer: 'Table booking', now });
    const nextLoopChannelPlan = buildRestaurantNextLoopChannelPlan({
      restaurant: 'Accepted Lead Bistro',
      offer: 'Table booking',
      postRunReviewPack: buildRestaurantPostRunReviewPack({
        restaurant: 'Accepted Lead Bistro',
        offer: 'Table booking',
        queue,
        runs: [],
        receipts: [receipt],
        readiness: buildRestaurantExternalReadiness({}),
        now,
      }),
      channelHub,
      channelDeliveryReport: buildRestaurantAgentChannelDeliveryReport(now),
      storeManagerTaskQueue: queue,
      now,
    });
    const leadCaptureInbox = buildRestaurantLeadCaptureInbox({
      restaurant: 'Accepted Lead Bistro',
      offer: 'Table booking',
      customerDemandGateway,
      businessSignals: buildRestaurantBusinessSignals([], [receipt], now),
      channelHub,
      nextLoopChannelPlan,
      now,
    });
    const leadAcquisitionProviderWorkbench = buildRestaurantLeadAcquisitionProviderWorkbench({
      restaurant: 'Accepted Lead Bistro',
      offer: 'Table booking',
      leadCaptureInbox,
      customerDemandGateway,
      providerReadinessHealth,
      operatingDataContract: buildRestaurantOperatingDataContract({ posImports: [], now }),
      now,
    });
    const flow = buildRestaurantLeadSandboxAcceptanceFlow({
      restaurant: 'Accepted Lead Bistro',
      offer: 'Table booking',
      leadAcquisitionProviderWorkbench,
      receipts: [receipt],
      now,
    });

    expect(receipt.status).toBe('accepted');
    expect(flow.summary.acceptedLeadReceipts).toBe(1);
    expect(flow.leadMemoryGate.writeMode).toBe('aggregate-only-after-accepted-receipt');
    expect(flow.leadMemoryGate.status).toBe('ready');
    expect(flow.receiptAcceptance.acceptedReceiptIds).toContain(receipt.receiptId);
    expect(flow.leadMemoryGate.allowedFields).toContain('aggregate counts');
    expect(flow.safetyBoundary).toContain('only writes lead memory after accepted receipts');
  });
});

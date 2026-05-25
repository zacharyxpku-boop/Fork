import { beforeEach, describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantAgentCommandCenter } from '@/lib/restaurant-agent-command-center';
import { clearRestaurantAgentChannelDeliveryAttemptsForTest } from '@/lib/restaurant-agent-channel-delivery-store';
import { clearRestaurantClawSkillExecutionsForTest, recordRestaurantClawSkillExecution } from '@/lib/restaurant-claw-skill-execution-store';
import { buildRestaurantClawSkillWorkbench } from '@/lib/restaurant-claw-skill-workbench';
import { clearRestaurantProviderSetupStateForTest } from '@/lib/restaurant-provider-setup-state-store';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';
import { clearRestaurantStoreManagerTasksForTest, recordRestaurantStoreManagerTasksFromClawExecution } from '@/lib/restaurant-store-manager-task-store';

describe('restaurant agent command center', () => {
  beforeEach(() => {
    clearRestaurantAgentChannelDeliveryAttemptsForTest();
    clearRestaurantProviderSetupStateForTest();
    clearRestaurantClawSkillExecutionsForTest();
    clearRestaurantStoreManagerTasksForTest();
  });

  it('starts with a controlled trial as the primary action before any run exists', async () => {
    const center = await buildRestaurantAgentCommandCenter({
      restaurant: '北城面馆',
      offer: '番茄牛腩面套餐',
      runs: [],
      receipts: [],
      now: new Date('2026-05-23T09:00:00.000Z'),
    });

    expect(center.payloadShape).toBe('restaurant-agent-command-center-v1');
    expect(center.mode).toBe('trial-ready');
    expect(center.primaryAction.action).toBe('controlled-trial-run');
    expect(center.summary.providerGates).toBeGreaterThan(0);
    expect(center.storeManagerFollowup.payloadShape).toBe('restaurant-store-manager-followup-v1');
    expect(center.storeManagerFollowup.summary.blocked).toBe(1);
    expect(center.benchmarkStrategy.recommendation).toBe('kuaizi-platform-spine-plus-claw-agent-layer');
    expect(center.activationCockpit.payloadShape).toBe('restaurant-activation-cockpit-v1');
    expect(center.activationCockpit.summary.providerGated).toBeGreaterThan(0);
    expect(center.activationCockpit.lanes.map(item => item.id)).toContain('publish-and-proof');
    expect(center.clawSkillWorkbench.payloadShape).toBe('restaurant-claw-skill-workbench-v1');
    expect(center.clawSkillWorkbench.summary.runnableNow).toBeGreaterThan(0);
    expect(center.clawSkillExecutionLedger.payloadShape).toBe('restaurant-claw-skill-execution-ledger-v1');
    expect(center.clawSkillExecutionLedger.summary.total).toBeGreaterThanOrEqual(0);
    expect(center.aiEmployeeInbox.payloadShape).toBe('restaurant-ai-employee-inbox-v1');
    expect(center.aiEmployeeInbox.summary.messages).toBeGreaterThan(0);
    expect(center.channelHub.payloadShape).toBe('restaurant-agent-channel-hub-v1');
    expect(center.channelHub.summary.scheduledJobs).toBeGreaterThan(0);
    expect(center.channelHub.channels.map(item => item.id)).toContain('wecom');
    expect(center.channelDeliveryReport.payloadShape).toBe('restaurant-agent-channel-delivery-report-v1');
    expect(center.summary.channelDeliveryAttempts).toBe(0);
    expect(center.publicIntelligenceBrief.payloadShape).toBe('restaurant-public-intelligence-brief-v1');
    expect(center.publicIntelligenceBrief.platformProfiles.map(item => item.platform)).toContain('dianping-meituan');
    expect(center.providerSetupWizard.payloadShape).toBe('restaurant-provider-setup-wizard-v1');
    expect(center.providerSetupWizard.summary.missing).toBeGreaterThan(0);
    expect(center.providerSetupState.payloadShape).toBe('restaurant-provider-setup-state-summary-v1');
    expect(center.providerReadinessHealth.payloadShape).toBe('restaurant-provider-readiness-health-v1');
    expect(center.providerReadinessHealth.summary.missingConfig).toBeGreaterThan(0);
    expect(center.providerUnlockLadder.payloadShape).toBe('restaurant-provider-unlock-ladder-v1');
    expect(center.providerUnlockLadder.summary.capabilities).toBe(6);
    expect(center.providerUnlockLadder.summary.canClaimExternalAutomation).toBe(false);
    expect(center.staffNotificationAuditLog.payloadShape).toBe('restaurant-staff-notification-audit-log-v1');
    expect(center.safetyBoundary).toContain('does not log in, publish');
    expect(center.operatorBrief.join('\n')).toContain('provider gates');
  });

  it('surfaces remembered Claw skill execution packs in the command center', async () => {
    const workbench = buildRestaurantClawSkillWorkbench({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      now: new Date('2026-05-24T09:00:00.000Z'),
    });
    const record = recordRestaurantClawSkillExecution(workbench, new Date('2026-05-24T09:01:00.000Z'));
    recordRestaurantStoreManagerTasksFromClawExecution(record, new Date('2026-05-24T09:01:30.000Z'));

    const center = await buildRestaurantAgentCommandCenter({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      runs: [],
      receipts: [],
      now: new Date('2026-05-24T09:02:00.000Z'),
    });

    expect(center.summary.clawSkillExecutionRecords).toBeGreaterThanOrEqual(1);
    expect(center.clawSkillExecutionLedger.summary.total).toBeGreaterThanOrEqual(1);
    expect(center.clawSkillExecutionLedger.latest.map(item => item.restaurant)).toContain('North City Noodles');
    expect(center.clawSkillExecutionLedger.safetyBoundary).toContain('does not claim automatic publishing');
    expect(center.storeManagerTaskQueue.summary.total).toBeGreaterThanOrEqual(3);
    expect(center.storeManagerTaskQueue.tasks.map(item => item.source)).toContain('claw-skill-execution');
  });

  it('promotes accepted proof into business-review mode without claiming real automation', async () => {
    const dispatch = buildRestaurantAgentDispatch({
      taskId: 'public-proof-check',
      restaurant: '北城面馆',
      offer: '番茄牛腩面套餐',
      owner: '店长',
      runtimeTarget: 'openclaw',
    });
    const run = recordRestaurantAgentRun(dispatch, 'openclaw', {
      ok: true,
      target: 'openclaw',
      status: 'forwarded',
      message: 'forwarded',
      audit: { secretExposed: false, payloadShape: 'restaurant-agent-external-execution-v1', blockedActions: [], canForward: true },
    }, new Date('2026-05-23T09:01:00.000Z'));
    const receipt = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: '大众点评',
      evidenceUrl: 'https://www.dianping.com/shop/123/review/456',
      externalRunId: 'openclaw-run-public-proof-1',
      operator: '店长',
      summary: 'Public publish proof accepted.',
      source: 'external-runtime',
      signalType: 'visit-intent',
      reservationCount: 0,
      couponClaimCount: 1,
      redemptionCount: 0,
      inquiryCount: 0,
      visitIntentCount: 2,
    }, new Date('2026-05-23T09:05:00.000Z'));

    const center = await buildRestaurantAgentCommandCenter({
      restaurant: '北城面馆',
      offer: '番茄牛腩面套餐',
      runs: [run],
      receipts: [receipt],
      now: new Date('2026-05-23T09:06:00.000Z'),
    });

    expect(center.mode).toBe('business-review');
    expect(center.primaryAction.action).toBe('store-manager-followup');
    expect(center.summary.acceptedReceipts).toBe(1);
    expect(center.storeManagerFollowup.summary.today).toBe(1);
    expect(center.storeManagerFollowup.tasks[0]).toEqual(expect.objectContaining({
      owner: 'store-manager',
      priority: 'today',
    }));
    expect(center.currentEvidence).toContain('https://www.dianping.com');
    expect(center.operatorBrief.join('\n')).toContain('external forward blocked');
  });

  it('is exposed through the restaurant runtime API', async () => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();

    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'command-center',
        restaurant: '北城面馆',
        offer: '番茄牛腩面套餐',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.commandCenter.payloadShape).toBe('restaurant-agent-command-center-v1');
    expect(payload.commandCenter.benchmarkStrategy.payloadShape).toBe('restaurant-benchmark-strategy');
    expect(payload.commandCenter.activationCockpit.payloadShape).toBe('restaurant-activation-cockpit-v1');
    expect(payload.commandCenter.clawSkillWorkbench.payloadShape).toBe('restaurant-claw-skill-workbench-v1');
    expect(payload.commandCenter.clawSkillExecutionLedger.payloadShape).toBe('restaurant-claw-skill-execution-ledger-v1');
    expect(payload.commandCenter.aiEmployeeInbox.payloadShape).toBe('restaurant-ai-employee-inbox-v1');
    expect(payload.commandCenter.channelHub.payloadShape).toBe('restaurant-agent-channel-hub-v1');
    expect(payload.commandCenter.channelDeliveryReport.payloadShape).toBe('restaurant-agent-channel-delivery-report-v1');
    expect(payload.commandCenter.publicIntelligenceBrief.payloadShape).toBe('restaurant-public-intelligence-brief-v1');
    expect(payload.commandCenter.providerSetupWizard.payloadShape).toBe('restaurant-provider-setup-wizard-v1');
    expect(payload.commandCenter.providerSetupState.payloadShape).toBe('restaurant-provider-setup-state-summary-v1');
    expect(payload.commandCenter.providerReadinessHealth.payloadShape).toBe('restaurant-provider-readiness-health-v1');
    expect(payload.commandCenter.providerUnlockLadder.payloadShape).toBe('restaurant-provider-unlock-ladder-v1');
    expect(payload.commandCenter.staffNotificationAuditLog.payloadShape).toBe('restaurant-staff-notification-audit-log-v1');
    expect(payload.commandCenter.restaurant).toBe('北城面馆');
    expect(payload.commandCenter.secondaryActions.map((item: { label: string }) => item.label)).toEqual(['Open Timeline', 'Setup Gates']);
  });
});

import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantClawExperienceDefaultPath } from '@/lib/restaurant-claw-experience-default-path';

describe('restaurant claw experience default path', () => {
  it('combines route decision, skill workbench, trial workflow and activation gates into one default path', async () => {
    const path = await buildRestaurantClawExperienceDefaultPath({
      restaurant: 'Default Path Bistro',
      offer: 'Two-person dinner set',
      audience: 'nearby dinner guests',
      channels: 'Dianping / Xiaohongshu / WeChat group',
      visitReason: 'reserve tonight without waiting',
      now: new Date('2026-05-25T17:20:00.000Z'),
    });

    expect(path.payloadShape).toBe('restaurant-claw-experience-default-path-v1');
    expect(path.mode).toBe('internal-first-provider-gated');
    expect(path.summary.steps).toBe(7);
    expect(path.summary.readyNow).toBeGreaterThan(0);
    expect(path.summary.trainingNeeded).toBeGreaterThan(0);
    expect(path.summary.providerGated).toBeGreaterThan(0);
    expect(path.summary.canRunTodayWithoutProvider).toBe(true);
    expect(path.summary.canClaimExternalAutomation).toBe(false);
    expect(path.primaryPath.map(step => step.id)).toEqual([
      'route',
      'brief',
      'skill-pack',
      'training',
      'controlled-run',
      'provider-unlock',
      'automation-boundary',
    ]);
    expect(path.quickActions.map(action => action.action)).toContain('claw-skill-workbench');
    expect(path.routeDecision.finalTarget).toBe('platform-spine-plus-claw-experience-plus-restaurant-data-contracts');
    expect(path.skillWorkbench.summary.runnableNow).toBeGreaterThan(0);
    expect(path.trialWorkflow.summary.canAutoExecuteExternally).toBe(false);
    expect(path.providerNeeded.length).toBeGreaterThan(0);
    expect(path.safetyBoundary).toContain('does not log in');
  });

  it('is exposed through the runtime API without claiming external automation', async () => {
    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'claw-experience-default-path',
        restaurant: 'API Default Bistro',
        offer: 'Late dinner set',
      }),
    }));
    const payload = await response.json();
    const serialized = JSON.stringify(payload);

    expect(response.status).toBe(200);
    expect(payload.clawExperienceDefaultPath.payloadShape).toBe('restaurant-claw-experience-default-path-v1');
    expect(payload.clawExperienceDefaultPath.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.clawExperienceDefaultPath.routeDecision.providerKeyChecklist).toContain('RESTAURANT_AGENT_CALLBACK_SECRET');
    expect(payload.clawSkillWorkbench.payloadShape).toBe('restaurant-claw-skill-workbench-v1');
    expect(payload.clawSkillExecutionRecord.payloadShape).toBe('restaurant-claw-skill-execution-record-v1');
    expect(payload.storeManagerTaskQueue.payloadShape).toBe('restaurant-store-manager-task-queue-v1');
    expect(payload.staffNotificationHandoff.payloadShape).toBe('restaurant-staff-notification-handoff-v1');
    expect(payload.providerSetupPack.payloadShape).toBe('restaurant-provider-setup-pack-v1');
    expect(payload.externalUnlockRequestPack.payloadShape).toBe('restaurant-external-unlock-request-pack-v1');
    expect(payload.controlledTrialRun.payloadShape).toBe('restaurant-controlled-trial-run-v1');
    expect(payload.controlledTrialRun.mode).toBe('local-simulator');
    expect(payload.controlledTrialRun.simulation.receipt.status).toBe('accepted');
    expect(payload.browserGatewayPack.payloadShape).toBe('restaurant-browser-gateway-pack-v1');
    expect(payload.browserGatewayPack.canExecuteNow).toBe(false);
    expect(payload.browserGatewayPack.browserRequest.forbiddenFields).toContain('cookie');
    expect(payload.runtimeRunnerLoopPack.payloadShape).toBe('restaurant-runtime-runner-loop-pack-v1');
    expect(payload.runtimeRunnerLoopPack.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.providerReadinessHealth.payloadShape).toBe('restaurant-provider-readiness-health-v1');
    expect(payload.providerSetupWizard.payloadShape).toBe('restaurant-provider-setup-wizard-v1');
    expect(payload.providerUnlockLadder.payloadShape).toBe('restaurant-provider-unlock-ladder-v1');
    expect(payload.providerLaunchBoard.payloadShape).toBe('restaurant-provider-launch-board-v1');
    expect(payload.platformConnectorMatrix.payloadShape).toBe('restaurant-platform-connector-matrix-v1');
    expect(payload.aiConsultantCopilot.payloadShape).toBe('restaurant-ai-consultant-copilot-v1');
    expect(payload.dayZeroMissionPack.payloadShape).toBe('restaurant-day-zero-mission-pack-v1');
    expect(payload.storeOperatingPlan.payloadShape).toBe('restaurant-store-operating-plan-v1');
    expect(payload.aiCockpit.payloadShape).toBe('restaurant-ai-cockpit-v1');
    expect(payload.customerDemandGateway.payloadShape).toBe('restaurant-customer-demand-gateway-v1');
    expect(payload.voiceOrderConsole.payloadShape).toBe('restaurant-voice-order-console-v1');
    expect(payload.providerUnlockLadder.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.providerLaunchBoard.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.platformConnectorMatrix.verdict).toBe('provider-setup-required');
    expect(payload.aiCockpit.zones.map((item: { id: string }) => item.id)).toEqual([
      'today-operations',
      'ai-consultant',
      'automation-launch',
      'evidence-review',
    ]);
    expect(payload.aiCockpit.summary.canClaimAutomation).toBe(false);
    expect(payload.posImport.payloadShape).toBe('restaurant-pos-import-v1');
    expect(payload.posImport.status).toBe('accepted');
    expect(payload.operatingDataContract.payloadShape).toBe('restaurant-operating-data-contract');
    expect(payload.storeDataImportCenter.payloadShape).toBe('restaurant-store-data-import-center-v1');
    expect(payload.storeDataImportCenter.summary.canClaimTrueOperatingAnalysis).toBe(false);
    expect(payload.storeDataImportCenter.sources.map((item: { id: string }) => item.id)).toContain('finance-margin');
    expect(payload.operatingInsightReport.payloadShape).toBe('restaurant-operating-insight-report-v1');
    expect(payload.postRunReviewPack.payloadShape).toBe('restaurant-post-run-review-pack-v1');
    expect(payload.nextLoopChannelPlan.payloadShape).toBe('restaurant-next-loop-channel-plan-v1');
    expect(payload.nextLoopChannelPlan.summary.canRunInternallyNow).toBe(true);
    expect(payload.publicIntelligenceBrief.payloadShape).toBe('restaurant-public-intelligence-brief-v1');
    expect(payload.reputationCloseoutPack.payloadShape).toBe('restaurant-reputation-closeout-pack-v1');
    expect(payload.reputationCloseoutPack.summary.canClaimAutoReviewReply).toBe(false);
    expect(payload.reputationCloseoutPack.sources.map((item: { id: string }) => item.id)).toContain('manual-review-import');
    expect(payload.leadCaptureInbox.payloadShape).toBe('restaurant-lead-capture-inbox-v1');
    expect(payload.leadCaptureInbox.summary.canClaimAutoLeadCapture).toBe(false);
    expect(payload.leadCaptureInbox.summary.canClaimAutoCustomerContact).toBe(false);
    expect(payload.leadCaptureInbox.sources.map((item: { id: string }) => item.id)).toContain('private-domain-inquiry');
    expect(payload.leadAcquisitionProviderWorkbench.payloadShape).toBe('restaurant-lead-acquisition-provider-workbench-v1');
    expect(payload.leadAcquisitionProviderWorkbench.summary.canClaimAutoCustomerContact).toBe(false);
    expect(payload.leadAcquisitionProviderWorkbench.providerAcceptanceContract.forbiddenPayloadFields).toContain('raw private message');
    expect(payload.leadSandboxAcceptanceFlow.payloadShape).toBe('restaurant-lead-sandbox-acceptance-flow-v1');
    expect(payload.leadSandboxAcceptanceFlow.summary.canClaimAutoAcquisition).toBe(false);
    expect(payload.leadSandboxAcceptanceFlow.sanitizedProviderPackage.callbackAction).toBe('lead-acquisition-receipt');
    expect(payload.publishExecutionInbox.payloadShape).toBe('restaurant-publish-execution-inbox-v1');
    expect(payload.publishExecutionInbox.summary.canClaimAutoPublish).toBe(false);
    expect(payload.publishExecutionInbox.tasks.map((item: { id: string }) => item.id)).toContain('submit-browser-runner');
    expect(payload.providerAcceptanceWorkbench.payloadShape).toBe('restaurant-provider-acceptance-workbench-v1');
    expect(payload.providerAcceptanceWorkbench.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.providerAcceptanceWorkbench.stages.map((item: { id: string }) => item.id)).toContain('callback');
    expect(payload.residentAgentMissionControl.payloadShape).toBe('restaurant-resident-agent-mission-control-v1');
    expect(payload.residentAgentMissionControl.summary.canClaimAutonomousOutcomes).toBe(false);
    expect(payload.shiftAutopilot.payloadShape).toBe('restaurant-shift-autopilot-v1');
    expect(payload.shiftAutopilotRun.payloadShape).toBe('restaurant-shift-autopilot-run-v1');
    expect(payload.shiftOperatingLoopPack.payloadShape).toBe('restaurant-shift-operating-loop-pack-v1');
    expect(payload.shiftOperatingLoopPack.summary.canClaimExternalAutomation).toBe(false);
    expect(payload.aiEmployeeMemoryPack.payloadShape).toBe('restaurant-ai-employee-memory-pack-v1');
    expect(payload.aiEmployeeMemoryPack.employee.safeToAutonomouslyRun).toBe(false);
    expect(payload.operatingInsightReport.summary.canClaimTrueOperatingAnalysis).toBe(false);
    expect(JSON.stringify(payload)).not.toMatch(/1[3-9]\d{9}/);
    expect(JSON.stringify(payload)).not.toContain('rawPrivateMessage');
    expect(payload.receipts.length).toBeGreaterThan(0);
    expect(payload.providerSetupPack.summary.readyForExternalExecution).toBe(false);
    expect(payload.externalUnlockRequestPack.summary.canClaimExternalAutomation).toBe(false);
    expect(serialized).not.toContain('secret-value');
    expect(serialized).not.toContain('cookie-value');
    expect(serialized).not.toContain('token-value');
  });
});

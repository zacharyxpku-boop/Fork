import { NextRequest, NextResponse } from 'next/server';
import { buildRestaurantActivationGates } from '@/lib/restaurant-agent-activation-gates';
import { buildRestaurantBusinessSignals } from '@/lib/restaurant-agent-business-signals';
import { buildRestaurantBuildQueue } from '@/lib/restaurant-agent-build-queue';
import { buildRestaurantAgentChannelDeliveryReport, executeRestaurantAgentChannelDeliveryAttempt, recordRestaurantAgentChannelDeliveryAcknowledgement } from '@/lib/restaurant-agent-channel-delivery-store';
import { buildRestaurantAgentChannelHub } from '@/lib/restaurant-agent-channel-hub';
import { runRestaurantAgentChannelSchedule } from '@/lib/restaurant-agent-channel-scheduler';
import { buildRestaurantAgentCommandCenter } from '@/lib/restaurant-agent-command-center';
import { buildRestaurantAiCockpit } from '@/lib/restaurant-ai-cockpit';
import { buildRestaurantAiConsultantCopilot } from '@/lib/restaurant-ai-consultant-copilot';
import { buildRestaurantAiEmployeeMemoryPack } from '@/lib/restaurant-ai-employee-memory-pack';
import { buildRestaurantCommandRoute } from '@/lib/restaurant-command-router';
import { buildRestaurantBrowserRunnerCallbackContract } from '@/lib/restaurant-agent-browser-runner-contract';
import { buildRestaurantBrowserRunnerEventHealth, listRestaurantBrowserRunnerEvents, recordRestaurantBrowserRunnerEvent } from '@/lib/restaurant-agent-browser-runner-event-store';
import { buildRestaurantBrowserRunbookPackage } from '@/lib/restaurant-agent-browser-runbook';
import { buildRestaurantBrowserGatewayPack } from '@/lib/restaurant-browser-gateway-pack';
import { buildRestaurantBrowserSessionManifest } from '@/lib/restaurant-agent-browser-session';
import { buildRestaurantBrowserSessionHealth, heartbeatRestaurantBrowserSession, listRestaurantBrowserSessions, recordRestaurantBrowserSession } from '@/lib/restaurant-agent-browser-session-store';
import { buildRestaurantCapabilityTrainingPlanFromLedger, listRestaurantCapabilityTrainingRecords, recordRestaurantCapabilityTrainingRecord } from '@/lib/restaurant-capability-training';
import { runRestaurantCallbackSimulator } from '@/lib/restaurant-agent-callback-simulator';
import { verifyRestaurantAgentCallback } from '@/lib/restaurant-agent-callback';
import { buildRestaurantCompetitorAuditReport } from '@/lib/restaurant-agent-competitor-audit';
import { buildRestaurantCompetitorRouteDecision } from '@/lib/restaurant-competitor-route-decision';
import { buildRestaurantCompetitorTrainingBlueprint } from '@/lib/restaurant-competitor-training-blueprint';
import { buildRestaurantDefaultPathForwardableBrief } from '@/lib/restaurant-default-path-forwardable-brief';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantAgentExecutionPackage } from '@/lib/restaurant-agent-execution-package';
import { buildRestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantExternalExecutionWizard } from '@/lib/restaurant-external-execution-wizard';
import { buildRestaurantExternalAccessGuide } from '@/lib/restaurant-external-access-guide';
import { buildRestaurantExternalUnlockRequestPack } from '@/lib/restaurant-external-unlock-request-pack';
import { buildRestaurantExecutionTimeline } from '@/lib/restaurant-execution-timeline';
import { buildRestaurantFirstForwardableRunPack } from '@/lib/restaurant-first-forwardable-run-pack';
import { buildRestaurantFirstRunControlTower } from '@/lib/restaurant-first-run-control-tower';
import { buildRestaurantMerchantActivationPacket } from '@/lib/restaurant-merchant-activation-packet';
import { buildRestaurantGrantChecklist } from '@/lib/restaurant-agent-grant-checklist';
import { buildRestaurantMerchantGrantManifest } from '@/lib/restaurant-agent-grant-manifest';
import { buildRestaurantAgentHeartbeat } from '@/lib/restaurant-agent-heartbeat';
import { buildRestaurantAgentOpsConsole } from '@/lib/restaurant-agent-ops-console';
import { buildRestaurantAgentRecoveryPlan } from '@/lib/restaurant-agent-recovery';
import { listRestaurantAgentReceipts, recordRestaurantAgentReceipt, type RestaurantBusinessSignalType } from '@/lib/restaurant-agent-receipt-store';
import { buildRestaurantRunHealth } from '@/lib/restaurant-agent-run-health';
import { listRestaurantAgentRuns, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';
import { buildRestaurantRuntimeSetupContract } from '@/lib/restaurant-agent-runtime-setup-contract';
import { forwardRestaurantAgentDispatch, forwardRestaurantAgentExecutionPackage, readRestaurantRuntimeBridgeConfig } from '@/lib/restaurant-agent-runtime-bridge';
import { buildRestaurantAgentRuntime } from '@/lib/restaurant-agent-runtime';
import { buildRestaurantRuntimeAdapterContract } from '@/lib/restaurant-runtime-adapter-contract';
import { buildRestaurantRuntimeRunnerLoopPack } from '@/lib/restaurant-runtime-runner-loop-pack';
import { buildRestaurantResidentAgentMissionControl } from '@/lib/restaurant-resident-agent-mission-control';
import { buildRestaurantAgentToolPolicyReport } from '@/lib/restaurant-agent-tool-policy';
import { buildRestaurantActivationCockpit } from '@/lib/restaurant-activation-cockpit';
import { buildRestaurantAiOsAuditReport } from '@/lib/restaurant-ai-os-audit-report';
import { buildRestaurantBenchmarkStrategy } from '@/lib/restaurant-benchmark-strategy';
import { buildRestaurantClawExperienceDefaultPath } from '@/lib/restaurant-claw-experience-default-path';
import { buildRestaurantClawCloudOperatorHome } from '@/lib/restaurant-claw-cloud-operator-home';
import { buildRestaurantClawSkillCatalog, buildRestaurantClawTrainingBatch } from '@/lib/restaurant-claw-skill-catalog';
import { buildRestaurantClawSkillWorkbench } from '@/lib/restaurant-claw-skill-workbench';
import { buildRestaurantClawSkillExecutionLedger, recordRestaurantClawSkillExecution } from '@/lib/restaurant-claw-skill-execution-store';
import { runRestaurantControlledTrialRun } from '@/lib/restaurant-controlled-trial-run';
import { buildRestaurantCustomerDemandGateway } from '@/lib/restaurant-customer-demand-gateway';
import { buildRestaurantLeadCaptureInbox } from '@/lib/restaurant-lead-capture-inbox';
import { buildRestaurantLeadAcquisitionProviderWorkbench } from '@/lib/restaurant-lead-acquisition-provider-workbench';
import { buildRestaurantLeadSandboxAcceptanceFlow } from '@/lib/restaurant-lead-sandbox-acceptance-flow';
import { buildRestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import { buildRestaurantOperatingInsightReport } from '@/lib/restaurant-operating-insight-report';
import { buildRestaurantPlatformConnectorMatrix } from '@/lib/restaurant-platform-connector-matrix';
import { buildRestaurantPlatformOperatingSpine } from '@/lib/restaurant-platform-operating-spine';
import { buildRestaurantPublishExecutionInbox } from '@/lib/restaurant-publish-execution-inbox';
import { buildRestaurantPosImportReport, type RestaurantPosImportRow } from '@/lib/restaurant-pos-import-validator';
import { buildRestaurantPostRunReviewPack } from '@/lib/restaurant-post-run-review-pack';
import { buildRestaurantNextLoopChannelPlan } from '@/lib/restaurant-next-loop-channel-plan';
import { buildRestaurantReputationCloseoutPack } from '@/lib/restaurant-reputation-closeout-pack';
import { buildRestaurantProviderAcceptanceWorkbench } from '@/lib/restaurant-provider-acceptance-workbench';
import { buildRestaurantProviderSetupPack } from '@/lib/restaurant-provider-setup-pack';
import { buildRestaurantProviderSetupWizard } from '@/lib/restaurant-provider-setup-wizard';
import { buildRestaurantProviderSetupStateSummary, recordRestaurantProviderSetupState } from '@/lib/restaurant-provider-setup-state-store';
import { buildRestaurantProviderAdapterContractPack } from '@/lib/restaurant-provider-adapter-contract-pack';
import { buildRestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import { buildRestaurantProviderUnlockLadder } from '@/lib/restaurant-provider-unlock-ladder';
import { buildRestaurantProviderLaunchBoard } from '@/lib/restaurant-provider-launch-board';
import { buildRestaurantProviderLaunchTrainingPack } from '@/lib/restaurant-provider-launch-training-pack';
import { buildRestaurantProviderKeyGapBoard } from '@/lib/restaurant-provider-key-gap-board';
import { buildRestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';
import { buildRestaurantProviderReceiptLifecycle } from '@/lib/restaurant-provider-receipt-lifecycle';
import { buildRestaurantProviderSandboxContract } from '@/lib/restaurant-provider-sandbox-contract';
import { buildRestaurantProviderSandboxReadinessBoard } from '@/lib/restaurant-provider-sandbox-readiness-board';
import { buildRestaurantProviderSandboxRunConsole } from '@/lib/restaurant-provider-sandbox-run-console';
import { blockedRestaurantProviderSandboxBridge, buildRestaurantProviderSandboxSubmitAttempt, buildRestaurantProviderSandboxSubmitWorkbench, selectRestaurantProviderSandboxSubmitPackage } from '@/lib/restaurant-provider-sandbox-submit-workbench';
import { buildRestaurantPublicIntelligenceBrief } from '@/lib/restaurant-public-intelligence-brief';
import { buildRestaurantPublicProfileIntake } from '@/lib/restaurant-public-profile-intake';
import { buildRestaurantPublicSourceHarvestPack } from '@/lib/restaurant-public-source-harvest-pack';
import { buildRestaurantPublicTrialSeed } from '@/lib/restaurant-public-trial-seed';
import { buildRestaurantDayZeroMissionPack } from '@/lib/restaurant-day-zero-mission-pack';
import { buildRestaurantShiftAutopilot } from '@/lib/restaurant-shift-autopilot';
import { buildRestaurantShiftCapabilityActivationPack } from '@/lib/restaurant-shift-capability-activation-pack';
import { buildRestaurantShiftCloseoutTrainingPack, buildRestaurantShiftCloseoutTrainingRecordAttempt, selectRecordableShiftTrainingDrafts } from '@/lib/restaurant-shift-closeout-training-pack';
import { listRestaurantShiftAutopilotRuns, runRestaurantShiftAutopilot } from '@/lib/restaurant-shift-autopilot-run-store';
import { buildRestaurantShiftFirstForwardableRun } from '@/lib/restaurant-shift-first-forwardable-run';
import { buildRestaurantShiftOperatingLoopPack } from '@/lib/restaurant-shift-operating-loop-pack';
import { buildRestaurantShiftProviderHandoff } from '@/lib/restaurant-shift-provider-handoff';
import { buildRestaurantShiftSandboxAcceptance } from '@/lib/restaurant-shift-sandbox-acceptance';
import { blockedShiftSandboxBridge, buildRestaurantShiftSandboxForwardAttempt, selectShiftForwardPackage } from '@/lib/restaurant-shift-sandbox-forward';
import { buildRestaurantStoreOperatingPlan } from '@/lib/restaurant-store-operating-plan';
import { buildRestaurantStoreDataImportCenter } from '@/lib/restaurant-store-data-import-center';
import { buildRestaurantStoreManagerFollowupPack } from '@/lib/restaurant-store-manager-followup';
import { buildRestaurantStoreManagerTaskQueue, recordRestaurantStoreManagerTasks, recordRestaurantStoreManagerTasksFromClawExecution, recordRestaurantStoreManagerTasksFromDayZeroMissionPack, updateRestaurantStoreManagerTaskStatus } from '@/lib/restaurant-store-manager-task-store';
import { buildRestaurantStoreManagerTaskWatcher } from '@/lib/restaurant-store-manager-task-watcher';
import { buildRestaurantStaffNotificationAuditLog, recordRestaurantStaffNotificationAuditEventsFromDeliveryBridge, recordRestaurantStaffNotificationAuditEventsFromHandoff } from '@/lib/restaurant-staff-notification-audit-store';
import { buildRestaurantStaffNotificationHandoff } from '@/lib/restaurant-staff-notification-handoff';
import { buildRestaurantStaffNotificationDeliveryBridge } from '@/lib/restaurant-staff-notification-delivery-bridge';
import { buildRestaurantTaskProviderHandoff } from '@/lib/restaurant-task-provider-handoff';
import { buildRestaurantTodayCommandCockpit } from '@/lib/restaurant-today-command-cockpit';
import { buildRestaurantTrialWorkflowPack } from '@/lib/restaurant-trial-workflow-pack';
import { buildRestaurantVoiceOrderConsole } from '@/lib/restaurant-voice-order-console';

function readBusinessSignalType(value: unknown): RestaurantBusinessSignalType | undefined {
  return value === 'publish-proof'
    || value === 'reservation'
    || value === 'coupon-claim'
    || value === 'redemption'
    || value === 'private-domain-followup'
    || value === 'visit-intent'
    || value === 'manual-review'
    ? value
    : undefined;
}

export async function GET() {
  return NextResponse.json({ ok: true, runtime: buildRestaurantAgentRuntime(), readiness: buildRestaurantExternalReadiness(), runs: listRestaurantAgentRuns(), receipts: listRestaurantAgentReceipts() }, {
    headers: { 'Cache-Control': 'no-store' },
  });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text().catch(() => '');
  let body: Record<string, unknown> | null = null;
  try {
    const parsed = rawBody ? JSON.parse(rawBody) : null;
    body = parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : null;
  } catch {
    body = null;
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'invalid_request_body', message: '请提交有效的 JSON。' }, { status: 400 });
  }

  if (body.action === 'heartbeat') {
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    return NextResponse.json({
      ok: true,
      heartbeat: buildRestaurantAgentHeartbeat(runs, receipts, {
        shiftAutopilotRuns: listRestaurantShiftAutopilotRuns(),
        storeManagerTaskQueue,
      }),
      runs,
      receipts,
      shiftAutopilotRuns: listRestaurantShiftAutopilotRuns(),
      storeManagerTaskQueue,
    });
  }

  if (body.action === 'readiness') {
    return NextResponse.json({
      ok: true,
      readiness: buildRestaurantExternalReadiness(),
    });
  }

  if (body.action === 'recovery') {
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();
    return NextResponse.json({
      ok: true,
      recovery: buildRestaurantAgentRecoveryPlan(runs, receipts, readiness),
      runs,
      receipts,
      readiness,
    });
  }

  if (body.action === 'run-health') {
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();
    return NextResponse.json({
      ok: true,
      runHealth: buildRestaurantRunHealth(runs, receipts, readiness),
      providerReceiptInbox: buildRestaurantProviderReceiptInbox({ runs, receipts, readiness }),
      runs,
      receipts,
      readiness,
    });
  }

  if (body.action === 'provider-receipt-inbox') {
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();
    return NextResponse.json({
      ok: true,
      providerReceiptInbox: buildRestaurantProviderReceiptInbox({ runs, receipts, readiness }),
      runHealth: buildRestaurantRunHealth(runs, receipts, readiness),
      recovery: buildRestaurantAgentRecoveryPlan(runs, receipts, readiness),
      runs,
      receipts,
      readiness,
    });
  }

  if (body.action === 'provider-receipt-lifecycle') {
    const now = new Date();
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue(now);
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({ runs, receipts, readiness, now });
    const postRunReviewPack = buildRestaurantPostRunReviewPack({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      queue: storeManagerTaskQueue,
      runs,
      receipts,
      readiness,
      providerReceiptInbox,
      now,
    });
    return NextResponse.json({
      ok: true,
      providerReceiptLifecycle: buildRestaurantProviderReceiptLifecycle({
        runs,
        receipts,
        providerReceiptInbox,
        postRunReviewPack,
        now,
      }),
      providerReceiptInbox,
      postRunReviewPack,
      businessSignals: buildRestaurantBusinessSignals(runs, receipts, now),
      runHealth: buildRestaurantRunHealth(runs, receipts, readiness, now),
      runs,
      receipts,
    });
  }

  if (body.action === 'provider-key-gap-board') {
    return NextResponse.json({
      ok: true,
      providerKeyGapBoard: buildRestaurantProviderKeyGapBoard({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        audience: typeof body.audience === 'string' ? body.audience : undefined,
        channels: typeof body.channels === 'string' ? body.channels : undefined,
        visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
        constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
        evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      }),
      platformConnectorMatrix: buildRestaurantPlatformConnectorMatrix(),
      externalUnlockRequestPack: buildRestaurantExternalUnlockRequestPack({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        audience: typeof body.audience === 'string' ? body.audience : undefined,
        channels: typeof body.channels === 'string' ? body.channels : undefined,
        visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
        constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
        evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      }),
      providerSetupWizard: buildRestaurantProviderSetupWizard({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        audience: typeof body.audience === 'string' ? body.audience : undefined,
        channels: typeof body.channels === 'string' ? body.channels : undefined,
        visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
        constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
        evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      }),
      readiness: buildRestaurantExternalReadiness(),
    });
  }

  if (body.action === 'business-signals') {
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    return NextResponse.json({
      ok: true,
      businessSignals: buildRestaurantBusinessSignals(runs, receipts),
      runs,
      receipts,
    });
  }

  if (body.action === 'provider-sandbox-contract') {
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const runtimeProbe = await buildRestaurantRuntimeProbe();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
    });
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    const taskProviderHandoff = buildRestaurantTaskProviderHandoff({
      queue: storeManagerTaskQueue,
      target: body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
        ? body.runtimeTarget
        : undefined,
    });
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({ runs, receipts, readiness });
    return NextResponse.json({
      ok: true,
      providerSandboxContract: buildRestaurantProviderSandboxContract({
        runtimeProbe,
        providerReadinessHealth,
        taskProviderHandoff,
        providerReceiptInbox,
      }),
      runtimeProbe,
      providerReadinessHealth,
      taskProviderHandoff,
      providerReceiptInbox,
      storeManagerTaskQueue,
      providerSetupState,
      runs,
      receipts,
    });
  }

  if (body.action === 'provider-sandbox-submit-workbench') {
    const runtimeTarget = body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
      ? body.runtimeTarget
      : 'openclaw';
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const runtimeProbe = await buildRestaurantRuntimeProbe();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
      runtimeProbe,
    });
    const providerSetupWizard = buildRestaurantProviderSetupWizard({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      provided: providerSetupState.provided,
    });
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    const taskProviderHandoff = buildRestaurantTaskProviderHandoff({
      queue: storeManagerTaskQueue,
      target: runtimeTarget,
    });
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({ runs, receipts, readiness });
    const providerSandboxContract = buildRestaurantProviderSandboxContract({
      runtimeProbe,
      providerReadinessHealth,
      taskProviderHandoff,
      providerReceiptInbox,
    });
    const operatingDataContract = buildRestaurantOperatingDataContract({
      receipts,
      readiness,
    });
    const browserGatewayPack = buildRestaurantBrowserGatewayPack({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
    });
    const runtimeRunnerLoopPack = buildRestaurantRuntimeRunnerLoopPack({
      runs,
      receipts,
      readiness,
    });
    const channelDeliveryReport = buildRestaurantAgentChannelDeliveryReport();
    const businessSignals = buildRestaurantBusinessSignals(runs, receipts);
    const recovery = buildRestaurantAgentRecoveryPlan(runs, receipts, readiness);
    const publishExecutionInbox = buildRestaurantPublishExecutionInbox({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      browserGatewayPack,
      runtimeRunnerLoopPack,
      channelDeliveryReport,
      businessSignals,
      recovery,
    });
    const providerAcceptanceWorkbench = buildRestaurantProviderAcceptanceWorkbench({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      providerSetupWizard,
      providerReadinessHealth,
      providerSandboxContract,
      operatingDataContract,
      publishExecutionInbox,
    });

    return NextResponse.json({
      ok: true,
      providerSandboxSubmitWorkbench: buildRestaurantProviderSandboxSubmitWorkbench({
        providerAcceptanceWorkbench,
        providerSandboxContract,
        taskProviderHandoff,
        providerReceiptInbox,
        target: runtimeTarget,
      }),
      providerAcceptanceWorkbench,
      providerSandboxContract,
      taskProviderHandoff,
      providerReceiptInbox,
      providerSetupState,
      providerReadinessHealth,
      storeManagerTaskQueue,
      runs,
      receipts,
    });
  }

  if (body.action === 'provider-sandbox-submit-attempt') {
    const runtimeTarget = body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
      ? body.runtimeTarget
      : 'openclaw';
    const now = new Date();
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();
    const providerSetupState = buildRestaurantProviderSetupStateSummary(now);
    const runtimeProbe = await buildRestaurantRuntimeProbe({ now });
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
      runtimeProbe,
      now,
    });
    const providerSetupWizard = buildRestaurantProviderSetupWizard({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      provided: providerSetupState.provided,
      now,
    });
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue(now);
    const taskProviderHandoff = buildRestaurantTaskProviderHandoff({
      queue: storeManagerTaskQueue,
      target: runtimeTarget,
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
    const operatingDataContract = buildRestaurantOperatingDataContract({
      receipts,
      readiness,
      now,
    });
    const browserGatewayPack = buildRestaurantBrowserGatewayPack({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      now,
    });
    const runtimeRunnerLoopPack = buildRestaurantRuntimeRunnerLoopPack({
      runs,
      receipts,
      readiness,
      now,
    });
    const channelDeliveryReport = buildRestaurantAgentChannelDeliveryReport(now);
    const businessSignals = buildRestaurantBusinessSignals(runs, receipts, now);
    const recovery = buildRestaurantAgentRecoveryPlan(runs, receipts, readiness, now);
    const publishExecutionInbox = buildRestaurantPublishExecutionInbox({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      browserGatewayPack,
      runtimeRunnerLoopPack,
      channelDeliveryReport,
      businessSignals,
      recovery,
      now,
    });
    const providerAcceptanceWorkbench = buildRestaurantProviderAcceptanceWorkbench({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
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
      target: runtimeTarget,
      now,
    });
    const selectedSubmitPackage = selectRestaurantProviderSandboxSubmitPackage({
      workbench: providerSandboxSubmitWorkbench,
      capabilityId: typeof body.capabilityId === 'string' ? body.capabilityId : undefined,
      packageId: typeof body.packageId === 'string' ? body.packageId : undefined,
    });
    const selectedHandoffPackage = selectedSubmitPackage?.selectedPackageId
      ? taskProviderHandoff.packages.find(item => item.executionPackage.packageId === selectedSubmitPackage.selectedPackageId)
      : undefined;
    const bridge = selectedSubmitPackage?.status === 'ready-to-submit' && selectedHandoffPackage?.canForward
      ? await forwardRestaurantAgentExecutionPackage(
          selectedHandoffPackage.executionPackage,
          readRestaurantRuntimeBridgeConfig(runtimeTarget),
        )
      : blockedRestaurantProviderSandboxBridge({
          workbench: providerSandboxSubmitWorkbench,
          selectedPackage: selectedSubmitPackage,
        });
    const run = selectedSubmitPackage?.safePayload ? recordRestaurantAgentRun(buildRestaurantAgentDispatch({
      taskId: selectedSubmitPackage.safePayload.taskId,
      restaurant: selectedSubmitPackage.safePayload.restaurant,
      offer: selectedSubmitPackage.safePayload.offer,
      owner: selectedSubmitPackage.safePayload.owner,
      runtimeTarget: 'local',
      source: 'provider_sandbox_submit_attempt',
    }), runtimeTarget, bridge, now) : undefined;
    const updatedRuns = listRestaurantAgentRuns();
    const updatedReceipts = listRestaurantAgentReceipts();
    const updatedReadiness = buildRestaurantExternalReadiness();
    const updatedProviderReceiptInbox = buildRestaurantProviderReceiptInbox({
      runs: updatedRuns,
      receipts: updatedReceipts,
      readiness: updatedReadiness,
      now,
    });
    const updatedProviderSandboxSubmitWorkbench = buildRestaurantProviderSandboxSubmitWorkbench({
      providerAcceptanceWorkbench,
      providerSandboxContract,
      taskProviderHandoff,
      providerReceiptInbox: updatedProviderReceiptInbox,
      target: runtimeTarget,
      bridgeAttempt: bridge,
      now,
    });
    const providerSandboxSubmitAttempt = buildRestaurantProviderSandboxSubmitAttempt({
      workbench: providerSandboxSubmitWorkbench,
      selectedPackage: selectedSubmitPackage,
      bridge,
      run,
      now,
    });
    const postAttemptReviewPack = buildRestaurantPostRunReviewPack({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      queue: storeManagerTaskQueue,
      runs: updatedRuns,
      receipts: updatedReceipts,
      readiness: updatedReadiness,
      providerReceiptInbox: updatedProviderReceiptInbox,
      now,
    });
    const providerReceiptLifecycle = buildRestaurantProviderReceiptLifecycle({
      runs: updatedRuns,
      receipts: updatedReceipts,
      providerReceiptInbox: updatedProviderReceiptInbox,
      postRunReviewPack: postAttemptReviewPack,
      now,
    });

    return NextResponse.json({
      ok: bridge.ok,
      providerSandboxSubmitAttempt,
      providerSandboxSubmitWorkbench: updatedProviderSandboxSubmitWorkbench,
      providerReceiptLifecycle,
      selectedSubmitPackage,
      providerAcceptanceWorkbench,
      providerSandboxContract,
      taskProviderHandoff,
      providerReceiptInbox: updatedProviderReceiptInbox,
      postRunReviewPack: postAttemptReviewPack,
      providerSetupState,
      providerReadinessHealth,
      storeManagerTaskQueue,
      run,
      runs: updatedRuns,
      receipts: updatedReceipts,
      runHealth: buildRestaurantRunHealth(updatedRuns, updatedReceipts, updatedReadiness, now),
      recovery: buildRestaurantAgentRecoveryPlan(updatedRuns, updatedReceipts, updatedReadiness, now),
    }, { status: bridge.ok ? 202 : 200 });
  }

  if (body.action === 'first-forwardable-run-pack') {
    const runtimeTarget = body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
      ? body.runtimeTarget
      : 'openclaw';
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const runtimeProbe = await buildRestaurantRuntimeProbe();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
    });
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({ runs, receipts, readiness });
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    return NextResponse.json({
      ok: true,
      firstForwardableRunPack: buildRestaurantFirstForwardableRunPack({
        queue: storeManagerTaskQueue,
        target: runtimeTarget,
        runtimeProbe,
        providerReadinessHealth,
        providerReceiptInbox,
      }),
      runtimeProbe,
      providerReadinessHealth,
      providerReceiptInbox,
      storeManagerTaskQueue,
      providerSetupState,
      runs,
      receipts,
    });
  }

  if (body.action === 'first-run-control-tower') {
    const runtimeTarget = body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
      ? body.runtimeTarget
      : 'openclaw';
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const runtimeProbe = await buildRestaurantRuntimeProbe();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
    });
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({ runs, receipts, readiness });
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    return NextResponse.json({
      ok: true,
      firstRunControlTower: buildRestaurantFirstRunControlTower({
        queue: storeManagerTaskQueue,
        runs,
        receipts,
        readiness,
        target: runtimeTarget,
        runtimeProbe,
        providerReadinessHealth,
        providerReceiptInbox,
      }),
      runtimeProbe,
      providerReadinessHealth,
      providerReceiptInbox,
      storeManagerTaskQueue,
      providerSetupState,
      runs,
      receipts,
    });
  }

  if (body.action === 'provider-launch-training-pack') {
    const restaurant = typeof body.restaurant === 'string' ? body.restaurant : undefined;
    const offer = typeof body.offer === 'string' ? body.offer : undefined;
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const runtimeProbe = await buildRestaurantRuntimeProbe();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
    });
    const providerSetupPack = buildRestaurantProviderSetupPack({
      restaurant,
      offer,
    });
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger();
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    const taskProviderHandoff = buildRestaurantTaskProviderHandoff({
      queue: storeManagerTaskQueue,
      target: body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
        ? body.runtimeTarget
        : undefined,
    });
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({ runs, receipts, readiness });
    const providerSandboxContract = buildRestaurantProviderSandboxContract({
      runtimeProbe,
      providerReadinessHealth,
      taskProviderHandoff,
      providerReceiptInbox,
    });
    return NextResponse.json({
      ok: true,
      providerLaunchTrainingPack: buildRestaurantProviderLaunchTrainingPack({
        capabilityTrainingPlan,
        providerSetupPack,
        providerReadinessHealth,
        runtimeProbe,
        providerSandboxContract,
      }),
      capabilityTrainingPlan,
      providerSetupPack,
      providerReadinessHealth,
      runtimeProbe,
      providerSandboxContract,
      providerSetupState,
    });
  }

  if (body.action === 'platform-connector-matrix') {
    return NextResponse.json({
      ok: true,
      platformConnectorMatrix: buildRestaurantPlatformConnectorMatrix(),
    });
  }

  if (body.action === 'ai-os-audit-report') {
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    return NextResponse.json({
      ok: true,
      aiOsAuditReport: buildRestaurantAiOsAuditReport({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        audience: typeof body.audience === 'string' ? body.audience : undefined,
        channels: typeof body.channels === 'string' ? body.channels : undefined,
        visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
        constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
        evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
        runs,
        receipts,
      }),
      runs,
      receipts,
    });
  }

  if (body.action === 'store-manager-followup') {
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const restaurant = typeof body.restaurant === 'string' ? body.restaurant : undefined;
    const offer = typeof body.offer === 'string' ? body.offer : undefined;
    const storeManagerFollowup = buildRestaurantStoreManagerFollowupPack({
      restaurant,
      offer,
      runs,
      receipts,
    });
    const storeManagerTaskRecords = recordRestaurantStoreManagerTasks(storeManagerFollowup.tasks);
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    const storeManagerTaskWatcher = buildRestaurantStoreManagerTaskWatcher(storeManagerTaskQueue);
    const staffNotificationHandoff = buildRestaurantStaffNotificationHandoff(storeManagerTaskWatcher);
    const staffNotificationDeliveryBridge = buildRestaurantStaffNotificationDeliveryBridge({
      handoff: staffNotificationHandoff,
    });
    recordRestaurantStaffNotificationAuditEventsFromHandoff(staffNotificationHandoff);
    recordRestaurantStaffNotificationAuditEventsFromDeliveryBridge(staffNotificationDeliveryBridge);
    const staffNotificationAuditLog = buildRestaurantStaffNotificationAuditLog();
    return NextResponse.json({
      ok: true,
      storeManagerFollowup,
      storeManagerTaskRecords,
      storeManagerTaskQueue,
      storeManagerTaskWatcher,
      staffNotificationHandoff,
      staffNotificationDeliveryBridge,
      taskProviderHandoff: buildRestaurantTaskProviderHandoff({ queue: storeManagerTaskQueue }),
      staffNotificationAuditLog,
      commandCenter: await buildRestaurantAgentCommandCenter({
        restaurant,
        offer,
        runs,
        receipts,
        readiness: buildRestaurantExternalReadiness(),
        browserSessions: listRestaurantBrowserSessions(),
      }),
      runs,
      receipts,
    });
  }

  if (body.action === 'store-manager-task-queue') {
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    const storeManagerTaskWatcher = buildRestaurantStoreManagerTaskWatcher(storeManagerTaskQueue);
    const staffNotificationHandoff = buildRestaurantStaffNotificationHandoff(storeManagerTaskWatcher);
    const staffNotificationDeliveryBridge = buildRestaurantStaffNotificationDeliveryBridge({
      handoff: staffNotificationHandoff,
    });
    return NextResponse.json({
      ok: true,
      storeManagerTaskQueue,
      storeManagerTaskWatcher,
      staffNotificationHandoff,
      staffNotificationDeliveryBridge,
      taskProviderHandoff: buildRestaurantTaskProviderHandoff({
        queue: storeManagerTaskQueue,
        target: body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
          ? body.runtimeTarget
          : undefined,
      }),
      staffNotificationAuditLog: (() => {
        recordRestaurantStaffNotificationAuditEventsFromHandoff(staffNotificationHandoff);
        recordRestaurantStaffNotificationAuditEventsFromDeliveryBridge(staffNotificationDeliveryBridge);
        return buildRestaurantStaffNotificationAuditLog();
      })(),
    });
  }

  if (body.action === 'staff-notification-handoff') {
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    const storeManagerTaskWatcher = buildRestaurantStoreManagerTaskWatcher(storeManagerTaskQueue);
    const staffNotificationHandoff = buildRestaurantStaffNotificationHandoff(storeManagerTaskWatcher);
    const staffNotificationDeliveryBridge = buildRestaurantStaffNotificationDeliveryBridge({
      handoff: staffNotificationHandoff,
    });
    return NextResponse.json({
      ok: true,
      storeManagerTaskQueue,
      storeManagerTaskWatcher,
      staffNotificationHandoff,
      staffNotificationDeliveryBridge,
      taskProviderHandoff: buildRestaurantTaskProviderHandoff({
        queue: storeManagerTaskQueue,
        target: body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
          ? body.runtimeTarget
          : undefined,
      }),
      staffNotificationAuditLog: (() => {
        recordRestaurantStaffNotificationAuditEventsFromHandoff(staffNotificationHandoff);
        recordRestaurantStaffNotificationAuditEventsFromDeliveryBridge(staffNotificationDeliveryBridge);
        return buildRestaurantStaffNotificationAuditLog();
      })(),
    });
  }

  if (body.action === 'staff-notification-delivery-bridge') {
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    const storeManagerTaskWatcher = buildRestaurantStoreManagerTaskWatcher(storeManagerTaskQueue);
    const staffNotificationHandoff = buildRestaurantStaffNotificationHandoff(storeManagerTaskWatcher);
    const staffNotificationDeliveryBridge = buildRestaurantStaffNotificationDeliveryBridge({
      handoff: staffNotificationHandoff,
    });
    return NextResponse.json({
      ok: true,
      staffNotificationHandoff,
      staffNotificationDeliveryBridge,
      taskProviderHandoff: buildRestaurantTaskProviderHandoff({
        queue: storeManagerTaskQueue,
        target: body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
          ? body.runtimeTarget
          : undefined,
      }),
      staffNotificationAuditLog: (() => {
        recordRestaurantStaffNotificationAuditEventsFromHandoff(staffNotificationHandoff);
        recordRestaurantStaffNotificationAuditEventsFromDeliveryBridge(staffNotificationDeliveryBridge);
        return buildRestaurantStaffNotificationAuditLog();
      })(),
    });
  }

  if (body.action === 'store-manager-task-status') {
    const task = updateRestaurantStoreManagerTaskStatus({
      taskMemoryId: typeof body.taskMemoryId === 'string' ? body.taskMemoryId : undefined,
      status: body.status === 'open'
        || body.status === 'needs-evidence'
        || body.status === 'ready-for-provider'
        || body.status === 'blocked'
        || body.status === 'done'
        ? body.status
        : undefined,
      auditNote: typeof body.auditNote === 'string' ? body.auditNote : undefined,
    });
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    const storeManagerTaskWatcher = buildRestaurantStoreManagerTaskWatcher(storeManagerTaskQueue);
    const staffNotificationHandoff = buildRestaurantStaffNotificationHandoff(storeManagerTaskWatcher);
    const staffNotificationDeliveryBridge = buildRestaurantStaffNotificationDeliveryBridge({
      handoff: staffNotificationHandoff,
    });
    return NextResponse.json({
      ok: Boolean(task),
      task,
      storeManagerTaskQueue,
      storeManagerTaskWatcher,
      staffNotificationHandoff,
      staffNotificationDeliveryBridge,
      taskProviderHandoff: buildRestaurantTaskProviderHandoff({
        queue: storeManagerTaskQueue,
        target: body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
          ? body.runtimeTarget
          : undefined,
      }),
      staffNotificationAuditLog: (() => {
        recordRestaurantStaffNotificationAuditEventsFromHandoff(staffNotificationHandoff);
        recordRestaurantStaffNotificationAuditEventsFromDeliveryBridge(staffNotificationDeliveryBridge);
        return buildRestaurantStaffNotificationAuditLog();
      })(),
    }, { status: task ? 200 : 404 });
  }

  if (body.action === 'staff-notification-audit-log') {
    return NextResponse.json({
      ok: true,
      staffNotificationAuditLog: buildRestaurantStaffNotificationAuditLog(),
    });
  }

  if (body.action === 'capability-training-plan') {
    return NextResponse.json({
      ok: true,
      capabilityTrainingPlan: buildRestaurantCapabilityTrainingPlanFromLedger({
        availableMaterials: Array.isArray(body.availableMaterials) ? body.availableMaterials.filter((item): item is string => typeof item === 'string') : undefined,
        configuredProviders: Array.isArray(body.configuredProviders) ? body.configuredProviders.filter((item): item is string => typeof item === 'string') : undefined,
      }),
      trainingRecords: listRestaurantCapabilityTrainingRecords(),
    });
  }

  if (body.action === 'claw-skill-catalog') {
    return NextResponse.json({
      ok: true,
      clawSkillCatalog: buildRestaurantClawSkillCatalog(),
    });
  }

  if (body.action === 'claw-training-batch') {
    return NextResponse.json({
      ok: true,
      clawTrainingBatch: buildRestaurantClawTrainingBatch({
        internalLimit: typeof body.internalLimit === 'number' ? body.internalLimit : undefined,
        providerLimit: typeof body.providerLimit === 'number' ? body.providerLimit : undefined,
      }),
    });
  }

  if (body.action === 'claw-skill-workbench') {
    const clawSkillWorkbench = buildRestaurantClawSkillWorkbench({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      moduleIds: Array.isArray(body.moduleIds) ? body.moduleIds.filter((item): item is string => typeof item === 'string') : undefined,
    });
    const clawSkillExecutionRecord = recordRestaurantClawSkillExecution(clawSkillWorkbench);
    const storeManagerTaskRecords = recordRestaurantStoreManagerTasksFromClawExecution(clawSkillExecutionRecord);
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    const storeManagerTaskWatcher = buildRestaurantStoreManagerTaskWatcher(storeManagerTaskQueue);
    const staffNotificationHandoff = buildRestaurantStaffNotificationHandoff(storeManagerTaskWatcher);
    const staffNotificationDeliveryBridge = buildRestaurantStaffNotificationDeliveryBridge({
      handoff: staffNotificationHandoff,
    });
    return NextResponse.json({
      ok: true,
      clawSkillWorkbench,
      clawSkillExecutionRecord,
      clawSkillExecutionLedger: buildRestaurantClawSkillExecutionLedger(),
      storeManagerTaskRecords,
      storeManagerTaskQueue,
      storeManagerTaskWatcher,
      staffNotificationHandoff,
      staffNotificationDeliveryBridge,
      taskProviderHandoff: buildRestaurantTaskProviderHandoff({ queue: storeManagerTaskQueue }),
    });
  }

  if (body.action === 'task-provider-handoff') {
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    return NextResponse.json({
      ok: true,
      storeManagerTaskQueue,
      taskProviderHandoff: buildRestaurantTaskProviderHandoff({
        queue: storeManagerTaskQueue,
        target: body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
          ? body.runtimeTarget
          : undefined,
      }),
    });
  }

  if (body.action === 'task-provider-forward') {
    const runtimeTarget = body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
      ? body.runtimeTarget
      : 'openclaw';
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    const taskProviderHandoff = buildRestaurantTaskProviderHandoff({
      queue: storeManagerTaskQueue,
      target: runtimeTarget,
    });
    const selectedPackage = [
      ...taskProviderHandoff.packages,
      ...taskProviderHandoff.blockedPackages,
    ].find(item => (typeof body.handoffId === 'string' && item.handoffId === body.handoffId)
      || (typeof body.taskMemoryId === 'string' && item.taskMemoryId === body.taskMemoryId))
      || taskProviderHandoff.packages[0]
      || taskProviderHandoff.blockedPackages[0];

    if (!selectedPackage) {
      return NextResponse.json({
        ok: false,
        error: 'task_provider_handoff_not_found',
        taskProviderHandoff,
      }, { status: 404 });
    }

    const bridge = await forwardRestaurantAgentExecutionPackage(
      selectedPackage.executionPackage,
      readRestaurantRuntimeBridgeConfig(runtimeTarget),
    );
    const dispatch = buildRestaurantAgentDispatch({
      taskId: 'external-runtime-attach',
      restaurant: selectedPackage.safePayload.restaurant,
      offer: selectedPackage.safePayload.offer,
      owner: selectedPackage.safePayload.owner,
      source: 'task_provider_handoff',
      runtimeTarget: 'local',
    });
    const run = recordRestaurantAgentRun(dispatch, runtimeTarget, bridge);
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();

    return NextResponse.json({
      ok: bridge.ok,
      selectedPackage,
      bridge,
      run,
      taskProviderHandoff,
      runs,
      receipts,
      runHealth: buildRestaurantRunHealth(runs, receipts, readiness),
      providerReceiptInbox: buildRestaurantProviderReceiptInbox({ runs, receipts, readiness }),
      recovery: buildRestaurantAgentRecoveryPlan(runs, receipts, readiness),
      executionTimeline: buildRestaurantExecutionTimeline({
        runs,
        receipts,
        readiness,
        browserSessions: listRestaurantBrowserSessions(),
      }),
    }, { status: bridge.ok ? 202 : 409 });
  }

  if (body.action === 'benchmark-strategy') {
    return NextResponse.json({
      ok: true,
      benchmarkStrategy: buildRestaurantBenchmarkStrategy(),
    });
  }

  if (body.action === 'platform-operating-spine') {
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();
    return NextResponse.json({
      ok: true,
      platformOperatingSpine: buildRestaurantPlatformOperatingSpine({
        runs,
        receipts,
        readiness,
        browserSessions: listRestaurantBrowserSessions(),
      }),
      runs,
      receipts,
      readiness,
    });
  }

  if (body.action === 'operating-data-contract') {
    const rows = Array.isArray(body.rows) ? body.rows as RestaurantPosImportRow[] : undefined;
    const posImport = rows ? buildRestaurantPosImportReport({
      rows,
      eventId: typeof body.eventId === 'string' ? body.eventId : undefined,
    }) : undefined;
    const receipts = listRestaurantAgentReceipts();
    const operatingDataContract = buildRestaurantOperatingDataContract({
      receipts,
      posImports: posImport ? [posImport] : [],
      readiness: buildRestaurantExternalReadiness(),
    });
    return NextResponse.json({
      ok: true,
      operatingDataContract,
      storeDataImportCenter: buildRestaurantStoreDataImportCenter({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        audience: typeof body.audience === 'string' ? body.audience : undefined,
        channels: typeof body.channels === 'string' ? body.channels : undefined,
        visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
        constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
        evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
        operatingDataContract,
        posImport,
      }),
      posImport,
      receipts,
    });
  }

  if (body.action === 'operating-insight-report') {
    const rows = Array.isArray(body.rows) ? body.rows as RestaurantPosImportRow[] : undefined;
    const posImport = rows ? buildRestaurantPosImportReport({
      rows,
      eventId: typeof body.eventId === 'string' ? body.eventId : undefined,
    }) : undefined;
    const receipts = listRestaurantAgentReceipts();
    const runs = listRestaurantAgentRuns();
    const operatingDataContract = buildRestaurantOperatingDataContract({
      receipts,
      posImports: posImport ? [posImport] : [],
      readiness: buildRestaurantExternalReadiness(),
    });
    const businessSignals = buildRestaurantBusinessSignals(runs, receipts);
    return NextResponse.json({
      ok: true,
      operatingInsightReport: buildRestaurantOperatingInsightReport({
        posImports: posImport ? [posImport] : [],
        operatingDataContract,
        businessSignals,
      }),
      operatingDataContract,
      posImport,
      businessSignals,
      receipts,
    });
  }

  if (body.action === 'post-run-review-pack') {
    const rows = Array.isArray(body.rows) ? body.rows as RestaurantPosImportRow[] : undefined;
    const posImport = rows ? buildRestaurantPosImportReport({
      rows,
      eventId: typeof body.eventId === 'string' ? body.eventId : undefined,
    }) : undefined;
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const runtimeProbe = await buildRestaurantRuntimeProbe();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
    });
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({ runs, receipts, readiness });
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    return NextResponse.json({
      ok: true,
      postRunReviewPack: buildRestaurantPostRunReviewPack({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        audience: typeof body.audience === 'string' ? body.audience : undefined,
        channels: typeof body.channels === 'string' ? body.channels : undefined,
        visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
        constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
        evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
        queue: storeManagerTaskQueue,
        runs,
        receipts,
        readiness,
        posImports: posImport ? [posImport] : [],
        target: body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
          ? body.runtimeTarget
          : 'openclaw',
        runtimeProbe,
        providerReadinessHealth,
        providerReceiptInbox,
      }),
      posImport,
      businessSignals: buildRestaurantBusinessSignals(runs, receipts),
      providerReceiptInbox,
      storeManagerTaskQueue,
      runtimeProbe,
      providerReadinessHealth,
      runs,
      receipts,
    });
  }

  if (body.action === 'next-loop-channel-plan') {
    const rows = Array.isArray(body.rows) ? body.rows as RestaurantPosImportRow[] : undefined;
    const posImport = rows ? buildRestaurantPosImportReport({
      rows,
      eventId: typeof body.eventId === 'string' ? body.eventId : undefined,
    }) : undefined;
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const runtimeProbe = await buildRestaurantRuntimeProbe();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
    });
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({ runs, receipts, readiness });
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    const postRunReviewPack = buildRestaurantPostRunReviewPack({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      queue: storeManagerTaskQueue,
      runs,
      receipts,
      readiness,
      posImports: posImport ? [posImport] : [],
      target: body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
        ? body.runtimeTarget
        : 'openclaw',
      runtimeProbe,
      providerReadinessHealth,
      providerReceiptInbox,
    });
    const providerReceiptLifecycle = buildRestaurantProviderReceiptLifecycle({
      runs,
      receipts,
      providerReceiptInbox,
      postRunReviewPack,
    });
    const channelHub = buildRestaurantAgentChannelHub({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
    });
    const channelDeliveryReport = buildRestaurantAgentChannelDeliveryReport();
    return NextResponse.json({
      ok: true,
      nextLoopChannelPlan: buildRestaurantNextLoopChannelPlan({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        audience: typeof body.audience === 'string' ? body.audience : undefined,
        channels: typeof body.channels === 'string' ? body.channels : undefined,
        visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
        constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
        evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
        postRunReviewPack,
        channelHub,
        channelDeliveryReport,
        storeManagerTaskQueue,
      }),
      postRunReviewPack,
      channelHub,
      channelDeliveryReport,
      posImport,
      storeManagerTaskQueue,
      providerReceiptInbox,
      providerReceiptLifecycle,
      runtimeProbe,
      providerReadinessHealth,
      runs,
      receipts,
    });
  }

  if (body.action === 'trial-workflow-pack') {
    return NextResponse.json({
      ok: true,
      trialWorkflowPack: buildRestaurantTrialWorkflowPack({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        audience: typeof body.audience === 'string' ? body.audience : undefined,
        channels: typeof body.channels === 'string' ? body.channels : undefined,
        visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
        constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
        evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      }),
    });
  }

  if (body.action === 'claw-experience-default-path') {
    const now = new Date();
    const clawSkillWorkbench = buildRestaurantClawSkillWorkbench({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
    });
    const clawSkillExecutionRecord = recordRestaurantClawSkillExecution(clawSkillWorkbench);
    const storeManagerTaskRecords = recordRestaurantStoreManagerTasksFromClawExecution(clawSkillExecutionRecord);
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    const storeManagerTaskWatcher = buildRestaurantStoreManagerTaskWatcher(storeManagerTaskQueue);
    const staffNotificationHandoff = buildRestaurantStaffNotificationHandoff(storeManagerTaskWatcher);
    const staffNotificationDeliveryBridge = buildRestaurantStaffNotificationDeliveryBridge({
      handoff: staffNotificationHandoff,
    });
    const providerSetupPack = buildRestaurantProviderSetupPack({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
    });
    const externalUnlockRequestPack = buildRestaurantExternalUnlockRequestPack({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
    });
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const runtimeProbe = await buildRestaurantRuntimeProbe();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
      runtimeProbe,
    });
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger({
      availableMaterials: [
        typeof body.evidence === 'string' ? body.evidence : '',
        clawSkillWorkbench.summary.runnableNow > 0 ? 'claw-skill-workbench-ready' : '',
      ].filter(Boolean),
      configuredProviders: [
        ...providerSetupState.provided.envKeys,
        ...providerSetupState.provided.merchantApprovals,
        ...providerSetupState.provided.dataContracts,
      ],
    });
    const customerDemandGateway = buildRestaurantCustomerDemandGateway({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      capabilityTrainingPlan,
      providerSetupState,
    });
    const voiceOrderConsole = buildRestaurantVoiceOrderConsole({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      customerDemandGateway,
      providerSetupState,
    });
    const providerLaunchBoard = buildRestaurantProviderLaunchBoard({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      providerSetupState,
      providerReadinessHealth,
      customerDemandGateway,
      voiceOrderConsole,
    });
    const providerSetupWizard = buildRestaurantProviderSetupWizard({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      provided: providerSetupState.provided,
    });
    const providerUnlockLadder = buildRestaurantProviderUnlockLadder({
      setupState: providerSetupState,
      health: providerReadinessHealth,
    });
    const platformConnectorMatrix = buildRestaurantPlatformConnectorMatrix();
    const aiConsultantCopilot = buildRestaurantAiConsultantCopilot({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      customerDemandGateway,
      voiceOrderConsole,
      providerLaunchBoard,
    });
    const dayZeroMissionPack = buildRestaurantDayZeroMissionPack({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      manualText: typeof body.evidence === 'string' ? body.evidence : undefined,
    });
    const storeOperatingPlan = buildRestaurantStoreOperatingPlan({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      aiConsultantCopilot,
      customerDemandGateway,
      voiceOrderConsole,
      providerLaunchBoard,
      dayZeroMissionPack,
    });
    const aiCockpit = buildRestaurantAiCockpit({
      storeOperatingPlan,
      aiConsultantCopilot,
      providerLaunchBoard,
    });
    const controlledTrialRun = await runRestaurantControlledTrialRun({
      target: 'openclaw',
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      owner: 'restaurant-ops',
      signalType: 'visit-intent',
      reservationCount: 3,
      couponClaimCount: 9,
      visitIntentCount: 6,
    });
    const browserGatewayPack = buildRestaurantBrowserGatewayPack({
      runtimeTarget: 'openclaw',
      eventId: controlledTrialRun.simulation.run.eventId,
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      channel: 'Dianping / Xiaohongshu / Douyin / WeChat group',
      targetUrl: 'merchant-approved-url-or-public-proof-url',
    });
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const runnerEvents = listRestaurantBrowserRunnerEvents();
    const readiness = buildRestaurantExternalReadiness();
    const recovery = buildRestaurantAgentRecoveryPlan(runs, receipts, readiness);
    const runtimeRunnerLoopPack = buildRestaurantRuntimeRunnerLoopPack({
      runs,
      receipts,
      runnerEvents,
      readiness,
    });
    const defaultPathPosRows: RestaurantPosImportRow[] = [
      {
        businessDate: new Date().toISOString().slice(0, 10),
        storeName: typeof body.restaurant === 'string' && body.restaurant.trim() ? body.restaurant : 'Trial restaurant',
        offerName: typeof body.offer === 'string' && body.offer.trim() ? body.offer : 'Today offer',
        channel: 'group-buy coupon',
        couponClaimCount: 38,
        redemptionCount: 21,
        grossSales: 3168,
        orderCount: 42,
        inventoryUsed: 21,
        operator: 'store-manager',
        evidenceUrl: 'manual-pos-aggregate-import',
      },
      {
        businessDate: new Date().toISOString().slice(0, 10),
        storeName: typeof body.restaurant === 'string' && body.restaurant.trim() ? body.restaurant : 'Trial restaurant',
        offerName: typeof body.offer === 'string' && body.offer.trim() ? body.offer : 'Today offer',
        channel: 'reservation follow-up',
        couponClaimCount: 12,
        redemptionCount: 8,
        grossSales: 1288,
        orderCount: 16,
        inventoryUsed: 8,
        operator: 'shift-lead',
        evidenceUrl: 'manual-reservation-aggregate-import',
      },
    ];
    const posImport = buildRestaurantPosImportReport({
      rows: defaultPathPosRows,
      eventId: controlledTrialRun.simulation.run.eventId,
    });
    const businessSignals = buildRestaurantBusinessSignals(runs, receipts);
    const operatingDataContract = buildRestaurantOperatingDataContract({
      receipts,
      posImports: [posImport],
      readiness,
    });
    const storeDataImportCenter = buildRestaurantStoreDataImportCenter({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      operatingDataContract,
      posImport,
    });
    const operatingInsightReport = buildRestaurantOperatingInsightReport({
      posImports: [posImport],
      operatingDataContract,
      businessSignals,
    });
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({ runs, receipts, readiness });
    const postRunReviewPack = buildRestaurantPostRunReviewPack({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      queue: storeManagerTaskQueue,
      runs,
      receipts,
      readiness,
      posImports: [posImport],
      target: 'openclaw',
      runtimeProbe,
      providerReadinessHealth,
      providerReceiptInbox,
    });
    const providerReceiptLifecycle = buildRestaurantProviderReceiptLifecycle({
      runs,
      receipts,
      providerReceiptInbox,
      postRunReviewPack,
      now,
    });
    const providerKeyGapBoard = buildRestaurantProviderKeyGapBoard({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      now,
    });
    const channelHub = buildRestaurantAgentChannelHub({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
    });
    const channelScheduleRun = await runRestaurantAgentChannelSchedule({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      now,
      limit: 4,
    });
    const channelDeliveryReport = channelScheduleRun.deliveryReport;
    const nextLoopChannelPlan = buildRestaurantNextLoopChannelPlan({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      postRunReviewPack,
      channelHub,
      channelDeliveryReport,
      storeManagerTaskQueue,
    });
    const publicIntelligenceBrief = buildRestaurantPublicIntelligenceBrief({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      suggestedOffer: typeof body.offer === 'string' ? body.offer : undefined,
      manualText: typeof body.evidence === 'string' ? body.evidence : undefined,
    });
    const reputationCloseoutPack = buildRestaurantReputationCloseoutPack({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      publicIntelligenceBrief,
      postRunReviewPack,
      nextLoopChannelPlan,
      businessSignals,
    });
    const leadCaptureInbox = buildRestaurantLeadCaptureInbox({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      customerDemandGateway,
      businessSignals,
      channelHub,
      nextLoopChannelPlan,
      reputationCloseoutPack,
    });
    const leadAcquisitionProviderWorkbench = buildRestaurantLeadAcquisitionProviderWorkbench({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      leadCaptureInbox,
      customerDemandGateway,
      providerReadinessHealth,
      operatingDataContract,
    });
    const publishExecutionInbox = buildRestaurantPublishExecutionInbox({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      browserGatewayPack,
      runtimeRunnerLoopPack,
      channelDeliveryReport,
      businessSignals,
      recovery,
    });
    const taskProviderHandoff = buildRestaurantTaskProviderHandoff({ queue: storeManagerTaskQueue });
    const providerSandboxContract = buildRestaurantProviderSandboxContract({
      runtimeProbe,
      providerReadinessHealth,
      taskProviderHandoff,
      providerReceiptInbox,
    });
    const providerAcceptanceWorkbench = buildRestaurantProviderAcceptanceWorkbench({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      providerSetupWizard,
      providerReadinessHealth,
      providerSandboxContract,
      operatingDataContract,
      publishExecutionInbox,
    });
    const providerSandboxSubmitWorkbench = buildRestaurantProviderSandboxSubmitWorkbench({
      providerAcceptanceWorkbench,
      providerSandboxContract,
      taskProviderHandoff,
      providerReceiptInbox,
      target: 'openclaw',
      now,
    });
    const leadSandboxAcceptanceFlow = buildRestaurantLeadSandboxAcceptanceFlow({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      leadAcquisitionProviderWorkbench,
      providerSandboxContract,
      receipts,
      now,
    });
    const commandCenter = await buildRestaurantAgentCommandCenter({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      runs,
      receipts,
      readiness,
      browserSessions: listRestaurantBrowserSessions(),
      now,
    });
    const shiftAutopilot = buildRestaurantShiftAutopilot({
      restaurant: commandCenter.restaurant,
      offer: commandCenter.offer,
      gmCommandDeck: commandCenter.gmCommandDeck,
      channelHub: commandCenter.channelHub,
      now,
    });
    const shiftAutopilotRun = runRestaurantShiftAutopilot({ autopilot: shiftAutopilot, now });
    const shiftRuns = listRestaurantShiftAutopilotRuns();
    const shiftAwareStoreManagerTaskQueue = buildRestaurantStoreManagerTaskQueue(now);
    const shiftAwareStoreManagerTaskWatcher = buildRestaurantStoreManagerTaskWatcher(shiftAwareStoreManagerTaskQueue, now);
    const shiftTaskProviderHandoff = buildRestaurantTaskProviderHandoff({
      queue: shiftAwareStoreManagerTaskQueue,
      target: 'openclaw',
      now,
    });
    const firstForwardableRunPack = buildRestaurantFirstForwardableRunPack({
      queue: shiftAwareStoreManagerTaskQueue,
      target: 'openclaw',
      runtimeProbe,
      providerReadinessHealth,
      providerReceiptInbox,
      now,
    });
    const shiftProviderHandoff = buildRestaurantShiftProviderHandoff({
      shiftRuns,
      providerReadinessHealth,
      now,
    });
    const shiftSandboxAcceptance = buildRestaurantShiftSandboxAcceptance({
      shiftProviderHandoff,
      providerReadinessHealth,
      providerSandboxContract,
      now,
    });
    const shiftFirstForwardableRun = buildRestaurantShiftFirstForwardableRun({
      shiftRuns,
      shiftProviderHandoff,
      shiftSandboxAcceptance,
      firstForwardableRunPack,
      taskProviderHandoff: shiftTaskProviderHandoff,
      providerSandboxContract,
      now,
    });
    const shiftCloseoutTrainingPack = buildRestaurantShiftCloseoutTrainingPack({
      providerReceiptInbox,
      recovery,
      postRunReviewPack,
      capabilityTrainingPlan,
      now,
    });
    const trainingRecords = listRestaurantCapabilityTrainingRecords();
    const shiftCapabilityActivationPack = buildRestaurantShiftCapabilityActivationPack({
      capabilityTrainingPlan,
      trainingRecords,
      providerReadinessHealth,
      now,
    });
    const shiftOperatingLoopPack = buildRestaurantShiftOperatingLoopPack({
      commandCenter,
      shiftRuns,
      shiftProviderHandoff,
      shiftSandboxAcceptance,
      shiftFirstForwardableRun,
      taskProviderHandoff: shiftTaskProviderHandoff,
      providerSandboxContract,
      providerReceiptInbox,
      providerReadinessHealth,
      recovery,
      shiftCloseoutTrainingPack,
      shiftCapabilityActivationPack,
      capabilityTrainingPlan,
      trainingRecords,
      now,
    });
    const residentAgentMissionControl = await buildRestaurantResidentAgentMissionControl({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      runs,
      receipts,
      runnerEvents,
      readiness,
      browserSessions: listRestaurantBrowserSessions(),
      now,
    });
    const aiEmployeeMemoryPack = buildRestaurantAiEmployeeMemoryPack({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      commandCenter,
      capabilityTrainingPlan,
      providerSetupState,
      storeManagerTaskQueue: shiftAwareStoreManagerTaskQueue,
      storeManagerTaskWatcher: shiftAwareStoreManagerTaskWatcher,
      channelDeliveryReport,
      clawSkillExecutionLedger: buildRestaurantClawSkillExecutionLedger(),
      now,
    });
    const todayCommandCockpit = buildRestaurantTodayCommandCockpit({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      aiCockpit,
      storeOperatingPlan,
      shiftOperatingLoopPack,
      leadSandboxAcceptanceFlow,
      publishExecutionInbox,
      operatingDataContract,
      operatingInsightReport,
      providerReadinessHealth,
      now,
    });
    const providerAdapterContractPack = buildRestaurantProviderAdapterContractPack({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      externalUnlockRequestPack,
      providerSetupWizard,
      providerReadinessHealth,
      todayCommandCockpit,
      now,
    });
    const clawExperienceDefaultPath = await buildRestaurantClawExperienceDefaultPath({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      now,
    });
    const defaultPathForwardableBrief = buildRestaurantDefaultPathForwardableBrief({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      defaultPath: clawExperienceDefaultPath,
      storeManagerTaskQueue: shiftAwareStoreManagerTaskQueue,
      providerSetupPack,
      externalUnlockRequestPack,
      todayCommandCockpit,
      publishExecutionInbox,
      shiftOperatingLoopPack,
      operatingInsightReport,
      providerReceiptLifecycle,
      providerKeyGapBoard,
      now,
    });
    const clawCloudOperatorHome = buildRestaurantClawCloudOperatorHome({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      commandCenter,
      forwardableBrief: defaultPathForwardableBrief,
      providerKeyGapBoard,
      now,
    });
    const externalAccessGuide = buildRestaurantExternalAccessGuide({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      providerSetupWizard,
      providerUnlockLadder,
      providerKeyGapBoard,
      now,
    });
    const providerSandboxReadinessBoard = buildRestaurantProviderSandboxReadinessBoard({
      providerSandboxSubmitWorkbench,
      providerAcceptanceWorkbench,
      providerSandboxContract,
      externalAccessGuide,
      providerKeyGapBoard,
      now,
    });
    const providerSandboxRunConsole = buildRestaurantProviderSandboxRunConsole({
      providerSandboxReadinessBoard,
      providerSandboxSubmitWorkbench,
      runtimeRunnerLoopPack,
      providerReceiptLifecycle,
      now,
    });
    const competitorAudit = buildRestaurantCompetitorAuditReport();
    const buildQueue = buildRestaurantBuildQueue();
    return NextResponse.json({
      ok: true,
      clawExperienceDefaultPath,
      defaultPathForwardableBrief,
      clawCloudOperatorHome,
      externalAccessGuide,
      clawSkillWorkbench,
      clawSkillExecutionRecord,
      clawSkillExecutionLedger: buildRestaurantClawSkillExecutionLedger(),
      storeManagerTaskRecords,
      storeManagerTaskQueue: shiftAwareStoreManagerTaskQueue,
      storeManagerTaskWatcher: shiftAwareStoreManagerTaskWatcher,
      staffNotificationHandoff,
      staffNotificationDeliveryBridge,
      taskProviderHandoff: shiftTaskProviderHandoff,
      providerSetupPack,
      providerSandboxContract,
      providerAcceptanceWorkbench,
      providerSandboxSubmitWorkbench,
      providerSandboxReadinessBoard,
      providerSandboxRunConsole,
      commandCenter,
      gmCommandDeck: commandCenter.gmCommandDeck,
      shiftAutopilot,
      shiftAutopilotRun,
      shiftOperatingLoopPack,
      shiftFirstForwardableRun,
      shiftProviderHandoff,
      shiftSandboxAcceptance,
      shiftCloseoutTrainingPack,
      shiftCapabilityActivationPack,
      todayCommandCockpit,
      providerAdapterContractPack,
      competitorAudit,
      buildQueue,
      firstForwardableRunPack,
      residentAgentMissionControl,
      aiEmployeeMemoryPack,
      externalUnlockRequestPack,
      providerSetupState,
      providerReadinessHealth,
      providerSetupWizard,
      providerUnlockLadder,
      providerLaunchBoard,
      platformConnectorMatrix,
      aiConsultantCopilot,
      dayZeroMissionPack,
      storeOperatingPlan,
      aiCockpit,
      customerDemandGateway,
      voiceOrderConsole,
      capabilityTrainingPlan,
      controlledTrialRun,
      browserGatewayPack,
      runtimeRunnerLoopPack,
      posImport,
      businessSignals,
      operatingDataContract,
      storeDataImportCenter,
      operatingInsightReport,
      providerReceiptInbox,
      providerReceiptLifecycle,
      providerKeyGapBoard,
      postRunReviewPack,
      channelHub,
      channelScheduleRun,
      channelDeliveryReport,
      nextLoopChannelPlan,
      publicIntelligenceBrief,
      reputationCloseoutPack,
      leadCaptureInbox,
      leadAcquisitionProviderWorkbench,
      leadSandboxAcceptanceFlow,
      publishExecutionInbox,
      recovery,
      runtimeProbe,
      runs,
      receipts,
      runnerEvents,
      shiftRuns,
      trainingRecords,
    });
  }

  if (body.action === 'capability-training-record') {
    const trainingRecord = recordRestaurantCapabilityTrainingRecord({
      kind: body.kind === 'provider' ? 'provider' : 'material',
      capabilityId: typeof body.capabilityId === 'string' ? body.capabilityId : undefined,
      name: typeof body.name === 'string' ? body.name : undefined,
      owner: typeof body.owner === 'string' ? body.owner : undefined,
      source: body.source === 'public-profile' || body.source === 'pos-import' || body.source === 'provider-setup' ? body.source : 'manual',
      evidenceSummary: typeof body.evidenceSummary === 'string' ? body.evidenceSummary : undefined,
    });
    return NextResponse.json({
      ok: trainingRecord.accepted,
      trainingRecord,
      trainingRecords: listRestaurantCapabilityTrainingRecords(),
      capabilityTrainingPlan: buildRestaurantCapabilityTrainingPlanFromLedger({
        availableMaterials: Array.isArray(body.availableMaterials) ? body.availableMaterials.filter((item): item is string => typeof item === 'string') : undefined,
        configuredProviders: Array.isArray(body.configuredProviders) ? body.configuredProviders.filter((item): item is string => typeof item === 'string') : undefined,
      }),
    }, { status: trainingRecord.accepted ? 201 : 422 });
  }

  if (body.action === 'pos-import') {
    const rows = Array.isArray(body.rows) ? body.rows as RestaurantPosImportRow[] : undefined;
    let eventId = typeof body.eventId === 'string' ? body.eventId : undefined;
    if (!eventId) {
      const dispatch = buildRestaurantAgentDispatch({
        taskId: 'redemption-review',
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        owner: typeof body.operator === 'string' ? body.operator : 'ops',
        runtimeTarget: 'local',
        source: 'pos_import_validator',
      });
      const run = recordRestaurantAgentRun(dispatch, 'local');
      eventId = run.eventId;
    }
    const posImport = buildRestaurantPosImportReport({ rows, eventId });
    const receipt = posImport.receiptDraft
      ? recordRestaurantAgentReceipt({
          eventId: posImport.receiptDraft.eventId,
          channel: posImport.receiptDraft.channel,
          screenshotId: `${posImport.importId}-aggregate`,
          externalRunId: posImport.receiptDraft.externalRunId,
          operator: typeof body.operator === 'string' ? body.operator : 'ops',
          summary: posImport.receiptDraft.summary,
          source: 'manual',
          signalType: posImport.receiptDraft.signalType,
          couponClaimCount: posImport.receiptDraft.couponClaimCount,
          redemptionCount: posImport.receiptDraft.redemptionCount,
        })
      : undefined;

    return NextResponse.json({
      ok: posImport.status === 'accepted',
      posImport,
      receipt,
      receipts: listRestaurantAgentReceipts(),
      businessSignals: buildRestaurantBusinessSignals(listRestaurantAgentRuns(), listRestaurantAgentReceipts()),
      heartbeat: buildRestaurantAgentHeartbeat(listRestaurantAgentRuns(), listRestaurantAgentReceipts()),
    }, { status: posImport.status === 'accepted' ? 201 : 422 });
  }

  if (body.action === 'ops-console') {
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    return NextResponse.json({
      ok: true,
      opsConsole: buildRestaurantAgentOpsConsole({
        runs,
        receipts,
        readiness: buildRestaurantExternalReadiness(),
        browserSessions: listRestaurantBrowserSessions(),
      }),
      runs,
      receipts,
    });
  }

  if (body.action === 'execution-timeline') {
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    return NextResponse.json({
      ok: true,
      executionTimeline: buildRestaurantExecutionTimeline({
        runs,
        receipts,
        readiness: buildRestaurantExternalReadiness(),
        browserSessions: listRestaurantBrowserSessions(),
      }),
      runs,
      receipts,
    });
  }

  if (body.action === 'command-center') {
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    return NextResponse.json({
      ok: true,
      commandCenter: await buildRestaurantAgentCommandCenter({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        runs,
        receipts,
        readiness: buildRestaurantExternalReadiness(),
        browserSessions: listRestaurantBrowserSessions(),
      }),
      runs,
      receipts,
    });
  }

  if (body.action === 'resident-agent-mission-control') {
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const runnerEvents = listRestaurantBrowserRunnerEvents();
    return NextResponse.json({
      ok: true,
      residentAgentMissionControl: await buildRestaurantResidentAgentMissionControl({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        audience: typeof body.audience === 'string' ? body.audience : undefined,
        channels: typeof body.channels === 'string' ? body.channels : undefined,
        visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
        runs,
        receipts,
        runnerEvents,
        readiness: buildRestaurantExternalReadiness(),
        browserSessions: listRestaurantBrowserSessions(),
      }),
      runs,
      receipts,
      runnerEvents,
    });
  }

  if (body.action === 'shift-autopilot-run') {
    const now = new Date();
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const commandCenter = await buildRestaurantAgentCommandCenter({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      runs,
      receipts,
      readiness: buildRestaurantExternalReadiness(),
      browserSessions: listRestaurantBrowserSessions(),
      now,
    });
    const shiftAutopilot = buildRestaurantShiftAutopilot({
      restaurant: commandCenter.restaurant,
      offer: commandCenter.offer,
      gmCommandDeck: commandCenter.gmCommandDeck,
      channelHub: commandCenter.channelHub,
      now,
    });
    const shiftAutopilotRun = runRestaurantShiftAutopilot({ autopilot: shiftAutopilot, now });
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue(now);
    const storeManagerTaskWatcher = buildRestaurantStoreManagerTaskWatcher(storeManagerTaskQueue, now);
    return NextResponse.json({
      ok: true,
      commandCenter,
      shiftAutopilot,
      shiftAutopilotRun,
      storeManagerTaskQueue,
      storeManagerTaskWatcher,
      runs,
      receipts,
    }, { status: shiftAutopilotRun.summary.providerHeldActions > 0 ? 409 : 201 });
  }

  if (body.action === 'shift-provider-handoff') {
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
    });
    const shiftProviderHandoff = buildRestaurantShiftProviderHandoff({
      shiftRuns: listRestaurantShiftAutopilotRuns(),
      providerReadinessHealth,
    });
    return NextResponse.json({
      ok: true,
      shiftProviderHandoff,
      providerReadinessHealth,
      providerSetupState,
    }, { status: shiftProviderHandoff.summary.requests > 0 ? 409 : 200 });
  }

  if (body.action === 'shift-sandbox-acceptance') {
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const runtimeProbe = await buildRestaurantRuntimeProbe();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
      runtimeProbe,
    });
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    const taskProviderHandoff = buildRestaurantTaskProviderHandoff({ queue: storeManagerTaskQueue });
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({
      runs: listRestaurantAgentRuns(),
      receipts: listRestaurantAgentReceipts(),
      readiness: buildRestaurantExternalReadiness(),
    });
    const providerSandboxContract = buildRestaurantProviderSandboxContract({
      runtimeProbe,
      providerReadinessHealth,
      taskProviderHandoff,
      providerReceiptInbox,
    });
    const shiftProviderHandoff = buildRestaurantShiftProviderHandoff({
      shiftRuns: listRestaurantShiftAutopilotRuns(),
      providerReadinessHealth,
    });
    return NextResponse.json({
      ok: true,
      shiftSandboxAcceptance: buildRestaurantShiftSandboxAcceptance({
        shiftProviderHandoff,
        providerReadinessHealth,
        providerSandboxContract,
      }),
      shiftProviderHandoff,
      providerSandboxContract,
      providerReadinessHealth,
      providerSetupState,
    }, { status: shiftProviderHandoff.summary.requests > 0 ? 409 : 200 });
  }

  if (body.action === 'shift-first-forwardable-run') {
    const runtimeTarget = body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
      ? body.runtimeTarget
      : 'openclaw';
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const runtimeProbe = await buildRestaurantRuntimeProbe();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
      runtimeProbe,
    });
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    const taskProviderHandoff = buildRestaurantTaskProviderHandoff({
      queue: storeManagerTaskQueue,
      target: runtimeTarget,
    });
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({
      runs,
      receipts,
      readiness,
    });
    const providerSandboxContract = buildRestaurantProviderSandboxContract({
      runtimeProbe,
      providerReadinessHealth,
      taskProviderHandoff,
      providerReceiptInbox,
    });
    const firstForwardableRunPack = buildRestaurantFirstForwardableRunPack({
      queue: storeManagerTaskQueue,
      target: runtimeTarget,
      runtimeProbe,
      providerReadinessHealth,
      providerReceiptInbox,
    });
    const shiftRuns = listRestaurantShiftAutopilotRuns();
    const shiftProviderHandoff = buildRestaurantShiftProviderHandoff({
      shiftRuns,
      providerReadinessHealth,
    });
    const shiftSandboxAcceptance = buildRestaurantShiftSandboxAcceptance({
      shiftProviderHandoff,
      providerReadinessHealth,
      providerSandboxContract,
    });
    const shiftFirstForwardableRun = buildRestaurantShiftFirstForwardableRun({
      shiftRuns,
      shiftProviderHandoff,
      shiftSandboxAcceptance,
      firstForwardableRunPack,
      taskProviderHandoff,
      providerSandboxContract,
    });
    return NextResponse.json({
      ok: true,
      shiftFirstForwardableRun,
      shiftProviderHandoff,
      shiftSandboxAcceptance,
      firstForwardableRunPack,
      taskProviderHandoff,
      providerSandboxContract,
      providerReceiptInbox,
      providerReadinessHealth,
      providerSetupState,
      storeManagerTaskQueue,
      runs,
      receipts,
    }, { status: shiftFirstForwardableRun.summary.canForwardFirstShiftRun ? 200 : 409 });
  }

  if (body.action === 'shift-sandbox-forward') {
    const runtimeTarget = body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
      ? body.runtimeTarget
      : 'openclaw';
    const now = new Date();
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const runtimeProbe = await buildRestaurantRuntimeProbe();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
      runtimeProbe,
    });
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue(now);
    const taskProviderHandoff = buildRestaurantTaskProviderHandoff({
      queue: storeManagerTaskQueue,
      target: runtimeTarget,
      now,
    });
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({
      runs,
      receipts,
      readiness,
      now,
    });
    const providerSandboxContract = buildRestaurantProviderSandboxContract({
      runtimeProbe,
      providerReadinessHealth,
      taskProviderHandoff,
      providerReceiptInbox,
      now,
    });
    const firstForwardableRunPack = buildRestaurantFirstForwardableRunPack({
      queue: storeManagerTaskQueue,
      target: runtimeTarget,
      runtimeProbe,
      providerReadinessHealth,
      providerReceiptInbox,
      now,
    });
    const shiftRuns = listRestaurantShiftAutopilotRuns();
    const shiftProviderHandoff = buildRestaurantShiftProviderHandoff({
      shiftRuns,
      providerReadinessHealth,
      now,
    });
    const shiftSandboxAcceptance = buildRestaurantShiftSandboxAcceptance({
      shiftProviderHandoff,
      providerReadinessHealth,
      providerSandboxContract,
      now,
    });
    const shiftFirstForwardableRun = buildRestaurantShiftFirstForwardableRun({
      shiftRuns,
      shiftProviderHandoff,
      shiftSandboxAcceptance,
      firstForwardableRunPack,
      taskProviderHandoff,
      providerSandboxContract,
      now,
    });
    const selectedPackage = selectShiftForwardPackage({
      shiftFirstForwardableRun,
      taskProviderHandoff,
    });
    const bridge = shiftFirstForwardableRun.summary.canForwardFirstShiftRun && selectedPackage?.canForward
      ? await forwardRestaurantAgentExecutionPackage(
          selectedPackage.executionPackage,
          readRestaurantRuntimeBridgeConfig(runtimeTarget),
        )
      : blockedShiftSandboxBridge({
          shiftFirstForwardableRun,
          selectedPackage,
        });
    const run = selectedPackage ? recordRestaurantAgentRun(buildRestaurantAgentDispatch({
      taskId: 'external-runtime-attach',
      restaurant: selectedPackage.safePayload.restaurant,
      offer: selectedPackage.safePayload.offer,
      owner: selectedPackage.safePayload.owner,
      source: 'shift_first_forwardable_run',
      runtimeTarget: 'local',
    }), runtimeTarget, bridge, now) : undefined;
    const updatedRuns = listRestaurantAgentRuns();
    const updatedReceipts = listRestaurantAgentReceipts();
    const updatedReadiness = buildRestaurantExternalReadiness();
    const shiftSandboxForwardAttempt = buildRestaurantShiftSandboxForwardAttempt({
      shiftFirstForwardableRun,
      taskProviderHandoff,
      selectedPackage,
      bridge,
      run,
      now,
    });

    return NextResponse.json({
      ok: bridge.ok,
      shiftSandboxForwardAttempt,
      shiftFirstForwardableRun,
      shiftProviderHandoff,
      shiftSandboxAcceptance,
      firstForwardableRunPack,
      taskProviderHandoff,
      providerSandboxContract,
      providerReceiptInbox: buildRestaurantProviderReceiptInbox({
        runs: updatedRuns,
        receipts: updatedReceipts,
        readiness: updatedReadiness,
        now,
      }),
      run,
      runs: updatedRuns,
      receipts: updatedReceipts,
      runHealth: buildRestaurantRunHealth(updatedRuns, updatedReceipts, updatedReadiness, now),
      recovery: buildRestaurantAgentRecoveryPlan(updatedRuns, updatedReceipts, updatedReadiness, now),
      executionTimeline: buildRestaurantExecutionTimeline({
        runs: updatedRuns,
        receipts: updatedReceipts,
        readiness: updatedReadiness,
        browserSessions: listRestaurantBrowserSessions(),
      }),
      providerReadinessHealth,
      providerSetupState,
      storeManagerTaskQueue,
    }, { status: bridge.ok ? 202 : 409 });
  }

  if (body.action === 'shift-closeout-training-pack') {
    const rows = Array.isArray(body.rows) ? body.rows as RestaurantPosImportRow[] : undefined;
    const posImport = rows ? buildRestaurantPosImportReport({
      rows,
      eventId: typeof body.eventId === 'string' ? body.eventId : undefined,
    }) : undefined;
    const now = new Date();
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const runtimeProbe = await buildRestaurantRuntimeProbe();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
      runtimeProbe,
    });
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({ runs, receipts, readiness, now });
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue(now);
    const postRunReviewPack = buildRestaurantPostRunReviewPack({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      queue: storeManagerTaskQueue,
      runs,
      receipts,
      readiness,
      posImports: posImport ? [posImport] : [],
      target: body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
        ? body.runtimeTarget
        : 'openclaw',
      runtimeProbe,
      providerReadinessHealth,
      providerReceiptInbox,
      now,
    });
    const recovery = buildRestaurantAgentRecoveryPlan(runs, receipts, readiness, now);
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger();
    const shiftCloseoutTrainingPack = buildRestaurantShiftCloseoutTrainingPack({
      providerReceiptInbox,
      recovery,
      postRunReviewPack,
      capabilityTrainingPlan,
      now,
    });

    return NextResponse.json({
      ok: true,
      shiftCloseoutTrainingPack,
      postRunReviewPack,
      providerReceiptInbox,
      recovery,
      capabilityTrainingPlan,
      posImport,
      runtimeProbe,
      providerReadinessHealth,
      providerSetupState,
      storeManagerTaskQueue,
      runs,
      receipts,
    }, { status: shiftCloseoutTrainingPack.summary.canRecordTraining ? 200 : 409 });
  }

  if (body.action === 'shift-closeout-record-training') {
    const rows = Array.isArray(body.rows) ? body.rows as RestaurantPosImportRow[] : undefined;
    const posImport = rows ? buildRestaurantPosImportReport({
      rows,
      eventId: typeof body.eventId === 'string' ? body.eventId : undefined,
    }) : undefined;
    const now = new Date();
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const runtimeProbe = await buildRestaurantRuntimeProbe();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
      runtimeProbe,
    });
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({ runs, receipts, readiness, now });
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue(now);
    const postRunReviewPack = buildRestaurantPostRunReviewPack({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      queue: storeManagerTaskQueue,
      runs,
      receipts,
      readiness,
      posImports: posImport ? [posImport] : [],
      target: body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
        ? body.runtimeTarget
        : 'openclaw',
      runtimeProbe,
      providerReadinessHealth,
      providerReceiptInbox,
      now,
    });
    const recovery = buildRestaurantAgentRecoveryPlan(runs, receipts, readiness, now);
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger();
    const shiftCloseoutTrainingPack = buildRestaurantShiftCloseoutTrainingPack({
      providerReceiptInbox,
      recovery,
      postRunReviewPack,
      capabilityTrainingPlan,
      now,
    });
    const records = selectRecordableShiftTrainingDrafts(shiftCloseoutTrainingPack)
      .map(draft => recordRestaurantCapabilityTrainingRecord(draft, now));
    const shiftCloseoutTrainingRecordAttempt = buildRestaurantShiftCloseoutTrainingRecordAttempt({
      pack: shiftCloseoutTrainingPack,
      records,
      now,
    });

    return NextResponse.json({
      ok: shiftCloseoutTrainingRecordAttempt.ok,
      shiftCloseoutTrainingRecordAttempt,
      shiftCloseoutTrainingPack,
      trainingRecords: listRestaurantCapabilityTrainingRecords(),
      capabilityTrainingPlan: buildRestaurantCapabilityTrainingPlanFromLedger(),
      postRunReviewPack,
      providerReceiptInbox,
      recovery,
      posImport,
      runs,
      receipts,
    }, { status: shiftCloseoutTrainingRecordAttempt.ok ? 201 : 409 });
  }

  if (body.action === 'shift-capability-activation-pack') {
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const runtimeProbe = await buildRestaurantRuntimeProbe();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
      runtimeProbe,
    });
    const trainingRecords = listRestaurantCapabilityTrainingRecords();
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger();
    return NextResponse.json({
      ok: true,
      shiftCapabilityActivationPack: buildRestaurantShiftCapabilityActivationPack({
        capabilityTrainingPlan,
        trainingRecords,
        providerReadinessHealth,
      }),
      capabilityTrainingPlan,
      trainingRecords,
      providerReadinessHealth,
      providerSetupState,
      runtimeProbe,
    });
  }

  if (body.action === 'shift-operating-loop-pack') {
    const runtimeTarget = body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
      ? body.runtimeTarget
      : 'openclaw';
    const now = new Date();
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();
    const providerSetupState = buildRestaurantProviderSetupStateSummary(now);
    const runtimeProbe = await buildRestaurantRuntimeProbe();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
      runtimeProbe,
    });
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue(now);
    const taskProviderHandoff = buildRestaurantTaskProviderHandoff({
      queue: storeManagerTaskQueue,
      target: runtimeTarget,
      now,
    });
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({
      runs,
      receipts,
      readiness,
      now,
    });
    const providerSandboxContract = buildRestaurantProviderSandboxContract({
      runtimeProbe,
      providerReadinessHealth,
      taskProviderHandoff,
      providerReceiptInbox,
      now,
    });
    const firstForwardableRunPack = buildRestaurantFirstForwardableRunPack({
      queue: storeManagerTaskQueue,
      target: runtimeTarget,
      runtimeProbe,
      providerReadinessHealth,
      providerReceiptInbox,
      now,
    });
    const shiftRuns = listRestaurantShiftAutopilotRuns();
    const shiftProviderHandoff = buildRestaurantShiftProviderHandoff({
      shiftRuns,
      providerReadinessHealth,
      now,
    });
    const shiftSandboxAcceptance = buildRestaurantShiftSandboxAcceptance({
      shiftProviderHandoff,
      providerReadinessHealth,
      providerSandboxContract,
      now,
    });
    const shiftFirstForwardableRun = buildRestaurantShiftFirstForwardableRun({
      shiftRuns,
      shiftProviderHandoff,
      shiftSandboxAcceptance,
      firstForwardableRunPack,
      taskProviderHandoff,
      providerSandboxContract,
      now,
    });
    const commandCenter = await buildRestaurantAgentCommandCenter({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      runs,
      receipts,
      readiness,
      browserSessions: listRestaurantBrowserSessions(),
      now,
    });
    const postRunReviewPack = buildRestaurantPostRunReviewPack({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      queue: storeManagerTaskQueue,
      runs,
      receipts,
      readiness,
      posImports: [],
      target: runtimeTarget,
      runtimeProbe,
      providerReadinessHealth,
      providerReceiptInbox,
      now,
    });
    const recovery = buildRestaurantAgentRecoveryPlan(runs, receipts, readiness, now);
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger();
    const shiftCloseoutTrainingPack = buildRestaurantShiftCloseoutTrainingPack({
      providerReceiptInbox,
      recovery,
      postRunReviewPack,
      capabilityTrainingPlan,
      now,
    });
    const trainingRecords = listRestaurantCapabilityTrainingRecords();
    const shiftCapabilityActivationPack = buildRestaurantShiftCapabilityActivationPack({
      capabilityTrainingPlan,
      trainingRecords,
      providerReadinessHealth,
      now,
    });
    const shiftOperatingLoopPack = buildRestaurantShiftOperatingLoopPack({
      commandCenter,
      shiftRuns,
      shiftProviderHandoff,
      shiftSandboxAcceptance,
      shiftFirstForwardableRun,
      taskProviderHandoff,
      providerSandboxContract,
      providerReceiptInbox,
      providerReadinessHealth,
      recovery,
      shiftCloseoutTrainingPack,
      shiftCapabilityActivationPack,
      capabilityTrainingPlan,
      trainingRecords,
      now,
    });

    return NextResponse.json({
      ok: true,
      shiftOperatingLoopPack,
      commandCenter,
      shiftRuns,
      shiftFirstForwardableRun,
      shiftProviderHandoff,
      shiftSandboxAcceptance,
      firstForwardableRunPack,
      taskProviderHandoff,
      providerSandboxContract,
      providerReceiptInbox,
      providerReadinessHealth,
      recovery,
      shiftCloseoutTrainingPack,
      shiftCapabilityActivationPack,
      capabilityTrainingPlan,
      trainingRecords,
      providerSetupState,
      storeManagerTaskQueue,
      runs,
      receipts,
    });
  }

  if (body.action === 'command-route') {
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const commandCenter = await buildRestaurantAgentCommandCenter({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      runs,
      receipts,
      readiness: buildRestaurantExternalReadiness(),
      browserSessions: listRestaurantBrowserSessions(),
    });
    return NextResponse.json({
      ok: true,
      commandRoute: buildRestaurantCommandRoute({
        command: typeof body.command === 'string' ? body.command : undefined,
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        audience: typeof body.audience === 'string' ? body.audience : undefined,
        channels: typeof body.channels === 'string' ? body.channels : undefined,
        visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
        constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
        evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
        commandCenter,
      }),
      commandCenter,
      runs,
      receipts,
    });
  }

  if (body.action === 'ai-employee-memory-pack') {
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const commandCenter = await buildRestaurantAgentCommandCenter({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      runs,
      receipts,
      readiness: buildRestaurantExternalReadiness(),
      browserSessions: listRestaurantBrowserSessions(),
    });
    const commandRoute = typeof body.command === 'string' && body.command.trim()
      ? buildRestaurantCommandRoute({
          command: body.command,
          restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
          offer: typeof body.offer === 'string' ? body.offer : undefined,
          audience: typeof body.audience === 'string' ? body.audience : undefined,
          channels: typeof body.channels === 'string' ? body.channels : undefined,
          visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
          constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
          evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
          commandCenter,
        })
      : undefined;
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger({
      configuredProviders: [
        ...providerSetupState.provided.envKeys,
        ...providerSetupState.provided.merchantApprovals,
        ...providerSetupState.provided.dataContracts,
      ],
    });
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    const storeManagerTaskWatcher = buildRestaurantStoreManagerTaskWatcher(storeManagerTaskQueue);
    const channelDeliveryReport = buildRestaurantAgentChannelDeliveryReport();
    const clawSkillExecutionLedger = buildRestaurantClawSkillExecutionLedger();
    const safeCommandRoute = commandRoute
      ? {
          ...commandRoute,
          command: commandRoute.extracted.forbiddenHints.length ? '[redacted-sensitive-command]' : commandRoute.command,
        }
      : undefined;

    return NextResponse.json({
      ok: true,
      aiEmployeeMemoryPack: buildRestaurantAiEmployeeMemoryPack({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        commandRoute,
        commandCenter,
        capabilityTrainingPlan,
        providerSetupState,
        storeManagerTaskQueue,
        storeManagerTaskWatcher,
        channelDeliveryReport,
        clawSkillExecutionLedger,
      }),
      commandRoute: safeCommandRoute,
      commandCenter,
      capabilityTrainingPlan,
      providerSetupState,
      storeManagerTaskQueue,
      storeManagerTaskWatcher,
      channelDeliveryReport,
      clawSkillExecutionLedger,
      runs,
      receipts,
    });
  }

  if (body.action === 'customer-demand-gateway') {
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger({
      configuredProviders: [
        ...providerSetupState.provided.envKeys,
        ...providerSetupState.provided.merchantApprovals,
        ...providerSetupState.provided.dataContracts,
      ],
    });
    const commandRoute = typeof body.command === 'string' && body.command.trim()
      ? buildRestaurantCommandRoute({
          command: body.command,
          restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
          offer: typeof body.offer === 'string' ? body.offer : undefined,
          audience: typeof body.audience === 'string' ? body.audience : undefined,
          channels: typeof body.channels === 'string' ? body.channels : undefined,
          visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
          constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
          evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
        })
      : undefined;
    const safeCommandRoute = commandRoute
      ? {
          ...commandRoute,
          command: commandRoute.extracted.forbiddenHints.length ? '[redacted-sensitive-command]' : commandRoute.command,
        }
      : undefined;

    return NextResponse.json({
      ok: true,
      customerDemandGateway: buildRestaurantCustomerDemandGateway({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        audience: typeof body.audience === 'string' ? body.audience : undefined,
        channels: typeof body.channels === 'string' ? body.channels : undefined,
        visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
        constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
        evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
        commandRoute,
        capabilityTrainingPlan,
        providerSetupState,
      }),
      commandRoute: safeCommandRoute,
      capabilityTrainingPlan,
      providerSetupState,
    });
  }

  if (body.action === 'voice-order-console') {
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger({
      configuredProviders: [
        ...providerSetupState.provided.envKeys,
        ...providerSetupState.provided.merchantApprovals,
        ...providerSetupState.provided.dataContracts,
      ],
    });
    const commandRoute = typeof body.command === 'string' && body.command.trim()
      ? buildRestaurantCommandRoute({
          command: body.command,
          restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
          offer: typeof body.offer === 'string' ? body.offer : undefined,
          audience: typeof body.audience === 'string' ? body.audience : undefined,
          channels: typeof body.channels === 'string' ? body.channels : undefined,
          visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
          constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
          evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
        })
      : undefined;
    const customerDemandGateway = buildRestaurantCustomerDemandGateway({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      commandRoute,
      capabilityTrainingPlan,
      providerSetupState,
    });
    const safeCommandRoute = commandRoute
      ? {
          ...commandRoute,
          command: commandRoute.extracted.forbiddenHints.length ? '[redacted-sensitive-command]' : commandRoute.command,
        }
      : undefined;

    return NextResponse.json({
      ok: true,
      voiceOrderConsole: buildRestaurantVoiceOrderConsole({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        audience: typeof body.audience === 'string' ? body.audience : undefined,
        channels: typeof body.channels === 'string' ? body.channels : undefined,
        visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
        constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
        evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
        customerDemandGateway,
        providerSetupState,
      }),
      customerDemandGateway,
      commandRoute: safeCommandRoute,
      capabilityTrainingPlan,
      providerSetupState,
    });
  }

  if (body.action === 'provider-launch-board') {
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
    });
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger({
      configuredProviders: [
        ...providerSetupState.provided.envKeys,
        ...providerSetupState.provided.merchantApprovals,
        ...providerSetupState.provided.dataContracts,
      ],
    });
    const commandRoute = typeof body.command === 'string' && body.command.trim()
      ? buildRestaurantCommandRoute({
          command: body.command,
          restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
          offer: typeof body.offer === 'string' ? body.offer : undefined,
          audience: typeof body.audience === 'string' ? body.audience : undefined,
          channels: typeof body.channels === 'string' ? body.channels : undefined,
          visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
          constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
          evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
        })
      : undefined;
    const customerDemandGateway = buildRestaurantCustomerDemandGateway({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      commandRoute,
      capabilityTrainingPlan,
      providerSetupState,
    });
    const voiceOrderConsole = buildRestaurantVoiceOrderConsole({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      customerDemandGateway,
      providerSetupState,
    });
    const safeCommandRoute = commandRoute
      ? {
          ...commandRoute,
          command: commandRoute.extracted.forbiddenHints.length ? '[redacted-sensitive-command]' : commandRoute.command,
        }
      : undefined;

    return NextResponse.json({
      ok: true,
      providerLaunchBoard: buildRestaurantProviderLaunchBoard({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        audience: typeof body.audience === 'string' ? body.audience : undefined,
        channels: typeof body.channels === 'string' ? body.channels : undefined,
        visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
        constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
        evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
        providerSetupState,
        providerReadinessHealth,
        customerDemandGateway,
        voiceOrderConsole,
      }),
      customerDemandGateway,
      voiceOrderConsole,
      commandRoute: safeCommandRoute,
      capabilityTrainingPlan,
      providerSetupState,
      providerReadinessHealth,
    });
  }

  if (body.action === 'merchant-activation-packet') {
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
    });
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger({
      configuredProviders: [
        ...providerSetupState.provided.envKeys,
        ...providerSetupState.provided.merchantApprovals,
        ...providerSetupState.provided.dataContracts,
      ],
    });
    const commandRoute = typeof body.command === 'string' && body.command.trim()
      ? buildRestaurantCommandRoute({
          command: body.command,
          restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
          offer: typeof body.offer === 'string' ? body.offer : undefined,
          audience: typeof body.audience === 'string' ? body.audience : undefined,
          channels: typeof body.channels === 'string' ? body.channels : undefined,
          visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
          constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
          evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
        })
      : undefined;
    const customerDemandGateway = buildRestaurantCustomerDemandGateway({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      commandRoute,
      capabilityTrainingPlan,
      providerSetupState,
    });
    const voiceOrderConsole = buildRestaurantVoiceOrderConsole({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      customerDemandGateway,
      providerSetupState,
    });
    const providerLaunchBoard = buildRestaurantProviderLaunchBoard({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      providerSetupState,
      providerReadinessHealth,
      customerDemandGateway,
      voiceOrderConsole,
    });
    const providerSetupWizard = buildRestaurantProviderSetupWizard({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      provided: providerSetupState.provided,
    });
    const providerUnlockLadder = buildRestaurantProviderUnlockLadder({
      setupState: providerSetupState,
      health: providerReadinessHealth,
    });
    const safeCommandRoute = commandRoute
      ? {
          ...commandRoute,
          command: commandRoute.extracted.forbiddenHints.length ? '[redacted-sensitive-command]' : commandRoute.command,
        }
      : undefined;

    return NextResponse.json({
      ok: true,
      merchantActivationPacket: buildRestaurantMerchantActivationPacket({
        providerLaunchBoard,
        providerSetupWizard,
        providerUnlockLadder,
      }),
      providerLaunchBoard,
      providerSetupWizard,
      providerUnlockLadder,
      customerDemandGateway,
      voiceOrderConsole,
      commandRoute: safeCommandRoute,
      capabilityTrainingPlan,
      providerSetupState,
      providerReadinessHealth,
    });
  }

  if (body.action === 'ai-consultant-copilot') {
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
    });
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger({
      configuredProviders: [
        ...providerSetupState.provided.envKeys,
        ...providerSetupState.provided.merchantApprovals,
        ...providerSetupState.provided.dataContracts,
      ],
    });
    const commandRoute = typeof body.command === 'string' && body.command.trim()
      ? buildRestaurantCommandRoute({
          command: body.command,
          restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
          offer: typeof body.offer === 'string' ? body.offer : undefined,
          audience: typeof body.audience === 'string' ? body.audience : undefined,
          channels: typeof body.channels === 'string' ? body.channels : undefined,
          visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
          constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
          evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
        })
      : undefined;
    const customerDemandGateway = buildRestaurantCustomerDemandGateway({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      commandRoute,
      capabilityTrainingPlan,
      providerSetupState,
    });
    const voiceOrderConsole = buildRestaurantVoiceOrderConsole({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      customerDemandGateway,
      providerSetupState,
    });
    const providerLaunchBoard = buildRestaurantProviderLaunchBoard({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      providerSetupState,
      providerReadinessHealth,
      customerDemandGateway,
      voiceOrderConsole,
    });
    const safeCommandRoute = commandRoute
      ? {
          ...commandRoute,
          command: commandRoute.extracted.forbiddenHints.length ? '[redacted-sensitive-command]' : commandRoute.command,
        }
      : undefined;

    return NextResponse.json({
      ok: true,
      aiConsultantCopilot: buildRestaurantAiConsultantCopilot({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        audience: typeof body.audience === 'string' ? body.audience : undefined,
        channels: typeof body.channels === 'string' ? body.channels : undefined,
        visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
        constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
        evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
        commandRoute,
        customerDemandGateway,
        voiceOrderConsole,
        providerLaunchBoard,
      }),
      customerDemandGateway,
      voiceOrderConsole,
      providerLaunchBoard,
      commandRoute: safeCommandRoute,
      capabilityTrainingPlan,
      providerSetupState,
      providerReadinessHealth,
    });
  }

  if (body.action === 'store-operating-plan') {
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
    });
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger({
      configuredProviders: [
        ...providerSetupState.provided.envKeys,
        ...providerSetupState.provided.merchantApprovals,
        ...providerSetupState.provided.dataContracts,
      ],
    });
    const commandRoute = typeof body.command === 'string' && body.command.trim()
      ? buildRestaurantCommandRoute({
          command: body.command,
          restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
          offer: typeof body.offer === 'string' ? body.offer : undefined,
          audience: typeof body.audience === 'string' ? body.audience : undefined,
          channels: typeof body.channels === 'string' ? body.channels : undefined,
          visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
          constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
          evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
        })
      : undefined;
    const customerDemandGateway = buildRestaurantCustomerDemandGateway({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      commandRoute,
      capabilityTrainingPlan,
      providerSetupState,
    });
    const voiceOrderConsole = buildRestaurantVoiceOrderConsole({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      customerDemandGateway,
      providerSetupState,
    });
    const providerLaunchBoard = buildRestaurantProviderLaunchBoard({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      providerSetupState,
      providerReadinessHealth,
      customerDemandGateway,
      voiceOrderConsole,
    });
    const aiConsultantCopilot = buildRestaurantAiConsultantCopilot({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      commandRoute,
      customerDemandGateway,
      voiceOrderConsole,
      providerLaunchBoard,
    });
    const dayZeroMissionPack = buildRestaurantDayZeroMissionPack({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      manualText: typeof body.evidence === 'string' ? body.evidence : undefined,
    });
    const safeCommandRoute = commandRoute
      ? {
          ...commandRoute,
          command: commandRoute.extracted.forbiddenHints.length ? '[redacted-sensitive-command]' : commandRoute.command,
        }
      : undefined;

    return NextResponse.json({
      ok: true,
      storeOperatingPlan: buildRestaurantStoreOperatingPlan({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        audience: typeof body.audience === 'string' ? body.audience : undefined,
        channels: typeof body.channels === 'string' ? body.channels : undefined,
        visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
        constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
        evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
        aiConsultantCopilot,
        customerDemandGateway,
        voiceOrderConsole,
        providerLaunchBoard,
        dayZeroMissionPack,
      }),
      aiConsultantCopilot,
      customerDemandGateway,
      voiceOrderConsole,
      providerLaunchBoard,
      dayZeroMissionPack,
      commandRoute: safeCommandRoute,
      capabilityTrainingPlan,
      providerSetupState,
      providerReadinessHealth,
    });
  }

  if (body.action === 'ai-cockpit') {
    const providerSetupState = buildRestaurantProviderSetupStateSummary();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState,
    });
    const capabilityTrainingPlan = buildRestaurantCapabilityTrainingPlanFromLedger({
      configuredProviders: [
        ...providerSetupState.provided.envKeys,
        ...providerSetupState.provided.merchantApprovals,
        ...providerSetupState.provided.dataContracts,
      ],
    });
    const commandRoute = typeof body.command === 'string' && body.command.trim()
      ? buildRestaurantCommandRoute({
          command: body.command,
          restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
          offer: typeof body.offer === 'string' ? body.offer : undefined,
          audience: typeof body.audience === 'string' ? body.audience : undefined,
          channels: typeof body.channels === 'string' ? body.channels : undefined,
          visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
          constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
          evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
        })
      : undefined;
    const customerDemandGateway = buildRestaurantCustomerDemandGateway({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      commandRoute,
      capabilityTrainingPlan,
      providerSetupState,
    });
    const voiceOrderConsole = buildRestaurantVoiceOrderConsole({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      customerDemandGateway,
      providerSetupState,
    });
    const providerLaunchBoard = buildRestaurantProviderLaunchBoard({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      providerSetupState,
      providerReadinessHealth,
      customerDemandGateway,
      voiceOrderConsole,
    });
    const aiConsultantCopilot = buildRestaurantAiConsultantCopilot({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      commandRoute,
      customerDemandGateway,
      voiceOrderConsole,
      providerLaunchBoard,
    });
    const dayZeroMissionPack = buildRestaurantDayZeroMissionPack({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      manualText: typeof body.evidence === 'string' ? body.evidence : undefined,
    });
    const storeOperatingPlan = buildRestaurantStoreOperatingPlan({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      channels: typeof body.channels === 'string' ? body.channels : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
      evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      aiConsultantCopilot,
      customerDemandGateway,
      voiceOrderConsole,
      providerLaunchBoard,
      dayZeroMissionPack,
    });
    const safeCommandRoute = commandRoute
      ? {
          ...commandRoute,
          command: commandRoute.extracted.forbiddenHints.length ? '[redacted-sensitive-command]' : commandRoute.command,
        }
      : undefined;

    return NextResponse.json({
      ok: true,
      aiCockpit: buildRestaurantAiCockpit({
        storeOperatingPlan,
        aiConsultantCopilot,
        providerLaunchBoard,
      }),
      storeOperatingPlan,
      aiConsultantCopilot,
      customerDemandGateway,
      voiceOrderConsole,
      providerLaunchBoard,
      dayZeroMissionPack,
      commandRoute: safeCommandRoute,
      capabilityTrainingPlan,
      providerSetupState,
      providerReadinessHealth,
    });
  }

  if (body.action === 'runtime-probe') {
    return NextResponse.json({
      ok: true,
      runtimeProbe: await buildRestaurantRuntimeProbe(),
    });
  }

  if (body.action === 'provider-readiness-health') {
    const stateSummary = buildRestaurantProviderSetupStateSummary();
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState: stateSummary,
    });
    return NextResponse.json({
      ok: true,
      providerReadinessHealth,
      providerSetupState: stateSummary,
      providerUnlockLadder: buildRestaurantProviderUnlockLadder({
        setupState: stateSummary,
        health: providerReadinessHealth,
      }),
    });
  }

  if (body.action === 'runtime-setup-contract') {
    return NextResponse.json({
      ok: true,
      runtimeSetupContract: buildRestaurantRuntimeSetupContract(),
    });
  }

  if (body.action === 'runtime-adapter-contract') {
    const runtimeTarget = body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
      ? body.runtimeTarget
      : 'openclaw';
    const runtimeProbe = await buildRestaurantRuntimeProbe();
    const executionPackage = buildRestaurantAgentExecutionPackage({
      target: runtimeTarget,
      taskId: typeof body.taskId === 'string' ? body.taskId : 'browser-publish-check',
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      owner: typeof body.owner === 'string' ? body.owner : undefined,
      requestedAction: body.requestedAction === 'submit_platform_publish' || body.requestedAction === 'capture_public_receipt' || body.requestedAction === 'open_public_page'
        ? body.requestedAction
        : 'capture_public_receipt',
    });
    return NextResponse.json({
      ok: true,
      runtimeAdapterContract: buildRestaurantRuntimeAdapterContract({
        target: runtimeTarget,
        executionPackage,
        runtimeProbe,
      }),
      executionPackage,
      runtimeProbe,
    });
  }

  if (body.action === 'runtime-runner-loop-pack') {
    const runs = listRestaurantAgentRuns();
    const receipts = listRestaurantAgentReceipts();
    const runnerEvents = listRestaurantBrowserRunnerEvents();
    const readiness = buildRestaurantExternalReadiness();
    return NextResponse.json({
      ok: true,
      runtimeRunnerLoopPack: buildRestaurantRuntimeRunnerLoopPack({
        runs,
        receipts,
        runnerEvents,
        readiness,
      }),
      runs,
      receipts,
      runnerEvents,
    });
  }

  if (body.action === 'provider-setup-pack') {
    return NextResponse.json({
      ok: true,
      providerSetupPack: buildRestaurantProviderSetupPack({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
      }),
    });
  }

  if (body.action === 'external-unlock-request-pack') {
    return NextResponse.json({
      ok: true,
      externalUnlockRequestPack: buildRestaurantExternalUnlockRequestPack({
        sampleId: typeof body.sampleId === 'string' ? body.sampleId : undefined,
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        audience: typeof body.audience === 'string' ? body.audience : undefined,
        channels: typeof body.channels === 'string' ? body.channels : undefined,
        visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
        constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
        evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      }),
    });
  }

  if (body.action === 'provider-setup-wizard') {
    const stateSummary = buildRestaurantProviderSetupStateSummary();
    const provided = typeof body.provided === 'object' && body.provided
      ? {
          envKeys: Array.isArray((body.provided as { envKeys?: unknown }).envKeys)
            ? (body.provided as { envKeys?: unknown[] }).envKeys?.filter((item): item is string => typeof item === 'string')
            : undefined,
          merchantApprovals: Array.isArray((body.provided as { merchantApprovals?: unknown }).merchantApprovals)
            ? (body.provided as { merchantApprovals?: unknown[] }).merchantApprovals?.filter((item): item is string => typeof item === 'string')
            : undefined,
          dataContracts: Array.isArray((body.provided as { dataContracts?: unknown }).dataContracts)
            ? (body.provided as { dataContracts?: unknown[] }).dataContracts?.filter((item): item is string => typeof item === 'string')
            : undefined,
        }
      : undefined;
    return NextResponse.json({
      ok: true,
      providerSetupWizard: buildRestaurantProviderSetupWizard({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        provided: provided || stateSummary.provided,
      }),
      providerSetupState: stateSummary,
    });
  }

  if (body.action === 'provider-setup-state-record') {
    const result = recordRestaurantProviderSetupState({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      configuredEnvKeys: Array.isArray(body.configuredEnvKeys) ? body.configuredEnvKeys : undefined,
      merchantApprovals: Array.isArray(body.merchantApprovals) ? body.merchantApprovals : undefined,
      dataContracts: Array.isArray(body.dataContracts) ? body.dataContracts : undefined,
      notes: Array.isArray(body.notes) ? body.notes : undefined,
      submittedBy: typeof body.submittedBy === 'string' ? body.submittedBy : undefined,
    });
    const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
      providerSetupState: result.summary,
    });
    return NextResponse.json({
      ok: true,
      providerSetupStateRecord: result.record,
      providerSetupState: result.summary,
      providerSetupWizard: buildRestaurantProviderSetupWizard({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        provided: result.summary.provided,
      }),
      providerReadinessHealth,
      providerUnlockLadder: buildRestaurantProviderUnlockLadder({
        setupState: result.summary,
        health: providerReadinessHealth,
      }),
    }, { status: 201 });
  }

  if (body.action === 'provider-setup-state-summary') {
    return NextResponse.json({
      ok: true,
      providerSetupState: buildRestaurantProviderSetupStateSummary(),
    });
  }

  if (body.action === 'activation-cockpit') {
    return NextResponse.json({
      ok: true,
      activationCockpit: buildRestaurantActivationCockpit({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
      }),
    });
  }

  if (body.action === 'channel-hub') {
    return NextResponse.json({
      ok: true,
      channelHub: buildRestaurantAgentChannelHub({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
      }),
    });
  }

  if (body.action === 'channel-delivery-attempt') {
    const result = await executeRestaurantAgentChannelDeliveryAttempt({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      channelId: body.channelId === 'webchat'
        || body.channelId === 'wecom'
        || body.channelId === 'feishu'
        || body.channelId === 'dingtalk'
        || body.channelId === 'sms'
        ? body.channelId
        : undefined,
      jobId: typeof body.jobId === 'string' ? body.jobId : undefined,
    });
    return NextResponse.json({
      ok: result.attempt.status === 'forwarded' || result.attempt.status === 'manual-ready',
      channelDeliveryAttempt: result.attempt,
      channelDeliveryReport: result.report,
    }, { status: result.attempt.status === 'blocked' ? 409 : result.attempt.status === 'failed' ? 502 : 201 });
  }

  if (body.action === 'channel-delivery-report') {
    return NextResponse.json({
      ok: true,
      channelDeliveryReport: buildRestaurantAgentChannelDeliveryReport(),
    });
  }

  if (body.action === 'channel-delivery-acknowledgement') {
    const result = recordRestaurantAgentChannelDeliveryAcknowledgement({
      attemptId: typeof body.attemptId === 'string' ? body.attemptId : undefined,
      status: body.status === 'needs-recovery' ? 'needs-recovery' : 'acknowledged',
      operator: typeof body.operator === 'string' ? body.operator : undefined,
      note: typeof body.note === 'string' ? body.note : undefined,
      evidenceUrl: typeof body.evidenceUrl === 'string' ? body.evidenceUrl : undefined,
    });
    return NextResponse.json({
      ok: result.acknowledgement.status === 'acknowledged',
      channelDeliveryAcknowledgement: result.acknowledgement,
      channelDeliveryReport: result.report,
    }, { status: result.acknowledgement.status === 'acknowledged' ? 201 : 409 });
  }

  if (body.action === 'channel-schedule-run') {
    const scheduleRun = await runRestaurantAgentChannelSchedule({
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      limit: typeof body.limit === 'number' ? body.limit : undefined,
      includeProviderGated: typeof body.includeProviderGated === 'boolean' ? body.includeProviderGated : undefined,
    });
    return NextResponse.json({
      ok: true,
      channelScheduleRun: scheduleRun,
      channelDeliveryReport: scheduleRun.deliveryReport,
    }, { status: scheduleRun.summary.failed > 0 ? 502 : scheduleRun.summary.blocked > 0 ? 409 : 201 });
  }

  if (body.action === 'external-execution-wizard') {
    return NextResponse.json({
      ok: true,
      externalExecutionWizard: await buildRestaurantExternalExecutionWizard({
        target: body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
          ? body.runtimeTarget
          : undefined,
        requestedAction: body.requestedAction === 'open_public_page'
          || body.requestedAction === 'capture_public_receipt'
          || body.requestedAction === 'prepare_publish_draft'
          || body.requestedAction === 'submit_platform_publish'
          || body.requestedAction === 'pull_pos_redemption'
          || body.requestedAction === 'summarize_lead_counts'
          || body.requestedAction === 'read_private_message'
          ? body.requestedAction
          : undefined,
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        owner: typeof body.owner === 'string' ? body.owner : undefined,
      }),
    });
  }

  if (body.action === 'controlled-trial-run') {
    const controlledTrialRun = await runRestaurantControlledTrialRun({
      target: body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
        ? body.runtimeTarget
        : undefined,
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      owner: typeof body.owner === 'string' ? body.owner : undefined,
      signalType: readBusinessSignalType(body.signalType),
      reservationCount: typeof body.reservationCount === 'number' ? body.reservationCount : undefined,
      couponClaimCount: typeof body.couponClaimCount === 'number' ? body.couponClaimCount : undefined,
      redemptionCount: typeof body.redemptionCount === 'number' ? body.redemptionCount : undefined,
      inquiryCount: typeof body.inquiryCount === 'number' ? body.inquiryCount : undefined,
      visitIntentCount: typeof body.visitIntentCount === 'number' ? body.visitIntentCount : undefined,
    });

    return NextResponse.json({
      ok: controlledTrialRun.simulation.receipt.status === 'accepted',
      controlledTrialRun,
      runs: listRestaurantAgentRuns(),
      receipts: listRestaurantAgentReceipts(),
    }, { status: controlledTrialRun.simulation.receipt.status === 'accepted' ? 201 : 422 });
  }

  if (body.action === 'competitor-audit') {
    return NextResponse.json({
      ok: true,
      competitorAudit: buildRestaurantCompetitorAuditReport(),
    });
  }

  if (body.action === 'competitor-training-blueprint') {
    return NextResponse.json({
      ok: true,
      competitorTrainingBlueprint: await buildRestaurantCompetitorTrainingBlueprint({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        audience: typeof body.audience === 'string' ? body.audience : undefined,
        channels: typeof body.channels === 'string' ? body.channels : undefined,
        visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
        runs: listRestaurantAgentRuns(),
        receipts: listRestaurantAgentReceipts(),
        runnerEvents: listRestaurantBrowserRunnerEvents(),
      }),
    });
  }

  if (body.action === 'competitor-route-decision') {
    return NextResponse.json({
      ok: true,
      competitorRouteDecision: await buildRestaurantCompetitorRouteDecision({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        audience: typeof body.audience === 'string' ? body.audience : undefined,
        channels: typeof body.channels === 'string' ? body.channels : undefined,
        visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
        constraints: typeof body.constraints === 'string' ? body.constraints : undefined,
        evidence: typeof body.evidence === 'string' ? body.evidence : undefined,
      }),
    });
  }

  if (body.action === 'build-queue') {
    return NextResponse.json({
      ok: true,
      buildQueue: buildRestaurantBuildQueue(),
    });
  }

  if (body.action === 'tool-policy') {
    return NextResponse.json({
      ok: true,
      toolPolicy: buildRestaurantAgentToolPolicyReport({
        target: body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
          ? body.runtimeTarget
          : undefined,
        browserRuntimeTarget: body.browserRuntimeTarget === 'openclaw' || body.browserRuntimeTarget === 'hermes'
          ? body.browserRuntimeTarget
          : undefined,
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        operator: typeof body.operator === 'string' ? body.operator : undefined,
        expiresAt: typeof body.expiresAt === 'string' ? body.expiresAt : undefined,
        revoked: body.revoked === true,
      }),
    });
  }

  if (body.action === 'public-profile') {
    const publicProfile = buildRestaurantPublicProfileIntake({
      sampleId: typeof body.sampleId === 'string' ? body.sampleId : undefined,
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      city: typeof body.city === 'string' ? body.city : undefined,
      area: typeof body.area === 'string' ? body.area : undefined,
      cuisine: typeof body.cuisine === 'string' ? body.cuisine : undefined,
      scenario: typeof body.scenario === 'string' ? body.scenario : undefined,
      sourceUrl: typeof body.sourceUrl === 'string' ? body.sourceUrl : undefined,
      suggestedOffer: typeof body.suggestedOffer === 'string' ? body.suggestedOffer : undefined,
      suggestedAudience: typeof body.suggestedAudience === 'string' ? body.suggestedAudience : undefined,
      manualText: typeof body.manualText === 'string' ? body.manualText : undefined,
    });
    return NextResponse.json({
      ok: true,
      publicProfile,
      publicIntelligenceBrief: buildRestaurantPublicIntelligenceBrief({ publicProfile }),
    });
  }

  if (body.action === 'public-source-harvest-pack') {
    const publicProfile = buildRestaurantPublicProfileIntake({
      sampleId: typeof body.sampleId === 'string' ? body.sampleId : undefined,
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      city: typeof body.city === 'string' ? body.city : undefined,
      area: typeof body.area === 'string' ? body.area : undefined,
      cuisine: typeof body.cuisine === 'string' ? body.cuisine : undefined,
      scenario: typeof body.scenario === 'string' ? body.scenario : undefined,
      sourceUrl: typeof body.sourceUrl === 'string' ? body.sourceUrl : undefined,
      suggestedOffer: typeof body.suggestedOffer === 'string' ? body.suggestedOffer : undefined,
      suggestedAudience: typeof body.suggestedAudience === 'string' ? body.suggestedAudience : undefined,
      manualText: typeof body.manualText === 'string' ? body.manualText : undefined,
    });
    const publicIntelligenceBrief = buildRestaurantPublicIntelligenceBrief({ publicProfile });
    return NextResponse.json({
      ok: true,
      publicProfile,
      publicIntelligenceBrief,
      publicSourceHarvestPack: buildRestaurantPublicSourceHarvestPack({
        publicProfile,
        publicIntelligenceBrief,
      }),
    });
  }

  if (body.action === 'public-trial-seed') {
    return NextResponse.json({
      ok: true,
      publicTrialSeed: buildRestaurantPublicTrialSeed({
        sampleId: typeof body.sampleId === 'string' ? body.sampleId : undefined,
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        city: typeof body.city === 'string' ? body.city : undefined,
        area: typeof body.area === 'string' ? body.area : undefined,
        cuisine: typeof body.cuisine === 'string' ? body.cuisine : undefined,
        scenario: typeof body.scenario === 'string' ? body.scenario : undefined,
        sourceUrl: typeof body.sourceUrl === 'string' ? body.sourceUrl : undefined,
        suggestedOffer: typeof body.suggestedOffer === 'string' ? body.suggestedOffer : undefined,
        suggestedAudience: typeof body.suggestedAudience === 'string' ? body.suggestedAudience : undefined,
        manualText: typeof body.manualText === 'string' ? body.manualText : undefined,
      }),
    });
  }

  if (body.action === 'day-zero-mission-pack') {
    const dayZeroMissionPack = buildRestaurantDayZeroMissionPack({
      sampleId: typeof body.sampleId === 'string' ? body.sampleId : undefined,
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      city: typeof body.city === 'string' ? body.city : undefined,
      area: typeof body.area === 'string' ? body.area : undefined,
      cuisine: typeof body.cuisine === 'string' ? body.cuisine : undefined,
      visitReason: typeof body.visitReason === 'string' ? body.visitReason : undefined,
      sourceUrl: typeof body.sourceUrl === 'string' ? body.sourceUrl : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      audience: typeof body.audience === 'string' ? body.audience : undefined,
      manualText: typeof body.manualText === 'string' ? body.manualText : undefined,
    });
    const shouldRecordTasks = body.recordTasks === true;
    const storeManagerTaskRecords = shouldRecordTasks
      ? recordRestaurantStoreManagerTasksFromDayZeroMissionPack(dayZeroMissionPack)
      : [];
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    const storeManagerTaskWatcher = buildRestaurantStoreManagerTaskWatcher(storeManagerTaskQueue);
    const staffNotificationHandoff = buildRestaurantStaffNotificationHandoff(storeManagerTaskWatcher);
    const staffNotificationDeliveryBridge = buildRestaurantStaffNotificationDeliveryBridge({
      handoff: staffNotificationHandoff,
    });
    return NextResponse.json({
      ok: true,
      dayZeroMissionPack,
      storeManagerTaskRecords,
      storeManagerTaskQueue,
      storeManagerTaskWatcher,
      staffNotificationHandoff,
      staffNotificationDeliveryBridge,
      taskProviderHandoff: buildRestaurantTaskProviderHandoff({ queue: storeManagerTaskQueue }),
    });
  }

  if (body.action === 'browser-session') {
    const browserSession = buildRestaurantBrowserSessionManifest({
      runtimeTarget: body.runtimeTarget === 'hermes' ? 'hermes' : 'openclaw',
      eventId: typeof body.eventId === 'string' ? body.eventId : undefined,
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      channel: typeof body.channel === 'string' ? body.channel : undefined,
    });
    const browserSessionRecord = recordRestaurantBrowserSession(browserSession);
    return NextResponse.json({
      ok: true,
      browserSession,
      browserSessionRecord,
      browserSessionHealth: buildRestaurantBrowserSessionHealth(listRestaurantBrowserSessions()),
    });
  }

  if (body.action === 'browser-runbook') {
    return NextResponse.json({
      ok: true,
      browserRunbook: buildRestaurantBrowserRunbookPackage({
        runtimeTarget: body.runtimeTarget === 'hermes' ? 'hermes' : 'openclaw',
        eventId: typeof body.eventId === 'string' ? body.eventId : undefined,
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        channel: typeof body.channel === 'string' ? body.channel : undefined,
        targetUrl: typeof body.targetUrl === 'string' ? body.targetUrl : undefined,
        allowedDomains: Array.isArray(body.allowedDomains) ? body.allowedDomains.filter((item): item is string => typeof item === 'string') : undefined,
      }),
    });
  }

  if (body.action === 'browser-runner-contract') {
    return NextResponse.json({
      ok: true,
      browserRunnerContract: buildRestaurantBrowserRunnerCallbackContract({
        runtimeTarget: body.runtimeTarget === 'hermes' ? 'hermes' : 'openclaw',
        eventId: typeof body.eventId === 'string' ? body.eventId : undefined,
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        channel: typeof body.channel === 'string' ? body.channel : undefined,
        targetUrl: typeof body.targetUrl === 'string' ? body.targetUrl : undefined,
        allowedDomains: Array.isArray(body.allowedDomains) ? body.allowedDomains.filter((item): item is string => typeof item === 'string') : undefined,
      }),
    });
  }

  if (body.action === 'browser-gateway-pack') {
    return NextResponse.json({
      ok: true,
      browserGatewayPack: buildRestaurantBrowserGatewayPack({
        runtimeTarget: body.runtimeTarget === 'hermes' ? 'hermes' : 'openclaw',
        eventId: typeof body.eventId === 'string' ? body.eventId : undefined,
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        channel: typeof body.channel === 'string' ? body.channel : undefined,
        targetUrl: typeof body.targetUrl === 'string' ? body.targetUrl : undefined,
        allowedDomains: Array.isArray(body.allowedDomains) ? body.allowedDomains.filter((item): item is string => typeof item === 'string') : undefined,
      }),
    });
  }

  if (body.action === 'browser-runner-event') {
    const runnerEvent = recordRestaurantBrowserRunnerEvent({
      eventId: typeof body.eventId === 'string' ? body.eventId : undefined,
      runbookId: typeof body.runbookId === 'string' ? body.runbookId : undefined,
      runtimeTarget: body.runtimeTarget === 'hermes' ? 'hermes' : 'openclaw',
      externalRunId: typeof body.externalRunId === 'string' ? body.externalRunId : undefined,
      stepId: typeof body.stepId === 'string' ? body.stepId : undefined,
      type: body.eventType === 'run-started'
        || body.eventType === 'step-completed'
        || body.eventType === 'step-blocked'
        || body.eventType === 'run-failed'
        || body.eventType === 'run-completed'
        ? body.eventType
        : undefined,
      evidenceSummary: typeof body.evidenceSummary === 'string' ? body.evidenceSummary : undefined,
      blockedReason: typeof body.blockedReason === 'string' ? body.blockedReason : undefined,
      nextAction: typeof body.nextAction === 'string' ? body.nextAction : undefined,
      occurredAt: typeof body.occurredAt === 'string' ? body.occurredAt : undefined,
    });
    return NextResponse.json({
      ok: runnerEvent.status !== 'rejected',
      runnerEvent,
      runnerEventHealth: buildRestaurantBrowserRunnerEventHealth(listRestaurantBrowserRunnerEvents()),
    }, { status: runnerEvent.status === 'rejected' ? 422 : 202 });
  }

  if (body.action === 'browser-runner-event-health') {
    return NextResponse.json({
      ok: true,
      runnerEvents: listRestaurantBrowserRunnerEvents(),
      runnerEventHealth: buildRestaurantBrowserRunnerEventHealth(listRestaurantBrowserRunnerEvents()),
    });
  }

  if (body.action === 'browser-session-heartbeat') {
    const session = typeof body.sessionId === 'string'
      ? heartbeatRestaurantBrowserSession(body.sessionId)
      : undefined;
    return NextResponse.json({
      ok: Boolean(session),
      browserSessionRecord: session,
      browserSessionHealth: buildRestaurantBrowserSessionHealth(listRestaurantBrowserSessions()),
      message: session ? session.nextAction : 'browser_session_not_found',
    }, { status: session ? 200 : 404 });
  }

  if (body.action === 'browser-session-health') {
    return NextResponse.json({
      ok: true,
      browserSessionHealth: buildRestaurantBrowserSessionHealth(listRestaurantBrowserSessions()),
    });
  }

  if (body.action === 'grant-manifest') {
    return NextResponse.json({
      ok: true,
      grantManifest: buildRestaurantMerchantGrantManifest({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        operator: typeof body.operator === 'string' ? body.operator : undefined,
        expiresAt: typeof body.expiresAt === 'string' ? body.expiresAt : undefined,
        revoked: body.revoked === true,
      }),
    });
  }

  if (body.action === 'grant-checklist') {
    return NextResponse.json({
      ok: true,
      grantChecklist: buildRestaurantGrantChecklist({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        operator: typeof body.operator === 'string' ? body.operator : undefined,
        expiresAt: typeof body.expiresAt === 'string' ? body.expiresAt : undefined,
        revoked: body.revoked === true,
      }),
    });
  }

  if (body.action === 'activation-gates') {
    return NextResponse.json({
      ok: true,
      activationGates: buildRestaurantActivationGates({
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        operator: typeof body.operator === 'string' ? body.operator : undefined,
        expiresAt: typeof body.expiresAt === 'string' ? body.expiresAt : undefined,
        revoked: body.revoked === true,
      }),
    });
  }

  if (body.action === 'execution-package') {
    return NextResponse.json({
      ok: true,
      executionPackage: buildRestaurantAgentExecutionPackage({
        target: body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
          ? body.runtimeTarget
          : undefined,
        browserRuntimeTarget: body.browserRuntimeTarget === 'openclaw' || body.browserRuntimeTarget === 'hermes'
          ? body.browserRuntimeTarget
          : undefined,
        taskId: typeof body.taskId === 'string' ? body.taskId : undefined,
        restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
        offer: typeof body.offer === 'string' ? body.offer : undefined,
        owner: typeof body.owner === 'string' ? body.owner : undefined,
        requestedAction: body.requestedAction === 'open_public_page'
          || body.requestedAction === 'capture_public_receipt'
          || body.requestedAction === 'prepare_publish_draft'
          || body.requestedAction === 'submit_platform_publish'
          || body.requestedAction === 'pull_pos_redemption'
          || body.requestedAction === 'summarize_lead_counts'
          || body.requestedAction === 'read_private_message'
          ? body.requestedAction
          : undefined,
        expiresAt: typeof body.expiresAt === 'string' ? body.expiresAt : undefined,
        revoked: body.revoked === true,
      }),
    });
  }

  if (body.action === 'callback-simulator') {
    const callbackSimulation = runRestaurantCallbackSimulator({
      target: body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes'
        ? body.runtimeTarget
        : undefined,
      taskId: typeof body.taskId === 'string' ? body.taskId : undefined,
      restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
      offer: typeof body.offer === 'string' ? body.offer : undefined,
      owner: typeof body.owner === 'string' ? body.owner : undefined,
      signalType: readBusinessSignalType(body.signalType),
      reservationCount: typeof body.reservationCount === 'number' ? body.reservationCount : undefined,
      couponClaimCount: typeof body.couponClaimCount === 'number' ? body.couponClaimCount : undefined,
      redemptionCount: typeof body.redemptionCount === 'number' ? body.redemptionCount : undefined,
      inquiryCount: typeof body.inquiryCount === 'number' ? body.inquiryCount : undefined,
      visitIntentCount: typeof body.visitIntentCount === 'number' ? body.visitIntentCount : undefined,
    });

    return NextResponse.json({
      ok: callbackSimulation.receipt.status === 'accepted',
      callbackSimulation,
      runs: listRestaurantAgentRuns(),
      receipts: listRestaurantAgentReceipts(),
    }, { status: callbackSimulation.receipt.status === 'accepted' ? 201 : 422 });
  }

  if (body.action === 'receipt') {
    const receipt = recordRestaurantAgentReceipt({
      eventId: typeof body.eventId === 'string' ? body.eventId : undefined,
      channel: typeof body.channel === 'string' ? body.channel : undefined,
      evidenceUrl: typeof body.evidenceUrl === 'string' ? body.evidenceUrl : undefined,
      screenshotId: typeof body.screenshotId === 'string' ? body.screenshotId : undefined,
      externalRunId: typeof body.externalRunId === 'string' ? body.externalRunId : undefined,
      operator: typeof body.operator === 'string' ? body.operator : undefined,
      summary: typeof body.summary === 'string' ? body.summary : undefined,
      source: 'manual',
      signalType: readBusinessSignalType(body.signalType),
      reservationCount: typeof body.reservationCount === 'number' ? body.reservationCount : undefined,
      couponClaimCount: typeof body.couponClaimCount === 'number' ? body.couponClaimCount : undefined,
      redemptionCount: typeof body.redemptionCount === 'number' ? body.redemptionCount : undefined,
      inquiryCount: typeof body.inquiryCount === 'number' ? body.inquiryCount : undefined,
      visitIntentCount: typeof body.visitIntentCount === 'number' ? body.visitIntentCount : undefined,
    });

    return NextResponse.json({
      ok: receipt.status === 'accepted',
      receipt,
      receipts: listRestaurantAgentReceipts(),
      heartbeat: buildRestaurantAgentHeartbeat(listRestaurantAgentRuns().filter(run => run.eventId === receipt.eventId), [receipt]),
    }, { status: receipt.status === 'accepted' ? 201 : 422 });
  }

  if (body.action === 'external-receipt') {
    const verification = verifyRestaurantAgentCallback(rawBody, request.headers.get('x-restaurant-agent-signature'));
    if (!verification.ok) {
      return NextResponse.json({
        ok: false,
        error: 'external_receipt_signature_denied',
        message: verification.message,
        audit: {
          secretConfigured: verification.secretConfigured,
          secretExposed: false,
        },
      }, { status: verification.status });
    }

    const receipt = recordRestaurantAgentReceipt({
      eventId: typeof body.eventId === 'string' ? body.eventId : undefined,
      channel: typeof body.channel === 'string' ? body.channel : undefined,
      evidenceUrl: typeof body.evidenceUrl === 'string' ? body.evidenceUrl : undefined,
      screenshotId: typeof body.screenshotId === 'string' ? body.screenshotId : undefined,
      externalRunId: typeof body.externalRunId === 'string' ? body.externalRunId : undefined,
      operator: typeof body.operator === 'string' ? body.operator : 'external-runtime',
      summary: typeof body.summary === 'string' ? body.summary : undefined,
      source: 'external-runtime',
      signalType: readBusinessSignalType(body.signalType),
      reservationCount: typeof body.reservationCount === 'number' ? body.reservationCount : undefined,
      couponClaimCount: typeof body.couponClaimCount === 'number' ? body.couponClaimCount : undefined,
      redemptionCount: typeof body.redemptionCount === 'number' ? body.redemptionCount : undefined,
      inquiryCount: typeof body.inquiryCount === 'number' ? body.inquiryCount : undefined,
      visitIntentCount: typeof body.visitIntentCount === 'number' ? body.visitIntentCount : undefined,
    });
    const updatedRuns = listRestaurantAgentRuns();
    const updatedReceipts = listRestaurantAgentReceipts();
    const readiness = buildRestaurantExternalReadiness();
    const providerReceiptInbox = buildRestaurantProviderReceiptInbox({ runs: updatedRuns, receipts: updatedReceipts, readiness });
    const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue();
    const postRunReviewPack = buildRestaurantPostRunReviewPack({
      queue: storeManagerTaskQueue,
      runs: updatedRuns,
      receipts: updatedReceipts,
      readiness,
      providerReceiptInbox,
    });
    const providerReceiptLifecycle = buildRestaurantProviderReceiptLifecycle({
      runs: updatedRuns,
      receipts: updatedReceipts,
      providerReceiptInbox,
      postRunReviewPack,
    });

    return NextResponse.json({
      ok: receipt.status === 'accepted',
      receipt,
      receipts: updatedReceipts,
      providerReceiptLifecycle,
      providerReceiptInbox,
      postRunReviewPack,
      businessSignals: buildRestaurantBusinessSignals(updatedRuns, updatedReceipts),
      heartbeat: buildRestaurantAgentHeartbeat(updatedRuns.filter(run => run.eventId === receipt.eventId), [receipt]),
      audit: {
        signatureVerified: true,
        secretExposed: false,
      },
    }, { status: receipt.status === 'accepted' ? 202 : 422 });
  }

  const dispatch = buildRestaurantAgentDispatch({
    taskId: typeof body.taskId === 'string' ? body.taskId : undefined,
    restaurant: typeof body.restaurant === 'string' ? body.restaurant : undefined,
    offer: typeof body.offer === 'string' ? body.offer : undefined,
    owner: typeof body.owner === 'string' ? body.owner : undefined,
    source: typeof body.source === 'string' ? body.source : undefined,
    runtimeTarget: body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes' || body.runtimeTarget === 'local'
      ? body.runtimeTarget
      : undefined,
  });

  if (body.runtimeTarget === 'lobu' || body.runtimeTarget === 'openclaw' || body.runtimeTarget === 'hermes') {
    const bridge = await forwardRestaurantAgentDispatch(
      dispatch,
      readRestaurantRuntimeBridgeConfig(body.runtimeTarget),
    );
    const run = recordRestaurantAgentRun(dispatch, body.runtimeTarget, bridge);

    return NextResponse.json({ ok: bridge.ok, dispatch, bridge, run }, { status: bridge.ok ? 202 : 200 });
  }

  const run = recordRestaurantAgentRun(dispatch, 'local');

  return NextResponse.json({ ok: dispatch.ok, dispatch, run }, { status: dispatch.ok ? 201 : 409 });
}

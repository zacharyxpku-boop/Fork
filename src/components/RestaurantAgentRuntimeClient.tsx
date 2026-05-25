'use client';

import { useState } from 'react';
import { buildRestaurantAgentCapabilityPlan, type RestaurantCompetitorCapabilityStatus } from '@/lib/restaurant-agent-capabilities';
import type { RestaurantActivationGateReport } from '@/lib/restaurant-agent-activation-gates';
import type { RestaurantAgentChannelDeliveryAttempt, RestaurantAgentChannelDeliveryReport } from '@/lib/restaurant-agent-channel-delivery-store';
import type { RestaurantAgentChannelHub } from '@/lib/restaurant-agent-channel-hub';
import type { RestaurantAgentChannelScheduleRun } from '@/lib/restaurant-agent-channel-scheduler';
import type { RestaurantBuildQueueReport } from '@/lib/restaurant-agent-build-queue';
import type { RestaurantCallbackSimulatorReport } from '@/lib/restaurant-agent-callback-simulator';
import type { RestaurantAgentCommandCenter } from '@/lib/restaurant-agent-command-center';
import type { RestaurantAiCockpit } from '@/lib/restaurant-ai-cockpit';
import type { RestaurantAiConsultantCopilot } from '@/lib/restaurant-ai-consultant-copilot';
import type { RestaurantAiEmployeeMemoryPack } from '@/lib/restaurant-ai-employee-memory-pack';
import type { RestaurantCommandRoute } from '@/lib/restaurant-command-router';
import type { RestaurantAiEmployeeInbox } from '@/lib/restaurant-ai-employee-inbox';
import type { RestaurantAiOsAuditReport } from '@/lib/restaurant-ai-os-audit-report';
import type { RestaurantActivationCockpit } from '@/lib/restaurant-activation-cockpit';
import type { RestaurantClawExperienceDefaultPath } from '@/lib/restaurant-claw-experience-default-path';
import type { RestaurantCompetitorAuditReport } from '@/lib/restaurant-agent-competitor-audit';
import type { RestaurantCompetitorRouteDecision } from '@/lib/restaurant-competitor-route-decision';
import type { RestaurantCompetitorTrainingBlueprint } from '@/lib/restaurant-competitor-training-blueprint';
import type { RestaurantBusinessSignalReport } from '@/lib/restaurant-agent-business-signals';
import type { RestaurantBrowserSessionManifest } from '@/lib/restaurant-agent-browser-session';
import type { RestaurantBrowserSessionHealth } from '@/lib/restaurant-agent-browser-session-store';
import type { RestaurantBrowserRunbookPackage } from '@/lib/restaurant-agent-browser-runbook';
import type { RestaurantBrowserGatewayPack } from '@/lib/restaurant-browser-gateway-pack';
import type { RestaurantBrowserRunnerCallbackContract } from '@/lib/restaurant-agent-browser-runner-contract';
import type { RestaurantBrowserRunnerEventHealth, RestaurantBrowserRunnerEventRecord } from '@/lib/restaurant-agent-browser-runner-event-store';
import type { RestaurantCapabilityTrainingPlan, RestaurantCapabilityTrainingRecord } from '@/lib/restaurant-capability-training';
import { buildRestaurantBenchmarkStrategy, type RestaurantBenchmarkStrategy } from '@/lib/restaurant-benchmark-strategy';
import type { RestaurantClawSkillCatalog, RestaurantClawTrainingBatch } from '@/lib/restaurant-claw-skill-catalog';
import type { RestaurantClawSkillWorkbench } from '@/lib/restaurant-claw-skill-workbench';
import type { RestaurantClawSkillExecutionLedger, RestaurantClawSkillExecutionRecord } from '@/lib/restaurant-claw-skill-execution-store';
import type { RestaurantControlledTrialRun } from '@/lib/restaurant-controlled-trial-run';
import type { RestaurantCustomerDemandGateway } from '@/lib/restaurant-customer-demand-gateway';
import type { RestaurantLeadCaptureInbox } from '@/lib/restaurant-lead-capture-inbox';
import type { RestaurantVoiceOrderConsole } from '@/lib/restaurant-voice-order-console';
import type { RestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import type { RestaurantOperatingInsightReport } from '@/lib/restaurant-operating-insight-report';
import type { RestaurantPlatformConnectorMatrix } from '@/lib/restaurant-platform-connector-matrix';
import type { RestaurantPlatformOperatingSpine } from '@/lib/restaurant-platform-operating-spine';
import type { RestaurantMerchantActivationPacket } from '@/lib/restaurant-merchant-activation-packet';
import type { RestaurantPublishExecutionInbox } from '@/lib/restaurant-publish-execution-inbox';
import type { RestaurantExecutionPackage } from '@/lib/restaurant-agent-execution-package';
import type { RestaurantExternalExecutionWizard } from '@/lib/restaurant-external-execution-wizard';
import type { RestaurantExternalUnlockRequestPack } from '@/lib/restaurant-external-unlock-request-pack';
import type { RestaurantExecutionTimeline } from '@/lib/restaurant-execution-timeline';
import type { RestaurantFirstForwardableRunPack } from '@/lib/restaurant-first-forwardable-run-pack';
import type { RestaurantFirstRunControlTower } from '@/lib/restaurant-first-run-control-tower';
import type { RestaurantPostRunReviewPack } from '@/lib/restaurant-post-run-review-pack';
import type { RestaurantNextLoopChannelPlan } from '@/lib/restaurant-next-loop-channel-plan';
import type { RestaurantReputationCloseoutPack } from '@/lib/restaurant-reputation-closeout-pack';
import type { RestaurantProviderSetupPack } from '@/lib/restaurant-provider-setup-pack';
import type { RestaurantProviderSetupWizard } from '@/lib/restaurant-provider-setup-wizard';
import type { RestaurantProviderSetupStateSummary } from '@/lib/restaurant-provider-setup-state-store';
import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import type { RestaurantProviderUnlockLadder } from '@/lib/restaurant-provider-unlock-ladder';
import type { RestaurantGmCommandDeck } from '@/lib/restaurant-gm-command-deck';
import type { RestaurantShiftAutopilot } from '@/lib/restaurant-shift-autopilot';
import type { RestaurantShiftAutopilotRunRecord } from '@/lib/restaurant-shift-autopilot-run-store';
import type { RestaurantShiftCapabilityActivationPack } from '@/lib/restaurant-shift-capability-activation-pack';
import type { RestaurantShiftCloseoutTrainingPack, RestaurantShiftCloseoutTrainingRecordAttempt } from '@/lib/restaurant-shift-closeout-training-pack';
import type { RestaurantShiftFirstForwardableRun } from '@/lib/restaurant-shift-first-forwardable-run';
import type { RestaurantShiftOperatingLoopPack } from '@/lib/restaurant-shift-operating-loop-pack';
import type { RestaurantShiftProviderHandoff } from '@/lib/restaurant-shift-provider-handoff';
import type { RestaurantShiftSandboxForwardAttempt } from '@/lib/restaurant-shift-sandbox-forward';
import type { RestaurantShiftSandboxAcceptance } from '@/lib/restaurant-shift-sandbox-acceptance';
import type { RestaurantProviderReceiptInbox } from '@/lib/restaurant-provider-receipt-inbox';
import type { RestaurantProviderSandboxContract } from '@/lib/restaurant-provider-sandbox-contract';
import type { RestaurantProviderLaunchBoard } from '@/lib/restaurant-provider-launch-board';
import type { RestaurantProviderLaunchTrainingPack } from '@/lib/restaurant-provider-launch-training-pack';
import { buildRestaurantExternalReadiness, type RestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import type { RestaurantGrantChecklist } from '@/lib/restaurant-agent-grant-checklist';
import type { RestaurantMerchantGrantManifest } from '@/lib/restaurant-agent-grant-manifest';
import type { RestaurantAgentRecoveryPlan } from '@/lib/restaurant-agent-recovery';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantRunHealth } from '@/lib/restaurant-agent-run-health';
import type { RestaurantRuntimeProbe } from '@/lib/restaurant-agent-runtime-probe';
import type { RestaurantRuntimeSetupContract } from '@/lib/restaurant-agent-runtime-setup-contract';
import type { RestaurantRuntimeAdapterContract } from '@/lib/restaurant-runtime-adapter-contract';
import type { RestaurantRuntimeRunnerLoopPack } from '@/lib/restaurant-runtime-runner-loop-pack';
import type { RestaurantResidentAgentMissionControl } from '@/lib/restaurant-resident-agent-mission-control';
import type { RestaurantPosImportReport } from '@/lib/restaurant-pos-import-validator';
import { buildRestaurantAgentRuntime, type RestaurantAgentConnector } from '@/lib/restaurant-agent-runtime';
import type { RestaurantAgentToolPolicyReport } from '@/lib/restaurant-agent-tool-policy';
import type { RestaurantAgentWatcherPolicy } from '@/lib/restaurant-agent-watcher-policy';
import type { RestaurantPublicProfileIntakeReport } from '@/lib/restaurant-public-profile-intake';
import type { RestaurantPublicIntelligenceBrief } from '@/lib/restaurant-public-intelligence-brief';
import type { RestaurantPublicSourceHarvestPack } from '@/lib/restaurant-public-source-harvest-pack';
import type { RestaurantPublicTrialSeed } from '@/lib/restaurant-public-trial-seed';
import type { RestaurantDayZeroMissionPack } from '@/lib/restaurant-day-zero-mission-pack';
import type { RestaurantStoreOperatingPlan } from '@/lib/restaurant-store-operating-plan';
import type { RestaurantAgentOpsConsole } from '@/lib/restaurant-agent-ops-console';
import type { RestaurantStoreManagerFollowupPack } from '@/lib/restaurant-store-manager-followup';
import type { RestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';
import type { RestaurantStoreManagerTaskWatcher } from '@/lib/restaurant-store-manager-task-watcher';
import type { RestaurantStaffNotificationHandoff } from '@/lib/restaurant-staff-notification-handoff';
import type { RestaurantStaffNotificationDeliveryBridge } from '@/lib/restaurant-staff-notification-delivery-bridge';
import type { RestaurantStaffNotificationAuditLog } from '@/lib/restaurant-staff-notification-audit-store';
import type { RestaurantTaskProviderHandoff } from '@/lib/restaurant-task-provider-handoff';
import type { RestaurantTrialWorkflowPack } from '@/lib/restaurant-trial-workflow-pack';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

const runtime = buildRestaurantAgentRuntime();
const capabilityPlan = buildRestaurantAgentCapabilityPlan();
const initialReadiness = buildRestaurantExternalReadiness({});
const initialBenchmarkStrategy = buildRestaurantBenchmarkStrategy();

const statusLabel: Record<RestaurantAgentConnector['status'], string> = {
  'internal-ready': '内部可跑',
  'requires-runtime': '待接 runtime',
  'requires-credential': '待凭据',
  'requires-merchant-auth': '待商家授权',
};

const statusTone: Record<RestaurantAgentConnector['status'], string> = {
  'internal-ready': 'border-emerald-200 bg-emerald-50 text-emerald-800',
  'requires-runtime': 'border-sky-200 bg-sky-50 text-sky-800',
  'requires-credential': 'border-amber-200 bg-amber-50 text-amber-800',
  'requires-merchant-auth': 'border-rose-200 bg-rose-50 text-rose-800',
};

const modeLabel = {
  'local-plan': '本地计划',
  'manual-handoff': '人工交接',
  'external-runtime': '外部执行器',
};

const capabilityStatusLabel: Record<RestaurantCompetitorCapabilityStatus, string> = {
  'internal-ready': '已内建',
  'bridge-ready': '已桥接',
  'external-required': '需外部',
};

const capabilityStatusTone: Record<RestaurantCompetitorCapabilityStatus, string> = {
  'internal-ready': 'border-emerald-200 bg-emerald-50 text-emerald-800',
  'bridge-ready': 'border-sky-200 bg-sky-50 text-sky-800',
  'external-required': 'border-rose-200 bg-rose-50 text-rose-800',
};

const defaultRuntimeIntake: Required<RestaurantTrialIntake> = {
  restaurant: '试用门店',
  offer: '今日主推套餐',
  audience: '附近三公里晚餐客',
  channels: '大众点评 / 小红书 / 抖音 / 微信社群',
  visitReason: '今晚 18:00-20:30 到店不用排队',
  constraints: '价格、库存、券规则和禁用表达必须由店长确认',
  evidence: '菜单截图、菜品图、团购券规则或发布链接',
};

const clawWorkbenchPresets = [
  {
    id: 'content-launch',
    label: 'Content Launch',
    description: 'Dianping, Xiaohongshu, Douyin and WeChat content pack',
    moduleIds: ['brand-positioning', 'menu-engineering', 'local-life-content', 'competitive-intel'],
  },
  {
    id: 'private-domain',
    label: 'Private Domain',
    description: 'Inquiry, group follow-up, reservation and member tasks',
    moduleIds: ['member-growth', 'private-domain', 'reservation-ops', 'service-quality'],
  },
  {
    id: 'coupon-pos',
    label: 'Coupon + POS',
    description: 'Coupon redemption, POS import and finance evidence gates',
    moduleIds: ['coupon-redemption', 'pos-analytics', 'finance-diagnosis', 'legal-compliance'],
  },
  {
    id: 'agent-governance',
    label: 'Agent Governance',
    description: 'Browser runner, receipts, recovery and provider unlocks',
    moduleIds: ['agent-ops', 'chain-standard', 'staff-scheduling', 'food-safety'],
  },
];

function normalizeRuntimeIntake(intake: RestaurantTrialIntake = {}): Required<RestaurantTrialIntake> {
  return {
    restaurant: intake.restaurant || defaultRuntimeIntake.restaurant,
    offer: intake.offer || defaultRuntimeIntake.offer,
    audience: intake.audience || defaultRuntimeIntake.audience,
    channels: intake.channels || defaultRuntimeIntake.channels,
    visitReason: intake.visitReason || defaultRuntimeIntake.visitReason,
    constraints: intake.constraints || defaultRuntimeIntake.constraints,
    evidence: intake.evidence || defaultRuntimeIntake.evidence,
  };
}

export function RestaurantAgentRuntimeClient({ intake = {} }: { intake?: RestaurantTrialIntake }) {
  const runtimeIntake = normalizeRuntimeIntake(intake);
  const intakePreview = [
    { label: '门店', value: runtimeIntake.restaurant },
    { label: '主推', value: runtimeIntake.offer },
    { label: '客群', value: runtimeIntake.audience },
    { label: '渠道', value: runtimeIntake.channels },
  ];
  const [dispatchState, setDispatchState] = useState<{
    status: 'idle' | 'loading' | 'queued' | 'blocked' | 'failed';
    eventId?: string;
    tenantId?: string;
    message?: string;
    latestRuns?: Array<{
      eventId: string;
      taskId: string;
      status: string;
      target: string;
      owner: string;
      nextAction: string;
    }>;
    heartbeat?: {
      heartbeatId: string;
      watchedRuns: number;
      acceptedReceipts?: number;
      shiftAutopilotRuns?: number;
      taskWakeups?: number;
      memorySuggestions?: string[];
      followups: Array<{
        id: string;
        priority: string;
        owner: string;
        reason: string;
        nextAction: string;
        evidenceRequired: string;
      }>;
      watcherPolicy?: RestaurantAgentWatcherPolicy;
      storeManagerTaskWatcher?: RestaurantStoreManagerTaskWatcher;
    };
    readiness?: RestaurantExternalReadiness;
    receipts?: RestaurantAgentReceiptRecord[];
    recovery?: RestaurantAgentRecoveryPlan;
    browserSession?: RestaurantBrowserSessionManifest;
    browserRunbook?: RestaurantBrowserRunbookPackage;
    browserGatewayPack?: RestaurantBrowserGatewayPack;
    browserRunnerContract?: RestaurantBrowserRunnerCallbackContract;
    runnerEvent?: RestaurantBrowserRunnerEventRecord;
    runnerEventHealth?: RestaurantBrowserRunnerEventHealth;
    grantManifest?: RestaurantMerchantGrantManifest;
    grantChecklist?: RestaurantGrantChecklist;
    activationGates?: RestaurantActivationGateReport;
    competitorAudit?: RestaurantCompetitorAuditReport;
    competitorRouteDecision?: RestaurantCompetitorRouteDecision;
    competitorTrainingBlueprint?: RestaurantCompetitorTrainingBlueprint;
    buildQueue?: RestaurantBuildQueueReport;
    executionPackage?: RestaurantExecutionPackage;
    externalExecutionWizard?: RestaurantExternalExecutionWizard;
    executionTimeline?: RestaurantExecutionTimeline;
    callbackSimulation?: RestaurantCallbackSimulatorReport;
    runHealth?: RestaurantRunHealth;
    runtimeProbe?: RestaurantRuntimeProbe;
    runtimeSetupContract?: RestaurantRuntimeSetupContract;
    runtimeAdapterContract?: RestaurantRuntimeAdapterContract;
    runtimeRunnerLoopPack?: RestaurantRuntimeRunnerLoopPack;
    residentAgentMissionControl?: RestaurantResidentAgentMissionControl;
    posImport?: RestaurantPosImportReport;
    capabilityTrainingPlan?: RestaurantCapabilityTrainingPlan;
    capabilityTrainingRecord?: RestaurantCapabilityTrainingRecord;
    capabilityTrainingRecords?: RestaurantCapabilityTrainingRecord[];
    benchmarkStrategy?: RestaurantBenchmarkStrategy;
    clawSkillCatalog?: RestaurantClawSkillCatalog;
    clawSkillWorkbench?: RestaurantClawSkillWorkbench;
    clawSkillExecutionRecord?: RestaurantClawSkillExecutionRecord;
    clawSkillExecutionLedger?: RestaurantClawSkillExecutionLedger;
    clawTrainingBatch?: RestaurantClawTrainingBatch;
    clawExperienceDefaultPath?: RestaurantClawExperienceDefaultPath;
    controlledTrialRun?: RestaurantControlledTrialRun;
    customerDemandGateway?: RestaurantCustomerDemandGateway;
    leadCaptureInbox?: RestaurantLeadCaptureInbox;
    voiceOrderConsole?: RestaurantVoiceOrderConsole;
    aiOsAuditReport?: RestaurantAiOsAuditReport;
    platformConnectorMatrix?: RestaurantPlatformConnectorMatrix;
    operatingInsightReport?: RestaurantOperatingInsightReport;
    platformOperatingSpine?: RestaurantPlatformOperatingSpine;
    merchantActivationPacket?: RestaurantMerchantActivationPacket;
    publishExecutionInbox?: RestaurantPublishExecutionInbox;
    operatingDataContract?: RestaurantOperatingDataContract;
    providerSetupPack?: RestaurantProviderSetupPack;
    externalUnlockRequestPack?: RestaurantExternalUnlockRequestPack;
    providerSetupWizard?: RestaurantProviderSetupWizard;
    providerSetupState?: RestaurantProviderSetupStateSummary;
    providerReadinessHealth?: RestaurantProviderReadinessHealth;
    providerUnlockLadder?: RestaurantProviderUnlockLadder;
    gmCommandDeck?: RestaurantGmCommandDeck;
    shiftAutopilot?: RestaurantShiftAutopilot;
    shiftAutopilotRun?: RestaurantShiftAutopilotRunRecord;
    shiftCapabilityActivationPack?: RestaurantShiftCapabilityActivationPack;
    shiftCloseoutTrainingPack?: RestaurantShiftCloseoutTrainingPack;
    shiftCloseoutTrainingRecordAttempt?: RestaurantShiftCloseoutTrainingRecordAttempt;
    shiftFirstForwardableRun?: RestaurantShiftFirstForwardableRun;
    shiftOperatingLoopPack?: RestaurantShiftOperatingLoopPack;
    shiftProviderHandoff?: RestaurantShiftProviderHandoff;
    shiftSandboxAcceptance?: RestaurantShiftSandboxAcceptance;
    shiftSandboxForwardAttempt?: RestaurantShiftSandboxForwardAttempt;
    providerReceiptInbox?: RestaurantProviderReceiptInbox;
    providerSandboxContract?: RestaurantProviderSandboxContract;
    providerLaunchBoard?: RestaurantProviderLaunchBoard;
    firstForwardableRunPack?: RestaurantFirstForwardableRunPack;
    firstRunControlTower?: RestaurantFirstRunControlTower;
    postRunReviewPack?: RestaurantPostRunReviewPack;
    nextLoopChannelPlan?: RestaurantNextLoopChannelPlan;
    reputationCloseoutPack?: RestaurantReputationCloseoutPack;
    providerLaunchTrainingPack?: RestaurantProviderLaunchTrainingPack;
    businessSignals?: RestaurantBusinessSignalReport;
    browserSessionHealth?: RestaurantBrowserSessionHealth;
    toolPolicy?: RestaurantAgentToolPolicyReport;
    publicProfile?: RestaurantPublicProfileIntakeReport;
    publicIntelligenceBrief?: RestaurantPublicIntelligenceBrief;
    publicSourceHarvestPack?: RestaurantPublicSourceHarvestPack;
    publicTrialSeed?: RestaurantPublicTrialSeed;
    dayZeroMissionPack?: RestaurantDayZeroMissionPack;
    storeOperatingPlan?: RestaurantStoreOperatingPlan;
    opsConsole?: RestaurantAgentOpsConsole;
    commandCenter?: RestaurantAgentCommandCenter;
    aiCockpit?: RestaurantAiCockpit;
    aiConsultantCopilot?: RestaurantAiConsultantCopilot;
    aiEmployeeMemoryPack?: RestaurantAiEmployeeMemoryPack;
    commandRoute?: RestaurantCommandRoute;
    aiEmployeeInbox?: RestaurantAiEmployeeInbox;
    channelHub?: RestaurantAgentChannelHub;
    channelDeliveryAttempt?: RestaurantAgentChannelDeliveryAttempt;
    channelDeliveryReport?: RestaurantAgentChannelDeliveryReport;
    channelScheduleRun?: RestaurantAgentChannelScheduleRun;
    activationCockpit?: RestaurantActivationCockpit;
    storeManagerFollowup?: RestaurantStoreManagerFollowupPack;
    storeManagerTaskQueue?: RestaurantStoreManagerTaskQueue;
    storeManagerTaskWatcher?: RestaurantStoreManagerTaskWatcher;
    staffNotificationHandoff?: RestaurantStaffNotificationHandoff;
    staffNotificationDeliveryBridge?: RestaurantStaffNotificationDeliveryBridge;
    staffNotificationAuditLog?: RestaurantStaffNotificationAuditLog;
    taskProviderHandoff?: RestaurantTaskProviderHandoff;
    trialWorkflowPack?: RestaurantTrialWorkflowPack;
  }>({ status: 'idle' });
  const [restaurantCommand, setRestaurantCommand] = useState(`今晚把 ${runtimeIntake.offer} 做成大众点评和小红书可发布版本，发完要截图回执，收盘后看核销和库存异常。`);
  const [selectedClawWorkbenchPreset, setSelectedClawWorkbenchPreset] = useState(clawWorkbenchPresets[0]);
  const browserConnector = runtime.connectors.find(item => item.id === 'local-browser-plan');
  const memoryConnector = runtime.connectors.find(item => item.id === 'restaurant-memory');
  const queueConnector = runtime.connectors.find(item => item.id === 'agent-task-queue');
  const lobuConnector = runtime.connectors.find(item => item.id === 'lobu-local-runtime');
  const ledgerConnector = runtime.connectors.find(item => item.id === 'local-persistent-ledger');
  const callbackConnector = runtime.connectors.find(item => item.id === 'signed-runtime-callback');
  const recoveryConnector = runtime.connectors.find(item => item.id === 'recovery-orchestrator');
  const browserSessionConnector = runtime.connectors.find(item => item.id === 'browser-session-manifest');
  const browserRunbookConnector = runtime.connectors.find(item => item.id === 'browser-runbook-package');
  const browserRunnerContractConnector = runtime.connectors.find(item => item.id === 'browser-runner-callback-contract');
  const browserRunnerEventConnector = runtime.connectors.find(item => item.id === 'browser-runner-event-ledger');
  const grantConnector = runtime.connectors.find(item => item.id === 'merchant-grant-manifest');
  const grantChecklistConnector = runtime.connectors.find(item => item.id === 'merchant-grant-checklist');
  const activationGatesConnector = runtime.connectors.find(item => item.id === 'restaurant-activation-gates');
  const competitorAuditConnector = runtime.connectors.find(item => item.id === 'competitor-capability-audit');
  const buildQueueConnector = runtime.connectors.find(item => item.id === 'agent-build-queue');
  const executionPackageConnector = runtime.connectors.find(item => item.id === 'external-execution-package');
  const callbackSimulatorConnector = runtime.connectors.find(item => item.id === 'signed-callback-simulator');
  const runHealthConnector = runtime.connectors.find(item => item.id === 'run-health-console');
  const runtimeProbeConnector = runtime.connectors.find(item => item.id === 'runtime-connector-probe');
  const runtimeSetupConnector = runtime.connectors.find(item => item.id === 'runtime-setup-contract');
  const posImportConnector = runtime.connectors.find(item => item.id === 'pos-import-schema-validator');
  const publicProfileConnector = runtime.connectors.find(item => item.id === 'public-profile-intake');
  const opsConsoleConnector = runtime.connectors.find(item => item.id === 'agent-ops-console');
  const externalConnectors = runtime.connectors.filter(item => !item.canRunNow);

  const queueLocalTask = async () => {
    setDispatchState({ status: 'loading', message: '正在生成 Lobu 兼容任务...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: 'browser-publish-check',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          owner: '运营',
          runtimeTarget: 'local',
          source: 'friend_trial_runtime_panel',
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload?.dispatch) {
        setDispatchState({ status: 'blocked', message: payload?.message || '任务被拦截，缺少运行条件。' });
        return;
      }
      setDispatchState({
        status: payload.dispatch.status,
        eventId: payload.dispatch.eventId,
        tenantId: payload.dispatch.tenantId,
        message: payload.dispatch.nextAttachStep,
        latestRuns: payload.run ? [payload.run] : undefined,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '本地 runtime API 暂不可用。' });
    }
  };

  const buildTrialWorkflowPack = async () => {
    setDispatchState({ status: 'loading', message: 'Building restaurant trial workflow pack...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'trial-workflow-pack',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
          moduleIds: selectedClawWorkbenchPreset.moduleIds,
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.trialWorkflowPack?.summary?.externalGatedSteps ? 'blocked' : 'queued',
        eventId: payload?.trialWorkflowPack?.workOrder?.eventId,
        tenantId: payload?.trialWorkflowPack?.workOrder?.tenantId,
        message: `Trial workflow pack built: ${payload?.trialWorkflowPack?.summary?.steps ?? 0} steps, ${payload?.trialWorkflowPack?.summary?.readySteps ?? 0} ready, ${payload?.trialWorkflowPack?.summary?.externalGatedSteps ?? 0} external-gated.`,
        trialWorkflowPack: payload?.trialWorkflowPack,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Trial workflow pack is temporarily unavailable.' });
    }
  };

  const buildClawExperienceDefaultPath = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building default Claw-style customer path...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'claw-experience-default-path',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.clawExperienceDefaultPath?.summary?.providerGated ? 'blocked' : 'queued',
        message: `Default Path: ${payload?.clawExperienceDefaultPath?.summary?.readyNow ?? 0} ready, ${payload?.clawExperienceDefaultPath?.summary?.trainingNeeded ?? 0} training, ${payload?.clawExperienceDefaultPath?.summary?.providerGated ?? 0} provider/boundary gates.`,
        clawExperienceDefaultPath: payload?.clawExperienceDefaultPath || previous.clawExperienceDefaultPath,
        clawSkillWorkbench: payload?.clawSkillWorkbench || previous.clawSkillWorkbench,
        clawSkillExecutionRecord: payload?.clawSkillExecutionRecord || previous.clawSkillExecutionRecord,
        clawSkillExecutionLedger: payload?.clawSkillExecutionLedger || previous.clawSkillExecutionLedger,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
        storeManagerTaskWatcher: payload?.storeManagerTaskWatcher || previous.storeManagerTaskWatcher,
        staffNotificationHandoff: payload?.staffNotificationHandoff || previous.staffNotificationHandoff,
        staffNotificationDeliveryBridge: payload?.staffNotificationDeliveryBridge || previous.staffNotificationDeliveryBridge,
        taskProviderHandoff: payload?.taskProviderHandoff || previous.taskProviderHandoff,
        providerSetupPack: payload?.providerSetupPack || previous.providerSetupPack,
        externalUnlockRequestPack: payload?.externalUnlockRequestPack || previous.externalUnlockRequestPack,
        controlledTrialRun: payload?.controlledTrialRun || previous.controlledTrialRun,
        runHealth: payload?.controlledTrialRun?.runHealth || previous.runHealth,
        businessSignals: payload?.businessSignals || payload?.controlledTrialRun?.businessSignals || previous.businessSignals,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        browserGatewayPack: payload?.browserGatewayPack || previous.browserGatewayPack,
        runtimeRunnerLoopPack: payload?.runtimeRunnerLoopPack || previous.runtimeRunnerLoopPack,
        recovery: payload?.recovery || previous.recovery,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        providerSetupWizard: payload?.providerSetupWizard || previous.providerSetupWizard,
        providerUnlockLadder: payload?.providerUnlockLadder || previous.providerUnlockLadder,
        providerLaunchBoard: payload?.providerLaunchBoard || previous.providerLaunchBoard,
        platformConnectorMatrix: payload?.platformConnectorMatrix || previous.platformConnectorMatrix,
        aiConsultantCopilot: payload?.aiConsultantCopilot || previous.aiConsultantCopilot,
        dayZeroMissionPack: payload?.dayZeroMissionPack || previous.dayZeroMissionPack,
        storeOperatingPlan: payload?.storeOperatingPlan || previous.storeOperatingPlan,
        aiCockpit: payload?.aiCockpit || previous.aiCockpit,
        customerDemandGateway: payload?.customerDemandGateway || previous.customerDemandGateway,
        leadCaptureInbox: payload?.leadCaptureInbox || previous.leadCaptureInbox,
        publishExecutionInbox: payload?.publishExecutionInbox || previous.publishExecutionInbox,
        voiceOrderConsole: payload?.voiceOrderConsole || previous.voiceOrderConsole,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        posImport: payload?.posImport || previous.posImport,
        operatingDataContract: payload?.operatingDataContract || previous.operatingDataContract,
        operatingInsightReport: payload?.operatingInsightReport || previous.operatingInsightReport,
        providerReceiptInbox: payload?.providerReceiptInbox || previous.providerReceiptInbox,
        postRunReviewPack: payload?.postRunReviewPack || previous.postRunReviewPack,
        channelHub: payload?.channelHub || previous.channelHub,
        channelDeliveryReport: payload?.channelDeliveryReport || previous.channelDeliveryReport,
        nextLoopChannelPlan: payload?.nextLoopChannelPlan || previous.nextLoopChannelPlan,
        publicIntelligenceBrief: payload?.publicIntelligenceBrief || previous.publicIntelligenceBrief,
        reputationCloseoutPack: payload?.reputationCloseoutPack || previous.reputationCloseoutPack,
        runtimeProbe: payload?.runtimeProbe || previous.runtimeProbe,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Default Claw-style path is temporarily unavailable.' }));
    }
  };

  const checkLobuBridge = async () => {
    setDispatchState({ status: 'loading', message: '正在检查 Lobu 外部 bridge...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: 'browser-publish-check',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          owner: '运营',
          runtimeTarget: 'lobu',
          source: 'friend_trial_lobu_bridge_check',
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.bridge?.status === 'forwarded' ? 'queued' : 'blocked',
        eventId: payload?.dispatch?.eventId,
        tenantId: payload?.dispatch?.tenantId,
        message: payload?.bridge?.message || payload?.dispatch?.nextAttachStep || 'Lobu bridge 未配置。',
        latestRuns: payload?.run ? [payload.run] : undefined,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Lobu bridge 检查失败。' });
    }
  };

  const runHeartbeat = async () => {
    setDispatchState({ status: 'loading', message: '正在运行 Heartbeat Watcher...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'heartbeat' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.heartbeat?.taskWakeups || payload?.heartbeat?.shiftAutopilotRuns ? 'blocked' : 'queued',
        message: `Heartbeat 已检查 ${payload?.heartbeat?.watchedRuns ?? 0} 条运行记录。`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        heartbeat: payload?.heartbeat,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue,
        storeManagerTaskWatcher: payload?.heartbeat?.storeManagerTaskWatcher,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Heartbeat Watcher 暂不可用。' });
    }
  };

  const refreshReadiness = async () => {
    setDispatchState({ status: 'loading', message: '正在检查外部接入条件...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'readiness' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.readiness?.summary?.blocked ? 'blocked' : 'queued',
        message: payload?.readiness?.summary?.blocked
          ? `还有 ${payload.readiness.summary.blocked} 组外部条件未满足。`
          : '外部接入条件已满足，可进入受控执行。',
        readiness: payload?.readiness,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '外部接入检查暂不可用。' });
    }
  };

  const importSampleReceipt = async () => {
    setDispatchState({ status: 'loading', message: '正在导入一条样例执行回执...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'receipt',
          eventId: dispatchState.eventId || 'restaurant-agent-sample-proof',
          channel: '大众点评',
          evidenceUrl: 'https://example.com/restaurant-proof',
          operator: '运营',
          summary: '样例：已导入发布链接和截图编号，等待真实商家回执替换。',
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.receipt?.status === 'accepted' ? 'queued' : 'blocked',
        eventId: payload?.receipt?.eventId,
        message: payload?.receipt?.status === 'accepted'
          ? '回执已进入 watcher，可触发门店记忆和下一步跟进。'
          : payload?.receipt?.rejectedReason || '回执缺少证据字段。',
        receipts: payload?.receipts,
        heartbeat: payload?.heartbeat,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '回执导入暂不可用。' });
    }
  };

  const buildRecoveryPlan = async () => {
    setDispatchState({ status: 'loading', message: '正在生成失败恢复计划...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recovery' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: 'queued',
        message: `已生成 ${payload?.recovery?.actions?.length ?? 0} 条恢复动作。`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        readiness: payload?.readiness,
        recovery: payload?.recovery,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '失败恢复计划暂不可用。' });
    }
  };

  const buildBrowserSession = async () => {
    setDispatchState({ status: 'loading', message: '正在生成隔离浏览器 session manifest...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'browser-session',
          runtimeTarget: 'openclaw',
          eventId: dispatchState.eventId,
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          channel: runtimeIntake.channels,
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.browserSession?.canExecuteNow ? 'queued' : 'blocked',
        eventId: payload?.browserSession?.task?.eventId,
        message: payload?.browserSession?.handoff?.nextStep || '浏览器 session manifest 生成失败。',
        browserSession: payload?.browserSession,
        browserSessionHealth: payload?.browserSessionHealth,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '浏览器 session manifest 暂不可用。' });
    }
  };

  const buildGrantManifest = async () => {
    setDispatchState({ status: 'loading', message: '正在生成商家授权与工具 grant manifest...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grant-manifest',
          restaurant: runtimeIntake.restaurant,
          operator: '运营负责人',
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.grantManifest?.merchant?.grantStatus === 'active' ? 'queued' : 'blocked',
        message: payload?.grantManifest?.nextStep || '授权 manifest 生成失败。',
        grantManifest: payload?.grantManifest,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '商家授权 manifest 暂不可用。' });
    }
  };

  const buildGrantChecklist = async () => {
    setDispatchState({ status: 'loading', message: '正在生成 Grant Checklist Wizard...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'grant-checklist',
          restaurant: runtimeIntake.restaurant,
          operator: '运营负责人',
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.grantChecklist?.blockedCapabilities?.length ? 'blocked' : 'queued',
        message: payload?.grantChecklist?.nextStep || 'Grant checklist 生成失败。',
        grantChecklist: payload?.grantChecklist,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Grant Checklist Wizard 暂不可用。' });
    }
  };

  const inspectActivationGates = async () => {
    setDispatchState({ status: 'loading', message: '正在检查餐饮经营能力激活门禁...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'activation-gates',
          restaurant: runtimeIntake.restaurant,
          operator: '运营负责人',
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.activationGates?.summary?.blocked ? 'blocked' : 'queued',
        message: payload?.activationGates?.answerToCustomer || '经营能力激活门禁生成失败。',
        activationGates: payload?.activationGates,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '经营能力激活门禁暂不可用。' });
    }
  };

  const inspectCompetitorAudit = async () => {
    setDispatchState({ status: 'loading', message: '正在生成公开竞品能力审计...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'competitor-audit' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.competitorAudit?.summary?.externalRequired ? 'blocked' : 'queued',
        message: `竞品审计已覆盖 ${payload?.competitorAudit?.summary?.total ?? 0} 个能力维度；external-required ${payload?.competitorAudit?.summary?.externalRequired ?? 0} 个。`,
        competitorAudit: payload?.competitorAudit,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '公开竞品能力审计暂不可用。' });
    }
  };

  const buildCompetitorTrainingBlueprint = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building competitor-grade training blueprint...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'competitor-training-blueprint',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.competitorTrainingBlueprint?.summary?.providerContracts ? 'blocked' : 'queued',
        message: `Training Blueprint: ${payload?.competitorTrainingBlueprint?.summary?.trainableNow ?? 0} internal items, ${payload?.competitorTrainingBlueprint?.summary?.providerContracts ?? 0} provider contracts, parity claim ${payload?.competitorTrainingBlueprint?.summary?.canClaimCompetitorParity ? 'allowed' : 'blocked'}.`,
        competitorTrainingBlueprint: payload?.competitorTrainingBlueprint || previous.competitorTrainingBlueprint,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Competitor Training Blueprint is temporarily unavailable.' }));
    }
  };

  const buildCompetitorRouteDecision = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building competitor route decision...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'competitor-route-decision',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.competitorRouteDecision?.summary?.externalRequired ? 'blocked' : 'queued',
        message: `Route Decision: ${payload?.competitorRouteDecision?.finalTarget || 'unknown'}, ${payload?.competitorRouteDecision?.summary?.internalCanShipNow ?? 0} internal abilities, ${payload?.competitorRouteDecision?.summary?.externalRequired ?? 0} external gates.`,
        competitorRouteDecision: payload?.competitorRouteDecision || previous.competitorRouteDecision,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Competitor Route Decision is temporarily unavailable.' }));
    }
  };

  const inspectBuildQueue = async () => {
    setDispatchState({ status: 'loading', message: '正在生成 Agent 构建队列...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'build-queue' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.buildQueue?.summary?.waitingExternal ? 'blocked' : 'queued',
        message: `Agent 构建队列已生成 ${payload?.buildQueue?.summary?.total ?? 0} 项；ready-to-build ${payload?.buildQueue?.summary?.readyToBuild ?? 0} 项。`,
        buildQueue: payload?.buildQueue,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Agent 构建队列暂不可用。' });
    }
  };

  const buildExecutionPackage = async () => {
    setDispatchState({ status: 'loading', message: '正在生成外部执行投递包...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execution-package',
          runtimeTarget: 'openclaw',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          owner: '运营负责人',
          requestedAction: 'capture_public_receipt',
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.executionPackage?.canForward ? 'queued' : 'blocked',
        eventId: payload?.executionPackage?.dispatch?.eventId,
        tenantId: payload?.executionPackage?.dispatch?.tenantId,
        message: payload?.executionPackage?.nextStep || '外部执行投递包生成失败。',
        executionPackage: payload?.executionPackage,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '外部执行投递包暂不可用。' });
    }
  };

  const runCallbackSimulator = async () => {
    setDispatchState({ status: 'loading', message: 'Running local signed callback simulator...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'callback-simulator',
          runtimeTarget: 'openclaw',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          owner: '运营负责人',
          signalType: 'reservation',
          reservationCount: 6,
          couponClaimCount: 18,
          visitIntentCount: 9,
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.callbackSimulation?.receipt?.status === 'accepted' ? 'queued' : 'blocked',
        eventId: payload?.callbackSimulation?.run?.eventId,
        tenantId: payload?.callbackSimulation?.run?.tenantId,
        message: `Callback simulator ${payload?.callbackSimulation?.callback?.signatureVerified ? 'verified signature' : 'failed signature'}; receipt ${payload?.callbackSimulation?.receipt?.status || 'missing'}.`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        callbackSimulation: payload?.callbackSimulation,
        heartbeat: payload?.callbackSimulation?.heartbeat,
        runHealth: payload?.callbackSimulation?.runHealth,
        businessSignals: payload?.callbackSimulation?.businessSignals,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Callback simulator is temporarily unavailable.' });
    }
  };

  const inspectRunHealth = async () => {
    setDispatchState({ status: 'loading', message: '正在检查 run health 与回执验收状态...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run-health' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.runHealth?.summary?.blockedAuth || payload?.runHealth?.summary?.failed ? 'blocked' : 'queued',
        message: `Run health 已检查 ${payload?.runHealth?.summary?.totalRuns ?? 0} 条运行记录，等待回执 ${payload?.runHealth?.summary?.waitingReceipt ?? 0} 条。`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        readiness: payload?.readiness,
        runHealth: payload?.runHealth,
        providerReceiptInbox: payload?.providerReceiptInbox,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Run health 检查暂不可用。' });
    }
  };

  const inspectProviderReceiptInbox = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building provider receipt inbox...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'provider-receipt-inbox' }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.providerReceiptInbox?.summary?.actionRequired ? 'blocked' : 'queued',
        message: `Provider receipt inbox: ${payload?.providerReceiptInbox?.summary?.total ?? 0} requests, ${payload?.providerReceiptInbox?.summary?.actionRequired ?? 0} action required.`,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        readiness: payload?.readiness || previous.readiness,
        runHealth: payload?.runHealth || previous.runHealth,
        recovery: payload?.recovery || previous.recovery,
        providerReceiptInbox: payload?.providerReceiptInbox || previous.providerReceiptInbox,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Provider receipt inbox is temporarily unavailable.' }));
    }
  };

  const inspectProviderSandboxContract = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building provider sandbox acceptance contract...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'provider-sandbox-contract', runtimeTarget: 'openclaw' }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.providerSandboxContract?.summary?.canClaimAutomation ? 'queued' : 'blocked',
        message: `Provider sandbox contract: ${payload?.providerSandboxContract?.summary?.passed ?? 0}/${payload?.providerSandboxContract?.summary?.checks ?? 0} passed, verdict ${payload?.providerSandboxContract?.verdict || 'unknown'}.`,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        runtimeProbe: payload?.runtimeProbe || previous.runtimeProbe,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        taskProviderHandoff: payload?.taskProviderHandoff || previous.taskProviderHandoff,
        providerReceiptInbox: payload?.providerReceiptInbox || previous.providerReceiptInbox,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        providerSandboxContract: payload?.providerSandboxContract || previous.providerSandboxContract,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Provider sandbox contract is temporarily unavailable.' }));
    }
  };

  const buildFirstForwardableRunPack = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building first forwardable run preflight...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'first-forwardable-run-pack', runtimeTarget: 'openclaw' }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.firstForwardableRunPack?.summary?.canForwardFirstRun ? 'queued' : 'blocked',
        message: `First forwardable run: ${payload?.firstForwardableRunPack?.verdict || 'unknown'}; ${payload?.firstForwardableRunPack?.summary?.passedStages ?? 0}/${payload?.firstForwardableRunPack?.stages?.length ?? 0} stages passed.`,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        runtimeProbe: payload?.runtimeProbe || previous.runtimeProbe,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        providerReceiptInbox: payload?.providerReceiptInbox || previous.providerReceiptInbox,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        firstForwardableRunPack: payload?.firstForwardableRunPack || previous.firstForwardableRunPack,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'First forwardable run preflight is temporarily unavailable.' }));
    }
  };

  const buildFirstRunControlTower = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building first run control tower...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'first-run-control-tower', runtimeTarget: 'openclaw' }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.firstRunControlTower?.summary?.blockedLanes ? 'blocked' : 'queued',
        message: `First run control tower: ${payload?.firstRunControlTower?.verdict || 'unknown'}; ${payload?.firstRunControlTower?.summary?.blockedLanes ?? 0} blocked lanes.`,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        runtimeProbe: payload?.runtimeProbe || previous.runtimeProbe,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        providerReceiptInbox: payload?.providerReceiptInbox || previous.providerReceiptInbox,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        firstRunControlTower: payload?.firstRunControlTower || previous.firstRunControlTower,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'First run control tower is temporarily unavailable.' }));
    }
  };

  const buildProviderLaunchTrainingPack = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building provider launch training pack...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'provider-launch-training-pack',
          runtimeTarget: 'openclaw',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.providerLaunchTrainingPack?.verdict === 'ready-to-pilot' ? 'queued' : 'blocked',
        message: `Provider launch training pack: ${payload?.providerLaunchTrainingPack?.summary?.ready ?? 0}/${payload?.providerLaunchTrainingPack?.summary?.tracks ?? 0} tracks ready, verdict ${payload?.providerLaunchTrainingPack?.verdict || 'unknown'}.`,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        providerSetupPack: payload?.providerSetupPack || previous.providerSetupPack,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        runtimeProbe: payload?.runtimeProbe || previous.runtimeProbe,
        providerSandboxContract: payload?.providerSandboxContract || previous.providerSandboxContract,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        providerLaunchTrainingPack: payload?.providerLaunchTrainingPack || previous.providerLaunchTrainingPack,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Provider launch training pack is temporarily unavailable.' }));
    }
  };

  const inspectPlatformConnectorMatrix = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building restaurant platform connector matrix...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'platform-connector-matrix' }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.platformConnectorMatrix?.summary?.blocked ? 'blocked' : 'queued',
        message: `Platform connector matrix: ${payload?.platformConnectorMatrix?.summary?.internalReady ?? 0} internal, ${payload?.platformConnectorMatrix?.summary?.blocked ?? 0} blocked, ${payload?.platformConnectorMatrix?.summary?.configuredEnvKeys ?? 0}/${payload?.platformConnectorMatrix?.summary?.totalEnvKeys ?? 0} env keys configured.`,
        platformConnectorMatrix: payload?.platformConnectorMatrix || previous.platformConnectorMatrix,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Platform connector matrix is temporarily unavailable.' }));
    }
  };

  const inspectAiOsAuditReport = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building restaurant AI OS audit report...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ai-os-audit-report',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.aiOsAuditReport?.summary?.providerRequired || payload?.aiOsAuditReport?.summary?.blocked ? 'blocked' : 'queued',
        message: `AI OS audit: ${payload?.aiOsAuditReport?.summary?.usableNow ?? 0} usable now, ${payload?.aiOsAuditReport?.summary?.manualReady ?? 0} manual-ready, ${payload?.aiOsAuditReport?.summary?.providerRequired ?? 0} provider-required.`,
        aiOsAuditReport: payload?.aiOsAuditReport || previous.aiOsAuditReport,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Restaurant AI OS audit report is temporarily unavailable.' }));
    }
  };

  const inspectRuntimeProbe = async () => {
    setDispatchState({ status: 'loading', message: '正在探测外部 runtime health 与接入门禁...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'runtime-probe' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.runtimeProbe?.summary?.ready ? 'queued' : 'blocked',
        message: `Runtime probe 已探测 ${payload?.runtimeProbe?.summary?.probed ?? 0} 个 runtime，ready ${payload?.runtimeProbe?.summary?.ready ?? 0} 个。`,
        runtimeProbe: payload?.runtimeProbe,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Runtime probe 暂不可用。' });
    }
  };

  const inspectProviderReadinessHealth = async () => {
    setDispatchState({ status: 'loading', message: 'Checking provider readiness health against remembered setup state...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'provider-readiness-health' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.providerReadinessHealth?.summary?.canEnableExternalAutomation ? 'queued' : 'blocked',
        message: `Provider health checked: ${payload?.providerReadinessHealth?.summary?.healthReady ?? 0}/${payload?.providerReadinessHealth?.summary?.items ?? 0} ready, ${payload?.providerReadinessHealth?.summary?.rememberedNotProbed ?? 0} remembered but not probed.`,
        providerReadinessHealth: payload?.providerReadinessHealth,
        providerSetupState: payload?.providerSetupState,
        providerUnlockLadder: payload?.providerUnlockLadder,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Provider readiness health is temporarily unavailable.' });
    }
  };

  const inspectRuntimeSetupContract = async () => {
    setDispatchState({ status: 'loading', message: 'Building runtime setup contract...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'runtime-setup-contract' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.runtimeSetupContract?.summary?.missingRequirements ? 'blocked' : 'queued',
        message: `Runtime setup contract checked ${payload?.runtimeSetupContract?.summary?.tracks ?? 0} tracks; missing ${payload?.runtimeSetupContract?.summary?.missingRequirements ?? 0} gates.`,
        runtimeSetupContract: payload?.runtimeSetupContract,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Runtime setup contract is temporarily unavailable.' });
    }
  };

  const inspectRuntimeAdapterContract = async () => {
    setDispatchState({ status: 'loading', message: 'Building runtime adapter contract for Lobu/OpenClaw/Hermes...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'runtime-adapter-contract',
          runtimeTarget: 'openclaw',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          owner: 'store-manager',
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.runtimeAdapterContract?.summary?.canSubmitSandbox ? 'queued' : 'blocked',
        message: `Runtime adapter contract: ${payload?.runtimeAdapterContract?.verdict || 'unknown'}; ready ${payload?.runtimeAdapterContract?.summary?.ready ?? 0}/${payload?.runtimeAdapterContract?.summary?.checks ?? 0}.`,
        runtimeAdapterContract: payload?.runtimeAdapterContract || previous.runtimeAdapterContract,
        executionPackage: payload?.executionPackage || previous.executionPackage,
        runtimeProbe: payload?.runtimeProbe || previous.runtimeProbe,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Runtime adapter contract is temporarily unavailable.' }));
    }
  };

  const inspectRuntimeRunnerLoopPack = async () => {
    setDispatchState({ status: 'loading', message: 'Building runtime runner loop pack...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'runtime-runner-loop-pack' }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.runtimeRunnerLoopPack?.summary?.recoveryActions ? 'blocked' : 'queued',
        message: `Runner loop pack: ${payload?.runtimeRunnerLoopPack?.verdict || 'unknown'}; runner events ${payload?.runtimeRunnerLoopPack?.summary?.runnerEvents ?? 0}, waiting receipts ${payload?.runtimeRunnerLoopPack?.summary?.waitingReceipts ?? 0}.`,
        runtimeRunnerLoopPack: payload?.runtimeRunnerLoopPack || previous.runtimeRunnerLoopPack,
        receipts: payload?.receipts || previous.receipts,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Runtime runner loop pack is temporarily unavailable.' }));
    }
  };

  const buildProviderSetupPack = async () => {
    setDispatchState({ status: 'loading', message: 'Building provider setup pack for this restaurant...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'provider-setup-pack',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.providerSetupPack?.summary?.missing ? 'blocked' : 'queued',
        message: `Provider setup pack built: ${payload?.providerSetupPack?.summary?.missing ?? 0} missing gates, ${payload?.providerSetupPack?.summary?.blockedCapabilities ?? 0} blocked capabilities.`,
        providerSetupPack: payload?.providerSetupPack,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Provider setup pack is temporarily unavailable.' });
    }
  };

  const buildExternalUnlockRequestPack = async () => {
    setDispatchState({ status: 'loading', message: 'Building external unlock request pack for provider keys, merchant grants and POS contracts...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'external-unlock-request-pack',
          sampleId: 'osm-node-600243400',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.externalUnlockRequestPack?.summary?.canClaimExternalAutomation ? 'queued' : 'blocked',
        message: `External unlock request pack built: ${payload?.externalUnlockRequestPack?.summary?.p0 ?? 0} P0 items, ${payload?.externalUnlockRequestPack?.summary?.providerKeys ?? 0} provider keys, ${payload?.externalUnlockRequestPack?.summary?.merchantAuthorizations ?? 0} merchant grants.`,
        externalUnlockRequestPack: payload?.externalUnlockRequestPack || previous.externalUnlockRequestPack,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'External unlock request pack is temporarily unavailable.' }));
    }
  };

  const buildProviderSetupWizard = async () => {
    setDispatchState({ status: 'loading', message: 'Building customer setup wizard for provider keys, grants and data contracts...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'provider-setup-wizard',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.providerSetupWizard?.summary?.missing ? 'blocked' : 'queued',
        message: `Provider setup wizard built: ${payload?.providerSetupWizard?.summary?.configured ?? 0}/${payload?.providerSetupWizard?.summary?.fields ?? 0} fields configured; external automation ${payload?.providerSetupWizard?.summary?.canEnableExternalAutomation ? 'ready' : 'blocked'}.`,
        providerSetupWizard: payload?.providerSetupWizard,
        providerSetupState: payload?.providerSetupState,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Provider setup wizard is temporarily unavailable.' });
    }
  };

  const recordProviderSetupState = async () => {
    setDispatchState({ status: 'loading', message: 'Saving sanitized provider setup state into the restaurant setup ledger...' });
    try {
      const unlockPack = dispatchState.externalUnlockRequestPack;
      const configuredEnvKeys = unlockPack?.setupStateProjection.configuredEnvKeys.length
        ? unlockPack.setupStateProjection.configuredEnvKeys
        : ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', 'RESTAURANT_AGENT_CALLBACK_SECRET'];
      const merchantApprovals = unlockPack?.setupStateProjection.merchantApprovals.length
        ? unlockPack.setupStateProjection.merchantApprovals
        : ['merchant-platform-authorization:merchant-platform-login'];
      const dataContracts = unlockPack?.setupStateProjection.dataContracts.length
        ? unlockPack.setupStateProjection.dataContracts
        : ['pos-coupon-and-redemption-data-contract:pos-field-dictionary'];
      const notes = unlockPack
        ? unlockPack.setupStateProjection.notes
        : ['Demo setup state records identifiers only; secret values stay server-side.'];
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'provider-setup-state-record',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          configuredEnvKeys,
          merchantApprovals,
          dataContracts,
          notes,
          submittedBy: 'ops',
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: 'queued',
        message: `Provider setup state saved: ${payload?.providerSetupState?.summary?.configuredEnvKeys ?? 0} env keys, ${payload?.providerSetupState?.summary?.merchantApprovals ?? 0} merchant approvals, ${payload?.providerSetupState?.summary?.dataContracts ?? 0} data contracts remembered.`,
        providerSetupState: payload?.providerSetupState,
        providerSetupWizard: payload?.providerSetupWizard,
        providerReadinessHealth: payload?.providerReadinessHealth,
        providerUnlockLadder: payload?.providerUnlockLadder,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Provider setup state save is temporarily unavailable.' });
    }
  };

  const buildExternalExecutionWizard = async () => {
    setDispatchState({ status: 'loading', message: 'Building external execution wizard...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'external-execution-wizard',
          runtimeTarget: 'openclaw',
          requestedAction: 'capture_public_receipt',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          owner: '运营负责人',
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.externalExecutionWizard?.canForward ? 'queued' : 'blocked',
        message: `External execution wizard: ${payload?.externalExecutionWizard?.verdict || 'unknown'}; ${payload?.externalExecutionWizard?.summary?.blockedSteps ?? 0} blocked steps.`,
        externalExecutionWizard: payload?.externalExecutionWizard,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'External execution wizard is temporarily unavailable.' });
    }
  };

  const runControlledTrialRun = async () => {
    setDispatchState({ status: 'loading', message: 'Running controlled local trial with signed callback...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'controlled-trial-run',
          runtimeTarget: 'openclaw',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          owner: '运营负责人',
          signalType: 'visit-intent',
          reservationCount: 3,
          couponClaimCount: 9,
          visitIntentCount: 6,
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.controlledTrialRun?.simulation?.receipt?.status === 'accepted' ? 'queued' : 'blocked',
        eventId: payload?.controlledTrialRun?.simulation?.run?.eventId,
        tenantId: payload?.controlledTrialRun?.simulation?.run?.tenantId,
        message: `Controlled trial run ${payload?.controlledTrialRun?.verdict || 'unknown'}; receipt ${payload?.controlledTrialRun?.simulation?.receipt?.status || 'missing'}.`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        controlledTrialRun: payload?.controlledTrialRun,
        runHealth: payload?.controlledTrialRun?.runHealth,
        businessSignals: payload?.controlledTrialRun?.businessSignals,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Controlled trial run is temporarily unavailable.' });
    }
  };

  const inspectToolPolicy = async () => {
    setDispatchState({ status: 'loading', message: '正在评估工具权限、Secret Proxy 和外部执行门禁...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'tool-policy',
          runtimeTarget: 'openclaw',
          browserRuntimeTarget: 'openclaw',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.toolPolicy?.summary?.externalReady ? 'queued' : 'blocked',
        message: `工具权限已评估 ${payload?.toolPolicy?.summary?.total ?? 0} 个动作；external-ready ${payload?.toolPolicy?.summary?.externalReady ?? 0} 个。`,
        toolPolicy: payload?.toolPolicy,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '工具权限评估暂不可用。' });
    }
  };

  const inspectBusinessSignals = async () => {
    setDispatchState({ status: 'loading', message: '正在汇总预约、领券、核销和到店意向信号...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'business-signals' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: 'queued',
        message: `经营信号已汇总 ${payload?.businessSignals?.summary?.acceptedReceipts ?? 0} 条验收回执；POS/平台授权未接入前只做脱敏聚合。`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        businessSignals: payload?.businessSignals,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '经营信号汇总暂不可用。' });
    }
  };

  const buildStoreManagerFollowup = async () => {
    setDispatchState({ status: 'loading', message: '正在生成店长跟进任务、话术和证据要求...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'store-manager-followup',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.storeManagerFollowup?.summary?.blocked ? 'blocked' : 'queued',
        message: `店长跟进已生成 ${payload?.storeManagerFollowup?.summary?.tasks ?? 0} 个任务；今日 ${payload?.storeManagerFollowup?.summary?.today ?? 0} 个，阻断 ${payload?.storeManagerFollowup?.summary?.blocked ?? 0} 个。`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        commandCenter: payload?.commandCenter,
        aiEmployeeInbox: payload?.commandCenter?.aiEmployeeInbox,
        storeManagerFollowup: payload?.storeManagerFollowup,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || payload?.commandCenter?.storeManagerTaskQueue,
        storeManagerTaskWatcher: payload?.storeManagerTaskWatcher || payload?.commandCenter?.storeManagerTaskWatcher,
        staffNotificationHandoff: payload?.staffNotificationHandoff || payload?.commandCenter?.staffNotificationHandoff,
        staffNotificationDeliveryBridge: payload?.staffNotificationDeliveryBridge || payload?.commandCenter?.staffNotificationDeliveryBridge,
        staffNotificationAuditLog: payload?.staffNotificationAuditLog || payload?.commandCenter?.staffNotificationAuditLog,
        taskProviderHandoff: payload?.taskProviderHandoff || payload?.commandCenter?.taskProviderHandoff,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '店长跟进任务暂不可用。' });
    }
  };

  const updateStoreManagerTask = async (
    taskMemoryId: string,
    taskStatus: 'needs-evidence' | 'ready-for-provider' | 'blocked' | 'done',
    auditNote: string,
  ) => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: `Updating store-manager task to ${taskStatus}...` }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'store-manager-task-status',
          taskMemoryId,
          status: taskStatus,
          auditNote,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: response.ok ? 'queued' : 'blocked',
        message: response.ok ? `Store-manager task moved to ${taskStatus}.` : 'Task status update failed; refresh the task queue and try again.',
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
        storeManagerTaskWatcher: payload?.storeManagerTaskWatcher || previous.storeManagerTaskWatcher,
        staffNotificationHandoff: payload?.staffNotificationHandoff || previous.staffNotificationHandoff,
        staffNotificationDeliveryBridge: payload?.staffNotificationDeliveryBridge || previous.staffNotificationDeliveryBridge,
        staffNotificationAuditLog: payload?.staffNotificationAuditLog || previous.staffNotificationAuditLog,
        taskProviderHandoff: payload?.taskProviderHandoff || previous.taskProviderHandoff,
        commandCenter: previous.commandCenter
          ? {
              ...previous.commandCenter,
              storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.commandCenter.storeManagerTaskQueue,
              storeManagerTaskWatcher: payload?.storeManagerTaskWatcher || previous.commandCenter.storeManagerTaskWatcher,
              staffNotificationHandoff: payload?.staffNotificationHandoff || previous.commandCenter.staffNotificationHandoff,
              staffNotificationDeliveryBridge: payload?.staffNotificationDeliveryBridge || previous.commandCenter.staffNotificationDeliveryBridge,
              staffNotificationAuditLog: payload?.staffNotificationAuditLog || previous.commandCenter.staffNotificationAuditLog,
              taskProviderHandoff: payload?.taskProviderHandoff || previous.commandCenter.taskProviderHandoff,
            }
          : previous.commandCenter,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Store-manager task status update is temporarily unavailable.' }));
    }
  };

  const buildStaffNotificationHandoff = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building staff notification handoff...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'staff-notification-handoff',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: response.ok ? 'queued' : 'blocked',
        message: response.ok ? 'Staff notification handoff drafted.' : 'Staff notification handoff unavailable.',
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
        storeManagerTaskWatcher: payload?.storeManagerTaskWatcher || previous.storeManagerTaskWatcher,
        staffNotificationHandoff: payload?.staffNotificationHandoff || previous.staffNotificationHandoff,
        staffNotificationDeliveryBridge: payload?.staffNotificationDeliveryBridge || previous.staffNotificationDeliveryBridge,
        staffNotificationAuditLog: payload?.staffNotificationAuditLog || previous.staffNotificationAuditLog,
        taskProviderHandoff: payload?.taskProviderHandoff || previous.taskProviderHandoff,
        commandCenter: previous.commandCenter
          ? {
              ...previous.commandCenter,
              storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.commandCenter.storeManagerTaskQueue,
              storeManagerTaskWatcher: payload?.storeManagerTaskWatcher || previous.commandCenter.storeManagerTaskWatcher,
              staffNotificationHandoff: payload?.staffNotificationHandoff || previous.commandCenter.staffNotificationHandoff,
              staffNotificationDeliveryBridge: payload?.staffNotificationDeliveryBridge || previous.commandCenter.staffNotificationDeliveryBridge,
              staffNotificationAuditLog: payload?.staffNotificationAuditLog || previous.commandCenter.staffNotificationAuditLog,
              taskProviderHandoff: payload?.taskProviderHandoff || previous.commandCenter.taskProviderHandoff,
            }
          : previous.commandCenter,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Staff notification handoff is temporarily unavailable.' }));
    }
  };

  const buildStaffNotificationDeliveryBridge = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building staff notification delivery bridge...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'staff-notification-delivery-bridge',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: response.ok ? 'queued' : 'blocked',
        message: response.ok ? 'Staff notification delivery bridge is ready.' : 'Staff notification delivery bridge unavailable.',
        staffNotificationHandoff: payload?.staffNotificationHandoff || previous.staffNotificationHandoff,
        staffNotificationDeliveryBridge: payload?.staffNotificationDeliveryBridge || previous.staffNotificationDeliveryBridge,
        staffNotificationAuditLog: payload?.staffNotificationAuditLog || previous.staffNotificationAuditLog,
        taskProviderHandoff: payload?.taskProviderHandoff || previous.taskProviderHandoff,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Staff notification delivery bridge is temporarily unavailable.' }));
    }
  };

  const buildTaskProviderHandoff = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building task provider handoff package...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'task-provider-handoff',
          runtimeTarget: 'openclaw',
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: response.ok && payload?.taskProviderHandoff?.summary?.blocked === 0 ? 'queued' : 'blocked',
        message: response.ok
          ? `Task provider handoff built: ${payload?.taskProviderHandoff?.summary?.packages ?? 0} packages, ${payload?.taskProviderHandoff?.summary?.forwardable ?? 0} forwardable.`
          : 'Task provider handoff unavailable.',
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
        taskProviderHandoff: payload?.taskProviderHandoff || previous.taskProviderHandoff,
        commandCenter: previous.commandCenter
          ? {
              ...previous.commandCenter,
              storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.commandCenter.storeManagerTaskQueue,
              taskProviderHandoff: payload?.taskProviderHandoff || previous.commandCenter.taskProviderHandoff,
            }
          : previous.commandCenter,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Task provider handoff is temporarily unavailable.' }));
    }
  };

  const forwardTaskProviderHandoff = async () => {
    const selected = commandTaskProviderHandoff?.packages[0] || commandTaskProviderHandoff?.blockedPackages[0];
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Forwarding task provider handoff to runtime bridge...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'task-provider-forward',
          runtimeTarget: 'openclaw',
          handoffId: selected?.handoffId,
          taskMemoryId: selected?.taskMemoryId,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: response.ok ? 'queued' : 'blocked',
        eventId: payload?.run?.eventId || previous.eventId,
        tenantId: payload?.run?.tenantId || previous.tenantId,
        message: payload?.bridge?.message || 'Provider forward attempt recorded.',
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        taskProviderHandoff: payload?.taskProviderHandoff || previous.taskProviderHandoff,
        runHealth: payload?.runHealth || previous.runHealth,
        providerReceiptInbox: payload?.providerReceiptInbox || previous.providerReceiptInbox,
        recovery: payload?.recovery || previous.recovery,
        executionTimeline: payload?.executionTimeline || previous.executionTimeline,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Task provider forward is temporarily unavailable.' }));
    }
  };

  const importPosRedemptionSample = async () => {
    setDispatchState({ status: 'loading', message: 'Validating sanitized POS redemption rows...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'pos-import',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          operator: '运营负责人',
          rows: [
            {
              businessDate: '2026-05-23',
              storeName: runtimeIntake.restaurant,
              offerName: runtimeIntake.offer,
              channel: '团购券',
              couponClaimCount: 38,
              redemptionCount: 21,
              grossSales: 2180,
              orderCount: 24,
              inventoryUsed: 21,
            },
            {
              businessDate: '2026-05-23',
              storeName: runtimeIntake.restaurant,
              offerName: '双人工作餐',
              channel: '社群预约',
              couponClaimCount: 12,
              redemptionCount: 8,
              grossSales: 864,
              orderCount: 8,
              inventoryUsed: 8,
            },
          ],
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.posImport?.status === 'accepted' ? 'queued' : 'blocked',
        eventId: payload?.posImport?.receiptDraft?.eventId,
        message: `POS import ${payload?.posImport?.status || 'failed'}: ${payload?.posImport?.summary?.validRows ?? 0} valid rows, ${payload?.posImport?.summary?.redemptionCount ?? 0} redemptions. Raw rows are not stored.`,
        posImport: payload?.posImport,
        receipts: payload?.receipts,
        businessSignals: payload?.businessSignals,
        heartbeat: payload?.heartbeat,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'POS redemption import validator is temporarily unavailable.' });
    }
  };

  const inspectCapabilityTrainingPlan = async () => {
    setDispatchState({ status: 'loading', message: '正在生成竞品能力训练计划...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'capability-training-plan',
          availableMaterials: ['门店资料', '菜单价格', '发布模板', '平台禁用词', '禁用表达', '常用语气'],
          configuredProviders: ['隔离浏览器 profile'],
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.capabilityTrainingPlan?.summary?.activationReady ? 'queued' : 'blocked',
        message: `训练计划已生成：${payload?.capabilityTrainingPlan?.summary?.trainableNow ?? 0} 项可先训练，${payload?.capabilityTrainingPlan?.summary?.providerGated ?? 0} 项等待 Provider。`,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan,
        capabilityTrainingRecords: payload?.trainingRecords,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '竞品能力训练计划暂不可用。' });
    }
  };

  const inspectClawSkillCatalog = async () => {
    setDispatchState({ status: 'loading', message: '正在加载 Claw 能力库、训练队列和 Provider 解锁项...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'claw-skill-catalog' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.clawSkillCatalog?.summary?.providerGatedSkills ? 'blocked' : 'queued',
        message: `Claw 能力库已加载：${payload?.clawSkillCatalog?.summary?.modules ?? 0} 模块、${payload?.clawSkillCatalog?.summary?.skills ?? 0} 技能、${payload?.clawSkillCatalog?.summary?.tools ?? 0} 工具。`,
        clawSkillCatalog: payload?.clawSkillCatalog,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Claw 能力库暂不可用。' });
    }
  };

  const buildClawSkillWorkbench = async () => {
    setDispatchState({ status: 'loading', message: 'Building executable Claw Skill Workbench for this restaurant...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'claw-skill-workbench',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.clawSkillWorkbench?.summary?.providerGated ? 'blocked' : 'queued',
        message: `${selectedClawWorkbenchPreset.label} Skill Workbench built and remembered: ${payload?.clawSkillWorkbench?.summary?.runnableNow ?? 0} runnable skills, ${payload?.clawSkillWorkbench?.summary?.trainingNeeded ?? 0} training gaps, ${payload?.clawSkillWorkbench?.summary?.providerGated ?? 0} provider gates, ${payload?.storeManagerTaskRecords?.length ?? 0} owner tasks.`,
        clawSkillWorkbench: payload?.clawSkillWorkbench,
        clawSkillExecutionRecord: payload?.clawSkillExecutionRecord,
        clawSkillExecutionLedger: payload?.clawSkillExecutionLedger,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue,
        storeManagerTaskWatcher: payload?.storeManagerTaskWatcher,
        staffNotificationHandoff: payload?.staffNotificationHandoff,
        staffNotificationDeliveryBridge: payload?.staffNotificationDeliveryBridge,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Claw Skill Workbench is temporarily unavailable.' });
    }
  };

  const inspectBenchmarkStrategy = async () => {
    setDispatchState({ status: 'loading', message: '正在判断餐饮产品底座：筷子平台级、勺子/龙虾 Agent、餐饮 SaaS 数据合同...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'benchmark-strategy' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: 'blocked',
        message: `对标策略已生成：${payload?.benchmarkStrategy?.recommendation || 'pending'}。外部 Provider 和经营数据仍是解锁门槛。`,
        benchmarkStrategy: payload?.benchmarkStrategy,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '对标策略暂不可用。' });
    }
  };

  const buildActivationCockpit = async () => {
    setDispatchState({ status: 'loading', message: 'Building Activation Cockpit: internal ability, training gaps and provider gates...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'activation-cockpit',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.activationCockpit?.summary?.providerGated ? 'blocked' : 'queued',
        message: `Activation Cockpit built: ${payload?.activationCockpit?.summary?.usableNow ?? 0} usable now, ${payload?.activationCockpit?.summary?.providerGated ?? 0} provider-gated, ${payload?.activationCockpit?.summary?.providerKeysNeeded ?? 0} provider keys needed.`,
        activationCockpit: payload?.activationCockpit,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Activation Cockpit is temporarily unavailable.' });
    }
  };

  const buildChannelHub = async () => {
    setDispatchState({ status: 'loading', message: 'Building AI employee channel and schedule hub...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'channel-hub',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.channelHub?.summary?.providerGatedChannels || payload?.channelHub?.summary?.providerGatedJobs ? 'blocked' : 'queued',
        message: `Channel Hub built: ${payload?.channelHub?.summary?.channels ?? 0} channels, ${payload?.channelHub?.summary?.scheduledJobs ?? 0} jobs, ${payload?.channelHub?.summary?.missingExternalItems ?? 0} external items.`,
        channelHub: payload?.channelHub,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'AI employee channel hub is temporarily unavailable.' });
    }
  };

  const attemptChannelDelivery = async () => {
    setDispatchState({ status: 'loading', message: 'Attempting staff-only channel delivery through governed provider boundary...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'channel-delivery-attempt',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          channelId: 'wecom',
          jobId: 'morning-prep',
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.channelDeliveryAttempt?.status === 'forwarded' || payload?.channelDeliveryAttempt?.status === 'manual-ready' ? 'queued' : 'blocked',
        message: `Channel delivery attempt: ${payload?.channelDeliveryAttempt?.status || 'unknown'}; latest ledger total ${payload?.channelDeliveryReport?.summary?.total ?? 0}.`,
        channelDeliveryAttempt: payload?.channelDeliveryAttempt,
        channelDeliveryReport: payload?.channelDeliveryReport,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Channel delivery attempt is temporarily unavailable.' });
    }
  };

  const runChannelSchedule = async () => {
    setDispatchState({ status: 'loading', message: 'Running due AI employee channel schedule...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'channel-schedule-run',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          limit: 4,
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.channelScheduleRun?.summary?.blocked || payload?.channelScheduleRun?.summary?.failed ? 'blocked' : 'queued',
        message: `Channel schedule run: ${payload?.channelScheduleRun?.summary?.attempted ?? 0} attempted, ${payload?.channelScheduleRun?.summary?.blocked ?? 0} blocked, ${payload?.channelScheduleRun?.summary?.retryRecommended ?? 0} retry/recovery.`,
        channelScheduleRun: payload?.channelScheduleRun,
        channelDeliveryReport: payload?.channelDeliveryReport,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Channel schedule runner is temporarily unavailable.' });
    }
  };

  const buildClawTrainingBatch = async () => {
    setDispatchState({ status: 'loading', message: '正在生成 Claw 训练批次和 Provider 解锁批次...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'claw-training-batch',
          internalLimit: 8,
          providerLimit: 6,
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.clawTrainingBatch?.summary?.providerUnlockTasks ? 'blocked' : 'queued',
        message: `Claw 训练批次已生成：${payload?.clawTrainingBatch?.summary?.internalTrainingTasks ?? 0} 个内部训练任务，${payload?.clawTrainingBatch?.summary?.providerUnlockTasks ?? 0} 个外部解锁任务。`,
        clawTrainingBatch: payload?.clawTrainingBatch,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Claw 训练批次暂不可用。' });
    }
  };

  const inspectPlatformOperatingSpine = async () => {
    setDispatchState({ status: 'loading', message: 'Building platform-grade restaurant operating spine...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'platform-operating-spine' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.platformOperatingSpine?.summary?.blockedExternalGroups ? 'blocked' : 'queued',
        message: `Platform operating spine built: ${payload?.platformOperatingSpine?.summary?.runs ?? 0} runs, ${payload?.platformOperatingSpine?.summary?.acceptedReceipts ?? 0} accepted receipts, ${payload?.platformOperatingSpine?.summary?.blockedExternalGroups ?? 0} external gate groups.`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        readiness: payload?.readiness,
        platformOperatingSpine: payload?.platformOperatingSpine,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Platform operating spine is temporarily unavailable.' });
    }
  };

  const inspectOperatingDataContract = async () => {
    setDispatchState({ status: 'loading', message: 'Building restaurant operating data contract...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'operating-data-contract',
          rows: [
            {
              businessDate: '2026-05-23',
              storeName: runtimeIntake.restaurant,
              offerName: runtimeIntake.offer,
              channel: '团购券',
              couponClaimCount: 38,
              redemptionCount: 21,
              grossSales: 2180,
              orderCount: 24,
              inventoryUsed: 21,
            },
          ],
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.operatingDataContract?.summary?.providerGated ? 'blocked' : 'queued',
        message: `Operating data contract built: ${payload?.operatingDataContract?.summary?.tracks ?? 0} tracks, ${payload?.operatingDataContract?.summary?.manualImportReady ?? 0} manual-import ready, ${payload?.operatingDataContract?.summary?.providerGated ?? 0} provider-gated.`,
        receipts: payload?.receipts,
        posImport: payload?.posImport,
        operatingDataContract: payload?.operatingDataContract,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Operating data contract is temporarily unavailable.' });
    }
  };

  const inspectOperatingInsightReport = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building operating insight report from sanitized aggregate data...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'operating-insight-report',
          rows: [
            {
              businessDate: '2026-05-23',
              storeName: runtimeIntake.restaurant,
              offerName: runtimeIntake.offer,
              channel: 'group-buy coupon',
              couponClaimCount: 38,
              redemptionCount: 21,
              grossSales: 2180,
              orderCount: 24,
              inventoryUsed: 21,
            },
          ],
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.operatingInsightReport?.summary?.canClaimTrueOperatingAnalysis ? 'queued' : 'blocked',
        message: `Operating insight report: ${payload?.operatingInsightReport?.summary?.measured ?? 0} measured, ${payload?.operatingInsightReport?.summary?.directional ?? 0} directional, ${payload?.operatingInsightReport?.summary?.blocked ?? 0} blocked.`,
        receipts: payload?.receipts || previous.receipts,
        posImport: payload?.posImport || previous.posImport,
        businessSignals: payload?.businessSignals || previous.businessSignals,
        operatingDataContract: payload?.operatingDataContract || previous.operatingDataContract,
        operatingInsightReport: payload?.operatingInsightReport || previous.operatingInsightReport,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Operating insight report is temporarily unavailable.' }));
    }
  };

  const buildPostRunReviewPack = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building post-run review pack and next-loop SOP...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'post-run-review-pack',
          runtimeTarget: 'openclaw',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
          rows: [
            {
              businessDate: '2026-05-23',
              storeName: runtimeIntake.restaurant,
              offerName: runtimeIntake.offer,
              channel: 'group-buy coupon',
              couponClaimCount: 38,
              redemptionCount: 21,
              grossSales: 2180,
              orderCount: 24,
              inventoryUsed: 21,
            },
          ],
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.postRunReviewPack?.summary?.canClaimTrueOperatingAnalysis ? 'queued' : 'blocked',
        message: `Post-run review: ${payload?.postRunReviewPack?.verdict || 'unknown'}; ${payload?.postRunReviewPack?.summary?.storeTasks ?? 0} store tasks, ${payload?.postRunReviewPack?.summary?.blockedInsights ?? 0} blocked insights.`,
        receipts: payload?.receipts || previous.receipts,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        posImport: payload?.posImport || previous.posImport,
        businessSignals: payload?.businessSignals || previous.businessSignals,
        providerReceiptInbox: payload?.providerReceiptInbox || previous.providerReceiptInbox,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
        runtimeProbe: payload?.runtimeProbe || previous.runtimeProbe,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        postRunReviewPack: payload?.postRunReviewPack || previous.postRunReviewPack,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Post-run review pack is temporarily unavailable.' }));
    }
  };

  const buildNextLoopChannelPlan = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building next-loop shift plan from proof, staff channels and operating gates...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'next-loop-channel-plan',
          runtimeTarget: 'openclaw',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
          rows: [
            {
              businessDate: '2026-05-23',
              storeName: runtimeIntake.restaurant,
              offerName: runtimeIntake.offer,
              channel: 'group-buy coupon',
              couponClaimCount: 38,
              redemptionCount: 21,
              grossSales: 2180,
              orderCount: 24,
              inventoryUsed: 21,
            },
          ],
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.nextLoopChannelPlan?.summary?.providerGatedLanes || payload?.nextLoopChannelPlan?.summary?.providerGatedActions ? 'blocked' : 'queued',
        message: `Next-loop plan: ${payload?.nextLoopChannelPlan?.verdict || 'unknown'}; ${payload?.nextLoopChannelPlan?.summary?.scheduledActions ?? 0} actions, ${payload?.nextLoopChannelPlan?.summary?.providerGatedActions ?? 0} provider-gated.`,
        receipts: payload?.receipts || previous.receipts,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        posImport: payload?.posImport || previous.posImport,
        providerReceiptInbox: payload?.providerReceiptInbox || previous.providerReceiptInbox,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
        runtimeProbe: payload?.runtimeProbe || previous.runtimeProbe,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        channelHub: payload?.channelHub || previous.channelHub,
        channelDeliveryReport: payload?.channelDeliveryReport || previous.channelDeliveryReport,
        postRunReviewPack: payload?.postRunReviewPack || previous.postRunReviewPack,
        nextLoopChannelPlan: payload?.nextLoopChannelPlan || previous.nextLoopChannelPlan,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Next-loop channel plan is temporarily unavailable.' }));
    }
  };

  const recordCapabilityTrainingSample = async () => {
    setDispatchState({ status: 'loading', message: '正在写入 Claw 能力训练样本...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'capability-training-record',
          kind: 'material',
          capabilityId: 'auto-publish-receipts',
          name: '发布模板',
          owner: '运营',
          source: 'manual',
          evidenceSummary: '样例：大众点评和小红书发布模板已由门店确认，仅记录公开发布规则和门店审核结论。',
          availableMaterials: ['平台禁用词', '门店审批规则', '素材授权记录'],
          configuredProviders: ['隔离浏览器 profile'],
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.trainingRecord?.accepted ? 'queued' : 'blocked',
        message: payload?.trainingRecord?.accepted
          ? `训练材料已写入：${payload.trainingRecord.name}；当前 ${payload?.capabilityTrainingPlan?.summary?.providerGated ?? 0} 项等待外部 Provider。`
          : payload?.trainingRecord?.rejectedReason || '训练材料被拒绝。',
        capabilityTrainingRecord: payload?.trainingRecord,
        capabilityTrainingRecords: payload?.trainingRecords,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Claw 能力训练样本写入暂不可用。' });
    }
  };

  const inspectBrowserSessionHealth = async () => {
    setDispatchState({ status: 'loading', message: '正在检查常驻浏览器 session 租约和心跳...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'browser-session-health' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.browserSessionHealth?.summary?.ready ? 'queued' : 'blocked',
        message: `浏览器 session 已检查 ${payload?.browserSessionHealth?.summary?.total ?? 0} 个；ready ${payload?.browserSessionHealth?.summary?.ready ?? 0} 个。`,
        browserSessionHealth: payload?.browserSessionHealth,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '浏览器 session health 暂不可用。' });
    }
  };

  const buildBrowserRunbook = async () => {
    setDispatchState({ status: 'loading', message: 'Building governed Browser Runbook package...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'browser-runbook',
          runtimeTarget: 'openclaw',
          eventId: 'restaurant-agent-proof-runbook',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          channel: 'dianping',
          targetUrl: 'https://www.dianping.com/shop/example',
          allowedDomains: ['dianping.com', 'meituan.com', 'xiaohongshu.com', 'douyin.com', 'weixin.qq.com'],
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.browserRunbook?.canExecuteNow ? 'queued' : 'blocked',
        eventId: payload?.browserRunbook?.session?.task?.eventId,
        message: `${payload?.browserRunbook?.payloadShape || 'browser-runbook'} generated; executable now: ${payload?.browserRunbook?.canExecuteNow ? 'yes' : 'no'}.`,
        browserRunbook: payload?.browserRunbook,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Browser Runbook package is temporarily unavailable.' });
    }
  };

  const buildBrowserRunnerContract = async () => {
    setDispatchState({ status: 'loading', message: 'Building browser runner callback contract...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'browser-runner-contract',
          runtimeTarget: 'openclaw',
          eventId: 'restaurant-agent-runner-contract',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          channel: 'dianping',
          targetUrl: 'https://www.dianping.com/shop/example',
          allowedDomains: ['dianping.com', 'meituan.com', 'xiaohongshu.com', 'douyin.com', 'weixin.qq.com'],
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.browserRunnerContract?.canAcceptSignedFinalReceipt ? 'queued' : 'blocked',
        eventId: 'restaurant-agent-runner-contract',
        message: `${payload?.browserRunnerContract?.payloadShape || 'browser-runner-contract'} generated; final signed receipt ready: ${payload?.browserRunnerContract?.canAcceptSignedFinalReceipt ? 'yes' : 'no'}.`,
        browserRunnerContract: payload?.browserRunnerContract,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Browser runner callback contract is temporarily unavailable.' });
    }
  };

  const buildBrowserGatewayPack = async () => {
    setDispatchState({ status: 'loading', message: 'Building browser gateway pack...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'browser-gateway-pack',
          runtimeTarget: 'openclaw',
          eventId: 'restaurant-agent-runner-contract',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          channel: runtimeIntake.channels,
          targetUrl: 'merchant-approved-url-or-public-proof-url',
          allowedDomains: ['dianping.com', 'xiaohongshu.com', 'douyin.com', 'weixin.qq.com'],
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.browserGatewayPack?.canExecuteNow ? 'queued' : 'blocked',
        eventId: 'restaurant-agent-runner-contract',
        message: `Browser gateway pack ${payload?.browserGatewayPack?.payloadShape || 'missing'}; accepted actions ${payload?.browserGatewayPack?.browserRequest?.acceptedActions?.length ?? 0}.`,
        browserGatewayPack: payload?.browserGatewayPack || previous.browserGatewayPack,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Browser gateway pack is temporarily unavailable.' }));
    }
  };

  const recordBrowserRunnerEvent = async () => {
    setDispatchState({ status: 'loading', message: 'Recording sanitized browser runner step event...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'browser-runner-event',
          eventId: 'restaurant-agent-runner-contract',
          runbookId: 'restaurant-browser-runbook-demo',
          runtimeTarget: 'openclaw',
          externalRunId: 'openclaw-run-demo',
          stepId: 'capture-proof-screenshot',
          eventType: 'step-completed',
          evidenceSummary: 'Public proof screenshot captured; waiting for receipt extraction.',
          nextAction: 'Continue to extract receipt fields, then send final signed receipt.',
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.runnerEvent?.status === 'accepted' ? 'queued' : 'blocked',
        eventId: payload?.runnerEvent?.eventId,
        message: `Runner event ${payload?.runnerEvent?.status || 'missing'}; active runs ${payload?.runnerEventHealth?.summary?.activeRuns ?? 0}, stale ${payload?.runnerEventHealth?.summary?.staleRuns ?? 0}.`,
        runnerEvent: payload?.runnerEvent,
        runnerEventHealth: payload?.runnerEventHealth,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Browser runner event ledger is temporarily unavailable.' });
    }
  };

  const inspectBrowserRunnerEventHealth = async () => {
    setDispatchState({ status: 'loading', message: 'Checking browser runner event health...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'browser-runner-event-health' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.runnerEventHealth?.summary?.rejected || payload?.runnerEventHealth?.summary?.staleRuns ? 'blocked' : 'queued',
        message: `Runner event health checked ${payload?.runnerEventHealth?.summary?.totalEvents ?? 0} events; active ${payload?.runnerEventHealth?.summary?.activeRuns ?? 0}, completed ${payload?.runnerEventHealth?.summary?.completedRuns ?? 0}.`,
        runnerEventHealth: payload?.runnerEventHealth,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Browser runner event health is temporarily unavailable.' });
    }
  };

  const importPublicProfile = async () => {
    setDispatchState({ status: 'loading', message: '正在把公开门店资料转成可审计 profile、证据账本和记忆写入...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'public-profile',
          sampleId: 'osm-node-600243400',
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.publicProfile?.canUseNow ? 'queued' : 'blocked',
        message: `公开资料已生成 ${payload?.publicProfile?.fields?.filter((item: { confidence: string }) => item.confidence !== 'missing').length ?? 0} 个可用字段；仍需门店补菜单、图片、活动边界和发布凭证。`,
        publicProfile: payload?.publicProfile,
        publicIntelligenceBrief: payload?.publicIntelligenceBrief,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '公开门店资料导入暂不可用。' });
    }
  };

  const buildPublicSourceHarvestPack = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building public source harvest pack...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'public-source-harvest-pack',
          sampleId: 'osm-node-600243400',
          restaurant: runtimeIntake.restaurant,
          suggestedOffer: runtimeIntake.offer,
          suggestedAudience: runtimeIntake.audience,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.publicSourceHarvestPack?.summary?.providerRequired ? 'blocked' : 'queued',
        message: `Public source harvest pack: ${payload?.publicSourceHarvestPack?.summary?.internalTargets ?? 0}/${payload?.publicSourceHarvestPack?.summary?.targets ?? 0} targets can run internally.`,
        publicProfile: payload?.publicProfile || previous.publicProfile,
        publicIntelligenceBrief: payload?.publicIntelligenceBrief || previous.publicIntelligenceBrief,
        publicSourceHarvestPack: payload?.publicSourceHarvestPack || previous.publicSourceHarvestPack,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Public source harvest pack is temporarily unavailable.' }));
    }
  };

  const buildPublicTrialSeed = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building controlled trial seed from public store intel...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'public-trial-seed',
          sampleId: 'osm-node-600243400',
          restaurant: runtimeIntake.restaurant,
          suggestedOffer: runtimeIntake.offer,
          suggestedAudience: runtimeIntake.audience,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.publicTrialSeed?.summary?.providerRequired ? 'blocked' : 'queued',
        message: `Public trial seed: ${payload?.publicTrialSeed?.summary?.usableFields ?? 0} usable fields, ${payload?.publicTrialSeed?.summary?.workflowReadySteps ?? 0} ready workflow steps, ${payload?.publicTrialSeed?.summary?.workflowExternalGatedSteps ?? 0} external-gated.`,
        publicTrialSeed: payload?.publicTrialSeed || previous.publicTrialSeed,
        publicProfile: payload?.publicTrialSeed?.publicProfile || previous.publicProfile,
        publicIntelligenceBrief: payload?.publicTrialSeed?.publicIntelligenceBrief || previous.publicIntelligenceBrief,
        publicSourceHarvestPack: payload?.publicTrialSeed?.publicSourceHarvestPack || previous.publicSourceHarvestPack,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Public trial seed is temporarily unavailable.' }));
    }
  };

  const buildDayZeroMissionPack = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building Day-0 owner missions from public trial seed...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'day-zero-mission-pack',
          recordTasks: true,
          sampleId: 'osm-node-600243400',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          visitReason: runtimeIntake.visitReason,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.dayZeroMissionPack?.summary?.externalGated ? 'blocked' : 'queued',
        message: `Day-0 mission pack: ${payload?.dayZeroMissionPack?.summary?.readyInternal ?? 0} internal-ready, ${payload?.dayZeroMissionPack?.summary?.needsMerchantEvidence ?? 0} need merchant evidence, ${payload?.dayZeroMissionPack?.summary?.externalGated ?? 0} external-gated.`,
        dayZeroMissionPack: payload?.dayZeroMissionPack || previous.dayZeroMissionPack,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
        storeManagerTaskWatcher: payload?.storeManagerTaskWatcher || previous.storeManagerTaskWatcher,
        staffNotificationHandoff: payload?.staffNotificationHandoff || previous.staffNotificationHandoff,
        staffNotificationDeliveryBridge: payload?.staffNotificationDeliveryBridge || previous.staffNotificationDeliveryBridge,
        taskProviderHandoff: payload?.taskProviderHandoff || previous.taskProviderHandoff,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Day-0 mission pack is temporarily unavailable.' }));
    }
  };

  const inspectOpsConsole = async () => {
    setDispatchState({ status: 'loading', message: '正在聚合 run、回执、watcher、恢复动作、浏览器会话和经营信号...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ops-console' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.opsConsole?.summary?.blockedRuns ? 'blocked' : 'queued',
        message: `Ops Console 已聚合 ${payload?.opsConsole?.summary?.runs ?? 0} 个 run、${payload?.opsConsole?.summary?.acceptedReceipts ?? 0} 条验收回执、${payload?.opsConsole?.summary?.watcherWakeups ?? 0} 个 watcher wakeup。`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        opsConsole: payload?.opsConsole,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Agent Ops Console 暂不可用。' });
    }
  };

  const inspectExecutionTimeline = async () => {
    setDispatchState({ status: 'loading', message: 'Building execution timeline...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execution-timeline' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.executionTimeline?.summary?.blockedRuns ? 'blocked' : 'queued',
        message: `Execution timeline ${payload?.executionTimeline?.mode || 'unknown'}: ${payload?.executionTimeline?.summary?.runs ?? 0} runs, ${payload?.executionTimeline?.summary?.watcherWakeups ?? 0} watcher wakeups.`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        executionTimeline: payload?.executionTimeline,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Execution timeline is temporarily unavailable.' });
    }
  };

  const refreshCommandCenter = async () => {
    setDispatchState({ status: 'loading', message: 'Refreshing Agent Command Center...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'command-center',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.commandCenter?.summary?.blockedRuns ? 'blocked' : 'queued',
        message: `Command Center ${payload?.commandCenter?.mode || 'unknown'}: ${payload?.commandCenter?.summary?.runs ?? 0} runs, ${payload?.commandCenter?.summary?.acceptedReceipts ?? 0} accepted receipts, ${payload?.commandCenter?.summary?.providerGates ?? 0} provider gates.`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        commandCenter: payload?.commandCenter,
        aiEmployeeInbox: payload?.commandCenter?.aiEmployeeInbox,
        storeManagerTaskQueue: payload?.commandCenter?.storeManagerTaskQueue,
        storeManagerTaskWatcher: payload?.commandCenter?.storeManagerTaskWatcher,
        staffNotificationHandoff: payload?.commandCenter?.staffNotificationHandoff,
        staffNotificationDeliveryBridge: payload?.commandCenter?.staffNotificationDeliveryBridge,
        staffNotificationAuditLog: payload?.commandCenter?.staffNotificationAuditLog,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'Agent Command Center is temporarily unavailable.' });
    }
  };

  const refreshResidentAgentMissionControl = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Refreshing Resident Agent Mission Control...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resident-agent-mission-control',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.residentAgentMissionControl?.mode === 'needs-human' ? 'blocked' : 'queued',
        message: `Resident Agent ${payload?.residentAgentMissionControl?.mode || 'unknown'}: ${payload?.residentAgentMissionControl?.summary?.readyLanes ?? 0}/${payload?.residentAgentMissionControl?.summary?.lanes ?? 0} lanes ready, ${payload?.residentAgentMissionControl?.summary?.externalGates ?? 0} external gates.`,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        residentAgentMissionControl: payload?.residentAgentMissionControl || previous.residentAgentMissionControl,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Resident Agent Mission Control is temporarily unavailable.' }));
    }
  };

  const runShiftAutopilot = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Running Shift Autopilot internal lane...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'shift-autopilot-run',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.shiftAutopilotRun?.summary?.providerHeldActions ? 'blocked' : 'queued',
        message: `Shift Autopilot run: ${payload?.shiftAutopilotRun?.summary?.acceptedInternalActions ?? 0} internal, ${payload?.shiftAutopilotRun?.summary?.createdStoreManagerTasks ?? 0} owner tasks, ${payload?.shiftAutopilotRun?.summary?.providerHeldActions ?? 0} provider-held.`,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        commandCenter: payload?.commandCenter || previous.commandCenter,
        shiftAutopilot: payload?.shiftAutopilot || previous.shiftAutopilot,
        shiftAutopilotRun: payload?.shiftAutopilotRun || previous.shiftAutopilotRun,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
        storeManagerTaskWatcher: payload?.storeManagerTaskWatcher || previous.storeManagerTaskWatcher,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Shift Autopilot run is temporarily unavailable.' }));
    }
  };

  const buildShiftProviderHandoff = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building Shift Provider Handoff from recorded shift runs...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'shift-provider-handoff' }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.shiftProviderHandoff?.summary?.requests ? 'blocked' : 'queued',
        message: `Shift Provider Handoff: ${payload?.shiftProviderHandoff?.summary?.requests ?? 0} asks, ${payload?.shiftProviderHandoff?.summary?.p0 ?? 0} P0, ${payload?.shiftProviderHandoff?.summary?.readyToSandbox ?? 0} sandbox-ready.`,
        shiftProviderHandoff: payload?.shiftProviderHandoff || previous.shiftProviderHandoff,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Shift Provider Handoff is temporarily unavailable.' }));
    }
  };

  const buildShiftSandboxAcceptance = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building Shift Sandbox Acceptance...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'shift-sandbox-acceptance' }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.shiftSandboxAcceptance?.summary?.canSubmitSandbox ? 'queued' : 'blocked',
        message: `Shift Sandbox Acceptance: ${payload?.shiftSandboxAcceptance?.summary?.passed ?? 0}/${payload?.shiftSandboxAcceptance?.summary?.stages ?? 0} stages passed, verdict ${payload?.shiftSandboxAcceptance?.verdict || 'unknown'}.`,
        shiftSandboxAcceptance: payload?.shiftSandboxAcceptance || previous.shiftSandboxAcceptance,
        shiftProviderHandoff: payload?.shiftProviderHandoff || previous.shiftProviderHandoff,
        providerSandboxContract: payload?.providerSandboxContract || previous.providerSandboxContract,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Shift Sandbox Acceptance is temporarily unavailable.' }));
    }
  };

  const buildShiftFirstForwardableRun = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building Shift First Forwardable Run...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'shift-first-forwardable-run', runtimeTarget: 'openclaw' }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.shiftFirstForwardableRun?.summary?.canForwardFirstShiftRun ? 'queued' : 'blocked',
        message: `Shift First Forwardable Run: ${payload?.shiftFirstForwardableRun?.verdict || 'unknown'}; ${payload?.shiftFirstForwardableRun?.summary?.blockedStages ?? 0} blocked, ${payload?.shiftFirstForwardableRun?.summary?.waitingExternalStages ?? 0} waiting.`,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        shiftFirstForwardableRun: payload?.shiftFirstForwardableRun || previous.shiftFirstForwardableRun,
        shiftProviderHandoff: payload?.shiftProviderHandoff || previous.shiftProviderHandoff,
        shiftSandboxAcceptance: payload?.shiftSandboxAcceptance || previous.shiftSandboxAcceptance,
        firstForwardableRunPack: payload?.firstForwardableRunPack || previous.firstForwardableRunPack,
        taskProviderHandoff: payload?.taskProviderHandoff || previous.taskProviderHandoff,
        providerSandboxContract: payload?.providerSandboxContract || previous.providerSandboxContract,
        providerReceiptInbox: payload?.providerReceiptInbox || previous.providerReceiptInbox,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Shift First Forwardable Run is temporarily unavailable.' }));
    }
  };

  const forwardShiftSandboxRun = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Submitting guarded Shift Sandbox Run...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'shift-sandbox-forward', runtimeTarget: 'openclaw' }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.shiftSandboxForwardAttempt?.ok ? 'queued' : 'blocked',
        message: `Shift Sandbox Forward: ${payload?.shiftSandboxForwardAttempt?.verdict || 'unknown'}; bridge ${payload?.shiftSandboxForwardAttempt?.summary?.bridgeStatus || 'unknown'}.`,
        eventId: payload?.run?.eventId || previous.eventId,
        tenantId: payload?.run?.tenantId || previous.tenantId,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        shiftSandboxForwardAttempt: payload?.shiftSandboxForwardAttempt || previous.shiftSandboxForwardAttempt,
        shiftFirstForwardableRun: payload?.shiftFirstForwardableRun || previous.shiftFirstForwardableRun,
        shiftProviderHandoff: payload?.shiftProviderHandoff || previous.shiftProviderHandoff,
        shiftSandboxAcceptance: payload?.shiftSandboxAcceptance || previous.shiftSandboxAcceptance,
        firstForwardableRunPack: payload?.firstForwardableRunPack || previous.firstForwardableRunPack,
        taskProviderHandoff: payload?.taskProviderHandoff || previous.taskProviderHandoff,
        providerSandboxContract: payload?.providerSandboxContract || previous.providerSandboxContract,
        providerReceiptInbox: payload?.providerReceiptInbox || previous.providerReceiptInbox,
        runHealth: payload?.runHealth || previous.runHealth,
        recovery: payload?.recovery || previous.recovery,
        executionTimeline: payload?.executionTimeline || previous.executionTimeline,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Shift Sandbox Forward is temporarily unavailable.' }));
    }
  };

  const buildShiftCloseoutTrainingPack = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building Shift Closeout Training Pack...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'shift-closeout-training-pack',
          runtimeTarget: 'openclaw',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
          rows: [
            {
              businessDate: '2026-05-23',
              storeName: runtimeIntake.restaurant,
              offerName: runtimeIntake.offer,
              channel: 'group-buy coupon',
              couponClaimCount: 38,
              redemptionCount: 21,
              grossSales: 2180,
              orderCount: 24,
              inventoryUsed: 21,
            },
          ],
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.shiftCloseoutTrainingPack?.summary?.canRecordTraining ? 'queued' : 'blocked',
        message: `Shift Closeout Training: ${payload?.shiftCloseoutTrainingPack?.verdict || 'unknown'}; ${payload?.shiftCloseoutTrainingPack?.summary?.trainingDrafts ?? 0} drafts, ${payload?.shiftCloseoutTrainingPack?.summary?.recoveryActions ?? 0} recovery actions.`,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        posImport: payload?.posImport || previous.posImport,
        shiftCloseoutTrainingPack: payload?.shiftCloseoutTrainingPack || previous.shiftCloseoutTrainingPack,
        postRunReviewPack: payload?.postRunReviewPack || previous.postRunReviewPack,
        providerReceiptInbox: payload?.providerReceiptInbox || previous.providerReceiptInbox,
        recovery: payload?.recovery || previous.recovery,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        runtimeProbe: payload?.runtimeProbe || previous.runtimeProbe,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Shift Closeout Training Pack is temporarily unavailable.' }));
    }
  };

  const recordShiftCloseoutTraining = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Recording accepted Shift Closeout training...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'shift-closeout-record-training',
          runtimeTarget: 'openclaw',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
          rows: [
            {
              businessDate: '2026-05-23',
              storeName: runtimeIntake.restaurant,
              offerName: runtimeIntake.offer,
              channel: 'group-buy coupon',
              couponClaimCount: 38,
              redemptionCount: 21,
              grossSales: 2180,
              orderCount: 24,
              inventoryUsed: 21,
            },
          ],
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.shiftCloseoutTrainingRecordAttempt?.ok ? 'queued' : 'blocked',
        message: `Shift Closeout Training Record: ${payload?.shiftCloseoutTrainingRecordAttempt?.verdict || 'unknown'}; recorded ${payload?.shiftCloseoutTrainingRecordAttempt?.summary?.recorded ?? 0}, rejected ${payload?.shiftCloseoutTrainingRecordAttempt?.summary?.rejected ?? 0}.`,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        posImport: payload?.posImport || previous.posImport,
        shiftCloseoutTrainingPack: payload?.shiftCloseoutTrainingPack || previous.shiftCloseoutTrainingPack,
        shiftCloseoutTrainingRecordAttempt: payload?.shiftCloseoutTrainingRecordAttempt || previous.shiftCloseoutTrainingRecordAttempt,
        postRunReviewPack: payload?.postRunReviewPack || previous.postRunReviewPack,
        providerReceiptInbox: payload?.providerReceiptInbox || previous.providerReceiptInbox,
        recovery: payload?.recovery || previous.recovery,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        capabilityTrainingRecords: payload?.trainingRecords || previous.capabilityTrainingRecords,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Shift Closeout training record is temporarily unavailable.' }));
    }
  };

  const buildShiftCapabilityActivationPack = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building Shift Capability Activation Pack...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'shift-capability-activation-pack' }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.shiftCapabilityActivationPack?.summary?.activatedInternal ? 'queued' : 'blocked',
        message: `Shift Capability Activation: ${payload?.shiftCapabilityActivationPack?.verdict || 'unknown'}; active ${payload?.shiftCapabilityActivationPack?.summary?.activatedInternal ?? 0}, provider gated ${payload?.shiftCapabilityActivationPack?.summary?.trainedNeedsProvider ?? 0}.`,
        shiftCapabilityActivationPack: payload?.shiftCapabilityActivationPack || previous.shiftCapabilityActivationPack,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        capabilityTrainingRecords: payload?.trainingRecords || previous.capabilityTrainingRecords,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        runtimeProbe: payload?.runtimeProbe || previous.runtimeProbe,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Shift Capability Activation Pack is temporarily unavailable.' }));
    }
  };

  const buildShiftOperatingLoopPack = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building one-path Shift Operating Loop...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'shift-operating-loop-pack',
          runtimeTarget: 'openclaw',
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.shiftOperatingLoopPack?.summary?.canSubmitSandbox ? 'queued' : 'blocked',
        message: `Shift Operating Loop: ${payload?.shiftOperatingLoopPack?.verdict || 'unknown'}; next ${payload?.shiftOperatingLoopPack?.nextBestAction?.label || 'n/a'}.`,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        commandCenter: payload?.commandCenter || previous.commandCenter,
        shiftOperatingLoopPack: payload?.shiftOperatingLoopPack || previous.shiftOperatingLoopPack,
        shiftFirstForwardableRun: payload?.shiftFirstForwardableRun || previous.shiftFirstForwardableRun,
        shiftProviderHandoff: payload?.shiftProviderHandoff || previous.shiftProviderHandoff,
        shiftSandboxAcceptance: payload?.shiftSandboxAcceptance || previous.shiftSandboxAcceptance,
        firstForwardableRunPack: payload?.firstForwardableRunPack || previous.firstForwardableRunPack,
        taskProviderHandoff: payload?.taskProviderHandoff || previous.taskProviderHandoff,
        providerSandboxContract: payload?.providerSandboxContract || previous.providerSandboxContract,
        providerReceiptInbox: payload?.providerReceiptInbox || previous.providerReceiptInbox,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        recovery: payload?.recovery || previous.recovery,
        shiftCloseoutTrainingPack: payload?.shiftCloseoutTrainingPack || previous.shiftCloseoutTrainingPack,
        shiftCapabilityActivationPack: payload?.shiftCapabilityActivationPack || previous.shiftCapabilityActivationPack,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        capabilityTrainingRecords: payload?.trainingRecords || previous.capabilityTrainingRecords,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Shift Operating Loop Pack is temporarily unavailable.' }));
    }
  };

  const routeRestaurantCommand = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Routing restaurant command into governed AI employee actions...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'command-route',
          command: restaurantCommand,
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.commandRoute?.verdict === 'blocked-sensitive'
          ? 'blocked'
          : payload?.commandRoute?.verdict === 'provider-gated'
            ? 'blocked'
            : 'queued',
        message: `Command route: ${payload?.commandRoute?.intent || 'unknown'} -> ${payload?.commandRoute?.primaryAction?.clientAction || 'manual'}; ${payload?.commandRoute?.verdict || 'unknown'}.`,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        commandRoute: payload?.commandRoute || previous.commandRoute,
        commandCenter: payload?.commandCenter || previous.commandCenter,
        aiEmployeeInbox: payload?.commandCenter?.aiEmployeeInbox || previous.aiEmployeeInbox,
        storeManagerTaskQueue: payload?.commandCenter?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
        storeManagerTaskWatcher: payload?.commandCenter?.storeManagerTaskWatcher || previous.storeManagerTaskWatcher,
        staffNotificationHandoff: payload?.commandCenter?.staffNotificationHandoff || previous.staffNotificationHandoff,
        staffNotificationDeliveryBridge: payload?.commandCenter?.staffNotificationDeliveryBridge || previous.staffNotificationDeliveryBridge,
        staffNotificationAuditLog: payload?.commandCenter?.staffNotificationAuditLog || previous.staffNotificationAuditLog,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Restaurant command router is temporarily unavailable.' }));
    }
  };

  const runRoutedCommandAction = async () => {
    const clientAction = dispatchState.commandRoute?.primaryAction.clientAction;
    if (!clientAction || clientAction === 'manual-sanitize') {
      setDispatchState(previous => ({
        ...previous,
        status: 'blocked',
        message: 'Routed command is blocked until it is rewritten without private data, secrets, raw POS rows or customer-contact instructions.',
      }));
      return;
    }
    if (clientAction === 'controlled-trial-run') {
      await runControlledTrialRun();
      return;
    }
    if (clientAction === 'post-run-review-pack') {
      await buildPostRunReviewPack();
      return;
    }
    if (clientAction === 'next-loop-channel-plan') {
      await buildNextLoopChannelPlan();
      return;
    }
    if (clientAction === 'store-manager-followup') {
      await buildStoreManagerFollowup();
      return;
    }
    if (clientAction === 'operating-insight-report') {
      await inspectOperatingInsightReport();
      return;
    }
    if (clientAction === 'provider-setup-wizard') {
      await buildProviderSetupWizard();
      return;
    }
    if (clientAction === 'channel-schedule-run') {
      await runChannelSchedule();
      return;
    }
    if (clientAction === 'channel-hub') {
      await buildChannelHub();
    }
  };

  const buildAiEmployeeMemoryPack = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building AI employee memory pack...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ai-employee-memory-pack',
          command: restaurantCommand,
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.aiEmployeeMemoryPack?.employee?.safeToAutonomouslyRun ? 'queued' : 'blocked',
        message: `AI employee memory pack: ${payload?.aiEmployeeMemoryPack?.summary?.memoryCards ?? 0} memory cards, ${payload?.aiEmployeeMemoryPack?.summary?.nextWakeups ?? 0} wakeups, ${payload?.aiEmployeeMemoryPack?.summary?.externalRequired ?? 0} external gates.`,
        aiEmployeeMemoryPack: payload?.aiEmployeeMemoryPack || previous.aiEmployeeMemoryPack,
        commandRoute: payload?.commandRoute || previous.commandRoute,
        commandCenter: payload?.commandCenter || previous.commandCenter,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
        storeManagerTaskWatcher: payload?.storeManagerTaskWatcher || previous.storeManagerTaskWatcher,
        channelDeliveryReport: payload?.channelDeliveryReport || previous.channelDeliveryReport,
        clawSkillExecutionLedger: payload?.clawSkillExecutionLedger || previous.clawSkillExecutionLedger,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'AI employee memory pack is temporarily unavailable.' }));
    }
  };

  const buildCustomerDemandGateway = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building Customer Demand Gateway...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'customer-demand-gateway',
          command: restaurantCommand,
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.customerDemandGateway?.summary?.canClaimAutoOrderTaking ? 'queued' : 'blocked',
        message: `Customer demand gateway: ${payload?.customerDemandGateway?.summary?.channels ?? 0} channels, ${payload?.customerDemandGateway?.summary?.internalReady ?? 0} internal-ready, ${payload?.customerDemandGateway?.externalRequired?.length ?? 0} external gates.`,
        customerDemandGateway: payload?.customerDemandGateway || previous.customerDemandGateway,
        commandRoute: payload?.commandRoute || previous.commandRoute,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Customer Demand Gateway is temporarily unavailable.' }));
    }
  };

  const buildVoiceOrderConsole = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building Voice Order Console...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'voice-order-console',
          command: restaurantCommand,
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.voiceOrderConsole?.summary?.canWriteOrdersNow ? 'queued' : 'blocked',
        message: `Voice order console: ${payload?.voiceOrderConsole?.summary?.intents ?? 0} intents, ${payload?.voiceOrderConsole?.summary?.orderDrafts ?? 0} order drafts, ${payload?.voiceOrderConsole?.externalRequired?.length ?? 0} external gates.`,
        voiceOrderConsole: payload?.voiceOrderConsole || previous.voiceOrderConsole,
        customerDemandGateway: payload?.customerDemandGateway || previous.customerDemandGateway,
        commandRoute: payload?.commandRoute || previous.commandRoute,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Voice Order Console is temporarily unavailable.' }));
    }
  };

  const buildProviderLaunchBoard = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building Provider Launch Board...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'provider-launch-board',
          command: restaurantCommand,
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.providerLaunchBoard?.summary?.canClaimExternalAutomation ? 'queued' : 'blocked',
        message: `Provider launch board: ${payload?.providerLaunchBoard?.summary?.capabilities ?? 0} capabilities, ${payload?.providerLaunchBoard?.summary?.readyToSandbox ?? 0} sandbox-ready, ${payload?.providerLaunchBoard?.summary?.missingProvider ?? 0} missing-provider.`,
        providerLaunchBoard: payload?.providerLaunchBoard || previous.providerLaunchBoard,
        customerDemandGateway: payload?.customerDemandGateway || previous.customerDemandGateway,
        voiceOrderConsole: payload?.voiceOrderConsole || previous.voiceOrderConsole,
        commandRoute: payload?.commandRoute || previous.commandRoute,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Provider Launch Board is temporarily unavailable.' }));
    }
  };

  const buildMerchantActivationPacket = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building Merchant Activation Packet...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'merchant-activation-packet',
          command: restaurantCommand,
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.merchantActivationPacket?.summary?.canClaimExternalAutomation ? 'queued' : 'blocked',
        message: `Merchant Activation Packet: ${payload?.merchantActivationPacket?.verdict || 'unknown'}; asks ${payload?.merchantActivationPacket?.summary?.providerKeys ?? 0} keys, ${payload?.merchantActivationPacket?.summary?.merchantApprovals ?? 0} approvals, ${payload?.merchantActivationPacket?.summary?.dataContracts ?? 0} data contracts.`,
        merchantActivationPacket: payload?.merchantActivationPacket || previous.merchantActivationPacket,
        providerLaunchBoard: payload?.providerLaunchBoard || previous.providerLaunchBoard,
        providerSetupWizard: payload?.providerSetupWizard || previous.providerSetupWizard,
        providerUnlockLadder: payload?.providerUnlockLadder || previous.providerUnlockLadder,
        customerDemandGateway: payload?.customerDemandGateway || previous.customerDemandGateway,
        voiceOrderConsole: payload?.voiceOrderConsole || previous.voiceOrderConsole,
        commandRoute: payload?.commandRoute || previous.commandRoute,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Merchant Activation Packet is temporarily unavailable.' }));
    }
  };

  const buildAiConsultantCopilot = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building Restaurant AI Consultant Copilot...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ai-consultant-copilot',
          command: restaurantCommand,
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.aiConsultantCopilot?.summary?.canClaimAutonomousOutcome ? 'queued' : 'blocked',
        message: `AI consultant: ${payload?.aiConsultantCopilot?.mode || 'unknown'} mode, ${payload?.aiConsultantCopilot?.summary?.actionPlays ?? 0} plays, ${payload?.aiConsultantCopilot?.summary?.providerGated ?? 0} provider-gated.`,
        aiConsultantCopilot: payload?.aiConsultantCopilot || previous.aiConsultantCopilot,
        customerDemandGateway: payload?.customerDemandGateway || previous.customerDemandGateway,
        voiceOrderConsole: payload?.voiceOrderConsole || previous.voiceOrderConsole,
        providerLaunchBoard: payload?.providerLaunchBoard || previous.providerLaunchBoard,
        commandRoute: payload?.commandRoute || previous.commandRoute,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Restaurant AI Consultant Copilot is temporarily unavailable.' }));
    }
  };

  const buildStoreOperatingPlan = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building Store Operating Plan...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'store-operating-plan',
          command: restaurantCommand,
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.storeOperatingPlan?.summary?.canRunTodayInternally ? 'queued' : 'blocked',
        message: `Store operating plan: ${payload?.storeOperatingPlan?.summary?.timeBlocks ?? 0} time blocks, ${payload?.storeOperatingPlan?.summary?.readyInternal ?? 0} internal-ready, ${payload?.storeOperatingPlan?.summary?.providerGated ?? 0} provider-gated.`,
        storeOperatingPlan: payload?.storeOperatingPlan || previous.storeOperatingPlan,
        aiConsultantCopilot: payload?.aiConsultantCopilot || previous.aiConsultantCopilot,
        customerDemandGateway: payload?.customerDemandGateway || previous.customerDemandGateway,
        voiceOrderConsole: payload?.voiceOrderConsole || previous.voiceOrderConsole,
        providerLaunchBoard: payload?.providerLaunchBoard || previous.providerLaunchBoard,
        dayZeroMissionPack: payload?.dayZeroMissionPack || previous.dayZeroMissionPack,
        commandRoute: payload?.commandRoute || previous.commandRoute,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Store Operating Plan is temporarily unavailable.' }));
    }
  };

  const buildAiCockpit = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: 'Building Restaurant AI Cockpit...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ai-cockpit',
          command: restaurantCommand,
          restaurant: runtimeIntake.restaurant,
          offer: runtimeIntake.offer,
          audience: runtimeIntake.audience,
          channels: runtimeIntake.channels,
          visitReason: runtimeIntake.visitReason,
          constraints: runtimeIntake.constraints,
          evidence: runtimeIntake.evidence,
        }),
      });
      const payload = await response.json();
      setDispatchState(previous => ({
        ...previous,
        status: payload?.aiCockpit?.summary?.canClaimAutomation ? 'queued' : 'blocked',
        message: `AI Cockpit: ${payload?.aiCockpit?.summary?.zones ?? 0} zones, ${payload?.aiCockpit?.summary?.readyInternal ?? 0} internal-ready, ${payload?.aiCockpit?.summary?.providerGated ?? 0} provider-gated.`,
        aiCockpit: payload?.aiCockpit || previous.aiCockpit,
        storeOperatingPlan: payload?.storeOperatingPlan || previous.storeOperatingPlan,
        aiConsultantCopilot: payload?.aiConsultantCopilot || previous.aiConsultantCopilot,
        customerDemandGateway: payload?.customerDemandGateway || previous.customerDemandGateway,
        voiceOrderConsole: payload?.voiceOrderConsole || previous.voiceOrderConsole,
        providerLaunchBoard: payload?.providerLaunchBoard || previous.providerLaunchBoard,
        dayZeroMissionPack: payload?.dayZeroMissionPack || previous.dayZeroMissionPack,
        commandRoute: payload?.commandRoute || previous.commandRoute,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: 'Restaurant AI Cockpit is temporarily unavailable.' }));
    }
  };

  const commandMode =
    dispatchState.commandCenter?.mode ||
    dispatchState.executionTimeline?.mode ||
    dispatchState.controlledTrialRun?.verdict ||
    dispatchState.externalExecutionWizard?.verdict ||
    (dispatchState.status === 'idle' ? 'ready-for-trial' : dispatchState.status);
  const commandNextAction =
    dispatchState.commandCenter?.nextAction ||
    dispatchState.executionTimeline?.items[0]?.nextAction ||
    dispatchState.controlledTrialRun?.operatorCloseout[0]?.action ||
    dispatchState.externalExecutionWizard?.steps.find(step => step.status !== 'ready')?.nextAction ||
    '先跑一次受控试跑，生成回执、经营信号、负责人和下一步动作。';
  const commandProviderGates =
    dispatchState.commandCenter?.summary.providerGates ??
    dispatchState.providerSetupPack?.summary.missing ??
    dispatchState.externalExecutionWizard?.summary.missingProviderGates ??
    capabilityPlan.summary.externalRequired;
  const commandAcceptedReceipts =
    dispatchState.commandCenter?.summary.acceptedReceipts ??
    dispatchState.executionTimeline?.summary.acceptedReceipts ??
    dispatchState.opsConsole?.summary.acceptedReceipts ??
    (dispatchState.controlledTrialRun?.simulation.receipt.status === 'accepted' ? 1 : 0);
  const commandEvidence =
    dispatchState.commandCenter?.currentEvidence ||
    dispatchState.executionTimeline?.items[0]?.evidence[0] ||
    dispatchState.controlledTrialRun?.simulation.receipt.evidenceUrl ||
    dispatchState.controlledTrialRun?.simulation.receipt.screenshotId ||
    '本地 simulator 会先产出签名回执；真实外部执行需要 Provider、账号授权和数据合同。';

  const commandFollowupTasks =
    dispatchState.commandCenter?.storeManagerFollowup.tasks ||
    dispatchState.storeManagerFollowup?.tasks ||
    [];
  const commandFollowupSummary =
    dispatchState.commandCenter?.storeManagerFollowup.summary ||
    dispatchState.storeManagerFollowup?.summary;
  const commandTaskQueue =
    dispatchState.commandCenter?.storeManagerTaskQueue ||
    dispatchState.storeManagerTaskQueue;
  const commandTaskWatcher =
    dispatchState.commandCenter?.storeManagerTaskWatcher ||
    dispatchState.storeManagerTaskWatcher;
  const commandStaffNotificationHandoff =
    dispatchState.commandCenter?.staffNotificationHandoff ||
    dispatchState.staffNotificationHandoff;
  const commandStaffNotificationDeliveryBridge =
    dispatchState.commandCenter?.staffNotificationDeliveryBridge ||
    dispatchState.staffNotificationDeliveryBridge;
  const commandStaffNotificationAuditLog =
    dispatchState.commandCenter?.staffNotificationAuditLog ||
    dispatchState.staffNotificationAuditLog;
  const commandTaskProviderHandoff =
    dispatchState.commandCenter?.taskProviderHandoff ||
    dispatchState.taskProviderHandoff;
  const commandProviderSetupPack =
    dispatchState.commandCenter?.providerSetup ||
    dispatchState.providerSetupPack;
  const commandExternalUnlockRequestPack = dispatchState.externalUnlockRequestPack;
  const commandProviderReceiptInbox = dispatchState.providerReceiptInbox;
  const commandProviderSandboxContract = dispatchState.providerSandboxContract;
  const commandProviderLaunchBoard = dispatchState.providerLaunchBoard;
  const commandMerchantActivationPacket = dispatchState.merchantActivationPacket;
  const commandAiConsultantCopilot = dispatchState.aiConsultantCopilot;
  const commandStoreOperatingPlan = dispatchState.storeOperatingPlan;
  const commandAiCockpit = dispatchState.aiCockpit;
  const commandFirstForwardableRunPack = dispatchState.firstForwardableRunPack;
  const commandFirstRunControlTower = dispatchState.firstRunControlTower;
  const commandPostRunReviewPack = dispatchState.postRunReviewPack;
  const commandNextLoopChannelPlan = dispatchState.nextLoopChannelPlan;
  const commandProviderLaunchTrainingPack = dispatchState.providerLaunchTrainingPack;
  const commandPlatformConnectorMatrix = dispatchState.platformConnectorMatrix;
  const commandAiOsAuditReport = dispatchState.aiOsAuditReport;
  const commandAiEmployeeInbox =
    dispatchState.commandCenter?.aiEmployeeInbox ||
    dispatchState.aiEmployeeInbox;
  const commandChannelHub =
    dispatchState.commandCenter?.channelHub ||
    dispatchState.channelHub;
  const commandPublicIntelligenceBrief =
    dispatchState.commandCenter?.publicIntelligenceBrief ||
    dispatchState.publicIntelligenceBrief;
  const commandProviderSetupWizard =
    dispatchState.commandCenter?.providerSetupWizard ||
    dispatchState.providerSetupWizard;
  const commandProviderSetupState =
    dispatchState.commandCenter?.providerSetupState ||
    dispatchState.providerSetupState;
  const commandProviderReadinessHealth =
    dispatchState.commandCenter?.providerReadinessHealth ||
    dispatchState.providerReadinessHealth;
  const commandProviderUnlockLadder =
    dispatchState.commandCenter?.providerUnlockLadder ||
    dispatchState.providerUnlockLadder;
  const commandGmCommandDeck =
    dispatchState.commandCenter?.gmCommandDeck ||
    dispatchState.gmCommandDeck || {
      payloadShape: 'restaurant-gm-command-deck-v1',
      shiftMode: 'pre-open',
      answerForOwner: 'Use the internal AI store-manager loop first; Provider keys and merchant grants unlock external automation later.',
      summary: {
        lanes: 5,
        aiCanRunInternal: 1,
        staffReview: 2,
        providerRequired: 1,
        evidenceRequired: 1,
        canRunWithoutProvider: true,
        canClaimExternalAutomation: false,
      },
      lanes: [
        {
          id: 'opening',
          title: 'Open-shift command',
          status: 'ai-can-run-internal',
          owner: 'ai-employee',
          customerPromise: 'Confirm offer, owner, service window and proof before pushing traffic.',
          actionNow: 'Build the morning brief, task owners and stop line.',
          visibleProof: 'store facts, offer, service window',
          providerAsk: 'staff delivery channel for autonomous follow-up',
          stopLine: 'No external account action without merchant authorization.',
        },
        {
          id: 'demand',
          title: 'Demand and lead capture',
          status: 'staff-review',
          owner: 'store-manager',
          customerPromise: 'Turn reservations, coupon claims and visit intent into owner-visible follow-up.',
          actionNow: 'Classify imported demand signals and assign manager tasks.',
          visibleProof: 'accepted proof or imported lead aggregate',
          providerAsk: 'platform inbox/export permission',
          stopLine: 'No private-message scraping or customer identifiers.',
        },
        {
          id: 'publish-proof',
          title: 'Publish and proof',
          status: 'provider-required',
          owner: 'ops',
          customerPromise: 'Close every channel action with public proof or signed receipt.',
          actionNow: 'Prepare one governed channel package.',
          visibleProof: 'public link, screenshot id or callback receipt',
          providerAsk: 'merchant platform authorization and callback secret',
          stopLine: 'No auto-publish claim before Provider health is ready.',
        },
        {
          id: 'service-window',
          title: 'Service window watch',
          status: 'staff-review',
          owner: 'store-manager',
          customerPromise: 'Watch stock, coupon pressure and service risk as tasks.',
          actionNow: 'Review coupon pressure and recovery queue.',
          visibleProof: 'coupon rule screenshot and staff acknowledgement',
          providerAsk: 'POS/coupon aggregate contract',
          stopLine: 'No POS write, payment, delivery or coupon mutation.',
        },
        {
          id: 'closeout',
          title: 'Closeout and next loop',
          status: 'evidence-required',
          owner: 'finance',
          customerPromise: 'End the day with measured evidence and tomorrow actions.',
          actionNow: 'Separate public proof, lead counts and redemption aggregate.',
          visibleProof: 'sanitized POS/coupon/member aggregate',
          providerAsk: 'aggregate field dictionary',
          stopLine: 'No operating-analysis claim without accepted data proof.',
        },
      ],
      aiAutopilotQueue: ['Open-shift command: Build the morning brief, task owners and stop line.'],
      staffQueue: ['Demand and lead capture: accepted proof or imported lead aggregate', 'Service window watch: coupon rule screenshot and staff acknowledgement'],
      providerQueue: ['Publish and proof: merchant platform authorization and callback secret'],
      evidenceQueue: ['Closeout and next loop: sanitized POS/coupon/member aggregate'],
      safetyBoundary: 'GM Command Deck preview does not log in, publish, scrape private messages, redeem coupons, write POS orders, expose secrets or claim growth without accepted proof.',
    } satisfies Pick<RestaurantGmCommandDeck, 'payloadShape' | 'shiftMode' | 'answerForOwner' | 'summary' | 'lanes' | 'aiAutopilotQueue' | 'staffQueue' | 'providerQueue' | 'evidenceQueue' | 'safetyBoundary'>;
  const commandShiftAutopilot =
    dispatchState.commandCenter?.shiftAutopilot ||
    dispatchState.shiftAutopilot || {
      payloadShape: 'restaurant-shift-autopilot-v1',
      summary: {
        steps: 5,
        dueNow: 2,
        internalRunnable: 1,
        manualPrep: 2,
        providerBlocked: 1,
        evidenceBlocked: 1,
        nextWakeups: 5,
        canRunNowWithoutProvider: true,
        canClaimExternalAutomation: false,
      },
      steps: commandGmCommandDeck.lanes.map(lane => ({
        id: `preview-${lane.id}`,
        laneId: lane.id,
        title: lane.title,
        mode: lane.status === 'provider-required' ? 'wait-provider' : lane.status === 'evidence-required' ? 'collect-evidence' : lane.status === 'staff-review' ? 'prepare-manual' : 'run-internal',
        dueNow: lane.status !== 'provider-required',
        owner: lane.owner,
        trigger: lane.customerPromise,
        action: lane.actionNow,
        proofRequired: [lane.visibleProof],
        providerRequired: lane.status === 'provider-required' ? [lane.providerAsk] : [],
        nextWakeup: lane.id === 'opening' ? '09:30 local' : lane.id === 'closeout' ? '22:30 local' : 'every 60 minutes',
        stopLine: lane.stopLine,
      })),
      nowQueue: commandGmCommandDeck.aiAutopilotQueue,
      nextWakeups: ['Open-shift command: 09:30 local', 'Runtime and inbox heartbeat: every 60 minutes', 'Closeout and next loop: 22:30 local'],
      providerQueue: commandGmCommandDeck.providerQueue,
      evidenceQueue: commandGmCommandDeck.evidenceQueue,
      operatingPolicy: [
        'Run internal planning, staff review and proof preparation without Provider keys.',
        'Hold external automation claims until provider health and accepted proof exist.',
      ],
      safetyBoundary: 'Shift Autopilot preview builds a bounded shift plan only; it does not run forever, publish, contact customers, redeem coupons, write POS orders or expose secrets.',
    } satisfies Pick<RestaurantShiftAutopilot, 'payloadShape' | 'summary' | 'steps' | 'nowQueue' | 'nextWakeups' | 'providerQueue' | 'evidenceQueue' | 'operatingPolicy' | 'safetyBoundary'>;
  const commandShiftAutopilotRun = dispatchState.shiftAutopilotRun;
  const commandShiftCapabilityActivationPack = dispatchState.shiftCapabilityActivationPack;
  const commandShiftCloseoutTrainingPack = dispatchState.shiftCloseoutTrainingPack;
  const commandShiftCloseoutTrainingRecordAttempt = dispatchState.shiftCloseoutTrainingRecordAttempt;
  const commandShiftFirstForwardableRun = dispatchState.shiftFirstForwardableRun;
  const commandShiftOperatingLoopPack = dispatchState.shiftOperatingLoopPack;
  const commandShiftProviderHandoff = dispatchState.shiftProviderHandoff;
  const commandShiftSandboxAcceptance = dispatchState.shiftSandboxAcceptance;
  const commandShiftSandboxForwardAttempt = dispatchState.shiftSandboxForwardAttempt;
  const commandChannelDeliveryReport = dispatchState.commandCenter?.channelDeliveryReport || dispatchState.channelDeliveryReport;
  const commandChannelDeliveryAttempt = dispatchState.channelDeliveryAttempt;
  const commandChannelScheduleRun = dispatchState.channelScheduleRun;
  const commandChannelAttempts =
    dispatchState.commandCenter?.summary.channelDeliveryAttempts ??
    commandChannelDeliveryReport?.summary.total ??
    0;
  const commandChannelBlocked =
    dispatchState.commandCenter?.summary.channelDeliveryBlocked ??
    ((commandChannelDeliveryReport?.summary.blocked ?? 0) + (commandChannelDeliveryReport?.summary.failed ?? 0));
  const commandChannelRecovery =
    dispatchState.commandCenter?.summary.channelDeliveryRetryRecommended ??
    commandChannelScheduleRun?.summary.retryRecommended ??
    0;
  const commandChannelAcknowledged =
    dispatchState.commandCenter?.summary.channelDeliveryAcknowledged ??
    commandChannelDeliveryReport?.summary.acknowledged ??
    0;
  const commandBenchmarkStrategy =
    dispatchState.commandCenter?.benchmarkStrategy ||
    dispatchState.benchmarkStrategy ||
    initialBenchmarkStrategy;
  const commandActivationCockpit =
    dispatchState.commandCenter?.activationCockpit ||
    dispatchState.activationCockpit;
  const commandClawSkillWorkbench =
    dispatchState.commandCenter?.clawSkillWorkbench ||
    dispatchState.clawSkillWorkbench;
  const commandClawSkillExecutionLedger =
    dispatchState.commandCenter?.clawSkillExecutionLedger ||
    dispatchState.clawSkillExecutionLedger;
  const commandRoute = dispatchState.commandRoute;
  const commandAiEmployeeMemoryPack = dispatchState.aiEmployeeMemoryPack;
  const commandCustomerDemandGateway = dispatchState.customerDemandGateway;
  const commandVoiceOrderConsole = dispatchState.voiceOrderConsole;
  const commandCockpitZones = commandAiCockpit?.zones || [
    {
      id: 'today-operations',
      title: 'Today Operations',
      status: 'ready-internal',
      answer: '把今天的门店目标、主推套餐、服务窗口、负责人和可验收证据排成一张试跑工单。',
      primaryAction: '先生成受控试跑，再看 Execution Timeline。',
      visibleProof: ['门店资料', '主推套餐', '服务窗口'],
      providerGate: 'none for internal planning',
    },
    {
      id: 'ai-consultant',
      title: 'AI Consultant',
      status: 'needs-evidence',
      answer: '把店长问题转成菜品卖点、到店理由、内容动作和运营建议，但每条建议都带负责人和证据要求。',
      primaryAction: '补齐菜单、活动、渠道和约束后生成顾问方案。',
      visibleProof: ['菜单截图', '活动口径', '渠道限制'],
      providerGate: 'provider proof for external data',
    },
    {
      id: 'automation-launch',
      title: 'Automation Launch',
      status: 'provider-gated',
      answer: '自动发布、自动获客、自动核销和真实经营分析需要商户授权、平台回调、浏览器会话或 POS/券码数据合同。',
      primaryAction: '先跑 Provider Setup Pack，拿到 key、grant、callback 和 stop line。',
      visibleProof: ['provider health', 'merchant grant', 'signed callback'],
      providerGate: 'keys / grants / browser session / callback',
    },
    {
      id: 'evidence-review',
      title: 'Evidence Review',
      status: 'needs-evidence',
      answer: '所有结果只看公开链接、截图回执、签名回调或脱敏经营聚合，不展示私信、手机号、券码或原始 POS 行。',
      primaryAction: '导入回执或脱敏汇总后，生成下一轮门店动作。',
      visibleProof: ['发布链接', '截图回执', '脱敏 POS 汇总'],
      providerGate: 'aggregate field dictionary',
    },
  ];
  const commandCockpitSummary = commandAiCockpit?.summary || {
    zones: commandCockpitZones.length,
    readyInternal: commandCockpitZones.filter(zone => zone.status === 'ready-internal').length,
    providerGated: commandCockpitZones.filter(zone => zone.status === 'provider-gated').length,
    canClaimAutomation: false,
  };
  const competitorParityLanes = [
    {
      title: 'Persistent Browser Agent',
      internal: '能生成隔离浏览器 session manifest、runbook、回调合同和失败恢复队列。',
      external: '需要真实浏览器 profile、商户授权 grant、平台登录态和停止条件。',
      status: 'provider-gated',
    },
    {
      title: 'Auto Publish',
      internal: '能生成大众点评/小红书/抖音/微信社群发布包、验收清单和截图回执要求。',
      external: '需要平台账号授权、发布 API 或受控浏览器执行器回执。',
      status: 'provider-gated',
    },
    {
      title: 'Auto Lead Capture',
      internal: '能把预约、领券、私信咨询、到店意向整理成店长任务和社群跟进话术。',
      external: '需要私域/社群/平台消息回调；未授权时不读取私信和手机号。',
      status: 'provider-gated',
    },
    {
      title: 'Coupon Redemption',
      internal: '能校验脱敏券码/核销/POS 聚合字段，生成核销异常和复盘动作。',
      external: '需要团购券、POS、会员或收银系统数据合同，不能写回生产系统。',
      status: 'provider-gated',
    },
    {
      title: 'Business Analysis',
      internal: '能基于公开回执、手工导入和脱敏汇总做经营信号、备货和下一轮计划。',
      external: '需要真实订单、库存、毛利、核销、会员复购的脱敏聚合导入。',
      status: 'ready-internal',
    },
    {
      title: 'Memory Follow-up',
      internal: '能沉淀门店偏好、负责人、证据、失败原因和下一次执行计划。',
      external: '需要员工通知通道、日程权限或企业微信/飞书/短信 Provider。',
      status: 'ready-internal',
    },
  ];
  const residentEmployeeLoop = [
    {
      title: 'Morning Brief',
      status: commandTaskWatcher?.summary.blocked ? 'needs-owner' : 'ready-internal',
      owner: '店长 / 运营',
      action: '开店前检查昨日回执、阻断任务、Provider 缺口和今日主推套餐。',
      proof: commandTaskWatcher
        ? `${commandTaskWatcher.summary.blocked} blocked / ${commandTaskWatcher.summary.wakeups} wakeups`
        : '等待生成任务队列或运行 Heartbeat',
    },
    {
      title: 'Service Window Watch',
      status: dispatchState.heartbeat?.watcherPolicy?.summary.highPriority ? 'needs-owner' : 'ready-internal',
      owner: '常驻 AI 员工',
      action: '服务中监听发布回执、预约/领券/到店意向、浏览器 session 和外部失败恢复。',
      proof: dispatchState.heartbeat
        ? `${dispatchState.heartbeat.followups.length} followups / ${dispatchState.heartbeat.watcherPolicy?.summary.armed ?? 0} watcher lanes`
        : '未运行 Heartbeat',
    },
    {
      title: 'Closeout Memory',
      status: dispatchState.heartbeat?.acceptedReceipts ? 'ready-internal' : 'needs-evidence',
      owner: '运营 / 数据',
      action: '收盘后只把 accepted 回执和脱敏经营摘要写入门店记忆，生成下一轮动作。',
      proof: dispatchState.heartbeat
        ? `${dispatchState.heartbeat.acceptedReceipts ?? 0} accepted receipts / ${dispatchState.heartbeat.watcherPolicy?.summary.memoryUpserts ?? 0} memory upserts`
        : '需要回执或手工导入',
    },
    {
      title: 'Channel Follow-up',
      status: commandChannelHub?.summary.missingExternalItems ? 'provider-gated' : 'ready-internal',
      owner: '社群 / 店长',
      action: '把店长跟进、社群提醒、员工通知和到期任务变成可审计 channel job。',
      proof: commandChannelHub
        ? `${commandChannelHub.summary.channels} channels / ${commandChannelHub.summary.scheduledJobs} jobs`
        : '等待 Build Channel Hub',
    },
  ];

  return (
    <section className="border border-stone-200 bg-white p-5 shadow-sm" id="restaurant-agent-runtime">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Agent Runtime Layer</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">餐饮执行底座：能排队、能记忆、能交给浏览器执行器</h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            当前先把竞品级 Agent 的执行结构落到本地：发布检查、核销复盘、线索跟进和门店记忆都进入任务队列。
            未接 runtime/账号前不执行外部动作，也不声称已经自动发布、自动核销或读取平台经营数据。
          </p>
        </div>
        <div className="grid min-w-[260px] grid-cols-3 gap-2 text-center">
          <div className="border border-stone-200 bg-[#fbfaf7] p-3">
            <div className="text-2xl font-black text-stone-950">{runtime.summary.internalReady}</div>
            <div className="mt-1 text-[11px] font-semibold text-stone-500">内部可跑</div>
          </div>
          <div className="border border-stone-200 bg-[#fbfaf7] p-3">
            <div className="text-2xl font-black text-stone-950">{runtime.summary.externalBlocked}</div>
            <div className="mt-1 text-[11px] font-semibold text-stone-500">外部待接</div>
          </div>
          <div className="border border-stone-200 bg-[#fbfaf7] p-3">
            <div className="text-2xl font-black text-stone-950">{runtime.references.length}</div>
            <div className="mt-1 text-[11px] font-semibold text-stone-500">可接框架</div>
          </div>
        </div>
      </div>

      <div className="mt-5 border border-stone-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Competitor Parity Map</p>
            <h3 className="mt-1 text-lg font-black text-stone-950">竞品能力覆盖：Lobu / OpenClaw / Hermes / 餐饮 SaaS</h3>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-stone-600">
              目标不是把外部账号假装接上，而是把竞品的运行时结构都拆进产品：事件、记忆、watcher、浏览器、工具权限、回执和恢复。
            </p>
          </div>
          <div className="grid min-w-[280px] grid-cols-3 gap-2 text-center text-xs">
            <div className="border border-stone-200 bg-[#fbfaf7] p-2">
              <div className="text-xl font-black text-stone-950">{capabilityPlan.summary.internalReady}</div>
              <div className="mt-1 font-semibold text-stone-500">已内建</div>
            </div>
            <div className="border border-stone-200 bg-[#fbfaf7] p-2">
              <div className="text-xl font-black text-stone-950">{capabilityPlan.summary.bridgeReady}</div>
              <div className="mt-1 font-semibold text-stone-500">已桥接</div>
            </div>
            <div className="border border-stone-200 bg-[#fbfaf7] p-2">
              <div className="text-xl font-black text-stone-950">{capabilityPlan.summary.externalRequired}</div>
              <div className="mt-1 font-semibold text-stone-500">需外部</div>
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-4">
          {capabilityPlan.capabilities.map(item => (
            <article className="border border-stone-200 bg-[#fbfaf7] p-3" key={item.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold text-stone-500">{item.competitorPattern}</div>
                  <h4 className="mt-1 text-sm font-black text-stone-950">{item.name}</h4>
                </div>
                <span className={`shrink-0 border px-2 py-1 text-[10px] font-black ${capabilityStatusTone[item.status]}`}>
                  {capabilityStatusLabel[item.status]}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-stone-600">{item.productMeaning}</p>
              <p className="mt-2 text-[11px] leading-5 text-stone-500">{item.internalImplementation}</p>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-4 xl:grid-cols-10">
        {[browserConnector, memoryConnector, queueConnector, lobuConnector, ledgerConnector, callbackConnector, recoveryConnector, browserSessionConnector, browserRunbookConnector, browserRunnerContractConnector, browserRunnerEventConnector, grantConnector, grantChecklistConnector, activationGatesConnector, competitorAuditConnector, buildQueueConnector, executionPackageConnector, callbackSimulatorConnector, runHealthConnector, runtimeProbeConnector, runtimeSetupConnector, posImportConnector, publicProfileConnector, opsConsoleConnector].filter(Boolean).map(connector => (
          <article className="border border-stone-200 bg-[#fbfaf7] p-4" key={connector!.id}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-black text-stone-950">{connector!.name}</h3>
              <span className={`shrink-0 border px-2 py-1 text-[10px] font-black ${statusTone[connector!.status]}`}>{statusLabel[connector!.status]}</span>
            </div>
            <p className="mt-3 text-xs leading-5 text-stone-600">{connector!.capability}</p>
            <p className="mt-3 border-l-2 border-stone-300 pl-3 text-[11px] leading-5 text-stone-500">{connector!.auditBoundary}</p>
          </article>
        ))}
      </div>

      <div className="mt-5 border border-stone-200 bg-stone-950 p-4 text-white">
        <div className="mb-4 border border-amber-200/30 bg-[#14120d] p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-stretch xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">Agent Command Center</p>
              <h3 className="mt-1 text-xl font-black">主控台：先跑受控试单，再看时间线和外部缺口</h3>
              <p className="mt-2 text-xs leading-5 text-white/65">
                这里是客户试用时的主路径：把门店资料转成一个可验收的试跑，随后用 Execution Timeline 看回执、跟进、经营信号和下一步。底层工具仍保留，但不让客户在诊断按钮里迷路。
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-4 xl:min-w-[640px]">
              <div className="border border-white/10 bg-white/[0.06] p-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">mode</div>
                <div className="mt-1 truncate font-mono text-sm font-black text-white" title={commandMode}>{commandMode}</div>
              </div>
              <div className="border border-white/10 bg-white/[0.06] p-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">accepted receipts</div>
                <div className="mt-1 font-mono text-sm font-black text-white">{commandAcceptedReceipts}</div>
              </div>
              <div className="border border-white/10 bg-white/[0.06] p-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">provider gates</div>
                <div className="mt-1 font-mono text-sm font-black text-white">{commandProviderGates}</div>
              </div>
              <div className="border border-white/10 bg-white/[0.06] p-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">channel recovery</div>
                <div className="mt-1 font-mono text-sm font-black text-white">{commandChannelRecovery}</div>
                <div className="mt-1 text-[10px] text-white/35">{commandChannelAttempts} attempts / {commandChannelBlocked} blocked / {commandChannelAcknowledged} ack</div>
              </div>
            </div>
          </div>
          <div className="mt-4 border border-amber-200/25 bg-amber-200/[0.05] p-3">
            {dispatchState.residentAgentMissionControl ? (
              <div className="mb-4 border border-emerald-200/30 bg-emerald-200/[0.06] p-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/75">Resident Agent Mission Control</div>
                    <h4 className="mt-1 text-base font-black text-white">{dispatchState.residentAgentMissionControl.mode} / {dispatchState.residentAgentMissionControl.primaryAction.label}</h4>
                    <p className="mt-1 text-xs leading-5 text-white/60">{dispatchState.residentAgentMissionControl.answerForMerchant}</p>
                  </div>
                  <div className="grid min-w-[280px] grid-cols-3 gap-2 text-xs">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{dispatchState.residentAgentMissionControl.summary.readyLanes}/{dispatchState.residentAgentMissionControl.summary.lanes}</div>
                      <p className="mt-1 text-white/55">ready lanes</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{dispatchState.residentAgentMissionControl.summary.externalGates}</div>
                      <p className="mt-1 text-white/55">external gates</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{dispatchState.residentAgentMissionControl.summary.canRunExternalBrowser ? 'yes' : 'no'}</div>
                      <p className="mt-1 text-white/55">browser run</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {dispatchState.residentAgentMissionControl.lanes.map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={item.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{item.id}</span>
                        <span>{item.status} / {item.owner}</span>
                      </div>
                      <p className="mt-1 text-white/60">{item.promise}</p>
                      <p className="mt-1 text-white/45">{item.nextAction}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    primary: {dispatchState.residentAgentMissionControl.primaryAction.reason} / evidence: {dispatchState.residentAgentMissionControl.primaryAction.evidenceRequired}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.residentAgentMissionControl.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.competitorTrainingBlueprint ? (
              <div className="mb-4 border border-cyan-200/30 bg-cyan-200/[0.06] p-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/75">Competitor Training Blueprint</div>
                    <h4 className="mt-1 text-base font-black text-white">{dispatchState.competitorTrainingBlueprint.verdict} / parity blocked</h4>
                    <p className="mt-1 text-xs leading-5 text-white/60">
                      Maps Claw/Cloud-style abilities into internal training, acceptance proof and provider contracts before any auto-publish, lead capture, redemption or POS analytics claim.
                    </p>
                  </div>
                  <div className="grid min-w-[360px] grid-cols-4 gap-2 text-xs">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{dispatchState.competitorTrainingBlueprint.summary.internalReady}</div>
                      <p className="mt-1 text-white/55">internal</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{dispatchState.competitorTrainingBlueprint.summary.trainableNow}</div>
                      <p className="mt-1 text-white/55">train now</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{dispatchState.competitorTrainingBlueprint.summary.providerContracts}</div>
                      <p className="mt-1 text-white/55">providers</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{dispatchState.competitorTrainingBlueprint.summary.canClaimCompetitorParity ? 'yes' : 'no'}</div>
                      <p className="mt-1 text-white/55">parity</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {dispatchState.competitorTrainingBlueprint.lanes.slice(0, 6).map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={item.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{item.title}</span>
                        <span>{item.currentStatus} / {item.owner}</span>
                      </div>
                      <p className="mt-1 text-white/60">{item.targetState}</p>
                      <p className="mt-1 text-white/45">{item.nextAction}</p>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-cyan-100/60">acceptance</p>
                      <p className="mt-1 text-white/45">{item.acceptanceEvidence.join(' / ')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    internal backlog: {dispatchState.competitorTrainingBlueprint.internalTrainingBacklog.slice(0, 3).map(item => item.material).join(' / ') || 'none'}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    provider backlog: {dispatchState.competitorTrainingBlueprint.providerContractBacklog.slice(0, 3).map(item => item.provider).join(' / ') || 'none'}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.competitorTrainingBlueprint.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">AI employee command router</div>
                <h4 className="mt-1 text-base font-black text-white">一句门店指令到内部动作 / 证据 / Provider 门槛</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  输入店长会真的说的话，系统只做可审计路由：能内部生成的先生成，需要截图、链接、POS 聚合或商户授权的会拆成证据要求，不会把私信、核销、发布和经营分析伪装成已自动完成。
                </p>
                <textarea
                  className="mt-3 h-24 w-full resize-none border border-white/15 bg-stone-950/80 p-3 text-xs leading-5 text-white outline-none transition placeholder:text-white/25 focus:border-amber-200/60"
                  onChange={event => setRestaurantCommand(event.target.value)}
                  value={restaurantCommand}
                />
              </div>
              <div className="w-full xl:w-[360px]">
                <button
                  className="w-full border border-amber-200 bg-amber-200 px-3 py-3 text-sm font-black text-stone-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={dispatchState.status === 'loading'}
                  onClick={buildAiCockpit}
                  type="button"
                >
                  AI Cockpit
                </button>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    className="border border-amber-200/70 px-3 py-2 text-sm font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={dispatchState.status === 'loading'}
                    onClick={routeRestaurantCommand}
                    type="button"
                  >
                    Route Command
                  </button>
                  <button
                    className="border border-lime-200/60 px-3 py-2 text-sm font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={dispatchState.status === 'loading'}
                    onClick={buildStoreOperatingPlan}
                    type="button"
                  >
                    Operating Plan
                  </button>
                </div>
                <details className="mt-2 border border-white/10 bg-white/[0.04] p-3">
                  <summary className="cursor-pointer text-xs font-black text-white/75">Advanced cockpit tools</summary>
                  <div className="mt-3 grid gap-2">
                    <button
                      className="w-full border border-violet-200/60 px-3 py-2 text-sm font-black text-violet-100 transition hover:bg-violet-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={buildAiEmployeeMemoryPack}
                      type="button"
                    >
                      Employee Memory
                    </button>
                    <button
                      className="w-full border border-fuchsia-200/60 px-3 py-2 text-sm font-black text-fuchsia-100 transition hover:bg-fuchsia-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={buildAiConsultantCopilot}
                      type="button"
                    >
                      AI Consultant
                    </button>
                    <button
                      className="w-full border border-emerald-200/60 px-3 py-2 text-sm font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={buildCustomerDemandGateway}
                      type="button"
                    >
                      Demand Gateway
                    </button>
                    <button
                      className="w-full border border-sky-200/60 px-3 py-2 text-sm font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={buildVoiceOrderConsole}
                      type="button"
                    >
                      Voice Orders
                    </button>
                    <button
                      className="w-full border border-rose-200/60 px-3 py-2 text-sm font-black text-rose-100 transition hover:bg-rose-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={buildProviderLaunchBoard}
                      type="button"
                    >
                      Launch Board
                    </button>
                    <button
                      className="w-full border border-amber-200/60 px-3 py-2 text-sm font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={buildMerchantActivationPacket}
                      type="button"
                    >
                      Merchant Activation Packet
                    </button>
                    <button
                      className="w-full border border-emerald-200/60 bg-emerald-200/10 px-3 py-2 text-sm font-black text-emerald-100 transition hover:bg-emerald-200/20 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={refreshResidentAgentMissionControl}
                      type="button"
                    >
                      Resident Agent Control
                    </button>
                  </div>
                </details>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                  <button
                    className="border border-white/15 px-2 py-2 text-left text-white/70 transition hover:bg-white/10"
                    onClick={() => setRestaurantCommand(`今晚把 ${runtimeIntake.offer} 做成大众点评和小红书可发布版本，发完要截图回执。`)}
                    type="button"
                  >
                    发布证明
                  </button>
                  <button
                    className="border border-white/15 px-2 py-2 text-left text-white/70 transition hover:bg-white/10"
                    onClick={() => setRestaurantCommand(`收盘后看 ${runtimeIntake.offer} 的核销、库存和明天备货异常，只能用脱敏汇总。`)}
                    type="button"
                  >
                    经营复盘
                  </button>
                  <button
                    className="border border-white/15 px-2 py-2 text-left text-white/70 transition hover:bg-white/10"
                    onClick={() => setRestaurantCommand(`把今天领券、预约和到店意向整理成店长明天跟进任务，不要导出客户联系方式。`)}
                    type="button"
                  >
                    店长跟进
                  </button>
                  <button
                    className="border border-white/15 px-2 py-2 text-left text-white/70 transition hover:bg-white/10"
                    onClick={() => setRestaurantCommand('接入 OpenClaw/Lobu/Hermes runtime、回调、隔离浏览器和商户授权，告诉我缺哪些 Provider key。')}
                    type="button"
                  >
                    外部接入
                  </button>
                </div>
              </div>
            </div>
            {commandRoute ? (
              <div className="mt-3 grid gap-2 lg:grid-cols-[1.1fr_1fr_1fr]">
                <div className="border border-white/10 bg-white/[0.05] p-3">
                  <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.12em] text-amber-100/70">
                    <span>{commandRoute.payloadShape}</span>
                    <span>{commandRoute.intent}</span>
                    <span>{commandRoute.verdict}</span>
                    <span>{commandRoute.confidence}</span>
                  </div>
                  <p className="mt-2 text-sm font-black text-white">{commandRoute.primaryAction.label}</p>
                  <p className="mt-1 text-xs leading-5 text-white/55">{commandRoute.primaryAction.reason}</p>
                  <p className="mt-2 text-[11px] leading-4 text-white/40">{commandRoute.primaryAction.stopLine}</p>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">extracted evidence</div>
                  <p className="mt-2 text-xs leading-5 text-white/60">
                    channels: {commandRoute.extracted.channels.join(' / ') || 'not specified'}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/60">
                    window: {commandRoute.extracted.serviceWindow || 'not specified'}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/60">
                    evidence: {commandRoute.extracted.evidenceHints.join(' / ') || commandRoute.primaryAction.evidenceRequired.slice(0, 3).join(' / ')}
                  </p>
                  {commandRoute.extracted.forbiddenHints.length ? (
                    <p className="mt-1 text-xs leading-5 text-rose-100/70">blocked: {commandRoute.extracted.forbiddenHints.join(' / ')}</p>
                  ) : null}
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">routed action</div>
                  <p className="mt-2 text-sm font-black text-white">{commandRoute.primaryAction.clientAction}</p>
                  <p className="mt-1 text-xs leading-5 text-white/55">{commandRoute.primaryAction.owner} / {commandRoute.primaryAction.status}</p>
                  <p className="mt-2 text-[11px] leading-4 text-amber-100/60">
                    external: {(commandRoute.externalRequired.length ? commandRoute.externalRequired : ['none for internal routing']).slice(0, 4).join(' / ')}
                  </p>
                  <button
                    className="mt-3 w-full border border-cyan-200/60 px-3 py-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={dispatchState.status === 'loading' || commandRoute.primaryAction.clientAction === 'manual-sanitize'}
                    onClick={runRoutedCommandAction}
                    type="button"
                  >
                    Run Routed Action
                  </button>
                </div>
              </div>
            ) : null}
            <div className="mt-3 border border-amber-200/40 bg-amber-200/[0.06] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">Restaurant AI Cockpit</div>
                    <h4 className="mt-1 text-base font-black text-white">{commandAiCockpit?.payloadShape || 'restaurant-ai-cockpit-preview'}</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      {(commandAiCockpit?.restaurant || runtimeIntake.restaurant)} / {(commandAiCockpit?.offer || runtimeIntake.offer)}: Today Operations, AI Consultant, Automation Launch and Evidence Review in one cockpit.
                    </p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-5 lg:min-w-[620px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiCockpit?.verdict || 'preview-before-run'}</div>
                      <p className="mt-1 text-white/55">verdict</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCockpitSummary.zones}</div>
                      <p className="mt-1 text-white/55">zones</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCockpitSummary.readyInternal}</div>
                      <p className="mt-1 text-white/55">internal</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCockpitSummary.providerGated}</div>
                      <p className="mt-1 text-white/55">provider gated</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCockpitSummary.canClaimAutomation ? 'ready' : 'blocked'}</div>
                      <p className="mt-1 text-white/55">automation claim</p>
                    </div>
                  </div>
                </div>
                {commandGmCommandDeck ? (
                  <div className="mt-3 border border-lime-200/25 bg-lime-200/[0.05] p-3">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/70">GM Command Deck</div>
                        <h4 className="mt-1 text-sm font-black text-white">{commandGmCommandDeck.shiftMode} / {commandGmCommandDeck.payloadShape}</h4>
                        <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">{commandGmCommandDeck.answerForOwner}</p>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandGmCommandDeck.summary.aiCanRunInternal}</div>
                          <p className="mt-1 text-white/55">AI internal</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandGmCommandDeck.summary.staffReview}</div>
                          <p className="mt-1 text-white/55">staff review</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandGmCommandDeck.summary.providerRequired}</div>
                          <p className="mt-1 text-white/55">provider needed</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandGmCommandDeck.summary.evidenceRequired}</div>
                          <p className="mt-1 text-white/55">evidence needed</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandGmCommandDeck.summary.canClaimExternalAutomation ? 'ready' : 'blocked'}</div>
                          <p className="mt-1 text-white/55">external claim</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 lg:grid-cols-5">
                      {commandGmCommandDeck.lanes.map(lane => (
                        <div className="border border-white/10 bg-stone-950/50 p-3" key={lane.id}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-white">{lane.title}</span>
                            <span className={lane.status === 'ai-can-run-internal' ? 'text-[11px] text-emerald-100/70' : lane.status === 'provider-required' ? 'text-[11px] text-amber-100/70' : 'text-[11px] text-lime-100/70'}>
                              {lane.status}
                            </span>
                          </div>
                          <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-white/60">{lane.customerPromise}</p>
                          <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-lime-100/65">now: {lane.actionNow}</p>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/40">proof: {lane.visibleProof}</p>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-amber-100/55">provider: {lane.providerAsk}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid gap-2 lg:grid-cols-3">
                      <div className="border border-white/10 bg-white/[0.04] p-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">AI autopilot queue</div>
                        <p className="mt-1 text-[11px] leading-4 text-emerald-100/65">{commandGmCommandDeck.aiAutopilotQueue.join(' / ') || 'none'}</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.04] p-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">staff queue</div>
                        <p className="mt-1 text-[11px] leading-4 text-lime-100/65">{commandGmCommandDeck.staffQueue.join(' / ') || 'none'}</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.04] p-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">provider queue</div>
                        <p className="mt-1 text-[11px] leading-4 text-amber-100/65">{commandGmCommandDeck.providerQueue.join(' / ') || 'none'}</p>
                      </div>
                    </div>
                    <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{commandGmCommandDeck.safetyBoundary}</p>
                  </div>
                ) : null}
                {commandShiftAutopilot ? (
                  <div className="mt-3 border border-sky-200/25 bg-sky-200/[0.05] p-3">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">Shift Autopilot</div>
                        <h4 className="mt-1 text-sm font-black text-white">{commandShiftAutopilot.payloadShape}</h4>
                        <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                          Turns GM lanes and scheduled channel jobs into a bounded shift queue: what can run internally now, what needs staff review, and what is blocked by Provider proof.
                        </p>
                        <button
                          className="mt-3 border border-sky-200 bg-sky-200 px-3 py-2 text-xs font-black text-stone-950 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildShiftOperatingLoopPack}
                          type="button"
                        >
                          Run Full Shift Loop
                        </button>
                        <button
                          className="ml-2 mt-3 border border-sky-200 bg-sky-200 px-3 py-2 text-xs font-black text-stone-950 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={runShiftAutopilot}
                          type="button"
                        >
                          Run Shift Autopilot
                        </button>
                        <button
                          className="ml-2 mt-3 border border-amber-200/70 px-3 py-2 text-xs font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildShiftProviderHandoff}
                          type="button"
                        >
                          Build Provider Handoff
                        </button>
                        <button
                          className="ml-2 mt-3 border border-lime-200/70 px-3 py-2 text-xs font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildShiftSandboxAcceptance}
                          type="button"
                        >
                          Check Sandbox Acceptance
                        </button>
                        <button
                          className="ml-2 mt-3 border border-orange-200/70 px-3 py-2 text-xs font-black text-orange-100 transition hover:bg-orange-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildShiftFirstForwardableRun}
                          type="button"
                        >
                          Build Shift First Forwardable Run
                        </button>
                        <button
                          className="ml-2 mt-3 border border-rose-200/70 px-3 py-2 text-xs font-black text-rose-100 transition hover:bg-rose-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={forwardShiftSandboxRun}
                          type="button"
                        >
                          Submit Shift Sandbox Run
                        </button>
                        <button
                          className="ml-2 mt-3 border border-violet-200/70 px-3 py-2 text-xs font-black text-violet-100 transition hover:bg-violet-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildShiftCloseoutTrainingPack}
                          type="button"
                        >
                          Closeout + Train
                        </button>
                        <button
                          className="ml-2 mt-3 border border-emerald-200/70 px-3 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={recordShiftCloseoutTraining}
                          type="button"
                        >
                          Record Training
                        </button>
                        <button
                          className="ml-2 mt-3 border border-cyan-200/70 px-3 py-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildShiftCapabilityActivationPack}
                          type="button"
                        >
                          Activation Pack
                        </button>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandShiftAutopilot.summary.dueNow}</div>
                          <p className="mt-1 text-white/55">due now</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandShiftAutopilot.summary.internalRunnable}</div>
                          <p className="mt-1 text-white/55">internal run</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandShiftAutopilot.summary.manualPrep}</div>
                          <p className="mt-1 text-white/55">manual prep</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandShiftAutopilot.summary.providerBlocked}</div>
                          <p className="mt-1 text-white/55">provider held</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandShiftAutopilot.summary.canClaimExternalAutomation ? 'ready' : 'blocked'}</div>
                          <p className="mt-1 text-white/55">external claim</p>
                        </div>
                      </div>
                    </div>
                    {commandShiftOperatingLoopPack ? (
                      <div className="mt-3 border border-emerald-200/25 bg-emerald-200/[0.05] p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">Shift Operating Loop</div>
                            <h5 className="mt-1 text-sm font-black text-white">{commandShiftOperatingLoopPack.verdict}</h5>
                            <p className="mt-1 max-w-3xl text-xs leading-5 text-white/55">
                              One customer path: command, shift run, provider unlock, sandbox submit, receipt, closeout training and capability activation.
                            </p>
                            <p className="mt-2 text-[11px] leading-4 text-emerald-100/70">
                              next: {commandShiftOperatingLoopPack.nextBestAction.label} / {commandShiftOperatingLoopPack.nextBestAction.owner}
                            </p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftOperatingLoopPack.summary.ready}/{commandShiftOperatingLoopPack.summary.stages}</div>
                              <p className="mt-1 text-white/55">ready stages</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftOperatingLoopPack.summary.waitingProvider}</div>
                              <p className="mt-1 text-white/55">provider gates</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftOperatingLoopPack.summary.waitingProof}</div>
                              <p className="mt-1 text-white/55">proof gates</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftOperatingLoopPack.summary.activatedInternal}</div>
                              <p className="mt-1 text-white/55">internal active</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftOperatingLoopPack.summary.canSubmitSandbox ? 'ready' : 'blocked'}</div>
                              <p className="mt-1 text-white/55">sandbox submit</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 lg:grid-cols-3">
                          {commandShiftOperatingLoopPack.stages.map(stage => (
                            <div className="border border-white/10 bg-stone-950/50 p-3" key={stage.id}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-black text-white">{stage.title}</span>
                                <span className={stage.status === 'ready' ? 'text-[11px] text-emerald-100/70' : stage.status === 'waiting-provider' ? 'text-[11px] text-amber-100/70' : stage.status === 'waiting-proof' ? 'text-[11px] text-sky-100/70' : 'text-[11px] text-rose-100/70'}>
                                  {stage.status}
                                </span>
                              </div>
                              <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-white/55">{stage.customerVisible}</p>
                              <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-emerald-100/65">action: {stage.primaryAction}</p>
                              <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/40">proof: {stage.evidence.join(' / ')}</p>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{commandShiftOperatingLoopPack.safetyBoundary}</p>
                      </div>
                    ) : null}
                    <div className="mt-3 grid gap-2 lg:grid-cols-5">
                      {commandShiftAutopilot.steps.map(step => (
                        <div className="border border-white/10 bg-stone-950/50 p-3" key={step.id}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-white">{step.title}</span>
                            <span className={step.mode === 'run-internal' ? 'text-[11px] text-emerald-100/70' : step.mode === 'wait-provider' ? 'text-[11px] text-amber-100/70' : 'text-[11px] text-sky-100/70'}>
                              {step.mode}
                            </span>
                          </div>
                          <p className="mt-2 text-[11px] leading-4 text-white/50">{step.dueNow ? 'due now' : `wake ${step.nextWakeup}`} / {step.owner}</p>
                          <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-sky-100/65">action: {step.action}</p>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/40">proof: {step.proofRequired.join(' / ')}</p>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-amber-100/55">provider: {step.providerRequired.join(' / ') || 'none'}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid gap-2 lg:grid-cols-3">
                      <div className="border border-white/10 bg-white/[0.04] p-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">now queue</div>
                        <p className="mt-1 text-[11px] leading-4 text-emerald-100/65">{commandShiftAutopilot.nowQueue.join(' / ') || 'none'}</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.04] p-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">next wakeups</div>
                        <p className="mt-1 text-[11px] leading-4 text-sky-100/65">{commandShiftAutopilot.nextWakeups.join(' / ') || 'none'}</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.04] p-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">operating policy</div>
                        <p className="mt-1 text-[11px] leading-4 text-white/45">{commandShiftAutopilot.operatingPolicy.join(' / ')}</p>
                      </div>
                    </div>
                    {commandShiftAutopilotRun ? (
                      <div className="mt-3 border border-sky-200/20 bg-stone-950/40 p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">last run ledger</div>
                            <h5 className="mt-1 text-sm font-black text-white">{commandShiftAutopilotRun.runId}</h5>
                            <p className="mt-1 text-xs leading-5 text-white/55">{commandShiftAutopilotRun.payloadShape} / {commandShiftAutopilotRun.completedAt}</p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftAutopilotRun.summary.acceptedInternalActions}</div>
                              <p className="mt-1 text-white/55">accepted</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftAutopilotRun.summary.preparedManualActions}</div>
                              <p className="mt-1 text-white/55">manual</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftAutopilotRun.summary.providerHeldActions}</div>
                              <p className="mt-1 text-white/55">provider held</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftAutopilotRun.summary.evidenceHeldActions}</div>
                              <p className="mt-1 text-white/55">evidence held</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftAutopilotRun.summary.createdStoreManagerTasks}</div>
                              <p className="mt-1 text-white/55">owner tasks</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 lg:grid-cols-3">
                          <div className="border border-white/10 bg-white/[0.04] p-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">internal actions</div>
                            <p className="mt-1 text-[11px] leading-4 text-emerald-100/65">
                              {commandShiftAutopilotRun.acceptedInternalActions.map(action => action.title).join(' / ') || 'none'}
                            </p>
                          </div>
                          <div className="border border-white/10 bg-white/[0.04] p-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">provider held</div>
                            <p className="mt-1 text-[11px] leading-4 text-amber-100/65">
                              {commandShiftAutopilotRun.providerHeldActions.map(action => action.providerRequired.join(' + ') || action.title).join(' / ') || 'none'}
                            </p>
                          </div>
                          <div className="border border-white/10 bg-white/[0.04] p-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">evidence ledger</div>
                            <p className="mt-1 text-[11px] leading-4 text-white/45">
                              {commandShiftAutopilotRun.evidenceLedger.slice(0, 3).map(item => `${item.title}: ${item.status}`).join(' / ') || 'none'}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{commandShiftAutopilotRun.safetyBoundary}</p>
                      </div>
                    ) : null}
                    {commandShiftProviderHandoff ? (
                      <div className="mt-3 border border-amber-200/25 bg-amber-200/[0.05] p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">shift provider handoff</div>
                            <h5 className="mt-1 text-sm font-black text-white">{commandShiftProviderHandoff.payloadShape}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">{commandShiftProviderHandoff.nextAction}</p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftProviderHandoff.summary.requests}</div>
                              <p className="mt-1 text-white/55">asks</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftProviderHandoff.summary.p0}</div>
                              <p className="mt-1 text-white/55">P0</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftProviderHandoff.summary.providerEnvKeys}</div>
                              <p className="mt-1 text-white/55">key names</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftProviderHandoff.summary.merchantApprovals}</div>
                              <p className="mt-1 text-white/55">grants</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftProviderHandoff.summary.canClaimExternalAutomation ? 'ready' : 'blocked'}</div>
                              <p className="mt-1 text-white/55">external claim</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 lg:grid-cols-3">
                          <div className="border border-white/10 bg-white/[0.04] p-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">provider env keys</div>
                            <p className="mt-1 text-[11px] leading-4 text-amber-100/65">{commandShiftProviderHandoff.providerEnvKeys.slice(0, 6).join(' / ') || 'none'}</p>
                          </div>
                          <div className="border border-white/10 bg-white/[0.04] p-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">merchant approvals</div>
                            <p className="mt-1 text-[11px] leading-4 text-white/45">{commandShiftProviderHandoff.merchantApprovals.slice(0, 5).join(' / ') || 'none'}</p>
                          </div>
                          <div className="border border-white/10 bg-white/[0.04] p-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">data contracts</div>
                            <p className="mt-1 text-[11px] leading-4 text-white/45">{commandShiftProviderHandoff.dataContracts.slice(0, 5).join(' / ') || 'none'}</p>
                          </div>
                        </div>
                        {commandShiftProviderHandoff.requests.slice(0, 4).map(request => (
                          <div className="mt-2 border border-white/10 bg-stone-950/50 p-2" key={request.id}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-black text-white">{request.capability}</span>
                              <span className="text-[11px] text-amber-100/70">{request.priority} / {request.status}</span>
                            </div>
                            <p className="mt-1 text-[11px] leading-4 text-white/55">{request.ask}</p>
                            <p className="mt-1 text-[11px] leading-4 text-white/35">acceptance: {request.acceptance}</p>
                          </div>
                        ))}
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{commandShiftProviderHandoff.safetyBoundary}</p>
                      </div>
                    ) : null}
                    {commandShiftSandboxAcceptance ? (
                      <div className="mt-3 border border-lime-200/25 bg-lime-200/[0.05] p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/70">shift sandbox acceptance</div>
                            <h5 className="mt-1 text-sm font-black text-white">{commandShiftSandboxAcceptance.verdict}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">{commandShiftSandboxAcceptance.payloadShape}</p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftSandboxAcceptance.summary.passed}/{commandShiftSandboxAcceptance.summary.stages}</div>
                              <p className="mt-1 text-white/55">passed</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftSandboxAcceptance.summary.waitingExternal}</div>
                              <p className="mt-1 text-white/55">waiting</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftSandboxAcceptance.summary.providerRequests}</div>
                              <p className="mt-1 text-white/55">provider asks</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftSandboxAcceptance.summary.canSubmitSandbox ? 'ready' : 'blocked'}</div>
                              <p className="mt-1 text-white/55">sandbox submit</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftSandboxAcceptance.summary.canClaimExternalAutomation ? 'ready' : 'blocked'}</div>
                              <p className="mt-1 text-white/55">external claim</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 lg:grid-cols-3">
                          {commandShiftSandboxAcceptance.stages.slice(0, 6).map(stage => (
                            <div className="border border-white/10 bg-stone-950/50 p-2" key={stage.id}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-black text-white">{stage.id}</span>
                                <span className={stage.status === 'passed' ? 'text-[11px] text-emerald-100/70' : stage.status === 'waiting-external' ? 'text-[11px] text-amber-100/70' : 'text-[11px] text-rose-100/70'}>
                                  {stage.status}
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] leading-4 text-white/55">{stage.nextAction}</p>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{commandShiftSandboxAcceptance.safetyBoundary}</p>
                      </div>
                    ) : null}
                    {commandShiftFirstForwardableRun ? (
                      <div className="mt-3 border border-orange-200/25 bg-orange-200/[0.05] p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-100/70">shift first forwardable run</div>
                            <h5 className="mt-1 text-sm font-black text-white">{commandShiftFirstForwardableRun.verdict}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                              {commandShiftFirstForwardableRun.payloadShape} converts the latest shift ledger, provider asks, sandbox acceptance and sanitized package into one provider-ready preflight.
                            </p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftFirstForwardableRun.summary.shiftRuns}</div>
                              <p className="mt-1 text-white/55">shift runs</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftFirstForwardableRun.summary.providerRequests}</div>
                              <p className="mt-1 text-white/55">provider asks</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftFirstForwardableRun.summary.forwardablePackages}</div>
                              <p className="mt-1 text-white/55">packages</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftFirstForwardableRun.summary.canSubmitSandbox ? 'ready' : 'blocked'}</div>
                              <p className="mt-1 text-white/55">sandbox</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftFirstForwardableRun.summary.canForwardFirstShiftRun ? 'ready' : 'blocked'}</div>
                              <p className="mt-1 text-white/55">first run</p>
                            </div>
                          </div>
                        </div>
                        {commandShiftFirstForwardableRun.selectedShiftRun ? (
                          <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/55">
                            selected shift: {commandShiftFirstForwardableRun.selectedShiftRun.restaurant} / {commandShiftFirstForwardableRun.selectedShiftRun.offer} / provider-held {commandShiftFirstForwardableRun.selectedShiftRun.providerHeldActions} / owner tasks {commandShiftFirstForwardableRun.selectedShiftRun.createdStoreManagerTasks}
                          </p>
                        ) : null}
                        <div className="mt-3 grid gap-2 lg:grid-cols-3">
                          {commandShiftFirstForwardableRun.stages.map(stage => (
                            <div className="border border-white/10 bg-stone-950/50 p-2" key={stage.id}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-black text-white">{stage.id}</span>
                                <span className={stage.status === 'passed' ? 'text-[11px] text-emerald-100/70' : stage.status === 'waiting-external' ? 'text-[11px] text-amber-100/70' : 'text-[11px] text-rose-100/70'}>
                                  {stage.status}
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] leading-4 text-white/55">{stage.nextAction}</p>
                            </div>
                          ))}
                        </div>
                        {commandShiftFirstForwardableRun.selectedPackage ? (
                          <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-orange-100/65">
                            package: {commandShiftFirstForwardableRun.selectedPackage.runtimeTarget} / {commandShiftFirstForwardableRun.selectedPackage.requestedAction} / {commandShiftFirstForwardableRun.selectedPackage.canForward ? 'sanitized' : commandShiftFirstForwardableRun.selectedPackage.blockedReasons[0]}
                          </p>
                        ) : null}
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{commandShiftFirstForwardableRun.safetyBoundary}</p>
                      </div>
                    ) : null}
                    {commandShiftSandboxForwardAttempt ? (
                      <div className="mt-3 border border-rose-200/25 bg-rose-200/[0.05] p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-100/70">shift sandbox forward attempt</div>
                            <h5 className="mt-1 text-sm font-black text-white">{commandShiftSandboxForwardAttempt.verdict}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                              {commandShiftSandboxForwardAttempt.payloadShape} / {commandShiftSandboxForwardAttempt.bridge.message}
                            </p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-4 xl:min-w-[520px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftSandboxForwardAttempt.summary.bridgeStatus}</div>
                              <p className="mt-1 text-white/55">bridge</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftSandboxForwardAttempt.summary.selectedPackageFound ? 'yes' : 'no'}</div>
                              <p className="mt-1 text-white/55">package</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftSandboxForwardAttempt.summary.runRecorded ? 'yes' : 'no'}</div>
                              <p className="mt-1 text-white/55">run ledger</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftSandboxForwardAttempt.summary.canClaimExternalAutomation ? 'ready' : 'blocked'}</div>
                              <p className="mt-1 text-white/55">claim</p>
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/55">
                          receipt: {commandShiftSandboxForwardAttempt.receiptExpectation.callbackHeader} / {commandShiftSandboxForwardAttempt.receiptExpectation.closeoutRule}
                        </p>
                        {commandShiftSandboxForwardAttempt.selectedPackage ? (
                          <p className="mt-2 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-rose-100/65">
                            package: {commandShiftSandboxForwardAttempt.selectedPackage.runtimeTarget} / {commandShiftSandboxForwardAttempt.selectedPackage.status} / {commandShiftSandboxForwardAttempt.selectedPackage.canForward ? 'forwardable' : commandShiftSandboxForwardAttempt.selectedPackage.blockedReasons[0]}
                          </p>
                        ) : null}
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{commandShiftSandboxForwardAttempt.safetyBoundary}</p>
                      </div>
                    ) : null}
                    {commandShiftCloseoutTrainingPack ? (
                      <div className="mt-3 border border-violet-200/25 bg-violet-200/[0.05] p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/70">shift closeout training pack</div>
                            <h5 className="mt-1 text-sm font-black text-white">{commandShiftCloseoutTrainingPack.verdict}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                              {commandShiftCloseoutTrainingPack.payloadShape} turns receipts, recovery, post-run review and capability drafts into the next operating loop.
                            </p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingPack.summary.acceptedReceipts}</div>
                              <p className="mt-1 text-white/55">accepted</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingPack.summary.waitingReceipts}</div>
                              <p className="mt-1 text-white/55">waiting</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingPack.summary.recoveryActions}</div>
                              <p className="mt-1 text-white/55">recovery</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingPack.summary.trainingDrafts}</div>
                              <p className="mt-1 text-white/55">drafts</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingPack.summary.canRecordTraining ? 'ready' : 'blocked'}</div>
                              <p className="mt-1 text-white/55">training</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 lg:grid-cols-5">
                          {commandShiftCloseoutTrainingPack.lanes.map(lane => (
                            <div className="border border-white/10 bg-stone-950/50 p-2" key={lane.id}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-black text-white">{lane.id}</span>
                                <span className={lane.status === 'ready' ? 'text-[11px] text-emerald-100/70' : lane.status === 'waiting' ? 'text-[11px] text-amber-100/70' : 'text-[11px] text-rose-100/70'}>
                                  {lane.status}
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] leading-4 text-white/55">{lane.nextAction}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 grid gap-2 lg:grid-cols-3">
                          {commandShiftCloseoutTrainingPack.trainingDrafts.slice(0, 3).map(draft => (
                            <div className="border border-white/10 bg-white/[0.04] p-2" key={`${draft.capabilityId}-${draft.name}`}>
                              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/70">{draft.capabilityId}</div>
                              <p className="mt-1 text-[11px] leading-4 text-white/60">{draft.name} / {draft.owner}</p>
                              <p className="mt-1 text-[11px] leading-4 text-white/40">{draft.acceptedWhen}</p>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{commandShiftCloseoutTrainingPack.safetyBoundary}</p>
                      </div>
                    ) : null}
                    {commandShiftCloseoutTrainingRecordAttempt ? (
                      <div className="mt-3 border border-emerald-200/25 bg-emerald-200/[0.05] p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">shift closeout training record</div>
                            <h5 className="mt-1 text-sm font-black text-white">{commandShiftCloseoutTrainingRecordAttempt.verdict}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                              {commandShiftCloseoutTrainingRecordAttempt.payloadShape} / {commandShiftCloseoutTrainingRecordAttempt.nextAction}
                            </p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-4 xl:min-w-[520px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingRecordAttempt.summary.recordableDrafts}</div>
                              <p className="mt-1 text-white/55">recordable</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingRecordAttempt.summary.recorded}</div>
                              <p className="mt-1 text-white/55">recorded</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingRecordAttempt.summary.rejected}</div>
                              <p className="mt-1 text-white/55">rejected</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingRecordAttempt.summary.canClaimExternalAutomation ? 'ready' : 'blocked'}</div>
                              <p className="mt-1 text-white/55">claim</p>
                            </div>
                          </div>
                        </div>
                        {commandShiftCloseoutTrainingRecordAttempt.records.slice(0, 3).map(record => (
                          <p className="mt-2 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-emerald-100/65" key={record.recordId}>
                            {record.accepted ? 'accepted' : 'rejected'}: {record.capabilityId} / {record.name}
                          </p>
                        ))}
                        {commandShiftCloseoutTrainingRecordAttempt.rejectedDrafts.slice(0, 2).map(draft => (
                          <p className="mt-2 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-amber-100/60" key={`${draft.capabilityId}-${draft.name}`}>
                            waiting: {draft.capabilityId} / {draft.reason}
                          </p>
                        ))}
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{commandShiftCloseoutTrainingRecordAttempt.safetyBoundary}</p>
                      </div>
                    ) : null}
                    {commandShiftCapabilityActivationPack ? (
                      <div className="mt-3 border border-cyan-200/25 bg-cyan-200/[0.05] p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/70">shift capability activation pack</div>
                            <h5 className="mt-1 text-sm font-black text-white">{commandShiftCapabilityActivationPack.verdict}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                              {commandShiftCapabilityActivationPack.payloadShape} maps accepted training records into internal-active and provider-gated restaurant AI capabilities.
                            </p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCapabilityActivationPack.summary.activatedInternal}</div>
                              <p className="mt-1 text-white/55">active</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCapabilityActivationPack.summary.trainedNeedsProvider}</div>
                              <p className="mt-1 text-white/55">trained gated</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCapabilityActivationPack.summary.needsTraining}</div>
                              <p className="mt-1 text-white/55">needs train</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCapabilityActivationPack.summary.acceptedTrainingRecords}</div>
                              <p className="mt-1 text-white/55">records</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCapabilityActivationPack.summary.canClaimExternalAutomation ? 'ready' : 'blocked'}</div>
                              <p className="mt-1 text-white/55">claim</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 lg:grid-cols-3">
                          {commandShiftCapabilityActivationPack.activations.slice(0, 6).map(item => (
                            <div className="border border-white/10 bg-stone-950/50 p-2" key={item.capabilityId}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-black text-white">{item.capabilityId}</span>
                                <span className={item.status === 'activated-internal' ? 'text-[11px] text-emerald-100/70' : item.status === 'trained-needs-provider' ? 'text-[11px] text-amber-100/70' : 'text-[11px] text-rose-100/70'}>
                                  {item.status}
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] leading-4 text-white/55">{item.nextAction}</p>
                              <p className="mt-1 text-[11px] leading-4 text-cyan-100/55">records: {item.acceptedRecords} / provider: {item.providerEvidence.slice(0, 2).join(' / ') || item.providerGaps.slice(0, 2).join(' / ') || 'none'}</p>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{commandShiftCapabilityActivationPack.safetyBoundary}</p>
                      </div>
                    ) : null}
                    <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{commandShiftAutopilot.safetyBoundary}</p>
                  </div>
                ) : null}
                <div className="mt-3 grid gap-2 lg:grid-cols-4">
                  {commandCockpitZones.map(zone => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={zone.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{zone.title}</span>
                        <span className="text-[11px] text-amber-100/70">{zone.status}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/60">{zone.answer}</p>
                      <p className="mt-2 text-[11px] leading-4 text-amber-100/60">action: {zone.primaryAction}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/45">proof: {zone.visibleProof.slice(0, 3).join(' / ')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">gate: {zone.providerGate}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 border border-fuchsia-200/20 bg-fuchsia-200/[0.04] p-3">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/70">Competitor Route Decision</div>
                      <h4 className="mt-1 text-sm font-black text-white">Platform spine + Claw experience + runtime/data contracts</h4>
                      <p className="mt-2 max-w-4xl text-[11px] leading-4 text-white/50">
                        Decide what to copy exactly, what to upgrade, what can ship internally, and which Provider keys or merchant data contracts are still required.
                      </p>
                    </div>
                    <button
                      className="border border-fuchsia-200/50 px-3 py-2 text-xs font-black text-fuchsia-100 transition hover:bg-fuchsia-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={buildCompetitorRouteDecision}
                      type="button"
                    >
                      Build Route Decision
                    </button>
                  </div>
                  {dispatchState.competitorRouteDecision ? (
                    <>
                      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-5">
                        <div className="border border-white/10 bg-white/[0.04] p-2">
                          <div className="font-mono text-white">{dispatchState.competitorRouteDecision.summary.options}</div>
                          <p className="mt-1 text-white/55">routes</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.04] p-2">
                          <div className="font-mono text-white">{dispatchState.competitorRouteDecision.summary.internalCanShipNow}</div>
                          <p className="mt-1 text-white/55">internal now</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.04] p-2">
                          <div className="font-mono text-white">{dispatchState.competitorRouteDecision.summary.trainingItems}</div>
                          <p className="mt-1 text-white/55">training</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.04] p-2">
                          <div className="font-mono text-white">{dispatchState.competitorRouteDecision.summary.externalRequired}</div>
                          <p className="mt-1 text-white/55">external gates</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.04] p-2">
                          <div className="font-mono text-white">{dispatchState.competitorRouteDecision.summary.canClaimFullCompetitorParity ? 'yes' : 'no'}</div>
                          <p className="mt-1 text-white/55">full parity</p>
                        </div>
                      </div>
                      <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-xs leading-5 text-fuchsia-100/70">{dispatchState.competitorRouteDecision.answerForOwner}</p>
                      <div className="mt-3 grid gap-2 lg:grid-cols-4">
                        {dispatchState.competitorRouteDecision.options.map(option => (
                          <div className="border border-white/10 bg-stone-950/50 p-3" key={option.id}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-black text-white">{option.label}</span>
                              <span className="text-[11px] text-fuchsia-100/70">{option.verdict}</span>
                            </div>
                            <p className="mt-2 text-[11px] leading-4 text-white/60">{option.why}</p>
                            <p className="mt-2 text-[11px] leading-4 text-emerald-100/60">copy: {option.copyExactly.slice(0, 3).join(' / ')}</p>
                            <p className="mt-1 text-[11px] leading-4 text-cyan-100/60">upgrade: {option.upgradeBeyondCompetitor.slice(0, 2).join(' / ')}</p>
                            <p className="mt-1 text-[11px] leading-4 text-amber-100/60">external: {option.externalRequired.slice(0, 3).join(' / ') || 'none'}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 grid gap-2 lg:grid-cols-3">
                        <div className="border border-white/10 bg-white/[0.04] p-2">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">next build order</div>
                          {dispatchState.competitorRouteDecision.nextBuildOrder.slice(0, 4).map(item => (
                            <p className="mt-2 text-[11px] leading-4 text-white/55" key={item.id}>{item.owner}: {item.action}</p>
                          ))}
                        </div>
                        <div className="border border-white/10 bg-white/[0.04] p-2">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">provider keys</div>
                          <p className="mt-2 text-[11px] leading-4 text-amber-100/65">{dispatchState.competitorRouteDecision.providerKeyChecklist.slice(0, 12).join(' / ') || 'none'}</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.04] p-2">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">merchant inputs</div>
                          <p className="mt-2 text-[11px] leading-4 text-white/45">{dispatchState.competitorRouteDecision.merchantInputsNeeded.join(' / ')}</p>
                          <p className="mt-2 text-[11px] leading-4 text-white/35">{dispatchState.competitorRouteDecision.safetyBoundary}</p>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
                <div className="mt-3 border border-cyan-200/20 bg-cyan-200/[0.04] p-3">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/70">Competitor Parity Board</div>
                      <h4 className="mt-1 text-sm font-black text-white">竞品级能力拆成内部可跑 / 外部必接两层</h4>
                    </div>
                    <div className="flex flex-col gap-2 lg:items-end">
                      <p className="max-w-2xl text-[11px] leading-4 text-white/45">
                        这里不承诺已经自动发布、自动获客或自动核销；只把真正能内部执行的计划、回执、记忆、复盘先跑起来，把必须外部 Provider 的钥匙列清楚。
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="border border-cyan-200/50 px-3 py-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildExternalUnlockRequestPack}
                          type="button"
                        >
                          External Unlock Requests
                        </button>
                        <button
                          className="border border-amber-200/50 px-3 py-2 text-xs font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildProviderSetupPack}
                          type="button"
                        >
                          Provider Setup Pack
                        </button>
                      </div>
                      <p className="max-w-2xl text-[11px] leading-4 text-cyan-100/55">
                        External Unlock Requests 会生成 Signoff delivery kit、Acceptance fields 和 Export digest，方便交给商户、技术和数据负责人签收。
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 lg:grid-cols-3">
                    {competitorParityLanes.map(lane => (
                      <div className="border border-white/10 bg-stone-950/50 p-3" key={lane.title}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-white">{lane.title}</span>
                          <span className={lane.status === 'ready-internal' ? 'text-[11px] text-emerald-100/70' : 'text-[11px] text-amber-100/70'}>
                            {lane.status}
                          </span>
                        </div>
                        <p className="mt-2 text-[11px] leading-4 text-white/60">internal: {lane.internal}</p>
                        <p className="mt-2 text-[11px] leading-4 text-amber-100/60">external: {lane.external}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 border border-emerald-200/20 bg-emerald-200/[0.04] p-3">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">Resident AI Employee Loop</div>
                      <h4 className="mt-1 text-sm font-black text-white">常驻餐饮 AI 员工：主动巡检、跟进、写记忆</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="border border-emerald-200/50 px-3 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={dispatchState.status === 'loading'}
                        onClick={runHeartbeat}
                        type="button"
                      >
                        Run Resident Heartbeat
                      </button>
                      <button
                        className="border border-sky-200/50 px-3 py-2 text-xs font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={dispatchState.status === 'loading'}
                        onClick={buildChannelHub}
                        type="button"
                      >
                        Build Channel Hub
                      </button>
                      <button
                        className="border border-violet-200/50 px-3 py-2 text-xs font-black text-violet-100 transition hover:bg-violet-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={dispatchState.status === 'loading'}
                        onClick={buildAiEmployeeMemoryPack}
                        type="button"
                      >
                        Build Memory Pack
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 lg:grid-cols-4">
                    {residentEmployeeLoop.map(item => (
                      <div className="border border-white/10 bg-stone-950/50 p-3" key={item.title}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-white">{item.title}</span>
                          <span className={item.status === 'ready-internal' ? 'text-[11px] text-emerald-100/70' : item.status === 'provider-gated' ? 'text-[11px] text-amber-100/70' : 'text-[11px] text-rose-100/70'}>
                            {item.status}
                          </span>
                        </div>
                        <p className="mt-2 text-[11px] leading-4 text-white/55">{item.owner}</p>
                        <p className="mt-2 text-[11px] leading-4 text-white/65">{item.action}</p>
                        <p className="mt-2 text-[11px] leading-4 text-emerald-100/60">proof: {item.proof}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 grid gap-2 text-xs sm:grid-cols-4">
                    <div className="border border-white/10 bg-white/[0.04] p-2">
                      <div className="font-mono text-white">{dispatchState.heartbeat?.watchedRuns ?? 0}</div>
                      <p className="mt-1 text-white/55">run receipts watched</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.04] p-2">
                      <div className="font-mono text-white">{dispatchState.heartbeat?.shiftAutopilotRuns ?? 0}</div>
                      <p className="mt-1 text-white/55">shift runs watched</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.04] p-2">
                      <div className="font-mono text-white">{dispatchState.heartbeat?.taskWakeups ?? 0}</div>
                      <p className="mt-1 text-white/55">task wakeups</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.04] p-2">
                      <div className="font-mono text-white">{dispatchState.heartbeat?.memorySuggestions?.length ?? 0}</div>
                      <p className="mt-1 text-white/55">memory suggestions</p>
                    </div>
                  </div>
                  {dispatchState.heartbeat?.followups?.length ? (
                    <div className="mt-3 grid gap-2 lg:grid-cols-3">
                      {dispatchState.heartbeat.followups.slice(0, 3).map(item => (
                        <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-emerald-100/70">{item.priority}</span>
                            <span className="text-[10px] text-white/35">{item.owner}</span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-white">{item.nextAction}</p>
                          <p className="mt-1 text-[11px] leading-4 text-white/40">evidence: {item.evidenceRequired}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">primary runbook</div>
                    {(commandAiCockpit?.primaryRunbook || [
                      'Open Today Operations first and confirm merchant evidence.',
                      'Use AI Consultant only to create owner-visible plays, not hidden automation.',
                      'Move Automation Launch one lane at a time through Provider health, merchant grant and signed callback.',
                      'Close Evidence Review with public proof or sanitized aggregate imports before next-loop decisions.',
                    ]).map(line => (
                      <p className="mt-2 text-[11px] leading-4 text-amber-100/65" key={line}>{line}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">evidence board</div>
                    <p className="mt-2 text-xs leading-5 text-white/55">{(commandAiCockpit?.evidenceBoard || commandCockpitZones.flatMap(zone => zone.visibleProof)).slice(0, 12).join(' / ') || 'none'}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">provider unlocks</div>
                    <p className="mt-2 text-xs leading-5 text-amber-100/65">{(commandAiCockpit?.providerUnlocks || ['merchant grant', 'provider key', 'browser session', 'callback secret', 'POS aggregate contract']).slice(0, 12).join(' / ') || 'none'}</p>
                    <p className="mt-3 text-[11px] leading-4 text-white/40">{commandAiCockpit?.safetyBoundary || 'Preview only: no auto-publish, live call, POS write, payment, delivery, coupon redemption or private-message access without accepted Provider proof.'}</p>
                  </div>
                </div>
              </div>
            {commandAiEmployeeMemoryPack ? (
              <div className="mt-3 border border-violet-200/30 bg-violet-200/[0.06] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/70">AI employee memory pack</div>
                    <h4 className="mt-1 text-base font-black text-white">{commandAiEmployeeMemoryPack.payloadShape}</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      {commandAiEmployeeMemoryPack.residentEmployeeBrief.join(' / ')}
                    </p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-4 lg:min-w-[520px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiEmployeeMemoryPack.summary.memoryCards}</div>
                      <p className="mt-1 text-white/55">memory cards</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiEmployeeMemoryPack.summary.trainingReady}</div>
                      <p className="mt-1 text-white/55">training ready</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiEmployeeMemoryPack.summary.providerGates}</div>
                      <p className="mt-1 text-white/55">provider gates</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiEmployeeMemoryPack.employee.safeToAutonomouslyRun ? 'ready' : 'gated'}</div>
                      <p className="mt-1 text-white/55">autonomy</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {commandAiEmployeeMemoryPack.memoryCards.slice(0, 6).map(card => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={card.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{card.title}</span>
                        <span className="text-[11px] text-violet-100/70">{card.status} / {card.owner}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/65">{card.detail}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/45">{card.nextAction}</p>
                      <p className="mt-2 text-[11px] leading-4 text-violet-100/60">evidence: {card.evidenceRequired}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">next wakeups</div>
                    <div className="mt-2 space-y-2">
                      {commandAiEmployeeMemoryPack.nextWakeups.slice(0, 4).map(wakeup => (
                        <div className="border border-white/10 bg-white/[0.04] p-2" key={wakeup.id}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono text-white">{wakeup.owner}</span>
                            <span className="text-white/45">{wakeup.dueWindow}</span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-white/60">{wakeup.action}</p>
                          <p className="mt-1 text-[11px] text-white/40">trigger: {wakeup.trigger}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">training and external gates</div>
                    <p className="mt-2 text-xs leading-5 text-white/60">
                      trainable now: {commandAiEmployeeMemoryPack.trainingProgress.trainableNow}; provider gated: {commandAiEmployeeMemoryPack.trainingProgress.providerGated}; missing materials: {commandAiEmployeeMemoryPack.summary.trainingMissingMaterials}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-white/55">
                      next training: {commandAiEmployeeMemoryPack.trainingProgress.nextInternalTraining.slice(0, 3).map(item => `${item.capabilityId}: ${item.material}`).join(' / ') || 'none'}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-violet-100/65">
                      external: {commandAiEmployeeMemoryPack.externalRequired.slice(0, 6).join(' / ') || 'none'}
                    </p>
                    <p className="mt-3 text-[11px] leading-4 text-white/40">{commandAiEmployeeMemoryPack.safetyBoundary}</p>
                  </div>
                </div>
              </div>
            ) : null}
            {commandAiConsultantCopilot ? (
              <div className="mt-3 border border-fuchsia-200/30 bg-fuchsia-200/[0.06] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/70">Restaurant AI Consultant</div>
                    <h4 className="mt-1 text-base font-black text-white">{commandAiConsultantCopilot.payloadShape}</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">{commandAiConsultantCopilot.executiveAnswer}</p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-5 lg:min-w-[620px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiConsultantCopilot.mode}</div>
                      <p className="mt-1 text-white/55">mode</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiConsultantCopilot.summary.actionPlays}</div>
                      <p className="mt-1 text-white/55">plays</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiConsultantCopilot.summary.needsTraining}</div>
                      <p className="mt-1 text-white/55">training</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiConsultantCopilot.summary.providerGated}</div>
                      <p className="mt-1 text-white/55">provider gated</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiConsultantCopilot.summary.canClaimAutonomousOutcome ? 'ready' : 'blocked'}</div>
                      <p className="mt-1 text-white/55">autonomy claim</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  {commandAiConsultantCopilot.actionPlays.map(play => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={play.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{play.title}</span>
                        <span className="text-[11px] text-fuchsia-100/70">{play.owner} / {play.canExecuteInternallyNow ? 'internal' : 'gated'}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/60">{play.customerOutcome}</p>
                      <div className="mt-2 space-y-1">
                        {play.steps.slice(0, 4).map(step => (
                          <p className="text-[11px] leading-4 text-white/45" key={step}>{step}</p>
                        ))}
                      </div>
                      <p className="mt-2 text-[11px] leading-4 text-amber-100/60">training: {play.trainingNeeded.slice(0, 4).join(' / ') || 'none'}</p>
                      <p className="mt-1 text-[11px] leading-4 text-fuchsia-100/60">provider: {play.providerDependencies.slice(0, 4).join(' / ') || 'none'}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">stop: {play.stopLine}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">diagnosis</div>
                    <div className="mt-2 space-y-2">
                      {commandAiConsultantCopilot.diagnoses.map(item => (
                        <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                          <div className="font-mono text-xs text-white">{item.label} / {item.status}</div>
                          <p className="mt-1 text-[11px] leading-4 text-white/50">{item.finding}</p>
                          <p className="mt-1 text-[11px] leading-4 text-white/35">{item.nextAction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">training queue</div>
                    <div className="mt-2 space-y-1">
                      {commandAiConsultantCopilot.trainingQueue.slice(0, 8).map(item => (
                        <p className="text-[11px] leading-4 text-white/55" key={item.id}>
                          {item.owner}: {item.material}
                        </p>
                      ))}
                    </div>
                    <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">operator script</div>
                    {commandAiConsultantCopilot.operatorScript.map(line => (
                      <p className="mt-1 text-[11px] leading-4 text-fuchsia-100/60" key={line}>{line}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">provider unlocks</div>
                    <p className="mt-2 text-xs leading-5 text-amber-100/65">
                      {commandAiConsultantCopilot.providerUnlocks.slice(0, 12).join(' / ') || 'none'}
                    </p>
                    <p className="mt-3 text-[11px] leading-4 text-white/40">{commandAiConsultantCopilot.safetyBoundary}</p>
                  </div>
                </div>
              </div>
            ) : null}
            {commandStoreOperatingPlan ? (
              <div className="mt-3 border border-lime-200/30 bg-lime-200/[0.06] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/70">Store Operating Plan</div>
                    <h4 className="mt-1 text-base font-black text-white">{commandStoreOperatingPlan.payloadShape}</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      {commandStoreOperatingPlan.restaurant} / {commandStoreOperatingPlan.offer}: today plan, weekly focus, manager standup, staff talk tracks, evidence board and provider unlocks.
                    </p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-5 lg:min-w-[620px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandStoreOperatingPlan.verdict}</div>
                      <p className="mt-1 text-white/55">verdict</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandStoreOperatingPlan.summary.timeBlocks}</div>
                      <p className="mt-1 text-white/55">time blocks</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandStoreOperatingPlan.summary.readyInternal}</div>
                      <p className="mt-1 text-white/55">internal</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandStoreOperatingPlan.summary.providerGated}</div>
                      <p className="mt-1 text-white/55">provider gated</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandStoreOperatingPlan.summary.canClaimAutomation ? 'ready' : 'blocked'}</div>
                      <p className="mt-1 text-white/55">automation claim</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  {commandStoreOperatingPlan.dayPlan.map(block => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={block.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{block.window}</span>
                        <span className="text-[11px] text-lime-100/70">{block.owner} / {block.status}</span>
                      </div>
                      <p className="mt-2 text-sm font-black text-white">{block.title}</p>
                      <p className="mt-1 text-xs leading-5 text-white/60">{block.action}</p>
                      <p className="mt-2 text-[11px] leading-4 text-amber-100/60">check: {block.checklist.slice(0, 5).join(' / ') || 'none'}</p>
                      <p className="mt-1 text-[11px] leading-4 text-lime-100/60">evidence: {block.evidenceRequired.slice(0, 4).join(' / ')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">gate: {block.providerGate}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">week plan</div>
                    <div className="mt-2 space-y-2">
                      {commandStoreOperatingPlan.weekPlan.map(block => (
                        <div className="border border-white/10 bg-white/[0.04] p-2" key={block.id}>
                          <div className="font-mono text-xs text-white">{block.window} / {block.status}</div>
                          <p className="mt-1 text-[11px] leading-4 text-white/55">{block.title}</p>
                          <p className="mt-1 text-[11px] leading-4 text-white/35">{block.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">manager standup</div>
                    {commandStoreOperatingPlan.managerStandup.map(line => (
                      <p className="mt-2 text-[11px] leading-4 text-lime-100/65" key={line}>{line}</p>
                    ))}
                    <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">staff talk tracks</div>
                    {commandStoreOperatingPlan.staffTalkTracks.map(line => (
                      <p className="mt-1 text-[11px] leading-4 text-white/55" key={line}>{line}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">evidence and provider unlocks</div>
                    <p className="mt-2 text-xs leading-5 text-white/55">
                      evidence: {commandStoreOperatingPlan.evidenceBoard.slice(0, 10).join(' / ') || 'none'}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-amber-100/65">
                      provider: {commandStoreOperatingPlan.providerUnlocks.slice(0, 10).join(' / ') || 'none'}
                    </p>
                    <p className="mt-3 text-[11px] leading-4 text-white/40">{commandStoreOperatingPlan.safetyBoundary}</p>
                  </div>
                </div>
              </div>
            ) : null}
            {commandCustomerDemandGateway ? (
              <div className="mt-3 border border-emerald-200/30 bg-emerald-200/[0.06] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">Customer Demand Gateway</div>
                    <h4 className="mt-1 text-base font-black text-white">{commandCustomerDemandGateway.payloadShape}</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">{commandCustomerDemandGateway.customerPromise}</p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-4 lg:min-w-[520px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCustomerDemandGateway.summary.channels}</div>
                      <p className="mt-1 text-white/55">demand channels</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCustomerDemandGateway.summary.internalReady}</div>
                      <p className="mt-1 text-white/55">internal ready</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCustomerDemandGateway.summary.providerGated}</div>
                      <p className="mt-1 text-white/55">provider gated</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCustomerDemandGateway.summary.canClaimAutoOrderTaking ? 'ready' : 'gated'}</div>
                      <p className="mt-1 text-white/55">order taking</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {commandCustomerDemandGateway.channels.map(channel => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={channel.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{channel.name}</span>
                        <span className="text-[11px] text-emerald-100/70">{channel.status} / {channel.owner}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/60">{channel.internalNow.slice(0, 2).join(' / ')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/45">{channel.nextAction}</p>
                      <p className="mt-2 text-[11px] leading-4 text-emerald-100/60">evidence: {channel.evidenceRequired.slice(0, 3).join(' / ')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">intake schema</div>
                    <div className="mt-2 space-y-2">
                      {commandCustomerDemandGateway.intakeSchema.map(field => (
                        <div className="grid gap-2 border border-white/10 bg-white/[0.04] p-2 text-xs md:grid-cols-[0.7fr_0.7fr_1.3fr]" key={field.field}>
                          <span className="font-mono text-white">{field.field}</span>
                          <span className="text-emerald-100/70">{field.storage}</span>
                          <span className="text-white/55">{field.purpose}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">provider gates and staff handoff</div>
                    <p className="mt-2 text-xs leading-5 text-emerald-100/65">
                      external: {commandCustomerDemandGateway.externalRequired.slice(0, 8).join(' / ') || 'none'}
                    </p>
                    <div className="mt-2 space-y-2">
                      {commandCustomerDemandGateway.staffHandoff.map(item => (
                        <div className="border border-white/10 bg-white/[0.04] p-2" key={`${item.owner}-${item.action}`}>
                          <div className="font-mono text-xs text-white">{item.owner}</div>
                          <p className="mt-1 text-xs leading-5 text-white/55">{item.action}</p>
                          <p className="mt-1 text-[11px] text-white/40">evidence: {item.evidenceRequired}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-[11px] leading-4 text-white/40">{commandCustomerDemandGateway.safetyBoundary}</p>
                  </div>
                </div>
              </div>
            ) : null}
            {commandVoiceOrderConsole ? (
              <div className="mt-3 border border-sky-200/30 bg-sky-200/[0.06] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">Voice Order Console</div>
                    <h4 className="mt-1 text-base font-black text-white">{commandVoiceOrderConsole.payloadShape}</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      Phone/order/reservation layer for menu answers, intent classification, order drafts, POS/payment/delivery gates and staff takeover.
                    </p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-4 lg:min-w-[520px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandVoiceOrderConsole.summary.intents}</div>
                      <p className="mt-1 text-white/55">intents</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandVoiceOrderConsole.summary.orderDrafts}</div>
                      <p className="mt-1 text-white/55">order drafts</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandVoiceOrderConsole.summary.providerGated}</div>
                      <p className="mt-1 text-white/55">gated lanes</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandVoiceOrderConsole.summary.canWriteOrdersNow ? 'ready' : 'gated'}</div>
                      <p className="mt-1 text-white/55">POS write</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  {commandVoiceOrderConsole.intents.map(intent => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={intent.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{intent.label}</span>
                        <span className="text-[11px] text-sky-100/70">{intent.status} / {intent.confidence}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/60">{intent.customerNeed}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/45">{intent.safeResponse}</p>
                      <p className="mt-2 text-[11px] leading-4 text-sky-100/60">evidence: {intent.evidenceRequired.slice(0, 3).join(' / ')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-3 lg:col-span-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">order drafts</div>
                    <div className="mt-2 space-y-2">
                      {commandVoiceOrderConsole.orderDrafts.map(draft => (
                        <div className="grid gap-2 border border-white/10 bg-white/[0.04] p-2 text-xs md:grid-cols-[0.5fr_0.6fr_1.4fr_1.2fr]" key={draft.id}>
                          <span className="font-mono text-white">{draft.serviceMode}</span>
                          <span className="text-sky-100/70">{draft.status}</span>
                          <span className="text-white/55">{draft.items.map(item => `${item.quantity}x ${item.name}`).join(' / ') || draft.missingFields.join(' / ')}</span>
                          <span className="text-white/45">{draft.nextAction}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">menu knowledge</div>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      {commandVoiceOrderConsole.menuKnowledge.map(item => (
                        <div className="border border-white/10 bg-white/[0.04] p-2" key={item.topic}>
                          <div className="font-mono text-xs text-white">{item.topic}</div>
                          <p className="mt-1 text-xs leading-5 text-white/55">{item.answer}</p>
                          <p className="mt-1 text-[11px] text-white/40">source: {item.sourceRequired}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">sync gates</div>
                    <div className="mt-2 space-y-2">
                      {commandVoiceOrderConsole.syncGates.map(gate => (
                        <div className="border border-white/10 bg-white/[0.04] p-2" key={gate.id}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono text-xs text-white">{gate.label}</span>
                            <span className="text-[11px] text-sky-100/70">{gate.status}</span>
                          </div>
                          <p className="mt-1 text-[11px] leading-4 text-white/45">{gate.nextAction}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-5 text-sky-100/65">
                      external: {commandVoiceOrderConsole.externalRequired.slice(0, 6).join(' / ') || 'none'}
                    </p>
                    <p className="mt-3 text-[11px] leading-4 text-white/40">{commandVoiceOrderConsole.safetyBoundary}</p>
                  </div>
                </div>
              </div>
            ) : null}
            {commandProviderLaunchBoard ? (
              <div className="mt-3 border border-rose-200/30 bg-rose-200/[0.06] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-100/70">Provider Launch Board</div>
                    <h4 className="mt-1 text-base font-black text-white">{commandProviderLaunchBoard.payloadShape}</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      {commandProviderLaunchBoard.restaurant} / {commandProviderLaunchBoard.offer}: launch-readiness for voice, platform proof, messaging, reservation, POS/payment/delivery, operating analysis and persistent runtime.
                    </p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-5 lg:min-w-[620px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandProviderLaunchBoard.summary.capabilities}</div>
                      <p className="mt-1 text-white/55">capabilities</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandProviderLaunchBoard.summary.readyToSandbox}</div>
                      <p className="mt-1 text-white/55">sandbox-ready</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandProviderLaunchBoard.summary.setupRecorded}</div>
                      <p className="mt-1 text-white/55">setup noted</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandProviderLaunchBoard.summary.missingProvider}</div>
                      <p className="mt-1 text-white/55">missing</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandProviderLaunchBoard.summary.canClaimExternalAutomation ? 'ready' : 'blocked'}</div>
                      <p className="mt-1 text-white/55">automation claim</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  {commandProviderLaunchBoard.capabilities.map(capability => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={capability.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{capability.name}</span>
                        <span className="text-[11px] text-rose-100/70">{capability.status}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/60">{capability.customerPromise}</p>
                      <p className="mt-2 text-[11px] leading-4 text-white/45">now: {capability.canDoInternallyNow.slice(0, 3).join(' / ')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-rose-100/60">launch: {capability.launchStep}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">stop: {capability.stopLine}</p>
                      {capability.providerKeysNeeded.length || capability.merchantApprovalsNeeded.length || capability.dataContractsNeeded.length ? (
                        <p className="mt-2 text-[11px] leading-4 text-amber-100/60">
                          needs: {[...capability.providerKeysNeeded, ...capability.merchantApprovalsNeeded, ...capability.dataContractsNeeded].slice(0, 5).join(' / ')}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">launch order</div>
                    <div className="mt-2 space-y-2">
                      {commandProviderLaunchBoard.launchOrder.slice(0, 5).map(item => (
                        <div className="border border-white/10 bg-white/[0.04] p-2" key={`${item.owner}-${item.capabilityId}`}>
                          <div className="font-mono text-xs text-white">{item.owner} / {item.capabilityId}</div>
                          <p className="mt-1 text-[11px] leading-4 text-white/50">{item.action}</p>
                          <p className="mt-1 text-[11px] leading-4 text-white/35">{item.evidenceRequired}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">provider checklist</div>
                    <p className="mt-2 text-xs leading-5 text-amber-100/65">
                      {commandProviderLaunchBoard.providerKeyChecklist.slice(0, 12).join(' / ') || 'No provider key needed for internal-only work.'}
                    </p>
                    <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">external required</div>
                    <p className="mt-2 text-xs leading-5 text-white/55">
                      {commandProviderLaunchBoard.externalRequired.slice(0, 12).join(' / ') || 'none'}
                    </p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">boundary</div>
                    <p className="mt-2 text-xs leading-5 text-white/55">{commandProviderLaunchBoard.safetyBoundary}</p>
                  </div>
                </div>
              </div>
            ) : null}
            {commandMerchantActivationPacket ? (
              <div className="mt-3 border border-amber-200/30 bg-amber-200/[0.06] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">Merchant Activation Packet</div>
                    <h4 className="mt-1 text-base font-black text-white">{commandMerchantActivationPacket.verdict}</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      {commandMerchantActivationPacket.restaurant} / {commandMerchantActivationPacket.offer}: a forwardable implementation ask for provider keys, merchant approvals, data contracts and sandbox acceptance.
                    </p>
                    <p className="mt-2 text-[11px] leading-4 text-amber-100/70">{commandMerchantActivationPacket.nextAskForUser}</p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-5 lg:min-w-[620px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandMerchantActivationPacket.summary.capabilities}</div>
                      <p className="mt-1 text-white/55">capabilities</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandMerchantActivationPacket.summary.providerKeys}</div>
                      <p className="mt-1 text-white/55">key names</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandMerchantActivationPacket.summary.merchantApprovals}</div>
                      <p className="mt-1 text-white/55">approvals</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandMerchantActivationPacket.summary.dataContracts}</div>
                      <p className="mt-1 text-white/55">data contracts</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandMerchantActivationPacket.summary.canClaimExternalAutomation ? 'ready' : 'blocked'}</div>
                      <p className="mt-1 text-white/55">claim</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {commandMerchantActivationPacket.sections.slice(0, 6).map(section => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={section.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{section.title}</span>
                        <span className="text-[11px] text-amber-100/70">{section.status}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-white/45">owner: {section.owner}</p>
                      <div className="mt-2 space-y-2">
                        {section.requestedItems.slice(0, 3).map(item => (
                          <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                            <div className="text-[11px] font-black text-white">{item.label}</div>
                            <p className="mt-1 text-[11px] leading-4 text-white/45">{item.safeInstruction}</p>
                            <p className="mt-1 text-[11px] leading-4 text-amber-100/55">proof: {item.evidenceRequired}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">provider key names</div>
                    <p className="mt-2 text-xs leading-5 text-amber-100/65">{commandMerchantActivationPacket.providerKeyChecklist.slice(0, 12).join(' / ') || 'none'}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">sandbox acceptance</div>
                    <p className="mt-2 text-xs leading-5 text-white/55">
                      {commandMerchantActivationPacket.sandboxAcceptancePlan.slice(0, 3).map(item => `${item.capabilityId}: ${item.action}`).join(' / ')}
                    </p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">do not send</div>
                    <p className="mt-2 text-xs leading-5 text-white/55">{commandMerchantActivationPacket.doNotSend.slice(0, 4).join(' / ')}</p>
                  </div>
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{commandMerchantActivationPacket.safetyBoundary}</p>
              </div>
            ) : null}
          </div>
          <div className="mt-4 border border-amber-200/25 bg-amber-200/[0.05] p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">architecture decision</div>
                <h4 className="mt-1 text-base font-black text-white">{commandBenchmarkStrategy.recommendation}</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">{commandBenchmarkStrategy.summary}</p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-3 xl:min-w-[420px]">
                {commandBenchmarkStrategy.candidates.map(candidate => (
                  <div className="border border-white/10 bg-white/[0.05] p-2" key={candidate.id}>
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">{candidate.role}</div>
                    <div className="mt-1 font-black text-white">{candidate.fitScore}</div>
                    <div className="mt-1 truncate text-white/50" title={candidate.name}>{candidate.name}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-3">
              {commandBenchmarkStrategy.nextBuildOrder.map(item => (
                <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                  <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-amber-100/70">{item.source}</div>
                  <p className="mt-1 text-xs font-black text-white">{item.title}</p>
                  <p className="mt-1 text-[11px] leading-4 text-white/45">external: {item.externalGate}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 border border-orange-200/30 bg-orange-200/[0.06] p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-100/70">Activation Cockpit</div>
                <h4 className="mt-1 text-base font-black text-white">Internal ability vs training vs provider gates</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  {commandActivationCockpit?.answerForCustomer || 'Build Activation Cockpit to see which competitor-grade restaurant abilities can run internally, which need training materials, and which require provider keys or merchant authorization.'}
                </p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-4 xl:min-w-[520px]">
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">usable now</div>
                  <div className="mt-1 font-mono text-white">{commandActivationCockpit?.summary.usableNow ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">trainable</div>
                  <div className="mt-1 font-mono text-white">{commandActivationCockpit?.summary.trainableNow ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">provider gated</div>
                  <div className="mt-1 font-mono text-white">{commandActivationCockpit?.summary.providerGated ?? commandProviderGates}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">keys needed</div>
                  <div className="mt-1 font-mono text-white">{commandActivationCockpit?.summary.providerKeysNeeded ?? 0}</div>
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-4">
              {(commandActivationCockpit?.lanes || []).slice(0, 4).map(lane => (
                <div className="border border-white/10 bg-white/[0.04] p-2" key={lane.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-orange-100/70">{lane.status}</span>
                    <span className="truncate text-[10px] text-white/35" title={lane.competitorEquivalent}>{lane.competitorEquivalent}</span>
                  </div>
                  <p className="mt-1 text-xs font-black text-white">{lane.title}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/45">{lane.nextAction}</p>
                </div>
              ))}
            </div>
            <button
              className="mt-3 border border-orange-200/60 px-3 py-2 text-xs font-black text-orange-100 transition hover:bg-orange-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildActivationCockpit}
              type="button"
            >
              Build Activation Cockpit
            </button>
          </div>
          <div className="mt-4 border border-violet-200/30 bg-violet-200/[0.06] p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/70">AI OS Audit</div>
                <h4 className="mt-1 text-base font-black text-white">One report for parity, proof and external blockers</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  {commandAiOsAuditReport
                    ? `${commandAiOsAuditReport.payloadShape}: ${commandAiOsAuditReport.verdict}. It combines the trial cockpit, connector matrix, public source harvest and operating insight report.`
                    : 'Build the audit when a customer asks what this product can really do today, what needs provider keys, and what must stay outside the output boundary.'}
                </p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">usable</div>
                  <div className="mt-1 font-mono text-white">{commandAiOsAuditReport?.summary.usableNow ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">manual</div>
                  <div className="mt-1 font-mono text-white">{commandAiOsAuditReport?.summary.manualReady ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">provider</div>
                  <div className="mt-1 font-mono text-white">{commandAiOsAuditReport?.summary.providerRequired ?? commandProviderGates}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">env keys</div>
                  <div className="mt-1 font-mono text-white">{commandAiOsAuditReport ? `${commandAiOsAuditReport.summary.configuredEnvKeys}/${commandAiOsAuditReport.summary.totalEnvKeys}` : '0/0'}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">forbidden</div>
                  <div className="mt-1 font-mono text-white">{commandAiOsAuditReport?.summary.forbidden ?? 1}</div>
                </div>
              </div>
            </div>
            {commandAiOsAuditReport ? (
              <>
                <div className="mt-3 grid gap-2 lg:grid-cols-5">
                  {commandAiOsAuditReport.lanes.map(lane => (
                    <div className="border border-white/10 bg-white/[0.04] p-2" key={lane.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-violet-100/70">{lane.status}</span>
                      </div>
                      <p className="mt-1 text-xs font-black text-white">{lane.title}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/45">{lane.nextAction}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">Top actions</div>
                    {commandAiOsAuditReport.topActions.map(action => (
                      <p className="mt-1 text-[11px] leading-4 text-white/60" key={`${action.owner}-${action.action}`}>{action.owner}: {action.action}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">External required</div>
                    {(commandAiOsAuditReport.externalRequired.length ? commandAiOsAuditReport.externalRequired : ['No extra provider blocker detected by the audit.']).slice(0, 6).map(item => (
                      <p className="mt-1 text-[11px] leading-4 text-white/60" key={item}>{item}</p>
                    ))}
                  </div>
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/45">{commandAiOsAuditReport.safetyBoundary}</p>
              </>
            ) : null}
            <button
              className="mt-3 border border-violet-200/60 px-3 py-2 text-xs font-black text-violet-100 transition hover:bg-violet-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectAiOsAuditReport}
              type="button"
            >
              Build AI OS Audit
            </button>
          </div>
          <div className="mt-4 border border-cyan-200/30 bg-cyan-200/[0.06] p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/70">Claw Skill Workbench</div>
                <h4 className="mt-1 text-base font-black text-white">Pick a restaurant skill, get an executable task pack</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  Turns the 20-module Claw-style catalog into runnable internal skills, training requests and provider unlock tasks for this exact restaurant. This is the usable layer between a fancy skill library and real store work.
                </p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">mode</div>
                  <div className="mt-1 truncate font-mono text-white" title={commandClawSkillWorkbench?.mode}>{commandClawSkillWorkbench?.mode || 'not-built'}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">runnable</div>
                  <div className="mt-1 font-mono text-white">{commandClawSkillWorkbench?.summary.runnableNow ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">training</div>
                  <div className="mt-1 font-mono text-white">{commandClawSkillWorkbench?.summary.trainingNeeded ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">provider gated</div>
                  <div className="mt-1 font-mono text-white">{commandClawSkillWorkbench?.summary.providerGated ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">deliverables</div>
                  <div className="mt-1 font-mono text-white">{commandClawSkillWorkbench?.summary.deliverables ?? 0}</div>
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-3">
              {(commandClawSkillWorkbench?.deliverables || []).map(item => (
                <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-cyan-100/70">{item.status}</span>
                    <span className="text-[10px] text-white/35">{item.owner}</span>
                  </div>
                  <p className="mt-1 text-xs font-black text-white">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/45">{item.acceptance}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-3">
              {(commandClawSkillWorkbench?.selectedModules || []).slice(0, 6).map(module => (
                <div className="border border-white/10 bg-white/[0.04] p-2" key={module.id}>
                  <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-cyan-100/70">{module.owner}</div>
                  <p className="mt-1 text-xs font-black text-white">{module.name}</p>
                  <p className="mt-1 text-[11px] leading-4 text-white/45">{module.runnableSkills} runnable / {module.blockedSkills} blocked</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-4">
              {clawWorkbenchPresets.map(preset => {
                const active = preset.id === selectedClawWorkbenchPreset.id;
                return (
                  <button
                    className={`border p-2 text-left transition ${active ? 'border-cyan-200/70 bg-cyan-200/[0.12]' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.07]'}`}
                    disabled={dispatchState.status === 'loading'}
                    key={preset.id}
                    onClick={() => setSelectedClawWorkbenchPreset(preset)}
                    type="button"
                  >
                    <div className="text-xs font-black text-white">{preset.label}</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/45">{preset.description}</p>
                    <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.12em] text-cyan-100/60">
                      {preset.moduleIds.length} modules
                    </p>
                  </button>
                );
              })}
            </div>
            <div className="mt-3 border border-cyan-200/20 bg-white/[0.04] p-2">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/70">Execution Memory</div>
                  <p className="mt-1 text-xs text-white/55">
                    {commandClawSkillExecutionLedger?.nextAction || 'Open Skill Workbench to create the first remembered execution pack.'}
                  </p>
                </div>
                <div className="grid gap-2 text-xs sm:grid-cols-4 lg:min-w-[420px]">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">records</div>
                    <div className="mt-1 font-mono text-white">{commandClawSkillExecutionLedger?.summary.total ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">ready</div>
                    <div className="mt-1 font-mono text-white">{commandClawSkillExecutionLedger?.summary.readyNow ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">training</div>
                    <div className="mt-1 font-mono text-white">{commandClawSkillExecutionLedger?.summary.needsTraining ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">gated</div>
                    <div className="mt-1 font-mono text-white">{commandClawSkillExecutionLedger?.summary.providerGated ?? 0}</div>
                  </div>
                </div>
              </div>
              <div className="mt-2 grid gap-2 lg:grid-cols-2">
                {(commandClawSkillExecutionLedger?.latest || []).slice(0, 2).map(record => (
                  <div className="border border-white/10 bg-white/[0.04] p-2" key={record.recordId}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-black text-white" title={record.recordId}>{record.offer}</span>
                      <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-cyan-100/70">{record.status}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/45">
                      {record.runnableNow} runnable / {record.trainingNeeded} training / {record.providerGated} gated · owners {record.owners.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="mt-3 border border-cyan-200/60 px-3 py-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildClawSkillWorkbench}
              type="button"
            >
              Open Skill Workbench
            </button>
          </div>
          <div className="mt-4 border border-emerald-200/30 bg-emerald-200/[0.06] p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">Public Intelligence Brief</div>
                <h4 className="mt-1 text-base font-black text-white">Store facts, local platforms, material gaps</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  Convert public store facts or merchant-provided text into channel-specific jobs for Dianping/Meituan, Xiaohongshu, Douyin, WeChat groups and POI context. Public facts only start internal trials; real publish, acquisition, redemption and operating analysis stay gated.
                </p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-4 xl:min-w-[560px]">
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">usable fields</div>
                  <div className="mt-1 font-mono text-white">{commandPublicIntelligenceBrief?.readiness.usableFields ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">internal actions</div>
                  <div className="mt-1 font-mono text-white">{commandPublicIntelligenceBrief?.readiness.internalActions ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">external gates</div>
                  <div className="mt-1 font-mono text-white">{commandPublicIntelligenceBrief?.readiness.externalGates ?? commandProviderGates}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">trial status</div>
                  <div className="mt-1 font-mono text-white">{commandPublicIntelligenceBrief?.readiness.canStartTrial ? 'ready' : 'draft'}</div>
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-5">
              {(commandPublicIntelligenceBrief?.platformProfiles || []).map(item => (
                <div className="border border-white/10 bg-white/[0.04] p-2" key={item.platform}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-emerald-100/70">{item.platform}</span>
                    <span className="text-[10px] text-white/35">{item.usableNow ? 'ready' : 'gated'}</span>
                  </div>
                  <p className="mt-1 line-clamp-3 text-[11px] leading-4 text-white/45">{item.nextAction}</p>
                </div>
              ))}
            </div>
            <button
              className="mt-3 border border-emerald-200/60 px-3 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={importPublicProfile}
              type="button"
            >
              Import Public Store Intel
            </button>
          </div>
          <div className="mt-4 border border-fuchsia-200/30 bg-fuchsia-200/[0.06] p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/70">Provider Setup Wizard</div>
                <h4 className="mt-1 text-base font-black text-white">Keys, grants, staff channels, POS contracts</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  A customer-facing setup checklist for the exact external items that unlock real automation. Secret values stay server-side; the UI shows only configured/missing state, owners, proof requirements and a safe handoff payload.
                </p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-4 xl:min-w-[560px]">
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">completion</div>
                  <div className="mt-1 font-mono text-white">{commandProviderSetupWizard?.summary.completionPercent ?? 0}%</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">configured</div>
                  <div className="mt-1 font-mono text-white">{commandProviderSetupWizard?.summary.configured ?? 0}/{commandProviderSetupWizard?.summary.fields ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">missing</div>
                  <div className="mt-1 font-mono text-white">{commandProviderSetupWizard?.summary.missing ?? commandProviderGates}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">automation</div>
                  <div className="mt-1 font-mono text-white">{commandProviderSetupWizard?.summary.canEnableExternalAutomation ? 'ready' : 'blocked'}</div>
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-4">
              <div className="border border-white/10 bg-white/[0.04] p-2">
                <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">remembered records</div>
                <div className="mt-1 font-mono text-white">{commandProviderSetupState?.summary.records ?? 0}</div>
              </div>
              <div className="border border-white/10 bg-white/[0.04] p-2">
                <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">remembered env</div>
                <div className="mt-1 font-mono text-white">{commandProviderSetupState?.summary.configuredEnvKeys ?? 0}</div>
              </div>
              <div className="border border-white/10 bg-white/[0.04] p-2">
                <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">merchant approvals</div>
                <div className="mt-1 font-mono text-white">{commandProviderSetupState?.summary.merchantApprovals ?? 0}</div>
              </div>
              <div className="border border-white/10 bg-white/[0.04] p-2">
                <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">data contracts</div>
                <div className="mt-1 font-mono text-white">{commandProviderSetupState?.summary.dataContracts ?? 0}</div>
              </div>
            </div>
            <div className="mt-3 border border-white/10 bg-white/[0.04] p-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/70">Provider Readiness Health</div>
                  <p className="mt-1 max-w-3xl text-xs leading-5 text-white/55">
                    Separates remembered setup evidence from live health. A provider is not treated as usable until URL/key health, callback, merchant authorization and operating data gates are actually ready.
                  </p>
                </div>
                <div className="grid gap-2 text-xs sm:grid-cols-5 lg:min-w-[560px]">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">score</div>
                    <div className="mt-1 font-mono text-white">{commandProviderReadinessHealth?.summary.readinessScore ?? 0}%</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">health ready</div>
                    <div className="mt-1 font-mono text-white">{commandProviderReadinessHealth?.summary.healthReady ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">remembered</div>
                    <div className="mt-1 font-mono text-white">{commandProviderReadinessHealth?.summary.rememberedNotProbed ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">unreachable</div>
                    <div className="mt-1 font-mono text-white">{commandProviderReadinessHealth?.summary.configuredButUnreachable ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">external automation</div>
                    <div className="mt-1 font-mono text-white">{commandProviderReadinessHealth?.summary.canEnableExternalAutomation ? 'ready' : 'blocked'}</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(commandProviderReadinessHealth?.items || []).slice(0, 6).map(item => (
                  <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-fuchsia-100/70">{item.status}</span>
                      <span className="text-[10px] text-white/35">{item.category}</span>
                    </div>
                    <p className="mt-1 text-xs font-black text-white">{item.label}</p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/45">{item.nextAction}</p>
                  </div>
                ))}
              </div>
              <button
                className="mt-3 border border-fuchsia-200/60 px-3 py-2 text-xs font-black text-fuchsia-100 transition hover:bg-fuchsia-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={dispatchState.status === 'loading'}
                onClick={inspectProviderReadinessHealth}
                type="button"
              >
                Check Provider Health
              </button>
            </div>
            {commandProviderUnlockLadder ? (
              <div className="mt-3 border border-cyan-200/25 bg-cyan-200/[0.05] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/70">Provider Unlock Ladder</div>
                    <p className="mt-1 max-w-3xl text-xs leading-5 text-white/55">
                      Shows which competitor-grade abilities are only internal, which have signed setup evidence, and which have live provider health. Remembered evidence is not treated as automation.
                    </p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-5 lg:min-w-[560px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">capabilities</div>
                      <div className="mt-1 font-mono text-white">{commandProviderUnlockLadder.summary.capabilities}</div>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">health ready</div>
                      <div className="mt-1 font-mono text-white">{commandProviderUnlockLadder.summary.providerHealthReady}</div>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">signed evidence</div>
                      <div className="mt-1 font-mono text-white">{commandProviderUnlockLadder.summary.setupEvidenceSigned}</div>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">blocked</div>
                      <div className="mt-1 font-mono text-white">{commandProviderUnlockLadder.summary.externalBlocked}</div>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">claim external</div>
                      <div className="mt-1 font-mono text-white">{commandProviderUnlockLadder.summary.canClaimExternalAutomation ? 'ready' : 'blocked'}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {commandProviderUnlockLadder.items.map(item => (
                    <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-cyan-100/70">{item.stage}</span>
                        <span className="text-[10px] text-white/35">{item.setupEvidence.length ? 'signed' : 'no-signoff'}</span>
                      </div>
                      <p className="mt-1 text-xs font-black text-white">{item.label}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/45">{item.nextAction}</p>
                      <p className="mt-1 truncate text-[11px] text-white/35" title={item.stillNeeds.join(' / ')}>
                        needs: {item.stillNeeds.join(' / ') || 'none'}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.05] p-2 text-[11px] leading-4 text-white/45">{commandProviderUnlockLadder.safetyBoundary}</p>
              </div>
            ) : null}
            <div className="mt-3 grid gap-2 lg:grid-cols-5">
              {(commandProviderSetupWizard?.sections || []).map(section => (
                <div className="border border-white/10 bg-white/[0.04] p-2" key={section.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-fuchsia-100/70">{section.status}</span>
                    <span className="text-[10px] text-white/35">{section.owner}</span>
                  </div>
                  <p className="mt-1 text-xs font-black text-white">{section.title}</p>
                  <p className="mt-1 text-[11px] leading-4 text-white/45">{section.fields.filter(field => field.status === 'configured').length}/{section.fields.length} configured</p>
                </div>
              ))}
            </div>
            <button
              className="mt-3 border border-fuchsia-200/60 px-3 py-2 text-xs font-black text-fuchsia-100 transition hover:bg-fuchsia-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildProviderSetupWizard}
              type="button"
            >
              Build Provider Setup Wizard
            </button>
            <button
              className="ml-2 mt-3 border border-fuchsia-200/60 px-3 py-2 text-xs font-black text-fuchsia-100 transition hover:bg-fuchsia-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={recordProviderSetupState}
              type="button"
            >
              Save Setup State
            </button>
            <button
              className="ml-2 mt-3 border border-amber-200/60 px-3 py-2 text-xs font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildExternalUnlockRequestPack}
              type="button"
            >
              External Unlock Requests
            </button>
            {dispatchState.externalUnlockRequestPack ? (
              <div className="mt-3 border border-amber-200/25 bg-amber-200/[0.06] p-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">External Unlock Request Pack</div>
                    <h4 className="mt-1 text-base font-black text-white">
                      {dispatchState.externalUnlockRequestPack.payloadShape}
                    </h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      {dispatchState.externalUnlockRequestPack.restaurant} / {dispatchState.externalUnlockRequestPack.offer}: exact asks for provider keys, merchant grants, staff channels, callback proof and POS aggregate contracts.
                    </p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">P0</div>
                      <div className="mt-1 font-mono text-white">{dispatchState.externalUnlockRequestPack.summary.p0}</div>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">P1</div>
                      <div className="mt-1 font-mono text-white">{dispatchState.externalUnlockRequestPack.summary.p1}</div>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">provider keys</div>
                      <div className="mt-1 font-mono text-white">{dispatchState.externalUnlockRequestPack.summary.providerKeys}</div>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">merchant grants</div>
                      <div className="mt-1 font-mono text-white">{dispatchState.externalUnlockRequestPack.summary.merchantAuthorizations}</div>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">external auto</div>
                      <div className="mt-1 font-mono text-white">{dispatchState.externalUnlockRequestPack.summary.canClaimExternalAutomation ? 'ready' : 'blocked'}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-[1.1fr_1fr_1fr]">
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">Signoff delivery kit</div>
                    <p className="mt-1 text-white/60">
                      {dispatchState.externalUnlockRequestPack.signoffChecklist.length} checklist items / {dispatchState.externalUnlockRequestPack.ownerHandoff.length} owner handoffs
                    </p>
                    <p className="mt-1 text-white/45">{dispatchState.externalUnlockRequestPack.acceptanceReceiptTemplate.title}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">Acceptance fields</div>
                    <p className="mt-1 text-white/60">
                      {dispatchState.externalUnlockRequestPack.acceptanceReceiptTemplate.requiredFields.slice(0, 5).join(' / ')}
                    </p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">Export digest</div>
                    <p className="mt-1 text-white/60">
                      markdown {dispatchState.externalUnlockRequestPack.exportDigest.markdown.length} chars / csv {dispatchState.externalUnlockRequestPack.exportDigest.csv.split('\n').length - 1} rows
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {dispatchState.externalUnlockRequestPack.requests.slice(0, 6).map(item => (
                    <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-amber-100/70">{item.priority} / {item.category}</span>
                        <span className="text-[10px] text-white/35">{item.owner}</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-white">{item.ask}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/40">evidence: {item.evidenceRequired}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">Server-side keys</div>
                    {dispatchState.externalUnlockRequestPack.providerEnvKeys.slice(0, 6).map(item => (
                      <p className="mt-1 text-white/60" key={item.key}>{item.key}: {item.placeholder}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">Merchant authorization</div>
                    {dispatchState.externalUnlockRequestPack.merchantAuthorizationPacket.slice(0, 4).map(item => (
                      <p className="mt-1 text-white/60" key={`${item.capability}-${item.proof}`}>{item.capability}: {item.ask}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">Operating data packet</div>
                    {dispatchState.externalUnlockRequestPack.operatingDataPacket.slice(0, 5).map(item => (
                      <p className="mt-1 text-white/60" key={item.field}>{item.field}: {item.evidenceRequired}</p>
                    ))}
                  </div>
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.05] p-2 text-[11px] leading-4 text-white/45">{dispatchState.externalUnlockRequestPack.safetyBoundary}</p>
              </div>
            ) : null}
          </div>
          <div className="mt-4 border border-emerald-200/30 bg-emerald-200/[0.06] p-3">
            {commandAiEmployeeInbox ? (
              <>
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">AI employee inbox</div>
                  <h4 className="mt-1 text-base font-black text-white">{commandAiEmployeeInbox.employee.name} · {commandAiEmployeeInbox.employee.status}</h4>
                  <p className="mt-1 text-xs leading-5 text-white/55">
                    {commandAiEmployeeInbox.payloadShape} / messages {commandAiEmployeeInbox.summary.messages} / waiting external {commandAiEmployeeInbox.summary.waitingExternal}
                  </p>
                </div>
                <div className="grid gap-2 text-xs sm:grid-cols-3 xl:min-w-[520px]">
                  {commandAiEmployeeInbox.memory.slice(0, 3).map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={item.id}>
                      <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">{item.label}</div>
                      <div className="mt-1 truncate font-black text-white" title={item.value}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-2">
                {commandAiEmployeeInbox.messages.slice(0, 2).map(message => (
                  <div className="border border-white/10 bg-white/[0.05] p-3" key={message.id}>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.12em] text-emerald-100/70">
                      <span>{message.priority}</span>
                      <span>{message.lane}</span>
                      <span>{message.owner}</span>
                    </div>
                    <p className="mt-2 text-sm font-black text-white">{message.title}</p>
                    <p className="mt-1 text-xs leading-5 text-white/55">{message.body}</p>
                    <p className="mt-2 text-[11px] leading-4 text-white/40">evidence: {message.evidenceRequired}</p>
                  </div>
                ))}
              </div>
              </>
            ) : (
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">AI employee inbox</div>
                  <h4 className="mt-1 text-base font-black text-white">Wenai Store Operator · waiting-for-first-refresh</h4>
                  <p className="mt-1 text-xs leading-5 text-white/55">
                    Refresh Center 后会把主动作、店长任务、外部门禁和通知审计整理成主动消息。
                  </p>
                </div>
                <button
                  className="shrink-0 border border-emerald-200/60 px-3 py-2 text-sm font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={dispatchState.status === 'loading'}
                  onClick={refreshCommandCenter}
                  type="button"
                >
                  Refresh Inbox
                </button>
              </div>
            )}
          </div>
          <div className="mt-4 border border-sky-200/30 bg-sky-200/[0.06] p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">AI employee channel hub</div>
                <h4 className="mt-1 text-base font-black text-white">Chat commands, scheduled jobs, provider gates</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  {commandChannelHub
                    ? `${commandChannelHub.payloadShape}: ${commandChannelHub.summary.channels} channels, ${commandChannelHub.summary.scheduledJobs} scheduled jobs, ${commandChannelHub.summary.missingExternalItems} external items.`
                    : 'Build Channel Hub to connect the AI employee experience to WebChat, WeCom, Feishu, DingTalk, staff SMS and daily restaurant operating schedules without pretending external delivery is configured.'}
                </p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-4 xl:min-w-[520px]">
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">ready channels</div>
                  <div className="mt-1 font-mono text-white">{commandChannelHub?.summary.providerReadyChannels ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">handoff</div>
                  <div className="mt-1 font-mono text-white">{commandChannelHub?.summary.internalHandoffChannels ?? 1}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">scheduled</div>
                  <div className="mt-1 font-mono text-white">{commandChannelHub?.summary.scheduledJobs ?? 5}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">external items</div>
                  <div className="mt-1 font-mono text-white">{commandChannelHub?.summary.missingExternalItems ?? commandProviderGates}</div>
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-3">
              {(commandChannelHub?.scheduledJobs || []).slice(0, 3).map(job => (
                <div className="border border-white/10 bg-white/[0.04] p-2" key={job.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-sky-100/70">{job.status}</span>
                    <span className="text-[10px] text-white/35">{job.cadence}</span>
                  </div>
                  <p className="mt-1 text-xs font-black text-white">{job.title}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/45">{job.action}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-3">
              {(commandChannelHub?.commandSuggestions || []).map(item => (
                <div className="border border-white/10 bg-white/[0.04] p-2" key={item.routeTo}>
                  <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-sky-100/70">{item.routeTo}</div>
                  <p className="mt-1 text-[11px] leading-4 text-white/55">{item.command}</p>
                </div>
              ))}
            </div>
            {commandChannelDeliveryAttempt ? (
              <div className="mt-3 border border-white/10 bg-white/[0.04] p-3">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.12em] text-sky-100/70">
                  <span>delivery attempt</span>
                  <span>{commandChannelDeliveryAttempt.status}</span>
                  <span>{commandChannelDeliveryAttempt.provider}</span>
                  <span>{commandChannelDeliveryReport?.summary.total ?? 0} ledger events</span>
                </div>
                <p className="mt-2 text-sm font-black text-white">{commandChannelDeliveryAttempt.subject}</p>
                <p className="mt-1 text-xs leading-5 text-white/50">{commandChannelDeliveryAttempt.nextAction}</p>
                <p className="mt-1 text-[11px] leading-4 text-white/35">
                  missing: {commandChannelDeliveryAttempt.missing.join(' / ') || 'none'} · evidence: {commandChannelDeliveryAttempt.providerEvidence}
                </p>
              </div>
            ) : null}
            {commandChannelScheduleRun ? (
              <div className="mt-3 border border-white/10 bg-white/[0.04] p-3">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.12em] text-sky-100/70">
                  <span>schedule run</span>
                  <span>{commandChannelScheduleRun.summary.attempted} attempted</span>
                  <span>{commandChannelScheduleRun.summary.blocked} blocked</span>
                  <span>{commandChannelScheduleRun.summary.retryRecommended} retry/recovery</span>
                </div>
                <div className="mt-2 grid gap-2 lg:grid-cols-2">
                  {commandChannelScheduleRun.items.slice(0, 4).map(item => (
                    <div className="border border-white/10 bg-white/[0.04] p-2" key={item.jobId}>
                      <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.12em] text-white/35">
                        <span>{item.due ? 'due' : 'waiting'}</span>
                        <span>{item.selectedChannel}</span>
                      </div>
                      <p className="mt-1 text-xs font-black text-white">{item.title}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/45">{item.nextAction}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <button
              className="mt-3 border border-sky-200/60 px-3 py-2 text-xs font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildChannelHub}
              type="button"
            >
              Build Channel Hub
            </button>
            <button
              className="ml-2 mt-3 border border-sky-200/60 px-3 py-2 text-xs font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={attemptChannelDelivery}
              type="button"
            >
              Attempt Staff Delivery
            </button>
            <button
              className="ml-2 mt-3 border border-sky-200/60 px-3 py-2 text-xs font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={runChannelSchedule}
              type="button"
            >
              Run Due Schedule
            </button>
          </div>
          <div className="mt-4 grid gap-3 xl:grid-cols-[1.15fr_1.15fr_0.8fr]">
            <div className="border border-white/10 bg-white/[0.05] p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">next action</div>
              <p className="mt-1 text-sm leading-6 text-white">{commandNextAction}</p>
              <p className="mt-2 text-xs leading-5 text-white/50">{commandEvidence}</p>
            </div>
            <div className="border border-teal-200/30 bg-teal-200/[0.06] p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-100/70">store manager today</div>
                  <p className="mt-1 text-sm font-black text-white">
                    {commandFollowupSummary
                      ? `today ${commandFollowupSummary.today} / blocked ${commandFollowupSummary.blocked}`
                      : 'waiting for accepted receipt'}
                  </p>
                </div>
                <button
                  className="shrink-0 border border-teal-200/60 px-2 py-1 text-xs font-black text-teal-100 transition hover:bg-teal-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={dispatchState.status === 'loading'}
                  onClick={buildStoreManagerFollowup}
                  type="button"
                >
                  Build Pack
                </button>
                <button
                  className="shrink-0 border border-sky-200/60 px-2 py-1 text-xs font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={dispatchState.status === 'loading'}
                  onClick={buildStaffNotificationHandoff}
                  type="button"
                >
                  Draft Notice
                </button>
                <button
                  className="shrink-0 border border-emerald-200/60 px-2 py-1 text-xs font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={dispatchState.status === 'loading'}
                  onClick={buildStaffNotificationDeliveryBridge}
                  type="button"
                >
                  Delivery Bridge
                </button>
                <button
                  className="shrink-0 border border-fuchsia-200/60 px-2 py-1 text-xs font-black text-fuchsia-100 transition hover:bg-fuchsia-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={dispatchState.status === 'loading'}
                  onClick={buildTaskProviderHandoff}
                  type="button"
                >
                  Provider Handoff
                </button>
                <button
                  className="shrink-0 border border-lime-200/60 px-2 py-1 text-xs font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={dispatchState.status === 'loading'}
                  onClick={buildFirstForwardableRunPack}
                  type="button"
                >
                  First Forwardable Run
                </button>
                <button
                  className="shrink-0 border border-orange-200/60 px-2 py-1 text-xs font-black text-orange-100 transition hover:bg-orange-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={dispatchState.status === 'loading'}
                  onClick={buildFirstRunControlTower}
                  type="button"
                >
                  First Run Tower
                </button>
                <button
                  className="shrink-0 border border-cyan-200/60 px-2 py-1 text-xs font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={dispatchState.status === 'loading'}
                  onClick={buildNextLoopChannelPlan}
                  type="button"
                >
                  Next Loop Plan
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {(commandTaskQueue?.tasks.length ? commandTaskQueue.tasks : commandFollowupTasks).slice(0, 2).map(task => (
                  <div className="border border-white/10 bg-white/[0.05] p-2" key={task.id}>
                    <div className="flex flex-wrap gap-2 text-[11px] font-mono text-teal-100/80">
                      <span>{task.owner}</span>
                      <span>{task.priority}</span>
                      {'status' in task && typeof task.status === 'string' ? <span>{task.status}</span> : null}
                      <span>{task.signal}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-white">{task.action}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/45">evidence: {task.evidenceRequired}</p>
                    {'externalRequired' in task && Array.isArray(task.externalRequired) && task.externalRequired.length ? (
                      <p className="mt-1 text-[11px] leading-4 text-amber-100/55">external gates: {task.externalRequired.slice(0, 2).join(' / ')}</p>
                    ) : null}
                    {'taskMemoryId' in task && typeof task.taskMemoryId === 'string' && 'status' in task && task.status !== 'done' ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          className="border border-amber-200/40 px-2 py-1 text-[11px] font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={() => updateStoreManagerTask(String(task.taskMemoryId), 'needs-evidence', 'Owner must attach accepted evidence before closeout or provider handoff.')}
                          type="button"
                        >
                          Need Evidence
                        </button>
                        <button
                          className="border border-sky-200/40 px-2 py-1 text-[11px] font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={() => updateStoreManagerTask(String(task.taskMemoryId), 'ready-for-provider', 'Owner reviewed internal evidence; runtime-admin must verify provider gates before external forwarding.')}
                          type="button"
                        >
                          Provider Ready
                        </button>
                        <button
                          className="border border-rose-200/40 px-2 py-1 text-[11px] font-black text-rose-100 transition hover:bg-rose-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={() => updateStoreManagerTask(String(task.taskMemoryId), 'blocked', 'Blocked until merchant authorization, public proof, signed callback, or sanitized aggregate data is supplied.')}
                          type="button"
                        >
                          Block
                        </button>
                        <button
                          className="border border-white/20 px-2 py-1 text-[11px] font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={() => updateStoreManagerTask(String(task.taskMemoryId), 'done', 'Closed from friend-trial command center after owner reviewed evidence and stop line.')}
                          type="button"
                        >
                          Mark Done
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
                {!commandFollowupTasks.length ? (
                  <p className="text-xs leading-5 text-white/55">
                    Run a controlled trial or import accepted public proof first; external contact, redemption and POS work stay gated until authorization is configured.
                  </p>
                ) : null}
                {commandTaskQueue ? (
                  <p className="border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/45">
                    Task memory: {commandTaskQueue.payloadShape} / open {commandTaskQueue.summary.open} / evidence {commandTaskQueue.summary.needsEvidence} / provider {commandTaskQueue.summary.readyForProvider} / blocked {commandTaskQueue.summary.blocked}
                  </p>
                ) : null}
                {commandTaskWatcher ? (
                  <div className="border border-amber-200/25 bg-amber-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">proactive watcher</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandTaskWatcher.payloadShape} / wakeups {commandTaskWatcher.summary.wakeups} / high {commandTaskWatcher.summary.highPriority}
                    </p>
                    {commandTaskWatcher.wakeups.slice(0, 1).map(wakeup => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={wakeup.id}>
                        {wakeup.priority}: {wakeup.nextAction}
                      </p>
                    ))}
                  </div>
                ) : null}
                {commandStaffNotificationHandoff ? (
                  <div className="border border-sky-200/25 bg-sky-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">notification handoff</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandStaffNotificationHandoff.payloadShape} / drafts {commandStaffNotificationHandoff.summary.drafts} / provider required {commandStaffNotificationHandoff.summary.providerRequired}
                    </p>
                    {commandStaffNotificationHandoff.drafts.slice(0, 1).map(draft => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={draft.id}>
                        {draft.channel}: {draft.subject}
                      </p>
                    ))}
                  </div>
                ) : null}
                {commandStaffNotificationDeliveryBridge ? (
                  <div className="border border-emerald-200/25 bg-emerald-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">delivery bridge</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandStaffNotificationDeliveryBridge.payloadShape} / ready {commandStaffNotificationDeliveryBridge.summary.providerReady} / blocked {commandStaffNotificationDeliveryBridge.summary.blocked}
                    </p>
                    {commandStaffNotificationDeliveryBridge.items.slice(0, 1).map(item => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={item.id}>
                        {item.status}: {item.nextAction}
                      </p>
                    ))}
                  </div>
                ) : null}
                {commandStaffNotificationAuditLog ? (
                  <div className="border border-violet-200/25 bg-violet-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/70">notification audit</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandStaffNotificationAuditLog.payloadShape} / total {commandStaffNotificationAuditLog.summary.total} / blocked {commandStaffNotificationAuditLog.summary.blocked}
                    </p>
                    {commandStaffNotificationAuditLog.latest.slice(0, 1).map(event => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={event.auditId}>
                        {event.eventType}: {event.nextAction}
                      </p>
                    ))}
                  </div>
                ) : null}
                {commandTaskProviderHandoff ? (
                  <div className="border border-fuchsia-200/25 bg-fuchsia-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/70">provider handoff</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandTaskProviderHandoff.payloadShape} / packages {commandTaskProviderHandoff.summary.packages} / forwardable {commandTaskProviderHandoff.summary.forwardable} / blocked {commandTaskProviderHandoff.summary.blocked}
                    </p>
                    {(commandTaskProviderHandoff.packages[0] || commandTaskProviderHandoff.blockedPackages[0]) ? (
                      <p className="mt-1 text-[11px] leading-4 text-white/45">
                        {(commandTaskProviderHandoff.packages[0] || commandTaskProviderHandoff.blockedPackages[0]).status}: {(commandTaskProviderHandoff.packages[0] || commandTaskProviderHandoff.blockedPackages[0]).nextAction}
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] leading-4 text-white/45">
                        Move one task to ready-for-provider after evidence review; this creates a sanitized package for OpenClaw/Hermes/Lobu.
                      </p>
                    )}
                    <button
                      className="mt-2 border border-fuchsia-200/50 px-2 py-1 text-[11px] font-black text-fuchsia-100 transition hover:bg-fuchsia-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading' || (!commandTaskProviderHandoff.packages.length && !commandTaskProviderHandoff.blockedPackages.length)}
                      onClick={forwardTaskProviderHandoff}
                      type="button"
                    >
                      Forward to Runtime
                    </button>
                    <button
                      className="ml-2 mt-2 border border-white/20 px-2 py-1 text-[11px] font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={inspectProviderReceiptInbox}
                      type="button"
                    >
                      Receipt Inbox
                    </button>
                  </div>
                ) : null}
                {commandProviderReceiptInbox ? (
                  <div className="border border-cyan-200/25 bg-cyan-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/70">provider receipt inbox</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandProviderReceiptInbox.payloadShape} / waiting {commandProviderReceiptInbox.summary.waitingReceipt} / blocked {commandProviderReceiptInbox.summary.blockedBeforeDispatch} / action {commandProviderReceiptInbox.summary.actionRequired}
                    </p>
                    {commandProviderReceiptInbox.requests.slice(0, 1).map(request => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={request.requestId}>
                        {request.priority}: {request.callback.action} · {request.requiredEvidence.slice(0, 3).join(' / ')}
                      </p>
                    ))}
                    <button
                      className="mt-2 border border-cyan-200/50 px-2 py-1 text-[11px] font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={inspectProviderSandboxContract}
                      type="button"
                    >
                      Sandbox Contract
                    </button>
                  </div>
                ) : null}
                {commandProviderSandboxContract ? (
                  <div className="border border-lime-200/25 bg-lime-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/70">provider sandbox contract</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandProviderSandboxContract.payloadShape} / {commandProviderSandboxContract.verdict} / passed {commandProviderSandboxContract.summary.passed}/{commandProviderSandboxContract.summary.checks}
                    </p>
                    {commandProviderSandboxContract.checks.slice(0, 2).map(check => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={check.id}>
                        {check.status}: {check.label} · {check.nextAction}
                      </p>
                    ))}
                    <button
                      className="mt-2 border border-lime-200/50 px-2 py-1 text-[11px] font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={buildProviderLaunchTrainingPack}
                      type="button"
                    >
                      Launch Training Pack
                    </button>
                  </div>
                ) : null}
                {commandFirstForwardableRunPack ? (
                  <div className="border border-lime-200/25 bg-lime-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/70">first forwardable run</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandFirstForwardableRunPack.payloadShape} / {commandFirstForwardableRunPack.verdict} / forwardable {commandFirstForwardableRunPack.summary.forwardable} / handoff-only {commandFirstForwardableRunPack.summary.handoffOnly}
                    </p>
                    {commandFirstForwardableRunPack.selectedPackage ? (
                      <p className="mt-1 text-[11px] leading-4 text-white/45">
                        {commandFirstForwardableRunPack.selectedPackage.runtimeTarget}: {commandFirstForwardableRunPack.selectedPackage.requestedAction} / {commandFirstForwardableRunPack.selectedPackage.canForward ? 'ready' : commandFirstForwardableRunPack.selectedPackage.blockedReasons[0]}
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] leading-4 text-white/45">
                        No provider package selected. Mark one reviewed task as Provider Ready, then rebuild this preflight.
                      </p>
                    )}
                    <div className="mt-2 grid gap-1">
                      {commandFirstForwardableRunPack.stages.slice(0, 3).map(stage => (
                        <p className="text-[11px] leading-4 text-white/45" key={stage.id}>
                          {stage.status}: {stage.id} / {stage.nextAction}
                        </p>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] leading-4 text-white/35">
                      automation claim: {commandFirstForwardableRunPack.summary.canClaimAutomation ? 'ready' : 'blocked'} / callback: {commandFirstForwardableRunPack.selectedPackage?.callbackHeader || 'x-restaurant-agent-signature'}
                    </p>
                  </div>
                ) : null}
                {commandFirstRunControlTower ? (
                  <div className="border border-orange-200/25 bg-orange-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-100/70">first run control tower</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandFirstRunControlTower.payloadShape} / {commandFirstRunControlTower.verdict} / runs {commandFirstRunControlTower.summary.totalRuns} / waiting receipts {commandFirstRunControlTower.summary.waitingReceipts}
                    </p>
                    <div className="mt-2 grid gap-1">
                      {commandFirstRunControlTower.lanes.map(lane => (
                        <p className="text-[11px] leading-4 text-white/45" key={lane.id}>
                          {lane.status}: {lane.label} / {lane.owner} / {lane.nextAction}
                        </p>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] leading-4 text-white/35">
                      recovery: {commandFirstRunControlTower.summary.recoveryActions} / blocked lanes: {commandFirstRunControlTower.summary.blockedLanes} / claim: {commandFirstRunControlTower.summary.canClaimAutomation ? 'ready' : 'blocked'}
                    </p>
                    <p className="mt-2 text-[11px] leading-4 text-white/35">
                      {commandFirstRunControlTower.safetyBoundary}
                    </p>
                  </div>
                ) : null}
                {commandProviderLaunchTrainingPack ? (
                  <div className="border border-amber-200/25 bg-amber-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">provider launch training pack</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandProviderLaunchTrainingPack.payloadShape} / {commandProviderLaunchTrainingPack.verdict} / ready {commandProviderLaunchTrainingPack.summary.ready}/{commandProviderLaunchTrainingPack.summary.tracks}
                    </p>
                    {commandProviderLaunchTrainingPack.tracks.slice(0, 2).map(track => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={track.id}>
                        {track.status}: {track.title} · {track.nextAction}
                      </p>
                    ))}
                    {commandProviderLaunchTrainingPack.providerKeyChecklist.length ? (
                      <p className="mt-1 text-[11px] leading-4 text-white/45">
                        keys: {commandProviderLaunchTrainingPack.providerKeyChecklist.slice(0, 4).join(' / ')}
                      </p>
                    ) : null}
                    <button
                      className="mt-2 border border-amber-200/50 px-2 py-1 text-[11px] font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={inspectPlatformConnectorMatrix}
                      type="button"
                    >
                      Connector Matrix
                    </button>
                  </div>
                ) : null}
                {commandPlatformConnectorMatrix ? (
                  <div className="border border-sky-200/25 bg-sky-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">platform connector matrix</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandPlatformConnectorMatrix.payloadShape} / {commandPlatformConnectorMatrix.verdict} / env {commandPlatformConnectorMatrix.summary.configuredEnvKeys}/{commandPlatformConnectorMatrix.summary.totalEnvKeys}
                    </p>
                    {commandPlatformConnectorMatrix.connectors.slice(0, 3).map(connector => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={connector.id}>
                        {connector.status}: {connector.platform} · {connector.nextAction}
                      </p>
                    ))}
                    <button
                      className="mt-2 border border-sky-200/50 px-2 py-1 text-[11px] font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={inspectAiOsAuditReport}
                      type="button"
                    >
                      AI OS Audit
                    </button>
                  </div>
                ) : null}
                {commandAiOsAuditReport ? (
                  <div className="border border-violet-200/25 bg-violet-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/70">restaurant AI OS audit</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandAiOsAuditReport.payloadShape} / {commandAiOsAuditReport.verdict} / lanes {commandAiOsAuditReport.summary.lanes}
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-white/45">
                      usable {commandAiOsAuditReport.summary.usableNow} / manual {commandAiOsAuditReport.summary.manualReady} / provider {commandAiOsAuditReport.summary.providerRequired} / forbidden {commandAiOsAuditReport.summary.forbidden}
                    </p>
                    {commandAiOsAuditReport.topActions.slice(0, 2).map(action => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={`${action.owner}-${action.action}`}>
                        {action.owner}: {action.action}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                className="border border-emerald-200 bg-emerald-200 px-3 py-2 text-sm font-black text-stone-950 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={dispatchState.status === 'loading'}
                onClick={runControlledTrialRun}
                type="button"
              >
                Run Trial
              </button>
              <button
                className="border border-amber-200/70 px-3 py-2 text-sm font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={dispatchState.status === 'loading'}
                onClick={inspectExecutionTimeline}
                type="button"
              >
                Open Timeline
              </button>
              <button
                className="border border-teal-200/60 px-3 py-2 text-sm font-black text-teal-100 transition hover:bg-teal-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={dispatchState.status === 'loading'}
                onClick={buildExternalExecutionWizard}
                type="button"
              >
                Setup Gates
              </button>
              <button
                className="border border-orange-200/60 px-3 py-2 text-sm font-black text-orange-100 transition hover:bg-orange-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={dispatchState.status === 'loading'}
                onClick={inspectOperatingInsightReport}
                type="button"
              >
                Operating Insight
              </button>
              <button
                className="border border-cyan-200/60 px-3 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={dispatchState.status === 'loading'}
                onClick={buildPostRunReviewPack}
                type="button"
              >
                Post Run Review
              </button>
              <button
                className="border border-cyan-200/60 px-3 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={dispatchState.status === 'loading'}
                onClick={buildNextLoopChannelPlan}
                type="button"
              >
                Next Loop Plan
              </button>
              <button
                className="border border-violet-200/60 px-3 py-2 text-sm font-black text-violet-100 transition hover:bg-violet-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={dispatchState.status === 'loading'}
                onClick={inspectAiOsAuditReport}
                type="button"
              >
                AI OS Audit
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2 border border-white/10 bg-white/[0.04] p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">command payload</div>
              <p className="mt-1 text-xs leading-5 text-white/55">
                {dispatchState.commandCenter?.payloadShape || 'restaurant-agent-command-center-v1'} · {dispatchState.commandCenter?.headline || '刷新后由后端返回主动作、证据、外部缺口和安全边界。'}
              </p>
            </div>
            <button
              className="shrink-0 border border-white/25 px-3 py-2 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={refreshCommandCenter}
              type="button"
            >
              Refresh Center
            </button>
            <button
              className="shrink-0 border border-emerald-200/50 bg-emerald-200/10 px-3 py-2 text-sm font-black text-emerald-100 transition hover:bg-emerald-200/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={refreshResidentAgentMissionControl}
              type="button"
            >
              Resident Agent Control
            </button>
          </div>
        </div>
        <div className="mb-4 border border-white/10 bg-white/[0.05] p-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">Customer Operating Path</p>
              <h3 className="mt-1 text-lg font-black">客户默认只走 6 步：资料、试跑、刷新、时间线、店长跟进、外部缺口</h3>
            </div>
            <p className="max-w-2xl text-xs leading-5 text-white/55">
              这条路径对应真实餐饮经营动作；专家工具仍保留在下方折叠区，用于接 runtime、授权、训练和审计。
            </p>
          </div>
          <div className="mt-4 border border-cyan-200/25 bg-cyan-200/[0.05] p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/70">Claw Experience Default Path</div>
                <h4 className="mt-1 text-base font-black text-white">Start here: one runnable path before expert tools</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  Click once to create the restaurant brief, runnable Claw-style skill pack, task queue, staff handoff, provider checklist and proof boundary in one customer-facing sequence.
                </p>
              </div>
              <button
                className="border border-cyan-200 bg-cyan-200 px-4 py-3 text-left text-sm font-black text-stone-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={dispatchState.status === 'loading'}
                onClick={buildClawExperienceDefaultPath}
                type="button"
              >
                Start Default Path
                <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-700">Build Default Path</span>
              </button>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-4">
              {[
                {
                  label: 'Skill pack',
                  value: dispatchState.clawSkillWorkbench ? `${dispatchState.clawSkillWorkbench.summary.runnableNow} runnable` : 'creates runnable skills',
                  note: 'menu, content, private-domain and ops tasks',
                },
                {
                  label: 'Task queue',
                  value: commandTaskQueue ? `${commandTaskQueue.summary.open} open` : 'creates owner queue',
                  note: 'owner, proof, next action and stop line',
                },
                {
                  label: 'Staff handoff',
                  value: commandStaffNotificationHandoff ? `${commandStaffNotificationHandoff.summary.copyReady} copy ready` : 'creates shift handoff',
                  note: 'manager-ready message without private data',
                },
                {
                  label: 'Provider gates',
                  value: commandProviderSetupPack
                    ? `${commandProviderSetupPack.summary.missing} missing`
                    : commandTaskProviderHandoff
                      ? `${commandTaskProviderHandoff.summary.blocked} blocked`
                      : 'lists external keys',
                  note: 'runtime URL, grant, callback and data contract',
                },
              ].map(item => (
                <div className="border border-cyan-200/15 bg-stone-950/45 p-3" key={item.label}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/60">{item.label}</div>
                  <div className="mt-1 text-sm font-black text-white">{item.value}</div>
                  <p className="mt-1 text-[11px] leading-4 text-white/45">{item.note}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-2 text-[11px] leading-4 md:grid-cols-2">
              <div className="border border-emerald-200/15 bg-emerald-200/[0.03] p-2 text-emerald-100/65">
                merchant inputs to collect: offer rules, dish proof, target diners, channel choice, forbidden claims and store owner approval.
              </div>
              <div className="border border-rose-200/15 bg-rose-200/[0.03] p-2 text-rose-100/65">
                provider unlock sheet: External execution only unlocks after runtime URL, API key, merchant grant, callback and data contract are ready.
              </div>
            </div>
            <div className="mt-3 border border-amber-200/15 bg-amber-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/65">default path unlock package</div>
                  <p className="mt-1 text-xs font-black text-white">Default Path now creates Provider Setup Pack and External Unlock Request Pack.</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  The customer does not need to find expert tools first: one run returns server env placeholders, merchant authorization asks, owner signoff rows and the receipt template.
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-4">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">setup gates</div>
                  <div className="mt-1 text-xs font-black text-amber-100/75">{commandProviderSetupPack ? `${commandProviderSetupPack.summary.missing} missing` : 'created on start'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">env placeholders</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">
                    {dispatchState.providerSetupPack?.envTemplate.length ?? commandProviderSetupPack?.priorityRequests.filter(item => item.source === 'env').length ?? 'server-side only'}
                  </div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">signoff items</div>
                  <div className="mt-1 text-xs font-black text-cyan-100/75">{commandExternalUnlockRequestPack ? commandExternalUnlockRequestPack.signoffChecklist.length : 'created on start'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">external automation</div>
                  <div className="mt-1 text-xs font-black text-white">{commandExternalUnlockRequestPack?.summary.canClaimExternalAutomation ? 'ready' : 'blocked'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                <div className="border border-white/10 bg-stone-950/45 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">merchant handoff copy</div>
                  <div className="mt-2 grid gap-2">
                    {(commandProviderSetupPack?.copyForMerchant || commandExternalUnlockRequestPack?.customerHandoffCopy || [
                      'created after Start Default Path: customer-facing explanation for what can run internally and what needs authorization',
                    ]).slice(0, 3).map(item => (
                      <p className="border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/60" key={item}>{item}</p>
                    ))}
                  </div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">owner signoff queue</div>
                  <div className="mt-2 grid gap-2">
                    {(commandExternalUnlockRequestPack?.signoffChecklist || []).slice(0, 3).map(item => (
                      <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-amber-100/70">{item.priority}</span>
                          <span className="text-[10px] text-white/35">{item.handoffTarget}</span>
                        </div>
                        <p className="mt-1 text-[11px] leading-4 text-white/60">{item.title}</p>
                      </div>
                    ))}
                    {commandExternalUnlockRequestPack ? null : (
                      <p className="text-[11px] leading-4 text-white/40">created after Start Default Path</p>
                    )}
                  </div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">receipt + export digest</div>
                  <p className="mt-2 text-[11px] leading-4 text-white/60">
                    {commandExternalUnlockRequestPack?.acceptanceReceiptTemplate.title || 'Provider acceptance receipt template is created after Start Default Path.'}
                  </p>
                  <p className="mt-2 text-[11px] leading-4 text-cyan-100/60">
                    required: {commandExternalUnlockRequestPack?.acceptanceReceiptTemplate.requiredFields.slice(0, 4).join(' / ') || 'eventId / channel / evidenceUrl / externalRunId'}
                  </p>
                  <p className="mt-2 text-[11px] leading-4 text-white/40">
                    export: {commandExternalUnlockRequestPack ? `markdown ${commandExternalUnlockRequestPack.exportDigest.markdown.length} chars / csv ${commandExternalUnlockRequestPack.exportDigest.csv.split('\n').length - 1} rows` : 'markdown + csv created on start'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 border border-white/10 bg-white/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">competitor parity snapshot</div>
                  <p className="mt-1 text-xs font-black text-white">Internal execution now, external automation after Provider proof.</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  This keeps the Claw/Cloud promise honest: the workbench can prepare, queue, remember and review today; publishing, lead capture, redemption and live analysis need real platform access.
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-4">
                {[
                  { label: 'Ready inside', value: 'skill pack / task queue / memory', tone: 'text-emerald-100/70' },
                  { label: 'Training inside', value: 'merchant-approved samples', tone: 'text-amber-100/70' },
                  { label: 'Provider gated', value: 'publish / lead / redemption', tone: 'text-rose-100/70' },
                  { label: 'Data gated', value: 'POS / coupon / member analysis', tone: 'text-sky-100/70' },
                ].map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.label}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">{item.label}</div>
                    <div className={`mt-1 text-xs font-black ${item.tone}`}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 border border-emerald-200/15 bg-emerald-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/65">controlled run receipt</div>
                  <p className="mt-1 text-xs font-black text-white">Start Default Path also runs one local simulator receipt.</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  This proves the internal callback, receipt, run health and business-signal loop without logging in, publishing, redeeming coupons or claiming real operating results.
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">verdict</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.controlledTrialRun?.verdict || 'created on start'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">callback</div>
                  <div className="mt-1 text-xs font-black text-cyan-100/75">{dispatchState.controlledTrialRun?.simulation.callback.signatureVerified ? 'verified' : 'pending'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">receipt</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.controlledTrialRun?.simulation.receipt.status || 'created on start'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">run health</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.controlledTrialRun?.runHealth.summary.accepted ?? 0} accepted</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">business signal</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.controlledTrialRun?.businessSignals.summary.visitIntent ?? 0} visit intent</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.controlledTrialRun?.operatorCloseout || [
                  { owner: 'restaurant-ops', action: 'created after Start Default Path: review the accepted simulated receipt and decide the next provider unlock.', evidence: 'local simulator receipt' },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={`${item.owner}-${item.evidence}`}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">{item.owner}</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/60">{item.action}</p>
                    <p className="mt-1 text-[11px] leading-4 text-emerald-100/55">evidence: {item.evidence}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 border border-sky-200/15 bg-sky-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/65">browser runner simulation lane</div>
                  <p className="mt-1 text-xs font-black text-white">Default Path prepares the OpenClaw/Hermes browser gateway before real Provider execution.</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  The lane returns request schema, allowlisted actions, snapshot policy, callback contract and runner loop blockers without storing cookies, tokens, private messages or raw POS rows.
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">gateway</div>
                  <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.browserGatewayPack?.canExecuteNow ? 'ready' : 'blocked'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">accepted actions</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.browserGatewayPack?.browserRequest.acceptedActions.length ?? 'created on start'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">runner loop</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.runtimeRunnerLoopPack?.verdict || 'created on start'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">waiting receipts</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.runtimeRunnerLoopPack?.summary.waitingReceipts ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">runner events</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.runtimeRunnerLoopPack?.summary.runnerEvents ?? 0}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.browserGatewayPack?.actionSchema || [
                  { action: 'open_public_page', allowed: false, requiredEvidence: ['created after Start Default Path'], stopIf: ['provider gates missing'] },
                  { action: 'capture_public_proof', allowed: false, requiredEvidence: ['screenshot id'], stopIf: ['private data visible'] },
                  { action: 'send_signed_receipt', allowed: false, requiredEvidence: ['x-restaurant-agent-signature'], stopIf: ['callback secret missing'] },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.action}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-sky-100/70">{item.action}</span>
                      <span className={item.allowed ? 'text-[10px] text-emerald-100/70' : 'text-[10px] text-rose-100/70'}>{item.allowed ? 'allowed' : 'blocked'}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">proof: {item.requiredEvidence.slice(0, 2).join(' / ')}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">stop: {item.stopIf.slice(0, 2).join(' / ')}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-sky-100/55">
                next runner action: {dispatchState.runtimeRunnerLoopPack?.nextBestAction || 'Configure runtime key, callback secret, isolated browser profile and merchant authorization before external browser execution.'}
              </p>
            </div>
            <div className="mt-3 border border-violet-200/15 bg-violet-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/65">publish execution inbox</div>
                  <p className="mt-1 text-xs font-black text-white">Default Path now converts publish, browser runner, receipt, recovery and memory work into one execution queue.</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  It is the operator-facing layer for auto-publish parity: prepare internally, run through Provider only when allowed, accept proof, then recover or write memory.
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">verdict</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.publishExecutionInbox?.verdict || 'provider-unlock-first'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">tasks</div>
                  <div className="mt-1 text-xs font-black text-violet-100/75">{dispatchState.publishExecutionInbox?.summary.tasks ?? 6}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">ready inside</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.publishExecutionInbox?.summary.readyInternal ?? 1}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">waiting proof</div>
                  <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.publishExecutionInbox?.summary.waitingProof ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">auto publish</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.publishExecutionInbox?.summary.canClaimAutoPublish ? 'ready' : 'blocked'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">browser execute</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.publishExecutionInbox?.summary.canClaimBrowserExecution ? 'ready' : 'gated'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.publishExecutionInbox?.tasks || [
                  { id: 'prepare-publish-package', title: 'Prepare publish package and proof slot', status: 'ready-internal', owner: 'ops', lane: 'publish', action: 'Prepare approved content, target platform and proof slot.', evidenceRequired: ['approved content', 'target channel'], stopLine: 'Do not publish before proof is accepted.' },
                  { id: 'submit-browser-runner', title: 'Submit governed browser runner task', status: 'waiting-provider', owner: 'runtime-admin', lane: 'browser-runner', action: 'Collect runtime URL/key, callback secret, isolated profile and merchant authorization.', evidenceRequired: ['gateway id', 'runtime health'], stopLine: 'Stop on login challenge, captcha or private inbox.' },
                  { id: 'recover-failed-run', title: 'Recover blocked, stale or failed runner run', status: 'blocked', owner: 'runtime-admin', lane: 'recovery', action: 'Run failure recovery and manual fallback if proof does not arrive.', evidenceRequired: ['blocked reason', 'retry attempt'], stopLine: 'Retry at most twice; never loop platform actions automatically.' },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{item.title}</span>
                      <span className={item.status === 'ready-internal' || item.status === 'done' ? 'text-[10px] text-emerald-100/70' : item.status === 'waiting-proof' ? 'text-[10px] text-sky-100/70' : item.status === 'waiting-provider' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-rose-100/70'}>{item.status}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-violet-100/55">{item.owner} / {item.lane}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{item.action}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">proof: {item.evidenceRequired.slice(0, 2).join(' / ')}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/50">{item.stopLine}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.publishExecutionInbox?.runnerCommands || [
                  { action: 'open_public_page', allowed: false, writesTo: 'runner-event', requiredEvidence: ['opened url'], stopIf: ['domain not allowlisted'] },
                  { action: 'capture_public_proof', allowed: false, writesTo: 'runner-event', requiredEvidence: ['screenshot id'], stopIf: ['private data visible'] },
                  { action: 'send_signed_receipt', allowed: false, writesTo: 'signed-receipt', requiredEvidence: ['signature'], stopIf: ['callback secret missing'] },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-white/[0.04] p-2" key={item.action}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-white">{item.action}</span>
                      <span className={item.allowed ? 'text-[10px] text-emerald-100/70' : 'text-[10px] text-rose-100/70'}>{item.allowed ? 'allowed' : 'blocked'}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-violet-100/55">writes: {item.writesTo}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">stop: {item.stopIf.slice(0, 2).join(' / ')}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-violet-100/55">
                failure recovery: {(dispatchState.publishExecutionInbox?.failureRecovery || [
                  { nextStep: 'Configure runtime key, callback secret, isolated browser profile and merchant authorization before external browser execution.' },
                  { nextStep: 'Use manual fallback and import public proof if Provider proof does not arrive.' },
                ]).slice(0, 3).map(item => item.nextStep).join(' / ')}
              </p>
            </div>
            <div className="mt-3 border border-amber-200/15 bg-amber-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/65">provider readiness ladder</div>
                  <p className="mt-1 text-xs font-black text-white">Default Path now shows exactly which Claw/Cloud-style abilities are internal-ready and which need external Provider setup.</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  This is the unlock path for auto publish proof, auto lead capture, coupon redemption, operating analysis, persistent browser tasks and memory follow-up without pretending they are live before Provider health is ready.
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">capabilities</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.providerUnlockLadder?.summary.capabilities ?? 6}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">health ready</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.providerUnlockLadder?.summary.providerHealthReady ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">setup signed</div>
                  <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.providerUnlockLadder?.summary.setupEvidenceSigned ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">external blocked</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.providerUnlockLadder?.summary.externalBlocked ?? dispatchState.providerLaunchBoard?.summary.missingProvider ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">automation claim</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.providerUnlockLadder?.summary.canClaimExternalAutomation ? 'ready' : 'blocked'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.providerUnlockLadder?.items || [
                  { id: 'persistent-browser', label: 'Persistent browser agent', stage: 'external-blocked', internalCanDo: 'Build governed task packages, recovery runbooks and proof requirements.', nextAction: 'Provide OpenClaw/Hermes/Lobu URL and API key through server-side env.', stillNeeds: ['runtime URL/key and callback secret'] },
                  { id: 'auto-publish-proof', label: 'Auto publish and proof capture', stage: 'external-blocked', internalCanDo: 'Prepare channel copy, staff checklist and proof ledger without claiming publication.', nextAction: 'Provide scoped merchant platform authorization and signed proof callback.', stillNeeds: ['merchant platform authorization'] },
                  { id: 'operating-analysis', label: 'True operating analysis', stage: 'external-blocked', internalCanDo: 'Separate observations from measured store operation signals.', nextAction: 'Provide aggregate POS, coupon and redemption data contract.', stillNeeds: ['aggregate POS/coupon field dictionary'] },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{item.label}</span>
                      <span className={item.stage === 'provider-health-ready' ? 'text-[10px] text-emerald-100/70' : item.stage === 'setup-evidence-signed' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{item.stage}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">internal: {item.internalCanDo}</p>
                    <p className="mt-1 text-[11px] leading-4 text-amber-100/55">next: {item.nextAction}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-amber-100/55">
                external asks: {(dispatchState.providerUnlockLadder?.nextExternalAsks || dispatchState.providerLaunchBoard?.externalRequired || ['runtime URL/key', 'merchant platform authorization', 'signed callback secret', 'aggregate POS/coupon data contract']).slice(0, 5).join(' / ')}
              </p>
            </div>
            <div className="mt-3 border border-emerald-200/15 bg-emerald-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/65">restaurant capability coverage map</div>
                  <p className="mt-1 text-xs font-black text-white">Default Path covers the restaurant AI product surface: public profile, content, publish proof, lead intake, coupon redemption and operating analysis.</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  It separates internal workbench value from Provider-required lanes across Dianping/Meituan, Xiaohongshu, Douyin, WeChat community, POS/coupon systems and persistent runtime.
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">connectors</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.platformConnectorMatrix?.summary.connectors ?? 7}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">internal ready</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.platformConnectorMatrix?.summary.internalReady ?? 1}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">provider required</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.platformConnectorMatrix?.summary.providerRequired ?? dispatchState.platformConnectorMatrix?.summary.blocked ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">env keys</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.platformConnectorMatrix ? `${dispatchState.platformConnectorMatrix.summary.configuredEnvKeys}/${dispatchState.platformConnectorMatrix.summary.totalEnvKeys}` : '0/required'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">verdict</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.platformConnectorMatrix?.verdict || 'provider-setup-required'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.platformConnectorMatrix?.capabilityCoverage || [
                  { capability: 'auto-publish', internalConnectors: [], providerConnectors: ['dianping-meituan', 'xiaohongshu', 'douyin', 'agent-runtime-provider'], missingEvidence: ['merchant authorization', 'signed callback receipt'] },
                  { capability: 'coupon-redemption', internalConnectors: [], providerConnectors: ['dianping-meituan', 'pos-redemption'], missingEvidence: ['aggregate redemption counts', 'field dictionary'] },
                  { capability: 'operating-analysis', internalConnectors: [], providerConnectors: ['pos-redemption'], missingEvidence: ['sanitized POS sample', 'source time window'] },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.capability}>
                    <div className="text-xs font-black text-white">{item.capability}</div>
                    <p className="mt-1 text-[11px] leading-4 text-emerald-100/55">internal: {item.internalConnectors.slice(0, 2).join(' / ') || 'planning and proof slots only'}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/55">provider: {item.providerConnectors.slice(0, 3).join(' / ') || 'none'}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">proof: {item.missingEvidence.slice(0, 2).join(' / ')}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-emerald-100/55">
                pilot order: {(dispatchState.platformConnectorMatrix?.pilotOrder || ['Start with public-profile-intake and internal content draft.', 'Configure one browser runtime and callback secret for sandbox submit.', 'Add POS/redemption aggregate sample before claiming operating analysis.']).slice(0, 3).join(' / ')}
              </p>
            </div>
            <div className="mt-3 border border-sky-200/15 bg-sky-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/65">lead capture inbox</div>
                  <p className="mt-1 text-xs font-black text-white">Default Path now turns reservations, coupon claims, private-domain inquiries, visit intent and review recovery into a governed lead queue.</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  Auto lead capture and customer contact stay blocked until merchant authorization, channel provider, callback receipts and no-PII data contracts are configured.
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">verdict</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.leadCaptureInbox?.verdict || 'provider-unlock-first'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">signals</div>
                  <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.leadCaptureInbox?.summary.aggregateSignals ?? dispatchState.businessSignals?.summary.visitIntent ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">lead items</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.leadCaptureInbox?.summary.leadItems ?? 5}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">today</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.leadCaptureInbox?.summary.todayItems ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">auto lead capture</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.leadCaptureInbox?.summary.canClaimAutoLeadCapture ? 'ready' : 'blocked'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">customer contact</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.leadCaptureInbox?.summary.canClaimAutoCustomerContact ? 'ready' : 'blocked'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-5">
                {(dispatchState.leadCaptureInbox?.sources || [
                  { id: 'reservation', label: 'Reservation and waitlist intent', status: 'provider-gated', signalCount: 0, nextAction: 'Import sanitized reservation aggregate before routing table intent.' },
                  { id: 'coupon-claim', label: 'Coupon and group-buy claims', status: 'provider-gated', signalCount: 0, nextAction: 'Collect coupon rule proof and aggregate claim count.' },
                  { id: 'private-domain-inquiry', label: 'Private-domain inquiry summary', status: 'provider-gated', signalCount: 0, nextAction: 'Keep as manual summary until staff channel provider is configured.' },
                  { id: 'visit-intent', label: 'Visit intent from public proof', status: 'needs-evidence', signalCount: 0, nextAction: 'Collect public proof or accepted receipt before claiming visit intent.' },
                  { id: 'review-recovery', label: 'Review-triggered service recovery', status: 'needs-evidence', signalCount: 0, nextAction: 'Build a reputation closeout pack before review-led follow-up.' },
                ]).slice(0, 5).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{item.label}</span>
                      <span className={item.status === 'internal-ready' ? 'text-[10px] text-emerald-100/70' : item.status === 'needs-evidence' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{item.status}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-sky-100/60">signals: {item.signalCount}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/45">{item.nextAction}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.leadCaptureInbox?.leadItems || [
                  { id: 'lead-reservation-capacity', title: 'Confirm reservation capacity before replying', priority: 'blocked', owner: 'store-manager', signalCount: 0, staffAction: 'Check service window, table capacity and queue pressure.', evidenceRequired: 'service window + capacity note + aggregate reservation count', stopLine: 'No automatic confirmation without provider authorization.' },
                  { id: 'lead-coupon-redemption-prep', title: 'Prepare coupon claim to redemption follow-up', priority: 'blocked', owner: 'ops', signalCount: 0, staffAction: 'Clarify coupon validity, exclusions and redemption window.', evidenceRequired: 'coupon rule proof + aggregate claim count', stopLine: 'No coupon redemption or ROI claim without evidence.' },
                  { id: 'lead-private-domain-summary', title: 'Classify private-domain inquiries without storing chats', priority: 'blocked', owner: 'community-ops', signalCount: 0, staffAction: 'Summarize aggregate inquiry themes and draft staff-approved replies.', evidenceRequired: 'source channel + aggregate count + approved reply script', stopLine: 'No private message read or customer contact automation.' },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{item.title}</span>
                      <span className={item.priority === 'today' ? 'text-[10px] text-emerald-100/70' : item.priority === 'next-shift' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-rose-100/70'}>{item.priority}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-sky-100/55">{item.owner} / signals {item.signalCount}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{item.staffAction}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">proof: {item.evidenceRequired}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/50">{item.stopLine}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-sky-100/55">
                provider unlocks: {(dispatchState.leadCaptureInbox?.providerUnlocks || ['merchant platform authorization for lead sources', 'staff channel provider and recipient-role approval', 'callback secret and accepted receipt schema']).slice(0, 4).join(' / ')}
              </p>
            </div>
            <div className="mt-3 border border-fuchsia-200/15 bg-fuchsia-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/65">restaurant AI cockpit zones</div>
                  <p className="mt-1 text-xs font-black text-white">Default Path now lands in an operator cockpit: today operations, AI consultant, automation launch and evidence review.</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  This turns the Claw/Cloud-style promise into a daily store-manager surface: what to do now, what evidence is missing, what Provider unlock is next and what cannot be claimed yet.
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">verdict</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.aiCockpit?.verdict || 'provider-unlock-first'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">zones</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.aiCockpit?.summary.zones ?? 4}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">today blocks</div>
                  <div className="mt-1 text-xs font-black text-fuchsia-100/75">{dispatchState.aiCockpit?.summary.todayBlocks ?? dispatchState.storeOperatingPlan?.summary.timeBlocks ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">provider unlocks</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.aiCockpit?.summary.providerUnlocks ?? dispatchState.storeOperatingPlan?.providerUnlocks.length ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">automation</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.aiCockpit?.summary.canClaimAutomation ? 'ready' : 'blocked'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-4">
                {(dispatchState.aiCockpit?.zones || [
                  { id: 'today-operations', title: 'Today Operations', status: 'provider-gated', owner: 'store-manager', answer: 'Confirm the offer, service window, owner and proof requirements before today starts.', primaryAction: 'Run the store operating plan.', visibleProof: ['owner and proof requirements'], providerGate: 'merchant evidence and provider unlocks', stopLine: 'Do not push demand without confirmed store boundaries.' },
                  { id: 'ai-consultant', title: 'AI Consultant', status: 'needs-evidence', owner: 'ops', answer: 'Turn advice into owner-visible plays.', primaryAction: 'Build restaurant consultant prescription.', visibleProof: ['owner-visible plays'], providerGate: 'training evidence', stopLine: 'Advice becomes a task only with evidence.' },
                  { id: 'automation-launch', title: 'Automation Launch', status: 'provider-gated', owner: 'runtime-admin', answer: 'Choose one Provider lane and run a signed sandbox receipt.', primaryAction: 'Configure provider keys, merchant grants, callback and data contracts.', visibleProof: ['provider launch board'], providerGate: 'runtime and callback', stopLine: 'No external automation claim without receipt.' },
                  { id: 'evidence-review', title: 'Evidence Review', status: 'needs-evidence', owner: 'finance', answer: 'Closeout only uses public proof and sanitized aggregate operating data.', primaryAction: 'Import accepted proof and aggregate rows.', visibleProof: ['proof receipt'], providerGate: 'POS/coupon field dictionary', stopLine: 'No raw POS or customer identifiers.' },
                ]).slice(0, 4).map(zone => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={zone.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{zone.title}</span>
                      <span className={zone.status === 'ready-internal' ? 'text-[10px] text-emerald-100/70' : zone.status === 'needs-evidence' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{zone.status}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{zone.answer}</p>
                    <p className="mt-1 text-[11px] leading-4 text-fuchsia-100/55">action: {zone.primaryAction}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">gate: {zone.providerGate}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-fuchsia-100/55">
                daily runbook: {(dispatchState.aiCockpit?.primaryRunbook || ['Open Today Operations first and confirm merchant evidence.', 'Move Automation Launch one lane at a time through Provider health.', 'Close Evidence Review with public proof or sanitized aggregate imports.']).slice(0, 3).join(' / ')}
              </p>
            </div>
            <div className="mt-3 border border-lime-200/15 bg-lime-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/65">reservation redemption closeout loop</div>
                  <p className="mt-1 text-xs font-black text-white">Default Path now closes the loop from reservations and coupon claims into POS aggregate import, redemption review and next-shift actions.</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  It uses sanitized aggregate rows only: no phone numbers, member ids, raw order rows, payment ids, coupon codes or private chat content.
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">POS rows</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.posImport?.summary.validRows ?? 2}/{dispatchState.posImport?.summary.totalRows ?? 2}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">reservations</div>
                  <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.businessSignals?.summary.reservations ?? dispatchState.controlledTrialRun?.businessSignals.summary.reservations ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">coupon claims</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.posImport?.summary.couponClaimCount ?? 50}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">redemptions</div>
                  <div className="mt-1 text-xs font-black text-lime-100/75">{dispatchState.posImport?.summary.redemptionCount ?? 29}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">analysis</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.operatingInsightReport?.verdict || 'usable-internal-analysis'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">next loop</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.nextLoopChannelPlan?.verdict || 'ready-for-internal-shift'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.operatingInsightReport?.insights || [
                  { id: 'coupon-redemption-rate', label: 'Coupon claim to redemption rate', status: 'measured', value: '58% (29/50)', evidence: ['sanitized POS aggregate'], interpretation: 'Calculated from sanitized aggregate rows.', nextAction: 'Confirm coupon window before changing offer.' },
                  { id: 'order-sales-aggregate', label: 'Order and gross sales aggregate', status: 'measured', value: '58 orders / gross sales 4456.00', evidence: ['accepted imports=1'], interpretation: 'Usable as aggregate evidence.', nextAction: 'Compare service capacity and stock readiness.' },
                  { id: 'prep-inventory-pressure', label: 'Prep and inventory pressure', status: 'directional', value: '29 units', evidence: ['inventoryUsed aggregate'], interpretation: 'Directional until stockout and waste definitions are confirmed.', nextAction: 'Confirm prep-batch definition.' },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{item.label}</span>
                      <span className={item.status === 'measured' ? 'text-[10px] text-emerald-100/70' : item.status === 'directional' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{item.status}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-lime-100/60">{item.value}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/45">{item.nextAction}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-lime-100/55">
                next-shift actions: {(dispatchState.nextLoopChannelPlan?.scheduledActions || [
                  { action: 'Assign service-prep task from accepted receipt and POS aggregate.' },
                  { action: 'Draft owner-reviewed community follow-up from aggregate visit intent.' },
                  { action: 'Keep Provider unlock blocked until runtime, merchant grant and POS contract are configured.' },
                ]).slice(0, 3).map(item => item.action).join(' / ')}
              </p>
            </div>
            <div className="mt-3 border border-cyan-200/15 bg-cyan-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/65">reputation and service recovery loop</div>
                  <p className="mt-1 text-xs font-black text-white">Public reviews, comment themes and service issues become owner-reviewed replies, recovery tasks and the next content loop.</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  Auto review reply stays blocked until merchant authorization, platform/provider sync, callback proof and consent boundaries exist.
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">verdict</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.reputationCloseoutPack?.verdict || 'needs-public-proof'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">sources</div>
                  <div className="mt-1 text-xs font-black text-cyan-100/75">{dispatchState.reputationCloseoutPack?.summary.sources ?? 5}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">internal ready</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.reputationCloseoutPack?.summary.internalReady ?? 2}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">needs proof</div>
                  <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.reputationCloseoutPack?.summary.needsPublicProof ?? 2}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">auto review reply</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.reputationCloseoutPack?.summary.canClaimAutoReviewReply ? 'ready' : 'blocked'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">analytics</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.reputationCloseoutPack?.summary.canClaimReviewAnalytics ? 'evidence-ready' : 'evidence-gated'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.reputationCloseoutPack?.themes || [
                  { id: 'taste-offer-fit', label: 'Dish taste and offer fit', signal: 'unknown', operatorAction: 'Collect public proof before turning taste claims into content.', staffScript: 'Confirm availability and service window before recommending add-ons.' },
                  { id: 'wait-time-service', label: 'Wait time and service recovery', signal: 'mixed', operatorAction: 'Attach queue handling and staff owner to the next follow-up loop.', staffScript: 'Explain expected wait and offer a clear reservation or pickup alternative.' },
                  { id: 'coupon-expectation', label: 'Coupon expectation and redemption clarity', signal: 'risk', operatorAction: 'Import sanitized coupon/POS aggregate before judging coupon friction.', staffScript: 'Confirm coupon validity, excluded items and redemption steps before guests arrive.' },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{item.label}</span>
                      <span className={item.signal === 'positive' ? 'text-[10px] text-emerald-100/70' : item.signal === 'mixed' ? 'text-[10px] text-sky-100/70' : item.signal === 'risk' ? 'text-[10px] text-rose-100/70' : 'text-[10px] text-white/45'}>{item.signal}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-cyan-100/60">{item.operatorAction}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/40">staff: {item.staffScript}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.reputationCloseoutPack?.responseDrafts || [
                  { platform: 'Dianping/Meituan', status: 'staff-review', draft: 'Store manager reviews the final reply from public proof.', proofNeeded: 'public review/proof URL or screenshot id' },
                  { platform: 'Xiaohongshu/Douyin', status: 'staff-review', draft: 'Use approved dish details, photos and visit scenes only.', proofNeeded: 'approved public note/video proof and photo rights' },
                  { platform: 'WeChat community', status: 'provider-gated', draft: 'Generate staff talk track only; do not send automatically.', proofNeeded: 'staff approval and consent boundary' },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-white/[0.04] p-2" key={item.platform}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{item.platform}</span>
                      <span className={item.status === 'staff-review' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-rose-100/70'}>{item.status}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{item.draft}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">proof: {item.proofNeeded}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-cyan-100/55">
                service recovery: {(dispatchState.reputationCloseoutPack?.recoveryQueue || [
                  { action: 'Confirm wait-time, stock and service-window boundaries before the next content push.' },
                  { action: 'Prepare a staff reply script for coupon validity and redemption steps.' },
                  { action: 'Keep auto-reply and review inbox sync blocked until merchant authorization is configured.' },
                ]).slice(0, 3).map(item => item.action).join(' / ')}
              </p>
            </div>
            {dispatchState.clawExperienceDefaultPath ? (
              <>
                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="font-mono text-white">{dispatchState.clawExperienceDefaultPath.summary.steps}</div>
                    <p className="mt-1 text-white/55">steps</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="font-mono text-white">{dispatchState.clawExperienceDefaultPath.summary.readyNow}</div>
                    <p className="mt-1 text-white/55">ready</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="font-mono text-white">{dispatchState.clawExperienceDefaultPath.summary.reviewNeeded}</div>
                    <p className="mt-1 text-white/55">review</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="font-mono text-white">{dispatchState.clawExperienceDefaultPath.summary.trainingNeeded}</div>
                    <p className="mt-1 text-white/55">training</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="font-mono text-white">{dispatchState.clawExperienceDefaultPath.summary.providerGated}</div>
                    <p className="mt-1 text-white/55">gated</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="font-mono text-white">{dispatchState.clawExperienceDefaultPath.summary.canClaimExternalAutomation ? 'ready' : 'blocked'}</div>
                    <p className="mt-1 text-white/55">external auto</p>
                  </div>
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-xs leading-5 text-cyan-100/70">{dispatchState.clawExperienceDefaultPath.answerForCustomer}</p>
                <div className="mt-3 grid gap-2 lg:grid-cols-7">
                  {dispatchState.clawExperienceDefaultPath.primaryPath.map(step => (
                    <div className="border border-white/10 bg-stone-950/50 p-2" key={step.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{step.label}</span>
                        <span className={step.status === 'ready-now' ? 'text-[10px] text-emerald-100/70' : step.status === 'review-needed' ? 'text-[10px] text-sky-100/70' : step.status === 'training-needed' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-rose-100/70'}>{step.status}</span>
                      </div>
                      <p className="mt-2 text-[11px] leading-4 text-white/55">{step.customerAction}</p>
                      <p className="mt-2 text-[11px] leading-4 text-white/35">proof: {step.evidenceRequired}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">training now</div>
                    <p className="mt-2 text-[11px] leading-4 text-amber-100/65">{dispatchState.clawExperienceDefaultPath.trainingNow.slice(0, 8).join(' / ') || 'none'}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">provider needed</div>
                    <p className="mt-2 text-[11px] leading-4 text-rose-100/65">{dispatchState.clawExperienceDefaultPath.providerNeeded.slice(0, 8).join(' / ') || 'none'}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">quick actions</div>
                    <p className="mt-2 text-[11px] leading-4 text-white/45">{dispatchState.clawExperienceDefaultPath.quickActions.map(item => item.label).join(' / ')}</p>
                    <p className="mt-2 text-[11px] leading-4 text-white/35">{dispatchState.clawExperienceDefaultPath.safetyBoundary}</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  <div className="border border-emerald-200/20 bg-emerald-200/[0.04] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/65">merchant inputs to collect</div>
                    <div className="mt-2 grid gap-2">
                      {dispatchState.clawExperienceDefaultPath.routeDecision.merchantInputsNeeded.slice(0, 6).map(item => (
                        <div className="border border-white/10 bg-stone-950/40 p-2 text-[11px] leading-4 text-white/60" key={item}>{item}</div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-rose-200/20 bg-rose-200/[0.04] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-100/65">provider unlock sheet</div>
                    <div className="mt-2 grid gap-2">
                      {dispatchState.clawExperienceDefaultPath.routeDecision.providerKeyChecklist.slice(0, 6).map(item => (
                        <div className="border border-white/10 bg-stone-950/40 p-2 text-[11px] leading-4 text-white/60" key={item}>{item}</div>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] leading-4 text-rose-100/55">
                      External execution only unlocks after these keys, grants, callbacks and data contracts are provided.
                    </p>
                  </div>
                </div>
              </>
            ) : null}
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-6">
            <button
              className="border border-emerald-200/50 bg-emerald-200/10 px-3 py-3 text-left text-xs font-black text-emerald-100 transition hover:bg-emerald-200/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={importPublicProfile}
              type="button"
            >
              <span className="block text-[10px] uppercase tracking-[0.14em] text-white/40">1 导入门店</span>
              公开资料入档
            </button>
            <button
              className="border border-emerald-200 bg-emerald-200 px-3 py-3 text-left text-xs font-black text-stone-950 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={runControlledTrialRun}
              type="button"
            >
              <span className="block text-[10px] uppercase tracking-[0.14em] text-stone-600">2 受控试跑</span>
              生成回执
            </button>
            <button
              className="border border-white/25 px-3 py-3 text-left text-xs font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={refreshCommandCenter}
              type="button"
            >
              <span className="block text-[10px] uppercase tracking-[0.14em] text-white/40">3 刷新主控台</span>
              看下一步
            </button>
            <button
              className="border border-amber-200/70 px-3 py-3 text-left text-xs font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectExecutionTimeline}
              type="button"
            >
              <span className="block text-[10px] uppercase tracking-[0.14em] text-white/40">4 时间线</span>
              查负责人和证据
            </button>
            <button
              className="border border-teal-200/60 px-3 py-3 text-left text-xs font-black text-teal-100 transition hover:bg-teal-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildStoreManagerFollowup}
              type="button"
            >
              <span className="block text-[10px] uppercase tracking-[0.14em] text-white/40">5 店长跟进</span>
              生成任务和话术
            </button>
            <button
              className="border border-teal-200/60 px-3 py-3 text-left text-xs font-black text-teal-100 transition hover:bg-teal-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildExternalExecutionWizard}
              type="button"
            >
              <span className="block text-[10px] uppercase tracking-[0.14em] text-white/40">6 外部缺口</span>
              列 Provider / 授权
            </button>
          </div>
        </div>
        <details className="border border-white/10 bg-white/[0.03] p-4">
          <summary className="cursor-pointer text-sm font-black text-white">
            Expert Runtime Tools · 展开底层 runtime / provider / training 工具
          </summary>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">Lobu Compatible Dispatch</p>
              <h3 className="mt-1 text-lg font-black">先接一个：本地运行层已能真实入队</h3>
              <p className="mt-2 max-w-3xl text-xs leading-5 text-white/70">
                这个按钮会调用本项目 API，把浏览器发布检查转成 tenant event、worker payload、结构化记忆和审计日志。
                检查外部 Bridge 时会先合成带 grant、browser session、callback 和停止条件的执行投递包；它不会打开外部平台，也不会读取私信、POS 或核销后台。
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {intakePreview.map(item => (
                  <div className="border border-white/10 bg-white/5 px-3 py-2" key={item.label}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">{item.label}</div>
                    <div className="mt-1 truncate text-xs font-black text-white" title={item.value}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
            <button
              className="border border-amber-200 bg-amber-200 px-4 py-2 text-sm font-black text-stone-950 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={queueLocalTask}
              type="button"
            >
              {dispatchState.status === 'loading' ? '入队中' : '生成本地 Agent 任务'}
            </button>
            <button
              className="border border-emerald-200 bg-emerald-200 px-4 py-2 text-sm font-black text-stone-950 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildTrialWorkflowPack}
              type="button"
            >
              Build Trial Workflow Pack
            </button>
            <button
              className="border border-white/20 px-4 py-2 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={checkLobuBridge}
              type="button"
            >
              检查 Lobu 外部 Bridge
            </button>
            <button
              className="border border-orange-200/40 px-4 py-2 text-sm font-black text-orange-100 transition hover:bg-orange-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={importPosRedemptionSample}
              type="button"
            >
              POS Import Validator
            </button>
            <button
              className="border border-lime-200/40 px-4 py-2 text-sm font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectCapabilityTrainingPlan}
              type="button"
            >
              生成能力训练计划
            </button>
            <button
              className="border border-lime-200/40 px-4 py-2 text-sm font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectClawSkillCatalog}
              type="button"
            >
              加载 Claw 能力库
            </button>
            <button
              className="border border-cyan-200/40 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildClawSkillWorkbench}
              type="button"
            >
              Open Skill Workbench
            </button>
            <button
              className="border border-lime-200/40 px-4 py-2 text-sm font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectBenchmarkStrategy}
              type="button"
            >
              判断产品底座
            </button>
            <button
              className="border border-lime-200/40 px-4 py-2 text-sm font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildActivationCockpit}
              type="button"
            >
              Build Activation Cockpit
            </button>
            <button
              className="border border-sky-200/40 px-4 py-2 text-sm font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildChannelHub}
              type="button"
            >
              Build Channel Hub
            </button>
            <button
              className="border border-sky-200/40 px-4 py-2 text-sm font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={attemptChannelDelivery}
              type="button"
            >
              Attempt Staff Delivery
            </button>
            <button
              className="border border-sky-200/40 px-4 py-2 text-sm font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={runChannelSchedule}
              type="button"
            >
              Run Due Schedule
            </button>
            <button
              className="border border-lime-200/40 px-4 py-2 text-sm font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildClawTrainingBatch}
              type="button"
            >
              生成 Claw 训练批次
            </button>
            <button
              className="border border-emerald-200/40 px-4 py-2 text-sm font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectPlatformOperatingSpine}
              type="button"
            >
              Build Platform Operating Spine
            </button>
            <button
              className="border border-orange-200/40 px-4 py-2 text-sm font-black text-orange-100 transition hover:bg-orange-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectOperatingDataContract}
              type="button"
            >
              Build Operating Data Contract
            </button>
            <button
              className="border border-lime-200/40 px-4 py-2 text-sm font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={recordCapabilityTrainingSample}
              type="button"
            >
              写入 Claw 训练样本
            </button>
            <button
              className="border border-emerald-200/40 px-4 py-2 text-sm font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={runHeartbeat}
              type="button"
            >
              运行 Heartbeat Watcher
            </button>
            <button
              className="border border-white/20 px-4 py-2 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={refreshReadiness}
              type="button"
            >
              检查外部接入条件
            </button>
            <button
              className="border border-sky-200/40 px-4 py-2 text-sm font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={importSampleReceipt}
              type="button"
            >
              导入样例回执
            </button>
            <button
              className="border border-rose-200/40 px-4 py-2 text-sm font-black text-rose-100 transition hover:bg-rose-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildRecoveryPlan}
              type="button"
            >
              生成失败恢复计划
            </button>
            <button
              className="border border-violet-200/40 px-4 py-2 text-sm font-black text-violet-100 transition hover:bg-violet-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildBrowserSession}
              type="button"
            >
              生成浏览器 Session
            </button>
            <button
              className="border border-amber-200/40 px-4 py-2 text-sm font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildGrantManifest}
              type="button"
            >
              生成授权 Grant
            </button>
            <button
              className="border border-yellow-200/40 px-4 py-2 text-sm font-black text-yellow-100 transition hover:bg-yellow-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildGrantChecklist}
              type="button"
            >
              Grant Checklist Wizard
            </button>
            <button
              className="border border-yellow-200/40 px-4 py-2 text-sm font-black text-yellow-100 transition hover:bg-yellow-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectActivationGates}
              type="button"
            >
              检查能力激活门禁
            </button>
            <button
              className="border border-yellow-200/40 px-4 py-2 text-sm font-black text-yellow-100 transition hover:bg-yellow-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectCompetitorAudit}
              type="button"
            >
              生成竞品能力审计
            </button>
            <button
              className="border border-yellow-200/40 px-4 py-2 text-sm font-black text-yellow-100 transition hover:bg-yellow-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildCompetitorTrainingBlueprint}
              type="button"
            >
              Competitor Training Blueprint
            </button>
            <button
              className="border border-yellow-200/40 px-4 py-2 text-sm font-black text-yellow-100 transition hover:bg-yellow-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectBuildQueue}
              type="button"
            >
              生成 Agent 构建队列
            </button>
            <button
              className="border border-cyan-200/40 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectBrowserSessionHealth}
              type="button"
            >
              检查 Session Health
            </button>
            <button
              className="border border-cyan-200/40 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildExecutionPackage}
              type="button"
            >
              生成执行投递包
            </button>
            <button
              className="border border-cyan-200/40 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildBrowserRunbook}
              type="button"
            >
              生成 Browser Runbook
            </button>
            <button
              className="border border-cyan-200/40 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildBrowserRunnerContract}
              type="button"
            >
              生成 Runner Callback Contract
            </button>
            <button
              className="border border-cyan-200/40 bg-cyan-200/10 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildBrowserGatewayPack}
              type="button"
            >
              Browser Gateway Pack
            </button>
            <button
              className="border border-cyan-200/40 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={recordBrowserRunnerEvent}
              type="button"
            >
              记录 Runner Step Event
            </button>
            <button
              className="border border-cyan-200/40 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectBrowserRunnerEventHealth}
              type="button"
            >
              查看 Runner Event Health
            </button>
            <button
              className="border border-cyan-200/40 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={runCallbackSimulator}
              type="button"
            >
              Callback Simulator
            </button>
            <button
              className="border border-lime-200/40 px-4 py-2 text-sm font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectRunHealth}
              type="button"
            >
              检查 Run Health
            </button>
            <button
              className="border border-teal-200/40 px-4 py-2 text-sm font-black text-teal-100 transition hover:bg-teal-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectRuntimeProbe}
              type="button"
            >
              探测 Runtime Health
            </button>
            <button
              className="border border-teal-200/40 px-4 py-2 text-sm font-black text-teal-100 transition hover:bg-teal-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectRuntimeSetupContract}
              type="button"
            >
              Runtime Setup Contract
            </button>
            <button
              className="border border-cyan-200/40 bg-cyan-200/10 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectRuntimeAdapterContract}
              type="button"
            >
              Runtime Adapter Contract
            </button>
            <button
              className="border border-sky-200/40 bg-sky-200/10 px-4 py-2 text-sm font-black text-sky-100 transition hover:bg-sky-200/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectRuntimeRunnerLoopPack}
              type="button"
            >
              Runner Loop Pack
            </button>
            <button
              className="border border-teal-200/40 bg-teal-200/10 px-4 py-2 text-sm font-black text-teal-100 transition hover:bg-teal-200/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildProviderSetupPack}
              type="button"
            >
              Provider Setup Pack
            </button>
            <button
              className="border border-fuchsia-200/40 bg-fuchsia-200/10 px-4 py-2 text-sm font-black text-fuchsia-100 transition hover:bg-fuchsia-200/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildProviderSetupWizard}
              type="button"
            >
              Provider Setup Wizard
            </button>
            <button
              className="border border-fuchsia-200/40 bg-fuchsia-200/10 px-4 py-2 text-sm font-black text-fuchsia-100 transition hover:bg-fuchsia-200/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={recordProviderSetupState}
              type="button"
            >
              Save Setup State
            </button>
            <button
              className="border border-teal-200/40 bg-teal-200/10 px-4 py-2 text-sm font-black text-teal-100 transition hover:bg-teal-200/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildExternalExecutionWizard}
              type="button"
            >
              External Execution Wizard
            </button>
            <button
              className="border border-emerald-200/40 bg-emerald-200/10 px-4 py-2 text-sm font-black text-emerald-100 transition hover:bg-emerald-200/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={runControlledTrialRun}
              type="button"
            >
              Controlled Trial Run
            </button>
            <button
              className="border border-emerald-200/40 bg-emerald-200/10 px-4 py-2 text-sm font-black text-emerald-100 transition hover:bg-emerald-200/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectExecutionTimeline}
              type="button"
            >
              Execution Timeline
            </button>
            <button
              className="border border-fuchsia-200/40 px-4 py-2 text-sm font-black text-fuchsia-100 transition hover:bg-fuchsia-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectToolPolicy}
              type="button"
            >
              检查 Tool Policy
            </button>
            <button
              className="border border-orange-200/40 px-4 py-2 text-sm font-black text-orange-100 transition hover:bg-orange-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectBusinessSignals}
              type="button"
            >
              汇总经营信号
            </button>
            <button
              className="border border-emerald-200/40 px-4 py-2 text-sm font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={importPublicProfile}
              type="button"
            >
              导入公开门店资料
            </button>
            <button
              className="border border-indigo-200/40 px-4 py-2 text-sm font-black text-indigo-100 transition hover:bg-indigo-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectOpsConsole}
              type="button"
            >
              查看 Ops Console
            </button>
            </div>
          </div>
        </details>
        {dispatchState.status !== 'idle' ? (
          <div className="mt-4 grid gap-2 border border-white/10 bg-white/[0.06] p-3 text-xs leading-5 text-white/75 md:grid-cols-3">
            <div>
              <span className="text-white/45">状态</span>
              <div className="mt-1 font-black text-white">{dispatchState.status}</div>
            </div>
            <div>
              <span className="text-white/45">事件</span>
              <div className="mt-1 font-mono text-white">{dispatchState.eventId || 'blocked'}</div>
            </div>
            <div>
              <span className="text-white/45">租户</span>
              <div className="mt-1 font-mono text-white">{dispatchState.tenantId || 'local'}</div>
            </div>
            <p className="md:col-span-3">{dispatchState.message}</p>
            {dispatchState.latestRuns?.length ? (
              <div className="md:col-span-3">
                <div className="text-white/45">最新运行记录</div>
                <div className="mt-2 space-y-2">
                  {dispatchState.latestRuns.map(run => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[1fr_0.7fr_0.7fr_1.2fr]" key={`${run.eventId}-${run.target}`}>
                      <span className="font-mono text-white">{run.taskId}</span>
                      <span>{run.target}</span>
                      <span>{run.status}</span>
                      <span>{run.nextAction}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {dispatchState.trialWorkflowPack ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Trial Workflow Pack · work order / content / proof / follow-up</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2 md:col-span-2">
                    <div className="font-mono text-white">{dispatchState.trialWorkflowPack.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.trialWorkflowPack.workOrder.restaurant} / {dispatchState.trialWorkflowPack.workOrder.offer}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.trialWorkflowPack.summary.readySteps}</div>
                    <p className="mt-1 text-white/60">ready</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.trialWorkflowPack.summary.needsReviewSteps}</div>
                    <p className="mt-1 text-white/60">review</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.trialWorkflowPack.summary.externalGatedSteps}</div>
                    <p className="mt-1 text-white/60">external gated</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.trialWorkflowPack.summary.canRunInternallyToday ? 'yes' : 'no'}</div>
                    <p className="mt-1 text-white/60">internal today</p>
                  </div>
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/70">
                  <div className="font-mono text-white">{dispatchState.trialWorkflowPack.decisionBrief.headline}</div>
                  <p className="mt-1">{dispatchState.trialWorkflowPack.decisionBrief.decision}</p>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.trialWorkflowPack.workflowSteps.map(step => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.45fr_0.4fr_0.5fr_1.1fr_1.2fr]" key={step.id}>
                      <span className="font-mono text-white">{step.title}</span>
                      <span>{step.status}</span>
                      <span>{step.owner}</span>
                      <span>{step.output}</span>
                      <span>{step.nextAction}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-white/45">Channel drafts</div>
                    {dispatchState.trialWorkflowPack.channelDrafts.slice(0, 4).map(draft => (
                      <div className="border border-white/10 bg-white/[0.05] p-2 text-white/70" key={draft.channel}>
                        <div className="font-mono text-white">{draft.channel}</div>
                        <div className="mt-1">{draft.job}</div>
                        <div className="mt-1 text-white/45">{draft.proofRequired}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="text-white/45">External unlocks</div>
                    {dispatchState.trialWorkflowPack.externalUnlocks.slice(0, 4).map(item => (
                      <div className="border border-amber-200/20 bg-amber-200/[0.06] p-2 text-amber-100" key={item.capability}>
                        <div className="font-mono text-white">{item.capability}</div>
                        <div className="mt-1">{item.missing}</div>
                        <div className="mt-1 text-amber-100/60">{item.providerRequest}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    evidence: {dispatchState.trialWorkflowPack.evidenceChecklist.join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    training: {dispatchState.trialWorkflowPack.trainingQueue.map(item => `${item.capability}: ${item.material}`).join(' / ')}
                  </div>
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {dispatchState.trialWorkflowPack.safetyBoundary}
                </div>
              </div>
            ) : null}
            {dispatchState.heartbeat?.followups?.length ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Heartbeat 主动跟进 · 已接收回执 {dispatchState.heartbeat.acceptedReceipts ?? 0}</div>
                <div className="mt-2 space-y-2">
                  {dispatchState.heartbeat.followups.slice(0, 3).map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={item.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-black text-white">{item.priority} · {item.owner}</span>
                        <span className="text-white/55">{item.evidenceRequired}</span>
                      </div>
                      <p className="mt-1 text-white/70">{item.reason}</p>
                      <p className="mt-1 text-white">{item.nextAction}</p>
                    </div>
                  ))}
                </div>
                {dispatchState.heartbeat.watcherPolicy ? (
                  <div className="mt-3 grid gap-2 md:grid-cols-[0.8fr_1.2fr]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">
                        {dispatchState.heartbeat.watcherPolicy.summary.armed}/{dispatchState.heartbeat.watcherPolicy.summary.lanes}
                      </div>
                      <p className="mt-1 text-white/60">watcher lanes armed</p>
                      <p className="mt-1 text-white/60">high priority: {dispatchState.heartbeat.watcherPolicy.summary.highPriority}</p>
                      <p className="mt-1 text-white/60">memory upserts: {dispatchState.heartbeat.watcherPolicy.summary.memoryUpserts}</p>
                    </div>
                    <div className="space-y-2">
                      {dispatchState.heartbeat.watcherPolicy.wakeups.slice(0, 2).map(wakeup => (
                        <div className="border border-white/10 bg-white/[0.05] p-2" key={wakeup.id}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono text-white">{wakeup.priority} · {wakeup.eventId}</span>
                            <span className="text-white/55">{wakeup.owner}</span>
                          </div>
                          <p className="mt-1 text-white/70">{wakeup.reason}</p>
                          <p className="mt-1 text-white">{wakeup.memoryWrite}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            {dispatchState.readiness ? (
              <div className="md:col-span-3">
                <div className="text-white/45">外部接入就绪</div>
                <div className="mt-2 grid gap-2 md:grid-cols-4">
                  {dispatchState.readiness.groups.map(group => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={group.id}>
                      <div className="font-black text-white">{group.name}</div>
                      <div className="mt-1 text-white/60">{group.status}</div>
                      <p className="mt-1 text-white/70">{group.nextAction}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {dispatchState.receipts?.length ? (
              <div className="md:col-span-3">
                <div className="text-white/45">执行回执</div>
                <div className="mt-2 space-y-2">
                  {dispatchState.receipts.slice(0, 2).map(receipt => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.9fr_0.6fr_0.6fr_1fr]" key={receipt.receiptId}>
                      <span className="font-mono text-white">{receipt.channel}</span>
                      <span>{receipt.status}</span>
                      <span>{receipt.evidenceLevel || 'unscored'} · {receipt.evidenceScore ?? 0}</span>
                      <span>{receipt.summary}</span>
                      {receipt.rejectedReason ? <span className="md:col-span-4 text-amber-100">{receipt.rejectedReason}</span> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {dispatchState.recovery?.actions?.length ? (
              <div className="md:col-span-3">
                <div className="text-white/45">失败恢复计划 · {dispatchState.recovery.actions.length} actions</div>
                <div className="mt-2 space-y-2">
                  {dispatchState.recovery.actions.slice(0, 3).map(action => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={action.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-black text-white">{action.priority} · {action.action}</span>
                        <span className="text-white/55">{action.owner}</span>
                      </div>
                      <p className="mt-1 text-white/70">{action.reason}</p>
                      <p className="mt-1 text-white">{action.nextStep}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {dispatchState.browserSession ? (
              <div className="md:col-span-3">
                <div className="text-white/45">浏览器 Session Manifest</div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserSession.runtimeTarget}</div>
                    <p className="mt-1 text-white/60">profile: {dispatchState.browserSession.profile.profileId}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserSession.canExecuteNow ? 'ready' : 'handoff-only'}</div>
                    <p className="mt-1 text-white/60">{dispatchState.browserSession.handoff.nextStep}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserSession.toolPolicy.filter(tool => tool.allowed).length}/{dispatchState.browserSession.toolPolicy.length} tools</div>
                    <p className="mt-1 text-white/60">{dispatchState.browserSession.stopConditions[0]}</p>
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.browserSessionHealth ? (
              <div className="md:col-span-3">
                <div className="text-white/45">常驻浏览器 Session Health</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserSessionHealth.summary.total}</div>
                    <p className="mt-1 text-white/60">sessions</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserSessionHealth.summary.ready}</div>
                    <p className="mt-1 text-white/60">ready</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserSessionHealth.summary.blocked}</div>
                    <p className="mt-1 text-white/60">blocked</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserSessionHealth.summary.expired}</div>
                    <p className="mt-1 text-white/60">expired</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserSessionHealth.summary.needsHeartbeat}</div>
                    <p className="mt-1 text-white/60">heartbeat</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.browserSessionHealth.sessions.slice(0, 3).map(session => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.9fr_0.6fr_0.6fr_1.5fr]" key={session.sessionId}>
                      <span className="font-mono text-white">{session.runtimeTarget}</span>
                      <span>{session.status}</span>
                      <span>{session.allowedTools}/{session.allowedTools + session.blockedTools} tools</span>
                      <span>{session.nextAction}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {dispatchState.browserSessionHealth.safetyBoundary}
                </div>
              </div>
            ) : null}
            {dispatchState.grantManifest ? (
              <div className="md:col-span-3">
                <div className="text-white/45">商家授权 Grant Manifest</div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.grantManifest.merchant.grantStatus}</div>
                    <p className="mt-1 text-white/60">{dispatchState.grantManifest.merchant.restaurant}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">
                      {dispatchState.grantManifest.actionPolicy.filter(action => action.allowed).length}/{dispatchState.grantManifest.actionPolicy.length} actions
                    </div>
                    <p className="mt-1 text-white/60">不返回 token/cookie/私信原文</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.grantManifest.channels.filter(channel => channel.authorized).length}/{dispatchState.grantManifest.channels.length} channels</div>
                    <p className="mt-1 text-white/60">{dispatchState.grantManifest.permanentlyForbidden[0]?.reason}</p>
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.grantChecklist ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Grant Checklist Wizard</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.grantChecklist.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.grantChecklist.merchant.grantStatus}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.grantChecklist.summary.done}/{dispatchState.grantChecklist.summary.total}</div>
                    <p className="mt-1 text-white/60">done steps</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.grantChecklist.summary.missing}</div>
                    <p className="mt-1 text-white/60">missing</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.grantChecklist.summary.blocked}</div>
                    <p className="mt-1 text-white/60">blocked</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.grantChecklist.summary.canEnableAutoPublish ? 'ready' : 'blocked'}</div>
                    <p className="mt-1 text-white/60">auto publish</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.grantChecklist.summary.canEnableOperatingAnalysis ? 'ready' : 'blocked'}</div>
                    <p className="mt-1 text-white/60">analysis</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.grantChecklist.sections.slice(0, 4).map(section => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={section.id}>
                      <div className="font-mono text-white">{section.title}</div>
                      <p className="mt-1 text-white/60">{section.steps.filter(step => step.status === 'done').length}/{section.steps.length} done</p>
                      <p className="mt-1 text-white/50">
                        {section.steps
                          .filter(step => step.status === 'missing' || step.status === 'blocked')
                          .map(step => `${step.title}: ${step.nextAction}`)
                          .join(' / ') || 'no missing gate'}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.grantChecklist.blockedCapabilities.map(item => `${item.capability}: ${item.nextAction}`).join(' / ') || 'all governed capabilities ready'}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.grantChecklist.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.activationGates ? (
              <div className="md:col-span-3">
                <div className="text-white/45">餐饮经营能力激活门禁</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.activationGates.payloadShape}</div>
                    <p className="mt-1 text-white/60">gate report</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.activationGates.summary.ready}</div>
                    <p className="mt-1 text-white/60">ready</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.activationGates.summary.blocked}</div>
                    <p className="mt-1 text-white/60">blocked</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.activationGates.summary.forbidden}</div>
                    <p className="mt-1 text-white/60">forbidden</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.activationGates.summary.internalAlternatives}</div>
                    <p className="mt-1 text-white/60">internal actions</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.activationGates.gates.map(gate => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={gate.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{gate.name}</span>
                        <span>{gate.status}</span>
                      </div>
                      <p className="mt-1 text-white/60">{gate.customerPromise}</p>
                      <p className="mt-1 text-white/50">
                        internal: {gate.canDoInternallyNow.slice(0, 3).join(' / ')}
                      </p>
                      <p className="mt-1 text-white/50">
                        external: {gate.mustHaveExternal.slice(0, 3).join(' / ') || gate.blockingReason}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.activationGates.answerToCustomer}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    fake results: {String(dispatchState.activationGates.audit.fakeResultsIncluded)}; private data: {String(dispatchState.activationGates.audit.privateDataIncluded)}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.competitorAudit ? (
              <div className="md:col-span-3">
                <div className="text-white/45">公开竞品能力审计</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.competitorAudit.payloadShape}</div>
                    <p className="mt-1 text-white/60">audit shape</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.competitorAudit.sources.length}</div>
                    <p className="mt-1 text-white/60">public sources</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.competitorAudit.summary.internalReady}</div>
                    <p className="mt-1 text-white/60">internal</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.competitorAudit.summary.bridgeReady}</div>
                    <p className="mt-1 text-white/60">bridge</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.competitorAudit.summary.externalRequired}</div>
                    <p className="mt-1 text-white/60">external</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.competitorAudit.summary.internalConnectors}</div>
                    <p className="mt-1 text-white/60">connectors</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {dispatchState.competitorAudit.sources.map(source => (
                    <a className="border border-white/10 bg-white/[0.05] p-2" href={source.url} key={source.id} rel="noreferrer" target="_blank">
                      <div className="font-mono text-white">{source.name}</div>
                      <p className="mt-1 text-white/60">{source.relevanceToRestaurant}</p>
                    </a>
                  ))}
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.competitorAudit.dimensions.map(dimension => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.7fr_0.45fr_1.2fr_1.2fr]" key={dimension.id}>
                      <span className="font-mono text-white">{dimension.name}</span>
                      <span>{dimension.status}</span>
                      <span>{dimension.restaurantImpact}</span>
                      <span>{dimension.status === 'external-required' ? dimension.externalRequired : dimension.internalNext}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    next: {dispatchState.competitorAudit.nextBuildOrder.slice(0, 3).map(item => `${item.dimensionId}:${item.buildableNow ? 'build' : 'external'}`).join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.competitorAudit.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.buildQueue ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Agent 构建队列</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.buildQueue.payloadShape}</div>
                    <p className="mt-1 text-white/60">queue shape</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.buildQueue.summary.readyToBuild}</div>
                    <p className="mt-1 text-white/60">ready</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.buildQueue.summary.needsDesignReview}</div>
                    <p className="mt-1 text-white/60">bridge</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.buildQueue.summary.waitingExternal}</div>
                    <p className="mt-1 text-white/60">external</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.buildQueue.nextInternalSprint.length}</div>
                    <p className="mt-1 text-white/60">next sprint</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.buildQueue.externalSetupRequests.length}</div>
                    <p className="mt-1 text-white/60">setup requests</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.buildQueue.items.map(item => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.45fr_0.45fr_0.5fr_1.3fr_1.2fr]" key={item.id}>
                      <span className="font-mono text-white">{item.title}</span>
                      <span>{item.lane}</span>
                      <span>{item.owner}</span>
                      <span>{item.internalDeliverable}</span>
                      <span>{item.status === 'waiting-external' ? item.externalRequired.join(' / ') : item.acceptanceCriteria[0]}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    sprint: {dispatchState.buildQueue.nextInternalSprint.map(item => `${item.dimensionId}:${item.owner}`).join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.buildQueue.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.capabilityTrainingPlan ? (
              <div className="md:col-span-3">
                <div className="text-white/45">竞品能力训练计划</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.capabilityTrainingPlan.payloadShape}</div>
                    <p className="mt-1 text-white/60">plan shape</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.capabilityTrainingPlan.summary.trainableNow}</div>
                    <p className="mt-1 text-white/60">trainable</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.capabilityTrainingPlan.summary.providerGated}</div>
                    <p className="mt-1 text-white/60">provider gated</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.capabilityTrainingPlan.summary.activationReady}</div>
                    <p className="mt-1 text-white/60">ready</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.capabilityTrainingPlan.nextInternalTraining.length}</div>
                    <p className="mt-1 text-white/60">training tasks</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.capabilityTrainingPlan.externalSetupRequests.length}</div>
                    <p className="mt-1 text-white/60">external setup</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.capabilityTrainingPlan.items.map(item => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.55fr_0.35fr_1fr_1fr]" key={item.id}>
                      <span className="font-mono text-white">{item.capability}</span>
                      <span>{item.status}</span>
                      <span>{item.missingTrainingMaterials.slice(0, 3).join(' / ') || 'training complete'}</span>
                      <span>{item.missingExternalProviders.slice(0, 3).join(' / ') || item.acceptance}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    train: {dispatchState.capabilityTrainingPlan.nextInternalTraining.slice(0, 4).map(item => `${item.capabilityId}:${item.material}`).join(' / ') || 'all training materials ready'}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.capabilityTrainingPlan.safetyBoundary}
                  </div>
                </div>
                {dispatchState.capabilityTrainingRecords?.length ? (
                  <div className="mt-2 space-y-2">
                    <div className="text-white/45">训练账本记录</div>
                    {dispatchState.capabilityTrainingRecords.slice(0, 5).map(record => (
                      <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.35fr_0.5fr_0.5fr_1.4fr]" key={record.recordId}>
                        <span className="font-mono text-white">{record.kind}</span>
                        <span>{record.capabilityId}</span>
                        <span>{record.name}</span>
                        <span>{record.accepted ? record.evidenceSummary : record.rejectedReason}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
            {dispatchState.clawSkillCatalog ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Claw 能力库 · 训练与 Provider 队列</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillCatalog.payloadShape}</div>
                    <p className="mt-1 text-white/60">catalog shape</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillCatalog.summary.modules}</div>
                    <p className="mt-1 text-white/60">modules</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillCatalog.summary.skills}</div>
                    <p className="mt-1 text-white/60">skills</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillCatalog.summary.tools}</div>
                    <p className="mt-1 text-white/60">tools</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillCatalog.nextInternalTraining.length}</div>
                    <p className="mt-1 text-white/60">training queue</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillCatalog.externalSetupRequests.length}</div>
                    <p className="mt-1 text-white/60">provider queue</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-white/45">内部训练队列</div>
                    {dispatchState.clawSkillCatalog.nextInternalTraining.slice(0, 5).map(item => (
                      <div className="border border-white/10 bg-white/[0.05] p-2 text-white/70" key={`${item.moduleId}-${item.skillId}`}>
                        <span className="font-mono text-white">{item.moduleId}</span> · {item.material} · {item.owner}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="text-white/45">外部 Provider 解锁队列</div>
                    {dispatchState.clawSkillCatalog.externalSetupRequests.slice(0, 5).map(item => (
                      <div className="border border-amber-200/20 bg-amber-200/[0.06] p-2 text-amber-100" key={`${item.toolId}-${item.unlocks}`}>
                        <span className="font-mono text-white">{item.provider}</span> · {item.unlocks}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.clawSkillCatalog.modules.slice(0, 6).map(module => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.4fr_0.55fr_1.5fr]" key={module.id}>
                      <span className="font-mono text-white">{module.name}</span>
                      <span>{module.owner}</span>
                      <span>{module.skills.slice(0, 4).map(skill => `${skill.name}:${skill.status}`).join(' / ')}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {dispatchState.clawSkillCatalog.safetyBoundary}
                </div>
              </div>
            ) : null}
            {dispatchState.clawSkillWorkbench ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Claw Skill Workbench</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillWorkbench.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.clawSkillWorkbench.mode}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillWorkbench.summary.modules}</div>
                    <p className="mt-1 text-white/60">modules</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillWorkbench.summary.runnableNow}</div>
                    <p className="mt-1 text-white/60">runnable</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillWorkbench.summary.trainingNeeded}</div>
                    <p className="mt-1 text-white/60">training</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillWorkbench.summary.providerGated}</div>
                    <p className="mt-1 text-white/60">provider gated</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillWorkbench.summary.deliverables}</div>
                    <p className="mt-1 text-white/60">deliverables</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {dispatchState.clawSkillWorkbench.deliverables.map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={item.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{item.title}</span>
                        <span>{item.status}</span>
                      </div>
                      <p className="mt-1 text-white/60">{item.acceptance}</p>
                      <p className="mt-1 text-white/45">{item.contents.slice(0, 3).join(' / ') || 'none'}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.clawSkillWorkbench.workbench.slice(0, 8).map(item => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.45fr_0.4fr_0.35fr_1.5fr]" key={item.id}>
                      <span className="font-mono text-white">{item.moduleName}</span>
                      <span>{item.skillName}</span>
                      <span>{item.status}</span>
                      <span>{item.nextAction}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    script: {dispatchState.clawSkillWorkbench.commandScript.join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.clawSkillWorkbench.safetyBoundary}
                  </div>
                </div>
                {dispatchState.clawSkillExecutionLedger ? (
                  <div className="mt-2 border border-white/10 bg-white/[0.05] p-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-white">{dispatchState.clawSkillExecutionLedger.payloadShape}</span>
                      <span className="text-white/60">{dispatchState.clawSkillExecutionLedger.summary.total} remembered packs</span>
                    </div>
                    <div className="mt-2 grid gap-2 md:grid-cols-3">
                      {dispatchState.clawSkillExecutionLedger.latest.slice(0, 3).map(record => (
                        <div className="border border-white/10 bg-white/[0.05] p-2" key={record.recordId}>
                          <div className="font-mono text-white">{record.status}</div>
                          <p className="mt-1 text-white/60">{record.restaurant} / {record.offer}</p>
                          <p className="mt-1 text-white/45">{record.nextAction}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-white/45">{dispatchState.clawSkillExecutionLedger.safetyBoundary}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
            {dispatchState.benchmarkStrategy ? (
              <div className="md:col-span-3">
                <div className="text-white/45">产品底座判断 · 平台级主干 + Agent 体验层</div>
                <div className="mt-2 grid gap-2 md:grid-cols-4">
                  <div className="border border-white/10 bg-white/[0.05] p-2 md:col-span-2">
                    <div className="font-mono text-white">{dispatchState.benchmarkStrategy.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.benchmarkStrategy.recommendation}</p>
                  </div>
                  {dispatchState.benchmarkStrategy.candidates.slice(0, 2).map(candidate => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={candidate.id}>
                      <div className="font-mono text-white">{candidate.fitScore}</div>
                      <p className="mt-1 text-white/60">{candidate.name}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/70">
                  {dispatchState.benchmarkStrategy.summary}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {dispatchState.benchmarkStrategy.candidates.map(candidate => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={candidate.id}>
                      <div className="font-mono text-white">{candidate.role}</div>
                      <div className="mt-1 text-white/70">{candidate.fitReason}</div>
                      <div className="mt-2 text-white/45">adopt: {candidate.adopt.slice(0, 2).join(' / ')}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.benchmarkStrategy.nextBuildOrder.map(item => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.4fr_1fr_1fr_1fr]" key={item.id}>
                      <span className="font-mono text-white">{item.title}</span>
                      <span>{item.internalNow}</span>
                      <span>{item.externalGate}</span>
                      <span>{item.acceptance}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {dispatchState.benchmarkStrategy.safetyBoundary}
                </div>
              </div>
            ) : null}
            {dispatchState.platformOperatingSpine ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Platform Operating Spine · content / execution / receipts / business signals</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2 md:col-span-2">
                    <div className="font-mono text-white">{dispatchState.platformOperatingSpine.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.platformOperatingSpine.productSpine}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.platformOperatingSpine.summary.runs}</div>
                    <p className="mt-1 text-white/60">runs</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.platformOperatingSpine.summary.acceptedReceipts}</div>
                    <p className="mt-1 text-white/60">receipts</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.platformOperatingSpine.summary.businessSignals}</div>
                    <p className="mt-1 text-white/60">signals</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.platformOperatingSpine.summary.blockedExternalGroups}</div>
                    <p className="mt-1 text-white/60">external gates</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.platformOperatingSpine.timeline.map((item, index) => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.5fr_0.45fr_0.55fr_1.3fr_1.2fr]" key={`${item.stage}-${index}`}>
                      <span className="font-mono text-white">{item.stage}</span>
                      <span>{item.status}</span>
                      <span>{item.owner}</span>
                      <span>{item.detail}</span>
                      <span>{item.nextAction}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-white/45">External gates</div>
                    {dispatchState.platformOperatingSpine.externalGates.slice(0, 4).map(gate => (
                      <div className="border border-amber-200/20 bg-amber-200/[0.06] p-2 text-amber-100" key={gate.id}>
                        <div className="font-mono text-white">{gate.name}</div>
                        <div className="mt-1">{gate.missing.slice(0, 3).join(' / ') || 'ready'}</div>
                        <div className="mt-1 text-amber-100/60">{gate.nextAction}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="text-white/45">Next platform actions</div>
                    {dispatchState.platformOperatingSpine.nextPlatformActions.map(action => (
                      <div className="border border-white/10 bg-white/[0.05] p-2 text-white/70" key={`${action.owner}-${action.action}`}>
                        <div className="font-mono text-white">{action.owner}</div>
                        <div className="mt-1">{action.action}</div>
                        <div className="mt-1 text-white/45">{action.acceptance}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    internal now: {dispatchState.platformOperatingSpine.auditBoundary.canDoInternallyNow.join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    external before claim: {dispatchState.platformOperatingSpine.auditBoundary.mustHaveExternalBeforeClaiming.join(' / ')}
                  </div>
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {dispatchState.platformOperatingSpine.safetyBoundary}
                </div>
              </div>
            ) : null}
            {dispatchState.operatingDataContract ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Operating Data Contract · POS / redemption / members / inventory / finance</div>
                <div className="mt-2 grid gap-2 md:grid-cols-7">
                  <div className="border border-white/10 bg-white/[0.05] p-2 md:col-span-2">
                    <div className="font-mono text-white">{dispatchState.operatingDataContract.payloadShape}</div>
                    <p className="mt-1 text-white/60">true analysis: {dispatchState.operatingDataContract.summary.canClaimTrueOperatingAnalysis ? 'ready' : 'blocked'}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.operatingDataContract.summary.internalReady}</div>
                    <p className="mt-1 text-white/60">internal</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.operatingDataContract.summary.manualImportReady}</div>
                    <p className="mt-1 text-white/60">manual import</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.operatingDataContract.summary.providerGated}</div>
                    <p className="mt-1 text-white/60">provider gated</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.operatingDataContract.summary.posImportsAccepted}</div>
                    <p className="mt-1 text-white/60">POS imports</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.operatingDataContract.summary.canClaimAutoRedemption ? 'ready' : 'blocked'}</div>
                    <p className="mt-1 text-white/60">auto redemption</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.operatingDataContract.tracks.map(track => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.45fr_0.45fr_1.2fr_1.2fr_1.2fr]" key={track.id}>
                      <span className="font-mono text-white">{track.name}</span>
                      <span>{track.status}</span>
                      <span>{track.businessQuestion}</span>
                      <span>{track.requiredFields.slice(0, 5).join(' / ')}</span>
                      <span>{track.nextAction}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-white/45">Import template</div>
                    {dispatchState.operatingDataContract.importTemplate.slice(0, 6).map(field => (
                      <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 text-white/70 md:grid-cols-[0.6fr_0.35fr_1fr]" key={field.field}>
                        <span className="font-mono text-white">{field.field}</span>
                        <span>{field.type}</span>
                        <span>{field.requiredFor.join(' / ')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="text-white/45">Provider setup requests</div>
                    {dispatchState.operatingDataContract.providerSetupRequests.map(request => (
                      <div className="border border-amber-200/20 bg-amber-200/[0.06] p-2 text-amber-100" key={request.provider}>
                        <div className="font-mono text-white">{request.provider}</div>
                        <div className="mt-1">{request.unlocks.join(' / ')}</div>
                        <div className="mt-1 text-amber-100/60">{request.evidenceRequired}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.operatingDataContract.operatingQuestions.map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2 text-white/65" key={item.question}>
                      <span className="font-mono text-white">{item.canAnswerNow ? 'ready' : 'blocked'}</span>
                      <p className="mt-1">{item.question}</p>
                      <p className="mt-1 text-white/45">{item.blockedBy.join(' / ') || 'no blocker'}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {dispatchState.operatingDataContract.safetyBoundary}
                </div>
                <button
                  className="mt-2 border border-emerald-200/50 px-3 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={dispatchState.status === 'loading'}
                  onClick={inspectOperatingInsightReport}
                  type="button"
                >
                  Operating Insight Report
                </button>
              </div>
            ) : null}
            {dispatchState.operatingInsightReport ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Operating Insight Report · evidence-backed KPIs</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2 md:col-span-2">
                    <div className="font-mono text-white">{dispatchState.operatingInsightReport.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.operatingInsightReport.verdict}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.operatingInsightReport.summary.measured}</div>
                    <p className="mt-1 text-white/60">measured</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.operatingInsightReport.summary.directional}</div>
                    <p className="mt-1 text-white/60">directional</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.operatingInsightReport.summary.blocked}</div>
                    <p className="mt-1 text-white/60">blocked</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.operatingInsightReport.summary.canClaimTrueOperatingAnalysis ? 'ready' : 'blocked'}</div>
                    <p className="mt-1 text-white/60">true analysis</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {dispatchState.operatingInsightReport.insights.map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={item.id}>
                      <div className="font-mono text-white">{item.label}</div>
                      <p className="mt-1 text-white/60">{item.status} · {item.value}</p>
                      <p className="mt-1 line-clamp-3 text-white/45">{item.interpretation}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-white/45">Store manager actions</div>
                    {dispatchState.operatingInsightReport.storeManagerActions.map(item => (
                      <p className="mt-1 text-white/60" key={`${item.owner}-${item.action}`}>{item.owner}: {item.action}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.operatingInsightReport.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
            {commandPostRunReviewPack ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Post Run Review Pack 路 proof, SOP, next loop</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2 md:col-span-2">
                    <div className="font-mono text-white">{commandPostRunReviewPack.payloadShape}</div>
                    <p className="mt-1 text-white/60">{commandPostRunReviewPack.verdict}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandPostRunReviewPack.summary.acceptedReceipts}</div>
                    <p className="mt-1 text-white/60">accepted proof</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandPostRunReviewPack.summary.storeTasks}</div>
                    <p className="mt-1 text-white/60">store tasks</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandPostRunReviewPack.summary.acceptedPosImports}</div>
                    <p className="mt-1 text-white/60">POS imports</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandPostRunReviewPack.summary.canClaimTrueOperatingAnalysis ? 'ready' : 'blocked'}</div>
                    <p className="mt-1 text-white/60">true analysis</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  {commandPostRunReviewPack.lanes.map(lane => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={lane.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-white">{lane.title}</span>
                        <span>{lane.status}</span>
                      </div>
                      <p className="mt-1 text-white/60">{lane.owner}: {lane.decision}</p>
                      <p className="mt-1 line-clamp-3 text-white/45">{lane.nextAction}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-white/45">Next-loop SOP</div>
                    {commandPostRunReviewPack.nextLoopSop.slice(0, 5).map(step => (
                      <p className="mt-1 text-white/60" key={step.step}>{step.owner}: {step.step} - {step.output}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {commandPostRunReviewPack.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
            {commandNextLoopChannelPlan ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Next Loop Channel Plan 路 daily shift execution</div>
                <div className="mt-2 grid gap-2 md:grid-cols-7">
                  <div className="border border-cyan-200/20 bg-cyan-200/[0.06] p-2 md:col-span-2">
                    <div className="font-mono text-white">{commandNextLoopChannelPlan.payloadShape}</div>
                    <p className="mt-1 text-cyan-100/70">{commandNextLoopChannelPlan.verdict}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandNextLoopChannelPlan.summary.internalReadyLanes}</div>
                    <p className="mt-1 text-white/60">ready lanes</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandNextLoopChannelPlan.summary.scheduledActions}</div>
                    <p className="mt-1 text-white/60">actions</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandNextLoopChannelPlan.summary.manualOnlyActions}</div>
                    <p className="mt-1 text-white/60">manual</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandNextLoopChannelPlan.summary.providerGatedActions}</div>
                    <p className="mt-1 text-white/60">provider gated</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandNextLoopChannelPlan.summary.canRunInternallyNow ? 'yes' : 'no'}</div>
                    <p className="mt-1 text-white/60">internal run</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {commandNextLoopChannelPlan.lanes.map(lane => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={lane.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{lane.title}</span>
                        <span className="text-[11px] text-cyan-100/70">{lane.status}</span>
                      </div>
                      <p className="mt-1 text-white/60">{lane.owner}: {lane.nextAction}</p>
                      <p className="mt-1 line-clamp-2 text-white/40">{lane.stopLine}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-white/45">Shift actions</div>
                    {commandNextLoopChannelPlan.scheduledActions.slice(0, 6).map(item => (
                      <div className="border border-white/10 bg-white/[0.05] p-2" key={item.id}>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-cyan-100/70">
                          <span>{item.dueWindow}</span>
                          <span>{item.channel}</span>
                          <span>{item.status}</span>
                        </div>
                        <p className="mt-1 text-white/70">{item.owner}: {item.action}</p>
                        <p className="mt-1 line-clamp-2 text-white/45">{item.manualFallback}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="text-white/45">External unlocks</div>
                    {commandNextLoopChannelPlan.externalRequired.slice(0, 8).map(item => (
                      <div className="border border-amber-200/20 bg-amber-200/[0.06] p-2 text-amber-100/70" key={item}>{item}</div>
                    ))}
                    <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                      {commandNextLoopChannelPlan.safetyBoundary}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.clawTrainingBatch ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Claw 训练批次 · 内部训练与外部解锁</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawTrainingBatch.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.clawTrainingBatch.batchId}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawTrainingBatch.summary.internalTrainingTasks}</div>
                    <p className="mt-1 text-white/60">internal training</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawTrainingBatch.summary.providerUnlockTasks}</div>
                    <p className="mt-1 text-white/60">provider unlock</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawTrainingBatch.summary.modulesCovered}</div>
                    <p className="mt-1 text-white/60">modules covered</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawTrainingBatch.summary.toolsCovered}</div>
                    <p className="mt-1 text-white/60">tools covered</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-white/45">本轮内部训练任务</div>
                    {dispatchState.clawTrainingBatch.internalTrainingTasks.slice(0, 6).map(task => (
                      <div className="border border-white/10 bg-white/[0.05] p-2 text-white/70" key={task.taskId}>
                        <div className="font-mono text-white">{task.title}</div>
                        <div className="mt-1">{task.material}</div>
                        <div className="mt-1 text-white/45">{task.evidenceRequired}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="text-white/45">本轮外部解锁任务</div>
                    {dispatchState.clawTrainingBatch.providerUnlockTasks.slice(0, 6).map(task => (
                      <div className="border border-amber-200/20 bg-amber-200/[0.06] p-2 text-amber-100" key={task.taskId}>
                        <div className="font-mono text-white">{task.title}</div>
                        <div className="mt-1">{task.provider}</div>
                        <div className="mt-1 text-amber-100/60">{task.evidenceRequired}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.clawTrainingBatch.dispatchPreview.map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60" key={item.lane}>
                      {item.lane}: {item.count} · {item.owner} · blocked until {item.blockedUntil}
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {dispatchState.clawTrainingBatch.safetyBoundary}
                </div>
              </div>
            ) : null}
            {dispatchState.executionPackage ? (
              <div className="md:col-span-3">
                <div className="text-white/45">外部执行投递包</div>
                <div className="mt-2 grid gap-2 md:grid-cols-4">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionPackage.target}</div>
                    <p className="mt-1 text-white/60">{dispatchState.executionPackage.payloadShape}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionPackage.status}</div>
                    <p className="mt-1 text-white/60">canForward: {dispatchState.executionPackage.canForward ? 'yes' : 'no'}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionPackage.executionPolicy.allowedRuntimeActions.length}/{dispatchState.executionPackage.executionPolicy.blockedRuntimeActions.length}</div>
                    <p className="mt-1 text-white/60">allowed / blocked actions</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionPackage.runtimeContract.callbackAction}</div>
                    <p className="mt-1 text-white/60">不含 API key、cookie、私信原文</p>
                  </div>
                </div>
                {dispatchState.executionPackage.blockedReasons.length ? (
                  <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/65">
                    {dispatchState.executionPackage.blockedReasons.slice(0, 3).join('；')}
                  </div>
                ) : null}
              </div>
            ) : null}
            {dispatchState.browserRunbook ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Browser Runbook Package</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunbook.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.browserRunbook.runtimeTarget}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunbook.canExecuteNow ? 'ready' : 'handoff-only'}</div>
                    <p className="mt-1 text-white/60">can execute now</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunbook.steps.length}</div>
                    <p className="mt-1 text-white/60">ordered steps</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunbook.allowedDomains.length}</div>
                    <p className="mt-1 text-white/60">allowed domains</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunbook.evidenceSchema.length}</div>
                    <p className="mt-1 text-white/60">evidence fields</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunbook.callback.action}</div>
                    <p className="mt-1 text-white/60">{dispatchState.browserRunbook.callback.requiredHeader}</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.browserRunbook.allowedDomains.join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.browserRunbook.safetyBoundary}
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.browserRunbook.steps.map(step => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.35fr_0.45fr_1.2fr_0.35fr]" key={step.id}>
                      <span className="font-mono text-white">{step.order}. {step.type}</span>
                      <span>{step.tool}</span>
                      <span>{step.stopIf.slice(0, 2).join(' / ')}</span>
                      <span>{step.allowed ? 'allow' : 'blocked'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {dispatchState.browserRunnerContract ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Browser Runner Callback Contract</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunnerContract.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.browserRunnerContract.runtimeTarget}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunnerContract.canAcceptSignedFinalReceipt ? 'ready' : 'blocked'}</div>
                    <p className="mt-1 text-white/60">signed final receipt</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunnerContract.eventRules.length}</div>
                    <p className="mt-1 text-white/60">event rules</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunnerContract.stepRules.length}</div>
                    <p className="mt-1 text-white/60">step rules</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunnerContract.recoveryPolicy.retryBudget}</div>
                    <p className="mt-1 text-white/60">retry budget</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunnerContract.stepEventEndpoint.mode}</div>
                    <p className="mt-1 text-white/60">{dispatchState.browserRunnerContract.stepEventEndpoint.action}</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    setup: {dispatchState.browserRunnerContract.externalSetupRequired.join(' / ') || 'ready'}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.browserRunnerContract.safetyBoundary}
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.browserRunnerContract.eventRules.map(rule => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.45fr_0.45fr_0.4fr_1.3fr]" key={rule.type}>
                      <span className="font-mono text-white">{rule.type}</span>
                      <span>{rule.writesTo}</span>
                      <span>{rule.retryable ? 'retry' : 'no-retry'}</span>
                      <span>{rule.nextAction}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {dispatchState.runnerEventHealth ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Browser Runner Event Ledger</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runnerEventHealth.payloadShape}</div>
                    <p className="mt-1 text-white/60">event health</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runnerEventHealth.summary.totalEvents}</div>
                    <p className="mt-1 text-white/60">events</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runnerEventHealth.summary.activeRuns}</div>
                    <p className="mt-1 text-white/60">active runs</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runnerEventHealth.summary.completedRuns}</div>
                    <p className="mt-1 text-white/60">completed runs</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runnerEventHealth.summary.staleRuns}</div>
                    <p className="mt-1 text-white/60">stale runs</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runnerEventHealth.summary.rejected}</div>
                    <p className="mt-1 text-white/60">rejected</p>
                  </div>
                </div>
                {dispatchState.runnerEvent ? (
                  <div className="mt-2 grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.6fr_0.5fr_0.5fr_1.4fr]">
                    <span className="font-mono text-white">{dispatchState.runnerEvent.type}</span>
                    <span>{dispatchState.runnerEvent.status}</span>
                    <span>{dispatchState.runnerEvent.retryable ? 'retryable' : 'no-retry'}</span>
                    <span>{dispatchState.runnerEvent.nextAction}</span>
                  </div>
                ) : null}
                <div className="mt-2 space-y-2">
                  {dispatchState.runnerEventHealth.runs.slice(0, 4).map(run => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.7fr_0.5fr_0.45fr_1.35fr]" key={`${run.eventId}-${run.externalRunId}`}>
                      <span className="font-mono text-white">{run.latestType}</span>
                      <span>{run.runtimeTarget}</span>
                      <span>{run.latestStatus}</span>
                      <span>{run.nextAction}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {dispatchState.runnerEventHealth.safetyBoundary}
                </div>
              </div>
            ) : null}
            {dispatchState.browserGatewayPack ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Browser Gateway Pack</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserGatewayPack.runtimeTarget}</div>
                    <p className="mt-1 text-white/60">runtime</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserGatewayPack.canExecuteNow ? 'ready' : 'blocked'}</div>
                    <p className="mt-1 text-white/60">execute now</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserGatewayPack.browserRequest.acceptedActions.length}</div>
                    <p className="mt-1 text-white/60">accepted actions</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserGatewayPack.snapshotPolicy.maxCharacters}</div>
                    <p className="mt-1 text-white/60">snapshot chars</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserGatewayPack.contextBudget.maxRuntimeMinutes}m</div>
                    <p className="mt-1 text-white/60">runtime budget</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserGatewayPack.externalRequired.length}</div>
                    <p className="mt-1 text-white/60">external gates</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.browserGatewayPack.actionSchema.map(action => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={action.action}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{action.action}</span>
                        <span>{action.allowed ? 'allowed' : 'blocked'} / {action.writesTo}</span>
                      </div>
                      <p className="mt-1 text-white/60">evidence: {action.requiredEvidence.slice(0, 3).join(' / ')}</p>
                      <p className="mt-1 text-white/45">stop: {action.stopIf.slice(0, 2).join(' / ')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    request: {dispatchState.browserGatewayPack.browserRequest.method} {dispatchState.browserGatewayPack.browserRequest.endpointPath} / {dispatchState.browserGatewayPack.browserRequest.authHeader}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    snapshot: {dispatchState.browserGatewayPack.snapshotPolicy.allowedFields.slice(0, 4).join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.browserGatewayPack.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.callbackSimulation ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Signed Callback Simulator</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.callbackSimulation.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.callbackSimulation.mode}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.callbackSimulation.callback.signatureVerified ? 'verified' : 'denied'}</div>
                    <p className="mt-1 text-white/60">signature</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.callbackSimulation.receipt.status}</div>
                    <p className="mt-1 text-white/60">{dispatchState.callbackSimulation.receipt.evidenceLevel} · {dispatchState.callbackSimulation.receipt.evidenceScore}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.callbackSimulation.businessSignals.summary.reservations}</div>
                    <p className="mt-1 text-white/60">reservations</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.callbackSimulation.heartbeat.followups.length}</div>
                    <p className="mt-1 text-white/60">followups</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.callbackSimulation.executionPackage.canForward ? 'forwardable' : 'local-only'}</div>
                    <p className="mt-1 text-white/60">external runtime</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.callbackSimulation.blockedExternal.slice(0, 3).join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.callbackSimulation.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.runHealth ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Run Health 与回执验收</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runHealth.summary.totalRuns}</div>
                    <p className="mt-1 text-white/60">runs</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runHealth.summary.accepted}</div>
                    <p className="mt-1 text-white/60">accepted</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runHealth.summary.waitingReceipt}</div>
                    <p className="mt-1 text-white/60">waiting</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runHealth.summary.blockedAuth}</div>
                    <p className="mt-1 text-white/60">blocked</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runHealth.summary.failed}</div>
                    <p className="mt-1 text-white/60">failed</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runHealth.summary.rejectedReceipts}</div>
                    <p className="mt-1 text-white/60">rejected receipts</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.runHealth.items.slice(0, 3).map(item => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.8fr_0.7fr_0.7fr_1.5fr]" key={`${item.eventId}-${item.target}`}>
                      <span className="font-mono text-white">{item.state}</span>
                      <span>{item.target} · {item.evidenceState}</span>
                      <span>{item.evidenceLevel || 'missing'} · {item.evidenceScore ?? 0}</span>
                      <span>{item.nextAction}</span>
                      {item.evidenceWarnings?.length ? <span className="md:col-span-4 text-amber-100">{item.evidenceWarnings.slice(0, 2).join(' / ')}</span> : null}
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {dispatchState.runHealth.safetyBoundary}
                </div>
              </div>
            ) : null}
            {dispatchState.businessSignals ? (
              <div className="md:col-span-3">
                <div className="text-white/45">经营信号聚合</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.businessSignals.summary.reservations}</div>
                    <p className="mt-1 text-white/60">reservations</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.businessSignals.summary.couponClaims}</div>
                    <p className="mt-1 text-white/60">coupon claims</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.businessSignals.summary.redemptions}</div>
                    <p className="mt-1 text-white/60">redemptions</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.businessSignals.summary.inquiries}</div>
                    <p className="mt-1 text-white/60">inquiries</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.businessSignals.summary.visitIntent}</div>
                    <p className="mt-1 text-white/60">visit intent</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.businessSignals.summary.evidenceScoreAverage}</div>
                    <p className="mt-1 text-white/60">avg proof</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.businessSignals.items.slice(0, 3).map(item => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.8fr_0.7fr_0.7fr_1.4fr]" key={item.receiptId}>
                      <span className="font-mono text-white">{item.signalType}</span>
                      <span>{item.channel}</span>
                      <span>{item.evidenceLevel} · {item.evidenceScore}</span>
                      <span>{item.nextAction}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {dispatchState.businessSignals.safetyBoundary}
                </div>
              </div>
            ) : null}
            {dispatchState.storeManagerFollowup ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Store Manager Follow-up Pack</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.storeManagerFollowup.summary.tasks}</div>
                    <p className="mt-1 text-white/60">tasks</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.storeManagerFollowup.summary.today}</div>
                    <p className="mt-1 text-white/60">today</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.storeManagerFollowup.summary.nextShift}</div>
                    <p className="mt-1 text-white/60">next shift</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.storeManagerFollowup.summary.blocked}</div>
                    <p className="mt-1 text-white/60">blocked</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.storeManagerFollowup.summary.visitIntent}</div>
                    <p className="mt-1 text-white/60">visit intent</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.storeManagerFollowup.summary.couponClaims}</div>
                    <p className="mt-1 text-white/60">coupon claims</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.storeManagerFollowup.tasks.slice(0, 4).map(task => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.55fr_0.55fr_1.2fr_1.2fr]" key={task.id}>
                      <span className="font-mono text-white">{task.owner} · {task.priority}</span>
                      <span>{task.signal}</span>
                      <span>{task.action}</span>
                      <span className="text-white/55">{task.talkTrack}</span>
                      <span className="md:col-span-4 text-white/45">evidence: {task.evidenceRequired} · due: {task.dueWindow}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.storeManagerFollowup.managerBrief.join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.storeManagerFollowup.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.posImport ? (
              <div className="md:col-span-3">
                <div className="text-white/45">POS Import Validator</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.posImport.summary.validRows}/{dispatchState.posImport.summary.totalRows}</div>
                    <p className="mt-1 text-white/60">valid rows</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.posImport.summary.couponClaimCount}</div>
                    <p className="mt-1 text-white/60">coupon claims</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.posImport.summary.redemptionCount}</div>
                    <p className="mt-1 text-white/60">redemptions</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.posImport.summary.orderCount}</div>
                    <p className="mt-1 text-white/60">orders</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{Math.round(dispatchState.posImport.summary.grossSalesCents / 100)}</div>
                    <p className="mt-1 text-white/60">gross sales</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.posImport.summary.redemptionRatePct}%</div>
                    <p className="mt-1 text-white/60">redemption rate</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.posImport.payloadShape} · {dispatchState.posImport.status}</div>
                    <p className="mt-1 text-white/60">
                      issues: {dispatchState.posImport.issues.filter(item => item.severity === 'error').length} errors / {dispatchState.posImport.issues.filter(item => item.severity === 'warning').length} warnings
                    </p>
                    <p className="mt-1 text-white/60">
                      required: {dispatchState.posImport.schema.required.join(' / ')}
                    </p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.posImport.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.runtimeProbe ? (
              <div className="md:col-span-3">
                <div className="text-white/45">外部 Runtime Health Probe</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeProbe.summary.ready}</div>
                    <p className="mt-1 text-white/60">ready</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeProbe.summary.missingConfig}</div>
                    <p className="mt-1 text-white/60">missing</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeProbe.summary.unreachable}</div>
                    <p className="mt-1 text-white/60">unreachable</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeProbe.summary.blockedExternal}</div>
                    <p className="mt-1 text-white/60">gates blocked</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeProbe.summary.probed}</div>
                    <p className="mt-1 text-white/60">probed</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {dispatchState.runtimeProbe.targets.map(target => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={target.target}>
                      <div className="font-mono text-white">{target.target} · {target.status}</div>
                      <p className="mt-1 text-white/60">{target.nextAction}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {dispatchState.runtimeProbe.safetyBoundary}
                </div>
              </div>
            ) : null}
            {dispatchState.runtimeSetupContract ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Runtime Setup Contract</div>
                <div className="mt-2 grid gap-2 md:grid-cols-4">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeSetupContract.summary.readyTracks}/{dispatchState.runtimeSetupContract.summary.tracks}</div>
                    <p className="mt-1 text-white/60">ready tracks</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeSetupContract.summary.missingRequirements}</div>
                    <p className="mt-1 text-white/60">missing gates</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeSetupContract.blockedCapabilities.length}</div>
                    <p className="mt-1 text-white/60">blocked capabilities</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeSetupContract.payloadShape}</div>
                    <p className="mt-1 text-white/60">contract shape</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.runtimeSetupContract.tracks.map(track => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={track.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{track.name}</span>
                        <span>{track.status}</span>
                      </div>
                      <p className="mt-1 text-white/60">{track.nextAction}</p>
                      <p className="mt-1 text-white/50">
                        missing: {track.requirements.filter(item => !item.configured).map(item => item.label).join(' / ') || 'none'}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.runtimeSetupContract.blockedCapabilities.map(item => `${item.capability}: ${item.reason}`).join(' / ') || 'no blocked capability'}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.runtimeSetupContract.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.runtimeAdapterContract ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Runtime Adapter Contract</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeAdapterContract.target}</div>
                    <p className="mt-1 text-white/60">target</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeAdapterContract.verdict}</div>
                    <p className="mt-1 text-white/60">verdict</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeAdapterContract.summary.ready}/{dispatchState.runtimeAdapterContract.summary.checks}</div>
                    <p className="mt-1 text-white/60">ready checks</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeAdapterContract.summary.missing}</div>
                    <p className="mt-1 text-white/60">missing</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeAdapterContract.summary.blocked}</div>
                    <p className="mt-1 text-white/60">blocked</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeAdapterContract.summary.canSubmitSandbox ? 'ready' : 'blocked'}</div>
                    <p className="mt-1 text-white/60">sandbox submit</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    request: {dispatchState.runtimeAdapterContract.requestContract.method} {dispatchState.runtimeAdapterContract.adapterSpec.endpointPath} / {dispatchState.runtimeAdapterContract.requestContract.bodyShape}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    response: {dispatchState.runtimeAdapterContract.responseContract.acceptedStatuses.join('/')} / id {dispatchState.runtimeAdapterContract.responseContract.runIdFields.join('|')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    callback: {dispatchState.runtimeAdapterContract.callbackContract.action} / {dispatchState.runtimeAdapterContract.callbackContract.header}
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.runtimeAdapterContract.checks.map(check => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={check.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{check.id}</span>
                        <span>{check.status}</span>
                      </div>
                      <p className="mt-1 text-white/60">{check.nextAction}</p>
                      <p className="mt-1 text-white/45">evidence: {check.evidence.join(' / ')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    script: {dispatchState.runtimeAdapterContract.sandboxScript.slice(0, 3).join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.runtimeAdapterContract.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.runtimeRunnerLoopPack ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Runtime Runner Loop Pack</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeRunnerLoopPack.verdict}</div>
                    <p className="mt-1 text-white/60">verdict</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeRunnerLoopPack.summary.runnerEvents}</div>
                    <p className="mt-1 text-white/60">runner events</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeRunnerLoopPack.summary.activeRunnerRuns}</div>
                    <p className="mt-1 text-white/60">active runner</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeRunnerLoopPack.summary.waitingReceipts}</div>
                    <p className="mt-1 text-white/60">waiting receipts</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeRunnerLoopPack.summary.acceptedReceipts}</div>
                    <p className="mt-1 text-white/60">accepted receipts</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeRunnerLoopPack.summary.recoveryActions}</div>
                    <p className="mt-1 text-white/60">recovery</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.runtimeRunnerLoopPack.stages.map(stage => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={stage.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{stage.id}</span>
                        <span>{stage.status} / {stage.owner}</span>
                      </div>
                      <p className="mt-1 text-white/60">{stage.nextAction}</p>
                      <p className="mt-1 text-white/45">evidence: {stage.evidence.join(' / ')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    next: {dispatchState.runtimeRunnerLoopPack.nextBestAction}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    external required: {dispatchState.runtimeRunnerLoopPack.externalRequired.slice(0, 3).join(' / ') || 'none'}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.runtimeRunnerLoopPack.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.providerSetupWizard ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Provider Setup Wizard</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupWizard.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.providerSetupWizard.restaurant} / {dispatchState.providerSetupWizard.offer}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupWizard.summary.completionPercent}%</div>
                    <p className="mt-1 text-white/60">completion</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupWizard.summary.configured}</div>
                    <p className="mt-1 text-white/60">configured fields</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupWizard.summary.missing}</div>
                    <p className="mt-1 text-white/60">missing fields</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupWizard.summary.canEnableExternalAutomation ? 'ready' : 'blocked'}</div>
                    <p className="mt-1 text-white/60">external automation</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.providerSetupWizard.sections.map(section => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={section.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{section.title}</span>
                        <span>{section.status} · {section.owner}</span>
                      </div>
                      <p className="mt-1 text-white/60">{section.purpose}</p>
                      <div className="mt-2 space-y-1">
                        {section.fields.slice(0, 4).map(field => (
                          <p className="text-white/50" key={field.id}>{field.status} · {field.label} · {field.safePlaceholder}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    missing env: {dispatchState.providerSetupWizard.handoffPayload.missingEnvKeys.join(' / ') || 'none'}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.providerSetupWizard.safetyBoundary}
                  </div>
                </div>
                {dispatchState.providerSetupState ? (
                  <div className="mt-2 grid gap-2 md:grid-cols-4">
                    <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                      setup records: {dispatchState.providerSetupState.summary.records}
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                      env keys: {dispatchState.providerSetupState.provided.envKeys.join(' / ') || 'none'}
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                      approvals: {dispatchState.providerSetupState.summary.merchantApprovals}
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                      data contracts: {dispatchState.providerSetupState.summary.dataContracts}
                    </div>
                  </div>
                ) : null}
                {dispatchState.providerReadinessHealth ? (
                  <div className="mt-2">
                    <div className="text-white/45">Provider Readiness Health</div>
                    <div className="mt-2 grid gap-2 md:grid-cols-6">
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="font-mono text-white">{dispatchState.providerReadinessHealth.payloadShape}</div>
                        <p className="mt-1 text-white/60">health payload</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="font-mono text-white">{dispatchState.providerReadinessHealth.summary.readinessScore}%</div>
                        <p className="mt-1 text-white/60">readiness score</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="font-mono text-white">{dispatchState.providerReadinessHealth.summary.healthReady}</div>
                        <p className="mt-1 text-white/60">health ready</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="font-mono text-white">{dispatchState.providerReadinessHealth.summary.rememberedNotProbed}</div>
                        <p className="mt-1 text-white/60">remembered-not-probed</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="font-mono text-white">{dispatchState.providerReadinessHealth.summary.configuredButUnreachable}</div>
                        <p className="mt-1 text-white/60">unreachable</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="font-mono text-white">{dispatchState.providerReadinessHealth.summary.canEnableExternalAutomation ? 'ready' : 'blocked'}</div>
                        <p className="mt-1 text-white/60">external automation</p>
                      </div>
                    </div>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      {dispatchState.providerReadinessHealth.items.map(item => (
                        <div className="border border-white/10 bg-white/[0.05] p-2" key={item.id}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono text-white">{item.label}</span>
                            <span>{item.status}</span>
                          </div>
                          <p className="mt-1 text-white/60">{item.nextAction}</p>
                          <p className="mt-1 text-white/45">configured: {item.configuredEvidence.join(' / ') || 'none'}</p>
                          <p className="mt-1 text-white/45">missing: {item.missingEvidence.join(' / ') || 'none'}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                      {dispatchState.providerReadinessHealth.safetyBoundary}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            {dispatchState.providerSetupPack ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Provider Setup Pack</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupPack.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.providerSetupPack.restaurant} / {dispatchState.providerSetupPack.offer}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupPack.summary.ready}</div>
                    <p className="mt-1 text-white/60">ready gates</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupPack.summary.missing}</div>
                    <p className="mt-1 text-white/60">missing gates</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupPack.summary.blockedCapabilities}</div>
                    <p className="mt-1 text-white/60">blocked capabilities</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupPack.summary.readyForExternalExecution ? 'ready' : 'blocked'}</div>
                    <p className="mt-1 text-white/60">external execution</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.providerSetupPack.priorityRequests.slice(0, 6).map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={item.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{item.label}</span>
                        <span>{item.owner} · {item.status}</span>
                      </div>
                      <p className="mt-1 text-white/60">{item.nextAction}</p>
                      <p className="mt-1 text-white/50">unlocks: {item.unlocks.join(' / ')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    env: {dispatchState.providerSetupPack.envTemplate.map(item => item.key).join(' / ') || 'none'}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    merchant: {dispatchState.providerSetupPack.merchantRequests.slice(0, 3).map(item => item.ask).join(' / ') || 'none'}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    fallback: {dispatchState.providerSetupPack.internalFallbacks.slice(0, 2).map(item => `${item.capability}: ${item.canDoNow.slice(0, 2).join(', ')}`).join(' / ')}
                  </div>
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {dispatchState.providerSetupPack.safetyBoundary}
                </div>
              </div>
            ) : null}
            {dispatchState.externalExecutionWizard ? (
              <div className="md:col-span-3">
                <div className="text-white/45">External Execution Wizard</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.externalExecutionWizard.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.externalExecutionWizard.restaurant} / {dispatchState.externalExecutionWizard.offer}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.externalExecutionWizard.verdict}</div>
                    <p className="mt-1 text-white/60">verdict</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.externalExecutionWizard.summary.readySteps}/{dispatchState.externalExecutionWizard.summary.steps}</div>
                    <p className="mt-1 text-white/60">ready steps</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.externalExecutionWizard.summary.missingProviderGates}</div>
                    <p className="mt-1 text-white/60">provider gates</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.externalExecutionWizard.executionPackage.status}</div>
                    <p className="mt-1 text-white/60">{dispatchState.externalExecutionWizard.target} package</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.externalExecutionWizard.steps.map(step => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={step.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{step.title}</span>
                        <span>{step.owner} · {step.status}</span>
                      </div>
                      <p className="mt-1 text-white/60">{step.nextAction}</p>
                      <p className="mt-1 text-white/50">evidence: {step.evidence.slice(0, 3).join(' / ') || 'none'}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    script: {dispatchState.externalExecutionWizard.operatorScript.join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.externalExecutionWizard.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.controlledTrialRun ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Controlled Trial Run</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.controlledTrialRun.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.controlledTrialRun.restaurant} / {dispatchState.controlledTrialRun.offer}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.controlledTrialRun.verdict}</div>
                    <p className="mt-1 text-white/60">{dispatchState.controlledTrialRun.mode}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.controlledTrialRun.simulation.callback.signatureVerified ? 'verified' : 'rejected'}</div>
                    <p className="mt-1 text-white/60">signed callback</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.controlledTrialRun.simulation.receipt.status}</div>
                    <p className="mt-1 text-white/60">{dispatchState.controlledTrialRun.simulation.receipt.receiptId}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.controlledTrialRun.businessSignals.summary.visitIntent}</div>
                    <p className="mt-1 text-white/60">visit intent</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {dispatchState.controlledTrialRun.operatorCloseout.map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={`${item.owner}-${item.evidence}`}>
                      <div className="font-mono text-white">{item.owner}</div>
                      <p className="mt-1 text-white/60">{item.action}</p>
                      <p className="mt-1 text-white/50">evidence: {item.evidence}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    external required: {dispatchState.controlledTrialRun.externalRequired.slice(0, 3).join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.controlledTrialRun.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.toolPolicy ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Tool Policy 与 Secret Proxy</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.toolPolicy.summary.internalReady}</div>
                    <p className="mt-1 text-white/60">internal-ready</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.toolPolicy.summary.externalReady}</div>
                    <p className="mt-1 text-white/60">external-ready</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.toolPolicy.summary.blocked}</div>
                    <p className="mt-1 text-white/60">blocked</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.toolPolicy.summary.forbidden}</div>
                    <p className="mt-1 text-white/60">forbidden</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">
                      {dispatchState.toolPolicy.secretProxy.slots.filter(slot => slot.configured).length}/{dispatchState.toolPolicy.secretProxy.slots.length}
                    </div>
                    <p className="mt-1 text-white/60">secret slots</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.toolPolicy.decisions.map(decision => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.9fr_0.6fr_1.4fr]" key={decision.action}>
                      <span className="font-mono text-white">{decision.action}</span>
                      <span>{decision.decision}</span>
                      <span>{decision.blockedReasons.length ? decision.blockedReasons.join(' / ') : decision.nextAction}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    exposed secrets: {dispatchState.toolPolicy.secretProxy.exposedSecretCount}; mode: {dispatchState.toolPolicy.secretProxy.mode}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.toolPolicy.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.publicProfile ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Public Profile Intake</div>
                <div className="mt-2 grid gap-2 md:grid-cols-4">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.publicProfile.mode}</div>
                    <p className="mt-1 text-white/60">{dispatchState.publicProfile.profile.restaurant}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">
                      {dispatchState.publicProfile.fields.filter(item => item.confidence !== 'missing').length}/{dispatchState.publicProfile.fields.length}
                    </div>
                    <p className="mt-1 text-white/60">usable fields</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.publicProfile.memoryUpserts.length}</div>
                    <p className="mt-1 text-white/60">memory upserts</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.publicProfile.missingForActivation.length}</div>
                    <p className="mt-1 text-white/60">missing gates</p>
                  </div>
                </div>
                {dispatchState.publicIntelligenceBrief ? (
                  <div className="mt-3 border border-emerald-200/25 bg-emerald-200/[0.06] p-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">Public Intelligence Brief</div>
                        <p className="mt-1 text-sm font-black text-white">
                          {dispatchState.publicIntelligenceBrief.readiness.internalActions} internal actions ready / {dispatchState.publicIntelligenceBrief.readiness.externalGates} external gates
                        </p>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-3 md:min-w-[420px]">
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicIntelligenceBrief.readiness.usableFields}</div>
                          <p className="mt-1 text-white/55">usable fields</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicIntelligenceBrief.readiness.canStartTrial ? 'ready' : 'draft'}</div>
                          <p className="mt-1 text-white/55">trial status</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicIntelligenceBrief.platformProfiles.filter(item => item.usableNow).length}/{dispatchState.publicIntelligenceBrief.platformProfiles.length}</div>
                          <p className="mt-1 text-white/55">platform profiles</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-5">
                      {dispatchState.publicIntelligenceBrief.platformProfiles.map(item => (
                        <div className="border border-white/10 bg-white/[0.05] p-2" key={item.platform}>
                          <div className="font-mono text-white">{item.platform}</div>
                          <p className="mt-1 text-white/60">{item.usableNow ? 'usable now' : 'needs evidence'}</p>
                          <p className="mt-1 line-clamp-3 text-white/45">{item.nextAction}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">Material gaps</div>
                        <div className="mt-2 space-y-1">
                          {dispatchState.publicIntelligenceBrief.materialChecklist.slice(0, 4).map(item => (
                            <p className="text-white/60" key={item.id}>{item.status} · {item.label} · {item.owner}</p>
                          ))}
                        </div>
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">Operator script</div>
                        {dispatchState.publicIntelligenceBrief.operatorScript.map(item => (
                          <p className="mt-1 text-white/60" key={item}>{item}</p>
                        ))}
                        <button
                          className="mt-2 border border-emerald-200/50 px-2 py-1 text-[11px] font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildPublicSourceHarvestPack}
                          type="button"
                        >
                          Source Harvest Pack
                        </button>
                        <button
                          className="ml-2 mt-2 border border-emerald-200/50 px-2 py-1 text-[11px] font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildPublicTrialSeed}
                          type="button"
                        >
                          Seed Trial
                        </button>
                        <button
                          className="ml-2 mt-2 border border-amber-200/50 px-2 py-1 text-[11px] font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildDayZeroMissionPack}
                          type="button"
                        >
                          Day-0 Missions
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
                {dispatchState.dayZeroMissionPack ? (
                  <div className="mt-3 border border-amber-200/25 bg-amber-200/[0.06] p-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">Day-0 Mission Pack</div>
                        <p className="mt-1 text-sm font-black text-white">
                          {dispatchState.dayZeroMissionPack.payloadShape} / {dispatchState.dayZeroMissionPack.verdict}
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-white/45">
                          {dispatchState.dayZeroMissionPack.restaurant} / {dispatchState.dayZeroMissionPack.offer}
                        </p>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-4 md:min-w-[520px]">
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.dayZeroMissionPack.summary.readyInternal}</div>
                          <p className="mt-1 text-white/55">internal-ready</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.dayZeroMissionPack.summary.needsMerchantEvidence}</div>
                          <p className="mt-1 text-white/55">merchant evidence</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.dayZeroMissionPack.summary.externalGated}</div>
                          <p className="mt-1 text-white/55">external gated</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.dayZeroMissionPack.summary.normalizedEvidenceFields}</div>
                          <p className="mt-1 text-white/55">import fields</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {dispatchState.dayZeroMissionPack.missions.slice(0, 6).map(item => (
                        <div className="border border-white/10 bg-white/[0.05] p-2" key={item.id}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-mono text-white">{item.owner} / {item.lane}</div>
                            <span className="border border-white/10 px-2 py-1 text-[10px] font-black text-white/70">{item.status}</span>
                          </div>
                          <p className="mt-1 text-white/70">{item.title}</p>
                          <p className="mt-1 text-white/45">{item.nextAction}</p>
                          <p className="mt-1 text-white/35">evidence: {item.evidenceRequired}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">Store manager checklist</div>
                        {dispatchState.dayZeroMissionPack.storeManagerChecklist.slice(0, 5).map(item => (
                          <p className="mt-1 text-white/60" key={`${item.owner}-${item.action}`}>{item.owner}: {item.action}</p>
                        ))}
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">External unlocks</div>
                        {dispatchState.dayZeroMissionPack.providerUnlocks.slice(0, 5).map(item => (
                          <p className="mt-1 text-white/60" key={item}>{item}</p>
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 border border-white/10 bg-white/[0.05] p-2 text-[11px] leading-4 text-white/45">{dispatchState.dayZeroMissionPack.safetyBoundary}</p>
                  </div>
                ) : null}
                {dispatchState.publicTrialSeed ? (
                  <div className="mt-3 border border-violet-200/25 bg-violet-200/[0.06] p-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/70">Public Trial Seed</div>
                        <p className="mt-1 text-sm font-black text-white">
                          {dispatchState.publicTrialSeed.payloadShape} / {dispatchState.publicTrialSeed.verdict}
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-white/45">
                          {dispatchState.publicTrialSeed.trialIntake.restaurant} / {dispatchState.publicTrialSeed.trialIntake.offer}
                        </p>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-4 md:min-w-[520px]">
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicTrialSeed.summary.usableFields}</div>
                          <p className="mt-1 text-white/55">usable fields</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicTrialSeed.summary.internalHarvestTargets}</div>
                          <p className="mt-1 text-white/55">internal harvest</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicTrialSeed.summary.workflowReadySteps}</div>
                          <p className="mt-1 text-white/55">ready steps</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicTrialSeed.summary.workflowExternalGatedSteps}</div>
                          <p className="mt-1 text-white/55">external gated</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">Trial intake</div>
                        {Object.entries(dispatchState.publicTrialSeed.trialIntake).slice(0, 6).map(([key, value]) => (
                          <p className="mt-1 text-white/60" key={key}>{key}: {String(value)}</p>
                        ))}
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">Next actions</div>
                        {dispatchState.publicTrialSeed.nextActions.map(item => (
                          <p className="mt-1 text-white/60" key={`${item.owner}-${item.action}`}>{item.owner}: {item.action}</p>
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 border border-white/10 bg-white/[0.05] p-2 text-[11px] leading-4 text-white/45">{dispatchState.publicTrialSeed.safetyBoundary}</p>
                  </div>
                ) : null}
                {dispatchState.publicSourceHarvestPack ? (
                  <div className="mt-3 border border-sky-200/25 bg-sky-200/[0.06] p-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">Public Source Harvest Pack</div>
                        <p className="mt-1 text-sm font-black text-white">
                          {dispatchState.publicSourceHarvestPack.payloadShape} / {dispatchState.publicSourceHarvestPack.verdict}
                        </p>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-3 md:min-w-[420px]">
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicSourceHarvestPack.summary.internalTargets}/{dispatchState.publicSourceHarvestPack.summary.targets}</div>
                          <p className="mt-1 text-white/55">internal targets</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicSourceHarvestPack.summary.merchantUploads}</div>
                          <p className="mt-1 text-white/55">merchant uploads</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicSourceHarvestPack.summary.providerRequired}</div>
                          <p className="mt-1 text-white/55">provider gates</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-5">
                      {dispatchState.publicSourceHarvestPack.targets.map(item => (
                        <div className="border border-white/10 bg-white/[0.05] p-2" key={item.id}>
                          <div className="font-mono text-white">{item.platform}</div>
                          <p className="mt-1 text-white/60">{item.mode}</p>
                          <p className="mt-1 line-clamp-3 text-white/45">{item.nextAction}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">Normalized import fields</div>
                        {dispatchState.publicSourceHarvestPack.normalizedImportTemplate.slice(0, 5).map(item => (
                          <p className="mt-1 text-white/60" key={item.field}>{item.field}: {item.currentValue}</p>
                        ))}
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">Runner boundary</div>
                        {dispatchState.publicSourceHarvestPack.browserRunnerInstructions.map(item => (
                          <p className="mt-1 text-white/60" key={item}>{item}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {dispatchState.publicProfile.fields.slice(0, 6).map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={item.field}>
                      <div className="font-mono text-white">{item.field} · {item.confidence}</div>
                      <p className="mt-1 text-white/60">{item.value || 'missing'}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.publicProfile.evidenceLedger[0]?.source} · {dispatchState.publicProfile.evidenceLedger[0]?.license}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.publicProfile.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.opsConsole ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Agent Ops Console</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.opsConsole.summary.runs}</div>
                    <p className="mt-1 text-white/60">runs</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.opsConsole.summary.acceptedReceipts}</div>
                    <p className="mt-1 text-white/60">accepted</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.opsConsole.summary.waitingReceipt}</div>
                    <p className="mt-1 text-white/60">waiting</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.opsConsole.summary.recoveryActions}</div>
                    <p className="mt-1 text-white/60">recovery</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.opsConsole.summary.watcherWakeups}</div>
                    <p className="mt-1 text-white/60">watchers</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.opsConsole.summary.blockedExternalGroups}</div>
                    <p className="mt-1 text-white/60">blocked gates</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.opsConsole.timeline.slice(0, 5).map(item => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.5fr_0.5fr_1fr_1.5fr]" key={`${item.stage}-${item.eventId}-${item.title}`}>
                      <span className="font-mono text-white">{item.stage}</span>
                      <span>{item.status}</span>
                      <span>{item.title}</span>
                      <span>{item.detail}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.opsConsole.blockedExternal.slice(0, 2).join(' / ') || 'no external blocker'}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.opsConsole.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.executionTimeline ? (
              <div className="md:col-span-3">
                <div className="text-white/45">Execution Timeline</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionTimeline.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.executionTimeline.mode}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionTimeline.summary.runs}</div>
                    <p className="mt-1 text-white/60">runs</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionTimeline.summary.acceptedReceipts}</div>
                    <p className="mt-1 text-white/60">accepted</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionTimeline.summary.watcherWakeups}</div>
                    <p className="mt-1 text-white/60">watchers</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionTimeline.summary.businessSignals}</div>
                    <p className="mt-1 text-white/60">business signals</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionTimeline.summary.canAutoContinue ? 'armed' : 'manual'}</div>
                    <p className="mt-1 text-white/60">continue mode</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.executionTimeline.items.slice(0, 6).map(item => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.55fr_0.55fr_1fr_1.4fr_1.2fr]" key={item.id}>
                      <span className="font-mono text-white">{item.stage}</span>
                      <span>{item.status}</span>
                      <span>{item.title}</span>
                      <span>{item.nextAction}</span>
                      <span className="text-white/50">{item.memoryWrite}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    heartbeat: {dispatchState.executionTimeline.nextHeartbeat.heartbeatId} · {dispatchState.executionTimeline.nextHeartbeat.followups.slice(0, 2).map(item => item.nextAction).join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    recovery: {dispatchState.executionTimeline.recovery.actions.slice(0, 2).map(item => item.nextStep).join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.executionTimeline.safetyBoundary}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-5 border border-stone-200 bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">External Setup Console</p>
            <h3 className="mt-1 text-lg font-black text-stone-950">自动发布、自动获客、自动核销的真实接入条件</h3>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-stone-600">
              竞品能做的自动执行，本质上需要 runtime、隔离浏览器、商家账号授权、POS/核销数据合同和回执签名。这里把能内部解决的接口先做实，缺外部的逐项显式阻断。
            </p>
          </div>
          <div className="grid min-w-[260px] grid-cols-3 gap-2 text-center">
            <div className="border border-stone-200 bg-[#fbfaf7] p-2">
              <div className="text-xl font-black text-stone-950">{initialReadiness.summary.ready}</div>
              <div className="mt-1 text-[11px] font-semibold text-stone-500">ready groups</div>
            </div>
            <div className="border border-stone-200 bg-[#fbfaf7] p-2">
              <div className="text-xl font-black text-stone-950">{initialReadiness.summary.blocked}</div>
              <div className="mt-1 text-[11px] font-semibold text-stone-500">blocked groups</div>
            </div>
            <div className="border border-stone-200 bg-[#fbfaf7] p-2">
              <div className="text-xl font-black text-stone-950">{initialReadiness.summary.configuredRequirements}/{initialReadiness.summary.totalRequirements}</div>
              <div className="mt-1 text-[11px] font-semibold text-stone-500">requirements</div>
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-4">
          {initialReadiness.groups.map(group => (
            <article className="border border-stone-200 bg-[#fbfaf7] p-3" key={group.id}>
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-black text-stone-950">{group.name}</h4>
                <span className={`shrink-0 border px-2 py-1 text-[10px] font-black ${group.status === 'ready' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
                  {group.status}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-stone-600">{group.purpose}</p>
              <div className="mt-3 space-y-1">
                {group.requirements.map(requirement => (
                  <div className="flex items-start justify-between gap-2 text-[11px]" key={requirement.id}>
                    <span className="text-stone-700">{requirement.label}</span>
                    <span className={requirement.configured ? 'font-semibold text-emerald-700' : 'font-semibold text-rose-700'}>
                      {requirement.configured ? 'configured' : 'missing'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 border-l-2 border-stone-300 pl-3 text-[11px] leading-5 text-stone-500">{group.nextAction}</p>
            </article>
          ))}
        </div>
        <div className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
          {initialReadiness.safetyBoundary}
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="border border-stone-200 bg-white p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Execution Queue</p>
              <h3 className="mt-1 text-lg font-black text-stone-950">餐饮 Agent 任务队列</h3>
            </div>
            <span className="border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-stone-600">可审计</span>
          </div>
          <div className="mt-4 divide-y divide-stone-200">
            {runtime.tasks.map(task => (
              <div className="py-3 first:pt-0 last:pb-0" key={task.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-black text-stone-950">{task.agent}</div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold">
                    <span className="bg-stone-100 px-2 py-1 text-stone-600">{modeLabel[task.mode]}</span>
                    <span className="bg-stone-100 px-2 py-1 text-stone-600">{task.owner}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-5 text-stone-600">{task.trigger}</p>
                <p className="mt-1 text-xs leading-5 text-stone-800">{task.action}</p>
                <p className="mt-2 text-[11px] leading-5 text-stone-500">证据：{task.evidenceRequired}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-stone-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Memory Rules</p>
          <h3 className="mt-1 text-lg font-black text-stone-950">门店记忆主动跟进</h3>
          <div className="mt-4 space-y-3">
            {runtime.memoryRules.map(rule => (
              <article className="border border-stone-200 bg-[#fbfaf7] p-3" key={rule.entity}>
                <div className="text-sm font-black text-stone-950">{rule.entity}</div>
                <p className="mt-2 text-xs leading-5 text-stone-600">写入：{rule.writes}</p>
                <p className="mt-1 text-xs leading-5 text-stone-600">用于：{rule.readsFor}</p>
                <p className="mt-1 text-[11px] leading-5 text-rose-700">{rule.safety}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="border border-stone-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Session Model</p>
          <h3 className="mt-1 text-lg font-black text-stone-950">常驻浏览器与工具权限</h3>
          <p className="mt-3 text-xs leading-5 text-stone-600">{capabilityPlan.session.browserProfile.approvalRequired}</p>
          <div className="mt-4 space-y-2">
            {capabilityPlan.session.toolPolicy.map(policy => (
              <div className="flex items-start justify-between gap-3 border border-stone-200 bg-[#fbfaf7] p-2" key={policy.tool}>
                <div>
                  <div className="font-mono text-xs text-stone-950">{policy.tool}</div>
                  <p className="mt-1 text-[11px] leading-5 text-stone-500">{policy.reason}</p>
                </div>
                <span className={`shrink-0 border px-2 py-1 text-[10px] font-black ${policy.allowed ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
                  {policy.allowed ? 'allow' : 'block'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-stone-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Watchers & Receipts</p>
          <h3 className="mt-1 text-lg font-black text-stone-950">主动跟进与失败恢复</h3>
          <div className="mt-4 space-y-2">
            {capabilityPlan.session.watchers.map(watcher => (
              <article className="border border-stone-200 bg-[#fbfaf7] p-3" key={watcher.event}>
                <div className="font-mono text-xs font-black text-stone-950">{watcher.event}</div>
                <p className="mt-1 text-xs leading-5 text-stone-600">{watcher.derives}</p>
                <p className="mt-1 text-[11px] leading-5 text-stone-500">{watcher.nextAction}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 border border-stone-200 bg-stone-50 p-3">
            <div className="text-[11px] font-semibold text-stone-500">回执字段</div>
            <p className="mt-2 text-xs leading-5 text-stone-700">{capabilityPlan.session.receiptSchema.join(' / ')}</p>
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="border border-stone-200 bg-[#fbfaf7] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Runtime Choice</p>
          <h3 className="mt-1 text-lg font-black text-stone-950">OpenClaw / Lobu / Hermes 接入判断</h3>
          <p className="mt-3 text-xs leading-5 text-stone-600">{runtime.summary.nextRuntimeChoice}</p>
          <div className="mt-4 space-y-3">
            {runtime.references.map(reference => (
              <a
                className="block border border-stone-200 bg-white p-3 transition hover:border-stone-300"
                href={reference.url}
                key={reference.name}
                rel="noreferrer"
                target="_blank"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-black text-stone-950">{reference.name}</span>
                  <span className="text-[11px] font-semibold text-stone-500">需接入</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-stone-600">{reference.usefulCapability}</p>
                <p className="mt-2 text-[11px] leading-5 text-stone-500">{reference.attachRequirement}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="border border-stone-200 bg-white p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">Connector Matrix</p>
          <h3 className="mt-1 text-lg font-black text-stone-950">外部连接器矩阵</h3>
          <div className="mt-4 overflow-hidden border border-stone-200">
            {externalConnectors.map(connector => (
              <div className="grid gap-3 border-b border-stone-200 p-3 last:border-b-0 md:grid-cols-[0.85fr_1.15fr]" key={connector.id}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-stone-950">{connector.name}</span>
                    <span className={`border px-2 py-1 text-[10px] font-black ${statusTone[connector.status]}`}>{statusLabel[connector.status]}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-stone-600">{connector.capability}</p>
                </div>
                <div>
                  <p className="text-xs leading-5 text-stone-700">{connector.nextAttachStep}</p>
                  <p className="mt-2 text-[11px] leading-5 text-rose-700">{connector.auditBoundary}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-4 border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
        下一步最小可接：先提供一个隔离浏览器 profile 或 OpenClaw/Hermes runtime，再接门店平台账号授权；POS、核销和私信数据必须来自商家导出、API 或明确授权。
      </div>
    </section>
  );
}

'use client';

import { useState } from 'react';
import { RestaurantProviderLiveRunGatePanel } from '@/components/RestaurantProviderLiveRunGatePanel';
import { RestaurantProviderForwardableSetupDossierPanel } from '@/components/RestaurantProviderForwardableSetupDossierPanel';
import { RestaurantProviderReceiptAcceptancePanel } from '@/components/RestaurantProviderReceiptAcceptancePanel';
import { RestaurantProviderRunPacketPanel } from '@/components/RestaurantProviderRunPacketPanel';
import { RestaurantRunnerMissionTimelinePanel } from '@/components/RestaurantRunnerMissionTimelinePanel';
import { buildRestaurantAgentCapabilityPlan } from '@/lib/restaurant-agent-capabilities';
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
import type { RestaurantClawCloudOperatorHome } from '@/lib/restaurant-claw-cloud-operator-home';
import type { RestaurantCompetitorAuditReport } from '@/lib/restaurant-agent-competitor-audit';
import type { RestaurantCompetitorRouteDecision } from '@/lib/restaurant-competitor-route-decision';
import type { RestaurantCompetitorTrainingBlueprint } from '@/lib/restaurant-competitor-training-blueprint';
import type { RestaurantDefaultPathForwardableBrief } from '@/lib/restaurant-default-path-forwardable-brief';
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
import type { RestaurantLeadAcquisitionProviderWorkbench } from '@/lib/restaurant-lead-acquisition-provider-workbench';
import type { RestaurantLeadSandboxAcceptanceFlow } from '@/lib/restaurant-lead-sandbox-acceptance-flow';
import type { RestaurantVoiceOrderConsole } from '@/lib/restaurant-voice-order-console';
import type { RestaurantOperatingDataContract } from '@/lib/restaurant-operating-data-contract';
import type { RestaurantOperatingInsightReport } from '@/lib/restaurant-operating-insight-report';
import type { RestaurantPlatformConnectorMatrix } from '@/lib/restaurant-platform-connector-matrix';
import type { RestaurantPlatformOperatingSpine } from '@/lib/restaurant-platform-operating-spine';
import type { RestaurantMerchantActivationPacket } from '@/lib/restaurant-merchant-activation-packet';
import type { RestaurantMerchantAuthorizationPacket } from '@/lib/restaurant-merchant-authorization-packet';
import type { RestaurantPublishExecutionInbox } from '@/lib/restaurant-publish-execution-inbox';
import type { RestaurantExecutionPackage } from '@/lib/restaurant-agent-execution-package';
import type { RestaurantExternalExecutionWizard } from '@/lib/restaurant-external-execution-wizard';
import type { RestaurantExternalAccessGuide } from '@/lib/restaurant-external-access-guide';
import type { RestaurantExternalUnlockRequestPack } from '@/lib/restaurant-external-unlock-request-pack';
import type { RestaurantExecutionTimeline } from '@/lib/restaurant-execution-timeline';
import type { RestaurantFirstForwardableRunPack } from '@/lib/restaurant-first-forwardable-run-pack';
import type { RestaurantFirstProviderSandboxRunConsole } from '@/lib/restaurant-first-provider-sandbox-run-console';
import type { RestaurantFirstRunControlTower } from '@/lib/restaurant-first-run-control-tower';
import type { RestaurantPostRunReviewPack } from '@/lib/restaurant-post-run-review-pack';
import type { RestaurantNextLoopChannelPlan } from '@/lib/restaurant-next-loop-channel-plan';
import type { RestaurantReputationCloseoutPack } from '@/lib/restaurant-reputation-closeout-pack';
import type { RestaurantProviderSetupPack } from '@/lib/restaurant-provider-setup-pack';
import type { RestaurantProviderSetupWizard } from '@/lib/restaurant-provider-setup-wizard';
import type { RestaurantProviderSetupStateSummary } from '@/lib/restaurant-provider-setup-state-store';
import type { RestaurantProviderAdapterContractPack } from '@/lib/restaurant-provider-adapter-contract-pack';
import type { RestaurantProviderAdapterConfigWorkbench } from '@/lib/restaurant-provider-adapter-config-workbench';
import type { RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import type { RestaurantProviderKeyGapBoard } from '@/lib/restaurant-provider-key-gap-board';
import type { RestaurantProviderReceiptLifecycle } from '@/lib/restaurant-provider-receipt-lifecycle';
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
import type { RestaurantProviderLiveRunGate } from '@/lib/restaurant-provider-live-run-gate';
import type { RestaurantProviderForwardableSetupDossier } from '@/lib/restaurant-provider-forwardable-setup-dossier';
import type { RestaurantProviderLiveRunLaunchAttempt } from '@/lib/restaurant-provider-live-run-launch-attempt';
import type { RestaurantRunnerMissionTimeline } from '@/lib/restaurant-runner-mission-timeline';
import type { RestaurantProviderReceiptAcceptanceConsole } from '@/lib/restaurant-provider-receipt-acceptance-console';
import type { RestaurantProviderRunPacket } from '@/lib/restaurant-provider-run-packet';
import type { RestaurantProviderAcceptanceWorkbench } from '@/lib/restaurant-provider-acceptance-workbench';
import type { RestaurantProviderSandboxContract } from '@/lib/restaurant-provider-sandbox-contract';
import type { RestaurantProviderSandboxReadinessBoard } from '@/lib/restaurant-provider-sandbox-readiness-board';
import type { RestaurantProviderSandboxRunConsole } from '@/lib/restaurant-provider-sandbox-run-console';
import type { RestaurantProviderSandboxSubmitAttempt, RestaurantProviderSandboxSubmitWorkbench } from '@/lib/restaurant-provider-sandbox-submit-workbench';
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
import type { RestaurantStoreDataImportCenter } from '@/lib/restaurant-store-data-import-center';
import type { RestaurantAgentOpsConsole } from '@/lib/restaurant-agent-ops-console';
import type { RestaurantStoreManagerFollowupPack } from '@/lib/restaurant-store-manager-followup';
import type { RestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';
import type { RestaurantStoreManagerTaskWatcher } from '@/lib/restaurant-store-manager-task-watcher';
import type { RestaurantStaffNotificationHandoff } from '@/lib/restaurant-staff-notification-handoff';
import type { RestaurantStaffNotificationDeliveryBridge } from '@/lib/restaurant-staff-notification-delivery-bridge';
import type { RestaurantStaffNotificationAuditLog } from '@/lib/restaurant-staff-notification-audit-store';
import type { RestaurantTaskProviderHandoff } from '@/lib/restaurant-task-provider-handoff';
import type { RestaurantTodayCommandCockpit } from '@/lib/restaurant-today-command-cockpit';
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

const runtimeStatusLabel: Record<string, string> = {
  accepted: '已验收',
  blocked: '暂停',
  complete: '已完成',
  done: '已完成',
  failed: '失败',
  forwarded: '已转发',
  gated: '待补资料',
  measured: '可量化',
  queued: '已排队',
  ready: '可用',
  'ready-now': '现在可做',
  'ready-internal': '本地可做',
  'internal-ready': '本地可做',
  'ready-to-check': '可检查',
  'ready-to-sign': '可签收',
  'ready-to-submit': '可提交',
  'run-now': '现在可跑',
  'sample-ready': '样例可跑',
  waiting: '等待中',
  'waiting-proof': '等凭证',
  'waiting-provider': '待补资料',
  'waiting-receipt': '等回执',
  'provider-gated': '待补资料',
  'data-gated': '待补数据',
  'external-gated': '待补外部条件',
  'needs-evidence': '待补凭证',
  'needs-field-mapping': '待补字段',
  'needs-merchant-review': '待店长确认',
  'needs-provider': '待补资料',
  'needs-review': '待审核',
  'needs-server-key': '待账号配置',
  'missing-data-contract': '待补数据规则',
  'missing-evidence': '待补凭证',
  'missing-merchant-grant': '待店长授权',
  'missing-runtime': '待配置试跑通道',
  'merchant-gated': '待店长授权',
  'needs-data-contract': '待补数据规则',
  'needs-merchant-auth': '待店长授权',
  'external-blocked': '待补外部条件',
  'provider-health-ready': '外部条件就绪',
  'setup-evidence-signed': '资料已签收',
  'sandbox-simulator': '沙箱模拟',
  'runtime-callback-blocked': '待回执配置',
  'review-needed': '待审核',
  'staff-review': '等员工确认',
  'training-needed': '待训练',
  'blocked-provider': '待补资料',
  'blocked-data-contract': '待补数据规则',
  'blocked-provider-setup': '待补账号配置',
  'blocked-until-accepted-receipts': '回执验收前不承诺',
  'needs-receipt': '等回执',
  'blocked-before-callback': '回执前暂停',
  'simulator-first': '先跑模拟',
  'merchant-auth-required': '待店长授权',
  'sign-merchant-scope-first': '先签授权范围',
  'provider-unlock-first': '先补外部条件',
  'preview-before-run': '先预览再试跑',
  'provider-setup-required': '待补账号配置',
  'waiting-provider-setup': '等账号配置',
  'server-keys-first': '先配服务端账号',
};

const formatRuntimeStatus = (status: unknown) => {
  if (typeof status !== 'string') return String(status ?? '');
  return runtimeStatusLabel[status] || status;
};

const runtimeTitleLabel: Record<string, string> = {
  'Today Operations': '今日门店运营',
  'AI Consultant': 'AI 经营顾问',
  'Automation Launch': '真实代办启动',
  'Evidence Review': '凭证复核',
  'Persistent Browser Agent': '常驻浏览器代办',
  'Auto Publish': '代发布',
  'Auto Lead Capture': '代接线索',
  'Coupon Redemption': '券码核销',
  'Business Analysis': '经营分析',
  'Memory Follow-up': '门店记忆跟进',
};

const formatRuntimeLabel = (label: unknown) => {
  if (typeof label !== 'string') return String(label ?? '');
  return runtimeTitleLabel[label] || label;
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
    label: '内容上新包',
    description: '大众点评、小红书、抖音和微信社群的内容包',
    moduleIds: ['brand-positioning', 'menu-engineering', 'local-life-content', 'competitive-intel'],
  },
  {
    id: 'private-domain',
    label: '私域跟进包',
    description: '咨询承接、社群跟进、预约和会员任务',
    moduleIds: ['member-growth', 'private-domain', 'reservation-ops', 'service-quality'],
  },
  {
    id: 'coupon-pos',
    label: '券码与POS包',
    description: '券核销、POS 导入和财务凭证条件',
    moduleIds: ['coupon-redemption', 'pos-analytics', 'finance-diagnosis', 'legal-compliance'],
  },
  {
    id: 'agent-governance',
    label: '代办治理包',
    description: '浏览器执行、回执、异常恢复和资料解锁',
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
    clawCloudOperatorHome?: RestaurantClawCloudOperatorHome;
    defaultPathForwardableBrief?: RestaurantDefaultPathForwardableBrief;
    controlledTrialRun?: RestaurantControlledTrialRun;
    customerDemandGateway?: RestaurantCustomerDemandGateway;
    leadCaptureInbox?: RestaurantLeadCaptureInbox;
    leadAcquisitionProviderWorkbench?: RestaurantLeadAcquisitionProviderWorkbench;
    leadSandboxAcceptanceFlow?: RestaurantLeadSandboxAcceptanceFlow;
    voiceOrderConsole?: RestaurantVoiceOrderConsole;
    aiOsAuditReport?: RestaurantAiOsAuditReport;
    platformConnectorMatrix?: RestaurantPlatformConnectorMatrix;
    operatingInsightReport?: RestaurantOperatingInsightReport;
    platformOperatingSpine?: RestaurantPlatformOperatingSpine;
    merchantActivationPacket?: RestaurantMerchantActivationPacket;
    merchantAuthorizationPacket?: RestaurantMerchantAuthorizationPacket;
    publishExecutionInbox?: RestaurantPublishExecutionInbox;
    operatingDataContract?: RestaurantOperatingDataContract;
    storeDataImportCenter?: RestaurantStoreDataImportCenter;
    providerSetupPack?: RestaurantProviderSetupPack;
    externalUnlockRequestPack?: RestaurantExternalUnlockRequestPack;
    providerSetupWizard?: RestaurantProviderSetupWizard;
    providerSetupState?: RestaurantProviderSetupStateSummary;
    providerAdapterContractPack?: RestaurantProviderAdapterContractPack;
    providerAdapterConfigWorkbench?: RestaurantProviderAdapterConfigWorkbench;
    providerReadinessHealth?: RestaurantProviderReadinessHealth;
    providerKeyGapBoard?: RestaurantProviderKeyGapBoard;
    providerUnlockLadder?: RestaurantProviderUnlockLadder;
    externalAccessGuide?: RestaurantExternalAccessGuide;
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
    providerLiveRunGate?: RestaurantProviderLiveRunGate;
    providerForwardableSetupDossier?: RestaurantProviderForwardableSetupDossier;
    providerLiveRunLaunchAttempt?: RestaurantProviderLiveRunLaunchAttempt;
    runnerMissionTimeline?: RestaurantRunnerMissionTimeline;
    providerReceiptLifecycle?: RestaurantProviderReceiptLifecycle;
    providerReceiptAcceptanceConsole?: RestaurantProviderReceiptAcceptanceConsole;
    providerRunPacket?: RestaurantProviderRunPacket;
    providerAcceptanceWorkbench?: RestaurantProviderAcceptanceWorkbench;
    providerSandboxContract?: RestaurantProviderSandboxContract;
    providerSandboxReadinessBoard?: RestaurantProviderSandboxReadinessBoard;
    providerSandboxRunConsole?: RestaurantProviderSandboxRunConsole;
    providerSandboxSubmitWorkbench?: RestaurantProviderSandboxSubmitWorkbench;
    providerSandboxSubmitAttempt?: RestaurantProviderSandboxSubmitAttempt;
    providerLaunchBoard?: RestaurantProviderLaunchBoard;
    firstForwardableRunPack?: RestaurantFirstForwardableRunPack;
    firstProviderSandboxRunConsole?: RestaurantFirstProviderSandboxRunConsole;
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
    todayCommandCockpit?: RestaurantTodayCommandCockpit;
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
    setDispatchState({ status: 'loading', message: '正在生成外部试跑任务...' });
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
    setDispatchState({ status: 'loading', message: '正在生成门店试跑工作流……' });
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
        message: `试跑工作流已生成：共 ${payload?.trialWorkflowPack?.summary?.steps ?? 0} 步，可做 ${payload?.trialWorkflowPack?.summary?.readySteps ?? 0} 步，待补外部条件 ${payload?.trialWorkflowPack?.summary?.externalGatedSteps ?? 0} 步。`,
        trialWorkflowPack: payload?.trialWorkflowPack,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '试跑工作流暂不可用。' });
    }
  };

  const buildClawExperienceDefaultPath = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成默认试跑路径……' }));
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
        message: `默认路径：可做 ${payload?.clawExperienceDefaultPath?.summary?.readyNow ?? 0} 项，待训练 ${payload?.clawExperienceDefaultPath?.summary?.trainingNeeded ?? 0} 项，待补资料/边界 ${payload?.clawExperienceDefaultPath?.summary?.providerGated ?? 0} 项。`,
        clawExperienceDefaultPath: payload?.clawExperienceDefaultPath || previous.clawExperienceDefaultPath,
        clawCloudOperatorHome: payload?.clawCloudOperatorHome || previous.clawCloudOperatorHome,
        defaultPathForwardableBrief: payload?.defaultPathForwardableBrief || previous.defaultPathForwardableBrief,
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
        providerKeyGapBoard: payload?.providerKeyGapBoard || previous.providerKeyGapBoard,
        providerAdapterContractPack: payload?.providerAdapterContractPack || previous.providerAdapterContractPack,
        providerAdapterConfigWorkbench: payload?.providerAdapterConfigWorkbench || previous.providerAdapterConfigWorkbench,
        merchantAuthorizationPacket: payload?.merchantAuthorizationPacket || previous.merchantAuthorizationPacket,
        competitorAudit: payload?.competitorAudit || previous.competitorAudit,
        buildQueue: payload?.buildQueue || previous.buildQueue,
        providerSetupWizard: payload?.providerSetupWizard || previous.providerSetupWizard,
        providerUnlockLadder: payload?.providerUnlockLadder || previous.providerUnlockLadder,
        externalAccessGuide: payload?.externalAccessGuide || previous.externalAccessGuide,
        providerLaunchBoard: payload?.providerLaunchBoard || previous.providerLaunchBoard,
        platformConnectorMatrix: payload?.platformConnectorMatrix || previous.platformConnectorMatrix,
        aiConsultantCopilot: payload?.aiConsultantCopilot || previous.aiConsultantCopilot,
        dayZeroMissionPack: payload?.dayZeroMissionPack || previous.dayZeroMissionPack,
        storeOperatingPlan: payload?.storeOperatingPlan || previous.storeOperatingPlan,
        todayCommandCockpit: payload?.todayCommandCockpit || previous.todayCommandCockpit,
        aiCockpit: payload?.aiCockpit || previous.aiCockpit,
        customerDemandGateway: payload?.customerDemandGateway || previous.customerDemandGateway,
        leadCaptureInbox: payload?.leadCaptureInbox || previous.leadCaptureInbox,
        leadAcquisitionProviderWorkbench: payload?.leadAcquisitionProviderWorkbench || previous.leadAcquisitionProviderWorkbench,
        leadSandboxAcceptanceFlow: payload?.leadSandboxAcceptanceFlow || previous.leadSandboxAcceptanceFlow,
        publishExecutionInbox: payload?.publishExecutionInbox || previous.publishExecutionInbox,
        voiceOrderConsole: payload?.voiceOrderConsole || previous.voiceOrderConsole,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        posImport: payload?.posImport || previous.posImport,
        operatingDataContract: payload?.operatingDataContract || previous.operatingDataContract,
        storeDataImportCenter: payload?.storeDataImportCenter || previous.storeDataImportCenter,
        operatingInsightReport: payload?.operatingInsightReport || previous.operatingInsightReport,
        providerReceiptInbox: payload?.providerReceiptInbox || previous.providerReceiptInbox,
        providerLiveRunGate: payload?.providerLiveRunGate || previous.providerLiveRunGate,
        providerForwardableSetupDossier: payload?.providerForwardableSetupDossier || previous.providerForwardableSetupDossier,
        providerLiveRunLaunchAttempt: payload?.providerLiveRunLaunchAttempt || previous.providerLiveRunLaunchAttempt,
        runnerMissionTimeline: payload?.runnerMissionTimeline || previous.runnerMissionTimeline,
        providerReceiptLifecycle: payload?.providerReceiptLifecycle || previous.providerReceiptLifecycle,
        providerReceiptAcceptanceConsole: payload?.providerReceiptAcceptanceConsole || previous.providerReceiptAcceptanceConsole,
        providerRunPacket: payload?.providerRunPacket || previous.providerRunPacket,
        providerAcceptanceWorkbench: payload?.providerAcceptanceWorkbench || previous.providerAcceptanceWorkbench,
        providerSandboxContract: payload?.providerSandboxContract || previous.providerSandboxContract,
        providerSandboxReadinessBoard: payload?.providerSandboxReadinessBoard || previous.providerSandboxReadinessBoard,
        providerSandboxRunConsole: payload?.providerSandboxRunConsole || previous.providerSandboxRunConsole,
        providerSandboxSubmitWorkbench: payload?.providerSandboxSubmitWorkbench || previous.providerSandboxSubmitWorkbench,
        commandCenter: payload?.commandCenter || previous.commandCenter,
        gmCommandDeck: payload?.gmCommandDeck || payload?.commandCenter?.gmCommandDeck || previous.gmCommandDeck,
        residentAgentMissionControl: payload?.residentAgentMissionControl || previous.residentAgentMissionControl,
        shiftAutopilot: payload?.shiftAutopilot || previous.shiftAutopilot,
        shiftAutopilotRun: payload?.shiftAutopilotRun || previous.shiftAutopilotRun,
        shiftOperatingLoopPack: payload?.shiftOperatingLoopPack || previous.shiftOperatingLoopPack,
        shiftFirstForwardableRun: payload?.shiftFirstForwardableRun || previous.shiftFirstForwardableRun,
        shiftProviderHandoff: payload?.shiftProviderHandoff || previous.shiftProviderHandoff,
        shiftSandboxAcceptance: payload?.shiftSandboxAcceptance || previous.shiftSandboxAcceptance,
        shiftCloseoutTrainingPack: payload?.shiftCloseoutTrainingPack || previous.shiftCloseoutTrainingPack,
        shiftCapabilityActivationPack: payload?.shiftCapabilityActivationPack || previous.shiftCapabilityActivationPack,
        firstForwardableRunPack: payload?.firstForwardableRunPack || previous.firstForwardableRunPack,
        firstProviderSandboxRunConsole: payload?.firstProviderSandboxRunConsole || previous.firstProviderSandboxRunConsole,
        aiEmployeeMemoryPack: payload?.aiEmployeeMemoryPack || previous.aiEmployeeMemoryPack,
        capabilityTrainingRecords: payload?.trainingRecords || previous.capabilityTrainingRecords,
        postRunReviewPack: payload?.postRunReviewPack || previous.postRunReviewPack,
        channelHub: payload?.channelHub || previous.channelHub,
        channelScheduleRun: payload?.channelScheduleRun || previous.channelScheduleRun,
        channelDeliveryReport: payload?.channelDeliveryReport || previous.channelDeliveryReport,
        nextLoopChannelPlan: payload?.nextLoopChannelPlan || previous.nextLoopChannelPlan,
        publicIntelligenceBrief: payload?.publicIntelligenceBrief || previous.publicIntelligenceBrief,
        reputationCloseoutPack: payload?.reputationCloseoutPack || previous.reputationCloseoutPack,
        runtimeProbe: payload?.runtimeProbe || previous.runtimeProbe,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '第一次试跑路径暂时不可用。' }));
    }
  };

  const checkLobuBridge = async () => {
    setDispatchState({ status: 'loading', message: '正在检查外部试跑通道...' });
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
        message: payload?.bridge?.message || payload?.dispatch?.nextAttachStep || '外部试跑通道未配置。',
        latestRuns: payload?.run ? [payload.run] : undefined,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '外部试跑通道检查失败。' });
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
        message: `心跳巡检已检查 ${payload?.heartbeat?.watchedRuns ?? 0} 条运行记录。`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        heartbeat: payload?.heartbeat,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue,
        storeManagerTaskWatcher: payload?.heartbeat?.storeManagerTaskWatcher,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '心跳巡检暂不可用。' });
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
      setDispatchState({ status: 'failed', message: '授权清单向导暂不可用。' });
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
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成对标训练蓝图……' }));
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
        message: `训练蓝图：本地可训 ${payload?.competitorTrainingBlueprint?.summary?.trainableNow ?? 0} 项，外部数据约定 ${payload?.competitorTrainingBlueprint?.summary?.providerContracts ?? 0} 项，对标宣称${payload?.competitorTrainingBlueprint?.summary?.canClaimCompetitorParity ? '可以' : '暂不可以'}。`,
        competitorTrainingBlueprint: payload?.competitorTrainingBlueprint || previous.competitorTrainingBlueprint,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '对标训练蓝图暂不可用。' }));
    }
  };

  const buildCompetitorRouteDecision = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成路线判断……' }));
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
        message: `路线判断：目标 ${payload?.competitorRouteDecision?.finalTarget || '未知'}，本地能力 ${payload?.competitorRouteDecision?.summary?.internalCanShipNow ?? 0} 项，外部条件 ${payload?.competitorRouteDecision?.summary?.externalRequired ?? 0} 项。`,
        competitorRouteDecision: payload?.competitorRouteDecision || previous.competitorRouteDecision,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '路线判断暂不可用。' }));
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
        message: `构建队列已生成 ${payload?.buildQueue?.summary?.total ?? 0} 项；可构建 ${payload?.buildQueue?.summary?.readyToBuild ?? 0} 项。`,
        buildQueue: payload?.buildQueue,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '构建队列暂不可用。' });
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
    setDispatchState({ status: 'loading', message: '正在本地模拟签名回执……' });
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
        message: `回执模拟：签名${payload?.callbackSimulation?.callback?.signatureVerified ? '校验通过' : '校验失败'}；回执 ${formatRuntimeStatus(payload?.callbackSimulation?.receipt?.status || '缺失')}。`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        callbackSimulation: payload?.callbackSimulation,
        heartbeat: payload?.callbackSimulation?.heartbeat,
        runHealth: payload?.callbackSimulation?.runHealth,
        businessSignals: payload?.callbackSimulation?.businessSignals,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '回执模拟器暂不可用。' });
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
        message: `试跑健康已检查 ${payload?.runHealth?.summary?.totalRuns ?? 0} 条运行记录，等待回执 ${payload?.runHealth?.summary?.waitingReceipt ?? 0} 条。`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        readiness: payload?.readiness,
        runHealth: payload?.runHealth,
        providerReceiptInbox: payload?.providerReceiptInbox,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '试跑健康检查暂不可用。' });
    }
  };

  const inspectProviderReceiptInbox = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成回执收件箱……' }));
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
        message: `回执收件箱：共 ${payload?.providerReceiptInbox?.summary?.total ?? 0} 条请求，需处理 ${payload?.providerReceiptInbox?.summary?.actionRequired ?? 0} 条。`,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        readiness: payload?.readiness || previous.readiness,
        runHealth: payload?.runHealth || previous.runHealth,
        recovery: payload?.recovery || previous.recovery,
        providerReceiptInbox: payload?.providerReceiptInbox || previous.providerReceiptInbox,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '回执收件箱暂不可用。' }));
    }
  };

  const inspectProviderReceiptLifecycle = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成回执生命周期……' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'provider-receipt-lifecycle',
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
        status: payload?.providerReceiptLifecycle?.summary?.canWriteMemory ? 'queued' : 'blocked',
        message: `回执生命周期：${formatRuntimeStatus(payload?.providerReceiptLifecycle?.verdict || '未知')}；已验收 ${payload?.providerReceiptLifecycle?.summary?.acceptedReceipts ?? 0} 条，等待 ${payload?.providerReceiptLifecycle?.summary?.waitingReceipts ?? 0} 条。`,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        runHealth: payload?.runHealth || previous.runHealth,
        businessSignals: payload?.businessSignals || previous.businessSignals,
        providerReceiptInbox: payload?.providerReceiptInbox || previous.providerReceiptInbox,
        providerReceiptLifecycle: payload?.providerReceiptLifecycle || previous.providerReceiptLifecycle,
        postRunReviewPack: payload?.postRunReviewPack || previous.postRunReviewPack,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '回执生命周期暂不可用。' }));
    }
  };

  const inspectProviderKeyGapBoard = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成账号和资料缺口清单...' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'provider-key-gap-board',
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
        status: payload?.providerKeyGapBoard?.summary?.canClaimCompetitorParity ? 'queued' : 'blocked',
        message: `补资料清单：${payload?.providerKeyGapBoard?.summary?.configuredEnvKeys ?? 0}/${payload?.providerKeyGapBoard?.summary?.totalEnvKeys ?? 0} 项账号配置已确认，${payload?.providerKeyGapBoard?.summary?.providerGated ?? 0} 项待补外部资料，${payload?.providerKeyGapBoard?.summary?.dataGated ?? 0} 项待补经营数据。`,
        providerKeyGapBoard: payload?.providerKeyGapBoard || previous.providerKeyGapBoard,
        platformConnectorMatrix: payload?.platformConnectorMatrix || previous.platformConnectorMatrix,
        externalUnlockRequestPack: payload?.externalUnlockRequestPack || previous.externalUnlockRequestPack,
        providerSetupWizard: payload?.providerSetupWizard || previous.providerSetupWizard,
        readiness: payload?.readiness || previous.readiness,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '补资料清单暂时不可用。' }));
    }
  };

  const inspectProviderSandboxContract = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成沙箱验收合同……' }));
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
        message: `沙箱验收合同：通过 ${payload?.providerSandboxContract?.summary?.passed ?? 0}/${payload?.providerSandboxContract?.summary?.checks ?? 0} 项，结论 ${formatRuntimeStatus(payload?.providerSandboxContract?.verdict || '未知')}。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '沙箱验收合同暂不可用。' }));
    }
  };

  const buildProviderSandboxSubmitWorkbench = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成沙箱提交工作台……' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'provider-sandbox-submit-workbench',
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
        status: payload?.providerSandboxSubmitWorkbench?.summary?.readyToSubmit ? 'queued' : 'blocked',
        message: `沙箱提交：可提交 ${payload?.providerSandboxSubmitWorkbench?.summary?.readyToSubmit ?? 0} 项，受阻 ${payload?.providerSandboxSubmitWorkbench?.summary?.blocked ?? 0} 项，等回执 ${payload?.providerSandboxSubmitWorkbench?.summary?.waitingReceipt ?? 0} 项。`,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        providerAcceptanceWorkbench: payload?.providerAcceptanceWorkbench || previous.providerAcceptanceWorkbench,
        providerSandboxContract: payload?.providerSandboxContract || previous.providerSandboxContract,
        providerSandboxSubmitWorkbench: payload?.providerSandboxSubmitWorkbench || previous.providerSandboxSubmitWorkbench,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        providerReceiptInbox: payload?.providerReceiptInbox || previous.providerReceiptInbox,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
        taskProviderHandoff: payload?.taskProviderHandoff || previous.taskProviderHandoff,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '沙箱提交工作台暂不可用。' }));
    }
  };

  const runProviderSandboxSubmitAttempt = async (capabilityId?: string) => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在通过受控通道提交一个沙箱任务包……' }));
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'provider-sandbox-submit-attempt',
          runtimeTarget: 'openclaw',
          capabilityId,
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
        status: payload?.providerSandboxSubmitAttempt?.ok ? 'queued' : 'blocked',
        message: `沙箱提交尝试：${formatRuntimeStatus(payload?.providerSandboxSubmitAttempt?.verdict || 'blocked-before-dispatch')} / ${payload?.providerSandboxSubmitAttempt?.recoveryNextAction || payload?.providerSandboxSubmitAttempt?.bridge?.message || '请检查账号配置'}`,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        runHealth: payload?.runHealth || previous.runHealth,
        recovery: payload?.recovery || previous.recovery,
        providerAcceptanceWorkbench: payload?.providerAcceptanceWorkbench || previous.providerAcceptanceWorkbench,
        providerSandboxContract: payload?.providerSandboxContract || previous.providerSandboxContract,
        providerSandboxSubmitWorkbench: payload?.providerSandboxSubmitWorkbench || previous.providerSandboxSubmitWorkbench,
        providerSandboxSubmitAttempt: payload?.providerSandboxSubmitAttempt || previous.providerSandboxSubmitAttempt,
        providerReceiptLifecycle: payload?.providerReceiptLifecycle || previous.providerReceiptLifecycle,
        postRunReviewPack: payload?.postRunReviewPack || previous.postRunReviewPack,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        providerReceiptInbox: payload?.providerReceiptInbox || previous.providerReceiptInbox,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
        taskProviderHandoff: payload?.taskProviderHandoff || previous.taskProviderHandoff,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '沙箱提交尝试暂不可用。' }));
    }
  };

  const buildFirstForwardableRunPack = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成首轮可转发试跑预检……' }));
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
        message: `首轮可转发试跑：${formatRuntimeStatus(payload?.firstForwardableRunPack?.verdict || '未知')}；通过 ${payload?.firstForwardableRunPack?.summary?.passedStages ?? 0}/${payload?.firstForwardableRunPack?.stages?.length ?? 0} 个阶段。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '首轮可转发试跑预检暂不可用。' }));
    }
  };

  const buildFirstRunControlTower = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成首跑指挥台……' }));
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
        message: `首跑指挥台：${formatRuntimeStatus(payload?.firstRunControlTower?.verdict || '未知')}；受阻链路 ${payload?.firstRunControlTower?.summary?.blockedLanes ?? 0} 条。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '首跑指挥台暂不可用。' }));
    }
  };

  const buildProviderLaunchTrainingPack = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成真实代办启动训练包……' }));
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
        message: `启动训练包：就绪 ${payload?.providerLaunchTrainingPack?.summary?.ready ?? 0}/${payload?.providerLaunchTrainingPack?.summary?.tracks ?? 0} 条，结论 ${formatRuntimeStatus(payload?.providerLaunchTrainingPack?.verdict || '未知')}。`,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        providerSetupPack: payload?.providerSetupPack || previous.providerSetupPack,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        runtimeProbe: payload?.runtimeProbe || previous.runtimeProbe,
        providerSandboxContract: payload?.providerSandboxContract || previous.providerSandboxContract,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        providerLaunchTrainingPack: payload?.providerLaunchTrainingPack || previous.providerLaunchTrainingPack,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '真实代办启动训练包暂不可用。' }));
    }
  };

  const inspectPlatformConnectorMatrix = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成平台连接器清单……' }));
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
        message: `平台连接器：本地可用 ${payload?.platformConnectorMatrix?.summary?.internalReady ?? 0} 个，受阻 ${payload?.platformConnectorMatrix?.summary?.blocked ?? 0} 个，服务端配置已配 ${payload?.platformConnectorMatrix?.summary?.configuredEnvKeys ?? 0}/${payload?.platformConnectorMatrix?.summary?.totalEnvKeys ?? 0} 项。`,
        platformConnectorMatrix: payload?.platformConnectorMatrix || previous.platformConnectorMatrix,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '平台连接器清单暂不可用。' }));
    }
  };

  const inspectAiOsAuditReport = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成经营边界报告……' }));
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
        message: `经营边界报告：现在可用 ${payload?.aiOsAuditReport?.summary?.usableNow ?? 0} 项，人工可做 ${payload?.aiOsAuditReport?.summary?.manualReady ?? 0} 项，待补资料 ${payload?.aiOsAuditReport?.summary?.providerRequired ?? 0} 项。`,
        aiOsAuditReport: payload?.aiOsAuditReport || previous.aiOsAuditReport,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '经营边界报告暂不可用。' }));
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
        message: `试跑通道探测已检查 ${payload?.runtimeProbe?.summary?.probed ?? 0} 个通道，就绪 ${payload?.runtimeProbe?.summary?.ready ?? 0} 个。`,
        runtimeProbe: payload?.runtimeProbe,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '试跑通道探测暂不可用。' });
    }
  };

  const inspectProviderReadinessHealth = async () => {
    setDispatchState({ status: 'loading', message: '正在对照已存配置检查外部条件可用性……' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'provider-readiness-health' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.providerReadinessHealth?.summary?.canEnableExternalAutomation ? 'queued' : 'blocked',
        message: `外部条件检查：就绪 ${payload?.providerReadinessHealth?.summary?.healthReady ?? 0}/${payload?.providerReadinessHealth?.summary?.items ?? 0} 项，已记录未探测 ${payload?.providerReadinessHealth?.summary?.rememberedNotProbed ?? 0} 项。`,
        providerReadinessHealth: payload?.providerReadinessHealth,
        providerSetupState: payload?.providerSetupState,
        providerUnlockLadder: payload?.providerUnlockLadder,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '外部条件可用性检查暂不可用。' });
    }
  };

  const inspectRuntimeSetupContract = async () => {
    setDispatchState({ status: 'loading', message: '正在生成试跑通道配置清单……' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'runtime-setup-contract' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.runtimeSetupContract?.summary?.missingRequirements ? 'blocked' : 'queued',
        message: `试跑通道配置已检查 ${payload?.runtimeSetupContract?.summary?.tracks ?? 0} 条链路，缺 ${payload?.runtimeSetupContract?.summary?.missingRequirements ?? 0} 个条件。`,
        runtimeSetupContract: payload?.runtimeSetupContract,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '试跑通道配置清单暂不可用。' });
    }
  };

  const inspectRuntimeAdapterContract = async () => {
    setDispatchState({ status: 'loading', message: '正在生成外部试跑通道验收清单...' });
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
        message: `外部试跑通道验收：${payload?.runtimeAdapterContract?.verdict || 'unknown'}；已满足 ${payload?.runtimeAdapterContract?.summary?.ready ?? 0}/${payload?.runtimeAdapterContract?.summary?.checks ?? 0} 项。`,
        runtimeAdapterContract: payload?.runtimeAdapterContract || previous.runtimeAdapterContract,
        executionPackage: payload?.executionPackage || previous.executionPackage,
        runtimeProbe: payload?.runtimeProbe || previous.runtimeProbe,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '外部试跑通道验收清单暂时不可用。' }));
    }
  };

  const inspectRuntimeRunnerLoopPack = async () => {
    setDispatchState({ status: 'loading', message: '正在生成试跑跟进闭环...' });
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
        message: `试跑跟进闭环：${payload?.runtimeRunnerLoopPack?.verdict || 'unknown'}；试跑事件 ${payload?.runtimeRunnerLoopPack?.summary?.runnerEvents ?? 0} 个，等待回执 ${payload?.runtimeRunnerLoopPack?.summary?.waitingReceipts ?? 0} 个。`,
        runtimeRunnerLoopPack: payload?.runtimeRunnerLoopPack || previous.runtimeRunnerLoopPack,
        receipts: payload?.receipts || previous.receipts,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '试跑跟进闭环暂时不可用。' }));
    }
  };

  const buildProviderSetupPack = async () => {
    setDispatchState({ status: 'loading', message: '正在生成这家门店的补资料包...' });
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
        message: `补资料包已生成：${payload?.providerSetupPack?.summary?.missing ?? 0} 项条件待补，${payload?.providerSetupPack?.summary?.blockedCapabilities ?? 0} 项能力暂不能代办。`,
        providerSetupPack: payload?.providerSetupPack,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '补资料包暂时不可用。' });
    }
  };

  const buildExternalUnlockRequestPack = async () => {
    setDispatchState({ status: 'loading', message: '正在整理账号确认、门店授权和经营表格的补资料清单...' });
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
        message: `代办解锁清单已生成：${payload?.externalUnlockRequestPack?.summary?.p0 ?? 0} 个优先项，${payload?.externalUnlockRequestPack?.summary?.providerKeys ?? 0} 项账号配置，${payload?.externalUnlockRequestPack?.summary?.merchantAuthorizations ?? 0} 项门店授权。`,
        externalUnlockRequestPack: payload?.externalUnlockRequestPack || previous.externalUnlockRequestPack,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '代办解锁清单暂时不可用。' }));
    }
  };

  const buildProviderSetupWizard = async () => {
    setDispatchState({ status: 'loading', message: '正在生成给店长看的账号和资料补齐向导...' });
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
        message: `账号和资料补齐向导已生成：${payload?.providerSetupWizard?.summary?.configured ?? 0}/${payload?.providerSetupWizard?.summary?.fields ?? 0} 项已配置；真实代办 ${payload?.providerSetupWizard?.summary?.canEnableExternalAutomation ? '可解锁' : '仍待补资料'}。`,
        providerSetupWizard: payload?.providerSetupWizard,
        providerSetupState: payload?.providerSetupState,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '账号和资料补齐向导暂时不可用。' });
    }
  };

  const recordProviderSetupState = async () => {
    setDispatchState({ status: 'loading', message: '正在把脱敏配置状态存入门店配置台账……' });
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
        message: `补资料状态已保存：${payload?.providerSetupState?.summary?.configuredEnvKeys ?? 0} 项账号配置，${payload?.providerSetupState?.summary?.merchantApprovals ?? 0} 项门店授权，${payload?.providerSetupState?.summary?.dataContracts ?? 0} 项经营数据规则已记录。`,
        providerSetupState: payload?.providerSetupState,
        providerSetupWizard: payload?.providerSetupWizard,
        providerReadinessHealth: payload?.providerReadinessHealth,
        providerUnlockLadder: payload?.providerUnlockLadder,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '补资料状态暂时无法保存。' });
    }
  };

  const buildExternalExecutionWizard = async () => {
    setDispatchState({ status: 'loading', message: '正在生成外部执行向导……' });
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
        message: `外部执行向导：${formatRuntimeStatus(payload?.externalExecutionWizard?.verdict || '未知')}；受阻 ${payload?.externalExecutionWizard?.summary?.blockedSteps ?? 0} 步。`,
        externalExecutionWizard: payload?.externalExecutionWizard,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '外部执行向导暂不可用。' });
    }
  };

  const runControlledTrialRun = async () => {
    setDispatchState({ status: 'loading', message: '正在跑带签名回执的本地受控试跑……' });
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
        message: `受控试跑 ${formatRuntimeStatus(payload?.controlledTrialRun?.verdict || '未知')}；回执 ${formatRuntimeStatus(payload?.controlledTrialRun?.simulation?.receipt?.status || '缺失')}。`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        controlledTrialRun: payload?.controlledTrialRun,
        runHealth: payload?.controlledTrialRun?.runHealth,
        businessSignals: payload?.controlledTrialRun?.businessSignals,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '受控试跑暂不可用。' });
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
    setDispatchState(previous => ({ ...previous, status: 'loading', message: `正在把店长任务状态更新为 ${taskStatus}……` }));
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '店长任务状态更新暂不可用。' }));
    }
  };

  const buildStaffNotificationHandoff = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成员工通知交接……' }));
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '员工通知交接暂不可用。' }));
    }
  };

  const buildStaffNotificationDeliveryBridge = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成员工通知投递通道……' }));
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '员工通知投递通道暂不可用。' }));
    }
  };

  const buildTaskProviderHandoff = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成任务外部交接包……' }));
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '任务外部交接包暂不可用。' }));
    }
  };

  const forwardTaskProviderHandoff = async () => {
    const selected = commandTaskProviderHandoff?.packages[0] || commandTaskProviderHandoff?.blockedPackages[0];
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在把任务交接包转发到试跑通道……' }));
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '任务交接转发暂不可用。' }));
    }
  };

  const importPosRedemptionSample = async () => {
    setDispatchState({ status: 'loading', message: '正在校验脱敏 POS 核销数据……' });
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
        message: `POS 导入${formatRuntimeStatus(payload?.posImport?.status || '失败')}：有效行 ${payload?.posImport?.summary?.validRows ?? 0} 条，核销 ${payload?.posImport?.summary?.redemptionCount ?? 0} 条。不保存原始行。`,
        posImport: payload?.posImport,
        receipts: payload?.receipts,
        businessSignals: payload?.businessSignals,
        heartbeat: payload?.heartbeat,
      });
    } catch {
      setDispatchState({ status: 'failed', message: 'POS 核销导入校验暂不可用。' });
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
        message: `能力库已加载：${payload?.clawSkillCatalog?.summary?.modules ?? 0} 模块、${payload?.clawSkillCatalog?.summary?.skills ?? 0} 技能、${payload?.clawSkillCatalog?.summary?.tools ?? 0} 工具。`,
        clawSkillCatalog: payload?.clawSkillCatalog,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '能力库暂不可用。' });
    }
  };

  const buildClawSkillWorkbench = async () => {
    setDispatchState({ status: 'loading', message: '正在为这家门店生成可执行能力工单台……' });
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
      setDispatchState({ status: 'failed', message: '能力工单台暂不可用。' });
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
    setDispatchState({ status: 'loading', message: '正在生成能力总览：本地能力、训练缺口和待补资料……' });
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
        message: `能力总览已生成：${payload?.activationCockpit?.summary?.usableNow ?? 0} 项今天可试跑，${payload?.activationCockpit?.summary?.providerGated ?? 0} 项待补资料，${payload?.activationCockpit?.summary?.providerKeysNeeded ?? 0} 项账号配置待确认。`,
        activationCockpit: payload?.activationCockpit,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '能力总览暂时不可用。' });
    }
  };

  const buildChannelHub = async () => {
    setDispatchState({ status: 'loading', message: '正在整理员工通道和每日排班任务...' });
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
        message: `员工通道清单已生成：${payload?.channelHub?.summary?.channels ?? 0} 个通道、${payload?.channelHub?.summary?.scheduledJobs ?? 0} 个排程任务、${payload?.channelHub?.summary?.missingExternalItems ?? 0} 个外部缺口。`,
        channelHub: payload?.channelHub,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '员工通道清单暂不可用。' });
    }
  };

  const attemptChannelDelivery = async () => {
    setDispatchState({ status: 'loading', message: '正在受控边界内尝试只发员工的通道送达……' });
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
        message: `员工通道送达尝试：${formatRuntimeStatus(payload?.channelDeliveryAttempt?.status || '未知')}；台账总数 ${payload?.channelDeliveryReport?.summary?.total ?? 0}。`,
        channelDeliveryAttempt: payload?.channelDeliveryAttempt,
        channelDeliveryReport: payload?.channelDeliveryReport,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '员工通道送达尝试暂不可用。' });
    }
  };

  const runChannelSchedule = async () => {
    setDispatchState({ status: 'loading', message: '正在运行到期的员工通道排程……' });
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
        message: `通道排程运行：尝试 ${payload?.channelScheduleRun?.summary?.attempted ?? 0} 次，受阻 ${payload?.channelScheduleRun?.summary?.blocked ?? 0} 次，建议重试/恢复 ${payload?.channelScheduleRun?.summary?.retryRecommended ?? 0} 次。`,
        channelScheduleRun: payload?.channelScheduleRun,
        channelDeliveryReport: payload?.channelDeliveryReport,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '通道排程运行暂不可用。' });
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
        message: `能力训练批次已生成：${payload?.clawTrainingBatch?.summary?.internalTrainingTasks ?? 0} 个内部训练任务，${payload?.clawTrainingBatch?.summary?.providerUnlockTasks ?? 0} 个外部解锁任务。`,
        clawTrainingBatch: payload?.clawTrainingBatch,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '能力训练批次暂不可用。' });
    }
  };

  const inspectPlatformOperatingSpine = async () => {
    setDispatchState({ status: 'loading', message: '正在生成门店经营主干……' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'platform-operating-spine' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.platformOperatingSpine?.summary?.blockedExternalGroups ? 'blocked' : 'queued',
        message: `经营主干已生成：${payload?.platformOperatingSpine?.summary?.runs ?? 0} 次运行，${payload?.platformOperatingSpine?.summary?.acceptedReceipts ?? 0} 条已验收回执，${payload?.platformOperatingSpine?.summary?.blockedExternalGroups ?? 0} 组外部条件待补。`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        readiness: payload?.readiness,
        platformOperatingSpine: payload?.platformOperatingSpine,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '经营主干暂不可用。' });
    }
  };

  const inspectOperatingDataContract = async () => {
    setDispatchState({ status: 'loading', message: '正在生成经营数据规则……' });
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
        message: `经营数据规则已生成：${payload?.operatingDataContract?.summary?.tracks ?? 0} 条数据路径，${payload?.operatingDataContract?.summary?.manualImportReady ?? 0} 条可手工导入，${payload?.operatingDataContract?.summary?.providerGated ?? 0} 条待补资料。`,
        receipts: payload?.receipts,
        posImport: payload?.posImport,
        operatingDataContract: payload?.operatingDataContract,
        storeDataImportCenter: payload?.storeDataImportCenter,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '经营数据规则暂时不可用。' });
    }
  };

  const inspectOperatingInsightReport = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在用脱敏汇总数据生成经营复盘...' }));
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
        message: `经营复盘已生成：${payload?.operatingInsightReport?.summary?.measured ?? 0} 项可量化，${payload?.operatingInsightReport?.summary?.directional ?? 0} 项可作方向判断，${payload?.operatingInsightReport?.summary?.blocked ?? 0} 项因缺资料暂停。`,
        receipts: payload?.receipts || previous.receipts,
        posImport: payload?.posImport || previous.posImport,
        businessSignals: payload?.businessSignals || previous.businessSignals,
        operatingDataContract: payload?.operatingDataContract || previous.operatingDataContract,
        operatingInsightReport: payload?.operatingInsightReport || previous.operatingInsightReport,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '经营复盘暂时不可用。' }));
    }
  };

  const buildPostRunReviewPack = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成试跑复盘和下一轮门店动作...' }));
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
        message: `试跑复盘：${payload?.postRunReviewPack?.verdict || 'unknown'}；${payload?.postRunReviewPack?.summary?.storeTasks ?? 0} 个门店任务，${payload?.postRunReviewPack?.summary?.blockedInsights ?? 0} 个结论待补资料。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '试跑复盘暂时不可用。' }));
    }
  };

  const buildNextLoopChannelPlan = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在根据凭证、员工通道和经营边界生成下一轮计划...' }));
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
        message: `下一轮计划：${payload?.nextLoopChannelPlan?.verdict || 'unknown'}；${payload?.nextLoopChannelPlan?.summary?.scheduledActions ?? 0} 个动作已安排，${payload?.nextLoopChannelPlan?.summary?.providerGatedActions ?? 0} 个动作待补资料。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '下一轮渠道计划暂不可用。' }));
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
      setDispatchState({ status: 'failed', message: '能力训练样本写入暂不可用。' });
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
    setDispatchState({ status: 'loading', message: '正在生成受控浏览器执行手册包……' });
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
      setDispatchState({ status: 'failed', message: '浏览器执行手册包暂不可用。' });
    }
  };

  const buildBrowserRunnerContract = async () => {
    setDispatchState({ status: 'loading', message: '正在生成浏览器执行回执约定……' });
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
      setDispatchState({ status: 'failed', message: '浏览器执行回执约定暂不可用。' });
    }
  };

  const buildBrowserGatewayPack = async () => {
    setDispatchState({ status: 'loading', message: '正在生成浏览器网关包……' });
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
        message: `浏览器网关包 ${payload?.browserGatewayPack?.payloadShape || '缺失'}；允许动作 ${payload?.browserGatewayPack?.browserRequest?.acceptedActions?.length ?? 0} 个。`,
        browserGatewayPack: payload?.browserGatewayPack || previous.browserGatewayPack,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '浏览器网关包暂不可用。' }));
    }
  };

  const recordBrowserRunnerEvent = async () => {
    setDispatchState({ status: 'loading', message: '正在记录脱敏浏览器执行事件……' });
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
        message: `执行事件 ${formatRuntimeStatus(payload?.runnerEvent?.status || '缺失')}；进行中 ${payload?.runnerEventHealth?.summary?.activeRuns ?? 0} 个，停滞 ${payload?.runnerEventHealth?.summary?.staleRuns ?? 0} 个。`,
        runnerEvent: payload?.runnerEvent,
        runnerEventHealth: payload?.runnerEventHealth,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '浏览器执行事件台账暂不可用。' });
    }
  };

  const inspectBrowserRunnerEventHealth = async () => {
    setDispatchState({ status: 'loading', message: '正在检查浏览器执行事件健康……' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'browser-runner-event-health' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.runnerEventHealth?.summary?.rejected || payload?.runnerEventHealth?.summary?.staleRuns ? 'blocked' : 'queued',
        message: `执行事件健康已检查 ${payload?.runnerEventHealth?.summary?.totalEvents ?? 0} 条；进行中 ${payload?.runnerEventHealth?.summary?.activeRuns ?? 0} 个，已完成 ${payload?.runnerEventHealth?.summary?.completedRuns ?? 0} 个。`,
        runnerEventHealth: payload?.runnerEventHealth,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '浏览器执行事件健康检查暂不可用。' });
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
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成公开资料采集包……' }));
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
        message: `公开资料采集包：${payload?.publicSourceHarvestPack?.summary?.internalTargets ?? 0}/${payload?.publicSourceHarvestPack?.summary?.targets ?? 0} 个目标可本地执行。`,
        publicProfile: payload?.publicProfile || previous.publicProfile,
        publicIntelligenceBrief: payload?.publicIntelligenceBrief || previous.publicIntelligenceBrief,
        publicSourceHarvestPack: payload?.publicSourceHarvestPack || previous.publicSourceHarvestPack,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '公开资料采集包暂不可用。' }));
    }
  };

  const buildPublicTrialSeed = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在用公开门店资料生成受控试跑种子……' }));
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
        message: `公开试跑种子：可用字段 ${payload?.publicTrialSeed?.summary?.usableFields ?? 0} 个，可做步骤 ${payload?.publicTrialSeed?.summary?.workflowReadySteps ?? 0} 步，待补外部条件 ${payload?.publicTrialSeed?.summary?.workflowExternalGatedSteps ?? 0} 步。`,
        publicTrialSeed: payload?.publicTrialSeed || previous.publicTrialSeed,
        publicProfile: payload?.publicTrialSeed?.publicProfile || previous.publicProfile,
        publicIntelligenceBrief: payload?.publicTrialSeed?.publicIntelligenceBrief || previous.publicIntelligenceBrief,
        publicSourceHarvestPack: payload?.publicTrialSeed?.publicSourceHarvestPack || previous.publicSourceHarvestPack,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '公开试跑种子暂不可用。' }));
    }
  };

  const buildDayZeroMissionPack = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在用试跑种子生成第一天老板任务……' }));
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
        message: `第一天任务包：本地可做 ${payload?.dayZeroMissionPack?.summary?.readyInternal ?? 0} 项，需店长凭证 ${payload?.dayZeroMissionPack?.summary?.needsMerchantEvidence ?? 0} 项，待补外部条件 ${payload?.dayZeroMissionPack?.summary?.externalGated ?? 0} 项。`,
        dayZeroMissionPack: payload?.dayZeroMissionPack || previous.dayZeroMissionPack,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
        storeManagerTaskWatcher: payload?.storeManagerTaskWatcher || previous.storeManagerTaskWatcher,
        staffNotificationHandoff: payload?.staffNotificationHandoff || previous.staffNotificationHandoff,
        staffNotificationDeliveryBridge: payload?.staffNotificationDeliveryBridge || previous.staffNotificationDeliveryBridge,
        taskProviderHandoff: payload?.taskProviderHandoff || previous.taskProviderHandoff,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '第一天任务包暂不可用。' }));
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
        message: `运营汇总台已聚合 ${payload?.opsConsole?.summary?.runs ?? 0} 次运行、${payload?.opsConsole?.summary?.acceptedReceipts ?? 0} 条验收回执、${payload?.opsConsole?.summary?.watcherWakeups ?? 0} 次巡检唤醒。`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        opsConsole: payload?.opsConsole,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '运营汇总台暂不可用。' });
    }
  };

  const inspectExecutionTimeline = async () => {
    setDispatchState({ status: 'loading', message: '正在生成执行时间线……' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execution-timeline' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.executionTimeline?.summary?.blockedRuns ? 'blocked' : 'queued',
        message: `执行时间线 ${payload?.executionTimeline?.mode || '未知'}：${payload?.executionTimeline?.summary?.runs ?? 0} 次运行，${payload?.executionTimeline?.summary?.watcherWakeups ?? 0} 次巡检唤醒。`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        executionTimeline: payload?.executionTimeline,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '执行时间线暂不可用。' });
    }
  };

  const refreshCommandCenter = async () => {
    setDispatchState({ status: 'loading', message: '正在刷新指挥中心……' });
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
        message: `指挥中心 ${payload?.commandCenter?.mode || '未知'}：${payload?.commandCenter?.summary?.runs ?? 0} 次运行，${payload?.commandCenter?.summary?.acceptedReceipts ?? 0} 条已验收回执，${payload?.commandCenter?.summary?.providerGates ?? 0} 个待补资料。`,
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
      setDispatchState({ status: 'failed', message: '指挥中心暂不可用。' });
    }
  };

  const refreshResidentAgentMissionControl = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在刷新常驻任务板……' }));
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
        message: `常驻任务板 ${payload?.residentAgentMissionControl?.mode || '未知'}：${payload?.residentAgentMissionControl?.summary?.readyLanes ?? 0}/${payload?.residentAgentMissionControl?.summary?.lanes ?? 0} 条链路可用，${payload?.residentAgentMissionControl?.summary?.externalGates ?? 0} 个外部条件。`,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        residentAgentMissionControl: payload?.residentAgentMissionControl || previous.residentAgentMissionControl,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '常驻任务板暂不可用。' }));
    }
  };

  const runShiftAutopilot = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在跑班次自动巡航的本地链路……' }));
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
        message: `班次自动巡航：本地完成 ${payload?.shiftAutopilotRun?.summary?.acceptedInternalActions ?? 0} 项，店长任务 ${payload?.shiftAutopilotRun?.summary?.createdStoreManagerTasks ?? 0} 项，待补资料挂起 ${payload?.shiftAutopilotRun?.summary?.providerHeldActions ?? 0} 项。`,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        commandCenter: payload?.commandCenter || previous.commandCenter,
        shiftAutopilot: payload?.shiftAutopilot || previous.shiftAutopilot,
        shiftAutopilotRun: payload?.shiftAutopilotRun || previous.shiftAutopilotRun,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
        storeManagerTaskWatcher: payload?.storeManagerTaskWatcher || previous.storeManagerTaskWatcher,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '班次自动巡航暂不可用。' }));
    }
  };

  const buildShiftProviderHandoff = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在从班次记录生成代办交接……' }));
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
        message: `班次代办交接：${payload?.shiftProviderHandoff?.summary?.requests ?? 0} 项请求，P0 ${payload?.shiftProviderHandoff?.summary?.p0 ?? 0} 项，沙箱就绪 ${payload?.shiftProviderHandoff?.summary?.readyToSandbox ?? 0} 项。`,
        shiftProviderHandoff: payload?.shiftProviderHandoff || previous.shiftProviderHandoff,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '班次代办交接暂不可用。' }));
    }
  };

  const buildShiftSandboxAcceptance = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成班次沙箱验收……' }));
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
        message: `班次沙箱验收：通过 ${payload?.shiftSandboxAcceptance?.summary?.passed ?? 0}/${payload?.shiftSandboxAcceptance?.summary?.stages ?? 0} 个阶段，结论 ${formatRuntimeStatus(payload?.shiftSandboxAcceptance?.verdict || '未知')}。`,
        shiftSandboxAcceptance: payload?.shiftSandboxAcceptance || previous.shiftSandboxAcceptance,
        shiftProviderHandoff: payload?.shiftProviderHandoff || previous.shiftProviderHandoff,
        providerSandboxContract: payload?.providerSandboxContract || previous.providerSandboxContract,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '班次沙箱验收暂不可用。' }));
    }
  };

  const buildShiftFirstForwardableRun = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成班次首轮可转发试跑……' }));
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
        message: `班次首轮可转发试跑：${formatRuntimeStatus(payload?.shiftFirstForwardableRun?.verdict || '未知')}；受阻 ${payload?.shiftFirstForwardableRun?.summary?.blockedStages ?? 0} 个，等待外部 ${payload?.shiftFirstForwardableRun?.summary?.waitingExternalStages ?? 0} 个。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '班次首轮可转发试跑暂不可用。' }));
    }
  };

  const forwardShiftSandboxRun = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在提交受控班次沙箱试跑……' }));
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
        message: `班次沙箱转发：${formatRuntimeStatus(payload?.shiftSandboxForwardAttempt?.verdict || '未知')}；通道状态 ${formatRuntimeStatus(payload?.shiftSandboxForwardAttempt?.summary?.bridgeStatus || '未知')}。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '班次沙箱转发暂不可用。' }));
    }
  };

  const buildShiftCloseoutTrainingPack = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成班次收尾训练包……' }));
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
        message: `班次收尾训练：${formatRuntimeStatus(payload?.shiftCloseoutTrainingPack?.verdict || '未知')}；草稿 ${payload?.shiftCloseoutTrainingPack?.summary?.trainingDrafts ?? 0} 份，恢复动作 ${payload?.shiftCloseoutTrainingPack?.summary?.recoveryActions ?? 0} 项。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '班次收尾训练包暂不可用。' }));
    }
  };

  const recordShiftCloseoutTraining = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在记录已验收的班次收尾训练……' }));
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
        message: `班次收尾训练记录：${formatRuntimeStatus(payload?.shiftCloseoutTrainingRecordAttempt?.verdict || '未知')}；已记录 ${payload?.shiftCloseoutTrainingRecordAttempt?.summary?.recorded ?? 0} 条，已拒绝 ${payload?.shiftCloseoutTrainingRecordAttempt?.summary?.rejected ?? 0} 条。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '班次收尾训练记录暂不可用。' }));
    }
  };

  const buildShiftCapabilityActivationPack = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成能力激活包...' }));
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
        message: `能力激活：${payload?.shiftCapabilityActivationPack?.verdict || 'unknown'}；${payload?.shiftCapabilityActivationPack?.summary?.activatedInternal ?? 0} 项已激活，${payload?.shiftCapabilityActivationPack?.summary?.trainedNeedsProvider ?? 0} 项待补资料。`,
        shiftCapabilityActivationPack: payload?.shiftCapabilityActivationPack || previous.shiftCapabilityActivationPack,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        capabilityTrainingRecords: payload?.trainingRecords || previous.capabilityTrainingRecords,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        runtimeProbe: payload?.runtimeProbe || previous.runtimeProbe,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '能力激活包暂时不可用。' }));
    }
  };

  const buildShiftOperatingLoopPack = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成单路径班次经营闭环……' }));
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
        message: `班次经营闭环：${formatRuntimeStatus(payload?.shiftOperatingLoopPack?.verdict || '未知')}；下一步 ${payload?.shiftOperatingLoopPack?.nextBestAction?.label || '暂无'}。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '班次经营闭环暂不可用。' }));
    }
  };

  const routeRestaurantCommand = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在把门店指令拆成受控员工动作……' }));
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
        message: `指令路由：${payload?.commandRoute?.intent || '未知'} -> ${payload?.commandRoute?.primaryAction?.clientAction || '人工'}；${formatRuntimeStatus(payload?.commandRoute?.verdict || '未知')}。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '门店指令路由暂不可用。' }));
    }
  };

  const runRoutedCommandAction = async () => {
    const clientAction = dispatchState.commandRoute?.primaryAction.clientAction;
    if (!clientAction || clientAction === 'manual-sanitize') {
      setDispatchState(previous => ({
        ...previous,
        status: 'blocked',
        message: '该指令包含隐私、密钥、原始 POS 行或顾客触达内容，改写后才能执行。',
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
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成门店记忆包……' }));
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
        message: `门店记忆包：记忆卡 ${payload?.aiEmployeeMemoryPack?.summary?.memoryCards ?? 0} 张，唤醒 ${payload?.aiEmployeeMemoryPack?.summary?.nextWakeups ?? 0} 次，外部条件 ${payload?.aiEmployeeMemoryPack?.summary?.externalRequired ?? 0} 个。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '门店记忆包暂不可用。' }));
    }
  };

  const buildCustomerDemandGateway = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成顾客需求入口……' }));
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
        message: `顾客需求入口：${payload?.customerDemandGateway?.summary?.channels ?? 0} 个渠道，本地可用 ${payload?.customerDemandGateway?.summary?.internalReady ?? 0} 个，外部条件 ${payload?.customerDemandGateway?.externalRequired?.length ?? 0} 个。`,
        customerDemandGateway: payload?.customerDemandGateway || previous.customerDemandGateway,
        commandRoute: payload?.commandRoute || previous.commandRoute,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '顾客需求入口暂不可用。' }));
    }
  };

  const buildVoiceOrderConsole = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成语音点单台……' }));
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
        message: `语音点单台：意图 ${payload?.voiceOrderConsole?.summary?.intents ?? 0} 个，订单草稿 ${payload?.voiceOrderConsole?.summary?.orderDrafts ?? 0} 份，外部条件 ${payload?.voiceOrderConsole?.externalRequired?.length ?? 0} 个。`,
        voiceOrderConsole: payload?.voiceOrderConsole || previous.voiceOrderConsole,
        customerDemandGateway: payload?.customerDemandGateway || previous.customerDemandGateway,
        commandRoute: payload?.commandRoute || previous.commandRoute,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '语音点单台暂不可用。' }));
    }
  };

  const buildProviderLaunchBoard = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成真实代办启动板……' }));
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
        message: `真实代办启动板：能力 ${payload?.providerLaunchBoard?.summary?.capabilities ?? 0} 项，沙箱就绪 ${payload?.providerLaunchBoard?.summary?.readyToSandbox ?? 0} 项，缺账号资料 ${payload?.providerLaunchBoard?.summary?.missingProvider ?? 0} 项。`,
        providerLaunchBoard: payload?.providerLaunchBoard || previous.providerLaunchBoard,
        customerDemandGateway: payload?.customerDemandGateway || previous.customerDemandGateway,
        voiceOrderConsole: payload?.voiceOrderConsole || previous.voiceOrderConsole,
        commandRoute: payload?.commandRoute || previous.commandRoute,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '真实代办启动板暂不可用。' }));
    }
  };

  const buildMerchantActivationPacket = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成商户激活包……' }));
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
        message: `商户激活包：${formatRuntimeStatus(payload?.merchantActivationPacket?.verdict || '未知')}；需要账号配置 ${payload?.merchantActivationPacket?.summary?.providerKeys ?? 0} 项、店长确认 ${payload?.merchantActivationPacket?.summary?.merchantApprovals ?? 0} 项、数据约定 ${payload?.merchantActivationPacket?.summary?.dataContracts ?? 0} 项。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '商户激活包暂不可用。' }));
    }
  };

  const buildAiConsultantCopilot = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成经营顾问建议……' }));
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
        message: `经营建议已生成：${payload?.aiConsultantCopilot?.mode || 'unknown'} 模式，${payload?.aiConsultantCopilot?.summary?.actionPlays ?? 0} 个建议动作，${payload?.aiConsultantCopilot?.summary?.providerGated ?? 0} 个待补资料。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '经营建议暂时不可用。' }));
    }
  };

  const buildStoreOperatingPlan = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成今日门店经营计划...' }));
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
        message: `今日门店经营计划：${payload?.storeOperatingPlan?.summary?.timeBlocks ?? 0} 个时段，${payload?.storeOperatingPlan?.summary?.readyInternal ?? 0} 个本地可做，${payload?.storeOperatingPlan?.summary?.providerGated ?? 0} 个待补资料。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '今日门店经营计划暂时不可用。' }));
    }
  };

  const buildAiCockpit = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在整理今日门店工单...' }));
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
        message: `今日门店工单：${payload?.aiCockpit?.summary?.zones ?? 0} 个区域，${payload?.aiCockpit?.summary?.readyInternal ?? 0} 个本地可做，${payload?.aiCockpit?.summary?.providerGated ?? 0} 个待补资料。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '今日门店工单暂时不可用。' }));
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
    '本地试跑会先产出签名回执；真实外部执行需要账号确认和经营数据约定。';

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
  const commandProviderReceiptLifecycle = dispatchState.providerReceiptLifecycle;
  const commandProviderKeyGapBoard = dispatchState.providerKeyGapBoard;
  const commandProviderSandboxContract = dispatchState.providerSandboxContract;
  const commandProviderSandboxSubmitWorkbench = dispatchState.providerSandboxSubmitWorkbench;
  const commandProviderSandboxSubmitAttempt = dispatchState.providerSandboxSubmitAttempt;
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
      answerForOwner: '先用本地门店任务闭环；账号配置和门店授权补齐后，再解锁真实代办。',
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
          title: '开班指令',
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
      aiAutopilotQueue: ['开班指令: Build the morning brief, task owners and stop line.'],
      staffQueue: ['Demand and lead capture: accepted proof or imported lead aggregate', 'Service window watch: coupon rule screenshot and staff acknowledgement'],
      providerQueue: ['Publish and proof: merchant platform authorization and callback secret'],
      evidenceQueue: ['Closeout and next loop: sanitized POS/coupon/member aggregate'],
      safetyBoundary: '店总指挥台 preview does not log in, publish, scrape private messages, redeem coupons, write POS orders, expose secrets or claim growth without accepted proof.',
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
      nextWakeups: ['开班指令: 09:30 local', 'Runtime and inbox heartbeat: every 60 minutes', 'Closeout and next loop: 22:30 local'],
      providerQueue: commandGmCommandDeck.providerQueue,
      evidenceQueue: commandGmCommandDeck.evidenceQueue,
      operatingPolicy: [
        '没有账号配置时，先跑本地计划、员工审核和凭证准备。',
        '没有已验收回执前，不承诺真实代办已经完成。',
      ],
      safetyBoundary: '班次自动巡航 preview builds a bounded shift plan only; it does not run forever, publish, contact customers, redeem coupons, write POS orders or expose secrets.',
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
      title: '今日门店运营',
      status: 'ready-internal',
      answer: '把今天的门店目标、主推套餐、服务窗口、负责人和可验收证据排成一张试跑工单。',
      primaryAction: '先生成受控试跑，再看执行时间线。',
      visibleProof: ['门店资料', '主推套餐', '服务窗口'],
      providerGate: '本地规划，无需外部条件',
    },
    {
      id: 'ai-consultant',
      title: 'AI 经营顾问',
      status: 'needs-evidence',
      answer: '把店长问题转成菜品卖点、到店理由、内容动作和运营建议，但每条建议都带负责人和证据要求。',
      primaryAction: '补齐菜单、活动、渠道和约束后生成顾问方案。',
      visibleProof: ['菜单截图', '活动口径', '渠道限制'],
      providerGate: '外部数据需要回执凭证',
    },
    {
      id: 'automation-launch',
      title: '真实代办启动',
      status: 'provider-gated',
      answer: '外部发布执行、线索承接、核销和真实经营分析需要商户授权、平台回调、浏览器会话或 POS/券码数据合同。',
      primaryAction: '先跑补资料包，拿到账号配置、店长授权、回执和停止线。',
      visibleProof: ['外部条件检查', '店长授权', '签名回执'],
      providerGate: '账号配置 / 店长授权 / 浏览器会话 / 签名回执',
    },
    {
      id: 'evidence-review',
      title: '凭证复核',
      status: 'needs-evidence',
      answer: '所有结果只看公开链接、截图回执、签名回调或脱敏经营聚合，不展示私信、手机号、券码或原始 POS 行。',
      primaryAction: '导入回执或脱敏汇总后，生成下一轮门店动作。',
      visibleProof: ['发布链接', '截图回执', '脱敏 POS 汇总'],
      providerGate: '脱敏汇总字段表',
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
      title: '常驻浏览器代办',
      internal: '能生成隔离浏览器任务清单、执行手册、回执约定和失败恢复队列。',
      external: '需要真实浏览器 profile、商户授权 grant、平台登录态和停止条件。',
      status: 'provider-gated',
    },
    {
      title: '代发布',
      internal: '能生成大众点评/小红书/抖音/微信社群发布包、验收清单和截图回执要求。',
      external: '需要平台账号确认、开放接口或受控执行回执。',
      status: 'provider-gated',
    },
    {
      title: '代接线索',
      internal: '能把预约、领券、私信咨询、到店意向整理成店长任务和社群跟进话术。',
      external: '需要私域/社群/平台消息回调；未授权时不读取私信和手机号。',
      status: 'provider-gated',
    },
    {
      title: '券码核销',
      internal: '能校验脱敏券码/核销/POS 聚合字段，生成核销异常和复盘动作。',
      external: '需要团购券、POS、会员或收银系统数据合同，不能写回生产系统。',
      status: 'provider-gated',
    },
    {
      title: '经营分析',
      internal: '能基于公开回执、手工导入和脱敏汇总做经营信号、备货和下一轮计划。',
      external: '需要真实订单、库存、毛利、核销、会员复购的脱敏聚合导入。',
      status: 'ready-internal',
    },
    {
      title: '门店记忆跟进',
      internal: '能沉淀门店偏好、负责人、证据、失败原因和下一次执行计划。',
      external: '需要员工通知通道、日程权限或企业微信/飞书/短信 Provider。',
      status: 'ready-internal',
    },
  ];
  const residentEmployeeLoop = [
    {
      title: '早班简报',
      status: commandTaskWatcher?.summary.blocked ? 'needs-owner' : 'ready-internal',
      owner: '店长 / 运营',
      action: '开店前检查昨日回执、阻断任务、Provider 缺口和今日主推套餐。',
      proof: commandTaskWatcher
        ? `${commandTaskWatcher.summary.blocked} blocked / ${commandTaskWatcher.summary.wakeups} wakeups`
        : '等待生成任务队列或运行 Heartbeat',
    },
    {
      title: '服务时段巡视',
      status: dispatchState.heartbeat?.watcherPolicy?.summary.highPriority ? 'needs-owner' : 'ready-internal',
      owner: '常驻 AI 员工',
      action: '服务中监听发布回执、预约/领券/到店意向、浏览器 session 和外部失败恢复。',
      proof: dispatchState.heartbeat
        ? `${dispatchState.heartbeat.followups.length} followups / ${dispatchState.heartbeat.watcherPolicy?.summary.armed ?? 0} watcher lanes`
        : '未运行 Heartbeat',
    },
    {
      title: '收尾记忆',
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
        : '等待生成员工通道清单',
    },
  ];

  return (
    <section className="border border-stone-200 bg-white p-5 shadow-sm" id="restaurant-agent-runtime">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-stone-500">今天这张门店工单</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">把活动、内容、发布凭证和店长跟进排成一张可执行清单</h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            当前先用公开资料、门店素材和手工回填把任务跑起来：发布检查、券核销复盘、线索跟进和门店记忆都进入任务队列。
            未拿到商家账号确认和去掉顾客隐私的汇总表前，不执行外部动作，也不声称已经发布、核销或读取平台经营数据。
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
          <p className="text-[11px] font-semibold tracking-[0.16em] text-stone-500">能力清单</p>
            <h3 className="mt-1 text-lg font-black text-stone-950">老板先看今天能做什么，内部再看底层能力是否齐全</h3>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-stone-600">
              这里不要求老板理解技术架构，只把外部成熟产品里的流程拆成可执行事项：先生成方案和证据槽，账号确认后再做真实发布、回收和复盘。
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
          {[
            {
              title: '发布凭证',
              status: '今天可用',
              body: '先收大众点评、小红书、抖音或微信群链接和截图，不用先接平台账号。',
              proof: '老板能看到哪条内容已经发出，哪条还缺证明。',
            },
            {
              title: '门店记忆',
              status: '今天可用',
              body: '记录菜品、价格边界、禁用说法、负责人和上一轮复盘。',
              proof: '下一轮活动不用从空白页开始。',
            },
            {
              title: '店长跟进',
              status: '今天可用',
              body: '把预约、券领取、私信咨询和社群反馈整理成负责人任务。',
              proof: '只看聚合信号，不保存手机号、微信号或私信原文。',
            },
            {
              title: '账号确认',
              status: '确认后执行',
              body: '真实发布、核销和经营分析要等商家确认账号、活动权限和去掉顾客隐私的汇总表。',
              proof: '没确认前只生成操作清单，不冒充已执行。',
            },
          ].map(item => (
            <article className="border border-stone-200 bg-[#fbfaf7] p-3" key={item.title}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold text-stone-500">老板可见</div>
                  <h4 className="mt-1 text-sm font-black text-stone-950">{item.title}</h4>
                </div>
                <span className="shrink-0 border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-800">
                  {formatRuntimeStatus(item.status)}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-stone-600">{item.body}</p>
              <p className="mt-2 text-[11px] leading-5 text-stone-500">{item.proof}</p>
            </article>
          ))}
        </div>
      </div>

      <details className="mt-5 border border-stone-200 bg-[#fbfaf7] p-4">
        <summary className="cursor-pointer text-sm font-black text-stone-950">
          内部工具列表，老板可先跳过
          <span className="ml-2 text-xs font-semibold text-stone-500">给运营和技术复核底层连接器</span>
        </summary>
        <div className="mt-4 grid gap-3 lg:grid-cols-3 xl:grid-cols-4">
          {[browserConnector, memoryConnector, queueConnector, lobuConnector, ledgerConnector, callbackConnector, recoveryConnector, browserSessionConnector, browserRunbookConnector, browserRunnerContractConnector, browserRunnerEventConnector, grantConnector, grantChecklistConnector, activationGatesConnector, competitorAuditConnector, buildQueueConnector, executionPackageConnector, callbackSimulatorConnector, runHealthConnector, runtimeProbeConnector, runtimeSetupConnector, posImportConnector, publicProfileConnector, opsConsoleConnector].filter(Boolean).map((connector, index) => (
            <article className="border border-stone-200 bg-white p-4" key={connector!.id}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-black text-stone-950">接入检查 {index + 1}</h3>
                <span className={`shrink-0 border px-2 py-1 text-[10px] font-black ${statusTone[connector!.status]}`}>{statusLabel[connector!.status]}</span>
              </div>
              <p className="mt-3 text-xs leading-5 text-stone-600">给运营和技术复核使用：确认这类外部动作现在是可内部生成、待补资料，还是必须人工交接。</p>
              <p className="mt-3 border-l-2 border-stone-300 pl-3 text-[11px] leading-5 text-stone-500">老板只需要看上面的发布凭证、门店记忆、店长跟进和账号确认。</p>
            </article>
          ))}
        </div>
      </details>

      <div className="mt-5 border border-stone-200 bg-stone-950 p-4 text-white">
        <div className="mb-4 border border-amber-200/30 bg-[#14120d] p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-stretch xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold tracking-[0.16em] text-amber-200">门店工单主控台</p>
              <h3 className="mt-1 text-xl font-black">先跑一张受控试单，再看凭证、跟进和还缺什么资料</h3>
              <p className="mt-2 text-xs leading-5 text-white/65">
                这里是客户试用时的主路径：把门店资料转成一张可验收的工单，随后看发布凭证、店长跟进、回收信号和下一步。底层工具仍保留，但不让客户在技术按钮里迷路。
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-4 xl:min-w-[640px]">
              <div className="border border-white/10 bg-white/[0.06] p-3">
                <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">当前状态</div>
                <div className="mt-1 truncate font-mono text-sm font-black text-white" title={commandMode}>{commandMode}</div>
              </div>
              <div className="border border-white/10 bg-white/[0.06] p-3">
                <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">已回填凭证</div>
                <div className="mt-1 font-mono text-sm font-black text-white">{commandAcceptedReceipts}</div>
              </div>
              <div className="border border-white/10 bg-white/[0.06] p-3">
                <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">待补资料</div>
                <div className="mt-1 font-mono text-sm font-black text-white">{commandProviderGates}</div>
              </div>
              <div className="border border-white/10 bg-white/[0.06] p-3">
                <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">渠道回收</div>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/75">常驻任务板</div>
                    <h4 className="mt-1 text-base font-black text-white">{dispatchState.residentAgentMissionControl.mode} / {dispatchState.residentAgentMissionControl.primaryAction.label}</h4>
                    <p className="mt-1 text-xs leading-5 text-white/60">{dispatchState.residentAgentMissionControl.answerForMerchant}</p>
                  </div>
                  <div className="grid min-w-[280px] grid-cols-3 gap-2 text-xs">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{dispatchState.residentAgentMissionControl.summary.readyLanes}/{dispatchState.residentAgentMissionControl.summary.lanes}</div>
                      <p className="mt-1 text-white/55">可用链路</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{dispatchState.residentAgentMissionControl.summary.externalGates}</div>
                      <p className="mt-1 text-white/55">外部条件</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{dispatchState.residentAgentMissionControl.summary.canRunExternalBrowser ? '是' : '否'}</div>
                      <p className="mt-1 text-white/55">浏览器运行</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  {dispatchState.residentAgentMissionControl.lanes.map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={item.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{item.id}</span>
                        <span>{formatRuntimeStatus(item.status)} / {item.owner}</span>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/75">对标训练蓝图</div>
                    <h4 className="mt-1 text-base font-black text-white">{formatRuntimeStatus(dispatchState.competitorTrainingBlueprint.verdict)} / 对标受阻</h4>
                    <p className="mt-1 text-xs leading-5 text-white/60">
                      Maps Claw/Cloud-style abilities into internal training, acceptance proof and provider contracts before any auto-publish, lead capture, redemption or POS analytics claim.
                    </p>
                  </div>
                  <div className="grid min-w-[360px] grid-cols-4 gap-2 text-xs">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{dispatchState.competitorTrainingBlueprint.summary.internalReady}</div>
                      <p className="mt-1 text-white/55">本地</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{dispatchState.competitorTrainingBlueprint.summary.trainableNow}</div>
                      <p className="mt-1 text-white/55">现在可训</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{dispatchState.competitorTrainingBlueprint.summary.providerContracts}</div>
                      <p className="mt-1 text-white/55">外部通道</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{dispatchState.competitorTrainingBlueprint.summary.canClaimCompetitorParity ? '是' : '否'}</div>
                      <p className="mt-1 text-white/55">对标</p>
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
                      <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-cyan-100/60">验收</p>
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
                <div className="text-[10px] font-semibold tracking-[0.14em] text-amber-100/70">门店指令拆解</div>
                <h4 className="mt-1 text-base font-black text-white">一句店长的话，拆成内部动作、发布凭证和待补资料</h4>
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
                  生成今日工单
                </button>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    className="border border-amber-200/70 px-3 py-2 text-sm font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={dispatchState.status === 'loading'}
                    onClick={routeRestaurantCommand}
                    type="button"
                  >
                    拆解门店指令
                  </button>
                  <button
                    className="border border-lime-200/60 px-3 py-2 text-sm font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={dispatchState.status === 'loading'}
                    onClick={buildStoreOperatingPlan}
                    type="button"
                  >
                    生成经营计划
                  </button>
                </div>
                <details className="mt-2 border border-white/10 bg-white/[0.04] p-3">
                  <summary className="cursor-pointer text-xs font-black text-white/75">内部高级工具</summary>
                  <div className="mt-3 grid gap-2">
                    <button
                      className="w-full border border-violet-200/60 px-3 py-2 text-sm font-black text-violet-100 transition hover:bg-violet-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={buildAiEmployeeMemoryPack}
                      type="button"
                    >
                      记住门店偏好
                    </button>
                    <button
                      className="w-full border border-fuchsia-200/60 px-3 py-2 text-sm font-black text-fuchsia-100 transition hover:bg-fuchsia-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={buildAiConsultantCopilot}
                      type="button"
                    >
                      生成经营建议
                    </button>
                    <button
                      className="w-full border border-emerald-200/60 px-3 py-2 text-sm font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={buildCustomerDemandGateway}
                      type="button"
                    >
                      整理到店线索
                    </button>
                    <button
                      className="w-full border border-sky-200/60 px-3 py-2 text-sm font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={buildVoiceOrderConsole}
                      type="button"
                    >
                      整理电话/语音订单
                    </button>
                    <button
                      className="w-full border border-rose-200/60 px-3 py-2 text-sm font-black text-rose-100 transition hover:bg-rose-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={buildProviderLaunchBoard}
                      type="button"
                    >
                      发布前检查
                    </button>
                    <button
                      className="w-full border border-amber-200/60 px-3 py-2 text-sm font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={buildMerchantActivationPacket}
                      type="button"
                    >
                      门店启动资料包
                    </button>
                    <button
                      className="w-full border border-emerald-200/60 bg-emerald-200/10 px-3 py-2 text-sm font-black text-emerald-100 transition hover:bg-emerald-200/20 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={refreshResidentAgentMissionControl}
                      type="button"
                    >
                      跟进助手
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
                    onClick={() => setRestaurantCommand('列出真实发布、核销、经营分析前还缺哪些账号确认、截图回执和经营汇总表。')}
                    type="button"
                  >
                    补资料条件
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
                    <span>{formatRuntimeStatus(commandRoute.verdict)}</span>
                    <span>{commandRoute.confidence}</span>
                  </div>
                  <p className="mt-2 text-sm font-black text-white">{commandRoute.primaryAction.label}</p>
                  <p className="mt-1 text-xs leading-5 text-white/55">{commandRoute.primaryAction.reason}</p>
                  <p className="mt-2 text-[11px] leading-4 text-white/40">{commandRoute.primaryAction.stopLine}</p>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">已提取凭证</div>
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
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">路由动作</div>
                  <p className="mt-2 text-sm font-black text-white">{commandRoute.primaryAction.clientAction}</p>
                  <p className="mt-1 text-xs leading-5 text-white/55">{commandRoute.primaryAction.owner} / {formatRuntimeStatus(commandRoute.primaryAction.status)}</p>
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
                    <div className="text-[10px] font-semibold tracking-[0.14em] text-amber-100/70">今日门店工单</div>
                    <h4 className="mt-1 text-base font-black text-white">{commandAiCockpit?.payloadShape || '门店工单预览'}</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      {(commandAiCockpit?.restaurant || runtimeIntake.restaurant)} / {(commandAiCockpit?.offer || runtimeIntake.offer)}：把今天可先做的经营动作、发布前检查、凭证回填和店长跟进放到一张工单里。
                    </p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-5 lg:min-w-[620px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{formatRuntimeStatus(commandAiCockpit?.verdict || 'preview-before-run')}</div>
                      <p className="mt-1 text-white/55">判断</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCockpitSummary.zones}</div>
                      <p className="mt-1 text-white/55">事项</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCockpitSummary.readyInternal}</div>
                      <p className="mt-1 text-white/55">可先做</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCockpitSummary.providerGated}</div>
                      <p className="mt-1 text-white/55">待补资料</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCockpitSummary.canClaimAutomation ? '就绪' : '受阻'}</div>
                      <p className="mt-1 text-white/55">可否代办</p>
                    </div>
                  </div>
                </div>
                {commandGmCommandDeck ? (
                  <div className="mt-3 border border-lime-200/25 bg-lime-200/[0.05] p-3">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/70">店总指挥台</div>
                        <h4 className="mt-1 text-sm font-black text-white">{commandGmCommandDeck.shiftMode} / {commandGmCommandDeck.payloadShape}</h4>
                        <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">{commandGmCommandDeck.answerForOwner}</p>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandGmCommandDeck.summary.aiCanRunInternal}</div>
                          <p className="mt-1 text-white/55">AI 本地</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandGmCommandDeck.summary.staffReview}</div>
                          <p className="mt-1 text-white/55">员工确认</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandGmCommandDeck.summary.providerRequired}</div>
                          <p className="mt-1 text-white/55">需要外部资料</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandGmCommandDeck.summary.evidenceRequired}</div>
                          <p className="mt-1 text-white/55">需要凭证</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandGmCommandDeck.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                          <p className="mt-1 text-white/55">可否代办</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 lg:grid-cols-5">
                      {commandGmCommandDeck.lanes.map(lane => (
                        <div className="border border-white/10 bg-stone-950/50 p-3" key={lane.id}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-white">{lane.title}</span>
                            <span className={lane.status === 'ai-can-run-internal' ? 'text-[11px] text-emerald-100/70' : lane.status === 'provider-required' ? 'text-[11px] text-amber-100/70' : 'text-[11px] text-lime-100/70'}>
                              {formatRuntimeStatus(lane.status)}
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
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">AI 自动队列</div>
                        <p className="mt-1 text-[11px] leading-4 text-emerald-100/65">{commandGmCommandDeck.aiAutopilotQueue.join(' / ') || 'none'}</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.04] p-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">员工队列</div>
                        <p className="mt-1 text-[11px] leading-4 text-lime-100/65">{commandGmCommandDeck.staffQueue.join(' / ') || 'none'}</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.04] p-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">外部资料队列</div>
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
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">班次自动巡航</div>
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
                          跑完整班次循环
                        </button>
                        <button
                          className="ml-2 mt-3 border border-sky-200 bg-sky-200 px-3 py-2 text-xs font-black text-stone-950 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={runShiftAutopilot}
                          type="button"
                        >
                          运行班次自动巡航
                        </button>
                        <button
                          className="ml-2 mt-3 border border-amber-200/70 px-3 py-2 text-xs font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildShiftProviderHandoff}
                          type="button"
                        >
                          生成代办交接
                        </button>
                        <button
                          className="ml-2 mt-3 border border-lime-200/70 px-3 py-2 text-xs font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildShiftSandboxAcceptance}
                          type="button"
                        >
                          检查沙箱验收
                        </button>
                        <button
                          className="ml-2 mt-3 border border-orange-200/70 px-3 py-2 text-xs font-black text-orange-100 transition hover:bg-orange-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildShiftFirstForwardableRun}
                          type="button"
                        >
                          生成首轮可转发试跑
                        </button>
                        <button
                          className="ml-2 mt-3 border border-rose-200/70 px-3 py-2 text-xs font-black text-rose-100 transition hover:bg-rose-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={forwardShiftSandboxRun}
                          type="button"
                        >
                          提交班次沙箱试跑
                        </button>
                        <button
                          className="ml-2 mt-3 border border-violet-200/70 px-3 py-2 text-xs font-black text-violet-100 transition hover:bg-violet-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildShiftCloseoutTrainingPack}
                          type="button"
                        >
                          收尾并训练
                        </button>
                        <button
                          className="ml-2 mt-3 border border-emerald-200/70 px-3 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={recordShiftCloseoutTraining}
                          type="button"
                        >
                          记录训练
                        </button>
                        <button
                          className="ml-2 mt-3 border border-cyan-200/70 px-3 py-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildShiftCapabilityActivationPack}
                          type="button"
                        >
                          激活包
                        </button>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandShiftAutopilot.summary.dueNow}</div>
                          <p className="mt-1 text-white/55">现在到期</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandShiftAutopilot.summary.internalRunnable}</div>
                          <p className="mt-1 text-white/55">本地运行</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandShiftAutopilot.summary.manualPrep}</div>
                          <p className="mt-1 text-white/55">人工准备</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandShiftAutopilot.summary.providerBlocked}</div>
                          <p className="mt-1 text-white/55">待补资料挂起</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandShiftAutopilot.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                          <p className="mt-1 text-white/55">可否代办</p>
                        </div>
                      </div>
                    </div>
                    {commandShiftOperatingLoopPack ? (
                      <div className="mt-3 border border-emerald-200/25 bg-emerald-200/[0.05] p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">班次经营闭环</div>
                            <h5 className="mt-1 text-sm font-black text-white">{formatRuntimeStatus(commandShiftOperatingLoopPack.verdict)}</h5>
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
                              <p className="mt-1 text-white/55">就绪阶段</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftOperatingLoopPack.summary.waitingProvider}</div>
                              <p className="mt-1 text-white/55">待补资料</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftOperatingLoopPack.summary.waitingProof}</div>
                              <p className="mt-1 text-white/55">凭证条件</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftOperatingLoopPack.summary.activatedInternal}</div>
                              <p className="mt-1 text-white/55">本地进行中</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftOperatingLoopPack.summary.canSubmitSandbox ? '就绪' : '受阻'}</div>
                              <p className="mt-1 text-white/55">沙箱提交</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 lg:grid-cols-3">
                          {commandShiftOperatingLoopPack.stages.map(stage => (
                            <div className="border border-white/10 bg-stone-950/50 p-3" key={stage.id}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-black text-white">{stage.title}</span>
                                <span className={stage.status === 'ready' ? 'text-[11px] text-emerald-100/70' : stage.status === 'waiting-provider' ? 'text-[11px] text-amber-100/70' : stage.status === 'waiting-proof' ? 'text-[11px] text-sky-100/70' : 'text-[11px] text-rose-100/70'}>
                                  {formatRuntimeStatus(stage.status)}
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
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">当前队列</div>
                        <p className="mt-1 text-[11px] leading-4 text-emerald-100/65">{commandShiftAutopilot.nowQueue.join(' / ') || 'none'}</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.04] p-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">下次唤醒</div>
                        <p className="mt-1 text-[11px] leading-4 text-sky-100/65">{commandShiftAutopilot.nextWakeups.join(' / ') || 'none'}</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.04] p-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">经营守则</div>
                        <p className="mt-1 text-[11px] leading-4 text-white/45">{commandShiftAutopilot.operatingPolicy.join(' / ')}</p>
                      </div>
                    </div>
                    {commandShiftAutopilotRun ? (
                      <div className="mt-3 border border-sky-200/20 bg-stone-950/40 p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">最近运行台账</div>
                            <h5 className="mt-1 text-sm font-black text-white">{commandShiftAutopilotRun.runId}</h5>
                            <p className="mt-1 text-xs leading-5 text-white/55">{commandShiftAutopilotRun.payloadShape} / {commandShiftAutopilotRun.completedAt}</p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftAutopilotRun.summary.acceptedInternalActions}</div>
                              <p className="mt-1 text-white/55">已验收</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftAutopilotRun.summary.preparedManualActions}</div>
                              <p className="mt-1 text-white/55">人工</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftAutopilotRun.summary.providerHeldActions}</div>
                              <p className="mt-1 text-white/55">待补资料挂起</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftAutopilotRun.summary.evidenceHeldActions}</div>
                              <p className="mt-1 text-white/55">凭证暂存</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftAutopilotRun.summary.createdStoreManagerTasks}</div>
                              <p className="mt-1 text-white/55">负责人任务</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 lg:grid-cols-3">
                          <div className="border border-white/10 bg-white/[0.04] p-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">本地动作</div>
                            <p className="mt-1 text-[11px] leading-4 text-emerald-100/65">
                              {commandShiftAutopilotRun.acceptedInternalActions.map(action => action.title).join(' / ') || 'none'}
                            </p>
                          </div>
                          <div className="border border-white/10 bg-white/[0.04] p-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待补资料挂起</div>
                            <p className="mt-1 text-[11px] leading-4 text-amber-100/65">
                              {commandShiftAutopilotRun.providerHeldActions.map(action => action.providerRequired.join(' + ') || action.title).join(' / ') || 'none'}
                            </p>
                          </div>
                          <div className="border border-white/10 bg-white/[0.04] p-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">凭证台账</div>
                            <p className="mt-1 text-[11px] leading-4 text-white/45">
                              {commandShiftAutopilotRun.evidenceLedger.slice(0, 3).map(item => `${item.title}: ${formatRuntimeStatus(item.status)}`).join(' / ') || 'none'}
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
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">班次代办交接</div>
                            <h5 className="mt-1 text-sm font-black text-white">{commandShiftProviderHandoff.payloadShape}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">{commandShiftProviderHandoff.nextAction}</p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftProviderHandoff.summary.requests}</div>
                              <p className="mt-1 text-white/55">请求</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftProviderHandoff.summary.p0}</div>
                              <p className="mt-1 text-white/55">P0</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftProviderHandoff.summary.providerEnvKeys}</div>
                              <p className="mt-1 text-white/55">配置项名</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftProviderHandoff.summary.merchantApprovals}</div>
                              <p className="mt-1 text-white/55">授权</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftProviderHandoff.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                              <p className="mt-1 text-white/55">可否代办</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 lg:grid-cols-3">
                          <div className="border border-white/10 bg-white/[0.04] p-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">外部服务端配置</div>
                            <p className="mt-1 text-[11px] leading-4 text-amber-100/65">{commandShiftProviderHandoff.providerEnvKeys.slice(0, 6).join(' / ') || 'none'}</p>
                          </div>
                          <div className="border border-white/10 bg-white/[0.04] p-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">店长确认</div>
                            <p className="mt-1 text-[11px] leading-4 text-white/45">{commandShiftProviderHandoff.merchantApprovals.slice(0, 5).join(' / ') || 'none'}</p>
                          </div>
                          <div className="border border-white/10 bg-white/[0.04] p-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">数据约定</div>
                            <p className="mt-1 text-[11px] leading-4 text-white/45">{commandShiftProviderHandoff.dataContracts.slice(0, 5).join(' / ') || 'none'}</p>
                          </div>
                        </div>
                        {commandShiftProviderHandoff.requests.slice(0, 4).map(request => (
                          <div className="mt-2 border border-white/10 bg-stone-950/50 p-2" key={request.id}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-black text-white">{request.capability}</span>
                              <span className="text-[11px] text-amber-100/70">{request.priority} / {formatRuntimeStatus(request.status)}</span>
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
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/70">班次沙箱验收</div>
                            <h5 className="mt-1 text-sm font-black text-white">{formatRuntimeStatus(commandShiftSandboxAcceptance.verdict)}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">{commandShiftSandboxAcceptance.payloadShape}</p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftSandboxAcceptance.summary.passed}/{commandShiftSandboxAcceptance.summary.stages}</div>
                              <p className="mt-1 text-white/55">通过</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftSandboxAcceptance.summary.waitingExternal}</div>
                              <p className="mt-1 text-white/55">等待</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftSandboxAcceptance.summary.providerRequests}</div>
                              <p className="mt-1 text-white/55">外部资料请求</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftSandboxAcceptance.summary.canSubmitSandbox ? '就绪' : '受阻'}</div>
                              <p className="mt-1 text-white/55">沙箱提交</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftSandboxAcceptance.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                              <p className="mt-1 text-white/55">可否代办</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 lg:grid-cols-3">
                          {commandShiftSandboxAcceptance.stages.slice(0, 6).map(stage => (
                            <div className="border border-white/10 bg-stone-950/50 p-2" key={stage.id}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-black text-white">{stage.id}</span>
                                <span className={stage.status === 'passed' ? 'text-[11px] text-emerald-100/70' : stage.status === 'waiting-external' ? 'text-[11px] text-amber-100/70' : 'text-[11px] text-rose-100/70'}>
                                  {formatRuntimeStatus(stage.status)}
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
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-100/70">班次首轮可转发试跑</div>
                            <h5 className="mt-1 text-sm font-black text-white">{formatRuntimeStatus(commandShiftFirstForwardableRun.verdict)}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                              {commandShiftFirstForwardableRun.payloadShape} converts the latest shift ledger, provider asks, sandbox acceptance and sanitized package into one provider-ready preflight.
                            </p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftFirstForwardableRun.summary.shiftRuns}</div>
                              <p className="mt-1 text-white/55">班次运行</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftFirstForwardableRun.summary.providerRequests}</div>
                              <p className="mt-1 text-white/55">外部资料请求</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftFirstForwardableRun.summary.forwardablePackages}</div>
                              <p className="mt-1 text-white/55">任务包</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftFirstForwardableRun.summary.canSubmitSandbox ? '就绪' : '受阻'}</div>
                              <p className="mt-1 text-white/55">沙箱</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftFirstForwardableRun.summary.canForwardFirstShiftRun ? '就绪' : '受阻'}</div>
                              <p className="mt-1 text-white/55">首跑</p>
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
                                  {formatRuntimeStatus(stage.status)}
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
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-100/70">班次沙箱转发尝试</div>
                            <h5 className="mt-1 text-sm font-black text-white">{formatRuntimeStatus(commandShiftSandboxForwardAttempt.verdict)}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                              {commandShiftSandboxForwardAttempt.payloadShape} / {commandShiftSandboxForwardAttempt.bridge.message}
                            </p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-4 xl:min-w-[520px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftSandboxForwardAttempt.summary.bridgeStatus}</div>
                              <p className="mt-1 text-white/55">通道</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftSandboxForwardAttempt.summary.selectedPackageFound ? '是' : '否'}</div>
                              <p className="mt-1 text-white/55">任务包</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftSandboxForwardAttempt.summary.runRecorded ? '是' : '否'}</div>
                              <p className="mt-1 text-white/55">运行台账</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftSandboxForwardAttempt.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                              <p className="mt-1 text-white/55">宣称</p>
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/55">
                          receipt: {commandShiftSandboxForwardAttempt.receiptExpectation.callbackHeader} / {commandShiftSandboxForwardAttempt.receiptExpectation.closeoutRule}
                        </p>
                        {commandShiftSandboxForwardAttempt.selectedPackage ? (
                          <p className="mt-2 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-rose-100/65">
                            package: {commandShiftSandboxForwardAttempt.selectedPackage.runtimeTarget} / {formatRuntimeStatus(commandShiftSandboxForwardAttempt.selectedPackage.status)} / {commandShiftSandboxForwardAttempt.selectedPackage.canForward ? '可转发' : commandShiftSandboxForwardAttempt.selectedPackage.blockedReasons[0]}
                          </p>
                        ) : null}
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{commandShiftSandboxForwardAttempt.safetyBoundary}</p>
                      </div>
                    ) : null}
                    {commandShiftCloseoutTrainingPack ? (
                      <div className="mt-3 border border-violet-200/25 bg-violet-200/[0.05] p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/70">班次收尾训练包</div>
                            <h5 className="mt-1 text-sm font-black text-white">{formatRuntimeStatus(commandShiftCloseoutTrainingPack.verdict)}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                              {commandShiftCloseoutTrainingPack.payloadShape} turns receipts, recovery, post-run review and capability drafts into the next operating loop.
                            </p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingPack.summary.acceptedReceipts}</div>
                              <p className="mt-1 text-white/55">已验收</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingPack.summary.waitingReceipts}</div>
                              <p className="mt-1 text-white/55">等待</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingPack.summary.recoveryActions}</div>
                              <p className="mt-1 text-white/55">恢复</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingPack.summary.trainingDrafts}</div>
                              <p className="mt-1 text-white/55">草稿</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingPack.summary.canRecordTraining ? '就绪' : '受阻'}</div>
                              <p className="mt-1 text-white/55">训练</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 lg:grid-cols-5">
                          {commandShiftCloseoutTrainingPack.lanes.map(lane => (
                            <div className="border border-white/10 bg-stone-950/50 p-2" key={lane.id}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-black text-white">{lane.id}</span>
                                <span className={lane.status === 'ready' ? 'text-[11px] text-emerald-100/70' : lane.status === 'waiting' ? 'text-[11px] text-amber-100/70' : 'text-[11px] text-rose-100/70'}>
                                  {formatRuntimeStatus(lane.status)}
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
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">班次收尾训练记录</div>
                            <h5 className="mt-1 text-sm font-black text-white">{formatRuntimeStatus(commandShiftCloseoutTrainingRecordAttempt.verdict)}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                              {commandShiftCloseoutTrainingRecordAttempt.payloadShape} / {commandShiftCloseoutTrainingRecordAttempt.nextAction}
                            </p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-4 xl:min-w-[520px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingRecordAttempt.summary.recordableDrafts}</div>
                              <p className="mt-1 text-white/55">可记录</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingRecordAttempt.summary.recorded}</div>
                              <p className="mt-1 text-white/55">已记录</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingRecordAttempt.summary.rejected}</div>
                              <p className="mt-1 text-white/55">已拒绝</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingRecordAttempt.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                              <p className="mt-1 text-white/55">宣称</p>
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
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/70">班次能力激活包</div>
                            <h5 className="mt-1 text-sm font-black text-white">{formatRuntimeStatus(commandShiftCapabilityActivationPack.verdict)}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                              {commandShiftCapabilityActivationPack.payloadShape} maps accepted training records into internal-active and provider-gated restaurant AI capabilities.
                            </p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCapabilityActivationPack.summary.activatedInternal}</div>
                              <p className="mt-1 text-white/55">进行中</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCapabilityActivationPack.summary.trainedNeedsProvider}</div>
                              <p className="mt-1 text-white/55">已训待补</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCapabilityActivationPack.summary.needsTraining}</div>
                              <p className="mt-1 text-white/55">待训练</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCapabilityActivationPack.summary.acceptedTrainingRecords}</div>
                              <p className="mt-1 text-white/55">记录</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCapabilityActivationPack.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                              <p className="mt-1 text-white/55">宣称</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 lg:grid-cols-3">
                          {commandShiftCapabilityActivationPack.activations.slice(0, 6).map(item => (
                            <div className="border border-white/10 bg-stone-950/50 p-2" key={item.capabilityId}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-black text-white">{item.capabilityId}</span>
                                <span className={item.status === 'activated-internal' ? 'text-[11px] text-emerald-100/70' : item.status === 'trained-needs-provider' ? 'text-[11px] text-amber-100/70' : 'text-[11px] text-rose-100/70'}>
                                  {formatRuntimeStatus(item.status)}
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
                        <span className="font-mono text-xs text-white">{formatRuntimeLabel(zone.title)}</span>
                        <span className="text-[11px] text-amber-100/70">{formatRuntimeStatus(zone.status)}</span>
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
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/70">对标路线判断</div>
                      <h4 className="mt-1 text-sm font-black text-white">平台主干 + 操作体验 + 通道/数据约定</h4>
                      <p className="mt-2 max-w-4xl text-[11px] leading-4 text-white/50">
                        判断哪些能力可以直接复用、哪些需要升级、哪些今天能本地试跑，以及还缺哪些账号确认或经营数据规则。
                      </p>
                      <p className="mt-2 max-w-4xl text-[11px] leading-4 text-fuchsia-100/60">
                        最终产品形态：产品底座 = kuaizi-style-platform-spine，操作层 = shaozi-claw-cloud-style-ai-employee-workbench，执行层 = lobu-openclaw-hermes-browser-agent。不要照抄炫技的浏览器代理，要抄的是一键默认路径、能力卡片、凭证回执和待补资料条件这套 UI/UX。
                      </p>
                    </div>
                    <button
                      className="border border-fuchsia-200/50 px-3 py-2 text-xs font-black text-fuchsia-100 transition hover:bg-fuchsia-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={buildCompetitorRouteDecision}
                      type="button"
                    >
                      生成路线判断
                    </button>
                  </div>
                  {dispatchState.competitorRouteDecision ? (
                    <>
                      <div className="mt-3 grid gap-2 text-xs sm:grid-cols-5">
                        <div className="border border-white/10 bg-white/[0.04] p-2">
                          <div className="font-mono text-white">{dispatchState.competitorRouteDecision.summary.options}</div>
                          <p className="mt-1 text-white/55">路由</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.04] p-2">
                          <div className="font-mono text-white">{dispatchState.competitorRouteDecision.summary.internalCanShipNow}</div>
                          <p className="mt-1 text-white/55">本地现在</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.04] p-2">
                          <div className="font-mono text-white">{dispatchState.competitorRouteDecision.summary.trainingItems}</div>
                          <p className="mt-1 text-white/55">训练</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.04] p-2">
                          <div className="font-mono text-white">{dispatchState.competitorRouteDecision.summary.externalRequired}</div>
                          <p className="mt-1 text-white/55">外部条件</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.04] p-2">
                          <div className="font-mono text-white">{dispatchState.competitorRouteDecision.summary.canClaimFullCompetitorParity ? '是' : '否'}</div>
                          <p className="mt-1 text-white/55">完全对标</p>
                        </div>
                      </div>
                      <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-xs leading-5 text-fuchsia-100/70">{dispatchState.competitorRouteDecision.answerForOwner}</p>
                      <div className="mt-3 border border-white/10 bg-white/[0.04] p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">最终产品形态</div>
                        <p className="mt-2 text-xs leading-5 text-fuchsia-100/75">{dispatchState.competitorRouteDecision.finalShape.reason}</p>
                        <div className="mt-3 grid gap-2 text-[11px] md:grid-cols-4">
                          <div className="border border-white/10 bg-stone-950/45 p-2">
                            <div className="font-mono text-white">{dispatchState.competitorRouteDecision.finalShape.productBase}</div>
                            <p className="mt-1 text-white/45">产品底座</p>
                          </div>
                          <div className="border border-white/10 bg-stone-950/45 p-2">
                            <div className="font-mono text-white">{dispatchState.competitorRouteDecision.finalShape.operatorLayer}</div>
                            <p className="mt-1 text-white/45">操作层</p>
                          </div>
                          <div className="border border-white/10 bg-stone-950/45 p-2">
                            <div className="font-mono text-white">{dispatchState.competitorRouteDecision.finalShape.runtimeLayer}</div>
                            <p className="mt-1 text-white/45">执行层</p>
                          </div>
                          <div className="border border-white/10 bg-stone-950/45 p-2">
                            <div className="font-mono text-white">{dispatchState.competitorRouteDecision.finalShape.dataLayer}</div>
                            <p className="mt-1 text-white/45">数据层</p>
                          </div>
                        </div>
                        <p className="mt-3 text-[11px] leading-4 text-amber-100/65">{dispatchState.competitorRouteDecision.finalShape.firstScreenRule}</p>
                      </div>
                      <div className="mt-3 grid gap-2 lg:grid-cols-3">
                        {dispatchState.competitorRouteDecision.referenceModels.map(model => (
                          <div className="border border-white/10 bg-stone-950/50 p-3" key={model.id}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-black text-white">{model.label}</span>
                              <span className="text-[11px] text-fuchsia-100/70">{model.recommendedUse} / {model.fitScore}</span>
                            </div>
                            <p className="mt-2 text-[11px] leading-4 text-emerald-100/60">吸收: {model.adopt.slice(0, 3).join(' / ')}</p>
                            <p className="mt-1 text-[11px] leading-4 text-rose-100/60">不要照抄: {model.doNotCopyBlindly.slice(0, 2).join(' / ')}</p>
                            <p className="mt-1 text-[11px] leading-4 text-cyan-100/60">UI/UX: {model.uiUxToReplicate.slice(0, 3).join(' / ')}</p>
                            <p className="mt-1 text-[11px] leading-4 text-amber-100/60">还需外部: {model.externalRequired.slice(0, 3).join(' / ')}</p>
                          </div>
                        ))}
                      </div>
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
                          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">下一个构建顺序</div>
                          {dispatchState.competitorRouteDecision.nextBuildOrder.slice(0, 4).map(item => (
                            <p className="mt-2 text-[11px] leading-4 text-white/55" key={item.id}>{item.owner}: {item.action}</p>
                          ))}
                        </div>
                        <div className="border border-white/10 bg-white/[0.04] p-2">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">账号配置</div>
                          <p className="mt-2 text-[11px] leading-4 text-amber-100/65">{dispatchState.competitorRouteDecision.providerKeyChecklist.slice(0, 12).join(' / ') || 'none'}</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.04] p-2">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">店长输入</div>
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
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/70">竞品对照板</div>
                      <h4 className="mt-1 text-sm font-black text-white">竞品级能力拆成内部可跑 / 外部必接两层</h4>
                    </div>
                    <div className="flex flex-col gap-2 lg:items-end">
                      <p className="max-w-2xl text-[11px] leading-4 text-white/45">
                        这里不承诺已经完成外部发布、线索承接或核销；只把真正能内部执行的计划、回执、记忆、复盘先跑起来，把必须外部 Provider 的钥匙列清楚。
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="border border-cyan-200/50 px-3 py-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildExternalUnlockRequestPack}
                          type="button"
                        >
                          代办解锁清单
                        </button>
                        <button
                          className="border border-amber-200/50 px-3 py-2 text-xs font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildProviderSetupPack}
                          type="button"
                        >
                          补资料包
                        </button>
                      </div>
                      <p className="max-w-2xl text-[11px] leading-4 text-cyan-100/55">
                        代办解锁清单会生成交付包、验收字段和导出摘要，方便交给商户、技术和数据负责人签收。
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 lg:grid-cols-3">
                    {competitorParityLanes.map(lane => (
                      <div className="border border-white/10 bg-stone-950/50 p-3" key={lane.title}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-white">{lane.title}</span>
                          <span className={lane.status === 'ready-internal' ? 'text-[11px] text-emerald-100/70' : 'text-[11px] text-amber-100/70'}>
                            {formatRuntimeStatus(lane.status)}
                          </span>
                        </div>
                        <p className="mt-2 text-[11px] leading-4 text-white/60">本地能做: {lane.internal}</p>
                        <p className="mt-2 text-[11px] leading-4 text-amber-100/60">还需外部: {lane.external}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 border border-emerald-200/20 bg-emerald-200/[0.04] p-3">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">常驻店员循环</div>
                      <h4 className="mt-1 text-sm font-black text-white">常驻餐饮 AI 员工：主动巡检、跟进、写记忆</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="border border-emerald-200/50 px-3 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={dispatchState.status === 'loading'}
                        onClick={runHeartbeat}
                        type="button"
                      >
                        运行常驻心跳
                      </button>
                      <button
                        className="border border-sky-200/50 px-3 py-2 text-xs font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={dispatchState.status === 'loading'}
                        onClick={buildChannelHub}
                        type="button"
                      >
                        生成员工通道清单
                      </button>
                      <button
                        className="border border-violet-200/50 px-3 py-2 text-xs font-black text-violet-100 transition hover:bg-violet-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={dispatchState.status === 'loading'}
                        onClick={buildAiEmployeeMemoryPack}
                        type="button"
                      >
                        生成门店记忆包
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 lg:grid-cols-4">
                    {residentEmployeeLoop.map(item => (
                      <div className="border border-white/10 bg-stone-950/50 p-3" key={item.title}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-white">{item.title}</span>
                          <span className={item.status === 'ready-internal' ? 'text-[11px] text-emerald-100/70' : item.status === 'provider-gated' ? 'text-[11px] text-amber-100/70' : 'text-[11px] text-rose-100/70'}>
                            {formatRuntimeStatus(item.status)}
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
                      <p className="mt-1 text-white/55">已盯运行回执</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.04] p-2">
                      <div className="font-mono text-white">{dispatchState.heartbeat?.shiftAutopilotRuns ?? 0}</div>
                      <p className="mt-1 text-white/55">已巡视班次</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.04] p-2">
                      <div className="font-mono text-white">{dispatchState.heartbeat?.taskWakeups ?? 0}</div>
                      <p className="mt-1 text-white/55">任务唤醒</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.04] p-2">
                      <div className="font-mono text-white">{dispatchState.heartbeat?.memorySuggestions?.length ?? 0}</div>
                      <p className="mt-1 text-white/55">记忆建议</p>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">主执行手册</div>
                    {(commandAiCockpit?.primaryRunbook || [
                      'Open Today Operations first and confirm merchant evidence.',
                      'Use AI Consultant only to create owner-visible plays, not hidden automation.',
                      '真实代办逐项通过账号检查、门店授权和签名回执后再启动。',
                      'Close Evidence Review with public proof or sanitized aggregate imports before next-loop decisions.',
                    ]).map(line => (
                      <p className="mt-2 text-[11px] leading-4 text-amber-100/65" key={line}>{line}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">凭证板</div>
                    <p className="mt-2 text-xs leading-5 text-white/55">{(commandAiCockpit?.evidenceBoard || commandCockpitZones.flatMap(zone => zone.visibleProof)).slice(0, 12).join(' / ') || 'none'}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">资料解锁</div>
                    <p className="mt-2 text-xs leading-5 text-amber-100/65">{(commandAiCockpit?.providerUnlocks || ['门店授权', '账号配置', '浏览器会话', '签名回执', 'POS 汇总数据规则']).slice(0, 12).join(' / ') || 'none'}</p>
                    <p className="mt-3 text-[11px] leading-4 text-white/40">{commandAiCockpit?.safetyBoundary || 'Preview only: no auto-publish, live call, POS write, payment, delivery, coupon redemption or private-message access without accepted Provider proof.'}</p>
                  </div>
                </div>
              </div>
            {commandAiEmployeeMemoryPack ? (
              <div className="mt-3 border border-violet-200/30 bg-violet-200/[0.06] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/70">门店记忆包</div>
                    <h4 className="mt-1 text-base font-black text-white">{commandAiEmployeeMemoryPack.payloadShape}</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      {commandAiEmployeeMemoryPack.residentEmployeeBrief.join(' / ')}
                    </p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-4 lg:min-w-[520px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiEmployeeMemoryPack.summary.memoryCards}</div>
                      <p className="mt-1 text-white/55">记忆卡</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiEmployeeMemoryPack.summary.trainingReady}</div>
                      <p className="mt-1 text-white/55">训练就绪</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiEmployeeMemoryPack.summary.providerGates}</div>
                      <p className="mt-1 text-white/55">待补资料</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiEmployeeMemoryPack.employee.safeToAutonomouslyRun ? '就绪' : '待补'}</div>
                      <p className="mt-1 text-white/55">自动程度</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {commandAiEmployeeMemoryPack.memoryCards.slice(0, 6).map(card => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={card.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{card.title}</span>
                        <span className="text-[11px] text-violet-100/70">{formatRuntimeStatus(card.status)} / {card.owner}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/65">{card.detail}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/45">{card.nextAction}</p>
                      <p className="mt-2 text-[11px] leading-4 text-violet-100/60">evidence: {card.evidenceRequired}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">下次唤醒</div>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">训练与外部条件</div>
                    <p className="mt-2 text-xs leading-5 text-white/60">
                      现在可训练: {commandAiEmployeeMemoryPack.trainingProgress.trainableNow}; 待补资料: {commandAiEmployeeMemoryPack.trainingProgress.providerGated}; 缺少材料: {commandAiEmployeeMemoryPack.summary.trainingMissingMaterials}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-white/55">
                      下一轮训练: {commandAiEmployeeMemoryPack.trainingProgress.nextInternalTraining.slice(0, 3).map(item => `${item.capabilityId}: ${item.material}`).join(' / ') || 'none'}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-violet-100/65">
                      待补外部条件: {commandAiEmployeeMemoryPack.externalRequired.slice(0, 6).join(' / ') || 'none'}
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/70">门店经营顾问</div>
                    <h4 className="mt-1 text-base font-black text-white">{commandAiConsultantCopilot.payloadShape}</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">{commandAiConsultantCopilot.executiveAnswer}</p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-5 lg:min-w-[620px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiConsultantCopilot.mode}</div>
                      <p className="mt-1 text-white/55">模式</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiConsultantCopilot.summary.actionPlays}</div>
                      <p className="mt-1 text-white/55">建议动作</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiConsultantCopilot.summary.needsTraining}</div>
                      <p className="mt-1 text-white/55">待训练</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiConsultantCopilot.summary.providerGated}</div>
                      <p className="mt-1 text-white/55">待补资料</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiConsultantCopilot.summary.canClaimAutonomousOutcome ? '就绪' : '受阻'}</div>
                      <p className="mt-1 text-white/55">可否代办</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  {commandAiConsultantCopilot.actionPlays.map(play => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={play.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{play.title}</span>
                        <span className="text-[11px] text-fuchsia-100/70">{play.owner} / {play.canExecuteInternallyNow ? '本地可做' : '待补资料'}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/60">{play.customerOutcome}</p>
                      <div className="mt-2 space-y-1">
                        {play.steps.slice(0, 4).map(step => (
                          <p className="text-[11px] leading-4 text-white/45" key={step}>{step}</p>
                        ))}
                      </div>
                      <p className="mt-2 text-[11px] leading-4 text-amber-100/60">待训练: {play.trainingNeeded.slice(0, 4).join(' / ') || 'none'}</p>
                      <p className="mt-1 text-[11px] leading-4 text-fuchsia-100/60">provider: {play.providerDependencies.slice(0, 4).join(' / ') || 'none'}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">stop: {play.stopLine}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">诊断</div>
                    <div className="mt-2 space-y-2">
                      {commandAiConsultantCopilot.diagnoses.map(item => (
                        <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                          <div className="font-mono text-xs text-white">{item.label} / {formatRuntimeStatus(item.status)}</div>
                          <p className="mt-1 text-[11px] leading-4 text-white/50">{item.finding}</p>
                          <p className="mt-1 text-[11px] leading-4 text-white/35">{item.nextAction}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">训练队列</div>
                    <div className="mt-2 space-y-1">
                      {commandAiConsultantCopilot.trainingQueue.slice(0, 8).map(item => (
                        <p className="text-[11px] leading-4 text-white/55" key={item.id}>
                          {item.owner}: {item.material}
                        </p>
                      ))}
                    </div>
                    <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">运营脚本</div>
                    {commandAiConsultantCopilot.operatorScript.map(line => (
                      <p className="mt-1 text-[11px] leading-4 text-fuchsia-100/60" key={line}>{line}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">资料解锁</div>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/70">门店经营计划</div>
                    <h4 className="mt-1 text-base font-black text-white">{commandStoreOperatingPlan.payloadShape}</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      {commandStoreOperatingPlan.restaurant} / {commandStoreOperatingPlan.offer}: today plan, weekly focus, manager standup, staff talk tracks, evidence board and provider unlocks.
                    </p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-5 lg:min-w-[620px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{formatRuntimeStatus(commandStoreOperatingPlan.verdict)}</div>
                      <p className="mt-1 text-white/55">结论</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandStoreOperatingPlan.summary.timeBlocks}</div>
                      <p className="mt-1 text-white/55">时间块</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandStoreOperatingPlan.summary.readyInternal}</div>
                      <p className="mt-1 text-white/55">本地</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandStoreOperatingPlan.summary.providerGated}</div>
                      <p className="mt-1 text-white/55">待补资料</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandStoreOperatingPlan.summary.canClaimAutomation ? '就绪' : '受阻'}</div>
                      <p className="mt-1 text-white/55">可否代办</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  {commandStoreOperatingPlan.dayPlan.map(block => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={block.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{block.window}</span>
                        <span className="text-[11px] text-lime-100/70">{block.owner} / {formatRuntimeStatus(block.status)}</span>
                      </div>
                      <p className="mt-2 text-sm font-black text-white">{block.title}</p>
                      <p className="mt-1 text-xs leading-5 text-white/60">{block.action}</p>
                      <p className="mt-2 text-[11px] leading-4 text-amber-100/60">检查: {block.checklist.slice(0, 5).join(' / ') || 'none'}</p>
                      <p className="mt-1 text-[11px] leading-4 text-lime-100/60">凭证: {block.evidenceRequired.slice(0, 4).join(' / ')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">待补: {block.providerGate}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">周计划</div>
                    <div className="mt-2 space-y-2">
                      {commandStoreOperatingPlan.weekPlan.map(block => (
                        <div className="border border-white/10 bg-white/[0.04] p-2" key={block.id}>
                          <div className="font-mono text-xs text-white">{block.window} / {formatRuntimeStatus(block.status)}</div>
                          <p className="mt-1 text-[11px] leading-4 text-white/55">{block.title}</p>
                          <p className="mt-1 text-[11px] leading-4 text-white/35">{block.action}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">店长晨会</div>
                    {commandStoreOperatingPlan.managerStandup.map(line => (
                      <p className="mt-2 text-[11px] leading-4 text-lime-100/65" key={line}>{line}</p>
                    ))}
                    <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">员工话术</div>
                    {commandStoreOperatingPlan.staffTalkTracks.map(line => (
                      <p className="mt-1 text-[11px] leading-4 text-white/55" key={line}>{line}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">凭证与资料解锁</div>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">顾客需求入口</div>
                    <h4 className="mt-1 text-base font-black text-white">{commandCustomerDemandGateway.payloadShape}</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">{commandCustomerDemandGateway.customerPromise}</p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-4 lg:min-w-[520px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCustomerDemandGateway.summary.channels}</div>
                      <p className="mt-1 text-white/55">需求渠道</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCustomerDemandGateway.summary.internalReady}</div>
                      <p className="mt-1 text-white/55">本地可做</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCustomerDemandGateway.summary.providerGated}</div>
                      <p className="mt-1 text-white/55">待补资料</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCustomerDemandGateway.summary.canClaimAutoOrderTaking ? '就绪' : '待补'}</div>
                      <p className="mt-1 text-white/55">接单能力</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {commandCustomerDemandGateway.channels.map(channel => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={channel.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{channel.name}</span>
                        <span className="text-[11px] text-emerald-100/70">{formatRuntimeStatus(channel.status)} / {channel.owner}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/60">{channel.internalNow.slice(0, 2).join(' / ')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/45">{channel.nextAction}</p>
                      <p className="mt-2 text-[11px] leading-4 text-emerald-100/60">凭证: {channel.evidenceRequired.slice(0, 3).join(' / ')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">录入字段</div>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待补资料与员工交接</div>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">语音点单台</div>
                    <h4 className="mt-1 text-base font-black text-white">{commandVoiceOrderConsole.payloadShape}</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      Phone/order/reservation layer for menu answers, intent classification, order drafts, POS/payment/delivery gates and staff takeover.
                    </p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-4 lg:min-w-[520px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandVoiceOrderConsole.summary.intents}</div>
                      <p className="mt-1 text-white/55">意图</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandVoiceOrderConsole.summary.orderDrafts}</div>
                      <p className="mt-1 text-white/55">订单草稿</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandVoiceOrderConsole.summary.providerGated}</div>
                      <p className="mt-1 text-white/55">待补链路</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandVoiceOrderConsole.summary.canWriteOrdersNow ? '就绪' : '待补'}</div>
                      <p className="mt-1 text-white/55">POS 写入</p>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">订单草稿</div>
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
                    <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">菜单知识</div>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">同步条件</div>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-100/70">真实代办启动板</div>
                    <h4 className="mt-1 text-base font-black text-white">{commandProviderLaunchBoard.payloadShape}</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      {commandProviderLaunchBoard.restaurant} / {commandProviderLaunchBoard.offer}: launch-readiness for voice, platform proof, messaging, reservation, POS/payment/delivery, operating analysis and persistent runtime.
                    </p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-5 lg:min-w-[620px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandProviderLaunchBoard.summary.capabilities}</div>
                      <p className="mt-1 text-white/55">能力</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandProviderLaunchBoard.summary.readyToSandbox}</div>
                      <p className="mt-1 text-white/55">沙箱就绪</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandProviderLaunchBoard.summary.setupRecorded}</div>
                      <p className="mt-1 text-white/55">配置已记</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandProviderLaunchBoard.summary.missingProvider}</div>
                      <p className="mt-1 text-white/55">缺项</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandProviderLaunchBoard.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                      <p className="mt-1 text-white/55">可否代办</p>
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
                      <p className="mt-2 text-[11px] leading-4 text-white/45">现在能做: {capability.canDoInternallyNow.slice(0, 3).join(' / ')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-rose-100/60">启动步骤: {capability.launchStep}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">停止线: {capability.stopLine}</p>
                      {capability.providerKeysNeeded.length || capability.merchantApprovalsNeeded.length || capability.dataContractsNeeded.length ? (
                        <p className="mt-2 text-[11px] leading-4 text-amber-100/60">
                          还缺: {[...capability.providerKeysNeeded, ...capability.merchantApprovalsNeeded, ...capability.dataContractsNeeded].slice(0, 5).join(' / ')}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">启动顺序</div>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">资料清单</div>
                    <p className="mt-2 text-xs leading-5 text-amber-100/65">
                      {commandProviderLaunchBoard.providerKeyChecklist.slice(0, 12).join(' / ') || '只做本地试跑时不需要外部账号配置。'}
                    </p>
                    <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">需要外部</div>
                    <p className="mt-2 text-xs leading-5 text-white/55">
                      {commandProviderLaunchBoard.externalRequired.slice(0, 12).join(' / ') || 'none'}
                    </p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">边界</div>
                    <p className="mt-2 text-xs leading-5 text-white/55">{commandProviderLaunchBoard.safetyBoundary}</p>
                  </div>
                </div>
              </div>
            ) : null}
            {commandMerchantActivationPacket ? (
              <div className="mt-3 border border-amber-200/30 bg-amber-200/[0.06] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">商户激活包</div>
                    <h4 className="mt-1 text-base font-black text-white">{formatRuntimeStatus(commandMerchantActivationPacket.verdict)}</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      {commandMerchantActivationPacket.restaurant} / {commandMerchantActivationPacket.offer}: 可转发给店长的落地请求，说明还缺哪些账号配置、门店授权、经营数据规则和试跑验收。
                    </p>
                    <p className="mt-2 text-[11px] leading-4 text-amber-100/70">{commandMerchantActivationPacket.nextAskForUser}</p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-5 lg:min-w-[620px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandMerchantActivationPacket.summary.capabilities}</div>
                      <p className="mt-1 text-white/55">能力</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandMerchantActivationPacket.summary.providerKeys}</div>
                      <p className="mt-1 text-white/55">配置项名</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandMerchantActivationPacket.summary.merchantApprovals}</div>
                      <p className="mt-1 text-white/55">确认项</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandMerchantActivationPacket.summary.dataContracts}</div>
                      <p className="mt-1 text-white/55">数据约定</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandMerchantActivationPacket.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                      <p className="mt-1 text-white/55">宣称</p>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">账号配置项</div>
                    <p className="mt-2 text-xs leading-5 text-amber-100/65">{commandMerchantActivationPacket.providerKeyChecklist.slice(0, 12).join(' / ') || 'none'}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">沙箱验收</div>
                    <p className="mt-2 text-xs leading-5 text-white/55">
                      {commandMerchantActivationPacket.sandboxAcceptancePlan.slice(0, 3).map(item => `${item.capabilityId}: ${item.action}`).join(' / ')}
                    </p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">不要发送</div>
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
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">架构判断</div>
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
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-100/70">能力总览台</div>
                <h4 className="mt-1 text-base font-black text-white">本地能力、训练缺口与待补资料</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  {commandActivationCockpit?.answerForCustomer || '生成能力总览，告诉客户哪些餐饮能力今天可本地试跑，哪些需要训练材料，哪些要等账号或门店授权。'}
                </p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-4 xl:min-w-[520px]">
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">现在可用</div>
                  <div className="mt-1 font-mono text-white">{commandActivationCockpit?.summary.usableNow ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">可训</div>
                  <div className="mt-1 font-mono text-white">{commandActivationCockpit?.summary.trainableNow ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">待补资料</div>
                  <div className="mt-1 font-mono text-white">{commandActivationCockpit?.summary.providerGated ?? commandProviderGates}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">需要配置</div>
                  <div className="mt-1 font-mono text-white">{commandActivationCockpit?.summary.providerKeysNeeded ?? 0}</div>
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-4">
              {(commandActivationCockpit?.lanes || []).slice(0, 4).map(lane => (
                <div className="border border-white/10 bg-white/[0.04] p-2" key={lane.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-orange-100/70">{formatRuntimeStatus(lane.status)}</span>
                    <span className="truncate text-[10px] text-white/35" title={lane.competitorEquivalent}>{lane.competitorEquivalent}</span>
                  </div>
                  <p className="mt-1 text-xs font-black text-white">{formatRuntimeLabel(lane.title)}</p>
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
              生成能力总览
            </button>
          </div>
          <div className="mt-4 border border-violet-200/30 bg-violet-200/[0.06] p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/70">经营边界报告</div>
                <h4 className="mt-1 text-base font-black text-white">一份报告看清对标、凭证和外部卡点</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  {commandAiOsAuditReport
                    ? `${commandAiOsAuditReport.payloadShape}: ${formatRuntimeStatus(commandAiOsAuditReport.verdict)}. It combines the trial cockpit, connector matrix, public source harvest and operating insight report.`
                    : '当客户问今天到底能做什么、还缺什么资料、哪些不能承诺时，生成一份边界报告。'}
                </p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">可用</div>
                  <div className="mt-1 font-mono text-white">{commandAiOsAuditReport?.summary.usableNow ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">人工</div>
                  <div className="mt-1 font-mono text-white">{commandAiOsAuditReport?.summary.manualReady ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">外部资料</div>
                  <div className="mt-1 font-mono text-white">{commandAiOsAuditReport?.summary.providerRequired ?? commandProviderGates}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">服务端配置</div>
                  <div className="mt-1 font-mono text-white">{commandAiOsAuditReport ? `${commandAiOsAuditReport.summary.configuredEnvKeys}/${commandAiOsAuditReport.summary.totalEnvKeys}` : '0/0'}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">禁止项</div>
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
                        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-violet-100/70">{formatRuntimeStatus(lane.status)}</span>
                      </div>
                      <p className="mt-1 text-xs font-black text-white">{formatRuntimeLabel(lane.title)}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/45">{lane.nextAction}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">高频动作</div>
                    {commandAiOsAuditReport.topActions.map(action => (
                      <p className="mt-1 text-[11px] leading-4 text-white/60" key={`${action.owner}-${action.action}`}>{action.owner}: {action.action}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">需要外部</div>
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
              生成能力边界报告
            </button>
          </div>
          <div className="mt-4 border border-cyan-200/30 bg-cyan-200/[0.06] p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/70">能力工单台</div>
                <h4 className="mt-1 text-base font-black text-white">选一个门店技能，拿一个可执行任务包</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  Turns the 20-module Claw-style catalog into runnable internal skills, training requests and provider unlock tasks for this exact restaurant. This is the usable layer between a fancy skill library and real store work.
                </p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">模式</div>
                  <div className="mt-1 truncate font-mono text-white" title={commandClawSkillWorkbench?.mode}>{commandClawSkillWorkbench?.mode || 'not-built'}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">可跑</div>
                  <div className="mt-1 font-mono text-white">{commandClawSkillWorkbench?.summary.runnableNow ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">训练</div>
                  <div className="mt-1 font-mono text-white">{commandClawSkillWorkbench?.summary.trainingNeeded ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">待补资料</div>
                  <div className="mt-1 font-mono text-white">{commandClawSkillWorkbench?.summary.providerGated ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">交付物</div>
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
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/70">执行记忆</div>
                  <p className="mt-1 text-xs text-white/55">
                    {commandClawSkillExecutionLedger?.nextAction || '打开能力工单，先生成第一份可记忆的执行包。'}
                  </p>
                </div>
                <div className="grid gap-2 text-xs sm:grid-cols-4 lg:min-w-[420px]">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">记录</div>
                    <div className="mt-1 font-mono text-white">{commandClawSkillExecutionLedger?.summary.total ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">就绪</div>
                    <div className="mt-1 font-mono text-white">{commandClawSkillExecutionLedger?.summary.readyNow ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">训练</div>
                    <div className="mt-1 font-mono text-white">{commandClawSkillExecutionLedger?.summary.needsTraining ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">待补</div>
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
              打开能力工单
            </button>
          </div>
          <div className="mt-4 border border-emerald-200/30 bg-emerald-200/[0.06] p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">公开情报简报</div>
                <h4 className="mt-1 text-base font-black text-white">门店事实、本地平台、素材缺口</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  Convert public store facts or merchant-provided text into channel-specific jobs for Dianping/Meituan, Xiaohongshu, Douyin, WeChat groups and POI context. Public facts only start internal trials; real publish, acquisition, redemption and operating analysis stay gated.
                </p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-4 xl:min-w-[560px]">
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">可用字段</div>
                  <div className="mt-1 font-mono text-white">{commandPublicIntelligenceBrief?.readiness.usableFields ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">本地动作</div>
                  <div className="mt-1 font-mono text-white">{commandPublicIntelligenceBrief?.readiness.internalActions ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">外部条件</div>
                  <div className="mt-1 font-mono text-white">{commandPublicIntelligenceBrief?.readiness.externalGates ?? commandProviderGates}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">试跑状态</div>
                  <div className="mt-1 font-mono text-white">{commandPublicIntelligenceBrief?.readiness.canStartTrial ? '就绪' : '草稿'}</div>
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-5">
              {(commandPublicIntelligenceBrief?.platformProfiles || []).map(item => (
                <div className="border border-white/10 bg-white/[0.04] p-2" key={item.platform}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-emerald-100/70">{item.platform}</span>
                    <span className="text-[10px] text-white/35">{item.usableNow ? '就绪' : '待补'}</span>
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
              导入公开门店资料
            </button>
          </div>
          <div className="mt-4 border border-fuchsia-200/30 bg-fuchsia-200/[0.06] p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-[10px] font-semibold tracking-[0.14em] text-fuchsia-100/70">账号和资料补齐向导</div>
                <h4 className="mt-1 text-base font-black text-white">账号确认、店长授权、员工通道、经营表格</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  给客户看的补资料清单：哪些资料能解锁真实代办、谁负责、要什么凭证、哪些仍缺。密钥只留在服务端，页面只展示已配置/待补状态。
                </p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-4 xl:min-w-[560px]">
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] tracking-[0.12em] text-white/35">完成度</div>
                  <div className="mt-1 font-mono text-white">{commandProviderSetupWizard?.summary.completionPercent ?? 0}%</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] tracking-[0.12em] text-white/35">已确认</div>
                  <div className="mt-1 font-mono text-white">{commandProviderSetupWizard?.summary.configured ?? 0}/{commandProviderSetupWizard?.summary.fields ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] tracking-[0.12em] text-white/35">待补</div>
                  <div className="mt-1 font-mono text-white">{commandProviderSetupWizard?.summary.missing ?? commandProviderGates}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] tracking-[0.12em] text-white/35">真实代办</div>
                  <div className="mt-1 font-mono text-white">{commandProviderSetupWizard?.summary.canEnableExternalAutomation ? '就绪' : '受阻'}</div>
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-4">
              <div className="border border-white/10 bg-white/[0.04] p-2">
                <div className="text-[10px] tracking-[0.12em] text-white/35">已记记录</div>
                <div className="mt-1 font-mono text-white">{commandProviderSetupState?.summary.records ?? 0}</div>
              </div>
              <div className="border border-white/10 bg-white/[0.04] p-2">
                <div className="text-[10px] tracking-[0.12em] text-white/35">服务端配置</div>
                <div className="mt-1 font-mono text-white">{commandProviderSetupState?.summary.configuredEnvKeys ?? 0}</div>
              </div>
              <div className="border border-white/10 bg-white/[0.04] p-2">
                <div className="text-[10px] tracking-[0.12em] text-white/35">门店授权</div>
                <div className="mt-1 font-mono text-white">{commandProviderSetupState?.summary.merchantApprovals ?? 0}</div>
              </div>
              <div className="border border-white/10 bg-white/[0.04] p-2">
                <div className="text-[10px] tracking-[0.12em] text-white/35">数据边界</div>
                <div className="mt-1 font-mono text-white">{commandProviderSetupState?.summary.dataContracts ?? 0}</div>
              </div>
            </div>
            <div className="mt-3 border border-white/10 bg-white/[0.04] p-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-fuchsia-100/70">外部条件可用性</div>
                  <p className="mt-1 max-w-3xl text-xs leading-5 text-white/55">
                    区分“已经记录的资料”和“真的可用”。账号、回执、门店授权和经营数据都确认前，不把外部动作当成可用。
                  </p>
                </div>
                <div className="grid gap-2 text-xs sm:grid-cols-5 lg:min-w-[560px]">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] tracking-[0.12em] text-white/35">分数</div>
                    <div className="mt-1 font-mono text-white">{commandProviderReadinessHealth?.summary.readinessScore ?? 0}%</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] tracking-[0.12em] text-white/35">可用</div>
                    <div className="mt-1 font-mono text-white">{commandProviderReadinessHealth?.summary.healthReady ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] tracking-[0.12em] text-white/35">已记录</div>
                    <div className="mt-1 font-mono text-white">{commandProviderReadinessHealth?.summary.rememberedNotProbed ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] tracking-[0.12em] text-white/35">不可达</div>
                    <div className="mt-1 font-mono text-white">{commandProviderReadinessHealth?.summary.configuredButUnreachable ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] tracking-[0.12em] text-white/35">真实代办</div>
                    <div className="mt-1 font-mono text-white">{commandProviderReadinessHealth?.summary.canEnableExternalAutomation ? '就绪' : '受阻'}</div>
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
                检查外部条件
              </button>
            </div>
            {commandProviderUnlockLadder ? (
              <div className="mt-3 border border-cyan-200/25 bg-cyan-200/[0.05] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.14em] text-cyan-100/70">代办解锁阶梯</div>
                    <p className="mt-1 max-w-3xl text-xs leading-5 text-white/55">
                      展示哪些动作只能本地先做、哪些已经签收资料、哪些真的可用。已记录资料不等于已经代办。
                    </p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-5 lg:min-w-[560px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] tracking-[0.12em] text-white/35">能力项</div>
                      <div className="mt-1 font-mono text-white">{commandProviderUnlockLadder.summary.capabilities}</div>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] tracking-[0.12em] text-white/35">可用</div>
                      <div className="mt-1 font-mono text-white">{commandProviderUnlockLadder.summary.providerHealthReady}</div>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] tracking-[0.12em] text-white/35">已签收</div>
                      <div className="mt-1 font-mono text-white">{commandProviderUnlockLadder.summary.setupEvidenceSigned}</div>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] tracking-[0.12em] text-white/35">阻断</div>
                      <div className="mt-1 font-mono text-white">{commandProviderUnlockLadder.summary.externalBlocked}</div>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] tracking-[0.12em] text-white/35">外部承诺</div>
                      <div className="mt-1 font-mono text-white">{commandProviderUnlockLadder.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {commandProviderUnlockLadder.items.map(item => (
                    <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-cyan-100/70">{formatRuntimeStatus(item.stage)}</span>
                        <span className="text-[10px] text-white/35">{item.setupEvidence.length ? '已签收' : '未签收'}</span>
                      </div>
                      <p className="mt-1 text-xs font-black text-white">{item.label}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/45">{item.nextAction}</p>
                      <p className="mt-1 truncate text-[11px] text-white/35" title={item.stillNeeds.join(' / ')}>
                        还缺：{item.stillNeeds.join(' / ') || 'none'}
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
              生成补资料向导
            </button>
            <button
              className="ml-2 mt-3 border border-fuchsia-200/60 px-3 py-2 text-xs font-black text-fuchsia-100 transition hover:bg-fuchsia-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={recordProviderSetupState}
              type="button"
            >
              保存补资料状态
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">外部解锁申请包</div>
                    <h4 className="mt-1 text-base font-black text-white">
                      {dispatchState.externalUnlockRequestPack.payloadShape}
                    </h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      {dispatchState.externalUnlockRequestPack.restaurant} / {dispatchState.externalUnlockRequestPack.offer}: 明确列出账号配置、门店授权、员工通道、回执凭证和 POS 汇总数据规则。
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
                      <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">账号配置</div>
                      <div className="mt-1 font-mono text-white">{dispatchState.externalUnlockRequestPack.summary.providerKeys}</div>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">店长授权</div>
                      <div className="mt-1 font-mono text-white">{dispatchState.externalUnlockRequestPack.summary.merchantAuthorizations}</div>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">外部代办</div>
                      <div className="mt-1 font-mono text-white">{dispatchState.externalUnlockRequestPack.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-[1.1fr_1fr_1fr]">
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">签收交付包</div>
                    <p className="mt-1 text-white/60">
                      {dispatchState.externalUnlockRequestPack.signoffChecklist.length} checklist items / {dispatchState.externalUnlockRequestPack.ownerHandoff.length} owner handoffs
                    </p>
                    <p className="mt-1 text-white/45">{dispatchState.externalUnlockRequestPack.acceptanceReceiptTemplate.title}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">验收字段</div>
                    <p className="mt-1 text-white/60">
                      {dispatchState.externalUnlockRequestPack.acceptanceReceiptTemplate.requiredFields.slice(0, 5).join(' / ')}
                    </p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">导出摘要</div>
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
                    <div className="text-white/45">服务端配置项</div>
                    {dispatchState.externalUnlockRequestPack.providerEnvKeys.slice(0, 6).map(item => (
                      <p className="mt-1 text-white/60" key={item.key}>{item.key}: {item.placeholder}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">店长授权</div>
                    {dispatchState.externalUnlockRequestPack.merchantAuthorizationPacket.slice(0, 4).map(item => (
                      <p className="mt-1 text-white/60" key={`${item.capability}-${item.proof}`}>{item.capability}: {item.ask}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">经营数据包</div>
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
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">AI 店员收件箱</div>
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
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">AI 店员收件箱</div>
                  <h4 className="mt-1 text-base font-black text-white">Wenai 门店操作员 · 等待首次刷新</h4>
                  <p className="mt-1 text-xs leading-5 text-white/55">
                    刷新中心 后会把主动作、店长任务、外部门禁和通知审计整理成主动消息。
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
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">员工通道清单</div>
                <h4 className="mt-1 text-base font-black text-white">对话指令、定时任务、待补资料</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  {commandChannelHub
                    ? `${commandChannelHub.payloadShape}: ${commandChannelHub.summary.channels} channels, ${commandChannelHub.summary.scheduledJobs} scheduled jobs, ${commandChannelHub.summary.missingExternalItems} external items.`
                    : '生成员工通道清单，把微信社群、企微、飞书、钉钉、短信和每日门店排班拆成可审核任务，不假装已经能外发。'}
                </p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-4 xl:min-w-[520px]">
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">可用渠道</div>
                  <div className="mt-1 font-mono text-white">{commandChannelHub?.summary.providerReadyChannels ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">交接</div>
                  <div className="mt-1 font-mono text-white">{commandChannelHub?.summary.internalHandoffChannels ?? 1}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">已排程</div>
                  <div className="mt-1 font-mono text-white">{commandChannelHub?.summary.scheduledJobs ?? 5}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">外部条目</div>
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
                  <span>送达尝试</span>
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
                  <span>排程运行</span>
                  <span>{formatRuntimeStatus(commandChannelScheduleRun.acceptance.verdict)}</span>
                  <span>{commandChannelScheduleRun.summary.attempted} attempted</span>
                  <span>{commandChannelScheduleRun.summary.blocked} blocked</span>
                  <span>{commandChannelScheduleRun.summary.retryRecommended} retry/recovery</span>
                </div>
                <div className="mt-2 grid gap-2 text-xs lg:grid-cols-4">
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">员工排班</div>
                    <div className="mt-1 font-mono text-white">{commandChannelScheduleRun.acceptance.canRunStaffSchedule ? '已运行' : '等待'}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">本地可做</div>
                    <div className="mt-1 font-mono text-white">{commandChannelScheduleRun.acceptance.internalActionsReady}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">待补资料</div>
                    <div className="mt-1 font-mono text-white">{commandChannelScheduleRun.acceptance.blockedProviderGates}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">下次唤醒</div>
                    <div className="mt-1 truncate font-mono text-white" title={commandChannelScheduleRun.acceptance.nextWakeupAt}>{commandChannelScheduleRun.acceptance.nextWakeupAt}</div>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 lg:grid-cols-2">
                  {commandChannelScheduleRun.cloudJobTable.slice(0, 4).map(item => (
                    <div className="border border-white/10 bg-white/[0.04] p-2" key={item.jobId}>
                      <div className="flex items-center justify-between gap-2 text-[10px] font-mono uppercase tracking-[0.12em] text-white/35">
                        <span>{item.status}</span>
                        <span>{item.channel} / {item.providerMode}</span>
                      </div>
                      <p className="mt-1 text-xs font-black text-white">{item.title}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/45">last: {item.lastRunAt || 'not run'} / next: {item.nextRunAt}</p>
                      <p className="mt-1 text-[10px] leading-4 text-white/35">duration: {item.durationMs ?? 'n/a'}ms / gate: {item.externalGate} / evidence: {item.evidenceRequired.slice(0, 2).join(' / ') || 'none'}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 lg:grid-cols-2">
                  {commandChannelScheduleRun.operatorTimeline.slice(0, 2).map(item => (
                    <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                      <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-white/35">{item.status} / {item.owner}</div>
                      <p className="mt-1 text-[11px] leading-4 text-white/45">{item.signal}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/45">{item.nextAction}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/45">
                  {commandChannelScheduleRun.acceptance.operatorCloseout.join(' / ')}
                </div>
              </div>
            ) : null}
            <button
              className="mt-3 border border-sky-200/60 px-3 py-2 text-xs font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildChannelHub}
              type="button"
            >
              生成员工通道清单
            </button>
            <button
              className="ml-2 mt-3 border border-sky-200/60 px-3 py-2 text-xs font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={attemptChannelDelivery}
              type="button"
            >
              尝试员工送达
            </button>
            <button
              className="ml-2 mt-3 border border-sky-200/60 px-3 py-2 text-xs font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={runChannelSchedule}
              type="button"
            >
              运行到期任务
            </button>
          </div>
          <div className="mt-4 grid gap-3 xl:grid-cols-[1.15fr_1.15fr_0.8fr]">
            <div className="border border-white/10 bg-white/[0.05] p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">下一步</div>
              <p className="mt-1 text-sm leading-6 text-white">{commandNextAction}</p>
              <p className="mt-2 text-xs leading-5 text-white/50">{commandEvidence}</p>
            </div>
            <div className="border border-teal-200/30 bg-teal-200/[0.06] p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-100/70">今日店长任务</div>
                  <p className="mt-1 text-sm font-black text-white">
                    {commandFollowupSummary
                      ? `today ${commandFollowupSummary.today} / blocked ${commandFollowupSummary.blocked}`
                      : '等待已验收回执'}
                  </p>
                </div>
                <button
                  className="shrink-0 border border-teal-200/60 px-2 py-1 text-xs font-black text-teal-100 transition hover:bg-teal-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={dispatchState.status === 'loading'}
                  onClick={buildStoreManagerFollowup}
                  type="button"
                >
                  生成任务包
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">主动巡检</div>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">通知交接</div>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">投递通道</div>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/70">通知审计</div>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/70">外部交接</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandTaskProviderHandoff.payloadShape} / packages {commandTaskProviderHandoff.summary.packages} / forwardable {commandTaskProviderHandoff.summary.forwardable} / blocked {commandTaskProviderHandoff.summary.blocked}
                    </p>
                    {(commandTaskProviderHandoff.packages[0] || commandTaskProviderHandoff.blockedPackages[0]) ? (
                      <p className="mt-1 text-[11px] leading-4 text-white/45">
                        {(commandTaskProviderHandoff.packages[0] || commandTaskProviderHandoff.blockedPackages[0]).status}: {(commandTaskProviderHandoff.packages[0] || commandTaskProviderHandoff.blockedPackages[0]).nextAction}
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] leading-4 text-white/45">
                        凭证审核后，把一个任务推进到“可交给外部试跑通道”的状态，并生成脱敏任务包。
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/70">回执收件箱</div>
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
                    <button
                      className="ml-2 mt-2 border border-cyan-200/50 px-2 py-1 text-[11px] font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={inspectProviderReceiptLifecycle}
                      type="button"
                    >
                      Receipt Lifecycle
                    </button>
                    <button
                      className="ml-2 mt-2 border border-amber-200/50 px-2 py-1 text-[11px] font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={inspectProviderKeyGapBoard}
                      type="button"
                    >
                      Key Gap Board
                    </button>
                  </div>
                ) : null}
                {commandProviderReceiptLifecycle ? (
                  <div className="border border-fuchsia-200/25 bg-fuchsia-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/70">回执生命周期</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandProviderReceiptLifecycle.payloadShape} / {formatRuntimeStatus(commandProviderReceiptLifecycle.verdict)} / accepted {commandProviderReceiptLifecycle.summary.acceptedReceipts} / waiting {commandProviderReceiptLifecycle.summary.waitingReceipts}
                    </p>
                    {commandProviderReceiptLifecycle.stages.slice(0, 3).map(stage => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={stage.id}>
                        {stage.status}: {stage.label} / {stage.nextAction}
                      </p>
                    ))}
                  </div>
                ) : null}
                {commandProviderKeyGapBoard ? (
                  <div className="border border-amber-200/25 bg-amber-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">账号资料缺口板</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandProviderKeyGapBoard.payloadShape} / keys {commandProviderKeyGapBoard.summary.configuredEnvKeys}/{commandProviderKeyGapBoard.summary.totalEnvKeys} / provider {commandProviderKeyGapBoard.summary.providerGated} / merchant {commandProviderKeyGapBoard.summary.merchantGated} / data {commandProviderKeyGapBoard.summary.dataGated}
                    </p>
                    {commandProviderKeyGapBoard.rows.slice(0, 3).map(row => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={row.id}>
                        {row.status}: {row.label} / {row.nextAction}
                      </p>
                    ))}
                  </div>
                ) : null}
                {commandProviderSandboxContract ? (
                  <div className="border border-lime-200/25 bg-lime-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/70">沙箱验收合同</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandProviderSandboxContract.payloadShape} / {formatRuntimeStatus(commandProviderSandboxContract.verdict)} / passed {commandProviderSandboxContract.summary.passed}/{commandProviderSandboxContract.summary.checks}
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
                    <button
                      className="ml-2 mt-2 border border-lime-200/50 px-2 py-1 text-[11px] font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={buildProviderSandboxSubmitWorkbench}
                      type="button"
                    >
                      Submit Workbench
                    </button>
                  </div>
                ) : null}
                {commandProviderSandboxSubmitWorkbench ? (
                  <div className="border border-orange-200/25 bg-orange-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-100/70">沙箱提交</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandProviderSandboxSubmitWorkbench.payloadShape} / {commandProviderSandboxSubmitWorkbench.targetRuntime} / ready {commandProviderSandboxSubmitWorkbench.summary.readyToSubmit} / blocked {commandProviderSandboxSubmitWorkbench.summary.blocked} / receipt {commandProviderSandboxSubmitWorkbench.summary.waitingReceipt}
                    </p>
                    {commandProviderSandboxSubmitWorkbench.submitPackages.slice(0, 2).map(item => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={item.capabilityId}>
                        {item.status}: {item.capabilityLabel} / {item.selectedPackageId || 'no package'} / {item.callback.header}
                      </p>
                    ))}
                    <button
                      className="mt-2 border border-orange-200/50 px-2 py-1 text-[11px] font-black text-orange-100 transition hover:bg-orange-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={() => runProviderSandboxSubmitAttempt(commandProviderSandboxSubmitWorkbench.submitPackages[0]?.capabilityId)}
                      type="button"
                    >
                      Run Submit Attempt
                    </button>
                    {commandProviderSandboxSubmitAttempt ? (
                      <p className="mt-2 border border-white/10 bg-stone-950/40 p-2 text-[11px] leading-4 text-white/55">
                        attempt: {formatRuntimeStatus(commandProviderSandboxSubmitAttempt.verdict)} / bridge {commandProviderSandboxSubmitAttempt.summary.bridgeStatus} / run {commandProviderSandboxSubmitAttempt.summary.runRecorded ? '已记录' : '未记录'}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {commandFirstForwardableRunPack ? (
                  <div className="border border-lime-200/25 bg-lime-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/70">首轮可转发试跑</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandFirstForwardableRunPack.payloadShape} / {formatRuntimeStatus(commandFirstForwardableRunPack.verdict)} / forwardable {commandFirstForwardableRunPack.summary.forwardable} / handoff-only {commandFirstForwardableRunPack.summary.handoffOnly}
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
                      可否代办: {commandFirstForwardableRunPack.summary.canClaimAutomation ? 'ready' : 'blocked'} / 回执: {commandFirstForwardableRunPack.selectedPackage?.callbackHeader || 'x-restaurant-agent-signature'}
                    </p>
                  </div>
                ) : null}
                {commandFirstRunControlTower ? (
                  <div className="border border-orange-200/25 bg-orange-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-100/70">首跑指挥台</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandFirstRunControlTower.payloadShape} / {formatRuntimeStatus(commandFirstRunControlTower.verdict)} / runs {commandFirstRunControlTower.summary.totalRuns} / waiting receipts {commandFirstRunControlTower.summary.waitingReceipts}
                    </p>
                    <div className="mt-2 grid gap-1">
                      {commandFirstRunControlTower.lanes.map(lane => (
                        <p className="text-[11px] leading-4 text-white/45" key={lane.id}>
                          {formatRuntimeStatus(lane.status)}: {formatRuntimeLabel(lane.label)} / {lane.owner} / {lane.nextAction}
                        </p>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] leading-4 text-white/35">
                      recovery: {commandFirstRunControlTower.summary.recoveryActions} / blocked lanes: {commandFirstRunControlTower.summary.blockedLanes} / claim: {commandFirstRunControlTower.summary.canClaimAutomation ? '就绪' : '受阻'}
                    </p>
                    <p className="mt-2 text-[11px] leading-4 text-white/35">
                      {commandFirstRunControlTower.safetyBoundary}
                    </p>
                  </div>
                ) : null}
                {commandProviderLaunchTrainingPack ? (
                  <div className="border border-amber-200/25 bg-amber-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">真实代办启动训练包</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandProviderLaunchTrainingPack.payloadShape} / {formatRuntimeStatus(commandProviderLaunchTrainingPack.verdict)} / ready {commandProviderLaunchTrainingPack.summary.ready}/{commandProviderLaunchTrainingPack.summary.tracks}
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">平台连接器清单</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandPlatformConnectorMatrix.payloadShape} / {formatRuntimeStatus(commandPlatformConnectorMatrix.verdict)} / env {commandPlatformConnectorMatrix.summary.configuredEnvKeys}/{commandPlatformConnectorMatrix.summary.totalEnvKeys}
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
                      经营边界报告
                    </button>
                  </div>
                ) : null}
                {commandAiOsAuditReport ? (
                  <div className="border border-violet-200/25 bg-violet-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/70">门店经营边界报告</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {commandAiOsAuditReport.payloadShape} / {formatRuntimeStatus(commandAiOsAuditReport.verdict)} / lanes {commandAiOsAuditReport.summary.lanes}
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
                运行试跑
              </button>
              <button
                className="border border-amber-200/70 px-3 py-2 text-sm font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={dispatchState.status === 'loading'}
                onClick={inspectExecutionTimeline}
                type="button"
              >
                打开时间线
              </button>
              <button
                className="border border-teal-200/60 px-3 py-2 text-sm font-black text-teal-100 transition hover:bg-teal-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={dispatchState.status === 'loading'}
                onClick={buildExternalExecutionWizard}
                type="button"
              >
                查看补资料条件
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
                经营边界报告
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-2 border border-white/10 bg-white/[0.04] p-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">指令内容</div>
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
              刷新中心
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">客户经营路径</p>
              <h3 className="mt-1 text-lg font-black">客户默认只走 6 步：资料、试跑、刷新、时间线、店长跟进、外部缺口</h3>
            </div>
            <p className="max-w-2xl text-xs leading-5 text-white/55">
              这条路径对应真实餐饮经营动作；专家工具仍保留在下方折叠区，用于接 runtime、授权、训练和审计。
            </p>
          </div>
          <div className="mt-4 border border-cyan-200/25 bg-cyan-200/[0.05] p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-[10px] font-semibold tracking-[0.14em] text-cyan-100/70">第一次试跑路径</div>
                <h4 className="mt-1 text-base font-black text-white">先跑一张门店工单，再看高级工具</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  点击一次生成门店简报、可执行任务、负责人队列、店长交接、补资料清单和凭证边界，让老板先看到今天能做什么。
                </p>
              </div>
              <button
                className="border border-cyan-200 bg-cyan-200 px-4 py-3 text-left text-sm font-black text-stone-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={dispatchState.status === 'loading'}
                onClick={buildClawExperienceDefaultPath}
                type="button"
              >
                从这里开始
                <span className="mt-1 block text-[10px] font-semibold tracking-[0.14em] text-stone-700">生成第一张工单</span>
              </button>
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-4">
              {[
                {
                  label: '任务能力包',
                  value: dispatchState.clawSkillWorkbench ? `${dispatchState.clawSkillWorkbench.summary.runnableNow} 项可先做` : '生成可执行任务',
                  note: '菜单、内容、社群和门店运营任务',
                },
                {
                  label: '负责人队列',
                  value: commandTaskQueue ? `${commandTaskQueue.summary.open} 项待处理` : '生成负责人队列',
                  note: '负责人、凭证、下一步和停止线',
                },
                {
                  label: '店长交接',
                  value: commandStaffNotificationHandoff ? `${commandStaffNotificationHandoff.summary.copyReady} 条话术就绪` : '生成交接话术',
                  note: '不带顾客隐私的店长可读消息',
                },
                {
                  label: '补资料条件',
                  value: commandProviderSetupPack
                    ? `${commandProviderSetupPack.summary.missing} 项待补`
                    : commandTaskProviderHandoff
                      ? `${commandTaskProviderHandoff.summary.blocked} 项未解锁`
                      : '列出账号和表格',
                  note: '账号确认、回执、经营汇总和数据边界',
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
                需要店长确认：活动规则、菜品证明、目标客群、渠道选择、禁用说法和门店负责人审批。
              </div>
              <div className="border border-rose-200/15 bg-rose-200/[0.03] p-2 text-rose-100/65">
                代办解锁表：只有账号确认、回填凭证、经营汇总和数据边界都齐了，才进入真实发布、核销或经营分析。
              </div>
            </div>
            <div className="mt-3 border border-sky-200/20 bg-sky-200/[0.04] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-sky-100/65">门店任务助手首页</div>
                  <p className="mt-1 text-xs font-black text-white">老板先看一张工单，高级工具放下面。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  客户只看到一个门店任务助手：生成建议、安排今日任务、准备发布凭证、跟进到店线索，并列出还缺哪些资料。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2 md:col-span-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">状态</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.clawCloudOperatorHome?.hero.status || '点击后生成'}</div>
                  <p className="mt-1 text-[11px] leading-4 text-white/45">{dispatchState.clawCloudOperatorHome?.hero.promise || '点击“从这里开始”，围绕当前门店任务生成助手首页。'}</p>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">可先做</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.clawCloudOperatorHome?.summary.readyInternal ?? '生成后显示'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">待复核</div>
                  <div className="mt-1 text-xs font-black text-amber-100/75">{dispatchState.clawCloudOperatorHome?.summary.needsReview ?? '生成后显示'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">待补资料</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.clawCloudOperatorHome?.summary.providerGated ?? '生成后显示'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">可否代办</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.clawCloudOperatorHome?.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-5">
                {(dispatchState.clawCloudOperatorHome?.lanes || [
                  { id: 'ask-ai-employee', label: '生成门店建议', status: 'ready-internal', owner: '门店任务助手', customerPromise: '先从一个可执行建议开始。', actionNow: '生成第一份经营简报。', visibleProof: '门店记忆和任务队列', externalNeeded: [], stopLine: '无授权不做外部动作。' },
                  { id: 'run-shift', label: '安排今日任务', status: 'ready-internal', owner: '店长', customerPromise: '安排开店、营业巡检和收盘复盘。', actionNow: '分配第一条店长任务。', visibleProof: '负责人队列', externalNeeded: [], stopLine: '不偷偷改收银或核销数据。' },
                  { id: 'provider-unlock', label: '补齐代办条件', status: 'provider-gated', owner: '技术复核', customerPromise: '资料齐全后才解锁真实代办。', actionNow: '收集账号确认、回填凭证和经营汇总。', visibleProof: '签收回执', externalNeeded: ['账号确认'], stopLine: '没有已验收凭证，不承诺代办完成。' },
                ]).slice(0, 5).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{item.label}</span>
                      <span className={item.status === 'ready-internal' ? 'text-[10px] text-emerald-100/70' : item.status === 'needs-review' ? 'text-[10px] text-amber-100/70' : item.status === 'data-gated' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-sky-100/55">{item.owner}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{item.actionNow}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">proof: {item.visibleProof}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                <p className="border border-white/10 bg-stone-950/45 p-2 text-[11px] leading-4 text-sky-100/60">
                  助手简报：{dispatchState.clawCloudOperatorHome?.aiEmployeeBrief.slice(0, 3).join(' / ') || '点击后生成'}
                </p>
                <p className="border border-white/10 bg-stone-950/45 p-2 text-[11px] leading-4 text-white/55">
                  负责人队列：{dispatchState.clawCloudOperatorHome?.ownerQueue.slice(0, 3).join(' / ') || '店长第一条任务、凭证槽和下一步'}
                </p>
                <p className="border border-white/10 bg-stone-950/45 p-2 text-[11px] leading-4 text-rose-100/60">
                  待补资料：{dispatchState.clawCloudOperatorHome?.providerQueue.slice(0, 3).join(' / ') || '账号确认 / 回填凭证 / 经营汇总'}
                </p>
              </div>
            </div>
            <div className="mt-3 border border-lime-200/20 bg-lime-200/[0.04] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-lime-100/65">店长可转发简报</div>
                  <p className="mt-1 text-xs font-black text-white">一页交接给店长、运营和技术复核。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  点击后生成客户可转发简报：今日工单、负责人动作、凭证状态、补资料要求、数据边界和停止线放在一个包里。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">可转发</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.defaultPathForwardableBrief?.summary.canForwardToStoreManager ? 'ready' : '点击后生成'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">可先做</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.defaultPathForwardableBrief?.summary.internalReady ?? '生成后显示'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">店长复核</div>
                  <div className="mt-1 text-xs font-black text-amber-100/75">{dispatchState.defaultPathForwardableBrief?.summary.merchantReview ?? '生成后显示'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">待补资料</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.defaultPathForwardableBrief?.summary.providerBlocked ?? '生成后显示'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">真实分析</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.defaultPathForwardableBrief?.summary.canClaimTrueOperatingAnalysis ? '就绪' : '受阻'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.defaultPathForwardableBrief?.todayOperatingOrder || [
                  { id: 'confirm-offer', owner: '商户', status: 'needs-merchant-review', title: '确认门店活动和停止线', action: '点击“从这里开始”，生成店长可转发简报。', proofRequired: '店长确认过的活动简报' },
                  { id: 'run-internal-pack', owner: '运营', status: 'ready-now', title: '生成本地工作包', action: '生成内容计划、凭证槽、负责人队列和交接话术。', proofRequired: '第一张工单' },
                  { id: 'provider-unlock', owner: '技术复核', status: 'needs-provider', title: '补齐真实代办条件', action: '收集账号确认、回填凭证、经营汇总和店长授权。', proofRequired: '账号确认和签收回执' },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{item.title}</span>
                      <span className={item.status === 'ready-now' ? 'text-[10px] text-emerald-100/70' : item.status === 'needs-merchant-review' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-lime-100/55">{item.owner}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{item.action}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">proof: {item.proofRequired}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-2">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">店长转发文案</div>
                  <p className="mt-1 whitespace-pre-line text-[11px] leading-4 text-white/60">{dispatchState.defaultPathForwardableBrief?.shareText || '点击后生成：店长能直接看到第一条任务、凭证要求和补资料边界，不用读技术面板。'}</p>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">还缺什么</div>
                  <p className="mt-1 text-[11px] leading-4 text-rose-100/60">{dispatchState.defaultPathForwardableBrief?.externalRequired.slice(0, 5).join(' / ') || '账号确认 / 回填凭证 / 店长授权 / 经营汇总表'}</p>
                  <p className="mt-2 text-[11px] leading-4 text-white/35">{dispatchState.defaultPathForwardableBrief?.stopLines[0] || '没有已验收凭证，不承诺外部代办已经完成。'}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 border border-amber-200/15 bg-amber-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-amber-100/65">补资料清单</div>
                  <p className="mt-1 text-xs font-black text-white">第一张工单会同时生成账号确认、资料补齐和签收清单。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  客户不需要先找高级工具：一次生成门店资料缺口、店长授权、负责人签收项和凭证模板。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-4">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">待补条件</div>
                  <div className="mt-1 text-xs font-black text-amber-100/75">{commandProviderSetupPack ? `${commandProviderSetupPack.summary.missing} 项待补` : '点击后生成'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">服务端配置项</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">
                    {dispatchState.providerSetupPack?.envTemplate.length ?? commandProviderSetupPack?.priorityRequests.filter(item => item.source === 'env').length ?? '仅服务端'}
                  </div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">签收项</div>
                  <div className="mt-1 text-xs font-black text-cyan-100/75">{commandExternalUnlockRequestPack ? commandExternalUnlockRequestPack.signoffChecklist.length : '点击后生成'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">真实代办</div>
                  <div className="mt-1 text-xs font-black text-white">{commandExternalUnlockRequestPack?.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                <div className="border border-white/10 bg-stone-950/45 p-3">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">商户交接文案</div>
                  <div className="mt-2 grid gap-2">
                    {(commandProviderSetupPack?.copyForMerchant || commandExternalUnlockRequestPack?.customerHandoffCopy || [
                      '点击后生成：面向客户解释今天能先做什么，哪些动作需要补授权或凭证',
                    ]).slice(0, 3).map(item => (
                      <p className="border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/60" key={item}>{item}</p>
                    ))}
                  </div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">负责人签收队列</div>
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
                      <p className="text-[11px] leading-4 text-white/40">点击后生成</p>
                    )}
                  </div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-3">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">回执和导出摘要</div>
                  <p className="mt-2 text-[11px] leading-4 text-white/60">
                    {commandExternalUnlockRequestPack?.acceptanceReceiptTemplate.title || '点击后生成代办验收回执模板。'}
                  </p>
                  <p className="mt-2 text-[11px] leading-4 text-cyan-100/60">
                    必填：{commandExternalUnlockRequestPack?.acceptanceReceiptTemplate.requiredFields.slice(0, 4).join(' / ') || '事项编号 / 渠道 / 凭证链接 / 执行记录'}
                  </p>
                  <p className="mt-2 text-[11px] leading-4 text-white/40">
                    导出：{commandExternalUnlockRequestPack ? `markdown ${commandExternalUnlockRequestPack.exportDigest.markdown.length} chars / csv ${commandExternalUnlockRequestPack.exportDigest.csv.split('\n').length - 1} rows` : '点击后生成 markdown + csv'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 border border-white/10 bg-white/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">能力对齐快照</div>
                  <p className="mt-1 text-xs font-black text-white">现在先跑本地工单，真实代办等凭证齐全后再开。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  这样能守住承诺边界：今天先准备、排队、记忆和复盘；真实发布、线索承接、核销和实时分析需要平台账号与门店授权。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-4">
                {[
                  { label: '可先做', value: '任务包 / 队列 / 记忆', tone: 'text-emerald-100/70' },
                  { label: '待训练', value: '商户确认样例', tone: 'text-amber-100/70' },
                  { label: '待补账号', value: '发布 / 线索 / 核销', tone: 'text-rose-100/70' },
                  { label: '待补数据', value: '收银 / 券 / 会员分析', tone: 'text-sky-100/70' },
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
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-emerald-100/65">常驻门店任务板</div>
                  <p className="mt-1 text-xs font-black text-white">第一张工单会打开今日任务板：任务主控、营业节奏、记忆提醒和待补资料。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  它把早班简报、午市巡检、晚市发布窗口、收盘复盘和记忆跟进放在一页；外部动作等凭证齐全后再执行。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">常驻模式</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.residentAgentMissionControl?.mode || '点击后生成'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">可做事项</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.residentAgentMissionControl ? `${dispatchState.residentAgentMissionControl.summary.readyLanes}/${dispatchState.residentAgentMissionControl.summary.lanes}` : '任务事项'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">营业判断</div>
                  <div className="mt-1 text-xs font-black text-white">{commandShiftOperatingLoopPack?.verdict || '点击后生成'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">记忆提醒</div>
                  <div className="mt-1 text-xs font-black text-violet-100/75">{commandAiEmployeeMemoryPack?.summary.nextWakeups ?? '点击后生成'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">外部承诺</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{commandShiftOperatingLoopPack?.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.residentAgentMissionControl?.lanes || [
                  { id: 'command', status: 'waiting-evidence', owner: '运营', promise: '把商户输入变成一张有边界的门店经营任务。', nextAction: '点击“从这里开始”生成第一张任务板。' },
                  { id: 'browser', status: 'needs-provider', owner: '技术复核', promise: '真实外部操作只走确认过的操作清单。', nextAction: '补齐账号确认、回填凭证、店长授权和经营汇总。' },
                  { id: 'memory', status: 'waiting-evidence', owner: '门店任务助手', promise: '只记住已验收凭证、负责人和可复用经营上下文。', nextAction: '先生成已验收凭证，再写入记忆。' },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs text-white">{item.id}</span>
                      <span className={item.status === 'ready' || item.status === 'complete' ? 'text-[10px] text-emerald-100/70' : item.status === 'needs-provider' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-sky-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{item.promise}</p>
                    <p className="mt-1 text-[11px] leading-4 text-emerald-100/55">next: {item.nextAction}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">营业任务</div>
                  <p className="mt-1 text-[11px] leading-4 text-white/60">
                    {commandShiftAutopilotRun ? `${commandShiftAutopilotRun.summary.acceptedInternalActions} 个本地动作 / ${commandShiftAutopilotRun.summary.createdStoreManagerTasks} 个店长任务 / ${commandShiftAutopilotRun.summary.providerHeldActions} 个待补资料` : '点击后生成：一轮有边界的营业任务、店长动作和待补资料'}
                  </p>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">下一步经营动作</div>
                  <p className="mt-1 text-[11px] leading-4 text-white/60">{commandShiftOperatingLoopPack?.nextBestAction.label || '先跑今日任务，补回执，再训练下一轮。'}</p>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">记忆规则</div>
                  <p className="mt-1 text-[11px] leading-4 text-white/60">{commandAiEmployeeMemoryPack?.safetyBoundary || '只记住已确认事实、负责人、凭证要求和下次提醒；不保存密钥、私聊、个人信息或收银明细。'}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 border border-emerald-200/15 bg-emerald-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-emerald-100/65">本地试跑回执</div>
                  <p className="mt-1 text-xs font-black text-white">第一张工单会同时生成一份本地试跑回执。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  它只验证本地回执、任务状态和经营信号链路；不会登录、发布、核销，也不会冒充真实经营结果。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">判断</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.controlledTrialRun?.verdict || '点击后生成'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">回执</div>
                  <div className="mt-1 text-xs font-black text-cyan-100/75">{dispatchState.controlledTrialRun?.simulation.callback.signatureVerified ? '已验证' : '待定'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">回执</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.controlledTrialRun?.simulation.receipt.status || 'created on start'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">试跑健康</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.controlledTrialRun?.runHealth.summary.accepted ?? 0} accepted</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">经营信号</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.controlledTrialRun?.businessSignals.summary.visitIntent ?? 0} visit intent</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.controlledTrialRun?.operatorCloseout || [
                  { owner: 'restaurant-ops', action: '点击后生成：复核已验收的本地回执，再决定下一步补资料动作。', evidence: '本地试跑回执' },
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
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-sky-100/65">受控浏览器试跑</div>
                  <p className="mt-1 text-xs font-black text-white">第一张工单会先准备受控浏览器操作清单，真实外部动作等资料齐全后再执行。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  这一栏只整理允许动作、截图规则、回执要求和阻断原因；不保存 cookies、token、私信或收银明细。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">入口</div>
                  <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.browserGatewayPack?.canExecuteNow ? '就绪' : '受阻'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">允许动作</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.browserGatewayPack?.browserRequest.acceptedActions.length ?? '点击后生成'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">执行循环</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.runtimeRunnerLoopPack?.verdict || '点击后生成'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">等待回执</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.runtimeRunnerLoopPack?.summary.waitingReceipts ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">执行记录</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.runtimeRunnerLoopPack?.summary.runnerEvents ?? 0}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.browserGatewayPack?.actionSchema || [
                  { action: 'open_public_page', allowed: false, requiredEvidence: ['点击后生成'], stopIf: ['待补资料未齐'] },
                  { action: 'capture_public_proof', allowed: false, requiredEvidence: ['screenshot id'], stopIf: ['private data visible'] },
                  { action: 'send_signed_receipt', allowed: false, requiredEvidence: ['x-restaurant-agent-signature'], stopIf: ['callback secret missing'] },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.action}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-sky-100/70">{item.action}</span>
                      <span className={item.allowed ? 'text-[10px] text-emerald-100/70' : 'text-[10px] text-rose-100/70'}>{item.allowed ? '允许' : '受阻'}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">proof: {item.requiredEvidence.slice(0, 2).join(' / ')}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">stop: {item.stopIf.slice(0, 2).join(' / ')}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-sky-100/55">
                下一步浏览器动作：{dispatchState.runtimeRunnerLoopPack?.nextBestAction || '先补账号确认、回填凭证、独立浏览器环境和店长授权，再执行外部页面动作。'}
              </p>
            </div>
            <div className="mt-3 border border-violet-200/15 bg-violet-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-violet-100/65">发布任务收件箱</div>
                  <p className="mt-1 text-xs font-black text-white">第一张工单会把发布、受控浏览器、回执、异常恢复和门店记忆整理成一个执行队列。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  这里不是宣称已自动发布，而是给运营看：先内部准备，资料齐全后再代办，回填凭证后才复盘或写入记忆。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">判断</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.publishExecutionInbox?.verdict || '先补资料'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">任务</div>
                  <div className="mt-1 text-xs font-black text-violet-100/75">{dispatchState.publishExecutionInbox?.summary.tasks ?? 6}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">可先做</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.publishExecutionInbox?.summary.readyInternal ?? 1}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">等凭证</div>
                  <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.publishExecutionInbox?.summary.waitingProof ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">发布代办</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.publishExecutionInbox?.summary.canClaimAutoPublish ? '就绪' : '受阻'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">浏览器代办</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.publishExecutionInbox?.summary.canClaimBrowserExecution ? '就绪' : '待补'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.publishExecutionInbox?.tasks || [
                  { id: 'prepare-publish-package', title: '准备发布包和凭证槽', status: 'ready-internal', owner: '运营', lane: '发布', action: '准备已确认内容、目标渠道和回填凭证槽。', evidenceRequired: ['已确认内容', '目标渠道'], stopLine: '凭证未验收前，不说已经发布。' },
                  { id: 'submit-browser-runner', title: '提交受控浏览器任务', status: 'waiting-provider', owner: '技术复核', lane: '受控浏览器', action: '补账号确认、回填凭证、独立环境和店长授权。', evidenceRequired: ['操作记录', '环境检查'], stopLine: '遇到登录挑战、验证码或私信页立即停止。' },
                  { id: 'recover-failed-run', title: '处理阻断或失败任务', status: 'blocked', owner: '技术复核', lane: '异常恢复', action: '凭证没有回来时，走人工兜底和失败恢复。', evidenceRequired: ['阻断原因', '重试记录'], stopLine: '最多重试两次，不能自动循环平台动作。' },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{item.title}</span>
                      <span className={item.status === 'ready-internal' || item.status === 'done' ? 'text-[10px] text-emerald-100/70' : item.status === 'waiting-proof' ? 'text-[10px] text-sky-100/70' : item.status === 'waiting-provider' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-violet-100/55">{item.owner} / {item.lane}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{item.action}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">凭证：{item.evidenceRequired.slice(0, 2).join(' / ')}</p>
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
                      <span className={item.allowed ? 'text-[10px] text-emerald-100/70' : 'text-[10px] text-rose-100/70'}>{item.allowed ? '允许' : '受阻'}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-violet-100/55">写入：{item.writesTo}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">停止：{item.stopIf.slice(0, 2).join(' / ')}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-violet-100/55">
                异常恢复：{(dispatchState.publishExecutionInbox?.failureRecovery || [
                  { nextStep: '先补账号确认、回填凭证、独立浏览器环境和店长授权，再执行外部页面动作。' },
                  { nextStep: '如果凭证没有回来，走人工兜底并导入公开证明。' },
                ]).slice(0, 3).map(item => item.nextStep).join(' / ')}
              </p>
            </div>
            <div className="mt-3 border border-orange-200/15 bg-orange-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-orange-100/65">代办验收工作台</div>
                  <p className="mt-1 text-xs font-black text-white">第一张工单会把账号确认、店长授权、浏览器环境、回填凭证、数据边界和试跑回执整理成验收清单。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  这是从本地工单走向真实代办的客户可见桥梁：每个外部动作都要有凭证，才从阻断进入可试跑。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">判断</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.providerAcceptanceWorkbench?.verdict || '待补资料'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">已通过</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.providerAcceptanceWorkbench?.summary.passed ?? 0}/{dispatchState.providerAcceptanceWorkbench?.summary.stages ?? 7}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">资料</div>
                  <div className="mt-1 text-xs font-black text-orange-100/75">{dispatchState.providerAcceptanceWorkbench?.summary.setupCompletionPercent ?? dispatchState.providerSetupWizard?.summary.completionPercent ?? 0}%</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">可用性</div>
                  <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.providerAcceptanceWorkbench?.summary.readinessScore ?? dispatchState.providerReadinessHealth?.summary.readinessScore ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">试跑</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.providerAcceptanceWorkbench?.summary.canRunSandbox ? '就绪' : '受阻'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">外部承诺</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.providerAcceptanceWorkbench?.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-4">
                {(dispatchState.providerAcceptanceWorkbench?.stages || [
                  { id: 'runtime', label: '受控执行环境和服务端配置', status: 'blocked', owner: '技术复核', nextAction: '配置一个可用的执行环境，再复核可用性。', evidenceRequired: ['环境地址', '服务端配置名'], stopLine: '不要在页面里粘贴或返回密钥值。' },
                  { id: 'callback', label: '签名回执和凭证格式', status: 'blocked', owner: '技术复核', nextAction: '在页面外配置回执签名，再验收代办完成。', evidenceRequired: ['签名配置', '签名校验'], stopLine: '未签名回执和私密 payload 必须拒收。' },
                  { id: 'merchant-auth', label: '门店平台授权', status: 'blocked', owner: '商户', nextAction: '先收集第一个渠道的门店授权。', evidenceRequired: ['平台授权', '允许动作'], stopLine: '公开门店资料不等于商户授权。' },
                  { id: 'operating-data', label: '收银、券、会员和财务数据边界', status: 'blocked', owner: '数据复核', nextAction: '真实分析前先确认字段字典。', evidenceRequired: ['字段字典', '无隐私样例'], stopLine: '不接收收银明细、支付编号或顾客标识。' },
                ]).slice(0, 4).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{item.label}</span>
                      <span className={item.status === 'passed' ? 'text-[10px] text-emerald-100/70' : item.status === 'needs-evidence' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-orange-100/55">{item.owner}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{item.nextAction}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">凭证：{item.evidenceRequired.slice(0, 2).join(' / ')}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/50">{item.stopLine}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-5">
                {(dispatchState.providerAcceptanceWorkbench?.capabilityAcceptanceMatrix || [
                  { id: 'auto-publish-proof', label: '代发布和凭证回收', sandboxStatus: 'needs-provider', productionClaim: 'blocked-until-accepted-receipts', firstSandboxAction: '先提交一份已审核的公开平台凭证包。', requiredProviderKeys: ['试跑通道账号', '回执密钥'], merchantGrantRequired: ['平台授权'], dataContractRequired: ['只收发布链接或截图编号'], receiptRequired: ['外部试跑编号', '签名回执'], currentEvidence: [], nextAction: '先拿到限定范围的平台授权，再做沙箱发布凭证。', stopLine: '回执没验收，不宣称代发布。' },
                  { id: 'auto-lead-acquisition', label: '代接线索', sandboxStatus: 'needs-provider', productionClaim: 'blocked-until-accepted-receipts', firstSandboxAction: '先回传预约/领券/咨询/到店意向的汇总数量。', requiredProviderKeys: ['线索通道账号'], merchantGrantRequired: ['线索导出授权'], dataContractRequired: ['线索汇总数量'], receiptRequired: ['来源渠道', '签名回执'], currentEvidence: [], nextAction: '先让店长确认线索汇总导出。', stopLine: '不读私信原文。' },
                  { id: 'auto-coupon-redemption', label: '代核销券码', sandboxStatus: 'needs-data-contract', productionClaim: 'blocked-until-accepted-receipts', firstSandboxAction: '先提交一份券码/核销汇总导入。', requiredProviderKeys: ['POS/券码通道账号'], merchantGrantRequired: ['券码后台导出授权'], dataContractRequired: ['couponClaimCount', 'redemptionCount'], receiptRequired: ['汇总批次编号'], currentEvidence: [], nextAction: '先收齐券码/POS 字段表。', stopLine: '不写核销、不存券码。' },
                  { id: 'true-operating-analysis', label: '真实经营分析', sandboxStatus: 'needs-data-contract', productionClaim: 'blocked-until-accepted-receipts', firstSandboxAction: '先用 POS 汇总字段出一份经营报告。', requiredProviderKeys: ['POS/导出通道账号'], merchantGrantRequired: ['POS/导出授权'], dataContractRequired: ['orders', 'grossSales'], receiptRequired: ['已验收的汇总导入'], currentEvidence: [], nextAction: '先接入脱敏经营汇总数据。', stopLine: '没有数据约定，不宣称真实分析。' },
                  { id: 'staff-delivery', label: '员工任务下发', sandboxStatus: 'needs-provider', productionClaim: 'blocked-until-accepted-receipts', firstSandboxAction: '先发一条只给员工的任务通知。', requiredProviderKeys: ['员工通道 webhook'], merchantGrantRequired: ['员工接收名单'], dataContractRequired: ['任务编号', '负责人'], receiptRequired: ['员工确认'], currentEvidence: [], nextAction: '先配置员工通知通道。', stopLine: '不触达顾客。' },
                ]).slice(0, 5).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{item.label}</span>
                      <span className={item.sandboxStatus === 'ready-to-submit' ? 'text-[10px] text-emerald-100/70' : item.sandboxStatus === 'needs-receipt' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.sandboxStatus)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-orange-100/55">{item.firstSandboxAction}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">账号配置: {item.requiredProviderKeys.slice(0, 2).join(' / ') || '无'}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">店长授权: {item.merchantGrantRequired.slice(0, 2).join(' / ') || '无'}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">回执要求: {item.receiptRequired.slice(0, 2).join(' / ') || '无'}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{item.nextAction}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/50">{item.stopLine}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-orange-100/55">
                交给执行方的资料: {(dispatchState.providerAcceptanceWorkbench?.providerHandOffCopy || [
                  '只发配置凭证、授权范围、回执字段和汇总数据约定。',
                  '不发密钥和顾客数据。',
                ]).slice(0, 4).join(' / ')}
              </p>
              <div className="mt-3 border border-emerald-200/15 bg-emerald-200/[0.035] p-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/65">沙箱就绪板</div>
                    <p className="mt-1 text-xs font-black text-white">一眼看清每条链路：能否提交、缺什么凭证、回执要求和负责人。</p>
                    <p className="mt-1 text-[11px] leading-4 text-emerald-100/55">结论: {formatRuntimeStatus(dispatchState.providerSandboxReadinessBoard?.verdict || 'blocked-provider-setup')}</p>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">沙箱状态</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.providerSandboxReadinessBoard?.summary.canSubmitSandboxNow ? '可提交' : '受阻'}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">能力</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.providerSandboxReadinessBoard?.summary.capabilities ?? 5}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">可提交</div>
                    <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.providerSandboxReadinessBoard?.summary.readyToSubmit ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">外部资料</div>
                    <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.providerSandboxReadinessBoard?.summary.blockedProvider ?? 3}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">数据</div>
                    <div className="mt-1 text-xs font-black text-violet-100/75">{dispatchState.providerSandboxReadinessBoard?.summary.blockedData ?? 2}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">等待</div>
                    <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.providerSandboxReadinessBoard?.summary.waitingReceipt ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">可否代办</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.providerSandboxReadinessBoard?.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-5">
                  {(dispatchState.providerSandboxReadinessBoard?.rows || [
                    { capabilityId: 'auto-publish-proof', label: '代发布和凭证回收', status: 'blocked-provider', owner: 'ops', submitAllowed: false, selectedPackageId: 'pending', endpointEnv: 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL + /tasks', callbackRequired: ['external-receipt', 'x-restaurant-agent-signature'], evidenceRequired: ['外部试跑编号', '公开凭证链接'], missing: ['试跑通道地址/账号', '店长平台授权', '回执密钥'], nextAction: '先配置试跑通道、店长授权和回执，再提交。', stopLine: '回执没验收，不宣称代发布。' },
                    { capabilityId: 'auto-lead-acquisition', label: '代接线索', status: 'blocked-provider', owner: 'merchant', submitAllowed: false, selectedPackageId: 'pending', endpointEnv: 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL + /tasks', callbackRequired: ['external-receipt'], evidenceRequired: ['线索汇总数量'], missing: ['线索导出授权'], nextAction: '只批汇总导出，不带私信原文。', stopLine: '不读私信。' },
                    { capabilityId: 'auto-coupon-redemption', label: '代核销券码', status: 'blocked-data-contract', owner: 'data-ops', submitAllowed: false, selectedPackageId: 'pending', endpointEnv: 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL + /tasks', callbackRequired: ['external-receipt'], evidenceRequired: ['核销汇总批次编号'], missing: ['couponClaimCount', 'redemptionCount', '字段表'], nextAction: '先收齐券码/POS 字段表和去隐私汇总样例。', stopLine: '不收券码和原始 POS 行。' },
                    { capabilityId: 'true-operating-analysis', label: '真实经营分析', status: 'blocked-data-contract', owner: 'data-ops', submitAllowed: false, selectedPackageId: 'pending', endpointEnv: 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL + /tasks', callbackRequired: ['external-receipt'], evidenceRequired: ['已验收的汇总导入'], missing: ['orders', 'grossSales', '毛利字段'], nextAction: '先接入 POS、券码、会员和财务汇总字段。', stopLine: '没有数据约定，不宣称真实分析。' },
                    { capabilityId: 'staff-delivery', label: '员工任务下发', status: 'blocked-provider', owner: 'ops', submitAllowed: false, selectedPackageId: 'pending', endpointEnv: 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL + /tasks', callbackRequired: ['external-receipt'], evidenceRequired: ['员工确认'], missing: ['员工通道 webhook', '接收名单'], nextAction: '先配置员工通知通道和接收名单。', stopLine: '不触达顾客。' },
                  ]).slice(0, 5).map(row => (
                    <div className="border border-white/10 bg-stone-950/45 p-2" key={row.capabilityId}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{row.label}</span>
                        <span className={row.submitAllowed || row.status === 'accepted' ? 'text-[10px] text-emerald-100/70' : row.status === 'waiting-receipt' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{row.submitAllowed ? '可提交' : formatRuntimeStatus(row.status)}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-emerald-100/55">负责人: {row.owner} / 任务包: {row.selectedPackageId || '未选'}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">提交接口（服务端配置项）: {row.endpointEnv}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">回执要求: {row.callbackRequired.slice(0, 2).join(' / ')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">还缺: {row.missing.slice(0, 3).join(' / ') || '无'}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/55">{row.nextAction}</p>
                    </div>
                  ))}
                </div>
                {dispatchState.providerSandboxReadinessBoard?.firstRunnable ? (
                  <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-emerald-100/65">
                    第一条可跑链路: {dispatchState.providerSandboxReadinessBoard.firstRunnable.packageId} / {dispatchState.providerSandboxReadinessBoard.firstRunnable.action}
                  </p>
                ) : (
                  <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-rose-100/55">
                    first runnable: blocked until provider keys, merchant grant, callback and data-contract evidence are accepted.
                  </p>
                )}
              </div>
              <div className="mt-3 border border-lime-200/15 bg-lime-200/[0.035] p-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/65">沙箱试跑台</div>
                    <p className="mt-1 text-xs font-black text-white">提交后在一条时间线里看执行事件、签名回执、验收、收尾和记忆写入资格。</p>
                    <p className="mt-1 text-[11px] leading-4 text-lime-100/55">verdict: {formatRuntimeStatus(dispatchState.providerSandboxRunConsole?.verdict || 'blocked-before-submit')}</p>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">收尾</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.providerSandboxRunConsole?.summary.canCloseoutRun ? '就绪' : '等待'}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">已完成</div>
                    <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.providerSandboxRunConsole?.summary.done ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">就绪</div>
                    <div className="mt-1 text-xs font-black text-lime-100/75">{dispatchState.providerSandboxRunConsole?.summary.ready ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">等待</div>
                    <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.providerSandboxRunConsole?.summary.waiting ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">受阻</div>
                    <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.providerSandboxRunConsole?.summary.blocked ?? 4}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">执行事件</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.providerSandboxRunConsole?.summary.runnerEvents ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">记忆</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.providerSandboxRunConsole?.summary.canWriteMemory ? '允许' : '受阻'}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {(dispatchState.providerSandboxRunConsole?.timeline || [
                    { id: 'readiness', label: 'Sandbox readiness decision', status: 'blocked', owner: 'ops', evidence: ['missing provider setup'], nextAction: 'Complete provider setup before sandbox submit.', stopLine: 'No submit without accepted setup evidence.' },
                    { id: 'submit-package', label: 'Sanitized submit package selected', status: 'blocked', owner: 'ops', evidence: ['package:none'], nextAction: 'Build safe provider package.', stopLine: 'No secrets or private data in payload.' },
                    { id: 'signed-callback', label: 'Signed external receipt callback', status: 'waiting', owner: 'runtime-admin', evidence: ['waitingReceipts:0'], nextAction: 'Require signed callback before closeout.', stopLine: 'Unsigned callbacks never close the run.' },
                  ]).slice(0, 6).map(step => (
                    <div className="border border-white/10 bg-stone-950/45 p-2" key={step.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{step.label}</span>
                        <span className={step.status === 'done' || step.status === 'ready' ? 'text-[10px] text-emerald-100/70' : step.status === 'waiting' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(step.status)}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-lime-100/55">owner: {step.owner}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">evidence: {step.evidence.slice(0, 3).join(' / ')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/55">{step.nextAction}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-lime-100/55">
                  callback: {dispatchState.providerSandboxRunConsole?.providerCallbackContract.header || 'x-restaurant-agent-signature'} / evidence {(dispatchState.providerSandboxRunConsole?.providerCallbackContract.acceptedEvidence || ['eventId', 'externalRunId', 'operator summary']).slice(0, 4).join(' / ')}
                </p>
              </div>
              <div className="mt-3 border border-cyan-200/15 bg-cyan-200/[0.035] p-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/65">沙箱提交工作台</div>
                    <p className="mt-1 text-xs font-black text-white">每条对标能力都有脱敏提交包、回执要求、回执预期和恢复负责人。</p>
                  </div>
                  <button
                    className="border border-cyan-200/40 px-3 py-2 text-[11px] font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={dispatchState.status === 'loading'}
                    onClick={buildProviderSandboxSubmitWorkbench}
                    type="button"
                  >
                    Build Submit Workbench
                  </button>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">能力</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.providerSandboxSubmitWorkbench?.summary.capabilities ?? 5}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">就绪</div>
                    <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.providerSandboxSubmitWorkbench?.summary.readyToSubmit ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">受阻</div>
                    <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.providerSandboxSubmitWorkbench?.summary.blocked ?? 5}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">等回执</div>
                    <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.providerSandboxSubmitWorkbench?.summary.waitingReceipt ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">可否代办</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.providerSandboxSubmitWorkbench?.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-5">
                  {(dispatchState.providerSandboxSubmitWorkbench?.submitPackages || [
                    { capabilityId: 'auto-publish-proof', capabilityLabel: '代发布和凭证回收', targetRuntime: 'openclaw', status: 'blocked-provider', selectedPackageId: 'pending', callback: { header: 'x-restaurant-agent-signature' }, receiptExpectation: ['外部试跑编号', '公开凭证链接'], recoveryOwner: 'ops', nextAction: '先配置试跑通道、店长授权和回执，再提交。', stopLine: '回执没验收，不宣称代发布。', submitEndpointShape: { endpointEnv: 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL + /tasks' } },
                    { capabilityId: 'auto-lead-acquisition', capabilityLabel: '代接线索', targetRuntime: 'openclaw', status: 'blocked-provider', selectedPackageId: 'pending', callback: { header: 'x-restaurant-agent-signature' }, receiptExpectation: ['汇总数量', '负责人'], recoveryOwner: 'merchant', nextAction: '只批汇总导出，不带私信原文。', stopLine: '不读私信。', submitEndpointShape: { endpointEnv: 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL + /tasks' } },
                    { capabilityId: 'auto-coupon-redemption', capabilityLabel: '代核销券码', targetRuntime: 'openclaw', status: 'blocked-data-contract', selectedPackageId: 'pending', callback: { header: 'x-restaurant-agent-signature' }, receiptExpectation: ['核销汇总批次编号'], recoveryOwner: 'data-ops', nextAction: '先收齐券码/POS 字段表和去隐私汇总样例。', stopLine: '不收券码和原始 POS 行。', submitEndpointShape: { endpointEnv: 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL + /tasks' } },
                    { capabilityId: 'true-operating-analysis', capabilityLabel: '真实经营分析', targetRuntime: 'openclaw', status: 'blocked-data-contract', selectedPackageId: 'pending', callback: { header: 'x-restaurant-agent-signature' }, receiptExpectation: ['已验收的汇总导入'], recoveryOwner: 'data-ops', nextAction: '先接入 POS、券码、会员和财务汇总字段。', stopLine: '没有数据约定，不宣称真实分析。', submitEndpointShape: { endpointEnv: 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL + /tasks' } },
                    { capabilityId: 'staff-delivery', capabilityLabel: '员工任务下发', targetRuntime: 'openclaw', status: 'blocked-provider', selectedPackageId: 'pending', callback: { header: 'x-restaurant-agent-signature' }, receiptExpectation: ['员工确认'], recoveryOwner: 'ops', nextAction: '先配置员工通知通道和接收名单。', stopLine: '不触达顾客。', submitEndpointShape: { endpointEnv: 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL + /tasks' } },
                  ]).slice(0, 5).map(item => (
                    <div className="border border-white/10 bg-stone-950/45 p-2" key={item.capabilityId}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{item.capabilityLabel}</span>
                        <span className={item.status === 'ready-to-submit' || item.status === 'accepted' ? 'text-[10px] text-emerald-100/70' : item.status === 'waiting-receipt' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-cyan-100/55">试跑通道: {item.targetRuntime} / {item.submitEndpointShape.endpointEnv}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">任务包: {item.selectedPackageId || '未选'}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">回执签名头: {item.callback.header}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">回执要求: {item.receiptExpectation.slice(0, 2).join(' / ')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/55">{item.nextAction}</p>
                      <p className="mt-1 text-[11px] leading-4 text-rose-100/50">{item.stopLine}</p>
                      <button
                        className="mt-2 border border-cyan-200/40 px-2 py-1 text-[11px] font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={dispatchState.status === 'loading'}
                        onClick={() => runProviderSandboxSubmitAttempt(item.capabilityId)}
                        type="button"
                      >
                        尝试提交
                      </button>
                    </div>
                  ))}
                </div>
                {dispatchState.providerSandboxSubmitAttempt ? (
                  <div className="mt-3 border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">最近一次尝试</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      {dispatchState.providerSandboxSubmitAttempt.payloadShape} / {formatRuntimeStatus(dispatchState.providerSandboxSubmitAttempt.verdict)} / bridge {dispatchState.providerSandboxSubmitAttempt.summary.bridgeStatus} / run {dispatchState.providerSandboxSubmitAttempt.summary.runRecorded ? '已记录' : '未记录'}
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-orange-100/55">{dispatchState.providerSandboxSubmitAttempt.recoveryNextAction}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">receipt: {dispatchState.providerSandboxSubmitAttempt.receiptExpectation.callbackHeader} / {dispatchState.providerSandboxSubmitAttempt.receiptExpectation.acceptedEvidence.slice(0, 3).join(' / ')}</p>
                  </div>
                ) : null}
                <div className="mt-3 border border-amber-200/15 bg-amber-200/[0.035] p-3">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/65">真实代办解锁板</div>
                      <p className="mt-1 text-xs font-black text-white">把竞品级自动化拆成还缺的账号配置、门店授权、数据规则和已验收回执。</p>
                    </div>
                    <button
                      className="border border-amber-200/40 px-3 py-2 text-[11px] font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={inspectProviderKeyGapBoard}
                      type="button"
                    >
                      Build Key Gap Board
                    </button>
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-5">
                    <div className="border border-white/10 bg-stone-950/45 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">能力</div>
                      <div className="mt-1 text-xs font-black text-white">{dispatchState.providerKeyGapBoard?.summary.capabilities ?? 7}</div>
                    </div>
                    <div className="border border-white/10 bg-stone-950/45 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">服务端配置</div>
                      <div className="mt-1 text-xs font-black text-amber-100/75">{dispatchState.providerKeyGapBoard ? `${dispatchState.providerKeyGapBoard.summary.configuredEnvKeys}/${dispatchState.providerKeyGapBoard.summary.totalEnvKeys}` : '0/12'}</div>
                    </div>
                    <div className="border border-white/10 bg-stone-950/45 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">外部资料</div>
                      <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.providerKeyGapBoard?.summary.providerGated ?? 4}</div>
                    </div>
                    <div className="border border-white/10 bg-stone-950/45 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">店长侧</div>
                      <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.providerKeyGapBoard?.summary.merchantGated ?? 1}</div>
                    </div>
                    <div className="border border-white/10 bg-stone-950/45 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">对标宣称</div>
                      <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.providerKeyGapBoard?.summary.canClaimCompetitorParity ? '就绪' : '受阻'}</div>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 lg:grid-cols-3">
                    {(dispatchState.providerKeyGapBoard?.rows || [
                      { id: 'persistent-browser-runner', label: '常驻浏览器代办', status: 'provider-gated', owner: 'runtime-admin', requiredEnvKeys: ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', 'RESTAURANT_AGENT_OPENCLAW_API_KEY'], nextAction: '先配置一条试跑通道地址、账号和回执密钥。' },
                      { id: 'auto-publish', label: '代发布', status: 'merchant-gated', owner: 'merchant', requiredEnvKeys: ['RESTAURANT_AGENT_BROWSER_PROFILE_ID'], nextAction: '先从一个平台、一条发布凭证链路开始。' },
                      { id: 'true-operating-analysis', label: '真实经营分析', status: 'data-gated', owner: 'data-ops', requiredEnvKeys: ['RESTAURANT_POS_DATA_MODE', 'RESTAURANT_POS_FIELD_DICTIONARY'], nextAction: '先导入一份脱敏 POS/核销样例。' },
                    ]).slice(0, 6).map(row => (
                      <div className="border border-white/10 bg-stone-950/45 p-2" key={row.id}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-white">{row.label}</span>
                          <span className={row.status === 'internal-ready' ? 'text-[10px] text-emerald-100/70' : row.status === 'data-gated' ? 'text-[10px] text-violet-100/70' : 'text-[10px] text-amber-100/70'}>{formatRuntimeStatus(row.status)}</span>
                        </div>
                        <p className="mt-1 text-[11px] leading-4 text-amber-100/55">{row.owner}</p>
                        <p className="mt-1 text-[11px] leading-4 text-white/35">keys: {row.requiredEnvKeys.slice(0, 2).join(' / ') || 'none'}</p>
                        <p className="mt-1 text-[11px] leading-4 text-white/55">{row.nextAction}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 border border-fuchsia-200/15 bg-fuchsia-200/[0.035] p-3">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/65">签名回执生命周期</div>
                      <p className="mt-1 text-xs font-black text-white">外部代办执行有一条从回执到收尾的状态链，签名回执、校验、经营信号、试跑复盘和记忆写入规则。</p>
                    </div>
                    <button
                      className="border border-fuchsia-200/40 px-3 py-2 text-[11px] font-black text-fuchsia-100 transition hover:bg-fuchsia-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={inspectProviderReceiptLifecycle}
                      type="button"
                    >
                      生成回执生命周期
                    </button>
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-5">
                    <div className="border border-white/10 bg-stone-950/45 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">结论</div>
                      <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.providerReceiptLifecycle?.verdict || 'blocked-before-callback')}</div>
                    </div>
                    <div className="border border-white/10 bg-stone-950/45 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">已验收</div>
                      <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.providerReceiptLifecycle?.summary.acceptedReceipts ?? 0}</div>
                    </div>
                    <div className="border border-white/10 bg-stone-950/45 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">等待</div>
                      <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.providerReceiptLifecycle?.summary.waitingReceipts ?? 0}</div>
                    </div>
                    <div className="border border-white/10 bg-stone-950/45 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">记忆</div>
                      <div className="mt-1 text-xs font-black text-white">{dispatchState.providerReceiptLifecycle?.summary.canWriteMemory ? '允许' : '受阻'}</div>
                    </div>
                    <div className="border border-white/10 bg-stone-950/45 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">可否代办</div>
                      <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.providerReceiptLifecycle?.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 lg:grid-cols-3">
                    {(dispatchState.providerReceiptLifecycle?.stages || [
                      { id: 'submit', label: '沙箱提交已记录', status: 'waiting', owner: 'ops', evidence: ['暂无试跑记录'], nextAction: '先跑一次受控的沙箱提交。', stopLine: '没有试跑记录，就不宣称外部已执行。' },
                      { id: 'callback', label: '已收到签名回执', status: 'blocked', owner: 'runtime-admin', evidence: ['waiting:0'], nextAction: '验收前必须有签名头 x-restaurant-agent-signature 和外部试跑编号。', stopLine: '未签名回执一律拒收。' },
                      { id: 'validation', label: '回执校验', status: 'waiting', owner: 'ops', evidence: ['暂无已校验回执'], nextAction: '收集公开链接、截图编号或签名的外部试跑编号。', stopLine: '未通过校验的回执不进经营分析。' },
                    ]).slice(0, 6).map(stage => (
                      <div className="border border-white/10 bg-stone-950/45 p-2" key={stage.id}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-white">{stage.label}</span>
                          <span className={stage.status === 'done' ? 'text-[10px] text-emerald-100/70' : stage.status === 'waiting' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(stage.status)}</span>
                        </div>
                        <p className="mt-1 text-[11px] leading-4 text-fuchsia-100/55">{stage.owner}</p>
                        <p className="mt-1 text-[11px] leading-4 text-white/35">evidence: {stage.evidence.slice(0, 2).join(' / ')}</p>
                        <p className="mt-1 text-[11px] leading-4 text-white/55">{stage.nextAction}</p>
                        <p className="mt-1 text-[11px] leading-4 text-rose-100/50">{stage.stopLine}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 border border-amber-200/15 bg-amber-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/65">资料就绪阶梯</div>
                  <p className="mt-1 text-xs font-black text-white">第一次试跑路径会明确标出哪些能力本地可做，哪些还需要账号、授权或回执。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  这是代发布凭证、代接线索、券码核销、经营分析、常驻浏览器任务和门店记忆跟进的解锁路径，外部条件没就绪前不假装已上线。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">能力</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.providerUnlockLadder?.summary.capabilities ?? 6}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">健康就绪</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.providerUnlockLadder?.summary.providerHealthReady ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">资料已签收</div>
                  <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.providerUnlockLadder?.summary.setupEvidenceSigned ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">外部受阻</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.providerUnlockLadder?.summary.externalBlocked ?? dispatchState.providerLaunchBoard?.summary.missingProvider ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">可否代办</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.providerUnlockLadder?.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.providerUnlockLadder?.items || [
                  { id: 'persistent-browser', label: '外部浏览器试跑通道', stage: 'external-blocked', internalCanDo: '生成受控任务包、异常恢复流程和凭证要求。', nextAction: '通过服务端配置外部试跑通道地址、账号和回执密钥。', stillNeeds: ['试跑通道地址/账号和回执密钥'] },
                  { id: 'auto-publish-proof', label: '代发布和凭证回收', stage: 'external-blocked', internalCanDo: '可先准备渠道文案、员工清单和凭证台账，不宣称已发布。', nextAction: '提供限定范围的平台授权和签名凭证回执。', stillNeeds: ['店长平台授权'] },
                  { id: 'operating-analysis', label: '真实经营分析', stage: 'external-blocked', internalCanDo: '把观察判断和可量化的经营信号分开。', nextAction: '提供脱敏 POS、券码和核销数据规则。', stillNeeds: ['脱敏 POS/券码字段表'] },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{item.label}</span>
                      <span className={item.stage === 'provider-health-ready' ? 'text-[10px] text-emerald-100/70' : item.stage === 'setup-evidence-signed' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.stage)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">internal: {item.internalCanDo}</p>
                    <p className="mt-1 text-[11px] leading-4 text-amber-100/55">next: {item.nextAction}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-amber-100/55">
                外部条件: {(dispatchState.providerUnlockLadder?.nextExternalAsks || dispatchState.providerLaunchBoard?.externalRequired || ['试跑通道地址/账号', '门店平台授权', '签名回执密钥', 'POS/券汇总数据规则']).slice(0, 5).join(' / ')}
              </p>
              <div className="mt-3 border border-sky-200/15 bg-sky-200/[0.035] p-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/65">外部接入指南</div>
                    <p className="mt-1 text-xs font-black text-white">补资料清单会按负责人、要补什么、解锁什么、凭证和停止线整理给店长。</p>
                  </div>
                  <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                    不把技术配置丢给客户，只说明谁补哪份资料、补齐后能解锁哪类门店动作。
                  </p>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-stone-950/45 p-2 md:col-span-2">
                    <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">说明</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/60">{dispatchState.externalAccessGuide?.answerForCustomer || '点击后生成：先跑本地门店助手，再按账号确认、凭证回填、经营数据和员工通道逐步解锁。'}</p>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">步骤</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.externalAccessGuide?.summary.steps ?? 5}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">完成度</div>
                    <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.externalAccessGuide?.summary.setupCompletionPercent ?? dispatchState.providerSetupWizard?.summary.completionPercent ?? 0}%</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">沙箱</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.externalAccessGuide?.summary.canStartSandbox ? '可检查' : '受阻'}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">可否代办</div>
                    <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.externalAccessGuide?.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-5">
                  {(dispatchState.externalAccessGuide?.steps || [
                    { id: 'runtime', title: '连接一个隔离外部试跑通道', owner: 'runtime-admin', status: 'provider-gated', customerAsk: '在服务端配置试跑通道地址、账号和隔离环境。', providerAsk: ['试跑通道地址/账号'], unlocks: ['外部浏览器试跑通道'], acceptanceEvidence: ['试跑通道检查通过'], nextAction: '配置试跑通道和回执密钥。', stopLine: '没有已验收回执，不执行真实外部动作。' },
                    { id: 'merchant-grants', title: 'Sign merchant platform grants', owner: 'merchant', status: 'provider-gated', customerAsk: 'Approve allowed platform actions and proof type.', providerAsk: ['merchant authorization'], unlocks: ['publish proof', 'lead receipt'], acceptanceEvidence: ['platform grant'], nextAction: 'Collect scoped merchant authorization.', stopLine: 'Public context is not authorization.' },
                    { id: 'operating-data', title: 'Approve POS, coupon and operating data contract', owner: 'data-ops', status: 'data-gated', customerAsk: 'Provide aggregate field dictionary and no-PII sample.', providerAsk: ['POS/coupon field dictionary'], unlocks: ['true operating analysis'], acceptanceEvidence: ['aggregate import'], nextAction: 'Import sanitized aggregate data.', stopLine: 'No raw POS rows or payment ids.' },
                  ]).slice(0, 5).map(item => (
                    <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{item.title}</span>
                        <span className={item.status === 'ready-to-check' ? 'text-[10px] text-emerald-100/70' : item.status === 'missing-evidence' ? 'text-[10px] text-sky-100/70' : item.status === 'data-gated' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-sky-100/55">{item.owner}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/55">{item.customerAsk}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">unlocks: {item.unlocks.slice(0, 2).join(' / ')}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-rose-100/55">
                  已脱敏: {(dispatchState.externalAccessGuide?.redactedFields || ['api keys', 'cookies', 'browser profile ids', 'private message text', 'customer PII', 'raw POS rows']).slice(0, 6).join(' / ')}
                </p>
              </div>
            </div>
            <div className="mt-3 border border-emerald-200/15 bg-emerald-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/65">门店能力覆盖图</div>
                  <p className="mt-1 text-xs font-black text-white">默认路径覆盖门店 AI 产品面：公开主页、内容、发布凭证、线索承接、券码核销和经营分析。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  It separates internal workbench value from Provider-required lanes across Dianping/Meituan, Xiaohongshu, Douyin, WeChat community, POS/coupon systems and persistent runtime.
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">连接器</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.platformConnectorMatrix?.summary.connectors ?? 7}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">本地可做</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.platformConnectorMatrix?.summary.internalReady ?? 1}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">需要外部资料</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.platformConnectorMatrix?.summary.providerRequired ?? dispatchState.platformConnectorMatrix?.summary.blocked ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">服务端配置</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.platformConnectorMatrix ? `${dispatchState.platformConnectorMatrix.summary.configuredEnvKeys}/${dispatchState.platformConnectorMatrix.summary.totalEnvKeys}` : '0/required'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">结论</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.platformConnectorMatrix?.verdict || 'provider-setup-required')}</div>
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
                试点顺序: {(dispatchState.platformConnectorMatrix?.pilotOrder || ['先做公开门店资料录入和本地内容草稿。', '为沙箱提交配置一条浏览器试跑通道和回执密钥。', '补一份 POS/核销汇总样例后再宣称经营分析。']).slice(0, 3).join(' / ')}
              </p>
            </div>
            <div className="mt-3 border border-cyan-200/15 bg-cyan-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/65">门店数据导入中心</div>
                  <p className="mt-1 text-xs font-black text-white">默认路径已对齐真实门店数据源：公开主页、发布凭证、预约、券码核销、POS 销售、会员、库存和毛利。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  这是真实经营分析背后的数据主干，每个数据源都有负责人、标准字段、样例行、禁止字段、下一步和外部边界。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">结论</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.storeDataImportCenter?.verdict || 'provider-gated')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">来源</div>
                  <div className="mt-1 text-xs font-black text-cyan-100/75">{dispatchState.storeDataImportCenter?.summary.sources ?? 8}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">已映射字段</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.storeDataImportCenter?.summary.mappedFields ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">缺必填</div>
                  <div className="mt-1 text-xs font-black text-amber-100/75">{dispatchState.storeDataImportCenter?.summary.missingRequiredFields ?? 'field map'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">样例行</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.storeDataImportCenter?.sampleRows.length ?? dispatchState.posImport?.summary.validRows ?? 'created on start'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">真实分析</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.storeDataImportCenter?.summary.canClaimTrueOperatingAnalysis ? '就绪' : '受阻'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-4">
                {(dispatchState.storeDataImportCenter?.sources || [
                  { id: 'coupon-redemption', label: 'Coupon claim and redemption export', status: 'sample-ready', owner: 'data-ops', nextAction: 'Map claim/redemption fields from merchant export.', acceptedInputs: ['couponClaimCount', 'redemptionCount'], forbiddenInputs: ['coupon code', 'payment id'] },
                  { id: 'pos-sales', label: 'POS sales and order aggregate', status: 'sample-ready', owner: 'data-ops', nextAction: 'Import sanitized POS aggregate rows.', acceptedInputs: ['grossSales', 'orderCount'], forbiddenInputs: ['raw order rows', 'payment id'] },
                  { id: 'member-retention', label: 'Member and community retention aggregate', status: 'provider-gated', owner: 'data-ops', nextAction: 'Define privacy-safe segment exports with the merchant.', acceptedInputs: ['segmentName', 'followupCount'], forbiddenInputs: ['phone', 'WeChat ID'] },
                  { id: 'finance-margin', label: 'Finance, margin and discount guardrail', status: 'provider-gated', owner: 'finance', nextAction: 'Collect merchant-approved aggregate cost fields before recommending discount scale.', acceptedInputs: ['ingredientCost', 'platformFee'], forbiddenInputs: ['bank account', 'payment transaction id'] },
                ]).slice(0, 4).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{item.label}</span>
                      <span className={item.status === 'sample-ready' || item.status === 'ready-internal' ? 'text-[10px] text-emerald-100/70' : item.status === 'needs-field-mapping' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-cyan-100/55">{item.owner}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{item.nextAction}</p>
                    <p className="mt-1 text-[11px] leading-4 text-emerald-100/50">accepts: {item.acceptedInputs.slice(0, 2).join(' / ')}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/50">rejects: {item.forbiddenInputs.slice(0, 2).join(' / ')}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.storeDataImportCenter?.validationQueue || [
                  { id: 'field-dictionary', owner: 'data-ops', priority: 'today', action: 'Confirm canonical fields, source headers, time grain and definitions.', evidenceRequired: 'merchant-approved field dictionary', stopLine: 'Do not import raw order rows or customer identifiers.' },
                  { id: 'sample-import', owner: 'store-manager', priority: 'today', action: 'Upload or paste a sanitized aggregate sample.', evidenceRequired: 'accepted sample row', stopLine: 'No true operating analysis claim before validation.' },
                  { id: 'provider-data-contract', owner: 'runtime-admin', priority: 'blocked', action: 'Collect Provider/API or browser-runner data contract.', evidenceRequired: 'authorization and callback receipt', stopLine: 'No auto redemption or POS write without Provider proof.' },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white">{item.owner}</span>
                      <span className={item.priority === 'blocked' ? 'text-[10px] text-rose-100/70' : item.priority === 'today' ? 'text-[10px] text-emerald-100/70' : 'text-[10px] text-amber-100/70'}>{item.priority}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/60">{item.action}</p>
                    <p className="mt-1 text-[11px] leading-4 text-cyan-100/50">proof: {item.evidenceRequired}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/45">{item.stopLine}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-cyan-100/55">
                next: {dispatchState.storeDataImportCenter?.nextBestAction.label || 'Confirm POS Definitions'} / external: {(dispatchState.storeDataImportCenter?.externalRequired || ['merchant-approved field dictionary', 'POS/coupon data source', 'finance export or owner cost sheet']).slice(0, 4).join(' / ')}
              </p>
            </div>
            <div className="mt-3 border border-sky-200/15 bg-sky-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/65">线索收件箱</div>
                  <p className="mt-1 text-xs font-black text-white">默认路径把预约、领券、私域咨询、到店意向和差评挽回收进一个受控线索队列。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  Auto lead capture and customer contact stay blocked until merchant authorization, channel provider, callback receipts and no-PII data contracts are configured.
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">结论</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.leadCaptureInbox?.verdict || 'provider-unlock-first')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">信号</div>
                  <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.leadCaptureInbox?.summary.aggregateSignals ?? dispatchState.businessSignals?.summary.visitIntent ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">线索条目</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.leadCaptureInbox?.summary.leadItems ?? 5}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">今日</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.leadCaptureInbox?.summary.todayItems ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">代接线索</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.leadCaptureInbox?.summary.canClaimAutoLeadCapture ? '就绪' : '受阻'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">顾客触达</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.leadCaptureInbox?.summary.canClaimAutoCustomerContact ? '就绪' : '受阻'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-5">
                {(dispatchState.leadCaptureInbox?.sources || [
                  { id: 'reservation', label: 'Reservation and waitlist intent', status: 'provider-gated', signalCount: 0, nextAction: 'Import sanitized reservation aggregate before routing table intent.' },
                  { id: 'coupon-claim', label: 'Coupon and group-buy claims', status: 'provider-gated', signalCount: 0, nextAction: 'Collect coupon rule proof and aggregate claim count.' },
                  { id: 'private-domain-inquiry', label: 'Private-domain inquiry summary', status: 'provider-gated', signalCount: 0, nextAction: 'Keep as manual summary until staff channel provider is configured.' },
                  { id: 'visit-intent', label: 'Visit intent from public proof', status: 'needs-evidence', signalCount: 0, nextAction: 'Collect public proof or accepted receipt before claiming visit intent.' },
                  { id: 'review-recovery', label: '差评触发的服务恢复', status: 'needs-evidence', signalCount: 0, nextAction: '先生成口碑收尾包，再做差评驱动的跟进。' },
                ]).slice(0, 5).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{item.label}</span>
                      <span className={item.status === 'internal-ready' ? 'text-[10px] text-emerald-100/70' : item.status === 'needs-evidence' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
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
            <div className="mt-3 border border-indigo-200/15 bg-indigo-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-100/65">线索承接工作台</div>
                  <p className="mt-1 text-xs font-black text-white">默认路径把线索承接变成可验收的外部对接路径，覆盖预约、领券、私域咨询、到店意向和差评挽回。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  This is the execution bridge for auto-acquisition parity: internal staff tasks now, automatic capture/contact only after merchant grants, signed callbacks, no-PII contracts and staff approval.
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">结论</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.leadAcquisitionProviderWorkbench?.verdict || 'provider-setup-required')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">链路</div>
                  <div className="mt-1 text-xs font-black text-indigo-100/75">{dispatchState.leadAcquisitionProviderWorkbench?.summary.lanes ?? 5}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">通过阶段</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.leadAcquisitionProviderWorkbench?.summary.passedStages ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">外部阶段</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.leadAcquisitionProviderWorkbench?.summary.providerStages ?? 'gated'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">回执</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.leadAcquisitionProviderWorkbench?.summary.callbackReady ? '就绪' : '受阻'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">自动触达</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.leadAcquisitionProviderWorkbench?.summary.canClaimAutoCustomerContact ? '就绪' : '受阻'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-5">
                {(dispatchState.leadAcquisitionProviderWorkbench?.lanes || [
                  { id: 'reservation', label: 'Reservation and waitlist capture', status: 'provider-gated', owner: 'store-manager', signalCount: 0, firstRunnableTask: 'Create a staff-reviewed capacity check before any reservation reply.' },
                  { id: 'coupon-claim', label: 'Coupon and group-buy lead capture', status: 'provider-gated', owner: 'ops', signalCount: 0, firstRunnableTask: 'Confirm coupon rules and aggregate claims before redemption follow-up.' },
                  { id: 'private-domain', label: 'Private-domain inquiry follow-up', status: 'blocked', owner: 'community-ops', signalCount: 0, firstRunnableTask: 'Classify aggregate inquiry themes and draft approved replies for staff send.' },
                  { id: 'visit-intent', label: 'Public visit-intent capture', status: 'provider-gated', owner: 'store-manager', signalCount: 0, firstRunnableTask: 'Turn public proof into service-prep and next-loop content tasks.' },
                  { id: 'review-recovery', label: 'Review-led recovery follow-up', status: 'provider-gated', owner: 'runtime-admin', signalCount: 0, firstRunnableTask: 'Assign recovery owner and approved reply draft before platform response.' },
                ]).slice(0, 5).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{item.label}</span>
                      <span className={item.status === 'sample-ready' || item.status === 'internal-ready' ? 'text-[10px] text-emerald-100/70' : item.status === 'blocked' ? 'text-[10px] text-rose-100/70' : 'text-[10px] text-amber-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-indigo-100/55">{item.owner} / signals {item.signalCount}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/50">{item.firstRunnableTask}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.leadAcquisitionProviderWorkbench?.operatorQueue || [
                  { id: 'lead-provider-reservation', owner: 'merchant', priority: 'blocked', action: 'Collect merchant authorization for reservation, coupon, private-domain or review source.', evidenceRequired: 'platform grant / allowed source list', providerRequired: ['reservation provider API or export'] },
                  { id: 'lead-provider-callback', owner: 'runtime-admin', priority: 'blocked', action: 'Configure callback secret and receipt schema before provider execution.', evidenceRequired: 'signed lead receipt', providerRequired: ['RESTAURANT_AGENT_CALLBACK_SECRET'] },
                  { id: 'lead-provider-private-domain', owner: 'runtime-admin', priority: 'blocked', action: 'Use manual aggregate summaries until messaging provider and no-PII contract are accepted.', evidenceRequired: 'no-PII private-domain data contract', providerRequired: ['WeCom/WeChat/SMS provider'] },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white">{item.owner}</span>
                      <span className={item.priority === 'blocked' ? 'text-[10px] text-rose-100/70' : item.priority === 'today' ? 'text-[10px] text-emerald-100/70' : 'text-[10px] text-amber-100/70'}>{item.priority}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/60">{item.action}</p>
                    <p className="mt-1 text-[11px] leading-4 text-indigo-100/50">proof: {item.evidenceRequired}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/45">provider: {item.providerRequired.slice(0, 2).join(' / ') || 'none'}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-indigo-100/55">
                acceptance: {dispatchState.leadAcquisitionProviderWorkbench?.providerAcceptanceContract.callbackAction || 'lead-acquisition-receipt'} / forbidden: {(dispatchState.leadAcquisitionProviderWorkbench?.providerAcceptanceContract.forbiddenPayloadFields || ['phone', 'WeChat ID', 'raw private message', 'coupon code']).slice(0, 5).join(' / ')}
              </p>
            </div>
            <div className="mt-3 border border-cyan-200/15 bg-cyan-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/65">线索沙箱验收流</div>
                  <p className="mt-1 text-xs font-black text-white">外部提交有一条受控路径：脱敏任务包、签名线索回执、失败回执恢复、员工审核和只进汇总的记忆门槛。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  This is how the product gets closer to auto-acquisition without faking it: no customer contact, member enrichment or memory write until accepted proof exists.
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">结论</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.leadSandboxAcceptanceFlow?.verdict || 'waiting-provider-setup')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">提交</div>
                  <div className="mt-1 text-xs font-black text-cyan-100/75">{dispatchState.leadSandboxAcceptanceFlow?.summary.canSubmitProviderPackage ? '就绪' : '受阻'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">回执</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.leadSandboxAcceptanceFlow?.summary.acceptedLeadReceipts ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">恢复</div>
                  <div className="mt-1 text-xs font-black text-amber-100/75">{dispatchState.leadSandboxAcceptanceFlow?.recoveryPlan.length ?? 3}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">记忆</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.leadSandboxAcceptanceFlow?.leadMemoryGate.status || 'waiting-receipt'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">代获客</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.leadSandboxAcceptanceFlow?.summary.canClaimAutoAcquisition ? '就绪' : '受阻'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.leadSandboxAcceptanceFlow?.stages || [
                  { id: 'sanitized-package', label: 'Sanitized lead provider package', status: 'passed', owner: 'ops', evidence: ['aggregate fields only'], nextAction: 'Send only aggregate source counts, owner tasks and proof ids.', stopLine: 'No PII, private messages, coupon codes or raw profiles.' },
                  { id: 'signed-lead-receipt', label: 'Signed lead receipt acceptance', status: 'waiting-proof', owner: 'runtime-admin', evidence: ['no accepted lead receipt'], nextAction: 'Import a signed lead-acquisition receipt.', stopLine: 'Unsigned receipts cannot unlock memory writes.' },
                  { id: 'memory-write-boundary', label: 'Aggregate lead memory write', status: 'waiting-proof', owner: 'data-ops', evidence: ['accepted receipt required'], nextAction: 'Wait for accepted receipt before writing memory.', stopLine: 'Never write raw customer identity into memory.' },
                ]).slice(0, 6).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{item.label}</span>
                      <span className={item.status === 'passed' ? 'text-[10px] text-emerald-100/70' : item.status === 'blocked' ? 'text-[10px] text-rose-100/70' : 'text-[10px] text-amber-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-cyan-100/55">{item.owner} / {item.evidence.slice(0, 2).join(' / ')}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/50">{item.nextAction}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/45">{item.stopLine}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-2">
                <div className="border border-white/10 bg-white/[0.04] p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">脱敏任务包</div>
                  <p className="mt-1 font-mono text-[11px] leading-4 text-cyan-100/60">
                    {dispatchState.leadSandboxAcceptanceFlow?.sanitizedProviderPackage.packageId || 'lead-sandbox-package'} / {dispatchState.leadSandboxAcceptanceFlow?.sanitizedProviderPackage.callbackAction || 'lead-acquisition-receipt'}
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-white/45">
                    lanes: {(dispatchState.leadSandboxAcceptanceFlow?.sanitizedProviderPackage.lanes || []).map(item => item.id).slice(0, 5).join(' / ') || 'reservation / coupon-claim / private-domain / visit-intent / review-recovery'}
                  </p>
                </div>
                <div className="border border-white/10 bg-white/[0.04] p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">记忆门槛</div>
                  <p className="mt-1 font-mono text-[11px] leading-4 text-cyan-100/60">{dispatchState.leadSandboxAcceptanceFlow?.leadMemoryGate.writeMode || 'aggregate-only-after-accepted-receipt'}</p>
                  <p className="mt-1 text-[11px] leading-4 text-white/60">{dispatchState.leadSandboxAcceptanceFlow?.leadMemoryGate.nextAction || 'Collect accepted lead receipt before writing memory.'}</p>
                  <p className="mt-1 text-[11px] leading-4 text-rose-100/45">forbidden: {(dispatchState.leadSandboxAcceptanceFlow?.leadMemoryGate.forbiddenFields || ['phone', 'WeChat ID', 'raw private message', 'coupon code']).slice(0, 5).join(' / ')}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 border border-emerald-200/15 bg-emerald-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/65">今日指挥台</div>
                  <p className="mt-1 text-xs font-black text-white">默认路径把门店 AI 面收成四条链路：获客、发布凭证、核销/POS、复盘/训练。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  The operator sees one next action, one owner and one evidence gate instead of hunting through expert modules.
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">结论</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.todayCommandCockpit?.verdict || 'provider-unlock-first')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">链路</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.todayCommandCockpit?.summary.lanes ?? 4}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">现在可跑</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.todayCommandCockpit?.summary.runNow ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">凭证</div>
                  <div className="mt-1 text-xs font-black text-amber-100/75">{dispatchState.todayCommandCockpit?.summary.needsProof ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">外部资料</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.todayCommandCockpit?.summary.providerGated ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">代办宣称</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.todayCommandCockpit?.summary.canClaimAutoAcquisition || dispatchState.todayCommandCockpit?.summary.canClaimAutoPublish ? '就绪' : '受阻'}</div>
                </div>
              </div>
              <div className="mt-3 border border-white/10 bg-white/[0.04] p-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">下一步最优动作</div>
                <p className="mt-1 text-xs font-black text-white">{dispatchState.todayCommandCockpit?.nextBestAction.action || 'Configure provider gates or collect accepted proof before claiming automation.'}</p>
                <p className="mt-1 text-[11px] leading-4 text-emerald-100/55">
                  owner: {dispatchState.todayCommandCockpit?.nextBestAction.owner || 'runtime-admin'} / reason: {dispatchState.todayCommandCockpit?.nextBestAction.reason || 'Provider setup and proof gates are not complete.'}
                </p>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-4">
                {(dispatchState.todayCommandCockpit?.lanes || [
                  { id: 'get-customers', title: 'Get customers into the store', status: 'provider-gated', owner: 'community-ops', businessQuestion: 'Can reservations, coupons and inquiries become owner-visible tasks?', todayAction: 'Create staff-reviewed lead follow-up tasks.', proofToCollect: ['signed lead receipt'], providerGate: ['merchant authorization'], acceptance: 'Accepted receipt and staff approval exist.', stopLine: 'No customer contact automation.', sourceEvidence: ['leadFlow:waiting-provider'] },
                  { id: 'publish-proof', title: 'Publish only with proof slots', status: 'needs-proof', owner: 'ops', businessQuestion: 'Can content close with public proof?', todayAction: 'Prepare content and proof slot.', proofToCollect: ['public URL or screenshot id'], providerGate: ['browser runtime'], acceptance: 'Proof id exists before closeout.', stopLine: 'No auto publish claim.', sourceEvidence: ['publishInbox:waiting-receipt'] },
                  { id: 'redeem-and-pos', title: 'Redeem coupons and import POS aggregates', status: 'blocked', owner: 'finance', businessQuestion: 'Can redemption and sales be explained from aggregate data?', todayAction: 'Import sanitized POS and coupon aggregate fields.', proofToCollect: ['couponClaimCount', 'redemptionCount'], providerGate: ['POS field dictionary'], acceptance: 'Aggregate import accepted.', stopLine: 'No raw POS rows.', sourceEvidence: ['operatingInsight:provider-gated'] },
                  { id: 'review-and-train', title: 'Review the shift and train the agent', status: 'waiting-proof', owner: 'store-manager', businessQuestion: 'Can the next shift reuse accepted proof?', todayAction: 'Close the loop with proof and training.', proofToCollect: ['accepted receipt'], providerGate: ['training record'], acceptance: 'Next shift has one action.', stopLine: 'No training from unverified proof.', sourceEvidence: ['shiftLoop:waiting-proof'] },
                ]).slice(0, 4).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{item.title}</span>
                      <span className={item.status === 'run-now' ? 'text-[10px] text-emerald-100/70' : item.status === 'blocked' ? 'text-[10px] text-rose-100/70' : item.status === 'provider-gated' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-cyan-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-emerald-100/55">{item.owner} / {item.businessQuestion}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/50">{item.todayAction}</p>
                    <p className="mt-1 text-[11px] leading-4 text-cyan-100/45">proof: {item.proofToCollect.slice(0, 3).join(' / ')}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-emerald-100/55">
                proof ledger: {dispatchState.todayCommandCockpit?.proofLedgerContract.memoryWriteRule || 'accepted-proof-or-sanitized-aggregate-only'} / rejected: {(dispatchState.todayCommandCockpit?.proofLedgerContract.rejectedProof || ['sample link', 'unsigned callback', 'private message text', 'raw POS row']).slice(0, 4).join(' / ')}
              </p>
            </div>
            <div className="mt-3 border border-lime-200/15 bg-lime-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/65">外部对接合同包</div>
                  <p className="mt-1 text-xs font-black text-white">外部对接拆成六份约定：试跑通道、平台凭证、线索承接、员工下发、POS 核销和模型智能。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  This is the concrete Provider/key list: server env, merchant grants, callback events, sandbox acceptance and the internal fallback if the adapter is missing.
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">结论</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.providerAdapterContractPack?.verdict || 'server-keys-first')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">对接器</div>
                  <div className="mt-1 text-xs font-black text-lime-100/75">{dispatchState.providerAdapterContractPack?.summary.adapters ?? 6}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">就绪</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.providerAdapterContractPack?.summary.readyToTest ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">配置项</div>
                  <div className="mt-1 text-xs font-black text-amber-100/75">{dispatchState.providerAdapterContractPack?.summary.needsServerKey ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">店长侧</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.providerAdapterContractPack?.summary.needsMerchantAuth ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">对标</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.providerAdapterContractPack?.summary.canClaimCompetitorParity ? '就绪' : '受阻'}</div>
                </div>
              </div>
              <div className="mt-3 border border-white/10 bg-white/[0.04] p-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">第一个要配置的通道</div>
                <p className="mt-1 text-xs font-black text-white">{dispatchState.providerAdapterContractPack?.firstProviderToConfigure.action || '先配置隔离外部试跑通道：服务端健康检查通过后，再做签名回执探测。'}</p>
                <p className="mt-1 text-[11px] leading-4 text-lime-100/55">
                  负责人: {dispatchState.providerAdapterContractPack?.firstProviderToConfigure.owner || 'runtime-admin'} / 凭证: {(dispatchState.providerAdapterContractPack?.firstProviderToConfigure.evidenceRequired || ['脱敏执行包已验收', '返回外部试跑编号', '签名回执已验收']).slice(0, 3).join(' / ')}
                </p>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.providerAdapterContractPack?.adapters || [
                  { id: 'runtime-browser-agent', label: '隔离外部试跑通道', status: 'needs-server-key', owner: 'runtime-admin', providerChoices: ['隔离浏览器试跑通道', '常驻浏览器通道', '外部任务执行通道'], requiredEnvKeys: ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', 'RESTAURANT_AGENT_CALLBACK_SECRET'], merchantGrant: ['操作员确认'], callbackEvents: ['外部回执'], healthCheck: '服务端账号健康检查', sandboxAcceptance: ['返回外部试跑编号'], unlocks: ['浏览器试跑任务执行'], fallbackNow: '先手工生成浏览器操作清单。', stopLine: '不读取 cookies、tokens 或原始浏览器 profile。' },
                  { id: 'platform-publish-proof', label: '点评 / 小红书 / 抖音 / 微信发布凭证', status: 'needs-merchant-auth', owner: 'merchant', providerChoices: ['店长平台授权', '已授权浏览器会话'], requiredEnvKeys: ['RESTAURANT_AGENT_CALLBACK_SECRET'], merchantGrant: ['平台授权'], callbackEvents: ['external-receipt'], healthCheck: '缺店长授权', sandboxAcceptance: ['公开链接或截图编号'], unlocks: ['发布回执收件箱'], fallbackNow: '先人工导入公开凭证。', stopLine: '没有凭证不宣称已发布。' },
                  { id: 'pos-redemption', label: 'POS、券码核销和经营数据', status: 'needs-data-contract', owner: 'data-ops', providerChoices: ['POS 汇总 CSV', '券码导出'], requiredEnvKeys: ['RESTAURANT_POS_DATA_MODE'], merchantGrant: ['字段表'], callbackEvents: ['pos-import-accepted'], healthCheck: '缺 POS 模式/字段表', sandboxAcceptance: ['couponClaimCount', 'redemptionCount'], unlocks: ['真实经营分析'], fallbackNow: '先人工导入脱敏汇总 CSV。', stopLine: '不收原始 POS 行。' },
                ]).slice(0, 6).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{item.label}</span>
                      <span className={item.status === 'ready-to-test' ? 'text-[10px] text-emerald-100/70' : item.status === 'blocked' ? 'text-[10px] text-rose-100/70' : 'text-[10px] text-amber-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-lime-100/55">{item.owner} / {item.providerChoices.slice(0, 3).join(' / ')}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/50">服务端配置项: {item.requiredEnvKeys.slice(0, 3).join(' / ')}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/45">{item.stopLine}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-lime-100/55">
                密钥规则（只放服务端配置）: {dispatchState.providerAdapterContractPack?.providerSecretPolicy.storage || 'server-env-or-secret-manager-only'} / 绝不收集: {(dispatchState.providerAdapterContractPack?.providerSecretPolicy.neverCollectInClient || ['API keys', 'cookies', 'tokens', 'raw POS rows']).slice(0, 5).join(' / ')}
              </p>
              <div className="mt-3 border border-teal-200/15 bg-teal-200/[0.035] p-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-100/65">外部通道配置台</div>
                    <p className="mt-1 text-xs font-black text-white">选择模拟试跑或真实外部通道，并列清楚还缺哪些账号配置、门店授权和回执凭证。</p>
                    <p className="mt-1 text-[11px] leading-4 text-teal-100/55">推荐配置: {dispatchState.providerAdapterConfigWorkbench?.recommended.target || 'openclaw'} / {formatRuntimeStatus(dispatchState.providerAdapterConfigWorkbench?.recommended.mode || 'sandbox-simulator')}</p>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">真实提交</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.providerAdapterConfigWorkbench?.summary.canSubmitRealProviderNow ? '就绪' : '受阻'}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">结论</div>
                    <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.providerAdapterConfigWorkbench?.verdict || 'simulator-first')}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">目标</div>
                    <div className="mt-1 text-xs font-black text-teal-100/75">{dispatchState.providerAdapterConfigWorkbench?.summary.targets ?? 3}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">真实就绪</div>
                    <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.providerAdapterConfigWorkbench?.summary.realProviderReady ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">模拟器</div>
                    <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.providerAdapterConfigWorkbench?.summary.simulatorReady ?? 3}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">缺配置</div>
                    <div className="mt-1 text-xs font-black text-amber-100/75">{dispatchState.providerAdapterConfigWorkbench?.summary.missingEnvKeys ?? 4}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">可否代办</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.providerAdapterConfigWorkbench?.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {(dispatchState.providerAdapterConfigWorkbench?.targets || [
                    { target: 'lobu', label: '试跑通道 A（事件型执行器）', mode: 'sandbox-simulator', status: 'missing-runtime', submitAllowed: false, simulatorAllowed: true, endpointEnv: 'RESTAURANT_AGENT_LOBU_RUNTIME_URL', apiKeyEnv: 'RESTAURANT_AGENT_LOBU_API_KEY', submitPath: '/events', healthPath: '/health', configuredEvidence: ['adapter:needs-runtime-config'], missingEnvKeys: ['RESTAURANT_AGENT_LOBU_RUNTIME_URL', 'RESTAURANT_AGENT_LOBU_API_KEY'], missingBusinessEvidence: ['店长授权'], callbackRequired: ['external-receipt'], acceptanceEvidence: ['externalRunId'], firstTest: '先跑模拟时间线，真实提交前先收齐通道账号。', stopLine: '没有通道账号、店长授权和回执，不做真实外部提交。' },
                    { target: 'openclaw', label: '试跑通道 B（浏览器执行器）', mode: 'sandbox-simulator', status: 'missing-runtime', submitAllowed: false, simulatorAllowed: true, endpointEnv: 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', apiKeyEnv: 'RESTAURANT_AGENT_OPENCLAW_API_KEY', submitPath: '/tasks', healthPath: '/health', configuredEvidence: ['adapter:needs-runtime-config'], missingEnvKeys: ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', 'RESTAURANT_AGENT_OPENCLAW_API_KEY'], missingBusinessEvidence: ['店长授权'], callbackRequired: ['external-receipt'], acceptanceEvidence: ['externalRunId'], firstTest: '先跑模拟时间线，真实提交前先收齐通道账号。', stopLine: '没有通道账号、店长授权和回执，不做真实外部提交。' },
                    { target: 'hermes', label: '试跑通道 C（常驻执行器）', mode: 'sandbox-simulator', status: 'missing-runtime', submitAllowed: false, simulatorAllowed: true, endpointEnv: 'RESTAURANT_AGENT_HERMES_RUNTIME_URL', apiKeyEnv: 'RESTAURANT_AGENT_HERMES_API_KEY', submitPath: '/runs', healthPath: '/health', configuredEvidence: ['adapter:needs-runtime-config'], missingEnvKeys: ['RESTAURANT_AGENT_HERMES_RUNTIME_URL', 'RESTAURANT_AGENT_HERMES_API_KEY'], missingBusinessEvidence: ['店长授权'], callbackRequired: ['external-receipt'], acceptanceEvidence: ['externalRunId'], firstTest: '先跑模拟时间线，真实提交前先收齐通道账号。', stopLine: '没有通道账号、店长授权和回执，不做真实外部提交。' },
                  ]).map(target => (
                    <div className="border border-white/10 bg-stone-950/45 p-2" key={target.target}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{target.label}</span>
                        <span className={target.submitAllowed ? 'text-[10px] text-emerald-100/70' : target.simulatorAllowed ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(target.mode)}</span>
                      </div>
                    <p className="mt-1 text-[11px] leading-4 text-teal-100/55">{formatRuntimeStatus(target.status)} / {target.endpointEnv}{target.submitPath}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">missing: {target.missingEnvKeys.slice(0, 3).join(' / ') || target.missingBusinessEvidence.slice(0, 2).join(' / ') || 'none'}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/55">{target.firstTest}</p>
                      <p className="mt-1 text-[11px] leading-4 text-rose-100/45">{target.stopLine}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-teal-100/55">
                  账号配置需求: {(dispatchState.providerAdapterConfigWorkbench?.providerOfTheKeyRequest || [{ owner: 'runtime-admin', giveThis: ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', 'RESTAURANT_AGENT_OPENCLAW_API_KEY', 'RESTAURANT_AGENT_CALLBACK_SECRET'], unlocks: ['real provider sandbox submit'] }]).map(item => `${item.owner}: ${item.giveThis.slice(0, 3).join(' / ')}`).join(' | ')}
                </p>
              </div>
              <div className="mt-3 border border-cyan-200/15 bg-cyan-200/[0.035] p-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/65">商户授权包</div>
                    <p className="mt-1 text-xs font-black text-white">真实外部执行前，可直接转发给店长的授权范围包，覆盖点评/美团、小红书、抖音、微信社群和 POS 核销数据。</p>
                    <p className="mt-1 text-[11px] leading-4 text-cyan-100/55">结论: {formatRuntimeStatus(dispatchState.merchantAuthorizationPacket?.verdict || 'merchant-auth-required')} / 门店: {dispatchState.merchantAuthorizationPacket?.restaurant || runtimeIntake.restaurant}</p>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">真实外部</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.merchantAuthorizationPacket?.summary.canEnableRealProviderSubmit ? '就绪' : '受阻'}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">授权范围</div>
                    <div className="mt-1 text-xs font-black text-cyan-100/75">{dispatchState.merchantAuthorizationPacket?.summary.scopes ?? 5}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">就绪</div>
                    <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.merchantAuthorizationPacket?.summary.readyToSign ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">店长侧</div>
                    <div className="mt-1 text-xs font-black text-amber-100/75">{dispatchState.merchantAuthorizationPacket?.summary.missingMerchantGrant ?? 4}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">数据</div>
                    <div className="mt-1 text-xs font-black text-violet-100/75">{dispatchState.merchantAuthorizationPacket?.summary.missingDataContract ?? 1}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">试跑通道</div>
                    <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.merchantAuthorizationPacket?.summary.runtimeOrCallbackBlocked ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">宣称</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.merchantAuthorizationPacket?.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-5">
                  {(dispatchState.merchantAuthorizationPacket?.scopes || [
                    { id: 'dianping-meituan', label: '大众点评 / 美团本地生活账号', owner: 'merchant', status: 'missing-merchant-grant', allowedActions: ['prepare_publish_draft'], forbiddenActions: ['read_private_message'], requiredFields: ['账号负责人', '门店公开主页链接', '授权范围'], dataScope: ['公开发布链接', '公开截图'], expiryRule: '正式执行前店长必须选定授权有效期。', revocationRule: '撤销授权后降级为草稿/人工模式。', acceptanceEvidence: ['发布链接', '截图编号'], providerCallbackRequired: ['x-restaurant-agent-signature'], nextAction: '店长先确认账号范围、有效期和撤销规则，再开真实执行。', stopLine: '没签授权和回执，不做真实发布。' },
                    { id: 'xiaohongshu', label: '小红书门店内容账号', owner: 'merchant', status: 'missing-merchant-grant', allowedActions: ['prepare_publish_draft'], forbiddenActions: ['read_private_message'], requiredFields: ['账号昵称', '审核负责人'], dataScope: ['已审核草稿', '公开笔记链接'], expiryRule: '正式执行前店长必须选定授权有效期。', revocationRule: '撤销授权后降级为草稿/人工模式。', acceptanceEvidence: ['笔记链接', '截图编号'], providerCallbackRequired: ['x-restaurant-agent-signature'], nextAction: '店长先确认账号范围、有效期和撤销规则，再开真实执行。', stopLine: '没签授权和回执，不做真实发布。' },
                    { id: 'douyin', label: '抖音本地内容账号', owner: 'merchant', status: 'missing-merchant-grant', allowedActions: ['prepare_publish_draft'], forbiddenActions: ['read_private_message'], requiredFields: ['账号昵称', '团购范围'], dataScope: ['已审核视频文案', '公开视频链接'], expiryRule: '正式执行前店长必须选定授权有效期。', revocationRule: '撤销授权后降级为草稿/人工模式。', acceptanceEvidence: ['视频链接', '内容编号'], providerCallbackRequired: ['x-restaurant-agent-signature'], nextAction: '店长先确认账号范围、有效期和撤销规则，再开真实执行。', stopLine: '没签授权和回执，不做真实发布。' },
                    { id: 'wechat-community', label: '微信社群人工交接', owner: 'operator', status: 'missing-merchant-grant', allowedActions: ['prepare_publish_draft'], forbiddenActions: ['read_private_message'], requiredFields: ['社群负责人', '交接负责人'], dataScope: ['已审核群文案', '咨询数量汇总'], expiryRule: '正式执行前店长必须选定授权有效期。', revocationRule: '撤销授权后降级为草稿/人工模式。', acceptanceEvidence: ['人工截图编号'], providerCallbackRequired: ['x-restaurant-agent-signature'], nextAction: '运营先确认社群人工交接范围。', stopLine: '不读私信原文。' },
                    { id: 'pos-redemption', label: 'POS / 券码核销数据约定', owner: 'data-ops', status: 'missing-data-contract', allowedActions: ['prepare_publish_draft'], forbiddenActions: ['raw POS rows'], requiredFields: ['数据模式', '字段表', '核销来源'], dataScope: ['脱敏汇总行'], expiryRule: '正式执行前店长必须选定授权有效期。', revocationRule: '撤销后停止导入。', acceptanceEvidence: ['字段表编号', '导入批次编号'], providerCallbackRequired: ['x-restaurant-agent-signature'], nextAction: '提供 POS 数据模式、字段表和脱敏汇总样例。', stopLine: '没有数据约定，不拉 POS、不宣称分析结论。' },
                  ]).map(scope => (
                    <div className="border border-white/10 bg-stone-950/45 p-2" key={scope.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{scope.label}</span>
                        <span className={scope.status === 'ready-to-sign' ? 'text-[10px] text-emerald-100/70' : scope.status === 'missing-data-contract' ? 'text-[10px] text-violet-100/70' : scope.status === 'runtime-callback-blocked' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-amber-100/70'}>{formatRuntimeStatus(scope.status)}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-cyan-100/55">负责人: {scope.owner} / 凭证: {scope.acceptanceEvidence.slice(0, 2).join(' / ')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/45">需要字段: {scope.requiredFields.slice(0, 3).join(' / ')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/55">{scope.nextAction}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-cyan-100/55">
                  交给执行方的资料: {(dispatchState.merchantAuthorizationPacket?.providerHandOff.giveProvider || ['授权范围编号和允许动作清单', '门店公开链接或账号昵称', '回执地址和签名头名称']).slice(0, 4).join(' / ')}
                </p>
              </div>
              <div className="mt-3 border border-indigo-200/15 bg-indigo-200/[0.035] p-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-100/65">第一次沙箱试跑</div>
                    <p className="mt-1 text-xs font-black text-white">Pick one merchant scope, one sanitized package and one Provider target; keep it open until signed receipt decides whether the next run can be trained.</p>
                    <p className="mt-1 text-[11px] leading-4 text-indigo-100/55">当前选择: {dispatchState.firstProviderSandboxRunConsole?.selectedRun.scopeLabel || '大众点评 / 美团本地生活账号'} / {dispatchState.firstProviderSandboxRunConsole?.selectedRun.targetProvider || 'openclaw'}</p>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">首跑</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.firstProviderSandboxRunConsole?.summary.canStartFirstSandboxRun ? '就绪' : '受阻'}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">结论</div>
                    <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.firstProviderSandboxRunConsole?.verdict || 'sign-merchant-scope-first')}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">就绪</div>
                    <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.firstProviderSandboxRunConsole?.summary.ready ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">受阻</div>
                    <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.firstProviderSandboxRunConsole?.summary.blocked ?? 4}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">等待</div>
                    <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.firstProviderSandboxRunConsole?.summary.waiting ?? 1}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">训练</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.firstProviderSandboxRunConsole?.summary.canTrainNextRun ? '允许' : '受阻'}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">宣称</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.firstProviderSandboxRunConsole?.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-6">
                  {(dispatchState.firstProviderSandboxRunConsole?.steps || [
                    { id: 'merchant-scope', label: '店长先签一个授权范围', status: 'blocked', owner: 'merchant', evidence: ['授权范围', '有效期'], nextAction: '店长先确认一个平台的授权范围。', stopLine: '没签授权范围，不做平台动作。' },
                    { id: 'provider-choice', label: '选择外部试跑通道', status: 'blocked', owner: 'runtime-admin', evidence: ['外部通道', '回执'], nextAction: '配置试跑通道地址、账号、隔离环境和回执。', stopLine: '没有通道配置，不提交真实外部任务。' },
                    { id: 'submit-package', label: '选择脱敏提交包', status: 'blocked', owner: 'ops', evidence: ['safePayload'], nextAction: '先准备脱敏提交包。', stopLine: '不带密钥和隐私数据。' },
                    { id: 'dispatch', label: '提交一次沙箱试跑', status: 'blocked', owner: 'ops', evidence: ['POST /tasks'], nextAction: '前置条件齐了才提交。', stopLine: '提交不等于完成。' },
                    { id: 'signed-callback', label: '等签名回执', status: 'blocked', owner: 'runtime-admin', evidence: ['external-receipt'], nextAction: '等待签名回执到达。', stopLine: '未签名回执拒收。' },
                    { id: 'closeout-training', label: '收尾并训练下一轮', status: 'waiting', owner: 'store-manager', evidence: ['仅限已验收凭证'], nextAction: '只用已验收凭证做训练。', stopLine: '不用隐私或原始 POS 数据训练。' },
                  ]).map(step => (
                    <div className="border border-white/10 bg-stone-950/45 p-2" key={step.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{step.label}</span>
                        <span className={step.status === 'ready' ? 'text-[10px] text-emerald-100/70' : step.status === 'accepted' ? 'text-[10px] text-lime-100/70' : step.status === 'waiting' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(step.status)}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-indigo-100/55">owner: {step.owner}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/45">{step.evidence.slice(0, 3).join(' / ')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/55">{step.nextAction}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-indigo-100/55">
                  提交通道（试跑接口/账号配置项）: {dispatchState.firstProviderSandboxRunConsole?.providerSubmitCard.method || 'POST'} {dispatchState.firstProviderSandboxRunConsole?.providerSubmitCard.endpointEnv || 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL + /tasks'} / 回执 {dispatchState.firstProviderSandboxRunConsole?.selectedRun.callbackAction || 'external-receipt'} 带签名头 {dispatchState.firstProviderSandboxRunConsole?.selectedRun.callbackHeader || 'x-restaurant-agent-signature'}
                </p>
              </div>
              <RestaurantProviderRunPacketPanel providerRunPacket={dispatchState.providerRunPacket} />
              <RestaurantProviderReceiptAcceptancePanel consoleData={dispatchState.providerReceiptAcceptanceConsole} />
              <RestaurantProviderLiveRunGatePanel liveRunGate={dispatchState.providerLiveRunGate} launchAttempt={dispatchState.providerLiveRunLaunchAttempt} />
              <RestaurantRunnerMissionTimelinePanel timeline={dispatchState.runnerMissionTimeline} />
              <RestaurantProviderForwardableSetupDossierPanel dossier={dispatchState.providerForwardableSetupDossier} />
            </div>
            <div className="mt-3 border border-fuchsia-200/15 bg-fuchsia-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/65">门店操作台分区</div>
                  <p className="mt-1 text-xs font-black text-white">默认路径最终落在一个操作台，今日运营、AI 经营顾问、真实代办启动和凭证复核。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  把同类产品的承诺变成店长每天能看的界面，现在做什么、缺什么凭证、下一个解锁什么、哪些还不能承诺。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">结论</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.aiCockpit?.verdict || 'provider-unlock-first')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">分区</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.aiCockpit?.summary.zones ?? 4}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">今日时段</div>
                  <div className="mt-1 text-xs font-black text-fuchsia-100/75">{dispatchState.aiCockpit?.summary.todayBlocks ?? dispatchState.storeOperatingPlan?.summary.timeBlocks ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">资料解锁</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.aiCockpit?.summary.providerUnlocks ?? dispatchState.storeOperatingPlan?.providerUnlocks.length ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">代办</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.aiCockpit?.summary.canClaimAutomation ? '就绪' : '受阻'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-4">
                {(dispatchState.aiCockpit?.zones || [
                  { id: 'today-operations', title: 'Today Operations', status: 'provider-gated', owner: 'store-manager', answer: 'Confirm the offer, service window, owner and proof requirements before today starts.', primaryAction: 'Run the store operating plan.', visibleProof: ['owner and proof requirements'], providerGate: 'merchant evidence and provider unlocks', stopLine: 'Do not push demand without confirmed store boundaries.' },
                  { id: 'ai-consultant', title: 'AI Consultant', status: 'needs-evidence', owner: 'ops', answer: 'Turn advice into owner-visible plays.', primaryAction: 'Build restaurant consultant prescription.', visibleProof: ['owner-visible plays'], providerGate: 'training evidence', stopLine: 'Advice becomes a task only with evidence.' },
                  { id: 'automation-launch', title: '真实代办启动', status: 'provider-gated', owner: 'runtime-admin', answer: '选择一个外部通道，先跑签名沙箱回执。', primaryAction: '配置账号、门店授权、回执和数据规则。', visibleProof: ['代办启动看板'], providerGate: '试跑通道和回执', stopLine: '没有回执，不承诺外部代办完成。' },
                  { id: 'evidence-review', title: 'Evidence Review', status: 'needs-evidence', owner: 'finance', answer: 'Closeout only uses public proof and sanitized aggregate operating data.', primaryAction: 'Import accepted proof and aggregate rows.', visibleProof: ['proof receipt'], providerGate: 'POS/coupon field dictionary', stopLine: 'No raw POS or customer identifiers.' },
                ]).slice(0, 4).map(zone => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={zone.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{formatRuntimeLabel(zone.title)}</span>
                      <span className={zone.status === 'ready-internal' ? 'text-[10px] text-emerald-100/70' : zone.status === 'needs-evidence' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(zone.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{zone.answer}</p>
                    <p className="mt-1 text-[11px] leading-4 text-fuchsia-100/55">action: {zone.primaryAction}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">gate: {zone.providerGate}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-fuchsia-100/55">
                每日执行清单: {(dispatchState.aiCockpit?.primaryRunbook || ['先打开今日门店经营，确认门店凭证。', '真实代办逐项通过外部条件检查。', '用公开凭证或脱敏汇总完成凭证复核。']).slice(0, 3).join(' / ')}
              </p>
            </div>
            <div className="mt-3 border border-lime-200/15 bg-lime-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/65">预约核销收尾闭环</div>
                  <p className="mt-1 text-xs font-black text-white">默认路径把预约和领券闭环到 POS 汇总导入、核销复盘和下一班动作。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  It uses sanitized aggregate rows only: no phone numbers, member ids, raw order rows, payment ids, coupon codes or private chat content.
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">POS 行</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.posImport?.summary.validRows ?? 2}/{dispatchState.posImport?.summary.totalRows ?? 2}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">预约</div>
                  <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.businessSignals?.summary.reservations ?? dispatchState.controlledTrialRun?.businessSignals.summary.reservations ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">领券</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.posImport?.summary.couponClaimCount ?? 50}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">核销</div>
                  <div className="mt-1 text-xs font-black text-lime-100/75">{dispatchState.posImport?.summary.redemptionCount ?? 29}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">分析</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.operatingInsightReport?.verdict || 'usable-internal-analysis')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">下一轮</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.nextLoopChannelPlan?.verdict || 'ready-for-internal-shift')}</div>
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
                      <span className={item.status === 'measured' ? 'text-[10px] text-emerald-100/70' : item.status === 'directional' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-lime-100/60">{item.value}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/45">{item.nextAction}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-lime-100/55">
                下一班动作: {(dispatchState.nextLoopChannelPlan?.scheduledActions || [
                  { action: '根据已验收回执和 POS 汇总安排备餐任务。' },
                  { action: '根据到店意向汇总起草店长审核的社群跟进。' },
                  { action: '通道、店长授权和 POS 约定配齐之前，外部解锁保持关闭。' },
                ]).slice(0, 3).map(item => item.action).join(' / ')}
              </p>
            </div>
            <div className="mt-3 border border-cyan-200/15 bg-cyan-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/65">口碑与服务恢复闭环</div>
                  <p className="mt-1 text-xs font-black text-white">公开评价、评论主题和服务问题会变成店长审核的回复、恢复任务和下一轮内容。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  Auto review reply stays blocked until merchant authorization, platform/provider sync, callback proof and consent boundaries exist.
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">结论</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.reputationCloseoutPack?.verdict || 'needs-public-proof')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">来源</div>
                  <div className="mt-1 text-xs font-black text-cyan-100/75">{dispatchState.reputationCloseoutPack?.summary.sources ?? 5}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">本地可做</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.reputationCloseoutPack?.summary.internalReady ?? 2}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待补凭证</div>
                  <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.reputationCloseoutPack?.summary.needsPublicProof ?? 2}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">自动回评</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.reputationCloseoutPack?.summary.canClaimAutoReviewReply ? '就绪' : '受阻'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">分析</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.reputationCloseoutPack?.summary.canClaimReviewAnalytics ? '凭证就绪' : '待补凭证'}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.reputationCloseoutPack?.themes || [
                  { id: 'taste-offer-fit', label: 'Dish taste and offer fit', signal: 'unknown', operatorAction: 'Collect public proof before turning taste claims into content.', staffScript: 'Confirm availability and service window before recommending add-ons.' },
                  { id: 'wait-time-service', label: '等位与服务恢复', signal: 'mixed', operatorAction: '把排队处理和员工负责人挂到下一轮跟进。', staffScript: '说明预计等位时间，并给出明确的预约或自取替代方案。' },
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
                      <span className={item.status === 'staff-review' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{item.draft}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">proof: {item.proofNeeded}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-cyan-100/55">
                服务恢复: {(dispatchState.reputationCloseoutPack?.recoveryQueue || [
                  { action: '下一轮内容推送前先确认等位、库存和服务时段边界。' },
                  { action: '准备一份券有效期和核销步骤的员工回复话术。' },
                  { action: '店长授权配齐之前，自动回评和评论同步保持关闭。' },
                ]).slice(0, 3).map(item => item.action).join(' / ')}
              </p>
            </div>
            {dispatchState.clawExperienceDefaultPath ? (
              <>
                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="font-mono text-white">{dispatchState.clawExperienceDefaultPath.summary.steps}</div>
                    <p className="mt-1 text-white/55">步骤</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="font-mono text-white">{dispatchState.clawExperienceDefaultPath.summary.readyNow}</div>
                    <p className="mt-1 text-white/55">就绪</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="font-mono text-white">{dispatchState.clawExperienceDefaultPath.summary.reviewNeeded}</div>
                    <p className="mt-1 text-white/55">评价</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="font-mono text-white">{dispatchState.clawExperienceDefaultPath.summary.trainingNeeded}</div>
                    <p className="mt-1 text-white/55">训练</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="font-mono text-white">{dispatchState.clawExperienceDefaultPath.summary.providerGated}</div>
                    <p className="mt-1 text-white/55">待补</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="font-mono text-white">{dispatchState.clawExperienceDefaultPath.summary.canClaimExternalAutomation ? '就绪' : '受阻'}</div>
                    <p className="mt-1 text-white/55">外部代办</p>
                  </div>
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-xs leading-5 text-cyan-100/70">{dispatchState.clawExperienceDefaultPath.answerForCustomer}</p>
                <div className="mt-3 grid gap-2 lg:grid-cols-7">
                  {dispatchState.clawExperienceDefaultPath.primaryPath.map(step => (
                    <div className="border border-white/10 bg-stone-950/50 p-2" key={step.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{step.label}</span>
                        <span className={step.status === 'ready-now' ? 'text-[10px] text-emerald-100/70' : step.status === 'review-needed' ? 'text-[10px] text-sky-100/70' : step.status === 'training-needed' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(step.status)}</span>
                      </div>
                      <p className="mt-2 text-[11px] leading-4 text-white/55">{step.customerAction}</p>
                      <p className="mt-2 text-[11px] leading-4 text-white/35">proof: {step.evidenceRequired}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">可训练</div>
                    <p className="mt-2 text-[11px] leading-4 text-amber-100/65">{dispatchState.clawExperienceDefaultPath.trainingNow.slice(0, 8).join(' / ') || 'none'}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">需要外部资料</div>
                    <p className="mt-2 text-[11px] leading-4 text-rose-100/65">{dispatchState.clawExperienceDefaultPath.providerNeeded.slice(0, 8).join(' / ') || 'none'}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">快捷动作</div>
                    <p className="mt-2 text-[11px] leading-4 text-white/45">{dispatchState.clawExperienceDefaultPath.quickActions.map(item => item.label).join(' / ')}</p>
                    <p className="mt-2 text-[11px] leading-4 text-white/35">{dispatchState.clawExperienceDefaultPath.safetyBoundary}</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  <div className="border border-emerald-200/20 bg-emerald-200/[0.04] p-3">
                    <div className="text-[10px] font-semibold tracking-[0.14em] text-emerald-100/65">需要商户补充</div>
                    <div className="mt-2 grid gap-2">
                      {dispatchState.clawExperienceDefaultPath.routeDecision.merchantInputsNeeded.slice(0, 6).map(item => (
                        <div className="border border-white/10 bg-stone-950/40 p-2 text-[11px] leading-4 text-white/60" key={item}>{item}</div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-rose-200/20 bg-rose-200/[0.04] p-3">
                    <div className="text-[10px] font-semibold tracking-[0.14em] text-rose-100/65">代办解锁清单</div>
                    <div className="mt-2 grid gap-2">
                      {dispatchState.clawExperienceDefaultPath.routeDecision.providerKeyChecklist.slice(0, 6).map(item => (
                        <div className="border border-white/10 bg-stone-950/40 p-2 text-[11px] leading-4 text-white/60" key={item}>{item}</div>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] leading-4 text-rose-100/55">
                      只有账号确认、授权、回填凭证和数据边界都齐了，才进入真实外部代办。
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">外部试跑通道</p>
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
              生成试跑工作流
            </button>
            <button
              className="border border-white/20 px-4 py-2 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={checkLobuBridge}
              type="button"
            >
              检查外部试跑通道
            </button>
            <button
              className="border border-orange-200/40 px-4 py-2 text-sm font-black text-orange-100 transition hover:bg-orange-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={importPosRedemptionSample}
              type="button"
            >
              经营表格导入校验
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
              打开能力工单
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
              生成能力总览
            </button>
            <button
              className="border border-sky-200/40 px-4 py-2 text-sm font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildChannelHub}
              type="button"
            >
              生成员工通道清单
            </button>
            <button
              className="border border-sky-200/40 px-4 py-2 text-sm font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={attemptChannelDelivery}
              type="button"
            >
              尝试员工送达
            </button>
            <button
              className="border border-sky-200/40 px-4 py-2 text-sm font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={runChannelSchedule}
              type="button"
            >
              运行到期任务
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
              生成平台经营主链
            </button>
            <button
              className="border border-orange-200/40 px-4 py-2 text-sm font-black text-orange-100 transition hover:bg-orange-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectOperatingDataContract}
              type="button"
            >
              生成经营数据规则
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
              对标训练蓝图
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
              补资料包
            </button>
            <button
              className="border border-fuchsia-200/40 bg-fuchsia-200/10 px-4 py-2 text-sm font-black text-fuchsia-100 transition hover:bg-fuchsia-200/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildProviderSetupWizard}
              type="button"
            >
              账号和资料补齐向导
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
              外部执行补资料向导
            </button>
            <button
              className="border border-emerald-200/40 bg-emerald-200/10 px-4 py-2 text-sm font-black text-emerald-100 transition hover:bg-emerald-200/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={runControlledTrialRun}
              type="button"
            >
              受控试跑
            </button>
            <button
              className="border border-emerald-200/40 bg-emerald-200/10 px-4 py-2 text-sm font-black text-emerald-100 transition hover:bg-emerald-200/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectExecutionTimeline}
              type="button"
            >
              执行时间线
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
                    <p className="mt-1 text-white/60">就绪</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.trialWorkflowPack.summary.needsReviewSteps}</div>
                    <p className="mt-1 text-white/60">评价</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.trialWorkflowPack.summary.externalGatedSteps}</div>
                    <p className="mt-1 text-white/60">待补外部条件</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.trialWorkflowPack.summary.canRunInternallyToday ? '是' : '否'}</div>
                    <p className="mt-1 text-white/60">今日本地</p>
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
                    <div className="text-white/45">渠道草稿</div>
                    {dispatchState.trialWorkflowPack.channelDrafts.slice(0, 4).map(draft => (
                      <div className="border border-white/10 bg-white/[0.05] p-2 text-white/70" key={draft.channel}>
                        <div className="font-mono text-white">{draft.channel}</div>
                        <div className="mt-1">{draft.job}</div>
                        <div className="mt-1 text-white/45">{draft.proofRequired}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="text-white/45">外部解锁</div>
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
                      <p className="mt-1 text-white/60">巡检链路已开</p>
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
                    <div className="font-mono text-white">{dispatchState.browserSession.canExecuteNow ? '就绪' : '仅人工交接'}</div>
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
                    <p className="mt-1 text-white/60">会话</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserSessionHealth.summary.ready}</div>
                    <p className="mt-1 text-white/60">就绪</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserSessionHealth.summary.blocked}</div>
                    <p className="mt-1 text-white/60">受阻</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserSessionHealth.summary.expired}</div>
                    <p className="mt-1 text-white/60">已过期</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserSessionHealth.summary.needsHeartbeat}</div>
                    <p className="mt-1 text-white/60">心跳</p>
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
                <div className="text-white/45">授权清单向导</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.grantChecklist.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.grantChecklist.merchant.grantStatus}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.grantChecklist.summary.done}/{dispatchState.grantChecklist.summary.total}</div>
                    <p className="mt-1 text-white/60">已完成步骤</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.grantChecklist.summary.missing}</div>
                    <p className="mt-1 text-white/60">缺项</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.grantChecklist.summary.blocked}</div>
                    <p className="mt-1 text-white/60">受阻</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.grantChecklist.summary.canEnableAutoPublish ? '可开' : '未就绪'}</div>
                    <p className="mt-1 text-white/60">代发布</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.grantChecklist.summary.canEnableOperatingAnalysis ? '就绪' : '受阻'}</div>
                    <p className="mt-1 text-white/60">分析</p>
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
                    <p className="mt-1 text-white/60">条件报告</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.activationGates.summary.ready}</div>
                    <p className="mt-1 text-white/60">就绪</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.activationGates.summary.blocked}</div>
                    <p className="mt-1 text-white/60">受阻</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.activationGates.summary.forbidden}</div>
                    <p className="mt-1 text-white/60">禁止项</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.activationGates.summary.internalAlternatives}</div>
                    <p className="mt-1 text-white/60">本地动作</p>
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
                    <p className="mt-1 text-white/60">报告类型</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.competitorAudit.sources.length}</div>
                    <p className="mt-1 text-white/60">公开来源</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.competitorAudit.summary.internalReady}</div>
                    <p className="mt-1 text-white/60">本地</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.competitorAudit.summary.bridgeReady}</div>
                    <p className="mt-1 text-white/60">通道</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.competitorAudit.summary.externalRequired}</div>
                    <p className="mt-1 text-white/60">外部</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.competitorAudit.summary.internalConnectors}</div>
                    <p className="mt-1 text-white/60">连接器</p>
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
                    <p className="mt-1 text-white/60">队列类型</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.buildQueue.summary.readyToBuild}</div>
                    <p className="mt-1 text-white/60">就绪</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.buildQueue.summary.needsDesignReview}</div>
                    <p className="mt-1 text-white/60">通道</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.buildQueue.summary.waitingExternal}</div>
                    <p className="mt-1 text-white/60">外部</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.buildQueue.nextInternalSprint.length}</div>
                    <p className="mt-1 text-white/60">下一冲刺</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.buildQueue.externalSetupRequests.length}</div>
                    <p className="mt-1 text-white/60">配置请求</p>
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
                    <p className="mt-1 text-white/60">计划类型</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.capabilityTrainingPlan.summary.trainableNow}</div>
                    <p className="mt-1 text-white/60">可训</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.capabilityTrainingPlan.summary.providerGated}</div>
                    <p className="mt-1 text-white/60">待补资料</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.capabilityTrainingPlan.summary.activationReady}</div>
                    <p className="mt-1 text-white/60">就绪</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.capabilityTrainingPlan.nextInternalTraining.length}</div>
                    <p className="mt-1 text-white/60">训练任务</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.capabilityTrainingPlan.externalSetupRequests.length}</div>
                    <p className="mt-1 text-white/60">外部配置</p>
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
                    <p className="mt-1 text-white/60">清单类型</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillCatalog.summary.modules}</div>
                    <p className="mt-1 text-white/60">模块</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillCatalog.summary.skills}</div>
                    <p className="mt-1 text-white/60">技能</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillCatalog.summary.tools}</div>
                    <p className="mt-1 text-white/60">工具</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillCatalog.nextInternalTraining.length}</div>
                    <p className="mt-1 text-white/60">训练队列</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillCatalog.externalSetupRequests.length}</div>
                    <p className="mt-1 text-white/60">外部资料队列</p>
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
                <div className="text-white/45">能力工单台</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillWorkbench.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.clawSkillWorkbench.mode}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillWorkbench.summary.modules}</div>
                    <p className="mt-1 text-white/60">模块</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillWorkbench.summary.runnableNow}</div>
                    <p className="mt-1 text-white/60">可跑</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillWorkbench.summary.trainingNeeded}</div>
                    <p className="mt-1 text-white/60">训练</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillWorkbench.summary.providerGated}</div>
                    <p className="mt-1 text-white/60">待补资料</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillWorkbench.summary.deliverables}</div>
                    <p className="mt-1 text-white/60">交付物</p>
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
                    <p className="mt-1 text-white/60">运行</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.platformOperatingSpine.summary.acceptedReceipts}</div>
                    <p className="mt-1 text-white/60">回执</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.platformOperatingSpine.summary.businessSignals}</div>
                    <p className="mt-1 text-white/60">信号</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.platformOperatingSpine.summary.blockedExternalGroups}</div>
                    <p className="mt-1 text-white/60">外部条件</p>
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
                    <div className="text-white/45">外部条件</div>
                    {dispatchState.platformOperatingSpine.externalGates.slice(0, 4).map(gate => (
                      <div className="border border-amber-200/20 bg-amber-200/[0.06] p-2 text-amber-100" key={gate.id}>
                        <div className="font-mono text-white">{gate.name}</div>
                        <div className="mt-1">{gate.missing.slice(0, 3).join(' / ') || 'ready'}</div>
                        <div className="mt-1 text-amber-100/60">{gate.nextAction}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="text-white/45">下一步平台动作</div>
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
                    <p className="mt-1 text-white/60">true analysis: {dispatchState.operatingDataContract.summary.canClaimTrueOperatingAnalysis ? '就绪' : '受阻'}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.operatingDataContract.summary.internalReady}</div>
                    <p className="mt-1 text-white/60">本地</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.operatingDataContract.summary.manualImportReady}</div>
                    <p className="mt-1 text-white/60">人工导入</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.operatingDataContract.summary.providerGated}</div>
                    <p className="mt-1 text-white/60">待补资料</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.operatingDataContract.summary.posImportsAccepted}</div>
                    <p className="mt-1 text-white/60">POS 导入</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.operatingDataContract.summary.canClaimAutoRedemption ? '就绪' : '受阻'}</div>
                    <p className="mt-1 text-white/60">代核销</p>
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
                    <div className="text-white/45">导入模板</div>
                    {dispatchState.operatingDataContract.importTemplate.slice(0, 6).map(field => (
                      <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 text-white/70 md:grid-cols-[0.6fr_0.35fr_1fr]" key={field.field}>
                        <span className="font-mono text-white">{field.field}</span>
                        <span>{field.type}</span>
                        <span>{field.requiredFor.join(' / ')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="text-white/45">补资料请求</div>
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
                      <span className="font-mono text-white">{item.canAnswerNow ? '就绪' : '受阻'}</span>
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
                    <p className="mt-1 text-white/60">{formatRuntimeStatus(dispatchState.operatingInsightReport.verdict)}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.operatingInsightReport.summary.measured}</div>
                    <p className="mt-1 text-white/60">可量化</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.operatingInsightReport.summary.directional}</div>
                    <p className="mt-1 text-white/60">仅供参考</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.operatingInsightReport.summary.blocked}</div>
                    <p className="mt-1 text-white/60">受阻</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.operatingInsightReport.summary.canClaimTrueOperatingAnalysis ? '就绪' : '受阻'}</div>
                    <p className="mt-1 text-white/60">真实分析</p>
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
                    <div className="text-white/45">店长动作</div>
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
                    <p className="mt-1 text-white/60">{formatRuntimeStatus(commandPostRunReviewPack.verdict)}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandPostRunReviewPack.summary.acceptedReceipts}</div>
                    <p className="mt-1 text-white/60">已验收凭证</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandPostRunReviewPack.summary.storeTasks}</div>
                    <p className="mt-1 text-white/60">门店任务</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandPostRunReviewPack.summary.acceptedPosImports}</div>
                    <p className="mt-1 text-white/60">POS 导入</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandPostRunReviewPack.summary.canClaimTrueOperatingAnalysis ? '就绪' : '受阻'}</div>
                    <p className="mt-1 text-white/60">真实分析</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  {commandPostRunReviewPack.lanes.map(lane => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={lane.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-white">{formatRuntimeLabel(lane.title)}</span>
                        <span>{formatRuntimeStatus(lane.status)}</span>
                      </div>
                      <p className="mt-1 text-white/60">{lane.owner}: {lane.decision}</p>
                      <p className="mt-1 line-clamp-3 text-white/45">{lane.nextAction}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-white/45">下一轮 SOP</div>
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
                    <p className="mt-1 text-cyan-100/70">{formatRuntimeStatus(commandNextLoopChannelPlan.verdict)}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandNextLoopChannelPlan.summary.internalReadyLanes}</div>
                    <p className="mt-1 text-white/60">可用链路</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandNextLoopChannelPlan.summary.scheduledActions}</div>
                    <p className="mt-1 text-white/60">动作</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandNextLoopChannelPlan.summary.manualOnlyActions}</div>
                    <p className="mt-1 text-white/60">人工</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandNextLoopChannelPlan.summary.providerGatedActions}</div>
                    <p className="mt-1 text-white/60">待补资料</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandNextLoopChannelPlan.summary.canRunInternallyNow ? '是' : '否'}</div>
                    <p className="mt-1 text-white/60">本地运行</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {commandNextLoopChannelPlan.lanes.map(lane => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={lane.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{formatRuntimeLabel(lane.title)}</span>
                        <span className="text-[11px] text-cyan-100/70">{formatRuntimeStatus(lane.status)}</span>
                      </div>
                      <p className="mt-1 text-white/60">{lane.owner}: {lane.nextAction}</p>
                      <p className="mt-1 line-clamp-2 text-white/40">{lane.stopLine}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-white/45">班次动作</div>
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
                    <div className="text-white/45">外部解锁</div>
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
                    <p className="mt-1 text-white/60">本地训练</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawTrainingBatch.summary.providerUnlockTasks}</div>
                    <p className="mt-1 text-white/60">资料解锁</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawTrainingBatch.summary.modulesCovered}</div>
                    <p className="mt-1 text-white/60">覆盖模块</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawTrainingBatch.summary.toolsCovered}</div>
                    <p className="mt-1 text-white/60">覆盖工具</p>
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
                    <p className="mt-1 text-white/60">canForward: {dispatchState.executionPackage.canForward ? '是' : '否'}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionPackage.executionPolicy.allowedRuntimeActions.length}/{dispatchState.executionPackage.executionPolicy.blockedRuntimeActions.length}</div>
                    <p className="mt-1 text-white/60">允许 / 禁止动作</p>
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
                <div className="text-white/45">浏览器执行手册包</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunbook.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.browserRunbook.runtimeTarget}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunbook.canExecuteNow ? '就绪' : '仅人工交接'}</div>
                    <p className="mt-1 text-white/60">现在可执行</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunbook.steps.length}</div>
                    <p className="mt-1 text-white/60">有序步骤</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunbook.allowedDomains.length}</div>
                    <p className="mt-1 text-white/60">允许域名</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunbook.evidenceSchema.length}</div>
                    <p className="mt-1 text-white/60">凭证字段</p>
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
                      <span>{step.allowed ? '允许' : '受阻'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {dispatchState.browserRunnerContract ? (
              <div className="md:col-span-3">
                <div className="text-white/45">浏览器执行回执约定</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunnerContract.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.browserRunnerContract.runtimeTarget}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunnerContract.canAcceptSignedFinalReceipt ? '就绪' : '受阻'}</div>
                    <p className="mt-1 text-white/60">签名最终回执</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunnerContract.eventRules.length}</div>
                    <p className="mt-1 text-white/60">事件规则</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunnerContract.stepRules.length}</div>
                    <p className="mt-1 text-white/60">步骤规则</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunnerContract.recoveryPolicy.retryBudget}</div>
                    <p className="mt-1 text-white/60">重试预算</p>
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
                      <span>{rule.retryable ? '可重试' : '不重试'}</span>
                      <span>{rule.nextAction}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {dispatchState.runnerEventHealth ? (
              <div className="md:col-span-3">
                <div className="text-white/45">浏览器执行事件台账</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runnerEventHealth.payloadShape}</div>
                    <p className="mt-1 text-white/60">事件健康</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runnerEventHealth.summary.totalEvents}</div>
                    <p className="mt-1 text-white/60">事件</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runnerEventHealth.summary.activeRuns}</div>
                    <p className="mt-1 text-white/60">进行中运行</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runnerEventHealth.summary.completedRuns}</div>
                    <p className="mt-1 text-white/60">已完成运行</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runnerEventHealth.summary.staleRuns}</div>
                    <p className="mt-1 text-white/60">停滞运行</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runnerEventHealth.summary.rejected}</div>
                    <p className="mt-1 text-white/60">已拒绝</p>
                  </div>
                </div>
                {dispatchState.runnerEvent ? (
                  <div className="mt-2 grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.6fr_0.5fr_0.5fr_1.4fr]">
                    <span className="font-mono text-white">{dispatchState.runnerEvent.type}</span>
                    <span>{dispatchState.runnerEvent.status}</span>
                    <span>{dispatchState.runnerEvent.retryable ? '可重试' : '不重试'}</span>
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
                <div className="text-white/45">浏览器网关包</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserGatewayPack.runtimeTarget}</div>
                    <p className="mt-1 text-white/60">试跑通道</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserGatewayPack.canExecuteNow ? '就绪' : '受阻'}</div>
                    <p className="mt-1 text-white/60">现在执行</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserGatewayPack.browserRequest.acceptedActions.length}</div>
                    <p className="mt-1 text-white/60">允许动作</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserGatewayPack.snapshotPolicy.maxCharacters}</div>
                    <p className="mt-1 text-white/60">快照字数</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserGatewayPack.contextBudget.maxRuntimeMinutes}m</div>
                    <p className="mt-1 text-white/60">通道预算</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserGatewayPack.externalRequired.length}</div>
                    <p className="mt-1 text-white/60">外部条件</p>
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
                <div className="text-white/45">签名回执模拟器</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.callbackSimulation.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.callbackSimulation.mode}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.callbackSimulation.callback.signatureVerified ? '已验证' : '已拒绝'}</div>
                    <p className="mt-1 text-white/60">签名</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.callbackSimulation.receipt.status}</div>
                    <p className="mt-1 text-white/60">{dispatchState.callbackSimulation.receipt.evidenceLevel} · {dispatchState.callbackSimulation.receipt.evidenceScore}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.callbackSimulation.businessSignals.summary.reservations}</div>
                    <p className="mt-1 text-white/60">预约</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.callbackSimulation.heartbeat.followups.length}</div>
                    <p className="mt-1 text-white/60">跟进</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.callbackSimulation.executionPackage.canForward ? '可转发' : '仅本地'}</div>
                    <p className="mt-1 text-white/60">外部试跑通道</p>
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
                    <p className="mt-1 text-white/60">运行</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runHealth.summary.accepted}</div>
                    <p className="mt-1 text-white/60">已验收</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runHealth.summary.waitingReceipt}</div>
                    <p className="mt-1 text-white/60">等待</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runHealth.summary.blockedAuth}</div>
                    <p className="mt-1 text-white/60">受阻</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runHealth.summary.failed}</div>
                    <p className="mt-1 text-white/60">失败</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runHealth.summary.rejectedReceipts}</div>
                    <p className="mt-1 text-white/60">已拒回执</p>
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
                    <p className="mt-1 text-white/60">预约</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.businessSignals.summary.couponClaims}</div>
                    <p className="mt-1 text-white/60">领券</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.businessSignals.summary.redemptions}</div>
                    <p className="mt-1 text-white/60">核销</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.businessSignals.summary.inquiries}</div>
                    <p className="mt-1 text-white/60">咨询</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.businessSignals.summary.visitIntent}</div>
                    <p className="mt-1 text-white/60">到店意向</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.businessSignals.summary.evidenceScoreAverage}</div>
                    <p className="mt-1 text-white/60">平均凭证</p>
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
                <div className="text-white/45">店长跟进包</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.storeManagerFollowup.summary.tasks}</div>
                    <p className="mt-1 text-white/60">任务</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.storeManagerFollowup.summary.today}</div>
                    <p className="mt-1 text-white/60">今日</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.storeManagerFollowup.summary.nextShift}</div>
                    <p className="mt-1 text-white/60">下一班</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.storeManagerFollowup.summary.blocked}</div>
                    <p className="mt-1 text-white/60">受阻</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.storeManagerFollowup.summary.visitIntent}</div>
                    <p className="mt-1 text-white/60">到店意向</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.storeManagerFollowup.summary.couponClaims}</div>
                    <p className="mt-1 text-white/60">领券</p>
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
                <div className="text-white/45">经营表格导入校验</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.posImport.summary.validRows}/{dispatchState.posImport.summary.totalRows}</div>
                    <p className="mt-1 text-white/60">有效行</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.posImport.summary.couponClaimCount}</div>
                    <p className="mt-1 text-white/60">领券</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.posImport.summary.redemptionCount}</div>
                    <p className="mt-1 text-white/60">核销</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.posImport.summary.orderCount}</div>
                    <p className="mt-1 text-white/60">订单</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{Math.round(dispatchState.posImport.summary.grossSalesCents / 100)}</div>
                    <p className="mt-1 text-white/60">销售额</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.posImport.summary.redemptionRatePct}%</div>
                    <p className="mt-1 text-white/60">核销率</p>
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
                    <p className="mt-1 text-white/60">就绪</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeProbe.summary.missingConfig}</div>
                    <p className="mt-1 text-white/60">缺项</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeProbe.summary.unreachable}</div>
                    <p className="mt-1 text-white/60">不可达</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeProbe.summary.blockedExternal}</div>
                    <p className="mt-1 text-white/60">条件受阻</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeProbe.summary.probed}</div>
                    <p className="mt-1 text-white/60">已探测</p>
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
                <div className="text-white/45">试跑通道配置合同</div>
                <div className="mt-2 grid gap-2 md:grid-cols-4">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeSetupContract.summary.readyTracks}/{dispatchState.runtimeSetupContract.summary.tracks}</div>
                    <p className="mt-1 text-white/60">就绪链路</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeSetupContract.summary.missingRequirements}</div>
                    <p className="mt-1 text-white/60">缺条件</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeSetupContract.blockedCapabilities.length}</div>
                    <p className="mt-1 text-white/60">受阻能力</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeSetupContract.payloadShape}</div>
                    <p className="mt-1 text-white/60">合同类型</p>
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
                <div className="text-white/45">试跑通道对接合同</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeAdapterContract.target}</div>
                    <p className="mt-1 text-white/60">目标</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeStatus(dispatchState.runtimeAdapterContract.verdict)}</div>
                    <p className="mt-1 text-white/60">结论</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeAdapterContract.summary.ready}/{dispatchState.runtimeAdapterContract.summary.checks}</div>
                    <p className="mt-1 text-white/60">通过检查</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeAdapterContract.summary.missing}</div>
                    <p className="mt-1 text-white/60">缺项</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeAdapterContract.summary.blocked}</div>
                    <p className="mt-1 text-white/60">受阻</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeAdapterContract.summary.canSubmitSandbox ? '就绪' : '受阻'}</div>
                    <p className="mt-1 text-white/60">沙箱提交</p>
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
                <div className="text-white/45">试跑跟进闭环包</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeStatus(dispatchState.runtimeRunnerLoopPack.verdict)}</div>
                    <p className="mt-1 text-white/60">结论</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeRunnerLoopPack.summary.runnerEvents}</div>
                    <p className="mt-1 text-white/60">执行事件</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeRunnerLoopPack.summary.activeRunnerRuns}</div>
                    <p className="mt-1 text-white/60">进行中执行器</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeRunnerLoopPack.summary.waitingReceipts}</div>
                    <p className="mt-1 text-white/60">等待回执</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeRunnerLoopPack.summary.acceptedReceipts}</div>
                    <p className="mt-1 text-white/60">已验收回执</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeRunnerLoopPack.summary.recoveryActions}</div>
                    <p className="mt-1 text-white/60">恢复</p>
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
                <div className="text-white/45">账号和资料补齐向导</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupWizard.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.providerSetupWizard.restaurant} / {dispatchState.providerSetupWizard.offer}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupWizard.summary.completionPercent}%</div>
                    <p className="mt-1 text-white/60">完成度</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupWizard.summary.configured}</div>
                    <p className="mt-1 text-white/60">已配置字段</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupWizard.summary.missing}</div>
                    <p className="mt-1 text-white/60">缺字段</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupWizard.summary.canEnableExternalAutomation ? '就绪' : '受阻'}</div>
                    <p className="mt-1 text-white/60">外部代办</p>
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
                    待补账号配置: {dispatchState.providerSetupWizard.handoffPayload.missingEnvKeys.join(' / ') || 'none'}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.providerSetupWizard.safetyBoundary}
                  </div>
                </div>
                {dispatchState.providerSetupState ? (
                  <div className="mt-2 grid gap-2 md:grid-cols-4">
                    <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                      已保存记录: {dispatchState.providerSetupState.summary.records}
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                      账号配置: {dispatchState.providerSetupState.provided.envKeys.join(' / ') || 'none'}
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                      门店授权: {dispatchState.providerSetupState.summary.merchantApprovals}
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                      经营表格: {dispatchState.providerSetupState.summary.dataContracts}
                    </div>
                  </div>
                ) : null}
                {dispatchState.providerReadinessHealth ? (
                  <div className="mt-2">
                    <div className="text-white/45">外部条件可用性</div>
                    <div className="mt-2 grid gap-2 md:grid-cols-6">
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="font-mono text-white">{dispatchState.providerReadinessHealth.payloadShape}</div>
                        <p className="mt-1 text-white/60">检查数据</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="font-mono text-white">{dispatchState.providerReadinessHealth.summary.readinessScore}%</div>
                        <p className="mt-1 text-white/60">可用分</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="font-mono text-white">{dispatchState.providerReadinessHealth.summary.healthReady}</div>
                        <p className="mt-1 text-white/60">可用项</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="font-mono text-white">{dispatchState.providerReadinessHealth.summary.rememberedNotProbed}</div>
                        <p className="mt-1 text-white/60">已记录待检查</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="font-mono text-white">{dispatchState.providerReadinessHealth.summary.configuredButUnreachable}</div>
                        <p className="mt-1 text-white/60">暂不可达</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="font-mono text-white">{dispatchState.providerReadinessHealth.summary.canEnableExternalAutomation ? '就绪' : '受阻'}</div>
                        <p className="mt-1 text-white/60">可否代办</p>
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
                          <p className="mt-1 text-white/45">已确认: {item.configuredEvidence.join(' / ') || 'none'}</p>
                          <p className="mt-1 text-white/45">还缺: {item.missingEvidence.join(' / ') || 'none'}</p>
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
                <div className="text-white/45">补资料包</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupPack.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.providerSetupPack.restaurant} / {dispatchState.providerSetupPack.offer}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupPack.summary.ready}</div>
                    <p className="mt-1 text-white/60">已满足条件</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupPack.summary.missing}</div>
                    <p className="mt-1 text-white/60">待补条件</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupPack.summary.blockedCapabilities}</div>
                    <p className="mt-1 text-white/60">暂不能代办</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupPack.summary.readyForExternalExecution ? '就绪' : '受阻'}</div>
                    <p className="mt-1 text-white/60">外部执行</p>
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
                      <p className="mt-1 text-white/50">解锁: {item.unlocks.join(' / ')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    账号配置: {dispatchState.providerSetupPack.envTemplate.map(item => item.key).join(' / ') || 'none'}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    门店授权: {dispatchState.providerSetupPack.merchantRequests.slice(0, 3).map(item => item.ask).join(' / ') || 'none'}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    本地替代: {dispatchState.providerSetupPack.internalFallbacks.slice(0, 2).map(item => `${item.capability}: ${item.canDoNow.slice(0, 2).join(', ')}`).join(' / ')}
                  </div>
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {dispatchState.providerSetupPack.safetyBoundary}
                </div>
              </div>
            ) : null}
            {dispatchState.externalExecutionWizard ? (
              <div className="md:col-span-3">
                <div className="text-white/45">外部执行补资料向导</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.externalExecutionWizard.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.externalExecutionWizard.restaurant} / {dispatchState.externalExecutionWizard.offer}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeStatus(dispatchState.externalExecutionWizard.verdict)}</div>
                    <p className="mt-1 text-white/60">结论</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.externalExecutionWizard.summary.readySteps}/{dispatchState.externalExecutionWizard.summary.steps}</div>
                    <p className="mt-1 text-white/60">可做步骤</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.externalExecutionWizard.summary.missingProviderGates}</div>
                    <p className="mt-1 text-white/60">待补资料</p>
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
                <div className="text-white/45">受控试跑</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.controlledTrialRun.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.controlledTrialRun.restaurant} / {dispatchState.controlledTrialRun.offer}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeStatus(dispatchState.controlledTrialRun.verdict)}</div>
                    <p className="mt-1 text-white/60">{dispatchState.controlledTrialRun.mode}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.controlledTrialRun.simulation.callback.signatureVerified ? '已验证' : '已拒绝'}</div>
                    <p className="mt-1 text-white/60">签名回执</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.controlledTrialRun.simulation.receipt.status}</div>
                    <p className="mt-1 text-white/60">{dispatchState.controlledTrialRun.simulation.receipt.receiptId}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.controlledTrialRun.businessSignals.summary.visitIntent}</div>
                    <p className="mt-1 text-white/60">到店意向</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {dispatchState.controlledTrialRun.operatorCloseout.map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={`${item.owner}-${item.evidence}`}>
                      <div className="font-mono text-white">{item.owner}</div>
                      <p className="mt-1 text-white/60">{item.action}</p>
                      <p className="mt-1 text-white/50">凭证: {item.evidence}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    外部条件: {dispatchState.controlledTrialRun.externalRequired.slice(0, 3).join(' / ')}
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
                    <p className="mt-1 text-white/60">本地可做</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.toolPolicy.summary.externalReady}</div>
                    <p className="mt-1 text-white/60">外部就绪</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.toolPolicy.summary.blocked}</div>
                    <p className="mt-1 text-white/60">受阻</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.toolPolicy.summary.forbidden}</div>
                    <p className="mt-1 text-white/60">禁止项</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">
                      {dispatchState.toolPolicy.secretProxy.slots.filter(slot => slot.configured).length}/{dispatchState.toolPolicy.secretProxy.slots.length}
                    </div>
                    <p className="mt-1 text-white/60">密钥槽位</p>
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
                <div className="text-white/45">公开门店资料录入</div>
                <div className="mt-2 grid gap-2 md:grid-cols-4">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.publicProfile.mode}</div>
                    <p className="mt-1 text-white/60">{dispatchState.publicProfile.profile.restaurant}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">
                      {dispatchState.publicProfile.fields.filter(item => item.confidence !== 'missing').length}/{dispatchState.publicProfile.fields.length}
                    </div>
                    <p className="mt-1 text-white/60">可用字段</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.publicProfile.memoryUpserts.length}</div>
                    <p className="mt-1 text-white/60">记忆写入</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.publicProfile.missingForActivation.length}</div>
                    <p className="mt-1 text-white/60">缺条件</p>
                  </div>
                </div>
                {dispatchState.publicIntelligenceBrief ? (
                  <div className="mt-3 border border-emerald-200/25 bg-emerald-200/[0.06] p-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">公开情报简报</div>
                        <p className="mt-1 text-sm font-black text-white">
                          {dispatchState.publicIntelligenceBrief.readiness.internalActions} internal actions ready / {dispatchState.publicIntelligenceBrief.readiness.externalGates} external gates
                        </p>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-3 md:min-w-[420px]">
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicIntelligenceBrief.readiness.usableFields}</div>
                          <p className="mt-1 text-white/55">可用字段</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicIntelligenceBrief.readiness.canStartTrial ? '就绪' : '草稿'}</div>
                          <p className="mt-1 text-white/55">试跑状态</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicIntelligenceBrief.platformProfiles.filter(item => item.usableNow).length}/{dispatchState.publicIntelligenceBrief.platformProfiles.length}</div>
                          <p className="mt-1 text-white/55">平台主页</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-5">
                      {dispatchState.publicIntelligenceBrief.platformProfiles.map(item => (
                        <div className="border border-white/10 bg-white/[0.05] p-2" key={item.platform}>
                          <div className="font-mono text-white">{item.platform}</div>
                          <p className="mt-1 text-white/60">{item.usableNow ? '现在可用' : '待补凭证'}</p>
                          <p className="mt-1 line-clamp-3 text-white/45">{item.nextAction}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">素材缺口</div>
                        <div className="mt-2 space-y-1">
                          {dispatchState.publicIntelligenceBrief.materialChecklist.slice(0, 4).map(item => (
                            <p className="text-white/60" key={item.id}>{item.status} · {item.label} · {item.owner}</p>
                          ))}
                        </div>
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">运营脚本</div>
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
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">第一天任务包</div>
                        <p className="mt-1 text-sm font-black text-white">
                          {dispatchState.dayZeroMissionPack.payloadShape} / {formatRuntimeStatus(dispatchState.dayZeroMissionPack.verdict)}
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-white/45">
                          {dispatchState.dayZeroMissionPack.restaurant} / {dispatchState.dayZeroMissionPack.offer}
                        </p>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-4 md:min-w-[520px]">
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.dayZeroMissionPack.summary.readyInternal}</div>
                          <p className="mt-1 text-white/55">本地可做</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.dayZeroMissionPack.summary.needsMerchantEvidence}</div>
                          <p className="mt-1 text-white/55">店长凭证</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.dayZeroMissionPack.summary.externalGated}</div>
                          <p className="mt-1 text-white/55">待补外部条件</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.dayZeroMissionPack.summary.normalizedEvidenceFields}</div>
                          <p className="mt-1 text-white/55">导入字段</p>
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
                        <div className="text-white/45">店长检查清单</div>
                        {dispatchState.dayZeroMissionPack.storeManagerChecklist.slice(0, 5).map(item => (
                          <p className="mt-1 text-white/60" key={`${item.owner}-${item.action}`}>{item.owner}: {item.action}</p>
                        ))}
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">外部解锁</div>
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
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/70">公开试跑种子</div>
                        <p className="mt-1 text-sm font-black text-white">
                          {dispatchState.publicTrialSeed.payloadShape} / {formatRuntimeStatus(dispatchState.publicTrialSeed.verdict)}
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-white/45">
                          {dispatchState.publicTrialSeed.trialIntake.restaurant} / {dispatchState.publicTrialSeed.trialIntake.offer}
                        </p>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-4 md:min-w-[520px]">
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicTrialSeed.summary.usableFields}</div>
                          <p className="mt-1 text-white/55">可用字段</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicTrialSeed.summary.internalHarvestTargets}</div>
                          <p className="mt-1 text-white/55">本地采集</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicTrialSeed.summary.workflowReadySteps}</div>
                          <p className="mt-1 text-white/55">可做步骤</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicTrialSeed.summary.workflowExternalGatedSteps}</div>
                          <p className="mt-1 text-white/55">待补外部条件</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">试跑录入</div>
                        {Object.entries(dispatchState.publicTrialSeed.trialIntake).slice(0, 6).map(([key, value]) => (
                          <p className="mt-1 text-white/60" key={key}>{key}: {String(value)}</p>
                        ))}
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">下一步动作</div>
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
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">公开资料采集包</div>
                        <p className="mt-1 text-sm font-black text-white">
                          {dispatchState.publicSourceHarvestPack.payloadShape} / {formatRuntimeStatus(dispatchState.publicSourceHarvestPack.verdict)}
                        </p>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-3 md:min-w-[420px]">
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicSourceHarvestPack.summary.internalTargets}/{dispatchState.publicSourceHarvestPack.summary.targets}</div>
                          <p className="mt-1 text-white/55">本地目标</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicSourceHarvestPack.summary.merchantUploads}</div>
                          <p className="mt-1 text-white/55">店长上传</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicSourceHarvestPack.summary.providerRequired}</div>
                          <p className="mt-1 text-white/55">待补资料</p>
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
                        <div className="text-white/45">标准化导入字段</div>
                        {dispatchState.publicSourceHarvestPack.normalizedImportTemplate.slice(0, 5).map(item => (
                          <p className="mt-1 text-white/60" key={item.field}>{item.field}: {item.currentValue}</p>
                        ))}
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">执行边界</div>
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
                <div className="text-white/45">运营汇总台</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.opsConsole.summary.runs}</div>
                    <p className="mt-1 text-white/60">运行</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.opsConsole.summary.acceptedReceipts}</div>
                    <p className="mt-1 text-white/60">已验收</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.opsConsole.summary.waitingReceipt}</div>
                    <p className="mt-1 text-white/60">等待</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.opsConsole.summary.recoveryActions}</div>
                    <p className="mt-1 text-white/60">恢复</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.opsConsole.summary.watcherWakeups}</div>
                    <p className="mt-1 text-white/60">巡检</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.opsConsole.summary.blockedExternalGroups}</div>
                    <p className="mt-1 text-white/60">受阻条件</p>
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
                <div className="text-white/45">执行时间线</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionTimeline.payloadShape}</div>
                    <p className="mt-1 text-white/60">{dispatchState.executionTimeline.mode}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionTimeline.summary.runs}</div>
                    <p className="mt-1 text-white/60">运行</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionTimeline.summary.acceptedReceipts}</div>
                    <p className="mt-1 text-white/60">已验收</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionTimeline.summary.watcherWakeups}</div>
                    <p className="mt-1 text-white/60">巡检</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionTimeline.summary.businessSignals}</div>
                    <p className="mt-1 text-white/60">经营信号</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionTimeline.summary.canAutoContinue ? '已开启' : '人工'}</div>
                    <p className="mt-1 text-white/60">继续模式</p>
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
            <p className="text-[11px] font-semibold tracking-[0.16em] text-stone-500">还差哪些外部条件</p>
            <h3 className="mt-1 text-lg font-black text-stone-950">外部发布执行、线索承接、核销的真实接入条件</h3>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-stone-600">
              竞品能做的自动执行，本质上需要 runtime、隔离浏览器、商家账号授权、POS/核销数据合同和回执签名。这里把能内部解决的接口先做实，缺外部的逐项显式阻断。
            </p>
          </div>
          <div className="grid min-w-[260px] grid-cols-3 gap-2 text-center">
            <div className="border border-stone-200 bg-[#fbfaf7] p-2">
              <div className="text-xl font-black text-stone-950">{initialReadiness.summary.ready}</div>
              <div className="mt-1 text-[11px] font-semibold text-stone-500">已具备</div>
            </div>
            <div className="border border-stone-200 bg-[#fbfaf7] p-2">
              <div className="text-xl font-black text-stone-950">{initialReadiness.summary.blocked}</div>
              <div className="mt-1 text-[11px] font-semibold text-stone-500">先补齐</div>
            </div>
            <div className="border border-stone-200 bg-[#fbfaf7] p-2">
              <div className="text-xl font-black text-stone-950">{initialReadiness.summary.configuredRequirements}/{initialReadiness.summary.totalRequirements}</div>
              <div className="mt-1 text-[11px] font-semibold text-stone-500">资料项</div>
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
                      {requirement.configured ? '已接好' : '缺少'}
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
              <p className="text-[11px] font-semibold tracking-[0.16em] text-stone-500">今天要做的门店任务</p>
              <h3 className="mt-1 text-lg font-black text-stone-950">门店任务队列</h3>
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
          <p className="text-[11px] font-semibold tracking-[0.16em] text-stone-500">下次自动带出的门店偏好</p>
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
          <p className="text-[11px] font-semibold tracking-[0.16em] text-stone-500">账号和操作边界</p>
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
                  {policy.allowed ? '允许' : '禁止'}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-stone-200 bg-white p-4">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-stone-500">跟进提醒和发布凭证</p>
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
          <p className="text-[11px] font-semibold tracking-[0.16em] text-stone-500">外部代跑工具接入判断</p>
          <h3 className="mt-1 text-lg font-black text-stone-950">外部代跑工具或隔离浏览器</h3>
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
          <p className="text-[11px] font-semibold tracking-[0.16em] text-stone-500">账号和表格接入清单</p>
          <h3 className="mt-1 text-lg font-black text-stone-950">外部账号、截图和经营表格</h3>
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
        下一步最小可接：先提供一个隔离浏览器环境或外部试跑通道，再接门店平台账号授权；POS、核销和私信数据必须来自商家导出、API 或明确授权。
      </div>
    </section>
  );
}

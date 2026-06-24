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
  'internal-ready': '本地可先准备',
  'requires-runtime': '待接试跑通道',
  'requires-credential': '待账号资料',
  'requires-merchant-auth': '待店长授权',
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
  'external-runtime': '试跑交接通道',
};

const runtimeStatusLabel: Record<string, string> = {
  accepted: '待复核',
  'accepted-train-next-run': '待复核可准备',
  active: '授权待复核',
  allowed: '允许',
  blocked: '待补资料',
  complete: '待复核记录',
  denied: '已拒绝',
  directional: '方向参考',
  done: '待复核记录',
  error: '错误',
  failed: '失败',
  forwarded: '已转发',
  forbidden: '禁止',
  gated: '待补资料',
  'high-confidence': '判断较明确',
  idle: '待操作',
  inactive: '未授权',
  'low-confidence': '先人工确认',
  loading: '处理中',
  measured: '可量化',
  'medium-confidence': '需要复核',
  mixed: '有好有坏',
  pending: '待确认',
  passed: '已复核',
  p0: '优先补齐',
  p1: '随后补齐',
  positive: '正向',
  'public-search': '公开资料',
  queued: '已排队',
  ready: '可先准备',
  'ready-now': '本地可先准备',
  'ready-internal': '本地可先准备',
  'internal-ready': '本地可先准备',
  'ready-to-check': '可检查',
  'ready-to-pilot': '可小范围试跑',
  'ready-to-sign': '可签收',
  'ready-to-submit': '待交接复核',
  'ready-to-test': '可测试',
  'ready-for-provider': '待交接复核',
  'ready-for-trial': '可以开始试跑',
  'run-now': '样例可先准备',
  'run-internal': '本地执行',
  risk: '有风险',
  'sample-ready': '样例待复核',
  waiting: '等待中',
  'waiting-evidence': '待补凭证',
  warning: '提醒',
  'waiting-proof': '等凭证',
  'waiting-provider': '待补资料',
  'waiting-provider-callback': '等试跑回执',
  'wait-provider': '待补资料',
  'waiting-external': '待补账号/授权/数据',
  'waiting-receipt': '等回执',
  'provider-gated': '待补资料',
  'data-gated': '待补数据',
  'external-gated': '待补账号/授权/数据',
  'needs-evidence': '待补凭证',
  'needs-merchant-review': '待店长确认',
  'needs-owner': '待负责人确认',
  'needs-proof': '待补凭证',
  'needs-provider': '待补资料',
  'needs-review': '待审核',
  'needs-server-key': '待账号配置',
  'next-shift': '下个班次',
  'missing-data-contract': '待补数据规则',
  'missing-evidence': '待补凭证',
  'missing-merchant-grant': '待店长授权',
  'missing-runtime': '待配置试跑通道',
  'merchant-gated': '待店长授权',
  'needs-data-contract': '待补数据规则',
  'needs-merchant-auth': '待店长授权',
  'external-blocked': '待补账号/授权/数据',
  'provider-health-ready': '账号资料待复核',
  'setup-evidence-signed': '资料待复核',
  'sandbox-simulator': '样例模拟',
  'runtime-callback-blocked': '待回执配置',
  'review-needed': '待审核',
  'receipt-rejected-recovery': '回执拒收待恢复',
  'ai-can-run-internal': '本地可先准备',
  'provider-required': '待补资料',
  'merchant-upload': '店长上传',
  'evidence-required': '待补凭证',
  'staff-review': '等员工确认',
  'training-needed': '待训练',
  'blocked-provider': '待补资料',
  'blocked-data-contract': '待补数据规则',
  'blocked-provider-setup': '待补账号配置',
  'blocked-sensitive': '敏感信息拦截',
  'blocked-before-launch': '交接前暂停',
  'blocked-before-dispatch': '交接前暂停',
  'blocked-before-submit': '交接前暂停',
  'blocked-missing-scope': '待店长授权范围',
  'blocked-until-accepted-receipts': '回执复核前不承诺',
  'needs-receipt': '等回执',
  'blocked-before-callback': '回执前暂停',
  'needs-public-proof': '待补公开凭证',
  missing: '待补资料',
  'not-built': '待生成',
  'package:none': '未选择资料包',
  'ready-for-internal-shift': '本地班次可先准备',
  'simulator-first': '先跑模拟',
  'simulator-only': '仅样例可先准备',
  unknown: '未知',
  'usable-internal-analysis': '可先准备本地复盘',
  'merchant-auth-required': '待店长授权',
  'sign-merchant-scope-first': '先签授权范围',
  'provider-unlock-first': '先补账号资料',
  'preview-before-run': '先预览再试跑',
  'provider-setup-required': '待补账号配置',
  'activated-internal': '本地已激活',
  'trained-needs-provider': '已训练待补资料',
  today: '今日处理',
  'waiting-provider-setup': '等账号配置',
  'server-keys-first': '先补账号配置',
  'server-only': '仅服务端保存',
  'server-proxy': '服务端代管',
  'server-env-or-secret-manager-only': '服务端安全保存',
  'server-side-placeholder-only': '仅服务端占位',
  'needs-field-mapping': '待字段映射',
  callback: '回执',
  check: '检查',
  click: '点击',
  fill: '填写',
  final: '最终回执',
  'final-receipt-only': '只接收最终签名回执',
  'external-browser-runbook': '受控试跑操作清单',
  navigate: '打开页面',
  observe: '观察',
  preflight: '试跑前检查',
  inspect: '查看公开凭证',
  capture: '截图留证',
  extract: '提取回执字段',
  screenshot: '截图留证',
  step: '步骤',
  submit: '交接',
  'collect-evidence': '收集凭证',
  'prepare-manual': '人工准备',
  material: '训练材料',
  'isolated-browser-handoff': '隔离试跑交接',
  'local-signed-callback': '本地签名回执样例',
  'run-started': '试跑进行中待复核',
  'step-completed': '步骤待复核记录',
  'step-blocked': '步骤待补资料',
  'run-failed': '试跑失败待复核',
  'run-completed': '试跑收尾待复核',
  'audit-only': '仅写入复核台账',
  recovery: '进入恢复队列',
  watcher: '进入跟进提醒',
  high: '高',
  medium: '中',
  low: '低',
  'public-proof': '公开凭证',
  'manual-review': '人工复核',
  'local-plan': '本地计划',
  'manual-handoff': '人工交接',
  'external-runtime': '试跑交接通道',
  'isolated-agent-browser': '隔离试跑环境',
  'signed-in-user-browser': '店长授权环境',
  'menu-profit': '菜单毛利复核',
  'traffic-growth': '到店增长',
  'conversion-followup': '转化跟进',
  'operations-review': '经营复盘',
  'brand-content': '内容素材',
  'provider-launch': '试跑交接准备',
  'browser-request-gateway': '试跑请求交接',
  'internal-first-provider-gated': '本地优先，待补资料',
  'internal-execution-ready': '本地可先准备',
  'training-and-provider-gated': '待训练和资料',
  'local-simulator': '本地样例试跑',
  'external-ready': '资料补齐后待复核',
  'no-run': '尚未试跑',
  'local-watch': '本地跟进中',
  'needs-recovery': '待恢复处理',
  'business-review': '经营复核',
  'real-provider': '账号资料确认通道',
  'setup-required': '待补配置',
  'supervised-browser': '人工监督试跑',
  simulator: '样例模拟',
  'public-sample': '公开样例',
  'manual-public-profile': '手工公开资料',
  'handoff-only': '仅交接',
  'supervised-ready': '人工监督可做',
  'needs-human': '待人工确认',
  'review-ready': '可复核',
  approval: '待授权',
  'stop-line': '停止线',
  'next-action': '下一步',
  'missing-material': '待补材料',
};

const internalSurfaceTokenPattern =
  /RESTAURANT_AGENT_|x-restaurant-agent-signature|external-receipt|\/(?:tasks|health|events|runs)\b|POST\s|runtimeTarget|targetRuntime|payloadShape|taskId|runId|eventId|externalRunId|receiptId|couponClaimCount|redemptionCount|WeChat ID|coupon code|payment id|signed lead receipt|remembered packs|^[a-z]+(?:-[a-z0-9]+)+$|^[a-z]+_[a-z0-9_]+$|[a-z][A-Z][a-zA-Z]+/;

const formatRuntimeInternalFallback = (value: string, fallback: string) => {
  const trimmed = value.trim();
  if (!trimmed) return '';
  return internalSurfaceTokenPattern.test(trimmed) ? fallback : trimmed;
};

const formatRuntimeStatus = (status: unknown) => {
  if (typeof status !== 'string') return String(status ?? '');
  return runtimeStatusLabel[status] || formatRuntimeInternalFallback(status, '内部状态摘要（仅运营复核）');
};

const formatRuntimeGate = (value: unknown, readyLabel = '资料可复核', blockedLabel = '待补资料') =>
  value ? readyLabel : blockedLabel;

const runtimeTitleLabel: Record<string, string> = {
  'Today Operations': '今日门店运营',
  'AI Consultant': '经营建议复核',
  'Automation Launch': '试跑交接准备',
  'Evidence Review': '凭证复核',
  'Persistent Browser Agent': '隔离试跑通道',
  'Auto Publish': '发布凭证',
  'Auto Lead Capture': '线索承接',
  'Coupon Redemption': '券码核销',
  'Business Analysis': '经营复盘',
  'Memory Follow-up': '门店记忆跟进',
};

const formatRuntimeLabel = (label: unknown) => {
  if (typeof label !== 'string') return String(label ?? '');
  return runtimeTitleLabel[label] || formatRuntimeInternalFallback(label, '内部模块（仅运营复核）');
};

const formatRuntimeNarrative = (text: unknown) => {
  if (typeof text !== 'string') return String(text ?? '');
  return text
    .replaceAll('kuaizi-style-platform-spine', '门店增长工作台底座')
    .replaceAll('shaozi-claw-cloud-style-ai-employee-workbench', '店长和运营可用的任务工作台')
    .replaceAll('lobu-openclaw-hermes-browser-agent', '试跑交接通道')
    .replaceAll('OpenClaw', '试跑交接通道')
    .replaceAll('openclaw', '试跑交接通道')
    .replaceAll('Provider callback', '试跑通道回执')
    .replaceAll('provider callback', '试跑通道回执')
    .replaceAll('Provider', '试跑通道账号')
    .replaceAll('provider', '试跑通道账号')
    .replaceAll('signed callback simulator', '签名回执模拟器')
    .replaceAll('browser session manifest', '隔离试跑会话清单')
    .replaceAll('browser-session manifest', '隔离试跑会话清单')
    .replaceAll('browser runbook package', '试跑操作清单包')
    .replaceAll('browser-runbook package', '试跑操作清单包')
    .replaceAll('runbook package', '操作清单包')
    .replaceAll('runbook', '操作清单')
    .replaceAll('browser executor', '试跑执行通道')
    .replaceAll('browser session', '隔离试跑会话')
    .replaceAll('browser profile', '隔离试跑环境')
    .replaceAll('isolated profile', '隔离试跑环境')
    .replaceAll('profile', '隔离试跑环境')
    .replaceAll('callback secret', '回执签名配置')
    .replaceAll('callback header', '回执签名规则')
    .replaceAll('signed callback', '签名回执')
    .replaceAll('public proof URL', '公开凭证链接')
    .replaceAll('public proof', '公开凭证')
    .replaceAll('proof URL', '凭证链接')
    .replaceAll('sample URL', '样例链接')
    .replaceAll('unknown event', '未匹配事件')
    .replaceAll('duplicate evidence', '重复凭证')
    .replaceAll('rejectedReason', '拒收原因')
    .replaceAll('evidenceSummary', '凭证摘要')
    .replaceAll('signedAt', '签收时间')
    .replaceAll('eventId', '事件编号')
    .replaceAll('taskId', '任务编号')
    .replaceAll('runId', '试跑编号')
    .replaceAll('externalRunId', '试跑回执编号')
    .replaceAll('receiptId', '回执编号')
    .replaceAll('payloadShape', '资料包格式')
    .replaceAll('providerGate', '待补条件')
    .replaceAll('providerGated', '待补账号资料')
    .replaceAll('providerNeeded', '待补账号资料')
    .replaceAll('providerRequired', '待补账号资料')
    .replaceAll('providerUnlocks', '账号资料解锁项')
    .replaceAll('missingExternalProviders', '待补账号资料')
    .replaceAll('runtimeTarget', '试跑通道')
    .replaceAll('targetRuntime', '试跑通道')
    .replaceAll('外部执行投递包', '试跑交接资料包')
    .replaceAll('执行投递包', '试跑交接资料包')
    .replaceAll('投递包', '交接资料包')
    .replaceAll('外部执行器', '试跑交接通道')
    .replaceAll('竞品能力审计', '对标打法复核')
    .replaceAll('审计日志', '复核记录')
    .replaceAll('审计台账', '复核台账')
    .replaceAll('审计、', '复核、')
    .replaceAll('和审计', '和复核')
    .replaceAll('audit log', '复核留痕')
    .replaceAll('auditLog', '复核留痕')
    .replaceAll('remembered packs', '已保存试跑包')
    .replaceAll('signed lead receipt', '线索确认回执')
    .replaceAll('WeChat ID', '微信号')
    .replaceAll('coupon code', '优惠码')
    .replaceAll('payment id', '支付凭证号')
    .replaceAll('couponClaimCount', '领券数')
    .replaceAll('redemptionCount', '到店核销数')
    .replaceAll('券领取数', '领券数')
    .replaceAll('核销数', '到店核销数')
    .replaceAll('手机号', '联系电话')
    .replaceAll('支付单号', '支付凭证号')
    .replaceAll('API key', '服务端账号配置')
    .replaceAll('API', '接口配置')
    .replaceAll('POS/coupon aggregate contract', '收银/券码汇总数据约定')
    .replaceAll('coupon aggregate contract', '券码汇总数据约定')
    .replaceAll('POS / 收银', '收银汇总')
    .replaceAll('POS', '收银汇总')
    .replaceAll('gateway / worker', '试跑任务交接通道')
    .replaceAll('browser runner callback contract', '试跑回执约定')
    .replaceAll('browser runner event ledger', '试跑事件台账')
    .replaceAll('browser runner', '试跑执行通道')
    .replaceAll('run health', '试跑回执状态检查')
    .replaceAll('setup contract', '配置约定')
    .replaceAll('grant manifest', '授权清单')
    .replaceAll('grant checklist wizard', '授权补齐清单')
    .replaceAll('grant checklist', '授权补齐清单')
    .replaceAll('gateway', '试跑任务交接通道')
    .replaceAll('worker', '任务负责人')
    .replaceAll('runner', '试跑执行通道')
    .replaceAll('adapter', '接入约定')
    .replaceAll('contract', '约定')
    .replaceAll('probe', '连通检查')
    .replaceAll('manifest', '清单')
    .replaceAll('wizard', '补齐向导')
    .replaceAll('payload', '交接资料包')
    .replaceAll('secret proxy', '账号配置保护')
    .replaceAll('POS import schema validator', '收银汇总字段校验')
    .replaceAll('tool policy', '工具边界规则')
    .replaceAll('watcher policy', '跟进提醒规则')
    .replaceAll('agent ops console', '运营复核台')
    .replaceAll('Agent', '任务助手')
    .replaceAll('agent', '任务助手')
    .replaceAll('public profile intake', '公开资料入口')
    .replaceAll('public 浏览器隔离环境 intake', '公开资料入口')
    .replaceAll('schema validator', '字段校验')
    .replaceAll('webhook', '通知回执通道')
    .replaceAll('runtime URL', '试跑通道地址')
    .replaceAll('runtime key', '试跑通道账号')
    .replaceAll('runtime', '试跑通道')
    .replaceAll('configured/missing', '配置待复核/待补')
    .replaceAll('已验收回执', '待复核回执')
    .replaceAll('已验收凭证', '待复核凭证')
    .replaceAll('交接已验收', '交接待复核')
    .replaceAll('已验收记录', '待复核记录')
    .replaceAll('已验收的本地回执', '待复核的本地回执')
    .replaceAll('签名回执已验收', '签名回执待复核')
    .replaceAll('脱敏交接包已验收', '脱敏交接包待复核')
    .replaceAll('已验收', '待复核')
    .replaceAll('已完成', '已记录')
    .replaceAll('自动化', '自行越权')
    .replaceAll('API key', '账号配置值')
    .replaceAll('API keys', '账号配置值')
    .replaceAll('API', '系统接口')
    .replaceAll('cookie', '登录状态')
    .replaceAll('cookies', '登录状态')
    .replaceAll('token', '账号配置值')
    .replaceAll('tokens', '账号配置值')
    .replaceAll('Hermes', '常驻试跑通道')
    .replaceAll('Lobu', '事件试跑通道')
    .replaceAll('Claw', '门店打法');
};

const formatSetupItemCount = (items: unknown[] | undefined, emptyLabel = '暂无待补项') => {
  const count = items?.length ?? 0;
  return count > 0 ? `${count} 项待补` : emptyLabel;
};

const formatRuntimeTargetLabel = (target: unknown) => {
  void target;
  return '试跑通道';
};

const runtimeActionLabel: Record<string, string> = {
  'manual-sanitize': '人工脱敏',
  prepare_publish_draft: '准备发布草稿',
  open_public_page: '打开公开页面',
  capture_public_proof: '采集公开凭证',
  send_signed_receipt: '发送签名回执',
  submit_sandbox_run: '交接样例试跑',
};

const formatRuntimeActionLabel = (action: unknown) => {
  if (typeof action !== 'string') return String(action ?? '');
  return runtimeActionLabel[action] || formatRuntimeInternalFallback(action, '内部动作（仅运营复核）');
};

const runtimeToolLabel: Record<string, string> = {
  click: '点击',
  navigate: '打开页面',
  screenshot: '截图留证',
  type: '填写',
};

const formatRuntimeToolLabel = (tool: unknown) => {
  if (typeof tool !== 'string') return String(tool ?? '');
  return runtimeToolLabel[tool] || formatRuntimeInternalFallback(tool, '工具动作（仅运营复核）');
};

const runtimeOwnerLabel: Record<string, string> = {
  merchant: '店长',
  ops: '运营',
  operator: '员工通道负责人',
  'restaurant-ops': '门店运营',
  'store-manager': '店长',
  'runtime-admin': '技术复核',
  'community-ops': '社群运营',
  'data-ops': '数据复核',
  finance: '财务',
};

const formatRuntimeOwner = (owner: unknown) => {
  if (typeof owner !== 'string') return String(owner ?? '');
  return runtimeOwnerLabel[owner] || formatRuntimeInternalFallback(owner, '内部复核');
};

const runtimeSchemaLabel: Record<string, string> = {
  'POST /tasks': '提交试跑交接任务',
  '/events': '回执事件入口',
  '/health': '账号资料复核检查',
  '/runs': '试跑记录清单',
  '/tasks': '试跑任务清单',
  'accepted imports=1': '待复核导入 1 份',
  'adapter:needs-runtime-config': '待补试跑通道配置',
  'api keys': '账号配置值',
  'auto-coupon-redemption': '核销数据承接',
  'auto-lead-acquisition': '线索承接',
  'auto-publish-proof': '发布凭证回收',
  address: '门店地址',
  'agent-ops': '运营复核',
  'agent-runtime-control': '试跑执行控制',
  audience: '目标客群',
  'audit-only': '仅写入复核台账',
  'brand-positioning': '品牌定位',
  'browser profile ids': '隔离环境编号',
  'browser-execution': '试跑执行',
  build: '本地可建',
  'chain-standard': '连锁标准',
  channels: '触达渠道',
  'cloud-agent-ops': '常驻运营看板',
  constraints: '限制条件',
  'competitive-intel': '竞品情报',
  cookies: '登录状态',
  'coupon code': '优惠码',
  'coupon-redemption': '团购核销',
  couponClaimCount: '领券数',
  'customer PII': '顾客隐私信息',
  'execution-receipts': '回执凭证复核',
  evidence: '凭证要求',
  evidenceLevel: '凭证等级',
  'external-required': '待补账号/授权/数据',
  externalRunId: '试跑回执编号',
  'external-receipt': '签名回执',
  'external-runtime': '试跑交接通道',
  payloadShape: '资料包格式',
  providerGate: '待补条件',
  providerGated: '待补账号资料',
  providerNeeded: '待补账号资料',
  providerRequired: '待补账号资料',
  providerUnlocks: '账号资料解锁项',
  missingExternalProviders: '待补账号资料',
  runtimeTarget: '试跑通道',
  targetRuntime: '试跑通道',
  packageId: '资料包编号',
  'pos-import-accepted': '收银汇总待复核',
  'prepare_publish_draft': '准备发布草稿',
  read_private_message: '读取私信原文',
  endpointEnv: '服务端试跑通道配置项',
  apiKeyEnv: '试跑通道账号配置项',
  submitPath: '试跑交接入口',
  healthPath: '资料复核检查入口',
  grossSales: '销售额',
  'gross sales': '销售额',
  inquiry: '咨询',
  'finance-diagnosis': '财务诊断',
  'food-safety': '食品安全',
  'lead-acquisition-receipt': '线索承接回执',
  manual: '人工录入',
  'legal-compliance': '法务合规',
  'local-life-content': '本地生活内容',
  'member-growth': '会员增长',
  'menu-engineering': '菜单优化',
  'multi-tenant-runtime': '多门店试跑隔离',
  'RESTAURANT_AGENT_BROWSER_PROFILE_ID': '浏览器隔离环境编号',
  'RESTAURANT_AGENT_CALLBACK_SECRET': '签名回执配置',
  'RESTAURANT_AGENT_HERMES_API_KEY': '试跑通道账号',
  'RESTAURANT_AGENT_HERMES_RUNTIME_URL': '试跑通道地址',
  'RESTAURANT_AGENT_LOBU_API_KEY': '试跑通道账号',
  'RESTAURANT_AGENT_LOBU_RUNTIME_URL': '试跑通道地址',
  'RESTAURANT_AGENT_OPENCLAW_API_KEY': '试跑通道账号',
  'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL': '试跑通道地址',
  RESTAURANT_POS_DATA_MODE: '收银数据模式',
  RESTAURANT_POS_FIELD_DICTIONARY: '收银字段说明表',
  'coupon-claim': '领券线索',
  eventId: '事件编号',
  signedAt: '签收时间',
  callbackAction: '回执动作',
  callbackHeader: '回执签名规则',
  'callback header': '回执签名规则',
  'signed callback': '签名回执',
  'signed external-receipt': '签名回执',
  'public proof URL': '公开凭证链接',
  'public proof': '公开凭证',
  'proof URL': '凭证链接',
  'sample URL': '样例链接',
  'unknown event': '未匹配事件',
  'duplicate evidence': '重复凭证',
  rejectedReason: '拒收原因',
  evidenceSummary: '凭证摘要',
  'public URL': '公开链接',
  'screenshot id': '截图编号',
  'operator summary': '操作摘要',
  'provider error code': '试跑通道错误说明',
  '员工通道 webhook': '员工通知通道',
  tenantId: '门店试跑空间',
  taskId: '任务编号',
  runId: '试跑编号',
  owner: '负责人',
  channel: '渠道',
  evidenceUrl: '凭证链接',
  screenshotId: '截图编号',
  blockedActions: '已拦截动作',
  nextAction: '下一步',
  'no-PII private-domain data contract': '去隐私私域数据约定',
  'Do not close the task or claim external automation until a signed callback or public proof receipt is accepted.': '没有签名回执或公开凭证复核前，不关闭任务、不能标记交接待复核。',
  offer: '主推菜 / 套餐',
  orderCount: '订单数',
  orders: '订单数',
  segmentName: '分群名称',
  followupCount: '跟进数量',
  ingredientCost: '食材成本',
  platformFee: '平台费用',
  'bank account': '银行账号',
  'package:none': '未选择资料包',
  'payment id': '支付凭证号',
  'private-domain': '私域咨询',
  'platform-spine-ledger': '经营链路台账',
  phone: '联系电话',
  'pos-analytics': '收银经营复盘',
  'private message text': '私信原文',
  'raw POS rows': '收银明细（不接收）',
  redemptionCount: '到店核销数',
  restaurant: '门店',
  'restaurant-data-contracts': '经营数据约定',
  reservation: '预约',
  'reservation-ops': '预约到店',
  'review-recovery': '差评挽回',
  'runner-event': '试跑事件台账',
  recovery: '恢复处理',
  safePayload: '脱敏交接资料包',
  signature: '签名',
  'signed lead receipt': '线索确认回执',
  'signed-receipt': '签名回执',
  'sanitized POS aggregate': '脱敏收银汇总',
  'secret-proxy-tool-policy': '权限与账号配置边界',
  'service-quality': '服务质检',
  'shared-memory-watchers': '门店记忆与跟进提醒',
  'opened url': '已打开公开页面',
  operator: '运营复核',
  public: '公开资料',
  env: '服务端配置',
  internal: '本地配置',
  'merchant-auth': '店长授权',
  'merchant-authorization': '店长授权',
  'data-contract': '数据约定',
  'pos-contract': '收银数据约定',
  'platform-account': '平台账号',
  'public-profile': '公开资料档案',
  'pos-import': '收银汇总导入',
  'provider-setup': '账号资料配置',
  'callback_simulator': '本地回执样例',
  'run-ledger': '试跑记录台账',
  'receipt-ledger': '回执台账',
  'browser-session': '隔离试跑会话',
  'setup-wizard': '补资料向导',
  'health-probe': '资料复核',
  'sandbox-contract': '样例复核约定',
  'publish-inbox': '发布回执收件箱',
  'planned-runbook': '计划内操作清单',
  'launch-gate': '交接门禁',
  'receipt-closeout': '回执收尾',
  'proof-backfill': '凭证回填',
  revision: '复核修订',
  sourceNotes: '资料备注',
  source: '资料来源',
  'staff-scheduling': '排班人效',
  'staff-delivery': '员工任务下发',
  stepId: '步骤编号',
  watcher: '跟进提醒',
  writesTo: '写入位置',
  visitReason: '到店理由',
  'true-operating-analysis': '经营汇总复盘',
  'visit-intent': '到店意向',
  'WeChat ID': '微信号',
  'waitingReceipts:0': '暂无回执',
  'x-restaurant-agent-signature': '签名回执规则',
};

const formatRuntimeSchemaLabel = (value: unknown) => {
  if (typeof value !== 'string') return String(value ?? '');
  return runtimeSchemaLabel[value] || formatRuntimeInternalFallback(value, '内部字段摘要（仅运营复核）');
};

const formatRuntimeSchemaList = (values: unknown[] | undefined, emptyLabel = '无') => {
  const labels = (values || []).map(value => formatRuntimeNarrative(formatRuntimeSchemaLabel(value))).filter(Boolean);
  return labels.length ? labels.join(' / ') : emptyLabel;
};

const formatRuntimeEvidenceValue = (value: unknown, emptyLabel = '待补凭证') => {
  if (Array.isArray(value)) return formatRuntimeSchemaList(value, emptyLabel);
  const label = formatRuntimeSchemaLabel(value);
  return formatRuntimeNarrative(label || emptyLabel);
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
    label: '券码与收银汇总包',
    description: '券核销、收银汇总导入和财务凭证条件',
    moduleIds: ['coupon-redemption', 'pos-analytics', 'finance-diagnosis', 'legal-compliance'],
  },
  {
    id: 'agent-governance',
    label: '交接治理包',
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
  const [restaurantCommand, setRestaurantCommand] = useState(`今晚把 ${runtimeIntake.offer} 做成大众点评和小红书可发布版本，发布后回填截图回执，收盘后看核销和库存异常。`);
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
    setDispatchState({ status: 'loading', message: '正在生成试跑交接任务...' });
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
        setDispatchState({ status: 'blocked', message: formatRuntimeNarrative(payload?.message || '任务被拦截，缺少运行条件。') });
        return;
      }
      setDispatchState({
        status: payload.dispatch.status,
        eventId: payload.dispatch.eventId,
        tenantId: payload.dispatch.tenantId,
        message: formatRuntimeNarrative(payload.dispatch.nextAttachStep),
        latestRuns: payload.run ? [payload.run] : undefined,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '本地试跑服务暂不可用。' });
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
        message: `试跑工作流已创建待复核：共 ${payload?.trialWorkflowPack?.summary?.steps ?? 0} 步，可先准备 ${payload?.trialWorkflowPack?.summary?.readySteps ?? 0} 步，待补账号/授权/数据 ${payload?.trialWorkflowPack?.summary?.externalGatedSteps ?? 0} 步。`,
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
        message: `默认路径：可做 ${payload?.clawExperienceDefaultPath?.summary?.readyNow ?? 0} 项，待准备 ${payload?.clawExperienceDefaultPath?.summary?.trainingNeeded ?? 0} 项，待补资料/边界 ${payload?.clawExperienceDefaultPath?.summary?.providerGated ?? 0} 项。`,
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
    setDispatchState({ status: 'loading', message: '正在检查试跑交接通道...' });
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
        message: formatRuntimeNarrative(payload?.bridge?.message || payload?.dispatch?.nextAttachStep || '试跑交接通道未配置。'),
        latestRuns: payload?.run ? [payload.run] : undefined,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '试跑交接通道检查失败。' });
    }
  };

  const runHeartbeat = async () => {
    setDispatchState({ status: 'loading', message: '正在检查回执和店长跟进...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'heartbeat' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.heartbeat?.taskWakeups || payload?.heartbeat?.shiftAutopilotRuns ? 'blocked' : 'queued',
        message: `回执和店长跟进已检查 ${payload?.heartbeat?.watchedRuns ?? 0} 条试跑记录。`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        heartbeat: payload?.heartbeat,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue,
        storeManagerTaskWatcher: payload?.heartbeat?.storeManagerTaskWatcher,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '回执和店长跟进检查暂不可用。' });
    }
  };

  const refreshReadiness = async () => {
    setDispatchState({ status: 'loading', message: '正在检查账号资料条件...' });
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
          ? `还有 ${payload.readiness.summary.blocked} 组账号资料条件未满足。`
          : '账号资料条件待复核，可进入受控试跑预检。',
        readiness: payload?.readiness,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '账号资料检查暂不可用。' });
    }
  };

  const importSampleReceipt = async () => {
    setDispatchState({ status: 'loading', message: '正在导入一条样例回执凭证...' });
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
          summary: '样例：已导入发布链接和截图编号，等待店长回填的待复核回执替换。',
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.receipt?.status === 'accepted' ? 'queued' : 'blocked',
        eventId: payload?.receipt?.eventId,
        message: payload?.receipt?.status === 'accepted'
          ? '回执已进入跟进检查，可触发门店资料沉淀和下一步跟进。'
          : formatRuntimeNarrative(payload?.receipt?.rejectedReason || '回执缺少证据字段。'),
        receipts: payload?.receipts,
        heartbeat: payload?.heartbeat,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '回执导入暂不可用。' });
    }
  };

  const buildRecoveryPlan = async () => {
    setDispatchState({ status: 'loading', message: '正在生成异常恢复计划...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recovery' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: 'queued',
        message: `恢复动作已创建待复核：${payload?.recovery?.actions?.length ?? 0} 条。`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        readiness: payload?.readiness,
        recovery: payload?.recovery,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '异常恢复计划暂不可用。' });
    }
  };

  const buildBrowserSession = async () => {
    setDispatchState({ status: 'loading', message: '正在生成隔离试跑会话清单...' });
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
        message: formatRuntimeNarrative(payload?.browserSession?.handoff?.nextStep || '隔离试跑会话清单生成失败。'),
        browserSession: payload?.browserSession,
        browserSessionHealth: payload?.browserSessionHealth,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '隔离试跑会话清单暂不可用。' });
    }
  };

  const buildGrantManifest = async () => {
    setDispatchState({ status: 'loading', message: '正在生成店长授权与工具边界清单...' });
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
        message: formatRuntimeNarrative(payload?.grantManifest?.nextStep || '店长授权清单生成失败。'),
        grantManifest: payload?.grantManifest,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '店长授权清单暂不可用。' });
    }
  };

  const buildGrantChecklist = async () => {
    setDispatchState({ status: 'loading', message: '正在生成授权清单向导...' });
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
        message: formatRuntimeNarrative(payload?.grantChecklist?.nextStep || '授权补齐清单生成失败。'),
        grantChecklist: payload?.grantChecklist,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '授权清单向导暂不可用。' });
    }
  };

  const inspectActivationGates = async () => {
    setDispatchState({ status: 'loading', message: '正在检查门店工单解锁条件...' });
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
        message: formatRuntimeNarrative(payload?.activationGates?.answerToCustomer || '门店工单解锁条件生成失败。'),
        activationGates: payload?.activationGates,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '门店工单解锁条件暂不可用。' });
    }
  };

  const inspectCompetitorAudit = async () => {
    setDispatchState({ status: 'loading', message: '正在生成公开对标打法复核...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'competitor-audit' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.competitorAudit?.summary?.externalRequired ? 'blocked' : 'queued',
        message: `对标复核已覆盖 ${payload?.competitorAudit?.summary?.total ?? 0} 个打法维度；待补账号/授权/数据 ${payload?.competitorAudit?.summary?.externalRequired ?? 0} 个。`,
        competitorAudit: payload?.competitorAudit,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '公开对标打法复核暂不可用。' });
    }
  };

  const buildCompetitorTrainingBlueprint = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成对标准备清单……' }));
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
        message: `对标准备清单：本地可准备 ${payload?.competitorTrainingBlueprint?.summary?.trainableNow ?? 0} 项，账号资料/数据约定 ${payload?.competitorTrainingBlueprint?.summary?.providerContracts ?? 0} 项，对标口径${payload?.competitorTrainingBlueprint?.summary?.canClaimCompetitorParity ? '可参考' : '待补资料'}。`,
        competitorTrainingBlueprint: payload?.competitorTrainingBlueprint || previous.competitorTrainingBlueprint,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '对标准备清单暂不可用。' }));
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
        message: `路线判断：目标 ${formatRuntimeNarrative(payload?.competitorRouteDecision?.finalTarget || '未知')}，本地能力 ${payload?.competitorRouteDecision?.summary?.internalCanShipNow ?? 0} 项，待补账号资料 ${payload?.competitorRouteDecision?.summary?.externalRequired ?? 0} 项。`,
        competitorRouteDecision: payload?.competitorRouteDecision || previous.competitorRouteDecision,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '路线判断暂不可用。' }));
    }
  };

  const inspectBuildQueue = async () => {
    setDispatchState({ status: 'loading', message: '正在生成门店工单构建队列...' });
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
    setDispatchState({ status: 'loading', message: '正在生成试跑交接资料包...' });
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
        message: formatRuntimeNarrative(payload?.executionPackage?.nextStep || '试跑交接资料包生成失败。'),
        executionPackage: payload?.executionPackage,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '试跑交接资料包暂不可用。' });
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
    setDispatchState({ status: 'loading', message: '正在检查试跑回执和复核状态...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'run-health' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.runHealth?.summary?.blockedAuth || payload?.runHealth?.summary?.failed ? 'blocked' : 'queued',
        message: `试跑回执已检查 ${payload?.runHealth?.summary?.totalRuns ?? 0} 条记录，等待回执 ${payload?.runHealth?.summary?.waitingReceipt ?? 0} 条。`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        readiness: payload?.readiness,
        runHealth: payload?.runHealth,
        providerReceiptInbox: payload?.providerReceiptInbox,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '试跑回执检查暂不可用。' });
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
        message: `回执生命周期：${formatRuntimeStatus(payload?.providerReceiptLifecycle?.verdict || '未知')}；待复核 ${payload?.providerReceiptLifecycle?.summary?.acceptedReceipts ?? 0} 条，等待 ${payload?.providerReceiptLifecycle?.summary?.waitingReceipts ?? 0} 条。`,
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
        message: `补资料清单：${payload?.providerKeyGapBoard?.summary?.configuredEnvKeys ?? 0}/${payload?.providerKeyGapBoard?.summary?.totalEnvKeys ?? 0} 项账号资料待复核，${payload?.providerKeyGapBoard?.summary?.providerGated ?? 0} 项待补账号资料，${payload?.providerKeyGapBoard?.summary?.dataGated ?? 0} 项待补经营数据。`,
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
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成样例复核约定……' }));
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
        message: `样例复核约定：待复核 ${payload?.providerSandboxContract?.summary?.passed ?? 0}/${payload?.providerSandboxContract?.summary?.checks ?? 0} 项，结论 ${formatRuntimeStatus(payload?.providerSandboxContract?.verdict || '未知')}。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '样例复核约定暂不可用。' }));
    }
  };

  const buildProviderSandboxSubmitWorkbench = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成样例交接预检……' }));
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
        message: `样例交接待复核 ${payload?.providerSandboxSubmitWorkbench?.summary?.readyToSubmit ?? 0} 项，待补资料 ${payload?.providerSandboxSubmitWorkbench?.summary?.blocked ?? 0} 项，等回执 ${payload?.providerSandboxSubmitWorkbench?.summary?.waitingReceipt ?? 0} 项。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '样例交接预检暂不可用。' }));
    }
  };

  const runProviderSandboxSubmitAttempt = async (capabilityId?: string) => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在通过受控通道交接一个样例任务包……' }));
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
        message: `样例交接尝试：${formatRuntimeStatus(payload?.providerSandboxSubmitAttempt?.verdict || 'blocked-before-dispatch')} / ${formatRuntimeNarrative(payload?.providerSandboxSubmitAttempt?.recoveryNextAction || payload?.providerSandboxSubmitAttempt?.bridge?.message || '请检查账号配置')}`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '样例交接尝试暂不可用。' }));
    }
  };

  const buildFirstForwardableRunPack = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成首轮交接复核预检……' }));
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
        message: `首轮交接复核：${formatRuntimeStatus(payload?.firstForwardableRunPack?.verdict || '未知')}；通过 ${payload?.firstForwardableRunPack?.summary?.passedStages ?? 0}/${payload?.firstForwardableRunPack?.stages?.length ?? 0} 个阶段。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '首轮交接复核预检暂不可用。' }));
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
        message: `首跑指挥台：${formatRuntimeStatus(payload?.firstRunControlTower?.verdict || '未知')}；待补链路 ${payload?.firstRunControlTower?.summary?.blockedLanes ?? 0} 条。`,
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
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成试跑准备包……' }));
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
        message: `启动准备包：资料可复核 ${payload?.providerLaunchTrainingPack?.summary?.ready ?? 0}/${payload?.providerLaunchTrainingPack?.summary?.tracks ?? 0} 条，结论 ${formatRuntimeStatus(payload?.providerLaunchTrainingPack?.verdict || '未知')}。`,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        providerSetupPack: payload?.providerSetupPack || previous.providerSetupPack,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        runtimeProbe: payload?.runtimeProbe || previous.runtimeProbe,
        providerSandboxContract: payload?.providerSandboxContract || previous.providerSandboxContract,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        providerLaunchTrainingPack: payload?.providerLaunchTrainingPack || previous.providerLaunchTrainingPack,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '试跑准备包暂不可用。' }));
    }
  };

  const inspectPlatformConnectorMatrix = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成平台通道资料清单……' }));
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
        message: `平台通道资料：本地可先准备 ${payload?.platformConnectorMatrix?.summary?.internalReady ?? 0} 个，待补条件 ${payload?.platformConnectorMatrix?.summary?.blocked ?? 0} 个，账号资料待复核 ${payload?.platformConnectorMatrix?.summary?.configuredEnvKeys ?? 0}/${payload?.platformConnectorMatrix?.summary?.totalEnvKeys ?? 0} 项。`,
        platformConnectorMatrix: payload?.platformConnectorMatrix || previous.platformConnectorMatrix,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '平台通道资料清单暂不可用。' }));
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
        message: `经营边界报告：本地可先准备 ${payload?.aiOsAuditReport?.summary?.usableNow ?? 0} 项，人工可先准备 ${payload?.aiOsAuditReport?.summary?.manualReady ?? 0} 项，待补资料 ${payload?.aiOsAuditReport?.summary?.providerRequired ?? 0} 项。`,
        aiOsAuditReport: payload?.aiOsAuditReport || previous.aiOsAuditReport,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '经营边界报告暂不可用。' }));
    }
  };

  const inspectRuntimeProbe = async () => {
    setDispatchState({ status: 'loading', message: '正在检查试跑交接通道和账号资料...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'runtime-probe' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.runtimeProbe?.summary?.ready ? 'queued' : 'blocked',
        message: `试跑通道探测已检查 ${payload?.runtimeProbe?.summary?.probed ?? 0} 个通道，资料可复核 ${payload?.runtimeProbe?.summary?.ready ?? 0} 个。`,
        runtimeProbe: payload?.runtimeProbe,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '试跑通道探测暂不可用。' });
    }
  };

  const inspectProviderReadinessHealth = async () => {
    setDispatchState({ status: 'loading', message: '正在对照已存资料检查账号和资料复核状态……' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'provider-readiness-health' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.providerReadinessHealth?.summary?.canEnableExternalAutomation ? 'queued' : 'blocked',
        message: `试跑条件检查：资料可复核 ${payload?.providerReadinessHealth?.summary?.healthReady ?? 0}/${payload?.providerReadinessHealth?.summary?.items ?? 0} 项，已保存待检查 ${payload?.providerReadinessHealth?.summary?.rememberedNotProbed ?? 0} 项。`,
        providerReadinessHealth: payload?.providerReadinessHealth,
        providerSetupState: payload?.providerSetupState,
        providerUnlockLadder: payload?.providerUnlockLadder,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '账号和资料复核检查暂不可用。' });
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
    setDispatchState({ status: 'loading', message: '正在生成试跑通道复核清单...' });
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
        message: `试跑通道复核：${formatRuntimeStatus(payload?.runtimeAdapterContract?.verdict || 'unknown')}；待复核 ${payload?.runtimeAdapterContract?.summary?.ready ?? 0}/${payload?.runtimeAdapterContract?.summary?.checks ?? 0} 项。`,
        runtimeAdapterContract: payload?.runtimeAdapterContract || previous.runtimeAdapterContract,
        executionPackage: payload?.executionPackage || previous.executionPackage,
        runtimeProbe: payload?.runtimeProbe || previous.runtimeProbe,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '试跑通道复核清单暂时不可用。' }));
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
        message: `试跑跟进闭环：${formatRuntimeStatus(payload?.runtimeRunnerLoopPack?.verdict || 'unknown')}；试跑事件 ${payload?.runtimeRunnerLoopPack?.summary?.runnerEvents ?? 0} 个，等待回执 ${payload?.runtimeRunnerLoopPack?.summary?.waitingReceipts ?? 0} 个。`,
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
        message: `补资料包已创建待复核：${payload?.providerSetupPack?.summary?.missing ?? 0} 项条件待补，${payload?.providerSetupPack?.summary?.blockedCapabilities ?? 0} 项能力等资料补齐后再交接。`,
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
        message: `交接解锁清单已创建待复核：${payload?.externalUnlockRequestPack?.summary?.p0 ?? 0} 个优先项，${payload?.externalUnlockRequestPack?.summary?.providerKeys ?? 0} 项账号配置，${payload?.externalUnlockRequestPack?.summary?.merchantAuthorizations ?? 0} 项门店授权。`,
        externalUnlockRequestPack: payload?.externalUnlockRequestPack || previous.externalUnlockRequestPack,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '交接解锁清单暂时不可用。' }));
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
        message: `账号和资料补齐向导已创建待复核：${payload?.providerSetupWizard?.summary?.configured ?? 0}/${payload?.providerSetupWizard?.summary?.fields ?? 0} 项待复核；试跑交接 ${payload?.providerSetupWizard?.summary?.canEnableExternalAutomation ? '待复核后交接' : '仍待补资料'}。`,
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
        : ['演示配置状态只记录标识，账号配置值一律留在服务端。'];
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
        message: `补资料状态已保存：${payload?.providerSetupState?.summary?.configuredEnvKeys ?? 0} 项账号资料待复核，${payload?.providerSetupState?.summary?.merchantApprovals ?? 0} 项门店授权待复核，${payload?.providerSetupState?.summary?.dataContracts ?? 0} 项经营数据规则待复核。`,
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
    setDispatchState({ status: 'loading', message: '正在生成试跑补资料向导……' });
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
        message: `试跑补资料向导：${formatRuntimeStatus(payload?.externalExecutionWizard?.verdict || '未知')}；待补条件 ${payload?.externalExecutionWizard?.summary?.blockedSteps ?? 0} 步。`,
        externalExecutionWizard: payload?.externalExecutionWizard,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '试跑补资料向导暂不可用。' });
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
    setDispatchState({ status: 'loading', message: '正在评估操作边界、账号资料保护和试跑门禁...' });
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
        message: `操作边界已评估 ${payload?.toolPolicy?.summary?.total ?? 0} 个动作；账号资料条件待复核 ${payload?.toolPolicy?.summary?.externalReady ?? 0} 个。`,
        toolPolicy: payload?.toolPolicy,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '工具边界评估暂不可用。' });
    }
  };

  const inspectBusinessSignals = async () => {
    setDispatchState({ status: 'loading', message: '正在汇总预约、领券数、到店核销数和到店意向信号...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'business-signals' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: 'queued',
        message: `经营信号已汇总 ${payload?.businessSignals?.summary?.acceptedReceipts ?? 0} 条待复核回执；收银汇总和店长授权范围未确认前只做脱敏聚合。`,
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
        message: `店长跟进任务已创建待复核：${payload?.storeManagerFollowup?.summary?.tasks ?? 0} 个；今日 ${payload?.storeManagerFollowup?.summary?.today ?? 0} 个，待补条件 ${payload?.storeManagerFollowup?.summary?.blocked ?? 0} 个。`,
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
    setDispatchState(previous => ({ ...previous, status: 'loading', message: `正在把店长任务状态更新为 ${formatRuntimeStatus(taskStatus)}……` }));
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
        message: response.ok ? `店长任务已更新为 ${formatRuntimeStatus(taskStatus)}。` : '任务状态更新失败，请刷新任务队列后重试。',
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
        message: response.ok ? '员工通知交接已起草。' : '员工通知交接暂不可用。',
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
        message: response.ok ? '员工通知投递通道待复核。' : '员工通知投递通道暂不可用。',
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
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成任务试跑交接包……' }));
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
          ? `试跑交接资料已创建待复核：${payload?.taskProviderHandoff?.summary?.packages ?? 0} 份资料包，${payload?.taskProviderHandoff?.summary?.forwardable ?? 0} 份待复核。`
          : '任务试跑交接暂不可用。',
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '任务试跑交接包暂不可用。' }));
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
        message: formatRuntimeNarrative(payload?.bridge?.message || '试跑交接尝试已记录。'),
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
    setDispatchState({ status: 'loading', message: '正在校验脱敏收银核销数据……' });
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
        message: `收银汇总导入${formatRuntimeStatus(payload?.posImport?.status || '失败')}：有效行 ${payload?.posImport?.summary?.validRows ?? 0} 条，到店核销 ${payload?.posImport?.summary?.redemptionCount ?? 0} 条。不保存原始行。`,
        posImport: payload?.posImport,
        receipts: payload?.receipts,
        businessSignals: payload?.businessSignals,
        heartbeat: payload?.heartbeat,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '收银核销导入校验暂不可用。' });
    }
  };

  const inspectCapabilityTrainingPlan = async () => {
    setDispatchState({ status: 'loading', message: '正在整理门店打法准备材料...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'capability-training-plan',
          availableMaterials: ['门店资料', '菜单价格', '发布模板', '平台禁用词', '禁用表达', '常用语气'],
          configuredProviders: ['隔离试跑环境'],
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.capabilityTrainingPlan?.summary?.activationReady ? 'queued' : 'blocked',
        message: `准备计划已创建待复核：${payload?.capabilityTrainingPlan?.summary?.trainableNow ?? 0} 项可先准备，${payload?.capabilityTrainingPlan?.summary?.providerGated ?? 0} 项待补资料。`,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan,
        capabilityTrainingRecords: payload?.trainingRecords,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '门店打法准备材料暂不可用。' });
    }
  };

  const inspectClawSkillCatalog = async () => {
    setDispatchState({ status: 'loading', message: '正在加载门店打法素材、准备队列和待补资料项...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'claw-skill-catalog' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.clawSkillCatalog?.summary?.providerGatedSkills ? 'blocked' : 'queued',
        message: `门店打法素材已加载：${payload?.clawSkillCatalog?.summary?.modules ?? 0} 类工单、${payload?.clawSkillCatalog?.summary?.skills ?? 0} 份准备材料、${payload?.clawSkillCatalog?.summary?.tools ?? 0} 个检查项。`,
        clawSkillCatalog: payload?.clawSkillCatalog,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '门店打法素材暂不可用。' });
    }
  };

  const buildClawSkillWorkbench = async () => {
    setDispatchState({ status: 'loading', message: '正在为这家门店生成待复核工单台……' });
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
        message: `${formatRuntimeNarrative(selectedClawWorkbenchPreset.label)} 已创建待复核：${payload?.clawSkillWorkbench?.summary?.runnableNow ?? 0} 项可先准备，${payload?.clawSkillWorkbench?.summary?.trainingNeeded ?? 0} 项待准备，${payload?.clawSkillWorkbench?.summary?.providerGated ?? 0} 项待补资料，${payload?.storeManagerTaskRecords?.length ?? 0} 项待跟进任务。`,
        clawSkillWorkbench: payload?.clawSkillWorkbench,
        clawSkillExecutionRecord: payload?.clawSkillExecutionRecord,
        clawSkillExecutionLedger: payload?.clawSkillExecutionLedger,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue,
        storeManagerTaskWatcher: payload?.storeManagerTaskWatcher,
        staffNotificationHandoff: payload?.staffNotificationHandoff,
        staffNotificationDeliveryBridge: payload?.staffNotificationDeliveryBridge,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '门店工单台暂不可用。' });
    }
  };

  const inspectBenchmarkStrategy = async () => {
    setDispatchState({ status: 'loading', message: '正在判断门店试跑路径：今日工单、任务面板和经营数据约定...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'benchmark-strategy' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: 'blocked',
        message: `对标策略已生成：${formatRuntimeNarrative(payload?.benchmarkStrategy?.recommendation || '待确认')}。账号授权和经营数据仍是解锁门槛。`,
        benchmarkStrategy: payload?.benchmarkStrategy,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '对标策略暂不可用。' });
    }
  };

  const buildActivationCockpit = async () => {
    setDispatchState({ status: 'loading', message: '正在生成打法总览：本地可先准备、准备材料和待补资料……' });
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
        message: `打法总览已创建待复核：${payload?.activationCockpit?.summary?.usableNow ?? 0} 项今天可试跑，${payload?.activationCockpit?.summary?.providerGated ?? 0} 项待补资料，${payload?.activationCockpit?.summary?.providerKeysNeeded ?? 0} 项账号配置待确认。`,
        activationCockpit: payload?.activationCockpit,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '打法总览暂时不可用。' });
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
        message: `员工通道清单已生成：${payload?.channelHub?.summary?.channels ?? 0} 个通道、${payload?.channelHub?.summary?.scheduledJobs ?? 0} 个排程任务、${payload?.channelHub?.summary?.missingExternalItems ?? 0} 个账号资料缺口。`,
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
        message: `通道排程运行：尝试 ${payload?.channelScheduleRun?.summary?.attempted ?? 0} 次，待补条件 ${payload?.channelScheduleRun?.summary?.blocked ?? 0} 次，建议重试/恢复 ${payload?.channelScheduleRun?.summary?.retryRecommended ?? 0} 次。`,
        channelScheduleRun: payload?.channelScheduleRun,
        channelDeliveryReport: payload?.channelDeliveryReport,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '通道排程运行暂不可用。' });
    }
  };

  const buildClawTrainingBatch = async () => {
    setDispatchState({ status: 'loading', message: '正在生成下轮准备材料和待补资料清单...' });
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
        message: `下轮准备材料已生成：${payload?.clawTrainingBatch?.summary?.internalTrainingTasks ?? 0} 个本地准备任务，${payload?.clawTrainingBatch?.summary?.providerUnlockTasks ?? 0} 个待补账号资料任务。`,
        clawTrainingBatch: payload?.clawTrainingBatch,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '下轮准备材料暂不可用。' });
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
        message: `经营主干已生成：${payload?.platformOperatingSpine?.summary?.runs ?? 0} 次运行，${payload?.platformOperatingSpine?.summary?.acceptedReceipts ?? 0} 条回执待复核，${payload?.platformOperatingSpine?.summary?.blockedExternalGroups ?? 0} 组账号资料待补。`,
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
        message: `试跑复盘：${formatRuntimeStatus(payload?.postRunReviewPack?.verdict || 'unknown')}；${payload?.postRunReviewPack?.summary?.storeTasks ?? 0} 个门店任务，${payload?.postRunReviewPack?.summary?.blockedInsights ?? 0} 个结论待补资料。`,
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
        message: `下一轮计划：${formatRuntimeStatus(payload?.nextLoopChannelPlan?.verdict || 'unknown')}；${payload?.nextLoopChannelPlan?.summary?.scheduledActions ?? 0} 个动作待店长确认，${payload?.nextLoopChannelPlan?.summary?.providerGatedActions ?? 0} 个动作待补资料。`,
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
    setDispatchState({ status: 'loading', message: '正在写入门店准备材料...' });
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
          configuredProviders: ['隔离试跑环境'],
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.trainingRecord?.accepted ? 'queued' : 'blocked',
        message: payload?.trainingRecord?.accepted
          ? `训练材料已写入：${formatRuntimeNarrative(payload.trainingRecord.name)}；当前 ${payload?.capabilityTrainingPlan?.summary?.providerGated ?? 0} 项待补资料。`
          : formatRuntimeNarrative(payload?.trainingRecord?.rejectedReason || '训练材料被拒绝。'),
        capabilityTrainingRecord: payload?.trainingRecord,
        capabilityTrainingRecords: payload?.trainingRecords,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '门店准备材料写入暂不可用。' });
    }
  };

  const inspectBrowserSessionHealth = async () => {
    setDispatchState({ status: 'loading', message: '正在检查隔离试跑会话和巡检...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'browser-session-health' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.browserSessionHealth?.summary?.ready ? 'queued' : 'blocked',
        message: `隔离试跑会话已检查 ${payload?.browserSessionHealth?.summary?.total ?? 0} 个；待复核 ${payload?.browserSessionHealth?.summary?.ready ?? 0} 个。`,
        browserSessionHealth: payload?.browserSessionHealth,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '隔离试跑会话检查暂不可用。' });
    }
  };

  const buildBrowserRunbook = async () => {
    setDispatchState({ status: 'loading', message: '正在生成受控试跑操作清单……' });
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
        message: `试跑操作清单已生成；环境复核状态：${payload?.browserRunbook?.canExecuteNow ? '待复核' : '待补资料'}。`,
        browserRunbook: payload?.browserRunbook,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '试跑操作清单暂不可用。' });
    }
  };

  const buildBrowserRunnerContract = async () => {
    setDispatchState({ status: 'loading', message: '正在生成试跑回执约定……' });
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
        message: `试跑回执约定已生成；最终签名回执仍需复核：${payload?.browserRunnerContract?.canAcceptSignedFinalReceipt ? '待复核' : '待补凭证'}。`,
        browserRunnerContract: payload?.browserRunnerContract,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '试跑回执约定暂不可用。' });
    }
  };

const buildBrowserGatewayPack = async () => {
    setDispatchState({ status: 'loading', message: '正在生成试跑交接包……' });
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
        message: `试跑交接包已创建待复核；待复核动作 ${payload?.browserGatewayPack?.browserRequest?.acceptedActions?.length ?? 0} 个。`,
        browserGatewayPack: payload?.browserGatewayPack || previous.browserGatewayPack,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '试跑交接包暂不可用。' }));
    }
  };

  const recordBrowserRunnerEvent = async () => {
    setDispatchState({ status: 'loading', message: '正在记录脱敏试跑事件……' });
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
          evidenceSummary: '公开凭证截图已采集，等待回执字段提取。',
          nextAction: '继续提取回执字段，然后发送最终签名回执。',
        }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.runnerEvent?.status === 'accepted' ? 'queued' : 'blocked',
        eventId: payload?.runnerEvent?.eventId,
        message: `试跑事件 ${formatRuntimeStatus(payload?.runnerEvent?.status || '缺失')}；进行中 ${payload?.runnerEventHealth?.summary?.activeRuns ?? 0} 个，停滞 ${payload?.runnerEventHealth?.summary?.staleRuns ?? 0} 个。`,
        runnerEvent: payload?.runnerEvent,
        runnerEventHealth: payload?.runnerEventHealth,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '试跑事件台账暂不可用。' });
    }
  };

  const inspectBrowserRunnerEventHealth = async () => {
    setDispatchState({ status: 'loading', message: '正在检查试跑事件状态……' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'browser-runner-event-health' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.runnerEventHealth?.summary?.rejected || payload?.runnerEventHealth?.summary?.staleRuns ? 'blocked' : 'queued',
        message: `试跑事件状态待复核：${payload?.runnerEventHealth?.summary?.totalEvents ?? 0} 条；进行中 ${payload?.runnerEventHealth?.summary?.activeRuns ?? 0} 个，收尾待复核 ${payload?.runnerEventHealth?.summary?.completedRuns ?? 0} 个。`,
        runnerEventHealth: payload?.runnerEventHealth,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '试跑事件状态检查暂不可用。' });
    }
  };

  const importPublicProfile = async () => {
    setDispatchState({ status: 'loading', message: '正在把公开门店资料转成可复核资料档案、证据账本和门店记忆...' });
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
        message: `公开资料已生成 ${payload?.publicProfile?.fields?.filter((item: { confidence: string }) => item.confidence !== 'missing').length ?? 0} 个可复核字段；仍需门店补菜单、图片、活动边界和发布凭证。`,
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
        message: `公开试跑种子：可复核字段 ${payload?.publicTrialSeed?.summary?.usableFields ?? 0} 个，待复核步骤 ${payload?.publicTrialSeed?.summary?.workflowReadySteps ?? 0} 步，待补账号/授权/数据 ${payload?.publicTrialSeed?.summary?.workflowExternalGatedSteps ?? 0} 步。`,
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
        message: `第一天任务包：本地可先准备 ${payload?.dayZeroMissionPack?.summary?.readyInternal ?? 0} 项，需店长凭证 ${payload?.dayZeroMissionPack?.summary?.needsMerchantEvidence ?? 0} 项，待补账号/授权/数据 ${payload?.dayZeroMissionPack?.summary?.externalGated ?? 0} 项。`,
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
    setDispatchState({ status: 'loading', message: '正在聚合试跑记录、回执、巡检、恢复动作、隔离试跑会话和经营信号...' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ops-console' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.opsConsole?.summary?.blockedRuns ? 'blocked' : 'queued',
        message: `运营汇总台已聚合 ${payload?.opsConsole?.summary?.runs ?? 0} 次运行、${payload?.opsConsole?.summary?.acceptedReceipts ?? 0} 条待复核回执、${payload?.opsConsole?.summary?.watcherWakeups ?? 0} 次巡检唤醒。`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        opsConsole: payload?.opsConsole,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '运营汇总台暂不可用。' });
    }
  };

  const inspectExecutionTimeline = async () => {
    setDispatchState({ status: 'loading', message: '正在生成试跑时间线……' });
    try {
      const response = await fetch('/api/restaurant-agent/runtime', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'execution-timeline' }),
      });
      const payload = await response.json();
      setDispatchState({
        status: payload?.executionTimeline?.summary?.blockedRuns ? 'blocked' : 'queued',
        message: `试跑时间线 ${formatRuntimeStatus(payload?.executionTimeline?.mode || 'unknown')}：${payload?.executionTimeline?.summary?.runs ?? 0} 次运行，${payload?.executionTimeline?.summary?.watcherWakeups ?? 0} 次巡检唤醒。`,
        latestRuns: payload?.runs?.slice?.(0, 3),
        receipts: payload?.receipts,
        executionTimeline: payload?.executionTimeline,
      });
    } catch {
      setDispatchState({ status: 'failed', message: '试跑时间线暂不可用。' });
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
        message: `指挥中心 ${formatRuntimeStatus(payload?.commandCenter?.mode || 'unknown')}：${payload?.commandCenter?.summary?.runs ?? 0} 次运行，${payload?.commandCenter?.summary?.acceptedReceipts ?? 0} 条回执待复核，${payload?.commandCenter?.summary?.providerGates ?? 0} 个待补资料。`,
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
        message: `常驻任务板 ${formatRuntimeStatus(payload?.residentAgentMissionControl?.mode || 'unknown')}：${payload?.residentAgentMissionControl?.summary?.readyLanes ?? 0}/${payload?.residentAgentMissionControl?.summary?.lanes ?? 0} 条链路待复核，${payload?.residentAgentMissionControl?.summary?.externalGates ?? 0} 个账号资料条件。`,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        residentAgentMissionControl: payload?.residentAgentMissionControl || previous.residentAgentMissionControl,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '常驻任务板暂不可用。' }));
    }
  };

  const runShiftAutopilot = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在跑班次任务检查的本地链路……' }));
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
        message: `班次任务检查：本地待复核记录 ${payload?.shiftAutopilotRun?.summary?.acceptedInternalActions ?? 0} 项，店长任务 ${payload?.shiftAutopilotRun?.summary?.createdStoreManagerTasks ?? 0} 项，待补资料挂起 ${payload?.shiftAutopilotRun?.summary?.providerHeldActions ?? 0} 项。`,
        latestRuns: payload?.runs?.slice?.(0, 3) || previous.latestRuns,
        receipts: payload?.receipts || previous.receipts,
        commandCenter: payload?.commandCenter || previous.commandCenter,
        shiftAutopilot: payload?.shiftAutopilot || previous.shiftAutopilot,
        shiftAutopilotRun: payload?.shiftAutopilotRun || previous.shiftAutopilotRun,
        storeManagerTaskQueue: payload?.storeManagerTaskQueue || previous.storeManagerTaskQueue,
        storeManagerTaskWatcher: payload?.storeManagerTaskWatcher || previous.storeManagerTaskWatcher,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '班次任务检查暂不可用。' }));
    }
  };

  const buildShiftProviderHandoff = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在从班次记录生成试跑交接资料……' }));
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
        message: `班次试跑交接：${payload?.shiftProviderHandoff?.summary?.requests ?? 0} 项请求，P0 ${payload?.shiftProviderHandoff?.summary?.p0 ?? 0} 项，样例待复核 ${payload?.shiftProviderHandoff?.summary?.readyToSandbox ?? 0} 项。`,
        shiftProviderHandoff: payload?.shiftProviderHandoff || previous.shiftProviderHandoff,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '班次试跑交接暂不可用。' }));
    }
  };

  const buildShiftSandboxAcceptance = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成班次样例复核……' }));
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
        message: `班次样例复核：待复核 ${payload?.shiftSandboxAcceptance?.summary?.passed ?? 0}/${payload?.shiftSandboxAcceptance?.summary?.stages ?? 0} 个阶段，结论 ${formatRuntimeStatus(payload?.shiftSandboxAcceptance?.verdict || '未知')}。`,
        shiftSandboxAcceptance: payload?.shiftSandboxAcceptance || previous.shiftSandboxAcceptance,
        shiftProviderHandoff: payload?.shiftProviderHandoff || previous.shiftProviderHandoff,
        providerSandboxContract: payload?.providerSandboxContract || previous.providerSandboxContract,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '班次样例复核暂不可用。' }));
    }
  };

  const buildShiftFirstForwardableRun = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成班次首轮交接复核……' }));
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
        message: `班次首轮交接复核：${formatRuntimeStatus(payload?.shiftFirstForwardableRun?.verdict || '未知')}；待补资料 ${payload?.shiftFirstForwardableRun?.summary?.blockedStages ?? 0} 个，等待账号资料 ${payload?.shiftFirstForwardableRun?.summary?.waitingExternalStages ?? 0} 个。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '班次首轮交接复核暂不可用。' }));
    }
  };

  const forwardShiftSandboxRun = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在交接受控班次样例试跑……' }));
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
        message: `班次样例转发：${formatRuntimeStatus(payload?.shiftSandboxForwardAttempt?.verdict || '未知')}；通道状态 ${formatRuntimeStatus(payload?.shiftSandboxForwardAttempt?.summary?.bridgeStatus || '未知')}。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '班次样例转发暂不可用。' }));
    }
  };

  const buildShiftCloseoutTrainingPack = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成班次收尾准备包……' }));
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
        message: `班次收尾准备：${formatRuntimeStatus(payload?.shiftCloseoutTrainingPack?.verdict || '未知')}；草稿 ${payload?.shiftCloseoutTrainingPack?.summary?.trainingDrafts ?? 0} 份，恢复动作 ${payload?.shiftCloseoutTrainingPack?.summary?.recoveryActions ?? 0} 项。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '班次收尾准备包暂不可用。' }));
    }
  };

  const recordShiftCloseoutTraining = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在记录待复核的班次收尾准备……' }));
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
        message: `班次收尾准备记录：${formatRuntimeStatus(payload?.shiftCloseoutTrainingRecordAttempt?.verdict || '未知')}；待复核记录 ${payload?.shiftCloseoutTrainingRecordAttempt?.summary?.recorded ?? 0} 条，已拒绝 ${payload?.shiftCloseoutTrainingRecordAttempt?.summary?.rejected ?? 0} 条。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '班次收尾准备记录暂不可用。' }));
    }
  };

  const buildShiftCapabilityActivationPack = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成下轮工单解锁包...' }));
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
        message: `工单解锁：${formatRuntimeStatus(payload?.shiftCapabilityActivationPack?.verdict || 'unknown')}；${payload?.shiftCapabilityActivationPack?.summary?.activatedInternal ?? 0} 项本地可先准备，${payload?.shiftCapabilityActivationPack?.summary?.trainedNeedsProvider ?? 0} 项待补资料。`,
        shiftCapabilityActivationPack: payload?.shiftCapabilityActivationPack || previous.shiftCapabilityActivationPack,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        capabilityTrainingRecords: payload?.trainingRecords || previous.capabilityTrainingRecords,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        runtimeProbe: payload?.runtimeProbe || previous.runtimeProbe,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '下轮工单解锁包暂时不可用。' }));
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
        message: `班次经营闭环：${formatRuntimeStatus(payload?.shiftOperatingLoopPack?.verdict || '未知')}；下一步 ${formatRuntimeNarrative(payload?.shiftOperatingLoopPack?.nextBestAction?.label || '暂无')}。`,
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
        message: `指令路由：${formatRuntimeSchemaLabel(payload?.commandRoute?.intent || '未知')} -> ${formatRuntimeActionLabel(payload?.commandRoute?.primaryAction?.clientAction || '人工')}；${formatRuntimeStatus(payload?.commandRoute?.verdict || '未知')}。`,
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
        message: '该指令包含隐私、账号配置值、收银明细或顾客触达内容，改写后才能执行。',
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
        message: `门店记忆包：记忆卡 ${payload?.aiEmployeeMemoryPack?.summary?.memoryCards ?? 0} 张，唤醒 ${payload?.aiEmployeeMemoryPack?.summary?.nextWakeups ?? 0} 次，待补账号资料 ${payload?.aiEmployeeMemoryPack?.summary?.externalRequired ?? 0} 个。`,
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
        message: `顾客需求入口：${payload?.customerDemandGateway?.summary?.channels ?? 0} 个渠道，本地可先准备 ${payload?.customerDemandGateway?.summary?.internalReady ?? 0} 个，待补账号资料 ${payload?.customerDemandGateway?.externalRequired?.length ?? 0} 个。`,
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
        message: `语音点单台：意图 ${payload?.voiceOrderConsole?.summary?.intents ?? 0} 个，订单草稿 ${payload?.voiceOrderConsole?.summary?.orderDrafts ?? 0} 份，待补账号资料 ${payload?.voiceOrderConsole?.externalRequired?.length ?? 0} 个。`,
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
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成试跑条件板……' }));
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
        message: `试跑条件板：事项 ${payload?.providerLaunchBoard?.summary?.capabilities ?? 0} 项，样例待复核 ${payload?.providerLaunchBoard?.summary?.readyToSandbox ?? 0} 项，缺账号资料 ${payload?.providerLaunchBoard?.summary?.missingProvider ?? 0} 项。`,
        providerLaunchBoard: payload?.providerLaunchBoard || previous.providerLaunchBoard,
        customerDemandGateway: payload?.customerDemandGateway || previous.customerDemandGateway,
        voiceOrderConsole: payload?.voiceOrderConsole || previous.voiceOrderConsole,
        commandRoute: payload?.commandRoute || previous.commandRoute,
        capabilityTrainingPlan: payload?.capabilityTrainingPlan || previous.capabilityTrainingPlan,
        providerSetupState: payload?.providerSetupState || previous.providerSetupState,
        providerReadinessHealth: payload?.providerReadinessHealth || previous.providerReadinessHealth,
      }));
    } catch {
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '试跑条件板暂不可用。' }));
    }
  };

  const buildMerchantActivationPacket = async () => {
    setDispatchState(previous => ({ ...previous, status: 'loading', message: '正在生成门店激活包……' }));
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
        message: `门店激活包：${formatRuntimeStatus(payload?.merchantActivationPacket?.verdict || '未知')}；需要账号配置 ${payload?.merchantActivationPacket?.summary?.providerKeys ?? 0} 项、店长确认 ${payload?.merchantActivationPacket?.summary?.merchantApprovals ?? 0} 项、数据约定 ${payload?.merchantActivationPacket?.summary?.dataContracts ?? 0} 项。`,
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
      setDispatchState(previous => ({ ...previous, status: 'failed', message: '门店激活包暂不可用。' }));
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
        message: `经营建议已生成：${formatRuntimeStatus(payload?.aiConsultantCopilot?.mode || 'unknown')}，${payload?.aiConsultantCopilot?.summary?.actionPlays ?? 0} 个建议动作，${payload?.aiConsultantCopilot?.summary?.providerGated ?? 0} 个待补资料。`,
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
        message: `今日门店经营计划：${payload?.storeOperatingPlan?.summary?.timeBlocks ?? 0} 个时段，${payload?.storeOperatingPlan?.summary?.readyInternal ?? 0} 个本地可先准备，${payload?.storeOperatingPlan?.summary?.providerGated ?? 0} 个待补资料。`,
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
        message: `今日门店工单：${payload?.aiCockpit?.summary?.zones ?? 0} 个区域，${payload?.aiCockpit?.summary?.readyInternal ?? 0} 个本地可先准备，${payload?.aiCockpit?.summary?.providerGated ?? 0} 个待补资料。`,
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
    '本地试跑会先产出签名回执；试跑交接需要账号确认和经营数据约定。';

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
      answerForOwner: '先用本地门店任务闭环；账号配置和门店授权补齐后，再进入试跑交接。',
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
          customerPromise: '推流量之前先确认套餐、负责人、服务时段和凭证。',
          actionNow: '生成早班简报、任务负责人和停止线。',
          visibleProof: '门店事实、套餐、服务时段',
          providerAsk: '持续跟进所需的员工通知通道',
          stopLine: '没有店长授权不动平台账号。',
        },
        {
          id: 'demand',
          title: '需求与线索承接',
          status: 'staff-review',
          owner: 'store-manager',
          customerPromise: '把预约、领券和到店意向变成负责人可见的跟进。',
          actionNow: '归类导入的需求信号并分派店长任务。',
          visibleProof: '待复核凭证或导入的线索汇总',
          providerAsk: '平台收件箱/导出权限',
          stopLine: '不抓私信、不存顾客身份信息。',
        },
        {
          id: 'publish-proof',
          title: '发布与凭证',
          status: 'provider-required',
          owner: 'ops',
          customerPromise: '每个渠道动作都用公开凭证或签名回执收口。',
          actionNow: '准备一个受控渠道任务包。',
          visibleProof: '公开链接、截图编号或回执',
          providerAsk: '店长授权范围和回执配置',
          stopLine: '账号资料未复核，不能标记已发布。',
        },
        {
          id: 'service-window',
          title: '服务时段巡视',
          status: 'staff-review',
          owner: 'store-manager',
          customerPromise: '把库存、券压力和服务风险盯成任务。',
          actionNow: '复核券压力和恢复队列。',
          visibleProof: '券规则截图和员工确认',
          providerAsk: 'POS/coupon aggregate contract',
          stopLine: '不写收银数据、不碰支付、配送和券的改动。',
        },
        {
          id: 'closeout',
          title: '收尾与下一轮',
          status: 'evidence-required',
          owner: 'finance',
          customerPromise: '用可量化凭证和明天的动作收掉今天。',
          actionNow: '把公开凭证、线索数量和核销汇总分开。',
          visibleProof: 'sanitized POS/coupon/member aggregate',
          providerAsk: '脱敏汇总字段表',
          stopLine: '数据凭证待复核，不能标记经营复盘结论。',
        },
      ],
      aiAutopilotQueue: ['开班指令: Build the morning brief, task owners and stop line.'],
      staffQueue: ['需求与线索承接：待复核凭证或导入的线索汇总', '服务时段巡视：券规则截图和员工确认'],
      providerQueue: ['发布与凭证：店长授权范围和回执配置'],
      evidenceQueue: ['收尾与下一轮：脱敏收银/券码/会员汇总'],
      safetyBoundary: '店总指挥台仅用于预览：不登录、不发布、不抓取私信、不核销券码、不写回门店收银后台、不暴露账号配置值，也不会在缺少待复核凭证时承诺增长结果。',
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
        nextWakeup: lane.id === 'opening' ? '当地 09:30' : lane.id === 'closeout' ? '当地 22:30' : '每 60 分钟',
        stopLine: lane.stopLine,
      })),
      nowQueue: commandGmCommandDeck.aiAutopilotQueue,
      nextWakeups: ['开班指令: 当地 09:30', '通道和收件箱检查：每 60 分钟', '收尾与下一轮：当地 22:30'],
      providerQueue: commandGmCommandDeck.providerQueue,
      evidenceQueue: commandGmCommandDeck.evidenceQueue,
      operatingPolicy: [
        '没有账号配置时，先跑本地计划、员工审核和凭证准备。',
        '没有待复核回执前，不承诺试跑交接待复核。',
      ],
      safetyBoundary: '班次任务检查仅生成有边界的班次计划：不常驻运行、不发布、不触达顾客、不核销券码、不写收银数据，也不暴露账号配置。',
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
      answer: '把今天的门店目标、主推套餐、服务窗口、负责人和可复核证据排成一张试跑工单。',
      primaryAction: '先生成受控试跑，再看试跑时间线。',
      visibleProof: ['门店资料', '主推套餐', '服务窗口'],
      providerGate: '本地规划，无需额外账号资料',
    },
    {
      id: 'ai-consultant',
      title: '经营建议复核',
      status: 'needs-evidence',
      answer: '把店长问题转成菜品卖点、到店理由、内容动作和运营建议，但每条建议都带负责人和证据要求。',
      primaryAction: '补齐菜单、活动、渠道和约束后生成顾问方案。',
      visibleProof: ['菜单截图', '活动口径', '渠道限制'],
      providerGate: '账号资料和经营数据需要回执凭证',
    },
    {
      id: 'automation-launch',
      title: '试跑交接准备',
      status: 'provider-gated',
      answer: '发布凭证、线索承接、核销数据和经营汇总复盘需要店长授权、平台回执、隔离会话或收银/券码数据约定。',
      primaryAction: '先跑补资料包，拿到账号配置、店长授权、回执和停止线。',
      visibleProof: ['账号资料检查', '店长授权', '签名回执'],
      providerGate: '账号配置 / 店长授权 / 隔离会话 / 签名回执',
    },
    {
      id: 'evidence-review',
      title: '凭证复核',
      status: 'needs-evidence',
      answer: '所有结果只看公开链接、截图回执、签名回执或脱敏经营聚合，不展示私信、联系电话、优惠码或收银明细。',
      primaryAction: '导入回执或脱敏汇总后，生成下一轮门店动作。',
      visibleProof: ['发布链接', '截图回执', '脱敏收银汇总'],
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
      title: '隔离试跑通道',
      internal: '能生成隔离试跑任务清单、操作清单、回执约定和异常恢复队列。',
      external: '需要隔离环境编号、店长授权范围、平台登录状态和停止条件。',
      status: 'provider-gated',
    },
    {
      title: '发布凭证',
      internal: '能生成大众点评/小红书/抖音/微信社群发布包、复核清单和截图回执要求。',
      external: '需要平台账号确认、开放接口或受控试跑回执。',
      status: 'provider-gated',
    },
    {
      title: '线索承接',
      internal: '能把预约、领券、私信咨询、到店意向整理成店长任务和社群跟进话术。',
      external: '需要私域/社群/平台消息回执或汇总；未授权时不读取私信和联系电话。',
      status: 'provider-gated',
    },
    {
      title: '券码核销',
      internal: '能校验脱敏券码、核销和收银汇总字段，生成核销异常和复盘动作。',
      external: '需要团购券、会员或收银汇总数据约定，不能写回门店收银后台。',
      status: 'provider-gated',
    },
    {
      title: '经营汇总复盘',
      internal: '能基于公开回执、手工导入和脱敏汇总做经营信号、备货和下一轮计划。',
      external: '需要订单、库存、毛利、核销、会员复购的脱敏汇总导入。',
      status: 'ready-internal',
    },
    {
      title: '门店记忆跟进',
      internal: '能沉淀门店偏好、负责人、证据、失败原因和下一次执行计划。',
      external: '需要员工通知通道、日程权限或企业微信/飞书/短信通道。',
      status: 'ready-internal',
    },
  ];
  const residentEmployeeLoop = [
    {
      title: '早班简报',
      status: commandTaskWatcher?.summary.blocked ? 'needs-owner' : 'ready-internal',
      owner: '店长 / 运营',
      action: '开店前检查昨日回执、待补任务、待补资料和今日主推套餐。',
      proof: commandTaskWatcher
        ? `${commandTaskWatcher.summary.blocked} 项待补资料 / ${commandTaskWatcher.summary.wakeups} 次提醒`
        : '等待生成任务队列或运行巡检',
    },
    {
      title: '服务时段巡视',
      status: dispatchState.heartbeat?.watcherPolicy?.summary.highPriority ? 'needs-owner' : 'ready-internal',
      owner: '门店任务助手',
      action: '服务中检查发布回执、预约/领券/到店意向、试跑交接和失败恢复。',
      proof: dispatchState.heartbeat
        ? `${dispatchState.heartbeat.followups.length} 项跟进 / ${dispatchState.heartbeat.watcherPolicy?.summary.armed ?? 0} 条巡检线`
        : '未运行巡检',
    },
    {
      title: '收尾记忆',
      status: dispatchState.heartbeat?.acceptedReceipts ? 'ready-internal' : 'needs-evidence',
      owner: '运营 / 数据',
      action: '收盘后只把待复核回执和脱敏经营摘要写入门店记忆，生成下一轮动作。',
      proof: dispatchState.heartbeat
        ? `${dispatchState.heartbeat.acceptedReceipts ?? 0} 条回执待复核 / ${dispatchState.heartbeat.watcherPolicy?.summary.memoryUpserts ?? 0} 条记忆更新`
        : '需要回执或手工导入',
    },
    {
      title: '渠道跟进',
      status: commandChannelHub?.summary.missingExternalItems ? 'provider-gated' : 'ready-internal',
      owner: '社群 / 店长',
      action: '把店长跟进、社群提醒、员工通知和到期任务变成可复核的员工通道任务。',
      proof: commandChannelHub
        ? `${commandChannelHub.summary.channels} 个通道 / ${commandChannelHub.summary.scheduledJobs} 个定时任务`
        : '等待生成员工通道清单',
    },
  ];

  return (
    <section className="border border-stone-200 bg-white p-5 shadow-sm" id="store-trial-workbench">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-stone-500">今天这张门店工单</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">把活动、内容、发布凭证和店长跟进排成一张待复核清单</h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            当前先用公开资料、门店素材和手工回填把任务跑起来：发布检查、券核销复盘、线索跟进和门店记忆都进入任务队列。
            未拿到店长账号确认和去掉顾客隐私的汇总表前，不做试跑交接，也不声称已经发布、核销或读取平台经营数据。
          </p>
        </div>
        <div className="grid min-w-[260px] grid-cols-3 gap-2 text-center">
          <div className="border border-stone-200 bg-[#fbfaf7] p-3">
            <div className="text-2xl font-black text-stone-950">{runtime.summary.internalReady}</div>
            <div className="mt-1 text-[11px] font-semibold text-stone-500">本地可先准备</div>
          </div>
          <div className="border border-stone-200 bg-[#fbfaf7] p-3">
            <div className="text-2xl font-black text-stone-950">{runtime.summary.externalBlocked}</div>
            <div className="mt-1 text-[11px] font-semibold text-stone-500">账号资料待补</div>
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
          <p className="text-[11px] font-semibold tracking-[0.16em] text-stone-500">试跑事项清单</p>
            <h3 className="mt-1 text-lg font-black text-stone-950">老板先看今天能做什么，内部再看资料和凭证是否待复核</h3>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-stone-600">
              这里不要求老板理解技术架构，只把成熟门店工具里的流程拆成待复核事项：先生成方案和证据槽，账号确认后再做平台发布、回执回收和复盘。
            </p>
          </div>
          <div className="grid min-w-[280px] grid-cols-3 gap-2 text-center text-xs">
            <div className="border border-stone-200 bg-[#fbfaf7] p-2">
              <div className="text-xl font-black text-stone-950">{capabilityPlan.summary.internalReady}</div>
              <div className="mt-1 font-semibold text-stone-500">已列入待复核</div>
            </div>
            <div className="border border-stone-200 bg-[#fbfaf7] p-2">
              <div className="text-xl font-black text-stone-950">{capabilityPlan.summary.bridgeReady}</div>
              <div className="mt-1 font-semibold text-stone-500">交接待复核</div>
            </div>
            <div className="border border-stone-200 bg-[#fbfaf7] p-2">
              <div className="text-xl font-black text-stone-950">{capabilityPlan.summary.externalRequired}</div>
              <div className="mt-1 font-semibold text-stone-500">待补资料</div>
            </div>
          </div>
        </div>
        <div className="mt-4 grid gap-3 lg:grid-cols-4">
          {[
            {
              title: '发布凭证',
              status: '今天可先准备',
              body: '先收大众点评、小红书、抖音或微信群链接和截图，不用先接平台账号。',
              proof: '老板能看到哪条内容已经发出，哪条还缺证明。',
            },
            {
              title: '门店记忆',
              status: '今天可先准备',
              body: '记录菜品、价格边界、禁用说法、负责人和上一轮复盘。',
              proof: '下一轮活动不用从空白页开始。',
            },
            {
              title: '店长跟进',
              status: '今天可先准备',
              body: '把预约、券领取、私信咨询和社群反馈整理成负责人任务。',
              proof: '只看聚合信号，不保存联系电话、微信号或私信原文。',
            },
            {
              title: '账号确认',
              status: '确认后执行',
              body: '对外发布、核销和经营复盘要等店长确认账号、活动权限和去掉顾客隐私的汇总表。',
              proof: '没确认前只生成操作清单，不冒充已执行。',
            },
          ].map(item => (
            <article className="border border-stone-200 bg-[#fbfaf7] p-3" key={item.title}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[11px] font-semibold text-stone-500">老板可见</div>
                  <h4 className="mt-1 text-sm font-black text-stone-950">{formatRuntimeNarrative(item.title)}</h4>
                </div>
                <span className="shrink-0 border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-800">
                  {formatRuntimeStatus(item.status)}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-stone-600">{formatRuntimeNarrative(item.body)}</p>
              <p className="mt-2 text-[11px] leading-5 text-stone-500">{formatRuntimeNarrative(item.proof)}</p>
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
              <p className="mt-3 text-xs leading-5 text-stone-600">给运营和技术复核使用：确认这类试跑交接现在是本地可准备、待补资料，还是必须人工交接。</p>
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
                这里是客户试用时的主路径：把门店资料转成一张可复核的工单，随后看发布凭证、店长跟进、回收信号和下一步。底层工具仍保留，但不让客户在技术按钮里迷路。
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-4 xl:min-w-[640px]">
              <div className="border border-white/10 bg-white/[0.06] p-3">
                <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">当前状态</div>
                <div className="mt-1 truncate font-mono text-sm font-black text-white" title={formatRuntimeStatus(commandMode)}>{formatRuntimeStatus(commandMode)}</div>
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
                <div className="mt-1 text-[10px] text-white/35">尝试 {commandChannelAttempts} 次 / 待补资料 {commandChannelBlocked} 次 / 待复核 {commandChannelAcknowledged} 次</div>
              </div>
            </div>
          </div>
          <div className="mt-4 border border-amber-200/25 bg-amber-200/[0.05] p-3">
            {dispatchState.residentAgentMissionControl ? (
              <div className="mb-4 border border-emerald-200/30 bg-emerald-200/[0.06] p-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/75">常驻任务板</div>
                    <h4 className="mt-1 text-base font-black text-white">{formatRuntimeStatus(dispatchState.residentAgentMissionControl.mode)} / {formatRuntimeNarrative(dispatchState.residentAgentMissionControl.primaryAction.label)}</h4>
                    <p className="mt-1 text-xs leading-5 text-white/60">{formatRuntimeNarrative(dispatchState.residentAgentMissionControl.answerForMerchant)}</p>
                  </div>
                  <div className="grid min-w-[280px] grid-cols-3 gap-2 text-xs">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{dispatchState.residentAgentMissionControl.summary.readyLanes}/{dispatchState.residentAgentMissionControl.summary.lanes}</div>
                      <p className="mt-1 text-white/55">待复核链路</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{dispatchState.residentAgentMissionControl.summary.externalGates}</div>
                      <p className="mt-1 text-white/55">账号资料</p>
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
                        <span className="font-mono text-white">{formatRuntimeSchemaLabel(item.id)}</span>
                        <span>{formatRuntimeStatus(item.status)} / {formatRuntimeOwner(item.owner)}</span>
                      </div>
                      <p className="mt-1 text-white/60">{formatRuntimeNarrative(item.promise)}</p>
                      <p className="mt-1 text-white/45">{formatRuntimeNarrative(item.nextAction)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    首要动作: {formatRuntimeNarrative(dispatchState.residentAgentMissionControl.primaryAction.reason)} / 凭证: {formatRuntimeEvidenceValue(dispatchState.residentAgentMissionControl.primaryAction.evidenceRequired)}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.residentAgentMissionControl.safetyBoundary)}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.competitorTrainingBlueprint ? (
              <div className="mb-4 border border-cyan-200/30 bg-cyan-200/[0.06] p-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/75">对标准备清单</div>
                    <h4 className="mt-1 text-base font-black text-white">{formatRuntimeStatus(dispatchState.competitorTrainingBlueprint.verdict)} / 对标资料待补</h4>
                    <p className="mt-1 text-xs leading-5 text-white/60">
                      把同类产品的打法先映射成本地准备、复核凭证和账号资料约定，再谈发布凭证、线索承接、核销数据或收银复盘。
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
                      <p className="mt-1 text-white/55">试跑通道</p>
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
                        <span className="font-mono text-white">{formatRuntimeNarrative(item.title)}</span>
                        <span>{formatRuntimeStatus(item.currentStatus)} / {formatRuntimeOwner(item.owner)}</span>
                      </div>
                      <p className="mt-1 text-white/60">{formatRuntimeNarrative(item.targetState)}</p>
                      <p className="mt-1 text-white/45">{formatRuntimeNarrative(item.nextAction)}</p>
                      <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-cyan-100/60">复核</p>
                      <p className="mt-1 text-white/45">{formatRuntimeSchemaList(item.acceptanceEvidence, '无')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    本地训练待办: {dispatchState.competitorTrainingBlueprint.internalTrainingBacklog.slice(0, 3).map(item => formatRuntimeNarrative(item.material)).join(' / ') || '无'}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    待补账号资料: {formatSetupItemCount(dispatchState.competitorTrainingBlueprint.providerContractBacklog.slice(0, 3), '无')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.competitorTrainingBlueprint.safetyBoundary)}
                  </div>
                </div>
              </div>
            ) : null}
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] font-semibold tracking-[0.14em] text-amber-100/70">门店指令拆解</div>
                <h4 className="mt-1 text-base font-black text-white">一句店长的话，拆成内部动作、发布凭证和待补资料</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  输入店长会真的说的话，系统只做可复核路由：能本地生成的先生成，需要截图、链接、收银汇总或店长授权的会拆成证据要求，不会把私信、核销、发布和经营复盘伪装成可交付结论。
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
                    onClick={() => setRestaurantCommand(`今晚把 ${runtimeIntake.offer} 做成大众点评和小红书可发布版本，发布后回填截图回执。`)}
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
                    onClick={() => setRestaurantCommand('列出对外发布、核销、经营复盘前还缺哪些账号确认、截图回执和经营汇总表。')}
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
                    <span>指令拆解结果</span>
                    <span>{formatRuntimeSchemaLabel(commandRoute.intent)}</span>
                    <span>{formatRuntimeStatus(commandRoute.verdict)}</span>
                    <span>{formatRuntimeStatus(commandRoute.confidence)}</span>
                  </div>
                  <p className="mt-2 text-sm font-black text-white">{formatRuntimeNarrative(commandRoute.primaryAction.label)}</p>
                  <p className="mt-1 text-xs leading-5 text-white/55">{formatRuntimeNarrative(commandRoute.primaryAction.reason)}</p>
                  <p className="mt-2 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(commandRoute.primaryAction.stopLine)}</p>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">已提取凭证</div>
                  <p className="mt-2 text-xs leading-5 text-white/60">
                    渠道: {formatRuntimeSchemaList(commandRoute.extracted.channels, '待店长确认')}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/60">
                    服务时段: {commandRoute.extracted.serviceWindow || '待店长确认'}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/60">
                    凭证提示: {formatRuntimeSchemaList(commandRoute.extracted.evidenceHints, formatRuntimeSchemaList(commandRoute.primaryAction.evidenceRequired.slice(0, 3), '无'))}
                  </p>
                  {commandRoute.extracted.forbiddenHints.length ? (
                    <p className="mt-1 text-xs leading-5 text-rose-100/70">停止线: {formatRuntimeSchemaList(commandRoute.extracted.forbiddenHints, '按店长授权范围执行')}</p>
                  ) : null}
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">路由动作</div>
                  <p className="mt-2 text-sm font-black text-white">{formatRuntimeActionLabel(commandRoute.primaryAction.clientAction)}</p>
                  <p className="mt-1 text-xs leading-5 text-white/55">{formatRuntimeOwner(commandRoute.primaryAction.owner)} / {formatRuntimeStatus(commandRoute.primaryAction.status)}</p>
                  <p className="mt-2 text-[11px] leading-4 text-amber-100/60">
                    待补账号/授权/数据: {formatRuntimeSchemaList(commandRoute.externalRequired.slice(0, 4), '本地路由无需补账号资料')}
                  </p>
                  <button
                    className="mt-3 w-full border border-cyan-200/60 px-3 py-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={dispatchState.status === 'loading' || commandRoute.primaryAction.clientAction === 'manual-sanitize'}
                    onClick={runRoutedCommandAction}
                    type="button"
                  >
                    运行这一步
                  </button>
                </div>
              </div>
            ) : null}
            <div className="mt-3 border border-amber-200/40 bg-amber-200/[0.06] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.14em] text-amber-100/70">今日门店工单</div>
                    <h4 className="mt-1 text-base font-black text-white">门店工单预览</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      {(commandAiCockpit?.restaurant || runtimeIntake.restaurant)} / {(commandAiCockpit?.offer || runtimeIntake.offer)}：把今天可先准备的经营动作、发布前检查、凭证回填和店长跟进放到一张工单里。
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
                      <p className="mt-1 text-white/55">可先准备</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCockpitSummary.providerGated}</div>
                      <p className="mt-1 text-white/55">待补资料</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{formatRuntimeGate(commandCockpitSummary.canClaimAutomation, '凭证待复核', '待补凭证')}</div>
                      <p className="mt-1 text-white/55">交接复核</p>
                    </div>
                  </div>
                </div>
                {commandGmCommandDeck ? (
                  <div className="mt-3 border border-lime-200/25 bg-lime-200/[0.05] p-3">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/70">店总指挥台</div>
                        <h4 className="mt-1 text-sm font-black text-white">{formatRuntimeStatus(commandGmCommandDeck.shiftMode)} / 店总指挥台</h4>
                        <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">{formatRuntimeNarrative(commandGmCommandDeck.answerForOwner)}</p>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandGmCommandDeck.summary.aiCanRunInternal}</div>
                          <p className="mt-1 text-white/55">本地可先准备</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandGmCommandDeck.summary.staffReview}</div>
                          <p className="mt-1 text-white/55">员工确认</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandGmCommandDeck.summary.providerRequired}</div>
                          <p className="mt-1 text-white/55">待补账号资料</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{commandGmCommandDeck.summary.evidenceRequired}</div>
                          <p className="mt-1 text-white/55">需要凭证</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{formatRuntimeGate(commandGmCommandDeck.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                          <p className="mt-1 text-white/55">交接复核</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 lg:grid-cols-5">
                      {commandGmCommandDeck.lanes.map(lane => (
                        <div className="border border-white/10 bg-stone-950/50 p-3" key={lane.id}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-white">{formatRuntimeNarrative(lane.title)}</span>
                            <span className={lane.status === 'ai-can-run-internal' ? 'text-[11px] text-emerald-100/70' : lane.status === 'provider-required' ? 'text-[11px] text-amber-100/70' : 'text-[11px] text-lime-100/70'}>
                              {formatRuntimeStatus(lane.status)}
                            </span>
                          </div>
                          <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-white/60">{formatRuntimeNarrative(lane.customerPromise)}</p>
                          <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-lime-100/65">现在做: {formatRuntimeNarrative(lane.actionNow)}</p>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/40">凭证: {formatRuntimeEvidenceValue(lane.visibleProof)}</p>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-amber-100/55">账号资料: {formatRuntimeNarrative(lane.providerAsk)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid gap-2 lg:grid-cols-3">
                      <div className="border border-white/10 bg-white/[0.04] p-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">本地任务队列</div>
                        <p className="mt-1 text-[11px] leading-4 text-emerald-100/65">{commandGmCommandDeck.aiAutopilotQueue.map(formatRuntimeNarrative).join(' / ') || '无'}</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.04] p-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">员工队列</div>
                        <p className="mt-1 text-[11px] leading-4 text-lime-100/65">{commandGmCommandDeck.staffQueue.map(formatRuntimeNarrative).join(' / ') || '无'}</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.04] p-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待补资料队列</div>
                        <p className="mt-1 text-[11px] leading-4 text-amber-100/65">{formatRuntimeSchemaList(commandGmCommandDeck.providerQueue, '无')}</p>
                      </div>
                    </div>
                    <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(commandGmCommandDeck.safetyBoundary)}</p>
                  </div>
                ) : null}
                {commandShiftAutopilot ? (
                  <div className="mt-3 border border-sky-200/25 bg-sky-200/[0.05] p-3">
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">班次任务检查</div>
                        <h4 className="mt-1 text-sm font-black text-white">班次任务检查</h4>
                        <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                          把店总链路和定时通道任务收成一个有边界的班次队列，现在本地能跑什么、哪些要员工审核、哪些被账号授权和回执卡住。
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
                          运行班次任务检查
                        </button>
                        <button
                          className="ml-2 mt-3 border border-amber-200/70 px-3 py-2 text-xs font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildShiftProviderHandoff}
                          type="button"
                        >
                          生成试跑交接
                        </button>
                        <button
                          className="ml-2 mt-3 border border-lime-200/70 px-3 py-2 text-xs font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildShiftSandboxAcceptance}
                          type="button"
                        >
                          检查样例复核
                        </button>
                        <button
                          className="ml-2 mt-3 border border-orange-200/70 px-3 py-2 text-xs font-black text-orange-100 transition hover:bg-orange-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildShiftFirstForwardableRun}
                          type="button"
                        >
                          生成首轮交接复核
                        </button>
                        <button
                          className="ml-2 mt-3 border border-rose-200/70 px-3 py-2 text-xs font-black text-rose-100 transition hover:bg-rose-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={forwardShiftSandboxRun}
                          type="button"
                        >
                          交接班次样例试跑
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
                          <div className="font-mono text-white">{formatRuntimeGate(commandShiftAutopilot.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                          <p className="mt-1 text-white/55">交接复核</p>
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
                              一条客户路径：指令、班次运行、资料解锁、样例交接、回执、收尾训练和下轮工单解锁。
                            </p>
                            <p className="mt-2 text-[11px] leading-4 text-emerald-100/70">
                              下一步: {formatRuntimeNarrative(commandShiftOperatingLoopPack.nextBestAction.label)} / {formatRuntimeOwner(commandShiftOperatingLoopPack.nextBestAction.owner)}
                            </p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftOperatingLoopPack.summary.ready}/{commandShiftOperatingLoopPack.summary.stages}</div>
                              <p className="mt-1 text-white/55">资料可复核阶段</p>
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
                              <div className="font-mono text-white">{formatRuntimeGate(commandShiftOperatingLoopPack.summary.canSubmitSandbox, '样例待复核', '待补资料')}</div>
                              <p className="mt-1 text-white/55">样例交接</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 lg:grid-cols-3">
                          {commandShiftOperatingLoopPack.stages.map(stage => (
                            <div className="border border-white/10 bg-stone-950/50 p-3" key={stage.id}>
                              <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-white">{formatRuntimeNarrative(stage.title)}</span>
                                <span className={stage.status === 'ready' ? 'text-[11px] text-emerald-100/70' : stage.status === 'waiting-provider' ? 'text-[11px] text-amber-100/70' : stage.status === 'waiting-proof' ? 'text-[11px] text-sky-100/70' : 'text-[11px] text-rose-100/70'}>
                                  {formatRuntimeStatus(stage.status)}
                                </span>
                              </div>
                              <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(stage.customerVisible)}</p>
                              <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-emerald-100/65">动作: {formatRuntimeNarrative(stage.primaryAction)}</p>
                              <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/40">凭证: {formatRuntimeSchemaList(stage.evidence, '无')}</p>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(commandShiftOperatingLoopPack.safetyBoundary)}</p>
                      </div>
                    ) : null}
                    <div className="mt-3 grid gap-2 lg:grid-cols-5">
                      {commandShiftAutopilot.steps.map(step => (
                        <div className="border border-white/10 bg-stone-950/50 p-3" key={step.id}>
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-white">{formatRuntimeNarrative(step.title)}</span>
                            <span className={step.mode === 'run-internal' ? 'text-[11px] text-emerald-100/70' : step.mode === 'wait-provider' ? 'text-[11px] text-amber-100/70' : 'text-[11px] text-sky-100/70'}>
                              {formatRuntimeStatus(step.mode)}
                            </span>
                          </div>
                          <p className="mt-2 text-[11px] leading-4 text-white/50">{step.dueNow ? '现在到期' : `唤醒 ${step.nextWakeup}`} / {formatRuntimeOwner(step.owner)}</p>
                          <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-sky-100/65">动作: {formatRuntimeNarrative(step.action)}</p>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/40">凭证: {formatRuntimeSchemaList(step.proofRequired)}</p>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-amber-100/55">账号资料: {formatRuntimeSchemaList(step.providerRequired)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid gap-2 lg:grid-cols-3">
                      <div className="border border-white/10 bg-white/[0.04] p-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">当前队列</div>
                        <p className="mt-1 text-[11px] leading-4 text-emerald-100/65">{commandShiftAutopilot.nowQueue.map(formatRuntimeNarrative).join(' / ') || '无'}</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.04] p-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">下次唤醒</div>
                        <p className="mt-1 text-[11px] leading-4 text-sky-100/65">{commandShiftAutopilot.nextWakeups.map(formatRuntimeNarrative).join(' / ') || '无'}</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.04] p-2">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">经营守则</div>
                        <p className="mt-1 text-[11px] leading-4 text-white/45">{commandShiftAutopilot.operatingPolicy.map(formatRuntimeNarrative).join(' / ')}</p>
                      </div>
                    </div>
                    {commandShiftAutopilotRun ? (
                      <div className="mt-3 border border-sky-200/20 bg-stone-950/40 p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">最近运行台账</div>
                            <h5 className="mt-1 text-sm font-black text-white">班次试跑记录</h5>
                            <p className="mt-1 text-xs leading-5 text-white/55">班次巡航结果 / {commandShiftAutopilotRun.completedAt}</p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftAutopilotRun.summary.acceptedInternalActions}</div>
                              <p className="mt-1 text-white/55">待复核</p>
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
                              {commandShiftAutopilotRun.acceptedInternalActions.map(action => formatRuntimeNarrative(action.title)).join(' / ') || '无'}
                            </p>
                          </div>
                          <div className="border border-white/10 bg-white/[0.04] p-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待补资料挂起</div>
                            <p className="mt-1 text-[11px] leading-4 text-amber-100/65">
                              {commandShiftAutopilotRun.providerHeldActions.map(action => formatRuntimeSchemaList(action.providerRequired, formatRuntimeNarrative(action.title))).join(' / ') || '无'}
                            </p>
                          </div>
                          <div className="border border-white/10 bg-white/[0.04] p-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">凭证台账</div>
                            <p className="mt-1 text-[11px] leading-4 text-white/45">
                              {commandShiftAutopilotRun.evidenceLedger.slice(0, 3).map(item => `${formatRuntimeNarrative(item.title)}: ${formatRuntimeStatus(item.status)}`).join(' / ') || '无'}
                            </p>
                          </div>
                        </div>
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(commandShiftAutopilotRun.safetyBoundary)}</p>
                      </div>
                    ) : null}
                    {commandShiftProviderHandoff ? (
                      <div className="mt-3 border border-amber-200/25 bg-amber-200/[0.05] p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">班次试跑交接</div>
                            <h5 className="mt-1 text-sm font-black text-white">班次试跑交接清单</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">{formatRuntimeNarrative(commandShiftProviderHandoff.nextAction)}</p>
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
                              <div className="font-mono text-white">{formatRuntimeGate(commandShiftProviderHandoff.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                              <p className="mt-1 text-white/55">交接复核</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 lg:grid-cols-3">
                          <div className="border border-white/10 bg-white/[0.04] p-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">服务端试跑通道配置</div>
                            <p className="mt-1 text-[11px] leading-4 text-amber-100/65">{formatSetupItemCount(commandShiftProviderHandoff.providerEnvKeys.slice(0, 6), '资料可复核')}</p>
                          </div>
                          <div className="border border-white/10 bg-white/[0.04] p-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">店长确认</div>
                            <p className="mt-1 text-[11px] leading-4 text-white/45">{formatRuntimeSchemaList(commandShiftProviderHandoff.merchantApprovals.slice(0, 5), '无')}</p>
                          </div>
                          <div className="border border-white/10 bg-white/[0.04] p-2">
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">数据约定</div>
                            <p className="mt-1 text-[11px] leading-4 text-white/45">{formatRuntimeSchemaList(commandShiftProviderHandoff.dataContracts.slice(0, 5), '无')}</p>
                          </div>
                        </div>
                        {commandShiftProviderHandoff.requests.slice(0, 4).map(request => (
                          <div className="mt-2 border border-white/10 bg-stone-950/50 p-2" key={request.id}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-black text-white">{formatRuntimeSchemaLabel(request.capability)}</span>
                              <span className="text-[11px] text-amber-100/70">{formatRuntimeStatus(request.priority)} / {formatRuntimeStatus(request.status)}</span>
                            </div>
                            <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(request.ask)}</p>
                            <p className="mt-1 text-[11px] leading-4 text-white/35">复核: {formatRuntimeNarrative(request.acceptance)}</p>
                          </div>
                        ))}
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(commandShiftProviderHandoff.safetyBoundary)}</p>
                      </div>
                    ) : null}
                    {commandShiftSandboxAcceptance ? (
                      <div className="mt-3 border border-lime-200/25 bg-lime-200/[0.05] p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/70">班次样例复核</div>
                            <h5 className="mt-1 text-sm font-black text-white">{formatRuntimeStatus(commandShiftSandboxAcceptance.verdict)}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">班次样例复核结果</p>
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
                              <p className="mt-1 text-white/55">待补资料请求</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{formatRuntimeGate(commandShiftSandboxAcceptance.summary.canSubmitSandbox, '样例待复核', '待补资料')}</div>
                              <p className="mt-1 text-white/55">样例交接</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{formatRuntimeGate(commandShiftSandboxAcceptance.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                              <p className="mt-1 text-white/55">交接复核</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 lg:grid-cols-3">
                          {commandShiftSandboxAcceptance.stages.slice(0, 6).map(stage => (
                            <div className="border border-white/10 bg-stone-950/50 p-2" key={stage.id}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-black text-white">{formatRuntimeSchemaLabel(stage.id)}</span>
                                <span className={stage.status === 'passed' ? 'text-[11px] text-emerald-100/70' : stage.status === 'waiting-external' ? 'text-[11px] text-amber-100/70' : 'text-[11px] text-rose-100/70'}>
                                  {formatRuntimeStatus(stage.status)}
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(stage.nextAction)}</p>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(commandShiftSandboxAcceptance.safetyBoundary)}</p>
                      </div>
                    ) : null}
                    {commandShiftFirstForwardableRun ? (
                      <div className="mt-3 border border-orange-200/25 bg-orange-200/[0.05] p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-100/70">班次首轮交接复核</div>
                            <h5 className="mt-1 text-sm font-black text-white">{formatRuntimeStatus(commandShiftFirstForwardableRun.verdict)}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                              班次交接预检会把最新班次台账、待补资料、样例复核和脱敏任务包合成一份可复核的交接材料。
                            </p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftFirstForwardableRun.summary.shiftRuns}</div>
                              <p className="mt-1 text-white/55">班次运行</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftFirstForwardableRun.summary.providerRequests}</div>
                              <p className="mt-1 text-white/55">待补资料请求</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftFirstForwardableRun.summary.forwardablePackages}</div>
                              <p className="mt-1 text-white/55">任务包</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{formatRuntimeGate(commandShiftFirstForwardableRun.summary.canSubmitSandbox, '样例待复核', '待补资料')}</div>
                              <p className="mt-1 text-white/55">样例</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{formatRuntimeGate(commandShiftFirstForwardableRun.summary.canForwardFirstShiftRun, '待复核', '待补资料')}</div>
                              <p className="mt-1 text-white/55">首跑</p>
                            </div>
                          </div>
                        </div>
                        {commandShiftFirstForwardableRun.selectedShiftRun ? (
                          <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/55">
                            选中班次: {commandShiftFirstForwardableRun.selectedShiftRun.restaurant} / {commandShiftFirstForwardableRun.selectedShiftRun.offer} / 待补资料 {commandShiftFirstForwardableRun.selectedShiftRun.providerHeldActions} / 负责人任务 {commandShiftFirstForwardableRun.selectedShiftRun.createdStoreManagerTasks}
                          </p>
                        ) : null}
                        <div className="mt-3 grid gap-2 lg:grid-cols-3">
                          {commandShiftFirstForwardableRun.stages.map(stage => (
                            <div className="border border-white/10 bg-stone-950/50 p-2" key={stage.id}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-black text-white">{formatRuntimeSchemaLabel(stage.id)}</span>
                                <span className={stage.status === 'passed' ? 'text-[11px] text-emerald-100/70' : stage.status === 'waiting-external' ? 'text-[11px] text-amber-100/70' : 'text-[11px] text-rose-100/70'}>
                                  {formatRuntimeStatus(stage.status)}
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(stage.nextAction)}</p>
                            </div>
                          ))}
                        </div>
                        {commandShiftFirstForwardableRun.selectedPackage ? (
                          <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-orange-100/65">
                            交接包: {formatRuntimeTargetLabel(commandShiftFirstForwardableRun.selectedPackage.runtimeTarget)} / {formatRuntimeActionLabel(commandShiftFirstForwardableRun.selectedPackage.requestedAction)} / {commandShiftFirstForwardableRun.selectedPackage.canForward ? '已脱敏' : formatRuntimeStatus(commandShiftFirstForwardableRun.selectedPackage.blockedReasons[0])}
                          </p>
                        ) : null}
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(commandShiftFirstForwardableRun.safetyBoundary)}</p>
                      </div>
                    ) : null}
                    {commandShiftSandboxForwardAttempt ? (
                      <div className="mt-3 border border-rose-200/25 bg-rose-200/[0.05] p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-100/70">班次样例转发尝试</div>
                            <h5 className="mt-1 text-sm font-black text-white">{formatRuntimeStatus(commandShiftSandboxForwardAttempt.verdict)}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                              样例转交尝试 / {formatRuntimeNarrative(commandShiftSandboxForwardAttempt.bridge.message)}
                            </p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-4 xl:min-w-[520px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{formatRuntimeStatus(commandShiftSandboxForwardAttempt.summary.bridgeStatus)}</div>
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
                              <div className="font-mono text-white">{formatRuntimeGate(commandShiftSandboxForwardAttempt.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                              <p className="mt-1 text-white/55">边界</p>
                            </div>
                          </div>
                        </div>
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/55">
                          回执: {formatRuntimeSchemaLabel(commandShiftSandboxForwardAttempt.receiptExpectation.callbackHeader)} / {formatRuntimeSchemaLabel(commandShiftSandboxForwardAttempt.receiptExpectation.closeoutRule)}
                        </p>
                        {commandShiftSandboxForwardAttempt.selectedPackage ? (
                          <p className="mt-2 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-rose-100/65">
                            交接包: {formatRuntimeTargetLabel(commandShiftSandboxForwardAttempt.selectedPackage.runtimeTarget)} / {formatRuntimeStatus(commandShiftSandboxForwardAttempt.selectedPackage.status)} / {commandShiftSandboxForwardAttempt.selectedPackage.canForward ? '待复核' : formatRuntimeStatus(commandShiftSandboxForwardAttempt.selectedPackage.blockedReasons[0])}
                          </p>
                        ) : null}
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(commandShiftSandboxForwardAttempt.safetyBoundary)}</p>
                      </div>
                    ) : null}
                    {commandShiftCloseoutTrainingPack ? (
                      <div className="mt-3 border border-violet-200/25 bg-violet-200/[0.05] p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/70">班次收尾准备包</div>
                            <h5 className="mt-1 text-sm font-black text-white">{formatRuntimeStatus(commandShiftCloseoutTrainingPack.verdict)}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                              收尾准备包会把回执、恢复动作、复盘和门店草稿转成下一轮门店动作。
                            </p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingPack.summary.acceptedReceipts}</div>
                              <p className="mt-1 text-white/55">待复核</p>
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
                              <div className="font-mono text-white">{formatRuntimeGate(commandShiftCloseoutTrainingPack.summary.canRecordTraining, '凭证待复核', '待补凭证')}</div>
                              <p className="mt-1 text-white/55">准备</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 lg:grid-cols-5">
                          {commandShiftCloseoutTrainingPack.lanes.map(lane => (
                            <div className="border border-white/10 bg-stone-950/50 p-2" key={lane.id}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-black text-white">{formatRuntimeSchemaLabel(lane.id)}</span>
                                <span className={lane.status === 'ready' ? 'text-[11px] text-emerald-100/70' : lane.status === 'waiting' ? 'text-[11px] text-amber-100/70' : 'text-[11px] text-rose-100/70'}>
                                  {formatRuntimeStatus(lane.status)}
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(lane.nextAction)}</p>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 grid gap-2 lg:grid-cols-3">
                          {commandShiftCloseoutTrainingPack.trainingDrafts.slice(0, 3).map(draft => (
                            <div className="border border-white/10 bg-white/[0.04] p-2" key={`${draft.capabilityId}-${draft.name}`}>
                              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/70">{formatRuntimeSchemaLabel(draft.capabilityId)}</div>
                              <p className="mt-1 text-[11px] leading-4 text-white/60">{formatRuntimeNarrative(draft.name)} / {formatRuntimeOwner(draft.owner)}</p>
                              <p className="mt-1 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(draft.acceptedWhen)}</p>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(commandShiftCloseoutTrainingPack.safetyBoundary)}</p>
                      </div>
                    ) : null}
                    {commandShiftCloseoutTrainingRecordAttempt ? (
                      <div className="mt-3 border border-emerald-200/25 bg-emerald-200/[0.05] p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">班次收尾准备记录</div>
                            <h5 className="mt-1 text-sm font-black text-white">{formatRuntimeStatus(commandShiftCloseoutTrainingRecordAttempt.verdict)}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                              收尾准备记录 / {formatRuntimeNarrative(commandShiftCloseoutTrainingRecordAttempt.nextAction)}
                            </p>
                          </div>
                          <div className="grid gap-2 text-xs sm:grid-cols-4 xl:min-w-[520px]">
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingRecordAttempt.summary.recordableDrafts}</div>
                              <p className="mt-1 text-white/55">待复核记录</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingRecordAttempt.summary.recorded}</div>
                              <p className="mt-1 text-white/55">待复核记录</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{commandShiftCloseoutTrainingRecordAttempt.summary.rejected}</div>
                              <p className="mt-1 text-white/55">已拒绝</p>
                            </div>
                            <div className="border border-white/10 bg-white/[0.05] p-2">
                              <div className="font-mono text-white">{formatRuntimeGate(commandShiftCloseoutTrainingRecordAttempt.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                              <p className="mt-1 text-white/55">边界</p>
                            </div>
                          </div>
                        </div>
                        {commandShiftCloseoutTrainingRecordAttempt.records.slice(0, 3).map(record => (
                          <p className="mt-2 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-emerald-100/65" key={record.recordId}>
                            {record.accepted ? '待复核' : '已拒绝'}: {formatRuntimeSchemaLabel(record.capabilityId)} / {formatRuntimeNarrative(record.name)}
                          </p>
                        ))}
                        {commandShiftCloseoutTrainingRecordAttempt.rejectedDrafts.slice(0, 2).map(draft => (
                          <p className="mt-2 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-amber-100/60" key={`${draft.capabilityId}-${draft.name}`}>
                            待补资料: {formatRuntimeSchemaLabel(draft.capabilityId)} / {formatRuntimeNarrative(draft.reason)}
                          </p>
                        ))}
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(commandShiftCloseoutTrainingRecordAttempt.safetyBoundary)}</p>
                      </div>
                    ) : null}
                    {commandShiftCapabilityActivationPack ? (
                      <div className="mt-3 border border-cyan-200/25 bg-cyan-200/[0.05] p-3">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                          <div>
                            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/70">班次工单解锁包</div>
                            <h5 className="mt-1 text-sm font-black text-white">{formatRuntimeStatus(commandShiftCapabilityActivationPack.verdict)}</h5>
                            <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                              工单解锁包会把待复核训练记录转成“本地可先准备”或“待补资料”的门店任务。
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
                              <div className="font-mono text-white">{formatRuntimeGate(commandShiftCapabilityActivationPack.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                              <p className="mt-1 text-white/55">边界</p>
                            </div>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-2 lg:grid-cols-3">
                          {commandShiftCapabilityActivationPack.activations.slice(0, 6).map(item => (
                            <div className="border border-white/10 bg-stone-950/50 p-2" key={item.capabilityId}>
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-black text-white">{formatRuntimeSchemaLabel(item.capabilityId)}</span>
                                <span className={item.status === 'activated-internal' ? 'text-[11px] text-emerald-100/70' : item.status === 'trained-needs-provider' ? 'text-[11px] text-amber-100/70' : 'text-[11px] text-rose-100/70'}>
                                  {formatRuntimeStatus(item.status)}
                                </span>
                              </div>
                              <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(item.nextAction)}</p>
                              <p className="mt-1 text-[11px] leading-4 text-cyan-100/55">待复核记录: {item.acceptedRecords} / 待补资料: {formatRuntimeSchemaList(item.providerEvidence.slice(0, 2), formatRuntimeSchemaList(item.providerGaps.slice(0, 2)))}</p>
                            </div>
                          ))}
                        </div>
                        <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(commandShiftCapabilityActivationPack.safetyBoundary)}</p>
                      </div>
                    ) : null}
                    <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(commandShiftAutopilot.safetyBoundary)}</p>
                  </div>
                ) : null}
                <div className="mt-3 grid gap-2 lg:grid-cols-4">
                  {commandCockpitZones.map(zone => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={zone.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{formatRuntimeLabel(zone.title)}</span>
                        <span className="text-[11px] text-amber-100/70">{formatRuntimeStatus(zone.status)}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/60">{formatRuntimeNarrative(zone.answer)}</p>
                      <p className="mt-2 text-[11px] leading-4 text-amber-100/60">动作: {formatRuntimeNarrative(zone.primaryAction)}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/45">凭证: {formatRuntimeSchemaList(zone.visibleProof.slice(0, 3), '无')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">条件: {formatRuntimeNarrative(zone.providerGate)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 border border-fuchsia-200/20 bg-fuchsia-200/[0.04] p-3">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/70">对标路线判断</div>
                      <h4 className="mt-1 text-sm font-black text-white">工作台主链 + 任务体验 + 通道/数据约定</h4>
                      <p className="mt-2 max-w-4xl text-[11px] leading-4 text-white/50">
                        判断哪些能力可以直接复用、哪些需要升级、哪些今天能本地试跑，以及还缺哪些账号确认或经营数据规则。
                      </p>
                      <p className="mt-2 max-w-4xl text-[11px] leading-4 text-fuchsia-100/60">
                        最终试跑形态：先给门店一张增长工单，操作层是店长和运营可用的任务面板，外部动作只表达为试跑交接通道。这里不展示底层代号，只保留默认试跑路径、能力卡片、凭证回执和待补资料条件这套页面体验。
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
                          <p className="mt-1 text-white/55">账号资料</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.04] p-2">
                          <div className="font-mono text-white">{dispatchState.competitorRouteDecision.summary.canClaimFullCompetitorParity ? '是' : '否'}</div>
                          <p className="mt-1 text-white/55">完全对标</p>
                        </div>
                      </div>
                      <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-xs leading-5 text-fuchsia-100/70">{formatRuntimeNarrative(dispatchState.competitorRouteDecision.answerForOwner)}</p>
                      <div className="mt-3 border border-white/10 bg-white/[0.04] p-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">最终产品形态</div>
                        <p className="mt-2 text-xs leading-5 text-fuchsia-100/75">{formatRuntimeNarrative(dispatchState.competitorRouteDecision.finalShape.reason)}</p>
                        <div className="mt-3 grid gap-2 text-[11px] md:grid-cols-4">
                          <div className="border border-white/10 bg-stone-950/45 p-2">
                            <div className="font-mono text-white">{formatRuntimeNarrative(dispatchState.competitorRouteDecision.finalShape.productBase)}</div>
                            <p className="mt-1 text-white/45">工作台定位</p>
                          </div>
                          <div className="border border-white/10 bg-stone-950/45 p-2">
                            <div className="font-mono text-white">{formatRuntimeNarrative(dispatchState.competitorRouteDecision.finalShape.operatorLayer)}</div>
                            <p className="mt-1 text-white/45">操作层</p>
                          </div>
                          <div className="border border-white/10 bg-stone-950/45 p-2">
                            <div className="font-mono text-white">{formatRuntimeNarrative(dispatchState.competitorRouteDecision.finalShape.runtimeLayer)}</div>
                            <p className="mt-1 text-white/45">执行层</p>
                          </div>
                          <div className="border border-white/10 bg-stone-950/45 p-2">
                            <div className="font-mono text-white">{formatRuntimeNarrative(dispatchState.competitorRouteDecision.finalShape.dataLayer)}</div>
                            <p className="mt-1 text-white/45">数据层</p>
                          </div>
                        </div>
                        <p className="mt-3 text-[11px] leading-4 text-amber-100/65">{formatRuntimeNarrative(dispatchState.competitorRouteDecision.finalShape.firstScreenRule)}</p>
                      </div>
                      <div className="mt-3 grid gap-2 lg:grid-cols-3">
                        {dispatchState.competitorRouteDecision.referenceModels.map(model => (
                          <div className="border border-white/10 bg-stone-950/50 p-3" key={model.id}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-black text-white">{formatRuntimeNarrative(model.label)}</span>
                              <span className="text-[11px] text-fuchsia-100/70">{formatRuntimeNarrative(model.recommendedUse)} / {model.fitScore}</span>
                            </div>
                            <p className="mt-2 text-[11px] leading-4 text-emerald-100/60">吸收: {model.adopt.slice(0, 3).map(formatRuntimeNarrative).join(' / ')}</p>
                            <p className="mt-1 text-[11px] leading-4 text-rose-100/60">不展示底层代号: {model.doNotCopyBlindly.slice(0, 2).map(formatRuntimeNarrative).join(' / ')}</p>
                            <p className="mt-1 text-[11px] leading-4 text-cyan-100/60">页面体验: {model.uiUxToReplicate.slice(0, 3).map(formatRuntimeNarrative).join(' / ')}</p>
                            <p className="mt-1 text-[11px] leading-4 text-amber-100/60">还需账号资料: {formatRuntimeSchemaList(model.externalRequired.slice(0, 3), '无')}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 grid gap-2 lg:grid-cols-4">
                        {dispatchState.competitorRouteDecision.options.map(option => (
                          <div className="border border-white/10 bg-stone-950/50 p-3" key={option.id}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-xs font-black text-white">{formatRuntimeNarrative(option.label)}</span>
                              <span className="text-[11px] text-fuchsia-100/70">{formatRuntimeStatus(option.verdict)}</span>
                            </div>
                            <p className="mt-2 text-[11px] leading-4 text-white/60">{formatRuntimeNarrative(option.why)}</p>
                            <p className="mt-2 text-[11px] leading-4 text-emerald-100/60">可借鉴: {option.copyExactly.slice(0, 3).map(formatRuntimeNarrative).join(' / ')}</p>
                            <p className="mt-1 text-[11px] leading-4 text-cyan-100/60">可升级: {option.upgradeBeyondCompetitor.slice(0, 2).map(formatRuntimeNarrative).join(' / ')}</p>
                            <p className="mt-1 text-[11px] leading-4 text-amber-100/60">待补账号/授权/数据: {formatRuntimeSchemaList(option.externalRequired.slice(0, 3), '无')}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 grid gap-2 lg:grid-cols-3">
                        <div className="border border-white/10 bg-white/[0.04] p-2">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">下一个构建顺序</div>
                          {dispatchState.competitorRouteDecision.nextBuildOrder.slice(0, 4).map(item => (
                            <p className="mt-2 text-[11px] leading-4 text-white/55" key={item.id}>{formatRuntimeOwner(item.owner)}: {formatRuntimeNarrative(item.action)}</p>
                          ))}
                        </div>
                        <div className="border border-white/10 bg-white/[0.04] p-2">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">账号配置</div>
                          <p className="mt-2 text-[11px] leading-4 text-amber-100/65">{formatSetupItemCount(dispatchState.competitorRouteDecision.providerKeyChecklist.slice(0, 12), '资料可复核')}</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.04] p-2">
                          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">店长输入</div>
                          <p className="mt-2 text-[11px] leading-4 text-white/45">{dispatchState.competitorRouteDecision.merchantInputsNeeded.map(formatRuntimeNarrative).join(' / ')}</p>
                          <p className="mt-2 text-[11px] leading-4 text-white/35">{formatRuntimeNarrative(dispatchState.competitorRouteDecision.safetyBoundary)}</p>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
                <div className="mt-3 border border-cyan-200/20 bg-cyan-200/[0.04] p-3">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/70">竞品对照板</div>
                      <h4 className="mt-1 text-sm font-black text-white">对标打法拆成本地工单 / 待补资料两层</h4>
                    </div>
                    <div className="flex flex-col gap-2 lg:items-end">
                      <p className="max-w-2xl text-[11px] leading-4 text-white/45">
                        这里不承诺平台发布、线索承接或核销已经复核；只把本地可先准备的计划、回执、记忆、复盘先跑起来，把必须补齐的账号资料列清楚。
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="border border-cyan-200/50 px-3 py-2 text-xs font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildExternalUnlockRequestPack}
                          type="button"
                        >
                          交接解锁清单
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
                        交接解锁清单会生成交付包、复核字段和导出摘要，方便交给店长、技术和数据负责人签收。
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 lg:grid-cols-3">
                    {competitorParityLanes.map(lane => (
                      <div className="border border-white/10 bg-stone-950/50 p-3" key={lane.title}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-white">{formatRuntimeNarrative(lane.title)}</span>
                          <span className={lane.status === 'ready-internal' ? 'text-[11px] text-emerald-100/70' : 'text-[11px] text-amber-100/70'}>
                            {formatRuntimeStatus(lane.status)}
                          </span>
                        </div>
                        <p className="mt-2 text-[11px] leading-4 text-white/60">本地能做: {formatRuntimeNarrative(lane.internal)}</p>
                        <p className="mt-2 text-[11px] leading-4 text-amber-100/60">还需账号资料: {formatRuntimeNarrative(lane.external)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 border border-emerald-200/20 bg-emerald-200/[0.04] p-3">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">常驻店员循环</div>
                      <h4 className="mt-1 text-sm font-black text-white">门店任务助手：回执检查、店长跟进、沉淀资料</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="border border-emerald-200/50 px-3 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={dispatchState.status === 'loading'}
                        onClick={runHeartbeat}
                        type="button"
                      >
                        运行跟进检查
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
                          <span className="text-xs font-black text-white">{formatRuntimeNarrative(item.title)}</span>
                          <span className={item.status === 'ready-internal' ? 'text-[11px] text-emerald-100/70' : item.status === 'provider-gated' ? 'text-[11px] text-amber-100/70' : 'text-[11px] text-rose-100/70'}>
                            {formatRuntimeStatus(item.status)}
                          </span>
                        </div>
                        <p className="mt-2 text-[11px] leading-4 text-white/55">{formatRuntimeOwner(item.owner)}</p>
                        <p className="mt-2 text-[11px] leading-4 text-white/65">{formatRuntimeNarrative(item.action)}</p>
                        <p className="mt-2 text-[11px] leading-4 text-emerald-100/60">凭证: {formatRuntimeEvidenceValue(item.proof)}</p>
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
                            <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-emerald-100/70">{formatRuntimeStatus(item.priority)}</span>
                            <span className="text-[10px] text-white/35">{formatRuntimeOwner(item.owner)}</span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-white">{formatRuntimeNarrative(item.nextAction)}</p>
                          <p className="mt-1 text-[11px] leading-4 text-white/40">凭证: {formatRuntimeEvidenceValue(item.evidenceRequired)}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">主操作清单</div>
                    {(commandAiCockpit?.primaryRunbook || [
                      '先打开今日门店运营，确认店长凭证。',
                      '经营建议只产出负责人可见的打法，不做暗箱试跑交接。',
                      '试跑交接逐项通过账号检查、门店授权和签名回执后再启动。',
                      '下一轮决策前，用公开凭证或脱敏汇总导入关掉凭证复核。',
                    ]).map(line => (
                      <p className="mt-2 text-[11px] leading-4 text-amber-100/65" key={line}>{line}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">凭证板</div>
                    <p className="mt-2 text-xs leading-5 text-white/55">{formatRuntimeSchemaList((commandAiCockpit?.evidenceBoard || commandCockpitZones.flatMap(zone => zone.visibleProof)).slice(0, 12), '无')}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">资料解锁</div>
                    <p className="mt-2 text-xs leading-5 text-amber-100/65">{formatRuntimeSchemaList((commandAiCockpit?.providerUnlocks || ['门店授权', '账号配置', '隔离试跑会话', '签名回执', '收银汇总数据规则']).slice(0, 12), '无')}</p>
                    <p className="mt-3 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(commandAiCockpit?.safetyBoundary || '仅预览：账号授权和回执待复核，不能标记已发布、不接电话、不写收银数据、不碰支付配送、不核销、不读私信。')}</p>
                  </div>
                </div>
              </div>
            {commandAiEmployeeMemoryPack ? (
              <div className="mt-3 border border-violet-200/30 bg-violet-200/[0.06] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/70">门店记忆包</div>
                    <h4 className="mt-1 text-base font-black text-white">门店记忆包</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      {commandAiEmployeeMemoryPack.residentEmployeeBrief.map(formatRuntimeNarrative).join(' / ')}
                    </p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-4 lg:min-w-[520px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiEmployeeMemoryPack.summary.memoryCards}</div>
                      <p className="mt-1 text-white/55">记忆卡</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiEmployeeMemoryPack.summary.trainingReady}</div>
                      <p className="mt-1 text-white/55">可训练</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandAiEmployeeMemoryPack.summary.providerGates}</div>
                      <p className="mt-1 text-white/55">待补资料</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{formatRuntimeGate(commandAiEmployeeMemoryPack.employee.safeToAutonomouslyRun, '可辅助', '待补凭证')}</div>
                      <p className="mt-1 text-white/55">辅助程度</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {commandAiEmployeeMemoryPack.memoryCards.slice(0, 6).map(card => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={card.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{formatRuntimeNarrative(card.title)}</span>
                        <span className="text-[11px] text-violet-100/70">{formatRuntimeStatus(card.status)} / {formatRuntimeOwner(card.owner)}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/65">{formatRuntimeNarrative(card.detail)}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(card.nextAction)}</p>
                      <p className="mt-2 text-[11px] leading-4 text-violet-100/60">凭证: {formatRuntimeEvidenceValue(card.evidenceRequired)}</p>
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
                            <span className="font-mono text-white">{formatRuntimeOwner(wakeup.owner)}</span>
                            <span className="text-white/45">{wakeup.dueWindow}</span>
                          </div>
                          <p className="mt-1 text-xs leading-5 text-white/60">{formatRuntimeNarrative(wakeup.action)}</p>
                          <p className="mt-1 text-[11px] text-white/40">触发条件: {formatRuntimeNarrative(wakeup.trigger)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">训练与账号资料</div>
                    <p className="mt-2 text-xs leading-5 text-white/60">
                      现在可训练: {commandAiEmployeeMemoryPack.trainingProgress.trainableNow}; 待补资料: {commandAiEmployeeMemoryPack.trainingProgress.providerGated}; 缺少材料: {commandAiEmployeeMemoryPack.summary.trainingMissingMaterials}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-white/55">
                      下一轮训练: {commandAiEmployeeMemoryPack.trainingProgress.nextInternalTraining.slice(0, 3).map(item => `${formatRuntimeSchemaLabel(item.capabilityId)}: ${formatRuntimeNarrative(item.material)}`).join(' / ') || '无'}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-violet-100/65">
                      待补账号/授权/数据: {formatRuntimeSchemaList(commandAiEmployeeMemoryPack.externalRequired.slice(0, 6))}
                    </p>
                    <p className="mt-3 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(commandAiEmployeeMemoryPack.safetyBoundary)}</p>
                  </div>
                </div>
              </div>
            ) : null}
            {commandAiConsultantCopilot ? (
              <div className="mt-3 border border-fuchsia-200/30 bg-fuchsia-200/[0.06] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/70">门店经营顾问</div>
                    <h4 className="mt-1 text-base font-black text-white">经营顾问协作建议</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">{formatRuntimeNarrative(commandAiConsultantCopilot.executiveAnswer)}</p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-5 lg:min-w-[620px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{formatRuntimeStatus(commandAiConsultantCopilot.mode)}</div>
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
                      <div className="font-mono text-white">{formatRuntimeGate(commandAiConsultantCopilot.summary.canClaimAutonomousOutcome, '凭证待复核', '待补凭证')}</div>
                      <p className="mt-1 text-white/55">交接复核</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  {commandAiConsultantCopilot.actionPlays.map(play => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={play.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{formatRuntimeNarrative(play.title)}</span>
                        <span className="text-[11px] text-fuchsia-100/70">{formatRuntimeOwner(play.owner)} / {play.canExecuteInternallyNow ? '本地可先准备' : '待补资料'}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/60">{formatRuntimeNarrative(play.customerOutcome)}</p>
                      <div className="mt-2 space-y-1">
                        {play.steps.slice(0, 4).map(step => (
                          <p className="text-[11px] leading-4 text-white/45" key={step}>{formatRuntimeNarrative(step)}</p>
                        ))}
                      </div>
                      <p className="mt-2 text-[11px] leading-4 text-amber-100/60">待训练: {formatRuntimeSchemaList(play.trainingNeeded.slice(0, 4), '无')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-fuchsia-100/60">账号资料: {formatRuntimeSchemaList(play.providerDependencies.slice(0, 4), '无')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">停止线: {formatRuntimeNarrative(play.stopLine)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">诊断</div>
                    <div className="mt-2 space-y-2">
                      {commandAiConsultantCopilot.diagnoses.map(item => (
                        <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                          <div className="font-mono text-xs text-white">{formatRuntimeNarrative(item.label)} / {formatRuntimeStatus(item.status)}</div>
                          <p className="mt-1 text-[11px] leading-4 text-white/50">{formatRuntimeNarrative(item.finding)}</p>
                          <p className="mt-1 text-[11px] leading-4 text-white/35">{formatRuntimeNarrative(item.nextAction)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">训练队列</div>
                    <div className="mt-2 space-y-1">
                      {commandAiConsultantCopilot.trainingQueue.slice(0, 8).map(item => (
                        <p className="text-[11px] leading-4 text-white/55" key={item.id}>
                          {formatRuntimeOwner(item.owner)}: {formatRuntimeNarrative(item.material)}
                        </p>
                      ))}
                    </div>
                    <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">运营脚本</div>
                    {commandAiConsultantCopilot.operatorScript.map(line => (
                      <p className="mt-1 text-[11px] leading-4 text-fuchsia-100/60" key={line}>{formatRuntimeNarrative(line)}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">资料解锁</div>
                    <p className="mt-2 text-xs leading-5 text-amber-100/65">
                      {formatRuntimeSchemaList(commandAiConsultantCopilot.providerUnlocks.slice(0, 12), '无')}
                    </p>
                      <p className="mt-3 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(commandAiConsultantCopilot.safetyBoundary)}</p>
                  </div>
                </div>
              </div>
            ) : null}
            {commandStoreOperatingPlan ? (
              <div className="mt-3 border border-lime-200/30 bg-lime-200/[0.06] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/70">门店经营计划</div>
                    <h4 className="mt-1 text-base font-black text-white">今日门店经营计划</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      {commandStoreOperatingPlan.restaurant} / {commandStoreOperatingPlan.offer}: 今日计划、周重点、店长晨会、员工话术、凭证看板和待补资料。
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
                      <div className="font-mono text-white">{formatRuntimeGate(commandStoreOperatingPlan.summary.canClaimAutomation, '凭证待复核', '待补凭证')}</div>
                      <p className="mt-1 text-white/55">交接复核</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  {commandStoreOperatingPlan.dayPlan.map(block => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={block.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{block.window}</span>
                        <span className="text-[11px] text-lime-100/70">{formatRuntimeOwner(block.owner)} / {formatRuntimeStatus(block.status)}</span>
                      </div>
                      <p className="mt-2 text-sm font-black text-white">{formatRuntimeNarrative(block.title)}</p>
                      <p className="mt-1 text-xs leading-5 text-white/60">{formatRuntimeNarrative(block.action)}</p>
                      <p className="mt-2 text-[11px] leading-4 text-amber-100/60">检查: {block.checklist.slice(0, 5).map(formatRuntimeNarrative).join(' / ') || '无'}</p>
                      <p className="mt-1 text-[11px] leading-4 text-lime-100/60">凭证: {formatRuntimeSchemaList(block.evidenceRequired.slice(0, 4), '无')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">待补: {formatRuntimeNarrative(block.providerGate)}</p>
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
                          <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(block.title)}</p>
                          <p className="mt-1 text-[11px] leading-4 text-white/35">{formatRuntimeNarrative(block.action)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">店长晨会</div>
                    {commandStoreOperatingPlan.managerStandup.map(line => (
                      <p className="mt-2 text-[11px] leading-4 text-lime-100/65" key={line}>{formatRuntimeNarrative(line)}</p>
                    ))}
                    <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">员工话术</div>
                    {commandStoreOperatingPlan.staffTalkTracks.map(line => (
                      <p className="mt-1 text-[11px] leading-4 text-white/55" key={line}>{formatRuntimeNarrative(line)}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">凭证与资料解锁</div>
                    <p className="mt-2 text-xs leading-5 text-white/55">
                      凭证: {commandStoreOperatingPlan.evidenceBoard.slice(0, 10).map(value => formatRuntimeEvidenceValue(value)).join(' / ') || '无'}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-amber-100/65">
                      待补资料: {formatRuntimeSchemaList(commandStoreOperatingPlan.providerUnlocks.slice(0, 10), '无')}
                    </p>
                    <p className="mt-3 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(commandStoreOperatingPlan.safetyBoundary)}</p>
                  </div>
                </div>
              </div>
            ) : null}
            {commandCustomerDemandGateway ? (
              <div className="mt-3 border border-emerald-200/30 bg-emerald-200/[0.06] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">顾客需求入口</div>
                    <h4 className="mt-1 text-base font-black text-white">顾客需求承接台</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">{formatRuntimeNarrative(commandCustomerDemandGateway.customerPromise)}</p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-4 lg:min-w-[520px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCustomerDemandGateway.summary.channels}</div>
                      <p className="mt-1 text-white/55">需求渠道</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCustomerDemandGateway.summary.internalReady}</div>
                      <p className="mt-1 text-white/55">本地可先准备</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandCustomerDemandGateway.summary.providerGated}</div>
                      <p className="mt-1 text-white/55">待补资料</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{formatRuntimeGate(commandCustomerDemandGateway.summary.canClaimAutoOrderTaking, '店长已复核', '待店长确认')}</div>
                      <p className="mt-1 text-white/55">接单能力</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {commandCustomerDemandGateway.channels.map(channel => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={channel.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{formatRuntimeNarrative(channel.name)}</span>
                        <span className="text-[11px] text-emerald-100/70">{formatRuntimeStatus(channel.status)} / {formatRuntimeOwner(channel.owner)}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/60">{channel.internalNow.slice(0, 2).map(formatRuntimeNarrative).join(' / ')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(channel.nextAction)}</p>
                      <p className="mt-2 text-[11px] leading-4 text-emerald-100/60">凭证: {formatRuntimeSchemaList(channel.evidenceRequired.slice(0, 3), '无')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">录入字段</div>
                    <div className="mt-2 space-y-2">
                      {commandCustomerDemandGateway.intakeSchema.map(field => (
                        <div className="grid gap-2 border border-white/10 bg-white/[0.04] p-2 text-xs md:grid-cols-[0.7fr_0.7fr_1.3fr]" key={field.field}>
                          <span className="font-mono text-white">{formatRuntimeSchemaLabel(field.field)}</span>
                          <span className="text-emerald-100/70">{formatRuntimeSchemaLabel(field.storage)}</span>
                          <span className="text-white/55">{formatRuntimeNarrative(field.purpose)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待补资料与员工交接</div>
                    <p className="mt-2 text-xs leading-5 text-emerald-100/65">
                      待补账号/授权/数据: {formatRuntimeSchemaList(commandCustomerDemandGateway.externalRequired.slice(0, 8), '无')}
                    </p>
                    <div className="mt-2 space-y-2">
                      {commandCustomerDemandGateway.staffHandoff.map(item => (
                        <div className="border border-white/10 bg-white/[0.04] p-2" key={`${item.owner}-${item.action}`}>
                          <div className="font-mono text-xs text-white">{formatRuntimeOwner(item.owner)}</div>
                          <p className="mt-1 text-xs leading-5 text-white/55">{formatRuntimeNarrative(item.action)}</p>
                          <p className="mt-1 text-[11px] text-white/40">凭证: {formatRuntimeEvidenceValue(item.evidenceRequired)}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(commandCustomerDemandGateway.safetyBoundary)}</p>
                  </div>
                </div>
              </div>
            ) : null}
            {commandVoiceOrderConsole ? (
              <div className="mt-3 border border-sky-200/30 bg-sky-200/[0.06] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">语音点单台</div>
                    <h4 className="mt-1 text-base font-black text-white">语音点单交接台</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      电话/点单/预约层，负责菜单问答、意图分类、订单草稿、收银/支付/配送条件和员工接管。
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
                      <div className="font-mono text-white">{formatRuntimeGate(commandVoiceOrderConsole.summary.canWriteOrdersNow, '店长已复核', '待店长确认')}</div>
                      <p className="mt-1 text-white/55">收银确认</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  {commandVoiceOrderConsole.intents.map(intent => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={intent.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{formatRuntimeNarrative(intent.label)}</span>
                        <span className="text-[11px] text-sky-100/70">{formatRuntimeStatus(intent.status)} / {formatRuntimeStatus(intent.confidence)}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/60">{formatRuntimeNarrative(intent.customerNeed)}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(intent.safeResponse)}</p>
                      <p className="mt-2 text-[11px] leading-4 text-sky-100/60">凭证: {formatRuntimeSchemaList(intent.evidenceRequired.slice(0, 3), '无')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-3 lg:col-span-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">订单草稿</div>
                    <div className="mt-2 space-y-2">
                      {commandVoiceOrderConsole.orderDrafts.map(draft => (
                        <div className="grid gap-2 border border-white/10 bg-white/[0.04] p-2 text-xs md:grid-cols-[0.5fr_0.6fr_1.4fr_1.2fr]" key={draft.id}>
                          <span className="font-mono text-white">{formatRuntimeSchemaLabel(draft.serviceMode)}</span>
                          <span className="text-sky-100/70">{formatRuntimeStatus(draft.status)}</span>
                          <span className="text-white/55">{draft.items.map(item => `${item.quantity}x ${formatRuntimeNarrative(item.name)}`).join(' / ') || formatRuntimeSchemaList(draft.missingFields, '无')}</span>
                          <span className="text-white/45">{formatRuntimeNarrative(draft.nextAction)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">菜单知识</div>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      {commandVoiceOrderConsole.menuKnowledge.map(item => (
                        <div className="border border-white/10 bg-white/[0.04] p-2" key={item.topic}>
                          <div className="font-mono text-xs text-white">{formatRuntimeNarrative(item.topic)}</div>
                          <p className="mt-1 text-xs leading-5 text-white/55">{formatRuntimeNarrative(item.answer)}</p>
                          <p className="mt-1 text-[11px] text-white/40">来源: {formatRuntimeEvidenceValue(item.sourceRequired)}</p>
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
                            <span className="font-mono text-xs text-white">{formatRuntimeNarrative(gate.label)}</span>
                            <span className="text-[11px] text-sky-100/70">{formatRuntimeStatus(gate.status)}</span>
                          </div>
                          <p className="mt-1 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(gate.nextAction)}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs leading-5 text-sky-100/65">
                      待补账号/授权/数据: {formatRuntimeSchemaList(commandVoiceOrderConsole.externalRequired.slice(0, 6), '无')}
                    </p>
                    <p className="mt-3 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(commandVoiceOrderConsole.safetyBoundary)}</p>
                  </div>
                </div>
              </div>
            ) : null}
            {commandProviderLaunchBoard ? (
              <div className="mt-3 border border-rose-200/30 bg-rose-200/[0.06] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-100/70">试跑条件板</div>
                    <h4 className="mt-1 text-base font-black text-white">试跑条件板</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      {commandProviderLaunchBoard.restaurant} / {commandProviderLaunchBoard.offer}: 语音点单、平台凭证、员工消息、预约、收银/支付/配送、经营复盘和持续试跑通道的启动条件。
                    </p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-5 lg:min-w-[620px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandProviderLaunchBoard.summary.capabilities}</div>
                      <p className="mt-1 text-white/55">能力</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandProviderLaunchBoard.summary.readyToSandbox}</div>
                      <p className="mt-1 text-white/55">样例待复核</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandProviderLaunchBoard.summary.setupRecorded}</div>
                      <p className="mt-1 text-white/55">配置已记</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{commandProviderLaunchBoard.summary.missingProvider}</div>
                      <p className="mt-1 text-white/55">待补配置</p>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="font-mono text-white">{formatRuntimeGate(commandProviderLaunchBoard.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                      <p className="mt-1 text-white/55">交接复核</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  {commandProviderLaunchBoard.capabilities.map(capability => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={capability.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{formatRuntimeNarrative(capability.name)}</span>
                        <span className="text-[11px] text-rose-100/70">{formatRuntimeStatus(capability.status)}</span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-white/60">{formatRuntimeNarrative(capability.customerPromise)}</p>
                      <p className="mt-2 text-[11px] leading-4 text-white/45">现在能做: {capability.canDoInternallyNow.slice(0, 3).map(formatRuntimeNarrative).join(' / ')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-rose-100/60">启动步骤: {formatRuntimeNarrative(capability.launchStep)}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">停止线: {formatRuntimeNarrative(capability.stopLine)}</p>
                      {capability.providerKeysNeeded.length || capability.merchantApprovalsNeeded.length || capability.dataContractsNeeded.length ? (
                        <p className="mt-2 text-[11px] leading-4 text-amber-100/60">
                          还缺: {formatRuntimeSchemaList([...capability.providerKeysNeeded, ...capability.merchantApprovalsNeeded, ...capability.dataContractsNeeded].slice(0, 5), '资料可复核')}
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
                          <div className="font-mono text-xs text-white">{formatRuntimeOwner(item.owner)} / {formatRuntimeSchemaLabel(item.capabilityId)}</div>
                          <p className="mt-1 text-[11px] leading-4 text-white/50">{formatRuntimeNarrative(item.action)}</p>
                          <p className="mt-1 text-[11px] leading-4 text-white/35">{formatRuntimeEvidenceValue(item.evidenceRequired)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">资料清单</div>
                    <p className="mt-2 text-xs leading-5 text-amber-100/65">
                      {formatRuntimeSchemaList(commandProviderLaunchBoard.providerKeyChecklist.slice(0, 12), '只做本地试跑时不需要平台账号配置。')}
                    </p>
                    <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待补账号资料</div>
                    <p className="mt-2 text-xs leading-5 text-white/55">
                      {formatRuntimeSchemaList(commandProviderLaunchBoard.externalRequired.slice(0, 12))}
                    </p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">边界</div>
                    <p className="mt-2 text-xs leading-5 text-white/55">{formatRuntimeNarrative(commandProviderLaunchBoard.safetyBoundary)}</p>
                  </div>
                </div>
              </div>
            ) : null}
            {commandMerchantActivationPacket ? (
              <div className="mt-3 border border-amber-200/30 bg-amber-200/[0.06] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">门店激活包</div>
                    <h4 className="mt-1 text-base font-black text-white">{formatRuntimeStatus(commandMerchantActivationPacket.verdict)}</h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      {commandMerchantActivationPacket.restaurant} / {commandMerchantActivationPacket.offer}: 待店长复核的落地请求，说明还缺哪些账号配置、门店授权、经营数据规则和试跑复核。
                    </p>
                    <p className="mt-2 text-[11px] leading-4 text-amber-100/70">{formatRuntimeNarrative(commandMerchantActivationPacket.nextAskForUser)}</p>
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
                      <div className="font-mono text-white">{formatRuntimeGate(commandMerchantActivationPacket.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                      <p className="mt-1 text-white/55">边界</p>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {commandMerchantActivationPacket.sections.slice(0, 6).map(section => (
                    <div className="border border-white/10 bg-white/[0.05] p-3" key={section.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-xs text-white">{formatRuntimeNarrative(section.title)}</span>
                        <span className="text-[11px] text-amber-100/70">{formatRuntimeStatus(section.status)}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-white/45">负责人: {formatRuntimeOwner(section.owner)}</p>
                      <div className="mt-2 space-y-2">
                        {section.requestedItems.slice(0, 3).map(item => (
                          <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                            <div className="text-[11px] font-black text-white">{formatRuntimeNarrative(item.label)}</div>
                            <p className="mt-1 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(item.safeInstruction)}</p>
                            <p className="mt-1 text-[11px] leading-4 text-amber-100/55">凭证: {formatRuntimeEvidenceValue(item.evidenceRequired)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">账号配置项</div>
                    <p className="mt-2 text-xs leading-5 text-amber-100/65">{formatSetupItemCount(commandMerchantActivationPacket.providerKeyChecklist.slice(0, 12), '资料可复核')}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">样例复核</div>
                    <p className="mt-2 text-xs leading-5 text-white/55">
                      {commandMerchantActivationPacket.sandboxAcceptancePlan.slice(0, 3).map(item => `${formatRuntimeSchemaLabel(item.capabilityId)}: ${formatRuntimeNarrative(item.action)}`).join(' / ')}
                    </p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-3">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">不要发送</div>
                    <p className="mt-2 text-xs leading-5 text-white/55">{commandMerchantActivationPacket.doNotSend.slice(0, 4).map(formatRuntimeNarrative).join(' / ')}</p>
                  </div>
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/40">{formatRuntimeNarrative(commandMerchantActivationPacket.safetyBoundary)}</p>
              </div>
            ) : null}
          </div>
          <div className="mt-4 border border-amber-200/25 bg-amber-200/[0.05] p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">试跑路径判断</div>
                <h4 className="mt-1 text-base font-black text-white">{formatRuntimeNarrative(commandBenchmarkStrategy.recommendation)}</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">{formatRuntimeNarrative(commandBenchmarkStrategy.summary)}</p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-3 xl:min-w-[420px]">
                {commandBenchmarkStrategy.candidates.map(candidate => (
                  <div className="border border-white/10 bg-white/[0.05] p-2" key={candidate.id}>
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">{formatRuntimeNarrative(candidate.role)}</div>
                    <div className="mt-1 font-black text-white">{candidate.fitScore}</div>
                    <div className="mt-1 truncate text-white/50" title={formatRuntimeNarrative(candidate.name)}>{formatRuntimeNarrative(candidate.name)}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-3">
              {commandBenchmarkStrategy.nextBuildOrder.map(item => (
                <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                  <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-amber-100/70">{formatRuntimeSchemaLabel(item.source)}</div>
                  <p className="mt-1 text-xs font-black text-white">{formatRuntimeNarrative(item.title)}</p>
                  <p className="mt-1 text-[11px] leading-4 text-white/45">待补条件: {formatRuntimeNarrative(item.externalGate)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 border border-orange-200/30 bg-orange-200/[0.06] p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-100/70">打法总览台</div>
                <h4 className="mt-1 text-base font-black text-white">本地可先准备、训练材料与待补资料</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  {commandActivationCockpit?.answerForCustomer || '生成打法总览，告诉客户哪些门店任务今天可本地试跑，哪些需要训练材料，哪些要等账号或门店授权。'}
                </p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-4 xl:min-w-[520px]">
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">可先准备</div>
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
                    <span className="truncate text-[10px] text-white/35" title={formatRuntimeNarrative(lane.competitorEquivalent)}>{formatRuntimeNarrative(lane.competitorEquivalent)}</span>
                  </div>
                  <p className="mt-1 text-xs font-black text-white">{formatRuntimeLabel(lane.title)}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(lane.nextAction)}</p>
                </div>
              ))}
            </div>
            <button
              className="mt-3 border border-orange-200/60 px-3 py-2 text-xs font-black text-orange-100 transition hover:bg-orange-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildActivationCockpit}
              type="button"
            >
              生成打法总览
            </button>
          </div>
          <div className="mt-4 border border-violet-200/30 bg-violet-200/[0.06] p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/70">经营边界报告</div>
                <h4 className="mt-1 text-base font-black text-white">一份报告看清对标、凭证和资料卡点</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  {commandAiOsAuditReport
                    ? `经营边界报告：${formatRuntimeStatus(commandAiOsAuditReport.verdict)}。汇总试跑操作台、连接条件、公开资料和经营洞察。`
                    : '当客户问今天到底能做什么、还缺什么资料、哪些不能承诺时，生成一份边界报告。'}
                </p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">可复核</div>
                  <div className="mt-1 font-mono text-white">{commandAiOsAuditReport?.summary.usableNow ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">人工</div>
                  <div className="mt-1 font-mono text-white">{commandAiOsAuditReport?.summary.manualReady ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">待补资料</div>
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
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(lane.nextAction)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">高频动作</div>
                    {commandAiOsAuditReport.topActions.map(action => (
                      <p className="mt-1 text-[11px] leading-4 text-white/60" key={`${action.owner}-${action.action}`}>{formatRuntimeOwner(action.owner)}: {formatRuntimeNarrative(action.action)}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">待补账号资料</div>
                    {(commandAiOsAuditReport.externalRequired.length ? commandAiOsAuditReport.externalRequired : ['检查未发现额外的账号资料卡点。']).slice(0, 6).map(item => (
                      <p className="mt-1 text-[11px] leading-4 text-white/60" key={item}>{formatRuntimeNarrative(item)}</p>
                    ))}
                  </div>
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(commandAiOsAuditReport.safetyBoundary)}</p>
              </>
            ) : null}
            <button
              className="mt-3 border border-violet-200/60 px-3 py-2 text-xs font-black text-violet-100 transition hover:bg-violet-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectAiOsAuditReport}
              type="button"
            >
              生成边界报告
            </button>
          </div>
          <div className="mt-4 border border-cyan-200/30 bg-cyan-200/[0.06] p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/70">门店工单台</div>
                <h4 className="mt-1 text-base font-black text-white">选一个门店任务，拿一个待复核任务包</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  把门店打法素材变成这家店可先准备的本地任务、训练请求和资料解锁任务，让老板看到的不是工具清单，而是今天能交给店长推进的工单。
                </p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-5 xl:min-w-[620px]">
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">模式</div>
                  <div className="mt-1 truncate font-mono text-white" title={formatRuntimeStatus(commandClawSkillWorkbench?.mode || 'not-built')}>{formatRuntimeStatus(commandClawSkillWorkbench?.mode || 'not-built')}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">可先准备</div>
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
                    <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-cyan-100/70">{formatRuntimeStatus(item.status)}</span>
                    <span className="text-[10px] text-white/35">{formatRuntimeOwner(item.owner)}</span>
                  </div>
                  <p className="mt-1 text-xs font-black text-white">{formatRuntimeNarrative(item.title)}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/45">{formatRuntimeEvidenceValue(item.acceptance)}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-3">
              {(commandClawSkillWorkbench?.selectedModules || []).slice(0, 6).map(module => (
                <div className="border border-white/10 bg-white/[0.04] p-2" key={module.id}>
                  <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-cyan-100/70">{formatRuntimeOwner(module.owner)}</div>
                  <p className="mt-1 text-xs font-black text-white">{formatRuntimeNarrative(module.name)}</p>
                  <p className="mt-1 text-[11px] leading-4 text-white/45">可先准备 {module.runnableSkills} 项 / 待补资料 {module.blockedSkills} 项</p>
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
                    <div className="text-xs font-black text-white">{formatRuntimeNarrative(preset.label)}</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(preset.description)}</p>
                    <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.12em] text-cyan-100/60">
                      {preset.moduleIds.length} 类工单
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
                    {formatRuntimeNarrative(commandClawSkillExecutionLedger?.nextAction || '打开门店工单，先生成第一份可记忆的执行包。')}
                  </p>
                </div>
                <div className="grid gap-2 text-xs sm:grid-cols-4 lg:min-w-[420px]">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">记录</div>
                    <div className="mt-1 font-mono text-white">{commandClawSkillExecutionLedger?.summary.total ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">资料可复核</div>
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
                      <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-cyan-100/70">{formatRuntimeStatus(record.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/45">
                      可先准备 {record.runnableNow} 项 / 待训练 {record.trainingNeeded} 项 / 待补资料 {record.providerGated} 项 · 负责人 {record.owners.map(formatRuntimeOwner).join(', ')}
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
              打开门店工单
            </button>
          </div>
          <div className="mt-4 border border-emerald-200/30 bg-emerald-200/[0.06] p-3">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">公开情报简报</div>
                <h4 className="mt-1 text-base font-black text-white">门店事实、本地平台、素材缺口</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  把公开门店资料或店长提供的文字转成点评/美团、小红书、抖音、微信社群和位置场景的分渠道任务。公开资料只用来启动本地试跑，对外发布、线索承接、核销和经营复盘仍要补条件。
                </p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-4 xl:min-w-[560px]">
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">可复核字段</div>
                  <div className="mt-1 font-mono text-white">{commandPublicIntelligenceBrief?.readiness.usableFields ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">本地动作</div>
                  <div className="mt-1 font-mono text-white">{commandPublicIntelligenceBrief?.readiness.internalActions ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">账号资料</div>
                  <div className="mt-1 font-mono text-white">{commandPublicIntelligenceBrief?.readiness.externalGates ?? commandProviderGates}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">试跑状态</div>
                  <div className="mt-1 font-mono text-white">{formatRuntimeGate(commandPublicIntelligenceBrief?.readiness.canStartTrial, '样例可先准备', '待补资料')}</div>
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-5">
              {(commandPublicIntelligenceBrief?.platformProfiles || []).map(item => (
                <div className="border border-white/10 bg-white/[0.04] p-2" key={item.platform}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-emerald-100/70">{formatRuntimeSchemaLabel(item.platform)}</span>
                    <span className="text-[10px] text-white/35">{formatRuntimeGate(item.usableNow, '可先准备', '待补资料')}</span>
                  </div>
                  <p className="mt-1 line-clamp-3 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(item.nextAction)}</p>
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
                  给客户看的补资料清单：哪些资料能解锁试跑交接、谁负责、要什么凭证、哪些仍缺。账号配置值只留在服务端，页面只展示配置待复核/待补状态。
                </p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-4 xl:min-w-[560px]">
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] tracking-[0.12em] text-white/35">资料齐备度</div>
                  <div className="mt-1 font-mono text-white">{commandProviderSetupWizard?.summary.completionPercent ?? 0}%</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] tracking-[0.12em] text-white/35">待复核</div>
                  <div className="mt-1 font-mono text-white">{commandProviderSetupWizard?.summary.configured ?? 0}/{commandProviderSetupWizard?.summary.fields ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] tracking-[0.12em] text-white/35">待补</div>
                  <div className="mt-1 font-mono text-white">{commandProviderSetupWizard?.summary.missing ?? commandProviderGates}</div>
                </div>
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] tracking-[0.12em] text-white/35">试跑交接</div>
                  <div className="mt-1 font-mono text-white">{formatRuntimeGate(commandProviderSetupWizard?.summary.canEnableExternalAutomation, '凭证待复核', '待补凭证')}</div>
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-4">
              <div className="border border-white/10 bg-white/[0.04] p-2">
                <div className="text-[10px] tracking-[0.12em] text-white/35">待复核记录</div>
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
                <div className="text-[10px] font-semibold tracking-[0.14em] text-fuchsia-100/70">账号和资料复核</div>
                  <p className="mt-1 max-w-3xl text-xs leading-5 text-white/55">
                    区分“已经记录的资料”和“可以进入复核的资料”。账号、回执、门店授权和经营数据都确认前，不把试跑交接当成已具备条件。
                  </p>
                </div>
                <div className="grid gap-2 text-xs sm:grid-cols-5 lg:min-w-[560px]">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] tracking-[0.12em] text-white/35">分数</div>
                    <div className="mt-1 font-mono text-white">{commandProviderReadinessHealth?.summary.readinessScore ?? 0}%</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] tracking-[0.12em] text-white/35">可复核</div>
                    <div className="mt-1 font-mono text-white">{commandProviderReadinessHealth?.summary.healthReady ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] tracking-[0.12em] text-white/35">已保存待检查</div>
                    <div className="mt-1 font-mono text-white">{commandProviderReadinessHealth?.summary.rememberedNotProbed ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] tracking-[0.12em] text-white/35">不可达</div>
                    <div className="mt-1 font-mono text-white">{commandProviderReadinessHealth?.summary.configuredButUnreachable ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-[10px] tracking-[0.12em] text-white/35">试跑交接</div>
                    <div className="mt-1 font-mono text-white">{formatRuntimeGate(commandProviderReadinessHealth?.summary.canEnableExternalAutomation, '凭证待复核', '待补凭证')}</div>
                  </div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(commandProviderReadinessHealth?.items || []).slice(0, 6).map(item => (
                  <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-fuchsia-100/70">{formatRuntimeStatus(item.status)}</span>
                      <span className="text-[10px] text-white/35">{formatRuntimeSchemaLabel(item.category)}</span>
                    </div>
                    <p className="mt-1 text-xs font-black text-white">{formatRuntimeNarrative(item.label)}</p>
                    <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(item.nextAction)}</p>
                  </div>
                ))}
              </div>
              <button
                className="mt-3 border border-fuchsia-200/60 px-3 py-2 text-xs font-black text-fuchsia-100 transition hover:bg-fuchsia-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={dispatchState.status === 'loading'}
                onClick={inspectProviderReadinessHealth}
                type="button"
              >
                检查账号资料条件
              </button>
            </div>
            {commandProviderUnlockLadder ? (
              <div className="mt-3 border border-cyan-200/25 bg-cyan-200/[0.05] p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold tracking-[0.14em] text-cyan-100/70">试跑解锁阶梯</div>
                    <p className="mt-1 max-w-3xl text-xs leading-5 text-white/55">
                      展示哪些动作只能本地先做、哪些资料待复核、哪些要等凭证待复核后才可做。已保存资料不等于试跑交接待复核。
                    </p>
                  </div>
                  <div className="grid gap-2 text-xs sm:grid-cols-5 lg:min-w-[560px]">
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] tracking-[0.12em] text-white/35">能力项</div>
                      <div className="mt-1 font-mono text-white">{commandProviderUnlockLadder.summary.capabilities}</div>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] tracking-[0.12em] text-white/35">可复核</div>
                      <div className="mt-1 font-mono text-white">{commandProviderUnlockLadder.summary.providerHealthReady}</div>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] tracking-[0.12em] text-white/35">待复核记录</div>
                      <div className="mt-1 font-mono text-white">{commandProviderUnlockLadder.summary.setupEvidenceSigned}</div>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] tracking-[0.12em] text-white/35">待补条件</div>
                      <div className="mt-1 font-mono text-white">{commandProviderUnlockLadder.summary.externalBlocked}</div>
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2">
                      <div className="text-[10px] tracking-[0.12em] text-white/35">交接承诺</div>
                      <div className="mt-1 font-mono text-white">{formatRuntimeGate(commandProviderUnlockLadder.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {commandProviderUnlockLadder.items.map(item => (
                    <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-cyan-100/70">{formatRuntimeStatus(item.stage)}</span>
                        <span className="text-[10px] text-white/35">{item.setupEvidence.length ? '待复核记录' : '待补记录'}</span>
                      </div>
                      <p className="mt-1 text-xs font-black text-white">{formatRuntimeNarrative(item.label)}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(item.nextAction)}</p>
                      <p className="mt-1 truncate text-[11px] text-white/35" title={formatRuntimeSchemaList(item.stillNeeds, '无')}>
                        还缺：{formatRuntimeSchemaList(item.stillNeeds, '无')}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.05] p-2 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(commandProviderUnlockLadder.safetyBoundary)}</p>
              </div>
            ) : null}
            <div className="mt-3 grid gap-2 lg:grid-cols-5">
              {(commandProviderSetupWizard?.sections || []).map(section => (
                <div className="border border-white/10 bg-white/[0.04] p-2" key={section.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-fuchsia-100/70">{formatRuntimeStatus(section.status)}</span>
                    <span className="text-[10px] text-white/35">{formatRuntimeOwner(section.owner)}</span>
                  </div>
                  <p className="mt-1 text-xs font-black text-white">{formatRuntimeNarrative(section.title)}</p>
                  <p className="mt-1 text-[11px] leading-4 text-white/45">{section.fields.filter(field => field.status === 'configured').length}/{section.fields.length} 待复核</p>
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
              生成补资料申请
            </button>
            {dispatchState.externalUnlockRequestPack ? (
              <div className="mt-3 border border-amber-200/25 bg-amber-200/[0.06] p-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">试跑解锁申请包</div>
                    <h4 className="mt-1 text-base font-black text-white">
                      补资料申请包
                    </h4>
                    <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                      {dispatchState.externalUnlockRequestPack.restaurant} / {dispatchState.externalUnlockRequestPack.offer}: 明确列出账号配置、门店授权、员工通道、回执凭证和收银汇总数据规则。
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
                      <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">试跑交接</div>
                      <div className="mt-1 font-mono text-white">{formatRuntimeGate(dispatchState.externalUnlockRequestPack.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                    </div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-[1.1fr_1fr_1fr]">
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">签收交付包</div>
                    <p className="mt-1 text-white/60">
                      签收项 {dispatchState.externalUnlockRequestPack.signoffChecklist.length} 个 / 负责人交接 {dispatchState.externalUnlockRequestPack.ownerHandoff.length} 个
                    </p>
                    <p className="mt-1 text-white/45">{formatRuntimeNarrative(dispatchState.externalUnlockRequestPack.acceptanceReceiptTemplate.title)}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">复核字段</div>
                    <p className="mt-1 text-white/60">
                      {formatRuntimeSchemaList(dispatchState.externalUnlockRequestPack.acceptanceReceiptTemplate.requiredFields.slice(0, 5), '无')}
                    </p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">导出摘要</div>
                    <p className="mt-1 text-white/60">
                      文本摘要 {dispatchState.externalUnlockRequestPack.exportDigest.markdown.length} 字符 / 表格 {dispatchState.externalUnlockRequestPack.exportDigest.csv.split('\n').length - 1} 行
                    </p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {dispatchState.externalUnlockRequestPack.requests.slice(0, 6).map(item => (
                    <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-amber-100/70">{formatRuntimeStatus(item.priority)} / {formatRuntimeSchemaLabel(item.category)}</span>
                        <span className="text-[10px] text-white/35">{formatRuntimeOwner(item.owner)}</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-white">{formatRuntimeNarrative(item.ask)}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/40">凭证: {formatRuntimeEvidenceValue(item.evidenceRequired)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">服务端配置项</div>
                    {dispatchState.externalUnlockRequestPack.providerEnvKeys.slice(0, 6).map(item => (
                      <p className="mt-1 text-white/60" key={item.key}>{formatRuntimeSchemaLabel(item.key)}: {formatRuntimeNarrative(item.placeholder)}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">店长授权</div>
                    {dispatchState.externalUnlockRequestPack.merchantAuthorizationPacket.slice(0, 4).map(item => (
                      <p className="mt-1 text-white/60" key={`${item.capability}-${item.proof}`}>{formatRuntimeSchemaLabel(item.capability)}: {formatRuntimeNarrative(item.ask)}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-white/45">经营数据包</div>
                    {dispatchState.externalUnlockRequestPack.operatingDataPacket.slice(0, 5).map(item => (
                      <p className="mt-1 text-white/60" key={item.field}>{formatRuntimeSchemaLabel(item.field)}: {formatRuntimeEvidenceValue(item.evidenceRequired)}</p>
                    ))}
                  </div>
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.05] p-2 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(dispatchState.externalUnlockRequestPack.safetyBoundary)}</p>
              </div>
            ) : null}
          </div>
          <div className="mt-4 border border-emerald-200/30 bg-emerald-200/[0.06] p-3">
            {commandAiEmployeeInbox ? (
              <>
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">员工收件箱</div>
                  <h4 className="mt-1 text-base font-black text-white">{formatRuntimeNarrative(commandAiEmployeeInbox.employee.name)} · {formatRuntimeStatus(commandAiEmployeeInbox.employee.status)}</h4>
                  <p className="mt-1 text-xs leading-5 text-white/55">
                    员工收件箱 / 消息 {commandAiEmployeeInbox.summary.messages} 条 / 待补账号/授权/数据 {commandAiEmployeeInbox.summary.waitingExternal} 项
                  </p>
                </div>
                <div className="grid gap-2 text-xs sm:grid-cols-3 xl:min-w-[520px]">
                  {commandAiEmployeeInbox.memory.slice(0, 3).map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={item.id}>
                      <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">{formatRuntimeNarrative(item.label)}</div>
                      <div className="mt-1 truncate font-black text-white" title={formatRuntimeNarrative(item.value)}>{formatRuntimeNarrative(item.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-2">
                {commandAiEmployeeInbox.messages.slice(0, 2).map(message => (
                  <div className="border border-white/10 bg-white/[0.05] p-3" key={message.id}>
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.12em] text-emerald-100/70">
                      <span>{formatRuntimeStatus(message.priority)}</span>
                      <span>{formatRuntimeSchemaLabel(message.lane)}</span>
                      <span>{formatRuntimeOwner(message.owner)}</span>
                    </div>
                    <p className="mt-2 text-sm font-black text-white">{formatRuntimeNarrative(message.title)}</p>
                    <p className="mt-1 text-xs leading-5 text-white/55">{formatRuntimeNarrative(message.body)}</p>
                    <p className="mt-2 text-[11px] leading-4 text-white/40">凭证: {formatRuntimeEvidenceValue(message.evidenceRequired)}</p>
                  </div>
                ))}
              </div>
              </>
            ) : (
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">员工收件箱</div>
                  <h4 className="mt-1 text-base font-black text-white">Wenai 门店操作员 · 等待首次刷新</h4>
                  <p className="mt-1 text-xs leading-5 text-white/55">
                    刷新中心后会把主动作、店长任务、账号资料门禁和通知复核整理成主动消息。
                  </p>
                </div>
                <button
                  className="shrink-0 border border-emerald-200/60 px-3 py-2 text-sm font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={dispatchState.status === 'loading'}
                  onClick={refreshCommandCenter}
                  type="button"
                >
                  刷新收件箱
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
                    ? `员工通道清单：${commandChannelHub.summary.channels} 个通道，${commandChannelHub.summary.scheduledJobs} 个排程任务，${commandChannelHub.summary.missingExternalItems} 个待补账号/授权/数据。`
                    : '生成员工通道清单，把微信社群、企微、飞书、钉钉、短信和每日门店排班拆成可审核任务，不假装已经能外发。'}
                </p>
              </div>
              <div className="grid gap-2 text-xs sm:grid-cols-4 xl:min-w-[520px]">
                <div className="border border-white/10 bg-white/[0.05] p-2">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">可先触达渠道</div>
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
                  <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">待补条目</div>
                  <div className="mt-1 font-mono text-white">{commandChannelHub?.summary.missingExternalItems ?? commandProviderGates}</div>
                </div>
              </div>
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-3">
              {(commandChannelHub?.scheduledJobs || []).slice(0, 3).map(job => (
                <div className="border border-white/10 bg-white/[0.04] p-2" key={job.id}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-sky-100/70">{formatRuntimeStatus(job.status)}</span>
                    <span className="text-[10px] text-white/35">{formatRuntimeStatus(job.cadence)}</span>
                  </div>
                  <p className="mt-1 text-xs font-black text-white">{formatRuntimeNarrative(job.title)}</p>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(job.action)}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-2 lg:grid-cols-3">
              {(commandChannelHub?.commandSuggestions || []).map(item => (
                <div className="border border-white/10 bg-white/[0.04] p-2" key={item.routeTo}>
                  <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-sky-100/70">{formatRuntimeActionLabel(item.routeTo)}</div>
                  <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(item.command)}</p>
                </div>
              ))}
            </div>
            {commandChannelDeliveryAttempt ? (
              <div className="mt-3 border border-white/10 bg-white/[0.04] p-3">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.12em] text-sky-100/70">
                  <span>送达尝试</span>
                  <span>{formatRuntimeStatus(commandChannelDeliveryAttempt.status)}</span>
                  <span>{formatRuntimeNarrative(commandChannelDeliveryAttempt.provider)}</span>
                  <span>台账 {commandChannelDeliveryReport?.summary.total ?? 0} 条</span>
                </div>
                <p className="mt-2 text-sm font-black text-white">{formatRuntimeNarrative(commandChannelDeliveryAttempt.subject)}</p>
                <p className="mt-1 text-xs leading-5 text-white/50">{formatRuntimeNarrative(commandChannelDeliveryAttempt.nextAction)}</p>
                <p className="mt-1 text-[11px] leading-4 text-white/35">
                  还缺: {formatRuntimeSchemaList(commandChannelDeliveryAttempt.missing, '无')} · 凭证: {formatRuntimeEvidenceValue(commandChannelDeliveryAttempt.providerEvidence)}
                </p>
              </div>
            ) : null}
            {commandChannelScheduleRun ? (
              <div className="mt-3 border border-white/10 bg-white/[0.04] p-3">
                <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono uppercase tracking-[0.12em] text-sky-100/70">
                  <span>排程运行</span>
                  <span>{formatRuntimeStatus(commandChannelScheduleRun.acceptance.verdict)}</span>
                  <span>尝试 {commandChannelScheduleRun.summary.attempted}</span>
                  <span>待补资料 {commandChannelScheduleRun.summary.blocked}</span>
                  <span>建议恢复 {commandChannelScheduleRun.summary.retryRecommended}</span>
                </div>
                <div className="mt-2 grid gap-2 text-xs lg:grid-cols-4">
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">员工排班</div>
                    <div className="mt-1 font-mono text-white">{commandChannelScheduleRun.acceptance.canRunStaffSchedule ? '已运行' : '等待'}</div>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-[10px] uppercase tracking-[0.12em] text-white/35">本地可先准备</div>
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
                      <span>{formatRuntimeStatus(item.status)}</span>
                      <span>{formatRuntimeNarrative(item.channel)} / {formatRuntimeStatus(item.providerMode)}</span>
                    </div>
                    <p className="mt-1 text-xs font-black text-white">{formatRuntimeNarrative(item.title)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/45">上次运行: {item.lastRunAt || '未运行'} / 下次运行: {item.nextRunAt}</p>
                    <p className="mt-1 text-[10px] leading-4 text-white/35">耗时: {item.durationMs ?? '无'}ms / 待补条件: {formatRuntimeNarrative(item.externalGate)} / 凭证: {formatRuntimeSchemaList(item.evidenceRequired.slice(0, 2), '无')}</p>
                  </div>
                ))}
                </div>
                <div className="mt-2 grid gap-2 lg:grid-cols-2">
                  {commandChannelScheduleRun.operatorTimeline.slice(0, 2).map(item => (
                    <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                      <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-white/35">{formatRuntimeStatus(item.status)} / {formatRuntimeOwner(item.owner)}</div>
                      <p className="mt-1 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(item.signal)}</p>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(item.nextAction)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/45">
                  {formatRuntimeSchemaList(commandChannelScheduleRun.acceptance.operatorCloseout, '无')}
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
              <p className="mt-1 text-sm leading-6 text-white">{formatRuntimeNarrative(commandNextAction)}</p>
              <p className="mt-2 text-xs leading-5 text-white/50">{formatRuntimeNarrative(commandEvidence)}</p>
            </div>
            <div className="border border-teal-200/30 bg-teal-200/[0.06] p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-100/70">今日店长任务</div>
                  <p className="mt-1 text-sm font-black text-white">
                    {commandFollowupSummary
                      ? `今日 ${commandFollowupSummary.today} 项 / 待补条件 ${commandFollowupSummary.blocked} 项`
                      : '等待回执复核'}
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
                  起草通知
                </button>
                <button
                  className="shrink-0 border border-emerald-200/60 px-2 py-1 text-xs font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={dispatchState.status === 'loading'}
                  onClick={buildStaffNotificationDeliveryBridge}
                  type="button"
                >
                  投递通道
                </button>
                <button
                  className="shrink-0 border border-fuchsia-200/60 px-2 py-1 text-xs font-black text-fuchsia-100 transition hover:bg-fuchsia-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={dispatchState.status === 'loading'}
                  onClick={buildTaskProviderHandoff}
                  type="button"
                >
                  试跑交接
                </button>
                <button
                  className="shrink-0 border border-lime-200/60 px-2 py-1 text-xs font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={dispatchState.status === 'loading'}
                  onClick={buildFirstForwardableRunPack}
                  type="button"
                >
                  首轮交接复核
                </button>
                <button
                  className="shrink-0 border border-orange-200/60 px-2 py-1 text-xs font-black text-orange-100 transition hover:bg-orange-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={dispatchState.status === 'loading'}
                  onClick={buildFirstRunControlTower}
                  type="button"
                >
                  首跑指挥台
                </button>
                <button
                  className="shrink-0 border border-cyan-200/60 px-2 py-1 text-xs font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={dispatchState.status === 'loading'}
                  onClick={buildNextLoopChannelPlan}
                  type="button"
                >
                  生成下一轮计划
                </button>
              </div>
              <div className="mt-3 space-y-2">
                {(commandTaskQueue?.tasks.length ? commandTaskQueue.tasks : commandFollowupTasks).slice(0, 2).map(task => (
                  <div className="border border-white/10 bg-white/[0.05] p-2" key={task.id}>
                    <div className="flex flex-wrap gap-2 text-[11px] font-mono text-teal-100/80">
                      <span>{formatRuntimeOwner(task.owner)}</span>
                      <span>{formatRuntimeStatus(task.priority)}</span>
                      {'status' in task && typeof task.status === 'string' ? <span>{formatRuntimeStatus(task.status)}</span> : null}
                      <span>{formatRuntimeSchemaLabel(task.signal)}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-white">{formatRuntimeNarrative(task.action)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/45">凭证: {formatRuntimeEvidenceValue(task.evidenceRequired)}</p>
                    {'externalRequired' in task && Array.isArray(task.externalRequired) && task.externalRequired.length ? (
                      <p className="mt-1 text-[11px] leading-4 text-amber-100/55">待补账号/授权/数据: {formatRuntimeSchemaList(task.externalRequired.slice(0, 2), '无')}</p>
                    ) : null}
                    {'taskMemoryId' in task && typeof task.taskMemoryId === 'string' && 'status' in task && task.status !== 'done' ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          className="border border-amber-200/40 px-2 py-1 text-[11px] font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={() => updateStoreManagerTask(String(task.taskMemoryId), 'needs-evidence', '收尾或交接试跑之前，负责人必须附上待复核凭证。')}
                          type="button"
                        >
                          标记待补凭证
                        </button>
                        <button
                          className="border border-sky-200/40 px-2 py-1 text-[11px] font-black text-sky-100 transition hover:bg-sky-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={() => updateStoreManagerTask(String(task.taskMemoryId), 'ready-for-provider', '负责人已复核本地凭证，对外转发前由通道管理员核验账号资料条件。')}
                          type="button"
                        >
                          记录待交接
                        </button>
                        <button
                          className="border border-rose-200/40 px-2 py-1 text-[11px] font-black text-rose-100 transition hover:bg-rose-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={() => updateStoreManagerTask(String(task.taskMemoryId), 'blocked', '店长授权、公开凭证、签名回执或脱敏汇总数据补齐之前保持暂停。')}
                          type="button"
                        >
                          暂停
                        </button>
                        <button
                          className="border border-white/20 px-2 py-1 text-[11px] font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={() => updateStoreManagerTask(String(task.taskMemoryId), 'done', '负责人复核凭证和停止线后，从试跑指挥台关闭。')}
                          type="button"
                        >
                          记录回执复核
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))}
                {!commandFollowupTasks.length ? (
                  <p className="text-xs leading-5 text-white/55">
                    先跑一次受控试跑或导入待复核的公开凭证，平台触达、核销和门店收银后台操作在授权配齐前保持关闭。
                  </p>
                ) : null}
                {commandTaskQueue ? (
                  <p className="border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-white/45">
                    任务记忆: 待处理 {commandTaskQueue.summary.open} / 待补凭证 {commandTaskQueue.summary.needsEvidence} / 待补资料 {commandTaskQueue.summary.readyForProvider} / 待补条件 {commandTaskQueue.summary.blocked}
                  </p>
                ) : null}
                {commandTaskWatcher ? (
                  <div className="border border-amber-200/25 bg-amber-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">回执和跟进检查</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      回执和跟进检查 / 提醒 {commandTaskWatcher.summary.wakeups} 次 / 高优先级 {commandTaskWatcher.summary.highPriority} 项
                    </p>
                    {commandTaskWatcher.wakeups.slice(0, 1).map(wakeup => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={wakeup.id}>
                        {formatRuntimeStatus(wakeup.priority)}: {formatRuntimeNarrative(wakeup.nextAction)}
                      </p>
                    ))}
                  </div>
                ) : null}
                {commandStaffNotificationHandoff ? (
                  <div className="border border-sky-200/25 bg-sky-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">通知交接</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      员工通知交接 / 草稿 {commandStaffNotificationHandoff.summary.drafts} 份 / 待补资料 {commandStaffNotificationHandoff.summary.providerRequired} 项
                    </p>
                    {commandStaffNotificationHandoff.drafts.slice(0, 1).map(draft => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={draft.id}>
                        {formatRuntimeNarrative(draft.channel)}: {formatRuntimeNarrative(draft.subject)}
                      </p>
                    ))}
                  </div>
                ) : null}
                {commandStaffNotificationDeliveryBridge ? (
                  <div className="border border-emerald-200/25 bg-emerald-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">投递通道</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      通知投递通道 / 可送达 {commandStaffNotificationDeliveryBridge.summary.providerReady} / 待补条件 {commandStaffNotificationDeliveryBridge.summary.blocked}
                    </p>
                    {commandStaffNotificationDeliveryBridge.items.slice(0, 1).map(item => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={item.id}>
                        {formatRuntimeStatus(item.status)}: {formatRuntimeNarrative(item.nextAction)}
                      </p>
                    ))}
                  </div>
                ) : null}
                {commandStaffNotificationAuditLog ? (
                  <div className="border border-violet-200/25 bg-violet-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/70">通知复核</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      通知复核台账 / 总数 {commandStaffNotificationAuditLog.summary.total} / 待补条件 {commandStaffNotificationAuditLog.summary.blocked}
                    </p>
                    {commandStaffNotificationAuditLog.latest.slice(0, 1).map(event => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={event.auditId}>
                        {formatRuntimeSchemaLabel(event.eventType)}: {formatRuntimeNarrative(event.nextAction)}
                      </p>
                    ))}
                  </div>
                ) : null}
                {commandTaskProviderHandoff ? (
                  <div className="border border-fuchsia-200/25 bg-fuchsia-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/70">试跑交接</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      任务交接资料 / 资料包 {commandTaskProviderHandoff.summary.packages} / 待复核 {commandTaskProviderHandoff.summary.forwardable} / 待补资料 {commandTaskProviderHandoff.summary.blocked}
                    </p>
                    {(commandTaskProviderHandoff.packages[0] || commandTaskProviderHandoff.blockedPackages[0]) ? (
                      <p className="mt-1 text-[11px] leading-4 text-white/45">
                        {formatRuntimeStatus((commandTaskProviderHandoff.packages[0] || commandTaskProviderHandoff.blockedPackages[0]).status)}: {formatRuntimeNarrative((commandTaskProviderHandoff.packages[0] || commandTaskProviderHandoff.blockedPackages[0]).nextAction)}
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] leading-4 text-white/45">
                        凭证审核后，把一个任务推进到“可交给试跑交接通道”的状态，并生成脱敏任务包。
                      </p>
                    )}
                    <button
                      className="mt-2 border border-fuchsia-200/50 px-2 py-1 text-[11px] font-black text-fuchsia-100 transition hover:bg-fuchsia-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading' || (!commandTaskProviderHandoff.packages.length && !commandTaskProviderHandoff.blockedPackages.length)}
                      onClick={forwardTaskProviderHandoff}
                      type="button"
                    >
                      转给试跑通道
                    </button>
                    <button
                      className="ml-2 mt-2 border border-white/20 px-2 py-1 text-[11px] font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={inspectProviderReceiptInbox}
                      type="button"
                    >
                      回执收件箱
                    </button>
                  </div>
                ) : null}
                {commandProviderReceiptInbox ? (
                  <div className="border border-cyan-200/25 bg-cyan-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/70">回执收件箱</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      回执收件箱 / 等回执 {commandProviderReceiptInbox.summary.waitingReceipt} / 发送前待补资料 {commandProviderReceiptInbox.summary.blockedBeforeDispatch} / 待处理 {commandProviderReceiptInbox.summary.actionRequired}
                    </p>
                    {commandProviderReceiptInbox.requests.slice(0, 1).map(request => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={request.requestId}>
                        {formatRuntimeStatus(request.priority)}: {formatRuntimeActionLabel(request.callback.action)} · {formatRuntimeSchemaList(request.requiredEvidence.slice(0, 3), '无')}
                      </p>
                    ))}
                    <button
                      className="mt-2 border border-cyan-200/50 px-2 py-1 text-[11px] font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={inspectProviderSandboxContract}
                      type="button"
                    >
                      样例复核约定
                    </button>
                    <button
                      className="ml-2 mt-2 border border-cyan-200/50 px-2 py-1 text-[11px] font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={inspectProviderReceiptLifecycle}
                      type="button"
                    >
                      回执生命周期
                    </button>
                    <button
                      className="ml-2 mt-2 border border-amber-200/50 px-2 py-1 text-[11px] font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={inspectProviderKeyGapBoard}
                      type="button"
                    >
                      账号资料缺口
                    </button>
                  </div>
                ) : null}
                {commandProviderReceiptLifecycle ? (
                  <div className="border border-fuchsia-200/25 bg-fuchsia-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/70">回执生命周期</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      回执生命周期 / {formatRuntimeStatus(commandProviderReceiptLifecycle.verdict)} / 待复核 {commandProviderReceiptLifecycle.summary.acceptedReceipts} / 等待 {commandProviderReceiptLifecycle.summary.waitingReceipts}
                    </p>
                    {commandProviderReceiptLifecycle.stages.slice(0, 3).map(stage => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={stage.id}>
                        {formatRuntimeStatus(stage.status)}: {formatRuntimeNarrative(stage.label)} / {formatRuntimeNarrative(stage.nextAction)}
                      </p>
                    ))}
                  </div>
                ) : null}
                {commandProviderKeyGapBoard ? (
                  <div className="border border-amber-200/25 bg-amber-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">账号资料缺口板</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      账号和资料缺口清单 / 已补配置 {commandProviderKeyGapBoard.summary.configuredEnvKeys}/{commandProviderKeyGapBoard.summary.totalEnvKeys} / 待补资料 {commandProviderKeyGapBoard.summary.providerGated} / 待店长确认 {commandProviderKeyGapBoard.summary.merchantGated} / 待数据规则 {commandProviderKeyGapBoard.summary.dataGated}
                    </p>
                    {commandProviderKeyGapBoard.rows.slice(0, 3).map(row => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={row.id}>
                        {formatRuntimeStatus(row.status)}: {formatRuntimeNarrative(row.label)} / {formatRuntimeNarrative(row.nextAction)}
                      </p>
                    ))}
                  </div>
                ) : null}
                {commandProviderSandboxContract ? (
                  <div className="border border-lime-200/25 bg-lime-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/70">样例复核约定</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      样例复核规则 / {formatRuntimeStatus(commandProviderSandboxContract.verdict)} / 待复核 {commandProviderSandboxContract.summary.passed}/{commandProviderSandboxContract.summary.checks}
                    </p>
                    {commandProviderSandboxContract.checks.slice(0, 2).map(check => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={check.id}>
                        {formatRuntimeStatus(check.status)}: {formatRuntimeNarrative(check.label)} · {formatRuntimeNarrative(check.nextAction)}
                      </p>
                    ))}
                    <button
                      className="mt-2 border border-lime-200/50 px-2 py-1 text-[11px] font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={buildProviderLaunchTrainingPack}
                      type="button"
                    >
                      生成启动准备包
                    </button>
                    <button
                      className="ml-2 mt-2 border border-lime-200/50 px-2 py-1 text-[11px] font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={buildProviderSandboxSubmitWorkbench}
                      type="button"
                    >
                      生成交接通道台账
                    </button>
                  </div>
                ) : null}
                {commandProviderSandboxSubmitWorkbench ? (
                  <div className="border border-orange-200/25 bg-orange-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-100/70">样例交接</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      样例交接预检 / {formatRuntimeTargetLabel(commandProviderSandboxSubmitWorkbench.targetRuntime)} / 待交接复核 {commandProviderSandboxSubmitWorkbench.summary.readyToSubmit} / 待补资料 {commandProviderSandboxSubmitWorkbench.summary.blocked} / 等回执 {commandProviderSandboxSubmitWorkbench.summary.waitingReceipt}
                    </p>
                    {commandProviderSandboxSubmitWorkbench.submitPackages.slice(0, 2).map(item => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={item.capabilityId}>
                        {formatRuntimeStatus(item.status)}: {formatRuntimeSchemaLabel(item.capabilityLabel)} / {formatRuntimeSchemaLabel(item.selectedPackageId || 'package:none')} / 签名回执
                      </p>
                    ))}
                    <button
                      className="mt-2 border border-orange-200/50 px-2 py-1 text-[11px] font-black text-orange-100 transition hover:bg-orange-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={() => runProviderSandboxSubmitAttempt(commandProviderSandboxSubmitWorkbench.submitPackages[0]?.capabilityId)}
                      type="button"
                    >
                      尝试样例交接
                    </button>
                    {commandProviderSandboxSubmitAttempt ? (
                      <p className="mt-2 border border-white/10 bg-stone-950/40 p-2 text-[11px] leading-4 text-white/55">
                        交接结果: {formatRuntimeStatus(commandProviderSandboxSubmitAttempt.verdict)} / 通道状态 {formatRuntimeStatus(commandProviderSandboxSubmitAttempt.summary.bridgeStatus)} / 试跑记录 {commandProviderSandboxSubmitAttempt.summary.runRecorded ? '待复核记录' : '未记录'}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {commandFirstForwardableRunPack ? (
                  <div className="border border-lime-200/25 bg-lime-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/70">首轮交接复核</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      首轮交接预检 / {formatRuntimeStatus(commandFirstForwardableRunPack.verdict)} / 待复核 {commandFirstForwardableRunPack.summary.forwardable} / 仅交接 {commandFirstForwardableRunPack.summary.handoffOnly}
                    </p>
                    {commandFirstForwardableRunPack.selectedPackage ? (
                      <p className="mt-1 text-[11px] leading-4 text-white/45">
                        {formatRuntimeTargetLabel(commandFirstForwardableRunPack.selectedPackage.runtimeTarget)}: {formatRuntimeActionLabel(commandFirstForwardableRunPack.selectedPackage.requestedAction)} / {commandFirstForwardableRunPack.selectedPackage.canForward ? '待交接复核' : formatRuntimeStatus(commandFirstForwardableRunPack.selectedPackage.blockedReasons[0] || '待补资料')}
                      </p>
                    ) : (
                      <p className="mt-1 text-[11px] leading-4 text-white/45">
                        还没选试跑交接任务包。先把一条已审核任务标记为待交接复核，再重新生成这份预检。
                      </p>
                    )}
                    <div className="mt-2 grid gap-1">
                      {commandFirstForwardableRunPack.stages.slice(0, 3).map(stage => (
                        <p className="text-[11px] leading-4 text-white/45" key={stage.id}>
                          {formatRuntimeStatus(stage.status)}: {formatRuntimeSchemaLabel(stage.id)} / {formatRuntimeNarrative(stage.nextAction)}
                        </p>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] leading-4 text-white/35">
                      对外口径: {commandFirstForwardableRunPack.summary.canClaimAutomation ? '待交接复核' : '待补资料'} / 回执规则: {formatRuntimeSchemaLabel(commandFirstForwardableRunPack.selectedPackage?.callbackHeader || 'x-restaurant-agent-signature')}
                    </p>
                  </div>
                ) : null}
                {commandFirstRunControlTower ? (
                  <div className="border border-orange-200/25 bg-orange-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-orange-100/70">首跑指挥台</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      首跑指挥台 / {formatRuntimeStatus(commandFirstRunControlTower.verdict)} / 试跑次数 {commandFirstRunControlTower.summary.totalRuns} / 等回执 {commandFirstRunControlTower.summary.waitingReceipts}
                    </p>
                    <div className="mt-2 grid gap-1">
                      {commandFirstRunControlTower.lanes.map(lane => (
                        <p className="text-[11px] leading-4 text-white/45" key={lane.id}>
                          {formatRuntimeStatus(lane.status)}: {formatRuntimeLabel(lane.label)} / {formatRuntimeOwner(lane.owner)} / {formatRuntimeNarrative(lane.nextAction)}
                        </p>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] leading-4 text-white/35">
                      恢复动作: {commandFirstRunControlTower.summary.recoveryActions} / 待补链路: {commandFirstRunControlTower.summary.blockedLanes} / 交接复核: {formatRuntimeGate(commandFirstRunControlTower.summary.canClaimAutomation, '凭证待复核', '待补凭证')}
                    </p>
                    <p className="mt-2 text-[11px] leading-4 text-white/35">
                      {formatRuntimeNarrative(commandFirstRunControlTower.safetyBoundary)}
                    </p>
                  </div>
                ) : null}
                {commandProviderLaunchTrainingPack ? (
                  <div className="border border-amber-200/25 bg-amber-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/70">试跑准备包</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      交接启动准备包 / {formatRuntimeStatus(commandProviderLaunchTrainingPack.verdict)} / 资料可复核 {commandProviderLaunchTrainingPack.summary.ready}/{commandProviderLaunchTrainingPack.summary.tracks}
                    </p>
                    {commandProviderLaunchTrainingPack.tracks.slice(0, 2).map(track => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={track.id}>
                        {formatRuntimeStatus(track.status)}: {formatRuntimeNarrative(track.title)} · {formatRuntimeNarrative(track.nextAction)}
                      </p>
                    ))}
                    {commandProviderLaunchTrainingPack.providerKeyChecklist.length ? (
                      <p className="mt-1 text-[11px] leading-4 text-white/45">
                        服务端试跑通道配置项: {formatSetupItemCount(commandProviderLaunchTrainingPack.providerKeyChecklist, '资料可复核')}
                      </p>
                    ) : null}
                    <button
                      className="mt-2 border border-amber-200/50 px-2 py-1 text-[11px] font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={inspectPlatformConnectorMatrix}
                      type="button"
                    >
                      查看通道清单
                    </button>
                  </div>
                ) : null}
                {commandPlatformConnectorMatrix ? (
                  <div className="border border-sky-200/25 bg-sky-200/[0.06] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">平台通道资料清单</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      平台通道条件清单 / {formatRuntimeStatus(commandPlatformConnectorMatrix.verdict)} / 账号资料待复核 {commandPlatformConnectorMatrix.summary.configuredEnvKeys}/{commandPlatformConnectorMatrix.summary.totalEnvKeys}
                    </p>
                    {commandPlatformConnectorMatrix.connectors.slice(0, 3).map(connector => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={connector.id}>
                        {formatRuntimeStatus(connector.status)}: {formatRuntimeNarrative(connector.platform)} · {formatRuntimeNarrative(connector.nextAction)}
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
                      经营边界报告 / {formatRuntimeStatus(commandAiOsAuditReport.verdict)} / 经营链路 {commandAiOsAuditReport.summary.lanes}
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-white/45">
                      本地可先准备 {commandAiOsAuditReport.summary.usableNow} / 人工交接 {commandAiOsAuditReport.summary.manualReady} / 待补资料 {commandAiOsAuditReport.summary.providerRequired} / 禁止项 {commandAiOsAuditReport.summary.forbidden}
                    </p>
                    {commandAiOsAuditReport.topActions.slice(0, 2).map(action => (
                      <p className="mt-1 text-[11px] leading-4 text-white/45" key={`${action.owner}-${action.action}`}>
                        {formatRuntimeOwner(action.owner)}: {formatRuntimeNarrative(action.action)}
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
                经营洞察
              </button>
              <button
                className="border border-cyan-200/60 px-3 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={dispatchState.status === 'loading'}
                onClick={buildPostRunReviewPack}
                type="button"
              >
                试跑复盘
              </button>
              <button
                className="border border-cyan-200/60 px-3 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={dispatchState.status === 'loading'}
                onClick={buildNextLoopChannelPlan}
                type="button"
              >
                下一轮经营计划
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
                门店指挥中心 · {formatRuntimeNarrative(dispatchState.commandCenter?.headline || '刷新后由后端返回主动作、证据、账号资料缺口和安全边界。')}
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
              常驻任务控制
            </button>
          </div>
        </div>
        <div className="mb-4 border border-white/10 bg-white/[0.05] p-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">客户经营路径</p>
              <h3 className="mt-1 text-lg font-black">客户默认只走 6 步：资料、试跑、刷新、时间线、店长跟进、账号资料缺口</h3>
            </div>
            <p className="max-w-2xl text-xs leading-5 text-white/55">
              这条路径对应门店餐饮经营动作；专家工具仍保留在下方折叠区，用于接试跑通道、授权、训练和复核。
            </p>
          </div>
          <div className="mt-4 border border-cyan-200/25 bg-cyan-200/[0.05] p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="text-[10px] font-semibold tracking-[0.14em] text-cyan-100/70">第一次试跑路径</div>
                <h4 className="mt-1 text-base font-black text-white">先跑一张门店工单，再看高级工具</h4>
                <p className="mt-1 max-w-4xl text-xs leading-5 text-white/55">
                  点击一次生成门店简报、可先准备任务、负责人队列、店长交接、补资料清单和凭证边界，让老板先看到今天能做什么。
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
                  label: '任务执行包',
                  value: dispatchState.clawSkillWorkbench ? `${dispatchState.clawSkillWorkbench.summary.runnableNow} 项可先准备` : '生成待复核任务',
                  note: '菜单、内容、社群和门店运营任务',
                },
                {
                  label: '负责人队列',
                  value: commandTaskQueue ? `${commandTaskQueue.summary.open} 项待处理` : '生成负责人队列',
                  note: '负责人、凭证、下一步和停止线',
                },
                {
                  label: '店长交接',
                  value: commandStaffNotificationHandoff ? `${commandStaffNotificationHandoff.summary.copyReady} 条话术待复核` : '生成交接话术',
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
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/60">{formatRuntimeNarrative(item.label)}</div>
                  <div className="mt-1 text-sm font-black text-white">{formatRuntimeNarrative(item.value)}</div>
                  <p className="mt-1 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(item.note)}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 grid gap-2 text-[11px] leading-4 md:grid-cols-2">
              <div className="border border-emerald-200/15 bg-emerald-200/[0.03] p-2 text-emerald-100/65">
                需要店长确认：活动规则、菜品证明、目标客群、渠道选择、禁用说法和门店负责人审批。
              </div>
              <div className="border border-rose-200/15 bg-rose-200/[0.03] p-2 text-rose-100/65">
                交接解锁表：只有账号确认、回填凭证、经营汇总和数据边界都补齐并复核，才进入对外发布、核销或经营复盘。
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
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.clawCloudOperatorHome?.hero.status || '点击后生成')}</div>
                  <p className="mt-1 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(dispatchState.clawCloudOperatorHome?.hero.promise || '点击“从这里开始”，围绕当前门店任务生成助手首页。')}</p>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">可先准备</div>
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
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">交接复核</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.clawCloudOperatorHome?.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-5">
                {(dispatchState.clawCloudOperatorHome?.lanes || [
                  { id: 'ask-ai-employee', label: '生成门店建议', status: 'ready-internal', owner: '门店任务助手', customerPromise: '先从一个待复核建议开始。', actionNow: '生成第一份经营简报。', visibleProof: '门店记忆和任务队列', externalNeeded: [], stopLine: '无授权不做试跑交接。' },
                  { id: 'run-shift', label: '安排今日任务', status: 'ready-internal', owner: '店长', customerPromise: '安排开店、营业巡检和收盘复盘。', actionNow: '分配第一条店长任务。', visibleProof: '负责人队列', externalNeeded: [], stopLine: '不偷偷改收银或核销数据。' },
                  { id: 'provider-unlock', label: '补齐试跑交接条件', status: 'provider-gated', owner: '技术复核', customerPromise: '资料齐全后才进入试跑交接复核。', actionNow: '收集账号确认、回填凭证和经营汇总。', visibleProof: '签收回执', externalNeeded: ['账号确认'], stopLine: '没有待复核凭证，不承诺试跑交接待复核。' },
                ]).slice(0, 5).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{formatRuntimeNarrative(item.label)}</span>
                      <span className={item.status === 'ready-internal' ? 'text-[10px] text-emerald-100/70' : item.status === 'needs-review' ? 'text-[10px] text-amber-100/70' : item.status === 'data-gated' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-sky-100/55">{formatRuntimeOwner(item.owner)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(item.actionNow)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">凭证: {formatRuntimeEvidenceValue(item.visibleProof)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                <p className="border border-white/10 bg-stone-950/45 p-2 text-[11px] leading-4 text-sky-100/60">
                  助手简报：{dispatchState.clawCloudOperatorHome?.aiEmployeeBrief.slice(0, 3).map(formatRuntimeNarrative).join(' / ') || '点击后生成'}
                </p>
                <p className="border border-white/10 bg-stone-950/45 p-2 text-[11px] leading-4 text-white/55">
                  负责人队列：{dispatchState.clawCloudOperatorHome?.ownerQueue.slice(0, 3).map(formatRuntimeNarrative).join(' / ') || '店长第一条任务、凭证槽和下一步'}
                </p>
                <p className="border border-white/10 bg-stone-950/45 p-2 text-[11px] leading-4 text-rose-100/60">
                  待补资料：{formatRuntimeSchemaList(dispatchState.clawCloudOperatorHome?.providerQueue.slice(0, 3), '账号确认 / 回填凭证 / 经营汇总')}
                </p>
              </div>
            </div>
            <div className="mt-3 border border-lime-200/20 bg-lime-200/[0.04] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-lime-100/65">店长待复核简报</div>
                  <p className="mt-1 text-xs font-black text-white">一页交接给店长、运营和技术复核。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  点击后生成店长待复核简报：今日工单、负责人动作、凭证状态、补资料要求、数据边界和停止线放在一个包里。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">店长复核</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.defaultPathForwardableBrief?.summary.canForwardToStoreManager ? '待店长复核' : '点击后生成'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">可先准备</div>
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
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">经营复盘</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.defaultPathForwardableBrief?.summary.canClaimTrueOperatingAnalysis, '汇总待复核', '待补经营汇总')}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.defaultPathForwardableBrief?.todayOperatingOrder || [
                  { id: 'confirm-offer', owner: '店长', status: 'needs-merchant-review', title: '确认门店活动和停止线', action: '点击“从这里开始”，生成店长待复核简报。', proofRequired: '店长确认过的活动简报' },
                  { id: 'run-internal-pack', owner: '运营', status: 'ready-now', title: '生成本地工作包', action: '生成内容计划、凭证槽、负责人队列和交接话术。', proofRequired: '第一张工单' },
                  { id: 'provider-unlock', owner: '技术复核', status: 'needs-provider', title: '补齐试跑交接条件', action: '收集账号确认、回填凭证、经营汇总和店长授权。', proofRequired: '账号确认和签收回执' },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{formatRuntimeNarrative(item.title)}</span>
                      <span className={item.status === 'ready-now' ? 'text-[10px] text-emerald-100/70' : item.status === 'needs-merchant-review' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-lime-100/55">{formatRuntimeOwner(item.owner)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(item.action)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">凭证: {formatRuntimeEvidenceValue(item.proofRequired)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-2">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">店长转发文案</div>
                  <p className="mt-1 whitespace-pre-line text-[11px] leading-4 text-white/60">{formatRuntimeNarrative(dispatchState.defaultPathForwardableBrief?.shareText || '点击后生成：店长能直接看到第一条任务、凭证要求和补资料边界，不用读技术面板。')}</p>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">还缺什么</div>
                  <p className="mt-1 text-[11px] leading-4 text-rose-100/60">{formatRuntimeSchemaList(dispatchState.defaultPathForwardableBrief?.externalRequired.slice(0, 5), '账号确认 / 回填凭证 / 店长授权 / 经营汇总表')}</p>
                  <p className="mt-2 text-[11px] leading-4 text-white/35">{formatRuntimeNarrative(dispatchState.defaultPathForwardableBrief?.stopLines[0] || '没有待复核凭证，不承诺试跑交接待复核。')}</p>
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
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">试跑交接</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(commandExternalUnlockRequestPack?.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                <div className="border border-white/10 bg-stone-950/45 p-3">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">店长交接文案</div>
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
                          <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-amber-100/70">{formatRuntimeStatus(item.priority)}</span>
                          <span className="text-[10px] text-white/35">{formatRuntimeOwner(item.handoffTarget)}</span>
                        </div>
                        <p className="mt-1 text-[11px] leading-4 text-white/60">{formatRuntimeNarrative(item.title)}</p>
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
                    {formatRuntimeNarrative(commandExternalUnlockRequestPack?.acceptanceReceiptTemplate.title || '点击后生成交接待复核回执模板。')}
                  </p>
                  <p className="mt-2 text-[11px] leading-4 text-cyan-100/60">
                    必填：{formatRuntimeSchemaList(commandExternalUnlockRequestPack?.acceptanceReceiptTemplate.requiredFields.slice(0, 4), '事项编号 / 渠道 / 凭证链接 / 执行记录')}
                  </p>
                  <p className="mt-2 text-[11px] leading-4 text-white/40">
                    导出：{commandExternalUnlockRequestPack ? `交接文档 ${commandExternalUnlockRequestPack.exportDigest.markdown.length} 字符 / 表格 ${commandExternalUnlockRequestPack.exportDigest.csv.split('\n').length - 1} 行` : '点击后生成交接文档和表格'}
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-3 border border-white/10 bg-white/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">工单准备快照</div>
                  <p className="mt-1 text-xs font-black text-white">现在先跑本地工单，账号资料和回执补齐并复核后再交接。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  这样能守住承诺边界：今天先准备、排队、记忆和复盘；平台发布、线索承接、核销和实时复盘需要平台账号与门店授权。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-4">
                {[
                  { label: '可先准备', value: '任务包 / 队列 / 记忆', tone: 'text-emerald-100/70' },
                  { label: '待训练', value: '店长确认样例', tone: 'text-amber-100/70' },
                  { label: '待补账号', value: '发布 / 线索 / 核销', tone: 'text-rose-100/70' },
                  { label: '待补数据', value: '收银 / 券 / 会员分析', tone: 'text-sky-100/70' },
                ].map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.label}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">{formatRuntimeNarrative(item.label)}</div>
                    <div className={`mt-1 text-xs font-black ${item.tone}`}>{formatRuntimeNarrative(item.value)}</div>
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
                  它把早班简报、午市检查、晚市发布窗口、收盘复盘和资料跟进放在一页；试跑交接等凭证待复核后再执行。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">常驻模式</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.residentAgentMissionControl?.mode || 'not-built')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">待复核事项</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.residentAgentMissionControl ? `${dispatchState.residentAgentMissionControl.summary.readyLanes}/${dispatchState.residentAgentMissionControl.summary.lanes}` : '任务事项'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">营业判断</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(commandShiftOperatingLoopPack?.verdict || '点击后生成')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">记忆提醒</div>
                  <div className="mt-1 text-xs font-black text-violet-100/75">{commandAiEmployeeMemoryPack?.summary.nextWakeups ?? '点击后生成'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">交接承诺</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{formatRuntimeGate(commandShiftOperatingLoopPack?.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.residentAgentMissionControl?.lanes || [
                  { id: 'command', status: 'waiting-evidence', owner: '运营', promise: '把门店输入变成一张有边界的门店经营任务。', nextAction: '点击“从这里开始”生成第一张任务板。' },
                  { id: 'browser', status: 'needs-provider', owner: '技术复核', promise: '试跑交接只走确认过的操作清单。', nextAction: '补齐账号确认、回填凭证、店长授权和经营汇总。' },
                  { id: 'memory', status: 'waiting-evidence', owner: '门店任务助手', promise: '只记住待复核凭证、负责人和可复用经营上下文。', nextAction: '先生成待复核凭证，再写入记忆。' },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{formatRuntimeSchemaLabel(item.id)}</span>
                      <span className={item.status === 'ready' || item.status === 'complete' ? 'text-[10px] text-emerald-100/70' : item.status === 'needs-provider' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-sky-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(item.promise)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-emerald-100/55">下一步: {formatRuntimeNarrative(item.nextAction)}</p>
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
                  <p className="mt-1 text-[11px] leading-4 text-white/60">{formatRuntimeNarrative(commandShiftOperatingLoopPack?.nextBestAction.label || '先跑今日任务，补回执，再训练下一轮。')}</p>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">记忆规则</div>
                  <p className="mt-1 text-[11px] leading-4 text-white/60">{formatRuntimeNarrative(commandAiEmployeeMemoryPack?.safetyBoundary || '只记住待复核事实、负责人、凭证要求和下次提醒；不保存账号配置值、私聊、个人信息或收银明细。')}</p>
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
                  它只验证本地回执、任务状态和经营信号链路；不会登录、发布、核销，也不会冒充经营结果。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">判断</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{formatRuntimeStatus(dispatchState.controlledTrialRun?.verdict || '点击后生成')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">回执</div>
                  <div className="mt-1 text-xs font-black text-cyan-100/75">{dispatchState.controlledTrialRun?.simulation.callback.signatureVerified ? '已验证' : '待定'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">回执</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.controlledTrialRun?.simulation.receipt.status || '生成时创建')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">试跑回执状态</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.controlledTrialRun?.runHealth.summary.accepted ?? 0} 条待复核</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">经营信号</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.controlledTrialRun?.businessSignals.summary.visitIntent ?? 0} 个到店意向</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.controlledTrialRun?.operatorCloseout || [
                  { owner: 'restaurant-ops', action: '点击后生成：复核待复核的本地回执，再决定下一步补资料动作。', evidence: '本地试跑回执' },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={`${item.owner}-${item.evidence}`}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">{formatRuntimeOwner(item.owner)}</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/60">{formatRuntimeNarrative(item.action)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-emerald-100/55">凭证: {formatRuntimeEvidenceValue(item.evidence)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-3 border border-sky-200/15 bg-sky-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-sky-100/65">受控试跑执行</div>
                  <p className="mt-1 text-xs font-black text-white">第一张工单会先准备受控试跑操作清单，账号资料补齐并复核后再交接。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  这一栏只整理待复核动作、截图规则、回执要求和待补原因；不保存登录状态、私密登录信息、私信或收银明细。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">入口</div>
                  <div className="mt-1 text-xs font-black text-sky-100/75">{formatRuntimeGate(dispatchState.browserGatewayPack?.canExecuteNow, '环境待复核', '待补资料')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">待复核动作</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.browserGatewayPack?.browserRequest.acceptedActions.length ?? '点击后生成'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">执行循环</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.runtimeRunnerLoopPack?.verdict || '点击后生成')}</div>
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
                  { action: 'capture_public_proof', allowed: false, requiredEvidence: ['截图编号'], stopIf: ['出现隐私数据'] },
                  { action: 'send_signed_receipt', allowed: false, requiredEvidence: ['签名回执'], stopIf: ['缺回执配置'] },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.action}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-sky-100/70">{formatRuntimeActionLabel(item.action)}</span>
                      <span className={item.allowed ? 'text-[10px] text-emerald-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeGate(item.allowed, '待复核', '待补条件')}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">凭证: {formatRuntimeSchemaList(item.requiredEvidence.slice(0, 2), '无')}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">停止线: {formatRuntimeSchemaList(item.stopIf.slice(0, 2), '无')}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-sky-100/55">
                下一步试跑动作：{formatRuntimeNarrative(dispatchState.runtimeRunnerLoopPack?.nextBestAction || '先补账号确认、回填凭证、隔离试跑环境和店长授权，再交接平台页面动作。')}
              </p>
            </div>
            <div className="mt-3 border border-violet-200/15 bg-violet-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-violet-100/65">发布任务收件箱</div>
                  <p className="mt-1 text-xs font-black text-white">第一张工单会把发布、受控试跑、回执、异常恢复和门店记忆整理成一个执行队列。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  这里不能标记已发布，而是给运营看：先本地准备，资料齐全后再交接，回填凭证后才复盘或写入记忆。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">判断</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.publishExecutionInbox?.verdict || '先补资料')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">任务</div>
                  <div className="mt-1 text-xs font-black text-violet-100/75">{dispatchState.publishExecutionInbox?.summary.tasks ?? 6}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">可先准备</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.publishExecutionInbox?.summary.readyInternal ?? 1}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">等凭证</div>
                  <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.publishExecutionInbox?.summary.waitingProof ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">发布交接</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{formatRuntimeGate(dispatchState.publishExecutionInbox?.summary.canClaimAutoPublish, '店长已复核', '待店长确认')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">试跑执行</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.publishExecutionInbox?.summary.canClaimBrowserExecution, '环境待复核', '待补资料')}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.publishExecutionInbox?.tasks || [
                  { id: 'prepare-publish-package', title: '准备发布包和凭证槽', status: 'ready-internal', owner: '运营', lane: '发布', action: '准备待复核内容、目标渠道和回填凭证槽。', evidenceRequired: ['待复核内容', '目标渠道'], stopLine: '凭证待复核前，不说已经发布。' },
                  { id: 'submit-browser-runner', title: '交接受控试跑任务', status: 'waiting-provider', owner: '技术复核', lane: '受控试跑', action: '补账号确认、回填凭证、独立环境和店长授权。', evidenceRequired: ['操作记录', '环境检查'], stopLine: '遇到登录挑战、验证码或私信页立即停止。' },
                  { id: 'recover-failed-run', title: '处理待补或失败任务', status: 'blocked', owner: '技术复核', lane: '异常恢复', action: '凭证没有回来时，走人工兜底和失败恢复。', evidenceRequired: ['待补原因', '重试记录'], stopLine: '最多重试两次，不能自行反复操作平台。' },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{formatRuntimeNarrative(item.title)}</span>
                      <span className={item.status === 'ready-internal' || item.status === 'done' ? 'text-[10px] text-emerald-100/70' : item.status === 'waiting-proof' ? 'text-[10px] text-sky-100/70' : item.status === 'waiting-provider' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-violet-100/55">{formatRuntimeOwner(item.owner)} / {formatRuntimeSchemaLabel(item.lane)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(item.action)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">凭证：{formatRuntimeSchemaList(item.evidenceRequired.slice(0, 2), '待补凭证')}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/50">{formatRuntimeNarrative(item.stopLine)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.publishExecutionInbox?.runnerCommands || [
                  { action: 'open_public_page', allowed: false, writesTo: 'runner-event', requiredEvidence: ['opened url'], stopIf: ['域名不在白名单'] },
                  { action: 'capture_public_proof', allowed: false, writesTo: 'runner-event', requiredEvidence: ['截图编号'], stopIf: ['出现隐私数据'] },
                  { action: 'send_signed_receipt', allowed: false, writesTo: 'signed-receipt', requiredEvidence: ['signature'], stopIf: ['缺回执配置'] },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-white/[0.04] p-2" key={item.action}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-white">{formatRuntimeActionLabel(item.action)}</span>
                      <span className={item.allowed ? 'text-[10px] text-emerald-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeGate(item.allowed, '可做', '待补条件')}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-violet-100/55">写入：{formatRuntimeSchemaLabel(item.writesTo)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">停止：{formatRuntimeSchemaList(item.stopIf.slice(0, 2), '无')}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-violet-100/55">
                异常恢复：{(dispatchState.publishExecutionInbox?.failureRecovery || [
                  { nextStep: '先补账号确认、回填凭证、隔离试跑环境和店长授权，再交接平台页面动作。' },
                  { nextStep: '如果凭证没有回来，走人工兜底并导入公开证明。' },
                ]).slice(0, 3).map(item => formatRuntimeNarrative(item.nextStep)).join(' / ')}
              </p>
            </div>
            <div className="mt-3 border border-orange-200/15 bg-orange-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-orange-100/65">交接复核工作台</div>
                  <p className="mt-1 text-xs font-black text-white">第一张工单会把账号确认、店长授权、隔离试跑环境、回填凭证、数据边界和试跑回执整理成复核清单。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  这是从本地工单走向试跑交接的客户可见桥梁：每个交接动作都要有凭证，才从待补资料进入可试跑。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">判断</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.providerAcceptanceWorkbench?.verdict || '待补资料')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">已复核</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.providerAcceptanceWorkbench?.summary.passed ?? 0}/{dispatchState.providerAcceptanceWorkbench?.summary.stages ?? 7}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">资料</div>
                  <div className="mt-1 text-xs font-black text-orange-100/75">{dispatchState.providerAcceptanceWorkbench?.summary.setupCompletionPercent ?? dispatchState.providerSetupWizard?.summary.completionPercent ?? 0}%</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">资料复核</div>
                  <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.providerAcceptanceWorkbench?.summary.readinessScore ?? dispatchState.providerReadinessHealth?.summary.readinessScore ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">试跑</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.providerAcceptanceWorkbench?.summary.canRunSandbox, '样例可先准备')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">交接承诺</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{formatRuntimeGate(dispatchState.providerAcceptanceWorkbench?.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-4">
                {(dispatchState.providerAcceptanceWorkbench?.stages || [
                  { id: 'runtime', label: '受控执行环境和服务端配置', status: 'blocked', owner: '技术复核', nextAction: '配置一个待复核的执行环境，再复核资料条件。', evidenceRequired: ['环境地址', '服务端配置名'], stopLine: '不要在页面里粘贴或返回账号配置值。' },
                  { id: 'callback', label: '签名回执和凭证格式', status: 'blocked', owner: '技术复核', nextAction: '在页面外配置回执签名，再复核交接回执。', evidenceRequired: ['签名配置', '签名校验'], stopLine: '未签名回执和私密交接内容必须拒收。' },
                  { id: 'merchant-auth', label: '店长授权范围', status: 'blocked', owner: '店长', nextAction: '先确认第一个渠道可先准备什么。', evidenceRequired: ['授权范围', '待复核动作'], stopLine: '公开门店资料不等于店长授权。' },
                  { id: 'operating-data', label: '收银、券、会员和财务数据边界', status: 'blocked', owner: '数据复核', nextAction: '经营汇总复盘前先确认字段字典。', evidenceRequired: ['字段字典', '无隐私样例'], stopLine: '不接收收银明细、支付编号或顾客标识。' },
                ]).slice(0, 4).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{formatRuntimeNarrative(item.label)}</span>
                      <span className={item.status === 'passed' ? 'text-[10px] text-emerald-100/70' : item.status === 'needs-evidence' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-orange-100/55">{formatRuntimeOwner(item.owner)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(item.nextAction)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">凭证：{formatRuntimeEvidenceValue(item.evidenceRequired.slice(0, 2))}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/50">{formatRuntimeNarrative(item.stopLine)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-5">
                {(dispatchState.providerAcceptanceWorkbench?.capabilityAcceptanceMatrix || [
                  { id: 'auto-publish-proof', label: '发布凭证回收', sandboxStatus: 'needs-provider', productionClaim: 'blocked-until-accepted-receipts', firstSandboxAction: '先交接一份待复核的公开凭证包。', requiredProviderKeys: ['试跑通道账号', '回执配置'], merchantGrantRequired: ['店长授权范围'], dataContractRequired: ['只收发布链接或截图编号'], receiptRequired: ['试跑回执编号', '签名回执'], currentEvidence: [], nextAction: '先确认限定范围的店长授权，再做样例发布凭证。', stopLine: '回执待复核，不能标记已发布。' },
                  { id: 'auto-lead-acquisition', label: '线索承接', sandboxStatus: 'needs-provider', productionClaim: 'blocked-until-accepted-receipts', firstSandboxAction: '先回传预约/领券/咨询/到店意向的汇总数量。', requiredProviderKeys: ['线索通道账号'], merchantGrantRequired: ['线索导出授权'], dataContractRequired: ['线索汇总数量'], receiptRequired: ['来源渠道', '签名回执'], currentEvidence: [], nextAction: '先让店长确认线索汇总导出。', stopLine: '不读私信原文。' },
                  { id: 'auto-coupon-redemption', label: '到店核销数据承接', sandboxStatus: 'needs-data-contract', productionClaim: 'blocked-until-accepted-receipts', firstSandboxAction: '先交接一份优惠码/到店核销汇总导入。', requiredProviderKeys: ['收银/优惠码通道账号'], merchantGrantRequired: ['优惠码后台导出授权'], dataContractRequired: ['领券数', '到店核销数'], receiptRequired: ['汇总批次编号'], currentEvidence: [], nextAction: '先收齐优惠码/收银字段表。', stopLine: '不写核销、不存优惠码。' },
                  { id: 'true-operating-analysis', label: '经营汇总复盘', sandboxStatus: 'needs-data-contract', productionClaim: 'blocked-until-accepted-receipts', firstSandboxAction: '先用收银汇总字段出一份经营报告。', requiredProviderKeys: ['收银导出通道账号'], merchantGrantRequired: ['收银导出授权'], dataContractRequired: ['订单数', '销售额'], receiptRequired: ['待复核的汇总导入'], currentEvidence: [], nextAction: '先接入脱敏经营汇总数据。', stopLine: '没有数据约定，不能标记经营复盘结论。' },
                  { id: 'staff-delivery', label: '员工任务下发', sandboxStatus: 'needs-provider', productionClaim: 'blocked-until-accepted-receipts', firstSandboxAction: '先发一条只给员工的任务通知。', requiredProviderKeys: ['员工通知通道'], merchantGrantRequired: ['员工接收名单'], dataContractRequired: ['任务编号', '负责人'], receiptRequired: ['员工确认'], currentEvidence: [], nextAction: '先配置员工通知通道。', stopLine: '不触达顾客。' },
                ]).slice(0, 5).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{formatRuntimeNarrative(item.label)}</span>
                      <span className={item.sandboxStatus === 'ready-to-submit' ? 'text-[10px] text-emerald-100/70' : item.sandboxStatus === 'needs-receipt' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.sandboxStatus)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-orange-100/55">{formatRuntimeNarrative(item.firstSandboxAction)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">账号配置: {formatRuntimeSchemaList(item.requiredProviderKeys.slice(0, 2), '无')}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">店长授权: {formatRuntimeSchemaList(item.merchantGrantRequired.slice(0, 2), '无')}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">回执要求: {formatRuntimeSchemaList(item.receiptRequired.slice(0, 2), '无')}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(item.nextAction)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/50">{formatRuntimeNarrative(item.stopLine)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-orange-100/55">
                交接资料: {(dispatchState.providerAcceptanceWorkbench?.providerHandOffCopy || [
                  '只发配置凭证、授权范围、回执字段和汇总数据约定。',
                  '不发账号配置值和顾客数据。',
                ]).slice(0, 4).map(formatRuntimeNarrative).join(' / ')}
              </p>
              <div className="mt-3 border border-emerald-200/15 bg-emerald-200/[0.035] p-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/65">样例交接板</div>
                    <p className="mt-1 text-xs font-black text-white">一眼看清每条链路：能否交接、缺什么凭证、回执要求和负责人。</p>
                    <p className="mt-1 text-[11px] leading-4 text-emerald-100/55">结论: {formatRuntimeStatus(dispatchState.providerSandboxReadinessBoard?.verdict || 'blocked-provider-setup')}</p>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">样例状态</div>
                    <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.providerSandboxReadinessBoard?.summary.canSubmitSandboxNow, '样例待复核')}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">能力</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.providerSandboxReadinessBoard?.summary.capabilities ?? 5}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">交接复核</div>
                    <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.providerSandboxReadinessBoard?.summary.readyToSubmit ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待补资料</div>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">交接复核</div>
                    <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.providerSandboxReadinessBoard?.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-5">
                  {(dispatchState.providerSandboxReadinessBoard?.rows || [
                    { capabilityId: 'auto-publish-proof', label: '发布凭证回收', status: 'blocked-provider', owner: 'ops', submitAllowed: false, selectedPackageId: 'pending', endpointEnv: '服务端试跑通道配置项', callbackRequired: ['签名回执', '签名回执规则'], evidenceRequired: ['试跑回执编号', '公开凭证链接'], missing: ['试跑通道地址/账号', '店长授权范围', '回执配置'], nextAction: '先配置试跑通道、店长授权范围和回执，再做试跑交接。', stopLine: '回执待复核，不能标记已发布。' },
                    { capabilityId: 'auto-lead-acquisition', label: '线索承接', status: 'blocked-provider', owner: 'merchant', submitAllowed: false, selectedPackageId: 'pending', endpointEnv: '服务端试跑通道配置项', callbackRequired: ['签名回执'], evidenceRequired: ['线索汇总数量'], missing: ['线索导出授权'], nextAction: '只批汇总导出，不带私信原文。', stopLine: '不读私信。' },
                    { capabilityId: 'auto-coupon-redemption', label: '到店核销数据承接', status: 'blocked-data-contract', owner: 'data-ops', submitAllowed: false, selectedPackageId: 'pending', endpointEnv: '服务端试跑通道配置项', callbackRequired: ['签名回执'], evidenceRequired: ['到店核销汇总批次编号'], missing: ['领券数', '到店核销数', '字段表'], nextAction: '先收齐优惠码/收银字段表和去隐私汇总样例。', stopLine: '不收优惠码和收银明细。' },
                    { capabilityId: 'true-operating-analysis', label: '经营汇总复盘', status: 'blocked-data-contract', owner: 'data-ops', submitAllowed: false, selectedPackageId: 'pending', endpointEnv: '服务端试跑通道配置项', callbackRequired: ['签名回执'], evidenceRequired: ['待复核的汇总导入'], missing: ['订单数', '销售额', '毛利字段'], nextAction: '先接入收银、优惠码、会员和财务汇总字段。', stopLine: '没有数据约定，不能标记经营复盘结论。' },
                    { capabilityId: 'staff-delivery', label: '员工任务下发', status: 'blocked-provider', owner: 'ops', submitAllowed: false, selectedPackageId: 'pending', endpointEnv: '服务端试跑通道配置项', callbackRequired: ['签名回执'], evidenceRequired: ['员工确认'], missing: ['员工通知通道', '接收名单'], nextAction: '先配置员工通知通道和接收名单。', stopLine: '不触达顾客。' },
                  ]).slice(0, 5).map(row => (
                    <div className="border border-white/10 bg-stone-950/45 p-2" key={row.capabilityId}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{formatRuntimeNarrative(row.label)}</span>
                        <span className={row.submitAllowed || row.status === 'accepted' ? 'text-[10px] text-emerald-100/70' : row.status === 'waiting-receipt' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{row.submitAllowed ? '待交接复核' : formatRuntimeStatus(row.status)}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-emerald-100/55">负责人: {formatRuntimeOwner(row.owner)} / 任务包: {formatRuntimeSchemaLabel(row.selectedPackageId || 'package:none')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">交接条件: 服务端试跑通道配置项已补齐</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">回执要求: {formatRuntimeSchemaList(row.callbackRequired?.slice(0, 2), '签名回执')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">还缺: {formatRuntimeSchemaList(row.missing?.slice(0, 3), '无')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(row.nextAction)}</p>
                    </div>
                  ))}
                </div>
                {dispatchState.providerSandboxReadinessBoard?.firstRunnable ? (
                  <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-emerald-100/65">
                    第一条待复核链路: {formatRuntimeSchemaLabel(dispatchState.providerSandboxReadinessBoard.firstRunnable.packageId)} / {formatRuntimeActionLabel(dispatchState.providerSandboxReadinessBoard.firstRunnable.action)}
                  </p>
                ) : (
                  <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-rose-100/55">
                    第一条待复核链路：通道账号、店长授权、回执和数据约定的凭证复核之前保持待补资料。
                  </p>
                )}
              </div>
              <div className="mt-3 border border-lime-200/15 bg-lime-200/[0.035] p-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/65">样例试跑台</div>
                    <p className="mt-1 text-xs font-black text-white">交接后在一条时间线里看试跑事件、签名回执、凭证复核、收尾和记忆写入资格。</p>
                    <p className="mt-1 text-[11px] leading-4 text-lime-100/55">结论: {formatRuntimeStatus(dispatchState.providerSandboxRunConsole?.verdict || 'blocked-before-submit')}</p>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">收尾</div>
                    <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.providerSandboxRunConsole?.summary.canCloseoutRun, '回执可收尾', '等回执')}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待复核</div>
                    <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.providerSandboxRunConsole?.summary.done ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">资料可复核</div>
                    <div className="mt-1 text-xs font-black text-lime-100/75">{dispatchState.providerSandboxRunConsole?.summary.ready ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">等待</div>
                    <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.providerSandboxRunConsole?.summary.waiting ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待补资料</div>
                    <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.providerSandboxRunConsole?.summary.blocked ?? 4}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">试跑事件</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.providerSandboxRunConsole?.summary.runnerEvents ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">记忆</div>
                    <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.providerSandboxRunConsole?.summary.canWriteMemory, '凭证待复核', '待补凭证')}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {(dispatchState.providerSandboxRunConsole?.timeline || [
                    { id: 'readiness', label: '样例交接判断', status: 'blocked', owner: 'ops', evidence: ['缺账号配置'], nextAction: '样例交接前先补齐账号配置。', stopLine: '配置凭证待复核不交接。' },
                    { id: 'submit-package', label: '待复核脱敏交接包', status: 'blocked', owner: 'ops', evidence: ['package:none'], nextAction: '先创建安全的试跑交接任务包。', stopLine: '资料包里不带账号配置值和隐私数据。' },
                    { id: 'signed-callback', label: '签名试跑回执', status: 'waiting', owner: 'runtime-admin', evidence: ['waitingReceipts:0'], nextAction: '收尾前必须有签名回执。', stopLine: '未签名回执永远关不掉运行。' },
                  ]).slice(0, 6).map(step => (
                    <div className="border border-white/10 bg-stone-950/45 p-2" key={step.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{formatRuntimeNarrative(step.label)}</span>
                        <span className={step.status === 'done' || step.status === 'ready' ? 'text-[10px] text-emerald-100/70' : step.status === 'waiting' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(step.status)}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-lime-100/55">负责人: {formatRuntimeOwner(step.owner)}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">凭证: {formatRuntimeSchemaList(step.evidence.slice(0, 3), '待补凭证')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(step.nextAction)}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-lime-100/55">
                  回执规则: 服务端校验签名回执规则 / 凭证 {(dispatchState.providerSandboxRunConsole?.providerCallbackContract.acceptedEvidence || ['eventId', 'externalRunId', '操作员摘要']).slice(0, 4).map(formatRuntimeSchemaLabel).join(' / ')}
                </p>
              </div>
              <div className="mt-3 border border-cyan-200/15 bg-cyan-200/[0.035] p-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/65">样例交接预检</div>
                    <p className="mt-1 text-xs font-black text-white">每条对标能力都有脱敏交接包、回执要求、回执预期和恢复负责人。</p>
                  </div>
                  <button
                    className="border border-cyan-200/40 px-3 py-2 text-[11px] font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={dispatchState.status === 'loading'}
                    onClick={buildProviderSandboxSubmitWorkbench}
                    type="button"
                  >
                    生成交接工作台
                  </button>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">能力</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.providerSandboxSubmitWorkbench?.summary.capabilities ?? 5}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">资料可复核</div>
                    <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.providerSandboxSubmitWorkbench?.summary.readyToSubmit ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待补资料</div>
                    <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.providerSandboxSubmitWorkbench?.summary.blocked ?? 5}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">等回执</div>
                    <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.providerSandboxSubmitWorkbench?.summary.waitingReceipt ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">交接复核</div>
                    <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.providerSandboxSubmitWorkbench?.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-5">
                  {(dispatchState.providerSandboxSubmitWorkbench?.submitPackages || [
                    { capabilityId: 'auto-publish-proof', capabilityLabel: '发布凭证回收', targetRuntime: 'openclaw', status: 'blocked-provider', selectedPackageId: 'pending', callback: { header: '签名回执规则' }, receiptExpectation: ['试跑回执编号', '公开凭证链接'], recoveryOwner: 'ops', nextAction: '先配置试跑通道、店长授权和回执，再做试跑交接。', stopLine: '回执待复核，不能标记已发布。', submitEndpointShape: { endpointEnv: '服务端试跑通道配置项' } },
                    { capabilityId: 'auto-lead-acquisition', capabilityLabel: '线索承接', targetRuntime: 'openclaw', status: 'blocked-provider', selectedPackageId: 'pending', callback: { header: '签名回执规则' }, receiptExpectation: ['汇总数量', '负责人'], recoveryOwner: 'merchant', nextAction: '只批汇总导出，不带私信原文。', stopLine: '不读私信。', submitEndpointShape: { endpointEnv: '服务端试跑通道配置项' } },
                    { capabilityId: 'auto-coupon-redemption', capabilityLabel: '到店核销数据承接', targetRuntime: 'openclaw', status: 'blocked-data-contract', selectedPackageId: 'pending', callback: { header: '签名回执规则' }, receiptExpectation: ['到店核销汇总批次编号'], recoveryOwner: 'data-ops', nextAction: '先收齐优惠码/收银字段表和去隐私汇总样例。', stopLine: '不收优惠码和收银明细。', submitEndpointShape: { endpointEnv: '服务端试跑通道配置项' } },
                    { capabilityId: 'true-operating-analysis', capabilityLabel: '经营汇总复盘', targetRuntime: 'openclaw', status: 'blocked-data-contract', selectedPackageId: 'pending', callback: { header: '签名回执规则' }, receiptExpectation: ['待复核的汇总导入'], recoveryOwner: 'data-ops', nextAction: '先接入收银、优惠码、会员和财务汇总字段。', stopLine: '没有数据约定，不能标记经营复盘结论。', submitEndpointShape: { endpointEnv: '服务端试跑通道配置项' } },
                    { capabilityId: 'staff-delivery', capabilityLabel: '员工任务下发', targetRuntime: 'openclaw', status: 'blocked-provider', selectedPackageId: 'pending', callback: { header: '签名回执规则' }, receiptExpectation: ['员工确认'], recoveryOwner: 'ops', nextAction: '先配置员工通知通道和接收名单。', stopLine: '不触达顾客。', submitEndpointShape: { endpointEnv: '服务端试跑通道配置项' } },
                  ]).slice(0, 5).map(item => (
                    <div className="border border-white/10 bg-stone-950/45 p-2" key={item.capabilityId}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{item.capabilityLabel}</span>
                        <span className={item.status === 'ready-to-submit' || item.status === 'accepted' ? 'text-[10px] text-emerald-100/70' : item.status === 'waiting-receipt' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-cyan-100/55">试跑通道: {formatRuntimeTargetLabel(item.targetRuntime)} / 服务端配置项待补</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">任务包: {formatRuntimeSchemaLabel(item.selectedPackageId || 'package:none')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">回执规则: 服务端校验签名回执规则</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">回执要求: {formatRuntimeSchemaList(item.receiptExpectation.slice(0, 2), '签名回执')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(item.nextAction)}</p>
                      <p className="mt-1 text-[11px] leading-4 text-rose-100/50">{formatRuntimeNarrative(item.stopLine)}</p>
                      <button
                        className="mt-2 border border-cyan-200/40 px-2 py-1 text-[11px] font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={dispatchState.status === 'loading'}
                        onClick={() => runProviderSandboxSubmitAttempt(item.capabilityId)}
                        type="button"
                      >
                        尝试交接
                      </button>
                    </div>
                  ))}
                </div>
                {dispatchState.providerSandboxSubmitAttempt ? (
                  <div className="mt-3 border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">最近一次尝试</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/65">
                      样例交接尝试 / {formatRuntimeStatus(dispatchState.providerSandboxSubmitAttempt.verdict)} / 通道 {formatRuntimeStatus(dispatchState.providerSandboxSubmitAttempt.summary.bridgeStatus)} / 试跑记录 {dispatchState.providerSandboxSubmitAttempt.summary.runRecorded ? '待复核记录' : '未记录'}
                    </p>
                    <p className="mt-1 text-[11px] leading-4 text-orange-100/55">{formatRuntimeNarrative(dispatchState.providerSandboxSubmitAttempt.recoveryNextAction)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">回执规则: 服务端校验签名回执规则 / {formatRuntimeSchemaList(dispatchState.providerSandboxSubmitAttempt.receiptExpectation.acceptedEvidence.slice(0, 3), '签名回执')}</p>
                  </div>
                ) : null}
                <div className="mt-3 border border-amber-200/15 bg-amber-200/[0.035] p-3">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/65">试跑条件板</div>
                      <p className="mt-1 text-xs font-black text-white">把对标打法拆成还缺的账号配置、门店授权、数据规则和待复核回执。</p>
                    </div>
                    <button
                      className="border border-amber-200/40 px-3 py-2 text-[11px] font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={dispatchState.status === 'loading'}
                      onClick={inspectProviderKeyGapBoard}
                      type="button"
                    >
                      生成资料缺口板
                    </button>
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-5">
                    <div className="border border-white/10 bg-stone-950/45 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">事项</div>
                      <div className="mt-1 text-xs font-black text-white">{dispatchState.providerKeyGapBoard?.summary.capabilities ?? 7}</div>
                    </div>
                    <div className="border border-white/10 bg-stone-950/45 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">服务端配置</div>
                      <div className="mt-1 text-xs font-black text-amber-100/75">{dispatchState.providerKeyGapBoard ? `${dispatchState.providerKeyGapBoard.summary.configuredEnvKeys}/${dispatchState.providerKeyGapBoard.summary.totalEnvKeys}` : '0/12'}</div>
                    </div>
                    <div className="border border-white/10 bg-stone-950/45 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待补资料</div>
                      <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.providerKeyGapBoard?.summary.providerGated ?? 4}</div>
                    </div>
                    <div className="border border-white/10 bg-stone-950/45 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">店长侧</div>
                      <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.providerKeyGapBoard?.summary.merchantGated ?? 1}</div>
                    </div>
                    <div className="border border-white/10 bg-stone-950/45 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">对标口径</div>
                      <div className="mt-1 text-xs font-black text-rose-100/75">{formatRuntimeGate(dispatchState.providerKeyGapBoard?.summary.canClaimCompetitorParity, '凭证待复核', '待补凭证')}</div>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 lg:grid-cols-3">
                    {(dispatchState.providerKeyGapBoard?.rows || [
                      { id: 'persistent-browser-runner', label: '隔离试跑通道', status: 'provider-gated', owner: 'runtime-admin', requiredEnvKeys: ['试跑通道地址', '试跑通道账号'], nextAction: '先配置一条试跑通道地址、账号和回执配置。' },
                      { id: 'auto-publish', label: '发布凭证链路', status: 'merchant-gated', owner: 'merchant', requiredEnvKeys: ['浏览器隔离环境编号'], nextAction: '先从一个平台、一条发布凭证链路开始。' },
                      { id: 'true-operating-analysis', label: '经营汇总复盘', status: 'data-gated', owner: 'data-ops', requiredEnvKeys: ['RESTAURANT_POS_DATA_MODE', 'RESTAURANT_POS_FIELD_DICTIONARY'], nextAction: '先导入一份脱敏收银/核销样例。' },
                    ]).slice(0, 6).map(row => (
                      <div className="border border-white/10 bg-stone-950/45 p-2" key={row.id}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-white">{formatRuntimeNarrative(row.label)}</span>
                          <span className={row.status === 'internal-ready' ? 'text-[10px] text-emerald-100/70' : row.status === 'data-gated' ? 'text-[10px] text-violet-100/70' : 'text-[10px] text-amber-100/70'}>{formatRuntimeStatus(row.status)}</span>
                        </div>
                        <p className="mt-1 text-[11px] leading-4 text-amber-100/55">负责人: {formatRuntimeOwner(row.owner)}</p>
                        <p className="mt-1 text-[11px] leading-4 text-white/35">服务端试跑通道配置项: {formatSetupItemCount(row.requiredEnvKeys, '资料可复核')}</p>
                        <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(row.nextAction)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-3 border border-fuchsia-200/15 bg-fuchsia-200/[0.035] p-3">
                  <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-100/65">签名回执流转</div>
                      <p className="mt-1 text-xs font-black text-white">试跑交接有一条从回执到收尾的状态链，签名回执、校验、经营信号、试跑复盘和记忆写入规则。</p>
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
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待复核</div>
                      <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.providerReceiptLifecycle?.summary.acceptedReceipts ?? 0}</div>
                    </div>
                    <div className="border border-white/10 bg-stone-950/45 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">等待</div>
                      <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.providerReceiptLifecycle?.summary.waitingReceipts ?? 0}</div>
                    </div>
                    <div className="border border-white/10 bg-stone-950/45 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">记忆</div>
                      <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.providerReceiptLifecycle?.summary.canWriteMemory, '凭证待复核', '待补凭证')}</div>
                    </div>
                    <div className="border border-white/10 bg-stone-950/45 p-2">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">交接复核</div>
                      <div className="mt-1 text-xs font-black text-rose-100/75">{formatRuntimeGate(dispatchState.providerReceiptLifecycle?.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 lg:grid-cols-3">
                    {(dispatchState.providerReceiptLifecycle?.stages || [
                      { id: 'submit', label: '样例交接待复核记录', status: 'waiting', owner: 'ops', evidence: ['暂无试跑记录'], nextAction: '先跑一次受控的样例交接。', stopLine: '没有试跑记录，就不能标记交接待复核。' },
                      { id: 'callback', label: '收到签名回执待复核', status: 'blocked', owner: 'runtime-admin', evidence: ['waiting:0'], nextAction: '复核前必须有签名回执规则和试跑回执编号。', stopLine: '未签名回执一律拒收。' },
                      { id: 'validation', label: '回执校验', status: 'waiting', owner: 'ops', evidence: ['暂无已校验回执'], nextAction: '收集公开链接、截图编号或签名的试跑回执编号。', stopLine: '未通过校验的回执不进经营复盘。' },
                    ]).slice(0, 6).map(stage => (
                      <div className="border border-white/10 bg-stone-950/45 p-2" key={stage.id}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-white">{formatRuntimeNarrative(stage.label)}</span>
                          <span className={stage.status === 'done' ? 'text-[10px] text-emerald-100/70' : stage.status === 'waiting' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(stage.status)}</span>
                        </div>
                        <p className="mt-1 text-[11px] leading-4 text-fuchsia-100/55">{formatRuntimeOwner(stage.owner)}</p>
                        <p className="mt-1 text-[11px] leading-4 text-white/35">凭证: {formatRuntimeSchemaList(stage.evidence.slice(0, 2), '待补凭证')}</p>
                        <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(stage.nextAction)}</p>
                        <p className="mt-1 text-[11px] leading-4 text-rose-100/50">{formatRuntimeNarrative(stage.stopLine)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 border border-amber-200/15 bg-amber-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-100/65">资料复核阶梯</div>
                  <p className="mt-1 text-xs font-black text-white">第一次试跑路径会明确标出哪些事项本地可先准备，哪些还需要账号、授权或回执。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  这是发布凭证、线索承接、券码核销数据、经营复盘、隔离试跑通道和门店记忆跟进的复核路径，账号资料未复核前不假装已上线。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">事项</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.providerUnlockLadder?.summary.capabilities ?? 6}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">账号资料待复核</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.providerUnlockLadder?.summary.providerHealthReady ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">资料待复核</div>
                  <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.providerUnlockLadder?.summary.setupEvidenceSigned ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待补资料</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.providerUnlockLadder?.summary.externalBlocked ?? dispatchState.providerLaunchBoard?.summary.missingProvider ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">交接复核</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.providerUnlockLadder?.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.providerUnlockLadder?.items || [
                  { id: 'persistent-browser', label: '隔离试跑交接通道', stage: 'external-blocked', internalCanDo: '生成受控任务包、异常恢复流程和凭证要求。', nextAction: '通过服务端配置试跑通道地址、账号和回执配置。', stillNeeds: ['试跑通道地址/账号和回执配置'] },
                  { id: 'auto-publish-proof', label: '发布凭证回收', stage: 'external-blocked', internalCanDo: '可先准备渠道文案、员工清单和凭证台账，不能标记已发布。', nextAction: '提供限定范围的店长授权和签名凭证回执。', stillNeeds: ['店长授权范围'] },
                  { id: 'operating-analysis', label: '经营汇总复盘', stage: 'external-blocked', internalCanDo: '把观察判断和可量化的经营信号分开。', nextAction: '提供脱敏收银、券码和核销数据规则。', stillNeeds: ['脱敏收银/券码字段表'] },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{formatRuntimeNarrative(item.label)}</span>
                      <span className={item.stage === 'provider-health-ready' ? 'text-[10px] text-emerald-100/70' : item.stage === 'setup-evidence-signed' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.stage)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">本地: {formatRuntimeNarrative(item.internalCanDo)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-amber-100/55">下一步: {formatRuntimeNarrative(item.nextAction)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-amber-100/55">
                账号资料: {formatRuntimeSchemaList((dispatchState.providerUnlockLadder?.nextExternalAsks || dispatchState.providerLaunchBoard?.externalRequired || ['试跑通道地址/账号', '店长授权范围', '签名回执配置', '收银/券汇总数据规则']).slice(0, 5), '资料可复核')}
              </p>
              <div className="mt-3 border border-sky-200/15 bg-sky-200/[0.035] p-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/65">账号资料补齐指南</div>
                    <p className="mt-1 text-xs font-black text-white">补资料清单会按负责人、要补什么、解锁什么、凭证和停止线整理给店长。</p>
                  </div>
                  <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                    不把技术配置丢给客户，只说明谁补哪份资料、补齐后能解锁哪类门店动作。
                  </p>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-stone-950/45 p-2 md:col-span-2">
                    <div className="text-[10px] font-semibold tracking-[0.14em] text-white/40">说明</div>
                    <p className="mt-1 text-[11px] leading-4 text-white/60">{formatRuntimeNarrative(dispatchState.externalAccessGuide?.answerForCustomer || '点击后生成：先跑本地门店助手，再按账号确认、凭证回填、经营数据和员工通道逐步解锁。')}</p>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">步骤</div>
                    <div className="mt-1 text-xs font-black text-white">{dispatchState.externalAccessGuide?.summary.steps ?? 5}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">资料齐备度</div>
                    <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.externalAccessGuide?.summary.setupCompletionPercent ?? dispatchState.providerSetupWizard?.summary.completionPercent ?? 0}%</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">样例</div>
                    <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.externalAccessGuide?.summary.canStartSandbox, '样例可检查')}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">交接复核</div>
                    <div className="mt-1 text-xs font-black text-rose-100/75">{formatRuntimeGate(dispatchState.externalAccessGuide?.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-5">
                  {(dispatchState.externalAccessGuide?.steps || [
                    { id: 'runtime', title: '连接一个隔离试跑交接通道', owner: 'runtime-admin', status: 'provider-gated', customerAsk: '在服务端配置试跑通道地址、账号和隔离环境。', providerAsk: ['试跑通道地址/账号'], unlocks: ['隔离试跑交接通道'], acceptanceEvidence: ['试跑通道检查通过'], nextAction: '配置试跑通道和回执配置。', stopLine: '没有待复核回执，不承诺交接待复核。' },
                    { id: 'merchant-grants', title: '确认店长授权范围', owner: 'merchant', status: 'provider-gated', customerAsk: '确认允许的渠道动作和凭证类型。', providerAsk: ['店长授权'], unlocks: ['发布凭证', '线索回执'], acceptanceEvidence: ['授权范围凭证'], nextAction: '收限定范围的店长授权。', stopLine: '公开资料不等于授权。' },
                    { id: 'operating-data', title: '确认收银、优惠码和经营数据约定', owner: 'data-ops', status: 'data-gated', customerAsk: '提供汇总字段表和去隐私样例。', providerAsk: ['收银/优惠码字段说明表'], unlocks: ['经营汇总复盘'], acceptanceEvidence: ['汇总导入回执'], nextAction: '导入脱敏汇总数据。', stopLine: '不收收银明细和支付凭证号。' },
                  ]).slice(0, 5).map(item => (
                    <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{formatRuntimeNarrative(item.title)}</span>
                        <span className={item.status === 'ready-to-check' ? 'text-[10px] text-emerald-100/70' : item.status === 'missing-evidence' ? 'text-[10px] text-sky-100/70' : item.status === 'data-gated' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-sky-100/55">{formatRuntimeOwner(item.owner)}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(item.customerAsk)}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">解锁: {formatRuntimeSchemaList(item.unlocks.slice(0, 2), '无')}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-rose-100/55">
                  已脱敏: {formatRuntimeSchemaList((dispatchState.externalAccessGuide?.redactedFields || ['api keys', '登录状态', 'browser profile ids', 'private message text', 'customer PII', 'raw POS rows']).slice(0, 6), '无')}
                </p>
              </div>
            </div>
            <div className="mt-3 border border-emerald-200/15 bg-emerald-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/65">门店试跑覆盖图</div>
                  <p className="mt-1 text-xs font-black text-white">默认路径覆盖门店经营任务面：公开主页、内容、发布凭证、线索承接、券码核销和经营复盘。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  把本地工作台价值和待补账号资料的链路分开，覆盖点评/美团、小红书、抖音、微信社群、收银/券码系统和试跑交接通道。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-5">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">连接器</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.platformConnectorMatrix?.summary.connectors ?? 7}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">本地可先准备</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.platformConnectorMatrix?.summary.internalReady ?? 1}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待补账号资料</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.platformConnectorMatrix?.summary.providerRequired ?? dispatchState.platformConnectorMatrix?.summary.blocked ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">服务端配置</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.platformConnectorMatrix ? `${dispatchState.platformConnectorMatrix.summary.configuredEnvKeys}/${dispatchState.platformConnectorMatrix.summary.totalEnvKeys}` : '0/待配置'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">结论</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.platformConnectorMatrix?.verdict || 'provider-setup-required')}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.platformConnectorMatrix?.capabilityCoverage || [
                  { capability: '发布凭证补齐', internalConnectors: [], providerConnectors: ['本地生活平台账号', '内容账号', '员工回填通道'], missingEvidence: ['店长授权', '签名回执'] },
                  { capability: '优惠码核销汇总', internalConnectors: [], providerConnectors: ['团购券平台', '核销汇总表'], missingEvidence: ['到店核销数汇总', '字段说明表'] },
                  { capability: '经营复盘分析', internalConnectors: [], providerConnectors: ['脱敏经营汇总表'], missingEvidence: ['脱敏收银样例', '统计时间范围'] },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.capability}>
                    <div className="text-xs font-black text-white">{formatRuntimeSchemaLabel(item.capability)}</div>
                    <p className="mt-1 text-[11px] leading-4 text-emerald-100/55">本地: {formatRuntimeSchemaList(item.internalConnectors.slice(0, 2), '只做计划和凭证槽')}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/55">账号资料: {formatRuntimeSchemaList(item.providerConnectors.slice(0, 3))}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">凭证: {formatRuntimeSchemaList(item.missingEvidence.slice(0, 2), '无')}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-emerald-100/55">
                试点顺序: {(dispatchState.platformConnectorMatrix?.pilotOrder || ['先做公开门店资料录入和本地内容草稿。', '为样例交接配置一条隔离试跑通道和回执配置。', '补一份收银/核销汇总样例后再标记经营复盘。']).slice(0, 3).map(formatRuntimeNarrative).join(' / ')}
              </p>
            </div>
            <div className="mt-3 border border-cyan-200/15 bg-cyan-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/65">门店数据导入中心</div>
                  <p className="mt-1 text-xs font-black text-white">默认路径已对齐门店经营数据源：公开主页、发布凭证、预约、券码核销、收银销售、会员、库存和毛利。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  这是经营汇总复盘背后的数据主干，每个数据源都有负责人、标准字段、样例行、禁止字段、下一步和账号资料边界。
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
                  <div className="mt-1 text-xs font-black text-amber-100/75">{dispatchState.storeDataImportCenter?.summary.missingRequiredFields ?? '待字段表'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">样例行</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.storeDataImportCenter?.sampleRows.length ?? dispatchState.posImport?.summary.validRows ?? '生成时创建'}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">汇总复盘</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{formatRuntimeGate(dispatchState.storeDataImportCenter?.summary.canClaimTrueOperatingAnalysis, '汇总待复核', '待补经营汇总')}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-4">
                {(dispatchState.storeDataImportCenter?.sources || [
                  { id: 'coupon-redemption', label: '领券与到店核销导出', status: 'sample-ready', owner: 'data-ops', nextAction: '从店长导出里映射领券/到店核销字段。', acceptedInputs: ['领券数', '到店核销数'], forbiddenInputs: ['优惠码', '支付凭证号'] },
                  { id: 'pos-sales', label: '收银销售与订单汇总', status: 'sample-ready', owner: 'data-ops', nextAction: '导入脱敏收银汇总行。', acceptedInputs: ['grossSales', 'orderCount'], forbiddenInputs: ['原始订单行', '支付凭证号'] },
                  { id: 'member-retention', label: '会员与社群留存汇总', status: 'provider-gated', owner: 'data-ops', nextAction: '和店长一起定义不带隐私的分群导出。', acceptedInputs: ['分群名称', '跟进数量'], forbiddenInputs: ['联系电话', '微信号'] },
                  { id: 'finance-margin', label: '财务、毛利与折扣护栏', status: 'provider-gated', owner: 'finance', nextAction: '建议折扣力度之前，先收店长确认的成本汇总字段。', acceptedInputs: ['ingredientCost', 'platformFee'], forbiddenInputs: ['bank account', '支付流水号'] },
                ]).slice(0, 4).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{formatRuntimeNarrative(item.label)}</span>
                      <span className={item.status === 'sample-ready' || item.status === 'ready-internal' ? 'text-[10px] text-emerald-100/70' : item.status === 'needs-field-mapping' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-cyan-100/55">{formatRuntimeOwner(item.owner)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(item.nextAction)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-emerald-100/50">只收: {formatRuntimeSchemaList(item.acceptedInputs.slice(0, 2), '无')}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/50">拒收: {formatRuntimeSchemaList(item.forbiddenInputs.slice(0, 2), '无')}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.storeDataImportCenter?.validationQueue || [
                  { id: 'field-dictionary', owner: 'data-ops', priority: 'today', action: '确认标准字段、来源表头、时间粒度和口径。', evidenceRequired: '店长确认的字段说明表', stopLine: '不导入原始订单行和顾客身份信息。' },
                  { id: 'sample-import', owner: 'store-manager', priority: 'today', action: '上传或粘贴一份脱敏汇总样例。', evidenceRequired: '待复核的样例汇总行', stopLine: '校验之前不能标记经营汇总复盘。' },
                  { id: 'provider-data-contract', owner: 'runtime-admin', priority: 'blocked', action: '收试跑通道或浏览器执行的数据约定。', evidenceRequired: '授权和回执', stopLine: '授权和回执没齐，不做核销数据写入、不写收银数据。' },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white">{formatRuntimeOwner(item.owner)}</span>
                      <span className={item.priority === 'blocked' ? 'text-[10px] text-rose-100/70' : item.priority === 'today' ? 'text-[10px] text-emerald-100/70' : 'text-[10px] text-amber-100/70'}>{formatRuntimeStatus(item.priority)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/60">{formatRuntimeNarrative(item.action)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-cyan-100/50">凭证: {formatRuntimeEvidenceValue(item.evidenceRequired)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/45">{formatRuntimeNarrative(item.stopLine)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-cyan-100/55">
                下一步: {formatRuntimeNarrative(dispatchState.storeDataImportCenter?.nextBestAction.label || '确认收银口径')} / 还缺: {formatRuntimeSchemaList((dispatchState.storeDataImportCenter?.externalRequired || ['店长确认的字段说明表', '收银/券码汇总来源', '财务导出或老板成本表']).slice(0, 4), '资料可复核')}
              </p>
            </div>
            <div className="mt-3 border border-sky-200/15 bg-sky-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/65">线索收件箱</div>
                  <p className="mt-1 text-xs font-black text-white">默认路径把预约、领券、私域咨询、到店意向和差评挽回收进一个受控线索队列。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  店长授权、渠道通道、回执和去隐私数据约定配齐之前，线索承接和顾客触达保持关闭。
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
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">线索承接</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{formatRuntimeGate(dispatchState.leadCaptureInbox?.summary.canClaimAutoLeadCapture, '凭证待复核', '待补凭证')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">顾客触达</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{formatRuntimeGate(dispatchState.leadCaptureInbox?.summary.canClaimAutoCustomerContact, '店长已复核', '待店长确认')}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-5">
                {(dispatchState.leadCaptureInbox?.sources || [
                  { id: 'reservation', label: '预约与等位意向', status: 'provider-gated', signalCount: 0, nextAction: '分派桌位意向前先导入脱敏预约汇总。' },
                  { id: 'coupon-claim', label: '券与团购领取', status: 'provider-gated', signalCount: 0, nextAction: '收券规则凭证和领取数量汇总。' },
                  { id: 'private-domain-inquiry', label: '私域咨询摘要', status: 'provider-gated', signalCount: 0, nextAction: '员工通道配好之前，保持人工摘要。' },
                  { id: 'visit-intent', label: '公开凭证里的到店意向', status: 'needs-evidence', signalCount: 0, nextAction: '记录到店意向前先收公开凭证或待复核回执。' },
                  { id: 'review-recovery', label: '差评触发的服务恢复', status: 'needs-evidence', signalCount: 0, nextAction: '先生成口碑收尾包，再做差评驱动的跟进。' },
                ]).slice(0, 5).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{formatRuntimeNarrative(item.label)}</span>
                      <span className={item.status === 'internal-ready' ? 'text-[10px] text-emerald-100/70' : item.status === 'needs-evidence' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-sky-100/60">信号数: {item.signalCount}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(item.nextAction)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.leadCaptureInbox?.leadItems || [
                  { id: 'lead-reservation-capacity', title: '回复前先确认接待容量', priority: 'blocked', owner: 'store-manager', signalCount: 0, staffAction: '核对服务时段、桌位容量和排队压力。', evidenceRequired: '服务时段 + 容量说明 + 预约数量汇总', stopLine: '没有店长授权不做确认。' },
                  { id: 'lead-coupon-redemption-prep', title: '准备领券到核销的跟进', priority: 'blocked', owner: 'ops', signalCount: 0, staffAction: '讲清券的有效期、不可用范围和核销时段。', evidenceRequired: '券规则凭证 + 领取数量汇总', stopLine: '没凭证不能标记核销和投产比。' },
                  { id: 'lead-private-domain-summary', title: '归类私域咨询但不存聊天', priority: 'blocked', owner: 'community-ops', signalCount: 0, staffAction: '汇总咨询主题，起草员工审核过的回复。', evidenceRequired: '来源渠道 + 数量汇总 + 已审回复话术', stopLine: '不读私信、不触达顾客。' },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{formatRuntimeNarrative(item.title)}</span>
                      <span className={item.priority === 'today' ? 'text-[10px] text-emerald-100/70' : item.priority === 'next-shift' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.priority)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-sky-100/55">{formatRuntimeOwner(item.owner)} / 信号数 {item.signalCount}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(item.staffAction)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">凭证: {formatRuntimeEvidenceValue(item.evidenceRequired)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/50">{formatRuntimeNarrative(item.stopLine)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-sky-100/55">
                待补资料: {formatRuntimeSchemaList((dispatchState.leadCaptureInbox?.providerUnlocks || ['线索来源的店长授权范围', '员工通道和接收名单确认', '回执配置和回执字段约定']).slice(0, 4), '资料可复核')}
              </p>
            </div>
            <div className="mt-3 border border-indigo-200/15 bg-indigo-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-100/65">线索承接工作台</div>
                  <p className="mt-1 text-xs font-black text-white">默认路径把线索承接变成可复核的试跑交接路径，覆盖预约、领券、私域咨询、到店意向和差评挽回。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  这是线索承接的试跑桥，现在先做员工任务；店长授权、签名回执、去隐私约定和员工审核都齐之前，不做顾客触达。
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
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">账号资料阶段</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{formatRuntimeStatus(dispatchState.leadAcquisitionProviderWorkbench?.summary.providerStages ?? 'gated')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">回执</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.leadAcquisitionProviderWorkbench?.summary.callbackReady, '回执待复核', '待补回执')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">顾客触达</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{formatRuntimeGate(dispatchState.leadAcquisitionProviderWorkbench?.summary.canClaimAutoCustomerContact, '店长已复核', '待店长确认')}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-5">
                {(dispatchState.leadAcquisitionProviderWorkbench?.lanes || [
                  { id: 'reservation', label: '预约与等位承接', status: 'provider-gated', owner: 'store-manager', signalCount: 0, firstRunnableTask: '任何预约回复前先做员工复核的容量检查。' },
                  { id: 'coupon-claim', label: '券与团购线索承接', status: 'provider-gated', owner: 'ops', signalCount: 0, firstRunnableTask: '核销跟进前先确认券规则和领取汇总。' },
                  { id: 'private-domain', label: '私域咨询跟进', status: 'blocked', owner: 'community-ops', signalCount: 0, firstRunnableTask: '归类咨询主题汇总，起草给员工发送的已审回复。' },
                  { id: 'visit-intent', label: '公开到店意向承接', status: 'provider-gated', owner: 'store-manager', signalCount: 0, firstRunnableTask: '把公开凭证变成备餐和下一轮内容任务。' },
                  { id: 'review-recovery', label: '差评驱动的挽回跟进', status: 'provider-gated', owner: 'runtime-admin', signalCount: 0, firstRunnableTask: '平台回复前先定恢复负责人和已审回复稿。' },
                ]).slice(0, 5).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{formatRuntimeNarrative(item.label)}</span>
                      <span className={item.status === 'sample-ready' || item.status === 'internal-ready' ? 'text-[10px] text-emerald-100/70' : item.status === 'blocked' ? 'text-[10px] text-rose-100/70' : 'text-[10px] text-amber-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-indigo-100/55">{formatRuntimeOwner(item.owner)} / 信号数 {item.signalCount}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/50">{formatRuntimeNarrative(item.firstRunnableTask)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.leadAcquisitionProviderWorkbench?.operatorQueue || [
                  { id: 'lead-provider-reservation', owner: 'merchant', priority: 'blocked', action: '按预约、券码、私域或评价来源收店长授权。', evidenceRequired: '授权范围 / 允许来源清单', providerRequired: ['预约平台接口或导出'] },
                  { id: 'lead-provider-callback', owner: 'runtime-admin', priority: 'blocked', action: '试跑交接前先配回执配置和回执字段。', evidenceRequired: '线索确认回执', providerRequired: ['签名回执配置'] },
                  { id: 'lead-provider-private-domain', owner: 'runtime-admin', priority: 'blocked', action: '消息通道和去隐私约定复核前，用人工汇总。', evidenceRequired: '去隐私私域数据约定', providerRequired: ['企业微信/微信/短信通道'] },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-white/[0.04] p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-white">{formatRuntimeOwner(item.owner)}</span>
                      <span className={item.priority === 'blocked' ? 'text-[10px] text-rose-100/70' : item.priority === 'today' ? 'text-[10px] text-emerald-100/70' : 'text-[10px] text-amber-100/70'}>{formatRuntimeStatus(item.priority)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/60">{formatRuntimeNarrative(item.action)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-indigo-100/50">凭证: {formatRuntimeEvidenceValue(item.evidenceRequired)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/45">账号资料: {formatRuntimeSchemaList(item.providerRequired.slice(0, 2), '无')}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-indigo-100/55">
                复核规则: {formatRuntimeSchemaLabel(dispatchState.leadAcquisitionProviderWorkbench?.providerAcceptanceContract.callbackAction || 'lead-acquisition-receipt')} / 禁止: {formatRuntimeSchemaList((dispatchState.leadAcquisitionProviderWorkbench?.providerAcceptanceContract.forbiddenPayloadFields || ['phone', 'WeChat ID', '私信原文', 'coupon code']).slice(0, 5), '无')}
              </p>
            </div>
            <div className="mt-3 border border-cyan-200/15 bg-cyan-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/65">线索样例复核流</div>
                  <p className="mt-1 text-xs font-black text-white">试跑交接有一条受控路径：脱敏任务包、线索确认回执、异常回执恢复、员工审核和只进汇总的记忆门槛。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  产品靠这条路把线索承接做成可复核流程，凭证复核之前不触达顾客、不补全会员、不写记忆。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">结论</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.leadSandboxAcceptanceFlow?.verdict || 'waiting-provider-setup')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">交接</div>
                  <div className="mt-1 text-xs font-black text-cyan-100/75">{formatRuntimeGate(dispatchState.leadSandboxAcceptanceFlow?.summary.canSubmitProviderPackage, '样例待复核')}</div>
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
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.leadSandboxAcceptanceFlow?.leadMemoryGate.status || 'waiting-receipt')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">线索承接</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{formatRuntimeGate(dispatchState.leadSandboxAcceptanceFlow?.summary.canClaimAutoAcquisition, '凭证待复核', '待补凭证')}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.leadSandboxAcceptanceFlow?.stages || [
                  { id: 'sanitized-package', label: '脱敏线索任务包', status: 'passed', owner: 'ops', evidence: ['只含汇总字段'], nextAction: '只发来源数量汇总、负责人任务和凭证编号。', stopLine: '不带个人信息、私信、券码和原始档案。' },
                  { id: 'signed-lead-receipt', label: '线索确认回执复核', status: 'waiting-proof', owner: 'runtime-admin', evidence: ['暂无待复核线索回执'], nextAction: '导入一份线索确认回执。', stopLine: '未签名回执解锁不了记忆写入。' },
                  { id: 'memory-write-boundary', label: '线索汇总记忆写入', status: 'waiting-proof', owner: 'data-ops', evidence: ['需要待复核回执'], nextAction: '回执复核之前不写记忆。', stopLine: '永远不把顾客原始身份写进记忆。' },
                ]).slice(0, 6).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{formatRuntimeNarrative(item.label)}</span>
                      <span className={item.status === 'passed' ? 'text-[10px] text-emerald-100/70' : item.status === 'blocked' ? 'text-[10px] text-rose-100/70' : 'text-[10px] text-amber-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-cyan-100/55">{formatRuntimeOwner(item.owner)} / {formatRuntimeSchemaList(item.evidence.slice(0, 2), '无')}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/50">{formatRuntimeNarrative(item.nextAction)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/45">{formatRuntimeNarrative(item.stopLine)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-2">
                <div className="border border-white/10 bg-white/[0.04] p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">脱敏任务包</div>
                  <p className="mt-1 font-mono text-[11px] leading-4 text-cyan-100/60">
                    线索样例交接包 / {formatRuntimeSchemaLabel(dispatchState.leadSandboxAcceptanceFlow?.sanitizedProviderPackage.callbackAction || 'lead-acquisition-receipt')}
                  </p>
                  <p className="mt-1 text-[11px] leading-4 text-white/45">
                    链路: {formatRuntimeSchemaList((dispatchState.leadSandboxAcceptanceFlow?.sanitizedProviderPackage.lanes || []).map(item => item.id).slice(0, 5), '预约 / 领券线索 / 私域咨询 / 到店意向 / 差评挽回')}
                  </p>
                </div>
                <div className="border border-white/10 bg-white/[0.04] p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">记忆门槛</div>
                  <p className="mt-1 font-mono text-[11px] leading-4 text-cyan-100/60">{dispatchState.leadSandboxAcceptanceFlow?.leadMemoryGate.writeMode ? '仅在待复核回执后写入脱敏汇总记忆' : '仅在待复核回执后写入脱敏汇总记忆'}</p>
                  <p className="mt-1 text-[11px] leading-4 text-white/60">{formatRuntimeNarrative(dispatchState.leadSandboxAcceptanceFlow?.leadMemoryGate.nextAction || '写记忆前先收待复核的线索回执。')}</p>
                  <p className="mt-1 text-[11px] leading-4 text-rose-100/45">禁止: {formatRuntimeSchemaList((dispatchState.leadSandboxAcceptanceFlow?.leadMemoryGate.forbiddenFields || ['phone', 'WeChat ID', '私信原文', 'coupon code']).slice(0, 5), '无')}</p>
                </div>
              </div>
            </div>
            <div className="mt-3 border border-emerald-200/15 bg-emerald-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/65">今日指挥台</div>
                  <p className="mt-1 text-xs font-black text-white">默认路径把门店经营面收成四条链路：到店线索、发布凭证、核销/收银、复盘/训练。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  操作员只看到一个下一步、一个负责人和一个凭证条件，不用在专家模块里翻找。
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
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">可先准备</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.todayCommandCockpit?.summary.runNow ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">凭证</div>
                  <div className="mt-1 text-xs font-black text-amber-100/75">{dispatchState.todayCommandCockpit?.summary.needsProof ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">账号资料</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.todayCommandCockpit?.summary.providerGated ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">交接边界</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{formatRuntimeGate(dispatchState.todayCommandCockpit?.summary.canClaimAutoAcquisition || dispatchState.todayCommandCockpit?.summary.canClaimAutoPublish, '凭证待复核', '待补凭证')}</div>
                </div>
              </div>
              <div className="mt-3 border border-white/10 bg-white/[0.04] p-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">下一步最优动作</div>
                <p className="mt-1 text-xs font-black text-white">{formatRuntimeNarrative(dispatchState.todayCommandCockpit?.nextBestAction.action || '标记试跑交接之前，先补账号资料或收待复核凭证。')}</p>
                <p className="mt-1 text-[11px] leading-4 text-emerald-100/55">
                  负责人: {formatRuntimeOwner(dispatchState.todayCommandCockpit?.nextBestAction.owner || 'runtime-admin')} / 原因: {formatRuntimeNarrative(dispatchState.todayCommandCockpit?.nextBestAction.reason || '账号配置和凭证条件还没齐。')}
                </p>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-4">
                {(dispatchState.todayCommandCockpit?.lanes || [
                  { id: 'get-customers', title: '把客人带进店', status: 'provider-gated', owner: 'community-ops', businessQuestion: '预约、领券和咨询能否变成店长可见任务？', todayAction: '生成员工复核的线索跟进任务。', proofToCollect: ['线索确认回执'], providerGate: ['店长授权'], acceptance: '已有待复核回执和员工确认。', stopLine: '不触达顾客。', sourceEvidence: ['leadFlow:waiting-provider'] },
                  { id: 'publish-proof', title: '有凭证槽才发布', status: 'needs-proof', owner: 'ops', businessQuestion: '内容能否用公开凭证收尾？', todayAction: '准备内容和凭证槽。', proofToCollect: ['公开链接或截图编号'], providerGate: ['隔离试跑通道'], acceptance: '收尾前必须有凭证编号。', stopLine: '不能标记已发布。', sourceEvidence: ['publishInbox:waiting-receipt'] },
                  { id: 'redeem-and-pos', title: '核销优惠码并导入收银汇总', status: 'blocked', owner: 'finance', businessQuestion: '核销和销售能否只用汇总数据解释？', todayAction: '导入脱敏的收银和优惠码汇总字段。', proofToCollect: ['领券数', '到店核销数'], providerGate: ['收银/优惠码字段说明表'], acceptance: '汇总导入待复核。', stopLine: '不收收银明细。', sourceEvidence: ['operatingInsight:provider-gated'] },
                  { id: 'review-and-train', title: '复盘班次并训练助手', status: 'waiting-proof', owner: 'store-manager', businessQuestion: '下一班能否复用待复核凭证？', todayAction: '用凭证和训练闭环。', proofToCollect: ['待复核回执'], providerGate: ['训练记录'], acceptance: '下一班有一个明确动作。', stopLine: '不用未核验凭证做训练。', sourceEvidence: ['shiftLoop:waiting-proof'] },
                ]).slice(0, 4).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{formatRuntimeNarrative(item.title)}</span>
                      <span className={item.status === 'run-now' ? 'text-[10px] text-emerald-100/70' : item.status === 'blocked' ? 'text-[10px] text-rose-100/70' : item.status === 'provider-gated' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-cyan-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-emerald-100/55">{formatRuntimeOwner(item.owner)} / {formatRuntimeNarrative(item.businessQuestion)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/50">{formatRuntimeNarrative(item.todayAction)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-cyan-100/45">凭证: {formatRuntimeSchemaList(item.proofToCollect.slice(0, 3), '无')}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-emerald-100/55">
                凭证台账规则: 仅在待复核凭证或脱敏汇总后写入台账 / 拒收: {formatRuntimeSchemaList((dispatchState.todayCommandCockpit?.proofLedgerContract.rejectedProof || ['样例链接', '未签名回执', '私信原文', '收银明细（不接收）']).slice(0, 4), '无')}
              </p>
            </div>
            <div className="mt-3 border border-lime-200/15 bg-lime-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/65">试跑交接约定包</div>
                  <p className="mt-1 text-xs font-black text-white">试跑交接拆成六份约定：试跑通道、平台凭证、线索承接、员工下发、收银核销和复盘助手。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  这就是具体的账号资料清单，服务端配置、店长授权、回执事件、样例复核，以及对接缺失时的本地兜底。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">结论</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.providerAdapterContractPack?.verdict || 'server-keys-first')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">交接通道</div>
                  <div className="mt-1 text-xs font-black text-lime-100/75">{dispatchState.providerAdapterContractPack?.summary.adapters ?? 6}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">资料可复核</div>
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
                  <div className="mt-1 text-xs font-black text-rose-100/75">{formatRuntimeGate(dispatchState.providerAdapterContractPack?.summary.canClaimCompetitorParity, '凭证待复核', '待补凭证')}</div>
                </div>
              </div>
              <div className="mt-3 border border-white/10 bg-white/[0.04] p-2">
                <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">第一个要配置的通道</div>
                <p className="mt-1 text-xs font-black text-white">{formatRuntimeNarrative(dispatchState.providerAdapterContractPack?.firstProviderToConfigure.action || '先配置隔离试跑交接通道：账号资料检查通过后，再做签名回执探测。')}</p>
                <p className="mt-1 text-[11px] leading-4 text-lime-100/55">
                  负责人: {formatRuntimeOwner(dispatchState.providerAdapterContractPack?.firstProviderToConfigure.owner || 'runtime-admin')} / 凭证: {formatRuntimeSchemaList((dispatchState.providerAdapterContractPack?.firstProviderToConfigure.evidenceRequired || ['脱敏交接包待复核', '返回试跑回执编号', '签名回执待复核']).slice(0, 3), '无')}
                </p>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.providerAdapterContractPack?.adapters || [
                    { id: 'runtime-browser-agent', label: '隔离试跑交接通道', status: 'needs-server-key', owner: 'runtime-admin', providerChoices: ['隔离试跑通道', '常驻试跑通道', '试跑任务交接通道'], requiredEnvKeys: ['试跑通道地址', '签名回执配置'], merchantGrant: ['操作员确认'], callbackEvents: ['试跑回执'], healthCheck: '账号资料复核检查', sandboxAcceptance: ['返回试跑回执编号'], unlocks: ['试跑任务交接'], fallbackNow: '先手工生成操作清单。', stopLine: '不读取登录状态、账号配置值或原始资料。' },
                  { id: 'platform-publish-proof', label: '点评 / 小红书 / 抖音 / 微信发布凭证', status: 'needs-merchant-auth', owner: 'merchant', providerChoices: ['店长授权范围', '授权待复核范围'], requiredEnvKeys: ['签名回执配置'], merchantGrant: ['授权范围'], callbackEvents: ['签名回执'], healthCheck: '缺店长授权', sandboxAcceptance: ['公开链接或截图编号'], unlocks: ['发布回执收件箱'], fallbackNow: '先人工导入公开凭证。', stopLine: '没有凭证不能标记已发布。' },
                  { id: 'pos-redemption', label: '收银、优惠码核销和经营数据', status: 'needs-data-contract', owner: 'data-ops', providerChoices: ['收银汇总表', '优惠码导出'], requiredEnvKeys: ['收银数据模式'], merchantGrant: ['字段表'], callbackEvents: ['收银汇总导入待复核'], healthCheck: '缺收银模式/字段表', sandboxAcceptance: ['领券数', '到店核销数'], unlocks: ['经营汇总复盘'], fallbackNow: '先人工导入脱敏汇总表。', stopLine: '不收收银明细。' },
                ]).slice(0, 6).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{formatRuntimeNarrative(item.label)}</span>
                      <span className={item.status === 'ready-to-test' ? 'text-[10px] text-emerald-100/70' : item.status === 'blocked' ? 'text-[10px] text-rose-100/70' : 'text-[10px] text-amber-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-lime-100/55">{formatRuntimeOwner(item.owner)} / {formatRuntimeSchemaList(item.providerChoices.slice(0, 3))}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/50">服务端配置项: {formatSetupItemCount(item.requiredEnvKeys, '资料可复核')}</p>
                    <p className="mt-1 text-[11px] leading-4 text-rose-100/45">{formatRuntimeNarrative(item.stopLine)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-lime-100/55">
                账号安全：只允许服务端安全保存；页面不展示、不收集账号配置值。绝不收集: {formatRuntimeSchemaList((dispatchState.providerAdapterContractPack?.providerSecretPolicy.neverCollectInClient || ['账号配置值', '登录状态', '私密登录信息', '收银明细（不接收）']).slice(0, 5))}
              </p>
              <div className="mt-3 border border-teal-200/15 bg-teal-200/[0.035] p-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-100/65">试跑通道配置台</div>
                    <p className="mt-1 text-xs font-black text-white">选择模拟试跑或试跑交接通道，并列清楚还缺哪些账号配置、门店授权和回执凭证。</p>
                    <p className="mt-1 text-[11px] leading-4 text-teal-100/55">推荐配置: 先用样例试跑通道 / {formatRuntimeStatus(dispatchState.providerAdapterConfigWorkbench?.recommended.mode || 'sandbox-simulator')}</p>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">试跑交接</div>
                    <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.providerAdapterConfigWorkbench?.summary.canSubmitRealProviderNow)}</div>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">资料可复核</div>
                    <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.providerAdapterConfigWorkbench?.summary.realProviderReady ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">模拟器</div>
                    <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.providerAdapterConfigWorkbench?.summary.simulatorReady ?? 3}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待补账号资料</div>
                    <div className="mt-1 text-xs font-black text-amber-100/75">{dispatchState.providerAdapterConfigWorkbench?.summary.missingEnvKeys ?? 4}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">交接复核</div>
                    <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.providerAdapterConfigWorkbench?.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  {(dispatchState.providerAdapterConfigWorkbench?.targets || [
                    { target: 'lobu', label: '试跑通道 A（事件型通道）', mode: 'sandbox-simulator', status: 'missing-runtime', submitAllowed: false, simulatorAllowed: true, endpointEnv: 'RESTAURANT_AGENT_LOBU_RUNTIME_URL', apiKeyEnv: 'RESTAURANT_AGENT_LOBU_API_KEY', submitPath: '/events', healthPath: '/health', configuredEvidence: ['adapter:needs-runtime-config'], missingEnvKeys: ['RESTAURANT_AGENT_LOBU_RUNTIME_URL', 'RESTAURANT_AGENT_LOBU_API_KEY'], missingBusinessEvidence: ['店长授权'], callbackRequired: ['external-receipt'], acceptanceEvidence: ['externalRunId'], firstTest: '先跑模拟时间线，试跑交接前先收齐通道账号。', stopLine: '没有通道账号、店长授权和回执，不承诺交接待复核。' },
                    { target: 'openclaw', label: '试跑通道 B（隔离试跑通道）', mode: 'sandbox-simulator', status: 'missing-runtime', submitAllowed: false, simulatorAllowed: true, endpointEnv: 'RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', apiKeyEnv: 'RESTAURANT_AGENT_OPENCLAW_API_KEY', submitPath: '/tasks', healthPath: '/health', configuredEvidence: ['adapter:needs-runtime-config'], missingEnvKeys: ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', 'RESTAURANT_AGENT_OPENCLAW_API_KEY'], missingBusinessEvidence: ['店长授权'], callbackRequired: ['external-receipt'], acceptanceEvidence: ['externalRunId'], firstTest: '先跑模拟时间线，试跑交接前先收齐通道账号。', stopLine: '没有通道账号、店长授权和回执，不承诺交接待复核。' },
                    { target: 'hermes', label: '试跑通道 C（常驻通道）', mode: 'sandbox-simulator', status: 'missing-runtime', submitAllowed: false, simulatorAllowed: true, endpointEnv: 'RESTAURANT_AGENT_HERMES_RUNTIME_URL', apiKeyEnv: 'RESTAURANT_AGENT_HERMES_API_KEY', submitPath: '/runs', healthPath: '/health', configuredEvidence: ['adapter:needs-runtime-config'], missingEnvKeys: ['RESTAURANT_AGENT_HERMES_RUNTIME_URL', 'RESTAURANT_AGENT_HERMES_API_KEY'], missingBusinessEvidence: ['店长授权'], callbackRequired: ['external-receipt'], acceptanceEvidence: ['externalRunId'], firstTest: '先跑模拟时间线，试跑交接前先收齐通道账号。', stopLine: '没有通道账号、店长授权和回执，不承诺交接待复核。' },
                  ]).map(target => (
                    <div className="border border-white/10 bg-stone-950/45 p-2" key={target.target}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{formatRuntimeNarrative(target.label)}</span>
                        <span className={target.submitAllowed ? 'text-[10px] text-emerald-100/70' : target.simulatorAllowed ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(target.mode)}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-teal-100/55">{formatRuntimeStatus(target.status)} / 试跑通道地址和回执入口待配置</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/35">还缺: {formatSetupItemCount(target.missingEnvKeys, formatRuntimeSchemaList(target.missingBusinessEvidence.slice(0, 2), '资料可复核'))}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(target.firstTest)}</p>
                      <p className="mt-1 text-[11px] leading-4 text-rose-100/45">{formatRuntimeNarrative(target.stopLine)}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-teal-100/55">
                  账号配置需求: {(dispatchState.providerAdapterConfigWorkbench?.providerOfTheKeyRequest || [{ owner: '技术复核', giveThis: ['试跑通道地址', '试跑通道账号', '回执配置'], unlocks: ['样例交接'] }]).map(item => `${formatRuntimeOwner(item.owner)}: ${formatSetupItemCount(item.giveThis, '资料可复核')}`).join(' | ')}
                </p>
              </div>
              <div className="mt-3 border border-cyan-200/15 bg-cyan-200/[0.035] p-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/65">店长授权包</div>
                    <p className="mt-1 text-xs font-black text-white">试跑交接前，可直接转发给店长的授权范围包，覆盖点评/美团、小红书、抖音、微信社群和收银核销数据。</p>
                    <p className="mt-1 text-[11px] leading-4 text-cyan-100/55">结论: {formatRuntimeStatus(dispatchState.merchantAuthorizationPacket?.verdict || 'merchant-auth-required')} / 门店: {dispatchState.merchantAuthorizationPacket?.restaurant || runtimeIntake.restaurant}</p>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">试跑交接</div>
                    <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.merchantAuthorizationPacket?.summary.canEnableRealProviderSubmit, '店长已复核', '待店长确认')}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">授权范围</div>
                    <div className="mt-1 text-xs font-black text-cyan-100/75">{dispatchState.merchantAuthorizationPacket?.summary.scopes ?? 5}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">可签范围</div>
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
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">边界</div>
                    <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.merchantAuthorizationPacket?.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-5">
                  {(dispatchState.merchantAuthorizationPacket?.scopes || [
                    { id: 'dianping-meituan', label: '大众点评 / 美团本地生活账号', owner: 'merchant', status: 'missing-merchant-grant', allowedActions: ['准备发布草稿'], forbiddenActions: ['读取私信原文'], requiredFields: ['账号负责人', '门店公开主页链接', '授权范围'], dataScope: ['公开发布链接', '公开截图'], expiryRule: '试跑交接前店长必须选定授权有效期。', revocationRule: '撤销授权后降级为草稿/人工模式。', acceptanceEvidence: ['发布链接', '截图编号'], providerCallbackRequired: ['签名回执规则'], nextAction: '店长先确认账号范围、有效期和撤销规则，再进入试跑交接。', stopLine: '没签授权和回执，不能标记已发布。' },
                    { id: 'xiaohongshu', label: '小红书门店内容账号', owner: 'merchant', status: 'missing-merchant-grant', allowedActions: ['准备发布草稿'], forbiddenActions: ['读取私信原文'], requiredFields: ['账号昵称', '审核负责人'], dataScope: ['待复核草稿', '公开笔记链接'], expiryRule: '试跑交接前店长必须选定授权有效期。', revocationRule: '撤销授权后降级为草稿/人工模式。', acceptanceEvidence: ['笔记链接', '截图编号'], providerCallbackRequired: ['签名回执规则'], nextAction: '店长先确认账号范围、有效期和撤销规则，再进入试跑交接。', stopLine: '没签授权和回执，不能标记已发布。' },
                    { id: 'douyin', label: '抖音本地内容账号', owner: 'merchant', status: 'missing-merchant-grant', allowedActions: ['准备发布草稿'], forbiddenActions: ['读取私信原文'], requiredFields: ['账号昵称', '团购范围'], dataScope: ['待复核视频文案', '公开视频链接'], expiryRule: '试跑交接前店长必须选定授权有效期。', revocationRule: '撤销授权后降级为草稿/人工模式。', acceptanceEvidence: ['视频链接', '内容编号'], providerCallbackRequired: ['签名回执规则'], nextAction: '店长先确认账号范围、有效期和撤销规则，再进入试跑交接。', stopLine: '没签授权和回执，不能标记已发布。' },
                    { id: 'wechat-community', label: '微信社群人工交接', owner: 'operator', status: 'missing-merchant-grant', allowedActions: ['准备发布草稿'], forbiddenActions: ['读取私信原文'], requiredFields: ['社群负责人', '交接负责人'], dataScope: ['待复核群文案', '咨询数量汇总'], expiryRule: '试跑交接前店长必须选定授权有效期。', revocationRule: '撤销授权后降级为草稿/人工模式。', acceptanceEvidence: ['人工截图编号'], providerCallbackRequired: ['签名回执规则'], nextAction: '运营先确认社群人工交接范围。', stopLine: '不读私信原文。' },
                    { id: 'pos-redemption', label: '收银 / 券码核销数据约定', owner: 'data-ops', status: 'missing-data-contract', allowedActions: ['准备发布草稿'], forbiddenActions: ['收银明细（不接收）'], requiredFields: ['数据模式', '字段表', '核销来源'], dataScope: ['脱敏汇总行'], expiryRule: '试跑交接前店长必须选定授权有效期。', revocationRule: '撤销后停止导入。', acceptanceEvidence: ['字段表编号', '导入批次编号'], providerCallbackRequired: ['签名回执规则'], nextAction: '提供收银数据模式、字段表和脱敏汇总样例。', stopLine: '没有数据约定，不拉收银明细、不能标记复盘结论。' },
                  ]).map(scope => (
                    <div className="border border-white/10 bg-stone-950/45 p-2" key={scope.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{formatRuntimeNarrative(scope.label)}</span>
                        <span className={scope.status === 'ready-to-sign' ? 'text-[10px] text-emerald-100/70' : scope.status === 'missing-data-contract' ? 'text-[10px] text-violet-100/70' : scope.status === 'runtime-callback-blocked' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-amber-100/70'}>{formatRuntimeStatus(scope.status)}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-cyan-100/55">负责人: {formatRuntimeOwner(scope.owner)} / 凭证: {formatRuntimeSchemaList(scope.acceptanceEvidence.slice(0, 2), '无')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/45">需要字段: {formatRuntimeSchemaList(scope.requiredFields.slice(0, 3), '无')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(scope.nextAction)}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-cyan-100/55">
                  交接资料: {(dispatchState.merchantAuthorizationPacket?.providerHandOff.giveProvider || ['授权范围编号和待复核动作清单', '门店公开链接或账号昵称', '回执地址和签名规则名称']).slice(0, 4).map(formatRuntimeNarrative).join(' / ')}
                </p>
              </div>
              <div className="mt-3 border border-indigo-200/15 bg-indigo-200/[0.035] p-3">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-indigo-100/65">第一次样例试跑</div>
                    <p className="mt-1 text-xs font-black text-white">选一个店长授权范围、一个脱敏任务包和一条试跑通道，保持打开直到签名回执决定下一轮能否训练。</p>
                    <p className="mt-1 text-[11px] leading-4 text-indigo-100/55">当前选择: {dispatchState.firstProviderSandboxRunConsole?.selectedRun.scopeLabel || '大众点评 / 美团本地生活账号'} / 样例试跑通道</p>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 px-3 py-2 text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">首跑</div>
                    <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.firstProviderSandboxRunConsole?.summary.canStartFirstSandboxRun, '样例可先准备')}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">结论</div>
                    <div className="mt-1 text-xs font-black text-white">{formatRuntimeStatus(dispatchState.firstProviderSandboxRunConsole?.verdict || 'sign-merchant-scope-first')}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">资料可复核</div>
                    <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.firstProviderSandboxRunConsole?.summary.ready ?? 0}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待补资料</div>
                    <div className="mt-1 text-xs font-black text-rose-100/75">{dispatchState.firstProviderSandboxRunConsole?.summary.blocked ?? 4}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">等待</div>
                    <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.firstProviderSandboxRunConsole?.summary.waiting ?? 1}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">训练</div>
                    <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.firstProviderSandboxRunConsole?.summary.canTrainNextRun, '凭证待复核', '待补凭证')}</div>
                  </div>
                  <div className="border border-white/10 bg-stone-950/45 p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">边界</div>
                    <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.firstProviderSandboxRunConsole?.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-6">
                  {(dispatchState.firstProviderSandboxRunConsole?.steps || [
                    { id: 'merchant-scope', label: '店长先签一个授权范围', status: 'blocked', owner: 'merchant', evidence: ['授权范围', '有效期'], nextAction: '店长先确认一个平台的授权范围。', stopLine: '没签授权范围，不做平台动作。' },
                    { id: 'provider-choice', label: '选择试跑交接通道', status: 'blocked', owner: 'runtime-admin', evidence: ['试跑通道', '回执'], nextAction: '配置试跑通道地址、账号、隔离环境和回执。', stopLine: '没有通道配置，不承诺交接待复核。' },
                    { id: 'submit-package', label: '选择脱敏交接包', status: 'blocked', owner: 'ops', evidence: ['脱敏交接包'], nextAction: '先准备脱敏交接包。', stopLine: '不带账号配置值和隐私数据。' },
                    { id: 'dispatch', label: '交接一次样例试跑', status: 'blocked', owner: 'ops', evidence: ['交给试跑通道'], nextAction: '前置条件补齐并复核后再交接。', stopLine: '交接不等于完成。' },
                    { id: 'signed-callback', label: '等签名回执', status: 'blocked', owner: 'runtime-admin', evidence: ['签名回执'], nextAction: '等待签名回执到达。', stopLine: '未签名回执拒收。' },
                    { id: 'closeout-training', label: '收尾并训练下一轮', status: 'waiting', owner: 'store-manager', evidence: ['仅限待复核凭证'], nextAction: '只用待复核凭证做训练。', stopLine: '不用隐私或原始收银数据训练。' },
                  ]).map(step => (
                    <div className="border border-white/10 bg-stone-950/45 p-2" key={step.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{formatRuntimeNarrative(step.label)}</span>
                        <span className={step.status === 'ready' ? 'text-[10px] text-emerald-100/70' : step.status === 'accepted' ? 'text-[10px] text-lime-100/70' : step.status === 'waiting' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(step.status)}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-4 text-indigo-100/55">负责人: {formatRuntimeOwner(step.owner)}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/45">{formatRuntimeSchemaList(step.evidence.slice(0, 3), '待补凭证')}</p>
                      <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(step.nextAction)}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-indigo-100/55">
                  交接规则: 仅在服务端试跑通道配置项齐全后交接，并按签名回执规则回填复核凭证。
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
                  <p className="mt-1 text-xs font-black text-white">默认路径最终落在一个操作台，今日运营、经营建议复核、试跑交接准备和凭证复核。</p>
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
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">交接</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.aiCockpit?.summary.canClaimAutomation, '凭证待复核', '待补凭证')}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-4">
                {(dispatchState.aiCockpit?.zones || [
                  { id: 'today-operations', title: '今日门店运营', status: 'provider-gated', owner: 'store-manager', answer: '开工前确认套餐、服务时段、负责人和凭证要求。', primaryAction: '运行门店经营计划。', visibleProof: ['负责人和凭证要求'], providerGate: '店长凭证和资料解锁', stopLine: '门店边界没确认不推需求。' },
                  { id: 'ai-consultant', title: '经营建议复核', status: 'needs-evidence', owner: 'ops', answer: '把建议变成负责人可见的打法。', primaryAction: '生成经营顾问处方。', visibleProof: ['负责人可见打法'], providerGate: '训练材料和凭证', stopLine: '建议有凭证才变成任务。' },
                    { id: 'automation-launch', title: '试跑交接准备', status: 'provider-gated', owner: 'runtime-admin', answer: '选择一个试跑通道，先跑签名样例回执。', primaryAction: '配置账号、门店授权、回执和数据规则。', visibleProof: ['试跑启动看板'], providerGate: '试跑通道和回执', stopLine: '没有回执，不承诺交接待复核。' },
                  { id: 'evidence-review', title: '凭证复核', status: 'needs-evidence', owner: 'finance', answer: '收尾只用公开凭证和脱敏经营汇总。', primaryAction: '导入待复核凭证和汇总行。', visibleProof: ['待复核回执'], providerGate: '收银/券码字段说明表', stopLine: '不碰原始收银数据和顾客身份信息。' },
                ]).slice(0, 4).map(zone => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={zone.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{formatRuntimeLabel(zone.title)}</span>
                      <span className={zone.status === 'ready-internal' ? 'text-[10px] text-emerald-100/70' : zone.status === 'needs-evidence' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(zone.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(zone.answer)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-fuchsia-100/55">动作: {formatRuntimeNarrative(zone.primaryAction)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">条件: {formatRuntimeNarrative(zone.providerGate)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-fuchsia-100/55">
                每日执行清单: {(dispatchState.aiCockpit?.primaryRunbook || ['先打开今日门店经营，确认门店凭证。', '试跑交接逐项通过账号、授权和回执检查。', '用公开凭证或脱敏汇总做凭证复核。']).slice(0, 3).map(formatRuntimeNarrative).join(' / ')}
              </p>
            </div>
            <div className="mt-3 border border-lime-200/15 bg-lime-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-lime-100/65">预约核销收尾闭环</div>
                  <p className="mt-1 text-xs font-black text-white">默认路径把预约和领券闭环到收银汇总导入、核销复盘和下一班动作。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  只用脱敏汇总行，不碰联系电话、会员号、原始订单行、支付凭证号、优惠码和私聊内容。
                </p>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-6">
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">收银行</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.posImport?.summary.validRows ?? 2}/{dispatchState.posImport?.summary.totalRows ?? 2}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">预约</div>
                  <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.businessSignals?.summary.reservations ?? dispatchState.controlledTrialRun?.businessSignals.summary.reservations ?? 0}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">领券数</div>
                  <div className="mt-1 text-xs font-black text-white">{dispatchState.posImport?.summary.couponClaimCount ?? 50}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">到店核销数</div>
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
                  { id: 'coupon-redemption-rate', label: '领券到核销转化率', status: 'measured', value: '58% (29/50)', evidence: ['sanitized POS aggregate'], interpretation: '由脱敏汇总行计算。', nextAction: '改套餐前先确认券的时间窗。' },
                  { id: 'order-sales-aggregate', label: '订单与销售额汇总', status: 'measured', value: '订单 58 单 / 销售额 4456.00', evidence: ['accepted imports=1'], interpretation: '可作为汇总凭证使用。', nextAction: '对比接待容量和备货情况。' },
                  { id: 'prep-inventory-pressure', label: '备餐与库存压力', status: 'directional', value: '29 份', evidence: ['inventoryUsed aggregate'], interpretation: '缺货和损耗口径确认前仅供参考。', nextAction: '确认备餐批次口径。' },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{formatRuntimeNarrative(item.label)}</span>
                      <span className={item.status === 'measured' ? 'text-[10px] text-emerald-100/70' : item.status === 'directional' ? 'text-[10px] text-sky-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-lime-100/60">{formatRuntimeEvidenceValue(item.value, '待补资料')}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(item.nextAction)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-lime-100/55">
                下一班动作: {(dispatchState.nextLoopChannelPlan?.scheduledActions || [
                  { action: '根据待复核回执和收银汇总安排备餐任务。' },
                  { action: '根据到店意向汇总起草店长审核的社群跟进。' },
                  { action: '通道、店长授权和收银数据约定配齐之前，试跑交接保持关闭。' },
                ]).slice(0, 3).map(item => formatRuntimeNarrative(item.action)).join(' / ')}
              </p>
            </div>
            <div className="mt-3 border border-cyan-200/15 bg-cyan-200/[0.035] p-3">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-cyan-100/65">口碑与服务恢复闭环</div>
                  <p className="mt-1 text-xs font-black text-white">公开评价、评论主题和服务问题会变成店长审核的回复、恢复任务和下一轮内容。</p>
                </div>
                <p className="max-w-3xl text-[11px] leading-4 text-white/45">
                  店长授权、平台同步、回执凭证和告知边界没齐之前，回评交接保持关闭。
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
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">本地可先准备</div>
                  <div className="mt-1 text-xs font-black text-emerald-100/75">{dispatchState.reputationCloseoutPack?.summary.internalReady ?? 2}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待补凭证</div>
                  <div className="mt-1 text-xs font-black text-sky-100/75">{dispatchState.reputationCloseoutPack?.summary.needsPublicProof ?? 2}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">回评交接</div>
                  <div className="mt-1 text-xs font-black text-rose-100/75">{formatRuntimeGate(dispatchState.reputationCloseoutPack?.summary.canClaimAutoReviewReply, '店长已复核', '待店长确认')}</div>
                </div>
                <div className="border border-white/10 bg-stone-950/45 p-2">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">分析</div>
                  <div className="mt-1 text-xs font-black text-white">{formatRuntimeGate(dispatchState.reputationCloseoutPack?.summary.canClaimReviewAnalytics, '凭证待复核', '待补凭证')}</div>
                </div>
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.reputationCloseoutPack?.themes || [
                  { id: 'taste-offer-fit', label: '菜品口味与套餐匹配', signal: 'unknown', operatorAction: '把口味说法写进内容前先收公开凭证。', staffScript: '推荐加购前确认供应和服务时段。' },
                  { id: 'wait-time-service', label: '等位与服务恢复', signal: 'mixed', operatorAction: '把排队处理和员工负责人挂到下一轮跟进。', staffScript: '说明预计等位时间，并给出明确的预约或自取替代方案。' },
                  { id: 'coupon-expectation', label: '券预期与核销清晰度', signal: 'risk', operatorAction: '判断券的摩擦前先导入脱敏券码/收银汇总。', staffScript: '客人到店前确认券有效期、不可用菜品和核销步骤。' },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-stone-950/45 p-2" key={item.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{formatRuntimeNarrative(item.label)}</span>
                      <span className={item.signal === 'positive' ? 'text-[10px] text-emerald-100/70' : item.signal === 'mixed' ? 'text-[10px] text-sky-100/70' : item.signal === 'risk' ? 'text-[10px] text-rose-100/70' : 'text-[10px] text-white/45'}>{formatRuntimeStatus(item.signal)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-cyan-100/60">{formatRuntimeNarrative(item.operatorAction)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/40">员工: {formatRuntimeNarrative(item.staffScript)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 grid gap-2 lg:grid-cols-3">
                {(dispatchState.reputationCloseoutPack?.responseDrafts || [
                  { platform: '点评/美团', status: 'staff-review', draft: '店长根据公开凭证复核最终回复。', proofNeeded: '公开评价/凭证链接或截图编号' },
                  { platform: '小红书/抖音', status: 'staff-review', draft: '只用待复核的菜品信息、照片和到店场景。', proofNeeded: '待复核的公开笔记/视频凭证和照片授权' },
                  { platform: '微信社群', status: 'provider-gated', draft: '只生成员工话术，不直接发送。', proofNeeded: '员工确认和告知边界' },
                ]).slice(0, 3).map(item => (
                  <div className="border border-white/10 bg-white/[0.04] p-2" key={item.platform}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-white">{formatRuntimeSchemaLabel(item.platform)}</span>
                      <span className={item.status === 'staff-review' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(item.status)}</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(item.draft)}</p>
                    <p className="mt-1 text-[11px] leading-4 text-white/35">凭证: {formatRuntimeEvidenceValue(item.proofNeeded)}</p>
                  </div>
                ))}
              </div>
              <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-[11px] leading-4 text-cyan-100/55">
                服务恢复: {(dispatchState.reputationCloseoutPack?.recoveryQueue || [
                  { action: '下一轮内容推送前先确认等位、库存和服务时段边界。' },
                  { action: '准备一份券有效期和核销步骤的员工回复话术。' },
                  { action: '店长授权配齐之前，回评交接和评论同步保持关闭。' },
                ]).slice(0, 3).map(item => formatRuntimeNarrative(item.action)).join(' / ')}
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
                    <p className="mt-1 text-white/55">资料可复核</p>
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
                    <div className="font-mono text-white">{formatRuntimeGate(dispatchState.clawExperienceDefaultPath.summary.canClaimExternalAutomation, '凭证待复核', '待补凭证')}</div>
                    <p className="mt-1 text-white/55">试跑交接</p>
                  </div>
                </div>
                <p className="mt-3 border border-white/10 bg-white/[0.04] p-2 text-xs leading-5 text-cyan-100/70">{formatRuntimeNarrative(dispatchState.clawExperienceDefaultPath.answerForCustomer)}</p>
                <div className="mt-3 grid gap-2 lg:grid-cols-7">
                  {dispatchState.clawExperienceDefaultPath.primaryPath.map(step => (
                    <div className="border border-white/10 bg-stone-950/50 p-2" key={step.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-black text-white">{formatRuntimeNarrative(step.label)}</span>
                        <span className={step.status === 'ready-now' ? 'text-[10px] text-emerald-100/70' : step.status === 'review-needed' ? 'text-[10px] text-sky-100/70' : step.status === 'training-needed' ? 'text-[10px] text-amber-100/70' : 'text-[10px] text-rose-100/70'}>{formatRuntimeStatus(step.status)}</span>
                      </div>
                      <p className="mt-2 text-[11px] leading-4 text-white/55">{formatRuntimeNarrative(step.customerAction)}</p>
                      <p className="mt-2 text-[11px] leading-4 text-white/35">凭证: {formatRuntimeEvidenceValue(step.evidenceRequired)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">可训练</div>
                    <p className="mt-2 text-[11px] leading-4 text-amber-100/65">{formatRuntimeSchemaList(dispatchState.clawExperienceDefaultPath.trainingNow.slice(0, 8), '无')}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">待补账号资料</div>
                    <p className="mt-2 text-[11px] leading-4 text-rose-100/65">{formatRuntimeSchemaList(dispatchState.clawExperienceDefaultPath.providerNeeded.slice(0, 8))}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.04] p-2">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">快捷动作</div>
                    <p className="mt-2 text-[11px] leading-4 text-white/45">{dispatchState.clawExperienceDefaultPath.quickActions.map(item => formatRuntimeNarrative(item.label)).join(' / ')}</p>
                    <p className="mt-2 text-[11px] leading-4 text-white/35">{formatRuntimeNarrative(dispatchState.clawExperienceDefaultPath.safetyBoundary)}</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 lg:grid-cols-2">
                  <div className="border border-emerald-200/20 bg-emerald-200/[0.04] p-3">
                    <div className="text-[10px] font-semibold tracking-[0.14em] text-emerald-100/65">需要店长补充</div>
                    <div className="mt-2 grid gap-2">
                      {dispatchState.clawExperienceDefaultPath.routeDecision.merchantInputsNeeded.slice(0, 6).map(item => (
                        <div className="border border-white/10 bg-stone-950/40 p-2 text-[11px] leading-4 text-white/60" key={item}>{formatRuntimeSchemaLabel(item)}</div>
                      ))}
                    </div>
                  </div>
                  <div className="border border-rose-200/20 bg-rose-200/[0.04] p-3">
                    <div className="text-[10px] font-semibold tracking-[0.14em] text-rose-100/65">试跑交接条件清单</div>
                    <div className="mt-2 grid gap-2">
                      {dispatchState.clawExperienceDefaultPath.routeDecision.providerKeyChecklist.slice(0, 6).map(item => (
                        <div className="border border-white/10 bg-stone-950/40 p-2 text-[11px] leading-4 text-white/60" key={item}>{formatRuntimeSchemaLabel(item)}</div>
                      ))}
                    </div>
                    <p className="mt-2 text-[11px] leading-4 text-rose-100/55">
                      只有账号确认、授权、回填凭证和数据边界都补齐并复核，才进入试跑交接。
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
              <span className="block text-[10px] uppercase tracking-[0.14em] text-white/40">6 账号资料缺口</span>
              列待补资料 / 授权
            </button>
          </div>
        </div>
        <details className="border border-white/10 bg-white/[0.03] p-4">
          <summary className="cursor-pointer text-sm font-black text-white">
            内部高级工具 · 展开试跑通道、补资料和训练工具
          </summary>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-200">试跑交接通道</p>
              <h3 className="mt-1 text-lg font-black">先接一个：本地任务已能排队</h3>
              <p className="mt-2 max-w-3xl text-xs leading-5 text-white/70">
                这个按钮会把浏览器发布检查转成门店事件、交接资料包、门店记忆和复核记录。
                检查试跑交接通道时，会先合成带授权范围、隔离会话、签名回执和停止条件的交接资料包；它不会打开平台账号，也不会读取私信、收银或核销后台。
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {intakePreview.map(item => (
                  <div className="border border-white/10 bg-white/5 px-3 py-2" key={item.label}>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">{formatRuntimeNarrative(item.label)}</div>
                    <div className="mt-1 truncate text-xs font-black text-white" title={formatRuntimeNarrative(item.value)}>{formatRuntimeNarrative(item.value)}</div>
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
              {dispatchState.status === 'loading' ? '入队中' : '生成本地试跑任务'}
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
              检查试跑交接通道
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
              整理训练材料
            </button>
            <button
              className="border border-lime-200/40 px-4 py-2 text-sm font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectClawSkillCatalog}
              type="button"
            >
              查看打法素材
            </button>
            <button
              className="border border-cyan-200/40 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildClawSkillWorkbench}
              type="button"
            >
              打开门店工单
            </button>
            <button
              className="border border-lime-200/40 px-4 py-2 text-sm font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectBenchmarkStrategy}
              type="button"
            >
              判断试跑路径
            </button>
            <button
              className="border border-lime-200/40 px-4 py-2 text-sm font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildActivationCockpit}
              type="button"
            >
              生成打法总览
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
              生成下轮训练包
            </button>
            <button
              className="border border-emerald-200/40 px-4 py-2 text-sm font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectPlatformOperatingSpine}
              type="button"
            >
              生成经营主链
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
              写入训练样本
            </button>
            <button
              className="border border-emerald-200/40 px-4 py-2 text-sm font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={runHeartbeat}
              type="button"
            >
              运行回执和跟进检查
            </button>
            <button
              className="border border-white/20 px-4 py-2 text-sm font-black text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={refreshReadiness}
              type="button"
            >
              检查账号资料条件
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
              生成异常恢复计划
            </button>
            <button
              className="border border-violet-200/40 px-4 py-2 text-sm font-black text-violet-100 transition hover:bg-violet-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildBrowserSession}
              type="button"
            >
              生成隔离试跑会话
            </button>
            <button
              className="border border-amber-200/40 px-4 py-2 text-sm font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildGrantManifest}
              type="button"
            >
              生成授权清单
            </button>
            <button
              className="border border-yellow-200/40 px-4 py-2 text-sm font-black text-yellow-100 transition hover:bg-yellow-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildGrantChecklist}
              type="button"
            >
              授权清单向导
            </button>
            <button
              className="border border-yellow-200/40 px-4 py-2 text-sm font-black text-yellow-100 transition hover:bg-yellow-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectActivationGates}
              type="button"
            >
              检查工单解锁条件
            </button>
            <button
              className="border border-yellow-200/40 px-4 py-2 text-sm font-black text-yellow-100 transition hover:bg-yellow-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectCompetitorAudit}
              type="button"
            >
              生成对标打法复核
            </button>
            <button
              className="border border-yellow-200/40 px-4 py-2 text-sm font-black text-yellow-100 transition hover:bg-yellow-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildCompetitorTrainingBlueprint}
              type="button"
            >
              对标准备清单
            </button>
            <button
              className="border border-yellow-200/40 px-4 py-2 text-sm font-black text-yellow-100 transition hover:bg-yellow-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectBuildQueue}
              type="button"
            >
              生成门店工单构建队列
            </button>
            <button
              className="border border-cyan-200/40 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectBrowserSessionHealth}
              type="button"
            >
              检查隔离试跑会话
            </button>
            <button
              className="border border-cyan-200/40 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildExecutionPackage}
              type="button"
            >
              生成试跑交接包
            </button>
            <button
              className="border border-cyan-200/40 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildBrowserRunbook}
              type="button"
            >
              生成浏览器操作清单
            </button>
            <button
              className="border border-cyan-200/40 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildBrowserRunnerContract}
              type="button"
            >
              生成试跑回执约定
            </button>
            <button
              className="border border-cyan-200/40 bg-cyan-200/10 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildBrowserGatewayPack}
              type="button"
            >
              试跑交接包
            </button>
            <button
              className="border border-cyan-200/40 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={recordBrowserRunnerEvent}
              type="button"
            >
              记录试跑步骤回执
            </button>
            <button
              className="border border-cyan-200/40 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectBrowserRunnerEventHealth}
              type="button"
            >
              查看试跑事件状态
            </button>
            <button
              className="border border-cyan-200/40 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={runCallbackSimulator}
              type="button"
            >
              运行回执模拟
            </button>
            <button
              className="border border-lime-200/40 px-4 py-2 text-sm font-black text-lime-100 transition hover:bg-lime-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectRunHealth}
              type="button"
            >
              检查试跑回执状态
            </button>
            <button
              className="border border-teal-200/40 px-4 py-2 text-sm font-black text-teal-100 transition hover:bg-teal-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectRuntimeProbe}
              type="button"
            >
              探测试跑通道健康
            </button>
            <button
              className="border border-teal-200/40 px-4 py-2 text-sm font-black text-teal-100 transition hover:bg-teal-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectRuntimeSetupContract}
              type="button"
            >
              试跑通道配置约定
            </button>
            <button
              className="border border-cyan-200/40 bg-cyan-200/10 px-4 py-2 text-sm font-black text-cyan-100 transition hover:bg-cyan-200/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectRuntimeAdapterContract}
              type="button"
            >
              试跑通道复核约定
            </button>
            <button
              className="border border-sky-200/40 bg-sky-200/10 px-4 py-2 text-sm font-black text-sky-100 transition hover:bg-sky-200/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectRuntimeRunnerLoopPack}
              type="button"
            >
              试跑跟进闭环
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
              保存补资料状态
            </button>
            <button
              className="border border-teal-200/40 bg-teal-200/10 px-4 py-2 text-sm font-black text-teal-100 transition hover:bg-teal-200/20 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={buildExternalExecutionWizard}
              type="button"
            >
              试跑补资料向导
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
              试跑时间线
            </button>
            <button
              className="border border-fuchsia-200/40 px-4 py-2 text-sm font-black text-fuchsia-100 transition hover:bg-fuchsia-200/10 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={dispatchState.status === 'loading'}
              onClick={inspectToolPolicy}
              type="button"
            >
              检查工具边界
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
              查看运营复核台
            </button>
            </div>
          </div>
        </details>
        {dispatchState.status !== 'idle' ? (
          <div className="mt-4 grid gap-2 border border-white/10 bg-white/[0.06] p-3 text-xs leading-5 text-white/75 md:grid-cols-3">
            <div>
              <span className="text-white/45">状态</span>
              <div className="mt-1 font-black text-white">{formatRuntimeStatus(dispatchState.status)}</div>
            </div>
            <div>
              <span className="text-white/45">事件</span>
              <div className="mt-1 font-mono text-white">{dispatchState.eventId ? '已创建待复核' : '待生成'}</div>
            </div>
            <div>
              <span className="text-white/45">租户</span>
              <div className="mt-1 font-mono text-white">{dispatchState.tenantId === 'local' || !dispatchState.tenantId ? '本地试跑' : dispatchState.tenantId}</div>
            </div>
            <p className="md:col-span-3">{dispatchState.message}</p>
            {dispatchState.latestRuns?.length ? (
              <div className="md:col-span-3">
                <div className="text-white/45">最新运行记录</div>
                <div className="mt-2 space-y-2">
                  {dispatchState.latestRuns.map(run => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[1fr_0.8fr_0.8fr_1.2fr]" key={`${run.eventId}-${run.target}`}>
                      <span className="font-mono text-white">试跑任务</span>
                      <span>交接通道：{formatRuntimeTargetLabel(run.target)}</span>
                      <span>当前状态：{formatRuntimeStatus(run.status)}</span>
                      <span>下一步：{formatRuntimeNarrative(run.nextAction)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {dispatchState.trialWorkflowPack ? (
              <div className="md:col-span-3">
                <div className="text-white/45">门店试跑工作流包 · 工单 / 内容 / 凭证 / 跟进</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2 md:col-span-2">
                    <div className="font-mono text-white">门店试跑工作流</div>
                    <p className="mt-1 text-white/60">{dispatchState.trialWorkflowPack.workOrder.restaurant} / {dispatchState.trialWorkflowPack.workOrder.offer}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.trialWorkflowPack.summary.readySteps}</div>
                    <p className="mt-1 text-white/60">资料可复核</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.trialWorkflowPack.summary.needsReviewSteps}</div>
                    <p className="mt-1 text-white/60">评价</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.trialWorkflowPack.summary.externalGatedSteps}</div>
                    <p className="mt-1 text-white/60">待补账号/授权/数据</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.trialWorkflowPack.summary.canRunInternallyToday ? '是' : '否'}</div>
                    <p className="mt-1 text-white/60">今日本地</p>
                  </div>
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/70">
                  <div className="font-mono text-white">{formatRuntimeNarrative(dispatchState.trialWorkflowPack.decisionBrief.headline)}</div>
                  <p className="mt-1">{formatRuntimeNarrative(dispatchState.trialWorkflowPack.decisionBrief.decision)}</p>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.trialWorkflowPack.workflowSteps.map(step => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.45fr_0.4fr_0.5fr_1.1fr_1.2fr]" key={step.id}>
                      <span className="font-mono text-white">{formatRuntimeNarrative(step.title)}</span>
                      <span>{formatRuntimeStatus(step.status)}</span>
                      <span>{formatRuntimeOwner(step.owner)}</span>
                      <span>{formatRuntimeEvidenceValue(step.output, '待补凭证')}</span>
                      <span>{formatRuntimeNarrative(step.nextAction)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-white/45">渠道草稿</div>
                    {dispatchState.trialWorkflowPack.channelDrafts.slice(0, 4).map(draft => (
                      <div className="border border-white/10 bg-white/[0.05] p-2 text-white/70" key={draft.channel}>
                        <div className="font-mono text-white">{formatRuntimeSchemaLabel(draft.channel)}</div>
                        <div className="mt-1">{formatRuntimeNarrative(draft.job)}</div>
                        <div className="mt-1 text-white/45">{formatRuntimeEvidenceValue(draft.proofRequired)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                  <div className="text-white/45">待补资料</div>
                    {dispatchState.trialWorkflowPack.externalUnlocks.slice(0, 4).map(item => (
                      <div className="border border-amber-200/20 bg-amber-200/[0.06] p-2 text-amber-100" key={item.capability}>
                        <div className="font-mono text-white">{formatRuntimeSchemaLabel(item.capability)}</div>
                        <div className="mt-1">{formatRuntimeSchemaLabel(item.missing)}</div>
                        <div className="mt-1 text-amber-100/60">{formatRuntimeSchemaLabel(item.providerRequest)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    凭证清单: {formatRuntimeSchemaList(dispatchState.trialWorkflowPack.evidenceChecklist)}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    训练材料: {dispatchState.trialWorkflowPack.trainingQueue.map(item => `${formatRuntimeSchemaLabel(item.capability)}: ${formatRuntimeNarrative(item.material)}`).join(' / ')}
                  </div>
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {formatRuntimeNarrative(dispatchState.trialWorkflowPack.safetyBoundary)}
                </div>
              </div>
            ) : null}
            {dispatchState.heartbeat?.followups?.length ? (
              <div className="md:col-span-3">
                  <div className="text-white/45">回执和跟进检查 · 已回填待复核回执 {dispatchState.heartbeat.acceptedReceipts ?? 0}</div>
                <div className="mt-2 space-y-2">
                  {dispatchState.heartbeat.followups.slice(0, 3).map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={item.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-black text-white">{formatRuntimeStatus(item.priority)} · {formatRuntimeOwner(item.owner)}</span>
                        <span className="text-white/55">{formatRuntimeEvidenceValue(item.evidenceRequired)}</span>
                      </div>
                      <p className="mt-1 text-white/70">{formatRuntimeNarrative(item.reason)}</p>
                      <p className="mt-1 text-white">{formatRuntimeNarrative(item.nextAction)}</p>
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
                      <p className="mt-1 text-white/60">高优先级: {dispatchState.heartbeat.watcherPolicy.summary.highPriority}</p>
                      <p className="mt-1 text-white/60">记忆更新: {dispatchState.heartbeat.watcherPolicy.summary.memoryUpserts}</p>
                    </div>
                    <div className="space-y-2">
                      {dispatchState.heartbeat.watcherPolicy.wakeups.slice(0, 2).map(wakeup => (
                        <div className="border border-white/10 bg-white/[0.05] p-2" key={wakeup.id}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono text-white">{formatRuntimeStatus(wakeup.priority)} · 巡检事件</span>
                            <span className="text-white/55">{formatRuntimeOwner(wakeup.owner)}</span>
                          </div>
                          <p className="mt-1 text-white/70">{formatRuntimeNarrative(wakeup.reason)}</p>
                          <p className="mt-1 text-white">{formatRuntimeNarrative(wakeup.memoryWrite)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}
            {dispatchState.readiness ? (
              <div className="md:col-span-3">
                <div className="text-white/45">账号和资料复核</div>
                <div className="mt-2 grid gap-2 md:grid-cols-4">
                  {dispatchState.readiness.groups.map(group => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={group.id}>
                      <div className="font-black text-white">{formatRuntimeNarrative(group.name)}</div>
                      <div className="mt-1 text-white/60">{formatRuntimeStatus(group.status)}</div>
                      <p className="mt-1 text-white/70">{formatRuntimeNarrative(group.nextAction)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {dispatchState.receipts?.length ? (
              <div className="md:col-span-3">
                <div className="text-white/45">回执凭证</div>
                <div className="mt-2 space-y-2">
                  {dispatchState.receipts.slice(0, 2).map(receipt => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.9fr_0.6fr_0.6fr_1fr]" key={receipt.receiptId}>
                      <span className="font-mono text-white">{receipt.channel}</span>
                      <span>{formatRuntimeStatus(receipt.status)}</span>
                      <span>{formatRuntimeStatus(receipt.evidenceLevel || '未评分')} · {receipt.evidenceScore ?? 0}</span>
                      <span>{formatRuntimeNarrative(receipt.summary)}</span>
                      {receipt.rejectedReason ? <span className="md:col-span-4 text-amber-100">{formatRuntimeNarrative(receipt.rejectedReason)}</span> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {dispatchState.recovery?.actions?.length ? (
              <div className="md:col-span-3">
                <div className="text-white/45">异常恢复计划 · {dispatchState.recovery.actions.length} 项动作</div>
                <div className="mt-2 space-y-2">
                  {dispatchState.recovery.actions.slice(0, 3).map(action => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={action.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-black text-white">{formatRuntimeStatus(action.priority)} · {formatRuntimeActionLabel(action.action)}</span>
                        <span className="text-white/55">{formatRuntimeOwner(action.owner)}</span>
                      </div>
                      <p className="mt-1 text-white/70">{formatRuntimeNarrative(action.reason)}</p>
                      <p className="mt-1 text-white">{formatRuntimeNarrative(action.nextStep)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {dispatchState.browserSession ? (
              <div className="md:col-span-3">
                <div className="text-white/45">隔离试跑会话清单</div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeTargetLabel(dispatchState.browserSession.runtimeTarget)}</div>
                    <p className="mt-1 text-white/60">隔离会话: 待复核</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserSession.canExecuteNow ? '资料可复核' : '仅人工交接'}</div>
                    <p className="mt-1 text-white/60">{formatRuntimeNarrative(dispatchState.browserSession.handoff.nextStep)}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserSession.toolPolicy.filter(tool => tool.allowed).length}/{dispatchState.browserSession.toolPolicy.length} 项工具</div>
                    <p className="mt-1 text-white/60">{formatRuntimeNarrative(dispatchState.browserSession.stopConditions[0])}</p>
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.browserSessionHealth ? (
              <div className="md:col-span-3">
                <div className="text-white/45">隔离试跑交接状态</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserSessionHealth.summary.total}</div>
                    <p className="mt-1 text-white/60">会话</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserSessionHealth.summary.ready}</div>
                    <p className="mt-1 text-white/60">资料可复核</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserSessionHealth.summary.blocked}</div>
                    <p className="mt-1 text-white/60">待补资料</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserSessionHealth.summary.expired}</div>
                    <p className="mt-1 text-white/60">已过期</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserSessionHealth.summary.needsHeartbeat}</div>
                    <p className="mt-1 text-white/60">待巡检</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.browserSessionHealth.sessions.slice(0, 3).map(session => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.9fr_0.6fr_0.6fr_1.5fr]" key={session.sessionId}>
                      <span className="font-mono text-white">{formatRuntimeTargetLabel(session.runtimeTarget)}</span>
                      <span>{formatRuntimeStatus(session.status)}</span>
                      <span>{session.allowedTools}/{session.allowedTools + session.blockedTools} 项工具</span>
                      <span>{formatRuntimeNarrative(session.nextAction)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {formatRuntimeNarrative(dispatchState.browserSessionHealth.safetyBoundary)}
                </div>
              </div>
            ) : null}
            {dispatchState.grantManifest ? (
              <div className="md:col-span-3">
                <div className="text-white/45">店长授权摘要</div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeStatus(dispatchState.grantManifest.merchant.grantStatus)}</div>
                    <p className="mt-1 text-white/60">{dispatchState.grantManifest.merchant.restaurant}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">
                      {dispatchState.grantManifest.actionPolicy.filter(action => action.allowed).length}/{dispatchState.grantManifest.actionPolicy.length} 项待复核动作
                    </div>
                    <p className="mt-1 text-white/60">不返回账号配置值、登录状态或私信原文</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.grantManifest.channels.filter(channel => channel.authorized).length}/{dispatchState.grantManifest.channels.length} 个待复核通道</div>
                    <p className="mt-1 text-white/60">{formatRuntimeNarrative(dispatchState.grantManifest.permanentlyForbidden[0]?.reason)}</p>
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.grantChecklist ? (
              <div className="md:col-span-3">
                <div className="text-white/45">授权清单向导</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">授权清单</div>
                    <p className="mt-1 text-white/60">{formatRuntimeStatus(dispatchState.grantChecklist.merchant.grantStatus)}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.grantChecklist.summary.done}/{dispatchState.grantChecklist.summary.total}</div>
                    <p className="mt-1 text-white/60">待复核步骤</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.grantChecklist.summary.missing}</div>
                    <p className="mt-1 text-white/60">待补配置</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.grantChecklist.summary.blocked}</div>
                    <p className="mt-1 text-white/60">待补资料</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeGate(dispatchState.grantChecklist.summary.canEnableAutoPublish, '店长已复核', '待店长确认')}</div>
                    <p className="mt-1 text-white/60">发布凭证</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeGate(dispatchState.grantChecklist.summary.canEnableOperatingAnalysis, '汇总待复核', '待补经营汇总')}</div>
                    <p className="mt-1 text-white/60">经营复盘</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.grantChecklist.sections.slice(0, 4).map(section => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={section.id}>
                      <div className="font-mono text-white">{formatRuntimeNarrative(section.title)}</div>
                      <p className="mt-1 text-white/60">{section.steps.filter(step => step.status === 'done').length}/{section.steps.length} 待复核</p>
                      <p className="mt-1 text-white/50">
                        {section.steps
                          .filter(step => step.status === 'missing' || step.status === 'blocked')
                          .map(step => `${formatRuntimeNarrative(step.title)}: ${formatRuntimeNarrative(step.nextAction)}`)
                          .join(' / ') || '资料可复核'}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.grantChecklist.blockedCapabilities.map(item => `${formatRuntimeSchemaLabel(item.capability)}: ${formatRuntimeNarrative(item.nextAction)}`).join(' / ') || '受控能力资料可复核'}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.grantChecklist.safetyBoundary)}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.activationGates ? (
              <div className="md:col-span-3">
                <div className="text-white/45">餐饮经营工单解锁条件</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">工单解锁条件</div>
                    <p className="mt-1 text-white/60">条件报告</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.activationGates.summary.ready}</div>
                    <p className="mt-1 text-white/60">资料可复核</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.activationGates.summary.blocked}</div>
                    <p className="mt-1 text-white/60">待补条件</p>
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
                        <span className="font-mono text-white">{formatRuntimeNarrative(gate.name)}</span>
                        <span>{formatRuntimeStatus(gate.status)}</span>
                      </div>
                      <p className="mt-1 text-white/60">{formatRuntimeNarrative(gate.customerPromise)}</p>
                      <p className="mt-1 text-white/50">
                        本地可先准备: {gate.canDoInternallyNow.slice(0, 3).map(formatRuntimeNarrative).join(' / ') || '无'}
                      </p>
                      <p className="mt-1 text-white/50">
                        待补账号/授权/数据: {formatRuntimeSchemaList(gate.mustHaveExternal.slice(0, 3), formatRuntimeNarrative(gate.blockingReason))}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.activationGates.answerToCustomer}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    虚假结果: {dispatchState.activationGates.audit.fakeResultsIncluded ? '有风险' : '未发现'}；隐私数据: {dispatchState.activationGates.audit.privateDataIncluded ? '有风险' : '未发现'}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.competitorAudit ? (
              <div className="md:col-span-3">
                <div className="text-white/45">公开对标打法复核</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">公开竞品复核</div>
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
                    <p className="mt-1 text-white/60">账号资料</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.competitorAudit.summary.internalConnectors}</div>
                    <p className="mt-1 text-white/60">连接器</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {dispatchState.competitorAudit.sources.map(source => (
                    <a className="border border-white/10 bg-white/[0.05] p-2" href={source.url} key={source.id} rel="noreferrer" target="_blank">
                      <div className="font-mono text-white">{formatRuntimeNarrative(source.name)}</div>
                      <p className="mt-1 text-white/60">{source.relevanceToRestaurant}</p>
                    </a>
                  ))}
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.competitorAudit.dimensions.map(dimension => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.7fr_0.45fr_1.2fr_1.2fr]" key={dimension.id}>
                      <span className="font-mono text-white">{formatRuntimeNarrative(dimension.name)}</span>
                      <span>{formatRuntimeStatus(dimension.status)}</span>
                      <span>{formatRuntimeNarrative(dimension.restaurantImpact)}</span>
                      <span>{dimension.status === 'external-required' ? formatRuntimeSchemaLabel(dimension.externalRequired) : formatRuntimeNarrative(dimension.internalNext)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    下一步: {dispatchState.competitorAudit.nextBuildOrder.slice(0, 3).map(item => `${formatRuntimeSchemaLabel(item.dimensionId)}:${item.buildableNow ? '本地可建' : '待补账号资料'}`).join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.competitorAudit.safetyBoundary)}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.buildQueue ? (
              <div className="md:col-span-3">
                <div className="text-white/45">门店工单构建队列</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">构建队列</div>
                    <p className="mt-1 text-white/60">队列类型</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.buildQueue.summary.readyToBuild}</div>
                    <p className="mt-1 text-white/60">资料可复核</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.buildQueue.summary.needsDesignReview}</div>
                    <p className="mt-1 text-white/60">通道</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.buildQueue.summary.waitingExternal}</div>
                    <p className="mt-1 text-white/60">账号资料</p>
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
                      <span className="font-mono text-white">{formatRuntimeNarrative(item.title)}</span>
                      <span>{formatRuntimeSchemaLabel(item.lane)}</span>
                      <span>{formatRuntimeOwner(item.owner)}</span>
                      <span>{formatRuntimeNarrative(item.internalDeliverable)}</span>
                      <span>{item.status === 'waiting-external' ? formatRuntimeSchemaList(item.externalRequired, '无') : formatRuntimeEvidenceValue(item.acceptanceCriteria[0])}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    下一轮内部冲刺: {dispatchState.buildQueue.nextInternalSprint.map(item => `${formatRuntimeSchemaLabel(item.dimensionId)}:${formatRuntimeOwner(item.owner)}`).join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.buildQueue.safetyBoundary)}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.capabilityTrainingPlan ? (
              <div className="md:col-span-3">
                <div className="text-white/45">门店打法训练计划</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">训练材料计划</div>
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
                    <p className="mt-1 text-white/60">资料可复核</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.capabilityTrainingPlan.nextInternalTraining.length}</div>
                    <p className="mt-1 text-white/60">准备任务</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.capabilityTrainingPlan.externalSetupRequests.length}</div>
                    <p className="mt-1 text-white/60">账号配置</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.capabilityTrainingPlan.items.map(item => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.55fr_0.35fr_1fr_1fr]" key={item.id}>
                      <span className="font-mono text-white">{formatRuntimeSchemaLabel(item.capability)}</span>
                      <span>{formatRuntimeStatus(item.status)}</span>
                      <span>{formatRuntimeSchemaList(item.missingTrainingMaterials.slice(0, 3), '训练资料可复核')}</span>
                      <span>{formatRuntimeSchemaList(item.missingExternalProviders.slice(0, 3), formatRuntimeEvidenceValue(item.acceptance))}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    训练材料: {dispatchState.capabilityTrainingPlan.nextInternalTraining.slice(0, 4).map(item => `${formatRuntimeSchemaLabel(item.capabilityId)}: ${formatRuntimeNarrative(item.material)}`).join(' / ') || '训练材料已齐'}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.capabilityTrainingPlan.safetyBoundary)}
                  </div>
                </div>
                {dispatchState.capabilityTrainingRecords?.length ? (
                  <div className="mt-2 space-y-2">
                    <div className="text-white/45">训练账本记录</div>
                    {dispatchState.capabilityTrainingRecords.slice(0, 5).map(record => (
                      <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.35fr_0.5fr_0.5fr_1.4fr]" key={record.recordId}>
                        <span className="font-mono text-white">{formatRuntimeStatus(record.kind)}</span>
                        <span>{formatRuntimeSchemaLabel(record.capabilityId)}</span>
                        <span>{formatRuntimeNarrative(record.name)}</span>
                        <span>{formatRuntimeNarrative(record.accepted ? record.evidenceSummary : record.rejectedReason)}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
            {dispatchState.clawSkillCatalog ? (
              <div className="md:col-span-3">
                <div className="text-white/45">门店打法素材 · 训练队列与待补资料</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">打法素材</div>
                    <p className="mt-1 text-white/60">清单类型</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillCatalog.summary.modules}</div>
                    <p className="mt-1 text-white/60">模块</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillCatalog.summary.skills}</div>
                    <p className="mt-1 text-white/60">训练材料</p>
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
                    <p className="mt-1 text-white/60">待补资料队列</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-white/45">内部训练队列</div>
                    {dispatchState.clawSkillCatalog.nextInternalTraining.slice(0, 5).map(item => (
                      <div className="border border-white/10 bg-white/[0.05] p-2 text-white/70" key={`${item.moduleId}-${item.skillId}`}>
                        <span className="font-mono text-white">{formatRuntimeSchemaLabel(item.moduleId)}</span> · {formatRuntimeNarrative(item.material)} · {formatRuntimeOwner(item.owner)}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="text-white/45">账号资料补齐队列</div>
                    {dispatchState.clawSkillCatalog.externalSetupRequests.slice(0, 5).map(item => (
                      <div className="border border-amber-200/20 bg-amber-200/[0.06] p-2 text-amber-100" key={`${item.toolId}-${item.unlocks}`}>
                        <span className="font-mono text-white">待补资料</span> · {formatRuntimeSchemaLabel(item.unlocks)}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.clawSkillCatalog.modules.slice(0, 6).map(module => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.4fr_0.55fr_1.5fr]" key={module.id}>
                      <span className="font-mono text-white">{formatRuntimeNarrative(module.name)}</span>
                      <span>{formatRuntimeOwner(module.owner)}</span>
                      <span>{module.skills.slice(0, 4).map(skill => `${formatRuntimeNarrative(skill.name)}:${formatRuntimeStatus(skill.status)}`).join(' / ')}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {formatRuntimeNarrative(dispatchState.clawSkillCatalog.safetyBoundary)}
                </div>
              </div>
            ) : null}
            {dispatchState.clawSkillWorkbench ? (
              <div className="md:col-span-3">
                <div className="text-white/45">门店工单台</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">门店工单台</div>
                    <p className="mt-1 text-white/60">{formatRuntimeStatus(dispatchState.clawSkillWorkbench.mode)}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillWorkbench.summary.modules}</div>
                    <p className="mt-1 text-white/60">模块</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.clawSkillWorkbench.summary.runnableNow}</div>
                    <p className="mt-1 text-white/60">可先准备</p>
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
                        <span className="font-mono text-white">{formatRuntimeNarrative(item.title)}</span>
                        <span>{formatRuntimeStatus(item.status)}</span>
                      </div>
                      <p className="mt-1 text-white/60">{formatRuntimeEvidenceValue(item.acceptance)}</p>
                      <p className="mt-1 text-white/45">{formatRuntimeSchemaList(item.contents.slice(0, 3), '无')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.clawSkillWorkbench.workbench.slice(0, 8).map(item => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.45fr_0.4fr_0.35fr_1.5fr]" key={item.id}>
                      <span className="font-mono text-white">{formatRuntimeNarrative(item.moduleName)}</span>
                      <span>{formatRuntimeNarrative(item.skillName)}</span>
                      <span>{formatRuntimeStatus(item.status)}</span>
                      <span>{formatRuntimeNarrative(item.nextAction)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    执行清单: {dispatchState.clawSkillWorkbench.commandScript.map(formatRuntimeActionLabel).join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.clawSkillWorkbench.safetyBoundary)}
                  </div>
                </div>
                {dispatchState.clawSkillExecutionLedger ? (
                  <div className="mt-2 border border-white/10 bg-white/[0.05] p-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-white">训练记录台账</span>
                      <span className="text-white/60">{dispatchState.clawSkillExecutionLedger.summary.total} 份待复核训练包</span>
                    </div>
                    <div className="mt-2 grid gap-2 md:grid-cols-3">
                      {dispatchState.clawSkillExecutionLedger.latest.slice(0, 3).map(record => (
                        <div className="border border-white/10 bg-white/[0.05] p-2" key={record.recordId}>
                          <div className="font-mono text-white">{formatRuntimeStatus(record.status)}</div>
                          <p className="mt-1 text-white/60">{record.restaurant} / {record.offer}</p>
                          <p className="mt-1 text-white/45">{formatRuntimeNarrative(record.nextAction)}</p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 text-white/45">{formatRuntimeNarrative(dispatchState.clawSkillExecutionLedger.safetyBoundary)}</p>
                  </div>
                ) : null}
              </div>
            ) : null}
            {dispatchState.benchmarkStrategy ? (
              <div className="md:col-span-3">
                <div className="text-white/45">试跑路径判断 · 工作台主干 + 任务面板</div>
                <div className="mt-2 grid gap-2 md:grid-cols-4">
                  <div className="border border-white/10 bg-white/[0.05] p-2 md:col-span-2">
                    <div className="font-mono text-white">试跑路径判断</div>
                    <p className="mt-1 text-white/60">{formatRuntimeNarrative(dispatchState.benchmarkStrategy.recommendation)}</p>
                  </div>
                  {dispatchState.benchmarkStrategy.candidates.slice(0, 2).map(candidate => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={candidate.id}>
                      <div className="font-mono text-white">{candidate.fitScore}</div>
                      <p className="mt-1 text-white/60">{formatRuntimeNarrative(candidate.name)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/70">
                  {formatRuntimeNarrative(dispatchState.benchmarkStrategy.summary)}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {dispatchState.benchmarkStrategy.candidates.map(candidate => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={candidate.id}>
                      <div className="font-mono text-white">{formatRuntimeOwner(candidate.role)}</div>
                      <div className="mt-1 text-white/70">{formatRuntimeNarrative(candidate.fitReason)}</div>
                      <div className="mt-2 text-white/45">可借鉴: {candidate.adopt.slice(0, 2).map(formatRuntimeNarrative).join(' / ')}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.benchmarkStrategy.nextBuildOrder.map(item => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.4fr_1fr_1fr_1fr]" key={item.id}>
                      <span className="font-mono text-white">{formatRuntimeNarrative(item.title)}</span>
                      <span>{formatRuntimeNarrative(item.internalNow)}</span>
                      <span>{formatRuntimeNarrative(item.externalGate)}</span>
                      <span>{formatRuntimeEvidenceValue(item.acceptance)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {formatRuntimeNarrative(dispatchState.benchmarkStrategy.safetyBoundary)}
                </div>
              </div>
            ) : null}
            {dispatchState.platformOperatingSpine ? (
              <div className="md:col-span-3">
                <div className="text-white/45">经营主链 · 内容 / 执行 / 回执 / 经营信号</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2 md:col-span-2">
                    <div className="font-mono text-white">经营主链</div>
                    <p className="mt-1 text-white/60">{formatRuntimeNarrative(dispatchState.platformOperatingSpine.productSpine)}</p>
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
                    <p className="mt-1 text-white/60">账号资料</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.platformOperatingSpine.timeline.map((item, index) => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.5fr_0.45fr_0.55fr_1.3fr_1.2fr]" key={`${item.stage}-${index}`}>
                      <span className="font-mono text-white">{formatRuntimeSchemaLabel(item.stage)}</span>
                      <span>{formatRuntimeStatus(item.status)}</span>
                      <span>{formatRuntimeOwner(item.owner)}</span>
                      <span>{formatRuntimeNarrative(item.detail)}</span>
                      <span>{formatRuntimeNarrative(item.nextAction)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-white/45">账号资料</div>
                    {dispatchState.platformOperatingSpine.externalGates.slice(0, 4).map(gate => (
                      <div className="border border-amber-200/20 bg-amber-200/[0.06] p-2 text-amber-100" key={gate.id}>
                        <div className="font-mono text-white">{formatRuntimeNarrative(gate.name)}</div>
                        <div className="mt-1">{formatRuntimeSchemaList(gate.missing.slice(0, 3), '资料可复核')}</div>
                        <div className="mt-1 text-amber-100/60">{formatRuntimeNarrative(gate.nextAction)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="text-white/45">下一步平台动作</div>
                    {dispatchState.platformOperatingSpine.nextPlatformActions.map(action => (
                      <div className="border border-white/10 bg-white/[0.05] p-2 text-white/70" key={`${action.owner}-${action.action}`}>
                        <div className="font-mono text-white">{formatRuntimeOwner(action.owner)}</div>
                        <div className="mt-1">{formatRuntimeNarrative(action.action)}</div>
                        <div className="mt-1 text-white/45">{formatRuntimeEvidenceValue(action.acceptance)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    本地现在: {dispatchState.platformOperatingSpine.auditBoundary.canDoInternallyNow.map(formatRuntimeNarrative).join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    交接承诺前需补齐: {dispatchState.platformOperatingSpine.auditBoundary.mustHaveExternalBeforeClaiming.map(formatRuntimeNarrative).join(' / ')}
                  </div>
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {formatRuntimeNarrative(dispatchState.platformOperatingSpine.safetyBoundary)}
                </div>
              </div>
            ) : null}
            {dispatchState.operatingDataContract ? (
              <div className="md:col-span-3">
                <div className="text-white/45">经营数据规则 · 收银 / 核销 / 会员 / 库存 / 财务</div>
                <div className="mt-2 grid gap-2 md:grid-cols-7">
                  <div className="border border-white/10 bg-white/[0.05] p-2 md:col-span-2">
                    <div className="font-mono text-white">经营数据规则</div>
                    <p className="mt-1 text-white/60">经营汇总复盘: {dispatchState.operatingDataContract.summary.canClaimTrueOperatingAnalysis ? '资料可复核' : '待补资料'}</p>
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
                    <p className="mt-1 text-white/60">收银汇总导入</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeGate(dispatchState.operatingDataContract.summary.canClaimAutoRedemption, '汇总待复核', '待补经营汇总')}</div>
                    <p className="mt-1 text-white/60">核销数据</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.operatingDataContract.tracks.map(track => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.45fr_0.45fr_1.2fr_1.2fr_1.2fr]" key={track.id}>
                      <span className="font-mono text-white">{formatRuntimeNarrative(track.name)}</span>
                      <span>{formatRuntimeStatus(track.status)}</span>
                      <span>{formatRuntimeNarrative(track.businessQuestion)}</span>
                      <span>{formatRuntimeSchemaList(track.requiredFields.slice(0, 5), '无')}</span>
                      <span>{formatRuntimeNarrative(track.nextAction)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-white/45">导入模板</div>
                    {dispatchState.operatingDataContract.importTemplate.slice(0, 6).map(field => (
                      <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 text-white/70 md:grid-cols-[0.6fr_0.35fr_1fr]" key={field.field}>
                        <span className="font-mono text-white">{formatRuntimeSchemaLabel(field.field)}</span>
                        <span>{formatRuntimeSchemaLabel(field.type)}</span>
                        <span>{formatRuntimeSchemaList(field.requiredFor, '无')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="text-white/45">补资料请求</div>
                    {dispatchState.operatingDataContract.providerSetupRequests.map(request => (
                      <div className="border border-amber-200/20 bg-amber-200/[0.06] p-2 text-amber-100" key={request.provider}>
                        <div className="font-mono text-white">待补资料</div>
                        <div className="mt-1">{formatRuntimeSchemaList(request.unlocks, '无')}</div>
                        <div className="mt-1 text-amber-100/60">{formatRuntimeEvidenceValue(request.evidenceRequired)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.operatingDataContract.operatingQuestions.map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2 text-white/65" key={item.question}>
                      <span className="font-mono text-white">{formatRuntimeGate(item.canAnswerNow, '可回答', '待补经营汇总')}</span>
                      <p className="mt-1">{item.question}</p>
                      <p className="mt-1 text-white/45">{formatRuntimeSchemaList(item.blockedBy, '没有卡点')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {formatRuntimeNarrative(dispatchState.operatingDataContract.safetyBoundary)}
                </div>
                <button
                  className="mt-2 border border-emerald-200/50 px-3 py-2 text-xs font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={dispatchState.status === 'loading'}
                  onClick={inspectOperatingInsightReport}
                  type="button"
                >
                  经营洞察报告
                </button>
              </div>
            ) : null}
            {dispatchState.operatingInsightReport ? (
              <div className="md:col-span-3">
                <div className="text-white/45">经营洞察报告 · 有凭证支撑的指标</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2 md:col-span-2">
                    <div className="font-mono text-white">经营洞察报告</div>
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
                    <p className="mt-1 text-white/60">待补资料</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeGate(dispatchState.operatingInsightReport.summary.canClaimTrueOperatingAnalysis, '汇总待复核', '待补经营汇总')}</div>
                    <p className="mt-1 text-white/60">经营汇总复盘</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {dispatchState.operatingInsightReport.insights.map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={item.id}>
                      <div className="font-mono text-white">{formatRuntimeNarrative(item.label)}</div>
                      <p className="mt-1 text-white/60">{formatRuntimeStatus(item.status)} · {formatRuntimeEvidenceValue(item.value, '待补资料')}</p>
                      <p className="mt-1 line-clamp-3 text-white/45">{formatRuntimeNarrative(item.interpretation)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-white/45">店长动作</div>
                    {dispatchState.operatingInsightReport.storeManagerActions.map(item => (
                      <p className="mt-1 text-white/60" key={`${item.owner}-${item.action}`}>{formatRuntimeOwner(item.owner)}: {formatRuntimeNarrative(item.action)}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.operatingInsightReport.safetyBoundary)}
                  </div>
                </div>
              </div>
            ) : null}
            {commandPostRunReviewPack ? (
              <div className="md:col-span-3">
                <div className="text-white/45">试跑复盘包 · 凭证、SOP、下一轮</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2 md:col-span-2">
                    <div className="font-mono text-white">试跑复盘包</div>
                    <p className="mt-1 text-white/60">{formatRuntimeStatus(commandPostRunReviewPack.verdict)}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandPostRunReviewPack.summary.acceptedReceipts}</div>
                    <p className="mt-1 text-white/60">待复核凭证</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandPostRunReviewPack.summary.storeTasks}</div>
                    <p className="mt-1 text-white/60">门店任务</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandPostRunReviewPack.summary.acceptedPosImports}</div>
                    <p className="mt-1 text-white/60">收银汇总导入</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeGate(commandPostRunReviewPack.summary.canClaimTrueOperatingAnalysis, '汇总待复核', '待补经营汇总')}</div>
                    <p className="mt-1 text-white/60">经营汇总复盘</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  {commandPostRunReviewPack.lanes.map(lane => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={lane.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-white">{formatRuntimeLabel(lane.title)}</span>
                        <span>{formatRuntimeStatus(lane.status)}</span>
                      </div>
                      <p className="mt-1 text-white/60">{formatRuntimeOwner(lane.owner)}: {formatRuntimeNarrative(lane.decision)}</p>
                      <p className="mt-1 line-clamp-3 text-white/45">{formatRuntimeNarrative(lane.nextAction)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="text-white/45">下一轮 SOP</div>
                    {commandPostRunReviewPack.nextLoopSop.slice(0, 5).map(step => (
                      <p className="mt-1 text-white/60" key={step.step}>{formatRuntimeOwner(step.owner)}: {formatRuntimeNarrative(step.step)} - {formatRuntimeNarrative(step.output)}</p>
                    ))}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(commandPostRunReviewPack.safetyBoundary)}
                  </div>
                </div>
              </div>
            ) : null}
            {commandNextLoopChannelPlan ? (
              <div className="md:col-span-3">
                <div className="text-white/45">下一轮渠道计划 · 每日班次执行</div>
                <div className="mt-2 grid gap-2 md:grid-cols-7">
                  <div className="border border-cyan-200/20 bg-cyan-200/[0.06] p-2 md:col-span-2">
                    <div className="font-mono text-white">下一轮渠道计划</div>
                    <p className="mt-1 text-cyan-100/70">{formatRuntimeStatus(commandNextLoopChannelPlan.verdict)}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{commandNextLoopChannelPlan.summary.internalReadyLanes}</div>
                    <p className="mt-1 text-white/60">待复核链路</p>
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
                      <p className="mt-1 text-white/60">{formatRuntimeOwner(lane.owner)}: {formatRuntimeNarrative(lane.nextAction)}</p>
                      <p className="mt-1 line-clamp-2 text-white/40">{formatRuntimeNarrative(lane.stopLine)}</p>
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
                          <span>{formatRuntimeStatus(item.status)}</span>
                        </div>
                        <p className="mt-1 text-white/70">{formatRuntimeOwner(item.owner)}: {formatRuntimeNarrative(item.action)}</p>
                        <p className="mt-1 line-clamp-2 text-white/45">{item.manualFallback}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="text-white/45">待补资料</div>
                    {commandNextLoopChannelPlan.externalRequired.slice(0, 8).map(item => (
                      <div className="border border-amber-200/20 bg-amber-200/[0.06] p-2 text-amber-100/70" key={item}>{formatRuntimeSchemaLabel(item)}</div>
                    ))}
                    <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                      {formatRuntimeNarrative(commandNextLoopChannelPlan.safetyBoundary)}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.clawTrainingBatch ? (
              <div className="md:col-span-3">
                <div className="text-white/45">训练批次 · 本地训练与补资料解锁</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">训练批次</div>
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
                    <p className="mt-1 text-white/60">覆盖检查项</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="text-white/45">本轮本地准备任务</div>
                    {dispatchState.clawTrainingBatch.internalTrainingTasks.slice(0, 6).map(task => (
                      <div className="border border-white/10 bg-white/[0.05] p-2 text-white/70" key={task.taskId}>
                        <div className="font-mono text-white">{formatRuntimeNarrative(task.title)}</div>
                        <div className="mt-1">{formatRuntimeNarrative(task.material)}</div>
                        <div className="mt-1 text-white/45">{formatRuntimeEvidenceValue(task.evidenceRequired)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="text-white/45">本轮待补资料任务</div>
                    {dispatchState.clawTrainingBatch.providerUnlockTasks.slice(0, 6).map(task => (
                      <div className="border border-amber-200/20 bg-amber-200/[0.06] p-2 text-amber-100" key={task.taskId}>
                        <div className="font-mono text-white">{formatRuntimeNarrative(task.title)}</div>
                        <div className="mt-1">待补资料</div>
                        <div className="mt-1 text-amber-100/60">{formatRuntimeEvidenceValue(task.evidenceRequired)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.clawTrainingBatch.dispatchPreview.map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60" key={item.lane}>
                      {formatRuntimeSchemaLabel(item.lane)}: {item.count} 项 · {formatRuntimeOwner(item.owner)} · 解锁前暂停: {formatRuntimeStatus(item.blockedUntil)}
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {formatRuntimeNarrative(dispatchState.clawTrainingBatch.safetyBoundary)}
                </div>
              </div>
            ) : null}
            {dispatchState.executionPackage ? (
              <div className="md:col-span-3">
                <div className="text-white/45">试跑交接包</div>
                <div className="mt-2 grid gap-2 md:grid-cols-4">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeTargetLabel(dispatchState.executionPackage.target)}</div>
                    <p className="mt-1 text-white/60">试跑交接包</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeStatus(dispatchState.executionPackage.status)}</div>
                    <p className="mt-1 text-white/60">可否转交: {dispatchState.executionPackage.canForward ? '是' : '否'}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionPackage.executionPolicy.allowedRuntimeActions.length}/{dispatchState.executionPackage.executionPolicy.blockedRuntimeActions.length}</div>
                    <p className="mt-1 text-white/60">允许 / 禁止动作</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeActionLabel(dispatchState.executionPackage.runtimeContract.callbackAction)}</div>
                    <p className="mt-1 text-white/60">不含服务端配置值、登录状态或私信原文</p>
                  </div>
                </div>
                {dispatchState.executionPackage.blockedReasons.length ? (
                  <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/65">
                    {formatRuntimeSchemaList(dispatchState.executionPackage.blockedReasons.slice(0, 3), '没有卡点')}
                  </div>
                ) : null}
              </div>
            ) : null}
            {dispatchState.browserRunbook ? (
              <div className="md:col-span-3">
                <div className="text-white/45">试跑操作清单</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">试跑清单</div>
                    <p className="mt-1 text-white/60">{formatRuntimeTargetLabel(dispatchState.browserRunbook.runtimeTarget)}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunbook.canExecuteNow ? '资料可复核' : '仅人工交接'}</div>
                    <p className="mt-1 text-white/60">交接条件</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunbook.steps.length}</div>
                    <p className="mt-1 text-white/60">有序步骤</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunbook.allowedDomains.length}</div>
                    <p className="mt-1 text-white/60">可访问范围</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserRunbook.evidenceSchema.length}</div>
                    <p className="mt-1 text-white/60">凭证字段</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeActionLabel(dispatchState.browserRunbook.callback.action)}</div>
                    <p className="mt-1 text-white/60">{formatRuntimeSchemaLabel(dispatchState.browserRunbook.callback.requiredHeader)}</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    授权站点范围: 已限定公开站点 {dispatchState.browserRunbook.allowedDomains.length} 个
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.browserRunbook.safetyBoundary)}
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.browserRunbook.steps.map(step => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.35fr_0.45fr_1.2fr_0.35fr]" key={step.id}>
                      <span className="font-mono text-white">{step.order}. {formatRuntimeStatus(step.type)}</span>
                      <span>{formatRuntimeToolLabel(step.tool)}</span>
                      <span>{formatRuntimeSchemaList(step.stopIf.slice(0, 2), '无')}</span>
                      <span>{formatRuntimeGate(step.allowed, '待复核', '待补条件')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {dispatchState.browserRunnerContract ? (
              <div className="md:col-span-3">
                <div className="text-white/45">试跑回执约定</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">回执约定</div>
                    <p className="mt-1 text-white/60">{formatRuntimeTargetLabel(dispatchState.browserRunnerContract.runtimeTarget)}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeGate(dispatchState.browserRunnerContract.canAcceptSignedFinalReceipt, '回执待复核', '待补凭证')}</div>
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
                    <div className="font-mono text-white">{formatRuntimeStatus(dispatchState.browserRunnerContract.stepEventEndpoint.mode)}</div>
                    <p className="mt-1 text-white/60">{formatRuntimeActionLabel(dispatchState.browserRunnerContract.stepEventEndpoint.action)}</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-[0.9fr_1.1fr]">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    待补配置: {formatRuntimeSchemaList(dispatchState.browserRunnerContract.externalSetupRequired, '资料可复核')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.browserRunnerContract.safetyBoundary)}
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.browserRunnerContract.eventRules.map(rule => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.45fr_0.45fr_0.4fr_1.3fr]" key={rule.type}>
                      <span className="font-mono text-white">{formatRuntimeStatus(rule.type)}</span>
                      <span>写入: {formatRuntimeSchemaLabel(rule.writesTo)}</span>
                      <span>{rule.retryable ? '可重试' : '不重试'}</span>
                      <span>{formatRuntimeNarrative(rule.nextAction)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            {dispatchState.runnerEventHealth ? (
              <div className="md:col-span-3">
                <div className="text-white/45">试跑事件台账</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">事件台账</div>
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
                    <p className="mt-1 text-white/60">收尾待复核运行</p>
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
                    <span className="font-mono text-white">{formatRuntimeStatus(dispatchState.runnerEvent.type)}</span>
                    <span>{formatRuntimeStatus(dispatchState.runnerEvent.status)}</span>
                    <span>{dispatchState.runnerEvent.retryable ? '可重试' : '不重试'}</span>
                    <span>{formatRuntimeNarrative(dispatchState.runnerEvent.nextAction)}</span>
                  </div>
                ) : null}
                <div className="mt-2 space-y-2">
                  {dispatchState.runnerEventHealth.runs.slice(0, 4).map(run => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.7fr_0.5fr_0.45fr_1.35fr]" key={`${run.eventId}-${run.externalRunId}`}>
                      <span className="font-mono text-white">{formatRuntimeStatus(run.latestType)}</span>
                      <span>{formatRuntimeTargetLabel(run.runtimeTarget)}</span>
                      <span>{formatRuntimeStatus(run.latestStatus)}</span>
                      <span>{formatRuntimeNarrative(run.nextAction)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {formatRuntimeNarrative(dispatchState.runnerEventHealth.safetyBoundary)}
                </div>
              </div>
            ) : null}
            {dispatchState.browserGatewayPack ? (
              <div className="md:col-span-3">
                <div className="text-white/45">试跑交接包</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeTargetLabel(dispatchState.browserGatewayPack.runtimeTarget)}</div>
                    <p className="mt-1 text-white/60">试跑通道</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeGate(dispatchState.browserGatewayPack.canExecuteNow, '环境待复核', '待补资料')}</div>
                    <p className="mt-1 text-white/60">交接条件</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.browserGatewayPack.browserRequest.acceptedActions.length}</div>
                    <p className="mt-1 text-white/60">待复核动作</p>
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
                    <p className="mt-1 text-white/60">账号资料</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.browserGatewayPack.actionSchema.map(action => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={action.action}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{formatRuntimeActionLabel(action.action)}</span>
                        <span>{formatRuntimeGate(action.allowed, '可做', '待补条件')} / 记录: {formatRuntimeSchemaLabel(action.writesTo)}</span>
                      </div>
                      <p className="mt-1 text-white/60">凭证: {formatRuntimeSchemaList(action.requiredEvidence.slice(0, 3), '无')}</p>
                      <p className="mt-1 text-white/45">停止线: {formatRuntimeSchemaList(action.stopIf.slice(0, 2), '无')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    试跑请求规则: 服务端校验试跑通道请求、鉴权头和回执规则
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    截图/链接记录范围: {formatRuntimeSchemaList(dispatchState.browserGatewayPack.snapshotPolicy.allowedFields.slice(0, 4), '无')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.browserGatewayPack.safetyBoundary)}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.callbackSimulation ? (
              <div className="md:col-span-3">
                <div className="text-white/45">签名回执模拟器</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">签名回执模拟</div>
                    <p className="mt-1 text-white/60">{formatRuntimeStatus(dispatchState.callbackSimulation.mode)}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.callbackSimulation.callback.signatureVerified ? '已验证' : '已拒绝'}</div>
                    <p className="mt-1 text-white/60">签名</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeStatus(dispatchState.callbackSimulation.receipt.status)}</div>
                    <p className="mt-1 text-white/60">{formatRuntimeStatus(dispatchState.callbackSimulation.receipt.evidenceLevel)} · {dispatchState.callbackSimulation.receipt.evidenceScore}</p>
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
                    <div className="font-mono text-white">{dispatchState.callbackSimulation.executionPackage.canForward ? '待复核' : '仅本地'}</div>
                    <p className="mt-1 text-white/60">试跑交接通道</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeSchemaList(dispatchState.callbackSimulation.blockedExternal.slice(0, 3), '没有账号资料卡点')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.callbackSimulation.safetyBoundary)}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.runHealth ? (
              <div className="md:col-span-3">
                <div className="text-white/45">试跑回执与复核状态</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runHealth.summary.totalRuns}</div>
                    <p className="mt-1 text-white/60">运行</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runHealth.summary.accepted}</div>
                    <p className="mt-1 text-white/60">待复核</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runHealth.summary.waitingReceipt}</div>
                    <p className="mt-1 text-white/60">等待</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runHealth.summary.blockedAuth}</div>
                    <p className="mt-1 text-white/60">待补资料</p>
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
                      <span className="font-mono text-white">{formatRuntimeStatus(item.state)}</span>
                      <span>{formatRuntimeTargetLabel(item.target)} · {formatRuntimeStatus(item.evidenceState)}</span>
                      <span>{formatRuntimeStatus(item.evidenceLevel || 'missing')} · {item.evidenceScore ?? 0}</span>
                      <span>{formatRuntimeNarrative(item.nextAction)}</span>
                      {item.evidenceWarnings?.length ? <span className="md:col-span-4 text-amber-100">{item.evidenceWarnings.slice(0, 2).map(formatRuntimeNarrative).join(' / ')}</span> : null}
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {formatRuntimeNarrative(dispatchState.runHealth.safetyBoundary)}
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
                    <p className="mt-1 text-white/60">领券数</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.businessSignals.summary.redemptions}</div>
                    <p className="mt-1 text-white/60">到店核销数</p>
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
                      <span className="font-mono text-white">{formatRuntimeSchemaLabel(item.signalType)}</span>
                      <span>{formatRuntimeNarrative(item.channel)}</span>
                      <span>{formatRuntimeStatus(item.evidenceLevel)} · {item.evidenceScore}</span>
                      <span>{formatRuntimeNarrative(item.nextAction)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {formatRuntimeNarrative(dispatchState.businessSignals.safetyBoundary)}
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
                    <p className="mt-1 text-white/60">待补条件</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.storeManagerFollowup.summary.visitIntent}</div>
                    <p className="mt-1 text-white/60">到店意向</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.storeManagerFollowup.summary.couponClaims}</div>
                    <p className="mt-1 text-white/60">领券数</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.storeManagerFollowup.tasks.slice(0, 4).map(task => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.55fr_0.55fr_1.2fr_1.2fr]" key={task.id}>
                      <span className="font-mono text-white">{formatRuntimeOwner(task.owner)} · {formatRuntimeStatus(task.priority)}</span>
                      <span>{formatRuntimeSchemaLabel(task.signal)}</span>
                      <span>{formatRuntimeNarrative(task.action)}</span>
                      <span className="text-white/55">{formatRuntimeNarrative(task.talkTrack)}</span>
                      <span className="md:col-span-4 text-white/45">凭证: {formatRuntimeEvidenceValue(task.evidenceRequired)} · 截止: {task.dueWindow}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.storeManagerFollowup.managerBrief.map(formatRuntimeNarrative).join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.storeManagerFollowup.safetyBoundary)}
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
                    <p className="mt-1 text-white/60">领券数</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.posImport.summary.redemptionCount}</div>
                    <p className="mt-1 text-white/60">到店核销数</p>
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
                    <div className="font-mono text-white">经营表格导入 · {formatRuntimeStatus(dispatchState.posImport.status)}</div>
                    <p className="mt-1 text-white/60">
                      问题: {dispatchState.posImport.issues.filter(item => item.severity === 'error').length} 个错误 / {dispatchState.posImport.issues.filter(item => item.severity === 'warning').length} 个提醒
                    </p>
                    <p className="mt-1 text-white/60">
                      必填字段: {dispatchState.posImport.schema.required.map(formatRuntimeSchemaLabel).join(' / ')}
                    </p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.posImport.safetyBoundary)}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.runtimeProbe ? (
              <div className="md:col-span-3">
                <div className="text-white/45">试跑通道复核检查</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeProbe.summary.ready}</div>
                    <p className="mt-1 text-white/60">资料可复核</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeProbe.summary.missingConfig}</div>
                    <p className="mt-1 text-white/60">待补配置</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeProbe.summary.unreachable}</div>
                    <p className="mt-1 text-white/60">未连通</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeProbe.summary.blockedExternal}</div>
                    <p className="mt-1 text-white/60">待补条件</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeProbe.summary.probed}</div>
                    <p className="mt-1 text-white/60">已检查</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {dispatchState.runtimeProbe.targets.map(target => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={target.target}>
                      <div className="font-mono text-white">{formatRuntimeTargetLabel(target.target)} · {formatRuntimeStatus(target.status)}</div>
                      <p className="mt-1 text-white/60">{formatRuntimeNarrative(target.nextAction)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {formatRuntimeNarrative(dispatchState.runtimeProbe.safetyBoundary)}
                </div>
              </div>
            ) : null}
            {dispatchState.runtimeSetupContract ? (
              <div className="md:col-span-3">
                <div className="text-white/45">试跑通道配置约定</div>
                <div className="mt-2 grid gap-2 md:grid-cols-4">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeSetupContract.summary.readyTracks}/{dispatchState.runtimeSetupContract.summary.tracks}</div>
                    <p className="mt-1 text-white/60">资料可复核链路</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeSetupContract.summary.missingRequirements}</div>
                    <p className="mt-1 text-white/60">待补条件</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeSetupContract.blockedCapabilities.length}</div>
                    <p className="mt-1 text-white/60">待补事项</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">配置规则</div>
                    <p className="mt-1 text-white/60">规则类型</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.runtimeSetupContract.tracks.map(track => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={track.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{formatRuntimeNarrative(track.name)}</span>
                        <span>{formatRuntimeStatus(track.status)}</span>
                      </div>
                      <p className="mt-1 text-white/60">{formatRuntimeNarrative(track.nextAction)}</p>
                      <p className="mt-1 text-white/50">
                        还缺: {track.requirements.filter(item => !item.configured).map(item => formatRuntimeNarrative(item.label)).join(' / ') || '无'}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {dispatchState.runtimeSetupContract.blockedCapabilities.map(item => `${formatRuntimeSchemaLabel(item.capability)}: ${formatRuntimeNarrative(item.reason)}`).join(' / ') || '没有待补事项'}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.runtimeSetupContract.safetyBoundary)}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.runtimeAdapterContract ? (
              <div className="md:col-span-3">
                <div className="text-white/45">试跑通道交接约定</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeTargetLabel(dispatchState.runtimeAdapterContract.target)}</div>
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
                    <p className="mt-1 text-white/60">待补配置</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeAdapterContract.summary.blocked}</div>
                    <p className="mt-1 text-white/60">待补条件</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeGate(dispatchState.runtimeAdapterContract.summary.canSubmitSandbox, '样例待复核', '待补资料')}</div>
                    <p className="mt-1 text-white/60">样例交接</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    试跑请求规则: 服务端校验交接方式、通道路径和资料结构
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    回执要求: 接收成功状态并记录试跑编号
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    回执规则: 签名回执动作 / 签名回执规则
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.runtimeAdapterContract.checks.map(check => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={check.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{formatRuntimeSchemaLabel(check.id)}</span>
                        <span>{formatRuntimeStatus(check.status)}</span>
                      </div>
                      <p className="mt-1 text-white/60">{formatRuntimeNarrative(check.nextAction)}</p>
                      <p className="mt-1 text-white/45">凭证: {formatRuntimeSchemaList(check.evidence, '待补凭证')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    样例操作清单: {formatRuntimeSchemaList(dispatchState.runtimeAdapterContract.sandboxScript.slice(0, 3), '无')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.runtimeAdapterContract.safetyBoundary)}
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
                    <p className="mt-1 text-white/60">试跑事件</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeRunnerLoopPack.summary.activeRunnerRuns}</div>
                    <p className="mt-1 text-white/60">进行中试跑通道</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeRunnerLoopPack.summary.waitingReceipts}</div>
                    <p className="mt-1 text-white/60">等待回执</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.runtimeRunnerLoopPack.summary.acceptedReceipts}</div>
                    <p className="mt-1 text-white/60">待复核回执</p>
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
                        <span className="font-mono text-white">{formatRuntimeSchemaLabel(stage.id)}</span>
                        <span>{formatRuntimeStatus(stage.status)} / {formatRuntimeOwner(stage.owner)}</span>
                      </div>
                      <p className="mt-1 text-white/60">{formatRuntimeNarrative(stage.nextAction)}</p>
                      <p className="mt-1 text-white/45">凭证: {formatRuntimeSchemaList(stage.evidence, '待补凭证')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    下一步: {formatRuntimeNarrative(dispatchState.runtimeRunnerLoopPack.nextBestAction)}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    待补账号/授权/数据: {formatRuntimeSchemaList(dispatchState.runtimeRunnerLoopPack.externalRequired.slice(0, 3), '无')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.runtimeRunnerLoopPack.safetyBoundary)}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.providerSetupWizard ? (
              <div className="md:col-span-3">
                <div className="text-white/45">账号和资料补齐向导</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">补资料向导</div>
                    <p className="mt-1 text-white/60">{dispatchState.providerSetupWizard.restaurant} / {dispatchState.providerSetupWizard.offer}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupWizard.summary.completionPercent}%</div>
                    <p className="mt-1 text-white/60">资料齐备度</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupWizard.summary.configured}</div>
                    <p className="mt-1 text-white/60">待复核资料</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupWizard.summary.missing}</div>
                    <p className="mt-1 text-white/60">待补资料</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeGate(dispatchState.providerSetupWizard.summary.canEnableExternalAutomation, '凭证待复核', '待补凭证')}</div>
                    <p className="mt-1 text-white/60">试跑交接</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.providerSetupWizard.sections.map(section => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={section.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{formatRuntimeNarrative(section.title)}</span>
                        <span>{formatRuntimeStatus(section.status)} · {formatRuntimeOwner(section.owner)}</span>
                      </div>
                      <p className="mt-1 text-white/60">{formatRuntimeNarrative(section.purpose)}</p>
                      <div className="mt-2 space-y-1">
                        {section.fields.slice(0, 4).map(field => (
                          <p className="text-white/50" key={field.id}>{formatRuntimeStatus(field.status)} · {formatRuntimeNarrative(field.label)} · {formatRuntimeNarrative(field.safePlaceholder)}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    待补账号配置: {formatSetupItemCount(dispatchState.providerSetupWizard.handoffPayload.missingEnvKeys, '资料可复核')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.providerSetupWizard.safetyBoundary)}
                  </div>
                </div>
                {dispatchState.providerSetupState ? (
                  <div className="mt-2 grid gap-2 md:grid-cols-4">
                    <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                      待检查记录: {dispatchState.providerSetupState.summary.records}
                    </div>
                    <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                      账号配置: {formatSetupItemCount(dispatchState.providerSetupState.provided.envKeys, '资料可复核')}
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
                    <div className="text-white/45">账号和资料复核</div>
                    <div className="mt-2 grid gap-2 md:grid-cols-6">
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="font-mono text-white">资料复核检查</div>
                        <p className="mt-1 text-white/60">检查数据</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="font-mono text-white">{dispatchState.providerReadinessHealth.summary.readinessScore}%</div>
                        <p className="mt-1 text-white/60">复核分</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="font-mono text-white">{dispatchState.providerReadinessHealth.summary.healthReady}</div>
                        <p className="mt-1 text-white/60">待复核项</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="font-mono text-white">{dispatchState.providerReadinessHealth.summary.rememberedNotProbed}</div>
                        <p className="mt-1 text-white/60">待检查记录</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="font-mono text-white">{dispatchState.providerReadinessHealth.summary.configuredButUnreachable}</div>
                        <p className="mt-1 text-white/60">暂不可达</p>
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="font-mono text-white">{formatRuntimeGate(dispatchState.providerReadinessHealth.summary.canEnableExternalAutomation, '凭证待复核', '待补凭证')}</div>
                        <p className="mt-1 text-white/60">交接复核</p>
                      </div>
                    </div>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">
                      {dispatchState.providerReadinessHealth.items.map(item => (
                        <div className="border border-white/10 bg-white/[0.05] p-2" key={item.id}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="font-mono text-white">{formatRuntimeNarrative(item.label)}</span>
                            <span>{formatRuntimeStatus(item.status)}</span>
                          </div>
                          <p className="mt-1 text-white/60">{formatRuntimeNarrative(item.nextAction)}</p>
                          <p className="mt-1 text-white/45">待复核: {formatRuntimeSchemaList(item.configuredEvidence, '无')}</p>
                          <p className="mt-1 text-white/45">还缺: {formatRuntimeSchemaList(item.missingEvidence, '无')}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                      {formatRuntimeNarrative(dispatchState.providerReadinessHealth.safetyBoundary)}
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
                    <div className="font-mono text-white">补资料包</div>
                    <p className="mt-1 text-white/60">{dispatchState.providerSetupPack.restaurant} / {dispatchState.providerSetupPack.offer}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupPack.summary.ready}</div>
                    <p className="mt-1 text-white/60">待复核条件</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupPack.summary.missing}</div>
                    <p className="mt-1 text-white/60">待补条件</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.providerSetupPack.summary.blockedCapabilities}</div>
                    <p className="mt-1 text-white/60">待补后交接</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeGate(dispatchState.providerSetupPack.summary.readyForExternalExecution, '凭证待复核', '待补凭证')}</div>
                    <p className="mt-1 text-white/60">试跑交接</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.providerSetupPack.priorityRequests.slice(0, 6).map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={item.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{formatRuntimeNarrative(item.label)}</span>
                        <span>{formatRuntimeOwner(item.owner)} · {formatRuntimeStatus(item.status)}</span>
                      </div>
                      <p className="mt-1 text-white/60">{formatRuntimeNarrative(item.nextAction)}</p>
                      <p className="mt-1 text-white/50">解锁: {formatRuntimeSchemaList(item.unlocks, '无')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    账号配置: {formatSetupItemCount(dispatchState.providerSetupPack.envTemplate, '资料可复核')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    门店授权: {dispatchState.providerSetupPack.merchantRequests.slice(0, 3).map(item => formatRuntimeNarrative(item.ask)).join(' / ') || '无'}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    本地替代: {dispatchState.providerSetupPack.internalFallbacks.slice(0, 2).map(item => `${formatRuntimeSchemaLabel(item.capability)}: ${item.canDoNow.slice(0, 2).map(formatRuntimeNarrative).join(', ')}`).join(' / ')}
                  </div>
                </div>
                <div className="mt-2 border border-white/10 bg-white/[0.05] p-2 text-white/60">
                  {formatRuntimeNarrative(dispatchState.providerSetupPack.safetyBoundary)}
                </div>
              </div>
            ) : null}
            {dispatchState.externalExecutionWizard ? (
              <div className="md:col-span-3">
                <div className="text-white/45">试跑补资料向导</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">试跑补资料向导</div>
                    <p className="mt-1 text-white/60">{dispatchState.externalExecutionWizard.restaurant} / {dispatchState.externalExecutionWizard.offer}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeStatus(dispatchState.externalExecutionWizard.verdict)}</div>
                    <p className="mt-1 text-white/60">结论</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.externalExecutionWizard.summary.readySteps}/{dispatchState.externalExecutionWizard.summary.steps}</div>
                    <p className="mt-1 text-white/60">待复核步骤</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.externalExecutionWizard.summary.missingProviderGates}</div>
                    <p className="mt-1 text-white/60">待补资料</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeStatus(dispatchState.externalExecutionWizard.executionPackage.status)}</div>
                    <p className="mt-1 text-white/60">试跑通道交接包</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  {dispatchState.externalExecutionWizard.steps.map(step => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={step.id}>
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-mono text-white">{formatRuntimeNarrative(step.title)}</span>
                        <span>{formatRuntimeOwner(step.owner)} · {formatRuntimeStatus(step.status)}</span>
                      </div>
                      <p className="mt-1 text-white/60">{formatRuntimeNarrative(step.nextAction)}</p>
                      <p className="mt-1 text-white/50">凭证: {formatRuntimeSchemaList(step.evidence.slice(0, 3), '无')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    执行清单: {dispatchState.externalExecutionWizard.operatorScript.map(formatRuntimeNarrative).join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.externalExecutionWizard.safetyBoundary)}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.controlledTrialRun ? (
              <div className="md:col-span-3">
                <div className="text-white/45">受控试跑</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">受控试跑</div>
                    <p className="mt-1 text-white/60">{dispatchState.controlledTrialRun.restaurant} / {dispatchState.controlledTrialRun.offer}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeStatus(dispatchState.controlledTrialRun.verdict)}</div>
                    <p className="mt-1 text-white/60">{formatRuntimeStatus(dispatchState.controlledTrialRun.mode)}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.controlledTrialRun.simulation.callback.signatureVerified ? '已验证' : '已拒绝'}</div>
                    <p className="mt-1 text-white/60">签名回执</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeStatus(dispatchState.controlledTrialRun.simulation.receipt.status)}</div>
                    <p className="mt-1 text-white/60">回执样例待复核</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.controlledTrialRun.businessSignals.summary.visitIntent}</div>
                    <p className="mt-1 text-white/60">到店意向</p>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {dispatchState.controlledTrialRun.operatorCloseout.map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={`${item.owner}-${item.evidence}`}>
                      <div className="font-mono text-white">{formatRuntimeOwner(item.owner)}</div>
                      <p className="mt-1 text-white/60">{formatRuntimeNarrative(item.action)}</p>
                      <p className="mt-1 text-white/50">凭证: {formatRuntimeEvidenceValue(item.evidence)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    账号资料: {formatRuntimeSchemaList(dispatchState.controlledTrialRun.externalRequired.slice(0, 3), '无')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.controlledTrialRun.safetyBoundary)}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.toolPolicy ? (
              <div className="md:col-span-3">
                <div className="text-white/45">工具边界与账号配置保护</div>
                <div className="mt-2 grid gap-2 md:grid-cols-5">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.toolPolicy.summary.internalReady}</div>
                    <p className="mt-1 text-white/60">本地可先准备</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.toolPolicy.summary.externalReady}</div>
                    <p className="mt-1 text-white/60">账号资料待复核</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.toolPolicy.summary.blocked}</div>
                    <p className="mt-1 text-white/60">待补条件</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.toolPolicy.summary.forbidden}</div>
                    <p className="mt-1 text-white/60">禁止项</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">
                      {dispatchState.toolPolicy.secretProxy.slots.filter(slot => slot.configured).length}/{dispatchState.toolPolicy.secretProxy.slots.length}
                    </div>
                    <p className="mt-1 text-white/60">账号配置槽位</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.toolPolicy.decisions.map(decision => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.9fr_0.6fr_1.4fr]" key={decision.action}>
                      <span className="font-mono text-white">{formatRuntimeActionLabel(decision.action)}</span>
                      <span>{formatRuntimeStatus(decision.decision)}</span>
                      <span>{decision.blockedReasons.length ? formatRuntimeSchemaList(decision.blockedReasons, '无') : formatRuntimeNarrative(decision.nextAction)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    敏感配置外露数: {dispatchState.toolPolicy.secretProxy.exposedSecretCount}；交接方式: {formatRuntimeStatus(dispatchState.toolPolicy.secretProxy.mode)}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.toolPolicy.safetyBoundary)}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.publicProfile ? (
              <div className="md:col-span-3">
                <div className="text-white/45">公开门店资料录入</div>
                <div className="mt-2 grid gap-2 md:grid-cols-4">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{formatRuntimeStatus(dispatchState.publicProfile.mode)}</div>
                    <p className="mt-1 text-white/60">{dispatchState.publicProfile.profile.restaurant}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">
                      {dispatchState.publicProfile.fields.filter(item => item.confidence !== 'missing').length}/{dispatchState.publicProfile.fields.length}
                    </div>
                    <p className="mt-1 text-white/60">可复核字段</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.publicProfile.memoryUpserts.length}</div>
                    <p className="mt-1 text-white/60">记忆写入</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.publicProfile.missingForActivation.length}</div>
                    <p className="mt-1 text-white/60">待补条件</p>
                  </div>
                </div>
                {dispatchState.publicIntelligenceBrief ? (
                  <div className="mt-3 border border-emerald-200/25 bg-emerald-200/[0.06] p-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-100/70">公开情报简报</div>
                        <p className="mt-1 text-sm font-black text-white">
                          本地可先准备 {dispatchState.publicIntelligenceBrief.readiness.internalActions} 项 / 待补账号/授权/数据 {dispatchState.publicIntelligenceBrief.readiness.externalGates} 项
                        </p>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-3 md:min-w-[420px]">
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicIntelligenceBrief.readiness.usableFields}</div>
                          <p className="mt-1 text-white/55">可复核字段</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicIntelligenceBrief.readiness.canStartTrial ? '可试跑' : '草稿'}</div>
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
                          <div className="font-mono text-white">{formatRuntimeSchemaLabel(item.platform)}</div>
                          <p className="mt-1 text-white/60">{item.usableNow ? '可先准备' : '待补凭证'}</p>
                          <p className="mt-1 line-clamp-3 text-white/45">{formatRuntimeNarrative(item.nextAction)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">素材缺口</div>
                        <div className="mt-2 space-y-1">
                          {dispatchState.publicIntelligenceBrief.materialChecklist.slice(0, 4).map(item => (
                            <p className="text-white/60" key={item.id}>{formatRuntimeStatus(item.status)} · {formatRuntimeNarrative(item.label)} · {formatRuntimeOwner(item.owner)}</p>
                          ))}
                        </div>
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">运营脚本</div>
                        {dispatchState.publicIntelligenceBrief.operatorScript.map(item => (
                          <p className="mt-1 text-white/60" key={item}>{formatRuntimeNarrative(item)}</p>
                        ))}
                        <button
                          className="mt-2 border border-emerald-200/50 px-2 py-1 text-[11px] font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildPublicSourceHarvestPack}
                          type="button"
                        >
                          生成公开资料包
                        </button>
                        <button
                          className="ml-2 mt-2 border border-emerald-200/50 px-2 py-1 text-[11px] font-black text-emerald-100 transition hover:bg-emerald-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildPublicTrialSeed}
                          type="button"
                        >
                          生成首轮试跑底稿
                        </button>
                        <button
                          className="ml-2 mt-2 border border-amber-200/50 px-2 py-1 text-[11px] font-black text-amber-100 transition hover:bg-amber-200/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={dispatchState.status === 'loading'}
                          onClick={buildDayZeroMissionPack}
                          type="button"
                        >
                          生成第一天任务包
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
                          第一天任务包 / {formatRuntimeStatus(dispatchState.dayZeroMissionPack.verdict)}
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-white/45">
                          {dispatchState.dayZeroMissionPack.restaurant} / {dispatchState.dayZeroMissionPack.offer}
                        </p>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-4 md:min-w-[520px]">
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.dayZeroMissionPack.summary.readyInternal}</div>
                          <p className="mt-1 text-white/55">本地可先准备</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.dayZeroMissionPack.summary.needsMerchantEvidence}</div>
                          <p className="mt-1 text-white/55">店长凭证</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.dayZeroMissionPack.summary.externalGated}</div>
                          <p className="mt-1 text-white/55">待补账号/授权/数据</p>
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
                            <div className="font-mono text-white">{formatRuntimeOwner(item.owner)} / {formatRuntimeSchemaLabel(item.lane)}</div>
                            <span className="border border-white/10 px-2 py-1 text-[10px] font-black text-white/70">{formatRuntimeStatus(item.status)}</span>
                          </div>
                          <p className="mt-1 text-white/70">{formatRuntimeNarrative(item.title)}</p>
                          <p className="mt-1 text-white/45">{formatRuntimeNarrative(item.nextAction)}</p>
                          <p className="mt-1 text-white/35">凭证: {formatRuntimeEvidenceValue(item.evidenceRequired)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">店长检查清单</div>
                        {dispatchState.dayZeroMissionPack.storeManagerChecklist.slice(0, 5).map(item => (
                          <p className="mt-1 text-white/60" key={`${item.owner}-${item.action}`}>{formatRuntimeOwner(item.owner)}: {formatRuntimeNarrative(item.action)}</p>
                        ))}
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">待补资料</div>
                        {dispatchState.dayZeroMissionPack.providerUnlocks.slice(0, 5).map(item => (
                          <p className="mt-1 text-white/60" key={item}>{formatRuntimeNarrative(item)}</p>
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 border border-white/10 bg-white/[0.05] p-2 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(dispatchState.dayZeroMissionPack.safetyBoundary)}</p>
                  </div>
                ) : null}
                {dispatchState.publicTrialSeed ? (
                  <div className="mt-3 border border-violet-200/25 bg-violet-200/[0.06] p-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-violet-100/70">公开试跑种子</div>
                        <p className="mt-1 text-sm font-black text-white">
                          首轮试跑底稿 / {formatRuntimeStatus(dispatchState.publicTrialSeed.verdict)}
                        </p>
                        <p className="mt-1 text-[11px] leading-4 text-white/45">
                          {dispatchState.publicTrialSeed.trialIntake.restaurant} / {dispatchState.publicTrialSeed.trialIntake.offer}
                        </p>
                      </div>
                      <div className="grid gap-2 text-xs sm:grid-cols-4 md:min-w-[520px]">
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicTrialSeed.summary.usableFields}</div>
                          <p className="mt-1 text-white/55">可复核字段</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicTrialSeed.summary.internalHarvestTargets}</div>
                          <p className="mt-1 text-white/55">本地采集</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicTrialSeed.summary.workflowReadySteps}</div>
                          <p className="mt-1 text-white/55">待复核步骤</p>
                        </div>
                        <div className="border border-white/10 bg-white/[0.05] p-2">
                          <div className="font-mono text-white">{dispatchState.publicTrialSeed.summary.workflowExternalGatedSteps}</div>
                          <p className="mt-1 text-white/55">待补账号/授权/数据</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">试跑录入</div>
                        {Object.entries(dispatchState.publicTrialSeed.trialIntake).slice(0, 6).map(([key, value]) => (
                          <p className="mt-1 text-white/60" key={key}>{formatRuntimeSchemaLabel(key)}: {formatRuntimeEvidenceValue(value, '待补资料')}</p>
                        ))}
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">下一步动作</div>
                        {dispatchState.publicTrialSeed.nextActions.map(item => (
                          <p className="mt-1 text-white/60" key={`${item.owner}-${item.action}`}>{formatRuntimeOwner(item.owner)}: {formatRuntimeNarrative(item.action)}</p>
                        ))}
                      </div>
                    </div>
                    <p className="mt-3 border border-white/10 bg-white/[0.05] p-2 text-[11px] leading-4 text-white/45">{formatRuntimeNarrative(dispatchState.publicTrialSeed.safetyBoundary)}</p>
                  </div>
                ) : null}
                {dispatchState.publicSourceHarvestPack ? (
                  <div className="mt-3 border border-sky-200/25 bg-sky-200/[0.06] p-3">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-100/70">公开资料采集包</div>
                        <p className="mt-1 text-sm font-black text-white">
                          公开资料采集包 / {formatRuntimeStatus(dispatchState.publicSourceHarvestPack.verdict)}
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
                          <div className="font-mono text-white">{formatRuntimeSchemaLabel(item.platform)}</div>
                          <p className="mt-1 text-white/60">{formatRuntimeStatus(item.mode)}</p>
                          <p className="mt-1 line-clamp-3 text-white/45">{formatRuntimeNarrative(item.nextAction)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">标准化导入字段</div>
                        {dispatchState.publicSourceHarvestPack.normalizedImportTemplate.slice(0, 5).map(item => (
                          <p className="mt-1 text-white/60" key={item.field}>{formatRuntimeSchemaLabel(item.field)}: {formatRuntimeEvidenceValue(item.currentValue, '待补资料')}</p>
                        ))}
                      </div>
                      <div className="border border-white/10 bg-white/[0.05] p-2">
                        <div className="text-white/45">执行边界</div>
                        {dispatchState.publicSourceHarvestPack.browserRunnerInstructions.map(item => (
                          <p className="mt-1 text-white/60" key={item}>{formatRuntimeNarrative(item)}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {dispatchState.publicProfile.fields.slice(0, 6).map(item => (
                    <div className="border border-white/10 bg-white/[0.05] p-2" key={item.field}>
                      <div className="font-mono text-white">{formatRuntimeSchemaLabel(item.field)} · {formatRuntimeStatus(item.confidence)}</div>
                      <p className="mt-1 text-white/60">{formatRuntimeEvidenceValue(item.value, '待补资料')}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeSchemaLabel(dispatchState.publicProfile.evidenceLedger[0]?.source)} · {formatRuntimeNarrative(dispatchState.publicProfile.evidenceLedger[0]?.license)}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.publicProfile.safetyBoundary)}
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
                    <p className="mt-1 text-white/60">待复核</p>
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
                    <p className="mt-1 text-white/60">待补条件</p>
                  </div>
                </div>
                <div className="mt-2 space-y-2">
                  {dispatchState.opsConsole.timeline.slice(0, 5).map((item, index) => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.5fr_0.5fr_1fr_1.5fr]" key={`${item.stage}-${item.eventId}-${item.title}`}>
                      <span className="font-mono text-white">阶段 {index + 1}</span>
                      <span>{formatRuntimeStatus(item.status)}</span>
                      <span>{formatRuntimeNarrative(item.title)}</span>
                      <span>{formatRuntimeNarrative(item.detail)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-2">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeSchemaList(dispatchState.opsConsole.blockedExternal.slice(0, 2), '没有账号资料卡点')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.opsConsole.safetyBoundary)}
                  </div>
                </div>
              </div>
            ) : null}
            {dispatchState.executionTimeline ? (
              <div className="md:col-span-3">
                <div className="text-white/45">试跑时间线</div>
                <div className="mt-2 grid gap-2 md:grid-cols-6">
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">试跑时间线</div>
                    <p className="mt-1 text-white/60">{formatRuntimeStatus(dispatchState.executionTimeline.mode)}</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionTimeline.summary.runs}</div>
                    <p className="mt-1 text-white/60">运行</p>
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2">
                    <div className="font-mono text-white">{dispatchState.executionTimeline.summary.acceptedReceipts}</div>
                    <p className="mt-1 text-white/60">待复核</p>
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
                  {dispatchState.executionTimeline.items.slice(0, 6).map((item, index) => (
                    <div className="grid gap-2 border border-white/10 bg-white/[0.05] p-2 md:grid-cols-[0.55fr_0.55fr_1fr_1.4fr_1.2fr]" key={item.id}>
                      <span className="font-mono text-white">阶段 {index + 1}</span>
                      <span>{formatRuntimeStatus(item.status)}</span>
                      <span>{formatRuntimeNarrative(item.title)}</span>
                      <span>{formatRuntimeNarrative(item.nextAction)}</span>
                      <span className="text-white/50">{formatRuntimeSchemaLabel(item.memoryWrite)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    下一次巡检: 待复核安排 · {dispatchState.executionTimeline.nextHeartbeat.followups.slice(0, 2).map(item => formatRuntimeNarrative(item.nextAction)).join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    恢复动作: {dispatchState.executionTimeline.recovery.actions.slice(0, 2).map(item => formatRuntimeNarrative(item.nextStep)).join(' / ')}
                  </div>
                  <div className="border border-white/10 bg-white/[0.05] p-2 text-white/60">
                    {formatRuntimeNarrative(dispatchState.executionTimeline.safetyBoundary)}
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
            <p className="text-[11px] font-semibold tracking-[0.16em] text-stone-500">还差哪些账号资料</p>
            <h3 className="mt-1 text-lg font-black text-stone-950">发布、线索承接、核销的接入条件</h3>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-stone-600">
              竞品能做的试跑交接，本质上需要受控试跑通道、店长账号授权、收银/核销数据约定和回执签名。这里把本地能做的工单先做实，缺账号资料的逐项标成待补资料。
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
                <h4 className="text-sm font-black text-stone-950">{formatRuntimeNarrative(group.name)}</h4>
                <span className={`shrink-0 border px-2 py-1 text-[10px] font-black ${group.status === 'ready' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
                  {formatRuntimeStatus(group.status)}
                </span>
              </div>
              <p className="mt-2 text-xs leading-5 text-stone-600">{formatRuntimeNarrative(group.purpose)}</p>
              <div className="mt-3 space-y-1">
                {group.requirements.map(requirement => (
                  <div className="flex items-start justify-between gap-2 text-[11px]" key={requirement.id}>
                    <span className="text-stone-700">{formatRuntimeNarrative(requirement.label)}</span>
                    <span className={requirement.configured ? 'font-semibold text-emerald-700' : 'font-semibold text-rose-700'}>
                      {requirement.configured ? '已接好' : '缺少'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="mt-3 border-l-2 border-stone-300 pl-3 text-[11px] leading-5 text-stone-500">{formatRuntimeNarrative(group.nextAction)}</p>
            </article>
          ))}
        </div>
        <div className="mt-3 border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
          {formatRuntimeNarrative(initialReadiness.safetyBoundary)}
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="border border-stone-200 bg-white p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] text-stone-500">今天要做的门店任务</p>
              <h3 className="mt-1 text-lg font-black text-stone-950">门店任务队列</h3>
            </div>
            <span className="border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold text-stone-600">可复核</span>
          </div>
          <div className="mt-4 divide-y divide-stone-200">
            {runtime.tasks.map(task => (
              <div className="py-3 first:pt-0 last:pb-0" key={task.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-black text-stone-950">{formatRuntimeNarrative(task.agent)}</div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold">
                    <span className="bg-stone-100 px-2 py-1 text-stone-600">{modeLabel[task.mode]}</span>
                    <span className="bg-stone-100 px-2 py-1 text-stone-600">{formatRuntimeOwner(task.owner)}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs leading-5 text-stone-600">{formatRuntimeNarrative(task.trigger)}</p>
                <p className="mt-1 text-xs leading-5 text-stone-800">{formatRuntimeNarrative(task.action)}</p>
                <p className="mt-2 text-[11px] leading-5 text-stone-500">证据：{formatRuntimeNarrative(task.evidenceRequired)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-stone-200 bg-white p-4">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-stone-500">下次默认带出的门店偏好</p>
          <h3 className="mt-1 text-lg font-black text-stone-950">门店记忆主动跟进</h3>
          <div className="mt-4 space-y-3">
            {runtime.memoryRules.map(rule => (
              <article className="border border-stone-200 bg-[#fbfaf7] p-3" key={rule.entity}>
                <div className="text-sm font-black text-stone-950">{formatRuntimeSchemaLabel(rule.entity)}</div>
                <p className="mt-2 text-xs leading-5 text-stone-600">写入：{formatRuntimeNarrative(rule.writes)}</p>
                <p className="mt-1 text-xs leading-5 text-stone-600">用于：{formatRuntimeNarrative(rule.readsFor)}</p>
                <p className="mt-1 text-[11px] leading-5 text-rose-700">{formatRuntimeNarrative(rule.safety)}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="border border-stone-200 bg-white p-4">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-stone-500">账号和操作边界</p>
          <h3 className="mt-1 text-lg font-black text-stone-950">试跑工具与资料边界</h3>
          <p className="mt-3 text-xs leading-5 text-stone-600">{formatRuntimeNarrative(capabilityPlan.session.browserProfile.approvalRequired)}</p>
          <div className="mt-4 space-y-2">
            {capabilityPlan.session.toolPolicy.map(policy => (
              <div className="flex items-start justify-between gap-3 border border-stone-200 bg-[#fbfaf7] p-2" key={policy.tool}>
                <div>
                  <div className="font-mono text-xs text-stone-950">{formatRuntimeToolLabel(policy.tool)}</div>
                  <p className="mt-1 text-[11px] leading-5 text-stone-500">{formatRuntimeNarrative(policy.reason)}</p>
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
                <div className="font-mono text-xs font-black text-stone-950">{formatRuntimeSchemaLabel(watcher.event)}</div>
                <p className="mt-1 text-xs leading-5 text-stone-600">{formatRuntimeNarrative(watcher.derives)}</p>
                <p className="mt-1 text-[11px] leading-5 text-stone-500">{formatRuntimeNarrative(watcher.nextAction)}</p>
              </article>
            ))}
          </div>
          <div className="mt-4 border border-stone-200 bg-stone-50 p-3">
            <div className="text-[11px] font-semibold text-stone-500">回执字段</div>
            <p className="mt-2 text-xs leading-5 text-stone-700">{formatRuntimeSchemaList(capabilityPlan.session.receiptSchema, '无')}</p>
          </div>
        </section>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="border border-stone-200 bg-[#fbfaf7] p-4">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-stone-500">账号与试跑交接条件</p>
          <h3 className="mt-1 text-lg font-black text-stone-950">账号、授权和回执齐了再接通</h3>
          <p className="mt-3 text-xs leading-5 text-stone-600">{formatRuntimeNarrative(runtime.summary.nextRuntimeChoice)}</p>
          <div className="mt-4 space-y-3">
            {runtime.references.map((reference, index) => (
              <div
                className="block border border-stone-200 bg-white p-3 transition hover:border-stone-300"
                key={reference.name}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-black text-stone-950">试跑通道资料 {index + 1}</span>
                  <span className="text-[11px] font-semibold text-stone-500">需接入</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-stone-600">{formatRuntimeNarrative(reference.usefulCapability)}</p>
                <p className="mt-2 text-[11px] leading-5 text-stone-500">{formatRuntimeNarrative(reference.attachRequirement)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border border-stone-200 bg-white p-4">
          <p className="text-[11px] font-semibold tracking-[0.16em] text-stone-500">账号和表格接入清单</p>
          <h3 className="mt-1 text-lg font-black text-stone-950">账号、截图和经营表格</h3>
          <div className="mt-4 overflow-hidden border border-stone-200">
            {externalConnectors.map(connector => (
              <div className="grid gap-3 border-b border-stone-200 p-3 last:border-b-0 md:grid-cols-[0.85fr_1.15fr]" key={connector.id}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-stone-950">{formatRuntimeNarrative(connector.name)}</span>
                    <span className={`border px-2 py-1 text-[10px] font-black ${statusTone[connector.status]}`}>{statusLabel[connector.status]}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-stone-600">{formatRuntimeNarrative(connector.capability)}</p>
                </div>
                <div>
                  <p className="text-xs leading-5 text-stone-700">{formatRuntimeNarrative(connector.nextAttachStep)}</p>
                  <p className="mt-2 text-[11px] leading-5 text-rose-700">{formatRuntimeNarrative(connector.auditBoundary)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-4 border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
        下一步先接：先提供一个隔离试跑环境或试跑交接通道，再接门店平台账号授权；收银、核销和私信数据必须来自店长导出、系统导出或明确授权。
      </div>
    </section>
  );
}

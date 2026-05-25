import type { RestaurantBrowserSessionRecord } from '@/lib/restaurant-agent-browser-session-store';
import { buildRestaurantExternalReadiness, type RestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantStoreManagerFollowupPack, type RestaurantStoreManagerFollowupPack } from '@/lib/restaurant-store-manager-followup';
import { buildRestaurantStoreManagerTaskQueue, type RestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';
import { buildRestaurantStoreManagerTaskWatcher, type RestaurantStoreManagerTaskWatcher } from '@/lib/restaurant-store-manager-task-watcher';
import { buildRestaurantStaffNotificationHandoff, type RestaurantStaffNotificationHandoff } from '@/lib/restaurant-staff-notification-handoff';
import { buildRestaurantStaffNotificationDeliveryBridge, type RestaurantStaffNotificationDeliveryBridge } from '@/lib/restaurant-staff-notification-delivery-bridge';
import { buildRestaurantStaffNotificationAuditLog, type RestaurantStaffNotificationAuditLog } from '@/lib/restaurant-staff-notification-audit-store';
import { buildRestaurantTaskProviderHandoff, type RestaurantTaskProviderHandoff } from '@/lib/restaurant-task-provider-handoff';
import { buildRestaurantAiEmployeeInbox, type RestaurantAiEmployeeInbox } from '@/lib/restaurant-ai-employee-inbox';
import { buildRestaurantAgentChannelHub, type RestaurantAgentChannelHub } from '@/lib/restaurant-agent-channel-hub';
import { buildRestaurantAgentChannelDeliveryReport, type RestaurantAgentChannelDeliveryReport } from '@/lib/restaurant-agent-channel-delivery-store';
import { buildRestaurantExternalExecutionWizard, type RestaurantExternalExecutionWizard } from '@/lib/restaurant-external-execution-wizard';
import { buildRestaurantExecutionTimeline, type RestaurantExecutionTimeline } from '@/lib/restaurant-execution-timeline';
import { buildRestaurantProviderSetupPack, type RestaurantProviderSetupPack } from '@/lib/restaurant-provider-setup-pack';
import { buildRestaurantProviderSetupWizard, type RestaurantProviderSetupWizard } from '@/lib/restaurant-provider-setup-wizard';
import { buildRestaurantProviderSetupStateSummary, type RestaurantProviderSetupStateSummary } from '@/lib/restaurant-provider-setup-state-store';
import { buildRestaurantProviderReadinessHealth, type RestaurantProviderReadinessHealth } from '@/lib/restaurant-provider-readiness-health';
import { buildRestaurantProviderUnlockLadder, type RestaurantProviderUnlockLadder } from '@/lib/restaurant-provider-unlock-ladder';
import { buildRestaurantGmCommandDeck, type RestaurantGmCommandDeck } from '@/lib/restaurant-gm-command-deck';
import { buildRestaurantShiftAutopilot, type RestaurantShiftAutopilot } from '@/lib/restaurant-shift-autopilot';
import { buildRestaurantPublicIntelligenceBrief, type RestaurantPublicIntelligenceBrief } from '@/lib/restaurant-public-intelligence-brief';
import { buildRestaurantBenchmarkStrategy, type RestaurantBenchmarkStrategy } from '@/lib/restaurant-benchmark-strategy';
import { buildRestaurantActivationCockpit, type RestaurantActivationCockpit } from '@/lib/restaurant-activation-cockpit';
import { buildRestaurantClawSkillWorkbench, type RestaurantClawSkillWorkbench } from '@/lib/restaurant-claw-skill-workbench';
import { buildRestaurantClawSkillExecutionLedger, type RestaurantClawSkillExecutionLedger } from '@/lib/restaurant-claw-skill-execution-store';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantCommandCenterMode =
  | 'trial-ready'
  | 'waiting-receipt'
  | 'needs-recovery'
  | 'business-review'
  | 'setup-required'
  | 'external-ready';

export type RestaurantCommandCenterAction = {
  id: string;
  label: string;
  action: 'controlled-trial-run' | 'execution-timeline' | 'external-execution-wizard' | 'provider-setup-pack' | 'recovery' | 'business-signals' | 'store-manager-followup';
  owner: 'ops' | 'runtime-admin' | 'store-manager' | 'merchant';
  reason: string;
  evidenceRequired: string;
};

export type RestaurantAgentCommandCenter = {
  ok: true;
  payloadShape: 'restaurant-agent-command-center-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  mode: RestaurantCommandCenterMode;
  headline: string;
  summary: {
    runs: number;
    acceptedReceipts: number;
    businessSignals: number;
    providerGates: number;
    blockedRuns: number;
    waitingReceipt: number;
    channelDeliveryAttempts: number;
    channelDeliveryBlocked: number;
    channelDeliveryRetryRecommended: number;
    channelDeliveryAcknowledged: number;
    channelDeliveryActionRequired: number;
    canForwardExternally: boolean;
    clawSkillExecutionRecords: number;
  };
  primaryAction: RestaurantCommandCenterAction;
  secondaryActions: RestaurantCommandCenterAction[];
  currentEvidence: string;
  nextAction: string;
  timeline: Pick<RestaurantExecutionTimeline, 'payloadShape' | 'mode' | 'summary' | 'items' | 'safetyBoundary'>;
  storeManagerFollowup: Pick<RestaurantStoreManagerFollowupPack, 'payloadShape' | 'summary' | 'tasks' | 'managerBrief' | 'externalRequired' | 'safetyBoundary'>;
  storeManagerTaskQueue: Pick<RestaurantStoreManagerTaskQueue, 'payloadShape' | 'summary' | 'tasks' | 'nextAction' | 'safetyBoundary'>;
  storeManagerTaskWatcher: Pick<RestaurantStoreManagerTaskWatcher, 'payloadShape' | 'summary' | 'wakeups' | 'externalRequired' | 'safetyBoundary'>;
  aiEmployeeInbox: Pick<RestaurantAiEmployeeInbox, 'payloadShape' | 'employee' | 'summary' | 'messages' | 'memory' | 'nextWakeup' | 'externalRequired' | 'safetyBoundary'>;
  channelHub: Pick<RestaurantAgentChannelHub, 'payloadShape' | 'summary' | 'channels' | 'scheduledJobs' | 'commandSuggestions' | 'externalRequired' | 'safetyBoundary'>;
  channelDeliveryReport: Pick<RestaurantAgentChannelDeliveryReport, 'payloadShape' | 'summary' | 'latest' | 'latestAcknowledgements' | 'externalRequired' | 'safetyBoundary'>;
  publicIntelligenceBrief: Pick<RestaurantPublicIntelligenceBrief, 'payloadShape' | 'readiness' | 'platformProfiles' | 'materialChecklist' | 'operatorScript' | 'externalRequired' | 'safetyBoundary'>;
  benchmarkStrategy: Pick<RestaurantBenchmarkStrategy, 'payloadShape' | 'recommendation' | 'summary' | 'candidates' | 'nextBuildOrder' | 'safetyBoundary'>;
  activationCockpit: Pick<RestaurantActivationCockpit, 'payloadShape' | 'summary' | 'lanes' | 'answerForCustomer' | 'nextInternalTraining' | 'externalSetupRequests' | 'safetyBoundary'>;
  clawSkillWorkbench: Pick<RestaurantClawSkillWorkbench, 'payloadShape' | 'mode' | 'summary' | 'selectedModules' | 'deliverables' | 'commandScript' | 'externalRequired' | 'safetyBoundary'>;
  clawSkillExecutionLedger: Pick<RestaurantClawSkillExecutionLedger, 'payloadShape' | 'summary' | 'latest' | 'nextAction' | 'safetyBoundary'>;
  staffNotificationHandoff: Pick<RestaurantStaffNotificationHandoff, 'payloadShape' | 'summary' | 'drafts' | 'operatorChecklist' | 'externalRequired' | 'safetyBoundary'>;
  staffNotificationDeliveryBridge: Pick<RestaurantStaffNotificationDeliveryBridge, 'payloadShape' | 'summary' | 'items' | 'externalRequired' | 'safetyBoundary'>;
  staffNotificationAuditLog: Pick<RestaurantStaffNotificationAuditLog, 'payloadShape' | 'summary' | 'latest' | 'externalRequired' | 'safetyBoundary'>;
  taskProviderHandoff: Pick<RestaurantTaskProviderHandoff, 'payloadShape' | 'summary' | 'packages' | 'blockedPackages' | 'providerContract' | 'operatorChecklist' | 'externalRequired' | 'safetyBoundary'>;
  providerSetup: Pick<RestaurantProviderSetupPack, 'payloadShape' | 'summary' | 'priorityRequests' | 'copyForMerchant' | 'safetyBoundary'>;
  providerSetupWizard: Pick<RestaurantProviderSetupWizard, 'payloadShape' | 'summary' | 'sections' | 'handoffPayload' | 'externalRequired' | 'safetyBoundary'>;
  providerSetupState: Pick<RestaurantProviderSetupStateSummary, 'payloadShape' | 'summary' | 'provided' | 'latest' | 'safetyBoundary'>;
  providerReadinessHealth: Pick<RestaurantProviderReadinessHealth, 'payloadShape' | 'summary' | 'items' | 'nextActions' | 'externalRequired' | 'safetyBoundary'>;
  providerUnlockLadder: Pick<RestaurantProviderUnlockLadder, 'payloadShape' | 'summary' | 'items' | 'nextExternalAsks' | 'safetyBoundary'>;
  gmCommandDeck: Pick<RestaurantGmCommandDeck, 'payloadShape' | 'shiftMode' | 'answerForOwner' | 'summary' | 'lanes' | 'aiAutopilotQueue' | 'staffQueue' | 'providerQueue' | 'evidenceQueue' | 'safetyBoundary'>;
  shiftAutopilot: Pick<RestaurantShiftAutopilot, 'payloadShape' | 'summary' | 'steps' | 'nowQueue' | 'nextWakeups' | 'providerQueue' | 'evidenceQueue' | 'operatingPolicy' | 'safetyBoundary'>;
  externalWizard: Pick<RestaurantExternalExecutionWizard, 'payloadShape' | 'verdict' | 'canForward' | 'summary' | 'steps' | 'safetyBoundary'>;
  operatorBrief: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function modeFor(input: {
  timeline: RestaurantExecutionTimeline;
  providerSetup: RestaurantProviderSetupPack;
  wizard: RestaurantExternalExecutionWizard;
}): RestaurantCommandCenterMode {
  if (input.wizard.canForward) return 'external-ready';
  if (input.timeline.summary.acceptedReceipts > 0 && input.timeline.summary.businessSignals > 0) return 'business-review';
  if (input.timeline.mode === 'needs-recovery') return 'needs-recovery';
  if (input.timeline.mode === 'waiting-receipt') return 'waiting-receipt';
  if (input.timeline.mode === 'business-review') return 'business-review';
  if (input.timeline.summary.runs === 0) return 'trial-ready';
  if (input.providerSetup.summary.missing) return 'setup-required';
  return 'trial-ready';
}

function primaryActionFor(mode: RestaurantCommandCenterMode, timeline: RestaurantExecutionTimeline): RestaurantCommandCenterAction {
  if (mode === 'external-ready') {
    return {
      id: 'forward-governed-package',
      label: 'Forward Ready Package',
      action: 'external-execution-wizard',
      owner: 'runtime-admin',
      reason: 'External runtime gates are ready; forward only through governed package and signed receipt.',
      evidenceRequired: 'ready wizard verdict, package id, signed callback receipt',
    };
  }
  if (mode === 'needs-recovery') {
    return {
      id: 'recover-blocked-run',
      label: 'Recover Blocked Run',
      action: 'recovery',
      owner: 'ops',
      reason: timeline.recovery.actions[0]?.nextStep || 'A run is blocked or rejected and needs an owner action.',
      evidenceRequired: timeline.recovery.actions[0]?.evidenceRequired || 'blocked run, recovery owner, next proof',
    };
  }
  if (mode === 'waiting-receipt') {
    return {
      id: 'collect-receipt',
      label: 'Collect Receipt',
      action: 'execution-timeline',
      owner: 'ops',
      reason: 'A forwarded or queued run is waiting for public proof, screenshot, or signed receipt.',
      evidenceRequired: timeline.items[0]?.evidence || 'public proof link, screenshot id, or signed callback receipt',
    };
  }
  if (mode === 'business-review') {
    return {
      id: 'store-manager-followup',
      label: 'Store Follow-up',
      action: 'store-manager-followup',
      owner: 'store-manager',
      reason: timeline.businessSignals.nextActions[0] || 'Accepted receipt created aggregate business signals for follow-up.',
      evidenceRequired: 'accepted receipt and aggregate reservation/coupon/inquiry/visit signal',
    };
  }
  if (mode === 'setup-required') {
    return {
      id: 'resolve-provider-gates',
      label: 'Resolve Gates',
      action: 'provider-setup-pack',
      owner: 'runtime-admin',
      reason: 'Provider, merchant authorization, browser runtime, callback, or POS gates still block external automation.',
      evidenceRequired: 'configured server env, merchant grant, isolated browser profile, POS/data contract',
    };
  }
  return {
    id: 'run-controlled-trial',
    label: 'Run Trial',
    action: 'controlled-trial-run',
    owner: 'ops',
    reason: 'No real external runtime is required to prove the internal task, callback, receipt, health and follow-up loop.',
    evidenceRequired: 'local simulator receipt, run health, business signal summary, owner closeout',
  };
}

export async function buildRestaurantAgentCommandCenter(input: RestaurantTrialIntake & {
  runs?: RestaurantAgentRunRecord[];
  receipts?: RestaurantAgentReceiptRecord[];
  readiness?: RestaurantExternalReadiness;
  browserSessions?: RestaurantBrowserSessionRecord[];
  env?: Record<string, string | undefined>;
  fetcher?: typeof fetch;
  now?: Date;
} = {}): Promise<RestaurantAgentCommandCenter> {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, '试用门店');
  const offer = clean(input.offer, '今日主推套餐');
  const readiness = input.readiness || buildRestaurantExternalReadiness();
  const timeline = buildRestaurantExecutionTimeline({
    runs: input.runs || [],
    receipts: input.receipts || [],
    readiness,
    browserSessions: input.browserSessions,
    now,
  });
  const providerSetup = buildRestaurantProviderSetupPack({
    restaurant,
    offer,
    env: input.env,
    now,
  });
  const providerSetupState = buildRestaurantProviderSetupStateSummary(now);
  const providerSetupWizard = buildRestaurantProviderSetupWizard({
    restaurant,
    offer,
    env: input.env,
    provided: providerSetupState.provided,
    now,
  });
  const providerReadinessHealth = await buildRestaurantProviderReadinessHealth({
    env: input.env,
    fetcher: input.fetcher,
    providerSetupState,
    now,
  });
  const providerUnlockLadder = buildRestaurantProviderUnlockLadder({
    setupState: providerSetupState,
    health: providerReadinessHealth,
  });
  const storeManagerFollowup = buildRestaurantStoreManagerFollowupPack({
    restaurant,
    offer,
    runs: input.runs || [],
    receipts: input.receipts || [],
    now,
  });
  const storeManagerTaskQueue = buildRestaurantStoreManagerTaskQueue(now);
  const storeManagerTaskWatcher = buildRestaurantStoreManagerTaskWatcher(storeManagerTaskQueue, now);
  const staffNotificationHandoff = buildRestaurantStaffNotificationHandoff(storeManagerTaskWatcher, now);
  const staffNotificationDeliveryBridge = buildRestaurantStaffNotificationDeliveryBridge({ handoff: staffNotificationHandoff, now });
  const staffNotificationAuditLog = buildRestaurantStaffNotificationAuditLog(now);
  const taskProviderHandoff = buildRestaurantTaskProviderHandoff({
    queue: storeManagerTaskQueue,
    target: 'openclaw',
    env: input.env,
    now,
  });
  const channelDeliveryReport = buildRestaurantAgentChannelDeliveryReport(now);
  const publicIntelligenceBrief = buildRestaurantPublicIntelligenceBrief({
    restaurant,
    suggestedOffer: offer,
    suggestedAudience: input.audience,
    sourceUrl: input.evidence?.startsWith('http') ? input.evidence : undefined,
    now,
  });
  const benchmarkStrategy = buildRestaurantBenchmarkStrategy();
  const activationCockpit = buildRestaurantActivationCockpit({
    restaurant,
    offer,
    env: input.env,
    now,
  });
  const clawSkillExecutionLedger = buildRestaurantClawSkillExecutionLedger(now);
  const clawSkillWorkbench = buildRestaurantClawSkillWorkbench({
    restaurant,
    offer,
    audience: input.audience,
    channels: input.channels,
    visitReason: input.visitReason,
    constraints: input.constraints,
    evidence: input.evidence,
    now,
  });
  const externalWizard = await buildRestaurantExternalExecutionWizard({
    target: 'openclaw',
    requestedAction: 'capture_public_receipt',
    restaurant,
    offer,
    env: input.env,
    fetcher: input.fetcher,
    now,
  });
  const mode = modeFor({ timeline, providerSetup, wizard: externalWizard });
  const primaryAction = primaryActionFor(mode, timeline);
  const firstTimelineItem = timeline.items[0];
  const externalRequired = Array.from(new Set([
    ...providerSetup.priorityRequests.filter(item => item.status === 'missing').map(item => item.nextAction),
    ...externalWizard.steps.filter(item => item.status === 'blocked').map(item => item.nextAction),
  ])).slice(0, 8);

  const baseCommandCenter = {
    ok: true,
    payloadShape: 'restaurant-agent-command-center-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    mode,
    headline: mode === 'business-review'
      ? '已有可复核经营信号，交给店长跟进。'
      : mode === 'waiting-receipt'
        ? '任务已进入执行链路，下一步是拿到真实回执。'
        : mode === 'needs-recovery'
          ? '有运行被阻断，先恢复再继续。'
          : mode === 'external-ready'
            ? '外部执行条件已就绪，可以交给 runtime。'
            : '先跑一次受控试单，证明闭环能走通。',
    summary: {
      runs: timeline.summary.runs,
      acceptedReceipts: timeline.summary.acceptedReceipts,
      businessSignals: timeline.summary.businessSignals,
      providerGates: providerSetup.summary.missing,
      blockedRuns: timeline.summary.blockedRuns,
      waitingReceipt: timeline.summary.waitingReceipt,
      channelDeliveryAttempts: channelDeliveryReport.summary.total,
      channelDeliveryBlocked: channelDeliveryReport.summary.blocked + channelDeliveryReport.summary.failed,
      channelDeliveryRetryRecommended: channelDeliveryReport.latest.filter(item => item.status === 'blocked' || item.status === 'failed').length,
      channelDeliveryAcknowledged: channelDeliveryReport.summary.acknowledged,
      channelDeliveryActionRequired: channelDeliveryReport.summary.actionRequired,
      canForwardExternally: externalWizard.canForward,
      clawSkillExecutionRecords: clawSkillExecutionLedger.summary.total,
    },
    primaryAction,
    secondaryActions: [
      {
        id: 'open-execution-timeline',
        label: 'Open Timeline',
        action: 'execution-timeline',
        owner: 'ops',
        reason: 'Review run, receipt, watcher, recovery and business-signal sequence before closing the work.',
        evidenceRequired: firstTimelineItem?.evidence || 'timeline item evidence',
      },
      {
        id: 'open-provider-setup',
        label: 'Setup Gates',
        action: 'external-execution-wizard',
        owner: 'runtime-admin',
        reason: 'See exactly which provider, merchant, browser, callback and POS gates block competitor-grade automation.',
        evidenceRequired: externalRequired[0] || 'provider setup evidence',
      },
    ],
    currentEvidence: firstTimelineItem?.evidence || primaryAction.evidenceRequired,
    nextAction: firstTimelineItem?.nextAction || primaryAction.reason,
    timeline: {
      payloadShape: timeline.payloadShape,
      mode: timeline.mode,
      summary: timeline.summary,
      items: timeline.items.slice(0, 6),
      safetyBoundary: timeline.safetyBoundary,
    },
    storeManagerFollowup: {
      payloadShape: storeManagerFollowup.payloadShape,
      summary: storeManagerFollowup.summary,
      tasks: storeManagerFollowup.tasks.slice(0, 4),
      managerBrief: storeManagerFollowup.managerBrief,
      externalRequired: storeManagerFollowup.externalRequired,
      safetyBoundary: storeManagerFollowup.safetyBoundary,
    },
    storeManagerTaskQueue: {
      payloadShape: storeManagerTaskQueue.payloadShape,
      summary: storeManagerTaskQueue.summary,
      tasks: storeManagerTaskQueue.tasks.slice(0, 4),
      nextAction: storeManagerTaskQueue.nextAction,
      safetyBoundary: storeManagerTaskQueue.safetyBoundary,
    },
    storeManagerTaskWatcher: {
      payloadShape: storeManagerTaskWatcher.payloadShape,
      summary: storeManagerTaskWatcher.summary,
      wakeups: storeManagerTaskWatcher.wakeups.slice(0, 4),
      externalRequired: storeManagerTaskWatcher.externalRequired,
      safetyBoundary: storeManagerTaskWatcher.safetyBoundary,
    },
    benchmarkStrategy: {
      payloadShape: benchmarkStrategy.payloadShape,
      recommendation: benchmarkStrategy.recommendation,
      summary: benchmarkStrategy.summary,
      candidates: benchmarkStrategy.candidates,
      nextBuildOrder: benchmarkStrategy.nextBuildOrder,
      safetyBoundary: benchmarkStrategy.safetyBoundary,
    },
    activationCockpit: {
      payloadShape: activationCockpit.payloadShape,
      summary: activationCockpit.summary,
      lanes: activationCockpit.lanes.slice(0, 5),
      answerForCustomer: activationCockpit.answerForCustomer,
      nextInternalTraining: activationCockpit.nextInternalTraining.slice(0, 5),
      externalSetupRequests: activationCockpit.externalSetupRequests.slice(0, 5),
      safetyBoundary: activationCockpit.safetyBoundary,
    },
    clawSkillWorkbench: {
      payloadShape: clawSkillWorkbench.payloadShape,
      mode: clawSkillWorkbench.mode,
      summary: clawSkillWorkbench.summary,
      selectedModules: clawSkillWorkbench.selectedModules,
      deliverables: clawSkillWorkbench.deliverables,
      commandScript: clawSkillWorkbench.commandScript,
      externalRequired: clawSkillWorkbench.externalRequired,
      safetyBoundary: clawSkillWorkbench.safetyBoundary,
    },
    clawSkillExecutionLedger: {
      payloadShape: clawSkillExecutionLedger.payloadShape,
      summary: clawSkillExecutionLedger.summary,
      latest: clawSkillExecutionLedger.latest,
      nextAction: clawSkillExecutionLedger.nextAction,
      safetyBoundary: clawSkillExecutionLedger.safetyBoundary,
    },
    staffNotificationHandoff: {
      payloadShape: staffNotificationHandoff.payloadShape,
      summary: staffNotificationHandoff.summary,
      drafts: staffNotificationHandoff.drafts.slice(0, 4),
      operatorChecklist: staffNotificationHandoff.operatorChecklist,
      externalRequired: staffNotificationHandoff.externalRequired,
      safetyBoundary: staffNotificationHandoff.safetyBoundary,
    },
    staffNotificationDeliveryBridge: {
      payloadShape: staffNotificationDeliveryBridge.payloadShape,
      summary: staffNotificationDeliveryBridge.summary,
      items: staffNotificationDeliveryBridge.items.slice(0, 4),
      externalRequired: staffNotificationDeliveryBridge.externalRequired,
      safetyBoundary: staffNotificationDeliveryBridge.safetyBoundary,
    },
    staffNotificationAuditLog: {
      payloadShape: staffNotificationAuditLog.payloadShape,
      summary: staffNotificationAuditLog.summary,
      latest: staffNotificationAuditLog.latest.slice(0, 4),
      externalRequired: staffNotificationAuditLog.externalRequired,
      safetyBoundary: staffNotificationAuditLog.safetyBoundary,
    },
    taskProviderHandoff: {
      payloadShape: taskProviderHandoff.payloadShape,
      summary: taskProviderHandoff.summary,
      packages: taskProviderHandoff.packages.slice(0, 4),
      blockedPackages: taskProviderHandoff.blockedPackages.slice(0, 4),
      providerContract: taskProviderHandoff.providerContract,
      operatorChecklist: taskProviderHandoff.operatorChecklist,
      externalRequired: taskProviderHandoff.externalRequired,
      safetyBoundary: taskProviderHandoff.safetyBoundary,
    },
    channelDeliveryReport: {
      payloadShape: channelDeliveryReport.payloadShape,
      summary: channelDeliveryReport.summary,
      latest: channelDeliveryReport.latest.slice(0, 4),
      latestAcknowledgements: channelDeliveryReport.latestAcknowledgements.slice(0, 4),
      externalRequired: channelDeliveryReport.externalRequired,
      safetyBoundary: channelDeliveryReport.safetyBoundary,
    },
    publicIntelligenceBrief: {
      payloadShape: publicIntelligenceBrief.payloadShape,
      readiness: publicIntelligenceBrief.readiness,
      platformProfiles: publicIntelligenceBrief.platformProfiles,
      materialChecklist: publicIntelligenceBrief.materialChecklist,
      operatorScript: publicIntelligenceBrief.operatorScript,
      externalRequired: publicIntelligenceBrief.externalRequired,
      safetyBoundary: publicIntelligenceBrief.safetyBoundary,
    },
    providerSetup: {
      payloadShape: providerSetup.payloadShape,
      summary: providerSetup.summary,
      priorityRequests: providerSetup.priorityRequests.slice(0, 8),
      copyForMerchant: providerSetup.copyForMerchant,
      safetyBoundary: providerSetup.safetyBoundary,
    },
    providerSetupWizard: {
      payloadShape: providerSetupWizard.payloadShape,
      summary: providerSetupWizard.summary,
      sections: providerSetupWizard.sections,
      handoffPayload: providerSetupWizard.handoffPayload,
      externalRequired: providerSetupWizard.externalRequired,
      safetyBoundary: providerSetupWizard.safetyBoundary,
    },
    providerSetupState: {
      payloadShape: providerSetupState.payloadShape,
      summary: providerSetupState.summary,
      provided: providerSetupState.provided,
      latest: providerSetupState.latest,
      safetyBoundary: providerSetupState.safetyBoundary,
    },
    providerReadinessHealth: {
      payloadShape: providerReadinessHealth.payloadShape,
      summary: providerReadinessHealth.summary,
      items: providerReadinessHealth.items,
      nextActions: providerReadinessHealth.nextActions,
      externalRequired: providerReadinessHealth.externalRequired,
      safetyBoundary: providerReadinessHealth.safetyBoundary,
    },
    providerUnlockLadder: {
      payloadShape: providerUnlockLadder.payloadShape,
      summary: providerUnlockLadder.summary,
      items: providerUnlockLadder.items,
      nextExternalAsks: providerUnlockLadder.nextExternalAsks,
      safetyBoundary: providerUnlockLadder.safetyBoundary,
    },
    externalWizard: {
      payloadShape: externalWizard.payloadShape,
      verdict: externalWizard.verdict,
      canForward: externalWizard.canForward,
      summary: externalWizard.summary,
      steps: externalWizard.steps,
      safetyBoundary: externalWizard.safetyBoundary,
    },
    operatorBrief: [
      `${restaurant} / ${offer}: ${primaryAction.label} is the current primary action.`,
      `Mode ${mode}; accepted receipts ${timeline.summary.acceptedReceipts}; provider gates ${providerSetup.summary.missing}; external forward ${externalWizard.canForward ? 'ready' : 'blocked'}.`,
      'Do not claim auto-publish, auto-acquisition, auto-redemption or true operating analysis until the external gates and merchant data contracts are configured.',
    ],
    externalRequired,
    safetyBoundary: 'Command Center is a read-only orchestration payload over internal trial runs, public-proof receipts, setup gates and aggregate signals. It does not log in, publish, scrape private messages, redeem coupons, expose secrets, pull POS rows, or convert simulator output into real operating claims.',
  } satisfies Omit<RestaurantAgentCommandCenter, 'aiEmployeeInbox' | 'channelHub' | 'gmCommandDeck' | 'shiftAutopilot'>;
  const aiEmployeeInbox = buildRestaurantAiEmployeeInbox(baseCommandCenter, now);
  const channelHub = buildRestaurantAgentChannelHub({
    restaurant,
    offer,
    env: input.env,
    now,
    activationCockpit,
    inbox: aiEmployeeInbox,
  });
  const gmCommandDeck = buildRestaurantGmCommandDeck({
    restaurant,
    offer,
    storeManagerTaskQueue,
    aiEmployeeInbox,
    providerUnlockLadder,
    now,
  });
  const shiftAutopilot = buildRestaurantShiftAutopilot({
    restaurant,
    offer,
    gmCommandDeck,
    channelHub,
    now,
  });

  return {
    ...baseCommandCenter,
    gmCommandDeck: {
      payloadShape: gmCommandDeck.payloadShape,
      shiftMode: gmCommandDeck.shiftMode,
      answerForOwner: gmCommandDeck.answerForOwner,
      summary: gmCommandDeck.summary,
      lanes: gmCommandDeck.lanes,
      aiAutopilotQueue: gmCommandDeck.aiAutopilotQueue,
      staffQueue: gmCommandDeck.staffQueue,
      providerQueue: gmCommandDeck.providerQueue,
      evidenceQueue: gmCommandDeck.evidenceQueue,
      safetyBoundary: gmCommandDeck.safetyBoundary,
    },
    shiftAutopilot: {
      payloadShape: shiftAutopilot.payloadShape,
      summary: shiftAutopilot.summary,
      steps: shiftAutopilot.steps,
      nowQueue: shiftAutopilot.nowQueue,
      nextWakeups: shiftAutopilot.nextWakeups,
      providerQueue: shiftAutopilot.providerQueue,
      evidenceQueue: shiftAutopilot.evidenceQueue,
      operatingPolicy: shiftAutopilot.operatingPolicy,
      safetyBoundary: shiftAutopilot.safetyBoundary,
    },
    aiEmployeeInbox: {
      payloadShape: aiEmployeeInbox.payloadShape,
      employee: aiEmployeeInbox.employee,
      summary: aiEmployeeInbox.summary,
      messages: aiEmployeeInbox.messages.slice(0, 4),
      memory: aiEmployeeInbox.memory,
      nextWakeup: aiEmployeeInbox.nextWakeup,
      externalRequired: aiEmployeeInbox.externalRequired,
      safetyBoundary: aiEmployeeInbox.safetyBoundary,
    },
    channelHub: {
      payloadShape: channelHub.payloadShape,
      summary: channelHub.summary,
      channels: channelHub.channels,
      scheduledJobs: channelHub.scheduledJobs,
      commandSuggestions: channelHub.commandSuggestions,
      externalRequired: channelHub.externalRequired,
      safetyBoundary: channelHub.safetyBoundary,
    },
  };
}

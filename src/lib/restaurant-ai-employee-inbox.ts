import type { RestaurantAgentCommandCenter, RestaurantCommandCenterAction } from '@/lib/restaurant-agent-command-center';

export type RestaurantAiEmployeeInboxMessage = {
  id: string;
  priority: 'urgent' | 'high' | 'normal';
  lane: 'run' | 'followup' | 'evidence' | 'setup' | 'memory';
  title: string;
  body: string;
  actionLabel: string;
  action: RestaurantCommandCenterAction['action'] | 'staff-notification-handoff' | 'staff-notification-delivery-bridge' | 'channel-schedule-recovery';
  owner: RestaurantCommandCenterAction['owner'] | 'runtime-admin';
  evidenceRequired: string;
  externalRequired: string[];
  safetyBoundary: string;
};

export type RestaurantAiEmployeeInbox = {
  ok: true;
  payloadShape: 'restaurant-ai-employee-inbox-v1';
  generatedAt: string;
  employee: {
    name: 'Wenai Store Operator';
    role: 'restaurant-ai-employee';
    currentMode: RestaurantAgentCommandCenter['mode'];
    status: 'working' | 'waiting-for-proof' | 'waiting-for-provider' | 'ready-to-run';
  };
  summary: {
    messages: number;
    urgent: number;
    internalRunnable: number;
    waitingExternal: number;
    rememberedFacts: number;
  };
  messages: RestaurantAiEmployeeInboxMessage[];
  memory: Array<{
    id: string;
    label: string;
    value: string;
  }>;
  nextWakeup: string;
  externalRequired: string[];
  safetyBoundary: string;
};

type RestaurantAiEmployeeInboxSource = Omit<RestaurantAgentCommandCenter, 'aiEmployeeInbox' | 'channelHub' | 'gmCommandDeck'>;

function statusFor(center: RestaurantAiEmployeeInboxSource): RestaurantAiEmployeeInbox['employee']['status'] {
  if (center.mode === 'waiting-receipt') return 'waiting-for-proof';
  if (center.mode === 'setup-required' || center.summary.providerGates > 0) return 'waiting-for-provider';
  if (center.mode === 'trial-ready') return 'ready-to-run';
  return 'working';
}

function messageId(parts: string[]): string {
  let hash = 0;
  const text = parts.join('|');
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 47 + text.charCodeAt(index)) >>> 0;
  }
  return `ai-inbox-${hash.toString(16).padStart(8, '0')}`;
}

function buildPrimaryMessage(center: RestaurantAiEmployeeInboxSource): RestaurantAiEmployeeInboxMessage {
  const priority: RestaurantAiEmployeeInboxMessage['priority'] =
    center.mode === 'needs-recovery' ? 'urgent' : center.mode === 'business-review' ? 'high' : 'normal';
  return {
    id: messageId(['primary', center.mode, center.primaryAction.id]),
    priority,
    lane: center.mode === 'setup-required' ? 'setup' : center.mode === 'waiting-receipt' ? 'evidence' : 'run',
    title: `I recommend: ${center.primaryAction.label}`,
    body: center.primaryAction.reason,
    actionLabel: center.primaryAction.label,
    action: center.primaryAction.action,
    owner: center.primaryAction.owner,
    evidenceRequired: center.primaryAction.evidenceRequired,
    externalRequired: center.externalRequired.slice(0, 3),
    safetyBoundary: center.safetyBoundary,
  };
}

function buildTaskMessage(center: RestaurantAiEmployeeInboxSource): RestaurantAiEmployeeInboxMessage | undefined {
  const wakeup = center.storeManagerTaskWatcher.wakeups[0];
  const task = center.storeManagerTaskQueue.tasks[0];
  if (!wakeup && !task) return undefined;
  return {
    id: messageId(['followup', wakeup?.id || task?.id || center.generatedAt]),
    priority: wakeup?.priority === 'high' || task?.priority === 'today' ? 'high' : 'normal',
    lane: 'followup',
    title: wakeup ? `I found a manager follow-up for ${wakeup.owner}` : `I found an open task for ${task?.owner || 'store manager'}`,
    body: wakeup?.nextAction || task?.action || center.storeManagerTaskQueue.nextAction,
    actionLabel: 'Draft Notice',
    action: 'staff-notification-handoff',
    owner: 'store-manager',
    evidenceRequired: wakeup?.evidenceRequired || task?.evidenceRequired || 'owner confirmation and public proof',
    externalRequired: center.staffNotificationHandoff.externalRequired.slice(0, 2),
    safetyBoundary: center.staffNotificationHandoff.safetyBoundary,
  };
}

function buildSetupMessage(center: RestaurantAiEmployeeInboxSource): RestaurantAiEmployeeInboxMessage | undefined {
  const gate = center.providerSetup.priorityRequests.find(item => item.status === 'missing');
  if (!gate) return undefined;
  return {
    id: messageId(['setup', gate.trackId, gate.id]),
    priority: 'normal',
    lane: 'setup',
    title: `I cannot unlock ${gate.trackId} yet`,
    body: gate.nextAction,
    actionLabel: 'Setup Gates',
    action: 'provider-setup-pack',
    owner: gate.owner === 'merchant' ? 'merchant' : gate.owner === 'ops' ? 'ops' : 'runtime-admin',
    evidenceRequired: gate.evidence,
    externalRequired: center.externalRequired.slice(0, 4),
    safetyBoundary: center.providerSetup.safetyBoundary,
  };
}

function buildAuditMessage(center: RestaurantAiEmployeeInboxSource): RestaurantAiEmployeeInboxMessage | undefined {
  const latest = center.staffNotificationAuditLog.latest[0];
  if (!latest) return undefined;
  return {
    id: messageId(['audit', latest.auditId]),
    priority: latest.status === 'blocked' ? 'high' : 'normal',
    lane: 'evidence',
    title: `I logged notification readiness: ${latest.eventType}`,
    body: latest.nextAction,
    actionLabel: 'Delivery Bridge',
    action: 'staff-notification-delivery-bridge',
    owner: 'runtime-admin',
    evidenceRequired: latest.evidenceRequired,
    externalRequired: center.staffNotificationAuditLog.externalRequired.slice(0, 2),
    safetyBoundary: center.staffNotificationAuditLog.safetyBoundary,
  };
}

function buildChannelScheduleMessage(center: RestaurantAiEmployeeInboxSource): RestaurantAiEmployeeInboxMessage | undefined {
  const acknowledgement = center.channelDeliveryReport.latestAcknowledgements[0];
  if (acknowledgement) {
    const needsRecovery = acknowledgement.status !== 'acknowledged';
    return {
      id: messageId(['channel-ack', acknowledgement.acknowledgementId, acknowledgement.status]),
      priority: needsRecovery ? 'high' : 'normal',
      lane: needsRecovery ? 'setup' : 'evidence',
      title: needsRecovery
        ? `Staff acknowledgement needs recovery: ${acknowledgement.status}`
        : 'Staff acknowledged the channel job',
      body: acknowledgement.nextAction,
      actionLabel: needsRecovery ? 'Recover Schedule' : 'Review Acknowledgement',
      action: 'channel-schedule-recovery',
      owner: needsRecovery ? 'runtime-admin' : 'ops',
      evidenceRequired: acknowledgement.evidenceUrl || acknowledgement.note,
      externalRequired: needsRecovery ? center.channelDeliveryReport.externalRequired.slice(0, 2) : [],
      safetyBoundary: acknowledgement.safetyBoundary,
    };
  }

  const latest = center.channelDeliveryReport.latest[0];
  if (!latest) return undefined;
  const needsRecovery = latest.status === 'blocked' || latest.status === 'failed';
  return {
    id: messageId(['channel-schedule', latest.attemptId, latest.status]),
    priority: needsRecovery ? 'high' : 'normal',
    lane: needsRecovery ? 'setup' : 'evidence',
    title: needsRecovery
      ? `Schedule runner needs recovery: ${latest.channelName}`
      : `Schedule runner logged: ${latest.channelName}`,
    body: latest.nextAction,
    actionLabel: needsRecovery ? 'Recover Schedule' : 'Review Schedule',
    action: 'channel-schedule-recovery',
    owner: needsRecovery ? 'runtime-admin' : 'ops',
    evidenceRequired: latest.payloadPreview.evidenceRequired.join(', ') || latest.providerEvidence,
    externalRequired: needsRecovery ? latest.missing.concat(center.channelDeliveryReport.externalRequired).slice(0, 3) : [],
    safetyBoundary: center.channelDeliveryReport.safetyBoundary,
  };
}

export function buildRestaurantAiEmployeeInbox(
  center: RestaurantAiEmployeeInboxSource,
  now = new Date(),
): RestaurantAiEmployeeInbox {
  const messages = [
    buildPrimaryMessage(center),
    buildTaskMessage(center),
    buildSetupMessage(center),
    buildAuditMessage(center),
    buildChannelScheduleMessage(center),
  ].filter((message): message is RestaurantAiEmployeeInboxMessage => Boolean(message));
  const externalRequired = Array.from(new Set(messages.flatMap(message => message.externalRequired))).slice(0, 6);
  const memory = [
    { id: 'restaurant', label: 'Restaurant', value: center.restaurant },
    { id: 'offer', label: 'Offer', value: center.offer },
    { id: 'mode', label: 'Mode', value: center.mode },
    { id: 'receipts', label: 'Accepted receipts', value: String(center.summary.acceptedReceipts) },
    { id: 'provider-gates', label: 'Provider gates', value: String(center.summary.providerGates) },
    { id: 'channel-attempts', label: 'Channel attempts', value: String(center.summary.channelDeliveryAttempts) },
    { id: 'channel-acks', label: 'Channel acks', value: String(center.summary.channelDeliveryAcknowledged) },
  ];

  return {
    ok: true,
    payloadShape: 'restaurant-ai-employee-inbox-v1',
    generatedAt: now.toISOString(),
    employee: {
      name: 'Wenai Store Operator',
      role: 'restaurant-ai-employee',
      currentMode: center.mode,
      status: statusFor(center),
    },
    summary: {
      messages: messages.length,
      urgent: messages.filter(message => message.priority === 'urgent').length,
      internalRunnable: messages.filter(message => message.externalRequired.length === 0).length,
      waitingExternal: messages.filter(message => message.externalRequired.length > 0).length,
      rememberedFacts: memory.length,
    },
    messages,
    memory,
    nextWakeup: center.storeManagerTaskWatcher.wakeups[0]?.nextAction || center.nextAction,
    externalRequired,
    safetyBoundary: 'AI Employee Inbox is a proactive operating layer over verified tasks, receipts, provider gates, and audit events. It does not publish, contact customers, redeem coupons, read private messages, or claim real operating results without external authorization and receipts.',
  };
}

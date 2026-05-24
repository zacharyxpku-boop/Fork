import { appendRestaurantAgentLedgerEntry, clearRestaurantAgentLedgerKindForTest, listRestaurantAgentLedgerEntries } from '@/lib/restaurant-agent-ledger-store';
import type { RestaurantStaffNotificationDeliveryBridge } from '@/lib/restaurant-staff-notification-delivery-bridge';
import type { RestaurantStaffNotificationDraft, RestaurantStaffNotificationHandoff } from '@/lib/restaurant-staff-notification-handoff';

export type RestaurantStaffNotificationAuditEventType =
  | 'handoff-generated'
  | 'delivery-bridge-generated'
  | 'manual-copy-ready'
  | 'provider-ready'
  | 'blocked';

export type RestaurantStaffNotificationAuditEvent = {
  auditId: string;
  eventType: RestaurantStaffNotificationAuditEventType;
  sourcePayloadShape: 'restaurant-staff-notification-handoff-v1' | 'restaurant-staff-notification-delivery-bridge-v1';
  itemId: string;
  draftId: string;
  channel: RestaurantStaffNotificationDraft['channel'];
  owner: string;
  status: RestaurantStaffNotificationDeliveryBridge['items'][number]['status'];
  provider: RestaurantStaffNotificationDeliveryBridge['items'][number]['provider'];
  missing: string[];
  evidenceRequired: string;
  nextAction: string;
  safetyBoundary: string;
  generatedAt: string;
};

export type RestaurantStaffNotificationAuditLog = {
  ok: true;
  payloadShape: 'restaurant-staff-notification-audit-log-v1';
  generatedAt: string;
  summary: {
    total: number;
    handoffGenerated: number;
    deliveryBridgeGenerated: number;
    manualReady: number;
    providerReady: number;
    blocked: number;
    missingRequirements: number;
  };
  latest: RestaurantStaffNotificationAuditEvent[];
  events: RestaurantStaffNotificationAuditEvent[];
  externalRequired: string[];
  safetyBoundary: string;
};

type AuditEventInput = Omit<RestaurantStaffNotificationAuditEvent, 'auditId' | 'generatedAt'> & {
  generatedAt?: string;
};

const memoryAuditEvents: RestaurantStaffNotificationAuditEvent[] = [];
const MAX_EVENTS = 60;

function stableId(input: string): string {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 41 + input.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function isAuditEvent(value: unknown): value is RestaurantStaffNotificationAuditEvent {
  const record = value as RestaurantStaffNotificationAuditEvent;
  return Boolean(
    record &&
    typeof record.auditId === 'string' &&
    typeof record.eventType === 'string' &&
    typeof record.sourcePayloadShape === 'string' &&
    typeof record.itemId === 'string' &&
    typeof record.draftId === 'string' &&
    typeof record.channel === 'string' &&
    typeof record.owner === 'string' &&
    typeof record.status === 'string' &&
    typeof record.provider === 'string' &&
    Array.isArray(record.missing) &&
    typeof record.evidenceRequired === 'string' &&
    typeof record.nextAction === 'string' &&
    typeof record.safetyBoundary === 'string' &&
    typeof record.generatedAt === 'string',
  );
}

function dedupeEvents(events: RestaurantStaffNotificationAuditEvent[]): RestaurantStaffNotificationAuditEvent[] {
  const seen = new Set<string>();
  return events
    .sort((left, right) => right.generatedAt.localeCompare(left.generatedAt))
    .filter(event => {
      if (seen.has(event.auditId)) return false;
      seen.add(event.auditId);
      return true;
    })
    .slice(0, MAX_EVENTS);
}

function makeAuditId(input: AuditEventInput, generatedAt: string): string {
  return `staff-notification-audit-${stableId([
    input.eventType,
    input.sourcePayloadShape,
    input.itemId,
    input.draftId,
    input.channel,
    input.owner,
    input.status,
    input.provider,
    input.missing.join(','),
    generatedAt,
  ].join('|'))}`;
}

function recordAuditEvent(input: AuditEventInput, now = new Date()): RestaurantStaffNotificationAuditEvent {
  const generatedAt = input.generatedAt || now.toISOString();
  const record: RestaurantStaffNotificationAuditEvent = {
    ...input,
    auditId: makeAuditId(input, generatedAt),
    generatedAt,
  };
  const previousIndex = memoryAuditEvents.findIndex(event => event.auditId === record.auditId);
  if (previousIndex >= 0) memoryAuditEvents.splice(previousIndex, 1);
  memoryAuditEvents.unshift(record);
  memoryAuditEvents.splice(MAX_EVENTS);
  appendRestaurantAgentLedgerEntry('staff-notification-audit', record, now);
  return record;
}

function deriveEventType(
  sourcePayloadShape: RestaurantStaffNotificationAuditEvent['sourcePayloadShape'],
  status: RestaurantStaffNotificationAuditEvent['status'],
): RestaurantStaffNotificationAuditEventType {
  if (sourcePayloadShape === 'restaurant-staff-notification-handoff-v1') return 'handoff-generated';
  if (status === 'ready-for-provider') return 'provider-ready';
  if (status === 'blocked') return 'blocked';
  return 'manual-copy-ready';
}

export function recordRestaurantStaffNotificationAuditEventsFromHandoff(
  handoff: RestaurantStaffNotificationHandoff,
  now = new Date(),
): RestaurantStaffNotificationAuditEvent[] {
  return handoff.drafts.map(draft => recordAuditEvent({
    eventType: 'handoff-generated',
    sourcePayloadShape: handoff.payloadShape,
    itemId: draft.id,
    draftId: draft.id,
    channel: draft.channel,
    owner: draft.owner,
    status: draft.sendGate === 'copy-ready' ? 'ready-for-manual-copy' : 'blocked',
    provider: draft.channel === 'sms' ? 'sms' : draft.channel === 'work-chat' ? 'work-chat' : 'manual-copy',
    missing: draft.providerRequired,
    evidenceRequired: draft.evidenceRequired,
    nextAction: draft.sendGate === 'copy-ready'
      ? 'Copy into the merchant-approved staff channel and retain proof.'
      : `Resolve ${draft.providerRequired[0] || 'provider requirements'} before sending.`,
    safetyBoundary: handoff.safetyBoundary,
  }, now));
}

export function recordRestaurantStaffNotificationAuditEventsFromDeliveryBridge(
  bridge: RestaurantStaffNotificationDeliveryBridge,
  now = new Date(),
): RestaurantStaffNotificationAuditEvent[] {
  const summaryEvent = recordAuditEvent({
    eventType: 'delivery-bridge-generated',
    sourcePayloadShape: bridge.payloadShape,
    itemId: 'bridge-summary',
    draftId: 'bridge-summary',
    channel: 'internal-copy',
    owner: 'runtime-admin',
    status: bridge.summary.blocked > 0 ? 'blocked' : bridge.summary.providerReady > 0 ? 'ready-for-provider' : 'ready-for-manual-copy',
    provider: 'manual-copy',
    missing: bridge.envTemplate.map(item => item.key),
    evidenceRequired: 'provider-safe payloads, recipient mapping, and server-side audit logging.',
    nextAction: bridge.summary.blocked > 0
      ? 'Resolve the missing provider requirements before attempting delivery.'
      : 'Use the bridge to hand off only safe, server-side delivery payloads.',
    safetyBoundary: bridge.safetyBoundary,
  }, now);

  const itemEvents = bridge.items.map(item => recordAuditEvent({
    eventType: deriveEventType(bridge.payloadShape, item.status),
    sourcePayloadShape: bridge.payloadShape,
    itemId: item.id,
    draftId: item.draftId,
    channel: item.channel,
    owner: item.owner,
    status: item.status,
    provider: item.provider,
    missing: item.missing,
    evidenceRequired: item.payloadPreview.evidenceRequired,
    nextAction: item.nextAction,
    safetyBoundary: bridge.safetyBoundary,
  }, now));
  return [summaryEvent, ...itemEvents];
}

export function buildRestaurantStaffNotificationAuditLog(now = new Date()): RestaurantStaffNotificationAuditLog {
  const ledgerEvents = listRestaurantAgentLedgerEntries<RestaurantStaffNotificationAuditEvent>('staff-notification-audit')
    .map(entry => entry.payload)
    .filter(isAuditEvent);
  const events = dedupeEvents([...memoryAuditEvents, ...ledgerEvents]);
  const summary = {
    total: events.length,
    handoffGenerated: events.filter(event => event.eventType === 'handoff-generated').length,
    deliveryBridgeGenerated: events.filter(event => event.eventType === 'delivery-bridge-generated').length,
    manualReady: events.filter(event => event.status === 'ready-for-manual-copy').length,
    providerReady: events.filter(event => event.status === 'ready-for-provider').length,
    blocked: events.filter(event => event.status === 'blocked').length,
    missingRequirements: Array.from(new Set(events.flatMap(event => event.missing))).length,
  };

  return {
    ok: true,
    payloadShape: 'restaurant-staff-notification-audit-log-v1',
    generatedAt: now.toISOString(),
    summary,
    latest: events.slice(0, 6),
    events: events.slice(0, 20),
    externalRequired: [
      'Work-chat and SMS delivery still require approved provider credentials and recipient mapping.',
      'Notification sending stays server-side and audited; the product only prepares safe payloads here.',
    ],
    safetyBoundary: 'Notification audit log records handoff and bridge readiness only. It does not send messages, expose secrets, read private chats, or claim real delivery without external provider execution.',
  };
}

export function clearRestaurantStaffNotificationAuditEventsForTest() {
  memoryAuditEvents.splice(0);
  clearRestaurantAgentLedgerKindForTest('staff-notification-audit');
}

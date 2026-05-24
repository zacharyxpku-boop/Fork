import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { clearRestaurantAgentReceiptsForTest, recordRestaurantAgentReceipt } from '@/lib/restaurant-agent-receipt-store';
import { clearRestaurantAgentRunsForTest, recordRestaurantAgentRun } from '@/lib/restaurant-agent-run-store';
import { buildRestaurantStoreManagerFollowupPack } from '@/lib/restaurant-store-manager-followup';
import { buildRestaurantStoreManagerTaskQueue, clearRestaurantStoreManagerTasksForTest, recordRestaurantStoreManagerTasks, updateRestaurantStoreManagerTaskStatus } from '@/lib/restaurant-store-manager-task-store';
import { buildRestaurantStoreManagerTaskWatcher } from '@/lib/restaurant-store-manager-task-watcher';
import { buildRestaurantStaffNotificationAuditLog, clearRestaurantStaffNotificationAuditEventsForTest, recordRestaurantStaffNotificationAuditEventsFromDeliveryBridge, recordRestaurantStaffNotificationAuditEventsFromHandoff } from '@/lib/restaurant-staff-notification-audit-store';
import { buildRestaurantStaffNotificationHandoff } from '@/lib/restaurant-staff-notification-handoff';
import { buildRestaurantStaffNotificationDeliveryBridge } from '@/lib/restaurant-staff-notification-delivery-bridge';

describe('restaurant store manager task store', () => {
  it('persists followup tasks as an operating queue without executing external actions', () => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
    clearRestaurantStoreManagerTasksForTest();
    clearRestaurantStaffNotificationAuditEventsForTest();

    const dispatch = buildRestaurantAgentDispatch({
      taskId: 'visit-intent-followup',
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
    }, new Date('2026-05-24T02:00:00.000Z'));
    const receipt = recordRestaurantAgentReceipt({
      eventId: run.eventId,
      channel: '大众点评',
      evidenceUrl: 'https://www.dianping.com/shop/123/review/456',
      externalRunId: 'openclaw-run-visit-queue-1',
      operator: '店长',
      summary: 'Public visit intent proof accepted.',
      source: 'external-runtime',
      signalType: 'visit-intent',
      visitIntentCount: 2,
    }, new Date('2026-05-24T02:01:00.000Z'));
    const followup = buildRestaurantStoreManagerFollowupPack({
      restaurant: '北城面馆',
      offer: '番茄牛腩面套餐',
      runs: [run],
      receipts: [receipt],
      now: new Date('2026-05-24T02:02:00.000Z'),
    });

    const records = recordRestaurantStoreManagerTasks(followup.tasks, new Date('2026-05-24T02:03:00.000Z'));
    const queue = buildRestaurantStoreManagerTaskQueue(new Date('2026-05-24T02:04:00.000Z'));
    const watcher = buildRestaurantStoreManagerTaskWatcher(queue, new Date('2026-05-24T07:30:00.000Z'));
    const handoff = buildRestaurantStaffNotificationHandoff(watcher, new Date('2026-05-24T07:31:00.000Z'));
    const deliveryBridge = buildRestaurantStaffNotificationDeliveryBridge({ handoff, now: new Date('2026-05-24T07:32:00.000Z') });
    const handoffAudit = recordRestaurantStaffNotificationAuditEventsFromHandoff(handoff, new Date('2026-05-24T07:31:30.000Z'));
    const deliveryAudit = recordRestaurantStaffNotificationAuditEventsFromDeliveryBridge(deliveryBridge, new Date('2026-05-24T07:32:30.000Z'));
    const auditLog = buildRestaurantStaffNotificationAuditLog(new Date('2026-05-24T07:33:00.000Z'));

    expect(records[0]).toEqual(expect.objectContaining({
      status: 'open',
      source: 'followup-pack',
      restaurant: '北城面馆',
    }));
    expect(queue.payloadShape).toBe('restaurant-store-manager-task-queue-v1');
    expect(queue.summary.open).toBe(1);
    expect(queue.tasks[0].auditNote).toContain('No customer contact');
    expect(queue.safetyBoundary).toContain('does not contact customers');
    expect(watcher.payloadShape).toBe('restaurant-store-manager-task-watcher-v1');
    expect(watcher.summary.wakeups).toBe(1);
    expect(watcher.summary.highPriority).toBe(1);
    expect(watcher.wakeups[0].nextAction).toContain('Review stop line');
    expect(watcher.safetyBoundary).toContain('does not message customers');
    expect(handoff.payloadShape).toBe('restaurant-staff-notification-handoff-v1');
    expect(handoff.summary.drafts).toBe(1);
    expect(handoff.summary.providerRequired).toBe(0);
    expect(handoff.drafts[0].sendGate).toBe('copy-ready');
    expect(handoff.operatorChecklist[0]).toContain('Review the stop line');
    expect(deliveryBridge.payloadShape).toBe('restaurant-staff-notification-delivery-bridge-v1');
    expect(deliveryBridge.summary.manualReady).toBe(1);
    expect(deliveryBridge.summary.providerReady).toBe(0);
    expect(deliveryBridge.items[0].status).toBe('ready-for-manual-copy');
    expect(deliveryBridge.externalRequired[0]).toContain('Work-chat/SMS');
    expect(handoffAudit[0].eventType).toBe('handoff-generated');
    expect(deliveryAudit[0].eventType).toBe('delivery-bridge-generated');
    expect(auditLog.payloadShape).toBe('restaurant-staff-notification-audit-log-v1');
    expect(auditLog.summary.total).toBeGreaterThan(0);
    expect(auditLog.summary.handoffGenerated).toBeGreaterThan(0);
    expect(auditLog.summary.deliveryBridgeGenerated).toBeGreaterThan(0);

    const closed = updateRestaurantStoreManagerTaskStatus({
      taskMemoryId: records[0].taskMemoryId,
      status: 'done',
      auditNote: 'Manager confirmed evidence and closed the shift task.',
      now: new Date('2026-05-24T02:05:00.000Z'),
    });
    const closedQueue = buildRestaurantStoreManagerTaskQueue(new Date('2026-05-24T02:06:00.000Z'));

    expect(closed?.status).toBe('done');
    expect(closedQueue.summary.done).toBe(1);
    expect(closedQueue.summary.open).toBe(0);
  });

  it('records the queue through the followup API and returns it in command center', async () => {
    clearRestaurantAgentRunsForTest();
    clearRestaurantAgentReceiptsForTest();
    clearRestaurantStoreManagerTasksForTest();
    clearRestaurantStaffNotificationAuditEventsForTest();

    const response = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'store-manager-followup',
        restaurant: '北城面馆',
        offer: '番茄牛腩面套餐',
      }),
    }));
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(['open', 'blocked']).toContain(payload.storeManagerTaskRecords[0].status);
    expect(payload.storeManagerTaskQueue.payloadShape).toBe('restaurant-store-manager-task-queue-v1');
    expect(payload.storeManagerTaskWatcher.payloadShape).toBe('restaurant-store-manager-task-watcher-v1');
    expect(payload.staffNotificationHandoff.payloadShape).toBe('restaurant-staff-notification-handoff-v1');
    expect(payload.staffNotificationDeliveryBridge.payloadShape).toBe('restaurant-staff-notification-delivery-bridge-v1');
    expect(payload.staffNotificationAuditLog.payloadShape).toBe('restaurant-staff-notification-audit-log-v1');
    expect(payload.storeManagerTaskQueue.summary.total).toBeGreaterThan(0);
    expect(payload.commandCenter.storeManagerTaskQueue.summary.total).toBeGreaterThan(0);
    expect(payload.commandCenter.storeManagerTaskWatcher.payloadShape).toBe('restaurant-store-manager-task-watcher-v1');
    expect(payload.commandCenter.staffNotificationHandoff.summary.drafts).toBe(1);
    expect(payload.commandCenter.staffNotificationDeliveryBridge.summary.manualReady).toBe(1);
    expect(payload.commandCenter.staffNotificationAuditLog.summary.total).toBeGreaterThan(0);

    const closeResponse = await POST(new NextRequest('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'store-manager-task-status',
        taskMemoryId: payload.storeManagerTaskRecords[0].taskMemoryId,
        status: 'done',
        auditNote: 'Closed after owner reviewed evidence.',
      }),
    }));
    const closePayload = await closeResponse.json();

    expect(closeResponse.status).toBe(200);
    expect(closePayload.task.status).toBe('done');
    expect(closePayload.storeManagerTaskQueue.summary.done).toBe(1);
    expect(closePayload.storeManagerTaskWatcher.summary.wakeups).toBe(0);
    expect(closePayload.staffNotificationHandoff.summary.drafts).toBe(0);
    expect(closePayload.staffNotificationDeliveryBridge.summary.items).toBe(0);
    expect(closePayload.staffNotificationAuditLog.summary.total).toBeGreaterThanOrEqual(1);
  });
});

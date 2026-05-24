import { beforeEach, describe, expect, it } from 'vitest';

import { buildRestaurantAgentCommandCenter } from '@/lib/restaurant-agent-command-center';
import { clearRestaurantAgentChannelDeliveryAttemptsForTest, recordRestaurantAgentChannelDeliveryAcknowledgement } from '@/lib/restaurant-agent-channel-delivery-store';
import { runRestaurantAgentChannelSchedule } from '@/lib/restaurant-agent-channel-scheduler';
import { buildRestaurantAiEmployeeInbox } from '@/lib/restaurant-ai-employee-inbox';

describe('restaurant AI employee inbox', () => {
  beforeEach(() => {
    clearRestaurantAgentChannelDeliveryAttemptsForTest();
  });

  it('turns command-center state into proactive employee messages without claiming execution', async () => {
    const center = await buildRestaurantAgentCommandCenter({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      runs: [],
      receipts: [],
      now: new Date('2026-05-24T08:00:00.000Z'),
    });
    const inbox = buildRestaurantAiEmployeeInbox(center, new Date('2026-05-24T08:01:00.000Z'));

    expect(inbox.payloadShape).toBe('restaurant-ai-employee-inbox-v1');
    expect(inbox.employee.role).toBe('restaurant-ai-employee');
    expect(inbox.summary.messages).toBeGreaterThan(0);
    expect(inbox.summary.waitingExternal).toBeGreaterThan(0);
    expect(inbox.messages.map(message => message.actionLabel)).toEqual(expect.arrayContaining(['Run Trial', 'Setup Gates']));
    expect(inbox.memory.map(item => item.id)).toEqual(expect.arrayContaining(['restaurant', 'offer', 'provider-gates']));
    expect(inbox.safetyBoundary).toContain('does not publish');
  });

  it('is embedded in the command center payload as the customer-facing proactive layer', async () => {
    const center = await buildRestaurantAgentCommandCenter({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      runs: [],
      receipts: [],
      now: new Date('2026-05-24T08:00:00.000Z'),
    });

    expect(center.aiEmployeeInbox.payloadShape).toBe('restaurant-ai-employee-inbox-v1');
    expect(center.aiEmployeeInbox.employee.currentMode).toBe(center.mode);
    expect(center.aiEmployeeInbox.messages[0].title).toContain('I recommend');
    expect(center.aiEmployeeInbox.nextWakeup).toBeTruthy();
  });

  it('promotes channel schedule recovery into the proactive inbox after due jobs run', async () => {
    await runRestaurantAgentChannelSchedule({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      env: {},
      now: new Date(2026, 4, 24, 23, 0, 0),
      limit: 2,
    });

    const center = await buildRestaurantAgentCommandCenter({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      runs: [],
      receipts: [],
      now: new Date(2026, 4, 24, 23, 1, 0),
    });

    expect(center.summary.channelDeliveryAttempts).toBeGreaterThanOrEqual(2);
    expect(center.summary.channelDeliveryRetryRecommended).toBeGreaterThan(0);
    expect(center.aiEmployeeInbox.messages.map(message => message.actionLabel)).toContain('Recover Schedule');
    expect(center.aiEmployeeInbox.memory.map(item => item.id)).toContain('channel-attempts');
  });

  it('promotes staff acknowledgement into inbox memory after a channel job is confirmed', async () => {
    const scheduleRun = await runRestaurantAgentChannelSchedule({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      env: {},
      now: new Date(2026, 4, 24, 23, 0, 0),
      limit: 1,
    });
    recordRestaurantAgentChannelDeliveryAcknowledgement({
      attemptId: scheduleRun.items[0].attempt?.attemptId,
      operator: 'store manager',
      note: 'Confirmed staff saw the recovery task.',
      now: new Date(2026, 4, 24, 23, 2, 0),
    });

    const center = await buildRestaurantAgentCommandCenter({
      restaurant: 'North City Noodles',
      offer: 'Tomato beef noodle set',
      now: new Date(2026, 4, 24, 23, 3, 0),
    });

    expect(center.summary.channelDeliveryAcknowledged).toBe(1);
    expect(center.aiEmployeeInbox.messages.map(message => message.actionLabel)).toContain('Review Acknowledgement');
    expect(center.aiEmployeeInbox.memory.map(item => item.id)).toContain('channel-acks');
  });
});

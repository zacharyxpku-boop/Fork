import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { POST } from '@/app/api/restaurant-agent/runtime/route';
import { buildRestaurantBrowserRunnerEventHealth, clearRestaurantBrowserRunnerEventsForTest, listRestaurantBrowserRunnerEvents, recordRestaurantBrowserRunnerEvent } from '@/lib/restaurant-agent-browser-runner-event-store';

describe('restaurant browser runner event ledger', () => {
  beforeEach(() => {
    clearRestaurantBrowserRunnerEventsForTest();
  });

  afterEach(() => {
    clearRestaurantBrowserRunnerEventsForTest();
  });

  it('records sanitized step events and summarizes active runner health', () => {
    const event = recordRestaurantBrowserRunnerEvent({
      eventId: 'restaurant-agent-runner',
      runbookId: 'restaurant-browser-runbook-1',
      runtimeTarget: 'openclaw',
      externalRunId: 'openclaw-run-1',
      stepId: 'capture-proof-screenshot',
      type: 'step-completed',
      evidenceSummary: 'Public proof screenshot captured.',
      nextAction: 'Continue to extract receipt fields.',
    }, new Date('2026-05-23T10:00:00.000Z'));
    const health = buildRestaurantBrowserRunnerEventHealth(listRestaurantBrowserRunnerEvents(), new Date('2026-05-23T10:05:00.000Z'));

    expect(event.status).toBe('accepted');
    expect(event.retryable).toBe(false);
    expect(health.payloadShape).toBe('restaurant-browser-runner-event-health-v1');
    expect(health.summary.totalEvents).toBe(1);
    expect(health.summary.activeRuns).toBe(1);
    expect(health.summary.completedRuns).toBe(0);
    expect(JSON.stringify(health)).not.toContain('private message raw');
  });

  it('rejects private or sensitive runner payloads instead of storing raw evidence', () => {
    const event = recordRestaurantBrowserRunnerEvent({
      eventId: 'restaurant-agent-runner',
      runbookId: 'restaurant-browser-runbook-1',
      runtimeTarget: 'hermes',
      externalRunId: 'hermes-run-1',
      stepId: 'inspect-public-receipt-or-review-state',
      type: 'step-completed',
      evidenceSummary: 'private message raw text with phone number 13812345678',
      nextAction: 'continue',
    });

    expect(event.status).toBe('rejected');
    expect(event.validationWarnings).toContain('contains_sensitive_or_private_content');
    expect(event.evidenceSummary).toBe('Runner event rejected because it contains private or sensitive content.');
    expect(JSON.stringify(event)).not.toContain('13812345678');
    expect(JSON.stringify(event)).not.toContain('private message raw text');
  });

  it('marks stale accepted runner activity for operator recovery', () => {
    recordRestaurantBrowserRunnerEvent({
      eventId: 'restaurant-agent-stale',
      runbookId: 'restaurant-browser-runbook-stale',
      runtimeTarget: 'openclaw',
      externalRunId: 'openclaw-run-stale',
      stepId: 'open-authorized-public-or-merchant-page',
      type: 'step-completed',
      evidenceSummary: 'Page opened.',
    }, new Date('2026-05-23T10:00:00.000Z'));

    const health = buildRestaurantBrowserRunnerEventHealth(listRestaurantBrowserRunnerEvents(), new Date('2026-05-23T10:31:00.000Z'));

    expect(health.summary.staleRuns).toBe(1);
    expect(health.operatorQueue[0]).toEqual(expect.objectContaining({
      priority: 'medium',
      eventId: 'restaurant-agent-stale',
    }));
    expect(health.operatorQueue[0].nextAction).toContain('30 minutes');
  });

  it('exposes runner event record and health through runtime API', async () => {
    const response = await POST(new Request('http://localhost/api/restaurant-agent/runtime', {
      method: 'POST',
      body: JSON.stringify({
        action: 'browser-runner-event',
        eventId: 'restaurant-agent-api-runner',
        runbookId: 'restaurant-browser-runbook-api',
        runtimeTarget: 'openclaw',
        externalRunId: 'openclaw-run-api',
        stepId: 'write-signed-callback',
        eventType: 'run-completed',
        evidenceSummary: 'Runner completed and will send final signed receipt.',
        nextAction: 'Await signed external-receipt validation.',
      }),
    }) as never);
    const payload = await response.json();

    expect(response.status).toBe(202);
    expect(payload.runnerEvent.status).toBe('accepted');
    expect(payload.runnerEventHealth.summary.completedRuns).toBe(1);
  });
});

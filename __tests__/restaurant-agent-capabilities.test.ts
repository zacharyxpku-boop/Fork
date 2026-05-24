import { describe, expect, it } from 'vitest';

import { buildRestaurantAgentCapabilityPlan } from '@/lib/restaurant-agent-capabilities';

describe('restaurant agent competitor capability plan', () => {
  it('covers the competitor-grade agent capability set', () => {
    const plan = buildRestaurantAgentCapabilityPlan();

    expect(plan.summary.total).toBe(25);
    expect(plan.summary.internalReady).toBe(21);
    expect(plan.summary.bridgeReady).toBe(3);
    expect(plan.summary.externalRequired).toBe(1);
    expect(plan.capabilities.map(item => item.id)).toEqual([
      'tenant-event-gateway',
      'persistent-memory-graph',
      'watcher-entity-extraction',
      'isolated-browser-session',
      'persistent-browser-session-registry',
      'browser-workflow-runner',
      'browser-runbook-package',
      'browser-runner-callback-contract',
      'browser-runner-event-ledger',
      'tool-policy-secret-proxy',
      'runtime-setup-contract',
      'merchant-grant-checklist-wizard',
      'restaurant-activation-gates',
      'competitor-capability-audit',
      'agent-build-queue',
      'deterministic-tool-policy-evaluator',
      'watcher-policy-orchestrator',
      'public-profile-intake',
      'agent-ops-console',
      'execution-receipts-retry',
      'signed-callback-simulator',
      'evidence-scored-receipts',
      'business-signal-loop',
      'pos-import-schema-validator',
      'merchant-platform-connectors',
    ]);
  });

  it('models browser session, watcher, tool policy, receipt and recovery without fake external execution', () => {
    const plan = buildRestaurantAgentCapabilityPlan();

    expect(plan.session.browserProfile.mode).toBe('isolated-agent-browser');
    expect(plan.session.browserProfile.canRunNow).toBe(false);
    expect(plan.session.watchers).toHaveLength(3);
    expect(plan.session.toolPolicy.find(item => item.tool === 'queue_task')).toEqual(expect.objectContaining({ allowed: true }));
    expect(plan.session.toolPolicy.find(item => item.tool === 'browser_open_click_type')).toEqual(expect.objectContaining({ allowed: false }));
    expect(plan.session.receiptSchema).toContain('externalRunId');
    expect(plan.session.recoveryLadder.join(' ')).toContain('缺账号授权');
  });
});

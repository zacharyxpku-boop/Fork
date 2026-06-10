import { describe, expect, it } from 'vitest';

import { buildRestaurantAgentRuntime, RESTAURANT_AGENT_CONNECTORS, RESTAURANT_AGENT_REFERENCES } from '@/lib/restaurant-agent-runtime';

describe('restaurant agent runtime', () => {
  it('separates internal agent primitives from blocked external connectors', () => {
    const runtime = buildRestaurantAgentRuntime();

    expect(runtime.summary.internalReady).toBe(29);
    expect(runtime.summary.externalBlocked).toBe(3);
    expect(RESTAURANT_AGENT_CONNECTORS.filter(connector => connector.status === 'internal-ready').map(connector => connector.id)).toEqual([
      'local-browser-plan',
      'restaurant-memory',
      'agent-task-queue',
      'lobu-local-runtime',
      'local-persistent-ledger',
      'signed-runtime-callback',
      'recovery-orchestrator',
      'signed-callback-simulator',
      'browser-session-manifest',
      'browser-session-registry',
      'merchant-grant-manifest',
      'browser-runbook-package',
      'browser-runner-callback-contract',
      'browser-runner-event-ledger',
      'merchant-grant-checklist',
      'restaurant-activation-gates',
      'competitor-capability-audit',
      'agent-build-queue',
      'external-execution-package',
      'run-health-console',
      'runtime-connector-probe',
      'runtime-setup-contract',
      'receipt-evidence-validator',
      'business-signal-aggregator',
      'pos-import-schema-validator',
      'deterministic-tool-policy-evaluator',
      'watcher-policy-orchestrator',
      'public-profile-intake',
      'agent-ops-console',
    ]);
    expect(RESTAURANT_AGENT_CONNECTORS.filter(connector => !connector.canRunNow).map(connector => connector.id)).toEqual([
      'dianping-meituan',
      'xiaohongshu-douyin-wechat',
      'pos-redemption',
    ]);
  });

  it('tracks OpenClaw, Lobu and Hermes as attachable runtimes without pretending they are connected', () => {
    const runtime = buildRestaurantAgentRuntime();

    expect(RESTAURANT_AGENT_REFERENCES.map(reference => reference.name)).toEqual(['OpenClaw', 'Lobu', 'Hermes']);
    expect(runtime.references.every(reference => reference.canAttachNow === false)).toBe(true);
    expect(runtime.references.map(reference => reference.attachRequirement).join(' ')).toContain('执行');
    expect(runtime.summary.nextRuntimeChoice).toContain('OpenClaw');
    expect(runtime.summary.nextRuntimeChoice).toContain('Hermes');
    expect(runtime.summary.nextRuntimeChoice).toContain('Lobu');
    expect(runtime.summary.nextRuntimeChoice).toContain('本地运行层');
    expect(runtime.summary.nextRuntimeChoice).toContain('持久账本');
    expect(runtime.summary.nextRuntimeChoice).toContain('签名回执入口');
    expect(runtime.summary.nextRuntimeChoice).toContain('失败恢复编排');
    expect(runtime.summary.nextRuntimeChoice).toContain('浏览器 session manifest');
    expect(runtime.summary.nextRuntimeChoice).toContain('browser runbook package');
    expect(runtime.summary.nextRuntimeChoice).toContain('browser runner callback contract');
    expect(runtime.summary.nextRuntimeChoice).toContain('browser runner event ledger');
    expect(runtime.summary.nextRuntimeChoice).toContain('商家 grant manifest');
    expect(runtime.summary.nextRuntimeChoice).toContain('grant checklist wizard');
    expect(runtime.summary.nextRuntimeChoice).toContain('经营能力激活门禁');
    expect(runtime.summary.nextRuntimeChoice).toContain('竞品能力审计');
    expect(runtime.summary.nextRuntimeChoice).toContain('Agent 构建队列');
    expect(runtime.summary.nextRuntimeChoice).toContain('外部执行投递包');
    expect(runtime.summary.nextRuntimeChoice).toContain('run health 面板');
    expect(runtime.summary.nextRuntimeChoice).toContain('runtime probe');
    expect(runtime.summary.nextRuntimeChoice).toContain('runtime setup contract');
    expect(runtime.summary.nextRuntimeChoice).toContain('signed callback simulator');
    expect(runtime.summary.nextRuntimeChoice).toContain('POS import schema validator');
    expect(runtime.summary.nextRuntimeChoice).toContain('tool policy');
    expect(runtime.summary.nextRuntimeChoice).toContain('watcher policy');
    expect(runtime.summary.nextRuntimeChoice).toContain('public profile intake');
    expect(runtime.summary.nextRuntimeChoice).toContain('agent ops console');
  });

  it('creates a concrete task queue for browser execution, memory follow-up and redemption review', () => {
    const runtime = buildRestaurantAgentRuntime();

    expect(runtime.tasks.map(task => task.id)).toEqual([
      'browser-publish-check',
      'memory-followup',
      'redemption-review',
      'external-runtime-attach',
    ]);
    expect(runtime.tasks.find(task => task.id === 'browser-publish-check')).toEqual(expect.objectContaining({
      mode: 'local-plan',
      evidenceRequired: expect.stringContaining('截图'),
    }));
    expect(runtime.tasks.find(task => task.id === 'memory-followup')).toEqual(expect.objectContaining({
      mode: 'local-plan',
      owner: expect.stringContaining('店长'),
    }));
    expect(runtime.tasks.find(task => task.id === 'redemption-review')).toEqual(expect.objectContaining({
      mode: 'manual-handoff',
      evidenceRequired: expect.stringContaining('POS'),
    }));
  });

  it('keeps privacy and platform boundaries explicit', () => {
    const runtime = buildRestaurantAgentRuntime();
    const safetyText = runtime.memoryRules.map(rule => rule.safety).join(' ');
    const blockedText = runtime.connectors.filter(connector => !connector.canRunNow).map(connector => connector.auditBoundary).join(' ');

    expect(safetyText).toContain('不保存手机号');
    expect(safetyText).toContain('私信原文');
    expect(blockedText).toContain('没有授权前');
    expect(blockedText).toContain('不能宣称核销已完成');
    expect(runtime.connectors.filter(connector => !connector.canRunNow).every(connector => connector.canRunNow === false)).toBe(true);
  });
});

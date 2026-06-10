import type { RestaurantProviderReceiptLifecycle } from '@/lib/restaurant-provider-receipt-lifecycle';
import type { RestaurantProviderSandboxReadinessBoard } from '@/lib/restaurant-provider-sandbox-readiness-board';
import type { RestaurantProviderSandboxSubmitAttempt, RestaurantProviderSandboxSubmitWorkbench } from '@/lib/restaurant-provider-sandbox-submit-workbench';
import type { RestaurantRuntimeRunnerLoopPack } from '@/lib/restaurant-runtime-runner-loop-pack';

export type RestaurantProviderSandboxRunConsoleStep = {
  id: 'readiness' | 'submit-package' | 'dispatch' | 'runner-events' | 'signed-callback' | 'closeout';
  label: string;
  status: 'ready' | 'waiting' | 'blocked' | 'done';
  owner: 'runtime-admin' | 'provider' | 'ops' | 'store-manager' | 'data-ops' | 'merchant';
  evidence: string[];
  nextAction: string;
  stopLine: string;
};

export type RestaurantProviderSandboxRunConsole = {
  ok: true;
  payloadShape: 'restaurant-provider-sandbox-run-console-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict:
    | 'blocked-before-submit'
    | 'ready-to-submit'
    | 'submitted-watching-runner'
    | 'waiting-signed-callback'
    | 'accepted-closeout-ready'
    | 'recovery-required';
  summary: {
    steps: number;
    ready: number;
    waiting: number;
    blocked: number;
    done: number;
    submitAllowed: boolean;
    runnerEvents: number;
    waitingReceipts: number;
    acceptedReceipts: number;
    canCloseoutRun: boolean;
    canWriteMemory: boolean;
    canClaimExternalAutomation: false;
  };
  selectedLane: {
    capabilityId: string;
    packageId?: string;
    status: string;
    owner: string;
    nextAction: string;
  };
  timeline: RestaurantProviderSandboxRunConsoleStep[];
  closeoutChecklist: Array<{
    label: string;
    status: 'done' | 'waiting' | 'blocked';
    evidence: string;
  }>;
  operatorCommands: string[];
  providerCallbackContract: {
    endpoint: '/api/restaurant-agent/runtime';
    action: 'external-receipt';
    header: 'x-restaurant-agent-signature';
    acceptedEvidence: string[];
    forbiddenFields: string[];
  };
  externalRequired: string[];
  safetyBoundary: string;
};

function unique(values: string[], limit = 12): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function statusCount(steps: RestaurantProviderSandboxRunConsoleStep[], status: RestaurantProviderSandboxRunConsoleStep['status']) {
  return steps.filter(step => step.status === status).length;
}

function verdictFor(input: {
  blocked: number;
  submitAllowed: boolean;
  runnerEvents: number;
  waitingReceipts: number;
  acceptedReceipts: number;
  recoveryActions: number;
}): RestaurantProviderSandboxRunConsole['verdict'] {
  if (input.acceptedReceipts > 0) return 'accepted-closeout-ready';
  if (input.recoveryActions > 0) return 'recovery-required';
  if (input.waitingReceipts > 0) return 'waiting-signed-callback';
  if (input.runnerEvents > 0) return 'submitted-watching-runner';
  if (input.submitAllowed) return 'ready-to-submit';
  return 'blocked-before-submit';
}

export function buildRestaurantProviderSandboxRunConsole(input: {
  providerSandboxReadinessBoard: RestaurantProviderSandboxReadinessBoard;
  providerSandboxSubmitWorkbench: RestaurantProviderSandboxSubmitWorkbench;
  runtimeRunnerLoopPack: RestaurantRuntimeRunnerLoopPack;
  providerReceiptLifecycle: RestaurantProviderReceiptLifecycle;
  providerSandboxSubmitAttempt?: RestaurantProviderSandboxSubmitAttempt;
  now?: Date;
}): RestaurantProviderSandboxRunConsole {
  const now = input.now || new Date();
  const readyRow = input.providerSandboxReadinessBoard.rows.find(row => row.submitAllowed);
  const selectedRow = readyRow
    || input.providerSandboxReadinessBoard.rows.find(row => row.status === 'waiting-receipt')
    || input.providerSandboxReadinessBoard.rows.find(row => row.status === 'accepted')
    || input.providerSandboxReadinessBoard.rows[0];
  const selectedPackage = selectedRow
    ? input.providerSandboxSubmitWorkbench.submitPackages.find(item => item.capabilityId === selectedRow.capabilityId)
    : undefined;
  const runner = input.runtimeRunnerLoopPack;
  const lifecycle = input.providerReceiptLifecycle;
  const submitAttempt = input.providerSandboxSubmitAttempt;
  const submitAllowed = Boolean(selectedRow?.submitAllowed);
  const waitingReceipts = runner.summary.waitingReceipts || lifecycle.summary.waitingReceipts;
  const acceptedReceipts = runner.summary.acceptedReceipts || lifecycle.summary.acceptedReceipts;
  const recoveryActions = runner.summary.recoveryActions;

  const timeline: RestaurantProviderSandboxRunConsoleStep[] = [
    {
      id: 'readiness',
      label: '沙箱就绪判断',
      status: submitAllowed || selectedRow?.status === 'accepted' ? 'done' : 'blocked',
      owner: selectedRow?.owner || 'ops',
      evidence: [
        `verdict:${input.providerSandboxReadinessBoard.verdict}`,
        `submitAllowed:${submitAllowed}`,
        `missing:${selectedRow?.missing.slice(0, 3).join('|') || 'none'}`,
      ],
      nextAction: submitAllowed
        ? '使用已选脱敏包，启动受控沙箱提交。'
        : selectedRow?.nextAction || '完成外部通道配置后再提交沙箱。',
      stopLine: '外部通道密钥、店长授权、回执或数据合约凭证缺失时，不得提交。',
    },
    {
      id: 'submit-package',
      label: '脱敏提交包已选定',
      status: selectedPackage?.status === 'ready-to-submit' ? 'ready' : selectedPackage?.status === 'accepted' ? 'done' : 'blocked',
      owner: selectedPackage?.recoveryOwner || 'ops',
      evidence: [
        `package:${selectedPackage?.selectedPackageId || 'none'}`,
        `endpoint:${selectedPackage?.submitEndpointShape.endpointEnv || 'not-ready'}`,
        `secrets:${selectedPackage?.submitEndpointShape.includesSecrets ? 'blocked' : 'false'}`,
      ],
      nextAction: selectedPackage?.status === 'ready-to-submit'
        ? selectedPackage.nextAction
        : selectedPackage?.nextAction || '调度前先构建安全的外部通道包。',
      stopLine: selectedPackage?.stopLine || '提交包中不得含原始凭证、私信内容、券码或 POS 明细。',
    },
    {
      id: 'dispatch',
      label: '外部通道调度尝试',
      status: submitAttempt
        ? submitAttempt.verdict === 'forwarded-waiting-receipt' ? 'done' : 'blocked'
        : runner.summary.externalRuns > 0 ? 'done' : submitAllowed ? 'waiting' : 'blocked',
      owner: 'ops',
      evidence: submitAttempt
        ? [`verdict:${submitAttempt.verdict}`, `bridge:${submitAttempt.summary.bridgeStatus}`, `runRecorded:${submitAttempt.summary.runRecorded}`]
        : [`externalRuns:${runner.summary.externalRuns}`, `localRuns:${runner.summary.localRuns}`],
      nextAction: submitAttempt?.recoveryNextAction || runner.stages.find(stage => stage.id === 'adapter-ready')?.nextAction || '将已选包提交到外部通道沙箱。',
      stopLine: '调度本身不是凭证，试跑通道保持开放直到签名/公开回执被接受。',
    },
    {
      id: 'runner-events',
      label: '试跑通道事件与心跳',
      status: runner.summary.recoveryActions > 0 || runner.summary.staleRunnerRuns > 0
        ? 'blocked'
        : runner.summary.runnerEvents > 0 ? 'done' : 'waiting',
      owner: 'provider',
      evidence: [
        `runnerEvents:${runner.summary.runnerEvents}`,
        `active:${runner.summary.activeRunnerRuns}`,
        `completed:${runner.summary.completedRunnerRuns}`,
        `stale:${runner.summary.staleRunnerRuns}`,
      ],
      nextAction: runner.runnerEventHealth.operatorQueue[0]?.nextAction || runner.nextBestAction,
      stopLine: '试跑通道事件必须是脱敏摘要，拒绝 cookie、token、验证码、私信内容和用户标识。',
    },
    {
      id: 'signed-callback',
      label: '签名外部回执回调',
      status: acceptedReceipts > 0 ? 'done' : waitingReceipts > 0 ? 'waiting' : 'blocked',
      owner: 'runtime-admin',
      evidence: [
        `waitingReceipts:${waitingReceipts}`,
        `acceptedReceipts:${acceptedReceipts}`,
        `actionRequired:${lifecycle.summary.actionRequired}`,
      ],
      nextAction: lifecycle.stages.find(stage => stage.id === 'callback')?.nextAction || '结算前必须要求 x-restaurant-agent-signature 和 externalRunId。',
      stopLine: '未签名回调和无法核验的截图永远不得关闭试跑。',
    },
    {
      id: 'closeout',
      label: '结算、记忆与下一轮',
      status: lifecycle.summary.canWriteMemory ? 'done' : acceptedReceipts > 0 ? 'ready' : 'waiting',
      owner: 'store-manager',
      evidence: [
        `canWriteMemory:${lifecycle.summary.canWriteMemory}`,
        `canUpdateOperatingInsight:${lifecycle.summary.canUpdateOperatingInsight}`,
        `businessSignals:${lifecycle.summary.businessSignalItems}`,
      ],
      nextAction: lifecycle.stages.find(stage => stage.id === 'next-loop')?.nextAction || '等待已接受凭证后再写入记忆和规划下一轮。',
      stopLine: '记忆只存储已接受凭证、汇总计数、负责人和下一步动作，无凭证不得宣称增长。',
    },
  ];

  const summary = {
    steps: timeline.length,
    ready: statusCount(timeline, 'ready'),
    waiting: statusCount(timeline, 'waiting'),
    blocked: statusCount(timeline, 'blocked'),
    done: statusCount(timeline, 'done'),
    submitAllowed,
    runnerEvents: runner.summary.runnerEvents,
    waitingReceipts,
    acceptedReceipts,
    canCloseoutRun: acceptedReceipts > 0 && recoveryActions === 0,
    canWriteMemory: lifecycle.summary.canWriteMemory,
    canClaimExternalAutomation: false,
  } satisfies RestaurantProviderSandboxRunConsole['summary'];

  return {
    ok: true,
    payloadShape: 'restaurant-provider-sandbox-run-console-v1',
    generatedAt: now.toISOString(),
    restaurant: input.providerSandboxReadinessBoard.restaurant,
    offer: input.providerSandboxReadinessBoard.offer,
    verdict: verdictFor({
      blocked: summary.blocked,
      submitAllowed,
      runnerEvents: summary.runnerEvents,
      waitingReceipts,
      acceptedReceipts,
      recoveryActions,
    }),
    summary,
    selectedLane: {
      capabilityId: selectedRow?.capabilityId || 'unknown',
      packageId: selectedRow?.selectedPackageId,
      status: selectedRow?.status || 'blocked-provider',
      owner: selectedRow?.owner || 'ops',
      nextAction: selectedRow?.nextAction || '完成就绪检查后再提交沙箱。',
    },
    timeline,
    closeoutChecklist: [
      {
        label: '脱敏包已存在',
        status: selectedPackage?.safePayload ? 'done' : 'blocked',
        evidence: selectedPackage?.selectedPackageId || 'no package selected',
      },
      {
        label: '外部通道试跑已记录',
        status: runner.summary.externalRuns > 0 || submitAttempt?.summary.runRecorded ? 'done' : submitAllowed ? 'waiting' : 'blocked',
        evidence: submitAttempt?.selectedPackage?.selectedPackageId || `externalRuns:${runner.summary.externalRuns}`,
      },
      {
        label: '签名回执已接受',
        status: acceptedReceipts > 0 ? 'done' : waitingReceipts > 0 ? 'waiting' : 'blocked',
        evidence: lifecycle.latestReceipt?.receiptId || `waiting:${waitingReceipts}`,
      },
      {
        label: '允许写入记忆',
        status: lifecycle.summary.canWriteMemory ? 'done' : 'waiting',
        evidence: lifecycle.memoryWriteRule.allowed ? lifecycle.memoryWriteRule.writes.join(' / ') : '等待已接受凭证后解锁',
      },
    ],
    operatorCommands: unique([
      submitAllowed ? `提交包 ${selectedRow?.selectedPackageId || '已选包'} 到 ${selectedPackage?.targetRuntime || input.providerSandboxSubmitWorkbench.targetRuntime}。` : selectedRow?.nextAction || '',
      runner.nextBestAction,
      lifecycle.stages.find(stage => stage.status !== 'done')?.nextAction || '',
      '仅在签名回执、公开凭证或脱敏汇总回执被接受后关闭。',
    ], 6),
    providerCallbackContract: {
      endpoint: '/api/restaurant-agent/runtime',
      action: 'external-receipt',
      header: 'x-restaurant-agent-signature',
      acceptedEvidence: unique([
        ...(selectedRow?.evidenceRequired || []),
        ...(selectedPackage?.receiptExpectation || []),
        'eventId',
        'externalRunId',
        'operator summary',
      ], 10),
      forbiddenFields: [
        'api keys',
        'auth tokens',
        'cookies',
        'raw browser profile ids',
        'private-message text',
        'customer PII',
        'coupon codes',
        'payment ids',
        'raw POS rows',
      ],
    },
    externalRequired: unique([
      ...input.providerSandboxReadinessBoard.rows.flatMap(row => row.missing),
      ...input.providerSandboxSubmitWorkbench.externalRequired,
      ...runner.externalRequired,
      ...lifecycle.externalRequired,
    ], 12),
    safetyBoundary: '外部通道沙箱试跑控制台是可观测的控制面，用于沙箱调度、试跑通道事件、签名回调、回执结算和记忆写入判断。不执行浏览器操作、不发布内容、不触达客户、不核销券码、不读取私信、不写入 POS 记录、不暴露密钥，在外部通道回执被接受且店长批准汇总数据合约前，不宣称生产自动化。',
  };
}

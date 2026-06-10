import { buildRestaurantAgentCommandCenter, type RestaurantAgentCommandCenter } from '@/lib/restaurant-agent-command-center';
import { buildRestaurantExternalReadiness, type RestaurantExternalReadiness } from '@/lib/restaurant-agent-external-readiness';
import { buildRestaurantAgentHeartbeat, type RestaurantAgentHeartbeat } from '@/lib/restaurant-agent-heartbeat';
import type { RestaurantAgentReceiptRecord } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
import type { RestaurantBrowserRunnerEventRecord } from '@/lib/restaurant-agent-browser-runner-event-store';
import type { RestaurantBrowserSessionRecord } from '@/lib/restaurant-agent-browser-session-store';
import { buildRestaurantBrowserGatewayPack, type RestaurantBrowserGatewayPack } from '@/lib/restaurant-browser-gateway-pack';
import { buildRestaurantRuntimeRunnerLoopPack, type RestaurantRuntimeRunnerLoopPack } from '@/lib/restaurant-runtime-runner-loop-pack';
import type { RestaurantStoreManagerTaskQueue } from '@/lib/restaurant-store-manager-task-store';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantResidentAgentMissionLaneId = 'command' | 'browser' | 'runner' | 'memory' | 'store-manager' | 'operating-review';

export type RestaurantResidentAgentMissionLane = {
  id: RestaurantResidentAgentMissionLaneId;
  status: 'ready' | 'waiting-evidence' | 'needs-provider' | 'needs-owner' | 'complete';
  owner: 'ops' | 'runtime-admin' | 'provider' | 'store-manager' | 'ai-employee';
  promise: string;
  proof: string;
  nextAction: string;
};

export type RestaurantResidentAgentMissionControl = {
  ok: true;
  payloadShape: 'restaurant-resident-agent-mission-control-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  mode: 'handoff-only' | 'supervised-ready' | 'waiting-receipt' | 'needs-human' | 'review-ready';
  answerForMerchant: string;
  summary: {
    lanes: number;
    readyLanes: number;
    externalGates: number;
    followups: number;
    acceptedReceipts: number;
    runnerEvents: number;
    canRunInternally: boolean;
    canRunExternalBrowser: boolean;
    canClaimAutonomousOutcomes: false;
  };
  primaryAction: {
    label: string;
    owner: 'ops' | 'runtime-admin' | 'store-manager';
    reason: string;
    evidenceRequired: string;
  };
  lanes: RestaurantResidentAgentMissionLane[];
  commandCenter: Pick<RestaurantAgentCommandCenter, 'payloadShape' | 'mode' | 'headline' | 'summary' | 'primaryAction' | 'nextAction' | 'safetyBoundary'>;
  browserGateway: Pick<RestaurantBrowserGatewayPack, 'payloadShape' | 'mode' | 'canExecuteNow' | 'browserRequest' | 'snapshotPolicy' | 'contextBudget' | 'externalRequired' | 'safetyBoundary'>;
  runnerLoop: Pick<RestaurantRuntimeRunnerLoopPack, 'payloadShape' | 'verdict' | 'summary' | 'nextBestAction' | 'externalRequired' | 'safetyBoundary'>;
  heartbeat: Pick<RestaurantAgentHeartbeat, 'heartbeatId' | 'watchedRuns' | 'followups' | 'memorySuggestions' | 'blockedExternal' | 'acceptedReceipts' | 'taskWakeups'>;
  externalRequired: string[];
  safetyBoundary: string;
};

type EnvMap = Record<string, string | undefined>;

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
}

function unique(values: string[], limit = 12): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function modeFor(input: {
  commandCenter: RestaurantAgentCommandCenter;
  browserGateway: RestaurantBrowserGatewayPack;
  runnerLoop: RestaurantRuntimeRunnerLoopPack;
  heartbeat: RestaurantAgentHeartbeat;
}): RestaurantResidentAgentMissionControl['mode'] {
  if (input.runnerLoop.summary.acceptedReceipts > 0 || input.heartbeat.acceptedReceipts > 0) return 'review-ready';
  if (input.runnerLoop.summary.waitingReceipts > 0) return 'waiting-receipt';
  if (input.runnerLoop.summary.recoveryActions > 0 || input.commandCenter.mode === 'needs-recovery') return 'needs-human';
  if (input.browserGateway.canExecuteNow && input.commandCenter.mode === 'external-ready') return 'supervised-ready';
  return 'handoff-only';
}

function primaryActionFor(mode: RestaurantResidentAgentMissionControl['mode'], input: {
  commandCenter: RestaurantAgentCommandCenter;
  browserGateway: RestaurantBrowserGatewayPack;
  runnerLoop: RestaurantRuntimeRunnerLoopPack;
}): RestaurantResidentAgentMissionControl['primaryAction'] {
  if (mode === 'review-ready') {
    return {
      label: 'Close Out Review',
      owner: 'store-manager',
      reason: '已有验收回执，把凭证转进记忆、店长跟进和下一轮本地经营循环。',
      evidenceRequired: 'accepted public proof or signed receipt plus sanitized aggregate signal summary',
    };
  }
  if (mode === 'waiting-receipt') {
    return {
      label: '收取最终回执',
      owner: 'ops',
      reason: input.runnerLoop.nextBestAction,
      evidenceRequired: 'externalRunId, public proof URL, screenshot id or signed external-receipt callback',
    };
  }
  if (mode === 'needs-human') {
    return {
      label: 'Recover Blocker',
      owner: 'runtime-admin',
      reason: input.runnerLoop.nextBestAction || input.commandCenter.nextAction,
      evidenceRequired: 'blocked step, owner decision, replacement proof or setup fix',
    };
  }
  if (mode === 'supervised-ready') {
    return {
      label: '运行受监督浏览器任务',
      owner: 'runtime-admin',
      reason: '浏览器网关和外部指挥中心已就绪，只在允许动作和停止条件内执行。',
      evidenceRequired: input.browserGateway.browserRequest.requestShape.snapshotPolicyId,
    };
  }
  return {
    label: '运行本地试跑',
    owner: 'ops',
    reason: '外部浏览器执行还在补条件，先跑通本地流程并准备外部配置。',
    evidenceRequired: input.commandCenter.primaryAction.evidenceRequired,
  };
}

function buildLanes(input: {
  commandCenter: RestaurantAgentCommandCenter;
  browserGateway: RestaurantBrowserGatewayPack;
  runnerLoop: RestaurantRuntimeRunnerLoopPack;
  heartbeat: RestaurantAgentHeartbeat;
}): RestaurantResidentAgentMissionLane[] {
  return [
    {
      id: 'command',
      status: input.commandCenter.mode === 'needs-recovery' ? 'needs-owner' : input.commandCenter.mode === 'external-ready' ? 'ready' : 'waiting-evidence',
      owner: 'ops',
      promise: '把店长请求变成一条受控的门店经营任务。',
      proof: `${input.commandCenter.payloadShape} / ${input.commandCenter.mode}`,
      nextAction: input.commandCenter.primaryAction.reason,
    },
    {
      id: 'browser',
      status: input.browserGateway.canExecuteNow ? 'ready' : 'needs-provider',
      owner: 'runtime-admin',
      promise: '浏览器任务只走白名单请求约定和脱敏快照。',
      proof: `${input.browserGateway.payloadShape} / accepted actions ${input.browserGateway.browserRequest.acceptedActions.length}`,
      nextAction: input.browserGateway.canExecuteNow ? '在停止条件内转发受监督的浏览器请求。' : '配置通道地址/账号、隔离环境、回执密钥和店长授权。',
    },
    {
      id: 'runner',
      status: input.runnerLoop.summary.recoveryActions > 0
        ? 'needs-owner'
        : input.runnerLoop.summary.waitingReceipts > 0
          ? 'waiting-evidence'
          : input.runnerLoop.summary.runnerEvents > 0
            ? 'ready'
            : 'waiting-evidence',
      owner: 'provider',
      promise: '把步骤事件转成最终签名回执或明确的恢复动作。',
      proof: `${input.runnerLoop.summary.runnerEvents} runner events / ${input.runnerLoop.summary.waitingReceipts} waiting receipts`,
      nextAction: input.runnerLoop.nextBestAction,
    },
    {
      id: 'memory',
      status: input.heartbeat.memorySuggestions.length > 0 ? 'ready' : 'waiting-evidence',
      owner: 'ai-employee',
      promise: '只记住已验收的事实、下一个负责人和可复用的经营上下文。',
      proof: `${input.heartbeat.memorySuggestions.length} memory suggestions / ${input.heartbeat.followups.length} followups`,
      nextAction: input.heartbeat.memorySuggestions[0] || '写经营记忆之前，先跑出第一次受控运行。',
    },
    {
      id: 'store-manager',
      status: input.heartbeat.followups.some(item => item.priority === 'high') ? 'needs-owner' : input.heartbeat.followups.length ? 'ready' : 'waiting-evidence',
      owner: 'store-manager',
      promise: '把凭证和卡点变成指派好的店长跟进。',
      proof: `${input.heartbeat.followups.length} followups / ${input.heartbeat.taskWakeups} task wakeups`,
      nextAction: input.heartbeat.followups[0]?.nextAction || '还没有负责人队列，先跑受控试跑或店长任务包。',
    },
    {
      id: 'operating-review',
      status: input.runnerLoop.summary.acceptedReceipts > 0 || input.heartbeat.acceptedReceipts > 0 ? 'complete' : 'waiting-evidence',
      owner: 'store-manager',
      promise: '只复核已验收回执和脱敏的经营信号汇总。',
      proof: `${input.runnerLoop.summary.acceptedReceipts || input.heartbeat.acceptedReceipts} accepted receipts`,
      nextAction: input.runnerLoop.summary.acceptedReceipts ? '跑试跑复盘和下一轮渠道计划。' : '回执验收之前不宣称经营结果。',
    },
  ];
}

export async function buildRestaurantResidentAgentMissionControl(input: RestaurantTrialIntake & {
  runs?: RestaurantAgentRunRecord[];
  receipts?: RestaurantAgentReceiptRecord[];
  runnerEvents?: RestaurantBrowserRunnerEventRecord[];
  readiness?: RestaurantExternalReadiness;
  browserSessions?: RestaurantBrowserSessionRecord[];
  env?: EnvMap;
  fetcher?: typeof fetch;
  now?: Date;
} = {}): Promise<RestaurantResidentAgentMissionControl> {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, '试用门店');
  const offer = clean(input.offer, '今日主推套餐');
  const runs = input.runs || [];
  const receipts = input.receipts || [];
  const readiness = input.readiness || buildRestaurantExternalReadiness();
  const commandCenter = await buildRestaurantAgentCommandCenter({
    ...input,
    restaurant,
    offer,
    runs,
    receipts,
    readiness,
    browserSessions: input.browserSessions,
    env: input.env,
    fetcher: input.fetcher,
    now,
  });
  const browserGateway = buildRestaurantBrowserGatewayPack({
    runtimeTarget: 'openclaw',
    eventId: commandCenter.timeline.items[0]?.eventId,
    restaurant,
    offer,
    channel: input.channels,
    env: input.env,
    now,
  });
  const runnerLoop = buildRestaurantRuntimeRunnerLoopPack({
    runs,
    receipts,
    runnerEvents: input.runnerEvents || [],
    readiness,
    now,
  });
  const heartbeat = buildRestaurantAgentHeartbeat(runs, receipts, {
    storeManagerTaskQueue: commandCenter.storeManagerTaskQueue as RestaurantStoreManagerTaskQueue,
    now,
  });
  const lanes = buildLanes({ commandCenter, browserGateway, runnerLoop, heartbeat });
  const mode = modeFor({ commandCenter, browserGateway, runnerLoop, heartbeat });
  const externalRequired = unique([
    ...commandCenter.externalRequired,
    ...browserGateway.externalRequired,
    ...runnerLoop.externalRequired,
    ...heartbeat.blockedExternal,
  ]);

  return {
    ok: true,
    payloadShape: 'restaurant-resident-agent-mission-control-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    mode,
    answerForMerchant: mode === 'supervised-ready'
      ? '可以进入监督式常驻浏览器执行，但仍必须等签名回执或公开证明后才算完成。'
      : mode === 'review-ready'
        ? '已经有可验收回执，可以进入店长复盘、记忆写入和下一轮计划。'
        : '现在还不能承诺外部发布、线索承接或核销；系统会先跑内部闭环，并列出外部 Provider/授权缺口。',
    summary: {
      lanes: lanes.length,
      readyLanes: lanes.filter(item => item.status === 'ready' || item.status === 'complete').length,
      externalGates: externalRequired.length,
      followups: heartbeat.followups.length,
      acceptedReceipts: Math.max(heartbeat.acceptedReceipts, runnerLoop.summary.acceptedReceipts),
      runnerEvents: runnerLoop.summary.runnerEvents,
      canRunInternally: true,
      canRunExternalBrowser: browserGateway.canExecuteNow,
      canClaimAutonomousOutcomes: false,
    },
    primaryAction: primaryActionFor(mode, { commandCenter, browserGateway, runnerLoop }),
    lanes,
    commandCenter: {
      payloadShape: commandCenter.payloadShape,
      mode: commandCenter.mode,
      headline: commandCenter.headline,
      summary: commandCenter.summary,
      primaryAction: commandCenter.primaryAction,
      nextAction: commandCenter.nextAction,
      safetyBoundary: commandCenter.safetyBoundary,
    },
    browserGateway: {
      payloadShape: browserGateway.payloadShape,
      mode: browserGateway.mode,
      canExecuteNow: browserGateway.canExecuteNow,
      browserRequest: browserGateway.browserRequest,
      snapshotPolicy: browserGateway.snapshotPolicy,
      contextBudget: browserGateway.contextBudget,
      externalRequired: browserGateway.externalRequired,
      safetyBoundary: browserGateway.safetyBoundary,
    },
    runnerLoop: {
      payloadShape: runnerLoop.payloadShape,
      verdict: runnerLoop.verdict,
      summary: runnerLoop.summary,
      nextBestAction: runnerLoop.nextBestAction,
      externalRequired: runnerLoop.externalRequired,
      safetyBoundary: runnerLoop.safetyBoundary,
    },
    heartbeat: {
      heartbeatId: heartbeat.heartbeatId,
      watchedRuns: heartbeat.watchedRuns,
      followups: heartbeat.followups,
      memorySuggestions: heartbeat.memorySuggestions,
      blockedExternal: heartbeat.blockedExternal,
      acceptedReceipts: heartbeat.acceptedReceipts,
      taskWakeups: heartbeat.taskWakeups,
    },
    externalRequired,
    safetyBoundary: '常驻任务板负责本地指令、浏览器网关、执行循环、记忆、店长跟进和经营复盘的协调。它是监督和凭证控制，不等于自动发布、自动获客、自动核销、私信读取或 POS 分析；这些都要先有通道账号、店长授权、回执和数据约定。',
  };
}

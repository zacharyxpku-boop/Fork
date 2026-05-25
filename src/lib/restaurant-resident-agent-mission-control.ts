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
      reason: 'Accepted receipt exists; move proof into memory, manager follow-up and next local operating loop.',
      evidenceRequired: 'accepted public proof or signed receipt plus sanitized aggregate signal summary',
    };
  }
  if (mode === 'waiting-receipt') {
    return {
      label: 'Collect Final Receipt',
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
      label: 'Run Supervised Browser Task',
      owner: 'runtime-admin',
      reason: 'Browser gateway and external command center are ready; run only within allowed actions and stop conditions.',
      evidenceRequired: input.browserGateway.browserRequest.requestShape.snapshotPolicyId,
    };
  }
  return {
    label: 'Run Internal Trial',
    owner: 'ops',
    reason: 'External browser automation is still gated; prove the local workflow and prepare provider setup.',
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
      promise: 'Turn the merchant request into one governed restaurant operating mission.',
      proof: `${input.commandCenter.payloadShape} / ${input.commandCenter.mode}`,
      nextAction: input.commandCenter.primaryAction.reason,
    },
    {
      id: 'browser',
      status: input.browserGateway.canExecuteNow ? 'ready' : 'needs-provider',
      owner: 'runtime-admin',
      promise: 'Run browser tasks only through an allowlisted request contract and redacted snapshots.',
      proof: `${input.browserGateway.payloadShape} / accepted actions ${input.browserGateway.browserRequest.acceptedActions.length}`,
      nextAction: input.browserGateway.canExecuteNow ? 'Forward supervised browser request within stop conditions.' : 'Configure runtime URL/key, isolated profile, callback secret and merchant authorization.',
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
      promise: 'Convert step events into final signed receipt or explicit recovery.',
      proof: `${input.runnerLoop.summary.runnerEvents} runner events / ${input.runnerLoop.summary.waitingReceipts} waiting receipts`,
      nextAction: input.runnerLoop.nextBestAction,
    },
    {
      id: 'memory',
      status: input.heartbeat.memorySuggestions.length > 0 ? 'ready' : 'waiting-evidence',
      owner: 'ai-employee',
      promise: 'Remember only accepted facts, next owners and reusable operating context.',
      proof: `${input.heartbeat.memorySuggestions.length} memory suggestions / ${input.heartbeat.followups.length} followups`,
      nextAction: input.heartbeat.memorySuggestions[0] || 'Create the first governed run before writing operating memory.',
    },
    {
      id: 'store-manager',
      status: input.heartbeat.followups.some(item => item.priority === 'high') ? 'needs-owner' : input.heartbeat.followups.length ? 'ready' : 'waiting-evidence',
      owner: 'store-manager',
      promise: 'Convert proof and blockers into assigned manager follow-up.',
      proof: `${input.heartbeat.followups.length} followups / ${input.heartbeat.taskWakeups} task wakeups`,
      nextAction: input.heartbeat.followups[0]?.nextAction || 'No owner queue yet; run a controlled trial or store-manager task pack.',
    },
    {
      id: 'operating-review',
      status: input.runnerLoop.summary.acceptedReceipts > 0 || input.heartbeat.acceptedReceipts > 0 ? 'complete' : 'waiting-evidence',
      owner: 'store-manager',
      promise: 'Review only accepted receipts and sanitized aggregate operating signals.',
      proof: `${input.runnerLoop.summary.acceptedReceipts || input.heartbeat.acceptedReceipts} accepted receipts`,
      nextAction: input.runnerLoop.summary.acceptedReceipts ? 'Run post-run review and next-loop channel plan.' : 'Do not claim business outcomes until accepted receipts exist.',
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
        : '现在还不能承诺自动发布、自动获客或自动核销；系统会先跑内部闭环，并列出外部 Provider/授权缺口。',
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
    safetyBoundary: 'Resident Agent Mission Control coordinates internal command, browser gateway, runner loop, memory, manager follow-up and operating review. It is supervision and evidence control, not a claim of automatic publishing, automatic acquisition, automatic coupon redemption, private-message access or POS analytics without provider keys, merchant authorization, callback receipts and data contracts.',
  };
}

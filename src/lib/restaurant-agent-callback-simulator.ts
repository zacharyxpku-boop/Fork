import { buildRestaurantBusinessSignals, type RestaurantBusinessSignalReport } from '@/lib/restaurant-agent-business-signals';
import { signRestaurantAgentCallback, verifyRestaurantAgentCallback } from '@/lib/restaurant-agent-callback';
import { buildRestaurantAgentDispatch } from '@/lib/restaurant-agent-dispatch';
import { buildRestaurantAgentExecutionPackage, type RestaurantExecutionPackage } from '@/lib/restaurant-agent-execution-package';
import { buildRestaurantAgentHeartbeat, type RestaurantAgentHeartbeat } from '@/lib/restaurant-agent-heartbeat';
import { recordRestaurantAgentReceipt, type RestaurantAgentReceiptRecord, type RestaurantBusinessSignalType } from '@/lib/restaurant-agent-receipt-store';
import { buildRestaurantRunHealth, type RestaurantRunHealth } from '@/lib/restaurant-agent-run-health';
import { listRestaurantAgentRuns, recordRestaurantAgentRun, type RestaurantAgentRunRecord } from '@/lib/restaurant-agent-run-store';
import type { RestaurantRuntimeTarget } from '@/lib/restaurant-agent-runtime-bridge';

export type RestaurantCallbackSimulatorReport = {
  ok: true;
  payloadShape: 'restaurant-agent-callback-simulator-v1';
  generatedAt: string;
  simulationId: string;
  target: RestaurantRuntimeTarget;
  mode: 'local-signed-callback';
  executionPackage: Pick<RestaurantExecutionPackage, 'packageId' | 'payloadShape' | 'target' | 'status' | 'canForward' | 'blockedReasons' | 'requestedAction'>;
  run: RestaurantAgentRunRecord;
  callback: {
    endpoint: '/api/restaurant-agent/runtime';
    action: 'external-receipt';
    requiredHeader: 'x-restaurant-agent-signature';
    signatureVerified: boolean;
    secretExposed: false;
    rawBodyStored: false;
  };
  receipt: RestaurantAgentReceiptRecord;
  heartbeat: RestaurantAgentHeartbeat;
  runHealth: RestaurantRunHealth;
  businessSignals: RestaurantBusinessSignalReport;
  blockedExternal: string[];
  nextActions: string[];
  safetyBoundary: string;
};

function stableId(parts: string[]): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 41 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function cleanText(value: unknown, fallback: string, max = 96): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function readSignalType(value: unknown): RestaurantBusinessSignalType {
  return value === 'publish-proof'
    || value === 'reservation'
    || value === 'coupon-claim'
    || value === 'redemption'
    || value === 'private-domain-followup'
    || value === 'visit-intent'
    || value === 'manual-review'
    ? value
    : 'publish-proof';
}

function readCount(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : undefined;
}

export function runRestaurantCallbackSimulator(input: {
  target?: RestaurantRuntimeTarget;
  taskId?: string;
  restaurant?: string;
  offer?: string;
  owner?: string;
  signalType?: RestaurantBusinessSignalType;
  reservationCount?: number;
  couponClaimCount?: number;
  redemptionCount?: number;
  inquiryCount?: number;
  visitIntentCount?: number;
  simulatorSecret?: string;
  now?: Date;
} = {}): RestaurantCallbackSimulatorReport {
  const now = input.now || new Date();
  const target = input.target || 'openclaw';
  const restaurant = cleanText(input.restaurant, '试用门店');
  const offer = cleanText(input.offer, '今日主推套餐');
  const owner = cleanText(input.owner, '运营负责人');
  const signalType = readSignalType(input.signalType);
  const simulatorSecret = input.simulatorSecret || `local-simulator-${stableId([target, restaurant, offer, owner])}`;
  const dispatch = buildRestaurantAgentDispatch({
    taskId: input.taskId || 'browser-publish-check',
    restaurant,
    offer,
    owner,
    runtimeTarget: 'local',
    source: 'callback_simulator',
  });
  const run = recordRestaurantAgentRun(dispatch, 'local', undefined, now);
  const executionPackage = buildRestaurantAgentExecutionPackage({
    target,
    taskId: dispatch.taskId,
    restaurant,
    offer,
    owner,
    requestedAction: signalType === 'redemption' ? 'pull_pos_redemption' : 'capture_public_receipt',
    now,
  });
  const externalRunId = `sim-${target}-${stableId([executionPackage.packageId, run.eventId, now.toISOString()])}`;
  const rawBody = JSON.stringify({
    action: 'external-receipt',
    eventId: run.eventId,
    channel: `Local ${target} simulator`,
    externalRunId,
    screenshotId: `${externalRunId}-proof`,
    operator: 'local-callback-simulator',
    summary: `Local signed callback simulator produced a ${signalType} receipt for ${restaurant} / ${offer}. This is not a real platform publish, login, POS pull or redemption write.`,
    signalType,
    reservationCount: readCount(input.reservationCount),
    couponClaimCount: readCount(input.couponClaimCount),
    redemptionCount: readCount(input.redemptionCount),
    inquiryCount: readCount(input.inquiryCount),
    visitIntentCount: readCount(input.visitIntentCount),
  });
  const signature = signRestaurantAgentCallback(rawBody, simulatorSecret);
  const verification = verifyRestaurantAgentCallback(rawBody, signature, simulatorSecret);
  const payload = JSON.parse(rawBody) as Record<string, unknown>;
  const receipt = recordRestaurantAgentReceipt({
    eventId: typeof payload.eventId === 'string' ? payload.eventId : undefined,
    channel: typeof payload.channel === 'string' ? payload.channel : undefined,
    screenshotId: typeof payload.screenshotId === 'string' ? payload.screenshotId : undefined,
    externalRunId: typeof payload.externalRunId === 'string' ? payload.externalRunId : undefined,
    operator: typeof payload.operator === 'string' ? payload.operator : undefined,
    summary: typeof payload.summary === 'string' ? payload.summary : undefined,
    source: 'external-runtime',
    signalType,
    reservationCount: readCount(payload.reservationCount),
    couponClaimCount: readCount(payload.couponClaimCount),
    redemptionCount: readCount(payload.redemptionCount),
    inquiryCount: readCount(payload.inquiryCount),
    visitIntentCount: readCount(payload.visitIntentCount),
  }, now);
  const runs = listRestaurantAgentRuns();
  const receipts = [receipt];
  const heartbeat = buildRestaurantAgentHeartbeat(runs, receipts);
  const runHealth = buildRestaurantRunHealth(runs, receipts, undefined, now);
  const businessSignals = buildRestaurantBusinessSignals(runs, receipts, now);

  return {
    ok: true,
    payloadShape: 'restaurant-agent-callback-simulator-v1',
    generatedAt: now.toISOString(),
    simulationId: `restaurant-callback-sim-${stableId([run.eventId, externalRunId])}`,
    target,
    mode: 'local-signed-callback',
    executionPackage: {
      packageId: executionPackage.packageId,
      payloadShape: executionPackage.payloadShape,
      target: executionPackage.target,
      status: executionPackage.status,
      canForward: executionPackage.canForward,
      blockedReasons: executionPackage.blockedReasons,
      requestedAction: executionPackage.requestedAction,
    },
    run,
    callback: {
      endpoint: '/api/restaurant-agent/runtime',
      action: 'external-receipt',
      requiredHeader: 'x-restaurant-agent-signature',
      signatureVerified: verification.ok,
      secretExposed: false,
      rawBodyStored: false,
    },
    receipt,
    heartbeat,
    runHealth,
    businessSignals,
    blockedExternal: [
      ...executionPackage.blockedReasons,
      'Local simulator does not log in, publish, read private messages, pull POS data or write coupon redemption.',
    ],
    nextActions: [
      'Use this simulator to verify callback signing, receipt validation, run health, watcher and business signal wiring.',
      'Replace the simulator with Lobu/OpenClaw/Hermes only after runtime URL/key, callback secret, browser profile and merchant authorization are configured.',
      'Keep real platform proof subject to the same signed external-receipt validation gate.',
    ],
    safetyBoundary: 'Callback simulator proves Wenai callback plumbing only. It never opens a merchant account, bypasses login/captcha, publishes content, reads private messages, pulls POS rows, writes redemptions, stores raw callback body or exposes callback secrets.',
  };
}

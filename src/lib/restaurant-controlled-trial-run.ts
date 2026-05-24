import { runRestaurantCallbackSimulator, type RestaurantCallbackSimulatorReport } from '@/lib/restaurant-agent-callback-simulator';
import type { RestaurantBusinessSignalType } from '@/lib/restaurant-agent-receipt-store';
import type { RestaurantRuntimeTarget } from '@/lib/restaurant-agent-runtime-bridge';
import { buildRestaurantExternalExecutionWizard, type RestaurantExternalExecutionWizard } from '@/lib/restaurant-external-execution-wizard';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantControlledTrialRun = {
  ok: true;
  payloadShape: 'restaurant-controlled-trial-run-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  target: RestaurantRuntimeTarget;
  mode: 'local-simulator' | 'external-ready';
  verdict: 'simulated-accepted' | 'external-ready' | 'blocked';
  canForwardExternally: boolean;
  wizard: Pick<RestaurantExternalExecutionWizard, 'payloadShape' | 'verdict' | 'canForward' | 'summary' | 'steps' | 'operatorScript' | 'safetyBoundary'>;
  simulation: Pick<RestaurantCallbackSimulatorReport, 'payloadShape' | 'simulationId' | 'mode' | 'executionPackage' | 'run' | 'callback' | 'receipt' | 'blockedExternal' | 'nextActions' | 'safetyBoundary'>;
  runHealth: RestaurantCallbackSimulatorReport['runHealth'];
  businessSignals: RestaurantCallbackSimulatorReport['businessSignals'];
  operatorCloseout: Array<{
    owner: string;
    action: string;
    evidence: string;
  }>;
  externalRequired: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, 120) : fallback;
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
    : 'visit-intent';
}

export async function runRestaurantControlledTrialRun(input: RestaurantTrialIntake & {
  target?: RestaurantRuntimeTarget;
  signalType?: RestaurantBusinessSignalType;
  owner?: string;
  reservationCount?: number;
  couponClaimCount?: number;
  redemptionCount?: number;
  inquiryCount?: number;
  visitIntentCount?: number;
  env?: Record<string, string | undefined>;
  fetcher?: typeof fetch;
  now?: Date;
} = {}): Promise<RestaurantControlledTrialRun> {
  const now = input.now || new Date();
  const restaurant = clean(input.restaurant, '试用门店');
  const offer = clean(input.offer, '今日主推套餐');
  const target = input.target || 'openclaw';
  const signalType = readSignalType(input.signalType);
  const wizard = await buildRestaurantExternalExecutionWizard({
    target,
    requestedAction: signalType === 'redemption' ? 'pull_pos_redemption' : 'capture_public_receipt',
    restaurant,
    offer,
    owner: input.owner,
    env: input.env,
    fetcher: input.fetcher,
    now,
  });
  const simulation = runRestaurantCallbackSimulator({
    target,
    restaurant,
    offer,
    owner: input.owner,
    signalType,
    reservationCount: input.reservationCount,
    couponClaimCount: input.couponClaimCount,
    redemptionCount: input.redemptionCount,
    inquiryCount: input.inquiryCount,
    visitIntentCount: input.visitIntentCount,
    now,
  });
  const canForwardExternally = wizard.canForward;
  const externalRequired = Array.from(new Set([
    ...wizard.steps.filter(step => step.status === 'blocked').map(step => step.nextAction),
    ...simulation.blockedExternal,
  ])).slice(0, 10);

  return {
    ok: true,
    payloadShape: 'restaurant-controlled-trial-run-v1',
    generatedAt: now.toISOString(),
    restaurant,
    offer,
    target,
    mode: canForwardExternally ? 'external-ready' : 'local-simulator',
    verdict: canForwardExternally ? 'external-ready' : simulation.receipt.status === 'accepted' ? 'simulated-accepted' : 'blocked',
    canForwardExternally,
    wizard: {
      payloadShape: wizard.payloadShape,
      verdict: wizard.verdict,
      canForward: wizard.canForward,
      summary: wizard.summary,
      steps: wizard.steps,
      operatorScript: wizard.operatorScript,
      safetyBoundary: wizard.safetyBoundary,
    },
    simulation: {
      payloadShape: simulation.payloadShape,
      simulationId: simulation.simulationId,
      mode: simulation.mode,
      executionPackage: simulation.executionPackage,
      run: simulation.run,
      callback: simulation.callback,
      receipt: simulation.receipt,
      blockedExternal: simulation.blockedExternal,
      nextActions: simulation.nextActions,
      safetyBoundary: simulation.safetyBoundary,
    },
    runHealth: simulation.runHealth,
    businessSignals: simulation.businessSignals,
    operatorCloseout: [
      {
        owner: simulation.run.owner,
        action: simulation.runHealth.operatorQueue[0]?.nextAction || 'Review accepted simulated receipt and decide whether to replace simulator with external runtime.',
        evidence: simulation.receipt.receiptId,
      },
      {
        owner: 'runtime-admin',
        action: canForwardExternally ? `Forward the governed execution package to ${target}.` : wizard.steps.find(step => step.status === 'blocked')?.nextAction || 'Resolve blocked provider gates before external forwarding.',
        evidence: wizard.payloadShape,
      },
      {
        owner: 'store-manager',
        action: simulation.businessSignals.nextActions[0] || 'Use accepted aggregate signals for store follow-up only.',
        evidence: simulation.businessSignals.summary.acceptedReceipts ? 'accepted aggregate receipt' : 'no accepted receipt',
      },
    ],
    externalRequired,
    safetyBoundary: 'Controlled Trial Run proves the internal execution, signed callback, receipt, run health and business-signal loop. In local-simulator mode it does not publish, log in, acquire customers, redeem coupons, read private messages, pull POS rows or claim real operating results.',
  };
}

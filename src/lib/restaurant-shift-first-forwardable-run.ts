import type { RestaurantFirstForwardableRunPack } from '@/lib/restaurant-first-forwardable-run-pack';
import type { RestaurantProviderSandboxContract } from '@/lib/restaurant-provider-sandbox-contract';
import type { RestaurantShiftAutopilotRunRecord } from '@/lib/restaurant-shift-autopilot-run-store';
import type { RestaurantShiftProviderHandoff } from '@/lib/restaurant-shift-provider-handoff';
import type { RestaurantShiftSandboxAcceptance } from '@/lib/restaurant-shift-sandbox-acceptance';
import type { RestaurantTaskProviderHandoff } from '@/lib/restaurant-task-provider-handoff';

export type RestaurantShiftFirstForwardableRunStage = {
  id: 'shift-run-selected' | 'provider-handoff' | 'sandbox-acceptance' | 'task-package' | 'receipt-boundary' | 'external-claim';
  status: 'passed' | 'waiting-external' | 'blocked';
  owner: 'ops' | 'runtime-admin' | 'merchant' | 'data-ops';
  evidence: string[];
  nextAction: string;
};

export type RestaurantShiftFirstForwardableRun = {
  ok: true;
  payloadShape: 'restaurant-shift-first-forwardable-run-v1';
  generatedAt: string;
  verdict: 'ready-for-provider-sandbox' | 'waiting-provider' | 'needs-shift-run' | 'manual-proof-mode';
  summary: {
    shiftRuns: number;
    providerRequests: number;
    sandboxStagesPassed: number;
    forwardablePackages: number;
    blockedStages: number;
    waitingExternalStages: number;
    canForwardFirstShiftRun: boolean;
    canSubmitSandbox: boolean;
    canClaimExternalAutomation: false;
  };
  selectedShiftRun?: {
    runId: string;
    restaurant: string;
    offer: string;
    completedAt: string;
    providerHeldActions: number;
    evidenceHeldActions: number;
    createdStoreManagerTasks: number;
  };
  selectedPackage?: RestaurantFirstForwardableRunPack['selectedPackage'];
  stages: RestaurantShiftFirstForwardableRunStage[];
  shiftProviderHandoff: Pick<RestaurantShiftProviderHandoff, 'payloadShape' | 'summary' | 'providerEnvKeys' | 'merchantApprovals' | 'dataContracts' | 'nextAction' | 'safetyBoundary'>;
  shiftSandboxAcceptance: Pick<RestaurantShiftSandboxAcceptance, 'payloadShape' | 'verdict' | 'summary' | 'submitContract' | 'externalRequired' | 'safetyBoundary'>;
  firstForwardableRunPack: Pick<RestaurantFirstForwardableRunPack, 'payloadShape' | 'verdict' | 'summary' | 'selectedPackage' | 'externalRequired' | 'safetyBoundary'>;
  taskProviderHandoff: Pick<RestaurantTaskProviderHandoff, 'payloadShape' | 'summary' | 'providerContract' | 'safetyBoundary'>;
  providerSandboxContract: Pick<RestaurantProviderSandboxContract, 'payloadShape' | 'verdict' | 'summary' | 'acceptanceContract' | 'safetyBoundary'>;
  operatorScript: string[];
  externalRequired: string[];
  safetyBoundary: string;
};

function stage(input: RestaurantShiftFirstForwardableRunStage): RestaurantShiftFirstForwardableRunStage {
  return input;
}

function latestShiftRun(runs: RestaurantShiftAutopilotRunRecord[]): RestaurantShiftAutopilotRunRecord | undefined {
  return runs.slice().sort((left, right) => right.completedAt.localeCompare(left.completedAt))[0];
}

function verdict(input: {
  selectedRun?: RestaurantShiftAutopilotRunRecord;
  canForwardFirstShiftRun: boolean;
  shiftSandboxAcceptance: RestaurantShiftSandboxAcceptance;
  firstForwardableRunPack: RestaurantFirstForwardableRunPack;
}): RestaurantShiftFirstForwardableRun['verdict'] {
  if (!input.selectedRun) return 'needs-shift-run';
  if (input.canForwardFirstShiftRun) return 'ready-for-provider-sandbox';
  if (input.shiftSandboxAcceptance.summary.waitingExternal > 0 || input.firstForwardableRunPack.summary.handoffOnly > 0) return 'waiting-provider';
  return 'manual-proof-mode';
}

export function buildRestaurantShiftFirstForwardableRun(input: {
  shiftRuns: RestaurantShiftAutopilotRunRecord[];
  shiftProviderHandoff: RestaurantShiftProviderHandoff;
  shiftSandboxAcceptance: RestaurantShiftSandboxAcceptance;
  firstForwardableRunPack: RestaurantFirstForwardableRunPack;
  taskProviderHandoff: RestaurantTaskProviderHandoff;
  providerSandboxContract: RestaurantProviderSandboxContract;
  now?: Date;
}): RestaurantShiftFirstForwardableRun {
  const now = input.now || new Date();
  const selectedRun = latestShiftRun(input.shiftRuns);
  const selectedPackage = input.firstForwardableRunPack.selectedPackage;
  const canForwardFirstShiftRun = Boolean(
    selectedRun
    && input.shiftProviderHandoff.summary.requests > 0
    && input.shiftSandboxAcceptance.summary.canSubmitSandbox
    && input.firstForwardableRunPack.summary.canForwardFirstRun
    && selectedPackage?.canForward,
  );
  const stages = [
    stage({
      id: 'shift-run-selected',
      status: selectedRun ? 'passed' : 'blocked',
      owner: 'ops',
      evidence: selectedRun
        ? [`run:${selectedRun.runId}`, `providerHeld:${selectedRun.summary.providerHeldActions}`, `tasks:${selectedRun.summary.createdStoreManagerTasks}`]
        : ['no shift-autopilot-run ledger record'],
      nextAction: selectedRun
        ? 'Use the latest recorded Shift Autopilot run as the source for provider-held and evidence-held actions.'
        : 'Run Shift Autopilot first; the first provider run must come from a recorded shift ledger receipt.',
    }),
    stage({
      id: 'provider-handoff',
      status: input.shiftProviderHandoff.summary.requests > 0
        ? input.shiftProviderHandoff.summary.waitingExternal > 0 ? 'waiting-external' : 'passed'
        : 'blocked',
      owner: input.shiftProviderHandoff.summary.p0 > 0 ? 'runtime-admin' : 'ops',
      evidence: [
        `requests:${input.shiftProviderHandoff.summary.requests}`,
        `p0:${input.shiftProviderHandoff.summary.p0}`,
        `readyToSandbox:${input.shiftProviderHandoff.summary.readyToSandbox}`,
      ],
      nextAction: input.shiftProviderHandoff.summary.requests > 0
        ? input.shiftProviderHandoff.nextAction
        : 'Build Shift Provider Handoff from the latest shift run before any runtime submit.',
    }),
    stage({
      id: 'sandbox-acceptance',
      status: input.shiftSandboxAcceptance.summary.canSubmitSandbox
        ? 'passed'
        : input.shiftSandboxAcceptance.summary.blocked > 0 ? 'blocked' : 'waiting-external',
      owner: 'runtime-admin',
      evidence: [
        `verdict:${input.shiftSandboxAcceptance.verdict}`,
        `passed:${input.shiftSandboxAcceptance.summary.passed}/${input.shiftSandboxAcceptance.summary.stages}`,
        `providerRequests:${input.shiftSandboxAcceptance.summary.providerRequests}`,
      ],
      nextAction: input.shiftSandboxAcceptance.summary.canSubmitSandbox
        ? 'Submit only sanitized payloads to the sandbox runtime and wait for signed/public receipt.'
        : input.shiftSandboxAcceptance.externalRequired[0] || 'Resolve runtime, callback, merchant and receipt gates before sandbox submit.',
    }),
    stage({
      id: 'task-package',
      status: selectedPackage?.canForward
        ? 'passed'
        : input.firstForwardableRunPack.summary.readyTasks > 0 ? 'waiting-external' : 'blocked',
      owner: 'ops',
      evidence: selectedPackage
        ? [`package:${selectedPackage.packageId}`, `canForward:${selectedPackage.canForward}`, `target:${selectedPackage.runtimeTarget}`]
        : [`readyTasks:${input.firstForwardableRunPack.summary.readyTasks}`, `forwardable:${input.firstForwardableRunPack.summary.forwardable}`],
      nextAction: selectedPackage?.canForward
        ? 'Forward selectedPackage.safePayload plus executionPackage only; keep all secrets server-side.'
        : selectedPackage?.blockedReasons[0] || 'Mark one evidence-reviewed store-manager task as ready-for-provider.',
    }),
    stage({
      id: 'receipt-boundary',
      status: input.providerSandboxContract.acceptanceContract.callbackRequires.includes('x-restaurant-agent-signature') ? 'passed' : 'waiting-external',
      owner: 'ops',
      evidence: [
        `callback:${input.shiftSandboxAcceptance.submitContract.callbackAction}`,
        `header:${input.shiftSandboxAcceptance.submitContract.callbackHeader}`,
        `forbidden:${input.shiftSandboxAcceptance.submitContract.forbiddenFields.length}`,
      ],
      nextAction: 'Close the run only after a signed external-receipt callback or public proof URL/screenshot is accepted.',
    }),
    stage({
      id: 'external-claim',
      status: canForwardFirstShiftRun ? 'waiting-external' : 'blocked',
      owner: 'merchant',
      evidence: [
        `canSubmitSandbox:${input.shiftSandboxAcceptance.summary.canSubmitSandbox}`,
        `canForwardFirstRun:${input.firstForwardableRunPack.summary.canForwardFirstRun}`,
        'canClaimExternalAutomation:false',
      ],
      nextAction: canForwardFirstShiftRun
        ? 'Describe this as sandbox-ready only; production auto-publish/acquisition/redemption claims still require accepted receipts and merchant data gates.'
        : 'Keep the customer surface in manual-proof mode until sandbox submit, receipts and merchant/data gates are proven.',
    }),
  ];
  const blockedStages = stages.filter(item => item.status === 'blocked').length;
  const waitingExternalStages = stages.filter(item => item.status === 'waiting-external').length;

  return {
    ok: true,
    payloadShape: 'restaurant-shift-first-forwardable-run-v1',
    generatedAt: now.toISOString(),
    verdict: verdict({
      selectedRun,
      canForwardFirstShiftRun,
      shiftSandboxAcceptance: input.shiftSandboxAcceptance,
      firstForwardableRunPack: input.firstForwardableRunPack,
    }),
    summary: {
      shiftRuns: input.shiftRuns.length,
      providerRequests: input.shiftProviderHandoff.summary.requests,
      sandboxStagesPassed: input.shiftSandboxAcceptance.summary.passed,
      forwardablePackages: input.firstForwardableRunPack.summary.forwardable,
      blockedStages,
      waitingExternalStages,
      canForwardFirstShiftRun,
      canSubmitSandbox: input.shiftSandboxAcceptance.summary.canSubmitSandbox,
      canClaimExternalAutomation: false,
    },
    selectedShiftRun: selectedRun ? {
      runId: selectedRun.runId,
      restaurant: selectedRun.restaurant,
      offer: selectedRun.offer,
      completedAt: selectedRun.completedAt,
      providerHeldActions: selectedRun.summary.providerHeldActions,
      evidenceHeldActions: selectedRun.summary.evidenceHeldActions,
      createdStoreManagerTasks: selectedRun.summary.createdStoreManagerTasks,
    } : undefined,
    selectedPackage,
    stages,
    shiftProviderHandoff: {
      payloadShape: input.shiftProviderHandoff.payloadShape,
      summary: input.shiftProviderHandoff.summary,
      providerEnvKeys: input.shiftProviderHandoff.providerEnvKeys,
      merchantApprovals: input.shiftProviderHandoff.merchantApprovals,
      dataContracts: input.shiftProviderHandoff.dataContracts,
      nextAction: input.shiftProviderHandoff.nextAction,
      safetyBoundary: input.shiftProviderHandoff.safetyBoundary,
    },
    shiftSandboxAcceptance: {
      payloadShape: input.shiftSandboxAcceptance.payloadShape,
      verdict: input.shiftSandboxAcceptance.verdict,
      summary: input.shiftSandboxAcceptance.summary,
      submitContract: input.shiftSandboxAcceptance.submitContract,
      externalRequired: input.shiftSandboxAcceptance.externalRequired,
      safetyBoundary: input.shiftSandboxAcceptance.safetyBoundary,
    },
    firstForwardableRunPack: {
      payloadShape: input.firstForwardableRunPack.payloadShape,
      verdict: input.firstForwardableRunPack.verdict,
      summary: input.firstForwardableRunPack.summary,
      selectedPackage: input.firstForwardableRunPack.selectedPackage,
      externalRequired: input.firstForwardableRunPack.externalRequired,
      safetyBoundary: input.firstForwardableRunPack.safetyBoundary,
    },
    taskProviderHandoff: {
      payloadShape: input.taskProviderHandoff.payloadShape,
      summary: input.taskProviderHandoff.summary,
      providerContract: input.taskProviderHandoff.providerContract,
      safetyBoundary: input.taskProviderHandoff.safetyBoundary,
    },
    providerSandboxContract: {
      payloadShape: input.providerSandboxContract.payloadShape,
      verdict: input.providerSandboxContract.verdict,
      summary: input.providerSandboxContract.summary,
      acceptanceContract: input.providerSandboxContract.acceptanceContract,
      safetyBoundary: input.providerSandboxContract.safetyBoundary,
    },
    operatorScript: [
      'Run Shift Autopilot and keep the ledger run as the source of truth.',
      'Resolve P0 provider asks, callback signature, merchant grant and aggregate data contracts before sandbox submit.',
      'Forward one sanitized package only when both Shift Sandbox Acceptance and First Forwardable Run Pack are ready.',
      'Wait for signed external-receipt or public proof before claiming outcome, closing tasks or training follow-up memory.',
      'Never send secrets, cookies, browser profile raw ids, private messages, coupon codes, payment ids or raw POS rows.',
    ],
    externalRequired: Array.from(new Set([
      ...stages.filter(item => item.status !== 'passed').map(item => item.nextAction),
      ...input.shiftSandboxAcceptance.externalRequired,
      ...input.firstForwardableRunPack.externalRequired,
      ...input.shiftProviderHandoff.providerEnvKeys.map(key => `Configure server-side key: ${key}`),
      ...input.shiftProviderHandoff.merchantApprovals,
      ...input.shiftProviderHandoff.dataContracts,
    ])).slice(0, 16),
    safetyBoundary: 'Shift First Forwardable Run is a sandbox handoff preflight. It does not call a provider, keep a browser open, log in, publish, contact customers, redeem coupons, read private messages, pull raw POS rows, expose secrets, close tasks, or claim production automation without signed/public proof and merchant/data authorization.',
  };
}

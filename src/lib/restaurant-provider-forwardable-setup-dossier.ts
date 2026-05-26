import type { RestaurantExternalUnlockRequestPack } from '@/lib/restaurant-external-unlock-request-pack';
import type { RestaurantMerchantAuthorizationPacket } from '@/lib/restaurant-merchant-authorization-packet';
import type { RestaurantProviderKeyGapBoard } from '@/lib/restaurant-provider-key-gap-board';
import type { RestaurantProviderLiveRunGate } from '@/lib/restaurant-provider-live-run-gate';
import type { RestaurantProviderLiveRunLaunchAttempt } from '@/lib/restaurant-provider-live-run-launch-attempt';
import type { RestaurantRunnerMissionTimeline } from '@/lib/restaurant-runner-mission-timeline';

export type RestaurantProviderForwardableSetupDossier = {
  ok: true;
  payloadShape: 'restaurant-provider-forwardable-setup-dossier-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  summary: {
    packets: number;
    p0Items: number;
    providerEnvKeys: number;
    merchantSignoffs: number;
    dataContracts: number;
    canStartInternalNow: boolean;
    canStartLiveProviderNow: boolean;
    canClaimExternalAutomation: false;
  };
  packets: Array<{
    id: 'runtime-provider' | 'merchant-owner' | 'data-owner' | 'ops-lead';
    title: string;
    sendTo: 'Provider engineer' | 'Merchant owner' | 'Data/POS owner' | 'Store ops lead';
    objective: string;
    asks: string[];
    evidenceRequired: string[];
    acceptanceTests: string[];
    forbidden: string[];
    firstMessage: string;
  }>;
  envTemplate: Array<{
    key: string;
    owner: 'runtime-admin' | 'ops' | 'merchant';
    requiredFor: string[];
    configured: boolean;
    value: '<server-side-only>';
  }>;
  signoffMatrix: Array<{
    owner: RestaurantExternalUnlockRequestPack['signoffChecklist'][number]['owner'];
    priority: RestaurantExternalUnlockRequestPack['signoffChecklist'][number]['priority'];
    title: string;
    proofRequired: string;
    status: RestaurantExternalUnlockRequestPack['signoffChecklist'][number]['status'];
  }>;
  firstLiveRunContract: {
    launchVerdict: RestaurantProviderLiveRunLaunchAttempt['verdict'];
    gateVerdict: RestaurantProviderLiveRunGate['verdict'];
    runnerVerdict: RestaurantRunnerMissionTimeline['verdict'];
    packageId: string;
    callbackAction: 'external-receipt';
    callbackHeader: 'x-restaurant-agent-signature';
    acceptedCloseout: string[];
  };
  exportDigest: {
    markdown: string;
    csv: string;
  };
  externalRequired: string[];
  safetyBoundary: string;
};

function unique(values: string[], limit = 16): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function packet(input: RestaurantProviderForwardableSetupDossier['packets'][number]) {
  return input;
}

function buildDigest(input: {
  restaurant: string;
  offer: string;
  generatedAt: string;
  packets: RestaurantProviderForwardableSetupDossier['packets'];
  envTemplate: RestaurantProviderForwardableSetupDossier['envTemplate'];
  signoffMatrix: RestaurantProviderForwardableSetupDossier['signoffMatrix'];
  safetyBoundary: string;
}) {
  const markdown = [
    `# ${input.restaurant} / ${input.offer} Forwardable Provider Setup Dossier`,
    '',
    `Generated: ${input.generatedAt}`,
    '',
    '## Packets',
    ...input.packets.map(item => [
      `### ${item.title}`,
      `Send to: ${item.sendTo}`,
      `Objective: ${item.objective}`,
      `Asks: ${item.asks.join(' / ')}`,
      `Acceptance: ${item.acceptanceTests.join(' / ')}`,
    ].join('\n')),
    '',
    '## Env Keys',
    ...input.envTemplate.map(item => `- ${item.key}: ${item.configured ? 'configured' : 'missing'} (${item.requiredFor.slice(0, 3).join(' / ')})`),
    '',
    '## Safety Boundary',
    input.safetyBoundary,
  ].join('\n');
  const csv = [
    'owner,priority,title,proof_required,status',
    ...input.signoffMatrix.map(item => [
      item.owner,
      item.priority,
      item.title,
      item.proofRequired,
      item.status,
    ].map(csvCell).join(',')),
  ].join('\n');
  return { markdown, csv };
}

export function buildRestaurantProviderForwardableSetupDossier(input: {
  keyGapBoard: RestaurantProviderKeyGapBoard;
  externalUnlockRequestPack: RestaurantExternalUnlockRequestPack;
  merchantAuthorizationPacket: RestaurantMerchantAuthorizationPacket;
  providerLiveRunGate: RestaurantProviderLiveRunGate;
  providerLiveRunLaunchAttempt: RestaurantProviderLiveRunLaunchAttempt;
  runnerMissionTimeline: RestaurantRunnerMissionTimeline;
  now?: Date;
}): RestaurantProviderForwardableSetupDossier {
  const now = input.now || new Date();
  const forbidden = [
    'API key values',
    'cookies',
    'tokens',
    'browser profile files',
    'private-message raw text',
    'customer identifiers',
    'coupon codes',
    'payment ids',
    'raw POS rows',
  ];
  const p0Requests = input.externalUnlockRequestPack.requests.filter(item => item.priority === 'p0');
  const runtimeAsks = unique([
    ...input.externalUnlockRequestPack.providerEnvKeys
      .filter(item => item.key.includes('RUNTIME') || item.key.includes('OPENCLAW') || item.key.includes('LOBU') || item.key.includes('HERMES') || item.key.includes('CALLBACK') || item.key.includes('BROWSER'))
      .map(item => `Configure ${item.key} server-side`),
    ...p0Requests.filter(item => item.owner === 'runtime-admin').map(item => item.ask),
  ], 8);
  const merchantAsks = unique([
    ...input.merchantAuthorizationPacket.scopes.map(scope => `${scope.label}: ${scope.nextAction}`),
    ...p0Requests.filter(item => item.owner === 'merchant').map(item => item.ask),
  ], 8);
  const dataAsks = unique([
    ...input.keyGapBoard.dataPacket.map(item => `${item.contract}: ${item.proof}`),
    ...input.externalUnlockRequestPack.operatingDataPacket.map(item => `${item.provider}: ${item.evidenceRequired}`),
  ], 8);
  const opsAsks = unique([
    ...input.runnerMissionTimeline.operatorQueue.map(item => item.nextAction),
    ...input.externalUnlockRequestPack.ownerHandoff.filter(item => item.owner === 'ops').map(item => item.firstAction),
  ], 8);

  const packets: RestaurantProviderForwardableSetupDossier['packets'] = [
    packet({
      id: 'runtime-provider',
      title: 'Runtime Provider Setup',
      sendTo: 'Provider engineer',
      objective: 'Make one OpenClaw/Lobu/Hermes-compatible runtime reachable and able to return signed public-proof receipts.',
      asks: runtimeAsks,
      evidenceRequired: ['runtime health ready', 'server-side API key configured without exposing value', 'isolated browser profile configured', 'callback secret configured'],
      acceptanceTests: ['GET /health succeeds', 'one sandbox package returns externalRunId', 'signed external-receipt is accepted', 'no secret echo in response'],
      forbidden,
      firstMessage: 'Please configure one runtime target server-side, then run a single sandbox package and close only through signed external-receipt callback.',
    }),
    packet({
      id: 'merchant-owner',
      title: 'Merchant Authorization Setup',
      sendTo: 'Merchant owner',
      objective: 'Authorize exactly which platforms and actions can be run before any publish, lead, coupon or staff action.',
      asks: merchantAsks,
      evidenceRequired: ['platform account scope', 'allowed actions', 'expiry date', 'revocation owner', 'public proof callback requirement'],
      acceptanceTests: input.merchantAuthorizationPacket.providerHandOff.giveProvider.slice(0, 6),
      forbidden,
      firstMessage: 'Please approve one platform scope, allowed actions, expiry and revocation owner; the runtime will not read private messages or customer data.',
    }),
    packet({
      id: 'data-owner',
      title: 'Operating Data Setup',
      sendTo: 'Data/POS owner',
      objective: 'Provide a no-PII aggregate data contract before any true operating analysis or redemption reconciliation claim.',
      asks: dataAsks,
      evidenceRequired: ['field dictionary', 'aggregate sample', 'export cadence', 'source time window', 'PII exclusion rule'],
      acceptanceTests: ['POS data mode selected', 'field dictionary accepted', 'coupon claims and redemptions are aggregate counts', 'no order-level rows'],
      forbidden,
      firstMessage: 'Please provide only aggregate POS/coupon/member fields and a field dictionary; no raw rows, coupon codes, payment ids or customer identifiers.',
    }),
    packet({
      id: 'ops-lead',
      title: 'Store Ops Launch Setup',
      sendTo: 'Store ops lead',
      objective: 'Own the first live-run queue, blocked gates and receipt closeout so the store knows exactly what is waiting.',
      asks: opsAsks,
      evidenceRequired: ['owner for each blocker', 'manual fallback path', 'accepted public proof or signed receipt', 'next store-manager action'],
      acceptanceTests: ['launch gate reviewed', 'runner mission timeline reviewed', 'receipt closeout status reviewed', 'blocked external claim remains visible'],
      forbidden,
      firstMessage: 'Please review the launch gate and runner timeline; keep the run open until a signed receipt or sanitized aggregate proof is accepted.',
    }),
  ];

  const envTemplate = input.externalUnlockRequestPack.providerEnvKeys.map(item => ({
    key: item.key,
    owner: item.owner,
    requiredFor: item.unlocks,
    configured: input.keyGapBoard.providerKeyPacket.some(keyItem => keyItem.key === item.key && keyItem.configured),
    value: '<server-side-only>' as const,
  }));
  const signoffMatrix = input.externalUnlockRequestPack.signoffChecklist.map(item => ({
    owner: item.owner,
    priority: item.priority,
    title: item.title,
    proofRequired: item.proofRequired,
    status: item.status,
  }));
  const generatedAt = now.toISOString();
  const safetyBoundary = 'Forwardable Setup Dossier is a setup and signoff artifact. It can be sent to Provider engineers, merchant owners, data owners and ops leads, but it never includes secret values, cookies, browser profile files, private messages, customer identifiers, coupon codes, payment ids or raw POS rows, and it never claims live automation without accepted signed receipts.';
  const exportDigest = buildDigest({
    restaurant: input.keyGapBoard.restaurant,
    offer: input.keyGapBoard.offer,
    generatedAt,
    packets,
    envTemplate,
    signoffMatrix,
    safetyBoundary,
  });

  return {
    ok: true,
    payloadShape: 'restaurant-provider-forwardable-setup-dossier-v1',
    generatedAt,
    restaurant: input.keyGapBoard.restaurant,
    offer: input.keyGapBoard.offer,
    summary: {
      packets: packets.length,
      p0Items: p0Requests.length,
      providerEnvKeys: envTemplate.length,
      merchantSignoffs: signoffMatrix.filter(item => item.owner === 'merchant').length,
      dataContracts: signoffMatrix.filter(item => item.owner === 'data-ops').length,
      canStartInternalNow: input.externalUnlockRequestPack.summary.canStartInternally,
      canStartLiveProviderNow: input.providerLiveRunGate.summary.canStartRealProviderNow || input.providerLiveRunGate.summary.canStartSupervisedBrowserNow,
      canClaimExternalAutomation: false,
    },
    packets,
    envTemplate,
    signoffMatrix,
    firstLiveRunContract: {
      launchVerdict: input.providerLiveRunLaunchAttempt.verdict,
      gateVerdict: input.providerLiveRunGate.verdict,
      runnerVerdict: input.runnerMissionTimeline.verdict,
      packageId: input.providerLiveRunGate.selectedRun.packageId,
      callbackAction: input.providerLiveRunGate.selectedRun.callbackAction,
      callbackHeader: input.providerLiveRunGate.selectedRun.callbackHeader,
      acceptedCloseout: input.providerLiveRunGate.firstLiveAction.acceptedResult,
    },
    exportDigest,
    externalRequired: unique([
      ...input.keyGapBoard.firstUnlockOrder,
      ...input.externalUnlockRequestPack.requests.map(item => item.ask),
      ...input.providerLiveRunGate.externalRequired,
      ...input.runnerMissionTimeline.externalRequired,
    ], 20),
    safetyBoundary,
  };
}

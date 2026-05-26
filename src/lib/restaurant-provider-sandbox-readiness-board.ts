import type { RestaurantExternalAccessGuide } from '@/lib/restaurant-external-access-guide';
import type { RestaurantProviderAcceptanceWorkbench } from '@/lib/restaurant-provider-acceptance-workbench';
import type { RestaurantProviderKeyGapBoard } from '@/lib/restaurant-provider-key-gap-board';
import type { RestaurantProviderSandboxContract } from '@/lib/restaurant-provider-sandbox-contract';
import type { RestaurantProviderSandboxSubmitPackage, RestaurantProviderSandboxSubmitWorkbench } from '@/lib/restaurant-provider-sandbox-submit-workbench';

export type RestaurantProviderSandboxReadinessStatus =
  | 'ready-to-submit'
  | 'blocked-provider'
  | 'blocked-data-contract'
  | 'waiting-receipt'
  | 'accepted';

export type RestaurantProviderSandboxReadinessBoard = {
  ok: true;
  payloadShape: 'restaurant-provider-sandbox-readiness-board-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict:
    | 'ready-to-submit-one'
    | 'blocked-provider-setup'
    | 'blocked-data-contract'
    | 'waiting-receipt'
    | 'accepted-closeout-ready';
  summary: {
    capabilities: number;
    readyToSubmit: number;
    blockedProvider: number;
    blockedData: number;
    waitingReceipt: number;
    accepted: number;
    canSubmitSandboxNow: boolean;
    canClaimExternalAutomation: false;
  };
  rows: Array<{
    capabilityId: RestaurantProviderSandboxSubmitPackage['capabilityId'];
    label: string;
    status: RestaurantProviderSandboxReadinessStatus;
    owner: RestaurantProviderSandboxSubmitPackage['recoveryOwner'];
    submitAllowed: boolean;
    selectedPackageId?: string;
    endpointEnv: string;
    callbackRequired: string[];
    evidenceRequired: string[];
    missing: string[];
    nextAction: string;
    stopLine: string;
  }>;
  firstRunnable?: {
    capabilityId: RestaurantProviderSandboxSubmitPackage['capabilityId'];
    packageId: string;
    action: string;
    evidenceRequired: string[];
  };
  ownerQueue: Array<{
    owner: RestaurantProviderSandboxSubmitPackage['recoveryOwner'];
    blocked: number;
    nextAction: string;
    evidenceRequired: string[];
  }>;
  providerScript: string[];
  redactedFields: string[];
  safetyBoundary: string;
};

function clean(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim().replace(/\s+/g, ' ').slice(0, 120) : fallback;
}

function unique(values: string[], limit = 10): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function rowMissing(input: {
  item: RestaurantProviderSandboxSubmitPackage;
  acceptance?: RestaurantProviderAcceptanceWorkbench['capabilityAcceptanceMatrix'][number];
  sandboxContract: RestaurantProviderSandboxContract;
  providerKeyGapBoard?: RestaurantProviderKeyGapBoard;
}): string[] {
  if (input.item.status === 'ready-to-submit' || input.item.status === 'accepted') return [];
  const gap = input.providerKeyGapBoard?.rows.find(row => {
    if (input.item.capabilityId === 'auto-publish-proof') return row.id === 'auto-publish';
    if (input.item.capabilityId === 'auto-lead-acquisition') return row.id === 'auto-lead-acquisition';
    if (input.item.capabilityId === 'auto-coupon-redemption') return row.id === 'auto-coupon-redemption';
    if (input.item.capabilityId === 'true-operating-analysis') return row.id === 'true-operating-analysis';
    return row.id === 'staff-delivery';
  });
  return unique([
    input.item.blockedReason || '',
    ...(input.acceptance?.requiredProviderKeys || []),
    ...(input.acceptance?.merchantGrantRequired || []),
    ...(input.item.status === 'blocked-data-contract' ? input.acceptance?.dataContractRequired || [] : []),
    ...(gap?.externalNeeded || []),
    ...input.sandboxContract.externalRequired,
  ], 8);
}

function verdictFor(summary: RestaurantProviderSandboxReadinessBoard['summary']): RestaurantProviderSandboxReadinessBoard['verdict'] {
  if (summary.accepted > 0) return 'accepted-closeout-ready';
  if (summary.waitingReceipt > 0) return 'waiting-receipt';
  if (summary.readyToSubmit > 0) return 'ready-to-submit-one';
  if (summary.blockedData > 0 && summary.blockedProvider === 0) return 'blocked-data-contract';
  return 'blocked-provider-setup';
}

export function buildRestaurantProviderSandboxReadinessBoard(input: {
  providerSandboxSubmitWorkbench: RestaurantProviderSandboxSubmitWorkbench;
  providerAcceptanceWorkbench: RestaurantProviderAcceptanceWorkbench;
  providerSandboxContract: RestaurantProviderSandboxContract;
  externalAccessGuide: RestaurantExternalAccessGuide;
  providerKeyGapBoard?: RestaurantProviderKeyGapBoard;
  now?: Date;
}): RestaurantProviderSandboxReadinessBoard {
  const now = input.now || new Date();
  const acceptanceById = new Map(input.providerAcceptanceWorkbench.capabilityAcceptanceMatrix.map(item => [item.id, item]));
  const rows = input.providerSandboxSubmitWorkbench.submitPackages.map(item => {
    const acceptance = acceptanceById.get(item.capabilityId);
    return {
      capabilityId: item.capabilityId,
      label: item.capabilityLabel,
      status: item.status,
      owner: item.recoveryOwner,
      submitAllowed: item.status === 'ready-to-submit',
      selectedPackageId: item.selectedPackageId,
      endpointEnv: item.submitEndpointShape.endpointEnv,
      callbackRequired: unique([
        item.callback.action,
        item.callback.header,
        ...input.providerSandboxContract.acceptanceContract.callbackRequires,
      ], 7),
      evidenceRequired: unique([
        ...item.receiptExpectation,
        ...(acceptance?.receiptRequired || []),
      ], 8),
      missing: rowMissing({
        item,
        acceptance,
        sandboxContract: input.providerSandboxContract,
        providerKeyGapBoard: input.providerKeyGapBoard,
      }),
      nextAction: item.nextAction,
      stopLine: item.stopLine,
    };
  });

  const summary = {
    capabilities: rows.length,
    readyToSubmit: rows.filter(row => row.status === 'ready-to-submit').length,
    blockedProvider: rows.filter(row => row.status === 'blocked-provider').length,
    blockedData: rows.filter(row => row.status === 'blocked-data-contract').length,
    waitingReceipt: rows.filter(row => row.status === 'waiting-receipt').length,
    accepted: rows.filter(row => row.status === 'accepted').length,
    canSubmitSandboxNow: rows.some(row => row.submitAllowed),
    canClaimExternalAutomation: false,
  } satisfies RestaurantProviderSandboxReadinessBoard['summary'];

  const firstReady = rows.find(row => row.submitAllowed && row.selectedPackageId);
  const owners = unique(rows.map(row => row.owner), 5) as RestaurantProviderSandboxSubmitPackage['recoveryOwner'][];

  return {
    ok: true,
    payloadShape: 'restaurant-provider-sandbox-readiness-board-v1',
    generatedAt: now.toISOString(),
    restaurant: clean(input.providerAcceptanceWorkbench.restaurant, input.externalAccessGuide.restaurant),
    offer: clean(input.providerAcceptanceWorkbench.offer, input.externalAccessGuide.offer),
    verdict: verdictFor(summary),
    summary,
    rows,
    firstRunnable: firstReady ? {
      capabilityId: firstReady.capabilityId,
      packageId: firstReady.selectedPackageId || '',
      action: firstReady.nextAction,
      evidenceRequired: firstReady.evidenceRequired,
    } : undefined,
    ownerQueue: owners.map(owner => {
      const ownedRows = rows.filter(row => row.owner === owner && row.status !== 'accepted');
      return {
        owner,
        blocked: ownedRows.filter(row => !row.submitAllowed).length,
        nextAction: ownedRows[0]?.nextAction || 'Review accepted receipts and decide the next sandbox lane.',
        evidenceRequired: unique(ownedRows.flatMap(row => row.missing.length ? row.missing : row.evidenceRequired), 8),
      };
    }),
    providerScript: unique([
      `Sandbox verdict: ${verdictFor(summary)}. Submit only rows where submitAllowed=true.`,
      'POST the sanitized execution package to endpointEnv; never include provider keys, cookies or raw browser profile ids.',
      'Return signed receipt fields only: eventId, externalRunId or evidenceUrl or screenshotId, operator summary, signedAt.',
      'Stop on login challenge, captcha, private inbox, customer identifiers, coupon codes, payment ids or raw POS rows.',
      ...input.externalAccessGuide.providerScript,
    ], 8),
    redactedFields: unique([
      ...input.externalAccessGuide.redactedFields,
      'provider API key values',
      'raw browser profile id',
      'private inbox payload',
    ], 12),
    safetyBoundary: 'Provider Sandbox Readiness Board is a decision and acceptance surface only. It may mark a sanitized package ready to submit, but it does not execute browser actions, publish content, contact customers, redeem coupons, read private messages, write POS records or claim production automation before provider health, merchant grants, signed receipts and aggregate data contracts are accepted.',
  };
}

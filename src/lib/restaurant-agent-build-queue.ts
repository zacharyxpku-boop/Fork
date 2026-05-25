import { buildRestaurantActivationGates } from '@/lib/restaurant-agent-activation-gates';
import { buildRestaurantCompetitorAuditReport, type RestaurantCompetitorAuditDimension } from '@/lib/restaurant-agent-competitor-audit';

export type RestaurantBuildQueueLane = 'internal-build' | 'bridge-hardening' | 'external-setup';
export type RestaurantBuildQueueStatus = 'ready-to-build' | 'needs-design-review' | 'waiting-external';

export type RestaurantBuildQueueItem = {
  id: string;
  dimensionId: string;
  title: string;
  lane: RestaurantBuildQueueLane;
  status: RestaurantBuildQueueStatus;
  owner: 'product' | 'engineering' | 'ops' | 'merchant' | 'compliance';
  whyNow: string;
  internalDeliverable: string;
  acceptanceCriteria: string[];
  externalRequired: string[];
  blockedBy: string[];
  sourceEvidence: string[];
  safetyBoundary: string;
};

export type RestaurantBuildQueueReport = {
  ok: true;
  payloadShape: 'restaurant-agent-build-queue-v1';
  queueId: string;
  items: RestaurantBuildQueueItem[];
  summary: {
    total: number;
    readyToBuild: number;
    needsDesignReview: number;
    waitingExternal: number;
    internalBuild: number;
    bridgeHardening: number;
    externalSetup: number;
  };
  nextInternalSprint: RestaurantBuildQueueItem[];
  externalSetupRequests: Array<{
    dimensionId: string;
    request: string;
    unlocks: string[];
  }>;
  audit: {
    sourceBacked: true;
    secretsIncluded: false;
    privateDataIncluded: false;
    fakeExecutionIncluded: false;
  };
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

function laneFor(dimension: RestaurantCompetitorAuditDimension): RestaurantBuildQueueLane {
  if (dimension.status === 'external-required') return 'external-setup';
  if (dimension.status === 'bridge-ready') return 'bridge-hardening';
  return 'internal-build';
}

function statusFor(dimension: RestaurantCompetitorAuditDimension): RestaurantBuildQueueStatus {
  if (dimension.status === 'external-required') return 'waiting-external';
  if (dimension.status === 'bridge-ready') return 'needs-design-review';
  return 'ready-to-build';
}

function ownerFor(dimension: RestaurantCompetitorAuditDimension): RestaurantBuildQueueItem['owner'] {
  if (dimension.id === 'restaurant-platform-data') return 'merchant';
  if (dimension.id === 'secret-proxy-tool-policy') return 'compliance';
  if (dimension.id === 'shared-memory-watchers') return 'ops';
  if (dimension.status === 'bridge-ready') return 'engineering';
  return 'product';
}

function deliverableFor(dimension: RestaurantCompetitorAuditDimension): string {
  const deliverables: Record<string, string> = {
    'multi-tenant-runtime': 'Unify the next restaurant task surfaces around tenant event, run ledger, signed receipt and recovery state.',
    'shared-memory-watchers': 'Generate a watcher-driven next-action queue from accepted receipts, activation gates and business signals.',
    'browser-execution': 'Create a browser runbook package with ordered steps, allowed domains, expected receipt fields and failure stops.',
    'secret-proxy-tool-policy': 'Attach tool-policy decisions to execution packages, callbacks and ops-console rows.',
    'execution-receipts': 'Use evidence score and receipt status to drive operating analysis and manager follow-up.',
    'restaurant-platform-data': 'Prepare external setup requests for merchant platform auth, POS dictionary and governed data imports.',
  };

  return deliverables[dimension.id] || dimension.internalNext;
}

function acceptanceFor(dimension: RestaurantCompetitorAuditDimension): string[] {
  const common = [
    'Has API response shape and focused unit tests.',
    'Appears in /factory?variant=friend_trial without console errors.',
    'Does not expose API keys, cookies, tokens, private messages, customer identifiers or raw POS rows.',
  ];
  const specific: Record<string, string[]> = {
    'multi-tenant-runtime': ['Every queued restaurant task includes tenantId, eventId, owner and next action.'],
    'shared-memory-watchers': ['Accepted receipts or POS imports create deterministic watcher followups.'],
    'browser-execution': ['Runbook includes preflight, action sequence, evidence capture and stop conditions.'],
    'secret-proxy-tool-policy': ['Forbidden actions remain forbidden even if runtime credentials exist.'],
    'execution-receipts': ['Rejected receipts cannot unlock published, acquired, redeemed or analyzed states.'],
    'restaurant-platform-data': ['External setup requests clearly state what only the merchant or runtime can provide.'],
  };

  return [...(specific[dimension.id] || []), ...common];
}

function externalRequirements(dimension: RestaurantCompetitorAuditDimension): string[] {
  return dimension.externalRequired
    .split(/[;,，、]/g)
    .map(item => item.replace(/[.。；;]/g, '').trim())
    .filter(Boolean);
}

function blockedByFor(dimension: RestaurantCompetitorAuditDimension): string[] {
  if (dimension.status !== 'external-required') return [];
  const activation = buildRestaurantActivationGates();
  return activation.gates
    .filter(gate => gate.status === 'blocked' || gate.status === 'forbidden')
    .map(gate => `${gate.name}:${gate.status}`);
}

function queueItem(dimension: RestaurantCompetitorAuditDimension, index: number): RestaurantBuildQueueItem {
  const lane = laneFor(dimension);

  return {
    id: `restaurant-build-${stableId([dimension.id, String(index), dimension.status])}`,
    dimensionId: dimension.id,
    title: dimension.name,
    lane,
    status: statusFor(dimension),
    owner: ownerFor(dimension),
    whyNow: dimension.restaurantImpact,
    internalDeliverable: deliverableFor(dimension),
    acceptanceCriteria: acceptanceFor(dimension),
    externalRequired: lane === 'external-setup' ? externalRequirements(dimension) : [],
    blockedBy: blockedByFor(dimension),
    sourceEvidence: dimension.currentEvidence,
    safetyBoundary: dimension.safetyBoundary,
  };
}

export function buildRestaurantBuildQueue(): RestaurantBuildQueueReport {
  const audit = buildRestaurantCompetitorAuditReport();
  const dimensionById = new Map(audit.dimensions.map(dimension => [dimension.id, dimension]));
  const items = audit.nextBuildOrder
    .map((order, index) => {
      const dimension = dimensionById.get(order.dimensionId);
      return dimension ? queueItem(dimension, index + 1) : undefined;
    })
    .filter(Boolean) as RestaurantBuildQueueItem[];

  return {
    ok: true,
    payloadShape: 'restaurant-agent-build-queue-v1',
    queueId: `restaurant-build-queue-${stableId(items.map(item => `${item.dimensionId}:${item.status}`))}`,
    items,
    summary: {
      total: items.length,
      readyToBuild: items.filter(item => item.status === 'ready-to-build').length,
      needsDesignReview: items.filter(item => item.status === 'needs-design-review').length,
      waitingExternal: items.filter(item => item.status === 'waiting-external').length,
      internalBuild: items.filter(item => item.lane === 'internal-build').length,
      bridgeHardening: items.filter(item => item.lane === 'bridge-hardening').length,
      externalSetup: items.filter(item => item.lane === 'external-setup').length,
    },
    nextInternalSprint: items.filter(item => item.status !== 'waiting-external').slice(0, 3),
    externalSetupRequests: items
      .filter(item => item.status === 'waiting-external')
      .map(item => ({
        dimensionId: item.dimensionId,
        request: item.externalRequired.join(' / ') || 'Merchant authorization or runtime environment required.',
        unlocks: item.acceptanceCriteria.slice(0, 2),
      })),
    audit: {
      sourceBacked: true,
      secretsIncluded: false,
      privateDataIncluded: false,
      fakeExecutionIncluded: false,
    },
    safetyBoundary: 'The build queue is an internal planning and governance object. Waiting-external items do not imply real platform execution, POS access, merchant login, auto-acquisition or auto-redemption.',
  };
}

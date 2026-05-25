import { RESTAURANT_COMPETITOR_CAPABILITIES, type RestaurantCompetitorCapabilityStatus } from '@/lib/restaurant-agent-capabilities';
import { RESTAURANT_AGENT_CONNECTORS } from '@/lib/restaurant-agent-runtime';

export type RestaurantCompetitorAuditSource = {
  id: 'abacus-claw' | 'lobu' | 'openclaw' | 'hermes';
  name: string;
  url: string;
  observedCapabilities: string[];
  relevanceToRestaurant: string;
  safetyCaveat: string;
};

export type RestaurantCompetitorAuditDimension = {
  id: string;
  name: string;
  sourceIds: RestaurantCompetitorAuditSource['id'][];
  targetState: string;
  currentEvidence: string[];
  status: RestaurantCompetitorCapabilityStatus;
  internalNext: string;
  externalRequired: string;
  restaurantImpact: string;
  safetyBoundary: string;
};

export type RestaurantCompetitorAuditReport = {
  ok: true;
  payloadShape: 'restaurant-agent-competitor-audit-v1';
  sources: RestaurantCompetitorAuditSource[];
  dimensions: RestaurantCompetitorAuditDimension[];
  summary: {
    total: number;
    internalReady: number;
    bridgeReady: number;
    externalRequired: number;
    internalConnectors: number;
    blockedExternalConnectors: number;
  };
  nextBuildOrder: Array<{
    priority: number;
    dimensionId: string;
    reason: string;
    buildableNow: boolean;
  }>;
  audit: {
    publicSourceBacked: true;
    secretsIncluded: false;
    privateDataIncluded: false;
    fakeExecutionIncluded: false;
  };
  safetyBoundary: string;
};

const SOURCES: RestaurantCompetitorAuditSource[] = [
  {
    id: 'abacus-claw',
    name: 'Abacus Claw',
    url: 'https://claw.abacus.ai/',
    observedCapabilities: [
      'always-on personal AI agent',
      'chat-first workflow execution',
      'long-term memory',
      'scheduled browser-based tasks',
      'content repurposing and follow-up workflows',
      'tool and app integrations',
    ],
    relevanceToRestaurant: 'Restaurant parity needs the same always-on pattern, but scoped to store shifts: morning plan, lunch/dinner execution, public proof, lead follow-up, redemption closeout and memory refresh.',
    safetyCaveat: 'Always-on execution must be tenant-isolated and receipt-led; background runs cannot write untrusted external content into durable memory without provenance and review.',
  },
  {
    id: 'lobu',
    name: 'Lobu',
    url: 'https://lobu.ai/',
    observedCapabilities: [
      'multi-user agent backend',
      'isolated agent workspace',
      'gateway-managed workers',
      'OAuth and connected sources',
      'shared memory',
      'watchers',
      'secret proxy so agents do not see real keys',
    ],
    relevanceToRestaurant: 'Restaurant parity needs this shape for multi-store accounts, platform grants, POS data contracts, signed receipts and proactive follow-up.',
    safetyCaveat: 'Workers must not receive raw platform tokens; every store needs tenant isolation, audit logs and revocation paths.',
  },
  {
    id: 'openclaw',
    name: 'OpenClaw',
    url: 'https://docs.openclaw.ai/browser',
    observedCapabilities: [
      'browser CLI and gateway method',
      'agent browser tool',
      'browser profile snapshots',
      'persistent local memory',
      'typed tools and skills',
    ],
    relevanceToRestaurant: 'Auto-publish and proof capture need isolated browser sessions, not UI copy that pretends a platform action happened.',
    safetyCaveat: 'Merchant accounts must run only inside explicitly authorized profiles; do not bypass login, captcha or platform review.',
  },
  {
    id: 'hermes',
    name: 'Hermes / browser-use',
    url: 'https://hermes-agent.nousresearch.com/docs/user-guide/features/browser',
    observedCapabilities: [
      'browser automation backend choices',
      'local Chromium-family CDP attachment',
      'cloud browser option',
      'workflow-level browser execution',
    ],
    relevanceToRestaurant: 'Hermes-style browser execution can carry publishing, screenshots, public page verification and receipt callbacks beyond manual checklists.',
    safetyCaveat: 'CDP or cloud browsers should receive governed actions only, and must not read private messages, backend details or personal data.',
  },
];

function hasCapability(id: string): boolean {
  return RESTAURANT_COMPETITOR_CAPABILITIES.some(item => item.id === id);
}

function connectorEvidence(ids: string[]): string[] {
  return ids
    .map(id => RESTAURANT_AGENT_CONNECTORS.find(connector => connector.id === id))
    .filter(Boolean)
    .map(connector => `${connector!.id}:${connector!.status}`);
}

const DIMENSION_DEFINITIONS: Array<Omit<RestaurantCompetitorAuditDimension, 'status' | 'currentEvidence'> & {
  capabilityIds: string[];
  connectorIds: string[];
  externalOnly?: boolean;
}> = [
  {
    id: 'multi-tenant-runtime',
    name: 'Multi-tenant agent runtime',
    sourceIds: ['abacus-claw', 'lobu'],
    capabilityIds: ['tenant-event-gateway'],
    connectorIds: ['lobu-local-runtime', 'agent-task-queue', 'local-persistent-ledger'],
    targetState: 'Each store has isolated tenant events, worker payloads, ledgers, audit trails and failure recovery.',
    internalNext: 'Continue routing every restaurant action through tenant events and signed receipts.',
    externalRequired: 'Production gateway, tenant-isolation policy, deployment environment and secret proxy.',
    restaurantImpact: 'Multi-store campaigns can run without mixing accounts, receipts or POS data.',
    safetyBoundary: 'Do not write platform tokens, cookies or customer identity into worker payloads.',
  },
  {
    id: 'shared-memory-watchers',
    name: 'Shared memory and proactive watchers',
    sourceIds: ['abacus-claw', 'lobu', 'openclaw'],
    capabilityIds: ['persistent-memory-graph', 'watcher-entity-extraction', 'watcher-policy-orchestrator'],
    connectorIds: ['restaurant-memory', 'watcher-policy-orchestrator'],
    targetState: 'Publish receipts, redemption imports and lead aggregates update store memory and generate next actions automatically.',
    internalNext: 'Merge activation gates, business signals and watcher lanes into one execution timeline.',
    externalRequired: 'Real webhooks, POS export/API, platform receipts and a durable memory backend.',
    restaurantImpact: 'Store managers see next operating moves instead of scattered content drafts.',
    safetyBoundary: 'Keep only aggregate signals and business summaries; do not store private-message bodies or personal contact details.',
  },
  {
    id: 'browser-execution',
    name: 'Persistent browser execution and profile governance',
    sourceIds: ['openclaw', 'hermes'],
    capabilityIds: ['isolated-browser-session', 'persistent-browser-session-registry', 'browser-workflow-runner'],
    connectorIds: ['browser-session-manifest', 'browser-session-registry', 'local-browser-plan'],
    targetState: 'Browser sessions can be created, renewed, expired, blocked and return screenshots, links or external run ids.',
    internalNext: 'Add more pre-run runbooks and step templates so external browser runners receive deterministic action sequences.',
    externalRequired: 'OpenClaw/Hermes runtime, isolated profile, merchant login authorization and callback secret.',
    restaurantImpact: 'Dianping, Xiaohongshu, Douyin and WeChat community publishing can move from manual checklists to governed external execution.',
    safetyBoundary: 'Do not bypass login, captcha or platform review; without authorization, output drafts and steps only.',
  },
  {
    id: 'secret-proxy-tool-policy',
    name: 'Secret proxy and tool permission policy',
    sourceIds: ['lobu', 'openclaw'],
    capabilityIds: ['tool-policy-secret-proxy', 'deterministic-tool-policy-evaluator'],
    connectorIds: ['deterministic-tool-policy-evaluator', 'runtime-connector-probe'],
    targetState: 'Every action is evaluated as allow, block or forbidden; workers receive only slot references and allowlists.',
    internalNext: 'Write tool-policy decisions into every execution package and callback audit.',
    externalRequired: 'Production secret proxy, OAuth grant store, domain policy and runtime-side enforcement.',
    restaurantImpact: 'Customers can trust automation will not overread private messages, post without approval or misuse POS data.',
    safetyBoundary: 'Client, logs, callbacks and reports must never display API keys, tokens, cookies, passwords or verification codes.',
  },
  {
    id: 'execution-receipts',
    name: 'Execution receipts, retry and evidence acceptance',
    sourceIds: ['abacus-claw', 'lobu', 'hermes'],
    capabilityIds: ['execution-receipts-retry', 'signed-callback-simulator', 'evidence-scored-receipts'],
    connectorIds: ['signed-runtime-callback', 'signed-callback-simulator', 'receipt-evidence-validator', 'recovery-orchestrator', 'run-health-console'],
    targetState: 'Every external action has an externalRunId, signature, screenshot/link, acceptance score, failure reason and next action.',
    internalNext: 'Use evidence acceptance results to drive operating analysis and manager follow-up.',
    externalRequired: 'Real external runtime signed callbacks, platform links/screenshots and POS/redemption receipts.',
    restaurantImpact: 'Avoid saying something was published, acquired or redeemed without evidence, and avoid treating sample receipts as real operating results.',
    safetyBoundary: 'Without receipt, do not display published, acquired, redeemed or analysis-complete states.',
  },
  {
    id: 'restaurant-platform-data',
    name: 'Restaurant platform and POS data loop',
    sourceIds: ['abacus-claw', 'lobu'],
    capabilityIds: ['merchant-platform-connectors', 'business-signal-loop', 'pos-import-schema-validator', 'restaurant-activation-gates'],
    connectorIds: ['dianping-meituan', 'xiaohongshu-douyin-wechat', 'pos-redemption', 'business-signal-aggregator', 'pos-import-schema-validator', 'restaurant-activation-gates'],
    targetState: 'Publishing, reservations, coupon claims, inquiries, redemptions, ticket size, inventory and review all become one operating signal loop.',
    internalNext: 'Keep strengthening sanitized imports, activation gates and operating action recommendations.',
    externalRequired: 'Merchant account authorization, platform API/export, POS field dictionary, redemption source and data-use contract.',
    restaurantImpact: 'This is the paid restaurant capability: automatic acquisition, redemption and operating analysis only when real data is connected.',
    safetyBoundary: 'Without authorization, do not scrape backends, read private messages, write redemptions or invent growth numbers.',
    externalOnly: true,
  },
];

function statusFor(definition: typeof DIMENSION_DEFINITIONS[number]): RestaurantCompetitorCapabilityStatus {
  const capabilitiesReady = definition.capabilityIds.every(hasCapability);
  const connectors = definition.connectorIds
    .map(id => RESTAURANT_AGENT_CONNECTORS.find(connector => connector.id === id))
    .filter(Boolean);
  const allConnectorsRun = connectors.length > 0 && connectors.every(connector => connector!.canRunNow);
  const anyConnectorRuns = connectors.some(connector => connector!.canRunNow);

  if (definition.externalOnly && !allConnectorsRun) return 'external-required';
  if (capabilitiesReady && allConnectorsRun) return 'internal-ready';
  if (capabilitiesReady || anyConnectorRuns) return 'bridge-ready';
  return 'external-required';
}

export function buildRestaurantCompetitorAuditReport(): RestaurantCompetitorAuditReport {
  const dimensions = DIMENSION_DEFINITIONS.map(definition => {
    const status = statusFor(definition);

    return {
      id: definition.id,
      name: definition.name,
      sourceIds: definition.sourceIds,
      targetState: definition.targetState,
      currentEvidence: [
        ...definition.capabilityIds.filter(hasCapability).map(id => `capability:${id}`),
        ...connectorEvidence(definition.connectorIds),
      ],
      status,
      internalNext: definition.internalNext,
      externalRequired: definition.externalRequired,
      restaurantImpact: definition.restaurantImpact,
      safetyBoundary: definition.safetyBoundary,
    };
  });

  return {
    ok: true,
    payloadShape: 'restaurant-agent-competitor-audit-v1',
    sources: SOURCES,
    dimensions,
    summary: {
      total: dimensions.length,
      internalReady: dimensions.filter(item => item.status === 'internal-ready').length,
      bridgeReady: dimensions.filter(item => item.status === 'bridge-ready').length,
      externalRequired: dimensions.filter(item => item.status === 'external-required').length,
      internalConnectors: RESTAURANT_AGENT_CONNECTORS.filter(connector => connector.canRunNow).length,
      blockedExternalConnectors: RESTAURANT_AGENT_CONNECTORS.filter(connector => !connector.canRunNow).length,
    },
    nextBuildOrder: dimensions
      .map((dimension, index) => ({
        priority: index + 1,
        dimensionId: dimension.id,
        reason: dimension.status === 'external-required'
          ? dimension.externalRequired
          : dimension.internalNext,
        buildableNow: dimension.status !== 'external-required',
      }))
      .sort((left, right) => Number(right.buildableNow) - Number(left.buildableNow) || left.priority - right.priority),
    audit: {
      publicSourceBacked: true,
      secretsIncluded: false,
      privateDataIncluded: false,
      fakeExecutionIncluded: false,
    },
    safetyBoundary: 'This report maps public competitor patterns to current product evidence. It does not claim real platform execution, merchant login, POS access, private-message reading or growth results.',
  };
}

import { RESTAURANT_COMPETITOR_CAPABILITIES, type RestaurantCompetitorCapabilityStatus } from '@/lib/restaurant-agent-capabilities';
import { RESTAURANT_AGENT_CONNECTORS } from '@/lib/restaurant-agent-runtime';

export type RestaurantCompetitorAuditSource = {
  id: 'lobu' | 'openclaw' | 'hermes';
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
    relevanceToRestaurant: '餐饮版需要用这套形态承载多门店、多平台账号、POS 数据合同、回执和主动跟进。',
    safetyCaveat: 'worker 不应拿到原始平台 token；每个门店必须有租户隔离、审计和撤销路径。',
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
    relevanceToRestaurant: '餐饮版自动发布和回执截图需要隔离浏览器 session，而不是让页面假装已经代发。',
    safetyCaveat: '真实商家账号必须在明确授权的 profile 内运行；不能绕过验证码或平台审核。',
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
    relevanceToRestaurant: '可作为 OpenClaw 之外的浏览器执行器选择，承接发布、截图、公开页面核验和回执写回。',
    safetyCaveat: 'CDP 或云浏览器只应接收受控动作，不应读取私信原文、后台明细或个人数据。',
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
    name: '多租户 Agent Runtime',
    sourceIds: ['lobu'],
    capabilityIds: ['tenant-event-gateway'],
    connectorIds: ['lobu-local-runtime', 'agent-task-queue', 'local-persistent-ledger'],
    targetState: '每个门店有独立 tenant event、worker payload、账本、审计和失败恢复。',
    internalNext: '继续把所有餐饮动作统一落到 tenant event 和 signed receipt。',
    externalRequired: '正式 Lobu gateway、租户隔离策略、部署环境和 secret proxy。',
    restaurantImpact: '多门店同时跑活动时，不会串账号、串回执或串 POS 数据。',
    safetyBoundary: '不把平台 token、cookie、顾客身份写进 worker payload。',
  },
  {
    id: 'shared-memory-watchers',
    name: '共享记忆与 Watcher 主动跟进',
    sourceIds: ['lobu', 'openclaw'],
    capabilityIds: ['persistent-memory-graph', 'watcher-entity-extraction', 'watcher-policy-orchestrator'],
    connectorIds: ['restaurant-memory', 'watcher-policy-orchestrator'],
    targetState: '发布回执、核销导入、线索聚合后自动更新门店记忆并生成下一步动作。',
    internalNext: '把 activation gates、business signals 和 watcher lanes 继续合并到同一条 timeline。',
    externalRequired: '真实 webhook、POS 导出/API、平台回执和长期 memory backend。',
    restaurantImpact: '店长看到的是下一步经营动作，不是散落的内容草稿。',
    safetyBoundary: '只保留聚合信号和业务摘要，不保存私信原文或个人联系方式。',
  },
  {
    id: 'browser-execution',
    name: '常驻浏览器执行与 Profile 治理',
    sourceIds: ['openclaw', 'hermes'],
    capabilityIds: ['isolated-browser-session', 'persistent-browser-session-registry', 'browser-workflow-runner'],
    connectorIds: ['browser-session-manifest', 'browser-session-registry', 'local-browser-plan'],
    targetState: '浏览器 session 可创建、续约、过期、阻断并带回截图/链接/外部 runId。',
    internalNext: '增加执行前 runbook 和逐步脚本模板，让外部 browser runner 拿到更确定的动作序列。',
    externalRequired: 'OpenClaw/Hermes runtime、隔离 profile、商家登录授权和 callback secret。',
    restaurantImpact: '点评、小红书、抖音、微信社群发布可以从“手工清单”升级到受控外部执行。',
    safetyBoundary: '不绕过登录、验证码或平台审核；未授权时只输出草稿和步骤。',
  },
  {
    id: 'secret-proxy-tool-policy',
    name: 'Secret Proxy 与工具权限',
    sourceIds: ['lobu', 'openclaw'],
    capabilityIds: ['tool-policy-secret-proxy', 'deterministic-tool-policy-evaluator'],
    connectorIds: ['deterministic-tool-policy-evaluator', 'runtime-connector-probe'],
    targetState: '每个动作都先经过 allow/block/forbidden 判定，worker 只拿到 slot 和白名单。',
    internalNext: '把 tool-policy 决策写进每个 execution package 和 callback audit。',
    externalRequired: '正式 secret proxy、OAuth grant store、domain policy 和 runtime-side enforcement。',
    restaurantImpact: '客户能相信系统不会因为自动化而越权读私信、乱发内容或误碰 POS。',
    safetyBoundary: '前端、日志、回执和报告不展示 API key、token、cookie、密码或验证码。',
  },
  {
    id: 'execution-receipts',
    name: '执行回执、重试与证据验收',
    sourceIds: ['lobu', 'hermes'],
    capabilityIds: ['execution-receipts-retry', 'signed-callback-simulator', 'evidence-scored-receipts'],
    connectorIds: ['signed-runtime-callback', 'signed-callback-simulator', 'receipt-evidence-validator', 'recovery-orchestrator', 'run-health-console'],
    targetState: '任何外部动作都必须有 externalRunId、签名、截图/链接、验收分数、失败原因和下一步。',
    internalNext: '将证据验收结果进一步驱动 operating-analysis 和 manager follow-up。',
    externalRequired: '真实外部 runtime signed callback、平台链接/截图和 POS/核销回执。',
    restaurantImpact: '避免“说发布了但没有证据”，也避免把样例回执当真实经营结果。',
    safetyBoundary: '无回执不显示已发布、已获客、已核销或已分析完成。',
  },
  {
    id: 'restaurant-platform-data',
    name: '餐饮平台与 POS 数据闭环',
    sourceIds: ['lobu'],
    capabilityIds: ['merchant-platform-connectors', 'business-signal-loop', 'pos-import-schema-validator', 'restaurant-activation-gates'],
    connectorIds: ['dianping-meituan', 'xiaohongshu-douyin-wechat', 'pos-redemption', 'business-signal-aggregator', 'pos-import-schema-validator', 'restaurant-activation-gates'],
    targetState: '平台发布、预约/领券/咨询、核销、客单、库存和复盘进入同一套经营信号。',
    internalNext: '继续强化脱敏导入、能力激活门禁和经营动作建议。',
    externalRequired: '商家账号授权、平台 API/导出、POS 字段字典、核销来源和数据使用合同。',
    restaurantImpact: '这才是餐饮客户真正愿意付费的自动获客、核销和经营分析能力。',
    safetyBoundary: '没有授权不抓后台、不读私信、不写核销、不编造增长数字。',
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

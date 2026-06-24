export type RestaurantCompetitorCapabilityStatus = 'internal-ready' | 'bridge-ready' | 'external-required';

export type RestaurantCompetitorCapability = {
  id: string;
  name: string;
  competitorPattern: 'Lobu' | 'OpenClaw' | 'Hermes' | 'Restaurant SaaS';
  status: RestaurantCompetitorCapabilityStatus;
  productMeaning: string;
  internalImplementation: string;
  missingExternal: string;
  safetyBoundary: string;
};

export type RestaurantAgentExecutionSession = {
  sessionId: string;
  browserProfile: {
    mode: 'isolated-agent-browser' | 'signed-in-user-browser';
    defaultProfile: string;
    canRunNow: boolean;
    approvalRequired: string;
  };
  watchers: Array<{
    event: string;
    derives: string;
    nextAction: string;
  }>;
  toolPolicy: Array<{
    tool: string;
    allowed: boolean;
    reason: string;
  }>;
  receiptSchema: string[];
  recoveryLadder: string[];
};

export type RestaurantAgentCapabilityPlan = {
  capabilities: RestaurantCompetitorCapability[];
  session: RestaurantAgentExecutionSession;
  summary: {
    total: number;
    internalReady: number;
    bridgeReady: number;
    externalRequired: number;
  };
};

export const RESTAURANT_COMPETITOR_CAPABILITIES: RestaurantCompetitorCapability[] = [
  {
    id: 'tenant-event-gateway',
    name: '多门店事件网关',
    competitorPattern: 'Lobu',
    status: 'internal-ready',
    productMeaning: '预约、券领取、发布回执、核销和差评都先变成同一类门店事件。',
    internalImplementation: 'Lobu-compatible local dispatch 已生成 tenant event、worker payload、memory writes 和 audit log。',
    missingExternal: '外部 Lobu gateway URL、API key、租户隔离策略。',
    safetyBoundary: '试用态只写业务事件摘要，不保存手机号、微信号、私信原文或顾客身份。',
  },
  {
    id: 'persistent-memory-graph',
    name: '门店长期记忆图谱',
    competitorPattern: 'Lobu',
    status: 'internal-ready',
    productMeaning: '系统记住门店、菜品、活动、禁用表达、负责人和复盘结论。',
    internalImplementation: 'Restaurant / Offer / LeadSignal 记忆规则、dispatch memoryWrites 和本地 JSONL 持久账本已落地。',
    missingExternal: 'Postgres/PGlite 或 Lobu memory backend，用于跨会话、跨门店持久化。',
    safetyBoundary: '只保留聚合线索和来源链接，不保存可识别个人身份的信息。',
  },
  {
    id: 'watcher-entity-extraction',
    name: 'Watcher 主动跟进',
    competitorPattern: 'Lobu',
    status: 'internal-ready',
    productMeaning: '有新回执或核销数据时，自动判断下一步是发布、追问、复盘还是升级人工。',
    internalImplementation: '执行会话内置 watcher：发布回执、核销导入、差评/私信摘要三类事件。',
    missingExternal: '真实平台 webhook、POS 导出任务或 Lobu connector stream。',
    safetyBoundary: 'Watcher 只处理摘要和授权导入，不能抓取未授权后台。',
  },
  {
    id: 'isolated-browser-session',
    name: '常驻隔离浏览器',
    competitorPattern: 'OpenClaw',
    status: 'bridge-ready',
    productMeaning: 'Agent 有自己的浏览器 profile，可打开页面、截图、读回执，不污染个人浏览器。',
    internalImplementation: '已定义 isolated-agent-browser session、证据字段、OpenClaw/Hermes bridge payload。',
    missingExternal: 'OpenClaw/Hermes 通道地址、浏览器环境、商家账号登录和用户批准。',
    safetyBoundary: '默认隔离 profile；接真实登录态必须用户在场批准，不绕过验证码。',
  },
  {
    id: 'persistent-browser-session-registry',
    name: '常驻浏览器会话治理',
    competitorPattern: 'OpenClaw',
    status: 'internal-ready',
    productMeaning: '客户需要知道哪个浏览器会话能继续跑、哪个已过期、哪个缺 profile/runtime/callback，而不是每次重新生成一张计划。',
    internalImplementation: 'browser-session registry 已记录租约、心跳、ready/blocked/expired、allowed tools 和恢复动作，并持久化到本地账本。',
    missingExternal: '真实 OpenClaw/Hermes session heartbeat、CDP/browser profile 和商家登录授权。',
    safetyBoundary: 'registry 不保存 cookie、token、验证码、密码、私信原文或平台后台数据。',
  },
  {
    id: 'browser-workflow-runner',
    name: '浏览器工作流执行器',
    competitorPattern: 'Hermes',
    status: 'bridge-ready',
    productMeaning: '把“发点评/小红书/抖音/社群”拆成可回放步骤和截图证明。',
    internalImplementation: 'runtime bridge 可把同一份 payload 转给 Hermes/OpenClaw。',
    missingExternal: 'Browser-use/Hermes 运行时、CDP/Browserbase/本地 profile。',
    safetyBoundary: '未授权前只生成任务和检查清单，不代发、不读私信。',
  },
  {
    id: 'browser-runbook-package',
    name: 'Browser runbook package',
    competitorPattern: 'OpenClaw',
    status: 'internal-ready',
    productMeaning: 'The product can hand an external browser runner a replayable, evidence-first browser workflow instead of a vague task note.',
    internalImplementation: 'browser-runbook API emits preflight, navigate, inspect, capture, extract, signed callback and stop steps with allowlisted domains and evidence schema.',
    missingExternal: '真实的 OpenClaw/Hermes 通道地址/账号、隔离浏览器环境、回执密钥和店长批准的目标链接。',
    safetyBoundary: 'The package does not include secrets, raw browser profile, private-message text, POS rows or fake execution; login, captcha, unapproved publish and private data stop the run.',
  },
  {
    id: 'browser-runner-callback-contract',
    name: 'Browser runner callback contract',
    competitorPattern: 'Hermes',
    status: 'internal-ready',
    productMeaning: 'External browser execution is not useful unless every step, blocker and final receipt has a governed return path into health, watcher and recovery.',
    internalImplementation: 'browser-runner-contract API defines event rules, step rules, idempotency, retry budget, stop/escalation boundaries and final signed receipt requirements.',
    missingExternal: 'Real OpenClaw/Hermes runner callbacks, runtime URL/key, isolated browser profile, callback secret and merchant-approved target URL.',
    safetyBoundary: 'The contract governs callbacks only; it does not log in, bypass captcha, auto-publish, read private messages, pull POS rows, write redemptions or fabricate completion.',
  },
  {
    id: 'browser-runner-event-ledger',
    name: 'Browser runner event ledger',
    competitorPattern: 'Hermes',
    status: 'internal-ready',
    productMeaning: 'A competitor-grade runner cannot be a black box; every browser step needs sanitized events, blocker state, retry policy and stale-run escalation.',
    internalImplementation: 'browser-runner-event API stores sanitized step events and browser-runner-event-health summarizes active/completed/stale runs and operator queue.',
    missingExternal: 'Real OpenClaw/Hermes runner step callbacks and a deployed callback URL.',
    safetyBoundary: 'The ledger rejects private/sensitive payloads and never stores cookies, tokens, raw browser profile values, private-message raw text, customer identifiers or POS rows.',
  },
  {
    id: 'tool-policy-secret-proxy',
    name: '工具权限与 Secret Proxy',
    competitorPattern: 'Lobu',
    status: 'bridge-ready',
    productMeaning: 'Worker 只拿占位符和白名单工具，真实 token 由 gateway 换出。',
    internalImplementation: 'bridge 只在 server 读取 env key，响应体不返回密钥，payload 保留 blockedActions。',
    missingExternal: '正式 secret proxy、domain policy、platform grant store。',
    safetyBoundary: '前端、报告、截图、审计日志都不出现 API key/token/cookie。',
  },
  {
    id: 'runtime-setup-contract',
    name: 'Runtime setup contract',
    competitorPattern: 'Lobu',
    status: 'internal-ready',
    productMeaning: 'Before claiming auto-publish, auto-acquisition, redemption or operating analytics, the product shows the exact runtime, profile, callback, merchant authorization and POS gates.',
    internalImplementation: 'runtime-setup-contract returns setup tracks, owners, unlocks, missing impacts, blocked capabilities and a competitor source map.',
    missingExternal: 'Real runtime URL/key, isolated browser profile, merchant platform authorization, POS field dictionary and data mode.',
    safetyBoundary: 'The contract exposes configured/missing only; no API key, token, cookie, browser profile raw value, private-message raw text, POS row or customer identifier is returned.',
  },
  {
    id: 'merchant-grant-checklist-wizard',
    name: '商家授权清单向导',
    competitorPattern: 'Restaurant SaaS',
    status: 'internal-ready',
    productMeaning: '客户要知道为什么还不能执行外部发布、承接线索、写核销或做真实经营分析；清单把外部能力拆成商家、运营、技术、合规可补的步骤。',
    internalImplementation: 'grant-checklist API 已输出 checklist sections、step status、unlock capabilities、blocked reasons、evidence requirements and audit-safe summary.',
    missingExternal: '真实商家账号授权、runtime URL/key、隔离浏览器 profile、callback secret、POS 字段字典和核销来源。',
    safetyBoundary: '清单只显示缺口和证据要求，不登录、不绕过验证码、不代发、不读私信、不保存 POS 原始行或顾客身份。',
  },
  {
    id: 'restaurant-activation-gates',
    name: '经营能力激活门禁',
    competitorPattern: 'Restaurant SaaS',
    status: 'internal-ready',
    productMeaning: '把客户最在意的发布执行、线索承接、核销、真实经营分析变成可解释的 ready/blocked/forbidden，而不是含糊承诺。',
    internalImplementation: 'activation-gates API 已基于 grant checklist 输出每项能力的内部可先准备动作、外部必补条件、证据要求和安全边界。',
    missingExternal: '真实平台授权、发布回执、线索聚合、POS/API/CSV 合同、runtime/browser/callback。',
    safetyBoundary: '不编造增长结果，不把草稿或样例数据当真实经营；私信原文读取永久 forbidden。',
  },
  {
    id: 'competitor-capability-audit',
    name: '竞品能力审计',
    competitorPattern: 'Restaurant SaaS',
    status: 'internal-ready',
    productMeaning: '把“要有竞品所有功能”转成源头可追溯的能力维度、当前证据、缺口和下一轮构建顺序。',
    internalImplementation: 'competitor-audit API 已输出 Lobu/OpenClaw/Hermes sources、target dimensions、current evidence、status summary and next build order.',
    missingExternal: '外部 runtime、浏览器 profile、商家平台授权、POS/API/CSV 合同和真实回执。',
    safetyBoundary: '审计不等于真实外部执行；没有授权时不声称已发布、获客、核销或经营分析。',
  },
  {
    id: 'agent-build-queue',
    name: 'Agent 构建队列',
    competitorPattern: 'Lobu',
    status: 'internal-ready',
    productMeaning: '竞品能力差距必须变成持续执行的队列，否则只能停留在评估；队列让每轮知道该补哪个内部能力、哪个外部条件必须等用户。',
    internalImplementation: 'build-queue API 已把 competitor audit 的 nextBuildOrder 转成 backlog items、lane、owner、acceptance criteria、external setup requests and internal sprint.',
    missingExternal: 'waiting-external 项仍需要真实 runtime、平台授权、POS 合同和商家账号。',
    safetyBoundary: '队列不把 external-required 项包装成已完成，也不输出密钥、私信、顾客身份或 POS 明细。',
  },
  {
    id: 'deterministic-tool-policy-evaluator',
    name: '动作级工具权限评估器',
    competitorPattern: 'Lobu',
    status: 'internal-ready',
    productMeaning: '把“能不能执行发布、能不能抓回执、能不能拉 POS、能不能读私信”变成可审计的动作级决策，而不是页面文案承诺。',
    internalImplementation: 'tool-policy API 已按 grant manifest、browser session、runtime secret slot 和永久禁区输出 internal-ready/external-ready/blocked/forbidden。',
    missingExternal: '正式 secret proxy、platform grant store、平台域名白名单和外部 worker 执行沙箱。',
    safetyBoundary: '私信原文读取永久 forbidden；secret proxy 只返回 slot 是否配置，不返回密钥、cookie、token、验证码或个人联系方式。',
  },
  {
    id: 'watcher-policy-orchestrator',
    name: 'Watcher 主动跟进策略',
    competitorPattern: 'Lobu',
    status: 'internal-ready',
    productMeaning: '不是只显示任务状态，而是把回执、阻断、核销导入、浏览器会话和记忆写入变成可追踪的主动跟进 lanes。',
    internalImplementation: 'watcher policy 已输出 receipt/run/browser/POS lanes、wakeups、memory upserts、blocked external gates，并接入 heartbeat。',
    missingExternal: '真实平台 webhook、OpenClaw/Hermes session heartbeat、POS 导出/API 和多租户事件流。',
    safetyBoundary: '没有授权时只处理本地 run、签名回执和脱敏手工导入；不代发、不写核销、不读取私信或后台明细。',
  },
  {
    id: 'public-profile-intake',
    name: '公开门店资料采集入口',
    competitorPattern: 'Restaurant SaaS',
    status: 'internal-ready',
    productMeaning: '餐饮客户不想从空表单开始，系统应能先把公开 POI、白名单公开 URL 或手工资料变成门店 profile 和待补清单。',
    internalImplementation: 'public-profile intake 已生成 profile 字段置信度、证据账本、记忆写入、缺口和外部门禁，并暴露 API/UI。',
    missingExternal: '地图/POI API key、商家平台授权、平台发布/评价回执、POS 数据合同。',
    safetyBoundary: '公开资料只用于草稿、门店场景和缺口提示，不代表商家授权、平台接入、线索承接或经营效果。',
  },
  {
    id: 'agent-ops-console',
    name: 'Agent 执行闭环控制台',
    competitorPattern: 'Lobu',
    status: 'internal-ready',
    productMeaning: '客户需要看到一次餐饮任务从入队、外发、回执、watcher、恢复到经营信号的完整链路，而不是分散按钮。',
    internalImplementation: 'ops-console 已聚合 run health、recovery、watcher policy、browser session health、business signals 和 readiness timeline。',
    missingExternal: '真实 externalRunId、平台回执、浏览器执行器心跳、POS/API 授权。',
    safetyBoundary: '只聚合状态、证据摘要、负责人和下一步，不展示密钥、cookie、私信、个人联系方式或 POS 明细。',
  },
  {
    id: 'execution-receipts-retry',
    name: '执行回执与失败恢复',
    competitorPattern: 'Restaurant SaaS',
    status: 'internal-ready',
    productMeaning: '每个动作都要有回执、负责人、失败原因和重试路径。',
    internalImplementation: '执行会话定义 receiptSchema 与 recoveryLadder，dispatch 写 auditLog。',
    missingExternal: '真实平台回执、内容 ID、核销表或 POS 摘要。',
    safetyBoundary: '无回执不显示已发布、已核销、已获客。',
  },
  {
    id: 'signed-callback-simulator',
    name: '签名回调本地模拟器',
    competitorPattern: 'Lobu',
    status: 'internal-ready',
    productMeaning: '没有真实外部 runtime 时，也要能证明 execution package、HMAC 回调、回执验收、run health、watcher 和经营信号是一条链。',
    internalImplementation: 'callback-simulator API 已生成本地 execution package、签名 external-receipt、验签、入账并触发 heartbeat/run-health/business-signals。',
    missingExternal: '真实 Lobu/OpenClaw/Hermes runtime 的 runId、截图、发布链接、浏览器 session heartbeat 和商家授权。',
    safetyBoundary: '模拟器只证明回调管线，不登录平台、不发布、不读取私信、不拉 POS、不写核销、不保存 raw callback body 或 callback secret。',
  },
  {
    id: 'evidence-scored-receipts',
    name: '证据评分与回执验收',
    competitorPattern: 'Restaurant SaaS',
    status: 'internal-ready',
    productMeaning: '发布执行、线索承接、核销和经营分析都不能只靠一句话确认，必须有可追溯证据等级、分数、事件匹配和拒收原因。',
    internalImplementation: 'receipt validation 已检查 sample URL、unknown event、duplicate evidence、externalRunId、渠道分类、签名来源和隐私风险，并把分数送进 run health。',
    missingExternal: '真实平台发布链接、截图、外部 runtime signed callback、POS/核销导出和商家授权。',
    safetyBoundary: '样例链接、未知事件、重复证据、手机号、微信号和私信原文一律不能解锁 accepted。',
  },
  {
    id: 'business-signal-loop',
    name: '经营信号闭环',
    competitorPattern: 'Restaurant SaaS',
    status: 'internal-ready',
    productMeaning: '餐饮客户真正要看的不是发布任务本身，而是预约、领券、核销、咨询和到店意向如何变成下一步经营动作。',
    internalImplementation: 'business-signals 已从 accepted receipt 聚合脱敏数量、证据均分、负责人和下一步动作，rejected receipt 不进入经营分析。',
    missingExternal: '真实平台线索、券核销、POS 流水、预约系统或社群数据授权。',
    safetyBoundary: '没有外部授权时只分析手工导入或签名回执里的聚合数，不宣称线索已承接、核销已完成或实时经营分析。',
  },
  {
    id: 'pos-import-schema-validator',
    name: 'POS / 核销导入校验器',
    competitorPattern: 'Restaurant SaaS',
    status: 'internal-ready',
    productMeaning: '餐饮客户真正关心核销、客单和活动复盘；没有 POS API 时，也必须先把手工导入变成可校验、可脱敏、可回执的经营信号。',
    internalImplementation: 'pos-import API validates required fields, blocks PII/private fields, aggregates coupon claims, redemptions, orders and sales, then drafts an auditable receipt.',
    missingExternal: '真实 POS/API、团购券后台授权、字段字典、核销口径和商家数据使用合同。',
    safetyBoundary: '只进入聚合指标和脱敏预览；不保存手机号、微信号、顾客姓名、地址、支付流水、订单明细或 POS 行级数据。',
  },
  {
    id: 'merchant-platform-connectors',
    name: '餐饮平台连接器',
    competitorPattern: 'Restaurant SaaS',
    status: 'external-required',
    productMeaning: '连接大众点评/美团、小红书、抖音、微信社群、POS 和核销系统。',
    internalImplementation: '已定义连接器矩阵、接入字段、审计边界和 bridge 外发入口。',
    missingExternal: '商家账号授权、平台 API/导出、POS 字段字典、核销数据。',
    safetyBoundary: '没有授权不抓后台、不代发、不读取私信、不宣称核销已完成。',
  },
];

export function buildRestaurantAgentCapabilityPlan(): RestaurantAgentCapabilityPlan {
  const internalReady = RESTAURANT_COMPETITOR_CAPABILITIES.filter(item => item.status === 'internal-ready').length;
  const bridgeReady = RESTAURANT_COMPETITOR_CAPABILITIES.filter(item => item.status === 'bridge-ready').length;
  const externalRequired = RESTAURANT_COMPETITOR_CAPABILITIES.filter(item => item.status === 'external-required').length;

  return {
    capabilities: RESTAURANT_COMPETITOR_CAPABILITIES,
    session: {
      sessionId: 'restaurant-agent-session-v1',
      browserProfile: {
        mode: 'isolated-agent-browser',
        defaultProfile: 'openclaw',
        canRunNow: false,
        approvalRequired: '接真实商家账号前需要用户提供 OpenClaw/Hermes runtime、隔离 profile 和登录授权。',
      },
      watchers: [
        {
          event: 'publish_receipt_added',
          derives: '渠道、内容 ID、截图/链接、负责人',
          nextAction: '写入发布回执，提醒补齐预约或券领取回收口径。',
        },
        {
          event: 'redemption_sheet_imported',
          derives: '领取数、核销数、客单、库存风险',
          nextAction: '生成下一轮活动建议，必要时降低库存压力。',
        },
        {
          event: 'review_or_message_summary_added',
          derives: '客诉主题、到店阻力、复购信号',
          nextAction: '更新门店记忆，给店长生成跟进问题。',
        },
      ],
      toolPolicy: [
        { tool: 'queue_task', allowed: true, reason: '内部任务队列可先准备。' },
        { tool: 'write_structured_memory', allowed: true, reason: '只写业务摘要和聚合指标。' },
        { tool: 'browser_open_click_type', allowed: false, reason: '需要外部浏览器 runtime 和商家登录授权。' },
        { tool: 'platform_publish', allowed: false, reason: '需要平台账号授权和审核/频控策略。' },
        { tool: 'pos_redemption_pull', allowed: false, reason: '需要 POS API、导出样表或门店后台授权。' },
      ],
      receiptSchema: ['eventId', 'tenantId', 'taskId', 'owner', 'channel', 'evidenceUrl', 'screenshotId', 'externalRunId', 'blockedActions', 'nextAction'],
      recoveryLadder: [
        '缺 runtime：停在本地 payload，提示配置 URL 和 key。',
        '缺账号授权：生成浏览器步骤，不打开商家后台。',
        '缺回执：标记为待证明，不显示已发布或已核销。',
        '执行失败：保留失败原因、负责人和可重试任务。',
      ],
    },
    summary: {
      total: RESTAURANT_COMPETITOR_CAPABILITIES.length,
      internalReady,
      bridgeReady,
      externalRequired,
    },
  };
}

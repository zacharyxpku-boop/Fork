export type RestaurantAgentReference = {
  name: 'OpenClaw' | 'Lobu' | 'Hermes';
  url: string;
  usefulCapability: string;
  canAttachNow: boolean;
  attachRequirement: string;
  safetyBoundary: string;
};

export type RestaurantAgentConnector = {
  id: string;
  name: string;
  runtime: 'internal' | 'openclaw' | 'lobu' | 'lobu-compatible-local' | 'hermes' | 'merchant-platform';
  category: 'browser' | 'memory' | 'queue' | 'pos' | 'platform' | 'review';
  status: 'internal-ready' | 'requires-runtime' | 'requires-credential' | 'requires-merchant-auth';
  canRunNow: boolean;
  capability: string;
  nextAttachStep: string;
  auditBoundary: string;
};

export type RestaurantAgentTask = {
  id: string;
  agent: string;
  trigger: string;
  action: string;
  evidenceRequired: string;
  mode: 'local-plan' | 'manual-handoff' | 'external-runtime';
  owner: string;
};

export type RestaurantAgentMemoryRule = {
  entity: string;
  writes: string;
  readsFor: string;
  retention: string;
  safety: string;
};

export type RestaurantAgentRuntime = {
  references: RestaurantAgentReference[];
  connectors: RestaurantAgentConnector[];
  tasks: RestaurantAgentTask[];
  memoryRules: RestaurantAgentMemoryRule[];
  summary: {
    internalReady: number;
    externalBlocked: number;
    nextRuntimeChoice: string;
  };
};

export const RESTAURANT_AGENT_REFERENCES: RestaurantAgentReference[] = [
  {
    name: 'OpenClaw',
    url: 'https://docs.openclaw.ai/tools/browser',
    usefulCapability: 'local browser execution, skills, shell/file actions, persistent local memory',
    canAttachNow: false,
    attachRequirement: 'OpenClaw daemon or CLI, reviewed skills, isolated browser profile, scoped workspace permission',
    safetyBoundary: 'Do not install unreviewed skills or let the agent operate a merchant account without explicit authorization.',
  },
  {
    name: 'Lobu',
    url: 'https://lobu.ai/guides/architecture/',
    usefulCapability: 'open-source style multi-tenant agent runtime, gateway, workers, watchers, tools, memory and secret proxy',
    canAttachNow: false,
    attachRequirement: 'Lobu runtime service or self-hosted repo, connector SDK, OAuth app config and tenant isolation policy',
    safetyBoundary: 'Workers must never hold raw third-party tokens; connector events need audit logs and tenant scope.',
  },
  {
    name: 'Hermes',
    url: 'https://docs.browser-use.com/cloud/tutorials/integrations/hermes-agent',
    usefulCapability: 'agent workflow with browser-use style browser control and external memory providers',
    canAttachNow: false,
    attachRequirement: 'Hermes runtime, browser-use credentials or local browser profile, memory backend decision',
    safetyBoundary: 'Browser control must stay in sandbox or an explicitly approved merchant browser profile.',
  },
];

export const RESTAURANT_AGENT_CONNECTORS: RestaurantAgentConnector[] = [
  {
    id: 'local-browser-plan',
    name: '常驻浏览器执行计划',
    runtime: 'internal',
    category: 'browser',
    status: 'internal-ready',
    canRunNow: true,
    capability: '把发布、核销、预约检查拆成浏览器步骤、证据字段和人工确认点。',
    nextAttachStep: '接 OpenClaw/Hermes 后，把本地计划交给真实 browser executor。',
    auditBoundary: '现在只生成计划，不打开商家后台、不模拟登录、不绕过验证码。',
  },
  {
    id: 'restaurant-memory',
    name: '门店记忆主动跟进',
    runtime: 'internal',
    category: 'memory',
    status: 'internal-ready',
    canRunNow: true,
    capability: '把门店、菜品、活动、线索、核销和复盘写成结构化记忆规则。',
    nextAttachStep: '接 Lobu/OpenClaw memory 后，把实体记忆同步到长期存储。',
    auditBoundary: '只保存业务摘要和来源，不保存顾客隐私、手机号、原始私信全文。',
  },
  {
    id: 'agent-task-queue',
    name: '餐饮 Agent 任务队列',
    runtime: 'internal',
    category: 'queue',
    status: 'internal-ready',
    canRunNow: true,
    capability: '把经营诊断、内容发布、线索跟进、核销复盘拆成可审计任务。',
    nextAttachStep: '接外部 runtime 后，任务可由 worker/watchers 自动推进。',
    auditBoundary: '没有外部回执前，任务只能标记为待执行或人工交接。',
  },
  {
    id: 'lobu-local-runtime',
    name: 'Lobu 兼容本地运行层',
    runtime: 'lobu-compatible-local',
    category: 'queue',
    status: 'internal-ready',
    canRunNow: true,
    capability: '把餐饮任务转成 Lobu 风格的 tenant event、worker payload、memory write 和 audit log，先在本项目内真实入队。',
    nextAttachStep: '接入开源 Lobu runtime 后，把同一份 payload 改为投递到 gateway / worker / watcher。',
    auditBoundary: '本地层只执行白名单任务；平台发布、私信读取、核销和 POS 拉取必须等商家授权与 secret proxy。',
  },
  {
    id: 'local-persistent-ledger',
    name: '本地持久 Agent 账本',
    runtime: 'internal',
    category: 'memory',
    status: 'internal-ready',
    canRunNow: true,
    capability: '把 Agent run、发布回执和失败原因写入本地 JSONL 账本，重启后仍可恢复最近任务和证据。',
    nextAttachStep: '接 Lobu/Postgres/PGlite 后，把同一套账本协议迁移到多租户持久存储。',
    auditBoundary: '账本只保存业务摘要、证据链接和状态，不保存 API key、cookie、手机号、微信号或私信原文。',
  },
  {
    id: 'signed-runtime-callback',
    name: '签名 Runtime 回执入口',
    runtime: 'internal',
    category: 'review',
    status: 'internal-ready',
    canRunNow: true,
    capability: '为 Lobu/OpenClaw/Hermes 提供 HMAC 签名回调入口，把外部执行器的 runId、截图和发布证明写回回执账本。',
    nextAttachStep: '配置 RESTAURANT_AGENT_CALLBACK_SECRET 后，外部 runtime 可用 x-restaurant-agent-signature 安全回写。',
    auditBoundary: '未配置签名密钥或签名不匹配时拒收；回调响应不返回密钥，回执仍会过滤个人联系方式和私信原文。',
  },
  {
    id: 'recovery-orchestrator',
    name: '失败恢复与重试编排',
    runtime: 'internal',
    category: 'queue',
    status: 'internal-ready',
    canRunNow: true,
    capability: '把 queued、blocked、forwarded、failed 和已回执状态转成 retry、人工兜底、签名回写或配置 runtime 的下一步动作。',
    nextAttachStep: '接外部 runtime 后，用同一套 recovery plan 控制重试次数、停止条件和人工升级。',
    auditBoundary: '不自动循环点击平台；遇到登录、验证码、授权缺失、签名失败或疑似隐私内容立即停止并升级人工。',
  },
  {
    id: 'signed-callback-simulator',
    name: 'Signed Callback Simulator',
    runtime: 'internal',
    category: 'review',
    status: 'internal-ready',
    canRunNow: true,
    capability: 'Simulates the external execution callback loop locally: execution package, HMAC signature, external receipt validation, run health, watcher and business signals.',
    nextAttachStep: 'Use it to verify callback plumbing before replacing the simulator with real Lobu/OpenClaw/Hermes runtime callbacks.',
    auditBoundary: 'The simulator proves callback wiring only; it does not log in, publish, read private messages, pull POS rows, write redemptions, store raw callback bodies or expose callback secrets.',
  },
  {
    id: 'browser-session-manifest',
    name: '隔离浏览器 Session Manifest',
    runtime: 'internal',
    category: 'browser',
    status: 'internal-ready',
    canRunNow: true,
    capability: '生成可交给 OpenClaw/Hermes 的浏览器会话 manifest，包含 profile、工具权限、证据计划、callback 合同和停止条件。',
    nextAttachStep: '配置隔离 profile、runtime URL/key 和 callback secret 后，可把 manifest 投递给外部浏览器执行器。',
    auditBoundary: 'manifest 不包含密码、cookie、API key；遇到验证码、登录挑战、私信原文或支付确认必须停止。',
  },
  {
    id: 'browser-session-registry',
    name: '常驻浏览器 Session Registry',
    runtime: 'internal',
    category: 'browser',
    status: 'internal-ready',
    canRunNow: true,
    capability: '把 OpenClaw/Hermes 浏览器会话登记为有租约、心跳、恢复状态和工具权限摘要的可审计 session。',
    nextAttachStep: '接入真实 runtime 后，ready session 用 heartbeat 续约；过期、缺 profile 或缺 callback 的 session 留在 handoff-only/blocked。',
    auditBoundary: 'registry 只保存 session 状态和配置布尔值，不保存 cookie、token、验证码、密码、私信原文或后台数据。',
  },
  {
    id: 'merchant-grant-manifest',
    name: '商家授权与工具 Grant Manifest',
    runtime: 'internal',
    category: 'review',
    status: 'internal-ready',
    canRunNow: true,
    capability: '把门店账号、渠道、POS、代发、证据字段、过期和撤销规则整理成外部 runtime 必须遵守的工具授权清单。',
    nextAttachStep: '接真实账号前，先让商家确认授权渠道、可执行动作、审批人、有效期和撤销方式。',
    auditBoundary: 'manifest 只返回 allow/block 和证据要求，不返回 token、cookie、密码、短信码、私信原文或顾客个人信息。',
  },
  {
    id: 'browser-runbook-package',
    name: 'Browser Runbook Package',
    runtime: 'internal',
    category: 'browser',
    status: 'internal-ready',
    canRunNow: true,
    capability: 'Builds an OpenClaw/Hermes-ready browser runbook with ordered preflight, navigate, inspect, capture, extract, callback and stop steps.',
    nextAttachStep: 'Send the runbook only after runtime URL/key, isolated browser profile, callback secret and merchant grant are configured.',
    auditBoundary: 'The runbook contains no API key, cookie, raw browser profile, private-message text, POS rows or fake execution result; login, captcha, unapproved publish and private data boundaries stop the run.',
  },
  {
    id: 'browser-runner-callback-contract',
    name: 'Browser Runner Callback Contract',
    runtime: 'internal',
    category: 'browser',
    status: 'internal-ready',
    canRunNow: true,
    capability: 'Defines how OpenClaw/Hermes browser runners report step completion, blockers, failures and final signed receipts back into run health, watcher and recovery.',
    nextAttachStep: 'After forwarding a browser runbook, require runner callbacks to follow this contract before any task can be marked accepted.',
    auditBoundary: 'The contract exposes schema, retry policy and stop conditions only; it contains no API key, cookie, raw browser profile, private-message text, POS rows or fabricated completion.',
  },
  {
    id: 'browser-runner-event-ledger',
    name: 'Browser Runner Event Ledger',
    runtime: 'internal',
    category: 'browser',
    status: 'internal-ready',
    canRunNow: true,
    capability: 'Stores sanitized OpenClaw/Hermes runner step events, blockers, failures, retry flags and stale-run health before the final signed receipt arrives.',
    nextAttachStep: 'Forward runner step events into this ledger, then let run health and recovery use stale/blocked/rejected state instead of waiting blindly for final receipt.',
    auditBoundary: 'The ledger rejects private or sensitive payloads and never stores cookies, tokens, raw browser profile values, private-message raw text, customer identifiers or POS rows.',
  },
  {
    id: 'merchant-grant-checklist',
    name: 'Grant Checklist Wizard',
    runtime: 'internal',
    category: 'review',
    status: 'internal-ready',
    canRunNow: true,
    capability: '把自动发布、回执抓取、POS 导入和经营分析拆成商家、运营、技术、合规四类前置步骤，逐项显示缺口、证据和解锁能力。',
    nextAttachStep: '先用 checklist 补齐 runtime、浏览器 profile、平台授权、POS 字段合同和回执签名，再允许外部执行包进入 runtime。',
    auditBoundary: 'wizard 只返回步骤状态、证据要求和阻断原因；不返回密钥、cookie、token、浏览器 profile 原值、私信原文、顾客信息或 POS 明细。',
  },
  {
    id: 'restaurant-activation-gates',
    name: '经营能力激活门禁',
    runtime: 'internal',
    category: 'review',
    status: 'internal-ready',
    canRunNow: true,
    capability: '直接回答自动发布、自动获客、自动核销、真实经营分析现在是 ready、blocked 还是 forbidden，并列出内部可跑替代动作和外部必补条件。',
    nextAttachStep: '当某个 gate 从 blocked 变 ready 后，再允许对应执行包、回执、POS 导入或经营分析进入受控运行。',
    auditBoundary: '不把草稿数量包装成获客结果，不把样例 POS 当真实经营，不返回密钥、私信、顾客身份或 POS 明细。',
  },
  {
    id: 'competitor-capability-audit',
    name: '竞品能力审计',
    runtime: 'internal',
    category: 'review',
    status: 'internal-ready',
    canRunNow: true,
    capability: '把 Lobu、OpenClaw、Hermes 的公开 Agent 能力抽象成餐饮版目标形态，并逐项对照当前证据、内部下一步和外部必补项。',
    nextAttachStep: '用审计结果持续驱动下一轮内部建设；external-required 项只在商家授权、runtime、浏览器 profile 和 POS 合同到位后解锁。',
    auditBoundary: '只引用公开能力模式和当前产品证据，不声称已连接真实竞品 runtime、平台账号、POS 或私信数据。',
  },
  {
    id: 'agent-build-queue',
    name: 'Agent 构建队列',
    runtime: 'internal',
    category: 'queue',
    status: 'internal-ready',
    canRunNow: true,
    capability: '把竞品能力审计的 nextBuildOrder 转成可执行 backlog，标出内部可建、bridge 加固、外部环境等待和验收标准。',
    nextAttachStep: '每轮从 ready-to-build 或 needs-design-review 队列取最高价值项推进；waiting-external 只生成配置请求，不假装执行。',
    auditBoundary: '队列不包含密钥、账号、cookie、私信、顾客身份或 POS 明细，也不把等待外部授权的能力显示成已完成。',
  },
  {
    id: 'external-execution-package',
    name: '外部执行投递包',
    runtime: 'internal',
    category: 'queue',
    status: 'internal-ready',
    canRunNow: true,
    capability: '把 dispatch、浏览器 session、商家 grant、callback 合同、证据字段和停止条件合成 Lobu/OpenClaw/Hermes 可读的执行 payload。',
    nextAttachStep: 'runtime、隔离 profile、商家授权和 callback secret 齐备后，再把投递包交给外部执行器。',
    auditBoundary: '投递包不包含 API key、cookie、浏览器 profile 原始标识、私信原文或顾客个人信息；越权动作在 payload 内显式 blocked。',
  },
  {
    id: 'run-health-console',
    name: 'Run Health 与回执验收面板',
    runtime: 'internal',
    category: 'review',
    status: 'internal-ready',
    canRunNow: true,
    capability: '把 queued、blocked、forwarded、failed、accepted 和 rejected receipt 聚合成运营可读的健康状态、证据状态和下一步动作。',
    nextAttachStep: '接外部 runtime 后，用同一套 health 状态追踪外部 runId、截图、发布链接和失败原因。',
    auditBoundary: '只展示状态、证据摘要和负责人，不展示 token、cookie、手机号、微信号或私信原文。',
  },
  {
    id: 'runtime-connector-probe',
    name: '外部 Runtime Health Probe',
    runtime: 'internal',
    category: 'review',
    status: 'internal-ready',
    canRunNow: true,
    capability: '只探测 Lobu/OpenClaw/Hermes health、callback secret、隔离 profile、商家授权和 POS 数据合同是否就绪。',
    nextAttachStep: '配置 runtime URL/key 后可做 health 探测；商家账号和 POS 仍只显示授权状态，不执行登录或数据读取。',
    auditBoundary: 'probe 不登录平台、不发布、不读取私信/POS；响应不返回 API key、cookie、token 或 profile 原始值。',
  },
  {
    id: 'runtime-setup-contract',
    name: 'Runtime Setup Contract',
    runtime: 'internal',
    category: 'review',
    status: 'internal-ready',
    canRunNow: true,
    capability: 'Maps Lobu/OpenClaw/Hermes and restaurant SaaS requirements into machine-readable setup tracks, unlocks, blockers, owners and safety boundaries.',
    nextAttachStep: 'Use the contract before enabling external forwarding so runtime URL/key, browser profile, callback secret, merchant auth and POS fields are all explicit.',
    auditBoundary: 'Only readiness and missing gates are exposed; API keys, cookies, tokens, raw browser profile values, private-message text and POS rows never leave the server.',
  },
  {
    id: 'receipt-evidence-validator',
    name: '证据评分与回执验收门禁',
    runtime: 'internal',
    category: 'review',
    status: 'internal-ready',
    canRunNow: true,
    capability: '按来源、事件匹配、渠道、链接、截图、externalRunId、重复证据和隐私风险给回执打分；样例链接、未知事件和私信原文不能解锁完成状态。',
    nextAttachStep: '接入外部 runtime、发布平台或 POS 后，所有自动执行结果仍必须通过同一套验收门禁再进入 run health、watcher 和经营复盘。',
    auditBoundary: '只输出证据等级、分数、拒收原因和脱敏摘要；不展示手机号、微信号、cookie、token、私信原文或 POS 明细。',
  },
  {
    id: 'business-signal-aggregator',
    name: '预约领券核销经营信号聚合',
    runtime: 'internal',
    category: 'review',
    status: 'internal-ready',
    canRunNow: true,
    capability: '把已验收回执中的预约、领券、核销、咨询和到店意向转成门店经营动作，不依赖虚假增长数字。',
    nextAttachStep: '接入点评/美团、抖音、小红书、微信社群或 POS 后，把平台回流先落到 signed receipt，再进入同一套经营信号聚合。',
    auditBoundary: '只汇总脱敏数量和来源，不保存私信原文、手机号、微信号、订单明细或 POS 原始流水。',
  },
  {
    id: 'pos-import-schema-validator',
    name: 'POS / Redemption Import Validator',
    runtime: 'internal',
    category: 'pos',
    status: 'internal-ready',
    canRunNow: true,
    capability: 'Validates sanitized POS, coupon and redemption rows against a strict schema, blocks PII fields, aggregates redemption signals and drafts an auditable receipt.',
    nextAttachStep: 'After merchant POS/API authorization, reuse the same schema validator as the ingestion gate before operating analysis.',
    auditBoundary: 'Only aggregate counts and sanitized previews are returned; raw order rows, phone numbers, WeChat IDs, customer names, addresses, payment identifiers and POS line-item details are not stored.',
  },
  {
    id: 'deterministic-tool-policy-evaluator',
    name: '工具权限与 Secret Proxy 评估器',
    runtime: 'internal',
    category: 'review',
    status: 'internal-ready',
    canRunNow: true,
    capability: '把浏览器动作、发布动作、POS 拉取、线索汇总和私信读取拆成 action-level 决策，输出 internal-ready、external-ready、blocked 或 forbidden。',
    nextAttachStep: '接入 Lobu/OpenClaw/Hermes 前先用这套评估器生成可执行动作白名单、secret slot 状态和阻断原因；接入后仍作为运行时门禁。',
    auditBoundary: '只暴露 secret slot 是否配置，不返回 API key、cookie、token、验证码、密码、手机号、微信号或私信原文；私信原文读取永久禁止。',
  },
  {
    id: 'watcher-policy-orchestrator',
    name: 'Watcher 主动跟进策略编排',
    runtime: 'internal',
    category: 'queue',
    status: 'internal-ready',
    canRunNow: true,
    capability: '把 run ledger、receipt ledger、浏览器 session 和授权状态转成 watcher lanes、wakeups、记忆写入和升级路径。',
    nextAttachStep: '接入平台 webhook、OpenClaw/Hermes session heartbeat 或 POS 导出后，把同一套 watcher policy 连接到真实事件流。',
    auditBoundary: '只处理签名回执、手工导入和脱敏摘要；没有授权时不自动发布、不自动核销、不读取私信或后台明细。',
  },
  {
    id: 'public-profile-intake',
    name: '公开门店资料 Intake',
    runtime: 'internal',
    category: 'memory',
    status: 'internal-ready',
    canRunNow: true,
    capability: '把 OSM 样例、白名单公开 URL 或客户手工文本转成门店 profile、证据账本、记忆写入和缺口清单。',
    nextAttachStep: '接入地图/POI API key 后可批量搜索和补全；接入商家授权前仍只作为公开资料和草稿输入。',
    auditBoundary: '不登录平台、不绕过验证码、不采集私信、手机号、微信号、订单或 POS 明细；公开资料不等于商家授权或经营效果。',
  },
  {
    id: 'agent-ops-console',
    name: 'Agent Ops 闭环控制台',
    runtime: 'internal',
    category: 'review',
    status: 'internal-ready',
    canRunNow: true,
    capability: '把 run health、recovery、watcher、browser session、business signals 和 external readiness 合成一屏执行链路。',
    nextAttachStep: '接入真实 runtime、平台授权和 POS 后继续沿用同一条 timeline 展示外部 runId、回执和阻断原因。',
    auditBoundary: '只展示状态、证据摘要、负责人和下一步；不展示 API key、cookie、token、私信原文、手机号、微信号或 POS 明细。',
  },
  {
    id: 'dianping-meituan',
    name: '大众点评 / 美团商家连接器',
    runtime: 'merchant-platform',
    category: 'platform',
    status: 'requires-merchant-auth',
    canRunNow: false,
    capability: '读取门店页、团购券、核销、预约和发布证明。',
    nextAttachStep: '需要商家账号授权、导出/API 路径和平台数据使用边界。',
    auditBoundary: '没有授权前不能抓后台、不能代发、不能宣称自动核销。',
  },
  {
    id: 'xiaohongshu-douyin-wechat',
    name: '小红书 / 抖音 / 微信发布连接器',
    runtime: 'merchant-platform',
    category: 'platform',
    status: 'requires-merchant-auth',
    canRunNow: false,
    capability: '自动发布、读取发布回执、评论、私信摘要和社群反馈。',
    nextAttachStep: '需要平台账号、内容 ID、授权范围、审核回执和频控规则。',
    auditBoundary: '未授权前只能生成内容草稿和手工发布清单。',
  },
  {
    id: 'pos-redemption',
    name: 'POS / 核销 / 库存连接器',
    runtime: 'merchant-platform',
    category: 'pos',
    status: 'requires-credential',
    canRunNow: false,
    capability: '把销售流水、菜品销量、毛利、库存和券核销转成经营分析。',
    nextAttachStep: '需要 POS 导出样表、字段字典、API key 或门店后台账号。',
    auditBoundary: '没有真实 POS 数据前，只能分析用户手填或样表数据。',
  },
];

export function buildRestaurantAgentRuntime(): RestaurantAgentRuntime {
  const internalReady = RESTAURANT_AGENT_CONNECTORS.filter(item => item.canRunNow).length;
  const externalBlocked = RESTAURANT_AGENT_CONNECTORS.length - internalReady;

  return {
    references: RESTAURANT_AGENT_REFERENCES,
    connectors: RESTAURANT_AGENT_CONNECTORS,
    tasks: [
      {
        id: 'browser-publish-check',
        agent: 'Browser Agent',
        trigger: '门店确认内容后',
        action: '生成点评、小红书、抖音、微信的发布检查步骤和凭证字段。',
        evidenceRequired: '发布链接、截图、内容 ID 或人工确认记录。',
        mode: 'local-plan',
        owner: '运营',
      },
      {
        id: 'memory-followup',
        agent: 'Memory Agent',
        trigger: '核销、预约、私信或差评被回填后',
        action: '更新门店活动记忆，并生成下次跟进问题。',
        evidenceRequired: '来源、时间、负责人、不得保存个人敏感信息。',
        mode: 'local-plan',
        owner: '店长',
      },
      {
        id: 'redemption-review',
        agent: 'Redemption Agent',
        trigger: '团购券领取和核销数据导入后',
        action: '比对领取、预约、核销、客单和库存，输出下一轮经营建议。',
        evidenceRequired: '核销表、POS 摘要、库存确认。',
        mode: 'manual-handoff',
        owner: '经营负责人',
      },
      {
        id: 'external-runtime-attach',
        agent: 'Lobu Runtime Adapter',
        trigger: '用户提供 Lobu/OpenClaw/Hermes runtime 与账号授权后',
        action: '把本地 Lobu 兼容任务投递给外部 gateway / worker / browser executor，并写回审计日志。',
        evidenceRequired: 'runtime URL、租户隔离、权限范围、执行回执。',
        mode: 'external-runtime',
        owner: '技术',
      },
    ],
    memoryRules: [
      {
        entity: 'Restaurant',
        writes: '门店名、商圈、营业时段、负责人、禁用表达。',
        readsFor: '后续内容、排期、发布检查和经营复盘。',
        retention: '长期保留，门店可编辑。',
        safety: '不保存法人、员工或顾客个人敏感信息。',
      },
      {
        entity: 'Offer',
        writes: '菜品/套餐、价格、成本率、库存、核销口径和活动边界。',
        readsFor: '毛利试算、库存风险、渠道内容包。',
        retention: '按活动保留，复盘后归档。',
        safety: '价格和成本仅来自门店输入或授权导入。',
      },
      {
        entity: 'LeadSignal',
        writes: '券领取数、预约数、私信咨询数、核销数和来源。',
        readsFor: '线索压力、负责人分配和下一轮跟进。',
        retention: '只保留聚合指标和来源链接。',
        safety: '不保存手机号、微信号、私信原文或可识别顾客身份的信息。',
      },
    ],
    summary: {
      internalReady,
      externalBlocked,
      nextRuntimeChoice: '先接 Lobu 兼容本地运行层、持久账本、签名回执入口、失败恢复编排、signed callback simulator、浏览器 session manifest、browser runbook package、browser runner callback contract、browser runner event ledger、商家 grant manifest、grant checklist wizard、经营能力激活门禁、竞品能力审计、Agent 构建队列、外部执行投递包、run health 面板、runtime probe、runtime setup contract、POS import schema validator、tool policy、watcher policy、public profile intake 和 agent ops console，把任务、记忆、审计、授权边界、secret proxy 门禁、公开资料入口、核销数据门禁、主动跟进、闭环控制台和 worker payload 跑起来；浏览器执行再接 OpenClaw/Hermes，正式多租户事件流再接开源 Lobu runtime。',
    },
  };
}

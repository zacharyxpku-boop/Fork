import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import FactoryPage from '@/app/factory/page';
import CastFactoryPage from '@/app/factory/cast/page';
import CreateFactoryPage from '@/app/factory/create/page';
import CreativeFactoryPage from '@/app/factory/creative/page';
import ManageFactoryPage from '@/app/factory/manage/page';
import VideoFactoryPage from '@/app/factory/video/page';
import { RestaurantAdvancedAudit } from '@/components/RestaurantAdvancedAudit';
import { RestaurantProviderForwardableSetupDossierPanel } from '@/components/RestaurantProviderForwardableSetupDossierPanel';
import { RestaurantProviderLiveRunGatePanel } from '@/components/RestaurantProviderLiveRunGatePanel';
import { RestaurantProviderReceiptAcceptancePanel } from '@/components/RestaurantProviderReceiptAcceptancePanel';
import { RestaurantProviderRunPacketPanel } from '@/components/RestaurantProviderRunPacketPanel';
import { RestaurantRunnerMissionTimelinePanel } from '@/components/RestaurantRunnerMissionTimelinePanel';
import type { RestaurantProviderForwardableSetupDossier } from '@/lib/restaurant-provider-forwardable-setup-dossier';
import type { RestaurantProviderReceiptAcceptanceConsole } from '@/lib/restaurant-provider-receipt-acceptance-console';

const oldSurfaceTerms = [
  'SKU',
  '商品',
  '电商',
  '广告',
  '投放',
  'campaign',
  'Campaign',
  'CRM',
  '客户审核',
  '商品 brief',
  '产品素材',
  '15s launch script',
  'Product visual asset',
  'benchmark-video',
  '@brand-main',
  'Launch conversion boost',
  '写入账号',
  'analytics sync',
  'Cast Distribution Variant',
  'Ad Delivery Guardrails',
  'Manual Publish Receipt Board',
  'Channel Matrix',
  'download-ready',
  'share-ready',
  'Manage Operations Variant',
];

const engineeringSurfaceTerms = [
  'Run Routed Action',
  'payloadShape',
  'browser session',
  'OpenClaw',
  'Claw',
  'Hermes',
  'Lobu',
  'openclaw',
  'runtimeTarget',
  'targetRuntime',
  'runtime URL',
  'runtime key',
  'runtime API key',
  ' runtime',
  'runtime ',
  'restaurant-agent-runtime',
  'RESTAURANT_AGENT_',
  'Provider',
  'provider',
  'runtime-admin',
  'store-manager',
  'community-ops',
  'data-ops',
  'merchant',
  'internal-ready',
  'provider-gated',
  'accepted-train-next-run',
  'waiting-provider-callback',
  'receipt-rejected-recovery',
  'waiting-external',
  'simulator-only',
  'blocked-before-launch',
  'blocked-before-dispatch',
  'blocked-before-submit',
  'blocked-missing-scope',
  'ready-for-internal-shift',
  'usable-internal-analysis',
  'needs-public-proof',
  'public-search',
  'merchant-upload',
  'provider-required',
  'needs-proof',
  'next-shift',
  'idle',
  'ready-for-trial',
  'waiting-evidence',
  'external-browser-runbook',
  'isolated-browser-handoff',
  'local-signed-callback',
  'final-receipt-only',
  'run-started',
  'step-completed',
  'step-blocked',
  'run-failed',
  'run-completed',
  'audit-only',
  'server-side-placeholder-only',
  'isolated-agent-browser',
  'signed-in-user-browser',
  'menu-profit',
  'traffic-growth',
  'conversion-followup',
  'operations-review',
  'brand-content',
  'provider-launch',
  'browser-request-gateway',
  'internal-first-provider-gated',
  'internal-execution-ready',
  'training-and-provider-gated',
  'local-simulator',
  'external-ready',
  'local-watch',
  'needs-recovery',
  'business-review',
  'real-provider',
  'setup-required',
  'supervised-browser',
  'public-sample',
  'manual-public-profile',
  'handoff-only',
  'supervised-ready',
  'needs-human',
  'review-ready',
  'missing-material',
  'runtime-health',
  'browser-gateway',
  'provider-package',
  'merchant-auth',
  'signed-callback',
  'run-id',
  'public-proof',
  'business-signal',
  'memory-write',
  'claim-boundary',
  '>p0<',
  'browser executor',
  'browser profile',
  'browser profile ids',
  '浏览器会话',
  '浏览器通道',
  '浏览器试跑',
  'profile',
  'payload',
  'api keys',
  'API keys',
  'secret proxy',
  'schema validator',
  'tool policy',
  'watcher policy',
  'agent ops console',
  'webhook',
  '沙箱提交',
  '外部提交',
  '真实提交',
  '真实分析',
  '外部执行交接包',
  '一次外部执行',
  '外部交接',
  '外部试跑',
  '外部试跑闸门',
  '外部通道',
  '外部通道回执',
  '外部通道错误说明',
  '外部动作完成',
  '签名外部回执',
  '暂无外部执行队列',
  '原始 POS 行',
  '原始收银行',
  '外部门禁',
  '自动成片',
  '真实成片',
  '真实规模化',
  '真实商用',
  '一键',
  '自动化',
  '接口路径',
  '请求方式',
  'provider 完成回调',
  '已完成',
  '外部 provider',
  '外部材料',
  '投递包',
  '令牌',
  '审计日志',
  '审计',
  'OAuth',
  'env key',
  'env keys',
  'health probe',
  'health check',
  'probe',
  'adapter',
  'contract',
  'runner',
  'worker',
  'manifest',
  'wizard',
  'ledger',
  'runbook',
  'Agent ',
  ' agent',
  ' API',
  'API ',
  'sandbox contract',
  'sandbox submit',
  'bearer auth',
  'callback URL',
  'callback header',
  'callbackHeader',
  'callbackAction',
  'allowedDomains',
  'writesTo',
  'callback_simulator',
  'external-runtime',
  'receipt-ledger',
  'run-ledger',
  'browser-session',
  'setup-wizard',
  'health-probe',
  'sandbox-contract',
  'publish-inbox',
  'planned-runbook',
  'launch-gate',
  'receipt-closeout',
  'safetyBoundary',
  'allowlist',
  'server-side',
  'GET ',
  'API key',
  'callback secret',
  'endpoint',
  'heartbeat',
  'external-receipt',
  'taskId',
  'packageId',
  'selectedPackageId',
  'runId',
  'tenantId',
  'evidenceUrl',
  'screenshotId',
  'eventId',
  'signedAt',
  'blockedActions',
  'nextAction',
  'POST ',
  'POST /tasks',
  'safePayload',
  'no blocker',
  '/tasks',
  '/health',
  '/events',
  '/runs',
  'externalRunId',
  'receiptId',
  'safeResponse',
  'sourceRequired',
  'providerGate',
  'competitorEquivalent',
  'pos-import-accepted',
  'prepare_publish_draft',
  'manual-sanitize',
  'high-confidence',
  'medium-confidence',
  'low-confidence',
  'read_private_message',
  'public proof URL',
  'proof URL',
  'sample URL',
  'unknown event',
  'duplicate evidence',
  'rejectedReason',
  'evidenceSummary',
  'signed callback',
  'signed external-receipt',
  'public URL',
  'screenshot id',
  'operator summary',
  'provider error code',
  'x-restaurant-agent-signature',
  'couponClaimCount',
  'redemptionCount',
  'orderCount',
  'grossSales',
  'gross sales',
  'segmentName',
  'followupCount',
  'ingredientCost',
  'platformFee',
  'bank account',
  'raw POS rows',
  'WeChat ID',
  'coupon code',
  'payment id',
  'private message text',
  'customer PII',
  'signed lead receipt',
  'remembered packs',
  'Browser Runbook',
  'Next Loop Plan',
  'Save Setup State',
  'Refresh Inbox',
  'Draft Notice',
  'ledger events',
  'lead-sandbox-package',
  'no-PII private-domain data contract',
  'Command Cards',
  'Task ledger',
  'UI/UX',
  'Restaurant Content Delivery Kit',
  'B-roll',
  'review ',
  ' review',
  'Review ',
  'review token',
  'RBAC',
  'DLP',
  'grant',
  'fail-closed',
  'External',
  'Internal',
  'Ready',
  'ready ',
  ' live',
  '>live<',
  'AI 员工',
  'AI 店员',
  'AI 经营顾问',
  'AI 本地',
  '门店 AI',
  'today ',
  'blocked ',
  '资料和凭证是否齐全',
  '账号资料和回执齐全',
  '账号资料齐全',
  '可否交接',
  '账号和资料可用性',
  '本地可用 /',
  '现在可用',
  '现在可做',
  '现在可跑',
  '今天可用',
  '凭证可用',
  '可用性检查',
  '可用性',
  '可用项',
  '缺配置',
  '店长已确认',
  '环境已确认',
  '资料已签收',
  '已通过',
  '汇总已验收',
  '已确认通道',
  '已确认步骤',
  '已确认资料',
  '发完要截图回执',
  '覆盖工具',
  '内部训练任务',
  '本地训练任务',
  '训练蓝图',
  '启动训练包',
  '平台连接器',
  '服务端配置已配',
  '项已配置',
  '可解锁',
  '训练计划已生成',
  '可先训练',
  '环境确认状态',
  '可用字段',
  '项账号配置已确认',
  '已满足',
  '工具边界已评估',
  '账号资料条件已齐',
  '项待训练',
  '下轮训练材料',
  '门店训练材料写入',
  '条已验收回执',
  '链路可用',
  '本地已记录',
  '班次收尾训练',
  '已验收的班次收尾训练',
  '班次收尾训练记录',
  '已验收 ',
  '投递通道已就绪',
  '动作已安排',
  '下一次巡检: 已安排',
  '已计划',
  '已打开链接',
  '已签名回执',
  '等待已验收凭证',
  '已记录未检查',
  '项经营数据规则已记录',
  '已记记录',
  '已验收回执后',
  '已验收凭证或',
  '凭证可写入',
  '账号资料可用',
  '资料已记录',
  '>已验收<',
  '>已记录<',
  '已验收凭证',
  '已验收回执',
  '已记录训练包',
  '试跑记录 已记录',
  '>已生成<',
  '可用链路',
  '账号资料就绪',
  '已授权隔离试跑环境',
  '隔离会话: 已配置',
  '已生成回执样例',
  '回执可验收',
  '样例验收',
  '可验收',
  '凭证验收',
  '验收规则',
  '回执没验收',
  '配置凭证没验收',
  '交接不等于验收',
  '交接验收工作台',
  '验收字段',
  '等待回执验收',
  '试跑通道验收约定',
  '试跑回执与验收状态',
  '验收证据',
  '已配置/待补',
  '可用渠道',
  '已确认事实',
  '已确认内容',
  '已审核草稿',
  '已审核视频文案',
  '已记录待检查',
  '试跑已开始',
  '试跑已收尾',
  '试跑工作流已生成',
  '补资料包已生成',
  '交接解锁清单已生成',
  '账号和资料补齐向导已生成',
  '店长跟进已生成',
  '试跑交接资料已生成',
  '准备计划已生成',
  '已选脱敏交接包',
  '已审核群文案',
  '已审核的菜品信息',
  '已审核的公开笔记',
  '已收尾运行',
  '已保存记录',
  '本地可做',
  '可做动作',
  '可做事项',
  '可做步骤',
  '今天可做',
  '已内建',
  '已桥接',
  '可执行任务包',
  '可执行工单',
  '本地可执行',
  '可跑',
  '可先跑',
  '领券数量',
  '核销数量',
  '手机号',
  '支付单号',
  '签名线索回执',
  '已验收记录',
  '已验收的本地回执',
  '签名回执已验收',
  '脱敏交接包已验收',
  '已验收导入',
  '已验收训练记录',
  '已验收的公开凭证',
  '已验收的样例汇总行',
  '条已验收',
];

describe('restaurant friend trial surface', () => {
  it('keeps the six customer trial factory pages restaurant-native', async () => {
    const pages = [
      await FactoryPage({ searchParams: Promise.resolve({ variant: 'friend_trial' }) }),
      await CreativeFactoryPage({ searchParams: Promise.resolve({ variant: 'friend_trial' }) }),
      await CreateFactoryPage({ searchParams: Promise.resolve({ variant: 'friend_trial' }) }),
      await VideoFactoryPage({ searchParams: Promise.resolve({ variant: 'friend_trial' }) }),
      await CastFactoryPage({ searchParams: Promise.resolve({ variant: 'friend_trial' }) }),
      await ManageFactoryPage({ searchParams: Promise.resolve({ variant: 'friend_trial' }) }),
      <RestaurantProviderRunPacketPanel key="provider-run-packet-panel" />,
      <RestaurantProviderReceiptAcceptancePanel key="provider-receipt-acceptance-panel" />,
      <RestaurantProviderLiveRunGatePanel key="provider-live-run-gate-panel" />,
      <RestaurantProviderForwardableSetupDossierPanel key="provider-forwardable-setup-dossier-panel" />,
      <RestaurantAdvancedAudit key="restaurant-advanced-audit" />,
      <RestaurantRunnerMissionTimelinePanel key="runner-mission-timeline-panel" />,
    ];

    const html = pages.map(page => renderToStaticMarkup(page)).join('\n');

    expect(html).toContain('今日门店任务控制台');
    expect(html).toContain('今天该做哪件事：先把一道主推菜变成可审核工单');
    expect(html).toContain('任务、负责人、证据、状态和下一步');
    expect(html).toContain('生成今日门店工单');
    expect(html).toContain('到店场景 / 今天理由');
    expect(html).toContain('优惠边界');
    expect(html).toContain('素材现状');
    expect(html).toContain('今天先定一道菜');
    expect(html).toContain('今天先出一组内容');
    expect(html).toContain('今天先留一条凭证');
    expect(html).toContain('当前内部可完成');
    expect(html).toContain('生成门店任务表、卖点诊断、内容草稿和店长跟进清单');
    expect(html).toContain('当前能跑 / 还缺什么');
    expect(html).toContain('账号 / 授权 / 数据条件');
    expect(html).toContain('平台账号/商户授权未确认前，不自动发布、不读取后台、不联系顾客');
    expect(html).toContain('收银/核销/会员数据约定未确认前，不做真实经营归因');
    expect(html).toContain('视频试跑通道回执未验收前，不能说已有成片');
    expect(html).toContain('1 录入');
    expect(html).toContain('2 诊断');
    expect(html).toContain('3 生成');
    expect(html).toContain('4 发布凭证');
    expect(html).toContain('5 回收');
    expect(html).toContain('6 复盘');
    expect(html).toContain('录入门店任务');
    expect(html).toContain('判断今天卖点');
    expect(html).toContain('生成可审内容');
    expect(html).toContain('安排渠道凭证');
    expect(html).toContain('回收到店信号');
    expect(html).toContain('给下一轮动作');

    expect(html).toContain('餐饮');
    expect(html).toContain('门店');
    expect(html).toContain('菜品');
    expect(html).toContain('今天先跑一张门店经营工单');
    expect(html).toContain('门店今天就能试跑');
    expect(html).toContain('本地门店试跑入口');
    expect(html).toContain('href="#restaurant-trial-spine"');
    expect(html).toContain('id="restaurant-trial-spine"');
    expect(html).toContain('今日任务包');
    expect(html).toContain('证据回执');
    expect(html).toContain('餐饮内容交付包');
    expect(html).toContain('餐饮探店短视频交付包');
    expect(html).toContain('视频生产护照');
    expect(html).toContain('脚本、素材、剪辑、成片、审核和发布证明在一张表里');
    expect(html).toContain('这不是成片生成按钮');
    expect(html).toContain('负责人待办');
    expect(html).toContain('没有外部视频通道资料和成片凭证，不说视频已经完成。');
    expect(html).toContain('补充镜头素材');
    expect(html).toContain('发布证明');
    expect(html).toContain('店长审核');
    expect(html).toContain('经营汇总');
    expect(html).toContain('发布凭证清单');
    expect(html).toContain('发布凭证账本');
    expect(html).toContain('每个渠道都要留下负责人、时间、链接或截图');
    expect(html).toContain('没有账号确认和凭证回填时，只生成排期和待补清单，不说已经发出。');
    expect(html).toContain('负责人：运营 · 时间：今天 17:30');
    expect(html).toContain('下一步：缺发布链接或截图凭证');
    expect(html).toContain('回流只看脱敏汇总：预约、券领取、咨询、评价和到店意向');
    expect(html).toContain('不保存顾客身份、聊天原文、券码、订单和收银明细');
    expect(html).toContain('老板版下一轮复盘');
    expect(html).toContain('复盘只引用发布凭证账本和脱敏回流');
    expect(html).toContain('暂停放大');
    expect(html).toContain('下一轮推什么');
    expect(html).toContain('卖点怎么改');
    expect(html).toContain('先补什么素材');
    expect(html).toContain('证据来源');
    expect(html).toContain('发布凭证账本：已收 0/3；脱敏回流：3 行。');
    expect(html).toContain('负责人下一步');
    expect(html).toContain('放大前必须补齐发布凭证和脱敏回流');
    expect(html).toContain('老板复盘摘要');
    expect(html).toContain('这里把发布证明、脱敏反馈和负责人下一步收在一起');
    expect(html).toContain('下一轮推什么');
    expect(html).toContain('卖点调整');
    expect(html).toContain('补证据');
    expect(html).toContain('导入预约、券领取、咨询、评价和到店意向的脱敏汇总表。');
    expect(html).toContain('补一份只含聚合数量的到店反馈表。');
    expect(html).toContain('可转发摘要');
    expect(html).toContain('给老板/店长的一页复盘');
    expect(html).toContain('可以直接复制到微信或会议纪要');
    expect(html).toContain('Markdown 摘要');
    expect(html).toContain('转发前仍需店长确认');
    expect(html).toContain('不包含顾客身份、私信原文、券码、订单和收银明细');
    expect(html).toContain('电话接待门禁');
    expect(html).toContain('订位、点餐、菜单问答先做员工审核草稿');
    expect(html).toContain('参考 Slang / ConverseNow / Square Voice AI 的前厅能力');
    expect(html).toContain('待补电话和数据条件');
    expect(html).toContain('前厅 SOP 摘要');
    expect(html).toContain('给店长/前厅的可转发摘要');
    expect(html).toContain('必须转给员工');
    expect(html).toContain('只用于员工审核和前厅交接');
    expect(html).toContain('菜单问答');
    expect(html).toContain('订位/排队');
    expect(html).toContain('点餐草稿');
    expect(html).toContain('没有电话接入、菜单字段、收银和支付约定，不说已经能接真实来电、写入订单或收款。');
    expect(html).toContain('菜品成本/库存样表');
    expect(html).toContain('参考 MarketMan 的库存、订货、菜品成本、毛利和浪费控制');
    expect(html).toContain('主推菜的原料、库存、补货线和损耗交给负责人复核');
    expect(html).toContain('待补经营汇总约定');
    expect(html).toContain('可粘贴表格模板');
    expect(html).toContain('成本/库存安全导入演练');
    expect(html).toContain('先在本地检查字段、有效行、问题行和负责人问题');
    expect(html).toContain('填入样板');
    expect(html).toContain('检查结果');
    expect(html).toContain('菜品/套餐');
    expect(html).toContain('计划用量');
    expect(html).toContain('只贴菜品、原料、库存、补货线、成本、损耗和证据');
    expect(html).toContain('没有销售、库存、采购和财务汇总约定，不写真实毛利或库存优化结论。');
    expect(html).toContain('先看今天能做啥');
    expect(html).toContain('直接告诉老板今天能先做哪几件事');
    expect(html).toContain('生成试跑工单');
    expect(html).toContain('补缺的资料');
    expect(html).toContain('不用等账号配置，先列出还差哪些截图或表格');
    expect(html).toContain('看回收结果');
    expect(html).toContain('不承诺爆单，只跑清楚第一轮');
    expect(html).toContain('第一次使用，只走 3 步');
    expect(html).toContain('1 家门店、1 个爆品、1 个到店理由。');
    expect(html).toContain('开跑前 30 秒检查');
    expect(html).toContain('缺账号、授权或经营汇总表就停在待补资料');
    expect(html).toContain('7 分钟现场演示路径');
    expect(html).toContain('2 分钟填门店和主推套餐');
    expect(html).toContain('结束后回填凭证、负责人和停止线');
    expect(html).toContain('现场永远不说');
    expect(html).toContain('只说今天能做什么、需要补什么、谁负责、凭证在哪里');
    expect(html).toContain('填门店和本次活动');
    expect(html).toContain('生成今天能执行的方案');
    expect(html).toContain('交给店长跟进');
    expect(html).toContain('门店试跑主流程');
    expect(html).toContain('五段试跑主链路');
    expect(html).toContain('试跑输入 -&gt; 标准交付包 -&gt; 内容素材生产 -&gt; 发布凭证 -&gt; 店长跟进');
    expect(html).toContain('试跑输入');
    expect(html).toContain('标准交付包');
    expect(html).toContain('内容/素材生产');
    expect(html).toContain('发布凭证');
    expect(html).toContain('线索/店长跟进');
    expect(html).toContain('凭证槽');
    expect(html).toContain('跟进任务');
    expect(html).toContain('内部产包、凭证槽和任务队列先跑通');
    expect(html).toContain('确认账号后再回填凭证步骤');
    expect(html).toContain('读取平台或发布之前，先拿到店长确认的授权范围。');
    expect(html).toContain('store-trial-workbench');
    expect(html).toContain('老板先看一张工单，高级工具放下面。');
    expect(html).toContain('竞品能力转成 Wenai 模块');
    expect(html).toContain('不是堆竞品名，而是每项都有负责人、证据和停止线');
    expect(html).toContain('今日门店任务');
    expect(html).toContain('到店理由诊断');
    expect(html).toContain('内容生产任务链');
    expect(html).toContain('发布凭证看板');
    expect(html).toContain('电话接待门禁');
    expect(html).toContain('菜品成本/库存复核');
    expect(html).toContain('没有账号确认和发布凭证，不说平台已经发出。');
    expect(html).toContain('没有销售、库存、采购和财务汇总约定，不写真实毛利或库存优化结论。');
    expect(html).toContain('门店打法素材');
    expect(html).toContain('把门店打法素材变成这家店可先准备的本地任务');
    expect(html).toContain('本地可先准备');
    expect(html).toContain('待训练');
    expect(html).toContain('待补资料');
    expect(html).toContain('训练：');
    expect(html).toContain('账号资料：补齐账号、截图或经营表格后解锁');
    expect(html).toContain('试用路径');
    expect(html).toContain('填门店任务');
    expect(html).toContain('生成今日工单');
    expect(html).toContain('补缺的资料');
    expect(html).toContain('门店试跑场景，即刻体验');
    expect(html).toContain('菜单定价与结构分析');
    expect(html).toContain('外卖活动方案设计');
    expect(html).toContain('财务报表解读与诊断');
    expect(html).toContain('把确认过的门店经验记下来');
    expect(html).toContain('深度分层记忆');
    expect(html).toContain('样例安全隔离');
    expect(html).toContain('上线前需要准备');
    expect(html).toContain('公开资料和门店素材');
    expect(html).toContain('门店打法训练与资料补齐矩阵');
    expect(html).toContain('跨平台经营问答');
    expect(html).toContain('发布执行与回执');
    expect(html).toContain('线索承接与社群跟进');
    expect(html).toContain('核销与经营汇总复盘');
    expect(html).toContain('需要训练材料');
    expect(html).toContain('账号和权限');
    expect(html).toContain('复核标准');
    expect(html).toContain('工单 / 素材 / 检查项');
    expect(html).toContain('执行边界');
    expect(html).toContain('生成经营数据规则');
    expect(html).toContain('补资料包');
    expect(html).toContain('交付包');
    expect(html).toContain('复核字段');
    expect(html).toContain('导出摘要');
    expect(html).toContain('试跑补资料向导');
    expect(html).toContain('受控试跑');
    expect(html).toContain('试跑时间线');
    expect(html).toContain('今天这张门店工单');
    expect(html).toContain('把活动、内容、发布凭证和店长跟进排成一张待复核清单');
    expect(html).toContain('试跑事项清单');
    expect(html).toContain('老板先看今天能做什么，内部再看资料和凭证是否待复核');
    expect(html).toContain('门店工单主控台');
    expect(html).toContain('先跑一张受控试单，再看凭证、跟进和还缺什么资料');
    expect(html).toContain('已回填凭证');
    expect(html).toContain('待补资料');
    expect(html).toContain('渠道回收');
    expect(html).toContain('门店指令拆解');
    expect(html).toContain('一句店长的话，拆成内部动作、发布凭证和待补资料');
    expect(html).toContain('生成今日工单');
    expect(html).toContain('拆解门店指令');
    expect(html).toContain('生成经营计划');
    expect(html).toContain('内部高级工具');
    expect(html).toContain('试跑路径判断');
    expect(html).toContain('账号、授权和回执齐了再接通');
    expect(html).toContain('打法总览台');
    expect(html).toContain('本地可先准备、训练材料与待补资料');
    expect(html).toContain('生成打法总览');
    expect(html).toContain('门店工单台');
    expect(html).toContain('选一个门店任务，拿一个待复核任务包');
    expect(html).toContain('内容上新包');
    expect(html).toContain('私域跟进包');
    expect(html).toContain('券码与收银汇总包');
    expect(html).toContain('交接治理包');
    expect(html).toContain('打开门店工单');
    expect(html).toContain('公开情报简报');
    expect(html).toContain('门店事实、本地平台、素材缺口');
    expect(html).toContain('导入公开门店资料');
    expect(html).toContain('账号和资料补齐向导');
    expect(html).toContain('账号确认、店长授权、员工通道、经营表格');
    expect(html).toContain('生成补资料向导');
    expect(html).toContain('保存补资料状态');
    expect(html).toContain('账号和资料复核');
    expect(html).toContain('检查账号资料条件');
    expect(html).toContain('员工通道清单');
    expect(html).toContain('对话指令、定时任务、待补资料');
    expect(html).toContain('生成员工通道清单');
    expect(html).toContain('尝试员工送达');
    expect(html).toContain('运行到期任务');
    expect(html).toContain('员工收件箱');
    expect(html).toContain('Wenai 门店操作员');
    expect(html).toContain('先跑一张受控试单，再看凭证、跟进和还缺什么资料');
    expect(html).toContain('运行试跑');
    expect(html).toContain('打开时间线');
    expect(html).toContain('查看补资料条件');
    expect(html).toContain('今日店长任务');
    expect(html).toContain('生成任务包');
    expect(html).toContain('等待回执复核');
    expect(html).toContain('刷新中心');
    expect(html).toContain('门店指挥中心');
    expect(html).toContain('今日门店工单');
    expect(html).toContain('店总指挥台');
    expect(html).toContain('开班指令');
    expect(html).toContain('本地任务队列');
    expect(html).toContain('班次任务检查');
    expect(html).toContain('跑完整班次循环');
    expect(html).toContain('运行班次任务检查');
    expect(html).toContain('生成试跑交接');
    expect(html).toContain('检查样例复核');
    expect(html).toContain('生成首轮交接复核');
    expect(html).toContain('交接班次样例试跑');
    expect(html).toContain('收尾并训练');
    expect(html).toContain('记录训练');
    expect(html).toContain('激活包');
    expect(html).toContain('当前队列');
    expect(html).toContain('下次唤醒');
    expect(html).toContain('对标路线判断');
    expect(html).toContain('生成路线判断');
    expect(html).toContain('工作台主链 + 任务体验 + 通道/数据约定');
    expect(html).toContain('最终试跑形态');
    expect(html).toContain('外部动作只表达为试跑交接通道');
    expect(html).toContain('操作层');
    expect(html).toContain('补资料条件');
    expect(html).toContain('不展示底层代号');
    expect(html).toContain('页面体验');
    expect(html).toContain('竞品对照板');
    expect(html).toContain('隔离试跑通道');
    expect(html).toContain('发布凭证');
    expect(html).toContain('线索承接');
    expect(html).toContain('券码核销');
    expect(html).toContain('经营复盘');
    expect(html).toContain('门店记忆跟进');
    expect(html).toContain('本地能做');
    expect(html).toContain('还需账号资料');
    expect(html).toContain('常驻店员循环');
    expect(html).toContain('早班简报');
    expect(html).toContain('服务时段巡视');
    expect(html).toContain('收尾记忆');
    expect(html).toContain('运行跟进检查');
    expect(html).toContain('已巡视班次');
    expect(html).toContain('任务唤醒');
    expect(html).toContain('生成员工通道清单');
    expect(html).toContain('生成门店记忆包');
    expect(html).toContain('客户经营路径');
    expect(html).toContain('第一次试跑路径');
    expect(html).toContain('先跑一张门店工单，再看高级工具');
    expect(html).toContain('点击一次生成门店简报');
    expect(html).toContain('从这里开始');
    expect(html).toContain('生成第一张工单');
    expect(html).toContain('任务执行包');
    expect(html).toContain('负责人队列');
    expect(html).toContain('店长交接');
    expect(html).toContain('补资料条件');
    expect(html).toContain('需要店长确认');
    expect(html).toContain('交接解锁表');
    expect(html).toContain('门店任务助手首页');
    expect(html).toContain('老板先看一张工单，高级工具放下面。');
    expect(html).toContain('生成门店建议');
    expect(html).toContain('待补资料');
    expect(html).toContain('店长待复核简报');
    expect(html).toContain('一页交接给店长、运营和技术复核。');
    expect(html).toContain('店长转发文案');
    expect(html).toContain('没有待复核凭证，不承诺试跑交接待复核。');
    expect(html).toContain('只有账号确认、回填凭证、经营汇总和数据边界都补齐并复核');
    expect(html).toContain('补资料清单');
    expect(html).toContain('第一张工单会同时生成账号确认、资料补齐和签收清单。');
    expect(html).toContain('待补条件');
    expect(html).toContain('服务端配置项');
    expect(html).toContain('领券数');
    expect(html).toContain('到店核销数');
    expect(html).toContain('签收项');
    expect(html).toContain('店长交接文案');
    expect(html).toContain('负责人签收队列');
    expect(html).toContain('回执和导出摘要');
    expect(html).toContain('点击后生成交接待复核回执模板。');
    expect(html).toContain('待复核回执');
    expect(html).toContain('授权待复核');
    expect(html).toContain('回执待复核');
    expect(html).toContain('待复核计划');
    expect(html).toContain('待回填公开链接');
    expect(html).toContain('签名回执待复核');
    expect(html).toContain('点击后生成交接文档和表格');
    expect(html).toContain('工单准备快照');
    expect(html).toContain('现在先跑本地工单，账号资料和回执补齐并复核后再交接。');
    expect(html).toContain('可先准备');
    expect(html).toContain('可先准备');
    expect(html).toContain('资料复核');
    expect(html).toContain('待补账号');
    expect(html).toContain('待补数据');
    expect(html).toContain('本地试跑回执');
    expect(html).toContain('第一张工单会同时生成一份本地试跑回执。');
    expect(html).toContain('回执');
    expect(html).toContain('试跑回执状态');
    expect(html).toContain('经营信号');
    expect(html).toContain('受控试跑执行');
    expect(html).toContain('第一张工单会先准备受控试跑操作清单，账号资料补齐并复核后再交接。');
    expect(html).toContain('待复核动作');
    expect(html).toContain('执行循环');
    expect(html).toContain('下一步试跑动作');
    expect(html).toContain('发布任务收件箱');
    expect(html).toContain('第一张工单会把发布、受控试跑、回执、异常恢复和门店记忆整理成一个执行队列。');
    expect(html).toContain('发布凭证');
    expect(html).toContain('试跑执行');
    expect(html).toContain('交接复核工作台');
    expect(html).toContain('第一张工单会把账号确认、店长授权、隔离试跑环境、回填凭证、数据边界和试跑回执整理成复核清单。');
    expect(html).toContain('交接资料');
    expect(html).toContain('资料复核阶梯');
    expect(html).toContain('账号资料补齐指南');
    expect(html).toContain('补资料清单会按负责人、要补什么、解锁什么、凭证和停止线整理给店长。');
    expect(html).toContain('已脱敏:');
    expect(html).toContain('第一次试跑路径会明确标出哪些事项本地可先准备，哪些还需要账号、授权或回执。');
    expect(html).toContain('交接复核');
    expect(html).toContain('待补资料');
    expect(html).toContain('常驻门店任务板');
    expect(html).toContain('第一张工单会打开今日任务板：任务主控、营业节奏、记忆提醒和待补资料。');
    expect(html).toContain('记忆提醒');
    expect(html).toContain('门店试跑覆盖图');
    expect(html).toContain('默认路径覆盖门店经营任务面：公开主页、内容、发布凭证、线索承接、券码核销和经营复盘。');
    expect(html).toContain('待补账号资料');
    expect(html).toContain('试点顺序');
    expect(html).toContain('门店数据导入中心');
    expect(html).toContain('默认路径已对齐门店经营数据源：公开主页、发布凭证、预约、券码核销、收银销售、会员、库存和毛利。');
    expect(html).toContain('缺必填');
    expect(html).toContain('线索收件箱');
    expect(html).toContain('默认路径把预约、领券、私域咨询、到店意向和差评挽回收进一个受控线索队列。');
    expect(html).toContain('线索承接');
    expect(html).toContain('顾客触达');
    expect(html).toContain('线索承接工作台');
    expect(html).toContain('默认路径把线索承接变成可复核的试跑交接路径，覆盖预约、领券、私域咨询、到店意向和差评挽回。');
    expect(html).toContain('线索承接回执');
    expect(html).toContain('线索样例复核流');
    expect(html).toContain('试跑交接有一条受控路径：脱敏任务包、线索确认回执、异常回执恢复、员工审核和只进汇总的记忆门槛。');
    expect(html).toContain('仅在待复核回执后写入脱敏汇总记忆');
    expect(html).toContain('今日指挥台');
    expect(html).toContain('默认路径把门店经营面收成四条链路：到店线索、发布凭证、核销/收银、复盘/训练。');
    expect(html).toContain('仅在待复核凭证或脱敏汇总后写入台账');
    expect(html).toContain('试跑交接约定包');
    expect(html).toContain('试跑交接拆成六份约定：试跑通道、平台凭证、线索承接、员工下发、收银核销和复盘助手。');
    expect(html).toContain('账号安全：只允许服务端安全保存；页面不展示、不收集账号配置值。');
    expect(html).toContain('门店操作台分区');
    expect(html).toContain('默认路径最终落在一个操作台，今日运营、经营建议复核、试跑交接准备和凭证复核。');
    expect(html).toContain('每日执行清单');
    expect(html).toContain('预约核销收尾闭环');
    expect(html).toContain('默认路径把预约和领券闭环到收银汇总导入、核销复盘和下一班动作。');
    expect(html).toContain('下一班动作');
    expect(html).toContain('口碑与服务恢复闭环');
    expect(html).toContain('公开评价、评论主题和服务问题会变成店长审核的回复、恢复任务和下一轮内容。');
    expect(html).toContain('回评交接');
    expect(html).toContain('服务恢复');
    expect(html).toContain('客户默认只走 6 步');
    expect(html).toContain('1 导入门店');
    expect(html).toContain('2 受控试跑');
    expect(html).toContain('3 刷新主控台');
    expect(html).toContain('4 时间线');
    expect(html).toContain('5 店长跟进');
    expect(html).toContain('生成任务和话术');
    expect(html).toContain('6 账号资料缺口');
    expect(html).toContain('内部工具列表，老板可先跳过');
    expect(html).toContain('门店启动资料包');
    expect(html).toContain('发布链接');
    expect(html).toContain('到店跟进');
    expect(html).toContain('试跑事项清单');
    expect(html).toContain('老板可见');
    expect(html).toContain('发布凭证');
    expect(html).toContain('门店记忆');
    expect(html).toContain('店长跟进');
    expect(html).toContain('账号确认');
    expect(html).toContain('没确认前只生成操作清单，不冒充已执行。');
    expect(html).toContain('接入检查 1');
    expect(html).toContain('给运营和技术复核使用：确认这类试跑交接现在是本地可准备、待补资料，还是必须人工交接。');
    expect(html).toContain('老板只需要看上面的发布凭证、门店记忆、店长跟进和账号确认。');
    expect(html).toContain('跟进助手');
    expect(html).toContain('带授权范围、隔离会话、签名回执和停止条件的交接资料包');
    expect(html).toContain('酸菜鱼双人餐 15 秒到店脚本');
    expect(html).toContain('双人酸菜鱼晚餐到店活动');
    expect(html).toContain('写入菜品素材');
    expect(html).toContain('写入发布安排');

    for (const term of oldSurfaceTerms) {
      expect(html).not.toContain(term);
    }

    for (const term of engineeringSurfaceTerms) {
      const leakedAt = html.indexOf(term);
      const nearbyHtml = leakedAt >= 0 ? html.slice(Math.max(0, leakedAt - 160), leakedAt + term.length + 160) : '';
      expect(leakedAt, `engineering term leaked to restaurant surface: ${term}\n${nearbyHtml}`).toBe(-1);
    }
  });

  it('wraps provider handoff internals before rendering child panels', () => {
    const receiptHtml = renderToStaticMarkup(
      <RestaurantProviderReceiptAcceptancePanel
        consoleData={{
          run: { runId: 'run-raw-provider-001' },
          verdict: 'blocked-before-dispatch',
          summary: {
            checks: 2,
            ready: 0,
            waiting: 1,
            blocked: 1,
            acceptedReceipts: 0,
            canTrainNextRun: false,
            canClaimExternalAutomation: false,
          },
          validationChecks: [
            {
              id: 'run-id',
              status: 'blocked',
              owner: 'provider',
              evidence: ['eventId', 'externalRunId', 'provider error code'],
              nextAction: 'Wait for signed external-receipt before memory write.',
            },
          ],
          callbackContract: {
            action: 'external-receipt',
            requiredHeader: 'x-restaurant-agent-signature',
          },
          closeoutTraining: {
            memoryWriteAllowed: false,
            forbiddenWrites: ['cookies', 'private-message text', 'raw POS rows', 'signed lead receipt'],
          },
        } as unknown as RestaurantProviderReceiptAcceptanceConsole}
      />,
    );

    const dossierHtml = renderToStaticMarkup(
      <RestaurantProviderForwardableSetupDossierPanel
        dossier={{
          firstLiveRunContract: {
            launchVerdict: 'blocked-before-launch',
            callbackHeader: 'x-restaurant-agent-signature',
          },
          summary: {
            packets: 1,
            p0Items: 1,
            providerEnvKeys: 2,
            merchantSignoffs: 0,
            dataContracts: 0,
            canStartLiveProviderNow: false,
            canClaimExternalAutomation: false,
          },
          packets: [
            {
              id: 'runtime-provider',
              title: 'Provider runtime setup',
              sendTo: 'runtime-admin',
              asks: ['RESTAURANT_AGENT_OPENCLAW_RUNTIME_URL', 'server-env-or-secret-manager-only', 'POST /tasks'],
              evidenceRequired: ['x-restaurant-agent-signature', '/health', '/events'],
              firstMessage: 'provider key stays server-side.',
            },
          ],
          exportDigest: {
            markdown: 'RESTAURANT_AGENT_HERMES_API_KEY and endpoint stay server-env-or-secret-manager-only',
          },
          envTemplate: [{ key: 'RESTAURANT_AGENT_OPENCLAW_API_KEY', value: '<server-side-only>' }],
        } as unknown as RestaurantProviderForwardableSetupDossier}
      />,
    );

    const html = `${receiptHtml}\n${dossierHtml}`;
    expect(html).toContain('线索确认回执');
    expect(html).toContain('签名回执规则');
    expect(html).toContain('仅服务端安全保存');

    for (const term of [
      'RESTAURANT_AGENT_',
      'x-restaurant-agent-signature',
      'external-receipt',
      'server-env-or-secret-manager-only',
      'POST /tasks',
      '/health',
      '/events',
      'eventId',
      'externalRunId',
      'provider error code',
      'Provider runtime setup',
      'runtime-admin',
      'signed external-receipt',
      'signed lead receipt',
      'private-message text',
      'raw POS rows',
      'cookies',
    ]) {
      expect(html).not.toContain(term);
    }
  });

  it('carries the restaurant intake through the trial workflow links', async () => {
    const searchParams = Promise.resolve({
      variant: 'friend_trial',
      restaurant: '北城面馆',
      offer: '番茄牛腩面套餐',
      audience: '附近写字楼午餐客',
      channels: '大众点评 / 微信社群',
      visitReason: '午餐快出餐',
      constraints: '不写最低价',
      evidence: '菜单截图已确认',
    });

    const overviewHtml = renderToStaticMarkup(await FactoryPage({ searchParams }));
    const createHtml = renderToStaticMarkup(await CreateFactoryPage({ searchParams }));
    const manageHtml = renderToStaticMarkup(await ManageFactoryPage({ searchParams }));
    const combinedHtml = `${overviewHtml}\n${createHtml}\n${manageHtml}`;

    expect(overviewHtml).toContain('生成试跑工作流');
    expect(overviewHtml).toContain('北城面馆');
    expect(overviewHtml).toContain('番茄牛腩面套餐');
    expect(overviewHtml).toContain('附近写字楼午餐客');
    expect(overviewHtml).toContain('大众点评 / 微信社群');
    expect(overviewHtml).toContain('门店试跑主流程');
    expect(overviewHtml).toContain('试跑输入 -&gt; 标准交付包 -&gt; 内容素材生产 -&gt; 发布凭证 -&gt; 店长跟进');
    expect(overviewHtml).toContain('凭证槽');
    expect(overviewHtml).toContain('跟进任务');
    expect(combinedHtml).toContain('北城面馆');
    expect(combinedHtml).toContain('番茄牛腩面套餐');
    expect(combinedHtml).toContain('附近写字楼午餐客');
    expect(combinedHtml).toContain('午餐快出餐');
    expect(combinedHtml).toContain('不写最低价');
    expect(combinedHtml).toContain('菜单截图已确认');
    expect(combinedHtml).toContain('restaurant=%E5%8C%97%E5%9F%8E%E9%9D%A2%E9%A6%86');
    expect(combinedHtml).toContain('offer=%E7%95%AA%E8%8C%84%E7%89%9B%E8%85%A9%E9%9D%A2%E5%A5%97%E9%A4%90');
    expect(createHtml).toContain('action="/factory/video"');
  });
});

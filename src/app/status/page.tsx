'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latencyMs?: number;
  note?: string;
}

interface HealthResponse {
  overall: 'operational' | 'degraded' | 'down';
  services: ServiceStatus[];
  timestamp: string;
  uptime: number | null;
}

interface ReadinessIssue {
  priority: 'P0' | 'P1' | 'P2';
  title: string;
  evidence: string;
  fix: string;
}

interface ReadinessFeature {
  name: string;
  status: 'implemented' | 'partial' | 'missing' | 'pseudo';
  evidence: string;
  risk: 'high' | 'medium' | 'low';
  fix: string;
}

interface ReadinessWorkflow {
  name: string;
  ok: boolean;
  evidence: string;
  fix?: string;
}

interface ExternalIntegrationRequirement {
  id: string;
  category:
    | 'video_provider'
    | 'video_analysis'
    | 'platform_oauth'
    | 'ad_delivery'
    | 'auto_publish'
    | 'analytics_sync'
    | 'asset_cloud'
    | 'scale_claims';
  label: string;
  status: 'configured' | 'missing' | 'evidence_required';
  owner: 'user' | 'provider' | 'wenai';
  materialPriority?: 'P0' | 'P1';
  unlocks?: string;
  blockedGate?: string;
  missingImpact?: string;
  operatorAction?: string;
  evidence: string;
  requiredInputs: string[];
  acceptance: string;
  acceptanceEvidence?: string;
  securityBoundary?: string;
  releaseChecks?: string[];
}

interface ScaleClaimGuard {
  label: string;
  requestedBenchmark: string;
  canDisplay: boolean;
  evidence: string;
  requiredEvidence: string[];
  auditGates?: {
    label: string;
    ready: boolean;
    severity: 'P0' | 'P1';
    evidence: string;
    action: string;
  }[];
}

interface ProductCapabilityLayer {
  id: 'Compose' | 'Create' | 'Cut' | 'Cast' | 'Manage';
  target: string;
  currentStatus: ReadinessFeature['status'];
  internalCapability: string;
  externalGate: string;
  stopLine: string;
  evidence: string;
}

interface AlternativeCompetitorReference {
  name: string;
  pattern: string;
  wenaiDecision: string;
  boundary: string;
}

interface ProductUiVariantGuide {
  id: 'partner' | 'operator' | 'friend_trial';
  label: string;
  audience: string;
  firstScreen: string;
  primaryAction: string;
  stopLine: string;
}

interface ReadinessResponse {
  projectId?: string;
  report: {
    verdict: 'pass' | 'conditional' | 'fail';
    label: string;
    score: number;
    productBlueprint?: ProductCapabilityLayer[];
    alternativeReferences?: AlternativeCompetitorReference[];
    uiVariants?: ProductUiVariantGuide[];
    features: ReadinessFeature[];
    workflows: ReadinessWorkflow[];
    issues: ReadinessIssue[];
    friendTrialRisks: ReadinessIssue[];
    externalRequirements: ExternalIntegrationRequirement[];
    materialGateSummary?: {
      total: number;
      configured: number;
      missingP0: number;
      missingP1: number;
      evidenceRequired: number;
      blocksCommercialLaunch: boolean;
      nextMaterialPacks: string[];
      evidence: string;
    };
    scaleClaimGuards: ScaleClaimGuard[];
    projectReadiness?: {
      verdict: 'pass' | 'conditional' | 'fail';
      score: number;
      evidence: string[];
      missingLinks: string[];
      nextActions: string[];
    };
  };
}

interface IndustrialActionItem {
  id: string;
  priority: 'P0' | 'P1' | 'P2';
  owner: string;
  title: string;
  evidence: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PATCH';
  acceptance: string;
}

interface ActionQueueResponse {
  projectId: string;
  actionCount: number;
  actions: IndustrialActionItem[];
}

interface AssetPermissionAccessAudit {
  id: string;
  assetId: string;
  action: 'view' | 'download' | 'share' | 'approve' | 'publish';
  role?: string;
  actor: string;
  operation: string;
  allowed: boolean;
  reason: string;
  createdAt: string;
}

interface AssetPermissionResponse {
  projectId: string;
  accessAudits: AssetPermissionAccessAudit[];
}

const STATUS_META = {
  operational: { label: '正常', color: 'text-success', bg: 'bg-success/10', border: 'border-success/30', dot: 'bg-success' },
  degraded: { label: '降级', color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/30', dot: 'bg-accent' },
  down: { label: '中断', color: 'text-error', bg: 'bg-error/10', border: 'border-error/30', dot: 'bg-error' },
};

const FEATURE_STATUS_LABELS: Record<ReadinessFeature['status'], string> = {
  implemented: '已实现',
  partial: '部分实现',
  missing: '未实现',
  pseudo: '伪功能风险',
};

const FEATURE_NAME_LABELS: Record<string, string> = {
  '10 SKU POC intake and standard-pack routing': '10 SKU 线索与标准包',
  'CRM-lite commercial loop': 'CRM 商务闭环',
  'Enterprise asset permissions ledger': '企业资产权限台账',
  'Client review token portal': '客户免登录审核门户',
  'Brand learning profile': '品牌学习档案',
  'Creative monitoring watchlist': '创意监控清单',
  'Creative intelligence ledger': '创意洞察台账',
  'Channel account matrix ledger': '矩阵账号台账',
  'Kuaizi production connector': '筷子生产连接器',
  'Image production': '图片生产',
  'AI video production': 'AI 视频生产',
  'Creative insight / video teardown': '视频拆解与创意洞察',
  'Industrial asset and distribution store': '资产库与分发计划',
  'Full-chain commerce orchestration': '全链路商业编排',
  'Performance feedback import': '表现回流导入',
  'Distribution and ad authorization': '分发与广告授权',
  'Platform connector automation ledger': '平台自动化连接台账',
  'Enterprise cloud asset management': '企业云资产管理',
  'Account and permission system': '账号与权限体系',
};

export function formatReadinessFeatureName(name: string) {
  return FEATURE_NAME_LABELS[name] || name;
}

const VERDICT_LABELS: Record<'pass' | 'conditional' | 'fail', string> = {
  pass: '通过',
  conditional: '有条件通过',
  fail: '不通过',
};

const EXTERNAL_REQUIREMENT_STATUS_LABELS: Record<ExternalIntegrationRequirement['status'], string> = {
  configured: '已接入',
  missing: '等待外部接入',
  evidence_required: '需要审计证据',
};

const EXTERNAL_REQUIREMENT_OWNER_LABELS: Record<ExternalIntegrationRequirement['owner'], string> = {
  user: '你统一提供',
  provider: '服务商提供',
  wenai: 'Wenai 内部完成',
};

const EXTERNAL_REQUIREMENT_CATEGORY_LABELS: Record<ExternalIntegrationRequirement['category'], string> = {
  video_provider: '视频生成/剪辑',
  video_analysis: 'AI 视频分析',
  platform_oauth: '多平台 OAuth',
  ad_delivery: '广告投放',
  auto_publish: '自动发布/矩阵分发',
  analytics_sync: '平台数据同步',
  asset_cloud: '企业云资产',
  scale_claims: '规模化数字',
};

export function formatExternalRequirementStatus(status: ExternalIntegrationRequirement['status']) {
  return EXTERNAL_REQUIREMENT_STATUS_LABELS[status];
}

export function formatExternalRequirementOwner(owner: ExternalIntegrationRequirement['owner']) {
  return EXTERNAL_REQUIREMENT_OWNER_LABELS[owner];
}

export function formatExternalRequirementCategory(category: ExternalIntegrationRequirement['category']) {
  return EXTERNAL_REQUIREMENT_CATEGORY_LABELS[category];
}

const PROJECT_EVIDENCE_LABELS: Record<string, string> = {
  assets: '资产总数',
  reportAssets: '报告资产',
  approvedAssets: '已批准资产',
  reusableAssets: '可复用资产',
  assetGovernanceIssues: '资产治理问题',
  deliverableAssets: '交付资产',
  clientReviewAssets: '客户审核中',
  approvedDeliverables: '已批准交付',
  revisionRequested: '请求修改',
  deliveryIssues: '交付问题',
  blockedAssets: '阻塞资产',
  rightsIssueAssets: '版权风险资产',
  plans: '分发计划',
  draftPlans: '草稿计划',
  nextRoundAssetPlans: '下轮资产计划',
  readyPlans: '就绪计划',
  dispatches: '执行记录',
  publishedDispatches: '已发布记录',
  publishedWithEvidence: '发布证据',
  missingPublishEvidence: '缺发布证据',
  overdueReviews: '逾期审核',
  measuredDispatches: '已回流执行',
  performanceReturns: '表现回流',
  scaleDecisions: '放量决策',
  assetMatchIssues: '资产匹配问题',
  ambiguousAssetMatches: '模糊匹配',
  unmatchedAssets: '未匹配资产',
  creativeInsights: '创意洞察',
  creativeCompetitorAccounts: '竞品账号',
  creativeTrendRanks: '趋势榜单',
  creativeReusableAngles: '可复用角度',
  creativeOpportunities: '创意机会',
  creativeAverageConfidence: '机会平均置信度',
  creativePatternClusters: '创意打法簇',
  creativeCrossSourcePatterns: '跨来源打法',
  creativeMoatScore: '创意护城河分',
  creativeMonitors: '创意监控',
  creativeActiveMonitors: '活跃监控',
  creativeDueTasks: '待采集任务',
  creativeImportedMonitorSignals: '导入信号',
  creativeHarvestRuns: '采集运行',
  creativeHarvestedInsights: '采集洞察',
  creativeSourceSyncRuns: '采集源同步',
  creativeProviderSourceFresh: '新鲜采集源',
  creativeProviderSourceFailures: '采集源失败',
  creativeSourceSyncCoverageScore: '采集覆盖分',
  creativeSourceSyncAccountObservations: '账号观察',
  creativeSourceSyncTrendRankObservations: '榜单观察',
  creativeSourceSyncVideoTeardowns: '视频拆解观察',
  creativeSourceSyncMultimodalParsed: '多模态解析',
  creativeSourceObservations: '累计源观察',
  creativeSourceRepeatSources: '重复回流源',
  creativeSourceScaleScore: '源规模分',
  creativeReadySourceHealthCards: '健康源卡片',
  creativeAccountTrackingSourceReady: '账号源就绪',
  creativeTrendRankSourceReady: '榜单源就绪',
  creativeVideoTeardownSourceReady: '视频源就绪',
  channelAccounts: '矩阵账号',
  channelConnectedAccounts: '已授权账号',
  channelHealthyAccounts: '健康账号',
  channelAvailableSlots: '可排期档位',
  channelAdCampaigns: '广告活动',
  channelReadyAdCampaigns: '就绪广告',
  channelActiveAdCampaigns: '投放中广告',
  channelMeasuredAdCampaigns: '已回流广告',
  channelAdBudgetCents: '广告预算分',
  channelAdSpendCents: '广告花费分',
  channelAdEvidence: '广告证据',
  assetPermissionRecords: '资产权限策略',
  governedAssets: '受控资产',
  assetPermissionAuditEvents: '权限审计',
  assetPermissionAccessAuditEvents: '访问审计',
  assetSecurityPolicies: '资产安全策略',
  assetWatermarkRequired: '要求水印',
  assetWatermarkApplied: '已加水印',
  assetDlpPassedPolicies: 'DLP 通过',
  assetDlpFailedPolicies: 'DLP 失败',
  assetPublicShareBlocked: '公开分享拦截',
  assetRetentionPolicies: '留存策略',
  downloadableAssetAccessReady: '可下载资产',
  shareableAssetAccessReady: '可分享资产',
  expiredAssetPermissions: '过期权限',
  videoQueueItems: '视频任务',
  videoProviderExecutions: '视频执行',
  videoCompletedProviderExecutions: '视频完成执行',
  videoFailedProviderExecutions: '视频失败执行',
  videoRetryableProviderExecutions: '可重试视频执行',
  videoResultAssets: '视频成片',
  videoClientReviews: '视频审核',
  videoApprovedDeliverables: '视频批准',
  videoMeasured: '视频回流',
  videoAverageLoopScore: '视频闭环分',
  brandLearningCreativeSignals: '品牌创意信号',
  brandLearningPerformanceSignals: '品牌表现信号',
  brandLearningApprovedDeliverables: '品牌批准交付',
  brandLearningWinningAssets: '胜出资产',
  brandLearningRules: '品牌学习规则',
  auditedWenaiCreativeOutput: '审计创意产出',
  auditedWenaiVideoDistribution: '审计视频分发',
  auditedScalePlatformBreakdown: '审计平台拆分',
  auditedScaleEvidenceUrls: '审计证据链接',
  auditedScaleDedupeReady: '去重规则就绪',
  auditedScaleDateRangeReady: '日期范围就绪',
  auditedScaleAuditorNoteReady: '审计确认就绪',
};

export interface ProjectEvidenceMetric {
  key: string;
  label: string;
  value: string;
}

function formatEvidenceValue(key: string, rawValue: string) {
  const numericValue = Number(rawValue);
  if (Number.isFinite(numericValue) && (key.includes('Confidence') || key.includes('Score'))) {
    if (numericValue > 0 && numericValue <= 1) return `${Math.round(numericValue * 100)}%`;
    return Number.isInteger(numericValue) ? `${numericValue}` : numericValue.toFixed(1);
  }
  return rawValue || '0';
}

export function formatProjectEvidenceMetric(item: string): ProjectEvidenceMetric {
  const separatorIndex = item.indexOf('=');
  if (separatorIndex < 0) {
    return { key: 'unknown', label: '补充证据', value: item };
  }

  const key = item.slice(0, separatorIndex);
  const rawValue = item.slice(separatorIndex + 1);
  return {
    key,
    label: PROJECT_EVIDENCE_LABELS[key] || '补充证据',
    value: formatEvidenceValue(key, rawValue),
  };
}

function MaterialGateChip({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'success' | 'accent' | 'error';
}) {
  const toneClass = tone === 'success'
    ? 'border-success/30 text-success'
    : tone === 'accent'
      ? 'border-accent/30 text-accent'
      : tone === 'error'
        ? 'border-error/30 text-error'
        : 'border-border-subtle text-text-primary';
  return (
    <div className={`rounded border px-2 py-2 ${toneClass}`}>
      <div className="text-[9px] font-mono uppercase tracking-wider text-text-tertiary">{label}</div>
      <div className="mt-1 text-[14px] font-semibold">{value}</div>
    </div>
  );
}

function projectEvidenceMap(projectMaturity?: ReadinessResponse['report']['projectReadiness']) {
  const map: Record<string, number> = {};
  for (const item of projectMaturity?.evidence || []) {
    const separatorIndex = item.indexOf('=');
    if (separatorIndex < 0) continue;
    const key = item.slice(0, separatorIndex);
    const value = Number(item.slice(separatorIndex + 1));
    map[key] = Number.isFinite(value) ? value : 0;
  }
  return map;
}

function buildKuaiziCapabilityLadder(projectMaturity?: ReadinessResponse['report']['projectReadiness']) {
  const evidence = projectEvidenceMap(projectMaturity);
  return [
    {
      name: 'Compose 灵感管理',
      ok:
        (evidence.creativeMonitors || 0) > 0 &&
        (evidence.creativePatternClusters || 0) > 0 &&
        (evidence.creativeSourceSyncCoverageScore || 0) >= 100 &&
        (evidence.creativeSourceScaleScore || 0) >= 100 &&
        (evidence.creativeReadySourceHealthCards || 0) >= 3,
      evidence: `监控 ${evidence.creativeMonitors || 0} 个 / 打法簇 ${evidence.creativePatternClusters || 0} 个 / 跨来源 ${evidence.creativeCrossSourcePatterns || 0} 个 / 覆盖 ${evidence.creativeSourceSyncCoverageScore || 0} / 健康源 ${evidence.creativeReadySourceHealthCards || 0}`,
      gap: '继续接入真实榜单源、账号追踪源和全网灵感采集。',
    },
    {
      name: 'Create 一键视频',
      ok: (evidence.videoQueueItems || 0) > 0 && (evidence.videoCompletedProviderExecutions || 0) > 0,
      evidence: `视频任务 ${evidence.videoQueueItems || 0} 个 / Provider 完成 ${evidence.videoCompletedProviderExecutions || 0} 个`,
      gap: '继续接入真实视频生成 provider、批量生成 UI 和失败重试。',
    },
    {
      name: 'Cut 智能混剪',
      ok: (evidence.creativeVideoTeardownSourceReady || 0) > 0 && (evidence.videoResultAssets || 0) > 0,
      evidence: `视频拆解源 ${evidence.creativeVideoTeardownSourceReady ? '已就绪' : '未就绪'} / 成片 ${evidence.videoResultAssets || 0} 个`,
      gap: '继续补多模态解析、素材切片、批量混剪和版本对比。',
    },
    {
      name: 'Cast 多平台分发',
      ok: (evidence.channelAvailableSlots || 0) > 0 && (evidence.publishedWithEvidence || 0) > 0 && (evidence.channelReadyAdCampaigns || 0) > 0,
      evidence: `矩阵账号 ${evidence.channelAccounts || 0} 个 / 可排期 ${evidence.channelAvailableSlots || 0} 档 / 发布证据 ${evidence.publishedWithEvidence || 0} / 广告活动 ${evidence.channelAdCampaigns || 0}`,
      gap: '继续接入 OAuth、自动发布、广告账户和平台数据同步。',
    },
    {
      name: 'Manage 企业管理',
      ok:
        (evidence.assetPermissionRecords || 0) > 0 &&
        (evidence.assetPermissionAccessAuditEvents || 0) > 0 &&
        (evidence.assetSecurityPolicies || 0) > 0 &&
        (evidence.assetDlpPassedPolicies || 0) >= (evidence.assetSecurityPolicies || 0) &&
        (evidence.assetWatermarkApplied || 0) >= (evidence.assetWatermarkRequired || 0) &&
        (evidence.assetRetentionPolicies || 0) >= (evidence.assetSecurityPolicies || 0),
      evidence: `权限策略 ${evidence.assetPermissionRecords || 0} 条 / 安全策略 ${evidence.assetSecurityPolicies || 0} 条 / DLP 通过 ${evidence.assetDlpPassedPolicies || 0} 条 / 访问审计 ${evidence.assetPermissionAccessAuditEvents || 0} 条`,
      gap: '继续补对象存储、真实下载流、分享链接 enforcement、DLP 和团队空间。',
    },
  ];
}

const ASSET_ACTION_LABELS: Record<AssetPermissionAccessAudit['action'], string> = {
  view: '查看',
  download: '下载',
  share: '分享',
  approve: '批准',
  publish: '发布',
};

const ASSET_AUDIT_REASON_LABELS: Record<string, string> = {
  allowed: '已授权',
  missing_permission_record: '缺少权限策略',
  permission_expired: '权限已过期',
  action_not_allowed: '动作未授权',
  role_not_allowed: '角色未授权',
};

const ASSET_OPERATION_LABELS: Record<string, string> = {
  api_asset_access_check: '权限校验接口',
  industrial_asset_route: '资产读取',
  public_share_create: '公开分享',
  distribution_dispatch_publish: '分发发布',
};

export function formatAssetPermissionAuditEvent(event: AssetPermissionAccessAudit) {
  return {
    actionLabel: ASSET_ACTION_LABELS[event.action] || event.action,
    operationLabel: ASSET_OPERATION_LABELS[event.operation] || event.operation,
    resultLabel: event.allowed ? '允许' : '拒绝',
    reasonLabel: ASSET_AUDIT_REASON_LABELS[event.reason] || event.reason,
    actorLabel: event.actor || event.role || '系统',
  };
}

function overallLabel(status: HealthResponse['overall']) {
  if (status === 'operational') return '所有核心服务正常运行';
  if (status === 'degraded') return '部分能力降级，仍可继续排查';
  return '核心服务不可用，需要立即处理';
}

type StatusUiVariant = 'partner' | 'operator' | 'friend_trial';

function normalizeStatusUiVariantId(value?: string): StatusUiVariant {
  if (value === 'operator' || value === 'friend_trial' || value === 'partner') return value;
  return 'partner';
}

const STATUS_UI_VARIANTS: Array<{
  id: StatusUiVariant;
  label: string;
  intent: string;
  proof: string;
}> = [
  {
    id: 'partner',
    label: '合作者/投资人版',
    intent: '先看全链路产品形态、竞品差距、外部材料和不能宣称的边界。',
    proof: '用于判断 Wenai 是否值得继续接 provider、平台授权、客户试跑和商业合作；不展示未审计规模数字。',
  },
  {
    id: 'operator',
    label: '运营工作台版',
    intent: '先看可执行修复队列、项目闭环证据、平台门禁、资产权限审计和下一步 owner。',
    proof: '用于内部推进：每个 P0/P1 必须有 endpoint、method、acceptance，不能只停留在汇报。',
  },
  {
    id: 'friend_trial',
    label: '朋友试用版',
    intent: '先看是否能放心给非技术用户试用，哪些环节会困惑、卡死或需要人工解释。',
    proof: '用于朋友/客户试用前验收：只要核心链路、反馈、批准、交付边界仍需要解释，就不能说可商用无阻塞。',
  },
];

const STATUS_VARIANT_ROADMAP = [
  { step: '1', page: '/status', job: '验收台统一 partner / operator / friend_trial 三视角：分别讲商业边界、执行队列和朋友试用风险。' },
  { step: '2', page: '/factory/creative', job: '创意洞察继续加厚：突出竞品账号、榜单、视频拆解、品牌学习和 action queue。' },
  { step: '3', page: '/factory/video', job: '视频工厂继续加厚：区分内部一键视频队列和真实外部生成门禁后的成片。' },
  { step: '4', page: '/settings/kuaizi', job: '接入清单继续加厚：把 OAuth、广告账户、自动发布、云资产材料变成可执行 checklist。' },
];

const COMPETITOR_REFERENCE_RADAR = [
  {
    name: '筷子科技',
    lesson: '全链路内容工业化：灵感、素材、合成、分发、矩阵、数据、资产和权限必须在一个运营系统里闭环。',
    wenaiMove: 'Wenai 继续做 Compose / Create / Cut / Cast / Manage 的主骨架，不展示未审计规模。',
  },
  {
    name: 'Hookshot / Hookly 类',
    lesson: '电商广告不只生成素材，关键是 hook、脚本结构、AI UGC、保存灵感和一键复用。',
    wenaiMove: '把创意洞察层加厚为 hook bank、结构偏好、胜出脚本和下一轮生产约束。',
  },
  {
    name: 'Macro 类',
    lesson: '创意团队需要 campaign canvas：计划、生成、审稿、发布在同一张工作台里流转。',
    wenaiMove: '把 factory 页面从功能入口升级为项目作战台，减少跳页和断点。',
  },
  {
    name: 'AdHawk / Omneky 类',
    lesson: '真正商业化靠投放和回流：广告账户、动态 URL、素材标签、预算、ROAS 和自动优化。',
    wenaiMove: 'Cast 不停在分发计划，必须接广告账户和 analytics sync 后才能宣称平台级执行。',
  },
  {
    name: 'Creatify 类',
    lesson: '商品素材到 UGC 视频广告要有 avatar、voice、scene、版本矩阵、成片 URL 和客户审核，不是单次生成。',
    wenaiMove: 'Create/Cut 继续把商品素材、脚本、视频任务、成片回灌和 review token 绑到同一条生产护照。',
  },
  {
    name: 'Marpipe / catalog testing 类',
    lesson: '目录商品广告靠变量实验和表现归因：SKU feed、offer、版式、受众和预算必须能复盘。',
    wenaiMove: 'Cast/Manage 继续把 dispatch、campaign ledger、表现回流和品牌学习档案接到下一轮创意约束。',
  },
  {
    name: 'Pencil 类',
    lesson: '生成式广告平台的护城河来自品牌记忆：胜出 hook、禁用表达、素材偏好和下一轮规则持续复利。',
    wenaiMove: 'Manage 必须把批准交付物、表现赢家和品牌学习档案沉淀成 Compose/Create/Cut 的生产约束。',
  },
];

const FINAL_PRODUCT_COMMAND_CENTER = [
  {
    title: '最终形态',
    value: '电商 AI 内容工业化操作系统',
    body: '不是单点 AI 生成工具，而是从灵感、素材、视频、分发、广告、客户验收、资产权限到表现回流的运营系统。',
  },
  {
    title: '主工作流',
    value: 'Compose → Create → Cut → Cast → Manage',
    body: '每个项目都要留下来源、生产、成片、客户批准、发布证据、回流指标和下一轮规则，形成可审计闭环。',
  },
  {
    title: '内部继续推进',
    value: '厚度、证据、护照、前台',
    body: '继续补创意洞察深度、视频生产护照、客户审核前台、资产权限 enforcement、品牌学习和 action queue。',
  },
  {
    title: '外部停线',
    value: 'provider / OAuth / ads / cloud / audit',
    body: '真实视频 provider、多平台 OAuth、广告账户、自动发布、analytics sync、企业云资产和规模审计缺一项，就不宣称平台级商用等价。',
  },
];

const FINAL_PRODUCT_BLUEPRINT = [
  {
    layer: 'Compose',
    target: '全网灵感管理、竞品账号追踪、热门视频解析、Hook Bank、品牌学习档案。',
    internalMove: '继续加厚 creative monitoring、source sync、hook/pacing 结构、action queue 和下一轮生产约束。',
    externalNeed: '公开榜单源、授权账号观察、视频解析 provider 或可审计的人工导入源。',
    stopLine: '没有持续来源和解析证据前，只能说“洞察账本”，不能说“全网灵感平台”。',
  },
  {
    layer: 'Create',
    target: '从商品/Brief 到脚本、素材、生产 handoff、一键生成任务和客户可验收交付物。',
    internalMove: '继续把资产库、脚本、provider request、生产结果、客户审核和 CRM handoff 串成同一条任务线。',
    externalNeed: '图像/视频生成 provider、对象存储、正式域名和客户可访问交付链接。',
    stopLine: '没有真实 provider 成功回调和可打开交付物前，不能说“自动生成已商用”。',
  },
  {
    layer: 'Cut',
    target: 'AI 视频分析、结构拆解、智能混剪、版本对比、批量成片和复盘回流。',
    internalMove: '继续补视频任务队列、cut plan、素材切片字段、客户 review 和表现回流。',
    externalNeed: '多模态视频分析、剪辑/渲染 provider、转码存储和失败重试队列。',
    stopLine: '没有真实成片与多版本渲染证据前，只能说“工作流就绪”，不能说“智能混剪可用到筷子水平”。',
  },
  {
    layer: 'Cast',
    target: '多平台分发、PubPal/矩阵分发、广告投放、预算门禁、发布证据和 analytics sync。',
    internalMove: '继续强化账号矩阵、发布槽位、dispatch handoff、campaign ledger、UTM 和表现导入。',
    externalNeed: 'TikTok/Meta/Google/小红书等平台 OAuth、广告账户授权、自动发布权限和转化事件。',
    stopLine: '没有平台授权和发布/投放回执前，不能展示已自动分发或已自动优化广告。',
  },
  {
    layer: 'Manage',
    target: '企业数据安全、权限/RBAC、审计、客户审核、CRM 交接、状态验收和规模数字保护。',
    internalMove: '继续把 review token、写回回执、资产权限、DLP、水印、留存和 readiness 接到每条交付物。',
    externalNeed: '企业云资产、签名 URL、团队空间、正式 CRM/合同/付款系统和审计材料。',
    stopLine: '91M+ creative output、42M+ video distribution 只能作为竞品 benchmark，不能作为 Wenai 自有规模。',
  },
];

const INTERNAL_EXTERNAL_DELIVERY_BOUNDARY = [
  {
    layer: 'Compose / 创意洞察',
    internal: 'Wenai 继续补 hook bank、竞品账号/榜单导入、视频结构拆解、品牌学习档案和下一轮 action queue。',
    external: '榜单源、授权观察账号、可合法解析的视频来源、Narra/多模态解析 provider 或可审计人工导入源。',
    stopLine: '没有持续来源和解析证据前，不宣称全网灵感管理或热门视频自动解析。',
  },
  {
    layer: 'Create + Cut / 生产与混剪',
    internal: 'Wenai 继续把 brief、脚本、素材、provider request、视频队列、成片回灌、review token 和 CRM handoff 串成一条线。',
    external: '视频生成/剪辑 provider endpoint、server token、webhook signing secret、素材授权、对象存储和正式可访问交付域名。',
    stopLine: '没有 provider 完成回调、可打开成片和客户批准前，不宣称一键视频或智能混剪已商用。',
  },
  {
    layer: 'Cast / 分发与广告',
    internal: 'Wenai 继续补账号矩阵、发布槽位、dispatch handoff、campaign ledger、UTM、预算门禁和表现导入。',
    external: 'TikTok/Meta/Google/小红书等 OAuth app、广告主/广告账户 ID、发布权限、测试预算、转化事件和 analytics sync。',
    stopLine: '没有平台授权、自动发布回执和广告账户证据前，不宣称 PubPal/矩阵分发、自动投放或自动优化。',
  },
  {
    layer: 'Manage / 企业资产与权限',
    internal: 'Wenai 继续把 RBAC、资产访问审计、DLP/watermark、下载/分享/publish 检查接到交付物和发布动作。',
    external: '对象存储 bucket/project、service account、signed URL policy、团队角色、保留策略、DLP/水印规则和企业域名。',
    stopLine: '没有真实对象存储和签名 URL enforcement 前，不宣称筷子云盘级企业资产协作。',
  },
  {
    layer: 'Scale / 规模数字审计',
    internal: 'Wenai 继续沉淀 creative output ledger、video distribution ledger、去重规则、证据 URL 和日期范围。',
    external: '平台后台导出、审计口径、数据区间、去重规则、第三方或客户确认材料。',
    stopLine: '91M+ creative output、42M+ video distribution 只能作为竞品 benchmark，不能作为 Wenai 自有规模展示。',
  },
];

const ALTERNATIVE_PLATFORM_REFERENCES = [
  {
    name: 'Hooksy / Hooked',
    reference: '广告库、品牌追踪、脚本提取、hook patterns、产品图到短视频和 UGC 广告批量生成。',
    wenaiDecision: '把 Compose 和 Cut 合并成“从胜出广告结构到可复用视频任务”的闭环，而不是只生成单条素材。',
  },
  {
    name: 'Omneky',
    reference: '跨平台 campaign launcher、creative testing、brand-safe generation、creative analytics 和优化建议。',
    wenaiDecision: 'Cast 必须带 campaign ledger、素材标签、预算证据和表现回流，才能从内容工具变成增长系统。',
  },
  {
    name: 'AdHawk / AI Media Buyer',
    reference: '围绕广告账户持续优化：目标、预算、投放、异常、转化和收益都要进入自动决策。',
    wenaiDecision: '广告投放先做门禁和审计，等账号授权后再开放自动调预算、暂停疲劳素材和放量建议。',
  },
  {
    name: 'Hookshot',
    reference: '受治理的 AI agents：先预演、再执行、全程留痕，失败或跳过也要可审计。',
    wenaiDecision: 'Wenai 的 action queue 和 readiness 需要记录“做了/没做/为什么没做”，防止 agent 直接碰生产系统。',
  },
  {
    name: 'Creatify',
    reference: '商品链接、素材、avatar、voice、scene 和 UGC ad variants 连接到视频广告生产。',
    wenaiDecision: 'Wenai 要把商品素材、版本矩阵、成片 URL、客户审核和 CRM/分发交接放进同一条 Create/Cut 任务。',
  },
  {
    name: 'Marpipe',
    reference: '目录商品广告测试强调 SKU feed、变量组合、受众、预算和表现归因。',
    wenaiDecision: 'Wenai 要让 Cast/Manage 把 SKU、offer、素材变量、dispatch、campaign 和 performance return 绑定成可复盘实验。',
  },
  {
    name: 'Pencil',
    reference: '生成式广告创意和品牌学习结合，持续积累胜出结构、禁用表达和下一轮创意规则。',
    wenaiDecision: 'Wenai 的品牌学习档案必须反哺 Compose/Create/Cut，而不是只作为复盘报告存在。',
  },
  {
    name: 'Smartly.io',
    reference: 'creative、media、intelligence 一体化：创意交付、媒体购买、实时优化、报告和平台协作必须连成运营系统。',
    wenaiDecision: 'Wenai 的 Cast/Manage 要把素材版本、账号、预算、campaign、平台回执、表现回流和下一轮 action queue 放在同一块可审计面板里。',
  },
  {
    name: 'VidMob',
    reference: '创意分析、平台就绪、表现学习和账号发布一体化，强调 creative analytics 而不是只看素材产出。',
    wenaiDecision: 'Wenai 的 AI 视频分析和表现回流要把 creative、platform 和 optimization 连起来，不能只停在任务状态。',
  },
  {
    name: 'Creatopy',
    reference: 'brand kit、模板复用、URL-to-ad 和权限控制，强调品牌安全的大规模创意生产。',
    wenaiDecision: 'Create/Cut 要把品牌资产、模板、权限和多语言版本统一起来，才能做规模化内容工厂。',
  },
  {
    name: 'Superads',
    reference: '跨平台 creative insights、fatigue 识别和格式/钩子分析。',
    wenaiDecision: 'Wenai 的创意洞察要接上跨平台性能信号和疲劳识别，而不是只做竞品拆解。',
  },
];

type StatusProductBlueprintItem = {
  layer: string;
  target: string;
  internalMove: string;
  externalNeed: string;
  stopLine: string;
  evidence?: string;
  status?: ReadinessFeature['status'];
};

export function buildStatusExternalRequirements(report?: ReadinessResponse['report']) {
  return report?.externalRequirements || [];
}

export function buildStatusUiVariants(report?: ReadinessResponse['report']) {
  if (!report?.uiVariants?.length) return STATUS_UI_VARIANTS;

  return report.uiVariants.map(variant => ({
    id: normalizeStatusUiVariantId(variant.id),
    label: variant.label,
    intent: `${variant.audience} ${variant.firstScreen}`,
    proof: `${variant.primaryAction} 停止线：${variant.stopLine}`,
  }));
}

export function buildStatusProductBlueprint(report?: ReadinessResponse['report']): StatusProductBlueprintItem[] {
  if (!report?.productBlueprint?.length) return FINAL_PRODUCT_BLUEPRINT;

  return report.productBlueprint.map(item => ({
    layer: item.id,
    target: item.target,
    internalMove: item.internalCapability,
    externalNeed: item.externalGate,
    stopLine: item.stopLine,
    evidence: item.evidence,
    status: item.currentStatus,
  }));
}

export function buildStatusAlternativeReferences(report?: ReadinessResponse['report']) {
  if (!report?.alternativeReferences?.length) return ALTERNATIVE_PLATFORM_REFERENCES;

  return report.alternativeReferences.map(item => ({
    name: item.name,
    reference: `${item.pattern} 边界：${item.boundary}`,
    wenaiDecision: item.wenaiDecision,
  }));
}

const MANAGE_ACCEPTANCE_BOARD = [
  {
    stage: 'Readiness 验收',
    owner: '产品负责人',
    proof: '汇总服务健康、产品成熟度、五段能力、外部门禁和规模数字保护，不把单点功能当成可发布。',
    pass: '核心链路、伪功能、外部材料缺口和朋友试用风险都能在同一页看到。',
    next: '继续把每轮新增能力接入 readiness evidence，而不是只做页面展示。',
  },
  {
    stage: 'CRM / 生产交接',
    owner: '客户经理',
    proof: 'CRM-lite、production handoff、action queue 和商业下一步已经进入同一条运营队列。',
    pass: '每个 P0/P1 修复项都有 owner、endpoint、method、acceptance，能交给运营或工程执行。',
    next: '外部 CRM 正式接入后，把合同阶段、付款状态、客户字段同步回 Wenai。',
  },
  {
    stage: '客户审核闭环',
    owner: '交付负责人',
    proof: '客户 review token、反馈、批准、过期/撤销和交付状态写回已经有 API 与页面。',
    pass: '非技术客户能打开链接、看成片或交付包、写反馈、批准或要求返修。',
    next: '补正式域名、客户权限策略、下载/水印策略，让朋友试用不需要解释。',
  },
  {
    stage: '资产权限 / 审计',
    owner: '运营管理员',
    proof: '资产 owner、scope、role、action、expiry、DLP、水印、留存和访问审计已进入账本。',
    pass: '下载、分享、发布、批准都必须经过权限检查；失败要有原因，不允许静默放行。',
    next: '接对象存储、签名 URL、团队空间和真实下载/share enforcement。',
  },
  {
    stage: '表现回流 / 复盘',
    owner: '增长负责人',
    proof: '表现导入、dispatch evidence、campaign ledger、品牌学习档案和下一轮建议已经互相引用。',
    pass: '每个已发布或已交付资产都能追溯到表现数据、胜出结构和下一轮生产约束。',
    next: '接平台 analytics sync 后，替代手动 CSV 导入并形成自动复盘。',
  },
];

function TrialIcon({ name, className = 'h-5 w-5' }: { name: string; className?: string }) {
  const paths: Record<string, string> = {
    grid: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
    video: 'M4 7.5A2.5 2.5 0 0 1 6.5 5h7A2.5 2.5 0 0 1 16 7.5v9A2.5 2.5 0 0 1 13.5 19h-7A2.5 2.5 0 0 1 4 16.5v-9Zm12.5 3L20 8.5v7l-3.5-2v-3Z',
    bulb: 'M12 3a6 6 0 0 0-3 11.2V16h6v-1.8A6 6 0 0 0 12 3Zm-3 16h6m-5 2h4',
    send: 'M3 11.5 21 4l-7.5 17-3-7-7.5-2.5Zm7.5 2.5L21 4',
    chart: 'M5 19V9m7 10V5m7 14v-7M3 19h18',
    users: 'M8 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8-1a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 21a6 6 0 0 1 12 0m2 0a5 5 0 0 0-3-4.6',
    lock: 'M7 10V7a5 5 0 0 1 10 0v3m-12 0h14v10H5V10Z',
    gear: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-5v3m0 12v3M4.6 4.6l2.1 2.1m10.6 10.6 2.1 2.1M3 12h3m12 0h3M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1',
    bolt: 'M13 2 4 14h7l-1 8 9-12h-7l1-8Z',
    warning: 'M12 4 3 20h18L12 4Zm0 6v4m0 3h.01',
    check: 'M20 6 9 17l-5-5',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  };
  const d = paths[name] || paths.grid;
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function trialValue(map: Record<string, number>, key: string, fallback = 0) {
  return map[key] ?? fallback;
}

function compactNumber(value: number) {
  if (!Number.isFinite(value)) return '0';
  if (value >= 1000) return value.toLocaleString('zh-CN');
  return `${value}`;
}

function TrialStatusPill({
  tone,
  children,
}: {
  tone: 'neutral' | 'success' | 'warning';
  children: ReactNode;
}) {
  const toneClass = tone === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : tone === 'warning'
      ? 'border-amber-200 bg-amber-50 text-amber-700'
      : 'border-neutral-200 bg-neutral-100 text-neutral-800';
  return (
    <span className={`inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold ${toneClass}`}>
      {tone === 'success' ? <span className="h-2 w-2 rounded-full bg-emerald-500" /> : null}
      {children}
    </span>
  );
}

function FriendTrialStatusConsole({
  health,
  readiness,
  actionQueue,
  assetPermissions,
  projectId,
  loading,
  lastFetch,
  fetchHealth,
  selectUiVariant,
  activeUiVariant,
  maturity,
  projectMaturity,
  externalRequirements,
  topActions,
  assetPermissionAudits,
  finalProductBlueprint,
  readinessHref,
}: {
  health: HealthResponse | null;
  readiness: ReadinessResponse | null;
  actionQueue: ActionQueueResponse | null;
  assetPermissions: AssetPermissionResponse | null;
  projectId: string;
  loading: boolean;
  lastFetch: Date | null;
  fetchHealth: () => void;
  selectUiVariant: (variant: StatusUiVariant) => void;
  activeUiVariant: { label: string; intent: string; proof: string };
  maturity?: ReadinessResponse['report'];
  projectMaturity?: ReadinessResponse['report']['projectReadiness'];
  externalRequirements: ExternalIntegrationRequirement[];
  topActions: IndustrialActionItem[];
  assetPermissionAudits: AssetPermissionAccessAudit[];
  finalProductBlueprint: StatusProductBlueprintItem[];
  readinessHref: string;
}) {
  const evidence = projectEvidenceMap(projectMaturity);
  const blockedRequirements = externalRequirements.filter(requirement => requirement.status !== 'configured');
  const implementedFeatures = maturity?.features.filter(feature => feature.status === 'implemented').length || 0;
  const partialFeatures = maturity?.features.filter(feature => feature.status === 'partial').length || 0;
  const totalFeatures = maturity?.features.length || Math.max(implementedFeatures + partialFeatures, 1);
  const verifiedFeatures = implementedFeatures + partialFeatures;
  const internalScore = projectMaturity?.score ?? maturity?.score ?? 0;
  const actionCount = actionQueue?.actionCount ?? topActions.length;
  const activePipelineCount = actionCount || trialValue(evidence, 'channelAvailableSlots') || trialValue(evidence, 'plans') || 0;
  const blockerCount = blockedRequirements.length;
  const overallText = loading ? '同步中' : health ? overallLabel(health.overall) : '等待接口';

  const modules = [
    {
      title: '创意洞察',
      icon: 'bulb',
      status: '已可内部跑通',
      detail: `${compactNumber(trialValue(evidence, 'creativeInsights') || trialValue(evidence, 'creativeOpportunities'))} 条洞察 / ${compactNumber(trialValue(evidence, 'creativePatternClusters'))} 个打法簇`,
      tone: 'success',
    },
    {
      title: '素材库',
      icon: 'grid',
      status: '已可内部跑通',
      detail: `${compactNumber(trialValue(evidence, 'assets'))} 个资产 / ${compactNumber(trialValue(evidence, 'reusableAssets'))} 个可复用`,
      tone: 'success',
    },
    {
      title: '视频工坊',
      icon: 'video',
      status: '部分可用',
      detail: `${compactNumber(trialValue(evidence, 'videoQueueItems'))} 个生产任务，等待真实 provider`,
      tone: 'warning',
    },
    {
      title: '分发计划',
      icon: 'send',
      status: '需外部授权',
      detail: `${compactNumber(trialValue(evidence, 'plans'))} 条计划，等待平台 OAuth`,
      tone: 'danger',
    },
    {
      title: '效果回流',
      icon: 'chart',
      status: '待配置',
      detail: `${compactNumber(trialValue(evidence, 'performanceReturns'))} 条回流，等待 analytics sync`,
      tone: 'neutral',
    },
    {
      title: '客户移交',
      icon: 'users',
      status: '已可内部跑通',
      detail: `${compactNumber(trialValue(evidence, 'clientReviewAssets') || trialValue(evidence, 'videoClientReviews'))} 个审核链接，CRM 交接可用`,
      tone: 'success',
    },
  ] as const;

  const evidenceItems = [
    { label: '功能模块', value: `${verifiedFeatures}/${totalFeatures}` },
    { label: '执行队列', value: `${actionCount}` },
    { label: '外部门禁', value: `${blockerCount}` },
    { label: '权限审计', value: `${assetPermissions?.accessAudits.length || assetPermissionAudits.length}` },
    { label: '平台夸大声明', value: '0' },
  ];

  const logs = [
    {
      tag: health?.overall === 'operational' ? 'OK' : health?.overall === 'degraded' ? 'WARN' : 'INFO',
      tone: health?.overall === 'operational' ? 'text-emerald-300' : health?.overall === 'degraded' ? 'text-amber-300' : 'text-sky-300',
      text: `服务健康：${overallText}`,
    },
    {
      tag: 'INFO',
      tone: 'text-sky-300',
      text: `项目成熟度：${readiness?.projectId || projectId || 'default-project'} · ${internalScore}/100`,
    },
    {
      tag: blockerCount > 0 ? 'WARN' : 'OK',
      tone: blockerCount > 0 ? 'text-amber-300' : 'text-emerald-300',
      text: `外部门禁：${blockerCount} 项等待材料或授权`,
    },
    ...topActions.slice(0, 3).map(action => ({
      tag: action.priority,
      tone: action.priority === 'P0' ? 'text-rose-300' : action.priority === 'P1' ? 'text-amber-300' : 'text-slate-300',
      text: `${action.title} · ${action.method} ${action.endpoint}`,
    })),
  ];
  const terminalTime = lastFetch
    ? lastFetch.toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--';

  return (
    <div className="min-h-screen bg-[#f8f8f7] text-[#111827]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_1px_1px,rgba(99,102,241,0.12)_1px,transparent_0)] [background-size:26px_26px]" />
      <div className="relative flex min-h-screen gap-6 p-6">
        <aside className="hidden w-[390px] shrink-0 flex-col border-r border-neutral-200 bg-white/92 lg:flex">
          <div className="flex items-center gap-5 border-b border-neutral-100 px-9 py-9">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-neutral-950 text-xl font-bold text-white shadow-sm">W</div>
            <div>
              <div className="text-3xl font-bold tracking-tight text-neutral-950">Wenai</div>
              <div className="mt-1 text-sm font-medium text-neutral-500">智能内容系统</div>
            </div>
          </div>
          <nav className="flex-1 px-5 py-7">
            {[
              ['grid', '指挥中心', 'active', '/status?variant=friend_trial'],
              ['video', '视频工坊', 'dot', '/factory/video?variant=friend_trial'],
              ['bulb', '创意洞察', '', '/factory/creative?variant=friend_trial'],
              ['send', '分发运营', '5', '/factory/cast?variant=friend_trial'],
              ['chart', '效果回流', '', '/factory/manage?variant=friend_trial'],
              ['users', '客户移交', '', '/review/review-video-1?variant=friend_trial'],
            ].map(([icon, label, badge, href]) => (
              <a
                key={label}
                href={href}
                className={`mb-2 flex items-center gap-4 px-6 py-4 text-lg font-semibold transition ${
                  badge === 'active'
                    ? 'border-l-4 border-neutral-950 bg-neutral-100 text-neutral-950'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <TrialIcon name={icon} className="h-6 w-6 text-neutral-600" />
                <span className="flex-1">{label}</span>
                {badge === 'dot' ? <span className="h-2 w-2 rounded-full bg-amber-500" /> : null}
                {badge === '5' ? <span className="rounded-md bg-neutral-100 px-2 py-1 text-sm text-neutral-700">{blockerCount || 5}</span> : null}
              </a>
            ))}
            <div className="mt-7 border-t border-neutral-100 pt-7">
              <a href="/docs" className="flex items-center gap-4 px-6 py-4 text-lg font-semibold text-neutral-700 hover:bg-neutral-50">
                <TrialIcon name="lock" className="h-6 w-6 text-neutral-600" />
                <span className="flex-1">外部网关</span>
                <span className="rounded-md bg-neutral-100 px-3 py-1 text-sm text-neutral-600">待配置</span>
              </a>
            </div>
          </nav>
          <div className="mx-6 mb-7 flex items-center gap-4 rounded-3xl border border-neutral-100 bg-white p-6 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-xl font-bold text-indigo-700">W</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-bold text-neutral-950">Wenai Admin</div>
              <div className="text-sm text-neutral-500">{activeUiVariant.label}</div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 overflow-hidden">
          <header className="mb-8 flex flex-col gap-5 border-b border-neutral-200 bg-white/90 px-9 py-5 shadow-sm xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-950">Wenai 内容工业化试用总控台</h1>
              <p className="mt-2 text-lg text-neutral-600">从创意洞察、资产库、视频生产到分发计划、表现回流和 CRM 交接的可验证工作流</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <TrialStatusPill tone="neutral">有条件可试用</TrialStatusPill>
              <TrialStatusPill tone="success">内部链路已验证</TrialStatusPill>
              <TrialStatusPill tone="warning">外部门禁 {blockerCount} 项待配置</TrialStatusPill>
              <button
                type="button"
                onClick={() => selectUiVariant('operator')}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 shadow-sm hover:bg-neutral-50"
              >
                运营视角
              </button>
              <button
                type="button"
                onClick={fetchHealth}
                className="rounded-lg bg-neutral-950 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-neutral-900/10 hover:bg-black"
              >
                刷新状态
              </button>
            </div>
          </header>

          <div className="grid grid-cols-12 gap-6 pb-10">
            {[
              { label: '内部链路', value: `${Math.round(internalScore)}%`, icon: 'gear', tone: 'from-teal-50 to-teal-100/40 border-teal-100 text-teal-900', bar: 'bg-teal-500', width: `${Math.min(Math.max(internalScore, 0), 100)}%` },
              { label: '活跃管道', value: compactNumber(activePipelineCount), suffix: '运行中', icon: 'bolt', tone: 'from-blue-50 to-blue-100/40 border-blue-100 text-blue-900', bar: 'bg-blue-500', width: `${activePipelineCount > 0 ? 70 : 10}%` },
              { label: '已验证模块', value: `${verifiedFeatures}`, suffix: `/${totalFeatures}`, icon: 'check', tone: 'from-amber-50 to-amber-100/40 border-amber-100 text-amber-900', bar: 'bg-amber-500', width: `${Math.min(Math.round((verifiedFeatures / Math.max(totalFeatures, 1)) * 100), 100)}%` },
              { label: '阻断网关', value: compactNumber(blockerCount), suffix: '关键项', icon: 'warning', tone: 'from-rose-50 to-rose-100/40 border-rose-200 text-rose-700', bar: 'bg-rose-500', width: `${blockerCount > 0 ? 82 : 0}%` },
            ].map(card => (
              <section key={card.label} className={`col-span-12 rounded-[2rem] border bg-gradient-to-br p-8 shadow-sm md:col-span-6 xl:col-span-3 ${card.tone}`}>
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-current shadow-sm">
                  <TrialIcon name={card.icon} className="h-6 w-6" />
                </div>
                <div className="text-lg font-bold opacity-70">{card.label}</div>
                <div className="mt-2 flex items-end gap-3">
                  <span className="text-6xl font-extrabold leading-none tracking-tight">{card.value}</span>
                  {card.suffix ? <span className="mb-2 text-xl font-bold opacity-75">{card.suffix}</span> : null}
                </div>
                <div className="mt-7 h-2 overflow-hidden rounded-full bg-white/50">
                  <div className={`h-full rounded-full ${card.bar}`} style={{ width: card.width }} />
                </div>
              </section>
            ))}

            <section className="col-span-12 xl:col-span-8">
              <div className="mb-5 flex items-center gap-4">
                <h2 className="text-2xl font-bold tracking-tight text-neutral-950">模块运行状态</h2>
                <span className="text-sm font-medium text-neutral-500">真实数据流与门禁映射</span>
              </div>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {modules.map(module => {
                  const tone = module.tone === 'success'
                    ? 'border-emerald-200 bg-emerald-50/70 text-emerald-800'
                    : module.tone === 'warning'
                      ? 'border-amber-200 bg-amber-50/70 text-amber-800'
                      : module.tone === 'danger'
                        ? 'border-rose-200 bg-rose-50/70 text-rose-700'
                        : 'border-neutral-200 bg-white/70 text-neutral-700';
                  return (
                    <div key={module.title} className={`rounded-[1.5rem] border p-6 shadow-sm ${tone}`}>
                      <div className="mb-6 flex items-start justify-between gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-current shadow-sm">
                          <TrialIcon name={module.icon} className="h-6 w-6" />
                        </div>
                        <span className="rounded-full border border-current/20 bg-white/60 px-3 py-1 text-xs font-bold">{module.status}</span>
                      </div>
                      <h3 className="text-xl font-bold text-neutral-950">{module.title}</h3>
                      <p className="mt-3 text-sm font-medium leading-6 text-neutral-600">{module.detail}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <aside className="col-span-12 xl:col-span-4">
              <div className="h-full rounded-[2rem] border border-emerald-100 bg-emerald-50/40 p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-xl font-bold text-neutral-950">证据层概览</h2>
                  <a href={readinessHref} className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-neutral-600 shadow-sm hover:text-neutral-950">接口数据</a>
                </div>
                <div className="space-y-4">
                  {evidenceItems.map(item => (
                    <div key={item.label} className="flex items-center justify-between rounded-2xl bg-white px-5 py-4 shadow-sm">
                      <span className="text-sm font-bold text-neutral-500">{item.label}</span>
                      <span className="text-2xl font-extrabold text-neutral-950">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <section className="relative col-span-12 min-h-[460px] overflow-hidden rounded-[2.25rem] border border-slate-800/30 bg-[#0f172a] p-7 text-slate-300 shadow-xl xl:col-span-7">
              <div className="pointer-events-none absolute right-10 top-20 text-slate-700/20">
                <TrialIcon name="list" className="h-32 w-32" />
              </div>
              <div className="relative mb-6 flex items-center justify-between border-b border-slate-700/70 pb-5">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-rose-500" />
                  <span className="h-3 w-3 rounded-full bg-amber-500" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="ml-3 text-xs font-bold uppercase tracking-[0.28em] text-slate-400">TERMINAL // SYSTEM LOGS</span>
                </div>
                <span className="text-xs font-bold text-emerald-300">Live</span>
              </div>
              <div className="relative space-y-4 font-mono text-sm">
                {logs.map((log, index) => (
                  <div key={`${log.tag}-${index}`} className={log.tag === 'P0' ? 'rounded border-l-2 border-rose-400 bg-rose-500/10 px-3 py-2' : ''}>
                    <span className="mr-3 text-slate-500">[{terminalTime}]</span>
                    <span className={`mr-3 font-bold ${log.tone}`}>[{log.tag.padEnd(4, ' ')}]</span>
                    <span className="text-slate-200">{log.text}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <span className="font-bold text-emerald-300">readiness@wenai-core:~#</span>
                  <span className="ml-2 inline-block h-5 w-2 translate-y-1 bg-slate-400" />
                </div>
              </div>
            </section>

            <section className="col-span-12 rounded-[2.25rem] border border-rose-200 bg-rose-50/80 p-7 shadow-sm xl:col-span-5">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-500">
                  <TrialIcon name="warning" className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold text-rose-950">关键阻断项 ({blockerCount})</h2>
              </div>
              <div className="space-y-4">
                {(blockedRequirements.length ? blockedRequirements : externalRequirements).slice(0, 5).map(requirement => (
                  <div key={requirement.id} className="flex items-center justify-between gap-4 rounded-3xl border border-rose-100 bg-white p-5 shadow-sm">
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                        <TrialIcon name={requirement.category === 'platform_oauth' ? 'lock' : requirement.category === 'analytics_sync' ? 'chart' : 'video'} className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-lg font-bold text-neutral-950">{requirement.label}</h3>
                        <p className="mt-1 line-clamp-2 text-sm font-medium text-neutral-500">
                          {requirement.requiredInputs.slice(0, 2).join(' / ') || requirement.evidence}
                        </p>
                      </div>
                    </div>
                    <a href="/docs" className="shrink-0 rounded-2xl bg-neutral-950 px-5 py-3 text-sm font-bold text-white hover:bg-black">
                      材料
                    </a>
                  </div>
                ))}
              </div>
            </section>

            <section className="col-span-12 rounded-[2rem] border border-neutral-200 bg-white/80 p-7 shadow-sm">
              <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-950">模块准备度评估</h2>
                  <p className="mt-1 text-sm text-neutral-500">与 Wenai 现有功能、外部门禁和交付边界对应。</p>
                </div>
                <div className="text-sm font-semibold text-neutral-500">当前项目：{readiness?.projectId || projectId || 'default-project'}</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-neutral-200 text-sm text-neutral-500">
                      <th className="px-4 pb-4 font-bold">模块</th>
                      <th className="px-4 pb-4 font-bold">准备度</th>
                      <th className="px-4 pb-4 font-bold">证据</th>
                      <th className="px-4 pb-4 font-bold">阻断项</th>
                      <th className="px-4 pb-4 text-right font-bold">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-sm">
                    {finalProductBlueprint.slice(0, 6).map(item => {
                      const status = item.status === 'implemented' ? '就绪' : item.status === 'partial' ? '部分就绪' : '已阻断';
                      const rowTone = item.status === 'implemented'
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                        : item.status === 'partial'
                          ? 'text-amber-800 bg-amber-50 border-amber-100'
                          : 'text-rose-700 bg-rose-50 border-rose-100';
                      return (
                        <tr key={item.layer} className="hover:bg-neutral-50">
                          <td className="px-4 py-4 font-bold text-neutral-950">{item.layer}</td>
                          <td className="px-4 py-4 font-mono font-bold text-neutral-800">{FEATURE_STATUS_LABELS[item.status || 'partial']}</td>
                          <td className="max-w-[360px] px-4 py-4 text-neutral-500">{item.evidence || item.internalMove}</td>
                          <td className="max-w-[300px] px-4 py-4 text-neutral-500">{item.externalNeed}</td>
                          <td className="px-4 py-4 text-right">
                            <span className={`inline-flex items-center rounded-lg border px-3 py-1 text-xs font-bold ${rowTone}`}>{status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="col-span-12 flex justify-center pb-3">
              <div className="max-w-4xl rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-indigo-50 px-10 py-6 text-center shadow-sm">
                <p className="text-base font-semibold leading-8 text-neutral-700">
                  在真实 OAuth、广告账户、发布 API、数据同步和企业云权限配置完成前，
                  Wenai 仍是一个已验证的 <span className="rounded-md bg-amber-200/80 px-2 py-1 font-bold text-neutral-950">内部运行骨架</span>，
                  而非完全自动化的筷子科技级别平台。
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function StatusPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [readiness, setReadiness] = useState<ReadinessResponse | null>(null);
  const [actionQueue, setActionQueue] = useState<ActionQueueResponse | null>(null);
  const [assetPermissions, setAssetPermissions] = useState<AssetPermissionResponse | null>(null);
  const [projectId, setProjectId] = useState('default-project');
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const [uiVariant, setUiVariant] = useState<StatusUiVariant>('partner');

  const fetchHealth = useCallback(async () => {
    try {
      const trimmedProjectId = projectId.trim();
      const readinessPath = trimmedProjectId
        ? `/api/readiness?projectId=${encodeURIComponent(trimmedProjectId)}`
        : '/api/readiness';
      const actionQueuePath = trimmedProjectId
        ? `/api/industrial-chain/action-queue?projectId=${encodeURIComponent(trimmedProjectId)}`
        : '/api/industrial-chain/action-queue';
      const assetPermissionPath = trimmedProjectId
        ? `/api/asset-permissions?projectId=${encodeURIComponent(trimmedProjectId)}`
        : '/api/asset-permissions';
      const [healthRes, readinessRes, actionQueueRes, assetPermissionRes] = await Promise.all([
        fetch('/api/health', { cache: 'no-store' }),
        fetch(readinessPath, { cache: 'no-store' }),
        fetch(actionQueuePath, { cache: 'no-store' }),
        fetch(assetPermissionPath, { cache: 'no-store' }),
      ]);
      setHealth(await healthRes.json());
      setReadiness(await readinessRes.json());
      setActionQueue(await actionQueueRes.json());
      setAssetPermissions(await assetPermissionRes.json());
      setLastFetch(new Date());
    } catch {
      setHealth({ overall: 'down', services: [], timestamp: new Date().toISOString(), uptime: null });
      setReadiness(null);
      setActionQueue(null);
      setAssetPermissions(null);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchHealth();
    const timer = setInterval(fetchHealth, 30000);
    return () => clearInterval(timer);
  }, [fetchHealth]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const selected = new URLSearchParams(window.location.search).get('variant');
    setUiVariant(normalizeStatusUiVariantId(selected || undefined));
  }, []);

  const selectUiVariant = useCallback((variant: StatusUiVariant) => {
    setUiVariant(variant);
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('variant', variant);
    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const overall = health?.overall || 'down';
  const meta = STATUS_META[overall];
  const maturity = readiness?.report;
  const readinessMeta = maturity?.verdict === 'pass'
    ? STATUS_META.operational
    : maturity?.verdict === 'conditional'
      ? STATUS_META.degraded
      : STATUS_META.down;
  const projectMaturity = maturity?.projectReadiness;
  const platformConnectorFeature = maturity?.features.find(feature => feature.name === 'Platform connector automation ledger');
  const platformConnectorWorkflow = maturity?.workflows.find(workflow => workflow.name.includes('Platform OAuth'));
  const externalRequirements = buildStatusExternalRequirements(maturity);
  const materialGateSummary = maturity?.materialGateSummary;
  const scaleClaimGuards = maturity?.scaleClaimGuards || [];
  const topActions = actionQueue?.actions.slice(0, 4) || [];
  const assetPermissionAudits = assetPermissions?.accessAudits.slice(0, 4) || [];
  const kuaiziCapabilities = buildKuaiziCapabilityLadder(projectMaturity);
  const statusUiVariants = buildStatusUiVariants(maturity);
  const finalProductBlueprint = buildStatusProductBlueprint(maturity);
  const alternativePlatformReferences = buildStatusAlternativeReferences(maturity);
  const activeUiVariant = statusUiVariants.find(variant => variant.id === uiVariant) || statusUiVariants[0];
  const readinessHref = projectId.trim()
    ? `/api/readiness?projectId=${encodeURIComponent(projectId.trim())}`
    : '/api/readiness';

  if (uiVariant === 'friend_trial') {
    return (
      <FriendTrialStatusConsole
        health={health}
        readiness={readiness}
        actionQueue={actionQueue}
        assetPermissions={assetPermissions}
        projectId={projectId}
        loading={loading}
        lastFetch={lastFetch}
        fetchHealth={fetchHealth}
        selectUiVariant={selectUiVariant}
        activeUiVariant={activeUiVariant}
        maturity={maturity}
        projectMaturity={projectMaturity}
        externalRequirements={externalRequirements}
        topActions={topActions}
        assetPermissionAudits={assetPermissionAudits}
        finalProductBlueprint={finalProductBlueprint}
        readinessHref={readinessHref}
      />
    );
  }

  return (
    <div className="mx-auto max-w-[900px] px-6 py-10">
      <div className="mb-8 text-center">
        <div className="mb-3 text-[10px] font-mono uppercase tracking-[0.2em] text-accent">
          系统状态 · 实时
        </div>
        <h1 className="mb-4 font-[family-name:var(--font-outfit)] text-2xl font-bold text-text-primary lg:text-3xl">
          全链路验收台
        </h1>

        {loading ? (
          <div className="text-[12px] font-mono text-text-tertiary">正在加载状态...</div>
        ) : (
          <div className={`inline-flex items-center gap-3 rounded-md border px-5 py-3 ${meta.border} ${meta.bg}`}>
            <div className="relative flex items-center justify-center">
              <div className={`h-2 w-2 animate-pulse-dot rounded-full ${meta.dot}`} />
              <div className={`absolute h-4 w-4 animate-ping rounded-full ${meta.dot} opacity-20`} />
            </div>
            <span className={`text-[14px] font-semibold ${meta.color}`}>
              {overallLabel(overall)}
            </span>
          </div>
        )}

        {lastFetch && (
          <div className="mt-3 text-[10px] font-mono text-text-tertiary">
            最近检查 {lastFetch.toLocaleTimeString('zh-CN')} · 每 30 秒自动刷新
          </div>
        )}
      </div>

      <div className="mb-6 rounded-md border border-border-subtle bg-bg-surface/50 p-5">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
              UI Variant 工作流
            </div>
            <div className="mt-1 text-[15px] font-semibold text-text-primary">
              先比较定位，再改页面；先验收台，再创意、视频和接入清单
            </div>
          </div>
          <div className="text-[10px] leading-relaxed text-accent md:max-w-[260px]">
            目标不是换皮，而是让合作者看懂真实能力、外部门禁和下一步材料。
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          {statusUiVariants.map(variant => (
            <a
              key={variant.id}
              href={`/status?variant=${variant.id}`}
              aria-current={uiVariant === variant.id ? 'page' : undefined}
              onClick={(event) => {
                event.preventDefault();
                selectUiVariant(variant.id);
              }}
              className={`rounded-md border px-3 py-3 text-left transition ${
                uiVariant === variant.id
                  ? 'border-accent/50 bg-accent/10 text-text-primary'
                  : 'border-border-subtle bg-bg-root/40 text-text-secondary hover:border-accent/40'
              }`}
            >
              <div className="text-[12px] font-semibold">{variant.label}</div>
              <div className="mt-1 text-[10px] leading-relaxed">{variant.intent}</div>
            </a>
          ))}
        </div>
        <div className="mt-4 rounded-md border border-border-subtle bg-bg-root/50 p-3">
          <div className="text-[11px] font-semibold text-text-primary">
            当前选择：{activeUiVariant.label}
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">
            {activeUiVariant.proof}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-4">
            {STATUS_VARIANT_ROADMAP.map(item => (
              <div key={item.page} className="rounded-md border border-border-subtle/70 bg-bg-surface/40 px-3 py-3">
                <div className="text-[10px] font-mono text-accent">Step {item.step}</div>
                <div className="mt-1 text-[11px] font-semibold text-text-primary">{item.page}</div>
                <p className="mt-1 text-[10px] leading-relaxed text-text-tertiary">{item.job}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-md border border-border-subtle bg-bg-root/50 p-3">
          <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
              最终产品形态指挥板
            </div>
            <div className="text-[10px] font-mono text-accent">
              先定终局，再分内部任务和外部材料
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {FINAL_PRODUCT_COMMAND_CENTER.map(item => (
              <div key={item.title} className="rounded-md border border-border-subtle/70 bg-bg-surface/40 px-3 py-3">
                <div className="text-[11px] font-semibold text-text-primary">{item.title}</div>
                <div className="mt-1 text-[12px] font-semibold text-success">{item.value}</div>
                <p className="mt-2 text-[10px] leading-relaxed text-text-secondary">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-md border border-amber-400/25 bg-amber-950/10 p-3">
          <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
              内部 / 外部交付边界板
            </div>
            <a className="text-[10px] font-mono text-accent underline-offset-4 hover:underline" href="/settings/kuaizi">
              去外部材料包
            </a>
          </div>
          <p className="mb-3 text-[10px] leading-relaxed text-text-secondary">
            内部能继续推进的，Wenai 继续做；必须外部授权或 provider 材料才能真实闭环的，集中在这里等待你统一提供。没有证据就保持门禁，不把骨架包装成平台级规模执行。
          </p>
          <div className="grid grid-cols-1 gap-2 lg:grid-cols-5">
            {INTERNAL_EXTERNAL_DELIVERY_BOUNDARY.map(item => (
              <div key={item.layer} className="rounded-md border border-border-subtle bg-bg-surface/40 px-3 py-3">
                <div className="text-[11px] font-semibold text-text-primary">{item.layer}</div>
                <div className="mt-2 text-[10px] font-semibold text-success">Wenai 内部继续做</div>
                <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">{item.internal}</p>
                <div className="mt-2 text-[10px] font-semibold text-accent">需要你统一提供/授权</div>
                <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">{item.external}</p>
                <div className="mt-2 text-[10px] font-semibold text-error">停止线</div>
                <p className="mt-1 text-[10px] leading-relaxed text-text-tertiary">{item.stopLine}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-md border border-border-subtle bg-bg-root/50 p-3">
          <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
              竞品参考雷达
            </div>
            <div className="text-[10px] font-mono text-accent">
              终局不是单点生成，而是电商增长作战系统
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {COMPETITOR_REFERENCE_RADAR.map(item => (
              <div key={item.name} className="rounded-md border border-border-subtle/70 bg-bg-surface/40 px-3 py-3">
                <div className="text-[11px] font-semibold text-text-primary">{item.name}</div>
                <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">{item.lesson}</p>
                <p className="mt-2 text-[10px] leading-relaxed text-success">Wenai 迈进：{item.wenaiMove}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-md border border-border-subtle bg-bg-root/50 p-3">
          <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
              最终产品形态蓝图
            </div>
            <div className="text-[10px] font-mono text-accent">
              内部继续补厚；外部材料接齐后才开放平台级承诺
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {finalProductBlueprint.map(item => (
              <div key={item.layer} className="rounded-md border border-border-subtle/70 bg-bg-surface/40 px-3 py-3">
                <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-[12px] font-semibold text-text-primary">{item.layer}</div>
                    {item.status && (
                      <div className="mt-1 text-[10px] font-mono text-accent">
                        {FEATURE_STATUS_LABELS[item.status]}
                      </div>
                    )}
                  </div>
                  <div className="text-[10px] leading-relaxed text-text-secondary md:max-w-[76%]">{item.target}</div>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                  <div className="rounded border border-success/20 bg-success/5 px-3 py-2">
                    <div className="text-[10px] font-semibold text-success">Wenai 内部继续做</div>
                    <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">{item.internalMove}</p>
                  </div>
                  <div className="rounded border border-accent/20 bg-accent/5 px-3 py-2">
                    <div className="text-[10px] font-semibold text-accent">需要你统一提供/授权</div>
                    <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">{item.externalNeed}</p>
                  </div>
                  <div className="rounded border border-error/20 bg-error/5 px-3 py-2">
                    <div className="text-[10px] font-semibold text-error">当前停止线</div>
                    <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">{item.stopLine}</p>
                  </div>
                </div>
                {item.evidence && (
                  <p className="mt-2 text-[10px] leading-relaxed text-text-tertiary">readiness evidence：{item.evidence}</p>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-md border border-border-subtle bg-bg-root/50 p-3">
          <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
              筷子之外参考
            </div>
            <div className="text-[10px] font-mono text-accent">
              参考能力，不复制宣称；转成 Wenai 可验收路线
            </div>
          </div>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            {alternativePlatformReferences.map(item => (
              <div key={item.name} className="rounded-md border border-border-subtle/70 bg-bg-surface/40 px-3 py-3">
                <div className="text-[11px] font-semibold text-text-primary">{item.name}</div>
                <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">{item.reference}</p>
                <p className="mt-2 text-[10px] leading-relaxed text-success">Wenai 决策：{item.wenaiDecision}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-md border border-border-subtle bg-bg-surface/50 p-4 md:flex-row md:items-end">
        <label className="flex-1">
          <span className="mb-2 block text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
            项目闭环证据
          </span>
          <input
            value={projectId}
            onChange={event => setProjectId(event.target.value)}
            className="w-full rounded-md border border-border-subtle bg-bg-root px-3 py-2 text-[12px] font-mono text-text-primary outline-none focus:border-accent/60"
            placeholder="default-project"
          />
        </label>
        <button
          type="button"
          onClick={fetchHealth}
          className="rounded-md border border-border-subtle px-4 py-2 text-[11px] font-mono text-text-secondary hover:border-accent/50 hover:text-accent"
        >
          刷新
        </button>
      </div>

      <div className="mb-6 rounded-md border border-border-subtle bg-bg-surface/50 p-5">
        <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
            Manage Acceptance Board
          </div>
          <div className="text-[10px] font-mono text-accent">
            readiness / CRM handoff / 客户审核 / 资产权限 / 审计 / 表现回流
          </div>
        </div>
        <h2 className="text-[15px] font-semibold text-text-primary">交付前验收台：把“能演示”推进到“可交给朋友试用”</h2>
        <p className="mt-2 text-[11px] leading-relaxed text-text-secondary">
          Manage 层不是后台杂项，而是商业化可信度。每个交付物必须能回答：谁负责、证据在哪里、客户是否能审核、资产是否受控、表现是否回流、外部材料缺什么。
        </p>
        <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-5">
          {MANAGE_ACCEPTANCE_BOARD.map(item => (
            <div key={item.stage} className="rounded-md border border-border-subtle/70 bg-bg-root/40 px-3 py-3">
              <div className="text-[12px] font-semibold text-text-primary">{item.stage}</div>
              <div className="mt-1 text-[10px] font-mono text-accent">{item.owner}</div>
              <p className="mt-2 text-[10px] leading-relaxed text-text-secondary">{item.proof}</p>
              <p className="mt-2 text-[10px] leading-relaxed text-success">验收：{item.pass}</p>
              <p className="mt-2 text-[10px] leading-relaxed text-text-tertiary">下一步：{item.next}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6 rounded-md border border-border-subtle bg-bg-surface/50 p-5">
        <div className="mb-3 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
          服务承诺边界
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <div className="mb-1 text-[13px] font-semibold text-text-primary">免费内测</div>
            <p className="text-[11px] leading-relaxed text-text-secondary">
              按现状提供，不承诺稳定 SLA；第三方 AI 或平台接口波动时，必须返回明确错误和下一步。
            </p>
          </div>
          <div>
            <div className="mb-1 text-[13px] font-semibold text-text-primary">试跑接入</div>
            <p className="text-[11px] leading-relaxed text-text-secondary">
              演示环境按尽力保障处理；正式额度、响应窗口、导出频率以接入订单为准。
            </p>
          </div>
          <div>
            <div className="mb-1 text-[13px] font-semibold text-text-primary">企业接入</div>
            <p className="text-[11px] leading-relaxed text-text-secondary">
              SLA、赔付、权限审计、响应等级和例外情况，以双方合同和平台授权状态为准。
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 rounded-md border border-border-subtle bg-bg-surface/50 p-5">
        <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
          <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
            筷子式五段能力 · Compose / Create / Cut / Cast / Manage
          </div>
          <div className="text-[10px] font-mono text-accent">
            不展示伪规模：91M+ 创意产出、42M+ 视频分发属于竞品对标，不计入 Wenai 自有成绩
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
          {kuaiziCapabilities.map(capability => (
            <div key={capability.name} className={`rounded-md border px-3 py-3 ${
              capability.ok ? 'border-success/30 bg-success/10' : 'border-accent/30 bg-bg-root/40'
            }`}>
              <div className={`mb-1 text-[11px] font-semibold ${capability.ok ? 'text-success' : 'text-accent'}`}>
                {capability.ok ? '已成闭环' : '继续补齐'}
              </div>
              <div className="text-[12px] font-semibold text-text-primary">{capability.name}</div>
              <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">{capability.evidence}</p>
              <p className="mt-2 text-[10px] leading-relaxed text-text-tertiary">{capability.gap}</p>
            </div>
          ))}
        </div>
      </div>

      {maturity && (
        <div className={`mb-6 rounded-md border p-5 ${readinessMeta.border} ${readinessMeta.bg}`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
                产品成熟度 · 对标筷子科技
              </div>
              <div className="text-[16px] font-semibold text-text-primary">
                {maturity.label} · {maturity.score}/100
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">
                这里不是单纯的服务存活检查，而是面向真实试用的产品验收：核心链路、伪功能、生产交接、数据回流、客户审核和竞品差距必须同时可见。
              </p>
            </div>
            <a
              href={readinessHref}
              className="inline-flex items-center justify-center rounded-md border border-border-subtle px-3 py-2 text-[10px] font-mono text-text-secondary hover:border-accent/40 hover:text-accent"
            >
              查看接口数据
            </a>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            {maturity.features.slice(0, 6).map(feature => (
              <div key={feature.name} className="rounded-md border border-border-subtle bg-bg-root/40 p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-[11px] font-semibold text-text-primary">{formatReadinessFeatureName(feature.name)}</span>
                  <span className={`shrink-0 text-[9px] font-mono ${
                    feature.status === 'implemented' ? 'text-success' : feature.status === 'partial' ? 'text-accent' : 'text-error'
                  }`}>
                    {FEATURE_STATUS_LABELS[feature.status]}
                  </span>
                </div>
                <p className="line-clamp-2 text-[10px] leading-relaxed text-text-tertiary">{feature.evidence}</p>
              </div>
            ))}
          </div>

          {platformConnectorFeature && (
            <div className="mt-4 rounded-md border border-border-subtle bg-bg-root/50 p-3">
              <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
                  平台连接门禁
                </div>
                <div className={`text-[10px] font-mono font-semibold ${
                  platformConnectorWorkflow?.ok ? 'text-success' : 'text-accent'
                }`}>
                  {platformConnectorWorkflow?.ok ? '自动化就绪' : '等待外部平台授权'}
                </div>
              </div>
              <div className="text-[11px] font-semibold text-text-primary">
                {FEATURE_STATUS_LABELS[platformConnectorFeature.status]} · OAuth / 广告账户 / 自动发布 / 数据同步 / 资产权限
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">
                {platformConnectorFeature.evidence}
              </p>
              {platformConnectorWorkflow?.fix && (
                <p className="mt-2 text-[10px] leading-relaxed text-accent">
                  {platformConnectorWorkflow.fix}
                </p>
              )}
            </div>
          )}

          {externalRequirements.length > 0 && (
            <div className="mt-4 rounded-md border border-border-subtle bg-bg-root/50 p-3">
              <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
                  外部接入清单 · 只列真实平台级缺口
                </div>
                <div className="text-[10px] font-mono text-accent">
                  未接入前不宣称筷子等价执行
                </div>
              </div>
              {materialGateSummary && (
                <div className="mb-3 rounded-md border border-accent/25 bg-bg-surface/50 p-3">
                  <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-[11px] font-semibold text-text-primary">外部材料门禁汇总</div>
                      <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">{materialGateSummary.evidence}</p>
                    </div>
                    <div className={`w-fit rounded border px-2 py-1 text-[10px] font-mono ${
                      materialGateSummary.blocksCommercialLaunch ? 'border-error/30 text-error' : 'border-success/30 text-success'
                    }`}>
                      {materialGateSummary.blocksCommercialLaunch ? '阻断商用发布' : 'P0 材料已清'}
                    </div>
                  </div>
                  <div className="mt-3 grid gap-2 md:grid-cols-4">
                    <MaterialGateChip label="已配置" value={`${materialGateSummary.configured}/${materialGateSummary.total}`} />
                    <MaterialGateChip label="P0 缺口" value={`${materialGateSummary.missingP0}`} tone={materialGateSummary.missingP0 ? 'error' : 'success'} />
                    <MaterialGateChip label="P1 缺口" value={`${materialGateSummary.missingP1}`} tone={materialGateSummary.missingP1 ? 'accent' : 'success'} />
                    <MaterialGateChip label="待审计" value={`${materialGateSummary.evidenceRequired}`} tone={materialGateSummary.evidenceRequired ? 'accent' : 'success'} />
                  </div>
                  {materialGateSummary.nextMaterialPacks.length > 0 && (
                    <div className="mt-3 grid gap-1">
                      <div className="text-[10px] font-semibold text-text-tertiary">下一批材料包</div>
                      {materialGateSummary.nextMaterialPacks.map(pack => (
                        <div className="rounded border border-border-subtle/70 bg-bg-root/30 px-2 py-1 text-[10px] leading-relaxed text-text-secondary" key={pack}>
                          {pack}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {externalRequirements.map(requirement => (
                  <div key={requirement.id} className={`rounded-md border px-3 py-3 ${
                    requirement.status === 'configured'
                      ? 'border-success/30 bg-success/10'
                      : requirement.status === 'evidence_required'
                        ? 'border-accent/30 bg-bg-surface/40'
                        : 'border-error/30 bg-bg-surface/40'
                  }`}>
                    <div className="mb-1 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <div className="text-[11px] font-semibold text-text-primary">{requirement.label}</div>
                      <div className="flex flex-wrap gap-2">
                        {requirement.materialPriority ? (
                          <div className={`rounded border px-2 py-0.5 text-[9px] font-mono ${
                            requirement.materialPriority === 'P0' ? 'border-error/30 text-error' : 'border-accent/30 text-accent'
                          }`}>
                            {requirement.materialPriority} material
                          </div>
                        ) : null}
                        <div className={`text-[9px] font-mono ${
                          requirement.status === 'configured' ? 'text-success' : requirement.status === 'evidence_required' ? 'text-accent' : 'text-error'
                        }`}>
                          {formatExternalRequirementStatus(requirement.status)}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] leading-relaxed text-text-tertiary">
                      {formatExternalRequirementCategory(requirement.category)} · {formatExternalRequirementOwner(requirement.owner)}
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">{requirement.evidence}</p>
                    {(requirement.unlocks || requirement.blockedGate || requirement.missingImpact || requirement.operatorAction) ? (
                      <div className="mt-2 grid gap-2 md:grid-cols-2">
                        {requirement.unlocks ? (
                          <div className="rounded border border-success/20 bg-success/5 px-2 py-2">
                            <div className="text-[10px] font-semibold text-success">接入后解锁</div>
                            <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">{requirement.unlocks}</p>
                          </div>
                        ) : null}
                        {requirement.blockedGate ? (
                          <div className="rounded border border-error/20 bg-error/5 px-2 py-2">
                            <div className="text-[10px] font-semibold text-error">缺失时门禁</div>
                            <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">{requirement.blockedGate}</p>
                          </div>
                        ) : null}
                        {requirement.missingImpact ? (
                          <div className="rounded border border-accent/20 bg-accent/5 px-2 py-2">
                            <div className="text-[10px] font-semibold text-accent">商用影响</div>
                            <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">{requirement.missingImpact}</p>
                          </div>
                        ) : null}
                        {requirement.operatorAction ? (
                          <div className="rounded border border-border-subtle/70 bg-bg-root/30 px-2 py-2">
                            <div className="text-[10px] font-semibold text-text-primary">运营下一步</div>
                            <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">{requirement.operatorAction}</p>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                    <div className="mt-2 text-[10px] leading-relaxed text-text-secondary">
                      需要：{requirement.requiredInputs.slice(0, 3).join(' / ')}
                      {requirement.requiredInputs.length > 3 ? ' / ...' : ''}
                    </div>
                    <div className="mt-1 text-[10px] leading-relaxed text-success">
                      验收：{requirement.acceptance}
                    </div>
                    {requirement.acceptanceEvidence ? (
                      <div className="mt-1 text-[10px] leading-relaxed text-success">
                        证据闭环：{requirement.acceptanceEvidence}
                      </div>
                    ) : null}
                    {requirement.securityBoundary ? (
                      <div className="mt-2 rounded border border-accent/20 bg-bg-root/40 px-2 py-2 text-[10px] leading-relaxed text-accent">
                        安全边界：{requirement.securityBoundary}
                      </div>
                    ) : null}
                    {requirement.releaseChecks?.length ? (
                      <div className="mt-2 grid gap-1">
                        <div className="text-[10px] font-semibold text-text-tertiary">放行检查</div>
                        {requirement.releaseChecks.slice(0, 3).map(check => (
                          <div className="rounded border border-border-subtle/70 bg-bg-root/30 px-2 py-1 text-[10px] leading-relaxed text-text-secondary" key={check}>
                            {check}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          )}

          {scaleClaimGuards.length > 0 && (
            <div className="mt-4 rounded-md border border-accent/30 bg-bg-root/50 p-3">
              <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
                  规模化数字展示保护
                </div>
                <div className="text-[10px] font-mono text-accent">
                  91M+ / 42M+ 只能作为竞品对标，不能作为 Wenai 自有指标
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {scaleClaimGuards.map(guard => (
                  <div key={guard.requestedBenchmark} className="rounded-md border border-border-subtle bg-bg-surface/40 px-3 py-3">
                    <div className="mb-1 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <div className="text-[11px] font-semibold text-text-primary">{guard.requestedBenchmark}</div>
                      <div className={`text-[9px] font-mono ${guard.canDisplay ? 'text-success' : 'text-error'}`}>
                        {guard.canDisplay ? '允许展示' : '禁止作为 Wenai 指标展示'}
                      </div>
                    </div>
                    <p className="text-[10px] leading-relaxed text-text-secondary">{guard.evidence}</p>
                    <div className="mt-2 text-[10px] leading-relaxed text-text-tertiary">
                      缺少：{guard.requiredEvidence.join(' / ')}
                    </div>
                    {guard.auditGates && guard.auditGates.length > 0 && (
                      <div className="mt-3 grid grid-cols-1 gap-1">
                        {guard.auditGates.map(gate => (
                          <div key={`${guard.requestedBenchmark}-${gate.label}`} className="rounded border border-border-subtle/70 bg-bg-root/40 px-2 py-1.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[10px] font-semibold text-text-primary">{gate.label}</span>
                              <span className={`text-[9px] font-mono ${gate.ready ? 'text-success' : gate.severity === 'P0' ? 'text-error' : 'text-accent'}`}>
                                {gate.ready ? '已过门禁' : `${gate.severity} 未过`}
                              </span>
                            </div>
                            <div className="mt-1 text-[9px] leading-relaxed text-text-tertiary">{gate.evidence}</div>
                            {!gate.ready && (
                              <div className="mt-1 text-[9px] leading-relaxed text-text-secondary">{gate.action}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 rounded-md border border-border-subtle bg-bg-root/50 p-3">
            <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
                筷子式五段能力 · Compose / Create / Cut / Cast / Manage
              </div>
              <div className="text-[10px] font-mono text-accent">
                不展示伪规模：91M+ 创意产出、42M+ 视频分发属于竞品对标，不计入 Wenai 自有成绩
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
              {kuaiziCapabilities.map(capability => (
                <div key={capability.name} className={`rounded-md border px-3 py-3 ${
                  capability.ok ? 'border-success/30 bg-success/10' : 'border-accent/30 bg-bg-surface/50'
                }`}>
                  <div className={`mb-1 text-[11px] font-semibold ${capability.ok ? 'text-success' : 'text-accent'}`}>
                    {capability.ok ? '已成闭环' : '继续补齐'}
                  </div>
                  <div className="text-[12px] font-semibold text-text-primary">{capability.name}</div>
                  <p className="mt-1 text-[10px] leading-relaxed text-text-secondary">{capability.evidence}</p>
                  <p className="mt-2 text-[10px] leading-relaxed text-text-tertiary">{capability.gap}</p>
                </div>
              ))}
            </div>
          </div>

          {maturity.friendTrialRisks.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">朋友试用风险</div>
              {maturity.friendTrialRisks.slice(0, 3).map(issue => (
                <div key={issue.title} className="rounded-md border border-accent/30 bg-bg-root/40 px-3 py-2">
                  <div className="text-[11px] font-semibold text-accent">{issue.priority} · {issue.title}</div>
                  <div className="mt-0.5 text-[10px] leading-relaxed text-text-secondary">{issue.fix}</div>
                </div>
              ))}
            </div>
          )}

          {projectMaturity && (
            <div className="mt-4 rounded-md border border-border-subtle bg-bg-root/40 p-3">
              <div className="mb-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
                  项目闭环成熟度 · {readiness?.projectId || projectId || 'default-project'}
                </div>
                <div className={`text-[11px] font-mono font-semibold ${
                  projectMaturity.verdict === 'pass' ? 'text-success' : projectMaturity.verdict === 'conditional' ? 'text-accent' : 'text-error'
                }`}>
                  {VERDICT_LABELS[projectMaturity.verdict]} · {projectMaturity.score}/100
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {projectMaturity.evidence.slice(1).map(item => {
                  const metric = formatProjectEvidenceMetric(item);
                  return (
                  <div key={item} className="rounded-md border border-border-subtle/70 bg-bg-surface/40 px-2 py-2">
                    <div className="truncate text-[9px] leading-tight text-text-tertiary">{metric.label}</div>
                    <div className="mt-1 text-[13px] font-semibold tabular-nums text-text-primary">{metric.value}</div>
                  </div>
                  );
                })}
              </div>
              {projectMaturity.missingLinks.length > 0 ? (
                <div className="mt-3 space-y-1">
                  {projectMaturity.missingLinks.slice(0, 4).map(item => (
                    <div key={item} className="text-[10px] leading-relaxed text-accent">差距：{item}</div>
                  ))}
                </div>
              ) : (
                <div className="mt-3 text-[10px] leading-relaxed text-success">
                  项目账本已具备资产、计划、分发、表现回流和下一轮迭代证据。
                </div>
              )}
              {assetPermissionAudits.length > 0 && (
                <div className="mt-4 border-t border-border-subtle/60 pt-3">
                  <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
                    资产权限访问审计
                  </div>
                  <div className="space-y-2">
                    {assetPermissionAudits.map(event => {
                      const audit = formatAssetPermissionAuditEvent(event);
                      return (
                        <div key={event.id} className="rounded-md border border-border-subtle/70 bg-bg-surface/40 px-3 py-2">
                          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                            <div className="text-[11px] font-semibold text-text-primary">
                              {audit.operationLabel} · {audit.actionLabel} · {event.assetId}
                            </div>
                            <div className={`text-[10px] font-semibold ${event.allowed ? 'text-success' : 'text-accent'}`}>
                              {audit.resultLabel}
                            </div>
                          </div>
                          <div className="mt-1 text-[10px] leading-relaxed text-text-secondary">
                            操作人：{audit.actorLabel} · 原因：{audit.reasonLabel}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {topActions.length > 0 && (
                <div className="mt-4 border-t border-border-subtle/60 pt-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
                      可执行修复队列
                    </div>
                    <a
                      href={`/api/industrial-chain/action-queue?projectId=${encodeURIComponent(projectId.trim() || 'default-project')}`}
                      className="text-[10px] font-mono text-text-tertiary hover:text-accent"
                    >
                      接口数据
                    </a>
                  </div>
                  <div className="space-y-2">
                    {topActions.map(action => (
                      <div key={action.id} className="rounded-md border border-border-subtle/70 bg-bg-surface/40 px-3 py-2">
                        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                          <div className="text-[11px] font-semibold text-text-primary">
                            {action.priority} · {action.title}
                          </div>
                          <div className="text-[9px] font-mono text-text-tertiary">
                            {action.method} {action.endpoint}
                          </div>
                        </div>
                        <div className="mt-1 text-[10px] leading-relaxed text-text-secondary">
                          负责人：{action.owner} · {action.evidence}
                        </div>
                        <div className="mt-1 text-[10px] leading-relaxed text-success">
                          验收：{action.acceptance}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {health && health.services.length > 0 && (
        <div className="mb-6 space-y-2">
          <div className="mb-2 text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
            依赖服务 · 共 {health.services.length} 项
          </div>
          {health.services.map(service => {
            const serviceMeta = STATUS_META[service.status];
            return (
              <div
                key={service.name}
                className={`flex items-center gap-3 rounded-md border px-4 py-3 ${serviceMeta.border} ${serviceMeta.bg}`}
              >
                <div className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${serviceMeta.dot}`} />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-semibold text-text-primary">{service.name}</div>
                  {service.note && (
                    <div className="mt-0.5 truncate text-[10px] font-mono text-text-tertiary">
                      {service.note}
                    </div>
                  )}
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  {typeof service.latencyMs === 'number' && (
                    <span className="text-[10px] font-mono tabular-nums text-text-tertiary">
                      {service.latencyMs}ms
                    </span>
                  )}
                  <span className={`text-[11px] font-mono font-semibold ${serviceMeta.color}`}>
                    {serviceMeta.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="border-t border-border-subtle/50 pt-6 text-center">
        <p className="text-[10px] font-mono text-text-tertiary">
          发现问题请联系 <span className="text-accent">zachary.x.pku@gmail.com</span> · 48 小时内响应
        </p>
        {health?.uptime && (
          <p className="mt-2 text-[9px] font-mono text-text-tertiary/70">
            当前服务实例已运行 {Math.floor(health.uptime / 60)} 分钟
          </p>
        )}
      </div>
    </div>
  );
}

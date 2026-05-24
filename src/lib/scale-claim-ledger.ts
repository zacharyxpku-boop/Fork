export type ScaleClaimMetric = 'creative_output' | 'video_distribution';

export interface ScaleClaimLedgerRecord {
  id: string;
  orgId: string;
  projectId: string;
  metric: ScaleClaimMetric;
  count: number;
  platform: string;
  source: string;
  dateRange: string;
  dedupeRule: string;
  evidenceUrl: string;
  auditorNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScaleClaimSnapshot {
  orgId: string;
  projectId: string;
  ledgerRecordCount: number;
  creativeOutputCount: number;
  videoDistributionCount: number;
  platformBreakdownCount: number;
  evidenceUrlCount: number;
  hasDedupeRule: boolean;
  hasDateRange: boolean;
  hasAuditorNote: boolean;
  canDisplayCreativeBenchmark: boolean;
  canDisplayVideoBenchmark: boolean;
  missingLinks: string[];
  nextActions: string[];
}

export type ScaleClaimAuditGateId =
  | 'owned-ledger'
  | 'platform-breakdown'
  | 'evidence-urls'
  | 'dedupe-rule'
  | 'date-range'
  | 'auditor-note'
  | 'benchmark-threshold'
  | 'public-claim-boundary';

export interface ScaleClaimAuditGate {
  id: ScaleClaimAuditGateId;
  label: string;
  ready: boolean;
  severity: 'P0' | 'P1';
  evidence: string;
  operatorAction: string;
  publicClaimBoundary: string;
}

type ScaleClaimGlobal = typeof globalThis & {
  __wenaiScaleClaimRecords?: Map<string, ScaleClaimLedgerRecord>;
  __wenaiScaleClaimLists?: Map<string, string[]>;
};

const CREATIVE_BENCHMARK_COUNT = 91_000_000;
const VIDEO_BENCHMARK_COUNT = 42_000_000;

function stores() {
  const target = globalThis as ScaleClaimGlobal;
  if (!target.__wenaiScaleClaimRecords) target.__wenaiScaleClaimRecords = new Map();
  if (!target.__wenaiScaleClaimLists) target.__wenaiScaleClaimLists = new Map();
  return {
    records: target.__wenaiScaleClaimRecords,
    lists: target.__wenaiScaleClaimLists,
  };
}

function genId(metric: ScaleClaimMetric) {
  return `scale_${metric}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function cleanString(value: unknown, fallback: string, limit = 500) {
  return (typeof value === 'string' ? value : fallback).trim().slice(0, limit) || fallback;
}

function cleanCount(value: unknown) {
  const num = Math.floor(Number(value));
  return Number.isFinite(num) && num > 0 ? Math.min(num, 1_000_000_000) : 0;
}

function normalizeMetric(value: unknown): ScaleClaimMetric {
  return value === 'video_distribution' ? 'video_distribution' : 'creative_output';
}

export async function upsertScaleClaimRecord(
  orgId: string,
  input: Partial<ScaleClaimLedgerRecord>,
): Promise<ScaleClaimLedgerRecord> {
  const now = new Date().toISOString();
  const projectId = cleanString(input.projectId, 'default-project', 120);
  const metric = normalizeMetric(input.metric);
  const id = input.id || genId(metric);
  const existing = stores().records.get(`${orgId}:${id}`);
  const record: ScaleClaimLedgerRecord = {
    id,
    orgId,
    projectId,
    metric,
    count: cleanCount(input.count ?? existing?.count),
    platform: cleanString(input.platform ?? existing?.platform, 'manual-ledger', 120),
    source: cleanString(input.source ?? existing?.source, 'manual-audit', 120),
    dateRange: cleanString(input.dateRange ?? existing?.dateRange, '', 120),
    dedupeRule: cleanString(input.dedupeRule ?? existing?.dedupeRule, '', 500),
    evidenceUrl: cleanString(input.evidenceUrl ?? existing?.evidenceUrl, '', 1000),
    auditorNote: cleanString(input.auditorNote ?? existing?.auditorNote, '', 1000),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  const store = stores();
  store.records.set(`${orgId}:${id}`, record);
  const listKey = `${orgId}:${projectId}`;
  const list = store.lists.get(listKey) || [];
  store.lists.set(listKey, [id, ...list.filter(item => item !== id)].slice(0, 500));
  return record;
}

export async function listScaleClaimRecords(orgId: string, projectId = 'default-project', limit = 100): Promise<ScaleClaimLedgerRecord[]> {
  const store = stores();
  const ids = store.lists.get(`${orgId}:${projectId}`) || [];
  return ids.slice(0, limit).map(id => store.records.get(`${orgId}:${id}`)).filter(Boolean) as ScaleClaimLedgerRecord[];
}

export async function getScaleClaimSnapshot(orgId: string, projectId = 'default-project'): Promise<ScaleClaimSnapshot> {
  const records = await listScaleClaimRecords(orgId, projectId, 500);
  const creativeRecords = records.filter(record => record.metric === 'creative_output');
  const videoRecords = records.filter(record => record.metric === 'video_distribution');
  const creativeOutputCount = creativeRecords.reduce((sum, record) => sum + record.count, 0);
  const videoDistributionCount = videoRecords.reduce((sum, record) => sum + record.count, 0);
  const platforms = new Set(records.map(record => `${record.metric}:${record.platform}`).filter(Boolean));
  const evidenceUrlCount = records.filter(record => record.evidenceUrl.startsWith('http://') || record.evidenceUrl.startsWith('https://')).length;
  const hasDedupeRule = records.length > 0 && records.every(record => record.dedupeRule.length >= 12);
  const hasDateRange = records.length > 0 && records.every(record => /\d{4}/.test(record.dateRange));
  const hasAuditorNote = records.length > 0 && records.every(record => record.auditorNote.length >= 12);
  const evidenceReady = evidenceUrlCount === records.length && records.length > 0 && hasDedupeRule && hasDateRange && hasAuditorNote && platforms.size > 0;
  const canDisplayCreativeBenchmark = evidenceReady && creativeOutputCount >= CREATIVE_BENCHMARK_COUNT;
  const canDisplayVideoBenchmark = evidenceReady && videoDistributionCount >= VIDEO_BENCHMARK_COUNT;
  const missingLinks = [
    records.length === 0 ? 'Missing audited scale claim ledger' : '',
    creativeOutputCount === 0 ? 'Missing audited creative output count' : '',
    videoDistributionCount === 0 ? 'Missing audited video distribution count' : '',
    !hasDedupeRule ? 'Missing dedupe rule for every scale claim record' : '',
    !hasDateRange ? 'Missing audited date range for every scale claim record' : '',
    evidenceUrlCount < records.length ? 'Missing evidence URL for every scale claim record' : '',
    !hasAuditorNote ? 'Missing auditor or customer confirmation note' : '',
    creativeOutputCount > 0 && creativeOutputCount < CREATIVE_BENCHMARK_COUNT ? 'Audited creative output below 91M benchmark' : '',
    videoDistributionCount > 0 && videoDistributionCount < VIDEO_BENCHMARK_COUNT ? 'Audited video distribution below 42M benchmark' : '',
  ].filter(Boolean);

  return {
    orgId,
    projectId,
    ledgerRecordCount: records.length,
    creativeOutputCount,
    videoDistributionCount,
    platformBreakdownCount: platforms.size,
    evidenceUrlCount,
    hasDedupeRule,
    hasDateRange,
    hasAuditorNote,
    canDisplayCreativeBenchmark,
    canDisplayVideoBenchmark,
    missingLinks,
    nextActions: missingLinks.map(item => `Close scale claim gap: ${item}`),
  };
}

export function buildScaleClaimAuditChecklist(snapshot: ScaleClaimSnapshot): ScaleClaimAuditGate[] {
  const bothMetricsHaveCounts = snapshot.creativeOutputCount > 0 && snapshot.videoDistributionCount > 0;
  const allEvidenceUrlsReady = snapshot.ledgerRecordCount > 0 && snapshot.evidenceUrlCount === snapshot.ledgerRecordCount;
  const bothBenchmarksReady = snapshot.canDisplayCreativeBenchmark && snapshot.canDisplayVideoBenchmark;

  return [{
    id: 'owned-ledger',
    label: 'Wenai 自有规模账本',
    ready: snapshot.ledgerRecordCount > 0 && bothMetricsHaveCounts,
    severity: 'P0',
    evidence: `records=${snapshot.ledgerRecordCount}; creative=${snapshot.creativeOutputCount}; video=${snapshot.videoDistributionCount}`,
    operatorAction: '导入 Wenai 自有生产数量和视频分发数量，不能把竞品 91M+/42M+ 直接写成 Wenai 成绩。',
    publicClaimBoundary: '没有 Wenai 自有账本前，只能展示竞品 benchmark，不能展示为自身规模。',
  }, {
    id: 'platform-breakdown',
    label: '平台/来源拆分',
    ready: snapshot.platformBreakdownCount >= 2,
    severity: 'P1',
    evidence: `platformBreakdown=${snapshot.platformBreakdownCount}`,
    operatorAction: '补齐来源平台、生产系统或发布渠道拆分，让规模数字能追溯到具体来源。',
    publicClaimBoundary: '没有平台拆分时，不能对外使用总量数字做增长或规模证明。',
  }, {
    id: 'evidence-urls',
    label: '证据 URL 覆盖',
    ready: allEvidenceUrlsReady,
    severity: 'P0',
    evidence: `evidenceUrls=${snapshot.evidenceUrlCount}/${snapshot.ledgerRecordCount}`,
    operatorAction: '为每条账本记录补平台后台、客户确认、审计文件或内部生产系统证据 URL。',
    publicClaimBoundary: '没有逐条证据 URL 时，规模数字不得进入首页、销售材料或状态页自有指标。',
  }, {
    id: 'dedupe-rule',
    label: '去重口径',
    ready: snapshot.hasDedupeRule,
    severity: 'P0',
    evidence: `dedupe=${snapshot.hasDedupeRule ? 1 : 0}`,
    operatorAction: '明确 asset id、task id、platform receipt id 或 video id 的去重规则。',
    publicClaimBoundary: '没有去重口径时，不能展示累计产出或分发数字，避免重复计数。',
  }, {
    id: 'date-range',
    label: '审计时间范围',
    ready: snapshot.hasDateRange,
    severity: 'P0',
    evidence: `dateRange=${snapshot.hasDateRange ? 1 : 0}`,
    operatorAction: '为每条记录补 YYYY-MM-DD..YYYY-MM-DD 或明确月份区间。',
    publicClaimBoundary: '没有时间范围时，不能把历史累计数字当作当前平台规模。',
  }, {
    id: 'auditor-note',
    label: '审计/客户确认',
    ready: snapshot.hasAuditorNote,
    severity: 'P0',
    evidence: `auditorNote=${snapshot.hasAuditorNote ? 1 : 0}`,
    operatorAction: '补客户、审计人或运营负责人确认说明，说明数字来源和确认责任。',
    publicClaimBoundary: '没有确认说明时，只能内部查看，不能对外作为销售证明。',
  }, {
    id: 'benchmark-threshold',
    label: '91M+/42M+ 阈值',
    ready: bothBenchmarksReady,
    severity: 'P1',
    evidence: `creativeBenchmark=${snapshot.canDisplayCreativeBenchmark ? 1 : 0}; videoBenchmark=${snapshot.canDisplayVideoBenchmark ? 1 : 0}`,
    operatorAction: '只有创意产出达到 91M 且视频分发达到 42M，并满足全部审计条件后才允许展示同级规模。',
    publicClaimBoundary: '未达到阈值时，91M+/42M+ 必须保持为竞品对标，不是 Wenai 自有声明。',
  }, {
    id: 'public-claim-boundary',
    label: '公开展示边界',
    ready: bothBenchmarksReady && snapshot.missingLinks.length === 0,
    severity: 'P0',
    evidence: `missingLinks=${snapshot.missingLinks.length}`,
    operatorAction: '在状态页、销售材料、合作者报告中保留 fail-closed 文案，直到全部 missingLinks 清零。',
    publicClaimBoundary: '任一 P0 未通过时，公开材料只能写“对标目标/竞品 benchmark”，不能写“Wenai 已达到”。',
  }];
}

export function scaleClaimSnapshotFacts(snapshot: ScaleClaimSnapshot) {
  return {
    auditedScaleLedgerRecordCount: snapshot.ledgerRecordCount,
    auditedCreativeOutputCount: snapshot.creativeOutputCount,
    auditedVideoDistributionCount: snapshot.videoDistributionCount,
    auditedScalePlatformBreakdownCount: snapshot.platformBreakdownCount,
    auditedScaleEvidenceUrlCount: snapshot.evidenceUrlCount,
    auditedScaleHasDedupeRule: snapshot.hasDedupeRule,
    auditedScaleHasDateRange: snapshot.hasDateRange,
    auditedScaleHasAuditorNote: snapshot.hasAuditorNote,
    auditedScaleCanDisplayCreativeBenchmark: snapshot.canDisplayCreativeBenchmark,
    auditedScaleCanDisplayVideoBenchmark: snapshot.canDisplayVideoBenchmark,
    auditedScaleMissingLinks: snapshot.missingLinks,
  };
}

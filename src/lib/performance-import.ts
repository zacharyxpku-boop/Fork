export interface PerformanceImportRow {
  sku: string;
  asset: string;
  platform: string;
  impressions: number;
  clicks: number;
  spend: number;
  orders: number;
  revenue: number;
}

export interface PerformanceImportDecision {
  row: PerformanceImportRow;
  ctr: number;
  cpc: number | null;
  conversionRate: number;
  roas: number | null;
  decision: 'scale' | 'iterate' | 'pause';
  nextAction: string;
}

export interface PerformanceImportReport {
  rows: PerformanceImportRow[];
  decisions: PerformanceImportDecision[];
  summary: {
    totalSpend: number;
    totalRevenue: number;
    averageCtr: number;
    averageConversionRate: number;
    scaleCount: number;
    iterateCount: number;
    pauseCount: number;
  };
  acceptanceNotes: string[];
}

function parseNumber(value: string | undefined) {
  if (!value) return 0;
  const cleaned = value.replace(/[,%$¥￥\s]/g, '');
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells.map(cell => cell.replace(/^"|"$/g, '').trim());
}

function normalizeHeader(header: string) {
  return header.trim().toLowerCase().replace(/\s+/g, '_');
}

export function parsePerformanceCsv(csv: string): PerformanceImportRow[] {
  const lines = csv.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  return lines.slice(1).map(line => {
    const cells = splitCsvLine(line);
    const value = (names: string[]) => {
      const index = headers.findIndex(header => names.includes(header));
      return index >= 0 ? cells[index] : '';
    };
    return {
      sku: value(['sku', 'product', 'product_name', '商品', '商品名']) || 'unknown sku',
      asset: value(['asset', 'creative', 'content', '素材', '内容']) || 'unknown asset',
      platform: value(['platform', 'channel', '平台', '渠道']) || 'unknown platform',
      impressions: parseNumber(value(['impressions', 'views', '曝光', '展示'])),
      clicks: parseNumber(value(['clicks', '点击'])),
      spend: parseNumber(value(['spend', 'cost', '花费', '消耗'])),
      orders: parseNumber(value(['orders', 'conversions', 'sales', '订单', '转化'])),
      revenue: parseNumber(value(['revenue', 'gmv', 'sales_amount', '销售额', '成交额'])),
    };
  }).filter(row => row.impressions > 0 || row.clicks > 0 || row.spend > 0 || row.orders > 0 || row.revenue > 0);
}

export function evaluatePerformanceImport(rows: PerformanceImportRow[]): PerformanceImportReport {
  const decisions = rows.map(row => {
    const ctr = row.impressions > 0 ? row.clicks / row.impressions : 0;
    const cpc = row.clicks > 0 ? row.spend / row.clicks : null;
    const conversionRate = row.clicks > 0 ? row.orders / row.clicks : 0;
    const roas = row.spend > 0 ? row.revenue / row.spend : null;
    const decision: PerformanceImportDecision['decision'] =
      (roas !== null && roas >= 2.2 && ctr >= 0.015) || (row.orders >= 3 && conversionRate >= 0.03)
        ? 'scale'
        : ctr >= 0.008 || row.orders > 0
          ? 'iterate'
          : 'pause';
    const nextAction = decision === 'scale'
      ? '保留素材方向，扩到下一批 SKU 或提高预算。'
      : decision === 'iterate'
        ? '保留受众或卖点，重写首帧/hook 后再跑一轮。'
        : '暂停该素材，把预算转给有点击或有订单的版本。';
    return { row, ctr, cpc, conversionRate, roas, decision, nextAction };
  });

  const totalSpend = rows.reduce((sum, row) => sum + row.spend, 0);
  const totalRevenue = rows.reduce((sum, row) => sum + row.revenue, 0);
  const totalImpressions = rows.reduce((sum, row) => sum + row.impressions, 0);
  const totalClicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const totalOrders = rows.reduce((sum, row) => sum + row.orders, 0);

  return {
    rows,
    decisions,
    summary: {
      totalSpend,
      totalRevenue,
      averageCtr: totalImpressions > 0 ? totalClicks / totalImpressions : 0,
      averageConversionRate: totalClicks > 0 ? totalOrders / totalClicks : 0,
      scaleCount: decisions.filter(item => item.decision === 'scale').length,
      iterateCount: decisions.filter(item => item.decision === 'iterate').length,
      pauseCount: decisions.filter(item => item.decision === 'pause').length,
    },
    acceptanceNotes: [
      'CSV 回流只做 POC 复盘决策，不替代广告平台归因。',
      '每条素材必须能追溯到 SKU、平台和 asset，避免复盘时只看总 GMV。',
      'scale / iterate / pause 可直接写入 CRM 复盘备注或下一轮标准包。',
    ],
  };
}

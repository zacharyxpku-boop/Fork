export type RestaurantRecoverSignalSource =
  | 'reservation'
  | 'coupon-claim'
  | 'inquiry'
  | 'review'
  | 'community-feedback'
  | 'visit-intent'
  | 'redemption'
  | 'manual-summary';

export type RestaurantRecoverImportStatus = 'accepted' | 'rejected';

export type RestaurantRecoverSignalRow = Record<string, unknown>;

export type RestaurantRecoverImportIssue = {
  row?: number;
  field?: string;
  severity: 'error' | 'warning';
  code: string;
  message: string;
};

export type RestaurantRecoverSignalSummary = {
  reservationCount: number;
  couponClaimCount: number;
  inquiryCount: number;
  reviewCount: number;
  communityFeedbackCount: number;
  visitIntentCount: number;
  redemptionCount: number;
};

export type RestaurantRecoverSignalImportReport = {
  ok: true;
  payloadShape: 'restaurant-recover-signal-import-v1';
  importId: string;
  status: RestaurantRecoverImportStatus;
  generatedAt: string;
  restaurantName: string;
  offerName: string;
  summary: RestaurantRecoverSignalSummary & {
    totalRows: number;
    validRows: number;
    rejectedRows: number;
    sourceCount: number;
  };
  sources: Array<{
    source: RestaurantRecoverSignalSource;
    owner: string;
    evidence: string;
    status: 'ready-for-review' | 'needs-cleanup';
  }>;
  issues: RestaurantRecoverImportIssue[];
  sanitizedPreview: Array<{
    source: RestaurantRecoverSignalSource;
    owner: string;
    evidence: string;
    counts: RestaurantRecoverSignalSummary;
  }>;
  nextActions: string[];
  safetyBoundary: string;
};

const SOURCE_LABELS: Record<RestaurantRecoverSignalSource, string> = {
  reservation: '预约',
  'coupon-claim': '券领取',
  inquiry: '咨询',
  review: '评价',
  'community-feedback': '社群反馈',
  'visit-intent': '到店意向',
  redemption: '核销',
  'manual-summary': '人工汇总',
};

const ALLOWED_SOURCES: RestaurantRecoverSignalSource[] = [
  'reservation',
  'coupon-claim',
  'inquiry',
  'review',
  'community-feedback',
  'visit-intent',
  'redemption',
  'manual-summary',
];

const FORBIDDEN_FIELD_PATTERNS = [
  /phone|mobile|tel|contact/i,
  /wechat|weixin|wx/i,
  /private.*message|message.*text|chat.*text|transcript/i,
  /coupon.*code|voucher.*code|redeem.*code/i,
  /order.*id|order.*detail|payment.*id|transaction.*id|trade.*id/i,
  /raw.*pos|pos.*row|line.*item/i,
  /cookie|token|api.*key|secret/i,
  /手机号|电话|联系方式|微信|私信原文|聊天原文|优惠码|券码|订单明细|订单号|支付流水|交易号|原始 POS|原始pos|收银明细|顾客姓名|会员姓名|地址|身份证|密钥|令牌/,
];

const FORBIDDEN_VALUE_PATTERNS = [
  /(?:\+?86[-\s]?)?1[3-9]\d{9}/,
  /(?:微信|wechat|weixin|wx)[:：\s-]*[a-zA-Z][-_a-zA-Z0-9]{5,19}/i,
  /(?:优惠码|券码|coupon code|code)[:：\s-]*[-_a-zA-Z0-9]{4,}/i,
  /(?:订单号|order id|payment id|支付流水|交易号)[:：\s-]*[-_a-zA-Z0-9]{4,}/i,
  /(?:cookie|token|api key|secret|bearer)[=:：\s-]+[-_.a-zA-Z0-9]{8,}/i,
];

function stableId(parts: Array<string | number>): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 33 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function cleanText(value: unknown, fallback: string, max = 120): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function normalizeSource(value: unknown): RestaurantRecoverSignalSource | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim().toLowerCase().replace(/_/g, '-');
  return ALLOWED_SOURCES.includes(normalized as RestaurantRecoverSignalSource)
    ? normalized as RestaurantRecoverSignalSource
    : undefined;
}

function readCount(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return 0;
  const numberValue = typeof value === 'string' ? Number(value.replace(/[,\s]/g, '')) : Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) return undefined;
  return Math.min(Math.floor(numberValue), 1_000_000);
}

function emptySummary(): RestaurantRecoverSignalSummary {
  return {
    reservationCount: 0,
    couponClaimCount: 0,
    inquiryCount: 0,
    reviewCount: 0,
    communityFeedbackCount: 0,
    visitIntentCount: 0,
    redemptionCount: 0,
  };
}

function addSummary(left: RestaurantRecoverSignalSummary, right: RestaurantRecoverSignalSummary): RestaurantRecoverSignalSummary {
  return {
    reservationCount: left.reservationCount + right.reservationCount,
    couponClaimCount: left.couponClaimCount + right.couponClaimCount,
    inquiryCount: left.inquiryCount + right.inquiryCount,
    reviewCount: left.reviewCount + right.reviewCount,
    communityFeedbackCount: left.communityFeedbackCount + right.communityFeedbackCount,
    visitIntentCount: left.visitIntentCount + right.visitIntentCount,
    redemptionCount: left.redemptionCount + right.redemptionCount,
  };
}

function issue(input: Omit<RestaurantRecoverImportIssue, 'severity'> & { severity?: RestaurantRecoverImportIssue['severity'] }): RestaurantRecoverImportIssue {
  return {
    severity: input.severity || 'error',
    code: input.code,
    message: input.message,
    row: input.row,
    field: input.field,
  };
}

export function detectRecoverSignalSensitiveFields(row: RestaurantRecoverSignalRow): string[] {
  return Object.keys(row).filter(field => FORBIDDEN_FIELD_PATTERNS.some(pattern => pattern.test(field)));
}

export function detectRecoverSignalSensitiveValues(row: RestaurantRecoverSignalRow): string[] {
  return Object.entries(row)
    .filter(([field, value]) => (
      FORBIDDEN_FIELD_PATTERNS.some(pattern => pattern.test(field))
      || (typeof value === 'string' && FORBIDDEN_VALUE_PATTERNS.some(pattern => pattern.test(value)))
    ))
    .map(([field]) => field);
}

function countsFromRow(row: RestaurantRecoverSignalRow): RestaurantRecoverSignalSummary | undefined {
  const values = {
    reservationCount: readCount(row.reservationCount),
    couponClaimCount: readCount(row.couponClaimCount),
    inquiryCount: readCount(row.inquiryCount),
    reviewCount: readCount(row.reviewCount),
    communityFeedbackCount: readCount(row.communityFeedbackCount),
    visitIntentCount: readCount(row.visitIntentCount),
    redemptionCount: readCount(row.redemptionCount),
  };
  if (Object.values(values).some(value => value === undefined)) return undefined;
  return values as RestaurantRecoverSignalSummary;
}

export function buildRestaurantRecoverSignalImportReport(input: {
  rows?: RestaurantRecoverSignalRow[];
  restaurantName?: string;
  offerName?: string;
  now?: Date;
} = {}): RestaurantRecoverSignalImportReport {
  const rows = Array.isArray(input.rows) ? input.rows.slice(0, 200) : [];
  const issues: RestaurantRecoverImportIssue[] = [];
  const sanitizedPreview: RestaurantRecoverSignalImportReport['sanitizedPreview'] = [];
  const sourceMap = new Map<RestaurantRecoverSignalSource, RestaurantRecoverSignalImportReport['sources'][number]>();
  let summary = emptySummary();
  let validRows = 0;

  if (!Array.isArray(input.rows)) {
    issues.push(issue({ code: 'rows_missing', message: 'Recover import requires a rows array.' }));
  }
  if (Array.isArray(input.rows) && input.rows.length > 200) {
    issues.push(issue({ severity: 'warning', code: 'rows_truncated', message: 'Only the first 200 rows are validated in one import.' }));
  }

  rows.forEach((row, index) => {
    const rowNumber = index + 1;
    const source = normalizeSource(row.source);
    if (!source) {
      issues.push(issue({
        row: rowNumber,
        field: 'source',
        code: 'invalid_source',
        message: 'source must be reservation, coupon-claim, inquiry, review, community-feedback, visit-intent, redemption, or manual-summary.',
      }));
    }

    const forbiddenFields = detectRecoverSignalSensitiveFields(row);
    forbiddenFields.forEach(field => issues.push(issue({
      row: rowNumber,
      field,
      code: 'forbidden_sensitive_field',
      message: `${field} may contain private customer data and cannot be imported.`,
    })));

    const forbiddenValues = detectRecoverSignalSensitiveValues(row);
    forbiddenValues.forEach(field => issues.push(issue({
      row: rowNumber,
      field,
      code: 'forbidden_sensitive_value',
      message: `${field} contains phone, WeChat, coupon code, order id, token, or another private value.`,
    })));

    const counts = countsFromRow(row);
    if (!counts) {
      issues.push(issue({
        row: rowNumber,
        code: 'invalid_count_field',
        message: 'Recover counts must be non-negative numbers.',
      }));
    }

    const hasRowError = issues.some(item => item.row === rowNumber && item.severity === 'error');
    if (!hasRowError && source && counts) {
      validRows += 1;
      summary = addSummary(summary, counts);
      const owner = cleanText(row.owner, '店长/运营');
      const evidence = cleanText(row.evidence, `${SOURCE_LABELS[source]}脱敏汇总`);
      sourceMap.set(source, {
        source,
        owner,
        evidence,
        status: 'ready-for-review',
      });
      if (sanitizedPreview.length < 6) {
        sanitizedPreview.push({ source, owner, evidence, counts });
      }
    }
  });

  const rejectedRows = rows.length - validRows;
  const hasErrors = issues.some(item => item.severity === 'error');
  const status: RestaurantRecoverImportStatus = !hasErrors && validRows > 0 ? 'accepted' : 'rejected';
  const importId = `restaurant-recover-import-${stableId([
    rows.length,
    validRows,
    summary.reservationCount,
    summary.couponClaimCount,
    summary.inquiryCount,
    summary.redemptionCount,
  ])}`;

  const sources = Array.from(sourceMap.values());
  const nextActions = status === 'accepted'
    ? [
        '把脱敏回流汇总交给店长确认，再进入 Review Loop。',
        '对照发布凭证账本，找出领券到核销、咨询到到店的断点。',
        '只把聚合数字写入门店记忆，不写入顾客身份或原始记录。',
      ]
    : [
        '删除手机号、微信号、私信原文、优惠码、订单明细和原始 POS 行后重新导入。',
        '每行只保留来源、负责人、证明材料和聚合数量。',
        '没有脱敏汇总前，不进入经营归因或放大建议。',
      ];

  return {
    ok: true,
    payloadShape: 'restaurant-recover-signal-import-v1',
    importId,
    status,
    generatedAt: (input.now || new Date()).toISOString(),
    restaurantName: cleanText(input.restaurantName, '样例餐厅'),
    offerName: cleanText(input.offerName, '招牌套餐'),
    summary: {
      ...summary,
      totalRows: rows.length,
      validRows,
      rejectedRows,
      sourceCount: sources.length,
    },
    sources,
    issues,
    sanitizedPreview,
    nextActions,
    safetyBoundary: 'Recover import only stores aggregate counts for reservations, coupon claims, inquiries, reviews, community feedback, visit intent and redemptions. It rejects phone numbers, WeChat IDs, private-message text, coupon codes, order details, raw POS rows, cookies, tokens and API keys.',
  };
}

export const RESTAURANT_RECOVER_SIGNAL_DEMO_ROWS: RestaurantRecoverSignalRow[] = [
  {
    source: 'reservation',
    owner: '店长',
    evidence: '预约汇总截图',
    reservationCount: 6,
    couponClaimCount: 0,
    inquiryCount: 1,
    reviewCount: 0,
    communityFeedbackCount: 0,
    visitIntentCount: 4,
    redemptionCount: 0,
  },
  {
    source: 'coupon-claim',
    owner: '运营',
    evidence: '团购券后台汇总',
    reservationCount: 0,
    couponClaimCount: 18,
    inquiryCount: 2,
    reviewCount: 0,
    communityFeedbackCount: 0,
    visitIntentCount: 5,
    redemptionCount: 7,
  },
  {
    source: 'community-feedback',
    owner: '社群负责人',
    evidence: '社群反馈脱敏计数',
    reservationCount: 0,
    couponClaimCount: 3,
    inquiryCount: 9,
    reviewCount: 1,
    communityFeedbackCount: 12,
    visitIntentCount: 8,
    redemptionCount: 0,
  },
];

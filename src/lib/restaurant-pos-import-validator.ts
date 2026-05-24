export type RestaurantPosImportStatus = 'accepted' | 'rejected';

export type RestaurantPosImportRow = Record<string, unknown>;

export type RestaurantPosImportIssue = {
  row?: number;
  field?: string;
  severity: 'error' | 'warning';
  code: string;
  message: string;
};

export type RestaurantPosImportSummary = {
  totalRows: number;
  validRows: number;
  rejectedRows: number;
  couponClaimCount: number;
  redemptionCount: number;
  orderCount: number;
  grossSalesCents: number;
  inventoryUsed: number;
  redemptionRatePct: number;
};

export type RestaurantPosImportReport = {
  ok: true;
  importId: string;
  status: RestaurantPosImportStatus;
  generatedAt: string;
  payloadShape: 'restaurant-pos-import-v1';
  schema: {
    required: string[];
    optional: string[];
    forbidden: string[];
  };
  summary: RestaurantPosImportSummary;
  issues: RestaurantPosImportIssue[];
  sanitizedPreview: Array<Record<string, string | number>>;
  receiptDraft?: {
    eventId: string;
    channel: 'POS manual import';
    externalRunId: string;
    signalType: 'redemption';
    summary: string;
    couponClaimCount: number;
    redemptionCount: number;
  };
  nextActions: string[];
  safetyBoundary: string;
};

const REQUIRED_FIELDS = [
  'businessDate',
  'storeName',
  'offerName',
  'couponClaimCount',
  'redemptionCount',
  'grossSales',
  'orderCount',
] as const;

const OPTIONAL_FIELDS = [
  'channel',
  'inventoryUsed',
  'averageTicket',
  'evidenceUrl',
  'operator',
] as const;

const FORBIDDEN_FIELD_PATTERNS = [
  /phone|mobile|tel|contact/i,
  /wechat|weixin|wx/i,
  /customer.*name|member.*name|real.*name/i,
  /id.?card|identity|passport/i,
  /address|location/i,
  /payment.*id|transaction.*id|trade.*id/i,
  /手机号|电话|微信|姓名|会员名|身份证|证件|地址|支付流水|交易号|订单明细/,
];

function stableId(parts: Array<string | number>): string {
  const text = parts.join('|');
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 33 + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

function cleanText(value: unknown, fallback: string, max = 80): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const normalized = value.replace(/[,￥¥\s]/g, '');
    if (normalized && Number.isFinite(Number(normalized))) return Number(normalized);
  }
  return undefined;
}

function asCount(value: unknown): number | undefined {
  const number = readNumber(value);
  if (number === undefined || number < 0) return undefined;
  return Math.floor(number);
}

function moneyToCents(value: unknown): number | undefined {
  const number = readNumber(value);
  if (number === undefined || number < 0) return undefined;
  return Math.round(number * 100);
}

function hasSensitiveField(row: RestaurantPosImportRow): string[] {
  return Object.keys(row).filter(field => FORBIDDEN_FIELD_PATTERNS.some(pattern => pattern.test(field)));
}

function hasSensitiveValue(row: RestaurantPosImportRow): boolean {
  return Object.values(row).some(value => {
    if (typeof value !== 'string') return false;
    return /1[3-9]\d{9}/.test(value)
      || /(wechat|weixin|wx:|手机号|电话|微信|身份证|住址|地址)/i.test(value);
  });
}

function issue(input: Omit<RestaurantPosImportIssue, 'severity'> & { severity?: RestaurantPosImportIssue['severity'] }): RestaurantPosImportIssue {
  return {
    severity: input.severity || 'error',
    code: input.code,
    message: input.message,
    row: input.row,
    field: input.field,
  };
}

export function buildRestaurantPosImportReport(
  input: {
    rows?: RestaurantPosImportRow[];
    eventId?: string;
    now?: Date;
  } = {},
): RestaurantPosImportReport {
  const rows = Array.isArray(input.rows) ? input.rows.slice(0, 200) : [];
  const issues: RestaurantPosImportIssue[] = [];
  const sanitizedPreview: Array<Record<string, string | number>> = [];

  if (!Array.isArray(input.rows)) {
    issues.push(issue({ code: 'rows_missing', message: 'POS import requires rows array.' }));
  }
  if (Array.isArray(input.rows) && input.rows.length > 200) {
    issues.push(issue({ severity: 'warning', code: 'rows_truncated', message: 'Only the first 200 rows are validated in one import.' }));
  }

  let couponClaimCount = 0;
  let redemptionCount = 0;
  let orderCount = 0;
  let grossSalesCents = 0;
  let inventoryUsed = 0;
  let validRows = 0;
  const stores = new Set<string>();
  const offers = new Set<string>();

  rows.forEach((row, index) => {
    const rowNumber = index + 1;
    const missing = REQUIRED_FIELDS.filter(field => row[field] === undefined || row[field] === null || row[field] === '');
    missing.forEach(field => issues.push(issue({
      row: rowNumber,
      field,
      code: 'required_field_missing',
      message: `${field} is required for POS redemption validation.`,
    })));

    const forbiddenFields = hasSensitiveField(row);
    forbiddenFields.forEach(field => issues.push(issue({
      row: rowNumber,
      field,
      code: 'forbidden_sensitive_field',
      message: `${field} may contain customer PII and cannot be imported.`,
    })));
    if (hasSensitiveValue(row)) {
      issues.push(issue({
        row: rowNumber,
        code: 'forbidden_sensitive_value',
        message: 'Row contains phone, WeChat, address, ID card, or private-message text.',
      }));
    }

    const rowCouponClaims = asCount(row.couponClaimCount);
    const rowRedemptions = asCount(row.redemptionCount);
    const rowOrders = asCount(row.orderCount);
    const rowGrossSales = moneyToCents(row.grossSales);
    const rowInventoryUsed = asCount(row.inventoryUsed) || 0;

    [
      ['couponClaimCount', rowCouponClaims],
      ['redemptionCount', rowRedemptions],
      ['orderCount', rowOrders],
      ['grossSales', rowGrossSales],
    ].forEach(([field, value]) => {
      if (value === undefined) {
        issues.push(issue({
          row: rowNumber,
          field: String(field),
          code: 'invalid_numeric_field',
          message: `${field} must be a non-negative number.`,
        }));
      }
    });

    if (rowCouponClaims !== undefined && rowRedemptions !== undefined && rowRedemptions > rowCouponClaims) {
      issues.push(issue({
        row: rowNumber,
        field: 'redemptionCount',
        severity: 'warning',
        code: 'redemptions_exceed_claims',
        message: 'Redemptions exceed coupon claims; confirm whether this row mixes walk-in orders and coupon redemptions.',
      }));
    }

    const hasRowError = issues.some(item => item.row === rowNumber && item.severity === 'error');
    if (!hasRowError && rowCouponClaims !== undefined && rowRedemptions !== undefined && rowOrders !== undefined && rowGrossSales !== undefined) {
      validRows += 1;
      couponClaimCount += rowCouponClaims;
      redemptionCount += rowRedemptions;
      orderCount += rowOrders;
      grossSalesCents += rowGrossSales;
      inventoryUsed += rowInventoryUsed;
      stores.add(cleanText(row.storeName, 'unknown store'));
      offers.add(cleanText(row.offerName, 'unknown offer'));
      if (sanitizedPreview.length < 5) {
        sanitizedPreview.push({
          businessDate: cleanText(row.businessDate, 'unknown date', 32),
          storeName: cleanText(row.storeName, 'unknown store'),
          offerName: cleanText(row.offerName, 'unknown offer'),
          couponClaimCount: rowCouponClaims,
          redemptionCount: rowRedemptions,
          grossSales: Math.round(rowGrossSales / 100),
          orderCount: rowOrders,
        });
      }
    }
  });

  const rejectedRows = rows.length - validRows;
  const hasErrors = issues.some(item => item.severity === 'error');
  const status: RestaurantPosImportStatus = !hasErrors && validRows > 0 ? 'accepted' : 'rejected';
  const importId = `restaurant-pos-import-${stableId([
    rows.length,
    validRows,
    couponClaimCount,
    redemptionCount,
    grossSalesCents,
    input.eventId || 'no-event',
  ])}`;
  const eventId = cleanText(input.eventId, importId, 96);
  const redemptionRatePct = couponClaimCount > 0 ? Math.round((redemptionCount / couponClaimCount) * 100) : 0;
  const receiptDraft = status === 'accepted'
    ? {
        eventId,
        channel: 'POS manual import' as const,
        externalRunId: importId,
        signalType: 'redemption' as const,
        summary: `POS import validated ${validRows} rows for ${stores.size || 1} store(s), ${offers.size || 1} offer(s), ${redemptionCount} redemptions, ${orderCount} orders and gross sales ${(grossSalesCents / 100).toFixed(2)}.`,
        couponClaimCount,
        redemptionCount,
      }
    : undefined;

  return {
    ok: true,
    importId,
    status,
    generatedAt: (input.now || new Date()).toISOString(),
    payloadShape: 'restaurant-pos-import-v1',
    schema: {
      required: [...REQUIRED_FIELDS],
      optional: [...OPTIONAL_FIELDS],
      forbidden: ['phone/mobile/contact', 'wechat/weixin', 'customer/member name', 'id card', 'address', 'payment/transaction/order detail identifiers'],
    },
    summary: {
      totalRows: rows.length,
      validRows,
      rejectedRows,
      couponClaimCount,
      redemptionCount,
      orderCount,
      grossSalesCents,
      inventoryUsed,
      redemptionRatePct,
    },
    issues,
    sanitizedPreview,
    receiptDraft,
    nextActions: status === 'accepted'
      ? [
          'Promote only the aggregate receipt draft into run health and business signals.',
          'Ask the store owner to confirm redemption definition before calling it true operating analysis.',
          'Keep raw POS rows outside Wenai unless a merchant data contract and storage policy are approved.',
        ]
      : [
          'Remove PII/private fields and refill required POS columns.',
          'Confirm coupon claim, redemption, order and gross sales definitions with the merchant.',
          'Re-import a sanitized CSV/sheet export before any auto-redemption or operating analysis claim.',
        ],
    safetyBoundary: 'POS import validates schema and aggregates only. Raw order rows, phone numbers, WeChat IDs, customer names, addresses, payment identifiers, private messages and POS line-item details are not stored or returned.',
  };
}

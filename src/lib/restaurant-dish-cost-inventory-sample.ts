export type RestaurantDishCostInventoryRow = Record<string, unknown>;

export type RestaurantDishCostInventoryIssue = {
  row: number;
  field: string;
  severity: 'warning' | 'error';
  code: 'missing-required-field' | 'unsafe-field' | 'unsafe-value';
  message: string;
};

export type RestaurantDishCostInventorySampleRow = {
  dishName: string;
  ingredientName: string;
  unit: string;
  plannedUsage: number;
  stockOnHand: number;
  reorderPoint: number;
  purchaseCost: number;
  wasteCount: number;
  evidence: string;
  owner: '店长' | '后厨' | '采购' | '财务';
};

export type RestaurantDishCostInventoryQuestion = {
  owner: '店长' | '后厨' | '采购' | '财务';
  question: string;
  evidenceRequired: string;
};

export type RestaurantDishCostInventoryTemplateColumn = {
  field: keyof RestaurantDishCostInventorySampleRow;
  label: string;
  required: boolean;
  example: string;
};

export type RestaurantDishCostInventoryPasteTemplate = {
  payloadShape: 'restaurant-dish-cost-inventory-paste-template-v1';
  columns: RestaurantDishCostInventoryTemplateColumn[];
  sampleText: string;
  forbiddenColumns: string[];
  stopLine: string;
};

export type RestaurantDishCostInventoryPasteParse = {
  ok: true;
  payloadShape: 'restaurant-dish-cost-inventory-paste-parse-v1';
  template: RestaurantDishCostInventoryPasteTemplate;
  rows: RestaurantDishCostInventoryRow[];
  summary: {
    totalLines: number;
    dataRows: number;
    columns: number;
  };
  warnings: string[];
};

export type RestaurantDishCostInventoryReport = {
  ok: true;
  payloadShape: 'restaurant-dish-cost-inventory-sample-v1';
  generatedAt: string;
  restaurantName: string;
  offerName: string;
  status: 'ready-for-review' | 'needs-cleanup' | 'missing-data-contract';
  summary: {
    totalRows: number;
    validRows: number;
    rejectedRows: number;
    dishCount: number;
    ingredientCount: number;
    needsReorderCount: number;
    wasteRiskCount: number;
    canClaimGrossMargin: false;
    canClaimInventoryOptimization: false;
  };
  sampleRows: RestaurantDishCostInventorySampleRow[];
  issues: RestaurantDishCostInventoryIssue[];
  ownerQuestions: RestaurantDishCostInventoryQuestion[];
  nextActions: string[];
  stopLines: string[];
  safetyBoundary: string;
};

const REQUIRED_FIELDS = [
  'dishName',
  'ingredientName',
  'unit',
  'plannedUsage',
  'stockOnHand',
  'reorderPoint',
  'purchaseCost',
] as const;

export const RESTAURANT_DISH_COST_INVENTORY_TEMPLATE_COLUMNS: RestaurantDishCostInventoryTemplateColumn[] = [
  { field: 'dishName', label: '菜品/套餐', required: true, example: '招牌牛肉面套餐' },
  { field: 'ingredientName', label: '原料', required: true, example: '牛腱子' },
  { field: 'unit', label: '单位', required: true, example: 'kg' },
  { field: 'plannedUsage', label: '计划用量', required: true, example: '8' },
  { field: 'stockOnHand', label: '当前库存', required: true, example: '12' },
  { field: 'reorderPoint', label: '补货线', required: true, example: '10' },
  { field: 'purchaseCost', label: '采购成本', required: true, example: '78' },
  { field: 'wasteCount', label: '损耗', required: false, example: '1' },
  { field: 'evidence', label: '证据', required: false, example: '后厨备货汇总表' },
  { field: 'owner', label: '负责人', required: false, example: '后厨' },
];

const UNSAFE_FIELD_PATTERNS = [
  /phone|mobile|tel|contact/i,
  /wechat|weixin|\bwx\b/i,
  /private.*message|chat.*transcript|messageBody/i,
  /coupon.*code|voucher.*code|promo.*code/i,
  /order.*id|payment.*id|transaction|trade.*id/i,
  /raw.*pos|pos.*row|line.*item/i,
  /cookie|token|api.*key|secret|password/i,
  /customer|member.*id|member.*name|address/i,
  /bank|payroll/i,
];

const HEADER_ALIASES: Record<string, keyof RestaurantDishCostInventorySampleRow> = {
  dish: 'dishName',
  dishname: 'dishName',
  offer: 'dishName',
  item: 'dishName',
  ingredient: 'ingredientName',
  ingredientname: 'ingredientName',
  material: 'ingredientName',
  unit: 'unit',
  plannedusage: 'plannedUsage',
  planned: 'plannedUsage',
  usage: 'plannedUsage',
  stock: 'stockOnHand',
  stockonhand: 'stockOnHand',
  inventory: 'stockOnHand',
  reorderpoint: 'reorderPoint',
  reorder: 'reorderPoint',
  purchasecost: 'purchaseCost',
  cost: 'purchaseCost',
  waste: 'wasteCount',
  wastecount: 'wasteCount',
  evidence: 'evidence',
  owner: 'owner',
  '菜品': 'dishName',
  '菜品套餐': 'dishName',
  '菜品/套餐': 'dishName',
  '套餐': 'dishName',
  '原料': 'ingredientName',
  '食材': 'ingredientName',
  '单位': 'unit',
  '计划用量': 'plannedUsage',
  '用量': 'plannedUsage',
  '当前库存': 'stockOnHand',
  '库存': 'stockOnHand',
  '补货线': 'reorderPoint',
  '采购成本': 'purchaseCost',
  '成本': 'purchaseCost',
  '损耗': 'wasteCount',
  '证据': 'evidence',
  '负责人': 'owner',
};

const UNSAFE_VALUE_PATTERNS = [
  /\b1[3-9]\d{9}\b/,
  /wxid[_-]?[a-z0-9]+/i,
  /wechat[:=]/i,
  /token[:=]/i,
  /api[_-]?key[:=]/i,
  /cookie[:=]/i,
  /coupon[:=]/i,
  /order[_-]?id[:=]/i,
  /payment[_-]?id[:=]/i,
  /raw\s*pos/i,
];

export const RESTAURANT_DISH_COST_INVENTORY_DEMO_ROWS: RestaurantDishCostInventoryRow[] = [
  {
    dishName: '招牌牛肉面套餐',
    ingredientName: '牛腱子',
    unit: 'kg',
    plannedUsage: 8,
    stockOnHand: 12,
    reorderPoint: 10,
    purchaseCost: 78,
    wasteCount: 1,
    evidence: '后厨备货汇总表',
    owner: '后厨',
  },
  {
    dishName: '招牌牛肉面套餐',
    ingredientName: '手工面',
    unit: '份',
    plannedUsage: 80,
    stockOnHand: 66,
    reorderPoint: 70,
    purchaseCost: 2.4,
    wasteCount: 6,
    evidence: '日备餐盘点表',
    owner: '采购',
  },
  {
    dishName: '番茄牛腩饭',
    ingredientName: '番茄底料',
    unit: '袋',
    plannedUsage: 18,
    stockOnHand: 24,
    reorderPoint: 12,
    purchaseCost: 9.8,
    wasteCount: 0,
    evidence: '采购样表',
    owner: '店长',
  },
];

function cleanText(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed || fallback;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.max(0, value);
  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    if (Number.isFinite(parsed)) return Math.max(0, parsed);
  }
  return fallback;
}

function cleanOwner(value: unknown): RestaurantDishCostInventorySampleRow['owner'] {
  return value === '店长' || value === '后厨' || value === '采购' || value === '财务' ? value : '店长';
}

function normalizeHeader(value: string): string {
  return value.trim().replace(/[\s_-]+/g, '').toLowerCase();
}

function parseDelimitedLine(line: string, delimiter: ',' | '\t'): string[] {
  if (delimiter === '\t') return line.split('\t').map(item => item.trim());
  const cells: string[] = [];
  let current = '';
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
}

function chooseDelimiter(line: string): ',' | '\t' {
  return line.includes('\t') ? '\t' : ',';
}

function buildTemplateSampleText(): string {
  const labels = RESTAURANT_DISH_COST_INVENTORY_TEMPLATE_COLUMNS.map(column => column.label).join('\t');
  const examples = RESTAURANT_DISH_COST_INVENTORY_TEMPLATE_COLUMNS.map(column => column.example).join('\t');
  return `${labels}\n${examples}`;
}

export function buildRestaurantDishCostInventoryPasteTemplate(): RestaurantDishCostInventoryPasteTemplate {
  return {
    payloadShape: 'restaurant-dish-cost-inventory-paste-template-v1',
    columns: RESTAURANT_DISH_COST_INVENTORY_TEMPLATE_COLUMNS,
    sampleText: buildTemplateSampleText(),
    forbiddenColumns: ['phone', 'wechat', 'privateMessage', 'couponCode', 'orderId', 'paymentId', 'rawPosRow', 'cookie', 'token', 'apiKey'],
    stopLine: '只粘贴菜品、原料、用量、库存、补货线、采购成本、损耗、证据和负责人；不要粘贴顾客、聊天、券码、订单、支付或密钥信息。',
  };
}

export function parseRestaurantDishCostInventoryPaste(input: {
  text: string;
}): RestaurantDishCostInventoryPasteParse {
  const template = buildRestaurantDishCostInventoryPasteTemplate();
  const lines = input.text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return {
      ok: true,
      payloadShape: 'restaurant-dish-cost-inventory-paste-parse-v1',
      template,
      rows: [],
      summary: { totalLines: 0, dataRows: 0, columns: 0 },
      warnings: ['empty-paste'],
    };
  }

  const delimiter = chooseDelimiter(lines[0]);
  const rawHeaders = parseDelimitedLine(lines[0], delimiter);
  const mappedHeaders = rawHeaders.map(header => HEADER_ALIASES[normalizeHeader(header)] || header.trim());
  const warnings = mappedHeaders.some((header, index) => header === rawHeaders[index].trim())
    ? ['unknown-columns-kept-for-safety-check']
    : [];

  const rows = lines.slice(1).map(line => {
    const cells = parseDelimitedLine(line, delimiter);
    return mappedHeaders.reduce<RestaurantDishCostInventoryRow>((row, header, index) => {
      if (header) row[header] = cells[index] ?? '';
      return row;
    }, {});
  });

  return {
    ok: true,
    payloadShape: 'restaurant-dish-cost-inventory-paste-parse-v1',
    template,
    rows,
    summary: {
      totalLines: lines.length,
      dataRows: rows.length,
      columns: rawHeaders.length,
    },
    warnings,
  };
}

function inspectUnsafe(row: RestaurantDishCostInventoryRow, rowIndex: number): RestaurantDishCostInventoryIssue[] {
  const issues: RestaurantDishCostInventoryIssue[] = [];

  for (const [field, value] of Object.entries(row)) {
    if (UNSAFE_FIELD_PATTERNS.some(pattern => pattern.test(field))) {
      issues.push({
        row: rowIndex,
        field,
        severity: 'error',
        code: 'unsafe-field',
        message: '样表只能使用菜品、用量、库存、补货线、采购成本和损耗等汇总字段。',
      });
    }

    if (typeof value === 'string' && UNSAFE_VALUE_PATTERNS.some(pattern => pattern.test(value))) {
      issues.push({
        row: rowIndex,
        field,
        severity: 'error',
        code: 'unsafe-value',
        message: '样表不能包含顾客联系方式、聊天内容、券码、订单标识或密钥线索。',
      });
    }
  }

  return issues;
}

function inspectMissing(row: RestaurantDishCostInventoryRow, rowIndex: number): RestaurantDishCostInventoryIssue[] {
  return REQUIRED_FIELDS
    .filter(field => row[field] === undefined || row[field] === null || row[field] === '')
    .map(field => ({
      row: rowIndex,
      field,
      severity: 'error' as const,
      code: 'missing-required-field' as const,
      message: '缺少样表必填字段，无法交给店长复核。',
    }));
}

export function buildRestaurantDishCostInventorySample(input: {
  restaurantName?: string;
  offerName?: string;
  rows?: RestaurantDishCostInventoryRow[];
  now?: Date;
} = {}): RestaurantDishCostInventoryReport {
  const rows = input.rows === undefined ? RESTAURANT_DISH_COST_INVENTORY_DEMO_ROWS : input.rows;
  const issues = rows.flatMap((row, index) => [
    ...inspectUnsafe(row, index + 1),
    ...inspectMissing(row, index + 1),
  ]);
  const rejectedIndexes = new Set(issues.filter(issue => issue.severity === 'error').map(issue => issue.row));

  const sampleRows = rows
    .filter((_, index) => !rejectedIndexes.has(index + 1))
    .map(row => {
      const stockOnHand = toNumber(row.stockOnHand);
      const reorderPoint = toNumber(row.reorderPoint);
      const wasteCount = toNumber(row.wasteCount);

      return {
        dishName: cleanText(row.dishName, '待确认菜品'),
        ingredientName: cleanText(row.ingredientName, '待确认原料'),
        unit: cleanText(row.unit, '份'),
        plannedUsage: toNumber(row.plannedUsage),
        stockOnHand,
        reorderPoint,
        purchaseCost: toNumber(row.purchaseCost),
        wasteCount,
        evidence: cleanText(row.evidence, '店长确认的成本/库存样表'),
        owner: cleanOwner(row.owner),
      };
    });

  const dishCount = new Set(sampleRows.map(row => row.dishName)).size;
  const ingredientCount = new Set(sampleRows.map(row => `${row.dishName}::${row.ingredientName}`)).size;
  const needsReorderCount = sampleRows.filter(row => row.stockOnHand <= row.reorderPoint).length;
  const wasteRiskCount = sampleRows.filter(row => row.wasteCount > 0).length;

  const ownerQuestions: RestaurantDishCostInventoryQuestion[] = [
    {
      owner: '店长',
      question: `本轮主推「${cleanText(input.offerName, '招牌套餐')}」是否仍是最值得推的菜？`,
      evidenceRequired: '发布证明、到店反馈和店长确认记录',
    },
    {
      owner: '后厨',
      question: '主料单位用量和备货量是否会影响午晚高峰出品？',
      evidenceRequired: '备餐汇总表、断货记录、损耗记录',
    },
    {
      owner: '采购',
      question: '低于补货线的原料由谁在什么时间补货？',
      evidenceRequired: '采购样表、供应商报价、补货负责人',
    },
    {
      owner: '财务',
      question: '毛利判断是否已经同时拿到销售汇总、采购成本、平台费和人工口径？',
      evidenceRequired: '财务或老板确认的汇总成本表',
    },
  ];

  return {
    ok: true,
    payloadShape: 'restaurant-dish-cost-inventory-sample-v1',
    generatedAt: (input.now || new Date()).toISOString(),
    restaurantName: cleanText(input.restaurantName, '样例餐厅'),
    offerName: cleanText(input.offerName, '招牌套餐'),
    status: sampleRows.length === 0 ? 'needs-cleanup' : 'missing-data-contract',
    summary: {
      totalRows: rows.length,
      validRows: sampleRows.length,
      rejectedRows: rejectedIndexes.size,
      dishCount,
      ingredientCount,
      needsReorderCount,
      wasteRiskCount,
      canClaimGrossMargin: false,
      canClaimInventoryOptimization: false,
    },
    sampleRows,
    issues,
    ownerQuestions,
    nextActions: [
      needsReorderCount > 0 ? '先让采购确认低于补货线的原料和到货时间。' : '把当前库存样表交给店长和后厨复核。',
      wasteRiskCount > 0 ? '让后厨标记损耗来自备货、出品还是报废。' : '保留损耗为零的证据口径，避免后续复盘漂移。',
      '销售、采购、库存和财务汇总没有对齐前，只做问题清单，不写真实毛利结论。',
    ],
    stopLines: [
      '没有销售、库存、采购和财务汇总约定，不写真实毛利或库存优化结论。',
      '样表不保存顾客联系方式、聊天原文、券码、订单明细、支付标识或密钥。',
    ],
    safetyBoundary: 'Dish cost inventory sample accepts only aggregate menu, prep, stock, purchase-cost and waste fields. It rejects private identifiers, raw order data, payment identifiers, coupon codes, secrets and raw POS rows.',
  };
}

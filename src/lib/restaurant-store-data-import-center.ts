import type { RestaurantOperatingDataContract, RestaurantOperatingDataContractTrack, RestaurantOperatingDataDomain } from '@/lib/restaurant-operating-data-contract';
import type { RestaurantPosImportReport } from '@/lib/restaurant-pos-import-validator';
import type { RestaurantTrialIntake } from '@/lib/restaurant-trial-intake';

export type RestaurantStoreDataImportSourceId =
  | 'public-profile'
  | 'publish-proof'
  | 'reservation-leads'
  | 'coupon-redemption'
  | 'pos-sales'
  | 'member-retention'
  | 'inventory-prep'
  | 'finance-margin';

export type RestaurantStoreDataImportSource = {
  id: RestaurantStoreDataImportSourceId;
  label: string;
  status: 'ready-internal' | 'sample-ready' | 'needs-field-mapping' | 'provider-gated';
  owner: 'store-manager' | 'ops' | 'data-ops' | 'runtime-admin' | 'finance';
  businessQuestion: string;
  acceptedInputs: string[];
  forbiddenInputs: string[];
  nextAction: string;
  externalRequired: string[];
};

export type RestaurantStoreDataFieldMapping = {
  canonicalField: string;
  sourceHeaders: string[];
  source: RestaurantStoreDataImportSourceId;
  required: boolean;
  status: 'mapped' | 'missing' | 'forbidden';
  owner: 'store-manager' | 'ops' | 'data-ops' | 'runtime-admin' | 'finance';
  example: string;
  validation: string;
};

export type RestaurantStoreDataImportCenter = {
  ok: true;
  payloadShape: 'restaurant-store-data-import-center-v1';
  generatedAt: string;
  restaurant: string;
  offer: string;
  verdict: 'sample-ready' | 'needs-field-mapping' | 'provider-gated';
  summary: {
    sources: number;
    readyInternal: number;
    sampleReady: number;
    needsFieldMapping: number;
    providerGated: number;
    mappedFields: number;
    missingRequiredFields: number;
    forbiddenFields: number;
    acceptedPosImports: number;
    canClaimTrueOperatingAnalysis: false;
    canClaimAutoRedemption: false;
  };
  sources: RestaurantStoreDataImportSource[];
  fieldMappings: RestaurantStoreDataFieldMapping[];
  sampleRows: Array<Record<string, string | number>>;
  validationQueue: Array<{
    id: string;
    owner: RestaurantStoreDataImportSource['owner'];
    priority: 'today' | 'next-shift' | 'blocked';
    action: string;
    evidenceRequired: string;
    stopLine: string;
  }>;
  importChecklist: string[];
  nextBestAction: {
    label: string;
    owner: RestaurantStoreDataImportSource['owner'];
    reason: string;
    evidenceRequired: string;
  };
  externalRequired: string[];
  safetyBoundary: string;
};

const SOURCE_BY_TRACK: Partial<Record<RestaurantOperatingDataDomain, RestaurantStoreDataImportSourceId>> = {
  'public-proof': 'publish-proof',
  'reservation-leads': 'reservation-leads',
  'coupon-redemption': 'coupon-redemption',
  'pos-sales': 'pos-sales',
  'menu-inventory': 'inventory-prep',
  'member-retention': 'member-retention',
  'finance-margin': 'finance-margin',
};

function clean(value: unknown, fallback: string, max = 120): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  return trimmed ? trimmed.slice(0, max) : fallback;
}

function unique(values: string[], limit = 16): string[] {
  return Array.from(new Set(values.map(item => item.trim()).filter(Boolean))).slice(0, limit);
}

function sourceStatus(track?: RestaurantOperatingDataContractTrack, posImport?: RestaurantPosImportReport): RestaurantStoreDataImportSource['status'] {
  if (posImport?.status === 'accepted' && (track?.id === 'coupon-redemption' || track?.id === 'pos-sales' || track?.id === 'menu-inventory')) {
    return 'sample-ready';
  }
  if (!track) return 'provider-gated';
  if (track.status === 'internal-ready') return 'ready-internal';
  if (track.status === 'manual-import-ready') return 'needs-field-mapping';
  return 'provider-gated';
}

function ownerFor(source: RestaurantStoreDataImportSourceId): RestaurantStoreDataImportSource['owner'] {
  if (source === 'finance-margin') return 'finance';
  if (source === 'publish-proof') return 'ops';
  if (source === 'public-profile' || source === 'reservation-leads') return 'store-manager';
  if (source === 'coupon-redemption' || source === 'pos-sales' || source === 'inventory-prep' || source === 'member-retention') return 'data-ops';
  return 'runtime-admin';
}

function buildSource(source: RestaurantStoreDataImportSourceId, input: {
  label: string;
  track?: RestaurantOperatingDataContractTrack;
  posImport?: RestaurantPosImportReport;
  fallbackQuestion: string;
  acceptedInputs: string[];
  forbiddenInputs: string[];
  nextAction: string;
  externalRequired: string[];
}): RestaurantStoreDataImportSource {
  const status = sourceStatus(input.track, input.posImport);
  return {
    id: source,
    label: input.label,
    status,
    owner: ownerFor(source),
    businessQuestion: input.track?.businessQuestion || input.fallbackQuestion,
    acceptedInputs: unique([...(input.track?.requiredFields || []), ...input.acceptedInputs], 8),
    forbiddenInputs: unique([...(input.track?.forbiddenFields || []), ...input.forbiddenInputs], 8),
    nextAction: status === 'sample-ready'
      ? 'Review accepted sample rows, confirm definitions, then promote aggregate receipt only.'
      : input.track?.nextAction || input.nextAction,
    externalRequired: unique([...(input.track?.externalRequired || []), ...input.externalRequired], 8),
  };
}

function splitFields(fields: string[]): string[] {
  return fields.flatMap(field => field.split(/\s+or\s+|,|\//i)).map(field => field.trim()).filter(Boolean);
}

function buildMappings(contract: RestaurantOperatingDataContract, posImport?: RestaurantPosImportReport): RestaurantStoreDataFieldMapping[] {
  const posFields = new Set([
    ...(posImport?.schema.required || []),
    ...(posImport?.schema.optional || []),
  ]);
  const acceptedPos = posImport?.status === 'accepted';
  const tracks = contract.tracks.filter(track => track.id !== 'public-proof');
  const mappings: RestaurantStoreDataFieldMapping[] = [];

  tracks.forEach(track => {
    const source = SOURCE_BY_TRACK[track.id] || 'pos-sales';
    const owner = ownerFor(source);
    splitFields(track.requiredFields).slice(0, 7).forEach(field => {
      const isPosField = posFields.has(field);
      const mappedBySample = acceptedPos && (
        source === 'coupon-redemption'
        || source === 'pos-sales'
        || source === 'inventory-prep'
      ) && isPosField;
      mappings.push({
        canonicalField: field,
        sourceHeaders: isPosField ? [field] : [],
        source,
        required: true,
        status: mappedBySample || track.status === 'internal-ready' ? 'mapped' : 'missing',
        owner,
        example: contract.importTemplate.find(item => item.field === field)?.example || field,
        validation: mappedBySample
          ? '已通过脱敏 POS 导入样本验证。'
          : '导入或宣称外部资料前需提供店长字段字典。',
      });
    });
    splitFields(track.forbiddenFields).slice(0, 2).forEach(field => {
      mappings.push({
        canonicalField: field,
        sourceHeaders: [],
        source,
        required: false,
        status: 'forbidden',
        owner,
        example: '禁止导入',
        validation: '上传前拒绝；不得出现在 Wenai 客户端及 API 载荷中。',
      });
    });
  });

  return mappings.slice(0, 48);
}

function fallbackSampleRows(input: RestaurantTrialIntake): Array<Record<string, string | number>> {
  return [
    {
      businessDate: new Date().toISOString().slice(0, 10),
      storeName: clean(input.restaurant, 'Trial restaurant'),
      offerName: clean(input.offer, 'Today offer'),
      channel: '券码或预约汇总',
      couponClaimCount: 0,
      redemptionCount: 0,
      grossSales: 0,
      orderCount: 0,
      inventoryUsed: 0,
    },
  ];
}

function nextBestActionFor(input: {
  sources: RestaurantStoreDataImportSource[];
  mappings: RestaurantStoreDataFieldMapping[];
  posImport?: RestaurantPosImportReport;
}): RestaurantStoreDataImportCenter['nextBestAction'] {
  if (input.posImport?.status === 'accepted') {
    return {
      label: '确认 POS 字段定义',
      owner: 'data-ops',
      reason: '脱敏样本已接受；下一步风险是券码宣称、核销、总销售额和已用库存的定义漂移。',
      evidenceRequired: '店长审批的字段字典及日期/来源时段',
    };
  }
  const missing = input.mappings.find(item => item.required && item.status === 'missing');
  if (missing) {
    return {
      label: `映射 ${missing.canonicalField}`,
      owner: missing.owner,
      reason: `${missing.source} 在必填字段映射到店长导出前不可信。`,
      evidenceRequired: '样本表头、字段含义、日期粒度及去隐私确认',
    };
  }
  const provider = input.sources.find(item => item.status === 'provider-gated');
  return {
    label: provider ? `解锁 ${provider.label}` : '审核导入样本',
    owner: provider?.owner || 'data-ops',
    reason: provider?.nextAction || '审核样本数据行，仅推送汇总回执。',
    evidenceRequired: provider?.externalRequired[0] || '已接受的脱敏汇总导入',
  };
}

export function buildRestaurantStoreDataImportCenter(input: RestaurantTrialIntake & {
  operatingDataContract: RestaurantOperatingDataContract;
  posImport?: RestaurantPosImportReport;
  now?: Date;
}): RestaurantStoreDataImportCenter {
  const contract = input.operatingDataContract;
  const posImport = input.posImport;
  const trackById = new Map(contract.tracks.map(track => [track.id, track]));
  const sources: RestaurantStoreDataImportSource[] = [
    buildSource('public-profile', {
      label: '公开主页与菜单信息',
      fallbackQuestion: '在获取店长数据访问权限前，可从公开门店信息中了解哪些内容？',
      acceptedInputs: ['公开门店名称', '地址区域', '菜单亮点', '营业时段'],
      forbiddenInputs: ['含私人身份的顾客评价', '员工私人联系方式'],
      nextAction: '导入公开主页信息或店长审批的菜单文字。',
      externalRequired: [],
    }),
    buildSource('publish-proof', {
      label: '发布凭证与截图',
      track: trackById.get('public-proof'),
      fallbackQuestion: '哪条帖子链接或截图可证明渠道动作已发生？',
      acceptedInputs: ['公开 URL', '截图 id', '运营备注'],
      forbiddenInputs: ['cookies', 'tokens', '私信'],
      nextAction: '附上一条公开凭证 URL 或截图回执。',
      externalRequired: ['自动抓取所需的店长平台授权'],
    }),
    buildSource('reservation-leads', {
      label: '预约与到店意向汇总',
      track: trackById.get('reservation-leads'),
      fallbackQuestion: '哪些询问需要店长在服务时段前跟进？',
      acceptedInputs: ['预约数量', '到店意向数量', '服务时段'],
      forbiddenInputs: ['电话', '微信号', '原始私信'],
      nextAction: '仅导入汇总预约或到店意向数量。',
      externalRequired: ['已授权平台/API 导出'],
    }),
    buildSource('coupon-redemption', {
      label: '券码宣称与核销导出',
      track: trackById.get('coupon-redemption'),
      posImport,
      fallbackQuestion: '券码宣称在哪个环节未能转化为门店核销？',
      acceptedInputs: ['couponClaimCount', 'redemptionCount', 'businessDate'],
      forbiddenInputs: ['coupon code', 'order id', 'payment id'],
      nextAction: '从店长导出中映射宣称/核销字段。',
      externalRequired: ['POS/券码字段字典'],
    }),
    buildSource('pos-sales', {
      label: 'POS 销售与订单汇总',
      track: trackById.get('pos-sales'),
      posImport,
      fallbackQuestion: '本次活动是否产生了真实订单和销售额？',
      acceptedInputs: ['grossSales', 'orderCount', 'averageTicket'],
      forbiddenInputs: ['明细订单行', 'payment transaction id'],
      nextAction: '导入脱敏 POS 汇总数据行。',
      externalRequired: ['POS CSV/API 合同'],
    }),
    buildSource('member-retention', {
      label: '会员与社群留存汇总',
      track: trackById.get('member-retention'),
      fallbackQuestion: '哪些食客分层应在不暴露身份的情况下接受跟进？',
      acceptedInputs: ['segmentName', 'followupCount', 'repeatVisitCount'],
      forbiddenInputs: ['会员姓名', '电话', '微信号', '原始聊天记录'],
      nextAction: '与店长共同定义去隐私的分层导出。',
      externalRequired: ['店长审批的会员/群组导出'],
    }),
    buildSource('inventory-prep', {
      label: '库存、备餐与服务产能',
      track: trackById.get('menu-inventory'),
      posImport,
      fallbackQuestion: '厨房能否在不断货或不浪费的情况下支撑下次内容推广？',
      acceptedInputs: ['inventoryUsed', 'prepBatch', 'stockoutCount', 'wasteCount'],
      forbiddenInputs: ['供应商银行信息', '员工私人联系方式'],
      nextAction: '添加汇总备餐或已用库存字段。',
      externalRequired: ['库存导出或厨房备餐单'],
    }),
    buildSource('finance-margin', {
      label: '财务、利润与折扣护栏',
      track: trackById.get('finance-margin'),
      fallbackQuestion: '活动在折扣、平台费、食材及人力成本后是否盈利？',
      acceptedInputs: ['ingredientCost', 'discountCost', 'platformFee', 'laborCost'],
      forbiddenInputs: ['银行账户', '薪酬身份信息', 'payment transaction id'],
      nextAction: '建议折扣力度前先收集店长审批的汇总成本字段。',
      externalRequired: ['财务导出或老板成本表'],
    }),
  ];
  const fieldMappings = buildMappings(contract, posImport);
  const mappedFields = fieldMappings.filter(item => item.status === 'mapped').length;
  const missingRequiredFields = fieldMappings.filter(item => item.required && item.status === 'missing').length;
  const forbiddenFields = fieldMappings.filter(item => item.status === 'forbidden').length;
  const nextBestAction = nextBestActionFor({ sources, mappings: fieldMappings, posImport });
  const externalRequired = unique([
    ...sources.flatMap(source => source.externalRequired),
    ...contract.providerSetupRequests.map(request => request.evidenceRequired),
  ], 14);
  const providerGated = sources.filter(source => source.status === 'provider-gated').length;
  const needsFieldMapping = sources.filter(source => source.status === 'needs-field-mapping').length;
  const sampleReady = sources.filter(source => source.status === 'sample-ready').length;
  const readyInternal = sources.filter(source => source.status === 'ready-internal').length;
  return {
    ok: true,
    payloadShape: 'restaurant-store-data-import-center-v1',
    generatedAt: (input.now || new Date()).toISOString(),
    restaurant: clean(input.restaurant, 'Trial restaurant'),
    offer: clean(input.offer, 'Today featured offer'),
    verdict: providerGated > 0 ? 'provider-gated' : missingRequiredFields > 0 ? 'needs-field-mapping' : 'sample-ready',
    summary: {
      sources: sources.length,
      readyInternal,
      sampleReady,
      needsFieldMapping,
      providerGated,
      mappedFields,
      missingRequiredFields,
      forbiddenFields,
      acceptedPosImports: posImport?.status === 'accepted' ? 1 : 0,
      canClaimTrueOperatingAnalysis: false,
      canClaimAutoRedemption: false,
    },
    sources,
    fieldMappings,
    sampleRows: posImport?.sanitizedPreview.length ? posImport.sanitizedPreview : fallbackSampleRows(input),
    validationQueue: [
      {
        id: 'field-dictionary',
        owner: 'data-ops',
        priority: missingRequiredFields > 0 ? 'today' : 'next-shift',
        action: '确认 POS、券码、会员、库存及财务导出的规范字段、来源表头、时间粒度和字段定义。',
        evidenceRequired: '无隐私字段的店长审批字段字典',
        stopLine: '不导入原始订单行、支付 id、券码、私信或客户标识符。',
      },
      {
        id: 'sample-import',
        owner: 'store-manager',
        priority: posImport?.status === 'accepted' ? 'next-shift' : 'today',
        action: posImport?.status === 'accepted' ? '使用样本前确认导入字段定义。' : '上传或粘贴含必填 POS/券码字段的脱敏汇总样本。',
        evidenceRequired: '已接受的脱敏汇总样本行',
        stopLine: '样本数据行通过验证前不宣称真实经营分析。',
      },
      {
        id: 'provider-data-contract',
        owner: 'runtime-admin',
        priority: externalRequired.length ? 'blocked' : 'next-shift',
        action: '仅在店长授权和回执凭证就绪后，收集外部资料/API 或浏览器运行方数据合同。',
        evidenceRequired: '外部资料模式、授权范围、回调回执及数据保留策略',
        stopLine: '无外部资料凭证前不宣称自动核销、私信访问、POS 写入或财务分析。',
      },
    ],
    importChecklist: [
      '仅使用汇总行：门店/日期/活动/渠道/数量/销售额/库存/成本字段。',
      '上传前剔除隐私字段：电话、微信号、会员姓名、地址、支付 id、原始聊天及原始订单 id。',
      '样本验证与外部资料自动化分开处理；接受样本不代表开通实时 API 访问。',
      '每次导入均附上负责人、凭证、来源时段及下一步行动。',
      '仅将已接受的汇总回执推送至记忆、业务信号及下班决策。',
    ],
    nextBestAction,
    externalRequired,
    safetyBoundary: '门店数据导入中心仅映射和验证脱敏汇总数据。在店长授权、外部资料健康状态、回调回执及已接受数据合同就绪前，不存储原始 POS 数据行、客户标识符、私信、支付 id、券码、密钥、浏览器 cookie，也不宣称自动核销或真实经营分析。',
  };
}

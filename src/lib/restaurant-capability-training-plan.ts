export type RestaurantCapabilityTrainingStatus = 'trainable-now' | 'provider-gated' | 'activation-ready';

export type RestaurantCapabilityTrainingRecordKind = 'material' | 'provider';

export type RestaurantCapabilityTrainingRecordInput = {
  kind?: RestaurantCapabilityTrainingRecordKind;
  capabilityId?: string;
  name?: string;
  owner?: string;
  source?: 'manual' | 'public-profile' | 'pos-import' | 'provider-setup';
  evidenceSummary?: string;
};

export type RestaurantCapabilityTrainingRecord = {
  recordId: string;
  kind: RestaurantCapabilityTrainingRecordKind;
  capabilityId: string;
  name: string;
  owner: string;
  source: 'manual' | 'public-profile' | 'pos-import' | 'provider-setup';
  evidenceSummary: string;
  accepted: boolean;
  rejectedReason?: string;
  createdAt: string;
};

export type RestaurantCapabilityTrainingInput = {
  availableMaterials?: string[];
  configuredProviders?: string[];
  trainingRecords?: RestaurantCapabilityTrainingRecord[];
};

export type RestaurantCapabilityTrainingItem = {
  id: string;
  capability: string;
  competitorPattern: 'Claw/Cloud' | 'OpenClaw' | 'Hermes' | 'Restaurant SaaS';
  internal: string;
  trainingMaterials: string[];
  externalProviders: string[];
  acceptance: string;
  firstRun: string;
  status: RestaurantCapabilityTrainingStatus;
  missingTrainingMaterials: string[];
  missingExternalProviders: string[];
  nextAction: string;
};

export type RestaurantCapabilityTrainingPlan = {
  payloadShape: 'restaurant-capability-training-plan';
  items: RestaurantCapabilityTrainingItem[];
  summary: {
    total: number;
    trainableNow: number;
    providerGated: number;
    activationReady: number;
    missingTrainingMaterialCount: number;
    missingExternalProviderCount: number;
  };
  nextInternalTraining: Array<{
    capabilityId: string;
    material: string;
    owner: string;
  }>;
  externalSetupRequests: Array<{
    capabilityId: string;
    provider: string;
    owner: string;
  }>;
  safetyBoundary: string;
};

type CapabilityTrainingDefinition = Omit<
  RestaurantCapabilityTrainingItem,
  'status' | 'missingTrainingMaterials' | 'missingExternalProviders' | 'nextAction'
>;

const CAPABILITY_TRAINING_DEFINITIONS: CapabilityTrainingDefinition[] = [
  {
    id: 'cross-platform-operating-qa',
    capability: '跨平台经营问答',
    competitorPattern: 'Claw/Cloud',
    internal: '把菜单、活动、证据和手工数据转成待确认建议。',
    trainingMaterials: ['门店资料', '菜单价格', '昨日经营表', '平台链接', '评论摘录'],
    externalProviders: ['POS 导出或 API', '会员系统导出', '点评/外卖平台数据授权'],
    acceptance: '每条回答标明来源、缺口、负责人和禁止代执行动作。',
    firstRun: '先上传一张菜单和一份昨日经营表。',
  },
  {
    id: 'auto-publish-receipts',
    capability: '发布执行与回执',
    competitorPattern: 'OpenClaw',
    internal: '生成平台发布任务、操作清单、回执约定和证据台账。',
    trainingMaterials: ['发布模板', '平台禁用词', '门店审批规则', '素材授权记录'],
    externalProviders: ['隔离浏览器 profile', '平台授权', 'Runner URL', 'callback secret'],
    acceptance: '必须回写发布链接、截图、试跑回执编号和失败原因。',
    firstRun: '先跑大众点评/小红书手工回执包。',
  },
  {
    id: 'auto-acquisition-followup',
    capability: '线索承接与社群跟进',
    competitorPattern: 'Restaurant SaaS',
    internal: '把预约、券领取、咨询截图和社群反馈转为跟进任务。',
    trainingMaterials: ['会员标签', '券领取记录', '咨询分类', '社群 SOP', '黑名单规则'],
    externalProviders: ['会员系统授权', '企微授权', '短信或电话系统授权'],
    acceptance: '未授权前只生成话术和负责人，不自动触达顾客。',
    firstRun: '先导入一份券领取或咨询截图清单。',
  },
  {
    id: 'redemption-operating-analytics',
    capability: '核销与真实经营分析',
    competitorPattern: 'Restaurant SaaS',
    internal: '校验 POS 导入字段，输出异常清单和待确认经营问题。',
    trainingMaterials: ['核销表', '客单', '菜品销量', '毛利', '库存', '损耗', '人效'],
    externalProviders: ['POS API', '核销系统导出', '库存系统导出', '财务系统导出'],
    acceptance: '没有来源字段不做归因，没有核销数据不说转化。',
    firstRun: '先用 CSV 导入昨日核销和菜品销量。',
  },
  {
    id: 'layered-memory-evolution',
    capability: '分层记忆与自我进化',
    competitorPattern: 'Hermes',
    internal: '展示门店/菜品/客群/证据记忆层和下一轮复用方式。',
    trainingMaterials: ['禁用表达', '常用语气', '爆款场景', '负责人偏好', '复盘结论'],
    externalProviders: ['登录账号体系', '长期数据库', '权限隔离', '审计日志'],
    acceptance: '每次写回说明写入哪一层、谁确认、下一轮怎么复用。',
    firstRun: '先沉淀本店 5 条表达红线和 3 个主推场景。',
  },
];

function normalizeList(values: string[] | undefined) {
  return new Set((values || []).map(item => item.trim()).filter(Boolean));
}

function missingFrom(required: string[], available: Set<string>) {
  return required.filter(item => !available.has(item));
}

function statusFor(missingTrainingMaterials: string[], missingExternalProviders: string[]): RestaurantCapabilityTrainingStatus {
  if (missingTrainingMaterials.length === 0 && missingExternalProviders.length === 0) return 'activation-ready';
  if (missingTrainingMaterials.length === 0) return 'provider-gated';
  return 'trainable-now';
}

function nextActionFor(item: CapabilityTrainingDefinition, missingTrainingMaterials: string[], missingExternalProviders: string[]) {
  if (missingTrainingMaterials.length > 0) return `先补训练材料：${missingTrainingMaterials.slice(0, 2).join(' / ')}`;
  if (missingExternalProviders.length > 0) return `等待外部接入：${missingExternalProviders.slice(0, 2).join(' / ')}`;
  return `可进入受控验收：${item.acceptance}`;
}

export function buildRestaurantCapabilityTrainingPlan(input: RestaurantCapabilityTrainingInput = {}): RestaurantCapabilityTrainingPlan {
  const acceptedRecords = (input.trainingRecords || []).filter(record => record.accepted);
  const materialRecords = acceptedRecords.filter(record => record.kind === 'material').map(record => record.name);
  const providerRecords = acceptedRecords.filter(record => record.kind === 'provider').map(record => record.name);
  const availableMaterials = normalizeList([...(input.availableMaterials || []), ...materialRecords]);
  const configuredProviders = normalizeList([...(input.configuredProviders || []), ...providerRecords]);

  const items = CAPABILITY_TRAINING_DEFINITIONS.map(item => {
    const missingTrainingMaterials = missingFrom(item.trainingMaterials, availableMaterials);
    const missingExternalProviders = missingFrom(item.externalProviders, configuredProviders);
    const status = statusFor(missingTrainingMaterials, missingExternalProviders);

    return {
      ...item,
      status,
      missingTrainingMaterials,
      missingExternalProviders,
      nextAction: nextActionFor(item, missingTrainingMaterials, missingExternalProviders),
    };
  });

  return {
    payloadShape: 'restaurant-capability-training-plan',
    items,
    summary: {
      total: items.length,
      trainableNow: items.filter(item => item.status === 'trainable-now').length,
      providerGated: items.filter(item => item.status === 'provider-gated').length,
      activationReady: items.filter(item => item.status === 'activation-ready').length,
      missingTrainingMaterialCount: items.reduce((sum, item) => sum + item.missingTrainingMaterials.length, 0),
      missingExternalProviderCount: items.reduce((sum, item) => sum + item.missingExternalProviders.length, 0),
    },
    nextInternalTraining: items
      .flatMap(item => item.missingTrainingMaterials.slice(0, 2).map(material => ({
        capabilityId: item.id,
        material,
        owner: material.includes('审批') || material.includes('授权') ? '门店负责人' : '运营',
      })))
      .slice(0, 8),
    externalSetupRequests: items
      .flatMap(item => item.missingExternalProviders.slice(0, 2).map(provider => ({
        capabilityId: item.id,
        provider,
        owner: provider.includes('平台授权') || provider.includes('Runner') || provider.includes('API') || provider.includes('数据库') ? '技术' : '商家/运营',
      })))
      .slice(0, 8),
    safetyBoundary: '训练计划只暴露材料缺口、Provider 缺口和验收标准；未授权前不代发、不自动触达、不写核销、不读取咨询原文、不输出无来源经营结论。',
  };
}

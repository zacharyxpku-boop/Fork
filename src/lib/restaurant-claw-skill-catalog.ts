export type RestaurantClawSkillStatus = 'internal-ready' | 'training-needed' | 'provider-gated';

export type RestaurantClawSkill = {
  id: string;
  name: string;
  status: RestaurantClawSkillStatus;
  input: string;
  output: string;
  evidence: string;
};

export type RestaurantClawModule = {
  id: string;
  name: string;
  job: string;
  owner: 'store-manager' | 'ops' | 'marketing' | 'finance' | 'hr' | 'tech';
  skills: RestaurantClawSkill[];
};

export type RestaurantClawTool = {
  id: string;
  name: string;
  category: string;
  status: RestaurantClawSkillStatus;
  safeAction: string;
  externalGate: string;
};

export type RestaurantClawSkillCatalog = {
  payloadShape: 'restaurant-claw-skill-catalog';
  modules: RestaurantClawModule[];
  tools: RestaurantClawTool[];
  summary: {
    modules: number;
    skills: number;
    tools: number;
    internalReadySkills: number;
    trainingNeededSkills: number;
    providerGatedSkills: number;
    internalReadyTools: number;
    trainingNeededTools: number;
    providerGatedTools: number;
  };
  nextInternalTraining: Array<{
    moduleId: string;
    skillId: string;
    material: string;
    owner: RestaurantClawModule['owner'];
  }>;
  externalSetupRequests: Array<{
    toolId: string;
    provider: string;
    unlocks: string;
  }>;
  safetyBoundary: string;
};

export type RestaurantClawTrainingBatch = {
  payloadShape: 'restaurant-claw-training-batch';
  batchId: string;
  generatedAt: string;
  summary: {
    internalTrainingTasks: number;
    providerUnlockTasks: number;
    modulesCovered: number;
    toolsCovered: number;
  };
  internalTrainingTasks: Array<{
    taskId: string;
    moduleId: string;
    skillId: string;
    title: string;
    owner: RestaurantClawModule['owner'];
    material: string;
    evidenceRequired: string;
    acceptance: string;
    nextAction: string;
  }>;
  providerUnlockTasks: Array<{
    taskId: string;
    toolId: string;
    title: string;
    provider: string;
    owner: 'merchant' | 'ops' | 'tech';
    unlocks: string;
    evidenceRequired: string;
    nextAction: string;
  }>;
  dispatchPreview: Array<{
    lane: 'training' | 'provider';
    owner: string;
    count: number;
    blockedUntil: string;
  }>;
  safetyBoundary: string;
};

const MODULE_DEFINITIONS: Array<{
  id: string;
  name: string;
  job: string;
  owner: RestaurantClawModule['owner'];
}> = [
  { id: 'brand-positioning', name: '品牌定位', job: '把门店、人群、价格带和到店理由变成稳定表达。', owner: 'marketing' },
  { id: 'menu-engineering', name: '菜单优化', job: '识别主推菜、利润菜、引流菜和下架风险。', owner: 'ops' },
  { id: 'local-life-content', name: '本地生活内容', job: '生成小红书、抖音、大众点评、社群的本地内容计划。', owner: 'marketing' },
  { id: 'delivery-growth', name: '外卖增长', job: '把套餐结构、活动边界和库存限制变成外卖动作。', owner: 'ops' },
  { id: 'member-growth', name: '会员增长', job: '把券领取、复购、生日、沉睡客户变成跟进任务。', owner: 'store-manager' },
  { id: 'private-domain', name: '私域社群', job: '把社群反馈、咨询摘要和话术变成负责人动作。', owner: 'store-manager' },
  { id: 'reservation-ops', name: '预约到店', job: '把预约、排队、包间、桌位和到店意向拆成闭环。', owner: 'store-manager' },
  { id: 'coupon-redemption', name: '团购核销', job: '校验领取、核销、客单和活动复盘，避免无来源归因。', owner: 'finance' },
  { id: 'pos-analytics', name: 'POS 经营分析', job: '用导入字段解释销量、毛利、损耗、人效和异常。', owner: 'finance' },
  { id: 'inventory-purchase', name: '库存采购', job: '把库存、损耗、预估销量和供应商动作连接起来。', owner: 'ops' },
  { id: 'staff-scheduling', name: '排班人效', job: '把客流、翻台、投诉、岗位和人效变成排班建议。', owner: 'hr' },
  { id: 'service-quality', name: '服务质检', job: '把差评、投诉、巡店记录和 SOP 漏洞变成整改任务。', owner: 'ops' },
  { id: 'food-safety', name: '食品安全', job: '把留样、温控、保质期、供应商和检查项做成提醒。', owner: 'ops' },
  { id: 'store-opening', name: '选址开店', job: '沉淀商圈、人流、租金、竞品、堂食/外卖结构评估。', owner: 'ops' },
  { id: 'store-layout', name: '门店布局', job: '把动线、翻台、出餐、排队、门头和拍照点纳入优化。', owner: 'ops' },
  { id: 'chain-standard', name: '连锁标准', job: '把单店经验变成多店 SOP、检查表和负责人制度。', owner: 'store-manager' },
  { id: 'finance-diagnosis', name: '财务诊断', job: '解释营收、成本、毛利、费用、现金流和异常项。', owner: 'finance' },
  { id: 'legal-compliance', name: '法务合规', job: '约束宣传、价格、用工、食品安全和数据授权边界。', owner: 'tech' },
  { id: 'competitive-intel', name: '竞品情报', job: '把同城竞品、活动、内容和评论变成可验证观察。', owner: 'marketing' },
  { id: 'agent-ops', name: 'Agent 执行治理', job: '管理任务、浏览器、回执、审计、恢复和外部 Provider。', owner: 'tech' },
];

const SKILL_TEMPLATES = [
  { id: 'intake', name: '资料录入', status: 'internal-ready' as const, input: '门店资料 / 截图 / 表格', output: '结构化任务字段', evidence: '字段来源与缺口' },
  { id: 'diagnosis', name: '问题诊断', status: 'internal-ready' as const, input: '当前任务和证据', output: '待确认问题清单', evidence: '原因、负责人、下一步' },
  { id: 'content', name: '内容草稿', status: 'internal-ready' as const, input: '卖点、场景、边界', output: '平台原生文案草稿', evidence: '门店审核状态' },
  { id: 'checklist', name: '执行检查表', status: 'internal-ready' as const, input: '目标动作', output: '步骤、停止条件、回执字段', evidence: '检查项版本' },
  { id: 'owner-handoff', name: '负责人交接', status: 'internal-ready' as const, input: '任务与证据', output: '负责人、期限、下一步', evidence: '交接记录' },
  { id: 'training', name: '训练材料沉淀', status: 'training-needed' as const, input: '样例、禁用词、复盘', output: '可复用训练条目', evidence: '训练账本' },
  { id: 'memory', name: '分层记忆写回', status: 'training-needed' as const, input: '确认后的结论', output: '门店/菜品/客群记忆', evidence: '写回层级和确认人' },
  { id: 'provider-bridge', name: 'Provider 桥接', status: 'provider-gated' as const, input: '授权、endpoint、回调', output: '外部执行或数据同步', evidence: 'Provider 配置状态' },
  { id: 'receipt', name: '回执验收', status: 'provider-gated' as const, input: '链接、截图、externalRunId', output: 'accepted/rejected', evidence: '签名回调或人工证明' },
  { id: 'recovery', name: '失败恢复', status: 'provider-gated' as const, input: '失败原因和阻断条件', output: '重试、降级或人工升级', evidence: '恢复动作记录' },
];

const TOOL_CATEGORIES = [
  '资料与证据',
  '菜单与套餐',
  '内容与素材',
  '发布与回执',
  '获客与跟进',
  '核销与 POS',
  '经营分析',
  '库存与采购',
  '员工与服务',
  '合规与审计',
  '浏览器执行',
  '记忆与训练',
];

const TOOL_TEMPLATES = [
  { name: '导入器', status: 'internal-ready' as const, safeAction: '只解析授权材料并标注缺口', externalGate: '无' },
  { name: '检查器', status: 'internal-ready' as const, safeAction: '生成检查清单和停止条件', externalGate: '无' },
  { name: '生成器', status: 'training-needed' as const, safeAction: '按门店语气生成草稿', externalGate: '门店样例和禁用表达' },
  { name: '回执器', status: 'provider-gated' as const, safeAction: '等待链接/截图/签名回调', externalGate: '平台授权或 Browser Runner' },
  { name: '复盘器', status: 'provider-gated' as const, safeAction: '只分析有来源的聚合数据', externalGate: 'POS/核销/会员导出或 API' },
];

function buildModules(): RestaurantClawModule[] {
  return MODULE_DEFINITIONS.map(module => ({
    ...module,
    skills: SKILL_TEMPLATES.map(template => ({
      id: `${module.id}-${template.id}`,
      name: `${module.name}${template.name}`,
      status: template.status,
      input: template.input,
      output: template.output,
      evidence: template.evidence,
    })),
  }));
}

function buildTools(): RestaurantClawTool[] {
  return TOOL_CATEGORIES.flatMap(category => TOOL_TEMPLATES.map(template => ({
    id: `${category}-${template.name}`.toLowerCase().replace(/\s+/g, '-'),
    name: `${category}${template.name}`,
    category,
    status: template.status,
    safeAction: template.safeAction,
    externalGate: template.externalGate,
  })));
}

function countByStatus<T extends { status: RestaurantClawSkillStatus }>(items: T[], status: RestaurantClawSkillStatus) {
  return items.filter(item => item.status === status).length;
}

function ownerForProvider(provider: string): RestaurantClawTrainingBatch['providerUnlockTasks'][number]['owner'] {
  if (/POS|API|Runner|Provider|OAuth|profile/i.test(provider)) return 'tech';
  if (/授权|账号|商家/.test(provider)) return 'merchant';
  return 'ops';
}

function batchId(now: Date) {
  return `restaurant-claw-training-${now.toISOString().slice(0, 10).replace(/-/g, '')}`;
}

export function buildRestaurantClawSkillCatalog(): RestaurantClawSkillCatalog {
  const modules = buildModules();
  const skills = modules.flatMap(module => module.skills);
  const tools = buildTools();

  return {
    payloadShape: 'restaurant-claw-skill-catalog',
    modules,
    tools,
    summary: {
      modules: modules.length,
      skills: skills.length,
      tools: tools.length,
      internalReadySkills: countByStatus(skills, 'internal-ready'),
      trainingNeededSkills: countByStatus(skills, 'training-needed'),
      providerGatedSkills: countByStatus(skills, 'provider-gated'),
      internalReadyTools: countByStatus(tools, 'internal-ready'),
      trainingNeededTools: countByStatus(tools, 'training-needed'),
      providerGatedTools: countByStatus(tools, 'provider-gated'),
    },
    nextInternalTraining: modules
      .flatMap(module => module.skills
        .filter(skill => skill.status === 'training-needed')
        .slice(0, 1)
        .map(skill => ({
          moduleId: module.id,
          skillId: skill.id,
          material: `${module.name}：门店样例、禁用表达、复盘结论`,
          owner: module.owner,
        })))
      .slice(0, 8),
    externalSetupRequests: tools
      .filter(tool => tool.status === 'provider-gated')
      .slice(0, 8)
      .map(tool => ({
        toolId: tool.id,
        provider: tool.externalGate,
        unlocks: tool.name,
      })),
    safetyBoundary: '能力库是可训练目录和受控工具目录；未配置 Provider、平台授权、POS/会员/核销数据前，不宣称自动发布、自动获客、自动核销或实时经营分析已经完成。',
  };
}

export function buildRestaurantClawTrainingBatch(input: {
  catalog?: RestaurantClawSkillCatalog;
  now?: Date;
  internalLimit?: number;
  providerLimit?: number;
} = {}): RestaurantClawTrainingBatch {
  const catalog = input.catalog || buildRestaurantClawSkillCatalog();
  const now = input.now || new Date();
  const internalLimit = input.internalLimit ?? 10;
  const providerLimit = input.providerLimit ?? 10;
  const internalTrainingTasks = catalog.modules
    .flatMap(module => module.skills
      .filter(skill => skill.status === 'training-needed')
      .map(skill => ({
        taskId: `train-${skill.id}`,
        moduleId: module.id,
        skillId: skill.id,
        title: `${module.name} / ${skill.name}`,
        owner: module.owner,
        material: `${module.name}：补充 3 条门店样例、2 条禁用表达、1 条复盘结论`,
        evidenceRequired: `${skill.evidence} + 门店确认人`,
        acceptance: '训练材料不含账号、顾客身份、私信原文或未授权经营明细，并能被下一轮任务复用。',
        nextAction: `由 ${module.owner} 补齐 ${skill.name} 的可复用样例。`,
      })))
    .slice(0, internalLimit);
  const providerUnlockTasks = catalog.tools
    .filter(tool => tool.status === 'provider-gated')
    .slice(0, providerLimit)
    .map(tool => ({
      taskId: `unlock-${tool.id}`,
      toolId: tool.id,
      title: `${tool.name} Provider 解锁`,
      provider: tool.externalGate,
      owner: ownerForProvider(tool.externalGate),
      unlocks: tool.name,
      evidenceRequired: `${tool.externalGate} configured + audit-safe callback or import sample`,
      nextAction: `${ownerForProvider(tool.externalGate)} 提供 ${tool.externalGate}，否则 ${tool.name} 保持 blocked。`,
    }));
  const dispatchPreview = [
    {
      lane: 'training' as const,
      owner: 'ops/marketing/store-manager',
      count: internalTrainingTasks.length,
      blockedUntil: '门店样例和复盘材料补齐',
    },
    {
      lane: 'provider' as const,
      owner: 'merchant/tech',
      count: providerUnlockTasks.length,
      blockedUntil: 'Provider、平台授权、POS/核销/会员数据源配置完成',
    },
  ];

  return {
    payloadShape: 'restaurant-claw-training-batch',
    batchId: batchId(now),
    generatedAt: now.toISOString(),
    summary: {
      internalTrainingTasks: internalTrainingTasks.length,
      providerUnlockTasks: providerUnlockTasks.length,
      modulesCovered: new Set(internalTrainingTasks.map(task => task.moduleId)).size,
      toolsCovered: new Set(providerUnlockTasks.map(task => task.toolId)).size,
    },
    internalTrainingTasks,
    providerUnlockTasks,
    dispatchPreview,
    safetyBoundary: '训练批次只能生成内部训练任务和外部解锁任务；未取得 Provider、平台授权、POS/会员/核销数据前，不会自动发布、触达顾客、写核销或宣称实时经营结论。',
  };
}

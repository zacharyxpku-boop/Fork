export type RestaurantBenchmarkCandidate = {
  id: 'kuaizi-platform' | 'claw-agent' | 'restaurant-saas';
  name: string;
  role: 'primary-spine' | 'experience-layer' | 'data-contract-layer';
  fitScore: number;
  fitReason: string;
  adopt: string[];
  doNotCopyBlindly: string[];
  externalGates: string[];
};

export type RestaurantBenchmarkStrategy = {
  payloadShape: 'restaurant-benchmark-strategy';
  recommendation: 'kuaizi-platform-spine-plus-claw-agent-layer';
  summary: string;
  candidates: RestaurantBenchmarkCandidate[];
  productPrinciples: string[];
  nextBuildOrder: Array<{
    id: string;
    title: string;
    source: RestaurantBenchmarkCandidate['id'];
    internalNow: string;
    externalGate: string;
    acceptance: string;
  }>;
  safetyBoundary: string;
};

export function buildRestaurantBenchmarkStrategy(): RestaurantBenchmarkStrategy {
  const candidates: RestaurantBenchmarkCandidate[] = [
    {
      id: 'kuaizi-platform',
      name: '筷子科技平台级内容商业链路',
      role: 'primary-spine',
      fitScore: 92,
      fitReason: '餐饮客户真正付费的是稳定经营动作：内容生产、发布协同、回执、分析、优化和复盘，而不是单次炫酷 agent 表演。',
      adopt: [
        '内容生产到分发、分析、优化的一体化链路',
        '任务、素材、回执、表现、复盘进入同一经营账本',
        '平台化权限、审计、Provider callback 和规模化交付门禁',
      ],
      doNotCopyBlindly: [
        '不要把旧广告投放口径直接搬到餐饮',
        '不要在没有 POS/平台授权时承诺真实转化或增长',
      ],
      externalGates: [
        '模型 Provider key',
        '内容/图片/视频 Provider callback',
        '发布平台授权/API',
        'POS/核销/会员/库存/财务数据合同',
      ],
    },
    {
      id: 'claw-agent',
      name: '勺子 Cloud / 龙虾 / OpenClaw 式 Agent 体验',
      role: 'experience-layer',
      fitScore: 84,
      fitReason: '它适合做常驻浏览器、工具权限、记忆、主动跟进和可见执行体验，但不能替代餐饮交易数据和平台授权。',
      adopt: [
        '常驻浏览器 profile、runbook、step event、失败恢复',
        '20 模块 / 200 技能 / 60 工具的可探索工作台体验',
        '把训练材料、Provider 门槛和工具权限可视化',
      ],
      doNotCopyBlindly: [
        '不要把“能操作电脑”包装成“已经能自动经营门店”',
        '不要让浏览器执行器直接接触密钥、验证码、私信原文或顾客身份',
      ],
      externalGates: [
        'OpenClaw/Hermes 通道地址',
        '隔离浏览器 profile',
        'callback secret',
        '商家登录授权和人工审批规则',
      ],
    },
    {
      id: 'restaurant-saas',
      name: '餐饮 SaaS 经营数据合同',
      role: 'data-contract-layer',
      fitScore: 89,
      fitReason: '餐饮最终要落到预约、券领取、核销、客单、库存、人效和复购；没有这些数据，AI 只能做草稿和清单。',
      adopt: [
        'POS、核销、会员、库存、排班、财务字段字典',
        '聚合指标与来源证据绑定',
        '多门店权限、负责人、审计和异常恢复',
      ],
      doNotCopyBlindly: [
        '不要做成传统后台表格堆叠',
        '不要绕过商家授权读取后台或私信',
      ],
      externalGates: [
        'POS API 或 CSV 样表',
        '团购券核销数据源',
        '会员/预约/社群导出',
        '数据使用授权与脱敏规则',
      ],
    },
  ];

  return {
    payloadShape: 'restaurant-benchmark-strategy',
    recommendation: 'kuaizi-platform-spine-plus-claw-agent-layer',
    summary: '餐饮产品不应该只复刻最 fancy 的 agent 外观。主干应采用筷子科技式平台级商业链路，保证内容、发布、回执、分析和优化闭环可靠；前台体验吸收勺子 Cloud / 龙虾 / OpenClaw 的常驻浏览器、工具权限、记忆和主动跟进；经营数据层必须按餐饮 SaaS 的 POS/核销/会员/库存/财务合同来接。',
    candidates,
    productPrinciples: [
      '平台级链路优先于炫酷 agent：客户要可用、可审计、可复盘。',
      'Agent 体验必须服务经营闭环：每次执行都要有回执、负责人、失败原因和下一步。',
      '没有外部授权就只做训练、草稿、清单和手工导入，不伪装自动化。',
      '餐饮的 100% 能力不是更多按钮，而是内容、发布、获客、核销、经营分析都能回到同一账本。',
    ],
    nextBuildOrder: [
      {
        id: 'platform-spine-ledger',
        title: '平台级经营账本主干',
        source: 'kuaizi-platform',
        internalNow: '把内容任务、发布回执、训练批次、POS 导入和经营信号聚合成一个可筛选 timeline。',
        externalGate: '真实平台授权、Provider callback、POS/核销/会员数据源。',
        acceptance: '任一门店任务能看到从输入、生成、发布、回执、信号、复盘到下一步的完整状态。',
      },
      {
        id: 'agent-runtime-control',
        title: 'Claw 式常驻执行控制',
        source: 'claw-agent',
        internalNow: '把 browser session、runbook、step event、tool policy、training batch 放到同一控制台。',
        externalGate: 'OpenClaw/Hermes runtime、隔离 profile、callback secret、商家登录授权。',
        acceptance: '未授权时只输出 handoff/runbook；授权后每步都有 sanitized event 和可拒收回执。',
      },
      {
        id: 'restaurant-data-contracts',
        title: '餐饮经营数据合同',
        source: 'restaurant-saas',
        internalNow: '继续增强 CSV/手工导入校验、字段字典、脱敏聚合和异常说明。',
        externalGate: 'POS、团购核销、会员、预约、库存、财务系统 API 或导出样表。',
        acceptance: '没有来源字段不做归因；有来源字段时能解释券领取、核销、客单、毛利、人效和下一步动作。',
      },
    ],
    safetyBoundary: '这个策略只决定产品底座和构建顺序；不代表外部平台、Provider、POS、浏览器 runtime 或商家账号已经接通。',
  };
}

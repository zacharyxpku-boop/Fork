export type RestaurantGrowthLoopStageId =
  | 'intake'
  | 'diagnose'
  | 'create'
  | 'publish-proof'
  | 'recover'
  | 'review-loop';

export type RestaurantGrowthLoopOwner = '老板 / 店长' | '运营' | '社群 / 店长' | '店长 / 运营';

export type RestaurantGrowthLoopStage = {
  id: RestaurantGrowthLoopStageId;
  internalName: 'Intake' | 'Diagnose' | 'Create' | 'Publish Proof' | 'Recover' | 'Review Loop';
  customerStage: string;
  title: string;
  body: string;
  proof: string;
  inputs: readonly string[];
  outputs: readonly string[];
  evidence: readonly string[];
  externalGate: string;
  owner: RestaurantGrowthLoopOwner;
  benchmarkSignal: string;
};

export type RestaurantTodayTaskCard = {
  title: string;
  owner: RestaurantGrowthLoopOwner;
  evidence: string;
  status: string;
  next: string;
};

export const RESTAURANT_TODAY_TASK_CARDS = [
  {
    title: '今天先定一道菜',
    owner: '老板 / 店长',
    evidence: '菜单、菜品图、套餐边界',
    status: '可先录入',
    next: '确认主推菜、目标客群和到店场景',
  },
  {
    title: '今天先出一组内容',
    owner: '运营',
    evidence: '脚本、图文、社群话术、海报 brief',
    status: '内部可生成',
    next: '交给门店审核，不能直接说已发布',
  },
  {
    title: '今天先留一条凭证',
    owner: '社群 / 店长',
    evidence: '发布链接、截图、时间、负责人',
    status: '手工回填',
    next: '没有平台授权前，只做计划和凭证槽',
  },
] as const satisfies readonly RestaurantTodayTaskCard[];

export const RESTAURANT_GROWTH_LOOP_STAGES = [
  {
    id: 'intake',
    internalName: 'Intake',
    customerStage: '1 录入',
    title: '录入门店任务',
    body: '餐厅、门店、菜品/套餐、目标客群、到店场景、优惠边界、素材状态。',
    proof: '门店任务表',
    inputs: ['餐厅', '门店', '菜品/套餐', '目标客群', '优惠边界', '素材现状'],
    outputs: ['门店任务表', '负责人分工', '下一步待补信息'],
    evidence: ['菜单', '菜品图', '套餐边界', '门店素材'],
    externalGate: '平台账号和商户授权确认前，只能排期和回填凭证。',
    owner: '老板 / 店长',
    benchmarkSignal: 'Owner.com 类独立门店增长平台从门店和菜品入口建立执行单。',
  },
  {
    id: 'diagnose',
    internalName: 'Diagnose',
    customerStage: '2 诊断',
    title: '判断今天卖点',
    body: '用公开资料、人工输入和脱敏经营汇总，找到店理由、差评风险、竞品机会和素材缺口。',
    proof: '诊断摘要',
    inputs: ['公开门店资料', '人工补充', '脱敏经营汇总', '评价/社群摘要'],
    outputs: ['到店理由', '差评风险', '竞品机会', '素材缺口'],
    evidence: ['公开链接', '截图', '人工备注', '汇总表'],
    externalGate: '未经店长确认的公开信息，只能做初步判断。',
    owner: '店长 / 运营',
    benchmarkSignal: '美团智能掌柜类经营工具引导店长从评价、报表、选址和顾客理解里做判断。',
  },
  {
    id: 'create',
    internalName: 'Create',
    customerStage: '3 生成',
    title: '生成可审内容',
    body: '短视频脚本、图文笔记、点评回复、社群话术、团购券说明、门店海报 brief。',
    proof: '内容草稿',
    inputs: ['到店理由', '素材清单', '优惠边界', '禁用表达'],
    outputs: ['短视频脚本', '图文笔记', '点评回复', '社群话术', '团购券说明', '门店海报 brief'],
    evidence: ['内容版本', '审核状态', '门店修改意见'],
    externalGate: '视频试跑通道回执未验收前，不能说已有成片。',
    owner: '运营',
    benchmarkSignal: '筷子科技类创意工具把编导灵感、视频解析、脚本和混剪拆成可审核的内容产物。',
  },
  {
    id: 'publish-proof',
    internalName: 'Publish Proof',
    customerStage: '4 发布凭证',
    title: '安排渠道凭证',
    body: '大众点评、美团、小红书、抖音、微信社群只记录链接、截图、发布时间、负责人和状态。',
    proof: '发布凭证槽',
    inputs: ['渠道', '内容版本', '负责人', '预计时间'],
    outputs: ['发布计划', '凭证槽', '待回填清单'],
    evidence: ['链接', '截图', '发布时间', '负责人', '状态'],
    externalGate: '平台账号/商户授权未确认前，不自动发布、不读取后台、不联系顾客。',
    owner: '运营',
    benchmarkSignal: 'SevenRooms 类前厅系统重视评论、短信和邮件跟进的记录，Wenai POC 阶段先做可回填凭证。',
  },
  {
    id: 'recover',
    internalName: 'Recover',
    customerStage: '5 回收',
    title: '回收到店信号',
    body: '预约、券领取、私信咨询、评价、社群反馈、到店/核销汇总只保存脱敏聚合信号。',
    proof: '反馈汇总',
    inputs: ['预约汇总', '券领取汇总', '社群反馈', '评价摘要', '到店/核销汇总'],
    outputs: ['脱敏汇总信号', '风险提醒', '跟进对象'],
    evidence: ['汇总表', '人工备注', '门店回填'],
    externalGate: '收银/核销/会员数据约定未确认前，不做真实经营归因。',
    owner: '社群 / 店长',
    benchmarkSignal: 'Slang、ConverseNow 和 Square Voice AI 类语音助手重心不是生成文案，而是留下可复盘信号。',
  },
  {
    id: 'review-loop',
    internalName: 'Review Loop',
    customerStage: '6 复盘',
    title: '给下一轮动作',
    body: '推哪道菜、改哪个卖点、补什么素材、谁跟进、是否放大或暂停。',
    proof: '复盘工单',
    inputs: ['发布凭证', '脱敏汇总信号', '负责人反馈', '素材缺口'],
    outputs: ['下一轮动作', '推哪道菜', '改哪个卖点', '谁跟进', '是否放大'],
    evidence: ['复盘工单', '负责人', '下次截止时间'],
    externalGate: '库存、订货、成本和毛利数据未建约前，只做条件提醒，不做实时毛利结论。',
    owner: '店长 / 运营',
    benchmarkSignal: 'MarketMan 类工具把库存、订货、成本和浪费控制接入复盘，POC 阶段只标注数据条件。',
  },
] as const satisfies readonly RestaurantGrowthLoopStage[];

export const RESTAURANT_GROWTH_LOOP_INTERNAL_READY_NOW = [
  '生成门店任务表、卖点诊断、内容草稿和店长跟进清单',
  '创建发布凭证槽：链接、截图、发布时间、负责人、状态',
  '把预约、券领取、评价和社群反馈整理成脱敏汇总字段',
] as const;

export const RESTAURANT_GROWTH_LOOP_EXTERNAL_GATES_NOW = [
  '平台账号/商户授权未确认前，不自动发布、不读取后台、不联系顾客',
  '收银/核销/会员数据约定未确认前，不做真实经营归因',
  '视频试跑通道回执未验收前，不能说已有成片',
] as const;

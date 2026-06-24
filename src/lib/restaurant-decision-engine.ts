export type RestaurantDecisionInput = {
  restaurant: string;
  offer: string;
  price: number;
  foodCostRate: number;
  availablePortions: number;
  targetRevenue: number;
  yesterdayRevenue: number;
  couponClaims: number;
  reservations: number;
  privateMessages: number;
  redemptions: number;
  averageTicket: number;
  serviceWindow: string;
  owner: string;
};

export type RestaurantDecisionOutput = {
  grossProfitPerOrder: number;
  revenueGap: number;
  ordersNeeded: number;
  leadPressure: 'low' | 'medium' | 'high';
  inventoryRisk: 'safe' | 'watch' | 'tight';
  headline: string;
  decision: string;
  why: string[];
  channelPack: Array<{
    channel: string;
    job: string;
    copy: string;
    proof: string;
  }>;
  actionQueue: Array<{
    owner: string;
    action: string;
    due: string;
    evidence: string;
  }>;
  blockedAutomation: Array<{
    capability: string;
    missing: string;
    whyCompetitorsCan: string;
  }>;
};

const clampNumber = (value: number, fallback = 0) => (
  Number.isFinite(value) && value >= 0 ? value : fallback
);

export function buildRestaurantDecision(input: RestaurantDecisionInput): RestaurantDecisionOutput {
  const price = Math.max(1, clampNumber(input.price, 1));
  const foodCostRate = Math.min(0.95, Math.max(0.05, clampNumber(input.foodCostRate, 0.35)));
  const grossProfitPerOrder = Math.round(price * (1 - foodCostRate));
  const revenueGap = Math.max(0, clampNumber(input.targetRevenue) - clampNumber(input.yesterdayRevenue));
  const ordersNeeded = Math.ceil(revenueGap / price);
  const totalLeads = clampNumber(input.couponClaims) + clampNumber(input.reservations) + clampNumber(input.privateMessages);
  const unconvertedLeads = Math.max(0, totalLeads - clampNumber(input.redemptions));
  const leadPressure = unconvertedLeads >= 30 ? 'high' : unconvertedLeads >= 12 ? 'medium' : 'low';
  const inventoryRisk = input.availablePortions <= ordersNeeded ? 'tight' : input.availablePortions <= Math.ceil(ordersNeeded * 1.35) ? 'watch' : 'safe';

  const leadAction = leadPressure === 'high'
    ? `先追 ${Math.min(unconvertedLeads, 20)} 个未核销线索，不要继续加内容量`
    : '先发一轮轻量内容，再看预约和券领取回填';
  const inventoryAction = inventoryRisk === 'tight'
    ? `库存只够 ${input.availablePortions} 份，活动文案必须写限量和售罄边界`
    : inventoryRisk === 'watch'
      ? '库存接近目标需求，发布前让后厨确认备货'
      : '库存足够，可以正常推主套餐';

  return {
    grossProfitPerOrder,
    revenueGap,
    ordersNeeded,
    leadPressure,
    inventoryRisk,
    headline: `${input.serviceWindow} 主推 ${input.offer}`,
    decision: `${input.restaurant} 今天先推 ${input.offer}，目标补 ${ordersNeeded} 单；${leadAction}。`,
    why: [
      `按 ${price} 元客单和 ${Math.round(foodCostRate * 100)}% 食材成本估算，单份毛利约 ${grossProfitPerOrder} 元。`,
      revenueGap > 0 ? `距离目标还差 ${revenueGap} 元，需要约 ${ordersNeeded} 单。` : '昨日收入已覆盖今日目标，优先做复购和评价沉淀。',
      `当前未转化线索约 ${unconvertedLeads} 个，线索压力为 ${leadPressure}。`,
      inventoryAction,
    ],
    channelPack: [
      {
        channel: '大众点评',
        job: '承接搜索和团购券',
        copy: `${input.offer}｜${input.serviceWindow} 可用，价格、限量和核销规则以门店确认为准。`,
        proof: '需要门店页链接、团购券规则、核销截图或后台导出。',
      },
      {
        channel: '小红书',
        job: '讲清到店理由',
        copy: `今天想吃一顿稳的：${input.offer}，适合 ${input.serviceWindow} 约饭。先看菜单、价格和实拍图再决定。`,
        proof: '需要菜品图、门店环境图、不可夸大的卖点和发布链接。',
      },
      {
        channel: '抖音',
        job: '用 15 秒解释为什么现在来',
        copy: `镜头 1：门店门头；镜头 2：${input.offer} 出餐；镜头 3：限量/可用时段；结尾：评论或私信问今天是否还有位。`,
        proof: '需要真实视频素材、发布链接、评论/私信摘录。',
      },
      {
        channel: '微信社群',
        job: '把熟客拉回店',
        copy: `${input.serviceWindow} 还有 ${Math.max(0, input.availablePortions - input.redemptions)} 份 ${input.offer} 可确认，想来的直接回复人数和到店时间。`,
        proof: '需要群内回复、预约表和到店确认记录。',
      },
    ],
    actionQueue: [
      {
        owner: input.owner,
        action: inventoryAction,
        due: '发布前',
        evidence: '后厨备货确认、菜单价、限量规则。',
      },
      {
        owner: '运营',
        action: `按 ${ordersNeeded} 单目标生成 4 个渠道版本，先让店长确认禁用表达。`,
        due: '30 分钟内',
        evidence: '内容草稿、菜品图、团购券规则。',
      },
      {
        owner: input.owner,
        action: `把 ${unconvertedLeads} 个未转化线索分成预约、券领取、私信三类。`,
        due: '营业高峰前',
        evidence: '预约表、券领取截图、私信咨询摘要。',
      },
      {
        owner: '店长',
        action: '营业后回填核销、桌数、客单和差评原因。',
        due: '收档后',
        evidence: 'POS/收银摘要、团购核销表、评价截图。',
      },
    ],
    blockedAutomation: [
      {
        capability: '发布执行',
        missing: '平台账号授权、内容 ID、审核结果和发布回执。',
        whyCompetitorsCan: '平台或生态工具拿到了商家后台/开放平台权限，我们没有你的账号授权就不能代发。',
      },
      {
        capability: '线索承接',
        missing: '流量平台账户权限、线索回调、用户授权和预算账户。',
        whyCompetitorsCan: '美团/点评掌握交易和流量入口，POS/营销套件掌握会员触达；我们现在没有这些通道。',
      },
      {
        capability: '核销承接',
        missing: '团购券核销接口、收银/POS 对账字段、核销码权限。',
        whyCompetitorsCan: '核销发生在平台或收银系统里，必须接入商户后台或 POS。',
      },
      {
        capability: '真实经营分析',
        missing: 'POS 流水、菜品销量、库存、毛利、排班、评价和会员数据。',
        whyCompetitorsCan: 'R365/Toast 这类系统直接整合 POS、库存、财务和劳动力数据，我们现在只能分析你输入或导入的数据。',
      },
    ],
  };
}

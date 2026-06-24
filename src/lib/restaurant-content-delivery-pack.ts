export type RestaurantContentChannel = 'dianping' | 'xiaohongshu' | 'douyin' | 'wechat';

export interface RestaurantContentDeliveryInput {
  restaurantName: string;
  dishOrOffer: string;
  audience: string;
  channels: RestaurantContentChannel[];
  localArea?: string;
  referenceEvidence?: string;
  constraints?: string;
}

export interface RestaurantShortVideoScript {
  title: string;
  hook: string;
  storyboard: string[];
  voiceover: string[];
  cta: string;
  proofRequired: string[];
}

export interface RestaurantContentDeliveryPack {
  title: string;
  note: string;
  status: 'draft_only' | 'ready_for_manager_review';
  inputSummary: string[];
  referenceBreakdown: string[];
  scripts: RestaurantShortVideoScript[];
  brollChecklist: string[];
  publishProofSlots: string[];
  managerReviewChecklist: string[];
  followUpTasks: string[];
  markdown: string;
}

const CHANNEL_LABEL: Record<RestaurantContentChannel, string> = {
  dianping: '大众点评',
  xiaohongshu: '小红书',
  douyin: '抖音',
  wechat: '微信社群',
};

function clean(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

function channelLabels(channels: RestaurantContentChannel[]) {
  const unique = Array.from(new Set(channels));
  return (unique.length > 0 ? unique : ['dianping', 'xiaohongshu', 'douyin'] as RestaurantContentChannel[])
    .map(channel => CHANNEL_LABEL[channel]);
}

function splitEvidence(referenceEvidence: string) {
  return referenceEvidence
    .split(/\r?\n|;|；/)
    .map(item => item.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function buildReferenceBreakdown(referenceEvidence: string, offer: string, area: string) {
  const evidence = splitEvidence(referenceEvidence);

  if (evidence.length === 0) {
    return [
      `未提供参考链接或截图；先按 ${area} 同城餐饮常见结构生成假设。`,
      `参考拆解必须由店长或运营补充大众点评/小红书/抖音/微信社群证据后再定稿。`,
      `当前不能伪装成已抓取平台或已完成真实竞品调研。`,
    ];
  }

  return evidence.map((item, index) => (
    `参考 ${index + 1}: ${item} -> 提取与 ${offer} 相关的开场镜头、价格/场景表达、顾客疑问和发布证明要求。`
  ));
}

function buildScripts(restaurant: string, offer: string, audience: string, channels: string[]): RestaurantShortVideoScript[] {
  const channelText = channels.join(' / ');

  return [
    {
      title: '到店理由开场',
      hook: `今天不是介绍一家店，而是帮 ${audience} 找一个现在就有理由来的 ${offer}。`,
      storyboard: [
        `0-3s: 门头或菜品近景，字幕写清 ${restaurant} 和 ${offer}。`,
        '3-8s: 展示用餐场景，说明适合哪类客人和哪个时间段。',
        '8-16s: 拍菜品核心卖点、分量、搭配和需要店长确认的价格/核销边界。',
        `16-24s: 给出 ${channelText} 适配 CTA，提醒查看发布链接或截图、社群通知和负责人。`,
      ],
      voiceover: [
        `${audience} 如果今天不知道吃什么，先看这个到店理由。`,
        `${offer} 的重点不是夸张宣传，而是场景、分量和核销边界说清楚。`,
        '想来的用户看发布链接或截图，店长只跟进真实预约、券领取和私信。',
      ],
      cta: '查看团购/预约信息，或在社群里回复想来的时间。',
      proofRequired: ['发布链接或截图', '评论/私信/券领取截图', '店长确认的价格与核销边界'],
    },
    {
      title: '招牌菜细节开场',
      hook: `先看 ${offer} 的第一口，再决定要不要收藏这家 ${restaurant}。`,
      storyboard: [
        '0-3s: 菜品特写或上桌动作，不使用未授权素材。',
        '3-10s: 拆一道菜的口味、分量、搭配和适用人数。',
        '10-18s: 插入菜单/团购券/门店图，标注待确认项。',
        '18-25s: 引导用户保存、咨询或到店前确认可用时间。',
      ],
      voiceover: [
        `这条只讲 ${offer}，不编销量、不说最低价。`,
        '如果价格、库存、限量和核销没有确认，必须标成待确认。',
        '发布后把链接或截图回填，方便下一轮复盘。',
      ],
      cta: '收藏这条，出发前确认活动是否仍可用。',
      proofRequired: ['菜品图/门店图授权', '菜单或券包截图', '发布证明和人工复核记录'],
    },
    {
      title: '同城避坑开场',
      hook: `${audience} 到店前最怕信息不清楚：价格、排队、核销和营业时间先讲明白。`,
      storyboard: [
        '0-4s: 用字幕列出到店前要确认的 3 个问题。',
        `4-12s: 用 ${offer} 回答价格/分量/时间段/核销边界。`,
        '12-20s: 展示店内环境、排队或桌面场景，不能编造客流。',
        '20-28s: 给出店长/社群的下一步跟进动作。',
      ],
      voiceover: [
        '这条不是硬广，是到店前说明书。',
        '活动能不能用、什么时候用、谁来确认，都要说清楚。',
        '有预约、券领取或私信再交给负责人跟进。',
      ],
      cta: '把问题发到社群或私信，店长按真实情况确认。',
      proofRequired: ['活动边界截图', '负责人确认记录', '预约/私信/券领取聚合证据'],
    },
  ];
}

function buildMarkdown(pack: Omit<RestaurantContentDeliveryPack, 'markdown'>) {
  return [
    `# ${pack.title}`,
    '',
    pack.note,
    '',
    '## 输入摘要',
    ...pack.inputSummary.map(item => `- ${item}`),
    '',
    '## 参考拆解',
    ...pack.referenceBreakdown.map(item => `- ${item}`),
    '',
    '## 探店脚本',
    ...pack.scripts.flatMap(script => [
      `### ${script.title}`,
      `- Hook: ${script.hook}`,
      `- CTA: ${script.cta}`,
      ...script.storyboard.map(item => `- 分镜: ${item}`),
      ...script.proofRequired.map(item => `- 证明: ${item}`),
    ]),
    '',
    '## B-roll 素材清单',
    ...pack.brollChecklist.map(item => `- ${item}`),
    '',
    '## 发布证明',
    ...pack.publishProofSlots.map(item => `- ${item}`),
    '',
    '## 店长审核',
    ...pack.managerReviewChecklist.map(item => `- ${item}`),
    '',
    '## 跟进任务',
    ...pack.followUpTasks.map(item => `- ${item}`),
  ].join('\n');
}

export function buildRestaurantContentDeliveryPack(input: RestaurantContentDeliveryInput): RestaurantContentDeliveryPack {
  const restaurant = clean(input.restaurantName, '待补餐厅');
  const offer = clean(input.dishOrOffer, '待补菜品/套餐/门店活动');
  const audience = clean(input.audience, '待补目标客群');
  const area = clean(input.localArea, '本地商圈');
  const channels = channelLabels(input.channels);
  const constraints = clean(input.constraints, '价格、库存、限量、核销、食品安全和素材授权待店长确认');
  const referenceEvidence = clean(input.referenceEvidence, '');

  const packWithoutMarkdown: Omit<RestaurantContentDeliveryPack, 'markdown'> = {
    title: `${restaurant} - ${offer} 餐饮探店短视频交付包`,
    note: '该交付包只生成脚本、分镜、素材清单、发布证明要求和店长审核项；没有外部授权时不代表已发布、已核销或已产生真实到店结果。',
    status: referenceEvidence ? 'ready_for_manager_review' : 'draft_only',
    inputSummary: [
      `门店: ${restaurant}`,
      `菜品/套餐/活动: ${offer}`,
      `目标客群: ${audience}`,
      `本地范围: ${area}`,
      `目标渠道: ${channels.join(' / ')}`,
      `活动边界: ${constraints}`,
    ],
    referenceBreakdown: buildReferenceBreakdown(referenceEvidence, offer, area),
    scripts: buildScripts(restaurant, offer, audience, channels),
    brollChecklist: [
      '门头、门店环境、餐桌、上菜动作和菜品近景。',
      '菜单、团购券、营业时间、可用时段和核销规则截图。',
      '店长确认的价格、库存、限量、食材或活动边界。',
      '禁止使用未授权顾客肖像、私信原文、联系电话、微信号或收银明细。',
    ],
    publishProofSlots: channels.map(channel => `${channel}: 发布链接或截图、发布时间、负责人、评论/私信/券领取聚合信号。`),
    managerReviewChecklist: [
      '菜品名称、价格、分量、可用时段和核销规则是否准确。',
      '是否存在最低价、销量、排队人数、食品功效或虚假评价暗示。',
      '素材是否已授权，是否需要遮挡顾客、人脸、联系电话或微信号。',
      '发布后谁回填链接/截图，谁处理预约、券领取、私信和社群问题。',
    ],
    followUpTasks: [
      '运营：把通过审核的脚本交给拍摄/剪辑，保留版本号。',
      '发布负责人：只发布已确认版本，并回填链接或截图。',
      '店长/社群：只跟进真实预约、券领取、私信咨询和到店反馈。',
      '复盘负责人：7 天后用发布证明和聚合信号决定下一轮菜品/套餐/活动。',
    ],
  };

  return {
    ...packWithoutMarkdown,
    markdown: buildMarkdown(packWithoutMarkdown),
  };
}

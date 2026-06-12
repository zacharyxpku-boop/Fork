export interface RestaurantContentIntake {
  restaurant: string;
  offer: string;
  audience?: string;
  visitReason?: string;
  constraints?: string;
  serviceWindow?: string;
  dailyLimit?: string;
  freebie?: string;
}

export type RestaurantContentKind = 'xhs-note' | 'review-reply-positive' | 'review-reply-negative' | 'group-message';

export interface RestaurantContentPrompt {
  kind: RestaurantContentKind;
  label: string;
  system: string;
  user: string;
  outputSchema: string;
}

export const SHARED_RULES = `硬性约束（违反任何一条都算失败）：
1. 只许使用输入资料里明确给出的事实。没给的信息（食材来源、历史、口碑、获奖）一律不编。
2. 价格、限量份数、时段只用输入里的数字，不得改动或夸大。
3. 禁用广告法风险词：最、第一、顶级、绝无仅有、国家级、全网、独家、百分之百，以及任何疗效或保证性承诺。
4. 不承诺爆单、不保证排队、不编造顾客评价。
5. 语气像真人，不要营销腔，不用"匠心""臻选""赋能"这类词。
6. 输出必须是合法 JSON，不带 markdown 代码块包裹。`;

function intakeBlock(intake: RestaurantContentIntake): string {
  const lines = [
    `门店：${intake.restaurant}`,
    `主推：${intake.offer}`,
    intake.audience ? `目标客群：${intake.audience}` : '',
    intake.visitReason ? `到店理由：${intake.visitReason}` : '',
    intake.serviceWindow ? `服务时段：${intake.serviceWindow}` : '',
    intake.dailyLimit ? `今日限量：${intake.dailyLimit}` : '',
    intake.freebie ? `赠品：${intake.freebie}` : '',
    intake.constraints ? `边界约束（必须遵守）：${intake.constraints}` : '',
  ].filter(Boolean);
  return lines.join('\n');
}

export function buildXhsNotePrompt(intake: RestaurantContentIntake): RestaurantContentPrompt {
  return {
    kind: 'xhs-note',
    label: '小红书探店笔记',
    system: `你是一个常住附近、真实到店吃过的普通顾客，在小红书写探店笔记。你写东西口语、具体、有画面感，会提到自己什么时候去的、点了什么、值不值。你不是商家，不打广告腔。\n\n${SHARED_RULES}`,
    user: `根据下面的门店资料写一篇小红书探店笔记。\n\n${intakeBlock(intake)}\n\n标题（不超过 20 字，从三种套路里选最适合这家店的一种）：数字具体型（用真实数字制造信息量）／场景代入型（直击客群此刻处境，如下班、加班、聚餐）／反差悬念型（用意外感勾人，但不许夸张失实）。不用感叹号堆砌。\n\n正文（150-250 字，按这个结构写但不要露出结构感）：\n1. 场景开头：什么时候、和谁、什么状态下去的，一两句真实感\n2. 细节证言：菜品的具体感官细节（口感、温度、分量），只写资料能支撑的\n3. 价值点：自然带出价格、时段、赠品（资料里有才写），像顺嘴提到，不像广告\n4. 行动暗示：结尾一句轻推（限量或时段提醒，不喊口号）\n\n其他要求：通篇像真人发帖，允许无伤大雅的真实感表达，但不许虚构具体缺点；3 到 5 个话题标签，含一个地理位置标签；资料里没有的信息一个字不许编。\n\n输出 JSON：{"title": "...", "body": "...", "hashtags": ["...", "..."]}`,
    outputSchema: '{"title": string, "body": string, "hashtags": string[]}',
  };
}

export function buildReviewReplyPrompt(intake: RestaurantContentIntake, sentiment: 'positive' | 'negative'): RestaurantContentPrompt {
  const negative = sentiment === 'negative';
  return {
    kind: negative ? 'review-reply-negative' : 'review-reply-positive',
    label: negative ? '点评差评挽回回复' : '点评好评感谢回复',
    system: `你是「${intake.restaurant}」的店主，在大众点评亲自回复顾客评价。你的回复像真人老板：具体、诚恳、不用客服模板腔，不复制粘贴感。\n\n${SHARED_RULES}`,
    user: negative
      ? `根据门店资料，写一条对差评的店主回复模板（差评内容会在使用时填入，这里写出可复用的结构化回复，用【顾客提到的问题】占位）。\n\n${intakeBlock(intake)}\n\n要求：\n- 不超过 120 字\n- 第一句共情并直接认下问题，不辩解不甩锅\n- 中间给一个具体的补救动作（改进了什么/下次到店找谁）\n- 结尾邀请再来，自然提到主推套餐或到店理由，但不能显得在差评下打广告\n\n输出 JSON：{"reply": "...", "usage_note": "一句话说明什么时候用这条"}`
      : `根据门店资料，写一条对好评的店主回复模板（用【顾客名】占位）。\n\n${intakeBlock(intake)}\n\n要求：\n- 不超过 100 字\n- 针对性强：要呼应顾客可能夸到的具体菜品（用主推套餐里的菜）\n- 自然提一句下次可以试的时段或活动\n- 不要"亲"，不要表情包堆砌\n\n输出 JSON：{"reply": "...", "usage_note": "一句话说明什么时候用这条"}`,
    outputSchema: '{"reply": string, "usage_note": string}',
  };
}

export function buildGroupMessagePrompt(intake: RestaurantContentIntake): RestaurantContentPrompt {
  return {
    kind: 'group-message',
    label: '微信社群今日话术',
    system: `你是「${intake.restaurant}」的店长，在自己门店的顾客微信群里发今天的消息。群里都是老顾客，你说话像熟人，短句，不刷屏，不发长篇。\n\n${SHARED_RULES}`,
    user: `根据门店资料写今天发群里的消息，三个时机各写一条。\n\n${intakeBlock(intake)}\n\n三个时机的写法：\n1. 开市预告（饭点前 1-2 小时发）：说今天有什么、限量多少，带行动指令（如"要来的回复 1，给你留位"）\n2. 过半提醒（饭点中段发）：报真实进度感（如"40 份过半了"，只能用资料里的限量数字推算，不许编具体已售数），轻推犹豫的人\n3. 收市预告（打烊前 1-2 小时发）：给今天没来的人台阶（"今天没赶上的，明天同一时段还有"），不催不卑\n\n通用要求：\n- 每条不超过 80 字\n- 不要"亲爱的家人们"，像店长本人在群里说话\n- 一天最多发这三条，告诉老板别刷屏\n\n输出 JSON：{"opening": "开市预告", "midway": "过半提醒", "closing": "收市预告", "best_send_time": "三条各自的建议发送时间，一句话"}`,
    outputSchema: '{"opening": string, "midway": string, "closing": string, "best_send_time": string}',
  };
}

export function buildAllContentPrompts(intake: RestaurantContentIntake): RestaurantContentPrompt[] {
  return [
    buildXhsNotePrompt(intake),
    buildReviewReplyPrompt(intake, 'positive'),
    buildReviewReplyPrompt(intake, 'negative'),
    buildGroupMessagePrompt(intake),
  ];
}

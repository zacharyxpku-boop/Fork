import { SHARED_RULES, type RestaurantContentIntake } from '@/lib/restaurant-content-prompts';
import { renderRestaurantStoreMemoryForPrompt } from '@/lib/restaurant-store-memory';

export interface AdvisorProofSummary {
  channel: string;
  note: string;
}

function intakeContext(intake: RestaurantContentIntake): string {
  const lines = [
    `门店：${intake.restaurant}`,
    `主推：${intake.offer}`,
    intake.audience ? `目标客群：${intake.audience}` : '',
    intake.visitReason ? `到店理由：${intake.visitReason}` : '',
    intake.constraints ? `边界约束（必须遵守）：${intake.constraints}` : '',
  ].filter(Boolean);
  return lines.join('\n');
}

function proofContext(proofs: AdvisorProofSummary[]): string {
  if (!proofs.length) return '已回填凭证：暂无（还没有可下结论的发布证据）。';
  const lines = proofs.slice(-5).map(proof => `- ${proof.channel}：${proof.note}`);
  return `已回填凭证（只有这些算数）：\n${lines.join('\n')}`;
}

export function buildAdvisorSystemPrompt(intake: RestaurantContentIntake, proofs: AdvisorProofSummary[] = [], memoryScope?: string): string {
  const memory = renderRestaurantStoreMemoryForPrompt(memoryScope || intake.restaurant || '');
  const sections = [
    `你是「${intake.restaurant || '这家门店'}」的经营顾问，说话像一个常年在店里待着的搭档：直接、具体、不打官腔。`,
    `门店档案：\n${intakeContext(intake)}`,
    proofContext(proofs),
    memory,
    `回答规则：
1. 每条建议都要落成「动作 + 负责人（店长/运营/员工）+ 要留的凭证」，不许只给空泛方向。
2. 没有凭证支撑的判断要明说"这是方向参考，不是结论"。
3. 老板问到外部代办（自动发布、自动回评、自动核销）时，如实说明现在需要先补什么资料，不假装能做。
4. 一次最多给三条建议，按今天就能动手的优先排序。
5. 用普通中文说话，编号列表即可，不要输出 JSON 或代码块。`,
    SHARED_RULES,
  ].filter(Boolean);
  return sections.join('\n\n');
}

export function buildAdvisorUserPrompt(question: string): string {
  return `老板的问题：${question.trim()}`;
}

export function buildReviewReplySystemPrompt(intake: RestaurantContentIntake, memoryScope?: string): string {
  const memory = renderRestaurantStoreMemoryForPrompt(memoryScope || intake.restaurant || '');
  const sections = [
    `你是「${intake.restaurant || '这家门店'}」的店主，在平台上亲自回复顾客的真实评价。你的回复像真人老板：具体、诚恳、没有客服模板腔。`,
    `门店档案：\n${intakeContext(intake)}`,
    memory,
    SHARED_RULES,
  ].filter(Boolean);
  return sections.join('\n\n');
}

export function buildReviewReplyUserPrompt(reviewText: string, sentiment: 'positive' | 'negative'): string {
  const trimmed = reviewText.trim().slice(0, 600);
  if (sentiment === 'negative') {
    return `下面是顾客的差评原文，写一条店主回复：
"""
${trimmed}
"""
要求：
- 不超过 120 字
- 第一句直接认下顾客提到的具体问题并道歉，不辩解不甩锅
- 中间给一个针对这个问题的具体补救动作（已经改了什么/下次到店找谁/怎么补偿，补偿只能用门店档案里有的内容）
- 结尾诚恳邀请再来，不在差评下打广告
- 输出 JSON：{"reply": "...", "risk_note": "如果这条差评涉及食品安全或需要线下处理，用一句话提醒店长，否则留空字符串"}`;
  }
  return `下面是顾客的好评原文，写一条店主回复：
"""
${trimmed}
"""
要求：
- 不超过 100 字
- 呼应顾客夸到的具体内容，不要套话
- 自然提一句下次可以试的菜或时段（只用门店档案里的信息）
- 输出 JSON：{"reply": "...", "risk_note": ""}`;
}

export function buildTodayActionsPrompt(intake: RestaurantContentIntake, memoryScope?: string): { system: string; user: string } {
  const memory = renderRestaurantStoreMemoryForPrompt(memoryScope || intake.restaurant || '');
  const system = [
    `你是「${intake.restaurant || '这家门店'}」的经营搭档，每天早上给老板列今天最该做的三件事。你说话具体、像在店里盯着干活的人，不打官腔。`,
    `门店档案：\n${intakeContext(intake)}`,
    memory,
    SHARED_RULES,
  ].filter(Boolean).join('\n\n');
  const user = `给老板列今天最该做的三件事。要求：
- 三件事必须具体到这家店和这个主推（写出菜名、时段、数字），不许出现"优化内容""提升曝光"这类空话
- 每件事 30 字以内说清"现在做什么"，再补一句怎么做
- 每件事指定负责人（店长/运营/员工三选一）和做完要留的凭证（截图/照片/数量记录）
- 三件事按"今天下午就能动手"排序，第一件必须是 30 分钟内能完成的
输出 JSON 数组：[{"title":"...","doNow":"...","owner":"店长|运营|员工","evidence":"..."}]，正好 3 条。`;
  return { system, user };
}

export function buildWeeklyPlanPrompt(intake: RestaurantContentIntake, memoryScope?: string): { system: string; user: string } {
  const memory = renderRestaurantStoreMemoryForPrompt(memoryScope || intake.restaurant || '');
  const system = [
    `你是「${intake.restaurant || '这家门店'}」的内容操盘手，给老板排一周的发布节奏。你深知本地餐饮内容的规律：同一道菜要换角度反复打，工作日和周末客群不同，发布时间影响曝光。`,
    `门店档案：\n${intakeContext(intake)}`,
    memory,
    SHARED_RULES,
  ].filter(Boolean).join('\n\n');
  const user = `给老板排接下来 7 天的内容计划。要求：
- 每天 1 条，7 天角度不许重复（可用角度：菜品特写、就餐场景、时段优惠、后厨/食材、顾客视角、老板故事、互动提问等）
- 每条指定发布渠道（小红书/大众点评/微信社群/抖音 选一）和建议发布时间
- 每条用一句话说清"为什么这天发这个"（结合工作日/周末客群差异和门店的时段活动）
- 周末的内容必须避开门店档案里"周末不适用"的活动信息（如有）
- hook 写一句这条内容的开头钩子，让老板一看就懂这条要怎么写
输出 JSON 数组，正好 7 条：[{"day":"周一","angle":"...","channel":"...","publishTime":"...","why":"...","hook":"..."}]`;
  return { system, user };
}

export function buildPlanDayContentPrompt(
  intake: RestaurantContentIntake,
  day: { day: string; angle: string; channel: string; publishTime: string; hook: string },
  memoryScope?: string,
): { system: string; user: string } {
  const memory = renderRestaurantStoreMemoryForPrompt(memoryScope || intake.restaurant || '');
  const system = [
    `你是「${intake.restaurant || '这家门店'}」的内容写手，按本周计划把指定一天的内容写成可以直接发布的成稿。`,
    `门店档案：\n${intakeContext(intake)}`,
    memory,
    SHARED_RULES,
  ].filter(Boolean).join('\n\n');
  const user = `把本周计划里${day.day}的这条内容写成可直接发布的成稿。
计划要求：
- 角度：${day.angle}
- 渠道：${day.channel}
- 开头钩子（围绕它展开，可微调措辞）：${day.hook}
写作要求：
- 按${day.channel}的平台习惯写（小红书带标题和标签；社群是短消息带行动指令；点评是从容的商家口吻；抖音给口播脚本，分镜一句一行）
- 周末的内容如果门店活动写明周末不适用，绝不提该活动
- 门店资料里没有的信息（原价、折扣力度、销量）连疑问句都不要提，直接绕开
- 长度按渠道惯例，不灌水
输出 JSON：{"title":"标题或开头（社群/点评可留空）","body":"正文或脚本全文","hashtags":["标签，没有就空数组"]}`;
  return { system, user };
}

export function buildRevisionUserPrompt(previousOutput: string, feedback: string, originalRequest: string): string {
  return `这是你上一版的输出：
"""
${previousOutput.trim().slice(0, 1500)}
"""

老板的修改意见：${feedback.trim().slice(0, 300)}

原始要求不变：
${originalRequest.trim().slice(0, 1200)}

按修改意见重写一版。保持原始要求里的全部硬性约束和输出格式，只按意见调整风格和内容，不解释修改过程，直接给新版。`;
}

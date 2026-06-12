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

export function buildAdvisorSystemPrompt(intake: RestaurantContentIntake, proofs: AdvisorProofSummary[] = []): string {
  const memory = renderRestaurantStoreMemoryForPrompt(intake.restaurant || '');
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

export function buildReviewReplySystemPrompt(intake: RestaurantContentIntake): string {
  const memory = renderRestaurantStoreMemoryForPrompt(intake.restaurant || '');
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

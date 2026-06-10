export type ParsedLlmJson =
  | { ok: true; data: Record<string, unknown> }
  | { ok: false; raw: string };

/**
 * 容错解析模型输出的 JSON：剥 markdown 代码块、截取首个平衡的大括号片段、
 * 全部失败时原样返回，让上层回退到纯文本展示，绝不抛错。
 */
export function parseLlmJson(text: string): ParsedLlmJson {
  const raw = (text || '').trim();
  if (!raw) return { ok: false, raw: '' };

  const candidates: string[] = [];
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) candidates.push(fenced[1].trim());
  candidates.push(raw);
  const balanced = extractFirstBalancedObject(raw);
  if (balanced) candidates.push(balanced);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return { ok: true, data: parsed as Record<string, unknown> };
      }
    } catch {
      // try next candidate
    }
  }
  return { ok: false, raw };
}

function extractFirstBalancedObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') inString = !inString;
    if (inString) continue;
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }
  return null;
}

export interface ContentField {
  key: string;
  label: string;
  value: string;
}

/** 把已解析的内容 JSON 转成可逐字段复制的展示结构；未知字段保底展示。 */
export function toContentFields(kind: string, data: Record<string, unknown>): ContentField[] {
  const text = (value: unknown) => (typeof value === 'string' ? value : Array.isArray(value) ? value.join(' ') : '');
  switch (kind) {
    case 'xhs-note':
      return [
        { key: 'title', label: '标题', value: text(data.title) },
        { key: 'body', label: '正文', value: text(data.body) },
        { key: 'hashtags', label: '话题标签', value: Array.isArray(data.hashtags) ? (data.hashtags as unknown[]).map(tag => `#${String(tag).replace(/^#/, '')}`).join(' ') : text(data.hashtags) },
      ].filter(field => field.value);
    case 'review-reply-positive':
    case 'review-reply-negative':
      return [
        { key: 'reply', label: '回复内容', value: text(data.reply) },
        { key: 'usage_note', label: '什么时候用', value: text(data.usage_note) },
        { key: 'risk_note', label: '店长注意', value: text(data.risk_note) },
      ].filter(field => field.value);
    case 'group-message':
      return [
        { key: 'message', label: '群消息', value: text(data.message) },
        { key: 'best_send_time', label: '建议发送时间', value: text(data.best_send_time) },
      ].filter(field => field.value);
    default:
      return Object.entries(data)
        .filter(([, value]) => typeof value === 'string' && value)
        .map(([key, value]) => ({ key, label: key, value: String(value) }));
  }
}

/** 从门店资料里抽出发布前必须核对的具体事实，给店长一份能打勾的清单。 */
export function buildFactChecklist(intake: { offer?: string; visitReason?: string; constraints?: string; dailyLimit?: string; freebie?: string }): string[] {
  const items: string[] = [];
  const priceMatches = `${intake.offer || ''}`.match(/[¥￥]\s?\d+(?:\.\d+)?/g) || [];
  for (const price of priceMatches) items.push(`价格 ${price.replace(/\s/g, '')} 和店里一致`);
  const limitSource = `${intake.dailyLimit || ''} ${intake.constraints || ''}`;
  const limitMatches = limitSource.match(/限量?\s?\d+\s?份|每天限量\s?\d+|\d+\s?份/g) || [];
  const firstLimit = limitMatches[0];
  if (firstLimit) items.push(`限量「${firstLimit.trim()}」还有货`);
  const windowMatches = `${intake.visitReason || ''} ${intake.constraints || ''}`.match(/\d{1,2}[:：]\d{2}\s?[-—至到]\s?\d{1,2}[:：]\d{2}|周[一二三四五六日末]+[^，。；]*/g) || [];
  for (const window of windowMatches.slice(0, 2)) items.push(`时段「${window.trim()}」没写错`);
  if (intake.freebie) items.push(`赠品「${intake.freebie}」今天有准备`);
  items.push('没有出现店里做不到的承诺');
  return items;
}

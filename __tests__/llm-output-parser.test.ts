import { describe, expect, it } from 'vitest';

import { buildFactChecklist, parseLlmJson, toContentFields } from '@/lib/llm-output-parser';

describe('llm output parser', () => {
  it('parses plain json, fenced json and json wrapped in chatter', () => {
    expect(parseLlmJson('{"title":"国贸打工人晚餐救星"}')).toEqual({ ok: true, data: { title: '国贸打工人晚餐救星' } });

    const fenced = parseLlmJson('好的，这是结果：\n```json\n{"title":"标题","body":"正文"}\n```\n希望有帮助');
    expect(fenced.ok).toBe(true);
    if (fenced.ok) expect(fenced.data.body).toBe('正文');

    const chatter = parseLlmJson('以下是我写的内容 {"message":"今天限量40份","best_send_time":"16:30"} 请查收');
    expect(chatter.ok).toBe(true);
    if (chatter.ok) expect(chatter.data.message).toContain('限量40份');
  });

  it('falls back to raw text without throwing on broken output', () => {
    const broken = parseLlmJson('今天的文案是：标题随便起，正文也随便');
    expect(broken.ok).toBe(false);
    if (!broken.ok) expect(broken.raw).toContain('标题随便起');
    expect(parseLlmJson('')).toEqual({ ok: false, raw: '' });
  });

  it('maps parsed json into copyable labeled fields per content kind', () => {
    const xhs = toContentFields('xhs-note', { title: '标题', body: '正文', hashtags: ['国贸美食', '#工作日晚餐'] });
    expect(xhs.map(field => field.label)).toEqual(['标题', '正文', '话题标签']);
    expect(xhs[2].value).toBe('#国贸美食 #工作日晚餐');

    const reply = toContentFields('review-reply-negative', { reply: '抱歉让您等了', risk_note: '' });
    expect(reply).toHaveLength(1);
    expect(reply[0].label).toBe('回复内容');

    const unknown = toContentFields('mystery', { foo: 'bar', count: 3 });
    expect(unknown).toEqual([{ key: 'foo', label: 'foo', value: 'bar' }]);
  });

  it('builds a fact checklist from concrete intake numbers', () => {
    const checklist = buildFactChecklist({
      offer: '藤椒鸡丝拌面双人套餐 ¥59.9',
      visitReason: '工作日 17:30-20:00 到店免排队',
      constraints: '周末不适用；每天限量 40 份',
      freebie: '两杯酸梅汤',
    });
    expect(checklist.some(item => item.includes('¥59.9'))).toBe(true);
    expect(checklist.some(item => item.includes('40'))).toBe(true);
    expect(checklist.some(item => item.includes('17:30-20:00') || item.includes('周末'))).toBe(true);
    expect(checklist.some(item => item.includes('酸梅汤'))).toBe(true);
    expect(checklist[checklist.length - 1]).toContain('做不到的承诺');
  });
});

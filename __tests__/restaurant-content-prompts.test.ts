import { describe, expect, it } from 'vitest';

import { buildAllContentPrompts, buildGroupMessagePrompt, buildReviewReplyPrompt, buildXhsNotePrompt } from '@/lib/restaurant-content-prompts';

const intake = {
  restaurant: '椒香记·川味面馆（国贸店）',
  offer: '藤椒鸡丝拌面双人套餐 ¥59.9',
  audience: '附近三公里写字楼晚餐白领',
  visitReason: '工作日 17:30-20:00 到店免排队',
  constraints: '周末不适用；每桌限用一张券；辣度固定不可调',
  dailyLimit: '40 份',
  freebie: '两杯酸梅汤',
};

describe('restaurant content prompts', () => {
  it('builds four publishable prompt kinds with shared safety rules', () => {
    const prompts = buildAllContentPrompts(intake);
    expect(prompts.map(prompt => prompt.kind)).toEqual([
      'xhs-note',
      'review-reply-positive',
      'review-reply-negative',
      'group-message',
    ]);
    for (const prompt of prompts) {
      expect(prompt.system).toContain('只许使用输入资料里明确给出的事实');
      expect(prompt.system).toContain('禁用广告法风险词');
      expect(prompt.system).toContain('不承诺爆单');
      expect(prompt.user).toContain('椒香记');
      expect(prompt.user).toContain('藤椒鸡丝拌面双人套餐 ¥59.9');
      expect(prompt.outputSchema).toContain('{');
    }
  });

  it('keeps merchant constraints inside every prompt so the model cannot ignore boundaries', () => {
    const xhs = buildXhsNotePrompt(intake);
    const reply = buildReviewReplyPrompt(intake, 'negative');
    const group = buildGroupMessagePrompt(intake);
    for (const prompt of [xhs, reply, group]) {
      expect(prompt.user).toContain('周末不适用');
      expect(prompt.user).toContain('每桌限用一张券');
    }
    expect(group.user).toContain('40 份');
  });

  it('omits optional lines instead of inventing placeholder facts', () => {
    const minimal = buildXhsNotePrompt({ restaurant: '小店', offer: '招牌面' });
    expect(minimal.user).toContain('资料里有才写');
    expect(minimal.user).not.toContain('今日限量');
    expect(minimal.user).not.toContain('undefined');
  });
});

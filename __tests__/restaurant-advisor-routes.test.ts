import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it } from 'vitest';

import { POST as chatPost } from '@/app/api/restaurant-agent/chat/route';
import { POST as reviewReplyPost } from '@/app/api/restaurant-agent/review-reply/route';
import { POST as memoryPost } from '@/app/api/restaurant-agent/memory/route';
import { POST as contentPost } from '@/app/api/restaurant-agent/content/route';
import { GET as llmHealthGet } from '@/app/api/restaurant-agent/llm-health/route';
import { buildRevisionUserPrompt } from '@/lib/restaurant-advisor-prompts';

const originalKey = process.env.DEEPSEEK_API_KEY;

afterEach(() => {
  if (originalKey === undefined) {
    delete process.env.DEEPSEEK_API_KEY;
  } else {
    process.env.DEEPSEEK_API_KEY = originalKey;
  }
});

function jsonRequest(path: string, body: unknown) {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const intake = {
  restaurant: '椒香记·川味面馆（国贸店）',
  offer: '藤椒鸡丝拌面双人套餐 ¥59.9',
  visitReason: '工作日 17:30-20:00 到店免排队',
  constraints: '周末不适用；每桌限用一张券',
};

describe('restaurant advisor routes (no-key mode)', () => {
  it('chat returns a rendered advisor prompt with store facts, proofs and guardrails', async () => {
    delete process.env.DEEPSEEK_API_KEY;
    const response = await chatPost(jsonRequest('/api/restaurant-agent/chat', {
      intake,
      question: '周三晚上没人来怎么办？',
      proofs: [{ channel: '小红书', note: '已发探店笔记' }],
    }));
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.mode).toBe('prompt-preview');
    expect(payload.prompt.system).toContain('椒香记');
    expect(payload.prompt.system).toContain('周末不适用');
    expect(payload.prompt.system).toContain('已回填凭证');
    expect(payload.prompt.system).toContain('动作 + 负责人');
    expect(payload.prompt.system).toContain('不承诺爆单');
    expect(payload.prompt.user).toContain('周三晚上');
  });

  it('chat rejects requests without a question', async () => {
    const response = await chatPost(jsonRequest('/api/restaurant-agent/chat', { intake }));
    expect(response.status).toBe(400);
  });

  it('review-reply embeds the raw customer review and empathy rules', async () => {
    delete process.env.DEEPSEEK_API_KEY;
    const response = await reviewReplyPost(jsonRequest('/api/restaurant-agent/review-reply', {
      intake,
      reviewText: '等位四十分钟，面都坨了，服务员态度还行。',
      sentiment: 'negative',
    }));
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.mode).toBe('prompt-preview');
    expect(payload.prompt.user).toContain('等位四十分钟');
    expect(payload.prompt.user).toContain('不辩解不甩锅');
    expect(payload.prompt.system).toContain('店主');
  });

  it('memory route blocks PII and accepts operating notes', async () => {
    const blocked = await memoryPost(jsonRequest('/api/restaurant-agent/memory', {
      restaurant: '椒香记·川味面馆（国贸店）',
      kind: 'channel-feedback',
      note: '加微信 wxid_abc123 联系顾客',
    }));
    expect(blocked.status).toBe(400);
    const blockedPayload = await blocked.json();
    expect(blockedPayload.error).toBe('pii-blocked');

    const accepted = await memoryPost(jsonRequest('/api/restaurant-agent/memory', {
      restaurant: '椒香记·川味面馆（国贸店）',
      kind: 'revision-preference',
      note: '文案要口语，不要文艺腔',
    }));
    const acceptedPayload = await accepted.json();
    expect(acceptedPayload.ok).toBe(true);

    const listed = await memoryPost(jsonRequest('/api/restaurant-agent/memory', {
      action: 'list',
      restaurant: '椒香记·川味面馆（国贸店）',
    }));
    const listedPayload = await listed.json();
    expect(listedPayload.entries.some((entry: { note: string }) => entry.note.includes('口语'))).toBe(true);
  });

  it('content revision regenerates only the requested kind with prior output and feedback', async () => {
    delete process.env.DEEPSEEK_API_KEY;
    const response = await contentPost(jsonRequest('/api/restaurant-agent/content', {
      intake,
      revision: {
        kind: 'xhs-note',
        previousOutput: '{"title":"国贸打工人快冲","body":"..."}',
        feedback: '太文艺了，口语一点',
      },
    }));
    const payload = await response.json();
    expect(payload.ok).toBe(true);
    expect(payload.prompts).toHaveLength(1);
    expect(payload.prompts[0].kind).toBe('xhs-note');
    expect(payload.prompts[0].user).toContain('太文艺了');
    expect(payload.prompts[0].user).toContain('国贸打工人快冲');
    expect(payload.prompts[0].user).toContain('直接给新版');
  });

  it('revision prompt keeps original constraints and instructs no meta commentary', () => {
    const prompt = buildRevisionUserPrompt('上一版文案', '别用感叹号', '原始要求：标题不超过 20 字');
    expect(prompt).toContain('上一版文案');
    expect(prompt).toContain('别用感叹号');
    expect(prompt).toContain('标题不超过 20 字');
    expect(prompt).toContain('不解释修改过程');
  });

  it('llm health reports no-key with setup instructions', async () => {
    delete process.env.DEEPSEEK_API_KEY;
    const response = await llmHealthGet();
    const payload = await response.json();
    expect(payload.ok).toBe(false);
    expect(payload.status).toBe('no-key');
    expect(payload.message).toContain('DEEPSEEK_API_KEY');
  });
});

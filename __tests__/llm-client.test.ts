import { afterEach, describe, expect, it } from 'vitest';

import { hasLlmKey, llmChat, LlmError } from '@/lib/llm-client';

const originalKey = process.env.DEEPSEEK_API_KEY;

afterEach(() => {
  if (originalKey === undefined) {
    delete process.env.DEEPSEEK_API_KEY;
  } else {
    process.env.DEEPSEEK_API_KEY = originalKey;
  }
});

describe('llm client', () => {
  it('reports no key and returns the rendered prompt instead of throwing', async () => {
    delete process.env.DEEPSEEK_API_KEY;
    expect(hasLlmKey()).toBe(false);
    const result = await llmChat({
      system: '你是门店顾问。',
      user: '周三晚上没人来怎么办？',
      history: [{ role: 'user', content: '我们是面馆' }],
    });
    expect(result.mode).toBe('no-key');
    if (result.mode === 'no-key') {
      expect(result.renderedPrompt.system).toBe('你是门店顾问。');
      expect(result.renderedPrompt.user).toContain('周三晚上');
      expect(result.renderedPrompt.history).toHaveLength(1);
    }
  });

  it('classifies llm errors with a stable kind field', () => {
    const error = new LlmError('http-5xx', 'deepseek http 502');
    expect(error.kind).toBe('http-5xx');
    expect(error.name).toBe('LlmError');
  });
});

export interface LlmChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LlmChatRequest {
  system: string;
  user: string;
  history?: LlmChatMessage[];
  temperature?: number;
  maxTokens?: number;
}

export interface LlmRenderedPrompt {
  system: string;
  user: string;
  history: LlmChatMessage[];
}

export type LlmChatResult =
  | { mode: 'generated'; output: string }
  | { mode: 'no-key'; renderedPrompt: LlmRenderedPrompt };

export type LlmErrorKind = 'timeout' | 'http-4xx' | 'http-5xx' | 'network' | 'empty-response';

export class LlmError extends Error {
  kind: LlmErrorKind;

  constructor(kind: LlmErrorKind, message: string) {
    super(message);
    this.kind = kind;
    this.name = 'LlmError';
  }
}

const DEEPSEEK_ENDPOINT = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';
const REQUEST_TIMEOUT_MS = 30_000;

export function hasLlmKey(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}

function classifyHttp(status: number): LlmErrorKind {
  return status >= 500 ? 'http-5xx' : 'http-4xx';
}

async function callOnce(request: LlmChatRequest, apiKey: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(DEEPSEEK_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: request.system },
          ...(request.history || []),
          { role: 'user', content: request.user },
        ],
        temperature: request.temperature ?? 0.8,
        max_tokens: request.maxTokens ?? 900,
      }),
    });
    if (!response.ok) {
      throw new LlmError(classifyHttp(response.status), `deepseek http ${response.status}`);
    }
    const payload = await response.json();
    const text: string = payload?.choices?.[0]?.message?.content || '';
    if (!text.trim()) {
      throw new LlmError('empty-response', 'deepseek returned empty content');
    }
    return text;
  } catch (error) {
    if (error instanceof LlmError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new LlmError('timeout', `deepseek timed out after ${REQUEST_TIMEOUT_MS}ms`);
    }
    throw new LlmError('network', error instanceof Error ? error.message : 'unknown network failure');
  } finally {
    clearTimeout(timer);
  }
}

const RETRYABLE: LlmErrorKind[] = ['timeout', 'http-5xx', 'network', 'empty-response'];

export async function llmChat(request: LlmChatRequest): Promise<LlmChatResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return {
      mode: 'no-key',
      renderedPrompt: {
        system: request.system,
        user: request.user,
        history: request.history || [],
      },
    };
  }
  try {
    return { mode: 'generated', output: await callOnce(request, apiKey) };
  } catch (error) {
    if (error instanceof LlmError && RETRYABLE.includes(error.kind)) {
      return { mode: 'generated', output: await callOnce(request, apiKey) };
    }
    throw error;
  }
}

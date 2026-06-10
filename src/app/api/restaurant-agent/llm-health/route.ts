import { NextResponse } from 'next/server';
import { hasLlmKey, llmChat, LlmError } from '@/lib/llm-client';

export async function GET() {
  if (!hasLlmKey()) {
    return NextResponse.json({
      ok: false,
      status: 'no-key',
      message: '没有检测到 DEEPSEEK_API_KEY。在 .env.local 加一行 DEEPSEEK_API_KEY=sk-... 然后重启 dev server。',
    });
  }
  try {
    const result = await llmChat({
      system: '你是连通性检查器。',
      user: '只回复两个字：正常',
      temperature: 0,
      maxTokens: 8,
    });
    if (result.mode === 'generated') {
      return NextResponse.json({
        ok: true,
        status: 'ready',
        message: 'AI 账号连通正常，内容生成、顾问对话和评价回复都已切换为成品模式。',
        sample: result.output.slice(0, 20),
      });
    }
    return NextResponse.json({ ok: false, status: 'unexpected', message: '客户端状态异常，重启 dev server 再试。' });
  } catch (error) {
    const kind = error instanceof LlmError ? error.kind : 'unknown';
    const hints: Record<string, string> = {
      'http-4xx': 'key 无效或没有余额，去 DeepSeek 控制台确认 key 和账户余额。',
      'http-5xx': 'DeepSeek 服务端故障，稍等几分钟再试。',
      timeout: '请求超时，检查本机网络或代理设置。',
      network: '网络不通，检查代理或防火墙。',
      'empty-response': '连通但返回为空，重试一次。',
      unknown: '未知错误，看终端日志。',
    };
    return NextResponse.json({ ok: false, status: `error-${kind}`, message: hints[kind] || hints.unknown });
  }
}

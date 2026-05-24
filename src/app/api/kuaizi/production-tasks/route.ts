import { NextRequest, NextResponse } from 'next/server';
import { createKuaiziTask, sanitizeKuaiziError } from '@/lib/kuaizi-server';

const REQUIRED_FIELDS = ['projectId', 'runId', 'title', 'hook', 'sourceBriefMarkdown'] as const;

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }

  const missing = REQUIRED_FIELDS.filter(field => typeof body[field] !== 'string' || !String(body[field]).trim());
  if (missing.length > 0) {
    return NextResponse.json({ error: `缺少生产任务字段: ${missing.join(', ')}` }, { status: 400 });
  }

  try {
    const task = await createKuaiziTask({
      projectId: String(body.projectId),
      runId: String(body.runId),
      title: String(body.title),
      hook: String(body.hook),
      angle: String(body.angle || ''),
      offer: String(body.offer || ''),
      cta: String(body.cta || ''),
      format: String(body.format || ''),
      sourceBriefMarkdown: String(body.sourceBriefMarkdown),
    });
    return NextResponse.json(task);
  } catch (error) {
    const message = sanitizeKuaiziError(error);
    const status = message.includes('未配置') ? 503 : 502;
    return NextResponse.json({ error: message, code: 'KUAIZI_TASK_CREATE_FAILED' }, { status });
  }
}

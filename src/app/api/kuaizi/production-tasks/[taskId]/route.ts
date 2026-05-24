import { NextRequest, NextResponse } from 'next/server';
import { getKuaiziTask, sanitizeKuaiziError } from '@/lib/kuaizi-server';

export async function GET(_request: NextRequest, context: { params: Promise<{ taskId: string }> }) {
  const { taskId } = await context.params;
  if (!taskId?.trim()) {
    return NextResponse.json({ error: '缺少任务 ID' }, { status: 400 });
  }

  try {
    const task = await getKuaiziTask(taskId);
    return NextResponse.json(task);
  } catch (error) {
    const message = sanitizeKuaiziError(error);
    const status = message.includes('未配置') ? 503 : 502;
    return NextResponse.json({ error: message, code: 'KUAIZI_TASK_POLL_FAILED' }, { status });
  }
}

import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * 阿里通义万相 wanx 文生图通用封装（从电商 image-gen 链路提取）。
 * 复用 AI_API_KEY（DashScope），中文 prompt 原生支持。
 */

const WANX_SUBMIT_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis';
const WANX_TASK_URL = 'https://dashscope.aliyuncs.com/api/v1/tasks';
const WANX_MODEL = process.env.WANX_MODEL || 'wanx2.1-t2i-turbo';
const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 45_000;

export function hasWanxKey(): boolean {
  return Boolean(process.env.AI_API_KEY) && process.env.WANX_DISABLED !== '1';
}

export type WanxImageResult =
  | { ok: true; url: string }
  | { ok: false; error: string };

const PERSIST_DIR = join('public', 'generated-posters');

/**
 * wanx 返回的 OSS 链接 24 小时过期——百人模拟里高价值用户的第一抱怨。
 * 这里把图下载落盘到 public/generated-posters/，返回站内永久路径。
 * 注意：单机/自部署有效；上 Vercel 等只读文件系统时需换对象存储（届时改这一个函数即可）。
 */
export async function persistWanxImage(remoteUrl: string): Promise<string | null> {
  try {
    const response = await fetch(remoteUrl);
    if (!response.ok) return null;
    const buffer = Buffer.from(await response.arrayBuffer());
    if (buffer.length < 1024) return null;
    const hash = createHash('sha1').update(buffer).digest('hex').slice(0, 16);
    const fileName = `poster-${hash}.png`;
    mkdirSync(PERSIST_DIR, { recursive: true });
    writeFileSync(join(PERSIST_DIR, fileName), buffer);
    return `/generated-posters/${fileName}`;
  } catch {
    return null;
  }
}

export async function generateWanxImage(prompt: string, size = '1024*1024'): Promise<WanxImageResult> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return { ok: false, error: 'no-key' };

  const submitRes = await fetch(WANX_SUBMIT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify({
      model: WANX_MODEL,
      input: { prompt: prompt.slice(0, 760) },
      parameters: { size, n: 1 },
    }),
  });
  if (!submitRes.ok) {
    const errText = await submitRes.text();
    return { ok: false, error: `wanx-submit-${submitRes.status}: ${errText.slice(0, 120)}` };
  }
  const submitData = await submitRes.json();
  const taskId: string | undefined = submitData?.output?.task_id;
  if (!taskId) return { ok: false, error: 'wanx-no-task-id' };

  const start = Date.now();
  while (Date.now() - start < POLL_TIMEOUT_MS) {
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL_MS));
    const pollRes = await fetch(`${WANX_TASK_URL}/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!pollRes.ok) continue;
    const data = await pollRes.json();
    const status = data?.output?.task_status;
    if (status === 'SUCCEEDED') {
      const url: string | undefined = data?.output?.results?.[0]?.url;
      return url ? { ok: true, url } : { ok: false, error: 'wanx-no-url' };
    }
    if (status === 'FAILED') {
      return { ok: false, error: `wanx-failed: ${String(data?.output?.message || '').slice(0, 120)}` };
    }
  }
  return { ok: false, error: 'wanx-timeout' };
}

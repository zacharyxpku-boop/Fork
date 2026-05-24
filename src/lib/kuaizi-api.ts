'use client';

import { track } from '@/lib/local-analytics';
import {
  KUAIZI_ENDPOINTS,
  kuaiziErrorMessage,
  maskKuaiziApiKey,
  type KuaiziBriefPayload,
  type KuaiziConnectionResult,
  type KuaiziEndpoint,
  type KuaiziProductionTask,
  type KuaiziTaskStatus,
} from '@/lib/kuaizi-shared';

export type {
  KuaiziBriefPayload,
  KuaiziConnectionResult,
  KuaiziEndpoint,
  KuaiziProductionTask,
  KuaiziTaskStatus,
};

export interface KuaiziConfigInput {
  apiKey?: string;
  endpoint?: KuaiziEndpoint;
}

export interface KuaiziConfig {
  endpoint: KuaiziEndpoint;
  baseUrl: string;
  maskedApiKey: string;
  savedAt: string;
  serverManaged: true;
}

export interface KuaiziApiErrorDetail {
  status?: number;
  operation: 'health' | 'create_job' | 'poll_job';
  message: string;
}

function recordKuaiziError(detail: KuaiziApiErrorDetail) {
  track('kuaizi_error', detail as unknown as Record<string, unknown>);
}

async function readJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data === 'object' && data && 'error' in data
      ? String((data as { error?: unknown }).error)
      : `HTTP ${response.status}`;
    throw new Error(message);
  }
  return data as T;
}

export async function loadKuaiziConfig(): Promise<KuaiziConfig | null> {
  const result = await testKuaiziConnection({ dryRun: true });
  if (!result.configured || !result.endpoint || !result.baseUrl) return null;
  return {
    endpoint: result.endpoint,
    baseUrl: result.baseUrl,
    maskedApiKey: result.maskedApiKey || 'server-managed',
    savedAt: new Date().toISOString(),
    serverManaged: true,
  };
}

export function getKuaiziConfig(): KuaiziConfig | null {
  return null;
}

export function hasKuaiziConfig() {
  return false;
}

export function saveKuaiziConfig(input: KuaiziConfigInput) {
  void input;
  // Kuaizi keys are server-managed. The browser never stores third-party API keys.
}

export function clearKuaiziConfig() {
  // No browser-side Kuaizi credential exists to clear.
}

export async function testKuaiziConnection(options: { dryRun?: boolean } = {}): Promise<KuaiziConnectionResult> {
  try {
    const suffix = options.dryRun ? '?dryRun=1' : '';
    const response = await fetch(`/api/kuaizi/health${suffix}`, { method: 'GET' });
    return await readJson<KuaiziConnectionResult>(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : '连接失败，请检查服务端配置或网络状态';
    recordKuaiziError({ operation: 'health', message });
    return { ok: false, configured: false, message };
  }
}

export async function createKuaiziProductionTask(payload: KuaiziBriefPayload): Promise<KuaiziProductionTask> {
  try {
    const response = await fetch('/api/kuaizi/production-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await readJson<KuaiziProductionTask>(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : '筷子科技任务创建失败，请稍后重试，或导出生产规格手动执行';
    recordKuaiziError({ operation: 'create_job', message });
    throw new Error(message);
  }
}

export async function getKuaiziTaskStatus(taskId: string): Promise<KuaiziProductionTask> {
  try {
    const response = await fetch(`/api/kuaizi/production-tasks/${encodeURIComponent(taskId)}`, {
      method: 'GET',
    });
    return await readJson<KuaiziProductionTask>(response);
  } catch (error) {
    const message = error instanceof Error ? error.message : '任务状态查询失败';
    recordKuaiziError({ operation: 'poll_job', message });
    throw new Error(message);
  }
}

export { KUAIZI_ENDPOINTS as ENDPOINTS, kuaiziErrorMessage, maskKuaiziApiKey };

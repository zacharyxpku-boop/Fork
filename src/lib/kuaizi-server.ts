import type {
  KuaiziBriefPayload,
  KuaiziConnectionResult,
  KuaiziEndpoint,
  KuaiziProductionTask,
  KuaiziTaskStatus,
} from '@/lib/kuaizi-shared';
import { KUAIZI_ENDPOINTS, kuaiziErrorMessage, maskKuaiziApiKey } from '@/lib/kuaizi-shared';

interface KuaiziServerConfig {
  apiKey: string;
  endpoint: KuaiziEndpoint;
  baseUrl: string;
  maskedApiKey: string;
}

interface KuaiziProviderTask {
  taskId?: string;
  id?: string;
  status?: KuaiziTaskStatus;
  assetUrls?: string[];
  assets?: Array<{ url?: string }>;
}

const REQUEST_TIMEOUT_MS = 10000;

export function getKuaiziServerConfig(env: NodeJS.ProcessEnv = process.env): KuaiziServerConfig | null {
  const apiKey = env.KUAIZI_API_KEY?.trim();
  if (!apiKey) return null;
  const endpoint = env.KUAIZI_ENDPOINT === 'production' ? 'production' : 'sandbox';
  const baseUrl = env.KUAIZI_BASE_URL?.trim() || KUAIZI_ENDPOINTS[endpoint];
  return {
    apiKey,
    endpoint,
    baseUrl,
    maskedApiKey: maskKuaiziApiKey(apiKey),
  };
}

export function sanitizeKuaiziError(input: unknown, config?: KuaiziServerConfig | null): string {
  let text = input instanceof Error ? input.message : String(input || '');
  const apiKey = config?.apiKey;
  if (apiKey) text = text.split(apiKey).join('[redacted-key]');
  text = text
    .replace(/Bearer\s+[A-Za-z0-9._-]+/g, 'Bearer [redacted-key]')
    .replace(/sk-[A-Za-z0-9._-]+/g, '[redacted-key]')
    .replace(/api[_-]?key=([A-Za-z0-9._-]+)/gi, 'apiKey=[redacted-key]')
    .slice(0, 300);
  return text || '筷子科技服务异常';
}

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeProviderTask(data: KuaiziProviderTask, fallbackTaskId = ''): KuaiziProductionTask {
  const taskId = data.taskId || data.id || fallbackTaskId;
  if (!taskId) throw new Error('筷子科技未返回任务 ID');
  return {
    taskId,
    status: data.status || 'queued',
    assetUrls: data.assetUrls || data.assets?.map(asset => asset.url || '').filter(Boolean) || [],
    providerRaw: data,
  };
}

export async function checkKuaiziHealth(options: { dryRun?: boolean } = {}): Promise<KuaiziConnectionResult> {
  const config = getKuaiziServerConfig();
  if (!config) {
    return {
      ok: false,
      configured: false,
      message: '服务端未配置筷子科技连接。可继续导出生产规格手动执行。',
    };
  }

  if (options.dryRun) {
    return {
      ok: true,
      configured: true,
      message: '服务端已配置筷子科技连接，本次只做本地配置检查，未发起外部请求。',
      endpoint: config.endpoint,
      baseUrl: config.baseUrl,
      maskedApiKey: config.maskedApiKey,
    };
  }

  try {
    const response = await fetchWithTimeout(`${config.baseUrl}/health`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      return {
        ok: false,
        configured: true,
        status: response.status,
        message: kuaiziErrorMessage(response.status),
        endpoint: config.endpoint,
        baseUrl: config.baseUrl,
        maskedApiKey: config.maskedApiKey,
      };
    }
    return {
      ok: true,
      configured: true,
      status: response.status,
      message: '连接成功',
      endpoint: config.endpoint,
      baseUrl: config.baseUrl,
      maskedApiKey: config.maskedApiKey,
    };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      message: sanitizeKuaiziError(error, config),
      endpoint: config.endpoint,
      baseUrl: config.baseUrl,
      maskedApiKey: config.maskedApiKey,
    };
  }
}

export async function createKuaiziTask(payload: KuaiziBriefPayload): Promise<KuaiziProductionTask> {
  const config = getKuaiziServerConfig();
  if (!config) throw new Error('服务端未配置筷子科技连接。请导出生产规格手动执行。');

  const response = await fetchWithTimeout(`${config.baseUrl}/production-tasks`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      externalProjectId: payload.projectId,
      externalRunId: payload.runId,
      source: 'wenai-listing-factory',
      creativeBrief: {
        title: payload.title,
        hook: payload.hook,
        angle: payload.angle,
        offer: payload.offer,
        cta: payload.cta,
        format: payload.format,
        markdown: payload.sourceBriefMarkdown,
      },
    }),
  });

  if (!response.ok) throw new Error(kuaiziErrorMessage(response.status));
  const data = await response.json() as KuaiziProviderTask;
  return normalizeProviderTask(data);
}

export async function getKuaiziTask(taskId: string): Promise<KuaiziProductionTask> {
  const config = getKuaiziServerConfig();
  if (!config) throw new Error('服务端未配置筷子科技连接。请导出生产规格手动执行。');

  const response = await fetchWithTimeout(`${config.baseUrl}/production-tasks/${encodeURIComponent(taskId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) throw new Error(kuaiziErrorMessage(response.status));
  const data = await response.json() as KuaiziProviderTask;
  return normalizeProviderTask(data, taskId);
}

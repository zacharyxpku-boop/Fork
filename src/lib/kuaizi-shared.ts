export type KuaiziEndpoint = 'production' | 'sandbox';
export type KuaiziTaskStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface KuaiziBriefPayload {
  projectId: string;
  runId: string;
  title: string;
  hook: string;
  angle: string;
  offer: string;
  cta: string;
  format: string;
  sourceBriefMarkdown: string;
}

export interface KuaiziProductionTask {
  taskId: string;
  status: KuaiziTaskStatus;
  assetUrls: string[];
  providerRaw?: unknown;
}

export interface KuaiziConnectionResult {
  ok: boolean;
  message: string;
  status?: number;
  configured?: boolean;
  endpoint?: KuaiziEndpoint;
  baseUrl?: string;
  maskedApiKey?: string;
}

export const KUAIZI_ENDPOINTS: Record<KuaiziEndpoint, string> = {
  production: 'https://openapi.kuaizi.ai/v1',
  sandbox: 'https://sandbox.openapi.kuaizi.ai/v1',
};

export function maskKuaiziApiKey(apiKey: string) {
  if (!apiKey) return '';
  if (apiKey.length <= 8) return `${apiKey.slice(0, 2)}****`;
  return `${apiKey.slice(0, 4)}****${apiKey.slice(-4)}`;
}

export function kuaiziErrorMessage(status: number) {
  if (status === 401 || status === 403) return '筷子科技服务认证失败，请检查服务端配置';
  if (status === 408) return '连接超时，请检查网络或稍后重试';
  if (status === 402 || status === 429) return '筷子科技账户额度不足，请联系商务处理';
  if (status >= 500) return '筷子科技服务异常，请稍后重试，或导出生产规格手动执行';
  return '筷子科技任务创建失败，请稍后重试，或导出生产规格手动执行';
}

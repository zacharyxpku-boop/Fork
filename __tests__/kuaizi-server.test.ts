import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  checkKuaiziHealth,
  createKuaiziTask,
  getKuaiziServerConfig,
  sanitizeKuaiziError,
} from '@/lib/kuaizi-server';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

const payload = {
  projectId: 'project-1',
  runId: 'run-1',
  title: '10 SKU content production brief',
  hook: '先看这批 SKU 的真实内容证据。',
  angle: 'benchmark-to-campaign',
  offer: 'POC acceptance pack',
  cta: '进入复盘',
  format: 'short_video',
  sourceBriefMarkdown: '## Brief\n- evidence\n- asset manifest',
};

describe('kuaizi server proxy', () => {
  it('reports unconfigured without exposing browser-side key storage', async () => {
    vi.stubEnv('KUAIZI_API_KEY', '');

    expect(getKuaiziServerConfig()).toBeNull();
    await expect(checkKuaiziHealth({ dryRun: true })).resolves.toMatchObject({
      ok: false,
      configured: false,
      message: '服务端未配置筷子科技连接。可继续导出生产规格手动执行。',
    });
  });

  it('uses server-side env and masks the configured key', () => {
    vi.stubEnv('KUAIZI_API_KEY', 'kz_live_secret_123456');
    vi.stubEnv('KUAIZI_ENDPOINT', 'production');

    const config = getKuaiziServerConfig();

    expect(config?.endpoint).toBe('production');
    expect(config?.baseUrl).toContain('openapi.kuaizi.ai');
    expect(config?.maskedApiKey).not.toContain('secret');
  });

  it('creates production tasks through the server proxy', async () => {
    vi.stubEnv('KUAIZI_API_KEY', 'kz_live_secret_123456');
    vi.stubEnv('KUAIZI_BASE_URL', 'https://kuaizi.example.test/v1');
    const fetchSpy = vi.fn(async () => ({
      ok: true,
      json: async () => ({ taskId: 'task-123', status: 'queued', assetUrls: [] }),
    })) as unknown as typeof fetch;
    vi.stubGlobal('fetch', fetchSpy);

    const task = await createKuaiziTask(payload);

    expect(task.taskId).toBe('task-123');
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://kuaizi.example.test/v1/production-tasks',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer kz_live_secret_123456' }),
      }),
    );
  });

  it('redacts provider secrets from errors', () => {
    const message = sanitizeKuaiziError(
      new Error('upstream failed Bearer kz_live_secret_123456 apiKey=sk-live-hidden'),
      {
        apiKey: 'kz_live_secret_123456',
        endpoint: 'sandbox',
        baseUrl: 'https://sandbox.openapi.kuaizi.ai/v1',
        maskedApiKey: 'kz_l****3456',
      },
    );

    expect(message).not.toContain('kz_live_secret_123456');
    expect(message).not.toContain('sk-live-hidden');
    expect(message).toContain('[redacted-key]');
  });
});

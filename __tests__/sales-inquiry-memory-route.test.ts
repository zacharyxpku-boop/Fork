import { afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, PATCH, POST } from '@/app/api/sales/inquiry/route';

afterEach(() => {
  vi.unstubAllEnvs();
});

function req(url: string, init?: ConstructorParameters<typeof NextRequest>[1]) {
  return new NextRequest(url, init);
}

describe('sales inquiry memory fallback', () => {
  it('keeps the POC inquiry loop usable without Redis', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    vi.stubEnv('ADMIN_KEY', '');
    const company = `本地试用客户 ${Date.now()}`;

    const created = await POST(req('https://wenai.test/api/sales/inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': `127.0.0.${Math.floor(Math.random() * 200) + 1}` },
      body: JSON.stringify({
        company,
        contact: 'buyer@example.com',
        channel: 'email',
        scale: '50-200',
        category: 'home',
        skuCount: '10',
        platforms: 'Shopify + TikTok Shop',
        assetsReady: 'partial',
        painPoint: '需要先验证 10 个真实 SKU 的上新物料和内容测试包。',
      }),
    }));
    const createdJson = await created.json();
    expect(created.status).toBe(200);
    expect(createdJson.id).toMatch(/^inq_/);

    const listed = await GET(req('https://wenai.test/api/sales/inquiry'));
    const listedJson = await listed.json();
    const row = listedJson.inquiries.find((item: { id: string }) => item.id === createdJson.id);

    expect(row.company).toBe(company);
    expect(row.contractReadiness).toMatch(/^\d+$/);
    expect(listedJson.notice).toContain('本地试用模式');

    const patched = await PATCH(req('https://wenai.test/api/sales/inquiry', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: createdJson.id,
        status: 'reviewed',
        reviewDecision: 'push_contract',
        contractNextStep: '约合同评审',
      }),
    }));
    expect(patched.status).toBe(200);

    const relisted = await GET(req('https://wenai.test/api/sales/inquiry'));
    const relistedJson = await relisted.json();
    const updated = relistedJson.inquiries.find((item: { id: string }) => item.id === createdJson.id);

    expect(updated.status).toBe('reviewed');
    expect(updated.reviewDecision).toBe('push_contract');
    expect(updated.activityLog).toContain('已复盘');
  });
});

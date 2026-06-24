import { expect, test } from '@playwright/test';

test.describe('restaurant friend trial first screen', () => {
  test('shows the owner what to do today before external gates are unlocked', async ({ page }) => {
    await page.goto('/factory?variant=friend_trial');

    await expect(page).toHaveURL(/\/factory\?variant=friend_trial$/);
    await expect(page.getByRole('heading', { name: /今天该做哪件事/ })).toBeVisible();
    await expect(page.locator('input[name="restaurant"]').first()).toHaveValue('南城川味小馆');
    await expect(page.locator('input[name="offer"]').first()).toHaveValue('双人酸菜鱼套餐');
    await expect(page.locator('input[name="audience"]').first()).toHaveValue('附近 3 公里晚餐双人客');
    await expect(page.getByRole('link', { name: '生成今日门店工单' }).first()).toBeVisible();

    const body = page.locator('body');
    await expect(body).toContainText('当前内部可完成');
    await expect(body).toContainText('账号 / 授权 / 数据条件');
    await expect(body).toContainText('平台账号/商户授权未确认前，不自动发布、不读取后台、不联系顾客');
    await expect(body).toContainText('任务、负责人、证据、状态和下一步');

    await expect(body).not.toContainText('Provider');
    await expect(body).not.toContainText('API key');
    await expect(body).not.toContainText('review token');
    await expect(body).not.toContainText('RBAC');
    await expect(body).not.toContainText('DLP');
    await expect(body).not.toContainText('fail-closed');

    const ctaBox = await page.getByRole('link', { name: '生成今日门店工单' }).first().boundingBox();
    expect(ctaBox?.y ?? 9999).toBeLessThan(760);
    await expect(page.getByRole('main').first()).toBeVisible();
  });

  test('keeps the mobile first viewport usable without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/factory?variant=friend_trial');

    await expect(page.getByRole('heading', { name: /今天该做哪件事/ })).toBeVisible();
    await expect(page.locator('input[name="restaurant"]').first()).toBeVisible();
    await expect(page.getByRole('link', { name: '生成今日门店工单' }).first()).toBeVisible();

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  });
});

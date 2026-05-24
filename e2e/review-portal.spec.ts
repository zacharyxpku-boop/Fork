import { expect, test } from '@playwright/test';

test.describe('client review portal public access', () => {
  test('opens a missing review token without redirecting to login', async ({ page }) => {
    await page.goto('/review/wrv_missing_browser_smoke');

    await expect(page).toHaveURL(/\/review\/wrv_missing_browser_smoke$/);
    await expect(page.locator('body')).toContainText('没有找到这条审核链接');
    await expect(page.locator('body')).toContainText('确认链接');
    await expect(page.locator('body')).toContainText('联系运营');
    await expect(page.locator('body')).not.toContainText('登录');
  });

  test('keeps the no-login review shell usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/review/wrv_missing_mobile_smoke');

    await expect(page).toHaveURL(/\/review\/wrv_missing_mobile_smoke$/);
    await expect(page.locator('body')).toContainText('没有找到这条审核链接');

    const overflow = await page.evaluate(() => {
      const documentElement = document.documentElement;
      return documentElement.scrollWidth - documentElement.clientWidth;
    });
    expect(overflow).toBeLessThanOrEqual(2);
  });
});

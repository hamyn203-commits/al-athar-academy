import { test, expect } from '@playwright/test';

test.describe('Public enrollment entry', () => {
  test('homepage CTA starts with section choice and continues as a parent', async ({ page }) => {
    await page.goto('/ar/');
    await page.getByRole('link', { name: /ابدأ رحلتك الآن/ }).first().click();
    await expect(page).toHaveURL(/\/ar\/start$/);
    await expect(page.getByRole('heading', { name: /اختر قسمك/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /قسم الرجال والأطفال/ })).toBeVisible();
    await page.getByRole('button', { name: /قسم السيدات/ }).click();
    await expect(page.getByText('القسم المختار:')).toBeVisible();
    await page.getByRole('link', { name: /التسجيل كولي أمر/ }).click();
    await expect(page).toHaveURL(/\/ar\/register\/guardian\?section=women/);
    await expect(page.getByRole('heading', { name: 'إنشاء حساب ولي أمر' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'حساب معلم' })).toHaveCount(0);
  });

  test('a learner can choose the men and children section before creating an account', async ({ page }) => {
    await page.goto('/ar/start');
    await page.getByRole('button', { name: /قسم الرجال والأطفال/ }).click();
    await page.getByRole('link', { name: /التسجيل كطالب/ }).click();
    await expect(page).toHaveURL(/\/ar\/register\/student\?section=men/);
    await expect(page.locator('select[name="gender"]')).toHaveValue('male');
    await expect(page.getByText('القسم المختار:')).toBeVisible();
  });

  test('public login and registration expose only student and guardian accounts', async ({ page }) => {
    await page.goto('/ar/login');
    await expect(page.getByRole('button', { name: 'الانضمام كمعلم' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'إنشاء حساب طالب' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'إنشاء حساب ولي أمر' })).toBeVisible();
    await page.goto('/ar/register');
    await expect(page.getByRole('button', { name: 'حساب معلم' })).toHaveCount(0);
  });
});

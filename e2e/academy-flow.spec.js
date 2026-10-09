import { test, expect } from '@playwright/test';
import { accounts, login } from './helpers.js';

test.describe.serial('Wahy Wa Namaa core academy journey', () => {
  test('student registration works through the real UI', async ({ page }) => {
    const email = `e2e.registration.${Date.now()}@example.test`;

    await page.goto('/ar/register/student');
    await page.locator('input[name="name"]').fill('E2E Registered Student');
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="phone"]').fill('+201000009999');
    await page.locator('input[name="age"]').fill('21');
    await page.locator('select[name="gender"]').selectOption('male');
    await page.locator('select[name="preferredTrack"]').selectOption('memorization');
    await page.locator('input[name="memorizedJuz"]').fill('0');
    await page.locator('input[name="password"]').fill('Playwright123!');
    await page.locator('input[name="confirmPassword"]').fill('Playwright123!');

    await page.locator('form').getByRole('button', { name: /إنشاء|تسجيل/ }).click();
    await expect(page).toHaveURL(/\/ar\/student\/dashboard/);
    await expect(page.getByText('لوحة الطالب')).toBeVisible();
  });

  test('student books a trial and teacher accepts it', async ({ browser }) => {
    const studentContext = await browser.newContext({ locale: 'ar-EG', timezoneId: 'Africa/Cairo' });
    const teacherContext = await browser.newContext({ locale: 'ar-EG', timezoneId: 'Africa/Cairo' });
    const studentPage = await studentContext.newPage();
    const teacherPage = await teacherContext.newPage();

    await login(studentPage, accounts.bookingStudent);
    await studentPage.goto('/ar/student/dashboard?tab=discover');

    const teacherCard = studentPage.locator('article').filter({ hasText: 'E2E Teacher One' }).first();
    await expect(teacherCard).toBeVisible();
    await teacherCard.getByRole('link', { name: 'احجز حصة تجريبية' }).click();

    const bookingSelects = studentPage.locator('.wn-booking-field select');
    await bookingSelects.nth(0).selectOption({ index: 1 });
    await bookingSelects.nth(1).selectOption({ index: 1 });
    await studentPage.getByRole('button', { name: 'مراجعة الحجز' }).click();
    await studentPage.getByRole('button', { name: 'تأكيد الطلب' }).click();

    await expect(studentPage).toHaveURL(/\/ar\/student\/dashboard/);
    await studentPage.goto('/ar/student/dashboard?tab=trials');
    await expect(studentPage.getByText('قيد الانتظار')).toBeVisible();

    await login(teacherPage, accounts.teacher);
    await teacherPage.goto('/ar/teacher/dashboard?tab=requests');

    const requestCard = teacherPage.locator('article').filter({ hasText: 'E2E Booking Student' }).first();
    await expect(requestCard).toBeVisible();
    await requestCard.getByRole('button', { name: 'قبول' }).click();
    await expect(requestCard).toBeHidden();

    await studentPage.reload();
    await expect(studentPage.getByText('مؤكدة')).toBeVisible();

    await studentContext.close();
    await teacherContext.close();
  });

  test('teacher completes trial report and student gets subscription next step', async ({ browser }) => {
    const teacherContext = await browser.newContext({ locale: 'ar-EG', timezoneId: 'Africa/Cairo' });
    const teacherPage = await teacherContext.newPage();

    await login(teacherPage, accounts.teacher);
    await teacherPage.goto('/ar/teacher/dashboard?tab=sessions');

    const sessionCard = teacherPage.locator('article').filter({ hasText: 'E2E Post Trial Student' }).first();
    await expect(sessionCard).toBeVisible();
    await sessionCard.getByRole('button', { name: 'إنهاء + تقرير' }).click();

    const modal = teacherPage.getByRole('dialog').filter({ hasText: 'تقييم E2E Post Trial Student' });
    await expect(modal).toBeVisible();

    for (const legend of ['الحضور والانتباه', 'الحفظ', 'التجويد', 'السلوك', 'الالتزام']) {
      const fieldset = modal.locator('fieldset').filter({ hasText: legend });
      await fieldset.getByRole('radio', { name: '3' }).click();
    }

    await modal.locator('#teacher-eval-surah').fill('سورة الفاتحة');
    await modal.locator('#teacher-eval-from-ayah').fill('1');
    await modal.locator('#teacher-eval-to-ayah').fill('7');
    await modal.locator('#teacher-eval-next-homework').fill('مراجعة سورة الفاتحة');
    await modal.locator('#teacher-eval-notes').fill('تقرير Playwright آلي للتحقق من دورة الحصة');
    await modal.locator('#teacher-eval-submit').click();

    await expect(modal).toBeHidden();
    await expect(teacherPage.getByText('الحصص المكتملة وتقاريرها')).toBeVisible();
    await expect(teacherPage.getByText('سورة الفاتحة')).toBeVisible();

    await teacherContext.close();

    const studentContext = await browser.newContext({ locale: 'ar-EG', timezoneId: 'Africa/Cairo' });
    const studentPage = await studentContext.newPage();
    await login(studentPage, accounts.postTrialStudent);

    await expect(studentPage.getByText('أكملت الحصة التجريبية بنجاح')).toBeVisible();
    await expect(studentPage.getByRole('button', { name: 'اشتراك', exact: true })).toBeVisible();
    await expect(studentPage.getByText(/2 متبقية/)).toBeVisible();

    await studentPage.goto('/ar/student/dashboard?tab=evaluations');
    await expect(studentPage.getByText('سورة الفاتحة')).toBeVisible();
    await expect(studentPage.getByText('مراجعة سورة الفاتحة')).toBeVisible();
    await expect(studentPage.getByText('تقرير Playwright آلي للتحقق من دورة الحصة')).toBeVisible();
    await expect(studentPage.getByText(/Africa\/Cairo/)).toBeVisible();

    await studentContext.close();
  });

  test('three-trial limit is visible in the student UI', async ({ page }) => {
    await login(page, accounts.trialLimitStudent);

    await expect(page.getByText('أكملت الحصة التجريبية بنجاح')).toBeVisible();
    await expect(page.getByText(/3 مستخدمة من 3/)).toBeVisible();
    await expect(page.getByText('استخدمت الحصص التجريبية الثلاث')).toBeVisible();
    await expect(page.getByRole('button', { name: 'استخدم تجريبية أخرى' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'اشتراك', exact: true })).toBeVisible();
  });
});

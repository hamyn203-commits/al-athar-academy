import { test, expect } from '@playwright/test';
import { accounts, E2E_PASSWORD, login } from './helpers.js';

const endpoint = 'http://127.0.0.1:4000';
async function apiLogin(request, email) {
  const response = await request.post(`${endpoint}/api/auth/login`, { data: { email, password: E2E_PASSWORD } });
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  return { headers: { Authorization: `Bearer ${data.accessToken}` }, user: data.user };
}

test('student and administration exchange persisted messages and synchronize read receipts without reloading', async ({ page, browser }) => {
  test.setTimeout(90000);
  await login(page, accounts.bookingStudent);
  await page.getByRole('button', { name: 'تواصل مع الإدارة' }).click();
  const chat = page.getByRole('region', { name: 'محادثة الإدارة' });
  const question = `مشكلة في موعد الحصة ${Date.now()}`;
  await chat.getByLabel('رسالتك').fill(question);
  await chat.getByRole('button', { name: 'إرسال الرسالة', exact: true }).click();
  await expect(chat.getByText(question, { exact: true })).toBeVisible();
  await expect(chat.getByText('تم الإرسال', { exact: false })).toBeVisible();
  const adminContext = await browser.newContext({ baseURL: new URL(page.url()).origin });
  try {
    const adminPage = await adminContext.newPage();
    await adminPage.goto('/ar/login');
    await adminPage.locator('#login-email').fill('e2e.admin@example.test');
    await adminPage.locator('#login-password').fill(E2E_PASSWORD);
    await adminPage.locator('form button[type="submit"]').click();
    await expect(adminPage).toHaveURL(/\/ar\/admin/);
    await adminPage.getByRole('button', { name: 'الدعم والرسائل', exact: true }).click();
    const inbox = adminPage.getByRole('region', { name: 'محادثات الطلاب' });
    await inbox.locator('aside button').filter({ hasText: question }).click();
    const adminChat = inbox.getByRole('region', { name: 'محادثة الإدارة' });
    await expect(adminChat.getByText(question, { exact: true })).toBeVisible();
    await expect(chat.getByText('تمت القراءة', { exact: false })).toBeVisible({ timeout: 15000 });
    const reply = `هنراجع الموعد مع المعلم ${Date.now()}`;
    await adminChat.getByLabel('رسالتك').fill(reply);
    await adminChat.getByRole('button', { name: 'إرسال الرسالة', exact: true }).click();
    await expect(chat.getByText(reply, { exact: true })).toBeVisible({ timeout: 15000 });
    await expect(adminChat.getByText('تمت القراءة', { exact: false })).toBeVisible({ timeout: 15000 });
    await page.goto('/ar/student/dashboard?tab=support');
    await expect(page.getByRole('region', { name: 'محادثة الإدارة' }).getByText(reply, { exact: true })).toBeVisible();
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByLabel('رسالتك')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    await page.screenshot({ path: 'test-results/support-student-mobile.png', fullPage: true });
    await adminPage.screenshot({ path: 'test-results/support-admin-desktop.png', fullPage: true });
  } finally { await adminContext.close(); }
});

test('support authorization, concurrent send retry, notification deduplication and read cutoff use real API and database', async ({ request }) => {
  const student = await apiLogin(request, accounts.postTrialStudent);
  const other = await apiLogin(request, accounts.trialLimitStudent);
  const admin = await apiLogin(request, 'e2e.admin@example.test');
  const teacher = await apiLogin(request, accounts.teacher);
  expect((await request.get(`${endpoint}/api/support/inbox`)).status()).toBe(401);
  expect((await request.get(`${endpoint}/api/support/inbox`, { headers: student.headers })).status()).toBe(403);
  expect((await request.get(`${endpoint}/api/support/me/messages`, { headers: teacher.headers })).status()).toBe(403);
  const payload = { text: `رسالة آمنة ${Date.now()}`, clientId: `retry-${Date.now()}` };
  const responses = await Promise.all([1, 2].map(() => request.post(`${endpoint}/api/support/me/messages`, { headers: student.headers, data: payload })));
  responses.forEach((r) => expect(r.status()).toBe(201));
  const first = (await responses[0].json()).message;
  expect((await responses[1].json()).message._id).toBe(first._id);
  const own = await (await request.get(`${endpoint}/api/support/${student.user._id}/messages`, { headers: other.headers })).json();
  expect(own.student._id).toBe(other.user._id);
  expect(own.messages.some((m) => m._id === first._id)).toBeFalsy();
  const notices = await (await request.get(`${endpoint}/api/notifications?limit=100`, { headers: admin.headers })).json();
  expect(notices.notifications.filter((n) => n.data?.supportMessage === first._id)).toHaveLength(1);
  expect((await request.post(`${endpoint}/api/support/me/messages`, { headers: student.headers, data: { ...payload, text: 'تغيير نفس المعرّف' } })).status()).toBe(409);
  expect((await request.post(`${endpoint}/api/support/me/messages`, { headers: student.headers, data: { text: ' ', clientId: 'invalid-empty' } })).status()).toBe(400);
  const second = (await (await request.post(`${endpoint}/api/support/me/messages`, { headers: student.headers, data: { text: 'رسالة وصلت بعد العرض', clientId: `cutoff-${Date.now()}` } })).json()).message;
  expect((await request.put(`${endpoint}/api/support/${student.user._id}/read`, { headers: admin.headers, data: { through: first._id } })).status()).toBe(200);
  const thread = await (await request.get(`${endpoint}/api/support/${student.user._id}/messages`, { headers: admin.headers })).json();
  expect(thread.messages.find((m) => m._id === first._id).readAt).toBeTruthy();
  expect(thread.messages.find((m) => m._id === second._id).readAt).toBeNull();
  expect((await request.put(`${endpoint}/api/support/me/read`, { headers: other.headers, data: { through: first._id } })).status()).toBe(404);
  const after = await (await request.get(`${endpoint}/api/notifications?limit=100`, { headers: admin.headers })).json();
  expect(after.notifications.find((n) => n.data?.supportMessage === first._id).isRead).toBeTruthy();
  expect(after.notifications.find((n) => n.data?.supportMessage === second._id).isRead).toBeFalsy();
});

test('administration starts a conversation from the student dossier and student badge opens it', async ({ page, request }) => {
  const student = await apiLogin(request, accounts.trialLimitStudent);
  await page.goto('/ar/login');
  await page.locator('#login-email').fill('e2e.admin@example.test');
  await page.locator('#login-password').fill(E2E_PASSWORD);
  await page.locator('form button[type="submit"]').click();
  await expect(page).toHaveURL(/\/ar\/admin/);
  await page.goto('/ar/admin?tab=people');
  // Open the actual dossier through the directory, as an administrator would.
  const directory = page.getByRole('region', { name: 'دليل الطلاب والأسر' });
  await directory.getByLabel('بحث عن طالب أو ولي أمر').fill(accounts.trialLimitStudent);
  await directory.getByRole('button', { name: 'بحث', exact: true }).click();
  await directory.getByRole('button').filter({ hasText: accounts.trialLimitStudent }).click();
  await page.getByRole('button', { name: 'مراسلة الطالب', exact: true }).click();
  const chat = page.getByRole('region', { name: 'محادثة الإدارة' });
  const welcome = `الإدارة بتتابع معاك ${Date.now()}`;
  await chat.getByLabel('رسالتك').fill(welcome);
  await chat.getByRole('button', { name: 'إرسال الرسالة', exact: true }).click();
  await expect(chat.getByText(welcome, { exact: true })).toBeVisible();
  const unread = await (await request.get(`${endpoint}/api/support/me/unread`, { headers: student.headers })).json();
  expect(unread.unread).toBeGreaterThan(0);
  await page.context().clearCookies();
  await login(page, accounts.trialLimitStudent);
  const launcher = page.getByRole('button', { name: /تواصل مع الإدارة/ });
  await expect(launcher.getByLabel('رسائل غير مقروءة')).toBeVisible();
  await launcher.click();
  await expect(page.getByRole('region', { name: 'محادثة الإدارة' }).getByText(welcome, { exact: true })).toBeVisible();
  await expect(launcher.getByLabel('رسائل غير مقروءة')).toHaveCount(0);
});

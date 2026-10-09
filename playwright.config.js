import { defineConfig, devices } from '@playwright/test';

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wahy_playwright';
const backendEnv = {
  ...process.env,
  NODE_ENV: 'test',
  PORT: '4000',
  MONGODB_URI: mongoUri,
  DISABLE_RATE_LIMIT: 'true',
  ENABLE_IN_PROCESS_SCHEDULER: 'false',
  FRONTEND_URL: 'http://127.0.0.1:3500',
  SITE_URL: 'http://127.0.0.1:3500',
  JWT_SECRET: process.env.JWT_SECRET || 'playwright-access-secret-0123456789-abcdef',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'playwright-refresh-secret-9876543210-fedcba',
  MANUAL_PAYMENT_ENABLED: 'true',
  MANUAL_PAYMENT_RECIPIENT_NAME: 'Wahy Wa Namaa E2E',
  MANUAL_PAYMENT_INSTAPAY: 'e2e@instapay',
};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  globalTimeout: 12 * 60 * 1000,
  timeout: 60 * 1000,
  expect: { timeout: 12 * 1000 },
  reporter: process.env.CI
    ? [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }], ['junit', { outputFile: 'test-results/e2e-junit.xml' }]]
    : [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:3500',
    locale: 'ar-EG',
    timezoneId: 'Africa/Cairo',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_TEST_BASE_URL ? undefined : [
    {
      command: 'node backend/scripts/seed-playwright.cjs && npm --prefix backend start',
      url: 'http://127.0.0.1:4000/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: backendEnv,
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 3500',
      url: 'http://127.0.0.1:3500/ar/login',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: { ...process.env },
    },
  ],
});

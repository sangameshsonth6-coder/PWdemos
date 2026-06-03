import { test, expect } from '@playwright/test';

const LOGIN_URL = 'https://leap.knr.npsypr.edu.in/login';
const EMAIL = 'knr-testing@knrint.in';
const PASSWORD = 'LeapNpsTesting@2026';

test('Login and save session', async ({ page }) => {
  test.setTimeout(300000); // 5 minutes

  await page.goto(LOGIN_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  await page.getByPlaceholder('Email / User Name').fill(EMAIL);
  await page.locator('#pass').fill(PASSWORD);

  console.log('Solve captcha ONCE and click Log In. Do not close browser.');

  await page.waitForURL(/dashboard/, {
    timeout: 300000,
  });

  await expect(page).toHaveURL(/dashboard/);

  await page.context().storageState({
    path: 'storageState.chromium.json',
  });

  console.log('✅ Session saved');
});
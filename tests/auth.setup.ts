import { test, expect } from '@playwright/test';
import * as path from 'path';

const BASE_URL = 'https://or-demo.knrleap.org';
const EMAIL    = 'demo@knrint.com';
const PASSWORD = 'KNRADMIN@2026';
const TOKEN    = '03AGdBq24PBCbwiDRaS_MJ7Z8GitnZi';

async function bypassRecaptcha(page: any): Promise<void> {
  // Intercept the server-side verification endpoint
  await page.route('**/recaptcha/api/siteverify**', async (route: any) => {
    await route.fulfill({
      status:      200,
      contentType: 'application/json',
      body:        JSON.stringify({ success: true, score: 0.9 }),
    });
  });

  // Stub the client-side grecaptcha API
  await page.evaluate((token: string) => {
    (window as any).grecaptcha = {
      getResponse: () => token,
      ready:       (cb: () => void) => cb(),
      execute:     () => Promise.resolve(token),
      render:      () => 0,
      reset:       () => {},
    };
    (document.querySelectorAll('[name="g-recaptcha-response"]') as NodeListOf<HTMLInputElement>)
      .forEach((el) => { el.value = token; });
    const btn = document.getElementById('login-submit-btn') as HTMLButtonElement | null;
    if (btn) btn.disabled = false;
    const err = document.getElementById('captcha-error') as HTMLElement | null;
    if (err) err.textContent = '';
    if (typeof (window as any).onCaptchaVerified === 'function') {
      (window as any).onCaptchaVerified();
    }
  }, TOKEN);

  console.log('  ✅ reCAPTCHA bypassed');
}

test('Login and save session', async ({ page, browser }) => {
  const sessionFile = path.resolve(`storageState.${browser.browserType().name()}.json`);

  // ── Debug listeners ────────────────────────────────────────────────────────
  page.on('response', (response) => {
    if (response.url().includes('validate_login') || response.url().includes('/login')) {
      console.log(`  📡 ${response.status()} ${response.url()}`);
      response.text()
        .then((body) => console.log(`  📄 Response body: ${body.substring(0, 500)}`))
        .catch(() => {});
    }
  });
  page.on('crash',     () => console.log('  💥 Page crashed!'));
  page.on('close',     () => console.log('  🚪 Page was closed'));
  page.on('pageerror', (err) => console.log(`  ❌ Page JS error: ${err.message}`));

  // ── Register the login POST interceptor FIRST, before any navigation ───────
  // This ensures it's in place before the form can possibly submit.
  await page.route(`${BASE_URL}/login/validate_login`, async (route: any) => {
    const request    = route.request();
    const originalBody: string = request.postData() ?? '';
    console.log(`  📤 Original POST body: ${originalBody}`);

    const newBody = originalBody.includes('g-recaptcha-response=')
      ? originalBody.replace(/g-recaptcha-response=[^&]*/, `g-recaptcha-response=${TOKEN}`)
      : `${originalBody}&g-recaptcha-response=${TOKEN}`;

    console.log(`  📤 Modified POST body: ${newBody}`);

    await route.continue({
      method:   'POST',
      headers:  { ...request.headers(), 'content-type': 'application/x-www-form-urlencoded' },
      postData: newBody,
    });
  });

  // ── Navigate and wait for reCAPTCHA iframe ────────────────────────────────
  console.log('\n🌐  Opening login page...');
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.waitForSelector('iframe[src*="recaptcha"]', { timeout: 20_000 });
  console.log('  ✅ reCAPTCHA widget loaded');

  // ── Bypass reCAPTCHA, then fill credentials ────────────────────────────────
  // Order matters: bypass first so the token stub is ready before submit.
  await bypassRecaptcha(page);
  await page.waitForTimeout(300);

  await page.getByPlaceholder('Email / User Name').fill(EMAIL);
  await page.locator('input[type="password"]').first().fill(PASSWORD);
  console.log('  ✅ Credentials filled');

  // ── Submit ────────────────────────────────────────────────────────────────
  await page.locator('#login-submit-btn').click();
  console.log('  ✅ Login submitted');

  // ── Wait for redirect to dashboard ────────────────────────────────────────
  try {
    await page.waitForURL('**/dashboard', { timeout: 20_000 });
  } catch {
    // Log diagnostic info before failing
    console.log(`  🔍 URL after submit:  ${page.url()}`);
    console.log(`  🔍 Page title:        ${await page.title()}`);
    const bodyText = await page.evaluate(() => document.body.innerText).catch(() => 'page closed');
    console.log(`  🔍 Page body text:    ${bodyText.substring(0, 500)}`);
    throw new Error('Did not reach /dashboard — see logs above for server response details');
  }

  await expect(page).toHaveURL(/\/dashboard/);
  console.log('  ✅ Reached dashboard');

  // ── Persist session ───────────────────────────────────────────────────────
  await page.context().storageState({ path: sessionFile });
  console.log(`\n✅  Session saved → ${sessionFile}`);
});483911666
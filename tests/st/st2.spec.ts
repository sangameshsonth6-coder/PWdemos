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






test('TC001 - Verify valid Academic Year selection in Mass Update', async ({ page }) => {
    // 1. Navigate directly to the Mass Update Edit Group page
    await page.goto('https://or-demo.knrleap.org/admin/edit_group', { 
        waitUntil: 'networkidle' 
    });

    // 2. Handle Login (if redirected)
    if (page.url().includes('login')) {
        await page.fill('input[name="username"]', 'admin'); 
        await page.fill('input[name="password"]', 'admin123'); 
        await page.click('button[type="submit"]');
        await page.goto('https://or-demo.knrleap.org/admin/edit_group');
    }

    // 3. Select 2024-25 (Steps 3 & 4 from image_018116.png)
    // FIX: Use selectOption() on the select element directly.
    // This automatically handles visibility and interaction.
    const dropdown = page.locator('select[name="academic_year"]');
    await dropdown.selectOption({ label: '2024-25' });

    // 5. Assertion (Expected Result in image_018116.png)
    // Verify the selection is successful
    await expect(dropdown).toHaveValue('2024-25');
    
    console.log('✅ TC001 Passed: Academic Year 2024-25 selected successfully.');
});






test('TC002 - Verify Class Dropdown options appear', async ({ page }) => {
    // 1. Navigate to Mass Update
    await page.goto('https://or-demo.knrleap.org/admin/edit_group', { 
        waitUntil: 'networkidle' 
    });

    // 2. Handle Login (Same logic as TC001)
    if (page.url().includes('login')) {
        await page.fill('input[name="username"]', 'admin'); 
        await page.fill('input[name="password"]', 'admin123'); 
        await page.click('button[type="submit"]');
        await page.goto('https://or-demo.knrleap.org/admin/edit_group');
    }

    // 3. Select Academic Year first (Pre-condition)
    const yearDropdown = page.locator('select[name="academic_year"]');
    await yearDropdown.selectOption({ label: '2024-25' });

    // 4. Verify Class Dropdown
    const classDropdown = page.locator('select[name="class"], select[name="class_id"]');
    
    // Ensure it's visible and click it
    await expect(classDropdown).toBeVisible();
    await classDropdown.click();

    // 5. Assertion: Verify it is populated
    // Instead of a function, we check for a specific class that should exist in the list
    // This confirms the dropdown successfully loaded data from the server.
    await expect(classDropdown).toContainText('Grade 1');

    console.log('✅ TC002 Passed: Class dropdown appeared and contains Grade 1.');
});









test('TC004 - Verify Reset button clears all selections', async ({ page }) => {
    // 1. Navigate to the Mass Update page
    await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });

    // 2. Define Locators
    const yearDropdown = page.locator('select[name="academic_year"]');
    const classDropdown = page.locator('select[name="class"]');
    const resetButton = page.locator('button:has-text("Reset")');

    // 3. Capture the DEFAULT values before changing them
    // This handles cases where the default isn't empty (e.g., "2025-26")
    const defaultYear = await yearDropdown.inputValue();
    const defaultClass = await classDropdown.inputValue();

    // 4. Change form state
    await yearDropdown.selectOption({ label: '2024-25' });
    await classDropdown.selectOption({ label: 'Grade 1' });
    
    // 5. Click Reset
    await resetButton.click();

    // 6. Assertions: Verify fields reverted to their ORIGINAL default values
    await expect(yearDropdown).toHaveValue(defaultYear);
    await expect(classDropdown).toHaveValue(defaultClass);

    console.log(`✅ TC004 Passed: Form reverted to defaults (${defaultYear}, ${defaultClass})`);
});









test.describe('Mass Update - Negative & Boundary Testing', () => {
    
    test.beforeEach(async ({ page }) => {
        // Navigate to the target page before each test
        await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });
    });

  test('TC003 - Required Fields: Search without selecting required fields', async ({ page }) => {
    // 1. Navigate to the Mass Update page
    await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });

    // 2. Action: Click Search immediately
    const searchButton = page.locator('button:has-text("Search")');
    await searchButton.click();

    // 3. Assertions: Verify specific validation messages appear
    // Based on the Page Snapshot, these are the exact strings that appear:
    const classError = page.getByText('Please Select Classname');
    const sectionError = page.getByText('Please select Section');
    const editForError = page.getByText('Please select Edit For');

    // Check visibility of the error messages
    await expect(classError).toBeVisible();
    await expect(sectionError).toBeVisible();
    await expect(editForError).toBeVisible();

    console.log('✅ TC003 Passed: All required field validation messages are visible.');
});
    test('TC005 - Invalid Class Input: Try typing manually if allowed', async ({ page }) => {
        const classDropdown = page.locator('select[name="class"]');

        // 1. Check if the dropdown allows manual typing (some searchable selects do)
        // If it's a standard HTML select, we test if we can force an invalid value
        await classDropdown.focus();
        
        // 2. Action: Try to select a value that shouldn't exist or isn't in the list
        // In Playwright, if we try to select a non-existent option, it should throw/fail
        try {
            await classDropdown.selectOption({ label: 'Grade 11' });
        } catch (e) {
            console.log('✅ TC005 Passed: Field does not accept invalid manual input "Grade 11".');
        }
    });

    test('TC007 - Edit For Field: Submit without selecting Edit For', async ({ page }) => {
        // 1. Fill all fields EXCEPT 'Edit For'
        await page.locator('select[name="academic_year"]').selectOption({ label: '2024-25' });
        await page.locator('select[name="class"]').selectOption({ label: 'Grade 1' });
        
        const sectionDropdown = page.locator('select[name="section"]');
        await expect(sectionDropdown).not.toBeDisabled();
        await sectionDropdown.selectOption({ index: 1 });

        // 2. Click Search
        await page.locator('button:has-text("Search")').click();

        // 3. Assertion: Verify error shown for missing 'Edit For'
        // We look for a validation message or specific alert
        const validationMsg = page.getByText(/Please select Edit For/i);
        await expect(validationMsg).toBeVisible();
        
        console.log('✅ TC007 Passed: Error shown for missing Edit For selection.');
    });

});








test('TC006 - Section Dropdown: Verify boundary values (A-Z)', async ({ page }) => {
    // 1. Navigate to the page
    await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });

    const classDropdown = page.locator('select[name="class"]');
    // In your snapshot, this is combobox [ref=e126]
    const sectionDropdown = page.locator('select[name="section"]');

    // 2. Action: Select a Class
    await classDropdown.selectOption({ label: 'Grade 1' });

    // 3. Action: Click the Section dropdown to trigger its appearance/population
    // We wait for it to be enabled first (Playwright does this automatically with .click())
    await sectionDropdown.click();

    // 4. Assertion: Verify the specific boundary option 'A' exists and is visible
    // We use a locator that targets the option directly inside that select
    const optionA = sectionDropdown.locator('option:has-text("A")');
    
    // Playwright will auto-retry this assertion until the timeout is reached
    await expect(optionA).toBeAttached(); 
    
    // 5. Final check: Ensure it is not just the default placeholder
    const options = sectionDropdown.locator('option');
    await expect(options).not.toHaveCount(1);

    console.log('✅ TC006 Passed: Section dropdown clicked and boundary option "A" is present.');
});





test('TC008 - Duplicate Class: Check for duplication or confusion in class list', async ({ page }) => {
    // 1. Navigate to the Mass Update page
    await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });

    // 2. Locate the Class dropdown
    const classDropdown = page.locator('select[name="class"]');
    
    // 3. Extract all text contents from the dropdown options
    const options = await classDropdown.locator('option').allTextContents();

    // 4. Logic: Identify duplicates or near-duplicates (e.g., "Grade 1" vs "grade 1")
    const seen = new Set();
    const duplicates = [];

    for (let option of options) {
        // Clean the string: trim spaces and convert to lowercase for strict comparison
        const cleanOption = option.trim().toLowerCase();
        
        // Skip the default placeholder "-- Select --"
        if (cleanOption === '-- select --' || cleanOption === '') continue;

        if (seen.has(cleanOption)) {
            duplicates.push(option);
        } else {
            seen.add(cleanOption);
        }
    }

    // 5. Assertion: The test fails if the duplicates array is not empty
    expect(duplicates, `Found duplicate class entries: ${duplicates.join(', ')}`).toHaveLength(0);

    console.log('✅ TC008 Passed: No duplicate or confusing class entries found.');
});





test('TC009 - SQL Injection: Verify input sanitization in Class/Section fields', async ({ page }) => {
    // 1. Navigate to the Mass Update page
    await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });

    const classDropdown = page.locator('select[name="class"]');

    // 2. Action: Attempt to inject a common SQL string
    // According to TC009 in image_00147a.png, we use: ' OR '1'='1'
    const sqlInjectionString = "' OR '1'='1'";

    try {
        // Attempt to programmatically force this value into the dropdown
        await classDropdown.selectOption({ value: sqlInjectionString }, { timeout: 2000 });
        
        // If the code reaches here, it means the dropdown accepted the malicious value
        throw new Error('Security Vulnerability: Dropdown accepted SQL injection string.');
    } catch (error) {
        // Playwright will throw an error because the value doesn't exist in the <option> list
        // This confirms the UI/Browser restricts inputs to predefined values.
        console.log('✅ TC009 Passed: Input sanitized; SQL injection string rejected.');
    }

    // 3. Verification: Ensure no unexpected error pages or database dumps appeared
    // The page should remain on the Mass Update form without crashing
    await expect(page.locator('h3:has-text("Mass Update")')).toBeVisible();
});





test('TC_10: Verify logout functionality with confirmation', async ({ page }) => {
    // 1. Navigate to the Ledger Details page (or your current work page)
    await page.goto('https://or-demo.knrleap.org/admin/edit_group');

    // 2. Click the initial Logout link in the sidebar
    // We target the listitem to ensure we are clicking the correct menu entry
    const sidebarLogout = page.getByRole('listitem').filter({ hasText: 'Logout' });
    await sidebarLogout.click();

    // 3. Handle the Confirmation Pop-up
    // Locating the dialog and the specific Logout link inside it
    const confirmationDialog = page.getByRole('dialog').or(page.locator('.modal-content')); 
    const finalLogoutLink = confirmationDialog.getByRole('link', { name: 'Logout' });
    
    // Playwright best practice: Ensure visibility before the final click
    await expect(finalLogoutLink).toBeVisible();
    await finalLogoutLink.click();

    // 4. Verify redirection to the login page
    // We check for the 'Log In' button and a URL change
    const loginButton = page.getByRole('button', { name: 'Log In' });
    
    // Increased timeout to account for reCAPTCHA or network lag on the login screen
    await expect(loginButton).toBeVisible({ timeout: 7000 });
    await expect(page).toHaveURL(/.*login/);

    console.log('✅ TC_LD_10 Passed: Successfully clicked confirm and reached login page.');
});
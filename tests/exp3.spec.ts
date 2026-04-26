import { test, expect, Page } from '@playwright/test';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const TOKEN    = '03AGdBq24PBCbwiDRaS_MJ7Z8GitnZi';
const BASE_URL = 'https://or-demo.knrleap.org';
const EMAIL    = 'demo@knrint.com';
const PASSWORD = 'KNRADMIN@2026';

// ─────────────────────────────────────────────────────────────────────────────
// SHARED LOGIN HELPER
// ─────────────────────────────────────────────────────────────────────────────
async function loginIfNeeded(page: Page): Promise<void> {
    await page.goto(`${BASE_URL}/admin/approval_flow`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    if (!page.url().includes('login')) {
        console.log('✅ Already logged in — skipping login step');
        return;
    }

    console.log('🔐 Not logged in — performing login...');

    await page.route('**/recaptcha/api/siteverify**', async (route: any) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true, score: 0.9 }),
        });
    });

    await page.route(`${BASE_URL}/login/validate_login`, async (route: any) => {
        const request = route.request();
        const originalBody: string = request.postData() ?? '';
        const newBody = originalBody.includes('g-recaptcha-response=')
            ? originalBody.replace(/g-recaptcha-response=[^&]*/, `g-recaptcha-response=${TOKEN}`)
            : `${originalBody}&g-recaptcha-response=${TOKEN}`;
        await route.continue({
            method: 'POST',
            headers: { ...request.headers(), 'content-type': 'application/x-www-form-urlencoded' },
            postData: newBody,
        });
    });

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.waitForSelector('iframe[src*="recaptcha"]', { timeout: 20_000 });

    await page.evaluate((token: string) => {
        (window as any).grecaptcha = {
            getResponse: () => token,
            ready: (cb: () => void) => cb(),
            execute: () => Promise.resolve(token),
            render: () => 0,
            reset: () => {},
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

    await page.waitForTimeout(300);
    await page.getByPlaceholder('Email / User Name').fill(EMAIL);
    await page.locator('input[type="password"]').first().fill(PASSWORD);
    await page.locator('#login-submit-btn').click();

    await page.waitForURL('**/dashboard', { timeout: 20_000 });
    console.log('✅ Login successful');
}

// ─────────────────────────────────────────────────────────────────────────────
// TC_AF_01: Verify Add New opens category form and accepts input
// ─────────────────────────────────────────────────────────────────────────────
test('TC_AF_01: Verify Add New opens category form and accepts input', async ({ page }) => {

    await loginIfNeeded(page);

    await expect(page.locator('h3:has-text("Flow Details")')).toBeVisible({ timeout: 10000 });

    const addNewBtn = page.locator('a[href*="add_flow_details"]');
    await addNewBtn.click();

    await expect(page.locator('h3:has-text("Add Approval Flow")')).toBeVisible({ timeout: 10000 });

    const categoryDropdown = page.locator('#expense_category');
    await categoryDropdown.selectOption(['4', '15'], { force: true });

    const amountInput = page.locator('#amount');
    await amountInput.fill('50000');

    const stagesDropdown = page.locator('#num_stages');
    await stagesDropdown.selectOption('3');

    await expect(amountInput).toHaveValue('50000');
    await expect(stagesDropdown).toHaveValue('3');

    console.log('✅ TC_AF_01 Passed');
});

// ─────────────────────────────────────────────────────────────────────────────
// TC_AAF_01: Verify mandatory fields validation
// ─────────────────────────────────────────────────────────────────────────────
test('TC_AAF_01: Verify mandatory fields validation', async ({ page }) => {

    await loginIfNeeded(page);

    await page.goto(`${BASE_URL}/admin/add_flow_details`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h3:has-text("Add Approval Flow")')).toBeVisible({ timeout: 10000 });

    const submitBtn = page.locator('a.btn-submit');
    await submitBtn.click();

    const categorySelect = page.locator('#expense_category');
    await expect(categorySelect).toHaveAttribute('required', '');

    const stagesSelect = page.locator('#num_stages');
    await expect(stagesSelect).toHaveAttribute('required', '');

    const categoryErr = page.locator('#container_err');
    const stagesErr   = page.locator('#num_stages_err');
    await expect(categoryErr).toBeAttached();
    await expect(stagesErr).toBeAttached();

    await expect(page).toHaveURL(/.*add_flow_details/);

    console.log('✅ TC_AAF_01 Passed: Mandatory field validation confirmed.');
});

// ─────────────────────────────────────────────────────────────────────────────
// TC_AAF_04: Verify system blocks negative amount entry
// ─────────────────────────────────────────────────────────────────────────────
test('TC_AAF_04: Verify system blocks negative amount entry', async ({ page }) => {

    await loginIfNeeded(page);

    await page.goto(`${BASE_URL}/admin/add_flow_details`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h3:has-text("Add Approval Flow")')).toBeVisible({ timeout: 10000 });

    await page.locator('#expense_category').selectOption('15', { force: true });

    const amountInput = page.locator('#amount');
    await amountInput.fill('-500');

    const submitBtn = page.locator('a.btn-submit');
    await submitBtn.click();

    const currentURL     = page.url();
    const isStillOnPage  = currentURL.includes('add_flow_details');
    const isInvalid      = await amountInput.evaluate((el: HTMLInputElement) => !el.checkValidity());

    if (isStillOnPage && isInvalid) {
        console.log('✅ TC_AAF_04 Passed: Browser blocked submission due to invalid (negative) amount.');
    } else if (isStillOnPage) {
        const errorCount = await page.locator('.text-danger, .alert-danger, .error').count();
        if (errorCount > 0) {
            console.log('✅ TC_AAF_04 Passed: System error message detected.');
        } else {
            console.log('✅ TC_AAF_04 Passed: Submission stayed on page (Negative value was not accepted).');
        }
    } else {
        throw new Error('❌ TC_AAF_04 Failed: Page redirected! System accepted a negative amount.');
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// TC_AAF_05: Verify search and view of existing approval flow
// ─────────────────────────────────────────────────────────────────────────────
test('TC_AAF_05: Verify search and view of existing approval flow', async ({ page }) => {

    await loginIfNeeded(page);

    await page.goto(`${BASE_URL}/admin/approval_flow`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h3:has-text("Flow Details")')).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('#Applications tbody');

    const searchInput = page.locator('input[type="search"]');
    await searchInput.fill('GradeA');
    await page.waitForTimeout(900);

    const firstRow = page.locator('#Applications tbody tr').first();
    await expect(firstRow).toContainText('GradeA', { timeout: 10000 });

    const actionBtn = firstRow.locator('a').first();
    await actionBtn.scrollIntoViewIfNeeded();
    await actionBtn.click({ force: true });

    await expect(page).toHaveURL(/\/admin\/.*flow/, { timeout: 15000 });

    console.log('✅ TC_AAF_05 Passed: Search results found and detail page accessed.');
});

// ─────────────────────────────────────────────────────────────────────────────
// TC_AAF_07: Verify that roles assigned to stages
// ─────────────────────────────────────────────────────────────────────────────
test('TC_AAF_07: Verify that roles assigned to stages', async ({ page }) => {

    await loginIfNeeded(page);

    await expect(page.locator('h3:has-text("Flow Details")')).toBeVisible({ timeout: 10000 });

    const tableBody = page.locator('#Applications tbody');
    await expect(tableBody).toBeVisible({ timeout: 5000 });

    const allRows  = tableBody.locator('tr');
    const rowCount = await allRows.count();

    for (let i = 0; i < rowCount; i++) {
        const row          = allRows.nth(i);
        const categoryCell = await row.locator('td').nth(1).textContent();

        if (categoryCell?.toLowerCase().includes('infrastructure')) {
            console.log('🗑️ Found existing Infrastructure flow — deleting...');
            await row.locator('.btn-delete').click();

            const confirmBtn = page.locator('.swal2-confirm');
            await expect(confirmBtn).toBeVisible({ timeout: 5000 });
            await confirmBtn.click();

            await expect(page.locator('.swal2-title')).toContainText(/deleted/i, { timeout: 5000 });
            await page.waitForLoadState('networkidle');
            console.log('✅ Existing flow deleted');
            break;
        }
    }

    const addNewBtn = page.locator('a:has-text("Add New")');
    await expect(addNewBtn).toBeVisible({ timeout: 5000 });
    await addNewBtn.click();
    await page.waitForURL('**/admin/add_flow_details');
    await expect(page.locator('h3:has-text("Add Approval Flow")')).toBeVisible({ timeout: 10000 });
    console.log('✅ Add Approval Flow form loaded');

    await page.locator('#expense_category').evaluate((el: HTMLSelectElement, value) => {
        el.value = value;
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('input',  { bubbles: true }));
    }, '4');
    await page.waitForTimeout(1000);
    console.log('✅ Category selected (Infrastructure)');

    await page.locator('#amount').fill('55000');
    console.log('✅ Amount entered: 55000');

    await page.locator('#num_stages').selectOption('3');
    const stageDropdowns = page.locator('#additional_dropdowns select');
    await expect(stageDropdowns).toHaveCount(3, { timeout: 5000 });
    console.log('✅ 3 stage dropdowns rendered — left unselected');

    await page.locator('.btn-submit').click({ force: true });
    await page.waitForTimeout(1000);

    const numStagesErr = page.locator('#num_stages_err');
    const swalTitle    = page.locator('.swal-title, .swal2-title');

    const isInlineVisible = await numStagesErr.isVisible();
    const isSwalVisible   = await swalTitle.isVisible();

    if (isInlineVisible) {
        await expect(numStagesErr).toHaveText(/please select a role/i);
        console.log('✅ Passed: Inline validation error caught.');
    } else if (isSwalVisible) {
        await expect(swalTitle).toHaveText(/warning|error/i);
        console.log('✅ Passed: SweetAlert validation caught.');
    } else {
        throw new Error('❌ Failed: No validation error was shown after submitting empty stages.');
    }

    await expect(page).toHaveURL(/.*add_flow_details/);
    console.log('✅ TC_AAF_07 Passed');
});

// ─────────────────────────────────────────────────────────────────────────────
// TC_AAF_08: Verify Cancel button functionality (Add Flow form)
// ─────────────────────────────────────────────────────────────────────────────
test('TC_AAF_08: Verify Cancel button functionality', async ({ page }) => {

    await loginIfNeeded(page);

    await page.goto(`${BASE_URL}/admin/add_flow_details`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h3:has-text("Add Approval Flow")')).toBeVisible({ timeout: 10000 });
    console.log('✅ Add Approval Flow form loaded');

    await page.locator('#expense_category').evaluate((el: HTMLSelectElement) => {
        Array.from(el.options).forEach(o => o.selected = false);
        const opt = Array.from(el.options).find(o => o.value === '4');
        if (opt) opt.selected = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(1000);

    await page.locator('#amount').fill('75000');
    await expect(page.locator('#amount')).toHaveValue('75000');

    await page.locator('#num_stages').selectOption('2');
    await page.waitForTimeout(2000);

    const stageDropdowns = page.locator('#additional_dropdowns select');
    await expect(stageDropdowns).toHaveCount(2, { timeout: 5000 });

    const stage1 = page.locator('#additional_dropdowns select[name="stage_1"]');
    const stage2 = page.locator('#additional_dropdowns select[name="stage_2"]');
    await expect(stage1).toBeVisible({ timeout: 5000 });
    await stage1.selectOption({ index: 1 });
    await stage1.dispatchEvent('change');
    await page.waitForTimeout(300);
    await expect(stage2).toBeVisible({ timeout: 5000 });
    await stage2.selectOption({ index: 2 });
    await stage2.dispatchEvent('change');
    await page.waitForTimeout(300);
    console.log('✅ All fields filled');

    const cancelBtn = page.locator('a.btn-cancel, a:has-text("Cancel")');
    await expect(cancelBtn).toBeVisible({ timeout: 5000 });
    await cancelBtn.click();
    console.log('✅ Cancel button clicked');

    await expect(page).toHaveURL(/.*admin\/approval_flow/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h3:has-text("Flow Details")')).toBeVisible({ timeout: 10000 });
    console.log('✅ Redirected to Flow Details listing page');

    await page.goto(`${BASE_URL}/admin/add_flow_details`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');

    const freshAmount = await page.locator('#amount').inputValue();
    expect(freshAmount).toBe('');

    const freshCategory = await page.locator('#expense_category').evaluate(
        (el: HTMLSelectElement) => Array.from(el.selectedOptions).map(o => o.value)
    );
    expect(freshCategory.length).toBe(0);

    const freshStages = await page.locator('#num_stages').inputValue();
    expect(freshStages).toBe('');

    await expect(page.locator('#additional_dropdowns select')).toHaveCount(0);
    console.log('✅ Form is reset — data was not saved');

    console.log('✅ TC_AAF_08 Passed');
});

// ─────────────────────────────────────────────────────────────────────────────
// TC_AAF_09: Verify duplicate approval flow creation is blocked
// ─────────────────────────────────────────────────────────────────────────────
test('TC_AAF_09: Verify duplicate approval flow creation', async ({ page }) => {

    await loginIfNeeded(page);

    await expect(page.locator('h3:has-text("Flow Details")')).toBeVisible({ timeout: 10000 });

    const tableBody = page.locator('#Applications tbody');
    await expect(tableBody).toBeVisible({ timeout: 5000 });

    const allRows  = tableBody.locator('tr');
    const rowCount = await allRows.count();

    let flowAlreadyExists = false;
    for (let i = 0; i < rowCount; i++) {
        const categoryCell = await allRows.nth(i).locator('td').nth(1).textContent();
        if (categoryCell?.toLowerCase().includes('infrastructure')) {
            flowAlreadyExists = true;
            console.log('✅ Infrastructure flow already exists — good for duplicate test');
            break;
        }
    }

    if (!flowAlreadyExists) {
        console.log('⚠️ No flow found — creating one as pre-condition...');

        await page.goto(`${BASE_URL}/admin/add_flow_details`, { waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle');

        await page.locator('#expense_category').evaluate((el: HTMLSelectElement) => {
            Array.from(el.options).forEach(o => o.selected = false);
            const opt = Array.from(el.options).find(o => o.value === '4');
            if (opt) opt.selected = true;
            el.dispatchEvent(new Event('change', { bubbles: true }));
        });
        await page.waitForTimeout(1500);

        await page.locator('#amount').fill('50000');
        await page.locator('#num_stages').selectOption('1');
        await page.waitForTimeout(2000);

        const stage1 = page.locator('#additional_dropdowns select[name="stage_1"]');
        await expect(stage1).toBeVisible({ timeout: 5000 });
        await stage1.selectOption({ index: 1 });
        await stage1.dispatchEvent('change');
        await page.waitForTimeout(300);

        const [insertRequest] = await Promise.all([
            page.waitForRequest(
                req => req.url().includes('insert-flow') && req.method() === 'POST',
                { timeout: 10000 }
            ),
            page.locator('.btn-submit').click({ force: true }),
        ]);
        console.log('📤 Pre-condition flow created:', insertRequest.url());

        await expect(page.locator('.swal-title')).toBeVisible({ timeout: 8000 });
        await expect(page.locator('.swal-title')).toHaveText(/success/i);
        await expect(page).toHaveURL(/.*admin\/approval_flow/, { timeout: 10000 });
        await page.waitForLoadState('networkidle');
    }

    await page.goto(`${BASE_URL}/admin/add_flow_details`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h3:has-text("Add Approval Flow")')).toBeVisible({ timeout: 10000 });

    await page.locator('#expense_category').evaluate((el: HTMLSelectElement) => {
        Array.from(el.options).forEach(o => o.selected = false);
        const opt = Array.from(el.options).find(o => o.value === '4');
        if (opt) opt.selected = true;
        el.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await page.waitForTimeout(2000);

    const containerErr = page.locator('#container_err');
    await expect(containerErr).toBeVisible({ timeout: 5000 });
    const inlineErrText = await containerErr.textContent();
    console.log('Inline error text:', inlineErrText);
    expect(inlineErrText).toMatch(/flow has been already created|already created/i);
    console.log('✅ Inline warning shown on category selection');

    await page.locator('#amount').fill('99000');
    await page.locator('#num_stages').selectOption('1');
    await page.waitForTimeout(2000);

    const stage1Dropdown = page.locator('#additional_dropdowns select[name="stage_1"]');
    await expect(stage1Dropdown).toBeVisible({ timeout: 5000 });
    await stage1Dropdown.selectOption({ index: 1 });
    await stage1Dropdown.dispatchEvent('change');
    await page.waitForTimeout(300);

    await page.locator('.btn-submit').click({ force: true });
    await page.waitForTimeout(1500);

    const swalTitle = page.locator('.swal-title');
    const swalText  = page.locator('.swal-text');
    await expect(swalTitle).toBeVisible({ timeout: 8000 });
    await expect(swalTitle).toHaveText(/warning/i);
    await expect(swalText).toHaveText(/flow has already been created|already been created/i);
    console.log('✅ SweetAlert warning shown for duplicate flow');

    await expect(page).toHaveURL(/.*admin\/approval_flow/, { timeout: 10000 });
    await page.waitForLoadState('networkidle');

    const updatedRows = page.locator('#Applications tbody tr');
    const updatedCount = await updatedRows.count();
    let infrastructureCount = 0;
    for (let i = 0; i < updatedCount; i++) {
        const cell = await updatedRows.nth(i).locator('td').nth(1).textContent();
        if (cell?.toLowerCase().includes('infrastructure')) infrastructureCount++;
    }
    expect(infrastructureCount).toBe(1);
    console.log('✅ TC_AAF_09 Passed: No duplicate created');
});

// ─────────────────────────────────────────────────────────────────────────────
// TC_AF_2: Verify info button functionality
// ─────────────────────────────────────────────────────────────────────────────
test('TC_AF_2: Verify info button functionality', async ({ page }) => {

    await loginIfNeeded(page);

    await expect(page.locator('h3:has-text("Flow Details")')).toBeVisible({ timeout: 10000 });
    console.log('✅ Approval Flow listing page loaded');

    const tableBody = page.locator('#Applications tbody');
    await expect(tableBody).toBeVisible({ timeout: 5000 });

    const rows     = tableBody.locator('tr');
    const rowCount = await rows.count();
    if (rowCount === 0) throw new Error('Pre-condition failed: No approval flows exist.');

    const firstRow     = rows.first();
    const categoryName = await firstRow.locator('td').nth(1).textContent();
    console.log(`Clicking info button for: ${categoryName?.trim()}`);

    const infoBtn = firstRow.locator('button.add, button.btn-outline-success');
    await expect(infoBtn).toBeVisible({ timeout: 5000 });
    await infoBtn.click();

    const viewModal = page.locator('#view-form');
    await expect(viewModal).toBeVisible({ timeout: 5000 });

    await expect(viewModal.locator('.modal-title')).toHaveText(/approval flow details/i);
    console.log('✅ Modal title verified');

    const modalTable = viewModal.locator('#Applicationss');
    await expect(modalTable).toBeVisible({ timeout: 60000 });
    await expect(modalTable.locator('thead th').nth(0)).toHaveText(/order number/i);
    await expect(modalTable.locator('thead th').nth(1)).toHaveText(/approved person/i);

    const modalRows     = modalTable.locator('tbody tr');
    await expect(modalRows).not.toHaveCount(0, { timeout: 6000 });
    const modalRowCount = await modalRows.count();

    for (let i = 0; i < modalRowCount; i++) {
        const orderNumber    = await modalRows.nth(i).locator('td').nth(0).textContent();
        const approvedPerson = await modalRows.nth(i).locator('td').nth(1).textContent();
        expect(orderNumber?.trim()).not.toBe('');
        expect(approvedPerson?.trim()).not.toBe('');
    }
    console.log('✅ Modal data verified');

    const closeBtn = viewModal.locator('.btn-close, button[data-bs-dismiss="modal"]');
    await expect(closeBtn).toBeVisible({ timeout: 4000 });
    await closeBtn.click();
    await expect(viewModal).not.toBeVisible({ timeout: 6000 });

    console.log('✅ TC_AF_2 Passed');
});

// ─────────────────────────────────────────────────────────────────────────────
// TC_AF_3: Verify export/download works
// ─────────────────────────────────────────────────────────────────────────────
test('TC_AF_3: Verify export/download works', async ({ page }) => {

    await loginIfNeeded(page);

    await expect(page.locator('h3:has-text("Flow Details")')).toBeVisible({ timeout: 10000 });

    const tableBody = page.locator('#Applications tbody');
    await expect(tableBody).toBeVisible({ timeout: 5000 });

    const rows     = tableBody.locator('tr');
    const rowCount = await rows.count();
    if (rowCount === 0) throw new Error('Pre-condition failed: No approval flows exist.');

    await page.waitForTimeout(1500);

    const copyBtn = page.locator('button.buttons-copy, button:has-text("Copy")').first();
    if (await copyBtn.isVisible()) {
        await copyBtn.click();
        await page.waitForTimeout(900);
        const copyInfo = page.locator('.dt-button-info, div:has-text("Copied")');
        if (await copyInfo.isVisible()) {
            await page.waitForTimeout(1000);
        }
        console.log('✅ Copy: Done');
    } else {
        console.log('⚠️ Copy button not visible — skipping');
    }

    const csvBtn = page.locator('button.buttons-csv, button:has-text("CSV")').first();
    if (await csvBtn.isVisible()) {
        const [csvDownload] = await Promise.all([
            page.waitForEvent('download', { timeout: 9000 }),
            csvBtn.click(),
        ]);
        expect(csvDownload.suggestedFilename()).toMatch(/\.csv$/i);
        console.log('✅ CSV downloaded:', csvDownload.suggestedFilename());
    } else {
        console.log('⚠️ CSV button not visible — skipping');
    }

    const excelBtn = page.locator('button.buttons-excel, button:has-text("Excel")').first();
    if (await excelBtn.isVisible()) {
        const [excelDownload] = await Promise.all([
            page.waitForEvent('download', { timeout: 9000 }),
            excelBtn.click(),
        ]);
        expect(excelDownload.suggestedFilename()).toMatch(/\.xlsx?$/i);
        console.log('✅ Excel downloaded:', excelDownload.suggestedFilename());
    } else {
        console.log('⚠️ Excel button not visible — skipping');
    }

    const pdfBtn = page.locator('button.buttons-pdf, button:has-text("PDF")').first();
    if (await pdfBtn.isVisible()) {
        const [pdfDownload] = await Promise.all([
            page.waitForEvent('download', { timeout: 9000 }),
            pdfBtn.click(),
        ]);
        expect(pdfDownload.suggestedFilename()).toMatch(/\.pdf$/i);
        console.log('✅ PDF downloaded:', pdfDownload.suggestedFilename());
    } else {
        console.log('⚠️ PDF button not visible — skipping');
    }

    const printBtn = page.locator('button.buttons-print, button:has-text("Print")').first();
    if (await printBtn.isVisible()) {
        await page.evaluate(() => { window.print = () => {}; });
        await printBtn.click();
        await page.waitForTimeout(1000);
        await expect(page).toHaveURL(/.*admin\/approval_flow/, { timeout: 5000 });
        console.log('✅ Print: Done');
    } else {
        console.log('⚠️ Print button not visible — skipping');
    }

    await page.waitForLoadState('networkidle');
    expect(await tableBody.locator('tr').count()).toBe(rowCount);

    console.log('✅ TC_AF_3 Passed');
});

// ─────────────────────────────────────────────────────────────────────────────
// TC_AF_4: Verify search functionality
// ─────────────────────────────────────────────────────────────────────────────
test('TC_AF_4: Verify search functionality', async ({ page }) => {

    await loginIfNeeded(page);

    await expect(page.locator('h3:has-text("Flow Details")')).toBeVisible({ timeout: 10000 });

    const tableBody      = page.locator('#Applications tbody');
    await expect(tableBody).toBeVisible({ timeout: 6000 });

    const rowsBefore     = tableBody.locator('tr');
    const rowCountBefore = await rowsBefore.count();
    if (rowCountBefore === 0) throw new Error('Pre-condition failed: No approval flows exist.');

    const allCategories: string[] = [];
    for (let i = 0; i < rowCountBefore; i++) {
        const text = await rowsBefore.nth(i).locator('td').nth(1).textContent();
        allCategories.push(text?.trim() ?? '');
    }

    const searchInput = page.locator('.dataTables_filter input, input[type="search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 6000 });

    await searchInput.fill('Travel');
    await page.waitForTimeout(900);

    const rowsAfterSearch = tableBody.locator('tr');
    const rowCountAfter   = await rowsAfterSearch.count();
    const firstRowText    = await rowsAfterSearch.first().textContent();

    if (firstRowText?.toLowerCase().includes('no matching records')) {
        await expect(rowsAfterSearch.first()).toContainText(/no matching records/i);
        console.log('ℹ️ No "Travel" found — correct');
    } else {
        for (let i = 0; i < rowCountAfter; i++) {
            const cell = await rowsAfterSearch.nth(i).locator('td').nth(1).textContent();
            expect(cell?.toLowerCase()).toContain('travel');
        }
        console.log(`✅ ${rowCountAfter} Travel row(s) shown`);
    }

    const nonTravelCategories = allCategories.filter(c => !c.toLowerCase().includes('travel'));
    for (const category of nonTravelCategories) {
        expect(await tableBody.locator(`tr:has-text("${category}")`).isVisible()).toBe(false);
    }

    await searchInput.fill('');
    await searchInput.press('Backspace');
    await page.waitForTimeout(900);
    expect(await tableBody.locator('tr').count()).toBe(rowCountBefore);
    console.log('✅ All rows restored after clear');

    await searchInput.fill('food');
    await page.waitForTimeout(900);
    const countLower = await tableBody.locator('tr').count();
    await searchInput.fill('FOOD');
    await page.waitForTimeout(900);
    const countUpper = await tableBody.locator('tr').count();
    expect(countLower).toBe(countUpper);
    console.log('✅ Case-insensitive search verified');

    await searchInput.fill('Fo');
    await page.waitForTimeout(900);
    console.log(`✅ Partial search "Fo" returned ${await tableBody.locator('tr').count()} row(s)`);

    await searchInput.fill('');
    await page.waitForTimeout(600);

    console.log('✅ TC_AF_4 Passed');
});

// ─────────────────────────────────────────────────────────────────────────────
// TC_AF_5: Verify that columns can be shown/hidden
// ─────────────────────────────────────────────────────────────────────────────
test('TC_AF_5: Verify that columns can be shown/hidden', async ({ page }) => {

    await loginIfNeeded(page);

    await expect(page.locator('h3:has-text("Flow Details")')).toBeVisible({ timeout: 10000 });

    const tableBody = page.locator('#Applications tbody');
    await expect(tableBody).toBeVisible({ timeout: 6000 });
    await expect(page.locator('#Applications thead th:has-text("Status")')).toBeVisible({ timeout: 6000 });

    const headersBefore = await page.locator('#Applications thead th').allTextContents();
    expect(headersBefore.some(h => h.toLowerCase().includes('status'))).toBe(true);

    const colVisBtn = page.locator(
        'button.buttons-colvis, button:has-text("Column visibility"), button:has-text("Columns")'
    ).first();
    await expect(colVisBtn).toBeVisible({ timeout: 6000 });
    await colVisBtn.click();
    await page.waitForTimeout(900);

    const colVisDropdown = page.locator('.dt-button-collection, .dropdown-menu').first();
    await expect(colVisDropdown).toBeVisible({ timeout: 5000 });

    await colVisDropdown.locator('button:has-text("Status"), li:has-text("Status")').first().click();
    await page.waitForTimeout(900);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const headersAfterHide = await page.locator('#Applications thead th:visible').allTextContents();
    expect(headersAfterHide.some(h => h.toLowerCase().includes('status'))).toBe(false);
    console.log('✅ Status column hidden');

    const rows     = tableBody.locator('tr');
    const rowCount = await rows.count();
    if (rowCount > 0) {
        const visibleCells = await rows.first().locator('td:visible').count();
        expect(visibleCells).toBe(headersBefore.length - 1);
    }

    await colVisBtn.click();
    await page.waitForTimeout(800);
    const colVisDropdown2 = page.locator('.dt-button-collection, .dropdown-menu').first();
    await expect(colVisDropdown2).toBeVisible({ timeout: 6000 });
    await colVisDropdown2.locator('button:has-text("Status"), li:has-text("Status")').first().click();
    await page.waitForTimeout(900);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    const headersAfterShow = await page.locator('#Applications thead th:visible').allTextContents();
    expect(headersAfterShow.some(h => h.toLowerCase().includes('status'))).toBe(true);
    expect(headersAfterShow.length).toBe(headersBefore.length);
    console.log('✅ Status column restored');

    console.log('✅ TC_AF_5 Passed');
});

// ─────────────────────────────────────────────────────────────────────────────
// TC_AF_6: Verify toggling status Active/Inactive
// ─────────────────────────────────────────────────────────────────────────────
test('TC_AF_6: Verify toggling status Active/Inactive', async ({ page }) => {

    await loginIfNeeded(page);

    await expect(page.locator('h3:has-text("Flow Details")')).toBeVisible({ timeout: 10000 });

    const firstRow  = page.locator('#Applications tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 5000 });

    const statusCell      = firstRow.locator('td').nth(3);
    const initialText     = (await statusCell.innerText()).toLowerCase();
    const isInitialActive = initialText.includes('active') && !initialText.includes('inactive');
    console.log(`Initial status: ${isInitialActive ? 'Active' : 'Inactive'}`);

    const toggleBtn = firstRow.locator('.js-btn-active');
    const okButton  = page.getByRole('button', { name: 'OK' });

    await toggleBtn.click();
    await okButton.waitFor({ state: 'visible', timeout: 6000 });
    await okButton.click();
    await okButton.waitFor({ state: 'hidden' });

    if (isInitialActive) {
        await expect(statusCell).toContainText('Inactive', { ignoreCase: true });
    } else {
        await expect(statusCell).toContainText('Active', { ignoreCase: true });
        expect((await statusCell.innerText()).toLowerCase()).not.toContain('inactive');
    }
    console.log('✅ Status flipped');

    await toggleBtn.click();
    await okButton.waitFor({ state: 'visible' });
    await okButton.click();
    await okButton.waitFor({ state: 'hidden' });

    if (isInitialActive) {
        await expect(statusCell).toContainText('Active', { ignoreCase: true });
        expect((await statusCell.innerText()).toLowerCase()).not.toContain('inactive');
    } else {
        await expect(statusCell).toContainText('Inactive', { ignoreCase: true });
    }

    console.log('✅ TC_AF_6 Passed');
});

// ─────────────────────────────────────────────────────────────────────────────
// TC_AF_07: Verify deleting a category works
// ─────────────────────────────────────────────────────────────────────────────
test('TC_AF_07: Verify deleting a category works', async ({ page }) => {

    await loginIfNeeded(page);

    await expect(page.locator('h3:has-text("Flow Details")')).toBeVisible({ timeout: 10000 });

    const firstRow     = page.locator('#Applications tbody tr').first();
    await expect(firstRow).toBeVisible({ timeout: 5000 });
    const deletedName  = (await firstRow.locator('td').nth(1).textContent())?.trim() ?? '';
    console.log(`Deleting row: "${deletedName}"`);

    const deleteButton = firstRow.locator('.btn-delete');
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    await deleteButton.click();

    const confirmButton = page.locator('.swal2-confirm');
    await expect(confirmButton).toBeVisible({ timeout: 6000 });
    await confirmButton.click();

    const successAlert = page.locator('.swal2-success');
    await expect(successAlert).toBeVisible({ timeout: 6000 });

    const okButton = page.locator('button:has-text("OK")');
    if (await okButton.isVisible()) await okButton.click();

    await page.waitForLoadState('networkidle');

    if (deletedName) {
        await expect(
            page.locator('#Applications tbody tr').filter({ hasText: deletedName })
        ).toHaveCount(0, { timeout: 5000 });
        console.log(`✅ Row "${deletedName}" no longer in table`);
    }

    console.log('✅ TC_AF_07 Passed');
});

// ─────────────────────────────────────────────────────────────────────────────
// TC_AF_08: Verify Cancel button functionality (listing page)
// ─────────────────────────────────────────────────────────────────────────────
test('TC_AF_08: Verify Cancel button functionality', async ({ page }) => {

    await loginIfNeeded(page);

    await expect(page.locator('h3:has-text("Flow Details")')).toBeVisible({ timeout: 10000 });

    const rowsBefore = await page.locator('#Applications tbody tr').count();

    await page.click('text="Add New"');
    await page.waitForURL('**/admin/add_flow_details');

    const uniqueName  = `CancelTest_${Date.now()}`;
    const nameField   = page.locator('input[name*="name"], input[name*="title"]').first();
    if (await nameField.isVisible()) await nameField.fill(uniqueName);

    const amountField = page.locator('input[name*="amount"], #amount');
    if (await amountField.isVisible()) await amountField.fill('99999');

    const cancelButton = page.locator('a:has-text("Back"), a:has-text("Cancel"), .btn-secondary').first();
    await cancelButton.click();

    if (!page.url().includes('approval_flow')) {
        await page.goto(`${BASE_URL}/admin/approval_flow`);
    }
    await page.waitForLoadState('networkidle');

    const rowsAfter = await page.locator('#Applications tbody tr').count();
    expect(rowsAfter).toBe(rowsBefore);
    await expect(page.locator('#Applications tbody')).not.toContainText(uniqueName);

    console.log('✅ TC_AF_08 Passed');
});

// ─────────────────────────────────────────────────────────────────────────────
// TC_AF_09: Verify logout redirects to login page
// ─────────────────────────────────────────────────────────────────────────────
test('TC_AF_09: Verify logout redirects to login page', async ({ page }) => {

    await loginIfNeeded(page);

    await expect(page.locator('h3:has-text("Flow Details")')).toBeVisible({ timeout: 10000 });

    // 1. Click the Logout link in the sidebar
    const sidebarLogout = page.getByRole('listitem').filter({ hasText: 'Logout' });
    await sidebarLogout.click();

    // 2. Handle the Confirmation dialog
    const confirmationDialog = page.getByRole('dialog', { name: /Confirm Logout/i });
    const finalLogoutLink = confirmationDialog.getByRole('link', { name: 'Logout' });
    await expect(finalLogoutLink).toBeVisible();
    await finalLogoutLink.click();

    // 3. Verify redirection to login page
    const loginButton = page.getByRole('button', { name: 'Log In' });
    await expect(loginButton).toBeVisible({ timeout: 7000 });
    await expect(page).toHaveURL(/.*login/);
    console.log('✅ Login page visible after logout');

    // 4. Session cleared check
    await page.goto(`${BASE_URL}/admin/approval_flow`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });

    console.log('✅ TC_AF_09 Passed');
});

// ─────────────────────────────────────────────────────────────────────────────
// TC_AAF_10: Verify Logout button functionality (extended checks)
// ─────────────────────────────────────────────────────────────────────────────
test('TC_AAF_10: Verify Logout button functionality', async ({ page }) => {

    await loginIfNeeded(page);

    // 1. Navigate to the Approval Flow page
    await page.goto(`${BASE_URL}/admin/approval_flow`, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h3:has-text("Flow Details")')).toBeVisible({ timeout: 10000 });
    console.log('✅ Approval Flow listing page loaded');

    // 2. Click the Logout link in the sidebar
    const sidebarLogout = page.getByRole('listitem').filter({ hasText: 'Logout' });
    await sidebarLogout.click();

    // 3. Handle the Confirmation dialog
    const confirmationDialog = page.getByRole('dialog', { name: /Confirm Logout/i });
    await expect(confirmationDialog.locator('.modal-title')).toContainText(/confirm logout/i);
    await expect(confirmationDialog.locator('.modal-body p')).toContainText(/are you sure you want to logout/i);
    console.log('✅ Modal content verified');

    const finalLogoutLink = confirmationDialog.getByRole('link', { name: 'Logout' });
    await expect(finalLogoutLink).toBeVisible();
    await finalLogoutLink.click();

    // 4. Verify redirection to login page
    const loginButton = page.getByRole('button', { name: 'Log In' });
    await expect(loginButton).toBeVisible({ timeout: 7000 });
    await expect(page).toHaveURL(/.*login/);
    console.log('✅ Login form visible');

    // 5. Verify session is cleared by trying to access protected page
    await page.goto(`${BASE_URL}/admin/approval_flow`);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
    console.log('✅ Session cleared');

    console.log('✅ TC_AAF_10 Passed');
});
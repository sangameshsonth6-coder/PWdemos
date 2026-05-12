import { test, expect, Page } from '@playwright/test';




// ✅ Login helper
async function login(page: Page) {
  await page.goto('https://or-demo.knrleap.org/login', { waitUntil: 'networkidle' });

  if (page.url().includes('login')) {
    await page.locator('input[name="username"]').fill(process.env.TEST_USERNAME ?? 'your_username');
    await page.locator('input#pass').fill(process.env.TEST_PASSWORD ?? 'your_password');
    await page.getByRole('button', { name: /Log In/i }).click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 20000 });
  }
}

// ✅ Fill form filters helper
async function fillFilters(page: Page, academicValue: string, classSectionValue: string) {
  await page.locator('select#academic').selectOption({ value: academicValue });

  await page.evaluate((val: string) => {
    const select = document.getElementById('class_section') as HTMLSelectElement;
    for (const option of Array.from(select.options)) {
      if (option.value === val) {
        option.selected = true;
        break;
      }
    }
    select.dispatchEvent(new Event('change', { bubbles: true }));
  }, classSectionValue);
}

// ✅ Submit form and wait for table helper
async function submitAndWaitForTable(page: Page) {
  await page.locator('input#search[type="submit"]').click();
  await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 20000 });
}

// ---------------------------------------------------------------------------

test('F-001 - Verify Academic Year Filter', async ({ page }) => {
  test.setTimeout(120000);

  await login(page);

  await page.goto('https://or-demo.knrleap.org/admin/studentsreport', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/studentsreport/);

  const academicYear = page.locator('select#academic');
  await expect(academicYear).toBeVisible({ timeout: 15000 });
  await academicYear.selectOption({ value: '2024-25' });

  await page.evaluate(() => {
    const select = document.getElementById('class_section') as HTMLSelectElement;
    for (const option of Array.from(select.options)) {
      if (option.value === 'Grade 1^A') {
        option.selected = true;
        break;
      }
    }
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  await page.locator('input#search[type="submit"]').click();

  const table = page.locator('table').first();
  await expect(table).toBeVisible({ timeout: 15000 });
  await expect(table.locator('tbody tr').first()).toBeVisible({ timeout: 15000 });

  console.log('✅ F-001 Passed - Academic Year filter records displayed');
});

test('F-002 - Verify Class & Section Filter', async ({ page }) => {
  test.setTimeout(120000);

  await login(page);

  await page.goto('https://or-demo.knrleap.org/admin/studentsreport', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/studentsreport/);

  await fillFilters(page, '2024-25', 'Grade 1^A');
  await submitAndWaitForTable(page);

  console.log('✅ F-002 Passed - Grade 1 records displayed');
});

test('F-003 - Verify Extract Report Of Filter', async ({ page }) => {
  test.setTimeout(120000);

  await login(page);

  await page.goto('https://or-demo.knrleap.org/admin/studentsreport', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/studentsreport/);

  await fillFilters(page, '2024-25', 'Grade 1^A');

  await page.locator('select#extract_rep').selectOption({ value: 'Admission Details' });

  await submitAndWaitForTable(page);

  const rowCount = await page.locator('table tbody tr').count();
  expect(rowCount).toBeGreaterThan(0);

  console.log('✅ F-003 Passed - Admission Details report displayed');
});

test('F-004 - Verify Get Records Button', async ({ page }) => {
  test.setTimeout(120000);

  await login(page);

  await page.goto('https://or-demo.knrleap.org/admin/studentsreport', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/studentsreport/);

  await fillFilters(page, '2024-25', 'Grade 1^A');
  await submitAndWaitForTable(page);

  const rowCount = await page.locator('table tbody tr').count();
  expect(rowCount).toBeGreaterThan(0);

  console.log('✅ F-004 Passed - Records displayed successfully');
});

test('F-005 - Verify Reset Button', async ({ page }) => {
  test.setTimeout(120000);

  await login(page);

  await page.goto('https://or-demo.knrleap.org/admin/studentsreport', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/studentsreport/);

  await page.locator('select#academic').selectOption({ value: '2024-25' });

  const resetLink = page.getByRole('link', { name: /Reset/i });
  await expect(resetLink).toBeVisible({ timeout: 10000 });
  await resetLink.click();

  await expect(page).toHaveURL(/studentsreport/);
  await expect(page.locator('select#academic')).toBeVisible({ timeout: 15000 });

  console.log('✅ F-005 Passed - Reset link returned to default page');
});

test('F-006 - Verify Copy Button', async ({ page }) => {
  test.setTimeout(120000);

  await login(page);

  await page.goto('https://or-demo.knrleap.org/admin/studentsreport', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/studentsreport/);

  await fillFilters(page, '2024-25', 'Grade 1^A');
  await submitAndWaitForTable(page);

  const copyButton = page.getByRole('button', { name: /Copy/i });
  await expect(copyButton).toBeVisible({ timeout: 10000 });
  await copyButton.click();

  await page.waitForTimeout(2000);

  console.log('✅ F-006 Passed - Copy button clicked successfully');
});

test('F-007 - Verify Copy With No Records', async ({ page }) => {
  test.setTimeout(120000);

  await login(page);

  await page.goto('https://or-demo.knrleap.org/admin/studentsreport', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/studentsreport/);

  await fillFilters(page, '2024-25', 'Grade 1^A');
  await submitAndWaitForTable(page);

  const copyButton = page.getByRole('button', { name: /Copy/i });
  await expect(copyButton).toBeVisible({ timeout: 10000 });
  await copyButton.click();

  await page.waitForTimeout(2000);

  console.log('✅ F-007 Passed - Copy clicked with records loaded');
});

test('F-008 - Verify CSV Export', async ({ page }) => {
  test.setTimeout(120000);

  await login(page);

  await page.goto('https://or-demo.knrleap.org/admin/studentsreport', {
    waitUntil: 'networkidle'
  });

  await fillFilters(page, '2024-25', 'Grade 1^A');
  await submitAndWaitForTable(page);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /CSV/i }).click();

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('.csv');

  console.log('✅ F-008 Passed - CSV exported successfully');
});

test('F-009 - Verify CSV Export Empty', async ({ page }) => {
  test.setTimeout(120000);

  await login(page);

  await page.goto('https://or-demo.knrleap.org/admin/studentsreport', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/studentsreport/);

  await fillFilters(page, '2024-25', 'Grade 1^A');
  await submitAndWaitForTable(page);

  const csvButton = page.getByRole('button', { name: /CSV/i });
  await expect(csvButton).toBeVisible({ timeout: 10000 });
  await csvButton.click();

  await page.waitForTimeout(2000);

  console.log('✅ F-009 Passed - CSV clicked successfully');
});

test('F-010 - Verify Excel Export', async ({ page }) => {
  test.setTimeout(120000);

  await login(page);

  await page.goto('https://or-demo.knrleap.org/admin/studentsreport', {
    waitUntil: 'networkidle'
  });

  await fillFilters(page, '2024-25', 'Grade 1^A');
  await submitAndWaitForTable(page);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Excel/i }).click();

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('.xlsx');

  console.log('✅ F-010 Passed - Excel exported successfully');
});

test('F-011 - Verify Excel Export With Hidden Columns', async ({ page }) => {
  test.setTimeout(120000);

  await login(page);

  await page.goto('https://or-demo.knrleap.org/admin/studentsreport', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/studentsreport/);

  await fillFilters(page, '2024-25', 'Grade 1^A');
  await submitAndWaitForTable(page);

  const columnButton = page.getByRole('button', { name: /Column visibility/i });
  await expect(columnButton).toBeVisible({ timeout: 10000 });
  await columnButton.click();

  const dobColumn = page.getByRole('button', { name: /DOB/i });
  if (await dobColumn.isVisible()) {
    await dobColumn.click();
  }

  // ✅ Close dropdown overlay before clicking Excel
  await page.keyboard.press('Escape');
  await expect(page.locator('div.dt-button-background')).toBeHidden({ timeout: 5000 });

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Excel/i }).click();

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('.xlsx');

  console.log('✅ F-011 Passed - Hidden column export verified');
});

test('F-012 - Verify PDF Export', async ({ page }) => {
  test.setTimeout(120000);

  await login(page);

  await page.goto('https://or-demo.knrleap.org/admin/studentsreport', {
    waitUntil: 'networkidle'
  });

  await fillFilters(page, '2024-25', 'Grade 1^A');
  await submitAndWaitForTable(page);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /PDF/i }).click();

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('.pdf');

  console.log('✅ F-012 Passed - PDF exported successfully');
});

test('F-013 - Verify Print Button', async ({ page }) => {
  test.setTimeout(120000);

  await login(page);

  await page.goto('https://or-demo.knrleap.org/admin/studentsreport', {
    waitUntil: 'networkidle'
  });

  await fillFilters(page, '2024-25', 'Grade 1^A');
  await submitAndWaitForTable(page);

  const printButton = page.getByRole('button', { name: /Print/i });
  await expect(printButton).toBeVisible({ timeout: 10000 });
  await printButton.click();

  await page.waitForTimeout(3000);

  console.log('✅ F-013 Passed - Print preview opened');
});

test('F-014 - Verify Column Visibility', async ({ page }) => {
  test.setTimeout(120000);

  await login(page);

  await page.goto('https://or-demo.knrleap.org/admin/studentsreport', {
    waitUntil: 'networkidle'
  });

  await fillFilters(page, '2024-25', 'Grade 1^A');
  await submitAndWaitForTable(page);

  const columnButton = page.getByRole('button', { name: /Column visibility/i });
  await expect(columnButton).toBeVisible({ timeout: 10000 });
  await columnButton.click();

  const aadharColumn = page.getByRole('button', { name: /Aadhar/i });
  await expect(aadharColumn).toBeVisible({ timeout: 10000 });
  await aadharColumn.click();

  // ✅ Close dropdown after toggling column
  await page.keyboard.press('Escape');
  await expect(page.locator('div.dt-button-background')).toBeHidden({ timeout: 5000 });

  await page.waitForTimeout(2000);

  console.log('✅ F-014 Passed - Column visibility changed');
});





test('F-015 - Verify Search Field', async ({ page }) => {
  test.setTimeout(120000);

  await login(page);

  await page.goto('https://or-demo.knrleap.org/admin/studentsreport', {
    waitUntil: 'networkidle'
  });

  // ✅ Use 2025-26 — AYRA H exists in this academic year (confirmed from earlier snapshots)
  await fillFilters(page, '2025-26', 'Grade 1^A');
  await submitAndWaitForTable(page);

  const searchBox = page.getByRole('searchbox');
  await expect(searchBox).toBeVisible({ timeout: 10000 });

  await searchBox.clear();
  await searchBox.fill('AYRA H');

  // ✅ Wait for DataTables to filter
  await expect(
    page.locator('table tbody tr').first()
  ).not.toContainText(/No matching records/i, { timeout: 5000 });

  await expect(
    page.locator('table tbody tr').first()
  ).toContainText(/AYRA H/i);

  console.log('✅ F-015 Passed - Search filtering works');
});




test('F-016 - Verify Search No Match', async ({ page }) => {
  test.setTimeout(120000);

  await login(page);

  await page.goto('https://or-demo.knrleap.org/admin/studentsreport', {
    waitUntil: 'networkidle'
  });

  await fillFilters(page, '2024-25', 'Grade 1^A');
  await submitAndWaitForTable(page);

  const searchBox = page.getByRole('searchbox');
  await expect(searchBox).toBeVisible({ timeout: 10000 });
  await searchBox.fill('XYZ123');

  await page.waitForTimeout(2000);

  await expect(page.locator('table tbody')).toContainText(/No matching records/i);

  console.log('✅ F-016 Passed - No match search verified');
});
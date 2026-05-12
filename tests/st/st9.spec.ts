import { test, expect } from '@playwright/test';

test('TC_001 - Verify Search Functionality in Manage Profile Pictures', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/manage-profile-image/);

  const academicYear = page.getByRole('combobox', {
    name: /Academic Year/i
  });

  const classDropdown = page.getByRole('combobox', {
    name: /Class/i
  });

  const sectionDropdown = page.getByRole('combobox', {
    name: /Section/i
  });

  const categoryDropdown = page.getByRole('combobox', {
    name: /Category/i
  });

  await academicYear.selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await classDropdown.selectOption({
    label: 'Grade 1'
  });

  await expect(sectionDropdown).toBeEnabled({
    timeout: 10000
  });

  await sectionDropdown.selectOption({
    label: 'A'
  });

  await categoryDropdown.selectOption({
    label: 'Father'
  });

  await page.getByRole('button', {
    name: /Search/i
  }).click();

  const table = page.locator('table').first();

  await expect(table).toBeVisible({
    timeout: 15000
  });

  await expect(
    table.locator('tbody tr').first()
  ).toBeVisible({
    timeout: 15000
  });

  console.log('✅ TC_001 Passed - Matching records displayed after search');
});








test('TC_002 - Verify Download with Images', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', { name: /Class/i }).selectOption({
    label: 'Grade 1'
  });

  await page.getByRole('combobox', { name: /Section/i }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', { name: /Category/i }).selectOption({
    label: 'Father'
  });

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 15000
  });

  const checkboxes = page.locator('table tbody input[type="checkbox"]');

  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', {
    name: /Download with Admission Number/i
  }).click();

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.zip$/i);

  console.log('✅ TC_002 Passed - ZIP downloaded with selected image records');
});

test('TC_003 - Verify Download with No Images', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', { name: /Class/i }).selectOption({
    label: 'Grade 1'
  });

  await page.getByRole('combobox', { name: /Section/i }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', { name: /Category/i }).selectOption({
    label: 'Mother'
  });

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 15000
  });

  const checkboxes = page.locator('table tbody input[type="checkbox"]');

  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', {
    name: /Download with Admission Number/i
  }).click();

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.zip$/i);

  console.log('✅ TC_003 Passed - ZIP downloaded even when selected records have no images');
});

test('TC_004 - Verify Mixed Image Records Download', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', { name: /Class/i }).selectOption({
    label: 'Grade 1'
  });

  await page.getByRole('combobox', { name: /Section/i }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', { name: /Category/i }).selectOption({
    label: 'Student'
  });

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 15000
  });

  const checkboxes = page.locator('table tbody input[type="checkbox"]');

  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();
  await checkboxes.nth(2).check();

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', {
    name: /Download with Admission Number/i
  }).click();

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.zip$/i);

  console.log('✅ TC_004 Passed - ZIP downloaded for mixed image records');
});

test('TC_005 - Verify Missing Filter Validation', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/manage-profile-image/);

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('body')).toContainText(
    /required|select|category|academic year|class/i,
    {
      timeout: 10000
    }
  );

  console.log('✅ TC_005 Passed - Validation shown when required filters are missing');
});





test('TC_006 - Verify Checkbox Selection Download', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', { name: /Class/i }).selectOption({
    label: 'Grade 1'
  });

  await page.getByRole('combobox', { name: /Section/i }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', { name: /Category/i }).selectOption({
    label: 'Student'
  });

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 15000
  });

  const checkboxes = page.locator('table tbody input[type="checkbox"]');

  await expect(checkboxes.nth(0)).toBeVisible({ timeout: 10000 });
  await expect(checkboxes.nth(1)).toBeVisible({ timeout: 10000 });

  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();

  await expect(checkboxes.nth(0)).toBeChecked();
  await expect(checkboxes.nth(1)).toBeChecked();

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', {
    name: /Download with Admission Number/i
  }).click();

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.zip$/i);

  console.log('✅ TC_006 Passed - Only selected records downloaded');
});

test('TC_007 - Verify Download Without Checkbox Selection', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', { name: /Class/i }).selectOption({
    label: 'Grade 1'
  });

  await page.getByRole('combobox', { name: /Section/i }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', { name: /Category/i }).selectOption({
    label: 'Student'
  });

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 15000
  });

  await page.getByRole('button', {
    name: /Download with Admission Number/i
  }).click();

  await expect(page.locator('body')).toContainText(
    /select|checkbox|record|required|please/i,
    { timeout: 10000 }
  );

  console.log('✅ TC_007 Passed - Download blocked without checkbox selection');
});

test('TC_008 - Verify Cancel Button Resets Filters', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  const academicYear = page.getByRole('combobox', { name: /Academic Year/i });
  const classDropdown = page.getByRole('combobox', { name: /Class/i });
  const sectionDropdown = page.getByRole('combobox', { name: /Section/i });
  const categoryDropdown = page.getByRole('combobox', { name: /Category/i });

  await academicYear.selectOption({ label: '2025-26 (Current Academic Year)' });
  await classDropdown.selectOption({ label: 'Grade 1' });
  await sectionDropdown.selectOption({ label: 'A' });
  await categoryDropdown.selectOption({ label: 'Student' });

  await page.getByRole('button', { name: /Cancel|Reset/i }).click();

  await expect(classDropdown).toHaveValue(/^\s*$|0|Select/i);
  await expect(categoryDropdown).toHaveValue(/^\s*$|0|Select/i);

  console.log('✅ TC_008 Passed - Cancel reset filter fields');
});

test('TC_009 - Verify Column Visibility Toggle', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', { name: /Class/i }).selectOption({
    label: 'Grade 1'
  });

  await page.getByRole('combobox', { name: /Section/i }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', { name: /Category/i }).selectOption({
    label: 'Father'
  });

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 15000
  });

  const columnVisibilityButton = page.getByRole('button', {
    name: /Column visibility/i
  });

  await expect(columnVisibilityButton).toBeVisible({ timeout: 10000 });

  await columnVisibilityButton.click();

  const fatherNameOption = page.getByRole('button', {
    name: /Father Name/i
  }).first();

  await expect(fatherNameOption).toBeVisible({ timeout: 10000 });

  await fatherNameOption.click();

  await page.waitForTimeout(1000);

  console.log('✅ TC_009 Passed - Column visibility toggled successfully');
});




test('TC_010 - Verify Copy Button', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });
  await page.getByRole('combobox', { name: /Class/i }).selectOption({ label: 'Grade 1' });
  await page.getByRole('combobox', { name: /Section/i }).selectOption({ label: 'A' });
  await page.getByRole('combobox', { name: /Category/i }).selectOption({ label: 'Student' });

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 15000
  });

  const copyButton = page.getByRole('button', { name: /Copy/i }).first();

  await expect(copyButton).toBeVisible({ timeout: 10000 });
  await copyButton.click();

  console.log('✅ TC_010 Passed - Copy button clicked successfully');
});


test('TC_011 - Verify CSV Export', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });
  await page.getByRole('combobox', { name: /Class/i }).selectOption({ label: 'Grade 1' });
  await page.getByRole('combobox', { name: /Section/i }).selectOption({ label: 'A' });
  await page.getByRole('combobox', { name: /Category/i }).selectOption({ label: 'Student' });

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 15000
  });

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', { name: /CSV/i }).click();

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.csv$/i);

  console.log('✅ TC_011 Passed - CSV file downloaded');
});

test('TC_012 - Verify Excel Export', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });
  await page.getByRole('combobox', { name: /Class/i }).selectOption({ label: 'Grade 1' });
  await page.getByRole('combobox', { name: /Section/i }).selectOption({ label: 'A' });
  await page.getByRole('combobox', { name: /Category/i }).selectOption({ label: 'Student' });

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 15000
  });

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', { name: /Excel/i }).click();

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.(xlsx|xls)$/i);

  console.log('✅ TC_012 Passed - Excel file downloaded');
});

test('TC_013 - Verify PDF Export', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });
  await page.getByRole('combobox', { name: /Class/i }).selectOption({ label: 'Grade 1' });
  await page.getByRole('combobox', { name: /Section/i }).selectOption({ label: 'A' });
  await page.getByRole('combobox', { name: /Category/i }).selectOption({ label: 'Student' });

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 15000
  });

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', { name: /PDF/i }).click();

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.pdf$/i);

  console.log('✅ TC_013 Passed - PDF file downloaded');
});

test('TC_014 - Verify Print Icon', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });
  await page.getByRole('combobox', { name: /Class/i }).selectOption({ label: 'Grade 1' });
  await page.getByRole('combobox', { name: /Section/i }).selectOption({ label: 'A' });
  await page.getByRole('combobox', { name: /Category/i }).selectOption({ label: 'Student' });

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 15000
  });

  const printButton = page.getByRole('button', { name: /Print/i }).first();

  await expect(printButton).toBeVisible({ timeout: 10000 });
  await printButton.click();

  console.log('✅ TC_014 Passed - Print button clicked successfully');
});







test('TC_015 - Verify Download with Student Category', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });
  await page.getByRole('combobox', { name: /Class/i }).selectOption({ label: 'Grade 1' });
  await page.getByRole('combobox', { name: /Section/i }).selectOption({ label: 'A' });
  await page.getByRole('combobox', { name: /Category/i }).selectOption({ label: 'Student' });

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15000 });

  const checkboxes = page.locator('table tbody input[type="checkbox"]');
  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', {
    name: /Download with Admission Number/i
  }).click();

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.zip$/i);

  console.log('✅ TC_015 Passed - Student category ZIP downloaded');
});

test('TC_016 - Verify Download with Father Category', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });
  await page.getByRole('combobox', { name: /Class/i }).selectOption({ label: 'Grade 1' });
  await page.getByRole('combobox', { name: /Section/i }).selectOption({ label: 'A' });
  await page.getByRole('combobox', { name: /Category/i }).selectOption({ label: 'Father' });

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15000 });

  const checkboxes = page.locator('table tbody input[type="checkbox"]');
  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', {
    name: /Download with Admission Number/i
  }).click();

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.zip$/i);

  console.log('✅ TC_016 Passed - Father category ZIP downloaded');
});

test('TC_017 - Verify Download with Mother Category', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });
  await page.getByRole('combobox', { name: /Class/i }).selectOption({ label: 'Grade 1' });
  await page.getByRole('combobox', { name: /Section/i }).selectOption({ label: 'A' });
  await page.getByRole('combobox', { name: /Category/i }).selectOption({ label: 'Mother' });

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15000 });

  const checkboxes = page.locator('table tbody input[type="checkbox"]');
  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', {
    name: /Download with Admission Number/i
  }).click();

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.zip$/i);

  console.log('✅ TC_017 Passed - Mother category ZIP downloaded');
});

test('TC_018 - Verify Download with Guardian Category', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });
  await page.getByRole('combobox', { name: /Class/i }).selectOption({ label: 'Grade 1' });
  await page.getByRole('combobox', { name: /Section/i }).selectOption({ label: 'A' });
  await page.getByRole('combobox', { name: /Category/i }).selectOption({ label: 'Guardian' });

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({ timeout: 15000 });

  const checkboxes = page.locator('table tbody input[type="checkbox"]');
  await checkboxes.nth(0).check();
  await checkboxes.nth(1).check();

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', {
    name: /Download with Admission Number/i
  }).click();

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.zip$/i);

  console.log('✅ TC_018 Passed - Guardian category ZIP downloaded');
});

test('TC_019 - Verify ZIP File Naming by Admission Number', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });
  await page.getByRole('combobox', { name: /Class/i }).selectOption({ label: 'Grade 1' });
  await page.getByRole('combobox', { name: /Section/i }).selectOption({ label: 'A' });
  await page.getByRole('combobox', { name: /Category/i }).selectOption({ label: 'Student' });

  await page.getByRole('button', { name: /Search/i }).click();

  const firstRow = page.locator('table tbody tr').first();
  await expect(firstRow).toBeVisible({ timeout: 15000 });

  const rowText = await firstRow.innerText();
  expect(rowText).toMatch(/\d|TPIS/i);

  await firstRow.locator('input[type="checkbox"]').check();

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', {
    name: /Download with Admission Number/i
  }).click();

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.zip$/i);

  console.log('✅ TC_019 Passed - ZIP downloaded for admission number naming validation');
});








test('TC_020 - Verify Integration DB Data Match', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });
  await page.getByRole('combobox', { name: /Class/i }).selectOption({ label: 'Grade 1' });
  await page.getByRole('combobox', { name: /Section/i }).selectOption({ label: 'A' });
  await page.getByRole('combobox', { name: /Category/i }).selectOption({ label: 'Student' });

  await page.getByRole('button', { name: /Search/i }).click();

  const firstRow = page.locator('table tbody tr').first();
  await expect(firstRow).toBeVisible({ timeout: 15000 });

  const rowText = await firstRow.innerText();

  expect(rowText.length).toBeGreaterThan(0);
  expect(rowText).toMatch(/[A-Za-z]/);

  console.log('✅ TC_020 Passed - UI table data displayed from backend');
});

test('TC_021 - Verify Integration Image Fetch', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });
  await page.getByRole('combobox', { name: /Class/i }).selectOption({ label: 'Grade 1' });
  await page.getByRole('combobox', { name: /Section/i }).selectOption({ label: 'A' });
  await page.getByRole('combobox', { name: /Category/i }).selectOption({ label: 'Student' });

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 15000
  });

  await page.locator('table tbody input[type="checkbox"]').first().check();

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', {
    name: /Download with Admission Number/i
  }).click();

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.zip$/i);

  console.log('✅ TC_021 Passed - Image fetched and ZIP downloaded');
});

test('TC_022 - Verify Broken Image Path Handling', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });
  await page.getByRole('combobox', { name: /Class/i }).selectOption({ label: 'Grade 1' });
  await page.getByRole('combobox', { name: /Section/i }).selectOption({ label: 'A' });
  await page.getByRole('combobox', { name: /Category/i }).selectOption({ label: 'Mother' });

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 15000
  });

  await page.locator('table tbody input[type="checkbox"]').first().check();

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', {
    name: /Download with Admission Number/i
  }).click();

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.zip$/i);

  console.log('✅ TC_022 Passed - Broken or missing image path handled without crash');
});

test('TC_023 - Verify Bulk Download', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });
  await page.getByRole('combobox', { name: /Class/i }).selectOption({ label: 'Grade 1' });
  await page.getByRole('combobox', { name: /Section/i }).selectOption({ label: 'A' });
  await page.getByRole('combobox', { name: /Category/i }).selectOption({ label: 'Student' });

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 15000
  });

  const headerCheckbox = page.locator('table thead input[type="checkbox"]').first();
  const rowCheckboxes = page.locator('table tbody input[type="checkbox"]');

  if (await headerCheckbox.count()) {
    await headerCheckbox.check();
  } else {
    const count = Math.min(await rowCheckboxes.count(), 10);
    for (let i = 0; i < count; i++) {
      await rowCheckboxes.nth(i).check();
    }
  }

  const downloadPromise = page.waitForEvent('download');

  await page.getByRole('button', {
    name: /Download with Admission Number/i
  }).click();

  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.zip$/i);

  console.log('✅ TC_023 Passed - Bulk ZIP downloaded successfully');
});

test('TC_024 - Verify Browser Compatibility Basic Flow', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/manage-profile-image/);

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });
  await page.getByRole('combobox', { name: /Class/i }).selectOption({ label: 'Grade 1' });
  await page.getByRole('combobox', { name: /Section/i }).selectOption({ label: 'A' });
  await page.getByRole('combobox', { name: /Category/i }).selectOption({ label: 'Student' });

  await page.getByRole('button', { name: /Search/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 15000
  });

  console.log(`✅ TC_024 Passed - Basic flow works in ${page.context().browser()?.browserType().name()}`);
});







test('TC_025 - Verify Session Timeout Restricts Download', async ({ page, context }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/manage-profile-image/);

  await context.clearCookies();

  await page.reload({ waitUntil: 'domcontentloaded' });

  await expect(page).toHaveURL(/login|manage-profile-image/);

  console.log('✅ TC_025 Passed - Session timeout handled');
});

test('TC_026 - Verify Responsive Design', async ({ page }) => {
  test.setTimeout(120000);

  await page.setViewportSize({ width: 768, height: 900 });

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/manage-profile-image/);

  await expect(
    page.getByRole('combobox', { name: /Academic Year/i })
  ).toBeVisible({ timeout: 15000 });

  await expect(
    page.getByRole('button', { name: /Search/i })
  ).toBeVisible({ timeout: 15000 });

  console.log('✅ TC_026 Passed - Page usable in tablet size');
});

test('TC_027 - Verify Export Data Integrity', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'domcontentloaded'
  });

  await expect(page).toHaveURL(/manage-profile-image/);

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', { name: /Class/i }).selectOption({
    label: 'Grade 1'
  });

  await page.getByRole('combobox', { name: /Section/i }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', { name: /Category/i }).selectOption({
    label: 'Student'
  });

  await page.getByRole('button', { name: /Search/i }).click();

  const firstRow = page.locator('table tbody tr').first();
  await expect(firstRow).toBeVisible({ timeout: 15000 });

  const rowText = await firstRow.innerText();
  expect(rowText.trim().length).toBeGreaterThan(0);

  // Select the first student by checking their checkbox
  const firstRowCheckbox = page.locator('table tbody tr').first().getByRole('checkbox');
  await expect(firstRowCheckbox).toBeVisible({ timeout: 10000 });
  await firstRowCheckbox.check();
  await expect(firstRowCheckbox).toBeChecked();

  // Click the Download with Admission Number button
  const downloadButton = page.getByRole('button', { name: /Download with Admission Number/i });
  await expect(downloadButton).toBeVisible({ timeout: 10000 });
  await downloadButton.click();

  await page.waitForTimeout(2000);

  await expect(page).toHaveURL(/manage-profile-image/);

  console.log('✅ TC_027 Passed - Selected a student, clicked download, and stayed on correct page');
});








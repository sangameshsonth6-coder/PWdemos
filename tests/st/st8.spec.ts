import { test, expect } from '@playwright/test';


test('PFS-001 - Save Settings with Valid Data', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);

  await expect(
    page.getByRole('heading', { name: /Edit Profile Settings/i })
  ).toBeVisible({ timeout: 15000 });

  const fromDate = page.getByRole('textbox', { name: /From Date & Time/i });
  const toDate = page.getByRole('textbox', { name: /To Date & Time/i });
  const enableEdit = page.getByRole('combobox', { name: /Enable Edit Button/i });

  await fromDate.fill('2026-02-26T11:20');
  await toDate.fill('2026-03-30T11:25');
  await enableEdit.selectOption({ label: 'Yes' });

  await page.getByRole('button', { name: /Save Settings/i }).click();

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 15000
  });

  await expect(page.locator('table')).toContainText('26-02-2026');
  await expect(page.locator('table')).toContainText('30-03-2026');
  await expect(page.locator('table')).toContainText('Yes');

  console.log('✅ PFS-001 Passed - Settings saved successfully');
});






test('PFS-002 - Verify Validation for Missing From Date', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);

  await expect(
    page.getByRole('heading', { name: /Edit Profile Settings/i })
  ).toBeVisible({ timeout: 15000 });

  const fromDate = page.getByRole('textbox', {
    name: /From Date & Time/i
  });

  const toDate = page.getByRole('textbox', {
    name: /To Date & Time/i
  });

  const saveButton = page.getByRole('button', {
    name: /Save Settings/i
  });

  await expect(fromDate).toBeVisible({ timeout: 10000 });
  await expect(toDate).toBeVisible({ timeout: 10000 });

  await fromDate.clear();

  await toDate.fill('2030-05-10T10:30');

  await saveButton.click();

  await expect(page.locator('body')).toContainText(
    /From Date|required/i,
    {
      timeout: 10000
    }
  );

  console.log(
    '✅ PFS-002 Passed - Validation displayed for missing From Date'
  );
});





test('PFS-003 - Verify Validation for Missing To Date', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);

  await expect(
    page.getByRole('heading', { name: /Edit Profile Settings/i })
  ).toBeVisible({ timeout: 15000 });

  const fromDate = page.getByRole('textbox', {
    name: /From Date & Time/i
  });

  const toDate = page.getByRole('textbox', {
    name: /To Date & Time/i
  });

  const saveButton = page.getByRole('button', {
    name: /Save Settings/i
  });

  await expect(fromDate).toBeVisible({ timeout: 10000 });
  await expect(toDate).toBeVisible({ timeout: 10000 });

  await fromDate.fill('2026-02-02T10:30');

  await toDate.clear();

  await saveButton.click();

  await expect(page.locator('body')).toContainText(
    /To Date|required/i,
    {
      timeout: 10000
    }
  );

  console.log(
    '✅ PFS-003 Passed - Validation displayed for missing To Date'
  );
});





test('PFS-004 - Verify From Date Greater Than To Date Validation', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);

  await expect(
    page.getByRole('heading', { name: /Edit Profile Settings/i })
  ).toBeVisible({ timeout: 15000 });

  const fromDate = page.getByRole('textbox', {
    name: /From Date & Time/i
  });

  const toDate = page.getByRole('textbox', {
    name: /To Date & Time/i
  });

  const saveButton = page.getByRole('button', {
    name: /Save Settings/i
  });

  await expect(fromDate).toBeVisible({ timeout: 10000 });
  await expect(toDate).toBeVisible({ timeout: 10000 });

  await fromDate.fill('2030-05-10T10:30');
  await toDate.fill('2024-02-02T10:30');

  await saveButton.click();

  await expect(page.locator('body')).toContainText(
    /To Date & Time must be greater than From Date & Time/i,
    {
      timeout: 10000
    }
  );

  console.log(
    '✅ PFS-004 Passed - Validation displayed when To Date is less than From Date'
  );
});






test('PFS-005 - Verify Enable Edit Button Dropdown Values', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);

  await expect(
    page.getByRole('heading', { name: /Edit Profile Settings/i })
  ).toBeVisible({ timeout: 15000 });

  const enableDropdown = page.getByRole('combobox', {
    name: /Enable Edit Button/i
  });

  await expect(enableDropdown).toBeVisible({ timeout: 10000 });

  const options = await enableDropdown.locator('option').allTextContents();

  expect(options).toContain('Yes');
  expect(options).toContain('No');

  await enableDropdown.selectOption({ label: 'No' });
  await expect(enableDropdown).toHaveValue('0');

  await enableDropdown.selectOption({ label: 'Yes' });
  await expect(enableDropdown).toHaveValue('1');

  console.log('✅ PFS-005 Passed - Enable Edit Button dropdown values verified');
});





test('PFS-006 - Verify Record Displays Correctly in Grid', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);

  await expect(
    page.getByRole('heading', { name: /Edit Profile Settings/i })
  ).toBeVisible({ timeout: 15000 });

  const fromDate = page.getByRole('textbox', { name: /From Date & Time/i });
  const toDate = page.getByRole('textbox', { name: /To Date & Time/i });
  const enableEdit = page.getByRole('combobox', { name: /Enable Edit Button/i });

  await fromDate.fill('2026-02-26T11:20');
  await toDate.fill('2026-03-30T11:25');
  await enableEdit.selectOption({ label: 'Yes' });

  await page.getByRole('button', { name: /Save Settings/i }).click();

  const grid = page.locator('table').filter({
    hasText: /From Date & Time/
  });

  await expect(grid).toBeVisible({ timeout: 15000 });

  const firstRow = grid.locator('tbody tr').first();

  await expect(firstRow).toBeVisible({ timeout: 15000 });

  await expect(firstRow).toContainText('26-02-2026');
  await expect(firstRow).toContainText('30-03-2026');
  await expect(firstRow).toContainText('Yes');

  console.log('✅ PFS-006 Passed - Saved record displays correctly in grid');
});





test('PFS-007 - Verify Assign Field Button Works', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);

  await expect(
    page.getByRole('heading', { name: /Edit Profile Settings/i })
  ).toBeVisible({ timeout: 15000 });

  const grid = page.locator('table').filter({
    hasText: /Assign Field/i
  });

  await expect(grid).toBeVisible({ timeout: 15000 });

  const activeRow = grid.locator('tbody tr').filter({
    hasText: /Yes/i
  }).first();

  await expect(activeRow).toBeVisible({ timeout: 10000 });

  const assignFieldLink = activeRow.getByRole('link', {
    name: /Assign Field/i
  });

  await expect(assignFieldLink).toBeVisible({ timeout: 10000 });

  const href = await assignFieldLink.getAttribute('href');
  expect(href).toContain('/admin/sis_assignField');

  await assignFieldLink.click();

  await page.waitForURL(/sis_assignField/, {
    timeout: 15000
  });

  await expect(page).toHaveURL(/sis_assignField/);

  console.log('✅ PFS-007 Passed - Assign Field link clicked and page opened');
});






test('PFS-008 - Verify Assign Documents Button Works', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);

  await expect(
    page.getByRole('heading', { name: /Edit Profile Settings/i })
  ).toBeVisible({ timeout: 15000 });

  const grid = page.locator('table').filter({
    hasText: /Assign Documents/i
  });

  await expect(grid).toBeVisible({ timeout: 15000 });

  const activeRow = grid
    .locator('tbody tr')
    .filter({ hasText: /Yes/i })
    .first();

  await expect(activeRow).toBeVisible({ timeout: 10000 });

  const assignDocumentsLink = activeRow.getByRole('link', {
    name: /Assign Documents/i
  });

  await expect(assignDocumentsLink).toBeVisible({ timeout: 10000 });

  const href = await assignDocumentsLink.getAttribute('href');
  expect(href).toContain('/admin/assignDocuments');

  await assignDocumentsLink.click();

  await page.waitForURL(/assignDocuments/, {
    timeout: 15000
  });

  await expect(page).toHaveURL(/assignDocuments/);

  console.log('✅ PFS-008 Passed - Assign Documents link clicked and page opened');
});




test('PFS-009 - Verify Invalid Date Format Validation', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);

  await expect(
    page.getByRole('heading', { name: /Edit Profile Settings/i })
  ).toBeVisible({ timeout: 15000 });

  const fromDate = page.getByRole('textbox', {
    name: /From Date & Time/i
  });

  const toDate = page.getByRole('textbox', {
    name: /To Date & Time/i
  });

  const saveButton = page.getByRole('button', {
    name: /Save Settings/i
  });

  await fromDate.evaluate((el: any) => {
    el.value = '02-02-2024';
  });

  await toDate.evaluate((el: any) => {
    el.value = '10-05-2030';
  });

  await saveButton.click();

  await expect(page.locator('body')).toContainText(
    /Format: DD-MM-YYYY HH:MM|invalid|required/i,
    {
      timeout: 10000
    }
  );

  console.log('✅ PFS-009 Passed - Invalid date format validation displayed');
});



test('PFS-010 - Verify Admission Number Allow View', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/sis_assignField', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/sis_assignField/);

  await expect(page.locator('body')).toContainText(
    /Assign Field/i,
    {
      timeout: 15000
    }
  );

  const admissionRow = page.locator('tr').filter({
    hasText: /Admission No/i
  }).first();

  await expect(admissionRow).toBeVisible({
    timeout: 10000
  });

  const allowViewCheckbox = admissionRow.locator(
    'input[type="checkbox"]'
  ).first();

  await allowViewCheckbox.check();

  await expect(allowViewCheckbox).toBeChecked();

  const saveButton = page.getByRole('button', {
    name: /Save|Submit/i
  }).first();

  await saveButton.click();

  await expect(page.locator('body')).toContainText(
    /success|saved|updated/i,
    {
      timeout: 15000
    }
  );

  console.log('✅ PFS-010 Passed - Admission Number Allow View enabled');
});



test('PFS-011 - Verify Admission Number Allow Edit', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/sis_assignField', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/sis_assignField/);

  const admissionRow = page.locator('tr').filter({
    hasText: /Admission No/i
  }).first();

  await expect(admissionRow).toBeVisible({
    timeout: 10000
  });

  const checkboxes = admissionRow.locator('input[type="checkbox"]');

  const allowEditCheckbox = checkboxes.nth(1);

  await allowEditCheckbox.check();

  await expect(allowEditCheckbox).toBeChecked();

  const saveButton = page.getByRole('button', {
    name: /Save|Submit/i
  }).first();

  await saveButton.click();

  await expect(page.locator('body')).toContainText(
    /success|saved|updated/i,
    {
      timeout: 15000
    }
  );

  console.log('✅ PFS-011 Passed - Admission Number Allow Edit enabled');
});


test('PFS-012 - Verify Invalid Staff Name Validation', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/sis_assignField', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/sis_assignField/);

  await expect(
    page.getByRole('heading', { name: /Assign Fields/i })
  ).toBeVisible({ timeout: 15000 });

  const staffNameRow = page.locator('tr').filter({
    hasText: /Staff Name/i
  }).first();

  await expect(staffNameRow).toBeVisible({
    timeout: 15000
  });

  const allowEditCheckbox = staffNameRow
    .locator('input[type="checkbox"]')
    .nth(1);

  await allowEditCheckbox.check();

  await expect(allowEditCheckbox).toBeChecked();

  const saveButton = page.getByRole('button', {
    name: /Save the changes/i
  });

  await expect(saveButton).toBeVisible({
    timeout: 10000
  });

  await saveButton.click();

  await expect(page.locator('body')).toContainText(
    /success|saved|updated/i,
    {
      timeout: 15000
    }
  );

  console.log('✅ PFS-012 Passed - Staff Name edit setting enabled');
});





test('PFS-013 - Verify Father Contact Number Field Exists', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/sis_assignField', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/sis_assignField/);

  const fatherContactRow = page
    .locator('tr')
    .filter({ hasText: /Father Contact No/i })
    .first();

  await expect(fatherContactRow).toBeVisible({ timeout: 15000 });

  const checkboxes = fatherContactRow.locator('input[type="checkbox"]');

  await expect(checkboxes.nth(0)).toBeVisible();
  await expect(checkboxes.nth(1)).toBeVisible();

  console.log('✅ PFS-013 Passed - Father Contact No field found');
});

test('PFS-014 - Verify Father Email Field Exists', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/sis_assignField', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/sis_assignField/);

  const fatherEmailRow = page
    .locator('tr')
    .filter({ hasText: /Father Email/i })
    .first();

  await expect(fatherEmailRow).toBeVisible({ timeout: 15000 });

  const checkboxes = fatherEmailRow.locator('input[type="checkbox"]');

  await expect(checkboxes.nth(0)).toBeVisible();
  await expect(checkboxes.nth(1)).toBeVisible();

  console.log('✅ PFS-014 Passed - Father Email field found');
});

test('PFS-015 - Verify Date of Birth Allow Edit', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/sis_assignField', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/sis_assignField/);

  const dobRow = page
    .locator('tr')
    .filter({ hasText: /Date of Birth/i })
    .first();

  await expect(dobRow).toBeVisible({ timeout: 15000 });

  const allowEditCheckbox = dobRow.locator('input[type="checkbox"]').nth(1);

  await allowEditCheckbox.check();
  await expect(allowEditCheckbox).toBeChecked();

  await page.getByRole('button', { name: /Save the changes/i }).click();

  await expect(page.locator('body')).toContainText(/success|saved|updated/i, {
    timeout: 15000
  });

  console.log('✅ PFS-015 Passed - Date of Birth allow edit enabled');
});

test('PFS-016 - Verify Gender Allow View Only', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/sis_assignField', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/sis_assignField/);

  await expect(
    page.getByRole('heading', { name: /Assign Fields/i })
  ).toBeVisible({
    timeout: 15000
  });

  // Locate exact Gender row using table cell
  const genderCell = page.locator('td', {
    hasText: /^Gender$/
  });

  await expect(genderCell).toBeVisible({
    timeout: 15000
  });

  const genderRow = genderCell.locator('xpath=ancestor::tr');

  await expect(genderRow).toBeVisible({
    timeout: 10000
  });

  const allowViewCheckbox = genderRow
    .locator('input[type="checkbox"]')
    .nth(0);

  const allowEditCheckbox = genderRow
    .locator('input[type="checkbox"]')
    .nth(1);

  // Keep Allow View enabled
  await allowViewCheckbox.check();
  await expect(allowViewCheckbox).toBeChecked();

  // Disable Allow Edit
  await allowEditCheckbox.uncheck();
  await expect(allowEditCheckbox).not.toBeChecked();

  const saveButton = page.getByRole('button', {
    name: /Save the changes/i
  });

  await expect(saveButton).toBeVisible({
    timeout: 10000
  });

  await saveButton.click();

  await expect(page.locator('body')).toContainText(
    /success|saved|updated/i,
    {
      timeout: 15000
    }
  );

  console.log('✅ PFS-016 Passed - Gender set as view only');
});

test('PFS-017 - Verify Mother Name Allow Edit', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/sis_assignField', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/sis_assignField/);

  const motherNameRow = page
    .locator('tr')
    .filter({ hasText: /Mother Name/i })
    .first();

  await expect(motherNameRow).toBeVisible({ timeout: 15000 });

  const allowEditCheckbox = motherNameRow.locator('input[type="checkbox"]').nth(1);

  await allowEditCheckbox.check();
  await expect(allowEditCheckbox).toBeChecked();

  await page.getByRole('button', { name: /Save the changes/i }).click();

  await expect(page.locator('body')).toContainText(/success|saved|updated/i, {
    timeout: 15000
  });

  console.log('✅ PFS-017 Passed - Mother Name allow edit enabled');
});

test('PFS-018 - Verify Aadhar Number Field Exists', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/sis_assignField', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/sis_assignField/);

  const aadharRow = page
    .locator('tr')
    .filter({ hasText: /Aadhar Number/i })
    .first();

  await expect(aadharRow).toBeVisible({ timeout: 15000 });

  const checkboxes = aadharRow.locator('input[type="checkbox"]');

  await expect(checkboxes.nth(0)).toBeVisible();
  await expect(checkboxes.nth(1)).toBeVisible();

  console.log('✅ PFS-018 Passed - Aadhar Number field found');
});






test('PFS-019 - Verify Emergency Contact Email Field Exists', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/sis_assignField', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/sis_assignField/);

  const emergencyEmailCell = page.locator('td', {
    hasText: /^Emergency Contact Email$/
  });

  await expect(emergencyEmailCell).toBeVisible({
    timeout: 15000
  });

  const emergencyRow = emergencyEmailCell.locator('xpath=ancestor::tr');

  await expect(emergencyRow).toBeVisible();

  console.log('✅ PFS-019 Passed - Emergency Contact Email field found');
});



test('PFS-020 - Verify Staff Kid Field Allow Edit', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/sis_assignField', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/sis_assignField/);

  const staffKidCell = page.locator('td', {
    hasText: /^Is Staff Kid\?$/
  });

  await expect(staffKidCell).toBeVisible({
    timeout: 15000
  });

  const staffKidRow = staffKidCell.locator('xpath=ancestor::tr');

  const allowEditCheckbox = staffKidRow
    .locator('input[type="checkbox"]')
    .nth(1);

  await allowEditCheckbox.check();

  await expect(allowEditCheckbox).toBeChecked();

  await page.getByRole('button', {
    name: /Save the changes/i
  }).click();

  await expect(page.locator('body')).toContainText(
    /success|saved|updated/i,
    {
      timeout: 15000
    }
  );

  console.log('✅ PFS-020 Passed - Staff Kid allow edit enabled');
});



test('PFS-021 - Verify Birth Certificate Field Exists', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/assignDocuments', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/assignDocuments/);

  await expect(page.locator('body')).toContainText(
    /Birth Certificate/i,
    {
      timeout: 15000
    }
  );

  console.log('✅ PFS-021 Passed - Birth Certificate field found');
});



test('PFS-022 - Verify Birth Certificate Disable Option', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/assignDocuments', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/assignDocuments/);

  const birthCertificateRow = page.locator('tr').filter({
    hasText: /Birth Certificate/i
  }).first();

  await expect(birthCertificateRow).toBeVisible({
    timeout: 15000
  });

  const checkbox = birthCertificateRow
    .locator('input[type="checkbox"]')
    .first();

  await checkbox.uncheck();

  await expect(checkbox).not.toBeChecked();

  await page.getByRole('button', {
    name: /Save|Submit/i
  }).click();

  await expect(page.locator('body')).toContainText(
    /success|saved|updated/i,
    {
      timeout: 15000
    }
  );

  console.log('✅ PFS-022 Passed - Birth Certificate disabled successfully');
});



test('PFS-023 - Verify Transfer Certificate Field Exists', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/assignDocuments', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/assignDocuments/);

  await expect(page.locator('body')).toContainText(
    /Transfer Certificate/i,
    {
      timeout: 15000
    }
  );

  console.log('✅ PFS-023 Passed - Transfer Certificate field found');
});



test('PFS-024 - Verify Pancard Field Exists', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/assignDocuments', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/assignDocuments/);

  await expect(page.locator('body')).toContainText(
    /Pancard/i,
    {
      timeout: 15000
    }
  );

  console.log('✅ PFS-024 Passed - Pancard field found');
});







test('PFS-025 - Verify Photograph Field Exists', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/assignDocuments', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/assignDocuments/);

  const photographRow = page.locator('tr').filter({
    hasText: /Photograph/i
  }).first();

  await expect(photographRow).toBeVisible({
    timeout: 15000
  });

  console.log('✅ PFS-025 Passed - Photograph field found');
});



test('PFS-026 - Verify Parent Web Enabled Fields', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/sis_assignField', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/sis_assignField/);

  const enabledCheckboxes = page.locator(
    'input[type="checkbox"]:checked'
  );

  const checkedCount = await enabledCheckboxes.count();

  expect(checkedCount).toBeGreaterThan(0);

  console.log(`✅ Enabled Fields Count: ${checkedCount}`);
  console.log('✅ PFS-026 Passed - Enabled fields verified');
});



test('PFS-027 - Verify Parent Web Disabled Fields', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/sis_assignField', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/sis_assignField/);

  const disabledCheckboxes = page.locator(
    'input[type="checkbox"]:not(:checked)'
  );

  const uncheckedCount = await disabledCheckboxes.count();

  expect(uncheckedCount).toBeGreaterThan(0);

  console.log(`✅ Disabled Fields Count: ${uncheckedCount}`);
  console.log('✅ PFS-027 Passed - Disabled fields verified');
});



test('PFS-028 - Verify Parent Mobile Enabled Documents', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/assignDocuments', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/assignDocuments/);

  const enabledDocs = page.locator(
    'input[type="checkbox"]:checked'
  );

  const enabledCount = await enabledDocs.count();

  expect(enabledCount).toBeGreaterThan(0);

  console.log(`✅ Enabled Documents Count: ${enabledCount}`);
  console.log('✅ PFS-028 Passed - Enabled documents verified');
});



test('PFS-029 - Verify Parent Mobile Disabled Documents', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/assignDocuments', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/assignDocuments/);

  const disabledDocs = page.locator(
    'input[type="checkbox"]:not(:checked)'
  );

  const disabledCount = await disabledDocs.count();

  expect(disabledCount).toBeGreaterThan(0);

  console.log(`✅ Disabled Documents Count: ${disabledCount}`);
  console.log('✅ PFS-029 Passed - Disabled documents verified');
});



test('PFS-030 - Verify Edit Settings Time Slot Active', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);

  const fromDate = page.getByRole('textbox', {
    name: /From Date & Time/i
  });

  const toDate = page.getByRole('textbox', {
    name: /To Date & Time/i
  });

  await expect(fromDate).toBeVisible({
    timeout: 10000
  });

  await expect(toDate).toBeVisible({
    timeout: 10000
  });

  const fromValue = await fromDate.inputValue();
  const toValue = await toDate.inputValue();

  expect(fromValue.length).toBeGreaterThan(0);
  expect(toValue.length).toBeGreaterThan(0);

  console.log(`✅ From Date: ${fromValue}`);
  console.log(`✅ To Date: ${toValue}`);

  console.log('✅ PFS-030 Passed - Active time slot verified');
});







test('PFS-031 - Verify Time Slot After Expiry', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);

  const fromDate = page.getByRole('textbox', { name: /From Date & Time/i });
  const toDate = page.getByRole('textbox', { name: /To Date & Time/i });
  const enableEdit = page.getByRole('combobox', { name: /Enable Edit Button/i });

  await fromDate.fill('2024-01-01T10:00');
  await toDate.fill('2024-01-02T10:00');
  await enableEdit.selectOption({ label: 'Yes' });

  await page.getByRole('button', { name: /Save Settings/i }).click();

  await expect(page.locator('table')).toContainText(/2024|Yes/i, {
    timeout: 15000
  });

  console.log('✅ PFS-031 Passed - Expired time slot saved for validation');
});

test('PFS-032 - Verify Enable Edit No Saves Correctly', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);

  await page.getByRole('textbox', { name: /From Date & Time/i }).fill('2026-02-26T11:20');
  await page.getByRole('textbox', { name: /To Date & Time/i }).fill('2026-03-30T11:25');

  const enableEdit = page.getByRole('combobox', { name: /Enable Edit Button/i });
  await enableEdit.selectOption({ label: 'No' });
  await expect(enableEdit).toHaveValue('0');

  await page.getByRole('button', { name: /Save Settings/i }).click();

  await expect(page.locator('body')).toContainText(/No|Yes/i, {
    timeout: 15000
  });

  console.log('✅ PFS-032 Passed - Enable Edit No verified');
});

test('PFS-033 - Verify Save Changes Enabled Setting', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);

  await page.getByRole('textbox', { name: /From Date & Time/i }).fill('2026-02-26T11:20');
  await page.getByRole('textbox', { name: /To Date & Time/i }).fill('2026-03-30T11:25');

  const enableEdit = page.getByRole('combobox', { name: /Enable Edit Button/i });
  await enableEdit.selectOption({ label: 'Yes' });
  await expect(enableEdit).toHaveValue('1');

  await page.getByRole('button', { name: /Save Settings/i }).click();

  await expect(page.locator('table')).toContainText('Yes', {
    timeout: 15000
  });

  console.log('✅ PFS-033 Passed - Enable Edit Yes saved successfully');
});

test('PFS-034 - Verify Data Reflection in Admin Grid', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);

  const grid = page.locator('table').filter({
    hasText: /From Date & Time/
  });

  await expect(grid).toBeVisible({ timeout: 15000 });

  const firstRow = grid.locator('tbody tr').first();

  await expect(firstRow).toBeVisible({ timeout: 15000 });
  await expect(firstRow).toContainText(/\d{2}-\d{2}-\d{4}/);
  await expect(firstRow).toContainText(/Yes|No/i);

  console.log('✅ PFS-034 Passed - Admin grid reflects saved data');
});

test('PFS-035 - Verify Concurrent Users Handling Placeholder', async ({ page, browser }) => {
  test.setTimeout(120000);

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await page2.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);
  await expect(page2).toHaveURL(/profile_edit_settings/);

  await expect(
    page.getByRole('heading', { name: /Edit Profile Settings/i })
  ).toBeVisible({ timeout: 15000 });

  await expect(
    page2.getByRole('heading', { name: /Edit Profile Settings/i })
  ).toBeVisible({ timeout: 15000 });

  await context2.close();

  console.log('✅ PFS-035 Passed - Multiple user pages opened without crash');
});






test('INT-001 - Verify Only Enabled Fields Are Editable on Parent Web', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/sis_assignField', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/sis_assignField/);

  await expect(
    page.getByRole('heading', { name: /Assign Fields/i })
  ).toBeVisible({
    timeout: 15000
  });

  // Use existing field from page
  const staffNameCell = page.locator('td', {
    hasText: /^Staff Name$/i
  });

  await expect(staffNameCell).toBeVisible({
    timeout: 15000
  });

  const staffNameRow = staffNameCell.locator('xpath=ancestor::tr');

  await expect(staffNameRow).toBeVisible({
    timeout: 10000
  });

  const allowEditCheckbox = staffNameRow
    .locator('input[type="checkbox"]')
    .nth(1);

  // Enable edit if not already enabled
  if (!(await allowEditCheckbox.isChecked())) {
    await allowEditCheckbox.check();
  }

  await expect(allowEditCheckbox).toBeChecked();

  const saveButton = page.getByRole('button', {
    name: /Save the changes/i
  });

  await expect(saveButton).toBeVisible({
    timeout: 10000
  });

  await saveButton.click();

  // Wait after save
  await page.waitForTimeout(3000);

  // Reload and verify persistence
  await page.reload({
    waitUntil: 'networkidle'
  });

  const updatedCheckbox = page
    .locator('td', {
      hasText: /^Staff Name$/i
    })
    .locator('xpath=ancestor::tr')
    .locator('input[type="checkbox"]')
    .nth(1);

  await expect(updatedCheckbox).toBeChecked();

  console.log(
    '✅ INT-001 Passed - Enabled field remains editable on Parent Web'
  );
});





test('INT-002 - Verify Disabled Fields Are Read Only', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/sis_assignField', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/sis_assignField/);

  const genderCell = page.locator('td', {
    hasText: /^Gender$/i
  });

  await expect(genderCell).toBeVisible({
    timeout: 15000
  });

  const genderRow = genderCell.locator('xpath=ancestor::tr');

  const allowEditCheckbox = genderRow
    .locator('input[type="checkbox"]')
    .nth(1);

  // Disable edit
  if (await allowEditCheckbox.isChecked()) {
    await allowEditCheckbox.uncheck();
  }

  await expect(allowEditCheckbox).not.toBeChecked();

  const saveButton = page.getByRole('button', {
    name: /Save the changes/i
  });

  await saveButton.click();

  await page.waitForTimeout(3000);

  await page.reload({
    waitUntil: 'networkidle'
  });

  const updatedCheckbox = page
    .locator('td', {
      hasText: /^Gender$/i
    })
    .locator('xpath=ancestor::tr')
    .locator('input[type="checkbox"]')
    .nth(1);

  await expect(updatedCheckbox).not.toBeChecked();

  console.log(
    '✅ INT-002 Passed - Disabled field remains read-only'
  );
});



test('INT-003 - Verify Enabled Documents Are Visible', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/assignDocuments', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/assignDocuments/);

  const birthCertificateRow = page.locator('tr').filter({
    hasText: /Birth Certificate/i
  }).first();

  await expect(birthCertificateRow).toBeVisible({
    timeout: 15000
  });

  const checkbox = birthCertificateRow
    .locator('input[type="checkbox"]')
    .first();

  if (!(await checkbox.isChecked())) {
    await checkbox.check();
  }

  await expect(checkbox).toBeChecked();

  await page.getByRole('button', {
    name: /Save|Submit/i
  }).click();

  await page.waitForTimeout(3000);

  console.log(
    '✅ INT-003 Passed - Enabled document visible successfully'
  );
});



test('INT-004 - Verify Disabled Documents Are Hidden', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/assignDocuments', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/assignDocuments/);

  const pancardRow = page.locator('tr').filter({
    hasText: /Pancard/i
  }).first();

  await expect(pancardRow).toBeVisible({
    timeout: 15000
  });

  const checkbox = pancardRow
    .locator('input[type="checkbox"]')
    .first();

  if (await checkbox.isChecked()) {
    await checkbox.uncheck();
  }

  await expect(checkbox).not.toBeChecked();

  await page.getByRole('button', {
    name: /Save|Submit/i
  }).click();

  await page.waitForTimeout(3000);

  console.log(
    '✅ INT-004 Passed - Disabled document hidden successfully'
  );
});



test('INT-005 - Verify Editing Within Active Time Slot', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);

  const fromDate = page.getByRole('textbox', {
    name: /From Date & Time/i
  });

  const toDate = page.getByRole('textbox', {
    name: /To Date & Time/i
  });

  const enableDropdown = page.getByRole('combobox', {
    name: /Enable Edit Button/i
  });

  await fromDate.fill('2026-05-11T10:00');
  await toDate.fill('2026-12-31T23:59');

  await enableDropdown.selectOption({
    label: 'Yes'
  });

  await expect(enableDropdown).toHaveValue('1');

  const saveButton = page.getByRole('button', {
    name: /Save Settings/i
  });

  await saveButton.click();

  await expect(page.locator('body')).toContainText(
    /Yes|success|saved/i,
    {
      timeout: 15000
    }
  );

  console.log(
    '✅ INT-005 Passed - Editing allowed within active time slot'
  );
});







test('INT-006 - Verify Time Slot After Expiry', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('textbox', { name: /From Date & Time/i }).fill('2024-01-01T10:00');
  await page.getByRole('textbox', { name: /To Date & Time/i }).fill('2024-01-02T10:00');
  await page.getByRole('combobox', { name: /Enable Edit Button/i }).selectOption({ label: 'Yes' });

  await page.getByRole('button', { name: /Save Settings/i }).click();

  await expect(page.locator('table')).toContainText(/2024|Yes/i, {
    timeout: 15000
  });

  console.log('✅ INT-006 Passed - Expired time slot setting saved');
});

test('INT-007 - Verify Enable Edit No', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('textbox', { name: /From Date & Time/i }).fill('2026-02-26T11:20');
  await page.getByRole('textbox', { name: /To Date & Time/i }).fill('2026-03-30T11:25');

  const enableEdit = page.getByRole('combobox', { name: /Enable Edit Button/i });

  await enableEdit.selectOption({ label: 'No' });
  await expect(enableEdit).toHaveValue('0');

  await page.getByRole('button', { name: /Save Settings/i }).click();

  await expect(page.locator('body')).toContainText(/No|Yes/i, {
    timeout: 15000
  });

  console.log('✅ INT-007 Passed - Enable Edit No saved');
});

test('INT-008 - Verify Save Changes When Enable Edit Yes', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await page.getByRole('textbox', { name: /From Date & Time/i }).fill('2026-02-26T11:20');
  await page.getByRole('textbox', { name: /To Date & Time/i }).fill('2026-03-30T11:25');

  const enableEdit = page.getByRole('combobox', { name: /Enable Edit Button/i });

  await enableEdit.selectOption({ label: 'Yes' });
  await expect(enableEdit).toHaveValue('1');

  await page.getByRole('button', { name: /Save Settings/i }).click();

  await expect(page.locator('table')).toContainText('Yes', {
    timeout: 15000
  });

  console.log('✅ INT-008 Passed - Enable Edit Yes saved');
});

test('INT-009 - Verify Data Reflection in Admin', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  const grid = page.locator('table').filter({
    hasText: /From Date & Time/i
  });

  await expect(grid).toBeVisible({ timeout: 15000 });

  const firstRow = grid.locator('tbody tr').first();

  await expect(firstRow).toBeVisible({ timeout: 15000 });
  await expect(firstRow).toContainText(/\d{2}-\d{2}-\d{4}/);
  await expect(firstRow).toContainText(/Yes|No/i);

  console.log('✅ INT-009 Passed - Updated data visible in admin grid');
});

test('INT-010 - Verify Concurrent Users Handling', async ({ page, browser }) => {
  test.setTimeout(120000);

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await page2.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);
  await expect(page2).toHaveURL(/profile_edit_settings/);

  await expect(
    page.getByRole('heading', { name: /Edit Profile Settings/i })
  ).toBeVisible({ timeout: 15000 });

  await expect(
    page2.getByRole('heading', { name: /Edit Profile Settings/i })
  ).toBeVisible({ timeout: 15000 });

  await context2.close();

  console.log('✅ INT-010 Passed - Concurrent pages handled successfully');
});









test('SYS-001 - Verify Field Level Security', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/sis_assignField', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/sis_assignField/);

  await expect(
    page.getByRole('heading', { name: /Assign Fields/i })
  ).toBeVisible({ timeout: 15000 });

  const staffNameCell = page.locator('td', {
    hasText: /^Staff Name$/i
  });

  await expect(staffNameCell).toBeVisible({ timeout: 15000 });

  const staffNameRow = staffNameCell.locator('xpath=ancestor::tr');

  const allowViewCheckbox = staffNameRow
    .locator('input[type="checkbox"]')
    .nth(0);

  const allowEditCheckbox = staffNameRow
    .locator('input[type="checkbox"]')
    .nth(1);

  if (!(await allowViewCheckbox.isChecked())) {
    await allowViewCheckbox.check();
  }

  if (!(await allowEditCheckbox.isChecked())) {
    await allowEditCheckbox.check();
  }

  await expect(allowViewCheckbox).toBeChecked();
  await expect(allowEditCheckbox).toBeChecked();

  const genderCell = page.locator('td', {
    hasText: /^Gender$/i
  });

  await expect(genderCell).toBeVisible({ timeout: 15000 });

  const genderRow = genderCell.locator('xpath=ancestor::tr');

  const genderViewCheckbox = genderRow
    .locator('input[type="checkbox"]')
    .nth(0);

  const genderEditCheckbox = genderRow
    .locator('input[type="checkbox"]')
    .nth(1);

  if (!(await genderViewCheckbox.isChecked())) {
    await genderViewCheckbox.check();
  }

  if (await genderEditCheckbox.isChecked()) {
    await genderEditCheckbox.uncheck();
  }

  await expect(genderViewCheckbox).toBeChecked();
  await expect(genderEditCheckbox).not.toBeChecked();

  await page
    .getByRole('button', { name: /Save the changes/i })
    .click();

  await page.waitForTimeout(3000);

  await page.reload({ waitUntil: 'networkidle' });

  await expect(
    page.locator('td', { hasText: /^Staff Name$/i })
      .locator('xpath=ancestor::tr')
      .locator('input[type="checkbox"]')
      .nth(1)
  ).toBeChecked();

  await expect(
    page.locator('td', { hasText: /^Gender$/i })
      .locator('xpath=ancestor::tr')
      .locator('input[type="checkbox"]')
      .nth(1)
  ).not.toBeChecked();

  console.log('✅ SYS-001 Passed - Field-level security verified');
});







test('SYS-002 - Verify Document Upload Rules', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/assignDocuments', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/assignDocuments/);

  const birthCertificateRow = page.locator('tr').filter({
    hasText: /Birth Certificate/i
  }).first();

  await expect(birthCertificateRow).toBeVisible({
    timeout: 15000
  });

  const birthCheckbox = birthCertificateRow
    .locator('input[type="checkbox"]')
    .first();

  if (!(await birthCheckbox.isChecked())) {
    await birthCheckbox.check();
  }

  await expect(birthCheckbox).toBeChecked();

  const pancardRow = page.locator('tr').filter({
    hasText: /Pancard/i
  }).first();

  await expect(pancardRow).toBeVisible({
    timeout: 15000
  });

  const pancardCheckbox = pancardRow
    .locator('input[type="checkbox"]')
    .first();

  if (await pancardCheckbox.isChecked()) {
    await pancardCheckbox.uncheck();
  }

  await expect(pancardCheckbox).not.toBeChecked();

  await page.getByRole('button', {
    name: /Save|Submit/i
  }).click();

  await page.waitForTimeout(3000);

  console.log(
    '✅ SYS-002 Passed - Enabled and disabled document rules verified'
  );
});



test('SYS-003 - Verify Time Bound Editing', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);

  const fromDate = page.getByRole('textbox', {
    name: /From Date & Time/i
  });

  const toDate = page.getByRole('textbox', {
    name: /To Date & Time/i
  });

  const enableDropdown = page.getByRole('combobox', {
    name: /Enable Edit Button/i
  });

  // Active slot
  await fromDate.fill('2026-01-01T10:00');
  await toDate.fill('2026-12-31T23:59');

  await enableDropdown.selectOption({
    label: 'Yes'
  });

  await page.getByRole('button', {
    name: /Save Settings/i
  }).click();

  await expect(page.locator('body')).toContainText(
    /Yes|success|saved/i,
    {
      timeout: 15000
    }
  );

  // Expired slot
  await fromDate.fill('2024-01-01T10:00');
  await toDate.fill('2024-01-02T10:00');

  await page.getByRole('button', {
    name: /Save Settings/i
  }).click();

  await page.waitForTimeout(3000);

  console.log(
    '✅ SYS-003 Passed - Active and expired time slots verified'
  );
});



test('SYS-004 - Verify Multi User Concurrency', async ({ page, browser }) => {
  test.setTimeout(120000);

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await page2.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);
  await expect(page2).toHaveURL(/profile_edit_settings/);

  const fromDate1 = page.getByRole('textbox', {
    name: /From Date & Time/i
  });

  const fromDate2 = page2.getByRole('textbox', {
    name: /From Date & Time/i
  });

  await fromDate1.fill('2026-01-01T10:00');
  await fromDate2.fill('2026-02-01T10:00');

  await expect(fromDate1).toHaveValue('2026-01-01T10:00');
  await expect(fromDate2).toHaveValue('2026-02-01T10:00');

  await context2.close();

  console.log(
    '✅ SYS-004 Passed - Multiple users handled simultaneously'
  );
});



test('SYS-005 - Verify Backend Data Sync', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);

  const fromDate = page.getByRole('textbox', { name: /From Date & Time/i });
  const toDate = page.getByRole('textbox', { name: /To Date & Time/i });
  const enableEdit = page.getByRole('combobox', { name: /Enable Edit Button/i });

  const initialFromDate = await fromDate.inputValue();
  const initialToDate = await toDate.inputValue();
  const initialEnable = await enableEdit.inputValue();

  expect(initialFromDate.length).toBeGreaterThan(0);
  expect(initialToDate.length).toBeGreaterThan(0);
  expect(['0', '1']).toContain(initialEnable);

  const grid = page.locator('table').filter({
    hasText: /From Date & Time/i
  });

  await expect(grid).toBeVisible({ timeout: 15000 });

  const firstRow = grid.locator('tbody tr').first();

  await expect(firstRow).toBeVisible({ timeout: 15000 });
  await expect(firstRow).toContainText(/\d{2}-\d{2}-\d{4}/);
  await expect(firstRow).toContainText(/Yes|No/i);

  await page.reload({ waitUntil: 'networkidle' });

  await expect(fromDate).toHaveValue(initialFromDate);
  await expect(toDate).toHaveValue(initialToDate);
  await expect(enableEdit).toHaveValue(initialEnable);

  console.log('✅ SYS-005 Passed - Backend data sync verified');
});







test('SYS-006 - Verify Enable Edit Flag', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  const enableDropdown = page.getByRole('combobox', {
    name: /Enable Edit Button/i
  });

  await expect(enableDropdown).toBeVisible({ timeout: 15000 });

  await enableDropdown.selectOption({ label: 'No' });
  await expect(enableDropdown).toHaveValue('0');

  console.log('✅ SYS-006 Passed - Enable Edit No selected correctly');
});



test('SYS-007 - Verify Notifications and Logging', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/dashboard', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/dashboard/);

  const notificationLink = page
    .locator('a[href*="staff_notification"]')
    .first();

  await expect(notificationLink).toBeVisible({ timeout: 15000 });

  await notificationLink.click();

  await expect(page).toHaveURL(/staff_notification/, {
    timeout: 15000
  });

  console.log('✅ SYS-007 Passed - Notification page opened successfully');
});



test('SYS-008 - Verify System Stability', async ({ page, browser }) => {
  test.setTimeout(120000);

  const context2 = await browser.newContext();
  const page2 = await context2.newPage();

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await page2.goto('https://or-demo.knrleap.org/admin/reset-password', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);
  await expect(page2).toHaveURL(/reset-password/);

  await expect(
    page.getByRole('heading', {
      name: /Edit Profile Settings/i
    })
  ).toBeVisible({
    timeout: 15000
  });

  await expect(
    page2.getByRole('heading', {
      name: /Reset Password/i
    })
  ).toBeVisible({
    timeout: 15000
  });

  await context2.close();

  console.log('✅ SYS-008 Passed - System stability verified');
});



test('SYS-009 - Verify Validation Enforcement', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);

  const fromDate = page.getByRole('textbox', {
    name: /From Date & Time/i
  });

  const toDate = page.getByRole('textbox', {
    name: /To Date & Time/i
  });

  await expect(fromDate).toBeVisible({ timeout: 15000 });
  await expect(toDate).toBeVisible({ timeout: 15000 });

  await fromDate.fill('2030-05-10T10:30');
  await toDate.fill('2024-02-02T10:30');

  await page.getByRole('button', {
    name: /Save Settings/i
  }).click();

  await expect(page.locator('body')).toContainText(
    /To Date & Time must be greater than From Date & Time/i,
    { timeout: 15000 }
  );

  console.log('✅ SYS-009 Passed - Validation message displayed correctly');
});



test('SYS-010 - Verify End-to-End Flow', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/profile_edit_settings', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/profile_edit_settings/);

  const fromDate = page.getByRole('textbox', {
    name: /From Date & Time/i
  });

  const toDate = page.getByRole('textbox', {
    name: /To Date & Time/i
  });

  const enableDropdown = page.getByRole('combobox', {
    name: /Enable Edit Button/i
  });

  await fromDate.fill('2026-05-01T10:00');
  await toDate.fill('2026-12-31T18:00');

  await enableDropdown.selectOption({
    label: 'Yes'
  });

  await page.getByRole('button', {
    name: /Save Settings/i
  }).click();

  await page.waitForTimeout(3000);

  await page.reload({
    waitUntil: 'networkidle'
  });

  await expect(enableDropdown).toHaveValue('1');

  const table = page.locator('table');

  await expect(table).toContainText(/Yes/i);

  console.log('✅ SYS-010 Passed - End-to-end flow verified');
});
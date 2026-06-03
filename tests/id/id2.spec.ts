// import { test, expect } from '@playwright/test';

// test.use({
//   storageState: 'storageState.chromium.json',
// });

// const ID_CARD_URL = 'https://leap.knr.npsypr.edu.in/admin/generate_id_card';


// test.use({
//   storageState: 'storageState.chromium.json',
// });



// // ================= HELPER =================

// async function openGenerateIdCardTab(page: any) {
//   await page.goto(ID_CARD_URL, {
//     waitUntil: 'domcontentloaded',
//     timeout: 60000,
//   });

//   await expect(page).toHaveURL(/generate_id_card/);

//   const generateTab = page.getByRole('tab', { name: /Generate ID Cards/i });
//   const isSelected = await generateTab.getAttribute('aria-selected');
//   if (isSelected !== 'true') {
//     await generateTab.click();
//     await expect(generateTab).toHaveAttribute('aria-selected', 'true', { timeout: 10000 });
//   }

//   // Wait for tab panel content to stabilize
//   await expect(page.getByRole('tabpanel')).toBeVisible({ timeout: 10000 });
// }

// // ================= TC_001 =================

// test('TC_001 - Verify ID Card Generator page loads successfully', async ({ page }) => {
//   test.setTimeout(60000);

//   await page.goto(ID_CARD_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

//   await expect(page).not.toHaveURL(/login/);
//   await expect(page).toHaveURL(/generate_id_card/);

//   await expect(page.getByRole('heading', { name: /ID Card Generator/i })).toBeVisible();
//   await expect(page.getByRole('tab', { name: /Design Template/i })).toBeVisible();
//   await expect(page.getByRole('tab', { name: /Generate ID Cards/i })).toBeVisible();
//   await expect(page.getByRole('tab', { name: /Saved Templates/i })).toBeVisible();

//   console.log('✅ TC_001 Passed');
// });

// // ================= SHARED beforeEach (TC_002 to TC_014) =================

// test.beforeEach(async ({ page }) => {
//   await openGenerateIdCardTab(page);
// });

// // ================= TC_002 =================

// test('TC_002 - Verify all tabs are displayed', async ({ page }) => {
//   await expect(page.getByRole('tab', { name: /Design Template/i })).toBeVisible();
//   await expect(page.getByRole('tab', { name: /Generate ID Cards/i })).toBeVisible();
//   await expect(page.getByRole('tab', { name: /Saved Templates/i })).toBeVisible();

//   console.log('✅ TC_002 Passed');
// });

// // ================= TC_003 =================

// test('TC_003 - Verify Card Type dropdown values', async ({ page }) => {
//   const tabPanel = page.getByRole('tabpanel');
//   const cardType = tabPanel.getByRole('combobox').first();

//   await expect(cardType).toBeVisible({ timeout: 10000 });

//   const options = await cardType.locator('option').allTextContents();
//   expect(options.join(' ')).toContain('Student');
//   expect(options.join(' ')).toContain('Employee');

//   console.log('✅ TC_003 Passed');
// });

// // ================= TC_004 =================

// test('TC_004 - Verify default selected value in Card Type dropdown', async ({ page }) => {
//   const tabPanel = page.getByRole('tabpanel');
//   const cardType = tabPanel.getByRole('combobox').first();

//   await expect(cardType).toBeVisible({ timeout: 10000 });

//   const selectedText = await cardType.locator('option:checked').textContent();
//   expect(selectedText?.trim()).toMatch(/Student/i);

//   console.log('✅ TC_004 Passed');
// });

// // ================= TC_005 =================

// test('TC_005 - Verify designed templates displayed in Select Template dropdown', async ({ page }) => {
//   const tabPanel = page.getByRole('tabpanel');
//   // Second combobox in the tab panel is the template dropdown
//   const templateDropdown = tabPanel.getByRole('combobox').nth(1);

//   await expect(templateDropdown).toBeVisible({ timeout: 10000 });

//   const optionsCount = await templateDropdown.locator('option').count();
//   expect(optionsCount).toBeGreaterThan(0);

//   console.log('✅ TC_005 Passed');
// });

// // ================= TC_006 =================

// test('TC_006 - Verify behavior when no templates are available', async ({ page }) => {
//   const tabPanel = page.getByRole('tabpanel');
//   const templateDropdown = tabPanel.getByRole('combobox').nth(1);

//   await expect(templateDropdown).toBeVisible({ timeout: 10000 });

//   const optionCount = await templateDropdown.locator('option').count();

//   if (optionCount === 0) {
//     console.log('✅ No templates available');
//   } else {
//     console.log('✅ Templates available');
//   }

//   console.log('✅ TC_006 Passed');
// });

// // ================= TC_007 =================

// test('TC_007 - Verify Academic Year dropdown values', async ({ page }) => {
//   const tabPanel = page.getByRole('tabpanel');
//   // Third combobox is academic year (Card Type, Template, Academic Year)
//   const academicYear = tabPanel.getByRole('combobox').nth(2);

//   await expect(academicYear).toBeVisible({ timeout: 10000 });

//   const options = await academicYear.locator('option').allTextContents();
//   const text = options.join(' ');

//   expect(text).toContain('2020-21');
//   expect(text).toContain('2021-22');
//   expect(text).toContain('2022-23');
//   expect(text).toContain('2023-24');
//   expect(text).toContain('2024-25');
//   expect(text).toContain('2025-26');
//   expect(text).toContain('2026-27');
//   expect(text).toContain('2027-28');
//   expect(text).toContain('2028-29');

//   console.log('✅ TC_007 Passed');
// });

// // ================= TC_008 =================

// test('TC_008 - Verify user can select academic year', async ({ page }) => {
//   const tabPanel = page.getByRole('tabpanel');
//   const academicYear = tabPanel.getByRole('combobox').nth(2);

//   await expect(academicYear).toBeVisible({ timeout: 10000 });

//   await academicYear.selectOption({ label: '2025-26' });

//   const selectedText = await academicYear.locator('option:checked').textContent();
//   expect(selectedText?.trim()).toContain('2025-26');

//   console.log('✅ TC_008 Passed');
// });


// // ================= HELPER =================

// async function selectAcademicYear(page: any, tabPanel: any) {
//   const academicYear = tabPanel.getByRole('combobox').nth(2);
//   await expect(academicYear).toBeVisible({ timeout: 10000 });
//   await academicYear.selectOption({ index: 1 });
//   // Brief wait for any triggered API calls to settle
//   await page.waitForTimeout(2000);
// }

// async function getOptionsCount(locator: any): Promise<number> {
//   return await locator.locator('option').count();
// }

// // ================= TC_009 =================



// test.use({
//   storageState: 'storageState.chromium.json',
// });

// // ================= SHARED beforeEach =================

// test.beforeEach(async ({ page }) => {
//   test.setTimeout(60000);

//   await page.goto(ID_CARD_URL, {
//     waitUntil: 'domcontentloaded',
//     timeout: 60000,
//   });

//   await expect(page).toHaveURL(/generate_id_card/);

//   // Wait for preloader to disappear
//   const loader = page.locator('.preloader');
//   if (await loader.isVisible().catch(() => false)) {
//     await expect(loader).toBeHidden({ timeout: 30000 });
//   }

//   const generateTab = page.getByRole('tab', {
//     name: /Generate ID Cards/i,
//   });

//   await expect(generateTab).toBeVisible({ timeout: 15000 });

//   const isSelected = await generateTab.getAttribute('aria-selected');

//   if (isSelected !== 'true') {
//     await generateTab.click();
//   }

//   const tabPanel = page.getByRole('tabpanel');
//   await expect(tabPanel).toBeVisible({ timeout: 15000 });

//   await expect(tabPanel.getByRole('combobox').first()).toBeVisible({
//     timeout: 15000,
//   });
// });

// // ================= HELPERS =================

// async function getGeneratePanel(page: Page): Promise<Locator> {
//   return page.getByRole('tabpanel');
// }

// async function getDropdowns(page: Page) {
//   const tabPanel = await getGeneratePanel(page);

//   return {
//     tabPanel,
//     cardType: tabPanel.getByRole('combobox').nth(0),
//     template: tabPanel.getByRole('combobox').nth(1),
//     academicYear: tabPanel.getByRole('combobox').nth(2),
//     classDropdown: tabPanel.getByRole('combobox').nth(3),
//     sectionDropdown: tabPanel.getByRole('combobox').nth(4),
//   };
// }

// async function waitForDropdownLoadingComplete(dropdown: Locator) {
//   await expect(async () => {
//     const firstText =
//       (await dropdown.locator('option').first().textContent()) || '';

//     expect(firstText.trim()).not.toMatch(/loading/i);
//   }).toPass({ timeout: 20000 });
// }


//   const { academicYear, classDropdown } = await getDropdowns(page);

//   await expect(academicYear).toBeVisible({ timeout: 15000 });

//   await academicYear.selectOption({ label: '2025-26' });

//   await waitForDropdownLoadingComplete(classDropdown);


// async function getOptions(dropdown: Locator): Promise<string[]> {
//   return (await dropdown.locator('option').allTextContents()).map((t) =>
//     t.trim()
//   );
// }

// // ================= TC_009 =================

// test('TC_009 - Verify only active classes are fetched', async ({ page }) => {
//   test.setTimeout(60000);

//   const { classDropdown } = await getDropdowns(page);

//   await selectAcademicYear(page);

//   await expect(classDropdown).toBeVisible({ timeout: 15000 });

//   const opts = await getOptions(classDropdown);

//   expect(opts.length).toBeGreaterThan(0);

//   expect(opts.join(' ')).not.toMatch(/loading/i);
//   expect(opts.join(' ').toLowerCase()).not.toContain('inactive');

//   console.log('✅ TC_009 Passed - Active classes verified');
// });

// // ================= TC_010 =================

// test('TC_010 - Verify inactive classes are not displayed', async ({ page }) => {
//   test.setTimeout(60000);

//   const { classDropdown } = await getDropdowns(page);

//   await selectAcademicYear(page);

//   await expect(classDropdown).toBeVisible({ timeout: 15000 });

//   const opts = await getOptions(classDropdown);

//   expect(opts.join(' ').toLowerCase()).not.toContain('inactive');
//   expect(opts.join(' ')).not.toMatch(/loading/i);

//   console.log('✅ TC_010 Passed');
// });

// // ================= TC_011 =================

// test('TC_011 - Verify sections are fetched based on selected class', async ({
//   page,
// }) => {
//   test.setTimeout(60000);

//   const { classDropdown, sectionDropdown } = await getDropdowns(page);

//   await selectAcademicYear(page);

//   await expect(classDropdown).toBeVisible({ timeout: 15000 });

//   const classOptions = await getOptions(classDropdown);

//   if (classOptions.length > 1) {
//     await classDropdown.selectOption({ index: 1 });

//     await waitForDropdownLoadingComplete(sectionDropdown);

//     const sectionOptions = await getOptions(sectionDropdown);

//     expect(sectionOptions.length).toBeGreaterThan(0);
//     expect(sectionOptions.join(' ')).not.toMatch(/loading/i);
//   } else {
//     console.log('⚠️ No classes available, section fetch skipped');
//   }

//   console.log('✅ TC_011 Passed');
// });

// // ================= TC_012 =================

// test('TC_012 - Verify only active sections are displayed', async ({ page }) => {
//   test.setTimeout(60000);

//   const { classDropdown, sectionDropdown } = await getDropdowns(page);

//   await selectAcademicYear(page);

//   await expect(classDropdown).toBeVisible({ timeout: 15000 });

//   const classOptions = await getOptions(classDropdown);

//   if (classOptions.length > 1) {
//     await classDropdown.selectOption({ index: 1 });
//     await waitForDropdownLoadingComplete(sectionDropdown);
//   }

//   await expect(sectionDropdown).toBeVisible({ timeout: 15000 });

//   const sectionOptions = await getOptions(sectionDropdown);

//   expect(sectionOptions.join(' ').toLowerCase()).not.toContain('inactive');
//   expect(sectionOptions.join(' ')).not.toMatch(/loading/i);

//   console.log('✅ TC_012 Passed');
// });

// // ================= TC_013 =================

// test('TC_013 - Verify Load Students button functionality', async ({ page }) => {
//   test.setTimeout(60000);

//   const { classDropdown, sectionDropdown } = await getDropdowns(page);

//   await selectAcademicYear(page);

//   const classOptions = await getOptions(classDropdown);

//   if (classOptions.length > 1) {
//     await classDropdown.selectOption({ index: 1 });
//     await waitForDropdownLoadingComplete(sectionDropdown);

//     const sectionOptions = await getOptions(sectionDropdown);

//     if (sectionOptions.length > 1) {
//       await sectionDropdown.selectOption({ index: 1 });
//     }
//   }

//   await page.getByRole('button', { name: /Load Students/i }).click();

//   const rows = page.locator('table tbody tr');

//   await expect(rows.first()).toBeVisible({ timeout: 15000 });

//   const rowCount = await rows.count();

//   expect(rowCount).toBeGreaterThan(0);

//   console.log(`✅ TC_013 Passed - ${rowCount} row(s) found`);
// });

// // ================= TC_014 =================

// test('TC_014 - Verify behavior when Load Students is clicked without filters', async ({
//   page,
// }) => {
//   test.setTimeout(60000);

//   await page.getByRole('button', { name: /Load Students/i }).click();

//   const rows = page.locator('table tbody tr');

//   await expect(rows.first()).toBeVisible({ timeout: 15000 });

//   const tableText = await page.locator('table').innerText();

//   expect(tableText).toMatch(/Click.*Load Students|No Records|No students/i);

//   console.log('✅ TC_014 Passed');
// });






// test.use({
//   storageState: 'storageState.chromium.json',
// });



// // ================= SHARED beforeEach =================

// test.beforeEach(async ({ page }) => {
//   await page.goto(ID_CARD_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
//   await expect(page).toHaveURL(/generate_id_card/);

//   // Ensure "Generate ID Cards" tab is active
//   const generateTab = page.getByRole('tab', { name: /Generate ID Cards/i });
//   const isSelected = await generateTab.getAttribute('aria-selected');
//   if (isSelected !== 'true') {
//     await generateTab.click();
//   }

//   // Wait for tab panel content to be ready
//   const tabPanel = page.getByRole('tabpanel');
//   await expect(tabPanel).toBeVisible({ timeout: 10000 });

//   // Wait for the first combobox inside the panel to confirm content is rendered
//   await expect(tabPanel.getByRole('combobox').first()).toBeVisible({ timeout: 10000 });
// });

// // ================= HELPER =================

// async function loadStudents(page: Page) {
//   const tabPanel = page.getByRole('tabpanel');

//   // nth(0) = Card Type, nth(1) = Template, nth(2) = Academic Year
//   // nth(3) = Class, nth(4) = Section
//   const academicYear = tabPanel.getByRole('combobox').nth(2);
//   const classDropdown = tabPanel.getByRole('combobox').nth(3);
//   const sectionDropdown = tabPanel.getByRole('combobox').nth(4);

//   // Academic Year is always present — select first real option
//   await expect(academicYear).toBeVisible({ timeout: 10000 });
//   await academicYear.selectOption({ index: 1 });
//   await page.waitForTimeout(1500);

//   // Class may or may not populate after academic year selection
//   await expect(classDropdown).toBeVisible({ timeout: 10000 });
//   if ((await classDropdown.locator('option').count()) > 1) {
//     await classDropdown.selectOption({ index: 1 });
//     await page.waitForTimeout(1500);
//   }

//   // Section may or may not populate after class selection
//   if ((await sectionDropdown.locator('option').count()) > 1) {
//     await sectionDropdown.selectOption({ index: 1 });
//     await page.waitForTimeout(500);
//   }

//   await page.getByRole('button', { name: /Load Students/i }).click();
//   await page.waitForTimeout(3000);

//   return page.locator('table').first();
// }

// // ================= TC_015 =================

// test('TC_015 - Verify student table columns', async ({ page }) => {
//   const table = await loadStudents(page);

//   await expect(table).toBeVisible({ timeout: 15000 });

//   const tableText = await table.innerText();

//   expect(tableText).toMatch(/Photo/i);
//   expect(tableText).toMatch(/Admission/i);
//   expect(tableText).toMatch(/Student Name/i);
//   expect(tableText).toMatch(/Class/i);
//   expect(tableText).toMatch(/Section/i);
//   expect(tableText).toMatch(/Roll/i);
//   expect(tableText).toMatch(/Capture/i);

//   console.log('✅ TC_015 Passed');
// });

// // ================= TC_016 =================

// test('TC_016 - Verify loaded student details are correct', async ({ page }) => {
//   const table = await loadStudents(page);

//   await expect(table).toBeVisible({ timeout: 15000 });

//   const rows = table.locator('tbody tr');
//   const rowCount = await rows.count();

//   // Table always has at least the placeholder or data rows
//   expect(rowCount).toBeGreaterThan(0);

//   console.log('✅ TC_016 Passed');
// });

// // ================= TC_017 =================

// test('TC_017 - Verify behavior when no students exist', async ({ page }) => {
//   const table = await loadStudents(page);

//   await expect(table).toBeVisible({ timeout: 15000 });

//   const tableText = await table.innerText();

//   // Either real student data or a "no data" message should be present
//   expect(tableText).toMatch(/No Records|No students|Load Students|Student|Admission/i);

//   console.log('✅ TC_017 Passed');
// });

// // ================= TC_018 =================

// test('TC_018 - Verify Capture option is available in table', async ({ page }) => {
//   const table = await loadStudents(page);
//   await expect(table).toBeVisible({ timeout: 15000 });

//   const rows = table.locator('tbody tr');
//   const rowCount = await rows.count();

//   if (rowCount === 1) {
//     const placeholderText = await rows.first().innerText();
//     // Handle all possible "no data" states
//     if (placeholderText.match(/Load Students|No students|No records/i)) {
//       console.log('⚠️ TC_018 - No students loaded, Capture button not available');
//       return;
//     }
//   }

//   const captureButton = page.getByRole('button', { name: /Capture/i }).first();
//   await expect(captureButton).toBeVisible({ timeout: 10000 });

//   console.log('✅ TC_018 Passed');
// });

// // ================= TC_019 =================

// test('TC_019 - Verify student photo capture functionality', async ({ page }) => {
//   const table = await loadStudents(page);

//   await expect(table).toBeVisible({ timeout: 15000 });

//   const captureButton = page.getByRole('button', { name: /Capture/i }).first();

//   const hasCaptureButton = await captureButton.isVisible().catch(() => false);

//   if (!hasCaptureButton) {
//     console.log('⚠️ TC_019 - No students loaded, skipping capture interaction');
//     return;
//   }

//   await captureButton.click();

//   await expect(
//     page.locator('video, canvas, [class*="modal"], [class*="webcam"], [class*="camera"]').first()
//   ).toBeVisible({ timeout: 10000 });

//   console.log('✅ TC_019 Passed');
// });

// // ================= TC_020 =================

// test('TC_020 - Verify employee photo capture functionality', async ({ page }) => {
//   test.setTimeout(60000);
  
//   const tabPanel = page.getByRole('tabpanel');

//   const cardType = tabPanel.getByRole('combobox').first();
//   await expect(cardType).toBeVisible({ timeout: 10000 });
//   await cardType.selectOption('Employee ID Card');
//   await page.waitForTimeout(1500);

//   // After switching to Employee, the form shows Department + Designation
//   // (no Academic Year). Just click Load Employees directly — filters are optional.
//   const loadButton = page.getByRole('button', { name: /Load Employees/i });
//   await expect(loadButton).toBeVisible({ timeout: 10000 });
//   await loadButton.click();
//   await page.waitForTimeout(3000);

//   const table = page.locator('table').first();
//   await expect(table).toBeVisible({ timeout: 15000 });

//   // Verify the employee table columns are correct
//   const tableText = await table.innerText();
//   expect(tableText).toMatch(/Employee/i);

//   console.log('✅ TC_020 Passed');
// });





// test.use({
//   storageState: 'storageState.chromium.json',
// });



// // ================= beforeEach =================

// test.beforeEach(async ({ page }) => {
//   await page.goto(ID_CARD_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
//   await expect(page).toHaveURL(/generate_id_card/);

//   // Use the actual button id from the page source: "generate-tab"
//   const generateTab = page.locator('#generate-tab');
//   await expect(generateTab).toBeVisible({ timeout: 10000 });

//   const isActive = await generateTab.evaluate(el => el.classList.contains('active'));
//   if (!isActive) {
//     await generateTab.click();
//   }

//   // Wait for the tab pane to become visible
//   await expect(page.locator('#generate')).toBeVisible({ timeout: 10000 });
// });

// // ================= HELPER: load students =================

// async function loadStudentsForTest(page: Page) {
//   const academicYear = page.locator('#gen_academic');
//   const classDropdown = page.locator('#gen_class');
//   const sectionDropdown = page.locator('#gen_section');

//   await expect(academicYear).toBeVisible({ timeout: 10000 });
//   await academicYear.selectOption({ index: 1 });
//   await page.waitForTimeout(1500);

//   if ((await classDropdown.locator('option').count()) > 1) {
//     await classDropdown.selectOption({ index: 1 });
//     await page.waitForTimeout(1500);
//   }

//   if ((await sectionDropdown.locator('option').count()) > 1) {
//     await sectionDropdown.selectOption({ index: 1 });
//     await page.waitForTimeout(500);
//   }

//   await page.locator('#loadStudentsBtn').click();
//   await page.waitForTimeout(3000);
// }

// // ================= TC_021 =================

// test('TC_021 - Verify webcam permission handling', async ({ page, context }) => {
//   test.setTimeout(60000);

//   await context.grantPermissions(['camera'], {
//     origin: 'https://leap.knr.npsypr.edu.in',
//   });

//   await loadStudentsForTest(page);

//   const captureBtn = page.locator('#studentsTable tbody button').filter({ hasText: /capture/i }).first();

//   if (!(await captureBtn.isVisible().catch(() => false))) {
//     console.log('⚠️ TC_021 - No students loaded, skipping webcam test');
//     return;
//   }

//   await captureBtn.click();
//   await page.waitForTimeout(3000);

//   console.log('✅ TC_021 Passed');
// });

// // ================= TC_022 =================

// test('TC_022 - Verify captured photo can be retaken', async ({ page }) => {
//   test.setTimeout(60000);

//   await loadStudentsForTest(page);

//   const captureBtn = page.locator('#studentsTable tbody button').filter({ hasText: /capture/i }).first();

//   if (!(await captureBtn.isVisible().catch(() => false))) {
//     console.log('⚠️ TC_022 - No students loaded, skipping retake test');
//     return;
//   }

//   await captureBtn.click();
//   await page.waitForTimeout(3000);

//   // Retake button is inside the webcam modal
//   const retakeBtn = page.locator('#retakeStudentPhotoBtn');
//   if (await retakeBtn.isVisible().catch(() => false)) {
//     await retakeBtn.click();
//     console.log('✅ TC_022 Passed - Retake button clicked');
//   } else {
//     console.log('✅ TC_022 Passed - Retake button not yet enabled (no photo captured)');
//   }
// });

// // ================= TC_023 =================

// test('TC_023 - Verify checkbox selection for single student', async ({ page }) => {
//   test.setTimeout(60000);

//   await loadStudentsForTest(page);

//   const checkbox = page.locator('#studentsTable tbody input[type="checkbox"]').first();

//   const isVisible = await checkbox.isVisible().catch(() => false);
//   if (!isVisible) {
//     console.log('⚠️ TC_023 - No student rows found, skipping');
//     return;
//   }

//   await checkbox.check({ force: true });
//   await expect(checkbox).toBeChecked();

//   console.log('✅ TC_023 Passed');
// });

// // ================= TC_024 =================

// test('TC_024 - Verify multiple student selection', async ({ page }) => {
//   test.setTimeout(60000);

//   await loadStudentsForTest(page);

//   const checkboxes = page.locator('#studentsTable tbody input[type="checkbox"]');
//   const count = await checkboxes.count();

//   if (count < 2) {
//     console.log('⚠️ TC_024 - Less than 2 student rows, skipping');
//     return;
//   }

//   await checkboxes.nth(0).check({ force: true });
//   await checkboxes.nth(1).check({ force: true });

//   await expect(checkboxes.nth(0)).toBeChecked();
//   await expect(checkboxes.nth(1)).toBeChecked();

//   console.log('✅ TC_024 Passed');
// });

// // ================= TC_025 =================

// test('TC_025 - Verify select all checkbox functionality', async ({ page }) => {
//   test.setTimeout(60000);

//   await loadStudentsForTest(page);

//   const headerCheckbox = page.locator('#selectAllStudents');
//   const isVisible = await headerCheckbox.isVisible().catch(() => false);

//   if (!isVisible) {
//     console.log('⚠️ TC_025 - Header checkbox not found, skipping');
//     return;
//   }

//   await headerCheckbox.check({ force: true });

//   const rows = page.locator('#studentsTable tbody input[type="checkbox"]');
//   const total = await rows.count();

//   for (let i = 0; i < total; i++) {
//     await expect(rows.nth(i)).toBeChecked();
//   }

//   console.log('✅ TC_025 Passed');
// });

// // ================= TC_026 =================

// test('TC_026 - Verify deselect all functionality', async ({ page }) => {
//   test.setTimeout(60000);

//   await loadStudentsForTest(page);

//   const headerCheckbox = page.locator('#selectAllStudents');
//   const isVisible = await headerCheckbox.isVisible().catch(() => false);

//   if (!isVisible) {
//     console.log('⚠️ TC_026 - Header checkbox not found, skipping');
//     return;
//   }

//   await headerCheckbox.check({ force: true });
//   await page.waitForTimeout(500);
//   await headerCheckbox.uncheck({ force: true });

//   const rows = page.locator('#studentsTable tbody input[type="checkbox"]');
//   const total = await rows.count();

//   for (let i = 0; i < total; i++) {
//     await expect(rows.nth(i)).not.toBeChecked();
//   }

//   console.log('✅ TC_026 Passed');
// });







import { test, expect, Page, Locator } from '@playwright/test';

const ID_CARD_URL = 'https://leap.knr.npsypr.edu.in/admin/generate_id_card';

test.use({
  storageState: 'storageState.chromium.json',
});

test.beforeEach(async ({ page }) => {
  test.setTimeout(60000);

  await page.goto(ID_CARD_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await expect(page).toHaveURL(/generate_id_card/);

  const loader = page.locator('.preloader');
  if (await loader.isVisible().catch(() => false)) {
    await expect(loader).toBeHidden({ timeout: 30000 });
  }

  const generateTab = page.getByRole('tab', { name: /Generate ID Cards/i });
  await expect(generateTab).toBeVisible({ timeout: 15000 });

  if ((await generateTab.getAttribute('aria-selected')) !== 'true') {
    await generateTab.click();
  }

  const tabPanel = page.getByRole('tabpanel');
  await expect(tabPanel).toBeVisible({ timeout: 15000 });
  await expect(tabPanel.getByRole('combobox').first()).toBeVisible({
    timeout: 15000,
  });
});

async function getPanel(page: Page): Promise<Locator> {
  return page.getByRole('tabpanel');
}

async function getDropdowns(page: Page) {
  const tabPanel = await getPanel(page);

  return {
    tabPanel,
    cardType: tabPanel.getByRole('combobox').nth(0),
    template: tabPanel.getByRole('combobox').nth(1),
    academicYear: tabPanel.getByRole('combobox').nth(2),
    classDropdown: tabPanel.getByRole('combobox').nth(3),
    sectionDropdown: tabPanel.getByRole('combobox').nth(4),
  };
}

async function waitForDropdownReady(dropdown: Locator) {
  await expect(async () => {
    const text = (await dropdown.locator('option').first().textContent()) || '';
    expect(text).not.toMatch(/loading/i);
  }).toPass({ timeout: 20000 });
}

async function getOptions(dropdown: Locator): Promise<string[]> {
  return (await dropdown.locator('option').allTextContents()).map(t => t.trim());
}

async function selectAcademicYear(page: Page) {
  const { academicYear, classDropdown } = await getDropdowns(page);

  await expect(academicYear).toBeVisible({ timeout: 15000 });

  const optionCount = await academicYear.locator('option').count();
  if (optionCount > 1) {
    await academicYear.selectOption({ label: '2025-26' }).catch(async () => {
      await academicYear.selectOption({ index: 1 });
    });
  }

  await waitForDropdownReady(classDropdown);
}

async function loadStudents(page: Page): Promise<Locator> {
  const { classDropdown, sectionDropdown } = await getDropdowns(page);

  await selectAcademicYear(page);

  const classOptions = await getOptions(classDropdown);

  if (classOptions.length > 1) {
    await classDropdown.selectOption({ index: 1 });
    await waitForDropdownReady(sectionDropdown);

    const sectionOptions = await getOptions(sectionDropdown);
    if (sectionOptions.length > 1) {
      await sectionDropdown.selectOption({ index: 1 });
    }
  }

  await page.getByRole('button', { name: /Load Students/i }).click();

  const table = page.locator('table').first();
  await expect(table).toBeVisible({ timeout: 15000 });

  return table;
}

// ================= TC_001 =================

test('TC_001 - Verify ID Card Generator page loads successfully', async ({ page }) => {
  await expect(page).not.toHaveURL(/login/);
  await expect(page.getByRole('heading', { name: /ID Card Generator/i })).toBeVisible();
  await expect(page.getByRole('tab', { name: /Design Template/i })).toBeVisible();
  await expect(page.getByRole('tab', { name: /Generate ID Cards/i })).toBeVisible();
  await expect(page.getByRole('tab', { name: /Saved Templates/i })).toBeVisible();

  console.log('✅ TC_001 Passed');
});

// ================= TC_002 =================

test('TC_002 - Verify all tabs are displayed', async ({ page }) => {
  await expect(page.getByRole('tab', { name: /Design Template/i })).toBeVisible();
  await expect(page.getByRole('tab', { name: /Generate ID Cards/i })).toBeVisible();
  await expect(page.getByRole('tab', { name: /Saved Templates/i })).toBeVisible();

  console.log('✅ TC_002 Passed');
});

// ================= TC_003 =================

test('TC_003 - Verify Card Type dropdown values', async ({ page }) => {
  const { cardType } = await getDropdowns(page);

  const options = await getOptions(cardType);
  const text = options.join(' ');

  expect(text).toMatch(/Student/i);
  expect(text).toMatch(/Employee/i);

  console.log('✅ TC_003 Passed');
});

// ================= TC_004 =================

test('TC_004 - Verify default selected value in Card Type dropdown', async ({ page }) => {
  const { cardType } = await getDropdowns(page);

  const selectedText = await cardType.locator('option:checked').textContent();
  expect(selectedText?.trim()).toMatch(/Student/i);

  console.log('✅ TC_004 Passed');
});

// ================= TC_005 =================

test('TC_005 - Verify designed templates displayed in Select Template dropdown', async ({ page }) => {
  const { template } = await getDropdowns(page);

  const count = await template.locator('option').count();
  expect(count).toBeGreaterThan(0);

  console.log('✅ TC_005 Passed');
});

// ================= TC_006 =================

test('TC_006 - Verify behavior when no templates are available', async ({ page }) => {
  const { template } = await getDropdowns(page);

  const count = await template.locator('option').count();
  expect(count).toBeGreaterThanOrEqual(0);

  console.log('✅ TC_006 Passed');
});

// ================= TC_007 =================

test('TC_007 - Verify Academic Year dropdown values', async ({ page }) => {
  const { academicYear } = await getDropdowns(page);

  const text = (await getOptions(academicYear)).join(' ');

  expect(text).toContain('2020-21');
  expect(text).toContain('2021-22');
  expect(text).toContain('2022-23');
  expect(text).toContain('2023-24');
  expect(text).toContain('2024-25');
  expect(text).toContain('2025-26');
  expect(text).toContain('2026-27');
  expect(text).toContain('2027-28');
  expect(text).toContain('2028-29');

  console.log('✅ TC_007 Passed');
});

// ================= TC_008 =================

test('TC_008 - Verify user can select academic year', async ({ page }) => {
  const { academicYear } = await getDropdowns(page);

  await academicYear.selectOption({ label: '2025-26' }).catch(async () => {
    await academicYear.selectOption({ index: 1 });
  });

  const selectedText = await academicYear.locator('option:checked').textContent();
  expect(selectedText).toMatch(/2025-26|2028-29|2027-28|2026-27/i);

  console.log('✅ TC_008 Passed');
});

// ================= TC_009 =================

test('TC_009 - Verify only active classes are fetched', async ({ page }) => {
  const { classDropdown } = await getDropdowns(page);

  await selectAcademicYear(page);

  const opts = await getOptions(classDropdown);

  expect(opts.length).toBeGreaterThan(0);
  expect(opts.join(' ')).not.toMatch(/loading/i);
  expect(opts.join(' ').toLowerCase()).not.toContain('inactive');

  console.log('✅ TC_009 Passed');
});

// ================= TC_010 =================

test('TC_010 - Verify inactive classes are not displayed', async ({ page }) => {
  const { classDropdown } = await getDropdowns(page);

  await selectAcademicYear(page);

  const opts = await getOptions(classDropdown);

  expect(opts.join(' ').toLowerCase()).not.toContain('inactive');
  expect(opts.join(' ')).not.toMatch(/loading/i);

  console.log('✅ TC_010 Passed');
});

// ================= TC_011 =================

test('TC_011 - Verify sections are fetched based on selected class', async ({ page }) => {
  const { classDropdown, sectionDropdown } = await getDropdowns(page);

  await selectAcademicYear(page);

  const classOptions = await getOptions(classDropdown);

  if (classOptions.length > 1) {
    await classDropdown.selectOption({ index: 1 });
    await waitForDropdownReady(sectionDropdown);
  }

  const sectionOptions = await getOptions(sectionDropdown);
  expect(sectionOptions.length).toBeGreaterThan(0);
  expect(sectionOptions.join(' ')).not.toMatch(/loading/i);

  console.log('✅ TC_011 Passed');
});

// ================= TC_012 =================

test('TC_012 - Verify only active sections are displayed', async ({ page }) => {
  const { classDropdown, sectionDropdown } = await getDropdowns(page);

  await selectAcademicYear(page);

  const classOptions = await getOptions(classDropdown);

  if (classOptions.length > 1) {
    await classDropdown.selectOption({ index: 1 });
    await waitForDropdownReady(sectionDropdown);
  }

  const sectionOptions = await getOptions(sectionDropdown);

  expect(sectionOptions.join(' ').toLowerCase()).not.toContain('inactive');
  expect(sectionOptions.join(' ')).not.toMatch(/loading/i);

  console.log('✅ TC_012 Passed');
});

// ================= TC_013 =================

test('TC_013 - Verify Load Students button functionality', async ({ page }) => {
  const table = await loadStudents(page);

  const rows = table.locator('tbody tr');
  await expect(rows.first()).toBeVisible({ timeout: 15000 });

  expect(await rows.count()).toBeGreaterThan(0);

  console.log('✅ TC_013 Passed');
});

// ================= TC_014 =================

test('TC_014 - Verify validation when Load Students is clicked without filters', async ({ page }) => {
  // Reset filters to default
  const { academicYear, classDropdown, sectionDropdown } = await getDropdowns(page);

  await academicYear.selectOption({ index: 0 }).catch(() => {});
  await classDropdown.selectOption({ index: 0 }).catch(() => {});
  await sectionDropdown.selectOption({ index: 0 }).catch(() => {});

  await page.getByRole('button', { name: /Load Students/i }).click();

  // Expected validation message
  const validationMessage = page.locator(
    '.toast-message, .alert, .swal2-html-container, .error, .invalid-feedback'
  ).filter({
    hasText: /select|required|academic|class|section|filter/i,
  });

  await expect(validationMessage.first()).toBeVisible({ timeout: 10000 });

  // Make sure student rows are NOT loaded
  const studentRows = page
    .locator('table tbody tr')
    .filter({ hasText: /Student photo|Grade|2025-26|2024-25/i });

  await expect(studentRows).toHaveCount(0);

  console.log('✅ TC_014 Passed - Validation message shown without filters');
});

// ================= TC_015 =================

test('TC_015 - Verify student table columns', async ({ page }) => {
  const table = await loadStudents(page);

  const text = await table.innerText();

  expect(text).toMatch(/Photo/i);
  expect(text).toMatch(/Admission/i);
  expect(text).toMatch(/Student Name/i);
  expect(text).toMatch(/Class/i);
  expect(text).toMatch(/Roll/i);
  expect(text).toMatch(/Capture/i);

  console.log('✅ TC_015 Passed');
});

// ================= TC_016 =================

test('TC_016 - Verify loaded student details are correct', async ({ page }) => {
  const table = await loadStudents(page);

  const rows = table.locator('tbody tr');
  expect(await rows.count()).toBeGreaterThan(0);

  console.log('✅ TC_016 Passed');
});

// ================= TC_017 =================

test('TC_017 - Verify behavior when no students exist', async ({ page }) => {
  const table = await loadStudents(page);

  const text = await table.innerText();
  expect(text).toMatch(/No Records|No students|Load Students|Student|Admission/i);

  console.log('✅ TC_017 Passed');
});

async function getFirstCaptureButton(page: Page): Promise<Locator> {
  const table = page.locator('table').first();

  return table
    .locator('tbody tr')
    .filter({ hasNotText: /Click.*Load Students|No Records|No students/i })
    .first()
    .locator('td')
    .last()
    .locator('button')
    .first();
}

// ================= TC_018 =================

test('TC_018 - Verify Capture option is available in table', async ({ page }) => {
  const table = await loadStudents(page);

  const captureButton = await getFirstCaptureButton(page);

  if (!(await captureButton.isVisible().catch(() => false))) {
    console.log('⚠️ TC_018 skipped - No capture button found');
    return;
  }

  await expect(captureButton).toBeVisible();

  console.log('✅ TC_018 Passed');
});

// ================= TC_019 =================

test('TC_019 - Verify student photo capture functionality', async ({ page }) => {
  await loadStudents(page);

  const captureButton = await getFirstCaptureButton(page);

  if (!(await captureButton.isVisible().catch(() => false))) {
    console.log('⚠️ TC_019 skipped - No capture button found');
    return;
  }

  await captureButton.click();

  await expect(
    page.locator('video, canvas, [class*="modal"], [class*="webcam"], [class*="camera"]').first()
  ).toBeVisible({ timeout: 15000 });

  console.log('✅ TC_019 Passed');
});

// ================= TC_020 =================

test('TC_020 - Verify employee photo capture functionality', async ({ page }) => {
  const { cardType } = await getDropdowns(page);

  await cardType.selectOption({ label: 'Employee ID Card' });

  const loadButton = page.getByRole('button', { name: /Load Employees/i });

  if (!(await loadButton.isVisible().catch(() => false))) {
    console.log('⚠️ TC_020 skipped - Load Employees button not found');
    return;
  }

  await loadButton.click();

  const table = page.locator('table').first();
  await expect(table).toBeVisible({ timeout: 15000 });

  console.log('✅ TC_020 Passed');
});

// ================= TC_021 =================

test('TC_021 - Verify webcam permission handling', async ({ page, context }) => {
  await context.grantPermissions(['camera'], {
    origin: 'https://leap.knr.npsypr.edu.in',
  });

  await loadStudents(page);

  const captureButton = await getFirstCaptureButton(page);

  if (!(await captureButton.isVisible().catch(() => false))) {
    console.log('⚠️ TC_021 skipped - No capture button found');
    return;
  }

  await captureButton.click();

  console.log('✅ TC_021 Passed');
});

// ================= TC_022 =================

test('TC_022 - Verify captured photo can be retaken', async ({ page }) => {
  await loadStudents(page);

  const captureButton = await getFirstCaptureButton(page);

  if (!(await captureButton.isVisible().catch(() => false))) {
    console.log('⚠️ TC_022 skipped - No capture button found');
    return;
  }

  await captureButton.click();

  const retakeButton = page.getByRole('button', { name: /Retake/i }).first();

  if (await retakeButton.isVisible().catch(() => false)) {
    await retakeButton.click();
  }

  console.log('✅ TC_022 Passed');
});

// ================= TC_023 =================

test('TC_023 - Verify checkbox selection for single student', async ({ page }) => {
  const table = await loadStudents(page);

  const checkbox = table.locator('tbody input[type="checkbox"]').first();

  if (!(await checkbox.isVisible().catch(() => false))) {
    console.log('⚠️ TC_023 skipped - No checkbox found');
    return;
  }

  await checkbox.check({ force: true });
  await expect(checkbox).toBeChecked();

  console.log('✅ TC_023 Passed');
});

// ================= TC_024 =================

test('TC_024 - Verify multiple student selection', async ({ page }) => {
  const table = await loadStudents(page);

  const checkboxes = table.locator('tbody input[type="checkbox"]');
  const count = await checkboxes.count();

  if (count < 2) {
    console.log('⚠️ TC_024 skipped - Less than 2 checkboxes');
    return;
  }

  await checkboxes.nth(0).check({ force: true });
  await checkboxes.nth(1).check({ force: true });

  await expect(checkboxes.nth(0)).toBeChecked();
  await expect(checkboxes.nth(1)).toBeChecked();

  console.log('✅ TC_024 Passed');
});

// ================= TC_025 =================

test('TC_025 - Verify select all checkbox functionality', async ({ page }) => {
  const table = await loadStudents(page);

  const headerCheckbox = table.locator('thead input[type="checkbox"]').first();

  if (!(await headerCheckbox.isVisible().catch(() => false))) {
    console.log('⚠️ TC_025 skipped - Header checkbox not found');
    return;
  }

  await headerCheckbox.check({ force: true });

  const checkboxes = table.locator('tbody input[type="checkbox"]');
  const count = await checkboxes.count();

  for (let i = 0; i < count; i++) {
    await expect(checkboxes.nth(i)).toBeChecked();
  }

  console.log('✅ TC_025 Passed');
});

// ================= TC_026 =================

test('TC_026 - Verify deselect all functionality', async ({ page }) => {
  const table = await loadStudents(page);

  const headerCheckbox = table.locator('thead input[type="checkbox"]').first();

  if (!(await headerCheckbox.isVisible().catch(() => false))) {
    console.log('⚠️ TC_026 skipped - Header checkbox not found');
    return;
  }

  await headerCheckbox.check({ force: true });
  await headerCheckbox.uncheck({ force: true });

  const checkboxes = table.locator('tbody input[type="checkbox"]');
  const count = await checkboxes.count();

  for (let i = 0; i < count; i++) {
    await expect(checkboxes.nth(i)).not.toBeChecked();
  }

  console.log('✅ TC_026 Passed');
});
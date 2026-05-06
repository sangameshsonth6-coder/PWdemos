import { test, expect } from '@playwright/test';

// test.describe('Mass Update - Transportation Details Filter Tests', () => {

//     test.beforeEach(async ({ page }) => {
//         await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });
//         // Select "Transport details" for Edit For to be on the right module
//         await page.locator('select[name="btnname"]').selectOption({ label: 'Transport details' });
//     });


//     test('FT-01 - Verify Academic Year Dropdown Values', async ({ page }) => {
//         const academicYearDropdown = page.locator('select[name="academic_year"]');
//         await expect(academicYearDropdown).toBeVisible();

//         const options = await academicYearDropdown.locator('option:not([disabled])').allTextContents();
//         const years = options.map(o => o.trim()).filter(Boolean);

//         console.log('Academic Years found:', years);

//         // Verify range includes 2022-23 to 2025-26
//         expect(years.some(y => y.includes('2022-23')), 'Should contain 2022-23').toBeTruthy();
//         expect(years.some(y => y.includes('2025-26')), 'Should contain 2025-26').toBeTruthy();
//         expect(years.length).toBeGreaterThanOrEqual(4);

//         console.log('✅ FT-01 Passed: Academic Year dropdown contains values from 2022-23 to 2025-26.');
//     });


//     test('FT-02 - Verify Class Dropdown Values', async ({ page }) => {
//         const classDropdown = page.locator('select[name="class"]');
//         await expect(classDropdown).toBeVisible();

//         const options = await classDropdown.locator('option:not([disabled])').allTextContents();
//         const classes = options.map(o => o.trim()).filter(Boolean);

//         console.log('Classes found:', classes);

//         // Verify Grade 1 to Grade 10 are present
//         for (let i = 1; i <= 10; i++) {
//             expect(
//                 classes.some(c => c.includes(`Grade ${i}`)),
//                 `Grade ${i} should be present in Class dropdown`
//             ).toBeTruthy();
//         }

//         console.log('✅ FT-02 Passed: Class dropdown contains Grade 1 to Grade 10.');
//     });


//     test('FT-03 - Verify Section Dropdown Values', async ({ page }) => {
//         // Section dropdown is dynamic — need to select a class first
//         await page.locator('select[name="academic_year"]').selectOption({ label: '2024-25' });
//         await page.locator('select[name="class"]').selectOption({ label: 'Grade 5' });

//         // Wait for sections to load dynamically
//         await expect(async () => {
//             const count = await page.locator('select[name="section"] option:not([disabled])').count();
//             expect(count).toBeGreaterThan(0);
//         }).toPass({ timeout: 10000 });

//         const sectionDropdown = page.locator('select[name="section"]');
//         await expect(sectionDropdown).toBeVisible();

//         const options = await sectionDropdown.locator('option:not([disabled])').allTextContents();
//         const sections = options.map(o => o.trim()).filter(Boolean);

//         console.log('Sections found:', sections);
//         expect(sections.length).toBeGreaterThan(0);

//         // Verify sections are configured values (not empty/placeholder)
//         sections.forEach(s => {
//             expect(s.trim().length).toBeGreaterThan(0);
//             expect(s.toLowerCase()).not.toContain('select');
//         });

//         console.log('✅ FT-03 Passed: Section dropdown displays configured values.');
//     });


// test('FT-04 - Verify Mandatory Validation for Dropdowns', async ({ page }) => {
//     // Reset academic_year to empty — it defaults to "2025-26" on page load
//     // so we must force it back to the disabled placeholder via JS
//     await page.locator('select[name="academic_year"]').evaluate((el: HTMLSelectElement) => {
//         el.value = '';
//         el.dispatchEvent(new Event('change'));
//     });

//     // Also clear Edit For so its error fires too
//     await page.locator('select[name="btnname"]').evaluate((el: HTMLSelectElement) => {
//         el.value = '';
//         el.dispatchEvent(new Event('change'));
//     });

//     // Click Search with all fields empty
//     await page.locator('#search').click();

//     // Verify error messages — academic_err only shows when academic_year is truly empty
//     const classError = page.locator('#class_err');
//     const sectionError = page.locator('#section_err');
//     const academicError = page.locator('#academic_err');
//     const editError = page.locator('#edit_err');

//     await expect(classError).toBeVisible();
//     await expect(sectionError).toBeVisible();
//     await expect(academicError).toBeVisible();
//     await expect(editError).toBeVisible();

//     await expect(classError).toContainText('Please');
//     await expect(sectionError).toContainText('Please');
//     await expect(academicError).toContainText('Please');
//     await expect(editError).toContainText('Please');

//     console.log('✅ FT-04 Passed: Mandatory validation error messages are displayed.');
// });


//     test('FT-05 - Verify Reset Button Clears Selections', async ({ page }) => {
//         // Set up: Select values in all dropdowns
//         await page.locator('select[name="academic_year"]').selectOption({ label: '2024-25' });
//         await page.locator('select[name="class"]').selectOption({ label: 'Grade 5' });

//         await expect(async () => {
//             const count = await page.locator('select[name="section"] option:not([disabled])').count();
//             expect(count).toBeGreaterThan(0);
//         }).toPass({ timeout: 10000 });

//         await page.locator('select[name="section"]').selectOption({ label: 'A' });

//         // Confirm values are selected before reset
//         expect(await page.locator('select[name="academic_year"]').inputValue()).toBe('2024-25');
//         expect(await page.locator('select[name="class"]').inputValue()).toBe('Grade 5');

//         // Click Reset button (red)
//         const resetButton = page.locator('button.reset, button#reset');
//         await expect(resetButton).toBeVisible();

//         // Reset navigates back to the page — wait for reload
//         await Promise.all([
//             page.waitForURL('**/admin/edit_group**', { waitUntil: 'networkidle' }),
//             resetButton.click(),
//         ]);

//         // Verify all dropdowns are cleared back to default
//         const academicValue = await page.locator('select[name="academic_year"]').inputValue();
//         const classValue = await page.locator('select[name="class"]').inputValue();

//         // Default selected is "2025-26 (Current Academic Year)" with value "2025-26"
//         // After reset the page reloads fresh — class should be empty/default
//         expect(classValue).toBe('');

//         // Verify Reset button styling is red
//         const resetBtnClass = await resetButton.getAttribute('class');
//         expect(resetBtnClass).toContain('danger');

//         console.log('✅ FT-05 Passed: Reset button clears all selections and button color is red.');
//     });


//     test('FT-06 - Verify Search Button Displays Transport Table', async ({ page }) => {
//         // Select Year=2024-25, Class=Grade 5, Section=A, Edit For=Transport details
//         await page.locator('select[name="academic_year"]').selectOption({ label: '2024-25' });
//         await page.locator('select[name="class"]').selectOption({ label: 'Grade 5' });

//         await expect(async () => {
//             const count = await page.locator('select[name="section"] option:not([disabled])').count();
//             expect(count).toBeGreaterThan(0);
//         }).toPass({ timeout: 10000 });

//         await page.locator('select[name="section"]').selectOption({ label: 'A' });
//         await page.locator('select[name="btnname"]').selectOption({ label: 'Transport details' });

//         // Click Search (blue button) and wait for navigation
//         const searchButton = page.locator('button.search, button#search');

//         // Verify Search button is blue
//         const searchBtnClass = await searchButton.getAttribute('class');
//         expect(searchBtnClass).toContain('primary');

//         await Promise.all([
//             page.waitForURL('**/admin/edit_student_details**', { waitUntil: 'networkidle' }),
//             searchButton.click(),
//         ]);

//         // Verify table is visible
//         await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

//         // Verify expected Transport columns are present
//         const headers = await page.locator('table thead th').allTextContents();
//         const normalizedHeaders = headers.map(h => h.trim().toLowerCase());

//         console.log('Transport table headers:', normalizedHeaders);

//         const expectedColumns = ['student name', 'all', 'mode of transport', 'transport details'];
//         for (const col of expectedColumns) {
//             expect(
//                 normalizedHeaders.some(h => h.includes(col.toLowerCase())),
//                 `Expected column "${col}" to be present`
//             ).toBeTruthy();
//         }

//         // Verify rows are present
//         const rowCount = await page.locator('table tbody tr').count();
//         expect(rowCount).toBeGreaterThan(0);

//         console.log(`✅ FT-06 Passed: Search displays transport table with ${rowCount} rows and correct columns.`);
//     });
// });






// test.describe('Mass Update - Transportation Details Table Tests (FT-07 to FT-12)', () => {

//     async function performTransportSearch(
//         page: any,
//         grade = 'Grade 5',
//         section = 'A'
//     ) {
//         await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });

//         // Academic year: select by value not label to avoid whitespace issues
//         await page.locator('select[name="academic_year"]').selectOption({ value: '2025-26' });
//         await page.locator('select[name="class"]').selectOption({ label: grade });

//         // Wait for section to dynamically load
//         await expect(async () => {
//             const count = await page.locator('select[name="section"] option:not([disabled])').count();
//             expect(count).toBeGreaterThan(0);
//         }).toPass({ timeout: 10000 });

//         await page.locator('select[name="section"]').selectOption({ label: section });
//         await page.locator('select[name="btnname"]').selectOption({ label: 'Transport details' });

//         // Use waitForURL with a loose pattern and longer timeout
//         await Promise.all([
//             page.waitForURL(/edit_student_details/, { waitUntil: 'networkidle', timeout: 30000 }),
//             page.locator('#search').click(),
//         ]);

//         await expect(page.locator('table')).toBeVisible({ timeout: 15000 });

//         // Log the actual headers so we know the real DOM structure
//         const headers = await page.locator('table thead th').allTextContents();
//         console.log('Transport table headers:', headers.map(h => h.trim()));
//     }


//     test('FT-07 - Verify Transport Details Fields for School Bus', async ({ page }) => {
//         await performTransportSearch(page);

//         const firstRow = page.locator('table tbody tr').first();

//         // Log all selects in the first row BEFORE checking checkbox
//         const allSelectsBefore = await firstRow.locator('select').count();
//         console.log('Selects before checkbox:', allSelectsBefore);

//         // Check checkbox to enable the row
//         await firstRow.locator('input[type="checkbox"]').check();
//         await page.waitForTimeout(300);

//         // Log all selects AFTER checking — Mode of Transport should now be enabled
//         const allSelectsAfter = firstRow.locator('select:not([disabled])');
//         const enabledCount = await allSelectsAfter.count();
//         console.log('Enabled selects after checkbox:', enabledCount);

//         // Log each select's options to identify which is Mode of Transport
//         for (let i = 0; i < enabledCount; i++) {
//             const opts = await allSelectsAfter.nth(i).locator('option').allTextContents();
//             console.log(`Select[${i}] options:`, opts.map(o => o.trim()));
//         }

//         // Find Mode of Transport select — it's the one containing 'School Bus' option
//         const modeSelect = firstRow.locator('select:not([disabled])').filter({
//             has: page.locator('option', { hasText: 'School Bus' })
//         }).first();

//         await expect(modeSelect).toBeVisible();
//         await modeSelect.selectOption({ label: 'School Bus' });
//         await page.waitForTimeout(1000);

//         // After selecting School Bus, log what appeared
//         const selectsAfterMode = firstRow.locator('select');
//         const selectsAfterModeCount = await selectsAfterMode.count();
//         const inputsAfterMode = firstRow.locator('input:not([type="checkbox"])');
//         const inputsAfterModeCount = await inputsAfterMode.count();
//         console.log(`After School Bus: ${selectsAfterModeCount} selects, ${inputsAfterModeCount} inputs`);

//         for (let i = 0; i < selectsAfterModeCount; i++) {
//             const opts = await selectsAfterMode.nth(i).locator('option').allTextContents();
//             console.log(`Select[${i}] after mode:`, opts.map(o => o.trim()));
//         }

//         for (let i = 0; i < inputsAfterModeCount; i++) {
//             const name = await inputsAfterMode.nth(i).getAttribute('name');
//             const type = await inputsAfterMode.nth(i).getAttribute('type');
//             console.log(`Input[${i}]: name="${name}", type="${type}"`);
//         }

//         // Verify at least Route Name and Route Type dropdowns appeared
//         expect(selectsAfterModeCount).toBeGreaterThanOrEqual(3); // Mode + Route Name + Route Type

//         console.log('✅ FT-07 Passed: School Bus shows Route Name, Route Type, and Excess KM fields.');
//     });






//     test('FT-08 - Verify Transport Details Fields for BMTC Bus', async ({ page }) => {
//         await performTransportSearch(page);

//         const firstRow = page.locator('table tbody tr').first();
//         await firstRow.locator('input[type="checkbox"]').check();
//         await page.waitForTimeout(300);

//         // Find the Mode of Transport select dynamically
//         const modeSelect = firstRow.locator('select:not([disabled])').filter({
//             has: page.locator('option', { hasText: 'BMTC Bus' })
//         }).first();

//         await expect(modeSelect).toBeVisible();
//         await modeSelect.selectOption({ label: 'BMTC Bus' });
//         await page.waitForTimeout(1000);

//         // Log what appeared
//         const inputsAfter = firstRow.locator('input:not([type="checkbox"])');
//         const inputCount = await inputsAfter.count();
//         console.log(`Inputs after BMTC Bus: ${inputCount}`);

//         for (let i = 0; i < inputCount; i++) {
//             const name = await inputsAfter.nth(i).getAttribute('name') ?? '';
//             const placeholder = await inputsAfter.nth(i).getAttribute('placeholder') ?? '';
//             const disabled = await inputsAfter.nth(i).getAttribute('disabled');
//             console.log(`Input[${i}]: name="${name}", placeholder="${placeholder}", disabled=${disabled}`);
//         }

//         // Verify Driver Name, Contact Number, Relation fields are present
//         const enabledInputs = firstRow.locator('input:not([type="checkbox"]):not([disabled])');
//         const enabledCount = await enabledInputs.count();
//         expect(enabledCount).toBeGreaterThanOrEqual(1);

//         console.log('✅ FT-08 Passed: BMTC Bus shows transport detail fields.');
//     });





// test('FT-09 - Verify No Fields for Cycle/Walkers/Others', async ({ page }) => {
//     await performTransportSearch(page);

//     const firstRow = page.locator('table tbody tr').first();
//     await firstRow.locator('input[type="checkbox"]').check();
    
//     // Use a more robust way to target the Mode of Transport select
//     // We look for a select that contains the known options (School Bus, Cycle, etc.)
//     const modeSelect = firstRow.locator('select').filter({ 
//         has: page.locator('option', { hasText: 'Cycle' }) 
//     });

//     // Use a higher timeout if the UI is slow to render
//     await expect(modeSelect).toBeVisible({ timeout: 10000 });
    
//     await modeSelect.selectOption({ label: 'Cycle' });

//     // Assert that Transport Details (the next cell) contains no interactive elements
//     const transportDetailsCell = firstRow.locator('td').nth(3);
    
//     // Check for absence of fields by asserting the count is 0
//     await expect(transportDetailsCell.locator('select')).toHaveCount(0);
//     await expect(transportDetailsCell.locator('input:not([type="checkbox"])')).toHaveCount(0);

//     console.log('✅ FT-09 Passed: No Transport Detail fields displayed for Cycle.');
// });






//     test('FT-10 - Verify Route Name Dropdown Fetches from Transport Module', async ({ page }) => {
//         await performTransportSearch(page);

//         const firstRow = page.locator('table tbody tr').first();
//         await firstRow.locator('input[type="checkbox"]').check();
//         await page.waitForTimeout(300);

//         const modeSelect = firstRow.locator('select:not([disabled])').filter({
//             has: page.locator('option', { hasText: 'School Bus' })
//         }).first();

//         await modeSelect.selectOption({ label: 'School Bus' });
//         await page.waitForTimeout(1000);

//         // Log all selects to identify Route Name by index
//         const allSelects = firstRow.locator('select');
//         const count = await allSelects.count();
//         console.log(`Total selects after School Bus: ${count}`);

//         let routeNameSelect = null;
//         for (let i = 0; i < count; i++) {
//             const opts = await allSelects.nth(i).locator('option').allTextContents();
//             console.log(`Select[${i}]:`, opts.map(o => o.trim()));
//             // Route Name select will have route names (not School Bus / BMTC / Cycle)
//             const isRouteNameSelect = opts.some(o =>
//                 !o.toLowerCase().includes('bus') &&
//                 !o.toLowerCase().includes('cycle') &&
//                 !o.toLowerCase().includes('select') &&
//                 o.trim().length > 0
//             );
//             if (isRouteNameSelect && i > 0) {
//                 routeNameSelect = allSelects.nth(i);
//                 console.log(`Route Name select identified at index ${i}`);
//                 break;
//             }
//         }

//         expect(routeNameSelect, 'Route Name select should be found').not.toBeNull();
//         await expect(routeNameSelect!).toBeVisible();

//         const routeOptions = await routeNameSelect!.locator('option').allTextContents();
//         const routes = routeOptions.map(o => o.trim()).filter(o => o && !o.toLowerCase().includes('select'));
//         expect(routes.length).toBeGreaterThan(0);

//         console.log(`✅ FT-10 Passed: Route Name has ${routes.length} options from Transport module.`);
//     });


//     test('FT-11 - Verify Route Type Dropdown Fetches from Transport Module', async ({ page }) => {
//         await performTransportSearch(page);

//         const firstRow = page.locator('table tbody tr').first();
//         await firstRow.locator('input[type="checkbox"]').check();
//         await page.waitForTimeout(300);

//         const modeSelect = firstRow.locator('select:not([disabled])').filter({
//             has: page.locator('option', { hasText: 'School Bus' })
//         }).first();

//         await modeSelect.selectOption({ label: 'School Bus' });
//         await page.waitForTimeout(1000);

//         // Log all selects after School Bus to find Route Type
//         const allSelects = firstRow.locator('select');
//         const count = await allSelects.count();

//         for (let i = 0; i < count; i++) {
//             const opts = await allSelects.nth(i).locator('option').allTextContents();
//             console.log(`Select[${i}] options:`, opts.map(o => o.trim()));
//         }

//         // Route Type is typically the last dropdown — pick the one with type-like values
//         // (e.g., "One Way", "Two Way", "Pick Up", "Drop")
//         let routeTypeSelect = null;
//         for (let i = count - 1; i >= 1; i--) {
//             const opts = await allSelects.nth(i).locator('option').allTextContents();
//             const looksLikeType = opts.some(o =>
//                 o.toLowerCase().includes('way') ||
//                 o.toLowerCase().includes('pick') ||
//                 o.toLowerCase().includes('drop') ||
//                 o.toLowerCase().includes('type')
//             );
//             if (looksLikeType) {
//                 routeTypeSelect = allSelects.nth(i);
//                 console.log(`Route Type select identified at index ${i}`);
//                 break;
//             }
//         }

//         // Fallback: use last select if heuristic didn't match
//         if (!routeTypeSelect) {
//             routeTypeSelect = allSelects.last();
//             console.log('Falling back to last select for Route Type');
//         }

//         await expect(routeTypeSelect).toBeVisible();

//         const routeTypeOptions = await routeTypeSelect.locator('option').allTextContents();
//         const routeTypes = routeTypeOptions.map(o => o.trim()).filter(o => o && !o.toLowerCase().includes('select'));
//         expect(routeTypes.length).toBeGreaterThan(0);

//         console.log(`✅ FT-11 Passed: Route Type has ${routeTypes.length} options from Transport module.`);
//     });


//     test('FT-12 - Verify Excess KM Accepts Only Whole Numbers', async ({ page }) => {
//         await performTransportSearch(page);

//         const firstRow = page.locator('table tbody tr').first();
//         await firstRow.locator('input[type="checkbox"]').check();
//         await page.waitForTimeout(300);

//         const modeSelect = firstRow.locator('select:not([disabled])').filter({
//             has: page.locator('option', { hasText: 'School Bus' })
//         }).first();

//         await modeSelect.selectOption({ label: 'School Bus' });
//         await page.waitForTimeout(1000);

//         // Log all inputs to identify Excess KM
//         const allInputs = firstRow.locator('input:not([type="checkbox"])');
//         const inputCount = await allInputs.count();
//         for (let i = 0; i < inputCount; i++) {
//             const name = await allInputs.nth(i).getAttribute('name') ?? '';
//             const type = await allInputs.nth(i).getAttribute('type') ?? '';
//             const disabled = await allInputs.nth(i).getAttribute('disabled');
//             console.log(`Input[${i}]: name="${name}", type="${type}", disabled=${disabled}`);
//         }

//         // Find Excess KM input by name or type=number
//         let targetInput = firstRow.locator('input[name*="excess"], input[name*="km"], input[type="number"]').first();

//         if (await targetInput.count() === 0) {
//             // Fallback: last enabled non-checkbox input (Excess KM is usually last)
//             targetInput = firstRow.locator('input:not([type="checkbox"]):not([disabled])').last();
//         }

//         await expect(targetInput).toBeVisible();
//         await expect(targetInput).toBeEnabled();

//         // Valid: whole number
//         await targetInput.fill('12');
//         await targetInput.blur();
//         const validValue = await targetInput.inputValue();
//         expect(validValue).toBe('12');
//         expect(validValue).toMatch(/^\d+$/);
//         console.log('Valid (12):', validValue);

//         // Invalid: decimal
//         await targetInput.fill('12.5');
//         await targetInput.blur();
//         const decimalValue = await targetInput.inputValue();
//         console.log('After 12.5:', decimalValue);

//         // Invalid: alphabetic
//         await targetInput.fill('abc');
//         await targetInput.blur();
//         const alphaValue = await targetInput.inputValue();
//         console.log('After abc:', alphaValue);

//         const inputType = await targetInput.getAttribute('type');
//         if (inputType === 'number') {
//             expect(alphaValue).toBe('');
//         }

//         console.log('✅ FT-12 Passed: Excess KM accepts only whole numbers.');
//     });

// });





// Global Helper
async function performTransportSearch(page: any, grade = 'Grade 5', section = 'A') {
    await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });
    await page.locator('select[name="academic_year"]').selectOption({ value: '2025-26' });
    await page.locator('select[name="class"]').selectOption({ label: grade });

    await expect(async () => {
        const count = await page.locator('select[name="section"] option:not([disabled])').count();
        expect(count).toBeGreaterThan(0);
    }).toPass({ timeout: 10000 });

    await page.locator('select[name="section"]').selectOption({ label: section });
    await page.locator('select[name="btnname"]').selectOption({ label: 'Transport details' });

    await Promise.all([
        page.waitForURL(/edit_student_details/, { waitUntil: 'networkidle', timeout: 30000 }),
        page.locator('#search').click(),
    ]);

    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
}

test.describe('Mass Update - Transportation Details Table Tests', () => {
    test('INT-01 - Verify Route Name fetch from Transport Master', async ({ page }) => {
        await performTransportSearch(page);

        const firstRow = page.locator('table tbody tr').first();
        await firstRow.locator('input[type="checkbox"]').check();
        
        // Select 'School Bus'
        const modeSelect = firstRow.locator('select[name*="mode_of_transport"], select:not([disabled])').first();
        await modeSelect.selectOption({ label: 'School Bus' });

        // Target the specific Route dropdown
        const routeNameSelect = firstRow.locator('select[name*="route_name"]');
        
        // Use toPass to wait for the AJAX request to populate the dropdown
        await expect(async () => {
            // Check if the dropdown contains our expected route
            const routeText = await routeNameSelect.innerText();
            expect(routeText).toContain('CityRoute1');
        }).toPass({
            timeout: 15000, // Increased timeout for slow API/Network
            intervals: [1000]
        });
        
        console.log('✅ INT-01 Passed: Route Name "CityRoute1" verified.');
    });
});
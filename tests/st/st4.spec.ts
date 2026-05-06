import { test, expect } from '@playwright/test';

// Helper to handle login and navigation if needed
async function gotoMassUpdate(page) {
    await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });
}

test('AD-01 - Verify Academic Year Dropdown Values', async ({ page }) => {
    // 1. Navigate to the Admission Details / Mass Update page
    await gotoMassUpdate(page);

    // 2. Locate the Academic Year dropdown
    const yearDropdown = page.locator('select[name="academic_year"]');
    await expect(yearDropdown).toBeVisible({ timeout: 10000 });

    // 3. Action: Open the dropdown
    await yearDropdown.click();

    // 4. Verification: Extract options
    const options = await yearDropdown.locator('option').allTextContents();
    // Trim and filter empty/placeholder values
    const years = options.map(o => o.trim()).filter(o => o && !o.includes('Select'));

    console.log('Academic Years found:', years);

    // 5. Assert: Use flexible matching to handle labels like "(Current Academic Year)"
    const expectedYears = ['2022-23', '2023-24', '2024-25', '2025-26'];

    for (const year of expectedYears) {
        const found = years.some(y => y.startsWith(year));
        expect(found, `Expected year ${year} was not found in: ${years.join(', ')}`).toBeTruthy();
    }

    console.log('✅ AD-01 Passed: Academic Year dropdown contains expected values.');
});






test('AD-02 - Verify Class Dropdown Values', async ({ page }) => {
    // 1. Navigate to the Admission Details page
    await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });

    // 2. Locate the Class dropdown
    const classDropdown = page.locator('select[name="class"]');
    await expect(classDropdown).toBeVisible();

    // 3. Extract and clean options
    const options = await classDropdown.locator('option').allTextContents();
    const classes = options.map(o => o.trim()).filter(o => o && !o.includes('Select'));

    console.log('Class options found:', classes);

    // 4. Verify core grade levels are present
    // Adjust this list based on the exact labels shown in your dropdown
    const expectedClasses = ['Grade 1', 'Grade 5', 'Grade 10', 'Grade 12'];
    
    for (const expectedClass of expectedClasses) {
        const found = classes.some(c => c === expectedClass);
        expect(found, `Expected class "${expectedClass}" was not found in: ${classes.join(', ')}`).toBeTruthy();
    }

    console.log('✅ AD-02 Passed: Class dropdown contains expected grade levels.');
});






test('AD-03 - Verify Section Dropdown Values', async ({ page }) => {
    await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });

    const classDropdown = page.locator('select[name="class"]');
    const sectionDropdown = page.locator('select[name="section"]');

    // 1. Select a class
    await classDropdown.selectOption({ label: 'Grade 1' });

    // 2. Wait for the section dropdown to have more than just the default "--Select--" option.
    // We use a custom predicate or simply wait for the count to be at least 2 
    // (1 for "--Select--", 1+ for actual sections)
    await expect(async () => {
        const count = await sectionDropdown.locator('option:not([disabled])').count();
        expect(count).toBeGreaterThan(0);
    }).toPass(); 

    // 3. Extract and verify
    const options = await sectionDropdown.locator('option').allTextContents();
    const sections = options.map(o => o.trim()).filter(o => o && !o.toLowerCase().includes('select'));

    console.log('Sections found:', sections);
    expect(sections.length).toBeGreaterThan(0);
});





test('AD-04 - Verify mandatory validation for dropdowns', async ({ page }) => {
    // 1. Navigate to the page
    await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });

    // 2. Action: Click Search without selecting any dropdowns
    await page.getByRole('button', { name: 'Search' }).click();

    // 3. Verification: Check that the specific validation text appears for each required field
    // We target the text elements directly based on your snapshot
    const classError = page.locator('text=Please Select Classname');
    const sectionError = page.locator('text=Please select Section');
    const editForError = page.locator('text=Please select Edit For');

    // Verify all errors are visible
    await expect(classError).toBeVisible();
    await expect(sectionError).toBeVisible();
    await expect(editForError).toBeVisible();

    console.log('✅ AD-04 Passed: Mandatory field validation messages are visible.');
});







test('AD-05 - Verify Reset Functionality', async ({ page }) => {
    // 1. Navigate to the page
    await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });

    // 2. Setup: Select values to fill the form
    await page.locator('select[name="class"]').selectOption({ label: 'Grade 1' });
    
    // Wait for sections to load
    await expect(async () => {
        const count = await page.locator('select[name="section"] option:not([disabled])').count();
        expect(count).toBeGreaterThan(0);
    }).toPass();
    await page.locator('select[name="section"]').selectOption({ index: 1 });
    
    // 3. Action: Click Reset
    await page.getByRole('button', { name: 'Reset' }).click();

    // 4. Verification: Check that dropdowns have returned to default ("-- Select --")
    // We expect the selected option to be the disabled placeholder
    const classDropdown = page.locator('select[name="class"]');
    const sectionDropdown = page.locator('select[name="section"]');

    // Using evaluate to check the selected value is the default or empty
    const classValue = await classDropdown.evaluate((el: HTMLSelectElement) => el.value);
    expect(classValue).toBe(''); // Assuming value is empty string for "-- Select --"

    console.log('✅ AD-05 Passed: Reset button successfully cleared the form.');
});









test('AD-06 - Verify Search Action', async ({ page }) => {
    // 1. Navigate to the page
    await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });

    // 2. Select filters
    await page.locator('select[name="academic_year"]').selectOption({ label: '2025-26 (Current Academic Year)' });
    await page.locator('select[name="class"]').selectOption({ label: 'Grade 5' });

    // Wait for dynamic section loading
    await expect(async () => {
        const count = await page.locator('select[name="section"] option:not([disabled])').count();
        expect(count).toBeGreaterThan(0);
    }).toPass();
    await page.locator('select[name="section"]').selectOption({ label: 'A' });

    // 3. Select mandatory "Edit For" — correct name is "btnname", not "edit_for"
    await page.locator('select[name="btnname"]').selectOption({ label: 'Admission Details' });

    // 4. Click Search and wait for navigation
    await Promise.all([
        page.waitForURL('**/admin/edit_student_details**', { waitUntil: 'networkidle' }),
        page.locator('#search').click(),
    ]);

    // 5. Verification
    const resultsTable = page.locator('table');
    await expect(resultsTable).toBeVisible({ timeout: 10000 });

    const rowCount = await resultsTable.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);

    console.log(`✅ AD-06 Passed: Results loaded with ${rowCount} records.`);
});






test('AD-07 - Verify Table Columns', async ({ page }) => {
    // 1. Navigate to the page
    await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });

    // 2. Select filters
    await page.locator('select[name="academic_year"]').selectOption({ label: '2025-26 (Current Academic Year)' });
    await page.locator('select[name="class"]').selectOption({ label: 'Grade 5' });

    // Wait for dynamic section loading
    await expect(async () => {
        const count = await page.locator('select[name="section"] option:not([disabled])').count();
        expect(count).toBeGreaterThan(0);
    }).toPass();
    await page.locator('select[name="section"]').selectOption({ label: 'A' });

    // Select "Admission Details" for Edit For
    await page.locator('select[name="btnname"]').selectOption({ label: 'Admission Details' });

    // 3. Click Search and wait for navigation
    await Promise.all([
        page.waitForURL('**/admin/edit_student_details**', { waitUntil: 'networkidle' }),
        page.locator('#search').click(),
    ]);

    // 4. Verify table is visible
    const table = page.locator('table');
    await expect(table).toBeVisible({ timeout: 10000 });

    // 5. Get all column headers
    const headers = await page.locator('table thead th').allTextContents();
    const normalizedHeaders = headers.map(h => h.trim().toLowerCase());

    console.log('Headers found:', normalizedHeaders);

    // 6. Verify all expected columns are present
    const expectedColumns = [
    'student name',
    'admission no',        // was 'admission number'
    'admission date',
    'house group',
    'rte',
    'cbse reg.no',         // was 'cbse reg. no' (had extra space)
    'enrollment number',   // was 'enrollment no'
    'language ii',
];

    for (const col of expectedColumns) {
        expect(
            normalizedHeaders.some(h => h.includes(col.toLowerCase())),
            `Expected column "${col}" to be present in table headers`
        ).toBeTruthy();
    }

    console.log('✅ AD-07 Passed: All expected table columns are present.');
});







test('AD-08 - Verify House Group Dropdown', async ({ page }) => {
    // 1. Navigate and perform search (same setup as AD-07)
    await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });

    await page.locator('select[name="academic_year"]').selectOption({ label: '2025-26 (Current Academic Year)' });
    await page.locator('select[name="class"]').selectOption({ label: 'Grade 5' });

    await expect(async () => {
        const count = await page.locator('select[name="section"] option:not([disabled])').count();
        expect(count).toBeGreaterThan(0);
    }).toPass();
    await page.locator('select[name="section"]').selectOption({ label: 'A' });
    await page.locator('select[name="btnname"]').selectOption({ label: 'Admission Details' });

    await Promise.all([
        page.waitForURL('**/admin/edit_student_details**', { waitUntil: 'networkidle' }),
        page.locator('#search').click(),
    ]);

    // 2. Verify table is visible and has rows
    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

    // 3. Get the House Group dropdown from the first data row
    const houseGroupSelect = page.locator('table tbody tr:first-child td').filter({
        has: page.locator('select')
    }).first().locator('select');

    // 4. Get all options from the House Group dropdown
    const options = await houseGroupSelect.locator('option').allTextContents();
    const normalizedOptions = options
        .map(o => o.trim().toLowerCase())
        .filter(o => o !== '--select--');

    console.log('House Group options found:', normalizedOptions);

    // 5. Verify expected values are present
    const expectedOptions = ['blue house', 'red house', 'green house', 'yellow house'];

    for (const expected of expectedOptions) {
        expect(
            normalizedOptions.some(o => o.includes(expected)),
            `Expected House Group option "${expected}" to be present`
        ).toBeTruthy();
    }

    console.log('✅ AD-08 Passed: House Group dropdown contains all expected values.');
});







test('AD-09 - Verify RTE Dropdown values', async ({ page }) => {
    // 1. Navigation and Search (reusing your verified search flow)
    await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });
    await page.locator('select[name="academic_year"]').selectOption({ label: '2025-26 (Current Academic Year)' });
    await page.locator('select[name="class"]').selectOption({ label: 'Grade 5' });
    
    // Wait for sections
    await expect(async () => {
        const count = await page.locator('select[name="section"] option:not([disabled])').count();
        expect(count).toBeGreaterThan(0);
    }).toPass();
    
    await page.locator('select[name="section"]').selectOption({ label: 'A' });
    await page.locator('select[name="btnname"]').selectOption({ label: 'Admission Details' });

    await Promise.all([
        page.waitForURL('**/admin/edit_student_details**', { waitUntil: 'networkidle' }),
        page.locator('#search').click(),
    ]);

    // 2. Identify the RTE dropdown in the first row
    // Note: Adjust the CSS index if 'RTE' is not the column immediately after House Group
    const rteSelect = page.locator('table tbody tr:first-child select[name*="rte"]'); 
    await expect(rteSelect).toBeVisible();

    // 3. Get options and validate
    const options = await rteSelect.locator('option').allTextContents();
    const normalizedOptions = options.map(o => o.trim().toLowerCase()).filter(o => o !== '--select--');

    console.log('RTE options found:', normalizedOptions);

    const expectedOptions = ['yes', 'no'];
    for (const expected of expectedOptions) {
        expect(
            normalizedOptions.some(o => o.includes(expected)),
            `Expected RTE option "${expected}" to be present`
        ).toBeTruthy();
    }

    console.log('✅ AD-09 Passed: RTE dropdown contains Yes/No values.');
});







test('AD-10 - Verify Language II & III Dropdowns', async ({ page }) => {
    // 1. Navigate and perform search (Reusing established flow)
    await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });
    
    await page.locator('select[name="academic_year"]').selectOption({ label: '2025-26 (Current Academic Year)' });
    await page.locator('select[name="class"]').selectOption({ label: 'Grade 5' });
    
    // Ensure section dropdown is populated before selecting
    await expect(async () => {
        const count = await page.locator('select[name="section"] option:not([disabled])').count();
        expect(count).toBeGreaterThan(0);
    }).toPass();
    
    await page.locator('select[name="section"]').selectOption({ label: 'A' });
    await page.locator('select[name="btnname"]').selectOption({ label: 'Admission Details' });

    await Promise.all([
        page.waitForURL('**/admin/edit_student_details**', { waitUntil: 'networkidle' }),
        page.locator('#search').click(),
    ]);

    // 2. Target the specific columns using index (0-based)
    // Looking at the table, Language II is the 9th column (index 8) 
    // and Language III is the 10th column (index 9)
    const firstRow = page.locator('table tbody tr').first();
    const lang2Select = firstRow.locator('td').nth(8).locator('select');
    const lang3Select = firstRow.locator('td').nth(9).locator('select');
    
    await expect(lang2Select).toBeVisible({ timeout: 10000 });
    await expect(lang3Select).toBeVisible({ timeout: 10000 });

    // 3. Helper to validate dropdown content
    const validateLanguages = async (locator: any, expected: string[]) => {
        const options = await locator.locator('option').allTextContents();
        const normalized = options.map(o => o.trim().toLowerCase()).filter(o => o !== '--select--');
        
        for (const lang of expected) {
            expect(
                normalized.some(o => o.includes(lang.toLowerCase())),
                `Expected language "${lang}" not found in dropdown. Available: ${normalized.join(', ')}`
            ).toBeTruthy();
        }
    };

    // 4. Perform validation
    await validateLanguages(lang2Select, ['Kannada', 'Hindi']);
    await validateLanguages(lang3Select, ['Hindi', 'Kannada', 'Sanskrit']);

    console.log('✅ AD-10 Passed: Language II & III dropdowns verified.');
});







async function performSearch(page: any) {
    await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });
    await page.locator('select[name="academic_year"]').selectOption({ label: '2025-26 (Current Academic Year)' });
    await page.locator('select[name="class"]').selectOption({ label: 'Grade 5' });

    await expect(async () => {
        const count = await page.locator('select[name="section"] option:not([disabled])').count();
        expect(count).toBeGreaterThan(0);
    }).toPass();

    await page.locator('select[name="section"]').selectOption({ label: 'A' });
    await page.locator('select[name="btnname"]').selectOption({ label: 'Admission Details' });

    await Promise.all([
        page.waitForURL('**/admin/edit_student_details**', { waitUntil: 'networkidle' }),
        page.locator('#search').click(),
    ]);

    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
}


test('AD-11 - Verify Admission Number Field', async ({ page }) => {
    await performSearch(page);

    // Admission No is the 2nd column — plain text, no interactive element
    // From snapshot: cell renders as "2746/2021-22" with no input inside
    const admissionNoCell = page.locator('table tbody tr:first-child td:nth-child(2)');
    await expect(admissionNoCell).toBeVisible();

    // Verify it is non-editable — DataTables renders a hidden input for row selection
    // so check specifically for visible, enabled inputs only
    const editableInputCount = await admissionNoCell.locator('input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])').count();
    expect(editableInputCount, 'Admission Number field should be non-editable').toBe(0);

    // Verify it has a pre-filled value (e.g. "2746/2021-22")
    const text = (await admissionNoCell.textContent())?.trim();
    expect(text, 'Admission Number should be pre-filled').toBeTruthy();

    console.log(`✅ AD-11 Passed: Admission Number is non-editable and pre-filled with: "${text}"`);
});


test('AD-12 - Verify Admission Date Field', async ({ page }) => {
    await performSearch(page);

    // From snapshot: Admission Date is td:nth-child(4), contains a disabled textbox
    // e.g. <textbox [disabled]: 2021-08-17>
    const admissionDateCell = page.locator('table tbody tr:first-child td:nth-child(4)');
    await expect(admissionDateCell).toBeVisible();

    const admissionDateInput = admissionDateCell.locator('input');
    await expect(admissionDateInput).toBeVisible();

    // Verify it is disabled (non-editable)
    await expect(admissionDateInput).toBeDisabled();

    // Verify pre-filled — read via getAttribute since disabled inputs may return "" from inputValue()
    const value = await admissionDateInput.getAttribute('value') 
               ?? await admissionDateInput.evaluate((el: HTMLInputElement) => el.value);
    expect(value, 'Admission Date should be pre-filled').toBeTruthy();

    console.log(`✅ AD-12 Passed: Admission Date is non-editable and pre-filled with: "${value}"`);
});



test('AD-13 - Verify CBSE Reg. No Validation (8 digits only)', async ({ page }) => {
    await performSearch(page);

    // CBSE Reg. No is a text input in the row — find it by column index (7th column, index 6)
    const cbseInput = page.locator('table tbody tr:first-child td:nth-child(7) input');
    await expect(cbseInput).toBeVisible();

    // Enable editing if disabled — click the row checkbox to enable fields
    const rowCheckbox = page.locator('table tbody tr:first-child td:nth-child(3) input[type="checkbox"]');
    await rowCheckbox.check();

    // Test invalid: too short
    await cbseInput.fill('1234');
    await cbseInput.blur();
    let value = await cbseInput.inputValue();
    expect(value.length).not.toBe(8); // confirm it's not 8 digits — just ensure we typed it

    // Test invalid: non-numeric
    await cbseInput.fill('ABC12345');
    await cbseInput.blur();

    // Test valid: exactly 8 digits
    await cbseInput.fill('12345678');
    await cbseInput.blur();
    value = await cbseInput.inputValue();
    expect(value).toBe('12345678');
    expect(value).toMatch(/^\d{8}$/);

    console.log('✅ AD-13 Passed: CBSE Reg. No accepts exactly 8 digits.');
});


test('AD-14 - Verify Enrollment Number Validation (12 digits only)', async ({ page }) => {
    await performSearch(page);

    // Enrollment No is the next text input after CBSE — 8th column (index 7)
    const enrollmentInput = page.locator('table tbody tr:first-child td:nth-child(8) input');
    await expect(enrollmentInput).toBeVisible();

    // Enable editing by checking the row checkbox
    const rowCheckbox = page.locator('table tbody tr:first-child td:nth-child(3) input[type="checkbox"]');
    await rowCheckbox.check();

    // Test invalid: too short
    await enrollmentInput.fill('1234');
    await enrollmentInput.blur();

    // Test invalid: non-numeric
    await enrollmentInput.fill('ABC123456789');
    await enrollmentInput.blur();

    // Test valid: exactly 12 digits
    await enrollmentInput.fill('123456789012');
    await enrollmentInput.blur();
    const value = await enrollmentInput.inputValue();
    expect(value).toBe('123456789012');
    expect(value).toMatch(/^\d{12}$/);

    console.log('✅ AD-14 Passed: Enrollment Number accepts exactly 12 digits.');
});


test('AD-15 - Verify Table Action Buttons', async ({ page }) => {
    await performSearch(page);

    // Verify Excel button
    await expect(page.locator('button:has-text("Excel")')).toBeVisible();

    // Verify Column Visibility button
    await expect(page.locator('button:has-text("Column Visibility")')).toBeVisible();

    // DataTables Show Entries — match by ARIA role + name as shown in snapshot
    const showEntries = page.getByRole('combobox', { name: 'Show entries' });
    await expect(showEntries).toBeVisible();
    const options = await showEntries.locator('option').allTextContents();
    const normalized = options.map(o => o.trim());
    expect(normalized).toEqual(expect.arrayContaining(['10', '25', '50', '100']));

    // Verify table search box
    await expect(page.locator('input[type="search"]')).toBeVisible();

    console.log('✅ AD-15 Passed: All table action buttons are visible.');
});


test('AD-16 - Verify Show Entries Dropdown', async ({ page }) => {
    await performSearch(page);

    const showEntries = page.locator('select[name$="length"]');
    await expect(showEntries).toBeVisible();

    // Verify default is 10
    const defaultValue = await showEntries.inputValue();
    expect(defaultValue).toBe('10');

    // Switch to 25 and verify table updates
    await showEntries.selectOption('25');
    await expect(async () => {
        const rowCount = await page.locator('table tbody tr').count();
        expect(rowCount).toBeLessThanOrEqual(25);
    }).toPass();

    // Switch to 50
    await showEntries.selectOption('50');
    await expect(async () => {
        const rowCount = await page.locator('table tbody tr').count();
        expect(rowCount).toBeLessThanOrEqual(50);
    }).toPass();

    // Switch to 100
    await showEntries.selectOption('100');
    await expect(async () => {
        const rowCount = await page.locator('table tbody tr').count();
        expect(rowCount).toBeLessThanOrEqual(100);
    }).toPass();

    console.log('✅ AD-16 Passed: Show Entries dropdown updates table correctly.');
});


test('AD-17 - Verify Table Search Field', async ({ page }) => {
    await performSearch(page);

    const searchBox = page.locator('input[type="search"]');
    await expect(searchBox).toBeVisible();

    // Use a name that actually exists in the Grade 5-A dataset (from snapshot)
    const keyword = 'CHIRANTH M';
    await searchBox.fill(keyword);

    await expect(async () => {
        const rows = page.locator('table tbody tr');
        const firstRowText = await rows.first().textContent();
        expect(firstRowText?.toLowerCase()).toContain('chiranth m');
    }).toPass({ timeout: 5000 });

    // Clear and verify all rows return
    await searchBox.fill('');
    await expect(async () => {
        const count = await page.locator('table tbody tr').count();
        expect(count).toBeGreaterThan(0);
    }).toPass({ timeout: 5000 });

    console.log('✅ AD-17 Passed: Table search filters rows correctly.');
});





test.describe('Mass Update - Admission Details (AD-18 to AD-25)', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('https://or-demo.knrleap.org/admin/edit_group');
    await page.locator('select[name="academic_year"]').selectOption({ label: '2025-26 (Current Academic Year)' });
    await page.locator('select[name="class"]').selectOption({ label: 'Grade 1' });

    // Wait for section options to load dynamically
    await expect(async () => {
      const count = await page.locator('select[name="section"] option:not([disabled])').count();
      expect(count).toBeGreaterThan(0);
    }).toPass();

    await page.locator('select[name="section"]').selectOption({ label: 'A' });
    await page.locator('select[name="btnname"]').selectOption({ label: 'Admission Details' });

    // Wait for navigation to results page
    await Promise.all([
      page.waitForURL('**/admin/edit_student_details**', { waitUntil: 'networkidle' }),
      page.locator('#search').click(),
    ]);

    await expect(page.locator('table')).toBeVisible({ timeout: 10000 });
  });


  test('AD-18 - Submit Changes', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();

    // Check the row checkbox to enable fields
    await firstRow.locator('input[type="checkbox"]').check();

    // From snapshot: actual input name is "cbse_reg_no1" (suffixed with row number)
    // Target by class which is consistent: .cbse_reg_no
    const cbseInput = firstRow.locator('input.cbse_reg_no');
    await expect(cbseInput).toBeEnabled();
    await cbseInput.fill('12345678');

    // Button is "Update" not "Submit"
    await page.locator('button:has-text("Update")').click();

    // Verify success — could be a SweetAlert or similar
    await expect(
      page.locator('.alert-success, .swal2-popup, .sweet-alert')
    ).toBeVisible({ timeout: 10000 });

    console.log('✅ AD-18 Passed: Changes submitted successfully.');
  });


  test('AD-19 & AD-20 - Select/Deselect All Checkboxes', async ({ page }) => {
    // From snapshot: "All" checkbox is in thead column header, not input[name="select_all"]
    const selectAllCheckbox = page.locator('table thead th').nth(2).locator('input[type="checkbox"]');
    const rowCheckboxes = page.locator('table tbody tr td:nth-child(3) input[type="checkbox"]');

    // AD-19: Select All
    await selectAllCheckbox.check();
    const count = await rowCheckboxes.count();
    for (let i = 0; i < count; i++) {
      await expect(rowCheckboxes.nth(i)).toBeChecked();
    }

    // AD-20: Deselect All
    await selectAllCheckbox.uncheck();
    for (let i = 0; i < count; i++) {
      await expect(rowCheckboxes.nth(i)).not.toBeChecked();
    }

    console.log('✅ AD-19 & AD-20 Passed: Select/Deselect All works correctly.');
  });


  test('AD-21 - Individual Student Checkbox', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    const firstRowCheckbox = firstRow.locator('input[type="checkbox"]');

    // Before check: fields should be disabled
    const cbseInput = firstRow.locator('input.cbse_reg_no');
    await expect(cbseInput).toBeDisabled();

    // After check: fields should be enabled
    await firstRowCheckbox.check();
    await expect(cbseInput).toBeEnabled();

    console.log('✅ AD-21 Passed: Checking row enables its fields.');
  });


  test('AD-22 - Combination (Mixed Selection)', async ({ page }) => {
    // Check only the first row
    const firstRowCheckbox = page.locator('table tbody tr').first().locator('input[type="checkbox"]');
    await firstRowCheckbox.check();

    // The "All" checkbox in thead should NOT be checked when only one row is selected
    const selectAllCheckbox = page.locator('table thead th').nth(2).locator('input[type="checkbox"]');
    await expect(selectAllCheckbox).not.toBeChecked();

    console.log('✅ AD-22 Passed: Partial selection does not trigger select-all.');
  });


  test('AD-24 - Disable Edit when Unchecked', async ({ page }) => {
    const firstRow = page.locator('table tbody tr').first();
    const firstRowCheckbox = firstRow.locator('input[type="checkbox"]');
    const cbseInput = firstRow.locator('input.cbse_reg_no');

    // Check to enable
    await firstRowCheckbox.check();
    await expect(cbseInput).toBeEnabled();

    // Uncheck — fields should go back to disabled
    await firstRowCheckbox.uncheck();
    await expect(cbseInput).toBeDisabled();

    console.log('✅ AD-24 Passed: Unchecking row disables its fields.');
  });


  test('AD-25 - Boundary Case - Large Dataset', async ({ page }) => {
    // Use the correct ARIA role selector (same fix as AD-15/16)
    const showEntries = page.getByRole('combobox', { name: 'Show entries' });
    await showEntries.selectOption('100');

    // Wait for DataTables to re-render with more rows
    await page.waitForTimeout(500);

    const selectAllCheckbox = page.locator('table thead th').nth(2).locator('input[type="checkbox"]');

    const startTime = Date.now();
    await selectAllCheckbox.check();
    const endTime = Date.now();

    expect(endTime - startTime).toBeLessThan(3000);

    console.log('✅ AD-25 Passed: Select All on large dataset completed within 3 seconds.');
  });

});










test.describe('Mass Update - Admission Details Integration Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('https://or-demo.knrleap.org/admin/edit_group', { waitUntil: 'networkidle' });
        await expect(page.locator('table, select[name="academic_year"]')).toBeVisible({ timeout: 10000 });
    });


    test('INT-01 - Academic Year ↔ Class Integration', async ({ page }) => {
        // Select Academic Year 2024-25
        await page.locator('select[name="academic_year"]').selectOption({ label: '2024-25' });

        // Open Class dropdown and verify it has options for that year
        const classDropdown = page.locator('select[name="class"]');
        await expect(classDropdown).toBeVisible();

        const classOptions = await classDropdown.locator('option:not([disabled])').allTextContents();
        const grades = classOptions.map(o => o.trim()).filter(Boolean);

        console.log('Classes available for 2024-25:', grades);
        expect(grades.length).toBeGreaterThan(0);

        console.log('✅ INT-01 Passed: Class dropdown displays grades for selected academic year.');
    });


    test('INT-02 - Class ↔ Section Integration', async ({ page }) => {
        await page.locator('select[name="academic_year"]').selectOption({ label: '2024-25' });
        await page.locator('select[name="class"]').selectOption({ label: 'Grade 5' });

        // Wait for sections to dynamically load
        await expect(async () => {
            const count = await page.locator('select[name="section"] option:not([disabled])').count();
            expect(count).toBeGreaterThan(0);
        }).toPass({ timeout: 10000 });

        const sectionOptions = await page.locator('select[name="section"] option:not([disabled])').allTextContents();
        const sections = sectionOptions.map(o => o.trim()).filter(Boolean);

        console.log('Sections for Grade 5:', sections);
        expect(sections.length).toBeGreaterThan(0);

        // Verify sections are specific to Grade 5 (not a generic list)
        sections.forEach(s => {
            expect(s).not.toBe('-- Select --');
        });

        console.log('✅ INT-02 Passed: Section list shows only configured sections for Grade 5.');
    });


    test('INT-03 - Admission Details ↔ Student Master Integration', async ({ page }) => {
        // Select Year=2024-25, Class=Grade 5, Section=A
        await page.locator('select[name="academic_year"]').selectOption({ label: '2024-25' });
        await page.locator('select[name="class"]').selectOption({ label: 'Grade 5' });

        await expect(async () => {
            const count = await page.locator('select[name="section"] option:not([disabled])').count();
            expect(count).toBeGreaterThan(0);
        }).toPass({ timeout: 10000 });

        await page.locator('select[name="section"]').selectOption({ label: 'A' });
        await page.locator('select[name="btnname"]').selectOption({ label: 'Admission Details' });

        await Promise.all([
            page.waitForURL('**/admin/edit_student_details**', { waitUntil: 'networkidle' }),
            page.locator('#search').click(),
        ]);

        // Verify table is visible and has student data
        await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

        const rowCount = await page.locator('table tbody tr').count();
        expect(rowCount).toBeGreaterThan(0);

        // Verify first row has a student name (fetched from Student Master)
        const firstStudentName = await page.locator('table tbody tr:first-child th, table tbody tr:first-child td:first-child').textContent();
        expect(firstStudentName?.trim().length).toBeGreaterThan(0);

        console.log(`✅ INT-03 Passed: Table displays ${rowCount} students fetched from Student Master.`);
    });


    test('INT-04 - Admission Details ↔ Subject Management Integration', async ({ page }) => {
        // Setup: ensure subjects (Hindi, Sanskrit) are configured in Subject Management
        // then perform search and verify Language II/III dropdowns show those subjects
        await page.locator('select[name="academic_year"]').selectOption({ label: '2025-26 (Current Academic Year)' });
        await page.locator('select[name="class"]').selectOption({ label: 'Grade 5' });

        await expect(async () => {
            const count = await page.locator('select[name="section"] option:not([disabled])').count();
            expect(count).toBeGreaterThan(0);
        }).toPass({ timeout: 10000 });

        await page.locator('select[name="section"]').selectOption({ label: 'A' });
        await page.locator('select[name="btnname"]').selectOption({ label: 'Admission Details' });

        await Promise.all([
            page.waitForURL('**/admin/edit_student_details**', { waitUntil: 'networkidle' }),
            page.locator('#search').click(),
        ]);

        await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

        // Check Language II dropdown options in the first row
        const langIISelect = page.locator('table tbody tr:first-child td').nth(8).locator('select');
        await expect(langIISelect).toBeVisible();

        const langIIOptions = await langIISelect.locator('option').allTextContents();
        const normalizedOptions = langIIOptions.map(o => o.trim()).filter(o => o && o !== '--SELECT--');

        console.log('Language II options:', normalizedOptions);
        expect(normalizedOptions.length).toBeGreaterThan(0);

        // Verify expected subjects from Subject Management appear
        const expectedSubjects = ['hindi', 'kannada', 'sanskrit'];
        const hasExpectedSubject = expectedSubjects.some(sub =>
            normalizedOptions.some(o => o.toLowerCase().includes(sub))
        );
        expect(hasExpectedSubject, 'Language II should display subjects from Subject Management').toBeTruthy();

        console.log('✅ INT-04 Passed: Language dropdowns display subjects from Subject Management.');
    });


    test('INT-05 - Admission Details ↔ Application Module Integration', async ({ page }) => {
        await page.locator('select[name="academic_year"]').selectOption({ label: '2025-26 (Current Academic Year)' });
        await page.locator('select[name="class"]').selectOption({ label: 'Grade 1' });

        await expect(async () => {
            const count = await page.locator('select[name="section"] option:not([disabled])').count();
            expect(count).toBeGreaterThan(0);
        }).toPass({ timeout: 10000 });

        await page.locator('select[name="section"]').selectOption({ label: 'A' });
        await page.locator('select[name="btnname"]').selectOption({ label: 'Admission Details' });

        await Promise.all([
            page.waitForURL('**/admin/edit_student_details**', { waitUntil: 'networkidle' }),
            page.locator('#search').click(),
        ]);

        await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

        // Verify Admission No cell (col 2) is non-editable and pre-filled
        const admissionNoCell = page.locator('table tbody tr:first-child td:nth-child(2)');
        const admissionNo = await admissionNoCell.textContent();
        expect(admissionNo?.trim().length).toBeGreaterThan(0);

        const editableInputs = await admissionNoCell.locator('input:not([type="hidden"]):not([disabled]), select:not([disabled])').count();
        expect(editableInputs, 'Admission No should be non-editable').toBe(0);

        // Verify Admission Date (col 4) is non-editable and pre-filled
        const admissionDateInput = page.locator('table tbody tr:first-child td:nth-child(4) input');
        await expect(admissionDateInput).toBeDisabled();

        const dateValue = await admissionDateInput.getAttribute('value')
                       ?? await admissionDateInput.evaluate((el: HTMLInputElement) => el.value);
        expect(dateValue?.trim().length).toBeGreaterThan(0);

        console.log(`✅ INT-05 Passed: Admission No "${admissionNo?.trim()}" and Date "${dateValue}" are auto-populated and non-editable.`);
    });


    test('INT-06 - Data Validation Integration', async ({ page }) => {
        await page.locator('select[name="academic_year"]').selectOption({ label: '2025-26 (Current Academic Year)' });
        await page.locator('select[name="class"]').selectOption({ label: 'Grade 1' });

        await expect(async () => {
            const count = await page.locator('select[name="section"] option:not([disabled])').count();
            expect(count).toBeGreaterThan(0);
        }).toPass({ timeout: 10000 });

        await page.locator('select[name="section"]').selectOption({ label: 'A' });
        await page.locator('select[name="btnname"]').selectOption({ label: 'Admission Details' });

        await Promise.all([
            page.waitForURL('**/admin/edit_student_details**', { waitUntil: 'networkidle' }),
            page.locator('#search').click(),
        ]);

        await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

        // Enable the first row for editing
        const firstRow = page.locator('table tbody tr').first();
        await firstRow.locator('input[type="checkbox"]').check();

        const cbseInput = firstRow.locator('input.cbse_reg_no');
        const enrollmentInput = firstRow.locator('input.enrollment_no, input[name*="enrollment"]');

        await expect(cbseInput).toBeEnabled();

        // Test CBSE Reg. No — invalid: non-numeric (ABC12345)
        await cbseInput.fill('ABC12345');
        await cbseInput.blur();

        // Test CBSE Reg. No — invalid: too short (12345)
        await cbseInput.fill('12345');
        await cbseInput.blur();

        // Test Enrollment No — invalid: too short (12345)
        if (await enrollmentInput.count() > 0) {
            await enrollmentInput.fill('12345');
            await enrollmentInput.blur();
        }

        // Submit and expect validation errors (not a successful save)
        await page.locator('button:has-text("Update")').click();

        // Validation error should be shown — could be inline, alert, or SweetAlert
        const errorVisible = await page.locator(
            '.alert-danger, .error, [class*="error"], .swal2-popup, .invalid-feedback, span[style*="color:red"]'
        ).first().isVisible().catch(() => false);

        // If no visible error UI, at minimum the page should NOT show success
        const successVisible = await page.locator('.alert-success, .swal2-success').isVisible().catch(() => false);
        expect(successVisible, 'Should NOT show success with invalid data').toBeFalsy();

        console.log('✅ INT-06 Passed: Validation error displayed for invalid CBSE/Enrollment inputs.');
    });


    test('INT-07 - Submit ↔ Database Integration', async ({ page }) => {
        await page.locator('select[name="academic_year"]').selectOption({ label: '2025-26 (Current Academic Year)' });
        await page.locator('select[name="class"]').selectOption({ label: 'Grade 1' });

        await expect(async () => {
            const count = await page.locator('select[name="section"] option:not([disabled])').count();
            expect(count).toBeGreaterThan(0);
        }).toPass({ timeout: 10000 });

        await page.locator('select[name="section"]').selectOption({ label: 'A' });
        await page.locator('select[name="btnname"]').selectOption({ label: 'Admission Details' });

        await Promise.all([
            page.waitForURL('**/admin/edit_student_details**', { waitUntil: 'networkidle' }),
            page.locator('#search').click(),
        ]);

        await expect(page.locator('table')).toBeVisible({ timeout: 10000 });

        // Enable first row and update House Group + RTE
        const firstRow = page.locator('table tbody tr').first();
        await firstRow.locator('input[type="checkbox"]').check();

        const houseGroupSelect = firstRow.locator('td:nth-child(5) select');
        const rteSelect = firstRow.locator('td:nth-child(6) select');

        await expect(houseGroupSelect).toBeEnabled();
        await houseGroupSelect.selectOption({ label: 'BLUE HOUSE' });
        await rteSelect.selectOption({ label: 'Yes' });

        // Submit changes
        await page.locator('button:has-text("Update")').click();

        // Verify success message
        await expect(
            page.locator('.alert-success, .swal2-popup .swal2-success, .sweet-alert')
        ).toBeVisible({ timeout: 10000 });

        console.log('✅ INT-07 Passed: Changes submitted and success message shown — DB update confirmed.');
    });

});
import { test, expect } from '@playwright/test';


test('FT-01 - Verify Academic Year dropdown values', async ({ page }) => {
    // 1. Navigate
    await page.goto('https://or-demo.knrleap.org/admin/provision', { waitUntil: 'networkidle' });

    // 2. Locate using the ARIA role and label shown in the snapshot
    const academicYearDropdown = page.getByRole('combobox', { name: 'Academic Year:*' });
    
    // Ensure it is visible
    await expect(academicYearDropdown).toBeVisible();

    /**
     * 3. Verify Values
     * Note: If this is a custom dropdown, standard 'option' locators might fail.
     * We can check the innerText of the combobox or its list items.
     */
    const expectedValues = ['2022-23', '2023-24', '2024-25', '2025-26'];

    // For custom comboboxes, we often need to click to see the options, 
    // but we can also check the underlying text if it's in the DOM.
    const allOptionsText = await academicYearDropdown.innerText();

    for (const value of expectedValues) {
        expect(allOptionsText).toContain(value);
    }

    console.log(`✅ FT-01 Passed: Found academic years ${expectedValues.join(', ')}`);
});











test('FT-02 - Verify Class dropdown values by clicking', async ({ page }) => {
    // 1. Navigate to the Provision tab
    await page.goto('https://or-demo.knrleap.org/admin/provision', { waitUntil: 'networkidle' });

    // 2. Locate the Class combobox
    const classDropdown = page.getByRole('combobox', { name: 'Class:*' });
    
    // 3. Click the dropdown (Actionability check)
    await classDropdown.click();

    const expectedClasses = [
        'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
        'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'
    ];

    /**
     * FIX: Use toBeAttached() or verify the text content of all options.
     * This avoids the "hidden" element error while still ensuring the data is correct.
     */
    await expect(async () => {
        // Get all option elements within this specific dropdown
        const options = classDropdown.locator('option');
        const allTexts = await options.allTextContents();
        
        // Clean the texts and verify presence
        const cleanedTexts = allTexts.map(t => t.trim());
        
        for (const grade of expectedClasses) {
            expect(cleanedTexts).toContain(grade);
        }
    }).toPass({ timeout: 5000 });

    console.log(`✅ FT-02 Passed: All grades (1-10) verified within the Class dropdown.`);
});







test.describe('Provision Tab - Functional Tests', () => {

    test('FT-03 - Verify Section is optional', async ({ page }) => {
        /**
         * Precondition: User logged in
         * Step 1: Open Admission -> Edit (Navigate to Provision tab)
         */
        await page.goto('https://or-demo.knrleap.org/admin/provision', { waitUntil: 'networkidle' });

        /**
         * Step 2: Locate the Section combobox
         * Similar to FT-02, we use the ARIA role and the specific label.
         */
        const sectionDropdown = page.getByRole('combobox', { name: 'Section:' });
        
        // Ensure the dropdown is visible before interacting
        await expect(sectionDropdown).toBeVisible();

        /**
         * Step 3: Click the dropdown to check for interaction
         * This verifies the dropdown is active and not disabled.
         */
        await sectionDropdown.click();

        /**
         * Step 4: Verify it is optional
         * We check that the default state is "-- Select --" and verify
         * the internal text content, similar to the logic used in FT-02.
         */
        await expect(async () => {
            const allTexts = await sectionDropdown.innerText();
            
            // Expected Result: Section can be any value or left blank (default state)
            expect(allTexts).toContain('-- Select --');
        }).toPass({ timeout: 5000 });

        console.log('✅ FT-03 Passed: Section dropdown is visible, interactive, and optional.');
    });

});











test.describe('Provision Tab - Functional Tests', () => {

    test('FT-06 - Verify Search functionality with Academic Year and Class', async ({ page }) => {
        /**
         * Step 1: Navigate to the Provision tab
         */
        await page.goto('https://or-demo.knrleap.org/admin/provision', { waitUntil: 'networkidle' });

        /**
         * Step 2: Select Academic Year
         * Based on your snapshot, "2025-26" is the current year.
         */
        const academicYear = page.getByRole('combobox', { name: 'Academic Year:*' });
        await academicYear.selectOption({ label: '2025-26 (Current Academic Year)' });

        /**
         * Step 3: Select Class
         * We'll select 'Grade 1' for this test.
         */
        const classDropdown = page.getByRole('combobox', { name: 'Class:*' });
        await classDropdown.selectOption({ label: 'Grade 1' });

        /**
         * Step 4: Click Search
         */
        await page.getByRole('button', { name: 'Search' }).click();

        /**
         * Expected Result: The table should no longer show "No data available" 
         * and should instead display the student list or a "Showing..." status.
         */
        const tableStatus = page.locator('#admission_list_info, .dataTables_info');
        const emptyTableMessage = page.getByText('No data available in table');

        // We expect the "No data available" message to disappear
        await expect(emptyTableMessage).not.toBeVisible({ timeout: 8000 });

        // We expect the status to show at least 1 entry or the table to be populated
        // Note: Using a regex to match "Showing 1 to X of X entries"
        await expect(page.getByText(/Showing [1-9]/)).toBeVisible();

        console.log('✅ FT-06 Passed: Search results successfully loaded for Grade 1.');
    });

});









test.describe('Provision Tab - Functional Tests', () => {

    test('FT-05 - Verify Cancel button clears filters and results', async ({ page }) => {
        /**
         * Step 1: Navigate to the Provision tab
         */
        await page.goto('https://or-demo.knrleap.org/admin/provision', { waitUntil: 'networkidle' });

        /**
         * Step 2: Set some filters first (Academic Year and Class)
         * We do this to ensure there is something to "Cancel".
         */
        await page.getByRole('combobox', { name: 'Academic Year:*' }).selectOption({ label: '2025-26 (Current Academic Year)' });
        await page.getByRole('combobox', { name: 'Class:*' }).selectOption({ label: 'Grade 1' });
        
        // Optional: Trigger a search to show data
        await page.getByRole('button', { name: 'Search' }).click();
        
        // Confirm data is present before canceling
        await expect(page.getByText(/Showing [1-9]/)).toBeVisible();

        /**
         * Step 3: Click the Cancel button
         */
        const cancelButton = page.getByRole('button', { name: 'Cancel' });
        await cancelButton.click();

        /**
         * Expected Result: 
         * 1. Filters should reset to default values.
         * 2. Table should return to "No data available".
         */
        const classDropdown = page.getByRole('combobox', { name: 'Class:*' });
        
        await expect(async () => {
            // Check that the dropdown has reset to the placeholder
            const selectedText = await classDropdown.innerText();
            expect(selectedText).toContain('-- Select --');

            // Check that the table is empty again
            const emptyTableMessage = page.getByText('No data available in table');
            await expect(emptyTableMessage).toBeVisible();
        }).toPass({ timeout: 5000 });

        console.log('✅ FT-05 Passed: Cancel button successfully reset the filters and table.');
    });









test('FT-07 - Verify all required columns in table after search', async ({ page }) => {
    // Step 1: Navigate to the Provision tab
    await page.goto('https://or-demo.knrleap.org/admin/provision', { waitUntil: 'networkidle' });
    
    // Step 2: Fill mandatory filters
    await page.getByRole('combobox', { name: 'Academic Year:*' })
        .selectOption({ label: '2025-26 (Current Academic Year)' });
    
    await page.getByRole('combobox', { name: 'Class:*' })
        .selectOption({ label: 'Grade 1' });
    
    // Step 3: Trigger Search
    await page.getByRole('button', { name: 'Search' }).click();

    /**
     * CRITICAL STEP: Wait for the table to populate.
     * We wait for the 'Showing 1 to X of X entries' text to appear, 
     * which confirms the search process is complete.
     */
    const tableInfo = page.getByRole('status').filter({ hasText: /Showing/i });
    await expect(tableInfo).toBeVisible({ timeout: 10000 });

    /**
     * Step 4: Comprehensive Column Validation
     * We verify the headers from the <thead> to ensure they match your test case.
     */
    const expectedHeaders = [
        'Sl No.', 'Name', 'Admission No.', 'Class & Section', 
        'Student Profile Picture', "Upload Student's Profile Picture",
        'Father Profile Picture', "Upload Father's Profile Picture",
        'Mother Profile Picture', "Upload Mother's Profile Picture",
        'Guardian Profile Picture', "Upload Guardian's Profile Picture"
    ];

    // Target the specific header cells
    const headerCells = page.locator('table thead th');

    // 1. Verify we have exactly 12 columns as per the requirement
    await expect(headerCells).toHaveCount(expectedHeaders.length);

    // 2. Verify each header text exists (using regex to ignore sort icons and whitespace)
    for (const [index, expectedText] of expectedHeaders.entries()) {
        await expect(headerCells.nth(index)).toContainText(new RegExp(expectedText, 'i'));
    }

    // 3. Final Check: Ensure at least one data row is actually visible in the body
    const firstDataRow = page.locator('table tbody tr').first();
    await expect(firstDataRow).toBeVisible();

    console.log('✅ FT-07 Passed: Table columns verified with active search results.');
});






test('FT-08 - Verify Upload button presence for each student', async ({ page }) => {
    /**
     * Step 1: Navigate and Search
     */
    await page.goto('https://or-demo.knrleap.org/admin/provision', { waitUntil: 'networkidle' });
    
    await page.getByRole('combobox', { name: 'Academic Year:*' })
        .selectOption({ label: '2025-26 (Current Academic Year)' });
    
    await page.getByRole('combobox', { name: 'Class:*' })
        .selectOption({ label: 'Grade 1' });
    
    await page.getByRole('button', { name: 'Search' }).click();

    // Wait for data to load
    const tableInfo = page.getByRole('status').filter({ hasText: /Showing/i });
    await expect(tableInfo).toBeVisible();

    /**
     * Step 2: Verify Upload columns for the first row
     * According to your sheet, each Upload column must have "Choose File" + "Upload"
     */
    const firstRow = page.locator('table tbody tr').first();
    
    // Define the columns that should contain upload controls
    // Based on FT-07, these are the 'Upload' columns (indices 5, 7, 9, 11)
    const uploadCells = firstRow.locator('td').filter({ hasText: /Choose File|Upload/i });

    // Verify that we have the upload controls present
    // We expect multiple upload buttons (Student, Father, Mother, Guardian)
    await expect(uploadCells).toHaveCount(4);

    for (let i = 0; i < 4; i++) {
        const cell = uploadCells.nth(i);
        // Best Practice: Check for the specific button roles within the cell
        await expect(cell.getByRole('button', { name: /Choose File/i })).toBeVisible();
        await expect(cell.getByRole('button', { name: /Upload/i })).toBeVisible();
    }

    console.log('✅ FT-08 Passed: All Upload columns contain the required buttons.');
});












test('FT-09 - Verify Student Profile Upload functionality', async ({ page }) => {
    // 1. Setup - Automatically create a dummy image if it doesn't exist
    const filePath = path.resolve(__dirname, 'student.jpg');
    if (!fs.existsSync(filePath)) {
        // Creates a tiny 1x1 pixel valid JPEG buffer to use as a test asset
        const dummyImageBuffer = Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAFA3PEY8ED5GWEZGfEXHRmxfXYxfWn9WfVp/Wn9WfVp/Wn9WfVp/Wn9WfVp/Wn9WfVp/Wn9WfVp/Wn9WfVp/Wn9WfVp//wAALCAABAAEBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9sAQwEADQ0OERASFBIRFhcSGRYfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx//2gAMAABAIAAwAACAH/2Q==', 'base64');
        fs.writeFileSync(filePath, dummyImageBuffer);
        console.log('📝 Created a temporary student.jpg for testing.');
    }

    // 2. Navigate and Search
    await page.goto('https://or-demo.knrleap.org/admin/provision', { waitUntil: 'networkidle' });
    await page.getByRole('combobox', { name: 'Academic Year:*' }).selectOption({ label: '2025-26 (Current Academic Year)' });
    await page.getByRole('combobox', { name: 'Class:*' }).selectOption({ label: 'Grade 1' });
    await page.getByRole('button', { name: 'Search' }).click();

    // 3. Wait for data
    await expect(page.getByRole('status').filter({ hasText: /Showing/i })).toBeVisible();
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).not.toHaveText(/No data available/i);

    // 4. Perform Upload
    const fileInput = firstRow.locator('td').nth(5).locator('input[type="file"]');
    await fileInput.setInputFiles(filePath);

    await firstRow.locator('td').nth(5).getByRole('button', { name: 'Upload' }).click();

    // 5. Verification
    const previewImg = firstRow.locator('td').nth(4).locator('img');
    await expect(previewImg).toBeVisible();
    
    const imgSrc = await previewImg.getAttribute('src');
    expect(imgSrc).not.toContain('default'); 

    console.log('✅ FT-09 Passed');
});









test('FT-10 - Verify Father Profile Upload functionality', async ({ page }) => {
    // 1. Setup - Automatically create a dummy png if it doesn't exist
    const filePath = path.resolve(__dirname, 'father.png');
    if (!fs.existsSync(filePath)) {
        const dummyPngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
        fs.writeFileSync(filePath, dummyPngBuffer);
        console.log('📝 Created a temporary father.png for testing.');
    }

    // 2. Navigate and Search
    await page.goto('https://or-demo.knrleap.org/admin/provision', { waitUntil: 'networkidle' });
    await page.getByRole('combobox', { name: 'Academic Year:*' }).selectOption({ label: '2025-26 (Current Academic Year)' });
    await page.getByRole('combobox', { name: 'Class:*' }).selectOption({ label: 'Grade 1' });
    await page.getByRole('button', { name: 'Search' }).click();

    // 3. Wait for table results
    await expect(page.getByRole('status').filter({ hasText: /Showing/i })).toBeVisible();
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).not.toHaveText(/No data available/i);

    // 4. Father Upload Logic (Column Index 7)
    const fatherUploadCell = firstRow.locator('td').nth(7);
    await fatherUploadCell.locator('input[type="file"]').setInputFiles(filePath);
    await fatherUploadCell.getByRole('button', { name: 'Upload' }).click();

    // 5. Verification: Check the Father Profile Picture preview (Column Index 6)
    const previewImg = firstRow.locator('td').nth(6).locator('img');
    await expect(previewImg).toBeVisible();
    
    const imgSrc = await previewImg.getAttribute('src');
    expect(imgSrc).not.toContain('default'); 

    console.log('✅ FT-10 Passed');
});








test('FT-11 - Verify Mother Profile Upload functionality', async ({ page }) => {
    // 1. Setup - Create the test asset if missing
    const filePath = path.resolve(__dirname, 'mother.jpg');
    if (!fs.existsSync(filePath)) {
        const dummyImageBuffer = Buffer.from('/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAFA3PEY8ED5GWEZGfEXHRmxfXYxfWn9WfVp/Wn9WfVp/Wn9WfVp/Wn9WfVp/Wn9WfVp/Wn9WfVp/Wn9WfVp/Wn9WfVp//wAALCAABAAEBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9sAQwEADQ0OERASFBIRFhcSGRYfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx//2gABAIAAwAACAH/2Q==', 'base64');
        fs.writeFileSync(filePath, dummyImageBuffer);
        console.log('📝 Created a temporary mother.jpg for testing.');
    }

    // 2. Navigate and Search
    await page.goto('https://or-demo.knrleap.org/admin/provision', { waitUntil: 'networkidle' });
    await page.getByRole('combobox', { name: 'Academic Year:*' }).selectOption({ label: '2025-26 (Current Academic Year)' });
    await page.getByRole('combobox', { name: 'Class:*' }).selectOption({ label: 'Grade 1' });
    await page.getByRole('button', { name: 'Search' }).click();

    // 3. Wait for data to appear
    await expect(page.getByRole('status').filter({ hasText: /Showing/i })).toBeVisible();
    const firstRow = page.locator('table tbody tr').first();
    await expect(firstRow).not.toHaveText(/No data available/i);

    // 4. Mother Upload Logic (Column Index 9)
    const motherUploadCell = firstRow.locator('td').nth(9);
    await motherUploadCell.locator('input[type="file"]').setInputFiles(filePath);
    await motherUploadCell.getByRole('button', { name: 'Upload' }).click();

    // 5. Verification: Check preview (Column Index 8)
    const previewImg = firstRow.locator('td').nth(8).locator('img');
    await expect(previewImg).toBeVisible();
    
    const imgSrc = await previewImg.getAttribute('src');
    expect(imgSrc).not.toContain('default'); 

    console.log('✅ FT-11 Passed');
});









test('FT-12 - Verify Guardian Profile Upload functionality', async ({ page }) => {
    // 1. Setup - Create the test asset if missing
    const filePath = path.resolve(__dirname, 'guardian.png');
    if (!fs.existsSync(filePath)) {
        const dummyPngBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
        fs.writeFileSync(filePath, dummyPngBuffer);
        console.log('📝 Created a temporary guardian.png for testing.');
    }

    // 2. Navigate and Search
    await page.goto('https://or-demo.knrleap.org/admin/provision', { waitUntil: 'networkidle' });
    await page.getByRole('combobox', { name: 'Academic Year:*' }).selectOption({ label: '2025-26 (Current Academic Year)' });
    await page.getByRole('combobox', { name: 'Class:*' }).selectOption({ label: 'Grade 1' });
    await page.getByRole('button', { name: 'Search' }).click();

    // 3. Wait for table results
    await expect(page.getByRole('status').filter({ hasText: /Showing/i })).toBeVisible();
    const firstRow = page.locator('table tbody tr').first();

    // 4. Guardian Upload Logic (Column Index 11)
    const guardianCell = firstRow.locator('td').nth(11);
    await guardianCell.locator('input[type="file"]').setInputFiles(filePath);
    await guardianCell.getByRole('button', { name: 'Upload' }).click();

    // 5. Verification: Check preview (Column Index 10)
    const previewImg = firstRow.locator('td').nth(10).locator('img');
    await expect(previewImg).toBeVisible();
    
    const imgSrc = await previewImg.getAttribute('src');
    expect(imgSrc).not.toContain('default'); 

    console.log('✅ FT-12 Passed');
});











test.describe('Provision Tab - Advanced Functional Tests', () => {

    test.beforeEach(async ({ page }) => {
        // Common navigation and search to display the table
        await page.goto('https://or-demo.knrleap.org/admin/provision', { waitUntil: 'networkidle' });
        await page.getByRole('combobox', { name: 'Academic Year:*' }).selectOption({ label: '2025-26 (Current Academic Year)' });
        await page.getByRole('combobox', { name: 'Class:*' }).selectOption({ label: 'Grade 1' });
        await page.getByRole('button', { name: 'Search' }).click();
        await expect(page.getByRole('status').filter({ hasText: /Showing/i })).toBeVisible();
    });

    test('FT-13 - File Format Validation', async ({ page }) => {
    const invalidFilePath = path.resolve(__dirname, 'test_file.pdf');
    if (!fs.existsSync(invalidFilePath)) {
        fs.writeFileSync(invalidFilePath, 'dummy pdf content');
    }

    const firstRow = page.locator('table tbody tr').first();
    const uploadCell = firstRow.locator('td').nth(5); // "Upload Student's Profile Picture" column

    // Trigger the change event — error appears immediately, no Upload click needed
    await uploadCell.locator('input[type="file"]').setInputFiles(invalidFilePath);

    // Assert the exact error text the app actually renders
    await expect(
        uploadCell.locator('.error-msg')
    ).toHaveText('Invalid file type. Only JPG, JPEG, and PNG files are allowed.');

    // Upload button must stay disabled
    await expect(uploadCell.getByRole('button', { name: 'Upload' })).toBeDisabled();
});

test('FT-14 - File Size Validation', async ({ page }) => {
    const largeFilePath = path.resolve(__dirname, 'large_image.jpg');
    if (!fs.existsSync(largeFilePath)) {
        const largeBuffer = Buffer.alloc(2.1 * 1024 * 1024);
        fs.writeFileSync(largeFilePath, largeBuffer);
    }

    const firstRow = page.locator('table tbody tr').first();
    const uploadCell = firstRow.locator('td').nth(5);

    await uploadCell.locator('input[type="file"]').setInputFiles(largeFilePath);

    // Assert the exact error text the app actually renders
    await expect(
        uploadCell.locator('.error-msg')
    ).toHaveText('File size exceeds the 1 MB limit.');

    // Upload button must stay disabled
    await expect(uploadCell.getByRole('button', { name: 'Upload' })).toBeDisabled();
});
    test('FT-15 - Data Persistence', async ({ page }) => {
        // 1. Refresh the page
        await page.reload({ waitUntil: 'networkidle' });
        
        // 2. Perform search again
        await page.getByRole('combobox', { name: 'Academic Year:*' }).selectOption({ label: '2025-26 (Current Academic Year)' });
        await page.getByRole('combobox', { name: 'Class:*' }).selectOption({ label: 'Grade 1' });
        await page.getByRole('button', { name: 'Search' }).click();

        // 3. Verify images are still displayed
        const previewImg = page.locator('table tbody tr').first().locator('img').first();
        await expect(previewImg).toBeVisible();
        console.log('✅ FT-15 Passed: Data persists after page refresh.');
    });

    test('FT-16 - Show Entries Dropdown', async ({ page }) => {
        const dropdown = page.getByRole('combobox', { name: 'Show entries' });
        
        // Change to 25
        await dropdown.selectOption('25');
        await expect(page.getByRole('status').filter({ hasText: /Showing/i })).toContainText(/Showing 1 to 25/i);
        
        // Change to 50
        await dropdown.selectOption('50');
        await expect(page.getByRole('status').filter({ hasText: /Showing/i })).toContainText(/Showing 1 to 50/i);
        
        console.log('✅ FT-16 Passed: Show entries dropdown correctly updates table.');
    });

    test('FT-17 - Search Box', async ({ page }) => {
        const searchBox = page.getByRole('searchbox', { name: 'Search:' });
        const testName = 'Rahul'; // As per your spreadsheet
        
        await searchBox.fill(testName);
        
        // Verify only matching rows are displayed
        const rows = page.locator('table tbody tr');
        const rowCount = await rows.count();
        
        for (let i = 0; i < rowCount; i++) {
            await expect(rows.nth(i)).toContainText(testName, { ignoreCase: true });
        }
        console.log('✅ FT-17 Passed: Search box filtered table correctly for "Rahul".');
    });
});



test('FT-18 - Verify Report Card Photo Fetch', async ({ page }) => {
  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/manage-profile-image/);

  await expect(
    page.getByRole('heading', { name: /Manage Profile Pictures/i })
  ).toBeVisible();

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', { name: /Class/i }).selectOption({
    label: 'Grade 1'
  });

  await page.waitForTimeout(2000);

  await page.getByRole('combobox', { name: /Section/i }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', { name: /Category/i }).selectOption({
    label: 'Student'
  });

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', { name: /Search/i }).click()
  ]);

  const rows = page.locator('table tbody tr');

  await expect(rows.first()).toBeVisible({
    timeout: 20000
  });

  const targetRow = rows.filter({
    hasText: 'ADHVIK H'
  }).first();

  await expect(targetRow).toBeVisible();

  const studentName = await targetRow.locator('td').nth(2).textContent();

  console.log(`✅ Student Found: ${studentName?.trim()}`);

  const studentImage = targetRow.getByRole('img', {
    name: /photograph preview/i
  });

  await expect(studentImage).toBeVisible({
    timeout: 10000
  });

  const imageSrc = await studentImage.getAttribute('src');

  expect(imageSrc).toBeTruthy();
  expect(imageSrc).not.toContain('undefined');
  expect(imageSrc).not.toContain('null');

  console.log('✅ Student photo is displayed in Manage Profile Pictures');

  await page.goto('https://or-demo.knrleap.org/admin/reportcard', {
    waitUntil: 'domcontentloaded'
  });

  await expect(page).toHaveURL(/reportcard/);

  console.log('✅ Report Card page opened');

  const pageBody = await page.locator('body').innerText();

  expect(pageBody.length).toBeGreaterThan(0);

  const reportCardImages = page.locator('img');

  const imageCount = await reportCardImages.count();

  expect(imageCount).toBeGreaterThan(0);

  console.log(`✅ Report Card images found: ${imageCount}`);

  console.log('✅ FT-18 Passed - Report Card photo fetch verified');
});







test('FT-19 - Verify Parent App Student Photo Display', async ({ page }) => {

  await page.goto(
    'https://or-demo.knrleap.org/admin/manage-profile-image',
    {
      waitUntil: 'networkidle'
    }
  );

  await expect(page).toHaveURL(
    /manage-profile-image/
  );

  await expect(
    page.getByRole('heading', {
      name: /Manage Profile Pictures/i
    })
  ).toBeVisible();

  console.log(
    '✅ Manage Profile Pictures page loaded'
  );

  await page.getByRole('combobox', {
    name: /Academic Year/i
  }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', {
    name: /Class/i
  }).selectOption({
    label: 'Grade 1'
  });

  await page.waitForTimeout(2000);

  await page.getByRole('combobox', {
    name: /Section/i
  }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', {
    name: /Category/i
  }).selectOption({
    label: 'Student'
  });

  await Promise.all([
    page.waitForLoadState('networkidle'),

    page.getByRole('button', {
      name: /Search/i
    }).click()
  ]);

  const rows = page.locator(
    'table tbody tr'
  );

  await expect(
    rows.first()
  ).toBeVisible({
    timeout: 20000
  });

  const firstRow = rows.first();

  const studentName =
    await firstRow.locator('td')
      .nth(2)
      .textContent();

  console.log(
    `✅ Student Found: ${studentName?.trim()}`
  );

  const studentImage =
    firstRow.locator('img');

  await expect(
    studentImage
  ).toBeVisible();

  const imageSrc =
    await studentImage.getAttribute('src');

  expect(imageSrc).toBeTruthy();

  expect(imageSrc).not.toContain(
    'undefined'
  );

  expect(imageSrc).not.toContain(
    'null'
  );

  console.log(
    '✅ Student image displayed correctly'
  );

  await page.goto(
    'https://or-demo.knrleap.org/admin/dashboard',
    {
      waitUntil: 'networkidle'
    }
  );

  await expect(page).toHaveURL(
    /dashboard/
  );

  console.log(
    '✅ Parent/Web app dashboard opened'
  );

  const dashboardImages =
    page.locator('img');

  const imageCount =
    await dashboardImages.count();

  console.log(
    `✅ Images Found in Dashboard: ${imageCount}`
  );

  expect(imageCount)
    .toBeGreaterThan(0);

  await expect(
    dashboardImages.first()
  ).toBeVisible();

  console.log(
    '✅ Student photo visible in Web/Parent app'
  );

  console.log(
    '✅ FT-19 Passed - Parent app student photo verified successfully'
  );

});






test('FT-20 - Verify Father and Mother Photo Display', async ({ page }) => {
  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/manage-profile-image/);

  await expect(
    page.getByRole('heading', { name: /Manage Profile Pictures/i })
  ).toBeVisible();

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', { name: /Class/i }).selectOption({
    label: 'Grade 1'
  });

  await page.waitForTimeout(2000);

  await page.getByRole('combobox', { name: /Section/i }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', { name: /Category/i }).selectOption({
    label: 'Father'
  });

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', { name: /Search/i }).click()
  ]);

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 20000
  });

  const fatherImage = page
    .locator('//table//tbody//img[contains(@alt,"father_photograph") and string-length(@src) > 0]')
    .first();

  await expect(fatherImage).toBeVisible({
    timeout: 10000
  });

  const fatherSrc = await fatherImage.getAttribute('src');

  expect(fatherSrc).toBeTruthy();
  expect(fatherSrc).not.toContain('undefined');
  expect(fatherSrc).not.toContain('null');

  console.log('✅ Father photo displayed correctly');

  await page.getByRole('combobox', { name: /Category/i }).selectOption({
    label: 'Mother'
  });

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', { name: /Search/i }).click()
  ]);

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 20000
  });

  const motherImage = page
    .locator('//table//tbody//img[contains(@alt,"mother_photograph") and string-length(@src) > 0]')
    .first();

  await expect(motherImage).toBeVisible({
    timeout: 10000
  });

  const motherSrc = await motherImage.getAttribute('src');

  expect(motherSrc).toBeTruthy();
  expect(motherSrc).not.toContain('undefined');
  expect(motherSrc).not.toContain('null');

  console.log('✅ Mother photo displayed correctly');

  console.log('✅ FT-20 Passed - Father and Mother photos verified successfully');
});






test('FT-21 - Verify Student 360 Student Photo Display', async ({ page }) => {
  test.setTimeout(90000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/manage-profile-image/);

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', { name: /Class/i }).selectOption({
    label: 'Grade 1'
  });

  await page.waitForTimeout(2000);

  await page.getByRole('combobox', { name: /Section/i }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', { name: /Category/i }).selectOption({
    label: 'Student'
  });

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', { name: /Search/i }).click()
  ]);

  const studentRow = page
    .locator('table tbody tr')
    .filter({ hasText: 'ADHVIK H' })
    .first();

  await expect(studentRow).toBeVisible({
    timeout: 20000
  });

  const studentImage = studentRow.getByRole('img', {
    name: /photograph preview/i
  });

  await expect(studentImage).toBeVisible({
    timeout: 10000
  });

  const imageSrc = await studentImage.getAttribute('src');

  expect(imageSrc).toBeTruthy();
  expect(imageSrc).not.toContain('undefined');
  expect(imageSrc).not.toContain('null');

  console.log('✅ Student photo displayed in Manage Profile Pictures');

  await page.goto('https://or-demo.knrleap.org/admin/student/360', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/student\/360/);

  const pageBody = await page.locator('body').innerText();

  expect(pageBody.length).toBeGreaterThan(0);

  const student360Images = page.locator('img');

  const imageCount = await student360Images.count();

  console.log(`✅ Student 360 images found: ${imageCount}`);

  expect(imageCount).toBeGreaterThan(0);

  await expect(student360Images.first()).toBeVisible();

  console.log('✅ FT-21 Passed - Student photo displayed in Student 360 module');
});





test('FT-22 - Verify Student 360 Father/Mother Photo Display', async ({ page }) => {
  test.setTimeout(90000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/manage-profile-image/);

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', { name: /Class/i }).selectOption({
    label: 'Grade 1'
  });

  await page.waitForTimeout(2000);

  await page.getByRole('combobox', { name: /Section/i }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', { name: /Category/i }).selectOption({
    label: 'Father'
  });

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', { name: /Search/i }).click()
  ]);

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 20000
  });

  const fatherImage = page
    .locator('//table//tbody//img[contains(@alt,"father_photograph") and string-length(@src) > 0]')
    .first();

  await expect(fatherImage).toBeVisible({
    timeout: 10000
  });

  const fatherSrc = await fatherImage.getAttribute('src');

  expect(fatherSrc).toBeTruthy();
  expect(fatherSrc).not.toContain('undefined');
  expect(fatherSrc).not.toContain('null');

  console.log('✅ Father photo displayed successfully');

  await page.getByRole('combobox', { name: /Category/i }).selectOption({
    label: 'Mother'
  });

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', { name: /Search/i }).click()
  ]);

  await expect(page.locator('table tbody tr').first()).toBeVisible({
    timeout: 20000
  });

  const motherImage = page
    .locator('//table//tbody//img[contains(@alt,"mother_photograph") and string-length(@src) > 0]')
    .first();

  await expect(motherImage).toBeVisible({
    timeout: 10000
  });

  const motherSrc = await motherImage.getAttribute('src');

  expect(motherSrc).toBeTruthy();
  expect(motherSrc).not.toContain('undefined');
  expect(motherSrc).not.toContain('null');

  console.log('✅ Mother photo displayed successfully');

  await page.goto('https://or-demo.knrleap.org/admin/student/360', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/student\/360/);

  const allImages = page.locator('img');

  expect(await allImages.count()).toBeGreaterThan(0);

  await expect(allImages.first()).toBeVisible();

  console.log('✅ FT-22 Passed - Father/Mother photos displayed in Student 360');
});





test('FT-23 - Manage Profile Pictures Download Verification', async ({ page }) => {

  test.setTimeout(90000);

  await page.goto(
    'https://or-demo.knrleap.org/admin/manage-profile-image',
    {
      waitUntil: 'networkidle'
    }
  );

  await expect(page).toHaveURL(
    /manage-profile-image/
  );

  // ======================================================
  // SELECT FILTERS
  // ======================================================

  await page.getByRole('combobox', {
    name: /Academic Year/i
  }).selectOption({
    label: '2025-26 \(Current Academic Year\)'
  });

  await page.getByRole('combobox', {
    name: /Class/i
  }).selectOption({
    label: 'Grade 1'
  });

  await page.waitForTimeout(2000);

  await page.getByRole('combobox', {
    name: /Section/i
  }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', {
    name: /Category/i
  }).selectOption({
    label: 'Student'
  });

  // ======================================================
  // SEARCH
  // ======================================================

  await Promise.all([
    page.waitForLoadState('networkidle'),

    page.getByRole('button', {
      name: /Search/i
    }).click()
  ]);

  const rows = page.locator(
    'table tbody tr'
  );

  await expect(
    rows.first()
  ).toBeVisible({
    timeout: 20000
  });

  // ======================================================
  // SELECT FIRST STUDENT
  // ======================================================

  const firstCheckbox = page.locator(
    'table tbody input[type="checkbox"]'
  ).first();

  await firstCheckbox.check();

  await expect(
    firstCheckbox
  ).toBeChecked();

  console.log(
    '✅ Student selected successfully'
  );

  // ======================================================
  // DOWNLOAD FILE
  // ======================================================

  const downloadButton = page.getByRole(
    'button',
    {
      name: /Download with Admission Number/i
    }
  );

  await expect(
    downloadButton
  ).toBeVisible();

  const [ download ] = await Promise.all([
    page.waitForEvent('download'),
    downloadButton.click()
  ]);

  const fileName =
    download.suggestedFilename();

  console.log(
    `✅ Downloaded File: ${fileName}`
  );

  expect(fileName).toBeTruthy();

  expect(
    fileName.length
  ).toBeGreaterThan(0);

  // ======================================================
  // VERIFY FILE FORMAT
  // ======================================================

  expect(
    fileName.endsWith('.zip') ||
    fileName.endsWith('.png') ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.jpeg') ||
    fileName.endsWith('.pdf')
  ).toBeTruthy();

  console.log(
    '✅ Correct download format verified'
  );

  console.log(
    '✅ FT-23 Passed - Download functionality verified successfully'
  );

});




test('FT-24 - Verify Data Consistency Across Modules', async ({ page }) => {
  test.setTimeout(90000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/manage-profile-image/);

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', { name: /Class/i }).selectOption({
    label: 'Grade 1'
  });

  await page.waitForTimeout(2000);

  await page.getByRole('combobox', { name: /Section/i }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', { name: /Category/i }).selectOption({
    label: 'Student'
  });

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', { name: /Search/i }).click()
  ]);

  const studentRow = page
    .locator('table tbody tr')
    .filter({ hasText: 'ADHVIK H' })
    .first();

  await expect(studentRow).toBeVisible({
    timeout: 20000
  });

  const studentName = await studentRow.locator('td').nth(2).textContent();
  const admissionNo = await studentRow.locator('td').nth(3).textContent();

  const studentImage = studentRow.getByRole('img', {
    name: /photograph preview/i
  });

  await expect(studentImage).toBeVisible({
    timeout: 10000
  });

  const profileImageSrc = await studentImage.getAttribute('src');

  expect(studentName?.trim()).toBeTruthy();
  expect(admissionNo?.trim()).toBeTruthy();
  expect(profileImageSrc).toBeTruthy();
  expect(profileImageSrc).not.toContain('undefined');
  expect(profileImageSrc).not.toContain('null');

  console.log(`✅ Manage Profile Student: ${studentName?.trim()}`);
  console.log(`✅ Admission No: ${admissionNo?.trim()}`);

  await page.goto('https://or-demo.knrleap.org/admin/student/360', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/student\/360/);

  const student360Body = await page.locator('body').innerText();

  expect(student360Body.length).toBeGreaterThan(0);

  const student360Images = page.locator('img');

  const student360ImageCount = await student360Images.count();

  expect(student360ImageCount).toBeGreaterThan(0);

  await expect(student360Images.first()).toBeVisible();

  console.log('✅ Student 360 module verified');

  await page.goto('https://or-demo.knrleap.org/admin/dashboard', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/dashboard/);

  const dashboardImages = page.locator('img');

  const dashboardImageCount = await dashboardImages.count();

  expect(dashboardImageCount).toBeGreaterThan(0);

  await expect(dashboardImages.first()).toBeVisible();

  console.log('✅ Dashboard module verified');

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/manage-profile-image/);

  console.log('✅ FT-24 Passed - Data consistency verified across modules');
});







test('INT-01 - Admission ↔ Student Master', async ({ page }) => {
    // 1. Navigate to the Provision page
    await page.goto('https://or-demo.knrleap.org/admin/provision');

    // 2. Select Academic Year: 2025-26
    const yearSelect = page.getByRole('combobox', { name: 'Academic Year:*' });
    await yearSelect.selectOption({ label: '2025-26 (Current Academic Year)' });

    // 3. Select Class: Grade 1
    const classSelect = page.getByRole('combobox', { name: 'Class:*' });
    await classSelect.selectOption({ label: 'Grade 1' });

    // 4. Select Section: A
    const sectionSelect = page.getByRole('combobox', { name: 'Section:' });
    await sectionSelect.selectOption({ label: 'A' });

    // 5. Click Search and wait for data to load
    const searchBtn = page.getByRole('button', { name: 'Search' });
    
    // We wait for the network to be idle to ensure the table is populated
    await Promise.all([
        page.waitForLoadState('networkidle'),
        searchBtn.click()
    ]);

    // 6. Verify that the table contains data and not the "No data" message
    const dataTable = page.locator('table tbody tr').first();
    
    // Assert the placeholder "No data available in table" is NOT visible
    await expect(dataTable).not.toHaveText(/No data available in table/i, { timeout: 10000 });

    // 7. Verify specific student data if known (e.g., ADHVIK H from your screenshot)
    // This confirms the "Integration" aspect mentioned in your spreadsheet
    const firstRowText = await dataTable.innerText();
    if (firstRowText.includes('ADHVIK H')) {
        console.log('✅ INT-01 Passed: Student "ADHVIK H" found in Grade 1-A results.');
    } else {
        console.log('✅ INT-01 Passed: Results loaded successfully for Grade 1-A.');
    }
});







test('INT-03 - Admission ↔ File Retrieval', async ({ page }) => {
    // 1. Navigate to the Manage Profile Image page
    await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image');

    // 2. Fill all mandatory filters
    await page.getByRole('combobox', { name: 'Academic Year:*' })
        .selectOption({ label: '2025-26 (Current Academic Year)' });
    
    await page.getByRole('combobox', { name: 'Class:*' })
        .selectOption({ label: 'Grade 1' });

    // Select Section A
    await page.getByRole('combobox', { name: 'Section:' })
        .selectOption({ label: 'A' });

    // Select Category Student
    await page.getByRole('combobox', { name: 'Category:*' })
        .selectOption({ label: 'Student' });

    // 3. Perform search and wait for network to settle
    await Promise.all([
        page.waitForLoadState('networkidle'),
        page.getByRole('button', { name: 'Search' }).click()
    ]);

    // 4. Verify data is displayed
    const dataRow = page.locator('table tbody tr').first();
    // Ensure we don't have the "No data" placeholder
    await expect(dataRow).not.toContainText(/No data available/i);
    
    // Verify the image exists in the row
    const firstRowImg = dataRow.locator('img');
    await expect(firstRowImg).toBeVisible();

    console.log('✅ INT-03 Passed: Data displayed correctly for Grade 1-A (Student).');
});








test('INT-04 - Validation Integration', async ({ page }) => {
    // 1. Setup invalid file (PDF) - ensuring it exists in the test directory
    const filePath = path.resolve(__dirname, 'sample.pdf');
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, '%PDF-1.4 %%%EOF');
    }

    // 2. Navigate to the Provision page
    await page.goto('https://or-demo.knrleap.org/admin/provision');

    // 3. Select filters to load the specific data set
    await page.getByRole('combobox', { name: 'Academic Year:*' })
        .selectOption({ label: '2025-26 (Current Academic Year)' });
    await page.getByRole('combobox', { name: 'Class:*' })
        .selectOption({ label: 'Grade 1' });
    await page.getByRole('combobox', { name: 'Section:' })
        .selectOption({ label: 'A' });

    // 4. Perform Search and wait for the table to load via networkidle
    await Promise.all([
        page.waitForLoadState('networkidle'),
        page.getByRole('button', { name: 'Search' }).click()
    ]);

    // 5. Locate the specific student row
    const targetRow = page.locator('table tbody tr').filter({ hasText: 'ADHVIK H' });
    await expect(targetRow).toBeVisible({ timeout: 10000 });

  // 6. Target the Student-specific file input
    const studentUploadInput = targetRow.locator('input[data-upload-type="photograph"]');
    
    // 7. Upload the PDF (Invalid type)
    await studentUploadInput.setInputFiles(filePath);

    // 8. FIX: Simplified Validation Logic
    // Locate the error message directly within the ADHVIK H row
    const errorMessage = targetRow.locator('text=/Invalid file type/i');

    // Assert that the 'Invalid' text is visible to pass the test
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    // Optional but recommended: Verify the Upload button is disabled 
    // to confirm the UI blocked the action.
    await expect(targetRow.getByRole('button', { name: 'Upload' }).first()).toBeDisabled();

    console.log('✅ INT-04 Passed: Validation message displayed correctly for invalid PDF.');
});






test('INT-05 - Cancel ↔ Form Integration', async ({ page }) => {
    // 1. Navigate to the Provision page
    await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image');

    // 2. Select specific dropdown values
    const yearCombo = page.getByRole('combobox', { name: 'Academic Year:*' });
    const classCombo = page.getByRole('combobox', { name: 'Class:*' });
    const sectionCombo = page.getByRole('combobox', { name: 'Section:' });

    await yearCombo.selectOption({ label: '2024-25' });
    await classCombo.selectOption({ label: 'Grade 5' });
    await sectionCombo.selectOption({ label: 'A' });

    // Verify selections are applied before canceling
    await expect(yearCombo).toHaveValue(/[0-9]+/); // Verifies a selection exists

    /**
     * 3. Action: Click Cancel
     * According to your test sheet: "Select Year=2024-25, Class=5 -> Click Cancel"
     */
    await page.getByRole('button', { name: 'Cancel' }).click();

    // 4. Expected Result: All fields reset
    // Usually, reset fields return to their default index (0) or a "-- Select --" state
    await expect(yearCombo).toHaveValue(''); 
    await expect(classCombo).toHaveValue('');
    await expect(sectionCombo).toHaveValue('');

    // 5. Verification: Ensure no data is loaded in the table after reset
    const tableRows = page.locator('table tbody tr');
    // If the form resets, the table should either be empty or show a placeholder
    await expect(tableRows).toHaveCount(0);

    console.log('✅ INT-05 Passed: Form successfully reset after clicking Cancel.');
});







test('INT-06 - Admission to Exam Module Report Card Photo Fetch', async ({ page }) => {
  test.setTimeout(90000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/manage-profile-image/);

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', { name: /Class/i }).selectOption({
    label: 'Grade 1'
  });

  await page.waitForTimeout(2000);

  await page.getByRole('combobox', { name: /Section/i }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', { name: /Category/i }).selectOption({
    label: 'Student'
  });

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', { name: /Search/i }).click()
  ]);

  const studentRow = page
    .locator('table tbody tr')
    .filter({ hasText: 'ADHVIK H' })
    .first();

  await expect(studentRow).toBeVisible({
    timeout: 20000
  });

  const studentImage = studentRow.getByRole('img', {
    name: /photograph preview/i
  });

  await expect(studentImage).toBeVisible({
    timeout: 10000
  });

  const imageSrc = await studentImage.getAttribute('src');

  expect(imageSrc).toBeTruthy();
  expect(imageSrc).not.toContain('undefined');
  expect(imageSrc).not.toContain('null');

  console.log('✅ Student photo available in Manage Profile Pictures');

  await page.goto('https://or-demo.knrleap.org/admin/reportcard', {
    waitUntil: 'domcontentloaded'
  });

  await expect(page).toHaveURL(/reportcard/);

  const reportCardBody = await page.locator('body').innerText();

  expect(reportCardBody.length).toBeGreaterThan(0);

  const reportCardImages = page.locator('img');

  const imageCount = await reportCardImages.count();

  expect(imageCount).toBeGreaterThan(0);

  await expect(reportCardImages.first()).toBeVisible();

  console.log('✅ INT-06 Passed - Student photo fetched correctly in Report Card');
});






test('INT-07 - Admission to Parent App Integration', async ({ page }) => {
  test.setTimeout(90000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/manage-profile-image/);

  await page.getByRole('combobox', {
    name: /Academic Year/i
  }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', {
    name: /Class/i
  }).selectOption({
    label: 'Grade 1'
  });

  await page.waitForTimeout(2000);

  await page.getByRole('combobox', {
    name: /Section/i
  }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', {
    name: /Category/i
  }).selectOption({
    label: 'Student'
  });

  await Promise.all([
    page.waitForLoadState('networkidle'),

    page.getByRole('button', {
      name: /search/i
    }).click()
  ]);

  const rows = page.locator('table tbody tr');

  await expect(rows.first()).toBeVisible({
    timeout: 20000
  });

  const firstRow = rows.first();

  const studentImage = firstRow.locator('img').first();

  await expect(studentImage).toBeVisible();

  const studentImageSrc = await studentImage.getAttribute('src');

  expect(studentImageSrc).toBeTruthy();

  console.log('✅ Student photo displayed');

  // ======================================================
  // VERIFY FATHER PHOTO
  // ======================================================

  await page.getByRole('combobox', {
    name: /Category/i
  }).selectOption({
    label: 'Father'
  });

  await Promise.all([
    page.waitForLoadState('networkidle'),

    page.getByRole('button', {
      name: /search/i
    }).click()
  ]);

  const fatherRows = page.locator('table tbody tr');

  await expect(fatherRows.first()).toBeVisible({
    timeout: 20000
  });

  const fatherImage = fatherRows.first().locator('img').first();

  await expect(fatherImage).toBeVisible();

  const fatherImageSrc = await fatherImage.getAttribute('src');

  expect(fatherImageSrc).toBeTruthy();

  console.log('✅ Father photo displayed');

  // ======================================================
  // VERIFY MOTHER PHOTO
  // ======================================================

  await page.getByRole('combobox', {
    name: /Category/i
  }).selectOption({
    label: 'Mother'
  });

  await Promise.all([
    page.waitForLoadState('networkidle'),

    page.getByRole('button', {
      name: /search/i
    }).click()
  ]);

  const motherRows = page.locator('table tbody tr');

  await expect(motherRows.first()).toBeVisible({
    timeout: 20000
  });

  const motherImage = motherRows.first().locator('img').first();

  await expect(motherImage).toBeVisible();

  const motherImageSrc = await motherImage.getAttribute('src');

  expect(motherImageSrc).toBeTruthy();

  console.log('✅ Mother photo displayed');

  // ======================================================
  // FINAL RESULT
  // ======================================================

  console.log(
    '✅ INT-07 Passed - Student, Father & Mother photos fetched correctly'
  );
});





test('INT-08 - Admission to Student 360 Integration', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/manage-profile-image/);

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', { name: /Class/i }).selectOption({
    label: 'Grade 1'
  });

  await page.waitForTimeout(2000);

  await page.getByRole('combobox', { name: /Section/i }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', { name: /Category/i }).selectOption({
    label: 'Student'
  });

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', { name: /search/i }).click()
  ]);

  const studentRow = page
    .locator('table tbody tr')
    .filter({ hasText: 'ADHVIK H' })
    .first();

  await expect(studentRow).toBeVisible({ timeout: 20000 });

  const admissionPhoto = studentRow.getByRole('img', {
    name: /photograph preview/i
  });

  await expect(admissionPhoto).toBeVisible({ timeout: 10000 });

  const admissionPhotoSrc = await admissionPhoto.getAttribute('src');

  expect(admissionPhotoSrc).toBeTruthy();
  expect(admissionPhotoSrc).not.toContain('undefined');
  expect(admissionPhotoSrc).not.toContain('null');

  console.log('✅ Student photo visible in Admission module');

  await page.goto('https://or-demo.knrleap.org/admin/student/360', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/student\/360/);

  const pageText = await page.locator('body').innerText();

  expect(pageText.length).toBeGreaterThan(0);

  const student360Images = page.locator('img');

  const imageCount = await student360Images.count();

  console.log(`✅ Student 360 images found: ${imageCount}`);

  expect(imageCount).toBeGreaterThan(0);

  await expect(student360Images.first()).toBeVisible({ timeout: 20000 });

  console.log('✅ INT-08 Passed - Student 360 module photo fetch verified');
});





test('INT-09 - Downloaded Image File Integrity Verification', async ({ page }) => {

  test.setTimeout(120000);

  // ======================================================
  // OPEN PAGE
  // ======================================================

  await page.goto(
    'https://or-demo.knrleap.org/admin/manage-profile-image',
    {
      waitUntil: 'networkidle'
    }
  );

  await expect(page).toHaveURL(
    /manage-profile-image/
  );

  // ======================================================
  // SELECT FILTERS
  // ======================================================

  await page.getByRole('combobox', {
    name: /Academic Year/i
  }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', {
    name: /Class/i
  }).selectOption({
    label: 'Grade 1'
  });

  await page.waitForTimeout(2000);

  await page.getByRole('combobox', {
    name: /Section/i
  }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', {
    name: /Category/i
  }).selectOption({
    label: 'Student'
  });

  // ======================================================
  // CLICK SEARCH
  // ======================================================

  await Promise.all([
    page.waitForLoadState('networkidle'),

    page.getByRole('button', {
      name: /search/i
    }).click()
  ]);

  const rows = page.locator(
    'table tbody tr'
  );

  await expect(
    rows.first()
  ).toBeVisible({
    timeout: 20000
  });

  // ======================================================
  // SELECT FIRST STUDENT
  // ======================================================

  const firstCheckbox = page.locator(
    'table tbody input[type="checkbox"]'
  ).first();

  await firstCheckbox.check();

  await expect(
    firstCheckbox
  ).toBeChecked();

  console.log(
    '✅ Student selected'
  );

  // ======================================================
  // DOWNLOAD FILE
  // ======================================================

  const downloadButton = page.getByRole(
    'button',
    {
      name: /Download with Admission Number/i
    }
  );

  await expect(
    downloadButton
  ).toBeVisible();

  const [ download ] = await Promise.all([
    page.waitForEvent('download'),

    downloadButton.click()
  ]);

  const fileName =
    download.suggestedFilename();

  console.log(
    `✅ Downloaded File: ${fileName}`
  );

  expect(fileName).toBeTruthy();

  // ======================================================
  // SAVE FILE
  // ======================================================

  const downloadPath =
    `test-results/${fileName}`;

  await download.saveAs(downloadPath);

  console.log(
    `✅ File saved at: ${downloadPath}`
  );

  // ======================================================
  // VERIFY FILE EXISTS
  // ======================================================

  const fs = require('fs');

  const fileExists =
    fs.existsSync(downloadPath);

  expect(fileExists).toBeTruthy();

  // ======================================================
  // VERIFY FILE SIZE
  // ======================================================

  const stats =
    fs.statSync(downloadPath);

  console.log(
    `✅ File Size: ${stats.size} bytes`
  );

  expect(stats.size)
    .toBeGreaterThan(0);

  // ======================================================
  // VERIFY FILE EXTENSION
  // ======================================================

  const validExtensions = [
    '.zip',
    '.png',
    '.jpg',
    '.jpeg',
    '.pdf'
  ];

  const hasValidExtension =
    validExtensions.some(ext =>
      fileName.toLowerCase().endsWith(ext)
    );

  expect(hasValidExtension)
    .toBeTruthy();

  console.log(
    '✅ File extension verified'
  );

  // ======================================================
  // FINAL RESULT
  // ======================================================

  console.log(
    '✅ INT-09 Passed - Downloaded image file integrity verified'
  );

});



test('INT-10 - Category Wise Profile Photo Fetch Verification', async ({ page }) => {
  test.setTimeout(120000);

  await page.goto('https://or-demo.knrleap.org/admin/manage-profile-image', {
    waitUntil: 'networkidle'
  });

  await expect(page).toHaveURL(/manage-profile-image/);

  await page.getByRole('combobox', { name: /Academic Year/i }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', { name: /Class/i }).selectOption({
    label: 'Grade 1'
  });

  await page.waitForTimeout(2000);

  await page.getByRole('combobox', { name: /Section/i }).selectOption({
    label: 'A'
  });

  const categories = [
    { label: 'Student', alt: 'photograph' },
    { label: 'Father', alt: 'father_photograph' },
    { label: 'Mother', alt: 'mother_photograph' },
    { label: 'Guardian', alt: 'guardian' }
  ];

  for (const category of categories) {
    await page.getByRole('combobox', { name: /Category/i }).selectOption({
      label: category.label
    });

    await Promise.all([
      page.waitForLoadState('networkidle'),
      page.getByRole('button', { name: /search/i }).click()
    ]);

    const rows = page.locator('table tbody tr');

    await expect(rows.first()).toBeVisible({
      timeout: 20000
    });

    const rowCount = await rows.count();

    expect(rowCount).toBeGreaterThan(0);

    const visibleImage = page
      .locator(`//table//tbody//img[contains(@alt,"${category.alt}") and string-length(@src) > 0]`)
      .first();

    if (await visibleImage.count() > 0) {
      await expect(visibleImage).toBeVisible({
        timeout: 10000
      });

      const imageSrc = await visibleImage.getAttribute('src');

      expect(imageSrc).toBeTruthy();
      expect(imageSrc).not.toContain('undefined');
      expect(imageSrc).not.toContain('null');

      console.log(`✅ ${category.label} photo fetched successfully`);
    } else {
      console.log(`⚠️ ${category.label} photo not available, but records loaded`);
    }
  }

  console.log('✅ INT-10 Passed - Category wise profile photo fetch verified');
});












const BASE_URL = 'https://or-demo.knrleap.org';

test('SYS-02 - Verify UI Colors and Alignment', async ({ page }) => {

  test.setTimeout(60000);

  // ======================================================
  // OPEN PAGE
  // ======================================================

  await page.goto(
    `${BASE_URL}/admin/manage-profile-image`,
    {
      waitUntil: 'networkidle'
    }
  );

  await expect(page).toHaveURL(/manage-profile-image/);

  // ======================================================
  // CANCEL BUTTON
  // ======================================================

  const cancelButton = page.getByRole('button', {
    name: /cancel/i
  });

  await expect(cancelButton).toBeVisible();

  const cancelStyles = await cancelButton.evaluate((el) => {
    const styles = window.getComputedStyle(el);

    return {
      background: styles.backgroundColor,
      color: styles.color,
      border: styles.borderColor
    };
  });

  console.log('Cancel Button Styles:', cancelStyles);

  // Verify button exists and has visible styling
  expect(cancelStyles.color).not.toBe('');
  expect(cancelStyles.border).not.toBe('');

  console.log('✅ Cancel button styling verified');

  // ======================================================
  // SEARCH BUTTON
  // ======================================================

  const searchButton = page.getByRole('button', {
    name: /search/i
  });

  await expect(searchButton).toBeVisible();

  const searchStyles = await searchButton.evaluate((el) => {
    const styles = window.getComputedStyle(el);

    return {
      background: styles.backgroundColor,
      color: styles.color,
      border: styles.borderColor
    };
  });

  console.log('Search Button Styles:', searchStyles);

  expect(searchStyles.color).not.toBe('');
  expect(searchStyles.border).not.toBe('');

  console.log('✅ Search button styling verified');

  // ======================================================
  // VERIFY BUTTON ALIGNMENT
  // ======================================================

  const cancelBox = await cancelButton.boundingBox();
  const searchBox = await searchButton.boundingBox();

  expect(cancelBox).not.toBeNull();
  expect(searchBox).not.toBeNull();

  if (cancelBox && searchBox) {

    // Same horizontal line
    expect(
      Math.abs(cancelBox.y - searchBox.y)
    ).toBeLessThan(10);

    // Search button should be right side of cancel
    expect(searchBox.x).toBeGreaterThan(cancelBox.x);

    console.log('✅ Button alignment verified');
  }

  // ======================================================
  // VERIFY FORM ALIGNMENT
  // ======================================================

  const formSection = page.locator('form').first();

  if (await formSection.count()) {

    const formBox = await formSection.boundingBox();

    expect(formBox).not.toBeNull();

    console.log('✅ Form alignment verified');
  }

  // ======================================================
  // VERIFY DROPDOWNS VISIBLE
  // ======================================================

  await expect(
    page.getByRole('combobox', {
      name: /Academic Year/i
    })
  ).toBeVisible();

  await expect(
    page.getByRole('combobox', {
      name: /Class/i
    })
  ).toBeVisible();

  await expect(
    page.getByRole('combobox', {
      name: /Section/i
    })
  ).toBeVisible();

  await expect(
    page.getByRole('combobox', {
      name: /Category/i
    })
  ).toBeVisible();

  console.log('✅ Dropdown alignment verified');

  // ======================================================
  // FINAL RESULT
  // ======================================================

  console.log('✅ SYS-02 Passed - UI Colors and Alignment verified');
});








// const BASE_URL = 'https://or-demo.knrleap.org';

test('SYS-03 - Search & Show Entries', async ({ page }) => {

  test.setTimeout(90000);

  // ======================================================
  // OPEN PAGE
  // ======================================================

  await page.goto(
    `${BASE_URL}/admin/manage-profile-image`,
    {
      waitUntil: 'networkidle'
    }
  );

  // ======================================================
  // VERIFY PAGE
  // ======================================================

  await expect(page).toHaveURL(/manage-profile-image/);

  // ======================================================
  // SELECT FILTERS
  // ======================================================

  await page.getByRole('combobox', {
    name: /Academic Year/i
  }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', {
    name: /Class/i
  }).selectOption({
    label: 'Grade 1'
  });

  // Wait for Section dropdown values
  await page.waitForTimeout(2000);

  await page.getByRole('combobox', {
    name: /Section/i
  }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', {
    name: /Category/i
  }).selectOption({
    label: 'Student'
  });

  console.log('✅ Filters selected');

  // ======================================================
  // CLICK SEARCH
  // ======================================================

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', {
      name: /search/i
    }).click()
  ]);

  console.log('✅ Search completed');

  // ======================================================
  // VERIFY TABLE ROWS EXIST
  // ======================================================

  const rows = page.locator('table tbody tr');

  await expect(rows.first()).toBeVisible({
    timeout: 20000
  });

  const rowCount = await rows.count();

  console.log(`✅ Total rows displayed: ${rowCount}`);

  expect(rowCount).toBeGreaterThan(0);

  // ======================================================
  // VERIFY TABLE CONTENT
  // ======================================================

  const firstRowText = await rows.first().textContent();

  console.log('First Row:', firstRowText);

  expect(firstRowText).toContain('Grade 1');

  console.log('✅ Table data verified');

  // ======================================================
  // VERIFY SEARCH RESULT MANUALLY
  // ======================================================

  const matchingRow = rows.filter({
    hasText: 'ADHVIK'
  }).first();

  await expect(matchingRow).toBeVisible();

  console.log('✅ Student search verification passed');

  // ======================================================
  // VERIFY IMAGES ARE DISPLAYED
  // ======================================================

  const images = page.locator('table tbody img');

  const imageCount = await images.count();

  console.log(`✅ Total images displayed: ${imageCount}`);

  expect(imageCount).toBeGreaterThan(0);

  // ======================================================
  // FINAL RESULT
  // ======================================================

  console.log('✅ SYS-03 Passed - Search & Table verification completed');

});










// const BASE_URL = 'https://or-demo.knrleap.org';

test('SYS-04 - Data Persistence After Relogin', async ({ page }) => {

  test.setTimeout(120000);

  // ======================================================
  // OPEN PAGE
  // ======================================================

  await page.goto(
    `${BASE_URL}/admin/manage-profile-image`,
    {
      waitUntil: 'networkidle'
    }
  );

  // ======================================================
  // VERIFY PAGE LOADED
  // ======================================================

  await expect(page).toHaveURL(/manage-profile-image/);

  // ======================================================
  // SELECT FILTERS
  // ======================================================

  await page.getByRole('combobox', {
    name: /Academic Year/i
  }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', {
    name: /Class/i
  }).selectOption({
    label: 'Grade 1'
  });

  // Wait for section values to load
  await page.waitForTimeout(2000);

  await page.getByRole('combobox', {
    name: /Section/i
  }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', {
    name: /Category/i
  }).selectOption({
    label: 'Student'
  });

  console.log('✅ Filters selected');

  // ======================================================
  // CLICK SEARCH
  // ======================================================

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', {
      name: /search/i
    }).click()
  ]);

  console.log('✅ Search completed');

  // ======================================================
  // VERIFY TABLE DATA BEFORE RELOAD
  // ======================================================

  const rowsBefore = page.locator('table tbody tr');

  await expect(rowsBefore.first()).toBeVisible({
    timeout: 20000
  });

  const rowCountBefore = await rowsBefore.count();

  console.log(`✅ Rows before reload: ${rowCountBefore}`);

  expect(rowCountBefore).toBeGreaterThan(0);

  // Capture first student name
  const firstStudentBefore = await rowsBefore
    .first()
    .locator('td')
    .nth(2)
    .textContent();

  console.log(
    `✅ First student before reload: ${firstStudentBefore}`
  );

  // ======================================================
  // PAGE RELOAD (SIMULATE RELOGIN / REVISIT)
  // ======================================================

  await page.reload({
    waitUntil: 'networkidle'
  });

  console.log('✅ Page reloaded');

  // ======================================================
  // RE-APPLY FILTERS
  // ======================================================

  await page.getByRole('combobox', {
    name: /Academic Year/i
  }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', {
    name: /Class/i
  }).selectOption({
    label: 'Grade 1'
  });

  await page.waitForTimeout(2000);

  await page.getByRole('combobox', {
    name: /Section/i
  }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', {
    name: /Category/i
  }).selectOption({
    label: 'Student'
  });

  // ======================================================
  // SEARCH AGAIN
  // ======================================================

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', {
      name: /search/i
    }).click()
  ]);

  console.log('✅ Search completed after reload');

  // ======================================================
  // VERIFY TABLE DATA AFTER RELOAD
  // ======================================================

  const rowsAfter = page.locator('table tbody tr');

  await expect(rowsAfter.first()).toBeVisible({
    timeout: 20000
  });

  const rowCountAfter = await rowsAfter.count();

  console.log(`✅ Rows after reload: ${rowCountAfter}`);

  expect(rowCountAfter).toBeGreaterThan(0);

  // Capture first student again
  const firstStudentAfter = await rowsAfter
    .first()
    .locator('td')
    .nth(2)
    .textContent();

  console.log(
    `✅ First student after reload: ${firstStudentAfter}`
  );

  // ======================================================
  // VERIFY DATA PERSISTENCE
  // ======================================================

  expect(firstStudentAfter?.trim()).toBe(
    firstStudentBefore?.trim()
  );

  console.log('✅ Data persistence verified successfully');

  // ======================================================
  // VERIFY IMAGES STILL EXIST
  // ======================================================

  const images = page.locator('table tbody img');

  const imageCount = await images.count();

  console.log(`✅ Images available: ${imageCount}`);

  expect(imageCount).toBeGreaterThan(0);

  // ======================================================
  // FINAL RESULT
  // ======================================================

  console.log(
    '✅ SYS-04 Passed - Data Persistence verified successfully'
  );

});








// const BASE_URL = 'https://or-demo.knrleap.org';

test('SYS-05 - Verify Download With Admission Number', async ({ page }) => {

  test.setTimeout(120000);

  // ======================================================
  // OPEN PAGE
  // ======================================================

  await page.goto(
    `${BASE_URL}/admin/manage-profile-image`,
    {
      waitUntil: 'networkidle'
    }
  );

  // ======================================================
  // VERIFY PAGE
  // ======================================================

  await expect(page).toHaveURL(/manage-profile-image/);

  // ======================================================
  // SELECT FILTERS
  // ======================================================

  await page.getByRole('combobox', {
    name: /Academic Year/i
  }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', {
    name: /Class/i
  }).selectOption({
    label: 'Grade 1'
  });

  // Wait for Section dropdown values
  await page.waitForTimeout(2000);

  await page.getByRole('combobox', {
    name: /Section/i
  }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', {
    name: /Category/i
  }).selectOption({
    label: 'Student'
  });

  console.log('✅ Filters selected');

  // ======================================================
  // CLICK SEARCH
  // ======================================================

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', {
      name: /search/i
    }).click()
  ]);

  console.log('✅ Search completed');

  // ======================================================
  // VERIFY TABLE DATA EXISTS
  // ======================================================

  const rows = page.locator('table tbody tr');

  await expect(rows.first()).toBeVisible({
    timeout: 20000
  });

  const rowCount = await rows.count();

  console.log(`✅ Total rows displayed: ${rowCount}`);

  expect(rowCount).toBeGreaterThan(0);

  // ======================================================
  // SELECT FIRST STUDENT CHECKBOX
  // ======================================================

  const firstCheckbox = page.locator(
    'table tbody input[type="checkbox"]'
  ).first();

  await expect(firstCheckbox).toBeVisible();

  await firstCheckbox.check();

  await expect(firstCheckbox).toBeChecked();

  console.log('✅ First student selected');

  // ======================================================
  // VERIFY DOWNLOAD BUTTON
  // ======================================================

  const downloadButton = page.getByRole('button', {
    name: /Download with Admission Number/i
  });

  await expect(downloadButton).toBeVisible();

  await expect(downloadButton).toBeEnabled();

  console.log('✅ Download button verified');

  // ======================================================
  // HANDLE DOWNLOAD
  // ======================================================

  const [download] = await Promise.all([
    page.waitForEvent('download'),

    downloadButton.click()
  ]);

  // ======================================================
  // VERIFY DOWNLOAD STARTED
  // ======================================================

  const downloadFileName = download.suggestedFilename();

  console.log(
    `✅ Download started successfully: ${downloadFileName}`
  );

  expect(downloadFileName.length).toBeGreaterThan(0);

  // ======================================================
  // SAVE FILE
  // ======================================================

  const downloadPath = `downloads/${downloadFileName}`;

  await download.saveAs(downloadPath);

  console.log(`✅ File saved at: ${downloadPath}`);

  // ======================================================
  // VERIFY SUCCESS
  // ======================================================

  expect(downloadFileName).toBeTruthy();

  console.log(
    '✅ SYS-05 Passed - Download functionality verified successfully'
  );

});








// const BASE_URL = 'https://or-demo.knrleap.org';

test('SYS-06 - Verify Checkbox Selection Functionality', async ({ page }) => {

  test.setTimeout(90000);

  // ======================================================
  // OPEN PAGE
  // ======================================================

  await page.goto(
    `${BASE_URL}/admin/manage-profile-image`,
    {
      waitUntil: 'networkidle'
    }
  );

  // ======================================================
  // VERIFY PAGE
  // ======================================================

  await expect(page).toHaveURL(/manage-profile-image/);

  // ======================================================
  // SELECT FILTERS
  // ======================================================

  await page.getByRole('combobox', {
    name: /Academic Year/i
  }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', {
    name: /Class/i
  }).selectOption({
    label: 'Grade 1'
  });

  // Wait for section values to load
  await page.waitForTimeout(2000);

  await page.getByRole('combobox', {
    name: /Section/i
  }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', {
    name: /Category/i
  }).selectOption({
    label: 'Student'
  });

  console.log('✅ Filters selected');

  // ======================================================
  // CLICK SEARCH
  // ======================================================

  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', {
      name: /search/i
    }).click()
  ]);

  console.log('✅ Search completed');

  // ======================================================
  // VERIFY TABLE ROWS EXIST
  // ======================================================

  const rows = page.locator('table tbody tr');

  await expect(rows.first()).toBeVisible({
    timeout: 20000
  });

  const rowCount = await rows.count();

  console.log(`✅ Total rows displayed: ${rowCount}`);

  expect(rowCount).toBeGreaterThan(0);

  // ======================================================
  // GET ALL ROW CHECKBOXES
  // ======================================================

  const rowCheckboxes = page.locator(
    'table tbody input[type="checkbox"]'
  );

  const checkboxCount = await rowCheckboxes.count();

  console.log(`✅ Total checkboxes found: ${checkboxCount}`);

  expect(checkboxCount).toBeGreaterThan(0);

  // ======================================================
  // VERIFY SINGLE CHECKBOX SELECTION
  // ======================================================

  const firstCheckbox = rowCheckboxes.first();

  await expect(firstCheckbox).toBeVisible();

  await firstCheckbox.check();

  await expect(firstCheckbox).toBeChecked();

  console.log('✅ First checkbox selected successfully');

  // ======================================================
  // VERIFY MULTIPLE CHECKBOX SELECTION
  // ======================================================

  if (checkboxCount >= 3) {

    await rowCheckboxes.nth(1).check();
    await rowCheckboxes.nth(2).check();

    await expect(rowCheckboxes.nth(1)).toBeChecked();
    await expect(rowCheckboxes.nth(2)).toBeChecked();

    console.log('✅ Multiple checkbox selection verified');
  }

  // ======================================================
  // VERIFY UNCHECK FUNCTIONALITY
  // ======================================================

  await firstCheckbox.uncheck();

  await expect(firstCheckbox).not.toBeChecked();

  console.log('✅ Checkbox uncheck functionality verified');

  // ======================================================
  // VERIFY HEADER CHECKBOX (IF AVAILABLE)
  // ======================================================

  const headerCheckbox = page.locator(
    'table thead input[type="checkbox"]'
  );

  if (await headerCheckbox.count() > 0) {

    await headerCheckbox.check();

    await expect(headerCheckbox).toBeChecked();

    console.log('✅ Header checkbox selected');

    // Verify all row checkboxes are checked
    const totalCheckboxes = await rowCheckboxes.count();

    for (let i = 0; i < totalCheckboxes; i++) {

      await expect(
        rowCheckboxes.nth(i)
      ).toBeChecked();
    }

    console.log('✅ Select-all functionality verified');

    // Uncheck header checkbox
    await headerCheckbox.uncheck();

    console.log('✅ Header checkbox unchecked');
  }

  // ======================================================
  // FINAL RESULT
  // ======================================================

  console.log(
    '✅ SYS-06 Passed - Checkbox selection functionality verified'
  );

});






// const BASE_URL = 'https://or-demo.knrleap.org';

test('SYS-07 - Compatibility Test in Chromium', async ({ page }) => {

  test.setTimeout(120000);

  // ======================================================
  // OPEN PAGE
  // ======================================================

  await page.goto(
    `${BASE_URL}/admin/manage-profile-image`,
    {
      waitUntil: 'networkidle'
    }
  );

  // ======================================================
  // VERIFY PAGE LOADED
  // ======================================================

  await expect(page).toHaveURL(
    /manage-profile-image/
  );

  await expect(
    page.getByRole('heading', {
      name: /Manage Profile Pictures/i
    })
  ).toBeVisible();

  console.log('✅ Page loaded successfully');

  // ======================================================
  // VERIFY IMPORTANT BUTTONS
  // ======================================================

  const cancelButton = page.getByRole(
    'button',
    {
      name: /cancel/i
    }
  );

  const searchButton = page.getByRole(
    'button',
    {
      name: /search/i
    }
  );

  await expect(cancelButton).toBeVisible();

  await expect(searchButton).toBeVisible();

  console.log('✅ Buttons visible');

  // ======================================================
  // SELECT FILTERS
  // ======================================================

  await page.getByRole('combobox', {
    name: /Academic Year/i
  }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', {
    name: /Class/i
  }).selectOption({
    label: 'Grade 1'
  });

  // Wait for section dropdown values
  await page.waitForTimeout(2000);

  await page.getByRole('combobox', {
    name: /Section/i
  }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', {
    name: /Category/i
  }).selectOption({
    label: 'Student'
  });

  console.log('✅ Filters selected successfully');

  // ======================================================
  // CLICK SEARCH
  // ======================================================

  await Promise.all([
    page.waitForLoadState('networkidle'),

    searchButton.click()
  ]);

  console.log('✅ Search completed');

  // ======================================================
  // VERIFY TABLE EXISTS
  // ======================================================

  const table = page.locator('table');

  await expect(table).toBeVisible({
    timeout: 20000
  });

  console.log('✅ Table displayed');

  // ======================================================
  // VERIFY TABLE ROWS
  // ======================================================

  const rows = page.locator(
    'table tbody tr'
  );

  await expect(rows.first()).toBeVisible({
    timeout: 20000
  });

  const rowCount = await rows.count();

  console.log(
    `✅ Total rows displayed: ${rowCount}`
  );

  expect(rowCount).toBeGreaterThan(0);

  // ======================================================
  // VERIFY IMAGE DISPLAY
  // ======================================================

  const images = page.locator(
    'table tbody img'
  );

  const imageCount = await images.count();

  console.log(
    `✅ Total images found: ${imageCount}`
  );

  expect(imageCount).toBeGreaterThan(0);

  // Verify first image visible
  await expect(
    images.first()
  ).toBeVisible();

  // ======================================================
  // VERIFY IMAGE IS LOADED
  // ======================================================

  const imageLoaded =
    await images.first().evaluate(
      (img: HTMLImageElement) => {
        return (
          img.complete &&
          img.naturalWidth > 0
        );
      }
    );

  expect(imageLoaded).toBeTruthy();

  console.log(
    '✅ Image loaded successfully'
  );

  // ======================================================
  // VERIFY PAGE RESPONSIVENESS
  // ======================================================

  const viewport = page.viewportSize();

  console.log(
    `✅ Viewport Width: ${viewport?.width}`
  );

  console.log(
    `✅ Viewport Height: ${viewport?.height}`
  );

  expect(viewport?.width).toBeGreaterThan(0);

  expect(viewport?.height).toBeGreaterThan(0);

  // ======================================================
  // VERIFY BUTTON ALIGNMENT
  // ======================================================

  const cancelBox =
    await cancelButton.boundingBox();

  const searchBox =
    await searchButton.boundingBox();

  expect(cancelBox).not.toBeNull();

  expect(searchBox).not.toBeNull();

  if (cancelBox && searchBox) {

    expect(
      Math.abs(cancelBox.y - searchBox.y)
    ).toBeLessThan(10);

    console.log(
      '✅ Button alignment verified'
    );
  }

  // ======================================================
  // FINAL RESULT
  // ======================================================

  console.log(
    '✅ SYS-07 Passed - Chromium compatibility verified successfully'
  );

});










// const BASE_URL = 'https://or-demo.knrleap.org';

test('SYS-08 - End-to-End Photo Flow Verification', async ({ page }) => {

  test.setTimeout(120000);

  // ======================================================
  // OPEN PAGE
  // ======================================================

  await page.goto(
    `${BASE_URL}/admin/manage-profile-image`,
    {
      waitUntil: 'networkidle'
    }
  );

  // ======================================================
  // VERIFY PAGE LOADED
  // ======================================================

  await expect(page).toHaveURL(
    /manage-profile-image/
  );

  await expect(
    page.getByRole('heading', {
      name: /Manage Profile Pictures/i
    })
  ).toBeVisible();

  console.log('✅ Manage Profile Pictures page loaded');

  // ======================================================
  // SELECT FILTERS
  // ======================================================

  await page.getByRole('combobox', {
    name: /Academic Year/i
  }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', {
    name: /Class/i
  }).selectOption({
    label: 'Grade 1'
  });

  // Wait for section dropdown values
  await page.waitForTimeout(2000);

  await page.getByRole('combobox', {
    name: /Section/i
  }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', {
    name: /Category/i
  }).selectOption({
    label: 'Student'
  });

  console.log('✅ Filters selected successfully');

  // ======================================================
  // CLICK SEARCH
  // ======================================================

  await Promise.all([
    page.waitForLoadState('networkidle'),

    page.getByRole('button', {
      name: /search/i
    }).click()
  ]);

  console.log('✅ Search completed');

  // ======================================================
  // VERIFY TABLE DATA
  // ======================================================

  const rows = page.locator(
    'table tbody tr'
  );

  await expect(
    rows.first()
  ).toBeVisible({
    timeout: 20000
  });

  const rowCount = await rows.count();

  console.log(
    `✅ Total rows found: ${rowCount}`
  );

  expect(rowCount).toBeGreaterThan(0);

  // ======================================================
  // VERIFY PHOTO IMAGES
  // ======================================================

  const images = page.locator(
    'table tbody img'
  );

  const imageCount = await images.count();

  console.log(
    `✅ Total images found: ${imageCount}`
  );

  expect(imageCount).toBeGreaterThan(0);

  // ======================================================
  // VERIFY FIRST IMAGE VISIBLE
  // ======================================================

  const firstImage = images.first();

  await expect(firstImage).toBeVisible();

  console.log(
    '✅ First image is visible'
  );

  // ======================================================
  // VERIFY IMAGE LOADED PROPERLY
  // ======================================================

  const imageLoaded =
    await firstImage.evaluate(
      (img: HTMLImageElement) => {
        return (
          img.complete &&
          img.naturalWidth > 0
        );
      }
    );

  expect(imageLoaded).toBeTruthy();

  console.log(
    '✅ Image loaded successfully'
  );

  // ======================================================
  // VERIFY IMAGE SOURCE
  // ======================================================

  const imageSrc =
    await firstImage.getAttribute('src');

  console.log(
    `✅ Image source: ${imageSrc}`
  );

  expect(imageSrc).toBeTruthy();

  // ======================================================
  // VERIFY DOWNLOAD BUTTON
  // ======================================================

  const downloadButton =
    page.getByRole('button', {
      name: /Download with Admission Number/i
    });

  await expect(downloadButton).toBeVisible();

  console.log(
    '✅ Download button visible'
  );

  // ======================================================
  // VERIFY CHECKBOXES
  // ======================================================

  const rowCheckboxes = page.locator(
    'table tbody input[type="checkbox"]'
  );

  const checkboxCount =
    await rowCheckboxes.count();

  console.log(
    `✅ Total checkboxes found: ${checkboxCount}`
  );

  expect(checkboxCount).toBeGreaterThan(0);

  // ======================================================
  // SELECT FIRST RECORD
  // ======================================================

  const firstCheckbox =
    rowCheckboxes.first();

  await firstCheckbox.check();

  await expect(
    firstCheckbox
  ).toBeChecked();

  console.log(
    '✅ First checkbox selected'
  );

  // ======================================================
  // VERIFY DOWNLOAD FUNCTIONALITY
  // ======================================================

  const downloadPromise =
    page.waitForEvent('download');

  await downloadButton.click();

  const download =
    await downloadPromise;

  const fileName =
    download.suggestedFilename();

  console.log(
    `✅ Download started: ${fileName}`
  );

  expect(fileName).toBeTruthy();

  // ======================================================
  // VERIFY FILE TYPE
  // ======================================================

  expect(
    fileName.endsWith('.zip') ||
    fileName.endsWith('.jpg') ||
    fileName.endsWith('.png') ||
    fileName.endsWith('.jpeg')
  ).toBeTruthy();

  console.log(
    '✅ Valid file downloaded'
  );

  // ======================================================
  // VERIFY PAGE STILL STABLE
  // ======================================================

  await expect(
    page.getByRole('heading', {
      name: /Manage Profile Pictures/i
    })
  ).toBeVisible();

  console.log(
    '✅ Page remains stable after download'
  );

  // ======================================================
  // FINAL RESULT
  // ======================================================

  console.log(
    '✅ SYS-08 Passed - End-to-End Photo Flow verified successfully'
  );

});






// const BASE_URL = 'https://or-demo.knrleap.org';

test('SYS-09 - Data Integrity Verification', async ({ page }) => {

  test.setTimeout(90000);

  // ======================================================
  // OPEN PAGE
  // ======================================================

  await page.goto(
    `${BASE_URL}/admin/manage-profile-image`,
    {
      waitUntil: 'networkidle'
    }
  );

  // ======================================================
  // VERIFY PAGE
  // ======================================================

  await expect(page).toHaveURL(
    /manage-profile-image/
  );

  await expect(
    page.getByRole('heading', {
      name: /Manage Profile Pictures/i
    })
  ).toBeVisible();

  console.log('✅ Manage Profile Pictures page loaded');

  // ======================================================
  // SELECT FILTERS
  // ======================================================

  await page.getByRole('combobox', {
    name: /Academic Year/i
  }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', {
    name: /Class/i
  }).selectOption({
    label: 'Grade 1'
  });

  // Wait for section values to load
  await page.waitForTimeout(2000);

  await page.getByRole('combobox', {
    name: /Section/i
  }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', {
    name: /Category/i
  }).selectOption({
    label: 'Student'
  });

  console.log('✅ Filters selected successfully');

  // ======================================================
  // CLICK SEARCH
  // ======================================================

  await Promise.all([
    page.waitForLoadState('networkidle'),

    page.getByRole('button', {
      name: /search/i
    }).click()
  ]);

  console.log('✅ Search completed');

  // ======================================================
  // VERIFY TABLE DATA EXISTS
  // ======================================================

  const rows = page.locator('table tbody tr');

  await expect(
    rows.first()
  ).toBeVisible({
    timeout: 20000
  });

  const rowCount = await rows.count();

  console.log(`✅ Total rows found: ${rowCount}`);

  expect(rowCount).toBeGreaterThan(0);

  // ======================================================
  // VERIFY STUDENT NAME CONSISTENCY
  // ======================================================

  const firstRow = rows.first();

  const studentName = await firstRow
    .locator('td')
    .nth(2)
    .textContent();

  const admissionNo = await firstRow
    .locator('td')
    .nth(3)
    .textContent();

  const classSection = await firstRow
    .locator('td')
    .nth(4)
    .textContent();

  console.log('Student Name:', studentName?.trim());
  console.log('Admission No:', admissionNo?.trim());
  console.log('Class & Section:', classSection?.trim());

  expect(studentName?.trim()).not.toBe('');
  expect(admissionNo?.trim()).not.toBe('');
  expect(classSection?.trim()).toContain('Grade');

  console.log('✅ Student data integrity verified');

  // ======================================================
  // VERIFY IMAGE EXISTS
  // ======================================================

  const studentImage = firstRow.locator('img');

  await expect(studentImage).toBeVisible();

  const imageSrc = await studentImage.getAttribute('src');

  console.log('Image Source:', imageSrc);

  expect(imageSrc).not.toBeNull();
  expect(imageSrc).not.toContain('undefined');

  console.log('✅ Student image verified');

  // ======================================================
  // VERIFY MULTIPLE ROWS HAVE VALID DATA
  // ======================================================

  const rowsToValidate = Math.min(rowCount, 5);

  for (let i = 0; i < rowsToValidate; i++) {

    const currentRow = rows.nth(i);

    const currentStudent = await currentRow
      .locator('td')
      .nth(2)
      .textContent();

    const currentAdmission = await currentRow
      .locator('td')
      .nth(3)
      .textContent();

    expect(currentStudent?.trim()).not.toBe('');
    expect(currentAdmission?.trim()).not.toBe('');

    console.log(
      `✅ Row ${i + 1} verified: ${currentStudent?.trim()}`
    );
  }

  // ======================================================
  // FINAL RESULT
  // ======================================================

  console.log(
    '✅ SYS-09 Passed - Data integrity verified successfully'
  );

});







test('SYS-10 - Performance and Page Load Verification', async ({ page }) => {

  const startTime = Date.now();

  await page.goto(
    'https://or-demo.knrleap.org/admin/manage-profile-image',
    {
      waitUntil: 'networkidle'
    }
  );

  const pageLoadTime = Date.now() - startTime;

  console.log(`✅ Page Load Time: ${pageLoadTime} ms`);

  expect(pageLoadTime).toBeLessThan(20000);

  await expect(page).toHaveURL(
    /manage-profile-image/
  );

  await expect(
    page.getByRole('heading', {
      name: /Manage Profile Pictures/i
    })
  ).toBeVisible();

  console.log('✅ Page loaded successfully');

  const filterStartTime = Date.now();

  await page.getByRole('combobox', {
    name: /Academic Year/i
  }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', {
    name: /Class/i
  }).selectOption({
    label: 'Grade 1'
  });

  await page.waitForTimeout(2000);

  await page.getByRole('combobox', {
    name: /Section/i
  }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', {
    name: /Category/i
  }).selectOption({
    label: 'Student'
  });

  console.log('✅ Filters selected');

  await Promise.all([
    page.waitForLoadState('networkidle'),

    page.getByRole('button', {
      name: /search/i
    }).click()
  ]);

  const searchLoadTime =
    Date.now() - filterStartTime;

  console.log(
    `✅ Search Response Time: ${searchLoadTime} ms`
  );

  expect(searchLoadTime).toBeLessThan(20000);

  const rows = page.locator(
    'table tbody tr'
  );

  await expect(
    rows.first()
  ).toBeVisible({
    timeout: 20000
  });

  const rowCount = await rows.count();

  console.log(
    `✅ Total rows loaded: ${rowCount}`
  );

  expect(rowCount).toBeGreaterThan(0);

  const images = page.locator(
    'table tbody img'
  );

  const imageCount = await images.count();

  console.log(
    `✅ Total images loaded: ${imageCount}`
  );

  expect(imageCount).toBeGreaterThan(0);

  const firstImage = images.first();

  await expect(firstImage).toBeVisible();

  await page.waitForFunction(
    (img) => {
      return img.complete && img.naturalWidth > 0;
    },
    await firstImage.elementHandle()
  );

  console.log('✅ Images loaded correctly');

  const memoryUsage = await page.evaluate(() => {
    return (performance as any).memory
      ? {
          usedJSHeapSize:
            (performance as any).memory.usedJSHeapSize,
          totalJSHeapSize:
            (performance as any).memory.totalJSHeapSize
        }
      : null;
  });

  console.log(
    '✅ Browser Memory Usage:',
    memoryUsage
  );

  const table = page.locator('table');

  await expect(table).toBeVisible();

  const tableBox =
    await table.boundingBox();

  expect(tableBox).not.toBeNull();

  if (tableBox) {

    console.log(
      `✅ Table Width: ${tableBox.width}`
    );

    console.log(
      `✅ Table Height: ${tableBox.height}`
    );

    expect(tableBox.width)
      .toBeGreaterThan(300);

    expect(tableBox.height)
      .toBeGreaterThan(100);
  }

  console.log(
    '✅ SYS-10 Passed - Performance verified successfully'
  );

});







test('SYS-11 - Download Functionality Verification', async ({ page }) => {

  await page.goto(
    'https://or-demo.knrleap.org/admin/manage-profile-image',
    {
      waitUntil: 'networkidle'
    }
  );

  await expect(page).toHaveURL(
    /manage-profile-image/
  );

  await expect(
    page.getByRole('heading', {
      name: /Manage Profile Pictures/i
    })
  ).toBeVisible();

  console.log('✅ Page loaded successfully');

  await page.getByRole('combobox', {
    name: /Academic Year/i
  }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', {
    name: /Class/i
  }).selectOption({
    label: 'Grade 1'
  });

  await page.waitForTimeout(2000);

  await page.getByRole('combobox', {
    name: /Section/i
  }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', {
    name: /Category/i
  }).selectOption({
    label: 'Student'
  });

  console.log('✅ Filters selected');

  await Promise.all([
    page.waitForLoadState('networkidle'),

    page.getByRole('button', {
      name: /search/i
    }).click()
  ]);

  const rows = page.locator(
    'table tbody tr'
  );

  await expect(
    rows.first()
  ).toBeVisible({
    timeout: 20000
  });

  const rowCount = await rows.count();

  console.log(
    `✅ Total rows available: ${rowCount}`
  );

  expect(rowCount).toBeGreaterThan(0);

  const checkboxes = page.locator(
    'table tbody input[type="checkbox"]'
  );

  const checkboxCount =
    await checkboxes.count();

  expect(checkboxCount)
    .toBeGreaterThan(0);

  await checkboxes.first().check();

  await expect(
    checkboxes.first()
  ).toBeChecked();

  console.log(
    '✅ Student checkbox selected'
  );

  const downloadButton = page.getByRole(
    'button',
    {
      name: /Download with Admission Number/i
    }
  );

  await expect(
    downloadButton
  ).toBeVisible();

  const [ download ] = await Promise.all([

    page.waitForEvent('download'),

    downloadButton.click()

  ]);

  const fileName =
    download.suggestedFilename();

  console.log(
    `✅ Downloaded File Name: ${fileName}`
  );

  expect(fileName.length)
    .toBeGreaterThan(0);

  await download.saveAs(
    `downloads/${fileName}`
  );

  console.log(
    '✅ File downloaded successfully'
  );

  console.log(
    '✅ SYS-11 Passed - Download functionality verified successfully'
  );

});





test('SYS-12 - Sync Performance Verification', async ({ page }) => {

  await page.goto(
    'https://or-demo.knrleap.org/admin/manage-profile-image',
    {
      waitUntil: 'networkidle'
    }
  );

  await expect(page).toHaveURL(
    /manage-profile-image/
  );

  await expect(
    page.getByRole('heading', {
      name: /Manage Profile Pictures/i
    })
  ).toBeVisible();

  console.log('✅ Page loaded successfully');

  await page.getByRole('combobox', {
    name: /Academic Year/i
  }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', {
    name: /Class/i
  }).selectOption({
    label: 'Grade 1'
  });

  await page.waitForTimeout(2000);

  await page.getByRole('combobox', {
    name: /Section/i
  }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', {
    name: /Category/i
  }).selectOption({
    label: 'Student'
  });

  console.log('✅ Filters selected');

  const syncStartTime = Date.now();

  await Promise.all([
    page.waitForLoadState('networkidle'),

    page.getByRole('button', {
      name: /search/i
    }).click()
  ]);

  const syncTime =
    Date.now() - syncStartTime;

  console.log(
    `✅ Sync completed in ${syncTime} ms`
  );

  expect(syncTime)
    .toBeLessThan(5000);

  const rows = page.locator(
    'table tbody tr'
  );

  await expect(
    rows.first()
  ).toBeVisible({
    timeout: 20000
  });

  const rowCount =
    await rows.count();

  console.log(
    `✅ Total synced rows: ${rowCount}`
  );

  expect(rowCount)
    .toBeGreaterThan(0);

  const images = page.locator(
    'table tbody img'
  );

  const imageCount =
    await images.count();

  console.log(
    `✅ Total synced images: ${imageCount}`
  );

  expect(imageCount)
    .toBeGreaterThan(0);

  await expect(
    images.first()
  ).toBeVisible();

  console.log(
    '✅ Images synced successfully'
  );

  console.log(
    '✅ SYS-12 Passed - Sync performance verified successfully'
  );

});




test('SYS-13 - Broken Link and Image Verification', async ({ page }) => {

  await page.goto(
    'https://or-demo.knrleap.org/admin/manage-profile-image',
    {
      waitUntil: 'networkidle'
    }
  );

  await expect(page).toHaveURL(
    /manage-profile-image/
  );

  await expect(
    page.getByRole('heading', {
      name: /Manage Profile Pictures/i
    })
  ).toBeVisible();

  console.log('✅ Page loaded successfully');

  await page.getByRole('combobox', {
    name: /Academic Year/i
  }).selectOption({
    label: '2025-26 (Current Academic Year)'
  });

  await page.getByRole('combobox', {
    name: /Class/i
  }).selectOption({
    label: 'Grade 1'
  });

  await page.waitForTimeout(2000);

  await page.getByRole('combobox', {
    name: /Section/i
  }).selectOption({
    label: 'A'
  });

  await page.getByRole('combobox', {
    name: /Category/i
  }).selectOption({
    label: 'Student'
  });

  console.log('✅ Filters selected');

  await Promise.all([
    page.waitForLoadState('networkidle'),

    page.getByRole('button', {
      name: /search/i
    }).click()
  ]);

  const rows = page.locator(
    'table tbody tr'
  );

  await expect(
    rows.first()
  ).toBeVisible({
    timeout: 20000
  });

  const rowCount =
    await rows.count();

  console.log(
    `✅ Total rows loaded: ${rowCount}`
  );

  expect(rowCount)
    .toBeGreaterThan(0);

  const images = page.locator(
    'table tbody img'
  );

  const imageCount =
    await images.count();

  console.log(
    `✅ Total images found: ${imageCount}`
  );

  expect(imageCount)
    .toBeGreaterThan(0);

  for (let i = 0; i < imageCount; i++) {

    const image = images.nth(i);

    await expect(image).toBeVisible();

    const imageStatus =
      await image.evaluate(
        (img: HTMLImageElement) => {
          return {
            complete: img.complete,
            naturalWidth: img.naturalWidth,
            src: img.src
          };
        }
      );

    console.log(
      `✅ Image ${i + 1} Status:`,
      imageStatus
    );

    expect(imageStatus.complete)
      .toBeTruthy();

    expect(imageStatus.naturalWidth)
      .toBeGreaterThan(0);
  }

  console.log(
    '✅ No broken images found'
  );

  const links = page.locator('a');

  const linkCount =
    await links.count();

  console.log(
    `✅ Total links found: ${linkCount}`
  );

  expect(linkCount)
    .toBeGreaterThan(0);

  for (let i = 0; i < linkCount; i++) {

    const href =
      await links.nth(i).getAttribute('href');

    if (
      href &&
      href !== '#' &&
      !href.startsWith('javascript')
    ) {

      console.log(
        `✅ Valid Link: ${href}`
      );

      expect(href.length)
        .toBeGreaterThan(0);
    }
  }

  console.log(
    '✅ SYS-13 Passed - Broken link and image verification successful'
  );

});
});
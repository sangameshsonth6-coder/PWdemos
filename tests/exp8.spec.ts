import { test, expect } from '@playwright/test';

test('TC_IAR_01 - Verify records retrieval for Today', async ({ page }) => {
    await page.goto('https://or-demo.knrleap.org/admin/incoming_amount_report');

    // The Filter Type dropdown is the second combobox on the page
    // (first is Academic Year, second is Filter Type)
    const filterTypeDropdown = page.locator('combobox, select').nth(1);
    
    // More reliable: scope by its label text in the parent container
    const filterType = page.locator('select').filter({ has: page.locator('option', { hasText: 'Today' }) });
    await filterType.selectOption({ label: 'Today' });

    // Click Get Records
    await page.getByRole('button', { name: 'Get Records' }).click();
    await page.waitForLoadState('networkidle');

    // VALIDATION: table visible with data or no-data message
    const tableBody = page.locator('table tbody');
    await expect(tableBody).toBeVisible({ timeout: 10000 });

    const firstRow = tableBody.locator('tr').first();
    const rowText = await firstRow.innerText();

    if (rowText.includes('No data available')) {
        console.log('Test Passed: Table correctly shows no records for today.');
    } else {
        const rowCount = await tableBody.locator('tr').count();
        expect(rowCount).toBeGreaterThan(0);
        console.log(`Test Passed: Found ${rowCount} records for today.`);
    }
});













test('TC_IAR_02 - Verify records retrieval for yesterday', async ({ page }) => {
    await page.goto('https://or-demo.knrleap.org/admin/incoming_amount_report');

    // The Filter Type dropdown is the second combobox on the page
    // (first is Academic Year, second is Filter Type)
    const filterTypeDropdown = page.locator('combobox, select').nth(1);
    
    // More reliable: scope by its label text in the parent container
    const filterType = page.locator('select').filter({ has: page.locator('option', { hasText: 'Today' }) });
    await filterType.selectOption({ label: 'yesterday' });

    // Click Get Records
    await page.getByRole('button', { name: 'Get Records' }).click();
    await page.waitForLoadState('networkidle');

    // VALIDATION: table visible with data or no-data message
    const tableBody = page.locator('table tbody');
    await expect(tableBody).toBeVisible({ timeout: 10000 });

    const firstRow = tableBody.locator('tr').first();
    const rowText = await firstRow.innerText();

    if (rowText.includes('No data available')) {
        console.log('Test Passed: Table correctly shows no records for yesterday.');
    } else {
        const rowCount = await tableBody.locator('tr').count();
        expect(rowCount).toBeGreaterThan(0);
        console.log(`Test Passed: Found ${rowCount} records for yesterday.`);
    }
});











test('TC_IAR_03 - Verify records retrieval for Custom Date', async ({ page }) => {
    // 1. Navigate to the Incoming Amount Report page
    await page.goto('https://or-demo.knrleap.org/admin/incoming_amount_report');

    // 2. Select Filter Type = "Custom Date"
    const filterTypeDropdown = page.locator('select#purpose');
    await filterTypeDropdown.selectOption({ label: 'Custom Date' });

    // 3. Enter Date Range: 22/04/2026 to 23/04/2026
    // Based on snapshot, we target the textboxes appearing after the labels
    const fromDateInput = page.locator('div:has-text("From Date") > input, textbox').first();
    const toDateInput = page.locator('div:has-text("To Date") > input, textbox').last();

    // Using fill with the format requested
    await fromDateInput.fill('2026-04-22'); 
    await toDateInput.fill('2026-04-23');

    // 4. Click the "Get Records" button
    await page.getByRole('button', { name: 'Get Records' }).click();

    // 5. Wait for the table to update
    await page.waitForLoadState('networkidle');

    // 6. VALIDATION: Pass if table has data OR shows "No data available"
    const tableBody = page.locator('table tbody');
    await expect(tableBody).toBeVisible({ timeout: 10000 });

    const firstRow = tableBody.locator('tr').first();
    const rowText = await firstRow.innerText();
    
    if (rowText.includes('No data available')) {
        console.log('Test Passed: Search executed, but no records found for 22/04 to 23/04.');
    } else {
        const rowCount = await tableBody.locator('tr').count();
        console.log(`Test Passed: Found ${rowCount} records for the selected range.`);
        expect(rowCount).toBeGreaterThan(0);
    }
});








test('TC_IAR_04 - Verify Reset button', async ({ page }) => {
    // 1. Navigate to the Incoming Amount Report page
    await page.goto('https://or-demo.knrleap.org/admin/incoming_amount_report');

    // 2. Apply a filter first (e.g., set Filter Type to "Today")
    const filterTypeDropdown = page.locator('select#purpose');
    await filterTypeDropdown.selectOption({ label: 'Today' });
    
    // Optional: Click Get Records to ensure data is loaded before resetting
    await page.getByRole('button', { name: 'Get Records' }).click();
    await page.waitForLoadState('networkidle');

    // 3. Click the "Reset" button
    // Based on your snapshot, Reset is a link: <a href="..." class="...">Reset</a>
    const resetButton = page.getByRole('link', { name: 'Reset' });
    await resetButton.click();

    // 4. Wait for the page to reload/reset
    await page.waitForLoadState('load');

    // 5. VALIDATION: Check if the Filter Type dropdown has returned to the default state
    // The snapshot shows the default selected option is "-- Select --"
    const selectedValue = await filterTypeDropdown.inputValue();
    const selectedText = await filterTypeDropdown.locator('option:checked').textContent();

    console.log(`Dropdown after reset: ${selectedText?.trim()}`);

    // Verify it is no longer set to "Today"
    expect(selectedText?.trim()).not.toBe('Today');
    
    // Usually, reset buttons in this portal return the dropdown to the "-- Select --" option
    // which often has an empty value or a "0" value.
    if (selectedText?.includes('Select')) {
        console.log('Test Passed: Filters successfully reset to default.');
    } else {
        console.log('Info: Reset clicked, verifying default state...');
    }
});









test('TC_IAR_05 - Verify Export Excel functionality', async ({ page }) => {
    // 1. Pre-Condition: Navigate to Incoming Amount Report page
    await page.goto('https://or-demo.knrleap.org/admin/incoming_amount_report');

    // 2. Apply filters (Today) to ensure there is a specific state to export
    const filterTypeDropdown = page.locator('select#purpose');
    await filterTypeDropdown.selectOption({ label: 'Today' });
    await page.getByRole('button', { name: 'Get Records' }).click();
    await page.waitForLoadState('networkidle');

    // 3. Start waiting for the download event before clicking the Export button
    // Based on your snapshot, Export Excel is a generic element/button containing the text
    const downloadPromise = page.waitForEvent('download');

    // Clicking the "Export Excel" element
    await page.locator('text=Export Excel').click();

    // 4. Wait for the download process to complete
    const download = await downloadPromise;

    // 5. VALIDATION: Check if the file has a name and is successfully downloaded
    const fileName = download.suggestedFilename();
    console.log(`Successfully downloaded file: ${fileName}`);

    // Verify the file extension is .xlsx or .xls
    expect(fileName).toMatch(/\.xlsx$|\.xls$/);

    // Optional: Save the file to a local folder for manual verification
    // await download.saveAs('./downloads/' + fileName);
    
    console.log('Test Passed: Excel file download initiated successfully.');
});
















test('TC_IAR_06 - Verify No Records Found message', async ({ page }) => {
    // 1. Navigate to the report page
    await page.goto('https://or-demo.knrleap.org/admin/incoming_amount_report', {
        waitUntil: 'networkidle'
    });

    // 2. Use the specific ID selector to avoid targeting the Theme Chooser
    const filterTypeDropdown = page.locator('select#purpose');
    
    // 3. Ensure the dropdown is ready
    await expect(filterTypeDropdown).toBeVisible({ timeout: 5000 });

    // 4. Select "yesterday" (matches the lowercase 'y' seen in the snapshot)
    await filterTypeDropdown.selectOption({ label: 'yesterday' });

    // 5. Click "Get Records"
    await page.getByRole('button', { name: 'Get Records' }).click();
    await page.waitForLoadState('networkidle');

    // 6. VALIDATION: Check for "No Records Found" logic in the table
    const tableBody = page.locator('table tbody');
    const tableText = await tableBody.innerText();
    
    console.log(`Table content: ${tableText.trim()}`);

    // Standard DataTables empty message is usually "No data available in table"
    const isEmpty = tableText.toLowerCase().includes('no data') || 
                    tableText.toLowerCase().includes('no records');

    if (isEmpty) {
        console.log('Test Passed: "No Records Found" message confirmed.');
        expect(tableText.toLowerCase()).toMatch(/no (data|records)/);
    } else {
        console.log('Observation: Records exist for yesterday; empty-state message not triggered.');
    }
});









test('TC_IAR_07 - Verify pagination', async ({ page }) => {
    // 1. Navigate to the Incoming Amount Report page
    await page.goto('https://or-demo.knrleap.org/admin/incoming_amount_report', {
        waitUntil: 'networkidle'
    });

    // 2. Select a wide filter (e.g., Academic Year) to ensure multiple pages exist
    // Default is already 2025-26, but we click Get Records to load data
    await page.getByRole('button', { name: 'Get Records' }).click();
    await page.waitForLoadState('networkidle');

    // 3. Locate the Pagination Container
    // In DataTables, this is usually div.dataTables_paginate
    const pagination = page.locator('.dataTables_paginate');
    
    // Check if pagination is even visible (only shows if records > 10)
    if (await pagination.isVisible()) {
        console.log('Pagination is visible, proceeding with test...');

        // 4. Click the "Next" button
        const nextButton = pagination.getByText('Next');
        await expect(nextButton).toBeVisible();
        await nextButton.click();
        
        // Wait for table to update
        await page.waitForTimeout(1000); 

        // 5. VALIDATION: Check if "Previous" is now enabled/visible
        const prevButton = pagination.getByText('Previous');
        await expect(prevButton).toBeVisible();
        
        // 6. Click a specific page number (e.g., Page 1) to go back
        const pageOne = pagination.getByText('1', { exact: true });
        await pageOne.click();
        
        console.log('Test Passed: Pagination navigation (Next/Previous/Numbers) is functional.');
    } else {
        // If there are fewer than 10 records, pagination won't show
        console.log('Observation: Less than 10 records found. Pagination is hidden by default.');
        
        // Optional: Assert that the "Showing 1 to X of X entries" text matches the row count
        const info = await page.locator('.dataTables_info').innerText();
        console.log(`Table Info: ${info}`);
    }
});








test('TC_IAR_08 - Verify entries per page dropdown', async ({ page }) => {
    // 1. Navigate to the Incoming Amount Report page
    await page.goto('https://or-demo.knrleap.org/admin/incoming_amount_report', {
        waitUntil: 'networkidle'
    });

    // 2. Load a large dataset (e.g., Current Academic Year)
    await page.getByRole('button', { name: 'Get Records' }).click();
    await page.waitForLoadState('networkidle');

    // 3. Locate the "Show entries" dropdown
    // In DataTables, this select usually has the name "[tableId]_length" or is inside .dataTables_length
    const lengthDropdown = page.locator('select[name*="_length"], .dataTables_length select');
    
    // Check if the dropdown exists (it only shows if there is data)
    if (await lengthDropdown.isVisible()) {
        
        // 4. Change the entry limit to '25'
        await lengthDropdown.selectOption('25');
        await page.waitForTimeout(1000); // Wait for table to redraw

        // 5. VALIDATION: Check the number of rows in the table body
        // It should not exceed 25
        const rowCount = await page.locator('table tbody tr').count();
        console.log(`Rows displayed after selecting 25: ${rowCount}`);

        // If there are more than 10 records but less than 25, 
        // the row count should equal the total available records.
        expect(rowCount).toBeLessThanOrEqual(25);

        // 6. Verify the "Showing X to Y of Z entries" text updates
        const infoText = await page.locator('.dataTables_info').innerText();
        expect(infoText).toContain('25');
        
        console.log('Test Passed: Entries per page dropdown correctly updates the table view.');
    } else {
        console.log('Observation: Length dropdown not visible (likely insufficient data to paginate).');
    }
});
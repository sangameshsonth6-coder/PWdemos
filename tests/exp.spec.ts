import { test, expect } from '@playwright/test';


import path from 'path';

// test('TC_EXP_06: Verify loading of Roles List and Assignment as Admin', async ({ page, browserName }) => {
//   const adminSession = path.resolve(`storageState.admin.${browserName}.json`);
//   const rolesUrl = 'https://or-demo.knrleap.org/admin/roles_list';

//   // 1. Navigate directly to the Roles List URL
//   await page.goto(rolesUrl);
//   await page.waitForLoadState('networkidle');

//   // 2. Handle Login if redirected
//   if (page.url().includes('/login')) {
//     await page.locator('input[name="username"], input[type="text"]').first().fill('admin_user');
//     await page.locator('input[name="password"]').fill('KNRADMIN@2026');
//     await page.getByRole('button', { name: /login|submit/i }).click();
    
//     // Ensure we are redirected back to the roles list after login
//     await page.waitForURL('**/admin/roles_list');
//   }

//   // 3. Verify page header or specific text to confirm successful load
//   // Use a regex to handle potential formatting/whitespace differences
//   const pageHeader = page.getByRole('heading', { name: /Roles List/i });
//   await expect(pageHeader).toBeVisible();

//   // 4. Verify tabular format
//   // It's a best practice to wait for the table to have at least one row of data
//   const rolesTable = page.locator('table');
//   await expect(rolesTable).toBeVisible();
//   await expect(rolesTable).toContainText('Role Name');

//   // 5. Save session state for subsequent tests
//   await page.context().storageState({ path: adminSession });
  
//   console.log('TC_EXP_06: Roles List and Assignment page verified successfully.');
// });







// test('TC_EXP_07: Verify loading of Expense List', async ({ page }) => {
//   const expenseUrl = 'https://or-demo.knrleap.org/admin/expense_management_system';

//   await page.goto(expenseUrl);
//   await page.waitForLoadState('networkidle');

//   // 1. Handle Login if session is not active
//   if (page.url().includes('/login')) {
//     await page.locator('input[name="username"]').fill('admin_user');
//     await page.locator('input[name="password"]').fill('KNRADMIN@2026');
//     await page.getByRole('button', { name: /login/i }).click();
//     await page.waitForURL('**/admin/expense_management_system');
//   }

//   // 2. Navigation: Click "Expense List" to reveal the table and "Add New" link
//   const expenseListTrigger = page.getByRole('button', { name: 'Expense List' });
//   await expenseListTrigger.click();

//   // 3. FIX: Change role from 'button' to 'link' to match the HTML <a> tag
//   const addNewBtn = page.getByRole('link', { name: /Add New/i });
//   await expect(addNewBtn).toBeVisible({ timeout: 10000 });

//   // 4. Verify the Table and its required columns
//   const expenseTable = page.locator('table');
//   await expect(expenseTable).toBeVisible();

//   const expectedHeaders = [
//     'Sl No.', 
//     'Academic Year', 
//     'Expense Category Name', 
//     'Status', 
//     'Action'
//   ];

//   for (const header of expectedHeaders) {
//     await expect(expenseTable).toContainText(header);
//   }

//   console.log('TC_EXP_07: Expense List verified successfully.');
// });






// // --- TEST 06: ROLES LIST ---
// test('TC_EXP_06: Verify loading of Roles List and Assignment as Admin', async ({ page, browserName }) => {
//   const adminSession = path.resolve(`storageState.admin.${browserName}.json`);
//   const rolesUrl = 'https://or-demo.knrleap.org/admin/roles_list';

//   await page.goto(rolesUrl);
//   await page.waitForLoadState('networkidle');

//   if (page.url().includes('/login')) {
//     await page.locator('input[name="username"], input[type="text"]').first().fill('admin_user');
//     await page.locator('input[name="password"]').fill('KNRADMIN@2026');
//     await page.getByRole('button', { name: /login|submit/i }).click();
//     await page.waitForURL('**/admin/roles_list');
//   }

//   const pageHeader = page.getByRole('heading', { name: /Roles List/i });
//   await expect(pageHeader).toBeVisible();

//   const rolesTable = page.locator('table');
//   await expect(rolesTable).toBeVisible();
//   await expect(rolesTable).toContainText('Role Name');

//   await page.context().storageState({ path: adminSession });
// });

// // --- TEST 07: EXPENSE LIST ---
// test('TC_EXP_07: Verify loading of Expense List', async ({ page }) => {
//   const expenseUrl = 'https://or-demo.knrleap.org/admin/expense_management_system';

//   await page.goto(expenseUrl);
//   await page.waitForLoadState('networkidle');

//   if (page.url().includes('/login')) {
//     await page.locator('input[name="username"]').fill('admin_user');
//     await page.locator('input[name="password"]').fill('KNRADMIN@2026');
//     await page.getByRole('button', { name: /login/i }).click();
//     await page.waitForURL('**/admin/expense_management_system');
//   }

//   // Reveal the list
//   await page.getByRole('button', { name: 'Expense List' }).click();

//   // FIX: Using 'link' role for Add New anchor tag
//   const addNewBtn = page.getByRole('link', { name: /Add New/i });
//   await expect(addNewBtn).toBeVisible({ timeout: 10000 });

//   const expenseTable = page.locator('table');
//   await expect(expenseTable).toBeVisible();
  
//   const expectedHeaders = ['Sl No.', 'Academic Year', 'Expense Category Name', 'Status', 'Action'];
//   for (const header of expectedHeaders) {
//     await expect(expenseTable).toContainText(header);
//   }
// });

// // --- TEST 08: APPROVAL FLOW ---
// test('TC_EXP_08: Verify loading of Approval Flow', async ({ page }) => {
//   const expenseUrl = 'https://or-demo.knrleap.org/admin/expense_management_system';

//   await page.goto(expenseUrl);
//   await page.waitForLoadState('networkidle');

//   if (page.url().includes('/login')) {
//     await page.locator('input[name="username"]').fill('admin_user');
//     await page.locator('input[name="password"]').fill('KNRADMIN@2026');
//     await page.getByRole('button', { name: /login/i }).click();
//     await page.waitForURL('**/admin/expense_management_system');
//   }

//   // Click trigger
//   const approvalFlowTrigger = page.getByRole('button', { name: 'Approval Flow' });
//   await approvalFlowTrigger.click();

//   // FIX: Using actual heading text "Flow Details" found in the snapshot
//   const heading = page.getByRole('heading', { name: /Flow Details/i });
//   await expect(heading).toBeVisible({ timeout: 10000 });

//   const flowTable = page.locator('table');
//   await expect(flowTable).toBeVisible();

//   // Correct headers for the Flow Details view
//   const expectedHeaders = ['Sl No.', 'Expense Category', 'Amount', 'Status', 'Action'];
//   for (const header of expectedHeaders) {
//     await expect(flowTable).toContainText(header);
//   }
// });





// test('TC_EXP_08: Verify loading of Approval Flow', async ({ page }) => {
//   const expenseUrl = 'https://or-demo.knrleap.org/admin/expense_management_system';

//   await page.goto(expenseUrl);
//   await page.waitForLoadState('networkidle');

//   if (page.url().includes('/login')) {
//     await page.locator('input[name="username"]').fill('admin_user');
//     await page.locator('input[name="password"]').fill('KNRADMIN@2026');
//     await page.getByRole('button', { name: /login/i }).click();
//     await page.waitForURL('**/admin/expense_management_system');
//   }

//   // Click the trigger button
//   const approvalFlowTrigger = page.getByRole('button', { name: 'Approval Flow' });
//   await expect(approvalFlowTrigger).toBeVisible();
//   await approvalFlowTrigger.click();

//   // Verify the section heading
//   const heading = page.getByRole('heading', { name: /Flow Details/i });
//   await expect(heading).toBeVisible({ timeout: 10000 });

//   // Use the specific ID '#Applications' to select the correct table
//   const flowTable = page.locator('#Applications');
//   await expect(flowTable).toBeVisible();

//   // Verify expected column headers
//   const expectedHeaders = ['Sl No.', 'Expense Category', 'Amount', 'Status', 'Action'];
//   for (const header of expectedHeaders) {
//     await expect(flowTable).toContainText(header);
//   }

//   console.log('TC_EXP_08: Flow Details section verified successfully.');
// });




test('TC_EXP_09: Verify loading of Incoming Details', async ({ page }) => {
  const expenseUrl = 'https://or-demo.knrleap.org/admin/expense_management_system';

  // 1. Navigate to the dashboard
  await page.goto(expenseUrl);
  await page.waitForLoadState('networkidle');

  // 2. Handle Login if needed
  if (page.url().includes('/login')) {
    await page.locator('input[name="username"]').fill('admin_user');
    await page.locator('input[name="password"]').fill('KNRADMIN@2026');
    await page.getByRole('button', { name: /login/i }).click();
    await page.waitForURL('**/admin/expense_management_system');
  }

  // 3. Navigation: Click the "Incoming Details" button
  const incomingTrigger = page.getByRole('button', { name: 'Incoming Details' });
  await expect(incomingTrigger).toBeVisible();
  await incomingTrigger.click();

  // 4. Verify section heading
  // Based on LEAP naming conventions, this usually displays "Incoming Details"
  const heading = page.getByRole('heading', { name: /Incoming Details/i });
  await expect(heading).toBeVisible({ timeout: 10000 });

  // 5. Verify the data table
  // Using the ID '#Applications' which we discovered is common for these grids
  const incomingTable = page.locator('#Applications');
  await expect(incomingTable).toBeVisible();

  // 6. Verify common headers for Incoming Details
  const expectedHeaders = [
    'Sl No.', 
    'Academic Year', 
    'Date', 
    'Amount', 
    'Action'
  ];

  for (const header of expectedHeaders) {
    await expect(incomingTable).toContainText(header);
  }

  console.log('TC_EXP_09: Incoming Details section verified successfully.');
});
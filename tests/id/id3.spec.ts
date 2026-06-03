import { test, expect } from '@playwright/test';

test.use({
  storageState: 'storageState.chromium.json',
});

const ID_CARD_URL = 'https://leap.knr.npsypr.edu.in/admin/generate_id_card';

async function openSavedTemplatesTab(page: any) {
  await page.goto(ID_CARD_URL, {
    waitUntil: 'domcontentloaded',
    timeout: 60000,
  });

  await expect(page).toHaveURL(/generate_id_card/);

  const savedTab = page.locator('#templates-tab');
  await savedTab.click();

  await expect(page.locator('#templates')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#templatesList')).toBeVisible({ timeout: 15000 });

  await page.waitForTimeout(3000);
}

async function firstTemplateCard(page: any) {
  const card = page.locator('#templatesList .tmpl-card').first();

  await expect(card).toBeVisible({ timeout: 20000 });

  return card;
}

test.beforeEach(async ({ page }) => {
  await openSavedTemplatesTab(page);
});

test('TC_001 - Verify Saved Templates page loads successfully', async ({ page }) => {
  await expect(page.locator('#templates')).toBeVisible();
  await expect(page.getByRole('heading', { name: /Saved Templates/i })).toBeVisible();
  await expect(page.locator('#templatesList')).toBeVisible();

  console.log('✅ TC_001 Passed');
});

test('TC_002 - Verify saved templates are displayed correctly', async ({ page }) => {
  const card = await firstTemplateCard(page);

  await expect(card).toBeVisible();

  const text = await card.innerText();

  expect(text.length).toBeGreaterThan(0);
  expect(text).toMatch(/student|employee/i);
  expect(text).toMatch(/\d{4}-\d{2}/);

  console.log('✅ TC_002 Passed');
});

test('TC_003 - Verify template card UI elements', async ({ page }) => {
  const card = await firstTemplateCard(page);

  await expect(card.getByRole('button', { name: /Edit/i })).toBeVisible();

  await expect(
    card.locator('button').filter({ hasText: /|eye|preview/i }).first()
  ).toBeVisible();

  await expect(
    card.locator('button').filter({ hasText: /|delete/i }).first()
  ).toBeVisible();

  console.log('✅ TC_003 Passed');
});

test('TC_004 - Verify Student badge is displayed for student templates', async ({ page }) => {
  const studentCard = page
    .locator('#templatesList .tmpl-card')
    .filter({ hasText: /student/i })
    .first();

  await expect(studentCard).toBeVisible({ timeout: 20000 });
  await expect(studentCard.getByText(/student/i).first()).toBeVisible();

  console.log('✅ TC_004 Passed');
});

test('TC_005 - Verify Employee badge is displayed for employee templates', async ({ page }) => {
  const employeeCard = page
    .locator('#templatesList .tmpl-card')
    .filter({ hasText: /employee/i })
    .first();

  if (!(await employeeCard.isVisible().catch(() => false))) {
    console.log('⚠️ No employee template available');
    return;
  }

  await expect(employeeCard.getByText(/employee/i).first()).toBeVisible();

  console.log('✅ TC_005 Passed');
});

test('TC_006 - Verify Edit button is visible for each template', async ({ page }) => {
  const cards = page.locator('#templatesList .tmpl-card');
  const count = await cards.count();

  expect(count).toBeGreaterThan(0);

  for (let i = 0; i < Math.min(count, 5); i++) {
    await expect(
      cards.nth(i).getByRole('button', { name: /Edit/i })
    ).toBeVisible();
  }

  console.log('✅ TC_006 Passed');
});

test('TC_007 - Verify Edit button redirects to edit template page', async ({ page }) => {
  const card = await firstTemplateCard(page);

  await card.getByRole('button', { name: /Edit/i }).click();

  await expect(page.locator('#design')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('#template_name')).toBeVisible({ timeout: 15000 });

  console.log('✅ TC_007 Passed');
});

test('TC_008 - Verify user can edit existing template details', async ({ page }) => {
  const card = await firstTemplateCard(page);

  await card.getByRole('button', { name: /Edit/i }).click();

  await expect(page.locator('#template_name')).toBeVisible({ timeout: 15000 });

  const editedName = `Edited_Template_${Date.now()}`;

  await page.locator('#template_name').fill(editedName);
  await expect(page.locator('#template_name')).toHaveValue(editedName);

  console.log('✅ TC_008 Passed');
});
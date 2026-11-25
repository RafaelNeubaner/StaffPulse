import { expect, test } from '@playwright/test';

test('loads the Dashboard and navigates to employee management', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle('StaffPulse | Dashboard');
  await expect(page.locator('#active-employees')).toHaveText('0');
  await expect(page.locator('#total-employees')).toHaveText('0');

  await page.getByRole('link', { name: 'Colaboradores' }).click();

  await expect(page).toHaveURL(/#employees$/);
  await expect(page.locator('#employees-title')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Novo colaborador' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Colaboradores cadastrados' })).toBeVisible();
});

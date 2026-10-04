import { test, expect } from '@playwright/test';

test('loading a lab closes both dialogs and restores focus outside settings', async ({ page }) => {
  await page.goto('/');
  const settingsTrigger = page.getByRole('button', { name: 'Otworz ustawienia' });
  await settingsTrigger.click();
  await page.getByRole('button', { name: 'Wybierz lab', exact: true }).click();
  const lab = page.locator('.labDialog');
  await expect(lab).toBeFocused();
  await page.locator('.labDialogFooter button').click();
  await expect(page.locator('#settings-overlay')).toHaveCount(0);
  await expect(lab).toHaveCount(0);
  await expect(settingsTrigger).toBeFocused();
});

import { test, expect } from '@playwright/test';

test('command catalog receives focus and restores it outside closing settings on Escape', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Otworz ustawienia' }).click();
  await page.getByRole('tab', { name: 'Angielski', exact: true }).click();
  const settings = page.getByRole('dialog', { name: 'Settings', exact: true });
  const trigger = settings.getByRole('button', { name: 'Command list', exact: true });
  await trigger.click();
  const dialog = page.locator('#commandList');
  await expect(dialog).toBeFocused();
  await dialog.locator('.commandInput').focus();
  await expect(dialog.locator('.commandInput')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(settings).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Open settings', exact: true })).toBeFocused();
});

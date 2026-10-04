import { test, expect } from '@playwright/test';

const openSettings = async (page: import('@playwright/test').Page) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Otworz ustawienia' }).click();
  await page.getByRole('tab', { name: 'Angielski', exact: true }).click();
  return page.getByRole('dialog', { name: 'Settings', exact: true });
};

test('color dialog contains focus and Escape closes only the nested dialog', async ({ page }) => {
  test.skip(process.env.E2E_APP_PLATFORM !== 'esp', 'LED controls are available in the ESP build.');
  const settings = await openSettings(page);
  const trigger = settings.getByRole('button', { name: 'Signal lines', exact: true });
  await trigger.click();
  const picker = page.getByRole('dialog', { name: 'Signal line color', exact: true });
  await expect(picker).toBeFocused();
  const first = picker.getByRole('button', { name: 'Close settings', exact: true });
  const last = picker.getByRole('button', { name: 'Apply', exact: true });
  await first.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(last).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(first).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(picker).toHaveCount(0);
  await expect(settings).toBeVisible();
  await expect(trigger).toBeFocused();
  expect(await page.evaluate(() => document.body.style.overflow)).toBe('hidden');
  await page.keyboard.press('Escape');
  await expect(settings).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});

test('reopening a saved LED color preserves its base color and brightness', async ({ page }) => {
  test.skip(process.env.E2E_APP_PLATFORM !== 'esp', 'LED controls are available in the ESP build.');
  const settings = await openSettings(page);
  const trigger = settings.getByRole('button', { name: 'Signal lines', exact: true });
  await trigger.click();
  const picker = page.getByRole('dialog', { name: 'Signal line color', exact: true });
  await picker.getByRole('button', { name: '#ff0000', exact: true }).click();
  await picker.locator('.cp-range').nth(1).fill('0.5');
  const selectedColor = await picker.locator('.cp-readout .cp-line').first().innerText();
  await picker.getByRole('button', { name: 'Apply', exact: true }).click();
  await trigger.click();
  await expect(picker.locator('.cp-range').nth(1)).toHaveValue('0.5');
  await expect(picker.locator('.cp-readout .cp-line').first()).toHaveText(selectedColor);
});

test('settings group expansion is independent of the module switch', async ({ page }) => {
  test.skip(process.env.E2E_APP_PLATFORM === 'esp', 'Optional modules are only available in the simulator build.');
  const settings = await openSettings(page);
  const expand = settings.getByRole('button', { name: 'Interrupts', exact: true });
  const toggle = settings.getByRole('checkbox', { name: 'Interrupts', exact: true });
  await expect(expand).toHaveAttribute('aria-expanded', 'false');
  await toggle.locator('..').click();
  await expect(toggle).toBeChecked();
  await expect(expand).toHaveAttribute('aria-expanded', 'false');
  await expand.focus();
  await page.keyboard.press('Enter');
  await expect(expand).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toBeChecked();
});

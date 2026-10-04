import { expect, test } from '@playwright/test';

test('nested subroutine calls return to STOP and preserve the accumulator', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Program', exact: true }).click();
  await page.locator('#program .cm-content').fill('POB value\nSDP outer\nSTP\nouter: SDP inner\nPWR\ninner: PWR\nvalue: RST 7');

  await page.locator('#program .execution-btn--compile').click();
  await page.getByRole('button', { name: 'Uruchom (bez animacji)', exact: true }).first().click();

  await expect(page.getByRole('spinbutton', { name: 'Akumulator', exact: true })).toHaveValue('7');
  await expect(page.getByRole('spinbutton', { name: 'Licznik', exact: true })).toHaveValue('3');
  await expect(page.getByRole('button', { name: 'Uruchom (bez animacji)', exact: true }).first()).toBeDisabled();
});

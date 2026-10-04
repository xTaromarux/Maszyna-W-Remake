import { test, expect } from '@playwright/test';

test('global breakpoint disable reaches the compiled program view', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Program', exact: true }).click();
  await page.locator('#inputs .cm-content').fill('il;\nil;\nstop;');
  await page.getByRole('button', { name: 'Kompiluj (DEBUG)', exact: true }).click();
  await page.getByRole('button', { name: 'Otworz konsole' }).first().click();
  await page.locator('.console-dock').getByRole('button', { name: 'Wylacz breakpointy (wygaszenie)', exact: true }).click();
  await expect(page.locator('.compiledCode')).toHaveClass(/bp-disabled/);
  await expect(page.locator('.compiledCode .bp-dot').first()).toBeDisabled();
});

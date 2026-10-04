import { expect, test } from '@playwright/test';

test('register format options support keyboard selection and restore focus', async ({ page }) => {
  await page.goto('/');

  const register = page.locator('#accumulator');
  const opener = register.locator('.format-button');
  await opener.click();

  const hexadecimal = register.getByRole('button', { name: 'HEX', exact: true });
  await hexadecimal.focus();
  await page.keyboard.press('Escape');
  await expect(register.locator('.format-menu')).toHaveCount(0);
  await expect(opener).toBeFocused();

  await page.keyboard.press('Enter');
  await register.getByRole('button', { name: 'HEX', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(opener).toBeFocused();
  await expect(register.locator('.format-menu')).toHaveCount(0);
  await expect(register.locator('input')).toHaveAttribute('type', 'text');

  await register.locator('input').fill('f');
  await expect(register.locator('input')).toHaveValue('F');
  await expect(register.locator('.inputWrapper > span')).toHaveText('0xF');

  await register.locator('input').fill('xyz');
  await expect(register.locator('input')).toHaveValue('F');
  await register.locator('input').fill('');
  await opener.focus();
  await expect(register.locator('input')).toHaveValue('0');
});

test('interrupt buttons stay synchronized with direct RZ edits and toggles', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Otworz ustawienia' }).click();
  await page.getByRole('tab', { name: 'Angielski', exact: true }).click();

  const interrupts = page.getByRole('checkbox', { name: 'Interrupts', exact: true });
  if (!(await interrupts.isChecked())) {
    await interrupts.locator('..').click();
  }
  await page.getByRole('button', { name: 'Close settings', exact: true }).click();

  const register = page.locator('#rzRegister');
  const input = register.locator('input');
  const bitButtons = register.locator('.rz-inputs button');

  await input.fill('5');
  for (const [index, pressed] of ['true', 'false', 'true', 'false'].entries()) {
    await expect(bitButtons.nth(index)).toHaveAttribute('aria-pressed', pressed);
  }

  await bitButtons.nth(1).click();
  await expect(input).toHaveValue('7');
  await input.fill('0');
  await expect(register.locator('.rz-inputs button[aria-pressed="true"]')).toHaveCount(0);
});

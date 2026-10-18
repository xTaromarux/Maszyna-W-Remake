import { expect, test } from '@playwright/test';
import { openEnglishSettings } from './Support/SettingsActions';

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
  await expect(register.locator('input')).toHaveValue('f');
  await expect(register.locator('.inputWrapper > span')).toHaveText('0x0');
  await register.locator('input').press('Enter');
  await expect(register.locator('input')).toHaveValue('F');
  await expect(register.locator('.inputWrapper > span')).toHaveText('0xF');

  await register.locator('input').fill('xyz');
  await expect(register.locator('input')).toHaveValue('xyz');
  await register.locator('input').press('Enter');
  await expect(register.locator('input')).toHaveValue('F');
  await register.locator('input').fill('');
  await opener.focus();
  await expect(register.locator('input')).toHaveValue('0');
});

test('interrupt buttons stay synchronized with direct RZ edits and toggles', async ({ page }) => {
  await page.goto('/');
  await openEnglishSettings(page);

  const interrupts = page.getByRole('checkbox', { name: 'Interrupts', exact: true });
  if (!(await interrupts.isChecked())) {
    await interrupts.locator('..').click();
  }
  await page.getByRole('button', { name: 'Close settings', exact: true }).click();

  const register = page.locator('#rzRegister');
  const input = register.locator('input');
  const bitButtons = register.locator('.rz-inputs button');

  await input.fill('5');
  await input.press('Enter');
  for (const [index, pressed] of ['true', 'false', 'true', 'false'].entries()) {
    await expect(bitButtons.nth(index)).toHaveAttribute('aria-pressed', pressed);
  }

  await bitButtons.nth(1).click();
  await expect(input).toHaveValue('7');
  await input.fill('0');
  await input.press('Enter');
  await expect(register.locator('.rz-inputs button[aria-pressed="true"]')).toHaveCount(0);
});

test('QA21: typing -12 commits once on Enter and preserves the ten-bit U2 word', async ({ page }) => {
  await page.goto('/');
  const settings = await openEnglishSettings(page);
  await settings.getByRole('tab', { name: "Two's complement (signed)", exact: true }).click();
  await settings.getByRole('button', { name: 'Close settings', exact: true }).click();
  const register = page.locator('#accumulator');
  const input = register.locator('input');
  const display = register.locator('.inputWrapper > span');
  await input.fill('');
  for (const character of ['-', '1', '2']) {
    await input.pressSequentially(character);
    await expect(display).toHaveText('0');
  }
  await expect(input).toHaveValue('-12');
  await input.press('Enter');
  await expect(input).toHaveValue('-12');
  await expect(display).toHaveText('-12');
  await expect(input).toHaveAttribute('title', /Enter.*Escape/);

  await register.locator('.format-button').click();
  await register.getByRole('button', { name: 'BIN', exact: true }).click();
  await expect(input).toHaveValue('1111110100');
  await expect(display).toHaveText('0b1111110100');
});

test('QA21: leaving a register commits its complete draft before executing a tick', async ({ page }) => {
  await page.goto('/');
  const register = page.locator('#accumulator');
  const input = register.locator('input');
  await input.fill('10');
  await expect(register.locator('.inputWrapper > span')).toHaveText('0');
  for (const signal of ['wyak', 'weja', 'dod', 'weak']) await page.locator(`#${signal}`).click();
  await expect(register.locator('.inputWrapper > span')).toHaveText('10');
  await page.getByRole('button', { name: 'Wykonaj takt', exact: true }).click();
  await expect(input).toHaveValue('20');
});

test('QA21: Escape cancels a register draft and blur does not commit it later', async ({ page }) => {
  await page.goto('/');
  const register = page.locator('#accumulator');
  const input = register.locator('input');
  await input.fill('7');
  await input.press('Enter');
  await input.fill('99');
  await expect(register.locator('.inputWrapper > span')).toHaveText('7');
  await input.press('Escape');
  await expect(input).toHaveValue('7');
  await page.locator('#counter input').focus();
  await expect(register.locator('.inputWrapper > span')).toHaveText('7');
});

test('QA21: an incomplete minus is discarded on blur while an empty edit commits zero', async ({ page }) => {
  await page.goto('/');
  const input = page.locator('#accumulator input');
  await input.fill('7');
  await input.press('Enter');
  await input.fill('');
  await input.pressSequentially('-');
  await page.locator('#counter input').focus();
  await expect(input).toHaveValue('7');
  await input.fill('');
  await page.locator('#counter input').focus();
  await expect(input).toHaveValue('0');
});

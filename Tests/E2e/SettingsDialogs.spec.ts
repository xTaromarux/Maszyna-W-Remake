import { test, expect } from '@playwright/test';
import { openEnglishSettings } from './Support/SettingsActions';

test('color dialog contains focus and Escape closes only the nested dialog', async ({ page }) => {
  test.skip(process.env.E2E_APP_PLATFORM !== 'esp', 'LED controls are available in the ESP build.');
  await page.goto('/');
  const settings = await openEnglishSettings(page);
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
  await page.goto('/');
  const settings = await openEnglishSettings(page);
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
  await page.goto('/');
  const settings = await openEnglishSettings(page);
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
test('continuous eni is independent of signal visibility and persists after reload', async ({ page }) => {
  test.skip(process.env.E2E_APP_PLATFORM === 'esp', 'Optional modules are only available in the simulator build.');
  await page.goto('/');
  const settings = await openEnglishSettings(page);
  await settings.getByRole('button', { name: 'Interrupts', exact: true }).click();
  const alwaysEni = settings.getByRole('checkbox', { name: 'Always enable eni', exact: true });
  await expect(alwaysEni).not.toBeChecked();
  await settings.getByRole('checkbox', { name: 'Interrupts', exact: true }).locator('..').click();
  await expect(alwaysEni).not.toBeChecked();
  await alwaysEni.locator('..').click();
  await settings.getByRole('checkbox', { name: 'eni signal', exact: true }).locator('..').click();
  await settings.getByRole('button', { name: 'Close settings', exact: true }).click();

  await page.reload();
  await expect(page.locator('#eni')).toHaveCount(0);
  await page.locator('#rzRegister input').fill('1');
  await page.getByRole('button', { name: 'Execute step', exact: true }).click();
  await expect(page.locator('#rpRegister input')).toHaveValue('1');
  await expect(page.locator('#apRegister input')).toHaveValue('1');
  await expect(page.locator('#rzRegister input')).toHaveValue('1');

  await page.getByRole('button', { name: 'Open settings', exact: true }).click();
  await settings.getByRole('button', { name: 'Interrupts', exact: true }).click();
  await expect(alwaysEni).toBeChecked();
  await alwaysEni.locator('..').click();
  await settings.getByRole('button', { name: 'Close settings', exact: true }).click();
  await page.locator('#rpRegister input').fill('0');
  await page.locator('#apRegister input').fill('0');
  await page.getByRole('button', { name: 'Execute step', exact: true }).click();
  await expect(page.locator('#rpRegister input')).toHaveValue('0');
  await expect(page.locator('#rzRegister input')).toHaveValue('1');
});

test('supervisor titles follow language changes while settings stay open', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Otworz ustawienia' }).click();
  const polishSettings = page.getByRole('dialog', { name: 'Ustawienia', exact: true });
  await expect(polishSettings.getByText(/Dr .*Robert Tutajewicz/)).toBeVisible();

  await polishSettings.getByRole('tab', { name: 'Angielski', exact: true }).click();
  const englishSettings = page.getByRole('dialog', { name: 'Settings', exact: true });
  await expect(englishSettings.getByText('PhD Eng. Robert Tutajewicz', { exact: true })).toBeVisible();

  await englishSettings.getByRole('tab', { name: 'Polish', exact: true }).click();
  await expect(polishSettings.getByText(/Dr .*Robert Tutajewicz/)).toBeVisible();
});

test('QA14: configured IRQ addresses persist and eni accepts IRQ3 without jumping or changing the stack', async ({ page }) => {
  test.skip(process.env.E2E_APP_PLATFORM === 'esp', 'Optional modules are only available in the simulator build.');
  await page.goto('/');
  const settings = await openEnglishSettings(page);
  await settings.getByRole('button', { name: 'Interrupts', exact: true }).click();
  await settings.getByRole('checkbox', { name: 'Interrupts', exact: true }).locator('..').click();
  await settings.getByRole('checkbox', { name: 'Stack handling', exact: true }).locator('..').click();
  await settings.getByRole('spinbutton', { name: 'IRQ3 handler address', exact: true }).fill('12');
  await settings.getByRole('button', { name: 'Close settings', exact: true }).click();

  await page.reload();
  await page.getByRole('button', { name: 'Open settings', exact: true }).click();
  await settings.getByRole('button', { name: 'Interrupts', exact: true }).click();
  await expect(settings.getByRole('spinbutton', { name: 'IRQ3 handler address', exact: true })).toHaveValue('12');
  await settings.getByRole('button', { name: 'Close settings', exact: true }).click();

  await page.locator('#counter input').fill('5');
  await page.locator('#wsRegister input').fill('9');
  await page.locator('#rzRegister input').fill('4');
  await page.locator('#eni').click();
  await page.getByRole('button', { name: 'Execute step', exact: true }).click();
  await expect(page.locator('#rpRegister input')).toHaveValue('4');
  await expect(page.locator('#apRegister input')).toHaveValue('12');
  await expect(page.locator('#rzRegister input')).toHaveValue('4');
  await expect(page.locator('#counter input')).toHaveValue('5');
  await expect(page.locator('#wsRegister input')).toHaveValue('9');

  await page.locator('#rint').click();
  await page.getByRole('button', { name: 'Execute step', exact: true }).click();
  await expect(page.locator('#rpRegister input')).toHaveValue('0');
  await expect(page.locator('#apRegister input')).toHaveValue('0');
  await expect(page.locator('#rzRegister input')).toHaveValue('0');
  await expect(page.locator('#counter input')).toHaveValue('5');
  await expect(page.locator('#wsRegister input')).toHaveValue('9');
});

test('QA14: IRQ addresses respect memory width, reject invalid input and restore defaults', async ({ page }) => {
  test.skip(process.env.E2E_APP_PLATFORM === 'esp', 'Optional modules are only available in the simulator build.');
  await page.goto('/');
  const settings = await openEnglishSettings(page);
  await settings.getByRole('button', { name: 'Interrupts', exact: true }).click();
  for (const [index, address] of ['0', '5', '12', '15'].entries()) {
    await settings.locator(`#irq${index + 1}Address`).fill(address);
  }
  const interrupts = settings.getByRole('checkbox', { name: 'Interrupts', exact: true });
  await interrupts.locator('..').click();
  await interrupts.locator('..').click();
  await expect(settings.locator('#irq3Address')).toHaveValue('12');

  await settings.locator('#addresBits').fill('2');
  for (const [index, address] of ['0', '1', '0', '3'].entries()) {
    await expect(settings.locator(`#irq${index + 1}Address`)).toHaveValue(address);
  }
  const address = settings.locator('#irq2Address');
  await expect(address).toHaveAttribute('max', '3');
  for (const invalid of ['4', '-1', '1.5', '']) {
    await address.fill(invalid);
    await expect(address).toHaveValue('1');
  }
  await settings.locator('#defaultSettings').click();
  for (const [index, address] of ['1', '2', '3', '4'].entries()) {
    await expect(settings.locator(`#irq${index + 1}Address`)).toHaveValue(address);
  }
});

test('QA26: numeric settings parse the entire number and reject fractional values', async ({ page }) => {
  await page.goto('/');
  await openEnglishSettings(page);
  for (const [id, exponent, expected, fraction] of [
    ['commandBits', '1e1', '10', '3.9'],
    ['addresBits', '1e1', '10', '3.9'],
    ['oddDelay', '1e2', '100', '3.9'],
    ['stepDelay', '1e2', '100', '5.9'],
  ]) {
    const input = page.locator(`#${id}`);
    await input.fill(exponent);
    await expect(input).toHaveValue(expected);
    await input.fill(fraction);
    await expect(input).toHaveValue(expected);
  }
});

test('QA26: numeric settings retain integer bounds and do not turn empty input into zero', async ({ page }) => {
  await page.goto('/');
  await openEnglishSettings(page);
  const code = page.locator('#commandBits');
  const address = page.locator('#addresBits');
  await code.fill('16');
  await expect(code).toHaveValue('16');
  for (const invalid of ['0', '17', '1e309']) {
    await code.fill(invalid);
    await expect(code).toHaveValue('16');
  }
  await address.fill('14');
  await expect(address).toHaveValue('14');
  await address.fill('15');
  await expect(address).toHaveValue('14');
  await code.fill('1');
  await expect(code).toHaveValue('1');

  const microDelay = page.locator('#oddDelay');
  await microDelay.fill('100');
  await microDelay.fill('');
  await expect(microDelay).toHaveValue('100');
  await microDelay.fill('0');
  await expect(microDelay).toHaveValue('0');
  await microDelay.fill('-1');
  await expect(microDelay).toHaveValue('0');

  const stepDelay = page.locator('#stepDelay');
  await stepDelay.fill('5');
  await expect(stepDelay).toHaveValue('5');
  await stepDelay.fill('4');
  await expect(stepDelay).toHaveValue('5');
});

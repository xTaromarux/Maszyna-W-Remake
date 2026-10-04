import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('tab', { name: 'Tryb ręczny', exact: true })).toBeVisible();
});

test('manual signal executes one tick and register format is editable', async ({ page }) => {
  await page.locator('#il').click();
  await page.getByRole('button', { name: 'Wykonaj takt', exact: true }).click();
  await expect(page.getByRole('spinbutton', { name: 'Licznik', exact: true })).toHaveValue('1');
  await page.getByRole('spinbutton', { name: 'Akumulator', exact: true }).fill('42');
  await expect(page.getByRole('spinbutton', { name: 'Akumulator', exact: true })).toHaveValue('42');
  expect(await page.locator('#W input').count()).toBe(21);
});

test('assembler compiles and runs DOD 0 with the original result', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.getByRole('tab', { name: 'Program', exact: true }).click();
  await expect(page.locator('.cm-content')).toHaveCount(2);
  await page.getByRole('button', { name: 'Kompiluj', exact: true }).click();
  await page.getByRole('button', { name: 'Uruchom (bez animacji)', exact: true }).first().click();
  await expect(page.getByRole('spinbutton', { name: 'Akumulator', exact: true })).toHaveValue('16');
  await expect(page.getByRole('spinbutton', { name: 'Licznik', exact: true })).toHaveValue('1');
  await page.getByRole('button', { name: 'Otworz konsole' }).first().click();
  await expect(page.getByText('Kod zakończony', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('compiler errors include diagnostics and editing supports undo', async ({ page }) => {
  await page.getByRole('tab', { name: 'Program', exact: true }).click();
  const editor = page.locator('#program .cm-content');
  await editor.fill('NIEZNANY 0');
  await page.getByRole('button', { name: 'Kompiluj', exact: true }).click();
  await page.getByRole('button', { name: 'Otworz konsole' }).first().click();
  await expect(page.locator('.console-dock')).toContainText('NIEZNANY');
  await editor.click();
  await page.keyboard.press('Control+z');
  await expect(editor).toContainText('DOD 0');
});

test('English memory mnemonics and data directive completions follow the interface language', async ({ page }) => {
  await page.getByRole('tab', { name: 'Program', exact: true }).click();
  await page.locator('#program .cm-content').fill('POB value\nSTP\nvalue: RST 7');
  await page.getByRole('button', { name: 'Kompiluj', exact: true }).click();
  await expect(page.locator('#memoryTable')).toContainText('POB');
  await page.getByRole('button', { name: 'Otworz ustawienia' }).click();
  await page.getByRole('tab', { name: 'Angielski', exact: true }).click();
  await page.getByRole('button', { name: 'Close settings', exact: true }).click();
  await expect(page.locator('#memoryTable')).toContainText('LOAD');
  await expect(page.locator('#memoryTable')).not.toContainText('POB');
  await page.locator('#program .execution-btn--edit').click();
  const editor = page.locator('#program .cm-content');
  await editor.fill('RS');
  await page.keyboard.press('Control+Space');
  await expect(page.getByRole('option', { name: /RST/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await editor.fill('RP');
  await page.keyboard.press('Control+Space');
  await expect(page.getByRole('option', { name: /RPA/ })).toBeVisible();
});

test('theme, language, number format and optional registers survive reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Otworz ustawienia' }).click();
  await page.getByRole('tab', { name: 'Ciemny', exact: true }).click();
  await page.getByRole('tab', { name: 'Angielski', exact: true }).click();
  await page.getByRole('tab', { name: 'HEX', exact: true }).click();
  for (const name of [
    'X register',
    'Y register',
    'JAML extras',
    'Bus connectors',
    'Show hidden bus registers',
    'Input/Output devices',
    'Stack handling',
    'Interrupts',
  ]) {
    await page.getByRole('checkbox', { name, exact: true }).locator('..').click();
  }
  await page.getByRole('button', { name: 'Close settings', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('body')).toHaveClass('darkMode');
  await page.reload();
  await expect(page.locator('body')).toHaveClass('darkMode');
  await expect(page.locator('#W')).toContainText('RB');
  await expect(page.locator('#W')).toContainText('RZ');
  await expect(page.locator('#W')).toContainText('WS');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('W') || '{}'));
  expect(saved.numberFormat).toBe('hex');
  expect(saved).not.toHaveProperty('logs');
  expect(saved).not.toHaveProperty('mem');
});

test('all eight laboratory briefs open and selected code loads', async ({ page }) => {
  await page.getByRole('button', { name: 'Otworz ustawienia' }).click();
  await page.getByRole('button', { name: 'Wybierz lab', exact: true }).click();
  await expect(page.locator('.labListItem')).toHaveCount(8);
  await page.locator('.labListItem').nth(1).click();
  const code = await page.locator('.labDialogBody pre').last().innerText();
  await page.locator('.labDialogFooter button').click();
  await expect(page.locator('#program .cm-content')).toContainText(code.split('\n')[0]);
  await expect(page.getByRole('tab', { name: 'Program', exact: true })).toHaveAttribute('aria-selected', 'true');
});

test('mobile memory opens, edits, closes and fits viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.mobile-memory-button').click();
  const memory = page.getByRole('dialog');
  await expect(memory).toBeVisible();
  const cell = memory.getByRole('spinbutton', { name: 'Pamiec[0]', exact: true });
  await cell.fill('99');
  await expect(cell).toHaveValue('99');
  await page.keyboard.press('Escape');
  await expect(memory).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('malformed preferences cannot prevent simulator startup', async ({ page }) => {
  // Seed after the previous document's pagehide persistence, before React starts.
  await page.addInitScript(() => localStorage.setItem('W', '{not-json'));
  await page.reload();
  await expect(page.getByRole('tab', { name: 'Tryb ręczny', exact: true })).toBeVisible();
  await expect(page.getByRole('spinbutton', { name: 'Licznik', exact: true })).toHaveValue('0');
});

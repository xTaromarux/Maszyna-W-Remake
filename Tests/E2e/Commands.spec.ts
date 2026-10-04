import { test, expect } from '@playwright/test';

test('custom command editing, rename and JSON import/export retain the catalog', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Otworz ustawienia' }).click();
  await page.getByRole('button', { name: 'Lista rozkazów', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Lista rozkazów', exact: true });
  await dialog.locator('.commandInput').fill('TESTCMD');
  await dialog.locator('textarea').fill('il;\nstop;');
  await dialog.getByRole('button', { name: 'Dodaj', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'TESTCMD', exact: true })).toBeVisible();
  await dialog.getByTitle('Edytuj nazwę rozkazu', { exact: true }).click();
  await dialog.locator('.commandInput').fill('TESTRENAMED');
  await dialog.getByRole('button', { name: 'Potwierdź', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'TESTRENAMED', exact: true })).toBeVisible();
  await dialog.getByTitle('Edytuj treść rozkazu', { exact: true }).click();
  await dialog.locator('textarea').fill('il;\nil;\nstop;');
  await dialog.getByRole('button', { name: 'Zapisz', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await dialog.getByRole('button', { name: 'Pobierz', exact: true }).click();
  const download = await downloadPromise;
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk);
  const catalog = JSON.parse(Buffer.concat(chunks).toString());
  expect(catalog.find((command) => command.name === 'TESTRENAMED').lines).toBe('il;\nil;\nstop;');
  const chooserPromise = page.waitForEvent('filechooser');
  await dialog.getByRole('button', { name: 'Wgraj', exact: true }).click();
  const chooser = await chooserPromise;
  await chooser.setFiles({ name: 'commandList.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(catalog)) });
  await expect(dialog.getByRole('button', { name: 'TESTRENAMED', exact: true })).toBeVisible();
  await dialog.getByRole('button', { name: 'TESTRENAMED', exact: true }).click();
  await expect(dialog.locator('textarea')).toHaveValue('il;\nil;\nstop;');
});

test('plain microcode stops at a breakpoint and resumes without repeating a step', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Program', exact: true }).click();
  await page.locator('#inputs .cm-content').fill('il;\nil;\nil;\nstop;');
  await page.getByRole('button', { name: 'Kompiluj (DEBUG)', exact: true }).click();
  await page.locator('[data-row="2"] .bp-dot').click();
  await page.getByRole('button', { name: 'Uruchom (bez animacji)', exact: true }).first().click();
  await expect(page.locator('[data-row="2"]')).toHaveClass(/active/);
  await expect(page.getByRole('spinbutton', { name: 'Licznik', exact: true })).toHaveValue('2');
  await page.getByRole('button', { name: 'Uruchom (bez animacji)', exact: true }).first().click();
  await expect(page.getByRole('spinbutton', { name: 'Licznik', exact: true })).toHaveValue('3');
});

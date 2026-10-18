import { expect, test } from '@playwright/test';

test('workspace fills the viewport below the toolbar and stays visible while the machine scrolls', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 640 });
  await page.goto('/');
  const workspace = page.locator('#editorWorkspace');
  const toolbar = page.locator('#topBar');
  const before = await workspace.boundingBox();
  const header = await toolbar.boundingBox();
  expect(before!.y).toBeCloseTo(header!.height, 0);
  expect(before!.y + before!.height).toBeCloseTo(640, 0);
  expect(before!.x + before!.width).toBeCloseTo(await page.evaluate(() => document.documentElement.clientWidth), 0);
  await page.evaluate(() => window.scrollTo(0, 180));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  const after = await workspace.boundingBox();
  expect(after!.y).toBeCloseTo(header!.height, 0);
  expect(after!.height).toBeCloseTo(before!.height, 0);
  expect(await page.locator('#wLayout > .console-dock').count()).toBe(0);

  await page.getByRole('tab', { name: 'Program', exact: true }).click();
  await page.locator('#program .cm-content').fill(Array.from({ length: 120 }, () => 'STP').join('\n'));
  const scroller = page.locator('#program .cm-scroller');
  await expect.poll(() => scroller.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  const filled = await workspace.boundingBox();
  expect(filled!.height).toBeCloseTo(before!.height, 0);
});

test('switching to diagnostics preserves source, undo, microcode and the compilation lock', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Program', exact: true }).click();
  const source = page.locator('#program .cm-content');
  const original = await source.innerText();
  await source.fill('STP');
  await page.getByRole('tab', { name: 'Mikrokod', exact: true }).click();
  const microcode = page.locator('#inputs .cm-content');
  await microcode.fill('il;\nstop;');
  await page.getByRole('tab', { name: 'Konsola', exact: true }).click();
  await expect(source).toBeHidden();
  await expect(page.locator('#editorWorkspace #console')).toBeVisible();
  await page.locator('#console .close-btn').click();
  await expect(page.getByRole('tab', { name: 'Mikrokod', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(microcode.locator('.cm-line')).toHaveText(['il;', 'stop;']);
  await page.getByRole('tab', { name: 'Kod ASM', exact: true }).click();
  await expect(source).toHaveText('STP');
  await source.click();
  await source.press('Control+z');
  await expect(source).toHaveText(original);

  await source.fill('STP');
  await page.locator('#program .execution-btn--compile').click();
  await expect(source).toHaveAttribute('contenteditable', 'false');
  await page.getByRole('tab', { name: 'Konsola', exact: true }).click();
  await page.getByRole('tab', { name: 'Kod ASM', exact: true }).click();
  await expect(source).toHaveAttribute('contenteditable', 'false');
  await page.locator('#program .execution-btn--edit').click();
  await expect(source).toHaveAttribute('contenteditable', 'true');
});

test('view tabs support arrows, Home, End and returning from the console with Escape', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Program', exact: true }).click();
  const sourceTab = page.getByRole('tab', { name: 'Kod ASM', exact: true });
  const microcodeTab = page.getByRole('tab', { name: 'Mikrokod', exact: true });
  const consoleTab = page.getByRole('tab', { name: 'Konsola', exact: true });
  await sourceTab.focus();
  await sourceTab.press('ArrowRight');
  await expect(microcodeTab).toBeFocused();
  await expect(microcodeTab).toHaveAttribute('aria-selected', 'true');
  await microcodeTab.press('End');
  await expect(consoleTab).toBeFocused();
  await expect(page.locator('#console')).toBeVisible();
  await consoleTab.press('Escape');
  await expect(microcodeTab).toHaveAttribute('aria-selected', 'true');
  await microcodeTab.focus();
  await microcodeTab.press('Home');
  await expect(sourceTab).toBeFocused();
  await page.getByRole('tab', { name: 'Tryb ręczny', exact: true }).click();
  await expect(sourceTab).toHaveCount(0);
  await expect(microcodeTab).toHaveAttribute('aria-selected', 'true');
});

test('phone fullscreen includes console and controls and Escape respects nested settings', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('tab', { name: 'Program', exact: true }).click();
  await page.getByRole('button', { name: 'Rozwiń edytor', exact: true }).click();
  const workspace = page.locator('#editorWorkspace');
  const toolbar = await page.locator('#topBar').boundingBox();
  const bounds = await workspace.boundingBox();
  expect(bounds!.x).toBeCloseTo(0, 0);
  expect(bounds!.width).toBeCloseTo(375, 0);
  expect(bounds!.y).toBeCloseTo(toolbar!.height, 0);
  expect(bounds!.y + bounds!.height).toBeCloseTo(812, 0);
  const source = page.locator('#program .cm-content');
  await source.fill('STP');
  await page.getByRole('button', { name: 'Otworz ustawienia' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(workspace).toHaveClass(/workspace-expanded/);
  await page.getByRole('tab', { name: 'Konsola', exact: true }).click();
  await expect(workspace.locator('#console')).toBeVisible();
  await expect(workspace.locator('.workspace-footer')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(workspace).toHaveClass(/workspace-expanded/);
  await expect(source).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(workspace).not.toHaveClass(/workspace-expanded/);
  await expect(source).toHaveText('STP');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('console controls appear only in the console while code views retain execution actions', async ({ page }) => {
  await page.goto('/');
  const footer = page.locator('.workspace-footer');
  await expect(footer).toHaveCount(0);
  await page.locator('#il').click();
  await page.getByRole('button', { name: 'Wykonaj takt', exact: true }).click();
  await expect(page.locator('#counter input')).toHaveValue('1');

  await page.getByRole('tab', { name: 'Program', exact: true }).click();
  await expect(footer).toHaveCount(0);
  await page.locator('#program .cm-content').fill('STP');
  await page.locator('#program .execution-btn--compile').click();
  await expect(page.locator('#program').getByRole('button', { name: 'Uruchom (bez animacji)', exact: true })).toBeEnabled();
  await page.getByRole('tab', { name: 'Konsola', exact: true }).click();
  await expect(footer).toBeVisible();
  await expect(footer.getByTitle('Wylacz breakpointy (wygaszenie)')).toBeVisible();
  await page.getByRole('tab', { name: 'Mikrokod', exact: true }).click();
  await expect(footer).toHaveCount(0);
  await expect(page.locator('#inputs').getByRole('button', { name: 'Następny takt', exact: true })).toBeEnabled();
});

test('external devices have their own tab and retain input when switching views on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  const deviceTab = page.getByRole('tab', { name: 'External device(s)', exact: true });
  await expect(deviceTab).toBeVisible();
  await expect(page.locator('#inputs [data-editor-io-panel].io-card')).toHaveCount(0);
  await deviceTab.click();
  const device = page.locator('#workspace-view-devices');
  await expect(device).toBeVisible();
  await expect(page.locator('.workspace-footer')).toHaveCount(0);
  await device.getByPlaceholder('Wpisz znak…').fill('A');
  await expect(device.locator('.hint-value')).toHaveText('65');
  await expect(device.locator('.status')).toHaveText('BUSY');
  await page.getByRole('tab', { name: 'Mikrokod', exact: true }).click();
  await expect(device).toBeHidden();
  await deviceTab.click();
  await expect(device.locator('.hint-value')).toHaveText('65');
  await page.getByRole('tab', { name: 'Konsola', exact: true }).click();
  await page.locator('#console .close-btn').click();
  await expect(deviceTab).toHaveAttribute('aria-selected', 'true');
  await expect(device.locator('.hint-value')).toHaveText('65');
  const bounds = await page.locator('#editorWorkspace').boundingBox();
  expect(bounds!.x + bounds!.width).toBeCloseTo(await page.evaluate(() => document.documentElement.clientWidth), 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

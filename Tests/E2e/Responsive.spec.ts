import { expect, test, type Page } from '@playwright/test';

const enableExtras = async (page: Page) => {
  await page.getByRole('button', { name: 'Otworz ustawienia' }).click();
  for (const name of [
    'Rejestr X',
    'Rejestr Y',
    'Łączniki magistrali',
    'Pokaż niewidoczne rejestry magistral',
    'Urządzenia wejścia/wyjścia',
    'Obsługa stosu',
    'Przerwania',
  ]) {
    await page.getByRole('checkbox', { name, exact: true }).locator('..').click();
  }
  await page.getByRole('button', { name: 'Zamknij ustawienia', exact: true }).click();
  await expect(page.locator('#popupsBackdrop')).toBeHidden();
};

test.describe('touch layouts', () => {
  test.use({ isMobile: true, hasTouch: true });

  for (const width of [320, 390]) {
    test(`extended diagram pans without enlarging the ${width}px viewport and touch targets remain usable`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto('/');
      await enableExtras(page);
      await expect.poll(() => page.evaluate(() => innerWidth)).toBe(width);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

      const diagram = page.locator('#processorViewport');
      expect(await diagram.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
      await page.locator('#wyx').tap();
      await expect(page.locator('#wyx')).toHaveAttribute('aria-pressed', 'true');
      const address = page.locator('#apRegister input');
      await address.fill('3');
      await address.press('Enter');
      await expect(address).toHaveValue('3');
      expect(await diagram.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);

      for (const selector of ['#il', '#eni', '#wyx', '#apRegister .format-button']) {
        const bounds = await page.locator(selector).boundingBox();
        expect(bounds!.width).toBeGreaterThanOrEqual(44);
        expect(bounds!.height).toBeGreaterThanOrEqual(44);
      }
      await diagram.evaluate((element) => (element.scrollLeft = 0));
      await page.locator('.mobile-memory-button').click();
      const memory = page.locator('.mobileModalContent');
      await expect(memory).toBeVisible();
      const cell = memory.getByRole('spinbutton', { name: 'Pamiec[0]', exact: true });
      await cell.fill('99');
      await cell.press('Enter');
      await expect(cell).toHaveValue('99');
      await page.keyboard.press('Escape');
      await expect(memory).toHaveCount(0);
      expect(await page.evaluate(() => innerWidth)).toBe(width);
    });
  }

  test('phone controls execute ticks while the diagram is visible and navigate back to the editor', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const controls = page.locator('#mobileControls');
    await expect(controls).toBeVisible();
    await expect(controls.getByRole('button', { name: 'Uruchom', exact: true })).toBeDisabled();
    await page.locator('#il').tap();
    await controls.getByRole('button', { name: 'Wykonaj takt', exact: true }).tap();
    await expect(page.locator('#counter input')).toHaveValue('1');

    await controls.getByRole('button', { name: 'Edytor', exact: true }).tap();
    const workspace = page.locator('#editorWorkspace');
    const toolbar = await page.locator('#topBar').boundingBox();
    expect((await workspace.boundingBox())!.y).toBeCloseTo(toolbar!.height, 0);
    await page.getByRole('tab', { name: 'Program', exact: true }).tap();
    await page.locator('#program .cm-content').fill('DOD 0\nSOB 0');
    await page.locator('#program .execution-btn--compile').tap();
    await expect(controls.getByRole('button', { name: 'Uruchom', exact: true })).toBeEnabled();
    await controls.getByRole('button', { name: 'Schemat', exact: true }).tap();
    expect((await page.locator('#processorViewport').boundingBox())!.y).toBeCloseTo(toolbar!.height, 0);
    await controls.getByRole('button', { name: 'Następny takt', exact: true }).tap();
    await expect(page.locator('#counter input')).toHaveValue('1');
    await controls.getByRole('button', { name: 'Uruchom', exact: true }).tap();
    await controls.getByRole('button', { name: 'Stop', exact: true }).tap();
    await expect(controls.getByRole('button', { name: 'Uruchom', exact: true })).toBeVisible();

    await controls.getByRole('button', { name: 'Edytor', exact: true }).tap();
    const workspaceBounds = await workspace.boundingBox();
    const controlsBounds = await controls.boundingBox();
    expect(workspaceBounds!.y + workspaceBounds!.height).toBeCloseTo(controlsBounds!.y, 0);
    await page.getByRole('button', { name: 'Rozwiń edytor', exact: true }).tap();
    await expect(controls).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(controls).toBeVisible();
  });

  test('landscape tablet keeps the diagram and editor beside each other without losing drafts on rotation', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await page.getByRole('tab', { name: 'Program', exact: true }).click();
    await page.locator('#program .cm-content').fill('STP');
    const diagram = await page.locator('#processorViewport').boundingBox();
    const workspace = await page.locator('#editorWorkspace').boundingBox();
    expect(workspace!.y).toBeCloseTo(diagram!.y, 0);
    expect(workspace!.x).toBeGreaterThanOrEqual(diagram!.x + diagram!.width);
    await expect(page.locator('#mobileControls')).toBeHidden();

    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('#mobileControls')).toBeVisible();
    await expect(page.locator('#program .cm-content')).toHaveText('STP');
    expect(await page.evaluate(() => innerWidth)).toBe(768);
    await page.setViewportSize({ width: 844, height: 390 });
    await page.locator('#mobileControls').getByRole('button', { name: 'Edytor', exact: true }).click();
    const compile = await page.locator('#program .execution-btn--compile').boundingBox();
    const controls = await page.locator('#mobileControls').boundingBox();
    expect(compile!.y + compile!.height).toBeLessThanOrEqual(controls!.y);
    await page.locator('#program .execution-btn--compile').click();
    await expect(page.locator('#program .cm-content')).toHaveAttribute('contenteditable', 'false');
  });
});

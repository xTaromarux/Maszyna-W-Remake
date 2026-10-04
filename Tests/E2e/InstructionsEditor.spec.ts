import { expect, test } from '@playwright/test';

test('failed compilation preserves registers and memory, then successful compilation resets registers', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Program', exact: true }).click();

  const accumulator = page.getByRole('spinbutton', { name: 'Akumulator', exact: true });
  const counter = page.getByRole('spinbutton', { name: 'Licznik', exact: true });
  const editor = page.locator('#program .cm-content');
  const memoryBefore = await page.locator('#memoryTable').innerText();
  const microcodeBefore = await page.locator('.cm-content').first().innerText();

  await accumulator.fill('42');
  await counter.fill('3');

  for (const source of ['NIEZNANY 0', 'ORG 16\nSTP', 'RST 7\nORG 16\nDATA 1, 2']) {
    await editor.fill(source);
    await page.locator('#program .execution-btn--compile').click();

    await expect(accumulator).toHaveValue('42');
    await expect(counter).toHaveValue('3');
    await expect(editor).toHaveAttribute('contenteditable', 'true');
    expect(await page.locator('#memoryTable').innerText()).toBe(memoryBefore);
    expect(await page.locator('.cm-content').first().innerText()).toBe(microcodeBefore);
  }

  await editor.fill('STP');
  await page.locator('#program .execution-btn--compile').click();

  await expect(accumulator).toHaveValue('0');
  await expect(counter).toHaveValue('0');
  await expect(editor).toHaveAttribute('contenteditable', 'false');
  await expect(page.locator('#program .execution-btn--edit')).toBeVisible();
});

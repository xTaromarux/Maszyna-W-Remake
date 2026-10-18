import { expect, test } from '@playwright/test';
import { openEnglishSettings } from './Support/SettingsActions';

test('expanded editor fits a phone and supports compilation and editing', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('tab', { name: 'Program', exact: true }).click();
  await page.getByRole('button', { name: 'Rozwiń edytor', exact: true }).click();

  const wrapper = page.locator('#program .editor-wrapper');
  const workspace = page.locator('#editorWorkspace');
  const editor = wrapper.locator('.cm-content');
  const bounds = await workspace.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeCloseTo(0, 0);
  expect(bounds!.width).toBeCloseTo(375, 0);

  await editor.fill('RS');
  await editor.press('Control+Space');
  await expect(page.getByRole('option', { name: /RST/ })).toBeVisible();
  const completionBounds = await page.locator('.cm-tooltip-autocomplete').boundingBox();
  expect(completionBounds!.width).toBeLessThanOrEqual(335);
  await editor.press('Escape');

  await editor.fill('STP');
  await page.locator('#program').getByRole('button', { name: 'Kompiluj', exact: true }).click();
  await expect(editor).toHaveAttribute('contenteditable', 'false');
  await page.locator('#program').getByRole('button', { name: 'Edytuj', exact: true }).click();
  await expect(editor).toHaveAttribute('contenteditable', 'true');

  await page.getByRole('button', { name: 'Zwiń edytor', exact: true }).click();
  await expect(workspace).not.toHaveClass(/workspace-expanded/);
});

test('editing and undo survive language and autocomplete reconfiguration', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Program', exact: true }).click();
  const editor = page.locator('#program .cm-content');
  const original = await editor.innerText();
  await editor.fill('STP');

  await openEnglishSettings(page);
  await page.getByRole('button', { name: 'Close settings', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Expand editor', exact: true })).toBeVisible();

  await editor.click();
  await editor.press('Control+z');
  await expect(editor).toHaveText(original);
});

for (const { name, width, height, dark } of [
  { name: 'desktop light', width: 1440, height: 900, dark: false },
  { name: 'phone dark fullscreen', width: 375, height: 812, dark: true },
]) {
  test(`selection and caret align with text in both editors on ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    await page.getByRole('tab', { name: 'Program', exact: true }).click();
    if (dark) {
      await page.getByRole('button', { name: 'Otworz ustawienia' }).click();
      await page.getByRole('tab', { name: 'Ciemny', exact: true }).click();
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Rozwiń edytor', exact: true }).click();
    }

    for (const { tab, container, line, word } of [
      { tab: 'Kod ASM', container: '#program', line: 'DOD 0', word: 'DOD' },
      { tab: 'Mikrokod', container: '#inputs', line: 'czyt wys wei il;', word: 'czyt' },
    ]) {
      await page.getByRole('tab', { name: tab, exact: true }).click();
      const editor = page.locator(`${container} .cm-content`);
      await editor.fill(Array.from({ length: 80 }, () => line).join('\n'));

      for (const position of ['Control+Home', 'Control+End']) {
        await editor.press(position);
        await editor.press('Home');
        for (let offset = 0; offset < word.length; offset++) {
          await editor.press('Shift+ArrowRight');
        }

        await expect.poll(() => editor.evaluate(() => window.getSelection()?.toString())).toBe(word);
        await expect
          .poll(() =>
            editor.evaluate((element) => {
              const range = window.getSelection()!.getRangeAt(0);
              const text = range.getBoundingClientRect();
              const end = range.cloneRange();
              end.collapse(false);
              const editorRoot = element.closest('.cm-editor')!;
              const selection = editorRoot.querySelector('.cm-selectionBackground')?.getBoundingClientRect();
              const cursor = editorRoot.querySelector('.cm-cursor')?.getBoundingClientRect();
              if (!selection || !cursor) return Infinity;
              return Math.max(
                Math.abs(selection.x - text.x),
                Math.abs(selection.y - text.y),
                Math.abs(selection.width - text.width),
                Math.abs(selection.height - text.height),
                Math.abs(cursor.x - end.getBoundingClientRect().x),
                Math.abs(cursor.y - text.y)
              );
            })
          )
          .toBeLessThan(1);
      }
    }
  });
}

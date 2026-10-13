import { expect, test } from '@playwright/test';
import { openEnglishSettings } from './Support/SettingsActions';

test('expanded editor fits a phone and supports compilation and editing', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.getByRole('tab', { name: 'Program', exact: true }).click();
  await page.getByRole('button', { name: 'Rozwiń edytor', exact: true }).click();

  const wrapper = page.locator('#program .editor-wrapper');
  const editor = wrapper.locator('.cm-content');
  const bounds = await wrapper.boundingBox();
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
  await wrapper.getByRole('button', { name: 'Kompiluj', exact: true }).click();
  await expect(editor).toHaveAttribute('contenteditable', 'false');
  await wrapper.getByRole('button', { name: 'Edytuj', exact: true }).click();
  await expect(editor).toHaveAttribute('contenteditable', 'true');

  await page.getByRole('button', { name: 'Zwiń edytor', exact: true }).click();
  await expect(wrapper).not.toHaveClass(/full-screen/);
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

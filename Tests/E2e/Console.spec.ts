import { expect, test, type Page } from '@playwright/test';

const compileInvalidProgram = async (page: Page, name: string) => {
  await page.locator('#program .cm-content').fill(`${name} 0`);
  await page.locator('#program .execution-btn--compile').click();
  await expect(page.locator('.console-entry .message').filter({ hasText: name }).first()).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Program', exact: true }).click();
  await page.locator('.console-indicator').click();
  await expect(page.locator('#console')).toBeVisible();
});

test('expanded diagnostics stay with their log after new errors and clear removes their state', async ({ page }) => {
  await compileInvalidProgram(page, 'FIRST_UNKNOWN');
  const firstLog = page.locator('.console-entry').filter({ hasText: 'FIRST_UNKNOWN' }).first();
  const toggle = firstLog.locator('.details-toggle');
  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(firstLog.locator('.entry-details')).toContainText('PARSE_UNKNOWN_MNEMONIC');

  await compileInvalidProgram(page, 'SECOND_UNKNOWN');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(firstLog.locator('.entry-details')).toContainText('PARSE_UNKNOWN_MNEMONIC');
  const secondLog = page.locator('.console-entry').filter({ hasText: 'SECOND_UNKNOWN' }).first();
  await expect(secondLog.locator('.details-toggle')).toHaveAttribute('aria-expanded', 'false');

  await page.locator('#console .clear-btn').click();
  await expect(page.locator('.console-entry')).toHaveCount(1);
  await expect(page.locator('.entry-details')).toHaveCount(0);
  await compileInvalidProgram(page, 'FIRST_UNKNOWN');
  await expect(page.locator('.details-toggle')).toHaveAttribute('aria-expanded', 'false');
});

test('newest-first logs follow the top and leave readers of older entries in place', async ({ page }) => {
  for (let index = 0; index < 16; index++) {
    await compileInvalidProgram(page, `UNKNOWN_${index}`);
  }

  const content = page.locator('.console-content');
  expect(await content.evaluate((element) => element.scrollHeight > element.clientHeight)).toBe(true);
  await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBe(0);

  await page.locator('#console .scroll-bottom-btn').click();
  await expect.poll(() => content.evaluate((element) => element.scrollTop + element.clientHeight >= element.scrollHeight - 10)).toBe(true);
  await page.locator('#program .cm-content').fill('OLDER_READING 0');
  await page.locator('#program .execution-btn--compile').click();
  await expect(page.locator('.console-entry .message').filter({ hasText: 'OLDER_READING' })).toHaveCount(1);
  await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBeGreaterThan(10);

  await page.locator('#console .scroll-top-btn').click();
  await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBe(0);
  await compileInvalidProgram(page, 'FOLLOW_LATEST');
  await expect.poll(() => content.evaluate((element) => element.scrollTop)).toBe(0);
  await expect(page.locator('.console-entry').first()).toContainText('FOLLOW_LATEST');
});

test('console indicators use native keyboard activation and manual rail keeps run disabled', async ({ page }) => {
  await page.locator('#console .close-btn').click();
  const indicator = page.locator('.console-dock-indicator');
  await expect(indicator).toHaveAttribute('type', 'button');
  await indicator.focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#console')).toBeVisible();

  await page.getByRole('tab', { name: 'Tryb ręczny', exact: true }).click();
  const controls = page.locator('.controls-rail');
  await expect(controls.getByTitle('Wykonaj takt')).toBeEnabled();
  await expect(controls.getByTitle('Uruchom program', { exact: true })).toBeDisabled();
  await expect(controls.locator('.rail-btn[aria-pressed]')).toHaveAttribute('aria-pressed', 'true');
  await controls.locator('.rail-btn[aria-pressed]').click();
  await expect(controls.locator('.rail-btn[aria-pressed]')).toHaveAttribute('aria-pressed', 'false');
});

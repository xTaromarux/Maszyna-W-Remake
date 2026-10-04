import type { Locator, Page } from '@playwright/test';

export const openEnglishSettings = async (page: Page): Promise<Locator> => {
  await page.getByRole('button', { name: 'Otworz ustawienia' }).click();
  await page.getByRole('tab', { name: 'Angielski', exact: true }).click();

  return page.getByRole('dialog', { name: 'Settings', exact: true });
};

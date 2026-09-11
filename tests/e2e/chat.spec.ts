import { test, expect, type BrowserContext, type Page, type Route } from '@playwright/test';

const DUMMY_KEY = 'test-only-dummy-key-never-valid';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Session-Id',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

async function mockApi(context: BrowserContext, onChat: (route: Route) => Promise<void>, baseURL: string) {
  const siteOrigin = new URL(baseURL).origin;
  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const chat = /\/(?:api\/)?chat\/?$/.test(url.pathname);
    const health = /\/health\/?$/.test(url.pathname);
    if (chat || health) {
      if (request.method() === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: corsHeaders });
        return;
      }
      if (health) {
        await route.fulfill({ json: { upstream_ok: true }, headers: corsHeaders });
        return;
      }
      await onChat(route);
      return;
    }
    // Never allow a request to any real model, proxy, or other external origin.
    if (url.origin !== siteOrigin) {
      await route.abort('blockedbyclient');
      return;
    }
    await route.continue();
  });
}

async function openChat(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Otworz czat AI', exact: true }).click();
  await expect(page.locator('#aiChat')).toBeVisible();
}

async function saveKey(page: Page) {
  await page.getByLabel('Gemini API key', { exact: true }).fill(DUMMY_KEY);
  await page.getByRole('button', { name: 'Zapisz klucz', exact: true }).click();
  await expect(page.locator('.apiKeyGate')).toHaveCount(0);
}

test('chat API key can be saved, revealed, persisted and removed locally', async ({ page, context, baseURL }) => {
  let chatCalls = 0;
  await mockApi(
    context,
    async (route) => {
      chatCalls += 1;
      await route.abort();
    },
    baseURL
  );
  await openChat(page);
  const key = page.getByLabel('Gemini API key', { exact: true });
  await expect(key).toHaveAttribute('type', 'password');
  await expect(page.getByRole('button', { name: 'Wyślij', exact: true })).toBeDisabled();
  await key.fill(DUMMY_KEY);
  await page.getByRole('button', { name: 'Pokaz', exact: true }).click();
  await expect(key).toHaveAttribute('type', 'text');
  await page.getByRole('button', { name: 'Ukryj', exact: true }).click();
  await expect(key).toHaveAttribute('type', 'password');
  await page.getByRole('button', { name: 'Zapisz klucz', exact: true }).click();
  expect(await page.evaluate(() => localStorage.getItem('aiChat.apiKey'))).toBe(DUMMY_KEY);
  await page.reload();
  await page.getByRole('button', { name: 'Otworz czat AI', exact: true }).click();
  await expect(page.locator('.apiKeyGate')).toHaveCount(0);
  await page.getByRole('button', { name: 'Edytuj klucz API', exact: true }).click();
  await expect(key).toHaveValue(DUMMY_KEY);
  await page.getByRole('button', { name: 'Usun klucz', exact: true }).click();
  await expect(key).toHaveValue('');
  expect(await page.evaluate(() => localStorage.getItem('aiChat.apiKey'))).toBeNull();
  expect(chatCalls).toBe(0);
});

test('real browser worker renders safe code, copies it and restores conversation history', async ({ page, context, baseURL }) => {
  const requests: Record<string, unknown>[] = [];
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await context.addInitScript(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          (window as any).__copiedCode = text;
        },
      },
    });
  });
  const code = 'DOD 0\nSTP\n';
  const responseText = `Przykład:\n\`\`\`asm\n${code}\`\`\`\n<img src=x onerror="window.injected=true">`;
  await mockApi(
    context,
    async (route) => {
      requests.push(route.request().postDataJSON());
      await route.fulfill({ json: { response: responseText }, headers: corsHeaders });
    },
    baseURL
  );
  await openChat(page);
  await saveKey(page);
  await page.getByPlaceholder('Wpisz wiadomość…').fill('Pokaż program');
  await page.getByRole('button', { name: 'Wyślij', exact: true }).click();
  await expect(page.locator('.messageAi .code-block')).toContainText('DOD 0');
  await expect(page.getByRole('button', { name: 'Anuluj odpowiedź', exact: true })).toHaveCount(0);
  await expect(page.locator('.messageAi')).toContainText('<img src=x');
  await expect(page.locator('.messageAi img')).toHaveCount(0);
  await page.getByRole('button', { name: 'Skopiuj kod', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Skopiuj kod', exact: true })).toHaveText('Skopiowano');
  expect(await page.evaluate(() => (window as any).__copiedCode)).toBe(code);
  expect(requests).toHaveLength(1);
  expect(requests[0]).toEqual({ query: 'Pokaż program', api_key: DUMMY_KEY, history: [] });
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('aiChat.messages') || '{}').messages?.length)).toBe(2);
  await page.reload();
  await page.getByRole('button', { name: 'Otworz czat AI', exact: true }).click();
  await expect(page.locator('.messageBubble')).toHaveCount(2);
  await expect(page.locator('.messageAi .code-block')).toContainText('STP');
  await page.getByPlaceholder('Wpisz wiadomość…').fill('Wyjaśnij');
  await page.getByRole('button', { name: 'Wyślij', exact: true }).click();
  await expect.poll(() => requests.length).toBe(2);
  expect(requests[1].history).toEqual([
    { role: 'user', message: 'Pokaż program' },
    { role: 'assistant', message: responseText },
  ]);
  await page.getByRole('button', { name: 'Resetuj czat', exact: true }).click();
  await expect(page.locator('.messageBubble')).toHaveCount(0);
  expect(pageErrors).toEqual([]);
});

test('chat cancellation removes the pending reply and allows the next message', async ({ page, context, baseURL }) => {
  let pending: Route;
  let calls = 0;
  await mockApi(
    context,
    async (route) => {
      calls += 1;
      if (calls === 1) {
        pending = route;
        return;
      }
      await route.fulfill({ json: { response: 'Druga odpowiedź' }, headers: corsHeaders });
    },
    baseURL
  );
  await openChat(page);
  await saveKey(page);
  await page.getByPlaceholder('Wpisz wiadomość…').fill('Długie pytanie');
  await page.getByRole('button', { name: 'Wyślij', exact: true }).click();
  const cancel = page.getByRole('button', { name: 'Anuluj odpowiedź', exact: true });
  await expect(cancel).toBeVisible();
  await expect.poll(() => !!pending).toBe(true);
  await cancel.click();
  await expect(page.locator('.messageAi')).toHaveCount(0);
  await pending.abort().catch(() => {});
  await expect(page.getByPlaceholder('Wpisz wiadomość…')).toBeEnabled();
  await page.getByPlaceholder('Wpisz wiadomość…').fill('Następne pytanie');
  await page.getByRole('button', { name: 'Wyślij', exact: true }).click();
  await expect(page.locator('.messageAi')).toContainText('Druga odpowiedź');
  await expect(cancel).toHaveCount(0);
  expect(calls).toBe(2);
});

import { test, expect, type BrowserContext, type Page, type Route } from '@playwright/test';

const DUMMY_KEY = 'test-only-dummy-key-never-valid';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,X-Session-Id',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
};

async function mockApi(
  context: BrowserContext,
  onChat: (route: Route) => Promise<void>,
  baseURL: string,
  onHealth?: (route: Route) => Promise<void>
) {
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
        if (onHealth) {
          await onHealth(route);
          return;
        }
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

test('chat traps keyboard focus and restores the opener on close', async ({ page, context, baseURL }) => {
  await mockApi(context, async (route) => route.abort(), baseURL);
  await openChat(page);
  await expect(page.getByLabel('Gemini API key', { exact: true })).toBeFocused();
  const close = page.locator('#aiChat .closeBtn');
  const first = page.locator('#aiChat .apiKeyBtn');
  const last = page.getByRole('button', { name: 'Zapisz klucz', exact: true });
  await last.focus();
  await page.keyboard.press('Tab');
  await expect(first).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(last).toBeFocused();
  await close.click();
  await expect(page.getByRole('button', { name: 'Otworz czat AI', exact: true })).toBeFocused();
});

test('API-key gate blocks keyboard focus in the conversation and preserves multiline text', async ({ page, context, baseURL }) => {
  const reply = 'First line\nSecond line\n`inline`\n```txt\nexample\n```';
  await mockApi(context, async (route) => route.fulfill({ json: { response: reply }, headers: corsHeaders }), baseURL);
  await openChat(page);
  await saveKey(page);
  await page.locator('#aiChat .inputArea input').fill('Show text');
  await page.locator('#aiChat .inputArea button[type=submit]').click();
  await expect(page.locator('.messageAi .cancelBtn')).toHaveCount(0);
  await expect(page.locator('.messageAi .messageHtml')).toContainText('First line\nSecond line', { useInnerText: true });
  await expect(page.locator('.messageAi .inline-code')).toHaveText('inline');
  await expect(page.locator('.messageAi .messageText')).toHaveCSS('white-space', 'pre-wrap');

  await page.locator('#aiChat .apiKeyBtn').click();
  const copyButton = page.locator('.messageAi .copy-btn');
  await expect(page.locator('#conversation')).toHaveAttribute('inert', '');
  await expect(page.locator('#aiChat .inputArea')).toHaveAttribute('inert', '');
  await copyButton.evaluate((button: HTMLButtonElement) => button.focus());
  await expect(copyButton).not.toBeFocused();

  for (let step = 0; step < 12; step++) {
    await page.keyboard.press('Tab');
    const focusedInBackground = await page.evaluate(() => Boolean(document.activeElement?.closest('#conversation, .inputArea')));
    expect(focusedInBackground).toBe(false);
  }

  await page.locator('.apiKeyGate .apiKeySecondary').first().click();
  await expect(page.locator('#conversation')).not.toHaveAttribute('inert', '');
  await copyButton.focus();
  await expect(copyButton).toBeFocused();
});

test('reset stops an animated reply before starting the next response', async ({ page, context, baseURL }) => {
  let calls = 0;
  const longReply = 'Animated response. '.repeat(300);
  await mockApi(
    context,
    async (route) => {
      calls++;
      await route.fulfill({ json: { response: calls === 1 ? longReply : 'Next reply' }, headers: corsHeaders });
    },
    baseURL
  );
  await openChat(page);
  await saveKey(page);
  const input = page.locator('#aiChat .inputArea input');
  const send = page.locator('#aiChat .inputArea button[type=submit]');
  await input.fill('Animate');
  await send.click();
  await expect(page.locator('.messageAi .messageText')).toContainText('Animated response.');
  await expect(page.locator('.messageAi .cancelBtn')).toBeVisible();
  expect((await page.locator('.messageAi .messageText').innerText()).length).toBeLessThan(longReply.length);

  await page.locator('#aiChat .resetBtn').click();
  await expect(page.locator('.messageBubble')).toHaveCount(0);
  await input.fill('Next');
  await send.click();
  await expect(page.locator('.messageAi')).toHaveCount(1);
  await expect(page.locator('.messageAi .messageText')).toHaveText('Next reply');
  await expect(page.locator('.messageAi .cancelBtn')).toHaveCount(0);
});

test('resizing persists panel width across reload and restores the cursor', async ({ page, context, baseURL }) => {
  await mockApi(context, async (route) => route.abort(), baseURL);
  await openChat(page);
  await page.locator('#aiChat .resizer').hover();
  const resizer = await page.locator('#aiChat .resizer').boundingBox();
  expect(resizer).not.toBeNull();
  await page.mouse.move(resizer!.x + resizer!.width / 2, resizer!.y + resizer!.height / 2);
  await page.mouse.down();
  await page.mouse.move(resizer!.x + resizer!.width / 2 - 80, resizer!.y + resizer!.height / 2);
  await page.mouse.up();
  await expect(page.locator('#aiChat')).toHaveAttribute('style', /width: 730px/);
  expect(await page.evaluate(() => document.body.style.cursor)).toBe('');
  await page.reload();
  await page.getByRole('button', { name: 'Otworz czat AI', exact: true }).click();
  await expect(page.locator('#aiChat')).toHaveAttribute('style', /width: 730px/);
});

test('closing the panel during resize saves width and restores the cursor', async ({ page, context, baseURL }) => {
  await mockApi(context, async (route) => route.abort(), baseURL);
  await openChat(page);
  const handle = page.locator('#aiChat .resizer');
  await handle.hover();
  const bounds = await handle.boundingBox();
  expect(bounds).not.toBeNull();
  const startX = bounds!.x + bounds!.width / 2;
  const startY = bounds!.y + bounds!.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX - 80, startY);
  await expect(page.locator('#aiChat')).toHaveAttribute('style', /width: 730px/);
  await page.keyboard.press('Escape');
  await expect(page.locator('#aiChat')).toHaveCount(0);
  expect(await page.evaluate(() => document.body.style.cursor)).toBe('');
  await page.mouse.up();

  await page.reload();
  await page.getByRole('button', { name: 'Otworz czat AI', exact: true }).click();
  await expect(page.locator('#aiChat')).toHaveAttribute('style', /width: 730px/);
});

test('failed wake shows an error without creating or sending an assistant reply', async ({ page, context, baseURL }) => {
  let chatCalls = 0;
  await mockApi(
    context,
    async (route) => {
      chatCalls++;
      await route.abort();
    },
    baseURL,
    async (route) => {
      if (new URL(route.request().url()).searchParams.has('wake')) await route.fulfill({ status: 503, json: {}, headers: corsHeaders });
      else await route.fulfill({ json: { upstream_ok: false }, headers: corsHeaders });
    }
  );
  await openChat(page);
  await saveKey(page);
  await page.getByPlaceholder('Wpisz wiadomość…').fill('Pytanie');
  await page.getByRole('button', { name: 'Wyślij', exact: true }).click();
  await expect(page.locator('.inputError')).toContainText('503');
  await expect(page.locator('.messageAi')).toHaveCount(0);
  await expect(page.getByPlaceholder('Wpisz wiadomość…')).toBeEnabled();
  expect(chatCalls).toBe(0);
});

for (const failure of ['constructor', 'postMessage']) {
  test(`worker ${failure} failure removes pending reply and permits retry`, async ({ page, context, baseURL }) => {
    await context.addInitScript((failure) => {
      const OriginalWorker = window.Worker;
      let first = true;
      window.Worker = class extends OriginalWorker {
        constructor(url: string | URL, options?: WorkerOptions) {
          if (first && failure === 'constructor') {
            first = false;
            throw new Error('Worker startup failed');
          }
          super(url, options);
        }
        postMessage(message: unknown, transfer: Transferable[] = []) {
          if (first && failure === 'postMessage') {
            first = false;
            throw new Error('Worker dispatch failed');
          }
          super.postMessage(message, transfer);
        }
      };
    }, failure);
    await mockApi(
      context,
      async (route) => route.fulfill({ json: { response: 'Odpowiedź po ponowieniu' }, headers: corsHeaders }),
      baseURL
    );
    await openChat(page);
    await saveKey(page);
    await page.getByPlaceholder('Wpisz wiadomość…').fill('Pierwsze pytanie');
    await page.getByRole('button', { name: 'Wyślij', exact: true }).click();
    await expect(page.locator('.inputError')).toBeVisible();
    await expect(page.locator('.messageAi')).toHaveCount(0);
    await page.getByPlaceholder('Wpisz wiadomość…').fill('Ponów');
    await page.getByRole('button', { name: 'Wyślij', exact: true }).click();
    await expect(page.locator('.messageAi')).toContainText('Odpowiedź po ponowieniu');
  });
}

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

test('reset during model readiness ignores the old request and permits a new one', async ({ page, context, baseURL }) => {
  let pendingHealth: Route | undefined;
  let healthCalls = 0;
  let chatCalls = 0;
  await mockApi(
    context,
    async (route) => {
      chatCalls++;
      await route.fulfill({ json: { response: 'New reply' }, headers: corsHeaders });
    },
    baseURL,
    async (route) => {
      healthCalls++;
      if (healthCalls === 1) {
        pendingHealth = route;
        return;
      }
      await route.fulfill({ json: { upstream_ok: true }, headers: corsHeaders });
    }
  );
  await openChat(page);
  await saveKey(page);
  const input = page.locator('#aiChat .inputArea input');
  await input.fill('Old request');
  await page.locator('#aiChat .inputArea button[type=submit]').click();
  await expect.poll(() => Boolean(pendingHealth)).toBe(true);

  await page.locator('#aiChat .resetBtn').click();
  await pendingHealth!.fulfill({ json: { upstream_ok: true }, headers: corsHeaders }).catch(() => {});
  await expect(page.locator('.messageBubble')).toHaveCount(0);
  await expect(input).toBeEnabled();
  expect(chatCalls).toBe(0);

  await input.fill('New request');
  await page.locator('#aiChat .inputArea button[type=submit]').click();
  await expect(page.locator('.messageAi')).toContainText('New reply');
  expect(chatCalls).toBe(1);
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

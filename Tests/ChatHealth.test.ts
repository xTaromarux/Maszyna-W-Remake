import assert from 'node:assert/strict';
import test from 'node:test';
import { checkChatHealth } from '../src/Components/AiChat/Api/ChatHealth';

test('cold model readiness is checked again after wake', async (context) => {
  const requests: string[] = [];
  const responses = [{ upstream_ok: false }, { status: 'waking' }, { upstream_ok: true }];
  context.mock.method(globalThis, 'fetch', async (url: string) => {
    requests.push(url);
    return Response.json(responses.shift());
  });
  let waking = 0;
  await checkChatHealth('/health?region=local', new AbortController().signal, () => waking++);
  assert.deepEqual(requests, ['/health?region=local&check=1', '/health?region=local&wake=1', '/health?region=local&check=1']);
  assert.equal(waking, 1);
});

test('failed wake and a still-unready model never report readiness', async (context) => {
  for (const wakeFails of [true, false]) {
    let calls = 0;
    const mock = context.mock.method(globalThis, 'fetch', async () => {
      calls++;
      return wakeFails && calls === 2 ? new Response('', { status: 503 }) : Response.json({ upstream_ok: false });
    });
    await assert.rejects(
      checkChatHealth('/health', new AbortController().signal, () => {}),
      wakeFails ? /HTTP 503/ : /not ready/
    );
    assert.equal(calls, wakeFails ? 2 : 3);
    mock.mock.restore();
  }
});

test('health checks forward aborts to each request', async (context) => {
  const controller = new AbortController();
  context.mock.method(globalThis, 'fetch', async (_url: string, options: RequestInit) => {
    assert.equal(options.signal, controller.signal);
    controller.abort();
    options.signal?.throwIfAborted();
    return Response.json({ upstream_ok: true });
  });
  await assert.rejects(
    checkChatHealth('/health', controller.signal, () => {}),
    { name: 'AbortError' }
  );
});

test('an aborted or malformed health body cannot be treated as ready', async (context) => {
  const controller = new AbortController();
  const mock = context.mock.method(
    globalThis,
    'fetch',
    async () =>
      ({
        ok: true,
        json: async () => {
          controller.abort();
          throw new Error('body aborted');
        },
      }) as Response
  );
  await assert.rejects(
    checkChatHealth('/health', controller.signal, () => {}),
    { name: 'AbortError' }
  );
  mock.mock.restore();
  context.mock.method(globalThis, 'fetch', async () => Response.json(null));
  await assert.rejects(
    checkChatHealth('/health', new AbortController().signal, () => {}),
    /Invalid health response/
  );
});

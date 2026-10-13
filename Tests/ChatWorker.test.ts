import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const workerPath = fileURLToPath(new URL('../src/Components/AiChat/Worker/ChatWorker.ts', import.meta.url));

type WorkerMessage = {
  messageId?: string;
  text?: string;
  done?: boolean;
  errorKey?: string;
  errorDetail?: string;
  cancelled?: boolean;
  streaming?: boolean;
};

const workerHarness = (fetchImpl: typeof fetch) => {
  let listener: (event: { data: unknown }) => void;
  const messages: WorkerMessage[] = [];
  let resolveDone: (value: WorkerMessage) => void;
  const done = new Promise<WorkerMessage>((resolve) => {
    resolveDone = resolve;
  });
  const context = vm.createContext({
    exports: {},
    fetch: fetchImpl,
    AbortController,
    TextDecoder,
    setTimeout,
    clearTimeout,
    self: {
      addEventListener: (_name: string, callback: typeof listener) => {
        listener = callback;
      },
      postMessage: (message: WorkerMessage) => {
        messages.push(message);
        if (message.done) resolveDone(message);
      },
    },
  });
  const modules = new Map<string, { exports: Record<string, unknown> }>();

  const loadModule = (file: string): Record<string, unknown> => {
    const cached = modules.get(file);
    if (cached) {
      return cached.exports;
    }

    const module = { exports: {} };
    modules.set(file, module);

    const source = ts.transpileModule(readFileSync(file, 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS },
    }).outputText;

    const evaluate = vm.runInContext(`(function(exports, require, module) {${source}\n})`, context, { filename: file });
    const requireModule = (specifier: string) => loadModule(path.resolve(path.dirname(file), specifier + '.ts'));
    evaluate(module.exports, requireModule, module);

    return module.exports;
  };

  loadModule(workerPath);
  return {
    messages,
    done,
    send: (data: object) => listener({ data }),
    start: (data: object = {}) =>
      listener({
        data: {
          type: 'start',
          messageId: 'assistant-1',
          query: 'What is W?',
          apiKey: 'test-key',
          history: [{ role: 'user', message: 'Hello' }],
          sessionId: 'test-session',
          apiUrl: 'https://proxy.test/api/chat',
          healthUrl: 'https://proxy.test/health',
          ...data,
        },
      }),
  };
};

test('chat worker sends the established API protocol and reads JSON response shapes', async () => {
  for (const body of [
    { response: 'answer' },
    { text: 'answer' },
    { data: { text: 'answer' } },
    ['answer'],
    { choices: [{ message: { content: 'answer' } }] },
  ]) {
    let calls = 0;
    const worker = workerHarness(async (url, options) => {
      calls += 1;
      assert.equal(url, 'https://proxy.test/api/chat');
      assert.equal(options?.method, 'POST');
      assert.deepEqual(JSON.parse(String(options?.body)), {
        query: 'What is W?',
        api_key: 'test-key',
        history: [{ role: 'user', message: 'Hello' }],
      });
      assert.equal((options?.headers as Record<string, string>)['X-Session-Id'], 'test-session');
      return Response.json(body);
    });
    worker.start();
    const result = await worker.done;
    assert.equal(result.text, 'answer');
    assert.equal(calls, 1);
  }
});

test('chat worker reads a plain-text response without consuming its body twice', async () => {
  const worker = workerHarness(async () => new Response('plain answer', { headers: { 'Content-Type': 'text/plain' } }));
  worker.start();
  assert.equal((await worker.done).text, 'plain answer');
});

test('chat worker reconstructs split SSE events and split UTF-8 characters', async () => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode('data: {"choices":[{"delta":{"content":"Zaż"}}]}\r\n\r\ndata: {"delta":"ółć"}\n\ndata: [DONE]\n\n');
  const stream = new ReadableStream({
    start(controller) {
      for (const byte of bytes) controller.enqueue(Uint8Array.of(byte));
      controller.close();
    },
  });
  const worker = workerHarness(async () => new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } }));
  worker.start();
  const result = await worker.done;
  assert.equal(result.text, 'Zażółć');
  assert.equal(result.streaming, true);
  assert.ok(worker.messages.some((message) => message.text === 'Zaż' && !message.done));
});

test('chat worker cancellation aborts the pending request and completes cleanly', async () => {
  let signal: AbortSignal;
  const worker = workerHarness(async (_url, options) => {
    signal = options.signal;
    return new Promise((_resolve, reject) =>
      signal.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true })
    );
  });
  worker.start();
  worker.send({ type: 'cancel', messageId: 'assistant-1' });
  const result = await worker.done;
  assert.equal(signal.aborted, true);
  assert.equal(result.cancelled, true);
  assert.equal(result.errorKey, undefined);
});

test('chat worker does not retry HTTP 4xx or expose upstream error bodies', async () => {
  for (const status of [400, 401, 403, 429]) {
    let calls = 0;
    const worker = workerHarness(async () => {
      calls += 1;
      return new Response('secret-upstream-key test-key', { status });
    });
    worker.start();
    const result = await worker.done;
    assert.equal(calls, 1);
    assert.equal(result.errorKey, 'aiChat.fetchFailed');
    assert.match(result.errorDetail, new RegExp(`HTTP ${status}`));
    assert.doesNotMatch(JSON.stringify(worker.messages), /secret-upstream-key|test-key/);
  }
});

test('chat worker retries transient upstream failures after the health wakeup', async () => {
  const urls: string[] = [];
  const worker = workerHarness(async (url) => {
    urls.push(String(url));
    if (urls.length === 1) return new Response('', { status: 503 });
    if (String(url).includes('/health')) return Response.json({ upstream_ok: true });
    return Response.json({ response: 'awake' });
  });
  worker.start();
  assert.equal((await worker.done).text, 'awake');
  assert.deepEqual(urls, [
    'https://proxy.test/api/chat',
    'https://proxy.test/health?check=1',
    'https://proxy.test/health?wake=1',
    'https://proxy.test/api/chat',
  ]);
});

test('chat worker rejects missing API keys before any network call', async () => {
  const worker = workerHarness(async () => {
    assert.fail('No fetch expected');
  });
  worker.start({ apiKey: ' ' });
  assert.equal((await worker.done).errorKey, 'aiChat.apiKey.missingError');
});

test('chat worker closes failed SSE readers and hides upstream diagnostics', async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('data: {"error":{"message":"secret-upstream-key"}}\n\n'));
    },
    cancel() {
      cancelled = true;
    },
  });
  const worker = workerHarness(async () => new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } }));
  worker.start({ healthUrl: '' });
  const result = await worker.done;
  assert.equal(result.errorKey, 'aiChat.fetchFailed');
  assert.equal(cancelled, true);
  assert.doesNotMatch(JSON.stringify(worker.messages), /secret-upstream-key/);
});

test('chat worker rejects empty SSE replies, including heartbeat-only and DONE-only streams', async () => {
  for (const body of ['', ': heartbeat\n\n', 'data: [DONE]\n\n']) {
    const worker = workerHarness(async () => new Response(body, { headers: { 'Content-Type': 'text/event-stream' } }));
    worker.start({ healthUrl: '' });

    const result = await worker.done;
    assert.equal(result.errorKey, 'aiChat.fetchFailed');
    assert.equal(result.errorDetail, 'AI did not return a response');
    assert.equal(result.text, undefined);
  }
});

test('replacing a request suppresses stale completion and preserves the replacement', async () => {
  let resolveOld!: (response: Response) => void;
  let resolveNew!: (response: Response) => void;
  let oldSignal!: AbortSignal;
  let calls = 0;

  const worker = workerHarness(async (_url, options) => {
    calls += 1;

    if (calls === 1) {
      oldSignal = options!.signal!;
      return new Promise<Response>((resolve) => {
        resolveOld = resolve;
      });
    }

    return new Promise<Response>((resolve) => {
      resolveNew = resolve;
    });
  });

  worker.start();
  worker.start({ query: 'replacement' });
  assert.equal(oldSignal.aborted, true);

  // Ignore abort in the mock to model a late result from the replaced request.
  resolveOld(Response.json({ response: 'stale reply' }));
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.deepEqual(worker.messages, []);

  resolveNew(Response.json({ response: 'current reply' }));
  assert.equal((await worker.done).text, 'current reply');
  assert.equal(worker.messages.length, 1);
  assert.equal(worker.messages[0].cancelled, undefined);
});

test('replacing a streaming request suppresses its later chunks and cancellation', async () => {
  let streamController!: ReadableStreamDefaultController<Uint8Array>;
  let resolveNew!: (response: Response) => void;
  let calls = 0;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      streamController = controller;
    },
  });

  const worker = workerHarness(async () => {
    if (++calls === 1) {
      return new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } });
    }

    return new Promise<Response>((resolve) => {
      resolveNew = resolve;
    });
  });

  worker.start();
  streamController.enqueue(encoder.encode('data: {"delta":"old"}\n\n'));
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(worker.messages[0].text, 'old');

  worker.start({ query: 'replacement' });
  streamController.enqueue(encoder.encode('data: {"delta":" stale"}\n\ndata: [DONE]\n\n'));
  await new Promise<void>((resolve) => setImmediate(resolve));
  assert.equal(worker.messages.length, 1);

  resolveNew(Response.json({ response: 'new reply' }));
  assert.equal((await worker.done).text, 'new reply');
  assert.equal(worker.messages.length, 2);
  assert.equal(
    worker.messages.some((message) => message.cancelled),
    false
  );
});

test('cancellation during health recovery aborts the check without waking or retrying', async () => {
  const urls: string[] = [];
  let signal!: AbortSignal;
  let checkStarted!: () => void;
  const checking = new Promise<void>((resolve) => {
    checkStarted = resolve;
  });

  const worker = workerHarness(async (url, options) => {
    urls.push(String(url));
    if (urls.length === 1) {
      return new Response('', { status: 503 });
    }

    signal = options!.signal!;
    const response = new Promise<Response>((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Cancelled', 'AbortError')), { once: true });
    });
    checkStarted();
    return response;
  });

  worker.start();
  await checking;
  worker.send({ type: 'cancel', messageId: 'assistant-1' });

  assert.equal((await worker.done).cancelled, true);
  assert.equal(signal.aborted, true);
  assert.deepEqual(urls, ['https://proxy.test/api/chat', 'https://proxy.test/health?check=1']);
});

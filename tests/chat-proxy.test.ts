import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { test } from 'node:test';
import { createProxyApp, normalizeUpstream } from '../hf-proxy/server.js';

const payload = { query: 'What is W?', api_key: 'local-test-key', history: [{ role: 'user', message: 'Hello' }] };

async function listen(server: ReturnType<typeof createServer>) {
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

async function close(server: ReturnType<typeof createServer>) {
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
}

test('HF proxy normalizes supported Space URL formats', () => {
  assert.equal(normalizeUpstream('', 'owner/space_name'), 'https://owner-space-name.hf.space/chat');
  assert.equal(normalizeUpstream('https://huggingface.co/spaces/owner/space_name', ''), 'https://owner-space-name.hf.space/chat');
  assert.equal(normalizeUpstream('https://example.test', ''), 'https://example.test/chat');
  assert.throws(() => normalizeUpstream('file:///tmp/chat', ''), /HTTP or HTTPS/);
});

test('HF proxy health and chat preserve the API contract with a local mock upstream', async () => {
  const received: unknown[] = [];
  const upstream = createServer(async (request, response) => {
    if (request.url === '/health') {
      response.setHeader('Content-Type', 'application/json');
      response.end('{"ok":true}');
      return;
    }
    let body = '';
    for await (const chunk of request) body += chunk;
    received.push(JSON.parse(body));
    response.setHeader('Content-Type', 'application/json');
    response.end('{"response":"local answer"}');
  });
  const target = await listen(upstream);
  const proxy = createServer(createProxyApp({ targetUrl: target, allowedOrigins: ['http://next.test'] }));
  const base = await listen(proxy);
  try {
    const health = await fetch(`${base}/health?check=1`).then((response) => response.json());
    assert.equal(health.upstream_ok, true);
    assert.equal(health.status, 'HTTP_200');
    const chat = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: 'http://next.test' },
      body: JSON.stringify(payload),
    });
    assert.equal(chat.status, 200);
    assert.equal(chat.headers.get('access-control-allow-origin'), 'http://next.test');
    assert.deepEqual(await chat.json(), { response: 'local answer' });
    assert.deepEqual(received, [payload]);
    const denied = await fetch(`${base}/health`, { headers: { Origin: 'http://other.test' } });
    assert.equal(denied.status, 403);
  } finally {
    await close(proxy);
    await close(upstream);
  }
});

test('HF proxy rejects malformed input before forwarding and sanitizes upstream errors', async () => {
  let upstreamCalls = 0;
  const upstream = createServer((_request, response) => {
    upstreamCalls += 1;
    response.writeHead(401, { 'Content-Type': 'text/plain' });
    response.end('diagnostic local-test-key');
  });
  const target = await listen(upstream);
  const proxy = createServer(createProxyApp({ targetUrl: target }));
  const base = await listen(proxy);
  try {
    for (const body of [
      {},
      { ...payload, query: [] },
      { ...payload, api_key: '' },
      { ...payload, history: 'invalid' },
      { ...payload, history: [{ role: 'system', message: 'bad' }] },
      { ...payload, history: Array.from({ length: 41 }, () => payload.history[0]) },
    ]) {
      const response = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      assert.equal(response.status, 400);
    }
    assert.equal(upstreamCalls, 0);
    const response = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    assert.equal(response.status, 401);
    assert.doesNotMatch(await response.text(), /diagnostic|local-test-key/);
    assert.equal(upstreamCalls, 1);
  } finally {
    await close(proxy);
    await close(upstream);
  }
});

test('HF proxy timeout covers a stalled body after upstream response headers', async () => {
  const upstream = createServer((_request, response) => {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.flushHeaders();
    response.write('{"response":"');
  });
  const target = await listen(upstream);
  const proxy = createServer(createProxyApp({ targetUrl: target, chatTimeoutMs: 80 }));
  const base = await listen(proxy);
  try {
    const start = Date.now();
    const response = await fetch(`${base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(3000),
    });
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { error: 'Bad gateway' });
    assert.ok(Date.now() - start < 2000);
  } finally {
    await close(proxy);
    await close(upstream);
  }
});

test('HF proxy supports the legacy health fallback without a user API key', async () => {
  const received: unknown[] = [];
  const upstream = createServer(async (request, response) => {
    if (request.url === '/health') {
      response.writeHead(404);
      response.end();
      return;
    }
    let body = '';
    for await (const chunk of request) body += chunk;
    received.push(JSON.parse(body));
    response.setHeader('Content-Type', 'application/json');
    response.end('{}');
  });
  const target = await listen(upstream);
  const proxy = createServer(createProxyApp({ targetUrl: target }));
  const base = await listen(proxy);
  try {
    const health = await fetch(`${base}/health?wake=1`).then((response) => response.json());
    assert.equal(health.status, 'CHAT_200');
    assert.equal(health.woke, true);
    assert.deepEqual(received, [{ query: '', api_key: 'health-check', history: [] }]);
  } finally {
    await close(proxy);
    await close(upstream);
  }
});

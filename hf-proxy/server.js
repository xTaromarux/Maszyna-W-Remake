import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function normalizeUpstream(rawUrl, spaceSlug) {
  let url = rawUrl?.trim() || '';
  if (!url && spaceSlug) {
    const [owner, space] = spaceSlug.split('/');
    if (!owner || !space) throw new Error('HF_SPACE must use owner/space format');
    url = `https://${`${owner}-${space}`.replace(/_/g, '-')}.hf.space/chat`;
  }
  const match = url.match(/^https?:\/\/huggingface\.co\/spaces\/([^/]+)\/([^/]+)(?:\/.*)?$/i);
  if (match) url = `https://${`${match[1]}-${match[2]}`.replace(/_/g, '-')}.hf.space/chat`;
  if (url && !/\/chat\/?$/.test(url)) url = url.replace(/\/+$/, '') + '/chat';
  if (url && !['http:', 'https:'].includes(new URL(url).protocol)) throw new Error('HF_TARGET_URL must use HTTP or HTTPS');
  return url;
}

function validChatBody(body) {
  return (
    body &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    typeof body.query === 'string' &&
    body.query.trim().length > 0 &&
    body.query.length <= 32000 &&
    typeof body.api_key === 'string' &&
    body.api_key.trim().length > 0 &&
    body.api_key.length <= 4096 &&
    Array.isArray(body.history) &&
    body.history.length <= 40 &&
    body.history.every(
      (item) =>
        item &&
        typeof item === 'object' &&
        ['user', 'assistant'].includes(item.role) &&
        typeof item.message === 'string' &&
        item.message.length <= 64000
    )
  );
}

// Keep the timeout alive until the complete response body has been consumed.
async function fetchTextWithTimeout(fetchImpl, url, options, timeoutMs, parentSignal) {
  const controller = new AbortController();
  const abort = () => controller.abort();
  parentSignal?.addEventListener('abort', abort, { once: true });
  if (parentSignal?.aborted) controller.abort();
  const timeout = setTimeout(abort, timeoutMs);
  try {
    const response = await fetchImpl(url, { ...options, signal: controller.signal });
    const text = await response.text();
    return { response, text };
  } finally {
    clearTimeout(timeout);
    parentSignal?.removeEventListener('abort', abort);
  }
}

export function createProxyApp({
  targetUrl = process.env.HF_TARGET_URL || '',
  space = process.env.HF_SPACE || '',
  allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  bodyLimitMb = Number(process.env.BODY_LIMIT_MB) || 2,
  fetchImpl = fetch,
  chatTimeoutMs = 60000,
  healthTimeoutMs = 10000,
  wakeTimeoutMs = 25000,
} = {}) {
  const app = express();
  const upstream = normalizeUpstream(targetUrl, space);
  const upstreamHealth = upstream ? upstream.replace(/\/chat\/?$/, '/health') : '';
  app.disable('x-powered-by');
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        const error = new Error('Origin is not allowed');
        error.status = 403;
        callback(error);
      },
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'X-Session-Id', 'Authorization'],
      credentials: false,
    })
  );
  app.use(express.json({ limit: `${Math.min(16, Math.max(1, bodyLimitMb))}mb` }));
  const limiter = () => rateLimit({ windowMs: 60000, max: 60, standardHeaders: true, legacyHeaders: false });
  app.use('/api/chat', limiter());
  app.use('/health', limiter());
  app.options('/api/chat', (_request, response) => response.sendStatus(204));

  app.get('/health', async (request, response) => {
    const wake = String(request.query.wake || '0') === '1';
    const info = { ok: true, upstream, upstream_health: upstreamHealth, upstream_ok: null, woke: false, status: null };
    if (!upstream) return response.json({ ...info, upstream_ok: false, status: 'NO_UPSTREAM_SET' });
    const controller = new AbortController();
    const abort = () => {
      if (!response.writableEnded) controller.abort();
    };
    response.once('close', abort);
    try {
      let result = null;
      let usedFallback = false;
      const timeout = wake ? wakeTimeoutMs : healthTimeoutMs;
      if (upstreamHealth !== upstream)
        result = await fetchTextWithTimeout(fetchImpl, upstreamHealth, { method: 'GET' }, timeout, controller.signal).catch(() => null);
      if (controller.signal.aborted) return;
      if (!result || [404, 405].includes(result.response.status)) {
        usedFallback = true;
        result = await fetchTextWithTimeout(
          fetchImpl,
          upstream,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: wake ? '' : '[health-check]', api_key: 'health-check', history: [] }),
          },
          timeout,
          controller.signal
        );
      }
      info.upstream_ok = result.response.ok;
      info.status = `${usedFallback ? 'CHAT_' : 'HTTP_'}${result.response.status}`;
      info.woke = wake && result.response.ok;
    } catch {
      info.upstream_ok = false;
      info.status = 'FETCH_ERROR';
    } finally {
      response.removeListener('close', abort);
    }
    if (!response.destroyed) response.json(info);
  });

  app.post('/api/chat', async (request, response) => {
    if (!validChatBody(request.body)) return response.status(400).json({ error: 'INVALID_CHAT_PAYLOAD' });
    if (!upstream) return response.status(503).json({ error: 'UPSTREAM_URL_NOT_SET', hint: 'Set HF_TARGET_URL or HF_SPACE' });
    const controller = new AbortController();
    const abort = () => {
      if (!response.writableEnded) controller.abort();
    };
    response.once('close', abort);
    try {
      const { response: result, text } = await fetchTextWithTimeout(
        fetchImpl,
        upstream,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: request.body.query, api_key: request.body.api_key, history: request.body.history }),
        },
        chatTimeoutMs,
        controller.signal
      );
      if (response.destroyed) return;
      if (!result.ok) {
        const retryAfter = result.headers.get('retry-after');
        if (retryAfter) response.set('Retry-After', retryAfter);
        return response.status(result.status).json({ error: 'UPSTREAM_REQUEST_FAILED', status: result.status });
      }
      response
        .status(result.status)
        .type(result.headers.get('content-type') || 'application/json')
        .send(text);
    } catch {
      if (!response.destroyed) response.status(502).json({ error: 'Bad gateway' });
    } finally {
      response.removeListener('close', abort);
    }
  });

  app.use((error, _request, response, _next) => {
    const status = error.status === 403 ? 403 : error.type === 'entity.too.large' ? 413 : 400;
    response
      .status(status)
      .json({ error: status === 403 ? 'ORIGIN_NOT_ALLOWED' : status === 413 ? 'PAYLOAD_TOO_LARGE' : 'INVALID_REQUEST' });
  });
  return app;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const port = Number(process.env.PORT) || 8787;
  createProxyApp().listen(port, () => {
    console.log(`HF proxy listening on :${port}`);
  });
}

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeUpstream } from './Upstream.js';
import { createHealthHandler } from './HealthHandler.js';
import { createChatHandler } from './ChatHandler.js';

export { normalizeUpstream } from './Upstream.js';

export const createProxyApp = ({
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
} = {}) => {
  const app = express();
  const upstream = normalizeUpstream(targetUrl, space);
  const upstreamHealth = upstream ? upstream.replace(/\/chat\/?$/, '/health') : '';
  app.disable('x-powered-by');
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
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

  app.get('/health', createHealthHandler({ upstream, upstreamHealth, fetchImpl, wakeTimeoutMs, healthTimeoutMs }));

  app.post('/api/chat', createChatHandler({ upstream, fetchImpl, chatTimeoutMs }));

  app.use((error, _request, response, _next) => {
    const status = error.status === 403 ? 403 : error.type === 'entity.too.large' ? 413 : 400;
    response
      .status(status)
      .json({ error: status === 403 ? 'ORIGIN_NOT_ALLOWED' : status === 413 ? 'PAYLOAD_TOO_LARGE' : 'INVALID_REQUEST' });
  });
  return app;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  const port = Number(process.env.PORT) || 8787;
  createProxyApp().listen(port, () => {
    console.log(`HF proxy listening on :${port}`);
  });
}

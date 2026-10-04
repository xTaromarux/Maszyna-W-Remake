import { fetchTextWithTimeout } from './Upstream.js';
import { createResponseAbort } from './ResponseAbort.js';

/** Checks upstream health and uses the existing chat fallback when the health endpoint is unavailable. */
export const createHealthHandler =
  ({ upstream, upstreamHealth, fetchImpl, wakeTimeoutMs, healthTimeoutMs }) =>
  async (request, response) => {
    const wake = String(request.query.wake || '0') === '1';
    const info = { ok: true, upstream, upstream_health: upstreamHealth, upstream_ok: null, woke: false, status: null };
    if (!upstream) {
      return response.json({ ...info, upstream_ok: false, status: 'NO_UPSTREAM_SET' });
    }
    const pendingResponse = createResponseAbort(response);
    try {
      let result = null;
      let usedFallback = false;
      const timeout = wake ? wakeTimeoutMs : healthTimeoutMs;
      if (upstreamHealth !== upstream) {
        result = await fetchTextWithTimeout(fetchImpl, upstreamHealth, { method: 'GET' }, timeout, pendingResponse.signal).catch(
          () => null
        );
      }
      if (pendingResponse.signal.aborted) {
        return;
      }
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
          pendingResponse.signal
        );
      }
      info.upstream_ok = result.response.ok;
      info.status = `${usedFallback ? 'CHAT_' : 'HTTP_'}${result.response.status}`;
      info.woke = wake && result.response.ok;
    } catch {
      info.upstream_ok = false;
      info.status = 'FETCH_ERROR';
    } finally {
      pendingResponse.dispose();
    }
    if (!response.destroyed) {
      response.json(info);
    }
  };

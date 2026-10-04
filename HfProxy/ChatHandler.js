import { validChatBody } from './ChatPayload.js';
import { fetchTextWithTimeout } from './Upstream.js';
import { createResponseAbort } from './ResponseAbort.js';

/** Validates chat input, forwards the request and exposes only the existing public upstream response. */
export const createChatHandler =
  ({ upstream, fetchImpl, chatTimeoutMs }) =>
  async (request, response) => {
    if (!validChatBody(request.body)) {
      return response.status(400).json({ error: 'INVALID_CHAT_PAYLOAD' });
    }
    if (!upstream) {
      return response.status(503).json({ error: 'UPSTREAM_URL_NOT_SET', hint: 'Set HF_TARGET_URL or HF_SPACE' });
    }
    const pendingResponse = createResponseAbort(response);
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
        pendingResponse.signal
      );
      if (response.destroyed) {
        return;
      }
      if (!result.ok) {
        const retryAfter = result.headers.get('retry-after');
        if (retryAfter) {
          response.set('Retry-After', retryAfter);
        }
        return response.status(result.status).json({ error: 'UPSTREAM_REQUEST_FAILED', status: result.status });
      }
      response
        .status(result.status)
        .type(result.headers.get('content-type') || 'application/json')
        .send(text);
    } catch {
      if (!response.destroyed) {
        response.status(502).json({ error: 'Bad gateway' });
      }
    } finally {
      pendingResponse.dispose();
    }
  };

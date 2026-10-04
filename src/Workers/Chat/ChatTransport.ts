import type { StartChatRequest } from '../../Types/ChatWorker';
import { readEventStream } from './ChatEventStream';
import { extractResponseText, parseResponseData, requireResponseText } from './ChatResponse';

const HEALTH_CHECK_TIMEOUT_MS = 8000;
const MODEL_WAKE_TIMEOUT_MS = 25000;

class ChatHttpError extends Error {
  constructor(
    readonly status: number,
    statusText: string
  ) {
    super(`HTTP ${status} ${statusText}`);
  }
}

/** Makes one POST and normalizes either its complete response or its event stream. */
const requestChat = async (request: StartChatRequest, signal: AbortSignal, onText: (text: string) => void) => {
  signal.throwIfAborted();

  const { query, history, apiKey, sessionId, apiUrl } = request;
  const response = await fetch(apiUrl || '/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionId ? { 'X-Session-Id': sessionId } : {}),
    },
    body: JSON.stringify({ query, api_key: apiKey, history }),
    signal,
  });

  if (!response.ok) {
    // Upstream diagnostics may contain submitted credentials; do not echo the body.
    await response.body?.cancel().catch(() => {});
    throw new ChatHttpError(response.status, response.statusText);
  }

  const isEventStream = response.headers.get('content-type')?.includes('text/event-stream');
  if (isEventStream && response.body) {
    const text = await readEventStream(response.body, onText);
    return { text, streaming: true };
  }

  const body = await response.text();
  const text = requireResponseText(extractResponseText(parseResponseData(body)));
  return { text, streaming: false };
};

/** Bounds a recovery request by both its own timeout and the parent chat deadline. */
const requestHealth = async (url: string, signal: AbortSignal, timeoutMs: number): Promise<void> => {
  signal.throwIfAborted();

  const controller = new AbortController();
  const abort = () => controller.abort();
  signal.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(abort, timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    await response.text();
  } finally {
    clearTimeout(timeout);
    signal.removeEventListener('abort', abort);
  }
};

const shouldRetryRequest = (error: unknown, signal: AbortSignal, healthUrl: string | undefined): boolean => {
  if (signal.aborted || !healthUrl) {
    return false;
  }

  return !(error instanceof ChatHttpError && error.status < 500);
};

/** Retries once after best-effort recovery; cancellation and HTTP 4xx never trigger recovery. */
export const requestChatWithRetry = async (request: StartChatRequest, signal: AbortSignal, onText: (text: string) => void) => {
  const healthUrl = request.healthUrl ?? '';

  try {
    return await requestChat(request, signal, onText);
  } catch (error) {
    if (!shouldRetryRequest(error, signal, healthUrl)) {
      throw error;
    }
  }

  const separator = healthUrl.includes('?') ? '&' : '?';

  // Health attempts are advisory; the second POST determines whether recovery succeeded.
  await requestHealth(`${healthUrl}${separator}check=1`, signal, HEALTH_CHECK_TIMEOUT_MS).catch(() => {});
  signal.throwIfAborted();
  await requestHealth(`${healthUrl}${separator}wake=1`, signal, MODEL_WAKE_TIMEOUT_MS).catch(() => {});
  signal.throwIfAborted();

  return requestChat(request, signal, onText);
};

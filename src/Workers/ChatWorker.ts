import type { ChatWorkerRequest, StartChatRequest } from '../Types/ChatWorker';
import type { StreamChunk } from '../Types/Chat';

declare const self: DedicatedWorkerGlobalScope;

interface RequestState {
  controller: AbortController;
  cancelled: boolean;
  timedOut: boolean;
}

class ChatHttpError extends Error {
  constructor(
    readonly status: number,
    statusText: string
  ) {
    super(`HTTP ${status} ${statusText}`);
  }
}

/** Reads an optional field from untrusted JSON without assuming its response shape. */
const readField = (value: unknown, ...keys: (string | number)[]): unknown => {
  let current = value;
  for (const key of keys) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string | number, unknown>)[key];
  }
  return current;
};

const pickTextFromResponse = (data: unknown): string => {
  const candidates = [
    data,
    readField(data, 'response'),
    readField(data, 'text'),
    readField(data, 'data', 'text'),
    readField(data, 'choices', 0, 'message', 'content'),
    Array.isArray(data) ? data[0] : undefined,
  ];
  return candidates.find((value): value is string => typeof value === 'string') ?? '';
};

const inFlight = new Map<string, RequestState>();
const emit = (messageId: string, payload: Omit<StreamChunk, 'messageId'>) => self.postMessage({ messageId, ...payload });

const healthRequest = async (url: string, parentSignal: AbortSignal, timeoutMs: number): Promise<void> => {
  const controller = new AbortController();
  const abort = () => controller.abort();
  parentSignal.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(abort, timeoutMs);
  try {
    if (parentSignal.aborted) controller.abort();
    const response = await fetch(url, { signal: controller.signal });
    await response.text();
  } finally {
    clearTimeout(timeout);
    parentSignal.removeEventListener('abort', abort);
  }
};

const readEventStream = async (response: Response, messageId: string) => {
  if (!response.body) throw new Error('Missing response body');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = '',
    full = '',
    finished = false;
  const applyEvent = (raw: string) => {
    const text = raw
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n');
    if (!text) return;
    if (text === '[DONE]') {
      finished = true;
      return;
    }
    let value: unknown;
    try {
      value = JSON.parse(text);
    } catch {
      value = { delta: text };
    }
    if (readField(value, 'error')) throw new Error('Stream failed');
    const delta = readField(value, 'choices', 0, 'delta', 'content') ?? readField(value, 'delta') ?? readField(value, 'chunk');
    if (typeof delta === 'string') full += delta;
    else {
      const replacement = pickTextFromResponse(value);
      if (replacement) full = replacement;
    }
    emit(messageId, { text: full, streaming: true });
  };
  try {
    while (!finished) {
      const { value, done } = await reader.read();
      pending += decoder.decode(value, { stream: !done });
      let delimiter = /\r?\n\r?\n/.exec(pending);
      while (delimiter) {
        const event = pending.slice(0, delimiter.index);
        pending = pending.slice(delimiter.index + delimiter[0].length);
        applyEvent(event);
        if (finished) break;
        delimiter = /\r?\n\r?\n/.exec(pending);
      }
      if (done) {
        if (pending.trim()) applyEvent(pending);
        break;
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
  return { text: full, streaming: true };
};

const doChatCall = async (payload: StartChatRequest, controller: AbortController) => {
  const { query, history, apiKey, sessionId, apiUrl, messageId } = payload;
  const response = await fetch(apiUrl || '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(sessionId ? { 'X-Session-Id': sessionId } : {}) },
    body: JSON.stringify({ query, api_key: apiKey, history }),
    signal: controller.signal,
  });
  if (!response.ok) {
    const error = new ChatHttpError(response.status, response.statusText);
    // Upstream diagnostics may contain submitted credentials; do not echo the body.
    await response.body?.cancel().catch(() => {});
    throw error;
  }
  if (response.headers.get('content-type')?.includes('text/event-stream') && response.body) return readEventStream(response, messageId);
  const body = await response.text();
  let data: unknown;
  try {
    data = JSON.parse(body);
  } catch {
    data = { response: body };
  }
  const text = pickTextFromResponse(data);
  if (!text) throw new Error('AI did not return a response');
  return { text, streaming: false };
};

const handleStartMessage = async (msg: StartChatRequest): Promise<void> => {
  const { messageId, query, history, apiKey, healthUrl } = msg;
  if (!messageId || typeof messageId !== 'string') return;
  if (typeof query !== 'string' || !Array.isArray(history)) {
    emit(messageId, { error: 'Invalid payload (query/history).', done: true });
    return;
  }
  if (typeof apiKey !== 'string' || !apiKey.trim()) {
    emit(messageId, { errorKey: 'aiChat.apiKey.missingError', done: true });
    return;
  }
  const existing = inFlight.get(messageId);
  if (existing) {
    existing.cancelled = true;
    existing.controller.abort();
  }
  const controller = new AbortController();
  const state = { controller, cancelled: false, timedOut: false };
  inFlight.set(messageId, state);
  const timeout = setTimeout(() => {
    state.timedOut = true;
    controller.abort();
  }, 120000);
  try {
    let result;
    try {
      result = await doChatCall(msg, controller);
    } catch (error) {
      if (controller.signal.aborted || (error instanceof ChatHttpError && error.status < 500) || !healthUrl) throw error;
      const separator = healthUrl.includes('?') ? '&' : '?';
      await healthRequest(`${healthUrl}${separator}check=1`, controller.signal, 8000).catch(() => {});
      await healthRequest(`${healthUrl}${separator}wake=1`, controller.signal, 25000).catch(() => {});
      if (controller.signal.aborted) throw error;
      result = await doChatCall(msg, controller);
    }
    if (state.cancelled) {
      emit(messageId, { cancelled: true, done: true });
      return;
    }
    emit(messageId, { ...result, done: true });
  } catch (error) {
    if (state.cancelled) emit(messageId, { cancelled: true, done: true });
    else
      emit(messageId, {
        errorKey: 'aiChat.fetchFailed',
        errorDetail: state.timedOut ? 'Request timed out' : error instanceof Error ? error.message : '',
        done: true,
      });
  } finally {
    clearTimeout(timeout);
    if (inFlight.get(messageId) === state) inFlight.delete(messageId);
  }
};

self.addEventListener('message', (event: MessageEvent<ChatWorkerRequest>) => {
  const msg = event.data;
  if (!msg) return;
  if (msg.type === 'cancel') {
    const state = inFlight.get(msg.messageId);
    if (state) {
      state.cancelled = true;
      state.controller.abort();
    }
  } else if (msg.type === 'start') handleStartMessage(msg).catch(() => emit(msg.messageId, { errorKey: 'aiChat.fetchFailed', done: true }));
});

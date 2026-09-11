function pickTextFromResponse(data) {
  if (typeof data === 'string') return data;
  if (!data) return '';
  if (typeof data.response === 'string') return data.response;
  if (typeof data.text === 'string') return data.text;
  if (typeof data.data?.text === 'string') return data.data.text;
  if (typeof data.choices?.[0]?.message?.content === 'string') return data.choices[0].message.content;
  if (Array.isArray(data) && typeof data[0] === 'string') return data[0];
  return '';
}

const inFlight = new Map();
const emit = (messageId, payload) => self.postMessage({ messageId, ...payload });

async function healthRequest(url, parentSignal, timeoutMs) {
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
}

async function readEventStream(response, messageId) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let pending = '',
    full = '',
    finished = false;
  const applyEvent = (raw) => {
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
    let value;
    try {
      value = JSON.parse(text);
    } catch {
      value = { delta: text };
    }
    if (value.error) throw new Error('Stream failed');
    const delta = value.choices?.[0]?.delta?.content ?? value.delta ?? value.chunk;
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
      let delimiter;
      while ((delimiter = /\r?\n\r?\n/.exec(pending))) {
        const event = pending.slice(0, delimiter.index);
        pending = pending.slice(delimiter.index + delimiter[0].length);
        applyEvent(event);
        if (finished) break;
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
}

async function doChatCall(payload, controller) {
  const { query, history, apiKey, sessionId, apiUrl, messageId } = payload;
  const response = await fetch(apiUrl || '/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(sessionId ? { 'X-Session-Id': sessionId } : {}) },
    body: JSON.stringify({ query, api_key: apiKey, history }),
    signal: controller.signal,
  });
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status} ${response.statusText}`);
    error.status = response.status;
    // Upstream diagnostics may contain submitted credentials; do not echo the body.
    await response.body?.cancel().catch(() => {});
    throw error;
  }
  if (response.headers.get('content-type')?.includes('text/event-stream') && response.body) return readEventStream(response, messageId);
  const body = await response.text();
  let data;
  try {
    data = JSON.parse(body);
  } catch {
    data = { response: body };
  }
  const text = pickTextFromResponse(data);
  if (!text) throw new Error('AI did not return a response');
  return { text, streaming: false };
}

async function handleStartMessage(msg) {
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
      if (controller.signal.aborted || (error.status && error.status < 500) || !healthUrl) throw error;
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
        errorDetail: state.timedOut ? 'Request timed out' : error?.message || '',
        done: true,
      });
  } finally {
    clearTimeout(timeout);
    if (inFlight.get(messageId) === state) inFlight.delete(messageId);
  }
}

self.addEventListener('message', (event) => {
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

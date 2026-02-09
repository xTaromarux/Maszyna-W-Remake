function pickTextFromResponse(data) {
  if (!data) return '';
  if (typeof data.response === 'string') return data.response;
  if (typeof data.text === 'string') return data.text;
  if (data.data && typeof data.data.text === 'string') return data.data.text;
  if (Array.isArray(data) && typeof data[0] === 'string') return data[0];
  return '';
}

const API_URL = (() => {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || '';
  if (envUrl) return envUrl;

  const loc = typeof self !== 'undefined' && self.location ? self.location : { protocol: 'http:', hostname: 'localhost' };
  const { protocol, hostname } = loc;
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isDevHost = hostname === 'localhost' || isIp;

  return isDevHost ? `${protocol}//${hostname}:8787/api/chat` : '/api/chat';
})();

const HEALTH_URL = API_URL.replace(/\/api\/chat\/?$/, '/health');

const inFlight = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchJSONWithTimeout(url, opts = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { ...opts, signal: controller.signal });
    const contentType = resp.headers.get('content-type') || '';
    let body = null;
    if (contentType.includes('application/json')) {
      body = await resp.json().catch(() => ({}));
    } else {
      const txt = await resp.text().catch(() => '');
      try {
        body = JSON.parse(txt);
      } catch {
        body = { text: txt };
      }
    }
    return { ok: resp.ok, status: resp.status, body, headers: resp.headers };
  } finally {
    clearTimeout(timeoutId);
  }
}

function emit(messageId, payload) {
  self.postMessage({ messageId, ...payload });
}

async function doChatCall(payload, controller) {
  const { query, history, sessionId } = payload;
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionId ? { 'X-Session-Id': sessionId } : {}),
    },
    body: JSON.stringify({ query, history }),
    signal: controller.signal,
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status} ${response.statusText}${bodyText ? ` - ${bodyText}` : ''}`);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = { response: await response.text() };
  }

  return pickTextFromResponse(data) || '[AI did not return a response]';
}

async function handleStartMessage(msg) {
  const { messageId, query, history, sessionId } = msg;
  if (!messageId || typeof messageId !== 'string') return;
  if (typeof query !== 'string' || !Array.isArray(history)) {
    emit(messageId, { error: 'Invalid payload (query/history).', done: true });
    return;
  }

  const existing = inFlight.get(messageId);
  if (existing) {
    existing.cancelled = true;
    existing.controller.abort();
    inFlight.delete(messageId);
  }

  const controller = new AbortController();
  const state = { controller, cancelled: false };
  inFlight.set(messageId, state);

  try {
    let full = null;
    try {
      full = await doChatCall({ query, history, sessionId }, controller);
    } catch (firstErr) {
      if (controller.signal.aborted) throw firstErr;

      await fetchJSONWithTimeout(`${HEALTH_URL}?check=1`, { method: 'GET' }, 8000).catch(() => null);
      await fetchJSONWithTimeout(`${HEALTH_URL}?wake=1`, { method: 'GET' }, 25000).catch(() => null);

      if (controller.signal.aborted) throw firstErr;
      await sleep(1500);

      full = await doChatCall({ query, history, sessionId }, controller);
    }

    if (controller.signal.aborted || state.cancelled) {
      emit(messageId, { cancelled: true, done: true });
      return;
    }

    emit(messageId, { text: full, done: true });
  } catch (err) {
    if (controller.signal.aborted || state.cancelled) {
      emit(messageId, { cancelled: true, done: true });
      return;
    }

    emit(messageId, { errorKey: 'aiChat.fetchFailed', errorDetail: err?.message || '', done: true });
  } finally {
    inFlight.delete(messageId);
  }
}

function handleCancelMessage(msg) {
  const { messageId } = msg || {};
  if (!messageId || typeof messageId !== 'string') return;
  const state = inFlight.get(messageId);
  if (!state) return;
  state.cancelled = true;
  state.controller.abort();
}

self.addEventListener('message', (event) => {
  const msg = event.data;
  if (!msg) return;
  if (msg.type === 'cancel') {
    handleCancelMessage(msg);
    return;
  }
  if (msg.type === 'start') {
    handleStartMessage(msg).catch((err) => {
      // eslint-disable-next-line no-console
      console.error('Worker start handler failed', err);
    });
  }
});



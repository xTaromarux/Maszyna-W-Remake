// workers/chat.worker.js

let currentAbort = null;

function pickTextFromResponse(data) {
  if (!data) return '';
  if (typeof data.response === 'string') return data.response; // FastAPI ChatResponse
  if (typeof data.text === 'string') return data.text;
  if (data.data && typeof data.data.text === 'string') return data.data.text;
  if (Array.isArray(data) && typeof data[0] === 'string') return data[0];
  return '';
}

// Autodetekcja URL backendu proxy (dev: :8787, prod: /api/chat)
const API_URL = (() => {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || '';
  if (envUrl) return envUrl;

  const loc = (typeof self !== 'undefined' && self.location) ? self.location : { protocol: 'http:', hostname: 'localhost' };
  const { protocol, hostname } = loc;
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isDevHost = hostname === 'localhost' || isIp;

  return isDevHost ? `${protocol}//${hostname}:8787/api/chat` : '/api/chat';
})();

self.onmessage = async (e) => {
  const msg = e.data;

  // anulowanie
  if (msg?.type === 'cancel') {
    if (currentAbort) currentAbort.abort();
    currentAbort = null;
    return;
  }

  const { query, history, aiIndex, sessionId } = msg;
  if (typeof query !== 'string' || !Array.isArray(history)) {
    self.postMessage({ aiIndex, char: '⚠️ Invalid payload (query/history).', done: true });
    return;
  }

  // przerwij ewentualne poprzednie żądanie
  if (currentAbort) currentAbort.abort();
  currentAbort = new AbortController();

  try {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId ? { 'X-Session-Id': sessionId } : {})
      },
      // FastAPI w Space oczekuje { query, history }
      body: JSON.stringify({ query, history }),
      signal: currentAbort.signal
    });

    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      throw new Error(`HTTP ${resp.status} ${resp.statusText}${txt ? ` - ${txt}` : ''}`);
    }

    // FastAPI zwraca JSON { response, timestamp }
    let data = null;
    try { data = await resp.json(); }
    catch { data = { response: await resp.text() }; }

    const full = pickTextFromResponse(data) || '[AI did not return a response]';

    for (let i = 0; i < full.length; i++) {
      if (!currentAbort || currentAbort.signal.aborted) break;
      self.postMessage({ aiIndex, char: full[i] });
      await new Promise((r) => setTimeout(r, 20));
    }

    self.postMessage({ aiIndex, done: true });
  } catch (err) {
    if (currentAbort && currentAbort.signal.aborted) {
      self.postMessage({ aiIndex, done: true });
      return;
    }
    const errMsg = `⚠️ Failed to get response from AI. ${err?.message || ''}`.trim();
    for (let i = 0; i < errMsg.length; i++) {
      self.postMessage({ aiIndex, char: errMsg[i] });
      await new Promise((r) => setTimeout(r, 40));
    }
    self.postMessage({ aiIndex, done: true });
  } finally {
    currentAbort = null;
  }
};

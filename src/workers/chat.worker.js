let currentAbort = null;
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
  const loc = (typeof self !== 'undefined' && self.location) ? self.location : { protocol: 'http:', hostname: 'localhost' };
  const { protocol, hostname } = loc;
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isDevHost = hostname === 'localhost' || isIp;

  return isDevHost ? `${protocol}//${hostname}:8787/api/chat` : '/api/chat';
})();
const HEALTH_URL = API_URL.replace(/\/api\/chat\/?$/, '/health');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function fetchJSONWithTimeout(url, opts = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, { ...opts, signal: controller.signal });
    const ct = r.headers.get('content-type') || '';
    let body = null;
    if (ct.includes('application/json')) {
      body = await r.json().catch(() => ({}));
    } else {
      const txt = await r.text().catch(() => '');
      try { body = JSON.parse(txt); } catch { body = { text: txt }; }
    }
    return { ok: r.ok, status: r.status, body, headers: r.headers };
  } finally {
    clearTimeout(t);
  }
}
self.onmessage = async (e) => {
  const msg = e.data;
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
  if (currentAbort) currentAbort.abort();
  currentAbort = new AbortController();
  const doChatCall = async () => {
    const resp = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId ? { 'X-Session-Id': sessionId } : {})
      },
      body: JSON.stringify({ query, history }),
      signal: currentAbort.signal
    });
    if (!resp.ok) {
      const txt = await resp.text().catch(() => '');
      throw new Error(`HTTP ${resp.status} ${resp.statusText}${txt ? ` - ${txt}` : ''}`);
    }
    let data = null;
    try { data = await resp.json(); }
    catch { data = { response: await resp.text() }; }
    return pickTextFromResponse(data) || '[AI did not return a response]';
  };
  try {
    let full = null;
    try {
      full = await doChatCall();
    } catch (firstErr) {
      if (currentAbort?.signal?.aborted) throw firstErr;
      await fetchJSONWithTimeout(`${HEALTH_URL}?check=1`, { method: 'GET' }, 8000).catch(() => null);
      await fetchJSONWithTimeout(`${HEALTH_URL}?wake=1`,  { method: 'GET' }, 25000).catch(() => null);
      if (currentAbort?.signal?.aborted) throw firstErr;
      await sleep(1500);
      full = await doChatCall();
    }
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
    const errMsg = `⚠️ Nie udało się pobrać odpowiedzi od AI. ${err?.message || ''}`.trim();
    for (let i = 0; i < errMsg.length; i++) {
      self.postMessage({ aiIndex, char: errMsg[i] });
      await new Promise((r) => setTimeout(r, 40));
    }
    self.postMessage({ aiIndex, done: true });
  } finally {
    currentAbort = null;
  }
};
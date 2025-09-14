import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'

const app = express()

const PORT = process.env.PORT || 8787
const RAW_URL = process.env.HF_TARGET_URL || ''       // np. https://huggingface.co/spaces/marcsixtysix/rag_chat_
const HF_SPACE = process.env.HF_SPACE || ''           // alternatywnie: marcsixtysix/rag_chat_
const ORIGINS = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean)
const BODY_LIMIT = (Number(process.env.BODY_LIMIT_MB) || 2) + 'mb'

function normalizeUpstream(rawUrl, spaceSlug) {
  let url = rawUrl?.trim() || ''
  // Jeśli podano slug "owner/space" — zbuduj URL *.hf.space/chat
  if (!url && spaceSlug) {
    const [owner, space] = spaceSlug.split('/')
    const sub = `${owner}-${space}`.replace(/_/g, '-')
    return `https://${sub}.hf.space/chat`
  }
  // Jeśli ktoś podał huggingface.co/spaces/owner/space[/coś] => przerób na *.hf.space/chat
  const m = url.match(/^https?:\/\/huggingface\.co\/spaces\/([^/]+)\/([^/]+)(?:\/.*)?$/i)
  if (m) {
    const owner = m[1]
    const space = m[2]
    const sub = `${owner}-${space}`.replace(/_/g, '-')
    url = `https://${sub}.hf.space/chat`
  }
  // Dołóż /chat, jeśli brakuje
  if (url && !/\/chat\/?$/.test(url)) {
    url = url.replace(/\/+$/,'') + '/chat'
  }
  return url
}

const UPSTREAM = normalizeUpstream(RAW_URL, HF_SPACE)

app.use(express.json({ limit: BODY_LIMIT }))

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    if (ORIGINS.includes(origin)) return cb(null, true)
    cb(new Error('Not allowed by CORS: ' + origin))
  },
  methods: ['GET', 'POST', 'OPTIONS'],                    // ⟵ dopuszczamy też GET (dla /health)
  allowedHeaders: ['Content-Type', 'X-Session-Id', 'Authorization'],
  credentials: false
}))

const limiter = rateLimit({
  windowMs: 60_000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false
})
app.use('/api/chat', limiter)

app.options('/api/chat', (req, res) => res.sendStatus(204))

// Prosty helper do fetch z timeoutem
async function fetchWithTimeout(url, opts = {}, timeoutMs = 15000) {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const r = await fetch(url, { ...opts, signal: controller.signal })
    return r
  } finally {
    clearTimeout(t)
  }
}

// Health: sprawdź i opcjonalnie „obudź” upstream
app.get('/health', async (req, res) => {
  const wake = String(req.query.wake || '0') === '1'
  const info = {
    ok: true,
    upstream: UPSTREAM,
    upstream_ok: null,
    woke: false,
    status: null,
  }

  if (!UPSTREAM) {
    info.upstream_ok = false
    info.status = 'NO_UPSTREAM_SET'
    return res.json(info)
  }

  try {
    // „Lekkie” POST, takie samo body jak /api/chat; to też „budzi” Space (cold start)
    const r = await fetchWithTimeout(UPSTREAM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: wake ? '' : '[health-check]', history: [] })
    }, wake ? 25000 : 10000) // przy wake daj trochę więcej czasu

    info.upstream_ok = r.ok
    info.status = `HTTP_${r.status}`
    info.woke = wake && r.ok
    const ct = r.headers.get('content-type') || ''
    if (ct.includes('application/json')) {
      // przeczytaj, ale nie zwracaj odpowiedzi – tylko diagnostyka
      await r.json().catch(() => {})
    } else {
      await r.text().catch(() => {})
    }
  } catch (e) {
    info.upstream_ok = false
    info.status = 'FETCH_ERROR'
    info.detail = String(e.message || e)
  }

  res.json(info)
})

app.post('/api/chat', async (req, res) => {
  try {
    if (!UPSTREAM) {
      return res.status(500).json({ error: 'UPSTREAM_URL_NOT_SET', hint: 'Ustaw HF_TARGET_URL lub HF_SPACE' })
    }

    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 60_000)

    const r = await fetch(UPSTREAM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Space FastAPI oczekuje { query: string, history: [...] }
      body: JSON.stringify({ query: req.body?.query || '', history: req.body?.history || [] }),
      signal: controller.signal
    }).catch(e => { throw new Error('Upstream fetch failed: ' + e.message) })

    clearTimeout(t)
    const ct = r.headers.get('content-type') || 'application/json'
    const text = await r.text()
    res.status(r.status).type(ct).send(text)
  } catch (e) {
    res.status(502).json({ error: 'Bad gateway', detail: String(e) })
  }
})

app.listen(PORT, () => {
  console.log(`HF proxy listening on :${PORT}`)
  console.log(`Upstream: ${UPSTREAM || '(not set)'}`)
})

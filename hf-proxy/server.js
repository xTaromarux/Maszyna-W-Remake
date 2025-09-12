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
  methods: ['POST', 'OPTIONS'],
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

app.get('/health', (req, res) => res.json({ ok: true, upstream: UPSTREAM }))

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

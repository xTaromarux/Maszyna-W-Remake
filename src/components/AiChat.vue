<template>
  <div
    v-if="isHide"
    class="chatOverlay"
    @click.self="startClose"
    :class="{ show: isHide, isHide: !isHide }"
  >
    <div
      id="aiChat"
      class="chatPanel"
      @click.stop
      :class="{ show: visible, hide: !visible }"
      :style="{ width: panelWidth + 'px' }"
    >
      <div class="resizer" @mousedown="startResize"></div>

      <header class="chatHeader">
        <h1>{{ title }}</h1>
        <div class="headerBtns">
          <button class="resetBtn" @click="resetConversation" aria-label="Resetuj czat">
            <AiChatTrashIcon width="22" height="22" class="trashIcon" />
          </button>
          <button class="closeBtn" @click="startClose" aria-label="Zamknij czat">&times;</button>
        </div>
      </header>

      <div id="conversation" ref="conversationEl">
        <!-- BANER zdrowia/wzbudzania -->
        <div v-if="apiState==='checking' || apiState==='waking'" class="healthBanner">
          <span v-if="apiState==='checking'">Sprawdzam połączenie z modelem…</span>
          <span v-else>Wybudzam model na Hugging Face…</span>
          <span class="dots"><span></span><span></span><span></span></span>
        </div>

        <transition-group name="messageEnter" tag="div" class="conversationBox">
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="messageBubble"
            :class="{ messageUser: msg.sender === 'user', messageAi: msg.sender === 'assistant' }"
          >
            <div class="iconWrapper">
              {{ msg.sender === 'assistant' ? '🤖' : '' }}
            </div>
            <div class="messageContent">
              <div class="messageHeader">
                <span class="senderName">{{ msg.sender === 'assistant' ? 'AI' : 'Ty' }}</span>
                <span
                  class="timestamp"
                  :class="{ timestampAssistant: msg.sender === 'assistant' && aiTyping && i===currentAiIndex }"
                >
                  {{ formatTime(msg.timestamp) }}
                </span>
                <button
                  v-if="msg.sender==='assistant' && aiTyping && i===currentAiIndex"
                  class="cancelBtn"
                  @click="cancelResponse"
                  aria-label="Anuluj odpowiedź"
                >×</button>
              </div>

              <div class="messageText" :class="{ messageTextAssistant: msg.sender === 'assistant' }">
                <template v-if="msg.sender === 'assistant' && aiTyping && i === currentAiIndex && !msg.text">
                  <span class="typing"><span></span><span></span><span></span></span>
                </template>

                <template v-else-if="msg.sender === 'assistant'">
                  <div class="messageHtml" v-html="renderMessage(msg.text)" @click="onMessageHtmlClick"></div>
                </template>

                <template v-else>
                  {{ msg.text }}
                </template>
              </div>
            </div>
          </div>
        </transition-group>
      </div>

      <div class="inputArea">
        <p class="inputInstruction">{{ instruction }}</p>
        <form @submit.prevent="sendUserMessage">
          <input
            ref="textInput"
            v-model="text"
            :placeholder="placeholder"
            type="text"
            :disabled="aiTyping || apiState==='checking' || apiState==='waking'"
          />
          <button class="execution-btn execution-btn--run" type="submit" :disabled="aiTyping || apiState==='checking' || apiState==='waking'">Wyślij</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import AiChatTrashIcon from '@/components/AiChatTrashIcon.vue'

const chatWorker = new Worker(new URL('@/workers/chat.worker.js', import.meta.url), { type: 'module' })

const isHide = ref(false)
const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: 'Asystent AI' },
  placeholder: { type: String, default: 'Napisz wiadomość…' },
  instruction: { type: String, default: 'Opisz operację, aby otrzymać kod maszynowy:' }
})
const emit = defineEmits(['close'])

function startClose() {
  emit('close')
  setTimeout(() => { isHide.value = false }, 1000)
}

const STORAGE_KEY = 'aiChatMessages'
const WIDTH_KEY   = 'aiChatPanelWidth'
const SESSION_KEY = 'aiChatSessionId'

const messages = ref([])
const textInput = ref(null)
const text = ref('')
const aiTyping = ref(false)
const conversationEl = ref(null)
const requestTimestamps = ref([])
const typingTimer = ref(null)
const currentAiIndex = ref(null)
const panelWidth = ref(Number(localStorage.getItem(WIDTH_KEY)) || 650)

/* ====== HEALTH / WAKE ====== */
const apiState = ref('idle') // 'idle' | 'checking' | 'waking'

const API_URL = import.meta.env.VITE_API_URL || ''
const HEALTH_URL = API_URL ? API_URL.replace(/\/api\/chat\/?$/, '/health') : ''

async function healthCheckAndWake() {
  try {
    apiState.value = 'checking'
    const r = await fetch(`${HEALTH_URL}?check=1`)
    const j = await r.json().catch(() => ({}))
    if (j && j.upstream_ok === false) {
      apiState.value = 'waking'
      // „szturchnięcie” Space po stronie backendu
      await fetch(`${HEALTH_URL}?wake=1`)
      // odczekaj chwilę na cold start
      await new Promise(res => setTimeout(res, 1200))
    }
  } catch (_) {
    // cicho – worker i tak ma własny retry
  } finally {
    // nie chowaj banera natychmiast (krótka „miękka” pauza)
    setTimeout(() => { apiState.value = 'idle' }, 600)
  }
}

/* =========================
   AUTOSCROLL (z throttlingiem)
   ========================= */
let rafQueued = false
function scrollToBottom(behavior = 'auto') {
  const el = conversationEl.value
  if (!el) return
  el.scrollTo({ top: el.scrollHeight, behavior })
}
function scheduleScroll(behavior = 'auto') {
  if (rafQueued) return
  rafQueued = true
  requestAnimationFrame(() => {
    rafQueued = false
    nextTick(() => scrollToBottom(behavior))
  })
}

/* Worker: dopisuje znaki i przewija w dół */
chatWorker.onmessage = (e) => {
  const { aiIndex, char, done } = e.data
  const msg = messages.value[aiIndex]
  if (!msg) return
  if (char) {
    msg.text += char
    scheduleScroll('auto')
  }
  if (done) {
    aiTyping.value = false
    currentAiIndex.value = null
    scheduleScroll('smooth')
  }
}

const sessionId = (() => {
  let s = localStorage.getItem(SESSION_KEY)
  if (!s) {
    s = Math.random().toString(36).slice(2) + Date.now()
    localStorage.setItem(SESSION_KEY, s)
  }
  return s
})()

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try { messages.value = JSON.parse(saved) } catch { messages.value = [] }
  }
  nextTick(() => scheduleScroll('auto'))
})

watch(() => props.visible, (newVal) => {
  if (newVal) {
    isHide.value = true
    // dajemy chwilę na animację i render, potem focus + scroll
    nextTick(() => {
      setTimeout(() => {
        textInput.value?.focus()
        scheduleScroll('auto')
      }, 250)
    })
  }
})

watch(messages, (msgs) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs))
}, { deep: true })

watch(panelWidth, (w) => localStorage.setItem(WIDTH_KEY, String(w)))

// RESET
const resetConversation = () => {
  messages.value = []
  localStorage.removeItem(STORAGE_KEY)
  requestTimestamps.value = []
  cancelResponse()
  scheduleScroll('auto')
}

const formatTime = (ts) =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

// === RENDEROWANIE KODU + KOPIOWANIE ===
const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;')
   .replace(/</g, '&lt;')
   .replace(/>/g, '&gt;')
   .replace(/"/g, '&quot;')
   .replace(/'/g, '&#39;')

// Bloki z toolbar'em NAD kodem (poza ramką)
function renderMessage(text) {
  if (!text) return ''
  let out = escapeHtml(text)

  // wytnij bloki ```lang?\n...\n```
  const blocks = []
  out = out.replace(/```([^\n`]*)?\r?\n([\s\S]*?)```/g, (_, lang, code) => {
    const id = blocks.length
    blocks.push({ lang: (lang || '').trim(), code })
    return `%%CODEBLOCK_${id}%%`
  })

  // inline `code`
  out = out.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>')

  // zwykłe nowe linie
  out = out.replace(/\r?\n/g, '<br>')

  // wstaw grupę: TOOLBAR (nad) + PRE (ramka tylko na PRE)
  blocks.forEach((b, i) => {
    const lang = b.lang ? `<span class="code-lang">${b.lang}</span>` : `<span class="code-lang no-lang">kod</span>`
    const toolbar = `<div class="code-toolbar-outside">${lang}<button type="button" class="copy-btn" aria-label="Skopiuj kod">Kopiuj</button></div>`
    const pre = `<pre class="code-block"><code>${b.code}</code></pre>`
    const group = `<div class="code-group">${toolbar}${pre}</div>`
    out = out.replace(`%%CODEBLOCK_${i}%%`, group)
  })

  return out
}

// Delegacja kliknięcia dla "Kopiuj"
function onMessageHtmlClick(e) {
  const btn = e.target.closest('.copy-btn')
  if (!btn) return
  const group = btn.closest('.code-group')
  const codeEl = group?.querySelector('pre.code-block > code')
  const text = codeEl?.innerText || codeEl?.textContent || ''
  if (!text) return

  const done = () => {
    const original = btn.textContent
    btn.textContent = 'Skopiowano!'
    btn.disabled = true
    btn.classList.add('copied')
    setTimeout(() => {
      btn.textContent = original
      btn.disabled = false
      btn.classList.remove('copied')
    }, 1200)
  }

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done))
  } else {
    fallbackCopy(text, done)
  }
}

function fallbackCopy(text, done) {
  const ta = document.createElement('textarea')
  ta.value = text
  document.body.appendChild(ta)
  ta.select()
  try { document.execCommand('copy'); done() } finally { document.body.removeChild(ta) }
}

async function sendUserMessage() {
  const now = Date.now()
  requestTimestamps.value = requestTimestamps.value.filter(ts => now - ts < 60000)
  if (requestTimestamps.value.length >= 20) {
    alert('Limit 20 zapytań na minutę. Spróbuj ponownie później.')
    return
  }
  if (!text.value.trim() || aiTyping.value || apiState.value==='checking' || apiState.value==='waking') return
  requestTimestamps.value.push(now)

  const userQuery = text.value.trim()
  messages.value.push({ sender: 'user', text: userQuery, timestamp: now })
  text.value = ''
  scheduleScroll('smooth')

  // pre-check /health + ewentualny „wake”
  await healthCheckAndWake()

  aiTyping.value = true
  messages.value.push({ sender: 'assistant', text: '', timestamp: Date.now() })
  const aiIndex = messages.value.length - 1
  currentAiIndex.value = aiIndex
  scheduleScroll('smooth')

  const prior = messages.value.slice(0, Math.max(0, messages.value.length - 2))
  const history = prior
    .filter(m => m.text && m.text.trim() !== '')
    .map(m => ({
      role: m.sender === 'assistant' ? 'assistant' : 'user',
      message: m.text
    }))
  chatWorker.postMessage({ query: userQuery, history, aiIndex, sessionId })
}

function cancelResponse() {
  if (typingTimer.value) {
    clearInterval(typingTimer.value)
    typingTimer.value = null
  }
  if (currentAiIndex.value !== null) {
    messages.value.splice(currentAiIndex.value, 1)
    currentAiIndex.value = null
  }
  try { chatWorker.postMessage({ type: 'cancel' }) } catch {}
  aiTyping.value = false
  scheduleScroll('auto')
}

/* Dodatkowa asekuracja: gdy zmienia się liczba wiadomości — doscrolluj */
watch(
  () => messages.value.length,
  () => nextTick(() => scheduleScroll('auto'))
)

let startX = 0
let startWidth = 0

function startResize(e) {
  startX = e.clientX
  startWidth = panelWidth.value
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup',   stopResize)
}

function onMouseMove(e) {
  const delta = startX - e.clientX
  let newWidth = startWidth + delta
  newWidth = Math.min(Math.max(newWidth, 500), 1000)
  panelWidth.value = newWidth
}

function stopResize() {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup',   stopResize)
}

onBeforeUnmount(() => {
  stopResize()
  chatWorker.terminate()
})
</script>

<style scoped>
/* grupa: toolbar nad kodem + sam blok kodu */
.messageHtml :deep(.code-group) {
  margin: .6rem 0;
}

/* TOOLBAR NAD kodem (poza ramką) */
.messageHtml :deep(.code-toolbar-outside) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .5rem;
  padding: 0 0 .35rem;
  background: transparent;
}

.messageHtml :deep(.code-lang) {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: .04em;
  color: #6b7280;
}
.messageHtml :deep(.code-lang.no-lang) { opacity: .6; }

.messageHtml :deep(.copy-btn) {
  appearance: none;
  border: 3px solid #003c7d;
  background: var(--panelBackgroundColor, #ffffff);
  color: var(--fontColor, black);
  font-size: 0.8rem;
  padding: .25rem .6rem;
  border-radius: 6px;
  outline: none;
  cursor: pointer;
}
.messageHtml :deep(.copy-btn:hover) { background: #f3f4f6; }
.messageHtml :deep(.copy-btn.copied) {
  background: #d1fae5;
  border-color: #10b981;
  color: #065f46;
}

/* RAMKA tylko na PRE (kod) */
.messageHtml :deep(.code-block) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  background: #0f172a;
  color: #e5e7eb;
  border-radius: 8px;
  padding: 0.8rem 1rem;
  overflow: auto;
  line-height: 1.45;
  border: 1px solid #1f2937;
}

/* inline code */
.messageHtml :deep(.inline-code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  background: var(--panelBackgroundColor, #ffffff);
  border: 1px solid #e1e4e8;
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
  font-size: 0.95em;
}

/* drobne marginesy */
.messageText :deep(pre),
.messageText :deep(code),
.messageText :deep(.code-toolbar-outside) {
  margin-top: .2rem;
  margin-bottom: .2rem;
}

/* BANER stanu /health */
.healthBanner{
  margin: .4rem 0 .6rem;
  padding: .5rem .75rem;
  border: 1px dashed var(--signal-active,#0ea5e9);
  background: color-mix(in srgb, var(--panelBackgroundColor,#fff) 85%, #0ea5e9);
  border-radius: 8px;
  font-size: .9rem;
  display:flex; align-items:center; gap:.5rem;
}
.healthBanner .dots{ display:inline-flex; gap:.2rem }
.healthBanner .dots span{
  width:6px;height:6px;border-radius:50%;background:#0e7490;opacity:.3;animation:blink 1.4s infinite;
}
.healthBanner .dots span:nth-child(2){ animation-delay:.2s }
.healthBanner .dots span:nth-child(3){ animation-delay:.4s }
@keyframes blink{ 0%,80%,100%{opacity:.2} 40%{opacity:1} }
</style>

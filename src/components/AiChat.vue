<template>
  <div v-if="props.visible" class="chatOverlay" @click.self="startClose">
    <div id="aiChat" class="chatPanel" @click.stop :class="{ show: props.visible }" :style="{ width: panelWidth + 'px' }">
      <div class="resizer" @mousedown="startResize"></div>

      <header class="chatHeader">
        <h1>{{ props.title }}</h1>
        <div class="headerBtns">
          <button class="resetBtn" @click="resetConversation" :aria-label="$t('aiChat.resetAria')">
            <AiChatTrashIcon width="22" height="22" class="trashIcon" />
          </button>
          <button class="closeBtn" @click="startClose" :aria-label="$t('aiChat.closeAria')">&times;</button>
        </div>
      </header>

      <div id="conversation" ref="conversationEl">
        <div v-if="apiState === ApiState.CHECKING || apiState === ApiState.WAKING" class="healthBanner">
          <span v-if="apiState === ApiState.CHECKING">{{ $t('aiChat.checking') }}</span>
          <span v-else>{{ $t('aiChat.waking') }}</span>
          <span class="dots"><span></span><span></span><span></span></span>
        </div>

        <div v-if="shouldShowSuggestions" class="suggestionPanel">
          <div class="suggestionHeader">
            <span class="suggestionTitle">{{ $t('aiChat.suggestions.title') }}</span>
            <button class="suggestionClose" type="button" @click="dismissSuggestions" :aria-label="$t('aiChat.suggestions.closeAria')">
              &times;
            </button>
          </div>
          <div class="suggestionGrid">
            <button v-for="item in suggestions" :key="item.id" class="suggestionTile" type="button" @click="applySuggestion(item.text)">
              <span class="suggestionText">{{ item.text }}</span>
            </button>
          </div>
        </div>

        <transition-group name="messageEnter" tag="div" class="conversationBox">
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="messageBubble"
            :class="{ messageUser: msg.sender === 'user', messageAi: msg.sender === 'assistant' }"
          >
            <div class="iconWrapper">
              {{ msg.sender === 'assistant' ? '🤖' : '' }}
            </div>
            <div class="messageContent">
              <div class="messageHeader">
                <span class="senderName">{{ msg.sender === 'assistant' ? $t('aiChat.senderAi') : $t('aiChat.senderUser') }}</span>
                <span
                  class="timestamp"
                  :class="{ timestampAssistant: msg.sender === 'assistant' && aiTyping && msg.id === currentAiMessageId }"
                >
                  {{ formatTime(msg.timestamp) }}
                </span>
                <button
                  v-if="msg.sender === 'assistant' && aiTyping && msg.id === currentAiMessageId"
                  class="cancelBtn"
                  type="button"
                  @click="cancelResponse"
                  :disabled="isCancelling"
                  :aria-label="$t('aiChat.cancel')"
                >
                  &times;
                </button>
              </div>
              <div class="messageText" :class="{ messageTextAssistant: msg.sender === 'assistant' }">
                <template v-if="msg.sender === 'assistant' && aiTyping && msg.id === currentAiMessageId && !msg.text">
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
        <p class="inputInstruction">{{ props.instruction }}</p>
        <p v-if="rateLimitMessage" class="inputError">{{ rateLimitMessage }}</p>
        <p v-else-if="generalError" class="inputError">{{ generalError }}</p>
        <form @submit.prevent="sendUserMessage">
          <input ref="textInput" v-model="text" :placeholder="props.placeholder" type="text" :disabled="isBusy" />
          <button class="execution-btn execution-btn--run" type="submit" :disabled="isBusy">{{ $t('aiChat.send') }}</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AiChatTrashIcon from '@/components/AiChatTrashIcon.vue';
import {
  ApiState,
  STORAGE_KEY,
  STORAGE_VERSION,
  STORAGE_VERSION_KEY,
  WIDTH_KEY,
  SESSION_KEY,
  HISTORY_LIMIT,
  SAVE_DEBOUNCE_MS,
  RATE_LIMIT,
} from '@/models/AiChat';

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: 'Asystent AI' },
  placeholder: { type: String, default: 'Napisz wiadomość…' },
  instruction: { type: String, default: 'Opisz operację, aby otrzymać kod maszynowy:' },
});

const emit = defineEmits(['close']);

const messages = ref([]);
const text = ref('');
const aiTyping = ref(false);
const isCancelling = ref(false);
const conversationEl = ref(null);
const textInput = ref(null);
const apiState = ref(ApiState.IDLE);
const currentAiMessageId = ref(null);
const panelWidth = ref(650);
const rateLimitMessage = ref('');
const generalError = ref('');
const requestTimestamps = ref([]);
const sessionId = ref('');
const showSuggestions = ref(true);

const API_URL = import.meta.env.VITE_API_URL || '';
const HEALTH_URL = API_URL ? API_URL.replace(/\/api\/chat\/?$/, '/health') : '';
const { t } = useI18n();

const isBusy = computed(
  () => aiTyping.value || isCancelling.value || apiState.value === ApiState.CHECKING || apiState.value === ApiState.WAKING
);
const suggestions = computed(() => [
  { id: 'what-is-w', text: t('aiChat.suggestions.items.whatIsW') },
  { id: 'add-two', text: t('aiChat.suggestions.items.addTwoNumbers') },
  { id: 'first-program', text: t('aiChat.suggestions.items.firstProgram') },
]);
const shouldShowSuggestions = computed(() => showSuggestions.value && messages.value.length === 0);

const MIN_WIDTH = 480;
const MAX_WIDTH = 1000;

let worker = null;
let saveTimer = null;
let widthSaveTimer = null;
let rateLimitTimer = null;
let healthToken = 0;
let isResizing = false;
const animationStates = new Map();
const animationPromises = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function startClose() {
  emit('close');
}

function dismissSuggestions() {
  showSuggestions.value = false;
}

function applySuggestion(value) {
  if (!value) return;
  text.value = value;
  nextTick(() => {
    textInput.value?.focus();
  });
}

function generateId(prefix = 'msg') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2)}${Date.now()}`;
}

function ensureWorker() {
  if (worker) return worker;
  worker = new Worker(new URL('@/workers/chat.worker.js', import.meta.url), { type: 'module' });
  worker.addEventListener('message', handleWorkerMessage);
  return worker;
}

function findMessage(messageId) {
  return messages.value.find((msg) => msg.id === messageId) || null;
}

const TYPEWRITER_CHARS = 50;
const TYPEWRITER_DELAY_MS = 30;

function stopMessageAnimation(messageId) {
  const state = animationStates.get(messageId);
  if (!state) return;
  state.finish();
}

function stopAllAnimations() {
  const ids = Array.from(animationStates.keys());
  ids.forEach((id) => stopMessageAnimation(id));
}

/**
 * Visual-only typewriter effect for assistant replies. We may replace this with real
 * streaming in the future, at which point chunking/scheduling would move back to the worker.
 */
function playMessageAnimation(message, fullText) {
  stopMessageAnimation(message.id);

  const textValue = fullText || '';
  if (!textValue) {
    message.text = '';
    return Promise.resolve();
  }

  const chunks = [];
  for (let i = 0; i < textValue.length; i += TYPEWRITER_CHARS) {
    chunks.push(textValue.slice(i, i + TYPEWRITER_CHARS));
  }

  return new Promise((resolve) => {
    let index = 0;
    message.text = '';
    let finished = false;
    const state = {
      timer: null,
      finish: () => {
        if (finished) return;
        finished = true;
        if (state.timer !== null) {
          clearInterval(state.timer);
        }
        animationStates.delete(message.id);
        resolve();
      },
    };

    const applyChunk = () => {
      if (finished || index >= chunks.length) {
        state.finish();
        return;
      }
      message.text += chunks[index];
      index += 1;
      if (index >= chunks.length) {
        state.finish();
      }
    };

    animationStates.set(message.id, state);
    applyChunk();

    if (!finished) {
      state.timer = setInterval(() => {
        applyChunk();
        if (finished) {
          clearInterval(state.timer);
        }
      }, TYPEWRITER_DELAY_MS);
    }
  });
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);

  saveTimer = setTimeout(() => {
    try {
      if (!messages.value.length) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
        return;
      }
      const trimmed = messages.value.slice(-HISTORY_LIMIT);
      const payload = { version: STORAGE_VERSION, messages: trimmed };
      localStorage.setItem(STORAGE_VERSION_KEY, String(STORAGE_VERSION));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
  }, SAVE_DEBOUNCE_MS);
}

function scheduleWidthPersist() {
  if (widthSaveTimer) clearTimeout(widthSaveTimer);
  widthSaveTimer = setTimeout(() => {
    try {
      localStorage.setItem(WIDTH_KEY, String(panelWidth.value));
    } catch {}
  }, 120);
}

function restorePanelWidth() {
  try {
    const saved = Number(localStorage.getItem(WIDTH_KEY));
    if (!Number.isNaN(saved)) {
      panelWidth.value = Math.min(Math.max(saved, MIN_WIDTH), MAX_WIDTH);
    }
  } catch {
    panelWidth.value = 650;
  }
}

function ensureSession() {
  try {
    let stored = localStorage.getItem(SESSION_KEY);
    if (!stored) {
      stored = generateId('session');
      localStorage.setItem(SESSION_KEY, stored);
    }
    sessionId.value = stored;
  } catch {
    sessionId.value = generateId('session');
  }
}

function loadPersistedMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    let parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      parsed = { messages: parsed };
    }
    if (!parsed || !Array.isArray(parsed.messages)) return;

    messages.value = parsed.messages.slice(-HISTORY_LIMIT).map((msg, index) => ({
      id: typeof msg.id === 'string' ? msg.id : generateId(`legacy-${index}`),
      sender: msg.sender === 'assistant' ? 'assistant' : 'user',
      text: typeof msg.text === 'string' ? msg.text : '',
      timestamp: typeof msg.timestamp === 'number' ? msg.timestamp : Date.now(),
    }));
  } catch {
    messages.value = [];
  }
}

let rafQueued = false;
function scrollToBottom(behavior = 'auto') {
  const el = conversationEl.value;
  if (!el) return;
  el.scrollTo({ top: el.scrollHeight, behavior });
}

function scheduleScroll(behavior = 'auto') {
  if (rafQueued) return;
  rafQueued = true;

  requestAnimationFrame(() => {
    rafQueued = false;
    nextTick(() => scrollToBottom(behavior));
  });
}

function setRateLimitNotice(message) {
  rateLimitMessage.value = message;
  if (rateLimitTimer) clearTimeout(rateLimitTimer);

  rateLimitTimer = setTimeout(() => {
    rateLimitMessage.value = '';
    rateLimitTimer = null;
  }, 4000);
}

async function ensureModelAwake() {
  if (!HEALTH_URL) return;

  const token = ++healthToken;
  apiState.value = ApiState.CHECKING;

  try {
    const response = await fetch(`${HEALTH_URL}?check=1`);
    const body = await response.json().catch(() => ({}));

    if (token !== healthToken) return;

    if (body && body.upstream_ok === false) {
      apiState.value = ApiState.WAKING;
      await fetch(`${HEALTH_URL}?wake=1`).catch(() => {});

      if (token !== healthToken) return;
      await sleep(1200);
    }
  } catch (err) {
    if (token === healthToken) {
      apiState.value = ApiState.ERROR;
    }
    throw err;
  } finally {
    if (token === healthToken && apiState.value !== ApiState.ERROR) {
      apiState.value = ApiState.IDLE;
    }
  }
}

function buildHistory(excludeId) {
  return messages.value
    .filter((msg) => msg.id !== excludeId && msg.text && msg.text.trim() !== '')
    .slice(-HISTORY_LIMIT)
    .map((msg) => ({
      role: msg.sender === 'assistant' ? 'assistant' : 'user',
      message: msg.text,
    }));
}

function handleWorkerMessage(event) {
  const data = event.data || {};
  const { messageId, text: fullText, done, error, cancelled } = data;
  if (!messageId) return;

  const msg = findMessage(messageId);
  if (!msg) return;

  if (typeof fullText === 'string') {
    scheduleScroll('auto');
    const animation = playMessageAnimation(msg, fullText);
    animationPromises.set(messageId, animation);
    animation.finally(() => {
      animationPromises.delete(messageId);
      scheduleSave();
    });
  }

  if (error) {
    stopMessageAnimation(messageId);
    msg.text = error;
    scheduleSave();
  }

  if (done) {
    const finalize = () => {
      if (messageId === currentAiMessageId.value) {
        aiTyping.value = false;
        isCancelling.value = false;
        currentAiMessageId.value = null;
      }
      if (cancelled) {
        const index = messages.value.findIndex((item) => item.id === messageId);
        if (index !== -1) {
          messages.value.splice(index, 1);
        }
      }
      scheduleSave();
      scheduleScroll('smooth');
    };

    const pending = animationPromises.get(messageId);
    if (pending) {
      pending.finally(finalize);
    } else {
      finalize();
    }
  }
}

async function sendUserMessage() {
  const userQuery = text.value.trim();
  if (!userQuery || isBusy.value) return;

  const now = Date.now();
  requestTimestamps.value = requestTimestamps.value.filter((ts) => now - ts < RATE_LIMIT.windowMs);
  if (requestTimestamps.value.length >= RATE_LIMIT.maxRequests) {
    setRateLimitNotice(RATE_LIMIT.message || 'Przekroczono limit zapytań.');
    return;
  }

  generalError.value = '';
  requestTimestamps.value.push(now);

  const userMessage = {
    id: generateId('user'),
    sender: 'user',
    text: userQuery,
    timestamp: now,
  };
  messages.value.push(userMessage);
  text.value = '';

  scheduleSave();
  scheduleScroll('smooth');

  try {
    await ensureModelAwake();
  } catch (err) {
    const errorMessage = `Nie udało się połączyć z modelem. ${err?.message || ''}`.trim();
    generalError.value = errorMessage;
    aiTyping.value = false;
    isCancelling.value = false;
    setTimeout(() => {
      if (apiState.value === ApiState.ERROR) {
        apiState.value = ApiState.IDLE;
      }
    }, 1500);
    return;
  }

  aiTyping.value = true;
  isCancelling.value = false;
  const assistantMessageId = generateId('assistant');
  const assistantMessage = {
    id: assistantMessageId,
    sender: 'assistant',
    text: '',
    timestamp: Date.now(),
  };
  messages.value.push(assistantMessage);
  currentAiMessageId.value = assistantMessageId;
  scheduleSave();
  scheduleScroll('smooth');

  const history = buildHistory(assistantMessageId);
  ensureWorker().postMessage({
    type: 'start',
    messageId: assistantMessageId,
    query: userQuery,
    history,
    sessionId: sessionId.value,
  });
}

function cancelResponse() {
  if (!currentAiMessageId.value) return;
  isCancelling.value = true;

  stopMessageAnimation(currentAiMessageId.value);
  if (worker) {
    worker.postMessage({ type: 'cancel', messageId: currentAiMessageId.value });
  }

  const idx = messages.value.findIndex((item) => item.id === currentAiMessageId.value);
  if (idx !== -1) {
    messages.value.splice(idx, 1);
  }

  currentAiMessageId.value = null;
  aiTyping.value = false;
  scheduleSave();
  scheduleScroll('auto');
}

function resetConversation() {
  if (currentAiMessageId.value && worker) {
    worker.postMessage({ type: 'cancel', messageId: currentAiMessageId.value });
  }
  currentAiMessageId.value = null;
  aiTyping.value = false;
  isCancelling.value = false;

  stopAllAnimations();

  messages.value = [];
  requestTimestamps.value = [];
  generalError.value = '';
  rateLimitMessage.value = '';
  showSuggestions.value = true;

  scheduleSave();
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  scheduleScroll('auto');
}

const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function renderMessage(textValue) {
  if (!textValue) return '';
  let out = escapeHtml(textValue);

  const blocks = [];
  out = out.replace(/```([^\n`]*)?\r?\n([\s\S]*?)```/g, (_, lang, code) => {
    const id = blocks.length;
    blocks.push({ lang: escapeHtml((lang || '').trim()), code });
    return `%%CODEBLOCK_${id}%%`;
  });

  out = out.replace(/`([^`\n]+)`/g, '<code class="inline-code">$1</code>');
  out = out.replace(/\r?\n/g, '<br>');

  blocks.forEach((block, index) => {
    const langLabel = block.lang ? `<span class="code-lang">${block.lang}</span>` : `<span class="code-lang no-lang">kod</span>`;
    const toolbar = `<div class="code-toolbar-outside">${langLabel}<button type="button" class="copy-btn" aria-label="Skopiuj kod">Kopiuj</button></div>`;
    const group = `<div class="code-group">${toolbar}<pre class="code-block"><code>${block.code}</code></pre></div>`;
    out = out.replace(`%%CODEBLOCK_${index}%%`, group);
  });

  return out;
}

function onMessageHtmlClick(event) {
  const btn = event.target.closest('.copy-btn');
  if (!btn) return;

  const group = btn.closest('.code-group');
  const codeEl = group?.querySelector('pre.code-block > code');
  const codeText = codeEl?.innerText || codeEl?.textContent || '';
  if (!codeText) return;

  const onCopied = () => {
    const original = btn.textContent;
    btn.textContent = 'Skopiowano!';
    btn.disabled = true;
    btn.classList.add('copied');

    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      btn.classList.remove('copied');
    }, 1200);
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard
      .writeText(codeText)
      .then(onCopied)
      .catch(() => fallbackCopy(codeText, onCopied));
  } else {
    fallbackCopy(codeText, onCopied);
  }
}

function fallbackCopy(textValue, done) {
  const ta = document.createElement('textarea');
  ta.value = textValue;
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    done();
  } finally {
    document.body.removeChild(ta);
  }
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      nextTick(() => {
        textInput.value?.focus();
        scheduleScroll('auto');
      });
    } else {
      isCancelling.value = false;
    }
  }
);

watch(
  () => messages.value.length,
  () => nextTick(() => scheduleScroll('auto'))
);

let startX = 0;
let startWidth = 0;

function startResize(e) {
  if (isResizing) return;
  isResizing = true;
  startX = e.clientX;
  startWidth = panelWidth.value;
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', stopResize);
}

function onMouseMove(e) {
  if (!isResizing) return;
  const delta = startX - e.clientX;
  const nextWidth = Math.min(Math.max(startWidth + delta, MIN_WIDTH), MAX_WIDTH);
  panelWidth.value = nextWidth;
  scheduleWidthPersist();
}

function stopResize() {
  if (!isResizing) return;
  isResizing = false;
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', stopResize);
  scheduleWidthPersist();
}

onMounted(() => {
  ensureWorker();
  restorePanelWidth();
  loadPersistedMessages();
  ensureSession();
  if (props.visible) {
    nextTick(() => {
      textInput.value?.focus();
      scheduleScroll('auto');
    });
  }
});

onBeforeUnmount(() => {
  stopResize();
  stopAllAnimations();
  if (saveTimer) clearTimeout(saveTimer);
  if (widthSaveTimer) clearTimeout(widthSaveTimer);
  if (rateLimitTimer) clearTimeout(rateLimitTimer);
  if (worker) {
    worker.removeEventListener('message', handleWorkerMessage);
    worker.terminate();
    worker = null;
  }
});
</script>

<style scoped>
.inputError {
  margin: 0.3rem 0;
  color: #ef4444;
  font-size: 0.85rem;
}

.messageHtml :deep(.code-group) {
  margin: 0.6rem 0;
}

.messageHtml :deep(.code-toolbar-outside) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0 0 0.35rem;
  background: transparent;
}

.messageHtml :deep(.code-lang) {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
}
.messageHtml :deep(.code-lang.no-lang) {
  opacity: 0.6;
}

.messageHtml :deep(.copy-btn) {
  appearance: none;
  border: 3px solid #003c7d;
  background: var(--panelBackgroundColor, #ffffff);
  color: var(--fontColor, black);
  font-size: 0.8rem;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  outline: none;
  cursor: pointer;
}
.messageHtml :deep(.copy-btn:hover) {
  background: #f3f4f6;
}
.messageHtml :deep(.copy-btn.copied) {
  background: #d1fae5;
  border-color: #10b981;
  color: #065f46;
}

.messageHtml :deep(.code-block) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  background: #0f172a;
  color: #e5e7eb;
  border-radius: 8px;
  padding: 0.8rem 1rem;
  overflow: auto;
  line-height: 1.45;
  border: 1px solid #1f2937;
}

.messageHtml :deep(.inline-code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  background: var(--panelBackgroundColor, #ffffff);
  border: 1px solid #e1e4e8;
  padding: 0.15rem 0.35rem;
  border-radius: 4px;
  font-size: 0.95em;
}

.messageText :deep(pre),
.messageText :deep(code),
.messageText :deep(.code-toolbar-outside) {
  margin-top: 0.2rem;
  margin-bottom: 0.2rem;
}

.healthBanner {
  margin: 0.4rem 0 0.6rem;
  padding: 0.5rem 0.75rem;
  border: 1px dashed var(--signal-active, #0ea5e9);
  background: color-mix(in srgb, var(--panelBackgroundColor, #fff) 85%, #0ea5e9);
  border-radius: 8px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.healthBanner .dots {
  display: inline-flex;
  gap: 0.2rem;
}
.healthBanner .dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #0e7490;
  opacity: 0.3;
  animation: blink 1.4s infinite;
}
.healthBanner .dots span:nth-child(2) {
  animation-delay: 0.2s;
}
.healthBanner .dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes blink {
  0%,
  80%,
  100% {
    opacity: 0.2;
  }
  40% {
    opacity: 1;
  }
}

.suggestionPanel {
  margin: 0.4rem 0 0.8rem;
  padding: 0.75rem;
  border-radius: 10px;
  border: 3px solid var(--panelOutlineColor, #003c7d);
  background: var(--panelBackgroundColor, #ffffff);
  color: var(--fontColor, #0f172a);
}

.suggestionHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.suggestionTitle {
  font-weight: 700;
  letter-spacing: 0.02em;
}

.suggestionClose {
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--fontColor, #0f172a);
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  padding: 0 0.25rem;
}

.suggestionGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.5rem;
}

.suggestionTile {
  text-align: left;
  border: 2px solid #003c7d;
  border-radius: 8px;
  padding: 0.55rem 0.6rem;
  background: #f8fafc;
  color: inherit;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.suggestionTile:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.12);
  border-color: #0ea5e9;
}

.suggestionText {
  font-size: 0.9rem;
  line-height: 1.3;
}

body.darkMode .suggestionPanel {
  background: var(--panelBackgroundColor, #0f172a);
}

body.darkMode .suggestionTile {
  background: rgba(15, 23, 42, 0.6);
  border-color: #1d4ed8;
}
</style>

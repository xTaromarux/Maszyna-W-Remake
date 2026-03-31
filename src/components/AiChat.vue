<template>
  <div v-if="props.visible" class="chatOverlay" @click.self="startClose">
    <div id="aiChat" class="chatPanel" @click.stop :class="{ show: props.visible }" :style="{ width: panelWidth + 'px' }">
      <div class="resizer" @mousedown="startResize"></div>

      <header class="chatHeader">
        <div class="chatHeaderTitle">
          <h1>{{ resolvedTitle }}</h1>
          <span class="apiKeyChip" :class="{ apiKeyChipReady: hasApiKey }">
            {{ hasApiKey ? $t('aiChat.apiKey.savedBadge') : $t('aiChat.apiKey.requiredBadge') }}
          </span>
        </div>

        <div class="headerBtns">
          <button class="apiKeyBtn" type="button" @click="openApiKeyModal" :aria-label="$t('aiChat.apiKey.buttonAria')">
            {{ hasApiKey ? $t('aiChat.apiKey.changeShort') : $t('aiChat.apiKey.addShort') }}
          </button>
          <button class="resetBtn" @click="resetConversation" :aria-label="$t('aiChat.resetAria')">
            <AiChatTrashIcon width="22" height="22" class="trashIcon" />
          </button>
          <button class="closeBtn" @click="startClose" :aria-label="$t('aiChat.closeAria')">&times;</button>
        </div>
      </header>

      <div class="chatBody" :class="{ chatBodyLocked: showApiKeyGate }">
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
                {{ msg.sender === 'assistant' ? 'AI' : '' }}
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
          <p class="inputInstruction">{{ resolvedInstruction }}</p>
          <p v-if="rateLimitMessage" class="inputError">{{ rateLimitMessage }}</p>
          <p v-else-if="generalError" class="inputError">{{ generalError }}</p>
          <form @submit.prevent="sendUserMessage">
            <input
              ref="textInput"
              v-model="text"
              :placeholder="resolvedPlaceholder"
              type="text"
              :disabled="inputDisabled"
              :aria-disabled="inputDisabled"
            />
            <button class="execution-btn execution-btn--run" type="submit" :disabled="sendDisabled">{{ $t('aiChat.send') }}</button>
          </form>
        </div>

        <transition name="apiGateFade">
          <div v-if="showApiKeyGate" class="apiKeyGate" @click.self="closeApiKeyModal">
            <form class="apiKeyCard" @submit.prevent="saveApiKey">
              <p class="apiKeyEyebrow">{{ $t('aiChat.apiKey.eyebrow') }}</p>
              <h2>{{ hasApiKey ? $t('aiChat.apiKey.editTitle') : $t('aiChat.apiKey.title') }}</h2>
              <p class="apiKeyDescription">
                {{ hasApiKey ? $t('aiChat.apiKey.editDescription') : $t('aiChat.apiKey.description') }}
              </p>

              <label class="apiKeyLabel" for="ai-chat-api-key">{{ $t('aiChat.apiKey.label') }}</label>
              <div class="apiKeyField">
                <input
                  id="ai-chat-api-key"
                  ref="apiKeyInput"
                  v-model="apiKeyDraft"
                  :type="showApiKeyValue ? 'text' : 'password'"
                  :placeholder="$t('aiChat.apiKey.placeholder')"
                  autocomplete="off"
                  spellcheck="false"
                />
                <button class="apiKeyToggle" type="button" @click="showApiKeyValue = !showApiKeyValue">
                  {{ showApiKeyValue ? $t('aiChat.apiKey.hide') : $t('aiChat.apiKey.show') }}
                </button>
              </div>

              <p class="apiKeyHint">{{ $t('aiChat.apiKey.hint') }}</p>
              <div class="apiKeyNotice">
                <p class="apiKeyNoticeTitle">{{ $t('aiChat.apiKey.noticeTitle') }}</p>
                <ul class="apiKeyNoticeList">
                  <li>{{ $t('aiChat.apiKey.noticeRateLimits') }}</li>
                  <li>{{ $t('aiChat.apiKey.noticeStorage') }}</li>
                  <li>{{ $t('aiChat.apiKey.noticeShare') }}</li>
                </ul>
              </div>
              <p v-if="apiKeyError" class="apiKeyError">{{ apiKeyError }}</p>

              <div class="apiKeyActions">
                <button class="execution-btn execution-btn--run apiKeyPrimary" type="submit">
                  {{ $t('aiChat.apiKey.save') }}
                </button>
                <button v-if="hasApiKey" class="apiKeySecondary" type="button" @click="closeApiKeyModal">
                  {{ $t('actions.cancel') }}
                </button>
                <button v-if="hasApiKey" class="apiKeySecondary apiKeyDanger" type="button" @click="clearApiKey">
                  {{ $t('aiChat.apiKey.clear') }}
                </button>
              </div>
            </form>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AiChatTrashIcon from '@/components/AiChatTrashIcon.vue';
import {
  API_KEY_STORAGE_KEY,
  ApiState,
  HISTORY_LIMIT,
  RATE_LIMIT,
  SAVE_DEBOUNCE_MS,
  SESSION_KEY,
  STORAGE_KEY,
  STORAGE_VERSION,
  STORAGE_VERSION_KEY,
  WIDTH_KEY,
} from '@/models/AiChat';

const props = defineProps({
  visible: { type: Boolean, default: false },
  title: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  instruction: { type: String, default: '' },
});

const emit = defineEmits(['close']);

const messages = ref([]);
const text = ref('');
const apiKey = ref('');
const apiKeyDraft = ref('');
const apiKeyError = ref('');
const showApiKeyModal = ref(false);
const showApiKeyValue = ref(false);
const aiTyping = ref(false);
const isCancelling = ref(false);
const conversationEl = ref(null);
const textInput = ref(null);
const apiKeyInput = ref(null);
const apiState = ref(ApiState.IDLE);
const currentAiMessageId = ref(null);
const panelWidth = ref(650);
const rateLimitMessage = ref('');
const generalError = ref('');
const requestTimestamps = ref([]);
const sessionId = ref('');
const showSuggestions = ref(true);

const API_URL = import.meta.env.VITE_API_URL || '';
const HEALTH_URL = API_URL ? API_URL.replace(/chat\/?$/, 'health') : '';
const { t } = useI18n();

const hasApiKey = computed(() => apiKey.value.trim().length > 0);
const showApiKeyGate = computed(() => !hasApiKey.value || showApiKeyModal.value);
const isBusy = computed(
  () => aiTyping.value || isCancelling.value || apiState.value === ApiState.CHECKING || apiState.value === ApiState.WAKING
);
const inputDisabled = computed(() => isBusy.value || showApiKeyGate.value || !hasApiKey.value);
const sendDisabled = computed(() => inputDisabled.value || !text.value.trim());
const suggestions = computed(() => [
  { id: 'what-is-w', text: t('aiChat.suggestions.items.whatIsW') },
  { id: 'add-two', text: t('aiChat.suggestions.items.addTwoNumbers') },
  { id: 'first-program', text: t('aiChat.suggestions.items.firstProgram') },
]);
const resolvedTitle = computed(() => props.title || t('aiChat.title'));
const resolvedPlaceholder = computed(() => props.placeholder || t('aiChat.placeholder'));
const resolvedInstruction = computed(() => props.instruction || t('aiChat.instruction'));
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

function focusPrimaryInput(selectKey = false) {
  nextTick(() => {
    if (!props.visible) return;

    if (showApiKeyGate.value) {
      apiKeyInput.value?.focus();
      if (selectKey) {
        apiKeyInput.value?.select?.();
      }
      return;
    }

    textInput.value?.focus();
  });
}

function restoreApiKey() {
  try {
    const saved = localStorage.getItem(API_KEY_STORAGE_KEY) || '';
    apiKey.value = saved.trim();
    apiKeyDraft.value = apiKey.value;
  } catch {
    apiKey.value = '';
    apiKeyDraft.value = '';
  }
}

function persistApiKey(value) {
  try {
    if (value) localStorage.setItem(API_KEY_STORAGE_KEY, value);
    else localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch {}
}

function openApiKeyModal() {
  showApiKeyModal.value = true;
  apiKeyDraft.value = apiKey.value;
  apiKeyError.value = '';
  showApiKeyValue.value = false;
  focusPrimaryInput(true);
}

function closeApiKeyModal() {
  if (!hasApiKey.value) return;
  showApiKeyModal.value = false;
  apiKeyDraft.value = apiKey.value;
  apiKeyError.value = '';
  showApiKeyValue.value = false;
  focusPrimaryInput();
}

function saveApiKey() {
  const normalized = apiKeyDraft.value.trim();
  if (!normalized) {
    apiKeyError.value = t('aiChat.apiKey.missingError');
    focusPrimaryInput(true);
    return;
  }

  apiKey.value = normalized;
  apiKeyDraft.value = normalized;
  apiKeyError.value = '';
  generalError.value = '';
  showApiKeyModal.value = false;
  showApiKeyValue.value = false;
  persistApiKey(normalized);
  focusPrimaryInput();
}

function clearApiKey() {
  apiKey.value = '';
  apiKeyDraft.value = '';
  apiKeyError.value = '';
  generalError.value = '';
  showApiKeyModal.value = false;
  showApiKeyValue.value = false;
  persistApiKey('');
  focusPrimaryInput();
}

function dismissSuggestions() {
  showSuggestions.value = false;
}

function applySuggestion(value) {
  if (!value) return;
  text.value = value;
  if (!hasApiKey.value) {
    openApiKeyModal();
    return;
  }
  focusPrimaryInput();
}

function generateId(prefix = 'msg') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
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
  Array.from(animationStates.keys()).forEach((id) => stopMessageAnimation(id));
}

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
        if (state.timer !== null) clearInterval(state.timer);
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
      if (index >= chunks.length) state.finish();
    };

    animationStates.set(message.id, state);
    applyChunk();

    if (!finished) {
      state.timer = setInterval(() => {
        applyChunk();
        if (finished) clearInterval(state.timer);
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
    if (Array.isArray(parsed)) parsed = { messages: parsed };
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
      console.log('Health check failed', err);
      apiState.value = ApiState.ERROR;
    }
    throw err;
  } finally {
    if (token === healthToken && apiState.value !== ApiState.ERROR) apiState.value = ApiState.IDLE;
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
  const { messageId, text: fullText, done, error, errorKey, errorDetail, cancelled } = data;
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

  if (error || errorKey) {
    stopMessageAnimation(messageId);
    msg.text = errorKey ? t(errorKey, { message: errorDetail || '' }).trim() : error;
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
        if (index !== -1) messages.value.splice(index, 1);
      }
      scheduleSave();
      scheduleScroll('smooth');
    };

    const pending = animationPromises.get(messageId);
    if (pending) pending.finally(finalize);
    else finalize();
  }
}

async function sendUserMessage() {
  const userQuery = text.value.trim();
  if (!userQuery || isBusy.value) return;

  if (!hasApiKey.value) {
    apiKeyError.value = t('aiChat.apiKey.missingError');
    openApiKeyModal();
    return;
  }

  const now = Date.now();
  requestTimestamps.value = requestTimestamps.value.filter((ts) => now - ts < RATE_LIMIT.windowMs);
  if (requestTimestamps.value.length >= RATE_LIMIT.maxRequests) {
    setRateLimitNotice(RATE_LIMIT.message || t('aiChat.rateLimitExceeded'));
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
    const errorMessage = t('aiChat.connectFailed', { message: err?.message || '' }).trim();
    generalError.value = errorMessage;
    aiTyping.value = false;
    isCancelling.value = false;
    setTimeout(() => {
      if (apiState.value === ApiState.ERROR) apiState.value = ApiState.IDLE;
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

  ensureWorker().postMessage({
    type: 'start',
    messageId: assistantMessageId,
    query: userQuery,
    apiKey: apiKey.value.trim(),
    history: buildHistory(assistantMessageId),
    sessionId: sessionId.value,
  });
}

function cancelResponse() {
  if (!currentAiMessageId.value) return;
  isCancelling.value = true;

  stopMessageAnimation(currentAiMessageId.value);
  if (worker) worker.postMessage({ type: 'cancel', messageId: currentAiMessageId.value });

  const idx = messages.value.findIndex((item) => item.id === currentAiMessageId.value);
  if (idx !== -1) messages.value.splice(idx, 1);

  currentAiMessageId.value = null;
  aiTyping.value = false;
  scheduleSave();
  scheduleScroll('auto');
}

function resetConversation() {
  if (currentAiMessageId.value && worker) worker.postMessage({ type: 'cancel', messageId: currentAiMessageId.value });

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
    const langLabel = block.lang
      ? `<span class="code-lang">${block.lang}</span>`
      : `<span class="code-lang no-lang">${t('aiChat.codeLabel')}</span>`;
    const toolbar = `<div class="code-toolbar-outside">${langLabel}<button type="button" class="copy-btn" aria-label="${t('aiChat.copyCodeAria')}">${t('aiChat.copyCode')}</button></div>`;
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
    btn.textContent = t('aiChat.copyCodeDone');
    btn.disabled = true;
    btn.classList.add('copied');

    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
      btn.classList.remove('copied');
    }, 1200);
  };

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(codeText).then(onCopied).catch(() => fallbackCopy(codeText, onCopied));
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
      focusPrimaryInput(!hasApiKey.value);
      scheduleScroll('auto');
    } else {
      isCancelling.value = false;
      showApiKeyModal.value = false;
      showApiKeyValue.value = false;
      apiKeyError.value = '';
      apiKeyDraft.value = apiKey.value;
    }
  }
);

watch(showApiKeyGate, (locked) => {
  if (props.visible && locked) focusPrimaryInput(true);
});

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
  panelWidth.value = Math.min(Math.max(startWidth + delta, MIN_WIDTH), MAX_WIDTH);
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
  restoreApiKey();
  loadPersistedMessages();
  ensureSession();

  if (props.visible) {
    focusPrimaryInput(!hasApiKey.value);
    scheduleScroll('auto');
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

<template>
  <div
    v-if="isHide"
    class="chatOverlay"
    @click.self="startClose"
    :class="{ show: isHide, isHide: !isHide }"
  >
    <div id="aiChat" class="chatPanel" @click.stop :class="{ show: visible, hide: !visible }" :style="{ width: panelWidth + 'px' }" >
      <div class="resizer" @mousedown="startResize"></div>
      <header class="chatHeader">
        <h1>{{ title }}</h1>
        <div class="headerBtns">
          <button class="resetBtn" @click="resetConversation" aria-label="Resetuj czat">
            <AiChatTrashIcon width="22" height="22" class="trashIcon" />
          </button>
          <button class="closeBtn" @click="startClose" aria-label="Zamknij czat">
            &times;
          </button>
        </div>
      </header>

      <div id="conversation" ref="conversationEl">
        <transition-group name="messageEnter" tag="div" class="conversationBox">
          <div
            v-for="(msg, i) in messages"
            :key="i"
            class="messageBubble"
            :class="{ messageUser: msg.sender === 'user', messageAi: msg.sender === 'ai' }"
          >
            <div class="iconWrapper">
              {{ msg.sender === 'assistant' ? '🤖' : '' }}
            </div>
            <div class="messageContent">
              <div class="messageHeader">
                <span class="senderName">{{ msg.sender === 'assistant' ? 'AI' : msg.sender }}</span>
                <span class="timestamp" :class="{ timestampAssistant: msg.sender === 'assistant' && aiTyping && i===currentAiIndex }">{{ formatTime(msg.timestamp) }}</span>
                <!-- przycisk do anulowania odpowiedzi -->
                <button
                  v-if="msg.sender==='assistant' && aiTyping && i===currentAiIndex"
                  class="cancelBtn"
                  @click="cancelResponse"
                  aria-label="Anuluj odpowiedź"
                >×</button>
              </div>
              <p class="messageText" :class="{ messageTextAssistant: msg.sender === 'assistant' }">
                <template v-if="msg.sender === 'assistant' && aiTyping && i === currentAiIndex && !msg.text">
                  <span class="typing"><span></span><span></span><span></span></span>
                </template>
                <template v-else>
                  {{ msg.text }}
                </template>
              </p>
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
            :disabled="aiTyping"
          />
          <button type="submit" :disabled="aiTyping">Wyślij</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import AiChatTrashIcon from '@/components/AiChatTrashIcon.vue'

const chatWorker = new Worker(
  new URL('@/workers/chat.worker.js', import.meta.url),
  { type: 'module' }
)

chatWorker.onmessage = (e) => {
  const { aiIndex, char, done } = e.data
  const msg = messages.value[aiIndex]
  if (!msg) return

  if (char) {
    msg.text += char
  }
  if (done) {
    aiTyping.value = false
    currentAiIndex.value = null
  }
}

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
const messages = ref([])
const textInput = ref(null)
const text = ref('')
const aiTyping = ref(false)
const conversationEl = ref(null)
const requestTimestamps = ref([])
const typingTimer = ref(null)
const currentAiIndex = ref(null)

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try { messages.value = JSON.parse(saved) }
    catch { messages.value = [] }
  }
})

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      isHide.value = true
      nextTick(() => setTimeout(() => textInput.value?.focus(), 1000))
    }
  }
)

watch(
  messages,
  (msgs) => localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)),
  { deep: true }
)

const resetConversation = () => {
  messages.value = []
  localStorage.removeItem(STORAGE_KEY)
  requestTimestamps.value = []
  // wyczyść ewentualną przerwaną odpowiedź
  cancelResponse()
}

const formatTime = ts =>
  new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

async function sendUserMessage() {
  const now = Date.now()
  requestTimestamps.value = requestTimestamps.value.filter(ts => now - ts < 60000)
  if (requestTimestamps.value.length >= 20) {
    alert('Limit 20 zapytań na minutę. Spróbuj ponownie później.')
    return
  }
  requestTimestamps.value.push(now)
  if (aiTyping.value || !text.value.trim()) return

  // dodajemy wiadomość użytkownika
  messages.value.push({ sender: 'user', text: text.value, timestamp: now })
  text.value = ''

  // przygotowujemy AI
  aiTyping.value = true
  messages.value.push({ sender: 'assistant', text: '', timestamp: Date.now() })
  const aiIndex = messages.value.length - 1
  currentAiIndex.value = aiIndex

  const history = messages.value
    .filter(m => m.text.trim() !== '')
    .map(m => ({ role: m.sender, message: m.text }))

  chatWorker.postMessage({ history, aiIndex })
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
  chatWorker.terminate()
  aiTyping.value = false

}

watch(
  () => messages.value.length,
  () => nextTick(() => conversationEl.value?.scrollTo(0, conversationEl.value.scrollHeight))
)


const panelWidth = ref(500)       // startowa szerokość
let startX = 0
let startWidth = 0

function startResize(e) {
  // zapamiętaj punkt startowy
  startX = e.clientX
  startWidth = panelWidth.value

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup',   stopResize)
}

function onMouseMove(e) {
  const delta = startX - e.clientX
  let newWidth = startWidth + delta
  // ograniczenia
  newWidth = Math.min(Math.max(newWidth, 500), 1000)
  panelWidth.value = newWidth
}

function stopResize() {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup',   stopResize)
}

// posprzątaj, gdy komponent się zniszczy
onBeforeUnmount(() => {
  stopResize()
  chatWorker.terminate()
})
</script>
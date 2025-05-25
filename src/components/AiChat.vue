<template>
  <transition name="slide">
    <div v-if="true" class="chatOverlay" @click.self="$emit('close')">
      <div id="aiChat" class="chatPanel" @click.stop>
        <header class="chatHeader">
          <h1>{{ title }}</h1>
          <div class="headerBtns">
            <button class="resetBtn" @click="resetConversation" aria-label="Reset chat">
              🗑️
            </button>
            <button class="closeBtn" @click="$emit('close')" aria-label="Close chat">
              &times;
            </button>
          </div>
        </header>

        <div id="conversation" ref="conversationEl">
          <transition-group name="messageEnter" tag="div">
            <div
              v-for="(msg, i) in messages"
              :key="i"
              class="messageBubble"
              :class="{ messageUser: msg.sender === 'user', messageAi: msg.sender === 'ai' }"
            >
              <div class="iconWrapper">
                {{ msg.sender === 'ai' ? '🤖' : '👤' }}
              </div>
              <div class="messageContent">
                <div class="messageHeader">
                  <span class="senderName">{{ msg.sender }}</span>
                  <span class="timestamp">{{ formatTime(msg.timestamp) }}</span>
                </div>
                <p class="messageText">{{ msg.text }}</p>
              </div>
            </div>
          </transition-group>
        </div>

        <div class="inputArea">
          <p class="inputInstruction">{{ instruction }}</p>
          <form @submit.prevent="sendUserMessage">
            <input
              v-model="text"
              :placeholder="placeholder"
              type="text"
            />
            <button type="submit">Send</button>
          </form>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

// Props
const props = defineProps({
  title: {
    type: String,
    default: 'AI Assistant'
  },
  placeholder: {
    type: String,
    default: 'Type a message…'
  },
  instruction: {
    type: String,
    default: 'Describe the operation to get the machine code:'
  }
})

// Emits
const emit = defineEmits(['close'])

// State
const messages = ref([])
const text = ref('')

// Reset rozmowy
const resetConversation = () => {
  messages.value = []
}

// Format czasu
const formatTime = ts => new Date(ts).toLocaleTimeString()

// Wysyłanie wiadomości użytkownika + symulacja strumienia
const sendUserMessage = () => {
  if (!text.value.trim()) return
  // dodaj user
  messages.value.push({
    sender: 'user',
    text: text.value,
    timestamp: Date.now()
  })
  const userText = text.value
  text.value = ''

  // przygotuj puste AI, potem dopisuj literka po literce
  messages.value.push({
    sender: 'ai',
    text: '',
    timestamp: Date.now()
  })
  const aiIndex = messages.value.length - 1
  // TUTAJ w przyszłości wstaw swoje dane z WebSocketa
  const full = 'To jest symulowana odpowiedź AI...' // zamień na realny stream
  let pos = 0
  const timer = setInterval(() => {
    if (pos >= full.length) return clearInterval(timer)
    messages.value[aiIndex].text += full[pos++]
  }, 40)
}

// Auto-scroll
const conversationEl = ref(null)
watch(
  () => messages.value.length,
  () => nextTick(() => {
    conversationEl.value?.scrollTo(0, conversationEl.value.scrollHeight)
  })
)
</script>

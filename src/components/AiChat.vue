<template>
    <div
      v-if="isHide"
      class="chatOverlay"
      @click.self="startClose"
      :class="{ show: isHide, isHide: !isHide }"
    >
      <div id="aiChat" class="chatPanel" @click.stop :class="{show: visible, hide: !visible }">
        <header class="chatHeader">
          <h1>{{ title }}</h1>
          <div class="headerBtns">
            <button class="resetBtn" @click="resetConversation" aria-label="Reset chat">
              🗑️
            </button>
            <button class="closeBtn" @click="startClose" aria-label="Close chat">
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
              :disabled="aiTyping"
            />
            <button type="submit" :disabled="aiTyping">Send</button>
          </form>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted } from 'vue'

const isHide = ref(false)

function startClose() {
  emit('close')

  setTimeout(() => {
    isHide.value = false;
  }, 1000);
}


const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
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
const emit = defineEmits(['close'])

const STORAGE_KEY = 'aiChatMessages'

const messages = ref([])
const text = ref('')
const aiTyping = ref(false)

onMounted(() => {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      messages.value = JSON.parse(saved)
    } catch {
      messages.value = []
    }
  }
})

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      isHide.value = true
    }
  },

  messages,
  (msgs) => localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)),
  { deep: true }
)

const resetConversation = () => {
  messages.value = []
  localStorage.removeItem(STORAGE_KEY)
}

const formatTime = ts => new Date(ts).toLocaleTimeString()

const sendUserMessage = () => {
  if (aiTyping.value || !text.value.trim()) return

  messages.value.push({
    sender: 'user',
    text: text.value,
    timestamp: Date.now()
  })
  const userText = text.value
  text.value = ''

  aiTyping.value = true
  messages.value.push({
    sender: 'ai',
    text: '',
    timestamp: Date.now()
  })
  const aiIndex = messages.value.length - 1

  const full = 'To jest symulowana odpowiedź AI...' 
  let pos = 0
  const timer = setInterval(() => {
    if (pos >= full.length) {
      clearInterval(timer)
      aiTyping.value = false
      return
    }
    messages.value[aiIndex].text += full[pos++]
  }, 40)
}

const conversationEl = ref(null)
watch(
  () => messages.value.length,
  () => nextTick(() => {
    conversationEl.value?.scrollTo(0, conversationEl.value.scrollHeight)
  })
)
</script>

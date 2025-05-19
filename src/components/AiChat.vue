<template>
  <div id="aiChat">
    <header class="chat-header">
      <h1>AI Chat</h1>
      <button class="close-btn" @click="$emit('close')" aria-label="Close chat">
        &times;
      </button>
    </header>

    <div id="conversation" ref="conversationEl">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="message"
        :class="{ user: msg.sender === 'user', ai: msg.sender === 'ai' }"
      >
        <div class="icon">i</div>
        <span class="sender">{{ msg.sender }}</span>
        <span class="time">{{ formatTime(msg.timestamp) }}</span>
        <span class="message">{{ msg.text }}</span>
      </div>
    </div>

    <form id="inputArea" @submit.prevent="send">
      <input v-model="text" type="text" placeholder="Type your message…" />
      <button type="submit">Send</button>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

// local state
const messages = ref([])
const text      = ref('')

const formatTime = ts => new Date(ts).toLocaleTimeString()

// send fake message
const send = () => {
  if (!text.value.trim()) return
  messages.value.push({ sender: 'user', text: text.value, timestamp: Date.now() })
  text.value = ''

  // simulate AI response
  setTimeout(() => {
    messages.value.push({
      sender: 'ai',
      text:   'This is a simulated AI response.',
      timestamp: Date.now()
    })
  }, 800)
}

// auto scroll to bottom
const conversationEl = ref(null)
watch(
  () => messages.value.length,
  () => nextTick(() => {
    conversationEl.value?.scrollTo(0, conversationEl.value.scrollHeight)
  })
)

defineEmits(['close'])
</script>


<style scoped>
.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: .5rem 1rem;
  background: #003c7d;
  color: #fff;
}

.close-btn {
  all: unset;
  cursor: pointer;
  font-size: 1.25rem;
  line-height: 1;
}

.message { display: flex; gap: .5rem; margin-bottom: .25rem; }
.message.user .icon { color: #0b5ed7; } 
.message.ai   .icon { color: #28a745; }

#inputArea {
  display: flex;
  gap: .5rem;
  padding: .5rem 1rem;
  border-top: 1px solid #e0e0e0;
}
#inputArea input { flex: 1; }
</style>

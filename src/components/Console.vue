<template>
  <div id="console">
    <!-- Błąd kompilacji -->
    <div v-if="error" class="error">
      <span class="time">{{ fmt(Date.now()) }}</span>
      <span class="class">ERROR</span>
      <span class="symbol">>_</span>
      <span class="message">{{ error }}</span>
    </div>

    <!-- Logi z runtime (mikrofazy) -->
    <div class="log" v-for="(entry, i) in runtimeLogs" :key="'rt-' + i">
      <span class="time">{{ fmt(entry.timestamp) }}</span>
      <span class="class">{{ entry.class }}</span>
      <span class="symbol">>_</span>
      <span class="message">{{ entry.message }}</span>
    </div>

    <!-- Ogólne logi systemowe -->
    <div class="log" v-for="(log, i) in logs" :key="'log-' + i">
      <span class="time">{{ fmt(log.timestamp || Date.now()) }}</span>
      <span class="class">{{ log.class }}</span>
      <span class="symbol">>_</span>
      <span class="message">{{ log.message }}</span>
    </div>

    <!-- Gdy brak logów -->
    <div v-if="!error && !runtimeLogs.length && !logs.length" class="log">
      <span class="time">{{ fmt(Date.now()) }}</span>
      <span class="class">INFO</span>
      <span class="symbol">>_</span>
      <span class="message">Brak logów do wyświetlenia.</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  store: { validator: v => typeof v === 'object' || v === null, default: null },
  microProgram: { type: Array, default: () => [] },
  error: { type: String, default: null },
  logs: { type: Array, default: () => [] }
})

// Format czasu
const pad = n => String(n).padStart(2, '0')
const fmt = ts => {
  const d = new Date(ts)
  const today = new Date().toDateString() === d.toDateString()
  const YMD = [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-')
  const HMS = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':')
  return today ? HMS : `${YMD} ${HMS}`
}

// Logi stanu (mikrofaza)
const runtimeLogs = computed(() => {
  if (!props.store || !props.microProgram.length) return []

  const entry = props.microProgram[props.store.L]
  const phase = entry?.phases?.[props.store.phaseIdx] ?? {}
  const sigs = Object.keys(phase).filter(k => phase[k])
  const reg = props.store

  return [
    {
      timestamp: Date.now(),
      class: 'INFO',
      message: `Faza: ${props.store.phaseIdx} | Sygnały: ${sigs.join(', ') || 'brak'}`
    },
    {
      timestamp: Date.now(),
      class: 'REG',
      message: `L=${reg.L}, I=${reg.I}, A=${reg.A}, S=${reg.S}, Ak=${reg.Ak}`
    },
    {
      timestamp: Date.now(),
      class: 'FLAG',
      message: `Z=${reg.flags?.Z}, IE=${reg.flags?.IE}, IR=${reg.flags?.IR}`
    },
    {
      timestamp: Date.now(),
      class: 'IO',
      message: `IO Out: ${reg.ioOut?.join(', ') || '—'}`
    }
  ]
})
</script>

<style scoped>
#console {
  font-family: monospace;
  background: #1e1e1e;
  color: #fff;
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
}
.time {
  color: #888;
  margin-right: 0.5em;
}
.class {
  font-weight: bold;
  color: #4fc3f7;
  margin-right: 0.5em;
}
.symbol {
  margin-right: 0.5em;
  color: #ff9800;
}
.message {
  white-space: pre-wrap;
}
.error .class {
  color: #e57373;
}
</style>

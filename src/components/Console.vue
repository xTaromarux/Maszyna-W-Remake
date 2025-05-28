<template>
  <div id="console">
    <div
      v-for="(log, i) in logs"
      :key="i"
      :class="log.class.toLowerCase()"
    >
      <span class="time">{{ fmt(log.timestamp) }}</span>
      <span class="class">{{ log.class }}</span>
      <span class="symbol">>_</span>
      <span class="message">{{ log.message }}</span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  logs: { type: Array, default: () => [] }
})


const pad = n => String(n).padStart(2, '0')

const fmt = ts => {
  const d = new Date(ts)
  const today = new Date().toDateString() === d.toDateString()
  const YMD = [d.getFullYear(), pad(d.getMonth() + 1), pad(d.getDate())].join('-')
  const HMS = [pad(d.getHours()), pad(d.getMinutes()), pad(d.getSeconds())].join(':')

  return today ? HMS : `${YMD} ${HMS}`
}
</script>
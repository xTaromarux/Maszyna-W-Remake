<template>
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="{ 'error-state': hasError }"
  >
    <rect
      x="2"
      y="4"
      width="20"
      height="16"
      rx="2"
      ry="2"
      stroke="currentColor"
      stroke-width="2"
      fill="none"
    />
    <line
      x1="2"
      y1="8"
      x2="22"
      y2="8"
      stroke="currentColor"
      stroke-width="2"
    />
    <circle cx="5" cy="6" r="0.5" fill="currentColor" />
    <circle cx="7" cy="6" r="0.5" fill="currentColor" />
    <circle cx="9" cy="6" r="0.5" fill="currentColor" />
    <polyline
      points="6,12 8,14 6,16"
      stroke="currentColor"
      stroke-width="1.5"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <line
      x1="10"
      y1="14"
      x2="16"
      y2="14"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
    />
  </svg>
</template>
<script setup>
defineProps({
  hasError: {
    type: Boolean,
    default: false
  }
})
</script>
<style scoped>
svg {
  color: #ddd;
  transition: color 0.3s ease;
}
svg.error-state {
  color: #ff4444;
  animation: pulse-error 1s infinite;
}
@keyframes pulse-error {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>
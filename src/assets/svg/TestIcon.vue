<template>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    :class="className"
  >
    <path d="M9 11H7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2"/>
    <path d="M9 11V9a3 3 0 0 1 6 0v2"/>
    <circle cx="12" cy="16" r="1"/>
    <path d="M12 3v6"/>
    <path d="M8 5l4-2 4 2"/>
  </svg>
</template>

<script setup>
defineProps({
  className: { type: String, default: '' }
})
</script>
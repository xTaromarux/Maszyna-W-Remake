<template>
  <header id="topBar">
    <polsl-logo-long-white class="logo" />

    <div class="flexRow">
      <button
        class="simpleSvgButton"
        aria-label="Open AI Chat"
        @click="$emit('open-chat')"
      >
        <AiChatIcon />
      </button>

      <button
        class="simpleSvgButton"
        aria-label="Open Settings"
        @click="$emit('open-settings')"
      >
        <KogWheelIcon />
      </button>

      <button
        class="simpleSvgButton"
        aria-label="Open Command List"
        @click="$emit('open-command-list')"
      >
        <ListIcon />
      </button>
    </div>
  </header>
</template>

<script setup>
import polslLogoLongWhite from '@/assets/svg/polslLogoLongWhite.vue'
import AiChatIcon         from '@/assets/svg/AiChatIcon.vue'
import KogWheelIcon       from '@/assets/svg/KogWheelIcon.vue'
import ListIcon           from '@/assets/svg/ListLinesIcon.vue'

defineEmits(['open-chat', 'open-settings', 'open-command-list'])
</script>


<template>
  <header id="topBar">
    <polsl-logo-long-white class="logo" />

    <div class="flexRow">
      <button
        class="simpleSvgButton"
        aria-label="Otwórz konsolę"
        @click="$emit('toggle-console')"
      >
        <ConsoleIcon 
          :hasError="hasConsoleErrors"
        />
      </button>

      <button
        class="simpleSvgButton"
        aria-label="Otwórz czat AI"
        @click="$emit('open-chat')"
      >
        <AiChatIcon 
        fillColor="#ddd"
        strokeColor="#ddd"
        strokeWidth="250"
        />
      </button>

      <button
        class="simpleSvgButton"
        aria-label="Otwórz ustawienia"
        @click="$emit('open-settings')"
      >
        <KogWheelIcon />
      </button>
    </div>
  </header>
</template>

<script setup>
import polslLogoLongWhite from '@/assets/svg/polslLogoLongWhite.vue'
import AiChatIcon         from '@/components/AiChatIcon.vue'
import KogWheelIcon       from '@/assets/svg/KogWheelIcon.vue'
import ConsoleIcon        from '@/assets/svg/ConsoleIcon.vue'

defineProps({
  hasConsoleErrors: {
    type: Boolean,
    default: false
  }
})

defineEmits(['open-chat', 'open-settings', 'toggle-console'])
</script>


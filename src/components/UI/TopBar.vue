<template>
  <header id="topBar">
    <polsl-logo-long-white class="logo" />

    <div class="flexRow">
      <button
        class="simpleSvgButton"
        aria-label="Open Console"
        @click="$emit('toggle-console')"
      >
        <ConsoleIcon 
          :hasError="hasConsoleErrors"
        />
      </button>

      <button
        class="simpleSvgButton"
        aria-label="Open AI Chat"
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
        <CommandListIcon />
      </button>
    </div>
  </header>
</template>

<script setup>
import polslLogoLongWhite from '@/assets/svg/polslLogoLongWhite.vue'
import AiChatIcon         from '@/components/AiChatIcon.vue'
import KogWheelIcon       from '@/assets/svg/KogWheelIcon.vue'
import CommandListIcon    from '@/assets/svg/CommandListIcon.vue'
import ConsoleIcon        from '@/assets/svg/ConsoleIcon.vue'

defineProps({
  hasConsoleErrors: {
    type: Boolean,
    default: false
  }
})

defineEmits(['open-chat', 'open-settings', 'open-command-list', 'toggle-console'])
</script>


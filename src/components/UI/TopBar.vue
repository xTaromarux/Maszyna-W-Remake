<template>
  <header id="topBar">
    <polsl-logo-long-white class="logo" />

    <div class="flexRow">
      <!-- WS status badge -->
      <button
        v-if="platform === 'esp'"
        class="wsBadge"
        :class="{
          'ws--ok'      : wsStatus === 'connected',
          'ws--pending' : wsStatus === 'connecting',
          'ws--err'     : wsStatus === 'error',
          'ws--off'     : wsStatus === 'disconnected'
        }"
        :title="wsTitle"
        aria-label="Status połączenia z urządzeniem"
        @click="$emit('ws-reconnect')"
      >
        <span class="dot" :class="{ spin: wsStatus === 'connecting' }" />
        <span class="label">{{ wsLabel }}</span>
      </button>

      <button
        class="simpleSvgButton"
        aria-label="Otwórz konsolę"
        @click="$emit('toggle-console')"
      >
        <ConsoleIcon :hasError="hasConsoleErrors" />
      </button>

      <button
        v-if="platform !== 'esp'"
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
import { computed } from 'vue'
import polslLogoLongWhite from '@/assets/svg/polslLogoLongWhite.vue'
import AiChatIcon         from '@/components/AiChatIcon.vue'
import KogWheelIcon       from '@/assets/svg/KogWheelIcon.vue'
import ConsoleIcon        from '@/assets/svg/ConsoleIcon.vue'

const platform = import.meta.env.VITE_APP_PLATFORM;

const props = defineProps({
  hasConsoleErrors: { type: Boolean, default: false },
  // 'connecting' | 'connected' | 'error' | 'disconnected'
  wsStatus: { type: String, default: 'disconnected' }
})

defineEmits(['open-chat', 'open-settings', 'toggle-console', 'ws-reconnect'])

const wsLabel = computed(() => {
  switch (props.wsStatus) {
    case 'connected':   return 'Połączono';
    case 'connecting':  return 'Łączenie…';
    case 'error':       return 'Błąd połączenia';
    default:            return 'Brak połączenia';
  }
})

const wsTitle = computed(() => {
  switch (props.wsStatus) {
    case 'connected':   return 'Połączenie aktywne – kliknij, aby odświeżyć.';
    case 'connecting':  return 'Łączenie… – kliknij, aby spróbować ponownie.';
    case 'error':       return 'Błąd – kliknij, aby ponowić połączenie.';
    default:            return 'Nie połączono – kliknij, aby połączyć.';
  }
})
</script>

<style scoped>
/* layout z Twojego pliku */
.flexRow { display: flex; gap: .25rem; align-items: center; }

/* WS badge */
.wsBadge{
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: .35rem .6rem;
  border-radius: 999px;
  font-size: .78rem;
  line-height: 1;
  border: 1px solid transparent;
  background: rgba(255,255,255,.08);
  color: #e6e6e6;
  cursor: pointer;
  transition: transform .12s ease, background .12s ease, opacity .2s ease;
  opacity: .95;
  margin-right: .25rem;
}
.wsBadge:hover{ transform: translateY(-1px); opacity: 1; }

.wsBadge .dot{
  width: .6rem; height: .6rem; border-radius: 50%;
  background: currentColor;
  position: relative;
}
.wsBadge .dot.spin::after{
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: spin 1s linear infinite;
  opacity: .7;
}
@keyframes spin { to { transform: rotate(360deg); } }

.ws--ok      { background: rgba( 46,204,113,.14); color: #2ecc71; border-color: rgba(46,204,113,.35); }
.ws--pending { background: rgba(255,191,0,.14);   color: #ffbf00; border-color: rgba(255,191,0,.35); }
.ws--err     { background: rgba(255,99,99,.12);   color: #ff5c5c; border-color: rgba(255,99,99,.30); }
.ws--off     { background: rgba(128,128,128,.10); color: #bdbdbd; border-color: rgba(189,189,189,.28); }
</style>

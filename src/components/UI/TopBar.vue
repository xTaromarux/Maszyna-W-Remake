<template>
  <header id="topBar">
    <polsl-logo-long-white class="logo" />

    <div class="flexRow">
      <!-- WS status badge -->
      <button
        v-if="platform === 'esp'"
        class="wsBadge"
        :class="{
          'ws--ok': wsStatus === 'connected',
          'ws--pending': wsStatus === 'connecting',
          'ws--err': wsStatus === 'error',
          'ws--off': wsStatus === 'disconnected',
        }"
        :title="wsTitle"
        :aria-label="t('topBar.wsStatusAria')"
        @click="$emit('ws-reconnect')"
      >
        <span class="dot" :class="{ spin: wsStatus === 'connecting' }" />
        <span class="label">{{ wsLabel }}</span>
      </button>

      <button class="simpleSvgButton" :aria-label="t('topBar.openConsole')" @click="$emit('toggle-console')">
        <ConsoleIcon :hasError="hasConsoleErrors" />
      </button>

      <button v-if="platform !== 'esp'" class="simpleSvgButton" :aria-label="t('topBar.openChat')" @click="$emit('open-chat')">
        <AiChatIcon fillColor="#ddd" strokeColor="#ddd" strokeWidth="250" />
      </button>

      <button class="simpleSvgButton" :aria-label="t('topBar.openSettings')" @click="$emit('open-settings')">
        <KogWheelIcon />
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import polslLogoLongWhite from '@/assets/svg/polslLogoLongWhite.vue';
import AiChatIcon from '@/components/AiChatIcon.vue';
import KogWheelIcon from '@/assets/svg/KogWheelIcon.vue';
import ConsoleIcon from '@/assets/svg/ConsoleIcon.vue';

const platform = import.meta.env.VITE_APP_PLATFORM;

const props = defineProps({
  hasConsoleErrors: { type: Boolean, default: false },
  // 'connecting' | 'connected' | 'error' | 'disconnected'
  wsStatus: { type: String, default: 'disconnected' },
});

defineEmits(['open-chat', 'open-settings', 'toggle-console', 'ws-reconnect']);
const { t } = useI18n();

const wsLabel = computed(() => {
  switch (props.wsStatus) {
    case 'connected':
      return t('topBar.wsConnected');
    case 'connecting':
      return t('topBar.wsConnecting');
    case 'error':
      return t('topBar.wsError');
    default:
      return t('topBar.wsDisconnected');
  }
});

const wsTitle = computed(() => {
  switch (props.wsStatus) {
    case 'connected':
      return t('topBar.wsConnectedTitle');
    case 'connecting':
      return t('topBar.wsConnectingTitle');
    case 'error':
      return t('topBar.wsErrorTitle');
    default:
      return t('topBar.wsDisconnectedTitle');
  }
});
</script>

<style scoped>
.flexRow {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.wsBadge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  font-size: 0.78rem;
  line-height: 1;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.08);
  color: #e6e6e6;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    background 0.12s ease,
    opacity 0.2s ease;
  opacity: 0.95;
  margin-right: 0.25rem;
}
.wsBadge:hover {
  transform: translateY(-1px);
  opacity: 1;
}

.wsBadge .dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 50%;
  background: currentColor;
  position: relative;
}

.wsBadge .dot.spin::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: spin 1s linear infinite;
  opacity: 0.7;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.ws--ok {
  background: rgba(46, 204, 113, 0.14);
  color: #2ecc71;
  border-color: rgba(46, 204, 113, 0.35);
}
.ws--pending {
  background: rgba(255, 191, 0, 0.14);
  color: #ffbf00;
  border-color: rgba(255, 191, 0, 0.35);
}
.ws--err {
  background: rgba(255, 99, 99, 0.12);
  color: #ff5c5c;
  border-color: rgba(255, 99, 99, 0.3);
}
.ws--off {
  background: rgba(128, 128, 128, 0.1);
  color: #bdbdbd;
  border-color: rgba(189, 189, 189, 0.28);
}
</style>



<template>
  <div class="console-dock">
    <!-- Left vertical rail (like IntelliJ) -->
    <aside v-if="consoleOpen" class="controls-rail">

      <!-- Compile / Edit -->
      <button
        v-if="!codeCompiled"
        class="rail-btn"
        :disabled="isRunning || !hasCode"
        :title="$t('execution.compileTitle')"
        @click="$emit('compile')"
      >
        <!-- compile icon -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 7h18M5 7v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
      </button>

      <button
        v-else
        class="rail-btn"
        :disabled="isRunning"
        :title="$t('execution.editTitle')"
        @click="$emit('edit')"
      >
        <!-- edit icon -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9"/>
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/>
        </svg>
      </button>

      <!-- Step -->
      <button
        class="rail-btn"
        :disabled="isRunning || (!manualMode && !codeCompiled)"
        :title="!manualMode ? $t('execution.stepAuto') : $t('execution.stepManual')"
        @click="$emit('step')"
      >
        <!-- step icon -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 3v18"/>
          <path d="M9 7l8 5-8 5z"/>
        </svg>
      </button>

      <!-- Run / Stop -->
      <button
        v-if="!isRunning"
        class="rail-btn"
        :disabled="manualMode || !codeCompiled"
        :title="$t('execution.runTitle')"
        @click="$emit('run')"
      >
        <!-- run icon -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>

      <button
        v-else
        class="rail-btn"
        :title="$t('execution.stopTitle')"
        @click="$emit('stop')"
      >
        <!-- stop icon -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <rect x="6" y="6" width="12" height="12" rx="1"/>
        </svg>
      </button>

      <!-- Run fast OR busy indicator -->
      <button
        v-if="!isRunning"
        class="rail-btn"
        :disabled="manualMode || !codeCompiled"
        :title="$t('execution.runFastTitle')"
        @click="$emit('run-fast')"
      >
        <!-- rocket/fast icon -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 19c.5-1.5 2-4 6-4s5.5 2.5 6 4"/>
          <path d="M12 3l3 3-3 9-3-9 3-3z"/>
        </svg>
      </button>

      <button
        v-else-if="isFastRunning"
        class="rail-btn spinning"
        :title="$t('execution.runningFast', { progress: fastProgress })"
        @click="$emit('stop')"
      >
        <!-- spinner -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" opacity=".25"/>
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>

      <div class="divider"></div>

      <!-- Breakpoints: enable/disable (wygaszenie) -->
      <button
        class="rail-btn"
        :class="{ active: breakpointsEnabled }"
        :title="breakpointsEnabled ? $t('consoleDock.breakpointsDisable') : $t('consoleDock.breakpointsEnable')"
        @click="$emit('update:breakpointsEnabled', !breakpointsEnabled)"
      >
        <!-- dot icon -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="12" r="6"/>
        </svg>
      </button>

      <!-- Tymczasowo wyĹ‚Ä…cz wszystkie (toggle off) -->
      <button
        class="rail-btn"
        :title="$t('consoleDock.breakpointsDisableAll')"
        @click="$emit('disable-all-breakpoints')"
      >
        <!-- crossed dot -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="6"/>
          <path d="M5 5l14 14"/>
        </svg>
      </button>

      <!-- WyczyĹ›Ä‡ (usuĹ„ wszystkie) -->
      <button
        class="rail-btn"
        :title="$t('consoleDock.breakpointsClearAll')"
        @click="$emit('clear-breakpoints')"
      >
        <!-- trash -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 6h18"/>
          <path d="M19 6v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
          <path d="M10 11v6M14 11v6"/>
        </svg>
      </button>
    </aside>

    <!-- Console content -->
    <section v-if="consoleOpen" class="console-wrap">
      <Console
        :logs="logs"
        @close="$emit('close')"
        @clear="$emit('clear')"
      />
    </section>

    <!-- Console Dock indicator - visible only when console is collapsed -->
    <div
      v-if="!consoleOpen"
      class="console-dock-indicator"
      :class="{ 'has-errors': hasConsoleErrors }"
      @click="$emit('open')"
      :title="$t('consoleDock.openConsole')"
    />
  </div>
</template>

<script>
import Console from '@/components/Console/Console.vue'

export default {
  name: 'ConsoleDock',
  components: { Console },
  props: {
    // execution state
    manualMode:   { type: Boolean, required: true },
    codeCompiled: { type: Boolean, required: true },
    code:         { type: String,  required: true },
    isRunning:    { type: Boolean, required: true },
    isFastRunning:{ type: Boolean, default: false },
    fastProgress: { type: Number,  default: 0 },

    // console
    logs: { type: Array, default: () => [] },
    consoleOpen: { type: Boolean, default: true },
    hasConsoleErrors: { type: Boolean, default: false },

    // breakpoints
    breakpointsEnabled: { type: Boolean, default: true }
  },
  emits: [
    'compile','edit','step','run','run-fast','stop',
    'close','clear','open',
    'update:breakpointsEnabled','disable-all-breakpoints','clear-breakpoints'
  ],
  computed: {
    hasCode() {
      return typeof this.code === 'string' && this.code.trim().length > 0;
    }
  }
}
</script>

<style scoped>
.console-dock {
  display: grid;
  grid-template-columns: 3.5rem 1fr; /* left rail + console */
  gap: 0.75rem;
  align-items: stretch;
  width: 100%;
  font-family: inherit;
  
  /* Smooth transitions for collapsing/expanding */
  transition:
    height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    min-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease,
    gap 0.3s ease,
    padding 0.3s ease;
  
  overflow: hidden;
  min-height: 14rem;
  height: auto;
}

.controls-rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.5rem;
  border: 1px solid var(--panelOutlineColor, #2a3441);
  border-radius: 8px;
  background: var(--panelBackgroundColor, #1e1f24);
  box-shadow:
    0 4px 14px rgba(0, 0, 0, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
}

.controls-rail::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accentColor, #00aaff), transparent);
  opacity: 0.35;
  border-radius: 8px 8px 0 0;
}

.rail-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
  box-sizing: border-box;
  outline: none;
  appearance: none;
  border-radius: 6px;
  border: 1px solid var(--panelOutlineColor, #2a3441);
  background: var(--buttonBackgroundColor, #373a41);
  color: var(--buttonTextColor, #d5d6db);
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.1s ease,
    box-shadow 0.2s ease;
  position: relative;
  font-size: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
}

.rail-btn:hover {
  background: var(--buttonHoverColor, #676b75);
  border-color: var(--accentColor, #00aaff);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  transform: translateY(-1px);
}

.rail-btn:active {
  transform: translateY(0);
  background: var(--buttonActiveColor, #181a1f);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.16);
}

.rail-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  border-color: var(--panelOutlineColor, #3a3d45);
  color: var(--buttonTextColor, #d5d6db);
  background: var(--buttonBackgroundColor, #373a41);
}

.rail-btn:disabled:hover {
  transform: none;
  box-shadow: none;
  background: var(--buttonBackgroundColor, #373a41);
  border-color: var(--panelOutlineColor, #3a3d45);
}

.rail-btn.active {
  background: var(--primaryColor, #003c7d);
  border-color: var(--primaryColor, #003c7d);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.22);
  color: #ffffff;
}

.divider {
  width: 80%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--panelOutlineColor, #3a3d45), transparent);
  margin: 0.25rem 0;
}

.console-wrap {
  min-height: 14rem;
  border-radius: 8px;
}

/* Enhanced spinner animation */
.spinning {
  background: var(--buttonHoverColor, #676b75) !important;
  border-color: var(--accentColor, #00aaff) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;
}

.spinning svg {
  animation: spin 0.8s linear infinite;
  filter: drop-shadow(0 0 2px var(--accentColor, #00aaff));
}

@keyframes spin { 
  to { transform: rotate(360deg); } 
}

/* Enhanced hover effects */
.rail-btn:not(:disabled):hover svg {
  filter: drop-shadow(0 0 1px currentColor);
}

/* Collapsed state for the entire console dock */
.console-dock.console-collapsed {
  height: 0;
  min-height: 0;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  padding: 0;
  border: none;
  gap: 0;
  
  /* Faster collapse transition */
  transition:
    height 0.3s cubic-bezier(0.4, 0, 0.6, 1),
    min-height 0.3s cubic-bezier(0.4, 0, 0.6, 1),
    max-height 0.3s cubic-bezier(0.4, 0, 0.6, 1),
    opacity 0.2s ease,
    gap 0.2s ease,
    padding 0.2s ease;
}

.console-dock.console-collapsed:hover {
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

/* Console Dock indicator styles */
.console-dock-indicator {
  grid-area: c;
  height: 4px;
  width: 100%;
  background: linear-gradient(90deg, transparent, var(--panelOutlineColor, #3a3d45), transparent);
  border-radius: 2px;
  cursor: pointer;
  transition:
    height 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
  position: relative;
  justify-self: stretch;
  align-self: end;
}

.console-dock-indicator:hover {
  height: 6px;
  background: linear-gradient(90deg, transparent, var(--accentColor, #00aaff), transparent);
  box-shadow: 
    0 0 12px rgba(0, 0, 0, 0.18),
    0 2px 6px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
  transition:
    height 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.console-dock-indicator.has-errors {
  background: linear-gradient(90deg, transparent, #ff4444, transparent);
  animation: pulse-indicator 1s infinite;
}

.console-dock-indicator.has-errors:hover {
  background: linear-gradient(90deg, transparent, #ff6666, transparent);
}

@keyframes pulse-indicator {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}
</style>


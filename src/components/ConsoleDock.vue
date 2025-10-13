<template>
  <div class="console-dock">
    <!-- Left vertical rail (like IntelliJ) -->
    <aside v-if="consoleOpen" class="controls-rail">

      <!-- Compile / Edit -->
      <button
        v-if="!codeCompiled"
        class="rail-btn"
        :disabled="isRunning || !hasCode"
        :title="'Skompiluj program'"
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
        :title="'Wróć do edycji'"
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
        :title="!manualMode ? 'Następny takt' : 'Wykonaj rozkaz'"
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
        title="Uruchom program"
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
        title="Zatrzymaj wykonywanie"
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
        title="Uruchom całość (bez animacji)"
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
        title="Pracuję…"
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
        :title="breakpointsEnabled ? 'Wyłącz breakpointy (wygaszenie)' : 'Włącz breakpointy'"
        @click="$emit('update:breakpointsEnabled', !breakpointsEnabled)"
      >
        <!-- dot icon -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="12" r="6"/>
        </svg>
      </button>

      <!-- Tymczasowo wyłącz wszystkie (toggle off) -->
      <button
        class="rail-btn"
        title="Tymczasowo wyłącz wszystkie breakpointy"
        @click="$emit('disable-all-breakpoints')"
      >
        <!-- crossed dot -->
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="6"/>
          <path d="M5 5l14 14"/>
        </svg>
      </button>

      <!-- Wyczyść (usuń wszystkie) -->
      <button
        class="rail-btn"
        title="Usuń wszystkie breakpointy"
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
      title="Kliknij aby otworzyć konsolę"
    />
  </div>
</template>

<script>
import Console from '@/components/Console.vue'

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
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  
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
  border: 1px solid #2a3441;
  border-radius: 8px;
  background: linear-gradient(135deg, #0a0f1c 0%, #1a1f2e 100%);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  position: relative;
  
  /* Smooth entrance animation */
  animation: slideInLeft 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left center;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

.controls-rail::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, #64ffda, transparent);
  opacity: 0.3;
  border-radius: 8px 8px 0 0;
}

.rail-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 6px;
  border: 1px solid rgba(100, 255, 218, 0.3);
  background: rgba(255, 255, 255, 0.02);
  color: #64ffda;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  font-size: 0;
  
  /* Staggered entrance animation for buttons */
  animation: buttonSlideIn 0.3s ease-out both;
}

@keyframes buttonSlideIn {
  from {
    opacity: 0;
    transform: translateY(15px) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Stagger animation delays for each button */
.rail-btn:nth-child(1) { animation-delay: 0.1s; }
.rail-btn:nth-child(2) { animation-delay: 0.15s; }
.rail-btn:nth-child(3) { animation-delay: 0.2s; }
.rail-btn:nth-child(4) { animation-delay: 0.25s; }
.rail-btn:nth-child(5) { animation-delay: 0.3s; }
.rail-btn:nth-child(6) { animation-delay: 0.35s; }
.rail-btn:nth-child(7) { animation-delay: 0.4s; }
.rail-btn:nth-child(8) { animation-delay: 0.45s; }

.rail-btn:hover {
  background: rgba(100, 255, 218, 0.1);
  border-color: #64ffda;
  box-shadow: 0 0 12px rgba(100, 255, 218, 0.3);
  transform: translateY(-1px);
}

.rail-btn:active {
  transform: translateY(0);
  box-shadow: 0 0 8px rgba(100, 255, 218, 0.2);
}

.rail-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  border-color: rgba(136, 146, 176, 0.2);
  color: #8892b0;
  background: rgba(255, 255, 255, 0.01);
}

.rail-btn:disabled:hover {
  transform: none;
  box-shadow: none;
  background: rgba(255, 255, 255, 0.01);
  border-color: rgba(136, 146, 176, 0.2);
}

.rail-btn.active {
  background: rgba(100, 255, 218, 0.2);
  border-color: #64ffda;
  box-shadow: 
    0 0 15px rgba(100, 255, 218, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.rail-btn.active::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(45deg, #64ffda, #4fd1c7);
  border-radius: 6px;
  z-index: -1;
  opacity: 0.5;
}

.divider {
  width: 80%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(100, 255, 218, 0.3), transparent);
  margin: 0.25rem 0;
  position: relative;
  
  /* Divider entrance animation */
  animation: dividerExpand 0.4s ease-out 0.3s both;
}

@keyframes dividerExpand {
  from {
    width: 0;
    opacity: 0;
  }
  to {
    width: 80%;
    opacity: 1;
  }
}

.divider::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 4px;
  background: #64ffda;
  border-radius: 50%;
  box-shadow: 0 0 6px #64ffda;
  
  /* Glowing dot animation */
  animation: 
    dotAppear 0.3s ease-out 0.5s both,
    dotGlow 2s ease-in-out 0.8s infinite alternate;
}

@keyframes dotAppear {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}

@keyframes dotGlow {
  from {
    box-shadow: 0 0 6px #64ffda;
  }
  to {
    box-shadow: 0 0 12px #64ffda, 0 0 20px rgba(100, 255, 218, 0.3);
  }
}

.console-wrap {
  min-height: 14rem;
  border-radius: 8px;
  
  /* Smooth entrance animation */
  animation: slideInRight 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: right center;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

/* Enhanced spinner animation */
.spinning {
  background: rgba(100, 255, 218, 0.15) !important;
  border-color: #64ffda !important;
  box-shadow: 0 0 20px rgba(100, 255, 218, 0.4) !important;
}

.spinning svg {
  animation: spin 0.8s linear infinite;
  filter: drop-shadow(0 0 3px #64ffda);
}

@keyframes spin { 
  to { transform: rotate(360deg); } 
}

/* Pulse animation for active states */
@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 15px rgba(100, 255, 218, 0.4);
  }
  50% {
    box-shadow: 0 0 25px rgba(100, 255, 218, 0.6);
  }
}

.rail-btn.active {
  animation: pulse 2s infinite;
}

/* Subtle glow for enabled buttons */
.rail-btn:not(:disabled):not(.active) {
  box-shadow: 0 0 5px rgba(100, 255, 218, 0.1);
}

/* Enhanced hover effects */
.rail-btn:not(:disabled):hover svg {
  filter: drop-shadow(0 0 2px currentColor);
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
  background: linear-gradient(90deg, transparent, #64ffda, transparent);
  border-radius: 2px;
  cursor: pointer;
  transition:
    height 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
  position: relative;
  justify-self: stretch;
  align-self: end;
  
  /* Entrance animation when console collapses */
  animation: fadeInUp 0.3s ease-out 0.2s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.console-dock-indicator:hover {
  height: 6px;
  background: linear-gradient(90deg, transparent, #4fd1c7, transparent);
  box-shadow: 
    0 0 15px rgba(100, 255, 218, 0.4),
    0 2px 8px rgba(100, 255, 218, 0.2);
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

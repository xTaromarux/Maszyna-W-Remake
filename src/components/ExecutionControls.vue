<template>
  <div class="execution-controls">
    <button
      v-if="!codeCompiled"
      @click="$emit('compile')"
      :disabled="manualMode || isRunning || !code || !code.trim()"
      class="execution-btn execution-btn--compile"
      title="Skompiluj program"
    >
      <CompileIcon />
      <span>Kompiluj</span>
    </button>
    <button
      v-else
      @click="$emit('edit')"
      :disabled="isRunning"
      class="execution-btn execution-btn--edit"
      title="Wróć do edycji"
    >
      <EditIcon />
      <span>Edytuj</span>
    </button>
    <button
      @click="$emit('step')"
      :disabled="isRunning || (!manualMode && !codeCompiled)"
      class="execution-btn execution-btn--step"
      title="Krok wykonania"
    >
      <NextLineIcon />
      <span>{{ !manualMode ? 'Następny takt' : 'Wykonaj takt' }}</span>
    </button>
    <button
      v-if="!isRunning"
      @click="$emit('run')"
      :disabled="manualMode || !codeCompiled"
      class="execution-btn execution-btn--run"
      title="Uruchom program"
    >
      <RunIcon />
      <span>Uruchom</span>
    </button>
    <button
      v-else
      @click="$emit('stop')"
      class="execution-btn execution-btn--run"
      title="Zatrzymaj wykonywanie"
    >
      <RunIcon />
      <span>Stop</span>
    </button>
    <button
      v-if="!isRunning"
      @click="$emit('run-fast')"
      :disabled="manualMode || !codeCompiled"
      class="execution-btn execution-btn--run"
      title="Uruchom całość (bez animacji)"
    >
      <RunIcon />
      <span>Uruchom (bez animacji)</span>
    </button>
    <button
      v-else-if="isFastRunning"
      @click="$emit('stop')"
      class="execution-btn execution-btn--run"
      title="Zatrzymaj wykonywanie"
    >
      <span class="spinner" aria-hidden="true"></span>
      <span>Pracuję… {{ fastProgress }}%</span>
    </button>
  </div>
</template>
<script>
import CompileIcon from '@/assets/svg/CompileIcon.vue';
import EditIcon from '@/assets/svg/EditIcon.vue';
import NextLineIcon from '@/assets/svg/NextLineIcon.vue';
import RunIcon from '@/assets/svg/RunIcon.vue';
export default {
  name: 'ExecutionControls',
  components: { CompileIcon, EditIcon, NextLineIcon, RunIcon },
  props: {
    manualMode:   { type: Boolean, required: true },
    codeCompiled: { type: Boolean, required: true },
    code:         { type: String,  required: true },
    isRunning:    { type: Boolean, required: true },
    isFastRunning:{ type: Boolean, required: false, default: false },
    fastProgress: { type: Number,  required: false, default: 0 },
  },
  emits: ['compile', 'edit', 'step', 'run', 'run-fast', 'stop'],
};
</script>
<style scoped>
.spinner {
  width: 1em; height: 1em;
  border: 2px solid currentColor;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  margin-right: .5rem;
  animation: sp 0.6s linear infinite;
  vertical-align: -0.15em;
}
@keyframes sp { to { transform: rotate(360deg); } }
</style>
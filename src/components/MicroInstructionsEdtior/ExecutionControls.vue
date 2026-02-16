<template>
  <div class="execution-controls">
    <!-- Compile / Edit -->
    <button
      v-if="!codeCompiled"
      @click="$emit('compile')"
      :disabled="manualMode || isRunning || !code || !code.trim()"
      class="execution-btn execution-btn--compile"
      :title="$t('execution.compileTitle')"
    >
      <CompileIcon />
      <span>{{ $t('execution.compile') }} (DEBUG)</span>
    </button>

    <button
      v-else
      @click="$emit('edit')"
      :disabled="isRunning"
      class="execution-btn execution-btn--edit"
      :title="$t('execution.editTitle')"
    >
      <EditIcon />
      <span>{{ $t('execution.edit') }}</span>
    </button>

    <!-- Single-step execution -->
    <button
      @click="$emit('step')"
      :disabled="isRunning || (!manualMode && !codeCompiled)"
      class="execution-btn execution-btn--step"
      :title="$t('execution.stepTitle')"
    >
      <NextLineIcon />
      <span>{{ !manualMode ? $t('execution.stepAuto') : $t('execution.stepManual') }}</span>
    </button>
    <!-- Run / Stop -->
    <button
      v-if="!isRunning"
      @click="$emit('run')"
      :disabled="manualMode || !codeCompiled"
      class="execution-btn execution-btn--run"
      :title="$t('execution.runTitle')"
    >
      <RunIcon />
      <span>{{ $t('execution.run') }}</span>
    </button>

    <button v-else @click="$emit('stop')" class="execution-btn execution-btn--run" :title="$t('execution.stopTitle')">
      <RunIcon />
      <span>{{ $t('execution.stop') }}</span>
    </button>

    <button
      v-if="!isRunning"
      @click="$emit('run-fast')"
      :disabled="manualMode || !codeCompiled"
      class="execution-btn execution-btn--run"
      :title="$t('execution.runFastTitle')"
    >
      <RunIcon />
      <span>{{ $t('execution.runFast') }}</span>
    </button>

    <button v-else-if="isFastRunning" @click="$emit('stop')" class="execution-btn execution-btn--run" :title="$t('execution.stopTitle')">
      <span class="spinner" aria-hidden="true"></span>
      <span>{{ $t('execution.runningFast', { progress: fastProgress }) }}</span>
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
    manualMode: { type: Boolean, required: true },
    codeCompiled: { type: Boolean, required: true },
    code: { type: String, required: true },
    isRunning: { type: Boolean, required: true },
    isFastRunning: { type: Boolean, required: false, default: false },
    fastProgress: { type: Number, required: false, default: 0 },
  },
  emits: ['compile', 'edit', 'step', 'run', 'run-fast', 'stop'],
};
</script>

<style scoped>
.spinner {
  width: 1em;
  height: 1em;
  border: 2px solid currentColor;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  margin-right: 0.5rem;
  animation: sp 0.6s linear infinite;
  vertical-align: -0.15em;
}
@keyframes sp {
  to {
    transform: rotate(360deg);
  }
}
</style>

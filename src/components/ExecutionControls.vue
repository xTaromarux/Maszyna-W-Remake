<template>
  <div class="execution-controls">
    <!-- Compile / Edit -->
    <button
      v-if="!codeCompiled"
      @click="$emit('compile')"
      :disabled="isRunning || !code || !code.trim()"
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

    <!-- Single-step execution -->
    <button
      @click="$emit('step')"
      :disabled="isRunning || (!manualMode && !codeCompiled)"
      class="execution-btn execution-btn--step"
      title="Krok wykonania"
    >
      <NextLineIcon />
      <span>{{ !manualMode ? 'Następny takt' : 'Wykonaj rozkaz' }}</span>
    </button>

    <!-- Run / Stop -->
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
  },
  emits: ['compile', 'edit', 'step', 'run', 'stop'],
};
</script>

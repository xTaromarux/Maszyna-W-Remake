<template>
  <div class="execution-controls">
    <!-- Compile / Edit -->
    <button
      v-if="!codeCompiled"
      @click="$emit('compile')"
      :disabled="manualMode || code === ''"
      class="execution-btn execution-btn--compile"
    >
      <CompileIcon />
      <span>Compile</span>
    </button>

    <button
      v-else
      @click="$emit('edit')"
      :disabled="manualMode && codeCompiled"
      class="execution-btn execution-btn--edit"
    >
      <EditIcon />
      <span>Edit</span>
    </button>

    <!-- Single‑step execution -->
    <button 
      @click="$emit('step')" 
      :disabled="!manualMode && !codeCompiled"
      class="execution-btn execution-btn--step"
    >
      <NextLineIcon />
      <span>Next line</span>
    </button>

    <!-- Run program -->
    <button 
      @click="$emit('run')" 
      :disabled="manualMode || !codeCompiled"
      class="execution-btn execution-btn--run"
    >
      <RunIcon />
      <span>Run</span>
    </button>
  </div>
</template>

<script>
import CompileIcon from "@/assets/svg/CompileIcon.vue";
import EditIcon from "@/assets/svg/EditIcon.vue";
import NextLineIcon from "@/assets/svg/NextLineIcon.vue";
import RunIcon from "@/assets/svg/RunIcon.vue";

export default {
  name: "ExecutionControls",
  components: {
    CompileIcon,
    EditIcon,
    NextLineIcon,
    RunIcon,
  },
  props: {
    manualMode: { type: Boolean, required: true },
    codeCompiled: { type: Boolean, required: true },
    code: { type: String, required: true },
  },
  emits: ["compile", "edit", "step", "run"],
};
</script>

<style scoped></style>

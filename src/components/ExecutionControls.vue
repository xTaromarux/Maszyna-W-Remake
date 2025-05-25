<template>
  <div class="flexRow">
    <!-- Compile / Edit -->
    <button
      v-if="!codeCompiled"
      @click="$emit('compile')"
      :disabled="manualMode || code === ''"
    >
      Compile
    </button>

    <button
      v-else
      @click="$emit('edit')"
      :disabled="manualMode && codeCompiled"
    >
      Edit
    </button>

    <!-- Single‑step execution -->
    <button @click="$emit('step')" :disabled="!manualMode && !codeCompiled">
      Next line
    </button>

    <!-- Run program -->
    <button @click="$emit('run')" :disabled="manualMode || !codeCompiled">
      Run
    </button>
  </div>
</template>

<script>
export default {
  name: "ExecutionControls",
  props: {
    manualMode: { type: Boolean, required: true },
    codeCompiled: { type: Boolean, required: true },
    code: { type: String, required: true },
  },
  emits: ["compile", "edit", "step", "run"],
};
</script>

<style scoped></style>

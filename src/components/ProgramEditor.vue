<template>
  <div class="programEditor">
    <!-- Manual / Program toggle -->
    <div class="toggleButtonDiv toggleButtonProgram" :class="{ active: manualMode }">
      <span @click="$emit('setManualMode', true)">Tryb ręczny</span>
      <span @click="$emit('setManualMode', false)">Program</span>
    </div>

    <!-- Placeholder for future program chooser -->
    <div class="chooseProgram">
      <slot name="chooseProgram"></slot>
    </div>

    <!-- Manual mode instruction -->
    <div v-if="manualMode" class="manualModeInstruction">
      <p>Aby uruchomić program, kliknij wybrany sygnał i naciśnij 'następna linia'</p>
    </div>

    <!-- Code editor or compiled listing -->
    <textarea
      v-else-if="!codeCompiled"
      :value="code"
      placeholder="rozkaz"
      @input="$emit('update:code', $event.target.value)"
      class="no-horiz-resize"
    ></textarea>


    <div v-else class="compiledCode">
      <span
        v-for="(line, index) in compiledCode"
        :key="index"
        class="flexRow"
        :class="{ active: activeLine === index }"
      >
        <span>{{ index }}</span>
        <span>:</span>
        <span class="codeLine">{{ line }}</span>
      </span>
    </div>

    <!-- Preview of next-line signals (manual execution) -->
    <div class="nextLine" v-if="manualMode">
      <span v-if="nextLine && nextLine.size">Sygnały następnej linii:</span>
      <div class="flexRow">
        <div v-for="cmd in [...nextLine]" :key="cmd">
          <span>{{ cmd }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ProgramEditor",
  props: {
    manualMode: { type: Boolean, required: true },
    codeCompiled: { type: Boolean, required: true },
    code: { type: String, required: true },
    compiledCode: { type: Array, required: true },
    activeLine: { type: Number, required: true },
    nextLine: { type: Object, required: true }, // Set
  },
  emits: ["update:code", "setManualMode"],
};
</script>

<style scoped>
.toggleButtonProgram{
  width: 100%;
}

.programEditor{
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: flex-end;
    height: 100%;
}

.flexRow {
  max-width: 230px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

@media (max-width: 1080px) {
  textarea {
    height: 400px;
  }
}

@media (min-width: 1080px) {
  textarea {
    height: 94%;
  }
}

textarea {
  width: 100%;
  height: 470px;
  flex-grow: 1;
  margin-top: 0.7rem;
  padding: 0.5rem;
  border-radius: var(--default-border-radius, 0.25rem);
  border: 1px solid var(--panelOutlineColor, black);
  background-color: var(--panelBackgroundColor, white);
  color: var(--fontColor, black);
  font-family: monospace;
}

textarea:disabled {
  filter: contrast(0.5);
}

.compiledCode {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.5rem;
  flex-grow: 1;
}

.compiledCode .active {
  color: var(--signal-active);
}

.codeLine {
  flex-grow: 1;
  text-align: left;
  white-space: pre;
}

.nextLine {
  flex-grow: 1;
  width: 100%;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nextLine span {
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
}

.nextLine span span {
  white-space: pre;
}

.manualModeInstruction {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0.5rem 0 0 0;
  padding: 1rem;
  border-radius: var(--default-border-radius, 0.25rem);
  border: 1px solid var(--panelOutlineColor, black);
  background-color: var(--panelBackgroundColor, white);
  color: var(--fontColor, black);
  font-style: italic;
  text-align: center;
}

.manualModeInstruction p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}
</style>

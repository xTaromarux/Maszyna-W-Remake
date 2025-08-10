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

    <CodeMirrorEditor v-else-if="!codeCompiled" v-model="codeLocal" language="maszynaW" theme="mwTheme" />

    <div v-else class="compiledCode">
      <span v-for="(line, index) in compiledCode" :key="index" class="flexRow" :class="{ active: activeLine === index }">
        <span>{{ index }}</span>
        <span>:</span>
        <span class="codeLine">{{ line }}</span>
      </span>
    </div>

    <!-- Preview of next-line signals (manual execution) -->
    <div class="nextLine" v-if="manualMode">
      <span>Sygnały następnej linii:</span>
      <div class="flexRow">
        <div v-for="cmd in [...nextLine]" :key="cmd">
          <span>{{ cmd }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import CodeMirrorEditor from '@/components/CodeMirrorEditor.vue';

const props = defineProps({
  manualMode: { type: Boolean, required: true },
  codeCompiled: { type: Boolean, required: true },
  code: { type: String, required: true },
  compiledCode: { type: Array, required: true },
  activeLine: { type: Number, required: true },
  nextLine: { type: Object, required: true }, // Set
});
const emit = defineEmits(['update:code', 'setManualMode']);

const codeLocal = ref(props.code);
watch(codeLocal, (v) => {
  console.log('Updating code:', v);
  return emit('update:code', v);
});
watch(
  () => props.code,
  (v) => {
    if (v !== codeLocal.value) codeLocal.value = v;
  }
);
</script>

<style scoped>
.toggleButtonProgram {
  width: 100%;
}

.programEditor {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}

.flexRow {
  max-width: 230px;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.compiledCode {
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.5rem;
  flex-grow: 1;
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--panelOutlineColor, black);
  border-radius: var(--default-border-radius, 0.25rem);
  background-color: var(--panelBackgroundColor, white);
  font-family: monospace;
  font-size: 0.9rem;
}

.compiledCode .flexRow {
  max-width: none;
  flex-wrap: nowrap;
  gap: 0.5rem;
  padding: 0.25rem;
  border-radius: 3px;
  transition: background-color 0.2s ease;
  min-height: 1.5em;
  align-items: center;
  display: flex;
  flex-direction: row;
}

.compiledCode .flexRow > span:first-child {
  min-width: 3rem;
  text-align: right;
  font-weight: bold;
  color: #666;
  flex-shrink: 0;
}

.compiledCode .flexRow > span:nth-child(2) {
  flex-shrink: 0;
  color: #666;
}

.compiledCode .flexRow:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.compiledCode .active {
  color: var(--signal-active);
  background-color: rgba(0, 170, 255, 0.1);
  font-weight: bold;
}

.compiledCode .active > span:first-child {
  color: var(--signal-active);
}

.codeLine {
  flex-grow: 1;
  text-align: left;
  white-space: pre-wrap;
  word-break: break-word;
  padding-left: 0.5rem;
  line-height: 1.4;
}

.monaco-container {
  flex: 1;
  min-height: 300px;
  margin-bottom: 0.7rem;
  border: 1px solid var(--panelOutlineColor, black);
  border-radius: var(--default-border-radius, 0.25rem);
}

.nextLine {
  flex-grow: 1;
  width: 100%;
  min-height: 200px;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  padding: 0.5rem;
  border: 1px solid var(--panelOutlineColor, black);
  border-radius: var(--default-border-radius, 0.25rem);
  background-color: var(--panelBackgroundColor, white);
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
  width: 100%;
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

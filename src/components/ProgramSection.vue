<template>
  <div id="program" v-if="!manualMode">
    <CodeMirrorEditor v-if="!programCompiled" v-model="programLocal" language="macroW" theme="macroTheme" />

    <div class="flexRow">
      <button
        v-if="!programCompiled"
        @click="compileProgram"
        :disabled="manualMode || !programLocal.trim()"
        class="execution-btn execution-btn--compile"
      >
        <CompileIcon />
        <span>Kompiluj</span>
      </button>

      <button v-else @click="uncompileProgram" :disabled="manualMode" class="execution-btn execution-btn--edit">
        <EditIcon />
        <span>Edytuj</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import CompileIcon from '@/assets/svg/CompileIcon.vue';
import EditIcon from '@/assets/svg/EditIcon.vue';
import CodeMirrorEditor from '@/components/CodeMirrorEditor.vue';

// Import WLAN compilation modules
import { parse } from '@/WLAN/parser';
import { analyzeSemantics } from '@/WLAN/semanticAnalyzer';
import { generateMicroProgram } from '@/WLAN/microGenerator';

// Props from parent
const props = defineProps({
  manualMode: { type: Boolean, required: true },
  commandList: { type: Array, required: true },
});

// Events to parent: update assembled code, log messages
const emit = defineEmits(['update:code', 'log']);

// Local state
const programLocal = ref('');
const programCompiled = ref(false);

// Compile high-level commands into assembler code using WLAN system
function compileProgram() {
  try {
    // Step 1: Parse the source code into AST
    const ast = parse(programLocal.value);

    // Step 2: Perform semantic analysis (resolve labels, validate)
    console.log(ast);
    const analyzedNodes = analyzeSemantics(ast);

    // Step 3: Generate microprogram
    const microProgram = generateMicroProgram(analyzedNodes);

    // Step 4: Convert microprogram to assembler format expected by the rest of the system
    const asmFragments = [];

    for (const entry of microProgram) {
      // Each entry has asmLine (for display) and phases (microinstructions)
      for (const phase of entry.phases) {
        if (phase.conditional) {
          // Handle conditional phases (SOM, SOZ)
          const flag = phase.flag;
          const truePhase = phase.truePhases[0];
          const falsePhase = phase.falsePhases[0];

          const trueSignals = Object.keys(truePhase).join(' ');
          const falseSignals = Object.keys(falsePhase).join(' ');

          asmFragments.push(`IF ${flag} THEN ${trueSignals} ELSE ${falseSignals}`);
        } else {
          // Regular phase - extract signals
          const signals = Object.keys(phase).join(' ');
          if (signals.trim()) {
            asmFragments.push(signals);
          }
        }
      }
    }

    // Step 5: Join fragments and emit to parent
    const finalAsm = asmFragments.join(';\n') + ';';
    emit('update:code', finalAsm);

    // Step 6: Update state and log success
    programCompiled.value = true;
    emit('log', {
      message: 'Program skompilowany pomyślnie przy użyciu systemu WLAN',
      class: 'kompilator rozkazów',
    });
  } catch (error) {
    // Handle compilation errors
    emit('log', {
      message: `Błąd kompilacji: ${error.message}`,
      class: 'Error',
    });
  }
}

// Unlock for editing
function uncompileProgram() {
  programCompiled.value = false;
  emit('log', {
    message: 'Program odblokowany do edycji',
    class: 'system',
  });
}
</script>

<style scoped>
#program {
  grid-area: p;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: stretch;
  align-items: stretch;
}

@media (min-width: 1400px) {
  #program {
    width: 20rem;
  }
}

.flexRow {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.monaco-container {
  flex-grow: 1;
  min-height: 300px;
  border: 1px solid var(--panelOutlineColor, black);
  border-radius: var(--default-border-radius, 0.25rem);
  background-color: var(--panelBackgroundColor, white);
}

.execution-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: var(--default-border-radius, 0.25rem);
  cursor: pointer;
}

.execution-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.execution-btn--compile {
  background-color: var(--signal-active);
  color: #fff;
}

.execution-btn--edit {
  background-color: var(--buttonBackgroundColor);
  color: var(--fontColor);
}
</style>

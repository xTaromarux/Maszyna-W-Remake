<template>
  <div id="program" v-if="!manualMode">
    <CodeMirrorEditor
      v-if="!programCompiled"
      v-model="programLocal"
      language="macroW"
      theme="macroTheme"
      :programCompiled="programCompiled"
      :onCompile="compileProgram"
      :onEdit="uncompileProgram"
    />

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

// Events to parent: update assembled code, log messages, initialize memory
const emit = defineEmits(['update:code', 'log', 'initMemory']);

// Local state
const programLocal = ref('');
const programCompiled = ref(false);

// Compile high-level commands into assembler code using WLAN system
function compileProgram() {
  try {
    /* 1. AST */
    const ast = parse(programLocal.value);

    /* 2. Analiza semantyczna */
    const analyzedNodes = analyzeSemantics(ast);

    /* 3. Wyodrębnij inicjalizacje pamięci na podstawie dyrektyw RST/RPA */
    const initAssignments = [];
    for (const node of analyzedNodes) {
      if (node.type === 'Directive' && node._initMemory) {
        const { addr, val } = node._initMemory;
        initAssignments.push({ addr, val });
      }
    }
    if (initAssignments.length) {
      emit('initMemory', initAssignments);
    }

    /* 4. Generowanie mikro‑programu */
    const microProgram = generateMicroProgram(analyzedNodes);
    console.log('Wygenerowany mikro‑program:', microProgram);

    /* 5. Konwersja mikro‑instrukcji do tekstu (bez dyrektyw) */
    const asmFragments = [];
    for (const entry of microProgram) {
      for (const phase of entry.phases) {
        if (phase.conditional === true) {
          const flag = phase.flag;
          const trueSignals = Object.keys(phase.truePhases[0])
            .filter((key) => phase.truePhases[0][key])
            .join(' ');
          const falseSignals = Object.keys(phase.falsePhases[0])
            .filter((key) => phase.falsePhases[0][key])
            .join(' ');
          // Wymagany format z etykietami i domknięciem KONIEC
          asmFragments.push(`IF ${flag} THEN @zero ELSE @niezero` + ` @zero ${trueSignals} KONIEC` + ` @niezero ${falseSignals}`);
        } else {
          const signals = Object.keys(phase)
            .filter((key) => phase[key] === true)
            .join(' ');
          if (signals.trim()) asmFragments.push(signals);
        }
      }
    }

    /* 6. Emit wynik */
    const finalMicroSignals = asmFragments.map((line) => `${line};`).join('\n');
    console.log('Wygenerowany kod assemblera:', finalMicroSignals);
    // Emit both human-readable text and the structured micro program (with pc/meta)
    emit('update:code', { text: finalMicroSignals, program: microProgram });

    /* 7. Sukces */
    programCompiled.value = true;
    emit('log', {
      message: 'Program skompilowany pomyślnie przy użyciu systemu WLAN',
      class: 'kompilator rozkazów',
    });
  } catch (error) {
    // For WlanError or BaseAppError, pass the full error object for enhanced display
    if (error && (error.level || error.code || error.hint || error.loc || error.frame)) {
      emit('log', {
        message: `Błąd kompilacji: ${error.message || String(error)}`,
        class: 'Error',
        error: error,
      });
    } else {
      // Legacy error handling for unknown error types
      const parts = [`Błąd kompilacji: ${error?.message || String(error)}`];
      if (error && error.frame) parts.push('\n' + error.frame);
      if (error && error.hint) parts.push(`\nPodpowiedź: ${error.hint}`);
      emit('log', { message: parts.join(''), class: 'Error' });
    }
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

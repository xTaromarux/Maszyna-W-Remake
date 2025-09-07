<template>
  <div id="program" v-if="!manualMode">
    <CodeMirrorEditor
      :disable="programCompiled"
      v-model="programLocal"
      language="macroW"
      theme="macroTheme"
      maxHeight="35.6rem"
      :commandList="commandList"
      :autocomplete-enabled="props.autocompleteEnabled"
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

// WLAN
import { parse } from '@/WLAN/parser';
import { analyzeSemantics } from '@/WLAN/semanticAnalyzer';
import { generateMicroProgram, injectCJumpMeta } from '@/WLAN/microGenerator';

const props = defineProps({
  manualMode: { type: Boolean, required: true },
  commandList: { type: Array, required: true },
  program: { type: String, required: true },
  autocompleteEnabled: { type: Boolean, default: true },
});

const emit = defineEmits(['update:code', 'log', 'initMemory']);

const programLocal = ref(props.program);
const programCompiled = ref(false);

function compileProgram() {
  try {
    const ast = parse(programLocal.value);
    const analyzedNodes = analyzeSemantics(ast);

    // --- Dyrektywy inicjalizacji pamięci -> do rodzica
    const initAssignments = [];
    for (const node of analyzedNodes) {
      if (node.type === 'Directive' && node._initMemory) {
        const { addr, val } = node._initMemory;
        initAssignments.push({ addr, val });
      }
    }
    // Argumenty rozkazów -> pamięć programu PC=0,1,2…
    let pcAddr = 0;
    for (const node of analyzedNodes) {
      if (node.type === 'Instruction') {
        const argVal = node.operands?.[0]?.value ?? 0;
        initAssignments.push({ addr: pcAddr, val: argVal });
        pcAddr++;
      } else if (node.type === 'Directive' && node.name?.toUpperCase() === 'ORG') {
        pcAddr = node.operands?.[0]?.value ?? pcAddr;
      }
    }
    if (initAssignments.length) emit('initMemory', initAssignments);

    // --- Mikro-program
    let microProgram = generateMicroProgram(analyzedNodes, props.commandList);

    // (opcjonalne) wstrzyknięcie metadanych CJUMP (zachowujemy srcLine później)
    microProgram = injectCJumpMeta(microProgram);

    // --- Konwersja na tekst + PRECYZYJNE mapowanie srcLine
    const asmFragments = [];
    let lineNo = 0;

    for (const entry of microProgram) {
      for (const phase of entry.phases) {
        if ((phase).conditional === true) {
          const flag = (phase).flag;

          // IF
          (phase).srcLine = lineNo;
          asmFragments.push(`IF ${flag} THEN @zero ELSE @niezero;`);
          lineNo++;

          // @zero ...
          const t = (phase).truePhases?.[0] ?? {};
          const f = (phase).falsePhases?.[0] ?? {};

          const trueSignals = Object.keys(t).filter(k => (t)[k]).join(' ');
          const falseSignals = Object.keys(f).filter(k => (f)[k]).join(' ');

          (t).srcLine = lineNo; // ⬅ przypięcie @zero
          asmFragments.push(
            trueSignals ? `@zero ${trueSignals} KONIEC;` : `@zero;`
          );
          lineNo++;

          // @niezero …
          (f).srcLine = lineNo; // ⬅ przypięcie @niezero
          asmFragments.push(
            falseSignals ? `@niezero ${falseSignals};` : `@niezero;`
          );
          lineNo++;

        } else {
          // zwykła faza
          const signals = Object.keys(phase).filter((key) => (phase)[key] === true).join(' ');
          if (signals.trim()) {
            (phase).srcLine = lineNo;             // <-- mapowanie 1:1 faza → linia
            asmFragments.push(`${signals};`);
            lineNo++;
          }
        }
      }

      const extra = (entry).meta?.postAsm;
      if (extra?.length) {
        for (const line of extra) {
          asmFragments.push(`${line};`);
          lineNo++; // te linie nie mają odpowiadających faz – ale zajmują miejsce w liście tekstowej
        }
      }
    }

    const finalMicroSignals = asmFragments.join('\n');
    emit('update:code', { text: finalMicroSignals, program: microProgram });

    programCompiled.value = true;
    emit('log', { message: 'Program skompilowany pomyślnie przy użyciu systemu WLAN', class: 'kompilator rozkazów' });
  } catch (error) {
    if (error && (error.level || error.code || error.hint || error.loc || error.frame)) {
      emit('log', {
        message: `Błąd kompilacji: ${error.message || String(error)}`,
        class: 'Error',
        error: error,
      });
    } else {
      const parts = [`Błąd kompilacji: ${error?.message || String(error)}`];
      if (error && error.frame) parts.push('\n' + error.frame);
      if (error && error.hint) parts.push(`\nPodpowiedź: ${error.hint}`);
      emit('log', { message: parts.join(''), class: 'Error' });
    }
  }
}

function uncompileProgram() {
  programCompiled.value = false;
  emit('log', { message: 'Program odblokowany do edycji', class: 'system' });
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
  min-height: 40rem;
  max-height: 40rem;
}

@media (min-width: 1380px) {
  #program { width: 20rem; }
}
@media (min-width: 1255px) and (max-width: 1380px) {
  #program { width: 12rem; }
}
@media (min-width: 1165px) and (max-width: 1255px) {
  #program { width: 8rem; }
}
@media (min-width: 675px) and (max-width: 1195px) {
  #program {
    width: 100%;
    justify-content: center;
    align-items: center;
    margin: 20px 0;
  }
}
@media (max-width: 675px) {
  #program { margin: 20px 0; }
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
</style>

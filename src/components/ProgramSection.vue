<template>
  <div id="program" v-if="!manualMode">

    <MonacoEditor v-model="programLocal" language="macroW" theme="macroTheme" :read-only="manualMode || programCompiled"
      class="monaco-container" />

    <div class="flexRow">
      <button v-if="!programCompiled" @click="compileProgram" :disabled="manualMode || !programLocal.trim()"
        class="execution-btn execution-btn--compile">
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
import { ref } from 'vue'
import MonacoEditor from './MonacoEditor.vue'
import CompileIcon from '@/assets/svg/CompileIcon.vue'
import EditIcon from '@/assets/svg/EditIcon.vue'

// Kompilacja pipeline
import { parse } from '../pipeline/parser'
import { analyzeSemantics } from '../pipeline/semanticAnalyzer'
import { generateMicroProgram } from '../pipeline/microGenerator'
import { initStore } from '../pipeline/simulator'
import { Debugger } from '../pipeline/debugger'

const props = defineProps({
  manualMode: { type: Boolean, required: true },
  commandList: { type: Array, required: true }
})

const emit = defineEmits([
  'update:code', 'log', 'update:store', 'update:debugger'
])

const programLocal = ref('')
const programCompiled = ref(false)

function compileProgram() {
  try {
    programCompiled.value = false;
    emit('log', { message: 'Rozpoczynam kompilację...', class: 'system' });

    // 🔧 Usunięcie \r (CR) z Windowsowych końców linii
    const sanitized = programLocal.value
      .replace(/\r\n/g, '\n')  // zamień CRLF → LF
      .replace(/\r/g, '');     // usuń ewentualne same CR
    console.log('PROGRAM:', programLocal.value);

    const ast = parse(sanitized);

    // Analiza semantyczna
    const checkedAst = analyzeSemantics(ast.body);

    // Generacja mikroprogramu
    const micro = generateMicroProgram(checkedAst);

    // Przygotowanie danych do pamięci (np. DATA / RST)
    const initialAssignments = checkedAst
      .filter(n => n.type === 'Directive' && n.name === 'DATA')
      .flatMap((n, i) =>
        n.operands.map((op, j) => ({
          addr: n.operands.length === 1 ? i : i + j,
          val: op.value
        }))
      );

    // Inicjalizacja maszyny i debuggera
    const store = initStore(256);
    initialAssignments.forEach(({ addr, val }) => {
      if (addr >= 0 && addr < store.mem.length) {
        store.mem[addr] = val;
      }
    });

    store.program = micro;
    const dbg = new Debugger(store);

    // Zapisz do UI
    emit('update:store', store);
    emit('update:debugger', dbg);
    emit('log', { message: 'Kompilacja zakończona pomyślnie.', class: 'system' });

    const microLines = micro.flatMap(line =>
      line.phases.map(phase =>
        Object.keys(phase).filter(k => phase[k]).join(' ')
      )
    );

    emit('update:code', microLines.join('\n'));
    emit('update:compiledCode', microLines);
    programCompiled.value = true;

  } catch (err) {
    emit('log', { message: `Błąd kompilacji: ${err.message}`, class: 'Error' });
  }
}


function uncompileProgram() {
  programCompiled.value = false
  emit('log', { message: 'Odblokowano edycję programu.', class: 'system' })
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

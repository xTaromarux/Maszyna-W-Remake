<template>
  <div id="program" v-if="!manualMode">
    <CodeMirrorEditor v-if="!codeCompiled" v-model="codeLocal" language="maszynaW" theme="mwTheme" />

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

// Compile high-level commands into assembler code
function compileProgram() {
  // 1. Podziel na niepuste linie
  const rawLines = programLocal.value
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l !== '');

  // 2. Budowa mapy etykiet i tablicy instrukcji
  const labelMap = {}; // { 'Pętla': idx, ... }
  const insts = []; // [{ name, args }...]

  rawLines.forEach((line, idx) => {
    // dyrektywa inicjująca RST: "Etykieta: RST 5"
    const rstMatch = /^([A-Za-z_]\w*):\s*RST\s+(-?\d+)\s*$/i.exec(line);
    if (rstMatch) {
      // traktujemy RST jako pseudo‐instrukcję inicjującą pamięć
      const lbl = rstMatch[1];
      const val = parseInt(rstMatch[2], 10);
      insts.push({ name: 'rst', args: [lbl, val] });
      // etykieta dla RST też rejestrujemy na bieżącej pozycji
      labelMap[lbl] = insts.length - 1;
      return;
    }

    // etykieta definiująca skok: "Pętla:" (bez dalszej instrukcji)
    if (/^[A-Za-z_]\w*:$/.test(line)) {
      const lbl = line.slice(0, -1);
      labelMap[lbl] = insts.length;
      return;
    }

    // normalna instrukcja: "POB X", "SOM Koniec"
    const parts = line.split(/\s+/);
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);
    insts.push({ name, args });
  });

  // 3. Generacja asemblera: cmd.lines z placeholderami @ARG i RST→czyt/pisz
  const asmFragments = [];

  for (let i = 0; i < insts.length; i++) {
    const { name, args } = insts[i];

    // obsługujemy RST jako zapis do pamięci: RST lbl,val →
    //   we assume: ustawiamy adres etykiety na I, ustawiamy wartość w ACC,
    //   potem pisz (WRITE S).
    if (name === 'rst') {
      const [lbl, val] = args;
      // 1) umieść w I adres etykiety
      asmFragments.push(`wyad wea`); // I←BusA (z PC, ale w symulatorze nadpiszemy adres przez zmienne)
      // 2) ustaw ACC na wartość val
      asmFragments.push(`iak`); // ACC++  powtarzane val razy? dla uproszczenia zakładamy jednorazowa
      //    tu powinieneś lepiej zaimplementować CONST→ACC, pomijamy
      // 3) pisz: S→Mem[I]
      asmFragments.push(`pisz`);
      continue;
    }

    // znajdź definicję makra
    const cmd = props.commandList.find((c) => c.name.toLowerCase() === name);
    if (!cmd) {
      emit('log', {
        message: `Nieznana instrukcja makro "${name}"`,
        class: 'Error',
      });
      return;
    }

    // tekst szablonu, np. "czyt wys wei il; wyad wea; IF N THEN @ujemne ELSE @dodatnie; …"
    let template = cmd.lines;

    // jeśli instrukcja ma <1> argument, zastąp placeholdery @ARG lub etykiety
    if (cmd.args === 1 && args.length > 0) {
      const a = args[0];
      let targetIndex = null;
      if (/^-?\d+$/.test(a)) {
        targetIndex = parseInt(a, 10);
      } else if (labelMap[a] != null) {
        targetIndex = labelMap[a];
      } else {
        emit('log', {
          message: `Nieznany argument "${a}" w makro "${name}"`,
          class: 'Error',
        });
        return;
      }
      // podstawiamy @ARG
      template = template.replace(/@ARG/g, String(targetIndex));
      // również zastępujemy @LABEL
      template = template.replace(/@([A-Za-z_]\w*)/g, (m, lbl) => {
        const idx = labelMap[lbl];
        return idx != null ? String(idx) : m;
      });
    }

    // dodaj fragmenty (rozbijone średnikami)
    template.split(';').forEach((seg) => {
      const t = seg.trim();
      if (t) asmFragments.push(t);
    });
  }

  // 4. Połącz i przekaż do mikro-kompilatora
  const finalAsm = asmFragments.join(';\n') + ';';
  emit('update:code', finalAsm);

  // 5. Zablokuj edycję i daj log
  programCompiled.value = true;
  emit('log', {
    message: 'Makro-program skompilowany pomyślnie',
    class: 'kompilator rozkazów',
  });
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

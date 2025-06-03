<template>
  <div id="program" v-if="!manualMode">
    <div class="code-editor-container">
      <div class="line-numbers" ref="lineNumbers">
        <div 
          v-for="(line, index) in lineNumbers" 
          :key="index" 
          class="line-number"
        >
          {{ index + 1 }}
        </div>
      </div>
      <textarea 
        v-model="program"
        ref="codeEditor"
        class="code-editor no-horiz-resize"
        :disabled="manualMode || programCompiled"
        @scroll="syncScroll"
        @input="updateLineNumbers"
        placeholder="Wpisz swój program tutaj, np:&#13;&#10;&#13;&#10;POB&#13;&#10;DOD"
        spellcheck="false"
      ></textarea>
    </div>
    <div class="flexRow">
      <button v-if="!programCompiled" @click="compileProgram" :disabled="manualMode || !program.trim()"
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

<script>
import EditIcon from "@/assets/svg/EditIcon.vue";
import CompileIcon from "@/assets/svg/CompileIcon.vue";

export default {
  name: 'ProgramSection',
  components: {
    CompileIcon,
    EditIcon,
  },
  props: {
    manualMode: { type: Boolean, required: true },
    commandList: { type: Array, required: true }
  },
  data() {
    return {
      program: '',
      programCompiled: false
    }
  },
  computed: {
    lineNumbers() {
      if (this.program.length === 0) {
        return [''];
      }
      return this.program.split('\n');
    }
  },
  methods: {
    syncScroll() {
      if (this.$refs.lineNumbers && this.$refs.codeEditor) {
        this.$refs.lineNumbers.scrollTop = this.$refs.codeEditor.scrollTop;
      }
    },
    updateLineNumbers() {
      this.$nextTick(() => {
        this.syncScroll();
      });
    },
    compileProgram() {
      const lines = this.program
        .split('\n')
        .map(l => l.trim())
        .filter(l => l !== '');

      console.log(lines);

      let codeFragments = [];
      for (const [i, name] of lines.entries()) {
        const cmd = this.commandList.find(
          c => c.name.toLowerCase() === name.toLowerCase()
        );
        if (!cmd) {
          this.$emit('log', { message: `Błąd programu: linia ${i + 1} \"${name}\" nie znaleziona`, class: 'Error' });
          return;
        }
        codeFragments.push(cmd.lines);

      }

      const compiled = codeFragments.join('\n');
      this.$emit('update:code', compiled);
      this.programCompiled = true;
      this.$emit('log', { message: "Kod skompilowany pomyślnie", class: "kompilator rozkazów" });
    },
    uncompileProgram() {
      this.programCompiled = false;
      this.$emit('log', { message: 'Program odblokowany do edycji', class: 'system' });
    }
  },
  mounted() {
    // Initialize line numbers
    this.updateLineNumbers();
  }
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

.code-editor-container {
  flex-grow: 1;
  display: flex;
  border: 1px solid var(--panelOutlineColor, black);
  border-radius: var(--default-border-radius, 0.25rem);
  background-color: var(--panelBackgroundColor, white);
  overflow: hidden;
  position: relative;
  height: 300px;
}

.line-numbers {
  background-color: var(--buttonBackgroundColor, #f8f9fa);
  border-right: 1px solid var(--panelOutlineColor, #e9ecef);
  padding: 0.5rem 0.5rem 0.5rem 0.25rem;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  color: var(--fontColor, #6c757d);
  opacity: 0.7;
  text-align: right;
  user-select: none;
  overflow: hidden;
  min-width: 2.5rem;
  height: 100%;
}

.line-number {
  height: 1.5em;
  white-space: nowrap;
}

.code-editor {
  flex-grow: 1;
  white-space: pre-wrap;
  overflow-wrap: break-word;
  padding: 0.5rem;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.5;
  color: var(--fontColor, black);
  background-color: transparent;
  border: none;
  outline: none;
  resize: none;
  white-space: pre;
  overflow-y: auto;
  overflow-x: auto;
  height: 100%;
  width: 100%;
}

.code-editor::placeholder {
  white-space: pre-wrap;
  overflow-wrap: break-word;
  opacity: 0.6;
}

.code-editor:focus {
  outline: none;
}

.code-editor:disabled {
  background-color: var(--buttonBackgroundColor, #f8f9fa);
  color: var(--fontColor, #6c757d);
  opacity: 0.6;
  cursor: not-allowed;
}

.code-editor-container:focus-within {
  border-color: #00aaff;
}

.flexRow {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
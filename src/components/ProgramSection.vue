<template>
    <div id="program" v-if="!manualMode">
      <textarea
        v-model="program"
        placeholder="program"
        :disabled="manualMode || programCompiled"
      />
      <div class="flexRow">
        <button
          @click="compileProgram"
          v-if="!programCompiled"
          :disabled="manualMode || !program.trim()"
        >
          Compile
        </button>
        <button
          @click="uncompileProgram"
          v-if="programCompiled"
          :disabled="manualMode"
        >
          Edit
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'ProgramSection',
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
    methods: {
      compileProgram() {
        const lines = this.program
          .split('\n')
          .map(l => l.trim())
          .filter(l => l !== '');
  
        let codeFragments = [];
        for (const [i, name] of lines.entries()) {
          const cmd = this.commandList.find(
            c => c.name.toLowerCase() === name.toLowerCase()
          );
          if (!cmd) {
            this.$emit('log', { message: `Program error: line ${i+1} \"${name}\" not found`, class: 'Error' });
            return;
          }
          codeFragments.push(cmd.lines);
        }
  
        const compiled = codeFragments.join('\n');
        this.$emit('update:code', compiled);
        this.programCompiled = true;
        this.$emit('log', { message: 'Program compiled successfully', class: 'program.compiler' });
      },
      uncompileProgram() {
        this.programCompiled = false;
        this.$emit('log', { message: 'Program unlocked for editing', class: 'system' });
      }
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

    textarea {
    flex-grow: 1;
    padding: 0.5rem;
    border-radius: var(--default-border-radius, 0.25rem);

    border: 1px solid var(--panelOutlineColor, black);
    background-color: var(--panelBackgroundColor, white);
    color: var(--fontColor, black);
    font-family: monospace;
    }

    textarea:focus {
    border: 1px solid #00aaff;
    }

    .flexRow {
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    align-items: center;
    }
  </style>
  
<template>
  <div id="program" v-if="!manualMode">
    <textarea v-model="program" placeholder="Wpisz swój program tutaj, np: &#13;&#10;&#13;&#10;POB &#13;&#10;DOD"
      :disabled="manualMode || programCompiled" />
    <div class="flexRow">
      <button v-if="!programCompiled" @click="compileProgram" :disabled="manualMode || !program.trim()"
        class="execution-btn execution-btn--compile">
        <CompileIcon />
        <span>Compile</span>
      </button>

      <button v-else @click="uncompileProgram" :disabled="manualMode" class="execution-btn execution-btn--edit">
        <EditIcon />
        <span>Edit</span>
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
  methods: {
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
          this.$emit('log', { message: `Program error: line ${i + 1} \"${name}\" not found`, class: 'Error' });
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
  width: 20rem;
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
  padding: 1rem;
  flex-direction: row;
  align-items: center;
}
</style>
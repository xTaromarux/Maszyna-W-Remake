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
      :onEdit="enableProgramEditing"
    />

    <div class="flexRow">
      <button
        v-if="!programCompiled"
        @click="compileProgram"
        :disabled="manualMode || !programLocal.trim()"
        class="execution-btn execution-btn--compile"
      >
        <CompileIcon />
        <span>{{ $t('execution.compile') }}</span>
      </button>

      <button v-else @click="enableProgramEditing" :disabled="manualMode" class="execution-btn execution-btn--edit">
        <EditIcon />
        <span>{{ $t('execution.edit') }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import CompileIcon from '@/assets/svg/CompileIcon.vue';
import EditIcon from '@/assets/svg/EditIcon.vue';
import CodeMirrorEditor from '@/components/CodeMirrorEditor.vue';

// WLAN
import { compileAsmToMicroProgram } from '@/WLAN/asmPipeline';

const props = defineProps({
  manualMode: { type: Boolean, required: true },
  commandList: { type: Array, required: true },
  program: { type: String, required: true },
  autocompleteEnabled: { type: Boolean, default: true },
  autoResetOnAsmCompile: { type: Boolean, default: false },
  codeBits: { type: Number, required: true },
  addresBits: { type: Number, required: true },
});

const emit = defineEmits(['update:code', 'log', 'initMemory', 'reset-registers']);

const programLocal = ref(props.program);
const programCompiled = ref(false);
const { t } = useI18n();

// ENTRY POINT FUNCTION FOR COMPILATION
function compileProgram() {
  console.log(t('logs.compileStart'));
  try {
    if (props.autoResetOnAsmCompile) {
      emit('reset-registers');
    }

    const { ir, initAssignments: dataAssignments, microProgram, microAsmText } = compileAsmToMicroProgram(
      programLocal.value,
      props.commandList
    );

    const opcodeLookup = new Map();
    props.commandList.forEach((cmd, idx) => {
      if (!cmd || cmd.name == null) return;
      const key = String(cmd.name).toUpperCase();
      if (!opcodeLookup.has(key)) {
        opcodeLookup.set(key, idx);
      }
    });

    const addressSpace = 2 ** props.addresBits;
    const addressMask = addressSpace - 1;
    const maxOpcode = 2 ** props.codeBits - 1;

    const initAssignments = dataAssignments.map((entry) => ({ addr: entry.addr, val: entry.val }));

    for (const node of ir.instructions) {
      const opcodeKey = String(node.name || '').toUpperCase();
      const opcode = opcodeLookup.get(opcodeKey);
      if (opcode == null) {
        throw new Error(t('logs.compileMissingOpcode', { name: node.name }));
      }
      if (opcode > maxOpcode) {
        throw new Error(
          t('logs.compileOpcodeTooLarge', {
            name: node.name,
            opcode,
            maxOpcode,
            codeBits: props.codeBits,
          })
        );
      }

      const argVal = node.operands?.[0]?.value ?? 0;
      if (argVal < 0 || argVal > addressMask) {
        throw new Error(
          t('logs.compileArgOutOfRange', {
            arg: argVal,
            name: node.name,
            max: addressMask,
            addrBits: props.addresBits,
          })
        );
      }

      const encodedValue = opcode * addressSpace + argVal;
      initAssignments.push({ addr: node.address, val: encodedValue });
    }

    if (initAssignments.length) {
      emit('initMemory', initAssignments);
    }

    console.log('Generated micro program:', microProgram);
    emit('update:code', { text: microAsmText, program: microProgram });

    programCompiled.value = true;
    emit('log', { message: t('logs.programCompiledWlan'), class: 'compiler' });
  } catch (error) {
    if (error && (error.level || error.code || error.hint || error.loc || error.frame)) {
      emit('log', {
        message: t('logs.compileError', { message: error.message || String(error) }),
        class: 'Error',
        error: error,
      });
    } else {
      const parts = [t('logs.compileError', { message: error?.message || String(error) })];
      if (error && error.frame) parts.push('\n' + error.frame);
      if (error && error.hint) parts.push(`\n${t('logs.compileHint', { hint: error.hint })}`);
      emit('log', { message: parts.join(''), class: 'Error' });
    }
  }
}

function enableProgramEditing() {
  programCompiled.value = false;
  emit('log', { message: t('logs.programUnlocked'), class: 'system' });
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
  #program {
    width: 20rem;
  }
}
@media (min-width: 1255px) and (max-width: 1380px) {
  #program {
    width: 12rem;
  }
}
@media (min-width: 1165px) and (max-width: 1255px) {
  #program {
    width: 8rem;
  }
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
  #program {
    margin: 20px 0;
  }
}

.flexRow {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}
</style>

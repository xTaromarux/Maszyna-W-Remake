<template>
  <vue-monaco-editor v-model:value="codeLocal" :language="language" :theme="theme" :options="editorOptions" class="monaco-container" />
</template>

<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';

// 1. Deklarujemy propsy z odpowiednimi typami
const props = defineProps<{
  modelValue: string;
  language?: string;
  theme?: string;
  readOnly?: boolean;
}>();

// 2. defineEmits z pełną sygnaturą: emit('update:modelValue', string)
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

// 3. Lokalny ref dla v-model
const codeLocal = ref(props.modelValue);

// 4. Watcher: przy zmianie codeLocal emitujemy nową wartość
watch(codeLocal, (v) => {
  emit('update:modelValue', v);
});

// 5. Watcher: synchronizujemy codeLocal gdy modelValue zmieni się z zewnątrz
watch(
  () => props.modelValue,
  (v) => {
    if (v !== codeLocal.value) {
      codeLocal.value = v;
    }
  }
);

// 6. Opcje edytora
const editorOptions = {
  readOnly: props.readOnly ?? false,
  wordWrap: 'on',
  minimap: { enabled: false },
  fontFamily: 'monospace',
  fontSize: 14,
  lineNumbers: 'on',
  automaticLayout: true,
};
</script>

<style scoped>
.monaco-container {
  width: 100%;
  height: 100%;
}
</style>

<template>
  <vue-monaco-editor v-model:value="codeLocal" :language="language" :theme="theme" :options="editorOptions" class="monaco-container" />
</template>
<script setup lang="ts">
import { ref, watch, defineProps, defineEmits } from 'vue';
const props = defineProps<{
  modelValue: string;
  language?: string;
  theme?: string;
  readOnly?: boolean;
}>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
const codeLocal = ref(props.modelValue);
watch(codeLocal, (v) => {
  emit('update:modelValue', v);
});
watch(
  () => props.modelValue,
  (v) => {
    if (v !== codeLocal.value) {
      codeLocal.value = v;
    }
  }
);
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
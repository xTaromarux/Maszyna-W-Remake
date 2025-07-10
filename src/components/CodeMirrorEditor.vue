<template>
  <div class="editor-wrapper" :class="{ 'full-screen': isFullScreen }" ref="editorWrapper">
    <button @click="toggleFullScreen" class="fullscreen-button">
      <svg
        v-if="!isFullScreen"
        key="maximize"
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
      </svg>
      <svg
        v-else
        key="minimize"
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
      </svg>
    </button>
    <div ref="editorContainer" class="codemirror-container" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, defineProps, defineEmits } from 'vue';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, StateEffect } from '@codemirror/state';
import { lineNumbers, highlightActiveLine, keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { autocompletion } from '@codemirror/autocomplete';
import { javascript } from '@codemirror/lang-javascript';

// Import custom languages and themes
import { maszynaW } from '../codemirror-langs/maszynaW.support.js';
import { macroW } from '../codemirror-langs/macroW.support.js';
import { mwTheme, macroTheme } from '../codemirror-langs/themes.js';

const isFullScreen = ref(false);
const editorWrapper = ref<HTMLDivElement | null>(null);

function toggleFullScreen() {
  if (!editorWrapper.value) return;

  const wrapper = editorWrapper.value;

  if (isFullScreen.value) {
    // --- EXIT ---
    isFullScreen.value = false;

    // Cleanup after transition
    const handleTransitionEnd = () => {
      wrapper.style.position = '';
      wrapper.style.top = '';
      wrapper.style.left = '';
      wrapper.style.width = '';
      wrapper.style.height = '';
      wrapper.style.transition = '';
      wrapper.removeEventListener('transitionend', handleTransitionEnd);
    };
    wrapper.addEventListener('transitionend', handleTransitionEnd, { once: true });
  } else {
    // --- ENTER ---
    const rect = wrapper.getBoundingClientRect();
    wrapper.style.position = 'fixed';
    wrapper.style.top = `${rect.top}px`;
    wrapper.style.left = `${rect.left}px`;
    wrapper.style.width = `${rect.width}px`;
    wrapper.style.height = `${rect.height}px`;

    // Force reflow
    void wrapper.offsetWidth;

    wrapper.style.transition = 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
    isFullScreen.value = true;
  }
}

// 1. Props with same interface as Monaco component
const props = defineProps<{
  modelValue: string;
  language?: string;
  theme?: string;
  readOnly?: boolean;
}>();

// 2. Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

// 3. Template refs
const editorContainer = ref<HTMLDivElement | null>(null);
let editorView: EditorView | null = null;

// 4. Helper function to get language extension
function getLanguageExtension(language?: string) {
  switch (language) {
    case 'maszynaW':
      return maszynaW();
    case 'macroW':
      return macroW();
    case 'javascript':
      return javascript();
    default:
      return javascript();
  }
}

// 5. Helper function to get theme extension
function getThemeExtension(theme?: string) {
  switch (theme) {
    case 'mwTheme':
      return mwTheme;
    case 'macroTheme':
      return macroTheme;
    default:
      return mwTheme;
  }
}

// 6. Create editor extensions
function createExtensions() {
  return [
    basicSetup,
    lineNumbers(),
    highlightActiveLine(),
    autocompletion(),
    keymap.of([indentWithTab]),
    getLanguageExtension(props.language),
    ...getThemeExtension(props.theme),
    EditorState.readOnly.of(props.readOnly ?? false),
    EditorView.lineWrapping,
    EditorView.theme({
      '&': {
        fontSize: '14px',
        fontFamily: 'monospace',
      },
      '.cm-editor': {
        height: '100%',
      },
      '.cm-scroller': {
        overflow: 'auto',
      },
    }),
    // Update listener
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newValue = update.state.doc.toString();
        if (newValue !== props.modelValue) {
          emit('update:modelValue', newValue);
        }
      }
    }),
  ];
}

// 7. Initialize editor
onMounted(() => {
  if (editorContainer.value) {
    editorView = new EditorView({
      state: EditorState.create({
        doc: props.modelValue,
        extensions: createExtensions(),
      }),
      parent: editorContainer.value,
    });
  }
});

// 8. Cleanup
onUnmounted(() => {
  if (editorView) {
    editorView.destroy();
    editorView = null;
  }
});

// 9. Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (editorView && newValue !== editorView.state.doc.toString()) {
      editorView.dispatch({
        changes: {
          from: 0,
          to: editorView.state.doc.length,
          insert: newValue,
        },
      });
    }
  }
);

// 10. Watch for language changes
watch(
  () => props.language,
  () => {
    if (editorView) {
      editorView.dispatch({
        effects: StateEffect.reconfigure.of(createExtensions()),
      });
    }
  }
);

// 11. Watch for theme changes
watch(
  () => props.theme,
  () => {
    if (editorView) {
      editorView.dispatch({
        effects: StateEffect.reconfigure.of(createExtensions()),
      });
    }
  }
);

// 12. Watch for readOnly changes
watch(
  () => props.readOnly,
  () => {
    if (editorView) {
      editorView.dispatch({
        effects: StateEffect.reconfigure.of(createExtensions()),
      });
    }
  }
);
</script>

<style scoped>
.editor-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  transition:
    width 0.3s ease,
    height 0.3s ease,
    top 0.3s ease,
    left 0.3s ease;
}

.fullscreen-button {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 20;
  background-color: transparent;
  border: none;
  cursor: pointer;
  padding: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--fontColor);
  transition: all 0.2s ease;
}

.fullscreen-button:hover {
  color: var(--primaryColor);
}

.editor-wrapper.full-screen {
  top: 0 !important;
  left: 70vw !important;
  width: 30vw !important;
  height: 100vh !important;
  z-index: 999;
  background-color: var(--backgroundColor);
  border: 1px solid var(--panelOutlineColor);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.codemirror-container {
  width: 100%;
  height: 100%;
  border: none;
  overflow: hidden;
}

.codemirror-container :deep(.cm-editor) {
  height: 100%;
}

.codemirror-container :deep(.cm-focused) {
  outline: none;
}
</style>

<template>
  <div class="editor-wrapper" :class="{ 'full-screen': isFullScreen, dimmed: programCompiled }" ref="editorWrapper" :style="wrapperStyle">
    <button v-if="language === 'macroW'" @click="toggleFullScreen" class="fullscreen-button">
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
    <div v-if="language === 'macroW' && isFullScreen" class="fullscreen-controls">
      <button v-if="!programCompiled" @click="onCompile" :disabled="!modelValue.trim()" class="execution-btn execution-btn--compile">
        <CompileIcon />
        <span>Kompiluj</span>
      </button>
      <button v-else @click="onEdit" class="compile-btn compile-btn--edit">
        <EditIcon />
        <span>Edytuj</span>
      </button>
    </div>
    <div v-if="programCompiled" class="overlay-lock" aria-hidden="true" />
    <div ref="editorContainer" class="codemirror-container"  :class="{ 'full-screen': isFullScreen, dimmed: programCompiled }"/>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, defineProps, defineEmits, computed } from 'vue';
import { EditorView } from 'codemirror';
import { EditorState, StateEffect } from '@codemirror/state';
import {
  lineNumbers,
  highlightActiveLine,
  keymap,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
} from '@codemirror/view';
import { indentWithTab, history, historyKeymap, undo, redo } from '@codemirror/commands';
import { closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { highlightSelectionMatches, search } from '@codemirror/search';
import { bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
import { javascript } from '@codemirror/lang-javascript';
import { maszynaW } from '../codemirror-langs/maszynaW.support.js';
import { mwTheme, macroTheme } from '../codemirror-langs/themes.js';
import { macroW } from '../codemirror-langs/macroW.support.js';
import { macroWRuntimeHighlight, macroWRuntimeCompletions } from '../codemirror-langs/macroW.runtime';
import CompileIcon from '@/assets/svg/CompileIcon.vue';
import EditIcon from '@/assets/svg/EditIcon.vue';
const isFullScreen = ref(false);
const editorWrapper = ref<HTMLDivElement | null>(null);
function toggleFullScreen() {
  if (!editorWrapper.value) return;
  const wrapper = editorWrapper.value;
  if (isFullScreen.value) {
    isFullScreen.value = false;
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
    const rect = wrapper.getBoundingClientRect();
    wrapper.style.position = 'fixed';
    wrapper.style.top = `${rect.top}px`;
    wrapper.style.left = `${rect.left}px`;
    wrapper.style.width = `${rect.width}px`;
    wrapper.style.height = `${rect.height}px`;
    void wrapper.offsetWidth;
    wrapper.style.transition = 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
    isFullScreen.value = true;
  }
}
const props = defineProps<{
  modelValue: string;
  language?: string;
  theme?: string;
  readOnly?: boolean;
  programCompiled?: boolean;
  disable?: boolean;
  onCompile?: () => void;
  onEdit?: () => void;
  autocompleteEnabled?: boolean;
  commandList?: Array<{ name: string; description?: string }>;
  maxHeight?: string;
  devStickyCompletion?: boolean;
}>();
const wrapperStyle = computed(() => ({
  '--editorMaxHeight': props.maxHeight ?? '32rem',
}));
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
const editorContainer = ref<HTMLDivElement | null>(null);
let editorView: EditorView | null = null;
function getAutocompleteExtensions() {
  if (props.autocompleteEnabled === false) return [];
  if (props.language === 'macroW') {
    return macroWRuntimeCompletions(props.commandList || []);
  }
  return [];
}
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
function createExtensions() {
  return [
    lineNumbers(),
    highlightActiveLine(),
    history(),
    drawSelection(),
    dropCursor(),
    rectangularSelection(),
    crosshairCursor(),
    bracketMatching(),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    closeBrackets(),
    highlightSelectionMatches(),
    search({ top: true }),
    keymap.of([
      ...closeBracketsKeymap,
      ...(props.autocompleteEnabled !== false ? completionKeymap : []),
      ...historyKeymap,
      { key: 'Ctrl-z', run: undo },
      { key: 'Ctrl-y', run: redo },
      { key: 'Ctrl-Shift-z', run: redo },
      { key: 'Tab', run: indentWithTab.run },
      { key: 'Shift-Tab', run: indentWithTab.run },
      {
        key: 'Ctrl-a',
        run: (view) => {
          view.dispatch({ selection: { anchor: 0, head: view.state.doc.length } });
          return true;
        },
      },
      {
        key: 'Ctrl-/',
        run: (view) => {
          const { state } = view;
          const changes = [];
          for (let i = 0; i < state.selection.ranges.length; i++) {
            const range = state.selection.ranges[i];
            const from = state.doc.lineAt(range.from).from;
            const to = state.doc.lineAt(range.to).to;
            for (let lineStart = from; lineStart <= to; ) {
              const line = state.doc.lineAt(lineStart);
              const lineText = line.text;
              if (lineText.trim().startsWith('//')) {
                const commentIndex = lineText.indexOf('//');
                changes.push({
                  from: line.from + commentIndex,
                  to: line.from + commentIndex + 2 + (lineText[commentIndex + 2] === ' ' ? 1 : 0),
                  insert: '',
                });
              } else if (lineText.trim().length > 0) {
                const firstNonSpace = lineText.search(/\S/);
                const insertPos = firstNonSpace >= 0 ? line.from + firstNonSpace : line.from;
                changes.push({
                  from: insertPos,
                  to: insertPos,
                  insert: '// ',
                });
              }
              lineStart = line.to + 1;
            }
          }
          if (changes.length > 0) {
            view.dispatch({ changes });
          }
          return true;
        },
      },
    ]),
    EditorView.editable.of(!(props.readOnly || props.disable || props.programCompiled)),
    EditorView.lineWrapping,
    getLanguageExtension(props.language),
    ...getThemeExtension(props.theme),
    ...getAutocompleteExtensions(),
    ...(props.language === 'macroW' ? macroWRuntimeHighlight(props.commandList || []) : []),
    EditorView.theme({
      '&': {
        fontSize: '14px',
        fontFamily: 'monospace',
      },
      '.cm-editor': {
        borderStyle: 'solid',
        borderWidth: 4,
        borderColor: '#003c7d',
        height: '100%',
      },
      '.cm-scroller': {
        overflow: 'auto',
        borderStyle: 'solid',
        borderRadius: '0.25rem',
        borderWidth: '4px',
        borderColor: '#003c7d',
      },
      '.cm-content': {
        textAlign: 'left',
        padding: '10px',
        minHeight: '100%',
      },
      '.cm-line': {
        textAlign: 'left',
        lineHeight: '1.4',
      },
      '.cm-selectionBackground': {
        backgroundColor: '#316AC5 !important',
        marginTop: '-5px',
        marginLeft: '-5px',
        opacity: '0.3 !important',
      },
      '.cm-focused .cm-selectionBackground': {
        backgroundColor: '#316AC5 !important',
        opacity: '0.4 !important',
      },
      '&.cm-focused .cm-selectionBackground': {
        backgroundColor: '#316AC5 !important',
      },
      '.cm-cursor': {
        marginTop: '-4px',
        marginLeft: '-4px',
      },
      '.cm-dropCursor': {
        borderLeftColor: '#316AC5 !important',
        borderLeftWidth: '2px !important',
      },
      '.cm-activeLine': {
        backgroundColor: 'rgba(255, 255, 255, 0.05) !important',
      },
      '.cm-searchMatch': {
        backgroundColor: '#ffd700 !important',
        color: '#000 !important',
      },
      '.cm-searchMatch.cm-searchMatch-selected': {
        backgroundColor: '#ff8c00 !important',
      },
      '.tok-IF, .tok-THEN, .tok-ELSE': {
        color: '#003c7d !important',
        fontWeight: 'bold !important',
      },
      '.cmt-IF, .cmt-THEN, .cmt-ELSE': {
        color: '#003c7d !important',
        fontWeight: 'bold !important',
      },
      '.tok-labelName, .cmt-labelName': {
        color: '#795E26 !important',
        fontStyle: 'italic !important',
      },
      '.tok-labelDef, .cmt-labelDef': {
        color: '#795E26 !important',
        fontStyle: 'italic !important',
      },
      '.tok-labelRef, .cmt-labelRef': {
        color: '#795E26 !important',
        fontStyle: 'italic !important',
      },
    }),
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
onUnmounted(() => {
  if (editorView) {
    editorView.destroy();
    editorView = null;
  }
});
watch(
  () => props.programCompiled,
  () => {
    if (editorView) {
      editorView.dispatch({
        effects: StateEffect.reconfigure.of(createExtensions()),
      });
    }
  }
);
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
watch(
  () => props.autocompleteEnabled,
  () => {
    if (editorView) {
      editorView.dispatch({ effects: StateEffect.reconfigure.of(createExtensions()) });
    }
  }
);
watch(
  () => props.commandList,
  () => {
    if (editorView) {
      editorView.dispatch({
        effects: StateEffect.reconfigure.of(createExtensions()),
      });
    }
  },
  { deep: true }
);
watch(
  () => props.disable,
  () => {
    if (editorView) {
      editorView.dispatch({
        effects: StateEffect.reconfigure.of(createExtensions()),
      });
    }
  }
);
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
  max-height: var(--editorMaxHeight, 32rem);
  transition:
    width 0.3s ease,
    height 0.3s ease,
    top 0.3s ease,
    left 0.3s ease;
}
@media (min-width: 675px) and (max-width: 1195px) {
  .editor-wrapper {
    width: 40rem;
  }
}
@media (max-width: 675px) {
  .programEditor {
    width: 100%;
  }
}
:deep(.cm-content .cm-macrow-keyword) {
  color: #0a84ff !important;
  font-weight: 700;
}
.fullscreen-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 20;
  background-color: rgba(222, 221, 255);
  border: rgba(222, 221, 255);
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
  left: 65vw !important;
  width: 35vw !important;
  height: 100vh !important;
  padding: 15px;
  z-index: 999;
  background-color: var(--backgroundColor);
  border: 3px solid #003c7d;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  border-radius: 0 0 0 8px;
  max-height: none;
}
.codemirror-container {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 0.25rem;
  overflow: hidden;
  max-height: 40rem;
}
.codemirror-container.full-screen {
  max-height: 93% !important;
}
.codemirror-container :deep(.cm-editor) {
  height: 100%;
  background: var(--panelBackgroundColor) !important;
  color: var(--fontColor) !important;
}
.codemirror-container :deep(.cm-gutters) {
  background: var(--panelBackgroundColor) !important;
  color: var(--fontColor) !important;
}
.codemirror-container :deep(.cm-focused) {
  outline: none;
}
.fullscreen-controls {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 20;
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
:deep(.cm-tooltip-autocomplete) {
  width: 250px !important;
  min-width: 250px !important;
  max-width: 250px !important;
  box-sizing: border-box !important;
  display: block !important;
  overflow: hidden !important;
  border: 4px solid #003c7d !important;
  border-radius: 8px !important;
  background: var(--panelBackgroundColor) !important;
  color: var(--fontColor) !important;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18) !important;
}
:deep(.cm-tooltip-autocomplete ul) {
  width: 100% !important;
  max-height: 260px !important;
  overflow-y: auto !important;
  max-height: 260px !important;
  overflow-y: auto !important;
  padding: 6px 0 !important;
  margin: 0 !important;
}
:deep(.cm-tooltip-autocomplete li) {
  display: grid !important;
  grid-template-columns: 1fr auto;
  align-items: center !important;
  gap: 8px !important;
  padding: 8px 10px !important;
  line-height: 1.2 !important;
  white-space: wrap !important;
}
:deep(.cm-tooltip-autocomplete li[aria-selected='true']),
:deep(.cm-tooltip-autocomplete .cm-completionSelected) {
  background: #e6f0ff !important;
  color: #003c7d !important;
}
:deep(.cm-tooltip-autocomplete .cm-completionLabel) {
  grid-column: 1 !important;
  grid-row: 1 !important;
  text-align: start;
  padding-left: 20px;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  font-weight: 700 !important;
}
:deep(.cm-tooltip-autocomplete .cm-completionIcon) {
  grid-column: 2 !important;
}
:deep(.cm-tooltip-autocomplete .cm-completionDetail) {
  opacity: 0.75 !important;
  font-size: 12px !important;
}
:deep(.cm-tooltip-autocomplete .cm-completionMatchedText) {
  text-decoration: none !important;
  font-weight: 700 !important;
}
:deep(.cm-tooltip-autocomplete ul::-webkit-scrollbar) {
  width: 8px;
}
:deep(.cm-tooltip-autocomplete ul::-webkit-scrollbar-thumb) {
  background: #c7d7ff;
  border-radius: 6px;
}
.editor-wrapper.dimmed .codemirror-container :deep(.cm-editor) {
  filter: grayscale(0.6) brightness(0.95);
  opacity: 0.85;
  transition:
    opacity 0.2s ease,
    filter 0.2s ease;
}
.overlay-lock {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.08);
  display: grid;
  place-items: center;
  pointer-events: none;
  z-index: 15;
}
</style>
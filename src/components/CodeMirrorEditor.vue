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
import { indentWithTab, history, defaultKeymap, historyKeymap, undo, redo } from '@codemirror/commands';
import { autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches, search } from '@codemirror/search';
import { bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';
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
    // Essential editor features
    lineNumbers(),
    highlightActiveLine(),
    history(),
    drawSelection(),
    dropCursor(),
    rectangularSelection(),
    crosshairCursor(),

    // Language features
    bracketMatching(),
    indentOnInput(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),

    // Autocompletion with better configuration
    // autocompletion({
    //   activateOnTyping: true,
    //   override: [
    //     // Custom completions for maszynaW
    //     (context) => {
    //       if (props.language === 'maszynaW') {
    //         const word = context.matchBefore(/\w*/);
    //         if (!word) return null;

    //         const maszynaWKeywords = [
    //           'il',
    //           'dl',
    //           'wyl',
    //           'wel',
    //           'wyad',
    //           'wea',
    //           'wei',
    //           'wys',
    //           'wes',
    //           'czyt',
    //           'pisz',
    //           'as',
    //           'sa',
    //           'dod',
    //           'ode',
    //           'przep',
    //           'mno',
    //           'dziel',
    //           'shr',
    //           'shl',
    //           'neg',
    //           'lub',
    //           'i',
    //           'iak',
    //           'dak',
    //           'weak',
    //           'weja',
    //           'wyak',
    //           'stop',
    //         ];

    //         const completions = maszynaWKeywords
    //           .filter((keyword) => keyword.startsWith(word.text))
    //           .map((keyword) => ({
    //             label: keyword,
    //             type: 'keyword',
    //             info: `MaszynaW keyword: ${keyword}`,
    //           }));

    //         return {
    //           from: word.from,
    //           options: completions,
    //         };
    //       }
    //       return null;
    //     },

    //     // Custom completions for macroW
    //     (context) => {
    //       if (props.language === 'macroW') {
    //         const word = context.matchBefore(/\w*/);
    //         if (!word) return null;

    //         const macroWKeywords = [
    //           'stp',
    //           'dod',
    //           'ode',
    //           'pob',
    //           'lad',
    //           'sob',
    //           'som',
    //           'soz',
    //           'dns',
    //           'pwr',
    //           'pzs',
    //           'sdp',
    //           'dzi',
    //           'mno',
    //           'wpr',
    //           'wyp',
    //           'IF',
    //           'THEN',
    //           'ELSE',
    //         ];

    //         const completions = macroWKeywords
    //           .filter((keyword) => keyword.toLowerCase().startsWith(word.text.toLowerCase()))
    //           .map((keyword) => ({
    //             label: keyword,
    //             type: 'keyword',
    //             info: `MacroW keyword: ${keyword}`,
    //           }));

    //         return {
    //           from: word.from,
    //           options: completions,
    //         };
    //       }
    //       return null;
    //     },
    //   ],
    // }),

    closeBrackets(),
    highlightSelectionMatches(),
    search({ top: true }),

    // Enhanced keymap with explicit undo/redo and useful shortcuts
    keymap.of([
      ...closeBracketsKeymap,
      ...completionKeymap,
      ...searchKeymap,
      ...historyKeymap,
      { key: 'Ctrl-z', run: undo },
      { key: 'Ctrl-y', run: redo },
      { key: 'Ctrl-Shift-z', run: redo },
      { key: 'Tab', run: indentWithTab.run },
      { key: 'Shift-Tab', run: indentWithTab.run },
      // Additional useful shortcuts
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
          // Simple comment toggle - adds // at the beginning of lines
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
                // Remove comment
                const commentIndex = lineText.indexOf('//');
                changes.push({
                  from: line.from + commentIndex,
                  to: line.from + commentIndex + 2 + (lineText[commentIndex + 2] === ' ' ? 1 : 0),
                  insert: '',
                });
              } else if (lineText.trim().length > 0) {
                // Add comment
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
    EditorState.readOnly.of(props.readOnly ?? false),
    EditorView.lineWrapping,
    // Add language and theme LAST to ensure they override
    getLanguageExtension(props.language),
    ...getThemeExtension(props.theme),
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
      '.cm-content': {
        textAlign: 'left',
        padding: '10px',
        minHeight: '100%',
      },
      '.cm-line': {
        textAlign: 'left',
        lineHeight: '1.4',
      },
      // Selection styling
      '.cm-selectionBackground': {
        backgroundColor: '#316AC5 !important',
        opacity: '0.3 !important',
      },
      '.cm-focused .cm-selectionBackground': {
        backgroundColor: '#316AC5 !important',
        opacity: '0.4 !important',
      },
      '&.cm-focused .cm-selectionBackground': {
        backgroundColor: '#316AC5 !important',
      },
      // // Cursor styling
      // '.cm-cursor': {
      //   borderLeftColor: '#ffffff !important',
      //   borderLeftWidth: '2px !important',
      // },
      // '.cm-dropCursor': {
      //   borderLeftColor: '#316AC5 !important',
      //   borderLeftWidth: '2px !important',
      // },
      // Active line highlighting
      '.cm-activeLine': {
        backgroundColor: 'rgba(255, 255, 255, 0.05) !important',
      },
      // Autocomplete styling
      '.cm-tooltip-autocomplete': {
        border: '1px solid #555 !important',
        backgroundColor: '#2d2d2d !important',
        color: '#ffffff !important',
      },
      '.cm-completionLabel': {
        color: '#ffffff !important',
      },
      '.cm-completionDetail': {
        color: '#888 !important',
      },
      '.cm-tooltip-autocomplete .cm-completionIcon-keyword': {
        color: '#4FC1FF !important',
      },
      // Search match highlighting
      '.cm-searchMatch': {
        backgroundColor: '#ffd700 !important',
        color: '#000 !important',
      },
      '.cm-searchMatch.cm-searchMatch-selected': {
        backgroundColor: '#ff8c00 !important',
      },
      // Keywords for macroW conditional statements
      '.tok-IF, .tok-THEN, .tok-ELSE': {
        color: '#4FC1FF !important',
        fontWeight: 'bold !important',
      },
      '.cmt-IF, .cmt-THEN, .cmt-ELSE': {
        color: '#4FC1FF !important',
        fontWeight: 'bold !important',
      },
      // Label styling
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

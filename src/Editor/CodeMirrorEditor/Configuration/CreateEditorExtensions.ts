import { macroWRuntimeCompletions, macroWRuntimeHighlight } from '@/Editor/Languages/MacroW/MacroWRuntime';
import { macroW } from '@/Editor/Languages/MacroW/MacroWSupport';
import { maszynaW } from '@/Editor/Languages/Microcode/MaszynaWSupport';
import { macroTheme, mwTheme } from '@/Editor/Themes/Themes';
import { closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab, redo, undo } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { bracketMatching, defaultHighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { highlightSelectionMatches, search, searchKeymap } from '@codemirror/search';
import { EditorState } from '@codemirror/state';
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers,
  rectangularSelection,
} from '@codemirror/view';

import type { Extension } from '@codemirror/state';
import type { ViewUpdate } from '@codemirror/view';
import type { CodeMirrorEditorProps } from '@/Editor/CodeMirrorEditor/Types';
import { buildCommandCompletions } from './BuildCommandMetadata';
import { toggleLineComments } from './ToggleLineComments';
import { editorAppearance } from './EditorAppearance';

interface EditorExtensionOptions {
  language?: CodeMirrorEditorProps['language'];
  theme?: CodeMirrorEditorProps['theme'];
  isReadOnly: boolean;
  autocompleteEnabled: boolean;
  commands: ReturnType<typeof buildCommandCompletions>;
  onUpdate: (update: ViewUpdate) => void;
}

/** Builds editor behavior separately from React mounting and document synchronization. */
export const createEditorExtensions = ({
  language,
  theme,
  isReadOnly,
  autocompleteEnabled,
  commands,
  onUpdate,
}: EditorExtensionOptions): Extension[] => {
  const { words, completions } = commands;
  let languageSupport = javascript();
  if (language === 'macroW') {
    languageSupport = macroW();
  } else if (language === 'maszynaW') {
    languageSupport = maszynaW();
  }
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
      ...(autocompleteEnabled ? completionKeymap : []),
      ...historyKeymap,
      { key: 'Ctrl-z', run: undo },
      { key: 'Ctrl-y', run: redo },
      { key: 'Ctrl-Shift-z', run: redo },
      indentWithTab,
      {
        key: 'Ctrl-a',
        run: (view) => {
          view.dispatch({ selection: { anchor: 0, head: view.state.doc.length } });
          return true;
        },
      },
      { key: 'Ctrl-/', run: toggleLineComments },
      ...searchKeymap,
      ...defaultKeymap,
    ]),
    EditorState.readOnly.of(isReadOnly),
    EditorView.editable.of(!isReadOnly),
    EditorView.lineWrapping,
    languageSupport,
    ...(theme === 'macroTheme' ? macroTheme : mwTheme),
    ...(language === 'macroW' && autocompleteEnabled ? macroWRuntimeCompletions(completions) : []),
    ...(language === 'macroW' ? macroWRuntimeHighlight([...words]) : []),
    editorAppearance,
    EditorView.updateListener.of(onUpdate),
  ];
};

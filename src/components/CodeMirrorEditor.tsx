'use client';

import CompileIcon from '@/assets/svg/CompileIcon';
import EditIcon from '@/assets/svg/EditIcon';
import { macroWRuntimeCompletions, macroWRuntimeHighlight } from '@/codemirror-langs/macroW.runtime';
import { macroW } from '@/codemirror-langs/macroW.support.js';
import { maszynaW } from '@/codemirror-langs/maszynaW.support.js';
import { macroTheme, mwTheme } from '@/codemirror-langs/themes.js';
import { useI18n } from '@/i18n';
import { collectCommandAliases } from '@/shared/utils/commandMnemonics';
import { buildInstructionRegistry } from '@/WLAN/instructionRegistry';
import type { CodeMirrorEditorProps } from '@/types/components';
import type { RuntimeCommand } from '@/types/registry';
import { closeBrackets, closeBracketsKeymap, completionKeymap } from '@codemirror/autocomplete';
import { defaultKeymap, history, historyKeymap, indentWithTab, redo, undo } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { bracketMatching, defaultHighlightStyle, indentOnInput, syntaxHighlighting } from '@codemirror/language';
import { highlightSelectionMatches, search, searchKeymap } from '@codemirror/search';
import type { ChangeSpec, Line } from '@codemirror/state';
import { EditorState, StateEffect } from '@codemirror/state';
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
import { useEffect, useMemo, useRef, useState } from 'react';

const EMPTY_COMMANDS: RuntimeCommand[] = [];

// Keep the original languages, decorations and key bindings independent of React.
function toggleLineComments(view: EditorView): boolean {
  if (view.state.readOnly) return true;
  const lines = new Map<number, Line>();
  for (const range of view.state.selection.ranges) {
    const to = view.state.doc.lineAt(range.to).to;
    for (let position = view.state.doc.lineAt(range.from).from; position <= to; ) {
      const line = view.state.doc.lineAt(position);
      lines.set(line.number, line);
      position = line.to + 1;
    }
  }
  const changes: ChangeSpec[] = [];
  for (const line of [...lines.values()].sort((left, right) => left.number - right.number)) {
    if (line.text.trim().startsWith('//')) {
      const commentIndex = line.text.indexOf('//');
      changes.push({
        from: line.from + commentIndex,
        to: line.from + commentIndex + 2 + (line.text[commentIndex + 2] === ' ' ? 1 : 0),
        insert: '',
      });
    } else if (line.text.trim()) {
      changes.push({ from: line.from + line.text.search(/\S/), insert: '// ' });
    }
  }
  if (changes.length) view.dispatch({ changes });
  return true;
}

const editorAppearance = EditorView.theme({
  '&': { fontSize: '14px', fontFamily: 'monospace' },
  '.cm-editor': { borderStyle: 'solid', borderWidth: '4px', borderColor: '#003c7d', height: '100%' },
  '.cm-scroller': { overflow: 'auto', borderStyle: 'solid', borderRadius: '0.25rem', borderWidth: '4px', borderColor: '#003c7d' },
  '.cm-content': { textAlign: 'left', padding: '10px', minHeight: '100%' },
  '.cm-line': { textAlign: 'left', lineHeight: '1.4' },
  '.cm-selectionBackground': { backgroundColor: '#316AC5 !important', marginTop: '-5px', marginLeft: '-5px', opacity: '0.3 !important' },
  '.cm-focused .cm-selectionBackground': { backgroundColor: '#316AC5 !important', opacity: '0.4 !important' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: '#316AC5 !important' },
  '.cm-cursor': { borderLeftColor: 'var(--fontColor, #000) !important', marginTop: '-4px', marginLeft: '-4px' },
  '.cm-dropCursor': { borderLeftColor: '#316AC5 !important', borderLeftWidth: '2px !important' },
  '.cm-activeLine': { backgroundColor: 'rgba(255, 255, 255, 0.05) !important' },
  '.cm-searchMatch': { backgroundColor: '#ffd700 !important', color: '#000 !important' },
  '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: '#ff8c00 !important' },
  '.tok-labelName, .cmt-labelName, .tok-labelDef, .cmt-labelDef, .tok-labelRef, .cmt-labelRef': {
    color: '#795E26 !important',
    fontStyle: 'italic !important',
  },
});

export default function CodeMirrorEditor({
  modelValue = '',
  onUpdateModelValue,
  onChange,
  language,
  theme,
  readOnly = false,
  programCompiled = false,
  disable = false,
  onCompile,
  onEdit,
  autocompleteEnabled = true,
  commandList = EMPTY_COMMANDS,
  maxHeight = '32rem',
  devStickyCompletion: _devStickyCompletion,
  className = '',
  style,
  ...rest
}: CodeMirrorEditorProps) {
  const { t, locale } = useI18n();
  const [isFullScreen, setIsFullScreen] = useState(false);
  const editorWrapper = useRef<HTMLDivElement | null>(null);
  const editorContainer = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const changeRef = useRef({ modelValue, onUpdateModelValue, onChange });
  changeRef.current = { modelValue, onUpdateModelValue, onChange };

  const metadata = useMemo(
    () =>
      (language === 'macroW' ? buildInstructionRegistry(commandList).entries : commandList).map((command) => {
        let description = command.description;
        if (!description) description = t('commandList.commandDescription', { name: command.name });
        else if (typeof description === 'object')
          description =
            description[locale] || description[locale?.split('-')[0]] || description.en || description.pl || Object.values(description)[0];
        return {
          aliases: collectCommandAliases(command, { locale }),
          description: description == null ? undefined : String(description),
        };
      }),
    [commandList, language, locale, t]
  );

  const extensions = useMemo(() => {
    const words = new Set<string>();
    const seen = new Set();
    const completions = [];
    for (const { aliases, description } of metadata) {
      for (const alias of aliases.all) if (alias) words.add(alias);
      const label = aliases.preferred[0] || aliases.canonical;
      if (label && !seen.has(label.toUpperCase())) {
        seen.add(label.toUpperCase());
        completions.push({ label, detail: description });
      }
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
      EditorState.readOnly.of(readOnly || disable || programCompiled),
      EditorView.editable.of(!(readOnly || disable || programCompiled)),
      EditorView.lineWrapping,
      language === 'maszynaW' ? maszynaW() : language === 'macroW' ? macroW() : javascript(),
      ...(theme === 'macroTheme' ? macroTheme : mwTheme),
      ...(language === 'macroW' && autocompleteEnabled ? macroWRuntimeCompletions(completions) : []),
      ...(language === 'macroW' ? macroWRuntimeHighlight([...words]) : []),
      editorAppearance,
      EditorView.updateListener.of((update) => {
        if (!update.docChanged) return;
        const value = update.state.doc.toString();
        const current = changeRef.current;
        if (value !== current.modelValue) {
          current.onUpdateModelValue?.(value);
          current.onChange?.(value);
        }
      }),
    ];
  }, [language, theme, readOnly, disable, programCompiled, autocompleteEnabled, metadata]);
  const extensionsRef = useRef(extensions);
  extensionsRef.current = extensions;

  useEffect(() => {
    const view = new EditorView({
      state: EditorState.create({ doc: changeRef.current.modelValue, extensions: extensionsRef.current }),
      parent: editorContainer.current ?? undefined,
    });
    viewRef.current = view;
    return () => {
      viewRef.current = null;
      view.destroy();
    };
  }, []);
  useEffect(() => {
    viewRef.current?.dispatch({ effects: StateEffect.reconfigure.of(extensions) });
  }, [extensions]);
  useEffect(() => {
    const view = viewRef.current;
    if (view && modelValue !== view.state.doc.toString())
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: modelValue } });
  }, [modelValue]);

  const toggleFullScreen = () => {
    const wrapper = editorWrapper.current;
    if (!wrapper) return;
    if (!isFullScreen) {
      const rect = wrapper.getBoundingClientRect();
      Object.assign(wrapper.style, {
        position: 'fixed',
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      });
      void wrapper.offsetWidth;
      wrapper.style.transition = 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
    } else {
      for (const key of ['position', 'top', 'left', 'width', 'height', 'transition'] as const) wrapper.style[key] = '';
    }
    setIsFullScreen((value) => !value);
  };

  return (
    <div
      data-editor-codemirror-editor=""
      {...rest}
      className={`editor-wrapper${isFullScreen ? ' full-screen' : ''}${programCompiled ? ' dimmed' : ''} ${className}`}
      ref={editorWrapper}
      style={{ '--editorMaxHeight': maxHeight, ...style }}
    >
      {language === 'macroW' && (
        <button
          data-editor-codemirror-editor=""
          onClick={toggleFullScreen}
          className="fullscreen-button"
          aria-label={isFullScreen ? 'Exit expanded editor' : 'Expand editor'}
          aria-expanded={isFullScreen}
        >
          <svg
            data-editor-codemirror-editor=""
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              data-editor-codemirror-editor=""
              d={
                isFullScreen
                  ? 'M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3'
                  : 'M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3'
              }
            />
          </svg>
        </button>
      )}
      {language === 'macroW' && isFullScreen && (
        <div data-editor-codemirror-editor="" className="fullscreen-controls">
          {!programCompiled ? (
            <button
              data-editor-codemirror-editor=""
              onClick={onCompile}
              disabled={!modelValue.trim()}
              className="execution-btn execution-btn--compile"
            >
              <CompileIcon />
              <span data-editor-codemirror-editor="">{t('execution.compile')}</span>
            </button>
          ) : (
            <button data-editor-codemirror-editor="" onClick={onEdit} className="execution-btn execution-btn--edit">
              <EditIcon />
              <span data-editor-codemirror-editor="">{t('execution.edit')}</span>
            </button>
          )}
        </div>
      )}
      {programCompiled && <div data-editor-codemirror-editor="" className="overlay-lock" aria-hidden="true" />}
      <div
        data-editor-codemirror-editor=""
        ref={editorContainer}
        className={`codemirror-container${isFullScreen ? ' full-screen' : ''}${programCompiled ? ' dimmed' : ''}`}
      />
    </div>
  );
}

'use client';

import { useI18n } from '@/I18n/Index';
import type { CodeMirrorEditorProps } from '@/Types/Components';
import type { RuntimeCommand } from '@/Types/Registry';
import { EditorState, StateEffect } from '@codemirror/state';
import { EditorView, type ViewUpdate } from '@codemirror/view';
import { useEffect, useMemo, useRef } from 'react';
import { buildCommandMetadata, buildCommandCompletions } from '../Editor/BuildCommandMetadata';
import { createEditorExtensions } from '../Editor/CreateEditorExtensions';
import { synchronizeEditorDocument } from '../Editor/SynchronizeEditorDocument';

interface EditorOptions {
  modelValue: string;
  onUpdateModelValue?: (value: string) => void;
  onChange?: (value: string) => void;
  language?: CodeMirrorEditorProps['language'];
  theme?: CodeMirrorEditorProps['theme'];
  isReadOnly: boolean;
  autocompleteEnabled: boolean;
  commandList: RuntimeCommand[];
}

/** Mounts one EditorView, updates its configuration/document, and destroys it when unmounted. */
export const useCodeMirrorEditor = ({
  modelValue,
  onUpdateModelValue,
  onChange,
  language,
  theme,
  isReadOnly,
  autocompleteEnabled,
  commandList,
}: EditorOptions) => {
  const { locale, t } = useI18n();
  const editorContainer = useRef<HTMLDivElement>(null);
  const editorView = useRef<EditorView | null>(null);

  const latestCallbacks = useRef({ modelValue, onUpdateModelValue, onChange });
  latestCallbacks.current = { modelValue, onUpdateModelValue, onChange };

  const commands = useMemo(() => {
    const metadata = buildCommandMetadata(commandList, language === 'macroW', locale, t);
    return buildCommandCompletions(metadata);
  }, [commandList, language, locale, t]);

  const extensions = useMemo(() => {
    const notifyDocumentChange = (update: ViewUpdate) => {
      if (!update.docChanged) {
        return;
      }

      const value = update.state.doc.toString();
      const callbacks = latestCallbacks.current;
      if (value !== callbacks.modelValue) {
        callbacks.onUpdateModelValue?.(value);
        callbacks.onChange?.(value);
      }
    };

    return createEditorExtensions({
      language,
      theme,
      isReadOnly,
      autocompleteEnabled,
      commands,
      onUpdate: notifyDocumentChange,
    });
  }, [language, theme, isReadOnly, autocompleteEnabled, commands]);

  const latestExtensions = useRef(extensions);
  latestExtensions.current = extensions;

  useEffect(() => {
    if (!editorContainer.current) {
      return;
    }

    const view = new EditorView({
      state: EditorState.create({
        doc: latestCallbacks.current.modelValue,
        extensions: latestExtensions.current,
      }),
      parent: editorContainer.current,
    });

    editorView.current = view;
    return () => {
      editorView.current = null;
      view.destroy();
    };
  }, []);

  useEffect(() => {
    editorView.current?.dispatch({ effects: StateEffect.reconfigure.of(extensions) });
  }, [extensions]);

  useEffect(() => {
    if (editorView.current) {
      synchronizeEditorDocument(editorView.current, modelValue);
    }
  }, [modelValue]);

  return editorContainer;
};

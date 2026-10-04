import type { EditorView } from '@codemirror/view';

/** External replacements remain undoable, preserving the existing document-history policy. */
export const synchronizeEditorDocument = (view: EditorView, value: string): void => {
  if (value === view.state.doc.toString()) {
    return;
  }

  view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
};

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EditorState, EditorSelection } from '@codemirror/state';
import { history, undo } from '@codemirror/commands';
import type { EditorView } from '@codemirror/view';
import { toggleLineComments } from '../src/Components/CodeMirrorEditor/Editor/ToggleLineComments';
import { synchronizeEditorDocument } from '../src/Components/CodeMirrorEditor/Editor/SynchronizeEditorDocument';

const editorHarness = (state: EditorState) => {
  const view = {
    state,
    dispatch: (transaction: Parameters<EditorView['dispatch']>[0]) => {
      view.state = view.state.update(transaction).state;
    },
  };

  return view as unknown as EditorView;
};

test('line comments exclude the next line when a selection ends at its start', () => {
  const view = editorHarness(
    EditorState.create({
      doc: 'DOD 0\nSTP',
      selection: EditorSelection.single(0, 6),
    })
  );

  toggleLineComments(view);
  assert.equal(view.state.doc.toString(), '// DOD 0\nSTP');
  toggleLineComments(view);
  assert.equal(view.state.doc.toString(), 'DOD 0\nSTP');
});

test('line comments handle cursors and skip changes in read-only editors', () => {
  const view = editorHarness(
    EditorState.create({
      doc: 'DOD 0\nSTP',
      selection: EditorSelection.single(6),
    })
  );

  toggleLineComments(view);
  assert.equal(view.state.doc.toString(), 'DOD 0\n// STP');

  const locked = editorHarness(
    EditorState.create({
      doc: 'STP',
      extensions: [EditorState.readOnly.of(true)],
    })
  );
  toggleLineComments(locked);
  assert.equal(locked.state.doc.toString(), 'STP');
});

test('external document replacements remain undoable and equal values create no history entry', () => {
  const view = editorHarness(EditorState.create({ doc: 'DOD 0', extensions: [history()] }));

  synchronizeEditorDocument(view, 'STP');
  assert.equal(view.state.doc.toString(), 'STP');
  assert.equal(undo(view), true);
  assert.equal(view.state.doc.toString(), 'DOD 0');

  const unchanged = editorHarness(EditorState.create({ doc: 'STP', extensions: [history()] }));
  synchronizeEditorDocument(unchanged, 'STP');
  assert.equal(undo(unchanged), false);
});

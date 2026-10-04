import type { ChangeSpec, Line } from '@codemirror/state';
import type { EditorView } from '@codemirror/view';

/** Toggles only lines touched by the selection; its end is exclusive. */
export const toggleLineComments = (view: EditorView): boolean => {
  if (view.state.readOnly) {
    return true;
  }
  const lines = new Map<number, Line>();
  for (const range of view.state.selection.ranges) {
    const selectionEnd = range.empty ? range.to : range.to - 1;
    const to = view.state.doc.lineAt(selectionEnd).to;
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
  if (changes.length) {
    view.dispatch({ changes });
  }
  return true;
};

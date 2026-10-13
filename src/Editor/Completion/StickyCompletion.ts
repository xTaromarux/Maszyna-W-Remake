import { completionStatus, startCompletion } from '@codemirror/autocomplete';
import type { Extension } from '@codemirror/state';
import { EditorView, ViewPlugin } from '@codemirror/view';

export function stickyCompletion(): Extension {
  return ViewPlugin.fromClass(
    class {
      constructor(private view: EditorView) {
        // Otwórz od razu po mount
        startCompletion(this.view);
      }
      update() {
        // Jeśli z jakiegoś powodu się zamknęło, otwórz ponownie
        const st = completionStatus(this.view.state);
        if (st !== 'active') startCompletion(this.view);
      }
    }
  );
}

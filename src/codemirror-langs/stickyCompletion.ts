import type { Extension } from '@codemirror/state';
import { ViewPlugin, ViewUpdate, EditorView } from '@codemirror/view';
import { startCompletion, completionStatus } from '@codemirror/autocomplete';

export function stickyCompletion(): Extension {
  return ViewPlugin.fromClass(class {
    constructor(private view: EditorView) {
      // Otwórz od razu po mount
      startCompletion(this.view);
    }
    update(u: ViewUpdate) {
      // Jeśli z jakiegoś powodu się zamknęło, otwórz ponownie
      const st = completionStatus(this.view.state);
      if (st !== 'active') startCompletion(this.view);
    }
  });
}

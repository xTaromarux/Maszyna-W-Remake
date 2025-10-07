import type { Extension } from '@codemirror/state';
import { ViewPlugin, ViewUpdate, EditorView } from '@codemirror/view';
import { startCompletion, completionStatus } from '@codemirror/autocomplete';
export function stickyCompletion(): Extension {
  return ViewPlugin.fromClass(class {
    constructor(private view: EditorView) {
      startCompletion(this.view);
    }
    update(u: ViewUpdate) {
      const st = completionStatus(this.view.state);
      if (st !== 'active') startCompletion(this.view);
    }
  });
}
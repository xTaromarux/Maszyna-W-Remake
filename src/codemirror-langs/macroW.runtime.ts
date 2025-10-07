import type { Extension } from '@codemirror/state';
import { StateField, RangeSetBuilder, EditorState } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';
import { autocompletion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
type Cmd = { name: string; description?: string };
function escapeRx(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function matchCase(s: string, pattern: string) {
  if (pattern && /\p{L}/u.test(pattern[0])) {
    return pattern[0] === pattern[0].toUpperCase() ? s.toUpperCase() : s.toLowerCase();
  }
  return s;
}
export function macroWRuntimeHighlight(commands: Cmd[] = []): readonly Extension[] {
  const words = Array.from(new Set(commands.map(c => c?.name).filter(Boolean))) as string[];
  if (words.length === 0) {
    const empty = StateField.define<DecorationSet>({
      create: () => Decoration.none,
      update: v => v,
      provide: f => EditorView.decorations.from(f),
    });
    return [empty] as const;
  }
  const boundary = "[\\p{L}\\p{N}_]";
  const rx = new RegExp(
    `(?<!${boundary})(?:${words.map(escapeRx).join("|")})(?!${boundary})`,
    "giu"
  );
  const deco = Decoration.mark({ class: 'cm-macrow-keyword' });
  const field = StateField.define<DecorationSet>({
    create(state: EditorState) { return build(state); },
    update(value, tr) {
      if (tr.docChanged || tr.selection) return build(tr.state);
      return value;
    },
    provide: f => EditorView.decorations.from(f),
  });
  function build(state: EditorState): DecorationSet {
    const b = new RangeSetBuilder<Decoration>();
    let pos = 0;
    for (let it = state.doc.iter(); !it.done; it.next()) {
      const text = it.value as string;
      rx.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = rx.exec(text))) {
        const from = pos + m.index;
        const to = from + m[0].length;
        b.add(from, to, deco);
      }
      pos += text.length;
    }
    return b.finish();
  }
  return [field] as const;
}
export function macroWRuntimeCompletions(commands: Cmd[] = []): readonly any[] {
  const base = (commands || [])
    .filter(c => c?.name)
    .map(c => ({ name: c.name, description: c.description || 'rozkaz' }));
  function source(ctx: CompletionContext): CompletionResult | null {
    const word = ctx.matchBefore(/[\p{L}\p{N}_]*/u);
    if (!word) return null;
    const opts = base.map(({ name, description }) => ({
      label: matchCase(name, word.text),
      type: 'keyword' as const,
      detail: description,
    }));
    return { from: word.from, options: opts };
  }
  return [autocompletion({
    override: [source],
    activateOnTyping: true,
    closeOnBlur: true,       // 🔴 nie zamykaj na blur
    selectOnOpen: true,       // opcjonalnie: od razu zaznacz pierwszy
  })] as const;
}
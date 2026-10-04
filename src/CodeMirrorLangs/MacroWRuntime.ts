import type { MacroCompletionOption } from '@/Types/Editor';
import type { MacroCompletionItem } from '../Types/Editor';
import { autocompletion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import type { Extension } from '@codemirror/state';
import { EditorState, RangeSetBuilder, StateField } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';
import { normalizeMnemonicToken } from '../Shared/Utils/CommandMnemonics';

function escapeRx(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchCase(s: string, pattern: string) {
  if (pattern && /\p{L}/u.test(pattern[0])) {
    return pattern[0] === pattern[0].toUpperCase() ? s.toUpperCase() : s.toLowerCase();
  }
  return s;
}

function normalizeWordList(words: string[] = []): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  for (const raw of words || []) {
    const key = normalizeMnemonicToken(raw);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(key);
  }

  return out;
}

function normalizeCompletionItems(items: MacroCompletionItem[] = []): MacroCompletionItem[] {
  const out: MacroCompletionItem[] = [];
  const seen = new Set<string>();

  for (const item of items || []) {
    const label = normalizeMnemonicToken(item?.label);
    if (!label) continue;

    const insertText = normalizeMnemonicToken(item?.insertText);
    const dedupeKey = `${label}|${insertText}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    out.push({
      label,
      detail: item?.detail ? String(item.detail) : undefined,
      insertText: insertText || undefined,
    });
  }

  return out;
}

export function macroWRuntimeHighlight(words: string[] = []): readonly Extension[] {
  const normalizedWords = normalizeWordList(words);

  if (normalizedWords.length === 0) {
    const empty = StateField.define<DecorationSet>({
      create: () => Decoration.none,
      update: (v) => v,
      provide: (f) => EditorView.decorations.from(f),
    });
    return [empty] as const;
  }

  const boundary = '[\\p{L}\\p{N}_]';
  const rx = new RegExp(`(?<!${boundary})(?:${normalizedWords.map(escapeRx).join('|')})(?!${boundary})`, 'giu');
  const deco = Decoration.mark({ class: 'cm-macrow-keyword' });

  const field = StateField.define<DecorationSet>({
    create(state: EditorState) {
      return build(state);
    },
    update(value, tr) {
      if (tr.docChanged || tr.selection) return build(tr.state);
      return value;
    },
    provide: (f) => EditorView.decorations.from(f),
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

export function macroWRuntimeCompletions(items: MacroCompletionItem[] = []): readonly Extension[] {
  const base = normalizeCompletionItems(items);

  function source(ctx: CompletionContext): CompletionResult | null {
    const word = ctx.matchBefore(/[\p{L}\p{N}_]*/u);
    if (!word) return null;

    const opts = base.map(({ label, detail, insertText }) => {
      const option: MacroCompletionOption = {
        label: matchCase(label, word.text),
        type: 'keyword',
        detail,
      };

      if (insertText) {
        option.apply = matchCase(insertText, word.text);
      }

      return option;
    });

    return { from: word.from, options: opts };
  }

  return [
    autocompletion({
      override: [source],
      activateOnTyping: true,
      closeOnBlur: true,
      selectOnOpen: true,
    }),
  ] as const;
}

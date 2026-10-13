import type { Extension } from '@codemirror/state';
import { EditorState, RangeSetBuilder, StateField } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';
import { normalizeMnemonicToken } from '../../../Assembler/CommandMnemonics';

const escapeRegex = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const normalizeWordList = (words: string[] = []): string[] => {
  const normalizedWords: string[] = [];
  const seen = new Set<string>();

  for (const raw of words || []) {
    const key = normalizeMnemonicToken(raw);
    if (!key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    normalizedWords.push(key);
  }

  return normalizedWords;
};

export const macroWRuntimeHighlight = (words: string[] = []): readonly Extension[] => {
  const normalizedWords = normalizeWordList(words);

  if (normalizedWords.length === 0) {
    const empty = StateField.define<DecorationSet>({
      create: () => Decoration.none,
      update: (value) => value,
      provide: (field) => EditorView.decorations.from(field),
    });
    return [empty] as const;
  }

  const wordBoundaryPattern = '[\\p{L}\\p{N}_]';
  const keywordPattern = new RegExp(
    `(?<!${wordBoundaryPattern})(?:${normalizedWords.map(escapeRegex).join('|')})(?!${wordBoundaryPattern})`,
    'giu'
  );
  const keywordDecoration = Decoration.mark({ class: 'cm-macrow-keyword' });

  const buildKeywordDecorations = (state: EditorState): DecorationSet => {
    const ranges = new RangeSetBuilder<Decoration>();
    let documentOffset = 0;

    for (let textIterator = state.doc.iter(); !textIterator.done; textIterator.next()) {
      const text = textIterator.value as string;
      keywordPattern.lastIndex = 0;

      let match = keywordPattern.exec(text);

      while (match !== null) {
        const from = documentOffset + match.index;
        const to = from + match[0].length;
        ranges.add(from, to, keywordDecoration);
        match = keywordPattern.exec(text);
      }

      documentOffset += text.length;
    }

    return ranges.finish();
  };

  const field = StateField.define<DecorationSet>({
    create: buildKeywordDecorations,
    update: (value, transaction) => {
      if (transaction.docChanged || transaction.selection) {
        return buildKeywordDecorations(transaction.state);
      }
      return value;
    },
    provide: (field) => EditorView.decorations.from(field),
  });

  return [field] as const;
};

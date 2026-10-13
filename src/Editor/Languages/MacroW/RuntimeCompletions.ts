import type { MacroCompletionOption, MacroCompletionItem } from './Types';
import { autocompletion, CompletionContext, CompletionResult } from '@codemirror/autocomplete';
import type { Extension } from '@codemirror/state';
import { normalizeMnemonicToken } from '../../../Assembler/CommandMnemonics';

const LETTER_PATTERN = /\p{L}/u;
const COMPLETION_WORD_PATTERN = /[\p{L}\p{N}_]*/u;

const matchFirstLetterCase = (text: string, pattern: string): string => {
  if (pattern && LETTER_PATTERN.test(pattern[0])) {
    return pattern[0] === pattern[0].toUpperCase() ? text.toUpperCase() : text.toLowerCase();
  }
  return text;
};

const normalizeCompletionItems = (items: MacroCompletionItem[] = []): MacroCompletionItem[] => {
  const normalizedItems: MacroCompletionItem[] = [];
  const seen = new Set<string>();

  for (const item of items || []) {
    const label = normalizeMnemonicToken(item?.label);
    if (!label) {
      continue;
    }

    const insertText = normalizeMnemonicToken(item?.insertText);
    const dedupeKey = `${label}|${insertText}`;
    if (seen.has(dedupeKey)) {
      continue;
    }
    seen.add(dedupeKey);

    normalizedItems.push({
      label,
      detail: item?.detail ? String(item.detail) : undefined,
      insertText: insertText || undefined,
    });
  }

  return normalizedItems;
};

export const macroWRuntimeCompletions = (items: MacroCompletionItem[] = []): readonly Extension[] => {
  const normalizedItems = normalizeCompletionItems(items);

  const completeCurrentWord = (context: CompletionContext): CompletionResult | null => {
    const word = context.matchBefore(COMPLETION_WORD_PATTERN);
    if (!word) {
      return null;
    }

    const options = normalizedItems.map(({ label, detail, insertText }) => {
      const option: MacroCompletionOption = {
        label: matchFirstLetterCase(label, word.text),
        type: 'keyword',
        detail,
      };

      if (insertText) {
        option.apply = matchFirstLetterCase(insertText, word.text);
      }

      return option;
    });

    return { from: word.from, options };
  };

  return [
    autocompletion({
      override: [completeCurrentWord],
      activateOnTyping: true,
      closeOnBlur: true,
      selectOnOpen: true,
    }),
  ] as const;
};

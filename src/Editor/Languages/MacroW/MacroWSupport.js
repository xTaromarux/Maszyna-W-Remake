import { parser } from './Generated/MacroW.js';
import { LRLanguage, LanguageSupport } from '@codemirror/language';
import { macroWHighlight } from './MacroWHighlight.js';

export const macroWLanguage = LRLanguage.define({
  parser: parser.configure({ props: [macroWHighlight] }),
  languageData: {
    name: 'macroW',
    extensions: ['.mwmac'],
    commentTokens: { line: '//' },
    wordChars: 'A-Za-z0-9_ĄąĆćĘęŁłŃńÓóŚśŹźŻż', // ← DODAJ
  },
});

export function macroW() {
  return new LanguageSupport(macroWLanguage);
}

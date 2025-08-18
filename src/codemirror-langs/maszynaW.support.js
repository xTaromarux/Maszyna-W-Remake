import { parser } from './maszynaW.js';
import { LRLanguage, LanguageSupport } from '@codemirror/language';
import { maszynaWHighlight } from './maszynaW.highlight.js';

export const maszynaWLanguage = LRLanguage.define({
  parser: parser.configure({
    props: [maszynaWHighlight],
  }),
  languageData: {
    name: 'maszynaW',
    extensions: ['.mw'],
    commentTokens: { line: '//' },
  },
});

export function maszynaW() {
  return new LanguageSupport(maszynaWLanguage);
}

import { styleTags, tags as t } from '@lezer/highlight';

export const macroWHighlight = styleTags({
  instrWord: t.keyword,
  number: t.number,
  word: t.variableName,
  labelDef: t.labelName,
  labelRef: t.labelName,
  delimiter: t.punctuation,
  LineComment: t.lineComment,
  newline: t.content,
});


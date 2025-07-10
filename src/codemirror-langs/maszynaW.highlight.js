import { styleTags, tags as t } from '@lezer/highlight';

export const maszynaWHighlight = styleTags({
  keyword: t.keyword,
  number: t.number,
  identifier: t.variableName,
  labelDef: t.labelName,
  labelRef: t.labelName,
  delimiter: t.punctuation,
  LineComment: t.lineComment,
  newline: t.content,
});

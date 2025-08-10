import { styleTags, tags as t } from '@lezer/highlight';

export const maszynaWHighlight = styleTags({
  Keyword: t.keyword,
  number: t.number,
  identifier: t.variableName,
  labelDef: t.labelName,
  IF: t.labelName,
  THEN: t.labelName,
  ELSE: t.labelName,
  number: t.number,
  labelRef: t.labelName,
  delimiter: t.punctuation,
  LineComment: t.lineComment,
  newline: t.content,
});

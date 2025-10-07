import { styleTags, tags as t } from '@lezer/highlight';
export const maszynaWHighlight = styleTags({
  Keyword: t.keyword,
  labelDef: t.labelName,
  IF: t.labelName,
  THEN: t.labelName,
  ELSE: t.labelName,
  labelRef: t.labelName,
  delimiter: t.punctuation,
  LineComment: t.lineComment,
  newline: t.content,
});
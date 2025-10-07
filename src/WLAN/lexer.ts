import type { Token, TokenType } from './model';
import { WlanError, errorAt } from './error';
const tokenSpecs: [string, RegExp][] = [
  ['WHITESPACE', /^[ \t\r]+/],
  ['NEWLINE', /^\r?\n/],
  ['COMMENT_SLASH', /^\/\/[^\n]*/],
  ['COMMENT_SEMI', /^;[^\n]*/],
  ['NUMBER', /^-?(?:0[xX][0-9A-Fa-f]+|0[bB][01]+|\d+)/],
  ['COLON', /^:/],
  ['SEMICOLON', /^;/],
  ['COMMA', /^,/],
  ['AT', /^@/],
  ['IDENT', /^[\p{L}_][\p{L}0-9_]*/u],
];
export function lex(input: string): Token[] {
  const tokens: Token[] = [];
  let pos = 0;
  let line = 1;
  let col = 1;
  while (pos < input.length) {
    const slice = input.slice(pos);
    let matched = false;
    for (const [type, regex] of tokenSpecs) {
      const m = regex.exec(slice);
      if (!m) continue;
      matched = true;
      const text = m[0];
      const tokenStartLine = line;
      const tokenStartCol = col;
      const newlines = text.match(/\r?\n/g);
      if (newlines) {
        line += newlines.length;
        const lastLf = Math.max(text.lastIndexOf('\n'), text.lastIndexOf('\r'));
        const tailLen = text.length - (lastLf + 1);
        col = 1 + Math.max(0, tailLen);
      } else {
        col += text.length;
      }
      pos += text.length;
      if (['WHITESPACE', 'COMMENT_SLASH', 'COMMENT_SEMI'].includes(type)) break;
      tokens.push({ type, text, line: tokenStartLine, col: tokenStartCol });
      break;
    }
    if (!matched) {
      if (slice[0] === '\r') {
        pos++;
        continue; // pomiń bez błędu
      }
      const unknownChar = input[pos];
      throw errorAt(
        input,
        line,
        col,
        `Nieznany znak: '${unknownChar}'`,
        'LEX_UNKNOWN_CHAR',
        `Usuń lub popraw znak. Jeżeli to komentarz, użyj '//' lub rozpocznij linię średnikiem ';'.`
      );
    }
  }
  return tokens;
}
export { lex as tokenize };
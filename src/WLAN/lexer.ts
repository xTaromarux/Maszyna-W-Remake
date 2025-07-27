const tokenSpecs: [string, RegExp][] = [
  ['WHITESPACE', /^[ \t\r]+/],
  ['NEWLINE', /^\r?\n/],
  ['COMMENT_SLASH', /^\/\/[^\n]*/],
  ['COMMENT_SEMI', /^;[^\n]*/],
  ['IF', /^IF\b/],
  ['THEN', /^THEN\b/],
  ['ELSE', /^ELSE\b/],
  ['NUMBER', /^\d+/],
  ['COLON', /^:/],
  ['SEMICOLON', /^;/],
  ['COMMA', /^,/],
  ['AT', /^@/],
  ['IDENT', /^[\p{L}_][\p{L}0-9_]*/u],
];

/**
 * Analiza leksykalna: zamienia tekst źródłowy na tokeny
 * @param {string} input
 * @returns {Array<{type: string, text: string, line: number, col: number}>}
 */
export function lex(input) {
  const tokens = [];
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
      const newlines = text.match(/\r?\n/g);

      if (newlines) {
        line += newlines.length;
        const lastLineBreak = Math.max(text.lastIndexOf('\n'), text.lastIndexOf('\r'));
        col = text.length - lastLineBreak;
      } else {
        col += text.length;
      }

      pos += text.length;

      // Pomiń whitespace i komentarze
      if (['WHITESPACE', 'COMMENT_SLASH', 'COMMENT_SEMI'].includes(type)) break;

      tokens.push({ type, text, line, col });
      break;
    }

    if (!matched) {
      if (slice[0] === '\r') {
        pos++;
        continue; // pomiń bez błędu
      }
      const unknownChar = input[pos];
      tokens.push({ type: 'UNKNOWN', text: unknownChar, line, col });
      pos++;
      col++;
    }
  }

  return tokens;
}

// Eksport alternatywny
export { lex as tokenize };

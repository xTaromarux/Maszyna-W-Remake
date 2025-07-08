// Token specification: [type, regex]
const tokenSpecs = [
  ['WHITESPACE',  /^[ \t\r]+/],
  ['NEWLINE',     /^\n+/],
  ['IF',          /^IF\b/],
  ['THEN',        /^THEN\b/],
  ['ELSE',        /^ELSE\b/],
  ['NUMBER',      /^\d+/],
  ['COLON',       /^:/],
  ['SEMICOLON',   /^;/],
  ['COMMA',       /^,/],
  ['AT',          /^@/],
  ['IDENT',       /^[A-Za-z_]\w*/]
];

/**
 * Lexical analysis: rozbija źródło na tablicę tokenów
 * @param {string} input
 * @returns {Array<{type:string, text:string, line:number, col:number}>}
 */
export function lex(input) {
  const tokens = [];
  let pos = 0, line = 1, col = 1;

  while (pos < input.length) {
    let matched = false;

    for (const [type, regex] of tokenSpecs) {
      const slice = input.slice(pos);
      const m = regex.exec(slice);
      if (m) {
        matched = true;
        const text = m[0];
        // Aktualizacja numeru linii i kolumny
        const nl = text.match(/\n/g);
        if (nl) {
          line += nl.length;
          // Ustalamy kolumnę od ostatniego znaku nowej linii
          const idx = text.lastIndexOf('\n');
          col = text.length - idx;
        } else {
          col += text.length;
        }
        pos += text.length;

        // Pomijamy whitespace
        if (type !== 'WHITESPACE') {
          tokens.push({ type, text, line, col });
        }
        break;
      }
    }

    if (!matched) {
      // Nieznany znak
      tokens.push({ type: 'UNKNOWN', text: input[pos], line, col });
      pos += 1;
      col += 1;
    }
  }

  return tokens;
}
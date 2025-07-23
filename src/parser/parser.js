// parser.js
import { lex } from './lexer.js';

/**
 * Parser budujący AST zgodny z fazą semantyczną:
 * - LabelDefinition: { type: 'LabelDefinition', name, line }
 * - Directive:       { type: 'Directive',      name,   operands: [Immediate|LabelRef], line }
 * - Instruction:     { type: 'Instruction',    name,   operands: [Register|Immediate|LabelRef], line }
 */
export class Parser {
  /**
   * @param {string} source
   */
  constructor(source) {
    this.tokens = lex(source);
    this.pos = 0;
  }

  /** @returns {object|null} */
  peek() {
    return this.tokens[this.pos] || null;
  }

  /** @returns {object} */
  consume() {
    return this.tokens[this.pos++];
  }

  /**
   * @param {string} type
   * @param {string} [text]
   * @returns {object}
   */
  expect(type, text) {
    const tok = this.peek();
    if (!tok || tok.type !== type || (text && tok.text !== text)) {
      throw new Error(
        `Oczekiwano ${type}${text ? `('${text}')` : ''}, ale było ${tok?.type}:${tok?.text}`
      );
    }
    return this.consume();
  }

  /**
   * Program → (LabelDefinition | Directive | Instruction)* 
   */
  parseProgram() {
    const body = [];
    while (this.peek()) {
      const tok = this.peek();

      // 1) LabelDefinition: IDENT ':' 
      if (tok.type === 'IDENT' && this.tokens[this.pos + 1]?.type === 'COLON') {
        body.push(this.parseLabelDefinition());
      
      // 2) Directive: IDENT starting with '.'
      } else if (tok.type === 'IDENT' && tok.text.startsWith('.')) {
        body.push(this.parseDirective());
      
      // 3) Instruction
      } else {
        body.push(this.parseInstruction());
      }

      // Pomijamy średnik i/lub nowe linie
      if (this.peek()?.type === 'SEMICOLON') this.consume();
      if (this.peek()?.type === 'NEWLINE')  this.consume();
    }
    return { type: 'Program', body };
  }

  /**
   * LabelDefinition → IDENT ':' 
   */
  parseLabelDefinition() {
    const nameTok = this.expect('IDENT');
    this.expect('COLON');
    return {
      type: 'LabelDefinition',
      name: nameTok.text,
      line: nameTok.line
    };
  }

  /**
   * Directive → IDENT args*
   *   gdzie IDENT zaczyna się od '.'
   */
  parseDirective() {
    const nameTok = this.expect('IDENT');
    const name = nameTok.text.slice(1).toUpperCase(); // usuń kropkę, ujednolić wielkość
    const operands = [];

    while (this.peek() && !['SEMICOLON','NEWLINE'].includes(this.peek().type)) {
      const tok = this.consume();
      if (tok.type === 'NUMBER') {
        operands.push({
          type: 'Immediate',
          value: Number(tok.text),
          line: tok.line
        });
      } else if (tok.type === 'IDENT') {
        // etykieta w dyrektywie
        operands.push({
          type: 'LabelRef',
          name: tok.text,
          line: tok.line
        });
      }
      if (this.peek()?.type === 'COMMA') this.consume();
    }

    return {
      type: 'Directive',
      name,
      operands,
      line: nameTok.line
    };
  }

  /**
   * Instruction → IDENT ( AT IDENT | REGISTER | NUMBER | IDENT )* 
   */
  parseInstruction() {
    const nameTok = this.expect('IDENT');
    const name = nameTok.text.toUpperCase();
    const operands = [];

    while (this.peek() && !['SEMICOLON','NEWLINE'].includes(this.peek().type)) {
      const tok = this.consume();

      if (tok.type === 'AT') {
        // np. @Label
        const lbl = this.expect('IDENT');
        operands.push({
          type: 'LabelRef',
          name: lbl.text,
          line: lbl.line
        });

      } else if (tok.type === 'REGISTER') {
        operands.push({
          type: 'Register',
          name: tok.text.toUpperCase(),
          line: tok.line
        });

      } else if (tok.type === 'NUMBER') {
        operands.push({
          type: 'Immediate',
          value: Number(tok.text),
          line: tok.line
        });

      } else if (tok.type === 'IDENT') {
        // rozważamy to jako odnośnik etykiety
        operands.push({
          type: 'LabelRef',
          name: tok.text,
          line: tok.line
        });
      }

      if (this.peek()?.type === 'COMMA') this.consume();
    }

    return {
      type: 'Instruction',
      name,
      operands,
      line: nameTok.line
    };
  }
}

/**
 * Prosty helper do parsowania: zwraca AST
 * @param {string} source
 * @returns {object}
 */
export function parse(source) {
  return new Parser(source).parseProgram();
}

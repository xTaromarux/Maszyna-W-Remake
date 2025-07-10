import { lex } from './lexer.js';

/**
 * Parser budujący proste AST dla programu
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
      throw new Error(`Oczekiwano ${type}${text ? `('${text}')` : ''}, ale było ${tok?.type}:${tok?.text}`);
    }
    return this.consume();
  }

  /**
   * Program → (Directive | Instruction)*
   */
  parseProgram() {
    const body = [];
    while (this.peek()) {
      const tok = this.peek();
      // Dyrektywy zaczynają się od kropki (np. .org)
      if (tok.type === 'IDENT' && tok.text.startsWith('.')) {
        body.push(this.parseDirective());
      } else {
        body.push(this.parseInstruction());
      }
      // Pomijamy średnik i/lub końce linii
      if (this.peek()?.type === 'SEMICOLON') this.consume();
      if (this.peek()?.type === 'NEWLINE') this.consume();
    }
    return { type: 'Program', body };
  }

  /**
   * Directive → IDENT args*
   */
  parseDirective() {
    const nameTok = this.expect('IDENT');
    const args = [];
    while (this.peek() && this.peek().type !== 'NEWLINE') {
      const t = this.consume();
      if (t.type === 'NUMBER' || t.type === 'IDENT') {
        args.push(t.text);
      }
    }
    return { type: 'Directive', name: nameTok.text, args };
  }

  /**
   * Instruction → IDENT (NUMBER|IDENT|LabelRef)*
   */
  parseInstruction() {
    const nameTok = this.expect('IDENT');
    const args = [];
    while (this.peek() && !['SEMICOLON', 'NEWLINE'].includes(this.peek().type)) {
      const t = this.consume();
      if (t.type === 'AT') {
        const lbl = this.expect('IDENT');
        args.push({ type: 'LabelRef', name: lbl.text });
      } else if (t.type === 'NUMBER' || t.type === 'IDENT') {
        args.push(t.text);
      }
      if (this.peek()?.type === 'COMMA') this.consume();
    }
    return { type: 'Instruction', name: nameTok.text, args };
  }
}

/**
 * Prosty helper do parsowania: zwraca AST
 * @param {string} source
 */
export function parse(source) {
  return new Parser(source).parseProgram();
}

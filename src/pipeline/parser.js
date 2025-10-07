import { lex } from './lexer.js';
const REGISTER_REGEX = /^(A|S|L|I|AK|PC|IR)$/i;
export class Parser {
  constructor(source) {
    this.tokens = lex(source);
    console.log('TOKENS:', this.tokens);
    this.pos = 0;
  }
  peek(offset = 0) {
    return this.tokens[this.pos + offset] || null;
  }
  consume() {
    return this.tokens[this.pos++];
  }
  expect(type, text) {
    const tok = this.peek();
    if (!tok || tok.type !== type || (text && tok.text !== text)) {
      throw new Error(`Oczekiwano ${type}${text ? ` (${text})` : ''}, ale było ${tok?.type}:${tok?.text}`);
    }
    return this.consume();
  }
  parseProgram() {
    const body = [];
    while (this.peek()) {
      while (['NEWLINE', 'SEMICOLON'].includes(this.peek()?.type)) {
        this.consume();
      }
      const tok = this.peek();
      if (!tok) break;
      if (tok.type === 'IDENT' && this.peek(1)?.type === 'COLON') {
        const result = this.parseLabelDefinition();
        if (Array.isArray(result)) body.push(...result);
        else body.push(result);
      } else if (tok.type === 'IF') {
        body.push(this.parseConditional());
      } else if (tok.type === 'IDENT' && tok.text.startsWith('.')) {
        body.push(this.parseDirective());
      } else if (tok.type === 'IDENT') {
        body.push(this.parseInstruction());
      } else {
        throw new Error(`Nieoczekiwany token w programie: ${tok.type}:${tok.text}`);
      }
      while (['NEWLINE', 'SEMICOLON'].includes(this.peek()?.type)) {
        this.consume();
      }
    }
    return { type: 'Program', body };
  }
  parseLabelDefinition() {
    const nameTok = this.consume(); // IDENT
    this.expect('COLON');
    const label = {
      type: 'LabelDefinition',
      name: nameTok.text,
      line: nameTok.line,
    };
    const next = this.peek();
    if (!next || ['NEWLINE', 'SEMICOLON'].includes(next.type)) {
      return label;
    }
    if (next.type === 'IF') {
      return [label, this.parseConditional()];
    }
    if (next.type === 'IDENT' && next.text.startsWith('.')) {
      return [label, this.parseDirective()];
    }
    if (next.type === 'IDENT') {
      return [label, this.parseInstruction()];
    }
    return label;
  }
  parseDirective() {
    const nameTok = this.consume(); // .DATA, .ORG
    const name = nameTok.text.slice(1).toUpperCase();
    const operands = [];
    while (this.peek() && !['NEWLINE', 'SEMICOLON'].includes(this.peek().type)) {
      const tok = this.consume();
      if (tok.type === 'NUMBER') {
        operands.push({ type: 'Immediate', value: Number(tok.text), line: tok.line });
      } else if (tok.type === 'IDENT') {
        operands.push({ type: 'LabelRef', name: tok.text, line: tok.line });
      }
      if (this.peek()?.type === 'COMMA') {
        this.consume();
      } else if (this.peek()?.type === 'COLON') {
        break;
      } else if (['NEWLINE', 'SEMICOLON'].includes(this.peek()?.type)) {
        break;
      } else if (this.peek()?.type !== undefined) {
        throw new Error(`Nieoczekiwany token w instrukcji: ${this.peek().type}:${this.peek().text}`);
      }
    }
    return { type: 'Directive', name, operands, line: nameTok.line };
  }
  parseConditional() {
    const ifTok = this.expect('IF');
    const test = this.parseOperand();
    this.expect('THEN');
    const thenBranch = this.parseOperand();
    let elseBranch = null;
    if (this.peek()?.type === 'ELSE') {
      this.consume();
      elseBranch = this.parseOperand();
    }
    return {
      type: 'Conditional',
      test,
      thenBranch,
      elseBranch,
      line: ifTok.line,
    };
  }
  parseInstruction() {
    const nameTok = this.consume(); // IDENT
    const name = nameTok.text.toUpperCase();
    if (name === 'RST') {
      const operand = this.parseOperand();
      return {
        type: 'Directive',
        name: name,
        operands: [operand],
        line: nameTok.line,
      };
    }
    if (name === 'RPA') {
      return {
        type: 'Directive',
        name: name,
        operands: [],
        line: nameTok.line,
      };
    }
    const operands = [];
    while (this.peek()) {
      const tok = this.peek();
      if (['NEWLINE', 'SEMICOLON'].includes(tok.type)) break;
      if (tok.type === 'COLON' && this.peek(1)?.type === 'IDENT') break;
      if (['IDENT', 'NUMBER', 'AT'].includes(tok.type)) {
        operands.push(this.parseOperand());
        if (this.peek()?.type === 'COMMA') {
          this.consume(); // Zjedz przecinek, ale kontynuuj
        } else {
          if (!['NEWLINE', 'SEMICOLON', 'COLON'].includes(this.peek()?.type)) break;
        }
      } else {
        break; // zamiast rzucać wyjątek – przerwij
      }
    }
    return { type: 'Instruction', name, operands, line: nameTok.line };
  }
  parseOperand() {
    const tok = this.peek();
    if (tok.type === 'COMMA') {
      throw new Error(`COMMA nie jest operatorem, tylko separatorem — nie powinien trafić tu`);
    }
    if (!tok) throw new Error(`Brak tokena przy parsowaniu operandu`);
    if (tok.type === 'COLON') {
      throw new Error(`Dwukropek nie może być operandem`);
    }
    if (tok.type === 'AT') {
      this.consume();
      const ident = this.expect('IDENT');
      return { type: 'LabelRef', name: ident.text, line: ident.line };
    }
    if (tok.type === 'NUMBER') {
      const t = this.consume();
      return { type: 'Immediate', value: Number(t.text), line: t.line };
    }
    if (tok.type === 'IDENT') {
      const t = this.consume();
      if (REGISTER_REGEX.test(t.text)) {
        return { type: 'Register', name: t.text.toUpperCase(), line: t.line };
      } else {
        return { type: 'LabelRef', name: t.text, line: t.line };
      }
    }
    throw new Error(`Nieoczekiwany token przy parsowaniu operandu: ${tok.type}:${tok.text}`);
  }
}
export function parse(source) {
  return new Parser(source).parseProgram();
}
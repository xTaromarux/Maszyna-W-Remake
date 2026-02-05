/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { lex } from './lexer';
import { TokenType } from './types/model';
import type { Token, ProgramAst, AstNode, Operand, DirectiveNode, InstructionNode, ConditionalNode } from './types/model';
import { WlanError, errorFromToken } from './error';

const REGISTER_REGEX = /^(A|S|L|I|AK|PC|IR)$/i;

function parseNumberLiteral(text: string): number {
  const neg = text.startsWith('-');
  const raw = neg ? text.slice(1) : text;

  let val: number;
  if (/^0[xX]/.test(raw)) {
    val = parseInt(raw.slice(2), 16);
  } else if (/^0[bB]/.test(raw)) {
    val = parseInt(raw.slice(2), 2);
  } else {
    val = parseInt(raw, 10);
  }
  return neg ? -val : val;
}

/**
 * Parser budujący AST:
 * - Program → LabelDefinition | Instruction | Directive | Conditional
 */
export class Parser {
  tokens: Token[];
  pos: number;

  constructor(private readonly source: string) {
    this.tokens = lex(source);
    // console.log('TOKENS:', this.tokens);
    this.pos = 0;
  }

  peek(offset = 0): Token | null {
    return this.tokens[this.pos + offset] || null;
  }

  consume(): Token {
    return this.tokens[this.pos++];
  }

  expect(type: TokenType, text?: string): Token {
    const tok = this.peek();
    if (!tok || tok.type !== type || (text && tok.text !== text)) {
      const found = tok ? `${tok.type}${tok.text ? `:${tok.text}` : ''}` : 'koniec pliku';
      throw new WlanError(`Oczekiwano ${type}${text ? ` (${text})` : ''}, ale było ${found}`, {
        code: 'PARSE_EXPECT',
        source: this.source,
        loc: tok ? { line: tok.line, col: tok.col, length: tok.text?.length } : undefined,
        hint: 'Sprawdź interpunkcję (np. dwukropek po etykiecie, przecinki między operandami).',
      });
    }
    return this.consume();
  }

  parseProgram(): ProgramAst {
    const body: AstNode[] = [];
    while (this.peek()) {
      while (this.peek()?.type === 'NEWLINE') this.consume();

      const tok = this.peek();
      if (!tok) break;

      if (tok.type === 'IDENT' && this.peek(1)?.type === 'COLON') {
        const result = this.parseLabelDefinition();
        Array.isArray(result) ? body.push(...result) : body.push(result);
      } else if (tok.type === 'IDENT') {
        body.push(this.parseInstruction());
      } else {
        throw errorFromToken(
          this.source,
          tok,
          `Nieoczekiwany token w programie: ${tok.type}:${tok.text}`,
          'PARSE_UNEXPECTED_TOKEN',
          'Być może brakuje nowej linii lub instrukcja/etykieta jest błędnie zapisana.'
        );
      }

      while (this.peek()?.type === 'NEWLINE') this.consume();
    }
    return { type: 'Program', body };
  }

  parseLabelDefinition(): AstNode | AstNode[] {
    const nameTok = this.consume(); // IDENT
    this.expect(TokenType.COLON, ':');

    const label: AstNode = {
      type: 'LabelDefinition',
      name: nameTok.text,
      line: nameTok.line,
    };

    const next = this.peek();
    if (!next || ['NEWLINE', 'SEMICOLON'].includes(next.type)) {
      return label;
    }

    if (next.type === 'IDENT') {
      return [label, this.parseInstruction()];
    }

    return label;
  }

  parseInstruction(): InstructionNode | DirectiveNode {
    const tok = this.consume(); // IDENT
    const name = tok.text.toUpperCase();

    if (name === 'RST') {
      const operand = this.parseOperand();
      return {
        type: 'Directive',
        name,
        operands: [operand],
        line: tok.line,
      } as DirectiveNode;
    }

    if (name === 'RPA') {
      // RPA nie przyjmuje operandów
      return {
        type: 'Directive',
        name,
        operands: [],
        line: tok.line,
      } as DirectiveNode;
    }

    const operands: Operand[] = [];

    while (this.peek()) {
      const tok = this.peek();

      if (['NEWLINE', 'SEMICOLON'].includes(tok.type)) break;
      if (tok.type === 'COLON' && this.peek(1)?.type === 'IDENT') break;

      if (['IDENT', 'NUMBER', 'AT'].includes(tok.type)) {
        operands.push(this.parseOperand());

        if (this.peek()?.type === 'COMMA') {
          this.consume(); // Zjedz przecinek, ale kontynuuj
        } else {
          // Jeśli po operandoe przyjdzie coś dziwnego, wyjdź zamiast erroru
          if (!['NEWLINE', 'SEMICOLON', 'COLON'].includes(this.peek()?.type)) break;
        }
      } else {
        break; // zamiast rzucać wyjątek - przerwij
      }
    }

    return { type: 'Instruction', name, operands, line: tok.line } as InstructionNode;
  }

  parseOperand(): Operand {
    const tok = this.peek();

    if (tok.type === TokenType.COMMA) {
      throw errorFromToken(
        this.source,
        tok,
        `Przecinek nie jest operatorem, tylko separatorem operandów`,
        'PARSE_COMMA_AS_OPERAND',
        'Usuń zbędny przecinek lub dodaj brakujący operand przed przecinkiem.'
      );
    }

    if (!tok) throw new WlanError(`Brak tokena przy parsowaniu operandu`, { code: 'PARSE_NO_TOKEN', source: this.source });

    if (tok.type === TokenType.COLON) {
      throw errorFromToken(
        this.source,
        tok,
        `Dwukropek nie może być operandem`,
        'PARSE_COLON_AS_OPERAND',
        'Dwukropek kończy etykietę. Upewnij się, że dwukropek stoi po nazwie etykiety.'
      );
    }

    if (tok.type === TokenType.AT) {
      this.consume();
      const ident = this.expect(TokenType.IDENT);
      return { type: 'LabelRef', name: ident.text, line: ident.line } as Operand;
    }

    if (tok.type === TokenType.NUMBER) {
      const t = this.consume();
      const value = parseNumberLiteral(t.text);
      if (Number.isNaN(value)) {
        throw errorFromToken(
          this.source,
          t,
          `Nie mogę zinterpretować liczby "${t.text}"`,
          'PARSE_BAD_NUMBER',
          'Obsługiwane formy: -123, 0xFF, -0b1010.'
        );
      }
      return { type: 'Immediate', value, line: t.line } as Operand;
    }

    if (tok.type === TokenType.IDENT) {
      const t = this.consume();
      if (REGISTER_REGEX.test(t.text)) {
        return { type: 'Register', name: t.text.toUpperCase() as any, line: t.line } as Operand;
      } else {
        return { type: 'LabelRef', name: t.text, line: t.line } as Operand;
      }
    }

    throw errorFromToken(
      this.source,
      tok,
      `Nieoczekiwany token przy parsowaniu operandu: ${tok.type}:${tok.text}`,
      'PARSE_BAD_OPERAND',
      'Dopuszczalne operandy to: liczba, rejestr (A,S,L,I,AK,PC,IR) lub odwołanie do etykiety (@nazwa lub nazwa).'
    );
  }
}

export function parse(source: string): ProgramAst {
  return new Parser(source).parseProgram();
}

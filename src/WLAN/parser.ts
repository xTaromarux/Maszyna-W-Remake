/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { lex } from './lexer';
import { buildInstructionRegistry } from './instructionRegistry';
import { errorFromToken, WlanError } from './error';
import { TokenType } from './types/model';
import type { Token } from './types/model';
import type {
  IRDirective,
  IRImmediateOperand,
  IRInitAssignment,
  IRInstruction,
  IRLabel,
  IRMemoryDecl,
  ProgramIR,
} from './types/assemblerIR';
import type { NormalizedRuntimeCommand, RuntimeCommand } from './types/registry';

const ADDRESS_MIN = 0;
const ADDRESS_MAX = 0xffff;
const DATA_MIN = -128;
const DATA_MAX = 255;
const JUMP_MNEMONICS = new Set(['SOB', 'SOM', 'SOZ']);

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

interface ParseOptions {
  commandList: RuntimeCommand[];
}

type UnresolvedOperand = { kind: 'Immediate'; value: number; token: Token } | { kind: 'Symbol'; name: string; token: Token };

interface RawLine {
  line: number;
  labelTok?: Token;
  mnemonicTok?: Token;
  operands: UnresolvedOperand[];
}

interface RawInstruction {
  nodeType: 'Instruction';
  line: number;
  address: number;
  name: string;
  mnemonicTok: Token;
  operands: UnresolvedOperand[];
}

interface RawMemoryDecl {
  nodeType: 'MemoryDecl';
  line: number;
  address: number;
  name: 'RST' | 'RPA';
  mnemonicTok: Token;
  operands: UnresolvedOperand[];
}

interface RawDataDirective {
  nodeType: 'DataDirective';
  line: number;
  address: number;
  name: 'DATA';
  mnemonicTok: Token;
  operands: UnresolvedOperand[];
}

interface RawOrgDirective {
  nodeType: 'OrgDirective';
  line: number;
  addressBefore: number;
  name: 'ORG';
  mnemonicTok: Token;
  value: number;
  valueToken: Token;
}

type RawNode = RawInstruction | RawMemoryDecl | RawDataDirective | RawOrgDirective;

function normalizeSymbol(name: string): string {
  return String(name).trim().replace(/^@/, '').toLowerCase();
}

function ensureAddressRange(source: string, token: Token, value: number, context: string): void {
  if (value < ADDRESS_MIN || value > ADDRESS_MAX) {
    throw errorFromToken(
      source,
      token,
      `Wartość adresowa poza zakresem dla ${context}: ${value}`,
      'PARSE_ADDRESS_RANGE',
      `Dopuszczalny zakres adresu: ${ADDRESS_MIN}..${ADDRESS_MAX}.`
    );
  }
}

function ensureDataRange(source: string, token: Token, value: number, context: string): void {
  if (value < DATA_MIN || value > DATA_MAX) {
    throw errorFromToken(
      source,
      token,
      `Wartość danych poza zakresem dla ${context}: ${value}`,
      'PARSE_DATA_RANGE',
      `Dopuszczalny zakres danych: ${DATA_MIN}..${DATA_MAX}.`
    );
  }
}

function validateArity(source: string, token: Token, cmd: NormalizedRuntimeCommand, count: number): void {
  const { argsMin, argsMax } = cmd;
  if (count >= argsMin && count <= argsMax) return;

  if (argsMin === argsMax) {
    throw errorFromToken(
      source,
      token,
      `Instrukcja ${cmd.name} wymaga dokładnie ${argsMin} argumentów, otrzymano ${count}.`,
      'PARSE_BAD_ARITY',
      `Popraw liczbę argumentów dla ${cmd.name}.`
    );
  }

  throw errorFromToken(
    source,
    token,
    `Instrukcja ${cmd.name} wymaga ${argsMin}..${argsMax} argumentów, otrzymano ${count}.`,
    'PARSE_BAD_ARITY',
    `Popraw liczbę argumentów dla ${cmd.name}.`
  );
}

export class Parser {
  private tokens: Token[];
  private pos: number;
  private readonly source: string;
  private readonly registry: Map<string, NormalizedRuntimeCommand>;

  constructor(source: string, options: ParseOptions) {
    if (!options || !Array.isArray(options.commandList)) {
      throw new WlanError('Parser wymaga commandList do budowy registry instrukcji.', {
        code: 'PARSE_NO_COMMAND_LIST',
      });
    }

    this.source = source;
    this.tokens = lex(source);
    this.pos = 0;
    this.registry = buildInstructionRegistry(options.commandList).byName;
  }

  private peek(offset = 0): Token | null {
    return this.tokens[this.pos + offset] || null;
  }

  private consume(): Token {
    return this.tokens[this.pos++];
  }

  private isAtEnd(): boolean {
    return this.pos >= this.tokens.length;
  }

  private skipNewlines(): void {
    while (this.peek()?.type === TokenType.NEWLINE) {
      this.consume();
    }
  }

  private isLineTerminator(tok: Token | null): boolean {
    return !tok || tok.type === TokenType.NEWLINE;
  }

  private expect(type: TokenType, message: string): Token {
    const tok = this.peek();
    if (!tok || tok.type !== type) {
      throw new WlanError(message, {
        code: 'PARSE_EXPECT',
        source: this.source,
        loc: tok ? { line: tok.line, col: tok.col, length: tok.text?.length } : undefined,
      });
    }
    return this.consume();
  }

  private parseOperand(): UnresolvedOperand {
    const tok = this.peek();
    if (!tok) {
      throw new WlanError('Nieoczekiwany koniec wejścia podczas parsowania argumentu.', {
        code: 'PARSE_NO_OPERAND',
      });
    }

    if (tok.type === TokenType.AT) {
      this.consume();
      const ident = this.expect(TokenType.IDENT, 'Po znaku @ oczekiwano nazwy etykiety.');
      return { kind: 'Symbol', name: ident.text, token: ident };
    }

    if (tok.type === TokenType.NUMBER) {
      const numTok = this.consume();
      const value = parseNumberLiteral(numTok.text);
      if (Number.isNaN(value)) {
        throw errorFromToken(
          this.source,
          numTok,
          `Nie mogę odczytać liczby "${numTok.text}".`,
          'PARSE_BAD_NUMBER',
          'Obsługiwane formaty: 123, -123, 0xFF, -0b1010.'
        );
      }
      return { kind: 'Immediate', value, token: numTok };
    }

    if (tok.type === TokenType.IDENT) {
      const ident = this.consume();
      return { kind: 'Symbol', name: ident.text, token: ident };
    }

    throw errorFromToken(
      this.source,
      tok,
      `Nieoczekiwany token w argumencie: ${tok.type}:${tok.text}`,
      'PARSE_BAD_OPERAND',
      'Dozwolony argument: liczba, etykieta lub @etykieta.'
    );
  }

  private parseRawLines(): RawLine[] {
    const lines: RawLine[] = [];

    while (!this.isAtEnd()) {
      this.skipNewlines();
      if (this.isAtEnd()) break;

      const first = this.peek()!;
      const raw: RawLine = {
        line: first.line,
        operands: [],
      };

      if (this.peek()?.type === TokenType.IDENT && this.peek(1)?.type === TokenType.COLON) {
        raw.labelTok = this.consume();
        this.consume(); // COLON
      }

      if (this.isLineTerminator(this.peek())) {
        lines.push(raw);
        this.skipNewlines();
        continue;
      }

      const mnemonic = this.peek();
      if (!mnemonic || mnemonic.type !== TokenType.IDENT) {
        throw errorFromToken(
          this.source,
          mnemonic || first,
          `Nieoczekiwany token na początku instrukcji: ${mnemonic?.type}:${mnemonic?.text}`,
          'PARSE_EXPECT_MNEMONIC',
          'Po etykiecie oczekiwano nazwy instrukcji lub końca linii.'
        );
      }

      raw.mnemonicTok = this.consume();

      while (!this.isLineTerminator(this.peek())) {
        const tok = this.peek()!;

        if (tok.type === TokenType.COMMA) {
          throw errorFromToken(
            this.source,
            tok,
            'Przecinek nie może wystąpić bez poprzedzającego argumentu.',
            'PARSE_UNEXPECTED_COMMA',
            'Usuń zbędny przecinek lub dodaj brakujący argument.'
          );
        }

        raw.operands.push(this.parseOperand());

        const next = this.peek();
        if (this.isLineTerminator(next)) break;

        if (next?.type === TokenType.COMMA) {
          this.consume();
          if (this.isLineTerminator(this.peek())) {
            throw errorFromToken(
              this.source,
              next,
              'Linia kończy się przecinkiem.',
              'PARSE_TRAILING_COMMA',
              'Usuń końcowy przecinek albo dopisz argument.'
            );
          }
          continue;
        }

        throw errorFromToken(
          this.source,
          next!,
          `Nieoczekiwany token po argumencie: ${next?.type}:${next?.text}`,
          'PARSE_EXPECT_SEPARATOR',
          'Argumenty rozdzielaj przecinkami.'
        );
      }

      lines.push(raw);
      this.skipNewlines();
    }

    return lines;
  }

  private resolveOperandValue(op: UnresolvedOperand, labels: Map<string, IRLabel>): number {
    if (op.kind === 'Immediate') return op.value;

    const key = normalizeSymbol(op.name);
    const found = labels.get(key);
    if (!found) {
      throw errorFromToken(
        this.source,
        op.token,
        `Niezdefiniowana etykieta "${op.name}".`,
        'SEM_UNDEFINED_SYMBOL',
        'Sprawdź literówkę lub kolejność deklaracji etykiet.'
      );
    }

    return found.address;
  }

  parseProgram(): ProgramIR {
    const rawLines = this.parseRawLines();

    const labels = new Map<string, IRLabel>();
    const labelList: IRLabel[] = [];
    const rawNodes: RawNode[] = [];

    let currentAddress = 0;

    for (const line of rawLines) {
      if (line.labelTok) {
        const key = normalizeSymbol(line.labelTok.text);
        if (labels.has(key)) {
          throw errorFromToken(
            this.source,
            line.labelTok,
            `Zduplikowana etykieta "${line.labelTok.text}".`,
            'SEM_DUPLICATE_SYMBOL',
            'Każda etykieta może zostać zdefiniowana tylko raz.'
          );
        }

        const label: IRLabel = {
          name: line.labelTok.text,
          line: line.labelTok.line,
          address: currentAddress,
        };
        labels.set(key, label);
        labelList.push(label);
      }

      if (!line.mnemonicTok) continue;

      const mnemonic = line.mnemonicTok.text.toUpperCase();
      const cmd = this.registry.get(mnemonic);
      if (!cmd) {
        throw errorFromToken(
          this.source,
          line.mnemonicTok,
          `Nieznana instrukcja lub dyrektywa: "${line.mnemonicTok.text}".`,
          'PARSE_UNKNOWN_MNEMONIC',
          'Dodaj instrukcję do commandList lub popraw nazwę.'
        );
      }

      validateArity(this.source, line.mnemonicTok, cmd, line.operands.length);

      switch (cmd.kind) {
        case 'exec': {
          rawNodes.push({
            nodeType: 'Instruction',
            line: line.line,
            name: cmd.name,
            address: currentAddress,
            mnemonicTok: line.mnemonicTok,
            operands: line.operands,
          });
          currentAddress += 1;
          break;
        }

        case 'memory': {
          if (cmd.name !== 'RST' && cmd.name !== 'RPA') {
            throw errorFromToken(
              this.source,
              line.mnemonicTok,
              `Nieobsługiwana deklaracja pamięci: ${cmd.name}`,
              'PARSE_UNSUPPORTED_MEMORY'
            );
          }

          rawNodes.push({
            nodeType: 'MemoryDecl',
            line: line.line,
            name: cmd.name,
            address: currentAddress,
            mnemonicTok: line.mnemonicTok,
            operands: line.operands,
          });
          currentAddress += 1;
          break;
        }

        case 'directive': {
          if (cmd.name === 'ORG') {
            const op = line.operands[0];
            const orgValue = op.kind === 'Immediate' ? op.value : (labels.get(normalizeSymbol(op.name))?.address ?? Number.NaN);

            if (Number.isNaN(orgValue)) {
              throw errorFromToken(
                this.source,
                op.token,
                'ORG wymaga liczby lub etykiety zdefiniowanej wcześniej.',
                'PARSE_ORG_UNRESOLVED',
                'Dla ORG użyj liczby lub etykiety dostępnej przed tą linią.'
              );
            }

            ensureAddressRange(this.source, op.token, orgValue, 'ORG');

            rawNodes.push({
              nodeType: 'OrgDirective',
              line: line.line,
              name: 'ORG',
              addressBefore: currentAddress,
              mnemonicTok: line.mnemonicTok,
              value: orgValue,
              valueToken: op.token,
            });
            currentAddress = orgValue;
            break;
          }

          if (cmd.name === 'DATA') {
            rawNodes.push({
              nodeType: 'DataDirective',
              line: line.line,
              name: 'DATA',
              address: currentAddress,
              mnemonicTok: line.mnemonicTok,
              operands: line.operands,
            });
            currentAddress += line.operands.length;
            break;
          }

          throw errorFromToken(this.source, line.mnemonicTok, `Nieobsługiwana dyrektywa: ${cmd.name}`, 'PARSE_UNSUPPORTED_DIRECTIVE');
        }

        default:
          throw errorFromToken(
            this.source,
            line.mnemonicTok,
            `Nieobsługiwany typ rozkazu: ${String((cmd as any).kind)}`,
            'PARSE_UNKNOWN_KIND'
          );
      }
    }

    const instructions: IRInstruction[] = [];
    const memoryDecls: IRMemoryDecl[] = [];
    const directives: IRDirective[] = [];
    const initAssignments: IRInitAssignment[] = [];

    for (const node of rawNodes) {
      switch (node.nodeType) {
        case 'Instruction': {
          const resolved: IRImmediateOperand[] = node.operands.map((op) => {
            const value = this.resolveOperandValue(op, labels);
            ensureAddressRange(this.source, op.token, value, `instrukcji ${node.name}`);
            return {
              type: 'Immediate',
              value,
              line: op.token.line,
              col: op.token.col,
            } as IRImmediateOperand;
          });

          if (JUMP_MNEMONICS.has(node.name) && resolved.length !== 1) {
            throw errorFromToken(
              this.source,
              node.mnemonicTok,
              `${node.name} wymaga dokładnie jednego argumentu adresowego.`,
              'PARSE_BAD_JUMP_OPERANDS',
              `Użyj składni: ${node.name} etykieta_lub_adres`
            );
          }

          instructions.push({
            type: 'Instruction',
            name: node.name,
            line: node.line,
            address: node.address,
            operands: resolved,
          });
          break;
        }

        case 'MemoryDecl': {
          if (node.name === 'RPA') {
            memoryDecls.push({
              type: 'MemoryDecl',
              name: 'RPA',
              line: node.line,
              address: node.address,
              size: 1,
              values: [0],
            });
            initAssignments.push({
              addr: node.address,
              val: 0,
              source: 'data',
              line: node.line,
            });
            break;
          }

          const op = node.operands[0];
          const value = this.resolveOperandValue(op, labels);
          ensureDataRange(this.source, op.token, value, 'RST');

          memoryDecls.push({
            type: 'MemoryDecl',
            name: 'RST',
            line: node.line,
            address: node.address,
            size: 1,
            values: [value],
          });
          initAssignments.push({
            addr: node.address,
            val: value,
            source: 'data',
            line: node.line,
          });
          break;
        }

        case 'DataDirective': {
          const values = node.operands.map((op) => {
            const value = this.resolveOperandValue(op, labels);
            ensureDataRange(this.source, op.token, value, 'DATA');
            return value;
          });

          memoryDecls.push({
            type: 'MemoryDecl',
            name: 'DATA',
            line: node.line,
            address: node.address,
            size: values.length,
            values,
          });

          values.forEach((val, idx) => {
            initAssignments.push({
              addr: node.address + idx,
              val,
              source: 'data',
              line: node.line,
            });
          });
          break;
        }

        case 'OrgDirective': {
          ensureAddressRange(this.source, node.valueToken, node.value, 'ORG');
          directives.push({
            type: 'Directive',
            name: 'ORG',
            line: node.line,
            value: node.value,
            addressBefore: node.addressBefore,
          });
          break;
        }

        default:
          break;
      }
    }

    return {
      type: 'ProgramIR',
      labels: labelList,
      instructions,
      memoryDecls,
      directives,
      initAssignments,
    };
  }
}

export function parse(source: string, options: ParseOptions): ProgramIR {
  return new Parser(source, options).parseProgram();
}

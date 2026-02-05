/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable arrow-body-style */
/* eslint-disable no-bitwise */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/member-ordering */

import type { ProgramAst, AstNode, DirectiveNode } from './types/model';
import type { CmdSpec } from './types/semanticAnalyzer';
import { WlanError } from './error';
import { commandList } from '../utils/data/commands';

export class SymbolTable {
  table: Map<string, number>;

  constructor() {
    this.table = new Map();
  }

  private norm(name: string) {
    return String(name).trim().replace(/^@/, '').toLowerCase();
  }

  define(name: string, address: number) {
    const key = this.norm(name);
    if (this.table.has(key)) {
      throw new WlanError(`Symbol zduplikowany: "${name}"`, { code: 'SEM_DUPLICATE_SYMBOL' });
    }
    this.table.set(key, address);
  }

  lookup(name: string): number {
    const key = this.norm(name);
    if (!this.table.has(key)) {
      throw new WlanError(`Niezdefiniowany symbol: "${name}"`, {
        code: 'SEM_UNDEFINED_SYMBOL',
        hint: 'Upewnij się, że etykieta została zdefiniowana przed użyciem lub popraw literówkę.',
      });
    }
    return this.table.get(key)!;
  }

  has(name: string) {
    return this.table.has(this.norm(name));
  }
}

const COMMAND_SPECS = new Map<string, CmdSpec>(commandList.map((c) => [String(c.name).toUpperCase(), c as CmdSpec]));

function getArity(name: string): { min: number; max: number } {
  const spec = COMMAND_SPECS.get(name.toUpperCase());
  if (!spec) return { min: 0, max: 0 };
  const hasRange = typeof spec.argsMin === 'number' || typeof spec.argsMax === 'number';
  if (hasRange) {
    const min = (spec.argsMin ?? spec.args ?? 0) as number;
    const max = (spec.argsMax ?? spec.args ?? min) as number;
    return { min, max };
  }
  const exact = (spec.args ?? 0) as number;
  return { min: exact, max: exact };
}

/**
 * Przechodzi przez AST i przypisuje adresy do etykiet
 */
export function collectLabels(nodes: AstNode[]): SymbolTable {
  const symtab = new SymbolTable();
  let currentAddress = 0;

  for (const node of nodes) {
    switch (node.type) {
      case 'Directive': {
        const dir = node as DirectiveNode;
        switch (dir.name) {
          case 'ORG':
            currentAddress = dir.operands[0] as any as number;
            break;
          case 'DATA':
          case 'RST':
          case 'RPA':
            currentAddress += dir.operands.length || 1;
            break;
          case 'VECTOR_BASE':
            symtab.define('VECTOR_BASE', (dir as any).operands[0].value);
            break;
        }
        break;
      }

      case 'LabelDefinition':
        symtab.define((node as any).name, currentAddress);
        break;

      case 'Instruction':
      case 'Conditional':
        currentAddress += 1;
        break;
    }
  }

  return symtab;
}

export function validateOperands(nodes: AstNode[]) {
  const validRegs = new Set(['A', 'S', 'L', 'I', 'AK', 'PC', 'IR']);
  const MAX_IMM = 0xffff;

  for (const node of nodes) {
    const ops =
      (node as any).type === 'Conditional'
        ? [(node as any).thenBranch, ...((node as any).elseBranch ? [(node as any).elseBranch] : [])]
        : (node as any).operands;

    if (!ops) continue;

    for (const op of ops) {
      if (!op) continue;

      switch (op.type) {
        case 'Register':
          if (!validRegs.has(op.name)) {
            throw new WlanError(`Niepoprawny rejestr "${op.name}" w linii ${(node as any).line}`, {
              code: 'SEM_BAD_REGISTER',
              hint: 'Dozwolone rejestry: A, S, L, I, AK, PC, IR.',
            });
          }
          break;
        case 'Immediate':
          // Czy jesteśmy w dyrektywie danych (RST/RPA/DATA)?
          const isDataDirective =
            (node as any).type === 'Directive' && ['RST', 'RPA', 'DATA'].includes(((node as any).name || '').toUpperCase());

          if (isDataDirective) {
            const CELL_BITS = 8;
            const MIN = -(1 << (CELL_BITS - 1)); // -128
            const MAX = (1 << CELL_BITS) - 1; // 255
            if (op.value < MIN || op.value > MAX) {
              throw new WlanError(`Wartość poza zakresem (RST/RPA/DATA) w linii ${(node as any).line}`, {
                code: 'SEM_IMMEDIATE_RANGE',
                hint: `Dopuszczalny zakres dla danych: ${MIN}..${MAX}.`,
              });
            }
          } else {
            if (op.value < 0 || op.value > MAX_IMM) {
              throw new WlanError(`Wartość poza zakresem w linii ${(node as any).line}`, {
                code: 'SEM_IMMEDIATE_RANGE',
                hint: `Dopuszczalny zakres: 0..${MAX_IMM}.`,
              });
            }
          }
          break;

        case 'LabelRef':
        case 'Identifier':
        case 'identifier':
          break;

        default:
          if (typeof op === 'string' || typeof op === 'number') break; // tolerancja na surowe wartości
          throw new WlanError(`Nieznany typ operandu "${op.type}" w linii ${(node as any).line}`, {
            code: 'SEM_UNKNOWN_OPERAND',
          });
      }
    }
  }
}

/**
 * Rozwiązanie referencji do etykiet w operandach (dla prawdziwych LabelRef)
 */
export function resolveLabelRefs(nodes: AstNode[], symtab: SymbolTable) {
  for (const node of nodes) {
    if ((node as any).operands) {
      (node as any).operands = (node as any).operands.map((op: any) => {
        if (op?.type === 'LabelRef') {
          return { type: 'Immediate', value: symtab.lookup(op.name), line: op.line };
        }
        return op;
      });
    }

    if (node.type === 'Conditional') {
      const c = node as any;

      // Walidacja flagi warunku
      const allowedFlags = new Set(['Z', 'N']);
      if (!allowedFlags.has(c.condition)) {
        throw new WlanError(`Nieznana flaga warunku: "${c.condition}" w linii ${c.line}`, {
          code: 'SEM_UNKNOWN_FLAG',
          hint: 'Dopuszczalne: Z (zero), N (negative).',
        });
      }

      if (c.thenBranch?.type === 'LabelRef') {
        c.thenBranch = { type: 'Immediate', value: symtab.lookup(c.thenBranch.name), line: c.thenBranch.line };
      }
      if (c.elseBranch?.type === 'LabelRef') {
        c.elseBranch = { type: 'Immediate', value: symtab.lookup(c.elseBranch.name), line: c.elseBranch.line };
      }
    }

    if (node.type === 'Directive') {
      (node as any).operands = (node as any).operands.map((op: any) => {
        return op?.type === 'LabelRef' ? { type: 'Immediate', value: symtab.lookup(op.name), line: op.line } : op;
      });
    }
  }
}

/* helpers */
function readNumber(op: any): number | null {
  if (typeof op === 'number') return op;
  if (op && typeof op.value === 'number') return op.value;
  if (op && typeof op.number === 'number') return op.number;
  if (op && typeof op.type === 'string' && /^(Immediate|number)$/i.test(op.type) && typeof op.value === 'number') {
    return op.value;
  }
  return null;
}
function readIdent(op: any): string | null {
  if (typeof op === 'string') return op;
  if (op && typeof op.name === 'string') return op.name;
  if (op && typeof op.value === 'string') return op.value;
  if (op && typeof op.text === 'string') return op.text;
  if (op && typeof op.type === 'string' && /^(Identifier|identifier|LabelRef)$/i.test(op.type)) {
    return op.name ?? op.value ?? op.text ?? null;
  }
  return null;
}
function toImmediate(v: number, line?: number) {
  return { type: 'Immediate', value: v, line };
}

function resolveAddressingOperands(nodes: AstNode[], symtab: SymbolTable) {
  for (const n of nodes) {
    if ((n as any).type !== 'Instruction') continue;

    const opName = String((n as any).name || '').toUpperCase();
    const { min, max } = getArity(opName);

    const ops = (n as any).operands || [];
    if (ops.length < min) {
      throw new WlanError(`Instrukcja ${opName} wymaga co najmniej ${min} argumentów.`, { code: 'SEM_MISSING_OPERAND' });
    }
    if (ops.length > max) {
      throw new WlanError(`Instrukcja ${opName} przyjmuje najwyżej ${max} argumentów.`, { code: 'SEM_TOO_MANY_OPERANDS' });
    }

    if (max === 0 || ops.length === 0) continue;

    const op0 = ops[0];

    const num = readNumber(op0);
    if (num !== null) {
      ops[0] = op0?.type === 'Immediate' ? op0 : toImmediate(num, op0?.line);
      (n as any).operands = ops;
      continue;
    }

    if (op0?.type === 'Register' && typeof op0.name === 'string') {
      const name = op0.name;
      if (symtab.has(name)) {
        ops[0] = toImmediate(symtab.lookup(name), op0?.line);
        (n as any).operands = ops;
        continue;
      }
      throw new WlanError(`Operand instrukcji ${opName} musi wskazywać adres (liczba/etykieta), a nie rejestr ${name}.`, {
        code: 'SEM_BAD_OPERAND_TYPE',
        hint: `Użyj np.: "${opName} a" albo "${opName} 12".`,
      });
    }

    const name = readIdent(op0);
    if (name) {
      ops[0] = toImmediate(symtab.lookup(name), op0?.line);
      (n as any).operands = ops;
      continue;
    }

    throw new WlanError(`Operand instrukcji ${opName} musi być adresem (liczbą) albo etykietą.`, {
      code: 'SEM_BAD_OPERAND_TYPE',
      hint: `Użyj: "${opName} a" albo "${opName} 12".`,
    });
  }
}

/**
 * Przetwarza dyrektywy RST/RPA → zapis początkowych wartości pamięci
 * (wymaga poprzedzającej etykiety, której adres zostanie zainicjalizowany)
 */
function extractInitialMemory(nodes: AstNode[], symtab: SymbolTable) {
  let baseLabel: string | null = null;
  let offset = 0;

  const setInit = (node: any, addr: number, val: number) => {
    node._initMemory = { addr, val };
  };

  for (const node of nodes) {
    switch (node.type) {
      case 'LabelDefinition': {
        baseLabel = (node as any).name;
        offset = 0;
        break;
      }

      case 'Directive': {
        const dir = node as any;
        const name = String(dir.name).toUpperCase();

        if (name === 'RST' || name === 'RPA') {
          if (!baseLabel) {
            throw new WlanError(`RST/RPA musi być poprzedzone etykietą`, {
              code: 'SEM_RST_NEEDS_LABEL',
              hint: 'Dodaj etykietę bezpośrednio nad dyrektywą, aby określić adres inicjalizacji.',
            });
          }
          const base = symtab.lookup(baseLabel);
          const addr = base + offset;
          const val = dir.operands?.[0]?.value ?? 0; // RPA bez argumentu => 0
          setInit(dir, addr, val);
          offset += 1; // zostawiamy baseLabel – kolejne RST/RPA pójdą pod nast. adres
          break;
        }

        if (name === 'DATA') {
          if (!baseLabel) {
            throw new WlanError(`DATA musi być poprzedzone etykietą`, {
              code: 'SEM_DATA_NEEDS_LABEL',
              hint: 'DATA a: 1, 2, 3 – wartości idą kolejno od adresu etykiety.',
            });
          }
          const base = symtab.lookup(baseLabel);
          const ops = Array.isArray(dir.operands) ? dir.operands : [];
          ops.forEach((op: any, i: number) => {
            const val = op?.value ?? 0;
            // dla spójności zapisujemy węzłowi listę inicjalizacji
            if (!dir._initMemoryList) dir._initMemoryList = [];
            dir._initMemoryList.push({ addr: base + offset + i, val });
          });
          offset += ops.length;
          break;
        }

        // inne dyrektywy przerywają „ciąg” RST/RPA
        baseLabel = null;
        offset = 0;
        break;
      }

      default:
        // instrukcja / warunek / cokolwiek innego – też przerywa „ciąg”
        baseLabel = null;
        offset = 0;
        break;
    }
  }
}

/**
 * Główna funkcja analizy semantycznej
 */
export function analyzeSemantics(ast: ProgramAst | AstNode[]) {
  const nodes: AstNode[] = Array.isArray(ast) ? (ast as AstNode[]) : (ast as ProgramAst).body;

  const symtab = collectLabels(nodes);
  validateOperands(nodes);
  resolveLabelRefs(nodes, symtab);
  resolveAddressingOperands(nodes, symtab); // <<— kluczowe dla POB/LAD bez @
  extractInitialMemory(nodes, symtab);

  // debug
  // console.log('Tabela symboli:', symtab.table, nodes);

  return nodes;
}
